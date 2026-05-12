# Home Loan Workflow — BRD

**Type:** Cross-Portal End-to-End Workflow
**Portals Involved:** Buyer Portal, Admin Portal
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

After completing KYC, buyers can optionally apply for a home loan through the XR Portal. The platform integrates with Easiloan (a third-party home loan aggregator) to check eligibility and present pre-approved loan offers from partner banks.

Completing the home loan flow may unlock the **HOME_LOAN offer** — an automatic discount applied to the buyer's unit Agreement Value.

Home loan is optional. Buyers who self-fund skip this entirely.

---

## 2. Who Is Involved

| Actor | Role |
|-------|------|
| Buyer | Initiates loan application, enters income details, selects bank offer |
| Easiloan | Third-party aggregator that checks eligibility and returns bank offers |
| Admin | Views loan status per buyer, can manually approve or reject applications |
| System | Creates RegistrationHomeLoan record, links disbursement to milestone payment |

---

## 3. Two Loan Paths

| Path | Description |
|------|-------------|
| **Easiloan** | Buyer applies through the portal — system sends income details to Easiloan, which returns pre-approved bank offers |
| **Self** | Buyer has their own bank loan already arranged — they declare it and admin manually approves |

---

## 4. Easiloan Path — Step by Step

1. Buyer opens Home Loan section in Buyer Portal (post-KYC)
2. Buyer selects employment type: Salaried or Self-Employed
3. **If Salaried:** enters monthly income + existing monthly EMI obligations
4. **If Self-Employed:** enters annual profit, annual turnover + existing monthly EMI obligations
5. System sends eligibility request to Easiloan API
6. Easiloan returns pre-approved offers from partner banks (loan amount, interest rate, EMI)
7. Buyer reviews offers and selects the one that works best
8. Formal loan application submitted to the selected bank via Easiloan
9. Bank processes and approves the application
10. **HOME_LOAN offer discount automatically applied to the buyer's unit**
11. Loan disbursement from the bank links to the FIRST_DISBURSEMENT milestone in the payment schedule

---

## 5. Self Path — Step by Step

1. Buyer opens Home Loan section, selects "I have a pre-approved sanction letter"
2. Buyer declares their own financing arrangement (`homeLoanOptedOut = true`)
3. Admin reviews and manually approves the application (`loanApprovalStatus = admin_approved`)
4. No Easiloan integration is triggered

---

## 6. Loan Approval Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Application submitted, awaiting processing |
| `approved` | Approved via Easiloan or admin |
| `admin_approved` | Manually approved by admin (self-path or override) |
| `admin_rejected` | Admin rejected — excluded from admin customer list home loan indicator |

---

## 7. Key Business Rules

1. **Post-KYC only:** Home loan flow is available only after KYC is submitted.
2. **HOME_LOAN offer impact:** Completing the Easiloan flow successfully may trigger an automatic discount on the unit's Agreement Value. This discount appears in the buyer's Cost Sheet.
3. **admin_rejected records hidden:** Applications with `admin_rejected` status are excluded from the home loan status column in admin customer views.
4. **Registration number suffix:** Easiloan path uses `-EL` suffix; self path uses `-SL` suffix on the loan registration number.
5. **FIRST_DISBURSEMENT milestone:** When the bank releases the loan tranche, this is credited against a specific milestone in the buyer's payment schedule.
6. **Audit logging:** All home loan record changes are fully audit-logged.

---

## How to Use: Home Loan Workflow

---

### Buyer: Applying Through Easiloan

**Step 1:** After completing KYC, navigate to **Home Loan** in the Buyer Portal.

**Step 2:** Select your employment type: **Salaried** or **Self-Employed**.

**Step 3:** Enter your income details:
- *Salaried:* Monthly income and any existing monthly EMI you're already paying
- *Self-Employed:* Annual profit, annual turnover, and existing monthly EMI

**Step 4:** Click **Check Eligibility**. Easiloan will check your eligibility and return bank offers.

**Step 5:** Review the pre-approved offers. Each shows the loan amount, interest rate, and your monthly EMI. Select the offer that works best for you.

**Step 6:** Click **Apply** to confirm. Your application is submitted to the bank.

**Result:** On approval, a **HOME_LOAN discount** is automatically applied to your unit's pricing. You can see this in your Cost Sheet.

---

### Buyer: Declaring Your Own Financing

**Step 1:** Navigate to **Home Loan** in the Buyer Portal.

**Step 2:** Click **I have a pre-approved sanction letter** (or similar option).

**Step 3:** Submit. Your declaration is recorded and sent to the admin for review.

**What happens next:** Admin will review and manually approve your self-arranged financing. You will be notified once approved.

---

### Admin: Managing Home Loan Applications

**Step 1:** Go to Customers module → find the customer → open their detail view.

**Step 2:** The Home Loan section shows the current `loanApprovalStatus` and the loan path selected.

**Step 3:** To approve a self-path application: click **Approve** → status updates to `admin_approved`.

**Step 4:** To reject: click **Reject** → status updates to `admin_rejected`. This record is then excluded from the home loan indicator in the main customer list.

---

## 8. Related Documents

- [[Home-Loan-Workflow]] — Technical home loan workflow reference
- [[Feature-Spec - Home Loan]] — Buyer Portal Feature-Spec
- [[BRD-Buyer-Portal]] — Buyer Portal overview
- [[BRD-Milestone-Payments]] — FIRST_DISBURSEMENT milestone linked to loan disbursement
- [[BRD-Offers]] — HOME_LOAN offer triggered by this workflow
