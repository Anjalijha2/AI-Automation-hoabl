# Test Case Review Report — Allocation — Admin — 2026-06-06

**Reviewer:** QA Agent via `test-case-reviewer` skill
**TestCases source:** `manual-qa-repository/01-test-cases/admin/allocation/TestCases.md`
**BRD source:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Allocation.md`
**Visual memory source:** `visual-memory/admin/allocation/INDEX.md` (CAPTURE_STATUS: FULL, 9 screens)

---

## Summary

| Metric | Value |
|--------|-------|
| Total TCs reviewed | 48 |
| Approved | 44 |
| Requires Changes | 4 (NO-VISUAL-EVIDENCE — API/cross-module only) |
| BRD/FRD coverage | 100% — every TC carries a BRD § Req ID |
| Visual coverage | 91.7% (44/48 TCs cite a screenshot from INDEX.md Screens table) |
| Doc logic coverage | 100% — every Scenario references a BRD § or INDEX.md note |
| Visual status | FULL |

---

## Visual Evidence Gaps

| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_ALLOC_EDGE_045 | Backend silently substitutes projectId=2 on UAT when client omits projectId | [NO-VISUAL-EVIDENCE] — API-level only | none | Acceptable for EDGE/API category — keep flagged; already excluded from Sheet 2 |
| TC_ALLOC_EDGE_046 | PHYSICAL_EVENT does NOT enforce typology-match — backend asymmetry | [NO-VISUAL-EVIDENCE] — backend asymmetry | none | Acceptable for EDGE/API category — already excluded from Sheet 2 |
| TC_ALLOC_EDGE_047 | Unit HOLD auto-releases at 20 min — observable in Towers / Buyer | [NO-VISUAL-EVIDENCE] — cross-module (Towers) | none | Acceptable — cross-module observation; Towers INDEX.md owns evidence; already excluded |
| TC_ALLOC_EDGE_048 | Payment-status release immediately — cross-module observation | [NO-VISUAL-EVIDENCE] — cross-module (Towers/Buyer) | none | Acceptable — cross-module; already excluded from Sheet 2 |

**VISUAL_MISMATCH check:** all 9 filenames cited in Visual Evidence columns cross-checked against INDEX.md Screens table — every cited filename exists. Zero VISUAL_MISMATCH.

INDEX.md Screens (authoritative): `screenshot-desktop.png`, `screenshot-ui.png`, `allocation-form-validation-errors.png`, `allocation-empty-state.png`, `allocation-export-ui.png`, `allocation-notify-ui.png`, `allocation-stop-modal.png`, `allocation-rounds-view.png`, `allocation-cancel-modal.png` — all 9 cited by ≥1 TC.

---

## Logic Gaps

| TC_ID | Scenario Text | Missing Context | Action |
|-------|--------------|-----------------|--------|

None. Every TC Scenario references a BRD § (1–10.26) or a documented INDEX.md note. No purely mechanical TCs detected.

---

## BRD/FRD Gaps

| Gap | BRD/FRD Section | Missing TC Type | Action |
|-----|----------------|-----------------|--------|

None. Every documented user journey in BRD §3 (allocation types), §4 (rules), §5 (status flow), §6 (UI/flow), §10 (engineering reconciliation) has ≥1 TC. Both positive + negative TCs exist for each rule.

---

## Per-TC Status

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_ALLOC_UI_001 | BRD §1 + §6.2 | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_UI_002 | BRD §6.2 | screenshot-desktop.png + screenshot-ui.png | FULL | Approved | — |
| TC_ALLOC_UI_003 | BRD §6.2 filter bar | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_UI_004 | BRD §6 sidebar | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_UI_005 | INDEX.md Status Filter | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_FUNC_006 | BRD §6.3 + §6.4 | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_FUNC_007 | BRD §3 + §6.3 | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_FUNC_008 | BRD §3 + §10.2 | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_VAL_009 | INDEX.md + BRD §6.3 | allocation-form-validation-errors.png | FULL | Approved | — |
| TC_ALLOC_VAL_010 | BRD §4 Rule 1 | allocation-form-validation-errors.png | FULL | Approved | — |
| TC_ALLOC_VAL_011 | BRD §6.3 | allocation-form-validation-errors.png | FULL | Approved | — |
| TC_ALLOC_VAL_012 | BRD §6.3 | allocation-form-validation-errors.png | FULL | Approved | — |
| TC_ALLOC_VAL_013 | BRD §6.3 chronology | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_VAL_014 | BRD §6.3 | allocation-form-validation-errors.png | FULL | Approved | — |
| TC_ALLOC_VAL_015 | INDEX.md Form note | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_FUNC_016 | BRD §6.6 | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_FUNC_017 | BRD §6.6 search | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_FUNC_018 | BRD §6.6 | allocation-empty-state.png | FULL | Approved | — |
| TC_ALLOC_FUNC_019 | BRD §6.6 refresh | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_FUNC_020 | BRD §6.4 + §5 | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_UI_021 | INDEX.md Active-row | allocation-stop-modal.png + screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_UI_022 | INDEX.md Upcoming-row | allocation-cancel-modal.png | FULL | Approved | — |
| TC_ALLOC_FUNC_023 | BRD §4 Rule 5 + §10.18 | allocation-stop-modal.png | FULL | Approved | — |
| TC_ALLOC_FUNC_024 | BRD §4 Rule 5 + §5 + §10.18 | allocation-stop-modal.png + screenshot-desktop.png | FULL | Approved | `[MANUAL-ONLY]` destructive |
| TC_ALLOC_FUNC_025 | BRD §4 Rule 5 + §10.18 | allocation-cancel-modal.png | FULL | Approved | — |
| TC_ALLOC_FUNC_026 | BRD §4 Rule 5 + §5 + §10.18 | allocation-cancel-modal.png + screenshot-desktop.png | FULL | Approved | `[MANUAL-ONLY]` destructive |
| TC_ALLOC_NEG_027 | INDEX.md Stop modal | allocation-stop-modal.png | FULL | Approved | — |
| TC_ALLOC_FUNC_028 | BRD §5 auto-Completed | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_FUNC_029 | INDEX.md Reset | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_BIZ_030 | BRD §4 Rule 2 + §10.16 | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_BIZ_031 | BRD §4 Rule 3 | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_BIZ_032 | BRD §10.17 | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_NEG_033 | BRD §10.3 | allocation-form-validation-errors.png | FULL | Approved | — |
| TC_ALLOC_NEG_034 | BRD §10.2 | allocation-form-validation-errors.png | FULL | Approved | — |
| TC_ALLOC_NEG_035 | BRD §10.25 | allocation-form-validation-errors.png | FULL | Approved | — |
| TC_ALLOC_UI_036 | INDEX.md Detail PE | allocation-export-ui.png | FULL | Approved | — |
| TC_ALLOC_UI_037 | INDEX.md Detail Static-Active | screenshot-desktop.png | FULL | Approved | — |
| TC_ALLOC_UI_038 | BRD §10.5 + INDEX.md | allocation-export-ui.png | FULL | Approved | — |
| TC_ALLOC_FUNC_039 | BRD §10.5 | allocation-export-ui.png | FULL | Approved | — |
| TC_ALLOC_FUNC_040 | BRD §10.5 | allocation-export-ui.png | FULL | Approved | — |
| TC_ALLOC_UI_041 | BRD §10.6 | allocation-notify-ui.png | FULL | Approved | — |
| TC_ALLOC_FUNC_042 | BRD §10.6 | allocation-notify-ui.png | FULL | Approved | `[MANUAL-ONLY]` destructive Kaleyra |
| TC_ALLOC_UI_043 | BRD §3 + §10.4 | allocation-rounds-view.png | FULL | Approved | — |
| TC_ALLOC_NEG_044 | BRD §3 + §10.4 | allocation-rounds-view.png + allocation-export-ui.png | FULL | Approved | — |
| TC_ALLOC_EDGE_045 | BRD §10.1 | [NO-VISUAL-EVIDENCE] | API-only | Requires Changes | NO-VISUAL flag — intentional API/backend |
| TC_ALLOC_EDGE_046 | BRD §10.26 | [NO-VISUAL-EVIDENCE] | Backend-only | Requires Changes | NO-VISUAL flag — intentional backend asymmetry |
| TC_ALLOC_EDGE_047 | BRD §10.19 | [NO-VISUAL-EVIDENCE] | Cross-module | Requires Changes | NO-VISUAL flag — cross-module (Towers) |
| TC_ALLOC_EDGE_048 | BRD §10.20 | [NO-VISUAL-EVIDENCE] | Cross-module | Requires Changes | NO-VISUAL flag — cross-module (Towers/Buyer) |

---

## Approval

- [ ] Approved — proceed to automation (visual ≥ 80%, no NO-VISUAL-EVIDENCE, no LOGIC_GAP, no VISUAL_MISMATCH)
- [x] **Conditional — fix gaps before proceeding** — 4 EDGE TCs carry `[NO-VISUAL-EVIDENCE]` per skill hard-gate. These are intentional API/cross-module categorisations and are already excluded from Sheet 2 (automation candidates). UI-applicable TCs (44/44) are fully approved and may proceed to automation.
- [ ] Rejected

**Rationale:** Per skill Approval Gate Rules — "any NO-VISUAL-EVIDENCE present → Conditional (cannot be Approved)". The 4 EDGE TCs are correctly flagged at TC level and excluded from Sheet 2. All 44 in-page TCs proceed to automation.

**Blocking issues:** 4 NO-VISUAL-EVIDENCE EDGE TCs (EDGE_045, _046, _047, _048) — already correctly classified and excluded from Sheet 2.

**Action items:**
1. The 4 EDGE TCs remain documented as API-only / cross-module — confirmed in Sheet 2 exclusion list.
2. Proceed with automation for the 44 Approved in-page TCs.
3. EDGE_045/_046 → API spec; EDGE_047/_048 → cross-module observation in Towers/Buyer spec runs.
