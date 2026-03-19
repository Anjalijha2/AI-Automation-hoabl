# Agent Roles & Responsibilities

## Agent 0 — Discovery Agent (`discovery-agent.ts`)
- Crawl the web application UI
- Map all pages, modules, navigation
- Extract DOM selectors (inputs, buttons, tables, filters)
- Capture screenshots of each page
- Output: `discovery/portal-map.json`, `discovery/dom-selectors.json`
- **RULE:** Does NOT generate test cases or automation scripts

## Agent 1 — Page Documentation Agent (`page-doc-agent.ts`)
- Read discovery outputs
- Create structured page memory (Markdown)
- Document selectors, workflows, execution commands
- Output: `docs/pages/<MODULE>.md`, `docs/selectors/<module>.json`

## Agent 2 — Test Case Generator Agent (`testcase-agent.ts`)
- Read page docs and BRD
- Generate manual test cases (Positive, Negative, Security, Boundary)
- Output: `manual-test-cases/TC_<MODULE>.md`
- **RULE:** Every test case must map to a BRD requirement

## Agent 3 — Automation Script Generator Agent (`automation-agent.ts`)
- Convert approved test cases to Playwright scripts
- Follow Page Object Model
- **RULE:** Never overwrite existing spec files

## Agent 4 — Test Execution Agent (`execution-agent.ts`)
- Run Playwright suites
- Capture results per TC_ID
- Output: `execution/execution-summary.md`

## Agent 5 — Defect Tracking Agent (`defect-agent.ts`)
- Parse failed test results
- Create structured bug entries
- Output: `bugs/BUG_TRACKER.md`

## Agent 6 — Script Healing Agent (`healing-agent.ts`)
- Analyze selector/timing failures
- Suggest improvements
- **RULE:** Never modify scripts directly

## Agent 7 — Sprint & Knowledge Manager (`sprint-manager.ts`)
- Generate sprint logs, task tracker, changelog
- Maintain test coverage report
- Output: `docs/project-memory/`
