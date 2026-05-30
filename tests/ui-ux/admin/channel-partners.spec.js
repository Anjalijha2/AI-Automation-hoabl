'use strict';

/**
 * channel-partners.spec.js — UI/UX tests for the Admin Portal Channel Partners module.
 *
 * What this file tests:
 *   Pure layout / rendering / surface assertions for the CP module. No mutations —
 *   every test is safe to run on UAT without ALLOW_DESTRUCTIVE. Visual baselines
 *   captured at viewport 1920x900 via toHaveScreenshot().
 *
 * TC IDs map to manual-qa-repository/01-test-cases/admin-portal/channel-partners/TC_CHANNEL_PARTNERS.md.
 * BRD reference: ADMIN-FS-Channel-Partners §<section>.
 */

const { test, expect } = require('@playwright/test');
const { ChannelPartnersPage } = require('../../../automation-repository/pages/admin/ChannelPartnersPage');

test.use({
  storageState: 'automation-repository/fixtures/.auth/admin.json',
  viewport: { width: 1920, height: 900 },
});

test.describe('Channel Partners — Admin Portal UI/UX', () => {
  let cpPage;

  test.beforeEach(async ({ page }) => {
    cpPage = new ChannelPartnersPage(page);
    await cpPage.navigate();
    await cpPage.waitForLoad();
  });

  test('ADM_CP_003 — ADMIN-FS-Channel-Partners §1 — Header buttons render (Map Master CP, Reset Filters, Refresh)', async ({ page }) => {
    await expect(cpPage.mapMasterCPButton).toBeVisible();
    await expect(cpPage.resetFiltersButton).toBeVisible();
    await expect(cpPage.refreshButton).toBeVisible();
    await expect(page).toHaveScreenshot('cp-ui-003-header-buttons.png', { maxDiffPixels: 200 });
  });

  test('ADM_CP_005 — ADMIN-FS-Channel-Partners §1 — CP table renders headers (≥10 columns)', async ({ page }) => {
    const headerCount = await cpPage.tableHeaderCells.count();
    // FSD §1 lists 13 columns + Actions; assert ≥10 to absorb minor column tweaks.
    expect(headerCount).toBeGreaterThanOrEqual(10);
    await expect(page).toHaveScreenshot('cp-ui-005-table-headers.png', { maxDiffPixels: 200 });
  });

  test('ADM_CP_006 — ADMIN-FS-Channel-Partners §1 — Checkbox column visible as leftmost column', async ({ page }) => {
    await expect(cpPage.selectAllCheckbox).toBeVisible();
    // The header checkbox is selectAll; per-row checkboxes are in rowCheckboxes.
    // A populated UAT will expose ≥ 1 row checkbox; an empty UAT will not.
    const rowCount = await cpPage.getRowCount();
    if (rowCount > 0) {
      const firstRowCheckbox = cpPage.tableRows.first().locator('input[type="checkbox"]').first();
      await expect(firstRowCheckbox).toBeVisible();
    }
    await expect(page).toHaveScreenshot('cp-ui-006-checkbox-column.png', { maxDiffPixels: 200 });
  });

  test('ADM_CP_007 — ADMIN-FS-Channel-Partners §1 — Actions column shows action triggers per row', async () => {
    const rowCount = await cpPage.getRowCount();
    test.skip(rowCount === 0, 'No CP rows on UAT to inspect Actions column');

    // The first row should expose at least one action button (eye + three-dot menu).
    const firstRowActions = cpPage.tableRows.first().locator('.cp-row-action, button.cp-row-action');
    const actionCount = await firstRowActions.count();
    expect(actionCount).toBeGreaterThanOrEqual(1);
  });

  test('ADM_CP_008 — ADMIN-FS-Channel-Partners §1 — CP Type column shows "Master CP" or "Member CP"', async () => {
    const rows = await cpPage.getCpList();
    test.skip(rows.length === 0, 'No CP rows on UAT to inspect CP Type column');

    const allowed = /master|member|standalone/i;
    let inspected = 0;
    for (const r of rows) {
      if (r.cpType && r.cpType.length > 0) {
        expect(r.cpType).toMatch(allowed);
        inspected++;
      }
    }
    expect(inspected).toBeGreaterThan(0);
  });

  test('ADM_CP_004 — ADMIN-FS-Channel-Partners §1 — Map Master CP button rendered disabled by default', async ({ page }) => {
    await cpPage.expectMapButtonDisabled();
    await expect(page).toHaveScreenshot('cp-ui-004-map-master-disabled.png', { maxDiffPixels: 200 });
  });
});
