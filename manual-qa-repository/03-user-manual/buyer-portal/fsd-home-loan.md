# FSD — Buyer Portal: Home Loan
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Home Loan module collects a buyer's loan application across two ordered steps and either (a) routes the application through Easiloan (third-party aggregator) for bank-options eligibility + selection, or (b) accepts a "self-funded" opt-out with an uploaded sanction letter. Document storage is delegated to LeadSquared (LSQ) custom-object fields (LSQ is configured as in-scope here only for KYC document storage; CRM logic is out of scope per project constraints — verify with Product). CIBIL pre-fetch + minimum-floor of 600 are performed via the `xanaduService.getCibilScore` API. Admin can independently approve / reject the loan irrespective of buyer flow.

- Buyer routes mounted at `/api/user/home-loan` (`protect` + `restrictTo('user')`) `// Source: source-code/backend/src/routes/user.routes.js:49-51, 87`
- Controller: `source-code/backend/src/controllers/homeloan.controller.js`
- Model: `source-code/backend/src/models/registration-home-loan.model.js`

The module persists buyer step-state in `registration_home_loans` (1:1 with `registrations`) and uses LSQ as the document blob store + CRM bridge.

---

## 2. Data Model

### 2.1 `registration_home_loans`
Single row per `registrationId`. `// Source: source-code/backend/src/models/registration-home-loan.model.js:10-138`

| Field | Type | Notes |
|-------|------|-------|
| `id` | BIGINT.UNSIGNED PK | `// Source: source-code/backend/src/models/registration-home-loan.model.js:22-26` |
| `registration_id` | BIGINT.UNSIGNED NOT NULL | FK to `registrations` `// Source: source-code/backend/src/models/registration-home-loan.model.js:27-32` |
| `step` | TINYINT.UNSIGNED nullable | Tracks `1` or `2` `// Source: source-code/backend/src/models/registration-home-loan.model.js:33-38` |
| `status` | ENUM `in_progress` \| `completed` | default `'in_progress'` `// Source: source-code/backend/src/models/registration-home-loan.model.js:39-43` |
| `loan_type` | ENUM `self` \| `easiloan` nullable | `// Source: source-code/backend/src/models/registration-home-loan.model.js:44-47` |
| `employment_type` | ENUM `salaried` \| `self_employed` nullable | `// Source: source-code/backend/src/models/registration-home-loan.model.js:48-51` |
| `monthly_income` | DECIMAL(12,2) | Salaried only `// Source: source-code/backend/src/models/registration-home-loan.model.js:52-55` |
| `annual_profit` | DECIMAL(12,2) | Self-employed only `// Source: source-code/backend/src/models/registration-home-loan.model.js:56-59` |
| `annual_turnover` | DECIMAL(12,2) | Self-employed only `// Source: source-code/backend/src/models/registration-home-loan.model.js:60-63` |
| `monthly_outgoing_emi` | DECIMAL(12,2) | `// Source: source-code/backend/src/models/registration-home-loan.model.js:64-67` |
| `selected_bank` | JSON | Easiloan bank-selection payload `// Source: source-code/backend/src/models/registration-home-loan.model.js:68-72` |
| `loan_approval_status` | ENUM `pending` \| `approved` \| `admin_rejected` \| `admin_approved` | default `'pending'` `// Source: source-code/backend/src/models/registration-home-loan.model.js:73-79` |
| `approval_source` | ENUM `user` \| `admin` nullable | `// Source: source-code/backend/src/models/registration-home-loan.model.js:80-86` |
| `approved_by` | BIGINT.UNSIGNED nullable | Admin user id on admin approval/rejection `// Source: source-code/backend/src/models/registration-home-loan.model.js:87-93` |
| `approved_at` | DATE nullable | `// Source: source-code/backend/src/models/registration-home-loan.model.js:94-100` |
| `registration_number` | STRING(50) nullable | Computed: `<regNumber>-SL` (self) or `-EL` (easiloan) `// Source: source-code/backend/src/models/registration-home-loan.model.js:101-105` |
| `cibil_score` | INTEGER nullable | Persisted actual CIBIL (NOT floored) `// Source: source-code/backend/src/models/registration-home-loan.model.js:106-109` |
| `created_by` / `updated_by` | INTEGER | `// Source: source-code/backend/src/models/registration-home-loan.model.js:110-119` |
| `deleted_at` | DATE | paranoid soft-delete `// Source: source-code/backend/src/models/registration-home-loan.model.js:120-123, 131` |

`RegistrationHomeLoan.auditEnabled = true` `// Source: source-code/backend/src/models/registration-home-loan.model.js:135`
Association: `belongsTo Registration` (`as: 'Registration'`) `// Source: source-code/backend/src/models/registration-home-loan.model.js:13-17`

### 2.2 Companion: `user_scores`
Used by home-loan flow to cache CIBIL score: `UserScore.getLatestScore(userId)`, `UserScore.createScore(userId, score)` `// Source: source-code/backend/src/controllers/homeloan.controller.js:204, 221, 1104`

### 2.3 LeadSquared document slots (storage-only)
Files are uploaded into LSQ custom-object fields under `mx_KYC_Information`:
- `mx_CustomObject_1` — PAN number text `// Source: source-code/backend/src/controllers/homeloan.controller.js:405`
- `mx_CustomObject_2` — PAN document file `// Source: source-code/backend/src/controllers/homeloan.controller.js:345, 406`
- `mx_CustomObject_4` — Aadhar document file(s) `// Source: source-code/backend/src/controllers/homeloan.controller.js:353-358, 408-410`
- `mx_CustomObject_5` — Monthly outgoing EMI `// Source: source-code/backend/src/controllers/homeloan.controller.js:411`
- `mx_CustomObject_6` — Salary slips (salaried) `// Source: source-code/backend/src/controllers/homeloan.controller.js:159, 374-378`
- `mx_CustomObject_7` — Bank statements (max 10) `// Source: source-code/backend/src/controllers/homeloan.controller.js:103, 380-384`
- `mx_CustomObject_8` — ITR/Form 16 `// Source: source-code/backend/src/controllers/homeloan.controller.js:117, 386-390`
- `mx_CustomObject_9` — Balance Sheet & P&L (self-employed) `// Source: source-code/backend/src/controllers/homeloan.controller.js:181, 392-396`
- `mx_CustomObject_11` — Loan path: `'Easiloan'` or `'Self'` `// Source: source-code/backend/src/controllers/homeloan.controller.js:301, 413`
- `mx_CustomObject_12` — `bankSelected` CSV summary `// Source: source-code/backend/src/controllers/homeloan.controller.js:652`
- `mx_CustomObject_13` — Self-flow sanction letter `// Source: source-code/backend/src/controllers/homeloan.controller.js:270, 302`
- `mx_CustomObject_14` — Annual turnover `// Source: source-code/backend/src/controllers/homeloan.controller.js:417`
- `mx_CustomObject_15` — Annual profit `// Source: source-code/backend/src/controllers/homeloan.controller.js:420`
- `mx_CustomObject_17` — Effective credit score (≥600) `// Source: source-code/backend/src/controllers/homeloan.controller.js:424`
- `mx_CustomObject_18` — CIBIL fetched date `// Source: source-code/backend/src/controllers/homeloan.controller.js:425`

> NOTE: Per project constraint #1 (`LeadSquared excluded entirely`), this section is included **only** to document where file blobs physically reside. QA tests **must not** exercise LSQ end-to-end; downstream effects on the portal are the test surface.

---

## 3. State Machines

### 3.1 `status` (user-flow lifecycle)
ENUM: `in_progress` → `completed`. `// Source: source-code/backend/src/models/registration-home-loan.model.js:39-43`

| From | To | Trigger |
|------|----|---------|
| (none) | `in_progress` | Step 1 Easiloan flow successful submit `// Source: source-code/backend/src/controllers/homeloan.controller.js:453` |
| (none) | `completed` | Step 1 self-funded (opted-out) submit `// Source: source-code/backend/src/controllers/homeloan.controller.js:279` |
| `in_progress` | `completed` | Step 2 successful submit `// Source: source-code/backend/src/controllers/homeloan.controller.js:679-680` |

### 3.2 `step` progression
`1` → `2`; tracked separately from `status`. `// Source: source-code/backend/src/models/registration-home-loan.model.js:33-38`

| From | To | Trigger |
|------|----|---------|
| `null` | `1` | First Step 1 submission (either flow) `// Source: source-code/backend/src/controllers/homeloan.controller.js:278, 452` |
| `1` | `2` | Step 2 submission (Easiloan only) `// Source: source-code/backend/src/controllers/homeloan.controller.js:679` |
| n/a | `null` | If admin approves/rejects before user ever started, `step` is reset to `null` `// Source: source-code/backend/src/services/registration-unit.service.js:367-369` |

Guard: Step 1 rejected with 409 CONFLICT if already submitted (`Number(regHomeLoan.step) >= 1`) `// Source: source-code/backend/src/controllers/homeloan.controller.js:254-256`
Guard: Step 2 rejected with 400 if Step 1 incomplete `// Source: source-code/backend/src/controllers/homeloan.controller.js:549-551`
Guard: Step 2 rejected with 400 if `loanType === 'self'` `// Source: source-code/backend/src/controllers/homeloan.controller.js:552-554`

### 3.3 `loan_approval_status` (independent of user flow)
ENUM: `pending` → {`approved` | `admin_approved` | `admin_rejected`}. `// Source: source-code/backend/src/models/registration-home-loan.model.js:73-79`

| From | To | Trigger |
|------|----|---------|
| `pending` | `admin_approved` | Admin endpoint with `body.payload.enable = true` `// Source: source-code/backend/src/services/registration-unit.service.js:349-365` |
| `pending` | `admin_rejected` | Admin endpoint with `body.payload.enable = false` `// Source: source-code/backend/src/services/registration-unit.service.js:349-365` |
| Any | `admin_approved`/`admin_rejected` | `findOrCreate` then `.update(payload)` — overwrites regardless of prior value `// Source: source-code/backend/src/services/registration-unit.service.js:371-382` |

`approved` (lowercase) is set only by the backfill migration for historic records: `// Source: source-code/backend/src/migrations/20251231103200-add-approval-fields-to-registration-home-loans.cjs:62` — no live code transitions to `approved`. Verify with Product whether buyer-side auto-approval is intended.

### 3.4 `loan_type` enum
`self` (opted-out) or `easiloan` (full flow). Set on Step 1. `// Source: source-code/backend/src/controllers/homeloan.controller.js:277, 446`
Step 2 hardens `loanType = 'easiloan'` `// Source: source-code/backend/src/controllers/homeloan.controller.js:681`.

---

## 4. Business Rules

### 4.1 Pre-conditions
- User must be authenticated and resolved (`req.user` else 401) `// Source: source-code/backend/src/controllers/homeloan.controller.js:59-62`
- Project resolved by env: `projectId = app.production ? 1 : 2` `// Source: source-code/backend/src/controllers/homeloan.controller.js:64`
- Active `Registration` row must exist for the user+project; else 400 "Complete property registration before home loan application" `// Source: source-code/backend/src/controllers/homeloan.controller.js:237-248`

### 4.2 CIBIL handling
- First consult `UserScore.getLatestScore` `// Source: source-code/backend/src/controllers/homeloan.controller.js:204-208`
- If absent / ≤ 0: call `xanaduService.getCibilScore({ name, pancard, phone })`; persist actual via `UserScore.createScore` `// Source: source-code/backend/src/controllers/homeloan.controller.js:209-231`
- `effectiveCreditScore = actualCreditScore > 0 ? max(actual, 600) : 600` (i.e. **600 floor** for downstream LSQ/Easiloan) `// Source: source-code/backend/src/controllers/homeloan.controller.js:234`
- Persisted `cibilScore` on `registration_home_loans` is the **actual** value, not floored `// Source: source-code/backend/src/controllers/homeloan.controller.js:451`

### 4.3 Step 1 — Easiloan flow
Validation (`homeLoanStep1Schema`): `step=1`, `pan` (PAN regex), `empType` ∈ {salaried, self_employed}, `monthlyIncome` (salaried), `annualProfit` + `annualTurnover` (self-employed), `monthlyOutgoingEmi` `// Source: source-code/backend/src/validations/homeloan.validations.js:7-63`
File presence: `panDoc`, `aadharDoc[]` mandatory; NRI requires 10-digit `nriIndianPhone` `// Source: source-code/backend/src/validations/homeloan.validations.js:90-126`
Persisted fields on `registration_home_loans`: `registrationId, loanType='easiloan', employmentType, monthlyIncome|annualProfit|annualTurnover, monthlyOutgoingEmi, cibilScore=actual, step=1, status='in_progress'` `// Source: source-code/backend/src/controllers/homeloan.controller.js:443-457`
LSQ side-effect: `lsqLeadService.captureLead` with employment, KYC files, CIBIL score `// Source: source-code/backend/src/controllers/homeloan.controller.js:397-432`
Eligibility fetch (non-blocking): `easiloanService.getEligibilityOptions(...)` returned as `homeLoanOptions` `// Source: source-code/backend/src/controllers/homeloan.controller.js:482-507`

### 4.4 Step 1 — Self (opted-out) flow
- Trigger: `req.body.optedOut === true` `// Source: source-code/backend/src/controllers/homeloan.controller.js:258`
- Required file: `sanctionLetter` else 400 `// Source: source-code/backend/src/validations/homeloan.validations.js:98-103`
- Persists: `loanType='self', step=1, status='completed', registrationNumber='<regNumber>-SL'` `// Source: source-code/backend/src/controllers/homeloan.controller.js:275-289`
- LSQ side-effect: upload sanction letter, capture lead with `mx_CustomObject_11='Self'` `// Source: source-code/backend/src/controllers/homeloan.controller.js:264-320`
- Skips Step 2 entirely

### 4.5 Step 2 — Easiloan finalization
Validation: `step=2`, `bankSelected` string required `// Source: source-code/backend/src/validations/homeloan.validations.js:65-72`
- Parses `bankSelected` JSON; stores in `selected_bank` JSON column `// Source: source-code/backend/src/controllers/homeloan.controller.js:555-584`
- Optionally accepts additional docs (merged via `mergeDocs` against existing LSQ KYC) `// Source: source-code/backend/src/controllers/homeloan.controller.js:586-656`
- `mergeDocs` enforces **max 10 documents per field** `// Source: source-code/backend/src/controllers/homeloan.controller.js:23-49`
- Persists: `step=2, status='completed', loanType='easiloan', registrationNumber='<regNumber>-EL'` `// Source: source-code/backend/src/controllers/homeloan.controller.js:677-686`
- Sends WhatsApp template `'homeloan'` with `[name, regNumber, bankSummary]` `// Source: source-code/backend/src/controllers/homeloan.controller.js:721-733` (see Section 5)

### 4.6 Prefill (`GET /home-loan`)
- Returns `user, homeLoanOptions, docSummary, bankSelected` `// Source: source-code/backend/src/controllers/homeloan.controller.js:900-1144`
- `checkForOptedOut` query param short-circuits LSQ/Easiloan fetches `// Source: source-code/backend/src/controllers/homeloan.controller.js:926`
- Fetches LSQ files for PAN, Aadhar, and employment-conditional documents via `lsqLeadService.getFileDetail` `// Source: source-code/backend/src/controllers/homeloan.controller.js:942-1071`
- Re-fetches Easiloan options with same `effectivePrefillScore` floor logic `// Source: source-code/backend/src/controllers/homeloan.controller.js:1097-1131`

### 4.7 Admin approve/reject (cross-portal)
- Endpoint: invoked through `updateRegistrationUnit` dispatcher (`updateHomeLoanDetails`) `// Source: source-code/backend/src/services/registration-unit.service.js:45, 349-387`
- Body: `body.payload.enable: boolean`
- `findOrCreate` on `RegistrationHomeLoan` with defaults including `registrationNumber` `// Source: source-code/backend/src/services/registration-unit.service.js:371-378`
- Sets `loanApprovalStatus`, `approvalSource='admin'`, `approvedBy=adminUserId`, `approvedAt=now` `// Source: source-code/backend/src/services/registration-unit.service.js:360-365`
- If record was newly created: `step = null` `// Source: source-code/backend/src/services/registration-unit.service.js:367-369`
- Return message differs whether created vs updated `// Source: source-code/backend/src/services/registration-unit.service.js:384-386`

### 4.8 Downstream consumption of approval state
Across allocation / KYC / common / export / crons, eligibility predicate is:
`(status='completed' AND loan_approval_status != 'admin_rejected') OR loan_approval_status = 'admin_approved'`
Verified in: `// Source: source-code/backend/src/controllers/allocation.controller.js:219-220` · `// Source: source-code/backend/src/services/allocation.service.js:496-497, 866-867, 2071-2072` · `// Source: source-code/backend/src/services/custom-submit-kyc.service.js:195-196` · `// Source: source-code/backend/src/services/export.service.js:89-90` · `// Source: source-code/backend/src/services/common.service.js:600-601, 747-750` · `// Source: source-code/backend/src/services/physical-event-allocation.service.js:402-403, 1424-1427` · `// Source: source-code/backend/src/cron/allocation-lsq-operations.cron.js:103-104, 221-222, 286-287, 357-358`

---

## 5. Notification Dispatch

### 5.1 Buyer Step 2 (Easiloan) → WhatsApp
A WhatsApp message is dispatched on Step 2 success:
```js
sendWhatsAppMessage(`${cc}${user.phone}`, 'homeloan', [
  `${user.firstName || ''} ${user.lastName || ''}`,
  regHomeLoan.registrationNumber || '',
  bankSummary || '',
]);
```
`// Source: source-code/backend/src/controllers/homeloan.controller.js:721-730`
- Template name: `'homeloan'`
- Wrapped in try/catch — failures logged as warn, do not roll back transaction `// Source: source-code/backend/src/controllers/homeloan.controller.js:722-733`
- Country code defaults to `'+91'` if user has no `countryCode` `// Source: source-code/backend/src/controllers/homeloan.controller.js:724`

### 5.2 Email
Commented out and not dispatched:
- `homeloan-submitted` EJS template exists at `source-code/backend/src/templates/emails/homeloan-submitted.ejs`
- Send block is commented out `// Source: source-code/backend/src/controllers/homeloan.controller.js:735-787`
- `emailService` import is also commented out `// Source: source-code/backend/src/controllers/homeloan.controller.js:7`

### 5.3 Buyer Step 1 (Easiloan or Self)
**No notification of any kind.** Verified: no `sendWhatsAppMessage`, `sendSms`, `sendEjsEmail`, `paymentNotificationService.sendNotification`, or push-notification call exists in the Step 1 control paths. `// Source: source-code/backend/src/controllers/homeloan.controller.js:249-541`

### 5.4 Admin approve / reject (`updateHomeLoanDetails`)
**ZERO notification calls.** Verified: no WhatsApp, SMS, email, push, or in-app notification is sent on admin approval or rejection.
`// Source: source-code/backend/src/services/registration-unit.service.js:349-387` — function body contains only DB lookup, `findOrCreate`, and `update`. No imports for `sendWhatsAppMessage`, `emailService`, `kaleyraService`, `whatsappService`, or `paymentNotificationService` are present in this control path. The buyer is **not informed** when an admin approves or rejects their home loan.

### 5.5 Cross-flow notifications
- No LSQ-triggered notification is initiated from this module; `lsqLeadService.captureLead` updates the CRM record but does not directly notify the buyer.
- `paymentNotificationService` (`source-code/backend/src/services/payment/payment-notification.service.js`) is not invoked from any home-loan path.

### 5.6 Summary Matrix
| Event | WhatsApp | SMS | Email | Push | In-app |
|-------|----------|-----|-------|------|--------|
| Step 1 Easiloan submit | No | No | No | No | No |
| Step 1 Self submit | No | No | No | No | No |
| Step 2 Easiloan submit | **YES** (`homeloan` template) | No | No (code commented) | No | No |
| Admin approve | No | No | No | No | No |
| Admin reject | No | No | No | No | No |

---

## 6. API Endpoints

| Method | Path | Handler | Auth | Notes |
|--------|------|---------|------|-------|
| GET | `/api/user/home-loan` | `getHomeLoanPrefill` | `protect` + `restrictTo('user')` | Returns `{ user, homeLoanOptions, docSummary, bankSelected }` `// Source: source-code/backend/src/routes/user/homeloan.routes.js:10` · `// Source: source-code/backend/src/controllers/homeloan.controller.js:900` |
| POST | `/api/user/home-loan/submit` | `submitHomeLoan` | `protect` + `restrictTo('user')` | multipart/form-data; step-driven `// Source: source-code/backend/src/routes/user/homeloan.routes.js:12-31` · `// Source: source-code/backend/src/controllers/homeloan.controller.js:51` |

### 6.1 `POST /home-loan/submit` — Step 1 body
- `step: 1` (number)
- `optedOut?: boolean`
- Self path: `sanctionLetter` (single file) required
- Easiloan path: `pan` (string, regex), `empType` ('salaried'|'self_employed'), `monthlyIncome` (salaried), `annualProfit`+`annualTurnover` (self-employed), `monthlyOutgoingEmi`, `panDoc`, `aadharDoc[]`, plus emp-type-conditional files: `salarySlips[]` or `balanceSheetAndProfitLoss[]`, optional `bankStatements[]`, `itrOrForm16[]`
- NRI: `nriIndianPhone` (10 digits) required `// Source: source-code/backend/src/validations/homeloan.validations.js:7-126`

### 6.2 `POST /home-loan/submit` — Step 2 body
- `step: 2`
- `bankSelected: string` (stringified JSON of Easiloan bank-option object, with at minimum `bank`/`slug`, `interest_rate(_text)`, `monthly_emi(_text)`, `loan_amount`, `loan_tenure`, `guid`) `// Source: source-code/backend/src/controllers/homeloan.controller.js:560-580, 707-718`
- Optional additional docs to merge: `bankStatements[]`, `salarySlips[]`, `itrOrForm16[]`, `balanceSheetAndProfitLoss[]` `// Source: source-code/backend/src/controllers/homeloan.controller.js:589-590`

### 6.3 Upload middleware
- Multer config: `homeLoanDocumentUpload` `// Source: source-code/backend/src/routes/user/homeloan.routes.js:4, 15-20`
- Per-field size enforcement: `enforceHomeLoanFileRules` (post-multer) `// Source: source-code/backend/src/routes/user/homeloan.routes.js:22-27`

### 6.4 Response shape (Step 1 Easiloan success)
HTTP 201. Body:
```
{
  user: { homeLoanEmpType, homeLoanOptedOut: false, homeLoanStep: 1 },
  homeLoanOptions: [...],
  docSummary: { panDoc, aadharDoc, ... }
}
```
`// Source: source-code/backend/src/controllers/homeloan.controller.js:509-540`

### 6.5 Response shape (Step 2 Easiloan success)
HTTP 200. Body:
```
{
  user: { homeLoanStep: 2, registrationNumber: '<reg>-EL' },
  homeLoanOptions: []
}
```
`// Source: source-code/backend/src/controllers/homeloan.controller.js:792-798`

### 6.6 Admin approve/reject route
- No dedicated home-loan admin route exists. The admin path flows through `updateRegistrationUnit` dispatcher → `updateHomeLoanDetails`. `// Source: source-code/backend/src/services/registration-unit.service.js:45, 349-387`
- Locate via the admin `update-registration-unit` action's `body.payload.enable` flag. `// Source: NOT FOUND — verify manually` for the public path (no direct route grep match in `routes/admin.routes.js` for `home-loan` admin endpoint).

---

## 7. Known Bugs / Gaps

1. **Admin approve/reject sends ZERO notifications**
   `updateHomeLoanDetails` flips `loan_approval_status` to `admin_approved` or `admin_rejected` but the buyer is not notified through any channel (no WhatsApp / SMS / email / push / in-app). `// Source: source-code/backend/src/services/registration-unit.service.js:349-387` — Verified by absence of any send-call. **Material UX gap.**

2. **`loan_approval_status='approved'` is unreachable from live code**
   The ENUM declares `approved` `// Source: source-code/backend/src/models/registration-home-loan.model.js:75` but no controller / service writes it; only the backfill migration sets it for historic rows `// Source: source-code/backend/src/migrations/20251231103200-add-approval-fields-to-registration-home-loans.cjs:62`. Downstream filters honour it `// Source: source-code/backend/src/migrations/20260504130000-backfill-home-loan-offers-toreg-unit-offers-for-winners.cjs:37`. Confirm with Product whether an auto-approval path should exist.

3. **Step 1 Easiloan flow is NOT idempotent at the user-data level**
   If a user retries Step 1 (e.g. after a transient LSQ failure) and step was never persisted, all docs are re-uploaded — but the merge logic that prevents duplicates only fires in Step 2. Step 1 calls `uploadFile` / `uploadMultipleFiles` directly. `// Source: source-code/backend/src/controllers/homeloan.controller.js:345-396` Risk: duplicate documents in LSQ.

4. **CIBIL fallback uses 600 floor silently**
   `effectiveCreditScore` is forced to ≥600 for Easiloan options + LSQ, regardless of actual score. The buyer is not told their real CIBIL was below threshold. `// Source: source-code/backend/src/controllers/homeloan.controller.js:234`

5. **Step 2 commits before WhatsApp send**
   `regHomeLoan.save()` succeeds first; the WhatsApp dispatch is best-effort and swallowed on error `// Source: source-code/backend/src/controllers/homeloan.controller.js:679-733`. If WhatsApp fails, no retry exists.

6. **`mergeDocs` truncates new docs silently when LSQ slot is full**
   When `remainingSlots <= 0`, new uploads are dropped without error or user-facing warning. `// Source: source-code/backend/src/controllers/homeloan.controller.js:33-48`

7. **Self-flow registrationNumber recomputes on every Step 1 retry**
   If a user toggles from Easiloan to self, the `-SL` suffix is appended fresh, but old `-EL` artifacts in LSQ are not cleaned. `// Source: source-code/backend/src/controllers/homeloan.controller.js:282-284`

8. **`findOrCreate` race in `updateHomeLoanDetails`**
   No transaction wrapper; concurrent admin clicks could create two rows then UPDATE one. `// Source: source-code/backend/src/services/registration-unit.service.js:371-382`

9. **`empType` derived from `regHomeLoan` first, then `req.body` fallback in Step 2**
   `const empTypeForStep2 = regHomeLoan.employmentType || req.body.empType;` `// Source: source-code/backend/src/controllers/homeloan.controller.js:611` — if Step 1 was self-flow then user re-submits Step 2 (which is blocked but logic exists), `empType` would resolve incorrectly. Defence-in-depth only because Step 2 self-blocker exists at line 552.

10. **Project-id heuristic via `app.production`**
    `projectId = app.production ? 1 : 2` `// Source: source-code/backend/src/controllers/homeloan.controller.js:64, 908` — single-project per environment. Cross-project home loans are impossible.

11. **No admin home-loan list/audit endpoint discoverable**
    Search confirms no `GET /admin/home-loans` or analogous route. Admin manages loans only via `updateRegistrationUnit` mutation. `// Source: NOT FOUND — verified by Grep on routes/admin.routes.js`

---

## 8. QA Risk Areas

1. **Admin approve flow has no notification — buyer silently transitions to "winner-eligible" pool**
   Per Bug #1, when an admin approves a loan, the buyer is unaware. KYC, allocation and crons immediately treat them as loan-cleared `// Source: source-code/backend/src/controllers/allocation.controller.js:219-220`. QA must verify whether the buyer dashboard surfaces the status change on next login (frontend polling? prefill?).

2. **Race: simultaneous Step 1 + admin reject**
   Buyer submits Step 1 (writes `loan_approval_status='pending'` via row-create default) while admin clicks reject. Without transaction isolation, final state is non-deterministic. Verify with two concurrent sessions.

3. **NRI 10-digit phone validation** — covers length only, not country-code mismatch `// Source: source-code/backend/src/validations/homeloan.validations.js:121-124`. Test invalid Indian phone with leading 0 / +91 prefix.

4. **File-size enforcement** — `enforceHomeLoanFileRules` is a post-multer step `// Source: source-code/backend/src/routes/user/homeloan.routes.js:22-27` (rules in `utils/upload.js`). QA must verify per-field caps and the rejected-file UX.

5. **LSQ failure mid-Step 1 leaves DB row created**
   `lsqLeadService.captureLead` failure returns 500 but is invoked *before* `RegistrationHomeLoan.create` `// Source: source-code/backend/src/controllers/homeloan.controller.js:430-466` — wait, ordering check: Step 1 Easiloan calls `captureLead` at line 430, then if success creates RegistrationHomeLoan at line 459-462. Failure at 431-433 returns early *without* creating the row, so the buyer can retry. Verify same retry behaves cleanly (no LSQ duplicates).

6. **Step 2 commits LSQ before DB**
   `step2Fields.length > 0` triggers `captureLead` `// Source: source-code/backend/src/controllers/homeloan.controller.js:658-675`, then DB save `// Source: source-code/backend/src/controllers/homeloan.controller.js:677-686`. If LSQ succeeds and DB save fails, LSQ is ahead of DB. QA: simulate DB error mid-Step 2.

7. **`bankSelected` accepts arbitrary JSON** — only minimum-shape parsing; no schema validation `// Source: source-code/backend/src/controllers/homeloan.controller.js:558-584`. Verify that malformed `bankSelected` (e.g. `null`, array, deeply-nested object) does not crash WhatsApp summary builder `// Source: source-code/backend/src/controllers/homeloan.controller.js:706-718`.

8. **`registrationNumber` regeneration risk**
   Step 2 sets `regHomeLoan.registrationNumber = '<reg>-EL'` unconditionally `// Source: source-code/backend/src/controllers/homeloan.controller.js:682-684`. If a user moved between flows (self → easiloan in admin override scenario), the suffix could collide with downstream consumers expecting `-SL`.

9. **CIBIL re-fetch frequency** — `getLatestScore` returns the latest stored row without an expiry check. A stale CIBIL (months old) is reused. `// Source: source-code/backend/src/controllers/homeloan.controller.js:204-208` — confirm with Product/Compliance.

10. **PAN validation regex location** — `panRegex` imported from `constants/regex.js`. QA must verify the actual regex matches RBI-compliant PAN format. `// Source: source-code/backend/src/validations/homeloan.validations.js:4`

11. **Admin approve without Step 1 row** — `updateHomeLoanDetails` creates the row with `step=null` `// Source: source-code/backend/src/services/registration-unit.service.js:367-369`. Downstream code that assumes `step` is non-null may NPE. Verify allocation/KYC paths against `step IS NULL`.

12. **No audit trail on `updateHomeLoanDetails`** — `RegistrationHomeLoan.auditEnabled = true` `// Source: source-code/backend/src/models/registration-home-loan.model.js:135`, but the update call doesn't pass `userId` to the audit hook explicitly. Verify audit log captures admin id correctly.

13. **`getHomeLoanPrefill` partial-failure surface** — multiple sequential awaits on `lsqLeadService.getFileDetail` `// Source: source-code/backend/src/controllers/homeloan.controller.js:962-1089`. Network latency can stall the prefill. Verify timeout + frontend skeleton state.

14. **WhatsApp template parameter order brittleness**
    `[name, regNumber, bankSummary]` — if the LSQ/Kaleyra template re-orders parameters, the message renders nonsense without server error. `// Source: source-code/backend/src/controllers/homeloan.controller.js:725-729`
