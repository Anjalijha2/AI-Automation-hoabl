# FSD — Buyer Portal: Callback Request
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Callback Request module lets an authenticated buyer ("user" role) request a video/phone consultation with a Sales Manager (SM) tied to a specific registration. The buyer can create, list, view, reschedule, and submit post-call feedback for callback requests. After SM-side actions, the buyer is notified via WhatsApp and can submit feedback either through the in-app feedback endpoint or via a tokenized public WhatsApp link.

Buyer-facing entry points are mounted at `/api/v1/user/callback-requests`. // Source: routes/user.routes.js:172
Public buyer feedback link is mounted at `/api/v1/callback-feedback/:code`. // Source: routes/index.js:59-60

All authenticated routes require role `user`. // Source: routes/user.routes.js:49-51

---

## 2. Data Model

### Table: `callback_requests` (Model: `CallbackRequest`)
// Source: models/callback-request.model.js:155-160

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK auto-increment | // Source: models/callback-request.model.js:44-49 |
| `user_id` | BIGINT UNSIGNED, NOT NULL, FK → users.id | The buyer who owns the request. // Source: models/callback-request.model.js:50-55 |
| `registration_id` | BIGINT UNSIGNED, nullable, FK → registrations.id | // Source: models/callback-request.model.js:56-61 |
| `manager_id` | BIGINT UNSIGNED, nullable, FK → users.id | Assigned SM. Nullable when no SM available at create-time. // Source: models/callback-request.model.js:62-67 |
| `cc_emails` | JSON, nullable | Only populated by SM flow. // Source: models/callback-request.model.js:68-72 |
| `requested_at` | DATETIME, NOT NULL | // Source: models/callback-request.model.js:73-77 |
| `description` | STRING(750), nullable | Validation cap is 500 chars on input. // Source: models/callback-request.model.js:78-81; validations/callback-request.validations.js:7 |
| `status` | ENUM('REQUESTED','RESCHEDULED','SCHEDULED','CONFIRMED','COMPLETED'), default 'REQUESTED' | // Source: models/callback-request.model.js:82-86 |
| `vc_outcome` | ENUM(10 values: VC_DONE_PREFERENCE, VC_DONE_NO_PREFERENCE, FUTURE_SCHEDULED, FUTURE_RESCHEDULED, MISSED_SCHEDULED_NC, NOT_INTERESTED_LOST, NEVER_CONNECTED, TL_LOST, VC_2_DONE, CP_TO_DRIVE_PREFERENCE), nullable | SM-side only. // Source: models/callback-request.model.js:87-101 |
| `isSmFeedbackSubmitted` | TINYINT(0/1), default 0 | // Source: models/callback-request.model.js:102-107 |
| `isBuyerFeedbackSubmitted` | TINYINT(0/1), default 0 | // Source: models/callback-request.model.js:108-113 |
| `meeting_link` | STRING(1000), nullable | Set by SM scheduling flow. // Source: models/callback-request.model.js:114-118 |
| `teams_meeting_id` | STRING(500), nullable | // Source: models/callback-request.model.js:119-123 |
| `meeting_details` | JSON, nullable | // Source: models/callback-request.model.js:124-128 |
| `previous_meetings` | JSON, nullable, default null | // Source: models/callback-request.model.js:129-134 |
| `buyer_feedback_token` | STRING(100), nullable | Encrypted base64url token used in public WhatsApp feedback link. // Source: models/callback-request.model.js:135-139 |
| `created_by` | BIGINT UNSIGNED, nullable, FK → users.id | // Source: models/callback-request.model.js:140-146 |
| timestamps + `deleted_at` (paranoid soft delete) | | // Source: models/callback-request.model.js:147-159 |

### Table: `callback_request_feedbacks` (Model: `CallbackRequestFeedback`)
// Source: models/callback-request-feedback.model.js:175-181

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | // Source: models/callback-request-feedback.model.js:36-41 |
| `call_request_id` | BIGINT UNSIGNED, NOT NULL, FK → callback_requests.id | // Source: models/callback-request-feedback.model.js:42-47 |
| `submitted_by_id` | BIGINT UNSIGNED, NOT NULL, FK → users.id | // Source: models/callback-request-feedback.model.js:48-53 |
| `submitted_by_role` | ENUM('SM','BUYER'), NOT NULL | // Source: models/callback-request-feedback.model.js:54-58 |
| **Customer-side fields** | | |
| `overall_satisfaction` | TINYINT (1..5 by validation) | // Source: models/callback-request-feedback.model.js:112-116; validations/callback-request.validations.js:167-171 |
| `query_resolved_status` | STRING(50), nullable | // Source: models/callback-request-feedback.model.js:117-121 |
| `call_punctuality_status` | STRING(50), nullable | // Source: models/callback-request-feedback.model.js:122-126 |
| `call_quality_av` | STRING(50), nullable | // Source: models/callback-request-feedback.model.js:127-131 |
| `next_steps_clarity` | STRING(50), nullable | // Source: models/callback-request-feedback.model.js:132-136 |
| `interest_level` | STRING(50), nullable | // Source: models/callback-request-feedback.model.js:137-141 |
| `followup_call_required` | TINYINT(0/1), default 0 | // Source: models/callback-request-feedback.model.js:142-147 |
| `followup_preferred_datetime` | DATETIME, nullable | Required when followupCallRequired=true and must be future. // Source: models/callback-request-feedback.model.js:148-152; validations/callback-request.validations.js:197-204 |
| `improvement_comments` | STRING(1000), nullable | Validation cap is 900 chars. // Source: models/callback-request-feedback.model.js:153-157; validations/callback-request.validations.js:206 |
| timestamps + `deleted_at` (paranoid) | | // Source: models/callback-request-feedback.model.js:159-182 |

### Associations
// Source: models/callback-request.model.js:14-39
- `CallbackRequest.belongsTo(User)` as `user` (FK userId)
- `CallbackRequest.belongsTo(User)` as `manager` (FK managerId)
- `CallbackRequest.belongsTo(User)` as `creator` (FK createdBy)
- `CallbackRequest.belongsTo(Registration)` as `registration` (FK registrationId)
- `CallbackRequest.hasMany(CallbackRequestFeedback)` as `feedback` (FK callRequestId)

---

## 3. State Machines

### `callbackRequestStatus` enum values
// Source: constants/global.js:39-45
`REQUESTED`, `RESCHEDULED`, `SCHEDULED`, `CONFIRMED`, `COMPLETED`.

### Allowed transitions (strict, server-enforced)
// Source: services/callback-request.service.js:19-37
```
REQUESTED   -> SCHEDULED
SCHEDULED   -> RESCHEDULED | CONFIRMED
RESCHEDULED -> CONFIRMED
CONFIRMED   -> []   (terminal)
```

Notes verified from source:
- `COMPLETED` is defined in the enum but is **not** present in `ALLOWED_TRANSITIONS`. The SM service explicitly falls back to setting status to `CONFIRMED` with a warn log: "Callback request status fallback to CONFIRMED: COMPLETED enum is not available in DB". // Source: services/callback-request-sm.service.js:78-87
- There is **no `CANCELLED` enum value** and no buyer-facing cancel endpoint. // Source: models/callback-request.model.js:82-86; routes/user/callback-request.routes.js (no DELETE route)

### Buyer-initiated transitions
- **Create** → starts request in `REQUESTED`. // Source: services/callback-request.service.js:212
- **Reschedule (buyer)** → does **not** change status; only updates `requestedAt` + `description`, and only if current status is `REQUESTED`. Any other status returns 400 "Cannot reschedule a request that is already X. Please contact your sales manager." // Source: services/callback-request.service.js:289-310
- **Submit feedback (buyer)** → only when `status = CONFIRMED` AND `isSmFeedbackSubmitted = 1`. // Source: services/callback-request.service.js:399-401

---

## 4. Business Rules

### BR-CB-01 — Duplicate active request prevention
A buyer cannot create a second callback request for the same `registrationId` unless the existing one's status is `CONFIRMED`. Otherwise returns 400 "A callback request already exists for this registration. Please use the existing request." // Source: services/callback-request.service.js:155-161

### BR-CB-02 — Registration must belong to buyer
`createCallbackRequest` requires `Registration.findOne({ registrationNumber, userId })`; otherwise 404 "Registration not found or does not belong to you". // Source: services/callback-request.service.js:150-153

### BR-CB-03 — `requestedAt` must be in the future
Validation rejects past datetimes on both create and reschedule. // Source: validations/callback-request.validations.js:6, 11

### BR-CB-04 — Description size cap
Description is trimmed to 500 chars on input (model allows 750). // Source: validations/callback-request.validations.js:7; models/callback-request.model.js:78-81

### BR-CB-05 — SM assignment method = "least-loaded" (round-robin DISABLED)
- A module-level constant `ASSIGNMENT_METHOD = 'least-loaded'` controls the strategy. // Source: services/callback-request.service.js:13
- `assignManagerRoundRobin` exists but is **not invoked** because of the constant value above. // Source: services/callback-request.service.js:44-69
- The SM-side controller code that would have re-routed creation through `getNextManager` is **commented out** with comment `// commented as feature not required now`. // Source: services/callback-request-sm.service.js:338-349
- Selection: cheapest SM by count of active callback requests (status not in `[CONFIRMED]`), tie-broken by `lastRequestAssignedAt` (oldest first), then by `id`. Selection uses `FOR UPDATE` row lock to prevent races. // Source: services/callback-request.service.js:77-129
- **Sticky-manager rule:** if the same buyer previously had a callback for any registration in the same `projectId` with a still-active+available `managerId`, that manager is reused (round-robin/least-loaded bypassed). // Source: services/callback-request.service.js:179-199

### BR-CB-06 — No-SM-available behavior (verified from buyer side)
If no SM is found by least-loaded selection, `assignManagerLeastLoaded` returns `null` (it does NOT throw). // Source: services/callback-request.service.js:116-121
The CallbackRequest row is still created with `managerId: manager?.id || null`. // Source: services/callback-request.service.js:205-216
The buyer's create call therefore **succeeds with HTTP 201 even if no SM exists**, leaving the row in `REQUESTED` with `managerId=NULL`. The customer-acknowledgement WhatsApp ('expert_customer_inform') is still attempted. // Source: services/callback-request.service.js:233-236
There is no automated reassignment job in the verified source code. // Source: NOT FOUND — verify manually

### BR-CB-07 — Buyer can reschedule only when status = REQUESTED
Once status advances past `REQUESTED` (e.g., to `SCHEDULED` after SM action), the buyer reschedule endpoint returns 400. // Source: services/callback-request.service.js:301-305

### BR-CB-08 — Buyer cannot cancel
No buyer-facing cancellation endpoint exists. // Source: routes/user/callback-request.routes.js (verified entire file)

### BR-CB-09 — Rate limiting
No rate-limit middleware applied on the buyer callback routes; only the global `protect` and `restrictTo('user')` middleware. // Source: routes/user/callback-request.routes.js; routes/user.routes.js:49-51

### BR-CB-10 — Feedback eligibility
Buyer feedback endpoint requires:
1. `req.user.role === 'user'` (else 403 Forbidden). // Source: controllers/callback-request.controller.js:111-113
2. Callback row belongs to user. // Source: services/callback-request.service.js:386-397
3. `status === CONFIRMED` AND `isSmFeedbackSubmitted === 1`. // Source: services/callback-request.service.js:399-401 (message: "Feedback can only be submitted for completed callback requests")
4. No prior `submittedByRole='BUYER'` row exists for the same call_request_id. // Source: services/callback-request.service.js:403-412

### BR-CB-11 — Public token feedback eligibility
Public link variant additionally requires `status === CONFIRMED` and not already submitted; idempotency is enforced under a row-level `LOCK.UPDATE`. // Source: controllers/callback-request.controller.js:160-187

### BR-CB-12 — Follow-up datetime conditional requirement
When `followupCallRequired === true`, `followupPreferredDatetime` is required and must be in the future; otherwise the field is optional and is stored as null. // Source: validations/callback-request.validations.js:195-204; services/callback-request.service.js:414, 427

---

## 5. Notification Dispatch

All notifications are best-effort (fire-and-forget, errors logged not thrown). Template names verified verbatim.

### On `createCallbackRequest` (buyer)
- **WhatsApp to buyer** — template `expert_customer_inform`, params `[customerName]`. // Source: services/callback-request.service.js:234
- **LSQ activity** — `ActivityEvent: 273` with custom fields 1–4 (requestedAt, description, source='Buyer', assigned manager name). Skipped if user has no `prospectId`. // Source: services/callback-request.service.js:245-262

### On `rescheduleCallbackRequestByUser`
- **WhatsApp to buyer** — template `expert_customer_inform`, params `[customerName]`. // Source: services/callback-request.service.js:320

### On `createBuyerFeedback` (in-app feedback)
- **LSQ activity** — `ActivityEvent: 271`, custom fields 1–9 (satisfaction, queryResolved, callPunctuality, callQuality, nextStepsClarity, interestLevel, followupCallRequired Yes/No, followupPreferredDatetime, improvementComments). // Source: services/callback-request.service.js:438-453, 461

### On `submitFeedbackByPublicToken` (WhatsApp link variant)
- **LSQ activity** — identical `ActivityEvent: 271` with the same 9 fields. // Source: controllers/callback-request.controller.js:213-234

### Notifications buyer receives that originate from SM service (relevant context)
- After SM schedules: **WhatsApp to buyer** — template `expert_meeting_link`, params `[firstName, formattedTime, meetingLink]`. // Source: services/callback-request-sm.service.js:949
- After SM reschedules: same `expert_meeting_link` template with new link. // Source: services/callback-request-sm.service.js:1091
- After SM submits SM feedback: **WhatsApp to buyer** — template `expert_customer_feedback`, params `[buyerName, feedbackLink]`. // Source: services/callback-request-sm.service.js:102

### Notifications the buyer does NOT receive (verified absent)
- No buyer notification specifically on `CONFIRMED` status transition independent of SM feedback. // Source: NOT FOUND — verify manually
- No buyer email is sent for any callback lifecycle event from the buyer-facing service. // Source: services/callback-request.service.js (no `emailService` import)

---

## 6. API Endpoints

All buyer endpoints below sit under prefix `/api/v1/user/callback-requests` (mounted at `routes/user.routes.js:172`).

| Method | Path | Handler | Auth | Validation Schema |
|---|---|---|---|---|
| GET | `/` | `callbackRequestController.listCallbacks` | `protect` + `restrictTo('user')` | `listCallbackRequestsSchema` (query) |
| POST | `/` | `callbackRequestController.createCallback` | same | `createCallbackRequestSchema` (body) |
| GET | `/:id` | `callbackRequestController.getCallback` | same | — |
| PUT | `/:id/reschedule` | `callbackRequestController.rescheduleCallback` | same | `userRescheduleCallbackSchema` (body) |
| POST | `/:id/feedback` | `callbackRequestController.submitFeedbackByBuyer` | same | `buyerSubmitFeedbackSchema` (body) |

// Source: routes/user/callback-request.routes.js:13-27

### Public (no auth) callback-feedback endpoints
| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/api/v1/callback-feedback/:code` | `verifyFeedbackToken` | Returns `{status: 'valid'\|'already_submitted'\|'invalid', requestId?, buyerName?}` |
| POST | `/api/v1/callback-feedback/:code` | `submitFeedbackByPublicToken` | Validates with `buyerSubmitFeedbackSchema` |

// Source: routes/index.js:59-60

### Request body — `createCallbackRequestSchema`
```
registrationNumber  string, trimmed, required
requestedAt         date, future, required
description         string, trimmed, max 500, nullable, optional
```
// Source: validations/callback-request.validations.js:4-8

### Request body — `userRescheduleCallbackSchema`
```
requestedAt         date, future, required
description         string, trimmed, max 500, nullable, optional
```
// Source: validations/callback-request.validations.js:10-13

### Request body — `buyerSubmitFeedbackSchema`
```
overallSatisfaction         integer 1..5, required
queryResolvedStatus         string, trimmed, max 50, required
callPunctualityStatus       string, trimmed, max 50, required
callQualityAv               string, trimmed, max 50, required
nextStepsClarity            string, trimmed, max 50, required
interestLevel               string, trimmed, max 50, required
followupCallRequired        boolean, required
followupPreferredDatetime   date, future, required when followupCallRequired=true
improvementComments         string, trimmed, max 900, nullable, optional
```
// Source: validations/callback-request.validations.js:166-207

### Response envelope
All endpoints use `ApiResponse.success(message, data, httpStatus)` / `ApiResponse.error(httpStatus, message, errors?)`. // Source: controllers/callback-request.controller.js:1-2, 37, 55, etc.

### Success status codes
- `POST /` → 201 Created. // Source: controllers/callback-request.controller.js:37
- `POST /:id/feedback` → 201 Created. // Source: controllers/callback-request.controller.js:124
- `POST /callback-feedback/:code` (public) → 200 OK. // Source: controllers/callback-request.controller.js:248
- GET / PUT → 200 OK. // Source: controllers/callback-request.controller.js:55, 96

---

## 7. Known Bugs / Gaps

### KB-CB-01 — `COMPLETED` enum present but unreachable
`COMPLETED` is defined on the model enum but is not a legal transition target anywhere in `ALLOWED_TRANSITIONS`. The SM service explicitly catches the error and falls back to writing `CONFIRMED`, logging "Callback request status fallback to CONFIRMED: COMPLETED enum is not available in DB". This indicates a schema/code drift: the team intended a separate `COMPLETED` state but the DB or transition map was never updated.
// Source: services/callback-request-sm.service.js:78-87; services/callback-request.service.js:19-24

### KB-CB-02 — Round-robin assignment dead code
`assignManagerRoundRobin` is implemented but unreachable because `ASSIGNMENT_METHOD` is hard-coded to `'least-loaded'`. The SM-side `getNextManager` re-route for `sales_manager_admin` is also commented out with "// commented as feature not required now".
// Source: services/callback-request.service.js:13, 44-69; services/callback-request-sm.service.js:338-349

### KB-CB-03 — Silent buyer success when no SMs available
When no SM matches the `least-loaded` query, `assignManagerLeastLoaded` returns `null` instead of throwing. The buyer's create call still succeeds with a row that has `manager_id = NULL`. There is no visible reassignment cron in the verified source, so the request can persist in `REQUESTED` indefinitely. The commented-out error message ("Please try again later after some time, as all our customer representatives are currently occupied") indicates this guard was removed deliberately. // Source: services/callback-request.service.js:116-121, 205-216

### KB-CB-04 — Description column size vs. validation mismatch
DB column is `STRING(750)` but Yup validator caps at 500. Strings 501–750 chars would be rejected at the API layer even though the DB allows them. Internal consumers writing directly to DB could bypass. // Source: models/callback-request.model.js:78-81; validations/callback-request.validations.js:7

### KB-CB-05 — `improvement_comments` size mismatch
DB column is `STRING(1000)`, validator caps at 900, and the error message says "must be at most 1000 characters" (incorrect message). // Source: models/callback-request-feedback.model.js:153-157; validations/callback-request.validations.js:206

### KB-CB-06 — Sticky-manager rule may strand requests on inactive SMs
The sticky reuse logic only re-picks the previous manager if `isActive: true, isAvailable: true`. If that SM is unavailable, the code falls back to least-loaded selection. This is correct, but if the previous manager goes inactive **after** the new row is created, no automatic reassignment occurs (no cron found). // Source: services/callback-request.service.js:179-203

### KB-CB-07 — Buyer cannot cancel; no API path exists
The buyer has no way to cancel a created callback request — only reschedule (and only while REQUESTED). // Source: routes/user/callback-request.routes.js (no DELETE)

### KB-CB-08 — Duplicate normalizeString definitions
`normalizeString` is declared twice in the same module file (top-level helper + later const), which is legal in JS hoisting but suggests refactor debt. Functional impact: none. // Source: services/callback-request.service.js (first definition at the helper section, second at line 478-482)

### KB-CB-09 — Public feedback link only valid after CONFIRMED, not just feedback-eligible
The public token feedback endpoint requires `status === CONFIRMED` but does NOT check `isSmFeedbackSubmitted`. The in-app variant DOES check `isSmFeedbackSubmitted === 1`. Same buyer, two endpoints, different eligibility windows. // Source: controllers/callback-request.controller.js:184-187 vs. services/callback-request.service.js:399-401

---

## 8. QA Risk Areas

### QA-Risk-01 — Stuck `REQUESTED` rows with `manager_id = NULL`
Manual scenario: create callback request when all SMs are `isActive=false` OR `isAvailable=false`. Verify row created with manager_id NULL, no error returned to buyer. Verify what (if anything) reassigns it. **Highest functional risk.**

### QA-Risk-02 — Race conditions on concurrent SM assignment
Selection uses `FOR UPDATE` and a `sequelize.transaction()`. Test concurrent buyer create requests to confirm no two rows receive the same SM if least-loaded ties are common. // Source: services/callback-request.service.js:111-114, 174-176

### QA-Risk-03 — Reschedule timing boundary
`requestedAt` validator uses `new Date()` at schema evaluation time, not request time. Submitting a payload at T with `requestedAt = T + ε` may race the validator. Test with `requestedAt` ~1 second in the future. // Source: validations/callback-request.validations.js:6, 11

### QA-Risk-04 — `vcOutcome` enum (10 values) — buyer never sets but SM updates can affect listing filters
Buyer GET listing returns `vcOutcome` (not in the attributes list for `getUserCallbackRequests`). Confirm whether buyer needs visibility into outcome and ensure UI does not depend on this. // Source: services/callback-request.service.js:346-360

### QA-Risk-05 — Feedback double-submission via parallel endpoints
A motivated buyer could attempt the in-app `POST /:id/feedback` and the public `POST /callback-feedback/:code` near-simultaneously. The in-app path locks via uniqueness check on (call_request_id, role='BUYER'); the public path locks via `LOCK.UPDATE` on the parent row. Cross-endpoint test required. // Source: services/callback-request.service.js:403-412; controllers/callback-request.controller.js:160-209

### QA-Risk-06 — WhatsApp template parameter ordering
Templates `expert_customer_inform` (1 param), `expert_meeting_link` (3 params), `expert_customer_feedback` (2 params) — verify template definitions match the param array order in code. Failed templates only log; user sees no error. // Source: services/callback-request.service.js:234, 320; services/callback-request-sm.service.js:949, 102

### QA-Risk-07 — Token tampering on public feedback link
WhatsApp sometimes appends trailing `%22` (URL-encoded quote). The sanitizer strips trailing `"`, `'`, `` ` ``. Test with other trailing punctuation and with truncated tokens. // Source: controllers/callback-request.controller.js:10-15, 148-158

### QA-Risk-08 — Idempotency on public submit
Public POST uses a row-lock `LOCK.UPDATE` and checks `isBuyerFeedbackSubmitted`. Simulate two near-simultaneous browser submissions for the same token. // Source: controllers/callback-request.controller.js:160-209

### QA-Risk-09 — LSQ failures do not roll back DB writes
LSQ activity creation is wrapped in try/catch and logs failure but DB feedback row remains. Acceptable per design but confirm UI does not show LSQ error to buyer. // Source: services/callback-request.service.js:466-473; controllers/callback-request.controller.js:239-246

### QA-Risk-10 — Buyer reschedule does not bump `updatedAt` of registration / does not requeue assignment
Reschedule only updates `requestedAt` + `description`. No reassignment logic runs even if the originally-assigned SM is now inactive. // Source: services/callback-request.service.js:307-310

### QA-Risk-11 — Authorization scope
All buyer endpoints rely on `restrictTo('user')` at the parent router. Verify role-id mapping in `roleNameIdMap.user` matches the JWT-derived role string. // Source: routes/user.routes.js:50

### QA-Risk-12 — Listing filter status
`listCallbackRequestsSchema.status` accepts comma-separated values and validates each against `Object.values(callbackRequestStatus)` (5 values including `COMPLETED`). A buyer query for `status=COMPLETED` will pass validation but return zero rows since no row ever reaches that state. // Source: validations/callback-request.validations.js:31-38; (no row mutation to COMPLETED anywhere)
