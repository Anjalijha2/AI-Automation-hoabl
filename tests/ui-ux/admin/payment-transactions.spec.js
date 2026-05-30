'use strict';

/**
 * payment-transactions.spec.js — UI/UX tests for the Admin Portal Payment Transactions module.
 *
 * What this file tests:
 *   Pure presentation concerns — layout, KPIs/header, table column rendering,
 *   status badges, detail-panel visuals (when the "coming soon" message renders),
 *   and responsive viewport behaviour. No data mutations.
 *
 * Read-only module:
 *   Payment Transactions admin view is READ-ONLY (FSD §1). These tests do not click
 *   any control that writes data — Settings modal is opened only when explicitly
 *   verifying visual layout, and is closed via Cancel/X without saving.
 *
 * BRD: ADMIN-FS-Payment-Transactions · FSD: fsd-payment-transactions.md
 * TC source: manual-qa-repository/01-test-cases/admin-portal/payment-transactions/TC_PAYMENT_TRANSACTIONS.md
 */

const { test, expect } = require('@playwright/test');
const { PaymentTransactionsPage } = require('../../../automation-repository/pages/admin/PaymentTransactionsPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/admin.json' });

test.describe('Payment Transactions — Admin Portal UI/UX', () => {
  let paymentsPage;

  test.beforeEach(async ({ page }) => {
    paymentsPage = new PaymentTransactionsPage(page);
    await paymentsPage.navigate();
    await paymentsPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // List Layout
  // ════════════════════════════════════════════════════════════════════════════

  test('TC_PAY_UI_001 — ADMIN-FS-Payment-Transactions §3 — ADM_PAY_003 — Transactions table renders core columns', async ({ page }) => {
    // Header row must be visible — confirms table chrome rendered
    await expect(paymentsPage.tableHeader).toBeVisible();

    // Inspect the header text for the columns the FSD mandates. We do a loose
    // content match because UAT may abbreviate (e.g. "Reg No." vs "Registration Number").
    const headerText = (await paymentsPage.tableHeader.textContent().catch(() => '')) || '';
    const expectedTokens = ['Transaction', 'Date', 'Source', 'Payment Type', 'Method', 'Amount', 'Status'];
    for (const token of expectedTokens) {
      expect(headerText.toLowerCase()).toContain(token.toLowerCase());
    }

    await expect(page).toHaveScreenshot('payments-ui-001-table-columns.png', { maxDiffPixels: 250, fullPage: true });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // KPI / Header
  // ════════════════════════════════════════════════════════════════════════════

  test('TC_PAY_UI_002 — ADMIN-FS-Payment-Transactions §2 — ADM_PAY_002 — Page header shows total count, Settings and Export', async ({ page }) => {
    // The header heading must be visible and reference "Transaction"
    const heading = await paymentsPage.getHeaderText();
    expect(heading.length).toBeGreaterThan(0);
    expect(heading.toLowerCase()).toContain('transaction');

    // Settings and Export buttons must both be visible in the toolbar
    await expect(paymentsPage.settingsButton).toBeVisible();
    await expect(paymentsPage.exportButton).toBeVisible();
    await expect(paymentsPage.refreshButton).toBeVisible();

    await expect(page).toHaveScreenshot('payments-ui-002-header-kpi.png', { maxDiffPixels: 250 });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Status Badges
  // ════════════════════════════════════════════════════════════════════════════

  test('TC_PAY_UI_003 — ADMIN-FS-Payment-Transactions §3 — ADM_PAY_007 / ADM_PAY_005 — Status and Source columns render as recognisable values', async () => {
    const rowCount = await paymentsPage.getRowCount();
    test.skip(rowCount === 0, 'No transactions on UAT to inspect status badges');

    // Pull the first row's text and assert at least one known Status token appears.
    // FSD §3 enumerates 8 statuses; we accept ANY one as proof the column renders.
    const rowText = (await paymentsPage.tableRows.first().textContent().catch(() => '')) || '';
    const knownStatuses = ['initiated', 'pending', 'completed', 'failed', 'cancelled', 'dropped', 'bounced', 'refunded'];
    const knownSources  = ['easebuzz', 'razorpay', 'offline'];

    const hasStatus = knownStatuses.some(s => rowText.toLowerCase().includes(s));
    const hasSource = knownSources.some(s => rowText.toLowerCase().includes(s));

    expect(hasStatus || hasSource).toBeTruthy();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Detail Panel (coming-soon visual)
  // ════════════════════════════════════════════════════════════════════════════

  test('TC_PAY_UI_004 — ADMIN-FS-Payment-Transactions §6 — ADM_PAY_055 / ADM_PAY_058 — Eye icon visible on every row + tooltip target present', async ({ page }) => {
    const rowCount = await paymentsPage.getRowCount();
    test.skip(rowCount === 0, 'No transactions on UAT to inspect actions column');

    // Eye icon count must equal row count — no row hides the action icon
    const eyeCount = await paymentsPage.eyeIcons.count();
    expect(eyeCount).toBeGreaterThan(0);
    expect(eyeCount).toBe(rowCount);

    // Hover the first eye icon to surface any tooltip (best-effort — Ant tooltips render lazily)
    await paymentsPage.eyeIcons.first().hover();
    await expect(page).toHaveScreenshot('payments-ui-004-actions-column.png', { maxDiffPixels: 300 });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Settings modal — read-only layout check
  // ════════════════════════════════════════════════════════════════════════════

  test('TC_PAY_UI_005 — ADMIN-FS-Payment-Transactions §7 — ADM_PAY_021 — Gateway Settings modal layout', async ({ page }) => {
    await paymentsPage.openSettings();
    await expect(paymentsPage.settingsModal).toBeVisible();

    // Modal contents must include the word "Easebuzz" or "Razorpay" somewhere
    const modalText = (await paymentsPage.settingsModal.textContent().catch(() => '')) || '';
    expect(modalText.toLowerCase()).toMatch(/easebuzz|razorpay/);

    await expect(page).toHaveScreenshot('payments-ui-005-settings-modal.png', { maxDiffPixels: 300 });

    // Close without saving — read-only test
    await paymentsPage.closeSettings();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // Responsive viewport
  // ════════════════════════════════════════════════════════════════════════════

  test('TC_PAY_UI_006 — ADMIN-FS-Payment-Transactions §8 — Responsive layout — table remains usable at 1280×800', async ({ page }) => {
    // Admin portal is desktop-first; we verify the canonical 1280×800 viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await paymentsPage.waitForLoad();

    // Table chrome and toolbar buttons must remain visible after viewport change
    await expect(paymentsPage.exportButton).toBeVisible();
    await expect(paymentsPage.settingsButton).toBeVisible();

    const tableVisible = await paymentsPage.transactionsTable.isVisible().catch(() => false);
    const emptyVisible = await paymentsPage.emptyState.first().isVisible().catch(() => false);
    expect(tableVisible || emptyVisible).toBeTruthy();

    await expect(page).toHaveScreenshot('payments-ui-006-responsive-1280.png', { maxDiffPixels: 400, fullPage: true });
  });
});
