# Milestone Payments — BRD

**Type:** Cross-Portal End-to-End Workflow
**Portals Involved:** Buyer Portal, SM Portal (offline payments), Admin Portal
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

Milestone payments are construction-linked (or time-linked) instalments that a buyer pays after booking a unit and completing KYC. They represent the ongoing payment obligations tied to the project's construction progress. The system tracks each milestone separately, showing how much is due, paid, and outstanding per buyer.

---

## 2. Who Is Involved

| Actor | Role |
|-------|------|
| Admin | Configures milestone templates, triggers demand letters, views all buyer milestone records, exports data |
| Buyer | Receives demand letter notifications, pays milestones via Buyer Portal |
| Sales Manager | Records offline milestone payments (NEFT/Cheque/Cash) via SM Portal |
| System | Generates payment schedule after KYC, creates milestone records, processes payments, syncs to Mavis |

---

## 3. Milestone Types

| Type | Description |
|------|-------------|
| BOOKING_AMOUNT | Fixed booking token (same as allocation payment) |
| PERCENT | Percentage of Final Agreement Value (FAV) due at this construction stage |
| SDR | Stamp Duty and Registration charge |
| AMOUNT | Fixed flat amount |
| FIRST_DISBURSEMENT | First home loan bank disbursement |
| FIRST_DEMAND_PAYMENT | First demand letter payment |

---

## 4. Milestone Lifecycle

```
KYC Submitted
  → Payment schedule generated (one MilestonePaymentTracking record per milestone)
  → All milestones start with status = pending, totalPaid = 0

Construction stage reached
  → Admin triggers demand letter for that stage
  → Buyers at that stage receive notification to pay

Buyer pays milestone
  → Online: via Buyer Portal → Easebuzz/Razorpay gateway
  → Offline: via SM Portal OfflinePaymentDrawer

Gateway webhook confirms payment
  → totalPaid incremented
  → balanceAmount recalculated
  → status = partial (if balance remains) OR paid (if fully cleared)

Next milestone becomes due → cycle repeats until final handover milestone paid
```

---

## 5. Payment Status Values

| Status | Meaning |
|--------|---------|
| pending | Amount due, no payment made |
| partial | Some payment received, balance remaining |
| paid | Full amount confirmed paid |
| VERIFICATION | Payment received, under verification |
| PAID | Payment confirmed and cleared |

---

## 6. Offline Milestone Payment Fields

| Field | Required | Description |
|-------|----------|-------------|
| Registration Number | Yes | Buyer's registration |
| Payment Method | Yes | Cash / NEFT / RTGS / Cheque / UPI / Card Swipe |
| Transaction Date | Yes | Date of payment |
| Transaction ID | Yes | Reference number |
| Amount | Yes | Amount paid |
| Transaction Proof | Yes | Image upload (bank receipt, transfer screenshot) |

---

## 7. Admin View

**URL:** `/admin/milestone`

Admin can:
- Filter by registration number or status
- See pending, partial, and paid milestones across all buyers
- Export milestone data as XLSX
- Track outstanding balances across all buyers

---

## 8. Key Business Rules

1. **KYC is prerequisite:** Payment schedule is generated ONLY after KYC submission. A buyer who booked but did not complete KYC has no milestone schedule.
2. **Amounts are frozen at schedule generation:** `totalAmount` per milestone is calculated from the typology template at KYC time and does not change retroactively.
3. **Partial payments are allowed:** Buyer can pay in multiple tranches. Status moves to `partial` until `totalPaid >= totalAmount`.
4. **Multiple schedule versions:** Admin can update the milestone template (`versionId`) without affecting existing buyer schedules — existing records are preserved.
5. **Home loan disbursement:** When the bank releases a tranche, it credits against the FIRST_DISBURSEMENT milestone automatically.
6. **Soft deletes:** Milestone records are soft-deleted if booking is cancelled — not hard deleted. Audit trail is preserved.
7. **Reconciliation cron:** Runs every 5 minutes to catch milestone payments where the gateway webhook was missed.
8. **Mavis sync:** Every confirmed milestone payment creates a Mavis milestone payment record and updates Mavis milestone status.

---

## How to Use: Milestone Payments

---

### Buyer: Paying a Milestone

**Step 1:** When a construction stage is triggered, you will receive a notification (SMS/WhatsApp) that a payment is due.

**Step 2:** Log into the Buyer Portal and go to **Payment Schedule**. Find the milestone with status **Pending** or **Partial**.

**Step 3:** Click **Pay** next to the due milestone.

**Step 4:** Complete payment in the Easebuzz gateway using your preferred method.

**Step 5:** On success, the milestone status updates to **Paid** (or **Partial** if you paid only part of the amount).

> **Partial payments are accepted.** You do not have to pay the full milestone amount at once.

> **Home loan buyers:** Your bank's disbursement may cover certain milestones automatically — these will be credited when the bank releases the funds.

---

### SM: Recording an Offline Milestone Payment

**Step 1:** Customer presents cash/cheque/NEFT receipt at the site office.

**Step 2:** In the SM Portal, open the OfflinePaymentDrawer for the customer's milestone.

**Step 3:** Fill in: Registration Number, Payment Method, Transaction Date, Transaction ID, Amount.

**Step 4:** Upload the payment proof (bank receipt or transfer confirmation image).

**Step 5:** Submit. The payment is recorded as pending admin verification.

**Step 6:** Admin reviews and approves. On approval, Mavis is updated and the milestone status changes to Paid.

---

### Admin: Monitoring Milestone Payments

**Step 1:** Go to `/admin/milestone`.

**Step 2:** Use the filter by registration number to view all milestones for a specific buyer, or view all pending milestones across the project.

**Step 3:** To export for reconciliation, click **Export** to download the milestone data as an XLSX file.

---

## 9. Related Documents

- [[Milestone-Payments]] — Technical milestone payment reference
- [[BRD-Payment-Workflow]] — Payment gateway context
- [[BRD-KYC-Workflow]] — KYC triggers payment schedule generation
- [[BRD-Home-Loan-Workflow]] — FIRST_DISBURSEMENT milestone linked to loan disbursement
- [[Feature-Spec - Payment Schedule]] — Buyer Portal Feature-Spec
