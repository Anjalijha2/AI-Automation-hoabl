// scripts/capture-sm-login-v3.js
//
// CORRECTED: SM login URL is /sales-manager (NOT /sales-manager/login).
// /login (Growth Partner Login) is the CP/Admin login — completely separate.
// Previous v1/v2 captured the WRONG login page.
//
// Source: source-code/admin-sm-cp-portal/src/App.jsx line 29:
//   <Route path="/sales-manager" element={<SalesManagerLoginPage />} />
//
// SM login form (Public/sales-manager/login.jsx):
//   - Heading: "Sales Manager Login" / "ENTER OTP"
//   - Mobile input: name="phone", type="tel", maxLength=10, placeholder="Enter Mobile Number", prefix "+91"
//   - Radio role: sales_manager_admin | sales_manager (default: sales_manager_admin)
//   - Send OTP button (submit)
//   - OTP inputs: aria-label "OTP Input 1-6"
//   - Re-Send OTP: 60s timer
//   - Submit OTP button
//   - On success: navigate('callback-requests')

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT_DIR = path.join(ROOT, 'visual-memory', 'sm', 'login');
const VIEWPORT = { width: 1920, height: 900 };
const SM_LOGIN_URL = 'https://uat-web.xrportal.in/sales-manager';

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note }, extra || {});
  console.log(`[${status.padEnd(14)}] ${key} — ${note}`);
}

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }
async function shot(page, outFile) {
  await page.screenshot({ path: outFile, fullPage: false });
  return { path: outFile, bytes: fs.statSync(outFile).size };
}
async function shotFull(page, outFile) {
  await page.screenshot({ path: outFile, fullPage: true });
  return { path: outFile, bytes: fs.statSync(outFile).size };
}

async function fillOtp(page, code) {
  const inputs = page.locator('input[aria-label*="OTP Input" i]');
  if ((await inputs.count()) < 6) return false;
  for (let i = 0; i < 6; i++) {
    await inputs.nth(i).click({ force: true });
    await page.keyboard.press('Control+A').catch(() => {});
    await page.keyboard.press('Delete').catch(() => {});
  }
  for (let i = 0; i < 6; i++) {
    await inputs.nth(i).focus();
    await inputs.nth(i).fill(code[i]);
    await page.waitForTimeout(100);
  }
  return true;
}

async function gotoLogin(page) {
  await page.goto(SM_LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await settle(page, 1500);
  // Confirm we are on SM login (not Growth Partner / CP login)
  const h2 = await page.locator('h2').first().innerText().catch(() => '');
  if (!/Sales Manager Login/i.test(h2)) {
    console.warn(`  WARN: heading is "${h2}" — expected "Sales Manager Login"`);
  }
}

async function sendOtp(page, mobile = '8888888888') {
  await page.locator('input[name="phone"]').fill(mobile);
  await settle(page, 400);
  await page.locator('button.ant-btn-submit, button:has-text("Send OTP")').first().click();
  await page.waitForSelector('input[aria-label="OTP Input 1"]', { timeout: 15_000 });
  await settle(page, 1200);
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No SM auth file:', AUTH); process.exit(1); }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // ===== 1+2: initial + OTP entry (one context) =====
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    const page = await ctx.newPage();
    try {
      await gotoLogin(page);

      // Capture initial DOM
      const initDom = await page.evaluate(() => {
        const h2 = document.querySelector('h2')?.innerText || '';
        const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
          name: i.name || '', type: i.type || '', placeholder: i.placeholder || '', maxLength: i.maxLength,
        }));
        const radios = Array.from(document.querySelectorAll('input[type="radio"], .ant-radio-input')).map(r => ({
          value: r.value, name: r.name, labelText: (r.closest('label')?.innerText || '').trim().slice(0, 80),
        }));
        const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
          text: (b.innerText || '').trim(), cls: (b.className || '').toString().slice(0, 100),
        })).filter(b => b.text);
        return { h2, inputs, radios, buttons, title: document.title, url: location.href };
      }).catch(() => ({}));
      fs.writeFileSync(path.join(OUT_DIR, '_login-initial-dom.json'), JSON.stringify(initDom, null, 2));

      const r1 = await shot(page, path.join(OUT_DIR, 'login-initial.png'));
      rec('login/login-initial', 'CAPTURED', `Heading: "${initDom.h2}"; URL: ${initDom.url}`, { file: r1.path, bytes: r1.bytes });

      await sendOtp(page);
      const otpDom = await page.evaluate(() => {
        const h2 = document.querySelector('h2')?.innerText || '';
        const desc = (document.querySelector('h2 + p, .actual-form p')?.innerText || '').trim();
        const otpInputs = Array.from(document.querySelectorAll('input[aria-label*="OTP" i]')).map(i => ({
          ariaLabel: i.getAttribute('aria-label'), type: i.type, maxLength: i.maxLength,
        }));
        const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
          text: (b.innerText || '').trim(), cls: (b.className || '').toString().slice(0, 100), disabled: b.disabled,
        })).filter(b => b.text);
        // Look for back button
        const backBtn = document.querySelector('button.reset-btn.back-to-mobile, button.back-to-mobile');
        return { h2, desc, otpInputs, buttons, hasBackButton: !!backBtn };
      }).catch(() => ({}));
      fs.writeFileSync(path.join(OUT_DIR, '_login-otp-entry-dom.json'), JSON.stringify(otpDom, null, 2));
      const r2 = await shot(page, path.join(OUT_DIR, 'login-otp-entry.png'));
      rec('login/login-otp-entry', 'CAPTURED', `Heading: "${otpDom.h2}"; 6 OTP inputs visible`, { file: r2.path, bytes: r2.bytes });
    } finally { await ctx.close(); }
  }

  // ===== 3: OTP invalid =====
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    const page = await ctx.newPage();
    try {
      await gotoLogin(page);
      await sendOtp(page);
      const ok = await fillOtp(page, '000000');
      if (!ok) { rec('login/login-otp-invalid', 'NOT_FOUND', 'Could not fill OTP inputs'); }
      else {
        await settle(page, 400);
        await page.locator('button:has-text("Submit OTP")').first().click();
        await settle(page, 3500);
        const errs = await page.evaluate(() => {
          const t = [];
          document.querySelectorAll('.Toastify__toast, .ant-message, .ant-message-error, [role="alert"], .ant-notification-notice').forEach(el => {
            const txt = (el.innerText || '').trim(); if (txt && txt.length < 300) t.push(txt);
          });
          return t;
        }).catch(() => []);
        const r = await shot(page, path.join(OUT_DIR, 'login-otp-invalid.png'));
        rec('login/login-otp-invalid', 'CAPTURED', `Errors: ${JSON.stringify(errs)}`, { file: r.path, bytes: r.bytes, errors: errs });
      }
    } finally { await ctx.close(); }
  }

  // ===== 4: Resend enabled (wait for 60s timer to expire) =====
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    const page = await ctx.newPage();
    try {
      await gotoLogin(page);
      await sendOtp(page);
      // Poll Re-Send button text — initially "Re-Send in NNs", becomes "Re-Send OTP" when enabled
      let enabled = false;
      const start = Date.now();
      while (Date.now() - start < 80_000) {
        const btn = page.locator('button.common-link').first();
        if (await btn.count() > 0) {
          const disabled = await btn.isDisabled().catch(() => true);
          const text = (await btn.innerText().catch(() => '')) || '';
          if (!disabled && !/in\s*\d/i.test(text)) { enabled = true; break; }
        }
        await page.waitForTimeout(3000);
      }
      const r = await shot(page, path.join(OUT_DIR, 'login-otp-resend-enabled.png'));
      rec('login/login-otp-resend-enabled',
          enabled ? 'CAPTURED' : 'CAPTURED_TIMEOUT',
          enabled ? 'Re-Send OTP enabled' : 'Timer still active after 80s',
          { file: r.path, bytes: r.bytes });
    } finally { await ctx.close(); }
  }

  // ===== 5: Login success — try live OTP first; if it fails, fall back to storageState dashboard =====
  {
    let captured = false;
    // First attempt: live login with 258369
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    const page = await ctx.newPage();
    try {
      await gotoLogin(page);
      await sendOtp(page);
      const ok = await fillOtp(page, '258369');
      if (ok) {
        await settle(page, 500);
        await page.locator('button:has-text("Submit OTP")').first().click();
        // Wait for nav to /sales-manager/callback-requests
        const start = Date.now();
        while (Date.now() - start < 25_000) {
          const u = page.url();
          if (/\/sales-manager\/callback-requests/.test(u)) break;
          await page.waitForTimeout(700);
        }
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        await settle(page, 2500);
        const finalUrl = page.url();
        if (/\/callback-requests/.test(finalUrl)) {
          const r = await shotFull(page, path.join(OUT_DIR, 'login-success-dashboard.png'));
          rec('login/login-success-dashboard', 'CAPTURED', `Live login → ${finalUrl}`, { file: r.path, bytes: r.bytes });
          captured = true;
        } else {
          console.log('  Live OTP login did not reach callback-requests; URL:', finalUrl);
        }
      }
    } catch (e) {
      console.log('  Live OTP attempt error:', e?.message || e);
    } finally { await ctx.close(); }

    // Fallback: use stored session
    if (!captured) {
      console.log('  Fallback: using storageState to capture post-login dashboard');
      const ctx2 = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH });
      const page2 = await ctx2.newPage();
      try {
        await page2.goto('https://uat-web.xrportal.in/sales-manager/callback-requests', { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page2.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        await settle(page2, 2500);
        const url = page2.url();
        if (/\/login/i.test(url) || /^https:\/\/uat-web\.xrportal\.in\/sales-manager\/?$/.test(url)) {
          rec('login/login-success-dashboard', 'AUTH_FAILED', `storageState failed — URL ${url}`);
        } else {
          const r = await shotFull(page2, path.join(OUT_DIR, 'login-success-dashboard.png'));
          rec('login/login-success-dashboard', 'CAPTURED_VIA_SESSION', `Used storageState → ${url}`, { file: r.path, bytes: r.bytes });
        }
      } finally { await ctx2.close(); }
    }
  }

  fs.writeFileSync(path.join(__dirname, '_capture-sm-login-v3-results.json'), JSON.stringify(results, null, 2));
  await browser.close();
  console.log('\nResults: scripts/_capture-sm-login-v3-results.json');
})();
