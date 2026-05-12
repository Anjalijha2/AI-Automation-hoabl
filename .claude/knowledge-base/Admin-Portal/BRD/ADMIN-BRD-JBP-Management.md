# JBP Management — BRD

**Portal:** Admin Portal (cycle management) + CP Portal (form submission)
**Admin URL:** `https://uat-web.xrportal.in/admin/jbp-management`
**CP Portal URL:** `https://uat.xrportal.in/jbp`
**Created:** 2026-05-11
**Status:** Complete

---

## 1. Purpose

Job Board Plan (JBP) is a structured commitment tracking system. Channel Partners declare their sales targets, marketing investment plans, and resource allocation for a defined cycle period. Admins create and manage these cycles; CPs submit their commitment forms; admins review any requested revisions.

JBP is not a financial transaction module — it tracks commitments and plans, not money.

---

## 2. Who Uses This

| Role | Surface | Actions |
|------|---------|---------|
| Admin | Admin Portal (`/admin/jbp-management`) | Create cycles, close cycles, review submissions, approve/reject edit requests |
| Channel Partner | CP Portal (`/jbp`) | Submit JBP commitment form, view own submission, request edits |

---

## 3. Module Structure (Admin Portal)

The admin JBP page has 3 tabs:

| Tab | Purpose |
|-----|---------|
| **Cycle Management** (default) | Create cycles, view all cycles, close open cycles |
| **Submissions** | Review all CP commitment form submissions |
| **Edit Requests** | Review and approve/reject CP requests to revise their submissions |

---

## 4. JBP Cycle Lifecycle

```
Admin creates cycle → status: OPEN → CPs submit forms → Admin closes cycle → status: CLOSED
```

- Only one OPEN cycle at a time
- Closing a cycle is irreversible
- CPs can only submit forms for the currently OPEN cycle

---

## 5. CP Submission Form (14 Fields)

| Field | Type |
|-------|------|
| Brokerage to be Earned | Dropdown (target ranges) |
| Net Booking Commitment (Units) | Dropdown |
| Manpower to deploy | Number + Slider |
| List of activities | Multi-checkbox (14 options) |
| Go live on digital | Multi-checkbox (Google/Meta/etc.) |
| Total investment | Radio (5 ranges) |
| Inserts Required | Yes/No |
| Standees Required | Yes/No |
| Kiosk Required | Yes/No |
| Tele Callers Required | Yes/No |
| SMS Blast | Yes/No |
| WhatsApp Blast | Yes/No |
| Growth Hub | Yes/No |
| Registration Commitment (Count) | Number |

---

## 6. Edit Request Flow

Once submitted, CPs cannot directly edit their form. To revise:
1. CP submits an Edit Request via CP Portal (with revised values)
2. Admin reviews the request in the Edit Requests tab
3. Admin provides a reason and approves (submission updated) or rejects (original preserved)
4. CP receives notification of the decision

---

## 7. Key Business Rules

1. **One OPEN cycle only:** Creating a new cycle when one is already OPEN triggers an "Active Cycle Detected" popup — must close the current cycle first.
2. **Irreversible close:** Once a cycle is closed (CLOSED status), it cannot be reopened.
3. **One submission per CP per cycle:** After submitting, the "Add New JBP Entry" button disappears. Revisions require the edit request flow.
4. **Reason required:** Admin must provide a written reason when approving or rejecting an edit request.
5. **No financial impact:** Closing a cycle or rejecting an edit request does not trigger any refund or payment.

---

## 8. Admin Workflow — Full Cycle

1. Go to `/admin/jbp-management`
2. Check Cycle Management tab — confirm no OPEN cycle exists
3. Click "+ Create Cycle" → enter name, start date, end date → Submit
4. CPs log in to CP Portal and submit their commitment forms
5. View submissions in the "Submissions" tab
6. When the cycle period ends, click "Close Cycle" on the OPEN row → confirm
7. Review any Edit Requests in the "Edit Requests" tab → approve or reject with reason

---

## 9. Related Documents

- [[Feature-Spec - JBP Management]] — Full feature specifications with How to Use
- [[Feature-Spec - Channel Partners]] — CP account management (who submits JBP forms)
- [[CP-Portal-BRD]] — CP Portal documentation including JBP section
