# CLAUDE.md

AI-powered Playwright QA framework for XR Portal Admin (`https://uat-web.xrportal.in/admin`).
Execution model: **Sprint-wise · Portal-wise** — Documentation → Test Cases → Automation.
3-agent pipeline: BA Orchestrator → Manual QA → Automation QA.

Language: JavaScript (CommonJS). No TypeScript, no transpile step.

---

## Auth

Mobile OTP — no password. UAT has static OTP.

```bash
npm run auth:setup
# or directly:
npx playwright test --config automation-repository/playwright.config.js --project=auth-setup
```

Re-run when: protected tests redirect to login, or `automation-repository/01-fixtures/.auth/admin.json` deleted.
`login-tests` needs no saved session. All other projects depend on `admin.json`.

---

## Test Commands

```bash
# Single spec
npx playwright test tests/e2e/<module>.spec.js --config automation-repository/playwright.config.js --project=regression --headed --workers=1

# By TC_ID
npx playwright test --config automation-repository/playwright.config.js -g "TC-LOGIN-001" --headed

# Named suites
npm run test:login        # standalone
npm run test:regression   # full suite — needs auth-setup
npm run test:smoke        # smoke — needs auth-setup
npm run test:chrome / test:firefox / test:webkit
npm run report            # open HTML report

# CI
HEADLESS=true npm run test:regression
```

**Always `--workers=1` with `--headed`** — multiple headed windows conflict.

---

## AI Agent Pipeline

```bash
npm run discover              # Crawl portal UI → discovery/reports/
npm run docs:generate         # Screen docs → manual-qa-repository/sprints/
npm run testcases:generate    # Manual TCs → manual-qa-repository/sprints/
npm run automation:generate   # Playwright specs → tests/e2e/
npm run execute               # Run tests → reports/results.json
npm run defects:log           # Parse failures → bugs/BUG_TRACKER.md
npm run heal:analyze          # Selector analysis (read-only)
npm run sprint:status         # Sprint summary
npm run sprint:update         # Update SPRINT_LOG + TASK_TRACKER
```

---

## Architecture

### Sprint-wise Execution

Each sprint covers one portal:
1. **Portal Documentation** — discover UI, document all screens (12 dimensions)
2. **Manual Test Cases** — design TCs across 15 types, BA sign-off required
3. **Automation Scripts** — generate Playwright specs from approved TCs

All artifacts live in: `manual-qa-repository/` (numbered 01–09 folders)

### Page Object Model

All page objects: `automation-repository/02-pages/*.js`, extend `BasePage`.

Fixture pattern (recommended): via `automation-repository/01-fixtures/base-test.js`
```javascript
const { test, expect } = require('../../automation-repository/01-fixtures/base-test');
test('my test', async ({ loginPage }) => { ... });
```

Direct pattern (also valid):
```javascript
const { LoginPage } = require('../../automation-repository/02-pages/LoginPage');
const loginPage = new LoginPage(page);
```

### Selectors

- **`automation-repository/02-pages/*.js`** — primary, what tests use
- **Selector JSON** (generated during discovery, stored alongside screen docs) — source of truth for AI agents

Fix UI breaks in page object first, then update JSON.

### TC_ID Convention

| Format | Source | Example |
|--------|--------|---------|
| `TC-MODULE-NNN` (hyphens) | Hand-written | `TC-LOGIN-001` |
| `TC_MODULE_TYPE_NNN` (underscores) | Agent-generated | `TC_LOGIN_FUNC_001` |

Type codes: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`

### ENV Skip Guards

```javascript
test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway');
```

---

## Key Constants

`automation-repository/07-constants/testData.js` — UAT credentials, BASE_URL, timeouts, viewport.

Auth: mobile `8888888888` / OTP `258369` → saves to `automation-repository/01-fixtures/.auth/admin.json`.

---

## Adding a New Portal (Sprint)

1. Run discovery: `npm run discover`
2. Document screens → `manual-qa-repository/03-user-manual/pages/<MODULE>.md`
3. Design test cases → `manual-qa-repository/01-test-cases/<portal>/<module>/TC_<MODULE>.md` (BA sign-off required)
4. Create `automation-repository/02-pages/<Portal>Page.js` extending `BasePage`
5. Create `tests/e2e/<portal>.spec.js` using `base-test` fixtures
6. Run auth-setup, then execute suite
7. Log bugs → `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`
8. Log execution summary → `manual-qa-repository/06-test-runs/<env>/sprint-N/`

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Page object | `automation-repository/02-pages/<Portal>Page.js` | `LoginPage.js` |
| Spec file | `tests/e2e/<portal>.spec.js` | `login.spec.js` |
| Screen doc | `manual-qa-repository/03-user-manual/pages/<PORTAL>.md` | `LOGIN.md` |
| TC file | `manual-qa-repository/01-test-cases/<portal>/<module>/TC_<MODULE>.md` | `TC_LOGIN.md` |
| Bug | `BUG_NNN` in `manual-qa-repository/04-bug-reports/BUG_TRACKER.md` | `BUG_001` |
| Execution summary | `manual-qa-repository/06-test-runs/<env>/sprint-N/execution-summary.md` | — |

---

## Reports & Bugs

- HTML report: `reports/html-report/` — `npm run report`
- JSON results: `reports/results.json`
- Screenshots: `test-results/`
- Bug tracker: `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`
- Execution summaries: `manual-qa-repository/06-test-runs/`
- Sprint log: `manual-qa-repository/SPRINT_LOG.md`
- Task tracker: `manual-qa-repository/TASK_TRACKER.md`
- Test coverage: `manual-qa-repository/test-coverage.md`
- Dashboard: `manual-qa-repository/DASHBOARD.md`

---

## .claude/ Structure

```
.claude/
├── CLAUDE.md                        # This file
├── settings.json / settings.local.json
├── agent-memory/                    # Persistent memory per agent
│   ├── ba-pipeline-orchestrator/    # BA Agent memory (MEMORY.md + md files)
│   ├── automation-qa-engineer/      # Automation QA memory
│   └── xr-manual-qa/               # Manual QA memory
├── rules/                           # Path-scoped coding rules (auto-loaded)
│   ├── page-objects.md              # automation-repository/02-pages/**
│   ├── specs.md                     # tests/**/*.spec.js
│   └── selectors.md                 # manual-qa-repository/sprints/**/03-selectors/**
├── agents/                          # Claude Code subagents
│   ├── ba-pipeline-orchestrator.md
│   ├── xr-manual-qa.md
│   ├── automation-qa-engineer.md
│   ├── qa-reviewer.md
│   └── test-healer.md
├── skills/                          # Invokable workflows
│   ├── ba-orchestrate/
│   ├── mqa-discover/
│   ├── aqa-engineer/
│   ├── defect-report/
│   ├── gen-test/
│   └── new-page-object/
├── commands/                        # /ba:*, /mqa:*, /aqa:* command refs
└── docs/                            # Reference docs read by skills on demand
    ├── agent-prompts/               # 3 agent system prompts
    └── antigravity-setup.md
```

### Antigravity Multi-Agent Setup

| Session | System Prompt | Subagent | Role |
|---------|--------------|---------|------|
| `XR — BA Agent` | `docs/agent-prompts/ba-agent.md` | `ba-pipeline-orchestrator.md` | Orchestrator |
| `XR — Manual QA` | `docs/agent-prompts/manual-qa-agent.md` | `xr-manual-qa.md` | Discovery + TCs + Bugs |
| `XR — Automation QA` | `docs/agent-prompts/automation-qa-agent.md` | `automation-qa-engineer.md` | Scripts + Execution + Healing |

Always start from BA Agent. See `.claude/docs/antigravity-setup.md` for full wiring.
