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

### BYR_KYC_051 — Summary lists every applicant added in Step 1

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | 3 applicants entered in Step 1 |
| **Test Steps** | 1. Open Step 3 summary<br>2. Count applicant rows/cards |
| **Expected Result** | Exactly 3 applicant entries shown with names, relationships, PAN/Aadhaar masked |
| **Priority** | High |

---

### BYR_KYC_052 — Edit link on summary returns to Step 1 preserving data

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 3 summary visible |
| **Test Steps** | 1. Click Edit / Back<br>2. Inspect Step 1 fields |
| **Expected Result** | Returns to Step 1; all previously entered data still populated; not lost |
| **Priority** | High |

---

### BYR_KYC_053 — Document thumbnails on summary clickable for preview

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 3 summary with documents listed |
| **Test Steps** | 1. Click each document thumbnail |
| **Expected Result** | Preview opens in modal/new tab; document image renders |
| **Priority** | Medium |

---

### BYR_KYC_054 — T&C link opens full terms in new tab

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 3 summary visible |
| **Test Steps** | 1. Click "Terms & Conditions" link in checkbox label |
| **Expected Result** | Terms document opens in new tab or modal; original page state preserved |
| **Priority** | Medium |

---

### BYR_KYC_055 — Confirm click shows loading state while submitting

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 3 with T&C ticked |
| **Test Steps** | 1. Click Confirm<br>2. Observe button state |
| **Expected Result** | Button shows spinner/disabled state during submit-kyc API call; prevents double-click |
| **Priority** | High |

---

## KYC — Step 4 — E-Verification

### BYR_KYC_027 — OTP sent to registered mobile on Confirm (SM physical-event flow only)

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | T&C ticked, Confirm clicked |
| **Test Steps** | 1. Click Confirm<br>2. Wait for OTP screen |
| **Expected Result** | OTP input screen shown; OTP triggered via Epinet SMS (NOT Kaleyra) + Botspice WhatsApp. NOTE: `eVerificationCompleted=true` ONLY when `reqFromSm===true && otpVerified===true` (services/allocation.service.js:2011-2018). Buyer self-flow leaves the e-verification flags `false/null`. |
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

### BYR_KYC_056 — OTP input accepts exactly 6 digits

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | E-verification OTP screen visible |
| **Test Steps** | 1. Try typing 7 digits<br>2. Try typing alphabetic characters |
| **Expected Result** | Input capped at 6 numeric digits; non-numeric rejected |
| **Priority** | High |

---

### BYR_KYC_057 — Verify button disabled until 6 OTP digits entered

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | OTP screen visible, OTP field empty |
| **Test Steps** | 1. Inspect Verify button<br>2. Type 5 digits — recheck<br>3. Type 6th digit — recheck |
| **Expected Result** | Disabled at 0/5 digits; enabled only at exactly 6 digits |
| **Priority** | High |

---

### BYR_KYC_058 — Resend OTP enabled after 60-second cooldown

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | OTP just sent |
| **Test Steps** | 1. Observe Resend OTP state at t=0<br>2. Wait 60 seconds<br>3. Recheck |
| **Expected Result** | Resend disabled with countdown for 60s; enabled after timer elapses |
| **Priority** | Medium |

---

### BYR_KYC_059 — Expired OTP rejected with error

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | OTP issued and validity window elapsed |
| **Test Steps** | 1. Wait beyond OTP validity period<br>2. Enter that OTP<br>3. Click Verify |
| **Expected Result** | "OTP expired" error; user remains on OTP screen and can request new OTP |
| **Priority** | High |

---

### BYR_KYC_060 — Edit details link from OTP screen returns to Step 3 summary

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Click "Edit details" / Back button |
| **Expected Result** | Returns to Step 3 summary; T&C state and entered data preserved |
| **Priority** | Medium |

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
| **Expected Result** | 400 Yup validation error — ENUM is exactly `self|father|mother|brother|sister|spouse` (models/applicants.model.js:105-109). "Spouse"/"Child"/"Sibling" via UI must map to this lowercase ENUM. |
| **Priority** | High |

---

### BYR_KYC_061 — Invalid PAN format on add-applicant rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | API/UI access |
| **Test Steps** | 1. Submit applicant with PAN `12345ABCDE` (digits-then-letters)<br>2. Submit with `ABCDE12345` (letters-then-digits-only) |
| **Expected Result** | Both rejected with validation error; valid PAN regex `[A-Z]{5}[0-9]{4}[A-Z]{1}` enforced |
| **Priority** | High |

---

### BYR_KYC_062 — Aadhaar with non-numeric chars rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 applicant card open |
| **Test Steps** | 1. Type alphabetic characters into Aadhaar field<br>2. Type "1234-5678-9012" with hyphens |
| **Expected Result** | Non-digit input stripped or rejected; field accepts only 12 contiguous digits |
| **Priority** | High |

---

### BYR_KYC_063 — Future DOB rejected at field level

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 visible |
| **Test Steps** | 1. Enter tomorrow's date as DOB<br>2. Lose focus / try Next |
| **Expected Result** | Error "DOB cannot be in future"; submission blocked |
| **Priority** | High |

---

### BYR_KYC_064 — Underage applicant (<18 years) rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 visible |
| **Test Steps** | 1. Enter DOB making applicant 17 years old<br>2. Try Next |
| **Expected Result** | Error: "Applicant must be at least 18 years old"; submission blocked |
| **Priority** | High |

---

### BYR_KYC_065 — Browser back from Step 2 returns to Step 1 with data intact

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 1 completed, Step 2 visible |
| **Test Steps** | 1. Click browser Back button<br>2. Inspect Step 1 fields |
| **Expected Result** | Returns to Step 1; all entered applicant data still populated; no loss |
| **Priority** | Medium |

---

### BYR_KYC_066 — Network failure during submit-kyc shows retry option

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Step 3 Confirm clicked; network throttled offline |
| **Test Steps** | 1. Click Confirm with no network<br>2. Observe |
| **Expected Result** | Error toast "Submission failed. Please try again."; T&C state preserved; Confirm button re-enabled for retry |
| **Priority** | High |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/buyer-portal/fsd-kyc.md`

### Corrections to existing TCs
- **BYR_KYC_004** — There is NO admin "approve/reject KYC" endpoint and NO `kycStatus` ENUM. KYC is self-attested via `isKycSubmitted` boolean only. No `PENDING/SUBMITTED/APPROVED/REJECTED` state machine (GAP-KYC-001, GAP-KYC-002).
- **BYR_KYC_014** — "Max 4 applicants" comes from `master_config.max_applicants_per_unit` (default 4) — NOT hardcoded. Test expectation must read the config first (controllers/user.controller.js:243-256).
- **BYR_KYC_015** — Actual ENUM is `self|father|mother|brother|sister|spouse` (lowercase). UI labels Parent/Child/Sibling must map to these values exactly. "Child" is NOT in the ENUM — possible UI/backend drift.
- **BYR_KYC_017** — Multer field names are exactly `panDoc`, `aadhaarFront`, `aadhaarBack`, `photoDoc` (utils/upload.js:140-149). `photoDoc` is OPTIONAL (passport photo not mandatory) — `panDoc`, `aadhaarFront`, `aadhaarBack` are required (BR-KYC-016).
- **BYR_KYC_020 / BYR_KYC_021** — MIME whitelist on `/applicants` is `application/pdf | image/jpeg | image/png` (utils/upload.js:34-42). Size cap is **5 MB per file** (utils/upload.js:140-149). NOTE: `/upload-kyc-form` has size limit commented out (BUG-KYC-001).
- **BYR_KYC_027** — Replaced "Kaleyra" with Epinet SMS + Botspice WhatsApp. Also clarified e-verification only applies to SM physical-event flow, not buyer self-flow.
- **BYR_KYC_029** — `eVerificationCompleted=true` only when `reqFromSm===true && otpVerified===true`. Buyer-direct submit leaves it null/false (BR-KYC-022).
- **BYR_KYC_031** — KYC PDF unit-details download is generated server-side by a cron (every 10 min), NOT on-demand from the success screen. Buyer-direct download is via `GET /registration-units/booking-form-data/:registrationUnitId` rendering. Server-side cron sets `isKycPdfSubmitted=true` after LSQ upload (services/kyc-booking-pdf.service.js:30-72, 414).
- **BYR_KYC_033** — Confirmed: documents stored in Azure Blob (path `applicants/<userId>/<filename>`), NOT S3. The `s3FilePath` field is hard-coded null (legacy/dead — GAP-KYC-005).

### New TCs added below

### BYR_KYC_036 — Submit-KYC ownership check rejects another user's unit

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Buyer A logged in; registration unit X belongs to Buyer B |
| **Test Steps** | 1. `POST /api/v1/allocation/submit-kyc` body `[{ registrationUnitId: X, isParkingSelected: false, parkingCount: null }]` |
| **Expected Result** | 403 "You don't have access to some registration units" (services/allocation.service.js:1883-1889) |
| **Priority** | Critical (Security) |

---

### BYR_KYC_037 — Submit-KYC is idempotent — second call skips, no duplicate side effects

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Unit U with `isKycSubmitted=true` |
| **Test Steps** | 1. Resubmit `POST /allocation/submit-kyc` for U<br>2. Inspect response |
| **Expected Result** | 200 with U in `processedUnits` (fast-path), no duplicate LSQ activity. Shape mismatch BUG-KYC-004: returns `{ id, registrationNumber, regUnitId }` (vs create path which returns `unitId`). |
| **Priority** | High |

---

### BYR_KYC_038 — Submit-KYC partial failure returns HTTP 207 with success:true (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | 2 units submitted; one fails (e.g., parking unavailable) |
| **Test Steps** | 1. `POST /allocation/submit-kyc` array of 2<br>2. Inspect status + body |
| **Expected Result** | 207 Multi-Status; body has `success:true` (BUG-KYC-005) with `processedUnits[]` + `failedUnits[]`. Tests MUST assert status code 207, not `success` field. |
| **Priority** | High |

---

### BYR_KYC_039 — Parking selection requires master_config.park_enabled=true

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | `master_config.park_enabled = false` |
| **Test Steps** | 1. Submit KYC with `isParkingSelected:true, parkingCount:1` |
| **Expected Result** | Per-unit transaction rolls back; unit moves to `failedUnits[]`; HTTP 207 (services/allocation.service.js:1970-1979) |
| **Priority** | High |

---

### BYR_KYC_040 — Add 5th applicant rejected at config cap

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | 4 applicants on a unit; `max_applicants_per_unit=4` |
| **Test Steps** | 1. `POST /applicants` with 5th applicant data |
| **Expected Result** | 400 "Maximum 4 applicants allowed per registration unit" (controllers/user.controller.js:251-256). NOTE: soft-deleted applicants do NOT free a slot but `Applicant.count` may include only non-deleted (RISK-KYC-009 — verify behavior). |
| **Priority** | High |

---

### BYR_KYC_041 — Duplicate applicant phone/PAN/Aadhaar on same unit rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Applicant exists on unit U with phone P |
| **Test Steps** | 1. `POST /applicants` for unit U with same phone P |
| **Expected Result** | 400 "Applicant with this phone number, aadhaar card or pan card already exists for this registration unit" (controllers/user.controller.js:267-272) |
| **Priority** | High |

---

### BYR_KYC_042 — Self/father/mother relation uniqueness enforced

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Applicant with `relation='self'` already on unit U |
| **Test Steps** | 1. `POST /applicants` for unit U with `relation:'self'` |
| **Expected Result** | 400 "An applicant with relation 'self' already exists for this registration unit" (controllers/user.controller.js:280-285) |
| **Priority** | High |

---

### BYR_KYC_043 — Add-applicant requires panDoc, aadhaarFront, aadhaarBack files

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Valid applicant payload |
| **Test Steps** | 1. `POST /applicants` multipart with only panDoc (omit aadhaarFront/aadhaarBack) |
| **Expected Result** | 400 mandatory documents missing (controllers/user.controller.js:179-196, 300-305). photoDoc remains optional. |
| **Priority** | High |

---

### BYR_KYC_044 — /upload-kyc-form rejects request before KYC submit

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Unit U with `isKycSubmitted=false` |
| **Test Steps** | 1. `POST /upload-kyc-form` multipart with `pdfFile` and `registrationUnitId=U` |
| **Expected Result** | 400 "Cannot submit KYC token verification in progress" (controllers/user.controller.js:1447-1449). Ambiguous message — also returned when `lsqBookingActivityId` missing (BUG-KYC-006). |
| **Priority** | High |

---

### BYR_KYC_045 — /upload-kyc-form has no enforced file-size limit (security gap)

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Valid KYC-submitted unit |
| **Test Steps** | 1. Upload 100MB PDF via `POST /upload-kyc-form` |
| **Expected Result** | Accepted (no limit enforced — BUG-KYC-001). Multer `memoryStorage` holds in heap → DoS risk. Document as security gap. |
| **Priority** | High (Security) |

---

### BYR_KYC_046 — KYC PDF cron sets isKycPdfSubmitted=true

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Unit with `isKycSubmitted=true, lsqBookingActivityId IS NOT NULL, isKycPdfSubmitted=false` |
| **Test Steps** | 1. Trigger `GET /cronPdfGenerationJob` (debug route — BUG-KYC-002)<br>2. Wait for completion<br>3. Inspect DB |
| **Expected Result** | After successful run: `isKycPdfSubmitted=true`; PDF rendered from `kycBookingFormTamplate.ejs` and pushed to LSQ via `lsqLeadService.uploadFile` (services/kyc-booking-pdf.service.js:326-417). |
| **Priority** | Medium |

---

### BYR_KYC_047 — Self-KYC retry cron progresses 3-step LSQ submission

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Unit with `isKycSubmitted=false, bookingTokenActivitySubmitted=true, selfKycSubmitted=false` |
| **Test Steps** | 1. Wait for `*/15 * * * *` cron tick (or trigger manually)<br>2. Inspect three flags |
| **Expected Result** | `selfKycSubmitted` → `selfKycBookingActivitySubmitted` → `selfKycFinalSubmitted` progress to true in order (cron/self-kyc-lsq-update.cron.js:14-83). |
| **Priority** | Medium |

---

### BYR_KYC_048 — KYC cache invalidation flips Redis is_kyc_submitted

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Successful submit-kyc just completed |
| **Test Steps** | 1. Inspect Redis key for `(projectId, registrationNumber)` |
| **Expected Result** | `is_kyc_submitted = 1` set even if downstream LSQ/MAVIS fails afterwards (RISK-KYC-013, services/allocation.service.js:2033-2034, 2204-2210). Dashboard may show KYC done while booking activity flags still false. |
| **Priority** | Medium |

---

### BYR_KYC_049 — DELETE /applicants/:id is soft delete (paranoid)

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Applicant ID A exists |
| **Test Steps** | 1. `DELETE /applicants/A`<br>2. Query `SELECT deleted_at FROM applicants WHERE id=A` |
| **Expected Result** | `deleted_at` populated, row not physically removed (models/applicants.model.js:142). |
| **Priority** | Medium |

---

### BYR_KYC_050 — kycNumber format = `<registrationNumber>-KYC`

| Field | Value |
|-------|-------|
| **Module** | BYR – KYC |
| **Pre-conditions** | Unit successfully KYC-submitted |
| **Test Steps** | 1. Query `registration_units.kyc_number` |
| **Expected Result** | Value = `${registrationNumber}-KYC` (services/allocation.service.js:2019). No uniqueness constraint — resubmit overwrites same value (RISK-KYC-014). |
| **Priority** | Low |
