# Doc Change Summary — Admin / Towers — 2026-06-02 (re-run)

**BA Agent** · DEFAULT QA FLOW Phase 1 re-run after FULL visual capture closure
**Trigger:** Visual gap closure — `visual-memory/admin/towers/INDEX.md` upgraded from "Conditional 84.6% UI-applicable" to FULL (9 screenshots, all 6 prior visual gaps filled)

---

## Dual-Source Gate Confirmation

| Source | Path | Status |
|--------|------|--------|
| Visual memory INDEX.md | `visual-memory/admin/towers/INDEX.md` | **PRESENT** — CAPTURE_STATUS: FULL (was FULL but with 6 visual-gap flags; now all gaps closed with 6 new screenshots) |
| BRD/FRD | `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Towers.md` | **PRESENT** — §1–§11 unchanged from previous run |

Dual-source confirmation: **YES** — both sources present, both consulted.

---

## Modules Changed in This Run

| Portal | Module | Change Type | Visual Memory Status | BRD/FRD Updated? | Dual-Source Confirmation |
|--------|--------|-------------|----------------------|-------------------|---------------------------|
| admin | towers | TC re-generation after visual-gap closure | YES (FULL) | NO (re-uses existing) — 4 BRD gaps FILED for follow-up | YES |

---

## What Changed — Test Cases

### Counts

| Metric | Previous run | This run | Delta |
|--------|--------------|----------|-------|
| Total TCs | 35 | 36 | +1 |
| Approved | 0 | 36 | +36 |
| Conditional | 35 | 0 | −35 |
| Visual coverage (raw) | 62.9% | 86.1% | +23.2 pts |
| Visual coverage (UI-applicable) | 84.6% | 100% | +15.4 pts |
| BRD-vs-UI conflicts surfaced | 0 | 1 (BRD-TWR-GAP-001) + 3 supporting gaps | +4 |
| Verdict | Conditional | **Approved** | — |

### TCs replaced or re-scoped (per 7 visual-capture corrections)

| Old TC | New TC | Reason | Correction # |
|--------|--------|--------|-------------|
| TC_TWR_NEG_011 (assumed red click → no panel) | TC_TWR_FUNC_011 (verified red click → panel WITH customer block) | Visual capture proves BRD §5.5 is wrong on this point | #7 |
| TC_TWR_NEG_012 (assumed orange click → no panel) | TC_TWR_FUNC_012 (verified orange click → panel WITH customer block) | Visual capture proves BRD §6 Rule 5 is wrong on this point | #7 |
| TC_TWR_XMOD_020 (link on Towers → Config) | TC_TWR_XMOD_022 (link on Config → Towers, REVERSED) | Visual capture proves link lives on `/admin/cms` | #3 |
| TC_TWR_INT_022 (per-unit status toggle) | TC_TWR_INT_026 (Config Unit Status upload file flow + cell-class assertion) | No per-unit toggle exists in UAT — toggle granularity is tower-level only | #2 |
| (none — was missing) | TC_TWR_FUNC_024 (tower-level `.ant-switch` flip, immediate, no dialog) | Captures the actual write-control on `/admin/cms` | #2, #5 |
| (none — was missing) | TC_TWR_NEG_013 (inner `.unit-number` click does NOT open panel) | Distinguishes wrapper-onClick from inner-click | #1 |
| (none — was missing) | TC_TWR_NEG_014 (no hover tooltip) | Verifies absence of `.ant-tooltip` / `.ant-popover` | #4 |
| (none — was missing) | TC_TWR_NEG_015 (refuge click → no panel) | Explicit refuge-cell negative | #7 |
| (none — was missing) | TC_TWR_BIZ_016 (cell-class counts ↔ inline stats) | New taxonomy assertion | #7 |
| (none — was missing) | TC_TWR_BIZ_023 (no per-unit toggle invariant) | Documents the absence as a rule | #2 |

### TCs unchanged but re-verified

22 TCs that previously cited only `screenshot-desktop.png` remain unchanged — their evidence is still valid in the upgraded INDEX.md.

### Selectors changed in step text (applied across all relevant TCs)

| Old phrasing | New phrasing | Reason |
|--------------|--------------|--------|
| "click unit cell" / "click white unit" | "click `.unit-size-item.available`" (or `.booked`, `.hold`, etc.) | Correction #1 — React handler on wrapper |
| "drawer opens" / "ant-drawer slides in" | "`div.more-details-allocation` renders" | Correction #6 — not an ant-drawer |
| "View Tower link on Towers page" | "View Tower link on `/admin/cms` Config page" | Correction #3 — direction reversed |
| "unit status toggle" | "tower-level `.ant-switch` on `/admin/cms`" or "Config Unit Status upload (file flow)" | Correction #2 — no per-unit toggle |
| "confirm dialog on toggle" | "no confirmation dialog — state change is immediate" | Correction #5 |

---

## BRD/FRD Gaps Filed (for BA Agent BRD update task — separate ticket, NOT applied in this run)

| Gap ID | Section | Issue | Resolution |
|--------|---------|-------|------------|
| BRD-TWR-GAP-001 | §5.5, §6 Rule 5 | BRD claims booked/hold cells do NOT open a panel — UI proves they DO, with customer block | Update BRD §5.5: only reserved (grey) and refuge cells produce no panel. Booked + hold cells DO open the panel with owner data + pricing. |
| BRD-TWR-GAP-002 | §5 (silent) | No walkthrough for toolbar buttons (Download / Pre-Booked Payments / Refresh) | Add §5.X subsections describing click behaviour, file format, and PBT destination |
| BRD-TWR-GAP-003 | §4 Zone 4 (drawer fields) | BRD lists 6 fields; INDEX.md observes 9 labels including Final AV / Stamp Duty / GST / Registration Charges; §11.7 confirms API fields are `basicPrice` / `totalUnitValue` | Reconcile §4 Zone 4 labels with INDEX.md observed labels AND with §11.7 API field names |
| BRD-TWR-GAP-004 | §4 toolbar | "Pre-Booked Payments" destination undocumented | Add destination + behaviour to §5.X toolbar subsection |

Note: BRD updates are NOT applied in this run. They are filed as pending tasks. This run only updates the Towers TC artefacts.

---

## Visual Memory Status (per CLAUDE.md sync pipeline format)

| Portal | Module | Visual Memory Status |
|--------|--------|----------------------|
| admin | towers | **YES (FULL)** — `visual-memory/admin/towers/INDEX.md` present, CAPTURE_STATUS: FULL, 9 screenshots all referenced by at least one TC |

---

## Output Artefacts (Phase 1 re-run — all OVERWRITTEN per task instructions)

| File | Status | Path |
|------|--------|------|
| TestCases.md | **OVERWRITTEN** | `manual-qa-repository/01-test-cases/admin/towers/TestCases.md` |
| test-data-spec.md | **OVERWRITTEN** | `manual-qa-repository/01-test-cases/admin/towers/test-data-spec.md` |
| review-report.md | **OVERWRITTEN** | `manual-qa-repository/01-test-cases/admin/towers/review-report.md` |
| doc-change-summary.md | **OVERWRITTEN** | `manual-qa-repository/01-test-cases/admin/towers/doc-change-summary.md` (this file) |

---

## Handoff

- **To QA Agent:** All 36 TCs Approved. Sheet 2 Automation Candidates lists 31 entries — proceed to POM scaffolding for `automation-repository/pages/admin/TowersPage.js` and 6-test-type spec files. Use the Selector Reference block in `test-data-spec.md`. Re-run `test-case-reviewer` independently as the formal Phase 1 gate before generating specs.
- **To Tech Lead Agent:** Add the locator suggestions from INDEX.md §"Locator-map suggestions" to `locators/admin/locator-map.json` (new `towers` module key + new `config` module key or `towers.config` sub-key). The 6 new screenshot filenames are already referenced from TCs and need no further capture.
- **To BA Agent (follow-up task — separate ticket):** Open 4 BRD update requests against `ADMIN-BRD-Towers.md` for BRD-TWR-GAP-001 through 004.

---

**Phase 1 status:** **APPROVED** (lift from Conditional → Approved achieved)
