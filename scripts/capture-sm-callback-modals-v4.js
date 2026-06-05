// scripts/capture-sm-callback-modals-v4.js
//
// v4 — final pass:
//   - Identify ALL 4 row action icons (eye opens drawer; what do the other 3 do?)
//   - In details drawer: click "Feedback" tab + "Callback History" tab — capture each
//   - Create drawer: select first buyer radio, capture "buyer-selected" state, try to
//     submit without date → validation errors expected
//
// Strategy: enumerate icons by class name. Common Ant icons:
//   anticon-eye          = View
//   anticon-edit         = Edit
//   anticon-mail / send  = Send Invite
//   anticon-calendar     = Schedule
//   anticon-check        = Confirm / Mark Done
//   anticon-message / form = Feedback

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
  console.log(`[${status.padEnd(18)}] ${key} — ${note.slice(0, 250)}`);
}

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }
async function shot(page, file) {
  const full = path.join(OUT, file);
  await page.screenshot({ path: full, fullPage: false });
  return { path: full, bytes: fs.statSync(full).size };
}
async function dismissOverlays(page) {
  // Click mask if visible
  const mask = page.locator('.ant-drawer-mask').first();
  if (await mask.count() > 0 && await mask.isVisible().catch(() => false)) {
    await mask.click().catch(() => {});
  }
  await page.keyboard.press('Escape').catch(() => {});
  await settle(page, 400);
  await page.keyboard.press('Escape').catch(() => {});
  await settle(page, 400);
}

async function listRowActionIcons(page, rowIdx) {
  return await page.evaluate((idx) => {
    const rows = [...document.querySelectorAll('tr.ant-table-row')];
    const row = rows[idx];
    if (!row) return null;
    const lastCell = row.querySelector('td:last-child');
    if (!lastCell) return null;
    const icons = [...lastCell.querySelectorAll('.anticon, [role="img"][aria-label]')];
    return icons.map(ic => ({
      ariaLabel: ic.getAttribute('aria-label') || '',
      classes: ic.className,
      title: ic.getAttribute('title') || '',
      style: ic.getAttribute('style') || ''
    }));
  }, rowIdx);
}

async function clickRowAction(page, rowIdx, iconIdx) {
  return await page.evaluate(({ rowIdx, iconIdx }) => {
    const rows = [...document.querySelectorAll('tr.ant-table-row')];
    const row = rows[rowIdx];
    if (!row) return { ok: false, reason: 'no row' };
    const lastCell = row.querySelector('td:last-child');
    if (!lastCell) return { ok: false, reason: 'no cell' };
    const icons = [...lastCell.querySelectorAll('.anticon, [role="img"][aria-label]')];
    if (!icons[iconIdx]) return { ok: false, reason: `no icon at ${iconIdx}, have ${icons.length}` };
    icons[iconIdx].click();
    return { ok: true, ariaLabel: icons[iconIdx].getAttribute('aria-label'), classes: icons[iconIdx].className };
  }, { rowIdx, iconIdx });
}

async function inspectActiveOverlay(page) {
  // Inspect any active drawer OR modal OR popconfirm
  return await page.evaluate(() => {
    const out = { drawer: null, modal: null, popconfirm: null, popover: null };
    const drawer = document.querySelector('.ant-drawer-open .ant-drawer-content, .ant-drawer .ant-drawer-content');
    if (drawer && drawer.offsetParent !== null) {
      out.drawer = {
        title: drawer.querySelector('.ant-drawer-title, h2, h3')?.innerText?.trim() || '',
        buttons: [...drawer.querySelectorAll('button')].map(b => ({ text: b.innerText.trim(), disabled: b.disabled, classes: b.className.slice(0, 60) })).filter(b => b.text || b.classes.includes('drawer-close')),
        tabs: [...drawer.querySelectorAll('.ant-tabs-tab, [role="tab"]')].map(t => ({ text: t.innerText.trim(), active: t.classList.contains('ant-tabs-tab-active') || t.getAttribute('aria-selected') === 'true' })),
        radios: [...drawer.querySelectorAll('.ant-radio-wrapper, .ant-checkbox-wrapper')].map(r => r.innerText.trim()).filter(Boolean),
        selects: [...drawer.querySelectorAll('.ant-select-selection-item, .ant-select-selection-placeholder')].map(s => s.innerText.trim()).filter(Boolean),
        sections: [...drawer.querySelectorAll('h3, h4, .ant-card-head-title, .section-title')].map(s => s.innerText.trim()).filter(Boolean),
        inputs: [...drawer.querySelectorAll('input, textarea')].map(i => ({ id: i.id, placeholder: i.placeholder, type: i.type, disabled: i.disabled, value: (i.value || '').slice(0, 60) })),
        labels: [...drawer.querySelectorAll('label, .ant-form-item-label')].map(l => l.innerText.trim()).filter(Boolean),
        errors: [...drawer.querySelectorAll('.ant-form-item-explain-error, .ant-form-item-explain, [role="alert"]')].map(e => e.innerText.trim()).filter(Boolean),
        textPreview: drawer.innerText.slice(0, 1500)
      };
    }
    const modal = document.querySelector('.ant-modal:not(.ant-modal-hidden)');
    if (modal && modal.offsetParent !== null) {
      out.modal = {
        title: modal.querySelector('.ant-modal-title')?.innerText?.trim() || '',
        buttons: [...modal.querySelectorAll('button')].map(b => ({ text: b.innerText.trim(), disabled: b.disabled })).filter(b => b.text),
        inputs: [...modal.querySelectorAll('input, textarea')].map(i => ({ id: i.id, placeholder: i.placeholder, type: i.type, disabled: i.disabled })),
        textPreview: modal.innerText.slice(0, 1000)
      };
    }
    const popc = document.querySelector('.ant-popconfirm:not(.ant-popconfirm-hidden), .ant-popover:not(.ant-popover-hidden)');
    if (popc && popc.offsetParent !== null) {
      out.popover = {
        text: popc.innerText.trim().slice(0, 500),
        buttons: [...popc.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean)
      };
    }
    return out;
  });
}

async function closeDrawer(page) {
  const closeBtn = page.locator('.ant-drawer-open .ant-drawer-close, .ant-drawer-close').first();
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
    await settle(page, 2500);
    if (/\/login/i.test(page.url())) { rec('_auth', 'FAILED', page.url()); return; }
    rec('_auth', 'OK', page.url());

    // ============ A) Identify all 4 action icons on row 0 (PENDING) ============
    try {
      const icons = await listRowActionIcons(page, 0);
      rec('_row0Icons', 'OK', `Row 0 (PENDING) icons: ${JSON.stringify(icons)}`, { icons });
      console.log('PENDING row icons:', icons?.map(i => i.ariaLabel).join(', '));
    } catch (e) { rec('_row0Icons', 'ERROR', String(e?.message || e)); }

    // ============ B) Identify all 4 action icons on a MEETING DONE row ============
    try {
      // Find first MEETING DONE row by status
      const mdIdx = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('tr.ant-table-row')];
        for (let i = 0; i < rows.length; i++) {
          if (/meeting\s*done|done/i.test(rows[i].querySelector('.ant-tag')?.innerText || '')) return i;
        }
        return -1;
      });
      if (mdIdx >= 0) {
        const icons = await listRowActionIcons(page, mdIdx);
        rec('_rowMDIcons', 'OK', `Row ${mdIdx} (MEETING DONE) icons: ${JSON.stringify(icons)}`, { icons });
        console.log('MEETING DONE row icons:', icons?.map(i => i.ariaLabel).join(', '));
      }
    } catch (e) { rec('_rowMDIcons', 'ERROR', String(e?.message || e)); }

    // ============ C) Click each non-eye action icon on PENDING row 0 ============
    const pendingIcons = (results._row0Icons?.icons) || [];
    for (let i = 0; i < pendingIcons.length; i++) {
      const ic = pendingIcons[i];
      const label = (ic.ariaLabel || `icon${i}`).toLowerCase();
      const fileSafe = label.replace(/[^a-z0-9]+/g, '-');
      try {
        // For 'eye' we already have details drawer screenshots; still capture to verify
        const click = await clickRowAction(page, 0, i);
        await settle(page, 1600);
        const overlay = await inspectActiveOverlay(page);
        const r = await shot(page, `callback-pending-action-${i}-${fileSafe}.png`);
        rec(`callback-pending-action-${i}-${fileSafe}`, 'CAPTURED',
            `Icon "${ic.ariaLabel}" → drawer=${!!overlay.drawer ? overlay.drawer.title : 'none'}; modal=${!!overlay.modal ? overlay.modal.title : 'none'}; popover=${!!overlay.popover ? 'yes' : 'no'}`,
            { file: r.path, bytes: r.bytes, overlay, iconMeta: ic });
        // Close whatever opened
        if (overlay.drawer) {
          await closeDrawer(page);
        } else if (overlay.modal) {
          const cancel = page.locator('.ant-modal-footer button:has-text("Cancel"), .ant-modal-close, .ant-modal button:has-text("No")').first();
          if (await cancel.count() > 0) await cancel.click().catch(() => {});
          await dismissOverlays(page);
        } else if (overlay.popover) {
          const noBtn = page.locator('.ant-popconfirm button:has-text("Cancel"), .ant-popconfirm button:has-text("No")').first();
          if (await noBtn.count() > 0) await noBtn.click().catch(() => {});
          await dismissOverlays(page);
        }
        await settle(page, 800);
      } catch (e) { rec(`callback-pending-action-${i}-${fileSafe}`, 'ERROR', String(e?.message || e)); }
    }

    // ============ D) Click each non-eye action icon on MEETING DONE row ============
    const mdIcons = (results._rowMDIcons?.icons) || [];
    const mdRowIdx = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('tr.ant-table-row')];
      for (let i = 0; i < rows.length; i++) {
        if (/meeting\s*done|done/i.test(rows[i].querySelector('.ant-tag')?.innerText || '')) return i;
      }
      return -1;
    });
    if (mdRowIdx >= 0) {
      for (let i = 0; i < mdIcons.length; i++) {
        const ic = mdIcons[i];
        const label = (ic.ariaLabel || `icon${i}`).toLowerCase();
        const fileSafe = label.replace(/[^a-z0-9]+/g, '-');
        try {
          const click = await clickRowAction(page, mdRowIdx, i);
          await settle(page, 1600);
          const overlay = await inspectActiveOverlay(page);
          const r = await shot(page, `callback-md-action-${i}-${fileSafe}.png`);
          rec(`callback-md-action-${i}-${fileSafe}`, 'CAPTURED',
              `Icon "${ic.ariaLabel}" → drawer=${!!overlay.drawer ? overlay.drawer.title : 'none'}; modal=${!!overlay.modal ? overlay.modal.title : 'none'}; popover=${!!overlay.popover ? 'yes' : 'no'}`,
              { file: r.path, bytes: r.bytes, overlay, iconMeta: ic });
          if (overlay.drawer) await closeDrawer(page);
          else if (overlay.modal) {
            const cancel = page.locator('.ant-modal-footer button:has-text("Cancel"), .ant-modal-close, .ant-modal button:has-text("No")').first();
            if (await cancel.count() > 0) await cancel.click().catch(() => {});
            await dismissOverlays(page);
          } else if (overlay.popover) {
            const noBtn = page.locator('.ant-popconfirm button:has-text("Cancel"), .ant-popconfirm button:has-text("No")').first();
            if (await noBtn.count() > 0) await noBtn.click().catch(() => {});
            await dismissOverlays(page);
          }
          await settle(page, 800);
        } catch (e) { rec(`callback-md-action-${i}-${fileSafe}`, 'ERROR', String(e?.message || e)); }
      }
    }

    // ============ E) DETAILS DRAWER — switch to Feedback tab ============
    try {
      // Open MEETING DONE eye icon
      await clickRowAction(page, mdRowIdx, 0); // assume eye is first
      await settle(page, 1800);

      const fbTab = page.locator('.ant-drawer-open .ant-tabs-tab:has-text("Feedback")').first();
      if (await fbTab.count() > 0) {
        await fbTab.click();
        await settle(page, 1500);
        const overlay = await inspectActiveOverlay(page);
        const r = await shot(page, 'callback-details-feedback-tab.png');
        rec('callback-details-feedback-tab', 'CAPTURED',
            `Drawer="${overlay.drawer?.title}"; Radios=${JSON.stringify((overlay.drawer?.radios || []).slice(0, 15))}; Selects=${JSON.stringify(overlay.drawer?.selects || [])}; Sections=${JSON.stringify(overlay.drawer?.sections || [])}; Text preview: ${overlay.drawer?.textPreview?.slice(0, 800)}`,
            { file: r.path, bytes: r.bytes, overlay });
        // Save as feedback drawer (overwrite previous inline)
        fs.copyFileSync(r.path, path.join(OUT, 'callback-feedback-drawer.png'));
      } else {
        rec('callback-details-feedback-tab', 'NO_TAB', 'No Feedback tab found');
      }

      // Try Callback History tab too
      const histTab = page.locator('.ant-drawer-open .ant-tabs-tab:has-text("Callback History")').first();
      if (await histTab.count() > 0) {
        await histTab.click();
        await settle(page, 1500);
        const overlay = await inspectActiveOverlay(page);
        const r = await shot(page, 'callback-details-history-tab.png');
        rec('callback-details-history-tab', 'CAPTURED',
            `Drawer="${overlay.drawer?.title}"; Sections=${JSON.stringify(overlay.drawer?.sections || [])}; Text preview: ${overlay.drawer?.textPreview?.slice(0, 500)}`,
            { file: r.path, bytes: r.bytes, overlay });
      }

      await closeDrawer(page);
    } catch (e) { rec('callback-details-feedback-tab', 'ERROR', String(e?.message || e)); }

    // ============ F) CREATE DRAWER — select buyer + try to submit for validation ============
    try {
      const createBtn = page.locator('button:has-text("Create Callback")').first();
      await createBtn.click();
      await settle(page, 1500);
      // Search Anjali
      const searchInp = page.locator('.ant-drawer input[type="search"]').first();
      await searchInp.fill('Anjali');
      await settle(page, 600);
      const searchBtn = page.locator('.ant-drawer button:has-text("Search")').first();
      await searchBtn.click();
      await settle(page, 1500);
      // Select first radio
      const firstRadio = page.locator('.ant-drawer input[type="radio"]').first();
      if (await firstRadio.count() > 0) {
        await firstRadio.click({ force: true });
        await settle(page, 1200);
        const overlayAfterSelect = await inspectActiveOverlay(page);
        const rSel = await shot(page, 'callback-create-buyer-selected.png');
        rec('callback-create-buyer-selected', 'CAPTURED',
            `Buyer radio selected; buyerEmail=${overlayAfterSelect.drawer?.inputs?.find(i => i.id === 'buyerEmail')?.value}; managerEmail=${overlayAfterSelect.drawer?.inputs?.find(i => i.id === 'managerEmail')?.value}; Create disabled=${overlayAfterSelect.drawer?.buttons?.find(b => /Create/i.test(b.text))?.disabled}`,
            { file: rSel.path, bytes: rSel.bytes, overlay: overlayAfterSelect });

        // Now try to click Create (date missing) — expect either disabled or validation
        const createInsideBtn = page.locator('.ant-drawer button:has-text("Create")').last();
        const isDisabled = await createInsideBtn.isDisabled().catch(() => true);
        if (!isDisabled) {
          await createInsideBtn.click({ force: true }).catch(() => {});
          await settle(page, 1500);
        }
        const overlayFinal = await inspectActiveOverlay(page);
        const rVal = await shot(page, 'callback-create-drawer-validation.png');
        rec('callback-create-drawer-validation', 'CAPTURED',
            `After buyer select + Create attempt; Create disabled=${isDisabled}; Errors=${JSON.stringify(overlayFinal.drawer?.errors || [])}`,
            { file: rVal.path, bytes: rVal.bytes, overlay: overlayFinal });
      } else {
        rec('callback-create-buyer-selected', 'NO_RADIO', 'No radio found in search results');
      }

      await closeDrawer(page);
    } catch (e) { rec('callback-create-drawer-validation', 'ERROR', String(e?.message || e)); }

  } finally {
    fs.writeFileSync(path.join(__dirname, '_capture-sm-callback-modals-v4-results.json'), JSON.stringify(results, null, 2));
    console.log('\n=== V4 RESULTS WRITTEN ===');
    console.log(path.join(__dirname, '_capture-sm-callback-modals-v4-results.json'));
    await ctx.close();
    await browser.close();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
