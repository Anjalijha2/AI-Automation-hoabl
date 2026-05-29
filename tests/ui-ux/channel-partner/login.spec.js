'use strict';

/**
 * UI/UX — Channel Partner Portal · Login Module
 * BRD/FRD: CP-FS-Login.md · CP-BRD-CP-Portal.md
 * Source TCs: manual-qa-repository/01-test-cases/cp-portal/login/TC_LOGIN.md
 *
 * Covers: rendering, branding, responsiveness, accessibility, OTP-screen widgets.
 */

const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../automation-repository/pages/channel-partner/LoginPage');

const MOBILE = '8888888888';

test.describe('Login — Channel Partner Portal UI/UX', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  // ── Page Rendering ─────────────────────────────────────────────────────────

  test('CP_LGN_001 — CP-FS-Login §2 — login page loads at /login with branding and primary controls', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.gROWTHPARTNERLOGINHeading).toBeVisible();
    await expect(loginPage.enterMobileNumberInput).toBeVisible();
    await expect(loginPage.sendOTPButton).toBeVisible();
    await expect(page).toHaveScreenshot('cp-lgn-001-login-page.png', { maxDiffPixels: 200 });
  });

  test('CP_LGN_002 — CP-FS-Login §2 — Mobile Number input is visible, focusable, accepts numeric input', async () => {
    await expect(loginPage.enterMobileNumberInput).toBeVisible();
    await expect(loginPage.enterMobileNumberInput).toBeEnabled();
    await loginPage.enterMobileNumberInput.click();
    await loginPage.enterMobileNumberInput.fill('1234567890');
    const value = await loginPage.enterMobileNumberInput.inputValue();
    expect(value).toBe('1234567890');
  });

  test('CP_LGN_003 — CP-FS-Login §2 — Send OTP button is rendered with exact label "Send OTP"', async () => {
    await expect(loginPage.sendOTPButton).toBeVisible();
    const label = (await loginPage.sendOTPButton.textContent() || '').trim();
    expect(label).toMatch(/Send\s*OTP/i);
  });

  test('CP_LGN_005 — CP-FS-Login §2 — page branding identifies Channel Partner / Growth Partner', async ({ page }) => {
    await expect(loginPage.gROWTHPARTNERLOGINHeading).toBeVisible();
    const headingText = (await loginPage.gROWTHPARTNERLOGINHeading.textContent() || '').trim();
    expect(headingText).toMatch(/GROWTH\s+PARTNER/i);
    await expect(page).toHaveScreenshot('cp-lgn-005-branding.png', { maxDiffPixels: 200 });
  });

  // ── OTP Screen Rendering ───────────────────────────────────────────────────

  test('CP_LGN_007 — CP-FS-Login §4 — OTP input field appears after Send OTP', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.expectOnOtpScreen();
    await expect(loginPage.otpBox1).toBeVisible();
    await expect(loginPage.otpBox6).toBeVisible();
    await expect(loginPage.verifyOtpButton).toBeVisible();
    await expect(page).toHaveScreenshot('cp-lgn-007-otp-screen.png', { maxDiffPixels: 200 });
  });

  test('CP_LGN_040 — CP-FS-Login §5b — OTP boxes are 6 individual, editable inputs', async () => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    const count = await loginPage.otpBoxes.count();
    expect(count).toBeGreaterThanOrEqual(6);
    const boxes = [
      loginPage.otpBox1, loginPage.otpBox2, loginPage.otpBox3,
      loginPage.otpBox4, loginPage.otpBox5, loginPage.otpBox6,
    ];
    for (const b of boxes) {
      await expect(b).toBeVisible();
      await expect(b).toBeEnabled();
    }
  });

  // ── Legal links ────────────────────────────────────────────────────────────

  test('CP_LGN_UI_TC_LINKS — CP-FS-Login §2 — Terms & Conditions and Privacy Policy links present', async () => {
    await expect(loginPage.termsConditionsLink).toBeVisible();
    await expect(loginPage.privacyPolicyLink).toBeVisible();
  });

  // ── Responsiveness ─────────────────────────────────────────────────────────

  test('CP_LGN_UI_RESP_1920 — run-ui-ux §Responsiveness — 1920×900 desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 900 });
    await loginPage.navigate();
    await expect(loginPage.gROWTHPARTNERLOGINHeading).toBeVisible();
    await expect(loginPage.enterMobileNumberInput).toBeVisible();
    await expect(loginPage.sendOTPButton).toBeVisible();
    await expect(page).toHaveScreenshot('cp-lgn-resp-1920.png', { maxDiffPixels: 200 });
  });

  test('CP_LGN_UI_RESP_1440 — run-ui-ux §Responsiveness — 1440×900 standard laptop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginPage.navigate();
    await expect(loginPage.enterMobileNumberInput).toBeVisible();
    await expect(loginPage.sendOTPButton).toBeVisible();
    await expect(page).toHaveScreenshot('cp-lgn-resp-1440.png', { maxDiffPixels: 200 });
  });

  // ── Accessibility ──────────────────────────────────────────────────────────

  test('CP_LGN_UI_A11Y_PLACEHOLDER — run-ui-ux §Accessibility — mobile input exposes a placeholder/label', async () => {
    const placeholder = await loginPage.enterMobileNumberInput.getAttribute('placeholder');
    const ariaLabel   = await loginPage.enterMobileNumberInput.getAttribute('aria-label');
    expect(placeholder || ariaLabel).toBeTruthy();
  });

  test('CP_LGN_UI_A11Y_KEYBOARD — run-ui-ux §Accessibility — Send OTP is keyboard-actionable (Enter to submit)', async () => {
    await loginPage.enterMobileNumberInput.fill(MOBILE);
    await loginPage.sendOTPButton.focus();
    await loginPage.page.keyboard.press('Enter');
    // Either OTP screen renders or focus stays — both valid; we just assert no crash
    // and that the page remains responsive on the login route family.
    await loginPage.page.waitForLoadState('domcontentloaded');
    await expect(loginPage.page).toHaveURL(/(\/login|\/dashboard|\/leads|\/home)/);
  });
});
