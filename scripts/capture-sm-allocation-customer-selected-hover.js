// Capture allocation-customer-selected.png with the row + Select button in hover/focus state
// (so it visibly differs from allocation-search-result.png which is the unhovered table state).

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH = path.join(ROOT, 'automation-repository', 'fixtures', '.auth', 'sales-manager.json');
const OUT  = path.join(ROOT, 'visual-memory', 'sm', 'physical-allocation');
const VIEWPORT = { width: 1920, height: 900 };
const BASE = 'https://uat-web.xrportal.in/sales-manager';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT, storageState: AUTH });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/physical-allocation`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);

  const input = page.locator('input.search-input').first();
  await input.click(); await input.fill(''); await input.type('7666470638', { delay: 40 });
  await page.waitForTimeout(2800);
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);

  // Hover the row + button to show focus/active state
  const row = page.locator('.search-card .ant-table-tbody tr.ant-table-row').first();
  await row.hover();
  await page.waitForTimeout(300);
  const sel = page.locator('button.select-action-btn').first();
  await sel.hover();
  // Trigger :focus visual via tab
  await sel.focus().catch(() => {});
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(OUT, 'allocation-customer-selected.png'), fullPage: false });
  console.log('Wrote allocation-customer-selected.png with row hover + Select focused');
  await browser.close();
})();
