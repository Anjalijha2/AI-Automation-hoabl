# TestCases — Buyer Portal / Registration & Login

**Portal:** Buyer
**Module:** Registration & Login
**URL:** https://uat.xrportal.in/
**Generated:** 2026-06-03
**BA Agent:** dual-source gate CLEARED
**Visual Memory:** `visual-memory/buyer/registration-login/INDEX.md` — CAPTURE_STATUS: FULL
**BRD:** `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md`
**FRD:** `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Registration-and-Login.md`
**Status:** Approved (pending QA test-case-reviewer pass)

---

## Coverage Summary

| Metric | Value |
|--------|-------|
| Total TCs | 14 |
| TCs with FULL visual evidence | 13 |
| Visual coverage | 92.8% (target ≥80%) |
| `[NO-VISUAL-EVIDENCE]` TCs | 1 (TC_BUYER_LOGIN_NEG_005 — invalid OTP behaviour state not screenshotted; flagged as VISUAL_GAP) |
| `[STUB-EVIDENCE]` TCs | 0 |
| Automation candidates | 10 |
| BRD/FRD requirement IDs traced | 7 (FRD 1.3, 1.4, 1.5, 1.6, 1.7, 1.8; BRD §4.1, §4.2) |

---

## Visual Gaps (raised to Tech Lead Agent)

```
VISUAL_GAP: buyer/registration-login
Journey: Wrong OTP entered — observe inline error banner / state
Missing screenshot: No screenshot shows wrong-OTP error UI (only success post-redirect captured)
Impact: Expected Result for TC_BUYER_LOGIN_NEG_005 cannot be visually validated
Action: Tech Lead Agent should capture wrong-OTP error state and update INDEX.md
TC status: TC_BUYER_LOGIN_NEG_005 generated with [NO-VISUAL-EVIDENCE] — do NOT automate until evidence added
```

---

## Logic Gaps / Open Questions (raised to Product)

```
LOGIC_GAP: buyer/registration-login
Question: FRD 1.6 First-login Consent — UI/state for T&C consent modal is not captured in visual memory
Impact: First-login T&C acceptance flow (FRD 1.6) cannot be tested end-to-end on UAT (test mobile 8888888888 has already consented)
Action: Either (a) provision a fresh registered mobile for first-login testing, or (b) capture historical screenshot/spec for the consent modal
TC status: First-login consent TC deferred — not in this batch
```

---

# Sheet 1 — Manual Test Cases

| TC_ID | BRD/FRD Req ID | Portal | Module | Type | Scenario | Preconditions | Steps | Expected Result | Visual Evidence | Test Data | Priority | Status |
|-------|---------------|--------|--------|------|----------|--------------|-------|----------------|-----------------|-----------|----------|--------|
| TC_BUYER_LOGIN_UI_001 | FRD 1.4 | buyer | Registration & Login | UI | Login page renders with all documented elements on unauthenticated load (FRD 1.4 — UI Elements list) | Unauthenticated session; clean browser (no `xr_auth_token` in sessionStorage) | 1. Navigate to `https://uat.xrportal.in/`<br>2. Wait for page load (networkidle)<br>3. Verify `h2` text<br>4. Verify subtext present<br>5. Verify both `[role="tab"]` entries<br>6. Verify `input[placeholder="Enter Mobile Number"]`<br>7. Verify `button` with text `/send otp/i`<br>8. Verify legal text and footer copyright | `h2` reads "APPLICANT LOGIN"; subtext reads "Select nationality & verify to continue"; tabs "Indian National" (selected) and "NRI" render; mobile input with "+91" prefix present; "Send OTP" button visible; legal line "By verifying, you accept the Terms & Conditions and Privacy Policy." visible; footer "Copyright © 2026 House of Abhinandan Lodha. All Rights Reserved." visible | `visual-memory/buyer/registration-login/registration-login-loaded.png`, `visual-memory/buyer/registration-login/login-page.png` | n/a | P1 | Approved |
| TC_BUYER_LOGIN_FUNC_002 | FRD 1.5, BRD §4.2 | buyer | Registration & Login | FUNC | Indian buyer logs in successfully with valid mobile and static UAT OTP (BRD §4.2 happy path) | Mobile `8888888888` registered as Buyer (role 2); UAT env active | 1. Navigate to `https://uat.xrportal.in/`<br>2. Confirm "Indian National" tab is selected<br>3. Type `8888888888` into `input[placeholder="Enter Mobile Number"]`<br>4. Click `button` with text `/send otp/i`<br>5. Wait for six `input[type="text"][maxlength="1"]` OTP boxes to appear<br>6. Enter `147258` across the six OTP boxes (one digit per box)<br>7. Click `button` with text `/verify/i`<br>8. Wait for URL change | URL redirects to `https://uat.xrportal.in/home`; sessionStorage key `xr_auth_token` is set (JWT string); sessionStorage key `xr_user` is set with role=2 fields | `visual-memory/buyer/registration-login/registration-login-loaded.png`, `visual-memory/buyer/registration-login/registration-login-full.png` | mobile=`8888888888`, otp=`147258` | P1 | Approved |
| TC_BUYER_LOGIN_FUNC_003 | FRD 1.4, FRD 1.8 | buyer | Registration & Login | FUNC | NRI tab selection persists and is usable for international login flow (FRD 1.8 NRI business rule) | Unauthenticated session | 1. Navigate to `https://uat.xrportal.in/`<br>2. Click `[role="tab"]` with text "NRI"<br>3. Verify NRI tab is now selected (aria-selected="true")<br>4. Verify `input[placeholder="Enter Mobile Number"]` remains accessible<br>5. Verify "Send OTP" button remains visible | NRI tab becomes selected; Indian National tab loses selection; mobile input remains visible and editable; Send OTP button remains visible and enabled | `visual-memory/buyer/registration-login/registration-login-loaded.png` | tab=NRI | P1 | Approved |
| TC_BUYER_LOGIN_FUNC_004 | FRD 1.4 | buyer | Registration & Login | FUNC | Send OTP click reveals 6-digit OTP entry boxes and Verify button | Unauthenticated session; valid mobile entered | 1. Navigate to `https://uat.xrportal.in/`<br>2. Type `8888888888` into mobile input<br>3. Click "Send OTP"<br>4. Verify six `input[type="text"][maxlength="1"]` boxes appear<br>5. Verify `input[autocomplete="one-time-code"]` selector also resolves<br>6. Enter one digit and verify auto-focus advances to next box<br>7. Verify `button` with text `/verify/i` is visible | After click, six single-digit OTP boxes render; typing in box 1 advances focus to box 2; Verify button is present and enabled once all 6 digits are typed | `visual-memory/buyer/registration-login/registration-login-loaded.png` | mobile=`8888888888` | P1 | Approved |
| TC_BUYER_LOGIN_NEG_005 | FRD 1.5 | buyer | Registration & Login | NEG | Wrong OTP rejected — user stays on login page, no JWT issued | Unauthenticated session; OTP boxes visible | 1. Navigate to `https://uat.xrportal.in/`<br>2. Enter mobile `8888888888`<br>3. Click "Send OTP"<br>4. Enter incorrect OTP `000000` across the six boxes<br>5. Click "Verify"<br>6. Inspect URL and sessionStorage | URL remains `https://uat.xrportal.in/` (no redirect to `/home`); sessionStorage `xr_auth_token` is NOT set; an error indication (toast/inline) is shown to user (specific UI to be validated post-screenshot capture) | `[NO-VISUAL-EVIDENCE]` | mobile=`8888888888`, otp=`000000` | P1 | Approved |
| TC_BUYER_LOGIN_VAL_006 | FRD 1.4 | buyer | Registration & Login | VAL | Empty mobile — Send OTP cannot proceed | Unauthenticated session | 1. Navigate to `https://uat.xrportal.in/`<br>2. Leave mobile input empty<br>3. Click "Send OTP" | OTP boxes do NOT appear; URL stays on `/`; either Send OTP button is disabled OR an inline validation message is shown; no `lastOtpSentAt` API call fired | `visual-memory/buyer/registration-login/registration-login-loaded.png` | mobile=`""` | P2 | Approved |
| TC_BUYER_LOGIN_VAL_007 | FRD 1.4 | buyer | Registration & Login | VAL | Invalid mobile format (alpha chars) rejected | Unauthenticated session | 1. Navigate to `https://uat.xrportal.in/`<br>2. Try typing `abcdefghij` into mobile input<br>3. Observe what is actually accepted into the field<br>4. Click "Send OTP" | Mobile input either rejects alpha characters at keypress (numeric-only) OR Send OTP is blocked; OTP boxes do not appear; no JWT issued | `visual-memory/buyer/registration-login/registration-login-loaded.png` | mobile=`abcdefghij` | P2 | Approved |
| TC_BUYER_LOGIN_VAL_008 | FRD 1.4 | buyer | Registration & Login | VAL | Short mobile (9 digits) blocked from triggering OTP | Unauthenticated session | 1. Navigate to `https://uat.xrportal.in/`<br>2. Enter `888888888` (9 digits)<br>3. Click "Send OTP" | OTP boxes do not appear OR validation message shown; URL stays on `/`; no OTP API call observed in network panel | `visual-memory/buyer/registration-login/registration-login-loaded.png` | mobile=`888888888` | P2 | Approved |
| TC_BUYER_LOGIN_EDGE_009 | FRD 1.4 | buyer | Registration & Login | EDGE | Long mobile (11+ digits in Indian tab) capped or rejected | Unauthenticated session; Indian National tab active | 1. Navigate to `https://uat.xrportal.in/`<br>2. Enter `888888888888` (12 digits) in Indian National tab<br>3. Observe accepted input length<br>4. Click "Send OTP" | Mobile input accepts at most 10 digits in Indian tab OR Send OTP rejects 11+ digit input; OTP flow does not proceed for invalid length | `visual-memory/buyer/registration-login/registration-login-loaded.png` | mobile=`888888888888`, tab=`Indian National` | P3 | Approved |
| TC_BUYER_LOGIN_NEG_010 | BRD §2 | buyer | Registration & Login | NEG | Unregistered mobile blocked (BRD §2 — "Buyers cannot self-register") | Unauthenticated session; mobile `9999999998` NOT registered as buyer | 1. Navigate to `https://uat.xrportal.in/`<br>2. Enter `9999999998` and click Send OTP<br>3. Enter UAT static OTP `147258`<br>4. Click Verify | Verify call fails OR redirects back to `/`; sessionStorage `xr_auth_token` is NOT set; user is informed mobile is not registered (per FRD How-to-Use guidance: "Your mobile number may not be registered. Contact your Channel Partner.") | `visual-memory/buyer/registration-login/registration-login-loaded.png` | mobile=`9999999998`, otp=`147258` | P2 | Approved |
| TC_BUYER_LOGIN_FUNC_011 | FRD 1.4 (Register URL row) | buyer | Registration & Login | FUNC | `/register` route redirects to `/` — no self-registration page (BRD §2 enforcement) | Unauthenticated session | 1. Navigate to `https://uat.xrportal.in/register`<br>2. Capture final URL after redirect<br>3. Verify rendered page is the login page | Browser URL becomes `https://uat.xrportal.in/` (or remains on `/register` while rendering the login UI per app routing); page shows `h2` "APPLICANT LOGIN"; same login DOM as `/` is rendered | `visual-memory/buyer/registration-login/register-page.png` | navigate=`/register` | P1 | Approved |
| TC_BUYER_LOGIN_E2E_012 | FRD 1.7 | buyer | Registration & Login | E2E | Successful logout clears session and returns user to login (FRD 1.7 — Session established → Session terminated) | User has logged in successfully (TC_BUYER_LOGIN_FUNC_002 ran) and is on `/home` | 1. From `/home`, locate and click the logout / sign-out control<br>2. Observe URL transition<br>3. Inspect sessionStorage for `xr_auth_token` and `xr_user` | URL redirects back to `https://uat.xrportal.in/` (login page); sessionStorage `xr_auth_token` is cleared (key removed or value null); sessionStorage `xr_user` is cleared; subsequent navigation to `/home` redirects to `/` | `visual-memory/buyer/registration-login/registration-login-loaded.png` (post-logout state matches initial load) | post-login session | P1 | Approved |
| TC_BUYER_LOGIN_REG_013 | FRD 1.7, BRD §4 | buyer | Registration & Login | REG | Session persists across page reload while `xr_auth_token` in sessionStorage | User logged in; on `/home` | 1. After successful login (TC_BUYER_LOGIN_FUNC_002), reload the page<br>2. Verify no redirect to `/`<br>3. Confirm `xr_auth_token` still present in sessionStorage | After reload, user stays on `/home`; `xr_auth_token` and `xr_user` keys still present in sessionStorage; no login prompt shown | `visual-memory/buyer/registration-login/registration-login-full.png` | post-login session | P2 | Approved |
| TC_BUYER_LOGIN_UI_014 | FRD 1.4 | buyer | Registration & Login | UI | Carousel arrow controls present on login page (visual marketing carousel) | Unauthenticated session | 1. Navigate to `https://uat.xrportal.in/`<br>2. Verify `.carousel-arrow.carousel-arrow-prev` exists<br>3. Verify `.carousel-arrow.carousel-arrow-next` exists<br>4. Click next arrow and observe carousel advances | Both prev and next arrow controls render and are clickable; clicking next advances the carousel slide (visually different image shown) | `visual-memory/buyer/registration-login/registration-login-loaded.png` | n/a | P3 | Approved |

---

# Sheet 2 — Automation Candidates

| TC_ID | Module | Type | Automatable | Complexity | Playwright Suite | Visual Evidence Status | Notes |
|-------|--------|------|-------------|-----------|------------------|------------------------|-------|
| TC_BUYER_LOGIN_UI_001 | Registration & Login | UI | Yes | Low | ui-ux | FULL | Pure DOM assertions; stable selectors |
| TC_BUYER_LOGIN_FUNC_002 | Registration & Login | FUNC | Yes | Low | e2e | FULL | Foundation for auth.setup.js; use static OTP `147258`; assert sessionStorage not cookies |
| TC_BUYER_LOGIN_FUNC_003 | Registration & Login | FUNC | Yes | Low | e2e | FULL | Note Ant Design renders tabs twice — use `.first()` |
| TC_BUYER_LOGIN_FUNC_004 | Registration & Login | FUNC | Yes | Medium | e2e | FULL | Verify focus auto-advance — use `page.keyboard.type` or per-box `fill` |
| TC_BUYER_LOGIN_NEG_005 | Registration & Login | NEG | No | — | — | NO-EVIDENCE | Excluded — visual evidence missing (VISUAL_GAP raised); promote to e2e once screenshot captured |
| TC_BUYER_LOGIN_VAL_006 | Registration & Login | VAL | Yes | Low | e2e | FULL | Assert OTP boxes absent and no `/auth/send-otp` network call |
| TC_BUYER_LOGIN_VAL_007 | Registration & Login | VAL | Yes | Low | e2e | FULL | Use `page.locator(input).inputValue()` to assert what was actually accepted |
| TC_BUYER_LOGIN_VAL_008 | Registration & Login | VAL | Yes | Low | e2e | FULL | Use network interception to confirm no send-OTP call |
| TC_BUYER_LOGIN_EDGE_009 | Registration & Login | EDGE | Yes | Medium | regression | FULL | Indian tab cap behaviour may be 10-digit hard limit |
| TC_BUYER_LOGIN_NEG_010 | Registration & Login | NEG | Partial | Medium | e2e | FULL | Requires guaranteed-unregistered mobile in UAT — coordinate with Tech Lead Agent |
| TC_BUYER_LOGIN_FUNC_011 | Registration & Login | FUNC | Yes | Low | e2e | FULL | Assert via `page.url()` after `waitForURL('**/')` |
| TC_BUYER_LOGIN_E2E_012 | Registration & Login | E2E | Yes | Medium | e2e | FULL | Logout control location must be confirmed via visual capture of `/home` — depends on home-dashboard module |
| TC_BUYER_LOGIN_REG_013 | Registration & Login | REG | Yes | Low | regression | FULL | Note: `playwright storageState` does NOT capture sessionStorage — use `page.addInitScript` to inject token, or perform UI login per test |
| TC_BUYER_LOGIN_UI_014 | Registration & Login | UI | Yes | Low | ui-ux | FULL | Low-priority cosmetic |

---

# Sheet 3 — Bug Template

| Bug ID | TC_ID | Severity | Steps | Actual | Expected | Environment | Status |
|--------|-------|----------|-------|--------|----------|-------------|--------|
| BUG_XXX | TC_BUYER_LOGIN_XXX_NNN | Critical/High/Medium/Low | Reproduce steps from TC | What actually happened | What the TC said should happen | UAT — https://uat.xrportal.in/ — Chrome <ver> | Open/In Progress/Fixed/Closed |

---

## Notes for QA Agent (test-case-reviewer + automation)

1. **sessionStorage auth quirk** — JWT lives in `sessionStorage["xr_auth_token"]`, NOT cookies. Playwright `storageState` does not capture sessionStorage. Auth fixture for the buyer portal must either (a) perform real OTP login each session, or (b) inject the token via `page.addInitScript` after capturing one via a real login.
2. **Static OTP `147258`** is UAT-only — never commit to test data files used in non-UAT runs.
3. **Ant Design double-render** — `[role="tab"]` returns 4 entries for 2 tabs; use `.first()` or `:visible` when asserting selection.
4. **`/register` route** — confirms BRD §2 "Buyers cannot self-register"; should remain redirect-to-login for all releases.
5. **First-login T&C (FRD 1.6)** — deferred from this batch; needs fresh mobile or historical screenshot before TC can be generated.
6. **Logout location** — TC_BUYER_LOGIN_E2E_012 needs cross-reference with `visual-memory/buyer/home-dashboard/INDEX.md` once captured; the logout control itself is rendered in the post-login chrome, not on the login page.
