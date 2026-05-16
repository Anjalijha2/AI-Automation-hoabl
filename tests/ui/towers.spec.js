/**
 * TOWERS TEST SUITE — XR Portal Admin
 * =====================================
 * URL      : https://uat-web.xrportal.in/admin/towers
 * Auth     : Admin session (storageState)
 * Sprint   : 3
 * Total TCs: 12 (TC-TWR-001 to TC-TWR-012)
 *
 * Zones tested:
 *   1. KPI Cards        — Tower & Unit summary counts
 *   2. Tower List       — Sidebar items, active/inactive, unit counts
 *   3. Floor/Unit Grid  — Cell colours, floor order, grid stats
 *   4. Unit Detail Drawer — Right-panel data on cell click
 */

const { test, expect } = require("@playwright/test");
const { TowersPage } = require("../../automation-repository/pages/TowersPage.js");

// ── Test Data ──────────────────────────────────────────────────────────────────
const ACTIVE_TOWER   = "Crest";        // Known active on UAT
const ACTIVE_TOWER_2 = "Crown";        // Second active tower for switch test
const INACTIVE_TOWER = "Triumph";      // Known inactive on UAT
const KNOWN_AVAILABLE_UNIT = "3504";   // Available unit in Crest (floor 35)
const KNOWN_BOOKED_UNIT    = "3502";   // Booked unit in Crest (floor 35)
const TOTAL_TOWERS = 18;

// Pinned KPI baselines — captured from UAT on 2026-04-04.
// If these change it means real data changed (booking / tower activation).
// Update these when UAT data is intentionally changed.
const KPI_BASELINE = {
  towers: { total: 18, active: 5, inactive: 13 },
  units:  { total: 4708 },   // total is stable; sold/available shift with bookings
};

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 1 — KPI Cards
// ─────────────────────────────────────────────────────────────────────────────
test.describe("📊 KPI Cards", () => {
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

  // TC-TWR-001
  test("[TC-TWR-001] Towers + Units KPI cards show valid counts", async ({ page }) => {
    const towers = new TowersPage(page);
    await towers.navigate();

    const tKPIs = await towers.getTowerKPIs();
    console.log("Tower KPIs:", tKPIs);

    // ── Structure checks (always valid) ──
    expect(tKPIs.total).toBeGreaterThan(0);
    expect(tKPIs.active).toBeGreaterThan(0);
    expect(tKPIs.inactive).toBeGreaterThanOrEqual(0);
    // Math integrity: total must equal active + inactive
    expect(tKPIs.total).toBe(tKPIs.active + tKPIs.inactive);

    // ── Pinned baseline (catches silent data regression) ──
    expect(tKPIs.total).toBe(KPI_BASELINE.towers.total);      // 18 towers
    expect(tKPIs.active).toBe(KPI_BASELINE.towers.active);    // 5 active
    expect(tKPIs.inactive).toBe(KPI_BASELINE.towers.inactive); // 13 inactive

    const uKPIs = await towers.getUnitKPIs();
    console.log("Unit KPIs:", uKPIs);

    // ── Structure checks ──
    expect(uKPIs.total).toBeGreaterThan(0);
    expect(uKPIs.available).toBeGreaterThan(0);
    // Total must be ≥ sum of its parts (some units may be in intermediate states)
    expect(uKPIs.total).toBeGreaterThanOrEqual(uKPIs.sold + uKPIs.available + uKPIs.disabled);

    // ── Pinned baseline ──
    expect(uKPIs.total).toBe(KPI_BASELINE.units.total);       // 4708 total units
  });

  // TC-TWR-002
  test("[TC-TWR-002] Unit KPI Available count consistent with Crest grid stats", async ({ page }) => {
    const towers = new TowersPage(page);
    await towers.navigate();

    const uKPIs = await towers.getUnitKPIs();

    await towers.selectTower(ACTIVE_TOWER);
    const gridStats = await towers.getGridStats();
    console.log(`Crest grid stats:`, gridStats);

    // Cross-tower KPI available ≥ single-tower grid available
    expect(uKPIs.available).toBeGreaterThanOrEqual(gridStats.available);
    // Grid Total = sum of all status buckets for that tower
    const gridSum = gridStats.available + gridStats.sold + gridStats.disabled + gridStats.payingNow + gridStats.refuge + gridStats.pbt;
    expect(gridStats.total).toBeGreaterThanOrEqual(gridSum);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 2 — Tower List
// ─────────────────────────────────────────────────────────────────────────────
test.describe("🏢 Tower List", () => {
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

  // TC-TWR-003
  test("[TC-TWR-003] All 18 towers appear in sidebar list", async ({ page }) => {
    const towers = new TowersPage(page);
    await towers.navigate();

    const count = await towers.getTowerCount();
    console.log("Tower count:", count);
    expect(count).toBe(TOTAL_TOWERS);

    // Known actives must not be marked inactive
    expect(await towers.isTowerInactive(ACTIVE_TOWER)).toBe(false);
    expect(await towers.isTowerInactive(ACTIVE_TOWER_2)).toBe(false);

    // Known inactive must show badge
    expect(await towers.isTowerInactive(INACTIVE_TOWER)).toBe(true);
  });

  // TC-TWR-004
  test("[TC-TWR-004] Tower item shows name and available unit count", async ({ page }) => {
    const towers = new TowersPage(page);
    await towers.navigate();

    const availableCount = await towers.getTowerAvailableUnits(ACTIVE_TOWER);
    console.log(`${ACTIVE_TOWER} available units:`, availableCount);
    expect(availableCount).toBeGreaterThan(0);

    // Inactive tower still shows a unit count
    const inactiveCount = await towers.getTowerAvailableUnits(INACTIVE_TOWER);
    console.log(`${INACTIVE_TOWER} available units:`, inactiveCount);
    expect(inactiveCount).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 3 — Floor / Unit Grid
// ─────────────────────────────────────────────────────────────────────────────
test.describe("🗺️ Floor / Unit Grid", () => {
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

  test.beforeEach(async ({ page }) => {
    const towers = new TowersPage(page);
    await towers.navigate();
    await towers.selectTower(ACTIVE_TOWER);
  });

  // TC-TWR-005
  test("[TC-TWR-005] Selecting a tower loads its floor/unit grid", async ({ page }) => {
    const towers = new TowersPage(page);

    // Crest selected in beforeEach — verify selection state
    expect(await towers.isSelectedTower(ACTIVE_TOWER)).toBe(true);

    const stats = await towers.getGridStats();
    console.log("Grid stats for", ACTIVE_TOWER, stats);
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.available).toBeGreaterThan(0);

    // Switch to Crown
    await towers.selectTower(ACTIVE_TOWER_2);
    expect(await towers.isSelectedTower(ACTIVE_TOWER_2)).toBe(true);

    const stats2 = await towers.getGridStats();
    console.log("Grid stats for", ACTIVE_TOWER_2, stats2);
    expect(stats2.total).toBeGreaterThan(0);
  });

  // TC-TWR-006
  test("[TC-TWR-006] Legend indicators include all status types", async ({ page }) => {
    const towers = new TowersPage(page);
    const legend = await towers.getLegendItems();
    console.log("Legend items:", legend);
    // Expect at least the core statuses: active, sold, disabled
    const legendStr = legend.join(" ");
    expect(legendStr).toMatch(/active/i);
    expect(legendStr).toMatch(/sold/i);
    expect(legendStr).toMatch(/disabled/i);
  });

  // TC-TWR-007
  test("[TC-TWR-007] Unit cells are colour-coded by status", async ({ page }) => {
    const towers = new TowersPage(page);

    const available = await towers.countUnitsByStatus("available");
    const booked    = await towers.countUnitsByStatus("booked");
    console.log(`Crest — available: ${available}, booked: ${booked}`);

    expect(available).toBeGreaterThan(0);
    // Crest has known booked units (3502)
    expect(booked).toBeGreaterThan(0);

    // Grid header stat (155) ≥ visible rendered cells (virtual scroll renders a subset)
    const stats = await towers.getGridStats();
    expect(stats.available).toBeGreaterThanOrEqual(available);
  });

  // TC-TWR-008
  test("[TC-TWR-008] Floors displayed in descending order", async ({ page }) => {
    const floors = await page
      .locator(".floor-number")
      .allTextContents()
      .then((arr) => arr.map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n)));
    console.log("Floors (first 5):", floors.slice(0, 5));
    expect(floors.length).toBeGreaterThan(1);
    // Each floor should be ≤ previous (descending)
    for (let i = 1; i < floors.length; i++) {
      expect(floors[i]).toBeLessThanOrEqual(floors[i - 1]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 4 — Unit Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────
test.describe("📋 Unit Detail Drawer", () => {
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

  test.beforeEach(async ({ page }) => {
    const towers = new TowersPage(page);
    await towers.navigate();
    await towers.selectTower(ACTIVE_TOWER);
  });

  // TC-TWR-009
  test("[TC-TWR-009] Clicking an available unit opens detail drawer with correct data", async ({
    page,
  }) => {
    const towers = new TowersPage(page);
    await towers.clickUnit(KNOWN_AVAILABLE_UNIT);

    expect(await towers.isUnitDetailVisible()).toBe(true);

    const details = await towers.getDrawerDetails();
    console.log("Drawer details:", details);

    expect(Object.keys(details).length).toBeGreaterThan(0);
    // Must have Agreement Value
    const agreeKey = Object.keys(details).find((k) => /agreement/i.test(k));
    expect(agreeKey).toBeTruthy();
    expect(details[agreeKey]).toMatch(/₹/);

    const price = await towers.getDrawerInclusivePrice();
    console.log("All-inclusive price:", price);
    expect(price).toMatch(/₹/);
  });

  // TC-TWR-010
  test("[TC-TWR-010] Drawer unit number matches clicked cell", async ({ page }) => {
    const towers = new TowersPage(page);

    await towers.clickUnit(KNOWN_AVAILABLE_UNIT);
    const unitNo = await towers.getDrawerUnitNo();
    console.log("Drawer unit no:", unitNo);
    expect(unitNo).toContain(KNOWN_AVAILABLE_UNIT);

    // Click a second unit — drawer should update
    const secondUnit = page
      .locator(".unit-size-item.available")
      .filter({ hasNotText: KNOWN_AVAILABLE_UNIT })
      .first();
    const hasSecond = await secondUnit.isVisible({ timeout: 3_000 }).catch(() => false);
    if (hasSecond) {
      const secondNum = (await secondUnit.textContent())?.trim() ?? "";
      await secondUnit.click();
      await page.waitForTimeout(1_000);
      const unitNo2 = await towers.getDrawerUnitNo();
      console.log("Second unit no:", unitNo2);
      expect(unitNo2).toContain(secondNum);
    }
  });

  // TC-TWR-011
  test("[TC-TWR-011] Clicking a booked unit opens read-only detail drawer", async ({
    page,
  }) => {
    const towers = new TowersPage(page);

    // Check if KNOWN_BOOKED_UNIT actually has booked class
    const cls = await towers.getUnitCellClass(KNOWN_BOOKED_UNIT);
    console.log(`Unit ${KNOWN_BOOKED_UNIT} classes:`, cls);

    const bookedCell = page
      .locator(".unit-size-item.booked")
      .first();
    const hasBooked = await bookedCell.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!hasBooked) {
      test.skip(true, "No booked units visible in Crest grid — ENV SKIP");
      return;
    }

    await bookedCell.click();
    await page.waitForTimeout(1_000);

    expect(await towers.isUnitDetailVisible()).toBe(true);

    const details = await towers.getDrawerDetails();
    console.log("Booked unit drawer details:", details);
    expect(Object.keys(details).length).toBeGreaterThan(0);

    // No "Book Now" or action button should be present in the drawer
    const hasBookBtn = await page
      .locator(".allocation-details-drawer-content button:has-text('Book'), .allocation-details-drawer-content button:has-text('Reserve')")
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
    expect(hasBookBtn).toBe(false);
  });

  // TC-TWR-012
  test("[TC-TWR-012] Switching tower resets grid and drawer", async ({ page }) => {
    const towers = new TowersPage(page);

    // Open drawer for Crest unit
    await towers.clickUnit(KNOWN_AVAILABLE_UNIT);
    expect(await towers.isUnitDetailVisible()).toBe(true);
    const unitNoBefore = await towers.getDrawerUnitNo();
    expect(unitNoBefore).toContain(KNOWN_AVAILABLE_UNIT);

    // Switch to Crown
    await towers.selectTower(ACTIVE_TOWER_2);

    // Grid should now show Crown data
    const stats = await towers.getGridStats();
    console.log("Crown grid stats:", stats);
    expect(stats.total).toBeGreaterThan(0);

    // Drawer should no longer show Crest unit
    const drawerStillShowsCrest = await towers.isUnitDetailVisible().catch(() => false);
    if (drawerStillShowsCrest) {
      const unitNoAfter = await towers.getDrawerUnitNo().catch(() => "");
      // If drawer is still visible, it must NOT be showing the Crest unit
      expect(unitNoAfter).not.toContain(KNOWN_AVAILABLE_UNIT);
    }
    // Either drawer is hidden OR showing Crown unit — both valid
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 5 — Download Excel
// ─────────────────────────────────────────────────────────────────────────────
test.describe("📥 Download Excel", () => {
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

  // TC-TWR-013
  test("[TC-TWR-013] Download tower unit data as Excel file", async ({ page }) => {
    const towers = new TowersPage(page);
    await towers.navigate();
    await towers.selectTower(ACTIVE_TOWER);

    const filename = await towers.downloadTowerExcel();
    console.log("Downloaded file:", filename);

    // Must be an Excel file
    expect(filename).toMatch(/\.(xlsx|xls|csv)$/i);
  });
});
