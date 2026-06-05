// v4 — click the FILTER BAR project dropdown (below the form), not the form one
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

  // The filter bar has its own "Select Project" dropdown — identified by placeholder text
  note('Clicking filter bar Select Project...');
  const filterProjectSelect = page.locator('.ant-select').filter({ has: page.locator('.ant-select-selection-placeholder:has-text("Select Project")') }).first();
  const fpCount = await filterProjectSelect.count();
  note(`Filter project select count: ${fpCount}`);

  if (fpCount > 0) {
    await filterProjectSelect.click();
    await page.waitForTimeout(1500);
    const opts = await page.locator('.ant-select-dropdown:not([style*="display: none"]) .ant-select-item-option').allTextContents().catch(() => []);
    note(`Filter dropdown options: ${JSON.stringify(opts)}`);
    const xOpt = page.locator('.ant-select-dropdown:not([style*="display: none"]) .ant-select-item-option').filter({ hasText: 'Xanadu' }).first();
    if (await xOpt.count() > 0) {
      await xOpt.click();
      note('Selected Xanadu Test Project in filter bar');
    } else {
      await page.locator('.ant-select-dropdown:not([style*="display: none"]) .ant-select-item-option').first().click();
      note('Selected first option in filter bar');
    }
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle').catch(() => {});
  } else {
    // Fallback: try selecting by index — filter bar selects come AFTER the form selects
    // Form has: Project(0), Allocation Type(1). Filter bar: Project(2), Status(3), Types(4)
    note('Fallback: clicking 3rd ant-select (index 2)');
    const allSelects = page.locator('.ant-select');
    const total = await allSelects.count();
    note(`Total ant-select: ${total}`);
    if (total >= 3) {
      await allSelects.nth(2).click();
      await page.waitForTimeout(1500);
      const opts2 = await page.locator('.ant-select-dropdown:not([style*="display: none"]) .ant-select-item-option').allTextContents().catch(() => []);
      note(`Options: ${JSON.stringify(opts2)}`);
      const xOpt2 = page.locator('.ant-select-dropdown:not([style*="display: none"]) .ant-select-item-option').filter({ hasText: 'Xanadu' }).first();
      if (await xOpt2.count() > 0) { await xOpt2.click(); note('Selected Xanadu via fallback'); }
      else { await page.locator('.ant-select-dropdown:not([style*="display: none"]) .ant-select-item-option').first().click(); }
      await page.waitForTimeout(3000);
    }
  }

  await page.screenshot({ path: path.join(OUT_DIR, '_debug-v4-after-filter-select.png') });

  const rowTexts = await page.locator('tbody.ant-table-tbody tr.ant-table-row').allInnerTexts().catch(() => []);
  note(`Rows after filter project select: ${rowTexts.length}`);
  rowTexts.forEach((t, i) => note(`  Row ${i}: ${t.replace(/\n/g, ' | ').substring(0, 200)}`));

  // ── Cancel modal (Upcoming row) ──
  const upcomingIdx = rowTexts.findIndex(t => /upcoming/i.test(t));
  note(`Upcoming row index: ${upcomingIdx}`);
  if (upcomingIdx >= 0) {
    const upRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').nth(upcomingIdx);
    const actHtml = await upRow.innerHTML().catch(() => '');
    note(`Upcoming row HTML: ${actHtml.substring(0, 600)}`);

    // Cancel button: Ant renders as <a> or <button> with text or icon
    const cancelBtn = upRow.locator('button.ant-btn-link, a').filter({ hasText: /cancel/i }).first();
    const cancelIcon = upRow.locator('span[aria-label="close-circle"]').first();
    note(`Cancel btn count: ${await cancelBtn.count()}, Cancel icon: ${await cancelIcon.count()}`);

    if (await cancelBtn.count() > 0) await cancelBtn.click();
    else if (await cancelIcon.count() > 0) await cancelIcon.click();
    else {
      // Last resort: click any non-View action in the row
      const allBtns = await upRow.locator('button, a').all();
      note(`All buttons in upcoming row: ${allBtns.length}`);
      for (const b of allBtns) {
        const t = await b.innerText().catch(() => '');
        const h = await b.innerHTML().catch(() => '');
        note(`  btn: "${t}" html: ${h.substring(0, 100)}`);
      }
    }

    await page.waitForTimeout(2000);
    const modalVis = await page.locator('.ant-modal-content').isVisible().catch(() => false);
    note(`Cancel modal visible: ${modalVis}`);
    if (modalVis) {
      await page.screenshot({ path: path.join(OUT_DIR, 'allocation-cancel-modal.png') });
      note('CAPTURED: allocation-cancel-modal.png');
      const title = await page.locator('.ant-modal-title').textContent().catch(() => '');
      const btns  = await page.locator('.ant-modal-content button').allTextContents().catch(() => []);
      note(`Modal title: "${title}" | buttons: ${JSON.stringify(btns)}`);
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
    note(`View btn: ${await viewBtn.count()}, Eye: ${await eyeIcon.count()}`);
    if (await viewBtn.count() > 0) await viewBtn.click();
    else if (await eyeIcon.count() > 0) await eyeIcon.click();

    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);
    note(`URL: ${page.url()}`);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const tabs = await page.locator('.ant-tabs-tab').allTextContents().catch(() => []);
    const headings = await page.locator('h1,h2,h3,h4').allTextContents().catch(() => []);
    note(`Tabs: ${JSON.stringify(tabs)} | Headings: ${JSON.stringify(headings)}`);
    note(`Has "round": ${/round/i.test(bodyText)}`);

    if (/round/i.test(bodyText)) {
      const roundEl = page.locator('.ant-tabs-tab, h2, h3, section, div').filter({ hasText: /^rounds?$/i }).first();
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
    path.join(OUT_DIR, '_capture-notes-final-v4.json'),
    JSON.stringify({ log, timestamp: new Date().toISOString() }, null, 2)
  );
  await browser.close();
  note('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
