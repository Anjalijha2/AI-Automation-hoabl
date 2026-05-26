# Test Cases — Customer Registration
**Portal:** Channel Partner Portal
**BRD Reference:** CP-BRD-CP-Portal.md / CP-FS-Customer-Registration.md

---

## Dashboard — Registered Customers Table

### CP_REG_001 — Dashboard loads at `/dashboard` after login

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | CP successfully logged in |
| **Test Steps** | 1. Complete login flow<br>2. Wait for landing page |
| **Expected Result** | URL is `/dashboard`; customer table is rendered |
| **Priority** | Critical |

---

### CP_REG_002 — Verify dashboard table columns

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Dashboard open |
| **Test Steps** | 1. Read column headers left-to-right |
| **Expected Result** | Columns: Customer Name, Registration Number, Unit Allocated, Allocation Status, KYC Completion, Payment Status |
| **Priority** | Critical |

---

### CP_REG_003 — Verify Registration Number formatted as GHNG-XXXXXXXXXX

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | At least one customer in the table |
| **Test Steps** | 1. Read the Registration Number for a row |
| **Expected Result** | Number matches `GHNG-` followed by exactly 10 digits |
| **Priority** | High |

---

### CP_REG_004 — Verify Allocation Status values

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Dashboard rows exist |
| **Test Steps** | 1. Read Allocation Status values across rows |
| **Expected Result** | Status is one of: WAITLIST, PREALLOCATED, ALLOCATED, WINNER, HOLD, REFUND |
| **Priority** | High |

---

### CP_REG_005 — CP isolation — sees only their own customers

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Two CPs with different registered customers |
| **Test Steps** | 1. Login as CP A, note customer list<br>2. Logout, login as CP B<br>3. Verify rows visible |
| **Expected Result** | Each CP sees only rows where `brokerId` matches their user ID |
| **Priority** | Critical |

---

### CP_REG_006 — Empty state for new CP with zero registrations

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | CP has not registered any customer yet |
| **Test Steps** | 1. Open Dashboard |
| **Expected Result** | Friendly empty-state message shown along with a Register Customer call-to-action |
| **Priority** | Medium |

---

### CP_REG_007 — Verify Unit Allocated cell is blank when not allocated

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Customer exists with no allocation |
| **Test Steps** | 1. Locate the customer's row<br>2. Read Unit Allocated cell |
| **Expected Result** | Cell is blank or shows a dash; no unit number displayed |
| **Priority** | Medium |

---

### CP_REG_008 — Dashboard table updates after new registration

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | CP is on Dashboard |
| **Test Steps** | 1. Submit a new customer registration<br>2. Return to Dashboard |
| **Expected Result** | New customer row appears immediately at top (or per default sort) with status Open and KYC Pending |
| **Priority** | High |

---

## Registration Form — Fields and Defaults

### CP_REG_009 — Open Register Customer form

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | CP on Dashboard |
| **Test Steps** | 1. Click **Register Customer** button |
| **Expected Result** | Registration form opens with all field labels and an empty/default state |
| **Priority** | Critical |

---

### CP_REG_010 — Verify all required fields are present

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Registration form open |
| **Test Steps** | 1. Scan the form top to bottom |
| **Expected Result** | First Name, Last Name, Mobile, Email, Purchase Purpose, Home Loan Intent, Budget, Floor Range, Walk-in Source, and T&C checkbox are all visible |
| **Priority** | Critical |

---

### CP_REG_011 — Required field markers are displayed

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Registration form open |
| **Test Steps** | 1. Inspect labels for First Name, Last Name, Mobile, Email, Purchase Purpose, Home Loan Intent, Budget, T&C |
| **Expected Result** | Required-field indicator (asterisk or "required" hint) is present on each mandatory field |
| **Priority** | Medium |

---

### CP_REG_012 — Purchase Purpose dropdown shows expected options

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form open |
| **Test Steps** | 1. Click Purchase Purpose dropdown<br>2. Read all options |
| **Expected Result** | Options include at least "Investment" and "Own use"; no default pre-selection |
| **Priority** | High |

---

### CP_REG_013 — Home Loan Intent shows Yes/No options

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form open |
| **Test Steps** | 1. Open Home Loan Intent control |
| **Expected Result** | Two options: Yes and No |
| **Priority** | Medium |

---

### CP_REG_014 — Country code selector available on Mobile field for NRI

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form open |
| **Test Steps** | 1. Click country code selector on Mobile field<br>2. Verify multiple codes appear |
| **Expected Result** | Country code dropdown is available with India default and international codes; NRI flow supported |
| **Priority** | Medium |

---

## Form Validation

### CP_REG_015 — Submit empty form shows validation errors

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form open, all fields blank |
| **Test Steps** | 1. Click Submit without filling any field |
| **Expected Result** | All required fields show inline errors; form does not submit |
| **Priority** | Critical |

---

### CP_REG_016 — Invalid email format is rejected

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form open |
| **Test Steps** | 1. Enter `notanemail` in Email field<br>2. Blur the field |
| **Expected Result** | Inline error "Enter a valid email address" appears |
| **Priority** | High |

---

### CP_REG_017 — Mobile less than 10 digits rejected

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form open; India country code selected |
| **Test Steps** | 1. Enter `99999` in Mobile field<br>2. Blur field |
| **Expected Result** | Inline error "Enter a valid 10-digit mobile number" appears |
| **Priority** | High |

---

### CP_REG_018 — Mobile with letters rejected

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form open |
| **Test Steps** | 1. Type `abcd123456` in Mobile field |
| **Expected Result** | Field rejects letters; only digits accepted |
| **Priority** | Medium |

---

### CP_REG_019 — Budget accepts numeric values only

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form open |
| **Test Steps** | 1. Try to enter alphabetic chars in Budget<br>2. Try numeric value `5000000` |
| **Expected Result** | Letters are blocked; numeric values are accepted |
| **Priority** | Medium |

---

### CP_REG_020 — T&C checkbox must be ticked to enable Submit

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form filled with all required fields except T&C |
| **Test Steps** | 1. Leave T&C unchecked<br>2. Attempt to submit |
| **Expected Result** | Submit is disabled OR submission rejected with error "Please accept the Terms and Conditions" |
| **Priority** | Critical |

---

### CP_REG_021 — Purchase Purpose missing rejects submission

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | All fields filled except Purchase Purpose |
| **Test Steps** | 1. Leave Purchase Purpose unselected<br>2. Click Submit |
| **Expected Result** | Inline error on Purchase Purpose; submission rejected |
| **Priority** | High |

---

### CP_REG_022 — Floor Range max less than min is rejected

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form open |
| **Test Steps** | 1. Enter Floor Min = 10, Floor Max = 5<br>2. Blur fields |
| **Expected Result** | Validation error indicating max must be ≥ min |
| **Priority** | Low |

---

## Submission and Duplicates

### CP_REG_023 — Successful registration submits with all fields valid

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | All required fields valid; T&C checked |
| **Test Steps** | 1. Click Submit<br>2. Wait for response |
| **Expected Result** | Success toast displayed; form closes; new GHNG-XXXXXXXXXX number issued and shown |
| **Priority** | Critical |

---

### CP_REG_024 — Duplicate mobile within same project is rejected

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Customer with mobile `9999900001` already registered for current project |
| **Test Steps** | 1. Fill form with the same mobile, different email<br>2. Submit |
| **Expected Result** | Submission rejected with duplicate error referencing mobile already exists |
| **Priority** | Critical |

---

### CP_REG_025 — Duplicate email within same project is rejected

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Customer with email `dup@test.com` exists in this project |
| **Test Steps** | 1. Fill form with the same email, different mobile<br>2. Submit |
| **Expected Result** | Submission rejected with duplicate email error |
| **Priority** | Critical |

---

### CP_REG_026 — Additional unit for same customer issues suffix -A

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Customer already has registration GHNG-1234567890; system supports additional units |
| **Test Steps** | 1. Initiate additional-unit registration for the same customer<br>2. Submit |
| **Expected Result** | New registration is issued as GHNG-1234567890-A; next would be -B, -C |
| **Priority** | Medium |

---

### CP_REG_027 — Customer receives Botspice WhatsApp on capture (NOT Kaleyra)

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Botspice WhatsApp integration active |
| **Test Steps** | 1. Submit a valid `POST /api/v1/cp/cp-user-register`<br>2. Observe customer's WhatsApp |
| **Expected Result** | Buyer receives WhatsApp template `cp_link_share_latest` (Botspice NOT Kaleyra), params `["<firstName> <lastName>", "${app.registrationUrl}/ref/${encryptedSlug}"]`. NRI Buyer with email also gets `nri-cp-referral` email. NO confirmation back to CP. |
| **Priority** | High |

---

### CP_REG_028 — Submitted registration appears on Dashboard with status Open

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Registration just submitted |
| **Test Steps** | 1. Return to Dashboard |
| **Expected Result** | New row visible; Allocation Status implies pre-allocation state; Payment Status = Pending |
| **Priority** | High |

---

### CP_REG_029 — Cancel button discards entered data

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Form partially filled |
| **Test Steps** | 1. Click Cancel / close icon<br>2. Confirm discard if prompted |
| **Expected Result** | Form closes; no record is created; data is not retained when reopening the form |
| **Priority** | Medium |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/cp-portal/fsd-customer-registration.md`

### MAJOR CORRECTIONS — CP "Customer Registration" is lead-capture, NOT a full registration
- **Endpoint**: `POST /api/v1/cp/cp-user-register` (auth: protect + restrictTo('cp'), addUserTypeMiddleware('cp')). Creates a `registration_drafts` row + auto-creates buyer `users` row. The actual buyer registration + payment happens later when Buyer follows the shared link (`${registrationUrl}/ref/${encryptedSlug}`).
- **No registrationNumber issued at capture** (CP_REG_003, CP_REG_023) — the `data.registrationNumber` returned is the encrypted slug, NOT a `GHNG-NNNNNNNNNN` number. The GHNG-format registration number is generated later when Buyer pays EOI. Dashboard's `registration_number` column comes from `registrations` table, populated post-payment.
- **No allocation status at capture time** (CP_REG_004) — `RegistrationDraft.status` ENUM is `Open|Won|Lost|Refunded`, NOT WAITLIST/PREALLOCATED/ALLOCATED. Allocation status applies to `RegistrationUnit.status` once Buyer completes booking. UI labels: Open|Lost→"Sent", Won→"Registered", Refunded→"Refunded".
- **CP isolation** (CP_REG_005) — Master CP (`isLeadCp=true`) sees ALL leads/registrations from member CPs (matched by `masterHvCode`). Standalone/member CP sees only own (BR-CP-LEAD-10).
- **CP_REG_010-022 (Form fields/validation)** — Many backend Yup validators are commented out: `phone regex`, `countryCode required`, `address required`, `pincode required`, `companyName required`, `officePincode required`, `occupation oneOf` (KB-CPR-02, KB-CPR-03, validations/registration.validations.js:185-224). UI may enforce client-side, but API accepts free-form. T&C field is NOT in API schema — UI-only.
- **CP_REG_016 — Email uniqueness DISABLED** — Email-existence check commented out (KB-CPR-01). Two buyer rows can share same email if phones differ.
- **CP_REG_024-025 (Duplicate prevention)** — Actual behavior: `409 "Lead for this User is already Captured."` only when SAME CP captures same Buyer on same project (BR-CPR-03). Different CPs CAN capture same Buyer (GAP-LEAD-04). `409 "User has already completed registration."` only if Buyer has `paymentStatus='success'` registration (BR-CPR-04). `409 "Provided phone number is already registered."` when User.create races for new buyer (BR-CPR-05). NOT keyed by email.
- **CP_REG_026 (Additional unit -A suffix)** — Suffix convention not verified in CP capture endpoint. Additional units are tracked via `RegistrationUnit.isAdditionalUnit`. Verify if `-A` suffix is generated server-side or UI display.
- **CP_REG_027** — Reframed for Botspice.

### New TCs added below

### CP_REG_030 — POST /cp/registration is UNAUTHENTICATED (Security gap)

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | None |
| **Test Steps** | 1. Without any JWT, call `POST /api/v1/cp/registration` (CP self-KYC) with valid body |
| **Expected Result** | CRITICAL SECURITY GAP: route is mounted BEFORE `router.use(protect)` (routes/cp.routes.js:19-37). Endpoint is public. A bad actor knowing a CP phone with `isCpRegistrationCompleted=false` can re-submit KYC and overwrite legitimate data (QA-Risk-9, fsd-login.md §8.9). Document. |
| **Priority** | Critical (Security) |

---

### CP_REG_031 — Capture without restrictTo('cp') role rejected

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Valid Buyer JWT (roleId=2) |
| **Test Steps** | 1. `POST /api/v1/cp/cp-user-register` with Buyer JWT |
| **Expected Result** | 403 from `restrictTo('cp')` middleware (routes/cp.routes.js:36-37). |
| **Priority** | High (Security) |

---

### CP_REG_032 — Existing buyer row reused — fields NOT updated (BUG)

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Buyer B exists with `firstName='Old'`; no draft from CP A |
| **Test Steps** | 1. CP A captures Buyer B with `firstName='New'`<br>2. Query `users.first_name` |
| **Expected Result** | KNOWN BUG: existing-user branch does NOT update firstName/lastName/email/countryCode/isNri — only creates new draft (KB-CPR-08, cp.controller.js:794-822). `users.first_name` still 'Old'. Document. |
| **Priority** | Medium |

---

### CP_REG_033 — projectId hardcoded by NODE_ENV

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Any env |
| **Test Steps** | 1. Capture lead<br>2. Query `registration_drafts.project_id` |
| **Expected Result** | Always 1 (prod) or 2 (non-prod) (KB-CPR-05, cp.controller.js:782). Multi-project rollout requires code change. |
| **Priority** | Medium |

---

### CP_REG_034 — Master CP CANNOT create lead on behalf of member (BUG)

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Master CP M; member CP X |
| **Test Steps** | 1. M attempts to capture lead with cpId=X<br>2. Inspect created draft |
| **Expected Result** | KNOWN GAP: endpoint always sets `cpId = req.user.id` — no override. Master cannot create on behalf of member (KB-CPR-06). Inconsistent with `cp-user-leads?leadOwner=cp:<id>` which DOES allow scoping for visibility. |
| **Priority** | Medium |

---

### CP_REG_035 — effectiveCountryCode for NRI WhatsApp dispatch

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Capture NRI buyer (`nri:true, countryCode:'+971'`) |
| **Test Steps** | 1. Submit capture<br>2. Inspect WhatsApp dispatch + DB |
| **Expected Result** | WhatsApp goes to `+971<phone>` (effectiveCountryCode). BUT `users.countryCode` may be stored as raw body value (could be empty) — `effectiveCountryCode` NOT persisted to User row (KB-CPR-04, cp.controller.js:777, 843). |
| **Priority** | Medium |

---

### CP_REG_036 — Slug encryption determinism

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Same userId + hvCode |
| **Test Steps** | 1. Inspect `encrypt(<userId>/<hvCode>)` for two captures with same inputs |
| **Expected Result** | Verify whether `encrypt` is deterministic. `RegistrationDraft.slug` likely has UNIQUE constraint — collision-prone if deterministic (QA-Risk-2, cp.controller.js:853-854). |
| **Priority** | Medium |

---

### CP_REG_037 — Concurrent capture from two CPs for same new phone

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | Buyer phone P not yet in users |
| **Test Steps** | 1. CP A and CP B simultaneously POST cp-user-register for P |
| **Expected Result** | Race condition possible — both pass `User.findOne` then `User.create`. No unique constraint on `users.phone`; may insert two duplicate buyer rows (QA-Risk-6, GAP-LOG-02). Document. |
| **Priority** | Medium |

---

### CP_REG_038 — `idDraft: true` flag is dead code

| Field | Value |
|-------|-------|
| **Module** | CP – Customer Registration |
| **Pre-conditions** | After successful capture |
| **Test Steps** | 1. Query `registration_drafts.draft` JSON |
| **Expected Result** | `draft.idDraft = true` present but no reader uses it (KB-CPR-09, cp.controller.js:878). Document as dead field. |
| **Priority** | Low |
