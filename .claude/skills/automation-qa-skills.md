# Automation QA Agent — Skills

## Skill Set Overview
The Automation QA Agent operates across 4 skill domains: Script Engineering, Test Execution, Failure Diagnosis, and Code Quality. All 4 are active on every task.

---

## Skill Domain 1 — Script Engineering

### Page Object Model (POM) Design
Structure every module as a clean, maintainable Page Object.
- One Page class per module in `src/pages/<Module>Page.js`
- Extend `BasePage` for shared helper methods
- All selectors loaded from `docs/selectors/<module>.json` — never hardcoded
- Methods are action-oriented: `selectCustomer()`, `confirmAllocation()`, `getErrorMessage()`
- Methods are atomic: one logical action per method
- Methods return values only when needed for assertions

```javascript
// ✅ Correct POM structure
const { BasePage } = require('../base/BasePage');
const selectors = require('../../docs/selectors/<module>.json');

class <Module>Page extends BasePage {
  constructor(page) {
    super(page);
    this.s = selectors.selectors; // shorthand accessor
  }

  async <actionName>(<params>) {
    await this.waitForElement(this.s.<elementKey>);
    await this.click(this.s.<elementKey>);
  }

  async get<ValueName>() {
    return this.getText(this.s.<elementKey>);
  }
}

module.exports = { <Module>Page };
```

### Spec File Architecture
Structure every spec file for readability and traceability.
- `test.describe` block per module
- Every `test()` block starts with: `"TC_<MODULE>_<TYPE>_<NNN> — <description>"`
- Group by testing type using nested `test.describe` blocks
- `beforeAll` / `afterAll` for session setup and data cleanup
- `beforeEach` for state reset when tests share resources

```javascript
// ✅ Correct spec structure
const { test, expect } = require('@playwright/test');
const { <Module>Page } = require('../../src/pages/<Module>Page');

test.describe("<Module> Module", () => {

  test.describe("Negative Tests", () => {
    test("TC_LOGIN_NEG_005 — Invalid OTP shows inline error", async ({ page }) => {
      const login = new LoginPage(page);
      await login.navigate('/login');
      await login.enterMobile('8888888888');
      await login.clickSendOtp();
      await login.enterOtp('000000');
      await login.clickLogin();
      await expect(page.locator(login.s.errorMessage)).toBeVisible();
    });
  });

  test.describe("E2E Tests", () => {
    test("TC_ALLOC_E2E_001 — Full booking flow end to end", async ({ page }) => {
      // full journey test
    });
  });

  // ENV skip guard pattern
  test.skip(process.env.ENV === 'uat',
    "TC_ALLOC_E2E_003 — Payment gateway confirmation (live gateway — UAT skip)");

});
```

### Selector Binding Rules
Mandatory rules — no exceptions:

```javascript
// ✅ Always load from JSON
const selectors = require('../../docs/selectors/allocation.json');
this.s = selectors.selectors;
await this.fill(this.s.customerSearchInput, customerName);

// ❌ Never hardcode — this breaks when UI changes
await page.fill('#customer-search', customerName);
await page.click('.confirm-btn');
```

### TC_ID + Type Code Mapping (Mandatory on Every Test)
```
TC_<MODULE>_<TYPE>_<NNN>

Type codes:
  UI    VAL   FUNC   E2E   API   DB
  INT   BIZ   REG    EXP   NEG   EDGE
  XMOD  DC    WF

Examples:
  TC_LOGIN_NEG_005       TC_ALLOC_E2E_001
  TC_CFG_INT_002         TC_CUST_XMOD_003
```

---

## Skill Domain 2 — Test Execution

### Pre-Execution Validation
Before running any test suite:
1. Spec file compiles: `node --check tests/ui/<module>.spec.js`
2. Auth session valid: `src/fixtures/.auth/admin.json` exists and not stale
3. Playwright config correct: `config/playwright.config.js`
4. ENV set: `process.env.ENV` = `uat` / `staging` / `prod`

### Timing Strategies (Priority Order)
| Strategy | When to Use |
|----------|-------------|
| `waitForSelector(selector)` | Before any dynamic element interaction — primary choice |
| `waitForLoadState('networkidle')` | After navigations with heavy API calls |
| `waitForLoadState('domcontentloaded')` | After lightweight navigations |
| `waitForURL(pattern)` | After form submissions and page redirects |
| `waitForResponse(urlPattern)` | When specific API response must complete |
| `waitForTimeout(ms)` | LAST RESORT — add inline comment: `// Reason: <why>` |

### Result Classification
Every test gets exactly one classification:
- `✅ PASS` — test assertions all passed
- `❌ FAIL` — one or more assertions failed (log error + element + timeout details)
- `⏭ SKIP` — ENV skip guard active (expected behavior — NOT a failure, never log as bug)

### Execution Summary Generation
```markdown
## Execution Summary — <MODULE> — <DATE>

| TC_ID | Type | Scenario | Status | Duration | Failure Detail |
|-------|------|----------|--------|----------|----------------|
| TC_LOGIN_NEG_005 | NEG | Invalid OTP error | ✅ PASS | 1.8s | — |
| TC_ALLOC_INT_003 | INT | Alloc → Unit sync | ❌ FAIL | 2.1s | Timeout: .unit-status-badge (5000ms) |
| TC_ALLOC_E2E_003 | E2E | Payment gateway | ⏭ SKIP | — | ENV guard: UAT |

### Run Summary
- Total: N | Pass: X | Fail: Y | Skip: Z (ENV)
- Failure layers: UI: A | API: B | Integration: C | DB: D | Logic: E
```

### Auth Session Management
```bash
# Detect stale session:
# Protected-page tests fail with unexpected redirect to /login

# Refresh:
npm run auth:setup
# → saves new session to src/fixtures/.auth/admin.json

# When to refresh:
# - Session expires (protected tests redirect to login)
# - admin.json deleted or corrupted
# - UAT credentials changed
```

### Cross-Browser Execution
```bash
npm run test:chrome    # Chromium — primary
npm run test:firefox   # Firefox — secondary
npm run test:webkit    # WebKit/Safari — tertiary
npm run test:all       # All three (1 worker, sequential)
```

---

## Skill Domain 3 — Failure Diagnosis & Healing

### Failure Pattern Recognition
Identify root cause category before recommending a fix:

| Pattern | Symptoms | Diagnosis |
|---------|---------|-----------|
| **Selector change** | `TimeoutError: waiting for locator` | DOM attribute renamed/removed in deploy |
| **Dynamic rendering** | Element interaction fails immediately | Element exists but not yet interactive |
| **Timing/race condition** | Intermittent failures on same test | Network-heavy page, API not yet responded |
| **Auth expiry** | All protected tests fail with redirect | `admin.json` stale or expired |
| **ENV difference** | Test passes locally, fails in UAT | Environment-specific behavior difference |
| **API schema change** | Response parsing fails | Backend changed response structure |
| **State pollution** | Tests fail when run together, pass alone | Prior test left unexpected data |
| **Compile error** | All tests in file fail immediately | Syntax error in spec or POM file |

### Fix Recommendation Format
```markdown
## Fix Recommendations — <MODULE> — <DATE>

| # | TC_ID | File to Change | Specific Change | Root Cause | Priority |
|---|-------|---------------|----------------|-----------|---------|
| 1 | TC_LOGIN_NEG_005 | docs/selectors/login.json | errorMessage: ".toast-error" (was ".error-toast") | Selector change | High |
| 2 | TC_CFG_INT_002 | src/pages/ConfigPage.js | Add waitForSelector before dropdown interaction | Dynamic rendering | Medium |
| 3 | TC_ALLOC_E2E_001 | tests/ui/allocation.spec.js | Add waitForLoadState('networkidle') after submit | Timing issue | Medium |
```

### Pattern Log Maintenance
Track across sprints in `healing-reports/pattern-log.md`:
- Which selectors break most frequently
- Which modules have highest failure rates
- Systemic issues (e.g., "login module selectors change every deploy")
- Recommendations to dev team (e.g., "standardize data-testid on all interactive elements")

### Non-Destructive Principle
Never apply any fix without explicit BA Agent approval.
Present → Await approval → Apply only approved items → Re-validate → Notify BA Agent.

---

## Skill Domain 4 — Code Quality

### Self-Validation Checklist (Run Before Every Phase 1 Completion Report)
```
Before notifying BA Agent that scripts are ready, verify:

[ ] All selectors loaded from docs/selectors/<module>.json — none hardcoded
[ ] Every test() starts with TC_ID + type code in correct format
[ ] All TC_IDs from approved TC file are represented in spec
[ ] No waitForTimeout used without inline comment
[ ] All ENV skip guards have descriptive reason string
[ ] POM methods are atomic — one action per method
[ ] File compiles: node --check tests/ui/<module>.spec.js
[ ] No console.log left in production spec files
[ ] beforeEach/afterEach hooks present if tests share state
```

### BasePage Helpers (Available from src/base/BasePage.js)
```javascript
await this.navigate(path)           // Navigate to URL
await this.click(selector)          // Click element (with waitForSelector)
await this.fill(selector, value)    // Fill input field
await this.getText(selector)        // Get element text content
await this.waitForElement(selector) // Wait for element to be visible
await this.isVisible(selector)      // Returns boolean
await this.selectOption(selector, value) // Select dropdown option
await this.uploadFile(selector, filePath) // File upload
```

### Prohibited Patterns
```javascript
// ❌ Never hardcode selectors
await page.click('.submit-btn');
await page.fill('#input-field', 'value');

// ❌ Never use waitForTimeout without comment
await page.waitForTimeout(2000);

// ❌ Never skip TC_ID
test("Login with invalid OTP", async ({ page }) => { ... });

// ❌ Never auto-apply healing fixes
// Apply only after explicit BA Agent approval
```
