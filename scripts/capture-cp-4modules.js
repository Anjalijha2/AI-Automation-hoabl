// scripts/capture-cp-4modules.js
//
// Capture all missing UI states for CP Portal — 4 modules:
//   1. Login        — login-success-dashboard.png (post-auth landing)
//   2. Customer Reg / Home Dashboard — 8 states (NRI/Indian, validations, search, dropdowns)
//   3. Leads Management — 7 states (dropdowns, search, share/copy actions)
//   4. JBP Submission   — tabs + form states (cycle may be OPEN or CLOSED)
//
// Uses storageState from automation-repository/fixtures/.auth/channel-partner.json
// (fresh OTP just consumed; JWT exp ~24h from 2026-06-05T05:48Z)

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'channel-partner.json');
const VM   = path.join(ROOT, 'visual-memory', 'cp');
const VIEWPORT = { width: 1920, height: 900 };

const URLS = {
  dashboard: 'https://uat-web.xrportal.in/dashboard',
  leads:     'https://uat-web.xrportal.in/leads',
  jbp:       'https://uat-web.xrportal.in/jbp',
};

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note }, extra || {});
  console.log(`[${status.padEnd(12)}] ${key} — ${note}`);
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
  const full = path.join(outFile);
  await page.screenshot({ path: full, fullPage: true });
  const stat = fs.statSync(full);
  return { path: full, bytes: stat.size };
}

async function shot(page, outFile) {
  await page.screenshot({ path: outFile, fullPage: false });
  const stat = fs.statSync(outFile);
  return { path: outFile, bytes: stat.size };
}

// ===================================================================
// MODULE 1 — LOGIN SUCCESS DASHBOARD
// ===================================================================
async function captureLoginSuccess(page) {
  const outDir = path.join(VM, 'login');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  console.log('\n=== MODULE 1: Login Success Dashboard ===');
  try {
    await page.goto(URLS.dashboard, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    const finalUrl = page.url();
    if (/\/login/i.test(finalUrl)) {
      rec('login/login-success-dashboard', 'AUTH_FAILED', `Redirected to ${finalUrl} — session not honored`);
      return;
    }
    const out = path.join(outDir, 'login-success-dashboard.png');
    const r = await shot(page, out);
    rec('login/login-success-dashboard', 'CAPTURED', `Landing at ${finalUrl}`, { file: r.path, bytes: r.bytes });
  } catch (e) {
    rec('login/login-success-dashboard', 'ERROR', String(e?.message || e));
  }
}

// ===================================================================
// MODULE 2 — CUSTOMER REGISTRATION (HOME DASHBOARD)
// ===================================================================
async function captureCustomerRegistration(page) {
  const outDir = path.join(VM, 'customer-registration');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  console.log('\n=== MODULE 2: Customer Registration / Home Dashboard ===');

  try {
    await page.goto(URLS.dashboard, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    if (/\/login/i.test(page.url())) {
      rec('customer-registration/all', 'AUTH_FAILED', 'Redirected to login');
      return;
    }

    // 1. Dashboard loaded — full page
    {
      const out = path.join(outDir, 'dashboard-loaded.png');
      const r = await shotFull(page, out);
      rec('customer-registration/dashboard-loaded', 'CAPTURED', 'Full page', { file: r.path, bytes: r.bytes });
    }

    // Inspect DOM for structural notes
    const struct = await page.evaluate(() => {
      const out = { url: location.href, headings: [], radios: [], inputs: [], buttons: [], links: [] };
      out.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`).filter(s => s.length > 4).slice(0, 30);
      out.radios = Array.from(document.querySelectorAll('input[type="radio"], .ant-radio-input')).map(r => ({
        value: r.value || r.getAttribute('value') || '',
        name : r.name || r.getAttribute('name') || '',
        labelText: (r.closest('label')?.innerText || '').trim().slice(0, 80),
      })).slice(0, 20);
      out.inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="tel"], input[type="search"], input:not([type])')).map(i => ({
        name: i.name || i.getAttribute('name') || '',
        placeholder: i.placeholder || '',
        id: i.id || '',
        ariaLabel: i.getAttribute('aria-label') || '',
      })).slice(0, 30);
      out.buttons = Array.from(document.querySelectorAll('button')).map(b => (b.innerText || '').trim()).filter(Boolean).slice(0, 40);
      return out;
    }).catch(e => ({ err: String(e?.message || e) }));
    fs.writeFileSync(path.join(outDir, '_dashboard-dom-inspect.json'), JSON.stringify(struct, null, 2));
    console.log('  DOM inspect saved');

    // 2. Click NRI radio
    try {
      const nriRadio = page.locator('label:has-text("NRI") input[type="radio"], label:has-text("NRI")').first();
      if (await nriRadio.count() > 0) {
        await nriRadio.scrollIntoViewIfNeeded();
        await nriRadio.click();
        await settle(page, 800);
        const out = path.join(outDir, 'dashboard-nri-selected.png');
        const r = await shot(page, out);
        rec('customer-registration/dashboard-nri-selected', 'CAPTURED', 'NRI radio active', { file: r.path, bytes: r.bytes });
      } else {
        rec('customer-registration/dashboard-nri-selected', 'NOT_FOUND', 'NRI radio not located');
      }
    } catch (e) { rec('customer-registration/dashboard-nri-selected', 'ERROR', String(e?.message || e)); }

    // 3. Click Indian National radio
    try {
      const inRadio = page.locator('label:has-text("Indian National") input[type="radio"], label:has-text("Indian National")').first();
      if (await inRadio.count() > 0) {
        await inRadio.scrollIntoViewIfNeeded();
        await inRadio.click();
        await settle(page, 800);
        const out = path.join(outDir, 'dashboard-indian-national-selected.png');
        const r = await shot(page, out);
        rec('customer-registration/dashboard-indian-national-selected', 'CAPTURED', 'Indian National radio active', { file: r.path, bytes: r.bytes });
      } else {
        rec('customer-registration/dashboard-indian-national-selected', 'NOT_FOUND', 'Indian National radio not located');
      }
    } catch (e) { rec('customer-registration/dashboard-indian-national-selected', 'ERROR', String(e?.message || e)); }

    // 4. Empty mobile + click Create Lead -> validation
    try {
      // Ensure mobile field is empty
      const mobileInput = page.locator('input[placeholder*="Mobile" i], input[name*="mobile" i], input[type="tel"]').first();
      if (await mobileInput.count() > 0) {
        await mobileInput.fill('');
        await settle(page, 300);
      }
      const createBtn = page.locator('button:has-text("Create Lead")').first();
      if (await createBtn.count() > 0) {
        await createBtn.click();
        await settle(page, 1000);
        const out = path.join(outDir, 'dashboard-create-lead-validation.png');
        const r = await shot(page, out);
        rec('customer-registration/dashboard-create-lead-validation', 'CAPTURED', 'Validation on empty', { file: r.path, bytes: r.bytes });
      } else {
        rec('customer-registration/dashboard-create-lead-validation', 'NOT_FOUND', 'Create Lead button not located');
      }
    } catch (e) { rec('customer-registration/dashboard-create-lead-validation', 'ERROR', String(e?.message || e)); }

    // 5. Invalid mobile "123"
    try {
      const mobileInput = page.locator('input[placeholder*="Mobile" i], input[name*="mobile" i], input[type="tel"]').first();
      if (await mobileInput.count() > 0) {
        await mobileInput.fill('');
        await mobileInput.fill('123');
        await settle(page, 300);
        const createBtn = page.locator('button:has-text("Create Lead")').first();
        if (await createBtn.count() > 0) {
          await createBtn.click();
          await settle(page, 1000);
          const out = path.join(outDir, 'dashboard-create-lead-invalid-mobile.png');
          const r = await shot(page, out);
          rec('customer-registration/dashboard-create-lead-invalid-mobile', 'CAPTURED', 'Invalid mobile validation', { file: r.path, bytes: r.bytes });
        }
        // clear after
        await mobileInput.fill('');
        await settle(page, 300);
      }
    } catch (e) { rec('customer-registration/dashboard-create-lead-invalid-mobile', 'ERROR', String(e?.message || e)); }

    // 6. Search Customer "Sanket"
    try {
      const searchInput = page.locator('input[placeholder*="Search Customer" i], input[placeholder*="Search" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('');
        await searchInput.fill('Sanket');
        await settle(page, 2500); // wait for debounced search
        const out = path.join(outDir, 'dashboard-customers-search-result.png');
        const r = await shotFull(page, out);
        rec('customer-registration/dashboard-customers-search-result', 'CAPTURED', 'Filtered customers', { file: r.path, bytes: r.bytes });
      } else {
        rec('customer-registration/dashboard-customers-search-result', 'NOT_FOUND', 'Search Customer input not located');
      }
    } catch (e) { rec('customer-registration/dashboard-customers-search-result', 'ERROR', String(e?.message || e)); }

    // 7. Search "ZZNOTFOUND"
    try {
      const searchInput = page.locator('input[placeholder*="Search Customer" i], input[placeholder*="Search" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('');
        await searchInput.fill('ZZNOTFOUND');
        await settle(page, 2500);
        const out = path.join(outDir, 'dashboard-customers-search-no-result.png');
        const r = await shotFull(page, out);
        rec('customer-registration/dashboard-customers-search-no-result', 'CAPTURED', 'No-result state', { file: r.path, bytes: r.bytes });
        await searchInput.fill('');
        await settle(page, 800);
      }
    } catch (e) { rec('customer-registration/dashboard-customers-search-no-result', 'ERROR', String(e?.message || e)); }

    // 8. All Team Leads dropdown open
    try {
      const teamLeadsSel = page.locator('.ant-select:has(.ant-select-selection-item:has-text("Team Leads")), .ant-select:has(.ant-select-selection-placeholder:has-text("Team Leads")), :text("All Team Leads")').first();
      if (await teamLeadsSel.count() > 0) {
        await teamLeadsSel.scrollIntoViewIfNeeded();
        await teamLeadsSel.click();
        await settle(page, 1000);
        const out = path.join(outDir, 'dashboard-team-leads-dropdown.png');
        const r = await shot(page, out);
        // Capture dropdown options text
        const opts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allInnerTexts().catch(() => []);
        rec('customer-registration/dashboard-team-leads-dropdown', 'CAPTURED', `Open dropdown with ${opts.length} option(s)`, { file: r.path, bytes: r.bytes, options: opts });
        await dismissOverlays(page);
      } else {
        rec('customer-registration/dashboard-team-leads-dropdown', 'NOT_FOUND', 'Team Leads dropdown not located');
      }
    } catch (e) { rec('customer-registration/dashboard-team-leads-dropdown', 'ERROR', String(e?.message || e)); }
  } catch (e) {
    rec('customer-registration/module', 'ERROR', String(e?.message || e));
  }
}

// ===================================================================
// MODULE 3 — LEADS MANAGEMENT
// ===================================================================
async function captureLeads(page) {
  const outDir = path.join(VM, 'leads-management');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  console.log('\n=== MODULE 3: Leads Management ===');

  try {
    await page.goto(URLS.leads, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    if (/\/login/i.test(page.url())) {
      rec('leads-management/all', 'AUTH_FAILED', 'Redirected to login');
      return;
    }

    // 1. Loaded
    {
      const out = path.join(outDir, 'leads-loaded.png');
      const r = await shotFull(page, out);
      rec('leads-management/leads-loaded', 'CAPTURED', 'Full page', { file: r.path, bytes: r.bytes });
    }

    // DOM inspect
    const struct = await page.evaluate(() => {
      const out = { url: location.href };
      out.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`).filter(s => s.length > 4).slice(0, 20);
      out.tableHeaders = Array.from(document.querySelectorAll('thead th, .ant-table-thead th')).map(th => (th.innerText || '').trim());
      out.firstRowText = (document.querySelector('tbody tr')?.innerText || '').slice(0, 500);
      out.actionButtonsInRow = Array.from(document.querySelectorAll('tbody tr:first-child button, tbody tr:first-child a, tbody tr:first-child [role="button"]')).map(b => ({
        tag: b.tagName,
        text: (b.innerText || '').trim(),
        aria: b.getAttribute('aria-label') || '',
        cls: (b.className || '').toString().slice(0, 100),
        title: b.getAttribute('title') || '',
      }));
      out.inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        placeholder: i.placeholder || '', type: i.type, name: i.name || '',
      })).slice(0, 20);
      return out;
    }).catch(e => ({ err: String(e?.message || e) }));
    fs.writeFileSync(path.join(outDir, '_leads-dom-inspect.json'), JSON.stringify(struct, null, 2));
    console.log('  Leads DOM inspect saved');

    // 2. Status dropdown
    try {
      const statusSel = page.locator('.ant-select:has(.ant-select-selection-item:has-text("Status")), .ant-select:has(.ant-select-selection-placeholder:has-text("Status")), .ant-select:has(.ant-select-selection-item:has-text("All Status"))').first();
      if (await statusSel.count() > 0) {
        await statusSel.click();
        await settle(page, 900);
        const out = path.join(outDir, 'leads-status-dropdown-open.png');
        const r = await shot(page, out);
        const opts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allInnerTexts().catch(() => []);
        rec('leads-management/leads-status-dropdown-open', 'CAPTURED', `${opts.length} status options`, { file: r.path, bytes: r.bytes, options: opts });
        await dismissOverlays(page);
      } else {
        rec('leads-management/leads-status-dropdown-open', 'NOT_FOUND', 'Status select not found');
      }
    } catch (e) { rec('leads-management/leads-status-dropdown-open', 'ERROR', String(e?.message || e)); }

    // 3. Team Leads dropdown
    try {
      const tlSel = page.locator('.ant-select:has(.ant-select-selection-item:has-text("Team Leads")), .ant-select:has(.ant-select-selection-placeholder:has-text("Team Leads")), :text("All Team Leads")').first();
      if (await tlSel.count() > 0) {
        await tlSel.click();
        await settle(page, 900);
        const out = path.join(outDir, 'leads-team-leads-dropdown-open.png');
        const r = await shot(page, out);
        const opts = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allInnerTexts().catch(() => []);
        rec('leads-management/leads-team-leads-dropdown-open', 'CAPTURED', `${opts.length} team-lead options`, { file: r.path, bytes: r.bytes, options: opts });
        await dismissOverlays(page);
      } else {
        rec('leads-management/leads-team-leads-dropdown-open', 'NOT_FOUND', 'Team Leads dropdown not found');
      }
    } catch (e) { rec('leads-management/leads-team-leads-dropdown-open', 'ERROR', String(e?.message || e)); }

    // 4. Search "Sanket"
    try {
      const searchInput = page.locator('input[placeholder*="Search Customer" i], input[placeholder*="Search" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('');
        await searchInput.fill('Sanket');
        await settle(page, 2500);
        const out = path.join(outDir, 'leads-search-result.png');
        const r = await shotFull(page, out);
        rec('leads-management/leads-search-result', 'CAPTURED', 'Filtered by Sanket', { file: r.path, bytes: r.bytes });
      } else {
        rec('leads-management/leads-search-result', 'NOT_FOUND', 'Search input not located');
      }
    } catch (e) { rec('leads-management/leads-search-result', 'ERROR', String(e?.message || e)); }

    // 5. Search "ZZNOTFOUND"
    try {
      const searchInput = page.locator('input[placeholder*="Search Customer" i], input[placeholder*="Search" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('');
        await searchInput.fill('ZZNOTFOUND');
        await settle(page, 2500);
        const out = path.join(outDir, 'leads-search-no-match.png');
        const r = await shotFull(page, out);
        rec('leads-management/leads-search-no-match', 'CAPTURED', 'Empty state', { file: r.path, bytes: r.bytes });
        await searchInput.fill('');
        await settle(page, 1500);
      }
    } catch (e) { rec('leads-management/leads-search-no-match', 'ERROR', String(e?.message || e)); }

    // 6. Share action — track new pages, modals, toasts
    try {
      // Re-ensure rows visible (clear search)
      const si = page.locator('input[placeholder*="Search" i]').first();
      if (await si.count() > 0) { await si.fill(''); await settle(page, 1500); }

      // Listen for new pages BEFORE clicking
      const ctx = page.context();
      const newPagePromise = ctx.waitForEvent('page', { timeout: 3000 }).catch(() => null);

      // Find share icon in first row — try multiple heuristics
      const shareCandidates = [
        'tbody tr:first-child button[aria-label*="share" i]',
        'tbody tr:first-child [title*="share" i]',
        'tbody tr:first-child svg[data-icon*="share" i]',
        'tbody tr:first-child [class*="share" i]',
      ];
      let clicked = false;
      let clickedSelector = '';
      for (const sel of shareCandidates) {
        const el = page.locator(sel).first();
        if (await el.count() > 0) {
          await el.scrollIntoViewIfNeeded();
          await el.click({ force: true });
          clicked = true;
          clickedSelector = sel;
          break;
        }
      }
      if (!clicked) {
        // Fallback: third-to-last interactive icon in first row (common pattern: 3 icons — view, share, copy)
        const allActions = page.locator('tbody tr:first-child td:last-child button, tbody tr:first-child td:last-child a, tbody tr:first-child td:last-child [role="button"]');
        const cnt = await allActions.count();
        if (cnt >= 2) {
          // Try the 2nd-from-last action as share
          await allActions.nth(Math.max(0, cnt - 2)).click({ force: true });
          clicked = true;
          clickedSelector = `tbody tr:first-child td:last-child action[nth=${cnt - 2}]`;
        }
      }
      if (clicked) {
        await settle(page, 1500);
        const newPage = await newPagePromise;
        if (newPage) {
          await newPage.waitForLoadState('domcontentloaded').catch(() => {});
          rec('leads-management/leads-share-action', 'NEW_TAB', `New tab opened: ${newPage.url()}`, { triggerSelector: clickedSelector, newTabUrl: newPage.url() });
          // Screenshot of the original page (showing toast/state if any) and the new tab
          const out = path.join(outDir, 'leads-share-action.png');
          const r = await shot(page, out);
          results['leads-management/leads-share-action'].file = r.path;
          results['leads-management/leads-share-action'].bytes = r.bytes;
          await newPage.close();
        } else {
          // Check for modal
          const modal = page.locator('.ant-modal-content, [role="dialog"]').first();
          const toast = page.locator('.Toastify__toast, [class*="toast" i]').first();
          const out = path.join(outDir, 'leads-share-action.png');
          const r = await shot(page, out);
          let detail = 'No new tab; ';
          if (await modal.count() > 0) {
            const t = await modal.innerText().catch(() => '');
            detail += `modal shown — "${t.slice(0, 120)}"`;
          } else if (await toast.count() > 0) {
            const t = await toast.innerText().catch(() => '');
            detail += `toast shown — "${t.slice(0, 120)}"`;
          } else {
            detail += 'no modal or toast detected within 1.5s';
          }
          rec('leads-management/leads-share-action', 'CAPTURED', detail, { file: r.path, bytes: r.bytes, triggerSelector: clickedSelector });
          await dismissOverlays(page);
        }
      } else {
        rec('leads-management/leads-share-action', 'NOT_FOUND', 'No share icon located in first row');
      }
    } catch (e) { rec('leads-management/leads-share-action', 'ERROR', String(e?.message || e)); }

    // 7. Copy action
    try {
      // Grant clipboard permissions
      const ctx = page.context();
      await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'https://uat-web.xrportal.in' }).catch(() => {});

      const copyCandidates = [
        'tbody tr:first-child button[aria-label*="copy" i]',
        'tbody tr:first-child [title*="copy" i]',
        'tbody tr:first-child svg[data-icon*="copy" i]',
      ];
      let clicked = false;
      let clickedSelector = '';
      for (const sel of copyCandidates) {
        const el = page.locator(sel).first();
        if (await el.count() > 0) {
          await el.scrollIntoViewIfNeeded();
          await el.click({ force: true });
          clicked = true;
          clickedSelector = sel;
          break;
        }
      }
      if (!clicked) {
        // Fallback: last action icon as copy
        const allActions = page.locator('tbody tr:first-child td:last-child button, tbody tr:first-child td:last-child a, tbody tr:first-child td:last-child [role="button"]');
        const cnt = await allActions.count();
        if (cnt >= 1) {
          await allActions.nth(cnt - 1).click({ force: true });
          clicked = true;
          clickedSelector = `tbody tr:first-child td:last-child action[nth=${cnt - 1}]`;
        }
      }
      if (clicked) {
        // Capture immediately to grab fleeting toast
        await page.waitForTimeout(400);
        const out = path.join(outDir, 'leads-copy-action.png');
        const r = await shot(page, out);
        const toast = page.locator('.Toastify__toast, [class*="toast" i]').first();
        let toastText = '';
        if (await toast.count() > 0) toastText = (await toast.innerText().catch(() => '')).slice(0, 200);
        rec('leads-management/leads-copy-action', 'CAPTURED', toastText ? `Toast: "${toastText}"` : 'No toast detected within 400ms', { file: r.path, bytes: r.bytes, triggerSelector: clickedSelector, toastText });
        await dismissOverlays(page);
      } else {
        rec('leads-management/leads-copy-action', 'NOT_FOUND', 'No copy icon located in first row');
      }
    } catch (e) { rec('leads-management/leads-copy-action', 'ERROR', String(e?.message || e)); }
  } catch (e) {
    rec('leads-management/module', 'ERROR', String(e?.message || e));
  }
}

// ===================================================================
// MODULE 4 — JBP SUBMISSION
// ===================================================================
async function captureJbp(page) {
  const outDir = path.join(VM, 'jbp-submission');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  console.log('\n=== MODULE 4: JBP Submission ===');

  try {
    await page.goto(URLS.jbp, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    if (/\/login/i.test(page.url())) {
      rec('jbp-submission/all', 'AUTH_FAILED', 'Redirected to login');
      return;
    }

    // 1. JBP loaded
    {
      const out = path.join(outDir, 'jbp-loaded.png');
      const r = await shotFull(page, out);
      rec('jbp-submission/jbp-loaded', 'CAPTURED', 'Full page', { file: r.path, bytes: r.bytes });
    }

    // Inspect for cycle state and tabs
    const jbpState = await page.evaluate(() => {
      const text = (document.body.innerText || '');
      const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, [role="tab"]'))
        .map(t => ({ text: (t.innerText || '').trim(), active: /ant-tabs-tab-active|aria-selected="true"/.test(t.outerHTML) }));
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(h => `${h.tagName}: ${(h.innerText || '').trim()}`);
      const isOpen   = /(submission is now open|cycle is open|cycle.*open|submit.*jbp|enter.*data)/i.test(text);
      const isClosed = /(cycle is closed|submission.*closed|currently closed|no.*active.*cycle|cycle.*ended)/i.test(text);
      const buttons = Array.from(document.querySelectorAll('button')).map(b => (b.innerText || '').trim()).filter(Boolean).slice(0, 30);
      const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(i => ({
        tag: i.tagName, name: i.name || '', type: i.type || '', placeholder: i.placeholder || '', id: i.id || '',
      })).slice(0, 40);
      return { tabs, headings, isOpen, isClosed, buttons, inputs, textSnippet: text.slice(0, 2500) };
    }).catch(e => ({ err: String(e?.message || e) }));
    fs.writeFileSync(path.join(outDir, '_jbp-dom-inspect.json'), JSON.stringify(jbpState, null, 2));
    const cycleStatus = jbpState.isOpen ? 'OPEN' : (jbpState.isClosed ? 'CLOSED' : 'UNKNOWN');
    console.log(`  JBP cycle state: ${cycleStatus}`);
    console.log(`  JBP tabs: ${JSON.stringify((jbpState.tabs || []).map(t => t.text))}`);

    // Helper: click tab by text
    async function clickTab(textRe) {
      const tab = page.locator(`.ant-tabs-tab:has-text("${textRe}"), [role="tab"]:has-text("${textRe}")`).first();
      if (await tab.count() === 0) return false;
      await tab.scrollIntoViewIfNeeded();
      await tab.click();
      await settle(page, 1500);
      return true;
    }

    // 2. Current Cycle Entry tab
    try {
      const ok = await clickTab('Current Cycle');
      if (ok) {
        const out = path.join(outDir, 'jbp-current-cycle-tab.png');
        const r = await shotFull(page, out);
        rec('jbp-submission/jbp-current-cycle-tab', 'CAPTURED', `Cycle state: ${cycleStatus}`, { file: r.path, bytes: r.bytes });
      } else {
        // Maybe single page — capture initial as current cycle proxy
        const out = path.join(outDir, 'jbp-current-cycle-tab.png');
        const r = await shotFull(page, out);
        rec('jbp-submission/jbp-current-cycle-tab', 'CAPTURED_FALLBACK', `No Current Cycle tab; captured page (cycle state: ${cycleStatus})`, { file: r.path, bytes: r.bytes });
      }
    } catch (e) { rec('jbp-submission/jbp-current-cycle-tab', 'ERROR', String(e?.message || e)); }

    // 3. Open cycle form (only if open)
    if (cycleStatus === 'OPEN' || cycleStatus === 'UNKNOWN') {
      try {
        // Look for form fields
        const formCheck = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input, textarea, select');
          return inputs.length;
        });
        if (formCheck > 0) {
          const out = path.join(outDir, 'jbp-open-cycle-form.png');
          const r = await shotFull(page, out);
          rec('jbp-submission/jbp-open-cycle-form', 'CAPTURED', `${formCheck} input(s) on form`, { file: r.path, bytes: r.bytes });
        } else {
          rec('jbp-submission/jbp-open-cycle-form', 'NOT_APPLICABLE', `No inputs visible — cycle likely closed (state: ${cycleStatus})`);
        }
      } catch (e) { rec('jbp-submission/jbp-open-cycle-form', 'ERROR', String(e?.message || e)); }
    } else {
      rec('jbp-submission/jbp-open-cycle-form', 'NOT_APPLICABLE', `Cycle is ${cycleStatus} — no form to capture`);
    }

    // 4. JBP History tab
    try {
      const ok = await clickTab('History');
      if (ok) {
        const out = path.join(outDir, 'jbp-history-tab.png');
        const r = await shotFull(page, out);
        const rowsCount = await page.locator('tbody tr, .ant-table-row').count().catch(() => 0);
        rec('jbp-submission/jbp-history-tab', 'CAPTURED', `${rowsCount} row(s)`, { file: r.path, bytes: r.bytes });
      } else {
        rec('jbp-submission/jbp-history-tab', 'NOT_FOUND', 'History tab not found');
      }
    } catch (e) { rec('jbp-submission/jbp-history-tab', 'ERROR', String(e?.message || e)); }

    // 5. Edit Requests tab
    try {
      const ok = await clickTab('Edit Request');
      if (ok) {
        const out = path.join(outDir, 'jbp-edit-requests-tab.png');
        const r = await shotFull(page, out);
        const rowsCount = await page.locator('tbody tr, .ant-table-row').count().catch(() => 0);
        rec('jbp-submission/jbp-edit-requests-tab', 'CAPTURED', `${rowsCount} row(s)`, { file: r.path, bytes: r.bytes });
      } else {
        rec('jbp-submission/jbp-edit-requests-tab', 'NOT_FOUND', 'Edit Requests tab not found');
      }
    } catch (e) { rec('jbp-submission/jbp-edit-requests-tab', 'ERROR', String(e?.message || e)); }

    // 6 & 7. If OPEN: form validation + filled state
    if (cycleStatus === 'OPEN') {
      try {
        await clickTab('Current Cycle');
        await settle(page, 1500);
        // Try to find submit button and click without filling
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
        if (await submitBtn.count() > 0) {
          await submitBtn.scrollIntoViewIfNeeded();
          await submitBtn.click({ force: true });
          await settle(page, 1500);
          const out = path.join(outDir, 'jbp-form-validation.png');
          const r = await shotFull(page, out);
          rec('jbp-submission/jbp-form-validation', 'CAPTURED', 'Empty submit attempt', { file: r.path, bytes: r.bytes });
        } else {
          rec('jbp-submission/jbp-form-validation', 'NOT_FOUND', 'No submit/save button visible');
        }
      } catch (e) { rec('jbp-submission/jbp-form-validation', 'ERROR', String(e?.message || e)); }

      try {
        // Fill numeric inputs with placeholder values
        const filled = await page.evaluate(() => {
          let n = 0;
          document.querySelectorAll('input[type="number"], input:not([type])').forEach((inp, idx) => {
            if (inp.disabled || inp.readOnly) return;
            inp.value = String(10 + idx);
            inp.dispatchEvent(new Event('input',  { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
            n++;
          });
          document.querySelectorAll('textarea').forEach(t => {
            t.value = 'Test data';
            t.dispatchEvent(new Event('input',  { bubbles: true }));
            t.dispatchEvent(new Event('change', { bubbles: true }));
          });
          return n;
        }).catch(() => 0);
        await settle(page, 1000);
        const out = path.join(outDir, 'jbp-form-filled.png');
        const r = await shotFull(page, out);
        rec('jbp-submission/jbp-form-filled', filled > 0 ? 'CAPTURED' : 'CAPTURED_EMPTY', `${filled} input(s) populated`, { file: r.path, bytes: r.bytes });
      } catch (e) { rec('jbp-submission/jbp-form-filled', 'ERROR', String(e?.message || e)); }
    } else {
      rec('jbp-submission/jbp-form-validation', 'NOT_APPLICABLE', `Cycle is ${cycleStatus}`);
      rec('jbp-submission/jbp-form-filled', 'NOT_APPLICABLE', `Cycle is ${cycleStatus}`);
    }

    results['_jbp_cycle_state'] = cycleStatus;
  } catch (e) {
    rec('jbp-submission/module', 'ERROR', String(e?.message || e));
  }
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No CP auth file at', AUTH); process.exit(1); }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  const page = await context.newPage();

  try {
    await captureLoginSuccess(page);
    await captureCustomerRegistration(page);
    await captureLeads(page);
    await captureJbp(page);
  } catch (e) {
    console.error('FATAL:', e?.message || e);
  } finally {
    fs.writeFileSync(
      path.join(__dirname, '_capture-cp-4modules-results.json'),
      JSON.stringify(results, null, 2)
    );
    console.log('\nResults written: scripts/_capture-cp-4modules-results.json');
    await context.close();
    await browser.close();
  }
})();
