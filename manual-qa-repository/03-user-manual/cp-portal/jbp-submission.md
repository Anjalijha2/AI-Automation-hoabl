# CP Portal — JBP Submission User Guide

**Portal:** Channel Partner (Growth Partner) Portal
**URLs:** `https://uat-web.xrportal.in/jbp`, `https://uat-web.xrportal.in/jbp/thank-you`
**Sources:** CP-BRD-CP-Portal.md · CP-FS-JBP-Submission.md
**Last Updated:** 2026-05-22
**Audience:** Channel Partner / Sales Agent

---

## Overview

JBP (Joint Business Plan) is the CP's formal commitment statement for an admin-defined business cycle. You declare your sales targets (brokerage, bookings, registrations), the manpower you will deploy, your planned marketing activities, your digital-channel mix, your total investment band, and a handful of Yes/No requirements (inserts, standees, kiosk, telecallers, SMS/WhatsApp blast, Growth Hub). Submissions are accepted **only while the JBP cycle is OPEN**. Each CP can submit one JBP per cycle. Direct post-submission editing is not allowed — corrections go through an Edit Request that admin reviews and approves; approved edits increment the submission's version.

This module is your channel partnership contract surface for the cycle. Take the inputs seriously: admin reviews and tracks delivery against what you submit.

---

## Page Layout (At a Glance)

1. **Cycle Status Banner** — indicates whether the cycle is OPEN; if CLOSED, submission is blocked.
2. **JBP Form** — 14 fields covering commitments, manpower, marketing, and Yes/No requirements.
3. **Submit Button** — gated by completion of all required fields and cycle OPEN status.
4. **Thank You page** (`/jbp/thank-you`) — confirmation surface shown after successful submission.
5. **Read-only View** — if you have already submitted for this cycle, the form re-opens in read-only mode showing your committed values and version number.
6. **Edit Request CTA** — appears on the read-only view; opens the edit-request flow.

---

# Feature 1 — Submit a New JBP for the Open Cycle

### What it does
Captures your declared commitments for the open JBP cycle and persists them as an ACTIVE submission (version 1). Once submitted, the "Add New JBP Entry" CTA disappears and the form switches to read-only.

### Preconditions
- You are logged in.
- An admin has opened a JBP cycle (status = OPEN).
- You have **not** already submitted a JBP for this cycle.

### How to use
1. From the navigation menu, click **JBP**. The form loads at `/jbp`.
2. Complete every field (see the Form Fields table below). Pay particular attention to:
   - **Brokerage to be Earned** — pick the expected commission range from the dropdown.
   - **Net Booking Commitment** — number of bookings you commit to in this cycle.
   - **Manpower to Deploy** — enter the sales-staff count via number input or slider.
   - **List of Activities** — tick every marketing activity you plan to run (14 options).
   - **Go Live on Digital** — tick every digital channel you will activate (Google, Meta, etc.).
   - **Total Investment** — pick one of 5 investment range radio options.
   - **Yes/No Requirements** — Inserts, Standees, Kiosk, Tele Callers, SMS Blast, WhatsApp Blast, Growth Hub.
   - **Registration Commitment** — number of customer registrations you commit to in this cycle.
3. Re-check every field — once submitted, direct edits are not allowed.
4. Click **Submit**.
5. You are redirected to `/jbp/thank-you` confirming the submission.

### Result
- A `JbpSubmission` row is created with `status = ACTIVE` and `version = 1`.
- The submission is visible to admin under **Admin Portal → JBP Management → Submissions**.
- Your JBP form re-opens in read-only mode for the remainder of the cycle.
- The **Add New JBP Entry** CTA disappears (one-per-cycle rule).

### Warning
- Submissions are accepted **only while the cycle is OPEN**. If the cycle closes before you submit, you cannot submit retroactively.
- One submission per CP per cycle. There is no "save draft" — submit only when you are ready.
- Direct post-submission editing is NOT available. Plan your numbers before clicking Submit.

---

# Feature 2 — View Your Submitted JBP (Read-Only)

### What it does
Renders your previously submitted JBP for the current cycle in read-only form so you can confirm what you committed.

### Preconditions
- You have already submitted a JBP for the current cycle.

### How to use
1. Click **JBP** in the navigation menu.
2. Your submitted plan loads in read-only mode showing all 14 fields with the values you entered.
3. The submission **version number** is visible (initial = 1; increments after admin-approved edits).
4. The submission **status** is shown (ACTIVE / EXPIRED).

### Result
You have a confirmed view of your active commitments. From here you can launch an Edit Request (Feature 3) if changes are needed.

---

# Feature 3 — Submit an Edit Request

### What it does
Allows you to ask admin to amend your already-submitted JBP. The request enters an admin review queue; admin either approves (creating a new version) or rejects (preserving the original).

### Preconditions
- You have already submitted a JBP for the current cycle.
- The cycle is still OPEN.

### How to use
1. From the read-only JBP view (Feature 2), click the **Request Edit** option.
2. Fill in:
   - **Changes Requested** — a description of what you want to amend and why.
   - **Revised Values** — the new field values you want applied to your plan.
3. Click **Submit Edit Request**.
4. The request enters the admin review queue. You will be notified when admin approves or rejects.

### Result (after admin action)
- **If admin approves:** Your submission is updated with the new values. `version` increments (e.g., from 1 → 2). The old version is marked `EXPIRED`. Admin provides a written reason.
- **If admin rejects:** Your original submission is preserved unchanged. Admin provides a written reason. You will be notified.

### Warning
- Edit requests are only accepted while the cycle is still OPEN. If admin closes the cycle before reviewing your request, the request will not be actionable.
- Admin must provide a written reason for both approval and rejection — expect a notification carrying that reason.

---

## Form Fields

| # | Field | Type | Notes |
|---|-------|------|-------|
| 1 | Brokerage to be Earned | Dropdown | Expected brokerage amount range |
| 2 | Net Booking Commitment (Units) | Dropdown | Number of bookings committed |
| 3 | Manpower to Deploy | Number + Slider | Sales staff count |
| 4 | List of Activities | Multi-checkbox | 14 marketing-activity options |
| 5 | Go Live on Digital | Multi-checkbox | Digital channels (Google, Meta, etc.) |
| 6 | Total Investment | Radio (5 ranges) | Marketing budget range |
| 7 | Inserts Required | Yes / No | Print collateral |
| 8 | Standees Required | Yes / No | Physical standees |
| 9 | Kiosk Required | Yes / No | Kiosk setup |
| 10 | Tele Callers Required | Yes / No | Telecalling support |
| 11 | SMS Blast | Yes / No | SMS marketing |
| 12 | WhatsApp Blast | Yes / No | WhatsApp marketing |
| 13 | Growth Hub | Yes / No | Growth Hub participation |
| 14 | Registration Commitment (Count) | Number | Number of registrations committed |

---

## Validation Rules

| Rule | Behaviour |
|------|-----------|
| Cycle must be OPEN | Submission blocked when cycle status is CLOSED |
| One submission per CP per cycle | Add New JBP CTA disappears after first successful submit |
| All required fields complete | Submit button gated until every required field is populated |
| Post-submission edit | Not allowed directly — must go through Edit Request flow |

---

## Business Rules

1. **One JBP per CP per cycle** (BRD §4.5).
2. **Cycle must be OPEN** at submission time (BRD §4.6).
3. **Version tracking.** Initial submission = version 1; approved edits increment the version; old version marked EXPIRED (BRD §4.7).
4. **Admin reviews every edit request** and provides a written reason for approval or rejection.
5. **Thank You page** at `/jbp/thank-you` is the post-submission confirmation surface.

---

## JBP Submission Lifecycle

```
[No submission] → [ACTIVE v1] → (Edit Request) → [admin review]
                                                     │
                                          ┌──────────┴──────────┐
                                          ▼                     ▼
                                   Approve                 Reject
                                   v1 → EXPIRED            v1 stays ACTIVE
                                   New v2 → ACTIVE         No change
```

---

## Role Restrictions

| Role | Submit JBP? | Submit Edit Request? |
|------|-------------|----------------------|
| Channel Partner | Yes | Yes (on own submission) |
| Lead/Master CP | Yes (own JBP) | Yes (own only) |
| Member CP | Yes (own JBP) | Yes (own only) |
| Admin | Reviews submissions — does NOT author CP JBPs | Approves/rejects CP edit requests |

---

## Notifications Dispatched

| Action | Channel | Recipient |
|--------|---------|-----------|
| Successful submission | Thank You page redirect; admin sees the submission in the admin queue | CP (in-app) |
| Edit request submitted | Admin queued for review | Admin |
| Edit request approved/rejected | In-app + written reason | CP |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| JBP form does not load / appears disabled | No OPEN cycle exists | Wait for admin to open the next cycle; check with your manager |
| "Already submitted" message | You have already submitted for this cycle | Use the read-only view; raise an Edit Request if changes needed |
| Add New JBP Entry CTA missing | Either no OPEN cycle or you have already submitted | Confirm cycle state and whether you submitted |
| Cannot submit — Submit button greyed | Required field incomplete OR cycle just closed | Walk through every field; if all complete, the cycle has likely closed |
| Edit Request stuck in pending | Admin has not yet reviewed | Follow up with your manager; review SLA per partnership terms |
| Edit Request rejected | Admin disagreed with the proposed change | Read the admin's written reason; revise and resubmit if cycle still open |
