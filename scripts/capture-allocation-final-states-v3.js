// v3 — explicitly select project from dropdown before reading rows
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const AUTH    = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR = path.join(ROOT, 'visual-memory', 'admin', 'allocation');
const URL     = 'https://uat-web.xrportal.in/admin/allocation';
const VW      = { width: 1920, height: 900 };

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const ctx  = await browser.newContext({ storageState: AUTH, viewport: VW });
  const page = await ctx.newPage();
  await page.setViewportSize(VW);
  const log = [];
  const note = m => { console.log(m); log.push(m); };

  note('Navigating...');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Screenshot before project select
  await page.screenshot({ path: path.join(OUT_DIR, '_debug-v3-before-select.png') });
  note('Screenshot taken: _debug-v3-before-select.png');

  // Find and click the project selector — it's the first ant-select on the filter bar
  const selects = await page.locator('.ant-select-selector').all();
  note(`Total ant-select-selector elements: ${selects.length}`);

  // Click first select (Project)
  if (selects.length > 0) {
    await selects[0].click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, '_debug-v3-dropdown-open.png') });
    note('Dropdown opened');

    // List all options
    const options = await page.locator('.ant-select-item-option').allTextContents().catch(() => []);
    note(`Dropdown options: ${JSON.stringify(options)}`);

    // Click Xanadu option
    const xanaduOpt = page.locator('.ant-select-item-option').filter({ hasText: 'Xanadu' }).first();
    const xCount = await xanaduOpt.count();
    note(`Xanadu option count: ${xCount}`);
    if (xCount > 0) {
      await xanaduOpt.click();
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle').catch(() => {});
    } else {
      // Click first option whatever it is
      await page.locator('.ant-select-item-option').first().click();
      await page.waitForTimeout(3000);
    }
  }

  await page.screenshot({ path: path.join(OUT_DIR, '_debug-v3-after-select.png') });
  note('Screenshot taken: _debug-v3-after-select.png');

  // Read rows
  const rowTexts = await page.locator('tbody.ant-table-tbody tr.ant-table-row').allInnerTexts().catch(() => []);
  note(`Rows after project select: ${rowTexts.length}`);
  rowTexts.forEach((t, i) => note(`  Row ${i}: ${t.replace(/\n/g, ' | ').substring(0, 150)}`));

  // ── Cancel modal (Upcoming row) ──
  const upcomingIdx = rowTexts.findIndex(t => /upcoming/i.test(t));
  note(`Upcoming row index: ${upcomingIdx}`);
  if (upcomingIdx >= 0) {
    const upRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').nth(upcomingIdx);
    const actionsHtml = await upRow.locator('td').last().innerHTML().catch(() => '');
    note(`Upcoming row actions: ${actionsHtml.substring(0, 500)}`);

    // Find any clickable Cancel in that row
    const cancelEl = upRow.locator('button, a, span.anticon').filter({ hasText: /cancel/i }).first();
    const cCount = await cancelEl.count();
    note(`Cancel el in upcoming row: ${cCount}`);

    if (cCount === 0) {
      // Try by icon aria-label
      const cancelIcon = upRow.locator('span[aria-label="close-circle"], span[aria-label="stop"]').first();
      const iCount = await cancelIcon.count();
      note(`Cancel icon count: ${iCount}`);
      if (iCount > 0) {
        await cancelIcon.click();
        await page.waitForTimeout(2000);
      }
    } else {
      await cancelEl.click();
      await page.waitForTimeout(2000);
    }

    const modalVis = await page.locator('.ant-modal-content').isVisible().catch(() => false);
    note(`Modal visible: ${modalVis}`);
    if (modalVis) {
      await page.screenshot({ path: path.join(OUT_DIR, 'allocation-cancel-modal.png') });
      note('CAPTURED: allocation-cancel-modal.png');
      const title = await page.locator('.ant-modal-title').textContent().catch(() => '');
      const btns  = await page.locator('.ant-modal-content button').allTextContents().catch(() => []);
      note(`Title: "${title}" | Buttons: ${JSON.stringify(btns)}`);
      const dismiss = page.locator('.ant-modal-content button').filter({ hasText: /cancel|close|no/i }).first();
      if (await dismiss.count() > 0) await dismiss.click();
      else await page.locator('.ant-modal-close').click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  }

  // ── Rounds UI (Dynamic row) ──
  const dynamicIdx = rowTexts.findIndex(t => /dynamic/i.test(t));
  note(`Dynamic row index: ${dynamicIdx}`);
  if (dynamicIdx >= 0) {
    const dynRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').nth(dynamicIdx);
    const viewEl = dynRow.locator('a, button').filter({ hasText: /view/i }).first();
    const vCount = await viewEl.count();
    // Also try eye icon
    const eyeEl  = dynRow.locator('span[aria-label="eye"]').first();
    const eCount = await eyeEl.count();
    note(`View el: ${vCount}, Eye icon: ${eCount}`);

    if (vCount > 0) await viewEl.click();
    else if (eCount > 0) await eyeEl.click();

    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);
    note(`URL: ${page.url()}`);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const tabs = await page.locator('.ant-tabs-tab').allTextContents().catch(() => []);
    const headings = await page.locator('h1,h2,h3,h4').allTextContents().catch(() => []);
    note(`Tabs: ${JSON.stringify(tabs)}`);
    note(`Headings: ${JSON.stringify(headings)}`);
    note(`Has "round": ${/round/i.test(bodyText)}`);

    if (/round/i.test(bodyText)) {
      const roundTab = page.locator('.ant-tabs-tab, h2, h3').filter({ hasText: /round/i }).first();
      if (await roundTab.count() > 0) { await roundTab.click(); await page.waitForTimeout(1000); }
      await page.screenshot({ path: path.join(OUT_DIR, 'allocation-rounds-view.png') });
      note('CAPTURED: allocation-rounds-view.png');
    } else {
      await page.screenshot({ path: path.join(OUT_DIR, 'allocation-dynamic-detail.png') });
      note('CAPTURED fallback: allocation-dynamic-detail.png');
      note(`Page text: ${bodyText.substring(0, 600)}`);
    }
  }

  fs.writeFileSync(
    path.join(OUT_DIR, '_capture-notes-final-v3.json'),
    JSON.stringify({ log, timestamp: new Date().toISOString() }, null, 2)
  );
  await browser.close();
  note('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
