'use strict';

/**
 * PaymentTransactionsPage.js — Page Object Model for the Admin Portal Payment Transactions module.
 *
 * What this file does:
 *   Wraps every UI interaction on the Payment Transactions page (admin/payment-transactions)
 *   into reusable methods. Tests import this class and call high-level methods like
 *   `filterByStatus('completed')` or `exportCsv()` instead of inlining selectors.
 *
 * How selectors work:
 *   All selectors live in locators/admin/locator-map.json (owned by Tech Lead Agent).
 *   We load that map once and read via `L['key']` bracket access (per spec rule).
 *   Some controls (status / source filter dropdowns, transaction rows, KPIs) are NOT
 *   yet present in the locator map (crawler ran on the auth gate); for those we use
 *   Ant Design generic patterns scoped to the page until the Tech Lead Agent extends
 *   the map. Each fallback locator is documented inline.
 *
 * BRD: ADMIN-FS-Payment-Transactions  ·  FSD: fsd-payment-transactions.md
 * Module is READ-ONLY at admin level (no create/edit/delete). See FSD §1.
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/admin/locator-map.json');

const L = locatorMap['payment-transactions'] || {};

const PAYMENTTRANSACTIONS_URL = 'https://uat-web.xrportal.in/admin/payment-transactions';

class PaymentTransactionsPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = PAYMENTTRANSACTIONS_URL;

    // ── Sidebar / navigation ──────────────────────────────────────────────────
    this.sidebarTransactionsLink = page.locator(L['transactionsLink'].selector);

    // ── Header / toolbar buttons (live in locator map) ────────────────────────
    this.refreshButton  = page.locator(L['refreshButton'].selector);
    this.exportButton   = page.locator(L['exportButton'].selector);
    this.settingsButton = page.locator(L['settingsButton'].selector);
    this.logoutButton   = page.locator(L['logoutButton'].selector);

    // ── Filters / search row (live in locator map) ────────────────────────────
    this.startDateInput      = page.locator(L['startDateInput'].selector);
    this.endDateInput        = page.locator(L['endDateInput'].selector);
    this.searchInput         = page.locator(L['searchByNamePhoneRegistrationNoInput'].selector);
    this.statusOrSourceSelect = page.locator(L['rcSelect0'].selector);   // primary Ant Select on page

    // ── Tabs (live in locator map) ────────────────────────────────────────────
    this.transactionsTab = page.locator(L['rcTabs0TabTransactions'].selector);

    // ── Page structure (Ant Design generic patterns until map is extended) ────
    // Page heading shows total count + module label
    this.pageHeading       = page.locator('h2, h1').filter({ hasText: /Transaction/i }).first();
    // Main data table — Ant Design table inside the active tab pane
    this.transactionsTable = page.locator('.ant-table-container').first();
    this.tableHeader       = page.locator('.ant-table-thead');
    this.tableRows         = page.locator('.ant-table-tbody > tr.ant-table-row');
    this.emptyState        = page.locator('.ant-empty, :text("No transactions found"), :text("No data")');

    // Action eye icon in each row's Actions column
    this.eyeIcons          = page.locator('.ant-table-tbody [aria-label="eye"], .ant-table-tbody .anticon-eye');

    // "Coming soon" toast/notification
    this.comingSoonToast   = page.locator('.ant-message-notice, .ant-notification-notice, :text("coming soon")').first();

    // Pagination
    this.paginationBar           = page.locator('.ant-pagination');
    this.paginationNext          = page.locator('.ant-pagination-next');
    this.paginationPageSizeDropdown = page.locator('.ant-pagination-options .ant-select');

    // Settings (Payment Gateway) modal — Ant Design modal scoped
    this.settingsModal           = page.locator('.ant-modal:visible, .ant-drawer-content:visible').first();
    this.gatewayEasebuzzCheckbox = this.settingsModal.locator('label:has-text("Easebuzz") input[type="checkbox"], :has-text("Easebuzz") >> input[type="checkbox"]').first();
    this.gatewayRazorpayCheckbox = this.settingsModal.locator('label:has-text("Razorpay") input[type="checkbox"], :has-text("Razorpay") >> input[type="checkbox"]').first();
    this.gatewayUpdateButton     = this.settingsModal.locator('button:has-text("Update")');
    this.gatewayCancelButton     = this.settingsModal.locator('button:has-text("Cancel"), button:has-text("Close"), .ant-modal-close');
    this.successToast            = page.locator('.ant-message-success, .ant-notification-success');
    this.errorToast              = page.locator('.ant-message-error, .ant-notification-error');
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    // Wait for either the data table OR the empty state — whichever resolves first.
    await Promise.race([
      this.transactionsTable.first().waitFor({ state: 'visible', timeout: 30_000 }),
      this.emptyState.first().waitFor({ state: 'visible', timeout: 30_000 }),
    ]).catch(() => { /* networkidle below is the safety net */ });
    await this.page.waitForLoadState('networkidle');
  }

  async navigateViaSidebar() {
    await this.click(this.sidebarTransactionsLink.first());
    await this.page.waitForURL(/\/admin\/payment-transactions/);
    await this.waitForLoad();
  }

  async expectOnUrl() {
    await this.page.waitForURL(/\/admin\/payment-transactions/);
  }

  // ── Search & Filter ──────────────────────────────────────────────────────

  async searchByRefNumber(refNumber) {
    await this.fill(this.searchInput, refNumber);
    // Ant Design tables debounce search; wait for table re-render.
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter by Status — opens the Ant Design status dropdown, then selects the option.
   * Valid statuses: initiated | pending | completed | failed | cancelled | dropped | bounced | refunded
   * Returns true if the option was found and selected, false if option missing on UAT.
   */
  async filterByStatus(status) {
    return this._selectFromDropdownByLabel('Status', status);
  }

  /**
   * Filter by Gateway/Source — Online easebuzz | Online razorpay | Offline.
   */
  async filterByGateway(gateway) {
    return this._selectFromDropdownByLabel('Source', gateway);
  }

  /**
   * Filter by Payment Type — Allocation | Milestone | Registration | Offline.
   */
  async filterByPaymentType(type) {
    return this._selectFromDropdownByLabel('Payment Type', type);
  }

  async filterByDateRange(startDate, endDate) {
    await this.fill(this.startDateInput, startDate);
    await this.page.keyboard.press('Enter');
    await this.fill(this.endDateInput, endDate);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async resetFilters() {
    const resetBtn = this.page.locator('button:has-text("Reset"), button:has-text("Clear")').first();
    if (await resetBtn.isVisible().catch(() => false)) {
      await this.click(resetBtn);
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Internal — opens a filter dropdown by its preceding label text and selects an option.
   * Returns true on success, false if option not found.
   */
  async _selectFromDropdownByLabel(labelText, optionText) {
    // Find an Ant Select sibling of the label text — or fall back to the first Ant Select.
    const labelled = this.page.locator(`label:has-text("${labelText}") + * .ant-select, :text("${labelText}") + .ant-select`).first();
    const trigger  = (await labelled.count()) ? labelled : this.statusOrSourceSelect;
    await this.click(trigger);
    const option = this.page.locator(`.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:has-text("${optionText}")`).first();
    const exists = await option.isVisible({ timeout: 4_000 }).catch(() => false);
    if (!exists) {
      // Close the dropdown
      await this.page.keyboard.press('Escape');
      return false;
    }
    await this.click(option);
    await this.page.waitForLoadState('networkidle');
    return true;
  }

  // ── Transaction Row / Detail ─────────────────────────────────────────────

  /**
   * Click eye icon on a given row (0-indexed) — opens the "Detail view coming soon" toast.
   * Detail page is not yet implemented (FSD §2.1 Route 3 returns TODO).
   */
  async openTransactionDetail(rowIndex = 0) {
    await this.eyeIcons.nth(rowIndex).waitFor({ state: 'visible' });
    await this.eyeIcons.nth(rowIndex).click();
  }

  async dismissComingSoon() {
    // Toast auto-dismisses, but accept manual close too
    const closeBtn = this.page.locator('.ant-message-notice .ant-message-close, .ant-notification-notice-close').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  // ── Export ───────────────────────────────────────────────────────────────

  /**
   * Triggers Export and returns the Download object.
   * File is XLSX/CSV with date stamp.
   */
  async exportCsv() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 30_000 }),
      this.click(this.exportButton),
    ]);
    return download;
  }

  async clickRefresh() {
    await this.click(this.refreshButton);
    await this.page.waitForLoadState('networkidle');
  }

  // ── Settings (Payment Gateway) ───────────────────────────────────────────

  async openSettings() {
    await this.click(this.settingsButton);
    await this.settingsModal.waitFor({ state: 'visible' });
  }

  async closeSettings() {
    await this.click(this.gatewayCancelButton.first());
  }

  async toggleGateway(gateway, enable) {
    const cb = gateway.toLowerCase() === 'easebuzz' ? this.gatewayEasebuzzCheckbox : this.gatewayRazorpayCheckbox;
    const checked = await cb.isChecked().catch(() => false);
    if (checked !== enable) {
      await cb.click();
    }
  }

  async clickGatewayUpdate() {
    await this.click(this.gatewayUpdateButton);
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async expectTransactionInTable(text) {
    // Match any cell in any row containing the text
    await this.page.locator(`.ant-table-tbody >> text=${text}`).first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async expectStatusBadge(status) {
    // Status column typically renders text in a tag/badge
    const badge = this.page.locator(`.ant-table-tbody .ant-tag:has-text("${status}"), .ant-table-tbody :text-is("${status}")`).first();
    await badge.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async expectReconciliationStatus(expectedStatus) {
    // Reconciliation column may be Status, Process Status, or Source — accept any row that
    // shows the expected reconciliation label.
    const cell = this.page.locator(`.ant-table-tbody td:has-text("${expectedStatus}")`).first();
    await cell.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async getRowCount() {
    return this.tableRows.count();
  }

  async getHeaderText() {
    return (await this.pageHeading.textContent().catch(() => '') || '').trim();
  }
}

module.exports = { PaymentTransactionsPage };
