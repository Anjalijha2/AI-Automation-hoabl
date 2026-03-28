# Run Commands Reference

## Run Full Regression
```bash
npx playwright test --project=regression --headed --workers=1
```

## Run Specific Module
```bash
npx playwright test automation/tests/customers.spec.ts --project=regression
npx playwright test automation/tests/login.spec.ts    --project=login-tests
```

## Run UI Mode (interactive)
```bash
npx playwright test --ui
```

## Debug Specific Test
```bash
npx playwright test --debug -g "TC_LOGIN_001"
```

## View HTML Report
```bash
npx playwright show-report reports/html-report
```

## Run via Agent 4
```bash
npm run execute             # all tests
npm run execute:login       # login tests only
npm run execute:customers   # customers tests only
```
