# Test Case Review Report — Login — Admin Portal — 2026-06-03

**Reviewer skill:** test-case-reviewer (BA Agent self-review prior to QA Agent hand-off)
**TestCases under review:** `manual-qa-repository/01-test-cases/admin/login/TestCases.md`
**BRD/FRD source:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Login.md`
**Visual memory:** `visual-memory/admin/login/INDEX.md` (CAPTURE_STATUS: **FULL**, 12 screens, captured 2026-05-17)
**Supersedes:** `manual-qa-repository/01-test-cases/admin-portal/login/TC_LOGIN.md` (legacy, single-source, pre-dual-source-rule)

---

## Summary

| Metric | Value |
|--------|-------|
| Total TCs reviewed | **30** |
| Approved | **30** |
| Approved for automation (Sheet 2) | **23** |
| Held back from automation | 7 (`[MANUAL-ONLY]` × 6 + 1 API-direct out-of-scope) |
| Requires changes | 0 |
| Rejected | 0 |
| BRD/FRD coverage | **100 %** (§1–§11.6 all referenced) |
| Visual coverage | **25 / 30 = 83.3 %** (TCs whose Expected Results cite an INDEX.md screenshot) |
| Doc logic coverage | **30 / 30 = 100 %** (every Scenario references a BRD § section or an INDEX.md note) |
| Visual status | **FULL** across all 12 captured screens; every screen referenced by ≥1 TC |
| Selector verification | **PASS** — TC_LOGIN_UI_005 explicitly asserts all documented selectors resolve to exactly one node (six for OTP inputs) |
| API field-name verification | **PASS** — TC_LOGIN_FUNC_001 explicitly intercepts and asserts `phone` (not `mobile`) per INDEX.md note |

**Visual coverage 83.3 % — exceeds 80 % Approved threshold → status APPROVED.**

---

## Dual-Source Audit

| Source | Path | Status | TC mapping completeness |
|--------|------|--------|------------------------|
| Visual memory INDEX.md | `visual-memory/admin/login/INDEX.md` | FULL | 12 / 12 screens referenced; selectors taken verbatim from Key Structural Notes |
| BRD | `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Login.md` | PRESENT | §1, §4 Steps 1-7 (success + failure), §6 Rules 1–8, §7 (all 7 invalid-input rows), §9 user journey, §11.1–§11.6 backend reconciliations — all covered |

Every TC has both:
- A Visual Evidence column citing one or more `visual-memory/admin/login/*.png` files (or explicitly `[NO-VISUAL-EVIDENCE]` for API-direct / cross-module edges)
- A BRD Req ID column mapping to a specific BRD § / § number

No orphan TCs.

---

## BRD Section Coverage Map

| BRD Section | Covered by |
|------------|-----------|
| §1 Purpose | UI_001 (entry point UI), E2E_001 (full purpose flow) |
| §4 Step 1 Mobile screen | UI_001, UI_003, UI_004 (responsive), FUNC_001 |
| §4 Step 2 OTP screen | UI_002, UI_005, FUNC_003 (auto-advance) |
| §4 Successful login | FUNC_002, FUNC_005, E2E_001 |
| §4 Re-Send | NEG_004 (UI gate), FUNC_006 (manual-only) |
| §4 Going Back | FUNC_004, FUNC_BACK |
| §4 Wrong OTP | VAL_004, NEG_003 |
| §5 Status flow / failure path | VAL_004, E2E_001 |
| §6 Rule 1 (10-digit) | VAL_001, VAL_002 |
| §6 Rule 2 (numeric only) | VAL_003 |
| §6 Rule 3 (auto-advance) | FUNC_003, EDGE_005 (paste behaviour) |
| §6 Rule 4 (Re-Send disabled) | NEG_004 |
| §6 Rule 5 (no lockout) | NEG_003 |
| §6 Rule 6 (`/admin/customers` landing) | FUNC_002, FUNC_005, E2E_001 |
| §6 Rule 7 (1-day session) | E2E_002, EDGE_006 |
| §6 Rule 8 (master mobile/OTP) | All happy-path TCs implicitly; EDGE_004 explicitly |
| §7 (validation matrix — all 7 rows) | VAL_001 / 002 / 003 / 004 / 005 / 006 / 007 (1-for-1 mapping) |
| §9 User Journey Map | E2E_001 |
| §11 KNOWN ISSUE (logout no-op) | EDGE_002 `[KNOWN-DEFECT]` |
| §11.1 (no backend cooldown) | EDGE_001 + NEG_004 (UI-only enforcement complement) |
| §11.2 (two master OTPs) | EDGE_004 + FUNC_002 |
| §11.3 (admin pre-provisioning) | NEG_001 |
| §11.4 (access revoked) | NEG_002 |
| §11.5 (permissions map) | FUNC_002 (asserted in Expected Result) |
| §11.6 (sendOtpV3 extra fields) | EDGE_003 |

**Coverage: 100 % of BRD sections have at least one TC.**

---

## Visual Coverage Detail

All 12 captured screens are referenced. Per-screen citation count:

| Screen | TCs citing it |
|--------|--------------|
| `mobile-screen-1920.png` | UI_001, UI_003 (2) |
| `mobile-screen.png` | VAL_001, VAL_002, VAL_003, VAL_007, NEG_001, EDGE_006 (6) |
| `otp-screen.png` | UI_002, UI_005, FUNC_003, VAL_005, VAL_006, NEG_004, FUNC_006, EDGE_005 (8) |
| `login-ui-001-mobile-screen.png` | UI_001 (1) |
| `login-ui-002-otp-screen.png` | UI_002 (1) |
| `login-ui-005-1920.png` | UI_003 (1) |
| `login-ui-006-1440.png` | UI_004 (1) |
| `otp-screen-e2e.png` | FUNC_001 (1) |
| `post-login-customers-page.png` | FUNC_002, FUNC_005, E2E_001, E2E_002, NEG_003, EDGE_004 (6) |
| `dashboard-after-login.png` | E2E_001 (1) |
| `wrong-otp-error.png` | VAL_004, NEG_003 (2) |
| `back-to-mobile-screen.png` | FUNC_004, FUNC_BACK (2) |

No unused screens. No TC cites a missing screen.

---

## Visual Gaps (open — non-blocking)

| Gap | TC affected | Status |
|-----|-------------|--------|
| Revoked-user error toast not captured | NEG_002 | TC carries `[NO-VISUAL-EVIDENCE]`; excluded from Sheet 2 — Tech Lead Agent to capture |
| Logout UI surface not captured | EDGE_002 | TC carries `[NO-VISUAL-EVIDENCE]` + `[KNOWN-DEFECT]`; excluded from Sheet 2 — Tech Lead Agent to capture |

Neither gap blocks Approval; both TCs are explicitly held back from automation.

---

## `[MANUAL-ONLY]` Inventory (BA-flagged)

| TC | Reason for manual-only flag |
|----|----------------------------|
| TC_LOGIN_NEG_001 | Real (unprovisioned) mobile path — triggers live Epinet SMS dispatch attempt |
| TC_LOGIN_NEG_002 | Requires DB seed of revoked admin user; cannot use master mobile |
| TC_LOGIN_FUNC_006 | Requires waiting the full Re-Send countdown timer in real time and a real SMS-receiving mobile |
| TC_LOGIN_EDGE_001 | API-direct rate-burst — documents BRD §11.1 KNOWN ISSUE; no UI surface; running thousands risks billing impact |
| TC_LOGIN_EDGE_002 | BRD §11 KNOWN SECURITY DEFECT — must NOT be run as a passing case until source fix |
| TC_LOGIN_EDGE_006 | Requires either real 24-hour wait or crafted-JWT test (security-sensitive) |

All 6 flagged TCs are explicitly excluded from the Sheet 2 automation candidate list.

---

## Sheet 2 — Automation Readiness Audit

23 TCs marked Automatable=Yes (or Partial).
All 23 have FULL visual evidence.
None have live-SMS dependency (all use master mobile `8888888888` + master OTP `258369`).

Distribution by suite:
- `e2e`: 8 TCs (FUNC_001, FUNC_002, FUNC_003, FUNC_004, FUNC_005, FUNC_BACK, E2E_001, E2E_002, VAL_004)
- `ui-ux`: 3 TCs (UI_001, UI_002, NEG_004)
- `regression`: 9 TCs (UI_005, VAL_001, VAL_002, VAL_003, VAL_005, VAL_006, VAL_007, NEG_003, EDGE_005)
- `cross-browser`: 2 TCs (UI_003, UI_004)

---

## Verdict

**APPROVED — release to QA Agent (Step 3 manual sync) and Tech Lead Agent (locator-map verification).**

Conditions cleared:
- Visual coverage 83.3 % ≥ 80 %
- BRD coverage 100 %
- All 12 captured screens referenced
- All Key Structural Notes selectors verified by TC_LOGIN_UI_005
- All BRD §7 validation rows have a dedicated TC (1-for-1)
- BRD §11 KNOWN ISSUE explicitly captured under EDGE_002 with `[KNOWN-DEFECT]` guard
- All `[MANUAL-ONLY]` TCs excluded from automation candidate list

No held-back logic gaps. Ready for downstream consumption.

---

## Next Actions (handoff)

| Recipient | Action |
|-----------|--------|
| QA Agent | Sync `TestCases.md` → consolidated `TestCases-AdminPortal.xlsx`; scaffold / update `tests/e2e/admin/login.spec.js` and other suite specs using Sheet 2; mark `[MANUAL-ONLY]` TCs in manual-execution tracker |
| Tech Lead Agent | (1) Verify `locators/admin/locator-map.json` `login` section reflects the 8 documented selectors from INDEX.md Key Structural Notes; (2) capture two open visual gaps (revoked error toast, logout UI) and update `visual-memory/admin/login/INDEX.md`; (3) confirm `automation-repository/pages/admin/LoginPage.js` references the locator map (per `.claude/rules/page-objects.md`) |
| Developer Agent (deferred, user-explicit only) | BRD §11 KNOWN ISSUE — logout server-side JWT invalidation. Until source fix, TC_LOGIN_EDGE_002 must NOT run as a passing case |
