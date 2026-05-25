# Test Cases — JBP Management
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-JBP-Management.md

---

## Page Layout & Tab Navigation

### ADM_JBP_001 — JBP page loads at /admin/jbp-management

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "JBP Management" in sidebar<br>2. Observe URL |
| **Expected Result** | URL is /admin/jbp-management; 3 tabs rendered |
| **Priority** | Critical |

---

### ADM_JBP_002 — Three tabs visible: Cycle Management, Submissions, Edit Requests

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | JBP page loaded |
| **Test Steps** | 1. Inspect tab bar at top of page |
| **Expected Result** | Tabs labelled: "Cycle Management", "Submissions", "Edit Requests" |
| **Priority** | High |

---

### ADM_JBP_003 — Cycle Management is default active tab

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Just navigated to JBP page |
| **Test Steps** | 1. Inspect active tab indicator |
| **Expected Result** | "Cycle Management" tab is selected by default |
| **Priority** | Medium |

---

### ADM_JBP_004 — Switch to Submissions tab

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | JBP page loaded |
| **Test Steps** | 1. Click "Submissions" tab |
| **Expected Result** | Submissions table loads; tab becomes active |
| **Priority** | High |

---

### ADM_JBP_005 — Switch to Edit Requests tab

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | JBP page loaded |
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
| **Test Steps** | 1. Inspect cycle table columns |
| **Expected Result** | Columns: Cycle Name, Start Date, End Date, Status, Actions |
| **Priority** | High |

---

### ADM_JBP_007 — Status column shows OPEN or CLOSED

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Cycle Management tab active |
| **Test Steps** | 1. Read distinct Status values |
| **Expected Result** | Values are OPEN or CLOSED only |
| **Priority** | High |

---

### ADM_JBP_008 — Create Cycle button visible

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Cycle Management tab active |
| **Test Steps** | 1. Locate Create Cycle button |
| **Expected Result** | "+ Create Cycle" button visible at top of tab |
| **Priority** | High |

---

### ADM_JBP_009 — Click Create Cycle opens form modal

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | No OPEN cycle exists |
| **Test Steps** | 1. Click "+ Create Cycle" |
| **Expected Result** | Modal opens with fields: Cycle Name, Start Date, End Date |
| **Priority** | Critical |

---

### ADM_JBP_010 — Create new cycle with valid data

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Create Cycle modal open; no OPEN cycle |
| **Test Steps** | 1. Enter Name "Q3-2026"<br>2. Set Start Date = today<br>3. Set End Date = today + 30 days<br>4. Click Submit |
| **Expected Result** | Cycle created with status OPEN; appears in list |
| **Priority** | Critical |

---

### ADM_JBP_011 — Creating second cycle when one OPEN exists shows error popup

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | One OPEN cycle exists |
| **Test Steps** | 1. Click "+ Create Cycle"<br>2. Fill form and Submit |
| **Expected Result** | "Active Cycle Detected" popup shown; new cycle not created |
| **Priority** | Critical |

---

### ADM_JBP_012 — Create Cycle with empty Name rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Create Cycle modal open; no OPEN cycle |
| **Test Steps** | 1. Leave Name empty<br>2. Fill dates<br>3. Submit |
| **Expected Result** | Validation error on Name field |
| **Priority** | High |

---

### ADM_JBP_013 — Create Cycle with End Date before Start Date rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Create Cycle modal open |
| **Test Steps** | 1. Set Start Date = 2026-06-01<br>2. Set End Date = 2026-05-15<br>3. Submit |
| **Expected Result** | Validation error: end date must be after start date |
| **Priority** | High |

---

### ADM_JBP_014 — Close Cycle button visible on OPEN cycle row

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | OPEN cycle exists |
| **Test Steps** | 1. Inspect Actions column on OPEN cycle row |
| **Expected Result** | "Close Cycle" button visible |
| **Priority** | High |

---

### ADM_JBP_015 — Click Close Cycle prompts confirmation

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | OPEN cycle exists |
| **Test Steps** | 1. Click Close Cycle on row |
| **Expected Result** | Confirmation dialog opens with warning about irreversibility |
| **Priority** | Critical |

---

### ADM_JBP_016 — Confirm Close Cycle changes status to CLOSED

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Close Cycle confirmation open |
| **Test Steps** | 1. Click Confirm in dialog |
| **Expected Result** | Cycle status changes from OPEN to CLOSED; cannot be reopened |
| **Priority** | Critical |

---

### ADM_JBP_017 — Cancel Close Cycle keeps status OPEN

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Close Cycle confirmation open |
| **Test Steps** | 1. Click Cancel in dialog |
| **Expected Result** | Dialog closes; cycle remains OPEN |
| **Priority** | High |

---

### ADM_JBP_018 — CLOSED cycle has no actions

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | CLOSED cycle in list |
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
| **Test Steps** | 1. Inspect Submissions table |
| **Expected Result** | Columns include: CP Name/HV Code, Cycle, Submitted Date, View Details |
| **Priority** | High |

---

### ADM_JBP_020 — Click View on submission shows full 14-field form

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | At least one submission |
| **Test Steps** | 1. Click View on a submission row |
| **Expected Result** | Detail view shows all 14 fields with CP's submitted values |
| **Priority** | Critical |

---

### ADM_JBP_021 — Submission detail shows Brokerage to be Earned value

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Test Steps** | 1. Locate Brokerage to be Earned field |
| **Expected Result** | Shows the CP's selected dropdown value |
| **Priority** | High |

---

### ADM_JBP_022 — Submission detail shows Net Booking Commitment

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Test Steps** | 1. Locate Net Booking Commitment field |
| **Expected Result** | Shows units value selected by CP |
| **Priority** | High |

---

### ADM_JBP_023 — Submission detail shows Manpower number

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Test Steps** | 1. Locate Manpower to deploy field |
| **Expected Result** | Shows numeric value from CP's slider/number input |
| **Priority** | Medium |

---

### ADM_JBP_024 — Submission detail shows List of activities multi-checkbox values

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Test Steps** | 1. Locate List of activities |
| **Expected Result** | Shows checked activities from the 14 options |
| **Priority** | Medium |

---

### ADM_JBP_025 — Submission detail shows digital channels checkboxes

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Test Steps** | 1. Locate Go live on digital |
| **Expected Result** | Shows selected channels (Google/Meta/etc.) |
| **Priority** | Medium |

---

### ADM_JBP_026 — Submission detail shows Total Investment radio choice

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Test Steps** | 1. Locate Total investment |
| **Expected Result** | Shows selected range from the 5 options |
| **Priority** | Medium |

---

### ADM_JBP_027 — Submission detail shows Yes/No fields

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Test Steps** | 1. Verify Inserts, Standees, Kiosk, Tele Callers, SMS Blast, WhatsApp Blast, Growth Hub fields |
| **Expected Result** | Each shows Yes or No value as selected by CP |
| **Priority** | Medium |

---

### ADM_JBP_028 — Submission detail shows Registration Commitment count

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Viewing a submission |
| **Test Steps** | 1. Locate Registration Commitment field |
| **Expected Result** | Shows numeric count entered by CP |
| **Priority** | Medium |

---

### ADM_JBP_029 — Filter submissions by Cycle

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Submissions tab active |
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
| **Test Steps** | 1. Inspect Edit Requests table |
| **Expected Result** | Columns: CP Name/HV Code, Cycle, Requested Date, Status, Action |
| **Priority** | High |

---

### ADM_JBP_031 — Click request opens revised values for review

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | At least one pending edit request |
| **Test Steps** | 1. Click view on edit request row |
| **Expected Result** | Detail view shows original vs. revised values per field |
| **Priority** | Critical |

---

### ADM_JBP_032 — Approve edit request requires written reason

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Edit request detail open |
| **Test Steps** | 1. Click Approve<br>2. Submit without entering reason |
| **Expected Result** | Reason required validation error; cannot approve without reason |
| **Priority** | Critical |

---

### ADM_JBP_033 — Approve with reason updates original submission

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Edit request detail open |
| **Test Steps** | 1. Click Approve<br>2. Enter reason "Approved"<br>3. Submit |
| **Expected Result** | Submission updated with revised values; status becomes Approved; CP notified |
| **Priority** | Critical |

---

### ADM_JBP_034 — Reject edit request requires written reason

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Edit request detail open |
| **Test Steps** | 1. Click Reject<br>2. Submit without reason |
| **Expected Result** | Reason required validation; cannot reject without reason |
| **Priority** | High |

---

### ADM_JBP_035 — Reject with reason preserves original submission

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Edit request detail open |
| **Test Steps** | 1. Click Reject<br>2. Enter reason "Insufficient detail"<br>3. Submit |
| **Expected Result** | Edit request status = Rejected; original submission unchanged; CP notified |
| **Priority** | High |

---

### ADM_JBP_036 — Filter Edit Requests by status

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Edit Requests tab active |
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
| **Test Steps** | 1. Inspect CLOSED cycle for any reopen action |
| **Expected Result** | No mechanism to reopen; status irreversibly CLOSED |
| **Priority** | High |

---

### ADM_JBP_038 — No financial impact from cycle close or edit reject

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Cycle just closed; edit request just rejected |
| **Test Steps** | 1. Check Payment Transactions module for any related transactions |
| **Expected Result** | No transactions generated; JBP has no financial side effects |
| **Priority** | Medium |

---

### ADM_JBP_039 — One submission per CP per cycle enforced

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | CP already submitted for current cycle |
| **Test Steps** | 1. Have same CP log into CP Portal<br>2. Check JBP section |
| **Expected Result** | "Add New JBP Entry" button hidden; CP cannot submit twice |
| **Priority** | High |

---

### ADM_JBP_040 — Pagination works on submissions table

| Field | Value |
|-------|-------|
| **Module** | ADM – JBP |
| **Pre-conditions** | Submissions tab active; >10 entries |
| **Test Steps** | 1. Click Next page |
| **Expected Result** | Next page of submissions loads |
| **Priority** | Medium |

---
