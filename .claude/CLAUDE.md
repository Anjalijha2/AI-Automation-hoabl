# CLAUDE.md

AI-powered Playwright QA framework for XR Portal Admin (`https://uat-web.xrportal.in/admin`).
8-agent pipeline: discover → doc → testcase → automate → execute → defect → heal → sprint.
Hand-maintained Playwright specs follow Page Object Model.

Language: JavaScript (CommonJS). No TypeScript, no transpile step.

---

## Auth

Mobile OTP — no password. UAT has static OTP.

```bash
# Run once before smoke/regression
npx playwright test --config config/playwright.config.js --project=auth-setup
```

Re-run when: protected tests redirect to login, or `src/fixtures/.auth/admin.json` deleted.
`login-tests` needs no saved session. All other projects depend on `admin.json`.

---

## Test Commands

```bash
# Single spec
npx playwright test tests/ui/towers.spec.js --config config/playwright.config.js --project=regression --headed --workers=1

# By TC_ID
npx playwright test --config config/playwright.config.js -g "TC-TWR-001" --headed

# Named suites
npm run test:login        # 22 tests — standalone
npm run test:customers    # 17 tests — needs auth-setup
npm run test:regression   # full suite — needs auth-setup
npm run test:smoke        # 2 smoke tests — needs auth-setup
npm run test:chrome / test:firefox / test:webkit
npm run report            # open HTML report

# CI
HEADLESS=true npm run test:regression
```

**Always `--workers=1` with `--headed`** — multiple headed windows conflict.

---

## AI Agent Pipeline

```bash
npm run discover              # Agent 0: crawl portal UI → discovery/reports/
npm run docs:generate         # Agent 1: page docs → docs/pages/
npm run testcases:generate    # Agent 2: manual TCs → docs/manual-test-cases/
npm run automation:generate   # Agent 3: Playwright specs → tests/ui/
npm run execute               # Agent 4: run tests
npm run defects:log           # Agent 5: parse failures → bugs/BUG_TRACKER.md
npm run heal:analyze          # Agent 6: broken selector analysis (read-only)
npm run sprint:status         # Agent 7: sprint summary
npm run sprint:update         # Agent 7: update SPRINT_LOG + TASK_TRACKER
```

---

## Architecture

### Page Object Model

All page objects: `src/pages/*.js`, extend `BasePage` (`src/base/BasePage.js`).

Two consumption patterns:
1. **Direct** (most specs): `new TowersPage(page)` in `beforeEach`
2. **Fixture** (login/customers/config): via `src/fixtures/testFixture.js`

### Selectors

- **`src/pages/*.js`** — primary, what tests use
- **`docs/selectors/*.json`** — source of truth for AI agents via `selectorHelpers.loadSelectors('module')`

Fix UI breaks in page object first, then update JSON.

### TC_ID Convention

| Format | Source | Example |
|--------|--------|---------|
| `TC-MODULE-NNN` (hyphens) | Hand-written | `TC-TWR-001` |
| `TC_MODULE_TYPE_NNN` (underscores) | Agent-generated | `TC_ALLOC_E2E_001` |

Type codes: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`
Module prefixes: `LOGIN` `CUST` `CFG` `ALLOC` `TWR` `CP` `JBP`

### ENV Skip Guards

```javascript
test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway');
```

### KPI Baselines

`towers.spec.js` pins KPI values from UAT 2026-04-04. Update `KPI_BASELINE` if tower/unit counts change.

---

## Key Constants

`src/constants/testData.js` — UAT credentials, BASE_URL, timeouts, viewport.

```javascript
const { VALID_MOBILE, VALID_OTP, DEFAULT_TIMEOUT } = require('../../src/constants/testData.js');
```

Auth: mobile `8888888888` / OTP `258369` → saves to `src/fixtures/.auth/admin.json`.

---

## Adding a New Module

1. Create `src/pages/<Module>Page.js` extending `BasePage`
2. Create `tests/ui/<module>.spec.js` with auth storageState
3. Add `npm run test:<module>` to `package.json`
4. Log TCs in `docs/manual-test-cases/TC_<MODULE>.md`, update `docs/test-coverage.md`
5. Run auth-setup, then the new spec

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Page object file | `<Module>Page.js` | `TowersPage.js` |
| Spec file | `<module>.spec.js` | `towers.spec.js` |
| Page doc | `docs/pages/<MODULE>.md` | `TOWERS.md` |
| Selector JSON | `docs/selectors/<module>.json` | `towers.json` |
| TC file | `docs/manual-test-cases/TC_<MOD>.md` | `TC_TOWERS.md` |
| BRD | `brd/<module>.md` | `towers.md` |
| Bug | `BUG_NNN` in `bugs/BUG_TRACKER.md` | `BUG_011` |

---

## Reports & Bugs

- HTML report: `reports/html-report/` — `npm run report`
- JSON results: `reports/results.json` — parsed by `defect-agent.js`
- Screenshots: `test-results/` + `reports/screenshots/`
- Bug tracker: `bugs/BUG_TRACKER.md`
- Sprint log: `docs/SPRINT_LOG.md`

---

## .claude/ Structure

```
.claude/
├── CLAUDE.md                        # This file
├── settings.json / settings.local.json
├── agent-memory/                    # Persistent memory per agent
│   ├── ba-pipeline-orchestrator/    # BA Agent memory (MEMORY.md + md files)
│   ├── automation-qa-engineer/      # Automation QA memory (empty)
│   └── xr-manual-qa/               # Manual QA memory (empty)
├── rules/                           # Path-scoped coding rules (auto-loaded)
│   ├── page-objects.md              # src/pages/**, src/base/**
│   ├── specs.md                     # tests/**/*.spec.js
│   └── selectors.md                 # docs/selectors/**
├── agents/                          # Claude Code subagents
│   ├── ba-pipeline-orchestrator.md
│   ├── xr-manual-qa.md
│   ├── automation-qa-engineer.md
│   ├── qa-reviewer.md
│   └── test-healer.md
├── skills/                          # Invokable workflows (each has SKILL.md)
│   ├── ba-orchestrate/              # BA Agent skill domains
│   ├── mqa-discover/                # Manual QA skill domains + 15 test types
│   ├── aqa-engineer/                # Automation QA skill domains
│   ├── defect-report/               # Parse failures → bug reports
│   ├── gen-test/                    # Scaffold new spec file
│   └── new-page-object/             # Scaffold new POM class
├── commands/                        # /ba:*, /mqa:*, /aqa:* command refs
└── docs/                            # Reference docs read by skills on demand
    ├── agent-prompts/               # Antigravity system prompts (3 agents)
    └── antigravity-setup.md         # 3-session wiring guide
```

### Antigravity Multi-Agent Setup

| Session | System Prompt | Subagent | Role |
|---------|--------------|---------|------|
| `XR — BA Agent` | `docs/agent-prompts/ba-agent.md` | `ba-pipeline-orchestrator.md` | Orchestrator |
| `XR — Manual QA` | `docs/agent-prompts/manual-qa-agent.md` | `xr-manual-qa.md` | Discovery + TCs + Bugs |
| `XR — Automation QA` | `docs/agent-prompts/automation-qa-agent.md` | `automation-qa-engineer.md` | Scripts + Execution + Healing |

Always start from BA Agent. See `.claude/docs/antigravity-setup.md` for full wiring.
