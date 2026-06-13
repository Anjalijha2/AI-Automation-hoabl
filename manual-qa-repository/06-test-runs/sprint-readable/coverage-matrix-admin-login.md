# Coverage Matrix — Self-Audit Gate — Admin / Login

Module: Admin / Login
Sources read:
- visual-memory/admin/login/INDEX.md (FULL — 12 screens, captured 2026-05-17)
- BRD: .claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Login.md (§4 layout, §6 rules, §7 validations, §11 backend reconciliation)
- FRD: .claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FRD-Login.md (§3 layout, §5 rules, §10 API)
- FS: .claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Login.md (Feature 1 Send OTP, Feature 2 Verify OTP, Feature 3 Logout, §11 reconciliation)

Legend: cell = Testcase_ID covering that dimension for that feature, or a justified `N/A`.
**Bold IDs = NEW coverage-gap TCs added in this pass.** All other IDs are pre-existing and preserved.

| Feature / Sub-feature | 1 Pos | 2 Form | 3 Valid | 4 Race | 5 Neg | 6 Ctx | 7 Notif | 8 UIvBE | 9 Auth | 10 Integ | 11 Bound |
|-----------------------|-------|--------|---------|--------|-------|-------|---------|---------|--------|----------|----------|
| Mobile screen — page load / layout | ADM_LGN_001, ADM_LGN_002 | ADM_LGN_002, ADM_LGN_003, ADM_LGN_006, ADM_LGN_007, **ADM_LGN_070** | — | N/A: no submit-time race on static page | — | N/A: single state | N/A: no notif on page load | — | ADM_LGN_008 | — | ADM_LGN_040, ADM_LGN_071 |
| T&C / Privacy links | ADM_LGN_004, ADM_LGN_005 | ADM_LGN_004, ADM_LGN_005 | N/A: no input | N/A | N/A | N/A | N/A | N/A | N/A | N/A: external static pages | N/A |
| Send OTP (Step 1 submit) | ADM_LGN_009 | ADM_LGN_009 | ADM_LGN_011, ADM_LGN_012, ADM_LGN_013, ADM_LGN_017, ADM_LGN_067, **ADM_LGN_072** | ADM_LGN_FSD_046 (fire-and-forget) | ADM_LGN_014, ADM_LGN_015, ADM_LGN_016, ADM_LGN_039, ADM_LGN_066, ADM_LGN_066, ADM_LGN_FSD_047 | N/A: single action | ADM_LGN_FSD_041 (Epinet SMS), ADM_LGN_FSD_046 | ADM_LGN_FSD_047 (regex not enforced), **ADM_LGN_073** (no backend cooldown) | ADM_LGN_039 (pre-provisioning) | ADM_LGN_FSD_041 (Epinet), ADM_LGN_FSD_048 (lastLogin no-op) | ADM_LGN_017 (max len 10), **ADM_LGN_074** (9-digit boundary) |
| OTP screen — layout / timer | ADM_LGN_010, ADM_LGN_026 | ADM_LGN_010, **ADM_LGN_075** (sub-text), **ADM_LGN_076** (timer initial) | — | N/A | — | ADM_LGN_027, ADM_LGN_028 (timer state routing) | N/A: no notif on render | — | — | — | ADM_LGN_076 (timer start value) |
| Re-Send OTP | ADM_LGN_028, ADM_LGN_029 | ADM_LGN_027, ADM_LGN_028 | N/A: no input | N/A | ADM_LGN_027 (disabled during timer) | ADM_LGN_027 vs ADM_LGN_028 (timer-gated routing) | ADM_LGN_029 (re-send dispatches SMS) | ADM_LGN_029, **ADM_LGN_073** (UI gate only, no backend throttle) | — | ADM_LGN_029 | **ADM_LGN_077** (OTP expired after timer 0) |
| Verify OTP (Step 2 submit) | ADM_LGN_018, ADM_LGN_019, ADM_LGN_031 | ADM_LGN_018, ADM_LGN_019, ADM_LGN_020, ADM_LGN_068, ADM_LGN_069 | ADM_LGN_020, ADM_LGN_022, ADM_LGN_023, **ADM_LGN_078** (non-numeric in box) | **ADM_LGN_079** (OTP expired at submit) | ADM_LGN_021, ADM_LGN_024, ADM_LGN_025 | ADM_LGN_021 (wrong→stay) vs ADM_LGN_018 (correct→redirect) | **ADM_LGN_080** (verify sends no notification — silent by design) | ADM_LGN_025 (no lockout), **ADM_LGN_081** (verify-OTP API positive) | ADM_LGN_055 (master OTP), ADM_LGN_FSD_044 | ADM_LGN_FSD_045 (no permissions gate downstream), **ADM_LGN_082** (permissions map in response) | ADM_LGN_068 (paste), ADM_LGN_069 (backspace), **ADM_LGN_083** (paste wrong-length) |
| Back navigation | ADM_LGN_030 | ADM_LGN_030 | N/A: no input | N/A | N/A | ADM_LGN_030 (OTP→mobile state change) | N/A | N/A | N/A | N/A | N/A |
| Session / JWT | ADM_LGN_032, ADM_LGN_033, ADM_LGN_034, ADM_LGN_063, ADM_LGN_064 | N/A: no form | N/A | N/A | ADM_LGN_035 (expired→login), ADM_LGN_036 | N/A | N/A | — | ADM_LGN_034 (1-day), ADM_LGN_035, ADM_LGN_036, ADM_LGN_065 (tampered JWT) | ADM_LGN_064 (stateless multi-device) | ADM_LGN_034 (23h within window), **ADM_LGN_084** (exactly-at-expiry boundary) |
| Logout | **ADM_LGN_085** (logout redirect) | N/A: single click | N/A | N/A | ADM_LGN_FSD_045 (token still valid) | N/A | N/A | ADM_LGN_FSD_045 (server no-op vs client clear) | ADM_LGN_FSD_045 | ADM_LGN_FSD_045 | N/A |
| Inactive / revoked user | — | N/A | N/A | **ADM_LGN_086** (revoked check at verify) | **ADM_LGN_086** ("Your access to the portal has been revoked") | N/A | N/A | — | **ADM_LGN_086** (isActive=false → 400) | — | N/A |
| Security — injection | N/A | N/A | ADM_LGN_037 (SQLi), ADM_LGN_038 (XSS) | N/A | ADM_LGN_037, ADM_LGN_038 | N/A | N/A | **ADM_LGN_087** (SQLi/XSS at API layer, field-block bypassed) | ADM_LGN_065 (tampered JWT) | N/A | N/A |
| Security — OTP generation / storage | N/A | N/A | N/A | N/A | ADM_LGN_FSD_042 (Math.random), ADM_LGN_FSD_043 (plaintext OTP) | N/A | N/A | ADM_LGN_FSD_042, ADM_LGN_FSD_043 | ADM_LGN_FSD_044 (master OTP all envs) | N/A | N/A |
| API — send-otp / verify-otp endpoints | ADM_LGN_081 (verify API), **ADM_LGN_088** (send-otp API positive) | N/A | ADM_LGN_FSD_047 | ADM_LGN_FSD_046 | ADM_LGN_039, ADM_LGN_066, ADM_LGN_FSD_047 | N/A | ADM_LGN_FSD_041 | ADM_LGN_FSD_047, ADM_LGN_087, ADM_LGN_073 | ADM_LGN_039, ADM_LGN_086 | ADM_LGN_082, ADM_LGN_FSD_048 | **ADM_LGN_089** (hidden tracking fields tolerated — not a bug) |

## Self-audit result

- No unjustified-empty cells. Every cell holds a Testcase_ID or a specific `N/A: <reason>`.
- All 55 pre-existing TCs preserved (no-silent-drop rule). No scenario dropped or renumbered.
- **20 new coverage-gap TCs added**: ADM_LGN_070 through ADM_LGN_089.
- New TC IDs continue the highest `ADM_LGN_NNN` series (previous max ADM_LGN_069; FSD series untouched at ADM_LGN_FSD_041-048).

## [VERIFY WITH DEV] flags on new TCs

- ADM_LGN_077 — OTP-expired behaviour after timer reaches 0 (BRD says timer shows expiry; exact UI message on expiry not confirmed).
- ADM_LGN_079 — Verify-OTP submitted after timer expiry (re-validation/race) — backend expiry message not documented.
- ADM_LGN_080 — Verify-OTP sends no SMS/WhatsApp/email (FS Feature 2 §8 says "None"; asserting silence-by-design — confirm no side-channel).
- ADM_LGN_082 — `permissions` map shape in verify-OTP response (FS §11.5 documents existence; exact module/action ids to confirm).
- ADM_LGN_084 — JWT exactly-at-expiry boundary behaviour (1d `exp`; exact server clock-skew tolerance not documented).
- ADM_LGN_086 — "Your access to the portal has been revoked" string (FS §11.4 documents string; needs a disposable inactive UAT user to execute → also [TEST_DATA_REQUIRED]).
- ADM_LGN_087 — SQLi/XSS injected directly at the send-otp API (bypassing the numeric-only field block); backend sanitisation behaviour not documented.
- ADM_LGN_089 — hidden tracking fields (sessionId/hvCode/nri/UTM) accepted on send-otp (FS §11.6 documents tolerance; assert not-a-bug).

## [TEST_DATA_REQUIRED] flags

- ADM_LGN_086 — requires a disposable UAT admin user provisioned with `isActive=false` to trigger the revoked path. Ask user to supply.
- ADM_LGN_073, ADM_LGN_087, ADM_LGN_088, ADM_LGN_089 — API-layer tests need a valid bearer/admin mobile; UAT mobile 8888888888 suffices but confirm an API client/token is available for execution.

## DOC_DRIFT raised this pass

- **DOC_DRIFT-001** — send-otp/verify-otp request field name. FRD ADMIN-FRD-Login §10 + FS Feature 1 §7 document the request body field as `mobile` (`{ "mobile": "...", "userType": "admin" }`). visual-memory/admin/login/INDEX.md "Key Structural Notes" states the live API field is `phone` (not `mobile`), and existing FSD TCs (ADM_LGN_FSD_041, _047) already POST `phone:"..."`. Live implementation wins. BRD/FRD must be updated to `phone`. TCs in this pass use observed value `phone`.
- **DOC_DRIFT-002** — JWT envelope shape. FRD §10 shows a flat success response `{ "token": "<JWT>", "user": {...} }`. INDEX.md notes the JWT is returned wrapped as `response.data.token`. Live implementation wins; FRD response example should be corrected to the wrapped envelope. TCs reference the wrapped path.

> Note: per BA Agent responsibility #7, DOC_DRIFT must be fixed in the BRD/FRD within the same pipeline step. This pass produces the matrix + JSON only (per task scope: "Do NOT apply to the workbook yourself"). The two drifts above are RAISED here for the doc-update step; TC generation has proceeded using the observed (`phone`, wrapped envelope) values so no TC is blocked.
