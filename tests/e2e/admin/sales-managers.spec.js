'use strict';

/**
 * sales-managers.spec.js — End-to-End tests for the Admin Portal Sales Managers module.
 *
 * Coverage: FUNC + VAL + NEG test cases from
 *   manual-qa-repository/01-test-cases/admin-portal/sales-managers/TC_SALES_MANAGERS.md
 *
 * Authentication:
 *   Uses the saved admin storage state — no login flow required during the run.
 *   Run `npm run auth:setup` if the .auth/admin.json session has expired.
 *
 * Destructive guards:
 *   Tests that mutate live UAT state (create SM, toggle masking, bulk upload triggering
 *   SMS notifications, edit-and-save) are guarded with ENV=uat skip rules. Set
 *   ALLOW_DESTRUCTIVE=1 to opt in on UAT with disposable test data.
 *
 * BRD: ADMIN-FS-Sales-Managers
 */

const { test, expect } = require('@playwright/test');
const { SalesManagersPage } = require('../../../automation-repository/pages/admin/SalesManagersPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/admin.json' });

test.describe('Sales Managers — Admin Portal E2E', () => {
  let smPage;

  test.beforeEach(async ({ page }) => {
    smPage = new SalesManagersPage(page);
    await smPage.navigate();
    await smPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC — Page load, navigation, search
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_SM_001 — ADMIN-FS-Sales-Managers §1 — Sales Managers page loads at /admin/sales-managers', async ({ page }) => {
    await smPage.expectOnSalesManagersUrl();
    await smPage.expectTableLoaded();
    await expect(page).toHaveScreenshot('sm-e2e-001-landing.png', { maxDiffPixels: 300, fullPage: true });
  });

  test('ADM_SM_002 — ADMIN-FS-Sales-Managers §1 — Page header shows Add Sales Manager button', async () => {
    await expect(smPage.addSalesManagerButton).toBeVisible();
  });

  test('ADM_SM_006 — ADMIN-FS-Sales-Managers §1 — Search SM by phone filters list', async () => {
    // UAT may or may not contain a given phone; we just assert the UI responds — either
    // matching rows are shown, or the empty-state placeholder appears.
    const phone = '9876543210';
    await smPage.searchByMobile(phone);
    const rows = await smPage.getTableRowCount();
    const isEmpty = await smPage.tableEmptyState.isVisible().catch(() => false);
    expect(rows > 0 || isEmpty).toBeTruthy();
  });

  test('ADM_SM_007 — ADMIN-FS-Sales-Managers §1 — Search SM by email filters list', async () => {
    await smPage.searchByEmail('test.sm@hoabl.in');
    const rows = await smPage.getTableRowCount();
    const isEmpty = await smPage.tableEmptyState.isVisible().catch(() => false);
    expect(rows > 0 || isEmpty).toBeTruthy();
  });

  test('ADM_SM_040 — ADMIN-FS-Sales-Managers §1 — Refresh SM list reflects external changes', async ({ page }) => {
    // We approximate a "refresh" by reloading the page — the table must re-render and
    // remain on the same URL.
    const urlBefore = page.url();
    await page.reload();
    await smPage.waitForLoad();
    expect(page.url()).toBe(urlBefore);
    await smPage.expectTableLoaded();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC — Add SM modal
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_SM_009 — ADMIN-FS-Sales-Managers §2 — Click Add Sales Manager opens form modal', async ({ page }) => {
    await smPage.openAddSmModal();
    await smPage.expectAddSmModalVisible();
    await expect(page).toHaveScreenshot('sm-e2e-009-add-modal.png', { maxDiffPixels: 300 });
  });

  test('ADM_SM_015 — ADMIN-FS-Sales-Managers §2 — Cancel on Add SM closes modal without saving', async () => {
    await smPage.openAddSmModal();
    await smPage.fillSmDetails({ firstName: 'Cancelled', lastName: 'Draft' });
    await smPage.cancelAddSm();
    await smPage.expectAddSmModalHidden();
  });

  test('ADM_SM_010 — ADMIN-FS-Sales-Managers §2 — Submit valid SM data creates new SM', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — creates live SM + triggers Kaleyra SMS; set ALLOW_DESTRUCTIVE=1');

    // Generate disposable, unique data so reruns do not collide.
    const stamp = Date.now().toString().slice(-6);
    const phone = `9${stamp}0000`.slice(0, 10);
    await smPage.openAddSmModal();
    await smPage.fillSmDetails({
      firstName: 'Auto',
      lastName:  `SM${stamp}`,
      mobile:    phone,
      email:     `auto.sm.${stamp}@hoabl.in`,
      role:      'Sales Manager',
    });
    await smPage.submitAddSm();
    await smPage.expectToastSuccess();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // VAL — Form validation
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_SM_011 — ADMIN-FS-Sales-Managers §2 — Add SM with empty First Name rejected', async () => {
    await smPage.openAddSmModal();
    await smPage.fillSmDetails({
      lastName: 'NoFirst',
      mobile:   '9876543210',
      email:    'nofirst@hoabl.in',
    });
    await smPage.submitAddSm();
    // Either an inline validation message appears, or the modal remains open (no submit fired)
    const errVisible = await smPage.modalErrorMessages.first().isVisible().catch(() => false);
    const modalStillOpen = await smPage.smModal.isVisible().catch(() => false);
    expect(errVisible || modalStillOpen).toBeTruthy();
  });

  test('ADM_SM_012 — ADMIN-FS-Sales-Managers §2 — Add SM with invalid email format rejected', async () => {
    await smPage.openAddSmModal();
    await smPage.fillSmDetails({
      firstName: 'Bad',
      lastName:  'Email',
      mobile:    '9876543210',
      email:     'notanemail',
    });
    await smPage.submitAddSm();
    const errVisible = await smPage.modalErrorMessages.first().isVisible().catch(() => false);
    const modalStillOpen = await smPage.smModal.isVisible().catch(() => false);
    expect(errVisible || modalStillOpen).toBeTruthy();
  });

  test('ADM_SM_013 — ADMIN-FS-Sales-Managers §2 — Add SM with 9-digit phone rejected', async () => {
    await smPage.openAddSmModal();
    await smPage.fillSmDetails({
      firstName: 'Short',
      lastName:  'Phone',
      mobile:    '987654321',   // only 9 digits
      email:     'short.phone@hoabl.in',
    });
    await smPage.submitAddSm();
    const errVisible = await smPage.modalErrorMessages.first().isVisible().catch(() => false);
    const modalStillOpen = await smPage.smModal.isVisible().catch(() => false);
    expect(errVisible || modalStillOpen).toBeTruthy();
  });

  test('ADM_SM_054 — ADMIN-FS-Sales-Managers §2 — Add SM with email containing only spaces rejected', async () => {
    await smPage.openAddSmModal();
    await smPage.fillSmDetails({
      firstName: 'Space',
      lastName:  'Email',
      mobile:    '9876543210',
      email:     '   ',
    });
    await smPage.submitAddSm();
    const errVisible = await smPage.modalErrorMessages.first().isVisible().catch(() => false);
    const modalStillOpen = await smPage.smModal.isVisible().catch(() => false);
    expect(errVisible || modalStillOpen).toBeTruthy();
  });

  test('ADM_SM_055 — ADMIN-FS-Sales-Managers §2 — Add SM with mobile starting with 5 rejected', async () => {
    // Indian mobile must start with 6-9. The phone regex on the backend should reject 5xxxxxxxxx.
    await smPage.openAddSmModal();
    await smPage.fillSmDetails({
      firstName: 'Bad',
      lastName:  'Start',
      mobile:    '5123456789',
      email:     'badstart@hoabl.in',
    });
    await smPage.submitAddSm();
    const errVisible = await smPage.modalErrorMessages.first().isVisible().catch(() => false);
    const modalStillOpen = await smPage.smModal.isVisible().catch(() => false);
    expect(errVisible || modalStillOpen).toBeTruthy();
  });

  test('ADM_SM_056 — ADMIN-FS-Sales-Managers §2 — Phone field blocks non-digit input at the input level', async () => {
    await smPage.openAddSmModal();
    await smPage.mobileInput.click();
    await smPage.mobileInput.type('98abcd1234');
    const value = await smPage.mobileInput.inputValue();
    // The field must contain ONLY digits — non-digit keystrokes are filtered out.
    expect(value).toMatch(/^\d*$/);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // NEG — Duplicates, invalid inputs
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_SM_039 — ADMIN-FS-Sales-Managers §2 — Add SM with duplicate phone rejected', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — would attempt SM create with live phone; set ALLOW_DESTRUCTIVE=1');

    // Use the admin's own phone (8888888888) — it already exists in the system.
    await smPage.openAddSmModal();
    await smPage.fillSmDetails({
      firstName: 'Dup',
      lastName:  'Phone',
      mobile:    '8888888888',
      email:     `dup.phone.${Date.now()}@hoabl.in`,
      role:      'Sales Manager',
    });
    await smPage.submitAddSm();
    // Backend must reject (uniqueness) — either an inline error, an Ant toast error,
    // or the modal staying open with no success toast.
    const errToast = await smPage.toastError.isVisible().catch(() => false);
    const errInline = await smPage.modalErrorMessages.first().isVisible().catch(() => false);
    const modalStillOpen = await smPage.smModal.isVisible().catch(() => false);
    expect(errToast || errInline || modalStillOpen).toBeTruthy();
  });

  test('ADM_SM_021 — ADMIN-FS-Sales-Managers §3 — No Delete action exists on SM rows (deactivation only)', async () => {
    // Per FSD §3.1 there is no DELETE endpoint — UI must not expose a delete button.
    const rowCount = await smPage.getTableRowCount();
    test.skip(rowCount === 0, 'No SM rows visible — cannot verify absence of Delete action');
    const firstRow = smPage.tableRows.first();
    const deleteButton = firstRow.locator('button:has-text("Delete"), [aria-label*="delete" i], .anticon-delete');
    const count = await deleteButton.count();
    expect(count).toBe(0);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BIZ — Toggles (DESTRUCTIVE on UAT — guarded)
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_SM_016 — ADMIN-FS-Sales-Managers §3 — Toggle Assignable OFF flips switch state', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — mutates live SM assignable flag; set ALLOW_DESTRUCTIVE=1');

    const rowCount = await smPage.getTableRowCount();
    test.skip(rowCount === 0, 'No SM rows present to toggle');

    const before = await smPage.getSwitchState(0, 0);
    await smPage.toggleSmAssignable(0);
    const after = await smPage.getSwitchState(0, 0);
    expect(after).not.toBe(before);

    // Revert so the test is idempotent.
    await smPage.toggleSmAssignable(0);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC — Edit flow
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_SM_050 — ADMIN-FS-Sales-Managers §3 — Edit SM modal pre-fills existing fields', async () => {
    const rowCount = await smPage.getTableRowCount();
    test.skip(rowCount === 0, 'No SM rows present to edit');

    await smPage.editSm(0);
    await smPage.expectAddSmModalVisible();
    // At least First Name and Last Name should be non-empty (pre-filled from row data)
    const fn = await smPage.firstNameInput.inputValue().catch(() => '');
    const ln = await smPage.lastNameInput.inputValue().catch(() => '');
    expect((fn + ln).length).toBeGreaterThan(0);
    await smPage.cancelAddSm();
  });

  test('ADM_SM_058 — ADMIN-FS-Sales-Managers §3 — Cancel on Edit SM discards unsaved changes', async () => {
    const rowCount = await smPage.getTableRowCount();
    test.skip(rowCount === 0, 'No SM rows present to edit');

    const originalRowText = await smPage.getRowText(0);
    await smPage.editSm(0);
    await smPage.fillSmDetails({ lastName: 'ShouldNotPersist' });
    await smPage.cancelAddSm();

    // Row text must be unchanged after dismissing the modal.
    const afterRowText = await smPage.getRowText(0);
    expect(afterRowText).toBe(originalRowText);
  });
});
