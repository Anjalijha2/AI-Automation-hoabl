# Test Cases — Login
**Portal:** Channel Partner Portal
**BRD Reference:** CP-BRD-CP-Portal.md / CP-FS-Login.md

---

## Login Page UI

### CP_LGN_001 — Verify Login page loads at `/login`

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Browser open; no active CP session |
| **Test Steps** | 1. Navigate to `https://uat.xrportal.in/login`<br>2. Wait for page to render<br>3. Observe page title and headings |
| **Expected Result** | Channel Partner login page loads with branding, mobile number input, and Send OTP button visible |
| **Priority** | Critical |

---

### CP_LGN_002 — Verify Mobile Number input field is visible and editable

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Locate the Mobile Number input field<br>2. Click into the field<br>3. Verify field accepts numeric input |
| **Expected Result** | Mobile Number input is visible, focusable, and accepts up to 10 digits |
| **Priority** | Critical |

---

### CP_LGN_003 — Verify "Send OTP" button is visible

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Observe button below the Mobile Number input<br>2. Verify button label reads exactly "Send OTP" |
| **Expected Result** | "Send OTP" button is rendered and enabled when a valid mobile number is entered |
| **Priority** | High |

---

### CP_LGN_004 — Verify country code selector for NRI numbers

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Locate the country code selector on Mobile Number field<br>2. Open the dropdown<br>3. Verify multiple country codes are listed |
| **Expected Result** | Country code dropdown lists India (+91) by default and supports international codes |
| **Priority** | Medium |

---

### CP_LGN_005 — Verify page branding shows Channel Partner / Growth Partner

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Observe page header/logo<br>2. Read on-screen labels and copy |
| **Expected Result** | Page identifies itself as the Channel Partner (Growth Partner) login |
| **Priority** | Medium |

---

## OTP Send Flow

### CP_LGN_006 — Send OTP with valid mobile number (lazy user create on first attempt)

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Mobile `8888888888` |
| **Test Steps** | 1. Enter `8888888888`<br>2. Click Send OTP<br>3. Observe response + query users table |
| **Expected Result** | OTP dispatched via Epinet SMS (NOT Kaleyra; `epinetinfo.in/api/pushsms`) + Botspice WhatsApp template `otp_send`. If no user existed, row auto-created with `roleId=3, countryCode='+91'` (BR-CP-LOG-04, auth.controller.js:522-528). OTP input field visible; toast "OTP sent successfully". |
| **Priority** | Critical |

---

### CP_LGN_007 — Verify OTP input field appears after Send OTP

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Valid mobile entered |
| **Test Steps** | 1. Enter registered mobile number<br>2. Click Send OTP<br>3. Wait for screen transition |
| **Expected Result** | 6-digit OTP input field is rendered along with a Verify OTP button |
| **Priority** | Critical |

---

### CP_LGN_008 — Send OTP with mobile less than 10 digits

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Enter `12345` in Mobile Number field<br>2. Click Send OTP |
| **Expected Result** | Inline validation message appears (e.g., "Enter a valid 10-digit mobile number"); OTP is not sent |
| **Priority** | High |

---

### CP_LGN_009 — Send OTP with empty mobile field

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Leave Mobile Number field blank<br>2. Click Send OTP |
| **Expected Result** | "Send OTP" remains disabled OR error message "Mobile number is required" is displayed |
| **Priority** | High |

---

### CP_LGN_010 — Send OTP with unregistered mobile (lazy create succeeds)

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Mobile `9000000000` not in users table |
| **Test Steps** | 1. Enter `9000000000`<br>2. Click Send OTP<br>3. Query users table for row with phone=9000000000 |
| **Expected Result** | OTP sent successfully — new users row created with `roleId=3, countryCode='+91', firstName=NULL` (BR-CP-LOG-04). Verify-OTP will then return "Consent Pending" branch (no JWT). Do NOT assert "not registered" error — CP flow is lazy-create. |
| **Priority** | High |

---

### CP_LGN_011 — Send OTP with mobile containing letters or special chars

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Login page is open |
| **Test Steps** | 1. Type `abcd!@#$56` in Mobile Number field<br>2. Observe field behavior |
| **Expected Result** | Field rejects non-numeric input; only digits are accepted |
| **Priority** | Medium |

---

### CP_LGN_012 — Resend OTP timer is UI-only (no backend cooldown)

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | OTP sent |
| **Test Steps** | 1. Observe Resend button state (UI countdown)<br>2. Direct API: `POST /api/v1/auth/cp/send-otp` for same phone in rapid succession |
| **Expected Result** | UI shows countdown (frontend timer). Backend cooldown logic in `auth.controller.js:559-568` is commented out — direct API allows unlimited send-OTP, each overwrites `users.otp` (GAP-LOG-01). Document as security gap. |
| **Priority** | High (Security) |

---

## OTP Verification Flow

### CP_LGN_013 — Login with valid OTP `258369`

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | UAT static OTP credentials in use; OTP screen visible |
| **Test Steps** | 1. Enter `8888888888`, click Send OTP<br>2. Enter `258369` in OTP field<br>3. Click Verify OTP |
| **Expected Result** | OTP verified, JWT issued, CP is redirected to `/dashboard` |
| **Priority** | Critical |

---

### CP_LGN_014 — Verify Dashboard loads after successful login

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Successful OTP verification |
| **Test Steps** | 1. Complete OTP login flow<br>2. Wait for redirect |
| **Expected Result** | URL changes to `/dashboard`; the CP dashboard table loads showing CP's registered customers |
| **Priority** | Critical |

---

### CP_LGN_015 — Login with invalid OTP

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Enter `8888888888`, click Send OTP<br>2. Enter `000000` in OTP<br>3. Click Verify OTP |
| **Expected Result** | Error message "Invalid OTP" is displayed; user remains on OTP screen |
| **Priority** | Critical |

---

### CP_LGN_016 — Login with OTP shorter than 6 digits

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Enter `1234` in OTP field<br>2. Click Verify OTP |
| **Expected Result** | Verify OTP button remains disabled OR validation error "OTP must be 6 digits" is shown |
| **Priority** | High |

---

### CP_LGN_017 — Verify expired OTP error

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | OTP sent and TTL has elapsed |
| **Test Steps** | 1. Send OTP<br>2. Wait beyond OTP expiry window<br>3. Enter the OTP and click Verify OTP |
| **Expected Result** | "OTP has expired. Please request a new one" error is displayed |
| **Priority** | High |

---

### CP_LGN_018 — No rate limiting on wrong OTP attempts (security gap)

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Submit 100 incorrect OTPs via API |
| **Expected Result** | All 100 return `401 "Invalid OTP"` — no backend lockout / counter exists. `authLimiter` middleware commented out. 6-digit OTP space + 10-min window = brute-force feasible. Document as KNOWN SECURITY GAP (GAP-LOG-01, auth.controller.js:734-738). |
| **Priority** | High (Security) |

---

### CP_LGN_019 — Buyer-role mobile cannot login on CP login page

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | A mobile that is registered only as a Buyer (role 2) |
| **Test Steps** | 1. Enter buyer-only mobile<br>2. Click Send OTP |
| **Expected Result** | OTP send fails OR user is rejected post-OTP because role mismatch; CP portal is not accessible |
| **Priority** | High |

---

### CP_LGN_020 — SM-role mobile cannot login on CP login page

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | A mobile that is registered as Sales Manager (role 4/5) |
| **Test Steps** | 1. Enter SM-only mobile<br>2. Click Send OTP, enter received OTP, click Verify OTP |
| **Expected Result** | Login is rejected; access to CP portal is denied |
| **Priority** | High |

---

## Profile Completion Routing

### CP_LGN_021 — Incomplete profile redirects to RegisterCp screen

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP account exists with `isCpRegistrationCompleted = false` |
| **Test Steps** | 1. Login with the incomplete-profile CP mobile<br>2. Complete OTP verification |
| **Expected Result** | CP is redirected to the profile completion (RegisterCp) screen instead of `/dashboard` |
| **Priority** | High |

---

### CP_LGN_022 — Completing profile redirects to Dashboard

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP currently on the RegisterCp profile completion screen |
| **Test Steps** | 1. Fill all mandatory profile fields<br>2. Submit the profile form |
| **Expected Result** | Profile is saved (`isCpRegistrationCompleted = true`); CP is redirected to `/dashboard` |
| **Priority** | High |

---

## Session and Logout

### CP_LGN_023 — JWT session persists across page refresh

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP logged in successfully |
| **Test Steps** | 1. After landing on Dashboard, refresh the page (F5)<br>2. Observe whether the user remains logged in |
| **Expected Result** | Session persists; user remains on Dashboard without being asked to login again |
| **Priority** | High |

---

### CP_LGN_024 — Direct access to `/dashboard` while logged out redirects to `/login`

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | No active session |
| **Test Steps** | 1. Open browser without auth state<br>2. Navigate directly to `https://uat.xrportal.in/dashboard` |
| **Expected Result** | User is redirected to `/login` |
| **Priority** | Critical |

---

### CP_LGN_025 — Logout clears client session only — JWT remains valid server-side

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP logged in; capture JWT before logout |
| **Test Steps** | 1. Click Logout<br>2. Verify localStorage cleared<br>3. Replay captured JWT on `GET /api/v1/cp/kyc` |
| **Expected Result** | Client storage cleared; redirect to /login. BUT captured JWT STILL WORKS on protected endpoint — `/api/v1/auth/logout` is a no-op (returns 200; cookie clear commented out; no blacklist). Token valid until 1d natural expiry (BR-CP-LOG-18, GAP-LOG-04, auth.controller.js:36-46). Do NOT assert post-logout 401. |
| **Priority** | High (Security) |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/cp-portal/fsd-login.md`

### Corrections to existing TCs
- **CP_LGN_004** — CP `effectiveCountryCode` is HARD-CODED `+91` (BR-CP-LOG-03, auth.controller.js:122). NRI branch only applies to `userType==='user'`. International country code selector irrelevant for CP — `User.create` always stores `+91`. Verify UI does not expose NRI dropdown for CP.
- **CP_LGN_006** — Reframed for Epinet (NOT Kaleyra) and lazy auto-create.
- **CP_LGN_010** — Reframed: unregistered phone does NOT error — backend lazy-creates a CP row (BR-CP-LOG-04).
- **CP_LGN_012 / CP_LGN_018** — No backend cooldown / brute-force protection. Both reframed as security gaps.
- **CP_LGN_019 / CP_LGN_020** — Buyer-only / SM-only mobiles. NOTE: CP send-OTP only filters by `phone`; if a phone is registered as `roleId=2 (user)` or `roleId=5 (SM)`, a NEW CP row may be auto-created with same phone since no unique constraint on `users.phone` (GAP-LOG-02). Verify actual behavior — current expected may not match.
- **CP_LGN_025** — Logout is server no-op; JWT remains valid.

### New TCs added below

### CP_LGN_026 — verify-OTP "Consent Pending" branch (NEW CP, no isConsented in body)

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Brand-new CP (just lazy-created); `users.isConsented IS NULL` |
| **Test Steps** | 1. `POST /api/v1/auth/cp/verify-otp` body `{ phone, otp: <valid> }` (omit isConsented) |
| **Expected Result** | 200 "Consent Pending"; response `{ user: {...} }` with NO `token` field (BR-CP-LOG-12 / a, auth.controller.js:770-789). |
| **Priority** | High |

---

### CP_LGN_027 — verify-OTP "Consent Declined" branch (isConsented=false)

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP `users.isConsented=NULL` |
| **Test Steps** | 1. `POST verify-otp` body `{ phone, otp, isConsented:false }`<br>2. Query `users.is_consented` |
| **Expected Result** | 200 "Consent Declined"; users.is_consented=0; NO token (BR-CP-LOG-12 / b, GAP-LOG-06). Re-attempt requires explicit isConsented:true. |
| **Priority** | High |

---

### CP_LGN_028 — verify-OTP "Registration Pending" branch (consented but KYC not done)

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP `isConsented=true, isCpRegistrationCompleted=false` |
| **Test Steps** | 1. `POST verify-otp` body `{ phone, otp, isConsented:true }` |
| **Expected Result** | 200 "Registration Pending"; response `{ user }` with NO `token` (BR-CP-LOG-12 / c, GAP-LOG-07). Frontend navigates to RegisterCp screen; KYC submit endpoint `POST /api/v1/cp/registration` is PUBLIC (no JWT needed). |
| **Priority** | High |

---

### CP_LGN_029 — verify-OTP terminal branch returns JWT only when consented + registered

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP `isConsented=true, isCpRegistrationCompleted=true` |
| **Test Steps** | 1. `POST verify-otp` body `{ phone, otp }` |
| **Expected Result** | 200 with `{ user, token }`; `otp=NULL, otpExpires=NULL, lastLogin=NOW()` (BR-CP-LOG-13). JWT payload `{id: userId}`, expiry 1d. |
| **Priority** | Critical |

---

### CP_LGN_030 — isActive=false on send-OTP returns "access revoked"

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Admin sets `users.is_active=false` for CP X |
| **Test Steps** | 1. `POST /api/v1/auth/cp/send-otp` body `{ phone: X }` |
| **Expected Result** | 400 "Your access to the portal has been revoked" (BR-CP-LOG-05, auth.controller.js:517-519) |
| **Priority** | Critical |

---

### CP_LGN_031 — isActive=false revoke does NOT invalidate existing JWTs (BUG)

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP with active JWT |
| **Test Steps** | 1. Admin sets `is_active=false`<br>2. CP continues to call `GET /api/v1/cp/kyc` with existing token |
| **Expected Result** | KNOWN BUG: requests continue to succeed until token expiry — `protect` middleware does not re-check `isActive` (GAP-LOG-10, middleware/auth.middleware.js:48-65). Document. |
| **Priority** | High (Security) |

---

### CP_LGN_032 — Master OTP from env bypasses validation

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | UAT with `MASTER_OTP` env set |
| **Test Steps** | 1. Send OTP to any CP phone<br>2. Submit master OTP value via verify-otp |
| **Expected Result** | OTP validation bypassed; verify-OTP success (BR-CP-LOG-11, GAP-LOG-05). Same master OTP works for ALL CPs — high blast radius if env var leaks. |
| **Priority** | Critical (Security) |

---

### CP_LGN_033 — JWT expired returns 401 "Your session has expired"

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | JWT issued >1d ago |
| **Test Steps** | 1. Replay expired token on `GET /api/v1/cp/kyc` |
| **Expected Result** | 401 "Your session has expired" (BR-CP-LOG-17, middleware/auth.middleware.js:79-87). Malformed token → "Invalid session". |
| **Priority** | High |

---

### CP_LGN_034 — protect middleware accepts Authorization header OR jwt cookie

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Valid JWT |
| **Test Steps** | 1. Call `/api/v1/cp/kyc` with `Authorization: Bearer <jwt>`<br>2. Then call with cookie `jwt=<jwt>` (no header) |
| **Expected Result** | Both succeed (BR-CP-LOG-16, middleware/auth.middleware.js:35-39). |
| **Priority** | Medium |

---

### CP_LGN_035 — encryptedHvCode backfill on verify-otp

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP row with `hvCode` set but `encryptedHvCode` NULL |
| **Test Steps** | 1. Complete verify-otp<br>2. Query `users.encrypted_hv_code` |
| **Expected Result** | encryptedHvCode populated with AES-encrypted hvCode (BR-CP-LOG-19, auth.controller.js:756-759). |
| **Priority** | Low |

---

### CP_LGN_036 — Verify-OTP returns role permissions map

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Terminal verify-otp success |
| **Test Steps** | 1. Inspect response body `permissions` field |
| **Expected Result** | `permissions = { moduleId: [actionId, ...] }` for `cp` role via `RolePermission → Permission` join (BR-CP-LOG-20, auth.controller.js:627-647, 796-812). |
| **Priority** | Medium |

---

### CP_LGN_037 — Concurrent send-OTP overwrites users.otp

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP phone Z |
| **Test Steps** | 1. Fire two send-OTPs for Z in 5s — capture both OTPs OTP1 then OTP2<br>2. Submit OTP1 to verify-otp |
| **Expected Result** | OTP1 rejected (overwritten in `users.otp`). Only OTP2 valid. Plaintext OTP storage (GAP-LOG-09, user.model.js:187-190). |
| **Priority** | Medium |

---

### CP_LGN_038 — Epinet SMS dispatch is fire-and-forget (failure swallowed)

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | Mock Epinet to return 500 |
| **Test Steps** | 1. `POST /auth/cp/send-otp`<br>2. Inspect response + DB |
| **Expected Result** | 200 "OTP sent successfully" returned despite SMS failure; `users.otp` set; WhatsApp may still fire (GAP-LOG-08, auth.controller.js:595, whatsapp.service.js:122). Buyer never sees error. |
| **Priority** | Medium |

---

### CP_LGN_039 — Soft-deleted CP cannot login (paranoid scope)

| Field | Value |
|-------|-------|
| **Module** | CP – Login |
| **Pre-conditions** | CP row with `deleted_at IS NOT NULL` |
| **Test Steps** | 1. `POST /auth/cp/send-otp` for that phone |
| **Expected Result** | Treated as non-existent → new CP row lazy-created (BR-CP-LOG-04). Verify `User.findOne` respects paranoid scope (does NOT see soft-deleted row). Document if behavior differs. |
| **Priority** | Medium |
