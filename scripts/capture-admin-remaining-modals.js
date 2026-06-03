// Capture modals missed by batch script: Offers add, SM add, JBP create-cycle, SM edit
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const VM   = path.join(ROOT, 'visual-memory', 'admin');
const VW   = { width: 1920, height: 900 };

async function captureModal(page, outPath, note) {
  const modal = page.locator('.ant-modal-content');
  if (await modal.isVisible().catch(() => false)) {
    await page.screenshot({ path: outPath });
    note(`CAPTURED: ${path.basename(outPath)}`);
    const info = await page.evaluate(() => ({
      title: document.querySelector('.ant-modal-title')?.innerText?.trim() || '',
      labels: [...document.querySelectorAll('.ant-modal-content .ant-form-item-label label, .ant-modal-content label')].map(l => l.innerText.trim()).filter(Boolean),
      inputs: [...document.querySelectorAll('.ant-modal-content input[placeholder], .ant-modal-content textarea[placeholder]')].map(i => `${i.tagName.toLowerCase()}[placeholder="${i.getAttribute('placeholder')}"]`),
      selects: [...document.querySelectorAll('.ant-modal-content .ant-select')].map(s => s.querySelector('.ant-select-selection-placeholder')?.innerText?.trim() || s.innerText.trim().substring(0,30)),
      btns: [...document.querySelectorAll('.ant-modal-content button')].map(b => b.innerText.trim()).filter(Boolean),
      switches: [...document.querySelectorAll('.ant-modal-content .ant-switch')].map(s => s.innerText.trim()),
    }));
    note(`  Title: "${info.title}"`);
    note(`  Labels: ${JSON.stringify(info.labels)}`);
    note(`  Inputs: ${JSON.stringify(info.inputs)}`);
    note(`  Selects: ${JSON.stringify(info.selects)}`);
    note(`  Buttons: ${JSON.stringify(info.btns)}`);
    note(`  Switches: ${JSON.stringify(info.switches)}`);
    return info;
  }
  note(`No modal visible at ${path.basename(outPath)}`);
  return null;
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const ctx = await browser.newContext({ storageState: AUTH, viewport: VW });
  const page = await ctx.newPage();
  await page.setViewportSize(VW);
  const log = [];
  const note = m => { console.log(m); log.push(m); };

  // ── Offers: Add New Offer modal ─────────────────────────────────────────────
  note('--- Offers ---');
  await page.goto('https://uat-web.xrportal.in/admin/offers', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Try multiple selectors for add button
  const addOfferSelectors = [
    'button:has-text("Add New Offer")',
    'button.ant-btn-primary:has-text("Add")',
    '.ant-btn-primary',
  ];
  let clicked = false;
  for (const sel of addOfferSelectors) {
    const el = page.locator(sel).first();
    if (await el.count() > 0) {
      note(`Clicking: ${sel}`);
      await el.click();
      await page.waitForTimeout(2000);
      clicked = true;
      break;
    }
  }
  if (!clicked) note('No add-offer button found');

  await captureModal(page, path.join(VM, 'offers', 'offers-add-modal.png'), note);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Capture row actions detail
  const offerRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
  const offerRowHtml = await offerRow.innerHTML().catch(() => '');
  note(`First offer row HTML (600): ${offerRowHtml.substring(0, 600)}`);

  // Try to open edit modal for first offer row
  const editOfferBtn = offerRow.locator('button, a').nth(1); // second control after switch
  if (await editOfferBtn.count() > 0) {
    await editOfferBtn.click();
    await page.waitForTimeout(2000);
    await captureModal(page, path.join(VM, 'offers', 'offers-edit-modal.png'), note);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // ── JBP: Create Cycle modal ────────────────────────────────────────────────
  note('--- JBP ---');
  await page.goto('https://uat-web.xrportal.in/admin/jbp-management', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const createCycleBtn = page.locator('button:has-text("Create Cycle")').first();
  if (await createCycleBtn.count() > 0) {
    note('Clicking Create Cycle');
    await createCycleBtn.click();
    await page.waitForTimeout(2000);
    await captureModal(page, path.join(VM, 'jbp', 'jbp-create-cycle-modal.png'), note);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } else {
    note('No Create Cycle button');
  }

  // Click first row View button on Cycle Management to get cycle detail
  const cycleRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
  const cycleRowText = await cycleRow.innerText().catch(() => '');
  note(`First cycle row: ${cycleRowText.substring(0, 200)}`);

  // Check Action cell content
  const actionCells = await page.locator('tbody.ant-table-tbody tr.ant-table-row td').last().innerText().catch(() => '');
  note(`Last td (action) of first row: "${actionCells}"`);

  // ── Sales Managers: Add + Edit modals ──────────────────────────────────────
  note('--- Sales Managers ---');
  await page.goto('https://uat-web.xrportal.in/admin/sales-managers', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Add Sales Manager modal
  const addSmBtn = page.locator('button').filter({ hasText: 'Add Sales Manager' }).first();
  note(`Add SM button count: ${await addSmBtn.count()}`);
  if (await addSmBtn.count() > 0) {
    await addSmBtn.click();
    await page.waitForTimeout(2000);
    await captureModal(page, path.join(VM, 'sales-managers', 'sales-managers-add-modal.png'), note);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // Edit first SM
  const editSmBtn = page.locator('tbody.ant-table-tbody tr.ant-table-row').first()
    .locator('button:has-text("Edit")').first();
  if (await editSmBtn.count() > 0) {
    await editSmBtn.click();
    await page.waitForTimeout(2000);
    await captureModal(page, path.join(VM, 'sales-managers', 'sales-managers-edit-modal.png'), note);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // ── Channel Partners: row action buttons ───────────────────────────────────
  note('--- Channel Partners row actions ---');
  await page.goto('https://uat-web.xrportal.in/admin/channel-partners', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const cpRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').first();
  const cpRowHtml = await cpRow.innerHTML().catch(() => '');
  note(`CP first row HTML (1000): ${cpRowHtml.substring(0, 1000)}`);
  // Also get action buttons via evaluate
  const cpActions = await cpRow.locator('td').last().innerHTML().catch(() => '');
  note(`CP Actions cell HTML: ${cpActions.substring(0, 500)}`);

  // Payment Transactions: check the Settings/gateway section more carefully
  note('--- Payment Transactions gateway ---');
  await page.goto('https://uat-web.xrportal.in/admin/payment-transactions', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const settingsBtn = page.locator('button:has-text("Settings")').first();
  if (await settingsBtn.count() > 0) {
    await settingsBtn.click();
    await page.waitForTimeout(2000);
    note(`URL after Settings click: ${page.url()}`);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    note(`Body text (500): ${bodyText.substring(0, 500)}`);
    const modal = page.locator('.ant-modal-content');
    if (await modal.isVisible().catch(() => false)) {
      await page.screenshot({ path: path.join(VM, 'payment-transactions', 'payment-gateway-modal.png') });
      note('CAPTURED: payment-gateway-modal.png');
      const gwInfo = await page.evaluate(() => ({
        title: document.querySelector('.ant-modal-title')?.innerText?.trim() || '',
        rows: [...document.querySelectorAll('.ant-modal-content tr')].map(r => r.innerText.trim()).slice(0, 10),
        btns: [...document.querySelectorAll('.ant-modal-content button')].map(b => b.innerText.trim()).filter(Boolean),
      }));
      note(`GW modal title: "${gwInfo.title}"`);
      note(`GW modal rows: ${JSON.stringify(gwInfo.rows)}`);
      note(`GW modal btns: ${JSON.stringify(gwInfo.btns)}`);
      await page.keyboard.press('Escape');
    } else {
      // Maybe navigated to a different page
      await page.screenshot({ path: path.join(VM, 'payment-transactions', 'payment-settings-page.png') });
      note('CAPTURED: payment-settings-page.png (navigated, not modal)');
      const headings = await page.locator('h1,h2,h3,h4,h5').allTextContents().catch(() => []);
      note(`Settings page headings: ${JSON.stringify(headings)}`);
      const settingsBtns = await page.locator('button:not([disabled])').allTextContents().catch(() => []);
      note(`Settings page buttons: ${JSON.stringify(settingsBtns.slice(0,10))}`);
    }
  }

  fs.writeFileSync(
    path.join(VM, '_capture-notes-modals.json'),
    JSON.stringify({ log, timestamp: new Date().toISOString() }, null, 2)
  );
  await browser.close();
  note('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
