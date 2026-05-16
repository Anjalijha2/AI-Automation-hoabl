# Framework Configuration — Memory Document

> Update when playwright.config.js, package.json scripts, env vars, or project structure change.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Playwright | 1.58.2 | E2E browser automation + test runner |
| Node.js | LTS | Runtime |
| JavaScript | CommonJS | Language (no TypeScript, no transpile) |
| dotenv | 17.3.1 | Load `.env` vars |
| csv-writer | 1.6.0 | CSV report output |
| xlsx | 0.18.5 | Excel file handling |

---

## playwright.config.js

**File:** `config/playwright.config.js`

### Global Settings

| Setting | Value | Notes |
|---|---|---|
| `testDir` | `./tests` | Where specs live |
| `fullyParallel` | `false` | Sequential execution |
| `retries` | `1` | Retry once on failure |
| `workers` | `1` | One browser at a time |
| `baseURL` | `https://uat-web.xrportal.in/admin` | |
| `actionTimeout` | `15,000 ms` | Per-action timeout |
| `navigationTimeout` | `30,000 ms` | Page load timeout |
| `screenshot` | `'on'` | Always capture |
| `video` | `'retain-on-failure'` | Saved only on failure |
| `trace` | `'on-first-retry'` | Captured on first retry |

### Reporters

| Reporter | Output |
|---|---|
| `html` | `reports/html-report/` |
| `json` | `reports/results.json` |
| `list` | stdout |

### Projects

| Name | Matches | Auth Dependency | Auth State |
|---|---|---|---|
| `auth-setup` | `tests/auth.setup.js` | None | — |
| `login-tests` | `tests/ui/login.spec.js` | None | — (standalone) |
| `smoke` | `tests/smoke/*.spec.js` | `auth-setup` | `automation-repository/fixtures/.auth/admin.json` |
| `regression` | `tests/ui/*.spec.js` | `auth-setup` | `automation-repository/fixtures/.auth/admin.json` |
| `chromium` | all specs | Yes | Cross-browser |
| `firefox` | all specs | Yes | Cross-browser |
| `webkit` | all specs | Yes | Cross-browser |

---

## npm Scripts (package.json)

```bash
# AI Pipeline
npm run discover              # Crawl portal UI → discovery/reports/
npm run docs:generate         # Screen docs → manual-qa-repository/pages/
npm run testcases:generate    # Manual TCs → manual-qa-repository/manual-test-cases/
npm run automation:generate   # Playwright specs → tests/ui/
npm run execute               # Run all tests
npm run defects:log           # Parse failures → bugs/BUG_TRACKER.md
npm run heal:analyze          # Selector analysis (read-only)
npm run sprint:status         # Sprint summary
npm run sprint:update         # Update SPRINT_LOG + TASK_TRACKER

# Playwright Direct
npm run test:login            # Login tests (headed, standalone)
npm run test:customers        # Customers tests (headed, needs auth-setup)
npm run test:regression       # Full regression (headed, needs auth-setup)
npm run test:smoke            # Smoke suite (headed, needs auth-setup)
npm run test:chrome           # Cross-browser — Chromium
npm run test:firefox          # Cross-browser — Firefox
npm run test:webkit           # Cross-browser — WebKit
npm run report                # Open HTML report
```

---

## Environment Variables (.env)

```env
BASE_URL=https://uat-web.xrportal.in/admin
```

| Variable | Used By | Purpose |
|---|---|---|
| `BASE_URL` | Discovery agent, Playwright config | Target portal URL |

> Auth uses hard-coded UAT credentials — mobile `8888888888` / OTP `258369`, not `.env`.

---

## Auth Session File

**Path:** `automation-repository/fixtures/.auth/admin.json`
**Git-ignored:** Yes
**Created by:** `tests/auth.setup.js`
**Used by:** `smoke` and `regression` projects via `storageState`

Re-run auth-setup when session expires:
```bash
npx playwright test --config config/playwright.config.js --project=auth-setup
```

---

## Key File Paths

| File | Purpose |
|---|---|
| `config/playwright.config.js` | Master Playwright config |
| `automation-repository/base/BasePage.js` | Shared page helpers |
| `automation-repository/constants/testData.js` | BASE_URL, credentials, timeouts |
| `automation-repository/fixtures/testFixture.js` | Playwright fixtures |
| `automation-repository/fixtures/.auth/admin.json` | Saved session (git-ignored) |
| `automation-repository/pages/<Module>Page.js` | Page Object Models |
| `automation-repository/utils/selectorHelpers.js` | `loadSelectors(module)` |
| `tests/auth.setup.js` | One-time auth session setup |
| `tests/ui/<module>.spec.js` | Playwright test specs |
| `manual-qa-repository/selectors/<module>.json` | Selector source of truth for AI agents |
| `manual-qa-repository/manual-test-cases/TC_<MODULE>.md` | Manual test cases |
| `reports/html-report/index.html` | Playwright HTML report |
| `reports/results.json` | Raw test results JSON |
| `bugs/BUG_TRACKER.md` | Bug entries (BUG_NNN format) |

---

## TC_ID Conventions

| Format | Source | Example |
|---|---|---|
| `TC-MODULE-NNN` (hyphens) | Hand-written specs | `TC-TWR-001` |
| `TC_MODULE_TYPE_NNN` (underscores) | Agent-generated | `TC_CUST_FUNC_001` |

Type codes: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`

Module prefixes: `LOGIN` `CUST` `CFG` `ALLOC` `TWR` `CP` `JBP`

---

## .gitignore Key Entries

```
node_modules/
.env
automation-repository/fixtures/.auth/
reports/
test-results/
.playwright-mcp-snapshots/
```

---

## Changelog

| Date | Change | Updated By |
|---|---|---|
| 2026-03-11 | Initial config reference created | Claude |
| 2026-05-16 | Rewritten for JS (CommonJS), updated all paths to new folder structure | Claude |
