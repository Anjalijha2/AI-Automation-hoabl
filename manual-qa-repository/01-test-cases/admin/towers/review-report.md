# Test Case Review Report — Towers — Admin — 2026-06-06

**Reviewer:** QA Agent via `test-case-reviewer` skill
**TestCases source:** `manual-qa-repository/01-test-cases/admin/towers/TestCases.md`
**BRD source:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Towers.md`
**Visual memory source:** `visual-memory/admin/towers/INDEX.md` (CAPTURE_STATUS: FULL, 8 screens)

---

## Summary

| Metric | Value |
|--------|-------|
| Total TCs reviewed | 36 |
| Approved | 31 (all UI-applicable) |
| Requires Changes | 5 (NO-VISUAL-EVIDENCE — API-only by category) |
| BRD/FRD coverage | 100% — every TC carries a BRD § Req ID |
| Visual coverage | 86.1% raw (31/36); 100% for UI-applicable TCs (31/31) |
| Doc logic coverage | 100% — every Scenario references a BRD § or INDEX.md correction |
| Visual status | FULL |

---

## Visual Evidence Gaps

| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_TWR_API_031 | projectId scoping at HTTP layer (BRD §11.1) | [NO-VISUAL-EVIDENCE — API only] | none | Acceptable — API-only by category; excluded from Sheet 2 |
| TC_TWR_API_032 | `getAllTowers` isActive filter via GET body (§11.2) | [NO-VISUAL-EVIDENCE — API only] | none | Acceptable — API-only; excluded |
| TC_TWR_API_033 | `disabledUnits` KPI counts RESERVED only (§11.3) | [NO-VISUAL-EVIDENCE — API only] | none | Acceptable — API-only; excluded |
| TC_TWR_API_034 | `getUnitsByTowerId` response shape (§11.7) | [NO-VISUAL-EVIDENCE — API only] | none | Acceptable — API-only; excluded |
| TC_TWR_API_035 | `updateTowerStatus` fires Python `/broadcast-towers` + no-op audit skip (§11.5–§11.6) | [NO-VISUAL-EVIDENCE — API only] | none | Acceptable — API-only; excluded |

**VISUAL_MISMATCH check:** all 31 UI-applicable TCs cite filenames present in INDEX.md Screens table. Zero VISUAL_MISMATCH.

INDEX.md Screens (authoritative, 8 entries): `screenshot-desktop.png`, `screenshot-ui.png`, `towers-unit-detail-drawer.png`, `towers-red-cell-clicked.png`, `towers-orange-cell-clicked.png`, `towers-config-deeplink-landing.png`, `towers-unit-status-before-toggle.png`, `towers-unit-status-after-toggle.png` — all cited by ≥1 TC.

---

## Logic Gaps

| TC_ID | Scenario Text | Missing Context | Action |
|-------|--------------|-----------------|--------|

None. Every TC Scenario references a BRD § (§1, §3, §4 Zones 1–4, §5.1–§5.6, §6 Rules 1–7, §7, §8, §11.1–§11.7) or a documented INDEX.md correction note. No purely mechanical TCs.

---

## BRD/FRD Gaps

Documented in TestCases.md "BRD/FRD gaps for BA Agent to file" — these are issues with the BRD, not with the TCs:

- **BRD-TWR-GAP-001:** BRD §5.5 + §6 Rule 5 say "clicking a sold/orange unit does not open any panel" — visual capture proves this FALSE for `.booked` and `.hold` cells. TCs 011 + 012 already test the correct (observed) behaviour.
- **BRD-TWR-GAP-002:** BRD §5 silent on toolbar button behaviour (Download / Pre-Booked Payments / Refresh). TCs 020/021 cover. Documents the gap rather than fails review.
- **BRD-TWR-GAP-003:** BRD §4 Zone 4 drawer field names outdated vs §11.7 API fields. TC 027 asserts against API fields.
- **BRD-TWR-GAP-004:** Pre-Booked Payments button destination undocumented — no TC yet (filed as a gap).

These are BRD/source documentation gaps to be filed by BA Agent post-approval — not TC review failures.

---

## Per-TC Status

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_TWR_UI_001 | §4 Zone 1 + §5.1 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_BIZ_002 | §6 R6 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_UI_003 | §4 Zone 2 + §5.2 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_BIZ_004 | §4 Zone 2 + §6 R7 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_FUNC_005 | §5.2 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_FUNC_006 | §5.2 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_UI_007 | §4 Zone 3 + §5.3 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_BIZ_008 | §4 Zone 3 + §6 R5 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_UI_009 | §4 Zone 3 legend | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_FUNC_010 | §4 Zone 4 + §5.4 | towers-unit-detail-drawer.png | FULL | Approved | — |
| TC_TWR_FUNC_011 | §4 Zone 4 + §11.7 | towers-red-cell-clicked.png | FULL | Approved | Flags BRD-TWR-GAP-001 |
| TC_TWR_FUNC_012 | §4 Zone 4 + §11.7 | towers-orange-cell-clicked.png | FULL | Approved | Flags BRD-TWR-GAP-001 |
| TC_TWR_NEG_013 | §6 R5 + INDEX.md | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_NEG_014 | §6 R5 + INDEX.md | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_NEG_015 | §6 R5 + INDEX.md | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_BIZ_016 | §4 Zone 3 + INDEX.md | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_UI_017 | §4 Zone 3 + INDEX.md | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_BIZ_018 | §6 R1 + §7 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_UI_019 | §4 toolbar | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_FUNC_020 | §4 toolbar + GAP-002 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_FUNC_021 | §4 toolbar + GAP-002 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_XMOD_022 | §3 + §5.6 + INDEX.md correction | towers-config-deeplink-landing.png | FULL | Approved | — |
| TC_TWR_BIZ_023 | INDEX.md correction | towers-config-deeplink-landing.png | FULL | Approved | — |
| TC_TWR_FUNC_024 | §6 R2 + INDEX.md | towers-unit-status-before-toggle.png + towers-unit-status-after-toggle.png | FULL | Approved | — |
| TC_TWR_INT_025 | §6 R2 + §8 | towers-unit-status-before/after-toggle.png + screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_INT_026 | §6 R3 + §8 | screenshot-desktop.png + towers-unit-detail-drawer.png | FULL | Approved | — |
| TC_TWR_INT_027 | §6 R4 + §8 + §11.7 | towers-unit-detail-drawer.png | FULL | Approved | — |
| TC_TWR_FUNC_028 | §5.3 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_NEG_029 | §5.2 | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_UI_030 | INDEX.md Sidebar | screenshot-desktop.png | FULL | Approved | — |
| TC_TWR_API_031 | §11.1 | [NO-VISUAL-EVIDENCE — API only] | FULL (BRD-grounded) | Requires Changes | NO-VISUAL flag — API-only category |
| TC_TWR_API_032 | §11.2 | [NO-VISUAL-EVIDENCE — API only] | FULL | Requires Changes | NO-VISUAL flag — API-only category |
| TC_TWR_API_033 | §11.3 | [NO-VISUAL-EVIDENCE — API only] | FULL | Requires Changes | NO-VISUAL flag — API-only category |
| TC_TWR_API_034 | §11.7 | [NO-VISUAL-EVIDENCE — API only] | FULL | Requires Changes | NO-VISUAL flag — API-only category |
| TC_TWR_API_035 | §11.5 + §11.6 | [NO-VISUAL-EVIDENCE — API only] | FULL | Requires Changes | NO-VISUAL flag — API-only category |
| TC_TWR_DB_036 | §6 R6 + §11.4 | screenshot-desktop.png | FULL | Approved | — |

---

## Approval

- [ ] Approved — proceed to automation
- [x] **Conditional — fix gaps before proceeding** — 5 API TCs (TC_TWR_API_031–_035) carry `[NO-VISUAL-EVIDENCE — API only]`. These are intentional API/category-only classifications and already excluded from Sheet 2.
- [ ] Rejected

**Rationale:** Per skill Approval Gate Rules — "any NO-VISUAL-EVIDENCE present → Conditional (cannot be Approved)". 31/36 TCs are Approved with 100% visual coverage on UI-applicable scope. The 5 API TCs are correctly excluded from Sheet 2 and run as part of `tests/api/towers.api.spec.js` only.

**Blocking issues:** 5 NO-VISUAL-EVIDENCE API TCs — intentional API-only category, no remediation required.

**Action items:**
1. Proceed with automation for the 31 Approved TCs (UI / FUNC / BIZ / NEG / XMOD / INT / DB).
2. 5 API TCs → `tests/api/towers.api.spec.js`.
3. BA Agent: file BRD-TWR-GAP-001 through -004 against BRD/FRD source for correction.
