// Probe: fetch SM active campaign and any seed registration numbers
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 900 }, storageState: AUTH });
  const page = await context.newPage();

  // Intercept network responses
  const captured = { campaign: null, searches: [], errors: [] };
  page.on('response', async (resp) => {
    const url = resp.url();
    if (/smPhysicalEvent|physical-event|activeCampaign|registrations/i.test(url) || /\/api\/v\d+\//.test(url)) {
      try {
        const ct = resp.headers()['content-type'] || '';
        if (ct.includes('json')) {
          const body = await resp.json().catch(() => null);
          if (body) {
            captured.searches.push({ url, status: resp.status(), bodyPreview: JSON.stringify(body).slice(0, 2000) });
          }
        }
      } catch (e) { captured.errors.push({ url, err: String(e?.message || e) }); }
    }
  });

  await page.goto('https://uat-web.xrportal.in/sales-manager/physical-allocation', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // Try various queries to find a registered customer
  const queries = ['9000000000', '9999999999', '8000000000', '7000000000', '7777777777', '9876543210', '0000099999', 'REG', 'REG-', 'REG-001'];
  for (const q of queries) {
    try {
      const input = page.locator('input.search-input').first();
      await input.click();
      await input.fill('');
      await input.type(q, { delay: 20 });
      await page.waitForTimeout(2500); // 500ms debounce + req
      const rows = await page.locator('tbody tr.ant-table-row td').count();
      const noDataShown = await page.locator('.ant-empty').count();
      console.log(`q="${q}" -> td-count=${rows}, empty=${noDataShown}`);
      // capture row text
      const rowTexts = await page.locator('tbody tr.ant-table-row').allInnerTexts().catch(() => []);
      if (rowTexts.length > 0 && rowTexts.some(t => t.trim().length > 5)) {
        console.log(`  HIT! Row texts:`, rowTexts);
      }
    } catch (e) {
      console.log(`q="${q}" err:`, e?.message || e);
    }
  }

  fs.writeFileSync(path.join(__dirname, '_probe-sm-active-campaign-results.json'), JSON.stringify(captured, null, 2));
  console.log('\nNetwork responses captured:', captured.searches.length);
  console.log('Saved to scripts/_probe-sm-active-campaign-results.json');

  await context.close();
  await browser.close();
})();
