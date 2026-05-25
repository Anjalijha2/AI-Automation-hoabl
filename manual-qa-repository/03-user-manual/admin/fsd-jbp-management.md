# FSD — JBP (Joint Business Plan) Management

> Source-verified Functional Specification covering CP Portal (submission side) and Admin Portal (review side).
> All claims cite source files and line numbers. No BRD/FRD used.
> Generated: 2026-05-24.

---

## 1. Module Overview

JBP Management lets Channel Partners (CPs) submit a Joint Business Plan to the project sales team during a defined business cycle, and lets admins (a) define cycles, (b) review submissions, and (c) approve/reject CP edit requests.

The module is composed of three database entities and is implemented across two controllers — **no dedicated JBP controller, service, or routes file exists**.

- Models: `JbpCycle`, `JbpSubmission`, `JbpEditRequest`
  // Source: source-code/backend/src/models/jbp-cycles.model.js, jbp-submission.model.js, jbp-edit-request.model.js
- Admin routes: mounted under `/api/v1/admin` (admin-only, `restrictTo('admin')`)
  // Source: source-code/backend/src/routes/admin.routes.js:53, 151-169
- CP routes: mounted under `/api/v1/cp` (cp-only, `restrictTo('cp')`)
  // Source: source-code/backend/src/routes/cp.routes.js:37, 39-56
- No dedicated `jbp.service.js` exists in `services/` — verified by directory listing.

---

## 2. Data Models

### 2.1 JbpCycle (`jbp_cycles`)
// Source: source-code/backend/src/models/jbp-cycles.model.js

| Field | Type | Null | Default | Notes |
|-------|------|------|---------|-------|
| id | BIGINT UNSIGNED, PK, autoIncrement | No | — | Line 33-37 |
| name | STRING(255) | No | — | Line 41-44 |
| projectId | BIGINT UNSIGNED, FK → projects.id | No | — | Line 46-53 |
| startDate | DATEONLY | No | — | Line 55-58 |
| endDate | DATEONLY | No | — | Line 60-63 |
| status | ENUM('OPEN','CLOSED') | No | 'OPEN' | Line 65-69 |
| createdBy | BIGINT UNSIGNED, FK → users.id | No | — | Line 71-77 |
| updatedBy | BIGINT UNSIGNED, FK → users.id | Yes | — | Line 79-86 |
| deletedAt | DATE | Yes | — | Line 89-92, paranoid |

- Soft delete enabled: `paranoid: true`, `underscored: true`, `timestamps: true`. // Source: jbp-cycles.model.js:98-101
- Associations: belongsTo Project (`project`), User (`createdByUser` via createdBy), User (`updatedByUser` via updatedBy). // Source: jbp-cycles.model.js:14-19

### 2.2 JbpSubmission (`jbp_submissions`)
// Source: source-code/backend/src/models/jbp-submission.model.js

| Field | Type | Null | Default | Notes |
|-------|------|------|---------|-------|
| id | BIGINT UNSIGNED, PK | No | — | Line 33-37 |
| userId | BIGINT UNSIGNED | No | — | Line 38-41 |
| projectId | BIGINT UNSIGNED, FK → projects | Yes | — | Line 42-51 |
| jbpCycleId | BIGINT UNSIGNED, FK → jbp_cycles | Yes | — | Line 52-61 |
| version | TINYINT UNSIGNED | No | 1 | Line 62-66 |
| status | ENUM('ACTIVE','EXPIRED') | No | 'ACTIVE' | Line 67-71 |
| manpowerCount | SMALLINT UNSIGNED | No | — | Line 72-75 |
| investmentRange | STRING(255) | No | — | Line 76-79 |
| insertsRequired | SMALLINT UNSIGNED | Yes | — | Line 80-83 |
| standeesRequired | SMALLINT UNSIGNED | Yes | — | Line 84-87 |
| kioskRequired | SMALLINT UNSIGNED | Yes | — | Line 88-91 |
| telecallersRequired | SMALLINT UNSIGNED | Yes | — | Line 92-95 |
| smsBlast | MEDIUMINT UNSIGNED | Yes | — | Line 96-99 |
| whatsappBlast | MEDIUMINT UNSIGNED | Yes | — | Line 100-103 |
| growthHub | BOOLEAN | Yes | false | Line 104-108 |
| registrationCommitment | STRING(255) | No | — | Line 109-112 |
| brokerageAmount | STRING(255), col `brokerage_amount` | Yes | — | Line 113-117 |
| netBookingCommitment | STRING(255) | No | — | Line 118-121 |
| activities | JSON | No | — | Line 122-125 |
| digitalChannels | JSON | No | — | Line 126-129 |
| createdAt | DATE | No | NOW | Line 130-134 |

- `updatedAt` is disabled (`updatedAt: false`) — table has no updated_at column. // Source: jbp-submission.model.js:142
- Associations: belongsTo User (`user`), Project (`Project`), JbpCycle (`cycle`). // Source: jbp-submission.model.js:15-17

### 2.3 JbpEditRequest (`jbp_edit_requests`)
// Source: source-code/backend/src/models/jbp-edit-request.model.js

| Field | Type | Null | Default |
|-------|------|------|---------|
| id | BIGINT UNSIGNED, PK | No | — |
| jbpSubmissionId | BIGINT UNSIGNED, FK → jbp_submissions.id | No | — |
| reason | STRING(255) | No | — |
| explanation | STRING(550) | Yes | — |
| status | ENUM('PENDING','APPROVED','REJECTED','EXPIRED','CONSUMED') | No | 'PENDING' |
| editableUntil | DATE | No | — |
| adminComment | STRING(550) | Yes | — |
| requestedBy | BIGINT UNSIGNED, FK → users.id | No | — |
| reviewedBy | BIGINT UNSIGNED, FK → users.id | Yes | — |
| reviewedAt | DATE | Yes | — |
| deletedAt | DATE (paranoid) | Yes | — |

// Source: jbp-edit-request.model.js:71-150

- Instance methods: `isPending()`, `isApproved()`, `isRejected()`, `isExpired()`, `isConsumed()`, `isEditable()`. // Source: jbp-edit-request.model.js:21-43
- `isEditable()` returns true only when `status === 'APPROVED'` AND `now <= editableUntil`. // Source: jbp-edit-request.model.js:41-43
- Static finders: `findPendingForSubmission(jbpSubmissionId)`, `findApprovedForSubmission(jbpSubmissionId)`. // Source: jbp-edit-request.model.js:45-61
- Associations: belongsTo JbpSubmission (`submission`), User (`requester` via requestedBy), User (`reviewer` via reviewedBy). // Source: jbp-edit-request.model.js:14-18

---

## 3. API Reference Table

### 3.1 Admin Portal Endpoints (role: `admin`)
// Source: source-code/backend/src/routes/admin.routes.js:53, 151-169

| Method | URL | Controller | Body Validation |
|--------|-----|------------|-----------------|
| GET | /api/v1/admin/jbp-cycles | AdminController.getAllJbpCycles | — |
| POST | /api/v1/admin/jbp-cycles | AdminController.createJbpCycle | createJbpCycleSchema |
| GET | /api/v1/admin/jbp-submissions | AdminController.getJbpSubmissions | — |
| PUT | /api/v1/admin/jbp-cycles/:jbpCycleId/close | AdminController.closeJbpCycle | — |
| GET | /api/v1/admin/jbp-edit-requests | AdminController.getJbpEditRequests | — |
| PUT | /api/v1/admin/jbp-edit-requests/:editRequestId/approve | AdminController.approveJbpEditRequest | approveJbpEditRequestSchema |
| PUT | /api/v1/admin/jbp-edit-requests/:editRequestId/reject | AdminController.rejectJbpEditRequest | rejectJbpEditRequestSchema |

Commented-out / not implemented: `PUT /jbp-cycles/:jbpCycleId`, `DELETE /jbp-cycles/:jbpCycleId`. // Source: admin.routes.js:171-172

### 3.2 CP Portal Endpoints (role: `cp`)
// Source: source-code/backend/src/routes/cp.routes.js:37, 39-56

| Method | URL | Controller | Body/Query Validation |
|--------|-----|------------|-----------------------|
| GET | /api/v1/cp/jbp-cycles | CpController.getLatestJbpCycle | — |
| GET | /api/v1/cp/jbp-history | CpController.getJbpHistory | — |
| POST | /api/v1/cp/jbp | CpController.submitJbp | jbpValidationSchema (abortEarly:false) |
| POST | /api/v1/cp/jbp-edit-requests | CpController.requestJbpEdit | jbpEditRequestSchema |
| GET | /api/v1/cp/jbp-edit-requests | CpController.getJbpEditRequests | jbpEditRequestListSchema (query) |

---

## 4. Validation Rules

### 4.1 createJbpCycleSchema (Admin)
// Source: source-code/backend/src/validations/admin.validations.js:294-321

- `name`: trimmed string, 2-255 chars, required.
- `projectSlug`: trimmed string, required.
- `startDate`: must match `dd-mm-yyyy`, required.
- `endDate`: must match `dd-mm-yyyy`, required, must be >= startDate.
- `status`: optional, oneOf `['OPEN','CLOSED']`, default `'OPEN'`.

### 4.2 approveJbpEditRequestSchema (Admin)
// Source: admin.validations.js:330-333

- `adminComment`: nullable string, max 550 chars.
- `editWindow`: integer, min 1 (interpreted as hours).

### 4.3 rejectJbpEditRequestSchema (Admin)
// Source: admin.validations.js:335-339

- `adminComment`: required, max 550 chars.

### 4.4 jbpValidationSchema (CP submit)
// Source: source-code/backend/src/validations/cp.validations.js:111-174

- `manpower`: number, 1–100, required.
- `activities`: array of strings, each oneOf `['Mall Activity', 'Association Activity', 'Others']`, min 1 item, required. // Source: cp.validations.js:99-103
- `digitalPlatforms`: array of strings, each oneOf `platformOptions`, min 1 item, required.
- `platformBudgets`: object; for every platform in `digitalPlatforms`, budget must be integer 1–500,000,000. // Source: cp.validations.js:126-142
- `investment`: string, oneOf `['Upto 1 lakhs', '1 to 3 lakhs', '3 to 5 lakhs', '5 to 7 lakhs', '7+ lakhs']`, required. // Source: cp.validations.js:105, 144
- `insertsRequired`, `standeesRequired`, `kioskRequired`, `telecallersRequired`, `smsBlast`, `whatsappBlast`: optional integer ≥ 0, nullable. // Source: cp.validations.js:146-151
- `growthHub`: boolean, nullable.
- `registrationCommitment`: positive integer, digits-only, max 500,000,000, required.
- `brokerageAmount`: string, trimmed, max 255 chars, nullable.
- `netBookingCommitment`: positive integer, digits-only, max 500,000,000, required.

### 4.5 jbpEditRequestSchema (CP request edit)
// Source: cp.validations.js:176-185

- `projectSlug`: required.
- `jbpSubmissionId`: integer, positive, required.
- `reason`: required, max 255 chars.
- `explanation`: nullable, max 550 chars.

### 4.6 jbpEditRequestListSchema (CP list)
// Source: cp.validations.js:187-191

- `projectSlug`: required.
- `page`: integer ≥ 1, default 1.
- `limit`: integer 1–100, default 10.

---

## 5. Business Logic

### 5.1 Cycle Lifecycle
- States: `OPEN` → `CLOSED`. // Source: jbp-cycles.model.js:65-69
- A cycle is **auto-closed** when its `endDate` is in the past whenever an admin lists cycles. // Source: admin.controller.js:2703-2710
- **Creating a new cycle:**
  - Project must exist; validated by `Project.findOne({ slug })`. // Source: admin.controller.js:2769-2773
  - `startDate` must be >= today (after parsing dd-mm-yyyy → YYYY-MM-DD). // Source: admin.controller.js:2776-2790
  - Rejected if any existing OPEN cycle for the same project overlaps the requested date range. // Source: admin.controller.js:2792-2808
  - On create (inside DB transaction):
    1. New `JbpCycle` row inserted with `status='OPEN'`. // Source: 2813-2824
    2. All other OPEN cycles for the same project are CLOSED. // Source: 2826-2837
    3. All JbpEditRequests for submissions of newly-closed cycles whose status is PENDING or APPROVED are set to `EXPIRED`. // Source: 2839-2874
- **Closing a cycle (manual):**
  - Cycle must currently be OPEN, scoped to projectId. // Source: 3054-3065
  - Status set to `CLOSED`, `updatedBy = req.user.id`. // Source: 3068-3079

### 5.2 Submission Lifecycle
- States: `ACTIVE` → `EXPIRED`. // Source: jbp-submission.model.js:67-71
- A CP can only submit when:
  - The cycle is OPEN and `endDate >= today`. // Source: cp.controller.js:545-555
  - `req.user.prospectId` is present (LeadSquared linkage required). // Source: cp.controller.js:541-543
- If an ACTIVE submission already exists for this `(userId, jbpCycleId)`:
  - An `APPROVED` JbpEditRequest for that submission is required. // Source: cp.controller.js:557-585
  - The current time must be <= `editableUntil`, otherwise 403 "Your edit window has expired". // Source: cp.controller.js:575-580
  - Without an APPROVED edit request, returns 400 "Edit not allowed without approval". // Source: cp.controller.js:582-584
- **Submission write** (inside transaction):
  1. If updating: previous `JbpSubmission` set to `EXPIRED`, APPROVED edit request set to `CONSUMED`, `version = previous.version + 1`. // Source: cp.controller.js:677-681
  2. New `JbpSubmission` row inserted with `digitalChannels = { digitalPlatforms, platformBudgets }`. // Source: cp.controller.js:683-706
- **External side effects** (executed BEFORE DB write):
  - LSQ `createActivity` call with ActivityEvent 270 and 16 mx_Custom_* fields. // Source: cp.controller.js:600-637
  - LSQ `captureLead` call with mx_CP_Meeting CustomObject fields 14–28. // Source: cp.controller.js:639-671
  - Both LSQ failures abort the submission with 500 errors before any DB write happens. **CLAUDE.md constraint: do NOT target live LSQ in tests — mock these calls.**
- **WhatsApp notification:** After commit, `sendWhatsAppMessage` called with template `jbplaunchtwo_new` and 15 placeholders. // Source: cp.controller.js:714-730

### 5.3 Edit Request Lifecycle
- States: `PENDING` → `APPROVED` | `REJECTED` | `EXPIRED` | `CONSUMED`. // Source: jbp-edit-request.model.js:98-102

**CP-side flow:**
- Guards: project must exist, submission must belong to requesting CP, cycle must not be CLOSED, no existing PENDING request (else 409), no existing APPROVED+still-editable request (else 409). // Source: cp.controller.js:2027-2059
- On create: `status='PENDING'` (default). // Source: cp.controller.js:2061-2077

**Admin-side review:**
- Auto-expiry: on `GET /admin/jbp-edit-requests`, any PENDING/APPROVED request whose `editableUntil < now` is updated to `EXPIRED`. // Source: admin.controller.js:3118-3149
- **Approve:** `editWindow` required (hours). `editableUntil = now + editWindow * 3600000`. Request must be PENDING. // Source: admin.controller.js:3265-3309
- **Reject:** `adminComment` required. Request must be PENDING. // Source: admin.controller.js:3333-3352
- `CONSUMED`: set by `submitJbp` when APPROVED edit request is used to resubmit. // Source: cp.controller.js:680

### 5.4 CP "Latest Cycle" View Logic
// Source: cp.controller.js:1717-1905

- Returns latest cycle for project, ordered `[status ASC, startDate DESC]`. // Source: 1730-1737
- Computes `cyclePhase`: `UPCOMING` (OPEN & today < startDate), `ACTIVE` (OPEN & in range), `EXPIRED` (otherwise). // Source: 1755-1763
- Derives `editState.status` ∈ `NONE|PENDING|APPROVED|REJECTED|CONSUMED|EXPIRED` and `canEdit` boolean. // Source: 1807-1879
- When edit request is APPROVED, `editableUntil` clamped to cycle `endDate 23:59:59.999`, whichever is earlier. // Source: 1834-1855
- `canSubmit = (cyclePhase === 'ACTIVE') && !existingSubmission`. // Source: 1891

### 5.5 Admin Submissions List
// Source: admin.controller.js:2899-3038

- Filters: `projectSlug` (required), `cycleIds` (single or CSV), `cpName`, `cpHvCode`, `cpEmail`, `cpPhone` (LIKE-matched). // Source: 2901-2954
- Returns only ACTIVE submissions. // Source: 2956-2959
- Output row carries fixed string `status: 'Submitted'`. // Source: 2988-3010
- Default pagination: page=1, limit=10.

---

## 6. Form Field Catalogue (CP Submission)
Derived from `jbpValidationSchema` (cp.validations.js:111-174) and `submitJbp` body (cp.controller.js:507-525).

| UI Field | API key | Type | Required | Constraints |
|----------|---------|------|----------|-------------|
| Project | projectSlug | string | derived | Server-side; fallback id=2 if missing |
| JBP Cycle | jbpCycleId | number | Yes | Must reference OPEN cycle with endDate >= today |
| Manpower | manpower | number | Yes | 1–100 |
| Investment Range | investment | string enum | Yes | Upto 1 lakhs / 1 to 3 / 3 to 5 / 5 to 7 / 7+ lakhs |
| Activities | activities | string[] | Yes | min 1 of [Mall Activity, Association Activity, Others] |
| Digital Platforms | digitalPlatforms | string[] | Yes | min 1; each needs platformBudget |
| Platform Budgets | platformBudgets | object | Yes | per-platform integer 1–500,000,000 |
| Inserts Required | insertsRequired | number | No | integer ≥ 0, nullable |
| Standees Required | standeesRequired | number | No | integer ≥ 0, nullable |
| Kiosk Required | kioskRequired | number | No | integer ≥ 0, nullable |
| Telecallers | telecallersRequired | number | No | integer ≥ 0, nullable |
| SMS Blast | smsBlast | number | No | integer ≥ 0, nullable |
| WhatsApp Blast | whatsappBlast | number | No | integer ≥ 0, nullable |
| Growth Hub | growthHub | boolean | No | nullable |
| Registration Commitment | registrationCommitment | number | Yes | positive integer, ≤ 500,000,000 |
| Brokerage Amount | brokerageAmount | string | No | trimmed, ≤ 255 chars |
| Net Booking Commitment | netBookingCommitment | number | Yes | positive integer, ≤ 500,000,000 |

---

## 7. Role & Permission Matrix

| Feature | Admin | SM Admin | CP |
|---------|-------|----------|----|
| Create JBP Cycle | ✅ | ❌ | ❌ |
| Close JBP Cycle | ✅ | ❌ | ❌ |
| List JBP Cycles | ✅ | ❌ | ✅ (own project latest) |
| List JBP Submissions | ✅ | ❌ | ✅ (own only) |
| Submit JBP | ❌ | ❌ | ✅ |
| Request Edit | ❌ | ❌ | ✅ (own submission) |
| List Edit Requests | ✅ | ❌ | ✅ (own) |
| Approve Edit Request | ✅ | ❌ | ❌ |
| Reject Edit Request | ✅ | ❌ | ❌ |

---

## 8. Notification & Side-Effect Triggers

| Trigger | Channel | Template / Action | Source |
|---------|---------|-------------------|--------|
| CP submits / resubmits JBP | LeadSquared | `createActivity` event 270 + `captureLead` | cp.controller.js:600-671 |
| CP submits / resubmits JBP (success) | WhatsApp | `jbplaunchtwo_new`, 15 params | cp.controller.js:714-730 |
| Admin creates new cycle | DB cascade | Prior PENDING/APPROVED edit requests → EXPIRED | admin.controller.js:2839-2874 |
| Admin lists cycles | DB cascade | Past-end OPEN cycles → CLOSED | admin.controller.js:2703-2710 |
| Admin lists edit requests | DB cascade | Overdue PENDING/APPROVED → EXPIRED | admin.controller.js:3118-3149 |
| Admin approves edit request | None | Status → APPROVED, sets editableUntil | admin.controller.js:3302-3309 |
| Admin rejects edit request | None | Status → REJECTED | admin.controller.js:3352 |

No email dispatch found in any JBP controller path. // Verified by source grep.

---

## 9. State Machines

### JbpCycle
```
OPEN ── admin closeJbpCycle ──────────────────────────────► CLOSED
OPEN ── auto on getAllJbpCycles when endDate < now ───────► CLOSED
OPEN ── createJbpCycle (other cycles for same project) ───► CLOSED
```

### JbpSubmission
```
ACTIVE ── submitJbp (resubmit path, after APPROVED edit) ──► EXPIRED  (old row)
                                                              + new ACTIVE row created
```

### JbpEditRequest
```
                       ┌── admin approve ──────────────────► APPROVED
PENDING ───────────────┤
                       └── admin reject ───────────────────► REJECTED

APPROVED ── submitJbp consumes it ─────────────────────────► CONSUMED
APPROVED ── editableUntil < now (auto-sweep) ───────────────► EXPIRED
PENDING  ── editableUntil < now (auto-sweep) ───────────────► EXPIRED
{PENDING,APPROVED} ── createJbpCycle closes parent cycle ───► EXPIRED
```
// Source: jbp-edit-request.model.js:98-102; admin.controller.js:2839-2874, 3118-3149, 3302-3309, 3352; cp.controller.js:680

---

## 10. Edge Cases & Known Bugs Found in Source

1. **NPE in `submitJbp`**: `cp.controller.js:545-555` reads `jbpCycle.endDate` BEFORE null-check. When `jbpCycle` is null, throws NPE instead of intended 400. // Source: cp.controller.js:545-555
2. **NPE in `submitJbp`**: `cp.controller.js:568-585` dereferences `approvedEditRequest.editableUntil` THEN null-checks — same pattern. // Source: cp.controller.js:568-585
3. **Dead admin validation export**: `admin.validations.js:323` uses `Object(...)` (global) instead of yup `object()` — `jbpEditRequestListSchema` is not a real yup schema. Route at admin.routes.js:159 does NOT apply query validation, so this is unused but flagged. // Source: admin.validations.js:323
4. **`submission.updatedAt` always `undefined`**: Admin response at admin.controller.js:3012 spreads `submission.updatedAt` but model sets `updatedAt: false`. // Source: jbp-submission.model.js:142; admin.controller.js:3012
5. **LSQ blocking**: `submitJbp` calls LSQ synchronously BEFORE DB write. LSQ outage = JBP submission completely blocked. // Source: cp.controller.js:600-671
6. **Fallback projectId=2**: `cp.controller.js:530` falls back to `id: 2` when `projectSlug` missing — hardcoded non-prod project. // Source: cp.controller.js:530
7. **No Delete/Update for cycles**: `PUT` and `DELETE` for cycles are commented out in routes. Cycles can only be created or closed. // Source: admin.routes.js:171-172

---

## 11. Not Found in Source Code

- Dedicated `jbp.service.js` — business logic lives in controllers directly
- Email notification for any JBP event
- Commission calculation in JBP module
- Admin ability to edit/delete a submission
- CP ability to delete a submission or edit request
