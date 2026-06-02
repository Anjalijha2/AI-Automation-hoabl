# Doc Change Summary — Towers — Admin Portal

**Generated:** 2026-06-02
**Phase:** Default QA Flow — Phase 1 (BA Agent)
**Portal:** Admin
**Module:** Towers

---

## Dual-Source Confirmation

| Source | Path | Present | Status |
|--------|------|---------|--------|
| Visual memory INDEX.md | `visual-memory/admin/towers/INDEX.md` | YES | **FULL** (captured 2026-06-01, 1920×900) |
| BRD/FRD section | `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Towers.md` | YES | Complete — sections §1 through §11 |

**Dual-source gate: PASSED.** Both sources consulted before TC generation. No assumption-based TCs.

---

## Sources Consulted

### From Visual Memory (drives Steps + Expected Results + Visual Evidence)
- Screens table → screenshot filenames cited as evidence (`screenshot-desktop.png`)
- Key Structural Notes → all CSS selectors, element types, heading text, tower names, floor range, REFUGE positions, legend strip text, toolbar button classes
- Sidebar Navigation note → `ant-menu-item-selected` selector
- API/Network notes → informed inference handling for color-encoded states

### From BRD/FRD (drives Scenario + Business Rules + Requirement IDs)
- §1 Purpose: read-only inventory view
- §2 User roles: Admin / Sales Manager Admin
- §3 Access path + cross-module Config deep link
- §4 Zone 1–4 screen layout: KPIs, sidebar, grid, drawer
- §5.1–§5.6 Feature walkthroughs: KPI viewing, tower browsing, unit availability, pricing detail, sold unit no-op, Config deep link
- §6 Business rules R1–R7
- §7 Validations: none (read-only)
- §8 Dependencies: Config, Allocation, Offers
- §9 User journey map
- §11.1–§11.8 Backend gap reconciliation → 7 API TCs and 1 DB TC

---

## What Changed (this generation cycle)

This is **initial TC generation for the Towers module** under the new dual-source pipeline. No prior `TestCases.md` existed in `manual-qa-repository/01-test-cases/admin/towers/` before this run.

| Artefact | State Before | State After |
|----------|--------------|-------------|
| `manual-qa-repository/01-test-cases/admin/towers/TestCases.md` | Did not exist | Created — 35 TCs (Sheet 1) + 21 automation candidates (Sheet 2) + Bug template (Sheet 3) |
| `manual-qa-repository/01-test-cases/admin/towers/test-data-spec.md` | Did not exist | Created — valid inputs (dataset baseline), invalid/boundary list, preconditions, cleanup |
| `manual-qa-repository/01-test-cases/admin/towers/review-report.md` | Did not exist | Created — Conditional approval; 29 Approved, 6 Conditional (visual gaps), 0 LOGIC_GAP, 0 VISUAL_MISMATCH |
| `manual-qa-repository/01-test-cases/admin/towers/doc-change-summary.md` | Did not exist | Created (this file) |
| BRD/FRD source | `ADMIN-BRD-Towers.md` (no change) | No change — BA Agent did NOT modify the BRD this cycle. Update recommendations recorded under "BRD Update Requests" below. |
| Visual memory INDEX.md | `FULL` — captured 2026-06-01 | No change — only consumed |

---

## BRD Update Requests (for next BA Agent docs cycle)

The following gaps were detected during TC generation and should be addressed in the next BRD update sprint. No changes were made to the BRD in this cycle.

1. **BRD §4 Zone 4 drawer fields are outdated.** §4 lists `Agreement Value / Early Bird Discount / All Inclusive Price`, but §11.7 reconciliation reports the API actually returns `basicPrice / totalUnitValue` (and NOT `agreementValue / earlyBirdBenefit`). Update §4 Zone 4 table to match the real response shape from §11.7.
2. **Toolbar buttons (Download unit registrations / Pre-Booked Payments / Refresh) lack §5 walkthrough.** Visible in INDEX.md and BRD §4 toolbar mention, but no §5.X subsection describes click behaviour, downloaded file format/name, or PBT view destination. Add §5.7, §5.8, §5.9.
3. **§11.4 `availableUnits` scope is explicitly marked unresolved.** TC_TWR_DB_035 documents the gap. Resolve via DB inspection and amend §11.4 with the confirmed status combination.

---

## Visual Memory Status (per module)

| Module | Capture Status | Coverage of TCs | Action Needed |
|--------|---------------|-----------------|---------------|
| admin/towers | **FULL** | 22 of 35 TCs cite a screenshot (84.6% of UI-applicable TCs) | Tech Lead Agent must capture 6 additional UI states to clear all Conditional TCs: drawer open (010), red click (011), orange click (012), Config deep-link (020), unit-status flip before/after (022), drawer with updated price (023) |

---

## Outputs Handed Off

| Output | Path | Consumer |
|--------|------|----------|
| TestCases.md | `manual-qa-repository/01-test-cases/admin/towers/TestCases.md` | Tech Lead Agent (locator map confirmation), QA Agent (next-stage review + scaffolding) |
| test-data-spec.md | `manual-qa-repository/01-test-cases/admin/towers/test-data-spec.md` | QA Agent (fixture + DB seed planning) |
| review-report.md | `manual-qa-repository/01-test-cases/admin/towers/review-report.md` | QA Agent (gate decision input) |
| doc-change-summary.md | `manual-qa-repository/01-test-cases/admin/towers/doc-change-summary.md` (this file) | QA Agent (sync pipeline Step 2 → Step 3 handoff) |

---

## Approval Status

**Conditional.** 29 of 35 TCs are Approved; 6 are Conditional pending Tech Lead Agent visual capture of the listed missing UI states. No LOGIC_GAP, no VISUAL_MISMATCH, no SELECTOR_INFERRED. BRD/FRD traceability 100%. Visual coverage on UI-applicable TCs = 84.6% (clears 80% threshold for that slice); raw coverage = 62.9% due to API/DB TCs which have no visual evidence by category.

The 21 entries in Sheet 2 (Automation Candidates) can proceed to QA Agent for scaffolding. The 6 Conditional TCs remain in Sheet 1 documented but are excluded from Sheet 2 until visual evidence is added.
