// Batch visual-capture for 5 remaining Admin STUB modules
// Captures: initial load + DOM structural notes for each module
const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const VM   = path.join(ROOT, 'visual-memory', 'admin');
const VW   = { width: 1920, height: 900 };

const MODULES = [
  { key: 'channel-partners',    url: 'https://uat-web.xrportal.in/admin/channel-partners' },
  { key: 'jbp',                 url: 'https://uat-web.xrportal.in/admin/jbp-management' },
  { key: 'offers',              url: 'https://uat-web.xrportal.in/admin/offers' },
  { key: 'payment-transactions',url: 'https://uat-web.xrportal.in/admin/payment-transactions' },
  { key: 'sales-managers',      url: 'https://uat-web.xrportal.in/admin/sales-managers' },
];

async function inspectPage(page) {
  return await page.evaluate(() => {
    const getText = sel => document.querySelector(sel)?.innerText?.trim() || '';
    const getAttr = (sel, attr) => document.querySelector(sel)?.getAttribute(attr) || '';

    // Headings
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5')]
      .map(h => `${h.tagName.toLowerCase()}: "${h.innerText.trim()}"`)
      .filter(t => t.length < 100);

    // Table columns
    const thEls = [...document.querySelectorAll('th.ant-table-cell, th')];
    const columns = thEls.map(th => th.innerText.trim()).filter(t => t && t.length < 60);

    // Buttons visible
    const btns = [...document.querySelectorAll('button:not([disabled])')];
    const buttons = btns.map(b => {
      const txt = b.innerText.trim();
      const cls = b.className.substring(0, 80);
      return txt ? `"${txt}" (${cls})` : null;
    }).filter(Boolean).slice(0, 15);

    // Input placeholders
    const inputs = [...document.querySelectorAll('input[placeholder], textarea[placeholder]')]
      .map(i => `${i.tagName.toLowerCase()}[placeholder="${i.getAttribute('placeholder')}"]`)
      .slice(0, 10);

    // Ant tabs
    const tabs = [...document.querySelectorAll('.ant-tabs-tab')]
      .map(t => t.innerText.trim()).filter(Boolean);

    // Ant select placeholders
    const selects = [...document.querySelectorAll('.ant-select')]
      .map(s => s.querySelector('.ant-select-selection-placeholder')?.innerText?.trim() || s.innerText?.trim()?.substring(0,30))
      .filter(Boolean).slice(0, 8);

    // Ant badge / stat numbers
    const stats = [...document.querySelectorAll('.ant-statistic-content-value, .ant-badge-count')]
      .map(s => s.innerText.trim()).filter(Boolean).slice(0, 6);

    // Table row count
    const rows = document.querySelectorAll('tbody.ant-table-tbody tr.ant-table-row').length;

    // Page title from tab
    const pageTitle = document.title;

    // Empty state text
    const emptyText = getText('.ant-empty-description') || getText('.ant-table-placeholder');

    return { headings, columns, buttons, inputs, tabs, selects, stats, rows, pageTitle, emptyText };
  });
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const ctx = await browser.newContext({ storageState: AUTH, viewport: VW });
  const page = await ctx.newPage();
  await page.setViewportSize(VW);

  const allNotes = {};

  for (const mod of MODULES) {
    const outDir = path.join(VM, mod.key);
    const log = [];
    const note = m => { console.log(`[${mod.key}] ${m}`); log.push(m); };

    note(`Navigating to ${mod.url}`);
    await page.goto(mod.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    note(`URL after load: ${page.url()}`);

    // Main loaded screenshot
    await page.screenshot({ path: path.join(outDir, `${mod.key}-loaded.png`) });
    note(`CAPTURED: ${mod.key}-loaded.png`);

    // DOM inspection
    const dom = await inspectPage(page);
    note(`Headings: ${JSON.stringify(dom.headings)}`);
    note(`Columns: ${JSON.stringify(dom.columns)}`);
    note(`Buttons: ${JSON.stringify(dom.buttons)}`);
    note(`Inputs: ${JSON.stringify(dom.inputs)}`);
    note(`Tabs: ${JSON.stringify(dom.tabs)}`);
    note(`Selects: ${JSON.stringify(dom.selects)}`);
    note(`Rows visible: ${dom.rows}`);
    note(`Empty state: "${dom.emptyText}"`);

    // If JBP has tabs — capture each tab
    if (mod.key === 'jbp' && dom.tabs.length > 0) {
      for (const tabText of dom.tabs) {
        const tabEl = page.locator('.ant-tabs-tab').filter({ hasText: tabText }).first();
        if (await tabEl.count() > 0) {
          await tabEl.click();
          await page.waitForTimeout(2000);
          const slug = tabText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g,'');
          await page.screenshot({ path: path.join(outDir, `jbp-tab-${slug}.png`) });
          note(`CAPTURED tab: jbp-tab-${slug}.png`);
          const tabDom = await inspectPage(page);
          note(`  Tab "${tabText}" columns: ${JSON.stringify(tabDom.columns)}`);
          note(`  Tab "${tabText}" buttons: ${JSON.stringify(tabDom.buttons)}`);
          note(`  Tab "${tabText}" rows: ${tabDom.rows}`);
        }
      }
      // Go back to first tab
      await page.locator('.ant-tabs-tab').first().click();
      await page.waitForTimeout(1000);
    }

    // Payment Transactions: check for gateway settings tab/section
    if (mod.key === 'payment-transactions') {
      const gwTab = page.locator('.ant-tabs-tab, button, a').filter({ hasText: /gateway|config|setting/i }).first();
      if (await gwTab.count() > 0) {
        await gwTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outDir, 'payment-gateway-settings.png') });
        note('CAPTURED: payment-gateway-settings.png');
        const gwDom = await inspectPage(page);
        note(`Gateway section buttons: ${JSON.stringify(gwDom.buttons)}`);
        note(`Gateway section inputs: ${JSON.stringify(gwDom.inputs)}`);
      } else {
        note('No gateway tab found — check if inline section exists');
        // Scroll down to find gateway section
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(outDir, 'payment-scrolled.png') });
        note('CAPTURED: payment-scrolled.png');
      }
    }

    // Sales Managers: try to open "Add Sales Manager" modal
    if (mod.key === 'sales-managers') {
      const addBtn = page.locator('button').filter({ hasText: /add sales manager/i }).first();
      if (await addBtn.count() > 0) {
        await addBtn.click();
        await page.waitForTimeout(2000);
        const modal = page.locator('.ant-modal-content');
        if (await modal.isVisible().catch(() => false)) {
          await page.screenshot({ path: path.join(outDir, 'sales-managers-add-modal.png') });
          note('CAPTURED: sales-managers-add-modal.png');
          const modalDom = await page.evaluate(() => {
            const inputs = [...document.querySelectorAll('.ant-modal-content input[placeholder], .ant-modal-content textarea')]
              .map(i => `${i.tagName.toLowerCase()}[placeholder="${i.getAttribute('placeholder') || ''}"]`);
            const btns = [...document.querySelectorAll('.ant-modal-content button')]
              .map(b => `"${b.innerText.trim()}"`).filter(Boolean);
            const title = document.querySelector('.ant-modal-title')?.innerText?.trim() || '';
            return { title, inputs, btns };
          });
          note(`Modal title: "${modalDom.title}"`);
          note(`Modal inputs: ${JSON.stringify(modalDom.inputs)}`);
          note(`Modal buttons: ${JSON.stringify(modalDom.btns)}`);
          // Dismiss
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      } else {
        note('No "Add Sales Manager" button found');
      }
    }

    // Offers: try to open "Add Offer" or "Create Offer" modal
    if (mod.key === 'offers') {
      const addBtn = page.locator('button').filter({ hasText: /add offer|create offer|new offer/i }).first();
      if (await addBtn.count() > 0) {
        await addBtn.click();
        await page.waitForTimeout(2000);
        const modal = page.locator('.ant-modal-content');
        if (await modal.isVisible().catch(() => false)) {
          await page.screenshot({ path: path.join(outDir, 'offers-add-modal.png') });
          note('CAPTURED: offers-add-modal.png');
          const modalDom = await page.evaluate(() => {
            const inputs = [...document.querySelectorAll('.ant-modal-content input[placeholder], .ant-modal-content textarea')]
              .map(i => `${i.tagName.toLowerCase()}[placeholder="${i.getAttribute('placeholder') || ''}"]`);
            const btns = [...document.querySelectorAll('.ant-modal-content button')]
              .map(b => `"${b.innerText.trim()}"`).filter(Boolean);
            const title = document.querySelector('.ant-modal-title')?.innerText?.trim() || '';
            const selects = [...document.querySelectorAll('.ant-modal-content .ant-select')]
              .map(s => s.querySelector('.ant-select-selection-placeholder')?.innerText?.trim() || '');
            return { title, inputs, btns, selects };
          });
          note(`Modal title: "${modalDom.title}"`);
          note(`Modal inputs: ${JSON.stringify(modalDom.inputs)}`);
          note(`Modal buttons: ${JSON.stringify(modalDom.btns)}`);
          note(`Modal selects: ${JSON.stringify(modalDom.selects)}`);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      } else {
        note('No Add Offer button found');
      }

      // Check for toggle/status column in table - capture row actions
      const firstRowActions = await page.locator('tbody.ant-table-tbody tr.ant-table-row').first()
        .locator('td').last().innerText().catch(() => '');
      note(`First row last-col: "${firstRowActions}"`);
    }

    // Channel Partners: check for Map Master CP modal trigger
    if (mod.key === 'channel-partners') {
      // Check checkbox to enable Map Master CP
      const firstCheckbox = page.locator('tbody.ant-table-tbody tr.ant-table-row .ant-checkbox-input').first();
      if (await firstCheckbox.count() > 0) {
        await firstCheckbox.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(outDir, 'channel-partners-row-selected.png') });
        note('CAPTURED: channel-partners-row-selected.png');
        const mapBtn = page.locator('button').filter({ hasText: /map master/i }).first();
        if (await mapBtn.count() > 0 && !(await mapBtn.isDisabled().catch(() => true))) {
          await mapBtn.click();
          await page.waitForTimeout(2000);
          const modal = page.locator('.ant-modal-content');
          if (await modal.isVisible().catch(() => false)) {
            await page.screenshot({ path: path.join(outDir, 'channel-partners-map-modal.png') });
            note('CAPTURED: channel-partners-map-modal.png');
            const modalDom = await page.evaluate(() => ({
              title: document.querySelector('.ant-modal-title')?.innerText?.trim() || '',
              btns: [...document.querySelectorAll('.ant-modal-content button')].map(b => `"${b.innerText.trim()}"`).filter(Boolean),
            }));
            note(`Map modal title: "${modalDom.title}" | Buttons: ${JSON.stringify(modalDom.btns)}`);
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }
        }
      } else {
        note('No checkboxes found in CP table');
      }
    }

    // First row actions (View link, edit, delete etc)
    const firstRowBtns = await page.locator('tbody.ant-table-tbody tr.ant-table-row').first()
      .locator('a, button').allInnerTexts().catch(() => []);
    note(`First row action buttons: ${JSON.stringify(firstRowBtns)}`);

    // Final full-page screenshot for each module
    await page.screenshot({ path: path.join(outDir, `${mod.key}-full.png`) });
    note(`CAPTURED: ${mod.key}-full.png`);

    allNotes[mod.key] = { log, dom };
  }

  fs.writeFileSync(
    path.join(ROOT, 'visual-memory', 'admin', '_capture-notes-remaining-modules.json'),
    JSON.stringify(allNotes, null, 2)
  );
  await browser.close();
  console.log('Done — all 5 modules captured.');
}

run().catch(e => { console.error(e); process.exit(1); });
