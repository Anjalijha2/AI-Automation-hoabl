// automation-repository/fixtures/auth.setup.js
// One-time login → saves storageState to .auth/admin.json
// Run: npm run auth:setup

const { test: setup, expect } = require('@playwright/test');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '.auth/admin.json');

const { VALID_MOBILE, VALID_OTP } = require('../constants/testData');

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/');

  // Step 1 — enter mobile
  await page.locator('input[placeholder*="Mobile"], input[type="tel"]').fill(VALID_MOBILE);
  await page.getByRole('button', { name: /send otp/i }).click();

  // Step 2 — enter OTP (static UAT value)
  await page.locator('input[placeholder*="OTP"], input[placeholder*="otp"]').fill(VALID_OTP);
  await page.getByRole('button', { name: /login|verify/i }).click();

  // Wait for successful redirect
  await page.waitForURL(/customers|dashboard/, { timeout: 15_000 });
  await expect(page).toHaveURL(/customers|dashboard/);

  // Save full session state
  await page.context().storageState({ path: AUTH_FILE });
});
