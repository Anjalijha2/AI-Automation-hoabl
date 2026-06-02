// scripts/capture-allocation-missing-states-v3.js
//
// Pass 3 — based on intel from v2:
//   Detail page is /admin/allocation/campaigns/<id>
//   Export = "Download Bookings" + "Download Pending" (NOT labelled "Export")
//   Notify = "Notify Registrants" button → modal "Notify Registrants?"
//   Rounds: not present on a Completed campaign — try "Upcoming"
//   Stop / Cancel: same — try "Upcoming"
//
//   Status filter values: All Status, Active, Upcoming, Completed, Stopped, Cancelled, Failed
//   "Approved" is NOT a campaign-list status (it's a buyer/registrant status downstream).

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'admin', 'allocation');
const URL      = 'https://uat-web.xrportal.in/admin/allocation';
const VIEWPORT = { width: 1920, height: 900 };

const results = {
  '1 (Rounds UI)':              { file: 'allocation-rounds-view.png',  status: 'PENDING', note: '' },
  '2 (Export UI)':              { file: 'allocation-export-ui.png',    status: 'PENDING', note: '' },
  '4 (Stop Allocation modal)':  { file: 'allocation-stop-modal.png',   status: 'PENDING', note: '' },
  '5 (Cancel Allocation modal)':{ file: 'allocation-cancel-modal.png', status: 'PENDING', note: '' },
};

const domNotes = {
  attemptedStatuses:    [],
  capturedFromCampaign: {},
  upcomingCampaignButtons: [],
  upcomingCampaignSnippet: '',
  exportArea:           {},
  rounds:               {},
  stopModal:            {},
  cancelModal:          {},
  exportCapturedFrom:   '',
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
  if (await allSelects.count() === 0) return false;
  const target = allSelects.nth((await allSelects.count()) - 1);
  await target.click(); await settle(page, 1000);
  const opts = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
  if (await opts.count() === 0) return false;
  await opts.first().click(); await settle(page, 2500);
  return true;
}

async function filterByStatus(page, label) {
  // Open the "All Status" / current status select
  const sel = page.locator('.ant-select:has(.ant-select-selection-item:has-text("All Status")), .ant-select:has(.ant-select-selection-item:has-text("Active")), .ant-select:has(.ant-select-selection-item:has-text("Upcoming")), .ant-select:has(.ant-select-selection-item:has-text("Completed")), .ant-select:has(.ant-select-selection-item:has-text("Stopped")), .ant-select:has(.ant-select-selection-item:has-text("Cancelled")), .ant-select:has(.ant-select-selection-item:has-text("Failed"))').first();
  if (await sel.count() === 0) return false;
  await sel.click(); await settle(page, 800);
  const opt = page.locator(`.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text("${label}")`).first();
  if (await opt.count() === 0) {
    await page.keyboard.press('Escape'); return false;
  }
  await opt.click();
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
  await settle(page, 2000);
  return true;
}

async function tryCapturesOnDetail(page, label) {
  // Read available buttons on detail page first
  const detail = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
      .map(b => b.innerText.trim()).filter(Boolean);
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .map(h => `${h.tagName}: ${h.innerText.trim()}`);
    const body = document.body.innerText.slice(0, 3000);
    return { buttons, headings, body, url: location.href };
  });
  console.log(`  Detail buttons (${label}):`, detail.buttons);
  console.log(`  Detail headings:`, detail.headings);
  domNotes.capturedFromCampaign[label] = detail;

  // ---- 1. Rounds ----
  if (results['1 (Rounds UI)'].status !== 'CAPTURED') {
    const hasRoundsWord = /round/i.test(detail.body);
    console.log(`  Rounds text in body: ${hasRoundsWord}`);
    const roundsAnchor = page.locator(':text("Round"), :text("Rounds"), :text("Round 1"), :text("Round 2")').first();
    const hasAnchor = await roundsAnchor.count();
    if (hasAnchor > 0) {
      try {
        await roundsAnchor.scrollIntoViewIfNeeded();
        await settle(page, 1000);
        await page.screenshot({ path: path.join(OUT_DIR, results['1 (Rounds UI)'].file), fullPage: false });
        results['1 (Rounds UI)'].status = 'CAPTURED';
        results['1 (Rounds UI)'].note   = `Captured on ${label} campaign (inline section).`;
        domNotes.rounds = { url: detail.url, label, anchorFound: true };
        console.log('  CAPTURED Rounds (inline).');
      } catch (e) {
        console.log('  ERROR scrolling to Rounds anchor:', e.message);
      }
    } else {
      console.log(`  No Rounds anchor on ${label} detail.`);
    }
  }

  // ---- 2. Export UI ----
  if (results['2 (Export UI)'].status !== 'CAPTURED') {
    // From v2 intel: "Download Bookings" + "Download Pending" — these are the Export UI.
    const dl = page.locator('button:has-text("Download Bookings"), button:has-text("Download Pending"), button:has-text("Export")').first();
    if (await dl.count() > 0) {
      try {
        await dl.scrollIntoViewIfNeeded();
        await settle(page, 800);
        // Take a screenshot showing the whole "Campaign Actions" area
        const actionsSection = page.locator('h4:has-text("Campaign Actions"), :text("Campaign Actions")').first();
        if (await actionsSection.count() > 0) {
          await actionsSection.scrollIntoViewIfNeeded();
          await settle(page, 800);
        }
        await page.screenshot({ path: path.join(OUT_DIR, results['2 (Export UI)'].file), fullPage: false });
        results['2 (Export UI)'].status = 'CAPTURED';
        results['2 (Export UI)'].note   = `Export buttons "Download Bookings" / "Download Pending" visible on ${label} campaign (under Campaign Actions section).`;
        domNotes.exportArea = await page.evaluate(() => {
          const section = Array.from(document.querySelectorAll('h4'))
            .find(h => /Campaign Actions/i.test(h.innerText));
          let buttons = [];
          if (section) {
            // Look at siblings / parent for buttons
            const container = section.closest('section, div, .ant-card, .card') || section.parentElement;
            buttons = Array.from((container || document).querySelectorAll('button'))
              .map(b => b.innerText.trim()).filter(Boolean);
          } else {
            buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
          }
          return { campaignActionsButtons: buttons };
        });
        domNotes.exportCapturedFrom = label;
        console.log('  CAPTURED Export UI (Download Bookings/Pending).');
      } catch (e) {
        console.log('  ERROR capturing Export:', e.message);
      }
    } else {
      console.log(`  No Download/Export buttons on ${label}.`);
    }
  }

  // ---- 4. Stop modal ----
  if (results['4 (Stop Allocation modal)'].status !== 'CAPTURED') {
    const stopBtn = page.locator('button:has-text("Stop"):not(:has-text("Stopped"))').first();
    if (await stopBtn.count() > 0) {
      try {
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
        if (domNotes.stopModal.found) {
          await page.screenshot({ path: path.join(OUT_DIR, results['4 (Stop Allocation modal)'].file), fullPage: false });
          results['4 (Stop Allocation modal)'].status = 'CAPTURED';
          results['4 (Stop Allocation modal)'].note   = `Captured on ${label} campaign.`;
          console.log('  CAPTURED Stop modal:', domNotes.stopModal);
        }
        await closeAnyOpenLayer(page);
      } catch (e) {
        console.log('  ERROR Stop:', e.message);
        await closeAnyOpenLayer(page);
      }
    } else {
      console.log(`  No Stop button on ${label} detail.`);
    }
  }

  // ---- 5. Cancel modal ----
  if (results['5 (Cancel Allocation modal)'].status !== 'CAPTURED') {
    // Cancel button must NOT match "Cancelled" status text, "Cancel" button on a modal,
    // or page header "Back to..." — be very explicit: a button whose entire text is "Cancel" or
    // says "Cancel Allocation" / "Cancel Campaign".
    const cancelBtn = page.locator(
      'button:has-text("Cancel Allocation"), button:has-text("Cancel Campaign"), button[aria-label="Cancel"]'
    ).first();
    if (await cancelBtn.count() > 0) {
      try {
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
        if (domNotes.cancelModal.found) {
          await page.screenshot({ path: path.join(OUT_DIR, results['5 (Cancel Allocation modal)'].file), fullPage: false });
          results['5 (Cancel Allocation modal)'].status = 'CAPTURED';
          results['5 (Cancel Allocation modal)'].note   = `Captured on ${label} campaign.`;
          console.log('  CAPTURED Cancel modal:', domNotes.cancelModal);
        }
        await closeAnyOpenLayer(page);
      } catch (e) {
        console.log('  ERROR Cancel:', e.message);
        await closeAnyOpenLayer(page);
      }
    } else {
      console.log(`  No "Cancel Allocation" / "Cancel Campaign" button on ${label} detail.`);
    }
  }
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
    // First — capture Export from a COMPLETED campaign (we already know it has Download buttons).
    // We do this as our baseline; later we try Upcoming for Rounds/Stop/Cancel.
    for (const statusToTry of ['Upcoming', 'Completed']) {
      if (results['1 (Rounds UI)'].status === 'CAPTURED' &&
          results['2 (Export UI)'].status === 'CAPTURED' &&
          results['4 (Stop Allocation modal)'].status === 'CAPTURED' &&
          results['5 (Cancel Allocation modal)'].status === 'CAPTURED') break;

      console.log(`\n========== PASS: filter by ${statusToTry} ==========`);
      domNotes.attemptedStatuses.push(statusToTry);

      await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 2500);
      await pickFirstProject(page);
      await page.waitForSelector('tbody.ant-table-tbody tr.ant-table-row', { timeout: 15_000 }).catch(() => {});
      await settle(page, 1500);

      const filtered = await filterByStatus(page, statusToTry);
      if (!filtered) {
        console.log(`  Filter "${statusToTry}" not applicable.`);
        continue;
      }

      const rowCount = await page.locator('tbody.ant-table-tbody tr.ant-table-row').count();
      console.log(`  Rows for ${statusToTry}: ${rowCount}`);
      if (rowCount === 0) {
        console.log(`  No ${statusToTry} campaigns.`);
        continue;
      }

      // Click View on first row
      const row0 = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
      const v = row0.locator(':text("View")').first();
      if (await v.count() === 0) {
        console.log('  No View link in first row.');
        continue;
      }
      await v.scrollIntoViewIfNeeded();
      await v.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await settle(page, 2500);

      await tryCapturesOnDetail(page, statusToTry);
    }

    // Final UNREACHABLE labelling
    for (const k of Object.keys(results)) {
      if (results[k].status === 'PENDING') {
        results[k].status = 'UNREACHABLE';
        if (!results[k].note) {
          results[k].note = `Not present on any of: ${domNotes.attemptedStatuses.join(', ')} campaign details. UAT data set may lack the needed status, or the action does not exist in current UI.`;
        }
      }
    }

    console.log('\n========== SUMMARY ==========');
    for (const [tag, r] of Object.entries(results)) {
      console.log(`${r.status.padEnd(12)} ${tag}  ->  ${r.file}  ${r.note ? '(' + r.note + ')' : ''}`);
    }

    const notesPath = path.join(OUT_DIR, '_allocation-capture-notes-v3.json');
    fs.writeFileSync(notesPath, JSON.stringify({ results, domNotes }, null, 2));
    console.log('\nDOM notes:', path.relative(ROOT, notesPath));

  } finally {
    await context.close();
    await browser.close();
  }
})();
