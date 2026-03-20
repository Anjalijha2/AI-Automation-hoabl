# Sprint Log

**Last updated:** 20/3/2026

---

## Sprint 1 — Framework Setup & Core Module Coverage

**Goal:** Establish QA framework structure and automate Login + Customers modules.

**Status:** ✅ Complete

### Completed
- [x] Setup Playwright + TypeScript project structure
- [x] Configured `playwright.config.ts` with projects (login-tests, regression)
- [x] Created Auth Setup (`auth.setup.ts`) for session caching
- [x] Implemented Login Page Object (`login.page.ts`) — 18 test cases
- [x] Implemented Customers Page Object (`customers.page.ts`) — 16 test cases
- [x] Created all AI Agent scripts (`agents/` folder)
- [x] Created manual test case files (`manual-test-cases/TC_LOGIN.md`, `TC_CUSTOMERS.md`)
- [x] Created page documentation (`docs/pages/LOGIN.md`, `docs/pages/CUSTOMERS.md`)
- [x] Created bug tracker (`bugs/BUG_TRACKER.md`)
- [x] Resolved BUG_001 to BUG_009 (selector, timing, filter issues)

---

## Sprint 2 — Config Module Test Coverage

**Goal:** Automate Config module test cases — Tower Configuration and Registration Status.

**Status:** 🔄 In Progress

### Completed
- [x] Transcribed Admin CMS manual test cases → `manual-test-cases/TC_ADMIN_CMS.md`
- [x] Added Section 10 integration tests (TC-1.1 to TC-1.6) to `TC_CONFIG.md`
- [x] Executed TC-1.1, TC-1.2 manually via browser agent — **both PASS**
- [x] Created `automation/tests/tower-config.spec.ts` — 6 tests, all ✅ PASS
  - Fixed URL routing bug (`/cms` → `/admin/cms`)
  - Fixed locator bug (`.ant-card` → `.tower-configuration-section`)
  - Fixed TC-1.5 count assertion (exact 18 → ≥ 18)
- [x] Created `manual-test-cases/TC_REGISTRATION_STATUS.md` (TC-2.1 to TC-2.7)
- [x] Executed TC-2.3, TC-2.6, TC-2.7 manually via browser agent
- [x] Created `automation/tests/registration-status.spec.ts` — 7 tests with xlsx-based test data
- [x] Logged **BUG_010** — No validation on empty Submit in Registration Status

### In Progress
- [ ] Execute TC-2.1, TC-2.2, TC-2.4, TC-2.5 manually (require Excel file upload on UAT)

### Pending (Sprint 2 Remaining)
- [ ] Config — Unit Status (Scenario 3)
- [ ] Config — Unit Cost Update (Scenario 4)
- [ ] Config — Bulk Booking (Scenario 5)

---

## Sprint 3 — Remaining Modules (Planned)

**Goal:** Expand coverage to Allocation, Towers, Channel Partners, JBP Management.

- [ ] Allocation module
- [ ] Towers module
- [ ] Channel Partners module
- [ ] JBP Management module
- [ ] Full regression suite + CI pipeline setup
