# XR Portal QA Framework — Documentation Index

> **How to use this docs folder**
> Each file here is a living memory document. When any change is made to
> a page, selector, test case, or config — update the corresponding MD file
> and add an entry to its `## Changelog` section.

---

## Project Summary

| Property | Value |
|---|---|
| **App Under Test** | XR Portal Admin (UAT) |
| **URL** | https://uat-web.xrportal.in/admin |
| **Auth Method** | Mobile OTP (2-step, no password) |
| **Framework** | Playwright + TypeScript (Page Object Model) |
| **Test Runner** | `npx playwright test` |
| **Workers** | 1 (sequential) |
| **Valid Mobile** | `8888888888` |
| **Static OTP** | `258369` (UAT-only, update if changed) |

---

## Pages

| Page | Source File | Tests | Documentation |
|---|---|---|---|
| Login | [login.page.ts](../automation/pages/login.page.ts) | [login.spec.ts](../automation/tests/login.spec.ts) | [LOGIN.md](pages/LOGIN.md) |
| Customers | [customers.page.ts](../automation/pages/customers.page.ts) | [customers.spec.ts](../automation/tests/customers.spec.ts) | [CUSTOMERS.md](pages/CUSTOMERS.md) |

---

## Other Documents

| Document | Purpose |
|---|---|
| [PROCESS-FLOW.md](PROCESS-FLOW.md) | End-to-end flow: Discovery → Test Gen → Automation → Execution |
| [FRAMEWORK-CONFIG.md](FRAMEWORK-CONFIG.md) | Playwright config, projects, scripts, env vars |

---

## Quick Commands

```bash
# Run all tests
npx playwright test --headed --workers=1

# Login tests only
npx playwright test --project=login-tests --headed --workers=1

# Login positive only
npx playwright test --project=login-tests --headed --workers=1 -g "POSITIVE"

# Login negative only
npx playwright test --project=login-tests --headed --workers=1 -g "NEGATIVE"

# Customers tests
npx playwright test automation/tests/customers.spec.ts --project=regression --headed --workers=1

# Smoke suite
npx playwright test --project=smoke

# Full regression
npx playwright test --project=regression

# View HTML report
npx playwright show-report reports/html-report

# Run AI discovery
npx ts-node ai-agent/discovery-crawler.ts

# Generate test cases from discovery
npx ts-node ai-agent/test-case-generator.ts

# Generate Playwright code from test cases
npx ts-node ai-agent/automation-generator.ts
```

---

## Directory Structure

```
xrportal-qa-framework/
├── docs/                       ← YOU ARE HERE
│   ├── INDEX.md                ← Master index (this file)
│   ├── PROCESS-FLOW.md         ← 3-phase AI pipeline + auth flow
│   ├── FRAMEWORK-CONFIG.md     ← Config, scripts, env vars
│   └── pages/
│       ├── LOGIN.md            ← Login page memory
│       └── CUSTOMERS.md        ← Customers page memory
│
├── ai-agent/                   ← AI Discovery & Generation
│   ├── discovery-crawler.ts
│   ├── test-case-generator.ts
│   └── automation-generator.ts
│
├── automation/
│   ├── pages/                  ← Page Object Model
│   │   ├── login.page.ts
│   │   └── customers.page.ts
│   ├── tests/
│   │   ├── auth.setup.ts       ← Global session caching
│   │   ├── login.spec.ts
│   │   └── customers.spec.ts
│   └── fixtures/.auth/
│       └── admin.json          ← Saved session (git-ignored)
│
├── discovery/
│   ├── reports/
│   │   ├── portal-map.json
│   │   └── discovery-report.md
│   └── screenshots/
│
├── manual-test-cases/          ← AI-generated test case docs
├── reports/                    ← Playwright execution reports
└── playwright.config.ts
```

---

## Changelog

| Date | Change | Updated By |
|---|---|---|
| 2026-03-11 | Initial docs created from project analysis | Claude |
