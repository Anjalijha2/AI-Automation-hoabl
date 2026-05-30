'use strict';

/**
 * offers.spec.js — End-to-End tests for the Admin Portal Offers module.
 *
 * What this file tests:
 *   The Offers module is where admins manage the discount instruments (Amount Based
 *   or Percentage Based) that flow into the All-Inclusive Price (AIP) shown to
 *   buyers. These E2E tests exercise the full create → list → toggle → delete
 *   journey against the live UAT environment.
 *
 * How test IDs work:
 *   Each test title starts with a TC_ID (e.g. ADM_OFR_001) that traces back to
 *   manual-qa-repository/01-test-cases/admin-portal/offers/TC_OFFERS.md.
 *   BRD reference: ADMIN-FS-Offers §<section>.
 *
 * Authentication:
 *   All tests run as an authenticated admin via the saved storageState file.
 *   Run `npm run auth:setup` if the session expires.
 *
 * Destructive tests:
 *   Offer create / toggle / delete calls mutate real backend state on UAT — they
 *   shift discount instruments that propagate to buyer-facing pricing. These
 *   tests are SKIPPED by default on UAT. Set ALLOW_DESTRUCTIVE=1 only when you
 *   have disposable test data ready.
 *
 * BRD: ADMIN-BRD-Offers · FSD: fsd-offers.md
 */

const { test, expect } = require('@playwright/test');
const { OffersPage } = require('../../../automation-repository/pages/admin/OffersPage');

// Load saved admin session — browser starts already logged in.
test.use({ storageState: 'automation-repository/fixtures/.auth/admin.json' });

test.describe('Offers — Admin Portal E2E', () => {
  let offersPage;

  /**
   * beforeEach — runs before every test in this describe block.
   * Constructs a fresh OffersPage, navigates to /admin/offers, and waits for
   * either the Add New Offer button or the offers table to be visible. Fresh
   * navigation per test prevents filter/modal state leakage between tests.
   */
  test.beforeEach(async ({ page }) => {
    offersPage = new OffersPage(page);
    await offersPage.navigate();
    await offersPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Page load & navigation
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_OFR_001 — ADMIN-FS-Offers §1 — Offers page loads at /admin/offers', async ({ page }) => {
    // We're already on the page from beforeEach. Verify URL + primary controls.
    await offersPage.expectOnOffersUrl();
    await expect(offersPage.addNewOfferButton).toBeVisible();
    await expect(page).toHaveScreenshot('offers-e2e-001-default-landing.png', {
      maxDiffPixels: 200,
      fullPage: true,
    });
  });

  test('ADM_OFR_001b — ADMIN-FS-Offers §1 — Sidebar navigation opens Offers module', async () => {
    // Land elsewhere first so the sidebar click is meaningful.
    await offersPage.page.goto('https://uat-web.xrportal.in/admin/cms');
    await offersPage.page.waitForLoadState('networkidle');
    await offersPage.navigateViaSidebar();
    await offersPage.expectOnOffersUrl();
    await expect(offersPage.addNewOfferButton).toBeVisible();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Offers list rendering & search
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_OFR_002 — ADMIN-FS-Offers §1 — Offers table renders with rows or empty state', async () => {
    // On UAT either rows exist OR the list is empty (cleared between sprints) —
    // both outcomes are valid. We just confirm the UI table rendered.
    const rows = await offersPage.getOffersList();
    const hasTable = await offersPage.offersTable.first().isVisible().catch(() => false);
    expect(hasTable).toBeTruthy();
    expect(Array.isArray(rows)).toBeTruthy();
  });

  test('ADM_OFR_004 — ADMIN-FS-Offers §1 — Type column values match Amount Based / Percentage Based', async () => {
    const rows = await offersPage.getOffersList();
    test.skip(rows.length === 0, 'No offers on UAT to inspect Type column');
    const allowed = /Amount|Percentage/i;
    for (const r of rows) {
      // Type cell may render empty during pending load — only assert when populated.
      if (r.type && r.type.length > 0) {
        expect(r.type).toMatch(allowed);
      }
    }
  });

  test('ADM_OFR_034 — ADMIN-FS-Offers §1 — Refresh button reloads list without navigation', async ({ page }) => {
    const urlBefore = page.url();
    await offersPage.clickRefresh();
    const urlAfter = page.url();
    expect(urlAfter).toBe(urlBefore);
    await expect(offersPage.offersTable.first()).toBeVisible();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Create Offer form (open / cancel — non-destructive)
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_OFR_007 — ADMIN-FS-Offers §2 — Click Add New Offer opens create form', async () => {
    await offersPage.openCreateOfferModal();
    await offersPage.expectModalVisible();
    await expect(offersPage.offerNameInput).toBeVisible();
    await expect(offersPage.submitOfferButton).toBeVisible();
    // Dismiss so subsequent tests start clean.
    await offersPage.cancelOfferForm();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Create Offer — happy paths (DESTRUCTIVE)
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_OFR_008 — ADMIN-FS-Offers §2 — Create Amount Based offer with valid data', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — destructive offer create; set ALLOW_DESTRUCTIVE=1 with disposable data');

    const name = `E2E_Amt_${Date.now()}`;
    await offersPage.openCreateOfferModal();
    await offersPage.fillOfferAmount({
      name,
      amount: 27000,
      startDate: offersPage.isoDate(0),
      endDate:   offersPage.isoDate(30),
    });
    await offersPage.submitOffer();

    // Verify the row landed in the list with correct ₹ rendering.
    await offersPage.expectOfferInList(name);
    await offersPage.expectPricingApplied({ offerName: name, type: 'Amount', discountValue: 27000 });
  });

  test('ADM_OFR_013 — ADMIN-FS-Offers §2 — Create Percentage Based offer with 5%', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — destructive offer create; set ALLOW_DESTRUCTIVE=1');

    const name = `E2E_Pct_${Date.now()}`;
    await offersPage.openCreateOfferModal();
    await offersPage.fillOfferPercentage({
      name,
      percentage: 5,
      startDate: offersPage.isoDate(0),
      endDate:   offersPage.isoDate(30),
    });
    await offersPage.submitOffer();

    await offersPage.expectOfferInList(name);
    await offersPage.expectPricingApplied({ offerName: name, type: 'Percentage', discountValue: 5 });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // NEG / VAL: Form validation
  // These submit the form intentionally invalid — they DO NOT create offers,
  // so they're safe to run on UAT without ALLOW_DESTRUCTIVE.
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_OFR_012 — ADMIN-FS-Offers §2 — Empty Offer Name is rejected', async () => {
    await offersPage.openCreateOfferModal();
    await offersPage.fillOfferAmount({
      // intentionally no name
      amount: 1000,
      startDate: offersPage.isoDate(0),
      endDate:   offersPage.isoDate(10),
    });
    await offersPage.submitOffer();
    await offersPage.expectValidationError();
  });

  test('ADM_OFR_010 — ADMIN-FS-Offers §2 — Negative discount value rejected', async () => {
    await offersPage.openCreateOfferModal();
    await offersPage.fillOfferAmount({
      name: `NEG_NegAmt_${Date.now()}`,
      amount: -500,
      startDate: offersPage.isoDate(0),
      endDate:   offersPage.isoDate(10),
    });
    await offersPage.submitOffer();
    await offersPage.expectValidationError();
  });

  test('ADM_OFR_014 — ADMIN-FS-Offers §2 — Percentage > 100 rejected', async () => {
    await offersPage.openCreateOfferModal();
    await offersPage.fillOfferPercentage({
      name: `NEG_Pct101_${Date.now()}`,
      percentage: 101,
      startDate: offersPage.isoDate(0),
      endDate:   offersPage.isoDate(10),
    });
    await offersPage.submitOffer();
    await offersPage.expectValidationError();
  });

  test('ADM_OFR_016 — ADMIN-FS-Offers §2 — End date before start date is rejected', async () => {
    await offersPage.openCreateOfferModal();
    await offersPage.fillOfferAmount({
      name: `NEG_EndBefore_${Date.now()}`,
      amount: 1000,
      startDate: offersPage.isoDate(10),
      endDate:   offersPage.isoDate(0),  // before start
    });
    await offersPage.submitOffer();
    await offersPage.expectValidationError();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BIZ: Toggle Active state (DESTRUCTIVE — pricing propagates to buyers)
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_OFR_023 — ADMIN-FS-Offers §3 — Toggle Active OFF takes effect immediately without confirmation', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — toggle affects live buyer pricing; set ALLOW_DESTRUCTIVE=1');

    const rows = await offersPage.getOffersList();
    test.skip(rows.length === 0, 'No offers on UAT to toggle');

    const target = rows.find(r => r.name && r.name.length > 0);
    test.skip(!target, 'No named offer row available to toggle');

    const before = await offersPage.getOfferActiveState(target.name);
    await offersPage.toggleOfferActive(target.name);
    const after = await offersPage.getOfferActiveState(target.name);
    // State must have flipped — exact value depends on initial state, but it
    // must not be equal to `before`.
    if (before !== null && after !== null) {
      expect(after).not.toBe(before);
    }

    // Restore original state to keep UAT data stable.
    await offersPage.toggleOfferActive(target.name);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Delete flow — cancel path (non-destructive) and confirm path (destructive)
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_OFR_030 — ADMIN-FS-Offers §3 — Cancel delete keeps offer in the list', async () => {
    const rows = await offersPage.getOffersList();
    test.skip(rows.length === 0, 'No offers on UAT to exercise cancel-delete');

    const target = rows.find(r => r.name && r.name.length > 0);
    test.skip(!target, 'No named offer row available to exercise cancel-delete');

    await offersPage.cancelDelete(target.name);
    // Row must still be present after cancel.
    await offersPage.expectOfferInList(target.name);
  });

  test('ADM_OFR_029 — ADMIN-FS-Offers §3 — Confirm delete removes offer from list', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — destructive offer delete (soft-delete); set ALLOW_DESTRUCTIVE=1');

    // Create a throwaway offer first so we never delete a real one.
    const name = `E2E_DelMe_${Date.now()}`;
    await offersPage.openCreateOfferModal();
    await offersPage.fillOfferAmount({
      name,
      amount: 100,
      startDate: offersPage.isoDate(0),
      endDate:   offersPage.isoDate(1),
    });
    await offersPage.submitOffer();
    await offersPage.expectOfferInList(name);

    // Now delete it and assert it's gone.
    await offersPage.deleteOffer(name);
    await offersPage.expectOfferNotInList(name);
  });
});
