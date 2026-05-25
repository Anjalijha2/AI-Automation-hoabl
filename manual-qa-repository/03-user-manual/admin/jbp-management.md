# Admin Portal — JBP Management Module User Guide

**Audience:** Admin / Sales Manager Admin
**URL:** `https://uat-web.xrportal.in/admin/jbp-management`
**Sources:** ADMIN-BRD-JBP-Management.md · ADMIN-FS-JBP-Management.md
**Last Updated:** 2026-05-22

---

## Overview

JBP (Job Board Plan) is a structured commitment-tracking module. Channel Partners declare their sales targets, marketing investment plans, and resource allocation for a defined cycle period. Admins create the cycles, monitor CP submissions, and approve/reject CP edit requests.

JBP is **not a financial transaction module** — it tracks commitments and plans only; no payments or refunds are triggered by JBP actions.

Reach this page from the left sidebar → **JBP Management** → `/admin/jbp-management`. The CP-facing form lives at `https://uat.xrportal.in/jbp` on the CP Portal.

---

## Page Layout (At a Glance)

The page has **3 tabs**:

| Tab | Purpose |
|-----|---------|
| **Cycle Management** (default) | Create, view, and close JBP cycles |
| **Submissions** | Review all CP commitment form submissions |
| **Edit Requests** | Approve or reject CP requests to revise their submissions |

---

# Feature 1 — View JBP Cycle List

### What it does
Lists all JBP cycles — past and present — with status (`OPEN` / `CLOSED`) and date ranges.

### Preconditions
- Admin session.

### How to use
1. Go to `/admin/jbp-management`. The **Cycle Management** tab is active by default.
2. Read the table:

| Column | Notes |
|--------|-------|
| Cycle Name | Name given at creation |
| Start Date | Cycle open date |
| End Date | Cycle close date |
| Status | `OPEN` or `CLOSED` |
| Action | `Close Cycle` button (OPEN rows) / `Closed` label (CLOSED rows) |

3. Cycles are listed in reverse chronological order (most recent first).

### Result
A complete view of cycles across periods. Only OPEN cycles have an action button.

### Note
- Only **one OPEN cycle** is allowed at any time.
- API: `GET /api/v1/admin/jbp-cycles?projectId=&startDate=&endDate=`.

---

# Feature 2 — Filter Cycles by Date Range

### What it does
Narrows the cycle list to a specific date window.

### Preconditions
- Admin session.

### How to use
1. On the **Cycle Management** tab, locate the date range filter at the top.
2. Pick a **Start Date** and an **End Date**.
3. The table filters immediately to cycles within the selected range.
4. Clear both date pickers to restore the full list.

### Result
A focused subset for easier review. Both dates must be set for the filter to apply.

### Note
Clearing dates triggers a re-fetch — wait for the table to reload before asserting result counts.

---

# Feature 3 — Create JBP Cycle

### What it does
Opens a new JBP commitment period that becomes available to CPs for form submission.

### Preconditions
- Admin session.
- **No other OPEN cycle exists** (single-OPEN-cycle constraint).

### How to use
1. On the Cycle Management tab, click **+ Create Cycle**. The **"Create New Cycle"** modal opens.
2. Fill the form:
   - **Cycle Name** — descriptive label, e.g. "Q2 2026 JBP Cycle".
   - **Start Date** — date the cycle opens for CP submissions.
   - **End Date** — date the cycle closes (must be ≥ Start Date).
3. Click **Submit** (or Cancel to discard).

### Result
- `POST /api/v1/admin/jbp-cycles` creates a `JbpCycle` row with `status = OPEN`.
- New cycle appears in the table immediately.
- CP Portal: each CP's JBP page surfaces the new cycle as the active cycle and shows the **Add New JBP Entry** button.
- Toast: **"Cycle created successfully"**.

### Validation rules
| Rule | Behaviour |
|------|-----------|
| Cycle Name empty | Required |
| End Date < Start Date | Rejected |
| OPEN cycle already exists | **"Active Cycle Detected"** popup blocks the create — close the existing cycle first |

### Note
No automatic CP notification is dispatched on cycle creation (confirm with product if Kaleyra notification is configured).

---

# Feature 4 — Close JBP Cycle

### What it does
Manually closes an active JBP cycle, ending CP submissions for that cycle.

### Preconditions
- Cycle has `status = OPEN`.
- Admin session.

### How to use
1. Find the OPEN cycle row in the Cycle Management table.
2. Click **Close Cycle** in the Action column.
3. Confirm in the dialog:
   - Confirm: **"Yes, Close"** · Cancel: **"Cancel"**.

### Result
- `PUT /api/v1/admin/jbp-cycles/:id/close` flips status to **CLOSED**.
- Associated `JbpSubmission` records are finalised for the cycle.
- CP Portal: the **Add New JBP Entry** button disappears; the cycle no longer appears as active.
- Toast: **"Cycle closed successfully"**.

### Warning — irreversible
Once CLOSED, a cycle **cannot be reopened**. Make sure all CPs have had sufficient time to submit before closing. JBP is a commitment-only module — closing a cycle does NOT trigger any refund or payment.

### Note
No CP notification is sent when a cycle is closed.

---

# Feature 5 — View Submissions

### What it does
Read-only review of all CP-submitted commitment forms across cycles.

### Preconditions
- Admin session.
- At least one cycle exists with at least one CP submission.

### How to use
1. Click the **Submissions** tab.
2. Each row represents one CP's JBP form for one cycle.
3. Review the 14 declared fields per submission (see Feature 7 form for field list).

### Result
A full pipeline view. One CP submits at most once per cycle; if their submission was edited via an approved Edit Request, the latest approved version is reflected.

### Note
- API: `GET /api/v1/admin/jbp-submissions?cycleId=&projectId=`.
- Submissions cannot be edited from this view — CP must submit an Edit Request (Feature 6).

---

# Feature 6 — Manage CP Edit Requests

### What it does
Approves or rejects CP requests to revise already-submitted JBP commitment forms.

### Preconditions
- Admin session.
- At least one CP has submitted an edit request via the CP Portal.

### How to use
1. Click the **Edit Requests** tab. A list of pending requests appears.
2. For each request, decide:
   - **To Approve:** click **Approve** → enter a reason (required) → confirm. The CP's original `JbpSubmission` is updated with the revised values.
   - **To Reject:** click **Reject** → enter a reason (required) → confirm. The original submission is preserved unchanged.

### Result
- **Approve:** `PUT /api/v1/admin/jbp-edit-requests/:id/approve` with `{ reason }`. `JbpEditRequest.status = 'Approved'`; submission rewritten.
- **Reject:** `PUT /api/v1/admin/jbp-edit-requests/:id/reject` with `{ reason }`. `JbpEditRequest.status = 'Rejected'`; submission untouched.
- CP receives a Kaleyra notification of the decision (if configured).

### Validation rules
| Rule | Behaviour |
|------|-----------|
| Reason field empty | Required — both approve and reject demand a written reason |
| CP has multiple pending requests | Not possible — only one pending edit request per CP per cycle |

### Status flow
```
Pending ──► Approved   (admin approves; submission updated)
       └──► Rejected   (admin rejects; original preserved)
```

---

# Feature 7 — CP Portal: Submit JBP Commitment Form (reference)

### What it does
Channel Partners submit their JBP commitment form for the currently OPEN cycle via the CP Portal. Admin does not interact with this form directly — admin reviews results in **Submissions** (Feature 5).

### Where
- CP Portal: `https://uat.xrportal.in/jbp`

### Preconditions
- An OPEN cycle exists (admin must have created it — Feature 3).
- CP is logged in (mobile + OTP).
- CP has no existing submission for the current cycle.

### CP flow
1. CP logs in to CP Portal.
2. JBP page shows banner: **"Current Cycle - [Cycle Name]"** with ACTIVE badge and "Closes on: [End Date]".
3. **Your Status** reads "Not Submitted" or "Submitted".
4. CP clicks **Add New JBP Entry** (visible only when not yet submitted for this cycle).
5. CP fills the 14-field form (see below).
6. On submit, status flips to "Submitted" and the submission appears in admin's Submissions tab.

### JBP form fields (14)

| # | Field | Type | Notes |
|---|-------|------|-------|
| 1 | Brokerage to be Earned | Dropdown | ₹10L / ₹25L / ₹50L / ₹75L / ₹1Cr+ |
| 2 | Net Booking Commitment (Units) | Dropdown | Numeric commitment targets |
| 3 | Manpower to deploy | Number + Slider | Default 1 |
| 4 | List of activities | Multi-checkbox (14 options) | Tele-calling, WhatsApp Blast, Email Blast, SMS Blast, Personal Connect Calling, Digital, Portal Listing, Expo, Society Activity, Corporate Activity, Newspaper Insert, Club Activities, Mall Activity, Association Activity, Others |
| 5 | Go live on digital | Multi-checkbox | Google / Meta / Webpage / Portal Listing / Others — **Selecting Google reveals a Google Budget input** |
| 6 | Total investment | Radio (5 ranges) | Upto 1 lakh / 1–3 / 3–5 / 5–7 / 7+ lakhs |
| 7 | Inserts Required | Radio Yes/No | Default No |
| 8 | Standees Required | Radio Yes/No | Default No |
| 9 | Kiosk Required | Radio Yes/No | Default No |
| 10 | Tele Callers Required | Radio Yes/No | Default No |
| 11 | SMS Blast | Radio Yes/No | Default No |
| 12 | WhatsApp Blast | Radio Yes/No | Default No |
| 13 | Growth Hub | Radio Yes/No | Default No |
| 14 | Registration Commitment (Count) | Number | Numeric commitment |

### CP edit-request flow
After submission, CP cannot directly edit. To revise:
1. CP opens the **Edit Requests** tab on CP Portal.
2. CP submits an Edit Request with revised values.
3. Admin reviews under the admin Edit Requests tab (Feature 6) and approves or rejects with reason.
4. CP receives notification of the decision.

---

## Business Rules

1. **One OPEN cycle only** — creating a new cycle while one is OPEN triggers an "Active Cycle Detected" popup.
2. **Irreversible close** — once a cycle is CLOSED, it cannot be reopened.
3. **One submission per CP per cycle** — after submitting, the Add New JBP Entry button disappears.
4. **Edit requests require admin approval** — CP cannot self-revise after submission.
5. **Reason required** on every approve or reject decision (admin side).
6. **No financial impact** from any JBP action (closing cycle / approving / rejecting).
7. Cycles default to `OPEN` at creation.
8. Selecting Google on field #5 reveals a Google Budget input on the CP form.

---

## Role Restrictions

- **Admin / Sales Manager Admin** — full access to all 3 tabs; can create, close, and decide edit requests.
- **Channel Partner (CP role)** — accesses the CP Portal form, submits and edit-requests only; no access to the admin module.

---

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/jbp-cycles` | Cycle list (with optional projectId + date range) |
| POST | `/api/v1/admin/jbp-cycles` | Create cycle |
| PUT | `/api/v1/admin/jbp-cycles/:id/close` | Close cycle |
| GET | `/api/v1/admin/jbp-submissions` | List CP submissions (filter by cycleId / projectId) |
| GET | `/api/v1/admin/jbp-edit-requests` | List pending edit requests |
| PUT | `/api/v1/admin/jbp-edit-requests/:id/approve` | Approve edit (body `{ reason }`) |
| PUT | `/api/v1/admin/jbp-edit-requests/:id/reject` | Reject edit (body `{ reason }`) |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| "Active Cycle Detected" popup on Create | An OPEN cycle already exists | Close the existing cycle first |
| Close button missing on a cycle row | Cycle is already CLOSED | No action — close is final |
| CP doesn't see Add New JBP Entry button | They have already submitted for the current cycle | Direct CP to submit an Edit Request via the CP Portal Edit Requests tab |
| Edit Request approve fails | Reason field empty | Enter a reason and resubmit |
| CP wants to edit twice in one cycle | Only one pending edit request per CP per cycle | CP must wait for the current request to be approved or rejected |
| Submitted submission shows old values | Approved edit hasn't propagated to UI cache | Refresh the Submissions tab |
| CP did not receive approve/reject notification | Kaleyra integration not configured for this event | Verify with product / DevOps; communicate manually |
