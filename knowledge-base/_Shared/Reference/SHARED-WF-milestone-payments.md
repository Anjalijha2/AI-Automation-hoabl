---
type: workflow
tags: [workflow, milestone, payments, construction, schedule]
updated: 2026-05-10
status: complete
---

# Milestone Payments — Workflow Reference

**Related:** [[Admin-Portal-BRD]] | [[Payment-Workflow]] | [[KYC-Workflow]] | [[Unit-Status-Flow]]

---

## 1. What Are Milestone Payments?

Milestone payments are construction-linked or time-linked instalments that a buyer pays after booking a unit. Unlike registration and booking payments (one-time), milestone payments happen in stages tied to project construction progress.

The system tracks each milestone separately — how much is due, how much has been paid, and what remains outstanding.

---

## 2. Data Model

### TypologyMilestone
Defines the milestone schedule template per typology. Set up by admin once per project.

| Field | Type | Description |
|-------|------|-------------|
| `milestoneKey` | STRING(100) | Unique identifier for this milestone (e.g. `BOOKING`, `FOUNDATION`, `HANDOVER`) |
| `name` | STRING(255) | Display name shown to buyer (e.g. "Foundation Stage") |
| `dueAmountType` | ENUM | How the amount is calculated — see table below |
| `percentageDue` | STRING | Percentage of FAV due at this stage (if PERCENT type) |
| `sequence` | INTEGER | Order in which milestones appear |
| `versionId` | BIGINT | Schedule version — allows multiple schedule versions per typology |
| `isActive` | BOOLEAN | Whether this milestone is currently active |
| `paymentAllowed` | BOOLEAN | Whether online payment is enabled for this milestone |
| `startDate` / `endDate` | DATE | Validity window for this milestone |

### Due Amount Types

| Type | Meaning |
|------|---------|
| `BOOKING_AMOUNT` | Fixed booking token (same as allocation payment) |
| `SDR` | Stamp Duty and Registration charge |
| `AMOUNT` | Fixed flat amount |
| `PERCENT` | Percentage of Final Agreement Value (FAV) |
| `FIRST_DISBURSEMENT` | First home loan disbursement amount |
| `FIRST_DEMAND_PAYMENT` | First demand letter payment |

### MilestonePaymentTracking
One record per milestone per registration unit. Tracks payment status for each buyer-milestone combination.

| Field | Type | Description |
|-------|------|-------------|
| `registrationUnitId` | FK | The buyer's specific booking |
| `typologyMilestoneId` | FK | Which milestone template this tracks |
| `totalAmount` | DECIMAL | Full amount due for this milestone |
| `totalPaid` | DECIMAL | Amount paid so far |
| `balanceAmount` | DECIMAL | Remaining balance |
| `status` | ENUM | `pending` / `partial` / `paid` |
| `paymentStatus` | ENUM | `VERIFICATION` / `PAID` |
| `gstPaid` | BOOLEAN | Whether GST portion has been paid |
| `gstPaidAmount` | DECIMAL | GST amount paid |
| `principalAmount` | DECIMAL | Principal portion |
| `parkingAmount` | DECIMAL | Car parking component |
| `homeLoanAmount` | DECIMAL | Home loan disbursement component |
| `earlyBirdDiscount` | DECIMAL | Any early bird discount applied |

---

## 3. Milestone Payment Lifecycle

```
KYC Submitted
  → System generates payment schedule (RegistrationUnitPaymentSchedule created)
  → MilestonePaymentTracking records created — one per milestone — status: pending
  → Buyer views milestone schedule in Buyer Portal
  → Demand letter triggered (construction stage event or admin trigger)
  → Buyer pays milestone online (via Easebuzz/Razorpay) or offline (SM portal)
  → Webhook confirms payment → status: paid / partial
  → Next milestone becomes due
  → Repeat until final handover milestone is paid
```

**Critical rule:** Payment schedule is generated ONLY after KYC is submitted. A buyer who has booked but not completed KYC will not have a milestone schedule.

---

## 4. Payment Status Flow

```
pending → partial (some amount paid, balance remaining)
pending → paid (full amount paid)
partial → paid (remaining balance cleared)
```

`paymentStatus` within a tracking record:
- `VERIFICATION` — payment transaction received, under verification
- `PAID` — payment confirmed and cleared

---

## 5. Offline Milestone Payment

Offline payments (NEFT/RTGS/Cheque/Cash) are entered via the SM Portal's OfflinePaymentDrawer (not the Admin Transactions page). Required fields:
- Registration Number
- Payment Method (Cash / NEFT / RTGS / Cheque / UPI / Card Swipe)
- Transaction Date
- Transaction ID
- Amount
- Transaction Proof (image upload)

---

## 6. Admin View — Milestone Payments

**URL:** `/admin/milestone`

Admin can:
- View all buyer milestone records filtered by registration number or status
- See pending, partial, and paid milestones
- Export milestone data (XLSX)
- Track outstanding balances across all buyers

---

## 7. Business Rules

1. Milestone schedule is created only after KYC submission — not after booking.
2. `totalAmount` is computed from the typology milestone template at the time the schedule is generated and does not change retroactively.
3. Partial payments are allowed — buyer can pay in multiple tranches until `totalPaid >= totalAmount`.
4. Soft deletes apply — milestone records are soft-deleted if booking is cancelled (not hard deleted).
5. Home loan disbursement maps to specific milestones — `FIRST_DISBURSEMENT` type milestone is credited when the bank releases the loan tranche.
6. Multiple schedule versions (`versionId`) allow the admin to update the milestone template without affecting existing buyer schedules.

---

## 8. Integration Points

| System | Role |
|--------|------|
| Easebuzz / Razorpay | Online payment processing for milestone payments |
| SM Portal | Offline payment entry via OfflinePaymentDrawer |
| Easiloan | Home loan disbursement triggers `FIRST_DISBURSEMENT` milestone |
| LeadSquared (CRM) | Payment activity synced for buyer tracking |
| Admin Portal `/admin/milestone` | Admin monitoring and export |
| Buyer Portal | Buyer views milestone schedule and pays online |
