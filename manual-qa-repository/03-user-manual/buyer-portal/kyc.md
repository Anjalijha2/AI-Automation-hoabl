# Buyer Portal — KYC User Guide

**Audience:** Buyer / Customer (post-booking)
**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/kyc`
**Sources:** BUYER-BRD-Buyer-Portal.md · BUYER-FS-KYC.md
**Last Updated:** 2026-05-22

---

## Overview

KYC (Know Your Customer) is the mandatory identity-verification step you complete after your unit booking is confirmed. It is a 5-step process — fill applicant details, upload 4 mandatory documents per applicant, review summary, e-verify via OTP, and download your booking PDF.

KYC is **gated by WINNER status** — you cannot start it until your unit payment is confirmed. Until KYC is submitted, your Home Dashboard shows the orange warning **"Required to complete the allotment!"** and downstream operations (milestone schedule generation, agreement) cannot proceed.

You can have up to **4 applicants total**: yourself (primary) plus a maximum of **3 co-applicants**. All co-applicants must be **blood relatives**.

---

## Page Layout (At a Glance)

| Step | Screen | What you do |
|------|--------|-------------|
| 1 | KycForm | Enter applicant information |
| 2 | KycTable / KycTable2 | Upload 4 documents per applicant |
| 3 | kycSummary | Review and tick T&C |
| 4 | E-Verification | Enter OTP sent to your mobile |
| 5 | kycSuccess / paymentCongo | KYC confirmed; download booking PDF |

---

# Feature 1 — Step 1: Applicant Information

### What it does
Captures personal and identity details for the primary applicant and any co-applicants. The primary applicant's fields are auto-filled from your registration data.

### Preconditions
- You are logged in.
- WINNER status confirmed.
- `isKycSubmitted = false` (KYC not yet submitted).

### How to use
1. From the Home Dashboard, click **Complete KYC** (or open `/kyc`).
2. The primary applicant card opens with pre-filled data.
3. Click **Verify Details** next to your name.
4. Review every field:
   - **Full Name** — as on your government ID.
   - **Date of Birth**.
   - **PAN Number** — format `ABCDE1234F` (5 alpha + 4 numeric + 1 alpha).
   - **Aadhaar Number** — 12 digits, e.g. `1234 5678 9012`.
   - **Full Current Address** — including pincode.
   - **Occupation**.
   - **Income Details**.
   - **Relationship** — Self for primary applicant.
5. Correct anything wrong, then submit.
6. To add a co-applicant, click **+ Add Applicant**.
7. Fill all required fields for the co-applicant — Name, Mobile, Email, Address, Relationship (must be blood relative: Spouse / Parent / Child / Sibling).
8. Repeat up to 3 co-applicants.

### Result
All applicants are recorded against your registration. You proceed to document upload.

### Co-applicant rules
- Maximum **4 applicants total** (1 primary + 3 co-applicants).
- The **+ Add Applicant** button disappears at the limit.
- At the limit you see the label **"Max. 4 Applicants allowed"** (confirmed TC-CST-019).
- All relationships must be **blood relatives**.

### Validation rules
| Field | Rule |
|-------|------|
| PAN | Regex `ABCDE1234F` — 5 alpha + 4 numeric + 1 alpha |
| Aadhaar | Exactly 12 digits |
| Relationship | Blood relative only |
| Full Name | Required |
| Address | Required, with pincode |

---

# Feature 2 — Step 2: Document Upload

### What it does
Collects the 4 mandatory identity documents for every applicant — primary and each co-applicant.

### Preconditions
- Applicant details from Step 1 saved.

### How to use
For each applicant, upload all 4 documents:
1. **Passport photograph** — any image file.
2. **PAN card image**.
3. **Aadhaar card — front**.
4. **Aadhaar card — back**.

### Result
All applicants have all 4 documents uploaded; you can proceed to summary.

### Warnings
- **All 4 documents are mandatory per applicant.** Partial submissions are rejected (confirmed TC-CST-020).
- If you upload only 3 of 4 documents for a co-applicant, the **Confirm** button at Step 3 will not enable.
- File uploads land in Azure Blob Storage; ensure good network connectivity.

---

# Feature 3 — Step 3: Review and Confirm Summary

### What it does
Presents a final summary of your KYC before submission and collects your T&C consent.

### Preconditions
- All applicants have details + 4 documents.

### How to use
1. Click **Confirm** to open the KYC Summary page.
2. Read the summary card:
   - Registration Details
   - Booking Number
   - Selected Unit
   - Number of applicants
3. **Tick the T&C checkbox** (unchecked by default).
4. Click **Confirm**.

### Result
Your data is staged for e-verification. The portal moves to Step 4.

### Warning
The T&C checkbox is mandatory. Confirm is disabled until you tick it.

---

# Feature 4 — Step 4: E-Verification via OTP

### What it does
Authenticates the submission with a one-time password sent to your registered mobile number, locking your identity to the submission.

### Preconditions
- Step 3 confirmed.

### How to use
1. An OTP is dispatched to your registered mobile via Kaleyra (SMS / WhatsApp).
2. Enter the OTP in the verification field.
3. Click **Verify**.

### Result
- `eVerificationCompleted = true` is set on your KYC record.
- The portal moves to Step 5.

---

# Feature 5 — Step 5: KYC Confirmation and Booking PDF

### What it does
Displays the success screen with all the artefacts you need — KYC number, unit summary, and a downloadable booking PDF.

### Preconditions
- E-verification succeeded.

### How to use
1. Read the success card:
   - **Registration No.**
   - **KYC Number**.
   - **Unit**.
   - **No. of Applicants**.
2. Click **Download your Unit Details** to download the Digital Booking Form PDF.
3. Click **Go to Home** to return to the Home Dashboard.

### Result
- `isKycSubmitted = true` on the registration.
- A KYC PDF is generated via Puppeteer and stored in Azure Blob.
- All documents are synced to LeadSquared (LSQ).
- Home Dashboard **Process Status** now reads **"KYC Completed"**.
- Milestone payment schedule generation pipeline triggers (Payment Schedule begins to populate post-this step).

### Digital Booking Form contents
- Registration No, Transaction IDs, Unit Number, Tower Name.
- Per-applicant: Name, Mobile, Email, Address, Relationship, PAN, Aadhaar.

---

## KYC Status Flags Reference

| Flag | When Set | Meaning |
|------|----------|---------|
| isKycSubmitted | After Step 5 | KYC form data submitted |
| eVerificationCompleted | After Step 4 | OTP verification complete |
| isKycPdfSubmitted | After PDF generation | KYC PDF stored in Azure |
| selfKycSubmitted | If buyer self-submitted | Self-service KYC flag |
| bookingFormActivitySubmitted | After LSQ sync | Booking form synced to LSQ |

---

## Business Rules — Quick Lookup

1. KYC is only accessible after **WINNER** status.
2. **Max 4 applicants** (1 primary + 3 co-applicants).
3. All co-applicants must be **blood relatives**.
4. **All 4 documents per applicant are mandatory.**
5. PAN format: `ABCDE1234F`. Aadhaar: 12 digits.
6. After submission: Azure upload + Puppeteer PDF + LSQ sync.
7. T&C checkbox is mandatory at Step 3.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Complete KYC button missing on dashboard | WINNER status not yet propagated | Wait 30–60 seconds; refresh |
| PAN field rejects valid PAN | Spaces or wrong case | Use upper-case alpha only; remove spaces |
| Aadhaar field rejects 12 digits | Hidden whitespace or formatting | Remove spaces; enter exactly 12 digits |
| Cannot add a 5th applicant | Hard cap at 4 — feature working as designed | Choose your 4 most important applicants |
| Confirm disabled at Summary | T&C checkbox unticked, or a co-applicant has <4 documents | Tick T&C; check every applicant has all 4 documents |
| OTP not received at Step 4 | Kaleyra delay or wrong mobile | Click resend; if still no OTP, verify mobile on file via CP |
| Booking PDF download fails | CDN/blob momentary outage | Wait and retry; if persistent, raise Support Ticket (GENERAL) |
| Process Status shows KYC Pending even after submission | Backend processing in flight | Wait a minute; refresh; if stuck, raise Support Ticket |
| Co-applicant relationship rejected | Selected relation is not a blood relative | Choose Spouse / Parent / Child / Sibling only |
