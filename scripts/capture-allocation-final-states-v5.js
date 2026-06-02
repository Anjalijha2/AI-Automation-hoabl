// v5 — scroll down to filter bar, click its Select Project by position index
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const AUTH    = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT_DIR = path.join(ROOT, 'visual-memory', 'admin', 'allocation');
const URL     = 'https://uat-web.xrportal.in/admin/allocation';
const VW      = { width: 1920, height: 900 };

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const ctx  = await browser.newContext({ storageState: AUTH, viewport: VW });
  const page = await ctx.newPage();
  await page.setViewportSize(VW);
  const log = [];
  const note = m => { console.log(m); log.push(m); };

  note('Navigating...');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Dump all ant-select elements with their bounding boxes to identify the filter bar one
  const allSelects = await page.locator('.ant-select').all();
  note(`Total ant-select: ${allSelects.length}`);
  for (let i = 0; i < allSelects.length; i++) {
    const box = await allSelects[i].boundingBox().catch(() => null);
    const txt = await allSelects[i].innerText().catch(() => '');
    const placeholder = await allSelects[i].locator('.ant-select-selection-placeholder').textContent().catch(() => '');
    note(`  Select[${i}] y=${box?.y?.toFixed(0)} placeholder="${placeholder}" text="${txt.substring(0,30)}"`);
  }

  // Filter bar is BELOW the form — find "Select Project" placeholder that has higher Y coordinate
  // The form Project select is at ~y=170, filter bar is at ~y=615+
  let filterSelectIdx = -1;
  for (let i = 0; i < allSelects.length; i++) {
    const box = await allSelects[i].boundingBox().catch(() => null);
    const placeholder = await allSelects[i].locator('.ant-select-selection-placeholder').textContent().catch(() => '');
    if (placeholder.includes('Select Project') && box && box.y > 400) {
      filterSelectIdx = i;
      note(`Found filter bar project select at index ${i}, y=${box.y.toFixed(0)}`);
      break;
    }
  }

  if (filterSelectIdx === -1) {
    // Fallback: click the one with highest Y that has "Project" placeholder
    note('Fallback: scroll to filter bar and click');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    // Try clicking directly by text content
    await page.locator('.ant-select').filter({ hasText: 'Select Project' }).last().click();
    await page.waitForTimeout(1500);
  } else {
    await allSelects[filterSelectIdx].click();
    await page.waitForTimeout(1500);
  }

  // Now select Xanadu from dropdown
  const dropdown = page.locator('.ant-select-dropdown').filter({ hasNot: page.locator('[style*="display: none"]') });
  const opts = await page.locator('.ant-select-item-option:visible').allTextContents().catch(() => []);
  note(`Visible dropdown options: ${JSON.stringify(opts)}`);

  const xOpt = page.locator('.ant-select-item-option:visible').filter({ hasText: 'Xanadu' }).first();
  if (await xOpt.count() > 0) {
    await xOpt.click();
    note('Clicked Xanadu option');
  } else {
    await page.locator('.ant-select-item-option:visible').first().click();
    note('Clicked first option (fallback)');
  }

  await page.waitForTimeout(4000);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.screenshot({ path: path.join(OUT_DIR, '_debug-v5-after-filter.png') });

  const rowTexts = await page.locator('tbody.ant-table-tbody tr.ant-table-row').allInnerTexts().catch(() => []);
  note(`Rows visible: ${rowTexts.length}`);
  rowTexts.forEach((t, i) => note(`  Row ${i}: ${t.replace(/\n/g, ' | ').substring(0, 200)}`));

  // ── Cancel modal (Upcoming row) ──
  const upcomingIdx = rowTexts.findIndex(t => /upcoming/i.test(t));
  note(`Upcoming row index: ${upcomingIdx}`);
  if (upcomingIdx >= 0) {
    const upRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').nth(upcomingIdx);
    const rowHtml = await upRow.innerHTML().catch(() => '');
    note(`Upcoming row HTML (600): ${rowHtml.substring(0, 600)}`);

    // Find cancel action — try various selectors
    const cancelSelectors = [
      'button.ant-btn-link:has(span[aria-label="close-circle"])',
      'a:has(span[aria-label="close-circle"])',
      'button:has-text("Cancel")',
      'a:has-text("Cancel")',
      'span[aria-label="close-circle"]',
      '.ant-btn-dangerous',
    ];
    let clicked = false;
    for (const sel of cancelSelectors) {
      const el = upRow.locator(sel).first();
      if (await el.count() > 0) {
        note(`Clicking Cancel via: ${sel}`);
        await el.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) note('No Cancel element found in upcoming row');

    await page.waitForTimeout(2000);
    const modalVis = await page.locator('.ant-modal-content').isVisible().catch(() => false);
    note(`Cancel modal visible: ${modalVis}`);
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
    const viewBtn = dynRow.locator('a, button').filter({ hasText: /view/i }).first();
    const eyeIcon = dynRow.locator('span[aria-label="eye"]').first();
    if (await viewBtn.count() > 0) { note('Clicking View'); await viewBtn.click(); }
    else if (await eyeIcon.count() > 0) { note('Clicking eye icon'); await eyeIcon.click(); }

    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);
    note(`URL: ${page.url()}`);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const tabs = await page.locator('.ant-tabs-tab').allTextContents().catch(() => []);
    const headings = await page.locator('h1,h2,h3,h4').allTextContents().catch(() => []);
    note(`Tabs: ${JSON.stringify(tabs)} | Headings: ${JSON.stringify(headings)}`);
    note(`Has "round": ${/round/i.test(bodyText)}`);
    if (/round/i.test(bodyText)) {
      const roundEl = page.locator('.ant-tabs-tab, h2, h3').filter({ hasText: /round/i }).first();
      if (await roundEl.count() > 0) { await roundEl.click(); await page.waitForTimeout(1000); }
      await page.screenshot({ path: path.join(OUT_DIR, 'allocation-rounds-view.png') });
      note('CAPTURED: allocation-rounds-view.png');
    } else {
      await page.screenshot({ path: path.join(OUT_DIR, 'allocation-dynamic-detail.png') });
      note('CAPTURED fallback: allocation-dynamic-detail.png');
      note(`Body text (800): ${bodyText.substring(0, 800)}`);
    }
  }

  fs.writeFileSync(
    path.join(OUT_DIR, '_capture-notes-final-v5.json'),
    JSON.stringify({ log, timestamp: new Date().toISOString() }, null, 2)
  );
  await browser.close();
  note('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
