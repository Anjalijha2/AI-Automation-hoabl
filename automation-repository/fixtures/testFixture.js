/**
 * Custom Playwright Fixtures
 * --------------------------
 * Extends Playwright's base `test` with pre-built page objects.
 *
 * Usage in spec files:
 *   const { test, expect } = require('../../automation-repository/fixtures/testFixture.js');
 *
 *   test('example', async ({ loginPage, customersPage, configPage }) => {
 *     await loginPage.navigate();
 *   });
 */

const { test: base } = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage.js');
const { CustomersPage } = require('../pages/CustomersPage.js');
const { ConfigPage }    = require('../pages/ConfigPage.js');

const test = base.extend({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    customersPage: async ({ page }, use) => {
        await use(new CustomersPage(page));
    },
    configPage: async ({ page }, use) => {
        await use(new ConfigPage(page));
    },
});

const { expect } = base;

module.exports = { test, expect };
