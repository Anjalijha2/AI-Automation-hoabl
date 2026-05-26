# Test Cases — Registration & Login
**Portal:** Buyer (Customer) Portal
**BRD Reference:** BUYER-FS-Registration-and-Login.md

---

## Login — Landing Page & Nationality Selection

### BYR_LGN_001 — Login page loads at root URL

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer logged out, no active session cookie |
| **Test Steps** | 1. Open browser<br>2. Navigate to `https://uat.xrportal.in/`<br>3. Wait for page to render |
| **Expected Result** | Login page loads with HoABL branding, nationality tabs, mobile input and Send OTP button visible |
| **Priority** | Critical |

---

### BYR_LGN_002 — Indian National tab selected by default

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Login page open |
| **Test Steps** | 1. Inspect nationality tab strip on page load |
| **Expected Result** | "Indian National" tab is highlighted/active by default; "NRI" tab is inactive |
| **Priority** | High |

---

### BYR_LGN_003 — Switch to NRI tab shows country code selector

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Login page open, Indian National tab active |
| **Test Steps** | 1. Click "NRI" tab<br>2. Observe mobile input area |
| **Expected Result** | NRI tab becomes active; country-code dropdown/selector appears alongside mobile field |
| **Priority** | High |

---

### BYR_LGN_004 — Switch back to Indian National hides country code

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | NRI tab active |
| **Test Steps** | 1. Click "Indian National" tab |
| **Expected Result** | Country code selector hidden; mobile field reverts to 10-digit Indian format |
| **Priority** | Medium |

---

### BYR_LGN_005 — Referral link captures CP code

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer logged out; valid CP hvCode available |
| **Test Steps** | 1. Open `https://uat.xrportal.in/ref/<hvCode>`<br>2. Inspect URL/local storage<br>3. Proceed to login |
| **Expected Result** | Referral hvCode stored in session/local storage; attributed to CP on registration completion |
| **Priority** | High |

---

## Login — Mobile Number Entry & OTP Request

### BYR_LGN_006 — Mobile field accepts only digits

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Indian National tab active |
| **Test Steps** | 1. Click mobile input<br>2. Type "abc!@#"<br>3. Observe field |
| **Expected Result** | Non-numeric characters rejected; field remains empty or strips invalid characters |
| **Priority** | High |

---

### BYR_LGN_007 — Mobile field enforces 10-digit limit (Indian)

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Indian National tab active |
| **Test Steps** | 1. Type 11 digits into mobile field<br>2. Observe |
| **Expected Result** | Input capped at 10 digits; 11th digit not accepted |
| **Priority** | High |

---

### BYR_LGN_008 — Send OTP disabled until 10 digits entered

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Login page open, mobile field empty |
| **Test Steps** | 1. Type 9 digits<br>2. Check Send OTP state<br>3. Type 10th digit<br>4. Re-check |
| **Expected Result** | Send OTP disabled at 9 digits; enabled at exactly 10 digits |
| **Priority** | High |

---

### BYR_LGN_009 — Send OTP with registered mobile triggers OTP

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Registered buyer mobile exists (e.g., 8888888888) |
| **Test Steps** | 1. Enter registered mobile<br>2. Click Send OTP<br>3. Wait for response |
| **Expected Result** | OTP input appears; "OTP sent" toast displayed; Epinet SMS (epinetinfo.in/api/pushsms) + Botspice WhatsApp dispatched (NOT Kaleyra) |
| **Priority** | Critical |

---

### BYR_LGN_010 — Send OTP with unregistered mobile shows error

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Unregistered mobile number known |
| **Test Steps** | 1. Enter unregistered 10-digit mobile<br>2. Click Send OTP |
| **Expected Result** | Error message: buyer not registered; instructs to contact CP/sales |
| **Priority** | High |

---

### BYR_LGN_011 — OTP resend throttled by frontend 60s timer (UI-only)

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP just sent |
| **Test Steps** | 1. Observe Resend button state immediately after Send OTP<br>2. Wait 60 seconds<br>3. Re-check Resend button |
| **Expected Result** | Resend disabled with countdown for 60 seconds (frontend-only timer in `LoginForm.js:169`). Backend cooldown logic is commented out — direct API calls to `/auth/user/send-otp` bypass throttle. NOTE: backend does NOT enforce `lastOtpSentAt` cooldown. |
| **Priority** | Medium |

---

### BYR_LGN_012 — NRI mobile with country code accepted

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | NRI tab active; valid registered NRI mobile (e.g., +971-XXXXXXXXX) |
| **Test Steps** | 1. Select country code<br>2. Enter NRI mobile<br>3. Click Send OTP |
| **Expected Result** | OTP sent via configured NRI channel; OTP entry appears |
| **Priority** | High |

---

## Login — OTP Verification

### BYR_LGN_013 — OTP field accepts 6 digits

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP sent, OTP input visible |
| **Test Steps** | 1. Inspect OTP input boxes/length |
| **Expected Result** | OTP field accepts exactly 6 numeric digits |
| **Priority** | High |

---

### BYR_LGN_014 — Verify OTP disabled until 6 digits entered

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP entry visible |
| **Test Steps** | 1. Enter 5 digits<br>2. Check Verify button<br>3. Enter 6th digit<br>4. Re-check |
| **Expected Result** | Verify OTP disabled at 5 digits, enabled at 6 |
| **Priority** | High |

---

### BYR_LGN_015 — Correct OTP logs buyer in successfully

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Valid OTP received (UAT static: 147258 / 258369) |
| **Test Steps** | 1. Enter correct OTP<br>2. Click Verify OTP |
| **Expected Result** | JWT issued, session established, buyer redirected to `/home` |
| **Priority** | Critical |

---

### BYR_LGN_016 — Incorrect OTP shows error

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP entry visible |
| **Test Steps** | 1. Enter wrong 6-digit OTP<br>2. Click Verify OTP |
| **Expected Result** | "Invalid OTP" error; user stays on OTP screen |
| **Priority** | Critical |

---

### BYR_LGN_017 — Expired OTP rejected

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP sent and validity window elapsed |
| **Test Steps** | 1. Wait beyond OTP validity<br>2. Enter the OTP<br>3. Click Verify |
| **Expected Result** | "OTP expired" error; prompt to request new OTP |
| **Priority** | High |

---

### BYR_LGN_018 — Edit mobile from OTP screen restarts flow

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Click "Edit number" or back<br>2. Modify mobile<br>3. Click Send OTP again |
| **Expected Result** | Returns to mobile entry; new OTP issued for new number |
| **Priority** | Medium |

---

## Login — First-Login Consent (Terms & Conditions)

### BYR_LGN_019 — T&C modal shown on first login

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | New buyer, `isConsented = null` |
| **Test Steps** | 1. Complete OTP verification |
| **Expected Result** | T&C modal/screen appears before reaching dashboard |
| **Priority** | Critical |

---

### BYR_LGN_020 — T&C accept enables Proceed CTA

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | T&C modal visible |
| **Test Steps** | 1. Scroll through T&C text<br>2. Tick "I agree" checkbox<br>3. Observe Proceed button |
| **Expected Result** | Proceed button enabled only after checkbox is ticked |
| **Priority** | High |

---

### BYR_LGN_021 — T&C accept persists isConsented = 1

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | T&C modal visible, checkbox ticked |
| **Test Steps** | 1. Click Proceed<br>2. Verify backend `isConsented` flag<br>3. Verify URL |
| **Expected Result** | `isConsented = 1` persisted; buyer redirected to `/home` |
| **Priority** | Critical |

---

### BYR_LGN_022 — T&C disagree restricts access

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | T&C modal visible |
| **Test Steps** | 1. Click "Disagree" / close modal |
| **Expected Result** | `isConsented = 0` recorded; full access not granted; restricted view or logged out |
| **Priority** | High |

---

### BYR_LGN_023 — Returning buyer skips T&C modal

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer with `isConsented = 1` |
| **Test Steps** | 1. Log in via OTP |
| **Expected Result** | T&C modal not shown; lands on `/home` directly |
| **Priority** | High |

---

## Login — Session & Negative Cases

### BYR_LGN_024 — Direct access to /home without session redirects to login

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | No active session |
| **Test Steps** | 1. Open `https://uat.xrportal.in/home` directly |
| **Expected Result** | User redirected to login page |
| **Priority** | High |

---

### BYR_LGN_025 — Session persists on browser refresh after login

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Refresh `/home` |
| **Expected Result** | Dashboard reloads; no re-login required |
| **Priority** | High |

---

### BYR_LGN_026 — Logout clears client-side session and returns to login

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer logged in |
| **Test Steps** | 1. Click Logout from menu<br>2. Try to open `/home` directly without token |
| **Expected Result** | Local storage / cookies cleared client-side; `/home` access redirects to login. NOTE: JWT is NOT invalidated server-side — `auth.controller.js:36-46` returns 200 but does not blacklist token. Do NOT assert post-logout 401 from API — captured JWT remains valid until natural 24h expiry. |
| **Priority** | High |

---

### BYR_LGN_027 — Multiple OTP failures NOT throttled server-side (security gap)

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | OTP screen visible |
| **Test Steps** | 1. Submit 100 wrong OTPs in rapid succession via API |
| **Expected Result** | All 100 return `401 "Invalid OTP"` — backend has NO failed-attempt counter (no `otpAttempts` column on users model); `authLimiter` middleware is commented out in `app.js:40`. Document as KNOWN BUG (auth.controller.js:734-737). Frontend MAY show lockout but backend will keep accepting requests. |
| **Priority** | High (Security) |

---

## FSD Corrections Applied (2026-05-25)

Source FSD: `manual-qa-repository/03-user-manual/buyer-portal/fsd-registration-login.md`

### Corrections to existing TCs
- **BYR_LGN_009** — Replaced "Kaleyra SMS/WhatsApp" with Epinet SMS (`epinetinfo.in/api/pushsms`, sender `THOAL`, entityId `1001286607558438702`) + Botspice WhatsApp (`api/wappBroad/triggerwam`, template `otp_send`). Kaleyra service file exists but is NOT used for OTP (auth.controller.js:594-596; whatsapp.service.js:101,122; communication.service.js:8-9).
- **BYR_LGN_011** — Resend cooldown is UI-only (60s frontend timer in `LoginForm.js:169`). Backend cooldown logic in `auth.controller.js:558-568` is fully commented out. Test must NOT assert backend 429/cooldown response — only frontend disabled state.
- **BYR_LGN_026** — Logout does NOT invalidate JWT server-side. `auth.controller.js:36-46` is effectively a no-op (cookie-clear commented out). Do NOT assert post-logout 401.
- **BYR_LGN_027** — Reframed as KNOWN BUG (security gap). No backend brute-force protection exists.

### New TCs added below

### BYR_LGN_028 — Master OTP `147258` bypasses validation on UAT

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | UAT environment, `MASTER_OTP=147258` set in backend env |
| **Test Steps** | 1. Send OTP to any buyer phone<br>2. Ignore actual OTP<br>3. Enter `147258`<br>4. Click Verify |
| **Expected Result** | Login succeeds; backend logs `info: "Master OTP used for user: <id>"` (auth.controller.js:725-731). Must FAIL in production where MASTER_OTP env is unset. |
| **Priority** | Critical |

---

### BYR_LGN_029 — OTP request without phone returns 400

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | API access |
| **Test Steps** | 1. `POST /api/v1/auth/user/send-otp` with empty body<br>2. Observe |
| **Expected Result** | 400 "Phone number is required" (auth.controller.js:338) |
| **Priority** | High |

---

### BYR_LGN_030 — NRI without email returns 400

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | API access |
| **Test Steps** | 1. `POST /api/v1/auth/user/send-otp` body `{ phone, nri:true, countryCode:'+971' }` (no email) |
| **Expected Result** | 400 "Both email and phone are required for NRI users" (auth.controller.js:159-161) |
| **Priority** | High |

---

### BYR_LGN_031 — Existing non-NRI phone submitted as NRI returns 409

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Phone X registered as `isNri=false` |
| **Test Steps** | 1. `POST send-otp` body `{ phone:X, email:'a@b.com', nri:true, countryCode:'+971' }` |
| **Expected Result** | 409 "Number already registered as Indian national." (auth.controller.js:181-183) |
| **Priority** | High |

---

### BYR_LGN_032 — Existing NRI phone submitted as non-NRI returns 409

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Phone Y registered as `isNri=true` |
| **Test Steps** | 1. `POST send-otp` body `{ phone:Y, nri:false }` |
| **Expected Result** | 409 "Number already registered as NRI." (auth.controller.js:353-355) |
| **Priority** | High |

---

### BYR_LGN_033 — NRI email mismatch on send-otp returns 409

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | NRI user exists with phone Y, email `a@b.com` |
| **Test Steps** | 1. `POST send-otp` body `{ phone:Y, email:'wrong@b.com', nri:true, countryCode:'+971' }` |
| **Expected Result** | 409 "Email address does not match with the phone number" (auth.controller.js:166-168) |
| **Priority** | High |

---

### BYR_LGN_034 — NRI verify falls back to phone-only after phone+email miss (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | NRI user exists with phone Y, email `a@b.com`; OTP just sent |
| **Test Steps** | 1. `POST verify-otp` body `{ phone:Y, email:'differentemail@b.com', nri:true, otp:<valid> }` |
| **Expected Result** | KNOWN BUG: returns 200 successful login via phone-only fallback in `auth.controller.js:708-715`. Document risk — auth bypass possible if email mismatch slipped through send-otp. |
| **Priority** | High (Security) |

---

### BYR_LGN_035 — JWT token expires after 24 hours

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | JWT issued at time T |
| **Test Steps** | 1. Use token at T+23h59m on `/api/v1/user/profile`<br>2. Wait until T+24h01m<br>3. Reuse same token |
| **Expected Result** | First call 200; second call 401 (JWT expired) — `expiresIn: '1d'` (config/app.js:78) |
| **Priority** | High |

---

### BYR_LGN_036 — Concurrent send-otp overwrites previous OTP

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer phone Z |
| **Test Steps** | 1. Call send-otp twice in 5s for phone Z<br>2. Capture both OTPs (OTP1, OTP2)<br>3. Submit OTP1 to verify |
| **Expected Result** | OTP1 rejected with 401 "Invalid OTP" (overwritten in `users.otp` column by OTP2 — auth.controller.js:574-577). Only OTP2 valid. |
| **Priority** | Medium |

---

### BYR_LGN_037 — OTP request rate limit not enforced (security gap)

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | API access |
| **Test Steps** | 1. Send 200 `/auth/user/send-otp` calls in 60 seconds from same IP |
| **Expected Result** | All 200 accepted — `authLimiter` middleware commented out in `app.js:40`. Document as known security gap; backend has zero abuse protection. |
| **Priority** | High (Security) |

---

### BYR_LGN_038 — Country code regex rejects malformed `+91-` or `91`

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | NRI flow |
| **Test Steps** | 1. `POST send-otp` body `{ phone, email, nri:true, countryCode:'91' }` (no plus)<br>2. Then retry with `countryCode:'+91-'` |
| **Expected Result** | Both rejected with 400 validation error — regex `/^\+\d{1,3}$/` (validations/auth.validations.js:64) |
| **Priority** | Medium |

---

### BYR_LGN_039 — `Registration.defaultScope` case mismatch swallows REFUND filter (BUG)

| Field | Value |
|-------|-------|
| **Module** | BYR – Login |
| **Pre-conditions** | Buyer with `registrations.status = 'Refund'` |
| **Test Steps** | 1. Login as that buyer<br>2. Inspect `hasActiveRegistration` flag in verify-otp response |
| **Expected Result** | KNOWN BUG: scope filter uses `status != 'REFUND'` (uppercase) but enum stores `'Refund'` — scope filters nothing (registration.model.js:201-207 vs :161). Refunded registrations leak as "active". |
| **Priority** | Medium |
