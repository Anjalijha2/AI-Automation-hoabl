# Test Cases — Home Loan
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Home-Loan.md

---

## Home Loan — Entry & Navigation

### BYR_LOAN_001 — Home Loan menu visible after unit allocation

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Buyer has confirmed unit allocation |
| **Test Steps** | 1. Inspect main nav |
| **Expected Result** | Home Loan nav item visible and clickable |
| **Priority** | High |

---

### BYR_LOAN_002 — Click Home Loan navigates to /homeloan

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Allocation confirmed |
| **Test Steps** | 1. Click Home Loan menu |
| **Expected Result** | URL = `/homeloan`; LoanEligibilityCheck (Step 1) renders |
| **Priority** | Critical |

---

### BYR_LOAN_003 — Two flow paths offered: Easiloan or Pre-Approved

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Home Loan landing visible |
| **Test Steps** | 1. Inspect available options |
| **Expected Result** | Two CTAs: "Check Eligibility" (Easiloan path) and "I Have a Pre-Approved Sanction Letter" |
| **Priority** | High |

---

## Home Loan — S1 Salaried Eligibility

### BYR_LOAN_004 — Employment type toggle defaults to Salaried

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Step 1 open |
| **Test Steps** | 1. Inspect employment toggle |
| **Expected Result** | "Salaried" preselected by default |
| **Priority** | Medium |

---

### BYR_LOAN_005 — Salaried form shows monthly income and EMI fields

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Salaried selected |
| **Test Steps** | 1. Inspect form fields |
| **Expected Result** | Two fields visible: Monthly Income (required), Existing EMI Obligations (required) |
| **Priority** | High |

---

### BYR_LOAN_006 — Monthly income accepts only positive numeric values

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Salaried form visible |
| **Test Steps** | 1. Enter "abc"<br>2. Enter "-5000"<br>3. Enter "50000" |
| **Expected Result** | Non-numeric and negatives rejected; positive accepted |
| **Priority** | High |

---

### BYR_LOAN_007 — Check Eligibility disabled until required fields filled

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Salaried form empty |
| **Test Steps** | 1. Inspect Check Eligibility button<br>2. Fill all fields<br>3. Re-inspect |
| **Expected Result** | Disabled until all required fields valid; then enabled |
| **Priority** | High |

---

## Home Loan — S1 Self-Employed Eligibility

### BYR_LOAN_008 — Switch to Self-Employed reveals 3 fields

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Step 1 open |
| **Test Steps** | 1. Toggle to Self-Employed<br>2. Inspect fields |
| **Expected Result** | Three fields shown: Annual Profit, Annual Turnover, Existing EMI Obligations |
| **Priority** | High |

---

### BYR_LOAN_009 — All Self-Employed fields validated for positive numeric

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Self-Employed form visible |
| **Test Steps** | 1. Enter invalid then valid values in each field |
| **Expected Result** | Non-numeric/negative rejected; positives accepted |
| **Priority** | High |

---

## Home Loan — S1 Submit to Easiloan

### BYR_LOAN_010 — Submitting eligibility calls Easiloan API

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Form filled with valid values |
| **Test Steps** | 1. Click Check Eligibility<br>2. Observe network call |
| **Expected Result** | POST to Easiloan API made with employment + financial data |
| **Priority** | Critical |

---

### BYR_LOAN_011 — homeLoanStep = 1 set after successful submission

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Eligibility submitted successfully |
| **Test Steps** | 1. Verify backend `homeLoanStep` flag |
| **Expected Result** | `homeLoanStep = 1` persisted |
| **Priority** | High |

---

### BYR_LOAN_012 — Easiloan failure shows graceful error

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Easiloan API simulated down |
| **Test Steps** | 1. Submit eligibility |
| **Expected Result** | Error message; retry available; no data corruption |
| **Priority** | Medium |

---

## Home Loan — S2 Offers Review

### BYR_LOAN_013 — Offer list renders all returned banks

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Easiloan returns 3+ offers |
| **Test Steps** | 1. Inspect LoanOffersReview list |
| **Expected Result** | One card per offer; all returned banks shown |
| **Priority** | High |

---

### BYR_LOAN_014 — Each offer card shows amount, rate, EMI, bank

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Offer cards visible |
| **Test Steps** | 1. Inspect each card |
| **Expected Result** | Loan amount, interest rate %, monthly EMI, and bank name all rendered |
| **Priority** | High |

---

### BYR_LOAN_015 — Only one offer selectable at a time

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Multiple offers visible |
| **Test Steps** | 1. Click offer A<br>2. Click offer B |
| **Expected Result** | Selection moves to B; A deselected; radio-style behaviour |
| **Priority** | High |

---

### BYR_LOAN_016 — Apply button disabled until offer selected

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | No offer selected |
| **Test Steps** | 1. Inspect Apply button<br>2. Select offer<br>3. Re-inspect |
| **Expected Result** | Disabled when no selection; enabled once selected |
| **Priority** | High |

---

### BYR_LOAN_017 — Selection persists in homeLoanBankSelected

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Offer selected and Apply clicked |
| **Test Steps** | 1. Inspect backend `homeLoanBankSelected` |
| **Expected Result** | JSON of selected bank offer stored |
| **Priority** | High |

---

## Home Loan — S3 Apply Loan

### BYR_LOAN_018 — Confirmation screen shows chosen offer details

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Apply clicked on Step 2 |
| **Test Steps** | 1. Inspect Apply Loan screen |
| **Expected Result** | Selected bank, amount, rate, EMI summarised before final submit |
| **Priority** | High |

---

### BYR_LOAN_019 — Confirm submits formal application and creates RegistrationHomeLoan record

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Apply Loan visible |
| **Test Steps** | 1. Click Confirm<br>2. Verify backend |
| **Expected Result** | RegistrationHomeLoan record created with selected bank and offer; homeLoanStep = 2 |
| **Priority** | Critical |

---

## Home Loan — S4 Pre-Approved

### BYR_LOAN_020 — "I have a sanction letter" CTA skips Easiloan

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Home Loan landing visible |
| **Test Steps** | 1. Click "I Have a Pre-Approved Sanction Letter" |
| **Expected Result** | Navigates to PreapprovedLoan screen; Easiloan flow bypassed |
| **Priority** | High |

---

### BYR_LOAN_021 — homeLoanOptedOut = true when opt-out chosen

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Pre-approved path completed |
| **Test Steps** | 1. Submit pre-approved details<br>2. Verify backend |
| **Expected Result** | `homeLoanOptedOut = true` persisted |
| **Priority** | High |

---

### BYR_LOAN_022 — Pre-approved form captures own bank's offer details

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | PreapprovedLoan screen open |
| **Test Steps** | 1. Inspect form fields |
| **Expected Result** | Fields for bank name, amount, sanction letter upload |
| **Priority** | Medium |

---

## Home Loan — S5 Confirmation & Offer

### BYR_LOAN_023 — Congratulations screen rendered on success

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Step 3 or 4 confirmed |
| **Test Steps** | 1. Inspect final screen |
| **Expected Result** | Congratulations screen with success message and next steps |
| **Priority** | High |

---

### BYR_LOAN_024 — HOME_LOAN offer auto-applied to unit cost sheet

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Buyer eligible for HOME_LOAN offer, application complete |
| **Test Steps** | 1. Open Unit Details → Cost Sheet<br>2. Inspect Offers row |
| **Expected Result** | HOME_LOAN discount applied; Agreement Value reduced |
| **Priority** | Critical |

---

### BYR_LOAN_025 — Admin-rejected loan excluded from customer list view

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Admin sets `loanApprovalStatus = admin_rejected` |
| **Test Steps** | 1. Refresh Home Loan view<br>2. Inspect status |
| **Expected Result** | Rejected record excluded from customer list per BR 4 |
| **Priority** | Medium |

---

## Home Loan — Tracking & NOC

### BYR_LOAN_026 — HomeLoanData component shows NOC requirements

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Loan application in progress |
| **Test Steps** | 1. Inspect HomeLoanData section |
| **Expected Result** | NOC requirements for bank disbursement clearly listed |
| **Priority** | Medium |

---

### BYR_LOAN_027 — homeLoanEmpType correctly stored as salaried/self_employed

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Eligibility submitted with each employment type |
| **Test Steps** | 1. Verify backend value |
| **Expected Result** | Either `salaried` or `self_employed` stored exactly |
| **Priority** | Medium |

---

## Home Loan — Negative & Edge Cases

### BYR_LOAN_028 — Buyer without allocation may see restricted access

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | No allocation; configuration restricts pre-allocation access |
| **Test Steps** | 1. Open `/homeloan` |
| **Expected Result** | Per configuration: either accessible (pre-allocation allowed) or blocked with message |
| **Priority** | Medium |

---

### BYR_LOAN_029 — Zero income rejected at eligibility check

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Salaried form |
| **Test Steps** | 1. Enter income = 0<br>2. Submit |
| **Expected Result** | Validation error; submission blocked |
| **Priority** | Medium |

---

### BYR_LOAN_030 — Existing EMI ≥ Income flagged

| Field | Value |
|-------|-------|
| **Module** | BYR – Home Loan |
| **Pre-conditions** | Salaried form |
| **Test Steps** | 1. Enter EMI equal to or greater than income<br>2. Submit |
| **Expected Result** | Either rejected at frontend or Easiloan returns no offers; buyer sees "Not eligible" message |
| **Priority** | Medium |

---
