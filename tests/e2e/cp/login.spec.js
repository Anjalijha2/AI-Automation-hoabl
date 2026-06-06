'use strict';

// tests/e2e/cp/login.spec.js
// CP Portal — Login E2E specs (scaffolded stubs — implement in Step 4)
const { test, expect } = require('../../../automation-repository/fixtures/base-test');
const { LoginPage } = require('../../../automation-repository/pages/cp/LoginPage');

// NOTE: Login spec intentionally does NOT use storageState — it exercises
// the unauthenticated entry path. Authenticated/session TCs use the CP
// storage state below.

test.describe('Login — Channel Partner Portal', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC_CP_LOGIN_UI_001 — CP-BRD §3 / CP-FS-Login §1.4 — initial login page renders correctly on desktop (1920×900)', async ({ page }) => {
    // stub — implement in Step 4
    const loginPage = new LoginPage(page);
    await expect(loginPage.pageHeading).toBeVisible();
    await expect(loginPage.mobileInput).toBeVisible();
    await expect(loginPage.sendOtpBtn).toBeVisible();
  });

  test('TC_CP_LOGIN_VAL_004 — CP-FS-Login §1.5 rule 1 — Send OTP blocked when mobile number is empty', async ({ page }) => {
    // stub — implement in Step 4
    const loginPage = new LoginPage(page);
    await loginPage.clickSendOtp();
    await expect(loginPage.pageHeading).toBeVisible();
  });

  test('TC_CP_LOGIN_FUNC_009 — CP-FS-Login §1.4, §1.6 (step 1), §1.7 — Send OTP with valid registered mobile transitions to OTP entry screen', async ({ page }) => {
    // stub — implement in Step 4
    const loginPage = new LoginPage(page);
    await loginPage.enterMobile('8888888888');
    await loginPage.clickSendOtp();
    await expect(loginPage.otpHeading).toBeVisible({ timeout: 10_000 });
  });

  test('TC_CP_LOGIN_NEG_015 — CP-FS-Login §1.4 / §1.5 rule 3 — Invalid OTP triggers 401 + toast', async ({ page }) => {
    // stub — implement in Step 4
    const loginPage = new LoginPage(page);
    await loginPage.enterMobile('8888888888');
    await loginPage.clickSendOtp();
    await loginPage.otpInputs.first().waitFor({ state: 'visible', timeout: 10_000 });
    await loginPage.enterOtp('000000');
    await loginPage.clickSubmitOtp();
    // assert no /dashboard redirect occurs
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('TC_CP_LOGIN_E2E_018 — CP-FS-Login §1.5 rule 5, §1.6 (steps 2-3) / CP-BRD §5 step 1 — Valid OTP login → redirect to /dashboard', async ({ page }) => {
    // stub — implement in Step 4
    const loginPage = new LoginPage(page);
    await loginPage.loginWithOtp('8888888888', '147258');
    await loginPage.expectLoginSuccess();
  });
});
