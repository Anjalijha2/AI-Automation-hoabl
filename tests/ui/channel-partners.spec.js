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
const { ChannelPartnersPage } = require("../../automation-repository/pages/ChannelPartnersPage.js");
const { CPPortalPage } = require("../../automation-repository/pages/CPPortalPage.js");

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

const TOTAL_CP_COUNT  = 2707;                // Pinned baseline — update if UAT data changes

const EXPECTED_COLUMNS = [
  "Owner Name", "Firm Name", "HV Code", "Master HV Code",
  "Business Region", "Pincode", "Phone", "CP Type",
  "SM Name", "SM Email ID", "SM Mobile Number", "KYC Status", "Actions",
];

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 1 — Page Load & Structure
// ─────────────────────────────────────────────────────────────────────────────
test.describe("📋 Page Load & Structure", () => {
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

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
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

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
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

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
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

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
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

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
// DESCRIBE 6 — Master HV Code Filter + CP Portal End-to-End
// ─────────────────────────────────────────────────────────────────────────────
test.describe("🔗 Master HV Filter + CP Portal", () => {
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

  // TC-CP-012
  test("[TC-CP-012] Filter by Master HV Code, verify CPs, login to CP portal and check All Team Leads", async ({ page, context }) => {
    test.setTimeout(120_000);

    // ── STEP 1: Admin — filter by Master HV Code HV00025808 ──────────────────
    const cp = new ChannelPartnersPage(page);
    await cp.navigate();

    await cp.filterByMasterHVCode("HV00025808");
    console.log("✅ Master HV Code filter applied: HV00025808");

    // ── STEP 2: Verify both Member CP and Master CP appear in results ─────────
    const rows = await page.locator('tbody tr').all();
    const cpData = [];
    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      if (cells.length > 1) {
        cpData.push({ phone: cells[7]?.trim(), cpType: cells[8]?.trim(), masterHV: cells[4]?.trim() });
      }
    }
    console.log("Filtered CP rows:", cpData);

    // Both phones must appear
    const phones = cpData.map(r => r.phone);
    expect(phones).toContain(CP1_PHONE);  // 8888888888 — Master CP
    expect(phones).toContain(CP2_PHONE);  // 7888888888 — Member CP

    // All rows must have Master HV Code = HV00025808
    for (const row of cpData.filter(r => r.masterHV)) {
      expect(row.masterHV).toBe("HV00025808");
    }

    // CP Types must be correct
    const masterRow = cpData.find(r => r.phone === CP1_PHONE);
    const memberRow = cpData.find(r => r.phone === CP2_PHONE);
    expect(masterRow.cpType).toMatch(/Master CP/i);
    expect(memberRow.cpType).toMatch(/Member CP/i);
    console.log(`✅ Master CP: ${CP1_PHONE} | Member CP: ${CP2_PHONE} — both under HV00025808`);

    // ── STEP 3: Open CP Portal in a new tab and login as Master CP ────────────
    const cpPortalTab = await context.newPage();
    const portal = new CPPortalPage(cpPortalTab);
    await portal.navigateToLogin();
    await portal.login("8888888888", "147258");
    console.log("✅ CP Portal login successful (8888888888)");

    // ── STEP 4: Verify dashboard loaded with correct HV Code ──────────────────
    const hvCode = await cpPortalTab.locator('text=HV00025808').first().isVisible({ timeout: 8_000 }).catch(() => false);
    expect(hvCode).toBe(true);
    console.log("✅ Dashboard shows HV Code: HV00025808");

    // ── STEP 5: Check All Team Leads dropdown — open and get all options ──────
    const teamLeadsDropdown = cpPortalTab.locator('text=All Team Leads').first();
    await teamLeadsDropdown.waitFor({ state: 'visible', timeout: 8_000 });
    await teamLeadsDropdown.click();
    await cpPortalTab.waitForTimeout(700);

    const options = await cpPortalTab
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content, [class*="dropdown"]:visible li')
      .allTextContents();
    const optionTexts = options.map(o => o.trim()).filter(Boolean);
    console.log("All Team Leads dropdown options:", optionTexts);

    // Must have at least: "All Team Leads", "My Leads", and the Member CP entry
    expect(optionTexts.some(o => /All Team Leads/i.test(o))).toBe(true);
    expect(optionTexts.some(o => /My Leads/i.test(o))).toBe(true);
    expect(optionTexts.some(o => /HV00026050|7888888888/i.test(o))).toBe(true);
    console.log("✅ All dropdown options verified");

    // ── STEP 6: Select "My Leads" and record row count ────────────────────────
    const myLeadsOption = cpPortalTab
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content')
      .filter({ hasText: /^My Leads$/i }).first();
    await myLeadsOption.click();
    await cpPortalTab.waitForTimeout(1000);
    const myLeadsRows = await cpPortalTab.locator('table tbody tr').count();
    console.log(`My Leads rows: ${myLeadsRows}`);

    // ── STEP 7: Select Member CP option "Test CP (HV00026050) - 7888888888" ──
    await cpPortalTab.locator('.ant-select-selector').first().click();
    await cpPortalTab.waitForTimeout(500);
    const memberCPOption = cpPortalTab
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content')
      .filter({ hasText: /HV00026050|7888888888/i }).first();
    await memberCPOption.click();
    await cpPortalTab.waitForTimeout(1000);
    const memberCPRows = await cpPortalTab.locator('table tbody tr').count();
    console.log(`Member CP (7888888888) rows: ${memberCPRows}`);
    expect(memberCPRows).toBeGreaterThan(0);
    console.log("✅ Member CP option shows its own leads");

    // ── STEP 8: Switch back to "All Team Leads" and verify all rows show ──────
    await cpPortalTab.locator('.ant-select-selector').first().click();
    await cpPortalTab.waitForTimeout(500);
    const allLeadsOption = cpPortalTab
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content')
      .filter({ hasText: /^All Team Leads$/i }).first();
    await allLeadsOption.click();
    await cpPortalTab.waitForTimeout(1000);
    const allLeadsRows = await cpPortalTab.locator('table tbody tr').count();
    console.log(`All Team Leads rows: ${allLeadsRows}`);

    expect(allLeadsRows).toBeGreaterThanOrEqual(myLeadsRows);
    expect(allLeadsRows).toBeGreaterThanOrEqual(memberCPRows);
    console.log("✅ All Team Leads shows ≥ rows than My Leads and Member CP filter");

    await cpPortalTab.close();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 7 — Refresh
test.describe("🔄 Refresh", () => {
  test.use({ storageState: "automation-repository/fixtures/.auth/admin.json" });

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
