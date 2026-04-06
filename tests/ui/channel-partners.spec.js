/**
 * CHANNEL PARTNERS TEST SUITE — XR Portal Admin
 * ===============================================
 * URL      : https://uat-web.xrportal.in/admin/channel-partners
 * Auth     : Admin session (storageState)
 * Sprint   : 3
 * Total TCs: 10 (TC-CP-001 to TC-CP-011, TC-CP-007 removed)
 *
 * Zones tested:
 *   1. Page Load       — total count, column headers
 *   2. Search          — filter by phone (Enter to trigger), clear search
 *   3. View Drawer     — eye icon → CP detail drawer (Master CP + Member CP)
 *   4. Map Master CP   — row selection → modal
 *   5. Column Filters  — filter icons verified, CP Type filter functional
 *   6. Refresh         — count unchanged
 */

const { test, expect } = require("@playwright/test");
const { ChannelPartnersPage } = require("../../src/pages/ChannelPartnersPage.js");

// ── Test Data ──────────────────────────────────────────────────────────────────
// CP 1 — Master CP (phone: 8888888888)
const CP1_PHONE  = "8888888888";
const CP1_OWNER  = "Test CP";
const CP1_HV     = "HV00025808";
const CP1_TYPE   = "Master CP";

// CP 2 — Member CP (phone: 7888888888)
const CP2_PHONE  = "7888888888";
const CP2_OWNER  = "Test CP";
const CP2_HV     = "HV00026050";
const CP2_TYPE   = "Member CP";

const TOTAL_CP_COUNT  = 2706;                // Pinned baseline — update if UAT data changes

const EXPECTED_COLUMNS = [
  "Owner Name", "Firm Name", "HV Code", "Master HV Code",
  "Business Region", "Pincode", "Phone", "CP Type",
  "SM Name", "SM Email ID", "SM Mobile Number", "KYC Status", "Actions",
];

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 1 — Page Load & Structure
// ─────────────────────────────────────────────────────────────────────────────
test.describe("📋 Page Load & Structure", () => {
  test.use({ storageState: "src/fixtures/.auth/admin.json" });

  // TC-CP-001
  test("[TC-CP-001] Page loads with correct total CP count", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();

    const total = await cp.getTotalCount();
    console.log("Total CP count:", total);
    expect(total).toBe(TOTAL_CP_COUNT);
  });

  // TC-CP-002
  test("[TC-CP-002] Table displays all required columns", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();

    const headers = await cp.getColumnHeaders();
    console.log("Headers:", headers);

    for (const col of EXPECTED_COLUMNS) {
      expect(headers).toContain(col);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 2 — Search
// ─────────────────────────────────────────────────────────────────────────────
test.describe("🔍 Search", () => {
  test.use({ storageState: "src/fixtures/.auth/admin.json" });

  // TC-CP-003 — Master CP
  test("[TC-CP-003] Search by phone (8888888888) returns Master CP row", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();

    await cp.searchByPhone(CP1_PHONE);
    const row = await cp.getRowByPhone(CP1_PHONE);
    console.log("Filtered row (CP1):", row);

    expect(row.phone).toContain(CP1_PHONE);
    expect(row.ownerName).toBe(CP1_OWNER);
    expect(row.hvCode).toBe(CP1_HV);
    expect(row.cpType).toMatch(/Master CP/i);
  });

  // TC-CP-003b — Member CP
  test("[TC-CP-003b] Search by phone (7888888888) returns Member CP row", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();

    await cp.searchByPhone(CP2_PHONE);
    const row = await cp.getRowByPhone(CP2_PHONE);
    console.log("Filtered row (CP2):", row);

    expect(row.phone).toContain(CP2_PHONE);
    expect(row.ownerName).toBe(CP2_OWNER);
    expect(row.hvCode).toBe(CP2_HV);
    expect(row.cpType).toMatch(/Member CP/i);
  });

  // TC-CP-004
  test("[TC-CP-004] Reset Filters clears search and restores full list", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();

    await cp.searchByPhone(CP1_PHONE);
    const inputValueAfterSearch = await cp.getPhoneInputValue();
    console.log("Input after search:", inputValueAfterSearch);
    expect(inputValueAfterSearch).toContain(CP1_PHONE);

    await cp.clickResetFilters();
    const inputValueAfterReset = await cp.getPhoneInputValue();
    const restoredTotal = await cp.getTotalCount();
    console.log("Input after reset:", inputValueAfterReset);
    console.log("Restored total:", restoredTotal);

    expect(inputValueAfterReset).toBe('');
    expect(restoredTotal).toBe(TOTAL_CP_COUNT);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 3 — View (Eye) Drawer
// ─────────────────────────────────────────────────────────────────────────────
test.describe("👁️ View Drawer", () => {
  test.use({ storageState: "src/fixtures/.auth/admin.json" });

  // TC-CP-005 — Master CP drawer
  test("[TC-CP-005] Eye icon opens Master CP (8888888888) drawer with correct fields", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();
    await cp.searchByPhone(CP1_PHONE);
    await cp.clickViewForRow(CP1_PHONE);

    const title = await cp.getDrawerTitle();
    console.log("Drawer title:", title);
    expect(title).toMatch(/channel partner details/i);

    const details = await cp.getDrawerDetails();
    console.log("Drawer content (first 300):", details.slice(0, 300));

    expect(details).toMatch(/HV Code/i);
    expect(details).toMatch(/KYC Status/i);
    expect(details).toMatch(/Owner Name/i);
    expect(details).toMatch(/Phone/i);
    expect(details).toContain(CP1_HV);
    expect(details).toContain(CP1_OWNER);
    expect(details).toMatch(/Master CP/i);

    await cp.closeDrawer();
  });

  // TC-CP-005b — Member CP drawer
  test("[TC-CP-005b] Eye icon opens Member CP (7888888888) drawer with correct fields", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();
    await cp.searchByPhone(CP2_PHONE);
    await cp.clickViewForRow(CP2_PHONE);

    const title = await cp.getDrawerTitle();
    expect(title).toMatch(/channel partner details/i);

    const details = await cp.getDrawerDetails();
    console.log("Drawer content CP2 (first 300):", details.slice(0, 300));

    expect(details).toContain(CP2_HV);
    expect(details).toContain(CP2_OWNER);
    expect(details).toMatch(/Member CP/i);
    // Member CP must show its Master HV Code
    expect(details).toMatch(/Master HV Code/i);

    await cp.closeDrawer();
  });

  // TC-CP-006 — Drawer sections
  test("[TC-CP-006] CP detail drawer shows all 4 sections and valid KYC status", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();
    await cp.searchByPhone(CP1_PHONE);
    await cp.clickViewForRow(CP1_PHONE);

    const details = await cp.getDrawerDetails();
    expect(details).toMatch(/Basic Information/i);
    expect(details).toMatch(/Firm Details/i);
    expect(details).toMatch(/Contact Details/i);
    expect(details).toMatch(/Additional Details/i);
    expect(details).toMatch(/Pending|Approved|Rejected|Verified/i);

    await cp.closeDrawer();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 4 — Map Master CP
// ─────────────────────────────────────────────────────────────────────────────
test.describe("🔗 Map Master CP", () => {
  test.use({ storageState: "src/fixtures/.auth/admin.json" });

  // TC-CP-008
  test("[TC-CP-008] Map Master CP button disabled by default, enabled after row selection", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();

    expect(await cp.isMapMasterCPEnabled()).toBe(false);

    await cp.selectFirstRow();
    expect(await cp.isMapMasterCPEnabled()).toBe(true);
  });

  // TC-CP-009
  test("[TC-CP-009] Map Master CP modal opens with correct title and Master HV Code selector", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();

    await cp.selectFirstRow();
    await cp.clickMapMasterCP();

    const title = await cp.getMapModalTitle();
    console.log("Modal title:", title);
    expect(title).toMatch(/Map CPs to Master/i);

    const body = await cp.getMapModalBody();
    console.log("Modal body:", body.slice(0, 200));
    expect(body).toMatch(/Master HV Code/i);
    expect(body).toMatch(/mapping.*CP.*Master/i);

    await cp.closeModal();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 5 — Column Filters
// ─────────────────────────────────────────────────────────────────────────────
test.describe("🔽 Column Filters", () => {
  test.use({ storageState: "src/fixtures/.auth/admin.json" });

  // TC-CP-011
  test("[TC-CP-011] All filterable columns have icons and CP Type filter returns correct results", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();

    // ── 1. Verify all 7 filterable columns have filter/search icons ──
    const filterCols = await cp.getFilterableColumns();
    console.log("Filterable columns:", filterCols);

    const searchCols = filterCols.filter(c => c.type === 'search').map(c => c.col);
    const filterDropCols = filterCols.filter(c => c.type === 'filter').map(c => c.col);

    for (const col of ["Owner Name", "Firm Name", "HV Code", "Pincode"]) {
      expect(searchCols.some(c => c.includes(col))).toBe(true);
    }
    for (const col of ["Master HV Code", "Business Region", "CP Type"]) {
      expect(filterDropCols.some(c => c.includes(col))).toBe(true);
    }

    // ── 2. Apply CP Type = "Master CP" filter and verify results ──
    await cp.filterByCPType("Master CP");
    const rows = await page.locator('tbody tr').all();
    const cpTypes = [];
    for (const row of rows.slice(0, 5)) {
      const cells = await row.locator('td').allTextContents();
      if (cells[8]) cpTypes.push(cells[8].trim());
    }
    console.log("CP Types after filter:", cpTypes);
    for (const t of cpTypes.filter(Boolean)) {
      expect(t).toMatch(/Master CP/i);
    }

    // ── 3. Reset the column filter and verify full list restored ──
    await cp.resetColumnFilter("CP Type");
    const totalAfterReset = await cp.getTotalCount();
    console.log("Total after reset:", totalAfterReset);
    expect(totalAfterReset).toBe(TOTAL_CP_COUNT);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 6 — Refresh
// ─────────────────────────────────────────────────────────────────────────────
test.describe("🔄 Refresh", () => {
  test.use({ storageState: "src/fixtures/.auth/admin.json" });

  // TC-CP-010
  test("[TC-CP-010] Refresh button reloads data without changing total count", async ({ page }) => {
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();

    const beforeCount = await cp.getTotalCount();
    await cp.clickRefresh();
    const afterCount = await cp.getTotalCount();

    console.log("Count before/after refresh:", beforeCount, afterCount);
    expect(afterCount).toBe(beforeCount);
  });
});
