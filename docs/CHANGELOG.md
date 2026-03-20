# Changelog

All notable changes to the XR Portal QA Framework are documented here.

---

## [2026-03-20] — Sprint 2 (Config Module)

### Added
- **Tower Configuration Integration Tests** (TC-1.1 to TC-1.6) in `manual-test-cases/TC_CONFIG.md` Section 10
- **Playwright automation** for Tower Config: `automation/tests/tower-config.spec.ts` (6 tests — all PASS ✅)
- **Registration Status Test Cases** (TC-2.1 to TC-2.7): `manual-test-cases/TC_REGISTRATION_STATUS.md`
- **Playwright automation** for Registration Status: `automation/tests/registration-status.spec.ts` (7 tests)
- **TC_ADMIN_CMS.md** — manual test cases for Admin CMS module (Tower Config, Registration Status, Unit Status, Unit Cost)
- **BUG_010** — Missing client-side validation when Submit clicked without a file (Config → Registration Status)
- **DOM inspection script** (`scripts/inspect-towers.js`) to identify correct CSS selectors for tower cards

### Fixed
- **URL routing bug** — Playwright tests were navigating to `/cms` instead of `/admin/cms`, causing "Access restricted" page
- **Locator bug** — Tests used `.ant-card` class which doesn't exist on UAT; fixed to `.tower-configuration-section`
- **TC-1.5 count assertion** — UAT returns 19 towers; updated assertion to `>= 18` to be data-resilient
- **`waitForNetworkIdle`** — Added to all Config test `beforeEach` hooks to ensure API data is loaded before assertions

### Changed
- Updated `.env` with real UAT credentials for automated test execution
- Updated `test-coverage.md` to reflect Sprint 2 coverage (47 TCs, Config module added)
- Updated `execution-summary.md` with full Sprint 2 results
- Updated `TASK_TRACKER.md` and `SPRINT_LOG.md` to mark Config module tasks as in progress

---

## [2026-03-14] — Sprint 1

### Added
- Full Login test suite (18 tests): Positive, Negative, Functional, Security
- Customers test suite (16 tests): Layout, Stat Cards, Table, Refresh, Search, Filters
- `auth.setup.ts` for session caching (avoids repeated login)
- `playwright.config.ts` with login-tests and regression project separation
- All AI Agent scripts under `agents/`
- Page Object Models: `login.page.ts`, `customers.page.ts`
- Manual test case docs: `manual-test-cases/TC_LOGIN.md`, `TC_CUSTOMERS.md`
- Page documentation: `docs/pages/LOGIN.md`, `docs/pages/CUSTOMERS.md`
- Defect tracker: `bugs/BUG_TRACKER.md` (BUG_001 to BUG_009)
- Test coverage report: `docs/test-coverage.md`

### Fixed
- Corrected `span.resend-otp-text` selector → text-based matcher
- Corrected timing issue in OTP auto-advance (TC_FUNC_003)
- Scoped Customers stat card selectors to avoid table row conflicts
