# Test Cases — Login
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Login.md
**FSD Reference:** `manual-qa-repository/03-user-manual/admin/fsd-login-auth.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Major behavior facts verified from source code

- **OTP provider = Epinet** (`epinetinfo.in`), NOT Kaleyra. Kaleyra SMS/WhatsApp services are commented out in `services/communication.service.js:8-22`.
- **OTP generation uses `Math.random()`** — NOT cryptographically secure (`controllers/auth.controller.js:52-54`).
- **OTP is stored as plaintext** on `users.otp` column (no hashing).
- **No rate limit on auth endpoints** — `authLimiter` middleware exists but is not wired (`middleware/rate-limiter.middleware.js:37-49`, `routes/auth.routes.js`).
- **No resend cooldown** — cooldown block is commented out (`controllers/auth.controller.js:557-568`).
- **Admin Master OTP** (`ADMIN_MASTER_OTP` env var) is accepted in ALL environments — there is no NODE_ENV gate (`controllers/auth.controller.js:725-731`).
- **JWT lifetime** = 1 day default; payload is `{id: userId}` only (no role/email).
- **Logout is client-side only** — JWT stateless, no blacklist on server (`controllers/auth.controller.js:36-46`).
- **`lastLogin` field assigned but column commented out in model** — silently dropped (`models/user.model.js:321-324`).
- **WhatsApp + SMS dispatch is fire-and-forget** — no `await`, controller returns "OTP sent successfully" even on delivery failure.
- **Phone format regex `[6-9]\d{9}$` exists but is NOT enforced** at Yup validation level (regex `.test` is commented out).

---

## Login Page Rendering

### ADM_LGN_001 — Verify login page loads at /admin URL

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Browser open; no active admin session |
| **Test Steps** | 1. Navigate to https://uat-web.xrportal.in/admin<br>2. Wait for page to fully load |
| **Expected Result** | Login page renders within 5 seconds with HoABL logo, side banner image, "Admin Login" heading, mobile input field, and Send OTP button |
| **Priority** | Critical |

---

### ADM_LGN_002 — Verify all static elements on Step 1 mobile screen

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Observe all visible elements on the page |
| **Expected Result** | Page displays HoABL logo, side banner, "Admin Login" heading, "+91" prefix, mobile input with placeholder "Enter Mobile Number", Terms link, Privacy link, Send OTP button, copyright footer |
| **Priority** | High |

---

### ADM_LGN_003 — Verify mobile field placeholder text

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Locate mobile number input field<br>2. Observe placeholder text |
| **Expected Result** | Field shows placeholder "Enter Mobile Number" with "+91" prefix to its left |
| **Priority** | Medium |

---

### ADM_LGN_004 — Verify Terms & Conditions link is clickable

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Click "Terms & Conditions" link |
| **Expected Result** | Terms of Service page or modal opens |
| **Priority** | Medium |

---

### ADM_LGN_005 — Verify Privacy Policy link is clickable

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Click "Privacy Policy" link |
| **Expected Result** | Privacy Policy page or modal opens |
| **Priority** | Medium |

---

### ADM_LGN_006 — Verify copyright footer text

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Scroll to footer<br>2. Read footer text |
| **Expected Result** | Footer reads "Copyright 2026 Growwithhoabl All Rights Reserved" |
| **Priority** | Medium |

---

### ADM_LGN_007 — Verify Send OTP button visible and enabled

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Locate Send OTP button<br>2. Verify state |
| **Expected Result** | Send OTP button is visible, enabled, labelled "Send OTP" |
| **Priority** | High |

---

### ADM_LGN_008 — Verify direct URL is only route to login

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | No active session |
| **Test Steps** | 1. Access /admin without session<br>2. Try /admin/customers directly |
| **Expected Result** | Both routes resolve to login page |
| **Priority** | High |

---

## OTP Send Flow

### ADM_LGN_009 — Send OTP with valid 10-digit admin mobile

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | UAT admin mobile 8888888888 registered |
| **Test Steps** | 1. Enter "8888888888" in Mobile Number field<br>2. Click Send OTP<br>3. Observe next screen |
| **Expected Result** | Page transitions to Step 2 OTP entry screen with six OTP boxes and countdown timer |
| **Priority** | Critical |

---

### ADM_LGN_010 — Verify OTP entry screen layout

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Send OTP clicked for 8888888888 |
| **Test Steps** | 1. Observe all elements on OTP entry screen |
| **Expected Result** | Shows back arrow, "ENTER OTP" heading, sub-text "Enter the OTP sent to your phone number", 6 single-digit boxes, countdown timer, Re-Send OTP (disabled), Submit OTP button |
| **Priority** | High |

---

### ADM_LGN_011 — Mobile field rejects letters

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Click mobile field<br>2. Type "abcdefghij" |
| **Expected Result** | No letters appear; keystrokes blocked at input level |
| **Priority** | High |

---

### ADM_LGN_012 — Mobile field rejects special characters

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Click mobile field<br>2. Type "!@#$%^&*()" |
| **Expected Result** | No special characters appear; keystrokes blocked |
| **Priority** | High |

---

### ADM_LGN_013 — Mobile field accepts only digits

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Type "1234567890" in mobile field |
| **Expected Result** | All 10 digits appear in field |
| **Priority** | High |

---

### ADM_LGN_014 — Send OTP with empty mobile field

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded; field empty |
| **Test Steps** | 1. Click Send OTP without entering anything |
| **Expected Result** | Nothing happens; page remains on Step 1 |
| **Priority** | High |

---

### ADM_LGN_015 — Send OTP with 5-digit short number

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Enter "12345"<br>2. Click Send OTP |
| **Expected Result** | OTP not sent; page does not transition to OTP screen |
| **Priority** | High |

---

### ADM_LGN_016 — Send OTP with all zeros mobile

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Enter "0000000000"<br>2. Click Send OTP |
| **Expected Result** | OTP rejected; stays on mobile entry screen |
| **Priority** | High |

---

### ADM_LGN_017 — Verify mobile field max length 10 digits

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Try to enter "12345678901234567890" |
| **Expected Result** | Only first 10 digits accepted; rest blocked |
| **Priority** | Medium |

---

## OTP Verification Flow

### ADM_LGN_018 — Submit valid OTP 258369 logs in successfully

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown after Send OTP for 8888888888 |
| **Test Steps** | 1. Type "2" in OTP Box 1<br>2. Type "5" in Box 2<br>3. Type "8" in Box 3<br>4. Type "3" in Box 4<br>5. Type "6" in Box 5<br>6. Type "9" in Box 6<br>7. Click Submit OTP |
| **Expected Result** | User redirected to /admin/customers within 5 seconds |
| **Priority** | Critical |

---

### ADM_LGN_019 — OTP boxes auto-advance focus on digit entry

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP entry screen shown |
| **Test Steps** | 1. Click Box 1<br>2. Type each digit of "258369" sequentially |
| **Expected Result** | After each digit, focus auto-advances to next box; cursor ends in Box 6 |
| **Priority** | High |

---

### ADM_LGN_020 — Each OTP box accepts only single digit

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP entry screen shown |
| **Test Steps** | 1. Click Box 1<br>2. Try typing "25" |
| **Expected Result** | "2" stays in Box 1; "5" auto-advances to Box 2 |
| **Priority** | Medium |

---

### ADM_LGN_021 — Submit wrong 6-digit OTP

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP entry screen shown |
| **Test Steps** | 1. Enter "123456"<br>2. Click Submit OTP |
| **Expected Result** | Error message shown; user remains on OTP screen; not redirected |
| **Priority** | Critical |

---

### ADM_LGN_022 — Submit OTP with empty boxes

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown; all boxes empty |
| **Test Steps** | 1. Click Submit OTP without entering anything |
| **Expected Result** | Login not attempted; user stays on OTP screen |
| **Priority** | High |

---

### ADM_LGN_023 — Submit partial OTP (3 digits)

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown |
| **Test Steps** | 1. Enter "123" in boxes 1-3 only<br>2. Click Submit OTP |
| **Expected Result** | Login rejected; stays on OTP screen |
| **Priority** | High |

---

### ADM_LGN_024 — Submit all-zeros OTP

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown |
| **Test Steps** | 1. Enter "000000"<br>2. Click Submit OTP |
| **Expected Result** | Login rejected; error shown |
| **Priority** | High |

---

### ADM_LGN_025 — [FSD-CORRECTION] [BUG-REF: BUG-AUTH-001] Unlimited wrong OTP attempts — no lockout, no rate limit

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown |
| **Test Steps** | 1. Submit "111111"<br>2. Submit "222222"<br>3. Submit "333333"<br>4. Submit 50 more random 6-digit OTPs<br>5. Submit "258369" |
| **Expected Result** | All wrong attempts rejected with HTTP 401 `"Invalid OTP"`. NO lockout ever applied. NO rate limit triggered. 54th attempt with correct OTP succeeds. Note: `authLimiter` middleware (50 req/min/IP) exists but is NOT wired to auth routes — verified from `routes/auth.routes.js` source. Flag as security gap. |
| **Priority** | High |

---

### ADM_LGN_026 — OTP countdown timer counts down

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen just shown |
| **Test Steps** | 1. Observe timer<br>2. Wait 5 seconds<br>3. Observe again |
| **Expected Result** | Timer decrements every second (e.g. "60s" → "55s") |
| **Priority** | Medium |

---

### ADM_LGN_027 — Re-Send OTP disabled during active timer

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown; timer counting |
| **Test Steps** | 1. Try to click Re-Send OTP while timer active |
| **Expected Result** | Re-Send OTP is disabled/grayed; clicking does nothing |
| **Priority** | High |

---

### ADM_LGN_028 — Re-Send OTP enabled after timer expires

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen shown |
| **Test Steps** | 1. Wait for timer to reach 0s<br>2. Observe Re-Send OTP link |
| **Expected Result** | Re-Send OTP becomes enabled/clickable |
| **Priority** | High |

---

### ADM_LGN_029 — [FSD-CORRECTION] Click Re-Send OTP after timer expires (UI-only cooldown)

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Timer expired; Re-Send OTP enabled |
| **Test Steps** | 1. Click Re-Send OTP |
| **Expected Result** | New OTP requested; UI timer restarts at 60s; Re-Send OTP disabled again. NOTE: backend cooldown is COMMENTED OUT (`auth.controller.js:557-568`) — any number of resend calls bypassing UI (e.g. via direct API) will succeed. The 60s gate is purely client-side. |
| **Priority** | High |

---

### ADM_LGN_030 — Back button returns to mobile screen

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP entry screen shown |
| **Test Steps** | 1. Click back arrow at top of OTP screen |
| **Expected Result** | Returns to Step 1 mobile entry screen |
| **Priority** | High |

---

### ADM_LGN_031 — Successful login redirects to /admin/customers

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Valid mobile and OTP submitted |
| **Test Steps** | 1. Complete login with 8888888888 / 258369<br>2. Observe URL after redirect |
| **Expected Result** | URL becomes /admin/customers; Customers page renders |
| **Priority** | Critical |

---

## Session Management

### ADM_LGN_032 — Session persists across page refresh

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Login successfully<br>2. Press F5 to refresh |
| **Expected Result** | User remains logged in; page reloads without redirect to login |
| **Priority** | Critical |

---

### ADM_LGN_033 — Session persists across new browser tab

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Open new tab in same browser<br>2. Navigate to /admin/customers |
| **Expected Result** | New tab loads page directly without login prompt |
| **Priority** | High |

---

### ADM_LGN_034 — Session lasts up to 1 day

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Admin logged in; JWT issued |
| **Test Steps** | 1. Note login time<br>2. Wait 23 hours<br>3. Access protected route |
| **Expected Result** | Session still valid within 24h window |
| **Priority** | Medium |

---

### ADM_LGN_035 — Expired session redirects to login

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Session token expired |
| **Test Steps** | 1. Clear admin.json storage<br>2. Try to access /admin/customers |
| **Expected Result** | Redirected to /admin login page |
| **Priority** | High |

---

### ADM_LGN_036 — Protected route without login redirects to /admin

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | No active session |
| **Test Steps** | 1. Open incognito<br>2. Navigate to /admin/towers |
| **Expected Result** | Redirected to /admin login page |
| **Priority** | Critical |

---

### ADM_LGN_063 — Session persists across browser close and reopen within JWT window

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Admin logged in; JWT stored in localStorage |
| **Test Steps** | 1. Login successfully<br>2. Close browser completely<br>3. Reopen browser<br>4. Navigate to /admin/customers |
| **Expected Result** | Session restored from localStorage; Customers page loads without redirect to login |
| **Priority** | High |

---

### ADM_LGN_064 — Concurrent session on second device does not invalidate first

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Admin logged in on Device A |
| **Test Steps** | 1. Login as same admin on Device B<br>2. Return to Device A<br>3. Access /admin/customers |
| **Expected Result** | Both devices remain authenticated — JWT is stateless and not bound to a single device; no session blacklist exists (per FSD §3 §6) |
| **Priority** | Medium |

---

### ADM_LGN_065 — Tampered JWT token in localStorage forces redirect to login

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Open DevTools → Application → localStorage<br>2. Edit JWT token (change a character in payload)<br>3. Reload /admin/customers |
| **Expected Result** | API call fails with 401; user redirected to /admin login page |
| **Priority** | High |

---

## Security & Negative Cases

### ADM_LGN_037 — SQL injection in mobile field is blocked

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Try entering "' OR 1=1 --" in mobile field<br>2. Click Send OTP |
| **Expected Result** | Input blocked at field level (numeric only); no DB error |
| **Priority** | Critical |

---

### ADM_LGN_038 — XSS injection in mobile field is blocked

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Try entering "<script>alert('xss')</script>" in mobile field |
| **Expected Result** | Script tags blocked; no JS alert fires |
| **Priority** | Critical |

---

### ADM_LGN_039 — [FSD-CORRECTION] Unregistered admin mobile rejected at SEND-OTP (not verify)

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Enter unregistered "9999999999"<br>2. Click Send OTP |
| **Expected Result** | Backend returns HTTP 400 `"User not found"` at the send-OTP step itself. UI surfaces error inline. OTP screen does NOT load. Note: `auth.controller.js:513-515` enforces this for admin / SM-admin / SM (NOT for CP — CP auto-creates). |
| **Priority** | High |

---

### ADM_LGN_040 — Login page responsive on mobile viewport

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Browser at 375x667 viewport |
| **Test Steps** | 1. Resize to mobile viewport<br>2. Load /admin |
| **Expected Result** | All elements visible and tappable; no overflow |
| **Priority** | Medium |

---

### ADM_LGN_066 — Send OTP with leading-zero 10-digit mobile rejected

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Enter "0123456789"<br>2. Click Send OTP |
| **Expected Result** | Send OTP returns 400 "User not found" (no admin record with that mobile); UI does not advance to OTP screen |
| **Priority** | Medium |

---

### ADM_LGN_067 — Send OTP with spaces in mobile field rejected at input level

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | Login page loaded |
| **Test Steps** | 1. Try entering "8888 888 888" with spaces<br>2. Click Send OTP |
| **Expected Result** | Spaces blocked at input level (numeric-only); field stores only "8888888888"; OTP sent normally |
| **Priority** | Medium |

---

### ADM_LGN_068 — Paste 10-digit OTP into first OTP box auto-fills all six boxes

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP entry screen shown |
| **Test Steps** | 1. Copy "258369" to clipboard<br>2. Click Box 1<br>3. Paste (Ctrl+V) |
| **Expected Result** | All 6 boxes auto-populate with each digit; cursor lands in Box 6; Submit OTP becomes the focus target |
| **Priority** | Medium |

---

### ADM_LGN_069 — Backspace on empty OTP box moves focus to previous box

| Field | Value |
|-------|-------|
| **Module** | ADM – Login |
| **Pre-conditions** | OTP screen; digits "258" entered in boxes 1-3 |
| **Test Steps** | 1. Click Box 4 (empty)<br>2. Press Backspace |
| **Expected Result** | Focus moves back to Box 3; existing digit "8" cleared from Box 3 |
| **Priority** | Low |

---

## [FSD-CORRECTION] New TCs — Source-verified behaviour and known security gaps

### ADM_LGN_FSD_041 — [BUG-REF: BUG-AUTH-002] OTP delivered via Epinet SMS (not Kaleyra)

| Field | Value |
|-------|-------|
| **Module** | ADM – Login / API |
| **Pre-conditions** | Network log capture available on backend; valid admin mobile |
| **Test Steps** | 1. POST `/api/v1/auth/admin/send-otp` with `{phone:"8888888888"}`<br>2. Inspect outbound HTTP traffic from backend |
| **Expected Result** | Outbound SMS hits `https://epinetinfo.in/api/pushsms` with user `HOABLDIGITAL`, DLT template id `1007393289666667759`, recipient `918888888888`. NO call to Kaleyra. Source: `services/api/whatsapp.service.js:92-122`. |
| **Priority** | High |

---

### ADM_LGN_FSD_042 — [BUG-REF: BUG-AUTH-003] OTP is generated with insecure Math.random()

| Field | Value |
|-------|-------|
| **Module** | ADM – Login / Security |
| **Pre-conditions** | Source-code review or repeated OTP generation |
| **Test Steps** | 1. Trigger 1000 OTP requests on UAT (script)<br>2. Analyse distribution and predictability of OTPs |
| **Expected Result** | OTP is generated via `Math.floor(100000 + Math.random() * 900000)` — NOT `crypto.randomInt` or equivalent CSPRNG. Document as known security gap; recommend migration to `crypto.randomInt`. Source: `controllers/auth.controller.js:52-54`. |
| **Priority** | Medium |

---

### ADM_LGN_FSD_043 — [BUG-REF: BUG-AUTH-004] OTP stored as plaintext on users.otp

| Field | Value |
|-------|-------|
| **Module** | ADM – Login / DB |
| **Pre-conditions** | DB query access |
| **Test Steps** | 1. POST send-OTP for admin user<br>2. Query `SELECT otp, otpExpires FROM users WHERE phone='8888888888'` |
| **Expected Result** | `otp` column contains the literal 6-digit code in plaintext. Document gap — should be hashed (bcrypt or HMAC). |
| **Priority** | Medium |

---

### ADM_LGN_FSD_044 — [FSD-CORRECTION] Admin Master OTP works in ALL environments including production

| Field | Value |
|-------|-------|
| **Module** | ADM – Login / Security |
| **Pre-conditions** | `ADMIN_MASTER_OTP` configured in target environment |
| **Test Steps** | 1. POST send-OTP for any admin user<br>2. POST verify-OTP with `ADMIN_MASTER_OTP` value |
| **Expected Result** | Verify succeeds regardless of NODE_ENV — there is NO production gate on master OTP. Document operational risk; confirm with security team master OTP rotation policy. Source: `controllers/auth.controller.js:725-731` (no env check). |
| **Priority** | High |

---

### ADM_LGN_FSD_045 — Logout returns success but JWT remains valid until natural expiry

| Field | Value |
|-------|-------|
| **Module** | ADM – Login / Session |
| **Pre-conditions** | Admin logged in with active JWT |
| **Test Steps** | 1. Capture JWT bearer token<br>2. POST `/api/v1/auth/logout` with bearer token — expect 200<br>3. Immediately call any protected endpoint (e.g. `GET /api/v1/admin/dashboard/all-buyers`) using the same JWT |
| **Expected Result** | Step 2: 200 `"Logged out successfully"`. Step 3: protected endpoint STILL returns 200 — JWT is stateless, no server-side blacklist exists. Token remains valid until `exp` claim expires (default 1d). Source: `controllers/auth.controller.js:36-46`. |
| **Priority** | High |

---

### ADM_LGN_FSD_046 — Fire-and-forget WhatsApp/SMS — "OTP sent successfully" returned even on dispatch failure

| Field | Value |
|-------|-------|
| **Module** | ADM – Login / Notifications |
| **Pre-conditions** | Backend with simulated outbound network failure to epinet/botspice |
| **Test Steps** | 1. Block outbound DNS to `epinetinfo.in` and `botspice` endpoints<br>2. POST send-OTP for admin |
| **Expected Result** | Backend returns 200 `"OTP sent successfully"` even though no message actually left the system. The user object still has `otp` and `otpExpires` set. Verified: send calls are NOT awaited (`controllers/auth.controller.js:590-600`). |
| **Priority** | Medium |

---

### ADM_LGN_FSD_047 — Phone format regex defined but not enforced — any string passes

| Field | Value |
|-------|-------|
| **Module** | ADM – Login / API |
| **Pre-conditions** | UAT admin user with phone `8888888888` |
| **Test Steps** | 1. POST send-OTP with `phone:"abc"` — observe response<br>2. POST send-OTP with `phone:"12345"` — observe response |
| **Expected Result** | Yup-level phone-format check (`/^[6-9]\d{9}$/`) is commented out (`validations/auth.validations.js:43`). Backend will accept any string and fail only on `User.findOne` lookup, returning `400 "User not found"`. Document validation gap. |
| **Priority** | Medium |

---

### ADM_LGN_FSD_048 — `lastLogin` assignment is silently dropped (column commented out)

| Field | Value |
|-------|-------|
| **Module** | ADM – Login / DB |
| **Pre-conditions** | Admin successfully logs in via OTP |
| **Test Steps** | 1. Successful login<br>2. Query `SHOW COLUMNS FROM users LIKE 'last_login'` |
| **Expected Result** | Column may or may not exist depending on migrations. The `user.lastLogin = new Date()` assignment in controller (`auth.controller.js:859-861`) is silently no-op when column absent — Sequelize drops unknown attributes. Document inconsistency. |
| **Priority** | Low |

---
