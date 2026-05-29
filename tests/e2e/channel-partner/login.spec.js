'use strict';

/**
 * E2E — Channel Partner Portal · Login Module
 * BRD/FRD: CP-FS-Login.md · CP-BRD-CP-Portal.md
 * Source TCs: manual-qa-repository/01-test-cases/cp-portal/login/TC_LOGIN.md
 *
 * Auth note: these tests start from a clean browser context (no storageState)
 * because the login flow itself is under test.
 */

const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../automation-repository/pages/channel-partner/LoginPage');

const MOBILE       = '8888888888';
const OTP          = '147258';
const LOGIN_URL    = 'https://uat-web.xrportal.in/login';
const SUCCESS_PATTERN = /\/(dashboard|leads|home)/;

test.describe('Login — Channel Partner Portal E2E', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    // Force a clean context for login flow under test.
    await page.context().clearCookies();
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  // ── Functional — Happy Path ────────────────────────────────────────────────

  test('CP_LGN_006 — CP-FS-Login §3 — Send OTP with valid mobile lazy-creates user and surfaces OTP screen', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.expectOnOtpScreen();
    await expect(page).toHaveScreenshot('cp-lgn-006-otp-screen.png', { maxDiffPixels: 150 });
  });

  test('CP_LGN_013 — CP-FS-Login §5 — valid mobile + valid OTP issues JWT and redirects', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    await expect(page).toHaveURL(SUCCESS_PATTERN);
    await expect(page).toHaveScreenshot('cp-lgn-013-post-login.png', { maxDiffPixels: 200 });
  });

  test('CP_LGN_014 — CP-FS-Login §5 — Dashboard renders after successful login', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    await expect(page).toHaveURL(/\/(dashboard|leads|home)/);
  });

  test('CP_LGN_023 — CP-FS-Login §6 — JWT session persists across page refresh', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    const urlBefore = page.url();
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(SUCCESS_PATTERN);
    // After refresh we should not be on the login screen
    expect(page.url()).not.toMatch(/\/login$/);
    // Sanity: URL family preserved
    expect(urlBefore).toMatch(SUCCESS_PATTERN);
  });

  // ── Validation — Mobile field ──────────────────────────────────────────────

  test('CP_LGN_008 — CP-FS-Login §3 — Send OTP with mobile <10 digits does not transition to OTP', async ({ page }) => {
    await loginPage.enterMobile('12345');
    await loginPage.click(loginPage.sendOTPButton).catch(() => {});
    await expect(loginPage.otpBox1).not.toBeVisible();
    await expect(loginPage.enterMobileNumberInput).toBeVisible();
  });

  test('CP_LGN_009 — CP-FS-Login §3 — Send OTP with empty mobile does not transition', async ({ page }) => {
    await loginPage.click(loginPage.sendOTPButton).catch(() => {});
    await expect(loginPage.otpBox1).not.toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('CP_LGN_011 — CP-FS-Login §3 — mobile input rejects non-numeric characters', async ({ page }) => {
    await loginPage.enterMobileNumberInput.fill('');
    await loginPage.enterMobileNumberInput.type('abcd!@#$56');
    const value = await loginPage.enterMobileNumberInput.inputValue();
    expect(value).toMatch(/^\d*$/);
  });

  // ── Negative — OTP verification ────────────────────────────────────────────

  test('CP_LGN_015 — CP-FS-Login §5 — invalid OTP shows error and stays on OTP screen', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.enterOtp('000000');
    await loginPage.clickVerify();
    await loginPage.expectOtpError();
    await expect(page).not.toHaveURL(SUCCESS_PATTERN);
    await expect(page).toHaveScreenshot('cp-lgn-015-invalid-otp.png', { maxDiffPixels: 200 });
  });

  test('CP_LGN_016 — CP-FS-Login §5 — OTP shorter than 6 digits cannot complete verification', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.otpBox1.fill('1');
    await loginPage.otpBox2.fill('4');
    await loginPage.otpBox3.fill('7');
    await loginPage.otpBox4.fill('2');
    await loginPage.click(loginPage.verifyOtpButton).catch(() => {});
    await expect(page).not.toHaveURL(SUCCESS_PATTERN);
  });

  // ── Profile completion routing ─────────────────────────────────────────────

  test('CP_LGN_021 — CP-FS-Login §5b — incomplete profile redirects to RegisterCp screen', async ({ page }) => {
    test.skip(process.env.ENV !== 'uat-incomplete-profile',
      'Requires CP fixture with isCpRegistrationCompleted=false — gated to dedicated env');
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectProfileCompletionRedirect();
  });

  test('CP_LGN_043 — CP-FS-Login §5b — direct /dashboard access by incomplete-profile CP redirects to RegisterCp', async ({ page }) => {
    test.skip(process.env.ENV !== 'uat-incomplete-profile',
      'Requires CP fixture with isCpRegistrationCompleted=false — gated to dedicated env');
    await loginPage.loginWithOtp(MOBILE, OTP);
    await page.goto('https://uat-web.xrportal.in/dashboard');
    await loginPage.expectProfileCompletionRedirect();
  });

  // ── Session / Access control ───────────────────────────────────────────────

  test('CP_LGN_024 — CP-FS-Login §6 — direct /dashboard access while logged-out redirects to /login', async ({ page }) => {
    await page.goto('https://uat-web.xrportal.in/dashboard');
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await loginPage.expectOnMobileScreen();
  });

  // ── Edge case — soft-deleted CP / lazy create ──────────────────────────────

  test('CP_LGN_010 — CP-FS-Login §3 — Send OTP with unregistered mobile lazy-creates user (no error)', async ({ page }) => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — live SMS gateway dispatches real OTP to provided number');
    await loginPage.enterMobile('9000000000');
    await loginPage.clickSendOtp();
    // Should reach OTP screen, NOT show "not registered" error.
    await loginPage.expectOnOtpScreen();
    await expect(loginPage.errorAlert).not.toBeVisible();
  });

  // ── E2E — Full login → navigate flow ───────────────────────────────────────

  test('CP_LGN_E2E_001 — CP-FS-Login §5 — full login flow from mobile entry through dashboard landing', async ({ page }) => {
    // Step 1 — Mobile screen
    await loginPage.expectOnMobileScreen();
    await expect(page).toHaveScreenshot('cp-lgn-e2e-001-mobile-screen.png', { maxDiffPixels: 200 });

    // Step 2 — Send OTP
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.expectOnOtpScreen();
    await expect(page).toHaveScreenshot('cp-lgn-e2e-001-otp-screen.png', { maxDiffPixels: 200 });

    // Step 3 — Verify OTP
    await loginPage.enterOtp(OTP);
    await loginPage.clickVerify();
    await loginPage.expectLoginSuccess();
    await expect(page).toHaveScreenshot('cp-lgn-e2e-001-dashboard.png', { maxDiffPixels: 250 });
  });
});
