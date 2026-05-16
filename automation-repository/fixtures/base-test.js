// automation-repository/fixtures/base-test.js
// Central fixture — import this in all spec files instead of @playwright/test
const { test: baseTest, expect } = require('@playwright/test');

const { LoginPage } = require('../pages/admin/LoginPage');
const { ApiClient } = require('../api/ApiClient');

/**
 * Extend Playwright's base test with all page objects and helpers
 * injected as fixtures (dependency injection pattern).
 *
 * Usage in specs:
 *   const { test, expect } = require('../../automation-repository/fixtures/base-test');
 *   test('my test', async ({ loginPage }) => { ... });
 */
const test = baseTest.extend({

  // --- Page object fixtures ---
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // --- API client fixture ---
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    await use(client);
  },

  // --- Authenticated page (reuses storageState from auth-setup) ---
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'automation-repository/fixtures/.auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

module.exports = { test, expect };
