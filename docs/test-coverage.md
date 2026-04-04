# Test Coverage Report

<<<<<<< HEAD
**Last updated:** 04/4/2026
=======
**Last updated:** 29/3/2026
>>>>>>> c4c0485 (docs(sprint3): Update CHANGELOG, SPRINT_LOG, TASK_TRACKER, test-coverage + fix playwright.config customer project storageState)
**Maintained by:** Agent 7 — Sprint & Knowledge Manager

---

| Feature | Manual TCs | Automated | Spec File | Status |
|---------|-----------|-----------|-----------|--------|
| Login | 22 | 22 | `login.spec.js` | ✅ Full Coverage |
| Customers | 17 | 17 | `customers.spec.js` | ✅ Full Coverage |
| Config — Tower Configuration | 6 | 6 (TC_CFG_001–006) | `config.spec.js` | ✅ Full Coverage |
| Config — Max Preferences | 4 | 4 (TC_CFG_007–010) | `config.spec.js` | ✅ Full Coverage |
| Config — Customer Actions | 3 | 3 (TC_CFG_011–013) | `config.spec.js` | ✅ Full Coverage |
| Config — Sample Downloads | 6 | 6 (TC_CFG_014–019) | `config.spec.js` | ✅ Full Coverage |
| Config — Registration Status | 7 | 7 (TC_CFG_020–024 + TC-2.3/2.6/2.7) | `config.spec.js` | ✅ Automated (2 ENV SKIP on UAT) |
| Config — Unit Status | 6 | 6 (TC_CFG_025–030) | `config.spec.js` | ✅ Full Coverage |
| Config — Unit Cost Update | 4 | 4 (TC_CFG_031–034) | `config.spec.js` | ✅ Full Coverage |
| Config — Bulk Booking Cancellation | 3 | 3 (TC_CFG_035–037) | `config.spec.js` | ✅ Full Coverage |
| Config — Bulk Reg Cancellation | 3 | 3 (TC_CFG_038–040) | `config.spec.js` | ✅ Full Coverage |
| Config — Sales Managers | 8 | 8 (TC_CFG_041–048) | `config.spec.js` | ✅ Full Coverage |
| Config — Customer Portal | 5 | 5 (TC_CFG_049–053) | `config.spec.js` | ✅ Full Coverage (ENV SKIP on UAT) |
<<<<<<< HEAD
| Allocation — Admin Campaign Mgmt | 11 | 11 (SETUP-01–03, TC-ADM-001–007, TC-ADM-PHASE8) | `allocation.spec.js` | ✅ Automated (TC-ADM-008, 010 ENV SKIP) |
| Allocation — Customer Flow | 34 | 34 (TC-CST-001–031) | `allocation.spec.js` | ✅ Automated (TC-CST-009, 013, 016, 028 ENV SKIP/Manual) |
=======
| Allocation — Setup & Admin Campaign | 9 | 9 (SETUP-01–03, TC-ADM-001–006) | `allocation.spec.js` | ✅ Automated |
| Allocation — Admin Stop/Complete/Filter | 4 | 4 (TC-ADM-007–010) | `allocation.spec.js` | ✅ Automated (conditional skip) |
| Allocation — Customer Login & Home | 3 | 3 (TC-CST-001–003) | `allocation.spec.js` | ✅ Automated |
| Allocation — Allotment & Unit Selection | 10 | 10 (TC-CST-004–013) | `allocation.spec.js` | ✅ Automated (ENV SKIP when no active campaign) |
| Allocation — Payment | 3 | 3 (TC-CST-014–016) | `allocation.spec.js` | ✅ Automated (TC-016 manual — requires live gateway) |
| Allocation — KYC | 7 | 7 (TC-CST-017–023) | `allocation.spec.js` | ✅ Automated (ENV SKIP when no payment) |
| Allocation — Post-Booking Home & Milestones | 5 | 5 (TC-CST-024–028) | `allocation.spec.js` | ✅ Automated (ENV SKIP when no booking) |
| Allocation — Post-Campaign Verification | 3 | 3 (TC-CST-029–031) | `allocation.spec.js` | ✅ Automated (ENV SKIP when no booking) |
>>>>>>> c4c0485 (docs(sprint3): Update CHANGELOG, SPRINT_LOG, TASK_TRACKER, test-coverage + fix playwright.config customer project storageState)
| Towers | — | — | `—` | ⏳ Not Started |
| Channel Partners | — | — | `—` | ⏳ Not Started |
| JBP Management | — | — | `—` | ⏳ Not Started |

---

<<<<<<< HEAD
**Summary:** 136 manual test cases | 136 automated | Sprint 1 ✅ · Sprint 2 ✅ · Sprint 3 Allocation ✅ | 3 modules pending (Towers, Channel Partners, JBP Mgmt)
=======
**Summary:** 138 manual test cases | 138 automated | Sprint 1 ✅ · Sprint 2 ✅ · Sprint 3 🔄 In Progress | Allocation ✅ · Towers / Channel Partners / JBP pending
>>>>>>> c4c0485 (docs(sprint3): Update CHANGELOG, SPRINT_LOG, TASK_TRACKER, test-coverage + fix playwright.config customer project storageState)

---

## Known Open Bugs

| Bug ID | Module | Severity | Status | Description |
|--------|--------|----------|--------|-------------|
| BUG_010 | Config — Registration Status | Medium | 🔴 Open | No validation shown when Submit clicked without file selected |
