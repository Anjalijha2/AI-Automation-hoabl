---
type: feature-spec
portal: Admin Portal
module: JBP Management
updated: 2026-05-11
status: complete
---

# Admin Portal — JBP Management Module Feature Specifications

**Two-sided module:**
- **Admin side:** `/admin/jbp-management` — Create, view, and close JBP cycles; review CP submissions and edit requests.
- **CP Portal side:** `https://uat.xrportal.in/jbp` — Channel Partners submit their Job Board Plan commitment forms for active cycles.

**What is JBP?**
Job Board Plan (JBP) is a structured commitment tracking system where Channel Partners declare their sales targets, marketing investments, and manpower plans for a given cycle period. Admin creates cycles; CPs submit their plans; admin reviews edit requests if CPs need to revise a submitted plan.

---

# Feature 1: View JBP Cycle List

## 1. Objective
Provide admins a complete view of all JBP cycles — past and present — with their status (OPEN or CLOSED) and date ranges, enabling tracking of the commitment pipeline.

## 2. Scope
Default view on `/admin/jbp-management`, "Cycle Management" tab (active by default).

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Page with 3 tabs: **Cycle Management** (default) · Submissions · Edit Requests.
- Date range filter (Start Date → End Date).
- "+ Create Cycle" button.
- Cycle table.

## 5. Table Columns

| Column | Description |
|--------|-------------|
| Cycle Name | Name given at creation |
| Start Date | Cycle start date |
| End Date | Cycle end date |
| Status | OPEN / CLOSED |
| Action | "Close Cycle" button (OPEN cycles) / "Closed" label (CLOSED cycles) |

## 6. Validations & Business Rules
1. Cycles are listed in reverse chronological order (most recent first).
2. CLOSED cycles show no action button — the label "Closed" appears instead.
3. Only OPEN cycles have the "Close Cycle" action button.
4. Only one OPEN cycle is allowed at a time.

## 7. System Actions
- `GET /api/v1/admin/jbp-cycles` with optional `projectId` and date range query params.

## 8. Notifications
None.

## 9. Audit & Logging
None — read-only list view.

## How to Use

1. **Navigate to JBP Management:** Go to `/admin/jbp-management` from the left sidebar.
2. **View the Cycle Management tab** (active by default): All JBP cycles are listed — most recent first.
3. **Read the table:**
   - **Status:** OPEN means CPs can currently submit plans for this cycle. CLOSED means the cycle has ended.
   - **Action column:** OPEN cycles show a "Close Cycle" button. CLOSED cycles show only "Closed" (no button).
4. **Note:** Only one cycle can be OPEN at a time. You must close the current cycle before creating a new one.

---

# Feature 2: Filter Cycles by Date Range

## 1. Objective
Allow admins to narrow the cycle list to a specific date range to locate cycles from past periods without scrolling through the full history.

## 2. Scope
Date range filter at the top of the Cycle Management tab.

## 3. Eligibility / Preconditions
- Admin session required.

## 4. UI Changes
- Two date picker inputs: Start Date and End Date.
- Selecting both dates filters the table immediately.
- Clearing the date inputs restores the full cycle list.

## 5. Behaviour
- Filter shows only cycles whose dates fall within the selected range.
- Clearing both date inputs re-fetches the full cycle list.

## 6. Validations & Business Rules
1. Both Start Date and End Date must be set for the filter to apply.
2. Clearing the filter restores all cycles — wait for the table to reload before asserting.

## 7. System Actions
- `GET /api/v1/admin/jbp-cycles?startDate=<date>&endDate=<date>` — returns cycles within the range.

## 8. Notifications
None.

## 9. Audit & Logging
None for filter queries.

## How to Use

1. **On the Cycle Management tab,** locate the date range filter at the top of the table.
2. **Select a Start Date** using the date picker.
3. **Select an End Date** using the second date picker.
4. **The table filters** to show only cycles that fall within that date range.
5. **Clear filters:** Remove both dates from the pickers to restore the full cycle list. Wait for the table to reload before reading the results.

---

# Feature 3: Create JBP Cycle

## 1. Objective
Allow admins to open a new JBP commitment period by creating a named cycle with a start and end date, making it available for Channel Partners to submit their plans.

## 2. Scope
"+ Create Cycle" button on the Cycle Management tab opens a creation modal.

## 3. Eligibility / Preconditions
- Admin session required.
- No other OPEN cycle should exist (system allows only one OPEN cycle at a time).

## 4. UI Changes
- "+ Create Cycle" button on the Cycle Management tab.
- Clicking opens "Create New Cycle" modal.

## 5. Form Details

| Field | Type | Mandatory | Notes |
|-------|------|-----------|-------|
| Cycle Name | Text | Yes | Descriptive label for this cycle period |
| Start Date | Date picker | Yes | Cycle open date |
| End Date | Date picker | Yes | Cycle close date; must be ≥ Start Date |

**Buttons:**
- "Submit" — creates the cycle
- "Cancel" — closes modal, discards input

## 6. Validations & Business Rules
1. Cycle Name is mandatory.
2. End Date must be on or after Start Date.
3. **One OPEN cycle constraint:** If an OPEN cycle already exists when "Create Cycle" is clicked, an "Active Cycle Detected" popup appears, blocking the creation until the existing cycle is closed first.
4. Once created, the cycle immediately appears in the table with `status = OPEN`.

## 7. System Actions on Submit
1. `POST /api/v1/admin/jbp-cycles` with `{ cycleName, startDate, endDate, projectId }`.
2. New `JbpCycle` record created with `status = 'OPEN'`.
3. Cycle immediately visible in the table.
4. CP Portal: CP's JBP page shows the new cycle as the active cycle with "Add New JBP Entry" button.
5. Toast: *"Cycle created successfully"*

## 8. Notifications
- No automatic notification to CPs on cycle creation (confirm with team if Kaleyra notification is configured).

## 9. Audit & Logging
- Admin user ID, cycle name, start date, end date, creation timestamp logged.

## How to Use

1. **Check that no OPEN cycle exists:** Look at the Cycle Management table. If a cycle with status OPEN already exists, you must close it first before creating a new one.
2. **Click "+ Create Cycle"** on the Cycle Management tab.
3. **Fill in the form:**
   - **Cycle Name:** A descriptive name for this commitment period (e.g., "Q2 2026 JBP Cycle").
   - **Start Date:** The date the cycle opens for CP submissions.
   - **End Date:** The date the cycle closes (must be on or after Start Date).
4. **Click "Submit":** The cycle is created with OPEN status and appears in the table immediately.
5. **Result:** Channel Partners can now see the new cycle in their CP Portal and submit their JBP commitment forms using the "Add New JBP Entry" button.

> **Note:** If an "Active Cycle Detected" popup appears when you click "+ Create Cycle", it means an OPEN cycle already exists. Close it first before proceeding.

---

# Feature 4: Close JBP Cycle

## 1. Objective
Allow admins to manually close an active JBP cycle, ending the submission window for Channel Partners and finalizing all submissions for that cycle.

## 2. Scope
"Close Cycle" button in the Action column of OPEN cycle rows in the Cycle Management table.

## 3. Eligibility / Preconditions
- Cycle must have `status = OPEN`.
- Admin session required.

## 4. UI Changes
- "Close Cycle" button visible on OPEN cycle rows.
- CLOSED cycle rows show only the "Closed" label — no action button.

## 5. Confirmation Dialog

| Element | Content |
|---------|---------|
| Confirm Button | "Yes, Close" |
| Cancel Button | "Cancel" |

## 6. Validations & Business Rules
1. Only OPEN cycles can be closed.
2. Closing requires a confirmation dialog — at least two clicks.
3. Once closed, the cycle cannot be re-opened — this is irreversible.
4. After a cycle is closed, CPs can no longer submit new JBP entries for that cycle.
5. JBP is a commitment tracking module — no financial refunds or payments are triggered by closing a cycle.

## 7. System Actions on Confirm
1. `PUT /api/v1/admin/jbp-cycles/:id/close`
2. Cycle `status` → `'CLOSED'`
3. All associated `JbpSubmission` records for this cycle are finalized.
4. CP Portal: JBP page stops showing this cycle as active; "Add New JBP Entry" button disappears.
5. Toast: *"Cycle closed successfully"*

## 8. Notifications
None — no CP notification when a cycle is closed.

## 9. Audit & Logging
- Admin user ID, cycle ID, cycle name, close timestamp logged.

## How to Use

1. **Find the OPEN cycle** in the Cycle Management table (Status = OPEN).
2. **Click "Close Cycle"** in the Action column for that row.
3. **Confirm in the dialog:** Click "Yes, Close" to proceed.
4. **Result:** The cycle status changes to CLOSED. Channel Partners can no longer submit new JBP entries for this cycle. The CP Portal JBP page removes the "Add New JBP Entry" button. Existing submissions are finalized.

> **Warning:** Closing a cycle is irreversible. Once closed, the cycle cannot be reopened. Ensure all CPs have had sufficient time to submit their plans before closing.

---

# Feature 5: View Submissions

## 1. Objective
Allow admins to review all JBP commitment forms submitted by Channel Partners for a given cycle, enabling tracking of which CPs have committed and what their declared plans are.

## 2. Scope
"Submissions" tab on the JBP Management page.

## 3. Eligibility / Preconditions
- Admin session required.
- At least one JBP cycle must exist with at least one CP submission.

## 4. UI Changes
- "Submissions" tab in the JBP Management page header.

## 5. Behaviour
- Lists all CP submissions across cycles (or filtered by cycle).
- Each submission represents one CP's declared JBP plan for one cycle.
- One submission per CP per cycle.

## 6. Validations & Business Rules
1. Submissions are read-only from this view — admin reviews, not edits.
2. If a CP has submitted an edit request (Feature 6), the latest approved version of their submission is reflected.

## 7. System Actions
- `GET /api/v1/admin/jbp-submissions` with `cycleId` and `projectId` query params.

## 8. Notifications
None.

## 9. Audit & Logging
None — read-only view.

## How to Use

1. **Click the "Submissions" tab** in the JBP Management page header.
2. **View all CP submissions:** Each row represents one Channel Partner's JBP commitment form for a cycle.
3. **Review submission details:** View each CP's declared sales targets, marketing investments, manpower plans, and other commitment fields.
4. **Note:** This view is read-only. Admin can review submissions but cannot edit them directly. If a CP needs to revise their submission, they must submit an Edit Request through the CP Portal (handled in Feature 6).

---

# Feature 6: Manage CP Edit Requests

## 1. Objective
Allow admins to review and approve or reject requests from Channel Partners who wish to modify their already-submitted JBP commitment forms.

## 2. Scope
"Edit Requests" tab on the JBP Management page.

## 3. Eligibility / Preconditions
- Admin session required.
- At least one CP must have submitted an edit request via the CP Portal.

## 4. UI Changes
- "Edit Requests" tab in the JBP Management page header.
- List of pending edit requests with approve and reject actions.

## 5. Edit Request Status Flow

```
Pending ──► Approved  (admin approves — submission updated with new values)
       └──► Rejected  (admin rejects — original submission preserved)
```

## 6. Validations & Business Rules
1. Each edit request has a status: Pending / Approved / Rejected.
2. **Approved:** CP's original JBP submission is updated with the revised values from the edit request.
3. **Rejected:** CP's original submission is preserved unchanged.
4. Admin must provide a reason when approving or rejecting (required field in the action payload).
5. A CP can only have one pending edit request at a time per cycle.

## 7. System Actions on Approve
1. `GET /api/v1/admin/jbp-edit-requests` — loads pending edit requests list.
2. `PUT /api/v1/admin/jbp-edit-requests/:id/approve` with `{ reason: '<text>' }`.
3. `JbpEditRequest.status` → `'Approved'`.
4. `JbpSubmission` updated with revised values from the edit request.
5. CP Portal: CP's submission status updates to reflect the approved changes.

## 7b. System Actions on Reject
1. `PUT /api/v1/admin/jbp-edit-requests/:id/reject` with `{ reason: '<text>' }`.
2. `JbpEditRequest.status` → `'Rejected'`.
3. Original `JbpSubmission` preserved unchanged.

## 8. Notifications
<!-- FSD-CORRECTION 2026-05-25 -->
- **NONE on admin approve/reject.** No backend notification call exists in the approve/reject handlers. CP must poll to discover decision. Only CP-side JBP submit fires a notification (WhatsApp template `jbplaunchtwo_new`). // Source: admin.controller.js (JBP edit-request approve/reject handlers); cp.controller.js:714-730

## 9. Audit & Logging
- Admin user ID, edit request ID, decision (Approved / Rejected), reason, timestamp logged.

## How to Use

1. **Click the "Edit Requests" tab** in the JBP Management page header.
2. **View pending edit requests:** Each row shows a CP's request to revise their submitted JBP form.
3. **To approve an edit request:**
   - Click the "Approve" action on the request.
   - Enter a reason for approval in the required field.
   - Confirm. The CP's original submission is updated with the revised values from the edit request.
4. **To reject an edit request:**
   - Click the "Reject" action on the request.
   - Enter a reason for rejection in the required field.
   - Confirm. The CP's original submission is preserved unchanged.
5. **Result:** The decision is recorded. No automatic notification is sent to the CP — CP must check their JBP submission status to see the outcome.

---

# Feature 7: CP Portal — Submit JBP Commitment Form

## 1. Objective
Allow Channel Partners to declare their sales targets, marketing activities, and resource investment plans for the current active JBP cycle by filling and submitting a structured commitment form through the CP Portal.

## 2. Scope
CP Portal (`https://uat.xrportal.in`) — JBP section visible after CP login. Admin does not interact with this form directly; admin monitors submissions via the Submissions tab.

## 3. Eligibility / Preconditions
- An active (OPEN) JBP cycle must exist — created by admin.
- CP must be logged in to the CP Portal using their registered mobile + OTP.
- CP must not have an existing submission for the current cycle (first-time submit only; edits go through the edit request flow).

## 4. UI Changes (CP Portal)
- Banner: "Current Cycle - `<Cycle Name>`" with ACTIVE badge and "Closes on: `<End Date>`".
- "Your Status": "Not Submitted" / "Submitted".
- Tabs: Current Cycle Entry · JBP History · Edit Requests.
- "Add New JBP Entry" button — visible only when no submission exists for the current cycle.

## 5. JBP Form Fields

| # | Field | Type | Notes |
|---|-------|------|-------|
| 1 | Brokerage to be Earned | Dropdown | 10,00,000 / 25,00,000 / 50,00,000 / 75,00,000 / 1,00,00,000+ |
| 2 | Net Booking Commitment (Units) | Dropdown | Numeric commitment targets |
| 3 | Manpower to deploy | Number + Slider | Default: 1 |
| 4 | List of activities | Multi-checkbox | 14 options: Tele-calling / WhatsApp Blast / Email Blast / SMS Blast / Personal Connect Calling / Digital / Portal Listing / Expo / Society Activity / Corporate Activity / Newspaper Insert / Club Activities / Mall Activity / Association Activity / Others |
| 5 | Go live on digital | Multi-checkbox | Google / Meta / Webpage / Portal Listing / Others — selecting Google reveals a Google Budget text input |
| 6 | Total investment | Radio (5 ranges) | Upto 1 lakh / 1–3 lakhs / 3–5 lakhs / 5–7 lakhs / 7+ lakhs |
| 7 | Inserts Required | Radio Yes/No | Default: No |
| 8 | Standees Required | Radio Yes/No | Default: No |
| 9 | Kiosk Required | Radio Yes/No | Default: No |
| 10 | Tele Callers Required | Radio Yes/No | Default: No |
| 11 | SMS Blast | Radio Yes/No | Default: No |
| 12 | WhatsApp Blast | Radio Yes/No | Default: No |
| 13 | Growth Hub | Radio Yes/No | Default: No |
| 14 | Registration Commitment (Count) | Number | Enter numeric commitment |

## 6. Validations & Business Rules
1. "Add New JBP Entry" button is only visible when the CP has no existing submission for the current cycle.
2. After submission, CP's status changes from "Not Submitted" to "Submitted".
3. Once submitted, the CP cannot directly edit — they must submit an Edit Request (visible under the Edit Requests tab in CP Portal) which admin then approves or rejects.
4. Selecting "Google" under "Go live on digital" reveals an additional Google Budget input field.
5. A valid OPEN cycle must exist — if no cycle is active, the JBP form is not accessible.

## 7. System Actions on Submit
1. New `JbpSubmission` record created for this CP + this cycle combination.
2. All 14 form field values stored in the submission record.
3. CP Portal status updates to "Submitted".
4. Submission visible to admin in the Submissions tab.

## 8. Notifications
- Confirmation shown in CP Portal on successful submission.
- Admin notification (if configured): new CP submission for the current cycle.

## 9. Audit & Logging
- CP user ID, cycle ID, submission ID, all form field values, submission timestamp logged.

## How to Use

*This feature is on the CP Portal (channel partner-facing), not the Admin Portal. Admin reviews completed submissions via the Submissions tab.*

**CP flow to submit a JBP commitment form:**
1. **CP logs in** to the CP Portal (`https://uat.xrportal.in`) using their registered mobile and OTP.
2. **Navigate to JBP:** The current active cycle is shown with a banner — "Current Cycle - [Cycle Name]" with an ACTIVE badge.
3. **Check status:** If "Your Status" shows "Not Submitted", the CP can submit a new form. If "Submitted", the form has already been filled.
4. **Click "Add New JBP Entry"** (visible only if not yet submitted for this cycle).
5. **Fill in the 14-field commitment form:**
   - Brokerage target and unit booking commitment
   - Manpower to deploy
   - List of planned marketing activities (multi-select)
   - Digital platforms to go live on (selecting Google shows a budget input)
   - Total investment range
   - Required support resources (Inserts, Standees, Kiosk, Tele Callers, SMS/WhatsApp Blast, Growth Hub — all Yes/No)
   - Registration commitment count
6. **Submit the form:** The status updates from "Not Submitted" to "Submitted". The submission appears in the admin's Submissions tab.
7. **To request edits after submission:** Go to the "Edit Requests" tab in the CP Portal, submit an edit request with the revised values — admin must approve or reject the request.
