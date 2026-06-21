# TestCases — Admin Portal / Login

**Generated:** 2026-06-03 (dual-source pipeline)
**Portal:** Admin
**Module:** Login
**URL:** https://uat-web.xrportal.in/admin
**Visual Memory:** `visual-memory/admin/login/INDEX.md` (CAPTURE_STATUS: **FULL** — 12 screens, captured 2026-05-17)
**BRD/FRD Source:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Login.md`
**Dual-Source Confirmed:** YES — UI selectors from INDEX.md Key Structural Notes; business rules from BRD §1–§11.6 (incl. 2026-05-21 backend gap reconciliation)
**Supersedes:** `manual-qa-repository/01-test-cases/admin-portal/login/TC_LOGIN.md` (legacy path — do NOT use; archive after Sprint sign-off)

---

## Auth Master Reference (authoritative — BRD §6 Rule 8 + §11.2)

UAT-only master credentials:
- **Mobile:** `8888888888`
- **Master OTP:** `258369` — `otpConfig.adminMasterOtp` (admin / sm roles only — confirmed in BRD §11.2)
- **Session TTL:** 1 day (BRD §6 Rule 7)
- **Pre-provisioning:** admin / sm / sm_admin must already exist in user table — unknown mobile returns HTTP 400 "User not found" (BRD §11.3)

Real SMS dispatch (any mobile other than `8888888888`) is gated by Epinet SMS — out of automation scope. Such TCs are flagged `[MANUAL-ONLY]`.

---

## Sheet 1 — Manual Test Cases

| TC_ID | BRD Req ID | Type | Scenario | Preconditions | Steps | Expected Result | Visual Evidence | Test Data | Priority | Status |
|-------|-----------|------|----------|---------------|-------|-----------------|-----------------|-----------|----------|--------|
| TC_LOGIN_UI_001 | BRD §1 + §4 Step 1 | UI | Verify Mobile Number screen renders all documented elements — admin entry point per BRD §1 | None (unauthenticated browser) | 1. Navigate to `https://uat-web.xrportal.in/admin` 2. Wait for `h2:has-text("Admin Login")` 3. Observe page structure | Page renders with HoABL logo top-left, side banner graphic, `h2` text "Admin Login", Mobile Number input prefixed with "+91", `Terms & Conditions` link, `Privacy Policy` link, **Send OTP** button beneath the field, and copyright footer "Copyright 2026 Growwithhoabl All Rights Reserved" | visual-memory/admin/login/mobile-screen-1920.png · visual-memory/admin/login/login-ui-001-mobile-screen.png | N/A | P1 | Pending |
| TC_LOGIN_UI_002 | BRD §4 Step 2 | UI | Verify OTP Entry screen renders all documented elements — Step 2 of login per BRD §4 | Mobile `8888888888` entered, Send OTP clicked | 1. From mobile screen, enter `8888888888` 2. Click **Send OTP** 3. Wait for `h2:has-text("ENTER OTP")` 4. Observe OTP screen structure | Page renders with `button.reset-btn.back-to-mobile` at top (back arrow), `h2` text "ENTER OTP", sub-text "Enter the OTP sent to your phone number", six OTP input boxes `input[aria-label="OTP Input 1"]` through `input[aria-label="OTP Input 6"]`, countdown timer (e.g. "57s"), `button.common-link` "Re-Send OTP" (disabled while timer > 0), and `button.ant-btn-submit` "Submit OTP" | visual-memory/admin/login/otp-screen.png · visual-memory/admin/login/login-ui-002-otp-screen.png | mobile=`8888888888` | P1 | Pending |
| TC_LOGIN_UI_003 | BRD §4 Step 1 (responsive) | UI | Mobile screen renders correctly at 1920×900 — primary admin breakpoint | None | 1. Set viewport to 1920×900 2. Navigate to `/admin` 3. Capture rendered layout | All elements from TC_LOGIN_UI_001 visible without horizontal scroll. Banner image and form panel side-by-side. Layout matches captured baseline | visual-memory/admin/login/login-ui-005-1920.png · visual-memory/admin/login/mobile-screen-1920.png | viewport=1920×900 | P2 | Pending |
| TC_LOGIN_UI_004 | BRD §4 Step 1 (responsive) | UI | Mobile screen renders correctly at 1440×900 — secondary admin breakpoint | None | 1. Set viewport to 1440×900 2. Navigate to `/admin` 3. Capture rendered layout | All elements from TC_LOGIN_UI_001 remain visible and well-spaced; no overflow; CTA still beneath the field | visual-memory/admin/login/login-ui-006-1440.png | viewport=1440×900 | P2 | Pending |
| TC_LOGIN_UI_005 | INDEX.md Key Structural Notes (selectors) | UI | Verify the documented selectors resolve to exactly one element each — guards POMs against silent selector drift | Unauthenticated session on `/admin`, then progress to OTP screen | 1. On mobile screen, query `h2:has-text("Admin Login")` — expect 1 hit 2. Enter `8888888888`, click Send OTP 3. On OTP screen, query each selector: `h2:has-text("ENTER OTP")`, `button.reset-btn.back-to-mobile`, `button.common-link`, `input[aria-label="OTP Input 1"]`..`input[aria-label="OTP Input 6"]`, `button.ant-btn-submit` | Every documented selector resolves to exactly one DOM node. No selector returns 0 or >1. OTP inputs return exactly 6 nodes. Confirms INDEX.md Key Structural Notes are accurate | visual-memory/admin/login/otp-screen.png | mobile=`8888888888` | P1 | Pending |
| TC_LOGIN_FUNC_001 | BRD §4 Step 1 + §6 Rule 1 + §5 (Logging In Successfully) | FUNC | Admin enters valid 10-digit mobile and clicks Send OTP — screen transitions from Mobile to OTP entry per BRD §5 | Admin pre-provisioned in user table (BRD §11.3); on Mobile screen | 1. Navigate to `/admin` 2. Type `8888888888` into Mobile Number field 3. Click **Send OTP** button 4. Wait for `h2:has-text("ENTER OTP")` | Screen transitions to OTP entry. Six `input[aria-label="OTP Input X"]` boxes render; countdown timer starts (decrementing). API `POST /auth/sendOtp` carries field `phone: "8888888888"` (NOT `mobile`) per INDEX.md API note | visual-memory/admin/login/otp-screen-e2e.png | mobile=`8888888888` | P1 | Pending |
| TC_LOGIN_FUNC_002 | BRD §4 Steps 4-7 + §5 + §6 Rule 6 | FUNC | Admin enters master OTP `258369` and clicks Submit OTP — redirects to `/admin/customers` per BRD §6 Rule 6 | UAT master mobile `8888888888` entered, OTP screen displayed | 1. From OTP screen, type each digit of `258369` into `input[aria-label="OTP Input 1"]`..`input[aria-label="OTP Input 6"]` (cursor auto-advances per BRD §4 Step 6) 2. Click `button.ant-btn-submit` "Submit OTP" 3. Wait for URL = `/admin/customers` | Successful authentication: URL becomes `https://uat-web.xrportal.in/admin/customers`. Customers list page renders. API `POST /auth/verifyOtp` returns 200 with JWT in `response.data.token` (wrapped envelope per INDEX.md); session cookie/storage persisted for 1 day (BRD §6 Rule 7); `permissions: { moduleId: [actionIds] }` map present in response per BRD §11.5 | visual-memory/admin/login/post-login-customers-page.png | mobile=`8888888888`; otp=`258369` | P1 | Pending |
| TC_LOGIN_FUNC_003 | BRD §4 (auto-advance) + §6 Rule 3 | FUNC | Cursor auto-advances to the next OTP box after each digit — BRD §6 Rule 3 + §4 Step 6 | OTP screen displayed for `8888888888` | 1. Click `input[aria-label="OTP Input 1"]` to focus 2. Type `2` 3. Observe focus 4. Type `5` 5. Continue typing `8369` 6. Observe focus after each digit | After typing each digit, focus shifts to the next `input[aria-label="OTP Input N+1"]` without manual tabbing. After the 6th digit, focus may remain on box 6 or move to the Submit button. All six boxes display the correct digit | visual-memory/admin/login/otp-screen.png | otp=`258369` | P2 | Pending |
| TC_LOGIN_FUNC_004 | BRD §4 "Going Back to Change Your Mobile Number" + §5 | FUNC | Back arrow on OTP screen returns to Mobile entry screen with mobile field editable | OTP screen displayed | 1. Click `button.reset-btn.back-to-mobile` 2. Observe screen 3. Inspect mobile field | Screen returns to Mobile Number entry (`h2:has-text("Admin Login")` visible again); mobile field is editable; user can type a different 10-digit number | visual-memory/admin/login/back-to-mobile-screen.png | mobile=`8888888888` | P2 | Pending |
| TC_LOGIN_FUNC_005 | BRD §6 Rule 6 + §9 Step 7 | FUNC | Post-login landing page is exactly `/admin/customers` — never `/admin/dashboard` or any other module | Master OTP submitted successfully | 1. Complete TC_LOGIN_FUNC_002 2. Read URL after redirect 3. Verify presence of Customers page elements (sidebar with Customers active) | URL = `https://uat-web.xrportal.in/admin/customers` exactly. Customers page renders with left sidebar (Customers entry active/highlighted). Confirms BRD §6 Rule 6 landing rule | visual-memory/admin/login/post-login-customers-page.png | mobile=`8888888888`; otp=`258369` | P1 | Pending |
| TC_LOGIN_FUNC_BACK | BRD §4 "Going Back" + §5 | FUNC | After pressing Back from OTP, user can enter a new mobile and continue normally | OTP screen for `8888888888` | 1. Click `button.reset-btn.back-to-mobile` 2. Clear mobile field 3. Type a different valid mobile 4. Click Send OTP | Screen returns to Mobile entry; new mobile accepted; Send OTP transitions to fresh OTP screen with new countdown | visual-memory/admin/login/back-to-mobile-screen.png · visual-memory/admin/login/otp-screen.png | mobile1=`8888888888`; mobile2=`8888888888` (re-entered) | P2 | Pending |
| TC_LOGIN_VAL_001 | BRD §7 (Mobile empty) + §6 Rule 1 | VAL | Send OTP with empty mobile field — no API call, stays on login page (BRD §7) | None | 1. On Mobile screen, leave field empty 2. Click **Send OTP** | Nothing happens — no transition to OTP screen, no error toast required by BRD, screen remains on Mobile entry. (BRD §7: "Clicking Send OTP does nothing; stays on login page") | visual-memory/admin/login/mobile-screen.png | mobile=`` (empty) | P1 | Pending |
| TC_LOGIN_VAL_002 | BRD §7 (fewer than 10 digits) + §6 Rule 1 | VAL | Send OTP with fewer than 10 digits — OTP is not sent | None | 1. Type `888888` (6 digits) into Mobile Number field 2. Click **Send OTP** | OTP is not sent; screen does NOT transition to OTP entry; mobile field remains | visual-memory/admin/login/mobile-screen.png | mobile=`888888` | P1 | Pending |
| TC_LOGIN_VAL_003 | BRD §7 (letters/special chars blocked) + §6 Rule 2 | VAL | Mobile field blocks letters and special characters at the keyboard level — BRD §6 Rule 2 | None | 1. Click Mobile Number field 2. Attempt to type `abcde` 3. Attempt to type `!@#$%` 4. Attempt to type `987-654` | Letters, special characters, and the hyphen are NOT accepted by the field — only digits appear. Field value contains only `987654` (or empty if hyphens/letters were the only input) | visual-memory/admin/login/mobile-screen.png | mobile attempts: `abcde`, `!@#$%`, `987-654` | P2 | Pending |
| TC_LOGIN_VAL_004 | BRD §4 "Entering the Wrong OTP" + §7 + §5 failure path | VAL | Entering an incorrect 6-digit OTP shows an error and keeps user on OTP screen (no account lock per BRD §6 Rule 5) | OTP screen for `8888888888` | 1. Enter `111111` (or any incorrect 6 digits other than `258369`) 2. Click `button.ant-btn-submit` "Submit OTP" 3. Observe error state | Error message renders on the OTP screen (visible in captured screenshot); user remains on the OTP entry screen; six OTP boxes still rendered; user may retry without account lock per BRD §6 Rule 5 | visual-memory/admin/login/wrong-otp-error.png | mobile=`8888888888`; otp=`111111` | P1 | Pending |
| TC_LOGIN_VAL_005 | BRD §7 (OTP empty) | VAL | Submit OTP with all six boxes empty — submission rejected | OTP screen for `8888888888` | 1. Do not enter any digits 2. Click `button.ant-btn-submit` "Submit OTP" | Submission does not proceed; user remains on OTP screen; no redirect to `/admin/customers` | visual-memory/admin/login/otp-screen.png | otp=`` (empty) | P1 | Pending |
| TC_LOGIN_VAL_006 | BRD §7 (OTP fewer than 6 digits) | VAL | Submit OTP with fewer than 6 digits — login rejected | OTP screen for `8888888888` | 1. Enter `2583` (4 digits) into the first four boxes 2. Click `button.ant-btn-submit` "Submit OTP" | Login is rejected; user remains on OTP entry screen; no redirect | visual-memory/admin/login/otp-screen.png | otp=`2583` | P1 | Pending |
| TC_LOGIN_VAL_007 | BRD §7 (all zeros rejected) | VAL | Mobile `0000000000` — OTP rejected per BRD §7 | None | 1. Type `0000000000` into Mobile field 2. Click **Send OTP** | OTP rejected — either UI prevents transition OR backend rejects on subsequent Submit OTP. No successful login. (BRD §7 "OTP rejected") | visual-memory/admin/login/mobile-screen.png | mobile=`0000000000` | P2 | Pending |
| TC_LOGIN_E2E_001 | BRD §5 (full success flow §1→§7) + §9 User Journey Map | E2E | Full happy-path login from `/admin` to authenticated dashboard view — covers BRD §9 Steps 1-7 in one run | Master mobile pre-provisioned (BRD §11.3); clean browser session | 1. Navigate to `https://uat-web.xrportal.in/admin` 2. Enter `8888888888` in mobile field 3. Click **Send OTP** 4. Wait for OTP screen 5. Enter `258369` digit-by-digit into the six OTP boxes 6. Click `button.ant-btn-submit` "Submit OTP" 7. Wait for `/admin/customers` URL 8. Verify sidebar / dashboard navigation works | All seven BRD §9 journey steps execute in order. Final URL = `/admin/customers`. Admin authenticated session is usable for downstream module testing. JWT received per `response.data.token`; session valid for 1 day (BRD §6 Rule 7) | visual-memory/admin/login/dashboard-after-login.png · visual-memory/admin/login/post-login-customers-page.png | mobile=`8888888888`; otp=`258369` | P1 | Pending |
| TC_LOGIN_E2E_002 | BRD §6 Rule 7 (session persistence) | E2E | Saved session file allows protected route access without re-auth — supports `automation-repository/fixtures/.auth/admin.json` pattern | Session previously saved by TC_LOGIN_E2E_001; less than 1 day old | 1. Load browser with storageState from saved auth file 2. Navigate directly to `https://uat-web.xrportal.in/admin/customers` 3. Verify no redirect to `/admin` login | URL stays on `/admin/customers`; Customers page renders without OTP prompt; JWT in storage still valid (< 1 day per BRD §6 Rule 7) | visual-memory/admin/login/post-login-customers-page.png | storageState=`automation-repository/fixtures/.auth/admin.json` | P1 | Pending |
| TC_LOGIN_NEG_001 | BRD §11.3 ("User not found" — admin/sm pre-provisioning) | NEG | Unknown mobile (admin role) is rejected with HTTP 400 "User not found" per BRD §11.3 `[MANUAL-ONLY]` | Mobile that does NOT exist in user table (NOT `8888888888`) | 1. Navigate to `/admin` 2. Enter a valid-format but unprovisioned mobile (e.g. `7000000001`) 3. Click **Send OTP** 4. Inspect network response for `POST /auth/sendOtp` | API returns HTTP 400 with payload `{ "message": "User not found" }`; UI surfaces error; user remains on Mobile screen. Real SMS NOT dispatched — backend rejects before SMS. Flagged `[MANUAL-ONLY]` because no master mobile shortcut applies for "unknown" mobiles and any other number triggers live SMS dispatch | visual-memory/admin/login/mobile-screen.png | mobile=`7000000001` (must not exist in user table) | P1 | Pending |
| TC_LOGIN_NEG_002 | BRD §11.4 ("Access revoked") | NEG | Pre-provisioned but `isActive=false` user gets HTTP 400 "Your access to the portal has been revoked" per BRD §11.4 `[MANUAL-ONLY]` | Pre-provisioned admin user record exists with `isActive=false` | 1. Navigate to `/admin` 2. Enter the revoked mobile 3. Click **Send OTP** 4. Inspect network response | API returns HTTP 400 with exact body string `"Your access to the portal has been revoked"`; UI surfaces error; user remains on Mobile screen. `[MANUAL-ONLY]` — requires DB seed of a revoked user; cannot use master `8888888888` | [NO-VISUAL-EVIDENCE] — error toast not captured in current INDEX.md (suggest Tech Lead Agent capture) | mobile=`<revoked-pre-provisioned>` | P1 | Pending |
| TC_LOGIN_NEG_003 | BRD §6 Rule 5 (no account lock) | NEG | After 5 consecutive wrong-OTP attempts, user is NOT locked out — can still retry per BRD §6 Rule 5 | OTP screen for `8888888888` | 1. Enter wrong OTP `111111`; click Submit OTP 2. Observe error 3. Re-enter `222222`; Submit 4. Repeat steps 2-3 with `333333`, `444444`, `555555` 5. On the 6th attempt enter the correct OTP `258369`; Submit | Each wrong attempt shows the error state but does not block subsequent attempts. The 6th attempt (correct OTP `258369`) succeeds and redirects to `/admin/customers`. Confirms BRD §6 Rule 5 — no lockout | visual-memory/admin/login/wrong-otp-error.png · visual-memory/admin/login/post-login-customers-page.png | mobile=`8888888888`; wrong OTPs `111111`/`222222`/`333333`/`444444`/`555555`; correct=`258369` | P2 | Pending |
| TC_LOGIN_NEG_004 | BRD §11.1 (Re-Send disabled before timer expires — UI only) | NEG | Re-Send OTP button is disabled while countdown timer > 0 — UI-level guard per BRD §6 Rule 4 / §11.1 (no backend cooldown) | OTP screen freshly loaded (timer > 0s, e.g. 57s) | 1. Immediately after OTP screen renders, locate `button.common-link` "Re-Send OTP" 2. Inspect `disabled` / `aria-disabled` attribute 3. Attempt to click the button | Re-Send button has `disabled` attribute (or `aria-disabled="true"`); click does nothing; no new OTP request fires. (BRD §11.1: backend has NO server cooldown — UI is the only enforcement) | visual-memory/admin/login/otp-screen.png | mobile=`8888888888` | P2 | Pending |
| TC_LOGIN_FUNC_006 | BRD §4 "If You Need to Re-Send the OTP" + §6 Rule 4 | FUNC | Re-Send OTP button becomes enabled once countdown timer hits 0 — clicking it triggers a new send `[MANUAL-ONLY]` | OTP screen for non-master mobile (real SMS path); patience to wait full countdown | 1. Enter a non-master valid pre-provisioned mobile 2. Click Send OTP 3. Wait until countdown timer reaches 0 (full duration per BRD §4) 4. Inspect `button.common-link` — should now be enabled 5. Click it 6. Observe new countdown and `POST /auth/sendOtp` network call | Timer reaches 0; Re-Send button loses `disabled` attribute; click triggers `POST /auth/sendOtp` (carrying `phone` field per INDEX.md), countdown restarts, new SMS dispatched via Epinet. `[MANUAL-ONLY]` because it requires (a) waiting the full timer in real time and (b) a real SMS-receiving mobile if using a non-master number; with master mobile the dispatch may short-circuit | visual-memory/admin/login/otp-screen.png | mobile=`<real-pre-provisioned>`; or `8888888888` for short-circuit variant | P2 | Pending |
| TC_LOGIN_EDGE_001 | BRD §11.1 (no backend rate limit on `sendOtp`) | EDGE | Direct API caller can request OTPs back-to-back — BRD §11.1 documents the UI-only enforcement `[MANUAL-ONLY]` | API access; valid pre-provisioned mobile | 1. Issue `POST https://uat-api.xrportal.in/auth/sendOtp` with body `{ "phone": "8888888888" }` 2. Immediately issue the same request again 3. Repeat 5x in < 5 seconds | All 5 calls return HTTP 200 (no 429 / rate-limit). Documents BRD §11.1 — backend cooldown is commented out in `auth.controller.js:558-568`. UI Re-Send timer (TC_LOGIN_NEG_004) is the ONLY enforcement layer. `[MANUAL-ONLY]` until backend implements throttle | [NO-VISUAL-EVIDENCE] — API-direct test, no UI surface | API: POST /auth/sendOtp body=`{"phone":"8888888888"}` × 5 rapid | P2 | Pending |
| TC_LOGIN_EDGE_002 | BRD §11 KNOWN ISSUE (logout no-op) | EDGE | Logout does NOT invalidate JWT server-side — token continues to work after logout for full 1-day TTL `[MANUAL-ONLY]` `[KNOWN-DEFECT]` | Active session; captured JWT from `response.data.token` | 1. Complete normal login (TC_LOGIN_FUNC_002), capture JWT 2. Click logout in admin UI 3. Verify `POST /auth/logout` returns HTTP 200 4. With captured JWT, issue an authenticated API call (e.g. `GET /admin/customers` with Bearer token) 5. Confirm response | Step 3: HTTP 200. Step 5: API call still SUCCEEDS — confirms BRD §11 KNOWN ISSUE that the JWT remains valid for its full 1-day lifetime after logout. **Do NOT mark this as a PASSING case — log as expected-fail tracking the known security defect.** Per BA Agent: do not run as a passing case until Developer Agent fixes source | [NO-VISUAL-EVIDENCE] — token-level test, no UI surface | logout endpoint = POST /auth/logout; captured Bearer JWT | P1 | Pending |
| TC_LOGIN_EDGE_003 | BRD §11.6 (sendOtpV3 extra-field tolerance) | EDGE | `sendOtpV3` silently accepts tracking fields (sessionId, hvCode, nri, fullUrl, UTM, gclid) and forwards to LeadSquared — Admin Portal does NOT send these; documents out-of-scope tolerance `[NOT-A-BUG]` | API access | 1. Issue `POST /auth/sendOtpV3` with body `{ "phone": "8888888888", "sessionId": "x", "hvCode": "y", "nri": true, "utm_source": "qa-test" }` 2. Inspect response | HTTP 200 — extra fields accepted without rejection. Forwarded to LeadSquared (out of admin scope per BRD §11.6 — do not flag as bug). Confirms backend tolerance | [NO-VISUAL-EVIDENCE] — API-direct, no UI surface | API: POST /auth/sendOtpV3 with tracking fields | P3 | Pending |
| TC_LOGIN_EDGE_004 | BRD §6 Rule 8 + §11.2 (master OTP) | EDGE | Master OTP `258369` only works for admin/sm roles (`adminMasterOtp`), NOT for user/cp roles (which use a different `masterOtp`) per BRD §11.2 | None | 1. Use master `258369` against admin mobile `8888888888` — TC_LOGIN_FUNC_002 (passes) 2. Cross-reference: attempting `258369` against a `cp` role mobile must fail per BRD §11.2 (cross-portal — not Admin Portal scope) | Within Admin Portal scope: master OTP `258369` succeeds for admin/sm. Documents asymmetry; out-of-scope cross-portal verification belongs to CP/Buyer test batches | visual-memory/admin/login/post-login-customers-page.png | admin mobile=`8888888888`; otp=`258369` | P3 | Pending |
| TC_LOGIN_EDGE_005 | BRD §4 + §6 Rule 3 (paste 6-digit OTP) | EDGE | Pasting a 6-digit string into OTP box 1 distributes one digit per box | OTP screen | 1. Copy the string `258369` to clipboard 2. Focus `input[aria-label="OTP Input 1"]` 3. Paste (Ctrl+V) 4. Observe all six boxes | Each of the six boxes contains one digit in order: `2`, `5`, `8`, `3`, `6`, `9`. Submit OTP button is enabled. Behaviour matches BRD §6 Rule 3 spirit. (Observed behaviour may vary — record outcome in run notes; mark as P3 since not BRD-mandated) | visual-memory/admin/login/otp-screen.png | otp=`258369` (clipboard) | P3 | Pending |
| TC_LOGIN_EDGE_006 | BRD §6 Rule 7 (1-day session TTL) | EDGE | Session JWT expires exactly 1 day after issuance — protected routes redirect to `/admin` login after that `[MANUAL-ONLY]` | Saved session > 24 hours old | 1. Use a session storageState file with token issued > 24 h ago 2. Navigate to `https://uat-web.xrportal.in/admin/customers` 3. Observe redirect | Browser redirects to `/admin` (Mobile screen) because JWT exp claim has passed. `[MANUAL-ONLY]` — requires either real 24-hour wait OR a custom-crafted JWT with past `exp` (security-sensitive) | visual-memory/admin/login/mobile-screen.png | stale storageState with expired JWT | P2 | Pending |

---

## Sheet 2 — Automation Candidates

Selection rule: FULL visual evidence AND no live-SMS dependency AND not flagged `[MANUAL-ONLY]` AND not API-direct only.

| TC_ID | Module | Type | Automatable | Complexity | Playwright Suite | Visual Evidence Status | Notes |
|-------|--------|------|-------------|------------|------------------|------------------------|-------|
| TC_LOGIN_UI_001 | Login | UI | Yes | Low | ui-ux | FULL | Asserts presence of Admin Login h2, mobile field, +91 prefix, Send OTP, footer |
| TC_LOGIN_UI_002 | Login | UI | Yes | Low | ui-ux | FULL | Asserts OTP screen elements; requires Send OTP transition with `8888888888` |
| TC_LOGIN_UI_003 | Login | UI | Yes | Low | cross-browser | FULL | Use Playwright `viewport: { width: 1920, height: 900 }` |
| TC_LOGIN_UI_004 | Login | UI | Yes | Low | cross-browser | FULL | Use Playwright `viewport: { width: 1440, height: 900 }` |
| TC_LOGIN_UI_005 | Login | UI | Yes | Low | regression | FULL | Selector-drift guard — assert `.count() === 1` for each documented selector; `.count() === 6` for OTP inputs |
| TC_LOGIN_FUNC_001 | Login | FUNC | Yes | Low | e2e | FULL | Auth.setup.js step 1 — mobile entry + Send OTP; intercept `POST /auth/sendOtp` and assert `phone` field name |
| TC_LOGIN_FUNC_002 | Login | FUNC | Yes | Medium | e2e | FULL | Auth.setup.js step 2 — OTP entry with master `258369`; assert redirect to `/admin/customers`; capture `response.data.token` JWT |
| TC_LOGIN_FUNC_003 | Login | FUNC | Yes | Low | e2e | FULL | Assert focus shifts after each `page.keyboard.type(digit)` call |
| TC_LOGIN_FUNC_004 | Login | FUNC | Yes | Low | e2e | FULL | Back button selector `button.reset-btn.back-to-mobile` |
| TC_LOGIN_FUNC_005 | Login | FUNC | Yes | Low | e2e | FULL | Assert `page.url() === ".../admin/customers"` after login |
| TC_LOGIN_FUNC_BACK | Login | FUNC | Yes | Low | e2e | FULL | Composite: Back then re-enter mobile |
| TC_LOGIN_VAL_001 | Login | VAL | Yes | Low | regression | FULL | Click Send OTP with empty field; assert no `h2:has-text("ENTER OTP")` appears within 2s |
| TC_LOGIN_VAL_002 | Login | VAL | Yes | Low | regression | FULL | Type `888888`, click Send OTP, assert no OTP screen transition |
| TC_LOGIN_VAL_003 | Login | VAL | Yes | Low | regression | FULL | `page.keyboard.type("abc-!@")` then assert mobile field value contains only digits |
| TC_LOGIN_VAL_004 | Login | VAL | Yes | Medium | e2e | FULL | Wrong OTP `111111`; assert error visible + still on OTP screen |
| TC_LOGIN_VAL_005 | Login | VAL | Yes | Low | regression | FULL | Click Submit OTP with all boxes empty; assert no redirect |
| TC_LOGIN_VAL_006 | Login | VAL | Yes | Low | regression | FULL | Enter 4 digits; click Submit OTP; assert no redirect |
| TC_LOGIN_VAL_007 | Login | VAL | Yes | Low | regression | FULL | Mobile `0000000000`; assert rejection at Send OTP or Submit OTP stage |
| TC_LOGIN_E2E_001 | Login | E2E | Yes | Medium | e2e | FULL | Primary login smoke — used by all other admin spec auth.setup.js |
| TC_LOGIN_E2E_002 | Login | E2E | Yes | Low | e2e | FULL | Use stored `storageState` from `automation-repository/fixtures/.auth/admin.json` |
| TC_LOGIN_NEG_003 | Login | NEG | Yes | Medium | regression | FULL | 5 wrong attempts then correct OTP — verify no lockout |
| TC_LOGIN_NEG_004 | Login | NEG | Yes | Low | ui-ux | FULL | Read `disabled` attr on `button.common-link` immediately after Send OTP |
| TC_LOGIN_EDGE_005 | Login | EDGE | Partial | Low | regression | FULL | Clipboard paste test — Playwright `page.evaluate(() => navigator.clipboard.writeText("258369"))` may require permission grant |

### Excluded from automation

| TC_ID | Reason |
|-------|--------|
| TC_LOGIN_NEG_001 | `[MANUAL-ONLY]` — requires real (unprovisioned) mobile triggering live Epinet SMS dispatch path |
| TC_LOGIN_NEG_002 | `[MANUAL-ONLY]` + `[NO-VISUAL-EVIDENCE]` — DB seed of revoked user; no captured error toast yet |
| TC_LOGIN_FUNC_006 | `[MANUAL-ONLY]` — requires waiting full countdown timer in real time and real SMS-receiving mobile |
| TC_LOGIN_EDGE_001 | `[MANUAL-ONLY]` + API-direct — no UI surface; backend throttle absent (KNOWN issue) |
| TC_LOGIN_EDGE_002 | `[MANUAL-ONLY]` + `[KNOWN-DEFECT]` — must NOT be run as a passing case until source fix per BRD §11 |
| TC_LOGIN_EDGE_003 | API-direct, no UI surface; out-of-scope cross-portal (LeadSquared) |
| TC_LOGIN_EDGE_004 | Cross-portal verification belongs to CP/Buyer test batches, not Admin Portal scope |
| TC_LOGIN_EDGE_006 | `[MANUAL-ONLY]` — requires either 24-h real wait or crafted-JWT test |

---

## Sheet 3 — Bug Report Template

| Bug ID | TC_ID | Severity | Steps to Reproduce | Actual Result | Expected Result | Environment | Status |
|--------|-------|----------|-------------------|---------------|-----------------|-------------|--------|
| BUG_LOGIN_001 (placeholder) | TC_LOGIN_EDGE_002 | Critical | 1. Login normally 2. Capture JWT 3. Click Logout 4. Re-issue API call with captured JWT | API call succeeds; JWT still valid | JWT should be invalidated server-side; API call should return 401 | UAT | OPEN — tracked under BRD §11 KNOWN ISSUE (GAP-TL-019) |

---

## Visual Coverage Stats

| Captured screen | Referenced by TCs |
|-----------------|-------------------|
| `mobile-screen-1920.png` | UI_001, UI_003 |
| `mobile-screen.png` | VAL_001, VAL_002, VAL_003, VAL_007, NEG_001, EDGE_006 |
| `otp-screen.png` | UI_002, UI_005, FUNC_003, VAL_005, VAL_006, NEG_004, FUNC_006, EDGE_005 |
| `login-ui-001-mobile-screen.png` | UI_001 |
| `login-ui-002-otp-screen.png` | UI_002 |
| `login-ui-005-1920.png` | UI_003 |
| `login-ui-006-1440.png` | UI_004 |
| `otp-screen-e2e.png` | FUNC_001 |
| `post-login-customers-page.png` | FUNC_002, FUNC_005, E2E_001, E2E_002, NEG_003, EDGE_004 |
| `dashboard-after-login.png` | E2E_001 |
| `wrong-otp-error.png` | VAL_004, NEG_003 |
| `back-to-mobile-screen.png` | FUNC_004, FUNC_BACK |

**All 12 captured screens are referenced by ≥1 TC.**

| Metric | Value |
|--------|-------|
| Total TCs | 30 |
| TCs with full visual evidence | 25 |
| TCs with [NO-VISUAL-EVIDENCE] (API-only / cross-module) | 5 (NEG_002, EDGE_001, EDGE_002, EDGE_003, EDGE_006 step) |
| Visual coverage | **25 / 30 = 83.3 %** |
| Automation candidates | 22 |
| `[MANUAL-ONLY]` TCs | 6 (NEG_001, NEG_002, FUNC_006, EDGE_001, EDGE_002, EDGE_006) |

**Visual coverage 83.3 % — exceeds the 80 % Approved threshold → APPROVED.**

---

## VISUAL_GAPs (open — Tech Lead Agent to capture)

| Journey | Missing screenshot | TC affected | Action |
|---------|--------------------|------------|--------|
| Revoked-user error toast | No screenshot shows the "Your access to the portal has been revoked" error state | TC_LOGIN_NEG_002 | Tech Lead Agent capture: seed a revoked admin user → submit OTP → screenshot error toast → add to INDEX.md |
| Logout UI surface | No screenshot of the admin sidebar logout control or post-logout state | TC_LOGIN_EDGE_002 | Tech Lead Agent capture: post-login sidebar showing logout entry → click → resulting screen |

Neither gap blocks Approval (TCs flagged `[NO-VISUAL-EVIDENCE]` and excluded from Sheet 2).

---

## GAP Reports

**None for this batch.** All BRD §1–§11.6 sections are fully covered. Known issues (BRD §11 KNOWN ISSUE — logout no-op) are explicitly tracked under TC_LOGIN_EDGE_002 as `[KNOWN-DEFECT]` per BRD §11.

---

## Last Run: 2026-06-21 18:38 IST

| TC_ID (spec) | xlsx Row(s) | Status | Test Data | Actual Result | Duration |
|---|---|---|---|---|---|
| TC_LOGIN_FUNC_001 | ADM_LGN_031 / ADM_LGN_018 / ADM_LGN_009 / ADM_LGN_001 / ADM_LGN_002 / ADM_LGN_007 / ADM_LGN_010 | ✅ PASS | — | All assertions matched expected | 2.1s |
| TC_LOGIN_FUNC_002 | ADM_LGN_009 / ADM_LGN_010 / ADM_LGN_003 | ✅ PASS | — | All assertions matched expected | 1.8s |
| TC_LOGIN_FUNC_003 | ADM_LGN_032 / ADM_LGN_033 / ADM_LGN_063 | ✅ PASS | — | All assertions matched expected | 1.9s |
| TC_LOGIN_FUNC_004 | ADM_LGN_035 | ✅ PASS | — | All assertions matched expected | 9.5s |
| TC_LOGIN_UI_006 | TC_LOGIN_UI_006 | ✅ PASS | — | All assertions matched expected | 1.3s |
| TC_LOGIN_UI_026 | TC_LOGIN_UI_026 | ✅ PASS | — | All assertions matched expected | 7.6s |
| TC_LOGIN_FUNC_019 | TC_LOGIN_FUNC_019 | ✅ PASS | — | All assertions matched expected | 1.8s |
| TC_LOGIN_FUNC_068 | TC_LOGIN_FUNC_068 | ✅ PASS | — | All assertions matched expected | 2.0s |
| TC_LOGIN_FUNC_069 | TC_LOGIN_FUNC_069 | ✅ PASS | — | All assertions matched expected | 2.1s |
| TC_LOGIN_FUNC_027 | TC_LOGIN_FUNC_027 | ✅ PASS | — | All assertions matched expected | 1.5s |
| TC_LOGIN_FUNC_028 | TC_LOGIN_FUNC_028 | ✅ PASS | — | All assertions matched expected | 61.3s |
| TC_LOGIN_FUNC_029 | TC_LOGIN_FUNC_029 | ✅ PASS | — | All assertions matched expected | 63.7s |
| TC_LOGIN_VAL_001 | TC_LOGIN_VAL_001 | ✅ PASS | — | All assertions matched expected | 2.3s |
| TC_LOGIN_VAL_002 | TC_LOGIN_VAL_002 | ✅ PASS | — | All assertions matched expected | 1.3s |
| TC_LOGIN_VAL_003 | TC_LOGIN_VAL_003 | ✅ PASS | — | All assertions matched expected | 1.4s |
| TC_LOGIN_VAL_004 | TC_LOGIN_VAL_004 | ✅ PASS | — | All assertions matched expected | 1.8s |
| TC_LOGIN_VAL_005 | TC_LOGIN_VAL_005 | ✅ PASS | — | All assertions matched expected | 1.4s |
| TC_LOGIN_NEG_001 | TC_LOGIN_NEG_001 | ✅ PASS | — | All assertions matched expected | 1.4s |
| TC_LOGIN_NEG_002 | TC_LOGIN_NEG_002 | ✅ PASS | — | All assertions matched expected | 1.5s |
| TC_LOGIN_NEG_003 | TC_LOGIN_NEG_003 | ✅ PASS | — | All assertions matched expected | 1.3s |
| TC_LOGIN_NEG_037 | TC_LOGIN_NEG_037 | ✅ PASS | — | All assertions matched expected | 1.5s |
| TC_LOGIN_NEG_038 | TC_LOGIN_NEG_038 | ✅ PASS | — | All assertions matched expected | 1.4s |
| TC_LOGIN_NEG_039 | TC_LOGIN_NEG_039 | ⏭ SKIP | — | Not executed | 0ms |
| TC_LOGIN_NEG_065 | TC_LOGIN_NEG_065 | ⏭ SKIP | — | Not executed | 0ms |
| TC_LOGIN_NEG_066 | TC_LOGIN_NEG_066 | ✅ PASS | — | All assertions matched expected | 1.8s |
| TC_LOGIN_EDGE_001 | TC_LOGIN_EDGE_001 | ✅ PASS | — | All assertions matched expected | 1.3s |
| TC_LOGIN_EDGE_002 | TC_LOGIN_EDGE_002 | ✅ PASS | — | All assertions matched expected | 1.7s |
| TC_LOGIN_E2E_001 | TC_LOGIN_E2E_001 | ✅ PASS | — | All assertions matched expected | 2.4s |
| TC_LOGIN_UI_040 | TC_LOGIN_UI_040 | ✅ PASS | — | All assertions matched expected | 1.3s |
| TC_LOGIN_FUNC_004b | TC_LOGIN_FUNC_004b | ✅ PASS | — | All assertions matched expected | 1.2s |
| TC_LOGIN_FUNC_005 | TC_LOGIN_FUNC_005 | ✅ PASS | — | All assertions matched expected | 1.2s |

---

## Last Run: 2026-06-21 18:41 IST

| TC_ID (spec) | xlsx Row(s) | Status | Test Data | Actual Result | Duration |
|---|---|---|---|---|---|
| TC_LOGIN_UI_001 | TC_LOGIN_UI_001 | ✅ PASS | — | All assertions matched expected | 3.2s |
| TC_LOGIN_UI_002 | TC_LOGIN_UI_002 | ✅ PASS | — | All assertions matched expected | 2.0s |
| TC_LOGIN_UI_003 | TC_LOGIN_UI_003 | ✅ PASS | — | All assertions matched expected | 1.9s |
| TC_LOGIN_UI_004 | TC_LOGIN_UI_004 | ✅ PASS | — | All assertions matched expected | 1.6s |
| TC_LOGIN_UI_005 | TC_LOGIN_UI_005 | ✅ PASS | — | All assertions matched expected | 4.0s |
| TC_LOGIN_UI_006 | TC_LOGIN_UI_006 | ✅ PASS | — | All assertions matched expected | 3.2s |
| TC_LOGIN_UI_007 | TC_LOGIN_UI_007 | ✅ PASS | — | All assertions matched expected | 1.1s |
| TC_LOGIN_UI_008 | TC_LOGIN_UI_008 | ✅ PASS | — | All assertions matched expected | 2.9s |
| TC_LOGIN_UI_009 | TC_LOGIN_UI_009 | ✅ PASS | — | All assertions matched expected | 2.2s |
| TC_LOGIN_UI_010 | TC_LOGIN_UI_010 | ✅ PASS | — | All assertions matched expected | 1.8s |

---

## Last Run: 2026-06-21 19:02 IST

| TC_ID (spec) | xlsx Row(s) | Status | Test Data | Actual Result | Duration |
|---|---|---|---|---|---|
| TC_LOGIN_VAL_074 | TC_LOGIN_VAL_074 | ⏭ SKIP | — | Not executed | 0ms |
| TC_LOGIN_NEG_079 | TC_LOGIN_NEG_079 | ⏭ SKIP | — | Not executed | 0ms |

---

## Last Run: 2026-06-21 19:03 IST

| TC_ID (spec) | xlsx Row(s) | Status | Test Data | Actual Result | Duration |
|---|---|---|---|---|---|
| TC_LOGIN_VAL_074 | TC_LOGIN_VAL_074 | ✅ PASS | — | All assertions matched expected | 4.8s |
| TC_LOGIN_NEG_079 | TC_LOGIN_NEG_079 | ✅ PASS | — | All assertions matched expected | 62.6s |
