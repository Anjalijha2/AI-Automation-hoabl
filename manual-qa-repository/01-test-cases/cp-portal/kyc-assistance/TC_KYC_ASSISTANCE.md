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
| **Type** | UI |
| **Test Steps** | 1. Click **KYC** in the navigation menu<br>2. Wait for page to render |
| **Expected Result** | URL updates to `/kyc`; KYC page loads showing the form or eligible customer list |
| **Priority** | Critical |

---

### CP_KYC_002 — KYC unavailable for customers below WINNER status

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | A customer is in WAITLIST / PREALLOCATED / ALLOCATED status |
| **Type** | BIZ |
| **Test Steps** | 1. Open KYC for that customer |
| **Expected Result** | KYC form is hidden or disabled; message indicates KYC available only post unit allocation/payment |
| **Priority** | Critical |

---

### CP_KYC_003 — KYC accessible for WINNER status customer

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | Customer has WINNER status (payment completed) |
| **Type** | BIZ |
| **Test Steps** | 1. Open KYC form for that customer |
| **Expected Result** | KYC form opens with editable fields and document upload areas |
| **Priority** | Critical |

---

### CP_KYC_004 — Logged-out user redirected from `/kyc`

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | No session |
| **Type** | BIZ |
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
| **Type** | UI |
| **Test Steps** | 1. Inspect Name, DOB (if known), Mobile, Email fields |
| **Expected Result** | Fields are pre-populated with values from Registration; remain editable |
| **Priority** | High |

---

### CP_KYC_006 — Verify all required applicant fields present

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | UI |
| **Test Steps** | 1. Scan applicant fields |
| **Expected Result** | Full Name, DOB, PAN, Aadhaar, Address (with pincode), Occupation, Income, Relationship are visible |
| **Priority** | Critical |

---

### CP_KYC_007 — PAN format validation (ABCDE1234F)

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | VAL |
| **Test Steps** | 1. Enter `INVALID123` in PAN field<br>2. Blur the field |
| **Expected Result** | Inline error displayed: "PAN must be 5 letters + 4 digits + 1 letter" |
| **Priority** | Critical |

---

### CP_KYC_008 — PAN valid format accepted

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | VAL |
| **Test Steps** | 1. Enter `ABCDE1234F` in PAN field<br>2. Blur |
| **Expected Result** | No validation error; field accepts the value |
| **Priority** | High |

---

### CP_KYC_009 — Aadhaar must be exactly 12 digits

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | VAL |
| **Test Steps** | 1. Enter `12345` in Aadhaar field<br>2. Blur |
| **Expected Result** | Inline error "Aadhaar must be 12 digits" appears |
| **Priority** | Critical |

---

### CP_KYC_010 — Aadhaar rejects letters and special chars

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | VAL |
| **Test Steps** | 1. Try entering `abcd!@1234`<br>2. Observe field |
| **Expected Result** | Only numeric digits accepted in Aadhaar field |
| **Priority** | High |

---

### CP_KYC_011 — DOB cannot be in the future

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | VAL |
| **Test Steps** | 1. Open DOB picker<br>2. Pick a date 1 year in the future |
| **Expected Result** | Future date is disabled or validation error displayed |
| **Priority** | High |

---

### CP_KYC_012 — Address pincode validation (6 digits)

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | VAL |
| **Test Steps** | 1. Enter `12` in pincode<br>2. Blur |
| **Expected Result** | Validation error: "Pincode must be 6 digits" |
| **Priority** | Medium |

---

### CP_KYC_013 — Relationship to primary applicant — blood relative validation

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | Co-applicant form open |
| **Type** | BIZ |
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
| **Type** | UI |
| **Test Steps** | 1. Scroll to the Documents section |
| **Expected Result** | Four labelled upload slots exist: Passport Photograph, PAN Card, Aadhaar Front, Aadhaar Back |
| **Priority** | Critical |

---

### CP_KYC_015 — Upload Passport Photograph successfully

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open; valid JPG/PNG file available |
| **Type** | FUNC |
| **Test Steps** | 1. Click upload on Passport Photograph slot<br>2. Choose a valid image file |
| **Expected Result** | File uploads; thumbnail/preview is shown; "Remove" option becomes available |
| **Priority** | High |

---

### CP_KYC_016 — Upload PAN Card image successfully

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | FUNC |
| **Test Steps** | 1. Upload a valid PAN image file |
| **Expected Result** | File accepted; preview/filename shown |
| **Priority** | High |

---

### CP_KYC_017 — Upload Aadhaar Front successfully

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | FUNC |
| **Test Steps** | 1. Upload Aadhaar front image |
| **Expected Result** | File accepted and preview displayed |
| **Priority** | High |

---

### CP_KYC_018 — Upload Aadhaar Back successfully

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | FUNC |
| **Test Steps** | 1. Upload Aadhaar back image |
| **Expected Result** | File accepted and preview shown |
| **Priority** | High |

---

### CP_KYC_019 — Reject unsupported file type

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC form open |
| **Type** | NEG |
| **Test Steps** | 1. Attempt to upload a `.exe` or `.txt` file as PAN |
| **Expected Result** | Upload rejected with "Unsupported file type" error |
| **Priority** | High |

---

### CP_KYC_020 — Reject oversized file beyond max limit

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | A file exceeding the configured max size exists |
| **Type** | NEG |
| **Test Steps** | 1. Attempt to upload the oversized file |
| **Expected Result** | Upload rejected with file-size error message |
| **Priority** | Medium |

---

### CP_KYC_021 — Remove an uploaded document

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | A document has been uploaded |
| **Type** | FUNC |
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
| **Type** | FUNC |
| **Test Steps** | 1. Click **+ Add Applicant**<br>2. Observe new applicant block |
| **Expected Result** | New applicant block appears with empty fields and 4 fresh document slots |
| **Priority** | Critical |

---

### CP_KYC_023 — Maximum 4 applicants enforced

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | 1 primary + 3 co-applicants already added |
| **Type** | EDGE |
| **Test Steps** | 1. Look for Add Applicant button |
| **Expected Result** | Add Applicant button is hidden or disabled once 4-applicant limit is reached |
| **Priority** | Critical |

---

### CP_KYC_024 — Remove a co-applicant

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | At least one co-applicant added |
| **Type** | FUNC |
| **Test Steps** | 1. Click the Remove icon on a co-applicant block<br>2. Confirm |
| **Expected Result** | Co-applicant block is removed; Add Applicant becomes available again |
| **Priority** | High |

---

### CP_KYC_025 — Co-applicant requires same 4 documents

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | Co-applicant block added |
| **Type** | UI |
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
| **Type** | VAL |
| **Test Steps** | 1. Click Submit KYC |
| **Expected Result** | Submission blocked; inline error indicates the missing document |
| **Priority** | Critical |

---

### CP_KYC_027 — Submit blocked when applicant field is invalid

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | Invalid PAN format entered |
| **Type** | VAL |
| **Test Steps** | 1. Click Submit KYC |
| **Expected Result** | Submission blocked with PAN validation error |
| **Priority** | High |

---

### CP_KYC_028 — Successful KYC submission

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | All applicant fields and all 4 documents per applicant complete |
| **Type** | FUNC |
| **Test Steps** | 1. Click Submit KYC<br>2. Wait for response |
| **Expected Result** | Success toast shown; `isKycSubmitted = true`; documents uploaded to Azure Blob; KYC PDF generated; status reflects on Dashboard |
| **Priority** | Critical |

---

### CP_KYC_029 — Customer receives KYC submission confirmation

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC submitted successfully |
| **Type** | INT |
| **Test Steps** | 1. Observe customer's mobile/email for notification |
| **Expected Result** | Customer is notified of KYC submission |
| **Priority** | High |

---

### CP_KYC_030 — KYC form becomes read-only after submission

| Field | Value |
|-------|-------|
| **Module** | CP – KYC |
| **Pre-conditions** | KYC has been submitted for the customer |
| **Type** | UI |
| **Test Steps** | 1. Re-open the KYC page for that customer |
| **Expected Result** | Fields and document slots are rendered in read-only mode; Submit button is hidden/disabled |
| **Priority** | Medium |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/cp-portal/fsd-kyc-assistance.md`

### CRITICAL CORRECTION — "KYC Assistance" does NOT exist as a backend feature
The entire premise of CP_KYC_001-030 (CP fills KYC on behalf of buyer) is unsupported by backend (BR-CPK-08, KB-CPK-01). There is:
- **NO CP endpoint** that uploads buyer KYC documents.
- **NO CP endpoint** that mutates `registration_units.isKycSubmitted` or related flags.
- **NO CP endpoint** that submits buyer applicants.
- **NO CP endpoint** that approves/rejects buyer KYC.

The only CP-side KYC routes are:
1. `GET /api/v1/cp/kyc` — returns CP's OWN documents from LSQ (PAN/RERA/GST URLs).
2. `POST /api/v1/cp/registration` (with `kyc:true`) — CP re-uploads CP's OWN docs to LSQ.

Buyer KYC is submitted by the BUYER via `POST /api/v1/user/upload-kyc-form` and `POST /api/v1/user/applicants`. CP has no path into that flow.

**Recommended action**: Confirm with PM whether "KYC Assistance" is (a) a not-yet-implemented feature — file as missing feature; (b) a UI-only walkthrough that links Buyer to the buyer portal; or (c) the existing CP-self-KYC view mislabeled. Most existing TCs (CP_KYC_001-030) test fictional UI for option (a).

### Existing TCs flagged
- **CP_KYC_001-004 (Page access)** — `/kyc` route does NOT serve buyer KYC. It exposes CP's own docs via `GET /api/v1/cp/kyc`. TCs assume buyer-KYC-by-CP UI.
- **CP_KYC_005-013 (Applicant fields)** — No backend endpoint accepts these payloads from CP. Applicant CRUD is `POST /api/v1/user/applicants` (buyer-only, restrictTo('user')).
- **CP_KYC_014-021 (Document upload)** — No CP buyer-KYC upload endpoint. Buyer uploads via `applicantDocumentUpload` middleware with fields `panDoc/aadhaarFront/aadhaarBack/photoDoc` (utils/upload.js:140-149). Azure Blob storage (NOT S3) at path `applicants/<userId>/<filename>`.
- **CP_KYC_022-025 (Co-applicants)** — Max applicants is `master_config.max_applicants_per_unit` (default 4) — buyer endpoint only. Relation ENUM = `self|father|mother|brother|sister|spouse` (no "son/daughter/Spouse"). 
- **CP_KYC_028 (Successful submission)** — KYC submit endpoint is `POST /api/v1/user/allocation/submit-kyc` (buyer-only role). Documents in Azure Blob (NOT S3). KYC PDF generated by separate 10-min cron, NOT on submit (services/kyc-booking-pdf.service.js).
- **CP_KYC_029** — No Kaleyra. Buyer KYC notifications via Botspice WhatsApp / Epinet SMS / SMTP email — and only from buyer-side flow, not from any CP path.

### New TCs added below (testing the ACTUAL CP KYC surface — CP's own docs)

### CP_KYC_031 — GET /api/v1/cp/kyc returns CP's own LSQ document URLs

| Field | Value |
|-------|-------|
| **Module** | CP – KYC (own) |
| **Pre-conditions** | CP logged in with valid `prospectId` |
| **Type** | INT |
| **Test Steps** | 1. `GET /api/v1/cp/kyc` |
| **Expected Result** | 200 with `{ orgName, address, ownerName, email, phone, businessRegion, officePincode, panNumber, reraNumber, reraDoc, panDoc, gstDoc }` from LSQ (BR-CPK-07, cp.controller.js:1688-1707). |
| **Priority** | High |

---

### CP_KYC_032 — GET /cp/kyc with missing prospectId returns 400

| Field | Value |
|-------|-------|
| **Module** | CP – KYC (own) |
| **Pre-conditions** | CP with `users.prospect_id IS NULL` |
| **Type** | NEG |
| **Test Steps** | 1. `GET /api/v1/cp/kyc` |
| **Expected Result** | 400 "Something went wrong, please try again!" (generic) — should ideally be 404/500 since it's a data integrity issue (BR-CPK-03, KB-CPK-10, cp.controller.js:1612-1619). |
| **Priority** | Medium |

---

### CP_KYC_033 — POST /cp/registration is UNAUTHENTICATED — security gap

| Field | Value |
|-------|-------|
| **Module** | CP – KYC (own) |
| **Pre-conditions** | Existing CP X with phone P_X, `isCpRegistrationCompleted=true` |
| **Type** | API |
| **Test Steps** | 1. WITHOUT any JWT, `POST /api/v1/cp/registration` multipart body `{ phone: P_X, kyc: true, panNumber, reraNumber, ...docs }` |
| **Expected Result** | KNOWN SECURITY GAP: route is BEFORE `router.use(protect)` (KB-CPK-02). Anyone knowing P_X can overwrite CP X's LSQ KYC documents. Document, recommend fix. |
| **Priority** | Critical (Security) |

---

### CP_KYC_034 — Privilege escalation: logged-in CP A overwrites CP B's KYC via body phone

| Field | Value |
|-------|-------|
| **Module** | CP – KYC (own) |
| **Pre-conditions** | CP A logged in; CP B has phone P_B |
| **Type** | NEG |
| **Test Steps** | 1. CP A calls `POST /api/v1/cp/registration` with body `phone=P_B, kyc:true`, attaches docs |
| **Expected Result** | KNOWN BUG: controller looks up user by `req.body.phone` and ignores `req.user` (KB-CPK-09, cp.controller.js:42). CP B's KYC updated. Document privilege escalation. |
| **Priority** | Critical (Security) |

---

### CP_KYC_035 — `kyc:true` re-upload allowed for completed CPs

| Field | Value |
|-------|-------|
| **Module** | CP – KYC (own) |
| **Pre-conditions** | CP with `isCpRegistrationCompleted=true` |
| **Type** | FUNC |
| **Test Steps** | 1. `POST /cp/registration` body `{ phone, kyc:true, ...docs }` |
| **Expected Result** | 200 success; 400 "User already registered" guard bypassed when `kyc:true` (BR-CPK-01, cp.controller.js:60-62). |
| **Priority** | High |

---

### CP_KYC_036 — `success_registercp` WhatsApp NOT sent on kyc:true re-upload

| Field | Value |
|-------|-------|
| **Module** | CP – KYC (own) |
| **Pre-conditions** | CP re-uploading with kyc:true |
| **Type** | INT |
| **Test Steps** | 1. Submit `POST /cp/registration` with kyc:true<br>2. Inspect WhatsApp outbound |
| **Expected Result** | No WhatsApp dispatched (cp.controller.js:376-378 wraps in `if (!req.body.kyc)`). NOTE: even on kyc:false branch, template uses `${+91}${phone}` which renders `"91<phone>"` without `+` — BUG-CPK-03. |
| **Priority** | Medium |

---

### CP_KYC_037 — File keyword matching fragility (BUG)

| Field | Value |
|-------|-------|
| **Module** | CP – KYC (own) |
| **Pre-conditions** | CP uploaded PAN file via `buildFilename('pan', hvCode, originalName)` → e.g., `pan_HV00000489_xyz.pdf` |
| **Type** | INT |
| **Test Steps** | 1. `GET /api/v1/cp/kyc`<br>2. Inspect `panDoc` field |
| **Expected Result** | KNOWN BUG: extractor searches filename for substring `'pan card'` — uploaded files use prefix `'pan'` (no `'card'`). `panDoc` likely returns null even when file exists in LSQ (KB-CPK-07, cp.controller.js:1623-1631). |
| **Priority** | High |

---

### CP_KYC_038 — Sequential document upload — no rollback on partial failure

| Field | Value |
|-------|-------|
| **Module** | CP – KYC (own) |
| **Pre-conditions** | Mock LSQ to fail at RERA upload step |
| **Type** | INT |
| **Test Steps** | 1. `POST /cp/registration` with PAN+RERA+GST files<br>2. Observe response + LSQ state |
| **Expected Result** | PAN uploaded; RERA upload fails; 500 to client. PAN remains in LSQ (orphan partial state — KB-CPK-08, cp.controller.js:165-275). No rollback. |
| **Priority** | Medium |

---

### CP_KYC_039 — JWT issued on every successful /cp/registration (token rotation)

| Field | Value |
|-------|-------|
| **Module** | CP – KYC (own) |
| **Pre-conditions** | CP performs kyc:true re-upload |
| **Type** | API |
| **Test Steps** | 1. Submit re-upload<br>2. Inspect response |
| **Expected Result** | Response includes freshly minted JWT (QA-Risk-12, cp.controller.js:450, 487). Frontend may rotate or ignore. Logging risk if response is logged. |
| **Priority** | Low (Security) |

---

### CP_KYC_040 — Pincode service failure blocks KYC re-upload

| Field | Value |
|-------|-------|
| **Module** | CP – KYC (own) |
| **Pre-conditions** | Mock Mavis pincode service to fail |
| **Type** | INT |
| **Test Steps** | 1. `POST /cp/registration` with kyc:true (pincode unchanged) |
| **Expected Result** | 500 returned — pincode fetch runs unconditionally even on re-upload (QA-Risk-7, cp.controller.js:94-106). |
| **Priority** | Medium |
