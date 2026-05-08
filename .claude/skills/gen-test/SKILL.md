---
name: gen-test
description: Scaffold a new Playwright spec file for a new XR Portal page/feature, following existing test conventions (POM, TC-XXX-NNN IDs, describe blocks). User provides feature name and test cases to cover.
---

# Generate Test — XR Portal

Scaffold a new Playwright spec file for the XR Portal QA framework.

## Required Input

Ask user for (if not provided):
1. **Feature name** (e.g., "Allocation", "Registration Status")
2. **Spec file name** (e.g., `allocation.spec.js`)
3. **Page object file** (existing or to create — e.g., `AllocationPage.js`)
4. **Test module prefix** (e.g., `TC-ALLOC`, `TC-REG`)
5. **Test cases to cover** (list of scenarios)

## Conventions to Follow

Read these files first to match patterns:
- `tests/ui/channel-partners.spec.js` — reference for test structure
- `src/pages/ChannelPartnersPage.js` — reference for page object style
- `config/playwright.config.js` — project settings, baseURL, auth deps

## Spec File Template

Generate at `tests/ui/<feature>.spec.js`:

```js
// @ts-check
const { test, expect } = require('@playwright/test');
const { <PageClass> } = require('../../src/pages/<PageFile>');

test.describe('<Feature Name> Module', () => {
    let <pageVar>;

    test.beforeEach(async ({ page }) => {
        <pageVar> = new <PageClass>(page);
        await <pageVar>.navigate();
    });

    // TC-XXX-001: <scenario>
    test('TC-XXX-001 — [POSITIVE] <test description>', async ({ page }) => {
        // Arrange
        // Act
        // Assert
        await expect(<locator>).toBeVisible();
    });

    // TC-XXX-002: <negative scenario>
    test('TC-XXX-002 — [NEGATIVE] <test description>', async ({ page }) => {
        // Arrange
        // Act
        // Assert
        await expect(<locator>).toContainText('<error message>');
    });
});
```

## Page Object Template (if new)

Generate at `src/pages/<PageClass>.js`:

```js
class <PageClass> {
    constructor(page) {
        this.page = page;
        // Define locators here
        this.<element> = page.locator('<selector>');
    }

    async navigate() {
        await this.page.goto('/<route>');
        await this.page.waitForLoadState('networkidle');
    }

    async <actionMethod>() {
        // implementation
    }
}

module.exports = { <PageClass> };
```

## Rules

1. All selectors in page object — NEVER inline in spec
2. Test IDs sequential starting from 001
3. Each test independent — no shared mutable state between tests
4. At minimum: 1 positive + 1 negative test case per feature
5. `beforeEach` handles navigation only
6. Import path relative from `tests/ui/` to `src/pages/` = `../../src/pages/`

## Output

1. Show generated spec file
2. Show page object file (new or additions needed to existing)
3. Show what `npm` script to add in `package.json` for this suite
4. Note: run `npm run test:<feature>` to verify scaffolding works
