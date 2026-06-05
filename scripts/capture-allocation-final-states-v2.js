// v2 — skip project filter, load all rows, find by status/type text
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const AUTH     = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR  = path.join(ROOT, 'visual-memory', 'admin', 'allocation');
const URL      = 'https://uat-web.xrportal.in/admin/allocation';
const VIEWPORT = { width: 1920, height: 900 };

async function run() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: AUTH, viewport: VIEWPORT });
  const page = await context.newPage();
  await page.setViewportSize(VIEWPORT);
  const log = [];
  const note = (m) => { console.log(m); log.push(m); };

  note('Navigating...');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT_DIR, '_debug-initial.png') });

  // Dump all visible table rows
  const rows = await page.locator('tbody.ant-table-tbody tr.ant-table-row').all();
  note(`Total rows visible: ${rows.length}`);
  for (let i = 0; i < rows.length; i++) {
    const txt = await rows[i].innerText().catch(() => '');
    note(`Row ${i}: ${txt.replace(/\n/g, ' | ').substring(0, 200)}`);
  }

  // Dump all row action elements
  const allActions = await page.locator('tbody.ant-table-tbody tr.ant-table-row').all();
  for (let i = 0; i < allActions.length; i++) {
    const rowText = await allActions[i].innerText().catch(() => '');
    const actionHtml = await allActions[i].locator('td').last().innerHTML().catch(() => '');
    note(`Row ${i} actions HTML: ${actionHtml.substring(0, 300)}`);
  }

  // Try to find Cancel button anywhere on page
  const allCancelBtns = await page.locator('button, a, span').filter({ hasText: /^Cancel$/ }).all();
  note(`Cancel elements anywhere on page: ${allCancelBtns.length}`);
  for (const btn of allCancelBtns) {
    const txt = await btn.innerText().catch(() => '');
    const cls = await btn.getAttribute('class').catch(() => '');
    note(`  Cancel el: text="${txt}" class="${cls}"`);
  }

  // Try clicking first Cancel found
  if (allCancelBtns.length > 0) {
    note('Clicking first Cancel button...');
    await allCancelBtns[0].click();
    await page.waitForTimeout(2000);
    const modal = await page.locator('.ant-modal-content').isVisible().catch(() => false);
    note(`Modal visible after click: ${modal}`);
    if (modal) {
      await page.screenshot({ path: path.join(OUT_DIR, 'allocation-cancel-modal.png') });
      note('CAPTURED: allocation-cancel-modal.png');
      const title = await page.locator('.ant-modal-title').textContent().catch(() => '');
      const btns = await page.locator('.ant-modal-content button').allTextContents().catch(() => []);
      note(`Modal title: "${title}" | buttons: ${JSON.stringify(btns)}`);
      // Dismiss
      const dismiss = page.locator('.ant-modal-content button').filter({ hasText: /cancel|close|no/i }).first();
      if (await dismiss.count() > 0) await dismiss.click();
      else await page.locator('.ant-modal-close').click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  }

  // Find DYNAMIC row — look for text "DYNAMIC" anywhere in rows
  note('Looking for DYNAMIC rows...');
  const allRowTexts = await page.locator('tbody.ant-table-tbody tr.ant-table-row').allInnerTexts().catch(() => []);
  note(`All row texts: ${JSON.stringify(allRowTexts.map(t => t.substring(0, 100)))}`);

  const dynamicRowIdx = allRowTexts.findIndex(t => t.includes('DYNAMIC'));
  note(`DYNAMIC row index: ${dynamicRowIdx}`);

  if (dynamicRowIdx >= 0) {
    const dynRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').nth(dynamicRowIdx);
    const viewLink = dynRow.locator('a, button, span[aria-label="eye"]').filter({ hasText: /view/i }).first();
    const viewCount = await viewLink.count();
    note(`View link count on dynamic row: ${viewCount}`);
    if (viewCount > 0) {
      await viewLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      note(`URL after click: ${page.url()}`);
      const bodyText = await page.locator('body').innerText().catch(() => '');
      const hasRound = /round/i.test(bodyText);
      note(`Contains "round": ${hasRound}`);
      const headings = await page.locator('h1,h2,h3,h4,.ant-tabs-tab').allTextContents().catch(() => []);
      note(`Headings/tabs: ${JSON.stringify(headings)}`);
      if (hasRound) {
        const roundEl = page.locator('.ant-tabs-tab, h2, h3, section').filter({ hasText: /round/i }).first();
        if (await roundEl.count() > 0) await roundEl.click().catch(() => {});
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(OUT_DIR, 'allocation-rounds-view.png') });
        note('CAPTURED: allocation-rounds-view.png');
      } else {
        await page.screenshot({ path: path.join(OUT_DIR, 'allocation-dynamic-detail.png') });
        note('CAPTURED fallback: allocation-dynamic-detail.png');
        note(`Page text (800): ${bodyText.substring(0, 800)}`);
      }
    }
  }

  fs.writeFileSync(
    path.join(OUT_DIR, '_capture-notes-final-v2.json'),
    JSON.stringify({ log, timestamp: new Date().toISOString() }, null, 2)
  );
  await browser.close();
  note('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
