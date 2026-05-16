# XR Portal — AI-Powered QA Framework

AI agent pipeline + Playwright 1.58.2. Multi-portal, BRD/FRD-driven, phase-gated.

**Language:** JavaScript (CommonJS) — no TypeScript, no transpile.

---

## Portals

| Portal | URL | Auth Session |
|--------|-----|-------------|
| Admin | `https://uat-web.xrportal.in/admin` | `automation-repository/fixtures/.auth/admin.json` |
| Sales Manager | `https://uat-web.xrportal.in/sales-manager` | `automation-repository/fixtures/.auth/sales-manager.json` |
| Channel Partner | `https://uat-web.xrportal.in/` | `automation-repository/fixtures/.auth/channel-partner.json` |
| Buyer | `https://uat.xrportal.in/` | `automation-repository/fixtures/.auth/buyer.json` |
| API | `https://uat-api.xrportal.in/` | — (token-based) |

---

## Quick Start

```bash
npm install
npx playwright install chromium
npm run auth:setup       # saves session → automation-repository/fixtures/.auth/admin.json
npm run test:e2e:admin   # run E2E suite for admin portal
npm run report           # open HTML report
```

**Auth:** Mobile OTP, no password. UAT: `8888888888` / OTP `258369` (static).

---

## Test Commands

```bash
# Auth
npm run auth:setup

# E2E (per portal)
npm run test:e2e:admin
npm run test:e2e:sales-manager
npm run test:e2e:channel-partner
npm run test:e2e:buyer

# UI/UX
npm run test:ui:admin

# Regression
npm run test:regression:admin

# API + DB
npm run test:api
npm run test:db

# Smoke
npm run test:smoke

# Cross-browser
npm run test:chrome
npm run test:firefox
npm run test:webkit

# Standalone login
npm run test:login

# Full suite
npm run test:all

# Report
npm run report
npm run generate:report   # generate execution-summary.md from results.json

# Pipeline
npm run sync              # 4-step sync (Tech Lead → BA → QA Manual → QA Auto)
npm run discover          # crawl portal UI → discovery/reports/
npm run sprint:status
npm run sprint:update
```

**Always `--workers=1`.** Multiple headed windows conflict.

---

## Project Structure

```
xanadu/
├── package.json
├── jsconfig.json
│
├── automation-repository/
│   ├── playwright.config.js              # Master config — 6 test type projects
│   ├── .env.example
│   ├── base/
│   │   └── BasePage.js                   # Shared page helpers — all POMs extend this
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── LoginPage.js
│   │   │   └── DashboardPage.js
│   │   ├── sales-manager/
│   │   ├── channel-partner/
│   │   └── buyer/
│   ├── fixtures/
│   │   ├── .auth/<portal>.json           # Saved sessions (git-ignored)
│   │   ├── auth.setup.js                 # OTP login → saves session
│   │   ├── base-test.js                  # Central fixture (DI pattern)
│   │   └── global-setup.js
│   ├── api/
│   │   └── ApiClient.js
│   ├── components/
│   ├── utils/
│   │   ├── WaitUtil.js
│   │   └── selectorHelpers.js
│   ├── test-data/
│   │   └── factories/UserFactory.js
│   ├── constants/
│   │   └── testData.js
│   └── discovery/
│       └── config-discovery.js
│
├── locators/                             # Element locator maps (Tech Lead Agent owned)
│   ├── admin/locator-map.json
│   ├── sales-manager/locator-map.json
│   ├── channel-partner/locator-map.json
│   └── buyer/locator-map.json
│
├── db/
│   ├── connection.js
│   └── queries/
│       ├── booking.js
│       ├── inventory.js
│       └── user.js
│
├── sync/
│   └── last-synced-commits.json          # Sync pointer for 4-step pipeline
│
├── templates/
│   └── module-scaffold/                  # Scaffold templates for new modules
│
├── tests/
│   ├── e2e/<portal>/                     # E2E specs — portal-wise
│   ├── ui-ux/<portal>/                   # UI/UX specs
│   ├── regression/<portal>/              # Regression specs + snapshots
│   ├── api/                              # API contract specs
│   ├── db/                               # DB state specs
│   ├── smoke/                            # Smoke suite
│   ├── cross-browser/                    # Cross-browser specs
│   └── archived/                         # Deprecated specs (never delete)
│
├── manual-qa-repository/
│   ├── 01-test-cases/                    # Manual TCs — portal → module hierarchy
│   ├── 02-testing-types/                 # Smoke, regression, sanity, UAT, retesting
│   ├── 03-user-manual/                   # Per-screen docs (12 dimensions)
│   ├── 04-bug-reports/BUG_TRACKER.md
│   ├── 05-environments/                  # UAT/DEV config, test accounts
│   ├── 06-test-runs/                     # Execution summaries per sprint
│   ├── 07-execution/
│   ├── 08-architecture/                  # Agent roles, process flow, framework config
│   ├── 09-templates/
│   ├── DASHBOARD.md
│   ├── SPRINT_LOG.md
│   └── TASK_TRACKER.md
│
└── reports/                              # Git-ignored
    ├── html-report/
    └── results.json
```

---

## Playwright Projects

| Project | Test Dir | Auth | Use Case |
|---------|----------|------|---------|
| `auth-setup` | `automation-repository/fixtures/` | No | One-time session save |
| `login-tests` | `tests/e2e/admin/login.spec.js` | No | Auth flow tests |
| `e2e` | `tests/e2e/` | Yes | Full E2E journeys |
| `ui-ux` | `tests/ui-ux/` | Yes | Component + a11y |
| `regression` | `tests/regression/` | Yes | Baseline comparison |
| `api` | `tests/api/` | No (token) | API contracts |
| `db` | `tests/db/` | No | DB state assertions |
| `smoke` | `tests/smoke/` | Yes | Sanity checks |
| `chromium` | `tests/cross-browser/` | Yes | Chrome |
| `firefox` | `tests/cross-browser/` | Yes | Firefox |
| `webkit` | `tests/cross-browser/` | Yes | Safari/Edge |

---

## 4-Agent System

| Agent | Role |
|-------|------|
| BA Agent | BRD/FRD interpretation, test case generation |
| Tech Lead Agent | Source scans, locator maps, self-healing |
| QA Agent | All test code, POMs, manual QA artefacts, execution |
| Developer Agent | App source changes — explicit user invocation only |

**BA Agent starts every pipeline. Developer Agent invoked by user only.**

---

## Tech Stack

| Tool | Version | Role |
|------|---------|------|
| Playwright | 1.58.2 | Browser automation + test runner |
| Node.js | LTS | Runtime |
| JavaScript | CommonJS | Language |
| dotenv | 17.x | ENV loading |
| xlsx | 0.18.5 | Excel (TestCases.xlsx) |
