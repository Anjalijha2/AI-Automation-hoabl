# Run Commands Reference

## Auth Setup (run once before smoke/regression)
```bash
npx playwright test --config config/playwright.config.js --project=auth-setup
```

## Run Full Regression
```bash
npm run test:regression
# or headless:
npm run test
```

## Run Specific Module
```bash
npm run test:login            # Login tests (22 tests, standalone)
npm run test:customers        # Customers tests (needs auth-setup)
npm run test:smoke            # Smoke suite (needs auth-setup)
```

## Run Specific Spec File
```bash
npx playwright test --config config/playwright.config.js tests/ui/config.spec.js --project=regression --headed --workers=1
npx playwright test --config config/playwright.config.js tests/ui/login.spec.js --project=login-tests --headed --workers=1
```

## Filter by Test Name
```bash
npm run test:login:positive   # Login POSITIVE tests only
npm run test:login:negative   # Login NEGATIVE tests only
npx playwright test --config config/playwright.config.js -g "TC_CFG_025" --project=regression
```

## Cross-Browser
```bash
npm run test:chrome
npm run test:firefox
npm run test:webkit
npm run test:all              # All projects, all browsers
```

## Run UI Mode (interactive)
```bash
npx playwright test --config config/playwright.config.js --ui
```

## Debug Specific Test
```bash
npx playwright test --config config/playwright.config.js --debug -g "TC_CFG_001"
```

## View HTML Report
```bash
npm run report
# or:
npx playwright show-report reports/html-report
```

## Run via Agent 4
```bash
npm run execute               # all tests
npm run execute:login         # login tests only
npm run execute:customers     # customers tests only
```
