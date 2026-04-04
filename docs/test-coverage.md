# Test Coverage Report

**Last updated:** 04/4/2026
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
| Allocation | 44 | 44 (SETUP-01–03, TC-ADM-001–010, TC-ADM-PHASE8, TC-CST-001–030) | `allocation.spec.js` | ✅ Automated (ENV SKIP guards on UAT/live gateway flows) |
| Towers | 13 | 13 (TC-TWR-001–013) | `towers.spec.js` | ✅ Full Coverage |
| Channel Partners | — | — | `—` | ⏳ Not Started |
| JBP Management | — | — | `—` | ⏳ Not Started |

---

**Summary:** 151 manual test cases | 151 automated | Sprint 1 ✅ · Sprint 2 ✅ · Sprint 3 Allocation ✅ · Sprint 3 Towers ✅ | 2 modules pending (Channel Partners, JBP Mgmt)

---

## Known Open Bugs

| Bug ID | Module | Severity | Status | Description |
|--------|--------|----------|--------|-------------|
| BUG_010 | Config — Registration Status | Medium | 🔴 Open | No validation shown when Submit clicked without file selected |
