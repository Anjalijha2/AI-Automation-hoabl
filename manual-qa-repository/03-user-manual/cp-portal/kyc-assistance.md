# CP Portal — KYC Assistance User Guide

**Portal:** Channel Partner (Growth Partner) Portal
**URL:** `https://uat-web.xrportal.in/kyc`
**Sources:** CP-BRD-CP-Portal.md · CP-FS-KYC-Assistance.md
**Last Updated:** 2026-05-22
**Audience:** Channel Partner / Sales Agent

---

## Overview

KYC Assistance lets you, the CP, complete the Know-Your-Customer form on behalf of a customer **after** their unit allocation has been confirmed (WINNER status with paid booking). You capture each applicant's identity details (PAN, Aadhaar, address, income), upload four mandatory documents per applicant, and submit the entire KYC packet. On submission, documents land in Azure Blob Storage, sync to LeadSquared (CRM), and a consolidated KYC PDF is generated server-side.

KYC is post-allocation only — the screen will be unavailable (or show an empty/disabled state) for customers who have not yet reached WINNER status. Up to **4 applicants** (1 primary + 3 co-applicants) can be added per registration; the limit is hard-enforced.

---

## Page Layout (At a Glance)

1. **Customer Header** — registration number, allocated unit, primary applicant name (pre-filled).
2. **Applicant Forms** — one tabbed/expandable section per applicant. The primary applicant is mandatory; co-applicants are optional up to a total of 4.
3. **Document Upload Slots** — four per applicant: Photo, PAN, Aadhaar Front, Aadhaar Back.
4. **Add Applicant Button** — adds a co-applicant. Disappears once the 4-applicant limit is reached.
5. **Submit KYC Button** — gated by all-required-fields-filled and all-documents-uploaded.

---

# Feature 1 — Complete KYC for the Primary Applicant

### What it does
Captures the primary buyer's KYC details and uploads the four mandatory identity documents to the registration unit record.

### Preconditions
- The customer has WINNER status on their registration (booked unit with completed payment).
- You have access to the customer's PAN, Aadhaar, recent photograph, address details, occupation, and income.

### How to use
1. From the navigation menu, click **KYC**.
2. The KYC form opens with the primary applicant section pre-filled from the customer's original registration (name, mobile, email may already be populated).
3. Verify pre-filled fields and complete any missing ones:
   - **Full Name** — exactly as on the official ID
   - **Date of Birth**
   - **PAN Number** — format `ABCDE1234F` (5 alpha + 4 numeric + 1 alpha)
   - **Aadhaar Number** — 12 digits
   - **Full Current Address** — including pincode
   - **Occupation** — salaried / self-employed / business / etc.
   - **Income Details** — monthly or annual income
4. Upload all four documents in the primary applicant's document section (see Feature 3).
5. Move on to add co-applicants (Feature 2) or skip to submit.

### Result
The primary applicant section is saved into form state. The Submit button remains disabled until all four documents are uploaded for the primary applicant AND any added co-applicants.

---

# Feature 2 — Add Co-Applicants (up to 3)

### What it does
Adds joint applicants (blood relatives) to the same KYC packet. Used when the unit is being purchased jointly — e.g., spouse, parent, child as a co-owner.

### Preconditions
- You have the co-applicant's full KYC details and four documents.
- The co-applicant is a **blood relative** of the primary applicant (business rule).
- The total applicant count (primary + co-applicants) does not yet exceed 4.

### How to use
1. Below the primary applicant section, click **+ Add Applicant**.
2. A new applicant section opens. Fill in the same fields as the primary: Full Name, DOB, PAN, Aadhaar, Address, Occupation, Income.
3. Specify **Relationship** to the primary applicant (must be a blood relative).
4. Upload all four documents for this co-applicant (see Feature 3).
5. Repeat steps 1–4 for additional co-applicants if needed.

### Result
- Each co-applicant has its own fully-filled section and four documents.
- The **+ Add Applicant** button disappears once you reach 4 total applicants.

### Warning
- **Maximum 4 applicants per registration.** The Add Applicant button hides at the limit; do not attempt to bypass it.
- Relationship must be a blood relative. The form may not enforce this technically, but business rules require it and downstream verification will reject non-blood-relative joint applicants.

---

# Feature 3 — Upload the Four Required Documents

### What it does
Uploads the four mandatory KYC documents for an applicant: Passport-style photograph, PAN card image, Aadhaar front, Aadhaar back. Files are stored in Azure Blob Storage with organised naming conventions.

### Preconditions
- You have all four documents as files (image or PDF, per UI hints).
- Each file is within the configured size limit.

### How to use
1. In the applicant's section, locate the four document slots: **Photo**, **PAN**, **Aadhaar Front**, **Aadhaar Back**.
2. For each slot, click the upload button and select the corresponding file.
3. Wait for the upload progress indicator to reach 100% and show a confirmation.
4. Repeat for every applicant.

### Result
- Files uploaded to Azure Blob with naming conventions tied to the registration unit + applicant index.
- The Submit button enables only after all four slots for every applicant are populated.

### Warning
- **All 4 documents are mandatory per applicant.** A partial upload (e.g., missing Aadhaar back) will block submission.
- The naming convention is fixed by the backend — do not rename files before upload; use the slots as labelled.

---

# Feature 4 — Submit KYC

### What it does
Persists the entire KYC packet (all applicants + all documents) to the registration unit, syncs documents to LeadSquared, generates the consolidated KYC PDF, and notifies the customer.

### Preconditions
- All applicant fields are filled.
- All four documents are uploaded for every applicant.
- The customer's unit allocation is confirmed (WINNER).

### How to use
1. Re-check every applicant section: all fields filled, all four documents uploaded.
2. (Optional) Complete e-verification via OTP if your build prompts for it — this sets `eVerificationCompleted = true`.
3. Click **Submit KYC**.
4. Wait for the success confirmation.

### Result
- `RegistrationUnit.isKycSubmitted` set to `true`.
- All documents synced to LeadSquared CRM.
- Consolidated KYC PDF generated via Puppeteer and stored in Azure Blob Storage.
- Customer receives a Kaleyra SMS/WhatsApp confirming KYC submission.
- Dashboard for this customer now shows `KYC Submitted`.

### Warning
- KYC is post-allocation only — if you do not see the KYC form populated for a customer, confirm they have WINNER status first.
- Once submitted, KYC cannot be self-edited from this screen. Corrections require escalation through your manager / admin team.

---

## Per-Applicant Field Reference

| Field | Required | Format / Notes |
|-------|----------|----------------|
| Full Name | Yes | As on official ID |
| Date of Birth | Yes | DD/MM/YYYY or per UI |
| PAN Number | Yes | `ABCDE1234F` — 5 alpha + 4 numeric + 1 alpha |
| Aadhaar Number | Yes | 12 digits |
| Full Address | Yes | Including pincode |
| Occupation | Yes | Salaried / Self-employed / Business / etc. |
| Income Details | Yes | Monthly or annual amount |
| Relationship (co-applicants) | Yes | Blood relative to primary applicant |

---

## Required Documents Per Applicant

| Document | Required | Notes |
|----------|----------|-------|
| Passport-style photograph | Yes | Image file |
| PAN card image | Yes | Image or PDF |
| Aadhaar card — front | Yes | Image or PDF |
| Aadhaar card — back | Yes | Image or PDF |

**All four are mandatory.** Partial uploads block submission.

---

## Business Rules

1. **Post-allocation only.** KYC is available only after WINNER status is confirmed on the registration (BRD §4.8).
2. **All 4 documents mandatory per applicant** (BRD §4.9).
3. **Max 4 applicants** (1 primary + 3 co-applicants). UI Add button hides at the limit.
4. **Blood relatives only** for co-applicants.
5. **PAN format** `ABCDE1234F` (5 alpha + 4 numeric + 1 alpha).
6. **Aadhaar format** 12 digits.
7. **Documents persisted to Azure Blob.** Naming convention organised by registration unit + applicant index.
8. **CRM sync.** Documents pushed to LeadSquared on submit.
9. **PDF generation.** A consolidated KYC PDF is generated via Puppeteer and stored in Azure Blob.

---

## Role Restrictions

| Role | Can submit KYC? |
|------|----------------|
| CP who registered the customer | Yes |
| Other CP | No — KYC screen is gated to the registering CP only |

---

## Notifications Dispatched

| Action | Channel | Recipient |
|--------|---------|-----------|
| Successful KYC submission | Kaleyra SMS / WhatsApp | Customer |
| Document upload | None (silent) | — |
| e-Verification OTP | Kaleyra SMS / WhatsApp | Applicant (if enabled) |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| KYC form is empty / disabled for a customer | Customer has not reached WINNER status yet | Wait for unit booking + payment confirmation; re-check Dashboard status |
| Submit button stays disabled | A required field is empty or a document is missing | Walk every applicant section and confirm all 4 documents are uploaded |
| PAN validation fails | Wrong format (e.g., `ABCD12345E`) | Use exactly `ABCDE1234F` — 5 letters, 4 digits, 1 letter |
| Aadhaar validation fails | Fewer/more than 12 digits, or non-numeric characters | Enter exactly 12 digits, no spaces |
| Add Applicant button missing | 4-applicant limit reached | This is the hard cap — cannot exceed 4 total |
| Document upload fails / times out | File too large or unsupported format | Compress/convert the file and retry |
| Submitted KYC needs correction | Self-edit not allowed post-submission | Escalate to manager / admin team |
