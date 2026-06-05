// scripts/capture-sm-4modules.js
//
// Capture all UI states for Sales Manager Portal — 4 modules:
//   1. Login              — 5 states (initial, OTP entry, invalid OTP, resend enabled, success)
//   2. Callback Requests  — list, table, filters, action, empty
//   3. Physical Allocation — landing (customer search), table, filters, action, empty
//   4. Tower Heatmap      — initial, tower selected, unit hover, unit click, filter
//
// Routes (from source: routes/Private/sales-manager/index.jsx):
//   /sales-manager/callback-requests
//   /sales-manager/towers           -> Tower Heatmap
//   /sales-manager/physical-allocation
//   /sales-manager/login
//
// Uses storageState from automation-repository/fixtures/.auth/sales-manager.json
// (freshly generated 2026-06-05 with OTP 258369)

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
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
  }
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

// ===================================================================
// MODULE 1 — LOGIN (unauthenticated browser context)
// ===================================================================
async function captureLogin(browser) {
  const outDir = path.join(VM, 'login');
  ensureDir(outDir);
  console.log('\n=== MODULE 1: Login (fresh unauthenticated context) ===');

  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  try {
    // 1. login-initial.png — empty mobile input
    try {
      await page.goto(URLS.login, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 2000);
      // Capture DOM structure first
      const struct = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
          name: i.name || '', type: i.type || '', placeholder: i.placeholder || '',
          ariaLabel: i.getAttribute('aria-label') || '', id: i.id || '',
        }));
        const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
          text: (b.innerText || '').trim(),
          aria: b.getAttribute('aria-label') || '',
          cls: (b.className || '').toString().slice(0, 120),
          type: b.getAttribute('type') || '',
        })).filter(b => b.text || b.aria);
        const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
          .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`).filter(s => s.length > 1);
        return { url: location.href, headings, inputs, buttons, title: document.title };
      }).catch(e => ({ err: String(e?.message || e) }));
      fs.writeFileSync(path.join(outDir, '_login-initial-dom.json'), JSON.stringify(struct, null, 2));

      const out = path.join(outDir, 'login-initial.png');
      const r = await shot(page, out);
      rec('login/login-initial', 'CAPTURED', `Loaded ${page.url()}`, { file: r.path, bytes: r.bytes });
    } catch (e) { rec('login/login-initial', 'ERROR', String(e?.message || e)); }

    // 2. login-otp-entry.png — enter 8888888888, click Send OTP
    try {
      const mobileInput = page.locator('input[type="tel"], input[placeholder*="Mobile" i], input[name*="mobile" i], input[name*="phone" i]').first();
      if (await mobileInput.count() === 0) {
        rec('login/login-otp-entry', 'NOT_FOUND', 'Mobile input not located');
      } else {
        await mobileInput.fill('8888888888');
        await settle(page, 500);
        const sendBtn = page.locator('button:has-text("Send OTP"), button:has-text("Get OTP"), button[type="submit"]').first();
        if (await sendBtn.count() === 0) {
          rec('login/login-otp-entry', 'NOT_FOUND', 'Send OTP button not located');
        } else {
          await sendBtn.click();
          await settle(page, 3500);
          // Capture OTP screen DOM
          const otpDom = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
              name: i.name || '', type: i.type || '', placeholder: i.placeholder || '',
              ariaLabel: i.getAttribute('aria-label') || '', id: i.id || '', maxLength: i.maxLength,
            }));
            const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
              text: (b.innerText || '').trim(),
              cls: (b.className || '').toString().slice(0, 120),
              disabled: b.disabled,
            })).filter(b => b.text);
            const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
              .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`).filter(s => s.length > 1);
            // Look for countdown text
            const allText = document.body.innerText;
            const countdownMatch = allText.match(/(re-?send|resend|expires?).{0,40}(\d{1,2}:\d{2}|\d+\s*sec)/i);
            return { headings, inputs, buttons, countdown: countdownMatch ? countdownMatch[0] : null };
          }).catch(() => ({}));
          fs.writeFileSync(path.join(outDir, '_login-otp-entry-dom.json'), JSON.stringify(otpDom, null, 2));

          const out = path.join(outDir, 'login-otp-entry.png');
          const r = await shot(page, out);
          rec('login/login-otp-entry', 'CAPTURED', `OTP screen at ${page.url()}`, { file: r.path, bytes: r.bytes });
        }
      }
    } catch (e) { rec('login/login-otp-entry', 'ERROR', String(e?.message || e)); }

    // 3. login-otp-invalid.png — enter 000000, submit -> error
    try {
      // Fill 6 OTP digits with 0
      const otpInputs = page.locator('input[aria-label*="OTP" i], input[maxlength="1"], input[name*="otp" i]');
      const otpCount = await otpInputs.count();
      if (otpCount >= 4) {
        for (let i = 0; i < Math.min(otpCount, 6); i++) {
          await otpInputs.nth(i).fill('0');
          await page.waitForTimeout(80);
        }
        await settle(page, 500);
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Verify"), button:has-text("Login"), button[type="submit"]').first();
        if (await submitBtn.count() > 0 && !(await submitBtn.isDisabled())) {
          await submitBtn.click();
          await settle(page, 2500);
        }
        const out = path.join(outDir, 'login-otp-invalid.png');
        const r = await shot(page, out);
        // Capture error text
        const errText = await page.evaluate(() => {
          const errs = Array.from(document.querySelectorAll('[class*="error" i], [class*="Error" i], .ant-form-item-explain, .ant-message, [role="alert"], .Toastify__toast'))
            .map(e => (e.innerText || '').trim()).filter(t => t.length > 2 && t.length < 200);
          return errs.slice(0, 5);
        }).catch(() => []);
        rec('login/login-otp-invalid', 'CAPTURED', `Errors: ${JSON.stringify(errText)}`, { file: r.path, bytes: r.bytes, errors: errText });
      } else {
        rec('login/login-otp-invalid', 'NOT_FOUND', `Only ${otpCount} OTP input(s) found`);
      }
    } catch (e) { rec('login/login-otp-invalid', 'ERROR', String(e?.message || e)); }

    // 4. login-otp-resend-enabled.png — wait for countdown, then check Re-Send button
    try {
      // Clear OTP inputs first to be safe
      const otpInputs = page.locator('input[aria-label*="OTP" i], input[maxlength="1"]');
      const otpCount = await otpInputs.count();
      if (otpCount > 0) {
        for (let i = 0; i < otpCount; i++) {
          await otpInputs.nth(i).fill('').catch(() => {});
        }
      }
      // Wait up to 90s for countdown to expire — poll every 5s for Re-Send to be enabled
      let resendEnabled = false;
      const start = Date.now();
      while (Date.now() - start < 95_000) {
        const resendBtn = page.locator('button:has-text("Re-Send"), button:has-text("Resend"), button:has-text("Re Send")').first();
        if (await resendBtn.count() > 0) {
          const disabled = await resendBtn.isDisabled().catch(() => true);
          if (!disabled) { resendEnabled = true; break; }
        }
        await page.waitForTimeout(5000);
      }
      const out = path.join(outDir, 'login-otp-resend-enabled.png');
      const r = await shot(page, out);
      rec('login/login-otp-resend-enabled', resendEnabled ? 'CAPTURED' : 'CAPTURED_TIMEOUT',
          resendEnabled ? 'Re-Send button enabled' : 'Countdown still running after 95s — captured current state',
          { file: r.path, bytes: r.bytes });
    } catch (e) { rec('login/login-otp-resend-enabled', 'ERROR', String(e?.message || e)); }

    // 5. login-success-dashboard.png — enter 258369, submit -> dashboard
    try {
      // Re-enter mobile if back to mobile screen, or re-fill OTP
      // Try OTP-first path: still on OTP screen
      let otpInputs = page.locator('input[aria-label*="OTP" i], input[maxlength="1"]');
      let otpCount = await otpInputs.count();

      // If no OTP inputs visible, we may be back at mobile screen — redo flow
      if (otpCount < 4) {
        const mobileInput = page.locator('input[type="tel"], input[placeholder*="Mobile" i]').first();
        if (await mobileInput.count() > 0) {
          await mobileInput.fill('');
          await mobileInput.fill('8888888888');
          await settle(page, 400);
          const sendBtn = page.locator('button:has-text("Send OTP"), button:has-text("Get OTP"), button[type="submit"]').first();
          if (await sendBtn.count() > 0) {
            await sendBtn.click();
            await settle(page, 3500);
          }
        }
        otpInputs = page.locator('input[aria-label*="OTP" i], input[maxlength="1"]');
        otpCount = await otpInputs.count();
      }

      // Re-Send if there's a chance the previous OTP was consumed by the invalid test
      // Actually static OTP 258369 always works — just fill it
      if (otpCount >= 6) {
        const code = '258369';
        // Clear first
        for (let i = 0; i < 6; i++) {
          await otpInputs.nth(i).fill('').catch(() => {});
          await page.waitForTimeout(60);
        }
        for (let i = 0; i < 6; i++) {
          await otpInputs.nth(i).fill(code[i]);
          await page.waitForTimeout(80);
        }
        await settle(page, 500);
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Verify"), button:has-text("Login"), button[type="submit"]').first();
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
        }
        // Wait for redirect away from /login
        const start = Date.now();
        while (Date.now() - start < 30_000) {
          if (!/\/login/i.test(page.url())) break;
          await page.waitForTimeout(800);
        }
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        await settle(page, 2500);
        const out = path.join(outDir, 'login-success-dashboard.png');
        const r = await shot(page, out);
        rec('login/login-success-dashboard', 'CAPTURED', `Landing at ${page.url()}`, { file: r.path, bytes: r.bytes });
      } else {
        rec('login/login-success-dashboard', 'NOT_FOUND', `Only ${otpCount} OTP inputs found; cannot enter 258369`);
      }
    } catch (e) { rec('login/login-success-dashboard', 'ERROR', String(e?.message || e)); }

  } finally {
    await ctx.close();
  }
}

// ===================================================================
// SIDEBAR NAV INSPECTION
// ===================================================================
async function inspectSidebar(page) {
  try {
    await page.goto(URLS.callback, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2000);
    if (/\/login/i.test(page.url())) {
      rec('_sidebar', 'AUTH_FAILED', `Redirected to ${page.url()}`);
      return;
    }
    const nav = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"], .ant-menu-item, .ant-menu-submenu, nav button'));
      const out = [];
      const seen = new Set();
      for (const l of links) {
        const text = (l.innerText || '').trim().split('\n')[0].slice(0, 80);
        const href = l.getAttribute('href') || l.dataset.href || '';
        const cls = (l.className || '').toString().slice(0, 80);
        if (!text || text.length < 2) continue;
        const key = `${text}|${href}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ text, href, cls });
        if (out.length > 40) break;
      }
      return out;
    }).catch(() => []);
    fs.writeFileSync(path.join(VM, '_sm-sidebar-nav.json'), JSON.stringify(nav, null, 2));
    rec('_sidebar', 'CAPTURED', `Found ${nav.length} nav items`, { items: nav.slice(0, 20) });
  } catch (e) { rec('_sidebar', 'ERROR', String(e?.message || e)); }
}

// ===================================================================
// MODULE 2 — CALLBACK REQUESTS
// ===================================================================
async function captureCallback(page) {
  const outDir = path.join(VM, 'callback-requests');
  ensureDir(outDir);
  console.log('\n=== MODULE 2: Callback Requests ===');

  try {
    await page.goto(URLS.callback, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    if (/\/login/i.test(page.url())) { rec('callback-requests/all', 'AUTH_FAILED', 'Redirected to login'); return; }

    // 1. Loaded
    {
      const out = path.join(outDir, 'callback-loaded.png');
      const r = await shotFull(page, out);
      rec('callback-requests/callback-loaded', 'CAPTURED', `URL ${page.url()}`, { file: r.path, bytes: r.bytes });
    }

    // DOM inspect
    const struct = await page.evaluate(() => {
      const out = { url: location.href };
      out.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`).filter(s => s.length > 2).slice(0, 15);
      out.tableHeaders = Array.from(document.querySelectorAll('thead th, .ant-table-thead th')).map(th => (th.innerText || '').trim());
      out.rowCount = document.querySelectorAll('tbody tr, .ant-table-row').length;
      out.firstRow = (document.querySelector('tbody tr')?.innerText || '').slice(0, 500);
      out.statusBadges = Array.from(document.querySelectorAll('tbody [class*="badge" i], tbody [class*="tag" i], tbody [class*="status" i], tbody .ant-tag'))
        .map(b => ({ text: (b.innerText || '').trim(), cls: (b.className || '').toString().slice(0, 80) })).slice(0, 10);
      out.rowActions = Array.from(document.querySelectorAll('tbody tr:first-child button, tbody tr:first-child a, tbody tr:first-child [role="button"]'))
        .map(b => ({ tag: b.tagName, text: (b.innerText || '').trim(), aria: b.getAttribute('aria-label') || '', cls: (b.className || '').toString().slice(0, 80), title: b.getAttribute('title') || '' }));
      out.filters = Array.from(document.querySelectorAll('.ant-select-selector, [class*="filter" i] select, [class*="filter" i] button'))
        .map(f => (f.innerText || '').trim()).filter(Boolean).slice(0, 15);
      out.inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        placeholder: i.placeholder || '', type: i.type, name: i.name || '',
      })).slice(0, 15);
      out.emptyState = /no.{0,15}(data|records|results|callback)/i.test(document.body.innerText) ? 'YES' : 'NO';
      return out;
    }).catch(e => ({ err: String(e?.message || e) }));
    fs.writeFileSync(path.join(outDir, '_callback-dom-inspect.json'), JSON.stringify(struct, null, 2));
    console.log('  DOM inspect saved. Rows:', struct.rowCount, 'Empty?', struct.emptyState);

    // 2. callback-table-data.png (if rows > 0) OR empty.png
    if (struct.rowCount && struct.rowCount > 0) {
      try {
        const out = path.join(outDir, 'callback-table-data.png');
        const tbl = page.locator('table, .ant-table').first();
        if (await tbl.count() > 0) {
          await tbl.scrollIntoViewIfNeeded();
          await settle(page, 400);
          await tbl.screenshot({ path: out });
        } else {
          await shot(page, out);
        }
        const stat = fs.statSync(out);
        rec('callback-requests/callback-table-data', 'CAPTURED', `${struct.rowCount} row(s); columns: ${JSON.stringify(struct.tableHeaders)}`, { file: out, bytes: stat.size, columns: struct.tableHeaders });
      } catch (e) { rec('callback-requests/callback-table-data', 'ERROR', String(e?.message || e)); }
      rec('callback-requests/callback-empty', 'SKIPPED', 'Table has data');
    } else {
      try {
        const out = path.join(outDir, 'callback-empty.png');
        const r = await shot(page, out);
        rec('callback-requests/callback-empty', 'CAPTURED', 'Empty state captured', { file: r.path, bytes: r.bytes });
      } catch (e) { rec('callback-requests/callback-empty', 'ERROR', String(e?.message || e)); }
      rec('callback-requests/callback-table-data', 'SKIPPED', 'No rows present');
    }

    // 3. callback-filter-open.png
    try {
      const filterCandidates = page.locator('.ant-select, [class*="filter" i] button, button:has-text("Filter"), button:has-text("Status")');
      const cnt = await filterCandidates.count();
      let captured = false;
      for (let i = 0; i < Math.min(cnt, 5); i++) {
        const el = filterCandidates.nth(i);
        try {
          await el.scrollIntoViewIfNeeded();
          await el.click();
          await settle(page, 900);
          const dropdownOpen = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden), [role="listbox"], .ant-dropdown:not(.ant-dropdown-hidden)').count();
          if (dropdownOpen > 0) {
            const out = path.join(outDir, 'callback-filter-open.png');
            const r = await shot(page, out);
            const opts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option, .ant-dropdown:not(.ant-dropdown-hidden) [role="menuitem"]').allInnerTexts().catch(() => []);
            rec('callback-requests/callback-filter-open', 'CAPTURED', `Filter ${i} opened with ${opts.length} option(s)`, { file: r.path, bytes: r.bytes, options: opts });
            captured = true;
            await dismissOverlays(page);
            break;
          }
          await dismissOverlays(page);
        } catch (_) {}
      }
      if (!captured) rec('callback-requests/callback-filter-open', 'NOT_FOUND', 'No filter dropdown opened');
    } catch (e) { rec('callback-requests/callback-filter-open', 'ERROR', String(e?.message || e)); }

    // 4. callback-action.png — click first row action
    try {
      if (struct.rowCount > 0 && struct.rowActions && struct.rowActions.length > 0) {
        const actBtn = page.locator('tbody tr:first-child button, tbody tr:first-child a, tbody tr:first-child [role="button"]').first();
        if (await actBtn.count() > 0) {
          await actBtn.scrollIntoViewIfNeeded();
          await actBtn.click({ force: true });
          await settle(page, 1500);
          const out = path.join(outDir, 'callback-action.png');
          const r = await shot(page, out);
          const modalText = await page.evaluate(() => {
            const m = document.querySelector('.ant-modal-content, [role="dialog"]');
            return m ? (m.innerText || '').slice(0, 400) : '';
          }).catch(() => '');
          rec('callback-requests/callback-action', 'CAPTURED', `Action clicked; modal: "${modalText.slice(0,100)}"`, { file: r.path, bytes: r.bytes, modalText });
          await dismissOverlays(page);
        } else {
          rec('callback-requests/callback-action', 'NOT_FOUND', 'No action button in first row');
        }
      } else {
        rec('callback-requests/callback-action', 'SKIPPED', 'No rows / no action buttons');
      }
    } catch (e) { rec('callback-requests/callback-action', 'ERROR', String(e?.message || e)); }
  } catch (e) {
    rec('callback-requests/module', 'ERROR', String(e?.message || e));
  }
}

// ===================================================================
// MODULE 3 — PHYSICAL ALLOCATION
// ===================================================================
async function captureAllocation(page) {
  const outDir = path.join(VM, 'physical-allocation');
  ensureDir(outDir);
  console.log('\n=== MODULE 3: Physical Allocation ===');

  try {
    await page.goto(URLS.allocation, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    if (/\/login/i.test(page.url())) { rec('physical-allocation/all', 'AUTH_FAILED', 'Redirected to login'); return; }

    {
      const out = path.join(outDir, 'allocation-loaded.png');
      const r = await shotFull(page, out);
      rec('physical-allocation/allocation-loaded', 'CAPTURED', `URL ${page.url()}`, { file: r.path, bytes: r.bytes });
    }

    const struct = await page.evaluate(() => {
      const out = { url: location.href };
      out.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`).filter(s => s.length > 2).slice(0, 15);
      out.tableHeaders = Array.from(document.querySelectorAll('thead th, .ant-table-thead th')).map(th => (th.innerText || '').trim());
      out.rowCount = document.querySelectorAll('tbody tr, .ant-table-row').length;
      out.firstRow = (document.querySelector('tbody tr')?.innerText || '').slice(0, 500);
      out.rowActions = Array.from(document.querySelectorAll('tbody tr:first-child button, tbody tr:first-child a, tbody tr:first-child [role="button"]'))
        .map(b => ({ tag: b.tagName, text: (b.innerText || '').trim(), aria: b.getAttribute('aria-label') || '', cls: (b.className || '').toString().slice(0, 80), title: b.getAttribute('title') || '' }));
      out.statusBadges = Array.from(document.querySelectorAll('tbody [class*="badge" i], tbody .ant-tag, tbody [class*="status" i]'))
        .map(b => ({ text: (b.innerText || '').trim(), cls: (b.className || '').toString().slice(0, 80) })).slice(0, 10);
      out.inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        placeholder: i.placeholder || '', type: i.type, name: i.name || '', ariaLabel: i.getAttribute('aria-label') || '',
      })).slice(0, 20);
      out.buttons = Array.from(document.querySelectorAll('button')).map(b => (b.innerText || '').trim()).filter(Boolean).slice(0, 30);
      out.filters = Array.from(document.querySelectorAll('.ant-select-selector, [class*="filter" i] button'))
        .map(f => (f.innerText || '').trim()).filter(Boolean).slice(0, 15);
      out.emptyState = /no.{0,15}(data|customers|records|results)/i.test(document.body.innerText) ? 'YES' : 'NO';
      out.bodySnippet = document.body.innerText.slice(0, 1500);
      return out;
    }).catch(e => ({ err: String(e?.message || e) }));
    fs.writeFileSync(path.join(outDir, '_allocation-dom-inspect.json'), JSON.stringify(struct, null, 2));
    console.log('  DOM inspect saved. Rows:', struct.rowCount, 'Empty?', struct.emptyState);

    // Table close-up
    if (struct.rowCount > 0) {
      try {
        const out = path.join(outDir, 'allocation-table.png');
        const tbl = page.locator('table, .ant-table').first();
        if (await tbl.count() > 0) {
          await tbl.scrollIntoViewIfNeeded();
          await tbl.screenshot({ path: out });
        } else {
          await shot(page, out);
        }
        const stat = fs.statSync(out);
        rec('physical-allocation/allocation-table', 'CAPTURED', `${struct.rowCount} row(s); cols: ${JSON.stringify(struct.tableHeaders)}`, { file: out, bytes: stat.size });
      } catch (e) { rec('physical-allocation/allocation-table', 'ERROR', String(e?.message || e)); }
      rec('physical-allocation/allocation-empty', 'SKIPPED', 'Has rows');
    } else {
      try {
        const out = path.join(outDir, 'allocation-empty.png');
        const r = await shot(page, out);
        rec('physical-allocation/allocation-empty', 'CAPTURED', 'Empty state', { file: r.path, bytes: r.bytes });
      } catch (e) { rec('physical-allocation/allocation-empty', 'ERROR', String(e?.message || e)); }
      rec('physical-allocation/allocation-table', 'SKIPPED', 'No rows');
    }

    // Filter open
    try {
      const filterCandidates = page.locator('.ant-select, button:has-text("Filter"), button:has-text("Status"), button:has-text("Tower")');
      const cnt = await filterCandidates.count();
      let captured = false;
      for (let i = 0; i < Math.min(cnt, 5); i++) {
        const el = filterCandidates.nth(i);
        try {
          await el.scrollIntoViewIfNeeded();
          await el.click();
          await settle(page, 900);
          const open = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden), [role="listbox"], .ant-dropdown:not(.ant-dropdown-hidden)').count();
          if (open > 0) {
            const out = path.join(outDir, 'allocation-filters.png');
            const r = await shot(page, out);
            const opts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option, .ant-dropdown:not(.ant-dropdown-hidden) [role="menuitem"]').allInnerTexts().catch(() => []);
            rec('physical-allocation/allocation-filters', 'CAPTURED', `Filter opened with ${opts.length} option(s)`, { file: r.path, bytes: r.bytes, options: opts });
            captured = true;
            await dismissOverlays(page);
            break;
          }
          await dismissOverlays(page);
        } catch (_) {}
      }
      if (!captured) rec('physical-allocation/allocation-filters', 'NOT_FOUND', 'No filter dropdown opened');
    } catch (e) { rec('physical-allocation/allocation-filters', 'ERROR', String(e?.message || e)); }

    // Action — click first row action (e.g. Allocate / View)
    try {
      if (struct.rowCount > 0 && struct.rowActions && struct.rowActions.length > 0) {
        const actBtn = page.locator('tbody tr:first-child button, tbody tr:first-child a, tbody tr:first-child [role="button"]').first();
        if (await actBtn.count() > 0) {
          // Listen for navigation/new page
          const ctx = page.context();
          const navPromise = page.waitForURL(url => !url.toString().endsWith('/physical-allocation'), { timeout: 3000 }).catch(() => null);
          await actBtn.scrollIntoViewIfNeeded();
          await actBtn.click({ force: true });
          await settle(page, 2000);
          await navPromise;
          const out = path.join(outDir, 'allocation-action.png');
          const r = await shot(page, out);
          const after = page.url();
          rec('physical-allocation/allocation-action', 'CAPTURED', `Action clicked; URL now: ${after}`, { file: r.path, bytes: r.bytes, urlAfter: after });
          // Navigate back
          if (after !== URLS.allocation) {
            await page.goto(URLS.allocation, { waitUntil: 'domcontentloaded' });
            await settle(page, 1500);
          } else {
            await dismissOverlays(page);
          }
        } else {
          rec('physical-allocation/allocation-action', 'NOT_FOUND', 'No action button');
        }
      } else {
        // Maybe this is a search-first page — try entering a customer name/mobile
        const searchInput = page.locator('input[placeholder*="Search" i], input[placeholder*="Customer" i], input[placeholder*="Mobile" i], input[type="tel"], input[type="search"]').first();
        if (await searchInput.count() > 0) {
          await searchInput.fill('8888888888');
          await settle(page, 1500);
          // Submit search
          await page.keyboard.press('Enter').catch(() => {});
          await settle(page, 2500);
          const out = path.join(outDir, 'allocation-action.png');
          const r = await shot(page, out);
          rec('physical-allocation/allocation-action', 'CAPTURED', 'Customer-search page — entered mobile and submitted', { file: r.path, bytes: r.bytes });
        } else {
          rec('physical-allocation/allocation-action', 'SKIPPED', 'No table rows and no search input');
        }
      }
    } catch (e) { rec('physical-allocation/allocation-action', 'ERROR', String(e?.message || e)); }
  } catch (e) {
    rec('physical-allocation/module', 'ERROR', String(e?.message || e));
  }
}

// ===================================================================
// MODULE 4 — TOWER HEATMAP
// ===================================================================
async function captureTowerHeatmap(page) {
  const outDir = path.join(VM, 'tower-heatmap');
  ensureDir(outDir);
  console.log('\n=== MODULE 4: Tower Heatmap ===');

  try {
    await page.goto(URLS.towers, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 3000);
    if (/\/login/i.test(page.url())) { rec('tower-heatmap/all', 'AUTH_FAILED', 'Redirected to login'); return; }

    {
      const out = path.join(outDir, 'heatmap-loaded.png');
      const r = await shotFull(page, out);
      rec('tower-heatmap/heatmap-loaded', 'CAPTURED', `URL ${page.url()}`, { file: r.path, bytes: r.bytes });
    }

    const struct = await page.evaluate(() => {
      const out = { url: location.href };
      out.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`).filter(s => s.length > 1).slice(0, 15);
      // Identify tower selectors (could be tabs, cards, dropdowns)
      out.towerCandidates = Array.from(document.querySelectorAll('button, .ant-tabs-tab, [role="tab"], [class*="tower" i]'))
        .map(t => ({ tag: t.tagName, text: (t.innerText || '').trim().slice(0, 60), cls: (t.className || '').toString().slice(0, 80) }))
        .filter(t => t.text.length > 0 && t.text.length < 60).slice(0, 30);
      // Grid cells (units)
      out.cellCandidates = Array.from(document.querySelectorAll('[class*="unit" i], [class*="cell" i], [class*="flat" i], svg rect, .heatmap-cell'))
        .slice(0, 20).map(c => ({ tag: c.tagName, cls: (c.className?.baseVal || c.className || '').toString().slice(0, 80), text: (c.innerText || '').trim().slice(0, 30) }));
      // Legend / status colors
      out.legendCandidates = Array.from(document.querySelectorAll('[class*="legend" i], [class*="status" i], [class*="badge" i]'))
        .map(l => ({ text: (l.innerText || '').trim().slice(0, 60), cls: (l.className || '').toString().slice(0, 80) })).filter(l => l.text).slice(0, 15);
      out.filters = Array.from(document.querySelectorAll('.ant-select, [class*="filter" i] button'))
        .map(f => (f.innerText || '').trim()).filter(Boolean).slice(0, 15);
      out.bodySnippet = document.body.innerText.slice(0, 1500);
      return out;
    }).catch(e => ({ err: String(e?.message || e) }));
    fs.writeFileSync(path.join(outDir, '_heatmap-dom-inspect.json'), JSON.stringify(struct, null, 2));
    console.log('  DOM inspect saved.');

    // Tower selected
    try {
      const towerBtn = page.locator('.ant-tabs-tab, [role="tab"], [class*="tower-card" i], [class*="towerCard" i]').first();
      let clicked = false;
      if (await towerBtn.count() > 0) {
        await towerBtn.scrollIntoViewIfNeeded();
        await towerBtn.click({ force: true });
        await settle(page, 2000);
        clicked = true;
      }
      if (!clicked) {
        // Try clicking on any button that looks like a tower name (T1, T2, A, B, etc.)
        const towerNameBtn = page.locator('button').filter({ hasText: /^(T-?\d|Tower\s*\d|[A-Z])$/i }).first();
        if (await towerNameBtn.count() > 0) {
          await towerNameBtn.click({ force: true });
          await settle(page, 2000);
          clicked = true;
        }
      }
      const out = path.join(outDir, 'heatmap-tower-selected.png');
      const r = await shotFull(page, out);
      rec('tower-heatmap/heatmap-tower-selected', clicked ? 'CAPTURED' : 'CAPTURED_FALLBACK', clicked ? 'Tower clicked' : 'No tower button — captured default state', { file: r.path, bytes: r.bytes });
    } catch (e) { rec('tower-heatmap/heatmap-tower-selected', 'ERROR', String(e?.message || e)); }

    // Unit hover
    try {
      const unitCell = page.locator('[class*="unit" i]:not([class*="units"]):not([class*="unit-list"]), [class*="cell" i], svg rect, [class*="flat" i]').first();
      if (await unitCell.count() > 0) {
        await unitCell.scrollIntoViewIfNeeded();
        await unitCell.hover({ force: true });
        await settle(page, 1500);
        const out = path.join(outDir, 'heatmap-unit-hover.png');
        const r = await shot(page, out);
        const tooltipText = await page.evaluate(() => {
          const tt = document.querySelector('.ant-tooltip-content, [role="tooltip"], [class*="tooltip" i]:not([class*="hidden"])');
          return tt ? (tt.innerText || '').slice(0, 300) : '';
        }).catch(() => '');
        rec('tower-heatmap/heatmap-unit-hover', 'CAPTURED', `Tooltip: "${tooltipText}"`, { file: r.path, bytes: r.bytes, tooltipText });
      } else {
        rec('tower-heatmap/heatmap-unit-hover', 'NOT_FOUND', 'No unit cell located');
      }
    } catch (e) { rec('tower-heatmap/heatmap-unit-hover', 'ERROR', String(e?.message || e)); }

    // Unit click -> detail panel/modal
    try {
      const unitCell = page.locator('[class*="unit" i]:not([class*="units"]):not([class*="unit-list"]), [class*="cell" i], svg rect, [class*="flat" i]').first();
      if (await unitCell.count() > 0) {
        await unitCell.click({ force: true });
        await settle(page, 2000);
        const out = path.join(outDir, 'heatmap-unit-click.png');
        const r = await shot(page, out);
        const detail = await page.evaluate(() => {
          const m = document.querySelector('.ant-modal-content, [role="dialog"], .ant-drawer-body, [class*="detail" i]:not([class*="hidden"])');
          return m ? (m.innerText || '').slice(0, 500) : '';
        }).catch(() => '');
        rec('tower-heatmap/heatmap-unit-click', 'CAPTURED', `Detail: "${detail.slice(0,120)}"`, { file: r.path, bytes: r.bytes, detail });
        await dismissOverlays(page);
      } else {
        rec('tower-heatmap/heatmap-unit-click', 'NOT_FOUND', 'No unit cell located');
      }
    } catch (e) { rec('tower-heatmap/heatmap-unit-click', 'ERROR', String(e?.message || e)); }

    // Filter open
    try {
      const filterCandidates = page.locator('.ant-select, button:has-text("Filter"), button:has-text("Status"), button:has-text("Type")');
      const cnt = await filterCandidates.count();
      let captured = false;
      for (let i = 0; i < Math.min(cnt, 5); i++) {
        const el = filterCandidates.nth(i);
        try {
          await el.scrollIntoViewIfNeeded();
          await el.click();
          await settle(page, 900);
          const open = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden), [role="listbox"], .ant-dropdown:not(.ant-dropdown-hidden)').count();
          if (open > 0) {
            const out = path.join(outDir, 'heatmap-filter.png');
            const r = await shot(page, out);
            const opts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option, .ant-dropdown:not(.ant-dropdown-hidden) [role="menuitem"]').allInnerTexts().catch(() => []);
            rec('tower-heatmap/heatmap-filter', 'CAPTURED', `Filter opened with ${opts.length} option(s)`, { file: r.path, bytes: r.bytes, options: opts });
            captured = true;
            await dismissOverlays(page);
            break;
          }
          await dismissOverlays(page);
        } catch (_) {}
      }
      if (!captured) rec('tower-heatmap/heatmap-filter', 'NOT_FOUND', 'No filter dropdown opened');
    } catch (e) { rec('tower-heatmap/heatmap-filter', 'ERROR', String(e?.message || e)); }
  } catch (e) {
    rec('tower-heatmap/module', 'ERROR', String(e?.message || e));
  }
}

// ===================================================================
// MAIN
// ===================================================================
(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No SM auth file at', AUTH); process.exit(1); }

  const browser = await chromium.launch({ headless: true });

  // Module 1 — Login uses fresh context (unauthenticated)
  try { await captureLogin(browser); } catch (e) { console.error('Login capture FATAL:', e?.message || e); }

  // Modules 2-4 use authenticated context
  const context = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  const page = await context.newPage();

  try {
    await inspectSidebar(page);
    await captureCallback(page);
    await captureAllocation(page);
    await captureTowerHeatmap(page);
  } catch (e) {
    console.error('FATAL:', e?.message || e);
  } finally {
    fs.writeFileSync(
      path.join(__dirname, '_capture-sm-4modules-results.json'),
      JSON.stringify(results, null, 2)
    );
    console.log('\nResults written: scripts/_capture-sm-4modules-results.json');
    await context.close();
    await browser.close();
  }
})();
