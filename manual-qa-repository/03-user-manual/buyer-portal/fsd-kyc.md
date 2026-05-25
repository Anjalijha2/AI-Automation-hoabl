# FSD — Buyer Portal: KYC (Know Your Customer)
**Source-verified:** 2026-05-24
**Backend path:** `source-code/backend/src/`
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Buyer Portal KYC module is **not a stand-alone "KYC" entity** — it is a set of boolean flags + applicant records hung off the `registration_units` table. There is **no `kyc_documents` table, no `KycDocument` model, no `verifyKyc` controller, and no explicit `PENDING/SUBMITTED/APPROVED/REJECTED` ENUM**. KYC progress is tracked by booleans on `RegistrationUnit` and by `Applicant` rows holding PAN, Aadhaar, photo, and demographic data.

Two distinct submission flows exist:

1. **Self-KYC submit** — buyer (or sales-manager on their behalf in physical-event mode) submits via `POST /allocation/submit-kyc`. Flips `isKycSubmitted = true` + handles parking allocation. // Source: controllers/allocation.controller.js:171-211, services/allocation.service.js:1850-2202
2. **KYC PDF form upload** — after submit, buyer uploads a signed PDF via `POST /upload-kyc-form` which forwards to LeadSquared activity. // Source: controllers/user.controller.js:1420-1508, routes/user.routes.js:167

Applicant CRUD (PAN/Aadhaar/photo collection) is independent and runs before submit:
- `POST /applicants`, `GET /applicants/:id`, `PUT /applicants/:id`, `DELETE /applicants/:id`, `POST /applicants/merge-to-registration-unit`. // Source: routes/user.routes.js:90-164

KYC PDF is also generated server-side asynchronously by a cron that renders the booking form PDF and pushes it to LeadSquared. // Source: cron/kyc-booking-pdf.cron.js, services/kyc-booking-pdf.service.js:30-72

**No "approval" step exists in source.** Submission is self-attested. There is no admin "approve KYC" controller method; admin can only *view* `isKycSubmitted`. // Source: NOT FOUND — Grep for `approveKyc|verifyKyc|kycApproved|kycStatus` returned no matches across `controllers/`; verify with BA Agent.

---

## 2. Data Model

### Table `registration_units` — KYC-related columns (model: `RegistrationUnit`)

| Column | Type | Default | Comment |
|---|---|---|---|
| `kycNumber` | STRING(50) | NULL | KYC number linked to the registration unit. Format: `${registrationNumber}-KYC` // Source: models/registration-unit.model.js:89-93; written in services/allocation.service.js:2019 |
| `isKycSubmitted` | BOOLEAN | `false` | Whether KYC is submitted. // Source: models/registration-unit.model.js:167-172 |
| `eVerificationCompleted` | BOOLEAN | `false` | Digital verification via OTP completed. // Source: models/registration-unit.model.js:173-178 |
| `eVerificationCompletedAt` | DATE | NULL | Timestamp of OTP e-verification. // Source: models/registration-unit.model.js:179-184 |
| `selfKycSubmitted` | BOOLEAN | NULL | Self-KYC booking-form activity pushed to LSQ. // Source: models/registration-unit.model.js:185-190 |
| `selfKycBookingActivitySubmitted` | BOOLEAN | NULL | Self-KYC booking activity pushed to LSQ. // Source: models/registration-unit.model.js:191-196 |
| `selfKycFinalSubmitted` | BOOLEAN | NULL | Final MAVIS booking update done. // Source: models/registration-unit.model.js:203-208 |
| `isKycPdfSubmitted` | BOOLEAN | `false` | KYC PDF (cron-generated) uploaded to LSQ. // Source: models/registration-unit.model.js:197-202 |
| `bookingTokenActivitySubmitted` | BOOLEAN | NULL | Booking token activity in LSQ. // Source: models/registration-unit.model.js:230-237 |
| `bookingFormActivitySubmitted` | BOOLEAN | NULL | Booking form activity (post-KYC). // Source: models/registration-unit.model.js:254-261 |
| `bookingActivitySubmitted` | BOOLEAN | NULL | Booking activity (post-KYC). // Source: models/registration-unit.model.js:262-269 |
| `mavisBookingCreated` | BOOLEAN | NULL | MAVIS booking row created. // Source: models/registration-unit.model.js:238-245 |
| `mavisUnitUpdated` | BOOLEAN | NULL | MAVIS unit status updated. // Source: models/registration-unit.model.js:246-253 |
| `mavisBookingFinalUpdated` | BOOLEAN | NULL | MAVIS booking marked Final. // Source: models/registration-unit.model.js:282-289 |
| `lsqBookingActivityId` | STRING(255) | NULL | LSQ booking activity id. // Source: models/registration-unit.model.js:270-275 |
| `lsqBookingFormActivityId` | STRING(255) | NULL | LSQ booking form activity id. // Source: models/registration-unit.model.js:276-281 |

### Table `applicants` (model: `Applicant`)
KYC personal data lives here, NOT on `users`. // Source: models/applicants.model.js:46-145

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT.UNSIGNED PK | auto | // Source: models/applicants.model.js:48-52 |
| `userId` | BIGINT.UNSIGNED | NOT NULL, FK users.id, RESTRICT | // Source: models/applicants.model.js:53-62 |
| `firstName` | STRING(100) | NOT NULL | // Source: models/applicants.model.js:63-66 |
| `lastName` | STRING(100) | NOT NULL | // Source: models/applicants.model.js:67-70 |
| `phone` | STRING(15) | nullable | // Source: models/applicants.model.js:71-73 |
| `email` | STRING(100) | nullable | // Source: models/applicants.model.js:74-76 |
| `panCard` | STRING(10) | NOT NULL | // Source: models/applicants.model.js:77-80 |
| `aadhaarCard` | STRING(12) | NOT NULL | // Source: models/applicants.model.js:81-84 |
| `registrationId` | BIGINT.UNSIGNED | NOT NULL, FK registrations.id, RESTRICT | // Source: models/applicants.model.js:85-94 |
| `registrationUnitId` | INTEGER.UNSIGNED | NOT NULL, FK registration_units.id, RESTRICT | // Source: models/applicants.model.js:95-104 |
| `relation` | ENUM(`self`,`father`,`mother`,`brother`,`sister`,`spouse`) | NOT NULL | // Source: models/applicants.model.js:105-109 |
| `address` | STRING(255) | nullable | // Source: models/applicants.model.js:110-112 |
| `pincode` | STRING(15) | nullable | // Source: models/applicants.model.js:113-115 |
| `documents` | JSON | nullable | Holds `panDoc`, `aadhaarFront`, `aadhaarBack`, `photoDoc` blob descriptors. // Source: models/applicants.model.js:116-120; populated in controllers/user.controller.js:198-218 |
| `deletedAt` | DATE | nullable, paranoid soft-delete | // Source: models/applicants.model.js:131-135, 142 |

Document object shape (inside `documents` JSON):
```
{
  blobName: "<azure-blob-name>",
  contentType: "<mime>",
  s3FilePath: null,
  uploadedFile: null
}
```
// Source: controllers/user.controller.js:140-151

### Storage
- Documents are uploaded to **Azure Blob Storage**, NOT S3 (the `s3FilePath` field is always `null` — legacy). // Source: controllers/user.controller.js:130-150, services/storage/azure-blob.service.js (only file in services/storage/)
- Presigned read URLs are SAS-generated on read paths. // Source: services/kyc-booking-pdf.service.js:200-207 (`azureBlobService.generateSasUrl`)

---

## 3. State Machines

### 3.1 Per-RegistrationUnit KYC flag progression (no ENUM — boolean cascade)

```
[ unit created ]
    │
    │ buyer adds applicants (POST /applicants × N)
    ▼
[ applicants persisted, documents uploaded to Azure ]
    │
    │ POST /allocation/submit-kyc
    ▼
[ isKycSubmitted=true, kycNumber set, parking allocated if selected ]
    │
    │ async (createBookingFormActivity)
    ▼
[ bookingFormActivitySubmitted=true ]
    │
    ▼
[ bookingActivitySubmitted=true ]
    │
    ▼
[ mavisBookingFinalUpdated=true ]
    │
    │ cron (every 10 min) — cronPdfGenerationJob
    ▼
[ isKycPdfSubmitted=true ]
```
// Source: services/allocation.service.js:2014-2168 (sync portion), services/kyc-booking-pdf.service.js:30-72 + 414 (cron + final flag flip)

### 3.2 Self-KYC retry cron (every 15 min)

```
selfKycSubmitted ∈ {null,false}        →  step 1 (booking form activity)
                                              │ success
                                              ▼
                                       selfKycSubmitted=true
selfKycBookingActivitySubmitted ∈ {null,false} →  step 2 (booking activity)
                                              │ success
                                              ▼
                                       selfKycBookingActivitySubmitted=true
selfKycFinalSubmitted ∈ {null,false}   →  step 3 (MAVIS final update)
                                              │
                                              ▼
                                       selfKycFinalSubmitted=true|false
```
// Source: cron/self-kyc-lsq-update.cron.js:14-83 (schedule `*/15 * * * *`), services/custom-submit-kyc.service.js:229-273

### 3.3 Parking sub-flow inside submit-kyc

```
isParkingSelected=true
   │
   ▼
[ MasterConfig key='park_enabled' must be true ] -- else rollback, fail unit
   │
   ▼
[ ParkingInventory.findOne(status='AVAILABLE', SELECT FOR UPDATE) ] -- else fail "No parking spots available"
   │
   ▼
[ row.update({status:'BOOKED', registrationUnitId: <unitId>}) ]
   │
   ▼
[ RegistrationUnit.parkingCount = (existing||0)+1, parkingAmount += row.amount ]
```
// Source: services/allocation.service.js:1967-2010

### 3.4 KYC PDF upload (manual buyer upload) — pre-conditions
- Reject if no `pdfFile` in request. // Source: controllers/user.controller.js:1443-1445
- Reject if `lsqBookingActivityId` missing OR `isKycSubmitted = false`: error `"Cannot submit KYC token verification in progress"`. // Source: controllers/user.controller.js:1447-1449

---

## 4. Business Rules

### BR-KYC-001 — KYC is self-attested, not admin-approved
No `kycStatus` ENUM and no admin approve/reject endpoint exists. `isKycSubmitted` flips to `true` purely on buyer/SM submit. // Source: services/allocation.service.js:2014-2028 (no admin gate); NOT FOUND for `approveKyc`/`verifyKyc` controllers.

### BR-KYC-002 — KYC number format
On submit, `kycNumber = ${registrationNumber}-KYC`. // Source: services/allocation.service.js:2019

### BR-KYC-003 — Ownership check before submit
`submitKycService` requires every `registrationUnitId` in the payload to belong to a Registration owned by the authenticated user (`Registration.userId = req.user.id`). Mismatch → `403 "You don't have access to some registration units"`. // Source: services/allocation.service.js:1857-1889

### BR-KYC-004 — Idempotent submit
If `userOwnedUnit.isKycSubmitted` already true, the unit is added to `processedUnits` and skipped (no error, no duplicate side effects). // Source: services/allocation.service.js:1929-1937

### BR-KYC-005 — Atomic per-unit transactions
Each registration unit is processed inside its own `sequelize.transaction()`; failure on one unit does not rollback others. Partial success returns HTTP `207` (Multi-Status). // Source: services/allocation.service.js:1960, 1962-2052, 2188-2193

### BR-KYC-006 — Submit payload schema
```
[
  {
    userId?: number,
    registrationUnitId: string (required),
    otpVerified?: boolean,
    isParkingSelected: boolean (required),
    parkingCount: number (required + min(1) when isParkingSelected=true; else nullable)
  }
]
```
Array with `min(1)`. // Source: validations/allocation.validations.js:34-51

### BR-KYC-007 — Parking project-config gate
Parking can only be allocated if `MasterConfig.findOne({ key:'park_enabled' })` returns `valueBoolean === 1 || true`. // Source: services/allocation.service.js:1970-1979

### BR-KYC-008 — Applicants required for downstream booking flow
After `isKycSubmitted`, the post-processing query requires `Applicant` to be present (`required: true`). Without applicants, booking-form activity will not be created. // Source: services/allocation.service.js:2081-2098

### BR-KYC-009 — Applicant cap
`max_applicants_per_unit` master-config (default `4`). 5th add returns `400 "Maximum N applicants allowed per registration unit"`. // Source: controllers/user.controller.js:243-256

### BR-KYC-010 — Duplicate applicant prevention
Cannot add an applicant whose `phone OR aadhaarCard OR panCard` already exists on the same `(userId, registrationUnitId)`. // Source: controllers/user.controller.js:259-272

### BR-KYC-011 — Relation uniqueness for self/father/mother
Only one applicant per `(userId, registrationUnitId)` can have relation `self`, `father`, or `mother`. // Source: controllers/user.controller.js:275-286

### BR-KYC-012 — Add-applicant payload validation (Yup)
- `firstName`, `lastName`, `phone (≤15)`, `email`, `relation`, `address`, `pincode (≤15)` — all required. // Source: validations/applicant.validations.js:6-23
- `panCard`: exactly 10 chars. // Source: validations/applicant.validations.js:12-15
- `aadhaarCard`: exactly 12 digits, regex `^\d{12}$`. // Source: validations/applicant.validations.js:16-19
- `registrationUnitId`: number (required). // Source: validations/applicant.validations.js:7

### BR-KYC-013 — Document MIME whitelist
Default applicant uploader accepts `application/pdf`, `image/jpeg`, `image/png` only (others rejected by `fileFilter`). // Source: utils/upload.js:34-42

### BR-KYC-014 — Applicant document size cap
`applicantDocumentUpload` enforces `fileSize: 5 * 1024 * 1024` (5 MB) per file. // Source: utils/upload.js:140-149

### BR-KYC-015 — Applicant document fields & cardinality
Multer fields: `panDoc` (1), `aadhaarFront` (1), `aadhaarBack` (1), `photoDoc` (1). // Source: utils/upload.js:144-149

### BR-KYC-016 — Add-applicant mandatory documents
`requireMandatoryDocuments: true` for `POST /applicants` — PAN, aadhaarFront, aadhaarBack uploads must succeed. `photoDoc` is optional. // Source: controllers/user.controller.js:179-196, 300-305

### BR-KYC-017 — Storage backend
Documents stored to Azure Blob with path `applicants/<userId>/<filename>`; `s3FilePath` is hard-coded NULL (legacy). // Source: controllers/user.controller.js:131-150

### BR-KYC-018 — KYC PDF upload field & limit
`POST /upload-kyc-form` accepts a single `pdfFile` field via `kycDocumentUpload`. Multer `limits.fileSize` is **commented out** (`// 50MB`) — no enforced size limit. MIME passes through default filter (`pdf/jpeg/png`). // Source: utils/upload.js:151-155

### BR-KYC-019 — KYC PDF upload pre-condition
Buyer can only upload PDF after both `lsqBookingActivityId` is set AND `isKycSubmitted = true`. Otherwise `400 "Cannot submit KYC token verification in progress"`. // Source: controllers/user.controller.js:1447-1449

### BR-KYC-020 — Auto-generated KYC PDF cron
Every 10 minutes (Asia/Kolkata), cron picks up to 5 units with `isKycSubmitted=true`, `isKycPdfSubmitted=false`, `lsqBookingActivityId IS NOT NULL` and processes each. // Source: cron/kyc-booking-pdf.cron.js:37-58, services/kyc-booking-pdf.service.js:30-51

### BR-KYC-021 — Self-KYC LSQ retry cron
Every 15 minutes, picks units with `isKycSubmitted=false, unitId IS NOT NULL, bookingTokenActivitySubmitted=true` AND (`selfKycSubmitted=false OR selfKycBookingActivitySubmitted=false OR selfKycFinalSubmitted=false`). // Source: cron/self-kyc-lsq-update.cron.js:13-69

### BR-KYC-022 — e-Verification OTP path (physical event)
Only when `reqFromSm === true && otpVerified === true` is `eVerificationCompleted=true` and `eVerificationCompletedAt=NOW()`. Buyer self-flow leaves these `false/null`. // Source: services/allocation.service.js:2011-2018

### BR-KYC-023 — Cache invalidation
After successful submit, `updateKycInCache(projectId, registrationNumber)` flips Redis `is_kyc_submitted = 1`. // Source: services/allocation.service.js:2033-2034, 2204-2210

### BR-KYC-024 — Audit logging
`RegistrationUnit.auditEnabled = true` — all KYC-flag changes audit-tracked. // Source: models/registration-unit.model.js:358

---

## 5. Notification Dispatch

### KYC submit success
- **LSQ booking-form activity** push (`createBookingFormActivity`) — // Source: services/allocation.service.js:2107
- **LSQ booking activity** push (`createBookingActivity`) — // Source: services/allocation.service.js:2114
- **LSQ KYC status update** (`updateKycStatus(user.prospectId)`) — // Source: services/allocation.service.js:2105
- **MAVIS booking row** lookup + final update — // Source: services/allocation.service.js:2122-2150
- Note: per `CLAUDE.md` constraint #1, LSQ is excluded from test scope but still dispatched at runtime.

### KYC PDF (manual upload via `/upload-kyc-form`)
- **LSQ file upload** via `lsqLeadService.uploadFile(form)` with `SchemaName='mx_CustomObject_2'`, `EntitySchemaName='mx_Custom_48'`, `FileType=7`, `ActivityEvent=126`. // Source: controllers/user.controller.js:1452-1494
- **LSQ activity v2 update** with the uploaded file reference. // Source: controllers/user.controller.js:1494

### KYC PDF (cron-generated)
- PDF rendered via `generatePdfBuffer(unitData, costSheetData)` (template `services/pdf/components/kycBookingFormTamplate.ejs`). // Source: services/kyc-booking-pdf.service.js:253
- Uploaded to LSQ via `lsqLeadService.uploadFile` + `updateActivityV2` (same schema as above). On success, flips `isKycPdfSubmitted = true`. // Source: services/kyc-booking-pdf.service.js:326-417

### Email / SMS / WhatsApp on KYC events
// Source: NOT FOUND — no `emailService`, `smsService`, `whatsappService`, `kaleyraService` imports inside `submitKycService`, `processSelfKycUnit`, `uploadKycForm`, `processPdfGenerationJob`, or `createCustomBookingFormActivity`. Verified by Grep on services/allocation.service.js:1850-2202, services/custom-submit-kyc.service.js:175-275, controllers/user.controller.js:1420-1508. Verify manually whether downstream KYC confirmation comm is fired from another module.

---

## 6. API Endpoints

All buyer-role routes below require `Authorization: Bearer <jwt>` + role `user` + `addUserTypeMiddleware('user')`. // Source: routes/user.routes.js:49-51

### 6.1 POST `/applicants` — Add applicant + documents
- **Middleware**: `applicantDocumentUpload` (multer.memoryStorage, 5MB per file, MIME `pdf/jpeg/png`) → `validateRequest(addApplicantSchema)` → `addApplicants` // Source: routes/user.routes.js:90-102, utils/upload.js:140-149
- **Body fields** (multipart): `registrationUnitId`, `firstName`, `lastName`, `phone`, `email`, `panCard` (10 chars), `aadhaarCard` (12 digits), `relation`, `address`, `pincode`
- **Files** (multipart): `panDoc` (required), `aadhaarFront` (required), `aadhaarBack` (required), `photoDoc` (optional)
- **200** `{ success:true, data: <applicant> }`
- **400** "Not authorized to assign applicant to this registration unit" // Source: controllers/user.controller.js:237-241
- **400** "Maximum N applicants allowed per registration unit" // Source: controllers/user.controller.js:251-256
- **400** "Applicant with this phone number, aadhaar card or pan card already exists for this registration unit" // Source: controllers/user.controller.js:267-272
- **400** "An applicant with relation '<rel>' already exists for this registration unit" // Source: controllers/user.controller.js:280-285
- **404** "Registration unit not found" // Source: controllers/user.controller.js:288-291
- **500** "Something went wrong" // Source: controllers/user.controller.js:315-318

### 6.2 POST `/applicants/merge-to-registration-unit` — copy existing applicants
- // Source: routes/user.routes.js:104-115, controllers/user.controller.js:322+

### 6.3 GET `/applicants/:id`
- Read single applicant. // Source: routes/user.routes.js:130-140

### 6.4 PUT `/applicants/:id`
- Multer `applicantDocumentUpload` + `updateApplicantSchema`. // Source: routes/user.routes.js:141-153, validations/applicant.validations.js:25-37

### 6.5 DELETE `/applicants/:id`
- Soft delete (paranoid). // Source: routes/user.routes.js:154-164, models/applicants.model.js:142

### 6.6 POST `/registration-units/applicants` — get applicants for a list of units
- Body: `{ registrationUnitIds: number[] (min 1, positive) }`. // Source: routes/user.routes.js:117-128, validations/applicant.validations.js:39-44

### 6.7 GET `/registration-units/booking-form-data/:registrationUnitId`
- Returns full unit + applicants + documents (with Azure SAS URLs) used to render the KYC review/print page. // Source: routes/user.routes.js:166, controllers/user.controller.js:888-1010+

### 6.8 POST `/allocation/submit-kyc` — main KYC submit
- **Middleware**: `validateRequest(submitKycSchema)` // Source: routes/user/allocation.routes.js:33-43
- **Body** (array, min 1):
  ```
  [{ registrationUnitId: string (required),
     isParkingSelected: boolean (required),
     parkingCount: number (required + min 1 when isParkingSelected, else nullable),
     otpVerified?: boolean,
     userId?: number }]
  ```
  // Source: validations/allocation.validations.js:34-51
- **200** `{ success:true, message:'KYC data submitted successfully', data:{ processedUnits } }` — all units OK. // Source: services/allocation.service.js:2172-2178, controllers/allocation.controller.js:198-199
- **207 Multi-Status** `{ success:true, message:'KYC submission failed for some units' | 'KYC submission failed - No parking spots available for some units', data:{ processedUnits, failedUnits } }`. // Source: services/allocation.service.js:2180-2193, controllers/allocation.controller.js:190-197
- **403** "You don't have access to some registration units" — ownership check fail. // Source: services/allocation.service.js:1883-1889
- **404** "User not found" — only on `reqFromSm` flow. // Source: controllers/allocation.controller.js:179-181
- **500** "Something went wrong". // Source: controllers/allocation.controller.js:207-210

### 6.9 POST `/upload-kyc-form` — manual KYC PDF upload
- **Middleware**: `kycDocumentUpload` (`pdfFile` field, no enforced size limit, default MIME `pdf/jpeg/png`) → `validateRequest(uploadKycFormSchema)` → `uploadKycForm` // Source: routes/user.routes.js:167, utils/upload.js:151-155
- **Body**: `{ registrationUnitId: number (required) }`. // Source: validations/applicant.validations.js:46-48
- **File**: `pdfFile` (required). // Source: controllers/user.controller.js:1443-1445
- **200** "Kyc form uploaded successfully". // Source: controllers/user.controller.js:1503
- **400** "PDF file is required". // Source: controllers/user.controller.js:1444
- **400** "Cannot submit KYC token verification in progress". // Source: controllers/user.controller.js:1448
- **404** "Registration unit not found". // Source: controllers/user.controller.js:1440
- **500** "Something went wrong". // Source: controllers/user.controller.js:1471, 1500, 1506

### 6.10 GET `/cronPdfGenerationJob` — manual cron trigger
- Authenticated buyer can manually trigger PDF cron (likely debug route — exposed publicly under user role). // Source: routes/user.routes.js:169

---

## 7. Known Bugs / Gaps

### BUG-KYC-001 — `/upload-kyc-form` has no file-size limit
`kycDocumentUpload` has the `limits` line commented out. An attacker authenticated as `user` can upload arbitrarily large files in-memory (multer `memoryStorage`). DoS risk. // Source: utils/upload.js:151-155

### BUG-KYC-002 — `/cronPdfGenerationJob` exposed under buyer role
A GET route that triggers the cron job is mounted under `protect + restrictTo('user')`. Any buyer can spam it. No rate limiting visible. // Source: routes/user.routes.js:169

### BUG-KYC-003 — KYC PDF cron 5-unit batch with no offset
`processPdfGenerationJob` LIMIT=5 with no cursor; if a unit fails permanently, it can block the queue head every tick. // Source: services/kyc-booking-pdf.service.js:50-51

### BUG-KYC-004 — Inconsistent `processedUnits` shape
On the duplicate-submit fast-path the entry is `{ id, registrationNumber, regUnitId }`, on the create path it is `{ id, registrationNumber: <obj>, unitId }` (registrationNumber as object vs string). Frontend may break. // Source: services/allocation.service.js:1931-1935 vs 2036-2040

### BUG-KYC-005 — Always returns `success:true` even on per-unit failure
Status code switches to `207`, but `success: true` is sent. Strict client error handling on `success===true` will miss failures. // Source: services/allocation.service.js:2188-2193

### BUG-KYC-006 — Misleading error message
`"Cannot submit KYC token verification in progress"` is returned both when `lsqBookingActivityId` is missing AND when `isKycSubmitted` is false — two distinct conditions collapsed into one ambiguous message. // Source: controllers/user.controller.js:1447-1449

### BUG-KYC-007 — Race on parking inventory FOR UPDATE
`ParkingInventory.findOne(..., lock: UPDATE)` ordered by `id ASC` — under concurrent submits two units may attempt to lock the same row sequentially, causing one to fail with "No parking spots available" rather than picking the next available. // Source: services/allocation.service.js:1982-1993

### BUG-KYC-008 — Applicant relation enum lower-cased everywhere except validation
Yup schema does not enforce `relation` to be lower-case; controller compares `applicantData.relation.toLowerCase()` against the ENUM. A request with `'Self'` may pass validation but fail Sequelize ENUM insert. // Source: controllers/user.controller.js:275, models/applicants.model.js:105-109, validations/applicant.validations.js:20

### BUG-KYC-009 — `applicantDocumentUpload` field `aadhaarFront`/`aadhaarBack`
Field names match `addApplicantSchema` paths but the `homeLoanDocumentUpload` for the same type uses `aadharDoc[]`/`panDoc` — naming drift across modules can confuse test fixtures. // Source: utils/upload.js:124-149

### BUG-KYC-010 — Hard-coded LSQ schema names in buyer controller
`SchemaName: 'mx_CustomObject_2'`, `EntitySchemaName: 'mx_Custom_48'`, `ActivityEvent: 126` are duplicated in BOTH `controllers/user.controller.js:1457-1463` AND `services/kyc-booking-pdf.service.js:350-356`. Schema change requires two-file edit.

### GAP-KYC-001 — No admin approve/reject KYC endpoint
// Source: NOT FOUND — `grep -ri "approveKyc|verifyKyc|rejectKyc|kycApproved|kycRejected|kycStatus"` returned no controller matches. Admin can only view `isKycSubmitted`. Confirm with BA Agent whether this is by design.

### GAP-KYC-002 — No KYC ENUM (`PENDING/SUBMITTED/APPROVED/REJECTED`)
The buyer KYC has only `isKycSubmitted` boolean. There is no `'PENDING'` state stored explicitly — pre-submit is implied by `isKycSubmitted=false`. // Source: models/registration-unit.model.js:167-172

### GAP-KYC-003 — No dedicated `KycDocument` / `kyc_documents` table
Documents live inside `applicants.documents` JSON. No FK, no versioning, no audit at document level. // Source: models/applicants.model.js:116-120

### GAP-KYC-004 — No re-upload / replace UX
There is no PUT endpoint for individual documents — the only path is `PUT /applicants/:id` which re-uploads the whole document set. Single document fix requires re-uploading all. // Source: routes/user.routes.js:141-153, controllers/user.controller.js (no `replaceDocument` function found)

### GAP-KYC-005 — `s3FilePath` and `uploadedFile` columns are dead code
Hard-coded `null` in every upload result. Stored in JSON despite being unused. Legacy migration leftovers. // Source: controllers/user.controller.js:148-149

---

## 8. QA Risk Areas

### RISK-KYC-001 — Multipart form-data assembly
Tests must use multipart/form-data with exact field names (`panDoc`, `aadhaarFront`, `aadhaarBack`, `photoDoc`, `pdfFile`). Plain JSON will silently miss the file payload. // Source: utils/upload.js:140-155

### RISK-KYC-002 — Azure Blob dependency
Document uploads invoke `azureBlobService.uploadFile`. UAT tests need a configured Azure storage account or a stub; otherwise `addApplicants` will fail with 500. // Source: controllers/user.controller.js:133

### RISK-KYC-003 — LSQ side effect on submit
`submitKyc` triggers LSQ activity create + MAVIS calls inside the request lifecycle. Per CLAUDE.md, LSQ is excluded — tests must mock/skip these calls or guard with `test.skip(process.env.ENV === 'uat', 'Skipped on UAT — LSQ live')`. // Source: services/allocation.service.js:2103-2168

### RISK-KYC-004 — Master config `park_enabled` flips behaviour
Parking submit succeeds only if `master_config.park_enabled` is true (BR-KYC-007). Tests must seed/inspect `master_config` before parking-positive cases. // Source: services/allocation.service.js:1970-1979

### RISK-KYC-005 — Cron interference during test runs
`self-kyc-lsq-update.cron.js` runs every 15 min; `kyc-booking-pdf.cron.js` every 10 min. A test environment with crons enabled may flip flags mid-test. Disable crons or pin time. // Source: cron/self-kyc-lsq-update.cron.js:15, cron/kyc-booking-pdf.cron.js:39

### RISK-KYC-006 — Partial-success 207 handling
QA must assert HTTP status code (207), not just `success: true`. See BUG-KYC-005. // Source: services/allocation.service.js:2188-2193

### RISK-KYC-007 — Applicant cap is config-driven
Default 4 but `master_config.max_applicants_per_unit` may differ on UAT. Hard-coded 5th-applicant negative tests will flake. // Source: controllers/user.controller.js:243-256

### RISK-KYC-008 — Aadhaar regex differs across endpoints
Add (`/^\d{12}$/`) vs update (`.length(12)`). A 12-char alphanumeric Aadhaar passes update but fails add. // Source: validations/applicant.validations.js:18 vs :32

### RISK-KYC-009 — Soft-delete leakage
`applicants` is paranoid; the `applicantsCount` dashboard subquery filters `deleted_at IS NULL` explicitly, but other counts (`Applicant.count` in add-applicant cap) DO NOT use `paranoid: false` — a soft-deleted applicant frees a slot under the cap. Verify intended. // Source: controllers/user.controller.js:247-249

### RISK-KYC-010 — Document MIME for KYC PDF
`/upload-kyc-form` accepts `application/pdf|image/jpeg|image/png` (default filter), not strictly PDF — a buyer can upload a JPEG via the "PDF" endpoint. // Source: utils/upload.js:34-42, 151-155

### RISK-KYC-011 — Memory pressure on PDF upload
Multer `memoryStorage` + no size limit (BUG-KYC-001) means a 500 MB upload occupies Node heap. Load tests must monitor RSS. // Source: utils/upload.js:11, 151-155

### RISK-KYC-012 — Ownership enforced only on direct submit, not on `reqFromSm` path
When `reqFromSm === true`, `user = User.findByPk(firstItem.userId)` — SM-bearer token can submit KYC on behalf of any user. Authorization gating relies on the SM role guard on the SM route (not the user route). // Source: controllers/allocation.controller.js:173-184, routes/sales-manager/physical-event.routes.js:215-223

### RISK-KYC-013 — Cache flip without DB readback
`updateKycInCache` sets Redis `is_kyc_submitted = 1` even if downstream LSQ/MAVIS later fails. Dashboard may show KYC done while booking activity flags are false. // Source: services/allocation.service.js:2033-2034, 2204-2210

### RISK-KYC-014 — `kycNumber` collision
`kycNumber` is plain `${registrationNumber}-KYC` with no uniqueness constraint declared in the model. A re-submit (idempotent) would re-write the same value but the DB allows nulls/duplicates by default. // Source: services/allocation.service.js:2019, models/registration-unit.model.js:89-93

### RISK-KYC-015 — Booking PDF cron writes to /tmp
`updateLsqBookingFormActivity` writes a temp file via `path.join(os.tmpdir(), ...)` then `fs.unlinkSync`. On a container with read-only tmp or under quota, the cron fails silently. // Source: services/kyc-booking-pdf.service.js:340-372

### RISK-KYC-016 — Cron debug route exposure
`GET /cronPdfGenerationJob` is reachable by any logged-in buyer (BUG-KYC-002). Security test should verify it cannot enumerate other users' units. // Source: routes/user.routes.js:169
