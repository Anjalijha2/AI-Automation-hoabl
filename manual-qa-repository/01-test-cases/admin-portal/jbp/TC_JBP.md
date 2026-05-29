# Test Cases — JBP Management
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-JBP-Management.md
**FSD Reference:** `manual-qa-repository/03-user-manual/admin/fsd-jbp-management.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Source-verified facts

- **No dedicated `jbp.service.js`** exists — all logic inlined in `cp.controller.js` + `admin.controller.js`.
- **Cycle states are only `OPEN | CLOSED`** — no draft, no scheduled.
- **Submission states are only `ACTIVE | EXPIRED`** — no Pending/Rejected on submission itself.
- **Edit-request states**: `PENDING | APPROVED | REJECTED | EXPIRED | CONSUMED` (5 states).
- **Approve requires `editWindow` (hours)** — NOT a "reason" — `adminComment` is nullable. Reject requires `adminComment`.
- **`editableUntil = now + editWindow * 3600000`** — clamped to cycle endDate.
- **WhatsApp `jbplaunchtwo_new`** sent on CP submission, **fire-and-forget** (not awaited) — `cp.controller.js:714`.
- **WhatsApp template has bug**: `${+91}` emits `"91"` instead of `"+91"` — phone numbers in WhatsApp payload missing the plus prefix.
- **LSQ calls block submission** — synchronous before DB write. LSQ outage = JBP submission completely blocked.
- **Auto-CLOSE on list**: any OPEN cycle with `endDate < now` is auto-closed when admin lists cycles.
- **Auto-EXPIRE on list**: any PENDING/APPROVED edit request whose `editableUntil < now` is auto-expired on list call.
- **Approve/Reject sends NO notification to CP** — verified by FSD §8 (No email/SMS dispatch on either action).
- **Edit-request `CONSUMED` state**: set automatically when CP uses approved edit request to resubmit.
- **PUT/DELETE for cycles are commented out** in routes — cycles can only be Created or Closed.
- **`projectId` fallback = 2** (non-prod) when `projectSlug` missing in submitJbp.

---

## Page Layout & Tab Navigation

### ADM_JBP_001 — JBP page loads at /admin/jbp-management

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Admin logged in |
| **Type** | UI |
| **Test Steps** | 1. Click "JBP Management" in sidebar<br>2. Observe URL |
| **Expected Result** | URL is /admin/jbp-management; 3 tabs rendered |
| **Priority** | Critical |

---

### ADM_JBP_002 — Three tabs visible: Cycle Management, Submissions, Edit Requests

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | JBP page loaded |
| **Type** | UI |
| **Test Steps** | 1. Inspect tab bar at top of page |
| **Expected Result** | Tabs labelled: "Cycle Management", "Submissions", "Edit Requests" |
| **Priority** | High |

---

### ADM_JBP_003 — Cycle Management is default active tab

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Just navigated to JBP page |
| **Type** | UI |
| **Test Steps** | 1. Inspect active tab indicator |
| **Expected Result** | "Cycle Management" tab is selected by default |
| **Priority** | Medium |

---

### ADM_JBP_004 — Switch to Submissions tab

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | JBP page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click "Submissions" tab |
| **Expected Result** | Submissions table loads; tab becomes active |
| **Priority** | High |

---

### ADM_JBP_005 — Switch to Edit Requests tab

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | JBP page loaded |
| **Type** | FUNC |
| **Test Steps** | 1. Click "Edit Requests" tab |
| **Expected Result** | Edit Requests list loads; tab becomes active |
| **Priority** | High |

---

## Cycle Management Tab

### ADM_JBP_006 — Cycle list table displays cycle details

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Cycle Management tab active |
| **Type** | UI |
| **Test Steps** | 1. Inspect cycle table columns |
| **Expected Result** | Columns: Cycle Name, Start Date, End Date, Status, Actions |
| **Priority** | High |

---

### ADM_JBP_007 — Status column shows OPEN or CLOSED

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Cycle Management tab active |
| **Type** | UI |
| **Test Steps** | 1. Read distinct Status values |
| **Expected Result** | Values are OPEN or CLOSED only |
| **Priority** | High |

---

### ADM_JBP_008 — Create Cycle button visible

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Cycle Management tab active |
| **Type** | UI |
| **Test Steps** | 1. Locate Create Cycle button |
| **Expected Result** | "+ Create Cycle" button visible at top of tab |
| **Priority** | High |

---

### ADM_JBP_009 — Click Create Cycle opens form modal

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | No OPEN cycle exists |
| **Type** | FUNC |
| **Test Steps** | 1. Click "+ Create Cycle" |
| **Expected Result** | Modal opens with fields: Cycle Name, Start Date, End Date |
| **Priority** | Critical |

---

### ADM_JBP_010 — Create new cycle with valid data

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Create Cycle modal open; no OPEN cycle |
| **Type** | FUNC |
| **Test Steps** | 1. Enter Name "Q3-2026"<br>2. Set Start Date = today<br>3. Set End Date = today + 30 days<br>4. Click Submit |
| **Expected Result** | Cycle created with status OPEN; appears in list |
| **Priority** | Critical |

---

### ADM_JBP_011 — Creating second cycle when one OPEN exists shows error popup

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | One OPEN cycle exists |
| **Type** | BIZ |
| **Test Steps** | 1. Click "+ Create Cycle"<br>2. Fill form and Submit |
| **Expected Result** | "Active Cycle Detected" popup shown; new cycle not created |
| **Priority** | Critical |

---

### ADM_JBP_012 — Create Cycle with empty Name rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Create Cycle modal open; no OPEN cycle |
| **Type** | VAL |
| **Test Steps** | 1. Leave Name empty<br>2. Fill dates<br>3. Submit |
| **Expected Result** | Validation error on Name field |
| **Priority** | High |

---

### ADM_JBP_013 — Create Cycle with End Date before Start Date rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Create Cycle modal open |
| **Type** | VAL |
| **Test Steps** | 1. Set Start Date = 2026-06-01<br>2. Set End Date = 2026-05-15<br>3. Submit |
| **Expected Result** | Validation error: end date must be after start date |
| **Priority** | High |

---

### ADM_JBP_014 — Close Cycle button visible on OPEN cycle row

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | OPEN cycle exists |
| **Type** | UI |
| **Test Steps** | 1. Inspect Actions column on OPEN cycle row |
| **Expected Result** | "Close Cycle" button visible |
| **Priority** | High |

---

### ADM_JBP_015 — Click Close Cycle prompts confirmation

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | OPEN cycle exists |
| **Type** | FUNC |
| **Test Steps** | 1. Click Close Cycle on row |
| **Expected Result** | Confirmation dialog opens with warning about irreversibility |
| **Priority** | Critical |

---

### ADM_JBP_016 — Confirm Close Cycle changes status to CLOSED

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Close Cycle confirmation open |
| **Type** | FUNC |
| **Test Steps** | 1. Click Confirm in dialog |
| **Expected Result** | Cycle status changes from OPEN to CLOSED; cannot be reopened |
| **Priority** | Critical |

---

### ADM_JBP_017 — Cancel Close Cycle keeps status OPEN

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Close Cycle confirmation open |
| **Type** | FUNC |
| **Test Steps** | 1. Click Cancel in dialog |
| **Expected Result** | Dialog closes; cycle remains OPEN |
| **Priority** | High |

---

### ADM_JBP_018 — CLOSED cycle has no actions

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | CLOSED cycle in list |
| **Type** | UI |
| **Test Steps** | 1. Inspect Actions column on CLOSED row |
| **Expected Result** | No Close Cycle button; no reopen option |
| **Priority** | High |

---

## Submissions Tab

### ADM_JBP_019 — Submissions table shows CP submissions

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Submissions tab active; CPs have submitted |
| **Type** | UI |
| **Test Steps** | 1. Inspect Submissions table |
| **Expected Result** | Columns include: CP Name/HV Code, Cycle, Submitted Date, View Details |
| **Priority** | High |

---

### ADM_JBP_020 — Click View on submission shows full 14-field form

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | At least one submission |
| **Type** | UI |
| **Test Steps** | 1. Click View on a submission row |
| **Expected Result** | Detail view shows all 14 fields with CP's submitted values |
| **Priority** | Critical |

---

### ADM_JBP_021 — Submission detail shows Brokerage to be Earned value

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Type** | UI |
| **Test Steps** | 1. Locate Brokerage to be Earned field |
| **Expected Result** | Shows the CP's selected dropdown value |
| **Priority** | High |

---

### ADM_JBP_022 — Submission detail shows Net Booking Commitment

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Type** | UI |
| **Test Steps** | 1. Locate Net Booking Commitment field |
| **Expected Result** | Shows units value selected by CP |
| **Priority** | High |

---

### ADM_JBP_023 — Submission detail shows Manpower number

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Type** | UI |
| **Test Steps** | 1. Locate Manpower to deploy field |
| **Expected Result** | Shows numeric value from CP's slider/number input |
| **Priority** | Medium |

---

### ADM_JBP_024 — Submission detail shows List of activities multi-checkbox values

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Type** | UI |
| **Test Steps** | 1. Locate List of activities |
| **Expected Result** | Shows checked activities from the 14 options |
| **Priority** | Medium |

---

### ADM_JBP_025 — Submission detail shows digital channels checkboxes

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Type** | UI |
| **Test Steps** | 1. Locate Go live on digital |
| **Expected Result** | Shows selected channels (Google/Meta/etc.) |
| **Priority** | Medium |

---

### ADM_JBP_026 — Submission detail shows Total Investment radio choice

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Type** | UI |
| **Test Steps** | 1. Locate Total investment |
| **Expected Result** | Shows selected range from the 5 options |
| **Priority** | Medium |

---

### ADM_JBP_027 — Submission detail shows Yes/No fields

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Type** | UI |
| **Test Steps** | 1. Verify Inserts, Standees, Kiosk, Tele Callers, SMS Blast, WhatsApp Blast, Growth Hub fields |
| **Expected Result** | Each shows Yes or No value as selected by CP |
| **Priority** | Medium |

---

### ADM_JBP_028 — Submission detail shows Registration Commitment count

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Type** | UI |
| **Test Steps** | 1. Locate Registration Commitment field |
| **Expected Result** | Shows numeric count entered by CP |
| **Priority** | Medium |

---

### ADM_JBP_029 — Filter submissions by Cycle

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Submissions tab active |
| **Type** | FUNC |
| **Test Steps** | 1. Apply Cycle filter to a specific cycle |
| **Expected Result** | Submissions table filters to only that cycle's entries |
| **Priority** | High |

---

## Edit Requests Tab

### ADM_JBP_030 — Edit Requests table shows pending requests

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Edit Requests tab active |
| **Type** | UI |
| **Test Steps** | 1. Inspect Edit Requests table |
| **Expected Result** | Columns: CP Name/HV Code, Cycle, Requested Date, Status, Action |
| **Priority** | High |

---

### ADM_JBP_031 — Click request opens revised values for review

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | At least one pending edit request |
| **Type** | UI |
| **Test Steps** | 1. Click view on edit request row |
| **Expected Result** | Detail view shows original vs. revised values per field |
| **Priority** | Critical |

---

### ADM_JBP_032 — [FSD-CORRECTION] Approve edit request requires `editWindow` (hours), NOT a reason

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **BRD/FRD Req** | FSD §4.2 `approveJbpEditRequestSchema` |
| **Pre-conditions** | Edit request detail open |
| **Type** | VAL |
| **Test Steps** | 1. Click Approve<br>2. Submit without `editWindow` |
| **Expected Result** | Validation error on `editWindow` — required integer min 1. `adminComment` is OPTIONAL (nullable, max 550 chars). Previous claim of "reason required for approve" is WRONG. |
| **Priority** | Critical |

---

### ADM_JBP_033 — [FSD-CORRECTION] Approve sets editableUntil but does NOT update submission — NO CP notification

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **BRD/FRD Req** | FSD §5.3 (Approve) / §8 (No notification) |
| **Pre-conditions** | Edit request detail open |
| **Type** | BIZ |
| **Test Steps** | 1. Click Approve<br>2. Enter `editWindow=24` (hours), optional adminComment<br>3. Submit<br>4. Verify CP phone/email/WhatsApp for any notification<br>5. Verify the original JbpSubmission row — is it changed? |
| **Expected Result** | Edit request status → `APPROVED`; `editableUntil = now + 24h` (clamped to cycle endDate 23:59:59.999); `reviewedBy = admin.id`, `reviewedAt = now`. The original submission row is NOT updated — only when the CP resubmits, the old row goes EXPIRED and the new ACTIVE row is inserted with `version = previous.version + 1`. **NO notification dispatched to CP** — verified by source. |
| **Priority** | Critical |

---

### ADM_JBP_034 — Reject edit request requires written reason

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Edit request detail open |
| **Type** | VAL |
| **Test Steps** | 1. Click Reject<br>2. Submit without reason |
| **Expected Result** | Reason required validation; cannot reject without reason |
| **Priority** | High |

---

### ADM_JBP_035 — [FSD-CORRECTION] Reject with adminComment preserves original submission — NO CP notification

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **BRD/FRD Req** | FSD §4.3, §5.3 (Reject), §8 (No notification) |
| **Pre-conditions** | Edit request detail open |
| **Type** | BIZ |
| **Test Steps** | 1. Click Reject<br>2. Enter `adminComment="Insufficient detail"` (required, max 550)<br>3. Submit<br>4. Verify CP notifications |
| **Expected Result** | Edit request status → `REJECTED`; original submission unchanged. `reviewedBy = admin.id`, `reviewedAt = now`. **NO notification dispatched to CP** — verified by FSD §8 (no email/SMS/WhatsApp on reject). |
| **Priority** | High |

---

### ADM_JBP_036 — Filter Edit Requests by status

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Edit Requests tab active |
| **Type** | FUNC |
| **Test Steps** | 1. Filter by status Pending/Approved/Rejected |
| **Expected Result** | Table filters accordingly |
| **Priority** | Medium |

---

## JBP Business Rules & Edge Cases

### ADM_JBP_037 — Closed cycle cannot be reopened

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Cycle is CLOSED |
| **Type** | BIZ |
| **Test Steps** | 1. Inspect CLOSED cycle for any reopen action |
| **Expected Result** | No mechanism to reopen; status irreversibly CLOSED |
| **Priority** | High |

---

### ADM_JBP_038 — No financial impact from cycle close or edit reject

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Cycle just closed; edit request just rejected |
| **Type** | BIZ |
| **Test Steps** | 1. Check Payment Transactions module for any related transactions |
| **Expected Result** | No transactions generated; JBP has no financial side effects |
| **Priority** | Medium |

---

### ADM_JBP_039 — One submission per CP per cycle enforced

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | CP already submitted for current cycle |
| **Type** | BIZ |
| **Test Steps** | 1. Have same CP log into CP Portal<br>2. Check JBP section |
| **Expected Result** | "Add New JBP Entry" button hidden; CP cannot submit twice |
| **Priority** | High |

---

### ADM_JBP_040 — Pagination works on submissions table

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Submissions tab active; >10 entries |
| **Type** | FUNC |
| **Test Steps** | 1. Click Next page |
| **Expected Result** | Next page of submissions loads |
| **Priority** | Medium |

---

### ADM_JBP_052 — Cannot create cycle with Start Date in past beyond reasonable window

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Create Cycle modal open; no OPEN cycle |
| **Type** | EDGE |
| **Test Steps** | 1. Enter Name "Backdated"<br>2. Start Date = 1 year ago<br>3. End Date = today<br>4. Submit |
| **Expected Result** | Either validation error (start date must be ≥ today) OR cycle created but auto-CLOSED on next list call because endDate is also in past — document observed behaviour |
| **Priority** | Medium |

---

### ADM_JBP_053 — Submissions tab is empty when no CPs have submitted

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | A newly created OPEN cycle with zero submissions |
| **Type** | UI |
| **Test Steps** | 1. Switch to Submissions tab<br>2. Filter by the new cycle |
| **Expected Result** | Table shows empty state "No submissions yet" or zero rows; no error |
| **Priority** | Medium |

---

### ADM_JBP_054 — Edit Requests filtered by status EXPIRED shows auto-expired requests

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **BRD/FRD Req** | FSD §5.3 auto-EXPIRE sweep |
| **Pre-conditions** | At least one APPROVED edit request whose editableUntil is in the past |
| **Type** | BIZ |
| **Test Steps** | 1. Open Edit Requests tab (triggers auto-sweep)<br>2. Apply Status filter = EXPIRED |
| **Expected Result** | Previously APPROVED request now appears with status EXPIRED; admin cannot re-approve/re-reject EXPIRED requests |
| **Priority** | High |

---

### ADM_JBP_055 — Pagination works on Edit Requests table

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Edit Requests tab active; >10 entries |
| **Type** | FUNC |
| **Test Steps** | 1. Click Next page in pagination |
| **Expected Result** | Next page of edit requests loads; current filter preserved |
| **Priority** | Medium |

---

## [FSD-CORRECTION] New TCs — JBP source-verified gaps

### ADM_JBP_FSD_041 — [BUG-REF: BUG-JBP-001] WhatsApp template `${+91}` emits "91" (template-string bug)

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP / Notifications |
| **BRD/FRD Req** | FSD §10 / context note: `${+91}` evaluates to numeric `91` |
| **Pre-conditions** | A CP submits a JBP successfully |
| **Type** | INT |
| **Test Steps** | 1. Capture WhatsApp dispatch payload to template `jbplaunchtwo_new`<br>2. Inspect the phone-number placeholder |
| **Expected Result** | The placeholder containing `${+91}<phone>` resolves to `"91<phone>"` — missing the literal `+` sign. JavaScript template literal evaluates `+91` to the numeric value 91. Document as template bug. |
| **Priority** | High |

---

### ADM_JBP_FSD_042 — [FSD-CORRECTION] CP submit WhatsApp is fire-and-forget — submission still succeeds on dispatch failure

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP / Notifications |
| **BRD/FRD Req** | FSD §5.2 / `cp.controller.js:714` |
| **Pre-conditions** | Backend with blocked outbound to botspice WhatsApp |
| **Type** | INT |
| **Test Steps** | 1. CP submits JBP<br>2. Verify DB has new ACTIVE row<br>3. Verify no error returned to CP |
| **Expected Result** | DB row created; CP sees success response. WhatsApp call failed silently in background. Audit log captures success regardless. |
| **Priority** | Medium |

---

### ADM_JBP_FSD_043 — [FSD-CORRECTION] LSQ outage blocks entire JBP submission

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP / API |
| **BRD/FRD Req** | FSD §5.2 / §10 Bug #5 |
| **Pre-conditions** | Mock LSQ to return 500 |
| **Type** | INT |
| **Test Steps** | 1. CP attempts submitJbp<br>2. Observe response and DB state |
| **Expected Result** | LSQ `createActivity` (event 270) AND `captureLead` (CustomObject 14-28) are called BEFORE DB write. Either fails → HTTP 500 to CP, **no DB row inserted**. Document as availability risk. |
| **Priority** | High |

---

### ADM_JBP_FSD_044 — [FSD-CORRECTION] Cycle auto-CLOSE happens on getAllJbpCycles

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP / API |
| **BRD/FRD Req** | FSD §5.1 / `admin.controller.js:2703-2710` |
| **Pre-conditions** | An OPEN cycle exists with endDate in the past |
| **Type** | API |
| **Test Steps** | 1. Confirm cycle is OPEN in DB<br>2. GET /api/v1/admin/jbp-cycles<br>3. Re-query DB |
| **Expected Result** | After the GET call, the cycle's status is now `CLOSED`. Auto-sweep is triggered by the list call itself. |
| **Priority** | High |

---

### ADM_JBP_FSD_045 — [FSD-CORRECTION] Edit-request auto-EXPIRE happens on getJbpEditRequests

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP / API |
| **BRD/FRD Req** | FSD §5.3 / `admin.controller.js:3118-3149` |
| **Pre-conditions** | A PENDING or APPROVED edit request with `editableUntil < now` exists |
| **Type** | API |
| **Test Steps** | 1. Confirm DB state<br>2. GET /api/v1/admin/jbp-edit-requests<br>3. Re-query the edit-request row |
| **Expected Result** | After the GET call, the row's status is `EXPIRED`. |
| **Priority** | High |

---

### ADM_JBP_FSD_046 — [FSD-CORRECTION] CP resubmit consumes APPROVED edit request → CONSUMED

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP / DB |
| **BRD/FRD Req** | FSD §5.2 / §5.3 |
| **Pre-conditions** | CP has APPROVED edit request still within `editableUntil`; existing ACTIVE submission for cycle |
| **Type** | DB |
| **Test Steps** | 1. CP POST /api/v1/cp/jbp with new values<br>2. Inspect DB |
| **Expected Result** | Old `JbpSubmission` → `EXPIRED`. New `JbpSubmission` inserted with `version = previous.version + 1` and status `ACTIVE`. The APPROVED edit request row's status → `CONSUMED`. |
| **Priority** | Critical |

---

### ADM_JBP_FSD_047 — [BUG-REF: BUG-JBP-002] Approve `editableUntil` is clamped to cycle endDate

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **BRD/FRD Req** | FSD §5.4 / `cp.controller.js:1834-1855` |
| **Pre-conditions** | Cycle endDate is in 3 days; admin approves with editWindow=240 (10 days) |
| **Type** | BIZ |
| **Test Steps** | 1. Approve with editWindow=240<br>2. Inspect editableUntil in DB or CP "latest cycle" view |
| **Expected Result** | `editableUntil` is set to cycle `endDate 23:59:59.999`, not `now + 240h`. Cycle endDate caps the window. |
| **Priority** | High |

---

### ADM_JBP_FSD_048 — [FSD-CORRECTION] No PUT or DELETE on cycles (admin cannot edit/delete created cycle)

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP / API |
| **BRD/FRD Req** | FSD §10 Bug #7 / `admin.routes.js:171-172` |
| **Pre-conditions** | A cycle exists |
| **Type** | API |
| **Test Steps** | 1. PUT /api/v1/admin/jbp-cycles/:id with new dates<br>2. DELETE /api/v1/admin/jbp-cycles/:id |
| **Expected Result** | Both calls return 404 (route not registered). Cycles can only be Created or Closed. Document as known limitation. |
| **Priority** | Medium |

---

### ADM_JBP_FSD_049 — [FSD-CORRECTION] Creating new cycle EXPIRES all PENDING/APPROVED edit requests of CLOSED cycles

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP / DB |
| **BRD/FRD Req** | FSD §5.1 / `admin.controller.js:2839-2874` |
| **Pre-conditions** | One OPEN cycle with submissions that have PENDING and APPROVED edit requests |
| **Type** | DB |
| **Test Steps** | 1. Create a new OPEN cycle (which cascades CLOSE on the old)<br>2. Inspect edit-request rows of submissions tied to the now-CLOSED cycle |
| **Expected Result** | All PENDING and APPROVED edit-requests are set to `EXPIRED` inside the same transaction. CONSUMED/REJECTED rows are unaffected. |
| **Priority** | High |

---

### ADM_JBP_FSD_050 — [BUG-REF: BUG-JBP-003] submitJbp NPE on null cycle (jbpCycle.endDate read before null check)

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP / API |
| **BRD/FRD Req** | FSD §10 Bug #1 |
| **Pre-conditions** | CP supplies invalid `jbpCycleId` not in DB |
| **Type** | NEG |
| **Test Steps** | 1. POST /api/v1/cp/jbp with `jbpCycleId=999999` |
| **Expected Result** | Backend throws TypeError on `jbpCycle.endDate` instead of returning HTTP 400 "Cycle not found". Document bug. |
| **Priority** | High |

---

### ADM_JBP_FSD_051 — [FSD-CORRECTION] `submission.updatedAt` is always undefined in admin response

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP / API |
| **BRD/FRD Req** | FSD §10 Bug #4 |
| **Pre-conditions** | Any ACTIVE submission exists |
| **Type** | API |
| **Test Steps** | 1. GET /api/v1/admin/jbp-submissions<br>2. Inspect `updatedAt` field in any row |
| **Expected Result** | `updatedAt` is `undefined` / not present. Model has `updatedAt: false` so column doesn't exist. UI should not depend on it. |
| **Priority** | Low |

---
