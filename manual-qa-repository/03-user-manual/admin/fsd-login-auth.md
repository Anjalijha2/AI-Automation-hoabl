# FSD — Login / Authentication Module

**Document Type**: Source-code-verified Feature Specification Document
**Module**: Authentication (Login / OTP / JWT / Session)
**Portals Covered**: Admin, Sales Manager (SM Admin + SM), Channel Partner (CP), Buyer (User)
**Source Repo Root**: `source-code/backend/src/`
**Generated**: 2026-05-22
**Authority**: Source code only. Not derived from BRD/FRD.

---

## 1. Module Overview

The XR Portal exposes a **single authentication subsystem** that serves all four portals (Admin, Sales Manager, Channel Partner, Buyer) over the same controller (`auth.controller.js`) and route file (`auth.routes.js`). Authentication is **passwordless** — login is via Mobile OTP (plus email-OTP for NRI buyers). Sessions are stateless JWT bearer tokens. There is no password login flow exposed (the User model has a `password` field with bcrypt hashing, but no controller invokes `isValidPassword` in this codebase).

Key design points (verified):
- **Per-portal endpoint pairs** (`/auth/<portal>/send-otp` + `/auth/<portal>/verify-otp`) all dispatch to the same `sendOtpV3` and `verifyOtp` controller functions; the route declares the `userType` via a `addUserTypeMiddleware`. Source: `routes/auth.routes.js:15-40`.
- **Role determination** is by `userType` on the request body, mapped to a `roleId` via `roleNameIdMap`. Source: `constants/global.js:15-21`.
- **Sales Manager portal** is split into two roles at the backend (`sales_manager_admin` and `sales_manager`); the `/sales-manager/send-otp` route trusts the client-supplied `req.body.role` rather than hard-coding (`addUserTypeMiddleware()` called with no arg). Source: `routes/auth.routes.js:32, 15-18`.
- **OTP delivery**: SMS via `epinetinfo.in` (HOABLDIGITAL sender, not Kaleyra in this build) + WhatsApp via `botspice`. The Kaleyra services (`kaleyra-sms.service.js`, `kaleyra-whatsapp.service.js`) and the `communicationService.sendOtp` SMS/WhatsApp branches are present but commented out. Source: `services/api/whatsapp.service.js:92-122`, `services/communication.service.js:8-22, 56-91`.
- **LeadSquared CRM integration** is mandatory for Buyer (`user`) and CP send-OTP flows (LSQ lead + opportunity capture). Strapi is not touched by this module.

---

## 2. API Reference Table

All endpoints are mounted at `/api/v1/auth` (Source: `routes/index.js:70`, `app.js` root mount). Every send/verify route passes through `validateRequest` (Yup) before reaching the controller.

| Method | URL | userType injected | Validation Schema | Controller | Middleware |
|--------|-----|-------------------|--------------------|-----------|------------|
| POST | `/api/v1/auth/user/send-otp` | `user` (forced) | `sendOtpSchema` (`stripUnknown: false`) | `sendOtpV3` | `addUserTypeMiddleware('user')` |
| POST | `/api/v1/auth/cp/send-otp` | `cp` (forced) | `sendOtpSchema` | `sendOtpV3` | `addUserTypeMiddleware('cp')` |
| POST | `/api/v1/auth/admin/send-otp` | `admin` (forced) | `sendOtpSchema` | `sendOtpV3` | `addUserTypeMiddleware('admin')` |
| POST | `/api/v1/auth/sales-manager/send-otp` | `req.body.role` (client-supplied) | `sendOtpSchema` | `sendOtpV3` | `addUserTypeMiddleware()` |
| POST | `/api/v1/auth/user/verify-otp` | `user` (forced) | `verifyOtpSchema` | `verifyOtp` | `addUserTypeMiddleware('user')` |
| POST | `/api/v1/auth/cp/verify-otp` | `cp` (forced) | `verifyOtpSchema` | `verifyOtp` | `addUserTypeMiddleware('cp')` |
| POST | `/api/v1/auth/admin/verify-otp` | `admin` (forced) | `verifyOtpSchema` | `verifyOtp` | `addUserTypeMiddleware('admin')` |
| POST | `/api/v1/auth/sales-manager/verify-otp` | `req.body.role` (client-supplied) | `verifyOtpSchema` | `verifyOtp` | `addUserTypeMiddleware()` |
| POST | `/api/v1/auth/logout` | n/a | none | `logout` | `protect` (JWT) |

Source: `routes/auth.routes.js:20-44`.

`addUserTypeMiddleware` body: sets `req.body.userType = userType ?? req.body.role`. When invoked with no argument (sales-manager routes), it falls back to whatever the client sends in `role`. Source: `routes/auth.routes.js:15-18`.

> **NOTE — SM route role-trust**: The SM send/verify routes do not constrain `req.body.role` to `sales_manager_admin` or `sales_manager` at the route layer. Constraint comes from the Yup `oneOf` whitelist in `sendOtpSchema` / `verifyOtpSchema`. Source: `validations/auth.validations.js:43, 129`.

---

## 3. Feature Details

### 3.1 Send OTP — `sendOtpV3`
Source: `controllers/auth.controller.js:118-625`.

**Pipeline (in order):**

1. **Extract body**: `{ phone, email, countryCode, userType, nri, hvCode, sessionId, fullUrl, utm_*, gad_*, gbraid, gclid }`. Source: `controllers/auth.controller.js:120`.
2. **Resolve roleId** from `userType` via `roleNameIdMap`. Throws `400 'Invalid user type'` if not in map. Source: `controllers/auth.controller.js:121, 125`.
3. **Resolve country code**: For Buyer NRI, accept client `countryCode` or default `+91`; for everyone else (including Buyer non-NRI), force `+91`. Source: `controllers/auth.controller.js:122`.
4. **Identifier presence**: must have at least phone or email (`400 'Either phone number or email is required'`). Source: `controllers/auth.controller.js:126`.
5. **Resolve project**: hardcoded `projectId = 1` in production, `2` otherwise. Lookup `Project.findByPk(projectId)`. Source: `controllers/auth.controller.js:130-134`.
6. **Branch by userType**:
   - **Buyer (`user`)** — branches further by `nri` boolean (see §6.4 for buyer flow).
   - **`admin`, `cp`, `sales_manager_admin`, `sales_manager`** — single branch (see §3.1.b).
7. **Generate OTP**: 6 random digits `100000-999999`. Source: `controllers/auth.controller.js:52-54, 571`.
8. **Set expiry**: `now + otp.expiryMinutes` (default 10 min). Source: `controllers/auth.controller.js:572`, `config/app.js:81-86`.
9. **Persist** `otp`, `otpExpires`, `lastOtpSentAt` on `User`. Source: `controllers/auth.controller.js:574-577`.
10. **Dispatch OTP** (see §7 OTP Rules).
11. **Response**: `200 { status, message: 'OTP sent successfully', data: { phone, [email], otpExpires } }`. Source: `controllers/auth.controller.js:620`.

#### 3.1.a Cooldown
**Not enforced.** A cooldown block exists but is commented out. Source: `controllers/auth.controller.js:557-568`. `otp.cooldownMinutes` (default 2) is set in config but never read. Source: `config/app.js:85`.

#### 3.1.b Admin / SM Admin / SM / CP branch
Source: `controllers/auth.controller.js:507-555`.

- Requires `phone`. Else `400 'Phone number is required'`. Source: `:508`.
- Lookup `User.findOne({ where: { phone, roleId } })`.
- If not found AND `userType ∈ {admin, sales_manager_admin, sales_manager}` → `400 'User not found'`. Source: `:513-515`.
- If found AND `user.isActive === false` → `400 'Your access to the portal has been revoked'`. Source: `:517-519`.
- If not found AND `userType === 'cp'` → **auto-create** a CP user record with `{phone, countryCode: '+91', roleId}`. Source: `:522-528`.
- For CP only: if `user.isCpRegistrationCompleted`, validate `user.prospectId` exists and matches first lead returned by `lsqLeadService.getLeadById`. Any failure → `500 'Something went wrong, please try again!'`. Source: `:533-554`.

#### 3.1.c Buyer non-NRI branch (`user`, `nri !== true`)
Source: `controllers/auth.controller.js:336-503`.

- Requires `phone`. Else `400 'Phone number is required'`. Source: `:338`.
- Lookup `User.findOne({ where: { phone, roleId, isNri: false } })`.
- Check active registration (`status != Refund`) for current project. Source: `:342-345`.
- If user missing OR no `prospectId` OR no active registration:
  - Re-check phone existence under same role. If exists as NRI → `409 'Number already registered as NRI.'`; else `409 'Provided phone number is already registered'`. Source: `:347-358`.
  - Create LSQ lead → get `prospectId` (`captureLsqLead`). Source: `:361-379`.
  - Create LSQ opportunity (EventCode 12000, "Growth Registration", fields incl. UTM/gad_*/HV code). Failure → `500`. Source: `:381-436`.
  - DB transaction: create/update User (with `prospectId`, `brokerXrCode`); create Registration row if absent (status `Open`, paymentStatus `pending`). Source: `:438-487`.
- Else (existing user with prospect + active reg) — re-validate prospect in LSQ via `validateExistingBuyerProspectInLeadSquared`. Failure → `500`. Source: `:488-500`.

#### 3.1.d Buyer NRI branch (`user`, `nri === true`)
Source: `controllers/auth.controller.js:158-335`.

- Requires both `phone` and `email`. Else `400`. Source: `:159-161`.
- Lookup `User.findOne({ where: { phone, roleId, isNri: true } })`.
- If found and stored email != supplied email → `409 'Email address does not match with the phone number'`. Source: `:166-168`.
- Same active-registration & creation logic as non-NRI but lead payload includes `EmailAddress`, and conflict error on duplicate phone differentiates NRI vs Indian:
  - Phone exists as non-NRI → `409 'Number already registered as Indian national.'`. Source: `:180-182`.
  - Phone exists as NRI → `409 'Provided phone number is already registered.'`. Source: `:184-187`.
- HV-code decryption: if `hvCode` provided, `decrypt(hvCode)` and extract trailing path segment after `/`. Stored on user as `brokerXrCode`. Source: `:142-150, 282`.

### 3.2 Verify OTP — `verifyOtp`
Source: `controllers/auth.controller.js:668-871`.

**Pipeline:**

1. **Extract**: `{ email, phone, userType, nri, isConsented, nurixSessionId }`, `otp` coerced to Number. Source: `:670-671`.
2. **OTP presence** check (`400 'OTP is required'`). Source: `:674-676`.
3. **Build where-clause** by userType + NRI:
   - NRI buyer: `{roleId, isNri: true, phone, email}`. Else `400 'Both email and phone are required for NRI users'`. Source: `:686-694`.
   - Else require `phone`. `whereClause.phone = phone`. Else `400 'Phone number is required'`. Source: `:695-703`.
4. **Lookup user**. NRI fallback: if not found by phone+email, retry by phone-only with isNri=true. Source: `:705-716`.
5. **Generic invalid response**: `401 'Invalid OTP'` (used for both no-user and bad-OTP to prevent enumeration). Source: `:718-722`.
6. **Master OTP**:
   - For admin/SM-admin/SM: compare against `otpConfig.adminMasterOtp`.
   - For cp/user: compare against `otpConfig.masterOtp`.
   - Match → skip OTP validation. Source: `:724-731`.
7. **Regular OTP validation**: `user.otp` exists, numeric-equals supplied OTP, and `new Date() <= user.otpExpires`. Failure → push `mx_OTP_Verified = 'No'` to LSQ and return `401`. Source: `:732-738, 649-663`.
8. **Build `userResponse`** with name, role, PAN, pincode, address, email, phone, countryCode, isNri. Source: `:740-752`.
9. **CP-specific branch** (`userType === 'cp'`): backfill `encryptedHvCode`; include `isConsented`, `isCpRegistrationCompleted`, `encHvCode`, `hvCode`, `orgName`, `isLeadCp`, `masterHvCode`. Source: `:755-768`.
   - **Consent gating** (CP only):
     - If `!user.isConsented`:
       - `isConsented === true` in request → mark consent complete (saved later).
       - `isConsented === false` → save `isConsented = false` and return `200 { consentDeclined: true }` with message `'Consent Declined'`. No JWT issued. Source: `:770-779`.
       - Otherwise → return `200 { user }` with message `'Consent Pending'`. No JWT issued. Source: `:780-784`.
     - If consent already true but `!isCpRegistrationCompleted` → return `200 { user }` with message `'Registration Pending'`. No JWT issued. Source: `:786-789`.
     - Else compute `isJbpSubmitted` from `JbpSubmission` count. Source: `:791-793`.
10. **Permissions hydration** (roles `admin`, `cp`, `sales_manager_admin`, `sales_manager`): `getPermissions(roleId)` returns flat `[{permissionId, moduleId, actionId}]`; controller groups into `userResponse.permissions = { [moduleId]: [actionId, ...] }`. Source: `:796-812, 627-647`.
11. **Buyer-specific branch** (`userType === 'user'`):
    - Add `isRegistered` boolean (presence of `registrationNumber`).
    - `nurixSessionId` handling: maintain `{ ssId, sessionId }` JSON on user; `ssId` is `YYYYMMDDHHmmssSSS` of first verify. Source: `:814-852`.
12. **Mark LSQ verified**: `updateOtpVerificationStatus(prospectId, true)`. Source: `:854, 649-663`.
13. **Clear OTP fields**: `user.otp = null`, `user.otpExpires = null`, `user.lastLogin = new Date()`, save. Source: `:856-861`.
14. **Generate JWT** via `generateToken(user.id)`. Source: `:864, 25-29`.
15. **Response**: `200 { status, message: 'OTP verified successfully', data: { user: userResponse, token } }`. Source: `:866`.

### 3.3 Logout — `logout`
Source: `controllers/auth.controller.js:36-46`. Protected by `protect`. Returns `200 { status: 'success', message: 'Logged out successfully' }`. JWT is **stateless**; no server-side invalidation, no blacklist, no cookie clearing (cookie-clear code is commented). Logout is effectively client-side token discard.

---

## 4. Data Models

### 4.1 `User` (table `users`)
Source: `models/user.model.js`. Sequelize, `paranoid: true` (soft-delete), `underscored: true`.

| Field | Type | Notes |
|-------|------|-------|
| `id` | BIGINT UNSIGNED PK auto-increment | |
| `roleId` | BIGINT UNSIGNED FK → `roles.id` | Required. Determines portal access. |
| `isNri` | BOOLEAN default false | NRI gating for Buyer flow. |
| `prospectId` | STRING(100) | LeadSquared prospect identifier (line 80-83). |
| `xrCode` | STRING(100) | Xanadu referrer code (line 84-87). |
| `hvCode` | STRING(50) nullable | Channel Partner HV code. |
| `encryptedHvCode` | STRING(255) nullable | Encrypted HV (backfilled in verifyOtp). |
| `firstName`, `lastName` | STRING(100) | |
| `countryCode` | STRING(5) | |
| `phone`, `phone2`, `nriIndianPhone` | STRING(15) | |
| `email`, `email2` | STRING(100) | |
| `ownerName`, `orgName` | STRING(100) | CP business info. |
| `panNumber` | STRING(10) | |
| `reraNumber` | STRING(30) | |
| `address`, `pincode`, `city`, `state`, `country`, etc. | STRING | Personal + office address blocks. |
| `password` | STRING nullable | Bcrypt-hashed via `beforeSave` hook; **not used by login flow** in current codebase. |
| `passwordChangedAt` | DATE nullable | Used by `changedPasswordAfter` helper (referenced only in `isAuthenticated`). |
| `otp` | STRING(6) nullable | Current OTP. Cleared on successful verify. |
| `otpExpires` | DATE nullable | OTP expiry timestamp. |
| `nurixSessionId` | JSON nullable | `{ ssId, sessionId }` for Buyer AI chatbot session. |
| `lastOtpSentAt` | DATE nullable | Set on every OTP send. |
| `documents` | JSON nullable | User-level document blob paths (e.g. phone QR). |
| `occupation`, `industry`, `companyName` | STRING(100) | |
| `homeLoanOptedOut` | BOOLEAN default false | |
| `homeLoanEmpType` | ENUM `salaried`, `self_employed` | |
| `homeLoanMonthlyIncome`, `homeLoanAnnualProfit`, `homeLoanAnnualTurnover`, `homeLoanMonthlyOutgoingEmi` | DECIMAL(12,2) | |
| `homeLoanBankSelected` | JSON | |
| `homeLoanStep` | TINYINT UNSIGNED | 1, 2, or null. |
| `brokerId` | INTEGER nullable | |
| `brokerXrCode` | STRING(100) nullable | HV code captured on send-OTP (decrypted). |
| `brokerReferralStatus` | ENUM `pending`, `approved`, `rejected` | |
| `isCpRegistrationCompleted` | BOOLEAN | Gates CP login (returns 'Registration Pending' if false). |
| `isLeadCp` | BOOLEAN default false | Master CP flag. |
| `leadCpId` | BIGINT UNSIGNED nullable | FK self-ref → master CP. |
| `masterHvCode` | STRING(50) nullable | Master CP's HV code. |
| `smUserId` | BIGINT UNSIGNED nullable | Sales manager mapping (for CP). |
| `isAvailable` | TINYINT UNSIGNED default 1 | SM availability for ticket assignment. |
| `isActive` | BOOLEAN default true | Login gate for admin/SM/SM-admin (`'Your access to the portal has been revoked'`). |
| `isConsented` | BOOLEAN nullable | CP consent (1/0/NULL). |
| `lastRequestAssignedAt` | DATE nullable | Round-robin tracker for SM callback assignment. |
| `createdBy`, `updatedBy` | INTEGER nullable | |
| `deletedAt` | DATE nullable | Soft-delete column (paranoid). |

> Note — `lastLogin` is referenced in controller (`user.lastLogin = new Date(); await user.save();` at `:859-861`) but the field declaration is commented out in the model (`models/user.model.js:321-324`). Sequelize will silently drop this assignment unless the column is added via migration. **Potential bug / known constraint.**

**Hidden by toJSON**: `password`, `otp`, `otpExpires`, `createdAt`, `updatedAt`. Source: `models/user.model.js:40-44`.

**Hooks**:
- `beforeSave` — if `password` changed, bcrypt-hash with cost 10 and set `passwordChangedAt`. Source: `models/user.model.js:348-355`.

**Associations**: `belongsTo Role`; `hasMany UserScore as 'scores'`; `hasMany Registration as 'Registrations' (foreignKey: brokerId)`; self-ref `belongsTo User as 'masterCp' (leadCpId)` / `hasMany 'memberCps'`; `hasMany CallbackRequest as 'CallbackRequests' (managerId)`; `belongsTo User as 'smUser' (smUserId)`. Source: `models/user.model.js:47-61`.

### 4.2 `Role` (table `roles`)
Source: `models/role.model.js`. Fields: `id`, `name` (unique 2-50 chars), `description`, `isActive`, `createdBy`, `updatedBy`, `deletedAt`. Paranoid. Seeded values map 1→admin, 2→user, 3→cp, 4→sales_manager_admin, 5→sales_manager (per `constants/global.js:15-29`).

### 4.3 `Permission` (table `permissions`)
Source: `models/permission.model.js`. Fields: `id`, `moduleId` FK→modules, `actionId` FK→actions, timestamps, paranoid. Junction object linking a module + action.

### 4.4 `RolePermission` (table `role_permissions`)
Source: `models/role-permission.model.js`. Fields: `id`, `roleId` FK→roles, `permissionId` FK→permissions, timestamps, paranoid. Many-to-many bridge.

### 4.5 Token Storage
**No DB-side token/session model exists.** JWT is stateless. Server holds no record of issued tokens. Revocation = client-side discard only.

---

## 5. Role & Permission Matrix

### 5.1 Role Determination

Roles are determined **entirely from the request `userType`** (or `req.body.role` for SM routes), which is then mapped to a `roleId`:

```
admin               → roleId 1
user (Buyer)        → roleId 2
cp                  → roleId 3
sales_manager_admin → roleId 4
sales_manager       → roleId 5
```
Source: `constants/global.js:15-21`.

A user is found by `(phone, roleId)` pair, so the same phone number can theoretically exist under multiple roles. **However**, for Buyer the lookup also keys on `isNri`, and the controller throws `409` if the same phone is registered in the opposite NRI status (`controllers/auth.controller.js:180-187, 352-356`).

### 5.2 Permission Hydration

For roles in `PERMISSION_ROLES = { admin, cp, sales_manager_admin, sales_manager }`, `verifyOtp` queries `role_permissions` joined with `permissions` and returns a grouped map:

```json
{
  "permissions": {
    "<moduleId>": ["<actionId>", "<actionId>", ...]
  }
}
```
Source: `controllers/auth.controller.js:796-812, 627-647`. Buyer (`user`) never receives a `permissions` object.

### 5.3 Sales Manager Tab Logic (SM Admin vs SM)

**SM has TWO backend roles**: `sales_manager_admin` (roleId 4) and `sales_manager` (roleId 5). They are NOT determined by a UI tab — they are explicitly different DB roleId values. The frontend SM portal presents two tabs ("SM Admin" / "SM"), each of which sends the corresponding `role` string to `/auth/sales-manager/send-otp` and `/auth/sales-manager/verify-otp` (which trust the body's `role` because `addUserTypeMiddleware()` is invoked with no fixed userType). Source: `routes/auth.routes.js:32, 40, 15-18`.

Post-login, route-level enforcement separates them:
- `/api/v1/sales-manager/admin/*` is gated by `restrictTo('sales_manager_admin')`.
- Other `/api/v1/sales-manager/*` routes are gated by `restrictTo('sales_manager_admin', 'sales_manager')` (i.e. SM Admin sees everything SM sees, plus the admin subroutes).
- Source: `routes/sales-manager/index.js:8-15`.

> **Test implication**: An SM-Admin user can log in via the "SM" tab and vice-versa as long as the phone is registered to that respective role; there is no cross-blocking at the auth route. The UI tab purely controls the `role` field sent in the body.

### 5.4 `restrictTo` Middleware

Source: `middleware/auth.middleware.js:102-109`. Compares `req.user.role` (set by `protect` via `roleIdNameMap[currentUser.roleId]`) against allowed roles. Returns `403 'Forbidden'` on mismatch.

---

## 6. Auth Flow per Portal

All portals share controller code; below documents the per-portal divergences.

### 6.1 Admin Portal (`userType: admin`, roleId 1)
1. `POST /api/v1/auth/admin/send-otp` with `{ phone }`.
2. Backend lookup `User.findOne({ phone, roleId: 1 })`. If missing → `400 'User not found'`.
3. If `!isActive` → `400 'Your access to the portal has been revoked'`.
4. OTP generated, persisted, dispatched via WhatsApp (`otp_send` template, AUTHENTICATION category) + epinet SMS to `91<phone>`. Source: `controllers/auth.controller.js:590-595`.
5. `POST /api/v1/auth/admin/verify-otp` with `{ phone, otp }`.
6. Admin master OTP (`ADMIN_MASTER_OTP` env) accepted in any environment if matching. Source: `controllers/auth.controller.js:725-731`.
7. Successful verify → JWT + user object with permissions map.

### 6.2 Sales Manager Portal (`sales_manager_admin` / `sales_manager`, roleIds 4 / 5)
1. Frontend sends `role` field equal to either `sales_manager_admin` or `sales_manager` to `/auth/sales-manager/send-otp`. Yup `oneOf` enforces the whitelist.
2. Behavior identical to Admin (`User not found` if missing; `isActive` check; admin master OTP applies).
3. Post-login API routes split via `restrictTo` (see §5.3).

### 6.3 Channel Partner Portal (`cp`, roleId 3)
1. `POST /api/v1/auth/cp/send-otp` with `{ phone }`. Optional `hvCode` (encrypted) passed through decrypt.
2. **Auto-create** CP user if missing (no "User not found" error). Source: `:522-528`.
3. `isActive` check applies.
4. For CPs whose registration is complete, validate prospect exists in LeadSquared; failure → `500`.
5. OTP dispatch identical to admin (WhatsApp + epinet SMS).
6. `POST /api/v1/auth/cp/verify-otp` — non-admin master OTP (`MASTER_OTP` env) applies.
7. **Consent + Registration gating** (CP only, before JWT):
   - If `isConsented` not set and not supplied → `200 'Consent Pending'`, no JWT.
   - If supplied `isConsented = false` → `200 'Consent Declined'`, no JWT.
   - If consented but `!isCpRegistrationCompleted` → `200 'Registration Pending'`, no JWT.
   - Else → JWT issued with extended payload (`isLeadCp`, `masterHvCode`, `isJbpSubmitted`, `encHvCode`, etc.).

### 6.4 Buyer Portal (`user`, roleId 2)

Two sub-flows by `nri` boolean.

**Non-NRI (`nri: false` or absent)**
1. `POST /api/v1/auth/user/send-otp` with `{ phone, hvCode? }`. `countryCode` forced to `+91`.
2. Conflict checks against opposite-NRI status.
3. If new / no prospect / no active registration → create LSQ lead → create LSQ opportunity → DB transaction (user upsert + Registration insert with status `Open`).
4. OTP dispatched on both WhatsApp (`otp_send` template) AND epinet SMS to `91<phone>`. (Note: SMS gated by `if (!nri)`.) Source: `:594-600`.

**NRI (`nri: true`)**
1. Requires `phone`, `email`, and `countryCode` (`+<digits>` 1-3).
2. `User.findOne({ phone, roleId, isNri: true })` — if found, email must match.
3. Same LSQ lead+opportunity flow; lead payload adds `EmailAddress`.
4. **SMS is NOT sent** for NRI (only WhatsApp). Source: `:594-600`.
5. Email OTP can be sent through `communicationService.sendOtp({ channel: 'email' })` if `email` present — but is `await`ed sequentially after WhatsApp/SMS dispatch. Source: `controllers/auth.controller.js:582-585, 604-618`; template `'otp'` in `services/communication.service.js:62-68`.

`POST /api/v1/auth/user/verify-otp` returns:
- `permissions` is **NOT** included for buyer.
- `isRegistered` boolean.
- `nurixSessionId` (AI chat session id).

---

## 7. OTP Rules

### 7.1 Generation
- 6 random digits via `Math.floor(100000 + Math.random() * 900000)`. Source: `controllers/auth.controller.js:52-54`.
- **Not cryptographically secure** (`Math.random`). No salt, no signing.

### 7.2 Expiry
- `otp.expiryMinutes`: env `OTP_EXPIRY_MINUTES`, default `10` minutes. Source: `config/app.js:84`.
- Computed with dayjs and stored as `'YYYY-MM-DD HH:mm:ss'`. Source: `controllers/auth.controller.js:572`.
- Verification compares `new Date() > new Date(user.otpExpires)`. Source: `:734`.

### 7.3 Resend / Cooldown
- **No resend limit enforced.** Each call to `send-otp` overwrites `user.otp` and `user.otpExpires` and updates `lastOtpSentAt`.
- Cooldown logic exists but is commented out (`controllers/auth.controller.js:557-568`).
- Generic rate limiter (`authLimiter`: 50 req / min / IP) exists in `middleware/rate-limiter.middleware.js:37-49` but is **not attached** to the auth routes in `routes/auth.routes.js`.

### 7.4 Master OTP
- Buyer + CP: env `MASTER_OTP` (`otpConfig.masterOtp`). Source: `config/app.js:82`, `controllers/auth.controller.js:726`.
- Admin + SM + SM Admin: env `ADMIN_MASTER_OTP` (`otpConfig.adminMasterOtp`). Source: `config/app.js:83`, `controllers/auth.controller.js:726`.
- Match check: `otp === MASTER_OTP` numeric equality. Skips validity check.
- Available in **all environments** (no NODE_ENV gate in code). UAT static credentials `8888888888` / `258369` aligns with `ADMIN_MASTER_OTP`.

### 7.5 Format Validation
- `otpRegex = /^\d{6}$/`. Source: `constants/regex.js:4`.
- Enforced by Yup `verifyOtpSchema.otp` field. Source: `validations/auth.validations.js:149`.

### 7.6 OTP Verification Tracking
After every verify attempt, `updateOtpVerificationStatus(prospectId, isVerified)` pushes `mx_OTP_Verified` (`Yes`/`No`) and `mx_OTP_Verified_On` (UTC `YYYY-MM-DD HH:mm:ss`) to LeadSquared via `lsqLeadService.updateLead`. Failures are caught and only logged. Source: `controllers/auth.controller.js:649-663`.

### 7.7 Field Validation (Yup)

**`sendOtpSchema`** (`validations/auth.validations.js:40-120`):
- `userType` ∈ {user, admin, cp, sales_manager, sales_manager_admin}.
- `phone` nullable string (no format check at Yup level — phone-format `.test` is commented out).
- `email` nullable, must match `emailRegex` if present.
- `countryCode` required + `/^\+\d{1,3}$/` when (phone && nri).
- `hvCode` optional nullable.
- Conditional rule via `.test('validate-based-on-nri-status', ...)`:
  - admin/cp → require `phone`.
  - NRI → require email, phone, countryCode.
  - non-NRI user → require phone.

**`verifyOtpSchema`** (`validations/auth.validations.js:125-206`):
- Same `userType` whitelist, default `user`.
- `phone` nullable string.
- `email` nullable + regex check if present.
- `otp` **required**, must match `/^\d{6}$/`.
- `isConsented` optional boolean.
- `nurixSessionId.sessionId` optional string of digits.
- Same conditional NRI/admin/cp branching.

Phone regex `[6-9]\d{9}$` exists in `constants/regex.js:1` but is **not actually enforced** on send/verify (the relevant `.test` is commented out in the schema). Only length/numeric is validated for OTP.

---

## 8. Integration Points

### 8.1 WhatsApp (botspice)
- Service: `services/api/whatsapp.service.js:11-50` (`sendWhatsAppMessage`).
- HTTP client: `services/http/whatsappClient.js` (config in `config/communication.js`).
- Endpoint: `api/wappBroad/triggerwam`.
- Template invoked from auth: `otp_send` with `templateCategory: 'AUTHENTICATION'`, language `en`, single variable `[otpCode]`. Source: `controllers/auth.controller.js:590-593`.
- Sent to: `${effectiveCountryCode}${phone}`.
- **Fire-and-forget**: `sendWhatsAppMessage` is called WITHOUT `await` in the controller. Errors are logged inside the service, never propagated. Source: `controllers/auth.controller.js:590-592`.

### 8.2 SMS (Epinet — NOT Kaleyra in this build)
- Service: `services/api/whatsapp.service.js:92-122` (`sendSMS`) — note name lives in the whatsapp file but is the SMS sender.
- Endpoint: `https://epinetinfo.in/api/pushsms` (hard-coded URL, user `HOABLDIGITAL`, authkey embedded in source).
- DLT template id `1007393289666667759`, entity id `1001286607558438702`.
- Triggered only for `phone && !nri`. Source: `controllers/auth.controller.js:594-600`.
- Sent to: `91${phone}` (country code hard-coded to `91`, not `effectiveCountryCode`). Source: `controllers/auth.controller.js:595`.
- **Fire-and-forget** (no `await`).
- Kaleyra SMS / WhatsApp services exist as files (`services/kaleyra-sms.service.js`, `kaleyra-whatsapp.service.js`) but the import/usage in `communicationService.sendOtp` is commented out. Source: `services/communication.service.js:8-22, 70-82`.

### 8.3 Email
- `communicationService.sendOtp({ channel: 'email', ... })` uses `emailService.sendEjsEmail` with subject `'HoABL - Login Verification Code'`, template `'otp'`, data `{ otp, expiryMinutes }`. Source: `services/communication.service.js:62-68`.
- Awaited in a `for ... of` loop in controller. Source: `controllers/auth.controller.js:604-618`.
- Only triggered when `email` is supplied (i.e. NRI flow currently — non-NRI users do not supply email at OTP stage).

### 8.4 LeadSquared CRM
- `lsqLeadService.captureLead` — used in send-OTP for Buyer (NRI + non-NRI). Source: `controllers/auth.controller.js:199, 368`.
- `lsqLeadService.getLeadById` — used to validate existing buyer/CP prospect in LSQ. Source: `:82, 539`.
- `lsqLeadService.updateLead` — used to push OTP verification status. Source: `:659`.
- `lsqOpportunityService.captureOpportunity` — creates "Growth Registration" opportunity (`OpportunityEventCode: 12000`) with UTM/HV-code fields. Source: `:257, 424`.
- LSQ failures (lead capture, opportunity creation, validation) all return `500 'Something went wrong, please try again!'` to the client.

### 8.5 Nurix (AI chatbot session)
- Buyer-only, captured at verify-OTP time on `user.nurixSessionId` JSON field. Carries `{ ssId, sessionId }`. No bidirectional API; passive storage.

### 8.6 JWT
- Library: `jsonwebtoken`. Source: `controllers/auth.controller.js:1, generateToken at :25-29`.
- Payload: `{ id: userId }` only — no role, no email.
- Secret: `process.env.JWT_SECRET`. **Has a hard-coded fallback secret in `config/app.js:75-77`** — flag for production hardening.
- Expiry: `process.env.JWT_EXPIRES_IN` or default `'1d'`. Source: `config/app.js:78`.
- Transport: `Authorization: Bearer <token>` header (primary) OR `req.cookies.jwt` (fallback). Source: `middleware/auth.middleware.js:34-39`.

---

## 9. Edge Cases & Known Constraints

### 9.1 Constraints Verified in Code
- **No password login** is exposed despite User.password + bcrypt being defined. All login is OTP-only.
- **Stateless JWT** — logout returns success but cannot invalidate tokens server-side. Expired tokens rely on JWT exp claim (`'1d'`).
- **NRI lookup fallback**: if phone+email combo doesn't match in verifyOtp, retries with phone-only (still under `isNri: true`). Source: `controllers/auth.controller.js:708-716`.
- **Phone uniqueness across NRI / non-NRI**: enforced by 409 responses on send-OTP, NOT by DB uniqueness constraint. A migration could violate this if `(phone, roleId, isNri)` is not enforced unique.
- **`lastLogin` field**: assigned in controller (`:859`) but the column is commented out in the model. Either a hidden migration adds it or the assignment is silently dropped. **Inconsistency.**
- **Cooldown not enforced** — all "rate limit" logic for resending OTP is commented out.
- **`authLimiter`** rate-limit middleware exists but is **not** wired to auth routes.
- **JWT fallback secret** hard-coded in `config/app.js:76-77` if env var missing. Security risk if env is misconfigured.
- **SMS uses hard-coded `91` country code** regardless of `effectiveCountryCode`. NRI phones would receive SMS with wrong prefix (but NRI flow doesn't send SMS).
- **WhatsApp & SMS dispatch are fire-and-forget** — controller does not surface delivery failure. The user receives "OTP sent successfully" even when no message left the system.
- **Generic `Invalid OTP` for user-not-found** prevents enumeration on the verify endpoint — good. However send-OTP differentiates `'User not found'` vs `'Provided phone number is already registered'` etc., which IS enumerable.
- **Buyer non-NRI send-OTP requires LSQ + Registration to succeed**. If LSQ is down, no user can log in even if previously registered (validation runs every time via `validateExistingBuyerProspectInLeadSquared`).
- **Project is hard-coded** by NODE_ENV: production → projectId 1; otherwise → 2. Source: `controllers/auth.controller.js:130, 678`.

### 9.2 Validation Gaps
- Phone format regex (`/^[6-9]\d{9}$/`) is defined but **not applied** at the Yup level (the relevant `.test` calls are commented out). Any string passes phone validation as long as the conditional NRI rule is satisfied.
- `verifyOtpSchema.userType` defaults to `'user'` if omitted (`validations/auth.validations.js:129`); `sendOtpSchema.userType` has no default and is set by middleware.

### 9.3 Behavioural Edge Cases
- **CP `consentDeclined` does NOT issue JWT** — frontend must handle this 200-response branch separately from a successful login.
- **CP `Registration Pending` returns 200 with no JWT** — same.
- **NRI conflict messages**: switching a phone between NRI and Indian status requires backend support; UI cannot self-resolve.
- **Master OTP active in all environments** — any environment with `ADMIN_MASTER_OTP` set is bypassable. UAT uses `258369`.
- **HV code decryption**: if `decrypt(hvCode)` returns a string containing `/`, only the last segment is used; otherwise the raw decrypted value. Malformed encryption silently yields `null`.
- **`nurixSessionId.ssId` is set once and never overwritten** — used to identify first-login chat session.

### 9.4 Files Excluded
Per project constraint, the following auth-adjacent integrations are out of scope and have NOT been documented:
- Strapi CMS (no calls from this module).
- LeadSquared service internals are referenced but not opened as a separate module (LSQ is an integration boundary, not part of auth FSD).

---

## Appendix A — File Inventory Scanned

| Path | Purpose |
|------|---------|
| `source-code/backend/src/controllers/auth.controller.js` | sendOtpV3, verifyOtp, logout, generateToken, getPermissions, updateOtpVerificationStatus |
| `source-code/backend/src/routes/auth.routes.js` | All `/auth/*` route declarations + userType injection |
| `source-code/backend/src/routes/index.js` | API mount `/api/v1/auth` |
| `source-code/backend/src/routes/sales-manager/index.js` | SM route restrictTo splits |
| `source-code/backend/src/middleware/auth.middleware.js` | protect / restrictTo / isAuthenticated |
| `source-code/backend/src/middleware/rate-limiter.middleware.js` | apiLimiter / authLimiter (not wired to auth) |
| `source-code/backend/src/middleware/validateRequest.js` | Yup validation wrapper |
| `source-code/backend/src/validations/auth.validations.js` | sendOtpSchema, verifyOtpSchema |
| `source-code/backend/src/models/user.model.js` | User entity |
| `source-code/backend/src/models/role.model.js` | Role entity |
| `source-code/backend/src/models/permission.model.js` | Permission entity |
| `source-code/backend/src/models/role-permission.model.js` | RolePermission junction |
| `source-code/backend/src/constants/global.js` | httpStatus, roleNameIdMap, roleIdNameMap, pleaseTryAgain |
| `source-code/backend/src/constants/regex.js` | phoneRegex, emailRegex, otpRegex |
| `source-code/backend/src/config/app.js` | jwtConfig, otp config |
| `source-code/backend/src/services/api/whatsapp.service.js` | sendWhatsAppMessage, sendSMS (epinet), sendOTP |
| `source-code/backend/src/services/communication.service.js` | sendOtp (email channel only currently active) |

— END OF FSD —
