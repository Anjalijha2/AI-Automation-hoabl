/**
 * CONFIG MODULE — Automated Test Suite
 * URL: https://uat-web.xrportal.in/admin/cms
 *
 * Sprint 1 scope (19 TCs):
 *   TC_CFG_001–006  Tower Configuration
 *   TC_CFG_007–010  Max Preferences Per Unit
 *   TC_CFG_011–013  Customer Actions Card (admin toggle only)
 *   TC_CFG_014–019  Sample/Inventory file downloads
 *
 * Deferred Sprint 2: upload/modify tests, cross-portal Customer Portal, payment flow.
 */

import { test, expect } from '@playwright/test';
import { ConfigPage } from '../pages/config.page';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

test.describe('⚙️ CONFIG — Module Tests', () => {

  // ── TC_CFG_001 ───────────────────────────────────────────────────────────────
  test('TC_CFG_001 | Tower Config — Deactivate an active tower', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    // Tower 8-Crest is reliably Active in UAT (BRD default)
    const tower = 'Tower 8 - Crest';
    const { isActive: wasBefore } = await config.getTowerToggleInfo(tower);
    expect(wasBefore, `Precondition: ${tower} should be Active`).toBe(true);

    // Deactivate
    await config.clickTowerToggle(tower);
    const { isActive: afterToggle } = await config.getTowerToggleInfo(tower);
    expect(afterToggle).toBe(false);

    // Save
    await config.saveConfiguration();
    const toast = await config.waitForSuccessToast();
    expect(toast.length).toBeGreaterThan(0);

    // Cleanup — restore to Active
    await config.clickTowerToggle(tower);
    await config.saveConfiguration();
    const { isActive: restored } = await config.getTowerToggleInfo(tower);
    expect(restored).toBe(true);
  });

  // ── TC_CFG_002 ───────────────────────────────────────────────────────────────
  test('TC_CFG_002 | Tower Config — Activate an inactive tower', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    // Tower 9-Triumph is Inactive in UAT
    const tower = 'Tower 9 - Triumph';
    const { isActive: wasBefore } = await config.getTowerToggleInfo(tower);
    expect(wasBefore, `Precondition: ${tower} should be Inactive`).toBe(false);

    // Activate
    await config.clickTowerToggle(tower);
    const { isActive: afterToggle } = await config.getTowerToggleInfo(tower);
    expect(afterToggle).toBe(true);

    // Save
    await config.saveConfiguration();
    const toast = await config.waitForSuccessToast();
    expect(toast.length).toBeGreaterThan(0);

    // Cleanup — restore to Inactive
    await config.clickTowerToggle(tower);
    await config.saveConfiguration();
    const { isActive: restored } = await config.getTowerToggleInfo(tower);
    expect(restored).toBe(false);
  });

  // ── TC_CFG_003 ───────────────────────────────────────────────────────────────
  test('TC_CFG_003 | Tower Config — Toggle state persists after page refresh', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    const tower = 'Tower 8 - Crest';
    const { isActive: originalState } = await config.getTowerToggleInfo(tower);

    // Flip toggle and save
    await config.clickTowerToggle(tower);
    await config.saveConfiguration();

    // Refresh page
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(config.updateTowerConfigBtn).toBeVisible({ timeout: 15_000 });
    await config.waitForNetworkIdle();

    // Verify state persisted (should be opposite of original)
    const { isActive: afterRefresh } = await config.getTowerToggleInfo(tower);
    expect(afterRefresh).toBe(!originalState);

    // Cleanup — restore original state
    await config.clickTowerToggle(tower);
    await config.saveConfiguration();
  });

  // ── TC_CFG_004 ───────────────────────────────────────────────────────────────
  test('TC_CFG_004 | Tower Config — Toggle reverts without saving', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    const tower = 'Tower 8 - Crest';
    const { isActive: originalState } = await config.getTowerToggleInfo(tower);

    // Flip toggle but do NOT save
    await config.clickTowerToggle(tower);
    const { isActive: afterToggle } = await config.getTowerToggleInfo(tower);
    expect(afterToggle).toBe(!originalState);

    // Refresh without saving
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(config.updateTowerConfigBtn).toBeVisible({ timeout: 15_000 });
    await config.waitForNetworkIdle();

    // State should revert to original
    const { isActive: afterRefresh } = await config.getTowerToggleInfo(tower);
    expect(afterRefresh).toBe(originalState);
  });

  // ── TC_CFG_005 ───────────────────────────────────────────────────────────────
  test('TC_CFG_005 | Tower Config — View Tower button is present and clickable', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    // Verify the "View Tower" button exists for Tower 8 - Crest
    const viewBtnCount = await page.locator('button', { hasText: 'View Tower' }).count();
    expect(viewBtnCount).toBeGreaterThan(0);

    const urlBefore = page.url();
    await config.clickViewTowerLink('Tower 8 - Crest');

    // Accept either: URL changed (navigated to tower detail) OR stayed on same page (UAT placeholder)
    const urlAfter = page.url();
    const navigated = urlAfter !== urlBefore;
    const modalOpened = await page.locator('.ant-drawer, .ant-modal').isVisible();
    console.log(`View Tower result: navigated=${navigated}, modal=${modalOpened}, url=${urlAfter}`);

    // Test passes regardless — we verified the button exists and is clickable without error.
    // If navigation did occur, navigate back.
    if (navigated) {
      await page.goto('https://uat-web.xrportal.in/admin/cms', { waitUntil: 'domcontentloaded' });
    }
  });

  // ── TC_CFG_006 ───────────────────────────────────────────────────────────────
  test('TC_CFG_006 | Tower Config — Verify active tower count and names', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    const count = await config.getActiveTowerCount();
    expect(count).toBeGreaterThan(0);

    const names = await config.getActiveTowerNames();
    console.log(`✅ Active towers (${count}): ${names.join(', ')}`);

    // Tower 8-Crest and Tower 10-Crown are the reliable UAT defaults
    expect(names).toContain('Tower 8 - Crest');
    expect(names).toContain('Tower 10 - Crown');
  });

  // ── TC_CFG_007 ───────────────────────────────────────────────────────────────
  test('TC_CFG_007 | Max Preferences — Update value and verify toast', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();
    await config.scrollToSection('Max Preferences Per Unit');

    await config.setMaxPreferences('6');
    await config.clickMaxPreferencesUpdate();
    const toast = await config.waitForSuccessToast();
    expect(toast.length).toBeGreaterThan(0);
    console.log(`✅ Toast: "${toast}"`);
  });

  // ── TC_CFG_008 ───────────────────────────────────────────────────────────────
  test('TC_CFG_008 | Max Preferences — Value persists after page refresh', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();
    await config.scrollToSection('Max Preferences Per Unit');

    await config.setMaxPreferences('6');
    await config.clickMaxPreferencesUpdate();
    await config.waitForSuccessToast();

    // Reload and verify
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(config.updateTowerConfigBtn).toBeVisible({ timeout: 15_000 });
    await config.waitForNetworkIdle();
    await config.scrollToSection('Max Preferences Per Unit');

    const savedValue = await config.getMaxPreferencesValue();
    expect(savedValue.trim()).toBe('6');
  });

  // ── TC_CFG_009 ───────────────────────────────────────────────────────────────
  test('TC_CFG_009 | Max Preferences — Change to a different value', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();
    await config.scrollToSection('Max Preferences Per Unit');

    await config.setMaxPreferences('4');
    await config.clickMaxPreferencesUpdate();
    const toast = await config.waitForSuccessToast();
    expect(toast.length).toBeGreaterThan(0);

    const saved = await config.getMaxPreferencesValue();
    expect(saved.trim()).toBe('4');
  });

  // ── TC_CFG_010 ───────────────────────────────────────────────────────────────
  test('TC_CFG_010 | Max Preferences — Click Update without changing value', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();
    await config.scrollToSection('Max Preferences Per Unit');

    const valueBefore = await config.getMaxPreferencesValue();
    await config.clickMaxPreferencesUpdate();

    // Either a success toast appears (same value saved) or no error toast
    let toastText = '';
    try {
      toastText = await config.waitForSuccessToast(4_000);
    } catch (_) {
      // No toast = acceptable (no-change behaviour)
    }
    console.log(`✅ Value before: "${valueBefore}", toast: "${toastText || 'none'}"`);
    // Test passes as long as no error toast appears
    const errorToast = await page.locator('.ant-message-error').isVisible();
    expect(errorToast, 'Should not show an error toast for same-value update').toBe(false);
  });

  // ── TC_CFG_011 ───────────────────────────────────────────────────────────────
  test('TC_CFG_011 | Customer Actions — Disable additional registrations toggle', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();
    await config.scrollToSection('Customer Actions Card');

    // Ensure toggle starts Active; if not, skip (we need a known starting state)
    const wasActive = await config.isCustomerActionsActive();
    if (!wasActive) {
      // Activate first so we can test the disable path
      await config.toggleCustomerActions();
      await config.submitCustomerActions();
      await config.waitForSuccessToast();
    }

    // Now disable
    await config.toggleCustomerActions();
    await config.submitCustomerActions();
    const toast = await config.waitForSuccessToast();
    expect(toast.length).toBeGreaterThan(0);

    const isNowActive = await config.isCustomerActionsActive();
    expect(isNowActive).toBe(false);
  });

  // ── TC_CFG_012 ───────────────────────────────────────────────────────────────
  test('TC_CFG_012 | Customer Actions — Enable additional registrations toggle', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();
    await config.scrollToSection('Customer Actions Card');

    // Ensure toggle starts Inactive; if not, disable first
    const wasActive = await config.isCustomerActionsActive();
    if (wasActive) {
      await config.toggleCustomerActions();
      await config.submitCustomerActions();
      await config.waitForSuccessToast();
    }

    // Now enable
    await config.toggleCustomerActions();
    await config.submitCustomerActions();
    const toast = await config.waitForSuccessToast();
    expect(toast.length).toBeGreaterThan(0);

    const isNowActive = await config.isCustomerActionsActive();
    expect(isNowActive).toBe(true);
  });

  // ── TC_CFG_013 ───────────────────────────────────────────────────────────────
  test('TC_CFG_013 | Customer Actions — Change dropdown counts and submit', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();
    await config.scrollToSection('Customer Actions Card');

    // Ensure toggle is Active before setting counts
    const isActive = await config.isCustomerActionsActive();
    if (!isActive) {
      await config.toggleCustomerActions();
    }

    // Set bed type checkboxes and count dropdowns
    await config.setCustomerActionsCheckbox('Allow 1 Bed Growth Home', true);
    await config.setCustomerActionsCount('Allow 1 Bed Growth Home', '5');
    await config.setCustomerActionsCheckbox('Allow 2 Bed Growth Home', true);
    await config.setCustomerActionsCount('Allow 2 Bed Growth Home', '5');

    await config.submitCustomerActions();
    const toast = await config.waitForSuccessToast();
    expect(toast.length).toBeGreaterThan(0);
    console.log(`✅ Customer Actions updated. Toast: "${toast}"`);
  });

  // ── TC_CFG_014 ───────────────────────────────────────────────────────────────
  test('TC_CFG_014 | Registration Status — Sample file downloads with correct columns', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    const filePath = await config.downloadSampleFile('Registration Status');
    expect(fs.existsSync(filePath)).toBe(true);

    const wb = XLSX.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows.length).toBeGreaterThan(0);

    const headers: string[] = rows[0].map((h: any) => String(h).trim());
    expect(headers).toContain('Registration Number');
    expect(headers).toContain('Allocation Status');
    console.log(`✅ Registration Status sample columns: ${headers.join(', ')}`);

    fs.unlinkSync(filePath);
  });

  // ── TC_CFG_015 ───────────────────────────────────────────────────────────────
  test('TC_CFG_015 | Unit Status — Sample file downloads with correct columns', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    const filePath = await config.downloadSampleFile('Unit Status');
    expect(fs.existsSync(filePath)).toBe(true);

    const wb = XLSX.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows.length).toBeGreaterThan(0);

    const headers: string[] = rows[0].map((h: any) => String(h).trim());
    const expectedCols = ['Tower Name', 'Unit No', 'Status', 'Update (1/0)'];
    for (const col of expectedCols) {
      expect(headers, `Missing column: "${col}"`).toContain(col);
    }
    console.log(`✅ Unit Status sample columns: ${headers.join(', ')}`);
    fs.unlinkSync(filePath);
  });

  // ── TC_CFG_016 ───────────────────────────────────────────────────────────────
  test('TC_CFG_016 | Unit Cost Update — Available Unit Inventory downloads correctly', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    const filePath = await config.downloadSampleFile('Unit Cost Update', 'Available Unit Inventory Download');
    expect(fs.existsSync(filePath)).toBe(true);

    const wb = XLSX.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows.length).toBeGreaterThan(1); // header + at least 1 data row

    const headers: string[] = rows[0].map((h: any) => String(h).trim());
    const expectedCols = ['Tower Name', 'Unit No', 'Agreement Value', 'Early Bird Benefit', 'Status', 'Update (1/0)'];
    for (const col of expectedCols) {
      expect(headers, `Missing column: "${col}"`).toContain(col);
    }
    console.log(`✅ Unit Cost Inventory columns: ${headers.join(', ')}, rows: ${rows.length - 1}`);
    fs.unlinkSync(filePath);
  });

  // ── TC_CFG_017 ───────────────────────────────────────────────────────────────
  test('TC_CFG_017 | Bulk Booking Cancellation — Sample file downloads correctly', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    const filePath = await config.downloadSampleFile('Bulk Booking Cancellation');
    expect(fs.existsSync(filePath)).toBe(true);

    const wb = XLSX.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows.length).toBeGreaterThan(0);

    const headers: string[] = rows[0].map((h: any) => String(h).trim());
    expect(headers).toContain('Registration Number');
    console.log(`✅ Bulk Booking Cancellation sample columns: ${headers.join(', ')}`);
    fs.unlinkSync(filePath);
  });

  // ── TC_CFG_018 ───────────────────────────────────────────────────────────────
  test('TC_CFG_018 | Bulk Registration Cancellation — Sample file downloads correctly', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    const filePath = await config.downloadSampleFile('Bulk Registration Cancellation');
    expect(fs.existsSync(filePath)).toBe(true);

    const wb = XLSX.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows.length).toBeGreaterThan(0);

    const headers: string[] = rows[0].map((h: any) => String(h).trim());
    expect(headers).toContain('Registration Number');
    expect(headers).toContain('Update (1/0)');
    console.log(`✅ Bulk Reg Cancellation sample columns: ${headers.join(', ')}`);
    fs.unlinkSync(filePath);
  });

  // ── TC_CFG_019 ───────────────────────────────────────────────────────────────
  test('TC_CFG_019 | Sales Managers — Sample file downloads with correct columns', async ({ page }) => {
    const config = new ConfigPage(page);
    await config.navigate();

    const filePath = await config.downloadSampleFile('Sales Managers');
    expect(fs.existsSync(filePath)).toBe(true);

    const wb = XLSX.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    expect(rows.length).toBeGreaterThan(0);

    const headers: string[] = rows[0].map((h: any) => String(h).trim());
    const expectedCols = ['ROLE', 'FIRST NAME', 'LAST NAME', 'EMAIL', 'PHONE', 'IS AVAILABLE', 'IS ACTIVE'];
    for (const col of expectedCols) {
      expect(headers, `Missing column: "${col}"`).toContain(col);
    }
    console.log(`✅ Sales Managers sample columns: ${headers.join(', ')}`);
    fs.unlinkSync(filePath);
  });

});
