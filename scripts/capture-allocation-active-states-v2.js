// scripts/capture-allocation-active-states-v2.js
//
// v2 of the Active-campaign capture pass.
// Key finding from v1 run: Stop / Cancel actions are EXPOSED IN THE TABLE ROW
// (Actions column) on the Allocation overview page, NOT on the campaign detail
// page. The detail page for an Active STATIC campaign only shows:
//   - "Back to Allocation Overview"
//   - "Download Bookings"
// (no Stop, no Cancel, no Rounds tab, no Rounds section)
//
// Strategy for v2:
//   1. Open Allocation, pick "Xanadu Test Project", filter Status = Active
//   2. On the ACTIVE row, find the Actions column. Dump every actionable element.
//   3. For each of {Stop, Cancel}:
//        a. Click the action ON THE ROW (not via View)
//        b. Capture confirmation modal
//        c. Dismiss with the modal's Cancel button (do not confirm)
//   4. For Rounds: navigate to detail page and confirm definitively that no
//      Rounds tab/section exists, dump full DOM evidence.

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'admin', 'allocation');
const URL      = 'https://uat-web.xrportal.in/admin/allocation';
const VIEWPORT = { width: 1920, height: 900 };

const results = {
  'Rounds UI':         { file: 'allocation-rounds-view.png',  status: 'PENDING', note: '', selectors: {} },
  'Stop Allocation':   { file: 'allocation-stop-modal.png',   status: 'PENDING', note: '', selectors: {} },
  'Cancel Allocation': { file: 'allocation-cancel-modal.png', status: 'PENDING', note: '', selectors: {} },
};

const evidence = {
  rowActionsHtml: '',
  rowActionsButtons: [],
  rowActionsLinks: [],
  rowActionsRaw: '',
  detailUrl: '',
  detailHeadings: [],
  detailTabs: [],
  detailButtons: [],
  detailFullText: '',
  stopModal: null,
  cancelModal: null,
  log: [],
};

function log(msg) { console.log(msg); evidence.log.push(msg); }
async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }

async function closeAnyOpenLayer(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(250);
  }
  await page.mouse.click(10, 10).catch(() => {});
  await page.waitForTimeout(300);
}

async function pickFirstProject(page) {
  const allSelects = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))');
  const count = await allSelects.count();
  if (count === 0) return false;
  const target = allSelects.nth(count - 1);
  await target.click();
  await settle(page, 1000);
  const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
  if (await opts.count() === 0) return false;
  const text = await opts.first().innerText().catch(() => '');
  await opts.first().click();
  await settle(page, 2500);
  log(`  project = "${text}"`);
  return true;
}

async function pickStatus(page, statusLabel) {
  const statusSel = page.locator('.ant-select:has(.ant-select-selection-item:has-text("All Status")), .ant-select:has(.ant-select-selection-placeholder:has-text("All Status"))').first();
  if (await statusSel.count() === 0) return false;
  await statusSel.click();
  await settle(page, 800);
  const opt = page.locator(`.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text("${statusLabel}")`).first();
  if (await opt.count() === 0) { await closeAnyOpenLayer(page); return false; }
  await opt.click();
  await settle(page, 2500);
  log(`  status filter = "${statusLabel}"`);
  return true;
}

async function dumpRowActions(page) {
  // Pull full info for the first row's Actions cell
  const dump = await page.evaluate(() => {
    const row = document.querySelector('tbody.ant-table-tbody tr.ant-table-row');
    if (!row) return null;
    const cells = Array.from(row.querySelectorAll('td'));
    const actionsCell = cells[cells.length - 1] || null;
    const rowFullText = (row.innerText || '').slice(0, 800);
    const buttons = actionsCell ? Array.from(actionsCell.querySelectorAll('button')).map(b => ({
      text: (b.innerText || '').trim(),
      aria: b.getAttribute('aria-label') || '',
      cls : b.className || '',
      disabled: b.disabled,
    })) : [];
    const links = actionsCell ? Array.from(actionsCell.querySelectorAll('a')).map(a => ({
      text: (a.innerText || '').trim(),
      href: a.getAttribute('href') || '',
      cls : a.className || '',
    })) : [];
    // Anchorless interactive spans inside actions cell
    const spans = actionsCell ? Array.from(actionsCell.querySelectorAll('span, div')).filter(el => {
      const t = (el.innerText || '').trim();
      return t && t.length < 40;
    }).map(el => ({
      tag: el.tagName,
      text: (el.innerText || '').trim(),
      cls : el.className || '',
    })) : [];
    return {
      html: actionsCell ? actionsCell.outerHTML.slice(0, 4000) : '',
      buttons, links, spans, rowFullText,
    };
  });
  return dump;
}

async function captureModalAfterClick(page, label, fileKey, beforeClickFn) {
  // beforeClickFn: async function that triggers the action; returns true on click ok
  const clicked = await beforeClickFn();
  if (!clicked) {
    log(`  ${label}: trigger not clicked.`);
    return null;
  }
  await settle(page, 1500);
  const modal = page.locator('.ant-modal-content').first();
  if (await modal.count() === 0) {
    log(`  ${label}: no .ant-modal-content after click.`);
    return null;
  }
  await page.screenshot({ path: path.join(OUT_DIR, results[fileKey].file), fullPage: false });
  const info = await page.evaluate(() => {
    const m = document.querySelector('.ant-modal-content');
    if (!m) return null;
    const title = m.querySelector('.ant-modal-title')?.innerText?.trim() || '';
    const body  = m.querySelector('.ant-modal-body')?.innerText?.trim() || '';
    const btns  = Array.from(m.querySelectorAll('button')).map(b => ({
      text: (b.innerText || '').trim(),
      cls : b.className || '',
      type: b.getAttribute('type') || '',
    }));
    return { title, body, btns };
  });
  log(`  ${label}: CAPTURED. title="${info?.title}" body="${(info?.body || '').slice(0,140)}"`);

  results[fileKey].status = 'CAPTURED';
  results[fileKey].note   = `Triggered from Actions column in Active row; modal title "${info?.title}".`;
  results[fileKey].selectors = {
    modalContainer : '.ant-modal-content',
    modalTitle     : '.ant-modal-title',
    modalBody      : '.ant-modal-body',
    modalFooter    : '.ant-modal-footer',
    confirmButtonHints : (info?.btns || []).filter(b => !/^cancel$/i.test(b.text)).map(b => `button:has-text("${b.text}")`),
    cancelButtonHints  : (info?.btns || []).filter(b =>  /^cancel$/i.test(b.text)).map(b => `button:has-text("${b.text}")`),
    allModalButtons    : info?.btns || [],
  };

  // Dismiss safely — click "Cancel" inside modal only
  const cancelInsideModal = page.locator('.ant-modal-content button:has-text("Cancel")').first();
  if (await cancelInsideModal.count() > 0) {
    await cancelInsideModal.click();
  } else {
    // Fallback: ESC
    await page.keyboard.press('Escape').catch(() => {});
  }
  await settle(page, 1500);
  await closeAnyOpenLayer(page);
  return info;
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No auth file.'); process.exit(1); }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  const page = await context.newPage();

  try {
    log('Navigating to Allocation overview...');
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);

    if (!(await pickFirstProject(page))) { throw new Error('no-project'); }
    if (!(await pickStatus(page, 'Active'))) { throw new Error('no-active-filter'); }

    await page.waitForSelector('tbody.ant-table-tbody', { timeout: 15_000 }).catch(() => {});
    await settle(page, 1500);

    const rc = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
    log(`  Active rows visible: ${rc}`);
    if (rc === 0) throw new Error('no-active-row');

    // Dump the Actions cell of the first Active row
    const dump = await dumpRowActions(page);
    evidence.rowActionsHtml    = dump?.html || '';
    evidence.rowActionsButtons = dump?.buttons || [];
    evidence.rowActionsLinks   = dump?.links || [];
    evidence.rowActionsRaw     = dump?.rowFullText || '';
    log(`  Row Actions buttons: ${JSON.stringify((dump?.buttons || []).map(b => b.text || b.aria))}`);
    log(`  Row Actions links  : ${JSON.stringify((dump?.links   || []).map(l => l.text))}`);

    // ---------- STOP MODAL ----------
    log('\n--- STOP MODAL ---');
    evidence.stopModal = await captureModalAfterClick(page, 'Stop', 'Stop Allocation', async () => {
      // Try button "Stop" first
      const row = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
      let trigger = row.locator('button:has-text("Stop")').first();
      if (await trigger.count() === 0) {
        // Try anchor / link
        trigger = row.locator('a:has-text("Stop"), :text("Stop"):not(:text("Stopped"))').first();
      }
      if (await trigger.count() === 0) return false;
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      return true;
    });
    if (!evidence.stopModal) {
      results['Stop Allocation'].status = 'UNREACHABLE';
      results['Stop Allocation'].note   = `Stop action not surfaced in row OR did not open a modal. Row buttons: ${JSON.stringify((dump?.buttons || []).map(b => b.text))}. Row links: ${JSON.stringify((dump?.links || []).map(l => l.text))}.`;
    }

    // After Stop dismiss, table may need a re-filter. Re-assert Active filter is still applied.
    const rc2 = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
    log(`  Rows after dismissing Stop modal: ${rc2}`);
    if (rc2 === 0) {
      log('  Rows disappeared after Stop dismiss — re-applying filter.');
      // Re-pick status if it lost state
      await pickStatus(page, 'Active').catch(() => {});
      await settle(page, 1500);
    }

    // ---------- CANCEL MODAL ----------
    log('\n--- CANCEL MODAL ---');
    evidence.cancelModal = await captureModalAfterClick(page, 'Cancel', 'Cancel Allocation', async () => {
      const row = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
      let trigger = row.locator('button:has-text("Cancel Allocation"), button:has-text("Cancel Campaign"), button:has-text("Cancel")').first();
      if (await trigger.count() === 0) {
        trigger = row.locator('a:has-text("Cancel"), :text("Cancel")').first();
      }
      if (await trigger.count() === 0) return false;
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      return true;
    });
    if (!evidence.cancelModal) {
      results['Cancel Allocation'].status = 'UNREACHABLE';
      results['Cancel Allocation'].note   = `Cancel action not surfaced in row OR did not open a modal. Row buttons: ${JSON.stringify((dump?.buttons || []).map(b => b.text))}. Row links: ${JSON.stringify((dump?.links || []).map(l => l.text))}.`;
    }

    // ---------- ROUNDS UI ----------
    log('\n--- ROUNDS UI ---');
    // Need to navigate to the Active campaign detail page. Re-apply filter if needed.
    const rc3 = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
    if (rc3 === 0) {
      log('  Re-applying Active filter before navigating to detail.');
      await pickStatus(page, 'Active').catch(() => {});
      await settle(page, 1500);
    }
    const viewLink = page.locator('tbody.ant-table-tbody tr.ant-table-row').first().locator(':text("View")').first();
    if (await viewLink.count() === 0) {
      log('  No View link on Active row — cannot inspect detail.');
      results['Rounds UI'].status = 'UNREACHABLE';
      results['Rounds UI'].note   = 'View link missing on Active row.';
    } else {
      await viewLink.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 2500);

      const det = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'))
          .map(b => ({ text: (b.innerText || '').trim(), aria: b.getAttribute('aria-label') || '', disabled: b.disabled, cls: b.className || '' }))
          .filter(b => b.text || b.aria);
        const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, [role="tab"]'))
          .map(t => (t.innerText || '').trim()).filter(Boolean);
        const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
          .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`);
        const fullText = (document.body.innerText || '').slice(0, 8000);
        return { url: location.href, buttons, tabs, headings, fullText };
      });
      evidence.detailUrl      = det.url;
      evidence.detailHeadings = det.headings;
      evidence.detailTabs     = det.tabs;
      evidence.detailButtons  = det.buttons.map(b => `${b.text || b.aria}${b.disabled ? ' [disabled]' : ''}`);
      evidence.detailFullText = det.fullText;
      log(`  detail URL: ${det.url}`);
      log(`  headings: ${JSON.stringify(det.headings)}`);
      log(`  tabs: ${JSON.stringify(det.tabs)}`);
      log(`  buttons: ${JSON.stringify(det.buttons.map(b => b.text || b.aria).filter(Boolean))}`);

      // Check for any "Round" mention
      const roundsFound = /round/i.test(det.fullText);
      if (det.tabs.some(t => /round/i.test(t))) {
        const tab = page.locator('.ant-tabs-tab:has-text("Round"), [role="tab"]:has-text("Round")').first();
        await tab.scrollIntoViewIfNeeded();
        await tab.click().catch(() => {});
        await settle(page, 1500);
        await page.screenshot({ path: path.join(OUT_DIR, results['Rounds UI'].file), fullPage: false });
        results['Rounds UI'].status = 'CAPTURED';
        results['Rounds UI'].note   = 'Captured Rounds tab on Active STATIC campaign detail.';
        results['Rounds UI'].selectors = { tab: '.ant-tabs-tab:has-text("Round")' };
        log('  Rounds: CAPTURED via tab.');
      } else if (roundsFound) {
        const inline = page.locator(':text("Round")').first();
        await inline.scrollIntoViewIfNeeded();
        await settle(page, 600);
        await page.screenshot({ path: path.join(OUT_DIR, results['Rounds UI'].file), fullPage: false });
        results['Rounds UI'].status = 'CAPTURED';
        results['Rounds UI'].note   = 'Captured inline Round* section on Active STATIC campaign detail.';
        results['Rounds UI'].selectors = { inline: ':text("Round")' };
        log('  Rounds: CAPTURED via inline.');
      } else {
        results['Rounds UI'].status = 'UNREACHABLE';
        results['Rounds UI'].note   = `No "Round" tab or text on Active STATIC campaign detail. Tabs: ${JSON.stringify(det.tabs)}. Headings: ${JSON.stringify(det.headings)}. Detail buttons: ${JSON.stringify(det.buttons.map(b => b.text).filter(Boolean))}. BRD §10.4 may pertain to a future feature OR to a Physical Event Active campaign (none currently seeded in UAT).`;
        log('  Rounds: UNREACHABLE — no "Round" anywhere on STATIC Active detail.');
      }
    }

    log('\n========== SUMMARY ==========');
    for (const [tag, r] of Object.entries(results)) {
      log(`${r.status.padEnd(12)} ${tag} -> ${r.file}  ${r.note ? '(' + r.note + ')' : ''}`);
    }

    fs.writeFileSync(
      path.join(OUT_DIR, '_allocation-capture-notes-active-v2.json'),
      JSON.stringify({ results, evidence }, null, 2),
    );
    log(`Sidecar saved: visual-memory/admin/allocation/_allocation-capture-notes-active-v2.json`);
  } catch (e) {
    console.error('SCRIPT ERROR:', e?.message || e);
    fs.writeFileSync(
      path.join(OUT_DIR, '_allocation-capture-notes-active-v2.json'),
      JSON.stringify({ results, evidence, fatal: String(e?.message || e) }, null, 2),
    );
  } finally {
    await context.close();
    await browser.close();
  }
})();
