// scripts/capture-allocation-active-states.js
//
// Targeted re-attempt for 3 previously UNREACHABLE BRD-referenced states on
// Allocation module — now that an Active campaign is expected to exist in UAT:
//   1. Rounds UI                  (BRD §10.4)        -> allocation-rounds-view.png
//   2. Stop Allocation modal      (Active-only)      -> allocation-stop-modal.png
//   3. Cancel Allocation modal    (Active-only)      -> allocation-cancel-modal.png
//
// Strategy:
//   - Open Allocation overview, pick a project
//   - Filter Status = Active; pick the first Active row
//   - Inspect detail page DOM (headings, tabs, buttons, links) and persist evidence
//   - Capture Rounds UI (tab/section text matching /Round/i) without confirming any action
//   - Open Stop confirmation modal, capture, dismiss with Cancel (never confirm)
//   - Open Cancel confirmation modal, capture, dismiss with Cancel (never confirm)
//   - If no Active row exists or any state still cannot be reached, log DOM evidence
//
// Output:
//   - PNGs in visual-memory/admin/allocation/
//   - JSON sidecar visual-memory/admin/allocation/_allocation-capture-notes-active.json

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'admin', 'allocation');
const URL      = 'https://uat-web.xrportal.in/admin/allocation';
const VIEWPORT = { width: 1920, height: 900 };

const results = {
  'Rounds UI':            { file: 'allocation-rounds-view.png', status: 'PENDING', note: '', selectors: {} },
  'Stop Allocation':      { file: 'allocation-stop-modal.png',  status: 'PENDING', note: '', selectors: {} },
  'Cancel Allocation':    { file: 'allocation-cancel-modal.png',status: 'PENDING', note: '', selectors: {} },
};

const domNotes = {
  activeRowFound: false,
  activeRowText: '',
  detailUrl: '',
  detailHeadings: [],
  detailTabs: [],
  detailButtons: [],
  detailLinks: [],
  detailBodyExcerpt: '',
  log: [],
};

function log(msg) {
  console.log(msg);
  domNotes.log.push(msg);
}

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
  // Filter-bar Project select (last "Select Project" placeholder is the filter; first is the form)
  const allSelects = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))');
  const count = await allSelects.count();
  if (count === 0) {
    log('  pickFirstProject: NO project select found at all');
    return false;
  }
  const target = allSelects.nth(count - 1); // filter sits below the form
  await target.click();
  await settle(page, 1000);
  const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
  const optCount = await opts.count();
  if (optCount === 0) {
    log('  pickFirstProject: project dropdown opened but 0 options');
    return false;
  }
  const firstOptText = await opts.first().innerText().catch(() => '');
  await opts.first().click();
  await settle(page, 2500);
  log(`  pickFirstProject: selected "${firstOptText}"`);
  return true;
}

async function pickStatus(page, statusLabel) {
  // Find the status select — placeholder "All Status" or current value
  const statusSel = page.locator('.ant-select:has(.ant-select-selection-item:has-text("All Status")), .ant-select:has(.ant-select-selection-placeholder:has-text("All Status"))').first();
  if (await statusSel.count() === 0) {
    log(`  pickStatus(${statusLabel}): status select not found`);
    return false;
  }
  await statusSel.click();
  await settle(page, 800);
  const opt = page.locator(`.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text("${statusLabel}")`).first();
  if (await opt.count() === 0) {
    log(`  pickStatus(${statusLabel}): option not present in dropdown`);
    await closeAnyOpenLayer(page);
    return false;
  }
  await opt.click();
  await settle(page, 2500);
  log(`  pickStatus: filter set to "${statusLabel}"`);
  return true;
}

async function clickViewOnFirstRow(page) {
  const rows = page.locator('tbody.ant-table-tbody tr.ant-table-row');
  const n = await rows.count();
  log(`  clickViewOnFirstRow: ${n} rows visible`);
  if (n === 0) return { ok: false, rowText: '' };
  const first = rows.first();
  const txt = await first.innerText().catch(() => '');
  const v = first.locator(':text("View")').first();
  if (await v.count() === 0) {
    log('  clickViewOnFirstRow: no "View" action in row');
    return { ok: false, rowText: txt };
  }
  await v.scrollIntoViewIfNeeded();
  await v.click();
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await settle(page, 2500);
  return { ok: true, rowText: txt };
}

async function inspectDetail(page) {
  return await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
      .map(b => ({
        text: (b.innerText || '').trim(),
        aria: b.getAttribute('aria-label') || '',
        disabled: b.disabled,
        cls: b.className || '',
      }))
      .filter(b => b.text || b.aria);
    const links = Array.from(document.querySelectorAll('a'))
      .map(a => ({ text: (a.innerText || '').trim(), href: a.getAttribute('href') || '' }))
      .filter(a => a.text);
    const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, [role="tab"]'))
      .map(t => (t.innerText || '').trim())
      .filter(Boolean);
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .map(h => `${h.tagName}: ${(h.innerText || '').trim()}`);
    const body = (document.body.innerText || '').slice(0, 6000);
    return { url: location.href, buttons, links, tabs, headings, body };
  });
}

async function captureRounds(page) {
  // Strategy 1: an ant tab labelled with "Round"
  const tab = page.locator('.ant-tabs-tab:has-text("Round"), [role="tab"]:has-text("Round")').first();
  if (await tab.count() > 0) {
    await tab.scrollIntoViewIfNeeded();
    await tab.click().catch(() => {});
    await settle(page, 1500);
    await page.screenshot({ path: path.join(OUT_DIR, results['Rounds UI'].file), fullPage: false });
    results['Rounds UI'].status = 'CAPTURED';
    results['Rounds UI'].note = 'Captured by clicking ant Rounds tab on Active campaign detail.';
    results['Rounds UI'].selectors = {
      tab: '.ant-tabs-tab:has-text("Round")',
      tabActiveClass: 'ant-tabs-tab-active',
    };
    log('  Rounds: CAPTURED via tab.');
    return true;
  }
  // Strategy 2: inline section/heading containing "Round"
  const inline = page.locator(':text("Round")').first();
  if (await inline.count() > 0) {
    await inline.scrollIntoViewIfNeeded();
    await settle(page, 600);
    await page.screenshot({ path: path.join(OUT_DIR, results['Rounds UI'].file), fullPage: false });
    results['Rounds UI'].status = 'CAPTURED';
    results['Rounds UI'].note = 'Captured by scrolling to inline Rounds section on Active campaign detail.';
    results['Rounds UI'].selectors = {
      section: ':text("Round")',
    };
    log('  Rounds: CAPTURED via inline section.');
    return true;
  }
  return false;
}

async function captureStopModal(page) {
  // Look for a primary "Stop" button on Campaign Actions (not "Stopped" pill, not form Reset)
  const stop = page.locator('button:has-text("Stop Allocation"), button:has-text("Stop Campaign"), button:has-text("Stop"):not(:has-text("Stopped"))').first();
  if (await stop.count() === 0) {
    log('  Stop: no Stop button on detail page');
    return false;
  }
  await stop.scrollIntoViewIfNeeded();
  await stop.click();
  await settle(page, 1500);

  // Confirm a confirmation modal is open
  const modal = page.locator('.ant-modal-content').first();
  if (await modal.count() === 0) {
    log('  Stop: clicked but no .ant-modal-content appeared');
    return false;
  }
  await page.screenshot({ path: path.join(OUT_DIR, results['Stop Allocation'].file), fullPage: false });

  // Extract modal selectors from DOM
  const modalInfo = await page.evaluate(() => {
    const m = document.querySelector('.ant-modal-content');
    if (!m) return null;
    const title = m.querySelector('.ant-modal-title')?.innerText?.trim() || '';
    const body  = m.querySelector('.ant-modal-body')?.innerText?.trim() || '';
    const btns  = Array.from(m.querySelectorAll('button')).map(b => ({
      text: (b.innerText || '').trim(),
      cls : b.className || '',
    }));
    return { title, body, btns };
  });
  results['Stop Allocation'].status = 'CAPTURED';
  results['Stop Allocation'].note   = `Modal title: "${modalInfo?.title}" body: "${modalInfo?.body?.slice(0,140)}"`;
  results['Stop Allocation'].selectors = {
    modal: '.ant-modal-content',
    title: '.ant-modal-title',
    body : '.ant-modal-body',
    confirmButtonHints: (modalInfo?.btns || []).filter(b => !/cancel/i.test(b.text)).map(b => `button:has-text("${b.text}")`),
    cancelButtonHints : (modalInfo?.btns || []).filter(b =>  /cancel/i.test(b.text)).map(b => `button:has-text("${b.text}")`),
    allModalButtons : modalInfo?.btns || [],
  };
  log('  Stop: CAPTURED. Dismissing with Cancel.');

  // Dismiss with the modal's own Cancel button (NOT the confirm)
  const cancelBtn = page.locator('.ant-modal-content button:has-text("Cancel")').first();
  if (await cancelBtn.count() > 0) {
    await cancelBtn.click();
  } else {
    await page.keyboard.press('Escape').catch(() => {});
  }
  await settle(page, 1200);
  await closeAnyOpenLayer(page);
  return true;
}

async function captureCancelModal(page) {
  // Cancel Allocation is the campaign-level action, NOT the modal close
  const cancel = page.locator('button:has-text("Cancel Allocation"), button:has-text("Cancel Campaign"), button:has-text("Cancel"):not(.ant-modal-content button)').first();
  if (await cancel.count() === 0) {
    log('  Cancel: no Cancel Allocation/Campaign button on detail page');
    return false;
  }
  // Avoid clicking the New Allocation Campaign form's Reset/Cancel if any
  // by ensuring the button sits within the Campaign Actions area; we can't always
  // assert that, so we click and validate a modal appears.
  await cancel.scrollIntoViewIfNeeded();
  await cancel.click();
  await settle(page, 1500);

  const modal = page.locator('.ant-modal-content').first();
  if (await modal.count() === 0) {
    log('  Cancel: clicked but no .ant-modal-content appeared');
    return false;
  }
  await page.screenshot({ path: path.join(OUT_DIR, results['Cancel Allocation'].file), fullPage: false });

  const modalInfo = await page.evaluate(() => {
    const m = document.querySelector('.ant-modal-content');
    if (!m) return null;
    const title = m.querySelector('.ant-modal-title')?.innerText?.trim() || '';
    const body  = m.querySelector('.ant-modal-body')?.innerText?.trim() || '';
    const btns  = Array.from(m.querySelectorAll('button')).map(b => ({
      text: (b.innerText || '').trim(),
      cls : b.className || '',
    }));
    return { title, body, btns };
  });
  results['Cancel Allocation'].status = 'CAPTURED';
  results['Cancel Allocation'].note   = `Modal title: "${modalInfo?.title}" body: "${modalInfo?.body?.slice(0,140)}"`;
  results['Cancel Allocation'].selectors = {
    modal: '.ant-modal-content',
    title: '.ant-modal-title',
    body : '.ant-modal-body',
    confirmButtonHints: (modalInfo?.btns || []).filter(b => !/cancel/i.test(b.text)).map(b => `button:has-text("${b.text}")`),
    cancelButtonHints : (modalInfo?.btns || []).filter(b =>  /cancel/i.test(b.text)).map(b => `button:has-text("${b.text}")`),
    allModalButtons : modalInfo?.btns || [],
  };
  log('  Cancel: CAPTURED. Dismissing with modal Cancel.');

  const cancelBtn = page.locator('.ant-modal-content button:has-text("Cancel")').first();
  if (await cancelBtn.count() > 0) {
    await cancelBtn.click();
  } else {
    await page.keyboard.press('Escape').catch(() => {});
  }
  await settle(page, 1200);
  await closeAnyOpenLayer(page);
  return true;
}

(async () => {
  if (!fs.existsSync(AUTH)) {
    console.error(`No auth file at ${AUTH}. Run: npm run auth:setup`);
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH, deviceScaleFactor: 1 });
  const page = await context.newPage();

  try {
    log('Navigating to Allocation overview...');
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);

    if (!(await pickFirstProject(page))) {
      log('FATAL: could not pick a project. Aborting.');
      throw new Error('no-project');
    }

    // Apply Active filter
    const activeOk = await pickStatus(page, 'Active');
    if (!activeOk) log('  status filter to Active was not applied — continuing with current rows.');

    await page.waitForSelector('tbody.ant-table-tbody', { timeout: 15_000 }).catch(() => {});
    await settle(page, 1500);

    const rowsCount = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
    log(`  After Active filter: ${rowsCount} rows visible`);
    if (rowsCount === 0) {
      log('  No Active rows found under this project. Will sweep other projects.');
    }

    // If no Active rows in the first project, sweep remaining projects
    let viewClicked = false;
    if (rowsCount > 0) {
      const v = await clickViewOnFirstRow(page);
      if (v.ok) {
        viewClicked = true;
        domNotes.activeRowFound = true;
        domNotes.activeRowText = v.rowText;
      }
    }

    if (!viewClicked) {
      log('  Sweeping other projects for Active campaigns...');
      // Re-open the project filter dropdown and walk through each option
      const filterSelect = page.locator('.ant-select:has(.ant-select-selection-item)').first();
      // We re-pick: open filter project select
      const projSelects = page.locator('.ant-select:has(.ant-select-selection-item):has-text(""), .ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))');
      // Simpler approach: open project dropdown by clicking the last visible non-disabled project picker.
      const projectFilter = page.locator('.ant-select:has(.ant-select-selection-item)').nth(0);
      // Skip — fallback approach below.

      // Fallback sweep: navigate fresh to URL and try each project in turn
      for (let attempt = 0; attempt < 6 && !viewClicked; attempt++) {
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        await settle(page, 1500);

        // Pick the Nth project (attempt index)
        const allSelects = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))');
        const cnt = await allSelects.count();
        if (cnt === 0) break;
        const target = allSelects.nth(cnt - 1);
        await target.click();
        await settle(page, 800);
        const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
        const optCnt = await opts.count();
        if (optCnt === 0 || attempt >= optCnt) {
          log(`  sweep: attempt ${attempt} — no more project options (have ${optCnt}).`);
          break;
        }
        const optText = await opts.nth(attempt).innerText().catch(() => '');
        await opts.nth(attempt).click();
        await settle(page, 2500);
        log(`  sweep[${attempt}]: project = "${optText}"`);

        const okStatus = await pickStatus(page, 'Active');
        if (!okStatus) continue;
        await settle(page, 2000);
        const rc = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
        log(`  sweep[${attempt}]: ${rc} Active rows`);
        if (rc === 0) continue;
        const v = await clickViewOnFirstRow(page);
        if (v.ok) {
          viewClicked = true;
          domNotes.activeRowFound = true;
          domNotes.activeRowText = v.rowText;
          break;
        }
      }
    }

    if (!viewClicked) {
      log('FATAL: Could not find any Active campaign across projects. All 3 states remain UNREACHABLE.');
      for (const k of Object.keys(results)) {
        results[k].status = 'UNREACHABLE';
        results[k].note   = 'No Active campaign row found in UAT across sweep of projects. Action is gated to Active status.';
      }
    } else {
      // Inspect detail
      log(`\nOn Active campaign detail. Row was: ${domNotes.activeRowText.split('\n').slice(0,4).join(' | ')}`);
      const det = await inspectDetail(page);
      domNotes.detailUrl       = det.url;
      domNotes.detailHeadings  = det.headings;
      domNotes.detailTabs      = det.tabs;
      domNotes.detailButtons   = det.buttons.map(b => `${b.text || b.aria}${b.disabled ? ' [disabled]' : ''}`);
      domNotes.detailLinks     = det.links.slice(0, 30).map(l => `${l.text} (${l.href})`);
      domNotes.detailBodyExcerpt = det.body;
      log(`  detail URL: ${det.url}`);
      log(`  headings: ${JSON.stringify(det.headings)}`);
      log(`  tabs: ${JSON.stringify(det.tabs)}`);
      log(`  buttons: ${JSON.stringify(det.buttons.map(b => b.text || b.aria).filter(Boolean))}`);

      // Capture Rounds FIRST (non-destructive — just scrolls / clicks tab)
      const roundsOk = await captureRounds(page);
      if (!roundsOk) {
        results['Rounds UI'].status = 'UNREACHABLE';
        results['Rounds UI'].note   = `No "Round" tab or section on Active campaign detail. Tabs observed: ${JSON.stringify(det.tabs)}. Headings: ${JSON.stringify(det.headings)}. Buttons: ${JSON.stringify(det.buttons.map(b => b.text).filter(Boolean))}.`;
        log('  Rounds: UNREACHABLE.');
      }

      // Capture Stop modal (open + cancel; do NOT confirm)
      await closeAnyOpenLayer(page);
      const stopOk = await captureStopModal(page);
      if (!stopOk) {
        results['Stop Allocation'].status = 'UNREACHABLE';
        results['Stop Allocation'].note   = `No Stop button or no modal opened on Active campaign detail. Buttons observed: ${JSON.stringify(det.buttons.map(b => b.text).filter(Boolean))}.`;
        log('  Stop: UNREACHABLE.');
      }

      // Capture Cancel modal
      await closeAnyOpenLayer(page);
      const cancelOk = await captureCancelModal(page);
      if (!cancelOk) {
        results['Cancel Allocation'].status = 'UNREACHABLE';
        results['Cancel Allocation'].note   = `No Cancel Allocation/Campaign button or no modal opened. Buttons observed: ${JSON.stringify(det.buttons.map(b => b.text).filter(Boolean))}.`;
        log('  Cancel: UNREACHABLE.');
      }
    }

    log('\n========== SUMMARY ==========');
    for (const [tag, r] of Object.entries(results)) {
      log(`${r.status.padEnd(12)} ${tag} -> ${r.file}  ${r.note ? '(' + r.note + ')' : ''}`);
    }

    fs.writeFileSync(
      path.join(OUT_DIR, '_allocation-capture-notes-active.json'),
      JSON.stringify({ results, domNotes }, null, 2),
    );
    log(`\nSidecar saved: visual-memory/admin/allocation/_allocation-capture-notes-active.json`);
  } catch (e) {
    console.error('SCRIPT ERROR:', e?.message || e);
  } finally {
    await context.close();
    await browser.close();
  }
})();
