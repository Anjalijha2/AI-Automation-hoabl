# Test Case Review Report — Customers — Admin Portal — 2026-06-02 (re-run)

**Reviewer skill:** `test-case-reviewer`
**Inputs reviewed:**
- TestCases: `manual-qa-repository/01-test-cases/admin/customers/TestCases.md`
- BRD/FRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Customers.md`
- Visual memory: `visual-memory/admin/customers/INDEX.md` (CAPTURE_STATUS: FULL — 10 screenshots, last refresh 2026-06-02 with VG-1..VG-6 all captured via trash-icon path)

**Run number:** 2 (re-run after Tech Lead Agent landed the 6 visual captures previously listed as blocking)

---

## Summary

- **Total TCs reviewed:** 62 (was 59 in run 1; split Cancel Unit / Cancel Registration / Home Loan Approval into safe read-only + destructive Submit-path pairs — adds TC_CUSTOMERS_WF_034b, WF_036b, WF_039b for clean automation gating)
- **Approved:** 61
- **Conditional (NO-VISUAL-EVIDENCE flagged — acceptable for type=DC):** 1 (TC_CUSTOMERS_DC_059 — backend-only data-contract, no UI surface)
- **Requires changes:** 0
- **Coverage (BRD/FRD):** 100% — every documented in-scope BRD/FRD section is mapped (out-of-scope deferred to dedicated FS files)
- **Visual coverage:** 61/62 = **98.4%** — exceeds the ≥80% Approved gate by a wide margin
- **Doc logic coverage:** 62/62 = **100%** — every TC carries a BRD/FRD Req ID and Scenario references feature purpose
- **Visual status:** **FULL** — every modal, dropdown, and empty-state cited in TCs has a real screenshot in INDEX.md

### Run-over-run delta

| Metric | Run 1 (morning) | Run 2 (this run) | Delta |
|--------|----------------|------------------|-------|
| Total TCs | 59 | 62 | +3 (safe/destructive workflow splits) |
| Approved | 47 | 61 | +14 |
| Conditional | 12 (10 visual + 1 partial + 1 API-only) | 1 (API-only — acceptable) | -11 |
| Visual coverage | 83% | 98.4% | +15.4pp |
| Outcome | Conditional | **Approved** | gate cleared |

---

## Visual Evidence Gaps

| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_CUSTOMERS_DC_059 | Backend-only — projectId default substitution | NO-VISUAL-EVIDENCE (API-only, by design) | (none — no UI surface) | None required. Type=DC TC asserts backend behavior; no visual capture applicable. Acceptable per `manual-tester` skill rules. |

**VISUAL_MISMATCH:** None. Every TC that cites a screenshot filename references one that EXISTS in `visual-memory/admin/customers/INDEX.md` Screens table. All 9 cited filenames verified.

**Resolved gaps from run 1:**

| Run-1 Gap | Run-1 TC IDs | Run-2 Resolution |
|-----------|--------------|------------------|
| VG-1 — Cancel Unit modal | TC_CUSTOMERS_WF_034, NEG_035, E2E_049 | RESOLVED — `customers-cancel-unit-modal.png` now in INDEX.md; cited in 5 TCs (WF_034, WF_034b, NEG_035, E2E_049 — plus REG_056 indirect) |
| VG-2 — Cancel Registration popup | TC_CUSTOMERS_WF_036, E2E_050 | RESOLVED — `customers-cancel-registration-modal.png` now in INDEX.md; cited in 3 TCs (WF_036, WF_036b, E2E_050) |
| VG-3 — Booked-row kebab dropdown | TC_CUSTOMERS_UI_037 | RESOLVED — `customers-booked-actions-dropdown.png` now in INDEX.md; cited in UI_037 + E2E_048 |
| VG-4 — Registered-row kebab dropdown | TC_CUSTOMERS_UI_038 | RESOLVED — `customers-registered-actions-dropdown.png` now in INDEX.md; cited in UI_038 |
| VG-5 — Home Loan Approval modal | TC_CUSTOMERS_WF_039, E2E_048 (partial) | RESOLVED — `customers-home-loan-approval-modal.png` now in INDEX.md; cited in WF_039, WF_039b, E2E_048 |
| VG-6 — Empty-state | TC_CUSTOMERS_EDGE_055 | RESOLVED — `customers-empty-search-state.png` now in INDEX.md; cited in EDGE_055 + NEG_013 + NEG_014 (run-1 NEG_013/014 cited screenshot-desktop.png, now upgraded to the proper empty-state screenshot) |

---

## Logic Gaps

**None.** Every TC Scenario explicitly references a BRD/FRD section (column "BRD/FRD Req ID"). No mechanical "click X then Y" TCs without business context.

---

## BRD/FRD Gaps

| Gap | BRD/FRD Section | Missing TC Type | Action |
|-----|----------------|-----------------|--------|
| None for in-scope sections | All §3–§9 sections + §6 Rules 1–19 mapped | n/a | n/a |
| Out-of-scope (intentionally deferred) | §6 Rule 10–11, 13–14 (Unit Swap), §6 Rule 15 (Parking), Feature 5 (Assign Unit), Feature 3 internals (HL modal field-level), Cancel Bulk Units downstream | These are documented in their own FS files | Generate dedicated TC batches when their visual-capture lands |

---

## Per-TC Status

| TC_ID | Req ID | Visual Evidence | Logic Coverage | Status | Issue |
|-------|--------|-----------------|----------------|--------|-------|
| TC_CUSTOMERS_UI_001 | §3 | FULL (screenshot-desktop.png) | YES | Approved | — |
| TC_CUSTOMERS_UI_002 | §3 | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_003 | §4 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_004 | §6 Rule 1 | FULL | YES | Approved | Needs DB query helper |
| TC_CUSTOMERS_BIZ_005 | §6 Rule 2 | FULL | YES | Approved | — |
| TC_CUSTOMERS_BIZ_006 | §6 Rule 1 (CORRECTED) | FULL (customers-filters-expanded.png) | YES | Approved | — |
| TC_CUSTOMERS_NEG_007 | §6 Rule 17 | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_008 | §4 | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_009 | §4 | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_010 | §4 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_011 | §5 + §6 Rule 16 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_012 | §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_NEG_013 | §6 Rule 16 | FULL (customers-empty-search-state.png) | YES | Approved | Upgraded screenshot vs run 1 |
| TC_CUSTOMERS_NEG_014 | §6 Rule 16 | FULL (customers-empty-search-state.png) | YES | Approved | Upgraded screenshot vs run 1 |
| TC_CUSTOMERS_UI_015 | §4 + KSN | FULL (customers-filters-expanded.png) | YES | Approved | — |
| TC_CUSTOMERS_FUNC_016 | §5 + §6 Rule 19 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_017 | §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_018 | §5 + §6 Rule 19 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_019 | §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_020 | §6 Rule 18 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_021 | §6 Rule 18 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_022 | §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_023 | §4 (inline) | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_024 | §4 (inline) | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_025 | KSN (Pagination) | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_026 | §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_027 | §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_028 | §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_NEG_029 | KSN (Pagination) | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_030 | §4 + §6 Rule 12 | FULL | YES | Approved | Known tech-debt flag in scenario |
| TC_CUSTOMERS_FUNC_031 | §4 (trash icon) | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_032 | §4 (trash icon) | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_033 | §4 (REFUND rows) | FULL | YES | Approved | — |
| TC_CUSTOMERS_WF_034 | §5 + §9 | **FULL (customers-cancel-unit-modal.png)** | YES | **Approved** | Read-only modal verification; safe on UAT |
| TC_CUSTOMERS_WF_034b | §5 + §9 + §6 Rule 8 | FULL (customers-cancel-unit-modal.png) | YES | Approved (manual-gated) | Destructive Submit-path; LSQ pre-cleanup gate explicit |
| TC_CUSTOMERS_NEG_035 | §5 (modal gate) | **FULL** | YES | **Approved** | — |
| TC_CUSTOMERS_WF_036 | §5 + §9 | **FULL (customers-cancel-registration-modal.png)** | YES | **Approved** | Read-only modal verification; safe on UAT |
| TC_CUSTOMERS_WF_036b | §5 + §9 + §6 Rule 8 | FULL (customers-cancel-registration-modal.png) | YES | Approved (manual-gated) | Destructive ₹999 refund permanent |
| TC_CUSTOMERS_UI_037 | §4 (3-dot menu) | **FULL (customers-booked-actions-dropdown.png)** | YES | **Approved** | — |
| TC_CUSTOMERS_UI_038 | §4 (3-dot menu) | **FULL (customers-registered-actions-dropdown.png)** | YES | **Approved** | — |
| TC_CUSTOMERS_WF_039 | §5 + §9 | **FULL (customers-home-loan-approval-modal.png)** | YES | **Approved** | Read-only modal verification; safe on UAT |
| TC_CUSTOMERS_WF_039b | §5 + §6 Rule 9 | FULL (customers-home-loan-approval-modal.png) | YES | Approved (state-flip) | Applies to ALL related registration units |
| TC_CUSTOMERS_FUNC_040 | §5 + §6 Rule 5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_041 | §6 Rule 5 + §7 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_042 | §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_043 | §4 (Cancel Bulk Units) | FULL (button visible in screenshot-desktop.png) | YES | Approved (Partial) | Click trigger verified; downstream bulk modal deferred to dedicated FS |
| TC_CUSTOMERS_UI_044 | §4 (Download your Unit Details) | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_045 | §4 (helper text) | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_046 | KSN (Sidebar) | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_047 | KSN (welcome) | FULL | YES | Approved | — |
| TC_CUSTOMERS_E2E_048 | §9 | **FULL (3 screenshots cited — screenshot-desktop.png + customers-booked-actions-dropdown.png + customers-home-loan-approval-modal.png)** | YES | **Approved** | Read-only HL Approval step (no commit) |
| TC_CUSTOMERS_E2E_049 | §9 (Cancel Unit) | FULL (customers-cancel-unit-modal.png) | YES | Approved (manual-gated) | Destructive — LSQ pre-cleanup gate |
| TC_CUSTOMERS_E2E_050 | §9 (Cancel Registration) | FULL (customers-cancel-registration-modal.png) | YES | Approved (manual-gated) | Destructive — ₹999 refund permanent |
| TC_CUSTOMERS_XMOD_051 | §8 + §6 Rule 2 | FULL | YES | Approved | Cross-module — Config |
| TC_CUSTOMERS_XMOD_052 | §8 (CP) | FULL | YES | Approved | Cross-module — CP |
| TC_CUSTOMERS_XMOD_053 | §8 (Payment) | FULL | YES | Approved | Cross-module — Payment |
| TC_CUSTOMERS_BIZ_054 | §6 Rule 6 | FULL | YES | Approved | — |
| TC_CUSTOMERS_EDGE_055 | §5 (no-match) | **FULL (customers-empty-search-state.png)** | YES | **Approved** | — |
| TC_CUSTOMERS_REG_056 | §6 Rule 3 | FULL | YES | Approved | Depends on a destructive precursor; gate together |
| TC_CUSTOMERS_VAL_057 | §6 Rule 19 + §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_API_058 | §6 Rule 17 | FULL | YES | Approved | — |
| TC_CUSTOMERS_DC_059 | Backend Gap GAP-DEV-001 | NO-VISUAL-EVIDENCE (API-only, by design) | YES | **Conditional (acceptable — type=DC has no UI surface)** | No action needed |

---

## Coverage Calculations

- **Visual coverage:** `61 TCs with FULL or PARTIAL-FULL evidence / 62 total = 98.4%` — exceeds ≥80% Approved gate by 18.4 points
- **Doc logic coverage:** `62 / 62 = 100%` — every TC carries a BRD/FRD Req ID and Scenario context references the purpose
- **BRD/FRD requirement traceability:** 100% — no orphan TCs
- **Negative coverage:** ≥1 negative TC per major user journey
  - Search: NEG_013, NEG_014 (phone-only rule)
  - Filtering: VAL_057 (case-sensitivity)
  - Pagination: NEG_029 (prev-disabled on page 1)
  - Cancel Unit: NEG_035 (Submit-disabled state matrix)
  - KPI: NEG_007 (`allotedCount` dead code)
  - Search empty: EDGE_055
- **Positive (happy-path) coverage:** every BRD/FRD §5 user journey has at least 1 P1 TC

---

## Approval

[X] **Approved** — proceed to automation for 61 TCs with FULL visual evidence (54 unconditional + 4 manual-gated Submit-path + 2 read-only modal variants + 1 partial bulk-button trigger)
[X] **Conditional (acceptable)** — 1 TC (TC_CUSTOMERS_DC_059) is API-only by design; no UI surface exists; no visual capture applicable
[ ] Rejected

**Gate evaluation against `test-case-reviewer` Approval Rules:**

| Condition | Result |
|-----------|--------|
| Visual coverage ≥ 80% | YES (98.4%) |
| No VISUAL_GAP for approved TCs | YES — 61 approved TCs all have FULL evidence; the 1 Conditional TC is API-only and outside visual-coverage scope |
| No VISUAL_MISMATCH | YES — every cited filename exists in INDEX.md (9 unique filenames, all verified) |
| No LOGIC_GAP | YES — 0 logic gaps |
| `[NO-VISUAL-EVIDENCE]` TCs excluded from Sheet 2 | YES — Sheet 2 omits TC_CUSTOMERS_DC_059 |

**Outcome:** **Approved batch of 61 TCs may proceed to QA Agent for POM scaffolding + spec generation.** The 1 Conditional TC (TC_CUSTOMERS_DC_059) remains in TestCases.md Sheet 1 as a pure-API contract test; it can be implemented in `tests/api/customers.api.spec.js` without UI evidence. This batch lifts the previous run (47 Approved / 83% visual coverage / Conditional outcome) to a clean Approved state.

---

## Recommended Next Steps

1. **QA Agent** — receive the 61 Approved TCs and scaffold:
   - `automation-repository/pages/admin/CustomersPage.js` (POM, consumes `locators/admin/locator-map.json` `customers` namespace)
   - `tests/e2e/admin/customers.spec.js`
   - `tests/ui-ux/admin/customers.spec.js`
   - `tests/regression/admin/customers.spec.js`
   - `tests/api/customers.api.spec.js`
   - Manual-gated suite: `tests/manual-gated/admin/customers-destructive.spec.js` for WF_034b, WF_036b, E2E_049, E2E_050 (LSQ pre-cleanup / ₹999 refund / multi-unit toggle gates)
2. **Tech Lead Agent** — confirm `locators/admin/locator-map.json` `customers` namespace includes selectors for:
   - Trash icon row trigger: `tr.ant-table-row:has-text("Booked") button:has(span.anticon-delete)` and the Registered variant
   - Cancel Unit modal: title, two checkbox wrappers (by label text), Cancel button, Submit button
   - Cancel Registration modal: red-title span, Registration No / Unit value rows, `ant-btn-dangerous` confirm button
   - Home Loan Approval modal: title, Registration Number row, Apartment Type row, `button.ant-switch`, Submit button
   - Kebab dropdowns: `.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item:has-text("<label>")`
   - Empty-state: `tr.ant-table-placeholder .ant-empty-description`
3. **Out-of-scope TC batches (separate phase 1 runs):**
   - View Milestones (FS exists)
   - Unit Swap (FS exists, OPEN gap #7 for milestone regen)
   - Update Parking Details (FS exists, GAP-DEV-006 server-side validation)
   - Assign Unit (Feature 5)
   - Cancel Bulk Units downstream modal
   - Home Loan Approval modal field-level internals (Feature 3 beyond toggle/Submit)

---

## Compliance Summary

- Visual gate: CLEARED — INDEX.md FULL with 10 screenshots (`screenshot-desktop.png`, `screenshot-ui.png`, `customers-filters-expanded.png`, plus 7 new captures for the previously-Conditional cases)
- BRD/FRD gate: CLEARED — `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Customers.md` present
- Dual-source: YES
- LSQ exclusion: respected (manual-gated Submit-path TCs explicitly require external LSQ Mavis pre-cleanup)
- Strapi exclusion: respected
- Orphan TCs: 0
- Filename consistency: all 9 cited screenshot filenames verified against INDEX.md Screens table
- Run-2 promotion: 11 TCs lifted from Conditional → Approved; 3 new safe-variant TCs added; outcome moves Conditional (83%) → **Approved (98.4%)**
