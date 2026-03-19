# Framework Configuration — Memory Document

> Update this file whenever you change playwright.config.ts, package.json scripts,
> environment variables, or project structure. Add a row to the Changelog.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Playwright | 1.58.2 | E2E browser automation |
| TypeScript | 5.9.3 | Language |
| ts-node | 10.9.2 | Run `.ts` files directly |
| dotenv | 17.3.1 | Load `.env` vars |
| csv-writer | 1.6.0 | CSV report output |
| xlsx | 0.18.5 | Excel export |
| Node.js | LTS | Runtime |

---

## playwright.config.ts

**File:** `playwright.config.ts` (project root)

### Global Settings

| Setting | Value | Notes |
|---|---|---|
| `testDir` | `./automation/tests` | Where specs live |
| `fullyParallel` | `false` | Sequential execution |
| `forbidOnly` | `true` in CI | Prevents `.only` in CI |
| `retries` | `1` | Retry once on failure |
| `workers` | `1` | One browser at a time |
| `baseURL` | `https://uat-web.xrportal.in/admin` | |
| `actionTimeout` | `15,000 ms` | Per-action timeout |
| `navigationTimeout` | `30,000 ms` | Page load timeout |
| `slowMo` | `500 ms` | Delay between actions (real-user feel) |
| `screenshot` | `'on'` | Always capture screenshots |
| `video` | `'retain-on-failure'` | Video saved only on failure |
| `trace` | `'on-first-retry'` | Trace captured on first retry |

### Reporters

| Reporter | Output | Notes |
|---|---|---|
| `html` | `reports/html-report/` | `open: 'never'` (view manually) |
| `json` | `reports/results.json` | Machine-readable results |
| `list` | stdout | Console output during run |

### Projects

| Name | Matches | Auth Dependency | Auth State |
|---|---|---|---|
| `auth-setup` | `*.setup.ts` | None | — |
| `login-tests` | `login.spec.ts` | None | — (standalone) |
| `smoke` | `*.smoke.spec.ts` | `auth-setup` | `./automation/fixtures/.auth/admin.json` |
| `regression` | `*.spec.ts` (excl. smoke & login) | `auth-setup` | `./automation/fixtures/.auth/admin.json` |

---

## npm Scripts (package.json)

```bash
# AI Pipeline
npm run discover              # Phase 1: Crawl portal
npm run generate:testcases    # Phase 2: Generate test case MDs
npm run generate:automation   # Phase 3: Generate Playwright specs

# Test Execution
npm test                      # Run all tests (headless)
npm run test:login            # Login tests (headed, 1 worker)
npm run test:login:positive   # Login positive tests only (-g "POSITIVE")
npm run test:login:negative   # Login negative tests only (-g "NEGATIVE")
npm run test:login:debug      # Login tests in debug mode
npm run test:customers        # Customers tests (headed)
npm run test:smoke            # Smoke suite
npm run test:regression       # Full regression
npm run test:headed           # All tests headed
npm run test:debug            # All tests debug mode

# Reports
npm run report                # Open HTML report in browser
```

### Raw script definitions
```json
{
  "discover": "npx ts-node ai-agent/discovery-crawler.ts",
  "generate:testcases": "npx ts-node ai-agent/test-case-generator.ts",
  "generate:automation": "npx ts-node ai-agent/automation-generator.ts",
  "test": "npx playwright test",
  "test:login": "npx playwright test --project=login-tests --headed --workers=1",
  "test:login:positive": "npx playwright test --project=login-tests --headed --workers=1 -g \"POSITIVE\"",
  "test:login:negative": "npx playwright test --project=login-tests --headed --workers=1 -g \"NEGATIVE\"",
  "test:login:debug": "npx playwright test --project=login-tests --debug automation/tests/login.spec.ts",
  "test:customers": "npx playwright test automation/tests/customers.spec.ts --project=regression --headed --workers=1",
  "test:smoke": "npx playwright test --project=smoke",
  "test:regression": "npx playwright test --project=regression",
  "test:headed": "npx playwright test --headed --workers=1",
  "test:debug": "npx playwright test --debug",
  "report": "npx playwright show-report reports/html-report"
}
```

---

## TypeScript Config (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "moduleResolution": "node"
  },
  "include": ["automation/**/*.ts", "ai-agent/**/*.ts"]
}
```

---

## Environment Variables (.env)

> `.env` is git-ignored. Copy `.env.example` or recreate manually.

```env
BASE_URL=https://uat-web.xrportal.in/admin
LOGIN_EMAIL=your_admin_email@example.com
LOGIN_PASSWORD=your_password
SCREENSHOT_DIR=./discovery/screenshots
REPORT_DIR=./discovery/reports
MAX_DEPTH=3
```

| Variable | Used By | Purpose |
|---|---|---|
| `BASE_URL` | Discovery crawler, Playwright config | Target portal URL |
| `LOGIN_EMAIL` | Discovery crawler | Admin login credential |
| `LOGIN_PASSWORD` | Discovery crawler | Admin login credential |
| `SCREENSHOT_DIR` | Discovery crawler | Where crawl screenshots are saved |
| `REPORT_DIR` | Discovery crawler | Where portal-map.json / discovery-report.md go |
| `MAX_DEPTH` | Discovery crawler | How deep to crawl nested navigation (default 3) |

> Note: Playwright test specs use hard-coded UAT credentials (`8888888888` / `258369`), not `.env` values.

---

## Auth Session File

**Path:** `automation/fixtures/.auth/admin.json`
**Git-ignored:** Yes
**Created by:** `auth.setup.ts` (via `page.context().storageState()`)
**Used by:** `smoke` and `regression` projects via `storageState` config

If this file is missing or expired, run:
```bash
npx playwright test --project=auth-setup
```

---

## .gitignore Key Entries

```
node_modules/
dist/
.env
discovery/videos/
reports/
automation/fixtures/.auth/
```

---

## VS Code Setup (.vscode/)

| File | Purpose |
|---|---|
| `extensions.json` | Recommended extensions (Playwright, Prettier, TypeScript) |
| `settings.json` | MCP server (Playwright), Copilot Chat agent enabled, Prettier as formatter |
| `mcp.json` | MCP server configuration for Playwright |

---

## Key File Paths (Quick Reference)

| File | Purpose |
|---|---|
| `playwright.config.ts` | Master Playwright config |
| `automation/pages/login.page.ts` | Login page object |
| `automation/pages/customers.page.ts` | Customers page object |
| `automation/tests/auth.setup.ts` | One-time auth session setup |
| `automation/tests/login.spec.ts` | Login test suite (18 tests) |
| `automation/tests/customers.spec.ts` | Customers test suite (6 tests) |
| `automation/fixtures/.auth/admin.json` | Saved session state (git-ignored) |
| `ai-agent/discovery-crawler.ts` | Phase 1: portal crawl |
| `ai-agent/test-case-generator.ts` | Phase 2: test case generation |
| `ai-agent/automation-generator.ts` | Phase 3: spec generation |
| `discovery/reports/portal-map.json` | Crawl output (machine-readable) |
| `discovery/reports/discovery-report.md` | Crawl output (human-readable) |
| `manual-test-cases/INDEX.md` | Generated test case index |
| `reports/html-report/index.html` | Playwright HTML report |
| `reports/results.json` | Raw test results JSON |

---

## Test Naming Conventions

| Prefix | Category | Example |
|---|---|---|
| `TC_POS_` | Positive | `TC_POS_001` |
| `TC_NEG_` | Negative | `TC_NEG_006` |
| `TC_FUNC_` | Functionality | `TC_FUNC_003` |
| `TC_SEC_` | Security | `TC_SEC_001` |
| `TC_CUST_` | Customers module | `TC_CUST_004` |

---

## Changelog

| Date | Change | Updated By |
|---|---|---|
| 2026-03-11 | Initial config reference document created | Claude |
