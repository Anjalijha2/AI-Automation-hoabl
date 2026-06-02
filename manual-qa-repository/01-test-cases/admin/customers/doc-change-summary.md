# Doc Change Summary — Admin Portal / Customers — 2026-06-02

**Produced by:** BA Agent (DEFAULT QA FLOW Phase 1)
**Trigger:** New TC batch generation for Admin Portal Customers module
**Pipeline phase:** Phase 1 (BA Agent → manual-tester + test-case-reviewer)

---

## Dual-Source Confirmation

| Source | Path | Status | Used For |
|--------|------|--------|----------|
| Visual memory INDEX.md | `visual-memory/admin/customers/INDEX.md` | **FULL** (CAPTURE_STATUS: FULL, captured 2026-06-01) | Steps, Expected Results, Visual Evidence column |
| BRD/FRD | `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Customers.md` | Present (updated 2026-05-21, 346 lines) | Scenario context, business rules, requirement IDs |

**Both sources present:** **YES** — dual-source gate cleared before `manual-tester` invocation.

---

## Module Status

| Module | Visual Memory | BRD/FRD | Dual-Source | Phase 1 Outcome |
|--------|--------------|---------|-------------|-----------------|
| admin/customers | YES (FULL) | YES (present) | YES | Approved batch of 47 TCs + 10 Conditional TCs pending 6 visual-capture gaps |

---

## What Changed

### Created
| File | Purpose |
|------|---------|
| `manual-qa-repository/01-test-cases/admin/customers/TestCases.md` | 59 test cases (Sheet 1) + 47 automation candidates (Sheet 2) + bug template (Sheet 3) + VISUAL_GAP list + LOGIC_GAP list + BRD/FRD coverage map |
| `manual-qa-repository/01-test-cases/admin/customers/test-data-spec.md` | Valid inputs (auth, search, filters, page size, inline column searches) + invalid/boundary inputs (case-sensitive filter values, phone-only search negatives) + preconditions per TC group + cleanup notes |
| `manual-qa-repository/01-test-cases/admin/customers/review-report.md` | test-case-reviewer output — approval status per TC, visual coverage 83%, logic coverage 100%, 6 VG flagged, 0 LOGIC_GAPs, 0 VISUAL_MISMATCHes |
| `manual-qa-repository/01-test-cases/admin/customers/doc-change-summary.md` | This file |

### Modified
None — this is a fresh Phase 1 generation against the (new) `admin/customers` output path. Note the previously existing TCs at `manual-qa-repository/01-test-cases/admin-portal/customers/` are left untouched (different folder per CLAUDE.md path expectation in `Naming Conventions` — `admin/`, not `admin-portal/`).

### Deprecated / Archived
None.

---

## BRD/FRD Coverage

In-scope sections covered 100%:
- §3 How to Access
- §4 Screen Layout (KPI Cards, Registration Table, Trash icon context, Three-dot menu visibility, Table States, Filters/Controls, Pagination, Actions, Process Status helper text)
- §5 Feature Walkthrough (Viewing dashboard, Search by Phone, Filtering, Page size, Cancel Unit, Cancel Registration, Home Loan Approval, Download, Refresh)
- §6 Business Rules — Rules 1, 2, 3, 4, 5, 6, 8, 9, 12, 16, 17, 18, 19
- §7 Validations
- §8 Dependencies (Config, Channel Partners, Payment Transactions)
- §9 User Journey Map (Standard daily use, Cancel Unit flow, Cancel Registration flow)
- Backend Gap Reconciliation — GAP-DEV-001 (default projectId)

Intentionally deferred to dedicated FS files per BRD §6 Rule 10:
- Unit Swap (§6 Rules 11, 13, 14 — see `ADMIN-FS-Customers-UnitSwap`)
- View Milestones (§6 Rule 10 — see `ADMIN-FS-Customers-Milestones`)
- Update Parking Details (§6 Rule 15 — see `ADMIN-FS-Customers-Parking`)
- Assign Unit (Feature 5)
- Home Loan Approval modal field-level (Feature 3)
- Cancel Bulk Units downstream modal

---

## Nature of Change

This is the **initial Phase 1 BA Agent output** for `admin/customers` against the canonical output path defined in CLAUDE.md (`manual-qa-repository/01-test-cases/<portal>/<module>/`). The BRD/FRD source had been recently corrected on 2026-05-21 (KPI scope, globalSearch phone-only, hasHomeLoan completion-only, filter param naming, allotedCount dead code, download-respects-filters) — those corrections are explicitly reflected in:

- TC_CUSTOMERS_BIZ_006 (KPI unchanged by filter)
- TC_CUSTOMERS_NEG_007 + TC_CUSTOMERS_API_058 (allotedCount dead code)
- TC_CUSTOMERS_NEG_013 + TC_CUSTOMERS_NEG_014 (Search by Phone is phone-only)
- TC_CUSTOMERS_FUNC_016 + TC_CUSTOMERS_VAL_057 (allotmentStatus param name + case sensitivity)
- TC_CUSTOMERS_FUNC_018, _019, _020, _021 (paymentStatus/kycStatus/hasHomeLoan semantics)
- TC_CUSTOMERS_FUNC_041 (Download respects active filters per Rule 5 correction)
- TC_CUSTOMERS_UI_030 (Allocation Opened banner — known tech debt per Rule 12)

---

## Visual-Memory Status (per module)

| Portal/Module | INDEX.md exists | CAPTURE_STATUS | Screens captured | Gaps |
|---------------|----------------|----------------|------------------|------|
| admin/customers | YES | FULL | `screenshot-desktop.png`, `screenshot-ui.png`, `customers-filters-expanded.png` | 6 modal/dropdown captures needed (VG-1 to VG-6); 1 API-only TC (VG-7) requires no capture |

**Detailed gaps (raised in `review-report.md`):**
- VG-1: Cancel Unit modal (Activity/Mavis attestation checkboxes + Submit)
- VG-2: Cancel Registration ₹999 refund popup
- VG-3: Three-dot dropdown open on Booked row (View Milestones / Unit swap / Update Parking Details / Home Loan Approval)
- VG-4: Three-dot dropdown open on Registered row (Assign Unit / Home Loan Approval)
- VG-5: Home Loan Approval modal with toggle
- VG-6: Empty-state when search returns 0 rows
- VG-7: API-only (no capture required)

---

## Handoffs

| Recipient | What they consume | When |
|-----------|------------------|------|
| **QA Agent** | `TestCases.md` + `test-data-spec.md` + `review-report.md` — 47 Approved TCs ready for POM + spec scaffolding | After this summary is published |
| **Tech Lead Agent** | `review-report.md` VG-1 through VG-6 — needs additional visual captures + locator-map `customers` namespace verification | After this summary is published |
| **BA Agent** (re-entry) | After VG captures land — re-process the 10 Conditional TCs to upgrade them from Conditional → Approved | After Tech Lead Agent confirms INDEX.md extended |

---

## Gate Confirmations

| Gate | Status |
|------|--------|
| Visual gate (INDEX.md present) | PASS — FULL |
| BRD/FRD gate (source present) | PASS |
| Dual-source rule | PASS |
| LeadSquared exclusion | Honored — no LSQ credentials, no LSQ API references |
| Strapi exclusion | Honored — CMS sidebar item flagged as external and excluded |
| No undocumented features | PASS — every TC references a BRD/FRD section, or the visual-memory Key Structural Notes for selectors |
| Traceability (BRD/FRD Req ID per TC) | PASS — 59/59 |
| Locator Map | Not modified — Tech Lead Agent owned; populated `customers` namespace assumed present (Tech Lead Agent to confirm) |

---

## Notes

- Existing TCs at `manual-qa-repository/01-test-cases/admin-portal/customers/TC_CUSTOMERS.md` predate the canonical path convention. They are NOT modified or deprecated by this run — coordinate with QA Agent on whether to migrate / merge / archive the legacy `admin-portal/customers/` path in a follow-up cleanup task.
- All paths in TCs use forward-slash module-relative paths to match the dual-source rule examples in CLAUDE.md.
- Output is markdown (TestCases.md) rather than xlsx per the user's instruction in this Phase 1 invocation; conversion to TestCases.xlsx can be done by the QA Agent's report generator if needed for execution tracking.
