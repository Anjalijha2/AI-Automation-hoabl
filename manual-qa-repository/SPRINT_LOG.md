# Sprint Log

**Project:** XR Portal Admin  
**Model:** Sprint-wise · Portal-wise · Documentation → Test Cases → Automation

---

## Active Sprints

| Sprint | Portal | Phase | Status | Start | Target End |
|--------|--------|-------|--------|-------|-----------|
| Sprint 1 | Login | Phase 3 — Automation | In Progress | 2026-02-10 | TBD |

---

## Completed Sprints

### Sprint 3 — Config / CMS
| Phase | Status | Date |
|-------|--------|------|
| Phase 1: Documentation | ✅ | 2026-04-01 |
| Phase 2: Manual TCs | ⏳ Pending BA sign-off | — |
| Phase 3: Automation | ⏳ Pending TCs | — |

Bugs: BUG_009 (closed)

---

### Sprint 2 — Towers + Allocation
| Phase | Status | Date |
|-------|--------|------|
| Phase 1: Documentation | ✅ | 2026-03-01 |
| Phase 2: Manual TCs | ⏳ Pending BA sign-off | — |
| Phase 3: Automation | ⏳ Pending TCs | — |

Bugs: BUG_005, BUG_006, BUG_007, BUG_008 (all closed)

---

### Sprint 1 — Login
| Phase | Status | Date |
|-------|--------|------|
| Phase 1: Documentation | ✅ | 2026-02-10 |
| Phase 2: Manual TCs | ✅ BA Approved | 2026-05-16 |
| Phase 3: Automation | ⏳ In Progress | — |

TCs: 22 (in `01-test-cases/login/TC_LOGIN.md`)  
Bugs: BUG_001, BUG_002 (both closed)

---

## Sync Pipeline Runs

### Sync Run — 2026-05-21 (Step 3 — QA Agent Manual)

**Trigger:** Step 1 (Tech Lead) v1.3.4 → v1.4.0 locator map · Step 2 (BA) sign-off (8 modules cleared, 1 deferred)

**Locator corrections applied to manual TCs:**
1. `customers.colHomeLoan` — column header "Home Loan" → "Home Loan Details". Existing TC_CUSTOMERS.md already used "Home Loan Details" at the column-listing step; no functional change needed.
2. `customers.colConfirmationNumber` — column header "Confirmation Number" → "Confirmation". TC_CUSTOMERS.md ADM_CUST_007 expected result updated (removed duplicate "Confirmation Number" listing; clarified column header is "Confirmation"). All other "Confirmation" references in filter/value test steps already align.
3. `customers.tableRecordsHeading` — selector strengthening (h3.table-title primary). No manual TC text change required (text "Total Registered Records" remains a behavioural assertion, unchanged).

**Modules covered (BA-cleared 8/9):**
| Module | TC File Present | TC Aligned with Locator Map v1.4.0 |
|--------|-----------------|-----------------------------------|
| admin-cms | ✅ TC_ADMIN_CMS.md / .xlsx | ✅ no drift (no customers-column references) |
| towers | ✅ TC_TOWERS.md / .xlsx | ✅ no drift |
| jbp | ✅ TC_JBP.md / .xlsx | ✅ no drift |
| offers | ✅ TC_OFFERS.md / .xlsx | ✅ no drift |
| payment-transactions | ✅ TC_PAYMENT_TRANSACTIONS.md (no .xlsx) | ✅ no drift — .xlsx gap noted |
| sales-managers | ✅ TC_SALES_MANAGERS.md (no .xlsx) | ✅ no drift — .xlsx gap noted |
| allocation | ✅ TC_ALLOCATION.md / .xlsx | ✅ no drift |
| channel-partners | ✅ TC_CHANNEL_PARTNERS.md (no .xlsx) | ✅ no drift — .xlsx gap noted |
| customers (already-mapped) | ✅ TC_CUSTOMERS.md / .xlsx | ✅ updated (ADM_CUST_007) |

**Module deferred:**
- `milestone` — GAP-001 in ba-signoff.md. No standalone BRD/FRD/FS. No TC folder exists in manual-qa-repository. Deferred until product/BA confirms scope. NOT created this sync (would require new-sprint instruction).

**Gaps logged (informational, not blockers):**
- 3 modules have markdown TC files but no .xlsx counterpart (payment-transactions, sales-managers, channel-partners). Recommended for next sprint pass to generate .xlsx via `manual-tester` skill so they match the format of other admin modules.
- `milestone` standalone admin screen has no TC folder and no BRD/FRD — awaiting product clarification (GAP-001).

**Files modified this step:**
- `manual-qa-repository/01-test-cases/admin-portal/customers/TC_CUSTOMERS.md` (ADM_CUST_007 expected result line)
- `manual-qa-repository/SPRINT_LOG.md` (this entry)

**Files NOT modified (out of scope per Step 3 boundary):**
- specs, POMs, playwright.config.js, locator maps, TC .xlsx files (no .xlsx editing tooling invoked — markdown source is canonical)
- No new TC rows added for uncovered modules — per instructions, new-sprint authoring requires explicit user instruction.

**Pipeline status:** Step 3 complete — clear to proceed to Step 4 (QA Agent Automation).

---

## Sprint Template

```
Sprint N — <Portal Name>
  Phase 1: Portal Documentation     ⏳ / ✅
  Phase 2: Manual Test Cases         ⏳ / ✅  (BA sign-off required)
  Phase 3: Automation Scripts        ⏳ / ✅
  Bugs: BUG_NNN, ...
```
