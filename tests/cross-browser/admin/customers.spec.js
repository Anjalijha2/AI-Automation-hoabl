'use strict';

// tests/cross-browser/admin/customers.spec.js
// Customers module — Cross-Browser Compatibility
// Runs under chromium / firefox / webkit projects in playwright.config.js.
// Focus: core layout, KPI cards, table presence, and interactive controls
// render correctly across all three engines.
// BRD: ADMIN-BRD-Customers §4

const { test, expect } = require('@playwright/test');
const { CustomersPage } = require('../../../automation-repository/pages/admin/CustomersPage');

test.use({
  storageState: 'automation-repository/fixtures/.auth/admin.json',
});

test.describe('Customers — Cross-Browser Compatibility', () => {
  let customersPage;

  test.beforeEach(async ({ page }) => {
    customersPage = new CustomersPage(page);
    await customersPage.navigate();
    await customersPage.waitForLoad();
  });

  // ── XBRO_001 — Page loads across all browsers ────────────────────────────

  test('TC_CUST_XBRO_001 — BRD-CUST §3 — Customers page loads correctly across browsers', async () => {
    await customersPage.expectOnCustomersUrl();
    await expect(customersPage.registrationTable).toBeVisible();
  });

  // ── XBRO_002 — KPI cards render across browsers ──────────────────────────

  test('TC_CUST_XBRO_002 — BRD-CUST §4 — All 6 KPI cards visible across browsers', async () => {
    await customersPage.expectKpiVisible();

    // Verify each card has a numeric value (cross-browser font rendering may differ but text must be present)
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
  });

  // ── XBRO_003 — Table and column headers render ───────────────────────────

  test('TC_CUST_XBRO_003 — BRD-CUST §4 — Registration table and all column headers visible across browsers', async () => {
    await expect(customersPage.registrationTable).toBeVisible();
    await expect(customersPage.colRegistrationNumber).toBeVisible();
    await expect(customersPage.colGrowthPartner).toBeVisible();
    await expect(customersPage.colPhone).toBeVisible();
    await expect(customersPage.colStatus).toBeVisible();
    await expect(customersPage.colActions).toBeVisible();
  });

  // ── XBRO_004 — Toolbar controls render across browsers ───────────────────

  test('TC_CUST_XBRO_004 — BRD-CUST §4 — All toolbar controls visible across browsers', async () => {
    await expect(customersPage.searchByPhoneInput).toBeVisible();
    await expect(customersPage.filterButton).toBeVisible();
    await expect(customersPage.refreshButton).toBeVisible();
    await expect(customersPage.downloadButton).toBeVisible();
    await expect(customersPage.cancelBulkUnitsButton).toBeVisible();
  });

  // ── XBRO_005 — Pagination bar renders across browsers ────────────────────

  test('TC_CUST_XBRO_005 — BRD-CUST §4 — Pagination bar and controls present across browsers', async () => {
    await customersPage.scrollToPagination();
    await expect(customersPage.paginationBar).toBeVisible();
    await expect(customersPage.paginationPrevBtn).toBeVisible();
    await expect(customersPage.paginationNextBtn).toBeVisible();
  });

  // ── XBRO_006 — Search input accepts keystrokes across browsers ───────────

  test('TC_CUST_XBRO_006 — BRD-CUST §5 — Search by phone input is interactive across browsers', async () => {
    await customersPage.fill(customersPage.searchByPhoneInput, '9999');
    const val = await customersPage.searchByPhoneInput.inputValue();
    expect(val).toBe('9999');

    // Clear and confirm cleared
    await customersPage.fill(customersPage.searchByPhoneInput, '');
    const cleared = await customersPage.searchByPhoneInput.inputValue();
    expect(cleared).toBe('');
  });

  // ── XBRO_007 — Filter panel toggle works across browsers ─────────────────

  test('TC_CUST_XBRO_007 — BRD-CUST §5 — Filter panel opens correctly across browsers', async () => {
    await customersPage.openFilterPanel();
    await expect(customersPage.resetFiltersButton).toBeVisible();
  });

  // ── XBRO_008 — Table heading record count format across browsers ──────────

  test('TC_CUST_XBRO_008 — BRD-CUST §6 BR1 — Registration Records heading renders correct format across browsers', async () => {
    const txt = (await customersPage.tableRecordsHeading.textContent() || '').trim();
    expect(txt).toMatch(/\d[\d,]*\s+Registration Records/i);
  });
});
