# Framework Configuration

> Update when playwright.config.js, package.json scripts, env vars, or project structure change.

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
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

| Setting | Value |
|---------|-------|
| `testDir` | `./tests` |
| `fullyParallel` | `false` |
| `retries` | `1` (CI: `2`) |
| `workers` | `1` |
| `baseURL` | `https://uat-web.xrportal.in/admin` |
| `screenshot` | `'on'` |
| `video` | `'retain-on-failure'` |
| `trace` | `'on-first-retry'` |

### Projects

| Name | Test Match | Auth Dependency |
|------|-----------|----------------|
| `auth-setup` | `tests/auth.setup.js` | None |
| `login-tests` | `tests/e2e/login.spec.js` | None |
| `smoke` | `tests/smoke/` | `auth-setup` |
| `regression` | `tests/e2e/` | `auth-setup` |
| `chromium/firefox/webkit` | `tests/e2e/` | `auth-setup` |

---

## npm Scripts

```bash
npm run auth:setup         # Save session → automation-repository/fixtures/.auth/admin.json
npm run test:login         # Login tests (standalone)
npm run test:smoke         # Smoke suite
npm run test:regression    # Full regression
npm run test:chrome/firefox/webkit  # Cross-browser
npm run report             # Open HTML report
npm run discover           # Portal discovery
npm run docs:generate      # Screen docs
npm run testcases:generate # Manual TCs
npm run automation:generate # Playwright specs
npm run execute            # Run all tests
npm run defects:log        # Log failures to BUG_TRACKER
npm run heal:analyze       # Selector analysis (read-only)
npm run sprint:status      # Sprint summary
npm run sprint:update      # Update sprint docs
```

---

## Key File Paths

| File | Purpose |
|------|---------|
| `config/playwright.config.js` | Master Playwright config |
| `automation-repository/pages/BasePage.js` | Shared page helpers |
| `automation-repository/pages/LoginPage.js` | Login POM |
| `automation-repository/constants/testData.js` | BASE_URL, credentials, timeouts |
| `automation-repository/fixtures/base-test.js` | DI fixture pattern |
| `automation-repository/fixtures/.auth/admin.json` | Saved session (git-ignored) |
| `automation-repository/api/ApiClient.js` | HTTP client |
| `automation-repository/utils/WaitUtil.js` | pollUntil, retry, sleep |
| `tests/auth.setup.js` | One-time auth session setup |
| `tests/e2e/<module>.spec.js` | Playwright test specs |
| `manual-qa-repository/01-test-cases/` | Manual test cases |
| `reports/html-report/index.html` | HTML report |
| `reports/results.json` | Raw JSON results |
| `manual-qa-repository/04-bug-reports/BUG_TRACKER.md` | Bug entries |

---

## TC_ID Conventions

| Format | Source | Example |
|--------|--------|---------|
| `TC-MODULE-NNN` (hyphens) | Hand-written | `TC-LOGIN-001` |
| `TC_MODULE_TYPE_NNN` (underscores) | Agent-generated | `TC_LOGIN_FUNC_001` |

Type codes: `UI` `FUNC` `VAL` `E2E` `API` `DB` `INT` `BIZ` `REG` `EXP` `NEG` `EDGE` `XMOD` `DC` `WF`

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

| Date | Change |
|------|--------|
| 2026-05-16 | Updated for sprint-wise model, new numbered folder structure |
