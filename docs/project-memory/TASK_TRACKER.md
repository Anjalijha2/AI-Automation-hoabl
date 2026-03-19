# Task Tracker

**Maintained by:** Agent 7 — Sprint & Knowledge Manager

---

## ✅ Completed Tasks

| Task | Module | Agent | Status |
|------|--------|-------|--------|
| Project setup | All | Setup | ✅ Done |
| Auth session caching | Login | Agent 3 | ✅ Done |
| Login automation (18 tests) | Login | Agent 3 | ✅ Done |
| Customers automation (17 tests) | Customers | Agent 3 | ✅ Done |
| Page Documentation | Login, Customers, Config (partial) | Agent 1 | ✅ Done |
| Manual Test Cases | Login, Customers | Agent 2 | ✅ Done |
| All 8 Agent scripts created | Framework | Agent 7 | ✅ Done |
| BRD received — Config module | Config | Agent 7 | ✅ Done |
| Discovery crawler — Config page (/admin/cms) | Config | Agent 0 | ✅ Done |
| CONFIG.md + config.json selectors | Config | Agent 1 | ✅ Done |
| TC_CONFIG.md (52 manual TCs) | Config | Agent 2 | ✅ Done |
| config.page.ts + config.spec.ts (19 TCs) | Config | Agent 3 | ✅ Done |
| Config Sprint 1 execution — 19/19 passing | Config | Agent 4 | ✅ Done |

---

## ✅ Completed — Sprint 1: Config Module (19/19 passing)

### Sprint 1 Scope (19 TCs automatable now)

| TC# | Section | Test Case | Priority |
|-----|---------|-----------|----------|
| TC_CFG_001 | Tower Configuration | Deactivate active tower + save | P1 |
| TC_CFG_002 | Tower Configuration | Activate inactive tower + save | P1 |
| TC_CFG_003 | Tower Configuration | Toggle persists after refresh | P1 |
| TC_CFG_004 | Tower Configuration | Toggle reverts without save | P1 |
| TC_CFG_005 | Tower Configuration | View Tower link navigates | P2 |
| TC_CFG_006 | Tower Configuration | Verify active tower count | P2 |
| TC_CFG_007 | Max Preferences | Update value + verify toast | P1 |
| TC_CFG_008 | Max Preferences | Value persists after refresh | P1 |
| TC_CFG_009 | Max Preferences | Change to different value | P1 |
| TC_CFG_010 | Max Preferences | Update without change | P2 |
| TC_CFG_011 | Customer Actions Card | Disable toggle + submit | P1 |
| TC_CFG_012 | Customer Actions Card | Enable toggle + submit (restore) | P1 |
| TC_CFG_013 | Customer Actions Card | Change bed type counts + submit | P2 |
| TC_CFG_014 | Registration Status | Sample file downloads (columns OK) | P1 |
| TC_CFG_015 | Unit Status | Sample file downloads (columns OK) | P1 |
| TC_CFG_016 | Unit Cost Update | Inventory file downloads (columns OK) | P1 |
| TC_CFG_017 | Bulk Booking Cancellation | Sample file downloads | P1 |
| TC_CFG_018 | Bulk Registration Cancellation | Sample file downloads | P1 |
| TC_CFG_019 | Sales Managers | Sample file downloads | P1 |

### Deferred — Sprint 2 (33 TCs)

| Section | TCs Deferred | Reason |
|---------|-------------|--------|
| Registration Status | TC-2.1 to TC-2.6 | Upload modifies live data; needs safe test data set |
| Unit Status | TC-3.1 to TC-3.4, TC-3.6 | Upload modifies unit state |
| Unit Cost Update | TC-4.1 to TC-4.4 | Upload modifies pricing |
| Bulk Booking Cancellation | TC-5.1 to TC-5.3 | Cancels real bookings |
| Bulk Registration Cancellation | TC-6.1 to TC-6.3 | Cancels real registrations |
| Sales Managers | TC-7.1 to TC-7.8 | Creates/modifies user accounts |
| Customer Actions Card | TC-8.3, TC-8.5-8.8 | Easebuzz payment gateway; full Customer Portal cross-portal flow |

---

## ⏳ Pending Tasks

| Task | Module | Priority | Agent |
|------|--------|----------|-------|
| **BRD needed** — Allocation module | Allocation | P1 | Agent 7 |
| **BRD needed** — Towers module | Towers | P2 | Agent 7 |
| **BRD needed** — Channel Partners | Channel Partners | P2 | Agent 7 |
| **BRD needed** — JBP Management | JBP Mgmt | P3 | Agent 7 |
| Config Sprint 2 — upload tests | Config | P1 | Agent 3 |
| Config Sprint 2 — cross-portal (Customer Portal) | Config | P1 | Agent 3 |
| Automate Allocation module | Allocation | P1 | Agent 3 |
| Automate Towers module | Towers | P2 | Agent 3 |
| Automate Channel Partners | Channel Partners | P2 | Agent 3 |
| Automate JBP Management | JBP Mgmt | P3 | Agent 3 |
| Integration / Regression Suite | All | P1 | Agent 4 |
