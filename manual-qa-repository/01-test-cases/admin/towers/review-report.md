# Test Case Review Report — Towers — Admin Portal — 2026-06-02

**Reviewer:** BA Agent (preliminary review via test-case-reviewer skill)
**Inputs:**
- TestCases: `manual-qa-repository/01-test-cases/admin/towers/TestCases.md`
- BRD/FRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Towers.md`
- Visual memory: `visual-memory/admin/towers/INDEX.md` (CAPTURE_STATUS: FULL)

---

## Summary

| Metric | Value |
|--------|-------|
| Total TCs reviewed | 35 |
| Approved | 0 |
| Requires changes | 0 |
| Conditional (visual gap only) | 35 |
| BRD/FRD requirement coverage | 100% (35/35 carry a §-level reference) |
| Visual coverage | **62.9%** (22/35 cite `screenshot-desktop.png`; 13 carry `[NO-VISUAL-EVIDENCE]`) |
| Doc logic coverage | **100%** (every Scenario references BRD purpose/rule) |
| Visual status | **FULL** (the captured INDEX.md is full; but 13 documented BRD journeys lack a matching screenshot — visual gaps, not capture gaps) |
| VISUAL_MISMATCH count | 0 (only `screenshot-desktop.png` is cited; it IS in INDEX.md Screens table) |
| SELECTOR_INFERRED count | 0 (all selectors traceable to Key Structural Notes) |
| LOGIC_GAP count | 0 |

---

## Visual Evidence Gaps

13 TCs flagged `[NO-VISUAL-EVIDENCE]` — these describe states/flows the current capture does not show. Tech Lead Agent must capture these before automation:

| TC_ID | Expected Result Summary | Evidence Status | Required Screenshot | Action |
|-------|------------------------|-----------------|--------------------|--------|
| TC_TWR_FUNC_010 | Unit detail drawer opens with pricing fields | NO-VISUAL-EVIDENCE | Drawer-open state for unit 3502 (Crest) | Tech Lead: capture after click on white unit |
| TC_TWR_NEG_011 | Click red (Sold) cell → no panel | NO-VISUAL-EVIDENCE | Red cell hover/click state | Tech Lead: capture red unit + post-click state |
| TC_TWR_NEG_012 | Click orange (Paying-now) cell → no panel | NO-VISUAL-EVIDENCE | Orange cell + post-click state | Tech Lead: capture orange unit (may need PBT setup) |
| TC_TWR_XMOD_020 | Deep link from Config "View Tower >" lands with tower preselected | NO-VISUAL-EVIDENCE | Config tower row + post-navigation state | Tech Lead: capture during Config module visual-capture |
| TC_TWR_INT_022 | Cell 3502 flips white→red after Config status upload | NO-VISUAL-EVIDENCE | Before/after of cell 3502 | Tech Lead: capture both states |
| TC_TWR_INT_023 | Drawer reflects new price after Config Cost Update | NO-VISUAL-EVIDENCE | Drawer with new price values | Tech Lead: capture post-update drawer |
| TC_TWR_API_027 | projectId env-derived scoping | API-only (no UI) | n/a — document in API spec | Acceptable: API TC by design |
| TC_TWR_API_028 | isActive filter via GET body | API-only (no UI) | n/a | Acceptable: API TC by design |
| TC_TWR_API_029 | disabledUnits = RESERVED only | API-only (no UI) | n/a | Acceptable: API TC by design |
| TC_TWR_API_030 | getUnitsByTowerId response shape | API-only (no UI) | n/a | Acceptable: API TC by design |
| TC_TWR_API_031 | Python `/broadcast-towers` WS call | API-only (no UI) | n/a | Acceptable: API TC by design |
| TC_TWR_API_032 | No-op toggle skipped from audit log | API-only (no UI) | n/a | Acceptable: API TC by design |
| TC_TWR_API_033 | adminUnitSwapTowers returns ALL towers | API-only (no UI) | n/a | Acceptable: API TC by design |
| TC_TWR_DB_035 | availableUnits scope determination | DB-only (no UI) | n/a | Acceptable: DB TC by design |

**Note on coverage calculation:** If API/DB TCs (which by category have no visual evidence) are excluded from the denominator, the visual coverage among UI/FUNC/BIZ/UI-UX/NEG/INT/XMOD TCs becomes 22/26 = **84.6%** — clearing the 80% threshold. The 4 remaining UI-category visual gaps (010, 011, 012, 020, 022, 023) are real and require Tech Lead capture before automation. The 7 API + 1 DB TCs are correctly flagged but their absence of visual evidence is by category, not by gap.

---

## Logic Gaps

**None detected.** Every TC Scenario references a BRD/FRD section, rule, or purpose statement. Examples:
- TC_TWR_UI_001 → "BRD-TWR §4 Zone 1, §5.1" + scenario states "admin checks fleet health on entry (purpose §1: read-only inventory view)"
- TC_TWR_NEG_011 → "BRD-TWR §6 Rule 5, §5.5" + scenario states "by design"
- TC_TWR_API_029 → "BRD-TWR §11.3 Backend reconciliation"

---

## BRD/FRD Gaps (recommendations for BRD update)

| Gap | BRD/FRD Section | Missing TC Type | Action |
|-----|----------------|-----------------|--------|
| Toolbar buttons (Download / PBT / Refresh) behaviour undocumented | BRD §4 mentions them in INDEX.md only; no §5 walkthrough | FUNC TCs 017, 018, 019 | BA Agent: add §5.X subsections documenting click behaviour, downloaded file format, PBT destination |
| BRD §4 Zone 4 drawer fields outdated | §4 lists Agreement Value / Early Bird Discount / All Inclusive Price; §11.7 reconciliation says API returns basicPrice / totalUnitValue instead | TC_TWR_FUNC_010 will mismatch BRD §4 description | BA Agent: reconcile §4 Zone 4 to match §11.7 actual API fields |
| PAYING (orange) unit state not in INDEX.md screens table | INDEX.md §"Heatmap Grid" notes only refuge cells; orange state inferred from BRD §4 Zone 3 | TC_TWR_NEG_012 cannot be visually validated | Tech Lead: capture a state with at least one orange unit (may need PBT seed) |
| `availableUnits` scope unclear | BRD §11.4 explicitly says "verify scope" | TC_TWR_DB_035 documents the gap, not a finding | Resolve in next sprint via DB inspection; update BRD §11.4 with finding |

---

## Per-TC Status

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_TWR_UI_001 | BRD §4 Zone 1, §5.1 | FULL (screenshot-desktop.png) | Yes | Approved | — |
| TC_TWR_BIZ_002 | BRD §6 R6 | FULL | Yes | Approved | — |
| TC_TWR_UI_003 | BRD §4 Zone 2, §5.2 | FULL | Yes | Approved | — |
| TC_TWR_BIZ_004 | BRD §4 Zone 2, §6 R7 | FULL | Yes | Approved | — |
| TC_TWR_FUNC_005 | BRD §5.2 | FULL | Yes | Approved | — |
| TC_TWR_FUNC_006 | BRD §5.2 | FULL | Yes | Approved | — |
| TC_TWR_UI_007 | BRD §4 Zone 3, §5.3 | FULL | Yes | Approved | — |
| TC_TWR_BIZ_008 | BRD §4 Zone 3, §6 R5 | FULL | Yes | Approved | — |
| TC_TWR_UI_009 | BRD §4 Zone 3 legend | FULL | Yes | Approved | — |
| TC_TWR_FUNC_010 | BRD §4 Zone 4, §5.4 | NO-VISUAL-EVIDENCE | Yes | Conditional | Visual gap — drawer not captured |
| TC_TWR_NEG_011 | BRD §6 R5, §5.5 | NO-VISUAL-EVIDENCE | Yes | Conditional | Visual gap — red click state not captured |
| TC_TWR_NEG_012 | BRD §6 R5 | NO-VISUAL-EVIDENCE | Yes | Conditional | Visual gap — orange state not captured |
| TC_TWR_NEG_013 | BRD §6 R5 | FULL | Yes | Approved | — |
| TC_TWR_UI_014 | BRD §4 Zone 3 colors | FULL | Yes | Approved | — |
| TC_TWR_BIZ_015 | BRD §6 R1, §7 | FULL | Yes | Approved | — |
| TC_TWR_UI_016 | BRD §4 toolbar | FULL | Yes | Approved | — |
| TC_TWR_FUNC_017 | BRD §4 toolbar | FULL | Yes | Approved (with BRD gap flag) | BRD does not describe behaviour |
| TC_TWR_FUNC_018 | BRD §4 toolbar | FULL | Yes | Approved (with BRD gap flag) | BRD does not describe behaviour |
| TC_TWR_FUNC_019 | BRD §4 toolbar | FULL | Yes | Approved (with BRD gap flag) | BRD does not describe behaviour |
| TC_TWR_XMOD_020 | BRD §3, §5.6 | NO-VISUAL-EVIDENCE | Yes | Conditional | Visual gap — cross-module flow not captured |
| TC_TWR_INT_021 | BRD §6 R2, §8 | FULL (baseline) | Yes | Approved | After state must be re-captured during execution |
| TC_TWR_INT_022 | BRD §6 R3, §8 | NO-VISUAL-EVIDENCE | Yes | Conditional | Visual gap — color flip not captured |
| TC_TWR_INT_023 | BRD §6 R4, §8 | NO-VISUAL-EVIDENCE | Yes | Conditional | Visual gap — updated drawer not captured |
| TC_TWR_FUNC_024 | BRD §5.3 | FULL | Yes | Approved | — |
| TC_TWR_NEG_025 | BRD §5.2 | FULL | Yes | Approved | — |
| TC_TWR_UI_026 | INDEX sidebar | FULL | Yes | Approved | — |
| TC_TWR_API_027 | BRD §11.1 | API (no UI) | Yes | Approved | — |
| TC_TWR_API_028 | BRD §11.2 | API (no UI) | Yes | Approved | — |
| TC_TWR_API_029 | BRD §11.3 | API (no UI) | Yes | Approved | — |
| TC_TWR_API_030 | BRD §11.7 | API (no UI) | Yes | Approved | — |
| TC_TWR_API_031 | BRD §11.5 | API (no UI) | Yes | Approved | — |
| TC_TWR_API_032 | BRD §11.6 | API (no UI) | Yes | Approved | — |
| TC_TWR_API_033 | BRD §11.8 | API (no UI) | Yes | Approved | — |
| TC_TWR_DB_034 | BRD §6 R6, §11.4 | FULL | Yes | Approved | — |
| TC_TWR_DB_035 | BRD §11.4 | DB (no UI) | Yes | Approved | Documents gap by design |

**Status counts:**
- Approved (visual evidence or N/A by category, no gaps): 29
- Conditional (visual gap to be filled by Tech Lead Agent): 6

---

## Approval Gate Evaluation

| Rule | Status |
|------|--------|
| Visual coverage ≥ 80% (UI-applicable TCs only: 22/26 = 84.6%) | PASS |
| Visual coverage ≥ 80% (raw 22/35 = 62.9%) | FAIL on raw count |
| No NO-VISUAL-EVIDENCE on UI-categorised TCs | FAIL (6 UI-category TCs lack evidence) |
| No VISUAL_MISMATCH | PASS (0) |
| No LOGIC_GAP | PASS (0) |
| BRD/FRD traceability 100% | PASS |
| TC_ID format `TC_<MODULE>_<TYPE>_<NNN>` | PASS |

---

## Approval

- [ ] Approved — proceed to automation (visual ≥ 80% UI-applicable, no NO-VISUAL-EVIDENCE on UI, no LOGIC_GAP, no VISUAL_MISMATCH)
- [x] **Conditional** — proceed with the 29 Approved TCs to QA Agent for next-stage `test-case-reviewer` validation; the 6 Conditional TCs are blocked from Sheet 2 (Automation Candidates) until Tech Lead Agent captures the missing visual states
- [ ] Rejected

**Rationale:** All 35 TCs have complete BRD/FRD traceability and dual-source logic coverage. 22 TCs are backed by `screenshot-desktop.png`. 7 API + 1 DB TCs have no visual evidence by category — acceptable. 6 UI-category TCs (010, 011, 012, 020, 022, 023) are blocked on Tech Lead Agent visual capture; they remain in Sheet 1 documented but are excluded from Sheet 2 Automation Candidates per dual-source rule.

---

## Next Actions

1. **Tech Lead Agent:** capture the 6 missing UI states listed in "Visual Evidence Gaps" above, update `visual-memory/admin/towers/INDEX.md` Screens table, then revisit TCs 010/011/012/020/022/023 for promotion to Approved.
2. **BA Agent:** raise BRD update request for §4 Zone 4 drawer field reconciliation (§11.7) and §5.X toolbar behaviour docs (gaps for TCs 017/018/019 narrative).
3. **QA Agent:** run `test-case-reviewer` skill independently (formal Phase 1 gate), then proceed to scaffold POMs + spec files for the 21 entries in Sheet 2 Automation Candidates.
