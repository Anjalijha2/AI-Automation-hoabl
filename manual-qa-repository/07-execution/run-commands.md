# Run Commands Reference

**Framework:** Playwright 1.58.2 · JavaScript (CommonJS)  
**Config:** `automation-repository/playwright.config.js`

---

## Auth Setup (Run First)

```bash
npm run auth:setup
# or
npx playwright test --config automation-repository/playwright.config.js --project=auth-setup
```

Saves session to `automation-repository/fixtures/.auth/admin.json`.  
**Re-run when:** session expires, `admin.json` deleted, UAT credentials changed.

---

## Test Suites

```bash
# Login — standalone (no auth-setup needed)
npm run test:login

# Smoke — quick sanity (needs auth-setup)
npm run test:smoke

# Full regression (needs auth-setup)
npm run test:regression

# Headless (CI)
HEADLESS=true npm run test:regression
```

---

## Single Spec

```bash
npx playwright test tests/e2e/login.spec.js \
  --config automation-repository/playwright.config.js \
  --project=regression \
  --headed --workers=1
```

---

## By TC_ID

```bash
npx playwright test \
  --config automation-repository/playwright.config.js \
  -g "TC_LOGIN_FUNC_001" \
  --headed
```

---

## Cross-Browser

```bash
npm run test:chrome    # Chromium
npm run test:firefox   # Firefox
npm run test:webkit    # WebKit/Safari
```

---

## Reports

```bash
npm run report         # Open HTML report in browser
# Report at: reports/html-report/
# JSON at:   reports/results.json
```

---

## AI Pipeline Commands

```bash
npm run discover              # Crawl portal UI → discovery/reports/
npm run generate:report  # QA Agent calls generate-user-manual skill         # Screen docs → manual-qa-repository/
# BA Agent → manual-tester skill → TestCases.xlsx    # Manual TCs → 01-test-cases/
# QA Agent → scaffold specs from templates   # Playwright specs → tests/e2e/
npm run execute               # Run all tests → reports/results.json
# QA Agent → parse results.json → BUG_TRACKER.md           # Parse failures → 04-bug-reports/BUG_TRACKER.md
# Tech Lead Agent → e2e-self-healer skill          # Selector analysis (read-only)
npm run sprint:status         # Sprint summary
npm run sprint:update         # Update SPRINT_LOG + TASK_TRACKER
```

---

## Important Flags

| Flag | Rule |
|------|------|
| `--workers=1` | Always use with `--headed` — multiple headed windows conflict |
| `--headed` | Use for local debugging; omit for CI |
| `HEADLESS=true` | CI mode override |
