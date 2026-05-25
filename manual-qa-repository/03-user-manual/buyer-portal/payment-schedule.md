# Buyer Portal — Payment Schedule User Guide

**Audience:** Buyer / Customer (post-allocation)
**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/paymentschedule`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-Payment-Schedule.md
**Last Updated:** 2026-05-22

---

## Overview

The Payment Schedule is your construction-linked installment plan for the booked unit. It lists every milestone, the trigger event (e.g. "Foundation completion"), the amount due split by principal / GST / parking, what you have already paid, what is outstanding, and which milestones are covered by your home loan disbursement.

This page becomes meaningful only **after KYC submission** — milestone schedule generation is part of the post-KYC backend pipeline. If you just booked a unit and the schedule looks empty, complete KYC first.

---

## Page Layout (At a Glance)

1. **Header card** — your registration and unit summary.
2. **Milestone list** — chronological, one row per milestone with status badge.
3. **Amount columns** — principal / GST / parking / total / paid / outstanding.
4. **Pay button** — appears next to milestones that are currently due.
5. **Home loan indicator** — flags milestones that the bank will disburse directly.

---

# Feature 1 — Browse the Milestone List

### What it does
Renders every milestone in your construction-linked payment plan in chronological order, with status and amounts.

### Preconditions
- You are logged in.
- WINNER status confirmed.
- KYC submitted (schedule generation depends on KYC).

### How to use
1. From the navigation menu, click **Payment Schedule** (or click **Pay >** on a Home Dashboard row).
2. The page lists every milestone top-to-bottom.
3. For each milestone, read:
   - **Trigger event** — what construction milestone unlocks this payment (e.g. "Foundation completion").
   - **Principal** — base amount due.
   - **GST** — applicable GST shown separately.
   - **Parking** — parking-related component (if applicable).
   - **Total** — sum due for the milestone.
   - **Paid** — what you have already paid against this milestone.
   - **Outstanding** — what is remaining.
   - **Status badge** — Pending / Partial / Paid.

### Result
You have a complete view of every future payment, when it is due (by trigger), and what it consists of.

### Note
**GST is always broken out separately from the principal.** This is intentional — it lets you reconcile against your bank statement and provides clarity for home loan disbursement requests.

---

# Feature 2 — Pay a Due Milestone Online

### What it does
When a milestone is triggered by a construction event, a demand letter is raised and the **Pay** button activates on that row. Clicking Pay opens the payment gateway so you can settle the milestone online.

### Preconditions
- The milestone is **triggered** (construction stage complete) and a demand letter is issued.
- You are on the Payment Schedule page.

### How to use
1. Locate the milestone row with an active **Pay** button.
2. Read the amount due (principal + GST + parking).
3. Click **Pay**.
4. The payment gateway opens (Easebuzz or Razorpay depending on configuration).
5. Choose your payment method — Card / UPI / NetBanking / Wallet.
6. Complete the payment.

### Result
- The milestone row updates to **Paid** (or **Partial** for partial payment) once the webhook confirms.
- Outstanding amount on that row recalculates.
- A receipt / payment confirmation is generated.

### Warning
**Webhook is the source of truth.** If you close the browser mid-payment but the gateway has already processed, the status updates from the webhook — not the browser. Wait a minute and refresh before re-attempting.

---

# Feature 3 — Track Home Loan Disbursements

### What it does
For buyers with a linked home loan, the schedule flags which milestones the bank will disburse directly to the developer and which require your direct payment.

### Preconditions
- Home loan flow completed in `/homeloan`.
- Loan amount sanctioned by the bank.

### How to use
1. Open the Payment Schedule.
2. Look for the **Home Loan** indicator on each milestone row.
3. Rows with the indicator are **bank-disbursed** — you do not pay directly.
4. Rows without the indicator are your **out-of-pocket** payments.

### Result
You know exactly which milestones need your money and which the bank will handle, so you can plan cash flow accordingly.

### Note
Disbursement timing is controlled by the bank — the portal shows the linkage but the actual disbursement is the bank's process. If a bank-disbursed milestone is stuck Pending, contact your loan officer / relationship manager at the bank.

---

# Feature 4 — Plan Types You May See

### What it does
Your schedule is generated based on the payment plan you chose at registration. The plan determines how milestones are structured.

### Plan types
| Plan | Behaviour |
|------|-----------|
| **Construction-linked** | Each milestone triggers when a construction stage completes |
| **Time-linked** | Each milestone triggers on a fixed calendar date |
| **Down payment** | Front-loaded — large initial payment, smaller residuals |

### How to use
Refer to the milestone trigger column to understand which plan applies to your registration. If the triggers are construction stages, you are on a construction-linked plan; if they are calendar dates, you are on a time-linked plan.

### Note
The plan is selected at registration time and cannot be changed self-service. Contact your Sales Manager if a plan-change request is needed (subject to approval).

---

## Business Rules — Quick Lookup

1. Payment schedule is generated **post-KYC** and unit confirmation.
2. Each milestone has a specific **trigger** (construction stage or calendar date).
3. **Demand letters** are issued when a milestone becomes due — they activate the Pay button.
4. Online payments are made via the integrated payment gateway from this screen.
5. **GST is always broken out** separately from principal.
6. Home-loan-covered milestones are flagged; you do not pay these out of pocket.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Schedule is empty after booking | KYC not yet submitted | Complete KYC at `/kyc`; schedule generates after submission |
| Pay button missing on a milestone | Milestone not yet triggered (no demand letter) | Wait for the construction trigger; you will be notified |
| Paid but status still shows Pending | Webhook still propagating | Refresh after 30–60 seconds |
| Home loan milestone stuck Pending even though triggered | Bank has not disbursed yet | Contact your loan officer at the bank |
| Amounts on a milestone do not match my agreement | Cost sheet or schedule version mismatch (e.g. post-unit-swap stale schedule) | Raise a Support Ticket — describe the milestone and amount difference |
| Gateway times out | 15-minute gateway timer elapsed | Restart the payment from the Payment Schedule row |
| Receipt not received | Webhook OK but email delivery delayed | Wait for the email; if 24+ hours, raise a Support Ticket (LOAN / GENERAL) |
