// scripts/capture-sm-callback-modals-v3.js
//
// v3 — fix v2 issues:
//   - Use 'tr.ant-table-row' (not all 'tr' which included header row 0)
//   - Action column elements may be icon spans, not <button> — use any clickable inside
//   - Create drawer fields are DISABLED until buyer is searched & selected first
//     → flow: type in search input, wait for autosuggest, select first option → fields enable
//     → then leave fields empty/blank to trigger validation
//   - Capture details drawer per status using DOM-based action discovery

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
  console.log(`[${status.padEnd(16)}] ${key} — ${note}`);
}

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }
async function shot(page, file) {
  const full = path.join(OUT, file);
  await page.screenshot({ path: full, fullPage: false });
  return { path: full, bytes: fs.statSync(full).size };
}
async function dismissOverlays(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await settle(page, 300);
  await page.keyboard.press('Escape').catch(() => {});
  await settle(page, 300);
}

async function inspectActiveDrawer(page) {
  return await page.evaluate(() => {
    const drawer = document.querySelector('.ant-drawer-open .ant-drawer-content, .ant-drawer .ant-drawer-content');
    if (!drawer || drawer.offsetParent === null) return null;
    const title = drawer.querySelector('.ant-drawer-title, h2, h3')?.innerText?.trim() || '';
    const allText = drawer.innerText.slice(0, 3000);
    const labels = [...drawer.querySelectorAll('label, .ant-form-item-label')].map(e => e.innerText.trim()).filter(Boolean);
    const inputs = [...drawer.querySelectorAll('input, textarea')].map(i => ({
      tag: i.tagName.toLowerCase(),
      name: i.name || '',
      id: i.id || '',
      placeholder: i.placeholder || '',
      type: i.type || '',
      ariaLabel: i.getAttribute('aria-label') || '',
      readOnly: i.readOnly,
      disabled: i.disabled,
      value: (i.value || '').slice(0, 80)
    }));
    const buttons = [...drawer.querySelectorAll('button')].map(b => ({
      text: b.innerText.trim(),
      disabled: b.disabled,
      classes: b.className.slice(0, 100)
    })).filter(b => b.text || b.classes.length > 0);
    const tabs = [...drawer.querySelectorAll('.ant-tabs-tab, [role="tab"]')].map(t => ({
      text: t.innerText.trim(),
      active: t.classList.contains('ant-tabs-tab-active') || t.getAttribute('aria-selected') === 'true'
    }));
    const radios = [...drawer.querySelectorAll('.ant-radio-wrapper, .ant-checkbox-wrapper')].map(r => r.innerText.trim()).filter(Boolean);
    const selects = [...drawer.querySelectorAll('.ant-select-selection-item, .ant-select-selection-placeholder')].map(s => s.innerText.trim()).filter(Boolean);
    const sections = [...drawer.querySelectorAll('h3, h4, .ant-card-head-title, .ant-collapse-header, .section-title')].map(s => s.innerText.trim()).filter(Boolean);
    const errors = [...drawer.querySelectorAll('.ant-form-item-explain-error, .ant-form-item-explain, [role="alert"]')].map(e => e.innerText.trim()).filter(Boolean);
    return { title, labels, inputs, buttons, tabs, radios, selects, sections, errors, allText };
  });
}

async function getRowStatuses(page) {
  return await page.evaluate(() => {
    const rows = [...document.querySelectorAll('tr.ant-table-row')];
    return rows.map((r, i) => {
      const status = r.querySelector('.ant-tag')?.innerText?.trim() || '';
      const actionCell = r.querySelector('td:last-child');
      const actionItems = actionCell ? [...actionCell.querySelectorAll('button, a, .anticon, [role="button"], svg, span[class*="icon" i]')].length : 0;
      const reqId = r.querySelector('td:nth-child(2)')?.innerText?.trim() || '';
      return { idx: i, status, reqId, actionItems };
    });
  });
}

async function clickActionInRow(page, rowIdx) {
  // Use evaluate to click the most likely action element
  return await page.evaluate((idx) => {
    const rows = [...document.querySelectorAll('tr.ant-table-row')];
    const row = rows[idx];
    if (!row) return { ok: false, reason: 'no row' };
    const lastCell = row.querySelector('td:last-child');
    if (!lastCell) return { ok: false, reason: 'no last cell' };
    // Prefer button > anticon > svg
    const candidates = [
      ...lastCell.querySelectorAll('button'),
      ...lastCell.querySelectorAll('.anticon'),
      ...lastCell.querySelectorAll('[role="button"]'),
      ...lastCell.querySelectorAll('a'),
      ...lastCell.querySelectorAll('svg')
    ];
    if (!candidates.length) {
      // Try clicking the cell itself
      lastCell.click();
      return { ok: true, what: 'cell', html: lastCell.innerHTML.slice(0, 200) };
    }
    const target = candidates[0];
    target.click();
    return { ok: true, what: target.tagName, classes: target.className, html: lastCell.innerHTML.slice(0, 300) };
  }, rowIdx);
}

async function closeDrawer(page) {
  const closeBtn = page.locator('.ant-drawer-open .ant-drawer-close, .ant-drawer-close, .ant-drawer-mask').first();
  if (await closeBtn.count() > 0) {
    await closeBtn.click().catch(() => {});
  }
  await dismissOverlays(page);
  await settle(page, 800);
}

async function run() {
  if (!fs.existsSync(AUTH)) { console.error(`Auth missing: ${AUTH}`); process.exit(1); }
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ storageState: AUTH, viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  try {
    await page.goto(URL_CALLBACK, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2000);
    if (/\/login/i.test(page.url())) { rec('_auth', 'FAILED', page.url()); return; }
    rec('_auth', 'OK', page.url());

    const rowStatuses = await getRowStatuses(page);
    rec('_rowStatuses', 'OK', `${rowStatuses.length} rows`, { rows: rowStatuses });
    console.log('Rows:', rowStatuses.map(r => `${r.idx}:${r.status}(act=${r.actionItems})`).join(' | '));

    // ============ 1. CREATE CALLBACK — search buyer to enable fields, then validate ============
    try {
      const createBtn = page.locator('button:has-text("Create Callback")').first();
      await createBtn.click();
      await settle(page, 1500);

      // Inspect drawer initial state (before search) — fields disabled
      const domBefore = await inspectActiveDrawer(page);
      const rBefore = await shot(page, 'callback-create-drawer.png');
      rec('callback-create-drawer', 'CAPTURED',
          `Initial state. Fields disabled count=${(domBefore?.inputs || []).filter(i => i.disabled).length}`,
          { file: rBefore.path, bytes: rBefore.bytes, dom: domBefore });

      // Search buyer
      const searchInput = page.locator('.ant-drawer input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.click();
        await searchInput.fill('Anjali');
        await settle(page, 1800);
        // Capture autosuggest / dropdown if any
        const suggestDom = await page.evaluate(() => {
          const items = [...document.querySelectorAll('.ant-select-item, .ant-dropdown-menu-item, .ant-cascader-menu-item, [class*="suggest" i] li, .search-result-item')]
            .map(e => ({ text: e.innerText.trim().slice(0, 100), classes: e.className.slice(0, 80) }))
            .filter(i => i.text.length > 0);
          return items.slice(0, 10);
        });
        rec('_createSearchSuggestions', 'OK', `${suggestDom.length} suggestions`, { suggestions: suggestDom });

        // Try keyboard ArrowDown + Enter to select first
        await page.keyboard.press('ArrowDown').catch(() => {});
        await settle(page, 300);
        await page.keyboard.press('Enter').catch(() => {});
        await settle(page, 1200);

        // Try alt: click the Search button
        if (!(await page.locator('.ant-drawer input#buyerEmail:not([disabled])').count())) {
          const sBtn = page.locator('.ant-drawer button:has-text("Search")').first();
          if (await sBtn.count() > 0) {
            await sBtn.click();
            await settle(page, 1500);
          }
        }

        // Inspect after search
        const domAfter = await inspectActiveDrawer(page);
        const rAfter = await shot(page, 'callback-create-drawer-searched.png');
        rec('callback-create-drawer-searched', 'CAPTURED',
            `After buyer search "Anjali"; disabled inputs=${(domAfter?.inputs || []).filter(i => i.disabled).length} / total=${(domAfter?.inputs || []).length}`,
            { file: rAfter.path, bytes: rAfter.bytes, dom: domAfter });

        // Now leave fields empty (if enabled) and click Create to trigger validation
        // Or: blur each field to trigger ant-form validation
        const enabledInputs = await page.locator('.ant-drawer input:not([disabled])').all();
        for (const inp of enabledInputs) {
          await inp.click().catch(() => {});
          await page.keyboard.press('Tab').catch(() => {});
          await settle(page, 200);
        }
        await settle(page, 600);

        const createBtnInDrawer = page.locator('.ant-drawer button:has-text("Create")').first();
        const createDisabled = await createBtnInDrawer.isDisabled().catch(() => true);
        if (!createDisabled) {
          await createBtnInDrawer.click().catch(() => {});
          await settle(page, 1500);
        }
        const domValidation = await inspectActiveDrawer(page);
        const rVal = await shot(page, 'callback-create-drawer-validation.png');
        rec('callback-create-drawer-validation', 'CAPTURED',
            `Create btn disabled=${createDisabled}; Errors=${JSON.stringify(domValidation?.errors?.slice(0, 8) || [])}`,
            { file: rVal.path, bytes: rVal.bytes, dom: domValidation });
      } else {
        rec('callback-create-drawer-validation', 'NO_SEARCH', 'No search input in drawer');
      }

      await closeDrawer(page);
    } catch (e) { rec('callback-create-drawer-validation', 'ERROR', String(e?.message || e)); }

    // ============ 2. DETAILS DRAWER — PENDING row ============
    try {
      const pendingRow = rowStatuses.find(r => /pending/i.test(r.status));
      if (!pendingRow) {
        rec('callback-details-drawer-pending', 'NOT_FOUND', 'No PENDING row');
      } else {
        const click = await clickActionInRow(page, pendingRow.idx);
        rec('_pendingRowClick', click.ok ? 'OK' : 'FAIL', `row=${pendingRow.idx}; ${JSON.stringify(click)}`);
        await settle(page, 1800);
        const dom = await inspectActiveDrawer(page);
        if (!dom) {
          rec('callback-details-drawer-pending', 'NO_DRAWER', `Click did not open drawer. Click meta: ${JSON.stringify(click).slice(0, 200)}`);
        } else {
          const r = await shot(page, 'callback-details-drawer-pending.png');
          const btnTexts = (dom.buttons || []).map(b => b.text).filter(Boolean);
          rec('callback-details-drawer-pending', 'CAPTURED',
              `Title="${dom.title}"; Buttons=${JSON.stringify(btnTexts.slice(0, 20))}; Tabs=${JSON.stringify((dom.tabs||[]).map(t=>t.text))}`,
              { file: r.path, bytes: r.bytes, dom });

          // Try Schedule
          const scheduleBtn = page.locator('.ant-drawer button:has-text("Schedule"), .ant-drawer button:has-text("Send Invite")').first();
          if (await scheduleBtn.count() > 0 && !(await scheduleBtn.isDisabled())) {
            await scheduleBtn.click();
            await settle(page, 1800);
            const dom2 = await inspectActiveDrawer(page);
            // Check if a new modal opened (separate from drawer)
            const modalDom = await page.evaluate(() => {
              const modal = document.querySelector('.ant-modal:not(.ant-modal-hidden)');
              if (!modal || modal.offsetParent === null) return null;
              const title = modal.querySelector('.ant-modal-title')?.innerText?.trim() || '';
              const labels = [...modal.querySelectorAll('label')].map(e => e.innerText.trim()).filter(Boolean);
              const inputs = [...modal.querySelectorAll('input, textarea')].map(i => ({ placeholder: i.placeholder, type: i.type, id: i.id, disabled: i.disabled }));
              const buttons = [...modal.querySelectorAll('button')].map(b => ({ text: b.innerText.trim(), disabled: b.disabled }));
              return { title, labels, inputs, buttons };
            });
            const r2 = await shot(page, 'callback-schedule-modal.png');
            rec('callback-schedule-modal', 'CAPTURED',
                `Modal: ${JSON.stringify(modalDom).slice(0, 300)}; Drawer title="${dom2?.title}"`,
                { file: r2.path, bytes: r2.bytes, modalDom, dom: dom2 });
          } else {
            rec('callback-schedule-modal', 'NOT_IN_PENDING', `No Schedule/Send Invite button. Btns=${JSON.stringify(btnTexts)}`);
          }

          await closeDrawer(page);
        }
      }
    } catch (e) { rec('callback-details-drawer-pending', 'ERROR', String(e?.message || e)); }

    await dismissOverlays(page);
    await settle(page, 800);

    // ============ 3. DETAILS DRAWER — MEETING DONE row → Feedback ============
    try {
      const mdRow = rowStatuses.find(r => /meeting\s*done|done/i.test(r.status));
      if (!mdRow) {
        rec('callback-feedback-drawer', 'NOT_FOUND', 'No MEETING DONE row');
      } else {
        const click = await clickActionInRow(page, mdRow.idx);
        rec('_meetingDoneRowClick', click.ok ? 'OK' : 'FAIL', `row=${mdRow.idx}; ${JSON.stringify(click)}`);
        await settle(page, 1800);
        const dom = await inspectActiveDrawer(page);
        if (!dom) {
          rec('callback-feedback-drawer', 'NO_DRAWER', `Click did not open drawer`);
        } else {
          const r = await shot(page, 'callback-details-drawer-meetingdone.png');
          const btnTexts = (dom.buttons || []).map(b => b.text).filter(Boolean);
          rec('callback-details-drawer-meetingdone', 'CAPTURED',
              `Title="${dom.title}"; Buttons=${JSON.stringify(btnTexts.slice(0, 20))}; Radios=${JSON.stringify(dom.radios.slice(0, 15))}; Selects=${JSON.stringify(dom.selects)}; Sections=${JSON.stringify(dom.sections)}`,
              { file: r.path, bytes: r.bytes, dom });

          // Inline Feedback or button-triggered?
          const feedbackBtn = page.locator('.ant-drawer button:has-text("Feedback"), .ant-drawer button:has-text("Submit"), .ant-drawer button:has-text("Outcome")').first();
          const inlineHasFeedback = (dom.radios.length > 0) || (dom.selects.some(s => /outcome|feedback/i.test(s))) || (dom.allText && /outcome|feedback/i.test(dom.allText));
          if (inlineHasFeedback) {
            // Already showing feedback inline — current screenshot is the feedback drawer
            fs.copyFileSync(r.path, path.join(OUT, 'callback-feedback-drawer.png'));
            rec('callback-feedback-drawer', 'CAPTURED_INLINE',
                `Feedback inline in details drawer (radios=${dom.radios.length}, selects mentioning feedback)`,
                { file: path.join(OUT, 'callback-feedback-drawer.png'), bytes: fs.statSync(path.join(OUT, 'callback-feedback-drawer.png')).size, dom });
          } else if (await feedbackBtn.count() > 0 && !(await feedbackBtn.isDisabled())) {
            await feedbackBtn.click();
            await settle(page, 1500);
            const dom2 = await inspectActiveDrawer(page);
            const r2 = await shot(page, 'callback-feedback-drawer.png');
            rec('callback-feedback-drawer', 'CAPTURED',
                `Title="${dom2?.title}"; Radios=${JSON.stringify((dom2?.radios || []).slice(0, 15))}; Selects=${JSON.stringify(dom2?.selects || [])}`,
                { file: r2.path, bytes: r2.bytes, dom: dom2 });
          } else {
            rec('callback-feedback-drawer', 'NOT_FOUND_IN_DRAWER',
                `No Feedback button & no inline feedback. Btns=${JSON.stringify(btnTexts)}`);
          }

          await closeDrawer(page);
        }
      }
    } catch (e) { rec('callback-feedback-drawer', 'ERROR', String(e?.message || e)); }

  } finally {
    fs.writeFileSync(path.join(__dirname, '_capture-sm-callback-modals-v3-results.json'), JSON.stringify(results, null, 2));
    console.log('\n=== V3 RESULTS WRITTEN ===');
    console.log(path.join(__dirname, '_capture-sm-callback-modals-v3-results.json'));
    await ctx.close();
    await browser.close();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
