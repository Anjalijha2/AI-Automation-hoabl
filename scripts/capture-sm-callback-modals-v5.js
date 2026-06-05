// scripts/capture-sm-callback-modals-v5.js
//
// v5 — capture "Capture VC Outcome" modal/drawer + status filter v2
// Findings from v4:
//   - Row actions: eye (View) + more (3-dot dropdown with "Capture VC Outcome")
//   - "Capture VC Outcome" is the SM Feedback / VC outcome submission UI
//   - This is what we need for: schedule-modal, confirm-modal, feedback-drawer
//
// Final plan:
//   1. Click "more" on a PENDING row → click "Capture VC Outcome" → capture modal/drawer
//   2. Click "more" on a MEETING DONE row → "Capture VC Outcome" → capture (likely edit mode)
//   3. The "schedule meeting / confirm meeting / feedback" are all parts of "Capture VC Outcome"
//   4. Capture the more menu itself as a dedicated screenshot

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
  console.log(`[${status.padEnd(18)}] ${key} — ${(note || '').slice(0, 220)}`);
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

async function inspectAll(page) {
  return await page.evaluate(() => {
    const out = { drawers: [], modals: [], dropdowns: [] };
    document.querySelectorAll('.ant-drawer-open .ant-drawer-content').forEach(d => {
      if (d.offsetParent === null) return;
      out.drawers.push({
        title: d.querySelector('.ant-drawer-title')?.innerText?.trim() || '',
        buttons: [...d.querySelectorAll('button')].map(b => ({ text: b.innerText.trim(), disabled: b.disabled })).filter(b => b.text),
        tabs: [...d.querySelectorAll('.ant-tabs-tab')].map(t => t.innerText.trim()),
        radios: [...d.querySelectorAll('.ant-radio-wrapper')].map(r => r.innerText.trim()).filter(Boolean),
        checkboxes: [...d.querySelectorAll('.ant-checkbox-wrapper')].map(r => r.innerText.trim()).filter(Boolean),
        selects: [...d.querySelectorAll('.ant-select-selection-item, .ant-select-selection-placeholder')].map(s => s.innerText.trim()).filter(Boolean),
        sections: [...d.querySelectorAll('h2, h3, h4, .ant-card-head-title, .section-title')].map(s => s.innerText.trim()).filter(Boolean),
        inputs: [...d.querySelectorAll('input, textarea')].map(i => ({ id: i.id, placeholder: i.placeholder, type: i.type, disabled: i.disabled, value: (i.value || '').slice(0, 60) })),
        labels: [...d.querySelectorAll('label, .ant-form-item-label')].map(l => l.innerText.trim()).filter(Boolean),
        errors: [...d.querySelectorAll('.ant-form-item-explain-error, .ant-form-item-explain')].map(e => e.innerText.trim()).filter(Boolean),
        textPreview: d.innerText.slice(0, 2500)
      });
    });
    document.querySelectorAll('.ant-modal:not(.ant-modal-hidden)').forEach(m => {
      if (m.offsetParent === null) return;
      out.modals.push({
        title: m.querySelector('.ant-modal-title')?.innerText?.trim() || '',
        buttons: [...m.querySelectorAll('button')].map(b => ({ text: b.innerText.trim(), disabled: b.disabled })).filter(b => b.text),
        radios: [...m.querySelectorAll('.ant-radio-wrapper')].map(r => r.innerText.trim()).filter(Boolean),
        checkboxes: [...m.querySelectorAll('.ant-checkbox-wrapper')].map(r => r.innerText.trim()).filter(Boolean),
        selects: [...m.querySelectorAll('.ant-select-selection-item, .ant-select-selection-placeholder')].map(s => s.innerText.trim()).filter(Boolean),
        inputs: [...m.querySelectorAll('input, textarea')].map(i => ({ id: i.id, placeholder: i.placeholder, type: i.type, disabled: i.disabled })),
        labels: [...m.querySelectorAll('label')].map(l => l.innerText.trim()).filter(Boolean),
        textPreview: m.innerText.slice(0, 2500)
      });
    });
    document.querySelectorAll('.ant-dropdown:not(.ant-dropdown-hidden)').forEach(d => {
      if (d.offsetParent === null) return;
      out.dropdowns.push({
        items: [...d.querySelectorAll('.ant-dropdown-menu-item, li')].map(i => i.innerText.trim()).filter(Boolean)
      });
    });
    return out;
  });
}

async function clickMoreInRow(page, rowIdx) {
  return await page.evaluate((idx) => {
    const rows = [...document.querySelectorAll('tr.ant-table-row')];
    const row = rows[idx];
    if (!row) return { ok: false };
    const last = row.querySelector('td:last-child');
    const more = last.querySelector('.anticon-more');
    if (!more) return { ok: false, reason: 'no more icon' };
    more.click();
    return { ok: true };
  }, rowIdx);
}

async function clickMenuItem(page, text) {
  return await page.evaluate((t) => {
    const items = [...document.querySelectorAll('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item, .ant-dropdown:not(.ant-dropdown-hidden) li')];
    const match = items.find(i => i.innerText.trim().includes(t));
    if (!match) return { ok: false, available: items.map(i => i.innerText.trim()) };
    match.click();
    return { ok: true };
  }, text);
}

async function closeDrawer(page) {
  const closeBtn = page.locator('.ant-drawer-open .ant-drawer-close').first();
  if (await closeBtn.count() > 0) await closeBtn.click().catch(() => {});
  await dismissOverlays(page);
  await settle(page, 800);
}

async function run() {
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ storageState: AUTH, viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  try {
    await page.goto(URL_CALLBACK, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    if (/\/login/i.test(page.url())) { rec('_auth', 'FAILED', page.url()); return; }
    rec('_auth', 'OK', page.url());

    // ============ A) Capture "more" menu for PENDING row ============
    try {
      const c1 = await clickMoreInRow(page, 0);
      await settle(page, 800);
      const ov1 = await inspectAll(page);
      const r1 = await shot(page, 'callback-row-more-menu.png');
      rec('callback-row-more-menu', 'CAPTURED',
          `Menu items: ${JSON.stringify(ov1.dropdowns?.[0]?.items || [])}`,
          { file: r1.path, bytes: r1.bytes, overlay: ov1 });

      // Click "Capture VC Outcome"
      const click = await clickMenuItem(page, 'Capture VC Outcome');
      await settle(page, 2000);
      const ov2 = await inspectAll(page);
      const r2 = await shot(page, 'callback-capture-vc-outcome-pending.png');
      const drawer = ov2.drawers[0];
      const modal = ov2.modals[0];
      rec('callback-capture-vc-outcome-pending', 'CAPTURED',
          `Drawer="${drawer?.title}"; Modal="${modal?.title}"; Radios=${JSON.stringify(drawer?.radios?.slice(0, 15) || modal?.radios?.slice(0, 15) || [])}; Selects=${JSON.stringify(drawer?.selects || modal?.selects || [])}; Buttons=${JSON.stringify((drawer?.buttons || modal?.buttons || []).map(b => b.text))}; Sections=${JSON.stringify(drawer?.sections || [])}`,
          { file: r2.path, bytes: r2.bytes, overlay: ov2, clickMeta: click });

      // Also save as canonical "schedule-modal" and "feedback-drawer" if matches purpose
      if (drawer?.title || modal?.title) {
        const title = (drawer?.title || modal?.title || '').toLowerCase();
        if (/outcome|feedback|vc/i.test(title)) {
          fs.copyFileSync(r2.path, path.join(OUT, 'callback-feedback-drawer.png'));
          fs.copyFileSync(r2.path, path.join(OUT, 'callback-schedule-modal.png'));
          rec('_aliasedAs', 'OK', 'Copied as callback-feedback-drawer.png and callback-schedule-modal.png');
        }
      }

      // Try clicking submit with empty form for validation
      try {
        const submitBtn = page.locator('.ant-drawer-open button:has-text("Submit"), .ant-modal button:has-text("Submit"), .ant-drawer-open button:has-text("Save"), .ant-modal button:has-text("Save"), .ant-drawer-open button:has-text("Confirm"), .ant-modal button:has-text("Confirm")').first();
        if (await submitBtn.count() > 0) {
          const isDisabled = await submitBtn.isDisabled().catch(() => true);
          if (!isDisabled) {
            await submitBtn.click().catch(() => {});
            await settle(page, 1500);
            const ov3 = await inspectAll(page);
            const r3 = await shot(page, 'callback-capture-vc-outcome-validation.png');
            rec('callback-capture-vc-outcome-validation', 'CAPTURED',
                `Errors: ${JSON.stringify(ov3.drawers?.[0]?.errors || ov3.modals?.[0]?.textPreview || [])}`,
                { file: r3.path, bytes: r3.bytes, overlay: ov3 });
          } else {
            const r3 = await shot(page, 'callback-capture-vc-outcome-validation.png');
            rec('callback-capture-vc-outcome-validation', 'CAPTURED_DISABLED',
                'Submit button disabled with empty fields — captured disabled state',
                { file: r3.path, bytes: r3.bytes });
          }
        }
      } catch (e) { rec('callback-capture-vc-outcome-validation', 'ERROR', String(e?.message || e)); }

      await closeDrawer(page);
      await dismissOverlays(page);
    } catch (e) { rec('callback-capture-vc-outcome-pending', 'ERROR', String(e?.message || e)); }

    // ============ B) Capture "more" menu for MEETING DONE + Capture VC Outcome (edit mode?) ============
    try {
      // Find first MEETING DONE row
      const mdIdx = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('tr.ant-table-row')];
        for (let i = 0; i < rows.length; i++) {
          if (/meeting\s*done|done/i.test(rows[i].querySelector('.ant-tag')?.innerText || '')) return i;
        }
        return -1;
      });
      if (mdIdx >= 0) {
        await clickMoreInRow(page, mdIdx);
        await settle(page, 800);
        const ov1 = await inspectAll(page);
        const r1 = await shot(page, 'callback-row-more-menu-meetingdone.png');
        rec('callback-row-more-menu-meetingdone', 'CAPTURED',
            `Items: ${JSON.stringify(ov1.dropdowns?.[0]?.items || [])}`,
            { file: r1.path, bytes: r1.bytes, overlay: ov1 });

        await clickMenuItem(page, 'Capture VC Outcome');
        await settle(page, 2000);
        const ov2 = await inspectAll(page);
        const r2 = await shot(page, 'callback-capture-vc-outcome-meetingdone.png');
        const drawer = ov2.drawers[0];
        const modal = ov2.modals[0];
        rec('callback-capture-vc-outcome-meetingdone', 'CAPTURED',
            `Drawer="${drawer?.title}"; Modal="${modal?.title}"; Selects=${JSON.stringify(drawer?.selects || modal?.selects || [])}; Buttons=${JSON.stringify((drawer?.buttons || modal?.buttons || []).map(b => b.text))}; TextPreview: ${(drawer?.textPreview || modal?.textPreview || '').slice(0, 800)}`,
            { file: r2.path, bytes: r2.bytes, overlay: ov2 });

        await closeDrawer(page);
        await dismissOverlays(page);
      }
    } catch (e) { rec('callback-capture-vc-outcome-meetingdone', 'ERROR', String(e?.message || e)); }

  } finally {
    fs.writeFileSync(path.join(__dirname, '_capture-sm-callback-modals-v5-results.json'), JSON.stringify(results, null, 2));
    console.log('\n=== V5 RESULTS WRITTEN ===');
    await ctx.close();
    await browser.close();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
