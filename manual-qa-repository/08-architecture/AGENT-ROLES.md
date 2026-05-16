# Agent Roles & Responsibilities

## BA Pipeline Orchestrator (`ba-pipeline-orchestrator`)

**Role:** Orchestrator — controls pipeline gates, sprint management, domain expertise

### Responsibilities
- Analyze BRDs and apply real estate domain knowledge
- Raise clarifications before pipeline starts
- Enforce gate conditions between phases (no phase skips)
- Track sprint progress, update SPRINT_LOG + TASK_TRACKER
- Maintain xr-portal-vault (project memory)
- Final sign-off on test cases before automation begins

### Outputs
- `manual-qa-repository/SPRINT_LOG.md`
- `manual-qa-repository/TASK_TRACKER.md`
- `manual-qa-repository/test-coverage.md`
- `manual-qa-repository/CHANGELOG.md`

### Rule
Always the entry point. No Manual QA or Automation QA phase starts without BA gate approval.

---

## XR Manual QA (`xr-manual-qa`)

**Role:** Discovery + Documentation + Test Design + Defect Logging

### Phase 1 — UI Discovery
- Crawl XR Portal Admin UI (`https://uat-web.xrportal.in/admin`)
- Map all pages, modules, navigation flows
- Extract DOM selectors (inputs, buttons, tables, filters, dropdowns)
- Capture screenshots
- Output: `discovery/reports/`

### Phase 2 — Screen Documentation
- Read discovery outputs
- Document each screen across 12 dimensions
- Output: `manual-qa-repository/03-user-manual/pages/<MODULE>.md`
- **Rule:** Selector JSON is source of truth for AI agents (see selectors note below)

### Phase 3 — Test Case Design
- Read page docs + BRD
- Generate manual test cases across 15 types: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`
- Output: `manual-qa-repository/01-test-cases/<module>/TC_<MODULE>.md`
- **Rule:** Every TC maps to BRD requirement; TC_IDs use `TC_MODULE_TYPE_NNN` format

### Phase 4 — Defect Logging
- Parse `reports/results.json` for failures
- Root-cause each failure, create structured bug entries
- Output: `manual-qa-repository/04-bug-reports/BUG_TRACKER.md` (format: `BUG_NNN`)

---

## Automation QA Engineer (`automation-qa-engineer`)

**Role:** Script Generation + Test Execution + Healing Analysis

### Phase 1 — Script Generation
- Convert BA-approved test cases to Playwright scripts
- Follow Page Object Model (`automation-repository/pages/<Module>Page.js` extending `BasePage`)
- Output: `tests/e2e/<module>.spec.js`
- **Rule:** Never overwrite existing spec files without explicit approval

### Phase 2 — Test Execution
- Run Playwright suites via `npm run test:<module>` or `npm run test:regression`
- Capture results per TC_ID
- Output: `reports/results.json`, `reports/html-report/`, `test-results/`
- **Rule:** Always run auth-setup before protected tests; always `--workers=1` with `--headed`

### Phase 3 — Healing Analysis
- Analyze selector/timing failures from test results
- Produce fix recommendations — read-only, no direct edits
- Output: `healing-reports/fix-recommendations.md`
- **Rule:** Fixes applied only after explicit user approval

---

## Selector Source of Truth

- **Page objects use:** `automation-repository/pages/*.js`
- **AI agents read:** selector JSON files generated during discovery
- Fix UI breaks in page object first, then update JSON

---

## Pipeline Flow

```
BA Orchestrator
  └── gate check → XR Manual QA (Phase 1: Discovery)
                      └── gate check → XR Manual QA (Phase 2: Screen Docs)
                                          └── gate check → XR Manual QA (Phase 3: TCs)
                                                              └── BA sign-off → Automation QA (Phase 1: Scripts)
                                                                                  └── gate check → Automation QA (Phase 2: Execution)
                                                                                                      └── failures? → XR Manual QA (Phase 4: Defects)
                                                                                                                    → Automation QA (Phase 3: Healing)
```
