# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

AI-powered Playwright QA framework for XR Portal Admin (`https://uat-web.xrportal.in/admin`). Uses an 8-agent pipeline (discover → doc → testcase → automate → execute → defect → heal → sprint) plus hand-maintained Playwright specs following Page Object Model.

Language: JavaScript (CommonJS). No TypeScript, no transpile step.

---

## Auth — Required Before Most Tests

Authentication uses **Mobile OTP** (no password). UAT has a static OTP.

```bash
# Run once before smoke/regression — saves session to src/fixtures/.auth/admin.json
npx playwright test --config config/playwright.config.js --project=auth-setup
```

Re-run when: protected tests fail with redirect to login, or `admin.json` is deleted.

`login-tests` is the only standalone project — it tests the auth flow itself and needs no saved session. All other projects (smoke, regression, chromium, firefox, webkit) depend on `admin.json`.

---

## Test Commands

```bash
# Single spec (most common)
npx playwright test tests/ui/towers.spec.js --config config/playwright.config.js --project=regression --headed --workers=1

# By test ID grep
npx playwright test --config config/playwright.config.js -g "TC-TWR-001" --headed

# Named suites
npm run test:login        # 22 login tests — standalone, no auth-setup needed
npm run test:customers    # 17 tests — needs auth-setup
npm run test:regression   # full suite — needs auth-setup
npm run test:smoke        # 2 smoke tests — needs auth-setup

# Cross-browser
npm run test:chrome / test:firefox / test:webkit

# Report
npm run report            # opens reports/html-report in browser
```

**Always use `--workers=1` with `--headed`** — multiple headed windows conflict.

Set `HEADLESS=true` for CI: `HEADLESS=true npm run test:regression`

---

## AI Agent Pipeline

Run in sequence to fully automate a new module:

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

All page objects live in `src/pages/*.js` and extend `BasePage` from `src/base/BasePage.js`.

`BasePage` provides: `navigate(urlPath)`, `click(sel)`, `fill(sel, val)`, `getText(sel)`, `waitForElement(sel)`, `waitForNetworkIdle()`, `screenshot(label)`, `pause(ms)`.

**Two ways to consume page objects in specs:**

1. **Direct** (most specs): instantiate in `beforeEach`
   ```js
   const { TowersPage } = require('../../src/pages/TowersPage.js');
   test.beforeEach(async ({ page }) => { towers = new TowersPage(page); });
   ```

2. **Fixture** (login/customers/config): pre-built page objects via `testFixture.js`
   ```js
   const { test, expect } = require('../../src/fixtures/testFixture.js');
   test('example', async ({ loginPage, customersPage, configPage }) => { ... });
   ```
   `testFixture.js` only wraps LoginPage, CustomersPage, ConfigPage — other pages use approach 1.

### Selectors

Selectors have two locations:
- **In page object constructors** (`src/pages/*.js`) — primary, what tests actually use
- **`docs/selectors/*.json`** — secondary source of truth used by AI agents via `selectorHelpers.loadSelectors('module')`

When UI changes break selectors, fix in the page object class. Update `docs/selectors/` if agents need to re-generate.

### Auth Session Flow

`tests/auth.setup.js` logs in with mobile `8888888888` / OTP `258369` and saves `storageState` to `src/fixtures/.auth/admin.json`. Protected specs reference it with:
```js
test.use({ storageState: 'src/fixtures/.auth/admin.json' });
```

### Test ID Convention

Two formats coexist:

- **Hand-written specs**: `TC-MODULE-NNN` (hyphens) — e.g., `TC-TWR-001`, `TC-CP-012`
- **Agent-generated specs**: `TC_MODULE_TYPE_NNN` (underscores + type code) — e.g., `TC_ALLOC_E2E_001`, `TC_LOGIN_NEG_005`

Type codes: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`

Module prefixes: `LOGIN`, `CUST`, `CFG`, `ALLOC`, `TWR`, `CP`, `JBP`.

### ENV Skip Guards

Some tests are skipped on UAT for flows that hit live payment gateways or prod-only features. Pattern:
```js
test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live gateway');
```

### KPI Baselines

`towers.spec.js` pins KPI values captured from UAT on 2026-04-04. If tower/unit counts change due to real data changes, update the `KPI_BASELINE` constant at the top of that file.

### Path Aliases (jsconfig.json)

Available but not always used — `require()` with relative paths is more common in this codebase:
```
@base/*      → src/base/*
@pages/*     → src/pages/*
@utils/*     → src/utils/*
@fixtures/*  → src/fixtures/*
@constants/* → src/constants/*
@agents/*    → src/agents/*
```

---

## Key Constants

`src/constants/testData.js` — UAT credentials, BASE_URL, timeouts, viewport. Import instead of hard-coding values:
```js
const { VALID_MOBILE, VALID_OTP, DEFAULT_TIMEOUT } = require('../../src/constants/testData.js');
```

---

## Adding a New Module

1. Create `src/pages/<Module>Page.js` extending `BasePage`
2. Create `tests/ui/<module>.spec.js` with `test.use({ storageState: 'src/fixtures/.auth/admin.json' })`
3. Add `npm run test:<module>` script to `package.json`
4. Log new TCs in `docs/manual-test-cases/` and update `docs/test-coverage.md`
5. Run auth-setup, then the new spec

---

## Reports & Bugs

- **HTML report**: `reports/html-report/` — open with `npm run report`
- **JSON results**: `reports/results.json` — parsed by `defect-agent.js`
- **Screenshots**: `test-results/` + `reports/screenshots/`
- **Bug tracker**: `bugs/BUG_TRACKER.md` — BUG_001 through BUG_010 (BUG_010 open)
- **Sprint log**: `docs/SPRINT_LOG.md`

---

## .claude/ Directory Structure

```
.claude/
├── agents/
│   ├── ba-agent.md              # BA Agent — orchestrator, domain expert, pipeline governor
│   ├── manual-qa-agent.md       # Manual QA Agent — discovery, screen docs, TCs, defects
│   ├── automation-qa-agent.md   # Automation QA Agent — script gen, execution, healing
│   ├── qa-reviewer.md           # Claude Code subagent — spec file reviewer
│   └── test-healer.md           # Claude Code subagent — failing test diagnoser
├── commands/
│   ├── ba-commands.md           # /ba:* command reference
│   ├── manual-qa-commands.md    # /mqa:* command reference
│   └── automation-qa-commands.md # /aqa:* command reference
├── skills/
│   ├── ba-skills.md             # BA Agent skill domains
│   ├── manual-qa-skills.md      # Manual QA skill domains (incl. all 15 test types)
│   └── automation-qa-skills.md  # Automation QA skill domains
└── setup/
    └── antigravity-setup.md     # Antigravity 3-session wiring guide
```

### Antigravity Multi-Agent Setup

3 Antigravity sessions map to 3 agents. See `.claude/setup/antigravity-setup.md` for full wiring.

| Session | System Prompt Source | Role |
|---------|---------------------|------|
| `XR — BA Agent` | `.claude/agents/ba-agent.md` | Orchestrator |
| `XR — Manual QA` | `.claude/agents/manual-qa-agent.md` | Discovery + TCs + Bugs |
| `XR — Automation QA` | `.claude/agents/automation-qa-agent.md` | Scripts + Execution + Healing |

Always start from BA Agent session. BA Agent triggers the others.
