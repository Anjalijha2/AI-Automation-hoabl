// scripts/capture-allocation-missing-states-v2.js
//
// Pass 2: click "View" to actually load the campaign detail page, then look for
// Rounds, Export, Notify, Stop, Cancel UI there. Also try filtering by status to
// find an Active/Approved campaign for Stop/Cancel.

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'admin', 'allocation');
const URL      = 'https://uat-web.xrportal.in/admin/allocation';
const VIEWPORT = { width: 1920, height: 900 };

const results = {
  '1 (Rounds UI)':              { file: 'allocation-rounds-view.png',            status: 'PENDING', note: '' },
  '2 (Export UI)':              { file: 'allocation-export-ui.png',              status: 'PENDING', note: '' },
  '3 (Notify UI)':              { file: 'allocation-notify-ui.png',              status: 'PENDING', note: '' },
  '4 (Stop Allocation modal)':  { file: 'allocation-stop-modal.png',             status: 'PENDING', note: '' },
  '5 (Cancel Allocation modal)':{ file: 'allocation-cancel-modal.png',           status: 'PENDING', note: '' },
};

const domNotes = {
  detailPageUrl:        '',
  detailHeadings:       [],
  detailTabs:           [],
  detailAllButtons:     [],
  detailBodySnippet:    '',
  statusFilterOptions:  [],
  approvedRowSearch:    { tried: false, found: false, status: '' },
  roundsUi:             {},
  exportUi:             {},
  notifyUi:             {},
  stopModal:            {},
  cancelModal:          {},
};

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }
async function closeAnyOpenLayer(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
  }
  await page.mouse.click(10, 10).catch(() => {});
  await page.waitForTimeout(300);
}

async function pickFirstProject(page) {
  const allSelects = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))');
  const count = await allSelects.count();
  if (count === 0) return false;
  const target = allSelects.nth(count - 1);
  await target.scrollIntoViewIfNeeded();
  await target.click();
  await settle(page, 1200);
  const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
  if (await opts.count() === 0) return false;
  await opts.first().click();
  await settle(page, 2500);
  return true;
}

async function pickStatusFilter(page, statusLabel) {
  // Click the "All Status" filter and try to pick the requested option
  const sel = page.locator('.ant-select:has(.ant-select-selection-item:has-text("All Status")), .ant-select:has(.ant-select-selection-placeholder:has-text("All Status"))').first();
  if (await sel.count() === 0) return { ok: false, options: [] };
  await sel.scrollIntoViewIfNeeded();
  await sel.click();
  await settle(page, 1000);
  const optsLoc = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
  const optCount = await optsLoc.count();
  const options = [];
  for (let i = 0; i < optCount; i++) {
    options.push((await optsLoc.nth(i).innerText().catch(() => '')).trim());
  }
  // Try to click the requested status
  const target = page.locator(
    `.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text("${statusLabel}")`
  ).first();
  if (await target.count() > 0) {
    await target.click();
    await settle(page, 2500);
    return { ok: true, options };
  }
  // Couldn't find — close dropdown
  await page.keyboard.press('Escape');
  await settle(page, 500);
  return { ok: false, options };
}

(async () => {
  if (!fs.existsSync(AUTH)) { console.error('No auth file.'); process.exit(1); }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    storageState: AUTH,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to', URL);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await settle(page, 2500);

    await pickFirstProject(page);
    await page.waitForSelector('tbody.ant-table-tbody tr.ant-table-row', { timeout: 15_000 }).catch(() => {});
    await settle(page, 1500);

    // Capture status filter dropdown options first (intel for BA)
    console.log('\n[I] Capturing Status filter options');
    const statusOptions = await page.evaluate(() => {
      // Just enumerate later — return placeholder for now
      return [];
    });
    // Open Status dropdown to enumerate
    const statusSel = page.locator('.ant-select:has(.ant-select-selection-item:has-text("All Status"))').first();
    if (await statusSel.count() > 0) {
      await statusSel.click();
      await settle(page, 1000);
      const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
      const c = await opts.count();
      const arr = [];
      for (let i = 0; i < c; i++) {
        arr.push((await opts.nth(i).innerText().catch(() => '')).trim());
      }
      domNotes.statusFilterOptions = arr;
      console.log('  Status options:', arr);
      await page.keyboard.press('Escape');
      await settle(page, 500);
    }

    // ----------------------------------------------------------------
    // STEP A — click "View" on first row to access the detail page.
    // ----------------------------------------------------------------
    console.log('\n[A] Clicking "View" on first campaign row');
    const firstRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
    const viewBtn = firstRow.locator('a:has-text("View"), button:has-text("View"), :text("View")').first();
    if (await viewBtn.count() === 0) {
      console.log('  No View link found.');
    } else {
      await viewBtn.scrollIntoViewIfNeeded();
      await viewBtn.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 2500);
    }

    domNotes.detailPageUrl = page.url();
    console.log('  Now at URL:', domNotes.detailPageUrl);

    // Inspect detail page comprehensively
    const detailInspect = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5'))
        .map(h => `${h.tagName}: ${h.innerText.trim()}`);
      const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, [role="tab"]'))
        .map(t => t.innerText.trim());
      const buttons = Array.from(document.querySelectorAll('button'))
        .map(b => ({ text: b.innerText.trim(), aria: b.getAttribute('aria-label') || '', disabled: b.disabled }))
        .filter(b => b.text || b.aria);
      const bodySnippet = document.body.innerText.slice(0, 3000);
      return { headings, tabs, buttons, bodySnippet };
    });
    domNotes.detailHeadings    = detailInspect.headings;
    domNotes.detailTabs        = detailInspect.tabs;
    domNotes.detailAllButtons  = detailInspect.buttons;
    domNotes.detailBodySnippet = detailInspect.bodySnippet;

    console.log('  Detail headings:', detailInspect.headings);
    console.log('  Detail tabs:', detailInspect.tabs);
    console.log('  Detail buttons:', detailInspect.buttons.map(b => b.text || b.aria).filter(Boolean).slice(0, 30));

    // ----------------------------------------------------------------
    // 1 — Rounds UI: scroll through detail page, look for Rounds tab/section
    // ----------------------------------------------------------------
    console.log('\n[1] Rounds UI');
    try {
      // Look for tab/anchor/heading containing "Round"
      const roundsTab = page.locator('.ant-tabs-tab:has-text("Round"), [role="tab"]:has-text("Round"), a:has-text("Round"), button:has-text("Round")').first();
      if (await roundsTab.count() > 0) {
        await roundsTab.scrollIntoViewIfNeeded();
        await roundsTab.click();
        await settle(page, 2000);
        domNotes.roundsUi = await page.evaluate(() => ({
          url:        location.href,
          activeTab:  document.querySelector('.ant-tabs-tab-active, [role="tab"][aria-selected="true"]')?.innerText.trim() || '',
          body:       document.body.innerText.slice(0, 1500),
        }));
        await page.screenshot({ path: path.join(OUT_DIR, results['1 (Rounds UI)'].file), fullPage: false });
        results['1 (Rounds UI)'].status = 'CAPTURED';
        console.log('  CAPTURED. Rounds active tab:', domNotes.roundsUi.activeTab);
      } else {
        // Rounds may render inline as a section. Check page body text for "Round"
        const hasRoundsHeading = detailInspect.bodySnippet.toLowerCase().includes('round');
        if (hasRoundsHeading) {
          // scroll to first "Round" heading
          await page.evaluate(() => {
            const all = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6,div,section'));
            const target = all.find(e => /round/i.test(e.innerText) && e.innerText.length < 100);
            if (target) target.scrollIntoView({ block: 'center' });
          });
          await settle(page, 1500);
          await page.screenshot({ path: path.join(OUT_DIR, results['1 (Rounds UI)'].file), fullPage: false });
          domNotes.roundsUi = {
            url: page.url(),
            note: '"Round" text found inline (not a tab) — page scrolled to it.',
          };
          results['1 (Rounds UI)'].status = 'CAPTURED';
          results['1 (Rounds UI)'].note   = 'Rounds rendered inline as section, not tab.';
          console.log('  CAPTURED (inline Rounds section).');
        } else {
          results['1 (Rounds UI)'].status = 'UNREACHABLE';
          results['1 (Rounds UI)'].note   = `No "Round" tab/section found on this campaign's detail page (status=${detailInspect.bodySnippet.match(/Status[:\s]+([A-Za-z]+)/)?.[1] || 'unknown'}). Detail tabs: ${detailInspect.tabs.join(', ') || 'none'}.`;
          console.log('  UNREACHABLE: no Rounds tab/section.');
        }
      }
    } catch (e) {
      results['1 (Rounds UI)'].note = e.message;
      console.log('  ERROR:', e.message);
    }

    // ----------------------------------------------------------------
    // 2 — Export UI
    // ----------------------------------------------------------------
    console.log('\n[2] Export UI');
    try {
      const exportBtn = page.locator('button:has-text("Export"), a:has-text("Export"), button[aria-label*="Export"]').first();
      if (await exportBtn.count() === 0) {
        results['2 (Export UI)'].status = 'UNREACHABLE';
        results['2 (Export UI)'].note   = 'No Export button on campaign detail page.';
        console.log('  UNREACHABLE: no Export button.');
      } else {
        await exportBtn.scrollIntoViewIfNeeded();
        await exportBtn.click();
        await settle(page, 1500);
        domNotes.exportUi = await page.evaluate(() => {
          const ctr = document.querySelector('.ant-dropdown:not(.ant-dropdown-hidden), .ant-modal-content, .ant-popover-inner');
          if (!ctr) return { found: false };
          const items = Array.from(ctr.querySelectorAll('.ant-dropdown-menu-item, button, a, label'))
            .map(i => i.innerText.trim()).filter(Boolean);
          return {
            found: true,
            type: ctr.className,
            title: ctr.querySelector('.ant-modal-title')?.innerText || '',
            items: items.slice(0, 20),
          };
        });
        await page.screenshot({ path: path.join(OUT_DIR, results['2 (Export UI)'].file), fullPage: false });
        results['2 (Export UI)'].status = 'CAPTURED';
        console.log('  CAPTURED. Export UI:', domNotes.exportUi);
        await closeAnyOpenLayer(page);
      }
    } catch (e) {
      results['2 (Export UI)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeAnyOpenLayer(page);
    }

    // ----------------------------------------------------------------
    // 3 — Notify UI
    // ----------------------------------------------------------------
    console.log('\n[3] Notify UI');
    try {
      const notifyBtn = page.locator('button:has-text("Notify"), a:has-text("Notify"), button[aria-label*="Notify"]').first();
      if (await notifyBtn.count() === 0) {
        results['3 (Notify UI)'].status = 'UNREACHABLE';
        results['3 (Notify UI)'].note   = 'No Notify button on campaign detail page.';
        console.log('  UNREACHABLE: no Notify button.');
      } else {
        await notifyBtn.scrollIntoViewIfNeeded();
        await notifyBtn.click();
        await settle(page, 1500);
        domNotes.notifyUi = await page.evaluate(() => {
          const ctr = document.querySelector('.ant-dropdown:not(.ant-dropdown-hidden), .ant-modal-content, .ant-popover-inner');
          if (!ctr) return { found: false };
          const items = Array.from(ctr.querySelectorAll('.ant-dropdown-menu-item, button, a, label, input'))
            .map(i => i.innerText?.trim() || i.placeholder || '').filter(Boolean);
          return {
            found: true,
            type: ctr.className,
            title: ctr.querySelector('.ant-modal-title')?.innerText || '',
            items: items.slice(0, 20),
          };
        });
        await page.screenshot({ path: path.join(OUT_DIR, results['3 (Notify UI)'].file), fullPage: false });
        results['3 (Notify UI)'].status = 'CAPTURED';
        console.log('  CAPTURED. Notify UI:', domNotes.notifyUi);
        await closeAnyOpenLayer(page);
      }
    } catch (e) {
      results['3 (Notify UI)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeAnyOpenLayer(page);
    }

    // ----------------------------------------------------------------
    // 4, 5 — Stop / Cancel modals
    //   The first row was "Completed". Stop/Cancel likely only available
    //   on Active/Running/Approved campaigns. Try to filter and find one.
    // ----------------------------------------------------------------
    console.log('\n[4,5] Stop / Cancel — checking current detail first');
    let stopOrCancelHere = false;
    try {
      const stopBtn   = page.locator('button:has-text("Stop"):not(:has-text("Stopped"))').first();
      const cancelBtn = page.locator('button:has-text("Cancel"):not(:has-text("Cancelled"))').first();
      const stopCount   = await stopBtn.count();
      const cancelCount = await cancelBtn.count();
      console.log(`  Stop button on Completed campaign: ${stopCount}, Cancel: ${cancelCount}`);

      if (stopCount > 0) {
        await stopBtn.scrollIntoViewIfNeeded();
        await stopBtn.click();
        await settle(page, 1500);
        await page.waitForSelector('.ant-modal-content, .ant-popover-inner', { timeout: 5_000 }).catch(() => {});
        await settle(page, 800);
        domNotes.stopModal = await page.evaluate(() => {
          const modal = document.querySelector('.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content, .ant-modal-content, .ant-popover-inner');
          if (!modal) return { found: false };
          return {
            found:   true,
            title:   modal.querySelector('.ant-modal-title, .ant-popover-title')?.innerText || '',
            body:    (modal.querySelector('.ant-modal-body, .ant-popover-inner-content')?.innerText || '').slice(0, 400),
            buttons: Array.from(modal.querySelectorAll('button')).map(b => b.innerText.trim()),
          };
        });
        await page.screenshot({ path: path.join(OUT_DIR, results['4 (Stop Allocation modal)'].file), fullPage: false });
        results['4 (Stop Allocation modal)'].status = 'CAPTURED';
        console.log('  CAPTURED stop modal:', domNotes.stopModal);
        await closeAnyOpenLayer(page);
        stopOrCancelHere = true;
      }
      if (cancelCount > 0) {
        await cancelBtn.scrollIntoViewIfNeeded();
        await cancelBtn.click();
        await settle(page, 1500);
        await page.waitForSelector('.ant-modal-content, .ant-popover-inner', { timeout: 5_000 }).catch(() => {});
        await settle(page, 800);
        domNotes.cancelModal = await page.evaluate(() => {
          const modal = document.querySelector('.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content, .ant-modal-content, .ant-popover-inner');
          if (!modal) return { found: false };
          return {
            found:   true,
            title:   modal.querySelector('.ant-modal-title, .ant-popover-title')?.innerText || '',
            body:    (modal.querySelector('.ant-modal-body, .ant-popover-inner-content')?.innerText || '').slice(0, 400),
            buttons: Array.from(modal.querySelectorAll('button')).map(b => b.innerText.trim()),
          };
        });
        await page.screenshot({ path: path.join(OUT_DIR, results['5 (Cancel Allocation modal)'].file), fullPage: false });
        results['5 (Cancel Allocation modal)'].status = 'CAPTURED';
        console.log('  CAPTURED cancel modal:', domNotes.cancelModal);
        await closeAnyOpenLayer(page);
        stopOrCancelHere = true;
      }
    } catch (e) {
      console.log('  ERROR Stop/Cancel pass 1:', e.message);
    }

    // If Stop/Cancel still missing, go back and try to filter by "Active" / "Approved" / "Running"
    if (results['4 (Stop Allocation modal)'].status !== 'CAPTURED' ||
        results['5 (Cancel Allocation modal)'].status !== 'CAPTURED') {
      console.log('\n[4,5 retry] Going back to filter for Active/Approved campaign');
      try {
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        await settle(page, 2500);
        await pickFirstProject(page);
        await page.waitForSelector('tbody.ant-table-tbody tr.ant-table-row', { timeout: 15_000 }).catch(() => {});
        await settle(page, 1500);

        // Try filtering by Active first, fall back to Approved, then Running
        let filterApplied = false;
        let appliedLabel  = '';
        for (const candidate of ['Active', 'Approved', 'Running']) {
          const r = await pickStatusFilter(page, candidate);
          if (r.ok) {
            filterApplied = true;
            appliedLabel  = candidate;
            console.log(`  Filter applied: ${candidate}. Available options were: ${r.options.join(', ')}`);
            domNotes.statusFilterOptions = r.options;
            break;
          } else if (r.options.length > 0) {
            domNotes.statusFilterOptions = r.options;
            console.log(`  ${candidate} not in list. Options: ${r.options.join(', ')}`);
          }
        }
        domNotes.approvedRowSearch.tried = true;
        domNotes.approvedRowSearch.status = appliedLabel;

        if (filterApplied) {
          // Wait for table refresh and check rows
          await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
          await settle(page, 2000);
          const rowCount = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
          console.log(`  Rows after filter "${appliedLabel}": ${rowCount}`);
          domNotes.approvedRowSearch.found = rowCount > 0;

          if (rowCount > 0) {
            // Click View on the first filtered row
            const row = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
            const v = row.locator(':text("View")').first();
            if (await v.count() > 0) {
              await v.scrollIntoViewIfNeeded();
              await v.click();
              await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
              await settle(page, 2500);

              const rerun = await page.evaluate(() => ({
                url: location.href,
                buttons: Array.from(document.querySelectorAll('button'))
                  .map(b => b.innerText.trim()).filter(Boolean).slice(0, 40),
              }));
              console.log(`  Now at: ${rerun.url}`);
              console.log(`  Buttons on this detail: ${rerun.buttons.join(' | ')}`);

              // Try Stop again
              if (results['4 (Stop Allocation modal)'].status !== 'CAPTURED') {
                const stopBtn = page.locator('button:has-text("Stop"):not(:has-text("Stopped"))').first();
                if (await stopBtn.count() > 0) {
                  await stopBtn.scrollIntoViewIfNeeded();
                  await stopBtn.click();
                  await settle(page, 1500);
                  await page.waitForSelector('.ant-modal-content, .ant-popover-inner', { timeout: 5_000 }).catch(() => {});
                  await settle(page, 800);
                  domNotes.stopModal = await page.evaluate(() => {
                    const m = document.querySelector('.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content, .ant-modal-content, .ant-popover-inner');
                    if (!m) return { found: false };
                    return {
                      found: true,
                      title: m.querySelector('.ant-modal-title, .ant-popover-title')?.innerText || '',
                      body: (m.querySelector('.ant-modal-body, .ant-popover-inner-content')?.innerText || '').slice(0, 400),
                      buttons: Array.from(m.querySelectorAll('button')).map(b => b.innerText.trim()),
                    };
                  });
                  await page.screenshot({ path: path.join(OUT_DIR, results['4 (Stop Allocation modal)'].file), fullPage: false });
                  results['4 (Stop Allocation modal)'].status = 'CAPTURED';
                  console.log('  CAPTURED stop modal (retry).');
                  await closeAnyOpenLayer(page);
                } else {
                  results['4 (Stop Allocation modal)'].status = 'UNREACHABLE';
                  results['4 (Stop Allocation modal)'].note   = `No Stop button found even after filtering to "${appliedLabel}".`;
                  console.log(`  UNREACHABLE: no Stop button after filter.`);
                }
              }
              // Try Cancel again
              if (results['5 (Cancel Allocation modal)'].status !== 'CAPTURED') {
                const cancelBtn = page.locator('button:has-text("Cancel"):not(:has-text("Cancelled"))').first();
                if (await cancelBtn.count() > 0) {
                  await cancelBtn.scrollIntoViewIfNeeded();
                  await cancelBtn.click();
                  await settle(page, 1500);
                  await page.waitForSelector('.ant-modal-content, .ant-popover-inner', { timeout: 5_000 }).catch(() => {});
                  await settle(page, 800);
                  domNotes.cancelModal = await page.evaluate(() => {
                    const m = document.querySelector('.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content, .ant-modal-content, .ant-popover-inner');
                    if (!m) return { found: false };
                    return {
                      found: true,
                      title: m.querySelector('.ant-modal-title, .ant-popover-title')?.innerText || '',
                      body: (m.querySelector('.ant-modal-body, .ant-popover-inner-content')?.innerText || '').slice(0, 400),
                      buttons: Array.from(m.querySelectorAll('button')).map(b => b.innerText.trim()),
                    };
                  });
                  await page.screenshot({ path: path.join(OUT_DIR, results['5 (Cancel Allocation modal)'].file), fullPage: false });
                  results['5 (Cancel Allocation modal)'].status = 'CAPTURED';
                  console.log('  CAPTURED cancel modal (retry).');
                  await closeAnyOpenLayer(page);
                } else {
                  results['5 (Cancel Allocation modal)'].status = 'UNREACHABLE';
                  results['5 (Cancel Allocation modal)'].note   = `No Cancel button found even after filtering to "${appliedLabel}".`;
                  console.log(`  UNREACHABLE: no Cancel button after filter.`);
                }
              }

              // While here, retry Rounds/Export/Notify if still pending
              if (results['1 (Rounds UI)'].status !== 'CAPTURED') {
                const roundsTab = page.locator('.ant-tabs-tab:has-text("Round"), [role="tab"]:has-text("Round")').first();
                if (await roundsTab.count() > 0) {
                  await roundsTab.click();
                  await settle(page, 2000);
                  await page.screenshot({ path: path.join(OUT_DIR, results['1 (Rounds UI)'].file), fullPage: false });
                  results['1 (Rounds UI)'].status = 'CAPTURED';
                  results['1 (Rounds UI)'].note   = `Captured on ${appliedLabel} campaign.`;
                  domNotes.roundsUi = { url: page.url(), capturedOn: appliedLabel };
                  console.log('  CAPTURED Rounds on active campaign.');
                }
              }
              if (results['2 (Export UI)'].status !== 'CAPTURED') {
                const e = page.locator('button:has-text("Export")').first();
                if (await e.count() > 0) {
                  await e.click();
                  await settle(page, 1500);
                  await page.screenshot({ path: path.join(OUT_DIR, results['2 (Export UI)'].file), fullPage: false });
                  results['2 (Export UI)'].status = 'CAPTURED';
                  results['2 (Export UI)'].note   = `Captured on ${appliedLabel} campaign.`;
                  domNotes.exportUi = await page.evaluate(() => {
                    const c = document.querySelector('.ant-dropdown:not(.ant-dropdown-hidden), .ant-modal-content, .ant-popover-inner');
                    return c ? { found: true, items: Array.from(c.querySelectorAll('button, a, .ant-dropdown-menu-item')).map(i => i.innerText.trim()).filter(Boolean).slice(0, 20) } : { found: false };
                  });
                  console.log('  CAPTURED Export on active campaign.');
                  await closeAnyOpenLayer(page);
                }
              }
              if (results['3 (Notify UI)'].status !== 'CAPTURED') {
                const n = page.locator('button:has-text("Notify")').first();
                if (await n.count() > 0) {
                  await n.click();
                  await settle(page, 1500);
                  await page.screenshot({ path: path.join(OUT_DIR, results['3 (Notify UI)'].file), fullPage: false });
                  results['3 (Notify UI)'].status = 'CAPTURED';
                  results['3 (Notify UI)'].note   = `Captured on ${appliedLabel} campaign.`;
                  domNotes.notifyUi = await page.evaluate(() => {
                    const c = document.querySelector('.ant-dropdown:not(.ant-dropdown-hidden), .ant-modal-content, .ant-popover-inner');
                    return c ? { found: true, items: Array.from(c.querySelectorAll('button, a, .ant-dropdown-menu-item, input')).map(i => i.innerText?.trim() || i.placeholder || '').filter(Boolean).slice(0, 20) } : { found: false };
                  });
                  console.log('  CAPTURED Notify on active campaign.');
                  await closeAnyOpenLayer(page);
                }
              }
            }
          } else {
            console.log(`  No rows matching "${appliedLabel}" — Stop/Cancel UNREACHABLE in this UAT data set.`);
            results['4 (Stop Allocation modal)'].status = 'UNREACHABLE';
            results['4 (Stop Allocation modal)'].note   = `No "${appliedLabel}" campaigns in current UAT data. Status options seen: ${domNotes.statusFilterOptions.join(', ')}.`;
            results['5 (Cancel Allocation modal)'].status = 'UNREACHABLE';
            results['5 (Cancel Allocation modal)'].note   = `No "${appliedLabel}" campaigns in current UAT data. Status options seen: ${domNotes.statusFilterOptions.join(', ')}.`;
          }
        } else {
          console.log('  Could not apply Active/Approved/Running filter.');
          results['4 (Stop Allocation modal)'].status = 'UNREACHABLE';
          results['4 (Stop Allocation modal)'].note   = `Active/Approved/Running not in Status filter options: ${domNotes.statusFilterOptions.join(', ')}.`;
          results['5 (Cancel Allocation modal)'].status = 'UNREACHABLE';
          results['5 (Cancel Allocation modal)'].note   = `Active/Approved/Running not in Status filter options: ${domNotes.statusFilterOptions.join(', ')}.`;
        }
      } catch (e) {
        console.log('  ERROR in retry pass:', e.message);
      }
    }

    // Final UNREACHABLE labelling for any state still PENDING
    for (const k of Object.keys(results)) {
      if (results[k].status === 'PENDING') {
        results[k].status = 'UNREACHABLE';
        if (!results[k].note) results[k].note = 'Not reachable in UAT — no Active/Approved campaign in data set.';
      }
    }

    // Summary
    console.log('\n========== SUMMARY ==========');
    for (const [tag, r] of Object.entries(results)) {
      console.log(`${r.status.padEnd(12)} ${tag}  ->  ${r.file}  ${r.note ? '(' + r.note + ')' : ''}`);
    }

    const notesPath = path.join(OUT_DIR, '_allocation-capture-notes-v2.json');
    fs.writeFileSync(notesPath, JSON.stringify({ results, domNotes }, null, 2));
    console.log('\nDOM notes:', path.relative(ROOT, notesPath));

  } finally {
    await context.close();
    await browser.close();
  }
})();
