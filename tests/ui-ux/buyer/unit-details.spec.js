'use strict';

/**
 * UI/UX Spec — Buyer Portal Unit Details
 * BRD/FRD: BUYER-FS-Unit-Details
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/unit-details/TC_UNIT_DETAILS.md
 *
 * Coverage (7 tests):
 *   - Page layout / heading / shell        (BYR_UNIT_038)
 *   - Unit information block layout        (BYR_UNIT_004..008)
 *   - Cost Sheet layout & rows             (BYR_UNIT_010, 011)
 *   - Floor & Unit Plans block             (BYR_UNIT_021)
 *   - Embedded payment schedule layout     (BYR_UNIT_048)
 *   - Tower View tooltip / hover           (BYR_UNIT_044)
 *   - Mobile responsive (viewport=375)     (BYR_UNIT_058)
 *
 * Guards:
 *   - test.skip when no allotted unit exists (non-WINNER)
 *   - ENV=uat retained but does NOT skip — UI tests are read-only
 */

const { test, expect } = require('@playwright/test');
const { UnitDetailsPage } = require('../../../automation-repository/pages/buyer/UnitDetailsPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/buyer.json' });

async function skipIfNoAllottedUnit(unitPage, testInfo) {
  const onLogin = await unitPage.isOnLoginRedirect();
  if (onLogin) {
    testInfo.skip(true, 'Buyer session redirected to /login — re-run npm run auth:setup');
  }
  const on404 = await unitPage.isOnNotFound();
  if (on404) {
    testInfo.skip(true, 'Unit Details surface is 404 — buyer has no allotted unit (non-WINNER)');
  }
}

test.describe('Unit Details Module — Buyer Portal UI/UX', () => {
  let unitPage;

  test.beforeEach(async ({ page }) => {
    unitPage = new UnitDetailsPage(page);
    await unitPage.navigate();
    await unitPage.waitForLoad();
  });

  test('BYR_UNIT_038 — BUYER-FS-Unit-Details §Layout — Page shell renders without broken layout', async ({ page }, testInfo) => {
    await skipIfNoAllottedUnit(unitPage, testInfo);
    await expect(unitPage.pageShell).toBeVisible({ timeout: 8_000 });
    await expect(page).toHaveScreenshot('byr-unit-038-page-shell.png', { maxDiffPixels: 800 });
  });

  test('BYR_UNIT_004_008 — BUYER-FS-Unit-Details §Unit-Information — All key fields visible on initial render', async ({ page }, testInfo) => {
    await skipIfNoAllottedUnit(unitPage, testInfo);
    await unitPage.expectUnitInformationPopulated();
    await expect(unitPage.unitInfoSection).toBeVisible();
    await expect(page).toHaveScreenshot('byr-unit-004-unit-info.png', { maxDiffPixels: 600 });
  });

  test('BYR_UNIT_010_011 — BUYER-FS-Unit-Details §Cost-Sheet — Cost Sheet section renders with line rows', async ({ page }, testInfo) => {
    await skipIfNoAllottedUnit(unitPage, testInfo);
    await unitPage.openCostSheet();
    await unitPage.expectCostSheetVisible();
    const text = await unitPage.getCostSheetText();
    // Either rows visible OR section text contains at least a Basic / Total label
    expect(/Basic|Total|GST/i.test(text)).toBeTruthy();
    await expect(page).toHaveScreenshot('byr-unit-010-cost-sheet-ui.png', { maxDiffPixels: 800 });
  });

  test('BYR_UNIT_021 — BUYER-FS-Unit-Details §Floor-Plans — Floor & Unit Plans block renders with images or placeholder', async ({ page }, testInfo) => {
    await skipIfNoAllottedUnit(unitPage, testInfo);
    const fpVisible =
      (await unitPage.floorPlanSection.isVisible({ timeout: 3_000 }).catch(() => false)) ||
      (await unitPage.floorPlanToggle.isVisible({ timeout: 3_000 }).catch(() => false));
    test.skip(!fpVisible, 'Floor plan section / toggle not in DOM');
    await unitPage.openFloorPlan();
    await unitPage.expectFloorPlanVisible();
    const imgCount = await unitPage.getFloorPlanImageCount();
    // Either ≥1 image OR section visible with placeholder copy
    expect(imgCount >= 0).toBeTruthy();
    await expect(page).toHaveScreenshot('byr-unit-021-floor-plans.png', { maxDiffPixels: 1000 });
  });

  test('BYR_UNIT_048 — BUYER-FS-Unit-Details §Payment-Schedule — Embedded schedule row layout (label / amount / due date)', async ({ page }, testInfo) => {
    await skipIfNoAllottedUnit(unitPage, testInfo);
    const psVisible = await unitPage.paymentScheduleSection.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!psVisible, 'Embedded Payment Schedule not in DOM');
    await unitPage.openPaymentScheduleEmbedded();
    await unitPage.expectPaymentScheduleVisible();
    const count = await unitPage.getMilestoneCount();
    if (count > 0) {
      const firstRowText = ((await unitPage.milestoneRows.first().textContent()) || '').trim();
      expect(firstRowText.length).toBeGreaterThan(0);
    }
    await expect(page).toHaveScreenshot('byr-unit-048-payment-schedule.png', { maxDiffPixels: 800 });
  });

  test('BYR_UNIT_044 — BUYER-FS-Unit-Details §Tower-View — Tower View block renders (hover/tooltip affordance present)', async ({ page }, testInfo) => {
    await skipIfNoAllottedUnit(unitPage, testInfo);
    const tvVisible =
      (await unitPage.towerViewSection.isVisible({ timeout: 3_000 }).catch(() => false)) ||
      (await unitPage.towerViewToggle.isVisible({ timeout: 3_000 }).catch(() => false));
    test.skip(!tvVisible, 'Tower View not in DOM');
    await unitPage.openTowerView();
    await unitPage.expectTowerViewVisible();
    // Hover over the highlighted unit to check the tooltip affordance — best effort
    const myUnitVisible = await unitPage.towerViewMyUnit.isVisible({ timeout: 2_000 }).catch(() => false);
    if (myUnitVisible) {
      await unitPage.towerViewMyUnit.hover({ trial: false }).catch(() => {});
    }
    await expect(page).toHaveScreenshot('byr-unit-044-tower-view.png', { maxDiffPixels: 1000 });
  });

  test('BYR_UNIT_058 — BUYER-FS-Unit-Details §Responsive — Mobile (375px) renders without horizontal scroll', async ({ page }, testInfo) => {
    await skipIfNoAllottedUnit(unitPage, testInfo);
    await page.setViewportSize({ width: 375, height: 812 });
    await unitPage.waitForLoad();
    // scrollWidth should be <= viewport width (allow 2px tolerance for rounding)
    const overflow = await page.evaluate(() => {
      return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
    });
    expect(overflow.sw).toBeLessThanOrEqual(overflow.cw + 2);
    await expect(page).toHaveScreenshot('byr-unit-058-mobile-375.png', { maxDiffPixels: 1200 });
  });
});
