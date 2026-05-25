# Test Cases — KYC Assistance
**Portal:** Channel Partner Portal
**BRD Reference:** CP-BRD-CP-Portal.md / CP-FS-KYC-Assistance.md

---

## KYC Page Access

### CP_KYC_001 — Navigate to KYC from menu

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | CP logged in; at least one customer has WINNER status |
| **Test Steps** | 1. Click **KYC** in the navigation menu<br>2. Wait for page to render |
| **Expected Result** | URL updates to `/kyc`; KYC page loads showing the form or eligible customer list |
| **Priority** | Critical |

---

### CP_KYC_002 — KYC unavailable for customers below WINNER status

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | A customer is in WAITLIST / PREALLOCATED / ALLOCATED status |
| **Test Steps** | 1. Open KYC for that customer |
| **Expected Result** | KYC form is hidden or disabled; message indicates KYC available only post unit allocation/payment |
| **Priority** | Critical |

---

### CP_KYC_003 — KYC accessible for WINNER status customer

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | Customer has WINNER status (payment completed) |
| **Test Steps** | 1. Open KYC form for that customer |
| **Expected Result** | KYC form opens with editable fields and document upload areas |
| **Priority** | Critical |

---

### CP_KYC_004 — Logged-out user redirected from `/kyc`

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | No session |
| **Test Steps** | 1. Navigate to `/kyc` directly |
| **Expected Result** | Redirects to `/login` |
| **Priority** | High |

---

## Primary Applicant — Field Validation

### CP_KYC_005 — Primary applicant details pre-filled from registration

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open for WINNER customer |
| **Test Steps** | 1. Inspect Name, DOB (if known), Mobile, Email fields |
| **Expected Result** | Fields are pre-populated with values from Registration; remain editable |
| **Priority** | High |

---

### CP_KYC_006 — Verify all required applicant fields present

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Scan applicant fields |
| **Expected Result** | Full Name, DOB, PAN, Aadhaar, Address (with pincode), Occupation, Income, Relationship are visible |
| **Priority** | Critical |

---

### CP_KYC_007 — PAN format validation (ABCDE1234F)

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Enter `INVALID123` in PAN field<br>2. Blur the field |
| **Expected Result** | Inline error displayed: "PAN must be 5 letters + 4 digits + 1 letter" |
| **Priority** | Critical |

---

### CP_KYC_008 — PAN valid format accepted

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Enter `ABCDE1234F` in PAN field<br>2. Blur |
| **Expected Result** | No validation error; field accepts the value |
| **Priority** | High |

---

### CP_KYC_009 — Aadhaar must be exactly 12 digits

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Enter `12345` in Aadhaar field<br>2. Blur |
| **Expected Result** | Inline error "Aadhaar must be 12 digits" appears |
| **Priority** | Critical |

---

### CP_KYC_010 — Aadhaar rejects letters and special chars

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Try entering `abcd!@1234`<br>2. Observe field |
| **Expected Result** | Only numeric digits accepted in Aadhaar field |
| **Priority** | High |

---

### CP_KYC_011 — DOB cannot be in the future

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Open DOB picker<br>2. Pick a date 1 year in the future |
| **Expected Result** | Future date is disabled or validation error displayed |
| **Priority** | High |

---

### CP_KYC_012 — Address pincode validation (6 digits)

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Enter `12` in pincode<br>2. Blur |
| **Expected Result** | Validation error: "Pincode must be 6 digits" |
| **Priority** | Medium |

---

### CP_KYC_013 — Relationship to primary applicant — blood relative validation

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | Co-applicant form open |
| **Test Steps** | 1. Open the Relationship dropdown<br>2. Read available options |
| **Expected Result** | Only blood-relative options listed (Spouse, Father, Mother, Son, Daughter, Brother, Sister, etc.); Friend/Other not present |
| **Priority** | High |

---

## Document Upload

### CP_KYC_014 — Verify 4 document upload slots are present

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open for an applicant |
| **Test Steps** | 1. Scroll to the Documents section |
| **Expected Result** | Four labelled upload slots exist: Passport Photograph, PAN Card, Aadhaar Front, Aadhaar Back |
| **Priority** | Critical |

---

### CP_KYC_015 — Upload Passport Photograph successfully

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open; valid JPG/PNG file available |
| **Test Steps** | 1. Click upload on Passport Photograph slot<br>2. Choose a valid image file |
| **Expected Result** | File uploads; thumbnail/preview is shown; "Remove" option becomes available |
| **Priority** | High |

---

### CP_KYC_016 — Upload PAN Card image successfully

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Upload a valid PAN image file |
| **Expected Result** | File accepted; preview/filename shown |
| **Priority** | High |

---

### CP_KYC_017 — Upload Aadhaar Front successfully

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Upload Aadhaar front image |
| **Expected Result** | File accepted and preview displayed |
| **Priority** | High |

---

### CP_KYC_018 — Upload Aadhaar Back successfully

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Upload Aadhaar back image |
| **Expected Result** | File accepted and preview shown |
| **Priority** | High |

---

### CP_KYC_019 — Reject unsupported file type

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Test Steps** | 1. Attempt to upload a `.exe` or `.txt` file as PAN |
| **Expected Result** | Upload rejected with "Unsupported file type" error |
| **Priority** | High |

---

### CP_KYC_020 — Reject oversized file beyond max limit

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | A file exceeding the configured max size exists |
| **Test Steps** | 1. Attempt to upload the oversized file |
| **Expected Result** | Upload rejected with file-size error message |
| **Priority** | Medium |

---

### CP_KYC_021 — Remove an uploaded document

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | A document has been uploaded |
| **Test Steps** | 1. Click Remove next to the uploaded file<br>2. Confirm removal |
| **Expected Result** | File is removed; slot returns to empty state |
| **Priority** | Medium |

---

## Co-Applicants

### CP_KYC_022 — Add a co-applicant

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open; total applicants < 4 |
| **Test Steps** | 1. Click **+ Add Applicant**<br>2. Observe new applicant block |
| **Expected Result** | New applicant block appears with empty fields and 4 fresh document slots |
| **Priority** | Critical |

---

### CP_KYC_023 — Maximum 4 applicants enforced

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | 1 primary + 3 co-applicants already added |
| **Test Steps** | 1. Look for Add Applicant button |
| **Expected Result** | Add Applicant button is hidden or disabled once 4-applicant limit is reached |
| **Priority** | Critical |

---

### CP_KYC_024 — Remove a co-applicant

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | At least one co-applicant added |
| **Test Steps** | 1. Click the Remove icon on a co-applicant block<br>2. Confirm |
| **Expected Result** | Co-applicant block is removed; Add Applicant becomes available again |
| **Priority** | High |

---

### CP_KYC_025 — Co-applicant requires same 4 documents

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | Co-applicant block added |
| **Test Steps** | 1. Scroll co-applicant Documents section |
| **Expected Result** | Same 4 upload slots (Photo, PAN, Aadhaar Front, Aadhaar Back) shown per co-applicant |
| **Priority** | High |

---

## Submission

### CP_KYC_026 — Submit blocked when documents are missing

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | All fields filled; one document missing on primary applicant |
| **Test Steps** | 1. Click Submit KYC |
| **Expected Result** | Submission blocked; inline error indicates the missing document |
| **Priority** | Critical |

---

### CP_KYC_027 — Submit blocked when applicant field is invalid

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | Invalid PAN format entered |
| **Test Steps** | 1. Click Submit KYC |
| **Expected Result** | Submission blocked with PAN validation error |
| **Priority** | High |

---

### CP_KYC_028 — Successful KYC submission

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | All applicant fields and all 4 documents per applicant complete |
| **Test Steps** | 1. Click Submit KYC<br>2. Wait for response |
| **Expected Result** | Success toast shown; `isKycSubmitted = true`; documents uploaded to Azure Blob; KYC PDF generated; status reflects on Dashboard |
| **Priority** | Critical |

---

### CP_KYC_029 — Customer receives KYC submission confirmation

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC submitted successfully |
| **Test Steps** | 1. Observe customer's mobile/email for notification |
| **Expected Result** | Customer is notified of KYC submission |
| **Priority** | High |

---

### CP_KYC_030 — KYC form becomes read-only after submission

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC has been submitted for the customer |
| **Test Steps** | 1. Re-open the KYC page for that customer |
| **Expected Result** | Fields and document slots are rendered in read-only mode; Submit button is hidden/disabled |
| **Priority** | Medium |

---
