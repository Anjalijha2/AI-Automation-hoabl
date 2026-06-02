// scripts/capture-customers-empty-state.js
//
// Re-attempt VG-6 (Empty search state) for admin/customers.
// Strategy: phone search expects numeric — use a 10-digit phone that won't match,
// trigger search via Enter AND click-search-icon, wait for network and empty state.

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'admin.json');
const OUT  = path.join(ROOT, 'visual-memory', 'admin', 'customers', 'customers-empty-search-state.png');
const URL  = 'https://uat-web.xrportal.in/admin/customers';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 900 },
    storageState: AUTH,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Capture network for debugging
  page.on('response', (r) => {
    const u = r.url();
    if (u.includes('customer') || u.includes('registration') || u.includes('search')) {
      console.log(`  net: ${r.status()} ${u.slice(0, 120)}`);
    }
  });

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await page.waitForSelector('tbody.ant-table-tbody tr.ant-table-row', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    // Strategy A — use the "Search by Phone" input (type=tel, only digits accepted)
    const phone = page.locator('input.ant-input[placeholder="Search by Phone"]').first();
    await phone.click();
    await phone.fill('9999999000'); // 10-digit non-existent phone
    console.log('Filled phone search with 9999999000');

    // Several possible triggers: Enter, debounce, or adjacent search icon button
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // Also try clicking a sibling search icon if exists
    const searchIcon = page.locator('.ant-input-suffix .anticon-search, button[aria-label="search"]').first();
    if (await searchIcon.count() > 0) {
      await searchIcon.click().catch(() => {});
      console.log('Clicked search icon');
    }

    await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Inspect: row count + empty state
    const inspect = await page.evaluate(() => {
      const rows  = document.querySelectorAll('tbody.ant-table-tbody tr.ant-table-row');
      const empty = document.querySelector('.ant-empty, .ant-table-placeholder');
      const title = document.querySelector('h3.table-title')?.innerText || '';
      return {
        rowCount: rows.length,
        emptyFound: !!empty,
        emptyText: empty?.innerText || '',
        tableTitle: title,
      };
    });
    console.log('Inspect after Enter:', inspect);

    if (inspect.rowCount > 0 && !inspect.emptyFound) {
      // Strategy B — enable column-header Filter mode and use Registration Details column input
      console.log('Trying Strategy B — Filter toggle + Registration Details column search');
      const filterBtn = page.locator('button:has-text("Filter")').first();
      if (await filterBtn.count() > 0) {
        await filterBtn.click();
        await page.waitForTimeout(1500);

        const colInput = page.locator('input[placeholder="Search here"]').first();
        if (await colInput.count() > 0) {
          await colInput.click();
          await colInput.fill('ZZZNOMATCH99999');
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
          await page.waitForTimeout(3000);

          const inspect2 = await page.evaluate(() => {
            const rows  = document.querySelectorAll('tbody.ant-table-tbody tr.ant-table-row');
            const empty = document.querySelector('.ant-empty, .ant-table-placeholder');
            return {
              rowCount:   rows.length,
              emptyFound: !!empty,
              emptyText:  empty?.innerText || '',
            };
          });
          console.log('Inspect after column filter:', inspect2);
        }
      }
    }

    await page.screenshot({ path: OUT, fullPage: false });
    console.log('Saved:', path.relative(ROOT, OUT));

    // Final inspect for notes
    const finalState = await page.evaluate(() => {
      const rows  = document.querySelectorAll('tbody.ant-table-tbody tr.ant-table-row');
      const empty = document.querySelector('.ant-empty, .ant-table-placeholder');
      const title = document.querySelector('h3.table-title')?.innerText || '';
      const desc  = document.querySelector('.ant-empty-description')?.innerText || '';
      return {
        rowCount:   rows.length,
        emptyFound: !!empty,
        emptyClass: empty?.className || '',
        emptyText:  empty?.innerText || '',
        emptyDesc:  desc,
        tableTitle: title,
      };
    });
    console.log('Final state:', finalState);
    fs.writeFileSync(
      path.join(ROOT, 'visual-memory', 'admin', 'customers', '_empty-state-notes.json'),
      JSON.stringify(finalState, null, 2)
    );
  } finally {
    await context.close();
    await browser.close();
  }
})();
