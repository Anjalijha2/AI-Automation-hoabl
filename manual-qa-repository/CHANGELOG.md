# Changelog

## 2026-05-16

- Rebuilt `manual-qa-repository/` with numbered 01–09 folder structure
  - `01-test-cases/` — TC files per module (INDEX + login/customers/etc.)
  - `02-testing-types/` — smoke, regression, sanity, UAT sign-off, retesting, exploratory
  - `03-user-manual/` — ADMIN-GUIDE + per-screen docs (12 dimensions)
  - `04-bug-reports/` — BUG_TRACKER (BUG_001–010), BUG_METRICS, templates
  - `05-environments/` — UAT, DEV, ENV-STRATEGY, test-accounts
  - `06-test-runs/` — execution summaries per sprint per environment
  - `07-execution/` — run-commands, ENV-skip-log, UAT-vs-DEV-delta
  - `08-architecture/` — AGENT-ROLES, PROCESS-FLOW, FRAMEWORK-CONFIG, QA-STRATEGY
  - `09-templates/` — TC, screen-doc, execution-summary templates
- Removed old flat structure (architecture/, execution/, manual-test-cases/, pages/, portals/, selectors/, user-manuals/, sprints/)
- TC_LOGIN.md created: 22 test cases across UI/FUNC/VAL/NEG/EDGE/BIZ/E2E types
- DASHBOARD.md created: live project status
- README.md: new manual QA navigation guide
- Repository restructured to sprint-wise, portal-wise model (2026-05-16)
- Automation repository restructured with DI fixture pattern, BasePage, LoginPage, ApiClient, WaitUtil
- `tests/ui/` → `tests/e2e/`; added `tests/visual/`
- `playwright.config.js` updated for new directory structure
- `package.json` updated with `auth:setup` script, cleaned stale entries
