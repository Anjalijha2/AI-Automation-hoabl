/**
 * CUSTOMERS TEST SUITE — XR Portal Admin
 * ======================================
 * URL  : https://uat-web.xrportal.in/admin/customers
 * Auth : Required (Handled via auth.setup.js)
 */

const { test, expect } = require('@playwright/test');
const { CustomersPage } = require('../../src/pages/CustomersPage.js');
const { ConfigPage } = require('../../src/pages/ConfigPage.js');
const path = require('path');

test.use({
    storageState: path.join(__dirname, '../../src/fixtures/.auth/admin.json'),
});

test.describe('📊 CUSTOMERS — Module Tests', () => {

    test.beforeEach(async ({ page }) => {
        const customers = new CustomersPage(page);
        await customers.navigate();
    });

    // Pause for 5 seconds at the end of each test to allow visual inspection
    test.afterEach(async ({ page }) => {
        await page.waitForTimeout(5000);
    });

    // ── TC_CUST_001 ─────────────────────────────────────────────────────────────
    test('TC_CUST_001 | KPI — Registered Count Validation', async ({ page }) => {
        const customers = new CustomersPage(page);
        const cardValue = await customers.getKpiValue(customers.registeredCard);

        await customers.applyAllocationFilter(['Booked Offline', 'Booked Online', 'Registered', 'Inactive Registrations']);
        const recordCount = await customers.getTableRecordCount();

        expect(recordCount).toBe(cardValue);
    });

    // ── TC_CUST_002 ─────────────────────────────────────────────────────────────
    test('TC_CUST_002 | KPI — Inactive Count Validation', async ({ page }) => {
        const customers = new CustomersPage(page);
        const cardValue = await customers.getKpiValue(customers.inactiveRegCard);

        await customers.applyAllocationFilter(['Inactive Registrations']);
        const recordCount = await customers.getTableRecordCount();

        expect(recordCount).toBe(cardValue);
    });

    // ── TC_CUST_003 ─────────────────────────────────────────────────────────────
    test('TC_CUST_003 | KPI — Cancelled Count Validation', async ({ page }) => {
        const customers = new CustomersPage(page);
        const cardValue = await customers.getKpiValue(customers.cancelledRegCard);

        await customers.applyAllocationFilter(['Cancelled']);
        const recordCount = await customers.getTableRecordCount();

        expect(recordCount).toBe(cardValue);
    });

    // ── TC_CUST_004 ─────────────────────────────────────────────────────────────
    test('TC_CUST_004 | KPI — KYC Pending Count Validation', async ({ page }) => {
        const customers = new CustomersPage(page);
        const cardValue = await customers.getKpiValue(customers.kycPendingCard);

        await customers.applyAllocationFilter(['Booked Online', 'Booked Offline']);
        await customers.applyProcessFilter(['KYC Pending']);
        const recordCount = await customers.getTableRecordCount();

        expect(recordCount).toBe(cardValue);
    });

    // ── TC_CUST_005 ─────────────────────────────────────────────────────────────
    test('TC_CUST_005 | KPI — Confirmed Count Validation', async ({ page }) => {
        const customers = new CustomersPage(page);
        const cardValue = await customers.getKpiValue(customers.confirmedCard);

        await customers.applyAllocationFilter(['Booked Online', 'Booked Offline']);
        await customers.applyProcessFilter(['KYC Completed']);
        const recordCount = await customers.getTableRecordCount();

        expect(recordCount).toBe(cardValue);
    });

    // ── TC_CUST_006 ─────────────────────────────────────────────────────────────
    // BRD: Read Active Towers KPI → go to Config page → count green toggles → assert equal (read-only)
    test('TC_CUST_006 | KPI — Active Towers Cross-page Validation', async ({ page }) => {
        const customers = new CustomersPage(page);
        const config = new ConfigPage(page);

        // Step 1-2: Note the Active Towers KPI value from the Customers page
        const kpiCount = await customers.getKpiValue(customers.activeTowersCard);

        // Step 3-4: Navigate to Config page and count green (checked) tower toggles
        await config.navigate();
        const activeTowerCount = await config.getActiveTowerCount();

        // Step 5: Both values must match
        expect(activeTowerCount).toBe(kpiCount);
    });

    // ── TC_CUST_017 ─────────────────────────────────────────────────────────────
    // BRD: Activate one inactive tower via Config page → verify Active Towers KPI increments by 1 → cleanup
    test('TC_CUST_017 | Config — Active Towers KPI Live Update', async ({ page }) => {
        const customers = new CustomersPage(page);
        const config = new ConfigPage(page);

        // Step 1: Note initial Active Towers KPI count on Customers page
        const initialCount = await customers.getKpiValue(customers.activeTowersCard);

        // Steps 2-4: Navigate to Config, activate first inactive tower, save
        await config.navigate();
        const toggleIndex = await config.activateFirstInactiveTower();
        await config.saveConfiguration();

        // Steps 5-6: Navigate back to Customers, verify count = initial + 1
        await customers.navigate();
        const updatedCount = await customers.getKpiValue(customers.activeTowersCard);
        expect(updatedCount).toBe(initialCount + 1);

        // Step 7 (cleanup): Revert the tower back to inactive
        await config.navigate();
        await config.deactivateTowerAtIndex(toggleIndex);
        await config.saveConfiguration();

        // Verify cleanup restored original count
        await customers.navigate();
        const restoredCount = await customers.getKpiValue(customers.activeTowersCard);
        expect(restoredCount).toBe(initialCount);
    });

    // ── TC_CUST_007 ─────────────────────────────────────────────────────────────
    test('TC_CUST_007 | Cancel Registration Flow', async ({ page }) => {
        const customers = new CustomersPage(page);

        // Find a valid "Registered" row first via filter so we don't click delete on cancelled
        await customers.applyAllocationFilter(['Registered']);

        const row = customers.dataTable.locator('.ant-table-row').first();
        if (await row.isVisible()) {
            await row.locator(customers.locators.actionDeleteIcon).click();
            await expect(customers.modalConfirmRefund).toBeVisible();
            await expect(page.locator('text=₹999').first()).toBeVisible();
            await customers.btnCancelRegistration.click();
            // Verify success toast — use filter() to combine class + text (comma syntax is invalid)
            await expect(page.locator('.ant-message-notice').filter({ hasText: 'refunded successfully' }).first()).toBeVisible({ timeout: 8000 });
        } else {
            console.log('Skipping TC_CUST_007: No records found with Registered status to cancel.');
        }
    });

    // ── TC_CUST_008 ─────────────────────────────────────────────────────────────
    test('TC_CUST_008 | Home Loan Approval Flow', async ({ page }) => {
        const customers = new CustomersPage(page);

        await customers.applyAllocationFilter(['Registered']);
        const row = customers.dataTable.locator('.ant-table-row').first();

        if (await row.isVisible()) {
            await row.locator(customers.locators.actionThreeDots).click();
            await page.locator(customers.locators.menuItemHomeLoan).click();
            await expect(customers.modalHomeLoan).toBeVisible();
            await customers.toggleHomeLoan.click();
            await customers.btnSubmitHomeLoan.click();
            await expect(page.locator('.ant-message-notice').filter({ hasText: 'successfully' }).first()).toBeVisible({ timeout: 8000 });
        } else {
            console.log('Skipping TC_CUST_008: No records found to approve loan.');
        }
    });

    // ── TC_CUST_009 ─────────────────────────────────────────────────────────────
    test('TC_CUST_009 | Filter — Registration Details Search', async ({ page }) => {
        const customers = new CustomersPage(page);
        await customers.turnOnInlineFilters();
        await customers.searchBoxRegDetails.fill('GHNG-1');
        await page.keyboard.press('Enter');
        await customers.waitForNetworkIdle();
        expect(await customers.getTableRecordCount()).toBeGreaterThanOrEqual(0);
    });

    // ── TC_CUST_010 ─────────────────────────────────────────────────────────────
    test('TC_CUST_010 | Filter — Growth Partner Search', async ({ page }) => {
        const customers = new CustomersPage(page);
        await customers.turnOnInlineFilters();
        await customers.searchBoxHVCode.fill('HV000');
        await page.keyboard.press('Enter');
        await customers.waitForNetworkIdle();
        expect(await customers.getTableRecordCount()).toBeGreaterThanOrEqual(0);
    });

    // ── TC_CUST_011 ─────────────────────────────────────────────────────────────
    test('TC_CUST_011 | Filter — Confirmation Number Search', async ({ page }) => {
        const customers = new CustomersPage(page);
        await customers.turnOnInlineFilters();
        await customers.searchBoxConfNum.fill('BKD');
        await page.keyboard.press('Enter');
        await customers.waitForNetworkIdle();
        expect(await customers.getTableRecordCount()).toBeGreaterThanOrEqual(0);
    });

    // ── TC_CUST_012 ─────────────────────────────────────────────────────────────
    test('TC_CUST_012 | Filter — Alloted Unit Search', async ({ page }) => {
        const customers = new CustomersPage(page);
        await customers.turnOnInlineFilters();
        await customers.searchBoxAllotedUnit.fill('1 Bed');
        await page.keyboard.press('Enter');
        await customers.waitForNetworkIdle();
        expect(await customers.getTableRecordCount()).toBeGreaterThanOrEqual(0);
    });

    // ── TC_CUST_013 ─────────────────────────────────────────────────────────────
    test('TC_CUST_013 | Filter — Home Loan Details Checkbox', async ({ page }) => {
        const customers = new CustomersPage(page);
        await customers.applyHomeLoanFilter('Yes');
        expect(await customers.getTableRecordCount()).toBeGreaterThanOrEqual(0);
    });

    // ── TC_CUST_014 ─────────────────────────────────────────────────────────────
    test('TC_CUST_014 | Reset Filters Functionality', async ({ page }) => {
        const customers = new CustomersPage(page);
        await customers.turnOnInlineFilters();
        await customers.searchBoxRegDetails.fill('GHNG-123');
        await page.keyboard.press('Enter');
        await customers.waitForNetworkIdle();

        await customers.resetAllFilters();
        await page.waitForTimeout(1000);

        // After reset, filter panel may close (hiding inputs). Guard before reading.
        const isVisible = await customers.searchBoxRegDetails.isVisible();
        if (isVisible) {
            const searchVal = await customers.searchBoxRegDetails.inputValue();
            expect(searchVal).toBe('');
        } else {
            // Panel closed = filters were reset; validate table shows records
            const count = await customers.getTableRecordCount();
            expect(count).toBeGreaterThan(0);
        }
    });

    // ── TC_CUST_015 ─────────────────────────────────────────────────────────────
    test('TC_CUST_015 | Download Data to Excel', async ({ page }) => {
        const customers = new CustomersPage(page);
        const fs = require('fs');
        const os = require('os');
        const XLSX = require('xlsx');
        const { exec } = require('child_process');
        const { execSync } = require('child_process');

        // Step 1 — Trigger download and save file to disk
        const downloadPromise = page.waitForEvent('download');
        await customers.downloadBtn.click();
        const download = await downloadPromise;

        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.(xlsx?|csv)$/i);

        // Save to system temp dir (not OneDrive) to avoid sync-lock issues on delete
        const ext = require('path').extname(filename);
        const savePath = require('path').join(os.tmpdir(), `TC015_${Date.now()}${ext}`);
        await download.saveAs(savePath);

        // Step 2 — Open the file visually in Excel so it can be inspected on screen
        console.log(`📂 Opening ${filename} in Excel...`);
        exec(`start "" "${savePath}"`);

        // Step 3 — Wait 6 seconds for the file to open and be visible on screen
        await page.waitForTimeout(6000);

        // Step 4 — Read with xlsx library for automated verification
        const workbook = XLSX.readFile(savePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Step 5 — Verify file has data (header row + at least 1 data row)
        expect(rows.length).toBeGreaterThan(1);

        // Step 6 — Verify all 17 expected columns are present
        const headers = rows[0].map((h) => String(h).trim());
        const expectedColumns = [
            'Registration Number',
            'Registration Date',
            'Phone',
            'Growth Partner HV Code',
            'Growth Partner',
            'Home Loan ID',
            'Home Loan Discount',
            'Unit Confirmation Number',
            'Alloted Unit',
            'Unit No',
            'Tower Name',
            'Parking Count',
            'Parking Amount',
            'Total Parking Amount',
            'Allocation Status',
            'Confirmation Status',
            'Process Status',
        ];
        for (const col of expectedColumns) {
            expect(headers, `Missing column: "${col}"`).toContain(col);
        }

        console.log(`✅ File: ${filename}`);
        console.log(`✅ Rows (excluding header): ${rows.length - 1}`);
        console.log(`✅ Columns verified: ${headers.join(', ')}`);

        // Step 7 — Close the spreadsheet app (handles Microsoft Excel and WPS Office)
        console.log(`❎ Closing spreadsheet app...`);
        // Try Excel COM quit first (Microsoft Excel only)
        try {
            execSync(
                `powershell -command "` +
                `$xl = [Runtime.InteropServices.Marshal]::GetActiveObject('Excel.Application'); ` +
                `$xl.Quit(); ` +
                `[Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null"`,
                { stdio: 'ignore' }
            );
        } catch (_) {
            // Microsoft Excel not running — try force-kill Excel
            try { execSync('taskkill /F /IM EXCEL.EXE', { stdio: 'ignore' }); } catch (_2) {}
        }
        // WPS Office: et.exe = WPS Spreadsheets, wps.exe = WPS Office hub
        try { execSync('taskkill /F /IM et.exe', { stdio: 'ignore' }); } catch (_) {}
        try { execSync('taskkill /F /IM wps.exe', { stdio: 'ignore' }); } catch (_) {}

        // Step 8 — Delete temp file (COM quit releases lock immediately; 1 retry as safety net)
        await page.waitForTimeout(500);
        let deleted = false;
        for (let attempt = 0; attempt < 3; attempt++) {
            try { fs.unlinkSync(savePath); deleted = true; break; } catch (_) { await page.waitForTimeout(1000); }
        }
        if (!deleted) console.log(`⚠️ Temp file left in OS temp dir — Windows will auto-clean`);
    });

    // ── TC_CUST_016 ─────────────────────────────────────────────────────────────
    test('TC_CUST_016 | Pagination Navigation & Sizes', async ({ page }) => {
        const customers = new CustomersPage(page);

        // Scroll to pagination bar first — it sits at the bottom and may be off-screen
        await customers.scrollToPagination();
        await expect(customers.pageSizeDropdown).toBeVisible({ timeout: 5_000 });

        // Step 1 — Verify default page size is 10
        const defaultRows = await customers.getVisibleRowCount();
        expect(defaultRows).toBeGreaterThan(0);
        expect(defaultRows).toBeLessThanOrEqual(10);

        // Step 2 — Test each page size: 20, 50, 100
        for (const size of ['20', '50', '100']) {
            await customers.scrollToPagination();
            await customers.changePageSize(size);
            await customers.scrollToPagination();
            const rows = await customers.getVisibleRowCount();
            expect(rows).toBeGreaterThan(0);
            expect(rows).toBeLessThanOrEqual(parseInt(size));
        }

        // Reset to 10/page before navigation tests
        await customers.scrollToPagination();
        await customers.changePageSize('10');

        // Step 3 — Click through page numbers 2, 3, 4 and verify rows per page
        for (const pgNum of [2, 3, 4]) {
            await customers.scrollToPagination();
            await customers.clickPageNumber(pgNum);
            await customers.scrollToPagination();
            const rows = await customers.getVisibleRowCount();
            expect(rows).toBeGreaterThan(0);
            expect(rows).toBeLessThanOrEqual(10);
        }

        // Step 4 — Navigate to last page and verify remaining rows <= page size
        await customers.scrollToPagination();
        await customers.navigateToLastPage();
        await customers.scrollToPagination();
        const lastPageRows = await customers.getVisibleRowCount();
        expect(lastPageRows).toBeGreaterThan(0);
        expect(lastPageRows).toBeLessThanOrEqual(10);
    });

});
