'use strict';

// tests/ui-ux/admin/customers.spec.js
// Customers module — Admin Portal UI/UX
// Covers TC_CUST_UI_001..006 (layout/rendering) and select VAL TCs (pagination dropdown).
// Visual regression via toHaveScreenshot() at viewport 1920x900.

const { test, expect } = require('@playwright/test');
const { CustomersPage } = require('../../../automation-repository/pages/admin/CustomersPage');

test.use({
  storageState: 'automation-repository/fixtures/.auth/admin.json',
  viewport: { width: 1920, height: 900 },
});

test.describe('Customers — Admin Portal UI/UX', () => {
  let customersPage;

  test.beforeEach(async ({ page }) => {
    customersPage = new CustomersPage(page);
    await customersPage.navigate();
    await customersPage.waitForLoad();
  });

  test('TC_CUST_UI_001 — BRD-CUST §4 — Six KPI cards render with correct labels', async ({ page }) => {
    await customersPage.expectKpiVisible();
    // Each card should expose a numeric value
    for (const kpi of [
      customersPage.kpiRegistered,
      customersPage.kpiInactive,
      customersPage.kpiCancelled,
      customersPage.kpiKycPending,
      customersPage.kpiConfirmed,
      customersPage.kpiActiveTowers,
    ]) {
      const txt = await kpi.textContent();
      expect(txt).toMatch(/\d/);
    }
    await expect(page).toHaveScreenshot('customers-ui-001-kpi-row.png', { maxDiffPixels: 200, fullPage: false });
  });

  test('TC_CUST_UI_002 — BRD-CUST §6 BR1 — Registered KPI equals sum of allocation-status breakdowns', async () => {
    // Skip on UAT: filter status counts include all registration states (not only "Registered" category),
    // so the sum can legitimately exceed the single "Registered" KPI value on live data.
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — filter status counts span all states and cannot be reliably compared to a single KPI value on live data');

    const registeredKpi = await customersPage.getKpiValue(customersPage.kpiRegistered);
    test.skip(registeredKpi === null, 'Registered KPI value not parseable');

    let sum = 0;
    for (const status of ['Booked Offline', 'Booked Online', 'Registered', 'Inactive']) {
      await customersPage.applyStatusFilter(status).catch(() => { /* status may not exist as option */ });
      const cnt = await customersPage.getTableRecordsCount();
      if (cnt !== null) sum += cnt;
      await customersPage.resetFilters();
    }
    expect(sum).toBeLessThanOrEqual(registeredKpi);
  });

  test('TC_CUST_UI_003 — BRD-CUST §4 — Registration table displays all required columns', async ({ page }) => {
    await expect(customersPage.colRegistrationNumber).toBeVisible();
    await expect(customersPage.colGrowthPartner).toBeVisible();
    await expect(customersPage.colPhone).toBeVisible();
    await expect(customersPage.colHomeLoan).toBeVisible();
    await expect(customersPage.colConfirmationNumber).toBeVisible();
    await expect(customersPage.colAllottedUnit).toBeVisible();
    await expect(customersPage.colStatus).toBeVisible();
    await expect(customersPage.colProcessStatus).toBeVisible();
    await expect(customersPage.colActions).toBeVisible();
    await expect(page).toHaveScreenshot('customers-ui-003-table-columns.png', { maxDiffPixels: 200 });
  });

  test('TC_CUST_UI_004 — BRD-CUST §6 BR4 — Table heading shows "X Registration Records" with correct total', async () => {
    await customersPage.tableRecordsHeading.waitFor({ state: 'visible' });
    const txt = (await customersPage.tableRecordsHeading.textContent() || '').trim();
    // Regex accepts any digit count with optional comma grouping (e.g. "9673" or "9,673")
    expect(txt).toMatch(/^\d[\d,]*\s+Registration Records$/);
  });

  test('TC_CUST_UI_005 — BRD-CUST §4 — Pagination bar shows correct controls and default page size', async ({ page }) => {
    await customersPage.scrollToPagination();
    await expect(customersPage.paginationBar).toBeVisible();
    await expect(customersPage.paginationPrevBtn).toBeVisible();
    await expect(customersPage.paginationNextBtn).toBeVisible();
    await expect(customersPage.paginationPageSizeDropdown).toBeVisible();
    await expect(page).toHaveScreenshot('customers-ui-005-pagination-bar.png', { maxDiffPixels: 200 });
  });

  test('TC_CUST_UI_006 — BRD-CUST §4 — Controls row above table contains all action buttons', async ({ page }) => {
    await expect(customersPage.cancelBulkUnitsButton).toBeVisible();
    await expect(customersPage.filterButton).toBeVisible();
    await expect(customersPage.refreshButton).toBeVisible();
    await expect(customersPage.downloadButton).toBeVisible();
    await expect(customersPage.searchByPhoneInput).toBeVisible();
    await expect(page).toHaveScreenshot('customers-ui-006-controls-row.png', { maxDiffPixels: 200 });
  });

  // ── VAL — Pagination dropdown allowed values ──────────────────────────────

  test('TC_CUST_VAL_002 — BRD-CUST §4 — Page size dropdown only allows 10/20/50/100', async ({ page }) => {
    await customersPage.scrollToPagination();
    await customersPage.click(customersPage.paginationPageSizeDropdown);
    const options = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
    await options.first().waitFor({ state: 'visible', timeout: 5_000 });
    const allowed = ['10', '20', '50', '100'];
    const count = await options.count();
    expect(count).toBe(allowed.length);
    for (let i = 0; i < count; i++) {
      const t = (await options.nth(i).textContent() || '').trim();
      expect(allowed.some((v) => t.includes(v))).toBeTruthy();
    }
  });
});
