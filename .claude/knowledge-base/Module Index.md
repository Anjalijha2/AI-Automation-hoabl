---
type: index
tags: [index, modules, xr-portal]
updated: 2026-05-11
---

# XR Portal — Module Index

Master index of all modules. Each module has exactly ONE file under `Portals/Admin-Portal/Modules/`.

---

## How to Use This Knowledge Base

### Folder Structure

```
knowledge-base/
├── Master-BRD/
│   └── Master-Index.md                        ← full platform entry point
├── Portals/
│   ├── Admin-Portal/
│   │   ├── Admin-Portal-BRD.md                ← business requirements (BA/product view)
│   │   └── Modules/                           ← QA detail layer (one file per module)
│   │       ├── Module - Login.md
│   │       ├── Module - Customers.md
│   │       ├── Module - Config CMS.md
│   │       ├── Module - Sales Managers.md
│   │       ├── Module - Allocation.md
│   │       ├── Module - Towers.md
│   │       ├── Module - Channel Partners.md
│   │       ├── Module - JBP Management.md
│   │       ├── Module - Offers.md
│   │       └── Module - Payment Transactions.md
│   ├── SM-Portal/
│   │   └── SM-Portal-BRD.md
│   ├── CP-Portal/
│   │   └── CP-Portal-BRD.md
│   └── Buyer-Portal/
│       └── Buyer-Portal-BRD.md
├── Workflows/                                 ← cross-portal flows
│   ├── Allocation-Workflow.md
│   ├── Registration-Workflow.md
│   ├── Payment-Workflow.md
│   ├── KYC-Workflow.md
│   ├── Milestone-Payments.md
│   ├── Home-Loan-Workflow.md
│   ├── Callback-Request-Workflow.md
│   └── Support-Ticket-Module.md
├── Backend/Backend-Functional-BRD.md
├── CMS/CMS-Strapi-BRD.md
├── Realtime-Events/Realtime-Events-BRD.md
├── Status-Flows/Unit-Status-Flow.md
├── Roles-and-Permissions/Roles-and-Permissions.md
├── Integrations/Integrations.md
├── Business-Rules/Business-Rules.md
├── Glossary/Glossary.md
├── Open-Questions/Open-Questions.md
├── Sprint-Records/
│   ├── Sprint-5-Overview.md
│   └── Sprint-5-Pipeline-Status.md
├── Open Questions.md                          ← canonical open questions (root copy)
├── Module Index.md                            ← this file
├── Sprint 5 - Overview.md                     ← sprint record (root copy)
└── Sprint 5 - Pipeline Status.md             ← sprint record (root copy)
```

**Two-layer documentation model:**
- `Admin-Portal-BRD.md` — business requirements, written for BA/product/client audience
- `Modules/Module - X.md` — QA detail layer: selectors, TC IDs, spec file paths, automation status — written for QA engineers and automation agents

| File Pattern | Purpose |
|-------------|---------|
| `Portals/Admin-Portal/Modules/Module - [Name].md` | One file per admin module — selectors, TC IDs, business rules, automation status |
| `Portals/[Portal]/[Portal]-BRD.md` | Business requirements per portal |
| `Module Index.md` | This file — master navigation for QA layer |
| `Open Questions.md` | All resolved/unresolved clarifications across all modules |
| `Sprint X - *.md` | Sprint records — project history, do not delete |

### The 9-Section Standard for Module Files

Every `Module - [Name].md` follows this structure:

| Section | Content |
|---------|---------|
| 1. Overview | Business intent, URL, auth requirement, page object + selector file paths |
| 2. Navigation | How to reach the page from the portal sidebar |
| 3. Page Layout | All UI zones, elements, selectors, and component patterns |
| 4. Features | Functional capabilities (CRUD, filters, exports, etc.) |
| 5. Business Rules | Confirmed rules only — no assumptions; numbered list |
| 6. Integration Points | Which other modules this module reads from or writes to |
| 7. Domain Red Flags | Real estate domain risks flagged during BRD analysis, with severity |
| 8. Open Clarifications | Module-specific unresolved questions (also mirrored in `Open Questions.md`) |
| 9. Test Coverage | TC table with IDs, descriptions, and pass/fail/skip status |

### How to Find Open Questions

- **All questions in one place:** `Open Questions.md` — grouped by module and prioritized (CRITICAL / HIGH / MEDIUM / LOW)
- **Module-specific questions:** Section 8 of each `Module - [Name].md`
- **CRITICAL questions block TC writing** — do not write test cases for those areas until resolved

### How Sprint Records Differ from Module Docs

Module files (`Module - [Name].md`) are evergreen — they contain the permanent, accumulated knowledge about a module.

Sprint records (`Sprint 5 - Overview.md`, `Sprint 5 - Pipeline Status.md`) are time-bound — they capture what was done in a specific sprint. Do not delete sprint record files; they are project history.

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Module file | `Module - [Title Case Name].md` | `Module - Channel Partners.md` |
| TC IDs (hand-written) | `TC-MODULE-NNN` (hyphens) | `TC-CP-012` |
| TC IDs (agent-generated) | `TC_MODULE_TYPE_NNN` (underscores) | `TC_CFG_020` |
| Open questions | `Q-MODULE-NNN` | `Q-TXN-004` |
| Login spec only | `TC_POS_NNN`, `TC_NEG_NNN`, `TC_FUNC_NNN`, `TC_SEC_NNN` | `TC_NEG_007` |

---

## All Modules

All module files live under `Portals/Admin-Portal/Modules/`.

| Module | File | URL | Sprint | Status |
|--------|------|-----|--------|--------|
| Login | `Modules/Module - Login.md` | `/admin` | 1 | ✅ Automated — 22 tests pass |
| Customers | `Modules/Module - Customers.md` | `/admin/customers` | 1 | ✅ Automated — 17 tests pass |
| Config / CMS | `Modules/Module - Config CMS.md` | `/admin/cms` | 2 | ✅ Automated — 52 tests pass (ENV SKIPs expected) |
| Sales Managers | `Modules/Module - Sales Managers.md` | `/admin/sales-managers` | 2 | ✅ Automated — 9 tests pass |
| Allocation | `Modules/Module - Allocation.md` | `/admin/allocation` | 3 | ✅ Automated — 44 tests pass (ENV SKIPs for live gateway) |
| Towers | `Modules/Module - Towers.md` | `/admin/towers` | 3 | ✅ Automated — 13 tests pass |
| Channel Partners | `Modules/Module - Channel Partners.md` | `/admin/channel-partners` | 3 | ✅ Automated — 13 tests pass |
| JBP Management | `Modules/Module - JBP Management.md` | `/admin/jbp-management` | 3 | ✅ Automated — 4 tests pass |
| Offers | `Modules/Module - Offers.md` | `/admin/offers` | 4 | ✅ Automated — 12 tests pass |
| Payment Transactions | `Modules/Module - Payment Transactions.md` | `/admin/payment-transactions` | 5 | 🔄 BRD written — pipeline pending |

**Total automated tests: 178** (per `docs/test-coverage.md` — last updated 2026-05-08)

---

## Spec Files

| Spec File | Modules Covered |
|-----------|----------------|
| `tests/ui/login.spec.js` | Login |
| `tests/ui/customers.spec.js` | Customers |
| `tests/ui/config.spec.js` | Config CMS + Sales Managers (bulk upload) |
| `tests/ui/allocation.spec.js` | Allocation (admin + customer portal) |
| `tests/ui/towers.spec.js` | Towers |
| `tests/ui/channel-partners.spec.js` | Channel Partners |
| `tests/ui/jbp-management.spec.js` | JBP Management |
| `tests/ui/offers.spec.js` | Offers |

---

## Portal Navigation Map (10 sidebar items)

All paths relative to `Portals/Admin-Portal/Modules/`.

| Nav Item | Routes To | Module File | Scope |
|----------|-----------|-------------|-------|
| Customers | `/admin/customers` | `Module - Customers.md` | In scope |
| Config | `/admin/cms` | `Module - Config CMS.md` | In scope |
| Allocation | `/admin/allocation` | `Module - Allocation.md` | In scope |
| Offers | `/admin/offers` | `Module - Offers.md` | In scope |
| Towers | `/admin/towers` | `Module - Towers.md` | In scope |
| JBP Mgmt | `/admin/jbp-management` | `Module - JBP Management.md` | In scope |
| Channel Partners | `/admin/channel-partners` | `Module - Channel Partners.md` | In scope |
| Managers | `/admin/sales-managers` | `Module - Sales Managers.md` | In scope |
| Transactions | `/admin/payment-transactions` | `Module - Payment Transactions.md` | BRD only |
| CMS | `manage-uat.xrportal.in` | — | **OUT OF SCOPE** (external portal) |

---

## Open Questions

All open clarifications live in `Open Questions.md`. 30 questions listed in priority order across 7 modules. Some Q-IDs overlap (e.g. Q-CMS-001 and Q-SM-006 both address SM bulk upload merge key).

**CRITICAL (block TC writing):** Q-TXN-004, Q-TXN-005, Q-CMS-003, Q-CMS-004, Q-OFFERS-003

---

## Sprint Log

| Sprint | Modules | Status |
|--------|---------|--------|
| 1 | Login + Customers | ✅ Complete |
| 2 | Config/CMS (all 9 sections) + Sales Managers | ✅ Complete |
| 3 | Allocation + Towers + Channel Partners + JBP Management | ✅ Complete |
| 4 | Offers | ✅ Complete |
| 5 | Payment Transactions + (CMS full coverage) | 🔄 BRD written — pipeline gated on open questions |

---

## Knowledge Base File Inventory

### Root Level
| File | Type | Notes |
|------|------|-------|
| `Module Index.md` | Index | This file |
| `Open Questions.md` | Clarifications | All 30 questions — all resolved |
| `Sprint 5 - Overview.md` | Sprint record | Project history — do not delete |
| `Sprint 5 - Pipeline Status.md` | Sprint record | Project history — do not delete |

### Portals/Admin-Portal/Modules/ (QA detail layer)
| File | Sprint | Status |
|------|--------|--------|
| `Module - Login.md` | 1 | ✅ |
| `Module - Customers.md` | 1 | ✅ |
| `Module - Config CMS.md` | 2 | ✅ |
| `Module - Sales Managers.md` | 2 | ✅ |
| `Module - Allocation.md` | 3 | ✅ |
| `Module - Towers.md` | 3 | ✅ |
| `Module - Channel Partners.md` | 3 | ✅ |
| `Module - JBP Management.md` | 3 | ✅ |
| `Module - Offers.md` | 4 | ✅ |
| `Module - Payment Transactions.md` | 5 | 🔄 BRD only |

### Portals/ (BRD layer — BA/product audience)
| File | Notes |
|------|-------|
| `Admin-Portal/Admin-Portal-BRD.md` | 10 modules documented |
| `SM-Portal/SM-Portal-BRD.md` | Callback flow, physical allocation |
| `CP-Portal/CP-Portal-BRD.md` | Registration, JBP, commissions |
| `Buyer-Portal/Buyer-Portal-BRD.md` | Full buyer journey |

### Workflows/ (cross-portal flows)
| File | Coverage |
|------|---------|
| `Allocation-Workflow.md` | STATIC / DYNAMIC / PHYSICAL_EVENT |
| `Registration-Workflow.md` | Buyer + CP-initiated registration |
| `Payment-Workflow.md` | All payment types |
| `KYC-Workflow.md` | Document upload and verification |
| `Milestone-Payments.md` | Construction-linked milestone instalments |
| `Home-Loan-Workflow.md` | Easiloan integration + self-finance |
| `Callback-Request-Workflow.md` | SM video call flow + VC outcomes |
| `Support-Ticket-Module.md` | 4 ticket categories + OS Ticket integration |
