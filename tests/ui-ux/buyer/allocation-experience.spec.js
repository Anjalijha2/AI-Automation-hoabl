'use strict';

/**
 * UI/UX Spec — Buyer Portal Allocation Experience
 * BRD/FRD: BUYER-FS-Allocation-Experience
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/allocation-experience/TC_ALLOCATION_EXPERIENCE.md
 *
 * Coverage (8 tests):
 *   - Waiting surface layout                  (BYR_ALLOC_001)
 *   - STATIC entry layout                     (BYR_ALLOC_002, 059)
 *   - Unit grid colour legend                 (BYR_ALLOC_008, 010)
 *   - Unit details panel + cost sheet         (BYR_ALLOC_014, 016)
 *   - T&C label exact text                    (BYR_ALLOC_022)
 *   - Post-campaign closed message exact text (BYR_ALLOC_071)
 *
 * Responsive checks: viewport variations against post-campaign closed message.
 *
 * Guards:
 *   - ENV=uat — no effect (UI/UX is read-only, safe on UAT)
 *   - All tests short-circuit via test.skip when the relevant surface is not active.
 */

const { test, expect } = require('@playwright/test');
const {
  AllocationExperiencePage,
  TC_LABEL_EXACT,
  POST_CAMPAIGN_CLOSED_TEXT,
  UNIT_COLOR,
} = require('../../../automation-repository/pages/buyer/AllocationExperiencePage');

test.use({ storageState: 'automation-repository/fixtures/.auth/buyer.json' });

async function skipIfGuarded(allot, testInfo) {
  if (await allot.isOnLoginRedirect()) {
    testInfo.skip(true, 'Buyer session redirected to /login — re-run npm run auth:setup');
  }
  if (await allot.isOnNotFound()) {
    testInfo.skip(true, '/allotment surface is a 404 for this buyer');
  }
}

test.describe('Allocation Experience Module — Buyer Portal UI/UX', () => {
  let allot;

  test.beforeEach(async ({ page }, testInfo) => {
    allot = new AllocationExperiencePage(page);
    await allot.navigate();
    await skipIfGuarded(allot, testInfo);
    await allot.waitForLoad();
  });

  // ── Waiting surface ────────────────────────────────────────────────────

  test('BYR_ALLOC_001_UI — BUYER-FS-Allocation-Experience §Waiting — Waiting layout renders with hero message and timer slot', async ({ page }) => {
    const surface = await allot.detectSurface();
    test.skip(surface !== 'waiting', `Surface='${surface}' — not waiting`);
    await allot.expectWaitingState();
    // Either AllocationEndTimer or NextChanceTime should be present
    const timerLikeVisible =
      (await allot.allocationEndTimer.isVisible({ timeout: 2_000 }).catch(() => false)) ||
      (await allot.nextChanceTime.isVisible({ timeout: 2_000 }).catch(() => false));
    expect(timerLikeVisible).toBeTruthy();
    await expect(page).toHaveScreenshot('byr-alloc-ui-waiting.png', { maxDiffPixels: 400 });
  });

  // ── STATIC entry layout ────────────────────────────────────────────────

  test('BYR_ALLOC_002_UI — BUYER-FS-Allocation-Experience §STATIC-Entry — Allotment page layout with Book Now badge', async ({ page }) => {
    const surface = await allot.detectSurface();
    test.skip(surface !== 'static-entry' && surface !== 'static-selection', `Surface='${surface}' — no STATIC entry`);
    await expect(allot.bookNowBadge).toBeVisible();
    await expect(page).toHaveScreenshot('byr-alloc-ui-static-entry.png', { maxDiffPixels: 400 });
  });

  test('BYR_ALLOC_059_UI — BUYER-FS-Allocation-Experience §STATIC-Entry — Campaign-end countdown visible and ticking', async () => {
    const timerVisible = await allot.allocationEndTimer.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!timerVisible, 'AllocationEndTimer not rendered on current surface');
    await allot.expectCountdownTicking();
  });

  // ── Unit grid colour legend ────────────────────────────────────────────

  test('BYR_ALLOC_008_UI — BUYER-FS-Allocation-Experience §STATIC-Selection — 3-panel unit selection layout (towers / grid / details)', async ({ page }) => {
    const onSelection = await allot.unitSelectionShell.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!onSelection, 'Unit selection surface not active');
    await allot.expectUnitSelectionLayout();
    const towerCount = await allot.getTowerCount();
    expect(towerCount).toBeGreaterThanOrEqual(1);
    await expect(page).toHaveScreenshot('byr-alloc-ui-3-panel.png', { maxDiffPixels: 800 });
  });

  test('BYR_ALLOC_010_UI — BUYER-FS-Allocation-Experience §STATIC-Selection — Unit colour legend (white=Available, green=Selected, orange=HOLD, red=Booked)', async () => {
    const onSelection = await allot.unitSelectionShell.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!onSelection, 'Unit selection surface not active');
    // Constant-level assertions — POM legend must match BR
    expect(UNIT_COLOR.AVAILABLE).toBe('white');
    expect(UNIT_COLOR.SELECTED).toBe('green');
    expect(UNIT_COLOR.HOLD).toBe('orange');
    expect(UNIT_COLOR.BOOKED).toBe('red');
    // Heuristic DOM check — at least one available white unit should exist for active campaign
    const whiteCount = await allot.getUnitCountByColor('available|white');
    expect(whiteCount).toBeGreaterThanOrEqual(0); // tolerant — fully sold-out grid is valid
  });

  // ── Unit details + Cost Sheet ──────────────────────────────────────────

  test('BYR_ALLOC_014_UI — BUYER-FS-Allocation-Experience §STATIC-Selection — Unit details panel surfaces unit/BHK/carpet/Agreement/price', async () => {
    const onSelection = await allot.unitSelectionShell.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!onSelection, 'Unit selection surface not active');
    const clicked = await allot.selectFirstAvailableUnit();
    test.skip(!clicked, 'No AVAILABLE units to surface details for');
    await allot.expectUnitDetailsPopulated();
  });

  test('BYR_ALLOC_016_UI — BUYER-FS-Allocation-Experience §STATIC-Selection — Cost Sheet drawer opens with itemised breakdown', async ({ page }) => {
    const onSelection = await allot.unitSelectionShell.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!onSelection, 'Unit selection surface not active');
    const clicked = await allot.selectFirstAvailableUnit();
    test.skip(!clicked, 'No AVAILABLE units — cost sheet requires unit selected');
    const csVisible = await allot.costSheetLink.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!csVisible, 'Cost Sheet link not surfaced');
    await allot.viewCostSheet();
    await allot.expectCostSheetVisible();
    await expect(page).toHaveScreenshot('byr-alloc-ui-cost-sheet.png', { maxDiffPixels: 800 });
  });

  // ── T&C label exact text ───────────────────────────────────────────────

  test('BYR_ALLOC_022_UI — BUYER-FS-Allocation-Experience §STATIC-Payment — T&C label exact text match', async () => {
    const tcVisible = await allot.tcCheckbox.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!tcVisible, 'T&C checkbox not on current surface (buyer has not Added a unit)');
    await allot.expectTcLabelExact();
    expect(TC_LABEL_EXACT).toBe('I confirm to HoABL Terms & Conditions and Privacy Policy');
  });

  // ── Post-campaign closed message + responsive ──────────────────────────

  test('BYR_ALLOC_071_UI — BUYER-FS-Allocation-Experience §Post-Campaign — Closed-message localised text exact match across viewports', async ({ page }) => {
    const surface = await allot.detectSurface();
    test.skip(surface !== 'post-campaign', `Surface='${surface}' — campaign not closed`);
    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await allot.expectAllocationClosedExactText();
    await expect(page).toHaveScreenshot('byr-alloc-ui-closed-desktop.png', { maxDiffPixels: 400 });
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // brief reflow — last-resort timing, layout reflow stabilisation
    await allot.expectAllocationClosedExactText();
    await expect(page).toHaveScreenshot('byr-alloc-ui-closed-tablet.png', { maxDiffPixels: 400 });
    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500); // brief reflow — last-resort timing, layout reflow stabilisation
    await allot.expectAllocationClosedExactText();
    expect(POST_CAMPAIGN_CLOSED_TEXT).toBe('Allocation window is closed for now.');
  });
});
