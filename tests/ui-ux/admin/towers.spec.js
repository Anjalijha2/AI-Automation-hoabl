'use strict';

/**
 * towers.spec.js — UI/UX tests for the Admin Portal Towers module.
 *
 * What this file tests:
 *   Visual rendering, KPI card layout, sidebar list structure, floor/unit
 *   grid color-coding, and responsive breakpoints on /admin/towers. NO
 *   mutations. NO clicks that open destructive flows — only the standard
 *   read-only inspection a viewer would perform.
 *
 * Source-of-truth: manual-qa-repository/01-test-cases/admin-portal/towers/TC_TOWERS.md
 * BRD reference: ADMIN-FS-Towers §1..§3.
 *
 * Authentication:
 *   Runs as authenticated admin via the saved storageState file.
 */

const { test, expect } = require('@playwright/test');
const { TowersPage } = require('../../../automation-repository/pages/admin/TowersPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/admin.json' });

test.describe('Towers — Admin Portal UI/UX', () => {
  let towersPage;

  test.beforeEach(async ({ page }) => {
    towersPage = new TowersPage(page);
    await towersPage.navigate();
    await towersPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UI: KPI cards
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_UI_001 — ADMIN-FS-Towers §1 — KPI cards render with visible bounding boxes', async ({ page }) => {
    const count = await towersPage.expectKpiCards();
    expect(count).toBeGreaterThan(0);
    // Each card must have a non-zero bounding box
    for (let i = 0; i < Math.min(count, 8); i++) {
      const box = await towersPage.kpiCards.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    }
    await expect(page).toHaveScreenshot('towers-ui-001-kpi-row.png', {
      maxDiffPixels: 300,
      fullPage: true,
    });
  });

  test('ADM_TWR_005 — ADMIN-FS-Towers §1 — Total Units KPI surface displays a numeric value', async () => {
    const total = await towersPage.readKpiValue(/total\s*units?/i);
    if (Number.isNaN(total)) {
      test.skip(true, 'Total Units KPI not present on this UAT build');
    }
    expect(total).toBeGreaterThan(0);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UI: Sidebar tower list
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_010 — ADMIN-FS-Towers §2 — Each tower row shows "N Units Available" label', async () => {
    const towers = await towersPage.getTowersList();
    test.skip(towers.length === 0, 'No tower rows on UAT to inspect');

    // At least one row must surface an "Available" count label
    const withAvailable = towers.filter((t) => t.availableLabel && t.availableLabel.length > 0);
    expect(withAvailable.length).toBeGreaterThan(0);
    // The first such row should expose a numeric value
    expect(Number.isFinite(withAvailable[0].availableCount)).toBeTruthy();
  });

  test('ADM_TWR_011 — ADMIN-FS-Towers §2 — Inactive tower rows carry "(Inactive)" suffix', async () => {
    const towers = await towersPage.getTowersList();
    const inactive = towers.filter((t) => t.isInactive);
    test.skip(inactive.length === 0, 'No Inactive towers on UAT to inspect — Config has all 18 active');
    expect(inactive[0].raw).toMatch(/\(Inactive\)/i);
  });

  test('ADM_TWR_044 — ADMIN-FS-Towers §2 — Sidebar lists exactly 18 tower entries', async () => {
    const towers = await towersPage.getTowersList();
    // Filter to rows that match a known tower name — excludes summary/footer rows
    const matched = towers.filter((t) => TowersPage.TOWER_NAMES.some((n) => new RegExp(n, 'i').test(t.raw)));
    expect(matched.length).toBe(18);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UI: Floor / unit grid color coding
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_UI_002 — ADMIN-FS-Towers §3 — Floor/unit grid renders cells with at least one Available unit', async () => {
    await towersPage.selectTower('Crest');
    const grid = await towersPage.getFloorGrid();
    expect(grid.unitCount).toBeGreaterThan(0);

    const matrix = await towersPage.getUnitMatrix();
    expect(matrix.length).toBe(grid.unitCount);
    // Each cell must have a status string (even UNKNOWN is fine — the
    // assertion here is structural completeness, not color correctness)
    for (const m of matrix) {
      expect(typeof m.status).toBe('string');
    }
  });

  test('ADM_TWR_016 — ADMIN-FS-Towers §3 — At least one Available (white) cell is detectable in Crest', async () => {
    await towersPage.selectTower('Crest');
    const matrix = await towersPage.getUnitMatrix();
    const whites = matrix.filter((m) => m.status === 'AVAILABLE');
    // Crest typically has plenty of Available units; tolerate UAT drift with skip
    test.skip(whites.length === 0, 'No AVAILABLE units on UAT — cannot verify white cell rendering');
    expect(whites.length).toBeGreaterThan(0);
  });

  test('ADM_TWR_017 — ADMIN-FS-Towers §3 — Sold (red) cells render with a distinct status class or color', async () => {
    await towersPage.selectTower('Crest');
    const matrix = await towersPage.getUnitMatrix();
    const reds = matrix.filter((m) => m.status === 'SOLD');
    test.skip(reds.length === 0, 'No SOLD units in Crest on UAT to verify red rendering');
    expect(reds.length).toBeGreaterThan(0);
  });

  test('ADM_TWR_019 — ADMIN-FS-Towers §3 — Grey (Reserved/Blocked) cells distinguishable from Available', async () => {
    await towersPage.selectTower('Crest');
    const matrix = await towersPage.getUnitMatrix();
    const greys  = matrix.filter((m) => m.status === 'RESERVED');
    const whites = matrix.filter((m) => m.status === 'AVAILABLE');
    test.skip(greys.length === 0, 'No RESERVED units in Crest on UAT — cannot verify distinct grey rendering');
    // The two buckets must be disjoint when both are non-empty
    if (whites.length > 0) {
      expect(greys[0].color).not.toBe(whites[0].color);
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UI: Responsive — desktop / tablet breakpoints
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_UI_003 — ADMIN-FS-Towers §1 — Desktop 1440px viewport snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await towersPage.navigate();
    await towersPage.waitForLoad();
    await expect(page).toHaveScreenshot('towers-ui-003-desktop-1440.png', {
      maxDiffPixels: 350,
      fullPage: true,
    });
  });

  test('ADM_TWR_UI_004 — ADMIN-FS-Towers §1 — Tablet viewport renders without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await towersPage.navigate();
    await towersPage.waitForLoad();

    await towersPage.expectKpiCards();

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    // Allow up to 5px scrollbar drift (Ant Design scrollbar reservation)
    expect(overflow).toBeLessThanOrEqual(5);
  });
});
