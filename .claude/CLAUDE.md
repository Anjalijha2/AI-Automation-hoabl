# CLAUDE.md

AI-powered Playwright QA framework for XR Portal — multi-portal, multi-agent, BRD/FRD-driven.
Execution model: **Sync-pipeline · Portal-wise · Phase-gated** — BRD → Test Cases → Locators → Automation.
4-agent pipeline: BA Agent → Tech Lead Agent → QA Agent → Developer Agent (explicit only).

Language: JavaScript (CommonJS). No TypeScript, no transpile step. Playwright 1.58.2.

---

## Portals

| Portal          | URL                                         | Auth Session                                                |
| --------------- | ------------------------------------------- | ----------------------------------------------------------- |
| Admin           | `https://uat-web.xrportal.in/admin`         | `automation-repository/fixtures/.auth/admin.json`           |
| Sales Manager   | `https://uat-web.xrportal.in/sales-manager` | `automation-repository/fixtures/.auth/sales-manager.json`   |
| Channel Partner | `https://uat-web.xrportal.in/`              | `automation-repository/fixtures/.auth/channel-partner.json` |
| Buyer           | `https://uat.xrportal.in/`                  | `automation-repository/fixtures/.auth/buyer.json`           |
| API             | `https://uat-api.xrportal.in/`              | — (token-based)                                             |

**Treat each portal independently.** Inter-portal data flows must be documented in BRD/FRD to be in scope.

---

## Auth

Mobile OTP — no password. UAT mobile: `8888888888`. Static OTPs are portal-specific:

| Portal          | Static OTP |
| --------------- | ---------- |
| Admin           | `258369`   |
| Sales Manager   | `258369`   |
| Channel Partner | `147258`   |
| Buyer           | `147258`   |

One session file per portal.

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

| Agent           | File                                | Role                                          |
| --------------- | ----------------------------------- | --------------------------------------------- |
| BA Agent        | `.claude/agents/ba_agent.md`        | BRD/FRD interpretation, test case generation  |
| Tech Lead Agent | `.claude/agents/tech_lead_agent.md` | Code scanning, locator maps, self-healing     |
| QA Agent        | `.claude/agents/qa_agent.md`        | All test code, manual QA artefacts, execution |
| Developer Agent | `.claude/agents/developer_agent.md` | App source code — explicit invocation only    |

**BA Agent starts every pipeline. Developer Agent invoked by user only.**

### 14 Skills

| Skill                  | Called By                 |
| ---------------------- | ------------------------- |
| `manual-tester`        | BA Agent                  |
| `test-case-reviewer`   | QA Agent                  |
| `locator-map-builder`  | Tech Lead Agent           |
| `e2e-self-healer`      | QA Agent, Tech Lead Agent |
| `run-e2e`              | QA Agent                  |
| `run-ui-ux`            | QA Agent                  |
| `run-regression`       | QA Agent                  |
| `run-cross-browser`    | QA Agent                  |
| `run-api-tests`        | QA Agent                  |
| `run-db-tests`         | QA Agent                  |
| `generate-report`      | QA Agent                  |
| `generate-user-manual` | QA Agent                  |
| `sync-and-update`      | QA Agent                  |
| `visual-capture`       | Tech Lead Agent           |

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

| Format                             | Source          | Example             |
| ---------------------------------- | --------------- | ------------------- |
| `TC-MODULE-NNN` (hyphens)          | Hand-written    | `TC-LOGIN-001`      |
| `TC_MODULE_TYPE_NNN` (underscores) | Agent-generated | `TC_LOGIN_FUNC_001` |

Type codes: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`

Every `test()` must start with TC_ID. Every test maps to a BRD/FRD requirement ID.

### ENV Skip Guards

```javascript
test.skip(process.env.ENV === "uat", "Skipped on UAT — live gateway");
```

---

## Key File Paths

| File                                                   | Purpose                                   |
| ------------------------------------------------------ | ----------------------------------------- |
| `automation-repository/playwright.config.js`           | Master Playwright config (QA Agent owned) |
| `automation-repository/base/BasePage.js`               | Shared page helpers                       |
| `automation-repository/pages/<portal>/<Module>Page.js` | POMs per portal                           |
| `automation-repository/fixtures/.auth/<portal>.json`   | Saved sessions (git-ignored)              |
| `automation-repository/fixtures/base-test.js`          | DI fixture pattern                        |
| `automation-repository/fixtures/auth.setup.js`         | OTP login → saves sessions                |
| `automation-repository/constants/testData.js`          | BASE_URL, credentials, timeouts           |
| `automation-repository/api/ApiClient.js`               | HTTP client                               |
| `automation-repository/components/`                    | Shared UI component helpers               |
| `locators/<portal>/locator-map.json`                   | Element locator map (Tech Lead Agent)     |
| `db/queries/<entity>.js`                               | DB queries (raw Sequelize, never inline)  |
| `sync/last-synced-commits.json`                        | Sync pointer per repo                     |
| `templates/module-scaffold/`                           | QA Agent scaffolding templates            |

---

## Visual Memory

All UI screenshots and structural documentation live in `visual-memory/<portal>/<module>/`.

| Path                                                     | Purpose                                                        |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| `visual-memory/INDEX.md`                                 | Root index — all portals, all modules, capture status          |
| `visual-memory/<portal>/<module>/INDEX.md`               | Per-module screen documentation (gold standard: `admin/login`) |
| `visual-memory/<portal>/<module>/screenshot-desktop.png` | Initial loaded state at 1920×900                               |
| `visual-memory/<portal>/<module>/screenshot-ui.png`      | UI/UX baseline screenshot                                      |

**Capture status:**

- `FULL` — complete: screenshots + DOM inspection + Key Structural Notes
- `STUB` — screenshots exist, structural notes not yet populated
- `MISSING` — no INDEX.md (BA Agent will block TC generation)

**Owner:** Tech Lead Agent via `visual-capture` skill.
**Consumers:** BA Agent (gate check), `manual-tester` skill (evidence source), `test-case-reviewer` skill (coverage validation).

**Gate rule:** BA Agent will not call `manual-tester` until `visual-memory/<portal>/<module>/INDEX.md` exists.

---

## Dual-Source TC Rule

Every batch of test cases requires BOTH sources. Neither alone is sufficient.

| Source                                          | Answers                                                                                | Used For                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `visual-memory/<portal>/<module>/INDEX.md`      | What does the UI look like? What selectors exist? What is the rendered state?          | Steps, Expected Results, Visual Evidence column   |
| BRD/FRD in `.claude/docs/hoabl-knowledge-base/` | What is this feature for? What business logic drives it? What are acceptance criteria? | Scenario context, business rules, requirement IDs |

**TC generated without screenshots** = assumption-based steps (blocked by visual gate).
**TC generated without BRD/FRD** = steps with no understanding of why the feature exists (blocked by doc gate).

---

## Constraints

1. **LeadSquared (LSQ)**: excluded entirely — no credentials, no API calls
2. **Strapi**: excluded from all source scans — test only downstream portal effects. Admin sidebar "CMS" link → external Strapi (`manage-uat.xrportal.in`) — excluded entirely, do not test
3. **Admin Config module**: sidebar "Config", URL `/admin/cms` (slug kept from old "CMS" name, not yet migrated to `/admin/config`). Canonical visual-memory folder: `visual-memory/admin/config/`. `visual-memory/admin/admin-cms/` is DEPRECATED. Spec files `tests/*/admin/admin-cms.spec.js` must be archived.
4. **Locator Map**: owned exclusively by Tech Lead Agent via `locator-map-builder` skill
5. **BRD/FRD**: sole source of truth — in `.claude/docs/hoabl-knowledge-base/`
6. **No undocumented features**: if not in BRD/FRD, flag and pause
7. **Traceability**: every test must carry a BRD/FRD requirement ID
8. **Test code ownership**: QA Agent owns ALL test specs, POMs, playwright.config.js — Developer Agent never touches
9. **DB queries**: Sequelize QueryInterface + raw SQL only; live in `db/queries/` exclusively
10. **Archival**: deprecated specs → `tests/archived/`; deprecated TCs → `manual-qa-repository/01-test-cases/archived/`; never delete
11. **Developer Agent**: read-only by default; makes source changes only on explicit user instruction

---

## Adding a New Module (Sprint)

1. Tech Lead Agent scans source → calls `locator-map-builder` → updates `locators/<portal>/locator-map.json`
2. Tech Lead Agent calls `visual-capture` → navigates live portal at 1920×900 → writes `visual-memory/<portal>/<module>/INDEX.md`
3. BA Agent checks dual-source gate (visual-memory INDEX.md + BRD/FRD both present) → calls `manual-tester` → produces `TestCases.xlsx` grounded in screenshots and BRD/FRD
4. QA Agent calls `test-case-reviewer` (with INDEX.md path) → validates TCs, visual coverage ≥ 80%, no LOGIC_GAPs
5. QA Agent scaffolds: `automation-repository/pages/<portal>/<Module>Page.js`
6. QA Agent scaffolds: `tests/e2e/<portal>/<module>.spec.js` + 5 other test type specs
7. Run `npm run auth:setup`, then execute all 6 test types
8. Call `generate-report` + `generate-user-manual`
9. Log bugs → `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`

---

## Naming Conventions

| Item        | Convention                                                            | Example                            |
| ----------- | --------------------------------------------------------------------- | ---------------------------------- |
| POM         | `automation-repository/pages/<portal>/<Module>Page.js`                | `pages/admin/LoginPage.js`         |
| E2E spec    | `tests/e2e/<portal>/<module>.spec.js`                                 | `tests/e2e/admin/login.spec.js`    |
| UI spec     | `tests/ui-ux/<portal>/<module>.spec.js`                               | `tests/ui-ux/admin/login.spec.js`  |
| API spec    | `tests/api/<module>.api.spec.js`                                      | `tests/api/allocation.api.spec.js` |
| DB query    | `db/queries/<entity>.js`                                              | `db/queries/booking.js`            |
| Locator map | `locators/<portal>/locator-map.json`                                  | `locators/admin/locator-map.json`  |
| Screen doc  | `manual-qa-repository/03-user-manual/<portal>/<module>.md`            |                                    |
| TC file     | `manual-qa-repository/01-test-cases/<portal>/<module>/TestCases.xlsx` |                                    |
| Bug         | `BUG_NNN` in `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`     | `BUG_001`                          |

---

## Environment Variables

| Variable | Value | Effect                                                                                                       |
| -------- | ----- | ------------------------------------------------------------------------------------------------------------ |
| `ENV`    | `uat` | Skips tests guarded with `test.skip(process.env.ENV === 'uat', ...)` — use on UAT to skip live-gateway tests |

Set inline: `ENV=uat npm run test:e2e:admin`

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
