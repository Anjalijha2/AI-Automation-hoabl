# Test Case Review Report — Customers — Admin — 2026-06-06

**Reviewer:** QA Agent via `test-case-reviewer` skill
**TestCases source:** `manual-qa-repository/01-test-cases/admin/customers/TestCases.md`
**BRD source:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Customers.md`
**Visual memory source:** `visual-memory/admin/customers/INDEX.md` (CAPTURE_STATUS: FULL, 10 screens)

---

## Summary

| Metric | Value |
|--------|-------|
| Total TCs reviewed | 62 |
| Approved | 61 |
| Requires Changes | 1 (NO-VISUAL-EVIDENCE — API-only) |
| BRD/FRD coverage | 100% — every TC carries a BRD §/Rule Req ID |
| Visual coverage | 98.4% (61/62 TCs cite a screenshot from INDEX.md Screens table) |
| Doc logic coverage | 100% — every Scenario references a BRD § or Rule |
| Visual status | FULL |

---

## Visual Evidence Gaps

| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_CUSTOMERS_DC_059 | Backend silently substitutes projectId=2 on UAT when client omits projectId — API/backend behaviour | [NO-VISUAL-EVIDENCE] — API/backend only | none | Acceptable for DC (Data Contract) category — already excluded from Sheet 2 |

**VISUAL_MISMATCH check:** all filenames cited in Visual Evidence columns (61 TCs) cross-checked against INDEX.md Screens table — every cited filename exists. Zero VISUAL_MISMATCH.

INDEX.md Screens (authoritative): `screenshot-desktop.png`, `screenshot-ui.png`, `customers-filters-expanded.png`, `customers-booked-actions-dropdown.png`, `customers-registered-actions-dropdown.png`, `customers-home-loan-approval-modal.png`, `customers-empty-search-state.png`, `customers-cancel-registration-modal.png`, `customers-cancel-unit-modal.png` — all 9 file entries cited by ≥1 TC (plus `screenshot-ui.png` is referenced via `screenshot-desktop.png` linkage).

---

## Logic Gaps

| TC_ID | Scenario Text | Missing Context | Action |
|-------|--------------|-----------------|--------|

None. Every TC Scenario references a BRD § (1, 3, 4, 5, 6 Rules 1–19, 7, 8, 9) or a documented INDEX.md Key Structural Note. No purely mechanical TCs detected.

---

## BRD/FRD Gaps

| Gap | BRD/FRD Section | Missing TC Type | Action |
|-----|----------------|-----------------|--------|

None. Source Traceability map in TestCases.md confirms every BRD section §1–§9 has ≥1 TC; every Rule 1–19 mapped; `Orphan check: 0 orphan TCs.`

Out-of-scope items (deferred — documented in TestCases.md): View Milestones, Unit Swap, Update Parking Details, Assign Unit, Home Loan Approval modal internals beyond toggle/Submit, Cancel Bulk Units downstream — all flagged with dedicated FS pointers.

---

## Per-TC Status

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_CUSTOMERS_UI_001 | §3 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_002 | §3 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_003 | §4 KPI | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_004 | §6 R1 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_BIZ_005 | §6 R2 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_BIZ_006 | §6 R1 | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_NEG_007 | §6 R17 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_008 | §4 Table | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_009 | §4 Heading | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_010 | §4 Reg column | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_011 | §5 + §6 R16 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_012 | §5 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_NEG_013 | §6 R16 | customers-empty-search-state.png | FULL | Approved | — |
| TC_CUSTOMERS_NEG_014 | §6 R16 | customers-empty-search-state.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_015 | §4 Filters | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_016 | §5 + §6 R19 | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_017 | §5 | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_018 | §5 + §6 R19 | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_019 | §5 | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_020 | §6 R18 | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_021 | §6 R18 | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_022 | §5 | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_023 | §4 Inline col | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_024 | §4 Inline col | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_025 | KSN Pagination | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_026 | §5 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_027 | §5 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_028 | §5 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_NEG_029 | KSN Pagination | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_030 | §4 + §6 R12 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_031 | §4 Trash | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_032 | §4 Trash | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_033 | §4 Trash REFUND | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_WF_034 | §5 + §9 | customers-cancel-unit-modal.png | FULL | Approved | — |
| TC_CUSTOMERS_WF_034b | §5 + §9 + §6 R8 | customers-cancel-unit-modal.png | FULL | Approved | Destructive — LSQ Mavis pre-cleanup gated |
| TC_CUSTOMERS_NEG_035 | §5 attestation | customers-cancel-unit-modal.png | FULL | Approved | — |
| TC_CUSTOMERS_WF_036 | §5 + §9 | customers-cancel-registration-modal.png | FULL | Approved | — |
| TC_CUSTOMERS_WF_036b | §5 + §9 + §6 R8 | customers-cancel-registration-modal.png | FULL | Approved | Destructive — ₹999 refund gated |
| TC_CUSTOMERS_UI_037 | §4 three-dot | customers-booked-actions-dropdown.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_038 | §4 three-dot | customers-registered-actions-dropdown.png | FULL | Approved | — |
| TC_CUSTOMERS_WF_039 | §5 + §9 | customers-home-loan-approval-modal.png | FULL | Approved | — |
| TC_CUSTOMERS_WF_039b | §5 + §6 R9 | customers-home-loan-approval-modal.png | FULL | Approved | State change — manual-gated |
| TC_CUSTOMERS_FUNC_040 | §5 + §6 R5 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_041 | §6 R5 + §7 | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_042 | §5 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_FUNC_043 | §4 Bulk | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_044 | §4 Download Unit | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_045 | §4 helper text | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_046 | KSN Sidebar | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_UI_047 | KSN Welcome | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_E2E_048 | §9 | screenshot-desktop + booked-actions + home-loan-approval-modal | FULL | Approved | — |
| TC_CUSTOMERS_E2E_049 | §9 Cancel Unit | customers-cancel-unit-modal.png | FULL | Approved | Destructive — LSQ-gated |
| TC_CUSTOMERS_E2E_050 | §9 Cancel Reg | customers-cancel-registration-modal.png | FULL | Approved | Destructive — refund gated |
| TC_CUSTOMERS_XMOD_051 | §8 Config | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_XMOD_052 | §8 CP | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_XMOD_053 | §8 Payment | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_BIZ_054 | §6 R6 multi-sub | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_EDGE_055 | §5 no-match | customers-empty-search-state.png | FULL | Approved | — |
| TC_CUSTOMERS_REG_056 | §6 R3 permanence | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_VAL_057 | §6 R19 + §5 | customers-filters-expanded.png | FULL | Approved | — |
| TC_CUSTOMERS_API_058 | §6 R17 | screenshot-desktop.png | FULL | Approved | — |
| TC_CUSTOMERS_DC_059 | GAP-DEV-001 default projectId | [NO-VISUAL-EVIDENCE] | API/backend-only | Requires Changes | NO-VISUAL flag — intentional Data Contract, excluded from Sheet 2 |

---

## Approval

- [ ] Approved — proceed to automation (visual ≥ 80%, no NO-VISUAL-EVIDENCE, no LOGIC_GAP, no VISUAL_MISMATCH)
- [x] **Conditional — fix gaps before proceeding** — 1 DC TC (TC_CUSTOMERS_DC_059) carries `[NO-VISUAL-EVIDENCE]`. Already correctly excluded from Sheet 2.
- [ ] Rejected

**Rationale:** Per skill Approval Gate Rules — any NO-VISUAL-EVIDENCE present → Conditional. 61/62 TCs are Approved with 98.4% visual coverage. The single NO-VISUAL TC is a Data Contract (DC) test for backend-only behaviour and correctly excluded from automation Sheet 2.

**Blocking issues:** 1 NO-VISUAL-EVIDENCE TC (DC_059) — intentional category, no remediation required.

**Action items:**
1. Proceed with automation for the 61 Approved in-page TCs.
2. DC_059 → execute only as pure API spec when api suite is added.
3. Out-of-scope FS items (Unit Swap, Parking, Assign Unit, etc.) require their own visual-capture + manual-tester runs.
