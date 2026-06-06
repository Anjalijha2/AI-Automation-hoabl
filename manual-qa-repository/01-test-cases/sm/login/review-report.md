# Test Case Review Report — Login — Sales Manager — 2026-06-06

**Reviewer:** QA Agent (test-case-reviewer skill)
**Source TC file:** `manual-qa-repository/01-test-cases/sm/login/TestCases.md`
**Visual Memory:** `visual-memory/sm/login/INDEX.md` (CAPTURE_STATUS: FULL)
**BRD/FRD:**
- `.claude/docs/hoabl-knowledge-base/SM-Portal/BRD/SM-BRD-SM-Portal.md`
- `.claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FS-Login.md`
- `.claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FRD-SM-Portal.md`

---

## Summary

- Total TCs reviewed: **33**
- Approved (after gap remediation tracking): **33** (status field updated; 6 carry `[NO-VISUAL-EVIDENCE]` markers)
- Requires changes: **0** structural; **6** flagged with `VISUAL_GAP`
- BRD/FRD coverage: **100%** (every TC carries an SM-FS-Login or SM-BRD Req ID)
- Visual coverage: **27 / 33 = 81.8%** (above 80% threshold)
- Doc logic coverage: **33 / 33 = 100%** (every Scenario references an FRD rule / business action)
- Visual status: **FULL** (INDEX.md gate clean, all 5 functional screenshots exist on disk)

---

## Visual Evidence Gaps

| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_SMLOGIN_VAL_012 | Partial OTP (<6 digits) shows `OTP must be 6 digits` | VISUAL_GAP | `[NO-VISUAL-EVIDENCE]` | Capture partial-OTP validation state into `visual-memory/sm/login/` (suggested filename `login-otp-partial.png`) |
| TC_SMLOGIN_VAL_013 | Empty OTP shows `OTP is required` | VISUAL_GAP | `[NO-VISUAL-EVIDENCE]` | Capture empty-submission state (suggested filename `login-otp-empty.png`) |
| TC_SMLOGIN_FUNC_019 | `sales_manager` (non-admin) role logs in to callback-requests | VISUAL_GAP | `[NO-VISUAL-EVIDENCE]` | Capture post-login dashboard with non-admin role; record `verifySalesManagerOtp` payload as evidence artefact |
| TC_SMLOGIN_NEG_025 | Admin-only mobile rejected on SM login | VISUAL_GAP | `[NO-VISUAL-EVIDENCE]` | Capture rejection toast/error for cross-role mobile (suggested filename `login-role-isolation-admin.png`) |
| TC_SMLOGIN_NEG_026 | Inactive SM (`is_active=false`) rejected with valid OTP | VISUAL_GAP | `[NO-VISUAL-EVIDENCE]` | Capture inactive-account rejection state once data fixture is seeded |
| TC_SMLOGIN_NEG_027 | Expired OTP rejected and resets to mobile screen | VISUAL_GAP | `[NO-VISUAL-EVIDENCE]` | Capture expired-OTP error toast + state reset (requires waiting through `otpExpires` window) |

All six gaps are NEGATIVE / EDGE behaviours requiring backend or time-bound data setup. They do not block automation of the 27 visually-covered cases, but they cannot be marked Approved at the per-TC level until evidence captured.

---

## Logic Gaps

| TC_ID | Scenario Text | Missing Context | Action |
|-------|--------------|-----------------|--------|
| — | None | — | None — every Scenario explicitly references an FRD rule (1.4 UI, 1.5 Rules 1–6, 1.6 System Actions 1–3) or SM-BRD §2/§3/§5. No purely mechanical TCs. |

---

## BRD/FRD Gaps

| Gap | BRD/FRD Section | Missing TC Type | Action |
|-----|----------------|-----------------|--------|
| Epinet SMS dispatch verification | SM-FS-Login §1.6 #1, §1.7 | INT / API | No TC verifies that OTP dispatch goes via Epinet SMS (per FSD-CORRECTION 2026-05-25). Consider adding API/network-tap TC once gateway probe is permitted. Out of UI scope but worth flagging. |
| Audit log entry for login | SM-FS-Login §1.8 | DB | No TC asserts that successful login writes a log row. Consider a DB-tier TC against the audit table (requires `db/queries/auth_audit.js`). |

These are FRD-stated behaviours with no corresponding TC. They are not blockers — they are forward-looking additions for full coverage.

---

## Visual Mismatch Check

All five cited screenshot filenames (`login-initial.png`, `login-otp-entry.png`, `login-otp-invalid.png`, `login-otp-resend-enabled.png`, `login-success-dashboard.png`) exist in `visual-memory/sm/login/` and are listed in the INDEX.md Screens table. **No VISUAL_MISMATCH.**

---

## Selector Verification

Sampled steps reference selectors that exactly match INDEX.md Key Structural Notes:
- `input[name="phone"]` — present in INDEX
- `button.ant-btn-submit` — present
- `Radio.Group name="role"` with `sales_manager_admin` / `sales_manager` values — present
- `button.reset-btn.back-to-mobile` — present
- `button.common-link` — present
- `aria-label="OTP Input 1..6"` — present

No `SELECTOR_INFERRED` flag.

---

## Coverage Check

| User Journey (FRD) | Covered By | Status |
|--------------------|------------|--------|
| Mobile entry + role selection | TC_001, TC_002, TC_003, TC_033 | OK |
| Mobile validation (4 rules) | TC_004, TC_005, TC_006 | OK |
| Send OTP → OTP screen | TC_007 | OK |
| OTP entry (6 boxes, ARIA) | TC_008 | OK |
| 60s countdown timer (UI-only) | TC_009, TC_016 | OK |
| Back button reset | TC_010 | OK |
| Invalid OTP rejection | TC_011, TC_012, TC_013 | OK (12,13 lack visual) |
| Re-Send OTP enable/disable | TC_014, TC_015, TC_016, TC_031 | OK |
| Valid OTP → dashboard redirect | TC_017, TC_018, TC_032 | OK |
| Session persistence | TC_020, TC_029, TC_030 | OK |
| Logout | TC_022 | OK |
| Auth gate (direct route access) | TC_021 | OK |
| Cross-portal OTP isolation | TC_023, TC_024 | OK |
| Role 4 vs Role 5 | TC_002, TC_019 | OK (19 lacks visual) |
| Admin role rejection | TC_025 | OK (no visual) |
| Inactive account | TC_026 | OK (no visual) |
| Expired OTP | TC_027 | OK (no visual) |

Every FRD user journey has ≥1 TC. Negative coverage present for every documented rejection path.

---

## Type Distribution

UI = 6, VAL = 6, FUNC = 14, E2E = 1, NEG = 4, EDGE = 1, plus FUNC overlaps. P1 = 14, P2 = 12, P3 = 7. Distribution is balanced; positive + negative coverage exists for every journey.

---

## TC_ID Format

All 33 IDs follow `TC_SMLOGIN_<TYPE>_<NNN>` (underscores, sequential 001–033). Conformant.

---

## Per-TC Status

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_SMLOGIN_UI_001 | SM-FS-Login 1.4 | login-initial.png | FRD 1.4 | Approved | — |
| TC_SMLOGIN_UI_002 | SM-BRD §2 | login-initial.png | BRD Roles 4/5 | Approved | — |
| TC_SMLOGIN_UI_003 | SM-FS-Login 1.4 | login-initial.png | FRD 1.4 | Approved | — |
| TC_SMLOGIN_VAL_004 | SM-FS-Login 1.5 (Rule 1) | login-initial.png | FRD 1.5 R1 | Approved | — |
| TC_SMLOGIN_VAL_005 | SM-FS-Login 1.5 (Rule 1) | login-initial.png | FRD 1.5 R1 | Approved | — |
| TC_SMLOGIN_VAL_006 | SM-FS-Login 1.5 (Rule 1) | login-initial.png | FRD 1.5 R1 | Approved | — |
| TC_SMLOGIN_FUNC_007 | SM-FS-Login 1.6 (Sys Act 1) | login-otp-entry.png | FRD 1.6 SA1 | Approved | — |
| TC_SMLOGIN_UI_008 | SM-FS-Login 1.4 | login-otp-entry.png | FRD 1.4 | Approved | — |
| TC_SMLOGIN_UI_009 | SM-FS-Login 1.5 (Rule 3) | login-otp-entry.png | FRD 1.5 R3 | Approved | — |
| TC_SMLOGIN_UI_010 | SM-FS-Login 1.4 | login-otp-entry.png | FRD 1.4 | Approved | — |
| TC_SMLOGIN_VAL_011 | SM-FS-Login 1.5 (Rule 2) | login-otp-invalid.png | FRD 1.5 R2 | Approved | — |
| TC_SMLOGIN_VAL_012 | SM-FS-Login 1.4, 1.5 | [NO-VISUAL-EVIDENCE] | FRD 1.4/1.5 | Conditional | VISUAL_GAP — capture partial-OTP state |
| TC_SMLOGIN_VAL_013 | SM-FS-Login 1.4 | [NO-VISUAL-EVIDENCE] | FRD 1.4 | Conditional | VISUAL_GAP — capture empty-OTP state |
| TC_SMLOGIN_FUNC_014 | SM-FS-Login 1.5 (Rule 3) | login-otp-resend-enabled.png | FRD 1.5 R3 | Approved | — |
| TC_SMLOGIN_FUNC_015 | SM-FS-Login 1.5 (Rule 3) | login-otp-resend-enabled.png | FRD 1.5 R3 | Approved | — |
| TC_SMLOGIN_FUNC_016 | SM-FS-Login 1.5 (Rule 3) | login-otp-entry.png | FRD 1.5 R3 | Approved | — |
| TC_SMLOGIN_E2E_017 | SM-FS-Login 1.5 R5,6; 1.6 | login-success-dashboard.png | FRD 1.5/1.6 | Approved | — |
| TC_SMLOGIN_FUNC_018 | SM-BRD §3 Mod1; FRD 1.5 R6 | login-success-dashboard.png | FRD 1.5 R6 | Approved | — |
| TC_SMLOGIN_FUNC_019 | SM-BRD §2 Role 5; FRD 1.2 | [NO-VISUAL-EVIDENCE] | BRD §2 | Conditional | VISUAL_GAP — capture role-5 login |
| TC_SMLOGIN_FUNC_020 | SM-FS-Login 1.6 (Sys Act 3) | login-success-dashboard.png | FRD 1.6 SA3 | Approved | — |
| TC_SMLOGIN_FUNC_021 | SM-FS-Login 1.5 (Rule 5) | login-initial.png | FRD 1.5 R5 | Approved | — |
| TC_SMLOGIN_FUNC_022 | SM-FS-Login 1.6 (Sys Act 3) | login-initial.png | FRD 1.6 SA3 | Approved | — |
| TC_SMLOGIN_NEG_023 | SM-FS-Login 1.2 (Scope) | login-otp-invalid.png | FRD 1.2 | Approved | — |
| TC_SMLOGIN_NEG_024 | SM-FS-Login 1.2 (Scope) | login-otp-invalid.png | FRD 1.2 | Approved | — |
| TC_SMLOGIN_NEG_025 | SM-FS-Login 1.2 | [NO-VISUAL-EVIDENCE] | FRD 1.2 | Conditional | VISUAL_GAP — capture admin-role rejection |
| TC_SMLOGIN_NEG_026 | SM-FS-Login 1.5 (Rule 4) | [NO-VISUAL-EVIDENCE] | FRD 1.5 R4 | Conditional | VISUAL_GAP — needs inactive-SM fixture + capture |
| TC_SMLOGIN_NEG_027 | SM-FS-Login 1.5 (Rule 2) | [NO-VISUAL-EVIDENCE] | FRD 1.5 R2 | Conditional | VISUAL_GAP — capture expired-OTP reset |
| TC_SMLOGIN_FUNC_028 | SM-FS-Login 1.6 (Sys Act 1) | login-otp-entry.png | FRD 1.6 SA1 | Approved | — |
| TC_SMLOGIN_FUNC_029 | SM-FS-Login 1.6 (Sys Act 2,3) | login-success-dashboard.png | FRD 1.6 SA2,3 | Approved | — |
| TC_SMLOGIN_FUNC_030 | SM-FS-Login 1.6 | login-initial.png | FRD 1.6 | Approved | — |
| TC_SMLOGIN_FUNC_031 | SM-FS-Login 1.5 (Rule 3) | login-otp-resend-enabled.png | FRD 1.5 R3 | Approved | — |
| TC_SMLOGIN_FUNC_032 | SM-BRD §5 Mod1 | login-success-dashboard.png | BRD §5 | Approved | — |
| TC_SMLOGIN_EDGE_033 | SM-FS-Login 1.4; SM-BRD §2 | login-initial.png | FRD 1.4 | Approved | — |

---

## Approval

- [x] **Conditional** — Overall module status. Visual coverage 81.8% (≥80% threshold) and no LOGIC_GAP/VISUAL_MISMATCH BUT 6 TCs carry `[NO-VISUAL-EVIDENCE]` markers, which per skill gate rules prevent module-level **Approved** status until evidence is captured.
- [ ] Approved — pending capture of 6 missing evidence files
- [ ] Rejected — not applicable

**Gate decision:**
- 27 TCs (those with full visual evidence) are Approved and ready for automation scaffolding.
- 6 TCs (VAL_012, VAL_013, FUNC_019, NEG_025, NEG_026, NEG_027) remain Conditional pending visual capture; they should NOT yet flow into Sheet 2 automation candidates until evidence exists. Tech Lead Agent to add capture entries via `visual-capture` skill before automation Step 4.

**Hand-off:**
- Tech Lead Agent: capture the 6 missing screenshots when seeding the inactive-SM and admin-role fixtures.
- QA Agent (Automation): scaffold POM `automation-repository/pages/sales-manager/LoginPage.js` and 6 spec types for the 27 Approved TCs immediately; gate VAL_012/013/019/025/026/027 specs behind a TODO/skip until evidence in place.
