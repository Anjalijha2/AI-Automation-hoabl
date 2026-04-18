const { test } = require('@playwright/test');
const { ChannelPartnersPage } = require('../../src/pages/ChannelPartnersPage.js');

test.use({ storageState: 'src/fixtures/.auth/admin.json' });

test('probe CP numbers', async ({ page }) => {
  test.setTimeout(120_000);
  const cp = new ChannelPartnersPage(page);
  await cp.navigate();

  for (const phone of ['8888888888', '7888888888']) {
    await cp.searchByPhone(phone);
    await page.waitForTimeout(1000);

    const rows = await page.locator('tbody tr').all();
    console.log(`\n=== Search: ${phone} — ${rows.length} row(s) ===`);
    for (const row of rows.slice(0, 3)) {
      const cells = await row.locator('td').allTextContents();
      if (cells.length > 1) console.log('ROW:', JSON.stringify(cells.map(c => c.trim())));
    }

    // Also open drawer for first matching row
    const matchRow = page.locator('tbody tr').filter({ hasText: phone }).first();
    const hasMatch = await matchRow.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasMatch) {
      await matchRow.locator('button.cp-row-action').first().click();
      await page.locator('.ant-drawer-body').waitFor({ state: 'visible', timeout: 8000 });
      const drawerText = (await page.locator('.ant-drawer-body').first().textContent()) ?? '';
      console.log(`DRAWER [${phone}]:`, drawerText.replace(/\s+/g, ' ').slice(0, 400));
      await cp.closeDrawer();
    }

    await cp.clickResetFilters();
  }
});
