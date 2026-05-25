# FSD — SM Portal: Login & Auth
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Sales Manager portal uses a passwordless OTP flow built on the same controller (`auth.controller.js`) used by Admin, CP, and Buyer. Authentication is keyed by `userType` (`sales_manager_admin` or `sales_manager`), which the auth routes attach to the request body via middleware. A single shared route handler resolves a role-scoped user from the `users` table, generates a 6-digit numeric OTP, persists it, dispatches it via the WhatsApp gateway and (for non-NRI) Epinet SMS, and returns a JWT on successful verification.

Key controller routes:
- `POST /api/v1/auth/sales-manager/send-otp` → `sendOtpV3` // Source: source-code/backend/src/routes/auth.routes.js:32
- `POST /api/v1/auth/sales-manager/verify-otp` → `verifyOtp` // Source: source-code/backend/src/routes/auth.routes.js:40

Notes:
- The `/sales-manager/send-otp` and `/sales-manager/verify-otp` routes use `addUserTypeMiddleware()` *without a default* so the `userType` comes from `req.body.role` — the caller MUST send `role: "sales_manager"` or `role: "sales_manager_admin"`. // Source: source-code/backend/src/routes/auth.routes.js:15-18, 32, 40
- Both SM Admin and SM share the same login endpoint; differentiation happens server-side via `roleId`.

---

## 2. Data Model

Source: `source-code/backend/src/models/user.model.js`

OTP / session fields on `users`:
| Field | Type | Purpose | Source |
|---|---|---|---|
| `roleId` | BIGINT UNSIGNED FK → roles.id | Role discriminator (4 = SM Admin, 5 = SM) | user.model.js:71-75 |
| `otp` | STRING(6), nullable | Last-generated OTP, cleared after successful verify | user.model.js:187-190 |
| `otpExpires` | DATE, nullable | Expiry timestamp for current OTP | user.model.js:191-194 |
| `lastOtpSentAt` | DATE, nullable | Timestamp of last OTP dispatch | user.model.js:200-203 |
| `isActive` | BOOLEAN | Blocks login if false | user.model.js:305 (referenced); auth.controller.js:517-519 |
| `phone` | STRING(15) | Identifier for SM login | user.model.js:107-109 |
| `countryCode` | STRING(5) | Always coerced to `+91` for SM/admin flows | auth.controller.js:122 |
| `lastLogin` | DATE | Set on successful verify | auth.controller.js:859 |

Role mapping:
```js
roleNameIdMap = { admin: 1, user: 2, cp: 3, sales_manager_admin: 4, sales_manager: 5 }
```
// Source: source-code/backend/src/constants/global.js:15-21

---

## 3. State Machines

### OTP record state (per user row)

```
[NULL / cleared]
    │  send-otp success
    ▼
[ACTIVE: otp set, otpExpires = now + OTP_EXPIRY_MINUTES]
    │
    ├── verifyOtp called within window & otp matches ──► [CLEARED: otp=null, otpExpires=null, lastLogin=now]
    ├── verifyOtp called after otpExpires             ──► remains ACTIVE; controller returns 401 "Invalid OTP"
    └── send-otp called again                          ──► OVERWRITES otp + otpExpires + lastOtpSentAt
```
// Source: source-code/backend/src/controllers/auth.controller.js:571-577 (set), 734 (expiry check), 857-859 (clear)

### Session state

```
[Unauthenticated]
    │  verifyOtp returns { token }
    ▼
[Authenticated: JWT in Authorization header or jwt cookie]
    │  TTL = JWT_EXPIRES_IN (default '1d')
    ▼
[Expired]  →  protect middleware → 401 "Your session has expired! Please log in again!"
```
// Source: source-code/backend/src/middleware/auth.middleware.js:35-45, 83-86; source-code/backend/src/config/app.js:74-79

---

## 4. Business Rules

1. **Role-based pre-existence guard (SM Admin & SM)** — `User.findOne({ where: { phone, roleId } })`. If no user exists for `userType in {admin, sales_manager_admin, sales_manager}`, send-otp returns 400 "User not found". Auto-creation is **only** allowed for `cp`. // Source: source-code/backend/src/controllers/auth.controller.js:511-515, 522-528

2. **Revoked access guard** — If the matched user has `isActive === false`, send-otp returns 400 "Your access to the portal has been revoked". // Source: source-code/backend/src/controllers/auth.controller.js:517-519

3. **Country code forced to +91** — For non-NRI/admin/SM flows, `effectiveCountryCode` is hard-coded to `+91`. // Source: source-code/backend/src/controllers/auth.controller.js:122

4. **OTP generation** — `Math.floor(100000 + Math.random() * 900000).toString()` produces a 6-digit numeric string. No `crypto.randomInt`, no rate-limit check is enforced (cooldown block is fully commented out). // Source: source-code/backend/src/controllers/auth.controller.js:52-54, 561-568

5. **OTP expiry window** — `OTP_EXPIRY_MINUTES` env (default `10`), set as `dayjs().add(otpConfig.expiryMinutes, 'minute')`. // Source: source-code/backend/src/controllers/auth.controller.js:572; source-code/backend/src/config/app.js:84

6. **OTP delivery channels** — For SM (phone present, nri=false):
   - WhatsApp via Botspice (`sendWhatsAppMessage` template `otp_send`, category `AUTHENTICATION`). // Source: source-code/backend/src/controllers/auth.controller.js:590-592
   - SMS via Epinet (`sendOTP` → `https://epinetinfo.in/api/pushsms?…sender=THOAL&entityid=1001286607558438702&templateid=1007393289666667759`). // Source: source-code/backend/src/services/api/whatsapp.service.js:101, 122; SMS_TEMPLATES.OTP at whatsapp.service.js:54-59
   - No Kaleyra in this path. // Source: NOT FOUND in `auth.controller.js` or `whatsapp.service.js` OTP path — `kaleyra.service.js` exists but is not imported by `sendOtpV3`.

7. **Master OTP bypass (admin/SM/SM admin)** — If `Number(otpConfig.adminMasterOtp) === otp`, OTP value/expiry checks are skipped. SM and SM Admin use `ADMIN_MASTER_OTP` env. // Source: source-code/backend/src/controllers/auth.controller.js:725-731; source-code/backend/src/config/app.js:81-86

8. **Generic invalid-OTP response** — Wrong phone returns same 401 "Invalid OTP" as wrong code (anti-enumeration). // Source: source-code/backend/src/controllers/auth.controller.js:718-722

9. **Verify flow side-effects** — On success: `otp=null`, `otpExpires=null`, `lastLogin=new Date()`, `lsq.mx_OTP_Verified=Yes` (best-effort, errors swallowed). // Source: source-code/backend/src/controllers/auth.controller.js:854-861

10. **JWT issuance** — `jwt.sign({ id: userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })`. Payload contains ONLY `id`; role is re-derived on every protected request. // Source: source-code/backend/src/controllers/auth.controller.js:25-29; source-code/backend/src/middleware/auth.middleware.js:47-62

11. **Role routing (SM Admin vs SM)** — Both share `verifyOtp`. The response includes a `permissions` map for both roles (built from `RolePermission`). Distinction is enforced at the route layer:
    - `router.use(restrictTo('sales_manager_admin', 'sales_manager'), commonRoutes)` — both SM roles. // Source: source-code/backend/src/routes/sales-manager/index.js:11
    - `router.use('/admin', restrictTo('sales_manager_admin'), smAdminRoutes)` — SM Admin only. // Source: source-code/backend/src/routes/sales-manager/index.js:14
    - SM Admin is NOT a UI tab; it is a backend role discriminator (roleId 4 vs 5).

12. **Token transport** — `protect` accepts either `Authorization: Bearer <jwt>` or cookie `jwt`. // Source: source-code/backend/src/middleware/auth.middleware.js:35-39

---

## 5. Notification Dispatch

| Event | Channel | Provider | Template / Function | Source |
|---|---|---|---|---|
| OTP request (SM/SM Admin, IN phone) | WhatsApp | Botspice (`whatsappClient.post('api/wappBroad/triggerwam')`) | `otp_send`, category `AUTHENTICATION`, lang `en` | auth.controller.js:590-592; whatsapp.service.js:11-22 |
| OTP request (SM/SM Admin, IN phone) | SMS | **Epinet** (`https://epinetinfo.in/api/pushsms`) | template `OTP` → templateId `1007393289666667759`, entityId `1001286607558438702`, sender `THOAL` | whatsapp.service.js:54-59, 92-119; called via `sendOTP` at auth.controller.js:595 |
| OTP request via `email` channel | Email | `communicationService.sendOtp` | n/a (SM flows do not pass email in send-otp UI) | auth.controller.js:604-613 |
| Logout | none | — | Response only; cookie clearing block is commented out | auth.controller.js:36-46 |

Notes:
- The WhatsApp call is fire-and-forget (no `await`). // Source: auth.controller.js:590
- `sendOTP(${91}${phone}, otpCode)` hard-codes the prefix `91` (template-literal `${91}`). Country code variable is ignored on the SMS path. // Source: auth.controller.js:595
- WhatsApp + SMS both fire only when `phone` exists and `nri === false`. // Source: auth.controller.js:587-600
- Kaleyra service file exists (`services/kaleyra*.js`) but is NOT invoked from the OTP code path. // Source: NOT FOUND — no `import` of `kaleyra*` in `auth.controller.js`.

---

## 6. API Endpoints

All routes are prefixed with `/api/v1`. // Source: source-code/backend/src/routes/index.js:70

| Method | Path | Auth | Controller | Source |
|---|---|---|---|---|
| POST | `/auth/sales-manager/send-otp` | Public | `sendOtpV3` | auth.routes.js:32 |
| POST | `/auth/sales-manager/verify-otp` | Public | `verifyOtp` | auth.routes.js:40 |
| POST | `/auth/logout` | `protect` | `logout` | auth.routes.js:44 |

### Request bodies

`send-otp` — validated by `sendOtpSchema` (Yup):
```json
{ "role": "sales_manager" | "sales_manager_admin", "phone": "8888888888" }
```
// Source: source-code/backend/src/validations/auth.validations.js:40-67; route at auth.routes.js:32 calls `addUserTypeMiddleware()` so `userType` is read from `req.body.role`.

`verify-otp` — validated by `verifyOtpSchema`:
```json
{ "role": "sales_manager" | "sales_manager_admin", "phone": "8888888888", "otp": "258369" }
```
// Source: source-code/backend/src/validations/auth.validations.js:125-153

### Success response (verify)
```json
{
  "status": "success",
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "name": "...", "firstName": "...", "lastName": "...",
      "role": "sales_manager" | "sales_manager_admin",
      "phone": "...", "countryCode": "+91", "email": null,
      "permissions": { "<moduleId>": ["<actionId>", ...] }
    },
    "token": "<JWT>"
  }
}
```
// Source: source-code/backend/src/controllers/auth.controller.js:740-866

### Error responses

| Code | Message | Trigger | Source |
|---|---|---|---|
| 400 | `Invalid user type` | `roleId` undefined for given `userType` | auth.controller.js:125 |
| 400 | `Phone number is required` | SM/admin call without `phone` | auth.controller.js:508 |
| 400 | `User not found` | No row in `users` matching `{phone, roleId}` | auth.controller.js:513-515 |
| 400 | `Your access to the portal has been revoked` | `user.isActive === false` | auth.controller.js:517-519 |
| 401 | `Invalid OTP` | User not found OR wrong OTP OR expired | auth.controller.js:718, 734-737 |
| 401 | `Invalid session. Please log in again!` | Missing/invalid JWT on protected route | auth.middleware.js:43, 81 |
| 401 | `Your session has expired! Please log in again!` | `TokenExpiredError` | auth.middleware.js:83-86 |
| 500 | `Something went wrong, please try again!` | Uncaught controller error | auth.controller.js:621-624 |

---

## 7. Known Bugs / Gaps

1. **No OTP rate limiting** — the cooldown block (`otp.cooldownMinutes`) is fully commented out (lines 558-568). Same phone can request OTP unlimited times back-to-back, each overwriting the prior `otp`/`otpExpires`. // Source: source-code/backend/src/controllers/auth.controller.js:558-568

2. **Predictable OTP source** — `Math.random()` is not a cryptographic RNG; OTPs are guessable in principle and across processes if seeded predictably. // Source: source-code/backend/src/controllers/auth.controller.js:53

3. **`${91}` literal in SMS path** — `sendOTP(`${91}${phone}`, otpCode)` ignores `effectiveCountryCode`; NRI SMs (if ever onboarded) would silently fail to receive SMS at the right country prefix. // Source: source-code/backend/src/controllers/auth.controller.js:595

4. **WhatsApp dispatch is fire-and-forget** — `sendWhatsAppMessage` for OTP is not awaited; any 5xx from Botspice is logged but not surfaced; user may see "OTP sent" with no actual delivery. // Source: source-code/backend/src/controllers/auth.controller.js:590-592

5. **`/auth/sales-manager/send-otp` defaults `userType` to `undefined`** — `addUserTypeMiddleware()` is called with no argument; if frontend forgets `role` in body, `roleNameIdMap[undefined]` is `undefined` and controller throws 400 "Invalid user type" — a footgun if any UI form change drops the field. // Source: source-code/backend/src/routes/auth.routes.js:15-18, 32

6. **`logout` does nothing server-side** — cookie clearing is commented out, JWT remains valid until expiry. Real logout must be client-driven by discarding the token. // Source: source-code/backend/src/controllers/auth.controller.js:36-46

7. **JWT secret has a hard-coded fallback** — if `JWT_SECRET` env is unset, a 64-byte hex literal is used. UAT/prod must override. // Source: source-code/backend/src/config/app.js:74-79

8. **Master OTP env may be unset** — `Number(otpConfig.adminMasterOtp || null)` becomes `NaN` if env missing; comparison `otp === NaN` is always false, so this fails closed. // Source: source-code/backend/src/controllers/auth.controller.js:725-727

9. **`role` vs `userType` field overload** — `addUserTypeMiddleware()` reads `req.body.role` and writes `req.body.userType`. Yup `verifyOtpSchema` validates `userType` and defaults it to `'user'` if absent — silent role coercion if middleware fails to set it. // Source: auth.routes.js:15-18; auth.validations.js:128-130

10. **`lastLogin` field referenced but commented in model** — `user.lastLogin = new Date()` is written in controller, but the `lastLogin` column appears commented out in `user.model.js:321`. Verify the column actually exists in the live schema. // Source: NOT FOUND — column declaration is commented at user.model.js:321; controller assignment at auth.controller.js:859 may rely on an external migration.

---

## 8. QA Risk Areas

1. **OTP brute force** — no rate limit, no max-attempt lockout, OTP space is 9 × 10⁵. Verify whether infra (WAF / API gateway) compensates; test 100+ rapid `verify-otp` calls per phone.
2. **Master OTP exposure** — `ADMIN_MASTER_OTP` env in any non-prod environment is effectively a backdoor. Test that it is unset or rotated in UAT and never logged.
3. **Role privilege escalation** — `restrictTo('sales_manager_admin')` is the only thing protecting `/sales-manager/admin/*`. Confirm a `sales_manager` (roleId 5) JWT returns 403 on every SM-admin route (`/callback-requests/assignable-users`, `/callback-requests/assign`).
4. **Race on OTP send** — two simultaneous `send-otp` calls for the same SM may both succeed; only the latter `otp` persists. Verify the earlier OTP no longer works (it should not — `otp` column was overwritten).
5. **JWT only carries `id`** — if an SM Admin is demoted to SM (roleId 4 → 5) mid-session, their existing JWT still resolves with the new `roleId` via `User.findByPk(decoded.id)` — but already-issued `permissions` cached client-side will be stale. Verify UI re-fetches permissions.
6. **`isActive` toggle** — disabling an SM via Admin Portal should immediately invalidate their next request. `protect` only checks user existence, not `isActive`. // Source: auth.middleware.js:49-57 — no `isActive` check. Test that disabled SM with a valid JWT can still hit protected routes.
7. **Country code coercion** — every SM is treated as +91 regardless of profile. Test a foreign-number SM (if onboardable).
8. **Channel partial failure** — if Botspice WhatsApp is down but Epinet succeeds (or vice-versa), user receives only one channel; UI says "OTP sent". Test independent channel outages.
9. **Email channel dead code path** — `channels.push('email')` branch (lines 582-585) sets `communicationService.sendOtp` for email. SM `send-otp` UI does not send `email`, but a malicious caller could. Verify the email path is either fully supported or 400-rejected for SM.
10. **`lastLogin` schema drift** — confirm via DB inspection that the column exists; if not, every successful SM login throws a Sequelize error that is caught and returned as generic 500 — masking the real failure.

---

*End of FSD — SM Portal: Login & Auth*
