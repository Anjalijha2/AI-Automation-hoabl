# FSD — CP Portal: JBP Submission
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

JBP (Joint Business Plan) Submission lets a Channel Partner (CP) commit, for a defined business cycle, their planned manpower, investment, marketing activities, digital channel spend, fulfilment requests (inserts, standees, kiosk, telecallers, blasts, growth hub) and commercial targets (brokerage, registration commitment, net booking commitment). The submission is captured in XR Portal's DB **and** mirrored into LeadSquared as a CRM Activity + Lead update.

Implementation footprint:
- **No dedicated `jbp.service.js`** — all logic lives inline in `cp.controller.js` (CP side) and `admin.controller.js` (admin side). // Source: directory listing of source-code/backend/src/services/ — no jbp.service.js
- CP-facing handlers: `submitJbp`, `getLatestJbpCycle`, `getJbpHistory`, `requestJbpEdit`, `getJbpEditRequests`. // Source: cp.controller.js:505, 1717, 1907, 2023, 2137
- Admin-facing handlers: `getAllJbpCycles`, `createJbpCycle`, `getJbpSubmissions`, `closeJbpCycle`, `getJbpEditRequests`, `approveJbpEditRequest`, `rejectJbpEditRequest`. // Source: admin.controller.js:2690, 2764, 2899, 3040, 3095, 3262, 3324
- Routes file: `cp.routes.js` — mounts JBP routes under `/api/v1/cp/jbp*`. // Source: cp.routes.js:40-56
- All CP routes are guarded by `protect` + `restrictTo('cp')`. // Source: cp.routes.js:36-37
- Submission triggers a WhatsApp template `jbplaunchtwo_new`. // Source: cp.controller.js:714

The CP login response also surfaces `isJbpSubmitted` so the UI can decide whether to prompt the user post-login. // Source: cp.controller.js:452, 479

---

## 2. Data Model

### 2.1 JbpSubmission (`jbp_submissions`)
// Source: source-code/backend/src/models/jbp-submission.model.js

| Field | Type | Null | Default | Notes |
|-------|------|------|---------|-------|
| id | BIGINT UNSIGNED, PK, autoIncrement | No | — | Line 33-37 |
| userId | BIGINT UNSIGNED | No | — | Line 38-41 (CP submitter) |
| projectId | BIGINT UNSIGNED, FK → projects.id | Yes | — | Line 42-51 |
| jbpCycleId | BIGINT UNSIGNED, FK → jbp_cycles.id | Yes | — | Line 52-61 |
| version | TINYINT UNSIGNED | No | 1 | Line 62-66 (incremented when an approved edit causes a re-submit) |
| status | ENUM('ACTIVE','EXPIRED') | No | 'ACTIVE' | Line 67-71 |
| manpowerCount | SMALLINT UNSIGNED | No | — | Line 72-75 |
| investmentRange | STRING(255) | No | — | Line 76-79 (one of investmentOptions) |
| insertsRequired | SMALLINT UNSIGNED | Yes | — | Line 80-83 |
| standeesRequired | SMALLINT UNSIGNED | Yes | — | Line 84-87 |
| kioskRequired | SMALLINT UNSIGNED | Yes | — | Line 88-91 |
| telecallersRequired | SMALLINT UNSIGNED | Yes | — | Line 92-95 |
| smsBlast | MEDIUMINT UNSIGNED | Yes | — | Line 96-99 |
| whatsappBlast | MEDIUMINT UNSIGNED | Yes | — | Line 100-103 |
| growthHub | BOOLEAN | Yes | false | Line 104-108 |
| registrationCommitment | STRING(255) | No | — | Line 109-112 |
| brokerageAmount | STRING(255), column `brokerage_amount` | Yes | — | Line 113-117 |
| netBookingCommitment | STRING(255) | No | — | Line 118-121 |
| activities | JSON | No | — | Line 122-125 (array of activity strings) |
| digitalChannels | JSON | No | — | Line 126-129 (`{ digitalPlatforms, platformBudgets }`) |
| createdAt | DATE | No | NOW | Line 130-134 |

- `updatedAt: false` — table has no updated_at column. // Source: jbp-submission.model.js:142
- Associations: `belongsTo` User (alias `user`), Project (`Project`), JbpCycle (`cycle`). // Source: jbp-submission.model.js:15-17

### 2.2 JbpCycle (`jbp_cycles`) — read by CP
// Source: source-code/backend/src/models/jbp-cycles.model.js

| Field | Type | Null | Default | Notes |
|-------|------|------|---------|-------|
| id | BIGINT UNSIGNED PK | No | — | Line 33-37 |
| name | STRING(255) | No | — | Line 41-44 |
| projectId | BIGINT UNSIGNED FK → projects.id | No | — | Line 46-53 |
| startDate | DATEONLY | No | — | Line 55-58 |
| endDate | DATEONLY | No | — | Line 60-63 |
| status | ENUM('OPEN','CLOSED') | No | 'OPEN' | Line 65-69 |
| createdBy / updatedBy | BIGINT UNSIGNED FK → users.id | createdBy No / updatedBy Yes | — | Line 71-86 |
| deletedAt | DATE | Yes | — | Line 89-92, paranoid |

### 2.3 JbpEditRequest (`jbp_edit_requests`)
// Source: source-code/backend/src/models/jbp-edit-request.model.js

| Field | Type | Null | Default |
|-------|------|------|---------|
| id | BIGINT UNSIGNED PK | No | — | Line 73-77 |
| jbpSubmissionId | BIGINT UNSIGNED FK → jbp_submissions.id | No | — | Line 79-86 |
| reason | STRING(255) | No | — | Line 88-91 |
| explanation | STRING(550) | Yes | — | Line 93-96 |
| status | ENUM('PENDING','APPROVED','REJECTED','EXPIRED','CONSUMED') | No | 'PENDING' | Line 98-102 |
| editableUntil | DATE | No | — | Line 104-107 |
| adminComment | STRING(550) | Yes | — | Line 109-112 |
| requestedBy | BIGINT UNSIGNED FK → users.id | No | — | Line 114-121 |
| reviewedBy | BIGINT UNSIGNED FK → users.id | Yes | — | Line 123-130 |
| reviewedAt | DATE | Yes | — | Line 132-135 |
| deletedAt | DATE | Yes | — | Line 137-140, paranoid |

Instance helpers: `isPending`, `isApproved`, `isRejected`, `isExpired`, `isConsumed`, `isEditable()` (= isApproved && now ≤ editableUntil). // Source: jbp-edit-request.model.js:21-43
Static helpers: `findPendingForSubmission`, `findApprovedForSubmission`. // Source: jbp-edit-request.model.js:45-61

---

## 3. State Machines

### 3.1 JbpSubmission.status
- `ACTIVE` (default on create). // Source: jbp-submission.model.js:67-71; cp.controller.js:703
- `EXPIRED` — set on the prior submission row when a CP resubmits via an approved edit. // Source: cp.controller.js:679

### 3.2 JbpEditRequest.status
States: `PENDING` (default) → `APPROVED` | `REJECTED` (admin action); from `APPROVED` → `CONSUMED` (when the CP saves a new submission consuming the edit window) or `EXPIRED` (UI-side computed when `editableUntil < now` or cycle is `CLOSED`). // Source: jbp-edit-request.model.js:98-102; cp.controller.js:680 (CONSUMED); cp.controller.js:2199-2206 (EXPIRED — display-only, no DB write)

### 3.3 JbpCycle.status
`OPEN` (default) | `CLOSED`. CP submission is rejected unless status === 'OPEN' AND endDate ≥ today. // Source: cp.controller.js:545, 553-555

### 3.4 CP-facing cycle "phase" (derived, returned by `/jbp-cycles`)
Computed in `getLatestJbpCycle`:
- `UPCOMING` — status OPEN AND startDate > today. // Source: cp.controller.js:1757-1759
- `ACTIVE` — status OPEN AND startDate ≤ today ≤ endDate. // Source: cp.controller.js:1760-1762
- `EXPIRED` — default fallback (status CLOSED or endDate < today). // Source: cp.controller.js:1755, 1763

`canSubmit = (cyclePhase === 'ACTIVE') && !existingSubmission`. // Source: cp.controller.js:1891

---

## 4. Business Rules

### 4.1 Authorization
- All CP JBP endpoints require `protect` + `restrictTo('cp')`. // Source: cp.routes.js:36-37
- Request body is augmented with `userType = 'cp'`. // Source: cp.routes.js:46 (addUserTypeMiddleware)

### 4.2 Submit guards (`POST /api/v1/cp/jbp`)
Order of checks in `submitJbp`:
1. `project` must exist by `slug` (or fallback `id: 2`); else 400 "Project not found". // Source: cp.controller.js:529-535
2. `jbpCycleId` is required; else 400 "JBP cycle ID is required". // Source: cp.controller.js:537-539
3. `req.user.prospectId` must be present; else 400 "Something went wrong. Please try again." — this is the XR-side guard that blocks submission when the CP has no LeadSquared prospect linked. (LSQ excluded — only the XR guard is documented.) // Source: cp.controller.js:541-543
4. Cycle must exist with `status: 'OPEN'` AND `endDate ≥ today`; else 400 "JBP cycle is not open to accept submission". // Source: cp.controller.js:545-555
5. If an `ACTIVE` submission already exists for `(userId, jbpCycleId)`, an `APPROVED` `JbpEditRequest` is required:
   - If `editableUntil` already passed → 403 "Your edit window has expired. Please request a new edit approval". // Source: cp.controller.js:575-580
   - If no approved request → 400 "Edit not allowed without approval". // Source: cp.controller.js:582-584
6. Activity is pushed to LSQ via `lsqLeadService.createActivity(activityData)`; on non-`Success` or missing `RelatedId` → 500 "Failed to create Activity in LeadSquared" and submission halts before DB write. // Source: cp.controller.js:623-637
7. Lead is captured/updated in LSQ via `lsqLeadService.captureLead(...)`; on non-`Success` → 500 "Failed to update Lead in LeadSquared" or "Failed to submit JBP. Please try again." and submission halts before DB write. // Source: cp.controller.js:639-671
8. DB write (transactional): if a prior `ACTIVE` row exists, it is marked `EXPIRED` and the approved edit request is marked `CONSUMED`; then a new `JbpSubmission` row is created with `version = prior.version + 1` (or 1). // Source: cp.controller.js:673-712

### 4.3 Input validation (yup) — `jbpValidationSchema`
// Source: source-code/backend/src/validations/cp.validations.js:111-174

| Field | Rule |
|-------|------|
| manpower | number, integer 1..100, required. Line 112 |
| activities | array of `activityOptions`, min 1, required. Line 114-118 |
| digitalPlatforms | array of `platformOptions`, min 1, required. Line 120-124 |
| platformBudgets | object — for every selected platform, value must be digits-only number in `1..500000000`. Line 126-142 |
| investment | one of `investmentOptions`, required. Line 144 |
| insertsRequired / standeesRequired / kioskRequired / telecallersRequired / smsBlast / whatsappBlast | integer ≥ 0, nullable, not required. Line 146-151 |
| growthHub | boolean, nullable, not required. Line 152 |
| registrationCommitment | positive integer, digits only, ≤ 500000000, required. Line 154-162 |
| brokerageAmount | string ≤ 255 chars, nullable, not required. Line 163 |
| netBookingCommitment | positive integer, digits only, ≤ 500000000, required. Line 165-173 |

Allowed value lists (constants in `cp.validations.js`):
- `platformOptions` = `['google', 'meta', 'webpage', 'portal', 'others']`. // Source: cp.validations.js:85
- `activityOptions` = 15 fixed values: Tele-calling, WhatsApp Blast, Email Blast, SMS Blast, Personal Connect Calling, Digital, Portal Listing, Expo, Society Activity, Corporate Activity, Newspaper Insert, Club Activities, Mall Activity, Association Activity, Others. // Source: cp.validations.js:87-103
- `investmentOptions` = `['Upto 1 lakhs', '1 to 3 lakhs', '3 to 5 lakhs', '5 to 7 lakhs', '7+ lakhs']`. // Source: cp.validations.js:105

Validator config on route: `abortEarly: false, stripUnknown: false`. // Source: cp.routes.js:45

### 4.4 Edit request rules (`POST /api/v1/cp/jbp-edit-requests`)
// Source: cp.controller.js:2023-2135
- Body schema `jbpEditRequestSchema`: `projectSlug` required, `jbpSubmissionId` positive integer required, `reason` required ≤ 255 chars, `explanation` ≤ 550 chars nullable. // Source: cp.validations.js:176-185
- Submission must belong to the requesting user and project; else 404. // Source: cp.controller.js:2033-2040
- Cycle status CLOSED → 400 "Edit requests are not allowed for CLOSED cycles". // Source: cp.controller.js:2042-2044
- A pending request for the same submission → 409 "An edit request is already pending for this submission". // Source: cp.controller.js:2046-2050
- An already-approved & still-editable request → 409 "You already have an approved edit request. Use it to edit your submission." // Source: cp.controller.js:2052-2059
- On create, `editableUntil = now + 72 hours`. // Source: cp.controller.js:2065-2066

### 4.5 Versioning
On a successful resubmit (after edit approval): prior `ACTIVE` row → `EXPIRED`, edit request → `CONSUMED`, new row `version = prior.version + 1, status = 'ACTIVE'`. // Source: cp.controller.js:677-706

### 4.6 Sanitization shape sent to LSQ activity (`ActivityEvent: 270`)
- `activities` joined by `, ` then `splitString(..., 200)` into `mx_Custom_2` (first 200) and `mx_Custom_7` (remainder). // Source: cp.controller.js:587-588, 605, 610
- `digitalPlatforms` rendered as `"platform :: budget"` joined by `, `. // Source: cp.controller.js:589
- Each requirement (`inserts/standees/kiosk/telecallers/smsBlast/whatsappBlast`) → `"Yes :: <n>"` if truthy, else `"No"`. // Source: cp.controller.js:590-595
- `growthHub` → `"Yes"` / `"No"`. // Source: cp.controller.js:596

---

## 5. Notification Dispatch

### 5.1 WhatsApp on successful submission
Template: `jbplaunchtwo_new`. Triggered fire-and-forget (no await) AFTER the DB transaction commits. // Source: cp.controller.js:714

```
sendWhatsAppMessage(`${+91}${req.user.phone}`, 'jbplaunchtwo_new', [
  req.user.firstName || 'Channel Partner',
  sanitizedBrokerageAmount ? `₹${sanitizedBrokerageAmount}` : 'N/A',
  netBookingCommitment.toString(),
  manpower.toString(),
  sanitizedActivities,
  sanitizedDigitalPlatforms,
  investment.toString(),
  insertsRequired === 0 ? 'No' : insertsRequired.toString(),
  standeesRequired === 0 ? 'No' : standeesRequired.toString(),
  kioskRequired === 0 ? 'No' : kioskRequired.toString(),
  telecallersRequired === 0 ? 'No' : telecallersRequired.toString(),
  smsBlast === 0 ? 'No' : smsBlast.toString(),
  whatsappBlast === 0 ? 'No' : whatsappBlast.toString(),
  growthHub ? 'Yes' : 'No',
  registrationCommitment.toString(),
]);
```
// Source: cp.controller.js:714-730

Variable count: 15. Implementation calls Botspice WhatsApp API at `api/wappBroad/triggerwam`. // Source: whatsapp.service.js:11-50, line 22

### 5.2 Notifications on edit request status change
- **No backend notification is dispatched** when an admin `APPROVES` or `REJECTS` an edit request. `approveJbpEditRequest` and `rejectJbpEditRequest` only update the row and return success. // Source: admin.controller.js:3262-3322 (approve), 3324-3365 (reject) — no `sendWhatsAppMessage`, `sendSMS`, or `emailService.*` call observed.
- The CP must poll `GET /jbp-cycles` or `GET /jbp-edit-requests` to observe state changes. // Source: cp.controller.js:1717 (getLatestJbpCycle returns `editState`), cp.controller.js:2137 (getJbpEditRequests)

### 5.3 Notifications on resubmission
On resubmission after `APPROVED → CONSUMED`, the same `jbplaunchtwo_new` template is sent. // Source: cp.controller.js:714 (no branching by version)

---

## 6. API Endpoints

All CP endpoints below are mounted under `/api/v1/cp` and require `protect` + `restrictTo('cp')`. // Source: cp.routes.js:36-37

| Method | Path | Handler | Validation | Source |
|--------|------|---------|------------|--------|
| GET | `/api/v1/cp/jbp-cycles?projectSlug=...` | `getLatestJbpCycle` | none (query) | cp.routes.js:40 → cp.controller.js:1717 |
| GET | `/api/v1/cp/jbp-history?projectSlug=...&page=&limit=` | `getJbpHistory` | none | cp.routes.js:41 → cp.controller.js:1907 |
| POST | `/api/v1/cp/jbp` | `submitJbp` | `jbpValidationSchema` (body) | cp.routes.js:43-48 → cp.controller.js:505 |
| POST | `/api/v1/cp/jbp-edit-requests` | `requestJbpEdit` | `jbpEditRequestSchema` (body) | cp.routes.js:51 → cp.controller.js:2023 |
| GET | `/api/v1/cp/jbp-edit-requests?projectSlug=...&page=&limit=` | `getJbpEditRequests` | `jbpEditRequestListSchema` (query) | cp.routes.js:52-56 → cp.controller.js:2137 |

### 6.1 `GET /jbp-cycles` response shape
```
{
  cycle: { id, name, startDate, endDate, status },
  cyclePhase: 'UPCOMING' | 'ACTIVE' | 'EXPIRED',
  submissionStatus: { hasSubmitted },
  submission: <JbpSubmission row or null>,
  canSubmit: boolean,
  editState: {
    status: 'NONE'|'PENDING'|'APPROVED'|'REJECTED'|'CONSUMED'|'EXPIRED',
    editableUntil: Date|null,
    canEdit: boolean
  }
}
```
// Source: cp.controller.js:1881-1893

`editState.editableUntil` is capped at the cycle's end-of-day (`endDate 23:59:59.999`). // Source: cp.controller.js:1752-1753, 1836-1837

### 6.2 `POST /jbp` success response
HTTP 201, `{ message: 'JBP submitted successfully', data: null }`. // Source: cp.controller.js:732

### 6.3 `POST /jbp-edit-requests` success response
HTTP 201 with `editRequest` object containing id/reason/explanation/status/editableUntil/createdAt and embedded submission + cycle. // Source: cp.controller.js:2102-2124

### 6.4 `GET /jbp-edit-requests` UI-side override
For any request whose underlying cycle is `CLOSED` OR whose `editableUntil < now`, the response `status` is force-mapped to `EXPIRED` for display only — DB is **not** updated. // Source: cp.controller.js:2197-2207

### 6.5 Admin endpoints that affect CP
- `POST /api/v1/admin/jbp-edit-requests/:requestId/approve` — sets `status='APPROVED'`, `editableUntil = now + editWindow hours`, captures `adminComment`, `reviewedBy`, `reviewedAt`. // Source: admin.controller.js:3262-3322
- `POST /api/v1/admin/jbp-edit-requests/:requestId/reject` — requires `adminComment`; sets `status='REJECTED'`. // Source: admin.controller.js:3324-3365
- `POST /api/v1/admin/jbp-cycles/:jbpCycleId/close` — sets cycle to `CLOSED`. // Source: admin.controller.js:3040-3091

---

## 7. Known Bugs / Gaps

| ID | Bug / Gap | Source |
|----|-----------|--------|
| JBP-CP-001 | **NPE risk on `endDate` access.** Line 550 dereferences `jbpCycle.endDate` BEFORE the null check on line 553. If `JbpCycle.findOne` returns null (invalid `jbpCycleId`), the request crashes with `TypeError: Cannot read properties of null (reading 'endDate')` and falls through the outer catch returning generic 500 "Failed to submit JBP. Please try again." instead of a specific 400. // Source: cp.controller.js:545-555 |
| JBP-CP-002 | **NPE risk on `approvedEditRequest.editableUntil`.** Line 575 dereferences `approvedEditRequest.editableUntil` BEFORE the null check on line 582. If an `ACTIVE` submission exists but no `APPROVED` edit request is found, server crashes with `TypeError: Cannot read properties of null (reading 'editableUntil')`. // Source: cp.controller.js:568-584 |
| JBP-CP-003 | **WhatsApp phone-number prefix is broken.** Line 714 uses `${+91}` (template-string of unary plus on literal `91`) which evaluates to the string `"91"`, NOT `"+91"`. Resulting recipient becomes e.g. `91XXXXXXXXXX` (no plus sign). May or may not be accepted by the WhatsApp provider depending on normalization. // Source: cp.controller.js:714 |
| JBP-CP-004 | **WhatsApp fire-and-forget swallows errors.** `sendWhatsAppMessage` is not awaited; failures are logged inside the service but the API returns 201 "JBP submitted successfully" regardless. // Source: cp.controller.js:714 (no `await`); whatsapp.service.js:42-49 |
| JBP-CP-005 | **No backend notification on edit-request approval/rejection.** CP is not pushed an SMS, WhatsApp or email when admin approves/rejects. // Source: admin.controller.js:3262-3322, 3324-3365 — verified no notification call |
| JBP-CP-006 | **`isJbpSubmitted` on login response is not scoped to active cycle.** Login response uses raw `count(*)` across all cycles & statuses → returns `true` even for old `EXPIRED` rows. // Source: cp.controller.js:452 (`{ where: { userId } }` — no cycle / status filter) |
| JBP-CP-007 | **Project fallback to hard-coded id.** `submitJbp` falls back to `Project.findOne({ where: { id: 2 } })` if `projectSlug` is not in body — risk of submitting to the wrong project in production where `app.production ? 1 : 2` semantics differ. // Source: cp.controller.js:529-531 vs cp.controller.js:48 |
| JBP-CP-008 | **`platformBudgets` runs `value[platform]` without guard.** If client sends `platformBudgets: undefined` with `digitalPlatforms` non-empty, the test will throw on `value[platform]` instead of returning a clean validation failure. // Source: cp.validations.js:126-142 |
| JBP-CP-009 | **LSQ failure leaves DB clean but produces a partial state.** `createActivity` succeeds, then `captureLead` fails → activity is already in LSQ but no XR row written; on retry the activity will be duplicated. No idempotency key. // Source: cp.controller.js:623-671 |
| JBP-CP-010 | **No project ownership check on `submitJbp`.** Any CP can submit against any `projectSlug`; there is no membership/assignment check between user and project. // Source: cp.controller.js:529-535 |
| JBP-CP-011 | **`editState` returned even when no `latestEditRequest` exists but `approvedEditRequest` line 575 dereferences.** The `getLatestJbpCycle` flow itself does NOT crash — but `submitJbp` (see JBP-CP-002) does. // Source: cp.controller.js:1815-1823 (safe) vs 575 (unsafe) |

---

## 8. QA Risk Areas

1. **Cycle phase boundary tests** — phase calc uses local server time and `setHours(0,0,0,0)`; TZ differences (UAT in IST vs server UTC) can flip ACTIVE/EXPIRED at midnight. // Source: cp.controller.js:1743-1763
2. **Edit window expiry off-by-one** — `editableUntil > cycleCloseTime` is clamped to cycle close (23:59:59.999 of `endDate`); confirm a CP cannot save after midnight when an admin approved a 72-hour window on the last day of cycle. // Source: cp.controller.js:1752-1753, 1834-1846
3. **Concurrent resubmits** — two parallel `submitJbp` calls with the same approved edit could both find `existingJbp` ACTIVE and both attempt to mark it EXPIRED + create new row. Verify with Sequelize transaction lock behaviour. // Source: cp.controller.js:673-708 (single transaction, no SELECT … FOR UPDATE)
4. **Validation bypass via `stripUnknown: false`** — extra fields in body are forwarded into `req.body`; ensure no unintended fields reach LSQ payload. // Source: cp.routes.js:45
5. **Phone-number "+91" rendering** — verify on UAT whether Botspice rejects `91XXXXXXXXXX` without the `+` (JBP-CP-003). // Source: cp.controller.js:714
6. **CP without prospectId** — confirm error message "Something went wrong. Please try again." surfaces correctly in UI; current message is generic. // Source: cp.controller.js:541-543
7. **No notification on edit approval (JBP-CP-005)** — manual test must verify whether business expects WhatsApp/email here; if yes, file as gap.
8. **`isJbpSubmitted` stale flag (JBP-CP-006)** — verify UI behaviour for a CP who submitted in cycle N-1 but has not yet submitted in cycle N.
9. **Activity character-budget split at 200 chars (`splitString`)** — boundary test with `activities` joined length around 200, 201, 400.
10. **LSQ partial failure recovery (JBP-CP-009)** — simulate `captureLead` 500 after `createActivity` 200; confirm DB still empty and retry behaviour.
11. **Concurrent edit-request creation** — two POSTs to `/jbp-edit-requests` for the same submission could both pass the "no pending" check. // Source: cp.controller.js:2046-2050 (no row-level lock)
12. **Display-only `EXPIRED` mapping** — verify CP UI never enables Edit when `editableUntil < now` or cycle CLOSED, despite stored row being `PENDING` or `APPROVED`. // Source: cp.controller.js:2197-2207
13. **WhatsApp template variable order** — 15 positional variables; any reorder in template config in Botspice will corrupt all submitted JBP notifications.
14. **`getJbpHistory` filters only ACTIVE** — historical EXPIRED submissions (from edits) are not surfaced; confirm with PM if historical full audit trail is required. // Source: cp.controller.js:1926
15. **Role guard** — confirm `restrictTo('cp')` correctly rejects buyer/SM/admin tokens; covered by middleware but worth direct test.
