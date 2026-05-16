# CLAUDE.md

AI-powered Playwright QA framework for XR Portal — multi-portal, multi-agent, BRD/FRD-driven.
Execution model: **Sync-pipeline · Portal-wise · Phase-gated** — BRD → Test Cases → Locators → Automation.
4-agent pipeline: BA Agent → Tech Lead Agent → QA Agent → Developer Agent (explicit only).

Language: JavaScript (CommonJS). No TypeScript, no transpile step. Playwright 1.58.2.

---

## Portals

| Portal | URL | Auth Session |
|--------|-----|-------------|
| Admin | `https://uat-web.xrportal.in/admin` | `automation-repository/fixtures/.auth/admin.json` |
| Sales Manager | `https://uat-web.xrportal.in/sales-manager` | `automation-repository/fixtures/.auth/sales-manager.json` |
| Channel Partner | `https://uat-web.xrportal.in/` | `automation-repository/fixtures/.auth/channel-partner.json` |
| Buyer | `https://uat.xrportal.in/` | `automation-repository/fixtures/.auth/buyer.json` |
| API | `https://uat-api.xrportal.in/` | — (token-based) |

**Treat each portal independently.** Inter-portal data flows must be documented in BRD/FRD to be in scope.

---

## Auth

Mobile OTP — no password. UAT: Mobile `8888888888` / OTP `258369` (static). One session file per portal.

```bash
npm run auth:setup          # sets up all portal sessions
# or per-portal:
npx playwright test --config automation-repository/playwright.config.js --project=auth-setup
```

Re-run when protected tests redirect to login or session files deleted.

---

## Test Commands

```bash
# Auth
npm run auth:setup

# E2E
npm run test:e2e:admin
npm run test:e2e:sales-manager
npm run test:e2e:channel-partner
npm run test:e2e:buyer

# UI/UX
npm run test:ui:admin

# Regression
npm run test:regression:admin

# Smoke
npm run test:smoke

# Cross-browser
npm run test:chrome
npm run test:firefox
npm run test:webkit

# API
npm run test:api

# DB
npm run test:db

# Login (standalone)
npm run test:login

# Full
npm run test:all

# Report
npm run report

# Sync pipeline
npm run sync
```

**Always `--workers=1` with `--headed`** — multiple headed windows conflict.

---

## AI Agent Pipeline

```bash
npm run sync                  # Full 4-step sync pipeline (Tech Lead → BA → QA Manual → QA Auto)
npm run discover              # Crawl portal UI → discovery/reports/
npm run generate:report       # Parse results.json → execution-summary.md
npm run sprint:status         # Sprint summary
npm run sprint:update         # Update SPRINT_LOG + TASK_TRACKER
```

---

## Architecture

### 4-Agent System

| Agent | File | Role |
|-------|------|------|
| BA Agent | `.claude/agents/ba_agent.md` | BRD/FRD interpretation, test case generation |
| Tech Lead Agent | `.claude/agents/tech_lead_agent.md` | Code scanning, locator maps, self-healing |
| QA Agent | `.claude/agents/qa_agent.md` | All test code, manual QA artefacts, execution |
| Developer Agent | `.claude/agents/developer_agent.md` | App source code — explicit invocation only |

**BA Agent starts every pipeline. Developer Agent invoked by user only.**

### 13 Skills

| Skill | Called By |
|-------|-----------|
| `manual-tester` | BA Agent |
| `test-case-reviewer` | QA Agent |
| `locator-map-builder` | Tech Lead Agent |
| `e2e-self-healer` | QA Agent, Tech Lead Agent |
| `run-e2e` | QA Agent |
| `run-ui-ux` | QA Agent |
| `run-regression` | QA Agent |
| `run-cross-browser` | QA Agent |
| `run-api-tests` | QA Agent |
| `run-db-tests` | QA Agent |
| `generate-report` | QA Agent |
| `generate-user-manual` | QA Agent |
| `sync-and-update` | QA Agent |

**Skills never call agents. Agents call skills. Non-negotiable.**

### Sync Pipeline (4 Steps)

```
Step 1 — Tech Lead Agent: detect changes → update locator maps → e2e-self-healer
Step 2 — BA Agent: update BRD/FRD sections → produce doc-change-summary.md
Step 3 — QA Agent (Manual): update TestCases.xlsx → test-data-spec.md → tracking docs
Step 4 — QA Agent (Automation): sync specs → execute 6 test types → generate-report → generate-user-manual
```

Trigger: `npm run sync`

### Page Object Model

All POMs: `automation-repository/pages/<portal>/<Module>Page.js`, extend `BasePage`.

```javascript
// Fixture pattern (recommended)
const { test, expect } = require('../../../automation-repository/fixtures/base-test');
test('my test', async ({ loginPage }) => { ... });

// Direct pattern (also valid)
const { LoginPage } = require('../../../automation-repository/pages/admin/LoginPage');
const loginPage = new LoginPage(page);
```

### Selectors / Locator Maps

- **`locators/<portal>/locator-map.json`** — Element Locator Map, owned by Tech Lead Agent
- **`automation-repository/pages/<portal>/*.js`** — POMs consume locator map
- Fix UI breaks in locator map first via Tech Lead Agent, then POM reflects update

### TC_ID Convention

| Format | Source | Example |
|--------|--------|---------|
| `TC-MODULE-NNN` (hyphens) | Hand-written | `TC-LOGIN-001` |
| `TC_MODULE_TYPE_NNN` (underscores) | Agent-generated | `TC_LOGIN_FUNC_001` |

Type codes: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`

Every `test()` must start with TC_ID. Every test maps to a BRD/FRD requirement ID.

### ENV Skip Guards

```javascript
test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway');
```

---

## Key File Paths

| File | Purpose |
|------|---------|
| `automation-repository/playwright.config.js` | Master Playwright config (QA Agent owned) |
| `automation-repository/base/BasePage.js` | Shared page helpers |
| `automation-repository/pages/<portal>/<Module>Page.js` | POMs per portal |
| `automation-repository/fixtures/.auth/<portal>.json` | Saved sessions (git-ignored) |
| `automation-repository/fixtures/base-test.js` | DI fixture pattern |
| `automation-repository/fixtures/auth.setup.js` | OTP login → saves sessions |
| `automation-repository/constants/testData.js` | BASE_URL, credentials, timeouts |
| `automation-repository/api/ApiClient.js` | HTTP client |
| `locators/<portal>/locator-map.json` | Element locator map (Tech Lead Agent) |
| `db/queries/<entity>.js` | DB queries (raw Sequelize, never inline) |
| `sync/last-synced-commits.json` | Sync pointer per repo |
| `templates/module-scaffold/` | QA Agent scaffolding templates |

---

## Constraints

1. **LeadSquared (LSQ)**: excluded entirely — no credentials, no API calls
2. **Strapi**: excluded from all source scans — test only downstream portal effects
3. **Locator Map**: owned exclusively by Tech Lead Agent via `locator-map-builder` skill
4. **BRD/FRD**: sole source of truth — in `.claude/docs/hoabl-knowledge-base/`
5. **No undocumented features**: if not in BRD/FRD, flag and pause
6. **Traceability**: every test must carry a BRD/FRD requirement ID
7. **Test code ownership**: QA Agent owns ALL test specs, POMs, playwright.config.js — Developer Agent never touches
8. **DB queries**: Sequelize QueryInterface + raw SQL only; live in `db/queries/` exclusively
9. **Archival**: deprecated specs → `tests/archived/`; deprecated TCs → `manual-qa-repository/01-test-cases/archived/`; never delete
10. **Developer Agent**: read-only by default; makes source changes only on explicit user instruction

---

## Adding a New Module (Sprint)

1. BA Agent reads BRD/FRD → calls `manual-tester` → produces `TestCases.xlsx`
2. Tech Lead Agent scans source → calls `locator-map-builder` → updates `locators/<portal>/locator-map.json`
3. QA Agent calls `test-case-reviewer` → validates TCs
4. QA Agent scaffolds: `automation-repository/pages/<portal>/<Module>Page.js`
5. QA Agent scaffolds: `tests/e2e/<portal>/<module>.spec.js` + 5 other test type specs
6. Run `npm run auth:setup`, then execute all 6 test types
7. Call `generate-report` + `generate-user-manual`
8. Log bugs → `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| POM | `automation-repository/pages/<portal>/<Module>Page.js` | `pages/admin/LoginPage.js` |
| E2E spec | `tests/e2e/<portal>/<module>.spec.js` | `tests/e2e/admin/login.spec.js` |
| UI spec | `tests/ui-ux/<portal>/<module>.spec.js` | `tests/ui-ux/admin/login.spec.js` |
| API spec | `tests/api/<module>.api.spec.js` | `tests/api/allocation.api.spec.js` |
| DB query | `db/queries/<entity>.js` | `db/queries/booking.js` |
| Locator map | `locators/<portal>/locator-map.json` | `locators/admin/locator-map.json` |
| Screen doc | `manual-qa-repository/03-user-manual/<portal>/<module>.md` | |
| TC file | `manual-qa-repository/01-test-cases/<portal>/<module>/TestCases.xlsx` | |
| Bug | `BUG_NNN` in `manual-qa-repository/04-bug-reports/BUG_TRACKER.md` | `BUG_001` |

---

## Reports & Bugs

- HTML report: `reports/html-report/` — `npm run report`
- JSON results: `reports/results.json`
- Run-specific: `reports/<run-id>/report.html` + `report.json` + `summary.md`
- Screenshots: `test-results/`
- Bug tracker: `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`
- Execution summaries: `manual-qa-repository/06-test-runs/`
- Sprint log: `manual-qa-repository/SPRINT_LOG.md`
- Task tracker: `manual-qa-repository/TASK_TRACKER.md`

---

## .claude/ Structure

```
.claude/
├── CLAUDE.md
├── settings.json / settings.local.json
├── agents/
│   ├── ba_agent.md
│   ├── tech_lead_agent.md
│   ├── qa_agent.md
│   └── developer_agent.md
├── skills/
│   ├── manual-tester.md
│   ├── test-case-reviewer.md
│   ├── locator-map-builder.md
│   ├── e2e-self-healer.md
│   ├── run-e2e.md
│   ├── run-ui-ux.md
│   ├── run-regression.md
│   ├── run-cross-browser.md
│   ├── run-api-tests.md
│   ├── run-db-tests.md
│   ├── generate-report.md
│   ├── generate-user-manual.md
│   └── sync-and-update.md
├── rules/
│   ├── page-objects.md
│   ├── specs.md
│   └── selectors.md
└── docs/
    └── hoabl-knowledge-base/    ← BRD/FRD — sole source of truth
```
