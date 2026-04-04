# XR Portal — AI-Powered QA Framework

End-to-end QA automation for XR Portal Admin (UAT) using an 8-agent AI pipeline and Playwright 1.58.2.

**Target:** `https://uat-web.xrportal.in/admin`
**Language:** JavaScript (CommonJS)
**Sprint:** Sprint 1-2 Complete ✅ · Sprint 3 In Progress (Allocation ✅, Towers ✅)

---

## Quick Start

**Step 1: Install dependencies**
```bash
npm install
npx playwright install chromium
```

**Step 2: Configure environment**

Create a `.env` file in the project root:
```env
BASE_URL=https://uat-web.xrportal.in/admin
```

> Authentication uses Mobile OTP — no email or password required. UAT credentials are hard-coded in the test files.

**Step 3: Set up auth session** (required before smoke/regression)
```bash
npx playwright test --config config/playwright.config.js --project=auth-setup
```

Saves session to `src/fixtures/.auth/admin.json`.

**Step 4: Run tests**
```bash
npm run test:login        # Login tests (22 tests, standalone)
npm run test:customers    # Customers tests (needs auth-setup)
npm run test:regression   # Full regression (needs auth-setup)
npm run report            # Open HTML report
```

---

## Authentication

- **Model:** 2-step Mobile OTP — no password required
- **UAT Credentials:** Mobile `8888888888` · OTP `258369` (static UAT value)
- **Session file:** `src/fixtures/.auth/admin.json` (git-ignored)

The `login-tests` project is **standalone** — tests the auth flow directly without a stored session. All other suites (smoke, regression) load the saved session via `storageState`.

**Re-run auth-setup when:**
- Session expires and protected-page tests start failing
- `admin.json` was deleted
- UAT credentials change

---

## Current Test Coverage

| Module | Spec File | Tests | Status |
|--------|-----------|-------|--------|
| Login | `tests/ui/login.spec.js` | 22 | ✅ All passing |
| Customers | `tests/ui/customers.spec.js` | 17 | ✅ All passing |
| Config — Tower Configuration | `tests/ui/config.spec.js` | 6 | ✅ All passing |
| Config — Max Preferences | `tests/ui/config.spec.js` | 4 | ✅ All passing |
| Config — Customer Actions | `tests/ui/config.spec.js` | 3 | ✅ All passing |
| Config — Sample Downloads | `tests/ui/config.spec.js` | 6 | ✅ All passing |
| Config — Registration Status | `tests/ui/config.spec.js` | 7 | ✅ 5 pass · 2 ENV skip |
| Config — Unit Status | `tests/ui/config.spec.js` | 6 | ✅ All passing |
| Config — Unit Cost Update | `tests/ui/config.spec.js` | 4 | ✅ All passing |
| Config — Bulk Booking Cancellation | `tests/ui/config.spec.js` | 3 | ✅ All passing |
| Config — Bulk Reg Cancellation | `tests/ui/config.spec.js` | 3 | ✅ All passing |
| Config — Sales Managers | `tests/ui/config.spec.js` | 8 | ✅ All passing |
| Config — Customer Portal | `tests/ui/config.spec.js` | 5 | ✅ ENV skip on UAT |
| Smoke | `tests/smoke/smoke.spec.js` | 2 | ✅ All passing |
| Allocation | `tests/ui/allocation.spec.js` | 44 | ✅ Automated (ENV skip guards on UAT/live gateway flows) |
| Towers | `tests/ui/towers.spec.js` | 13 | ✅ All passing |
| Channel Partners | — | — | ⏳ Sprint 3 |
| JBP Management | — | — | ⏳ Sprint 3 |

**Total: 151 automated tests · 1 open bug (BUG_010 — medium)**

---

## Sprint Status

**Sprint 1 — Complete ✅**
- Playwright + JavaScript project setup
- `config/playwright.config.js` with 6 projects
- Auth session setup (`tests/auth.setup.js`)
- Login page object + 22 automated tests
- Customers page object + 17 automated tests
- All 8 AI agent scripts (`src/agents/`)
- Manual test case docs (`docs/manual-test-cases/`)
- Page documentation (`docs/pages/`)
- Bug tracker (`bugs/BUG_TRACKER.md`) — BUG_001 to BUG_009 resolved

**Sprint 2 — Complete ✅**
- Config module: Tower Configuration, Max Preferences, Customer Actions
- Config module: Registration Status, Unit Status, Unit Cost Update
- Config module: Bulk Booking/Reg Cancellation, Sales Managers, Customer Portal
- 53 Config tests automated (TC_CFG_001–053)
- BUG_010 logged — missing submit validation on Registration Status

**Sprint 3 — In Progress**
- Allocation module — 44 automated tests complete
- Towers module — 13 automated tests complete
- Channel Partners module
- JBP Management module
- Full regression suite + CI pipeline setup

---

## Playwright Projects

| Project | Test Match | Auth Required | Use Case |
|---------|-----------|---------------|----------|
| `auth-setup` | `tests/auth.setup.js` | No | One-time login → saves `admin.json` |
| `login-tests` | `tests/ui/login.spec.js` | No (standalone) | Tests the auth flow directly |
| `smoke` | `tests/smoke/*.spec.js` | Yes | Quick sanity checks |
| `regression` | `tests/ui/*.spec.js` | Yes | Full regression run |
| `chromium` | all specs | Yes | Cross-browser (Chrome) |
| `firefox` | all specs | Yes | Cross-browser (Firefox) |
| `webkit` | all specs | Yes | Cross-browser (Safari) |

**Execution order:**
```
auth-setup  (run once — creates admin.json)
    │
    ├── smoke        (depends on auth-setup)
    └── regression   (depends on auth-setup)

login-tests  (independent — run any time)
```

---

## npm Scripts Reference

### AI Pipeline
```bash
npm run discover              # Agent 0: Crawl portal UI → discovery/reports/
npm run docs:generate         # Agent 1: Generate page docs → docs/pages/
npm run testcases:generate    # Agent 2: Generate manual test cases → docs/manual-test-cases/
npm run automation:generate   # Agent 3: Generate Playwright specs → tests/ui/
npm run execute               # Agent 4: Run all tests via agent wrapper
npm run execute:login         # Agent 4: Run login tests via agent wrapper
npm run execute:customers     # Agent 4: Run customers tests via agent wrapper
npm run defects:log           # Agent 5: Parse failures, log to BUG_TRACKER.md
npm run heal:analyze          # Agent 6: Analyze selector failures (read-only)
npm run sprint:status         # Agent 7: View current sprint status
npm run sprint:update         # Agent 7: Update sprint logs and task tracker
npm run sprint:plan-brd       # Agent 7: Plan sprint from BRD
```

### Playwright Direct
```bash
npm run test                  # Regression suite (headless, 1 worker)
npm run test:login            # Login tests (headed, standalone)
npm run test:login:positive   # Login positive tests only
npm run test:login:negative   # Login negative tests only
npm run test:customers        # Customers tests (headed, needs auth-setup)
npm run test:regression       # Full regression suite (headed, needs auth-setup)
npm run test:smoke            # Smoke suite (headed, needs auth-setup)
npm run test:headed           # Regression suite (headed)
npm run test:chrome           # Cross-browser — Chromium
npm run test:firefox          # Cross-browser — Firefox
npm run test:webkit           # Cross-browser — WebKit/Safari
npm run test:all              # All projects (1 worker)
npm run report                # Open HTML report in browser
```

---

## AI Agent Pipeline

The framework uses 8 purpose-built AI agents to drive the full QA lifecycle:

| # | File | npm Script | Role |
|---|------|------------|------|
| 0 | `src/discovery/config-discovery.js` | `npm run discover` | Crawls portal UI, maps all modules, extracts DOM selectors |
| 1 | `src/agents/page-doc-agent.js` | `npm run docs:generate` | Generates structured page docs from discovery output |
| 2 | `src/agents/testcase-agent.js` | `npm run testcases:generate` | Writes manual test cases (Positive / Negative / Boundary / Security) |
| 3 | `src/agents/automation-agent.js` | `npm run automation:generate` | Converts approved test cases to Playwright specs (POM pattern) |
| 4 | `src/agents/execution-agent.js` | `npm run execute` | Runs test suites, captures per-TC results |
| 5 | `src/agents/defect-agent.js` | `npm run defects:log` | Parses test failures, creates structured bug entries |
| 6 | `src/agents/healing-agent.js` | `npm run heal:analyze` | Analyzes broken selectors and suggests fixes (read-only) |
| 7 | `src/agents/sprint-manager.js` | `npm run sprint:status` | Sprint logs, task tracker, test coverage report |

**Pipeline flow — adding a new module:**
```
discover → docs:generate → testcases:generate → automation:generate
                                                        ↓
                                              review & fix selectors
                                                        ↓
                              auth-setup → execute → defects:log → heal:analyze → sprint:update
```

---

## Project Structure

```
xanadu/
├── .env                                  # BASE_URL only (git-ignored)
├── .gitignore
├── config/
│   ├── playwright.config.js              # 6 projects: auth-setup, login-tests, smoke, regression, chromium, firefox, webkit
│   ├── env.dev.js                        # Dev environment config
│   ├── env.qa.js                         # QA environment config
│   └── env.prod.js                       # Prod environment config
├── jsconfig.json                         # Path aliases (@pages, @utils, @base, etc.)
├── package.json
│
├── src/
│   ├── agents/                           # 8 AI agent scripts (.js)
│   │   ├── automation-agent.js
│   │   ├── defect-agent.js
│   │   ├── execution-agent.js
│   │   ├── healing-agent.js
│   │   ├── page-doc-agent.js
│   │   ├── sprint-manager.js
│   │   └── testcase-agent.js
│   ├── base/
│   │   └── BasePage.js                   # Shared helpers (navigate, click, fill, getText, etc.)
│   ├── constants/
│   │   └── testData.js                   # BASE_URL, credentials, timeouts, viewport
│   ├── discovery/
│   │   └── config-discovery.js           # Agent 0: UI crawl & selector extraction
│   ├── fixtures/
│   │   ├── .auth/admin.json              # Saved session (git-ignored)
│   │   ├── testFixture.js                # Playwright fixtures
│   │   └── RegistrationData.xlsx         # Test data for registration flows
│   ├── pages/                            # Page Object Models
│   │   ├── LoginPage.js
│   │   ├── CustomersPage.js
│   │   └── ConfigPage.js
│   └── utils/
│       ├── dataGenerator.js
│       ├── playwrightHelpers.js
│       └── selectorHelpers.js            # loadSelectors(module) → docs/selectors/*.json
│
├── tests/
│   ├── auth.setup.js                     # Saves login session to admin.json
│   ├── api/
│   │   └── user.api.spec.js
│   ├── smoke/
│   │   └── smoke.spec.js
│   ├── test-data/                        # JSON + xlsx test data files
│   └── ui/
│       ├── login.spec.js                 # 22 login tests
│       ├── customers.spec.js             # 17 customers tests
│       ├── config.spec.js                # 53 config tests (TC_CFG_001–053)
│       ├── registration-status.spec.js   # Standalone registration status
│       └── tower-config.spec.js          # Standalone tower config
│
├── bugs/
│   └── BUG_TRACKER.md                    # BUG_001–BUG_010
│
├── docs/
│   ├── architecture/
│   │   ├── AGENT-ROLES.md
│   │   ├── FRAMEWORK-CONFIG.md
│   │   └── PROCESS-FLOW.md
│   ├── execution/
│   │   ├── execution-summary.md
│   │   └── run-commands.md
│   ├── manual-test-cases/
│   │   ├── INDEX.md
│   │   ├── TC_LOGIN.md
│   │   ├── TC_CUSTOMERS.md
│   │   ├── TC_CONFIG.md                  # 52 Config TCs (Sections 1–10)
│   │   └── TC_ADMIN_CMS.md
│   ├── pages/
│   │   ├── LOGIN.md
│   │   ├── CUSTOMERS.md
│   │   └── CONFIG.md
│   ├── selectors/                        # Centralized selector JSON files
│   │   ├── login.json
│   │   ├── customers.json
│   │   └── config.json
│   ├── CHANGELOG.md
│   ├── SPRINT_LOG.md
│   ├── TASK_TRACKER.md
│   └── test-coverage.md
│
├── reports/                              # Git-ignored
│   ├── html-report/
│   └── results.json
│
└── discovery/
    └── reports/                          # Output from discovery agent
```

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
| Agent Roles | `docs/architecture/AGENT-ROLES.md` | All 8 agents — inputs, outputs, rules |
| Process Flow | `docs/architecture/PROCESS-FLOW.md` | End-to-end pipeline walkthrough |
| Framework Config | `docs/architecture/FRAMEWORK-CONFIG.md` | `playwright.config.js`, scripts, env vars |
| Login Page | `docs/pages/LOGIN.md` | Selectors, methods, test case breakdown |
| Customers Page | `docs/pages/CUSTOMERS.md` | Selectors, methods, test case breakdown |
| Config Page | `docs/pages/CONFIG.md` | Selectors, methods, test case breakdown |
| Config Test Cases | `docs/manual-test-cases/TC_CONFIG.md` | 52 TCs across 10 sections |
| Test Coverage | `docs/test-coverage.md` | Coverage status per module |
| Sprint Log | `docs/SPRINT_LOG.md` | Sprint 1–2 complete, Sprint 3 Allocation/Towers complete |
| Changelog | `docs/CHANGELOG.md` | All changes by date |
| Task Tracker | `docs/TASK_TRACKER.md` | Completed / pending tasks |
| Bug Tracker | `bugs/BUG_TRACKER.md` | BUG_001–BUG_010 |
| Run Commands | `docs/execution/run-commands.md` | Quick command reference |
| Execution Summary | `docs/execution/execution-summary.md` | Per-TC results |
