# Buyer Portal — Home Loan User Guide

**Audience:** Buyer / Customer (post-allocation)
**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/homeloan`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-Home-Loan.md
**Last Updated:** 2026-05-22

---

## Overview

The Home Loan section lets you check eligibility for pre-approved home loans from partner banks via the **Easiloan** integration, review bank offers, and apply for the loan of your choice. Completing the flow may unlock a **HOME_LOAN discount** on your unit's Agreement Value — a reduction in the booked price.

If your bank has already issued a sanction letter, you can **skip the Easiloan flow** and continue without a fresh eligibility check.

The flow is a 5-step process and is available after unit allocation.

---

## Page Layout (At a Glance)

| Step | Screen | Purpose |
|------|--------|---------|
| 1 | LoanEligibilityCheck | Income / financial details for eligibility |
| 2 | LoanOffersReview | Bank offers from Easiloan |
| 3 | ApplyLoan | Confirm chosen offer |
| 4 | PreapprovedLoan (alt) | Skip Easiloan if you have a sanction letter |
| 5 | Congratulations | Application submitted; HOME_LOAN offer applied (if eligible) |

---

# Feature 1 — Step 1: Loan Eligibility Check

### What it does
Captures your employment type and financial details and submits them to the Easiloan API for pre-approval assessment.

### Preconditions
- You are logged in.
- A unit is allocated to your registration (some configurations allow access pre-allocation).

### How to use
1. From the navigation menu, click **Home Loan** (or open `/homeloan`).
2. Choose your employment type:
   - **Salaried** — enter Monthly Income + existing EMI obligations.
   - **Self-Employed** — enter Annual Profit + Annual Turnover + existing EMI obligations.
3. Click **Check Eligibility**.

### Result
- Your financial profile is sent to Easiloan.
- A short loading screen runs while offers are computed.
- The portal moves to Step 2 with pre-approved offers.

### Fields by employment type
| Type | Required fields |
|------|-----------------|
| Salaried | Monthly income, existing EMI obligations |
| Self-Employed | Annual profit, Annual turnover, existing EMI obligations |

---

# Feature 2 — Step 2: Review Bank Offers

### What it does
Renders a list of pre-approved offers from partner banks returned by Easiloan. Each card shows the bank, loan amount, interest rate, and indicative EMI.

### Preconditions
- Eligibility submitted in Step 1.
- Easiloan returned at least one offer.

### How to use
1. Read each offer card:
   - **Bank name**.
   - **Loan amount** offered.
   - **Interest rate**.
   - **Monthly EMI** (indicative).
2. Compare across banks.
3. Tap the offer you prefer to select it.

### Result
Your selection is stored in the `homeLoanBankSelected` field. The portal moves to Step 3 to confirm.

---

# Feature 3 — Step 3: Apply for Loan

### What it does
Confirms your chosen offer and submits a formal loan application to the partner bank.

### Preconditions
- An offer is selected from Step 2.

### How to use
1. Review the selected offer summary.
2. Click **Apply** / **Confirm**.

### Result
- A formal loan application is initiated with the selected bank.
- Application details are stored in your `RegistrationHomeLoan` record.
- The portal moves to Step 5 (Congratulations).

---

# Feature 4 — Pre-Approved Sanction (Alternative Path)

### What it does
Lets you skip the Easiloan flow if you have already secured a sanction letter from your own bank.

### Preconditions
- You hold an external sanction letter from a non-partner bank or independently of Easiloan.

### How to use
1. On the Home Loan landing screen, look for **"I Have a Pre-Approved Sanction Letter"**.
2. Click it.
3. Confirm the choice.

### Result
- `homeLoanOptedOut = true` is set on your record.
- You bypass Easiloan eligibility and offers.
- The portal proceeds directly to confirmation.

### Note
Choosing this path means **no Easiloan offers will be applied** to your registration. If you want competitive pre-approved offers, go through Steps 1–3 instead.

---

# Feature 5 — Step 5: Confirmation and HOME_LOAN Offer

### What it does
Confirms your loan application is submitted and — if you are eligible — applies the **HOME_LOAN** discount to your unit's Agreement Value.

### Preconditions
- Loan application submitted via Step 3 or sanction letter recorded via Step 4.

### How to use
1. Read the success card.
2. Click **Go to Home** to return to the Home Dashboard.
3. Open your **Unit Details** → **Cost Sheet** to see the HOME_LOAN discount applied.

### Result
- Loan application submitted at the bank.
- **HOME_LOAN offer** automatically applied (if you are eligible) — reduces the Agreement Value of your unit.
- The discount appears as a separate deduction line in your Cost Sheet.

---

## Tracking Fields Reference

| Field | Description |
|-------|-------------|
| homeLoanStep | 1 = Eligibility done, 2 = Bank selected |
| homeLoanOptedOut | True if you used the Pre-Approved Sanction path |
| homeLoanEmpType | `salaried` or `self_employed` |
| homeLoanMonthlyIncome | For salaried eligibility |
| homeLoanAnnualProfit | For self-employed eligibility |
| homeLoanBankSelected | JSON of selected Easiloan offer |
| loanApprovalStatus | Admin-reviewed approval status |

---

## Business Rules — Quick Lookup

1. Home loan flow is available after unit allocation (some configs allow pre-allocation access).
2. Completing the flow may unlock the **HOME_LOAN discount** on the unit.
3. Buyers with existing sanction letters can bypass Easiloan via Step 4.
4. `RegistrationHomeLoan` records with `loanApprovalStatus = admin_rejected` are excluded from the customer list view.
5. **NOC requirements** for bank disbursement are surfaced in the HomeLoanData component.
6. The HOME_LOAN discount is applied at the cost-sheet level and persists for the booked buyer regardless of subsequent offer changes (cost sheet is frozen at allocation).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| No offers returned at Step 2 | Eligibility profile doesn't meet partner-bank criteria | Try the Pre-Approved Sanction path; or contact your CP for guidance |
| Easiloan eligibility takes too long | Easiloan API delay | Wait; if 2+ minutes, refresh and retry |
| HOME_LOAN discount not applied after completion | Eligibility criteria not met, or admin approval pending | Check `loanApprovalStatus` with your CP; ask Admin for Home Loan Approval |
| Selected offer not stored | Network drop on selection | Re-select and confirm |
| Pre-Approved Sanction path missing | UI flag disabled in your environment | Contact CP — option may be region/project-controlled |
| Cost sheet shows HOME_LOAN but I never applied | Admin manually approved via Admin Portal | This is intentional — admin-approved discounts are valid |
| Cannot find Home Loan in menu | Unit not yet allocated | Complete allocation first |
| Bank changes interest rate after submission | Bank-side process — outside portal control | Contact the bank loan officer directly |
