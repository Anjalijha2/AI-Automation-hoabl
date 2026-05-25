// automation-repository/fixtures/auth.setup.js
// Logs in to each portal (Admin / Sales Manager / Channel Partner / Buyer) via mobile OTP
// and saves the session storageState to fixtures/.auth/<portal>.json.
//
// Run:  npm run auth:setup
//   or: npx playwright test --config automation-repository/playwright.config.js --project=auth-setup
//
// UAT static creds (from constants/testData.js): mobile 8888888888 / OTP 258369.
//
// Each portal uses the same OTP flow but a different landing URL and success URL pattern.
// The Admin portal continues to use the existing LoginPage POM. The other portals use a
// generic OTP helper that operates on the same DOM contract (mobile input → Send OTP → 6 OTP boxes → Verify).

const { test: setup } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

const { LoginPage } = require('../pages/admin/LoginPage');
const { VALID_MOBILE, VALID_OTP } = require('../constants/testData');

const AUTH_DIR = path.join(__dirname, '.auth');
fs.mkdirSync(AUTH_DIR, { recursive: true });
const AUTH = (portal) => path.join(AUTH_DIR, `${portal}.json`);

// ── Admin ────────────────────────────────────────────────────────────────────
setup('authenticate as admin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginWithOtp(VALID_MOBILE, VALID_OTP);
  await loginPage.expectLoginSuccess();
  await page.context().storageState({ path: AUTH('admin') });
});

// ── Generic OTP flow used by Buyer / CP / SM ────────────────────────────────
async function genericOtpLogin(page, { url, mobile, otp, successUrlPattern }) {
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');

  // Mobile input — try several common patterns
  const mobileInput = page.locator(
    'input[type="tel"], input[placeholder*="Mobile" i], input[name*="mobile" i], input[id*="mobile" i]'
  ).first();
  await mobileInput.waitFor({ state: 'visible', timeout: 15_000 });
  await mobileInput.fill(mobile);

  const sendOtpBtn = page.getByRole('button', { name: /send otp/i }).first();
  await sendOtpBtn.click();

  // 6 OTP boxes — wait for them to render, then fill each digit
  const firstBox = page.locator('input[autocomplete="one-time-code"], input[type="text"][maxlength="1"], input[aria-label*="otp" i]').first();
  await firstBox.waitFor({ state: 'visible', timeout: 15_000 });

  const boxes = page.locator('input[autocomplete="one-time-code"], input[type="text"][maxlength="1"], input[aria-label*="otp" i]');
  const digits = otp.toString().split('');
  for (let i = 0; i < digits.length; i++) {
    await boxes.nth(i).fill(digits[i]);
  }

  const submitBtn = page.getByRole('button', { name: /verify|login|submit/i }).first();
  await submitBtn.click();

  await page.waitForURL(successUrlPattern, { timeout: 20_000 });
}

// ── Sales Manager Admin ───────────────────────────────────────────────────────
setup('authenticate as sales manager', async ({ page }) => {
  await page.goto('https://uat-web.xrportal.in/sales-manager');
  await page.waitForLoadState('domcontentloaded');

  // Select "Sales Manager Admin" tab
  const adminTab = page.getByRole('button', { name: /sales manager admin/i })
    .or(page.locator('text=Sales Manager Admin')).first();
  await adminTab.waitFor({ state: 'visible', timeout: 15_000 });
  await adminTab.click();

  const mobileInput = page.locator(
    'input[type="tel"], input[placeholder*="Mobile" i], input[name*="mobile" i], input[id*="mobile" i]'
  ).first();
  await mobileInput.waitFor({ state: 'visible', timeout: 10_000 });
  await mobileInput.fill('8888888888');

  await page.getByRole('button', { name: /send otp/i }).first().click();

  const firstBox = page.locator('input[autocomplete="one-time-code"], input[type="text"][maxlength="1"], input[aria-label*="otp" i]').first();
  await firstBox.waitFor({ state: 'visible', timeout: 15_000 });
  const boxes = page.locator('input[autocomplete="one-time-code"], input[type="text"][maxlength="1"], input[aria-label*="otp" i]');
  for (const [i, d] of '258369'.split('').entries()) await boxes.nth(i).fill(d);

  await page.getByRole('button', { name: /verify|login|submit/i }).first().click();
  await page.waitForURL(/\/sales-manager\/.+/, { timeout: 20_000 });
  await page.context().storageState({ path: AUTH('sales-manager') });
});

// ── Channel Partner ──────────────────────────────────────────────────────────
setup('authenticate as channel partner', async ({ page }) => {
  await genericOtpLogin(page, {
    url:               'https://uat-web.xrportal.in/',
    mobile:            '8888888888',
    otp:               '147258',
    successUrlPattern: /\/(dashboard|leads|home)/,
  });
  await page.context().storageState({ path: AUTH('channel-partner') });
});

// ── Buyer ────────────────────────────────────────────────────────────────────
setup('authenticate as buyer', async ({ page }) => {
  await genericOtpLogin(page, {
    url:               'https://uat.xrportal.in/',
    mobile:            '8888888888',
    otp:               '147258',
    successUrlPattern: /(dashboard|projects|home|profile)/,
  });
  await page.context().storageState({ path: AUTH('buyer') });
});
