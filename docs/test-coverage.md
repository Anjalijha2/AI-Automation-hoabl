# Test Coverage Report

**Last updated:** 20/3/2026  
**Maintained by:** Agent 7 — Sprint & Knowledge Manager

---

| Feature | Manual TCs | Automated | Spec File | Status |
|---------|-----------|-----------|-----------|--------|
| Login | 18 | 18 | `login.spec.ts` | ✅ Full Coverage |
| Customers | 16 | 16 | `customers.spec.ts` | ✅ Full Coverage |
| Config — Tower Configuration | 6 integration | 6 | `tower-config.spec.ts` | ✅ Automated (TC-1.1 to TC-1.6) |
| Config — Registration Status | 7 integration | 7 | `registration-status.spec.ts` | ✅ Automated (TC-2.1 to TC-2.7) |
| Config — Unit Status | — | — | `—` | ⏳ Planned |
| Config — Unit Cost Update | — | — | `—` | ⏳ Planned |
| Config — Bulk Booking | — | — | `—` | ⏳ Planned |
| Allocation | — | — | `—` | ⏳ Not Started |
| Towers | — | — | `—` | ⏳ Not Started |
| Channel Partners | — | — | `—` | ⏳ Not Started |
| JBP Management | — | — | `—` | ⏳ Not Started |

---

**Summary:** 47 total manual test cases | 47 automated | 7 modules pending

---

## Known Open Bugs

| Bug ID | Module | Severity | Status | Description |
|--------|--------|----------|--------|-------------|
| BUG_010 | Config — Registration Status | Medium | 🔴 Open | No validation shown when Submit clicked without file selected |
