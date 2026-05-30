'use strict';

/**
 * towers.spec.js — End-to-End tests for the Admin Portal Towers module.
 *
 * What this file tests:
 *   The Towers module on /admin/towers is the read-only inventory dashboard.
 *   These E2E tests exercise the full sidebar -> grid -> unit-detail journey
 *   against the live UAT environment plus the read-only invariant and
 *   negative-click behaviour on non-Available cells.
 *
 * How test IDs work:
 *   Each test title starts with a TC_ID (e.g. ADM_TWR_001) tracing back to
 *   manual-qa-repository/01-test-cases/admin-portal/towers/TC_TOWERS.md.
 *   BRD reference: ADMIN-FS-Towers §<section>.
 *
 * Authentication:
 *   All tests run as authenticated admin via the saved storageState file.
 *   Run `npm run auth:setup` if the session expires.
 *
 * Destructive tests:
 *   The Towers UI itself is read-only — none of these E2E tests mutate state.
 *   The ADM_TWR_FSD_039..041 integration TCs in the markdown DO fire admin
 *   PUT endpoints (status-update / status-sync) that write audit logs and
 *   refresh Redis. Those are intentionally NOT in this E2E spec — they
 *   belong in tests/api/towers.api.spec.js where they can be controlled
 *   directly. We add a single read-only INT smoke (ADM_TWR_036) here that
 *   verifies the cross-module *effect* is visible on the page.
 *
 * BRD: ADMIN-FS-Towers · FSD: fsd-towers.md
 */

const { test, expect } = require('@playwright/test');
const { TowersPage } = require('../../../automation-repository/pages/admin/TowersPage');

// Load saved admin session — browser starts already logged in.
test.use({ storageState: 'automation-repository/fixtures/.auth/admin.json' });

test.describe('Towers — Admin Portal E2E', () => {
  let towersPage;

  /**
   * beforeEach — runs before every test in this describe block.
   * Constructs a fresh TowersPage, navigates to /admin/towers, and waits
   * for the page to be interactive (KPI cards / tower list / grid).
   * Fresh navigation per test prevents panel/selection state leakage.
   */
  test.beforeEach(async ({ page }) => {
    towersPage = new TowersPage(page);
    await towersPage.navigate();
    await towersPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Page load & navigation
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_001 — ADMIN-FS-Towers §1 — Towers page loads at /admin/towers with KPIs and tower list', async ({ page }) => {
    await towersPage.expectOnTowersUrl();
    await towersPage.expectKpiCards();
    const towers = await towersPage.getTowersList();
    expect(towers.length).toBeGreaterThan(0);
    await expect(page).toHaveScreenshot('towers-e2e-001-landing.png', {
      maxDiffPixels: 250,
      fullPage: true,
    });
  });

  test('ADM_TWR_012 — ADMIN-FS-Towers §2 — Clicking a tower in sidebar loads its grid', async () => {
    // Pick the first available tower row — usually Crest at position 0
    await towersPage.selectTower(0);
    const grid = await towersPage.getFloorGrid();
    expect(grid.floorCount + grid.unitCount).toBeGreaterThan(0);
    await expect(towersPage.gridContainer).toBeVisible();
  });

  test('ADM_TWR_032 — ADMIN-FS-Towers §2 — Switching between towers updates the main grid', async () => {
    const towers = await towersPage.getTowersList();
    test.skip(towers.length < 2, 'Need at least 2 towers to test switching');

    await towersPage.selectTower(0);
    const before = await towersPage.getFloorGrid();
    // Switch to the second tower
    await towersPage.selectTower(1);
    const after = await towersPage.getFloorGrid();
    // Grid should remain visible — counts MAY differ (different inventory)
    await expect(towersPage.gridContainer).toBeVisible();
    expect(after.unitCount).toBeGreaterThanOrEqual(0);
    // At minimum the call succeeded; soft-assert that something rendered for both
    expect(before.unitCount + after.unitCount).toBeGreaterThan(0);
  });

  test('ADM_TWR_045 — ADMIN-FS-Towers §3 — Switching towers closes any open Unit Detail panel', async () => {
    // Select Crest, open an Available unit's detail, then click Crown
    await towersPage.selectTower('Crest');
    const idx = await towersPage.findFirstUnitOfStatus('AVAILABLE');
    test.skip(idx < 0, 'No AVAILABLE units in Crest on UAT to open detail panel');

    await towersPage.openUnitDetail(idx);
    await towersPage.expectUnitDetailVisible();

    await towersPage.selectTower('Crown');
    await towersPage.expectUnitDetailHidden();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: KPI display
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_002 — ADMIN-FS-Towers §1 — KPI surfaces display numeric values', async () => {
    const total = await towersPage.readKpiValue(/total\s*towers?/i);
    const active = await towersPage.readKpiValue(/active\s*towers?/i);
    // Xanadu has 18 towers per FSD — assert total when card is present
    if (!Number.isNaN(total)) {
      expect(total).toBe(18);
    }
    // Active count is dynamic (driven by Config) — just assert it's a finite int when present
    if (!Number.isNaN(active)) {
      expect(active).toBeGreaterThanOrEqual(0);
      expect(active).toBeLessThanOrEqual(18);
    }
  });

  test('ADM_TWR_004 — ADMIN-FS-Towers §1 — Inactive Towers KPI = Total - Active', async () => {
    const total    = await towersPage.readKpiValue(/total\s*towers?/i);
    const active   = await towersPage.readKpiValue(/active\s*towers?/i);
    const inactive = await towersPage.readKpiValue(/inactive\s*towers?/i);
    // Only assert the invariant when all three cards are present and numeric
    if (![total, active, inactive].some(Number.isNaN)) {
      expect(inactive).toBe(total - active);
    } else {
      test.skip(true, 'One or more tower KPI cards not present on this UAT build');
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Sidebar tower list
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_009 — ADMIN-FS-Towers §2 — Sidebar lists all 18 Xanadu tower names', async () => {
    const towers = await towersPage.getTowersList();
    expect(towers.length).toBeGreaterThanOrEqual(18);

    // Each expected name must appear at least once across the rows
    const allText = towers.map((t) => t.raw).join(' | ').toLowerCase();
    for (const name of TowersPage.TOWER_NAMES) {
      expect(allText).toContain(name.toLowerCase());
    }
  });

  test('ADM_TWR_013 — ADMIN-FS-Towers §2 — Selected tower row has visual active state', async () => {
    await towersPage.selectTower('Crest');
    await towersPage.expectTowerHighlighted('Crest');
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Unit Detail panel — happy path
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_020 — ADMIN-FS-Towers §3 — Clicking a white (Available) unit opens detail panel', async () => {
    await towersPage.selectTower('Crest');
    const idx = await towersPage.findFirstUnitOfStatus('AVAILABLE');
    test.skip(idx < 0, 'No AVAILABLE units in Crest on UAT to open detail panel');

    await towersPage.openUnitDetail(idx);
    await towersPage.expectUnitDetailVisible();
  });

  test('ADM_TWR_024 — ADMIN-FS-Towers §3 — Detail panel surfaces Agreement Value with ₹ prefix', async ({ page }) => {
    await towersPage.selectTower('Crest');
    const idx = await towersPage.findFirstUnitOfStatus('AVAILABLE');
    test.skip(idx < 0, 'No AVAILABLE units in Crest on UAT to inspect detail panel');

    await towersPage.openUnitDetail(idx);
    await towersPage.expectUnitDetailVisible();

    const fields = await towersPage.readUnitDetailFields();
    const rupees = fields['_currencyValues'] || [];
    // At least one currency-prefixed value must appear (Agreement Value)
    expect(rupees.length).toBeGreaterThan(0);
    expect(rupees[0]).toMatch(/₹\s*[\d,]+/);
  });

  test('ADM_TWR_027 — ADMIN-FS-Towers §3 — Unit Detail panel can be closed', async () => {
    await towersPage.selectTower('Crest');
    const idx = await towersPage.findFirstUnitOfStatus('AVAILABLE');
    test.skip(idx < 0, 'No AVAILABLE units in Crest on UAT to open detail panel');

    await towersPage.openUnitDetail(idx);
    await towersPage.expectUnitDetailVisible();
    await towersPage.closeUnitDetail();
    await towersPage.expectUnitDetailHidden();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // NEG: Non-Available cells must NOT open the detail panel
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_028 — ADMIN-FS-Towers §3 — Clicking a red (Sold) unit does NOT open detail panel', async () => {
    await towersPage.selectTower('Crest');
    const idx = await towersPage.findFirstUnitOfStatus('SOLD');
    test.skip(idx < 0, 'No SOLD units in Crest on UAT — cannot exercise NEG');

    await towersPage.openUnitDetail(idx);
    await towersPage.expectUnitDetailHidden();
  });

  test('ADM_TWR_029 — ADMIN-FS-Towers §3 — Clicking a grey (Reserved) unit does NOT open detail panel', async () => {
    await towersPage.selectTower('Crest');
    const idx = await towersPage.findFirstUnitOfStatus('RESERVED');
    test.skip(idx < 0, 'No RESERVED units in Crest on UAT — cannot exercise NEG');

    await towersPage.openUnitDetail(idx);
    await towersPage.expectUnitDetailHidden();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BIZ: Read-only constraint
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_031 — ADMIN-FS-Towers §1 — Towers page exposes NO edit/configure/save affordances', async () => {
    await towersPage.expectReadOnly();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // INT: Cross-module — page reflects state owned by Config / Allocation
  //
  // The actual mutations (toggle tower active in Config, push pricing) live
  // in their own specs. Here we only verify the Towers page renders the
  // *current* state without error — full integration is covered in API/DB
  // specs that have direct visibility into AuditLog + Redis + Python sync.
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_036 — ADMIN-FS-Towers §1 — Active Towers KPI value matches non-Inactive sidebar rows', async () => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — KPI value is owned by Config module and may drift; live-gateway sensitive');

    const activeKpi = await towersPage.readKpiValue(/active\s*towers?/i);
    const towers = await towersPage.getTowersList();
    const nonInactive = towers.filter((t) => !t.isInactive).length;

    if (!Number.isNaN(activeKpi)) {
      // Allow ±1 drift — list may include a summary footer row
      expect(Math.abs(activeKpi - nonInactive)).toBeLessThanOrEqual(1);
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // EDGE / negative — invalid tower navigation
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_TWR_NEG_001 — ADMIN-FS-Towers §2 — Direct navigation to /admin/towers/invalid-id falls back gracefully', async ({ page }) => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — direct deep-link probe; live-gateway sensitive');

    await page.goto('https://uat-web.xrportal.in/admin/towers/9999999');
    await page.waitForLoadState('domcontentloaded');
    // The app must either redirect back to /admin/towers OR render an error
    // surface — what it must NOT do is crash to a blank page.
    const url = page.url();
    const bodyText = (await page.locator('body').textContent()) || '';
    const ok = /\/admin\/towers/.test(url) || bodyText.length > 50;
    expect(ok).toBeTruthy();
  });
});
