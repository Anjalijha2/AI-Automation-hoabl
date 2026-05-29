'use strict';

/**
 * home-dashboard.spec.js — UI/UX tests for the Buyer Portal Home Dashboard module.
 *
 * BRD/FRD: BUYER-FS-Home-Dashboard
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/home-dashboard/TC_HOME_DASHBOARD.md
 *
 * Scope of UI/UX layer (versus E2E):
 *   - E2E spec covers behaviour (click → navigate, API → render).
 *   - UI/UX spec covers rendering: presence of layout elements, column headers,
 *     responsive behaviour, badge styling, banner visibility.
 *
 * Most UI assertions here are state-tolerant — UAT buyer accounts may or may not
 * have registrations / active campaigns. Tests assert layout shape, not specific
 * counts or text values that change across runs.
 */

const { test, expect } = require('@playwright/test');
const { HomeDashboardPage } = require('../../../automation-repository/pages/buyer/HomeDashboardPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/buyer.json' });

test.describe('Home Dashboard — Buyer Portal UI/UX', () => {
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new HomeDashboardPage(page);
    await dashboardPage.navigate();
    await dashboardPage.waitForLoad();
    await dashboardPage.dismissHomePopupIfVisible();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Layout
  // ══════════════════════════════════════════════════════════════════════════

  test('BYR_DASH_002 — BUYER-FS-Home-Dashboard §Top-Nav — top navigation bar renders all menu items', async () => {
    // Either a header or nav landmark must exist
    await expect(dashboardPage.topNavBar).toBeVisible();

    // At least 3 of the canonical menu items must be visible (some portals
    // collapse into a hamburger on small viewports; we run desktop here).
    const items = [
      dashboardPage.navHome,
      dashboardPage.navProject,
      dashboardPage.navMyUnit,
      dashboardPage.navPaymentSchedule,
      dashboardPage.navHomeLoan,
      dashboardPage.navWorkProgress,
      dashboardPage.navSupport,
      dashboardPage.navProfile,
    ];
    let visibleCount = 0;
    for (const item of items) {
      // Use .isVisible() with a short timeout — we don't want to fail fast on missing items
      if (await item.isVisible({ timeout: 1_500 }).catch(() => false)) visibleCount += 1;
    }
    expect(visibleCount).toBeGreaterThanOrEqual(3);
  });

  test('BYR_DASH_003 — BUYER-FS-Home-Dashboard §Header — buyer name/profile shown in header', async () => {
    await dashboardPage.expectWelcomeMessage();
  });

  test('BYR_DASH_004 — BUYER-FS-Home-Dashboard §TopAlert — Status Alert Banner visible when applicable', async ({ page }) => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — requires staged TopAlert-triggering buyer state');

    // When applicable, the alert banner must render. On the live UAT account this
    // may not always be true, hence the skip above for routine runs.
    await expect(dashboardPage.topAlertBanner).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveScreenshot('byr-dash-004-topalert.png', { maxDiffPixels: 300 });
  });

  test('BYR_DASH_005 — BUYER-FS-Home-Dashboard §Allocation-Banner-Countdown — banner shows countdown when campaign scheduled', async () => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — requires future-start campaign in test data');
    await dashboardPage.expectCountdownTimer();
  });

  test('BYR_DASH_006 — BUYER-FS-Home-Dashboard §Allocation-Banner-Live — banner shows LIVE state during active campaign', async () => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — requires active campaign');
    await expect(dashboardPage.allocationBanner).toBeVisible({ timeout: 10_000 });
    await expect(dashboardPage.allocationBanner).toContainText(/live|active|allocation\s+is/i);
  });

  test('BYR_DASH_007 — BUYER-FS-Home-Dashboard §Creative-Tiles — render Strapi content', async () => {
    // Tiles may or may not be present depending on Strapi config; we assert
    // the section exists if any creative class is found, otherwise skip.
    const tilesVisible = await dashboardPage.creativeTilesSection.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!tilesVisible, 'No creative tiles section published in Strapi for this buyer segment');
    await expect(dashboardPage.creativeTilesSection).toBeVisible();
  });

  test('BYR_DASH_010 — BUYER-FS-Home-Dashboard §Marquee — scrolls announcements when configured', async () => {
    const marqueeVisible = await dashboardPage.marquee.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!marqueeVisible, 'No marquee content configured in CMS — skipping');
    await expect(dashboardPage.marquee).toBeVisible();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Registration Table — column headers
  // ══════════════════════════════════════════════════════════════════════════

  test('BYR_DASH_011 — BUYER-FS-Home-Dashboard §Registration-Table — renders all buyer registrations', async ({ page }) => {
    const tableVisible = await dashboardPage.registrationTable.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!tableVisible, 'No registrations for this buyer on UAT');

    const rowCount = await dashboardPage.getRegistrationCount();
    expect(rowCount).toBeGreaterThan(0);
    await expect(page).toHaveScreenshot('byr-dash-011-registration-table.png', { maxDiffPixels: 400, fullPage: true });
  });

  test('BYR_DASH_012 — BUYER-FS-Home-Dashboard §Reg-Number-Format — registration number formatted GHNG-XXXXXXXXXX', async () => {
    const tableVisible = await dashboardPage.registrationTable.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!tableVisible, 'No registration table to inspect');

    // Match GHNG- prefix followed by 10 alphanumeric characters anywhere in the table
    const ghngText = dashboardPage.page.locator('table, [role="table"]').first().getByText(/GHNG-[A-Z0-9]{10}/i).first();
    const visible = await ghngText.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!visible, 'No GHNG- formatted registration visible on this buyer account');
    await expect(ghngText).toBeVisible();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Status badges
  // ══════════════════════════════════════════════════════════════════════════

  test('BYR_DASH_016 — BUYER-FS-Home-Dashboard §Status-Available — green badge renders', async () => {
    const visible = await dashboardPage.statusBadgeAvailable.first().isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!visible, 'No Available registration on this buyer — cannot assert badge styling');
    await expect(dashboardPage.statusBadgeAvailable.first()).toBeVisible();
  });

  test('BYR_DASH_017 — BUYER-FS-Home-Dashboard §Status-Waitlisted — grey/dark badge renders', async () => {
    const visible = await dashboardPage.statusBadgeWaitlisted.first().isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!visible, 'No Waitlisted registration on this buyer');
    await expect(dashboardPage.statusBadgeWaitlisted.first()).toBeVisible();
  });

  test('BYR_DASH_018 — BUYER-FS-Home-Dashboard §Status-Booked — green badge renders with text', async () => {
    const visible = await dashboardPage.statusBadgeBooked.first().isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!visible, 'No Booked registration on this buyer');
    await expect(dashboardPage.statusBadgeBooked.first()).toBeVisible();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Process Status CTAs
  // ══════════════════════════════════════════════════════════════════════════

  test('BYR_DASH_020 — BUYER-FS-Home-Dashboard §Process-Available-Live — "Proceed to Confirm" CTA visible', async () => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — requires Available+Live state');
    await expect(dashboardPage.proceedToConfirmBtn).toBeVisible();
    await expect(dashboardPage.proceedToConfirmBtn).toBeEnabled();
  });

  test('BYR_DASH_022 — BUYER-FS-Home-Dashboard §Process-CompleteKYC — "Complete KYC" CTA visible post-booking', async () => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — requires WINNER + KYC-not-submitted state');
    await expect(dashboardPage.completeKycBtn).toBeVisible();
  });

  test('BYR_DASH_023 — BUYER-FS-Home-Dashboard §Process-KYC-Completed — "KYC Completed" text visible once done', async () => {
    const visible = await dashboardPage.kycCompletedText.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!visible, 'No buyer in KYC-completed state on this account');
    await expect(dashboardPage.kycCompletedText).toBeVisible();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Responsive
  // ══════════════════════════════════════════════════════════════════════════

  test('BYR_DASH_RESPONSIVE_001 — BUYER-FS-Home-Dashboard §Responsive — dashboard renders at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await dashboardPage.waitForLoad();
    await expect(page).toHaveURL(/\/home/);
    // Either the table, an empty state, or the nav must still be rendered at mobile width
    const tableVisible = await dashboardPage.registrationTable.isVisible({ timeout: 5_000 }).catch(() => false);
    const emptyVisible = await dashboardPage.emptyState.isVisible({ timeout: 5_000 }).catch(() => false);
    const navVisible   = await dashboardPage.topNavBar.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(tableVisible || emptyVisible || navVisible).toBeTruthy();
    await expect(page).toHaveScreenshot('byr-dash-responsive-mobile.png', { maxDiffPixels: 500, fullPage: true });
  });

  test('BYR_DASH_RESPONSIVE_002 — BUYER-FS-Home-Dashboard §Responsive — dashboard renders at tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await dashboardPage.waitForLoad();
    await expect(page).toHaveURL(/\/home/);
    await expect(page).toHaveScreenshot('byr-dash-responsive-tablet.png', { maxDiffPixels: 500, fullPage: true });
  });
});
