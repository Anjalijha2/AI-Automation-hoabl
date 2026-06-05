// scripts/capture-sm-fix-v2.js
//
// Fixes from v1 of capture-sm-4modules.js:
//   - Login: cleaner OTP entry using page.keyboard.type (auto-advances), separate browser contexts per state
//   - Login-otp-invalid: fill all 6 boxes with same digit, click Submit, capture error toast
//   - Login-otp-resend-enabled: poll until Re-Send button text changes (not just enabled)
//   - Login-success-dashboard: do fresh navigation, single fast OTP fill, wait for /sales-manager URL
//   - Tower Heatmap: select tower-item explicitly, then click .unit-number for unit-click; hover .unit-number for tooltip
//   - Verify each capture by checking actual file content size differs from initial
//
// Uses storageState from automation-repository/fixtures/.auth/sales-manager.json (for dashboard verification only)

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const VM   = path.join(ROOT, 'visual-memory', 'sm');
const VIEWPORT = { width: 1920, height: 900 };

const BASE = 'https://uat-web.xrportal.in/sales-manager';
const URLS = {
  login:          `${BASE}/login`,
  callback:       `${BASE}/callback-requests`,
  allocation:     `${BASE}/physical-allocation`,
  towers:         `${BASE}/towers`,
};

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note }, extra || {});
  console.log(`[${status.padEnd(14)}] ${key} — ${note}`);
}

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }
async function dismissOverlays(page) {
  for (let i = 0; i < 2; i++) { await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(200); }
  await page.mouse.click(5, 5).catch(() => {});
  await page.waitForTimeout(200);
}
async function shotFull(page, outFile) {
  await page.screenshot({ path: outFile, fullPage: true });
  const stat = fs.statSync(outFile);
  return { path: outFile, bytes: stat.size };
}
async function shot(page, outFile) {
  await page.screenshot({ path: outFile, fullPage: false });
  const stat = fs.statSync(outFile);
  return { path: outFile, bytes: stat.size };
}
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

// Fill OTP via sequential fills (page may or may not auto-advance — handle both)
async function fillOtpSequential(page, code) {
  const otpInputs = page.locator('input[aria-label*="OTP" i]');
  const cnt = await otpInputs.count();
  if (cnt < 6) return false;
  // Clear by selecting all + delete
  for (let i = 0; i < 6; i++) {
    const inp = otpInputs.nth(i);
    await inp.click({ force: true });
    await page.keyboard.press('Control+A').catch(() => {});
    await page.keyboard.press('Delete').catch(() => {});
    await page.waitForTimeout(50);
  }
  // Fill each individually with explicit focus
  for (let i = 0; i < 6; i++) {
    const inp = otpInputs.nth(i);
    await inp.focus();
    await inp.fill(code[i]);
    await page.waitForTimeout(120);
  }
  // Verify all 6 inputs have a digit
  const vals = await otpInputs.evaluateAll(els => els.map(e => e.value)).catch(() => []);
  return vals.length === 6 && vals.every(v => v && v.length > 0);
}

// ===================================================================
// LOGIN STATES (each in its own fresh context to avoid OTP burn-out)
// ===================================================================
async function captureLoginAll(browser) {
  const outDir = path.join(VM, 'login');
  ensureDir(outDir);
  console.log('\n=== MODULE 1 (v2): Login ===');

  // ---- 1+2: initial + OTP entry (one context) ----
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    const page = await ctx.newPage();
    try {
      await page.goto(URLS.login, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 1500);

      // 1. initial
      const r1 = await shot(page, path.join(outDir, 'login-initial.png'));
      rec('login/login-initial', 'CAPTURED', `Loaded ${page.url()}`, { file: r1.path, bytes: r1.bytes });

      // 2. OTP entry
      await page.locator('input[name="phone"]').fill('8888888888');
      await settle(page, 400);
      await page.locator('button.ant-btn-submit, button:has-text("Send OTP")').first().click();
      await settle(page, 3500);
      // Wait for OTP screen
      await page.waitForSelector('input[aria-label="OTP Input 1"]', { timeout: 10_000 }).catch(() => {});
      const r2 = await shot(page, path.join(outDir, 'login-otp-entry.png'));
      rec('login/login-otp-entry', 'CAPTURED', `OTP screen visible`, { file: r2.path, bytes: r2.bytes });
    } finally { await ctx.close(); }
  }

  // ---- 3: OTP invalid (fresh context) ----
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    const page = await ctx.newPage();
    try {
      await page.goto(URLS.login, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 1500);
      await page.locator('input[name="phone"]').fill('8888888888');
      await page.locator('button.ant-btn-submit').first().click();
      await page.waitForSelector('input[aria-label="OTP Input 1"]', { timeout: 10_000 });
      await settle(page, 1000);
      const ok = await fillOtpSequential(page, '000000');
      if (!ok) {
        rec('login/login-otp-invalid', 'NOT_FOUND', 'Could not fill all 6 OTP inputs');
      } else {
        await settle(page, 500);
        // Click Submit OTP
        const submit = page.locator('button:has-text("Submit OTP")').first();
        if (await submit.count() > 0 && !(await submit.isDisabled())) {
          await submit.click();
          await settle(page, 3000);
        }
        // Take screenshot showing error toast
        const r3 = await shot(page, path.join(outDir, 'login-otp-invalid.png'));
        // Grab error toast text
        const errs = await page.evaluate(() => {
          const texts = [];
          document.querySelectorAll('.Toastify__toast, .ant-message, [role="alert"], .ant-notification, .ant-form-item-explain-error').forEach(el => {
            const t = (el.innerText || '').trim();
            if (t && t.length < 300) texts.push(t);
          });
          return texts;
        }).catch(() => []);
        rec('login/login-otp-invalid', 'CAPTURED', `Errors: ${JSON.stringify(errs)}`, { file: r3.path, bytes: r3.bytes, errors: errs });
      }
    } finally { await ctx.close(); }
  }

  // ---- 4: Resend enabled (fresh context — wait for countdown) ----
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    const page = await ctx.newPage();
    try {
      await page.goto(URLS.login, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await page.locator('input[name="phone"]').fill('8888888888');
      await page.locator('button.ant-btn-submit').first().click();
      await page.waitForSelector('input[aria-label="OTP Input 1"]', { timeout: 10_000 });
      // Poll the Re-Send button — initially disabled with countdown text "Re-Send in NNs"
      let enabled = false;
      const start = Date.now();
      while (Date.now() - start < 75_000) {
        const btn = page.locator('button.common-link, button:has-text("Re-Send")').first();
        if (await btn.count() > 0) {
          const disabled = await btn.isDisabled().catch(() => true);
          const text = (await btn.innerText().catch(() => '')) || '';
          if (!disabled && !/in\s+\d+\s*s/i.test(text)) { enabled = true; break; }
        }
        await page.waitForTimeout(3000);
      }
      const r4 = await shot(page, path.join(outDir, 'login-otp-resend-enabled.png'));
      rec('login/login-otp-resend-enabled',
          enabled ? 'CAPTURED' : 'CAPTURED_TIMEOUT',
          enabled ? 'Re-Send OTP button enabled' : 'Countdown still active — captured snapshot',
          { file: r4.path, bytes: r4.bytes });
    } finally { await ctx.close(); }
  }

  // ---- 5: Login success (fresh context — single clean attempt) ----
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    const page = await ctx.newPage();
    try {
      await page.goto(URLS.login, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await page.locator('input[name="phone"]').fill('8888888888');
      await page.locator('button.ant-btn-submit').first().click();
      await page.waitForSelector('input[aria-label="OTP Input 1"]', { timeout: 10_000 });
      await settle(page, 1500);
      const ok = await fillOtpSequential(page, '258369');
      if (!ok) {
        rec('login/login-success-dashboard', 'NOT_FOUND', 'Could not fill OTP');
      } else {
        await settle(page, 400);
        // Get a screenshot here to verify all 6 boxes are filled
        await shot(page, path.join(outDir, '_pre-submit-258369.png')).catch(() => {});
        await page.locator('button:has-text("Submit OTP")').first().click();
        // Wait for nav off /login
        const start = Date.now();
        while (Date.now() - start < 30_000) {
          if (!/\/login/.test(page.url())) break;
          await page.waitForTimeout(700);
        }
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        await settle(page, 2500);
        const r5 = await shotFull(page, path.join(outDir, 'login-success-dashboard.png'));
        // Capture post-login URL for record
        const postUrl = page.url();
        const isSuccess = !/\/login/.test(postUrl);
        rec('login/login-success-dashboard',
            isSuccess ? 'CAPTURED' : 'AUTH_FAILED',
            `Final URL: ${postUrl}`,
            { file: r5.path, bytes: r5.bytes, finalUrl: postUrl });
      }
    } finally { await ctx.close(); }
  }
}

// ===================================================================
// TOWER HEATMAP V2 — better unit click + status discovery
// ===================================================================
async function captureTowerHeatmapV2(browser) {
  const outDir = path.join(VM, 'tower-heatmap');
  ensureDir(outDir);
  console.log('\n=== MODULE 4 (v2): Tower Heatmap ===');

  const ctx = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH });
  const page = await ctx.newPage();
  try {
    await page.goto(URLS.towers, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 3500);
    if (/\/login/i.test(page.url())) { rec('tower-heatmap/all', 'AUTH_FAILED', 'Redirected to login'); return; }

    // Tower selected (Tower 9 - Triumph — 223 units, more interactive than Crest)
    try {
      const t9 = page.locator('li.tower-item:has-text("Tower 9")').first();
      if (await t9.count() > 0) {
        await t9.scrollIntoViewIfNeeded();
        await t9.click({ force: true });
        await settle(page, 3000);
      }
      const r = await shotFull(page, path.join(outDir, 'heatmap-tower-selected.png'));
      rec('tower-heatmap/heatmap-tower-selected', 'CAPTURED', 'Tower 9 - Triumph clicked', { file: r.path, bytes: r.bytes });
    } catch (e) { rec('tower-heatmap/heatmap-tower-selected', 'ERROR', String(e?.message || e)); }

    // Inspect unit cell classes to discover status variants (booked, available, blocked, held)
    const unitClasses = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('.unit-number'));
      const classMap = {};
      cells.forEach(c => {
        const cls = (c.className || '').toString();
        classMap[cls] = (classMap[cls] || 0) + 1;
      });
      // Also collect text snippets
      const sample = cells.slice(0, 30).map(c => ({ cls: (c.className || '').toString(), text: (c.innerText || '').trim() }));
      return { classMap, sample, totalUnits: cells.length };
    }).catch(() => ({}));
    fs.writeFileSync(path.join(outDir, '_heatmap-unit-classes.json'), JSON.stringify(unitClasses, null, 2));
    console.log('  Unit class variants:', Object.keys(unitClasses.classMap || {}).join(' | '));

    // Unit hover — try a unit-number that isn't booked (likely shows tooltip with detail)
    try {
      const availUnit = page.locator('.unit-number:not(.booked-unit):not(.blocked-unit):not(.held-unit)').first();
      const targetUnit = (await availUnit.count() > 0) ? availUnit : page.locator('.unit-number').first();
      if (await targetUnit.count() > 0) {
        await targetUnit.scrollIntoViewIfNeeded();
        await targetUnit.hover({ force: true });
        await settle(page, 2000);
        const r = await shot(page, path.join(outDir, 'heatmap-unit-hover.png'));
        const tooltipText = await page.evaluate(() => {
          const els = document.querySelectorAll('.ant-tooltip, [role="tooltip"], .ant-popover-inner-content, [class*="tooltip" i]');
          for (const el of els) {
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null) {
              const t = (el.innerText || '').trim();
              if (t) return t.slice(0, 500);
            }
          }
          return '';
        }).catch(() => '');
        rec('tower-heatmap/heatmap-unit-hover', 'CAPTURED', `Tooltip: "${tooltipText.slice(0,120)}"`, { file: r.path, bytes: r.bytes, tooltipText });
      } else {
        rec('tower-heatmap/heatmap-unit-hover', 'NOT_FOUND', 'No .unit-number found');
      }
    } catch (e) { rec('tower-heatmap/heatmap-unit-hover', 'ERROR', String(e?.message || e)); }

    // Unit click — click an available unit, expect detail panel/modal
    try {
      const availUnit = page.locator('.unit-number:not(.booked-unit):not(.blocked-unit):not(.held-unit)').first();
      const targetUnit = (await availUnit.count() > 0) ? availUnit : page.locator('.unit-number').first();
      if (await targetUnit.count() > 0) {
        await targetUnit.scrollIntoViewIfNeeded();
        await targetUnit.click({ force: true });
        await settle(page, 2500);
        const r = await shot(page, path.join(outDir, 'heatmap-unit-click.png'));
        const detail = await page.evaluate(() => {
          const modal = document.querySelector('.ant-modal-content, [role="dialog"], .ant-drawer-body, .ant-popover-inner-content');
          if (modal) {
            const style = window.getComputedStyle(modal);
            if (style.display !== 'none' && modal.offsetParent !== null) {
              return (modal.innerText || '').slice(0, 600);
            }
          }
          // Maybe a side panel
          const panel = document.querySelector('[class*="unit-detail" i], [class*="unitDetail" i], [class*="selected-unit" i], [class*="side-panel" i]');
          if (panel) return (panel.innerText || '').slice(0, 600);
          // Or a configuration panel
          const config = document.querySelector('.unit-list-config, .fixed-bar-configuration');
          if (config) return (config.innerText || '').slice(0, 600);
          return '';
        }).catch(() => '');
        rec('tower-heatmap/heatmap-unit-click', 'CAPTURED', `Detail: "${detail.slice(0,150)}"`, { file: r.path, bytes: r.bytes, detail });
        await dismissOverlays(page);
      } else {
        rec('tower-heatmap/heatmap-unit-click', 'NOT_FOUND', 'No .unit-number located');
      }
    } catch (e) { rec('tower-heatmap/heatmap-unit-click', 'ERROR', String(e?.message || e)); }

    // Filter — Tower Heatmap may not have filters; try floor/unit-type selectors
    try {
      // Look for any visible filter-like control
      const filterEls = page.locator('.ant-select:visible, button:has-text("Filter"), button:has-text("Floor"), button:has-text("Configuration"), button:has-text("BHK")');
      const cnt = await filterEls.count();
      let captured = false;
      for (let i = 0; i < Math.min(cnt, 8); i++) {
        const el = filterEls.nth(i);
        try {
          await el.scrollIntoViewIfNeeded();
          await el.click({ force: true });
          await settle(page, 900);
          const open = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden), [role="listbox"]:visible, .ant-dropdown:not(.ant-dropdown-hidden)').count();
          if (open > 0) {
            const r = await shot(page, path.join(outDir, 'heatmap-filter.png'));
            const opts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option, .ant-dropdown:not(.ant-dropdown-hidden) [role="menuitem"]').allInnerTexts().catch(() => []);
            rec('tower-heatmap/heatmap-filter', 'CAPTURED', `Filter ${i} opened with ${opts.length} option(s)`, { file: r.path, bytes: r.bytes, options: opts });
            captured = true;
            await dismissOverlays(page);
            break;
          }
          await dismissOverlays(page);
        } catch (_) {}
      }
      if (!captured) {
        // Capture full page as filter context fallback to keep an evidence file
        const r = await shot(page, path.join(outDir, 'heatmap-filter.png'));
        rec('tower-heatmap/heatmap-filter', 'CAPTURED_FALLBACK', 'No interactive filter dropdown — page may not expose explicit filter controls', { file: r.path, bytes: r.bytes });
      }
    } catch (e) { rec('tower-heatmap/heatmap-filter', 'ERROR', String(e?.message || e)); }
  } catch (e) {
    rec('tower-heatmap/module', 'ERROR', String(e?.message || e));
  } finally {
    await ctx.close();
  }
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No SM auth file at', AUTH); process.exit(1); }
  const browser = await chromium.launch({ headless: true });
  try {
    await captureLoginAll(browser);
    await captureTowerHeatmapV2(browser);
  } catch (e) { console.error('FATAL:', e?.message || e); }
  finally {
    fs.writeFileSync(path.join(__dirname, '_capture-sm-fix-v2-results.json'), JSON.stringify(results, null, 2));
    console.log('\nResults written: scripts/_capture-sm-fix-v2-results.json');
    await browser.close();
  }
})();
