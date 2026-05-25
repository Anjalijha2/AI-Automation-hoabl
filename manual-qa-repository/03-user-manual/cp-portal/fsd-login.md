# FSD — CP Portal: Login & Auth
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Channel Partner (CP) portal uses a passwordless mobile-OTP login flow. A 6-digit OTP is generated server-side, delivered to the registered Indian mobile number over SMS (Epinet) and WhatsApp, then exchanged for a JWT bearer token. The same `sendOtpV3` / `verifyOtp` controller pair serves `user`, `cp`, `admin`, `sales_manager`, and `sales_manager_admin` user types, branched by `userType` in the request body.

A CP is modelled as a `users` row with `roleId = 3`.
```javascript
// Source: source-code/backend/src/constants/global.js:15-21
export const roleNameIdMap = { admin: 1, user: 2, cp: 3, sales_manager_admin: 4, sales_manager: 5 };
```

Unlike admin / sales-manager users (which must pre-exist), the CP path will lazily create a `users` row on first send-OTP if no record exists for the supplied phone.
```javascript
// Source: source-code/backend/src/controllers/auth.controller.js:522-528
if (!user && userType === 'cp') {
  user = await User.create({ phone, countryCode: effectiveCountryCode, roleId });
}
```

Post-OTP verification, the CP advances through three gated states before reaching the dashboard:
1. Consent (`isConsented`)
2. CP Registration / KYC (`isCpRegistrationCompleted`)
3. JBP submission check (`isJbpSubmitted` — informational flag only, does not block login)
   `// Source: source-code/backend/src/controllers/auth.controller.js:755-794`

There is **no admin approval workflow** for CPs in the backend — the only admin gating is `users.isActive`, which when `false` blocks send-OTP with "Your access to the portal has been revoked".
```javascript
// Source: source-code/backend/src/controllers/auth.controller.js:517-519
if (user && !user.isActive) {
  return ApiResponse.error(httpStatus.BAD_REQUEST, 'Your access to the portal has been revoked').send(res);
}
```

---

## 2. Data Model

### Table: `users` (CP-relevant columns)
`// Source: source-code/backend/src/models/user.model.js:63-336`

| Column | Type | CP Meaning | Source |
|---|---|---|---|
| `id` | BIGINT UNSIGNED PK | CP user id | user.model.js:65-69 |
| `roleId` | BIGINT UNSIGNED, FK roles | Always `3` for CP | user.model.js:71-74 |
| `phone` | STRING(15) | Primary login identifier | user.model.js:107-109 |
| `phone2` | STRING(15) | Secondary contact (KYC) | user.model.js:110-112 |
| `countryCode` | STRING(5) | Hard-set to `+91` for CP — see Business Rules | user.model.js:104-106 |
| `email` / `email2` | STRING(100) | KYC fields | user.model.js:116-121 |
| `ownerName` | STRING(100) | CP owner full name | user.model.js:122-124 |
| `orgName` | STRING(100) | CP organisation name | user.model.js:125-127 |
| `panNumber` | STRING(10) | KYC PAN | user.model.js:128-130 |
| `reraNumber` | STRING(30) | KYC RERA (optional) | user.model.js:131-133 |
| `address` / `officePincode` / `officeSuburb` / `officeCity` / `officeZone` / `officeState` / `officeCountry` | STRING | KYC office address (pincode resolved via Mavis) | user.model.js:134-178 |
| `businessRegion` | STRING(100) | KYC business region | user.model.js:137-139 |
| `prospectId` | STRING(100) | LeadSquared lead ID (XR backend stores only the ID; LSQ internals excluded) | user.model.js:80-83 |
| `hvCode` | STRING(50) | Derived `HV` + zero-padded id offset (489 + user.id) | user.model.js:88-92 |
| `encryptedHvCode` | STRING(255) | AES-encrypted hvCode returned to client | user.model.js:93-97 |
| `password` | STRING NULLABLE | Unused for CP login (passwordless flow) | user.model.js:179-182 |
| `otp` | STRING(6) NULLABLE | Active OTP value | user.model.js:187-190 |
| `otpExpires` | DATETIME NULLABLE | OTP expiry timestamp | user.model.js:191-194 |
| `lastOtpSentAt` | DATETIME NULLABLE | Tracked but cooldown check is commented out | user.model.js:200-203 |
| `isCpRegistrationCompleted` | BOOLEAN | Set true after CP KYC | user.model.js:275-277 |
| `isLeadCp` | BOOLEAN, default false | Master CP flag | user.model.js:278-283 |
| `leadCpId` | BIGINT UNSIGNED NULLABLE | FK to master CP (`users.id`) | user.model.js:284-288 |
| `masterHvCode` | STRING(50) NULLABLE | hvCode of master, for lookup | user.model.js:289-293 |
| `smUserId` | BIGINT UNSIGNED NULLABLE | Mapped Sales Manager (users.id) | user.model.js:294-298 |
| `isActive` | BOOLEAN, default true | Admin revoke switch | user.model.js:305-308 |
| `isConsented` | BOOLEAN NULLABLE | Tri-state: 1=agreed, 0=declined, NULL=undecided | user.model.js:309-314 |
| `nurixSessionId` | JSON NULLABLE | Unused by CP path (set only for `userType==='user'`) | user.model.js:195-199 |
| `deletedAt` | DATETIME NULLABLE | Soft-delete (`paranoid: true`) | user.model.js:333-336, 344 |

### JWT secret & expiry
```javascript
// Source: source-code/backend/src/config/app.js:74-78
export const jwtConfig = { secret: ..., expiresIn: process.env.JWT_EXPIRES_IN || '1d' };
```

### OTP config
```javascript
// Source: source-code/backend/src/config/app.js:81-86
export const otp = {
  masterOtp: process.env.MASTER_OTP,
  adminMasterOtp: process.env.ADMIN_MASTER_OTP,
  expiryMinutes: process.env.OTP_EXPIRY_MINUTES || 10,
  cooldownMinutes: process.env.OTP_COOLDOWN_MINUTES || 2, // (cooldown enforcement is commented out)
};
```

---

## 3. State Machines

### 3.1 CP Account Lifecycle (`users` row for `roleId=3`)
```
            send-OTP (cp, phone)
[non-existent] ───────────────────► [created, isCpRegistrationCompleted=NULL/false,
                                    isConsented=NULL, isActive=true]
                                              │
                              verify-OTP (consent prompt)
                                              ▼
                              [isConsented=true]   (false → "Consent Declined", terminal until reset)
                                              │
                              POST /api/v1/cp/registration (KYC + LSQ lead capture)
                                              ▼
                          [isCpRegistrationCompleted=true]
                                              │
                                              ▼
                                      [Dashboard access]
                                              │
                                  admin sets isActive=false
                                              ▼
                                  [Revoked — send-OTP blocked]
```
`// Source: source-code/backend/src/controllers/auth.controller.js:517-528, 755-794`
`// Source: source-code/backend/src/controllers/cp.controller.js:36-498`

### 3.2 OTP Lifecycle (per user row)
```
[no otp]
   │ send-OTP
   ▼
[otp=<6-digit>, otpExpires=now+10min, lastOtpSentAt=now]
   │
   ├─ verify-OTP success ───► [otp=NULL, otpExpires=NULL, lastLogin=now] → JWT issued
   │
   ├─ verify-OTP wrong/expired ─► error "Invalid OTP" (otp value unchanged)
   │
   └─ send-OTP again ───► [otp overwritten with new value, otpExpires reset, lastOtpSentAt=now]
```
`// Source: source-code/backend/src/controllers/auth.controller.js:571-577, 734-738, 854-861`

### 3.3 Master/Member CP topology (affects post-login data scoping; managed by admin, not by login flow itself)
- Master: `isLeadCp=true`, `leadCpId=self.id`, `masterHvCode=self.hvCode`
- Member: `isLeadCp=false`, `leadCpId=<master.id>`, `masterHvCode=<master.hvCode>`
- Standalone: `isLeadCp=false`, `leadCpId=NULL`, `masterHvCode=NULL`

`// Source: source-code/backend/src/controllers/admin-cp.controller.js:128-153, 333-347`

---

## 4. Business Rules

| # | Rule | Source |
|---|------|--------|
| BR-CP-LOG-01 | Login is OTP-only; the `password` column exists but is never used or checked in any CP path. | user.model.js:179-182 + absence of any `bcrypt.compare` in auth.controller.js |
| BR-CP-LOG-02 | CP `userType` MUST supply `phone`; `email` alone is rejected (admin-and-cp branch only checks phone). | auth.controller.js:508 |
| BR-CP-LOG-03 | `effectiveCountryCode` for CP is hard-coded `+91` (the `nri` branch is restricted to `userType==='user'`). | auth.controller.js:122 |
| BR-CP-LOG-04 | If CP user does not exist by phone, a row is auto-created with `roleId=3` and `countryCode='+91'`. No duplicate-phone check is performed for the CP branch. | auth.controller.js:522-528 |
| BR-CP-LOG-05 | If user exists but `isActive===false`, send-OTP returns 400 "Your access to the portal has been revoked". | auth.controller.js:517-519 |
| BR-CP-LOG-06 | OTP is 6 numeric digits, generated via `Math.floor(100000 + Math.random()*900000)`. | auth.controller.js:52-54 |
| BR-CP-LOG-07 | OTP expiry is `OTP_EXPIRY_MINUTES` (default 10 min) after send. | auth.controller.js:572, config/app.js:84 |
| BR-CP-LOG-08 | OTP cooldown logic exists in the model field `lastOtpSentAt` and config `cooldownMinutes` but the rate-limit branch is **commented out** in the controller — i.e. there is currently NO enforced cooldown between OTP requests. | auth.controller.js:559-568 (commented block) |
| BR-CP-LOG-09 | OTP is dispatched to phone over BOTH WhatsApp template `otp_send` (AUTHENTICATION category) AND Epinet SMS for non-NRI users. NRI branch does not apply to CP. | auth.controller.js:590-600 |
| BR-CP-LOG-10 | If a CP has completed registration (`isCpRegistrationCompleted=true`), send-OTP additionally validates that `user.prospectId` resolves in LeadSquared; failure returns 500 with generic message. | auth.controller.js:533-554 |
| BR-CP-LOG-11 | Master OTP override: if `req.body.otp` equals `process.env.MASTER_OTP` (non-admin master), OTP validation is skipped. | auth.controller.js:725-731, config/app.js:82 |
| BR-CP-LOG-12 | On verify-OTP for CP, response branches by completion state: (a) `isConsented` not yet set & no `isConsented` in body → "Consent Pending" (no JWT in branch, returns user payload without token); (b) `isConsented=false` posted → "Consent Declined" (no JWT); (c) consented but `isCpRegistrationCompleted=false` → "Registration Pending" (no JWT in this branch either). | auth.controller.js:770-789 |
| BR-CP-LOG-13 | The verify-OTP success response on the *terminal* branch (consented + registration complete) clears `otp`/`otpExpires`, sets `lastLogin=now()`, and returns `{ user, token }`. | auth.controller.js:854-866 |
| BR-CP-LOG-14 | JWT payload = `{ id: userId }` signed with `jwtConfig.secret`, expiry `JWT_EXPIRES_IN` (default `1d`). | auth.controller.js:25-29, config/app.js:74-78 |
| BR-CP-LOG-15 | All protected `/api/v1/cp/*` routes (except `POST /cp/registration`) require `protect` (JWT) + `restrictTo('cp')`. | routes/cp.routes.js:36-37 |
| BR-CP-LOG-16 | Protected route auth accepts `Authorization: Bearer <jwt>` OR `req.cookies.jwt`. | middleware/auth.middleware.js:35-39 |
| BR-CP-LOG-17 | Token verification: `JsonWebTokenError` → 401 "Invalid session"; `TokenExpiredError` → 401 "Your session has expired". | middleware/auth.middleware.js:79-87 |
| BR-CP-LOG-18 | Logout is stateless — returns 200 success only; cookie clear is commented out. There is no server-side token blacklist. | auth.controller.js:36-46 |
| BR-CP-LOG-19 | `encryptedHvCode` is backfilled from `hvCode` on verify-OTP if missing. | auth.controller.js:756-759 |
| BR-CP-LOG-20 | `permissions` map (moduleId → [actionId]) is returned for CP role via `RolePermission` → `Permission` join. | auth.controller.js:627-647, 796-812 |

---

## 5. Notification Dispatch

### Login flow notifications (CP)

| Trigger | Channel | Template / Provider | Recipient | Source |
|---|---|---|---|---|
| send-OTP (CP, non-NRI) | WhatsApp | `otp_send` via Botspice/WhatsApp client, category `AUTHENTICATION` | CP phone (`+91<phone>`) | auth.controller.js:590-592 |
| send-OTP (CP) | SMS | Epinet pushsms HTTP GET (`epinetinfo.in/api/pushsms`), template OTP | CP phone (`91<phone>`) | services/api/whatsapp.service.js:101-122 |
| verify-OTP success | (none) | — | — | auth.controller.js:854-866 (no dispatch) |
| Token expired / invalid | (none — HTTP 401 only) | — | — | middleware/auth.middleware.js:79-87 |
| `isActive=false` revoke | (none on send-OTP) | — | — | auth.controller.js:517-519 |
| Logout | (none) | — | — | auth.controller.js:36-46 |

**Confirmed:** OTP provider is **Epinet** (NOT Kaleyra). The Kaleyra services exist in the codebase (`services/kaleyra*.service.js`) but are not invoked from `sendOtpV3`.
`// Source: source-code/backend/src/services/api/whatsapp.service.js:101 (epinetinfo.in URL)`

**Confirmed:** No notifications are dispatched to admin, sales manager, or master CP on a CP login event.
`// Source: source-code/backend/src/controllers/auth.controller.js:668-871 (verifyOtp body — verified for absence)`

---

## 6. API Endpoints

| Method | Path | Auth | Body / Query | Purpose | Source |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/cp/send-otp` | Public | `{ phone: string }` (hvCode optional, ignored for CP) | Generate + dispatch OTP to CP phone. Lazily creates user. | routes/auth.routes.js:27, controllers/auth.controller.js:118 + 506-554 |
| POST | `/api/v1/auth/cp/verify-otp` | Public | `{ phone, otp, isConsented? }` | Verify OTP, return user state + JWT (only on terminal branch). | routes/auth.routes.js:37, controllers/auth.controller.js:668 |
| POST | `/api/v1/auth/logout` | `protect` (any role) | (empty) | Stateless 200; cookie clear commented out. | routes/auth.routes.js:45, controllers/auth.controller.js:36 |
| POST | `/api/v1/cp/registration` | Public (no `protect`) | multipart/form-data: phone, email, ownerName, orgName, address, businessRegion, officePincode, panNumber, reraNumber?, panDoc/gstDoc/reraDoc files | Capture KYC, push to LSQ, persist user, return `{ user, token }`. | routes/cp.routes.js:19-33, controllers/cp.controller.js:36 |
| (All routes below are mounted after `router.use(protect); router.use(restrictTo('cp'))` — JWT + roleId=3 required) | | | | | routes/cp.routes.js:36-37 |
| GET | `/api/v1/cp/kyc` | CP | — | Return KYC + LSQ document URLs. | routes/cp.routes.js:70, controllers/cp.controller.js:1609 |
| GET | `/api/v1/cp/jbp-cycles` | CP | `?projectSlug=…` | Latest JBP cycle + edit state. | routes/cp.routes.js:40, controllers/cp.controller.js:1717 |
| GET | `/api/v1/cp/jbp-history` | CP | `?projectSlug, page, limit` | Paginated JBP submissions. | routes/cp.routes.js:41, controllers/cp.controller.js:1907 |
| POST | `/api/v1/cp/jbp` | CP | JBP submission payload | Create JBP submission. | routes/cp.routes.js:43-48, controllers/cp.controller.js:505 |
| POST | `/api/v1/cp/jbp-edit-requests` | CP | `{ projectSlug, jbpSubmissionId, reason, explanation? }` | Request edit window on an existing JBP. | routes/cp.routes.js:51, controllers/cp.controller.js:2023 |
| GET | `/api/v1/cp/jbp-edit-requests` | CP | `?projectSlug, page, limit` | List CP's own edit requests. | routes/cp.routes.js:52-56, controllers/cp.controller.js:2137 |

---

## 7. Known Bugs / Gaps

| # | Issue | Severity | Source |
|---|-------|----------|--------|
| GAP-LOG-01 | **OTP cooldown not enforced.** `lastOtpSentAt` is written on every send-OTP, but the rate-limit gate (`if (false && timeSinceLastOtp ...)`) is hard-disabled. A client can request unlimited OTPs and overwrite `users.otp` each call. | High | auth.controller.js:559-568 |
| GAP-LOG-02 | **Duplicate-phone check skipped for CP on auto-create.** The auto-create branch (`!user && userType==='cp'`) does not re-query before insert; if `User.create` races, the second send-OTP for the same phone could insert a duplicate row. (No `unique` constraint on `phone` in user model.) | Medium | auth.controller.js:522-528; user.model.js:107-109 |
| GAP-LOG-03 | **`countryCode` ignored for CP.** `sendOtpV3` line 122 forces `+91`, but `User.create` at 525 stores `effectiveCountryCode` — fine; however the registration controller at cp.controller.js:111 sets `phone` only and never persists country code, so `users.countryCode` may be NULL for self-registered CPs. | Low | auth.controller.js:122 + cp.controller.js:111-128 |
| GAP-LOG-04 | **Logout is a no-op.** Returns 200 only; no cookie clearing, no token revocation. JWT remains valid until expiry (default 1d). | High | auth.controller.js:36-46 |
| GAP-LOG-05 | **Master OTP shared across all CPs.** `process.env.MASTER_OTP` bypasses OTP check for any CP user — credentials leak risk if env var leaks. | High | auth.controller.js:725-731 |
| GAP-LOG-06 | **`isConsented=false` overwrites silently.** When verify-OTP posts `isConsented=false`, the user row's `isConsented` is set to false and saved, then "Consent Declined" returned with no token. Re-attempts must explicitly post `isConsented=true` to re-consent. | Medium | auth.controller.js:776-783 |
| GAP-LOG-07 | **"Registration Pending" branch does not return a token.** A CP who passes OTP but has not completed KYC receives `{ user: ... }` only (no `token`), yet the frontend may navigate to the KYC screen anyway. The KYC submit endpoint (`POST /cp/registration`) is public, so this is functionally fine — but inconsistent with the "fully logged in" branch. | Low | auth.controller.js:786-789 |
| GAP-LOG-08 | **No SMS retry / failure surfacing.** Epinet `sendOTP` is fire-and-forget (no `await`); if Epinet returns 4xx/5xx the controller still returns 200 "OTP sent successfully". | Medium | auth.controller.js:595; whatsapp.service.js:122 |
| GAP-LOG-09 | **OTP value stored in plaintext** in `users.otp` (STRING(6)). No hashing. | Medium | user.model.js:187-190 + auth.controller.js:574-577 |
| GAP-LOG-10 | **`isActive=false` revoke does not invalidate existing JWTs.** A revoked CP with an active JWT continues to access `/api/v1/cp/*` until token expiry, because `protect` middleware does not re-check `isActive`. | High | middleware/auth.middleware.js:48-65 (no isActive check) |

---

## 8. QA Risk Areas

1. **OTP brute-force resilience.** Verify-OTP returns identical "Invalid OTP" on user-not-found and on wrong-OTP (intentional to prevent enumeration), but with no cooldown and no lockout counter, an attacker can iterate 6-digit space. Test rate of failed attempts before any throttle kicks in (expected: none).
2. **Multi-channel OTP race.** OTP is dispatched via both WhatsApp and SMS in parallel; user could enter a stale OTP if two send-OTP calls overlap. Test by triggering send-OTP twice in <2s and verifying which OTP is valid.
3. **Consent state churn.** Posting alternating `isConsented=true`/`false` toggles the `users.isConsented` column. Test that audit / downstream logic (currently none) does not break on rapid toggle.
4. **Lazy user creation.** First-time CP send-OTP creates a row with `roleId=3` and empty `firstName`/`email`/`hvCode`. Confirm such rows do NOT appear in admin CP listings before KYC completion (admin list uses `roleId=3` filter — they WILL appear; verify UI handles empty fields).
5. **Master OTP exposure.** In UAT, `MASTER_OTP` should be set; in production, ensure not committed to env. QA must NOT log master OTP values.
6. **Token persistence after revoke.** Revoking a CP (`isActive=false`) via admin endpoint should — but does NOT — invalidate active sessions. Test admin revoke → CP continues to hit `/cp/cp-user-leads` until token expiry.
7. **JBP completion flag drift.** `isJbpSubmitted` is computed each verify-OTP via `JbpSubmission.count`. If a JBP cycle expires, `count` still includes the row (status filter is `ACTIVE` only inside CP scoping, but `count` here has no `where` beyond `userId`). Validate that an expired JBP still surfaces `isJbpSubmitted=true`.
   `// Source: auth.controller.js:791-793`
8. **prospectId revalidation.** Every send-OTP for a registered CP hits LeadSquared. If LSQ is down, the CP cannot request a new OTP at all (returns 500). Test fallback behaviour.
9. **CP registration is unauthenticated** (`POST /cp/registration` is outside `protect`), yet looks up the user by phone. A bad actor knowing a CP's phone can re-submit KYC if `isCpRegistrationCompleted=false` (and overwrite legitimate data with `kyc: true` branch). Test guard.
   `// Source: routes/cp.routes.js:19-33 (before line 36 protect mount); cp.controller.js:36-62`
10. **Soft-delete leakage.** `users` model is `paranoid`. A soft-deleted CP whose row carries OTP fields could theoretically be hit by send-OTP if `paranoid` is bypassed via `.unscoped()`. Verify `User.findOne` calls in auth controller respect `deletedAt`.
