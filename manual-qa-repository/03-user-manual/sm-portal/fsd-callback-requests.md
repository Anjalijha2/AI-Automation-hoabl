# FSD — Callback Requests (Sales Manager Portal)

**Status:** Source-code-verified
**Generated:** 2026-05-22
**Source root:** `source-code/backend/src/`
**Mount point:** `/api/v1/sales-manager` — `routes/index.js:75`
**Auth & role gate:** `router.use(protect)` + `router.use(restrictTo('sales_manager_admin', 'sales_manager'), commonRoutes)` + `router.use('/admin', restrictTo('sales_manager_admin'), smAdminRoutes)` — `routes/sales-manager/index.js:8-14`

Every claim cites source. SM = Sales Manager (roleId 5), SM Admin = Sales Manager Admin (roleId 4) — `constants/global.js:15-21`.

---

## 1. Module Overview

The Callback Requests module lets sales managers receive, schedule, conduct, and capture outcome/feedback for video-consultation (VC) meetings with paid buyers (`paymentStatus = 'success'`). It integrates Microsoft Teams (event creation, auto-recording), WhatsApp (Kaleyra templates), Kaleyra click-to-call, and LeadSquared (activity sync) — `services/callback-request-sm.service.js:18-25, 18-21, 25`.

Two SM roles are supported with different visibility scopes:
- **SM Admin (roleId 4)** — sees all callback requests across all SMs; can assign requests; sees `totalSM` KPI.
- **SM (roleId 5)** — sees only requests where `managerId = self.id`.

Role scoping is enforced everywhere via `where.managerId = smUser.id` when `smUser.role === 'sales_manager'` — `callback-request-sm.service.js:416-418, 628`.

---

## 2. API Reference Table

All routes prefixed `/api/v1/sales-manager`. Auth: JWT (`protect` middleware) — `routes/sales-manager/index.js:8`.

### 2.1 Common routes — both SM Admin + SM (`routes/sales-manager/common.routes.js`)

| # | Method | URL | Controller | Body/Query validation | Source |
|---|--------|-----|------------|----------------------|--------|
| 1 | GET | `/callback-requests` | `listCallbacks` | `listCallbackRequestsSchema` (query) | `common.routes.js:14-18` |
| 2 | GET | `/callback-requests/kpi` | `getCallbackRequestsKPI` | `getCallbackRequestsKPISchema` (query) | `common.routes.js:21-25` |
| 3 | GET | `/callback-requests/vc-outcomes` | `getVcOutcomes` | — | `common.routes.js:27` |
| 4 | GET | `/callback-requests/:id` | `getCallback` | — (uses `?projectId`, `?action`) | `common.routes.js:29` |
| 5 | GET | `/callback-requests/history/:registrationNumber` | `getCallbackHistoryByRegistrationNumber` | — (uses `?projectId`) | `common.routes.js:31` |
| 6 | GET | `/registrations/lookup` | `lookupRegistration` | `smLookupRegistrationSchema` (query) | `common.routes.js:34-38` |
| 7 | POST | `/callback-requests/create-and-schedule` | `createAndScheduleCallback` | `smCreateAndScheduleCallbackSchema` (body) | `common.routes.js:41-45` |
| 8 | POST | `/callback-requests/:id/schedule` | `scheduleCallback` | `smScheduleCallbackSchema` (body) | `common.routes.js:48-52` |
| 9 | PUT | `/callback-requests/:id/confirm` | `confirmCallback` | — | `common.routes.js:54` |
| 10 | PUT | `/callback-requests/:id/reschedule` | `rescheduleCallback` | `smRescheduleCallbackSchema` (body) | `common.routes.js:56-60` |
| 11 | PUT | `/callback-requests/:id/pull` | `pullCallbackToSelf` | — | `common.routes.js:62` |
| 12 | PATCH | `/callback-requests/:id/meeting-link` | `updateMeetingLink` | `updateMeetingLinkSchema` (body) | `common.routes.js:64-68` |
| 13 | POST | `/callback-requests/:id/feedback` | `submitFeedback` | `smSubmitFeedbackSchema` (body) | `common.routes.js:70-74` |
| 14 | POST | `/callback-requests/click-to-call` | `clickToCall` | `clickToCallSchema` (body) | `common.routes.js:80-84` |
| 15 | PATCH | `/callback-requests/:id/vc-outcome` | `captureVcOutcome` | — (body `{ vcOutcome }`) | `common.routes.js:86` |
| 16 | GET | `/export/:exportType` | `exportData` (shared) | — | `common.routes.js:76` |

### 2.2 SM-Admin-only routes (`routes/sales-manager/sm-admin.routes.js`)
Mounted under `/admin` prefix → final URL: `/api/v1/sales-manager/admin/...` — `routes/sales-manager/index.js:14`.

| # | Method | URL | Controller | Source |
|---|--------|-----|------------|--------|
| 17 | GET | `/admin/callback-requests/assignable-users` | `getAssignableUsers` | `sm-admin.routes.js:9` |
| 18 | PUT | `/admin/callback-requests/assign` | `assignCallback` | `sm-admin.routes.js:12` |

### 2.3 Public buyer feedback (referenced for cross-flow)
Unauthenticated — token in URL is the credential — `routes/index.js:51-60`.

| Method | URL | Controller |
|--------|-----|------------|
| GET | `/api/v1/callback-feedback/:code` | `verifyFeedbackToken` |
| POST | `/api/v1/callback-feedback/:code` | `submitFeedbackByPublicToken` |

---

## 3. Feature Details (per endpoint)

### 3.1 GET `/callback-requests/vc-outcomes` — Dropdown enum source
Returns array of `{ value, label }` derived dynamically from the model's vcOutcome ENUM. Labels resolved via `getVcOutcomeLabel()` — `controller:17-33`, `constants/global.js:183-203`.

```js
// Source: controllers/callback-request-sm.controller.js:19-24
const enumValues = CallbackRequest.getAttributes().vcOutcome.values;
const outcomes = enumValues.map(value => ({ value, label: getVcOutcomeLabel(value) }));
```

### 3.2 GET `/callback-requests` — List + Export
Query params (all optional): `status`, `vcOutcome`, `search`, `registrationNumber`, `page` (default 1), `limit` (default 20, max 100), `managerId`, `assignmentFilter` (`assigned`|`my-requests`), `startDate`, `endDate`, `sortKey`, `sortOrder`, `projectId`, `export` (`=1` triggers Excel download) — `controller:39-117`, `validations:30-90`.

**Scoping logic** — `service:626-628`:
```js
if (smUser.role === 'sales_manager') where.managerId = smUser.id;
```
SM Admin sees all. SM sees own only.

**Date filter** — `controller:58-69`:
- `startDate` → `requestedAt >= startDate`
- `endDate` → `requestedAt <= endDate`

**Status / VC outcome** — comma-separated multi-value supported — `service:629-644`.

**Search behaviour** — global keyword matches across `user.firstName`, `user.lastName`, concatenated full name, `user.email`, `user.phone`, `registration.registrationNumber` (all `LIKE %keyword%`) — `service:659-671`. Separate `registrationNumber` query param does partial match on registration number only — `service:653-656`.

**Sort keys** — `service:686-718`:
- `customerRating` — sorts by latest `BUYER` feedback `overall_satisfaction` (sub-query); NULL values pushed to end.
- `requestedAt` — by requested datetime.
- `requestId` — by `id`.
- `smFeedback` — custom CASE: `CONFIRMED & no SM feedback → 0` (top), `SM feedback submitted → 1`, otherwise → 2.
- Default — `createdAt DESC`.

**Export mode (`?export=1`)** — `controller:90-108`:
- Fetches all rows without pagination, formats via `formatCallbackRequestRow`, builds Excel via `jsonToExcelV2`.
- Forces fixed-width + wrap for columns: `Remark`, `Next Step`, `Preference Data`, `Comment by Customer`.
- Headers set: `Content-Disposition: attachment; filename="..."`, `Access-Control-Expose-Headers: Content-Disposition`, content-type xlsx.

**Email/Phone masking** — controlled by `MasterConfig` keys `sm_email_masking` and `sm_phone_masking` per `projectId`. When enabled, email becomes `****<last-2-of-localpart>@domain`; phone becomes `xxxxxx<last-4>` — `service:34-42, 144-156, 387-411, 610-624`.

### 3.3 GET `/callback-requests/kpi` — KPI dashboard
Returns 8 KPIs + (for SM Admin only) a 9th. All counts are constrained by `dateFilter` (on `requestedAt`) and `managerFilter` (for SM only, `managerId=self`) — `controller:119-321`.

| KPI | Definition | Source |
|-----|-----------|--------|
| `totalVCRequested` | count where `status='REQUESTED'` | `controller:163-170` |
| `totalVCLinkSent` | count where `status IN ('SCHEDULED','RESCHEDULED')` | `controller:172-179` |
| `totalVCConfirmed` | count where `status='CONFIRMED'` | `controller:181-188` |
| `totalSMFeedback` | count where `isSmFeedbackSubmitted=1` | `controller:190-197` |
| `totalCustomerFeedback` | count where `isBuyerFeedbackSubmitted=1` | `controller:199-206` |
| `averageCustomerRating` | `AVG(overall_satisfaction)` on `CallbackRequestFeedback` joined back to `CallbackRequest` via include — formatted `toFixed(2)`, default `'0.00'` | `controller:208-246, 282` |
| `totalVCRequestAllbySM` | `CallbackRequest.count` joined to `User` (creator) with `roleId IN (4,5)` | `controller:248-262` |
| `totalVCRequestAllbyCustomer` | `CallbackRequest.count` joined to `User` (creator) with `roleId = 2` | `controller:264-278` |
| `totalSM` *(SM Admin only)* | `User.count` where `isActive=true AND roleId=5` | `controller:300-306` |

**Role gate** — `controller:138-144`:
```js
const isSmAdmin = user.roleId === 4;
const isSm = user.roleId === 5;
if (!isSmAdmin && !isSm) return ApiResponse.error(403, 'Access denied');
```

Echo of `dateFilter` returned in response — `controller:294-297`.

### 3.4 GET `/registrations/lookup` — Buyer lookup before creating callback
Searches paid registrations (`paymentStatus='success'`) on the active project — `service:124-293`.

- Project selection: param `project` if passed (TODO not yet implemented), else `app.production ? 1 : 2` — `service:130-136`.
- Search across: `registrationNumber`, `User.first_name`, `User.last_name`, concatenated full name, `User.email`, `User.phone` — all `LIKE %keyword%` — `service:170-183`.
- Filters out registrations where the **calling SM already owns a non-CONFIRMED open request** — `NOT EXISTS` clause — `service:187-195`.
- Throws 404 with friendly message if none: *"Customer not found, please check the search keyword or check if it's already assigned to you"* — `service:211`.
- Per row returns `existingOpenRequest` block when any open or SM-feedback-pending CONFIRMED request exists. `canCreate = !existingOpenRequest` — `service:283`.
- `pullReason` is `'SM_FEEDBACK_PENDING'` if CONFIRMED + SM feedback not submitted; otherwise `'OPEN_REQUEST'` — `service:259-263, 280`.
- `previousCallbackCount` excludes the current open one if present — `service:255-257`.
- Honours email/phone masking — `service:142-156`.
- Pagination: default `page=1`, `limit=20` (cap 100 from validation) — `service:138-139`, `validations:94-95`.

### 3.5 POST `/callback-requests/create-and-schedule` — One-shot create + schedule
Body — `validations:98-107`:
- `registrationNumber` *(required, trimmed)*
- `requestedAt` *(date, must be future, required)*
- `description` *(max 500 chars, nullable)*
- `targetStatus` *(`SCHEDULED` | `CONFIRMED`)*
- `ccEmails` *(array of valid emails, nullable)*

**Flow** — `service:295-370`:
1. Role guard — must be SM or SM Admin (`SM_ROLES`) — `service:304-306`.
2. Target status whitelist — must be `SCHEDULED` or `CONFIRMED` — `service:308-310`.
3. Lookup registration by number; 404 if missing — `service:314-317`.
4. Duplicate guard — if existing callback for registration with status ≠ `CONFIRMED`, throws *"A callback request already exists for this registration. Please use the existing request."* — `service:320-325`.
5. Winner guard — if **all** `RegistrationUnit`s of this registration have `status='WINNER'`, throws *"The customer has not paid the ₹999 registration fee for this launch"* (the check is `findOne where status != WINNER` returns nothing) — `service:328-335`. **NOTE**: The error string is misleading; the underlying condition is "no non-winner units left".
6. `managerId` always set to `smUser.id` — round-robin code for SM Admin auto-assign is **commented out** (`service:338-349`). Net result: even when SM Admin creates, ownership goes to that SM Admin.
7. Creates row with `status='REQUESTED'`, then calls `scheduleCallbackRequest` to transition to the target status (which performs the Teams + WhatsApp + LSQ effects below).

### 3.6 POST `/callback-requests/:id/schedule` — REQUESTED → SCHEDULED or CONFIRMED
Body — `validations:15-21`: `requestedAt` (optional date), `targetStatus` (`SCHEDULED`|`CONFIRMED`, optional, defaults to `SCHEDULED` in service), `ccEmails` (array of emails, optional/nullable).

**Flow** — `service:853-993`:
1. Role guard — SM or SM Admin — `service:860-862`.
2. Target status whitelist — `service:864-866`.
3. `resolveCallbackRequest` — verifies SM owns it (SM only); SM Admin can see all — `service:386-555, 416-418`.
4. **Status precondition** — must currently be `REQUESTED`. Otherwise `400: Cannot schedule a request with status "<current>"...` — `service:870-874`.
5. Builds Teams meeting subject: `Growth Housing Meeting - <FullName> - <RegNo> - DD MMM YYYY HH:mm` — `service:560-563`.
6. `startDateTime = requestedAt`, `endDateTime = requestedAt + 1 hour` — `service:880-881`.
7. Fetches manager record; if missing → 400 *"Assign this request to a manager/self"*; if no manager email → 400 *"Sales manager email is required"* — `service:883-893`.
8. Attendees = `[buyer, manager, ...ccEmails]` — `service:898-902`.
9. `createTeamsEvent(...)` — creates the Microsoft Teams calendar event — `service:904-911`.
10. If Teams returns a meeting link, **fires** `updateTeamsMeeting(joinUrl, { recordAutomatically: true })` (non-blocking, logs warn on failure) — `service:914-922`.
11. Persists: `status=targetStatus`, `requestedAt`, `managerId`, `meetingLink`, `teamsMeetingId`, `meetingDetails`, `ccEmails` — `service:935-943`.
12. **WhatsApp #1 → Buyer** — template `expert_meeting_link` with `[firstName, formattedTime, meetingLink]` to `<countryCode||'+91'><phone>` (fire-and-forget) — `service:946-951`.
13. **WhatsApp #2 → Manager** — template `sm_meet_copy` with `[formattedTime, meetingLink, firstName]` to `<countryCode||'91'><phone>` — `service:954-957`.
14. **LSQ activity** — `ActivityEvent: 273`, posted to `lsqLeadService.createActivity` only if `user.prospectId` exists; failures logged, never thrown — `service:961-990`.
15. Returns reloaded callback request.

### 3.7 PUT `/callback-requests/:id/confirm` — SCHEDULED → CONFIRMED
**Flow** — `service:998-1010`:
- Role guard — SM or SM Admin.
- `resolveCallbackRequest` (ownership).
- Updates `status = 'CONFIRMED'`.
- No status precondition validation in code (silently overwrites whatever status it is).
- No Teams, no WhatsApp, no LSQ triggered here.

### 3.8 PUT `/callback-requests/:id/reschedule` — SCHEDULED/RESCHEDULED → RESCHEDULED
Body — `validations:23-28`: `requestedAt` (date, must be future, required), `ccEmails` (array of emails, optional/nullable).

**Flow** — `service:1015-1153`:
1. Role guard — SM or SM Admin.
2. `resolveCallbackRequest` (ownership) with extra attrs `teamsMeetingId`, `meetingLink`.
3. **Status precondition** — must be `SCHEDULED` **or** `RESCHEDULED`. Otherwise 400 — `service:1024-1029`.
4. Guard — `teamsMeetingId` must exist; otherwise 400 *"Cannot reschedule because Teams event is missing on this callback request."* — `service:1034-1036`.
5. Archives current `meetingDetails` into `previousMeetings` array with `archivedAt` timestamp — `service:1038-1043`.
6. Builds new subject + new start/end (1 hr).
7. `updateTeamsEvent(...)` — edits the existing event with new times, subject, attendees — `service:1058-1065`.
8. Persists `status='RESCHEDULED'`, new `requestedAt`, new `meetingLink`, new `teamsMeetingId`, new `meetingDetails`, `ccEmails`, `previousMeetings` — `service:1078-1086`.
9. **WhatsApp → Buyer** — template `expert_meeting_link` — `service:1089-1093`.
10. **WhatsApp → Manager** — template `sm_meet_copy` — `service:1095-1104`.
11. **LSQ activity** — `ActivityEvent: 273` with `mx_Custom_2 = 'Call Rescheduled by Sales Manager'` — `service:1121-1150`.

### 3.9 PUT `/callback-requests/:id/pull` — Self-assign
**Flow** — `service:1201-1226`:
1. Role guard — SM or SM Admin.
2. Loads by PK; 404 if absent.
3. **Precondition** — status must NOT be `CONFIRMED`. 400 *"Only open callback requests can be pulled"* — `service:1214-1216`.
4. Sets `managerId = smUser.id`.
5. Returns reloaded row.

### 3.10 PATCH `/callback-requests/:id/meeting-link` — Manual link override
Body — `validations:156-158`: `meetingLink` (valid URL, required).

**Flow** — `service:1231-1242`: Loads by PK; 404 if absent; updates `meetingLink`. No role check beyond route-level `restrictTo`. No Teams sync.

### 3.11 POST `/callback-requests/:id/feedback` — SM feedback submission
Body — `validations:109-154`:
- `intent` *(required, trimmed, ≤50)*
- `allocationDayConfirmation` *(required, `'Yes'`|`'No'`)*
- `typology` *(required, trimmed, ≤50)*
- `budgetBand` *(required, trimmed, ≤50)*
- `floorPref` *(required, trimmed, ≤50)*
- `parkingRequired` *(required, `'Yes'`|`'No'`)*
- `homeLoan` *(required, `'Yes'`|`'No'`)*
- `lostReason` *(optional, enum of 12 values — see below)*
- `remarks` *(required, trimmed, ≤500)*
- `nextSteps` *(required, trimmed, ≤500)*
- `registrationPreferences` *(optional array of `{ registrationUnitId, towerId, unitId }`)*
- `role` *(optional `sales_manager_admin`|`sales_manager`)*

**`lostReason` enum** — `validations:121-134`:
`Not Lost`, `Pricing`, `OCR`, `Location`, `Product`, `Carpet Area`, `Loan Eligibility`, `Possession too late`, `Ethnicity`, `Pre-Launch customer`, `Change of mind`, `Invalid Registration`.

**Flow** — `service:1248-1446`:
1. Role guard — SM or SM Admin.
2. `resolveCallbackRequest` for ownership + extra attrs (`prospectId`, `opportunityId`).
3. `submittedById` enforced to equal `smUser.id` (forbidden otherwise) — `service:1259-1262`.
4. Field normalisation via `pick()` — trims strings, returns null for empty — `service:1264-1273`.
5. Yes/No → `1/0/null` mapping for `allocationDayConfirmation`, `parkingRequired`, `homeLoan` — `service:1281-1287`.
6. **Upsert**: finds existing `CallbackRequestFeedback` for `(callRequestId, submittedById, role)`; if exists, updates and saves preferences via `submitRegistrationUnitPreferencesBySM` — `service:1293-1317`.

   ⚠️ **Bug-prone**: the upsert query uses `submittedByRole: smUser.role` (e.g. `'sales_manager'`), but new rows are written with `submittedByRole: 'SM'` (`data.submittedByRole = 'SM'`). So the upsert path can never find a previously created `'SM'` row — `service:1278, 1297-1298`.
7. If no existing row → creates new, then saves preferences if present.
8. **LSQ activity** — `ActivityEvent: 272`, with 7+ standard fields and dynamic preference fields `mx_Custom_9..mx_Custom_22` (max 14 grouped per registrationUnit) — `service:1333-1442`. Failures logged, not thrown.
9. **Side effect**: `markCallbackRequestCompletedAndNotifyBuyer(callbackRequest)` — sets `isSmFeedbackSubmitted=1` and generates buyer feedback link + WhatsApp — see §3.13 below.

#### Preferences sub-flow — `submitRegistrationUnitPreferencesBySM` — `service:1448-1680`
- Role guard — SM/SM Admin.
- Accepts JSON-string or array; rejects non-array.
- **Per-registrationUnit limit**: max 3 preferences per `registrationUnitId` in payload; else 400 — `service:1478-1487`.
- Deletes existing preferences for the `callbackRequestFeedbackId` before insert (full replace) — `service:1489-1491`.
- Normalises ids; filters rows where all three ids are null.
- Validates all `registrationUnitId`s exist and belong to this registration — `service:1519-1532`.
- **Duplicate-unit guard**: no `unitId` may appear more than once across the submission; collects all duplicates and returns a 400 with detailed conflict array — `service:1577-1600`.
- **Project-level `maxPreferencesPerUnit`**: read from `Project` model; treated as 0 if absent — `service:1605-1607`.
- **Race-safe transactional bulk insert**: SELECT FOR UPDATE on Unit rows → recount existing prefs → if `existing+1 > maxPreferencesPerUnit` returns 409 conflict with per-unit details (`currentCount`, `limit`) — `service:1611-1670`.

### 3.12 PATCH `/callback-requests/:id/vc-outcome` — Capture VC outcome
Body: `{ vcOutcome }`. No external validation schema — value checked inline against model enum — `service:830-846`.
- Role guard — SM or SM Admin.
- Validates `vcOutcome` against ENUM (10 values, see §4.1).
- Ownership via `resolveCallbackRequest`.
- Updates `vcOutcome`. Returns row.

### 3.13 Internal: `markCallbackRequestCompletedAndNotifyBuyer` — Buyer feedback link bootstrap
Invoked from §3.11 — `service:77-122`.

1. **Precondition**: only acts if `status === CONFIRMED` — else silently returns.
2. Sets `isSmFeedbackSubmitted = 1`.
3. If the `COMPLETED` enum is unavailable in DB (caught via `Data truncated for column 'status'`), falls back to `CONFIRMED` and **skips** buyer notification — `service:83-92`.
4. Generates feedback link — `generateFeedbackLink` — `service:52-66`:
   - Mints a UUIDv7 token.
   - Stores **raw** UUID on `CallbackRequest.buyerFeedbackToken`.
   - Returns URL: `${app.registrationUrl}/call-feedback/<base64url(uuid)>`.
5. **WhatsApp → Buyer** — template `expert_customer_feedback` with `[buyerName, feedbackLink]` to `<countryCode||91><phone>`. Failure logged, never thrown — `service:99-107`.

### 3.14 POST `/callback-requests/click-to-call` — Kaleyra C2C
Body — `validations:209-211`: `callback_request_id` (integer, required).

**Flow** — `service:1688-1786`:
1. Loads CB request with `user.phone`, `manager.phone`, `registration.opportunityId`.
2. 404 if not found.
3. 400 if either party lacks a phone.
4. Reads env: `KALEYRA_BASE_URL`, `KALEYRA_API_KEY`, `KALEYRA_CALLER_ID`. 500 if any missing.
5. Calls Kaleyra GET with params: `method=dial.click2call`, `format=json`, `caller_id`, `return=1`, `retry=2`, `caller=manager.phone`, `receiver=user.phone`, `custom=opportunityId`. Header `x-api-key`.
6. Returns Kaleyra response payload verbatim. 500 on Axios error.

### 3.15 GET `/callback-requests/:id` — Detail
**Flow** — `controller:369-390`, `service:826-828` → `resolveCallbackRequest`:
- Ownership: SM gated by `managerId=self.id` unless `?action=view-history` is passed (history view bypasses the ownership filter) — `service:415-418`.
- 404 *"Callback request not found or not assigned to you"* if missing — `service:550-552`.
- Includes: user, manager(creator), registration (with `withRefunded` scope) + `RegistrationUnits` (excluding REFUND), feedback rows + their preferences (with tower/unit lookup).
- Adds `maxPreferencesPerUnit` from `Project` to response — `controller:378-382`.
- Email/phone masking honoured via `?projectId` query — `service:386-411`.

### 3.16 GET `/callback-requests/history/:registrationNumber` — History (GHNG)
**Flow** — `controller:396-441`:
- Requires `?projectId` (looks up `Project.projectId` to resolve internal id).
- Returns all callback requests for the registration number (no ownership scoping — open to both roles), ordered `id DESC`, with fields `id, requestedAt, vcOutcome, status, managerId` + manager `id, firstName, lastName`.

### 3.17 SM-Admin-only

#### GET `/admin/callback-requests/assignable-users` — `controller:511-522`, `service:1158-1166`
- Query `role` (optional) — if passed maps to `roleNameIdMap[role]` (otherwise both `sales_manager` and `sales_manager_admin`).
- Returns `User.findAll` for matching `roleId`, attrs `id, role_id, firstName, lastName`.

#### PUT `/admin/callback-requests/assign` — `controller:528-542`, `service:1171-1196`
- Body: `{ managerId, callbackRequestIds }`. No validation schema.
- Validates `managerId` belongs to `User` with `roleId = sales_manager` (NOT sales_manager_admin) — assign target must be a plain SM — `service:1172`.
- **Precondition**: none of the supplied IDs may be in status `CONFIRMED`; else 400 *"Cannot assign callback requests that are already confirmed"* — `service:1179-1189`.
- Bulk-updates `managerId` for all provided `callbackRequestIds`.
- Returns `{ success: true }`.

---

## 4. Data Models

### 4.1 `CallbackRequest` — `models/callback-request.model.js`
Table `callback_requests`; `paranoid: true` (soft delete via `deleted_at`); `underscored: true`; `timestamps: true`.

| Field | DB column | Type | Null | Default | Notes |
|-------|-----------|------|------|---------|-------|
| `id` | `id` | BIGINT.UNSIGNED PK auto | no | — | line 44-49 |
| `userId` | `user_id` | BIGINT.UNSIGNED → users.id | no | — | buyer (line 50-55) |
| `registrationId` | `registration_id` | BIGINT.UNSIGNED → registrations.id | yes | — | line 56-61 |
| `managerId` | `manager_id` | BIGINT.UNSIGNED → users.id | yes | — | SM owner (line 62-67) |
| `ccEmails` | `cc_emails` | JSON | yes | — | array (line 68-72) |
| `requestedAt` | `requested_at` | DATE | no | — | line 73-77 |
| `description` | `description` | STRING(750) | yes | — | line 78-81 |
| `status` | `status` | ENUM | no | `REQUESTED` | `REQUESTED \| RESCHEDULED \| SCHEDULED \| CONFIRMED \| COMPLETED` (line 82-86) |
| `vcOutcome` | `vc_outcome` | ENUM | yes | — | 10 values (line 87-101) |
| `isSmFeedbackSubmitted` | `is_sm_feedback_submitted` | TINYINT.UNSIGNED | no | 0 | bool flag (line 102-107) |
| `isBuyerFeedbackSubmitted` | `is_buyer_feedback_submitted` | TINYINT.UNSIGNED | no | 0 | bool flag (line 108-113) |
| `meetingLink` | `meeting_link` | STRING(1000) | yes | — | Teams join URL (line 114-118) |
| `teamsMeetingId` | `teams_meeting_id` | STRING(500) | yes | — | line 119-123 |
| `meetingDetails` | `meeting_details` | JSON | yes | — | snapshot (line 124-128) |
| `previousMeetings` | `previous_meetings` | JSON | yes | null | history array (line 129-134) |
| `buyerFeedbackToken` | `buyer_feedback_token` | STRING(100) | yes | — | raw UUIDv7 (line 135-139) |
| `createdBy` | `created_by` | BIGINT.UNSIGNED → users.id | yes | — | originator (line 140-146) |
| `deletedAt` | `deleted_at` | DATE | yes | — | soft delete (line 147-151) |

**Associations** — `models/callback-request.model.js:14-39`:
- `belongsTo User` as `user` (FK `userId`)
- `belongsTo User` as `manager` (FK `managerId`)
- `belongsTo User` as `creator` (FK `createdBy`)
- `belongsTo Registration` as `registration` (FK `registrationId`)
- `hasMany CallbackRequestFeedback` as `feedback` (FK `callRequestId`)

**Status ENUM (5 values)** — `model:83`, `constants/global.js:39-45`:
`REQUESTED`, `RESCHEDULED`, `SCHEDULED`, `CONFIRMED`, `COMPLETED`.

**VC Outcome ENUM (10 values)** — `model:87-100`, label map at `constants/global.js:183-194`:

| Value | Label |
|-------|-------|
| `VC_DONE_PREFERENCE` | VC Done with Preference |
| `VC_DONE_NO_PREFERENCE` | VC Done, No Preference |
| `FUTURE_SCHEDULED` | Future Scheduled |
| `FUTURE_RESCHEDULED` | Future Rescheduled |
| `MISSED_SCHEDULED_NC` | Missed Scheduled NC |
| `NOT_INTERESTED_LOST` | Not Interested, Lost |
| `NEVER_CONNECTED` | Never Connected |
| `TL_LOST` | TL Lost |
| `VC_2_DONE` | VC 2-Done |
| `CP_TO_DRIVE_PREFERENCE` | CP to Drive Preference |

### 4.2 `CallbackRequestFeedback` — `models/callback-request-feedback.model.js`
Table `callback_request_feedbacks`; `paranoid: true`; `underscored: true`.

| Field | DB column | Type | Null | Notes |
|-------|-----------|------|------|-------|
| `id` | `id` | BIGINT.UNSIGNED PK | no | line 36-41 |
| `callRequestId` | `call_request_id` | BIGINT.UNSIGNED → callback_requests.id | no | line 42-47 |
| `submittedById` | `submitted_by_id` | BIGINT.UNSIGNED → users.id | no | line 48-53 |
| `submittedByRole` | `submitted_by_role` | ENUM(`SM`,`BUYER`) | no | line 54-58 |
| `intent` | `intent` | STRING(50) | yes | SM (line 59-62) |
| `allocationDayConfirmation` | `allocation_day_confirmation` | TINYINT.UNSIGNED | yes | 0/1 (line 63-67) |
| `typology` | `typology` | STRING(50) | yes | SM (line 68-71) |
| `budgetBand` | `budget_band` | STRING(50) | yes | SM (line 72-76) |
| `floorPref` | `floor_pref` | STRING(50) | yes | SM (line 77-81) |
| `parkingRequired` | `parking_required` | BOOLEAN | yes | SM (line 82-86) |
| `homeLoan` | `home_loan` | BOOLEAN | yes | SM (line 87-91) |
| `lostReason` | `lost_reason` | STRING(50) | yes | SM (line 92-96) |
| `viewPref` | `view_pref` | STRING(50) | yes | SM (line 97-101) |
| `remarks` | `remarks` | STRING(550) | yes | SM (line 102-105) |
| `nextSteps` | `next_steps` | STRING(550) | yes | SM (line 106-110) |
| `overallSatisfaction` | `overall_satisfaction` | TINYINT.UNSIGNED | yes | BUYER 1–5 (line 112-116) |
| `queryResolvedStatus` | `query_resolved_status` | STRING(50) | yes | BUYER (line 117-121) |
| `callPunctualityStatus` | `call_punctuality_status` | STRING(50) | yes | BUYER (line 122-126) |
| `callQualityAv` | `call_quality_av` | STRING(50) | yes | BUYER (line 127-131) |
| `nextStepsClarity` | `next_steps_clarity` | STRING(50) | yes | BUYER (line 132-136) |
| `interestLevel` | `interest_level` | STRING(50) | yes | BUYER (line 137-141) |
| `followupCallRequired` | `followup_call_required` | TINYINT.UNSIGNED | yes | default 0 (line 142-147) |
| `followupPreferredDatetime` | `followup_preferred_datetime` | DATE | yes | BUYER (line 148-152) |
| `improvementComments` | `improvement_comments` | STRING(1000) | yes | BUYER (line 153-157) |
| `createdAt`, `updatedAt`, `deletedAt` | timestamps | DATE | n/a | line 159-173 |

**Associations** — `models/callback-request-feedback.model.js:16-31`:
- `belongsTo CallbackRequest` as `callRequest` (FK `callRequestId`)
- `belongsTo User` as `submittedBy` (FK `submittedById`)
- `hasMany RegistrationPreference` as `registrationPreferences` (FK `callbackRequestFeedbackId`)

---

## 5. Role & Permission Matrix

| Capability | SM Admin (roleId 4) | SM (roleId 5) | Source |
|------------|---------------------|---------------|--------|
| List all callback requests | ✅ all rows | ❌ own only (`managerId=self`) | `service:626-628` |
| KPI dashboard | ✅ unfiltered | ✅ filtered by self | `controller:138-150` |
| KPI: `totalSM` | ✅ included | ❌ not returned | `controller:300-306` |
| View any callback by id | ✅ | ❌ only own (unless `?action=view-history`) | `service:415-418` |
| View callback history by reg-number | ✅ | ✅ (no ownership check) | `controller:396-441` |
| Lookup buyer registrations | ✅ | ✅ (filtered to non-owned by self) | `service:185-195` |
| Create + schedule callback | ✅ | ✅ | `service:295, 304` |
| Schedule existing REQUESTED → SCHEDULED/CONFIRMED | ✅ | ✅ (own only) | `service:853, 860, 868` |
| Confirm SCHEDULED → CONFIRMED | ✅ | ✅ (own only) | `service:998-1010` |
| Reschedule | ✅ | ✅ (own only) | `service:1015-1029` |
| Pull request to self | ✅ | ✅ | `service:1201-1226` |
| Update meeting link | ✅ | ✅ (route-level role gate only — no service check) | `service:1231-1242` |
| Submit / update SM feedback | ✅ | ✅ (own only) | `service:1248-1262` |
| Submit registration preferences | ✅ | ✅ (own only) | `service:1448-1458` |
| Capture VC outcome | ✅ | ✅ (own only) | `service:830-841` |
| Click-to-call (Kaleyra) | ✅ | ✅ | `service:1688` |
| **Assign callback to specific SM** | ✅ only | ❌ | `routes/sales-manager/index.js:14` + `sm-admin.routes.js:12` |
| **Get assignable users** | ✅ only | ❌ | `sm-admin.routes.js:9` |
| Export Excel | ✅ all data | ✅ own data only | `controller:90-108` + scoping in §3.2 |

---

## 6. Status Flow State Machine

States — `models/callback-request.model.js:83`: `REQUESTED`, `SCHEDULED`, `RESCHEDULED`, `CONFIRMED`, `COMPLETED`.

```
                            ┌──────────────────────────┐
                            │      (no record)         │
                            └──────────────┬───────────┘
              POST /create-and-schedule    │ POST  /user/callback-requests
              (SM, targetStatus=SCHEDULED  │ (buyer)
               or CONFIRMED)               │
                       ┌───────────────────┴───────────┐
                       ▼                                ▼
                ┌─────────────┐    schedule(target=SCHEDULED)    ┌─────────────┐
                │  REQUESTED  │───────────────────────────────►  │  SCHEDULED  │
                └─────────────┘    SM/SMA via POST /:id/schedule └─────┬───────┘
                       │                                              │
                       │ schedule(targetStatus=CONFIRMED)             │ PUT /:id/reschedule
                       │ ────────────────────────────────────►        ▼
                       │                                       ┌──────────────┐
                       │                                       │ RESCHEDULED  │
                       │                                       └──────┬───────┘
                       │                                              │
                       │                  PUT /:id/confirm            │
                       │                  (SM/SMA)                    │
                       │                  ┌───────────────────────────┘
                       ▼                  ▼
                ┌─────────────────────────────────┐
                │           CONFIRMED             │
                │  (now eligible for SM feedback) │
                └────────────────┬────────────────┘
                                 │ POST /:id/feedback (SM)  → markCallbackRequestCompletedAndNotifyBuyer
                                 │       sets isSmFeedbackSubmitted=1
                                 │       (status may try → COMPLETED but
                                 │        falls back to CONFIRMED if ENUM unavailable)
                                 ▼
                       ┌─────────────────┐
                       │ (terminal /     │
                       │  feedback open) │
                       └─────────────────┘
```

**Transitions enforced by service preconditions:**

| From | Endpoint | To | Who can trigger | Precondition source |
|------|----------|----|----|----------------------|
| `REQUESTED` | POST `/:id/schedule` | `SCHEDULED` or `CONFIRMED` (per `targetStatus`) | SM/SMA | `service:870-874` |
| `SCHEDULED` | PUT `/:id/confirm` | `CONFIRMED` | SM/SMA | no precondition check — overwrites — `service:1005` |
| `SCHEDULED` or `RESCHEDULED` | PUT `/:id/reschedule` | `RESCHEDULED` | SM/SMA | `service:1024-1029` |
| Any non-`CONFIRMED` | PUT `/:id/pull` | (no status change) `managerId=self` | SM/SMA | `service:1214-1216` |
| `CONFIRMED` | POST `/:id/feedback` (SM) | sets `isSmFeedbackSubmitted=1`; attempts → `COMPLETED`, falls back to `CONFIRMED` | SM/SMA | `service:78, 81-92` |
| `CONFIRMED` | Public POST `/callback-feedback/:code` (buyer) | sets `isBuyerFeedbackSubmitted=1` | Buyer | `controllers/callback-request.controller.js:184-209` |

**Notable gaps in state machine guards:**
- `PUT /:id/confirm` will set CONFIRMED from any source state — no guard.
- `PATCH /:id/vc-outcome` may be set at any status.
- `PATCH /:id/meeting-link` may be set at any status.

---

## 7. Notification Matrix

WhatsApp via `sendWhatsAppMessage(phone, template, [placeholders])` — `service:21, 102, 949, 955, 1091, 1101`. All WhatsApp sends are fire-and-forget; failures are logged and never block the response.

| Action | Trigger source | Recipient | Channel | Template | Placeholders | Source |
|--------|----------------|-----------|---------|----------|--------------|--------|
| Schedule callback (REQUESTED→SCHEDULED/CONFIRMED) | `scheduleCallbackRequest` | Buyer | WhatsApp | `expert_meeting_link` | `[buyer.firstName, formattedTime, meetingLink]` | `service:949` |
| Schedule callback | same | SM (manager) | WhatsApp | `sm_meet_copy` | `[formattedTime, meetingLink, buyer.firstName]` | `service:955` |
| Reschedule | `rescheduleMeetingBySM` | Buyer | WhatsApp | `expert_meeting_link` | `[buyer.firstName, formattedTime, newMeetingLink]` | `service:1091` |
| Reschedule | same | SM (manager) | WhatsApp | `sm_meet_copy` | `[formattedTime, newMeetingLink, buyer.firstName]` | `service:1101` |
| SM feedback submitted (after CONFIRMED) | `markCallbackRequestCompletedAndNotifyBuyer` | Buyer | WhatsApp | `expert_customer_feedback` | `[buyerName, feedbackLink]` | `service:102` |
| Buyer submits feedback | `submitFeedbackByPublicToken` (controller) | — | — | — | No notifications fired (only LSQ activity) | `callback-request.controller.js:144-262` |
| Confirm (SCHEDULED→CONFIRMED) | `confirmCallbackRequest` | — | — | — | **No notifications** | `service:998-1010` |
| Click-to-call | `initiateClickToCall` | Both via Kaleyra dial | Phone call (PSTN) | Kaleyra `dial.click2call` | `caller=manager.phone, receiver=user.phone` | `service:1740-1754` |
| Update VC outcome | `captureVcOutcome` | — | — | — | None | `service:830-846` |
| Pull to self | `pullCallbackRequestToSelf` | — | — | — | None | `service:1201-1226` |
| Update meeting link | `updateMeetingLink` | — | — | — | None | `service:1231-1242` |
| Assign (SM Admin) | `assignCallbackRequest` | — | — | — | None | `service:1171-1196` |

**SMS / Email**: No direct SMS or Email triggers in the SM controller/service path — all customer-facing notifications go via WhatsApp. Teams calendar invite emails are sent by Microsoft Graph as a side-effect of `createTeamsEvent` / `updateTeamsEvent` to the attendees list — `service:898-911, 1052-1065`.

---

## 8. Integration Points

### 8.1 Microsoft Teams (Calendar + Meeting)
`services/api/teams.service.js` — `service:19`.
- `createTeamsEvent({ subject, content, startDateTime, endDateTime, attendees, callbackRequestId })` — invoked on schedule.
- `updateTeamsMeeting(joinUrl, { recordAutomatically: true })` — invoked after schedule when join URL available (non-blocking).
- `updateTeamsEvent({ eventId, subject, content, startDateTime, endDateTime, attendees })` — invoked on reschedule.
- Persisted: `meetingLink` (join URL), `teamsMeetingId` (Graph event id), `meetingDetails` JSON snapshot, `previousMeetings` rolling array on reschedule.
- Subject pattern: `Growth Housing Meeting - <FullName> - <RegNo> - DD MMM YYYY HH:mm` — `service:562`.
- Window: always 60 minutes.

### 8.2 Kaleyra (WhatsApp templates)
`services/api/whatsapp.service.js` — `service:21`.
Templates used: `expert_meeting_link`, `sm_meet_copy`, `expert_customer_feedback`.
Phone format: `${countryCode || '91'}${phone}` (or `'+91'` in two places — schedule/reschedule).

### 8.3 Kaleyra (Click-to-Call)
- Env required: `KALEYRA_BASE_URL`, `KALEYRA_API_KEY`, `KALEYRA_CALLER_ID` — `service:1725-1731`.
- GET with axios; params `method=dial.click2call`, `format=json`, `caller_id`, `return=1`, `retry=2`, `caller`, `receiver`, `custom=opportunityId`.
- Header `x-api-key: <key>`.

### 8.4 LeadSquared (Activity sync)
`services/api/leadSquared.service.js` — `service:18`.
Activities posted via `lsqLeadService.createActivity(activityData)` — failures logged, never thrown.

| Trigger | ActivityEvent | Key fields | Source |
|---------|---------------|-----------|--------|
| Schedule by SM | `273` | `mx_Custom_2 = 'Call Scheduled by Sales Manager'`, `mx_Custom_1 = requestedAt`, `mx_Custom_3 = 'Buyer'|'SM'` (per creator roleId), `mx_Custom_4 = creator full name` | `service:965-979` |
| Reschedule by SM | `273` | `mx_Custom_2 = 'Call Rescheduled by Sales Manager'`, same shape | `service:1125-1138` |
| SM feedback created | `272` | 8+ standard fields incl. intent, allocationDayConfirmation, typology, budgetBand, floorPref, parkingRequired, smName, remarks/nextSteps (CustomObject_1/_2), vcOutcome label, lostReason, homeLoan; plus `mx_Custom_9..mx_Custom_22` dynamic preferences | `service:1334-1421` |
| Buyer feedback submitted (public) | `271` | overallSatisfaction, queryResolvedStatus, callPunctualityStatus, callQualityAv, nextStepsClarity, interestLevel, followupCallRequired, followupPreferredDatetime, improvementComments | `callback-request.controller.js:217-232` |

LSQ activity is **skipped silently** if `user.prospectId` is missing for schedule/reschedule — `service:981`.

### 8.5 Buyer feedback link (Public)
- Generated in `generateFeedbackLink` — `service:52-66`.
- URL: `${app.registrationUrl}/call-feedback/<base64url(uuid)>`.
- Token storage: raw UUIDv7 in `CallbackRequest.buyerFeedbackToken`.
- Public endpoints (no auth) — `routes/index.js:51-60`:
  - `GET /api/v1/callback-feedback/:code` → `verifyFeedbackToken` returns `valid` / `already_submitted` / `invalid` states.
  - `POST /api/v1/callback-feedback/:code` → `submitFeedbackByPublicToken` — uses transactional row lock; idempotent.

---

## 9. Edge Cases & Known Constraints

### 9.1 Functional edge cases (from source)
- **Lookup excludes self-owned open**: SM searching for a registration won't see registrations where they already own a non-CONFIRMED request — appears as "Customer not found" — `service:187-211`.
- **Duplicate active callback**: a registration can have only ONE non-CONFIRMED callback at a time — `service:320-325`.
- **WINNER guard wording**: error string says "₹999 not paid" but actual condition is "no non-WINNER `RegistrationUnit` left" — `service:328-335`. Likely misleading message.
- **`PUT /:id/confirm` lacks status precondition** — can be invoked from any state including `REQUESTED`, silently moving to CONFIRMED without Teams setup — `service:1005`.
- **`PATCH /:id/vc-outcome` and `/meeting-link` have no status guards** — can be set at any state.
- **SM feedback upsert mismatch**: `submittedByRole` stored as `'SM'` but the upsert lookup uses `smUser.role` (`'sales_manager'` etc.). Net: re-submitting always creates a new row instead of updating — `service:1278, 1297-1298`.
- **`COMPLETED` ENUM may be missing in DB**: code defensively catches `Data truncated for column 'status'`, falls back to CONFIRMED, and **skips the buyer WhatsApp feedback link** — `service:83-92`.
- **Round-robin auto-assign disabled**: SM Admin create flow always assigns to self (round-robin code commented) — `service:338-349`.
- **`assignCallback` accepts only `sales_manager` (roleId 5) as target** — cannot assign to another SM Admin — `service:1172`.
- **`assignCallback` blocks CONFIRMED**: any CONFIRMED id in payload aborts the entire batch — `service:1179-1189`.
- **No batch size cap on assign**.
- **Cannot pull CONFIRMED**: pull-to-self only works on open requests — `service:1214-1216`.

### 9.2 Reschedule preconditions
- `teamsMeetingId` must exist on the record — otherwise 400 — `service:1034-1036`. Records created with the deprecated buyer-side path that didn't generate a Teams event will be un-reschedulable.
- Allowed from `SCHEDULED` or `RESCHEDULED` only — not from `CONFIRMED` — `service:1024-1029`.

### 9.3 Buyer feedback constraints
- Buyer can only submit feedback if `status === CONFIRMED` and `isBuyerFeedbackSubmitted === 0` — `controllers/callback-request.controller.js:179-187`.
- Idempotent via row lock + flag check.
- Public URL token is the credential — no JWT — `controller:140-143`.
- WhatsApp link cleansing: trailing `"`, `'`, or backtick auto-stripped (WhatsApp formatting artefacts) — `controller:10-15`.

### 9.4 Preferences constraints
- Max 3 preferences per `registrationUnitId` in a single payload — `service:1483-1485`.
- Cross-registration duplicate `unitId` rejected — `service:1577-1600`.
- Project-level `maxPreferencesPerUnit` enforced under row lock — 409 if exceeded — `service:1644-1668`.
- `registrationUnitId`s must belong to the registration linked to the callback — `service:1527-1532`.

### 9.5 Validation constraints
- `description`: max 500 chars — `validations:7, 12, 101`.
- `requestedAt`: must be in the future (create + reschedule; not on SM schedule of existing) — `validations:6, 11, 25, 100`.
- `limit`: page size capped at 100 — `validations:63, 95`.
- `endDate` must be ≥ `startDate` — `validations:79, 162`.
- `ccEmails`: each must be valid email — `validations:20, 27, 106`.
- `meetingLink`: must be a valid URL — `validations:157`.
- `lostReason`: enum of 12 specific strings — `validations:121-134`.
- SM submit feedback: most string fields are `required` despite `.nullable()` (e.g. `intent`, `typology`, `budgetBand`, `remarks`, `nextSteps`) — `validations:111-140`.

### 9.6 Masking
- Email and phone masking are controlled via project-scoped `MasterConfig` keys `sm_email_masking` and `sm_phone_masking` — `service:34-42`.
- Applied in list, detail, and lookup endpoints when corresponding flag is true — `service:144-156, 387-411, 610-624`.
- Masked format: `email` → `****<last-2-of-localpart>@domain`; `phone` → `xxxxxx<last-4>`.

### 9.7 Sort sub-query gotchas
`customerRating` sort uses an inline correlated sub-query (`SELECT ... FROM callback_request_feedbacks crf WHERE call_request_id = CallbackRequest.id AND submitted_by_role='BUYER' ...`) — relies on raw SQL identifier `CallbackRequest` (PascalCase model alias) — `service:673-681`. Care needed when changing alias.

### 9.8 Performance / scaling notes
- KPI endpoint fires 8 (or 9 for SM Admin) COUNT queries in parallel without caching — `controller:152-279`.
- List endpoint with `?export=1` returns ALL matching rows (no pagination), including all preferences sub-joins — could be very large.

---

## 10. Reference — Files Read

| Purpose | File |
|---------|------|
| Routes (common, SM+SMA) | `source-code/backend/src/routes/sales-manager/common.routes.js` |
| Routes (SM Admin only) | `source-code/backend/src/routes/sales-manager/sm-admin.routes.js` |
| Routes (mount + role gate) | `source-code/backend/src/routes/sales-manager/index.js` |
| Routes (public buyer feedback + SM mount) | `source-code/backend/src/routes/index.js` |
| SM controller | `source-code/backend/src/controllers/callback-request-sm.controller.js` |
| Buyer controller (cross-ref) | `source-code/backend/src/controllers/callback-request.controller.js` |
| SM service | `source-code/backend/src/services/callback-request-sm.service.js` |
| Validations | `source-code/backend/src/validations/callback-request.validations.js` |
| CallbackRequest model | `source-code/backend/src/models/callback-request.model.js` |
| CallbackRequestFeedback model | `source-code/backend/src/models/callback-request-feedback.model.js` |
| Constants (roles, statuses, VC outcome labels) | `source-code/backend/src/constants/global.js` |

End of FSD.
