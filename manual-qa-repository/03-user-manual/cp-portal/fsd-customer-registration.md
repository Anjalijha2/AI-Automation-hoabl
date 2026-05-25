# FSD — CP Portal: Customer Registration
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

CP-side customer registration is the flow by which an authenticated Channel Partner ("cp" role) captures a buyer-side lead and dispatches a tokenized registration link to that buyer. This is **not** buyer self-registration — the CP creates a buyer `User` record (or reuses an existing one) and a `RegistrationDraft` row scoped by `cpId`, then forwards a WhatsApp + (for NRI) email link that the buyer follows to complete the actual registration + payment.

Endpoint: `POST /api/v1/cp/cp-user-register`. // Source: routes/cp.routes.js:58-63; routes/index.js:72

Auth: requires `protect` middleware AND `restrictTo('cp')`. // Source: routes/cp.routes.js:36-37

Related listing/KPI endpoints under `/api/v1/cp/`:
- `GET /cp-user-registrations` // Source: routes/cp.routes.js:65
- `GET /cp-user-leads` // Source: routes/cp.routes.js:66
- `GET /send-registration-link/:slug` // Source: routes/cp.routes.js:67
- `GET /cp-user-kpi` // Source: routes/cp.routes.js:68

---

## 2. Data Model

### Tables involved
- `users` — both CP and buyer rows distinguished by `role_id`. // Source: controllers/cp.controller.js:42, 794-851
- `registration_drafts` (Model `RegistrationDraft`) — CP-created lead capture. // Source: controllers/cp.controller.js:881-892
- `registrations` (Model `Registration`) — created later when buyer pays; uniqueness check guards re-capture. // Source: controllers/cp.controller.js:809-818
- `projects` — current target project hard-coded per env (prod=1, non-prod=2). // Source: controllers/cp.controller.js:782

### Buyer user fields written on CP capture
// Source: controllers/cp.controller.js:839-851
```
firstName     <- req.body.firstName
lastName      <- req.body.lastName
countryCode   <- req.body.countryCode (effectiveCountryCode logic: NRI? value || '+91' : '+91')
phone         <- req.body.phone
email         <- req.body.email (may be null)
roleId        <- roleNameIdMap.user
isNri         <- Boolean(req.body.nri)
```
Note: `effectiveCountryCode` is computed for messaging (line 777) but the User row uses the raw `countryCode` from request body. // Source: controllers/cp.controller.js:777, 843

### `registration_drafts` fields written
// Source: controllers/cp.controller.js:856-892
```
slug           = encrypt("<userId>/<hvCode>")  (AES-encrypted; same crypto util as CP)
cpId           = req.user.id
projectId      = (production ? 1 : 2)
userId         = newly-created or existing buyer user id
status         = 'Open'
draft (JSON)   = {
  firstName, lastName, phone, email, address, pincode,
  occupation, nationality, companyName, officePincode, sourceType,
  xrCode, carpetArea, selectedApartments, apartments,
  industry, budget, minimumFloor, maximumFloor,
  homeLoanIntent, purchasePurpose,
  idDraft: true
}
```

### Status enum (`statusNames`) used downstream
// Source: constants/global.js:48-53
`Open`, `Won`, `Lost`, `Refunded`. The KPI/listing endpoints map these to user-facing labels: Open|Lost → "Sent", Won → "Registered", Refunded → "Refunded". // Source: controllers/cp.controller.js:1256-1262, 1322-1328

---

## 3. State Machines

### `RegistrationDraft.status`
Values observed in code: `Open` (created), `Lost`, `Won`, `Refunded`. // Source: constants/global.js:48-53; controllers/cp.controller.js:1593-1596 (status==='Refunded' → reset to 'Open' on resend)

Transitions verified:
- **Create** (CP captures lead): status set to `Open`. // Source: controllers/cp.controller.js:888
- **Refunded → Open** when CP re-sends registration link via `GET /send-registration-link/:slug`. // Source: controllers/cp.controller.js:1593-1596
- Transitions to `Won` / `Lost` / `Refunded` are not performed in the verified CP controller. // Source: NOT FOUND — verify manually (likely owned by registration/payment-success/refund flows)

### Buyer User row state
- **Brand new buyer**: created with `isNri` boolean; no payment record yet. // Source: controllers/cp.controller.js:839-851
- **Existing buyer reused**: only when no `RegistrationDraft` exists for `(userId, cpId, projectId)` AND no `Registration` with `paymentStatus='success'` for `(userId, projectId)`. // Source: controllers/cp.controller.js:796-821

---

## 4. Business Rules

### BR-CPR-01 — Auth required; CP role only
Endpoint sits below `router.use(protect); router.use(restrictTo('cp'));`. // Source: routes/cp.routes.js:36-37

### BR-CPR-02 — Phone-based buyer uniqueness
Buyer lookup keys on `(phone, roleId=user)`. There is **no email-based uniqueness check**; the email-uniqueness branch is commented out. // Source: controllers/cp.controller.js:784-787, 824-836

### BR-CPR-03 — Duplicate lead prevention per CP
If a `RegistrationDraft` row already exists for `(userId, cpId, projectId)`, response is 409 "Lead for this User is already Captured." // Source: controllers/cp.controller.js:797-807

### BR-CPR-04 — Already-paid buyer rejection
If an existing `Registration` exists for `(userId, projectId)` with `paymentStatus='success'`, response is 409 "User has already completed registration." // Source: controllers/cp.controller.js:809-818

### BR-CPR-05 — Duplicate phone (different role) check on new buyers
When no existing user is found, code re-checks phone uniqueness scoped to role=user. If a duplicate exists, response is `httpStatus.CONFLICT` with message "Provided phone number is already registered." (The email branch of the Promise.all is currently `Promise.resolve(null)` — disabled.) // Source: controllers/cp.controller.js:824-837

### BR-CPR-06 — Project selection
Current project is environment-pinned: `app.production ? 1 : 2`. There is no per-request project picker on the CP-user-register endpoint. // Source: controllers/cp.controller.js:782

### BR-CPR-07 — Slug generation and encryption
`slug = encrypt("<user.id>/<hvCode>")`. The encrypted slug becomes the `RegistrationDraft.slug` and is also returned to the CP UI as `registrationNumber`. The buyer link is `${app.registrationUrl}/ref/<encryptedSlug>`. // Source: controllers/cp.controller.js:853-854, 921-930

### BR-CPR-08 — Transactional draft create
Buyer user create + draft create wrapped in a single `sequelize.transaction()`. On any error, both rollback and a 500 is returned. // Source: controllers/cp.controller.js:780-905

### BR-CPR-09 — `effectiveCountryCode` for NRI buyer messaging
For WhatsApp dispatch only, `effectiveCountryCode = nri ? (countryCode || '+91') : '+91'`. // Source: controllers/cp.controller.js:777

### BR-CPR-10 — Validation rules (cpUserRegistrationSchema)
// Source: validations/registration.validations.js:164-224 (and continuation)
- `firstName`: required, trimmed, max 50.
- `lastName`: trimmed, max 50 (NOT required — `.required` is commented).
- `email`: regex `emailRegex`, NOT required (nullable).
- `phone`: required (regex check commented out — only `required` enforced).
- `countryCode`: regex `^\+\d{1,3}$` (required validator commented out).
- `address`: trimmed, max 255 (required commented out).
- `pincode`: trimmed (length/required commented out).
- `occupation`: trimmed, max 100, nullable.
- `companyName`: trimmed, max 100 (required commented out).
- `officePincode`: trimmed (length/required commented out).

(Remaining fields — sourceType, xrCode, hvCode, carpetArea, selectedApartments, apartments, nri, industry, budget, minimumFloor, maximumFloor, homeLoanIntent, purchasePurpose — are accepted by the controller via destructuring at `controllers/cp.controller.js:749-775`; their validation continues past the snippet read but most are not strictly required.) // Source: validations/registration.validations.js:164+ (truncated read); controllers/cp.controller.js:749-775

### BR-CPR-11 — Lead is keyed on `cpId` not on master CP
CPs can be master (`isLeadCp=true`) with member CPs. Listing endpoints aggregate by `masterHvCode` membership, but the **create** endpoint always sets `cpId = req.user.id` (no master-on-behalf-of-member create). // Source: controllers/cp.controller.js:884; (no override observed in registerCP body)

### BR-CPR-12 — Auto re-open of Refunded leads on resend
`GET /send-registration-link/:slug` mutates draft.status from `Refunded` → `Open` (silent side-effect of a send action). // Source: controllers/cp.controller.js:1593-1596

---

## 5. Notification Dispatch

### On successful CP customer capture (POST /cp-user-register)
- **WhatsApp to buyer** — template `cp_link_share_latest`, params `["<firstName> <lastName>", "${app.registrationUrl}/ref/${encryptedSlug}"]`. // Source: controllers/cp.controller.js:921-926
- **Email to buyer (NRI only, when email present)** — `template: 'nri-cp-referral'`, subject "Registration link for Payment", body data `{ name, registrationLink }`. // Source: controllers/cp.controller.js:907-919

### On `GET /send-registration-link/:slug`
- **WhatsApp to buyer** (same `cp_link_share_latest` template). // Source: controllers/cp.controller.js:1570-1576
- **Email** (NRI + email present) — same `nri-cp-referral` template. // Source: controllers/cp.controller.js:1579-1591

### Notifications the CP does NOT receive on customer capture
- No WhatsApp / email confirmation back to the CP at create time. // Source: NOT FOUND — verify manually (no `sendWhatsAppMessage` call addressed to CP phone in `cpUserRegister` between lines 749-931)

### LSQ behavior on CP customer capture
The `cpUserRegister` controller **does not** call any `lsqLeadService.captureLead` or `createActivity`. LSQ writes happen only on the CP's own registration (`registerCP`) or on JBP/feedback paths — not when the CP captures a buyer lead. The actual LSQ lead for the buyer is created later when the buyer completes payment via the buyer-side `submitEoi` flow (handled outside this module).
// Source: controllers/cp.controller.js:749-931 (no LSQ calls); routes/user/registration.routes.js:14 (buyer's submitEoi handles LSQ)

### LSQ integration — XR backend side (CP→LSQ sync flags)
- **No sync flags are set on RegistrationDraft for LSQ.** The draft is internal XR state only. // Source: controllers/cp.controller.js:881-892
- The CP user's own `prospectId` (used in CP-side LSQ activities like JBP) is populated only via `registerCP`, not via `cpUserRegister`. // Source: controllers/cp.controller.js:352 (registerCP sets user.prospectId), no equivalent in cpUserRegister.

---

## 6. API Endpoints

### POST /api/v1/cp/cp-user-register
- Auth: `protect` + `restrictTo('cp')`. // Source: routes/cp.routes.js:36-37
- Validation: `RegistrationValidations.cpUserRegistrationSchema` with options `{ abortEarly: false, stripUnknown: false }`. // Source: routes/cp.routes.js:60
- Middleware: `addUserTypeMiddleware('cp')` injects `req.body.userType = 'cp'`. // Source: routes/cp.routes.js:14-17, 61
- Handler: `CpController.cpUserRegister`. // Source: controllers/cp.controller.js:749

**Request body (destructured)**
// Source: controllers/cp.controller.js:749-775
```
address, carpetArea, companyName, email, firstName, lastName,
occupation, officePincode, nationality, countryCode, phone,
pincode, sourceType, selectedApartments, apartments, xrCode,
hvCode, nri, industry, budget, minimumFloor, maximumFloor,
homeLoanIntent, purchasePurpose
```

**Success response** — 200 OK
```
{
  "message": "User registered successfully",
  "data": { "registrationNumber": "<encryptedSlug>" }
}
```
// Source: controllers/cp.controller.js:928-930

**Error responses**
- 409 — "Lead for this User is already Captured." // Source: controllers/cp.controller.js:806
- 409 — "User has already completed registration." // Source: controllers/cp.controller.js:817
- 409 — "Provided phone number is already registered." // Source: controllers/cp.controller.js:835
- 500 — "Failed to register User. Please try again." // Source: controllers/cp.controller.js:903

### GET /api/v1/cp/cp-user-registrations
- Returns paginated buyer registrations attributable to the CP. Supports `page`, `limit`, `search`, `status` (comma list: booked|refund|paid), `leadOwner` (self | all | cp:<id>). Master CPs see members' rows. Uses raw SQL `sequelize.query`. // Source: controllers/cp.controller.js:933-1159

### GET /api/v1/cp/cp-user-leads
- Validation: `cpUserLeadsSchema` (page, limit ≤100, search, status ∈ Sent|Registered|Refunded, sortBy ∈ created_at|updated_at|status|slug, sortOrder, leadOwner). // Source: validations/cp.validations.js:193-208; routes/cp.routes.js:66
- Returns drafts with mapped status labels. // Source: controllers/cp.controller.js:1161-1372

### GET /api/v1/cp/send-registration-link/:slug
- Resends WhatsApp (and NRI email) for an existing draft. Side-effect: status `Refunded`→`Open`. Returns 201. // Source: controllers/cp.controller.js:1540-1607

### GET /api/v1/cp/cp-user-kpi
- Validation: `cpUserKpisSchema` (only leadOwner). Returns `{ Sent, Registered, unitRegisteredCount, allotedCount, refundedCount, isMasterCp, memberCps }`. // Source: validations/cp.validations.js:210-219; controllers/cp.controller.js:1374-1538

---

## 7. Known Bugs / Gaps

### KB-CPR-01 — Email uniqueness disabled
The email-existence guard for both existing-user-update and new-user-create paths is commented out. Two buyer accounts can share an email as long as phones differ. // Source: controllers/cp.controller.js:824-836

### KB-CPR-02 — Phone validation regex disabled in CP-user-register
`cpUserRegistrationSchema.phone.matches(phoneRegex)` is commented out — only `required` is enforced. Free-form phone strings (e.g., with dashes) are accepted at the API and stored to DB. // Source: validations/registration.validations.js:185

### KB-CPR-03 — Many validators commented out
`countryCode.required`, `address.required`, `pincode.length/required`, `companyName.required`, `officePincode.length/required`, `occupation.oneOf(validOccupations)` — all commented out. Drafts can be created with empty strings for fields the UI may treat as required. // Source: validations/registration.validations.js:189-224

### KB-CPR-04 — `effectiveCountryCode` not stored to User row
`effectiveCountryCode` is computed but the User row is created with raw `countryCode` from body (which may be empty/invalid). For non-NRI buyers, future WhatsApp sends from other modules may fail if they rely on `user.countryCode`. // Source: controllers/cp.controller.js:777, 843

### KB-CPR-05 — Hard-coded production project ID
`projectId = app.production ? 1 : 2` is hard-coded into both create and listing endpoints. Adding a second active project requires code change. // Source: controllers/cp.controller.js:48, 782, 942, 1547

### KB-CPR-06 — No master-CP "create on behalf of" path
A master CP cannot capture a lead under a specific member CP's `cpId`. The create endpoint always sets `cpId = req.user.id`. Discrepancy with `cp-user-leads` which DOES support `leadOwner=cp:<id>` for visibility. // Source: controllers/cp.controller.js:884; controllers/cp.controller.js:1204-1213

### KB-CPR-07 — Refunded → Open side-effect on resend is undocumented
`GET /send-registration-link/:slug` silently mutates draft.status from `Refunded` to `Open` without any flag in the response. A GET endpoint performing state mutation breaks REST semantics and may cause cache surprises. // Source: controllers/cp.controller.js:1593-1596

### KB-CPR-08 — Existing-user update is partial
When an `existingUser` is matched, the controller does NOT update firstName/lastName/email/countryCode/isNri on that user — it only creates a new RegistrationDraft. If the CP supplies updated buyer details, those will not propagate to the User row. // Source: controllers/cp.controller.js:794-822 (no `user.update` call in existing-user branch)

### KB-CPR-09 — `idDraft: true` flag has no observed consumer
`draft.idDraft` is set true but no reader uses it in the verified CP/registration paths. Likely dead field. // Source: controllers/cp.controller.js:878

### KB-CPR-10 — `xrCode` vs `hvCode` ambiguity
Body destructures both `xrCode` and `hvCode`. `slug` uses `hvCode`; `draft` stores only `xrCode`. Easy mismatch source if UI sends only one. // Source: controllers/cp.controller.js:766-767, 853, 868

### KB-CPR-11 — No CP-side confirmation notification
After successful capture, only the buyer is notified. The CP receives no WhatsApp / email confirmation. UI must rely on the JSON response alone. // Source: controllers/cp.controller.js:749-931

### KB-CPR-12 — Pincode-derived fields (suburb, city, etc.) not fetched in cpUserRegister
Unlike `registerCP` (which calls `mavisService.fetchPincodeDetails`), `cpUserRegister` does not enrich the buyer's pincode. The `pincode` and `officePincode` are stored to the draft JSON as raw strings only. // Source: controllers/cp.controller.js:781-892 (no `mavisService` call in cpUserRegister)

---

## 8. QA Risk Areas

### QA-Risk-01 — Duplicate detection collision on shared devices
A buyer with an existing draft from CP-A is blocked from CP-B re-capture only if the (userId, cpId, projectId) tuple collides. CP-B's lead capture for the same buyer creates a fresh draft. Verify that two CPs do not get attributed for the same buyer payment downstream.

### QA-Risk-02 — Slug collision / encryption determinism
`encrypt("<userId>/<hvCode>")` — verify whether `encrypt` produces deterministic output (same input → same ciphertext). If deterministic, re-capture with same CP would produce the same slug, but `RegistrationDraft.slug` likely has a uniqueness constraint at DB level (verify migration). // Source: controllers/cp.controller.js:853-854

### QA-Risk-03 — WhatsApp template `cp_link_share_latest` accepts two args
Some CP code calls this template with only `[name, link]`; the commented-out args (`req.user.firstName`, `hvCode`) suggest historical four-arg version. Verify the live Kaleyra template definition matches 2 params. // Source: controllers/cp.controller.js:921-926, 1570-1576

### QA-Risk-04 — NRI buyer without email gets no link
For NRI buyer with email omitted, no email is sent. WhatsApp is sent but to `effectiveCountryCode + phone` where `countryCode` could be the wrong code if the CP UI forgot to supply it. // Source: controllers/cp.controller.js:777, 907-919, 921

### QA-Risk-05 — Validation bypasses via stripUnknown=false
`validateRequest({ body: cpUserRegistrationSchema }, { abortEarly: false, stripUnknown: false })` keeps unknown fields. Verify the destructured fields list in controller covers all UI-supplied fields; any new field added to UI without controller update is silently dropped. // Source: routes/cp.routes.js:60

### QA-Risk-06 — Race on simultaneous CP-A + CP-B capture for same buyer
Both CPs read no draft (per their cpId), both proceed. Two drafts get created in different transactions. Test concurrency.

### QA-Risk-07 — Buyer email collision across role boundaries
Existing-user lookup is `phone + roleId=user`. A buyer who is also registered as a CP (rare but possible) would not be found and a new buyer row may be created. Confirm whether any uniqueness exists at DB level on phone alone vs. (phone, role_id).

### QA-Risk-08 — Pincode-less drafts pass schema
With validator's required-flags commented out, an empty `pincode` or `officePincode` survives. UI tests should verify required-field enforcement is reintroduced or done client-side.

### QA-Risk-09 — Listing search performance
`/cp-user-registrations` uses raw SQL with broad `LIKE %term%` across multiple columns and joins to `payment_transactions` (twice) + `users` + `registration_units`. Test response time with realistic data volume. // Source: controllers/cp.controller.js:1027-1085

### QA-Risk-10 — Mapped-status confusion
Listing maps `Open` and `Lost` both → `Sent`. The `cp-user-leads.status` filter accepts `Sent | Registered | Refunded`. A draft that is internally `Lost` cannot be distinguished from `Open` in the UI. Verify if business expects to differentiate. // Source: controllers/cp.controller.js:1256-1262, 1322-1328

### QA-Risk-11 — Resend link does not refresh slug
`GET /send-registration-link/:slug` reuses the existing slug. If the encryption key rotates or slug is compromised, no rotation path exists at this endpoint. // Source: controllers/cp.controller.js:1540-1607

### QA-Risk-12 — Auth strip: missing `restrictTo('cp')` on the registration form-data route
The `/registration` (CP self-registration) route is declared BEFORE `router.use(protect)` and BEFORE `router.use(restrictTo('cp'))`. The `/cp-user-register` route is declared AFTER — so it IS guarded. But verify the ordering hasn't drifted: lines 19-33 (unguarded CP self-register), lines 36-37 (apply protect+restrictTo), lines 58-63 (cp-user-register guarded). // Source: routes/cp.routes.js:19-63
