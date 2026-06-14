# Coverage Matrix — Channel Partner Portal / Login

**Module:** Login (`Login - Master`)
**Sources:** `visual-memory/cp/login/INDEX.md` (FULL) + `CP-FS-Login.md` + `CP-BRD-CP-Portal.md` + `CP-FRD-CP-Portal.md`
**Generated:** 2026-06-14 (unattended) · **Total TCs:** 109 (80 baseline preserved + 29 new)
**OTP fact:** CP static/master OTP = `147258` (NOT 258369 — that is Admin/SM).

Legend for the 11 dimensions (from `dimensions-reference.md`):
D1 Positive · D2 Full-form coverage · D3 Mandatory/validation · D4 Submit-time re-check/race · D5 Negative/error · D6 Context-sensitive controls · D7 Notifications · D8 UI-vs-backend split · D9 Role/auth/security · D10 Integration/cross-module · D11 Boundary

---

## Features × Dimensions (cells = TC_IDs)

| Feature | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 | D11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Login page render / branding | CP_LGN_001, TC_CP_LOGIN_UI_001 | CP_LGN_002, CP_LGN_003, CP_LGN_005, TC_CP_LOGIN_UI_002, TC_CP_LOGIN_UI_003, TC_CP_LOGIN_UI_032 | — | — | — | CP_LGN_004 | — | — | — | — | TC_CP_LOGIN_UI_036 |
| Send OTP / mobile validation | CP_LGN_006, CP_LGN_007, TC_CP_LOGIN_FUNC_009 | — | CP_LGN_009, TC_CP_LOGIN_VAL_004, TC_CP_LOGIN_VAL_005, CP_LGN_011 | — | CP_LGN_008, TC_CP_LOGIN_VAL_006, TC_CP_LOGIN_NEG_008, CP_LGN_010 | — | — | — | CP_LGN_030, CP_LGN_039 | — | TC_CP_LOGIN_VAL_007, CP_LGN_046, CP_LGN_047, CP_LGN_048, TC_CP_LOGIN_VAL_030 |
| Concurrent OTP issue | — | — | — | CP_LGN_037 | — | — | — | — | — | — | — |
| OTP entry screen / timer / boxes | — | TC_CP_LOGIN_UI_011, CP_LGN_007 | — | — | — | TC_CP_LOGIN_UI_012, TC_CP_LOGIN_FUNC_013, TC_CP_LOGIN_FUNC_014, CP_LGN_012 | — | — | — | — | TC_CP_LOGIN_UI_010, TC_CP_LOGIN_FUNC_019, TC_CP_LOGIN_EDGE_033, TC_CP_LOGIN_NEG_034, CP_LGN_049, TC_CP_LOGIN_FUNC_020 |
| Verify OTP / login success | CP_LGN_013, CP_LGN_014, TC_CP_LOGIN_E2E_018, CP_LGN_032 | CP_LGN_036, CP_LGN_035 | CP_LGN_016, TC_CP_LOGIN_NEG_016 | — | CP_LGN_015, TC_CP_LOGIN_NEG_015, CP_LGN_017, TC_CP_LOGIN_NEG_017, CP_LGN_050 | — | — | — | CP_LGN_018 | — | — |
| Undertaking (consent) modal | CP_LGN_026, CP_LGN_054 | CP_LGN_051 | CP_LGN_052 | — | CP_LGN_027 | CP_LGN_052, CP_LGN_053 | — | — | CP_LGN_026 | — | — |
| RegisterCp (incomplete profile) | CP_LGN_028, CP_LGN_021, TC_CP_LOGIN_BIZ_029, CP_LGN_022, CP_LGN_045 | CP_LGN_040, CP_LGN_055 | CP_LGN_041, CP_LGN_056 | — | CP_LGN_068, CP_LGN_042, CP_LGN_043 | CP_LGN_068 | — | — | — | — | CP_LGN_057 |
| Role / cross-portal isolation | — | — | — | — | CP_LGN_019, TC_CP_LOGIN_NEG_027, CP_LGN_020, TC_CP_LOGIN_NEG_028, CP_LGN_058 | — | — | — | CP_LGN_019, CP_LGN_020, CP_LGN_058 | — | — |
| Session & auth | TC_CP_LOGIN_DC_021, CP_LGN_023, TC_CP_LOGIN_FUNC_023, TC_CP_LOGIN_FUNC_022, CP_LGN_059, CP_LGN_061 | — | — | — | — | — | — | — | CP_LGN_024, TC_CP_LOGIN_NEG_024, CP_LGN_033, TC_CP_LOGIN_NEG_025, CP_LGN_060 | — | — |
| Logout | TC_CP_LOGIN_FUNC_026 | — | — | — | — | — | — | — | CP_LGN_025 | — | — |
| Security gaps | — | — | — | — | — | — | — | CP_LGN_062, CP_LGN_063, TC_CP_LOGIN_API_039 | CP_LGN_029, CP_LGN_034, CP_LGN_044, CP_LGN_031, CP_LGN_064, CP_LGN_065 | — | — |
| Notifications & audit | — | — | — | — | — | — | TC_CP_LOGIN_FUNC_035, CP_LGN_038, CP_LGN_066 | — | — | TC_CP_LOGIN_REG_031, CP_LGN_067 | — |
| API & backend | TC_CP_LOGIN_API_036, TC_CP_LOGIN_API_037 | TC_CP_LOGIN_API_038 | — | — | — | — | — | TC_CP_LOGIN_API_039, TC_CP_LOGIN_API_040 | TC_CP_LOGIN_API_037 | — | — |

---

## Dimension coverage check (11/11)

| Dim | Covered? | Representative TCs |
|---|---|---|
| D1 Positive | YES | CP_LGN_006, CP_LGN_013, TC_CP_LOGIN_E2E_018 |
| D2 Full-form coverage | YES | CP_LGN_040 (RegisterCp 14 fields), CP_LGN_051 (Undertaking), TC_CP_LOGIN_UI_002/003 |
| D3 Mandatory/validation | YES | TC_CP_LOGIN_VAL_004, CP_LGN_041, CP_LGN_052 |
| D4 Submit-time re-check/race | YES | CP_LGN_037 (concurrent send overwrites OTP) |
| D5 Negative/error | YES | CP_LGN_015, TC_CP_LOGIN_NEG_015, CP_LGN_050, CP_LGN_027, CP_LGN_068 |
| D6 Context-sensitive controls | YES | TC_CP_LOGIN_UI_012↔FUNC_013 (Re-Send disabled↔enabled), CP_LGN_052 (I Agree disabled↔enabled), CP_LGN_029 (3-branch routing) |
| D7 Notifications | YES | TC_CP_LOGIN_FUNC_035 (Epinet), CP_LGN_038, CP_LGN_066 (silent verify) |
| D8 UI-vs-backend split | YES | TC_CP_LOGIN_API_039 (injection bypasses field), TC_CP_LOGIN_API_040 (no backend cooldown), CP_LGN_062/063 |
| D9 Role/auth/security | YES | CP_LGN_019/020/058 (role isolation), CP_LGN_024/033/060 (auth gate), CP_LGN_025/031/044 (gaps) |
| D10 Integration/cross-module | YES | TC_CP_LOGIN_FUNC_035 (Epinet), TC_CP_LOGIN_REG_031 (audit log), TC_CP_LOGIN_API_037 (permissions) |
| D11 Boundary | YES | TC_CP_LOGIN_VAL_007 (10-digit cap), TC_CP_LOGIN_UI_010 (timer), TC_CP_LOGIN_EDGE_033 (paste), CP_LGN_057 (upload type/size) |

No unchecked dimension. No visible UI element left without a TC (every Step-1, OTP-screen, Undertaking-modal and RegisterCp field from `visual-memory/cp/login/INDEX.md` is mapped).

---

## Counts

- **Total TCs:** 109
- **Baseline preserved:** 80 (all existing `CP_LGN_*` + `TC_CP_LOGIN_*` IDs retained, none renumbered, none dropped)
- **New TCs:** 29
- **Sub-modules:** 12

## New TC IDs (29)

```
CP_LGN_046  CP_LGN_047  CP_LGN_048  CP_LGN_049  CP_LGN_050
CP_LGN_051  CP_LGN_052  CP_LGN_053  CP_LGN_054  CP_LGN_055
CP_LGN_056  CP_LGN_057  CP_LGN_058  CP_LGN_059  CP_LGN_060
CP_LGN_061  CP_LGN_062  CP_LGN_063  CP_LGN_064  CP_LGN_065
CP_LGN_066  CP_LGN_067  CP_LGN_068
TC_CP_LOGIN_UI_036
TC_CP_LOGIN_API_036  TC_CP_LOGIN_API_037  TC_CP_LOGIN_API_038
TC_CP_LOGIN_API_039  TC_CP_LOGIN_API_040
```
(ID series continued: `CP_LGN_*` from 045 → 046–068; `TC_CP_LOGIN_*` numeric suffix from 035 → 036 onward, by type.)

---

## Flags

### DOC_DRIFT (BRD/FRD vs live — live wins; docs to be corrected)
- **DOC_DRIFT-001** — Login URL. CP-FS-Login + CP-BRD §5 say `https://uat.xrportal.in/login`. Live = `https://uat-web.xrportal.in/` (redirects to `/login`); `uat.xrportal.in` is the Buyer host. All TCs use the uat-web host.
- **DOC_DRIFT-002** — OTP channel. CP-FRD §9 lists "Kaleyra | SMS/WhatsApp" and CP-FS §1.4 says "OTP via SMS/WhatsApp". Corrected source = **Epinet SMS** for OTP (CP-FS §1.7, BRD §9, FSD-CORRECTION 2026-05-25). TCs assert Epinet only.
- **DOC_DRIFT-003** — Post-OTP outcomes. CP-FS §1.6 documents 2 outcomes (complete→dashboard / incomplete→profile). Live (source-confirmed) = **3 outcomes** incl. a distinct **Undertaking** consent modal (isConsented=false). Covered as its own sub-module.

### Security gaps (documented, not bugs to silently fix)
- No backend OTP cooldown / rate-limit; ~60s re-send is UI-only (CP_LGN_012, TC_CP_LOGIN_API_040).
- No wrong-OTP lockout (CP_LGN_018).
- Logout = client-side clear; JWT valid until expiry (CP_LGN_025) — no post-logout 401 pass case.
- isActive=false revoke does NOT invalidate live JWTs (CP_LGN_031 — BUG).
- `POST /cp/registration` is UNAUTHENTICATED (CP_LGN_044).
- OTP Math.random() + plaintext storage; master OTP no prod gate (CP_LGN_065).

### Blockers
- **None.** Dual-source gate cleared (visual-memory FULL + BRD/FRD/FS present). 22 TCs carry `[TEST_DATA_REQUIRED]` (unregistered/Buyer/SM/inactive/soft-deleted mobiles, disposable CP for RegisterCp submit, expired/captured JWTs, API client, DB/audit/log access). Live-mutation TCs (CP_LGN_022, CP_LGN_045) require user authorisation per CLAUDE.md Pipeline Discipline rule 7. Numerous `[VERIFY WITH DEV]` items flag behaviour not confirmed in docs.
```
