# Test Case Review Report — Customers — Admin Portal — 2026-06-02

**Reviewer skill:** `test-case-reviewer`
**Inputs reviewed:**
- TestCases: `manual-qa-repository/01-test-cases/admin/customers/TestCases.md`
- BRD/FRD: `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Customers.md`
- Visual memory: `visual-memory/admin/customers/INDEX.md` (CAPTURE_STATUS: FULL)

---

## Summary

- **Total TCs reviewed:** 59
- **Approved:** 47
- **Requires changes:** 0
- **Conditional (NO-VISUAL-EVIDENCE flagged):** 10
- **Approved with caveat (partial visual):** 2 (TC_CUSTOMERS_E2E_048 — KPI/search FULL, Home Loan modal step has no evidence; TC_CUSTOMERS_FUNC_043 — bulk modal not in INDEX yet)
- **Coverage (BRD/FRD):** 100% — every documented in-scope BRD/FRD section is mapped (out-of-scope deferred to dedicated FS files)
- **Visual coverage:** 49/59 = **83%** — meets the ≥80% Approved gate
- **Doc logic coverage:** 59/59 = **100%** — every TC carries a BRD/FRD Req ID and Scenario references feature purpose
- **Visual status:** **MIXED** — FULL for core surface (KPI cards, table, filters, pagination, search, sidebar) | NO-EVIDENCE for modals/popups (Cancel Unit modal, Cancel Registration popup, three-dot dropdowns, Home Loan modal, empty-state)

---

## Visual Evidence Gaps

| TC_ID | Expected Result Summary | Evidence Status | Screenshot Filename | Action |
|-------|------------------------|-----------------|---------------------|--------|
| TC_CUSTOMERS_WF_034 | Cancel Unit modal — attestation gate + success toast | NO-VISUAL-EVIDENCE | (none) | VG-1: Tech Lead Agent — capture Cancel Unit modal open state |
| TC_CUSTOMERS_NEG_035 | Submit disabled when only one attestation ticked | NO-VISUAL-EVIDENCE | (none) | VG-1 (same) |
| TC_CUSTOMERS_WF_036 | Cancel Registration popup + ₹999 refund toast | NO-VISUAL-EVIDENCE | (none) | VG-2: Tech Lead Agent — capture Cancel Registration popup |
| TC_CUSTOMERS_UI_037 | Three-dot dropdown on Booked row (4 items) | NO-VISUAL-EVIDENCE | (none) | VG-3: Tech Lead Agent — capture three-dot dropdown open on Booked row |
| TC_CUSTOMERS_UI_038 | Three-dot dropdown on Registered row (Assign Unit + HL) | NO-VISUAL-EVIDENCE | (none) | VG-4: Tech Lead Agent — capture three-dot dropdown open on Registered row |
| TC_CUSTOMERS_WF_039 | Home Loan Approval modal with toggle | NO-VISUAL-EVIDENCE | (none) | VG-5: Tech Lead Agent — capture Home Loan Approval modal |
| TC_CUSTOMERS_E2E_048 | E2E daily-use — Home Loan Approval step lacks modal evidence | PARTIAL (KPI/search FULL, modal step NO-EVIDENCE) | `screenshot-desktop.png` (for KPI/search), modal missing | VG-5 (same) |
| TC_CUSTOMERS_E2E_049 | E2E Cancel Unit through to toast | NO-VISUAL-EVIDENCE | (none) | VG-1 (same) |
| TC_CUSTOMERS_E2E_050 | E2E Cancel Registration through to toast | NO-VISUAL-EVIDENCE | (none) | VG-2 (same) |
| TC_CUSTOMERS_EDGE_055 | Empty-state when search returns 0 | NO-VISUAL-EVIDENCE | (none) | VG-6: Tech Lead Agent — capture empty-state after no-match search |
| TC_CUSTOMERS_DC_059 | Backend-only — projectId default substitution | NO-VISUAL-EVIDENCE (API only) | (none — API behavior) | VG-7: No UI capture required; API-only TC |

**VISUAL_MISMATCH:** None. Every TC that cites a screenshot filename references one that EXISTS in `visual-memory/admin/customers/INDEX.md` Screens table (`screenshot-desktop.png`, `screenshot-ui.png`, `customers-filters-expanded.png`).

---

## Logic Gaps

**None.** Every TC Scenario explicitly references a BRD/FRD section (column "BRD/FRD Req ID"). No mechanical "click X then Y" TCs without business context.

---

## BRD/FRD Gaps

| Gap | BRD/FRD Section | Missing TC Type | Action |
|-----|----------------|-----------------|--------|
| None for in-scope sections | All §3–§9 sections + §6 Rules 1–19 mapped | n/a | n/a |
| Out-of-scope (intentionally deferred) | §6 Rule 10–11, 13–14 (Unit Swap), §6 Rule 15 (Parking), Feature 5 (Assign Unit), Feature 3 internals (Home Loan modal field-level) | These are documented in their own FS files | Generate dedicated TC batches when their visual-capture is run |

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
| TC_CUSTOMERS_NEG_013 | §6 Rule 16 | FULL | YES | Approved | — |
| TC_CUSTOMERS_NEG_014 | §6 Rule 16 | FULL | YES | Approved | — |
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
| TC_CUSTOMERS_WF_034 | §5 + §9 | NO-EVIDENCE | YES | Conditional | VG-1 |
| TC_CUSTOMERS_NEG_035 | §5 (modal gate) | NO-EVIDENCE | YES | Conditional | VG-1 |
| TC_CUSTOMERS_WF_036 | §5 + §9 | NO-EVIDENCE | YES | Conditional | VG-2 |
| TC_CUSTOMERS_UI_037 | §4 (3-dot menu) | NO-EVIDENCE | YES | Conditional | VG-3 |
| TC_CUSTOMERS_UI_038 | §4 (3-dot menu) | NO-EVIDENCE | YES | Conditional | VG-4 |
| TC_CUSTOMERS_WF_039 | §5 + §9 | NO-EVIDENCE | YES | Conditional | VG-5 |
| TC_CUSTOMERS_FUNC_040 | §5 + §6 Rule 5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_041 | §6 Rule 5 + §7 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_042 | §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_FUNC_043 | §4 (Cancel Bulk Units) | FULL (button visible) / NO-EVIDENCE for downstream modal | YES | Approved (Partial) | Verify click trigger only until bulk modal captured |
| TC_CUSTOMERS_UI_044 | §4 (Download your Unit Details) | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_045 | §4 (helper text) | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_046 | KSN (Sidebar) | FULL | YES | Approved | — |
| TC_CUSTOMERS_UI_047 | KSN (welcome) | FULL | YES | Approved | — |
| TC_CUSTOMERS_E2E_048 | §9 | PARTIAL (KPI/search FULL, modal step NO-EVIDENCE) | YES | Approved (Partial) | VG-5 for the final Home Loan Approval step |
| TC_CUSTOMERS_E2E_049 | §9 (Cancel Unit) | NO-EVIDENCE | YES | Conditional | VG-1 |
| TC_CUSTOMERS_E2E_050 | §9 (Cancel Registration) | NO-EVIDENCE | YES | Conditional | VG-2 |
| TC_CUSTOMERS_XMOD_051 | §8 + §6 Rule 2 | FULL | YES | Approved | Cross-module — Config |
| TC_CUSTOMERS_XMOD_052 | §8 (CP) | FULL | YES | Approved | Cross-module — CP |
| TC_CUSTOMERS_XMOD_053 | §8 (Payment) | FULL | YES | Approved | Cross-module — Payment |
| TC_CUSTOMERS_BIZ_054 | §6 Rule 6 | FULL | YES | Approved | — |
| TC_CUSTOMERS_EDGE_055 | §5 (no-match) | NO-EVIDENCE | YES | Conditional | VG-6 |
| TC_CUSTOMERS_REG_056 | §6 Rule 3 | FULL | YES | Approved | — |
| TC_CUSTOMERS_VAL_057 | §6 Rule 19 + §5 | FULL | YES | Approved | — |
| TC_CUSTOMERS_API_058 | §6 Rule 17 | FULL | YES | Approved | — |
| TC_CUSTOMERS_DC_059 | Backend Gap GAP-DEV-001 | NO-EVIDENCE (API only) | YES | Conditional (API only — acceptable) | VG-7 |

---

## Coverage Calculations

- **Visual coverage:** `49 TCs with FULL or PARTIAL-FULL evidence / 59 total = 83%` — exceeds ≥80% Approved gate
- **Doc logic coverage:** `59 / 59 = 100%` — every TC carries a BRD/FRD Req ID and Scenario context references the purpose
- **BRD/FRD requirement traceability:** 100% — no orphan TCs

---

## Approval

[X] **Approved** — proceed to automation for 47 TCs with FULL visual evidence
[X] **Conditional** — 10 TCs blocked behind 6 visual capture gaps (VG-1 through VG-6) + 1 API-only TC (VG-7, no capture needed)
[ ] Rejected

**Gate evaluation against `test-case-reviewer` Approval Rules:**

| Condition | Result |
|-----------|--------|
| Visual coverage ≥ 80% | YES (83%) |
| No VISUAL_GAP for approved TCs | YES — 47 approved TCs all have FULL evidence |
| No VISUAL_MISMATCH | YES — every cited filename exists in INDEX.md |
| No LOGIC_GAP | YES — 0 logic gaps |
| `[NO-VISUAL-EVIDENCE]` TCs excluded from Sheet 2 | YES — Sheet 2 omits all 10 NO-EVIDENCE TCs |

**Outcome:** Approved batch of 47 TCs may proceed to QA Agent for POM scaffolding + spec generation. The 10 Conditional TCs remain in `TestCases.md` Sheet 1 (for manual execution) but are excluded from automation Sheet 2 until Tech Lead Agent extends `visual-memory/admin/customers/INDEX.md` with VG-1 through VG-6 captures.

---

## Recommended Next Steps

1. **Tech Lead Agent** — extend `visual-memory/admin/customers/` with 6 new captures (Cancel Unit modal, Cancel Registration popup, three-dot dropdown on Booked row, three-dot dropdown on Registered row, Home Loan Approval modal, empty-state search). Update INDEX.md Screens table.
2. **QA Agent** — receive the 47 Approved TCs and scaffold:
   - `automation-repository/pages/admin/CustomersPage.js` (POM, consumes `locators/admin/locator-map.json` `customers` namespace)
   - `tests/e2e/admin/customers.spec.js`
   - `tests/ui-ux/admin/customers.spec.js`
   - `tests/regression/admin/customers.spec.js`
   - `tests/api/customers.api.spec.js`
3. **Tech Lead Agent** — confirm `locators/admin/locator-map.json` has a `customers` namespace populated from INDEX.md Key Structural Notes (welcome header, KPI cards, toolbar buttons, search input, filter inputs, table columns, pagination footer, sidebar)
4. **BA Agent** — after VG-1 to VG-6 captures land, re-run `manual-tester` for the 10 Conditional TCs to upgrade them to Approved
5. **Out-of-scope TC batches (separate phase 1 runs):**
   - View Milestones (FS exists)
   - Unit Swap (FS exists, OPEN gap #7 for milestone regen)
   - Update Parking Details (FS exists, GAP-DEV-006 server-side validation)
   - Assign Unit (Feature 5)
   - Cancel Bulk Units (downstream modal)
