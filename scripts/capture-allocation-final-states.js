// scripts/capture-allocation-final-states.js
// Captures Cancel modal (Upcoming campaign) + Rounds UI (Dynamic campaign detail)
// Both campaigns now exist in UAT as of 2026-06-02.

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
  const context = await browser.newContext({
    storageState: AUTH,
    viewport: VIEWPORT,
  });
  const page = await context.newPage();
  await page.setViewportSize(VIEWPORT);

  const log = [];
  const note = (msg) => { console.log(msg); log.push(msg); };

  note('Navigating to allocation page...');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Select Xanadu Test Project
  note('Selecting project...');
  const projectSelect = page.locator('.ant-select').first();
  await projectSelect.click();
  await page.waitForTimeout(500);
  await page.locator('.ant-select-item-option-content:has-text("Xanadu Test Project")').first().click();
  await page.waitForTimeout(2000);

  // ── CAPTURE 1: Cancel modal on Upcoming campaign ──────────────────────────
  note('Looking for Upcoming campaign Cancel button...');
  const cancelBtn = page.locator('tbody.ant-table-tbody tr.ant-table-row').filter({ hasText: 'Upcoming' }).locator('button:has-text("Cancel"), a:has-text("Cancel"), span:has-text("Cancel")').first();
  const cancelBtnCount = await cancelBtn.count();
  note(`Cancel buttons found on Upcoming rows: ${cancelBtnCount}`);

  if (cancelBtnCount > 0) {
    await cancelBtn.click();
    await page.waitForTimeout(1500);
    const modalVisible = await page.locator('.ant-modal-content').isVisible().catch(() => false);
    if (modalVisible) {
      note('Cancel modal visible — capturing...');
      await page.screenshot({ path: path.join(OUT_DIR, 'allocation-cancel-modal.png'), fullPage: false });
      note('CAPTURED: allocation-cancel-modal.png');

      // Extract selectors
      const title = await page.locator('.ant-modal-title').textContent().catch(() => '');
      const buttons = await page.locator('.ant-modal-content button').allTextContents().catch(() => []);
      note(`Modal title: "${title.trim()}"`);
      note(`Modal buttons: ${JSON.stringify(buttons)}`);

      // Dismiss
      const dismissBtn = page.locator('.ant-modal-content button').filter({ hasText: /cancel|close|no/i }).first();
      const dismissCount = await dismissBtn.count();
      if (dismissCount > 0) {
        await dismissBtn.click();
      } else {
        await page.locator('.ant-modal-close').click();
      }
      await page.waitForTimeout(1000);
    } else {
      note('UNREACHABLE: Cancel modal did not appear after clicking Cancel button');
    }
  } else {
    // Try finding Cancel as a link with cancel icon
    const cancelLink = page.locator('tbody.ant-table-tbody tr.ant-table-row').filter({ hasText: 'Upcoming' }).locator('[class*="cancel"], .ant-btn-link').first();
    const linkCount = await cancelLink.count();
    note(`Alt cancel link count: ${linkCount}`);
    if (linkCount > 0) {
      await cancelLink.click();
      await page.waitForTimeout(1500);
      const modalVisible = await page.locator('.ant-modal-content').isVisible().catch(() => false);
      if (modalVisible) {
        await page.screenshot({ path: path.join(OUT_DIR, 'allocation-cancel-modal.png'), fullPage: false });
        note('CAPTURED via alt: allocation-cancel-modal.png');
        await page.locator('.ant-modal-close').click().catch(() => {});
      }
    } else {
      note('UNREACHABLE: No Cancel trigger found on Upcoming rows');
      // Dump row HTML for evidence
      const upcomingRows = await page.locator('tbody.ant-table-tbody tr.ant-table-row').filter({ hasText: 'Upcoming' }).all();
      for (const row of upcomingRows) {
        const html = await row.innerHTML().catch(() => '');
        note(`Upcoming row HTML snippet: ${html.substring(0, 500)}`);
      }
    }
  }

  // ── CAPTURE 2: Rounds UI on Dynamic campaign detail ───────────────────────
  note('Looking for Dynamic campaign View link...');
  await page.waitForTimeout(1000);

  const dynamicRow = page.locator('tbody.ant-table-tbody tr.ant-table-row').filter({ hasText: 'DYNAMIC' }).first();
  const dynamicCount = await dynamicRow.count();
  note(`Dynamic rows found: ${dynamicCount}`);

  if (dynamicCount > 0) {
    const viewLink = dynamicRow.locator('a:has-text("View"), button:has-text("View"), span[aria-label="eye"]').first();
    const viewCount = await viewLink.count();
    note(`View link on Dynamic row: ${viewCount}`);

    if (viewCount > 0) {
      await viewLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      note(`Navigated to: ${page.url()}`);

      // Dump all visible text/headings/tabs to find Rounds
      const headings = await page.locator('h1,h2,h3,h4,.ant-tabs-tab').allTextContents().catch(() => []);
      note(`Headings/tabs on detail page: ${JSON.stringify(headings)}`);

      const bodyText = await page.locator('body').innerText().catch(() => '');
      const hasRounds = bodyText.toLowerCase().includes('round');
      note(`Page contains "round": ${hasRounds}`);

      if (hasRounds) {
        // Try clicking Rounds tab if present
        const roundsTab = page.locator('.ant-tabs-tab:has-text("Round"), button:has-text("Round"), [class*="round"]').first();
        const tabCount = await roundsTab.count();
        if (tabCount > 0) {
          await roundsTab.click();
          await page.waitForTimeout(1000);
        }
        await page.screenshot({ path: path.join(OUT_DIR, 'allocation-rounds-view.png'), fullPage: false });
        note('CAPTURED: allocation-rounds-view.png');
      } else {
        note('UNREACHABLE: No Rounds section found on Dynamic campaign detail page');
        await page.screenshot({ path: path.join(OUT_DIR, 'allocation-dynamic-detail.png'), fullPage: false });
        note('CAPTURED fallback: allocation-dynamic-detail.png (for DOM evidence)');
        const allText = bodyText.substring(0, 1000);
        note(`Detail page text (first 1000 chars): ${allText}`);
      }
    } else {
      note('UNREACHABLE: No View link on Dynamic row');
    }
  } else {
    note('UNREACHABLE: No Dynamic campaign rows found');
  }

  // Save log
  fs.writeFileSync(
    path.join(OUT_DIR, '_capture-notes-final.json'),
    JSON.stringify({ log, timestamp: new Date().toISOString() }, null, 2)
  );

  await browser.close();
  note('Done.');
  console.log('\n=== SUMMARY ===');
  log.forEach(l => console.log(l));
}

run().catch(err => { console.error(err); process.exit(1); });
