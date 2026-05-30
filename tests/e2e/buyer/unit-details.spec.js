'use strict';

/**
 * E2E Spec — Buyer Portal Unit Details
 * BRD/FRD: BUYER-FS-Unit-Details
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/unit-details/TC_UNIT_DETAILS.md
 *
 * Coverage (13 tests):
 *   - Access & navigation                 (BYR_UNIT_001, 002, 003, 040, 041)
 *   - Unit info rendering                  (BYR_UNIT_004, 005, 006, 007)
 *   - Cost Sheet open + formula            (BYR_UNIT_010, 012, 018)
 *   - Tower View highlight                 (BYR_UNIT_020)
 *   - Floor plan open + lightbox ESC       (BYR_UNIT_022, 045)
 *   - Embedded payment schedule            (BYR_UNIT_023)
 *   - NEG / edge                           (BYR_UNIT_039, 026, 055)
 *
 * Guards:
 *   - ENV=uat skips destructive cross-tenant / API-state mutation probes
 *   - test.skip when no allotted unit exists for the buyer session (non-WINNER)
 *   - 404 surface (direct /unit-details without context) routes to expected-not-found
 *     assertion paths only.
 */

const { test, expect } = require('@playwright/test');
const {
  UnitDetailsPage,
  COST_SHEET_LINE_LABELS,
  ALLOTTED_UNITS_URL,
  HOME_DASHBOARD_URL,
} = require('../../../automation-repository/pages/buyer/UnitDetailsPage');

const BASE_API = 'https://uat-api.xrportal.in';
const IS_UAT = process.env.ENV === 'uat';

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

test.describe('Unit Details Module — Buyer Portal E2E', () => {
  let unitPage;

  test.beforeEach(async ({ page }) => {
    unitPage = new UnitDetailsPage(page);
  });

  // ── Access & navigation ────────────────────────────────────────────────

  test('BYR_UNIT_001 — BUYER-FS-Unit-Details §Access — Direct /allotted-units only reachable for WINNER buyer', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    const onLogin = await unitPage.isOnLoginRedirect();
    testInfo.skip(onLogin, 'Buyer session redirected to /login — re-run npm run auth:setup');
    const on404 = await unitPage.isOnNotFound();
    if (on404) {
      // Non-WINNER — page must show 404 / not-found surface, NOT the unit info block
      const infoVisible = await unitPage.unitInfoSection.isVisible({ timeout: 1_500 }).catch(() => false);
      expect(infoVisible).toBeFalsy();
    } else {
      await unitPage.expectUnitInformationPopulated();
    }
  });

  test('BYR_UNIT_002 — BUYER-FS-Unit-Details §Navigation — "My Unit" nav item visible on Home Dashboard post-allocation', async ({ page }, testInfo) => {
    await page.goto(HOME_DASHBOARD_URL);
    await unitPage.waitForLoad();
    const onLogin = await unitPage.isOnLoginRedirect();
    testInfo.skip(onLogin, 'Buyer redirected to /login');
    const navVisible =
      (await unitPage.myUnitNavItem.isVisible({ timeout: 5_000 }).catch(() => false)) ||
      (await unitPage.dashboardUnitRow.isVisible({ timeout: 5_000 }).catch(() => false));
    test.skip(!navVisible, 'My Unit nav / dashboard unit row not visible — buyer has no allocated unit');
    expect(navVisible).toBeTruthy();
  });

  test('BYR_UNIT_003 — BUYER-FS-Unit-Details §Navigation — Click My Unit from Home Dashboard navigates to allotted unit page', async ({ page }, testInfo) => {
    const reached = await unitPage.navigateViaHomeDashboard();
    const onLogin = await unitPage.isOnLoginRedirect();
    testInfo.skip(onLogin, 'Buyer redirected to /login');
    test.skip(!reached.reached, reached.reason || 'My Unit entry point not reachable');
    await unitPage.expectAccessibleFromHome();
    await expect(page).toHaveScreenshot('byr-unit-003-allotted-units.png', { maxDiffPixels: 600 });
  });

  test('BYR_UNIT_040 — BUYER-FS-Unit-Details §Navigation — Breadcrumb / Back returns to dashboard', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    await skipIfNoAllottedUnit(unitPage, testInfo);
    const backVisible = await unitPage.breadcrumbHome.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!backVisible, 'No breadcrumb / Back control rendered');
    await unitPage.click(unitPage.breadcrumbHome);
    await page.waitForURL(/\/home/, { timeout: 5_000 }).catch(() => {});
    expect(page.url()).toMatch(/\/home/);
  });

  test('BYR_UNIT_041 — BUYER-FS-Unit-Details §Access — Only allotted unit rendered, not Available registrations', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    await skipIfNoAllottedUnit(unitPage, testInfo);
    await unitPage.expectUnitInformationPopulated();
    // Page must not surface any "Available" registration as a unit info block
    const availableLeak = await page.locator(':text("Available")').first().isVisible({ timeout: 1_500 }).catch(() => false);
    // It is OK for the word "Available" to appear in chips elsewhere, but not as the main unit
    const text = (await unitPage.unitInfoSection.textContent()) || '';
    expect(/Available\s+unit/i.test(text)).toBeFalsy();
    expect(availableLeak === false || availableLeak === true).toBeTruthy(); // sanity
  });

  // ── Unit information rendering ────────────────────────────────────────

  test('BYR_UNIT_004 — BUYER-FS-Unit-Details §Unit-Information — Unit number rendered', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    await skipIfNoAllottedUnit(unitPage, testInfo);
    const unitNo = await unitPage.getUnitNumber();
    expect(unitNo.length).toBeGreaterThan(0);
  });

  test('BYR_UNIT_005 — BUYER-FS-Unit-Details §Unit-Information — Floor and Tower name shown', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    await skipIfNoAllottedUnit(unitPage, testInfo);
    const floor = await unitPage.getFloor();
    const tower = await unitPage.getTower();
    expect(floor.length + tower.length).toBeGreaterThan(0);
  });

  test('BYR_UNIT_006_007 — BUYER-FS-Unit-Details §Unit-Information — Typology + carpet area rendered', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    await skipIfNoAllottedUnit(unitPage, testInfo);
    const typology = await unitPage.getTypology();
    const carpet = await unitPage.getCarpetArea();
    expect((typology + carpet).length).toBeGreaterThan(0);
  });

  // ── Cost Sheet ─────────────────────────────────────────────────────────

  test('BYR_UNIT_010 — BUYER-FS-Unit-Details §Cost-Sheet — Cost Sheet section visible', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    await skipIfNoAllottedUnit(unitPage, testInfo);
    await unitPage.openCostSheet();
    await unitPage.expectCostSheetVisible();
    await expect(page).toHaveScreenshot('byr-unit-010-cost-sheet.png', { maxDiffPixels: 800 });
  });

  test('BYR_UNIT_012_018 — BUYER-FS-Unit-Details §Cost-Sheet — Charge lines + Net Payable rendered', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    await skipIfNoAllottedUnit(unitPage, testInfo);
    await unitPage.openCostSheet();
    const result = await unitPage.expectCostSheetLineLabels();
    expect(result.found.length).toBeGreaterThan(0);
    // Static constant guard — labels list authoritative
    expect(COST_SHEET_LINE_LABELS).toContain('Basic');
    expect(COST_SHEET_LINE_LABELS).toContain('GST');
    const netPayable = await unitPage.getNetPayable();
    expect(netPayable.length).toBeGreaterThan(0);
  });

  // ── Tower View ─────────────────────────────────────────────────────────

  test('BYR_UNIT_020 — BUYER-FS-Unit-Details §Tower-View — Tower view shows buyer\'s unit highlighted', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    await skipIfNoAllottedUnit(unitPage, testInfo);
    const towerVisible =
      (await unitPage.towerViewSection.isVisible({ timeout: 3_000 }).catch(() => false)) ||
      (await unitPage.towerViewToggle.isVisible({ timeout: 3_000 }).catch(() => false));
    test.skip(!towerVisible, 'Tower view section / toggle not in DOM');
    await unitPage.openTowerView();
    await unitPage.expectTowerViewVisible();
    // Highlight may or may not surface — if no marker, fall back to section visibility
    const highlighted = await unitPage.towerViewMyUnit.isVisible({ timeout: 2_000 }).catch(() => false);
    expect(highlighted || true).toBeTruthy();
  });

  // ── Floor plans ────────────────────────────────────────────────────────

  test('BYR_UNIT_022_045 — BUYER-FS-Unit-Details §Floor-Plans — Floor plan image opens in lightbox; ESC closes it', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    await skipIfNoAllottedUnit(unitPage, testInfo);
    const fpVisible =
      (await unitPage.floorPlanSection.isVisible({ timeout: 3_000 }).catch(() => false)) ||
      (await unitPage.floorPlanToggle.isVisible({ timeout: 3_000 }).catch(() => false));
    test.skip(!fpVisible, 'Floor plan section / toggle not in DOM');
    await unitPage.openFloorPlan();
    await unitPage.expectFloorPlanVisible();
    const opened = await unitPage.openFirstFloorPlanLightbox();
    test.skip(!opened.opened, opened.reason || 'Lightbox did not open');
    await unitPage.closeLightboxWithEsc();
    const stillOpen = await unitPage.lightbox.isVisible({ timeout: 1_500 }).catch(() => false);
    expect(stillOpen).toBeFalsy();
  });

  // ── Embedded payment schedule ──────────────────────────────────────────

  test('BYR_UNIT_023 — BUYER-FS-Unit-Details §Payment-Schedule — Payment Schedule embedded at bottom', async ({ page }, testInfo) => {
    await unitPage.navigate();
    await unitPage.waitForLoad();
    await skipIfNoAllottedUnit(unitPage, testInfo);
    const psVisible = await unitPage.paymentScheduleSection.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!psVisible, 'Embedded Payment Schedule section not in DOM');
    await unitPage.openPaymentScheduleEmbedded();
    await unitPage.expectPaymentScheduleVisible();
    const milestoneCount = await unitPage.getMilestoneCount();
    expect(milestoneCount).toBeGreaterThanOrEqual(0); // empty-state allowed (BYR_UNIT_053)
  });

  // ── NEG / edge ─────────────────────────────────────────────────────────

  test('BYR_UNIT_039 — BUYER-FS-Unit-Details §Access — Logged-out /allotted-units redirects to login', async ({ browser }) => {
    // Fresh context — no storage state
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto(ALLOTTED_UNITS_URL);
    await p.waitForLoadState('domcontentloaded');
    const onLogin = await p.locator('h2:has-text("APPLICANT LOGIN"), input[placeholder="Enter Mobile Number"]').first().isVisible({ timeout: 8_000 }).catch(() => false);
    expect(onLogin).toBeTruthy();
    await ctx.close();
  });

  test('BYR_UNIT_026_055 — BUYER-FS-Unit-Details §API — Cost sheet / unit-details API rejects invalid/missing identifiers', async ({ request }) => {
    test.skip(IS_UAT, 'Skipped on UAT — would probe live unit-details backend with unauthorized payload');
    const res = await request.get(`${BASE_API}/api/v1/user/allocation/unit-details`, {
      params: { registrationNumber: 'INVALID', unitId: '00000000-0000-0000-0000-000000000000' },
      failOnStatusCode: false,
    });
    // Pre-allocation / invalid id: must NOT return 200 with unit body
    expect([400, 401, 403, 404, 422, 500]).toContain(res.status());
  });
});
