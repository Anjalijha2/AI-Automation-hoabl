# Test Case Review Report — Login — CP Portal — 2026-06-06

**Reviewer:** QA Agent (`test-case-reviewer` skill)
**TC File:** `manual-qa-repository/01-test-cases/cp/login/TestCases.md`
**Visual Memory:** `visual-memory/cp/login/INDEX.md` (CAPTURE_STATUS: FULL — 6 screenshots)
**BRD/FRD:** `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-Login.md` (+ `CP-BRD-CP-Portal.md`, `CP-FRD-CP-Portal.md`)

---

## Summary

- Total TCs reviewed: 35
- Approved: 34
- Conditional: 1
- Rejected: 0
- Coverage (BRD/FRD): 100% (every TC carries at least one BRD/FRD requirement ID)
- Visual coverage: 34/35 = **97.1%** (TCs with screenshot-backed expected results that exist in INDEX.md Screens table)
- Doc logic coverage: 35/35 = **100%** (every TC Scenario cites a BRD/FRD section or business rule)
- Visual status: **FULL**

---

## Visual Evidence Gaps

| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_CP_LOGIN_BIZ_029 | Incomplete profile → RegisterCp redirect (not /dashboard) | `[NO-VISUAL-EVIDENCE]` | `login-incomplete-profile.png` not captured | Provision second UAT CP account in incomplete-profile state OR reset profile flags via DB; then re-capture and lift to APPROVED |

All other 34 TCs cite filenames present in INDEX.md Screens table (`login-initial.png`, `screenshot-desktop.png`, `login-otp-entry.png`, `login-otp-invalid.png`, `login-otp-resend-enabled.png`, `login-success-dashboard.png`). Zero VISUAL_MISMATCH flags.

## Logic Gaps

None. Every TC Scenario references a CP-FS-Login section (§1.3–§1.8) or CP-BRD section (§3, §5, §9). Mechanical-only TCs absent.

## BRD/FRD Gaps

None. Every documented FRD user journey is covered by at least one TC:
- Mobile entry & validation (TCs 1–8, 30)
- Send OTP transition (TC 9)
- OTP entry layout, countdown, resend gating (TCs 10–14)
- Invalid/expired OTP handling (TCs 15–17)
- Happy path → /dashboard (TC 18)
- Auth state, persistence, logout, gate (TCs 21–26)
- Cross-role rejection (TCs 27, 28)
- Incomplete profile branch (TC 29 — CONDITIONAL)
- Audit logging (TC 31)

Negative coverage: TCs 4, 5, 6, 7, 8, 15, 16, 17, 24, 25, 27, 28, 34 (13 negative TCs across all documented validations and rules).

## Per-TC Status

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_CP_LOGIN_UI_001 | CP-BRD §3, CP-FS-Login §1.4 | login-initial.png + screenshot-desktop.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_UI_002 | CP-FS-Login §1.4 | login-initial.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_UI_003 | CP-FS-Login §1.5 | login-initial.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_VAL_004 | CP-FS-Login §1.5 r1 | login-initial.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_VAL_005 | CP-FS-Login §1.4, §1.5 | login-initial.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_VAL_006 | CP-FS-Login §1.4 | login-initial.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_VAL_007 | CP-FS-Login §1.4 | login-initial.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_NEG_008 | CP-FS-Login §1.5 r1 | login-initial.png + login-otp-invalid.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_FUNC_009 | CP-FS-Login §1.4, §1.6, §1.7 | login-otp-entry.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_UI_010 | CP-FS-Login §1.5 r2 | login-otp-entry.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_UI_011 | CP-FS-Login §1.4 | login-otp-entry.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_UI_012 | CP-FS-Login §1.5 r3 | login-otp-entry.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_FUNC_013 | CP-FS-Login §1.5 r2/r3 | login-otp-resend-enabled.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_FUNC_014 | CP-FS-Login §1.5 r2, §1.6 | login-otp-entry.png + login-otp-resend-enabled.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_NEG_015 | CP-FS-Login §1.4, §1.5 r3 | login-otp-invalid.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_NEG_016 | CP-FS-Login §1.4 | login-otp-entry.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_NEG_017 | CP-FS-Login §1.5 r2 | login-otp-invalid.png + login-otp-resend-enabled.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_E2E_018 | CP-FS-Login §1.5 r5, §1.6, CP-BRD §5 | login-success-dashboard.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_FUNC_019 | CP-FS-Login §1.4 | login-otp-entry.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_FUNC_020 | CP-FS-Login §1.4 | login-initial.png + login-otp-entry.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_DC_021 | CP-FS-Login §1.5 r5, §1.8 | login-success-dashboard.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_FUNC_022 | CP-FS-Login §1.5 r5 | login-success-dashboard.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_FUNC_023 | CP-FS-Login §1.5 r5 | login-success-dashboard.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_NEG_024 | CP-FS-Login §1.5 r5, CP-BRD §1.2 | login-initial.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_NEG_025 | CP-FS-Login §1.5 r5 | login-initial.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_FUNC_026 | CP-FS-Login §1.5 r5, §1.8 | login-initial.png + login-success-dashboard.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_NEG_027 | CP-FS-Login §1.5 r6 | login-otp-invalid.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_NEG_028 | CP-FS-Login §1.5 r6 | login-otp-invalid.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_BIZ_029 | CP-FS-Login §1.5 r4, §1.6, §1.3 | `[NO-VISUAL-EVIDENCE]` | ✓ | **Conditional** | VISUAL_GAP — incomplete-profile state not captured |
| TC_CP_LOGIN_VAL_030 | CP-FS-Login §1.4 | login-initial.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_REG_031 | CP-FS-Login §1.8 | login-success-dashboard.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_UI_032 | CP-FS-Login §1.4 | login-initial.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_EDGE_033 | CP-FS-Login §1.4 | login-otp-entry.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_NEG_034 | CP-FS-Login §1.4 | login-otp-entry.png ✓ | ✓ | APPROVED | — |
| TC_CP_LOGIN_FUNC_035 | CP-FS-Login §1.6, §1.7, CP-BRD §9 | login-otp-entry.png ✓ | ✓ | APPROVED | — |

---

## Approval

[ ] Approved
[x] **Conditional** — exactly one TC (TC_CP_LOGIN_BIZ_029) carries `[NO-VISUAL-EVIDENCE]`. Per `test-case-reviewer` skill Approval Gate Rules, any `[NO-VISUAL-EVIDENCE]` flag prevents Approved status even when visual coverage exceeds the 80% threshold.
[ ] Rejected

**Conditional reason:** TC_CP_LOGIN_BIZ_029 (incomplete profile → RegisterCp redirect) cannot be promoted until either (a) a second UAT CP account in `isCpRegistrationCompleted = false` state is provisioned and `login-incomplete-profile.png` captured by Tech Lead Agent, or (b) the TC is removed from the automation candidate list pending UAT data availability.

**Automation candidacy:** 34 TCs are clear for Sheet 2 (automation candidates). TC_CP_LOGIN_BIZ_029 must NOT appear in Sheet 2 until the visual gap is closed.
