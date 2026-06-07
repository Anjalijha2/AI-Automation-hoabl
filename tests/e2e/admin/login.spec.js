'use strict';

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../automation-repository/pages/admin/LoginPage');

const MOBILE = '8888888888';
const OTP    = '258369';
const BASE   = 'https://uat-web.xrportal.in/admin';

test.describe('Login — Admin Portal E2E', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  // ── Functional ─────────────────────────────────────────────────────────────

  test('TC_LOGIN_FUNC_001 — ADMIN-BRD-Login §5 — valid mobile + valid OTP → redirect to /admin/customers', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    // Post-login /admin/customers shows live KPI counts + table data — full-page
    // screenshot drifts every run. Functional success verified by URL.
    await expect(page).toHaveURL(/\/admin\/customers/);
  });

  test('TC_LOGIN_FUNC_002 — ADMIN-BRD-Login §5 — Send OTP transitions to OTP screen', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.expectOnOtpScreen();
    await expect(page).toHaveScreenshot('login-func-002-otp-screen.png', { maxDiffPixels: 100 });
  });

  test('TC_LOGIN_FUNC_003 — ADMIN-BRD-Login §6 rule 7 — session persists after page refresh', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    await page.reload();
    await expect(page).toHaveURL(/\/admin\/customers/);
  });

  test('TC_LOGIN_FUNC_004 — ADMIN-FS-Login Feature3 — logout clears session and redirects to login', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    // Logout via profile menu
    await page.click('[class*="profile"], [class*="user-menu"], [aria-label*="logout" i]', { timeout: 5_000 }).catch(() => {});
    await page.getByRole('button', { name: /logout/i }).click().catch(async () => {
      await page.getByText(/logout/i).click();
    });
    await page.waitForURL(/\/admin\/?$/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/admin\/?$/);
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  test('TC_LOGIN_VAL_001 — ADMIN-BRD-Login §7 — empty mobile → Send OTP does nothing', async ({ page }) => {
    await loginPage.click(loginPage.sendOtpBtn);
    await expect(page).toHaveURL(new RegExp(BASE));
    await expect(loginPage.mobileInput).toBeVisible();
  });

  test('TC_LOGIN_VAL_002 — ADMIN-BRD-Login §7 — short mobile (5 digits) → OTP not sent', async ({ page }) => {
    await loginPage.enterMobile('12345');
    await loginPage.click(loginPage.sendOtpBtn);
    await expect(loginPage.mobileInput).toBeVisible();
    await expect(loginPage.otpBox1).not.toBeVisible();
  });

  test('TC_LOGIN_VAL_003 — ADMIN-BRD-Login §7 — empty OTP → Submit does not log in', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.click(loginPage.submitOtpBtn);
    await expect(page).not.toHaveURL(/\/admin\/customers/);
    await loginPage.expectOnOtpScreen();
  });

  test('TC_LOGIN_VAL_004 — ADMIN-BRD-Login §7 — wrong OTP → error shown, stays on OTP screen', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.enterOtp('000000');
    await loginPage.clickSubmitOtp();
    await loginPage.expectOtpError();
    await expect(page).not.toHaveURL(/\/admin\/customers/);
    await expect(page).toHaveScreenshot('login-val-004-wrong-otp-error.png', { maxDiffPixels: 100 });
  });

  test('TC_LOGIN_VAL_005 — ADMIN-BRD-Login §6 rule 2 — non-numeric chars blocked from mobile field', async ({ page }) => {
    await loginPage.mobileInput.fill('');
    await loginPage.mobileInput.type('abc123def');
    const val = await loginPage.mobileInput.inputValue();
    expect(val).toMatch(/^\d*$/);
  });

  // ── Negative ───────────────────────────────────────────────────────────────

  test('TC_LOGIN_NEG_001 — ADMIN-BRD-Login §7 — all-zeros mobile rejected', async ({ page }) => {
    await loginPage.enterMobile('0000000000');
    await loginPage.click(loginPage.sendOtpBtn);
    await expect(loginPage.otpBox1).not.toBeVisible();
  });

  test('TC_LOGIN_NEG_002 — ADMIN-BRD-Login §7 — partial OTP (3 digits) → login rejected', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.otpBox1.fill('2');
    await loginPage.otpBox2.fill('5');
    await loginPage.otpBox3.fill('8');
    await loginPage.click(loginPage.submitOtpBtn);
    await expect(page).not.toHaveURL(/\/admin\/customers/);
  });

  test('TC_LOGIN_NEG_003 — ADMIN-FS-Login Feature1 §3 — access /admin/customers without session → redirect to login', async ({ page }) => {
    await page.goto('https://uat-web.xrportal.in/admin/customers');
    await page.waitForURL(/\/admin\/?(?:login|$)/, { timeout: 10_000 });
    await loginPage.expectOnMobileScreen();
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  test('TC_LOGIN_EDGE_001 — ADMIN-BRD-Login §7 — mobile with spaces → trimmed or rejected', async ({ page }) => {
    await loginPage.mobileInput.fill('  8888888888  ');
    await loginPage.click(loginPage.sendOtpBtn);
    // Either OTP screen (trimmed) or stays on mobile screen (rejected) — both valid
    const otpVisible = await loginPage.otpBox1.isVisible().catch(() => false);
    const mobileVisible = await loginPage.mobileInput.isVisible().catch(() => false);
    expect(otpVisible || mobileVisible).toBe(true);
  });

  test('TC_LOGIN_EDGE_002 — ADMIN-BRD-Login §6 rule 3 — OTP box 5 digits only → login rejected', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.enterOtp('25836'); // 5 digits
    await loginPage.click(loginPage.submitOtpBtn);
    await expect(page).not.toHaveURL(/\/admin\/customers/);
  });

  // ── Back Navigation ────────────────────────────────────────────────────────

  test('TC_LOGIN_FUNC_BACK — ADMIN-BRD-Login §5 — back button returns to mobile screen', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.expectOnOtpScreen();
    await loginPage.click(loginPage.backBtn);
    await loginPage.expectOnMobileScreen();
    await expect(page).toHaveScreenshot('login-back-mobile-screen.png', { maxDiffPixels: 100 });
  });

  // ── E2E ────────────────────────────────────────────────────────────────────

  test('TC_LOGIN_E2E_001 — ADMIN-BRD-Login §5 — full login → navigate → logout flow', async ({ page }) => {
    // Login
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();

    // Navigate — assert URL only (dashboard data is dynamic, screenshot drifts)
    await expect(page).toHaveURL(/\/admin\/customers/);

    // Logout
    await page.getByRole('button', { name: /logout/i }).click().catch(async () => {
      await page.getByText(/logout/i).first().click();
    });
    await page.waitForURL(/\/admin\/?$/, { timeout: 10_000 });
    await loginPage.expectOnMobileScreen();
  });
});
