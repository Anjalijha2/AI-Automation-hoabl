# Test Cases — Callback Request
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Callback-Request.md

---

## Callback — Entry & Modal Open

### BYR_CB_001 — Request Callback button visible on portal

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Buyer logged in |
| **Type** | UI |
| **Test Steps** | 1. Look for Request Callback button on dashboard / floating CTA |
| **Expected Result** | Button visible and clickable |
| **Priority** | High |

---

### BYR_CB_002 — Click Request Callback opens modal

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Button visible |
| **Type** | FUNC |
| **Test Steps** | 1. Click Request Callback |
| **Expected Result** | Modal/dialog opens with form fields |
| **Priority** | Critical |

---

### BYR_CB_003 — Modal title clearly identifies feature

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Type** | UI |
| **Test Steps** | 1. Inspect modal title |
| **Expected Result** | Title reads "Request Callback" or "Schedule VC" |
| **Priority** | Medium |

---

### BYR_CB_004 — Backdrop click does not accidentally submit

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Type** | FUNC |
| **Test Steps** | 1. Click backdrop outside modal |
| **Expected Result** | Modal either closes or stays — never submits |
| **Priority** | Medium |

---

## Callback — Form Fields

### BYR_CB_005 — Description field is optional

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Type** | VAL |
| **Test Steps** | 1. Inspect Description field; check for required asterisk |
| **Expected Result** | No asterisk; field marked optional |
| **Priority** | Medium |

---

### BYR_CB_006 — Description supports multiline input

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Type** | FUNC |
| **Test Steps** | 1. Type a multi-line description |
| **Expected Result** | Textarea accepts newlines; height grows or scrolls |
| **Priority** | Low |

---

### BYR_CB_007 — Description character limit enforced

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Type** | VAL |
| **Test Steps** | 1. Paste text exceeding 500 chars |
| **Expected Result** | Input capped at the configured limit; counter updates |
| **Priority** | Medium |

---

### BYR_CB_008 — Preferred date field present

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Type** | UI |
| **Test Steps** | 1. Inspect form |
| **Expected Result** | Date input visible with calendar icon |
| **Priority** | High |

---

### BYR_CB_009 — Click date opens calendar picker

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Date input visible |
| **Type** | FUNC |
| **Test Steps** | 1. Click date input |
| **Expected Result** | Calendar widget opens |
| **Priority** | High |

---

### BYR_CB_010 — Past dates greyed out / unselectable

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Calendar open |
| **Type** | VAL |
| **Test Steps** | 1. Try selecting yesterday's date |
| **Expected Result** | Past dates disabled / not clickable |
| **Priority** | High |

---

### BYR_CB_011 — Today and future dates selectable

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Calendar open |
| **Type** | FUNC |
| **Test Steps** | 1. Click today<br>2. Click date 5 days ahead |
| **Expected Result** | Both selectable and highlight on click |
| **Priority** | High |

---

### BYR_CB_012 — Preferred time field present

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Type** | UI |
| **Test Steps** | 1. Inspect time input/picker |
| **Expected Result** | Time picker (hour:minute) visible |
| **Priority** | High |

---

### BYR_CB_013 — Time picker selects hour and minute

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Time picker open |
| **Type** | FUNC |
| **Test Steps** | 1. Select hour 14<br>2. Select minute 30 |
| **Expected Result** | Both values reflected in input as "14:30" or similar format |
| **Priority** | High |

---

## Callback — Submission

### BYR_CB_014 — Submit button visible

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Type** | UI |
| **Test Steps** | 1. Inspect Submit button |
| **Expected Result** | Submit CTA rendered at bottom of modal |
| **Priority** | High |

---

### BYR_CB_015 — Submit with all fields blank still succeeds (per FS — all optional)

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open, no fields filled |
| **Type** | VAL |
| **Test Steps** | 1. Click Submit |
| **Expected Result** | Request submitted per spec (all fields are optional in BUYER-FS-Callback-Request §1.4) |
| **Priority** | Medium |

---

### BYR_CB_016 — Submit with all fields filled succeeds

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal with description, date and time entered |
| **Type** | FUNC |
| **Test Steps** | 1. Click Submit |
| **Expected Result** | Modal closes; success toast/banner shown; request created with status REQUESTED |
| **Priority** | Critical |

---

### BYR_CB_017 — Request linked to current registration

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Submission complete |
| **Type** | DB |
| **Test Steps** | 1. Inspect backend record |
| **Expected Result** | CallbackRequest row created and tied to buyer's registrationId |
| **Priority** | High |

---

### BYR_CB_018 — Least-loaded assigns to available SM (NOT round-robin)

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Submission complete, at least one SM with `isActive=true, isAvailable=true` |
| **Type** | BIZ |
| **Test Steps** | 1. Verify SM assignment |
| **Expected Result** | Request assigned to SM with fewest active (status NOT IN `[CONFIRMED]`) requests; tie-broken by oldest `lastRequestAssignedAt`, then by `id`. Uses `FOR UPDATE` row lock. NOTE: `assignManagerRoundRobin` exists but is DEAD CODE — `ASSIGNMENT_METHOD='least-loaded'` is hardcoded (services/callback-request.service.js:13, KB-CB-02). Sticky-manager rule: previous SM reused if still active+available (BR-CB-05). |
| **Priority** | Critical |

---

### BYR_CB_019 — Request shows status REQUESTED initially

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Submission complete |
| **Type** | BIZ |
| **Test Steps** | 1. Inspect request status |
| **Expected Result** | Status = REQUESTED |
| **Priority** | High |

---

### BYR_CB_020 — Buyer notified when SM schedules the meeting

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | SM schedules call on SM Portal |
| **Type** | INT |
| **Test Steps** | 1. Check buyer notification channel (SMS/WhatsApp/in-app) |
| **Expected Result** | Notification received with scheduled time |
| **Priority** | High |

---

## Callback — Cancel / Close

### BYR_CB_021 — X (close icon) closes modal without submitting

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open with some data entered |
| **Type** | FUNC |
| **Test Steps** | 1. Click X |
| **Expected Result** | Modal closes; no API call; no record created |
| **Priority** | High |

---

### BYR_CB_022 — Cancel button (if present) closes without submit

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open with some data |
| **Type** | FUNC |
| **Test Steps** | 1. Click Cancel |
| **Expected Result** | Modal closes; no submission |
| **Priority** | Medium |

---

### BYR_CB_023 — ESC key closes modal

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Type** | FUNC |
| **Test Steps** | 1. Press ESC |
| **Expected Result** | Modal closes |
| **Priority** | Low |

---

### BYR_CB_046 — Close after partial entry shows no confirmation dialog

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal with date filled but not submitted |
| **Type** | FUNC |
| **Test Steps** | 1. Click X |
| **Expected Result** | Modal closes immediately without "discard changes?" prompt; no API call; entered data not persisted |
| **Priority** | Low |

---

### BYR_CB_047 — Reopening modal after close starts with empty form

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal closed after partial entry |
| **Type** | FUNC |
| **Test Steps** | 1. Click Request Callback again |
| **Expected Result** | Modal opens with all fields cleared; no leftover data from previous open |
| **Priority** | Medium |

---

### BYR_CB_048 — Modal cannot be submitted twice via double-click

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Form filled validly |
| **Type** | FUNC |
| **Test Steps** | 1. Double-click Submit rapidly |
| **Expected Result** | Only one API call made; button disabled on first click; no duplicate row created in DB |
| **Priority** | High |

---

### BYR_CB_049 — Click X during submission allowed only after API returns

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Submit clicked, API in flight |
| **Type** | FUNC |
| **Test Steps** | 1. Try clicking X during submission |
| **Expected Result** | X disabled or close blocked until response; prevents race where buyer can dismiss but row is created |
| **Priority** | Medium |

---

### BYR_CB_050 — Close after successful submit shows confirmation toast

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Form submitted successfully |
| **Type** | UI |
| **Test Steps** | 1. Modal auto-closes<br>2. Observe page |
| **Expected Result** | Success toast/banner "Callback requested successfully"; toast auto-dismisses after a few seconds |
| **Priority** | Medium |

---

## Callback — Feedback Flow (Token-Based)

### BYR_CB_024 — Feedback URL accessible without login

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | SM completed call and submitted feedback; buyerFeedbackToken generated |
| **Type** | FUNC |
| **Test Steps** | 1. Open `/call-feedback/<token>` in a fresh browser (no session) |
| **Expected Result** | Feedback page renders without requiring login |
| **Priority** | Critical |

---

### BYR_CB_025 — Feedback URL with invalid token shows error

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Random/invalid token |
| **Type** | NEG |
| **Test Steps** | 1. Open `/call-feedback/<bad-token>` |
| **Expected Result** | "Invalid or expired link" message; no form rendered |
| **Priority** | High |

---

### BYR_CB_026 — Feedback URL token cannot be reused

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Feedback already submitted with token |
| **Type** | BIZ |
| **Test Steps** | 1. Reopen same token URL |
| **Expected Result** | Token marked used; "already submitted" message shown |
| **Priority** | High |

---

### BYR_CB_027 — Call rating field mandatory

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Feedback page open |
| **Type** | VAL |
| **Test Steps** | 1. Try Submit without rating |
| **Expected Result** | Validation error; submission blocked |
| **Priority** | Critical |

---

### BYR_CB_028 — Comments field optional

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Feedback page open |
| **Type** | VAL |
| **Test Steps** | 1. Submit with rating but no comments |
| **Expected Result** | Submission succeeds |
| **Priority** | Medium |

---

### BYR_CB_029 — Submission sets isBuyerFeedbackSubmitted = true

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Feedback submitted |
| **Type** | DB |
| **Test Steps** | 1. Inspect backend flag |
| **Expected Result** | `isBuyerFeedbackSubmitted = true` persisted |
| **Priority** | High |

---

### BYR_CB_030 — Request STAYS at CONFIRMED (COMPLETED unreachable — schema drift)

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | SM feedback already complete + buyer feedback just submitted |
| **Type** | BIZ |
| **Test Steps** | 1. Verify request status |
| **Expected Result** | Status = `CONFIRMED` — NOT `COMPLETED`. `COMPLETED` ENUM is unreachable; SM service explicitly falls back with warn log "Callback request status fallback to CONFIRMED: COMPLETED enum is not available in DB" (KB-CB-01, services/callback-request-sm.service.js:78-87). DO NOT assert COMPLETED. |
| **Priority** | High |

---

## Callback — Negative & Edge Cases

### BYR_CB_031 — No SM available: row created silently with manager_id=NULL (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | All SMs have `isActive=false` OR `isAvailable=false` |
| **Type** | NEG |
| **Test Steps** | 1. Submit callback request<br>2. Inspect DB row |
| **Expected Result** | 201 success returned to buyer; `callback_requests` row has `manager_id=NULL`, status=`REQUESTED`. Customer-acknowledgement WhatsApp `expert_customer_inform` still fires. NO automated reassignment cron exists — row may persist indefinitely (KB-CB-03, services/callback-request.service.js:116-121, 205-216). Document as silent-failure BUG. |
| **Priority** | High |

---

### BYR_CB_032 — Modal data persists if user toggles browser tabs briefly

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal with partial data |
| **Type** | EDGE |
| **Test Steps** | 1. Switch tabs<br>2. Return |
| **Expected Result** | Modal still open with data intact |
| **Priority** | Low |

---

### BYR_CB_051 — Submit with missing requestedAt rejected by backend

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | API access |
| **Type** | NEG |
| **Test Steps** | 1. `POST /api/v1/user/callback-requests` body `{ registrationNumber }` (no requestedAt) |
| **Expected Result** | 400 Yup validation error — `requestedAt` is required per FSD correction on BYR_CB_005 |
| **Priority** | High |

---

### BYR_CB_052 — Submit with missing registrationNumber rejected by backend

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | API access |
| **Type** | NEG |
| **Test Steps** | 1. `POST /callback-requests` body `{ requestedAt: <future> }` (no registrationNumber) |
| **Expected Result** | 400 Yup validation error — `registrationNumber` required |
| **Priority** | High |

---

### BYR_CB_053 — Network failure on submit shows retry option

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal filled, network offline |
| **Type** | NEG |
| **Test Steps** | 1. Click Submit |
| **Expected Result** | Error toast "Submission failed, please retry"; modal stays open with values preserved; Submit re-enabled |
| **Priority** | High |

---

### BYR_CB_054 — Date picker disables Sundays/weekends if configured

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Calendar configured to disable weekends (verify product rule) |
| **Type** | EDGE |
| **Test Steps** | 1. Open calendar<br>2. Try selecting next Sunday |
| **Expected Result** | If product rule applies: Sunday greyed/unselectable. If not: Sunday selectable. Document actual behaviour. |
| **Priority** | Low |

---

### BYR_CB_055 — Time picker hours limited to business window if configured

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Time picker open |
| **Type** | EDGE |
| **Test Steps** | 1. Inspect hour options |
| **Expected Result** | Either 24h list available OR limited to business hours (e.g., 9 AM–8 PM). Document actual range. |
| **Priority** | Low |

---

### BYR_CB_056 — Description with HTML/script tags sanitised on submit

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Modal open |
| **Type** | NEG |
| **Test Steps** | 1. Enter `<script>alert('x')</script>` in Description<br>2. Submit |
| **Expected Result** | Either rejected by validator or stored as escaped string; no script execution in SM portal or buyer portal viewing of the request |
| **Priority** | High (Security) |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/buyer-portal/fsd-callback-request.md`

### Corrections to existing TCs
- **BYR_CB_005 / BYR_CB_008-013 / BYR_CB_015** — `registrationNumber` and `requestedAt` are BOTH REQUIRED by `createCallbackRequestSchema` (validations/callback-request.validations.js:4-8). Description is optional with max 500 chars. NOT all fields optional — TC_015 (submit blank) MUST fail with 400.
- **BYR_CB_018** — Assignment is "least-loaded" NOT round-robin. Round-robin is dead code.
- **BYR_CB_020** — SM scheduling triggers WhatsApp template `expert_meeting_link` with params `[firstName, formattedTime, meetingLink]` via Botspice (NOT Kaleyra). No SMS or email on this transition.
- **BYR_CB_027** — `overallSatisfaction` integer 1..5 required; `queryResolvedStatus`, `callPunctualityStatus`, `callQualityAv`, `nextStepsClarity`, `interestLevel`, `followupCallRequired` ALL required (validations/callback-request.validations.js:166-207). Comments (`improvementComments`) optional max 900.
- **BYR_CB_030** — Status terminates at `CONFIRMED`, NOT `COMPLETED`. ENUM has COMPLETED but transition map blocks it (KB-CB-01).
- **BYR_CB_031** — Reframed as silent-failure BUG.

### New TCs added below

### BYR_CB_033 — Duplicate active callback for same registration rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Existing callback for registration R with status != CONFIRMED |
| **Type** | NEG |
| **Test Steps** | 1. `POST /api/v1/user/callback-requests` with registrationNumber=R |
| **Expected Result** | 400 "A callback request already exists for this registration. Please use the existing request." (BR-CB-01) |
| **Priority** | High |

---

### BYR_CB_034 — Registration not owned by buyer returns 404

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | registrationNumber R belongs to another user |
| **Type** | API |
| **Test Steps** | 1. `POST /callback-requests` with R |
| **Expected Result** | 404 "Registration not found or does not belong to you" (BR-CB-02) |
| **Priority** | Critical (Security) |

---

### BYR_CB_035 — requestedAt in the past rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Valid registration |
| **Type** | NEG |
| **Test Steps** | 1. `POST /callback-requests` body `{ registrationNumber, requestedAt: <yesterday> }` |
| **Expected Result** | 400 Yup validation error — date must be future (validations/callback-request.validations.js:6) |
| **Priority** | High |

---

### BYR_CB_036 — Reschedule allowed only when status=REQUESTED

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Callback at status `SCHEDULED` (SM has scheduled it) |
| **Type** | BIZ |
| **Test Steps** | 1. `PUT /api/v1/user/callback-requests/:id/reschedule` body `{ requestedAt: <future> }` |
| **Expected Result** | 400 "Cannot reschedule a request that is already SCHEDULED. Please contact your sales manager." (BR-CB-07, services/callback-request.service.js:289-310) |
| **Priority** | High |

---

### BYR_CB_037 — No buyer-side cancellation endpoint

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Callback created |
| **Type** | API |
| **Test Steps** | 1. `DELETE /api/v1/user/callback-requests/:id` |
| **Expected Result** | 404 — route does not exist (BR-CB-08, routes/user/callback-request.routes.js). Buyer has no way to cancel. Document as functional GAP. |
| **Priority** | High |

---

### BYR_CB_038 — Buyer feedback eligibility requires CONFIRMED + isSmFeedbackSubmitted=1

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Callback at status `SCHEDULED` (not CONFIRMED yet) |
| **Type** | BIZ |
| **Test Steps** | 1. `POST /api/v1/user/callback-requests/:id/feedback` body with valid fields |
| **Expected Result** | 400 "Feedback can only be submitted for completed callback requests" (BR-CB-10, services/callback-request.service.js:399-401) |
| **Priority** | High |

---

### BYR_CB_039 — In-app feedback duplicate submission blocked

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Buyer already submitted feedback for callback C |
| **Type** | NEG |
| **Test Steps** | 1. `POST /:id/feedback` for C again |
| **Expected Result** | Rejected — uniqueness check on `(call_request_id, role='BUYER')` (BR-CB-10 #4, services/callback-request.service.js:403-412) |
| **Priority** | High |

---

### BYR_CB_040 — Public token feedback link eligibility differs from in-app (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Callback at status `CONFIRMED`, `isSmFeedbackSubmitted=0` |
| **Type** | BIZ |
| **Test Steps** | 1. In-app: `POST /:id/feedback`<br>2. Public: `POST /api/v1/callback-feedback/:code` |
| **Expected Result** | In-app rejected (requires isSmFeedbackSubmitted=1); Public accepted (only checks CONFIRMED) — eligibility window mismatch BUG (KB-CB-09, controllers/callback-request.controller.js:184-187). |
| **Priority** | Medium |

---

### BYR_CB_041 — Followup datetime required when followupCallRequired=true

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Eligible feedback window |
| **Type** | VAL |
| **Test Steps** | 1. Submit feedback with `followupCallRequired:true` but no `followupPreferredDatetime` |
| **Expected Result** | 400 Yup conditional validation error (BR-CB-12) |
| **Priority** | High |

---

### BYR_CB_042 — Improvement comments validator caps at 900, error message says 1000 (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback Feedback |
| **Pre-conditions** | Eligible feedback window |
| **Type** | VAL |
| **Test Steps** | 1. Submit feedback with `improvementComments` = 950 chars |
| **Expected Result** | 400 with error "must be at most 1000 characters" (incorrect message; actual cap is 900 — KB-CB-05) |
| **Priority** | Low |

---

### BYR_CB_043 — Description column 750 vs validator 500 mismatch

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | API access |
| **Type** | DB |
| **Test Steps** | 1. `POST /callback-requests` body `description=<600 chars>` |
| **Expected Result** | 400 rejected by validator at 500. DB column allows 750 — internal writers could bypass (KB-CB-04). |
| **Priority** | Low |

---

### BYR_CB_044 — Buyer query status=COMPLETED returns 0 rows

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Buyer has callbacks at various statuses |
| **Type** | API |
| **Test Steps** | 1. `GET /api/v1/user/callback-requests?status=COMPLETED` |
| **Expected Result** | 200 with empty array — `COMPLETED` is in validator whitelist (5 ENUM values) but no row ever reaches that state (QA-Risk-12). Document UI implication. |
| **Priority** | Low |

---

### BYR_CB_045 — Create-callback WhatsApp uses Botspice expert_customer_inform

| Field | Value |
|-------|-------|
| **Module** | BYR – Callback |
| **Pre-conditions** | Valid create request |
| **Type** | INT |
| **Test Steps** | 1. `POST /callback-requests` successfully<br>2. Inspect outbound WhatsApp logs |
| **Expected Result** | WhatsApp template `expert_customer_inform` with params `[customerName]` dispatched via Botspice (NOT Kaleyra). Fire-and-forget — failure does not block 201. |
| **Priority** | Medium |
