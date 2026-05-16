# Agent Roles & Responsibilities

4-agent system. BA Agent starts every pipeline. Developer Agent explicit-only.

---

## BA Agent (`ba_agent.md`)

**Role:** BRD/FRD interpretation, requirements ownership, test case generation

### Responsibilities
- Read BRD/FRD from `.claude/docs/hoabl-knowledge-base/`
- Call `manual-tester` skill → produce `TestCases.xlsx` + `test-data-spec.md`
- Cross-check source changes against BRD/FRD during sync (Step 2 gate)
- Flag undocumented features — never infer
- Sign off on TCs before QA Agent automates

### Outputs
- `manual-qa-repository/01-test-cases/<portal>/<module>/TestCases.xlsx`
- `manual-qa-repository/01-test-cases/<portal>/<module>/test-data-spec.md`
- `sync/doc-change-summary.md`

### Rule
Entry point for every new module and every sync pipeline run.

---

## Tech Lead Agent (`tech_lead_agent.md`)

**Role:** Source code scanning, locator map ownership, self-healing

### Responsibilities
- Scan `source-code/` for component changes (Strapi excluded)
- Call `locator-map-builder` skill → update `locators/<portal>/locator-map.json`
- Call `e2e-self-healer` skill proactively when source changes affect selectors
- Produce `sync/change-manifest.json` and `sync/handoff-note.md`

### Outputs
- `locators/<portal>/locator-map.json`
- `sync/change-manifest.json`
- `sync/handoff-note.md`

### Rule
Owns locator maps exclusively. Never touches test specs or manual QA artefacts.

---

## QA Agent (`qa_agent.md`)

**Role:** All test code, manual QA artefacts, execution

### Phase 1 — TC Review
- Call `test-case-reviewer` skill → validate TestCases.xlsx against BRD/FRD

### Phase 2 — Scaffold & Implement
- Scaffold POMs: `automation-repository/pages/<portal>/<Module>Page.js`
- Scaffold 6 test type specs per module

### Phase 3 — Execute
- Run all 6 test types per module
- Call `generate-report` → `manual-qa-repository/06-test-runs/`
- Call `generate-user-manual` → `manual-qa-repository/03-user-manual/`
- Log failures → `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`

### Rule
Owns ALL test specs, POMs, `playwright.config.js`. Developer Agent never touches these.

---

## Developer Agent (`developer_agent.md`)

**Role:** App source code — explicit user invocation only

### Rule
Read-only by default. Makes source changes only when user explicitly instructs.
Never touches test files, POMs, playwright.config.js, locator maps, or manual QA artefacts.

---

## Locator Map Ownership

- `locators/<portal>/locator-map.json` — owned by Tech Lead Agent
- `automation-repository/pages/<portal>/*.js` — POMs consume locator map, owned by QA Agent
- Fix UI breaks: Tech Lead updates locator map → QA Agent updates POM

---

## 4-Step Sync Pipeline

```
Step 1 — Tech Lead Agent: scan source-code/ → update locator-map.json → change-manifest.json
Step 2 — BA Agent: cross-check change-manifest vs BRD/FRD → sign off or raise clarification
Step 3 — QA Agent (Manual): update affected TCs in TestCases.xlsx
Step 4 — QA Agent (Automation): heal affected specs → re-execute → generate-report
```

Trigger: `npm run sync`
