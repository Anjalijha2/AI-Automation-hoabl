// scripts/capture-cp-kyc-region-dropdown.js
// Supplementary capture — Business Region dropdown opened state for CP KYC.

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'channel-partner.json');
const OUT  = path.join(ROOT, 'visual-memory', 'cp', 'kyc-assistance');
const URL  = 'https://uat-web.xrportal.in/kyc';
const VIEWPORT = { width: 1920, height: 900 };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: AUTH, viewport: VIEWPORT });
  const page = await context.newPage();
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(1500);

    // Approach: locate the .ant-form-item that contains label "Business Region",
    // then click the .ant-select-selector inside it.
    const opened = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.ant-form-item'));
      for (const it of items) {
        const lbl = it.querySelector('.ant-form-item-label, label');
        const txt = ((lbl ? lbl.innerText : '') || '').toLowerCase();
        if (txt.includes('business region')) {
          it.scrollIntoView({ block: 'center' });
          const trig = it.querySelector('.ant-select .ant-select-selector, .ant-select-selector');
          if (trig) { trig.click(); return { ok: true, lblText: txt }; }
          return { ok: false, reason: 'no .ant-select-selector inside item', lblText: txt };
        }
      }
      return { ok: false, reason: 'no ant-form-item with Business Region label' };
    });

    if (!opened.ok) {
      // Fallback: scroll to top and click the first ant-select on the page (only 1 select per dom-inspect)
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      await page.locator('.ant-select .ant-select-selector').first().click({ force: true });
    }
    await page.waitForTimeout(900);
    const out = path.join(OUT, 'kyc-business-region-dropdown.png');
    await page.screenshot({ path: out, fullPage: false });
    const bytes = fs.statSync(out).size;
    console.log('CAPTURED', out, bytes, 'bytes', JSON.stringify(opened));

    // Also dump dropdown options
    const opts = await page.evaluate(() => {
      const list = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .rc-virtual-list, .ant-select-dropdown:not(.ant-select-dropdown-hidden)');
      if (!list) return { error: 'no open dropdown found' };
      const items = Array.from(list.querySelectorAll('.ant-select-item-option')).map(el => ({
        text: (el.innerText || '').trim(),
        selected: el.classList.contains('ant-select-item-option-selected'),
      }));
      return { count: items.length, items };
    });
    fs.writeFileSync(path.join(OUT, '_kyc-region-options.json'), JSON.stringify(opts, null, 2));
    console.log('Options:', JSON.stringify(opts));
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await browser.close();
  }
})();
