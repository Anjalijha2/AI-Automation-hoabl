# Coverage Matrix — Self-Audit Gate — Sales Manager / Login

Module: Sales Manager / Login
Sources read (dual-source gate — BOTH present):
- visual-memory/sm/login/INDEX.md (CAPTURE_STATUS: FULL — 6 screens, captured 2026-06-05; Route, Login form, OTP screen, API/Redux actions, validation messages, toasts, auth storage, static UAT OTP)
- BRD: .claude/docs/hoabl-knowledge-base/SM-Portal/BRD/SM-BRD-SM-Portal.md (§4 rules, §7 integrations)
- FRD: .claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FRD-SM-Portal.md (§7 authentication)
- FS:  .claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FS-Login.md (Feature 1: 1.4 UI, 1.5 rules, 1.6 system actions, 1.7 notifications, 1.8 audit)

Legend: cell = Testcase_ID covering that dimension for that feature, or a justified `N/A`.
**Bold IDs = NEW coverage-gap TCs added in this pass.** All other IDs are pre-existing and preserved (no-silent-drop).

Dimension columns (per dimensions-reference.md):
1 Pos · 2 Form/full-control · 3 Validation · 4 Race/re-check · 5 Neg/error · 6 Context-sensitive · 7 Notifications · 8 UI-vs-backend · 9 Role/auth/security · 10 Integration · 11 Boundary

| Feature / Screen | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|------------------|-------|--------|---------|--------|-------|-------|---------|---------|--------|----------|----------|
| Mobile screen — page load / layout | SM_LGN_001, TC_SMLOGIN_UI_001 | SM_LGN_002, SM_LGN_014, **SM_LGN_036**, **SM_LGN_037**, SM_LGN_013 | — | N/A: static page, no submit-time race | — | N/A: single state | N/A: no notif on load | — | TC_SMLOGIN_FUNC_021 (gate) | — | SM_LGN_015, **SM_LGN_038** |
| Role selector | TC_SMLOGIN_UI_002, TC_SMLOGIN_FUNC_019 | TC_SMLOGIN_UI_002 | — | N/A | SM_LGN_FSD_009 (wrong role → not found) | TC_SMLOGIN_EDGE_033 (last-selected wins) | N/A | SM_LGN_FSD_009 (UI/backend role coupling) | SM_LGN_FSD_010 (SM-Admin vs SM route access) | N/A | N/A |
| Send OTP (Step 1 submit) | SM_LGN_006, TC_SMLOGIN_FUNC_007 | SM_LGN_006, SM_LGN_017 | SM_LGN_003, SM_LGN_004, SM_LGN_005, SM_LGN_012, SM_LGN_018, SM_LGN_019, SM_LGN_021, SM_LGN_022, TC_SMLOGIN_VAL_004, TC_SMLOGIN_VAL_005, TC_SMLOGIN_VAL_006 | **SM_LGN_FSD_013** (fire-and-forget) | SM_LGN_020, SM_LGN_028, **SM_LGN_054**, **SM_LGN_055**, TC_SMLOGIN_NEG_025 | SM_LGN_017 (in-flight lock) | SM_LGN_006 (Epinet), **SM_LGN_FSD_012** | **SM_LGN_FSD_018** (regex not enforced), **TC_SMLOGIN_API_037** (no cooldown) | SM_LGN_020, SM_LGN_028 (role-scoped lookup) | **SM_LGN_FSD_012** (Epinet SMS) | SM_LGN_012, SM_LGN_018 (max 10), SM_LGN_004 (9-digit short) |
| OTP screen — layout / timer | TC_SMLOGIN_UI_008, TC_SMLOGIN_UI_009 | TC_SMLOGIN_UI_008, **SM_LGN_039** (sub-text), **SM_LGN_040** (timer start) | — | N/A | — | TC_SMLOGIN_FUNC_016 vs TC_SMLOGIN_FUNC_014 (timer-gated routing) | N/A: no notif on render | — | — | — | **SM_LGN_040** (timer start value) |
| Re-Send OTP | TC_SMLOGIN_FUNC_014, TC_SMLOGIN_FUNC_015, SM_LGN_025 | TC_SMLOGIN_FUNC_014, TC_SMLOGIN_FUNC_016 | N/A: no input | N/A | TC_SMLOGIN_FUNC_016 (disabled during timer) | TC_SMLOGIN_FUNC_016 vs TC_SMLOGIN_FUNC_014 (timer routing) | TC_SMLOGIN_FUNC_015 (re-send dispatches), SM_LGN_025 | TC_SMLOGIN_FUNC_031, **TC_SMLOGIN_API_037** (UI gate only) | — | TC_SMLOGIN_FUNC_015 | **SM_LGN_FSD_020** (OTP expired after timer 0) |
| Verify OTP (Step 2 submit) | SM_LGN_007, SM_LGN_FSD_011, TC_SMLOGIN_E2E_017, TC_SMLOGIN_FUNC_018, TC_SMLOGIN_FUNC_032 | SM_LGN_033, **SM_LGN_041**, **SM_LGN_042**, SM_LGN_024 | SM_LGN_024, TC_SMLOGIN_VAL_011, TC_SMLOGIN_VAL_012, TC_SMLOGIN_VAL_013, **SM_LGN_043** (non-numeric box) | SM_LGN_026, TC_SMLOGIN_NEG_027 (expired re-check), SM_LGN_034 (5xx) | SM_LGN_023, **SM_LGN_051** (no lockout), TC_SMLOGIN_NEG_023, TC_SMLOGIN_NEG_024 | SM_LGN_023 (wrong→stay) vs SM_LGN_007 (correct→redirect) | **SM_LGN_056** (verify is silent), TC_SMLOGIN_FUNC_028 (send toast) | SM_LGN_051 (no lockout), **TC_SMLOGIN_API_035** (verify API) | SM_LGN_FSD_011 (master OTP), **SM_LGN_FSD_016** | **TC_SMLOGIN_API_038** (permissions map), TC_SMLOGIN_E2E_017 (websocket connect) | SM_LGN_033 (paste), **SM_LGN_042** (backspace), **SM_LGN_044** (paste wrong-length) |
| Back navigation | TC_SMLOGIN_UI_010 | TC_SMLOGIN_UI_010 | N/A: no input | N/A | N/A | TC_SMLOGIN_UI_010 (OTP→mobile state reset) | N/A | N/A | N/A | N/A | N/A |
| Inactive / revoked account | — | N/A | N/A | SM_LGN_008 (revoked at send), TC_SMLOGIN_NEG_026 | SM_LGN_008 ("access revoked"), TC_SMLOGIN_NEG_026 | N/A | N/A | — | SM_LGN_008, TC_SMLOGIN_NEG_026 | — | N/A |
| Session / JWT | SM_LGN_027, TC_SMLOGIN_FUNC_020, TC_SMLOGIN_FUNC_029, **SM_LGN_045**, **SM_LGN_046**, **SM_LGN_049** | N/A: no form | N/A | N/A | SM_LGN_016, TC_SMLOGIN_FUNC_021, SM_LGN_032, **SM_LGN_050** (tampered JWT) | TC_SMLOGIN_FUNC_030 (Auth.clear on route) | N/A | N/A | SM_LGN_016, TC_SMLOGIN_FUNC_021, **SM_LGN_050**, SM_LGN_035, **SM_LGN_047** | **SM_LGN_049** (stateless multi-device) | **SM_LGN_047** (within 1-day), **SM_LGN_048** (exactly-at-expiry) |
| Logout | SM_LGN_031, TC_SMLOGIN_FUNC_022 | N/A: single click | N/A | N/A | **SM_LGN_FSD_017** (token still valid) | N/A | N/A | **SM_LGN_FSD_017** (server no-op vs client clear) | **SM_LGN_FSD_017** | TC_SMLOGIN_FUNC_022 (websocket disconnect) | N/A |
| Security — injection / transit | N/A | N/A | **SM_LGN_052** (SQLi), **SM_LGN_053** (XSS), SM_LGN_035 (HTTPS) | N/A | **SM_LGN_052**, **SM_LGN_053** | N/A | N/A | **TC_SMLOGIN_API_036** (SQLi/XSS at API, field-block bypassed) | SM_LGN_035, **SM_LGN_050** | N/A | N/A |
| Security — OTP generation / storage / master | N/A | N/A | N/A | N/A | **SM_LGN_FSD_014** (Math.random), **SM_LGN_FSD_015** (plaintext OTP) | N/A | N/A | **SM_LGN_FSD_014**, **SM_LGN_FSD_015** | **SM_LGN_FSD_016** (master OTP all envs) | N/A | N/A |
| API — send-otp / verify-otp endpoints | **TC_SMLOGIN_API_034** (send positive), **TC_SMLOGIN_API_035** (verify positive) | N/A | **SM_LGN_FSD_018** | **SM_LGN_FSD_013** | SM_LGN_020, **TC_SMLOGIN_API_036**, **SM_LGN_FSD_018** | N/A | **SM_LGN_FSD_012** (Epinet) | **SM_LGN_FSD_018**, **TC_SMLOGIN_API_036**, **TC_SMLOGIN_API_037** | SM_LGN_020 (role-scoped), SM_LGN_008 | **SM_LGN_FSD_012**, **TC_SMLOGIN_API_038** | **SM_LGN_FSD_019** (hidden tracking fields tolerated) |
| Audit / logging | SM_LGN_029 (login event) | N/A | N/A | N/A | SM_LGN_030 (failed login) | N/A | **SM_LGN_056** (no verify notif) | N/A | SM_LGN_029, SM_LGN_030 | N/A | N/A |

## Self-audit result

- No unjustified-empty cells. Every cell holds a Testcase_ID or a specific `N/A: <reason>`.
- All 68 pre-existing unique TCs preserved (no-silent-drop). No scenario dropped or renumbered. (The source workbook listed 71 Login rows; the 3 extra rows were exact ID repeats across the Login / Login (Exec) inventory — the unique authored set is 68.)
- **35 new coverage-gap TCs added.**
- New IDs continue the highest existing series — `SM_LGN_NNN` from previous max 035 → 036-056; `SM_LGN_FSD_NNN` from previous max 011 → 012-020; new `TC_SMLOGIN_API_NNN` series 034-038 (continuing the shared `TC_SMLOGIN_<TYPE>` counter whose previous high across all type series was 033).

## Counts

- **Total TCs: 103**
- **New TCs this pass: 35** —
  SM_LGN_036, SM_LGN_037, SM_LGN_038, SM_LGN_039, SM_LGN_040, SM_LGN_041, SM_LGN_042, SM_LGN_043, SM_LGN_044, SM_LGN_045, SM_LGN_046, SM_LGN_047, SM_LGN_048, SM_LGN_049, SM_LGN_050, SM_LGN_051, SM_LGN_052, SM_LGN_053, SM_LGN_054, SM_LGN_055, SM_LGN_056, SM_LGN_FSD_012, SM_LGN_FSD_013, SM_LGN_FSD_014, SM_LGN_FSD_015, SM_LGN_FSD_016, SM_LGN_FSD_017, SM_LGN_FSD_018, SM_LGN_FSD_019, SM_LGN_FSD_020, TC_SMLOGIN_API_034, TC_SMLOGIN_API_035, TC_SMLOGIN_API_036, TC_SMLOGIN_API_037, TC_SMLOGIN_API_038
- Sub-modules (11): Login Screen (Step 1 — Mobile & Role) · Send OTP & Validation (Step 1 submit) · Role Selector · OTP Screen (Step 2) · Verify OTP & Login (Step 2 submit) · Inactive / Revoked Account · Session & Auth · Logout · Security · Notifications & Audit · API & Backend

## [VERIFY WITH DEV] flags

- SM_LGN_036 — exact SM-portal footer/copyright string (not in BRD/FRD/FS, not transcribed in SM visual-memory).
- SM_LGN_038 — 1440-width render (no SM 1440 baseline screenshot held).
- SM_LGN_019 — 6-9 first-digit Indian-mobile rule (implied by format; confirm enforced on SM form).
- SM_LGN_055 — leading-zero 10-digit mobile blocked at field vs rejected at lookup.
- SM_LGN_040 — canonical OTP timer start value (startTimer(60) observed; not in BRD/FRD).
- SM_LGN_FSD_020 — OTP-expired behaviour after timer reaches 0 (on-expiry message / OTP invalidation not documented).
- SM_LGN_042 — backspace-step-back on empty OTP box (implied by segmented design; confirm).
- SM_LGN_043 — non-numeric blocked in OTP boxes (implied; confirm).
- SM_LGN_044 — wrong-length paste into OTP boxes (full-paste documented; wrong-length not).
- SM_LGN_047 — exact JWT lifetime for SM (BRD says "a session"; ~1d assumed from Admin parity).
- SM_LGN_048 — JWT exactly-at-expiry boundary + clock-skew tolerance.
- SM_LGN_049 — second-device login / single-session enforcement on SM.
- SM_LGN_056 — verify-OTP sends no SMS/WhatsApp/email (silence-by-design; confirm no side-channel).
- SM_LGN_FSD_012 / _013 / _014 / _015 / _016 / _017 / _018 — security/backend gaps inferred from the shared Admin auth.controller; confirm the SM code path shares each behaviour.
- SM_LGN_FSD_019 — hidden tracking fields tolerated on send-otp (assert not-a-bug; confirm no SM-side side effect).
- SM_LGN_029 / SM_LGN_030 — audit-log table/columns for SM login + failed-login (FS §1.8 documents the requirement only).
- TC_SMLOGIN_API_036 — SQLi/XSS injected directly at the SM send-otp API (field-block bypassed); backend sanitisation not documented.
- TC_SMLOGIN_API_038 — `permissions` map shape in the SM verify-otp response (existence noted; exact module/action ids to confirm).

## [TEST_DATA_REQUIRED] flags

- SM_LGN_020 — an unregistered mobile (used 7000000099 as placeholder; confirm it is truly unregistered).
- SM_LGN_028, TC_SMLOGIN_NEG_025 — an Admin-only-role (role 1) mobile.
- SM_LGN_FSD_009, SM_LGN_FSD_010 — an SM-Admin (role 4) mobile / SM-Admin + SM bearer tokens.
- SM_LGN_008, TC_SMLOGIN_NEG_026 — a disposable SM user with isActive=false.
- SM_LGN_048 — an aged / short-expiry SM JWT.
- SM_LGN_FSD_017 — a captured live JWT (for the post-logout token-still-valid check).
- SM_LGN_FSD_014 — an OTP-generation harness.
- SM_LGN_FSD_015, SM_LGN_029, SM_LGN_030 — DB / audit-log read access.
- SM_LGN_FSD_012, SM_LGN_FSD_013 — backend outbound network-log capture / network-fault injection.
- SM_LGN_FSD_016 — target-environment access for the master-OTP-in-all-envs check.
- TC_SMLOGIN_API_034 / _035 / _036 / _037 / _038 — a valid API client / bearer; UAT mobile 8888888888 + OTP 258369 suffice but confirm API access.

## DOC_DRIFT raised this pass

- **DOC_DRIFT-001** — SM auth request field name + JWT envelope. visual-memory/sm/login/INDEX.md (Redux actions) documents the live contract as `sendSalesManagerOtp({ phone, countryCode:'+91', role })` and `verifySalesManagerOtp({ otp, phone, countryCode, role })`, with the success payload returning `{ token, user }` consumed as `response.data.token` (Auth.permission = user.permissions). The SM BRD/FRD/FS describe the auth abstractly ("OTP-based mobile authentication", "JWT token stored") and do not specify the body field name or token envelope. There is no direct contradiction in the SM docs, but for cross-portal consistency the SM FS should record the observed `phone`/`countryCode`/`role` body and the wrapped-token response shape. Live implementation wins; TCs in this pass use the observed values. Per BA Agent responsibility #7 this drift is RAISED for the same-pipeline doc-update step (this pass produces matrix + JSON only; the workbook build + doc edit are run by the orchestrator).

> No blocking contradictions found between the SM visual-memory and the SM BRD/FRD/FS — the dual-source gate is satisfied (both present; visual-memory FULL). TC generation proceeded fully unblocked.
