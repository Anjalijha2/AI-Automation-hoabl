// scripts/capture-cp-login-resend-otp.js
//
// Capture 2 missing CP Portal / Login screenshots:
//   1. login-otp-resend-enabled.png — after 55s countdown expires, "Re-Send OTP" becomes active
//   2. login-incomplete-profile.png — best-effort: attempt to detect /register-cp page after auth
//
// This script does NOT use a saved storage state for capture #1 — it must hit the public login flow.
// For capture #2 it inspects the loaded CP session/store to see whether an incomplete-profile state
// is reachable; if no second test account is available, the capture is skipped with a note.

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VM_LOGIN = path.join(ROOT, 'visual-memory', 'cp', 'login');
const VIEWPORT = { width: 1920, height: 900 };
const LOGIN_URL = 'https://uat-web.xrportal.in/';
const TEST_MOBILE = '8888888888';

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note }, extra || {});
  console.log(`[${status.padEnd(14)}] ${key} — ${note}`);
}

async function settle(page, ms = 1000) { await page.waitForTimeout(ms); }

async function captureOtpResendEnabled(browser) {
  console.log('\n=== CAPTURE 1: login-otp-resend-enabled.png ===');
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await context.newPage();

  try {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 1500);

    // Fill mobile number
    const mobileInput = page.getByRole('textbox', { name: /enter mobile number/i });
    if (await mobileInput.count() === 0) {
      rec('login/login-otp-resend-enabled', 'NOT_FOUND', 'Mobile input not located on login page');
      await context.close();
      return;
    }
    await mobileInput.fill(TEST_MOBILE);
    await settle(page, 500);

    // Click Send OTP
    const sendBtn = page.getByRole('button', { name: /send otp/i });
    if (await sendBtn.count() === 0) {
      rec('login/login-otp-resend-enabled', 'NOT_FOUND', 'Send OTP button not located');
      await context.close();
      return;
    }
    await sendBtn.click();
    console.log('  Clicked Send OTP — waiting for OTP entry screen...');
    await page.waitForSelector('text=/enter\\s*otp/i', { timeout: 15_000 }).catch(() => {});
    await settle(page, 1500);

    // Confirm Re-Send OTP exists and is disabled
    const resendBtn = page.getByRole('button', { name: /re-?send\s*otp/i });
    if (await resendBtn.count() === 0) {
      rec('login/login-otp-resend-enabled', 'NOT_FOUND', 'Re-Send OTP button not found on OTP screen');
      await context.close();
      return;
    }

    const initialDisabled = await resendBtn.first().isDisabled().catch(() => null);
    console.log(`  Re-Send OTP initial disabled state: ${initialDisabled}`);

    // Read initial countdown value visible on page
    const initialCountdown = await page.evaluate(() => {
      const m = document.body.innerText.match(/(\d{1,2})\s*s\b/);
      return m ? m[1] + 's' : null;
    });
    console.log(`  Initial countdown visible: ${initialCountdown}`);

    // Poll for Re-Send OTP to become enabled — up to 75 seconds
    const POLL_MAX_MS = 75_000;
    const POLL_INTERVAL_MS = 2_000;
    const startedAt = Date.now();
    let becameEnabled = false;
    while (Date.now() - startedAt < POLL_MAX_MS) {
      const disabled = await resendBtn.first().isDisabled().catch(() => true);
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      if (!disabled) {
        becameEnabled = true;
        console.log(`  Re-Send OTP became enabled after ~${elapsed}s`);
        break;
      }
      if (elapsed % 10 === 0) {
        const cd = await page.evaluate(() => {
          const m = document.body.innerText.match(/(\d{1,2})\s*s\b/);
          return m ? m[1] + 's' : 'n/a';
        });
        console.log(`  ...still disabled at ${elapsed}s (countdown shows ${cd})`);
      }
      await page.waitForTimeout(POLL_INTERVAL_MS);
    }

    if (!becameEnabled) {
      rec('login/login-otp-resend-enabled', 'TIMEOUT', 'Re-Send OTP did not become enabled within 75s');
      // Still take a screenshot for diagnostics
      const out = path.join(VM_LOGIN, '_login-otp-resend-timeout-diagnostic.png');
      await page.screenshot({ path: out, fullPage: false });
      console.log(`  Diagnostic screenshot saved: ${out}`);
      await context.close();
      return;
    }

    // Capture
    await settle(page, 400);
    const out = path.join(VM_LOGIN, 'login-otp-resend-enabled.png');
    await page.screenshot({ path: out, fullPage: false });
    const stat = fs.statSync(out);

    // Inspect DOM around Re-Send OTP for selector capture
    const resendInfo = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button'));
      const btn = all.find(b => /re-?send\s*otp/i.test(b.innerText || ''));
      if (!btn) return null;
      return {
        text: (btn.innerText || '').trim(),
        disabled: btn.disabled,
        ariaDisabled: btn.getAttribute('aria-disabled'),
        className: (btn.className || '').toString().slice(0, 200),
        id: btn.id || '',
        type: btn.type || '',
        dataset: Object.assign({}, btn.dataset),
        outerSnippet: btn.outerHTML.slice(0, 300),
      };
    });

    rec('login/login-otp-resend-enabled', 'CAPTURED', `${stat.size} bytes`, {
      file: out,
      bytes: stat.size,
      resendEnabledDom: resendInfo,
    });
  } catch (e) {
    rec('login/login-otp-resend-enabled', 'ERROR', String(e?.message || e));
  } finally {
    await context.close();
  }
}

async function captureIncompleteProfile(browser) {
  console.log('\n=== CAPTURE 2: login-incomplete-profile.png (best-effort) ===');
  // Strategy:
  //   (a) Navigate directly to known register-cp URLs while unauthenticated to see redirect behaviour
  //   (b) Without a second test account whose profile is incomplete, we cannot fully reproduce
  //       the post-auth incomplete-profile state. Report the gap clearly.
  const candidates = [
    'https://uat-web.xrportal.in/register-cp',
    'https://uat-web.xrportal.in/register',
    'https://uat-web.xrportal.in/cp-registration',
    'https://uat-web.xrportal.in/profile-completion',
  ];

  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const probes = [];

  try {
    for (const u of candidates) {
      try {
        const resp = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 15_000 });
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        await settle(page, 800);
        probes.push({ target: u, status: resp?.status() || null, finalUrl: page.url(), hasForm: await page.locator('form, input[name*="name" i], input[name*="email" i]').count().catch(() => 0) > 0 });
      } catch (e) {
        probes.push({ target: u, error: String(e?.message || e) });
      }
    }

    // Try the most promising candidate — a /register-cp URL — and snap whatever loads
    // (it will likely redirect back to /login since we are unauthenticated, which is itself useful evidence)
    const tryUrl = candidates[0];
    await page.goto(tryUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => {});
    await settle(page, 1500);
    const finalUrl = page.url();
    const diagPath = path.join(VM_LOGIN, '_login-incomplete-profile-diagnostic.png');
    await page.screenshot({ path: diagPath, fullPage: false });
    const stat = fs.statSync(diagPath);

    rec('login/login-incomplete-profile', 'SKIPPED', 'Requires a CP test account with incomplete profile; only one shared test mobile (8888888888) is provisioned and already has completed registration. Captured diagnostic only.', {
      diagnosticFile: diagPath,
      diagnosticBytes: stat.size,
      probes,
      lastFinalUrl: finalUrl,
    });
  } catch (e) {
    rec('login/login-incomplete-profile', 'ERROR', String(e?.message || e), { probes });
  } finally {
    await context.close();
  }
}

(async () => {
  if (!fs.existsSync(VM_LOGIN)) fs.mkdirSync(VM_LOGIN, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    await captureOtpResendEnabled(browser);
    await captureIncompleteProfile(browser);
  } catch (e) {
    console.error('FATAL:', e?.message || e);
  } finally {
    fs.writeFileSync(
      path.join(__dirname, '_capture-cp-login-resend-results.json'),
      JSON.stringify(results, null, 2)
    );
    console.log('\nResults written: scripts/_capture-cp-login-resend-results.json');
    await browser.close();
  }
})();
