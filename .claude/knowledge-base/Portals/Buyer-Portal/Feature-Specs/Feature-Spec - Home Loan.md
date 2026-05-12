# Feature-Spec: Home Loan

**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/homeloan`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: Home Loan Eligibility and Application

### 1.1 Objective

Allow buyers to check their home loan eligibility and apply for pre-approved loans from partner banks through the Easiloan integration, potentially unlocking a HOME_LOAN offer discount on their unit.

### 1.2 Scope

5-step flow. Available after unit allocation. Integrates with Easiloan API for eligibility assessment and bank offer returns.

### 1.3 Preconditions

- Buyer must be logged in
- Buyer should have a confirmed unit (allocation). Flow may be accessible before allocation in some configurations.

### 1.4 Home Loan Flow — 5 Steps

---

**Step 1: Loan Eligibility Check (LoanEligibilityCheck)**

| Employment Type | Fields Required |
|-----------------|----------------|
| Salaried | Monthly income, existing EMI obligations |
| Self-Employed | Annual profit, annual turnover, existing EMI obligations |

- Buyer selects employment type and enters financial details
- Data submitted to Easiloan API for eligibility assessment

---

**Step 2: Loan Offers Review (LoanOffersReview)**

- Easiloan returns pre-approved loan offers from partner banks
- Each offer shows: loan amount, interest rate, monthly EMI, bank name
- Buyer reviews and selects their preferred offer
- Selection stored in `homeLoanBankSelected` field

---

**Step 3: Apply Loan (ApplyLoan)**

- Buyer confirms their selected offer
- Formal loan application is initiated with the selected bank
- Application details stored in `RegistrationHomeLoan` record

---

**Step 4: Pre-Approved Loan Option (PreapprovedLoan)**

- If buyer already has an external sanction letter from their own bank, they can skip the Easiloan flow
- `homeLoanOptedOut = true` marks this choice
- Buyer proceeds without going through Easiloan's eligibility assessment

---

**Step 5: Confirmation (Congratulations)**

- Loan application submitted successfully
- **HOME_LOAN offer** is automatically applied to the buyer's unit (if eligible)
- This offer reduces the Agreement Value of the unit

### 1.5 Home Loan Tracking Fields

| Field | Description |
|-------|-------------|
| homeLoanStep | 1 = Completed eligibility, 2 = Completed bank selection |
| homeLoanOptedOut | True if buyer has external sanction letter and bypassed Easiloan |
| homeLoanEmpType | salaried / self_employed |
| homeLoanMonthlyIncome | Monthly income for salaried eligibility |
| homeLoanAnnualProfit | Annual profit for self-employed eligibility |
| homeLoanBankSelected | JSON of selected bank offer from Easiloan |
| loanApprovalStatus | Admin-reviewed approval status |

### 1.6 Business Rules

1. Home loan flow is available after unit allocation
2. Completing the flow may unlock the HOME_LOAN offer discount on the unit
3. Buyers with an existing sanction letter can opt out of Easiloan and record their own bank's offer
4. `RegistrationHomeLoan` records with `loanApprovalStatus = admin_rejected` are excluded from the customer list view
5. NOC requirements for bank disbursement are shown in HomeLoanData component

---

## How to Use: Applying for a Home Loan

**Who does this:** Buyer, after unit allocation is confirmed

---

**Step 1 — Navigate to Home Loan**

From the navigation menu, tap or click **Home Loan**. The home loan section will open.

**Option A — Check your eligibility through Easiloan**

**Step 2 — Select your employment type**

Choose whether you are **Salaried** or **Self-Employed**.

**Step 3 — Enter your financial details**

- **If Salaried:** Enter your monthly income and any existing EMI obligations
- **If Self-Employed:** Enter your annual profit, annual turnover, and existing EMI obligations

Click **Check Eligibility**. Easiloan will process your details and return loan offers.

**Step 4 — Review and select a loan offer**

You will see pre-approved offers from partner banks showing the loan amount, interest rate, and monthly EMI for each. Select the offer that works best for you and click **Apply**.

**Step 5 — Confirm your application**

Review your selection and click **Confirm**. Your formal loan application will be submitted.

**Option B — I already have a home loan sanction letter**

If your bank has already approved your loan, click **I Have a Pre-Approved Sanction Letter**. You will skip the Easiloan flow and proceed directly to confirmation.

**Result:** After completing the home loan process, a **HOME_LOAN discount** may be automatically applied to your unit's pricing. This reduces the Agreement Value of your unit.
