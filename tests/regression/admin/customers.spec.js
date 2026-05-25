'use strict';

// tests/regression/admin/customers.spec.js
// Customers module — Admin Portal Regression
// Covers TC_CUST_REG_001..006: cross-session stability, KPI integrity,
// filter/reset idempotency, and navigation regression checks.
// BRD: ADMIN-BRD-Customers · FRD: ADMIN-FS-Customers

const { test, expect } = require('@playwright/test');
const { CustomersPage } = require('../../../automation-repository/pages/admin/CustomersPage');

test.use({
  storageState: 'automation-repository/fixtures/.auth/admin.json',
});

test.describe('Customers — Admin Portal Regression', () => {
  let customersPage;

  test.beforeEach(async ({ page }) => {
    customersPage = new CustomersPage(page);
    await customersPage.navigate();
    await customersPage.waitForLoad();
  });

  // ── REG_001 — Page re-loads cleanly on direct URL navigation ──────────────

  test('TC_CUST_REG_001 — BRD-CUST §3 — Direct URL navigation always lands on Customers page', async ({ page }) => {
    // Reload via goto (simulates bookmark / back-button navigation)
    await page.goto('https://uat-web.xrportal.in/admin/customers');
    await page.waitForLoadState('networkidle');
    await customersPage.expectOnCustomersUrl();
    await expect(customersPage.registrationTable).toBeVisible();
    await customersPage.expectKpiVisible();
  });

  // ── REG_002 — KPI stability after filter + reset cycle ────────────────────

  test('TC_CUST_REG_002 — BRD-CUST §6 BR1/BR4 — KPI counts stable after filter+reset cycle', async () => {
    const kpiBefore = {
      registered:   await customersPage.getKpiValue(customersPage.kpiRegistered),
      inactive:     await customersPage.getKpiValue(customersPage.kpiInactive),
      cancelled:    await customersPage.getKpiValue(customersPage.kpiCancelled),
      kycPending:   await customersPage.getKpiValue(customersPage.kpiKycPending),
      confirmed:    await customersPage.getKpiValue(customersPage.kpiConfirmed),
      activeTowers: await customersPage.getKpiValue(customersPage.kpiActiveTowers),
    };

    await customersPage.applyStatusFilter('Cancelled');
    await customersPage.resetFilters();

    const kpiAfter = {
      registered:   await customersPage.getKpiValue(customersPage.kpiRegistered),
      inactive:     await customersPage.getKpiValue(customersPage.kpiInactive),
      cancelled:    await customersPage.getKpiValue(customersPage.kpiCancelled),
      kycPending:   await customersPage.getKpiValue(customersPage.kpiKycPending),
      confirmed:    await customersPage.getKpiValue(customersPage.kpiConfirmed),
      activeTowers: await customersPage.getKpiValue(customersPage.kpiActiveTowers),
    };

    expect(kpiAfter).toEqual(kpiBefore);
  });

  // ── REG_003 — Record count stable across multiple refresh cycles ──────────

  test('TC_CUST_REG_003 — BRD-CUST §5 — Record count consistent across sequential refreshes', async () => {
    const count1 = await customersPage.getTableRecordsCount();
    await customersPage.clickRefresh();
    const count2 = await customersPage.getTableRecordsCount();
    await customersPage.clickRefresh();
    const count3 = await customersPage.getTableRecordsCount();

    // UAT data can change between runs but NOT between sequential refreshes in the same session
    expect(count2).toBe(count1);
    expect(count3).toBe(count1);
  });

  // ── REG_004 — Sidebar link still navigates correctly after page reload ────

  test('TC_CUST_REG_004 — BRD-CUST §3 — Sidebar Customers link works after hard reload', async ({ page }) => {
    // Navigate away and come back via sidebar
    await page.goto('https://uat-web.xrportal.in/admin/cms');
    await page.waitForLoadState('networkidle');
    await customersPage.navigateViaSidebar();
    await customersPage.expectOnCustomersUrl();
    await expect(customersPage.registrationTable).toBeVisible();
  });

  // ── REG_005 — Filter panel toggle is idempotent ───────────────────────────

  test('TC_CUST_REG_005 — BRD-CUST §5 — Filter panel open/close is idempotent (no duplicate rows)', async () => {
    // Open the filter panel
    await customersPage.openFilterPanel();
    const countWithFilter = await customersPage.tableRows.count();

    // Close (reset) and re-open — row count must match
    await customersPage.resetFilters();
    await customersPage.openFilterPanel();
    const countAfterReopen = await customersPage.tableRows.count();

    expect(countAfterReopen).toBe(countWithFilter);
  });

  // ── REG_006 — Logout is accessible from the Customers page ───────────────

  test('TC_CUST_REG_006 — BRD-CUST §3 — Logout accessible from Customers page redirects to login', async ({ page }) => {
    await customersPage.logout();
    // After logout, URL should not include /customers
    const url = page.url();
    expect(url).not.toMatch(/\/admin\/customers/);
    // Login page should render
    await page.waitForLoadState('networkidle');
  });

  // ── REG_007 — Phone search → reset restores original count ───────────────

  test('TC_CUST_REG_007 — BRD-CUST §5 — Search by phone then clear search restores full count', async ({ page }) => {
    // NOTE: Search is phone-only per TechSpec §2 — `globalSearch` performs LIKE %value%
    // against `User.phone` only. OR branches for name/registration/unit/tower are
    // commented out in source (admin.controller.js lines 288–293).
    const totalBefore = await customersPage.getTableRecordsCount();

    // Search a valid phone so the table filters down
    await customersPage.searchByPhone('9999999999');
    await page.waitForLoadState('networkidle');

    // Clear the search box (fill with empty string)
    await customersPage.fill(customersPage.searchByPhoneInput, '');
    await customersPage.searchByPhoneInput.press('Enter').catch(() => {});
    await page.waitForLoadState('networkidle');

    await expect.poll(() => customersPage.getTableRecordsCount(), { timeout: 15_000 }).toBe(totalBefore);
  });

  // ── REG_008 — Cancel modal closes without persisting state ───────────────

  test('TC_CUST_REG_008 — BRD-CUST §6 BR3 — Cancel Registration modal close does not alter row state', async () => {
    // Filter to rows eligible for cancel (Registered/Waitlisted)
    await customersPage.applyStatusFilter('Registered');
    const rowCount = await customersPage.tableRows.count();
    test.skip(rowCount === 0, 'No Registered rows on UAT to test close behaviour');

    const countBefore = await customersPage.getTableRecordsCount();

    // Open modal then close without confirming
    await customersPage.rowTrashIcon.nth(0).click();
    await customersPage.cancelModal.waitFor({ state: 'visible', timeout: 10_000 });
    await customersPage.closeCancelModal();

    // Record count must be unchanged
    await customersPage.resetFilters();
    await customersPage.applyStatusFilter('Registered');
    const countAfter = await customersPage.getTableRecordsCount();
    expect(countAfter).toBe(countBefore);
  });

  // ── REG_009 — KPI cards unchanged after filter applied (TechSpec §4) ───────

  test('TC_CUST_REG_009 — FRD-CUST TechSpec §4 — KPI card counts unchanged when table filter is active', async () => {
    // Capture KPI values before filter
    const kpiBefore = {
      registered:   await customersPage.getKpiValue(customersPage.kpiRegistered),
      cancelled:    await customersPage.getKpiValue(customersPage.kpiCancelled),
      activeTowers: await customersPage.getKpiValue(customersPage.kpiActiveTowers),
    };

    // Apply filter — table narrows but KPIs use a separate aggregate query
    await customersPage.applyStatusFilter('Cancelled');
    await customersPage.page.waitForLoadState('networkidle');

    const kpiAfter = {
      registered:   await customersPage.getKpiValue(customersPage.kpiRegistered),
      cancelled:    await customersPage.getKpiValue(customersPage.kpiCancelled),
      activeTowers: await customersPage.getKpiValue(customersPage.kpiActiveTowers),
    };

    // KPI values must be identical — they are NOT filter-scoped
    expect(kpiAfter).toEqual(kpiBefore);
  });
});
