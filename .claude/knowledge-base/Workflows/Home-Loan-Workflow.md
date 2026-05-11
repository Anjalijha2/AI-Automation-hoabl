---
type: workflow
tags: [workflow, home-loan, easiloan, financing]
updated: 2026-05-10
status: complete
---

# Home Loan Workflow

**Related:** [[Buyer-Portal-BRD]] | [[Milestone-Payments]] | [[KYC-Workflow]] | [[Integrations]]

---

## 1. What Is This?

After a buyer completes KYC and receives their payment schedule, they can optionally apply for a home loan through the XR Portal. The platform integrates with **Easiloan** (a third-party home loan aggregator) to facilitate loan applications, bank selection, and disbursement tracking.

Home loan is optional — buyers who can self-fund skip this entirely.

---

## 2. Loan Types

| Type | Description |
|------|-------------|
| `self` | Buyer arranges their own bank loan outside the platform |
| `easiloan` | Buyer applies through the Easiloan integration within the portal |

---

## 3. Data Model — RegistrationHomeLoan

One record per registration. Created when buyer initiates the home loan process.

| Field | Type | Description |
|-------|------|-------------|
| `registrationId` | FK | Linked to buyer's registration |
| `step` | TINYINT | Current step in the loan process (1 or 2) |
| `status` | ENUM | `in_progress` / `completed` |
| `loanType` | ENUM | `self` / `easiloan` |
| `employmentType` | ENUM | `salaried` / `self_employed` |
| `monthlyIncome` | DECIMAL | Monthly income (salaried buyers) |
| `annualProfit` | DECIMAL | Annual profit (self-employed buyers) |
| `annualTurnover` | DECIMAL | Annual turnover (self-employed buyers) |
| `monthlyOutgoingEmi` | DECIMAL | Existing EMI obligations |
| `selectedBank` | JSON | Bank selected from Easiloan response |
| `loanApprovalStatus` | ENUM | `pending` / `approved` / `admin_rejected` / `admin_approved` |
| `approvalSource` | ENUM | `user` / `admin` — who approved |
| `cibilScore` | INTEGER | Credit score |
| `registrationNumber` | STRING | Computed as `[regNo]-EL` (Easiloan) or `[regNo]-SL` (self) |

---

## 4. Loan Approval Status Flow

```
null (not started)
  → pending (application submitted)
  → approved (bank approved via Easiloan OR admin manually approved)
  → admin_rejected (admin rejected the application)
  → admin_approved (admin manually approved independent of Easiloan)
```

**Important:** Records with `loanApprovalStatus = admin_rejected` are excluded from the home loan indicator shown in the Admin Customers view.

---

## 5. Step-by-Step Workflow (Easiloan Path)

1. Buyer opens Home Loan section in Buyer Portal (post-KYC)
2. Buyer selects loan type: `Easiloan`
3. Buyer enters employment type — salaried or self-employed
4. Buyer enters income details (monthly income / annual profit + turnover)
5. Buyer enters existing monthly EMI obligations
6. System sends eligibility request to Easiloan API
7. Easiloan returns list of eligible banks with loan amounts and interest rates
8. Buyer selects preferred bank — saved as `selectedBank` JSON
9. Loan application status → `pending`
10. Easiloan processes application with selected bank
11. Bank approves → `loanApprovalStatus: approved`
12. Loan disbursement linked to `FIRST_DISBURSEMENT` milestone in payment schedule

---

## 6. Step-by-Step Workflow (Self Path)

1. Buyer opens Home Loan section in Buyer Portal
2. Buyer selects loan type: `self`
3. Buyer uploads proof of own financing (handled in KYC documents)
4. Admin reviews and manually sets `loanApprovalStatus: admin_approved`
5. No Easiloan integration triggered

---

## 7. Admin Actions

- View home loan status per buyer in Admin Customers module
- Manually approve (`admin_approved`) or reject (`admin_rejected`) loan applications
- Override Easiloan decision independently

---

## 8. Business Rules

1. Home loan is initiated only after KYC is submitted.
2. `admin_rejected` loans are hidden from the admin customer list home loan indicator — only `pending`, `approved`, `admin_approved` are shown.
3. Easiloan registration number suffix: `-EL` for Easiloan path, `-SL` for self path.
4. Loan disbursement from the bank triggers the `FIRST_DISBURSEMENT` milestone payment tracking record.
5. Audit logging is enabled on `RegistrationHomeLoan` (`auditEnabled = true`).

---

## 9. Integration Points

| System | Role |
|--------|------|
| Easiloan | Bank eligibility API, bank selection, loan processing |
| Milestone Payments | `FIRST_DISBURSEMENT` milestone credited on bank disbursement |
| Admin Portal | Admin views and overrides loan approval status |
| Buyer Portal | Buyer initiates loan, views status |
| LeadSquared (CRM) | Loan status events synced to buyer activity trail |
