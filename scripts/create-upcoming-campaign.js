// Creates Upcoming campaign via Ant RangePicker then captures Cancel modal
// Ant RangePicker: clicking start input opens panel; fill start → OK enables end; fill end → OK
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const AUTH    = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR = path.join(ROOT, 'visual-memory', 'admin', 'allocation');
const URL     = 'https://uat-web.xrportal.in/admin/allocation';
const VW      = { width: 1920, height: 900 };

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 120 });
  const ctx  = await browser.newContext({ storageState: AUTH, viewport: VW });
  const page = await ctx.newPage();
  await page.setViewportSize(VW);
  const log = [];
  const note = m => { console.log(m); log.push(m); };

  note('Navigating...');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // ── Form: Project ──────────────────────────────────────────────────────────
  note('Selecting project...');
  const allSelects = await page.locator('.ant-select').all();
  await allSelects[0].click();
  await page.waitForTimeout(800);
  await page.locator('.ant-select-item-option:visible').filter({ hasText: 'Xanadu' }).first().click();
  await page.waitForTimeout(600);

  // ── Form: Campaign Name ────────────────────────────────────────────────────
  note('Filling campaign name...');
  await page.locator('input[placeholder="Enter campaign name..."]').fill('QA Cancel Test ' + Date.now());
  await page.waitForTimeout(300);

  // ── Form: Dates — use JavaScript to set values directly via page.evaluate ──
  // Ant date pickers are controlled components; easiest to click and type into each input
  note('Setting start date via first picker input...');
  const startInput = page.locator('.ant-picker-input input').first();
  await startInput.click();
  await page.waitForTimeout(800);

  // Clear and type the start date
  await startInput.press('Control+a');
  await startInput.type('2026-06-15 10:00:00');
  await page.waitForTimeout(500);

  // Press Enter to accept start date; panel moves to end date
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);

  // Now type end date into the end input (should now be enabled/active)
  const endInput = page.locator('.ant-picker-input input').nth(1);
  const isDisabled = await endInput.isDisabled().catch(() => true);
  note(`End input disabled: ${isDisabled}`);

  if (!isDisabled) {
    await endInput.press('Control+a');
    await endInput.type('2026-06-20 23:59:59');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  } else {
    // Try clicking OK in the panel to advance to end date
    const okBtns = page.locator('.ant-picker-ok button:not([disabled])');
    if (await okBtns.count() > 0) { await okBtns.first().click(); await page.waitForTimeout(600); }
    await endInput.click();
    await page.waitForTimeout(500);
    await endInput.type('2026-06-20 23:59:59');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  }

  // Close any open picker panel
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Screenshot form state
  await page.screenshot({ path: path.join(OUT_DIR, '_debug-form-v6.png') });
  note('Form screenshot saved');

  // Check field values
  const startVal = await startInput.inputValue().catch(() => '');
  const endVal   = await endInput.inputValue().catch(() => '');
  note(`Start value: "${startVal}" | End value: "${endVal}"`);

  // ── Save Campaign ──────────────────────────────────────────────────────────
  note('Clicking Save Campaign...');
  await page.locator('button:has-text("Save Campaign")').click();
  await page.waitForTimeout(4000);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.screenshot({ path: path.join(OUT_DIR, '_debug-after-save-v6.png') });
  note('Save attempted');

  // Check for error messages
  const errors = await page.locator('.ant-form-item-explain-error').allTextContents().catch(() => []);
  note(`Form errors: ${JSON.stringify(errors)}`);

  // ── Filter bar: select project ─────────────────────────────────────────────
  note('Filter bar: selecting project...');
  const allSelects2 = await page.locator('.ant-select').all();
  let filterIdx = -1;
  for (let i = 0; i < allSelects2.length; i++) {
    const box = await allSelects2[i].boundingBox().catch(() => null);
    const ph  = await allSelects2[i].locator('.ant-select-selection-placeholder').textContent().catch(() => '');
    if (ph.includes('Select Project') && box && box.y > 400) { filterIdx = i; break; }
  }
  if (filterIdx >= 0) {
    await allSelects2[filterIdx].click();
    await page.waitForTimeout(800);
    await page.locator('.ant-select-item-option:visible').filter({ hasText: 'Xanadu' }).first().click();
    await page.waitForTimeout(3000);
  }

  const rowTexts = await page.locator('tbody.ant-table-tbody tr.ant-table-row').allInnerTexts().catch(() => []);
  note(`Rows: ${rowTexts.length}`);
  rowTexts.forEach((t, i) => note(`  Row ${i}: ${t.replace(/\n/g, ' | ').substring(0, 200)}`));

  // ── Cancel modal on Upcoming row ──────────────────────────────────────────
  const upIdx = rowTexts.findIndex(t => /upcoming/i.test(t));
  note(`Upcoming row: ${upIdx}`);
  if (upIdx >= 0) {
    const upRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').nth(upIdx);
    const rowHtml = await upRow.innerHTML().catch(() => '');
    note(`Row HTML: ${rowHtml.substring(0, 800)}`);

    for (const sel of [
      'button:has(span[aria-label="close-circle"])',
      'a:has(span[aria-label="close-circle"])',
      'span[aria-label="close-circle"]',
      'button.ant-btn-dangerous',
      'button:has-text("Cancel")',
      'a:has-text("Cancel")',
    ]) {
      const el = upRow.locator(sel).first();
      if (await el.count() > 0) { note(`Clicking: ${sel}`); await el.click(); break; }
    }

    await page.waitForTimeout(2000);
    if (await page.locator('.ant-modal-content').isVisible().catch(() => false)) {
      await page.screenshot({ path: path.join(OUT_DIR, 'allocation-cancel-modal.png') });
      note('CAPTURED: allocation-cancel-modal.png');
      const title = await page.locator('.ant-modal-title').textContent().catch(() => '');
      const btns  = await page.locator('.ant-modal-content button').allTextContents().catch(() => []);
      note(`Title: "${title}" | Buttons: ${JSON.stringify(btns)}`);
      const dismiss = page.locator('.ant-modal-content button').filter({ hasText: /cancel|close|no/i }).first();
      if (await dismiss.count() > 0) await dismiss.click();
      else await page.locator('.ant-modal-close').click().catch(() => {});
      note('Modal dismissed');
    } else {
      await page.screenshot({ path: path.join(OUT_DIR, '_debug-no-cancel-modal-v6.png') });
      note('No modal — debug screenshot saved');
    }
  } else {
    note('No Upcoming row found — campaign may not have saved correctly');
  }

  fs.writeFileSync(
    path.join(OUT_DIR, '_capture-notes-cancel-v3.json'),
    JSON.stringify({ log, timestamp: new Date().toISOString() }, null, 2)
  );
  await browser.close();
  note('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
