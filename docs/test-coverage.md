# Test Coverage Report

**Last updated:** 2026-04-14  
**Framework:** Playwright v1.58.2 · JavaScript · CommonJS · Page Object Model

---

## Coverage by Module

| Module | Spec File | Test IDs | Auto TCs | Status |
|--------|-----------|----------|----------|--------|
| **Login** | `tests/ui/login.spec.js` | TC-LGN-001 – 022 | 22 | ✅ Full |
| **Customers** | `tests/ui/customers.spec.js` | TC-CST-001 – 017 | 17 | ✅ Full |
| **Config — Tower Config** | `tests/ui/config.spec.js` | TC_CFG_001 – 006 | 6 | ✅ Full |
| **Config — Max Preferences** | `tests/ui/config.spec.js` | TC_CFG_007 – 010 | 4 | ✅ Full |
| **Config — Customer Actions** | `tests/ui/config.spec.js` | TC_CFG_011 – 013 | 3 | ✅ Full |
| **Config — Sample Downloads** | `tests/ui/config.spec.js` | TC_CFG_014 – 019 | 6 | ✅ Full |
| **Config — Registration Status** | `tests/ui/config.spec.js` | TC_CFG_020 – 024 | 5 | ✅ Automated (2 ENV SKIP) |
| **Config — Unit Status** | `tests/ui/config.spec.js` | TC_CFG_025 – 030 | 6 | ✅ Full |
| **Config — Unit Cost Update** | `tests/ui/config.spec.js` | TC_CFG_031 – 034 | 4 | ✅ Full |
| **Config — Bulk Booking Cancel** | `tests/ui/config.spec.js` | TC_CFG_035 – 037 | 3 | ✅ Full |
| **Config — Bulk Reg Cancel** | `tests/ui/config.spec.js` | TC_CFG_038 – 040 | 3 | ✅ Full (1 ENV SKIP) |
| **Config — Sales Managers** | `tests/ui/config.spec.js` | TC_CFG_041 – 048 | 8 | ✅ Full |
| **Config — Customer Portal** | `tests/ui/config.spec.js` | TC_CFG_049 – 053 | 5 | ✅ Full (ENV SKIP on UAT) |
| **Allocation** | `tests/ui/allocation.spec.js` | SETUP-01–03, TC-ADM-001–010, TC-CST-001–030 | 44 | ✅ Full (ENV SKIP on live gateway) |
| **Towers** | `tests/ui/towers.spec.js` | TC-TWR-001 – 013 | 13 | ✅ Full |
| **Channel Partners** | `tests/ui/channel-partners.spec.js` | TC-CP-001–006, 008–012 | 13 | ✅ Full |
| **JBP Management** | `tests/ui/jbp-management.spec.js` | TC-JBP-001 – 004 | 4 | ✅ Full |

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Automated Tests** | **166** |
| **Modules Covered** | 7 (Login, Customers, Config, Allocation, Towers, Channel Partners, JBP Mgmt) |
| **ENV SKIP guards** | ~8 (UAT-state-dependent — expected, not bugs) |
| **Open Bugs** | 1 (BUG_010) |

---

## Sprint Progress

| Sprint | Modules | Status |
|--------|---------|--------|
| Sprint 1 | Login, Customers | ✅ Complete |
| Sprint 2 | Config (all sub-sections) | ✅ Complete |
| Sprint 3 | Allocation, Towers, Channel Partners, JBP Management | ✅ Complete |

---

## Known Open Bugs

| Bug ID | Module | Severity | Status | Description |
|--------|--------|----------|--------|-------------|
| BUG_010 | Config — Registration Status | Medium | 🔴 Open | No validation shown when Submit clicked without file selected |
