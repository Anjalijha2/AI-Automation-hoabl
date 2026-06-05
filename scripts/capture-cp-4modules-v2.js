// scripts/capture-cp-4modules-v2.js
//
// Follow-up to v1. Addresses 2 gaps:
//   A) Leads page: share/copy icons in row Action column not found via prior heuristics
//      → Need richer DOM dump of an actual data row + try clicking action icons
//   B) JBP: cycle is ACTIVE/OPEN. Form is revealed after clicking "Add New JBP Entry"
//      → Click that, capture form, validation, filled state

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'channel-partner.json');
const VM   = path.join(ROOT, 'visual-memory', 'cp');
const VIEWPORT = { width: 1920, height: 900 };

const URLS = {
  leads: 'https://uat-web.xrportal.in/leads',
  jbp:   'https://uat-web.xrportal.in/jbp',
};

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note }, extra || {});
  console.log(`[${status.padEnd(14)}] ${key} — ${note}`);
}

async function settle(p, ms = 1500) { await p.waitForTimeout(ms); }
async function dismissOverlays(p) {
  for (let i = 0; i < 2; i++) { await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(200); }
  await p.mouse.click(5, 5).catch(() => {});
  await p.waitForTimeout(200);
}
async function shot(p, out, full = false) {
  await p.screenshot({ path: out, fullPage: !!full });
  const stat = fs.statSync(out);
  return { path: out, bytes: stat.size };
}

// ===================================================================
// A) LEADS — re-attempt share/copy by inspecting DATA rows
// ===================================================================
async function captureLeadsActions(page) {
  const outDir = path.join(VM, 'leads-management');
  console.log('\n=== LEADS — share/copy re-attempt ===');
  await page.goto(URLS.leads, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await settle(page, 3000);
  if (/\/login/i.test(page.url())) { rec('leads/all', 'AUTH_FAILED', 'redir'); return; }

  // Wait for actual data rows to populate (the antd Table sometimes renders empty initially)
  await page.waitForSelector('.ant-table-tbody .ant-table-row', { timeout: 15_000 }).catch(() => {});
  await settle(page, 1500);

  // Deep dump of first DATA row
  const rowDump = await page.evaluate(() => {
    const rows = document.querySelectorAll('.ant-table-tbody .ant-table-row');
    if (!rows.length) return { error: 'no .ant-table-row found' };
    const row = rows[0];
    const cells = Array.from(row.querySelectorAll('td'));
    const lastCell = cells[cells.length - 1];
    const lastCellHtml = lastCell ? lastCell.outerHTML.slice(0, 4000) : '';
    // Collect ALL clickable elements anywhere in the row
    const all = Array.from(row.querySelectorAll('button, a, [role="button"], svg, img'));
    const items = all.map((el, i) => ({
      idx: i,
      tag: el.tagName,
      text: ((el.innerText || el.textContent || '') + '').trim().slice(0, 80),
      cls: (el.className && el.className.toString ? el.className.toString() : (el.getAttribute('class') || '')).slice(0, 200),
      aria: el.getAttribute('aria-label') || '',
      title: el.getAttribute('title') || '',
      role: el.getAttribute('role') || '',
      src: el.getAttribute('src') || '',
      alt: el.getAttribute('alt') || '',
      dataIcon: el.getAttribute('data-icon') || '',
      inLastCell: lastCell ? lastCell.contains(el) : false,
    }));
    return {
      rowText: (row.innerText || '').slice(0, 600),
      cellCount: cells.length,
      lastCellHtml,
      clickableCount: items.length,
      items: items.slice(0, 40),
    };
  });
  fs.writeFileSync(path.join(outDir, '_leads-row-deep-inspect.json'), JSON.stringify(rowDump, null, 2));
  console.log('  Row dump saved.', 'cells=', rowDump.cellCount, 'clickables=', rowDump.clickableCount);

  if (rowDump.error) { rec('leads/row', 'NO_DATA', rowDump.error); return; }

  // Pick the FIRST data row's action cell, then try each clickable icon and capture result
  // Strategy: try every icon-shaped element in the last cell, take a snapshot before & after.
  const actionEls = page.locator('.ant-table-tbody .ant-table-row').first().locator('td').last().locator('button, a, [role="button"], svg').filter({ hasNot: page.locator(':text("Submitted"), :text("Status")') });
  const cnt = await actionEls.count();
  console.log('  Last-cell action elements found:', cnt);

  // Try clicking each icon: capture result. Heuristic — usually order is [eye/view, share, copy] OR [share, copy] OR [view-details].
  // We'll attempt and label by index, plus capture toast/modal/new-tab outcome.
  const ctx = page.context();
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'https://uat-web.xrportal.in' }).catch(() => {});

  const attempts = [];
  for (let i = 0; i < Math.min(cnt, 4); i++) {
    const newPagePromise = ctx.waitForEvent('page', { timeout: 2500 }).catch(() => null);
    try {
      const el = actionEls.nth(i);
      const info = await el.evaluate(node => ({
        tag: node.tagName,
        text: (node.innerText || '').trim().slice(0, 50),
        aria: node.getAttribute('aria-label') || '',
        title: node.getAttribute('title') || '',
        cls: (node.className && node.className.toString ? node.className.toString() : (node.getAttribute('class') || '')).slice(0, 200),
      })).catch(() => ({}));
      await el.scrollIntoViewIfNeeded();
      await el.click({ force: true, timeout: 4000 });
      await page.waitForTimeout(700);
      const newPage = await newPagePromise;
      const toast = page.locator('.Toastify__toast, [class*="Toastify__toast" i], [class*="toast" i]').first();
      const modal = page.locator('.ant-modal-content, [role="dialog"]').first();
      let outcome = 'no-visible-effect';
      let detail = '';
      if (newPage) {
        await newPage.waitForLoadState('domcontentloaded').catch(() => {});
        outcome = 'new-tab';
        detail = newPage.url();
        await newPage.close();
      } else if (await modal.count() > 0) {
        outcome = 'modal';
        detail = (await modal.innerText().catch(() => '')).slice(0, 200);
      } else if (await toast.count() > 0) {
        outcome = 'toast';
        detail = (await toast.innerText().catch(() => '')).slice(0, 200);
      }
      attempts.push({ idx: i, info, outcome, detail });
      console.log(`  attempt[${i}] tag=${info.tag} aria="${info.aria}" cls="${(info.cls || '').slice(0, 60)}" → ${outcome} | ${detail.slice(0, 80)}`);

      // If toast (likely copy) — capture screenshot before it fades
      if (outcome === 'toast' && /copy|copied|clipboard/i.test(detail)) {
        const r = await shot(page, path.join(outDir, 'leads-copy-action.png'));
        rec('leads-management/leads-copy-action', 'CAPTURED', `Toast: "${detail}"`, { file: r.path, bytes: r.bytes, triggerInfo: info });
      }
      // If new-tab (likely share opens external link)
      if (outcome === 'new-tab') {
        const r = await shot(page, path.join(outDir, 'leads-share-action.png'));
        rec('leads-management/leads-share-action', 'NEW_TAB', `New tab: ${detail}`, { file: r.path, bytes: r.bytes, triggerInfo: info, newTabUrl: detail });
      }
      // If modal — could be share modal with shareable link
      if (outcome === 'modal' && /share|copy|link/i.test(detail)) {
        const r = await shot(page, path.join(outDir, 'leads-share-action.png'));
        rec('leads-management/leads-share-action', 'MODAL', `Modal: "${detail}"`, { file: r.path, bytes: r.bytes, triggerInfo: info });
      }
      await dismissOverlays(page);
      await settle(page, 700);
    } catch (e) {
      attempts.push({ idx: i, error: String(e?.message || e) });
      console.log(`  attempt[${i}] ERROR: ${e?.message || e}`);
    }
  }
  fs.writeFileSync(path.join(outDir, '_leads-action-attempts.json'), JSON.stringify(attempts, null, 2));

  // If neither share nor copy was recorded with a clear outcome, save best-effort capture of full action area
  if (!results['leads-management/leads-share-action']) {
    const r = await shot(page, path.join(outDir, 'leads-share-action.png'));
    rec('leads-management/leads-share-action', 'CAPTURED_FALLBACK', 'Could not isolate share action — see attempts JSON; saved current state', { file: r.path, bytes: r.bytes });
  }
  if (!results['leads-management/leads-copy-action']) {
    const r = await shot(page, path.join(outDir, 'leads-copy-action.png'));
    rec('leads-management/leads-copy-action', 'CAPTURED_FALLBACK', 'Could not isolate copy action — see attempts JSON; saved current state', { file: r.path, bytes: r.bytes });
  }
}

// ===================================================================
// B) JBP — OPEN cycle: click "Add New JBP Entry" → capture form
// ===================================================================
async function captureJbpForm(page) {
  const outDir = path.join(VM, 'jbp-submission');
  console.log('\n=== JBP — open-cycle form ===');
  await page.goto(URLS.jbp, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await settle(page, 2500);
  if (/\/login/i.test(page.url())) { rec('jbp/all', 'AUTH_FAILED', 'redir'); return; }

  // Click "Add New JBP Entry" to open form
  const addBtn = page.locator('button:has-text("Add New JBP Entry")').first();
  if (await addBtn.count() === 0) {
    rec('jbp-submission/jbp-open-cycle-form', 'NOT_FOUND', '"Add New JBP Entry" button not found');
    return;
  }
  await addBtn.scrollIntoViewIfNeeded();
  await addBtn.click();
  await settle(page, 2500);

  // Capture form state
  const formInfo = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select, .ant-select')).map(el => ({
      tag: el.tagName,
      type: el.type || '',
      name: el.name || '',
      placeholder: el.placeholder || '',
      id: el.id || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      labelText: ((el.closest('.ant-form-item')?.querySelector('.ant-form-item-label, label')?.innerText) || '').trim().slice(0, 80),
    })).slice(0, 60);
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => `${h.tagName}: ${(h.innerText || '').trim()}`);
    const buttons = Array.from(document.querySelectorAll('button')).map(b => (b.innerText || '').trim()).filter(Boolean).slice(0, 30);
    const modalPresent = !!document.querySelector('.ant-modal-content, .ant-drawer-content, [role="dialog"]');
    return { inputs, headings, buttons, modalPresent, url: location.href };
  }).catch(e => ({ err: String(e?.message || e) }));
  fs.writeFileSync(path.join(outDir, '_jbp-form-inspect.json'), JSON.stringify(formInfo, null, 2));
  console.log('  Form inputs:', (formInfo.inputs || []).length, 'modalPresent:', formInfo.modalPresent);

  {
    const r = await shot(page, path.join(outDir, 'jbp-open-cycle-form.png'), true);
    rec('jbp-submission/jbp-open-cycle-form', 'CAPTURED', `${(formInfo.inputs || []).length} field(s); modal=${formInfo.modalPresent}`, { file: r.path, bytes: r.bytes });
  }

  // Form validation: try to submit without filling
  try {
    const submitBtn = page.locator('.ant-modal-content button:has-text("Submit"), .ant-modal-content button:has-text("Save"), .ant-drawer-content button:has-text("Submit"), .ant-drawer-content button:has-text("Save"), button:has-text("Submit JBP")').first();
    let submit = submitBtn;
    if (await submit.count() === 0) {
      submit = page.locator('button:has-text("Submit"), button:has-text("Save")').last();
    }
    if (await submit.count() > 0) {
      await submit.scrollIntoViewIfNeeded();
      await submit.click({ force: true });
      await settle(page, 1500);
      const r = await shot(page, path.join(outDir, 'jbp-form-validation.png'), true);
      rec('jbp-submission/jbp-form-validation', 'CAPTURED', 'Empty submit attempt', { file: r.path, bytes: r.bytes });
    } else {
      rec('jbp-submission/jbp-form-validation', 'NOT_FOUND', 'No Submit/Save button visible');
    }
  } catch (e) { rec('jbp-submission/jbp-form-validation', 'ERROR', String(e?.message || e)); }

  // Form filled: populate inputs with test data
  try {
    const filled = await page.evaluate(() => {
      let n = 0;
      document.querySelectorAll('input').forEach((inp, idx) => {
        if (inp.disabled || inp.readOnly) return;
        const t = (inp.type || '').toLowerCase();
        if (t === 'checkbox' || t === 'radio' || t === 'file') return;
        if (t === 'number') {
          inp.value = String(10 + idx);
        } else if (t === 'date') {
          inp.value = '2026-06-15';
        } else {
          inp.value = (inp.value && inp.value.length > 0) ? inp.value : String(10 + idx);
        }
        inp.dispatchEvent(new Event('input',  { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        n++;
      });
      document.querySelectorAll('textarea').forEach(t => {
        if (t.disabled || t.readOnly) return;
        t.value = 'Test JBP submission data';
        t.dispatchEvent(new Event('input',  { bubbles: true }));
        t.dispatchEvent(new Event('change', { bubbles: true }));
      });
      return n;
    }).catch(() => 0);
    await settle(page, 1000);
    const r = await shot(page, path.join(outDir, 'jbp-form-filled.png'), true);
    rec('jbp-submission/jbp-form-filled', 'CAPTURED', `${filled} input(s) populated (DO NOT SUBMIT)`, { file: r.path, bytes: r.bytes });
  } catch (e) { rec('jbp-submission/jbp-form-filled', 'ERROR', String(e?.message || e)); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  const page = await context.newPage();
  try {
    await captureLeadsActions(page);
    await captureJbpForm(page);
  } catch (e) {
    console.error('FATAL', e?.message || e);
  } finally {
    fs.writeFileSync(path.join(__dirname, '_capture-cp-4modules-v2-results.json'), JSON.stringify(results, null, 2));
    console.log('\nResults written: scripts/_capture-cp-4modules-v2-results.json');
    await context.close();
    await browser.close();
  }
})();
