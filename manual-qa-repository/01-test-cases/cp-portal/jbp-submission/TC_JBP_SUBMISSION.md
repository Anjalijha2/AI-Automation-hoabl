# Test Cases — JBP Submission
**Portal:** Channel Partner Portal
**BRD Reference:** CP-BRD-CP-Portal.md / CP-FS-JBP-Submission.md

---

## JBP Page Access

### CP_JBP_001 — Navigate to JBP from menu

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | CP logged in; an OPEN JBP cycle exists |
| **Test Steps** | 1. Click **JBP** in navigation menu |
| **Expected Result** | URL updates to `/jbp`; JBP submission form loads |
| **Priority** | Critical |

---

### CP_JBP_002 — JBP form unavailable when cycle is CLOSED

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | All JBP cycles are CLOSED |
| **Test Steps** | 1. Open `/jbp` |
| **Expected Result** | Form is hidden; message displayed: "No open JBP cycle at this time" |
| **Priority** | Critical |

---

### CP_JBP_003 — Logged-out user cannot access `/jbp`

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | No session |
| **Test Steps** | 1. Navigate directly to `/jbp` |
| **Expected Result** | Redirects to `/login` |
| **Priority** | High |

---

### CP_JBP_004 — One submission per cycle — Add New JBP hidden post submit

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | CP has submitted JBP in the current cycle |
| **Test Steps** | 1. Re-open `/jbp` |
| **Expected Result** | "Add New JBP Entry" button is hidden; existing submission is shown in read-only |
| **Priority** | Critical |

---

## JBP Form Fields

### CP_JBP_005 — Brokerage to be Earned dropdown shows options

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | JBP form open |
| **Test Steps** | 1. Click Brokerage to be Earned dropdown |
| **Expected Result** | Predefined brokerage range options are listed |
| **Priority** | High |

---

### CP_JBP_006 — Net Booking Commitment dropdown shows unit ranges

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | JBP form open |
| **Test Steps** | 1. Click Net Booking Commitment dropdown |
| **Expected Result** | Unit-count options are listed (e.g., 1–5, 6–10, 11–20) |
| **Priority** | High |

---

### CP_JBP_007 — Manpower number input + slider sync

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | JBP form open |
| **Test Steps** | 1. Drag the slider to value 5<br>2. Verify number input updates<br>3. Type 8 into number input<br>4. Verify slider moves |
| **Expected Result** | Slider and number field stay in sync; both reflect the same numeric value |
| **Priority** | Medium |

---

### CP_JBP_008 — Manpower rejects negative numbers

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | JBP form open |
| **Test Steps** | 1. Enter `-3` in Manpower field |
| **Expected Result** | Negative value is rejected; field clamps to 0 or shows validation error |
| **Priority** | Medium |

---

### CP_JBP_009 — Activities multi-checkbox shows 15 options (not 14)

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | JBP form open |
| **Test Steps** | 1. Scroll to List of Activities section<br>2. Count checkboxes |
| **Expected Result** | 15 activity checkboxes (`activityOptions` in cp.validations.js:87-103): Tele-calling, WhatsApp Blast, Email Blast, SMS Blast, Personal Connect Calling, Digital, Portal Listing, Expo, Society Activity, Corporate Activity, Newspaper Insert, Club Activities, Mall Activity, Association Activity, Others. Validation requires min 1, all from this whitelist. |
| **Priority** | High |

---

### CP_JBP_010 — Activities — multiple selections persist

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | JBP form open |
| **Test Steps** | 1. Tick 3 different activity checkboxes<br>2. Scroll away and back |
| **Expected Result** | All 3 remain checked; selection state preserved on scroll |
| **Priority** | Medium |

---

### CP_JBP_011 — Go Live on Digital lists known channels

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | JBP form open |
| **Test Steps** | 1. Scroll to Go Live on Digital section |
| **Expected Result** | Channels listed include at least Google and Meta as checkboxes |
| **Priority** | High |

---

### CP_JBP_012 — Total Investment radio shows 5 ranges

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | JBP form open |
| **Test Steps** | 1. Locate Total Investment radio group |
| **Expected Result** | Exactly 5 mutually-exclusive radio options displayed |
| **Priority** | High |

---

### CP_JBP_013 — Total Investment is mutually exclusive

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Form open |
| **Test Steps** | 1. Select first range<br>2. Then click another range |
| **Expected Result** | Only one option remains selected at any time |
| **Priority** | Medium |

---

### CP_JBP_014 — Yes/No fields render correctly

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | JBP form open |
| **Test Steps** | 1. Verify each Yes/No field: Inserts, Standees, Kiosk, Tele Callers, SMS Blast, WhatsApp Blast, Growth Hub |
| **Expected Result** | Each field offers Yes and No options; defaults are unselected |
| **Priority** | High |

---

### CP_JBP_015 — Registration Commitment accepts numeric only

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Form open |
| **Test Steps** | 1. Try entering letters<br>2. Enter `25` |
| **Expected Result** | Letters rejected; numeric value accepted |
| **Priority** | Medium |

---

## Validation and Submission

### CP_JBP_016 — Submit empty form rejected

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | All fields empty |
| **Test Steps** | 1. Click Submit |
| **Expected Result** | All required fields flagged with errors; submission rejected |
| **Priority** | Critical |

---

### CP_JBP_017 — Submit with one required field missing

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | All fields filled except Brokerage to be Earned |
| **Test Steps** | 1. Click Submit |
| **Expected Result** | Inline error on Brokerage field; submission rejected |
| **Priority** | High |

---

### CP_JBP_018 — Successful JBP submission

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | All 14 fields completed validly; cycle OPEN; CP has no prior submission this cycle |
| **Test Steps** | 1. Click Submit<br>2. Wait for response |
| **Expected Result** | JbpSubmission created with status=ACTIVE, version=1; CP redirected to `/jbp/thank-you` |
| **Priority** | Critical |

---

### CP_JBP_019 — Thank You page renders after submission

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Submission successful |
| **Test Steps** | 1. Observe page after submit |
| **Expected Result** | URL is `/jbp/thank-you`; Thank You message displayed; back link/CTA visible |
| **Priority** | High |

---

### CP_JBP_020 — Duplicate submission attempt is blocked

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | CP already submitted JBP this cycle |
| **Test Steps** | 1. Re-open `/jbp`<br>2. Try to submit again |
| **Expected Result** | Existing submission shown read-only; no new form is offered; submit path blocked |
| **Priority** | Critical |

---

## View Submitted JBP

### CP_JBP_021 — Submitted JBP shown read-only on revisit

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | CP has an active submission |
| **Test Steps** | 1. Navigate to `/jbp` |
| **Expected Result** | All 14 fields displayed in read-only mode with previously-submitted values |
| **Priority** | Critical |

---

### CP_JBP_022 — Submission version is displayed

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Active submission exists |
| **Test Steps** | 1. Open `/jbp`<br>2. Read the version indicator |
| **Expected Result** | Version number is visible (e.g., "Version 1"); status shown as ACTIVE |
| **Priority** | Medium |

---

### CP_JBP_023 — Approved edit request increments version to 2

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | An admin-approved edit request exists for the CP |
| **Test Steps** | 1. Open `/jbp`<br>2. Read version field |
| **Expected Result** | Version shows 2; the older v1 is marked EXPIRED in backend, hidden or labelled in UI |
| **Priority** | High |

---

## Edit Request Flow

### CP_JBP_024 — Request Edit option visible after submission

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | CP has an active submission; cycle still OPEN |
| **Test Steps** | 1. Open `/jbp`<br>2. Look for Request Edit action |
| **Expected Result** | Request Edit button/link is visible |
| **Priority** | High |

---

### CP_JBP_025 — Submit edit request with reason and revised values

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Edit request form open |
| **Test Steps** | 1. Fill in "Changes requested" textarea<br>2. Provide revised values<br>3. Submit |
| **Expected Result** | Edit request created; awaiting admin review; CP notified of pending status |
| **Priority** | High |

---

### CP_JBP_026 — Edit request blocked when cycle is CLOSED

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Cycle has been CLOSED after CP submission |
| **Test Steps** | 1. Attempt to open Request Edit |
| **Expected Result** | Action is disabled or rejected; user informed that the cycle is closed |
| **Priority** | High |

---

### CP_JBP_027 — Rejected edit request leaves original submission intact (no push notification)

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Admin has rejected the CP's edit request with `adminComment` |
| **Test Steps** | 1. CP polls `/jbp-cycles` or `/jbp-edit-requests`<br>2. Open `/jbp` |
| **Expected Result** | Original v1 submission remains ACTIVE. JbpEditRequest.status = REJECTED, adminComment visible. **NO push notification sent on approve/reject** (JBP-CP-005, admin.controller.js:3262-3365). CP must poll to discover state changes. |
| **Priority** | Medium |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/cp-portal/fsd-jbp-submission.md`

### Corrections to existing TCs
- **CP_JBP_001** — No `/jbp` backend route. CP frontend orchestrates: `GET /api/v1/cp/jbp-cycles?projectSlug=`, `POST /api/v1/cp/jbp`, `GET /api/v1/cp/jbp-history`, `POST /api/v1/cp/jbp-edit-requests`, `GET /api/v1/cp/jbp-edit-requests`. All require `protect + restrictTo('cp')`.
- **CP_JBP_002** — Cycle phase logic: `UPCOMING` (OPEN + startDate > today), `ACTIVE` (OPEN + start ≤ today ≤ end), `EXPIRED` (CLOSED or endDate < today). `canSubmit = (phase==='ACTIVE') && !existingSubmission` (cp.controller.js:1755-1763, 1891).
- **CP_JBP_005** — `brokerageAmount` is a free string ≤255 chars (nullable), NOT a dropdown with predefined ranges (cp.validations.js:163).
- **CP_JBP_006** — `netBookingCommitment` is a positive integer ≤500000000, digits-only (cp.validations.js:165-173). NOT a dropdown.
- **CP_JBP_007 / CP_JBP_008** — `manpower` is integer 1..100 required. Negative values rejected.
- **CP_JBP_009** — 15 activities, not 14 (corrected above).
- **CP_JBP_011** — `digitalPlatforms` whitelist: `['google', 'meta', 'webpage', 'portal', 'others']` (5 options). `platformBudgets[platform]` must be digits-only 1..500000000 for each selected platform.
- **CP_JBP_012** — `investmentOptions` 5 values: `'Upto 1 lakhs', '1 to 3 lakhs', '3 to 5 lakhs', '5 to 7 lakhs', '7+ lakhs'`.
- **CP_JBP_014** — Yes/No fields actually stored as INTEGER COUNT (>0=Yes) for Inserts/Standees/Kiosk/Telecallers/SmsBlast/WhatsappBlast. Only `growthHub` is boolean.
- **CP_JBP_018** — Success returns 201, message "JBP submitted successfully". Triggers Botspice WhatsApp template `jbplaunchtwo_new` (15 variables, NOT Kaleyra). 
- **CP_JBP_023** — Versioning: prior ACTIVE → EXPIRED, edit request → CONSUMED, new row `version = prior.version + 1, status='ACTIVE'`. EXPIRED row remains in DB (BUG-CP-006 — `isJbpSubmitted` count includes EXPIRED rows).
- **CP_JBP_025** — Edit request: 72-hour window (`editableUntil = now + 72h`). Must include `projectSlug`, `jbpSubmissionId`, `reason` (≤255), `explanation` (≤550 nullable). Status PENDING → APPROVED/REJECTED (admin) → CONSUMED (CP saves) or EXPIRED (display-only when editableUntil < now or cycle CLOSED — cp.controller.js:2197-2207).
- **CP_JBP_027** — Reframed: NO push notification on approve/reject.

### New TCs added below

### CP_JBP_028 — Submit without prospectId returns 400

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | CP with `users.prospect_id IS NULL` |
| **Test Steps** | 1. `POST /api/v1/cp/jbp` valid body |
| **Expected Result** | 400 "Something went wrong. Please try again." (cp.controller.js:541-543). Generic message — CP has no LSQ linkage. |
| **Priority** | High |

---

### CP_JBP_029 — Submit with non-existent jbpCycleId crashes with NPE (BUG)

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Valid prospectId; invalid jbpCycleId |
| **Test Steps** | 1. `POST /api/v1/cp/jbp` body with bogus jbpCycleId |
| **Expected Result** | KNOWN BUG (JBP-CP-001): NPE on `jbpCycle.endDate` BEFORE null check — outer catch returns generic 500 "Failed to submit JBP. Please try again." (cp.controller.js:545-555). Should be specific 400. |
| **Priority** | High |

---

### CP_JBP_030 — Submit to CLOSED cycle returns 400

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | jbpCycleId with `status='CLOSED'` OR `endDate < today` |
| **Test Steps** | 1. `POST /jbp` |
| **Expected Result** | 400 "JBP cycle is not open to accept submission" (cp.controller.js:553-555). |
| **Priority** | High |

---

### CP_JBP_031 — Edit window expired returns 403

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Approved edit request with `editableUntil < now` |
| **Test Steps** | 1. `POST /jbp` again |
| **Expected Result** | 403 "Your edit window has expired. Please request a new edit approval" (cp.controller.js:575-580). |
| **Priority** | High |

---

### CP_JBP_032 — Resubmit without approved edit returns 400

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | ACTIVE submission exists, no APPROVED edit request |
| **Test Steps** | 1. `POST /jbp` |
| **Expected Result** | KNOWN BUG (JBP-CP-002): may NPE on `approvedEditRequest.editableUntil` BEFORE the null check that returns "Edit not allowed without approval" (cp.controller.js:568-584). Document. |
| **Priority** | High |

---

### CP_JBP_033 — LSQ createActivity failure halts submission before DB write

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Mock LSQ createActivity to return non-Success or missing RelatedId |
| **Test Steps** | 1. `POST /jbp` |
| **Expected Result** | 500 "Failed to create Activity in LeadSquared"; NO `jbp_submissions` row created (cp.controller.js:623-637). |
| **Priority** | High |

---

### CP_JBP_034 — LSQ captureLead failure after activity success leaves orphan LSQ activity

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | createActivity returns success; captureLead fails |
| **Test Steps** | 1. `POST /jbp`<br>2. Retry on failure |
| **Expected Result** | 500 returned; DB row NOT created. LSQ activity already created — retry will duplicate (JBP-CP-009, idempotency gap). |
| **Priority** | Medium |

---

### CP_JBP_035 — Submission triggers Botspice WhatsApp jbplaunchtwo_new (15 vars)

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Successful submit |
| **Test Steps** | 1. `POST /jbp` valid<br>2. Inspect Botspice outbound |
| **Expected Result** | Template `jbplaunchtwo_new` with 15 positional variables (firstName, brokerage, netBooking, manpower, activities, platforms, investment, inserts, standees, kiosk, telecallers, smsBlast, whatsappBlast, growthHub, regCommitment). Phone formatted as `"91<phone>"` (no `+`, JBP-CP-003 BUG). Fire-and-forget — failures swallowed (JBP-CP-004). |
| **Priority** | High |

---

### CP_JBP_036 — Project ownership NOT enforced (BUG)

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | CP not assigned to project P |
| **Test Steps** | 1. `POST /jbp` with `projectSlug` of P |
| **Expected Result** | Succeeds — no membership/assignment check between user and project (JBP-CP-010, cp.controller.js:529-535). Document. |
| **Priority** | Medium (Security) |

---

### CP_JBP_037 — Duplicate edit request for same submission returns 409

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Submission S with PENDING edit request |
| **Test Steps** | 1. `POST /api/v1/cp/jbp-edit-requests` for S again |
| **Expected Result** | 409 "An edit request is already pending for this submission" (cp.controller.js:2046-2050). |
| **Priority** | High |

---

### CP_JBP_038 — Already-approved-and-editable returns 409 on new request

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Submission S has APPROVED edit request, still editable |
| **Test Steps** | 1. `POST /jbp-edit-requests` for S |
| **Expected Result** | 409 "You already have an approved edit request. Use it to edit your submission." (cp.controller.js:2052-2059). |
| **Priority** | Medium |

---

### CP_JBP_039 — Edit request for CLOSED cycle rejected

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Cycle CLOSED |
| **Test Steps** | 1. `POST /jbp-edit-requests` |
| **Expected Result** | 400 "Edit requests are not allowed for CLOSED cycles" (cp.controller.js:2042-2044). |
| **Priority** | High |

---

### CP_JBP_040 — isJbpSubmitted login flag includes EXPIRED rows (BUG)

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | CP submitted in cycle N-1 (EXPIRED), not submitted in cycle N |
| **Test Steps** | 1. Login → inspect `isJbpSubmitted` |
| **Expected Result** | KNOWN BUG: returns `true` even though current cycle has no submission. Count query has no cycle/status filter (JBP-CP-006, cp.controller.js:452). |
| **Priority** | Medium |
