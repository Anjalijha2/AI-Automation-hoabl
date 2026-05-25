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

### CP_JBP_009 — Activities multi-checkbox shows 14 options

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | JBP form open |
| **Test Steps** | 1. Scroll to List of Activities section<br>2. Count checkboxes |
| **Expected Result** | 14 distinct activity checkboxes displayed; all individually selectable |
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

### CP_JBP_027 — Rejected edit request leaves original submission intact

| Field | Value |
|-------|-------|
| **Module** | CP – JBP |
| **Pre-conditions** | Admin has rejected the CP's edit request with reason |
| **Test Steps** | 1. Open `/jbp` |
| **Expected Result** | Original v1 submission remains; admin rejection reason is visible to CP |
| **Priority** | Medium |

---
