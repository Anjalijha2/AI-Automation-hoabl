# Changelog

All notable changes to the XR Portal QA Framework are documented here.

---

## [2026-03-14] — Sprint Manager Update

### Updated
- Test coverage report refreshed
- Sprint log and task tracker regenerated


## [2026-03-11] — Sprint 1

### Added
- Full Login test suite (18 tests): Positive, Negative, Functional, Security
- Customers test suite (6 tests): Layout, Stat Cards, Table, Refresh, Search
- `auth.setup.ts` for session caching (avoids repeated login)
- `playwright.config.ts` with login-tests and regression project separation
- All 8 Agent scripts under `agents/`
- Page Object Models: `login.page.ts`, `customers.page.ts`
- Manual test case docs: `manual-test-cases/TC_LOGIN.md`, `TC_CUSTOMERS.md`
- Page documentation: `docs/pages/LOGIN.md`, `docs/pages/CUSTOMERS.md`
- Defect tracker: `bugs/BUG_TRACKER.md`
- Test coverage report: `docs/test-coverage.md`

### Fixed
- Corrected `span.resend-otp-text` selector → text-based matcher
- Corrected timing issue in OTP auto-advance (TC_FUNC_003)
- Scoped Customers stat card selectors to avoid table row conflicts
