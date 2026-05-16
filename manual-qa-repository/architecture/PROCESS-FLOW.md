# Process Flow — XR Portal QA Framework

> End-to-end pipeline: AI-driven discovery → test case generation → automation → execution.
> Update when pipeline steps, scripts, or agents change.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                XR Portal QA — 3-Agent AI Pipeline                   │
│                                                                     │
│  BA ORCHESTRATOR                                                    │
│       │                                                             │
│       ├── XR MANUAL QA                                             │
│       │     Phase 1: Discovery → Phase 2: Screen Docs              │
│       │     Phase 3: Test Cases → Phase 4: Defect Logging          │
│       │                                                             │
│       └── AUTOMATION QA ENGINEER                                   │
│             Phase 1: Script Gen → Phase 2: Execution               │
│             Phase 3: Healing Analysis                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0 — Authentication Setup

**Script:** `tests/auth.setup.js`
**Command:** `npx playwright test --config config/playwright.config.js --project=auth-setup`
**Output:** `automation-repository/fixtures/.auth/admin.json`

### What it does
1. Navigates to `https://uat-web.xrportal.in/admin`
2. Enters mobile `8888888888`, submits OTP `258369`
3. Waits for "Customers" text visible and URL `/customers`
4. Saves full session (cookies + localStorage + sessionStorage) to `admin.json`

### When to re-run
- Session expired (protected-page tests start failing on login redirect)
- `admin.json` deleted
- UAT credentials changed

---

## Phase 1 — Discovery Crawl

**Script:** `automation-repository/discovery/config-discovery.js`
**Command:** `npm run discover`
**Claude Code agent:** `xr-manual-qa` — Phase 1

### Inputs
- `.env` `BASE_URL`
- Portal at `https://uat-web.xrportal.in/admin`

### What it does
1. Logs into portal via Playwright
2. Reads all sidebar/navigation links
3. For each module/page:
   - Takes full-page screenshot → `discovery/screenshots/`
   - Records all interactive elements (buttons, inputs, selects, tables, tabs, modals)
4. Outputs structured discovery reports

### Outputs
```
discovery/
├── screenshots/
│   ├── customers.png
│   └── ...
└── reports/
    ├── portal-map.json         ← JSON: modules[], elements[], tables[], observations[]
    └── discovery-report.md     ← Markdown: one section per module
```

---

## Phase 2 — Screen Documentation

**Script:** `automation-repository/agents/page-doc-agent.js`
**Command:** `npm run docs:generate`
**Claude Code agent:** `xr-manual-qa` — Phase 2

### Inputs
- `discovery/reports/portal-map.json`
- `discovery/reports/discovery-report.md`

### What it does
- Documents each screen across 12 dimensions (purpose, selectors, workflows, UI states, etc.)

### Outputs
```
manual-qa-repository/
├── pages/<MODULE>.md           ← 12-dimension screen doc
└── selectors/<module>.json     ← Source of truth for AI agents
```

---

## Phase 3 — Test Case Design

**Script:** `automation-repository/agents/testcase-agent.js`
**Command:** `npm run testcases:generate`
**Claude Code agent:** `xr-manual-qa` — Phase 3

### Inputs
- `manual-qa-repository/pages/<MODULE>.md`
- `brd/<module>.md`

### What it does
Generates manual test cases across 15 types:
`UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`

Each TC has: ID, priority, pre-conditions, steps, expected result, automatable flag.

### Outputs
```
manual-qa-repository/manual-test-cases/TC_<MODULE>.md
```

TC_ID format: `TC_MODULE_TYPE_NNN` (e.g. `TC_CUST_FUNC_001`)

---

## Phase 4 — Script Generation

**Script:** `automation-repository/agents/automation-agent.js`
**Command:** `npm run automation:generate`
**Claude Code agent:** `automation-qa-engineer` — Phase 1

### Inputs
- BA-approved TCs from `manual-qa-repository/manual-test-cases/TC_<MODULE>.md`
- Selectors from `manual-qa-repository/selectors/<module>.json`

### What it does
- Converts approved TCs to Playwright specs following Page Object Model
- Creates/updates page object in `automation-repository/pages/<Module>Page.js`

### Outputs
```
automation-repository/pages/<Module>Page.js   ← Page Object (if new)
tests/ui/<module>.spec.js                      ← Playwright test spec
```

**Rule:** Never overwrites existing spec files without explicit approval.

---

## Phase 5 — Test Execution

**Script:** `automation-repository/agents/execution-agent.js`
**Command:** `npm run execute` or `npm run test:regression`
**Claude Code agent:** `automation-qa-engineer` — Phase 2

### Execution order
```
auth-setup  (run once — creates admin.json)
    │
    ├── smoke      (depends on auth-setup)
    └── regression (depends on auth-setup)

login-tests (independent — run any time)
```

### Outputs
```
reports/html-report/    ← HTML report (npm run report to open)
reports/results.json    ← Machine-readable per-TC results
reports/screenshots/    ← Always-on screenshots
test-results/           ← Trace on first retry
```

---

## Phase 6 — Defect Logging

**Script:** `automation-repository/agents/defect-agent.js`
**Command:** `npm run defects:log`
**Claude Code agent:** `xr-manual-qa` — Phase 4

### Inputs
- `reports/results.json`

### What it does
- Parses failures, root-causes each, creates structured bug entries

### Outputs
```
bugs/BUG_TRACKER.md    ← format: BUG_NNN
```

---

## Phase 7 — Healing Analysis

**Script:** `automation-repository/agents/healing-agent.js`
**Command:** `npm run heal:analyze`
**Claude Code agent:** `automation-qa-engineer` — Phase 3

### What it does
- Read-only analysis of selector/timing failures
- Suggests minimal fixes

### Outputs
```
healing-reports/fix-recommendations.md
```

**Rule:** Never modifies scripts directly. Fixes applied only after explicit user approval.

---

## Phase 8 — Sprint Management

**Script:** `automation-repository/agents/sprint-manager.js`
**Command:** `npm run sprint:status` / `npm run sprint:update`
**Claude Code agent:** `ba-pipeline-orchestrator`

### Outputs
```
manual-qa-repository/SPRINT_LOG.md
manual-qa-repository/TASK_TRACKER.md
manual-qa-repository/test-coverage.md
manual-qa-repository/CHANGELOG.md
```

---

## Full Execution Sequence (New Module)

```
1. DISCOVER
   npm run discover
   → portal crawl → discovery/reports/

2. SCREEN DOCS
   npm run docs:generate
   → manual-qa-repository/pages/<MODULE>.md
   → manual-qa-repository/selectors/<module>.json

3. TEST CASES
   npm run testcases:generate
   → manual-qa-repository/manual-test-cases/TC_<MODULE>.md
   → BA sign-off required before proceeding

4. SCRIPT GENERATION
   npm run automation:generate
   → automation-repository/pages/<Module>Page.js (if new)
   → tests/ui/<module>.spec.js

5. AUTH SETUP (if not done)
   npx playwright test --config config/playwright.config.js --project=auth-setup

6. EXECUTE
   npm run test:<module>  (--headed --workers=1)
   → reports/results.json

7. DEFECTS
   npm run defects:log
   → bugs/BUG_TRACKER.md

8. HEAL (if failures)
   npm run heal:analyze
   → healing-reports/fix-recommendations.md

9. SPRINT UPDATE
   npm run sprint:update
   → manual-qa-repository/SPRINT_LOG.md
```

---

## Environment Variables (`.env`)

```env
BASE_URL=https://uat-web.xrportal.in/admin
```

> `.env` is git-ignored. Auth uses static UAT credentials — mobile `8888888888` / OTP `258369`.

---

## Changelog

| Date | Change | Updated By |
|---|---|---|
| 2026-03-11 | Initial process flow document created | Claude |
| 2026-05-16 | Rewritten for JS (CommonJS), 3-agent Claude Code setup, new folder structure | Claude |
