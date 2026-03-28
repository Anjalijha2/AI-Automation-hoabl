# Sprint Log

**Last updated:** 28/3/2026

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

**Goal:** Automate Config module test cases — Tower Configuration, Registration Status, Unit Status, Unit Cost Update, Bulk Booking/Reg Cancellation, Sales Managers, Customer Portal.

**Status:** ✅ Complete

### Completed
- [x] Transcribed Admin CMS manual test cases → `manual-test-cases/TC_ADMIN_CMS.md`
- [x] Added Section 10 integration tests (TC-1.1 to TC-1.6) to `TC_CONFIG.md`
- [x] Executed TC-1.1, TC-1.2 manually via browser agent — **both PASS**
- [x] Created Tower Config automation — 6 tests, all ✅ PASS
  - Fixed URL routing bug (`/cms` → `/admin/cms`)
  - Fixed locator bug (`.ant-card` → `.tower-configuration-section`)
  - Fixed TC-1.5 count assertion (exact 18 → ≥ 18)
- [x] Created Registration Status test cases (TC-2.1 to TC-2.7)
- [x] Executed TC-2.3, TC-2.6, TC-2.7 manually — PASS; TC-2.1, TC-2.2, TC-2.4, TC-2.5 ENV SKIP (campaign active on UAT)
- [x] Registration Status automation — TC_CFG_020–024 (5 upload flow tests, xlsx-based)
- [x] Logged **BUG_010** — No validation on empty Submit in Registration Status
- [x] Unit Status automation — TC_CFG_025–030 (6 tests: RESERVED↔AVAILABLE, Update flag, invalid status)
- [x] Unit Cost Update automation — TC_CFG_031–034 (4 tests: agreement value update, mixed rows, skip, invalid)
- [x] Bulk Booking Cancellation — TC_CFG_035–037 (3 tests: positive, non-existent, already-processed)
- [x] Bulk Registration Cancellation — TC_CFG_038–040 (3 tests: positive, Update=0 skip, invalid reg number)
- [x] Sales Managers — TC_CFG_041–048 (8 tests: add, unavailable, inactive, update email, search by name/phone, invalid phone, duplicate email)
- [x] Customer Portal — TC_CFG_049–053 (5 tests: full payment flow, failure, cancel, session timeout, GHNG reg verification)
- [x] Max Preferences — TC_CFG_007–010 (4 tests: update value, persist, change, click without change)
- [x] Customer Actions S1 — TC_CFG_011–013 (3 tests: disable/enable registrations, dropdown counts)
- [x] Sample Downloads — TC_CFG_014–019 (6 tests: one per upload section)
- [x] Merged all Config test cases into `docs/manual-test-cases/TC_CONFIG.md` (52 TCs total)

---

## Sprint 3 — Remaining Modules (Planned)

**Goal:** Expand coverage to Allocation, Towers, Channel Partners, JBP Management.

- [ ] Allocation module
- [ ] Towers module
- [ ] Channel Partners module
- [ ] JBP Management module
- [ ] Full regression suite + CI pipeline setup
