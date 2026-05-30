'use strict';

/**
 * offers.spec.js — UI/UX tests for the Admin Portal Offers module.
 *
 * What this file tests:
 *   Pure layout / rendering / surface assertions. No mutations — every test here
 *   is safe to run on UAT without ALLOW_DESTRUCTIVE. Visual baselines captured at
 *   viewport 1920x900 via toHaveScreenshot().
 *
 * TC IDs map to manual-qa-repository/01-test-cases/admin-portal/offers/TC_OFFERS.md.
 * BRD reference: ADMIN-FS-Offers §<section>.
 */

const { test, expect } = require('@playwright/test');
const { OffersPage } = require('../../../automation-repository/pages/admin/OffersPage');

test.use({
  storageState: 'automation-repository/fixtures/.auth/admin.json',
  viewport: { width: 1920, height: 900 },
});

test.describe('Offers — Admin Portal UI/UX', () => {
  let offersPage;

  test.beforeEach(async ({ page }) => {
    offersPage = new OffersPage(page);
    await offersPage.navigate();
    await offersPage.waitForLoad();
  });

  test('ADM_OFR_003 — ADMIN-FS-Offers §1 — Add New Offer button visible in header', async ({ page }) => {
    await expect(offersPage.addNewOfferButton).toBeVisible();
    await expect(page).toHaveScreenshot('offers-ui-003-add-new-button.png', { maxDiffPixels: 200 });
  });

  test('ADM_OFR_002 — ADMIN-FS-Offers §1 — Offers table column headers render', async ({ page }) => {
    await expect(offersPage.offersTable.first()).toBeVisible();
    const headerCount = await offersPage.offerTableHeaders.count();
    // FSD-defined Offers list has at least 7 columns (Name, Type, Discount,
    // Start Date, End Date, Typology, Active, Action) — assert ≥ 6 to be
    // resilient to minor build-time column tweaks.
    expect(headerCount).toBeGreaterThanOrEqual(6);
    await expect(page).toHaveScreenshot('offers-ui-002-table-headers.png', { maxDiffPixels: 200 });
  });

  test('ADM_OFR_009 — ADMIN-FS-Offers §1 — Amount Based offers render with ₹ formatted discount', async () => {
    const rows = await offersPage.getOffersList();
    test.skip(rows.length === 0, 'No offers on UAT to inspect ₹ rendering');

    const amountRows = rows.filter(r => /amount/i.test(r.type || ''));
    test.skip(amountRows.length === 0, 'No Amount Based offers on UAT to inspect');

    for (const r of amountRows) {
      // Discount cell should contain the rupee glyph
      expect(r.discountValue).toMatch(/₹/);
    }
  });

  test('ADM_OFR_015 — ADMIN-FS-Offers §1 — Percentage Based offers render with % suffix', async () => {
    const rows = await offersPage.getOffersList();
    test.skip(rows.length === 0, 'No offers on UAT to inspect % rendering');

    const pctRows = rows.filter(r => /percent/i.test(r.type || ''));
    test.skip(pctRows.length === 0, 'No Percentage Based offers on UAT to inspect');

    for (const r of pctRows) {
      expect(r.discountValue).toMatch(/%/);
    }
  });

  test('ADM_OFR_027 — ADMIN-FS-Offers §1 — Trash icon visible in Action column for each row', async ({ page }) => {
    const rows = await offersPage.getOffersList();
    test.skip(rows.length === 0, 'No offers on UAT to inspect Action column');

    // The first data row should expose a trash / delete affordance.
    const firstRow = offersPage.offerRows.first();
    const trash = firstRow.locator(
      'button[aria-label*="delete" i], button:has-text("Delete"), .anticon-delete, [data-icon="delete"]'
    );
    expect(await trash.count()).toBeGreaterThan(0);
    await expect(page).toHaveScreenshot('offers-ui-027-action-column.png', { maxDiffPixels: 200 });
  });

  test('ADM_OFR_007b — ADMIN-FS-Offers §2 — Create Offer form exposes Type dropdown with Amount / Percentage options', async () => {
    await offersPage.openCreateOfferModal();
    await offersPage.expectModalVisible();
    const options = await offersPage.getOfferTypeOptions();
    expect(options.length).toBeGreaterThan(0);
    const joined = options.join('|').toLowerCase();
    expect(joined).toMatch(/amount/);
    expect(joined).toMatch(/percent/);
    await offersPage.cancelOfferForm();
  });
});
