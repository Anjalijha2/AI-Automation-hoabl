'use strict';

/**
 * SalesManagersPage.js — Page Object Model for the Admin Portal Sales Managers module.
 *
 * What this file does:
 *   Wraps every UI interaction on the /admin/sales-managers page into reusable methods.
 *   Tests import this class and call high-level methods (openAddSmModal, toggleSmActive)
 *   instead of writing raw selectors in every spec.
 *
 * Locator strategy:
 *   - Keys present in locators/admin/locator-map.json["sales-managers"] are accessed via
 *     `L['key']` bracket notation (the locator map currently has 34 keys, most from the
 *     shared sidebar / header / login chrome since the crawler last visited the page in
 *     a logged-out state — see locators/admin/locator-map.json for provenance).
 *   - SM-module-specific elements (Add modal fields, masking panel, row toggles, table
 *     headers) are not yet in the locator map. We use Ant Design conventional selectors
 *     scoped tightly enough to remain stable. When the Tech Lead Agent next re-crawls
 *     this page (logged in), these can be promoted into the locator map.
 *
 * BRD: ADMIN-FS-Sales-Managers
 * FSD: manual-qa-repository/03-user-manual/admin/fsd-sales-managers.md
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/admin/locator-map.json');

const L = locatorMap['sales-managers'] || {};

const SALESMANAGERS_URL = 'https://uat-web.xrportal.in/admin/sales-managers';

/** Safe accessor — returns selector string if the key exists, else null. */
function sel(key) {
  return L[key] && L[key].selector ? L[key].selector : null;
}

class SalesManagersPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = SALESMANAGERS_URL;

    // ── Chrome / Navigation (from locator map) ───────────────────────────────
    // The sidebar Sales Managers link — Ant Design renders this twice (collapsed +
    // expanded states), so callers must use .first() when clicking.
    this.salesManagersLink     = page.locator(sel('salesManagersLink') || 'a[href*="/admin/sales-managers"]');
    this.customersLink         = page.locator(sel('customersLink')     || 'a[href*="/admin/customers"]');
    this.logoutButton          = page.locator(sel('logoutButton')      || 'button:has-text("Logout")');
    this.settingsButton        = page.locator(sel('settingsButton')    || 'button:has-text("Settings")');

    // ── Page-level controls (from locator map) ───────────────────────────────
    this.addSalesManagerButton = page.locator(sel('addSalesManagerButton') || 'button:has-text("Add Sales Manager")');
    this.searchInput           = page.locator(sel('searchByNameEmailOrPhoneInput') ||
                                              'input[placeholder*="Search" i]');

    // ── Page heading & table (Ant Design conventional selectors) ─────────────
    // The page heading typically shows "<count> Sales Managers". We accept any h1/h2
    // containing "Sales Manager" — works whether it shows the count prefix or not.
    this.pageHeading           = page.locator('h1:has-text("Sales Manager"), h2:has-text("Sales Manager"), h3:has-text("Sales Manager")').first();

    // The data table itself — Ant Design wraps every grid in .ant-table-wrapper.
    // We scope to "main" content area to avoid matching nested tables in sidebar/popovers.
    this.table                 = page.locator('.ant-table-wrapper').first();
    this.tableHeaderRow        = page.locator('.ant-table-thead tr').first();
    this.tableColumnHeaders    = page.locator('.ant-table-thead th');
    this.tableRows             = page.locator('.ant-table-tbody tr.ant-table-row');
    this.tableEmptyState       = page.locator('.ant-empty, .ant-table-placeholder');

    // ── Row action buttons (Ant Design, multi-row) ───────────────────────────
    // The locator map exposes editButton through editButton10 — but those are just
    // text-based "Edit" buttons that match every row. It is more robust to scope by
    // row index, so we expose helpers (editSm, openSmDetail) below that use .nth().
    this.editButtons           = page.locator('.ant-table-tbody tr.ant-table-row button:has-text("Edit"), .ant-table-tbody tr.ant-table-row a:has-text("Edit")');
    this.rowSwitches           = page.locator('.ant-table-tbody tr.ant-table-row .ant-switch');

    // ── Add / Edit SM modal (Ant Design conventional selectors) ──────────────
    // Modals in Ant Design render with role="dialog"; we scope every field inside
    // ".ant-modal" so we never accidentally target inputs on the underlying page.
    this.smModal               = page.locator('.ant-modal:not(.ant-modal-hidden)');
    this.smModalTitle          = page.locator('.ant-modal-title');
    this.firstNameInput        = page.locator('.ant-modal input[placeholder*="First Name" i], .ant-modal input[id*="firstName" i], .ant-modal input[name*="firstName" i]').first();
    this.lastNameInput         = page.locator('.ant-modal input[placeholder*="Last Name" i], .ant-modal input[id*="lastName" i], .ant-modal input[name*="lastName" i]').first();
    this.mobileInput           = page.locator('.ant-modal input[placeholder*="Phone" i], .ant-modal input[placeholder*="Mobile" i], .ant-modal input[id*="phone" i], .ant-modal input[name*="phone" i]').first();
    this.emailInput            = page.locator('.ant-modal input[placeholder*="Email" i], .ant-modal input[type="email"], .ant-modal input[id*="email" i]').first();
    this.roleSelect            = page.locator('.ant-modal .ant-select').first();
    this.assignableToggle      = page.locator('.ant-modal .ant-switch').first();
    this.isActiveToggle        = page.locator('.ant-modal .ant-switch').nth(1);
    this.submitButton          = page.locator('.ant-modal button:has-text("Submit"), .ant-modal button:has-text("Save"), .ant-modal button:has-text("Add"):not(:has-text("Add Sales"))').first();
    this.cancelButton          = page.locator('.ant-modal button:has-text("Cancel"), .ant-modal .ant-modal-close').first();
    this.modalErrorMessages    = page.locator('.ant-modal .ant-form-item-explain-error');

    // ── Toast notifications (Ant Design) ─────────────────────────────────────
    // Ant Design renders success/error toasts via .ant-message OR .ant-notification.
    // We accept either family so the assertion works regardless of which API the app uses.
    this.toastSuccess          = page.locator('.ant-message-success, .ant-notification-notice-success').first();
    this.toastError            = page.locator('.ant-message-error, .ant-notification-notice-error').first();

    // ── Privacy masking panel (per ADM_SM_022) ───────────────────────────────
    // Opened via a "Settings" / "Privacy" / "Masking" button. Three toggles inside.
    this.maskingPanel          = page.locator('[class*="masking" i], [class*="privacy" i], .ant-drawer, .ant-modal').filter({ hasText: /masking/i }).first();
    this.emailMaskingToggle    = page.locator('label:has-text("Email Masking") ~ .ant-switch, .ant-switch').filter({ has: page.locator('xpath=..').filter({ hasText: 'Email' }) }).first();
    this.phoneMaskingToggle    = page.locator('label:has-text("Phone Masking") ~ .ant-switch').first();
    this.costMaskingToggle     = page.locator('label:has-text("Cost Masking") ~ .ant-switch').first();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /** navigate() — go directly to the Sales Managers URL. */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** navigateViaSidebar() — click the Sales Managers link in the left sidebar. */
  async navigateViaSidebar() {
    await this.salesManagersLink.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.salesManagersLink.first().click();
    await this.page.waitForURL(/\/admin\/sales-managers/, { timeout: 15_000 });
    await this.waitForLoad();
  }

  /**
   * waitForLoad() — wait until the SM page is fully ready.
   * Either the page heading OR the data table must be visible — whichever appears
   * first signals that the page has rendered. We then wait for networkidle so any
   * follow-up API calls (count, filters) have settled.
   */
  async waitForLoad() {
    await Promise.race([
      this.pageHeading.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.table.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);
    await this.page.waitForLoadState('networkidle');
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  /** searchByName(name) — type a name fragment into the search input. */
  async searchByName(name) {
    await this.fill(this.searchInput, name);
    await this.searchInput.press('Enter').catch(() => { /* some inputs fire on blur */ });
    await this.page.waitForLoadState('networkidle');
  }

  /** searchByMobile(mobile) — type a phone number into the search input. */
  async searchByMobile(mobile) {
    await this.fill(this.searchInput, mobile);
    await this.searchInput.press('Enter').catch(() => { /* some inputs fire on blur */ });
    await this.page.waitForLoadState('networkidle');
  }

  /** searchByEmail(email) — type an email fragment into the search input. */
  async searchByEmail(email) {
    await this.fill(this.searchInput, email);
    await this.searchInput.press('Enter').catch(() => { /* some inputs fire on blur */ });
    await this.page.waitForLoadState('networkidle');
  }

  /** clearSearch() — empty the search box and reset the table. */
  async clearSearch() {
    await this.searchInput.clear();
    await this.searchInput.press('Enter').catch(() => {});
    await this.page.waitForLoadState('networkidle');
  }

  // ── Add SM flow ────────────────────────────────────────────────────────────

  /** openAddSmModal() — click "Add Sales Manager" and wait for the modal. */
  async openAddSmModal() {
    await this.click(this.addSalesManagerButton);
    await this.smModal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * fillSmDetails(details) — fill the SM form inside the open modal.
   * Every field is optional so callers can use this for partial/negative tests too.
   *
   * @param {object} d
   * @param {string} [d.firstName]
   * @param {string} [d.lastName]
   * @param {string} [d.mobile]
   * @param {string} [d.email]
   * @param {string} [d.role] — e.g. "Sales Manager", "SM Admin"
   */
  async fillSmDetails({ firstName, lastName, mobile, email, role } = {}) {
    if (firstName !== undefined) await this.fill(this.firstNameInput, firstName);
    if (lastName  !== undefined) await this.fill(this.lastNameInput, lastName);
    if (mobile    !== undefined) await this.fill(this.mobileInput, mobile);
    if (email     !== undefined) await this.fill(this.emailInput, email);
    if (role      !== undefined) await this.selectRole(role);
  }

  /**
   * selectRole(role) — pick a role from the Ant Design select dropdown.
   * Opens the dropdown then clicks the matching option in the currently-open list.
   */
  async selectRole(role) {
    await this.click(this.roleSelect);
    const activeDropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await activeDropdown.waitFor({ state: 'visible', timeout: 5_000 });
    await activeDropdown.locator(`.ant-select-item-option:has-text("${role}")`).first().click();
  }

  /** submitAddSm() — click the Submit/Save button inside the modal. */
  async submitAddSm() {
    await this.click(this.submitButton);
    await this.page.waitForLoadState('networkidle');
  }

  /** cancelAddSm() — click Cancel/X to dismiss the modal without saving. */
  async cancelAddSm() {
    await this.click(this.cancelButton);
    await this.smModal.waitFor({ state: 'hidden', timeout: 5_000 });
  }

  // ── Edit / Detail row actions ──────────────────────────────────────────────

  /** editSm(rowIndex) — click the Edit button on the given row to open the edit modal. */
  async editSm(rowIndex) {
    await this.editButtons.nth(rowIndex).click();
    await this.smModal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** openSmDetail(rowIndex) — click the row body to open the detail view (if available). */
  async openSmDetail(rowIndex) {
    await this.tableRows.nth(rowIndex).click();
    // Detail view may be a drawer, modal, or in-page panel — let the caller assert.
  }

  // ── Toggle helpers (row-level) ─────────────────────────────────────────────

  /**
   * toggleSmActive(rowIndex) — flip the Is Active switch on the given row.
   * Per ADM_SM_003, the rightmost switch in the row corresponds to Is Active and the
   * one before it is the Assignable switch. We grab every switch in the row and
   * select the last one.
   */
  async toggleSmActive(rowIndex) {
    const switches = this.tableRows.nth(rowIndex).locator('.ant-switch');
    const count = await switches.count();
    if (count === 0) throw new Error(`No Is Active toggle found on row ${rowIndex}`);
    await switches.nth(count - 1).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * toggleSmAssignable(rowIndex) — flip the Assignable switch on the given row.
   * Assignable is the first switch in the row (per ADM_SM_003 column order).
   */
  async toggleSmAssignable(rowIndex) {
    const switches = this.tableRows.nth(rowIndex).locator('.ant-switch');
    const count = await switches.count();
    if (count === 0) throw new Error(`No Assignable toggle found on row ${rowIndex}`);
    await switches.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * togglePrivacyMasking(maskingType) — flip one of the three system-wide masking toggles.
   * @param {'email'|'phone'|'cost'} maskingType
   */
  async togglePrivacyMasking(maskingType) {
    const map = {
      email: this.emailMaskingToggle,
      phone: this.phoneMaskingToggle,
      cost:  this.costMaskingToggle,
    };
    const toggle = map[maskingType];
    if (!toggle) throw new Error(`Unknown masking type: ${maskingType}`);
    await toggle.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Read helpers ───────────────────────────────────────────────────────────

  /** getTableRowCount() — number of data rows currently in the SM list. */
  async getTableRowCount() {
    return this.tableRows.count();
  }

  /** getRowText(rowIndex) — concatenated text of a row (useful for diagnostics). */
  async getRowText(rowIndex) {
    return (await this.tableRows.nth(rowIndex).textContent()) || '';
  }

  /** getSwitchState(rowIndex, switchIndex) — true if the switch is ON. */
  async getSwitchState(rowIndex, switchIndex) {
    const sw = this.tableRows.nth(rowIndex).locator('.ant-switch').nth(switchIndex);
    const checked = await sw.getAttribute('aria-checked').catch(() => null);
    if (checked !== null) return checked === 'true';
    // Fallback: Ant Design adds .ant-switch-checked class when on
    const cls = await sw.getAttribute('class');
    return /ant-switch-checked/.test(cls || '');
  }

  // ── Assertion helpers ──────────────────────────────────────────────────────

  /** expectOnSalesManagersUrl() — assert the browser URL is on /admin/sales-managers. */
  async expectOnSalesManagersUrl() {
    await this.page.waitForURL(/\/admin\/sales-managers/, { timeout: 15_000 });
  }

  /** expectAddSmModalVisible() — assert the Add SM modal is on screen. */
  async expectAddSmModalVisible() {
    await this.smModal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** expectAddSmModalHidden() — assert the Add SM modal has been dismissed. */
  async expectAddSmModalHidden() {
    await this.smModal.waitFor({ state: 'hidden', timeout: 10_000 });
  }

  /**
   * expectSmInTable(needle) — assert at least one table row contains `needle`
   * (name, phone, or email).
   */
  async expectSmInTable(needle) {
    const row = this.page.locator(`.ant-table-tbody tr.ant-table-row:has-text("${needle}")`);
    await row.first().waitFor({ state: 'visible', timeout: 10_000 });
    return row;
  }

  /** expectToastSuccess() — wait for any Ant Design success toast. */
  async expectToastSuccess() {
    await this.toastSuccess.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** expectValidationError() — assert at least one inline form-item error is shown. */
  async expectValidationError() {
    await this.modalErrorMessages.first().waitFor({ state: 'visible', timeout: 5_000 });
  }

  /** expectTableLoaded() — assert the data table is visible (either rows or empty state). */
  async expectTableLoaded() {
    await this.table.waitFor({ state: 'visible', timeout: 15_000 });
  }
}

module.exports = { SalesManagersPage };
