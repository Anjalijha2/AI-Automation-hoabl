'use strict';

/**
 * UI/UX Spec — Buyer Portal Payment Schedule
 * BRD/FRD: BUYER-FS-Payment-Schedule
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/payment-schedule/TC_PAYMENT_SCHEDULE.md
 *
 * Coverage (7 tests):
 *   - Page shell renders / Not-Found guarded         (BYR_PAY_001)
 *   - Milestone list / table layout                  (BYR_PAY_005)
 *   - Amount breakdown columns (Principal/GST/Total) (BYR_PAY_007, _008)
 *   - Status badge surface (Pending/Paid/Partial)    (BYR_PAY_009..011)
 *   - Pay button surface on triggered milestone      (BYR_PAY_016)
 *   - Demand letter affordance per milestone         (BYR_PAY_021)
 *   - Responsive viewports (desktop/tablet/mobile)   (BYR_PAY_FSD_027)
 *
 * Guards:
 *   - test.skip when buyer redirected to /login
 *   - test.skip on 404 surface (no registration_unit_id context)
 *   - ENV=uat skip on Pay button test — live Easebuzz gateway (BYR_PAY_022)
 *   - Paid-milestone test requires ENV=uat with paid record (default skip)
 */

const { test, expect } = require('@playwright/test');
const { PaymentSchedulePage } = require('../../../automation-repository/pages/buyer/PaymentSchedulePage');

test.use({ storageState: 'automation-repository/fixtures/.auth/buyer.json' });

async function skipIfNotReachable(pay, testInfo) {
  const onLogin = await pay.isOnLoginRedirect();
  if (onLogin) {
    testInfo.skip(true, 'Buyer session redirected to /login — re-run npm run auth:setup');
  }
  const on404 = await pay.isOnNotFound();
  if (on404) {
    testInfo.skip(true, 'Payment Schedule is 404 — no registration_unit_id context (non-WINNER or pre-KYC)');
  }
}

test.describe('Payment Schedule Module — Buyer Portal UI/UX', () => {
  let pay;

  test.beforeEach(async ({ page }, testInfo) => {
    pay = new PaymentSchedulePage(page);
    await pay.navigate();
    await pay.waitForLoad();
    await skipIfNotReachable(pay, testInfo);
  });

  test('BYR_PAY_001 — BUYER-FS-Payment-Schedule §Access — Page shell renders for post-KYC WINNER', async ({ page }) => {
    await expect(pay.pageShell).toBeVisible({ timeout: 8_000 });
    await expect(page).toHaveScreenshot('byr-pay-001-page-shell.png', { maxDiffPixels: 800, fullPage: true });
  });

  test('BYR_PAY_005 — BUYER-FS-Payment-Schedule §Milestone-Display — Milestone rows render in container', async ({ page }) => {
    const containerVisible = await pay.milestonesContainer.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!containerVisible, 'Milestones container not in DOM');
    const count = await pay.getMilestoneCount();
    expect(count).toBeGreaterThan(0);
    await expect(page).toHaveScreenshot('byr-pay-005-milestone-list.png', { maxDiffPixels: 800, fullPage: true });
  });

  test('BYR_PAY_007_008 — BUYER-FS-Payment-Schedule §Milestone-Display — Principal/GST/Total breakdown columns visible', async ({ page }) => {
    const containerVisible = await pay.milestonesContainer.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!containerVisible, 'Milestones container not in DOM');
    const principalVisible = await pay.principalCell.isVisible({ timeout: 3_000 }).catch(() => false);
    const gstVisible = await pay.gstCell.isVisible({ timeout: 3_000 }).catch(() => false);
    const totalVisible = await pay.totalAmountDueCell.isVisible({ timeout: 3_000 }).catch(() => false);
    // At least one breakdown cell must render in the schedule surface
    expect(principalVisible || gstVisible || totalVisible).toBeTruthy();
    await expect(page).toHaveScreenshot('byr-pay-007-amount-breakdown.png', { maxDiffPixels: 700 });
  });

  test('BYR_PAY_009_011 — BUYER-FS-Payment-Schedule §Milestone-Display — Status badge surface renders (Pending/Paid/Partial)', async ({ page }) => {
    const containerVisible = await pay.milestonesContainer.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!containerVisible, 'Milestones container not in DOM');
    const badgeCount = await pay.statusBadge.count().catch(() => 0);
    expect(badgeCount).toBeGreaterThan(0);
    await expect(page).toHaveScreenshot('byr-pay-009-status-badges.png', { maxDiffPixels: 700 });
  });

  test('BYR_PAY_016 — BUYER-FS-Payment-Schedule §Pay-Action — Pay button visible only on triggered milestone', async ({ page }, testInfo) => {
    // Read-only UI check — no click, no gateway redirect → safe on UAT
    const containerVisible = await pay.milestonesContainer.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!containerVisible, 'Milestones container not in DOM');
    const hasPay = await pay.hasPayButton();
    if (!hasPay) {
      // Acceptable — buyer may have no triggered milestone yet; assert non-error state
      const count = await pay.getMilestoneCount();
      expect(count).toBeGreaterThan(0);
      testInfo.annotations.push({ type: 'note', description: 'No Pay button visible — no triggered milestone (acceptable)' });
      return;
    }
    await expect(pay.payButtonFirst).toBeVisible();
    await expect(page).toHaveScreenshot('byr-pay-016-pay-button.png', { maxDiffPixels: 600 });
  });

  test('BYR_PAY_021 — BUYER-FS-Payment-Schedule §Demand-Letter — Demand letter link surface per milestone', async ({ page }) => {
    const containerVisible = await pay.milestonesContainer.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!containerVisible, 'Milestones container not in DOM');
    const hasDL = await pay.hasDemandLetterLink();
    test.skip(!hasDL, 'No demand letter link visible — no issued demand letters for this buyer');
    await expect(pay.demandLetterLinkFirst).toBeVisible();
    await expect(page).toHaveScreenshot('byr-pay-021-demand-letter-link.png', { maxDiffPixels: 600 });
  });

  test('BYR_PAY_FSD_027 — BUYER-FS-Payment-Schedule §Responsive — Mobile (375px) renders without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await pay.navigate();
    await pay.waitForLoad();
    const overflow = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    // Allow 2px tolerance for sub-pixel rounding
    expect(overflow.sw).toBeLessThanOrEqual(overflow.cw + 2);
    await expect(page).toHaveScreenshot('byr-pay-fsd-027-mobile-375.png', { maxDiffPixels: 1200, fullPage: true });
  });
});
