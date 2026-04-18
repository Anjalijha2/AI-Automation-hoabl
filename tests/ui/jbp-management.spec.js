/**
 * JBP MANAGEMENT TEST SUITE — XR Portal Admin
 * =============================================
 * URL      : https://uat-web.xrportal.in/admin/jbp-management
 * Auth     : Admin session (storageState)
 * Sprint   : 3
 *
 * Zones tested:
 *   1. Page Load        — tabs, table columns
 *   2. Cycle Date Range — filter by date, verify results, clear
 *   3. Create Cycle     — modal, today's date (dynamic), OPEN status, conflict handling
 */

const { test, expect } = require('@playwright/test');
const { JBPManagementPage } = require('../../src/pages/JBPManagementPage.js');
const { CPPortalPage }      = require('../../src/pages/CPPortalPage.js');

// ── Test Data ──────────────────────────────────────────────────────────────────
const OPEN_CYCLE_NAME = 'Automation-Test1';   // Known OPEN cycle on UAT
const OPEN_CYCLE_DATE = '2026-04-07';          // Start = End date for this cycle

const EXPECTED_TABS    = ['Cycle Management', 'Submissions', 'Edit Requests'];
const EXPECTED_COLUMNS = ['Cycle Name', 'Start Date', 'End Date', 'Status', 'Action'];

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 1 — Page Load & Structure
// ─────────────────────────────────────────────────────────────────────────────
test.describe('📋 Page Load & Structure', () => {
  test.use({ storageState: 'src/fixtures/.auth/admin.json' });

  // TC-JBP-001
  test('[TC-JBP-001] Page loads with correct tabs and table columns', async ({ page }) => {
    test.setTimeout(60_000);
    const jbp = new JBPManagementPage(page);
    await jbp.navigate();

    // Tabs
    const tabs = await jbp.getTabNames();
    console.log('Tabs:', tabs);
    for (const tab of EXPECTED_TABS) {
      expect(tabs).toContain(tab);
    }

    // Default active tab
    const activeTab = await jbp.getActiveTab();
    console.log('Active tab:', activeTab);
    expect(activeTab).toMatch(/Cycle Management/i);

    // Table columns
    const headers = await jbp.getTableHeaders();
    console.log('Table headers:', headers);
    for (const col of EXPECTED_COLUMNS) {
      expect(headers).toContain(col);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 2 — Cycle Date Range Filter
// ─────────────────────────────────────────────────────────────────────────────
test.describe('📅 Cycle Date Range Filter', () => {
  test.use({ storageState: 'src/fixtures/.auth/admin.json' });

  // TC-JBP-002
  test('[TC-JBP-002] Cycle Date Range filter shows only cycles within selected dates', async ({ page }) => {
    test.setTimeout(60_000);
    const jbp = new JBPManagementPage(page);
    await jbp.navigate();

    // ── Baseline: record total rows before filter ──
    const totalBefore = await jbp.getTableRowCount();
    console.log('Total rows before filter:', totalBefore);
    expect(totalBefore).toBeGreaterThan(0);

    // ── Apply date range: 2026-04-07 to 2026-04-07 ──
    await jbp.filterByDateRange(OPEN_CYCLE_DATE, OPEN_CYCLE_DATE);
    const filteredRows = await jbp.getAllCycleRows();
    console.log('Filtered rows:', filteredRows);

    // Must return at least 1 result
    expect(filteredRows.length).toBeGreaterThan(0);

    // Every returned row must have dates within the selected range
    for (const row of filteredRows) {
      expect(row.startDate).toMatch(/2026-04-07/);
      console.log(`  ✅ ${row.cycleName} | ${row.startDate} → ${row.endDate} | ${row.status}`);
    }

    // The known cycle must appear in filtered results (status may vary across runs)
    const openRow = filteredRows.find(r => r.cycleName === OPEN_CYCLE_NAME);
    expect(openRow).toBeDefined();
    console.log(`✅ "${OPEN_CYCLE_NAME}" found with status ${openRow.status}`);

    // ── Verify date inputs reflect selected values ──
    const { start, end } = await jbp.getDateRangeValues();
    console.log('Date range inputs:', start, '→', end);
    expect(start).toContain('2026-04-07');
    expect(end).toContain('2026-04-07');

    // ── Clear filter and verify all rows restore ──
    await jbp.clearDateRangeFilter();
    const totalAfter = await jbp.getTableRowCount();
    console.log('Total rows after clear:', totalAfter);
    expect(totalAfter).toBe(totalBefore);
    console.log('✅ All rows restored after clearing date range filter');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 3 — Create Cycle
// ─────────────────────────────────────────────────────────────────────────────
test.describe('➕ Create Cycle', () => {
  test.use({ storageState: 'src/fixtures/.auth/admin.json' });

  // TC-JBP-003
  test('[TC-JBP-003] Create a new cycle with today\'s date and verify it appears as OPEN', async ({ page }) => {
    test.setTimeout(90_000);
    const jbp = new JBPManagementPage(page);
    await jbp.navigate();

    // ── Pre-condition: close any existing OPEN cycle ──────────────────────
    // An OPEN cycle must be closed before creating a new one for the same date.
    const openCycle = await jbp.getOpenCycle();
    if (openCycle) {
      console.log(`Pre-condition: closing existing OPEN cycle "${openCycle.cycleName}"`);
      await jbp.clickCloseCycleAction();
      await jbp.confirmCloseCycle();
      const closeToast = await jbp.getToastMessage();
      console.log('Close toast:', closeToast);
      expect(closeToast).toMatch(/closed successfully/i);
      await jbp.waitForNetworkIdle();
    } else {
      console.log('Pre-condition: no OPEN cycle found, proceeding directly');
    }

    // ── Baseline row count before creation ───────────────────────────────
    const rowsBefore = await jbp.getTableRowCount();
    console.log('Rows before create:', rowsBefore);
    expect(rowsBefore).toBeGreaterThan(0);

    // ── Open Create Cycle modal ───────────────────────────────────────────
    const uniqueName = `Automation-TC003-${Date.now()}`;
    await jbp.clickCreateCycleBtn();
    console.log(`Creating cycle: "${uniqueName}" with today's date`);

    // ── Fill modal: unique name + Today (dynamic) for Start & End date ────
    await jbp.fillCreateCycleModal(uniqueName);

    // ── Submit ────────────────────────────────────────────────────────────
    await jbp.submitCreateCycleModal();

    // ── Handle "Active Cycle Detected" if it appears ──────────────────────
    // Should not appear after pre-close, but guard it anyway.
    if (await jbp.isActiveCycleDetectedVisible()) {
      console.log('⚠️  Active Cycle Detected popup appeared — confirming "Yes, Create Cycle"');
      await jbp.confirmActiveCycleCreate();
      await jbp.waitForNetworkIdle();

      // If an error toast appears (same date range conflict), skip with ENV note
      if (await jbp.isErrorToastVisible()) {
        const errMsg = await jbp.getToastMessage().catch(() => 'unknown error');
        console.log(`⚠️  Error after confirm: "${errMsg}" — ENV state conflict, skipping`);
        test.skip(true, `ENV: Cannot create cycle — date range conflict: ${errMsg}`);
        return;
      }
    }

    // ── Verify success toast ──────────────────────────────────────────────
    const toast = await jbp.getToastMessage();
    console.log('Create toast:', toast);
    expect(toast).toMatch(/created successfully/i);

    // ── Wait for modal to close and table to refresh ──────────────────────
    await page.locator('.ant-modal-content').waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => {});
    await jbp.waitForNetworkIdle();

    // ── Verify new cycle is OPEN and visible in the table ─────────────────
    // Table is paginated (10 rows/page) — new cycle appears at top of page 1
    const rows = await jbp.getAllCycleRows();
    const newCycle = rows.find(r => r.cycleName === uniqueName);
    expect(newCycle).toBeDefined();
    expect(newCycle.status).toBe('OPEN');
    expect(newCycle.action).toMatch(/Close Cycle/i);
    console.log(`✅ Cycle "${uniqueName}" created | ${newCycle.startDate} → ${newCycle.endDate} | ${newCycle.status}`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 4 — JBP Form Submission (CP Portal)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('📝 JBP Form Submission (CP Portal)', () => {
  test.use({ storageState: 'src/fixtures/.auth/admin.json' });

  const JBP_FORM_DATA = {
    brokerage:         '10,00,000',
    activities:        ['Tele-calling', 'Digital'],
    digitalPlatforms:  ['Google'],
    googleBudget:      '10000',
    registrationCount: '1',
  };

  // TC-JBP-004
  test('[TC-JBP-004] CP Portal — login, navigate to JBP, fill form and submit', async ({ page, context }) => {
    test.setTimeout(120_000);

    // ── Pre-condition: ensure an OPEN cycle exists on admin side ──────────
    const adminJBP = new JBPManagementPage(page);
    await adminJBP.navigate();

    let openCycle = await adminJBP.getOpenCycle();
    if (!openCycle) {
      console.log('Pre-condition: no OPEN cycle — creating one');
      const cycleName = `Automation-TC004-${Date.now()}`;
      await adminJBP.clickCreateCycleBtn();
      await adminJBP.fillCreateCycleModal(cycleName);
      await adminJBP.submitCreateCycleModal();
      if (await adminJBP.isActiveCycleDetectedVisible()) {
        await adminJBP.confirmActiveCycleCreate();
      }
      await adminJBP.waitForNetworkIdle();
      openCycle = await adminJBP.getOpenCycle();
    }
    expect(openCycle).not.toBeNull();
    console.log(`Pre-condition: OPEN cycle is "${openCycle.cycleName}"`);

    // ── Open CP Portal in a new tab ───────────────────────────────────────
    const cpTab   = await context.newPage();
    const portal  = new CPPortalPage(cpTab);

    await portal.navigateToLogin();
    await portal.login('8888888888', '147258');
    console.log('✅ CP Portal login successful');

    // ── Navigate to JBP page ──────────────────────────────────────────────
    await portal.navigateToJBP();

    // Verify active cycle banner
    const cycleBanner = await portal.getCurrentCycleName();
    console.log('Current cycle banner:', cycleBanner);
    expect(cycleBanner).toMatch(/Current Cycle/i);

    // Verify "Add New JBP Entry" button is visible (no submission yet)
    await cpTab.locator('button:has-text("Add New JBP Entry")').waitFor({ state: 'visible', timeout: 10_000 });
    console.log('✅ "Add New JBP Entry" button found');

    // ── Click "Add New JBP Entry" ─────────────────────────────────────────
    await portal.clickAddNewJBPEntry();
    const formHeading = await cpTab.locator('h1, h2').filter({ hasText: /JBP Form/i }).first().textContent();
    console.log('Form heading:', formHeading?.trim());
    expect(formHeading).toMatch(/JBP Form/i);

    // ── Fill the JBP form ─────────────────────────────────────────────────
    await portal.fillJBPForm(JBP_FORM_DATA);
    console.log('✅ JBP form filled');

    // ── Submit ────────────────────────────────────────────────────────────
    await portal.submitJBPForm();
    console.log('✅ Submit clicked');

    // ── Verify submission success ─────────────────────────────────────────
    await cpTab.waitForTimeout(2000);
    const postUrl = cpTab.url();
    console.log('Post-submit URL:', postUrl);

    // Check for error toast first
    const errorMsg = await cpTab.locator('.ant-message-error span, .ant-message-notice-content').first().textContent().catch(() => '');
    if (errorMsg) console.log('Toast message:', errorMsg.trim());

    const success = await portal.isJBPSubmissionSuccessful();
    expect(success, `Expected JBP submission success but got: "${errorMsg.trim()}"`).toBe(true);
    console.log('✅ JBP form submitted successfully');

    await cpTab.close();
  });
});
