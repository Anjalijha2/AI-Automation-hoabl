# Changelog

All notable changes to the XR Portal QA Framework are documented here.

---

<<<<<<< HEAD
## [2026-04-04] — Sprint 3 Allocation Complete

### Added
- **Allocation module — Admin (Phase 0–1, 8, 10):** SETUP-01–03, TC-ADM-001–010, TC-ADM-PHASE8 (11 tests)
  - Campaign create/validate/start/stop/filter/view
  - Phase 8 stop-campaign block placed AFTER payment tests (correct execution order)
- **Allocation module — Customer flow (Phase 2–9):** TC-CST-001–031 (31 tests)
  - Login & home dashboard, allotment & unit selection, payment gateway, KYC, post-booking milestones, post-campaign waitlisted verification
- **`src/pages/AllocationPage.js`** — full POM for admin and customer portal
- **`docs/manual-test-cases/TC_ALLOCATION.md`** — 45 TC manual test case document
- **`docs/pages/ALLOCATION.md`**, **`docs/selectors/allocation.json`** — page docs and selectors

### Fixed
- Describe 7 `beforeEach` active-campaign guard: replaced invalid comma-separated `text=A, text=B` locator with proper `.or()` chain

### Changed
- `docs/test-coverage.md` — updated to reflect Allocation coverage (136 total TCs)
- `docs/TASK_TRACKER.md` — Allocation tasks marked Done; Towers/CP/JBP remain pending
- `docs/SPRINT_LOG.md` — Sprint 3 Allocation section updated to ✅ Complete
=======
## [2026-03-29] — Sprint 3 Allocation Module

### Added
- `docs/selectors/allocation.json` — 90+ selectors across 10 sections (Admin campaign form, list, stop popup, filters; Customer login, home, allotment, unit selection, payment, KYC, milestone payments)
- `docs/pages/ALLOCATION.md` — full page documentation for 5 URLs (Admin + 4 Customer portal pages); includes 7 campaign status values, stop popup text, unit 3502 pricing, KYC rules
- `docs/manual-test-cases/TC_ALLOCATION.md` — 44 TCs across 11 phases (3 Setup + 10 Admin + 31 Customer); source: Static_Allocation_E2E_TestCases.pdf
- `src/pages/AllocationPage.js` — page object covering Admin and full Customer portal flow (selectNationality, stop popup handling, unit details, KYC, milestones)
- `tests/ui/allocation.spec.js` — 44 automated tests across 7 describe blocks; ENV SKIP guards for payment/KYC/milestone flows requiring active UAT campaign

### Campaign Status Values documented (all 7)
Active · Upcoming · Stopped · Completed · Cancelled · Failed · All Status

### Total test count: 138 automated tests (Sprint 1 + 2 + Allocation)
>>>>>>> c4c0485 (docs(sprint3): Update CHANGELOG, SPRINT_LOG, TASK_TRACKER, test-coverage + fix playwright.config customer project storageState)

---

## [2026-03-28] — Sprint 2 Complete

### Added
- **Unit Status automation** — TC_CFG_025–030 (6 tests: RESERVED↔AVAILABLE, Update flag, invalid status)
- **Unit Cost Update automation** — TC_CFG_031–034 (4 tests: agreement value, mixed rows, skip, invalid)
- **Bulk Booking Cancellation** — TC_CFG_035–037 (3 tests: positive, non-existent, already-processed)
- **Bulk Registration Cancellation** — TC_CFG_038–040 (3 tests: positive, Update=0 skip, invalid reg)
- **Sales Managers** — TC_CFG_041–048 (8 tests: add, unavailable, inactive, email update, search, duplicate)
- **Customer Portal** — TC_CFG_049–053 (5 tests: full payment, failure, cancel, session timeout, GHNG reg verify)
- **Max Preferences & Customer Actions S1** — TC_CFG_007–013 (7 tests)
- **Sample Downloads** — TC_CFG_014–019 (6 tests, one per upload section)

### Changed
- Merged all Config test cases into unified `docs/manual-test-cases/TC_CONFIG.md` (52 TCs total)
- Updated SPRINT_LOG, TASK_TRACKER, test-coverage to reflect Sprint 2 ✅ Complete
- **Total automated tests: 94** across Login, Customers, Config modules

### Sprint 2 Final Counts
| Module | Tests | Status |
|--------|-------|--------|
| Login | 22 | ✅ All pass |
| Customers | 17 | ✅ All pass |
| Config (combined) | 53 | ✅ 46 pass · 7 ENV skip |
| Smoke | 1 | ✅ Pass |
| **Total** | **93** | ✅ |

---

## [2026-03-20] — Sprint 2 (Config Module — initial)

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
