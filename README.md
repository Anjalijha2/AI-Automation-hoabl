# XR Portal — AI-Powered QA Framework

End-to-end QA automation for XR Portal using an AI pipeline and Playwright 1.58.2.

**Target:** `https://uat-web.xrportal.in/admin`
**Language:** JavaScript (CommonJS)
**Approach:** Sprint-wise · Portal-wise · Documentation → Test Cases → Automation

---

## Execution Model

Each sprint covers one portal through three phases in sequence:

```
Phase 1: Portal Documentation
Phase 2: Manual Test Case Creation
Phase 3: Automation Script Development
```

---

## Quick Start

**Step 1: Install dependencies**
```bash
npm install
npx playwright install chromium
```

**Step 2: Configure environment**
```env
BASE_URL=https://uat-web.xrportal.in/admin
```

**Step 3: Set up auth session** (required before smoke/regression)
```bash
npm run auth:setup
```

Saves session to `automation-repository/fixtures/.auth/admin.json`.

**Step 4: Run tests**
```bash
npm run test:regression   # Full regression suite
npm run test:smoke        # Smoke tests
npm run test:login        # Login tests (standalone)
npm run report            # Open HTML report
```

---

## Authentication

- **Method:** 2-step Mobile OTP — no password required
- **UAT Credentials:** Mobile `8888888888` · OTP `258369` (static UAT value)
- **Session file:** `automation-repository/fixtures/.auth/admin.json` (git-ignored)

Re-run `npm run auth:setup` when session expires or `admin.json` is deleted.

---

## Test Commands

```bash
npm run test              # Regression suite (headless, 1 worker)
npm run test:headed       # Regression suite (headed)
npm run test:smoke        # Smoke suite (headed, needs auth-setup)
npm run test:login        # Login tests (headed, standalone)
npm run test:regression   # Full regression (headed, needs auth-setup)
npm run test:chrome       # Cross-browser — Chromium
npm run test:firefox      # Cross-browser — Firefox
npm run test:webkit       # Cross-browser — WebKit/Safari
npm run report            # Open HTML report
```

**Always `--workers=1` with `--headed`** — multiple headed windows conflict.

---

## AI Agent Pipeline

```bash
npm run discover              # Crawl portal UI → discovery/reports/
npm run docs:generate         # Screen docs → manual-qa-repository/sprints/
npm run testcases:generate    # Manual TCs → manual-qa-repository/sprints/
npm run automation:generate   # Playwright specs → tests/e2e/
npm run execute               # Run all tests → reports/results.json
npm run defects:log           # Parse failures → bugs/BUG_TRACKER.md
npm run heal:analyze          # Selector analysis (read-only)
npm run sprint:status         # Sprint summary
npm run sprint:update         # Update SPRINT_LOG + TASK_TRACKER
```

---

## Project Structure

```
xanadu/
├── .env                                  # BASE_URL only (git-ignored)
├── .gitignore
├── config/
│   └── playwright.config.js              # Multi-project Playwright config
├── package.json
│
├── automation-repository/
│   ├── agents/                           # AI agent scripts
│   ├── api/
│   │   └── ApiClient.js                  # Generic HTTP + domain helpers
│   ├── components/                       # Reusable component objects
│   ├── constants/
│   │   └── testData.js                   # BASE_URL, credentials, timeouts
│   ├── discovery/
│   │   └── config-discovery.js           # UI crawl & selector extraction
│   ├── fixtures/
│   │   ├── .auth/admin.json              # Saved session (git-ignored)
│   │   └── base-test.js                  # Central fixture — DI for all page objects
│   ├── pages/
│   │   ├── BasePage.js                   # Shared helpers
│   │   └── LoginPage.js                  # Login POM
│   ├── test-data/
│   │   └── factories/UserFactory.js      # Test data factories
│   └── utils/
│       ├── WaitUtil.js                   # pollUntil, retry, sleep
│       └── selectorHelpers.js            # loadSelectors(module)
│
├── manual-qa-repository/
│   ├── test-cases/                       # Manual TCs — portal → module hierarchy
│   │   ├── admin-portal/                 # > Admin Portal (Login, Customers, Config, etc.)
│   │   └── sales-manager-portal/         # > Sales Manager Portal (Callback, Towers, Leads)
│   ├── testing-types/                    # Smoke, regression, sanity, UAT sign-off, retesting, exploratory
│   ├── user-manual/                      # Admin guide + per-screen docs (12 dimensions)
│   ├── bug-reports/                      # BUG_TRACKER.md, per-bug files, metrics, templates
│   ├── environments/                     # UAT / DEV config, test accounts, ENV strategy
│   ├── test-runs/                        # Execution summaries per sprint per environment
│   ├── execution/                        # Run commands, ENV skip log, UAT vs DEV delta
│   ├── architecture/                     # Agent roles, process flow, framework config, QA strategy
│   ├── templates/                        # TC, screen doc, execution summary templates
│   ├── DASHBOARD.md
│   ├── SPRINT_LOG.md
│   ├── TASK_TRACKER.md
│   ├── test-coverage.md
│   ├── QA-METRICS.md
│   ├── AGENT-CONFIG.md
│   ├── DOCUMENTATION-TRACKER.md
│   └── CHANGELOG.md
│
├── tests/
│   ├── auth.setup.js                     # Saves login session to admin.json
│   ├── e2e/                              # Feature test specs
│   ├── smoke/                            # Smoke suite specs
│   ├── api/                              # API contract tests
│   └── visual/                           # Visual regression tests
│
└── reports/                              # Git-ignored
    ├── html-report/
    └── results.json
```

---

## Playwright Projects

| Project | Test Dir | Auth Required | Use Case |
|---------|----------|---------------|----------|
| `auth-setup` | `tests/auth.setup.js` | No | One-time login → saves `admin.json` |
| `login-tests` | `tests/e2e/login.spec.js` | No (standalone) | Tests auth flow directly |
| `smoke` | `tests/smoke/` | Yes | Quick sanity checks |
| `regression` | `tests/e2e/` | Yes | Full regression run |
| `chromium` | `tests/e2e/` | Yes | Cross-browser (Chrome) |
| `firefox` | `tests/e2e/` | Yes | Cross-browser (Firefox) |
| `webkit` | `tests/e2e/` | Yes | Cross-browser (Safari) |

---

## Tech Stack

| Tool | Version | Role |
|------|---------|------|
| Playwright | 1.58.2 | Browser automation + test runner |
| Node.js | LTS | Runtime |
| JavaScript | CommonJS | Language |
| dotenv | 17.3.1 | `.env` variable loading |
| csv-writer | 1.6.0 | CSV report output |
| xlsx | 0.18.5 | Excel file handling |

---

## Documentation Index

| Document | Path | Contents |
|----------|------|----------|
| Dashboard | `manual-qa-repository/DASHBOARD.md` | Live project status |
| Agent Roles | `manual-qa-repository/architecture/AGENT-ROLES.md` | 3-agent roles + pipeline phases |
| Process Flow | `manual-qa-repository/architecture/PROCESS-FLOW.md` | End-to-end pipeline walkthrough |
| Framework Config | `manual-qa-repository/architecture/FRAMEWORK-CONFIG.md` | Playwright config, scripts, env vars |
| QA Strategy | `manual-qa-repository/architecture/QA-STRATEGY.md` | Coverage goals, risk priority |
| Test Cases Index | `manual-qa-repository/test-cases/INDEX.md` | All portals + modules + TC counts |
| Bug Tracker | `manual-qa-repository/bug-reports/BUG_TRACKER.md` | Open and resolved bugs |
| Sprint Log | `manual-qa-repository/SPRINT_LOG.md` | Active and completed sprints |
| Task Tracker | `manual-qa-repository/TASK_TRACKER.md` | Pending and completed tasks |
| Test Coverage | `manual-qa-repository/test-coverage.md` | Coverage by portal + sprint |
| QA Metrics | `manual-qa-repository/QA-METRICS.md` | Defect density, pass rates |
| Changelog | `manual-qa-repository/CHANGELOG.md` | All changes by date |
