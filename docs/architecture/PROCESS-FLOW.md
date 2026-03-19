# Process Flow — XR Portal QA Framework

> This document captures the complete end-to-end process flow:
> AI-driven discovery → test case generation → automation → execution.
> Update this file when the pipeline steps, scripts, or agents change.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│              XR Portal QA — 3-Phase AI Pipeline             │
│                                                             │
│  PHASE 1          PHASE 2              PHASE 3              │
│  Discovery   →  Test Case Gen   →   Automation              │
│  (Crawl)        (AI write cases)    (Run tests)             │
│                                                             │
│  ai-agent/        ai-agent/          automation/            │
│  discovery-       test-case-         tests/*.spec.ts        │
│  crawler.ts       generator.ts                              │
│                   ai-agent/                                 │
│                   automation-                               │
│                   generator.ts                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 0 — Authentication Setup

**Script:** `automation/tests/auth.setup.ts`
**Command:** `npx playwright test --project=auth-setup`
**Output:** `automation/fixtures/.auth/admin.json`

### What it does
1. Navigates to `https://uat-web.xrportal.in/admin`
2. Calls `login.login(VALID_MOBILE, VALID_OTP)` (UI-based login)
3. Waits for "Customers" text visible and URL `/customers`
4. Saves full session (cookies + localStorage + sessionStorage) to `admin.json`

### When to re-run
- Session expired (tests start failing on navigation to protected pages)
- `admin.json` was deleted
- OTP or mobile credentials changed

### Credentials (UAT)
```
VALID_MOBILE = '8888888888'
VALID_OTP    = '258369'     ← static UAT OTP; update both here and in login.spec.ts if changed
```

---

## Phase 1 — Discovery Crawl

**Script:** `ai-agent/discovery-crawler.ts`
**Command:** `npx ts-node ai-agent/discovery-crawler.ts`

### Inputs
- `.env` credentials (`BASE_URL`, `LOGIN_EMAIL`, `LOGIN_PASSWORD`)
- `MAX_DEPTH=3` (how deep to crawl nested nav)

### What it does
1. Logs into the portal automatically via Playwright
2. Reads all sidebar/navigation links
3. For each module/page:
   - Takes a full-page screenshot → `discovery/screenshots/`
   - Records all interactive elements:
     - Buttons, input fields, selects, checkboxes
     - Tables: headers, row count, has search/filter/pagination
     - Tabs, modals (if opened)
     - Observations (what the module does)
4. Outputs:
   - `discovery/reports/portal-map.json` — structured machine-readable map
   - `discovery/reports/discovery-report.md` — human-readable summary

### Outputs

```
discovery/
├── screenshots/
│   ├── customers.png
│   ├── config.png
│   └── ...
└── reports/
    ├── portal-map.json         ← JSON: modules[], each with elements[], tables[], observations[]
    └── discovery-report.md     ← Markdown: one section per module
```

### portal-map.json Structure
```json
{
  "url": "https://uat-web.xrportal.in/admin",
  "crawledAt": "2026-03-11T...",
  "modules": [
    {
      "name": "Customers",
      "url": "/admin/customers",
      "elements": [
        { "type": "input", "label": "Search by Phone", "selector": "..." }
      ],
      "tables": [
        { "headers": ["Registration Details", "..."], "rowCount": 10, "hasSearch": true }
      ],
      "observations": ["Shows customer list with stat cards"]
    }
  ]
}
```

---

## Phase 2 — Test Case Generation

**Script:** `ai-agent/test-case-generator.ts`
**Command:** `npx ts-node ai-agent/test-case-generator.ts`

### Inputs
- `discovery/reports/discovery-report.md`
- (optionally) `discovery/reports/portal-map.json`

### What it does
1. Reads discovery report
2. For each module, generates structured test cases covering:
   - **Positive** — happy path
   - **Negative** — invalid/edge inputs
   - **Boundary** — min/max values
   - **Security** — XSS, injection
   - **Usability** — UI element checks
3. Each test case has:
   - **ID**: `TC_<MODULE>_<NNN>` (auto-incremented)
   - **Category**: positive / negative / boundary / security / usability
   - **Priority**: P0 / P1 / P2 / P3
   - **Pre-conditions** + **Post-conditions**
   - **Steps** (numbered)
   - **Expected Result**
   - **Automatable**: true/false + notes

### Outputs

```
manual-test-cases/
├── INDEX.md              ← Master list of all test cases
├── login.md              ← Login module test cases
├── customers.md          ← Customers module test cases
└── <module>.md           ← One file per discovered module
```

---

## Phase 3 — Automation Generation

**Script:** `ai-agent/automation-generator.ts`
**Command:** `npx ts-node ai-agent/automation-generator.ts`

### Inputs
- Test case `.md` files from `manual-test-cases/`
- (optionally) `portal-map.json` for selectors

### What it does
1. Reads each test case file
2. Generates ready-to-run Playwright TypeScript:
   - **Page Objects** — selectors + action methods
   - **Test Specs** — one `test()` per test case, with assertions
   - **Base helpers** — shared utilities

### Outputs

Generated files dropped into:
```
automation/
├── pages/
│   └── <module>.page.ts   ← Page object with selectors + methods
└── tests/
    └── <module>.spec.ts   ← Playwright test spec
```

---

## Phase 4 — Test Execution

### Projects and their usage

| Project Name | Test Files | Needs Auth | Use Case |
|---|---|---|---|
| `auth-setup` | `*.setup.ts` | No | Saves session once |
| `login-tests` | `login.spec.ts` | No (standalone) | Login UI tests |
| `smoke` | `*.smoke.spec.ts` | Yes (`admin.json`) | Quick sanity check |
| `regression` | `*.spec.ts` (excl. login, smoke) | Yes (`admin.json`) | Full regression |

### Execution order
```
auth-setup  (runs first — creates admin.json)
     │
     ├── login-tests  (independent — tests its own auth flow)
     ├── smoke        (depends on auth-setup)
     └── regression   (depends on auth-setup)
```

### Test output artifacts

| Artifact | Location | When Created |
|---|---|---|
| HTML Report | `reports/html-report/index.html` | Every run |
| JSON Results | `reports/results.json` | Every run |
| Screenshots | `reports/screenshots/` | Every test (always-on) |
| Videos | `reports/videos/` (embedded) | Retained on failure |
| Trace | `test-results/` | On first retry |

---

## Full Execution Sequence (New Module)

```
1. DISCOVER
   npx ts-node ai-agent/discovery-crawler.ts
   → Reads portal → outputs portal-map.json + discovery-report.md

2. GENERATE TEST CASES
   npx ts-node ai-agent/test-case-generator.ts
   → Reads discovery → outputs manual-test-cases/<module>.md

3. GENERATE AUTOMATION
   npx ts-node ai-agent/automation-generator.ts
   → Reads test cases → outputs automation/pages/<module>.page.ts
                                   automation/tests/<module>.spec.ts

4. REVIEW & REFINE
   → Manually review generated selectors and test logic
   → Update docs/pages/<MODULE>.md

5. SETUP AUTH (if not done)
   npx playwright test --project=auth-setup

6. RUN TESTS
   npx playwright test --project=regression --headed --workers=1

7. VIEW REPORT
   npx playwright show-report reports/html-report
```

---

## Environment Variables (`.env`)

```env
BASE_URL=https://uat-web.xrportal.in/admin
LOGIN_EMAIL=your_admin_email@example.com
LOGIN_PASSWORD=your_password
SCREENSHOT_DIR=./discovery/screenshots
REPORT_DIR=./discovery/reports
MAX_DEPTH=3
```

> `.env` is git-ignored. Never commit it.

---

## Adding a New Page (Checklist)

When a new module/page needs to be tested:

- [ ] Run discovery crawler to capture the new page
- [ ] Review `discovery-report.md` for the new module
- [ ] Run test case generator (or write test cases manually)
- [ ] Create `automation/pages/<new-page>.page.ts` with Page Object
- [ ] Create `automation/tests/<new-page>.spec.ts` with test suite
- [ ] Create `docs/pages/<NEW-PAGE>.md` (copy CUSTOMERS.md as template)
- [ ] Add the page to [INDEX.md](INDEX.md) pages table
- [ ] Run tests and verify all pass
- [ ] Update changelog in all affected MD files

---

## Changelog

| Date | Change | Updated By |
|---|---|---|
| 2026-03-11 | Initial process flow document created | Claude |
