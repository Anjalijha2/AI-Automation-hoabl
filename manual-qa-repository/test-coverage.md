# Test Coverage

**Project:** XR Portal Admin  
**Last Updated:** 2026-05-16

---

## Coverage by Portal

| Portal | Documentation | Manual TCs | TC Count | Automation | Pass Rate | Status |
|--------|--------------|------------|----------|------------|-----------|--------|
| Login | ⏳ Pending | ✅ Written | 22 | ⏳ Pending | — | Sprint 1 |
| Customers | ⏳ Pending | ⏳ Pending | 0 | ⏳ Pending | — | Sprint 4 |
| Towers | ⏳ Pending | ⏳ Pending | 0 | ⏳ Pending | — | Sprint 2 |
| Allocation | ⏳ Pending | ⏳ Pending | 0 | ⏳ Pending | — | Sprint 2 |
| Config/CMS | ⏳ Pending | ⏳ Pending | 0 | ⏳ Pending | — | Sprint 3 |
| Channel Partners | ⏳ Pending | ⏳ Pending | 0 | ⏳ Pending | — | TBD |
| JBP | ⏳ Pending | ⏳ Pending | 0 | ⏳ Pending | — | TBD |
| Offers | ⏳ Pending | ⏳ Pending | 0 | ⏳ Pending | — | TBD |
| Admin CMS | ⏳ Pending | ⏳ Pending | 0 | ⏳ Pending | — | TBD |

---

## Coverage by Sprint

| Sprint | Portal | Total TCs | Automated | Pass Rate | Notes |
|--------|--------|-----------|-----------|-----------|-------|
| Sprint 1 | Login | 22 | 0 | — | TCs written; automation pending |
| Sprint 2 | Towers + Allocation | 0 | 0 | — | TCs pending |
| Sprint 3 | Config/CMS | 0 | 0 | — | TCs pending |
| Sprint 4 | Customers | 0 | 0 | — | Not started |

---

## TC Type Coverage (Login — Sprint 1)

| Type | Count | Notes |
|------|-------|-------|
| UI | 3 | Layout, element visibility, responsive |
| FUNC | 4 | OTP flow, session, logout |
| VAL | 5 | Mobile/OTP field validation |
| NEG | 3 | Unregistered mobile, wrong OTP, direct URL |
| EDGE | 3 | Spaces, boundary digits, multiple clicks |
| BIZ | 2 | Admin-only, OTP expiry |
| E2E | 2 | Full login/logout flow, auth-setup flow |
| **Total** | **22** | |
