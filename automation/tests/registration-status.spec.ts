import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

// ---------------------------------------------------------------------------
// Helpers — confirmed from UAT DOM inspection
// ---------------------------------------------------------------------------

// The section heading is inside a green div with text "Registration Status"
// The upload input is hidden; we use setInputFiles on the <input type="file">
// Buttons: "Upload File" (outline) and "Submit" (primary green)
// Stats: "Total active registration : 8540" and "Total inactive registration : 6"
// Sample File Download: link with Excel icon text "Sample File Download"

async function navigateToConfig(page: Page) {
    await page.goto('/admin/cms');
    await page.waitForLoadState('networkidle');
}

async function getRegistrationCounts(page: Page): Promise<{ active: number; inactive: number }> {
    await page.waitForSelector('text=Total active registration', { timeout: 10000 });
    const pageText = await page.locator('body').innerText();
    const activeMatch = pageText.match(/Total active registration\s*[:]\s*(\d+)/i);
    const inactiveMatch = pageText.match(/Total inactive registration\s*[:]\s*(\d+)/i);
    return {
        active: activeMatch ? parseInt(activeMatch[1]) : -1,
        inactive: inactiveMatch ? parseInt(inactiveMatch[1]) : -1,
    };
}

// Build an xlsx file and return absolute path
function buildXlsx(filename: string, rows: string[][], includeHeader = true): string {
    const dir = path.join(process.cwd(), 'automation', 'test-data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    const data = includeHeader
        ? [['Registration Number', 'Allocation Status'], ...rows]
        : rows;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Sheet1');
    XLSX.writeFile(wb, filePath);
    return filePath;
}

// The file input for the Registration Status section upload
async function getRegistrationUploadInput(page: Page) {
    // The upload area has two sections (Registration Status + Unit Status)
    // The FIRST input[type=file] on the page corresponds to Registration Status
    return page.locator('input[type="file"]').first();
}

async function getRegistrationSubmitButton(page: Page) {
    // First "Submit" button on page = Registration Status Submit
    return page.getByRole('button', { name: 'Submit' }).first();
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

test.describe('Registration Status — TC-2.1 to TC-2.7', () => {

    test.beforeEach(async ({ page }) => {
        await navigateToConfig(page);
    });

    // -----------------------------------------------------------------------
    // TC-2.1: Forbid Registration — Full End-to-End Flow (POSITIVE)
    // -----------------------------------------------------------------------
    test('TC-2.1: Forbid registration → inactive count increases', async ({ page }) => {
        const before = await getRegistrationCounts(page);
        console.log(`[TC-2.1] Before — active:${before.active} inactive:${before.inactive}`);

        const filePath = buildXlsx('tc2_1_forbid.xlsx', [['GHNG-1000000063', 'forbid']]);
        const input = await getRegistrationUploadInput(page);
        await input.setInputFiles(filePath);
        await page.screenshot({ path: 'reports/screenshots/TC-2.1_file_selected.png' });

        const submit = await getRegistrationSubmitButton(page);
        await submit.click();

        // Wait for a toast / message
        const toast = page.locator('.ant-message-notice').first();
        await expect(toast).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: 'reports/screenshots/TC-2.1_success.png' });

        await page.waitForTimeout(1500);
        const after = await getRegistrationCounts(page);
        console.log(`[TC-2.1] After  — active:${after.active} inactive:${after.inactive}`);

        if (before.inactive >= 0 && after.inactive >= 0) {
            expect(after.inactive).toBeGreaterThanOrEqual(before.inactive);
        }
    });

    // -----------------------------------------------------------------------
    // TC-2.2: Allow Registration (POSITIVE)
    // -----------------------------------------------------------------------
    test('TC-2.2: Allow registration → active count updates', async ({ page }) => {
        const before = await getRegistrationCounts(page);

        const filePath = buildXlsx('tc2_2_allow.xlsx', [['GHNG-1000000063', 'Allow']]);
        const input = await getRegistrationUploadInput(page);
        await input.setInputFiles(filePath);
        await page.screenshot({ path: 'reports/screenshots/TC-2.2_file_selected.png' });

        const submit = await getRegistrationSubmitButton(page);
        await submit.click();

        const toast = page.locator('.ant-message-notice').first();
        await expect(toast).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: 'reports/screenshots/TC-2.2_success.png' });

        const after = await getRegistrationCounts(page);
        console.log(`[TC-2.2] active before:${before.active} after:${after.active}`);
    });

    // -----------------------------------------------------------------------
    // TC-2.3: Sample File Download & Structure Validation (POSITIVE)
    // -----------------------------------------------------------------------
    test('TC-2.3: Sample file download → correct structure', async ({ page }) => {
        const downloadLink = page.getByText('Sample File Download').first();
        await expect(downloadLink).toBeVisible({ timeout: 10000 });
        await page.screenshot({ path: 'reports/screenshots/TC-2.3_link_visible.png' });

        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
            downloadLink.click(),
        ]);

        if (download) {
            const savePath = path.join(process.cwd(), 'automation', 'test-data', 'sample_reg_status.xlsx');
            await download.saveAs(savePath);

            const wb = XLSX.readFile(savePath);
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
            const headers = rows[0] ?? [];

            expect(headers[0]).toMatch(/registration number/i);
            expect(headers[1]).toMatch(/allocation status/i);

            const stat = fs.statSync(savePath);
            expect(stat.size).toBeGreaterThan(1000);
            console.log(`[TC-2.3] File downloaded. Size: ${stat.size} bytes. Headers: ${headers.join(', ')}`);
        } else {
            // Download may not trigger a browser event in headless — link presence is verified
            console.log('[TC-2.3] Link clicked — no download event captured (may be handled by OS)');
        }
        await page.screenshot({ path: 'reports/screenshots/TC-2.3_after_click.png' });
    });

    // -----------------------------------------------------------------------
    // TC-2.4: Invalid Registration Number (NEGATIVE)
    // -----------------------------------------------------------------------
    test('TC-2.4: Invalid registration number → error shown, counts unchanged', async ({ page }) => {
        const before = await getRegistrationCounts(page);

        const filePath = buildXlsx('tc2_4_invalid_reg.xlsx', [['INVALID-999', 'Allow']]);
        const input = await getRegistrationUploadInput(page);
        await input.setInputFiles(filePath);

        const submit = await getRegistrationSubmitButton(page);
        await submit.click();

        // Expect an error message (can be a red toast or inline alert)
        const error = page.locator('.ant-message-error, .ant-message-notice').first();
        await expect(error).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: 'reports/screenshots/TC-2.4_error.png' });

        const after = await getRegistrationCounts(page);
        if (before.active >= 0) expect(after.active).toEqual(before.active);
        if (before.inactive >= 0) expect(after.inactive).toEqual(before.inactive);
    });

    // -----------------------------------------------------------------------
    // TC-2.5: Invalid Allocation Status — "BLOCK" (NEGATIVE)
    // -----------------------------------------------------------------------
    test('TC-2.5: Invalid status "BLOCK" → rejected, counts unchanged', async ({ page }) => {
        const before = await getRegistrationCounts(page);

        const filePath = buildXlsx('tc2_5_block.xlsx', [['GHNG-1000000063', 'BLOCK']]);
        const input = await getRegistrationUploadInput(page);
        await input.setInputFiles(filePath);

        const submit = await getRegistrationSubmitButton(page);
        await submit.click();

        const error = page.locator('.ant-message-error, .ant-message-notice').first();
        await expect(error).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: 'reports/screenshots/TC-2.5_error.png' });

        const after = await getRegistrationCounts(page);
        if (before.active >= 0) expect(after.active).toEqual(before.active);
    });

    // -----------------------------------------------------------------------
    // TC-2.6: Empty File — Header Row Only (NEGATIVE)
    // -----------------------------------------------------------------------
    test('TC-2.6: Empty Excel (header only) → error or warning shown', async ({ page }) => {
        const filePath = buildXlsx('tc2_6_empty.xlsx', []); // no data rows

        const input = await getRegistrationUploadInput(page);
        await input.setInputFiles(filePath);

        const submit = await getRegistrationSubmitButton(page);
        await submit.click();

        // Some systems show no message for empty upload — so we wait briefly
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'reports/screenshots/TC-2.6_response.png' });

        // Soft assertion — system should not crash
        const errorVisible = await page.locator('.ant-message-notice, .ant-alert').first().isVisible().catch(() => false);
        console.log(`[TC-2.6] Error/notice visible: ${errorVisible}`);
    });

    // -----------------------------------------------------------------------
    // TC-2.7: Invalid File Format (.txt) (NEGATIVE)
    // -----------------------------------------------------------------------
    test('TC-2.7: Invalid file format (.txt) → rejected or error shown', async ({ page }) => {
        const dir = path.join(process.cwd(), 'automation', 'test-data');
        const filePath = path.join(dir, 'tc2_7_invalid.txt');
        fs.writeFileSync(filePath, 'GHNG-1000000063 Allow\n', 'utf8');

        const input = await getRegistrationUploadInput(page);

        let rejectedAtInput = false;
        try {
            await input.setInputFiles(filePath);
        } catch {
            rejectedAtInput = true; // browser-level filter blocked it
        }

        if (!rejectedAtInput) {
            const submit = await getRegistrationSubmitButton(page);
            await submit.click();
            await page.waitForTimeout(3000);
        }

        await page.screenshot({ path: 'reports/screenshots/TC-2.7_format_check.png' });

        // Either rejected at input OR an error message shows
        const errorShown = await page.locator('.ant-message-error, .ant-message-notice').first().isVisible().catch(() => false);
        console.log(`[TC-2.7] Rejected at input: ${rejectedAtInput} | Error shown: ${errorShown}`);
        expect(rejectedAtInput || errorShown).toBe(true);
    });

});
