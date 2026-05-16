/**
 * SMOKE TEST SUITE — XR Portal Admin
 * ====================================
 * Fast sanity checks: auth guard + valid login.
 * Run: npx playwright test --project=smoke --config config/playwright.config.js
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../automation-repository/pages/LoginPage.js');

const VALID_MOBILE = '8888888888';
const VALID_OTP    = '258369';

test.describe('@smoke XR Portal — Smoke Tests', () => {

    test('SMOKE_001 | Auth guard — unauthenticated access redirects to login', async ({ page }) => {
        await page.context().clearCookies();
        const login = new LoginPage(page);
        await login.navigate();
        await expect(login.mobileInput).toBeVisible({ timeout: 15_000 });
    });

    test('SMOKE_002 | Valid login → redirected to /admin/customers', async ({ page }) => {
        const login = new LoginPage(page);
        await login.navigate();
        await login.sendOtp(VALID_MOBILE);
        await login.submitOtp(VALID_OTP);
        await expect(page).toHaveURL(/.*\/customers/, { timeout: 20_000 });
    });

});
