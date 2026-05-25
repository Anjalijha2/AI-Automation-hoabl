# BA Sign-Off — Sync Pipeline Step 2

**Date:** 2026-05-21
**Step:** 2 of 4 (BA Agent — BRD/FRD coverage cross-reference)
**Upstream:** Tech Lead Agent Step 1 (locator-map v1.3.4 → v1.4.0, change-manifest.json, handoff-note.md)
**Downstream:** QA Agent Step 3 (Manual) — cleared to proceed

---

## 1. Sign-Off Decision

**STATUS: SIGNED OFF — proceed to Step 3 (QA Agent Manual)**

8 of 9 flagged modules have full BRD + FRD + FS coverage. 1 module (`milestone`) has partial coverage only — documented as a minor gap, does NOT block the pipeline. Verified locator corrections for `customers` and `login` are fully covered by existing BRD/FRD with no drift.

---

## 2. Verified Locator Changes (no BRD drift)

| Module | Change | BRD/FRD Reference | Drift? |
|--------|--------|-------------------|--------|
| `customers.colHomeLoan` | Header text "Home Loan" → "Home Loan Details" | `ADMIN-BRD-Customers.md`, `ADMIN-FRD-Customers.md`, `ADMIN-FS-Customers.md` | No — label change is implementation-level; BRD speaks of "home-loan details" semantically |
| `customers.colConfirmationNumber` | Header text "Confirmation Number" → "Confirmation" | `ADMIN-BRD-Customers.md`, `ADMIN-FRD-Customers.md` | No — same column, label shortened |
| `customers.tableRecordsHeading` | Selector strengthened to `h3.table-title` | `ADMIN-FS-Customers.md` (table rendering spec) | No — selector hardening only |
| `login` (12 locators verified) | No change | `ADMIN-BRD-Login.md`, `ADMIN-FRD-Login.md`, `ADMIN-FS-Login.md` | No |

**No BRD/FRD updates required for already-mapped modules.** No `doc-change-summary.md` deltas to publish for Step 3 beyond this sign-off.

---

## 3. Covered Modules (9 flagged — BRD/FRD lookup)

| # | Module (source) | BRD | FRD | FS | Workflow | Coverage |
|---|----------------|-----|-----|----|---|----------|
| 1 | `cms` (Cms.jsx) | `ADMIN-BRD-Config-CMS.md` | `ADMIN-FRD-Config-CMS.md` | `ADMIN-FS-Config-CMS.md` | — | FULL |
| 2 | `tower` (Towers.jsx, towerView.jsx, TowerHeatmap.jsx) | `ADMIN-BRD-Towers.md` | `ADMIN-FRD-Towers.md` | `ADMIN-FS-Towers.md` | — | FULL |
| 3 | `jbp` (JbpManagement.jsx) | `ADMIN-BRD-JBP-Management.md` | `ADMIN-FRD-JBP-Management.md` | `ADMIN-FS-JBP-Management.md` | — | FULL |
| 4 | `offers` (routes/.../offers/, components/admin/offers/) | `ADMIN-BRD-Offers.md` | `ADMIN-FRD-Offers.md` | `ADMIN-FS-Offers.md` | — | FULL |
| 5 | `payment-transactions` (PaymentTransactionsTable.jsx) | `ADMIN-BRD-Payment-Transactions.md` | `ADMIN-FRD-Payment-Transactions.md` | `ADMIN-FS-Payment-Transactions.md` | `ADMIN-WF-Payment.md` | FULL + workflow |
| 6 | `sales-managers` (components/admin/sales-managers/) | `ADMIN-BRD-Sales-Managers.md` | `ADMIN-FRD-Sales-Managers.md` | `ADMIN-FS-Sales-Managers.md` | — | FULL |
| 7 | `allocation` (components/admin/allocation/) | `ADMIN-BRD-Allocation.md` | `ADMIN-FRD-Allocation.md` | `ADMIN-FS-Allocation.md` | `ADMIN-WF-Allocation.md` | FULL + workflow |
| 8 | `channel-partners` (components/admin/channel-partners/) | `ADMIN-BRD-Channel-Partners.md` | `ADMIN-FRD-Channel-Partners.md` | `ADMIN-FS-Channel-Partners.md` | — | FULL |
| 9 | `milestone` (MilestonePage.jsx, MilestoneDrawer.jsx) | — | partial in `ADMIN-FRD-Allocation.md`, `ADMIN-FRD-Payment-Transactions.md` | partial in `ADMIN-FS-Payment-Transactions.md` | `ADMIN-WF-Payment.md` | PARTIAL — see Gap-001 |

Already-mapped modules (not flagged this sync): `login`, `customers` — coverage confirmed in `ADMIN-BRD-Login.md` / `ADMIN-BRD-Customers.md` and respective FRD/FS files.

---

## 4. Gaps Flagged (non-blocking)

### GAP-001 — `milestone` module lacks a dedicated BRD/FRD/FS
- **Module:** milestone (source: `MilestonePage.jsx`, `MilestoneDrawer.jsx`)
- **What is unclear:** No standalone `ADMIN-BRD-Milestone.md` / `ADMIN-FRD-Milestone.md` / `ADMIN-FS-Milestone.md`. The construction-milestone concept appears only embedded inside Payment-Transactions (milestone-linked demand generation) and Allocation (milestone schedule on booking) docs, plus `ADMIN-WF-Payment.md`.
- **FRD reference:** Not found as a dedicated file; embedded references only.
- **Impact:** Test cases for the standalone Milestone admin screen (create/edit/list construction milestones, milestone trigger/notify flows) cannot be authored against a single requirement ID. Cross-module milestone behaviours (Payment + Allocation) ARE covered.
- **Action needed:** Product / BA team to confirm whether the standalone Milestone admin page is in-scope for sprint testing. If yes, author `ADMIN-BRD-Milestone.md` + FRD + FS. If no (milestone managed only via Payment + Allocation flows), close gap and mark `MilestonePage.jsx` as out-of-scope.
- **Pipeline impact:** **Non-blocking.** Step 3 (QA Agent Manual) may proceed with the other 8 modules; milestone TCs deferred until clarification.

### No other gaps detected.
- No BRD requirement was found referencing UI elements that no longer exist in source.
- All Tech Lead locator corrections (`customers.colHomeLoan`, `customers.colConfirmationNumber`, `customers.tableRecordsHeading`) match BRD semantic intent — they are label refinements, not behavioural changes.
- Strapi-driven content and LeadSquared are correctly excluded from scope per CLAUDE.md constraints 1 and 2.

---

## 5. Hand-off Instructions for QA Agent (Step 3)

1. Use the 8 fully-covered modules listed in §3 as authoritative scope for TestCases.xlsx generation via `manual-tester` skill.
2. For `milestone`, **defer** TC authoring until GAP-001 is resolved by product/BA. Do not block the sprint.
3. For `customers` (already in TC repo), no re-authoring required — the locator label updates do not change behavioural expectations. Verify the existing `TC_CUSTOMERS.md` expected results still read "Confirmation" and "Home Loan Details" column references; minor cosmetic update if needed.
4. After Step 3 produces `TestCases.xlsx` + `test-data-spec.md` per module, signal Tech Lead Agent to extend `locators/admin/locator-map.json` with the new module entries (module-by-module locator pass — per handoff-note §"For BA Agent" point 2).
5. No new doc-change-summary.md is produced this sync (no BRD/FRD content was modified — this was a first-ever sync with no drift). This ba-signoff.md serves as the Step 2 artefact.

---

## 6. Artefacts Produced This Step

- `sync/ba-signoff.md` (this file)

## 7. Artefacts NOT Produced (and why)

- `sync/doc-change-summary.md` — not produced. No BRD/FRD sections were added, modified, or deprecated this sync. Tech Lead Step 1 made only selector-level corrections that are implementation details below the BRD/FRD abstraction layer.
- BRD/FRD file edits — none. No drift detected.

---

**Signed off by:** BA Agent
**Pipeline status:** GREEN — proceed to Step 3.
