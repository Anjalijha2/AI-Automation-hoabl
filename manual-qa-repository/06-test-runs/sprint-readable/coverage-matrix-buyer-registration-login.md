# Coverage Matrix — Buyer / Registration & Login

**Module:** Registration Login (Buyer Portal)
**Master JSON:** `manual-qa-repository/07-execution/_master-json/Buyer-RegistrationLogin.json`
**Sheet (on build):** `Registration Login - Master` (replaces `Registration Login` + `Registration Login (Exec)`)
**Sources (dual-source gate — both present):**
- Visual: `visual-memory/buyer/registration-login/INDEX.md` (CAPTURE_STATUS: FULL)
- BRD: `.claude/docs/hoabl-knowledge-base/Buyer-Portal/BRD/BUYER-BRD-Buyer-Portal.md`
- FS: `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Registration-and-Login.md`
- FRD: `.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FRD-Buyer-Portal.md`

**Totals:** 74 TCs · 57 preserved (baseline) · 17 new · 13 sub-modules · 0 duplicates · 0 renumbered.

---

## Features × 11 Coverage Dimensions

Legend: ✓ = covered (TC IDs listed) · — = N/A for this feature.

| # | Feature / Sub-Module | 1 Positive | 2 Full-form | 3 Mandatory/Valid | 4 Submit re-check/race | 5 Negative/error | 6 Context-sensitive | 7 Notifications | 8 UI-vs-backend | 9 Role/Auth/Security | 10 Integration/X-mod | 11 Boundary |
|---|----------------------|-----------|-------------|-------------------|------------------------|------------------|---------------------|-----------------|-----------------|----------------------|----------------------|-------------|
| 1 | Login Page — Load & Static Elements | BYR_LGN_001, UI_001 | UI_001, UI_015 | — | — | — | — | — | — | BYR_LGN_043 (no pw) | — | UI_016 (mobile vp) |
| 2 | Nationality Tabs (Indian/NRI) | BYR_LGN_002, FUNC_003 | BYR_LGN_002/003/004 | — | — | — | BYR_LGN_003/004 (tab-driven country code) | — | — | — | — | — |
| 3 | Mobile Entry & Send OTP | BYR_LGN_009, FUNC_004, BYR_LGN_012 | BYR_LGN_008 (button gate) | VAL_006, VAL_007, BYR_LGN_006, BYR_LGN_008 | — | BYR_LGN_010, NEG_010 | — | BYR_LGN_009 (Epinet+WhatsApp) | — | NEG_010 (unregistered) | BYR_LGN_009 (Epinet/Botspice) | BYR_LGN_007, EDGE_009, VAL_008 |
| 4 | OTP Entry & Verify | BYR_LGN_015, FUNC_002, BYR_LGN_018 | BYR_LGN_013/014 | VAL_017, VAL_018, VAL_019 | BYR_LGN_017 (expired at verify) | BYR_LGN_016, NEG_005, BYR_LGN_017 | — | — | — | — | — | EDGE_020 (paste), BYR_LGN_013 |
| 5 | OTP Resend & Timer | BYR_LGN_011, FUNC_021 | — | — | BYR_LGN_036 (overwrite/race) | — | — | FUNC_021 (re-issue toast) | BYR_LGN_011 (UI timer vs no backend cooldown) | — | — | BYR_LGN_011 (60s edge) |
| 6 | Consent / T&C | BYR_LGN_019, BYR_LGN_020, BYR_LGN_021, BYR_LGN_023 | BYR_LGN_020 (checkbox+Proceed) | BYR_LGN_020 (gate) | — | BYR_LGN_022 (disagree) | BYR_LGN_019/023 (first vs returning) | — | — | BYR_LGN_021/022 (isConsented persist) | — | — |
| 7 | Referral Entry | BYR_LGN_005 | — | — | — | — | — | — | — | BYR_LGN_005 (CP attribution) | BYR_LGN_005 (/ref → registration) | — |
| 8 | Session & Auth (sessionStorage JWT) | BYR_LGN_025, REG_013, BYR_LGN_040 | FUNC_022 (keys) | — | — | BYR_LGN_024 (deep-link) | BYR_LGN_040/041 (multi-tab) | — | FUNC_022 (sessionStorage vs localStorage drift) | BYR_LGN_024, BYR_LGN_035, BYR_LGN_042 | — | BYR_LGN_035 (24h expiry boundary) |
| 9 | Logout | BYR_LGN_026, E2E_012 | E2E_012 (keys cleared) | — | — | BYR_LGN_026 (client-only) | — | — | BYR_LGN_026 (no server invalidation) | BYR_LGN_026 (post-logout JWT valid) | — | — |
| 10 | Routing & Redirects | FUNC_011 | — | — | — | FUNC_011 (/register→/) | — | — | FUNC_011 (DOC_DRIFT-001) | — | — | — |
| 11 | Security & Rate-Limiting | — | — | — | — | BYR_LGN_027, BYR_LGN_037 | NEG_023 (portal OTP isolation) | — | SEC_024/025 (UI block), BYR_LGN_028 (master OTP) | SEC_024, SEC_025, SEC_026, BYR_LGN_027/037, NEG_023, BYR_LGN_028 | — | BYR_LGN_027 (100 attempts), BYR_LGN_037 (200 calls) |
| 12 | API & Backend Contract | API_027, API_028 | — | BYR_LGN_029, BYR_LGN_030, BYR_LGN_038 | — | BYR_LGN_031, BYR_LGN_032, BYR_LGN_033, BYR_LGN_034, BYR_LGN_039 | BYR_LGN_031/032 (nationality-state) | — | API_029, BYR_LGN_038 (backend > UI) | API_028 (JWT issue), BYR_LGN_034 (NRI bypass BUG), BYR_LGN_039 (REFUND scope BUG) | API_027/028 (auth API) | — |
| 13 | End-to-End | E2E_030, E2E_031 | E2E_031 (T&C step) | — | — | — | E2E_031 (first-login branch) | E2E_030 (OTP toast) | — | E2E_030 (sessionStorage keys) | E2E_030/031 (login→dashboard) | — |

---

## Dimension Coverage Summary (module-wide)

| Dimension | Status | Representative TC IDs |
|-----------|--------|----------------------|
| 1. Positive / happy path | ✓ | BYR_LGN_015, TC_BUYER_LOGIN_FUNC_002, TC_BUYER_LOGIN_E2E_030 |
| 2. Full-form coverage | ✓ | TC_BUYER_LOGIN_UI_001, BYR_LGN_002/003/004, BYR_LGN_013/014, BYR_LGN_020 |
| 3. Mandatory-field & validation | ✓ | VAL_006/007/008, VAL_017/018/019, BYR_LGN_006/007/008 |
| 4. Re-check / race at submit | ✓ | BYR_LGN_036 (OTP overwrite), BYR_LGN_017 (expired at verify) |
| 5. Negative / error handling | ✓ | BYR_LGN_010/016/017/022, NEG_005, BYR_LGN_029-034, BYR_LGN_039 |
| 6. Context-sensitive controls | ✓ | BYR_LGN_003/004 (tab→country code), BYR_LGN_019/023 (first vs returning), NEG_023 (portal OTP) |
| 7. Notifications | ✓ | BYR_LGN_009 (Epinet SMS + Botspice WhatsApp, NOT Kaleyra), FUNC_021 (resend toast), E2E_030 |
| 8. UI-vs-backend split | ✓ | SEC_024/025 (UI numeric block) vs API_029/BYR_LGN_038 (API bypass), BYR_LGN_011 (UI-only timer) |
| 9. Role / auth / security | ✓ | BYR_LGN_024/035/042, FUNC_022, BYR_LGN_026/027/028/037, NEG_023, SEC_024/025/026 |
| 10. Integration / cross-module | ✓ | BYR_LGN_009 (Epinet/Botspice), BYR_LGN_005 (/ref→CP), API_027/028, E2E_030/031 |
| 11. Boundary | ✓ | BYR_LGN_007, EDGE_009 (12 digits), VAL_008 (9 digits), EDGE_020 (paste), BYR_LGN_035 (24h), UI_016 (375px) |

All 11 dimensions covered. No unjustified gaps.

---

## New TC IDs (17) — gray-fill on build

| TC ID | Sub-Module | Dimension filled |
|-------|-----------|------------------|
| TC_BUYER_LOGIN_UI_015 | Login Page — Static | Full-form (legal line + footer text) |
| TC_BUYER_LOGIN_UI_016 | Login Page — Static | Boundary (mobile-first 375px viewport) |
| TC_BUYER_LOGIN_VAL_017 | OTP Entry & Verify | Validation (partial OTP blocks Verify) |
| TC_BUYER_LOGIN_VAL_018 | OTP Entry & Verify | Validation (empty OTP blocks Verify) |
| TC_BUYER_LOGIN_VAL_019 | OTP Entry & Verify | Validation (OTP boxes reject non-numeric) |
| TC_BUYER_LOGIN_EDGE_020 | OTP Entry & Verify | Boundary (paste 6-digit fills all boxes) |
| TC_BUYER_LOGIN_FUNC_021 | OTP Resend & Timer | Positive (resend re-issues + restarts timer) |
| TC_BUYER_LOGIN_FUNC_022 | Session & Auth | UI-vs-backend (sessionStorage JWT — DOC_DRIFT-002) |
| TC_BUYER_LOGIN_NEG_023 | Security & Rate-Limiting | Context-sensitive (Admin/SM OTP rejected — portal isolation) |
| TC_BUYER_LOGIN_SEC_024 | Security & Rate-Limiting | Security (SQLi in mobile field blocked) |
| TC_BUYER_LOGIN_SEC_025 | Security & Rate-Limiting | Security (XSS in mobile field blocked) |
| TC_BUYER_LOGIN_SEC_026 | Security & Rate-Limiting | Security (HTTPS-only, no OTP in URL) |
| TC_BUYER_LOGIN_API_027 | API & Backend Contract | Positive API (send-otp success) |
| TC_BUYER_LOGIN_API_028 | API & Backend Contract | Auth API (verify-otp returns JWT + user) |
| TC_BUYER_LOGIN_API_029 | API & Backend Contract | UI-vs-backend (API injection bypass) |
| TC_BUYER_LOGIN_E2E_030 | End-to-End | Full login journey root→dashboard |
| TC_BUYER_LOGIN_E2E_031 | End-to-End | First-login E2E incl. T&C acceptance |

(IDs continue the existing `TC_BUYER_LOGIN_<TYPE>_NNN` agent series; highest pre-existing seq was 014. No baseline `BYR_LGN_*` ID was renumbered. `SEC` is a new type code used for dedicated security cases; consistent with the type-code list.)

---

## DOC_DRIFT & Flags

- **DOC_DRIFT-001** — FS/FRD header says login URL is `/ (login), /register`. Live: `/register` redirects to `/`; there is no separate registration page and the captured heading is `APPLICANT LOGIN` (not "Buyer Login"). TCs use the root `/` as canonical login. (FUNC_011, UI_001) — live UI wins.
- **DOC_DRIFT-002** — FRD/BRD §7 say "JWT issued and stored / used for all API calls" without naming the store. Live: the Buyer JWT lives in **sessionStorage** (`xr_auth_token` / `xr_user`), NOT localStorage (differs from SM/Admin). TCs assert sessionStorage. (FUNC_022, FUNC_002, E2E_012/030) — live UI wins.
- **[VERIFY WITH DEV]** open items: NRI OTP channel (BYR_LGN_012); disagree-T&C exact restricted behaviour (BYR_LGN_022); multi-tab token sharing semantics for per-tab sessionStorage (BYR_LGN_040); OTP-box paste auto-distribution (EDGE_020); OTP-box non-numeric block (VAL_019); whether a shared master OTP overrides portal isolation (NEG_023); verify-otp token wrap shape (API_028); send-otp success body/otpExpires (API_027); API injection sanitisation (API_029); NRI phone-only fallback still present (BYR_LGN_034).
- **Documented security gaps (not defects to "fix" in TCs, but asserted as-is):** no backend OTP send rate-limit / no failed-OTP lockout (authLimiter commented out, app.js:40 — BYR_LGN_027/037); logout is client-side only, JWT valid until 24h expiry — no post-logout 401 pass case (BYR_LGN_026, BYR_LGN_035); concurrent send-otp overwrites prior OTP (BYR_LGN_036); NRI verify phone-only fallback auth-bypass risk (BYR_LGN_034); Registration REFUND defaultScope case-mismatch leaks refunded as active (BYR_LGN_039).
- **[TEST_DATA_REQUIRED]** standing needs: unregistered buyer mobile; registered NRI mobile + matching email; first-login buyer (isConsented null); buyer with a Refund registration; valid CP hvCode; captured/aged JWT; API client access; backend/log visibility.

## Blockers

None. Dual-source gate satisfied (visual FULL + BRD/FS/FRD present). No `VISUAL_GATE_BLOCK`, no `DOC_MISSING`. Builder not run and xlsx untouched per task scope.
