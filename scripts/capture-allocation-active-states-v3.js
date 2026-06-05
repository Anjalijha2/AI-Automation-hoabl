// scripts/capture-allocation-active-states-v3.js
//
// v3 — based on v2 + BRD findings:
//   - Rounds UI is a DYNAMIC allocation-type feature (BRD §3). Active campaign
//     in UAT is STATIC, so Rounds is not applicable on the STATIC detail. We
//     re-attempt Rounds against any DYNAMIC campaign (any status) AND log if
//     no DYNAMIC campaign exists.
//   - Cancel is for UPCOMING campaigns (BRD §4 Rule 5: "Cancel removes an
//     Upcoming campaign before it starts"). v3 filters Status=Upcoming and
//     attempts the Cancel action on the row, captures modal, dismisses.
//
// Stop modal is already captured by v2 — re-run is harmless but the file
// will be re-written with the latest state.

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
  'Cancel Allocation': { file: 'allocation-cancel-modal.png', status: 'PENDING', note: '', selectors: {} },
};

const evidence = {
  upcomingRows : [],
  cancelRowActionsHtml: '',
  cancelRowButtons: [],
  cancelRowLinks: [],
  cancelRowText: '',
  cancelModal  : null,
  dynamicSearch: { rowsByStatus: {}, dynamicFound: false, dynamicDetail: null },
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
  if (await allSelects.count() === 0) return false;
  const target = allSelects.nth((await allSelects.count()) - 1);
  await target.click();
  await settle(page, 1000);
  const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
  if (await opts.count() === 0) return false;
  const t = await opts.first().innerText().catch(() => '');
  await opts.first().click();
  await settle(page, 2500);
  log(`  project = "${t}"`);
  return true;
}

async function pickStatus(page, statusLabel) {
  // Status select might display either "All Status" placeholder OR a previously chosen value
  const candidates = [
    '.ant-select:has(.ant-select-selection-item:has-text("All Status"))',
    '.ant-select:has(.ant-select-selection-placeholder:has-text("All Status"))',
    '.ant-select:has(.ant-select-selection-item:has-text("Active"))',
    '.ant-select:has(.ant-select-selection-item:has-text("Upcoming"))',
    '.ant-select:has(.ant-select-selection-item:has-text("Completed"))',
    '.ant-select:has(.ant-select-selection-item:has-text("Stopped"))',
  ];
  let statusSel = null;
  for (const sel of candidates) {
    const loc = page.locator(sel).first();
    if (await loc.count() > 0) { statusSel = loc; break; }
  }
  if (!statusSel) { log(`  pickStatus(${statusLabel}): no candidate select found`); return false; }
  await statusSel.click();
  await settle(page, 800);
  const opt = page.locator(`.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text("${statusLabel}")`).first();
  if (await opt.count() === 0) { await closeAnyOpenLayer(page); return false; }
  await opt.click();
  await settle(page, 2500);
  log(`  status filter -> "${statusLabel}"`);
  return true;
}

async function pickType(page, typeLabel) {
  // Type select shows "All Types" placeholder
  const typeSel = page.locator('.ant-select:has(.ant-select-selection-item:has-text("All Types")), .ant-select:has(.ant-select-selection-placeholder:has-text("All Types"))').first();
  if (await typeSel.count() === 0) { log(`  pickType(${typeLabel}): no Type select found`); return false; }
  await typeSel.click();
  await settle(page, 800);
  const opt = page.locator(`.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text("${typeLabel}")`).first();
  if (await opt.count() === 0) { await closeAnyOpenLayer(page); log(`  pickType(${typeLabel}): option not in dropdown`); return false; }
  await opt.click();
  await settle(page, 2500);
  log(`  type filter -> "${typeLabel}"`);
  return true;
}

async function dumpFirstRow(page) {
  return await page.evaluate(() => {
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
    return {
      html: actionsCell ? actionsCell.outerHTML.slice(0, 4000) : '',
      buttons, links, rowFullText,
    };
  });
}

async function captureCancelModal(page) {
  const row = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
  let trigger = row.locator('button:has-text("Cancel Allocation"), button:has-text("Cancel Campaign"), button:has-text("Cancel")').first();
  if (await trigger.count() === 0) {
    trigger = row.locator('a:has-text("Cancel"), :text("Cancel")').first();
  }
  if (await trigger.count() === 0) {
    log('  Cancel: no Cancel-style trigger on Upcoming row');
    return null;
  }
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await settle(page, 1500);
  const modal = page.locator('.ant-modal-content').first();
  if (await modal.count() === 0) {
    log('  Cancel: clicked but no .ant-modal-content');
    return null;
  }
  await page.screenshot({ path: path.join(OUT_DIR, results['Cancel Allocation'].file), fullPage: false });
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
  log(`  Cancel: CAPTURED. title="${info?.title}" body="${(info?.body || '').slice(0,140)}"`);
  results['Cancel Allocation'].status = 'CAPTURED';
  results['Cancel Allocation'].note   = `Triggered from Actions column in Upcoming row; modal title "${info?.title}".`;
  results['Cancel Allocation'].selectors = {
    modalContainer : '.ant-modal-content',
    modalTitle     : '.ant-modal-title',
    modalBody      : '.ant-modal-body',
    modalFooter    : '.ant-modal-footer',
    allModalButtons: info?.btns || [],
    closeButtonHints  : (info?.btns || []).filter(b => /close|cancel/i.test(b.text) && !/yes/i.test(b.text)).map(b => `button:has-text("${b.text}")`),
    confirmButtonHints: (info?.btns || []).filter(b => /yes|confirm|ok/i.test(b.text)).map(b => `button:has-text("${b.text}")`),
  };
  // Dismiss safely
  const dismiss = page.locator('.ant-modal-content button:has-text("Close"), .ant-modal-content button:has-text("Cancel")').first();
  if (await dismiss.count() > 0) {
    await dismiss.click();
  } else {
    await page.keyboard.press('Escape').catch(() => {});
  }
  await settle(page, 1200);
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

    if (!(await pickFirstProject(page))) throw new Error('no-project');

    // ---------- CANCEL on UPCOMING row ----------
    log('\n--- CANCEL on UPCOMING ---');
    const upcomingOk = await pickStatus(page, 'Upcoming');
    if (!upcomingOk) {
      log('  could not apply Upcoming filter');
    } else {
      await page.waitForSelector('tbody.ant-table-tbody', { timeout: 15_000 }).catch(() => {});
      await settle(page, 1500);
      const rc = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
      log(`  Upcoming rows: ${rc}`);
      evidence.upcomingRows.push({ project: 'Xanadu Test Project', rowCount: rc });
      if (rc === 0) {
        // Sweep all projects for Upcoming campaigns
        log('  No Upcoming in current project. Sweeping other projects...');
        for (let i = 1; i < 8; i++) {
          await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
          await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
          await settle(page, 1500);
          const allSelects = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))');
          const cnt = await allSelects.count();
          if (cnt === 0) break;
          const target = allSelects.nth(cnt - 1);
          await target.click();
          await settle(page, 800);
          const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
          const optCnt = await opts.count();
          if (i >= optCnt) { log(`  sweep[${i}]: out of project options (have ${optCnt})`); break; }
          const optText = await opts.nth(i).innerText().catch(() => '');
          await opts.nth(i).click();
          await settle(page, 2500);
          log(`  sweep[${i}]: project = "${optText}"`);
          const ok = await pickStatus(page, 'Upcoming');
          if (!ok) continue;
          await settle(page, 1500);
          const rrc = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
          evidence.upcomingRows.push({ project: optText, rowCount: rrc });
          log(`  sweep[${i}]: Upcoming rows in "${optText}" = ${rrc}`);
          if (rrc > 0) break;
        }
      }
      const rc2 = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
      if (rc2 === 0) {
        results['Cancel Allocation'].status = 'UNREACHABLE';
        results['Cancel Allocation'].note   = `Zero Upcoming campaigns across all sweeped projects in UAT. Cancel action per BRD §4 Rule 5 applies only to Upcoming status. Sweep result: ${JSON.stringify(evidence.upcomingRows)}.`;
      } else {
        const dump = await dumpFirstRow(page);
        evidence.cancelRowActionsHtml = dump?.html || '';
        evidence.cancelRowButtons     = dump?.buttons || [];
        evidence.cancelRowLinks       = dump?.links || [];
        evidence.cancelRowText        = dump?.rowFullText || '';
        log(`  Upcoming row buttons: ${JSON.stringify((dump?.buttons || []).map(b => b.text))}`);
        log(`  Upcoming row links  : ${JSON.stringify((dump?.links   || []).map(l => l.text))}`);
        evidence.cancelModal = await captureCancelModal(page);
        if (!evidence.cancelModal) {
          results['Cancel Allocation'].status = 'UNREACHABLE';
          results['Cancel Allocation'].note   = `Upcoming row found but no Cancel action surfaced. Row buttons: ${JSON.stringify((dump?.buttons || []).map(b => b.text))}. Row links: ${JSON.stringify((dump?.links || []).map(l => l.text))}.`;
        }
      }
    }

    // ---------- ROUNDS on DYNAMIC campaign ----------
    log('\n--- ROUNDS on DYNAMIC campaign ---');
    // Try All Status with type=Dynamic across all projects
    let dynamicCaptured = false;
    for (let i = 0; i < 8 && !dynamicCaptured; i++) {
      await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 1500);
      const allSelects = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))');
      const cnt = await allSelects.count();
      if (cnt === 0) break;
      const target = allSelects.nth(cnt - 1);
      await target.click();
      await settle(page, 800);
      const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
      const optCnt = await opts.count();
      if (i >= optCnt) { log(`  dynamicSweep[${i}]: out of projects`); break; }
      const optText = await opts.nth(i).innerText().catch(() => '');
      await opts.nth(i).click();
      await settle(page, 2500);
      log(`  dynamicSweep[${i}]: project = "${optText}"`);

      // Apply Type=Dynamic filter (verify option exists)
      const ok = await pickType(page, 'Dynamic');
      if (!ok) {
        log(`  dynamicSweep[${i}]: Type filter has no Dynamic option in project "${optText}" — note this; will continue.`);
        continue;
      }
      await settle(page, 1500);
      const rrc = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
      log(`  dynamicSweep[${i}]: Dynamic rows in "${optText}" = ${rrc}`);
      evidence.dynamicSearch.rowsByStatus[optText] = rrc;
      if (rrc === 0) continue;

      // Click View on first Dynamic row
      const view = page.locator('tbody.ant-table-tbody tr.ant-table-row').first().locator(':text("View")').first();
      if (await view.count() === 0) continue;
      await view.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 2500);

      const det = await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, [role="tab"]'))
          .map(t => (t.innerText || '').trim()).filter(Boolean);
        const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
          .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`);
        const buttons = Array.from(document.querySelectorAll('button'))
          .map(b => ({ text: (b.innerText || '').trim() })).filter(b => b.text);
        const full = (document.body.innerText || '').slice(0, 8000);
        return { url: location.href, tabs, headings, buttons, full };
      });
      evidence.dynamicSearch.dynamicFound = true;
      evidence.dynamicSearch.dynamicDetail = det;
      log(`  Dynamic detail URL: ${det.url}`);
      log(`  Dynamic tabs: ${JSON.stringify(det.tabs)}`);
      log(`  Dynamic headings: ${JSON.stringify(det.headings)}`);
      log(`  Dynamic buttons: ${JSON.stringify(det.buttons.map(b => b.text))}`);
      const roundsTab = page.locator('.ant-tabs-tab:has-text("Round"), [role="tab"]:has-text("Round")').first();
      if (await roundsTab.count() > 0) {
        await roundsTab.scrollIntoViewIfNeeded();
        await roundsTab.click().catch(() => {});
        await settle(page, 1500);
        await page.screenshot({ path: path.join(OUT_DIR, results['Rounds UI'].file), fullPage: false });
        results['Rounds UI'].status = 'CAPTURED';
        results['Rounds UI'].note   = `Captured Rounds tab on DYNAMIC campaign detail (project "${optText}").`;
        results['Rounds UI'].selectors = { tab: '.ant-tabs-tab:has-text("Round")' };
        dynamicCaptured = true;
        log('  Rounds: CAPTURED via tab on DYNAMIC detail.');
      } else if (/round/i.test(det.full)) {
        const inline = page.locator(':text("Round")').first();
        await inline.scrollIntoViewIfNeeded();
        await settle(page, 600);
        await page.screenshot({ path: path.join(OUT_DIR, results['Rounds UI'].file), fullPage: false });
        results['Rounds UI'].status = 'CAPTURED';
        results['Rounds UI'].note   = `Captured inline Round* on DYNAMIC campaign detail (project "${optText}").`;
        results['Rounds UI'].selectors = { inline: ':text("Round")' };
        dynamicCaptured = true;
        log('  Rounds: CAPTURED inline on DYNAMIC detail.');
      } else {
        log('  Dynamic detail does NOT mention "Round" — continuing sweep.');
      }
    }
    if (!dynamicCaptured) {
      // Was Dynamic even an available option in the Type dropdown?
      // We log all options for traceability
      await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 1500);
      await pickFirstProject(page);
      const typeSel = page.locator('.ant-select:has(.ant-select-selection-item:has-text("All Types")), .ant-select:has(.ant-select-selection-placeholder:has-text("All Types"))').first();
      let typeOptions = [];
      if (await typeSel.count() > 0) {
        await typeSel.click();
        await settle(page, 800);
        typeOptions = await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').allInnerTexts().catch(() => []);
        await closeAnyOpenLayer(page);
      }
      evidence.dynamicSearch.typeFilterOptions = typeOptions;
      results['Rounds UI'].status = 'UNREACHABLE';
      results['Rounds UI'].note   = `No DYNAMIC campaign exists in UAT (sweep across projects). Type filter options observed: ${JSON.stringify(typeOptions)}. BRD §3 says Rounds UI is the Dynamic allocation-type screen; zero Dynamic campaigns seeded.`;
    }

    log('\n========== SUMMARY ==========');
    for (const [tag, r] of Object.entries(results)) {
      log(`${r.status.padEnd(12)} ${tag} -> ${r.file}  ${r.note ? '(' + r.note.slice(0,180) + (r.note.length > 180 ? '…' : '') + ')' : ''}`);
    }

    fs.writeFileSync(
      path.join(OUT_DIR, '_allocation-capture-notes-active-v3.json'),
      JSON.stringify({ results, evidence }, null, 2),
    );
    log(`Sidecar saved: visual-memory/admin/allocation/_allocation-capture-notes-active-v3.json`);
  } catch (e) {
    console.error('SCRIPT ERROR:', e?.message || e);
    fs.writeFileSync(
      path.join(OUT_DIR, '_allocation-capture-notes-active-v3.json'),
      JSON.stringify({ results, evidence, fatal: String(e?.message || e) }, null, 2),
    );
  } finally {
    await context.close();
    await browser.close();
  }
})();
