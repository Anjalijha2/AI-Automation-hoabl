'use strict';

// tests/smoke/customers.smoke.spec.js
// Customers module — Smoke / Sanity
// Fast gate: 4 critical checks confirming the Customers page is alive.
// Run before any full regression sweep to catch deploy-time regressions early.
// BRD: ADMIN-BRD-Customers §3/§4

const { test, expect } = require('@playwright/test');
const { CustomersPage } = require('../../automation-repository/pages/admin/CustomersPage');

test.use({
  storageState: 'automation-repository/fixtures/.auth/admin.json',
});

test.describe('Customers — Smoke', () => {
  let customersPage;

  test.beforeEach(async ({ page }) => {
    customersPage = new CustomersPage(page);
    await customersPage.navigate();
    await customersPage.waitForLoad();
  });

  test('TC_CUST_SMOKE_001 — BRD-CUST §3 — Customers page loads and URL is correct', async () => {
    await customersPage.expectOnCustomersUrl();
  });

  test('TC_CUST_SMOKE_002 — BRD-CUST §4 — KPI cards row is visible', async () => {
    await customersPage.expectKpiVisible();
  });

  test('TC_CUST_SMOKE_003 — BRD-CUST §4 — Registration table is visible with at least one row', async () => {
    await expect(customersPage.registrationTable).toBeVisible();
    const rowCount = await customersPage.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('TC_CUST_SMOKE_004 — BRD-CUST §5 — Search by phone input accepts input', async () => {
    await expect(customersPage.searchByPhoneInput).toBeVisible();
    await expect(customersPage.searchByPhoneInput).toBeEnabled();
  });
});
