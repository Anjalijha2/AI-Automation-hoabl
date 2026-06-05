// scripts/capture-sm-callback-modals.js
//
// Capture missing modal/drawer screenshots for SM Portal / Callback Requests:
//   1. Create Callback drawer (open + validation)
//   2. Schedule Meeting modal
//   3. Confirm Meeting modal
//   4. Feedback drawer
//   5. Status filter dropdown (column header filter)
//   6. Empty state (if achievable)
//
// Uses storageState from automation-repository/fixtures/.auth/sales-manager.json

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT  = path.join(ROOT, 'visual-memory', 'sm', 'callback-requests');
const VIEWPORT = { width: 1920, height: 900 };
const URL_CALLBACK = 'https://uat-web.xrportal.in/sales-manager/callback-requests';

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note }, extra || {});
  console.log(`[${status.padEnd(14)}] ${key} — ${note}`);
}

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }

async function shot(page, file) {
  const full = path.join(OUT, file);
  await page.screenshot({ path: full, fullPage: false });
  const stat = fs.statSync(full);
  return { path: full, bytes: stat.size };
}

async function dismissOverlays(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await settle(page, 300);
  await page.keyboard.press('Escape').catch(() => {});
  await settle(page, 300);
}

async function inspectModalDOM(page) {
  return await page.evaluate(() => {
    // Capture all visible modals/drawers
    const out = { modals: [], drawers: [], dropdowns: [] };
    document.querySelectorAll('.ant-modal:not(.ant-modal-hidden), .ant-modal-wrap:not([style*="display: none"]) .ant-modal').forEach(m => {
      const visible = m.offsetParent !== null && getComputedStyle(m).visibility !== 'hidden';
      if (!visible) return;
      const title = m.querySelector('.ant-modal-title')?.innerText?.trim() || '';
      const labels = [...m.querySelectorAll('label, .ant-form-item-label')].map(e => e.innerText.trim()).filter(Boolean);
      const inputs = [...m.querySelectorAll('input, textarea, select')].map(i => ({ tag: i.tagName.toLowerCase(), name: i.name || '', placeholder: i.placeholder || '', type: i.type || '', label: i.getAttribute('aria-label') || '' }));
      const buttons = [...m.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean);
      out.modals.push({ title, labels, inputs, buttons });
    });
    document.querySelectorAll('.ant-drawer-open, .ant-drawer[class*="open"], .ant-drawer:not([class*="hidden"]) .ant-drawer-content').forEach(d => {
      const visible = d.offsetParent !== null;
      if (!visible) return;
      const title = d.querySelector('.ant-drawer-title')?.innerText?.trim() || d.querySelector('h2,h3,h4')?.innerText?.trim() || '';
      const labels = [...d.querySelectorAll('label, .ant-form-item-label')].map(e => e.innerText.trim()).filter(Boolean);
      const inputs = [...d.querySelectorAll('input, textarea, select')].map(i => ({ tag: i.tagName.toLowerCase(), name: i.name || '', placeholder: i.placeholder || '', type: i.type || '', label: i.getAttribute('aria-label') || '' }));
      const radios = [...d.querySelectorAll('.ant-radio-wrapper, .ant-checkbox-wrapper')].map(r => r.innerText.trim()).filter(Boolean);
      const buttons = [...d.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean);
      const selects = [...d.querySelectorAll('.ant-select-selection-item, .ant-select-selection-placeholder')].map(s => s.innerText.trim()).filter(Boolean);
      out.drawers.push({ title, labels, inputs, radios, selects, buttons });
    });
    document.querySelectorAll('.ant-dropdown:not(.ant-dropdown-hidden), .ant-table-filter-dropdown:not([style*="display: none"])').forEach(d => {
      const visible = d.offsetParent !== null;
      if (!visible) return;
      const items = [...d.querySelectorAll('li, .ant-dropdown-menu-item, label, .ant-checkbox-wrapper')].map(i => i.innerText.trim()).filter(Boolean);
      out.dropdowns.push({ items: items.slice(0, 30) });
    });
    return out;
  });
}

async function run() {
  if (!fs.existsSync(AUTH)) {
    console.error(`Auth file not found: ${AUTH}`);
    process.exit(1);
  }
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ storageState: AUTH, viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  try {
    await page.goto(URL_CALLBACK, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2000);

    if (/\/login/i.test(page.url())) {
      rec('_auth', 'FAILED', `Redirected to login: ${page.url()}`);
      return;
    }
    rec('_auth', 'OK', `Landed at ${page.url()}`);

    // ============ 1. CREATE CALLBACK DRAWER ============
    try {
      const createBtn = page.locator('button:has-text("Create Callback")').first();
      if (await createBtn.count() === 0) {
        rec('callback-create-drawer', 'NOT_FOUND', 'Create Callback button not found');
      } else {
        await createBtn.click();
        await settle(page, 1500);
        const r = await shot(page, 'callback-create-drawer.png');
        const dom = await inspectModalDOM(page);
        rec('callback-create-drawer', 'CAPTURED', `Drawer captured`, { file: r.path, bytes: r.bytes, dom });

        // Validation — click Submit with empty fields
        try {
          const submitBtns = page.locator('.ant-drawer-open button:has-text("Submit"), .ant-drawer-open button:has-text("Save"), .ant-drawer-open button:has-text("Create"), .ant-drawer button:has-text("Submit"), .ant-drawer button:has-text("Save"), .ant-drawer button:has-text("Create")');
          const sc = await submitBtns.count();
          if (sc > 0) {
            await submitBtns.first().click();
            await settle(page, 1200);
            const r2 = await shot(page, 'callback-create-drawer-validation.png');
            const errs = await page.evaluate(() => [...document.querySelectorAll('.ant-form-item-explain, .ant-form-item-explain-error, [role="alert"]')].map(e => e.innerText.trim()).filter(Boolean));
            rec('callback-create-drawer-validation', 'CAPTURED', `Errors: ${JSON.stringify(errs.slice(0,10))}`, { file: r2.path, bytes: r2.bytes, errors: errs });
          } else {
            rec('callback-create-drawer-validation', 'NOT_FOUND', 'No submit button found in drawer');
          }
        } catch (e) { rec('callback-create-drawer-validation', 'ERROR', String(e?.message || e)); }

        // Close drawer
        const closeBtn = page.locator('.ant-drawer-close, .ant-drawer button[aria-label="Close"]').first();
        if (await closeBtn.count() > 0) await closeBtn.click().catch(() => {});
        await dismissOverlays(page);
        await settle(page, 800);
      }
    } catch (e) { rec('callback-create-drawer', 'ERROR', String(e?.message || e)); }

    // ============ 5. STATUS FILTER DROPDOWN ============
    try {
      // Find Status column header filter trigger
      const statusFilterTrigger = page.locator('th:has-text("Status") .ant-table-filter-trigger, th:has-text("Status") .ant-dropdown-trigger').first();
      if (await statusFilterTrigger.count() === 0) {
        // Try all filter triggers and find the one matching status column
        rec('callback-status-filter', 'NOT_FOUND_TRY_ALT', 'Direct status header trigger not found, trying alt');
        const allTriggers = page.locator('.ant-table-filter-trigger');
        const c = await allTriggers.count();
        let opened = false;
        for (let i = 0; i < c; i++) {
          const t = allTriggers.nth(i);
          // Check nearest th text
          const headerText = await t.evaluate(el => {
            let p = el.closest('th'); return p ? p.innerText.trim() : '';
          }).catch(() => '');
          if (/status/i.test(headerText)) {
            await t.click();
            await settle(page, 1000);
            const r = await shot(page, 'callback-status-filter.png');
            const dom = await inspectModalDOM(page);
            rec('callback-status-filter', 'CAPTURED', `Status filter opened (idx ${i}, header="${headerText}")`, { file: r.path, bytes: r.bytes, dom });
            opened = true;
            await dismissOverlays(page);
            break;
          }
        }
        if (!opened) rec('callback-status-filter', 'NOT_FOUND', 'No Status column filter trigger found among ' + c);
      } else {
        await statusFilterTrigger.click();
        await settle(page, 1000);
        const r = await shot(page, 'callback-status-filter.png');
        const dom = await inspectModalDOM(page);
        rec('callback-status-filter', 'CAPTURED', `Status filter dropdown`, { file: r.path, bytes: r.bytes, dom });
        await dismissOverlays(page);
      }
    } catch (e) { rec('callback-status-filter', 'ERROR', String(e?.message || e)); }

    await settle(page, 800);

    // ============ 2. SCHEDULE MEETING MODAL (row action) ============
    try {
      // Look for any per-row action buttons / links. Common patterns:
      //   - Actions column with icon buttons
      //   - Schedule link/button per row
      //   - Customer name link (might open meeting detail)
      const scheduleBtn = page.locator('button:has-text("Schedule"), a:has-text("Schedule")').first();
      if (await scheduleBtn.count() > 0) {
        await scheduleBtn.click();
        await settle(page, 1500);
        const r = await shot(page, 'callback-schedule-modal.png');
        const dom = await inspectModalDOM(page);
        rec('callback-schedule-modal', 'CAPTURED', `Schedule modal via direct button`, { file: r.path, bytes: r.bytes, dom });
        await dismissOverlays(page);
      } else {
        // Try clicking action icons in rows
        const actionsCells = page.locator('tbody tr td:last-child');
        const rowCount = await actionsCells.count();
        let scheduleFound = false;
        for (let i = 0; i < Math.min(rowCount, 8); i++) {
          const cell = actionsCells.nth(i);
          // Find buttons/icons in cell
          const buttons = cell.locator('button, [role="button"], a, svg, .ant-btn, .anticon');
          const bc = await buttons.count();
          if (bc === 0) continue;
          for (let b = 0; b < bc; b++) {
            const btn = buttons.nth(b);
            await btn.click({ trial: false, force: false }).catch(() => {});
            await settle(page, 1500);
            const dom = await inspectModalDOM(page);
            const visibleModal = dom.modals.find(m => /schedule/i.test(m.title)) || dom.drawers.find(d => /schedule/i.test(d.title));
            if (visibleModal) {
              const r = await shot(page, 'callback-schedule-modal.png');
              rec('callback-schedule-modal', 'CAPTURED', `via row ${i} action ${b}; title="${visibleModal.title}"`, { file: r.path, bytes: r.bytes, dom });
              scheduleFound = true;
              await dismissOverlays(page);
              break;
            }
            // Generic: any modal/drawer opened
            if (dom.modals.length > 0 || dom.drawers.length > 0) {
              const r = await shot(page, `callback-row${i}-action${b}-modal.png`);
              rec(`callback-row${i}-action${b}`, 'CAPTURED_OTHER', `Modal opened (not Schedule). Title="${(dom.modals[0]?.title||dom.drawers[0]?.title)}"`, { file: r.path, bytes: r.bytes, dom });
              await dismissOverlays(page);
            }
          }
          if (scheduleFound) break;
        }
        if (!scheduleFound) rec('callback-schedule-modal', 'NOT_FOUND', 'No Schedule Meeting button found in direct buttons or row actions');
      }
    } catch (e) { rec('callback-schedule-modal', 'ERROR', String(e?.message || e)); }

    await dismissOverlays(page);
    await settle(page, 800);

    // ============ 3. CONFIRM MEETING MODAL ============
    try {
      const confirmBtn = page.locator('button:has-text("Confirm Meeting"), a:has-text("Confirm Meeting"), button:has-text("Confirm")').first();
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click();
        await settle(page, 1500);
        const r = await shot(page, 'callback-confirm-modal.png');
        const dom = await inspectModalDOM(page);
        rec('callback-confirm-modal', 'CAPTURED', `Confirm modal`, { file: r.path, bytes: r.bytes, dom });
        await dismissOverlays(page);
      } else {
        rec('callback-confirm-modal', 'NOT_FOUND', 'No Confirm Meeting button found');
      }
    } catch (e) { rec('callback-confirm-modal', 'ERROR', String(e?.message || e)); }

    await dismissOverlays(page);
    await settle(page, 800);

    // ============ 4. FEEDBACK DRAWER ============
    try {
      // Find a row with "Meeting Done" status and try its Feedback action
      const fbBtn = page.locator('button:has-text("Feedback"), a:has-text("Feedback"), button:has-text("Submit Feedback"), a:has-text("Submit Feedback")').first();
      if (await fbBtn.count() > 0) {
        await fbBtn.click();
        await settle(page, 1500);
        const r = await shot(page, 'callback-feedback-drawer.png');
        const dom = await inspectModalDOM(page);
        rec('callback-feedback-drawer', 'CAPTURED', `Feedback drawer`, { file: r.path, bytes: r.bytes, dom });
        await dismissOverlays(page);
      } else {
        rec('callback-feedback-drawer', 'NOT_FOUND', 'No Feedback button found');
      }
    } catch (e) { rec('callback-feedback-drawer', 'ERROR', String(e?.message || e)); }

    // ============ 6. EMPTY STATE (try a filter that yields zero rows) ============
    try {
      const searchInput = page.locator('input[placeholder*="Search" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('ZZZZZNOMATCH123XYZ');
        await page.keyboard.press('Enter').catch(() => {});
        await settle(page, 2000);
        const bodyText = await page.evaluate(() => document.body.innerText);
        const emptyish = /no data|no records|no results|empty|nothing found/i.test(bodyText);
        const r = await shot(page, 'callback-empty-state.png');
        rec('callback-empty-state', emptyish ? 'CAPTURED' : 'CAPTURED_NO_EMPTY_HINT', emptyish ? 'Empty state detected' : 'Captured but no clear empty marker', { file: r.path, bytes: r.bytes });
        // Clear search
        await searchInput.fill('');
        await page.keyboard.press('Enter').catch(() => {});
        await settle(page, 800);
      } else {
        rec('callback-empty-state', 'NOT_FOUND', 'No search input to force empty');
      }
    } catch (e) { rec('callback-empty-state', 'ERROR', String(e?.message || e)); }

  } finally {
    fs.writeFileSync(path.join(__dirname, '_capture-sm-callback-modals-results.json'), JSON.stringify(results, null, 2));
    console.log('\n=== RESULTS WRITTEN ===');
    console.log(path.join(__dirname, '_capture-sm-callback-modals-results.json'));
    await ctx.close();
    await browser.close();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
