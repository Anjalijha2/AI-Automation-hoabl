# Feature-Spec: KYC (Know Your Customer)

**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/kyc`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: Complete KYC Verification

### 1.1 Objective

Allow buyers to submit their identity information and upload required documents to complete the KYC process required for property registration after a unit has been booked.

### 1.2 Scope

5-step process. Available only after the buyer has WINNER status (confirmed unit booking with payment completed).

### 1.3 Preconditions

- Buyer must be logged in
- Buyer must have WINNER status (unit booking payment confirmed)
- KYC must not already be submitted (`isKycSubmitted = false`)

### 1.4 KYC Steps Overview

| Step | Screen | Action |
|------|--------|--------|
| 1 | KycForm | Enter applicant information |
| 2 | KycTable / KycTable2 | Upload required documents |
| 3 | kycSummary | Review all information |
| 4 | E-Verification | Complete OTP digital verification |
| 5 | kycSuccess / paymentCongo | KYC confirmed |

---

### Step 1: Applicant Information

**Fields per applicant (primary and co-applicants):**

| Field | Validation |
|-------|-----------|
| Full Name | Required |
| Date of Birth | Required |
| PAN Number | Format: ABCDE1234F (5 alpha + 4 numeric + 1 alpha) |
| Aadhaar Number | 12 digits (e.g., 1234 5678 9012) |
| Full Current Address | Required, including pincode |
| Occupation | Required |
| Income Details | Required |
| Relationship | Blood relative only (Self for primary) |

**Co-applicant rules:**
- Maximum 4 applicants total (1 primary + 3 co-applicants)
- "Add Applicant" button disappears when limit is reached
- Label at limit: "Max. 4 Applicants allowed" (confirmed TC-CST-019)
- All relationships must be blood relatives

---

### Step 2: Document Upload

**Required documents per applicant:**

| Document | Requirement |
|----------|------------|
| Passport photograph | Any image file |
| PAN card image | Required |
| Aadhaar card — front | Required |
| Aadhaar card — back | Required |

**All 4 documents are mandatory per applicant.** (Confirmed TC-CST-020 — submission fails if any document is missing.)

---

### Step 3: Review and Confirm

- KYC Summary page shows: Registration Details, Booking Number, Selected Unit, Applicant count
- T&C checkbox present (unchecked by default)
- Buyer must tick T&C checkbox before clicking Confirm

---

### Step 4: E-Verification

- OTP sent to buyer's registered mobile number
- Buyer enters OTP to authenticate the submission
- `eVerificationCompleted = true` is set on success

---

### Step 5: KYC Confirmation

**Success screen shows:**
- Table: Registration No | KYC Number | Unit | No. of Applicants
- Process Status = "KYC Completed"
- "Download your Unit Details" link
- "Go to Home" button

### 1.5 KYC Status Flags

| Flag | When Set | Meaning |
|------|---------|---------|
| isKycSubmitted | After Step 5 | KYC form data submitted |
| eVerificationCompleted | After Step 4 | OTP e-verification completed |
| isKycPdfSubmitted | After PDF generation | KYC PDF generated and stored in Azure |
| selfKycSubmitted | If buyer self-submitted | Self-service KYC flag |
| bookingFormActivitySubmitted | After LSQ sync | Booking form synced to LeadSquared |

### 1.6 Business Rules

1. KYC is only accessible after the buyer has WINNER status
2. Each co-applicant requires all 4 documents — partial upload is not accepted
3. Aadhaar number: 12 digits
4. PAN number: ABCDE1234F format
5. Relationship must be a blood relative
6. After submission: documents uploaded to Azure Blob Storage; KYC PDF generated via Puppeteer; documents synced to LeadSquared

### 1.7 Digital Booking Form Download

Available after KYC submission via "Download your Unit Details" link. Shows:
- Registration No, Transaction IDs, Unit Number, Tower Name
- All applicant details: Name, Mobile, Email, Address, Relationship, PAN, Aadhaar

---

## How to Use: Completing Your KYC

**Who does this:** Buyer, after unit booking payment is confirmed

---

**Step 1 — Start KYC**

From your Home Dashboard, click **Complete KYC** (or navigate to the KYC section). The KYC form will load.

**Step 2 — Verify your primary applicant details**

Your details will be pre-filled from your registration. Click **Verify Details** next to your name. Review each field:
- Full legal name as it appears on your ID
- Date of birth
- PAN number (format: ABCDE1234F)
- Aadhaar number (12 digits)
- Full current address with pincode
- Occupation and income

Make any corrections if needed and submit.

**Step 3 — Add co-applicants (if applicable)**

If a family member is sharing the unit:
1. Click **+ Add Applicant**
2. Fill in their details — name, mobile, email, address, and relationship (must be a blood relative: Spouse, Parent, Child, Sibling)
3. Upload all 4 documents for this co-applicant

Repeat for up to 3 co-applicants. Once you reach 4 total, the Add Applicant button will no longer appear.

**Step 4 — Upload your documents**

For the primary applicant, upload all 4 required documents:
1. **Passport photograph**
2. **PAN card**
3. **Aadhaar card — front**
4. **Aadhaar card — back**

> All 4 must be uploaded. You cannot proceed if any are missing.

**Step 5 — Review the summary**

Click **Confirm** to open the KYC Summary. Check all details are correct. Tick the Terms and Conditions checkbox and click **Confirm** again.

**Step 6 — Complete e-verification**

An OTP will be sent to your registered mobile. Enter it to digitally verify your submission.

**Step 7 — KYC complete**

You will see a confirmation screen showing your Registration Number, KYC Number, and unit details.

Click **Download your Unit Details** to save a copy of your booking confirmation with all applicant information.

Click **Go to Home** to return to your dashboard where the Process Status will now show "KYC Completed."
