# FSD — Buyer Portal: Registration & Login
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Buyer Portal authentication module is an **OTP-only (passwordless)** flow used by retail buyers (`userType = "user"`) to register and log in to the XR Portal. The same two API endpoints — `send-otp` and `verify-otp` — handle both first-time registration AND returning-user login. The backend differentiates by checking if a `User` row with matching `phone` + `roleId = 2` (user) already exists.

- Send-OTP entry point: `sendOtpV3` controller — // Source: source-code/backend/src/controllers/auth.controller.js:118
- Verify-OTP entry point: `verifyOtp` controller — // Source: source-code/backend/src/controllers/auth.controller.js:668
- Mounted under: `/api/v1/auth` — // Source: source-code/backend/src/routes/index.js:70
- Buyer-specific routes use `addUserTypeMiddleware('user')` to force `userType = 'user'` — // Source: source-code/backend/src/routes/auth.routes.js:21-26, 34
- Frontend caller URLs: `sendOtp: /api/v1/auth/user/send-otp`, `verifyOtp: /api/v1/auth/user/verify-otp` — // Source: source-code/buyer-portal/src/utils/urls.js:16-17

Two buyer sub-flows exist:
- **Non-NRI buyer** — phone only (10-digit Indian number, +91 forced) — // Source: source-code/backend/src/controllers/auth.controller.js:336-503
- **NRI buyer** — phone + email + countryCode all required — // Source: source-code/backend/src/controllers/auth.controller.js:158-335

---

## 2. Data Model

### `users` table (relevant columns for auth)
// Source: source-code/backend/src/models/user.model.js:63-336

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | // Source: user.model.js:65-70 |
| `roleId` | BIGINT UNSIGNED, FK roles.id | Buyer = `2` // Source: constants/global.js:17 |
| `isNri` | BOOLEAN, default false | // Source: user.model.js:76-79 |
| `prospectId` | STRING(100) | LeadSquared ProspectID // Source: user.model.js:80-83 |
| `countryCode` | STRING(5) | // Source: user.model.js:104-106 |
| `phone` | STRING(15) | // Source: user.model.js:107-109 |
| `email` | STRING(100) | // Source: user.model.js:116-118 |
| `firstName`, `lastName` | STRING(100) | Returned in verify response // Source: user.model.js:98-103 |
| `otp` | STRING(6) | Plaintext OTP stored on user row // Source: user.model.js:187-190 |
| `otpExpires` | DATE | // Source: user.model.js:191-194 |
| `lastOtpSentAt` | DATE | // Source: user.model.js:200-203 |
| `nurixSessionId` | JSON | Chatbot session linkage // Source: user.model.js:195-199 |
| `isActive` | BOOLEAN, default true | // Source: user.model.js:305-308 |
| `brokerXrCode` | STRING(100) | HV referral code // Source: user.model.js:267-270 |

`toJSON()` strips `password`, `otp`, `otpExpires`, `createdAt`, `updatedAt` from API responses — // Source: user.model.js:40-44

### `registrations` table (created at send-otp)
// Source: source-code/backend/src/models/registration.model.js:67-213

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED PK | // Source: registration.model.js:69-73 |
| `userId` | BIGINT UNSIGNED FK | // Source: registration.model.js:74-83 |
| `projectId` | BIGINT UNSIGNED FK | UAT=2, Prod=1 // Source: auth.controller.js:130; registration.model.js:84-93 |
| `projectName` | STRING(100) | From `projects.name` // Source: auth.controller.js:135 |
| `opportunityId` | STRING(50) | LSQ Opportunity ID // Source: registration.model.js:99-103 |
| `registrationNumber` | STRING(50) UNIQUE | Null until EOI payment // Source: registration.model.js:109-113 |
| `status` | ENUM('Open','Won','Lost','Refund') | New row = `'Open'` // Source: auth.controller.js:305; registration.model.js:160-163 |
| `stage` | STRING(50) | New row = `'Open'` // Source: auth.controller.js:306 |
| `paymentStatus` | ENUM('pending','success','failed') | New row = `'pending'` // Source: auth.controller.js:307 |

### OTP storage model
There is **no separate OTP table**. OTP is stored as a plaintext 6-digit string directly on the `users.otp` column with `users.otpExpires` timestamp. Cleared (set to `null`) on successful verification — // Source: auth.controller.js:574-577, 857-858

---

## 3. State Machines

### 3.1 Buyer User Registration State Machine

```
[NOT EXISTS]
   │ send-otp received for unknown phone+roleId=2
   ▼
[LSQ LEAD CAPTURE]     ── createLsqLead via leadSquared.service.js
   │
   ▼
[LSQ OPPORTUNITY CREATE] ── OpportunityEventCode=12000, OpportunityNote="Growth Registration"
   │                       // Source: auth.controller.js:223-226, 391-394
   ▼
[USER ROW CREATED] ── User.create({ phone, roleId:2, countryCode:'+91', prospectId, isNri?, brokerXrCode })
   │                  // Source: auth.controller.js:273-285 (NRI) / :440-450 (non-NRI)
   ▼
[REGISTRATION ROW CREATED] ── status='Open', stage='Open', paymentStatus='pending'
   │                          // Source: auth.controller.js:298-310, 465-477
   ▼
[OTP_PENDING] ── otp + otpExpires written to users row, OTP dispatched
   │             // Source: auth.controller.js:571-577
   ▼
[OTP_VERIFIED] ── verifyOtp success → otp=null, otpExpires=null, lastLogin=NOW(), JWT returned
                  // Source: auth.controller.js:857-866
```

### 3.2 OTP Verification State Machine

```
verifyOtp called
   │
   ├─ User row not found ────► return 401 "Invalid OTP" (deliberate ambiguity to prevent enum) // auth.controller.js:718-722
   │
   ├─ MASTER_OTP env var match ──► skip validation, log "Master OTP used" // auth.controller.js:725-731
   │
   ├─ user.otp !== submitted ────► updateOtpVerificationStatus(prospectId, false); return 401 "Invalid OTP" // :734-737
   │
   ├─ NOW > user.otpExpires  ────► same as above // :734-737
   │
   └─ MATCH
        │
        ├─ if userType==='user': build registrationData lookup, set isRegistered flag // :814-823
        ├─ updateOtpVerificationStatus(prospectId, true)                              // :854
        ├─ user.otp = null; user.otpExpires = null; user.lastLogin = new Date()       // :857-859
        ├─ generateToken(user.id) → JWT signed with HS256                              // :864 → :25-29
        └─ return 200 { user: userResponse, token }                                    // :866
```

### 3.3 Returning-User Login (existing buyer)

Decided by `hasActiveRegistration` boolean computed via `Registration.findOne({ projectId, userId, status: {ne:'Refund'} })`:
- If user exists **AND** has prospectId **AND** has active registration → skip LSQ lead/opportunity creation, validate existing prospect against LSQ, generate fresh OTP — // Source: auth.controller.js:321-333 (NRI) / :488-500 (non-NRI)
- Otherwise treated as "needs setup" → falls through registration path again

---

## 4. Business Rules

### 4.1 Phone Validation
- **Backend regex (production)**: `/^[6-9]\d{9}$/` — Indian mobile, must start 6/7/8/9 — // Source: source-code/backend/src/constants/regex.js:1
- **Test regex** (used somewhere but not actively enforced in `sendOtpSchema`): `/^[0-9]\d{9}$/` — // Source: constants/regex.js:2
- The `sendOtpSchema` body validation currently does NOT run a regex on `phone` (the `.test()` is commented out) — // Source: validations/auth.validations.js:44-50. Phone format is only re-enforced by the **frontend** `phoneRegExp` (`/^[6-9]\d{9}$/` prod, `/^[1-9]\d{9}$/` non-prod) — // Source: buyer-portal/src/components/LoginForm.js:56
- Phone is required for buyer flow (both NRI and non-NRI) — // Source: auth.controller.js:338; validations/auth.validations.js:111-117

### 4.2 Email Validation
- Regex: `/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i` — // Source: constants/regex.js:3
- Required ONLY for NRI buyers — // Source: validations/auth.validations.js:86-90; auth.controller.js:159-161

### 4.3 OTP Format / Generation
- **6 digits**, generated via `Math.floor(100000 + Math.random() * 900000).toString()` — // Source: auth.controller.js:52-54
- **NOT cryptographically secure** — uses `Math.random()`, predictable in theory — // Source: auth.controller.js:53 (see Section 7 Known Bugs)
- Regex enforced on verify: `/^\d{6}$/` — // Source: constants/regex.js:4; validations/auth.validations.js:149

### 4.4 OTP Expiry
- Default: **10 minutes** (`OTP_EXPIRY_MINUTES` env, falls back to `10`) — // Source: source-code/backend/src/config/app.js:84
- Calculated as `dayjs().add(otpConfig.expiryMinutes, 'minute').format('YYYY-MM-DD HH:mm:ss')` — // Source: auth.controller.js:572
- Expiry checked at verify with `new Date() > new Date(user.otpExpires)` — // Source: auth.controller.js:734

### 4.5 OTP Resend / Cooldown
- Config exposes `cooldownMinutes` (default `2`) — // Source: config/app.js:85
- **Cooldown logic is fully commented out** in the controller — there is currently **NO backend enforcement of resend cooldown** — // Source: auth.controller.js:558-568
- Resend rate-limiting therefore relies on **frontend timer only** (60 seconds, hardcoded) — // Source: buyer-portal/src/components/LoginForm.js:169
- Comment in code says "Fixed 2 minutes (120 seconds) for resend timer" but `setTimer(60)` is used — // Source: buyer-portal/src/components/LoginForm.js:162-169 (inconsistency, see Section 7)

### 4.6 Retry Limits / Brute Force Protection
- **No attempt counter** — there is no `otpAttempts` column on users; the model has no failed-attempt tracking
- Invalid OTP responses return the same generic "Invalid OTP" message regardless of cause (user not found / wrong code / expired) — by design, to prevent enumeration — // Source: auth.controller.js:718-722, 734-737
- `authLimiter` middleware exists (50 req/min per IP) but is **commented out** in `app.js` — // Source: source-code/backend/src/app.js:40

### 4.7 Master OTP (test/admin bypass)
- For `userType === 'user'`: env var `MASTER_OTP` — // Source: config/app.js:82; auth.controller.js:726
- For admin/SM: env var `ADMIN_MASTER_OTP` — // Source: config/app.js:83; auth.controller.js:726
- Buyer test OTP `147258` (UAT) is the value of `MASTER_OTP` env var on UAT backend (cannot be confirmed from repo — env-bound) — // Source: NOT FOUND IN REPO — verify on UAT backend env vars
- When master OTP submitted, OTP validation is bypassed and an `info` log is written: `"Master OTP used for user: ${user.id}"` — // Source: auth.controller.js:729-731

### 4.8 Country Code
- Forced to `+91` for non-NRI users (regardless of body) — // Source: auth.controller.js:122
- NRI users: provided `countryCode` is accepted only if it matches regex `/^\+\d{1,3}$/` — // Source: validations/auth.validations.js:64; auth.controller.js:122

### 4.9 Conflict Rules
- Same phone exists as NRI when user submits as non-NRI → 409 "Number already registered as NRI." — // Source: auth.controller.js:353-355
- Same phone exists as non-NRI when user submits as NRI → 409 "Number already registered as Indian national." — // Source: auth.controller.js:181-183
- NRI: email submitted doesn't match the email stored for that phone → 409 "Email address does not match with the phone number" — // Source: auth.controller.js:166-168
- Generic duplicate (same isNri value) → 409 "Provided phone number is already registered" / "Provided phone number is already registered." — // Source: auth.controller.js:185-186, 356

### 4.10 Session / JWT Token
- Signed via `jwt.sign({ id: userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })` — // Source: auth.controller.js:25-29
- `expiresIn` default: `1d` (24 hours) — // Source: config/app.js:78
- Secret: env `JWT_SECRET` with hardcoded fallback (security risk) — // Source: config/app.js:75-77
- Token returned in response body only; **no cookie is set** (the `res.cookie('jwt', ...)` block is commented out) — // Source: auth.controller.js:36-46; verifyOtp:866
- On protected requests, token must be supplied as `Authorization: Bearer <token>` header OR `req.cookies.jwt` cookie — // Source: middleware/auth.middleware.js:35-39

### 4.11 Project Context
- Hardcoded mapping: `projectId = app.production ? 1 : 2` — i.e. UAT/dev always uses project ID 2 — // Source: auth.controller.js:130, 678
- Project must exist; if not → 400 "Invalid project" — // Source: auth.controller.js:131-134

---

## 5. Notification Dispatch

The send-OTP endpoint fans out the OTP through **three independent channels**, each fire-and-forget (no await on outbound success for SMS/WhatsApp):

### 5.1 SMS — via Epinet (confirmed)
- Trigger: only for non-NRI buyers (`if (!nri)`) — // Source: auth.controller.js:594-596
- Number formatted as `91${phone}` (forced `91` prefix, no `+`) — // Source: auth.controller.js:595
- Function: `sendOTP(toNumber, otpCode)` → `sendSMS(toNumber, 'OTP', { otp })` — // Source: services/api/whatsapp.service.js:122
- **Provider URL: `https://epinetinfo.in/api/pushsms`** — // Source: services/api/whatsapp.service.js:101
- Auth params (hardcoded): `user=HOABLDIGITAL&authkey=92ymJJA7mMd2k&sender=THOAL`
- DLT IDs: `entityId=1001286607558438702`, `templateId=1007393289666667759` — // Source: services/api/whatsapp.service.js:54-58
- Template: `"{otp} is your OTP to join India's First Digital Housing Revolution. Let's begin our growth journey today!"` — // Source: services/api/whatsapp.service.js:57-58
- **Note: Kaleyra SMS service file exists (`kaleyra-sms.service.js`) but is NOT used for OTP — it is imported/commented out in `communication.service.js`** — // Source: services/communication.service.js:8-9

### 5.2 WhatsApp — via Botspice (not Kaleyra)
- Triggered for **both** NRI and non-NRI when phone present — // Source: auth.controller.js:587-593
- Template: `otp_send` (category `AUTHENTICATION`) — // Source: auth.controller.js:590-592
- API: `whatsappClient.post('api/wappBroad/triggerwam', ...)` — // Source: services/api/whatsapp.service.js:11-22
- Phone formatted as `${effectiveCountryCode}${phone}` (e.g. `+91XXXXXXXXXX`) — // Source: auth.controller.js:590

### 5.3 Email — via SMTP/EJS template
- Triggered only when `email` is in the request body (i.e. NRI flow or NRI with email) — // Source: auth.controller.js:582-585, 604-618
- Routed through `communicationService.sendOtp({ channel: 'email', ... })` — // Source: auth.controller.js:606-612
- Subject: `"HoABL - Login Verification Code"` — // Source: services/communication.service.js:65
- EJS template: `'otp'`, data `{ otp, expiryMinutes }` — // Source: services/communication.service.js:64-68

### 5.4 LeadSquared OTP-verified flag update
- On successful verify, `updateOtpVerificationStatus(prospectId, true)` fires-and-forgets an LSQ Lead update with `mx_OTP_Verified=Yes`, `mx_OTP_Verified_On=<UTC timestamp>` — // Source: auth.controller.js:649-663, 854
- On failed verify (wrong OTP or expired), the same call fires with `mx_OTP_Verified=No` — // Source: auth.controller.js:735

---

## 6. API Endpoints

All endpoints prefixed with `/api/v1` (mounted in `routes/index.js:70`).

### 6.1 POST `/api/v1/auth/user/send-otp`
- **Controller**: `sendOtpV3` // Source: auth.controller.js:118
- **Auth guard**: None (public) // Source: routes/auth.routes.js:20-26
- **Middleware**: `addUserTypeMiddleware('user')` forces `req.body.userType = 'user'`, then `validateRequest({ body: sendOtpSchema })` // Source: routes/auth.routes.js:21-26
- **Body schema** (`sendOtpSchema`): // Source: validations/auth.validations.js:40-120
  - `phone` (string, nullable) — required for buyer (resolved in 'validate-based-on-nri-status' test)
  - `email` (string, nullable) — required only when `nri=true`
  - `nri` (boolean, default false)
  - `countryCode` (string, must match `/^\+\d{1,3}$/` when phone+nri)
  - `hvCode` (string, nullable) — encrypted referral; decrypted via `decrypt(hvCode)` — // Source: auth.controller.js:142-150
  - `userType` (forced to `'user'` by middleware)
  - Extra fields accepted (not in schema, `stripUnknown: false`): `sessionId`, `fullUrl`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gad_source`, `gad_campaignid`, `gbraid`, `gclid` — used as LSQ opportunity custom fields // Source: auth.controller.js:236-251
- **Responses**:
  - `200 { status:'success', message:'OTP sent successfully', data:{ phone, email?, otpExpires } }` // Source: auth.controller.js:620
  - `400` Invalid project / Invalid user type / Phone required / Both email+phone required for NRI
  - `409` Conflicts (see 4.9)
  - `500` LSQ failure / DB transaction rollback / `pleaseTryAgain`

### 6.2 POST `/api/v1/auth/user/verify-otp`
- **Controller**: `verifyOtp` // Source: auth.controller.js:668
- **Auth guard**: None (public) // Source: routes/auth.routes.js:34
- **Middleware**: `addUserTypeMiddleware('user')` + `validateRequest({ body: verifyOtpSchema })` // Source: routes/auth.routes.js:34
- **Body schema** (`verifyOtpSchema`): // Source: validations/auth.validations.js:125-206
  - `otp` (string, **required**, must match `/^\d{6}$/`)
  - `phone` (string, nullable) — required for buyer
  - `email` (string, nullable) — required only when `nri=true`
  - `nri` (boolean, default false)
  - `userType` (default `'user'`)
  - `isConsented` (boolean, nullable) — used only for CP flow
  - `nurixSessionId` (object `{ sessionId: digits-string }`) — chatbot session linkage
- **Response 200**: // Source: auth.controller.js:866
  ```json
  {
    "status":"success",
    "message":"OTP verified successfully",
    "data":{
      "user":{
        "name":"...","firstName":"...","lastName":"...","role":"user",
        "panNumber":"...","pincode":"...","address":"...",
        "email":"...","phone":"...","countryCode":"+91","isNri":false,
        "isRegistered":<boolean — true if registrationNumber present>
      },
      "token":"<JWT>"
    }
  }
  ```
- **Error responses**:
  - `400` "OTP is required" / "Phone number is required" / "Both email and phone are required for NRI users" // Source: auth.controller.js:674-689, 702
  - `401` "Invalid OTP" (covers user-not-found, wrong code, expired) // Source: auth.controller.js:718, 736
  - `500` `pleaseTryAgain`

### 6.3 POST `/api/v1/auth/logout`
- **Controller**: `logout` // Source: auth.controller.js:36
- **Auth guard**: `protect` (JWT required) // Source: routes/auth.routes.js:44
- **Behavior**: Returns 200 success. Cookie-clearing code is commented out — token revocation is effectively client-side only (server keeps issuing the same JWT valid until natural expiry) // Source: auth.controller.js:36-46

### 6.4 POST `/api/v1/user/registration/order` (EOI payment, post-login)
- **Controller**: `submitEoi` // Source: routes/user.routes.js:55-63
- **Auth guard**: `protect` + `restrictTo('user')` // Source: routes/user.routes.js:49-50
- Out of scope for this FSD — covered in the EOI payment flow doc.

### 6.5 Other portal send/verify variants (NOT buyer)
These exist on the same router but are NOT buyer endpoints:
- `POST /api/v1/auth/cp/send-otp` / `verify-otp` — // Source: routes/auth.routes.js:28, 36
- `POST /api/v1/auth/admin/send-otp` / `verify-otp` — // Source: routes/auth.routes.js:30, 38
- `POST /api/v1/auth/sales-manager/send-otp` / `verify-otp` — // Source: routes/auth.routes.js:32, 40

---

## 7. Known Bugs / Gaps

| # | Severity | Issue | Source |
|---|---|---|---|
| 1 | High | OTP generated with `Math.random()` — predictable, not cryptographically secure | auth.controller.js:52-54 |
| 2 | High | Plaintext OTP stored on `users.otp` (no hash) — DB leak exposes live OTPs | user.model.js:187-190; auth.controller.js:574 |
| 3 | High | Backend cooldown logic on `lastOtpSentAt` is fully commented out — unlimited send-OTP allowed (frontend timer only) | auth.controller.js:558-568 |
| 4 | High | Rate limiter (`authLimiter`) commented out in `app.js` — endpoints have no abuse protection | app.js:40 |
| 5 | High | No failed-attempt counter — brute force on 6-digit OTP is unrestricted server-side (10⁶ combos, ~10-min window) | auth.controller.js:734-737 (no counter) |
| 6 | Medium | Backend `sendOtpSchema` no longer enforces phone regex (test commented) — invalid phones reach LSQ / DB | validations/auth.validations.js:44-50 |
| 7 | Medium | JWT secret has insecure hardcoded fallback if env var missing | config/app.js:75-77 |
| 8 | Medium | Logout endpoint returns 200 but does NOT invalidate JWT server-side; cookie clear is commented out | auth.controller.js:36-46 |
| 9 | Medium | Frontend resend timer set to 60s but comment claims 120s — inconsistency | buyer-portal/src/components/LoginForm.js:162-169 |
| 10 | Medium | NRI fallback in verify: if `phone+email` lookup fails, falls back to `phone-only` — could authenticate via wrong email if email mismatch slipped through send-otp | auth.controller.js:708-715 |
| 11 | Low | `User.toJSON()` strips `createdAt`/`updatedAt` — makes audit queries harder for frontend | user.model.js:40-44 |
| 12 | Low | `MASTER_OTP` and `ADMIN_MASTER_OTP` shared globally — leak compromises every account | config/app.js:82-83; auth.controller.js:726-731 |
| 13 | Low | Phone format inconsistency for SMS: `91${phone}` (no plus) vs WhatsApp `${countryCode}${phone}` (with plus) | auth.controller.js:590, 595 |
| 14 | Low | LSQ lead/opportunity created BEFORE user/registration DB write — if DB transaction fails, LSQ has orphan lead | auth.controller.js:199, 257, 270-320 |
| 15 | Info | UAT buyer test OTP `147258` not present in repo — assumed value of `MASTER_OTP` env on UAT backend | NOT FOUND — verify with DevOps/UAT env |

---

## 8. QA Risk Areas

### 8.1 Critical (block release if untested)
- **Master-OTP behavior** — must verify (a) UAT master OTP `147258` works for any buyer phone, (b) real OTP also works in parallel, (c) master OTP rejected in production (env var unset)
- **Concurrent OTP requests for same phone** — back-to-back send-otp overwrites `users.otp`; verify oldest OTP becomes invalid // auth.controller.js:574-577
- **LSQ failure paths** — if `captureLead` returns no `prospectId`, response is 500; verify user gets retry-friendly UX // auth.controller.js:70-72
- **DB transaction rollback under LSQ partial failure** — opportunity created in LSQ but user/registration write fails → orphan LSQ record. Verify reconciliation strategy
- **JWT expiry behavior** — 24h default; verify protected routes redirect to login at boundary // config/app.js:78
- **Phone uniqueness across NRI/non-NRI** — switching `isNri` for same phone is blocked with specific messages; cover all 4 transitions

### 8.2 NRI Edge Cases
- NRI with mismatched email → 409 expected
- NRI fallback in verify (phone-only after phone+email miss) — exploit potential, see bug #10
- `countryCode` regex `/^\+\d{1,3}$/` rejects `+91-` or `91` — verify frontend formatting matches

### 8.3 Resend / Brute Force
- Cooldown is unenforced server-side — verify automated abuse test bypasses frontend timer
- 10-minute expiry × 1,000,000 OTP space — verify backend caps attempts somehow (it doesn't — bug #5)

### 8.4 LSQ Connectivity
- All flows depend on synchronous LSQ calls — verify what happens when LSQ is down (currently 500 to user)
- `updateOtpVerificationStatus` is fire-and-forget — failures swallowed in logs only // auth.controller.js:660-662

### 8.5 Channel Dispatch
- WhatsApp fire-and-forget — failure does not block OTP issuance; user may receive only SMS or only Email
- Email channel only fires if `email` in body — non-NRI users never get email OTP; verify expectation
- SMS only for non-NRI (`if (!nri)`) — NRI users get NO SMS, only WhatsApp+Email. Confirm requirement

### 8.6 Session
- No logout server-side → stolen JWT valid full 24h
- No "logged in elsewhere" detection — multiple devices share same active token

### 8.7 Data Integrity
- `registrationNumber` UNIQUE but nullable; multiple Open registrations possible across projects (different projectId); verify single-project assumption
- `Registration.defaultScope` filters `status != 'REFUND'` (uppercase) but enum is `'Refund'` (capitalized) — case mismatch means scope NEVER filters anything // Source: registration.model.js:201-207 vs :161

### 8.8 Frontend / Backend Drift
- Frontend phone regex differs by env: prod `[6-9]`, non-prod `[1-9]` — verify backend matches in each env // LoginForm.js:56
- Frontend OTP timer 60s vs comment 120s vs backend cooldown 2min — three different truths

### 8.9 Test Credentials Block
- UAT buyer: phone `8888888888`, OTP `147258` (assumed master) — confirm with backend env
- Phone `8888888888` violates prod regex `[6-9]\d{9}` (starts with 8 — passes); but starts-with-1..5 phones (test regex) would fail in prod. Verify test data per env

---

**End of FSD — Buyer Portal: Registration & Login**
