---
name: new-page-object
description: Scaffold a new Page Object class for XR Portal, matching existing conventions. Provide a page URL or feature name. Claude will inspect the page structure via Playwright MCP or ask for selector details.
---

# New Page Object — XR Portal

Scaffold a Page Object Model class for a new XR Portal page.

## Existing Pattern Reference

Before generating, read one existing page object to match style:
- `src/pages/ChannelPartnersPage.js`
- `src/pages/TowersPage.js`

## Required Input

1. **Page name** (e.g., "Allocation", "JBP Management")
2. **URL path** (relative to baseURL `https://uat-web.xrportal.in/admin`)
3. **Key UI elements** to interact with (tables, filters, buttons, forms, modals)

## Generation Steps

1. Read an existing page object for style reference
2. Identify all interactive elements user listed
3. Generate class with constructor locators + action methods
4. Ensure `navigate()` method included with `waitForLoadState`

## Output Template

```js
class <PageName>Page {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // --- Navigation ---
        // (none required — navigate() handles it)

        // --- Filters ---
        this.<filterLocator> = page.getByRole('<role>', { name: '<name>' });

        // --- Table / Data ---
        this.<tableLocator> = page.locator('<selector>');
        this.<rowLocator> = page.locator('<row-selector>');

        // --- Actions ---
        this.<buttonLocator> = page.getByRole('button', { name: '<label>' });

        // --- Modals / Dialogs ---
        this.<modalLocator> = page.locator('<modal-selector>');
    }

    async navigate() {
        await this.page.goto('/<path>');
        await this.page.waitForLoadState('networkidle');
    }

    async <clickAction>() {
        await this.<buttonLocator>.click();
    }

    async <fillField>(value) {
        await this.<inputLocator>.fill(value);
    }

    async <getTableRowCount>() {
        return await this.<rowLocator>.count();
    }
}

module.exports = { <PageName>Page };
```

## Selector Priority

Use in order:
1. `getByRole('button', { name: '...' })` — best for buttons/links
2. `getByLabel('...')` — best for form inputs
3. `getByTestId('...')` — if data-testid present
4. `getByText('...')` — for static text assertions
5. `locator('.specific-class')` — last resort for unique CSS

Avoid: positional XPath, nth-child on dynamic lists, full class strings from CSS frameworks.

## Output

1. Complete `src/pages/<PageName>Page.js` file
2. Import line to add in relevant spec: `const { <PageName>Page } = require('../../src/pages/<PageName>Page');`
3. Suggest 2-3 test methods to write first
