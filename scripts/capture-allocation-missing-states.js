// scripts/capture-allocation-missing-states.js
//
// One-off capture script for Admin Portal / Allocation — 7 missing UI states
// blocking Conditional TCs from Approved status.
//
// 1. Rounds UI                     -> allocation-rounds-view.png
// 2. Export UI                     -> allocation-export-ui.png
// 3. Notify UI                     -> allocation-notify-ui.png
// 4. Stop Allocation modal         -> allocation-stop-modal.png
// 5. Cancel Allocation modal       -> allocation-cancel-modal.png
// 6. Form validation errors        -> allocation-form-validation-errors.png
// 7. Empty table state             -> allocation-empty-state.png
//
// Usage:
//   node scripts/capture-allocation-missing-states.js

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
  '6 (Form validation errors)': { file: 'allocation-form-validation-errors.png', status: 'PENDING', note: '' },
  '7 (Empty table state)':      { file: 'allocation-empty-state.png',            status: 'PENDING', note: '' },
};

const domNotes = {
  pageText:               '',
  sidebarActive:          '',
  projectSelectorState:   {},
  campaignTableHeaders:   [],
  campaignTableRowCount:  0,
  campaignRowStatuses:    [],
  campaignActions:        [],
  roundsUi:               {},
  exportUi:               {},
  notifyUi:               {},
  stopModal:              {},
  cancelModal:            {},
  formValidation:         {},
  emptyState:             {},
};

async function settle(page, ms = 1500) {
  await page.waitForTimeout(ms);
}

async function closeAnyOpenLayer(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
  }
  await page.mouse.click(10, 10).catch(() => {});
  await page.waitForTimeout(300);
}

async function findRowByStatus(page, status) {
  const rows = page.locator('tbody.ant-table-tbody tr.ant-table-row');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const text = (await row.innerText().catch(() => '')).toLowerCase();
    if (text.includes(status.toLowerCase())) {
      return { row, idx: i };
    }
  }
  return null;
}

async function pickFirstProject(page) {
  // Try to pick the first project from the filter Project selector (above the table).
  // The page has two project selectors: top form + filter bar. We want the filter bar one.
  // Strategy: find the second .ant-select with placeholder "Select Project" — that's the filter row.
  const allSelects = page.locator('.ant-select:has(.ant-select-selection-placeholder:has-text("Select Project"))');
  const count = await allSelects.count();
  console.log(`  Project selectors found: ${count}`);
  if (count === 0) return false;
  // filter bar selector is the LAST occurrence (form is above table; filter is right above table)
  const target = allSelects.nth(count - 1);
  await target.scrollIntoViewIfNeeded();
  await target.click();
  await settle(page, 1200);
  // Wait for dropdown options
  const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
  const optCount = await opts.count();
  console.log(`  Project options: ${optCount}`);
  if (optCount === 0) return false;
  await opts.first().click();
  await settle(page, 2500);
  return true;
}

(async () => {
  if (!fs.existsSync(AUTH)) {
    console.error(`ERROR: Auth file not found at ${AUTH}`);
    process.exit(1);
  }
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

    const url = page.url();
    if (!url.includes('/admin/allocation')) {
      console.error(`Auth failed — redirected to ${url}`);
      process.exit(2);
    }
    console.log('On Allocation page.');

    // Initial DOM snapshot
    domNotes.pageText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
    domNotes.sidebarActive = await page.evaluate(() => {
      const active = document.querySelector('.ant-menu-item-selected, .sidebar .active');
      return active ? active.innerText : '';
    });

    // ---------------------------------------------------------------
    // STEP A — Pick a project in the filter to populate the campaign table.
    // ---------------------------------------------------------------
    console.log('\n[A] Selecting a project in the filter row to load campaigns');
    let projectPicked = false;
    try {
      projectPicked = await pickFirstProject(page);
      if (projectPicked) {
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        await settle(page, 2000);

        // Inspect campaign table
        const tableInspect = await page.evaluate(() => {
          const headers = Array.from(document.querySelectorAll('thead.ant-table-thead th'))
            .map(h => h.innerText.trim());
          const rows = document.querySelectorAll('tbody.ant-table-tbody tr.ant-table-row');
          const statuses = Array.from(rows).map(r => {
            const cells = r.querySelectorAll('td');
            return Array.from(cells).map(c => c.innerText.trim().slice(0, 60));
          });
          return { headers, rowCount: rows.length, statuses: statuses.slice(0, 10) };
        });
        domNotes.campaignTableHeaders   = tableInspect.headers;
        domNotes.campaignTableRowCount  = tableInspect.rowCount;
        domNotes.campaignRowStatuses    = tableInspect.statuses;
        console.log(`  Project selected. Campaign rows: ${tableInspect.rowCount}`);
        console.log(`  Headers: ${tableInspect.headers.join(' | ')}`);
        if (tableInspect.statuses.length > 0) {
          console.log(`  Sample row[0]: ${tableInspect.statuses[0].join(' | ')}`);
        }
      } else {
        console.log('  WARN: could not pick a project — many states will be UNREACHABLE.');
      }
    } catch (e) {
      console.log('  ERROR picking project:', e.message);
    }

    // ---------------------------------------------------------------
    // 7 — EMPTY TABLE STATE (do this first while no project selected? Already gone.)
    // Try campaign-name search with garbage value to force empty result.
    // ---------------------------------------------------------------
    console.log('\n[7] Empty table state (filter returning no results)');
    try {
      if (!projectPicked) {
        // The default state IS empty ("Please select a project to view campaigns").
        // Capture that as the empty-state evidence.
        domNotes.emptyState = await page.evaluate(() => {
          const empty   = document.querySelector('.ant-empty, .ant-table-placeholder');
          const text    = empty?.innerText || '';
          return { found: !!empty, text: text.slice(0, 200), variant: 'no-project-selected' };
        });
        await page.screenshot({
          path: path.join(OUT_DIR, results['7 (Empty table state)'].file),
          fullPage: false,
        });
        results['7 (Empty table state)'].status = 'CAPTURED';
        results['7 (Empty table state)'].note   = 'Default empty state (no project selected).';
        console.log('  CAPTURED: default empty state (no project).');
      } else {
        // Use campaign-name search with junk
        const searchBox = page.locator('input.ant-input.ant-input-lg[placeholder="Search by campaign name..."]').first();
        if (await searchBox.count() === 0) {
          results['7 (Empty table state)'].status = 'UNREACHABLE';
          results['7 (Empty table state)'].note   = 'Campaign name search input not found.';
          console.log('  UNREACHABLE: search input missing.');
        } else {
          await searchBox.click();
          await searchBox.fill('ZZZNOMATCH99999');
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
          await settle(page, 2500);

          domNotes.emptyState = await page.evaluate(() => {
            const empty   = document.querySelector('.ant-empty, .ant-table-placeholder');
            const text    = empty?.innerText || '';
            const rows    = document.querySelectorAll('tbody.ant-table-tbody tr.ant-table-row');
            return { found: !!empty, rowCount: rows.length, text: text.slice(0, 200), variant: 'search-no-match' };
          });
          await page.screenshot({
            path: path.join(OUT_DIR, results['7 (Empty table state)'].file),
            fullPage: false,
          });
          results['7 (Empty table state)'].status = 'CAPTURED';
          results['7 (Empty table state)'].note   = `Search for no-match. Rows=${domNotes.emptyState.rowCount}.`;
          console.log('  CAPTURED: empty state via campaign-name search.');

          // Clear the search so subsequent captures see the loaded table
          await searchBox.fill('');
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
          await settle(page, 2000);
        }
      }
    } catch (e) {
      results['7 (Empty table state)'].note = e.message;
      console.log('  ERROR:', e.message);
    }

    // ---------------------------------------------------------------
    // STEP B — Open a campaign row's Actions / detail view (needed for Rounds, Stop, Cancel, Export, Notify).
    // Strategy: click the 3-dot kebab in Actions column on first row.
    // ---------------------------------------------------------------
    console.log('\n[B] Inspecting Action options on a campaign row');
    let actionsItemsText = [];
    let firstRowFound = false;
    if (projectPicked && domNotes.campaignTableRowCount > 0) {
      try {
        const firstRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
        firstRowFound = await firstRow.count() > 0;
        if (firstRowFound) {
          // Try kebab button
          const kebab = firstRow.locator('button[aria-label="more"], button.ant-dropdown-trigger, .anticon-more').last();
          if (await kebab.count() > 0) {
            await kebab.scrollIntoViewIfNeeded();
            await kebab.click();
            await settle(page, 1000);
            actionsItemsText = await page.evaluate(() => {
              const items = document.querySelectorAll('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item');
              return Array.from(items).map(i => i.innerText.trim());
            });
            domNotes.campaignActions = actionsItemsText;
            console.log('  Action items:', actionsItemsText);
            await closeAnyOpenLayer(page);
          } else {
            console.log('  No kebab in Actions column — checking inline buttons.');
            const buttonsInRow = await firstRow.locator('button').evaluateAll(
              btns => btns.map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean)
            );
            console.log('  Inline buttons:', buttonsInRow);
            domNotes.campaignActions = buttonsInRow;
          }
        }
      } catch (e) {
        console.log('  ERROR inspecting row actions:', e.message);
      }
    } else {
      console.log('  SKIP — no project picked or no campaign rows; many states will be UNREACHABLE.');
    }

    // ---------------------------------------------------------------
    // 1 — ROUNDS UI (BRD §10.4) — click into a campaign or open Rounds tab/section.
    // ---------------------------------------------------------------
    console.log('\n[1] Rounds UI');
    try {
      if (!projectPicked || !firstRowFound) {
        results['1 (Rounds UI)'].status = 'UNREACHABLE';
        results['1 (Rounds UI)'].note   = 'No project / no campaign row available in UAT.';
        console.log('  UNREACHABLE.');
      } else {
        // Try clicking the campaign name link in row 0
        const firstRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
        const campaignLink = firstRow.locator('a, button.ant-btn-link, td:first-child').first();
        await campaignLink.click().catch(() => {});
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        await settle(page, 2000);

        // Look for Rounds in URL or in a tab
        const urlAfter = page.url();
        let foundRounds = urlAfter.toLowerCase().includes('round');

        // Or click a tab labeled "Rounds"
        if (!foundRounds) {
          const roundsTab = page.locator('div[role="tab"]:has-text("Rounds"), .ant-tabs-tab:has-text("Rounds"), button:has-text("Rounds"), a:has-text("Rounds")').first();
          if (await roundsTab.count() > 0) {
            await roundsTab.click();
            await settle(page, 2000);
            foundRounds = true;
          }
        }

        if (foundRounds) {
          domNotes.roundsUi = await page.evaluate(() => {
            const bodyText = document.body.innerText.slice(0, 2000);
            const tabs     = Array.from(document.querySelectorAll('.ant-tabs-tab, [role="tab"]')).map(t => t.innerText.trim());
            const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5')).map(h => `${h.tagName}: ${h.innerText.trim()}`);
            return { url: location.href, tabs, headings, bodySnippet: bodyText };
          });
          await page.screenshot({
            path: path.join(OUT_DIR, results['1 (Rounds UI)'].file),
            fullPage: false,
          });
          results['1 (Rounds UI)'].status = 'CAPTURED';
          console.log('  CAPTURED. URL:', domNotes.roundsUi.url);
          console.log('  Tabs:', domNotes.roundsUi.tabs);
        } else {
          // No tabs found — capture current detail page anyway so BA can see what IS available
          const detailInspect = await page.evaluate(() => {
            const tabs     = Array.from(document.querySelectorAll('.ant-tabs-tab, [role="tab"]')).map(t => t.innerText.trim());
            const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5')).map(h => `${h.tagName}: ${h.innerText.trim()}`);
            const bodyText = document.body.innerText.slice(0, 1500);
            return { url: location.href, tabs, headings, bodySnippet: bodyText };
          });
          results['1 (Rounds UI)'].status = 'UNREACHABLE';
          results['1 (Rounds UI)'].note   = `No Rounds tab/section found on campaign detail. Detail tabs: ${detailInspect.tabs.join(', ')}`;
          domNotes.roundsUi = detailInspect;
          console.log('  UNREACHABLE: no Rounds in detail.');
          console.log('  Detail tabs:', detailInspect.tabs);
        }
      }
    } catch (e) {
      results['1 (Rounds UI)'].note = e.message;
      console.log('  ERROR:', e.message);
    }

    // ---------------------------------------------------------------
    // 2 — EXPORT UI (BRD §10.5) — Export button expanded
    // 3 — NOTIFY UI (BRD §10.6) — Notify button expanded
    // 4 — STOP modal — Stop button confirmation
    // 5 — CANCEL modal — Cancel button confirmation
    // All four often live on the campaign detail page.  We are already there.
    // ---------------------------------------------------------------

    // 2. Export
    console.log('\n[2] Export UI');
    try {
      const exportBtn = page.locator('button:has-text("Export"), button[aria-label*="Export"], a:has-text("Export")').first();
      if (await exportBtn.count() === 0) {
        results['2 (Export UI)'].status = 'UNREACHABLE';
        results['2 (Export UI)'].note   = 'No Export button on current view.';
        console.log('  UNREACHABLE: no Export button.');
      } else {
        await exportBtn.scrollIntoViewIfNeeded();
        await exportBtn.click();
        await settle(page, 1500);
        // Could open a dropdown, a modal, or a popover
        domNotes.exportUi = await page.evaluate(() => {
          const dropdown = document.querySelector('.ant-dropdown:not(.ant-dropdown-hidden), .ant-modal-content, .ant-popover-inner');
          if (!dropdown) return { found: false, postClickBodySnippet: document.body.innerText.slice(0, 400) };
          const items = Array.from(dropdown.querySelectorAll('.ant-dropdown-menu-item, button, a, label'))
            .map(i => i.innerText.trim()).filter(Boolean);
          return {
            found: true,
            type: dropdown.className,
            title: dropdown.querySelector('.ant-modal-title')?.innerText || '',
            items: items.slice(0, 20),
          };
        });
        await page.screenshot({
          path: path.join(OUT_DIR, results['2 (Export UI)'].file),
          fullPage: false,
        });
        results['2 (Export UI)'].status = 'CAPTURED';
        console.log('  CAPTURED. Export UI:', domNotes.exportUi);
        await closeAnyOpenLayer(page);
      }
    } catch (e) {
      results['2 (Export UI)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeAnyOpenLayer(page);
    }

    // 3. Notify
    console.log('\n[3] Notify UI');
    try {
      const notifyBtn = page.locator('button:has-text("Notify"), button[aria-label*="Notify"], a:has-text("Notify")').first();
      if (await notifyBtn.count() === 0) {
        results['3 (Notify UI)'].status = 'UNREACHABLE';
        results['3 (Notify UI)'].note   = 'No Notify button on current view.';
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
        await page.screenshot({
          path: path.join(OUT_DIR, results['3 (Notify UI)'].file),
          fullPage: false,
        });
        results['3 (Notify UI)'].status = 'CAPTURED';
        console.log('  CAPTURED. Notify UI:', domNotes.notifyUi);
        await closeAnyOpenLayer(page);
      }
    } catch (e) {
      results['3 (Notify UI)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeAnyOpenLayer(page);
    }

    // 4. Stop modal
    console.log('\n[4] Stop Allocation modal');
    try {
      const stopBtn = page.locator('button:has-text("Stop"), button[aria-label*="Stop"]').first();
      if (await stopBtn.count() === 0) {
        results['4 (Stop Allocation modal)'].status = 'UNREACHABLE';
        results['4 (Stop Allocation modal)'].note   = 'No Stop button on current view.';
        console.log('  UNREACHABLE: no Stop button.');
      } else {
        await stopBtn.scrollIntoViewIfNeeded();
        await stopBtn.click();
        await settle(page, 1500);
        await page.waitForSelector('.ant-modal-content, .ant-modal-wrap, .ant-popover-inner', { timeout: 6_000 }).catch(() => {});
        await settle(page, 800);
        domNotes.stopModal = await page.evaluate(() => {
          const modal = document.querySelector('.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content, .ant-modal-content, .ant-popover-inner');
          if (!modal) return { found: false };
          const title = modal.querySelector('.ant-modal-title, .ant-popover-title')?.innerText || '';
          const body  = modal.querySelector('.ant-modal-body, .ant-popover-inner-content')?.innerText || '';
          const btns  = Array.from(modal.querySelectorAll('button')).map(b => b.innerText.trim());
          return { found: true, title, bodySnippet: body.slice(0, 400), buttons: btns };
        });
        await page.screenshot({
          path: path.join(OUT_DIR, results['4 (Stop Allocation modal)'].file),
          fullPage: false,
        });
        results['4 (Stop Allocation modal)'].status = 'CAPTURED';
        console.log('  CAPTURED. Stop modal:', domNotes.stopModal);
        await closeAnyOpenLayer(page);
      }
    } catch (e) {
      results['4 (Stop Allocation modal)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeAnyOpenLayer(page);
    }

    // 5. Cancel modal
    console.log('\n[5] Cancel Allocation modal');
    try {
      const cancelBtn = page.locator('button:has-text("Cancel"), button[aria-label*="Cancel"]').first();
      if (await cancelBtn.count() === 0) {
        results['5 (Cancel Allocation modal)'].status = 'UNREACHABLE';
        results['5 (Cancel Allocation modal)'].note   = 'No Cancel button on current view.';
        console.log('  UNREACHABLE: no Cancel button.');
      } else {
        await cancelBtn.scrollIntoViewIfNeeded();
        await cancelBtn.click();
        await settle(page, 1500);
        await page.waitForSelector('.ant-modal-content, .ant-modal-wrap, .ant-popover-inner', { timeout: 6_000 }).catch(() => {});
        await settle(page, 800);
        domNotes.cancelModal = await page.evaluate(() => {
          const modal = document.querySelector('.ant-modal-wrap:not([style*="display: none"]) .ant-modal-content, .ant-modal-content, .ant-popover-inner');
          if (!modal) return { found: false };
          const title = modal.querySelector('.ant-modal-title, .ant-popover-title')?.innerText || '';
          const body  = modal.querySelector('.ant-modal-body, .ant-popover-inner-content')?.innerText || '';
          const btns  = Array.from(modal.querySelectorAll('button')).map(b => b.innerText.trim());
          return { found: true, title, bodySnippet: body.slice(0, 400), buttons: btns };
        });
        await page.screenshot({
          path: path.join(OUT_DIR, results['5 (Cancel Allocation modal)'].file),
          fullPage: false,
        });
        results['5 (Cancel Allocation modal)'].status = 'CAPTURED';
        console.log('  CAPTURED. Cancel modal:', domNotes.cancelModal);
        await closeAnyOpenLayer(page);
      }
    } catch (e) {
      results['5 (Cancel Allocation modal)'].note = e.message;
      console.log('  ERROR:', e.message);
      await closeAnyOpenLayer(page);
    }

    // ---------------------------------------------------------------
    // 6 — FORM VALIDATION ERRORS — navigate back to /admin/allocation
    // and submit the "New Allocation Campaign" form with required fields blank.
    // ---------------------------------------------------------------
    console.log('\n[6] Form validation errors');
    try {
      await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 2500);

      // Click "Save Campaign" / submit button without filling
      const saveBtn = page.locator('button.btn-book-solid.ant-btn-primary, button:has-text("Save Campaign"), button[type="submit"]').first();
      if (await saveBtn.count() === 0) {
        results['6 (Form validation errors)'].status = 'UNREACHABLE';
        results['6 (Form validation errors)'].note   = 'No Save / Submit button found on new campaign form.';
        console.log('  UNREACHABLE: no submit button.');
      } else {
        await saveBtn.scrollIntoViewIfNeeded();
        await saveBtn.click();
        await settle(page, 1500);

        domNotes.formValidation = await page.evaluate(() => {
          const errs = Array.from(document.querySelectorAll('.ant-form-item-explain-error, .ant-form-item-has-error'))
            .map(e => e.innerText.trim()).filter(Boolean);
          const errorCount = document.querySelectorAll('.ant-form-item-explain-error').length;
          return {
            errorCount,
            errorMessages: errs.slice(0, 15),
          };
        });
        await page.screenshot({
          path: path.join(OUT_DIR, results['6 (Form validation errors)'].file),
          fullPage: false,
        });
        results['6 (Form validation errors)'].status = 'CAPTURED';
        console.log('  CAPTURED. Form errors:', domNotes.formValidation);
      }
    } catch (e) {
      results['6 (Form validation errors)'].note = e.message;
      console.log('  ERROR:', e.message);
    }

    // ---------------------------------------------------------------
    // Summary + DOM notes dump
    // ---------------------------------------------------------------
    console.log('\n========== SUMMARY ==========');
    for (const [tag, r] of Object.entries(results)) {
      console.log(`${r.status.padEnd(12)} ${tag}  ->  ${r.file}  ${r.note ? '(' + r.note + ')' : ''}`);
    }

    const notesPath = path.join(OUT_DIR, '_allocation-capture-notes.json');
    fs.writeFileSync(notesPath, JSON.stringify({ results, domNotes }, null, 2));
    console.log('\nDOM notes written to:', path.relative(ROOT, notesPath));

  } finally {
    await context.close();
    await browser.close();
  }
})();
