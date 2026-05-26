# Feature-Spec: KYC Assistance

**Portal:** Channel Partner Portal
**URL:** `https://uat.xrportal.in/kyc`
**Created:** 2026-05-12
**Status:** Complete

---

<!-- FSD-CORRECTION 2026-05-25 — CRITICAL SECURITY GAP -->
> ⚠️ **`POST /api/v1/cp/registration` is UNAUTHENTICATED.** No auth middleware (`protect` / `restrictTo`) on this endpoint. Any caller (no token required) can submit CP self-KYC data. // Source: cp.routes.js (CP registration route)
>
> Additionally: a logged-in CP-A can submit KYC for CP-B by passing CP-B's phone number — no ownership check. // Source: cp.controller.js (KYC submit handler)

## Feature 1: Assist Customer KYC After Unit Allocation

### 1.1 Objective

<!-- FSD-CORRECTION 2026-05-25 -->
Allow CPs to complete **their own** KYC (Know Your Customer) self-registration. **No backend endpoint exists for CPs to submit KYC on behalf of a buyer** — buyer-KYC-via-CP is a buyer-portal flow, not a CP-portal flow. // Source: cp.routes.js (only `/cp/registration` and `/cp/kyc` endpoints exist)

### 1.2 Scope

<!-- FSD-CORRECTION 2026-05-25 -->
CP self-KYC only (`POST /cp/registration` — unauthenticated). The WINNER-prerequisite and buyer-KYC-on-behalf described below do NOT correspond to any implemented backend endpoint.

### 1.3 Preconditions

- CP must be logged in (for `/cp/kyc` read) — **NOT required for `/cp/registration` submit** (unauthenticated)

### 1.4 KYC Form — Applicant Fields

For each applicant (primary and co-applicants):

| Field | Description |
|-------|-------------|
| Full Name | Legal name as on ID |
| Date of Birth | Required for all applicants |
| PAN Number | Format: ABCDE1234F |
| Aadhaar Number | 12-digit format |
| Full Current Address | Including pincode |
| Occupation | Employment type |
| Income Details | Monthly/annual income |
| Relationship | Blood relative relationship to primary applicant |

### 1.5 Required Documents Per Applicant

| Document | Requirement |
|----------|------------|
| Passport photograph | Any image file |
| PAN card image | Required |
| Aadhaar card — front | Required |
| Aadhaar card — back | Required |

**All 4 documents are mandatory per applicant.** Submission is blocked if any are missing.

### 1.6 Co-Applicant Rules

- Maximum 4 applicants total (1 primary + 3 co-applicants)
- "Add Applicant" button is hidden/disabled once the limit is reached
- All relationships must be blood relatives
- Each co-applicant requires the same 4 documents as the primary applicant

### 1.7 Validations and Business Rules

1. KYC can only be submitted after unit allocation is confirmed (WINNER status)
2. Aadhaar number: 12 digits
3. PAN number: format ABCDE1234F (5 alpha + 4 numeric + 1 alpha)
4. All 4 documents per applicant are required — partial upload is not accepted
5. Maximum file size and format restrictions apply to document uploads
6. E-verification via OTP can be completed to confirm authenticity (`eVerificationCompleted` flag)

### 1.8 System Actions on Submission

1. KYC data saved to the registration unit record
2. Documents uploaded to Azure Blob Storage with organized naming conventions
3. `isKycSubmitted = true` set on the registration unit record
4. Documents synced to LeadSquared CRM
5. KYC PDF generated (via Puppeteer) and stored in Azure Blob Storage

### 1.9 Notifications

- Customer receives confirmation of KYC submission

---

## How to Use: Completing KYC for Your Customer

**Who does this:** Channel Partner, after customer unit payment is confirmed

---

**Step 1 — Navigate to KYC**

From the navigation menu, click **KYC**. The KYC form will load for the customer whose unit has been allocated.

**Step 2 — Fill in primary applicant details**

Some fields may be pre-filled from the customer's registration. Verify and complete any missing information:
- Legal full name, date of birth
- PAN number (format: ABCDE1234F)
- Aadhaar number (12 digits)
- Full address including pincode
- Occupation and income details

**Step 3 — Upload primary applicant documents**

Upload all 4 required documents:
1. **Passport photograph**
2. **PAN card image**
3. **Aadhaar card — front**
4. **Aadhaar card — back**

> All 4 documents are required. You will not be able to submit without all of them.

**Step 4 — Add co-applicants (if any)**

If the customer has co-applicants (family members sharing the unit):
1. Click **+ Add Applicant**
2. Fill in their details — name, contact, address, and relationship (must be a blood relative)
3. Upload all 4 documents for each co-applicant

You can add up to 3 co-applicants (4 total including the primary). The Add Applicant button will disappear once this limit is reached.

**Step 5 — Submit KYC**

Once all applicant details and documents are complete, click **Submit KYC**.

On success, the customer's KYC status will update to completed and the registration unit will show `KYC Submitted`.
