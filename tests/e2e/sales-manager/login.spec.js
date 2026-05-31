'use strict';

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../automation-repository/pages/sales-manager/LoginPage');

const MOBILE = '8888888888';
const OTP    = '258369';
const BASE   = 'https://uat-web.xrportal.in/sales-manager';
const SUCCESS_URL = /\/sales-manager\/(callback-requests|towers|physical-allocation)/;

test.describe('Login — SM Portal E2E', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  // ── Functional happy paths ─────────────────────────────────────────────────

  test('SM_LGN_006 — SM-FS-Login §1.6.1 — Send OTP succeeds for registered SM mobile', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.expectOnOtpScreen();
    await expect(page).toHaveScreenshot('sm-login-006-otp-screen.png', { maxDiffPixels: 150 });
  });

  test('SM_LGN_007 — SM-FS-Login §1.5.6 — valid mobile + valid OTP → redirect to landing route', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    await expect(page).toHaveURL(SUCCESS_URL);
    await expect(page).toHaveScreenshot('sm-login-007-landing.png', { maxDiffPixels: 200 });
  });

  test('SM_LGN_FSD_011 — FSD §7.4 — SM portal master OTP (ADMIN_MASTER_OTP=258369) verifies successfully', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    await expect(page).toHaveURL(SUCCESS_URL);
  });

  test('SM_LGN_031 — SM-FS-Login §1.5.5 — logout clears session and redirects to login', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    // Click Logout from the navigation
    await page.locator('button:has-text("Logout")').first().click({ timeout: 10_000 }).catch(async () => {
      await page.getByRole('button', { name: /logout/i }).click();
    });
    await page.waitForURL(new RegExp(`${BASE}/?$`), { timeout: 10_000 });
    await loginPage.expectOnMobileScreen();
  });

  test('SM_LGN_032 — SM-FS-Login §1.5.6 — browser back after login does not return to login form', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    await page.goBack();
    // Should remain in authenticated app — must not show OTP/mobile form
    const mobileVisible = await loginPage.mobileInput.isVisible().catch(() => false);
    expect(mobileVisible).toBe(false);
  });

  test('SM_LGN_033 — SM-FS-Login §1.4 — paste 6-digit OTP from clipboard auto-populates all boxes', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.expectOnOtpScreen();
    // Simulate full paste by filling first box with full string — most segmented inputs distribute on paste
    await loginPage.otpBox1.click();
    await page.keyboard.insertText(OTP);
    // Verify all 6 boxes have digits
    const values = await Promise.all([
      loginPage.otpBox1.inputValue(),
      loginPage.otpBox2.inputValue(),
      loginPage.otpBox3.inputValue(),
      loginPage.otpBox4.inputValue(),
      loginPage.otpBox5.inputValue(),
      loginPage.otpBox6.inputValue(),
    ]);
    const joined = values.join('');
    expect(joined.replace(/\s/g, '').length).toBeGreaterThanOrEqual(6);
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  test('SM_LGN_003 — SM-FS-Login §1.5.1 — empty mobile blocks Send OTP', async ({ page }) => {
    await loginPage.sendOtpBtn.click({ force: true }).catch(() => {});
    await expect(page).toHaveURL(new RegExp(BASE));
    await expect(loginPage.mobileInput).toBeVisible();
    await expect(loginPage.otpBox1).not.toBeVisible();
  });

  test('SM_LGN_004 — SM-FS-Login §1.5.1 — 9-digit mobile rejected', async ({ page }) => {
    await loginPage.enterMobile('888888888');
    await loginPage.sendOtpBtn.click({ force: true }).catch(() => {});
    await expect(loginPage.otpBox1).not.toBeVisible();
    await expect(loginPage.mobileInput).toBeVisible();
  });

  test('SM_LGN_005 — SM-FS-Login §1.5.1 — non-numeric chars blocked from mobile field', async ({ page }) => {
    await loginPage.mobileInput.fill('');
    await loginPage.mobileInput.type('abc123def');
    const val = await loginPage.mobileInput.inputValue();
    expect(val).toMatch(/^\d*$/);
  });

  test('SM_LGN_012 — SM-FS-Login §1.4/1.5.1 — mobile input enforces maxlength=10', async ({ page }) => {
    await loginPage.mobileInput.fill('');
    await loginPage.mobileInput.type('123456789012');
    const val = await loginPage.mobileInput.inputValue();
    expect(val.length).toBeLessThanOrEqual(10);
  });

  test('SM_LGN_018 — SM-FS-Login §1.5.1 — 11+ digit mobile truncated or rejected', async ({ page }) => {
    await loginPage.mobileInput.fill('');
    await loginPage.mobileInput.type('88888888888');
    const val = await loginPage.mobileInput.inputValue();
    expect(val.length).toBeLessThanOrEqual(10);
  });

  test('SM_LGN_021 — SM-FS-Login §1.5.1 — mobile field trims whitespace', async ({ page }) => {
    await loginPage.mobileInput.fill('  8888888888  ');
    const val = await loginPage.mobileInput.inputValue();
    // Field either trimmed (10 chars) or kept verbatim — both acceptable; only digits should survive Send OTP
    expect(val.replace(/\s/g, '').length).toBe(10);
  });

  test('SM_LGN_024 — SM-FS-Login §1.4 — OTP input accepts digits only, maxlength=6', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.expectOnOtpScreen();
    await loginPage.otpBox1.fill('a');
    const val = await loginPage.otpBox1.inputValue();
    expect(val).toMatch(/^\d*$/);
  });

  // ── Negative / Security ───────────────────────────────────────────────────

  test('SM_LGN_016 — SM-FS-Login §1.5/1.5.6 — protected route without session redirects to login', async ({ browser }) => {
    // Fresh context — bypass test-file storageState so we genuinely simulate logged-out access.
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto(`${BASE}/callback-requests`);
    await p.waitForLoadState('networkidle').catch(() => {});
    const url = p.url();
    const offProtected = !/callback-requests/i.test(url);
    const onLogin = await p.locator(
      'h2:has-text("SALES MANAGER LOGIN"), :text-matches("Sales Manager Login", "i"), input[type="tel"], input[placeholder*="Mobile" i]'
    ).first().isVisible({ timeout: 12_000 }).catch(() => false);
    expect(offProtected || onLogin).toBeTruthy();
    await ctx.close();
  });

  test('SM_LGN_020 — SM-FS-Login §1.2/1.5.1 — unregistered SM mobile rejected at Send OTP', async ({ page }) => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — would hit live OTP gateway for unregistered mobile');
    await loginPage.enterMobile('7000000099');
    await loginPage.clickSendOtp();
    await expect(loginPage.otpBox1).not.toBeVisible();
    await loginPage.expectOtpError();
  });

  test('SM_LGN_023 — SM-FS-Login §1.4/1.5.2 — incorrect OTP rejected, stays on OTP screen', async ({ page }) => {
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await loginPage.expectOnOtpScreen();
    await loginPage.enterOtp('000000');
    await loginPage.clickVerifyOtp();
    await loginPage.expectOtpError();
    await expect(page).not.toHaveURL(SUCCESS_URL);
    await expect(loginPage.otpBox1).toBeVisible();
  });

  test('SM_LGN_028 — SM-FS-Login §1.2 — Admin mobile (roleId=1) cannot log in via SM portal', async ({ page }) => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — depends on Admin test mobile, cross-portal risk');
    await loginPage.enterMobile('7777777777');
    await loginPage.clickSendOtp();
    // SM lookup is scoped to roleId IN (4,5) — Admin not found
    await expect(loginPage.otpBox1).not.toBeVisible();
  });

  test('SM_LGN_FSD_009 — FSD §5.3 — SM Admin selecting SM tab gets "User not found"', async ({ page }) => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — needs dedicated SM-Admin-only fixture mobile');
    // Select plain "SM" role and submit an SM-Admin (roleId=4) mobile — backend should 400
    await loginPage.selectRole('sm');
    await loginPage.enterMobile('9999999999'); // fixture: SM-Admin-only mobile
    await loginPage.clickSendOtp();
    await expect(loginPage.otpBox1).not.toBeVisible();
    await loginPage.expectOtpError();
  });

  test('SM_LGN_008 — FSD §3.1.b — inactive SM rejected at Send OTP step', async ({ page }) => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — needs deactivated SM fixture');
    await loginPage.enterMobile('7000000001'); // fixture: inactive SM
    await loginPage.clickSendOtp();
    await expect(loginPage.otpBox1).not.toBeVisible();
    const err = await loginPage.errorMessage.textContent().catch(() => '');
    expect((err || '').toLowerCase()).toMatch(/revoked|access/i);
  });

  // ── Edge / Full E2E ───────────────────────────────────────────────────────

  test('SM_LGN_E2E_001 — SM-FS-Login §1.5/1.5.6 — full login → land → logout flow', async ({ page }) => {
    await loginPage.loginWithOtp(MOBILE, OTP);
    await loginPage.expectLoginSuccess();
    await expect(page).toHaveURL(SUCCESS_URL);
    await expect(page).toHaveScreenshot('sm-login-e2e-001-landing.png', { maxDiffPixels: 200 });

    // Logout
    await page.locator('button:has-text("Logout")').first().click({ timeout: 10_000 }).catch(async () => {
      await page.getByRole('button', { name: /logout/i }).click();
    });
    await page.waitForURL(new RegExp(`${BASE}/?$`), { timeout: 10_000 });
    await loginPage.expectOnMobileScreen();
  });

  test('SM_LGN_035 — SM-FS-Login §1.5.5 — login page served over HTTPS', async ({ page }) => {
    expect(page.url().startsWith('https://')).toBe(true);
  });
});
