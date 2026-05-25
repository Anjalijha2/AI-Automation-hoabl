# FSD — CP Portal: Leads Management
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The CP portal's "Leads" feature lets a Channel Partner capture a prospective buyer, generate a shareable encrypted registration link, and track the lead through to a confirmed Buyer registration.

**There is no dedicated `Lead` or `CPLead` model.** Lead capture is implemented on top of the existing `registration_drafts` table — every CP-captured lead is a `RegistrationDraft` row owned by the CP via `cpId` and tied to the prospective Buyer's `users` row via `userId`. The "Buyer" is auto-created in the `users` table with `roleId=2` if the supplied phone is new.
`// Source: source-code/backend/src/controllers/cp.controller.js:749-851`
`// Source: source-code/backend/src/models/registration-draft.model.js:11-23`

**Scope of CP visibility:**
- A standalone CP sees only leads where `registration_drafts.cp_id = self.id`.
- A master CP (`isLeadCp=true`) sees their own leads + leads of any CP whose `masterHvCode = self.hvCode`.
- A member CP (`isLeadCp=false`, `leadCpId` set) sees only their own leads.

`// Source: source-code/backend/src/controllers/cp.controller.js:1175-1213`

**LSQ note (LSQ excluded from source scans per project constraint):** The CP lead-capture flow itself does NOT call LeadSquared; LSQ is only invoked during CP self-registration (cp.controller.js:340) and JBP submission. The lead's downstream LSQ activity is initiated when the Buyer follows the shared registration link and triggers `/auth/user/send-otp` (which creates the LSQ prospect/opportunity for the Buyer). Source for that buyer-side LSQ activity: auth.controller.js:191-262. This FSD documents only the XR backend; LSQ internals are out of scope.

---

## 2. Data Model

### Table: `registration_drafts` (= the lead row)
`// Source: source-code/backend/src/models/registration-draft.model.js:25-103`

| Column | Type | Meaning | Source |
|---|---|---|---|
| `id` | BIGINT UNSIGNED PK | Lead id | registration-draft.model.js:27-31 |
| `slug` | STRING(50), unique, not null | Encrypted `${user.id}/${hvCode}` used as the public registration link token | registration-draft.model.js:32-37, cp.controller.js:853-854 |
| `cp_id` | BIGINT UNSIGNED NOT NULL, FK users.id (RESTRICT) | The CP who captured the lead | registration-draft.model.js:38-47 |
| `project_id` | BIGINT UNSIGNED NOT NULL, FK projects.id (RESTRICT) | Project (id=1 prod, id=2 non-prod) | registration-draft.model.js:48-57 |
| `user_id` | BIGINT UNSIGNED NOT NULL, FK users.id (RESTRICT) | The Buyer user row | registration-draft.model.js:58-67 |
| `draft` | JSON NOT NULL | All captured fields (firstName, lastName, phone, email, address, pincode, occupation, nationality, companyName, officePincode, sourceType, xrCode, carpetArea, selectedApartments, apartments, industry, budget, minimumFloor, maximumFloor, homeLoanIntent, purchasePurpose, idDraft) | registration-draft.model.js:68-72, cp.controller.js:856-879 |
| `status` | ENUM('Open','Won','Lost','Refunded') NOT NULL | Lead lifecycle | registration-draft.model.js:73-76 |
| `created_at` / `updated_at` / `deleted_at` | DATETIME | Paranoid timestamps | registration-draft.model.js:78-87 |

**Indexes:** `user_id`, `project_id`, `cp_id`.
`// Source: source-code/backend/src/models/registration-draft.model.js:88-101`

**Associations:**
- `RegistrationDraft.belongsTo(User, { foreignKey: 'cpId', as: 'cp' })`
- `RegistrationDraft.belongsTo(User, { foreignKey: 'userId', as: 'Buyer' })`
`// Source: source-code/backend/src/models/registration-draft.model.js:13-22`

### `statusNames` (string values stored in `registration_drafts.status`)
```javascript
// Source: source-code/backend/src/constants/global.js:48-53
export const statusNames = { open: 'Open', won: 'Won', lost: 'Lost', refunded: 'Refunded' };
```

### Related tables (read-only from this module)
- `users` — Buyer row created with `roleId=roleNameIdMap.user` (=2) on first capture. `// Source: cp.controller.js:839-850`
- `registrations` — created later when the Buyer pays; KPI counts (`Registered`) join via `brokerId = cp.id`. `// Source: cp.controller.js:1433-1447`
- `registration_units` — KPI counts for `unitRegisteredCount`, `allotedCount`, `refundedCount` via `Registration` → `RegistrationUnit` joins on `brokerId`. `// Source: cp.controller.js:1449-1517`
- `payment_transactions` — joined for `earliest_payment_date` in the registrations listing. `// Source: cp.controller.js:1069-1078`

---

## 3. State Machines

### 3.1 Lead status (`registration_drafts.status`)

```
                  POST /cp/cp-user-register
                            ▼
                         [Open]
                            │
            (Buyer completes & pays via shared link;
             external webhook updates draft.status)
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
              [Won]      [Lost]    [Refunded]
                                       │
                            GET /cp/send-registration-link/:slug
                                       │  (controller flips Refunded → Open)
                                       ▼
                                    [Open]
```
- Initial state on create: `'Open'`. `// Source: cp.controller.js:888`
- The only state transition explicitly performed by code in `cp.controller.js` is `Refunded → Open` inside `sendRegistrationLink`. `// Source: cp.controller.js:1593-1596`
- Transitions to `Won` / `Lost` / `Refunded` are not performed in this controller (set by other flows — `registration.controller.js` webhooks and admin actions; not in scope of this FSD). `// Source: NOT FOUND in cp.controller.js — verify webhook / payment flow separately`

### 3.2 Lead status → UI display label

The list endpoint and KPI endpoint re-label DB statuses for the UI:

| DB `status` | UI label (Leads listing) | UI tab (filter) | Source |
|---|---|---|---|
| `Open` or `Lost` | `Sent` | `Sent` | cp.controller.js:1324-1325, 1256-1257 |
| `Won` | `Registered` | `Registered` | cp.controller.js:1326-1327, 1258-1259 |
| `Refunded` | `Refunded` | `Refunded` | cp.controller.js:1260-1261 (filter only; no transform line — UI shows DB value) |

Filter `status` query param accepts `Sent` | `Registered` | `Refunded` only.
`// Source: source-code/backend/src/validations/cp.validations.js:197`

### 3.3 KPI buckets

```javascript
// Source: source-code/backend/src/controllers/cp.controller.js:1418-1517
const kpis = {
  Sent:                 RegistrationDraft.count   where status in ['Open','Lost']  AND cpId in <allowed>
  Registered:           Registration.count        where brokerId in <allowed>      AND paymentStatus = 'success'
  unitRegisteredCount:  RegistrationUnit.count    where status NOT IN ['WINNER','REFUND'] joined to brokerId in <allowed>
  allotedCount:         RegistrationUnit.count    where status = 'WINNER'                 joined to brokerId in <allowed>
  refundedCount:        RegistrationUnit.count    where status = 'REFUND'                 joined to brokerId in <allowed> (scope withRefunded)
};
```

---

## 4. Business Rules

| # | Rule | Source |
|---|------|--------|
| BR-CP-LEAD-01 | Lead capture endpoint requires a valid CP JWT (`protect` + `restrictTo('cp')`); `req.user.id` is the only authority for `cpId`. | routes/cp.routes.js:36-37, 58-63 |
| BR-CP-LEAD-02 | `phone` is the unique key for Buyer lookup; an existing Buyer (`users.roleId=2` + matching phone) is reused, otherwise a new Buyer is created in the same transaction as the draft. | cp.controller.js:786-851 |
| BR-CP-LEAD-03 | A CP cannot capture a duplicate lead for the *same* Buyer on the *same* project: if a `RegistrationDraft` already exists for `{userId, cpId, projectId}`, returns 409 "Lead for this User is already Captured.". | cp.controller.js:797-807 |
| BR-CP-LEAD-04 | If the Buyer already has a `registrations` row with `paymentStatus='success'` for the project, capture is blocked with 409 "User has already completed registration." | cp.controller.js:809-818 |
| BR-CP-LEAD-05 | New Buyer creation skips email uniqueness check (commented out); only phone uniqueness is enforced — and on `User.create` collision the error message is "Provided phone number is already registered." | cp.controller.js:823-851 |
| BR-CP-LEAD-06 | Buyer is created with `isNri: Boolean(nri)`; for NRI captures, `countryCode` is taken from body (default `+91`), for non-NRI hard-coded to `+91`. | cp.controller.js:777, 839-850 |
| BR-CP-LEAD-07 | `slug` = AES-encrypted `${user.id}/${hvCode}` (where `hvCode` is the *Buyer-side* hv from body, not the CP's hvCode). The slug is the public token in `${registrationUrl}/ref/${slug}`. | cp.controller.js:853-854, 921-926 |
| BR-CP-LEAD-08 | Draft is created with `status='Open'`, `cpId=req.user.id`, `projectId` (1 prod / 2 non-prod), `userId=Buyer.id`. | cp.controller.js:881-891 |
| BR-CP-LEAD-09 | After successful capture, WhatsApp template `cp_link_share_latest` is sent to the Buyer with `[fullName, registrationLink]`. For NRI Buyers with email, an additional email (`nri-cp-referral` template) is sent. | cp.controller.js:907-926 |
| BR-CP-LEAD-10 | List endpoint `/cp/cp-user-leads` returns only leads owned by `cpId` for standalone/member CP. For master CP (`isLeadCp=true`), the scope expands to `allowedCpIds = [self.id, ...memberCps.id]`. | cp.controller.js:1175-1213 |
| BR-CP-LEAD-11 | Master CP can scope the list further with `?leadOwner=self` (only own) or `?leadOwner=cp:<id>` (specific member). `cp:<id>` must be in `allowedCpIds`, else 403 "Access denied to requested CP leads". | cp.controller.js:1202-1212 |
| BR-CP-LEAD-12 | Search (`?search=<term>`) matches across `draft.firstName`, `draft.lastName`, `CONCAT(firstName,' ',lastName)`, and `draft.phone` via `JSON_UNQUOTE(JSON_EXTRACT(draft,'$.field'))`. | cp.controller.js:1221-1253 |
| BR-CP-LEAD-13 | `?status` filter mapping: `Sent` → `status IN ('Open','Lost')`; `Registered` → `status = 'Won'`; `Refunded` → `status = 'Refunded'`. Filter is silently ignored if unsupported value supplied (validated to one of those three by schema). | cp.controller.js:1255-1263, validations/cp.validations.js:197 |
| BR-CP-LEAD-14 | Sort: only `created_at` (default), `updated_at`, `status`, `slug` are accepted via `sortBy`; invalid values fall back to `created_at`. Order is `desc` by default. | cp.controller.js:1266-1267, validations/cp.validations.js:198-199 |
| BR-CP-LEAD-15 | Pagination: `page` default 1, `limit` default 10, max 100 (schema-enforced). | validations/cp.validations.js:194-195 |
| BR-CP-LEAD-16 | List response is shaped: `{ leads: [...], pagination: {...}, isMasterCp, memberCps: [...] }`. For master CP, each lead row includes `createdByName`, `createdByHvCode`, `createdByPhone` from the owning CP. | cp.controller.js:1320-1361 |
| BR-CP-LEAD-17 | `cpId` is stripped from each lead response object before send. | cp.controller.js:1339 |
| BR-CP-LEAD-18 | `GET /cp/send-registration-link/:slug` does NOT verify slug ownership (does not check `cpId === req.user.id` on the lead). Any logged-in CP knowing the slug can re-trigger the WhatsApp link to the Buyer. | cp.controller.js:1540-1607 |
| BR-CP-LEAD-19 | `sendRegistrationLink` reuses Buyer's stored phone/email (falling back to draft values), and uses `countryCode='+91'` for non-NRI Buyers. | cp.controller.js:1562-1576 |
| BR-CP-LEAD-20 | If the lead is in `Refunded` status, `sendRegistrationLink` mutates it back to `Open` and saves. No audit log entry is created. | cp.controller.js:1593-1596 |
| BR-CP-LEAD-21 | KPI endpoint scoping mirrors the list endpoint scoping (standalone/master/member + `leadOwner` query). | cp.controller.js:1374-1416 |
| BR-CP-LEAD-22 | `Registered` KPI uses `Registration.brokerId` (not `RegistrationDraft.cpId`), and `paymentStatus='success'`. This means a draft that converted is counted via the `registrations` table, not the `registration_drafts` table. | cp.controller.js:1433-1447 |
| BR-CP-LEAD-23 | `refundedCount` uses the `Registration` model's `withRefunded` scope and counts units where `registration_units.status='REFUND'`. | cp.controller.js:1497-1517 |
| BR-CP-LEAD-24 | The registrations listing endpoint (`/cp/cp-user-registrations`) scopes by `registrations.walk_in_source_xr_code IN (:hvCodes)`, where `hvCodes` is the CP's own hvCode (+ member hvCodes if master). Status filter accepts `booked` / `paid` / `refund`. | cp.controller.js:947-1009 |

---

## 5. Notification Dispatch

| Trigger | Channel | Template / Provider | Recipient | Source |
|---|---|---|---|---|
| `POST /cp/cp-user-register` success | WhatsApp | `cp_link_share_latest` via Botspice (variables: `[fullName, registrationLink]`) | Buyer's phone (`${countryCode}${phone}`) | cp.controller.js:921-926 |
| `POST /cp/cp-user-register` success + Buyer is NRI + email present | Email | EJS template `nri-cp-referral` (subject "Registration link for Payment", data `{ name, registrationLink }`) | Buyer's email | cp.controller.js:907-919 |
| `GET /cp/send-registration-link/:slug` | WhatsApp | `cp_link_share_latest` (resend) | Buyer's phone | cp.controller.js:1569-1576 |
| `GET /cp/send-registration-link/:slug` + Buyer is NRI + email present | Email | `nri-cp-referral` | Buyer's email | cp.controller.js:1578-1591 |

**Confirmed absent (verified — no dispatch in cp.controller.js for these events):**
- No notification to admin on lead creation.
- No notification to mapped Sales Manager (`users.smUserId`) on lead creation, send-link, or any status change.
- No notification to master CP when a member captures a lead.
- No notification to the capturing CP themselves.
- No in-app notification record (there is no `notifications` model in `src/models/`).

`// Source: source-code/backend/src/models/ (no notification model present — verified directory listing)`
`// Source: source-code/backend/src/controllers/cp.controller.js:749-1607 (full lead-capture + listing + send-link block searched for sendWhatsAppMessage / emailService / queue calls)`

---

## 6. API Endpoints

All endpoints below require `Authorization: Bearer <jwt>` for a user with `roleId=3` (CP) — gated by `protect` + `restrictTo('cp')` on `routes/cp.routes.js:36-37`.

| Method | Path | Body / Query | Response Shape | Source |
|---|---|---|---|---|
| POST | `/api/v1/cp/cp-user-register` | Body (validated by `cpUserRegistrationSchema`): `firstName*`, `lastName?`, `email?`, `phone*`, `countryCode?` (regex `^\+\d{1,3}$`), `address?`, `pincode?`, `occupation?`, `companyName?`, `officePincode?`, `sourceType?`, `industry?`, `homeLoanIntent?` (`Yes`/`No`), `budget?`, `purchasePurpose?`, `nri?`, `xrCode?`, `hvCode?`, `selectedApartments?`, `apartments?`, `carpetArea?`, `minimumFloor?`, `maximumFloor?`, `nationality?` | 201 `{ registrationNumber: <encryptedSlug> }`; 409 on duplicate draft or completed registration | routes/cp.routes.js:58-63, controllers/cp.controller.js:749, validations/registration.validations.js:164 |
| GET | `/api/v1/cp/cp-user-leads` | Query (validated by `cpUserLeadsSchema`): `page` (≥1, default 1), `limit` (1–100, default 10), `search`, `status` ∈ `Sent`/`Registered`/`Refunded`, `sortBy` ∈ `created_at`/`updated_at`/`status`/`slug`, `sortOrder` ∈ `asc`/`desc`, `leadOwner` ∈ `all`/`self`/`cp:<id>` | `{ leads:[{id, status, draft, created_at, updated_at, slug, [createdByName, createdByHvCode, createdByPhone for master]}], pagination:{...}, isMasterCp, memberCps:[...] }` | routes/cp.routes.js:66, controllers/cp.controller.js:1161, validations/cp.validations.js:193 |
| GET | `/api/v1/cp/cp-user-kpi` | Query (validated by `cpUserKpisSchema`): `leadOwner` ∈ `all`/`self`/`cp:<id>` | `{ Sent, Registered, unitRegisteredCount, allotedCount, refundedCount, isMasterCp, memberCps:[...] }` | routes/cp.routes.js:68, controllers/cp.controller.js:1374, validations/cp.validations.js:210 |
| GET | `/api/v1/cp/cp-user-registrations` | Query: `page`, `limit`, `search`, `status` (`booked`/`paid`/`refund`, comma-list ok), `leadOwner` | `{ registrations:[...], pagination:{...} }` (rich rows: registration_id, registration_number, stage, apartment_type, allocation_status, createdByName/Hv/Phone, earliest_payment_date) | routes/cp.routes.js:65, controllers/cp.controller.js:933 |
| GET | `/api/v1/cp/send-registration-link/:slug` | URL param: `slug` | 201 `{ message: "Registration link sent successfully" }`; 404 if slug or Buyer not found | routes/cp.routes.js:67, controllers/cp.controller.js:1540 |

**Not in this module (but referenced):**
- `POST /api/v1/cp/registration` — CP self-KYC, not lead-related. `// Source: routes/cp.routes.js:19`
- `GET /api/v1/cp/kyc` — CP's own KYC docs. `// Source: routes/cp.routes.js:70`
- JBP endpoints — separate module. `// Source: routes/cp.routes.js:40-56`

---

## 7. Known Bugs / Gaps

| # | Issue | Severity | Source |
|---|-------|----------|--------|
| GAP-LEAD-01 | **`send-registration-link/:slug` has no ownership check.** Any authenticated CP knowing a slug can resend the link to any Buyer's phone, potentially flipping someone else's `Refunded` lead to `Open`. | High | cp.controller.js:1540-1607 |
| GAP-LEAD-02 | **Status mutation `Refunded → Open` is silent.** No audit log, no notification, no version history. A master CP cannot tell whether a member CP flipped a refunded lead back to open. | High | cp.controller.js:1593-1596 |
| GAP-LEAD-03 | **No notification on lead creation to Sales Manager.** Despite `users.smUserId` mapping CP→SM, the SM is never alerted to new leads — leads remain invisible to SM until the Buyer self-registers. | Medium | cp.controller.js:749-931 (no SM dispatch) |
| GAP-LEAD-04 | **Duplicate-lead error message is misleading.** `409 "Lead for this User is already Captured."` is raised even when a *different* CP captured the lead previously, because the check uses `{userId, cpId, projectId}` — meaning two different CPs CAN capture the same Buyer on the same project (the rule only blocks the same CP from doing it twice). | Medium | cp.controller.js:797-807 |
| GAP-LEAD-05 | **Search uses MySQL `LIKE` without escape.** `%${search.trim()}%` does not escape `%`/`_` — a search term containing wildcards behaves as a wildcard. Low security impact, UX bug. | Low | cp.controller.js:1023, 1226-1252 |
| GAP-LEAD-06 | **`Sent` KPI status filter inconsistency.** List endpoint maps `Sent` UI label to DB `IN ('Open','Lost')` and shows them all as "Sent"; KPI mirrors this. But the Refunded → Open mutation means a lead historically refunded can later show as "Sent" again with no historical trail. | Medium | cp.controller.js:1256-1257, 1324-1325, 1593-1596 |
| GAP-LEAD-07 | **No transactional integrity on resend.** `sendRegistrationLink` updates `lead.status` after dispatching WhatsApp — if `lead.save()` fails after WhatsApp succeeded, the user receives a link but DB state is stale (no compensating action). | Low | cp.controller.js:1569-1596 |
| GAP-LEAD-08 | **Email uniqueness check commented out.** Two Buyer rows with the same email but different phones can be created; this confuses downstream lookups (LSQ `SearchBy: 'Phone'` mitigates the side effect but DB integrity is gone). | Medium | cp.controller.js:824-828 |
| GAP-LEAD-09 | **`memberCps` returned by list endpoint uses `masterHvCode` lookup; KPI endpoint uses identical logic.** If `masterHvCode` is not back-filled correctly on a member (only ever set by admin via bulk-map), member CPs may be missing from a master's view. | Medium | cp.controller.js:1182-1188, admin-cp.controller.js:333-347 |
| GAP-LEAD-10 | **`registration_drafts` has NO `notifications`/`activity_log` association.** State changes (Won/Lost/Refunded coming from external flows) cannot be timeline-rendered in the CP portal — the FSD/BRD must document this absence to test teams. | Low | registration-draft.model.js:11-23 (associations only to User) |
| GAP-LEAD-11 | **`brokerXrCode` vs `walk_in_source_xr_code` ambiguity.** Buyer's `brokerXrCode` is set via auth.controller.js for self-signup with hvCode, but the CP registrations listing joins via `r.walk_in_source_xr_code = cp.hv_code`. These two columns can drift; a Buyer who self-signs after a CP captured them may not appear in CP registrations. Test cross-coverage. | Medium | cp.controller.js:979, auth.controller.js:282, 447 |
| GAP-LEAD-12 | **`sourceType`, `xrCode`, `nationality` captured in `draft` JSON but not validated.** Schema accepts any string; `homeLoanIntent` accepts only `Yes`/`No`/empty/null. Malformed payloads pollute the JSON column without error. | Low | validations/registration.validations.js:225-261 |
| GAP-LEAD-13 | **`earliest_payment_date` for additional units may be NULL.** When `is_additional_unit=true` and the `MilestonePaymentTracking` lookup finds nothing, `earliest_payment_date` is set to `null`, but the table column for non-additional units uses the registration transaction date. Two rows for the same Buyer can show different "registration date" formats. | Low | cp.controller.js:1094-1131 |

---

## 8. QA Risk Areas

1. **Cross-CP lead resend abuse.** Test as CP-A: capture a lead → note slug → log in as unrelated CP-B → call `/cp/send-registration-link/<slug>` → confirm Buyer receives WhatsApp from CP-A's flow. Expected (per code): succeeds and may flip `Refunded → Open`. Confirm this is acceptable BR or file a bug.
2. **Duplicate-lead enforcement boundary.** Capture same Buyer phone with two different CPs on the same project — both should succeed (per BR-CP-LEAD-03 only blocking same `cpId`). Document for sales-ops.
3. **Master CP `leadOwner` privilege escalation.** Try `?leadOwner=cp:<id of an unrelated CP not in masterHvCode tree>` as master → must return 403. Test with both an ID that exists and one that doesn't.
4. **Member CP using `leadOwner` filter.** Member CP is not a master (`isMasterCp=false`), so the leadOwner branch is skipped entirely — confirm member CP cannot use `cp:<id>` to peek at peers (expect: ignored, returns only own).
5. **Search injection / wildcard leakage.** Try `?search=%` → expect all leads returned (unescaped `LIKE`).
6. **Sort field bypass attempt.** `?sortBy=password` or SQL injection attempts — validated server-side to allow-list, expect fallback to `created_at`.
7. **Buyer auto-create race.** Capture two leads for the same new phone simultaneously from two parallel HTTP calls — current code reads `User.findOne` then `User.create` without a unique constraint; race may produce duplicate users (compounded by GAP-LEAD-08 email check absence).
8. **WhatsApp delivery failure does not roll back capture.** `sendWhatsAppMessage` is fire-and-forget. Even if the Buyer never receives the link, the draft persists and is counted in `Sent` KPI. Test by stubbing WhatsApp 5xx — capture still returns 201.
9. **Refunded resend mutation visibility.** Resend on a `Refunded` lead silently sets it back to `Open`. Confirm with the QA team whether this is desired (it affects KPI counts in subsequent calls).
10. **NRI Buyer email branch.** Lead capture for NRI Buyer with email triggers an extra `nri-cp-referral` email. Test with and without email; without email, only WhatsApp goes out; with email and `effectiveCountryCode` non-`+91`, ensure no `+91` prefix bleed.
11. **Hardcoded projectId.** All lead capture / listing scoping uses `projectId = app.production ? 1 : 2`. Multi-project rollout would silently break — verify with PM whether scope expansion is on roadmap.
12. **`status` mapping inversion.** UI label `Sent` covers both `Open` and `Lost`. A lead permanently `Lost` is still surfaced under the `Sent` tab. Confirm with product / test that this is intentional vs a bug.
13. **`isJbpSubmitted` post-login flag** can be stale across master/member transitions but is computed per-login from `JbpSubmission.count` — not directly a leads-module concern, but the CP dashboard sometimes shows lead actions disabled until JBP is done; verify FE flow.
14. **LSQ disconnect.** Since lead capture does not call LSQ, an LSQ outage does NOT affect leads creation. Confirm Buyer-side `/auth/user/send-otp` path (which DOES call LSQ) is tested separately under LSQ-down scenarios.
15. **Soft-deleted CP's leads.** If a CP row is soft-deleted (`deleted_at` set), `RegistrationDraft.cpId` FK is `RESTRICT` — deletion should fail. Validate admin cannot soft-delete a CP that owns leads; if it can, master CP lists may break on missing CP join.
