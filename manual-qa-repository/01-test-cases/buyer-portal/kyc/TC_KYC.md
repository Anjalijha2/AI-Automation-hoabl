# Test Cases — KYC
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-KYC.md

---

## KYC — Entry & Access Control

### BYR_KYC_001 — Complete KYC button visible only for WINNER status

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Buyer WINNER, `isKycSubmitted = false` |
| **Test Steps** | 1. Open dashboard<br>2. Inspect Process Status column |
| **Expected Result** | "Complete KYC" button visible only when WINNER and KYC not submitted |
| **Priority** | Critical |

---

### BYR_KYC_002 — Click Complete KYC navigates to /kyc Step 1

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Complete KYC button visible |
| **Test Steps** | 1. Click Complete KYC<br>2. Wait for navigation |
| **Expected Result** | URL = `/kyc`; KycForm (Step 1) renders |
| **Priority** | Critical |

---

### BYR_KYC_003 — Non-WINNER buyer cannot access /kyc directly

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Buyer with status Available/Waitlisted (no WINNER) |
| **Test Steps** | 1. Open `/kyc` URL directly |
| **Expected Result** | Redirected to `/home` or blocked with "Not eligible" message |
| **Priority** | High |

---

### BYR_KYC_004 — Buyer with KYC already submitted cannot re-enter form

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | `isKycSubmitted = true` |
| **Test Steps** | 1. Open `/kyc` |
| **Expected Result** | Redirect to dashboard or read-only confirmation screen; no edit allowed |
| **Priority** | High |

---

## KYC — Step 1 — Applicant Information (Primary)

### BYR_KYC_005 — Primary applicant details prefilled from registration

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | KYC Step 1 loaded |
| **Test Steps** | 1. Inspect Name, DOB, Mobile, Email fields |
| **Expected Result** | Fields prefilled with registration data; can be edited if not locked |
| **Priority** | High |

---

### BYR_KYC_006 — Full Name mandatory

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 visible |
| **Test Steps** | 1. Clear Name field<br>2. Try to proceed |
| **Expected Result** | Error: "Name is required"; cannot proceed |
| **Priority** | High |

---

### BYR_KYC_007 — DOB mandatory and accepts only valid date

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 visible |
| **Test Steps** | 1. Clear DOB<br>2. Try to proceed<br>3. Enter future date and retry |
| **Expected Result** | Empty → "DOB required"; future date → "Invalid DOB" |
| **Priority** | High |

---

### BYR_KYC_008 — PAN format validated (ABCDE1234F)

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 visible |
| **Test Steps** | 1. Enter "ABCD1234FX"<br>2. Lose focus<br>3. Enter valid "ABCDE1234F" |
| **Expected Result** | Invalid format → error "Invalid PAN"; valid format → accepted |
| **Priority** | Critical |

---

### BYR_KYC_009 — Aadhaar must be exactly 12 digits

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 visible |
| **Test Steps** | 1. Enter 11 digits, lose focus<br>2. Enter 12 digits |
| **Expected Result** | <12 digits → error; exactly 12 digits accepted; non-digit chars rejected |
| **Priority** | Critical |

---

### BYR_KYC_010 — Address with pincode mandatory

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 visible |
| **Test Steps** | 1. Leave address blank<br>2. Try to proceed<br>3. Enter address without pincode |
| **Expected Result** | Empty address → "Address required"; missing pincode → "Pincode required" |
| **Priority** | High |

---

### BYR_KYC_011 — Occupation and Income mandatory

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 visible |
| **Test Steps** | 1. Leave Occupation/Income blank<br>2. Try to proceed |
| **Expected Result** | Validation errors on both fields; cannot proceed |
| **Priority** | High |

---

### BYR_KYC_012 — Primary applicant relationship locked to "Self"

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 — primary card |
| **Test Steps** | 1. Inspect Relationship field for primary |
| **Expected Result** | Relationship pre-set to "Self" and not editable |
| **Priority** | Medium |

---

## KYC — Step 1 — Co-Applicants

### BYR_KYC_013 — Add Applicant button adds a new applicant card

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1, 1 applicant present |
| **Test Steps** | 1. Click "+ Add Applicant"<br>2. Count cards |
| **Expected Result** | New empty applicant card rendered; count = 2 |
| **Priority** | High |

---

### BYR_KYC_014 — Max 4 applicants enforced

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | 4 applicants already added (1 primary + 3 co) |
| **Test Steps** | 1. Inspect Add Applicant button |
| **Expected Result** | Button hidden; label "Max. 4 Applicants allowed" displayed |
| **Priority** | Critical |

---

### BYR_KYC_015 — Co-applicant relationship must be blood relative

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Co-applicant card open |
| **Test Steps** | 1. Open Relationship dropdown<br>2. Inspect options |
| **Expected Result** | Options limited to blood relatives (Spouse, Parent, Child, Sibling); no non-blood options |
| **Priority** | High |

---

### BYR_KYC_016 — Remove co-applicant button works

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | At least 1 co-applicant added |
| **Test Steps** | 1. Click remove/trash icon on co-applicant<br>2. Confirm |
| **Expected Result** | Co-applicant removed; count decreases; Add Applicant button reappears if was hidden |
| **Priority** | Medium |

---

## KYC — Step 2 — Document Upload

### BYR_KYC_017 — Document upload screen lists 4 mandatory documents

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 saved, Step 2 loaded |
| **Test Steps** | 1. Inspect upload section per applicant |
| **Expected Result** | 4 slots: Passport Photo, PAN, Aadhaar Front, Aadhaar Back — all marked required |
| **Priority** | Critical |

---

### BYR_KYC_018 — Each applicant has its own document set

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | 2+ applicants from Step 1 |
| **Test Steps** | 1. Switch between applicant tabs<br>2. Inspect upload slots |
| **Expected Result** | Each applicant has 4 independent upload slots |
| **Priority** | High |

---

### BYR_KYC_019 — Image upload accepts jpg/png

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Upload slot open |
| **Test Steps** | 1. Upload .jpg file<br>2. Upload .png file |
| **Expected Result** | Both accepted; preview thumbnail shown |
| **Priority** | High |

---

### BYR_KYC_020 — Upload rejects unsupported file types

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Upload slot open |
| **Test Steps** | 1. Upload .exe or .txt |
| **Expected Result** | Rejected with "Unsupported file type" error |
| **Priority** | High |

---

### BYR_KYC_021 — Upload enforces file size limit

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Upload slot open |
| **Test Steps** | 1. Upload file exceeding max size (e.g., >5 MB) |
| **Expected Result** | Rejected with "File too large" error |
| **Priority** | Medium |

---

### BYR_KYC_022 — Cannot proceed if any of 4 documents missing

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 2 with 3 of 4 documents uploaded |
| **Test Steps** | 1. Click Next/Confirm |
| **Expected Result** | Error indicating missing documents; navigation blocked |
| **Priority** | Critical |

---

### BYR_KYC_023 — Replace uploaded document works

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Document already uploaded |
| **Test Steps** | 1. Click replace/re-upload<br>2. Select new file |
| **Expected Result** | New file replaces old; preview updates |
| **Priority** | Low |

---

## KYC — Step 3 — Review & Confirm

### BYR_KYC_024 — KYC Summary shows registration and unit details

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 2 complete |
| **Test Steps** | 1. Open summary page<br>2. Inspect content |
| **Expected Result** | Registration No, Booking No, Selected Unit, No. of Applicants all rendered correctly |
| **Priority** | High |

---

### BYR_KYC_025 — T&C checkbox unchecked by default

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Summary visible |
| **Test Steps** | 1. Inspect T&C checkbox |
| **Expected Result** | Checkbox unchecked on page load |
| **Priority** | High |

---

### BYR_KYC_026 — Confirm button disabled until T&C checked

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Summary visible, T&C unchecked |
| **Test Steps** | 1. Inspect Confirm button<br>2. Tick checkbox<br>3. Re-inspect |
| **Expected Result** | Disabled when unchecked; enabled once ticked |
| **Priority** | Critical |

---

## KYC — Step 4 — E-Verification

### BYR_KYC_027 — OTP sent to registered mobile on Confirm

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | T&C ticked, Confirm clicked |
| **Test Steps** | 1. Click Confirm<br>2. Wait for OTP screen |
| **Expected Result** | OTP input screen shown; OTP triggered via SMS/WhatsApp |
| **Priority** | Critical |

---

### BYR_KYC_028 — Wrong OTP shows error and stays on screen

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | OTP input visible |
| **Test Steps** | 1. Enter wrong OTP<br>2. Click Verify |
| **Expected Result** | "Invalid OTP" error; user stays; can retry |
| **Priority** | High |

---

### BYR_KYC_029 — Correct OTP sets eVerificationCompleted = true

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | OTP input visible |
| **Test Steps** | 1. Enter valid OTP<br>2. Click Verify<br>3. Check backend flag |
| **Expected Result** | `eVerificationCompleted = true`; proceeds to Step 5 success screen |
| **Priority** | Critical |

---

## KYC — Step 5 — Confirmation & Post-Submission

### BYR_KYC_030 — Success screen shows KYC Number and Unit table

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | E-verification successful |
| **Test Steps** | 1. Inspect kycSuccess content |
| **Expected Result** | Table renders: Registration No, KYC Number, Unit, No. of Applicants |
| **Priority** | Critical |

---

### BYR_KYC_031 — Download Unit Details link generates PDF

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Success screen visible |
| **Test Steps** | 1. Click "Download your Unit Details"<br>2. Open downloaded file |
| **Expected Result** | PDF downloaded with applicant details, unit details, transactions |
| **Priority** | High |

---

### BYR_KYC_032 — Go to Home button returns to dashboard with KYC Completed status

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Success screen visible |
| **Test Steps** | 1. Click Go to Home |
| **Expected Result** | Lands on `/home`; Process Status shows "KYC Completed" |
| **Priority** | Critical |

---

### BYR_KYC_033 — Documents synced to Azure Blob Storage

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | KYC successfully submitted |
| **Test Steps** | 1. Verify Azure container for buyer's documents |
| **Expected Result** | All 4 docs per applicant present in Azure Blob; `isKycPdfSubmitted = true` |
| **Priority** | High |

---

## KYC — Negative & Edge Cases

### BYR_KYC_034 — Browser refresh mid-flow preserves entered data

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 partially filled |
| **Test Steps** | 1. Refresh browser<br>2. Re-enter KYC |
| **Expected Result** | Either form auto-saves and restores data, or shows draft prompt to resume |
| **Priority** | Medium |

---

### BYR_KYC_035 — Co-applicant with non-blood relationship rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Backend bypass test |
| **Test Steps** | 1. Submit co-applicant with relationship "Friend" via API |
| **Expected Result** | API rejects with validation error per business rule |
| **Priority** | High |

---
