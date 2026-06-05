// scripts/capture-sm-callback-modals-v6.js
//
// v6 — open the "Select Outcome" dropdown inside the Capture VC Outcome modal
// and capture the full list of 10 vcOutcome codes.

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT  = path.join(ROOT, 'visual-memory', 'sm', 'callback-requests');
const VIEWPORT = { width: 1920, height: 900 };
const URL_CALLBACK = 'https://uat-web.xrportal.in/sales-manager/callback-requests';

const results = {};
function rec(key, status, note, extra) {
  results[key] = Object.assign({ status, note }, extra || {});
  console.log(`[${status.padEnd(18)}] ${key} — ${(note || '').slice(0, 240)}`);
}

async function settle(page, ms = 1500) { await page.waitForTimeout(ms); }
async function shot(page, file) {
  const full = path.join(OUT, file);
  await page.screenshot({ path: full, fullPage: false });
  return { path: full, bytes: fs.statSync(full).size };
}

async function run() {
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ storageState: AUTH, viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  try {
    await page.goto(URL_CALLBACK, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await settle(page, 2500);
    if (/\/login/i.test(page.url())) { rec('_auth', 'FAILED', page.url()); return; }
    rec('_auth', 'OK', page.url());

    // Open more menu on row 0
    await page.evaluate(() => {
      const r = document.querySelector('tr.ant-table-row');
      r.querySelector('td:last-child .anticon-more').click();
    });
    await settle(page, 800);

    // Click "Capture VC Outcome"
    await page.evaluate(() => {
      const items = [...document.querySelectorAll('.ant-dropdown-menu-item')];
      const m = items.find(i => /capture vc outcome/i.test(i.innerText));
      m.click();
    });
    await settle(page, 2000);

    // Click the outcome select to open
    const selectInput = page.locator('.ant-modal .ant-select-selector').first();
    await selectInput.click();
    await settle(page, 1500);

    // Capture all visible options
    const opts = await page.evaluate(() => {
      const items = [...document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')];
      return items.map(i => i.innerText.trim());
    });
    const r = await shot(page, 'callback-vc-outcome-dropdown.png');
    rec('callback-vc-outcome-dropdown', 'CAPTURED',
        `Outcomes (${opts.length}): ${JSON.stringify(opts)}`,
        { file: r.path, bytes: r.bytes, options: opts });

    // Save as canonical schedule-modal alias too — outcome list is the key data
    fs.copyFileSync(r.path, path.join(OUT, 'callback-vc-outcome-codes.png'));

  } finally {
    fs.writeFileSync(path.join(__dirname, '_capture-sm-callback-modals-v6-results.json'), JSON.stringify(results, null, 2));
    console.log('\n=== V6 RESULTS WRITTEN ===');
    await ctx.close();
    await browser.close();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
