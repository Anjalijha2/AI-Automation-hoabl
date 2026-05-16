# Run Commands Reference

**Framework:** Playwright v1.58.2 · JavaScript  
**Config:** `config/playwright.config.js`  
**Last Updated:** 2026-04-14

---

## Auth Setup (auto-runs before regression; run manually if session expires)

```bash
npx playwright test --config config/playwright.config.js --project=auth-setup
```

---

## Run by Module

### Login (standalone — no auth-setup needed)
```bash
npx playwright test tests/ui/login.spec.js --project=login-tests --config config/playwright.config.js --headed --workers=1

# Positive cases only
npx playwright test tests/ui/login.spec.js --project=login-tests --config config/playwright.config.js --headed --workers=1 --grep "POSITIVE"

# Negative cases only
npx playwright test tests/ui/login.spec.js --project=login-tests --config config/playwright.config.js --headed --workers=1 --grep "NEGATIVE"
```

### Customers
```bash
npx playwright test tests/ui/customers.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1
```

### Config
```bash
# All Config tests (53 tests)
npx playwright test tests/ui/config.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# Single Config test by ID
npx playwright test tests/ui/config.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1 --grep "TC_CFG_025"
```

### Allocation
```bash
npx playwright test tests/ui/allocation.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1
```

### Towers
```bash
npx playwright test tests/ui/towers.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1
```

### Channel Partners
```bash
# All Channel Partners tests (13 tests)
npx playwright test tests/ui/channel-partners.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# Single test by ID
npx playwright test tests/ui/channel-partners.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1 --grep "TC-CP-012"
```

### JBP Management
```bash
# All JBP tests (4 tests)
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# Individual JBP tests
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1 --grep "TC-JBP-001"
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1 --grep "TC-JBP-002"
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1 --grep "TC-JBP-003"
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1 --grep "TC-JBP-004"
```

---

## Run Full Suite

```bash
# Headless (CI)
npm run test

# Headed (local debug)
npm run test:headed

# Headed with npm alias
npm run test:regression

# Smoke only
npm run test:smoke
```

---

## Cross-Browser

```bash
npm run test:chrome     # Chromium
npm run test:firefox    # Firefox
npm run test:webkit     # WebKit (Safari)
npm run test:all        # All browsers
```

---

## Filter by Test ID (any module)

```bash
# Run any single test by its ID
npx playwright test --config config/playwright.config.js --project=chromium --headed --workers=1 --grep "TC-JBP-003"
npx playwright test --config config/playwright.config.js --project=chromium --headed --workers=1 --grep "TC-CP-012"
npx playwright test --config config/playwright.config.js --project=chromium --headed --workers=1 --grep "TC_CFG_001"
npx playwright test --config config/playwright.config.js --project=chromium --headed --workers=1 --grep "TC-TWR-001"
```

---

## Debug & UI Mode

```bash
# Step-through debugger
npx playwright test --config config/playwright.config.js --debug --grep "TC-JBP-004"

# Playwright UI (interactive test picker)
npx playwright test --config config/playwright.config.js --ui

# Show last HTML report
npm run report
npx playwright show-report reports/html-report
```

---

## Headless (CI/pipeline)

```bash
# All modules headless
npx playwright test --config config/playwright.config.js --project=chromium --workers=1

# Specific module headless
npx playwright test tests/ui/jbp-management.spec.js --config config/playwright.config.js --project=chromium --workers=1
```

---

## Common Options

| Flag | Purpose |
|------|---------|
| `--headed` | Show browser window |
| `--workers=1` | Run sequentially (required for UAT state-dependent tests) |
| `--grep "TC-XXX"` | Filter by test name/ID |
| `--project=chromium` | Run on Chromium only |
| `--retries=0` | Disable retries (faster failure feedback) |
| `--debug` | Open Playwright Inspector for step-by-step |
| `--ui` | Open Playwright UI mode |
| `--timeout=60000` | Override default timeout (ms) |

---

## All Module Commands — Copy-Paste Reference

```bash
# 1. Login
npx playwright test tests/ui/login.spec.js --project=login-tests --config config/playwright.config.js --headed --workers=1

# 2. Customers
npx playwright test tests/ui/customers.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# 3. Config
npx playwright test tests/ui/config.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# 4. Allocation
npx playwright test tests/ui/allocation.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# 5. Towers
npx playwright test tests/ui/towers.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# 6. Channel Partners
npx playwright test tests/ui/channel-partners.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# 7. JBP Management
npx playwright test tests/ui/jbp-management.spec.js --project=chromium --config config/playwright.config.js --headed --workers=1

# ALL (full regression — headed)
npm run test:headed
```
