# Feature-Spec: Payment Schedule

**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/paymentschedule`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: View Payment Schedule

### 1.1 Objective

Allow buyers to view the full construction-linked payment plan for their allocated unit, showing all future payment milestones, amounts due, and current payment status.

### 1.2 Scope

Read-and-action screen. Buyers can view milestone details and initiate payments when a milestone is triggered.

### 1.3 Preconditions

- Buyer must be logged in
- Buyer must have a confirmed allocated unit (WINNER status)
- Payment schedule is generated after KYC is completed and unit is confirmed

### 1.4 Information Displayed

| Field | Description |
|-------|-------------|
| Milestone list | All payment milestones in order |
| Amount due per milestone | Principal, GST, parking amounts shown separately |
| Payment status | Pending / Partial / Paid |
| Already paid amount | What has been paid so far |
| Outstanding balance | Remaining amount to be paid |
| Home loan linked amount | Amount disbursed by the bank at each milestone |
| Early bird discount | Discount applied if applicable |

### 1.5 Payment Plan Types

- Construction-linked
- Time-linked
- Down payment

The schedule is generated based on the buyer's selected payment plan at the time of registration.

### 1.6 Business Rules

1. Payment schedule is generated post-KYC and unit confirmation
2. Each milestone has a specific trigger (construction stage completion)
3. Demand letters are generated when a milestone becomes due
4. Online payments can be made via the payment gateway from this screen
5. GST is broken out separately from the principal amount for each milestone

---

## How to Use: Viewing Your Payment Schedule

**Who does this:** Buyer, post-allocation and KYC completion

---

**Step 1 — Navigate to Payment Schedule**

From the navigation menu, click **Payment Schedule** (or from the Home Dashboard, click **Pay >** next to a pending milestone).

**Step 2 — Review your milestones**

The screen shows all payment milestones in order. For each milestone you can see:
- What triggers the milestone (e.g., "Foundation completion")
- The total amount due (principal + GST + parking charges)
- Whether it is Pending, Partially Paid, or Paid

**Step 3 — Pay a due milestone**

When a milestone has been triggered and a demand letter issued, you will see a **Pay** button. Click it to open the payment gateway and complete the payment.

**Step 4 — Track home loan disbursements**

If you have a home loan, the schedule shows which milestones will be covered by bank disbursement and which you need to pay directly.

> **Note:** You will receive a notification when a new milestone payment becomes due. Return to this screen to make the payment.
