# XR Portal — AI-Powered QA Framework

End-to-end QA automation for XR Portal Admin (UAT) using an 8-agent AI pipeline, Playwright 1.58.2, and TypeScript.

**Target:** `https://uat-web.xrportal.in/admin`

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
npx playwright test --project=auth-setup
```

This logs in once and saves the session to `automation/fixtures/.auth/admin.json`.

**Step 4: Run tests**
```bash
npm run test:login        # Login tests (18 tests, standalone)
npm run test:customers    # Customers tests (6 tests, needs auth-setup)
npm run test:regression   # Full regression (needs auth-setup)
npm run report            # Open HTML report
```

---

## Authentication

- **Model:** 2-step Mobile OTP — no password required
- **UAT Credentials:** Mobile `8888888888` · OTP `258369` (static UAT value)
- **Hard-coded in:** `automation/tests/login.spec.ts` + `automation/tests/auth.setup.ts`
- **Session file:** `automation/fixtures/.auth/admin.json` (git-ignored)

The `login-tests` project is **standalone** — it tests the auth flow directly and does not use a stored session. All other suites (smoke, regression) load the saved session via `storageState`.

**Re-run auth-setup when:**
- Session expires and protected-page tests start failing
- `admin.json` was deleted
- UAT credentials change (update both `auth.setup.ts` and `login.spec.ts`)

---

## AI Agent Pipeline

The framework uses 8 purpose-built AI agents to drive the full QA lifecycle:

| # | File | npm Script | Role |
|---|------|------------|------|
| 0 | `ai-agents/discovery-agent.ts` | `npm run discover` | Crawls portal UI, maps all modules, extracts DOM selectors |
| 1 | `ai-agents/page-doc-agent.ts` | `npm run docs:generate` | Generates structured page docs from discovery output |
| 2 | `ai-agents/testcase-agent.ts` | `npm run testcases:generate` | Writes manual test cases (Positive / Negative / Boundary / Security) |
| 3 | `ai-agents/automation-agent.ts` | `npm run automation:generate` | Converts approved test cases to Playwright specs (POM pattern) |
| 4 | `ai-agents/execution-agent.ts` | `npm run execute` | Runs test suites, captures per-TC results to `execution/execution-summary.md` |
| 5 | `ai-agents/defect-agent.ts` | `npm run defects:log` | Parses test failures, creates structured bug entries in `bugs/BUG_TRACKER.md` |
| 6 | `ai-agents/healing-agent.ts` | `npm run heal:analyze` | Analyzes broken selectors and suggests fixes (read-only — never modifies scripts) |
| 7 | `ai-agents/sprint-manager.ts` | `npm run sprint:status` / `npm run sprint:update` | Sprint logs, task tracker, test coverage report |

**Pipeline flow — adding a new module:**
```
discover → docs:generate → testcases:generate → automation:generate
                                                        ↓
                                              review & fix selectors
                                                        ↓
                              auth-setup → execute → defects:log → heal:analyze → sprint:update
```

---

## npm Scripts Reference

### AI Pipeline
```bash
npm run discover              # Agent 0: Crawl portal UI → discovery/reports/
npm run docs:generate         # Agent 1: Generate page docs → docs/pages/
npm run testcases:generate    # Agent 2: Generate manual test cases → manual-test-cases/
npm run automation:generate   # Agent 3: Generate Playwright specs → automation/tests/
npm run execute               # Agent 4: Run all tests via agent wrapper
npm run execute:login         # Agent 4: Run login tests via agent wrapper
npm run execute:customers     # Agent 4: Run customers tests via agent wrapper
npm run defects:log           # Agent 5: Parse failures, log to BUG_TRACKER.md
npm run heal:analyze          # Agent 6: Analyze selector failures
npm run sprint:status         # Agent 7: View current sprint status
npm run sprint:update         # Agent 7: Update sprint logs and task tracker
```

### Playwright Direct
```bash
npm run test:login            # Login tests (headed, 1 worker)
npm run test:login:positive   # Login positive tests only
npm run test:login:negative   # Login negative tests only
npm run test:customers        # Customers tests (headed, needs auth-setup)
npm run test:regression       # Full regression suite (needs auth-setup)
npm run test:smoke            # Smoke suite (needs auth-setup)
npm run report                # Open HTML report in browser
```

> `execute*` scripts invoke Playwright through the execution agent wrapper and write a per-TC summary to `execution/execution-summary.md`. `test:*` scripts invoke Playwright directly.

---

## Playwright Projects

| Project | Test Match | Auth Required | Use Case |
|---------|-----------|---------------|----------|
| `auth-setup` | `*.setup.ts` | No | One-time login → saves `admin.json` |
| `login-tests` | `login.spec.ts` | No (standalone) | Tests the auth flow directly |
| `smoke` | `*.smoke.spec.ts` | Yes — loads `admin.json` | Quick sanity checks before/after deploys |
| `regression` | `*.spec.ts` (excl. login, smoke) | Yes — loads `admin.json` | Full regression run |

**Execution order:**
```
auth-setup  (run once — creates admin.json)
    │
    ├── smoke        (depends on auth-setup)
    └── regression   (depends on auth-setup)

login-tests  (independent — run any time)
```

---

## Current Test Coverage

| Module | Spec File | Tests | Status |
|--------|-----------|-------|--------|
| Login | `automation/tests/login.spec.ts` | 18 | ✅ All passing |
| Customers | `automation/tests/customers.spec.ts` | 6 | ✅ All passing |
| Configuration | — | — | Sprint 2 — not started |
| Allocation | — | — | Sprint 2 — not started |
| Towers | — | — | Sprint 2 — not started |
| Channel Partners | — | — | Sprint 2 — not started |
| JBP Management | — | — | Sprint 2 — not started |

**Total: 24 automated tests | 0 failures | 5 modules pending**

Login test categories: Positive, Negative, Functional, Security — see `docs/pages/LOGIN.md` for full breakdown.

---

## Sprint Status

**Sprint 1 — Complete**
- Playwright + TypeScript project setup
- `playwright.config.ts` with 4 projects (auth-setup, login-tests, smoke, regression)
- Auth session setup (`auth.setup.ts`)
- Login page object + 18 automated tests
- Customers page object + 6 automated tests
- All 8 AI agent scripts (`ai-agents/`)
- Manual test case docs (`manual-test-cases/`)
- Page documentation (`docs/pages/`)
- Bug tracker (`bugs/BUG_TRACKER.md`)

**Sprint 2 — Planned**
- Configuration module
- Allocation module
- Towers module
- Channel Partners module
- JBP Management module

---

## Project Structure

```
xrportal-qa-framework/
├── .env                              # BASE_URL only (git-ignored)
├── .gitignore
├── playwright.config.ts              # 4 projects: auth-setup, login-tests, smoke, regression
├── package.json
├── tsconfig.json
├── .vscode/                          # VS Code settings + MCP config
│
├── ai-agents/                        # 8 AI agent scripts
│   ├── discovery-agent.ts            # Agent 0: UI crawl
│   ├── page-doc-agent.ts             # Agent 1: page docs
│   ├── testcase-agent.ts             # Agent 2: test case generation
│   ├── automation-agent.ts           # Agent 3: Playwright spec generation
│   ├── execution-agent.ts            # Agent 4: test execution
│   ├── defect-agent.ts               # Agent 5: bug logging
│   ├── healing-agent.ts              # Agent 6: selector analysis (read-only)
│   └── sprint-manager.ts             # Agent 7: sprint tracking
│
├── automation/
│   ├── fixtures/.auth/admin.json     # Saved session (git-ignored)
│   ├── pages/
│   │   ├── base.page.ts              # Shared helpers (search, pagination, etc.)
│   │   ├── login.page.ts
│   │   └── customers.page.ts
│   ├── test-data/
│   │   ├── login-data.json
│   │   ├── customers-data.json
│   │   └── edge-cases.json
│   ├── tests/
│   │   ├── auth.setup.ts             # Saves login session to admin.json
│   │   ├── login.spec.ts             # 18 login tests
│   │   └── customers.spec.ts         # 6 customers tests
│   └── utils/
│       ├── data-generator.ts
│       ├── playwright-helpers.ts
│       └── selector-helper.ts
│
├── bugs/
│   └── BUG_TRACKER.md
│
├── discovery/                        # Output from discovery-agent.ts
│   ├── screenshots/
│   └── reports/
│       ├── portal-map.json
│       └── discovery-report.md
│
├── docs/
│   ├── architecture/
│   │   ├── AGENT-ROLES.md            # All 8 agents: inputs, outputs, rules
│   │   ├── FRAMEWORK-CONFIG.md       # playwright.config.ts deep-dive
│   │   └── PROCESS-FLOW.md           # End-to-end pipeline walkthrough
│   ├── pages/
│   │   ├── LOGIN.md                  # Selectors, methods, 18 test case breakdown
│   │   └── CUSTOMERS.md              # Selectors, methods, 6 test case breakdown
│   ├── project-memory/
│   │   ├── CHANGELOG.md
│   │   ├── SPRINT_LOG.md
│   │   ├── TASK_TRACKER.md
│   │   └── TEST_COVERAGE.md
│   └── selectors/
│       ├── login.json
│       └── customers.json
│
├── execution/
│   ├── execution-summary.md          # Per-TC results from Agent 4
│   └── run-commands.md               # Quick command reference
│
├── manual-test-cases/
│   ├── INDEX.md
│   ├── TC_LOGIN.md
│   └── TC_CUSTOMERS.md
│
└── reports/                          # Git-ignored
    ├── html-report/                  # npx playwright show-report reports/html-report
    └── results.json
```

---

## Tech Stack

| Tool | Version | Role |
|------|---------|------|
| Playwright | 1.58.2 | Browser automation + test runner |
| TypeScript | 5.9.3 | Language |
| ts-node | 10.9.2 | Direct `.ts` script execution |
| dotenv | 17.3.1 | `.env` variable loading |
| csv-writer | 1.6.0 | CSV report output |
| xlsx | 0.18.5 | Excel export |
| Node.js | LTS | Runtime |

---

## Documentation Index

| Document | Path | Contents |
|----------|------|----------|
| Agent Roles | `docs/architecture/AGENT-ROLES.md` | All 8 agents — inputs, outputs, rules |
| Process Flow | `docs/architecture/PROCESS-FLOW.md` | End-to-end pipeline with execution order |
| Framework Config | `docs/architecture/FRAMEWORK-CONFIG.md` | `playwright.config.ts`, scripts, env vars |
| Login Page | `docs/pages/LOGIN.md` | Selectors, methods, all 18 test cases |
| Customers Page | `docs/pages/CUSTOMERS.md` | Selectors, methods, 6 test cases |
| Test Coverage | `docs/project-memory/TEST_COVERAGE.md` | Coverage status per module |
| Sprint Log | `docs/project-memory/SPRINT_LOG.md` | Sprint history |
| Changelog | `docs/project-memory/CHANGELOG.md` | All changes by date |
