const { test } = require('@playwright/test');
test.use({ storageState: 'src/fixtures/.auth/admin.json' });

test('probe JBP management page', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('https://uat-web.xrportal.in/admin/jbp-management', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  console.log('URL:', page.url());

  // Tabs
  const tabs = await page.locator('.ant-tabs-tab, [role="tab"]').allTextContents();
  console.log('Tabs:', tabs.map(t => t.trim()).filter(Boolean));

  // Table headers
  const ths = await page.locator('thead th').allTextContents();
  console.log('Table headers:', ths.map(t => t.trim()).filter(Boolean));

  // Total row count
  const rows = await page.locator('tbody tr').count();
  console.log('Table rows:', rows);

  // First row data
  const firstRowCells = await page.locator('tbody tr:first-child td').allTextContents();
  console.log('First row:', firstRowCells.map(c => c.trim()));

  // Buttons
  const btns = await page.locator('button:visible').allTextContents();
  console.log('Visible buttons:', btns.map(b => b.trim()).filter(Boolean));

  // Date range picker selectors
  const datePickers = await page.locator('.ant-picker, input[placeholder*="date" i], input[placeholder*="Date" i]').all();
  console.log('Date pickers found:', datePickers.length);
  for (let i = 0; i < datePickers.length; i++) {
    const ph = await datePickers[i].getAttribute('placeholder').catch(() => '');
    const cls = await datePickers[i].getAttribute('class').catch(() => '');
    console.log(`  Picker[${i}]: placeholder="${ph}" class="${cls?.slice(0, 60)}"`);
  }

  // Cycle Date Range container
  const rangeHTML = await page.locator('.ant-picker-range, [class*="date-range"], [class*="cycle-date"]').first().innerHTML().catch(() => 'not found');
  console.log('Date range HTML:', rangeHTML.slice(0, 400));

  // Status badges
  const statuses = await page.locator('tbody td').filter({ hasText: /OPEN|CLOSED/ }).allTextContents();
  console.log('Statuses in table:', statuses.map(s => s.trim()));
});
