# XR Portal QA Framework — Documentation Index

> Living document. Update this file whenever a module is added, a TC is changed, or a bug is logged.

---

## Project Info

| Property | Value |
|----------|-------|
| **App Under Test** | XR Portal Admin + CP Portal (UAT) |
| **Admin URL** | `https://uat-web.xrportal.in/admin` |
| **CP Portal URL** | `https://uat-web.xrportal.in` |
| **Auth Method** | Mobile OTP (2-step, no password) |
| **Framework** | Playwright v1.58.2 · JavaScript (CommonJS) · Page Object Model |
| **Test Runner** | `npx playwright test` |
| **Workers** | 1 (sequential — UAT state-dependent) |
| **Admin Mobile** | `8888888888` |
| **Admin OTP (UAT)** | `258369` (static UAT-only OTP) |
| **CP Portal OTP** | `147258` (static UAT-only OTP) |

---

## Module Index

| Module | Spec File | TC Doc | POM File | TCs | Status |
|--------|-----------|--------|----------|-----|--------|
| Login | [login.spec.js](../../tests/ui/login.spec.js) | [TC_LOGIN.md](TC_LOGIN.md) | [LoginPage.js](../../src/pages/LoginPage.js) | 22 | ✅ |
| Customers | [customers.spec.js](../../tests/ui/customers.spec.js) | [TC_CUSTOMERS.md](TC_CUSTOMERS.md) | [CustomersPage.js](../../src/pages/CustomersPage.js) | 17 | ✅ |
| Config | [config.spec.js](../../tests/ui/config.spec.js) | [TC_CONFIG.md](TC_CONFIG.md) | — | 53 | ✅ |
| Allocation | [allocation.spec.js](../../tests/ui/allocation.spec.js) | [TC_ALLOCATION.md](TC_ALLOCATION.md) | [AllocationPage.js](../../src/pages/AllocationPage.js) | 44 | ✅ |
| Towers | [towers.spec.js](../../tests/ui/towers.spec.js) | [TC_TOWERS.md](TC_TOWERS.md) | [TowersPage.js](../../src/pages/TowersPage.js) | 13 | ✅ |
| Channel Partners | [channel-partners.spec.js](../../tests/ui/channel-partners.spec.js) | [TC_CHANNEL_PARTNERS.md](TC_CHANNEL_PARTNERS.md) | [ChannelPartnersPage.js](../../src/pages/ChannelPartnersPage.js) | 13 | ✅ |
| JBP Management | [jbp-management.spec.js](../../tests/ui/jbp-management.spec.js) | [TC_JBP.md](TC_JBP.md) | [JBPManagementPage.js](../../src/pages/JBPManagementPage.js) | 4 | ✅ |
| **TOTAL** | | | | **166** | |

---

## Quick Run Commands

```bash
# ── Individual Modules ─────────────────────────────────────────────────────────

# Login (standalone project)
npx playwright test tests/ui/login.spec.js --project=login-tests --config config/playwright.config.js --headed --workers=1

# Customers
npx playwright test tests/ui/customers.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# Config (all 53 tests)
npx playwright test tests/ui/config.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# Allocation
npx playwright test tests/ui/allocation.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# Towers
npx playwright test tests/ui/towers.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# Channel Partners
npx playwright test tests/ui/channel-partners.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# JBP Management
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# ── Full Suite ─────────────────────────────────────────────────────────────────
npm run test:regression    # headless
npm run test:headed        # headed

# ── Reports ────────────────────────────────────────────────────────────────────
npm run report             # open HTML report
```

---

## Directory Structure

```
xanadu/
├── config/
│   └── playwright.config.js        ← Playwright configuration
├── docs/
│   ├── manual-test-cases/
│   │   ├── INDEX.md                ← THIS FILE
│   │   ├── TC_LOGIN.md
│   │   ├── TC_CUSTOMERS.md
│   │   ├── TC_CONFIG.md
│   │   ├── TC_ALLOCATION.md
│   │   ├── TC_TOWERS.md
│   │   ├── TC_CHANNEL_PARTNERS.md
│   │   └── TC_JBP.md              ← NEW
│   ├── execution/
│   │   └── run-commands.md
│   ├── test-coverage.md
│   └── CHANGELOG.md
├── src/
│   ├── base/BasePage.js
│   ├── fixtures/.auth/admin.json   ← Saved admin session (git-ignored)
│   └── pages/
│       ├── LoginPage.js
│       ├── CustomersPage.js
│       ├── AllocationPage.js
│       ├── TowersPage.js
│       ├── ChannelPartnersPage.js
│       ├── CPPortalPage.js         ← CP Portal + JBP form
│       └── JBPManagementPage.js
└── tests/
    ├── auth.setup.js               ← Global session caching
    └── ui/
        ├── login.spec.js
        ├── customers.spec.js
        ├── config.spec.js
        ├── allocation.spec.js
        ├── towers.spec.js
        ├── channel-partners.spec.js
        └── jbp-management.spec.js
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-11 | Initial docs created |
| 2026-03-19 | Tower Config + Playwright automation added |
| 2026-03-20 | Registration Status TCs + BUG_010 logged |
| 2026-04-06 | Channel Partners module complete (13 TCs, TC-CP-001–012) |
| 2026-04-14 | JBP Management module complete (4 TCs, TC-JBP-001–004); INDEX rebuilt; test-coverage updated to 166 total |
