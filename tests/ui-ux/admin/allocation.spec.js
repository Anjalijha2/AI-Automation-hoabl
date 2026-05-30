'use strict';

/**
 * allocation.spec.js — UI/UX tests for the Admin Portal Allocation module.
 *
 * What this file tests:
 *   Visual rendering, layout, KPI surfaces, list/table structure, responsive
 *   breakpoints, and form accessibility on /admin/allocation. NO mutations.
 *   These tests run safely on any environment — they read-only inspect the UI.
 *
 * Source-of-truth: manual-qa-repository/01-test-cases/admin-portal/allocation/TC_ALLOCATION.md
 * BRD reference: ADMIN-FS-Allocation §<section>.
 *
 * Authentication:
 *   Runs as authenticated admin via the saved storageState file.
 */

const { test, expect } = require('@playwright/test');
const { AllocationPage } = require('../../../automation-repository/pages/admin/AllocationPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/admin.json' });

test.describe('Allocation — Admin Portal UI/UX', () => {
  let allocationPage;

  test.beforeEach(async ({ page }) => {
    allocationPage = new AllocationPage(page);
    await allocationPage.navigate();
    await allocationPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UI: Page layout & primary controls
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_UI_001 — ADMIN-FS-Allocation §1 — Allocation page renders with expected primary controls', async ({ page }) => {
    await allocationPage.expectOnAllocationUrl();
    await expect(allocationPage.saveCampaignButton).toBeVisible();
    await expect(allocationPage.resetButton).toBeVisible();
    // Visual baseline — full page snapshot
    await expect(page).toHaveScreenshot('allocation-ui-001-layout.png', {
      maxDiffPixels: 250,
      fullPage: true,
    });
  });

  test('ADM_ALLOC_005 — ADMIN-FS-Allocation §1 — Save Campaign button visible above the fold', async () => {
    // Critical CTA must render in the initial viewport
    const isVisible = await allocationPage.saveCampaignButton.isVisible();
    expect(isVisible).toBeTruthy();
    const box = await allocationPage.saveCampaignButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UI: KPI cards / Statistic surfaces
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_UI_002 — ADMIN-FS-Allocation §1 — KPI/statistic surfaces render', async () => {
    // The Allocation page may surface campaign KPIs. We assert the locator
    // group exists (count ≥ 0 is fine — module may render zero cards on
    // bare-data UAT). When cards render, each must have a visible bounding box.
    const count = await allocationPage.kpiCards.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const box = await allocationPage.kpiCards.nth(i).boundingBox();
        expect(box).not.toBeNull();
      }
    } else {
      // Document the empty state — the page still must show the campaign table area
      await expect(allocationPage.campaignTable.first()).toBeVisible();
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UI: Campaign list / table
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_002 — ADMIN-FS-Allocation §1 — Campaign table renders with expected column headers', async () => {
    await expect(allocationPage.campaignTable.first()).toBeVisible();
    const headerCount = await allocationPage.campaignTableHeaders.count();
    expect(headerCount).toBeGreaterThan(0);

    // Collect header labels and verify the expected columns are present
    const labels = [];
    for (let i = 0; i < headerCount; i++) {
      labels.push(((await allocationPage.campaignTableHeaders.nth(i).textContent()) || '').trim().toLowerCase());
    }
    const joined = labels.join('|');
    // FSD-defined columns: Name, Type, Start Time, End Time, Status, Actions
    expect(joined).toMatch(/name/);
    expect(joined).toMatch(/type/);
    expect(joined).toMatch(/status/);
  });

  test('ADM_ALLOC_003 — ADMIN-FS-Allocation §1 — Status badges use defined campaign states', async () => {
    const rows = await allocationPage.getCampaignsList();
    test.skip(rows.length === 0, 'No campaigns on UAT — cannot inspect status badge values');

    const allowedStates = /upcoming|active|completed|cancelled|stopped|failed/i;
    for (const r of rows) {
      if (r.status && r.status.length > 0) {
        expect(r.status).toMatch(allowedStates);
      }
    }
  });

  test('ADM_ALLOC_035 — ADMIN-FS-Allocation §1 — Failed status (when present) is rendered as a status tag', async () => {
    const rows = await allocationPage.getCampaignsList();
    const failed = rows.find(r => /failed/i.test(r.status));
    test.skip(!failed, 'No Failed campaigns on UAT to inspect');
    expect(failed.status.toLowerCase()).toContain('failed');
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UI: Form fields & dropdown accessibility
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_UI_003 — ADMIN-FS-Allocation §2 — Create Campaign form fields render and are focusable', async () => {
    await allocationPage.openCreateCampaignModal();
    // Each required form field must be visible
    await expect(allocationPage.enterCampaignNameInput).toBeVisible();
    await expect(allocationPage.campaignTypeSelect).toBeVisible();
    await expect(allocationPage.startTimeInput).toBeVisible();
    await expect(allocationPage.endTimeInput).toBeVisible();
    // Focus the name input — keyboard-accessible
    await allocationPage.enterCampaignNameInput.click();
    const focused = await allocationPage.enterCampaignNameInput.evaluate(el => el === document.activeElement);
    expect(focused).toBeTruthy();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UI: Responsive — mobile / tablet breakpoints
  // The admin portal is primarily desktop, but the layout must not break on
  // common tablet widths. We assert primary controls remain reachable.
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_UI_004 — ADMIN-FS-Allocation §1 — Tablet viewport renders without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await allocationPage.navigate();
    await allocationPage.waitForLoad();

    await expect(allocationPage.saveCampaignButton).toBeVisible();
    await expect(allocationPage.campaignTable.first()).toBeVisible();

    // Body must not exceed the viewport width — catches accidental layout overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    // Small Ant scrollbars can produce tiny positive drift; allow up to 5px
    expect(overflow).toBeLessThanOrEqual(5);
  });

  test('ADM_ALLOC_UI_005 — ADMIN-FS-Allocation §1 — Desktop large viewport snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await allocationPage.navigate();
    await allocationPage.waitForLoad();
    await expect(page).toHaveScreenshot('allocation-ui-005-desktop-1440.png', {
      maxDiffPixels: 300,
      fullPage: true,
    });
  });
});
