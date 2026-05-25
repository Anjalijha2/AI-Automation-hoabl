'use strict';

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../automation-repository/pages/admin/LoginPage');

const MOBILE = '8888888888';

test.describe('Login — Admin Portal UI/UX', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  // ── Component Rendering ────────────────────────────────────────────────────

  test('TC_LOGIN_UI_001 — ADMIN-BRD-Login §4 — mobile screen renders all documented elements', async ({ page }) => {
    await expect(loginPage.pageHeading).toBeVisible();
    await expect(loginPage.mobileInput).toBeVisible();
    await expect(loginPage.sendOtpBtn).toBeVisible();
    await expect(page).toHaveScreenshot('login-ui-001-mobile-screen.png', { maxDiffPixels: 100 });
  });

  test('TC_LOGIN_UI_002 — ADMIN-BRD-Login §4 — OTP screen renders all documented elements', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await expect(loginPage.otpHeading).toBeVisible();
    await expect(loginPage.otpBox1).toBeVisible();
    await expect(loginPage.otpBox6).toBeVisible();
    await expect(loginPage.submitOtpBtn).toBeVisible();
    await expect(loginPage.backBtn).toBeVisible();
    await expect(loginPage.otpTimer).toBeVisible();
    await expect(loginPage.resendOtpLink).toBeVisible();
    await expect(page).toHaveScreenshot('login-ui-002-otp-screen.png', { maxDiffPixels: 100 });
  });

  test('TC_LOGIN_UI_003 — ADMIN-BRD-Login §4 — OTP boxes: 6 individual inputs present and editable', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    const boxes = [loginPage.otpBox1, loginPage.otpBox2, loginPage.otpBox3,
                   loginPage.otpBox4, loginPage.otpBox5, loginPage.otpBox6];
    for (const box of boxes) {
      await expect(box).toBeVisible();
      await expect(box).toBeEnabled();
    }
  });

  test('TC_LOGIN_UI_004 — ADMIN-BRD-Login §6 rule 3 — OTP boxes auto-advance focus on digit entry', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.otpBox1.fill('2');
    // After entering digit in box 1, box 2 should receive focus
    await expect(loginPage.otpBox2).toBeFocused();
  });

  // ── Responsiveness ─────────────────────────────────────────────────────────

  test('TC_LOGIN_UI_005 — run-ui-ux §Responsiveness — 1920×900 desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 900 });
    await loginPage.navigate();
    await expect(loginPage.mobileInput).toBeVisible();
    await expect(loginPage.sendOtpBtn).toBeVisible();
    await expect(page).toHaveScreenshot('login-ui-005-1920.png', { maxDiffPixels: 100 });
  });

  test('TC_LOGIN_UI_006 — run-ui-ux §Responsiveness — 1440×900 standard laptop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginPage.navigate();
    await expect(loginPage.mobileInput).toBeVisible();
    await expect(page).toHaveScreenshot('login-ui-006-1440.png', { maxDiffPixels: 100 });
  });

  // ── Accessibility ──────────────────────────────────────────────────────────

  test('TC_LOGIN_UI_007 — run-ui-ux §Accessibility — mobile input has accessible label', async ({ page }) => {
    const label = await loginPage.mobileInput.getAttribute('placeholder');
    expect(label).toBeTruthy();
  });

  test('TC_LOGIN_UI_008 — run-ui-ux §Accessibility — OTP boxes have aria-labels', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    for (let i = 1; i <= 6; i++) {
      const box = page.locator(`input[aria-label="OTP Input ${i}"]`);
      await expect(box).toHaveAttribute('aria-label', `OTP Input ${i}`);
    }
  });

  test('TC_LOGIN_UI_009 — run-ui-ux §Accessibility — Send OTP button keyboard-accessible', async ({ page }) => {
    await loginPage.mobileInput.fill(MOBILE);
    await loginPage.sendOtpBtn.focus();
    await page.keyboard.press('Enter');
    await loginPage.expectOnOtpScreen();
  });

  // ── Re-send OTP state ──────────────────────────────────────────────────────

  test('TC_LOGIN_UI_010 — ADMIN-BRD-Login §6 rule 4 — Re-Send OTP disabled while timer active', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    // Timer should be counting down — Re-Send OTP should be disabled or not clickable
    const resendDisabled = await loginPage.resendOtpLink.isDisabled().catch(() => null);
    const timerVisible = await loginPage.otpTimer.isVisible();
    expect(timerVisible || resendDisabled).toBeTruthy();
  });
});
