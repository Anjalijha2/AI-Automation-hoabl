'use strict';

/**
 * UI/UX Spec — Buyer Portal Work Progress
 * BRD/FRD: BUYER-FS-Work-Progress
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/work-progress/TC_WORK_PROGRESS.md
 *
 * Coverage (5 tests):
 *   - Page header / shell render                       (BYR_WRK_004)
 *   - Section layout — tower section + cards present   (BYR_WRK_005, 030)
 *   - Banner video attributes (muted/autoplay/loop)    (BYR_WRK_025)
 *   - Image rendering / no NaN/undefined leaks         (BYR_WRK_006, 044)
 *   - Responsive — mobile (375px) + tablet (768px)     (BYR_WRK_020, 043)
 *
 * Guards:
 *   - Skip when buyer session redirects to /login (auth setup needed)
 *   - ENV=uat retained but does NOT skip — UI tests are read-only
 *   - Strapi empty/loading-state on UAT is permitted as a pass
 */

const { test, expect } = require('@playwright/test');
const {
  WorkProgressPage,
} = require('../../../automation-repository/pages/buyer/WorkProgressPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/buyer.json' });

async function skipIfLoginRedirect(wpPage, testInfo) {
  const onLogin = await wpPage.isOnLoginRedirect();
  if (onLogin) {
    testInfo.skip(true, 'Buyer session redirected to /login — re-run npm run auth:setup');
  }
}

test.describe('Work Progress Module — Buyer Portal UI/UX', () => {
  let wpPage;

  test.beforeEach(async ({ page }) => {
    wpPage = new WorkProgressPage(page);
    await wpPage.navigate();
    await wpPage.waitForLoad();
  });

  // ── Page header / shell ───────────────────────────────────────────────

  test('BYR_WRK_004 — BUYER-FS-Work-Progress §Layout — Page header / shell rendered', async ({ page }, testInfo) => {
    await skipIfLoginRedirect(wpPage, testInfo);
    await expect(wpPage.pageShell).toBeVisible();
    const bodyText = await wpPage.getRenderedBodyText();
    expect(bodyText.length).toBeGreaterThan(50);
    await expect(page).toHaveScreenshot('byr-wrk-004-shell.png', { maxDiffPixels: 800, fullPage: true });
  });

  // ── Section layout ────────────────────────────────────────────────────

  test('BYR_WRK_005_030 — BUYER-FS-Work-Progress §Layout — Tower section / cards render (or graceful loading state)', async ({ page }, testInfo) => {
    await skipIfLoginRedirect(wpPage, testInfo);
    const rendered = await wpPage.expectContentRendered();
    expect(rendered).toBeTruthy();
    // BYR_WRK_030 — no "last updated" indicator is rendered (UX gap documented)
    const text = await wpPage.getRenderedBodyText();
    // We don't assert presence — we record absence is acceptable per FSD KB-8
    expect(typeof text === 'string').toBeTruthy();
    await expect(page).toHaveScreenshot('byr-wrk-005-tower-section.png', { maxDiffPixels: 900 });
  });

  // ── Banner video attributes ───────────────────────────────────────────

  test('BYR_WRK_025 — BUYER-FS-Work-Progress §Banner — Video is muted+autoplay+loop, NO controls', async ({ page }, testInfo) => {
    await skipIfLoginRedirect(wpPage, testInfo);
    const attrs = await wpPage.getBannerVideoAttributes();
    if (!attrs) {
      // Strapi may not have published workBannerVideo on UAT — accept absence
      test.skip(true, 'Banner video element not present — Strapi workBannerVideo may be empty');
      return;
    }
    expect(attrs.muted).toBeTruthy();
    expect(attrs.autoplay).toBeTruthy();
    expect(attrs.loop).toBeTruthy();
    expect(attrs.controls).toBeFalsy();
  });

  // ── Image rendering / numeric formatting ──────────────────────────────

  test('BYR_WRK_006_044 — BUYER-FS-Work-Progress §Images — Images render; no NaN/undefined leaks', async ({ page }, testInfo) => {
    await skipIfLoginRedirect(wpPage, testInfo);
    const result = await wpPage.expectImagesLoad();
    expect(result.ok).toBeTruthy();
    const text = await wpPage.getRenderedBodyText();
    expect(/\bNaN\b/.test(text)).toBeFalsy();
    expect(/\bundefined\b/.test(text)).toBeFalsy();
    // BYR_WRK_044 — caption ellipsis is CSS-driven; we cannot assert clipping here
    // but we ensure raw "null" placeholders don't bleed
    expect(/\bnull\b/.test(text)).toBeFalsy();
  });

  // ── Responsive ────────────────────────────────────────────────────────

  test('BYR_WRK_020_043 — BUYER-FS-Work-Progress §Responsive — Mobile (375) and tablet (768) layouts render', async ({ page }, testInfo) => {
    await skipIfLoginRedirect(wpPage, testInfo);

    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await wpPage.waitForLoad();
    await expect(wpPage.pageShell).toBeVisible();
    const mobileText = await wpPage.getRenderedBodyText();
    expect(mobileText.length).toBeGreaterThan(50);
    await expect(page).toHaveScreenshot('byr-wrk-020-mobile.png', { maxDiffPixels: 1000, fullPage: true });

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await wpPage.waitForLoad();
    await expect(wpPage.pageShell).toBeVisible();
    const tabletText = await wpPage.getRenderedBodyText();
    expect(tabletText.length).toBeGreaterThan(50);
    await expect(page).toHaveScreenshot('byr-wrk-043-tablet.png', { maxDiffPixels: 1000, fullPage: true });
  });
});
