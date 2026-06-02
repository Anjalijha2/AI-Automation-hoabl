# Doc Change Summary — Customers — Admin Portal — 2026-06-02 (re-run)

**Author:** BA Agent (via `manual-tester` + `test-case-reviewer` skills, dual-source mode)
**Module:** Customers
**Portal:** Admin
**Trigger:** Re-run of DEFAULT QA FLOW Phase 1 after Tech Lead Agent landed VG-1..VG-6 visual captures (resolving all 6 previously-blocking gaps from run 1)
**Phase:** 1 (TC generation) — re-run

---

## Pre-Gate Status (dual-source check)

| Source | Path | Status |
|--------|------|--------|
| Visual memory | `visual-memory/admin/customers/INDEX.md` | **FULL** — 10 screenshots, last refresh 2026-06-02 (all VG-1..VG-6 captured via trash-icon path) |
| BRD/FRD | `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Customers.md` | **PRESENT** — updated 2026-05-21 |

Dual-source confirmation: **YES**. Both sources present and consistent.

---

## What Changed in the Inputs Since Run 1

Run 1 (2026-06-02 morning) produced Conditional (83% visual coverage). Run 2 (this batch) was triggered by Tech Lead Agent extending visual-memory with 6 new captures (one of them via a corrected trash-icon trigger after the morning probe used the wrong kebab path).

### Visual memory additions (`visual-memory/admin/customers/INDEX.md`)

Run-1 INDEX.md had 3 screenshots: `screenshot-desktop.png`, `screenshot-ui.png`, `customers-filters-expanded.png`.

Run-2 INDEX.md (refreshed 2026-06-02) adds 7 more, fully resolving all 6 prior visual gaps:

| New filename | What it captures | Run-1 gap it resolves |
|--------------|------------------|------------------------|
| `customers-cancel-unit-modal.png` | Cancel Unit checklist modal — two unchecked checkboxes, Cancel / Submit footer, Submit disabled | VG-1 |
| `customers-cancel-registration-modal.png` | Cancel Registration "Confirm Refund" modal — red title, Registration No + Unit value rows, ₹999 warning, red CTA | VG-2 |
| `customers-booked-actions-dropdown.png` | Kebab dropdown on Booked row — 4 items (View Milestones / Unit swap / Update Parking Details / Home Loan Approval) | VG-3 |
| `customers-registered-actions-dropdown.png` | Kebab dropdown on Registered row — 2 items (Assign Unit / Home Loan Approval) | VG-4 |
| `customers-home-loan-approval-modal.png` | Home Loan Approval modal — Registration Number row, Apartment Type row, ant-switch toggle (Off/Enable), Submit | VG-5 |
| `customers-empty-search-state.png` | Empty-state placeholder ("0 Registration Records" + Ant empty SVG + "No data") | VG-6 |

### Critical correction landed in INDEX.md run-2

Cancel Unit and Cancel Registration are wired to the **trash icon** (`button:has(span.anticon-delete)`), NOT to the kebab dropdown. The run-1 INDEX.md probed the wrong trigger and incorrectly flagged VG-1 / VG-2 as UNREACHABLE. The refresh corrected this:
- Trash icon has NO `aria-label="delete"` in UAT — locator MUST use `:has(span.anticon-delete)` form
- Branch: trash-icon-on-Booked → Cancel Unit modal; trash-icon-on-Registered → Cancel Registration modal
- Kebab dropdown never contains these actions

### BRD/FRD

No changes to `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Customers.md` between run 1 and run 2. Source-of-truth document unchanged.

---

## Generated Artefacts (run 2)

| File | Path | Purpose |
|------|------|---------|
| `TestCases.md` | `manual-qa-repository/01-test-cases/admin/customers/TestCases.md` | 62 manual test cases (Sheet 1) + 61 automation candidates (Sheet 2) + bug template (Sheet 3). Overwrote run-1 output. |
| `test-data-spec.md` | `manual-qa-repository/01-test-cases/admin/customers/test-data-spec.md` | Test data + LSQ manual-gate documentation. Overwrote run-1 output. |
| `review-report.md` | `manual-qa-repository/01-test-cases/admin/customers/review-report.md` | test-case-reviewer output. Overwrote run-1 output. |
| `doc-change-summary.md` | this file | Run-2 summary. |

---

## Key Test Case Changes vs Run 1

### TCs regenerated from scratch using updated INDEX.md as ground truth

All 59 run-1 TCs were regenerated — none were carried over blindly. Selectors, screenshot citations, and Expected Result wording were rebuilt from the current INDEX.md.

### New TCs added (workflow splits)

Three TCs were added to cleanly separate safe read-only verification from destructive Submit-path execution. This lets the read-only variants run unconditionally on UAT while the destructive variants gate on explicit pre-cleanup confirmation.

| New TC_ID | Splits off from | Purpose |
|-----------|-----------------|---------|
| TC_CUSTOMERS_WF_034b | TC_CUSTOMERS_WF_034 | Destructive Submit-path Cancel Unit (requires LSQ Mavis pre-cleanup) |
| TC_CUSTOMERS_WF_036b | TC_CUSTOMERS_WF_036 | Destructive Submit-path Cancel Registration (₹999 refund permanent) |
| TC_CUSTOMERS_WF_039b | TC_CUSTOMERS_WF_039 | Home Loan toggle flip + Submit (multi-unit state change per BRD §6 Rule 9 + modal helper text) |

### TCs lifted from Conditional → Approved (run-1 NO-EVIDENCE flags removed)

| TC_ID | Run-1 status | Run-2 status | Now cites |
|-------|--------------|--------------|-----------|
| TC_CUSTOMERS_NEG_013 | Approved (cited screenshot-desktop) | Approved (upgraded screenshot) | `customers-empty-search-state.png` |
| TC_CUSTOMERS_NEG_014 | Approved (cited screenshot-desktop) | Approved (upgraded screenshot) | `customers-empty-search-state.png` |
| TC_CUSTOMERS_WF_034 | Conditional (NO-EVIDENCE) | **Approved** | `customers-cancel-unit-modal.png` |
| TC_CUSTOMERS_NEG_035 | Conditional (NO-EVIDENCE) | **Approved** | `customers-cancel-unit-modal.png` |
| TC_CUSTOMERS_WF_036 | Conditional (NO-EVIDENCE) | **Approved** | `customers-cancel-registration-modal.png` |
| TC_CUSTOMERS_UI_037 | Conditional (NO-EVIDENCE) | **Approved** | `customers-booked-actions-dropdown.png` |
| TC_CUSTOMERS_UI_038 | Conditional (NO-EVIDENCE) | **Approved** | `customers-registered-actions-dropdown.png` |
| TC_CUSTOMERS_WF_039 | Conditional (NO-EVIDENCE) | **Approved** | `customers-home-loan-approval-modal.png` |
| TC_CUSTOMERS_E2E_048 | Approved (Partial) | **Approved (full)** | 3 screenshots cited end-to-end |
| TC_CUSTOMERS_E2E_049 | Conditional (NO-EVIDENCE) | **Approved (manual-gated)** | `customers-cancel-unit-modal.png` |
| TC_CUSTOMERS_E2E_050 | Conditional (NO-EVIDENCE) | **Approved (manual-gated)** | `customers-cancel-registration-modal.png` |
| TC_CUSTOMERS_EDGE_055 | Conditional (NO-EVIDENCE) | **Approved** | `customers-empty-search-state.png` |

### Only Conditional TC remaining

| TC_ID | Type | Reason |
|-------|------|--------|
| TC_CUSTOMERS_DC_059 | DC (Data Contract) | Backend-only behavior (default projectId substitution per GAP-DEV-001). No UI surface exists, so NO-VISUAL-EVIDENCE is correct by design. Acceptable Conditional status per `manual-tester` skill rules for API-only types. |

### LSQ dependency incorporated

Cancel Unit Submit-path TCs (WF_034b, E2E_049, REG_056 when precursor is destructive) explicitly call out the manual LSQ pre-cleanup gate in both Preconditions and Steps. Per CLAUDE.md Constraint #1, LSQ is excluded from this framework — the test runner must pause and wait for explicit user confirmation that the Mavis booking entry has been deleted in LSQ before ticking the "Mavis - Booking entry deleted" checkbox. This protects data integrity (the checkboxes are admin attestations — ticking them without real cleanup is a data-integrity violation).

Recommended automation pattern documented in `test-data-spec.md`:
```javascript
test.skip(process.env.ENV === 'uat' && !process.env.LSQ_PRECLEAN_CONFIRMED,
  'Cancel Unit Submit-path requires manual LSQ Mavis cleanup first');
```

Read-only variants (TC_CUSTOMERS_WF_034 — open + assert + Cancel-dismiss; TC_CUSTOMERS_NEG_035 — Submit disabled state matrix) run unconditionally on UAT because no DB or LSQ state change occurs.

---

## Coverage Metrics

| Metric | Run 1 | Run 2 (this batch) | Delta |
|--------|-------|--------------------|-------|
| Total TCs | 59 | 62 | +3 |
| Approved | 47 | 61 | +14 |
| Conditional (NO-EVIDENCE) | 12 | 1 (DC-only, acceptable) | -11 |
| Visual coverage | 83% | 98.4% | +15.4pp |
| Doc logic coverage | 100% | 100% | unchanged |
| BRD/FRD traceability | 100% | 100% | unchanged |
| Orphan TCs | 0 | 0 | unchanged |
| Outcome | Conditional | **Approved** | gate cleared |

---

## Visual Memory Status (for QA Agent handoff)

| Module | Path | Status | Screenshots | Date refreshed |
|--------|------|--------|-------------|----------------|
| admin/customers | `visual-memory/admin/customers/INDEX.md` | **FULL** | 10 (3 baseline + 7 new for run 2) | 2026-06-02 |

No VISUAL_MISMATCH risk. All 9 cited filenames verified against INDEX.md Screens table.

---

## Dual-Source Confirmation per Affected Module

| Module | BRD/FRD source | Visual memory | Both present? | TCs generated |
|--------|---------------|---------------|---------------|---------------|
| admin/customers | YES — `ADMIN-BRD-Customers.md` (2026-05-21) | YES — `visual-memory/admin/customers/INDEX.md` FULL (10 screenshots, 2026-06-02) | YES | 62 (61 Approved, 1 Conditional-DC-acceptable) |

---

## Open Items for QA Agent (Step 3 / 4 of sync pipeline)

1. Scaffold POM `automation-repository/pages/admin/CustomersPage.js` — consume `locators/admin/locator-map.json` `customers` namespace (see Tech Lead Agent action below).
2. Scaffold specs: `tests/e2e/admin/customers.spec.js`, `tests/ui-ux/admin/customers.spec.js`, `tests/regression/admin/customers.spec.js`, `tests/api/customers.api.spec.js`.
3. Scaffold manual-gated suite for destructive Submit-path TCs (WF_034b, WF_036b, WF_039b, E2E_049, E2E_050, REG_056) — recommend `tests/manual-gated/admin/customers-destructive.spec.js`, excluded from default `npm run test:e2e:admin` and gated on `LSQ_PRECLEAN_CONFIRMED` env var (Cancel Unit branch only).
4. Add `db/queries/registration.js` helper for TC_CUSTOMERS_FUNC_004 (status-sum verification).

## Open Items for Tech Lead Agent

1. Confirm `locators/admin/locator-map.json` `customers` namespace covers the new selectors documented in INDEX.md "Cancel Registration / Cancel Unit Modals" and "Home Loan Approval Modal" sections. Critical selectors:
   - `tr.ant-table-row:has-text("Booked") button:has(span.anticon-delete)` (Cancel Unit trash trigger)
   - `tr.ant-table-row:has-text("Registered") button:has(span.anticon-delete)` (Cancel Registration trash trigger)
   - `.ant-modal-content button.btn-book-solid:has-text("Submit")` (Cancel Unit Submit)
   - `.ant-modal-content button.ant-btn-dangerous:has-text("Cancel Registration")` (Cancel Registration confirm)
   - `.ant-modal-content label.ant-checkbox-wrapper:has-text("...") input.ant-checkbox-input` (attestation checkboxes)
   - `button.ant-switch[role="switch"]` (Home Loan toggle)
   - `button[aria-label="more"]` and `.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item:has-text("...")` (kebab + items)
   - `tr.ant-table-placeholder .ant-empty-description` (empty-state)
2. Visual gate for sibling modules already noted as out-of-scope here: Unit Swap, Update Parking Details, View Milestones, Assign Unit modal, Cancel Bulk Units downstream modal, Home Loan Approval modal field internals (Feature 3 deeper). When those captures land, BA Agent will run separate Phase 1 batches.

---

## Compliance

- CLAUDE.md Constraints — observed: LSQ excluded (manual gate explicit), Strapi excluded, locator map ownership respected, BRD/FRD sole source of truth, traceability 100%, archival rule respected (run-1 artefacts overwritten in-place per user instruction, not deleted)
- `manual-tester` skill rules — observed: visual gate pre-flight passed, dual-source TC rule honored, Steps reference INDEX.md selectors, Expected Results cite screenshot filenames, BRD/FRD requirement IDs mandatory
- `test-case-reviewer` skill Approval Rules — all gates passed (visual ≥80%: yes 98.4%; no VISUAL_MISMATCH; no LOGIC_GAP; NO-VISUAL-EVIDENCE TC excluded from Sheet 2)

---

## Outcome

**Conditional (83%) → Approved (98.4%).** Phase 1 re-run complete. Batch is ready for QA Agent handoff (Step 3 of sync pipeline).
