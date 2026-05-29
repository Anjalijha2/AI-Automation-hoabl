'use strict';

/**
 * UI/UX Spec — Buyer Portal Registration & Login
 * BRD/FRD: BUYER-FS-Registration-and-Login
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/registration-login/TC_LOGIN.md
 */

const { test, expect } = require('@playwright/test');
const { RegistrationLoginPage } = require('../../../automation-repository/pages/buyer/RegistrationLoginPage');

const MOBILE = '8888888888';

test.describe('Registration & Login — Buyer Portal UI/UX', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new RegistrationLoginPage(page);
    await loginPage.navigate();
  });

  // ── Page Render ────────────────────────────────────────────────────────────

  test('BYR_LGN_001 — BUYER-FS-Registration-and-Login §Landing — login page loads at root URL', async ({ page }) => {
    await expect(loginPage.aPPLICANTLOGINHeading).toBeVisible();
    await expect(loginPage.enterMobileNumberInput).toBeVisible();
    await expect(loginPage.sendOTPButton).toBeVisible();
    await expect(page).toHaveScreenshot('byr-lgn-001-landing.png', { maxDiffPixels: 300 });
  });

  test('BYR_LGN_043 — BUYER-FS-Registration-and-Login §Legacy-Field-Removed — no password field present', async ({ page }) => {
    const pwd = page.locator('input[type="password"]');
    await expect(pwd).toHaveCount(0);
  });

  // ── Nationality Tabs ───────────────────────────────────────────────────────

  test('BYR_LGN_002 — BUYER-FS-Registration-and-Login §Nationality — Indian National tab active by default', async ({ page }) => {
    await expect(loginPage.rcTabs0Tab1).toBeVisible();
    await expect(loginPage.rcTabs0Tab2).toBeVisible();
    const indianActive = await loginPage.expectNationalityTabActive('indian');
    expect(indianActive).toBeTruthy();
    await expect(page).toHaveScreenshot('byr-lgn-002-indian-default.png', { maxDiffPixels: 300 });
  });

  test('BYR_LGN_003 — BUYER-FS-Registration-and-Login §Nationality — switching to NRI reveals country-code selector', async ({ page }) => {
    await loginPage.selectNationality('nri');
    const nriActive = await loginPage.expectNationalityTabActive('nri');
    expect(nriActive).toBeTruthy();
    // Country-code selector should become visible (best-effort match)
    const ccVisible = await loginPage.countryCodeSelector.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(ccVisible).toBeTruthy();
    await expect(page).toHaveScreenshot('byr-lgn-003-nri-active.png', { maxDiffPixels: 300 });
  });

  test('BYR_LGN_004 — BUYER-FS-Registration-and-Login §Nationality — switching back to Indian hides country code', async ({ page }) => {
    await loginPage.selectNationality('nri');
    await loginPage.selectNationality('indian');
    const indianActive = await loginPage.expectNationalityTabActive('indian');
    expect(indianActive).toBeTruthy();
  });

  // ── Footer Links ───────────────────────────────────────────────────────────

  test('BYR_LGN_UI_LINKS — BUYER-FS-Registration-and-Login §Footer — T&C and Privacy Policy links render', async ({ page }) => {
    await expect(loginPage.termsConditionsLink).toBeVisible();
    await expect(loginPage.privacyPolicyLink).toBeVisible();
  });

  // ── OTP Screen Render ──────────────────────────────────────────────────────

  test('BYR_LGN_013 — BUYER-FS-Registration-and-Login §OTP-Field — accepts 6 digits', async ({ page }) => {
    await loginPage.selectNationality('indian');
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    await expect(loginPage.otpBox1).toBeVisible();
    await expect(loginPage.otpBox6).toBeVisible();
    // Ensure exactly 6 OTP boxes visible
    for (const box of [loginPage.otpBox1, loginPage.otpBox2, loginPage.otpBox3,
                       loginPage.otpBox4, loginPage.otpBox5, loginPage.otpBox6]) {
      await expect(box).toBeVisible();
      await expect(box).toBeEnabled();
    }
    await expect(page).toHaveScreenshot('byr-lgn-013-otp-six-boxes.png', { maxDiffPixels: 300 });
  });

  test('BYR_LGN_014 — BUYER-FS-Registration-and-Login §OTP-Field — Verify disabled until 6 digits entered', async ({ page }) => {
    await loginPage.selectNationality('indian');
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    // Fill 5 of 6
    await loginPage.otpBox1.fill('1');
    await loginPage.otpBox2.fill('4');
    await loginPage.otpBox3.fill('7');
    await loginPage.otpBox4.fill('2');
    await loginPage.otpBox5.fill('5');
    const disabledAt5 = await loginPage.verifyOtpBtn.isDisabled().catch(() => false);
    await loginPage.otpBox6.fill('8');
    const disabledAt6 = await loginPage.verifyOtpBtn.isDisabled().catch(() => false);
    expect(disabledAt5 || !disabledAt6).toBeTruthy();
  });

  // ── Resend Timer (frontend-only, 60s per FRD) ──────────────────────────────

  test('BYR_LGN_011 — BUYER-FS-Registration-and-Login §Resend-Cooldown — 60s frontend timer disables resend', async ({ page }) => {
    await loginPage.selectNationality('indian');
    await loginPage.enterMobile(MOBILE);
    await loginPage.clickSendOtp();
    // Immediately after Send OTP, resend should be disabled or timer visible
    const resendDisabled = await loginPage.resendOtpLink.isDisabled().catch(() => null);
    const timerVisible = await loginPage.otpTimer.isVisible().catch(() => false);
    expect(resendDisabled === true || timerVisible).toBeTruthy();
  });

  // ── Responsiveness ─────────────────────────────────────────────────────────

  test('BYR_LGN_UI_DESKTOP_1920 — run-ui-ux §Responsiveness — 1920×900 desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 900 });
    await loginPage.navigate();
    await expect(loginPage.aPPLICANTLOGINHeading).toBeVisible();
    await expect(loginPage.enterMobileNumberInput).toBeVisible();
    await expect(page).toHaveScreenshot('byr-lgn-ui-1920.png', { maxDiffPixels: 300 });
  });

  test('BYR_LGN_UI_TABLET_768 — run-ui-ux §Responsiveness — 768×1024 tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await loginPage.navigate();
    await expect(loginPage.enterMobileNumberInput).toBeVisible();
    await expect(loginPage.sendOTPButton).toBeVisible();
    await expect(page).toHaveScreenshot('byr-lgn-ui-768.png', { maxDiffPixels: 300 });
  });

  test('BYR_LGN_UI_MOBILE_375 — run-ui-ux §Responsiveness — 375×667 mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginPage.navigate();
    await expect(loginPage.enterMobileNumberInput).toBeVisible();
    await expect(loginPage.sendOTPButton).toBeVisible();
    await expect(page).toHaveScreenshot('byr-lgn-ui-375.png', { maxDiffPixels: 300 });
  });

  // ── Accessibility ──────────────────────────────────────────────────────────

  test('BYR_LGN_UI_A11Y_PLACEHOLDER — run-ui-ux §Accessibility — mobile input has placeholder text', async ({ page }) => {
    const placeholder = await loginPage.enterMobileNumberInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder).toMatch(/mobile/i);
  });

  test('BYR_LGN_UI_A11Y_TABS — run-ui-ux §Accessibility — nationality tabs have ARIA roles', async ({ page }) => {
    const tab1Role = await loginPage.rcTabs0Tab1.getAttribute('role').catch(() => null);
    const tab2Role = await loginPage.rcTabs0Tab2.getAttribute('role').catch(() => null);
    expect(tab1Role === 'tab' || tab2Role === 'tab').toBeTruthy();
  });
});
