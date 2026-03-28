/**
 * GLOBAL AUTHENTICATION SETUP
 * =================================================================
 * Runs ONCE before the rest of the test suite starts.
 * Logs into the XR Portal using the mobile API and caches the session
 * into `src/test/fixtures/.auth/admin.json`.
 *
 * This allows all subsequent module tests (Customers, Config, etc.)
 * to jump straight to their respective pages without repeating the
 * login UI flow.
 */

const { test: setup, expect } = require('@playwright/test');
const { LoginPage } = require('../src/pages/LoginPage.js');
const path = require('path');

// Where the session will be saved:
const authFile = path.join(__dirname, '../src/fixtures/.auth/admin.json');

const VALID_MOBILE = '8888888888';
const VALID_OTP = '258369';

setup('authenticate as admin', async ({ page }) => {
    const login = new LoginPage(page);

    console.log('🔐 [Auth Setup] Starting global authentication...');

    // 1. Navigate to the login page
    await login.navigate();

    // 2. Perform UI login
    await login.login(VALID_MOBILE, VALID_OTP);

    // 3. Verify we are fully landed on the customers page
    await expect(page.locator('text=Customers').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.url()).toContain('/customers');

    // 4. Save the context state (cookies, localStorage, sessionStorage)
    await page.context().storageState({ path: authFile });

    console.log('✅ [Auth Setup] Session saved successfully to .auth/admin.json');
});
