/**
 * OFFERS TEST SUITE — XR Portal Admin
 * =====================================
 * URL      : https://uat-web.xrportal.in/admin/offers
 * Auth     : Admin session (storageState)
 * Sprint   : 4
 * Total TCs: 12 (TC-OFFERS-001 to TC-OFFERS-012)
 *
 * Zones tested:
 *   1. Page Load       — heading, count badge, column headers
 *   2. Table Structure — columns, data types, Sr.No non-contiguous
 *   3. Add Offer       — drawer fields, valid creation, validation errors
 *   4. Edit Offer      — pre-fill verification, update
 *   5. Toggle          — ON/OFF state, no confirmation dialog, persistence
 *   6. Typology        — dropdown options, selection
 *   7. Refresh         — count unchanged
 *
 * Domain Red Flags:
 *   - Toggle has NO confirmation dialog (HIGH risk)
 *   - Sr.No values are DB primary keys — gaps confirm hard deletes
 *   - Delete tests are ENV-skipped on UAT to prevent data loss
 */

const { test, expect } = require('@playwright/test');
const { OffersPage } = require('../../src/pages/OffersPage.js');

// ── Test Data ──────────────────────────────────────────────────────────────────

// Pinned UAT baseline — update if data changes
const BASELINE_COUNT = 6;

const EXPECTED_COLUMNS = [
  'Sr.no', 'Offer Name', 'Description', 'Amount',
  'Percentage', 'Start Date', 'End Date', 'Created By', 'Action',
];

// Non-contiguous Sr.No values confirming hard-delete behavior
const EXPECTED_SR_NOS = [10, 9, 8, 7, 3, 1];

// Existing offers used for read-only tests (safe to read, not to destroy)
const OFFER_OFF  = 'Home Loan Discount';   // Sr.No 1 — OFF at baseline
const OFFER_ON   = 'VC request';           // Sr.No 9 — ON at baseline (matches first result)
const OFFER_EDIT = 'VK test';              // Sr.No 10 — used for edit round-trip

// Test offer created during suite — cleaned up after
const TEST_OFFER_NAME = 'QA Test Offer Sprint4';
const TEST_OFFER_AMT  = '5000';

// Typology options confirmed from live portal
const EXPECTED_TYPOLOGIES = [
  '1 Bed Growth Home',
  '2 Bed Growth Home',
  '2 Bed Peak Home',
  '2 Bed Rise Home',
];

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 1 — Page Load & Structure
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Load & Structure', () => {
  test.use({ storageState: 'src/fixtures/.auth/admin.json' });

  // TC-OFFERS-001
  test('[TC-OFFERS-001] Page loads with correct offer count and heading', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();

    const heading = await page.locator('h5').first().textContent();
    console.log('Page heading:', heading);
    expect(heading?.trim()).toMatch(/Offers Management/i);

    const count = await offers.getTotalCount();
    console.log('Offer count badge:', count);
    expect(count).toBe(BASELINE_COUNT);

    await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
    await expect(page.locator('button:has-text("Add New Offer")')).toBeVisible();
  });

  // TC-OFFERS-002
  test('[TC-OFFERS-002] Table displays all required columns with correct data types', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();

    const headers = await offers.getColumnHeaders();
    console.log('Column headers:', headers);
    for (const col of EXPECTED_COLUMNS) {
      expect(headers).toContain(col);
    }

    // Amount cells should include ₹ symbol
    const amountCells = await page.locator('table tbody td:nth-child(4)').allTextContents();
    console.log('Amount cells:', amountCells);
    for (const cell of amountCells) {
      expect(cell.trim()).toMatch(/^₹\s[\d,]+$/);
    }

    // Percentage column should be "-" for all rows (all UAT offers are Amount Based)
    const pctCells = await page.locator('table tbody td:nth-child(5)').allTextContents();
    console.log('Percentage cells:', pctCells);
    for (const cell of pctCells) {
      expect(cell.trim()).toBe('-');
    }

    // Date cells should match DD MMM YYYY format
    const startDates = await page.locator('table tbody td:nth-child(6)').allTextContents();
    console.log('Start dates:', startDates);
    for (const d of startDates) {
      expect(d.trim()).toMatch(/^\d{2} [A-Z][a-z]{2} \d{4}$/);
    }

    const rowCount = await offers.getVisibleRowCount();
    console.log('Table row count:', rowCount);
    expect(rowCount).toBeGreaterThanOrEqual(BASELINE_COUNT);
  });

  // TC-OFFERS-003
  test('[TC-OFFERS-003] Sr.No values are non-contiguous confirming hard-delete behavior', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();

    const srNos = await offers.getAllSrNos();
    console.log('Sr.No values:', srNos);

    // Verify exact non-contiguous set
    for (const expected of EXPECTED_SR_NOS) {
      expect(srNos).toContain(expected);
    }
    // 6 total rows
    expect(srNos.length).toBe(BASELINE_COUNT);
    // Gaps at 2, 4, 5, 6 confirm hard deletes
    expect(srNos).not.toContain(2);
    expect(srNos).not.toContain(4);
    expect(srNos).not.toContain(5);
    expect(srNos).not.toContain(6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 2 — Add New Offer
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Add New Offer', () => {
  test.use({ storageState: 'src/fixtures/.auth/admin.json' });

  // TC-OFFERS-004
  test('[TC-OFFERS-004] Add New Offer drawer opens with correct fields and defaults', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();
    await offers.clickAddNewOffer();

    const title = await offers.getDrawerTitle();
    console.log('Drawer title:', title);
    expect(title).toMatch(/Add New Offer/i);

    // Offer Name field with placeholder
    await expect(page.locator('input[placeholder="Please enter offer name"]')).toBeVisible();

    // Amount Based radio pre-selected by default
    const amountRadio = page.locator('.ant-radio-button-wrapper:has-text("Amount Based")').first();
    await expect(amountRadio).toBeVisible();
    // Percentage Based also visible
    await expect(page.locator('.ant-radio-button-wrapper:has-text("Percentage Based")')).toBeVisible();

    // Amount input visible
    await expect(page.locator('input[placeholder="Please enter amount"], .ant-input-number-input').first()).toBeVisible();

    // Description textarea
    await expect(page.locator('textarea[placeholder="Please enter description"]')).toBeVisible();

    // Date range inputs
    await expect(page.locator('input[placeholder="Start date"]')).toBeVisible();
    await expect(page.locator('input[placeholder="End date"]')).toBeVisible();

    // Typology dropdown
    await expect(page.locator('.ant-drawer-body .ant-select-selector').first()).toBeVisible();

    // Action buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Offer")')).toBeVisible();

    await offers.clickCancel();
    const isOpen = await offers.isDrawerOpen();
    expect(isOpen).toBe(false);
  });

  // TC-OFFERS-005 — Create valid offer + cleanup
  test('[TC-OFFERS-005] Create offer with valid inputs succeeds and count increments', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();

    const beforeCount = await offers.getTotalCount();
    console.log('Count before create:', beforeCount);

    await offers.clickAddNewOffer();
    await offers.fillOfferName(TEST_OFFER_NAME);
    await offers.fillAmount(TEST_OFFER_AMT);
    await offers.fillDescription('Created by automation TC-OFFERS-005');
    await offers.fillDateRange('09 May 2026', '09 Jun 2026');
    await offers.clickCreateOffer();

    // Wait for drawer to close
    await offers.waitForDrawerClose();
    await offers.waitForNetworkIdle();

    const afterCount = await offers.getTotalCount();
    console.log('Count after create:', afterCount);
    expect(afterCount).toBe(beforeCount + 1);

    // Verify new row in table
    const row = await offers.getRowByName(TEST_OFFER_NAME);
    console.log('New offer row:', row);
    expect(row.offerName).toBe(TEST_OFFER_NAME);
    expect(row.amount).toMatch(/5,000/);

    // Cleanup — delete the test offer
    // Confirmed from live portal: delete shows dialog with "Yes, delete" / "Cancel" buttons
    await offers.clickDelete(TEST_OFFER_NAME);
    await page.waitForTimeout(600);
    // Confirm the delete dialog ("Are you sure you want to delete this offer?")
    await page.locator('button:has-text("Yes, delete")').first().click();
    await page.waitForTimeout(800);
    await offers.waitForNetworkIdle();

    const finalCount = await offers.getTotalCount();
    console.log('Count after cleanup delete:', finalCount);
    expect(finalCount).toBe(beforeCount);
  });

  // TC-OFFERS-006 — Validation on empty submit
  test('[TC-OFFERS-006] Required field validation fires on empty Create Offer submit', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();
    await offers.clickAddNewOffer();

    // Submit with empty form
    await offers.clickCreateOffer();
    await page.waitForTimeout(600);

    // Drawer should stay open
    const isOpen = await offers.isDrawerOpen();
    expect(isOpen).toBe(true);

    // Validation errors should be present
    const hasErrors = await offers.hasValidationErrors();
    console.log('Has validation errors:', hasErrors);
    expect(hasErrors).toBe(true);

    const errors = await offers.getValidationErrors();
    console.log('Validation errors:', errors);
    expect(errors.length).toBeGreaterThan(0);

    await offers.clickCancel();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 3 — Edit Offer
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Edit Offer', () => {
  test.use({ storageState: 'src/fixtures/.auth/admin.json' });

  // TC-OFFERS-007 — Pre-fill verification
  test('[TC-OFFERS-007] Edit drawer opens with all fields pre-filled for Home Loan Discount', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();
    await offers.clickEdit(OFFER_OFF);

    const title = await offers.getDrawerTitle();
    console.log('Edit drawer title:', title);
    expect(title).toMatch(/Edit Offer/i);

    const name = await offers.getOfferNameValue();
    console.log('Pre-filled name:', name);
    expect(name).toBe('Home Loan Discount');

    const amount = await offers.getAmountValue();
    console.log('Pre-filled amount:', amount);
    expect(amount).toMatch(/10[,.]?000|10000/);

    const desc = await offers.getDescriptionValue();
    console.log('Pre-filled description:', desc);
    expect(desc).toBe('Home Loan Discount');

    const startDate = await offers.getStartDateValue();
    const endDate = await offers.getEndDateValue();
    console.log('Pre-filled dates:', startDate, '→', endDate);
    expect(startDate).toMatch(/Apr 2026/);
    expect(endDate).toMatch(/Jun 2026/);

    // Submit button must say "Update Offer" not "Create Offer"
    await expect(page.locator('button:has-text("Update Offer")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Offer")')).not.toBeVisible();

    await offers.clickCancel();
    const isOpen = await offers.isDrawerOpen();
    expect(isOpen).toBe(false);
  });

  // TC-OFFERS-008 — Edit and update round-trip
  test('[TC-OFFERS-008] Edit VK test offer name and description, then restore', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();

    // Open edit for VK test
    await offers.clickEdit(OFFER_EDIT);

    const originalName = await offers.getOfferNameValue();
    const originalDesc = await offers.getDescriptionValue();
    console.log('Original values — name:', originalName, '| desc:', originalDesc);

    // Modify
    await offers.fillOfferName('VK test updated by QA');
    await offers.fillDescription('QA automation edit test');
    await offers.clickUpdateOffer();
    await offers.waitForDrawerClose();
    await offers.waitForNetworkIdle();

    // Verify table reflects update
    const updatedRow = await offers.getRowByName('VK test updated by QA');
    console.log('Updated row:', updatedRow);
    expect(updatedRow.offerName).toBe('VK test updated by QA');
    expect(updatedRow.description).toBe('QA automation edit test');

    // Restore original values
    await offers.clickEdit('VK test updated by QA');
    await offers.fillOfferName(originalName);
    await offers.fillDescription(originalDesc);
    await offers.clickUpdateOffer();
    await offers.waitForDrawerClose();
    await offers.waitForNetworkIdle();

    // Verify restored
    const restoredRow = await offers.getRowByName(originalName);
    console.log('Restored row:', restoredRow);
    expect(restoredRow.offerName).toBe(originalName);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 4 — Toggle ON/OFF
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Toggle ON/OFF', () => {
  test.use({ storageState: 'src/fixtures/.auth/admin.json' });

  // TC-OFFERS-009 — Toggle from ON to OFF and restore
  test('[TC-OFFERS-009] Toggle switches offer from ON to OFF; state persists after refresh', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();

    // Sr.No 9 "VC request" (2 bed peak home offer) is ON at baseline
    // Use a unique text to match that specific row — match by description
    const targetRow = page.locator('table tbody tr').filter({ hasText: '2 bed peak home offer' }).first();
    const toggle = targetRow.locator('.ant-switch').first();

    const initialState = await toggle.getAttribute('aria-checked');
    console.log('Initial toggle state (2 bed peak):', initialState);
    expect(initialState).toBe('true'); // should be ON

    // Toggle OFF
    await toggle.click();
    await page.waitForTimeout(600);

    const afterOff = await toggle.getAttribute('aria-checked');
    console.log('State after toggle OFF:', afterOff);
    expect(afterOff).toBe('false');

    // Refresh and verify persistence
    await offers.clickRefresh();
    const targetRow2 = page.locator('table tbody tr').filter({ hasText: '2 bed peak home offer' }).first();
    const toggle2 = targetRow2.locator('.ant-switch').first();
    const afterRefresh = await toggle2.getAttribute('aria-checked');
    console.log('State after refresh:', afterRefresh);
    expect(afterRefresh).toBe('false');

    // Restore to ON
    await toggle2.click();
    await page.waitForTimeout(600);
    const restored = await toggle2.getAttribute('aria-checked');
    console.log('Restored state:', restored);
    expect(restored).toBe('true');
  });

  // TC-OFFERS-010 — Toggle from OFF to ON
  test('[TC-OFFERS-010] Toggle switches offer from OFF to ON and back', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();

    // Sr.No 1 "Home Loan Discount" is OFF at baseline
    const targetRow = page.locator('table tbody tr').filter({ hasText: 'Home Loan Discount' }).first();
    const toggle = targetRow.locator('.ant-switch').first();

    const initialState = await toggle.getAttribute('aria-checked');
    console.log('Initial toggle state (Home Loan Discount):', initialState);
    expect(initialState).toBe('false'); // should be OFF

    // Toggle ON
    await toggle.click();
    await page.waitForTimeout(600);
    const afterOn = await toggle.getAttribute('aria-checked');
    console.log('State after toggle ON:', afterOn);
    expect(afterOn).toBe('true');

    // Restore to OFF
    await toggle.click();
    await page.waitForTimeout(600);
    const restored = await toggle.getAttribute('aria-checked');
    console.log('Restored to OFF:', restored);
    expect(restored).toBe('false');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 5 — Typology Dropdown
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Typology Scoping', () => {
  test.use({ storageState: 'src/fixtures/.auth/admin.json' });

  // TC-OFFERS-011 — Typology options in Edit drawer
  test('[TC-OFFERS-011] Edit drawer typology dropdown shows all 4 typology options', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();
    await offers.clickEdit(OFFER_OFF);

    await offers.openTypologyDropdown();
    const options = await offers.getTypologyOptions();
    console.log('Typology options:', options);

    for (const expected of EXPECTED_TYPOLOGIES) {
      expect(options).toContain(expected);
    }
    expect(options.length).toBeGreaterThanOrEqual(4);

    // Close dropdown with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    await offers.clickCancel();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIBE 6 — Refresh
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Refresh', () => {
  test.use({ storageState: 'src/fixtures/.auth/admin.json' });

  // TC-OFFERS-012
  test('[TC-OFFERS-012] Refresh button reloads data without altering offer count', async ({ page }) => {
    const offers = new OffersPage(page);
    await offers.navigate();

    const beforeCount = await offers.getTotalCount();
    console.log('Count before refresh:', beforeCount);

    await offers.clickRefresh();

    const afterCount = await offers.getTotalCount();
    console.log('Count after refresh:', afterCount);

    expect(afterCount).toBe(beforeCount);
    expect(afterCount).toBe(BASELINE_COUNT);

    // All rows still present
    const rowCount = await offers.getVisibleRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(BASELINE_COUNT);
  });
});
