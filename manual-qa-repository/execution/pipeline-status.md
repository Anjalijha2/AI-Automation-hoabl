# Pipeline Status

**Last Updated:** 2026-05-08  
**Updated By:** BA Agent  
**Active Sprint:** Sprint 5 — New Modules BRD (Offers, Sales Managers, Payment Transactions, CMS/Config)

---

## Sprint 5 Gate Status

| Gate | Description | Status | Timestamp | Notes |
|------|-------------|--------|-----------|-------|
| G0 | BRD received / module identified | PASSED | 2026-05-08 | 4 uncovered modules identified via portal exploration |
| G1 | BRD documents created | PASSED | 2026-05-08 | brd/offers.md, brd/sales-managers.md, brd/payment-transactions.md, brd/cms-config.md |
| G2 | Before Manual QA P1 (Discovery) | PENDING | — | Awaiting Manual QA agent trigger |
| G3 | Before Manual QA P2 (Screen Docs) | GATED | — | Requires docs/selectors/<module>.json to exist |
| G4 | Before Manual QA P3 (Test Cases) | GATED | — | Requires screen docs complete + clarifications resolved |
| G5 | Before Automation QA P1 (Scripts) | GATED | — | Requires TC file + USER approval |
| G6 | Before Automation QA P2 (Execution) | GATED | — | Requires spec compiles without errors |
| G7 | Before Manual QA P4 (Defects) | GATED | — | Requires failures in reports/results.json |
| G8 | Before Automation QA P3 (Healing) | GATED | — | Requires new Open bugs in BUG_TRACKER.md |

---

## Current Active Phase

**Phase:** BRD Analysis Complete — awaiting user decision on next phase

**Next Authorized Action:** User must review BRDs and confirm which module to prioritize for sprint pipeline execution (Manual QA Phase 1 — Discovery).

---

## Modules in Sprint 5

| Module | BRD File | Selector File | Screen Doc | Test Cases | Spec File | Status |
|--------|----------|--------------|------------|------------|-----------|--------|
| Offers | brd/offers.md | NOT YET | NOT YET | NOT YET | NOT YET | BRD Draft |
| Sales Managers | brd/sales-managers.md | NOT YET | NOT YET | NOT YET | NOT YET | BRD Draft |
| Payment Transactions | brd/payment-transactions.md | NOT YET | NOT YET | NOT YET | NOT YET | BRD Draft |
| CMS / Config | brd/cms-config.md | NOT YET | NOT YET | NOT YET | NOT YET | BRD Draft |

---

## Open Blockers

| Blocker ID | Module | Description | Impact |
|-----------|--------|-------------|--------|
| CLARIFICATION-OFFERS-001 | Offers | Search/filter capability planned? | TC scope |
| CLARIFICATION-OFFERS-002 | Offers | Offer Name uniqueness required? | Validation TC |
| CLARIFICATION-OFFERS-003 | Offers | Toggle OFF mid-allocation — re-prices customer? | Critical integration TC |
| CLARIFICATION-OFFERS-004 | Offers | Offer End Date passes mid-booking — behavior? | Edge case TC |
| CLARIFICATION-OFFERS-005 | Offers | Delete confirmation dialog text? | Delete TC |
| CLARIFICATION-OFFERS-006 | Offers | Full typology dropdown values list? | Test data |
| CLARIFICATION-SM-001 | Sales Mgrs | Email uniqueness per SM? | Validation TC |
| CLARIFICATION-SM-002 | Sales Mgrs | Settings auto-save or requires Save button? | Settings TC |
| CLARIFICATION-SM-003 | Sales Mgrs | Full Role dropdown values? | Test data |
| CLARIFICATION-SM-004 | Sales Mgrs | SM vs Channel Partner relationship? | Integration scope |
| CLARIFICATION-SM-005 | Sales Mgrs | SM bulk CSV column headers? | Bulk upload TC |
| CLARIFICATION-SM-006 | Sales Mgrs | Settings changes audit-logged? | Security TC |
| CLARIFICATION-TXN-001 | Transactions | Export format + scope? | Export TC |
| CLARIFICATION-TXN-002 | Transactions | Payment Type values beyond Allocation? | Filter TC |
| CLARIFICATION-TXN-003 | Transactions | How are offline payments entered? | Offline TC |
| CLARIFICATION-TXN-004 | Transactions | Disabling gateway mid-session — pending orders? | Integration TC |
| CLARIFICATION-TXN-005 | Transactions | Guard against disabling all gateways? | Config TC |
| CLARIFICATION-TXN-006 | Transactions | Page size dropdown options? | Pagination TC |
| CLARIFICATION-TXN-007 | Transactions | Transaction detail view ETA? | Detail TC gated |
| CLARIFICATION-CMS-001 | CMS | SM bulk upload merge key? | SM bulk TC |
| CLARIFICATION-CMS-002 | CMS | Max Preferences: system-wide vs per-campaign? | Preferences TC |
| CLARIFICATION-CMS-003 | CMS | Bulk Booking Cancel → auto-refund? | Cancellation TC |
| CLARIFICATION-CMS-004 | CMS | Bulk Reg Cancel → auto-refund? | Cancellation TC |
| CLARIFICATION-CMS-005 | CMS | Unit Status CSV valid Status values? | Unit Status TC |
| CLARIFICATION-CMS-006 | CMS | Registration Status CSV case-sensitive? | Validation TC |
| CLARIFICATION-CMS-007 | CMS | Bulk Booking Cancel CSV headers? | Cancellation TC |
| CLARIFICATION-CMS-008 | CMS | Bulk Reg Cancel CSV headers? | Cancellation TC |
| CLARIFICATION-CMS-009 | CMS | Reducing Max Preferences below existing count? | Edge case TC |
| CLARIFICATION-CMS-010 | CMS | Bulk upload error format? | Error handling TC |

---

## Previous Sprints Summary

| Sprint | Modules | Status |
|--------|---------|--------|
| Sprint 1 | Login, Customers | Complete — all tests passing |
| Sprint 2 | Config/CMS (tower-config, registration-status) | Complete |
| Sprint 3 | Allocation (Static), Towers | Complete |
| Sprint 4 | Channel Partners (TC-CP-001 to TC-CP-012), JBP Management | Complete |
| Sprint 5 | Offers, Sales Managers, Payment Transactions, CMS/Config (full) | BRD Phase |
