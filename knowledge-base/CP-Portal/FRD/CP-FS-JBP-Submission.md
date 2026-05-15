# Feature-Spec: JBP (Joint Business Plan) Submission

**Portal:** Channel Partner Portal
**URLs:** `https://uat.xrportal.in/jbp`, `/jbp/thank-you`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: Submit JBP Plan

### 1.1 Objective

Allow CPs to submit their Joint Business Plan for the currently open JBP cycle, declaring their sales targets, marketing investment commitments, and resource plans.

### 1.2 Scope

CPs can submit one JBP per open cycle. The cycle must be OPEN for submission to be accepted. After submission, direct editing is not available — changes require an edit request flow.

### 1.3 Preconditions

- CP must be logged in
- A JBP cycle must be in OPEN status (created by admin)
- CP must not have already submitted a JBP for this cycle

### 1.4 JBP Form Fields

| Field | Type | Description |
|-------|------|-------------|
| Brokerage to be Earned | Dropdown | Expected brokerage amount range |
| Net Booking Commitment (Units) | Dropdown | Number of bookings CP commits to |
| Manpower to Deploy | Number + Slider | Sales staff the CP will deploy |
| List of Activities | Multi-checkbox | Marketing activities planned (14 options) |
| Go Live on Digital | Multi-checkbox | Digital channels — Google, Meta, etc. |
| Total Investment | Radio (5 ranges) | Marketing budget range |
| Inserts Required | Yes/No | Print marketing collateral |
| Standees Required | Yes/No | Physical standees |
| Kiosk Required | Yes/No | Kiosk setup |
| Tele Callers Required | Yes/No | Telecalling support |
| SMS Blast | Yes/No | SMS marketing |
| WhatsApp Blast | Yes/No | WhatsApp marketing |
| Growth Hub | Yes/No | Growth Hub participation |
| Registration Commitment (Count) | Number | Number of registrations CP commits to |

### 1.5 Validations and Business Rules

1. Cycle must be OPEN — submission is not accepted after the cycle is closed
2. One submission per CP per cycle — after submitting, the "Add New JBP Entry" button disappears
3. All required fields must be completed before submission
4. Submitted plans are version-tracked (initial submission = version 1)

### 1.6 System Actions on Submission

1. JbpSubmission record created with status = ACTIVE, version = 1
2. CP is redirected to Thank You page (`/jbp/thank-you`)
3. Submission is available for admin review in the Admin Portal > JBP Management > Submissions tab

---

## How to Use: Submitting Your JBP Plan

**Who does this:** Channel Partner

---

**Step 1 — Navigate to JBP**

From the navigation menu, click **JBP**. If there is an open JBP cycle, the submission form will load.

**Step 2 — Fill in your commitments**

Complete all the fields in the form:
- **Brokerage and Booking Commitment** — select from the dropdown the targets you are committing to
- **Manpower** — use the number field or slider to indicate how many sales staff you will deploy
- **Marketing Activities** — tick all the activities you plan to run (events, digital, print, etc.)
- **Digital Channels** — select which online platforms you will activate (Google, Meta, etc.)
- **Investment Range** — select the total marketing spend range
- **Yes/No fields** — indicate whether you require inserts, standees, kiosk, tele callers, SMS blast, WhatsApp blast, and Growth Hub

**Step 3 — Submit**

Click **Submit**. On success, you will see a Thank You confirmation page. Your plan has been submitted to the admin team.

> **Note:** Once submitted, you cannot directly edit your plan. If you need to make changes, use the Edit Request process described below.

---

## Feature 2: Submit an Edit Request

### 2.1 Objective

Allow CPs to request changes to their submitted JBP plan. The edit request goes to the admin for review — CPs cannot self-edit after initial submission.

### 2.2 Preconditions

- CP must have already submitted a JBP for the current cycle
- Cycle must still be OPEN

### 2.3 Edit Request Form

| Field | Description |
|-------|-------------|
| Changes requested | Description of what the CP wants to change |
| Revised values | Updated field values for the plan |

### 2.4 Business Rules

1. Admin must approve or reject the edit request
2. If approved: submission is updated with the new values, version increments (e.g., version 2), old version is marked EXPIRED
3. If rejected: original submission is preserved unchanged
4. Admin provides a written reason for both approvals and rejections
5. CP is notified of the admin's decision

---

## How to Use: Requesting an Edit to Your JBP

**Who does this:** Channel Partner, when existing submission needs updating

---

**Step 1 — Go to your JBP submission**

Navigate to the JBP section. Your submitted plan will be displayed.

**Step 2 — Submit an edit request**

Click the option to request an edit. Fill in what you would like to change and the new values you want.

**Step 3 — Wait for admin review**

Your edit request is sent to the admin team. You will be notified once it is approved or rejected.

- **If approved:** Your plan will be updated with your requested changes
- **If rejected:** Your original submission remains unchanged and you will receive the reason for rejection

---

## Feature 3: View Existing JBP Submission

### 3.1 Objective

Allow CPs to view their current submitted JBP plan and its status.

### 3.2 Business Rules

1. If a submission exists for the current cycle, the form fields are shown in read-only mode
2. The submission version number and status are displayed

---

## How to Use: Viewing Your Submitted Plan

**Who does this:** Channel Partner

---

**Step 1 — Navigate to JBP**

Click **JBP** in the navigation. If you have already submitted for the current cycle, your plan will display in read-only format showing all your commitments.

**Step 2 — Review your plan**

Your submitted values are shown for all 14 fields. The version number indicates if your plan has been updated by an approved edit request.
