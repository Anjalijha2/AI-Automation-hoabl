# Test Case Review Report — Towers — Admin Portal — 2026-06-02 (re-run)

**Reviewer:** BA Agent via test-case-reviewer skill (Phase 1 re-run after FULL visual capture)
**Inputs:**
- TestCases: `manual-qa-repository/01-test-cases/admin/towers/TestCases.md` (re-generated 2026-06-02)
- BRD/FRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Towers.md`
- Visual memory: `visual-memory/admin/towers/INDEX.md` (CAPTURE_STATUS: FULL, 9 screenshots — all gaps closed)

---

## Summary

| Metric | Previous (Conditional) | This Run (Approved) |
|--------|------------------------|---------------------|
| Total TCs reviewed | 35 | **36** |
| Approved | 0 | **36** |
| Conditional | 35 | 0 |
| Requires changes | 0 | 0 |
| BRD/FRD requirement coverage | 100% | **100%** |
| Visual coverage — raw count | 62.9% (22/35) | **86.1% (31/36)** |
| Visual coverage — UI-applicable only | 84.6% (22/26) | **100% (31/31)** |
| Doc logic coverage | 100% | **100%** |
| Visual status | FULL | **FULL** |
| VISUAL_MISMATCH count | 0 | 0 |
| SELECTOR_INFERRED count | 0 | 0 |
| LOGIC_GAP count | 0 | 0 |
| BRD-vs-UI conflict count | 0 (not flagged) | **1 (BRD-TWR-GAP-001 filed)** |

---

## Verdict

**APPROVED.** Visual coverage gate cleared on both denominators (raw 86.1% ≥ 80%, UI-applicable 100%). No UI-categorised TC carries `[NO-VISUAL-EVIDENCE]`. The 5 remaining `[NO-VISUAL-EVIDENCE]` markers are on API-only TCs (031, 032, 033, 034, 035) which by category have no UI surface — acceptable.

---

## Visual Evidence Coverage Map

Every UI-applicable TC cites a real screenshot in INDEX.md Screens table:

| TC_ID | Visual Evidence | Status |
|-------|-----------------|--------|
| TC_TWR_UI_001 | screenshot-desktop.png | OK |
| TC_TWR_BIZ_002 | screenshot-desktop.png | OK |
| TC_TWR_UI_003 | screenshot-desktop.png | OK |
| TC_TWR_BIZ_004 | screenshot-desktop.png | OK |
| TC_TWR_FUNC_005 | screenshot-desktop.png | OK |
| TC_TWR_FUNC_006 | screenshot-desktop.png | OK |
| TC_TWR_UI_007 | screenshot-desktop.png | OK |
| TC_TWR_BIZ_008 | screenshot-desktop.png | OK |
| TC_TWR_UI_009 | screenshot-desktop.png | OK |
| TC_TWR_FUNC_010 | towers-unit-detail-drawer.png | OK — NEW evidence (was NO-VISUAL-EVIDENCE) |
| TC_TWR_FUNC_011 | towers-red-cell-clicked.png | OK — NEW evidence + reverses prior wrong assumption |
| TC_TWR_FUNC_012 | towers-orange-cell-clicked.png | OK — NEW evidence + reverses prior wrong assumption |
| TC_TWR_NEG_013 | screenshot-desktop.png | OK — covers click-target rule |
| TC_TWR_NEG_014 | screenshot-desktop.png | OK — covers hover rule |
| TC_TWR_NEG_015 | screenshot-desktop.png | OK — refuge cell |
| TC_TWR_BIZ_016 | screenshot-desktop.png | OK — cell-class counts |
| TC_TWR_UI_017 | screenshot-desktop.png | OK — colour map |
| TC_TWR_BIZ_018 | screenshot-desktop.png | OK |
| TC_TWR_UI_019 | screenshot-desktop.png | OK |
| TC_TWR_FUNC_020 | screenshot-desktop.png | OK |
| TC_TWR_FUNC_021 | screenshot-desktop.png | OK |
| TC_TWR_XMOD_022 | towers-config-deeplink-landing.png | OK — NEW evidence + corrects direction |
| TC_TWR_BIZ_023 | towers-config-deeplink-landing.png | OK — no per-unit toggle invariant |
| TC_TWR_FUNC_024 | towers-unit-status-before-toggle.png + towers-unit-status-after-toggle.png | OK — NEW evidence (before/after pair) |
| TC_TWR_INT_025 | towers-unit-status-before-toggle.png + towers-unit-status-after-toggle.png + screenshot-desktop.png | OK |
| TC_TWR_INT_026 | screenshot-desktop.png + towers-unit-detail-drawer.png | OK |
| TC_TWR_INT_027 | towers-unit-detail-drawer.png | OK |
| TC_TWR_FUNC_028 | screenshot-desktop.png | OK |
| TC_TWR_NEG_029 | screenshot-desktop.png | OK |
| TC_TWR_UI_030 | screenshot-desktop.png | OK |
| TC_TWR_DB_036 | screenshot-desktop.png | OK |
| TC_TWR_API_031 | [NO-VISUAL-EVIDENCE — API only] | Acceptable by category |
| TC_TWR_API_032 | [NO-VISUAL-EVIDENCE — API only] | Acceptable by category |
| TC_TWR_API_033 | [NO-VISUAL-EVIDENCE — API only] | Acceptable by category |
| TC_TWR_API_034 | [NO-VISUAL-EVIDENCE — API only] | Acceptable by category |
| TC_TWR_API_035 | [NO-VISUAL-EVIDENCE — API only] | Acceptable by category |

---

## Visual Memory Citation Audit

All cited screenshot filenames exist in `visual-memory/admin/towers/INDEX.md` Screens table:

| Filename | Cited By | In INDEX.md? |
|----------|----------|--------------|
| screenshot-desktop.png | 22 TCs | YES |
| screenshot-ui.png | 0 TCs (UI/UX baseline) | YES (declared, available for ui-ux suite) |
| towers-unit-detail-drawer.png | TC_TWR_FUNC_010, _INT_026, _INT_027 | YES |
| towers-red-cell-clicked.png | TC_TWR_FUNC_011 | YES |
| towers-orange-cell-clicked.png | TC_TWR_FUNC_012 | YES |
| towers-config-deeplink-landing.png | TC_TWR_XMOD_022, _BIZ_023 | YES |
| towers-unit-status-before-toggle.png | TC_TWR_FUNC_024, _INT_025 | YES |
| towers-unit-status-after-toggle.png | TC_TWR_FUNC_024, _INT_025 | YES |

**VISUAL_MISMATCH:** 0 (every cited filename is real and present in INDEX.md).

---

## Logic Gaps

**None detected.** Every TC Scenario references a BRD/FRD section, rule, or purpose statement, OR an INDEX.md correction with explicit citation. Examples:

- TC_TWR_FUNC_010 → "BRD-TWR §4 Zone 4, §5.4" + INDEX.md §"Unit-detail side panel"
- TC_TWR_FUNC_011 → "BRD-TWR §4 Zone 4 + §11.7 reconciliation" + flag BRD-TWR-GAP-001 (BRD §5.5 conflict)
- TC_TWR_XMOD_022 → "BRD-TWR §3, §5.6 + INDEX.md §"Config Page" (deep-link direction REVERSED per correction #3)"
- TC_TWR_BIZ_023 → INDEX.md §"Important: Unit-level status toggle is NOT exposed in UAT"
- TC_TWR_FUNC_024 → "BRD-TWR §6 Rule 2 + INDEX.md §"Tower Active/Inactive switch""

---

## BRD/FRD Conflicts Detected (NEW — must be filed with BA Agent)

Re-run surfaced 1 real BRD-vs-UI conflict the original Conditional run missed because of insufficient visual evidence:

### BRD-TWR-GAP-001 — Booked + Hold cells DO open the unit-detail panel

| Source | Claim |
|--------|-------|
| BRD §5.5 | "Clicking a red (sold) unit does not open any panel… by design — sold units have no actionable information." |
| BRD §6 Rule 5 | "Only white (Available) units open the detail panel on click — all other colors do nothing." |
| INDEX.md §"Cell status taxonomy" + screenshots `towers-red-cell-clicked.png`, `towers-orange-cell-clicked.png` | Booked and hold cells DO open `div.more-details-allocation` with customer block + pricing breakdown. Verified live 2026-06-02. |

**Resolution path:** BA Agent must update BRD §5.5 and §6 Rule 5 to reflect actual behaviour — booked and hold cells open the panel WITH customer info; only reserved (grey) and refuge cells do not. TCs 011, 012 already test the corrected behaviour; TCs 015 (refuge no-panel) and the implicit reserved no-panel cover the remaining cases.

### BRD-TWR-GAP-002 — Toolbar button behaviour undocumented

BRD §5 silent on Download unit registrations, Pre-Booked Payments, and Refresh button behaviour. INDEX.md captures the buttons; behaviour TCs (020, 021) generated and approved with flag.

### BRD-TWR-GAP-003 — Drawer field labels in BRD §4 Zone 4 outdated vs §11.7 reconciliation vs INDEX.md observed labels

BRD §4 Zone 4 lists: Unit Number / BHK Type / Size / Agreement Value / Early Bird Discount / All Inclusive Price.
INDEX.md observed: Unit No. / BHK / Size / Agreement Value / Final AV / Stamp Duty / GST / Registration Charges / *All inclusive (total) + customer block (booked/hold only).
BRD §11.7 API audit: actual API fields are `basicPrice` / `totalUnitValue`. BA Agent must reconcile §4 Zone 4 with §11.7 and INDEX.md.

### BRD-TWR-GAP-004 — "Pre-Booked Payments" destination undocumented

Button visible in INDEX.md; no BRD §5 walkthrough exists.

---

## Per-TC Status

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Notes |
|-------|--------|-----------------|----------------|--------|-------|
| TC_TWR_UI_001 | BRD §4 Zone 1, §5.1 | FULL | Yes | Approved | — |
| TC_TWR_BIZ_002 | BRD §6 R6 | FULL | Yes | Approved | — |
| TC_TWR_UI_003 | BRD §4 Zone 2, §5.2 | FULL | Yes | Approved | — |
| TC_TWR_BIZ_004 | BRD §4 Zone 2, §6 R7 | FULL | Yes | Approved | — |
| TC_TWR_FUNC_005 | BRD §5.2 | FULL | Yes | Approved | — |
| TC_TWR_FUNC_006 | BRD §5.2 | FULL | Yes | Approved | — |
| TC_TWR_UI_007 | BRD §4 Zone 3, §5.3 | FULL | Yes | Approved | — |
| TC_TWR_BIZ_008 | BRD §4 Zone 3, §6 R5 | FULL | Yes | Approved | Refuge count = 6 (Crest) asserted |
| TC_TWR_UI_009 | BRD §4 Zone 3 legend | FULL | Yes | Approved | — |
| TC_TWR_FUNC_010 | BRD §4 Zone 4, §5.4 | FULL | Yes | **Approved** | Was Conditional — now backed by `towers-unit-detail-drawer.png` |
| TC_TWR_FUNC_011 | BRD §4 Zone 4 + §11.7 | FULL | Yes | **Approved** | Was NEG_011 (wrong assumption). NEW positive flow. Filed BRD-TWR-GAP-001 |
| TC_TWR_FUNC_012 | BRD §4 Zone 4 + §11.7 | FULL | Yes | **Approved** | Was NEG_012. NEW positive flow. Filed BRD-TWR-GAP-001 |
| TC_TWR_NEG_013 | BRD §6 R5 + INDEX correction #1 | FULL | Yes | **Approved** | NEW — explicit `.unit-number` vs `.unit-size-item` rule |
| TC_TWR_NEG_014 | BRD §6 R5 + INDEX correction #4 | FULL | Yes | **Approved** | NEW — explicit no-hover-tooltip rule |
| TC_TWR_NEG_015 | BRD §6 R5 + INDEX §"Cell status taxonomy" | FULL | Yes | **Approved** | NEW — refuge cell explicit |
| TC_TWR_BIZ_016 | BRD §4 Zone 3 + INDEX §"Cell status taxonomy" | FULL | Yes | **Approved** | NEW — class-count taxonomy assertion |
| TC_TWR_UI_017 | BRD §4 Zone 3 + INDEX | FULL | Yes | Approved | Was 014; renumbered. Computed-colour assertion |
| TC_TWR_BIZ_018 | BRD §6 R1, §7 | FULL | Yes | Approved | — |
| TC_TWR_UI_019 | BRD §4 toolbar | FULL | Yes | Approved | — |
| TC_TWR_FUNC_020 | BRD §4 toolbar | FULL | Yes | Approved (with BRD-TWR-GAP-002) | Download trigger |
| TC_TWR_FUNC_021 | BRD §4 toolbar | FULL | Yes | Approved (with BRD-TWR-GAP-002) | Refresh icon |
| TC_TWR_XMOD_022 | BRD §3, §5.6 + INDEX correction #3 | FULL | Yes | **Approved** | Was XMOD_020 with wrong direction. NOW backed by `towers-config-deeplink-landing.png` |
| TC_TWR_BIZ_023 | INDEX §"Important: Unit-level status toggle is NOT exposed" | FULL | Yes | **Approved** | NEW — no-per-unit-toggle invariant |
| TC_TWR_FUNC_024 | BRD §6 R2 + INDEX §"Tower Active/Inactive switch" | FULL (before+after) | Yes | **Approved** | NEW — tower-level toggle, no confirmation dialog. Before+after screenshots |
| TC_TWR_INT_025 | BRD §6 R2, §8 | FULL | Yes | **Approved** | Was INT_021. Full before+after evidence + cleanup |
| TC_TWR_INT_026 | BRD §6 R3, §8 | FULL | Yes | **Approved** | Was INT_022. Re-scoped to file-upload + cell-class assertion |
| TC_TWR_INT_027 | BRD §6 R4, §8 + §11.7 | FULL | Yes | **Approved** | Was INT_023. Uses panel screenshot. Asserts against `basicPrice`/`totalUnitValue` per §11.7 |
| TC_TWR_FUNC_028 | BRD §5.3 | FULL | Yes | Approved | — |
| TC_TWR_NEG_029 | BRD §5.2 | FULL | Yes | Approved | — |
| TC_TWR_UI_030 | INDEX sidebar | FULL | Yes | Approved | — |
| TC_TWR_API_031 | BRD §11.1 | API only (no UI by category) | Yes | Approved | — |
| TC_TWR_API_032 | BRD §11.2 | API only | Yes | Approved | — |
| TC_TWR_API_033 | BRD §11.3 | API only | Yes | Approved | — |
| TC_TWR_API_034 | BRD §11.7 | API only | Yes | Approved | — |
| TC_TWR_API_035 | BRD §11.5 + §11.6 | API only | Yes | Approved | Consolidated WS broadcast + idempotent-toggle audit-log |
| TC_TWR_DB_036 | BRD §6 R6, §11.4 | FULL | Yes | Approved | — |

**Status counts:**
- Approved: **36** (all UI-applicable backed by real screenshots; all API-only acceptable by category)
- Conditional: 0
- Rejected: 0

---

## Approval Gate Evaluation

| Rule | Status |
|------|--------|
| Visual coverage ≥ 80% — UI-applicable TCs (31/31 = 100%) | **PASS** |
| Visual coverage ≥ 80% — raw (31/36 = 86.1%) | **PASS** |
| No NO-VISUAL-EVIDENCE on UI-categorised TCs (0 of 31) | **PASS** |
| No VISUAL_MISMATCH | PASS (0) |
| No LOGIC_GAP | PASS (0) |
| No SELECTOR_INFERRED | PASS (0 — all selectors from INDEX.md) |
| BRD/FRD traceability — 100% | PASS |
| TC_ID format `TC_<MODULE>_<TYPE>_<NNN>` | PASS |
| BRD-vs-UI conflicts surfaced and filed | PASS (1 conflict filed as BRD-TWR-GAP-001; 3 other gaps filed 002–004) |

---

## Approval

- [x] **Approved — proceed to automation**
- [ ] Conditional
- [ ] Rejected

**Rationale:** All 36 TCs are backed by either a real visual evidence screenshot (31 UI-applicable) or are API-only by category (5). All selectors are drawn from INDEX.md Key Structural Notes — no inference. The 7 visual-capture corrections (click target, no per-unit toggle, reversed deep-link, no hover tooltip, immediate toggle, panel container `div.more-details-allocation`, full cell-status class taxonomy) are reflected in every relevant TC. One real BRD-vs-UI conflict (BRD-TWR-GAP-001 — booked + hold cells DO open the panel, contradicting BRD §5.5 / §6 Rule 5) surfaced and is filed for BA Agent BRD update.

---

## Next Actions

1. **BA Agent (this agent) — post-approval:** File BRD update requests for BRD-TWR-GAP-001 (§5.5, §6 Rule 5 reverse on booked/hold), BRD-TWR-GAP-002 (§5.X toolbar behaviour docs), BRD-TWR-GAP-003 (§4 Zone 4 drawer field reconciliation with §11.7 and INDEX.md observed labels), BRD-TWR-GAP-004 (Pre-Booked Payments destination).
2. **QA Agent:** Re-run `test-case-reviewer` skill independently (formal Phase 1 gate) using the new TestCases.md, then scaffold POMs + 6-test-type spec files for the 31 entries in Sheet 2 Automation Candidates. Use the Selector Reference block in `test-data-spec.md` to author POMs.
3. **Tech Lead Agent:** Add the locator suggestions from INDEX.md §"Locator-map suggestions" to `locators/admin/locator-map.json` under a `towers` module key and a new `config` module key (or `towers.config` sub-key).
4. **QA Agent:** When implementing TC_TWR_FUNC_024 + TC_TWR_INT_025, include the cleanup revert-toggle step on Tower 14 - Horizon to preserve UAT baseline.
