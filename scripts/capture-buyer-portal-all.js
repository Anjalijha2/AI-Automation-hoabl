/**
 * capture-buyer-portal-all.js
 *
 * Tech Lead Agent — buyer portal verification capture (2026-06-06).
 *
 * Re-captures `screenshot-desktop.png` for every buyer module and inspects DOM to
 * confirm structural notes in existing visual-memory INDEX.md files are still accurate.
 *
 *   Inputs:  saved session at automation-repository/fixtures/.auth/buyer.json
 *   Outputs:
 *     - visual-memory/buyer/<module>/screenshot-desktop.png    (refreshed)
 *     - scripts/_buyer-capture-results.json                    (DOM inspection per module)
 *
 * If auth is stale (post-login redirect to "/"), the script re-authenticates with
 * mobile 8888888888 / OTP 147258 and saves a fresh session before continuing.
 *
 * Modules captured (unit-details intentionally skipped — already documented):
 *   registration-login, home-dashboard, allocation-experience, callback-request,
 *   home-loan, kyc, payment-schedule, project-information, support-tickets,
 *   work-progress
 *
 * For data-gated modules (allocation-experience, kyc, payment-schedule), the
 * script documents the gate/empty state visible to the test account.
 */
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const AUTH_FILE  = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'buyer.json');
const VM_ROOT    = path.join(ROOT, 'visual-memory', 'buyer');
const RESULTS    = path.join(__dirname, '_buyer-capture-results.json');

const BASE_URL = 'https://uat.xrportal.in/';
const MOBILE   = '8888888888';
const OTP      = '147258';
const VIEWPORT = { width: 1920, height: 900 };

// Module → URL path mapping (relative to BASE_URL).
// `unauth: true` means the module is captured WITHOUT authentication.
const MODULES = [
  { key: 'registration-login',    path: '',                unauth: true },
  { key: 'home-dashboard',        path: 'home' },
  { key: 'allocation-experience', path: 'alloted' },
  { key: 'callback-request',      path: 'home',            modalTrigger: 'schedule_a_call' },
  { key: 'home-loan',             path: 'homeloan' },
  { key: 'kyc',                   path: 'kyc' },
  { key: 'payment-schedule',      path: 'paymentschedule' },
  { key: 'project-information',   path: 'project' },
  { key: 'support-tickets',       path: 'support-tickets' },
  { key: 'work-progress',         path: 'work-progress' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers
//
// IMPORTANT: Buyer portal stores the JWT in sessionStorage (key: xr_auth_token).
// Playwright `storageState` does NOT serialise sessionStorage, so the saved
// buyer.json cookie+localStorage payload is insufficient — every new context
// will be unauthenticated. We MUST do a fresh OTP login in the same browser
// context, then re-use that single context for all module captures.
// ─────────────────────────────────────────────────────────────────────────────
async function freshLogin(page, log) {
  log('Performing fresh OTP login (buyer JWT lives in sessionStorage)');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Fill mobile
  const mobileInput = page.locator(
    'input[type="tel"], input[placeholder*="Mobile" i], input[placeholder*="phone" i]'
  ).first();
  await mobileInput.fill(MOBILE);
  log(`  ↳ filled mobile ${MOBILE}`);

  // Click Send OTP
  await page.locator('button').filter({ hasText: /send otp/i }).first().click();
  await page.waitForTimeout(3500);
  log('  ↳ clicked Send OTP');

  // Fill OTP boxes
  const boxes = page.locator(
    'input[aria-label*="OTP" i], input[type="text"][maxlength="1"], input[autocomplete="one-time-code"]'
  );
  const digits = OTP.split('');
  for (let i = 0; i < digits.length; i++) {
    await boxes.nth(i).fill(digits[i]);
  }
  log(`  ↳ filled OTP ${OTP}`);

  // Submit
  const verifyBtn = page.locator('button').filter({ hasText: /verify|login|submit/i }).first();
  if (await verifyBtn.isVisible().catch(() => false)) {
    await verifyBtn.click();
    log('  ↳ clicked Verify');
  }
  await page.waitForTimeout(6000);

  const finalUrl = page.url();
  log(`  ↳ post-verify URL: ${finalUrl}`);

  if (!/\/home/i.test(finalUrl)) {
    throw new Error(`Fresh login failed — landed at ${finalUrl}`);
  }

  // Save cookies + localStorage portion (sessionStorage is lost but cookies refresh)
  await page.context().storageState({ path: AUTH_FILE });
  log(`  ↳ saved cookies/localStorage to ${AUTH_FILE} (sessionStorage NOT serialised)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM inspection — extracts heading, primary CTAs, key inputs, sidebar
// ─────────────────────────────────────────────────────────────────────────────
async function inspectModule(page) {
  return page.evaluate(() => {
    const collect = (selector, fn) =>
      Array.from(document.querySelectorAll(selector)).map(fn).filter(Boolean).slice(0, 30);

    const text = el => (el.innerText || el.textContent || '').trim().slice(0, 120);
    const attrs = el => {
      const out = {};
      ['id','data-testid','aria-label','placeholder','name','type','role','href'].forEach(a => {
        const v = el.getAttribute && el.getAttribute(a);
        if (v) out[a] = v;
      });
      return out;
    };
    const sigOf = el => ({ tag: el.tagName.toLowerCase(), attrs: attrs(el), text: text(el) });

    return {
      url: location.href,
      title: document.title,
      headings: collect('h1, h2, h3, h4, h5, h6', el => ({
        tag: el.tagName.toLowerCase(),
        text: text(el),
      })).filter(h => h.text),
      buttons:  collect('button', sigOf).filter(b => b.text || b.attrs['aria-label']),
      links:    collect('a[href]', sigOf).filter(a => a.text),
      inputs:   collect('input, textarea, select', sigOf),
      modals:   collect('[role="dialog"], .ant-modal, .ant-drawer', el => ({
        role: el.getAttribute('role'),
        cls: (el.className || '').toString().slice(0, 120),
        text: text(el).slice(0, 200),
      })),
      bodyTextSnippet: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 600),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-module capture
// ─────────────────────────────────────────────────────────────────────────────
async function captureModule(page, mod, log, opts = {}) {
  const url = BASE_URL + mod.path;
  log(`\n[${mod.key}] navigating ${url}`);

  const result = {
    module: mod.key,
    url,
    finalUrl: null,
    screenshotPath: null,
    inspection: null,
    interactiveStates: [],
    notes: [],
    error: null,
  };

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    // Allow SPA to settle
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(3500);

    result.finalUrl = page.url();
    log(`  ↳ landed at ${result.finalUrl}`);

    // Gate detection — if buyer redirected to login despite known auth, mark
    if (!mod.unauth && /uat\.xrportal\.in\/$/.test(result.finalUrl)) {
      result.notes.push('AUTH_REDIRECT — session not honoured');
    }

    // Snap landing
    const moduleDir = path.join(VM_ROOT, mod.key);
    if (!fs.existsSync(moduleDir)) fs.mkdirSync(moduleDir, { recursive: true });
    const shot = path.join(moduleDir, 'screenshot-desktop.png');
    await page.screenshot({ path: shot, fullPage: false });
    result.screenshotPath = path.relative(ROOT, shot).replace(/\\/g, '/');
    log(`  ↳ saved ${result.screenshotPath}`);

    // Inspect DOM
    result.inspection = await inspectModule(page);

    // Interactive state — callback modal trigger
    if (mod.modalTrigger === 'schedule_a_call') {
      const trigger = page.locator('button')
        .filter({ hasText: /schedule a call|call requested/i })
        .first();
      if (await trigger.isVisible().catch(() => false)) {
        await trigger.click().catch(() => {});
        await page.waitForTimeout(1500);
        const modalShot = path.join(moduleDir, 'callback-modal-verify-2026-06-06.png');
        await page.screenshot({ path: modalShot, fullPage: false });
        const modalInsp = await inspectModule(page);
        result.interactiveStates.push({
          state: 'schedule-a-call-modal',
          screenshot: path.relative(ROOT, modalShot).replace(/\\/g, '/'),
          modals: modalInsp.modals,
        });
        log(`  ↳ captured callback modal`);
      } else {
        result.notes.push('Schedule a Call trigger not visible');
      }
    }

    // Gate-state notes for data-gated modules
    if (mod.key === 'allocation-experience') {
      const congratsHere = /eligible to select/i.test(result.inspection.bodyTextSnippet);
      result.notes.push(
        congratsHere
          ? 'WINNER_STATE — eligible-to-select banner present'
          : 'NO_ACTIVE_CAMPAIGN — buyer sees default state (no winner banner)'
      );
    }
    if (mod.key === 'kyc') {
      const hasForm = /add applicants|payment successful/i.test(result.inspection.bodyTextSnippet);
      result.notes.push(
        hasForm
          ? 'KYC_FLOW_VISIBLE — applicants table present'
          : 'EMPTY_GATE — direct /kyc with no unitId param shows blank content'
      );
    }
    if (mod.key === 'payment-schedule') {
      const hasTable = /milestone|total amount/i.test(result.inspection.bodyTextSnippet);
      result.notes.push(
        hasTable
          ? 'TABLE_VISIBLE — payment schedule headers present'
          : 'NO_SELECTION — no registration/unit picked; table empty'
      );
    }
  } catch (e) {
    result.error = e.message;
    log(`  ✗ ERROR ${e.message}`);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function run() {
  const logLines = [];
  const log = m => { console.log(m); logLines.push(m); };

  const browser = await chromium.launch({ headless: false, slowMo: 60 });

  // Step 1 — capture UNAUTH module first in a clean context
  const moduleResults = [];
  const unauthMods = MODULES.filter(m => m.unauth);
  const authMods   = MODULES.filter(m => !m.unauth);

  for (const mod of unauthMods) {
    const cleanCtx  = await browser.newContext({ viewport: VIEWPORT });
    const cleanPage = await cleanCtx.newPage();
    const r = await captureModule(cleanPage, mod, log);
    moduleResults.push(r);
    await cleanCtx.close();
  }

  // Step 2 — fresh OTP login in a single context; keep ONE page alive throughout
  //          so sessionStorage (where the JWT lives) persists across navigations.
  const authCtx  = await browser.newContext({ viewport: VIEWPORT });
  const authPage = await authCtx.newPage();
  await freshLogin(authPage, log);

  for (const mod of authMods) {
    const r = await captureModule(authPage, mod, log);
    moduleResults.push(r);
  }

  // Step 3 — write results
  const payload = {
    timestamp: new Date().toISOString(),
    capturedBy: 'tech-lead-agent / capture-buyer-portal-all.js',
    portal: 'buyer',
    baseUrl: BASE_URL,
    viewport: VIEWPORT,
    authFile: path.relative(ROOT, AUTH_FILE).replace(/\\/g, '/'),
    modules: moduleResults,
    log: logLines,
  };
  fs.writeFileSync(RESULTS, JSON.stringify(payload, null, 2));
  log(`\nWrote ${path.relative(ROOT, RESULTS)}`);

  await authCtx.close();
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
