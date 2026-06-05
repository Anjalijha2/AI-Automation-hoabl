// scripts/capture-sm-login-success.js
//
// The OTP 258369 appears to be consumed/rate-limited after multiple test attempts.
// Instead, capture login-success-dashboard by using the stored authenticated session
// (which is the END-STATE of successful login). The session was fresh from this morning's
// auth:setup run.
//
// This is the standard pattern: storageState IS the post-login state.

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT  = path.join(ROOT, 'visual-memory', 'sm', 'login', 'login-success-dashboard.png');
const VIEWPORT = { width: 1920, height: 900 };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH });
  const page = await ctx.newPage();
  try {
    // Navigate to the SM root — should redirect to /sales-manager/callback-requests (the default landing)
    await page.goto('https://uat-web.xrportal.in/sales-manager', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const url = page.url();
    if (/\/login/i.test(url)) {
      console.log('AUTH_FAILED — storageState did not authenticate. URL:', url);
      process.exit(2);
    }
    await page.screenshot({ path: OUT, fullPage: false });
    const stat = fs.statSync(OUT);
    console.log('CAPTURED', OUT, stat.size, 'bytes — final URL:', url);
  } finally {
    await ctx.close();
    await browser.close();
  }
})();
