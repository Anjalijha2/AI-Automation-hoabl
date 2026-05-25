# FSD — CP Portal: KYC Assistance
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

"KYC Assistance" in the CP portal refers to the surface where a Channel Partner views the KYC documents associated with their own (CP) account — primarily PAN, RERA, and GST documents that were uploaded during CP onboarding/registration and persisted in LeadSquared. There is currently **no backend endpoint that allows a CP to upload, modify, or approve KYC on behalf of a buyer**.

Two KYC-adjacent capabilities are exposed to CPs:
1. `GET /api/v1/cp/kyc` — read the CP's own LSQ-stored KYC document links. // Source: routes/cp.routes.js:70
2. `POST /api/v1/cp/registration` (with `kyc: true` flag) — re-trigger the CP's own KYC document upload flow into LeadSquared. // Source: routes/cp.routes.js:19-33; controllers/cp.controller.js:60-62, 281-289, 376-378

This FSD documents the actual surface and explicitly flags the missing buyer-KYC-on-behalf surface.

---

## 2. Data Model

### CP's own KYC fields on `users`
Persisted directly on the CP's `User` row:
- `panNumber` // Source: controllers/cp.controller.js:123, 366
- `reraNumber` // Source: controllers/cp.controller.js:124, 367
- `hvCode` (XR code surface for CP, used in LSQ as `mx_XR_Code_Lead`) // Source: controllers/cp.controller.js:68-69, 370
- `encryptedHvCode` // Source: controllers/cp.controller.js:70-79, 372
- `prospectId` (LeadSquared linkage) // Source: controllers/cp.controller.js:352
- `isCpRegistrationCompleted` (boolean flag) // Source: controllers/cp.controller.js:371

### Buyer KYC tracking flags on `registration_units`
The KYC state for the **buyer** is tracked as boolean flags on the `registration_units` table (consistent with the buyer-side KYC FSD). Verified columns:
- `isKycSubmitted` (BOOLEAN, NOT NULL, default false). // Source: models/registration-unit.model.js:167-172
- `eVerificationCompleted` (BOOLEAN, NOT NULL, default false). // Source: models/registration-unit.model.js:173-178
- `eVerificationCompletedAt` (DATETIME, nullable). // Source: models/registration-unit.model.js:179-184
- `selfKycSubmitted` (BOOLEAN, nullable). // Source: models/registration-unit.model.js:185-190
- `selfKycBookingActivitySubmitted` (BOOLEAN, nullable). // Source: models/registration-unit.model.js:191-196
- `isKycPdfSubmitted` (BOOLEAN, NOT NULL, default false). // Source: models/registration-unit.model.js:197-202
- `selfKycFinalSubmitted` (BOOLEAN, nullable). // Source: models/registration-unit.model.js:203-208

### KYC document storage location
- CP documents (panDoc, reraDoc, gstDoc) are uploaded into LeadSquared via `lsqLeadService.uploadFile` with `EntitySchemaName: 'mx_CP_Document'` and schemas `mx_CustomObject_2` (PAN), `mx_CustomObject_4` (GST), `mx_CustomObject_1` (RERA). // Source: controllers/cp.controller.js:165-237
- LSQ-returned file URLs are read back through `getLeadById` + `getFileDetail`. // Source: controllers/cp.controller.js:404-437, 1641-1683
- Buyer KYC PDFs (when uploaded by buyer themselves) are sent to LSQ activity `Custom_48 / mx_CustomObject_2` via the buyer-side `uploadKycForm` controller — not via any CP endpoint. // Source: controllers/user.controller.js:1420-1500

### No dedicated KYC model
There is no `kyc.model.js` or `Kyc` Sequelize model — KYC is purely flags on `registration_units` for buyers and direct fields on `users` for CPs. // Source: models/ directory listing (no kyc model file)

---

## 3. State Machines

### CP KYC state (boolean flag-driven)
There is no enum-based state machine. CP KYC is represented by `user.isCpRegistrationCompleted` plus the presence/absence of the three document URLs in LeadSquared.

Transitions verified:
- **Initial**: CP exists with `isCpRegistrationCompleted=false`. // Source: controllers/cp.controller.js:42 (lookup by phone+role=cp)
- **After first `POST /api/v1/cp/registration`** (kyc=false): `isCpRegistrationCompleted=true`. // Source: controllers/cp.controller.js:371
- **Re-submit with `kyc=true`** (re-upload KYC docs): allowed even when `isCpRegistrationCompleted=true`. The 400 "User already registered" guard checks `if (user.isCpRegistrationCompleted && !req.body.kyc)`. // Source: controllers/cp.controller.js:60-62
- **Read KYC**: `GET /api/v1/cp/kyc` is a pure read with no state mutation. // Source: controllers/cp.controller.js:1609-1710

### Buyer KYC state (from CP's perspective)
- CPs do not transition buyer KYC state. There is no CP endpoint that writes to `registration_units.isKycSubmitted` or related flags. // Source: routes/cp.routes.js (verified entire file, no buyer-KYC route)
- The buyer-side state machine is documented in the buyer KYC FSD; CPs are observers only.

---

## 4. Business Rules

### BR-CPK-01 — CP self-KYC re-upload allowed
A registered CP may re-submit `POST /api/v1/cp/registration` with `kyc: true` to re-upload PAN/RERA/GST documents to LeadSquared. The 400 "User already registered" guard explicitly bypasses the check when `kyc` is truthy. // Source: controllers/cp.controller.js:60-62

### BR-CPK-02 — CP must exist (auth or by phone match)
`POST /api/v1/cp/registration` is the only CP-facing route declared BEFORE `router.use(protect)` (lines 19-33 vs. 36). It looks up the CP by `phone + roleId=cp` instead of relying on JWT. If no match, returns 400 "User not found". This is also how a "fresh" CP completes initial onboarding. // Source: routes/cp.routes.js:19-37; controllers/cp.controller.js:42-46

### BR-CPK-03 — `GET /api/v1/cp/kyc` requires CP role + auth
The KYC-read endpoint sits below `protect` + `restrictTo('cp')`. It reads `req.user.prospectId`. If `prospectId` is missing, returns 400 with the generic `pleaseTryAgain` ("Something went wrong, please try again!"). // Source: routes/cp.routes.js:36-37, 70; controllers/cp.controller.js:1612-1619

### BR-CPK-04 — Document type-to-schema mapping (LSQ)
// Source: controllers/cp.controller.js:165-237, 1645-1672
- PAN → `mx_CustomObject_2`
- GST → `mx_CustomObject_4`
- RERA → `mx_CustomObject_1`
All bound to `EntitySchemaName: 'mx_CP_Document'` and `EntityId = prospectId`.

### BR-CPK-05 — Document filename sanitization
File names are normalized via `buildFilename(<type>, hvCode, originalName)` before upload to LSQ. // Source: controllers/cp.controller.js:170, 205, 244

### BR-CPK-06 — Encrypted HV Code generation
HV Code = `HV` + zero-padded(8) of (489 + user.id). Encrypted with `crypto.encrypt` and persisted as `user.encryptedHvCode`. Idempotent — re-uses existing encrypted value if present. // Source: controllers/cp.controller.js:67-79

### BR-CPK-07 — Read-KYC response shape
// Source: controllers/cp.controller.js:1688-1707
```
{
  orgName, address, ownerName, email, phone, businessRegion,
  officePincode, panNumber, reraNumber,
  reraDoc, panDoc, gstDoc      // FileUrls from LSQ
}
```
File URL discovery uses keyword matching on file names: `'pan card'` → panDoc, `'rera soft copy'` → reraDoc, `'gst soft copy'` → gstDoc. // Source: controllers/cp.controller.js:1621-1632

### BR-CPK-08 — Buyer KYC assistance is OUT OF SCOPE in current backend
There is no endpoint under `/api/v1/cp/` that:
- Uploads buyer KYC documents on behalf of the buyer.
- Modifies `registration_units.isKycSubmitted` or related flags.
- Submits buyer applicant records.
- Approves or rejects buyer KYC.

The only KYC-related CP route is `GET /api/v1/cp/kyc` (CP's own docs). // Source: routes/cp.routes.js (verified entire file: only `/kyc` GET; no buyer-KYC POST/PUT)

### BR-CPK-09 — Who approves buyer KYC?
After buyer submits KYC via the buyer endpoint `POST /api/v1/user/upload-kyc-form`, the activity is dispatched to LeadSquared (`updateActivityV2`, ActivityEvent 126, schema `mx_Custom_48 / mx_CustomObject_2`). No approval workflow exists in the verified Express backend — the approval step appears to live in LeadSquared / downstream. // Source: controllers/user.controller.js:1474-1500

---

## 5. Notification Dispatch

### On CP self-registration (kyc=false branch)
- **WhatsApp to CP** — template `success_registercp`, params none. Sent to `+91 + phone`. // Source: controllers/cp.controller.js:376-378
  - **Bug note**: the code is `sendWhatsAppMessage(\`${+91}${formData.phone}\`, 'success_registercp')`. `${+91}` evaluates to `"91"` (without leading `+`). See KB-CPK-03.

### On CP re-upload with kyc=true
- **No WhatsApp / email sent.** The `if (!req.body.kyc) sendWhatsAppMessage(...)` guard skips notification on the KYC re-submission path. // Source: controllers/cp.controller.js:376-378

### On `GET /api/v1/cp/kyc`
- No notifications dispatched (pure read). // Source: controllers/cp.controller.js:1609-1710

### No notifications to buyer from CP KYC paths
Because no CP-side buyer-KYC endpoint exists, no buyer-facing notifications originate from the CP module. // Source: routes/cp.routes.js, controllers/cp.controller.js

---

## 6. API Endpoints

### POST /api/v1/cp/registration
- Auth: **None at route level** — declared before `router.use(protect)`. Caller identifies CP via `phone` body param. // Source: routes/cp.routes.js:19-37
- Middleware order: `cpDocumentUpload` (multer) → `validateRequest(cpRegistrationSchema)` → `addUserTypeMiddleware('cp')` → `CpController.registerCP`. // Source: routes/cp.routes.js:19-33
- Files accepted: `panDoc`, `gstDoc`, `reraDoc` (multipart). // Source: controllers/cp.controller.js:82-90
- Body schema (`cpRegistrationSchema`): phone (required, phoneRegex), phone2 (optional, must differ), email (required, emailRegex), email2 (optional, must differ), ownerName (required, max 100), orgName (required, max 100), address (required, max 255), businessRegion (required), officePincode (required, Indian regex), panNumber (required, panRegex), kyc (boolean optional), reraNumber (nullable, max 30). // Source: validations/cp.validations.js:4-83
- Behavior with `kyc: true`: re-uploads documents to LSQ, refreshes file URLs via `getLeadById` + `getFileDetail`, returns updated user object with token. Does NOT send the `success_registercp` WhatsApp. // Source: controllers/cp.controller.js:60-62, 281-289, 376-378, 384-447

### GET /api/v1/cp/kyc
- Auth: `protect` + `restrictTo('cp')`. // Source: routes/cp.routes.js:36-37, 70
- Validation: none.
- Handler: `CpController.getCpKyc`. // Source: controllers/cp.controller.js:1609
- Side-effects: external calls to LSQ `getLeadById(prospectId)` and `getFileDetail(prospectId, requestBody)`. // Source: controllers/cp.controller.js:1641, 1672

**Success response shape**
```
{
  message: "CP Kyc found",
  data: {
    orgName, address, ownerName, email, phone, businessRegion,
    officePincode, panNumber, reraNumber,
    reraDoc, panDoc, gstDoc        // string|null FileUrls
  }
}
```
// Source: controllers/cp.controller.js:1688-1709

**Error responses**
- 400 — `pleaseTryAgain` ("Something went wrong, please try again!") when `prospectId` missing. // Source: controllers/cp.controller.js:1614-1619
- 500 — "Failed to get KYC details" when LSQ call throws. // Source: controllers/cp.controller.js:1675-1683

### Endpoints absent (explicitly verified)
- No `POST /api/v1/cp/buyer-kyc/*`.
- No `POST /api/v1/cp/kyc/upload-for-buyer`.
- No `PUT /api/v1/cp/kyc/approve`.
- No CP-facing route that targets `registration_units` KYC fields.
// Source: routes/cp.routes.js (full file inspected)

---

## 7. Known Bugs / Gaps

### KB-CPK-01 — There is no CP-side buyer KYC assistance endpoint
The product concept of "KYC Assistance" (CP helps buyer upload KYC docs) is **not implemented in backend**. Any frontend KYC-assist UI is presumably a future feature or operates by simply directing the buyer to use the buyer-side `POST /api/v1/user/upload-kyc-form` themselves. // Source: routes/cp.routes.js; controllers/cp.controller.js

### KB-CPK-02 — `POST /api/v1/cp/registration` is unauthenticated
The CP self-registration / KYC re-upload endpoint is declared BEFORE `router.use(protect)` and identifies the CP solely by `phone`. Anyone with a CP's phone number can re-upload KYC documents to that CP's LSQ record. **Security concern**. // Source: routes/cp.routes.js:19-37

### KB-CPK-03 — Broken WhatsApp `to` interpolation
`sendWhatsAppMessage(\`${+91}${formData.phone}\`, 'success_registercp')` — `${+91}` is a unary plus applied to the literal `91`, producing the string `"91"` (no `+` prefix). Compare with other working calls that use `${+91}${...}` template — these all have the same defect, but Kaleyra may tolerate leading-91 prefix. Verify message delivery. // Source: controllers/cp.controller.js:377, 714, 1570

### KB-CPK-04 — `extractDocObject` returns undefined when `getFileDetail` returns no Files
If LSQ returns no `Files` array, `docLinks.Files.find(...)` throws TypeError. Wrapped in try/catch so error is masked as "Failed to get KYC details" 500. // Source: controllers/cp.controller.js:1622-1632

### KB-CPK-05 — `JSON.parse(leadFromLeadSquared[0].mx_CP_Document)` can throw
If the LSQ field is missing or non-JSON, `JSON.parse` throws and the catch returns generic 500. No granular error code distinguishes "no docs uploaded yet" from "LSQ down". // Source: controllers/cp.controller.js:1643

### KB-CPK-06 — Inconsistent commented LSQ docs comment vs. actual usage
The response builder comments out `// reraDoc: docDetails.mx_CustomObject_1 || null,` in favor of `reraDoc: docLinkObject.reraDoc || null`. If `docLinkObject` is undefined (uncaught path), the spread will throw at runtime. // Source: controllers/cp.controller.js:1700-1707

### KB-CPK-07 — File-keyword matching is fragile
The keyword match (`pan card`, `rera soft copy`, `gst soft copy`) depends on uploaders naming files with those exact substrings. The `buildFilename` helper used at upload time prefixes with `'pan'` / `'rera'` / `'gst'` (no `card`, no `soft copy`). Verify whether LSQ rewrites filenames or whether this keyword search misses uploaded files. // Source: controllers/cp.controller.js:170, 205, 244 vs. 1623-1631

### KB-CPK-08 — No retry / no idempotency on multi-document upload
`POST /api/v1/cp/registration` sequentially uploads PAN, then RERA, then GST. A failure on any single upload returns 500 to the client; partial uploads to LSQ remain. No transaction or rollback. // Source: controllers/cp.controller.js:165-275

### KB-CPK-09 — `req.user` is not used in registerCP (re-auth via phone)
Even on a `kyc: true` re-submission from an authenticated CP session, the controller looks up the CP by `req.body.phone`. The session user is ignored. A logged-in CP-A could submit `phone=<CP-B-phone>` and update CP-B's KYC docs. **Privilege escalation risk**. // Source: controllers/cp.controller.js:42

### KB-CPK-10 — `pleaseTryAgain` as 400 vs. 500
The KYC read returns 400 with `pleaseTryAgain` when `prospectId` is missing. 400 implies client error but the absence of `prospectId` is a server-side data integrity issue (CP record incomplete). Confusing for log triage. // Source: controllers/cp.controller.js:1614-1619

---

## 8. QA Risk Areas

### QA-Risk-01 — Verify the "CP helps with buyer KYC" requirement
Before automating any flow, confirm with PM/BA whether buyer-KYC-via-CP is a documented requirement. The backend currently provides no surface; either:
(a) the feature is not built and the FSD/BRD should record "Not Implemented", or
(b) the feature lives on a different surface (e.g., CP guides buyer through a buyer-portal flow).

### QA-Risk-02 — Security test on unauthenticated `/cp/registration`
Confirm anyone can hit `POST /api/v1/cp/registration` with `{phone: <existing CP phone>, kyc: true, ...docs...}` and overwrite that CP's LSQ KYC files. Recommend: add `protect`+`restrictTo('cp')` to this route OR add OTP gating. // Source: routes/cp.routes.js:19-37

### QA-Risk-03 — Privilege escalation via body phone
With session-A as CP-A and body `phone=<CP-B>`, validate whether `registerCP` updates CP-B's documents and LSQ data. // Source: controllers/cp.controller.js:42

### QA-Risk-04 — LSQ outage / partial upload handling
Pause LSQ at the GST-upload step and verify response, retry behavior, and the visibility of partial state in `GET /api/v1/cp/kyc`. // Source: controllers/cp.controller.js:239-275

### QA-Risk-05 — File-keyword extractor reliability
Upload a PAN file named e.g. `pan_<hvCode>_xyz.pdf` (per `buildFilename`) and verify `GET /api/v1/cp/kyc` returns its URL. The extractor searches for substring `"pan card"` — without the words "card" / "soft copy" in the filename, doc URLs may always come back null. // Source: controllers/cp.controller.js:1623-1631 vs. 170

### QA-Risk-06 — Multiple file uploads with same MIME but missing fields
Send only `panDoc` (no `gstDoc`, no `reraDoc`). Should succeed. Send no files at all on `kyc: true`. Verify response.

### QA-Risk-07 — Pincode service failure
`registerCP` calls `mavisService.fetchPincodeDetails`. On failure it returns 500 — including for KYC-only re-uploads where pincode is unchanged. // Source: controllers/cp.controller.js:94-106

### QA-Risk-08 — Token issuance on every call
`registerCP` issues a new JWT on every successful call, including `kyc: true` re-submissions. Verify whether the frontend handles token rotation or simply ignores. // Source: controllers/cp.controller.js:450, 487

### QA-Risk-09 — Cross-portal expectation mismatch
If the manual KYC-assistance UI in CP portal references buyer-KYC fields (e.g., shows buyer applicants), test what data the page actually fetches. There is no backend route for that data scoped to CP; the page might only show CP's own KYC.

### QA-Risk-10 — Concurrent re-upload by CP and admin
Admin portal may have its own KYC override path (out of this FSD). Test parallel writes from CP `/registration` and any admin endpoint to the same LSQ prospect.

### QA-Risk-11 — Validation gap on `panNumber` in kyc=true re-upload
`cpRegistrationSchema` requires `panNumber` always (no conditional on `kyc`). For a re-upload focused only on RERA/GST, the CP must still send the same PAN. Verify UI behavior. // Source: validations/cp.validations.js:67

### QA-Risk-12 — Response includes JWT — caching risk
The 200 OK response from `POST /api/v1/cp/registration` includes a freshly minted token. If logged/cached, that token is a long-lived credential. Audit logging policy. // Source: controllers/cp.controller.js:486-487
