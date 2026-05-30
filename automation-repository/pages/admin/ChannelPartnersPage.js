'use strict';

/**
 * ChannelPartnersPage.js — Page Object Model for Admin Portal Channel Partners module.
 *
 * What this file does:
 *   Wraps every UI interaction on /admin/channel-partners into reusable JS methods so
 *   tests read like business steps ("searchByMobile", "openCpDetailDrawer") rather
 *   than raw selectors. The admin Channel Partners page is a read-only view of the
 *   CP network with two mutating actions: "Mark as Master" (per-row) and "Map Master
 *   CP" (bulk via checkbox + modal).
 *
 * How selectors work:
 *   Locators live in locators/admin/locator-map.json under the "channel-partners" key.
 *   We use bracket-access L['key'] to stay consistent with the scaffolded layout and
 *   to handle keys that start with a digit (e.g. "2709ChannelPartnersHeading").
 *   Each L['key'].selector is consumed via page.locator(...) at construction time.
 *
 * BRD reference: ADMIN-FS-Channel-Partners §1-§3
 * FSD reference: manual-qa-repository/03-user-manual/admin/fsd-channel-partners.md
 *
 * Source-verified facts (from TC_CHANNEL_PARTNERS.md FSD-CORRECTION block):
 *   - CP types derived purely from DB columns: Master (isLeadCp=true),
 *     Member (leadCpId NOT NULL), Standalone (else).
 *   - No admin endpoints exist for create/approve/activate/deactivate/delete CP.
 *   - No SMS/Email/WhatsApp dispatched on any admin CP action.
 *   - Mutating endpoints: POST /api/v1/admin/cp/mark-master,
 *     POST /api/v1/admin/cp/map-master, POST /api/v1/admin/cp/bulk-map-excel (field=doc).
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/admin/locator-map.json');

const L = locatorMap['channel-partners'] || {};

const CHANNELPARTNERS_URL = 'https://uat-web.xrportal.in/admin/channel-partners';

class ChannelPartnersPage extends BasePage {
  constructor(page) {
    super(page);
    this.L   = L;
    this.url = CHANNELPARTNERS_URL;

    // ── Header / page-level locators ──────────────────────────────────────────
    // pageHeading — top-of-page title "N Channel Partners" (count is FIXED per FSD §1
    //               — it is the unfiltered table total and must not change when
    //               filters are applied). Used as the "page-ready" signal.
    this.pageHeading           = page.locator(L['2709ChannelPartnersHeading'] && L['2709ChannelPartnersHeading'].selector);

    // ── Header action buttons (top right of page) ─────────────────────────────
    // mapMasterCPButton — opens the "Map CPs to Master" modal. Disabled by default;
    //                     becomes enabled once at least one Member CP row checkbox
    //                     is ticked. Label includes a count, e.g. "Map Master CP (3)".
    // resetFiltersButton — clears every active search / column filter and reloads
    //                      the unfiltered list. Always visible (unlike Customers).
    // refreshButton — re-fetches the current (filtered) data; preserves filters.
    this.mapMasterCPButton     = page.locator(L['mapMasterCP0Button'] && L['mapMasterCP0Button'].selector);
    this.resetFiltersButton    = page.locator(L['resetFiltersButton'] && L['resetFiltersButton'].selector);
    this.refreshButton         = page.locator(L['refreshButton'] && L['refreshButton'].selector);

    // ── Search & filter inputs ────────────────────────────────────────────────
    // searchByPhoneInput — top-of-table "Search by Phone" input. Server-side filter,
    //                      narrows the table without changing the header count.
    this.searchByPhoneInput    = page.locator(L['searchByPhoneInput'] && L['searchByPhoneInput'].selector);

    // ── Selection (checkboxes) ────────────────────────────────────────────────
    // selectAllCheckbox — header checkbox (toggles every visible row).
    // rowCheckboxes — every row-level checkbox. Use .nth(i) for row i.
    //                 We use the first()/scoped locator pattern in helper methods to
    //                 avoid the header checkbox being counted as a row checkbox.
    this.selectAllCheckbox     = page.locator(L['selectAll'] && L['selectAll'].selector);
    this.rowCheckboxes         = page.locator(L['checkboxInput'] && L['checkboxInput'].selector);

    // ── Row-level action triggers ─────────────────────────────────────────────
    // rowActionButtons — per-row eye-icon / three-dot-menu buttons. The live DOM
    //                    crawl exposed them all under class .cp-row-action; we use
    //                    .nth(rowIndex * 2) for the eye and .nth(rowIndex * 2 + 1)
    //                    for the three-dot menu (verified via crawl ordering).
    this.rowActionButtons      = page.locator(L['cpRowAction'] && L['cpRowAction'].selector);

    // ── Sidebar navigation links (used by nav tests) ──────────────────────────
    this.channelPartnersLink   = page.locator(L['channelPartnersLink'] && L['channelPartnersLink'].selector);
    this.customersLink         = page.locator(L['customersLink'] && L['customersLink'].selector);

    // ── Master HV Code combobox (Map modal) ───────────────────────────────────
    // The rc_select_0 ID is what Ant Design assigns to the first combobox on the
    // page. In the modal context this is the Master HV Code picker.
    this.masterHvCodeSelect    = page.locator(L['rcSelect0'] && L['rcSelect0'].selector);

    // ── Auth fallback locators (for re-auth redirect detection) ───────────────
    // If the admin session expires mid-test, the page redirects to ADMIN LOGIN.
    // Tests can call expectAuthenticated() to fail fast in that scenario.
    this.adminLoginHeading     = page.locator(L['aDMINLOGINHeading'] && L['aDMINLOGINHeading'].selector);
    this.logoutButton          = page.locator(L['logoutButton'] && L['logoutButton'].selector);

    // ── Composed locators built from raw DOM (not in locator-map) ─────────────
    // These rely on Ant Design table structure (tr.ant-table-row) which is stable
    // across the entire admin portal. Composed locators are acceptable here
    // because they describe table semantics, not individual UI strings.
    this.tableRows             = page.locator('tr.ant-table-row');
    this.tableHeaderCells      = page.locator('thead.ant-table-thead th');
    this.activeDropdown        = page.locator('.ant-dropdown:not(.ant-dropdown-hidden)');
    this.activeSelectDropdown  = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    this.detailDrawer          = page.locator('.ant-drawer-open .ant-drawer-content, .ant-drawer:not(.ant-drawer-hidden) .ant-drawer-content').first();
    this.detailDrawerClose     = page.locator('.ant-drawer-open .ant-drawer-close, .ant-drawer:not(.ant-drawer-hidden) .ant-drawer-close').first();
    this.mapModal              = page.locator('.ant-modal-content:has-text("Map"), .ant-modal-content:has-text("Master")').first();
    this.mapModalConfirm       = page.locator('.ant-modal-content button:has-text("Confirm"), .ant-modal-content button:has-text("Submit"), .ant-modal-content button:has-text("Map")').first();
    this.mapModalClose         = page.locator('.ant-modal-content .ant-modal-close').first();
    this.emptyState            = page.locator('.ant-empty, .ant-table-placeholder');
    this.toastSuccess          = page.locator('.ant-message-success, .ant-notification-notice-success');
    this.validationError       = page.locator('.ant-form-item-explain-error, .ant-message-error, .ant-notification-notice-error');
    this.paginationNext        = page.locator('.ant-pagination-next');
    this.paginationPrev        = page.locator('.ant-pagination-prev');
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  /**
   * navigate() — go directly to the Channel Partners URL.
   * Called in beforeEach so each test starts on a clean, unfiltered list.
   */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * navigateViaSidebar() — click the sidebar link instead of hitting the URL.
   * Used to verify the sidebar entry resolves to /admin/channel-partners.
   * Calls .first() because Ant Design renders duplicate <a> tags for the
   * collapsed and expanded sidebar states.
   */
  async navigateViaSidebar() {
    await this.channelPartnersLink.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.channelPartnersLink.first().click();
    await this.page.waitForURL(/\/admin\/channel-partners/, { timeout: 15_000 });
    await this.waitForLoad();
  }

  /**
   * waitForLoad() — block until the CP page is fully ready.
   * The "N Channel Partners" heading is the FSD-defined readiness signal.
   * If the heading is absent (selector text drift), we fall back to networkidle
   * so tests don't hang on a stale selector — but they will still fail on the
   * subsequent expectVisible() assertion which is more diagnostic.
   */
  async waitForLoad() {
    await this.pageHeading.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => { /* fallback to networkidle below */ });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * expectAuthenticated() — assert we are NOT on the admin login page.
   * If session expired, the URL redirects and the ADMIN LOGIN heading appears.
   * Call this when a test fails unexpectedly to distinguish auth issues from
   * actual feature regressions.
   */
  async expectAuthenticated() {
    const onLogin = await this.adminLoginHeading.isVisible().catch(() => false);
    if (onLogin) {
      throw new Error('Admin session expired — re-run `npm run auth:setup`');
    }
  }

  // ── Header reading ──────────────────────────────────────────────────────────

  /**
   * getHeaderTotal() — read the "N Channel Partners" count from the page heading.
   *
   * Per FSD §1 this number is FIXED — it represents the unfiltered total and
   * does not change when search / column filters are applied. We use this in
   * regression tests to confirm the count is stable across filter operations.
   *
   * @returns {Promise<number|null>}
   */
  async getHeaderTotal() {
    await this.pageHeading.waitFor({ state: 'visible' });
    const txt = await this.pageHeading.textContent();
    const m   = (txt || '').match(/(\d[\d,]*)\s+Channel Partners/i);
    return m ? Number(m[1].replace(/,/g, '')) : null;
  }

  // ── List / table reading ────────────────────────────────────────────────────

  /**
   * getCpList() — return an array of objects describing each visible row.
   * Each item contains { ownerName, phone, cpType } parsed from the row's text.
   * This is a best-effort parser; cells without a recognisable value yield ''.
   *
   * Why best-effort: UAT table columns can be re-ordered or relabelled over time,
   * so we read column text by column index rather than by labelled selector and
   * skip rows with too few cells.
   *
   * @returns {Promise<Array<{ownerName:string, phone:string, cpType:string}>>}
   */
  async getCpList() {
    const count = await this.tableRows.count();
    const rows  = [];
    for (let i = 0; i < count; i++) {
      const row   = this.tableRows.nth(i);
      const cells = row.locator('td');
      const cellCount = await cells.count();
      if (cellCount < 9) continue;
      // Column ordering per FSD §1: [checkbox, Owner Name, Firm Name, HV Code,
      //   Master HV Code, Business Region, Pincode, Phone, CP Type, ...]
      const ownerName = (await cells.nth(1).textContent() || '').trim();
      const phone     = (await cells.nth(7).textContent() || '').trim();
      const cpType    = (await cells.nth(8).textContent() || '').trim();
      rows.push({ ownerName, phone, cpType });
    }
    return rows;
  }

  /**
   * getRowCount() — count of currently-visible data rows in the table.
   * Distinct from getHeaderTotal() which always shows the unfiltered total.
   */
  async getRowCount() {
    return this.tableRows.count();
  }

  // ── Search ──────────────────────────────────────────────────────────────────

  /**
   * searchByMobile(phone) — type a mobile number into the top-of-table search
   * box and wait for the network to settle. Some inputs filter on Enter, others
   * on blur — we press Enter for safety and swallow the error if the input
   * variant doesn't support keyboard submit.
   *
   * Per FSD §1 this is server-side. The header total must NOT change after
   * applying the search (only the row list narrows).
   */
  async searchByMobile(phone) {
    await this.fill(this.searchByPhoneInput, phone);
    await this.searchByPhoneInput.press('Enter').catch(() => { /* some inputs fire on blur */ });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * searchByName(name) — open the Owner Name column-search dropdown via the
   * magnifying-glass icon and submit the search.
   *
   * Ant Design renders a per-column search popover with an input + Search button.
   * The popover is scoped to "the active (visible) dropdown" so we don't pick
   * up hidden popovers from previous column clicks.
   */
  async searchByName(name) {
    const ownerNameTh = this.page.locator('th').filter({ hasText: 'Owner Name' });
    await ownerNameTh.locator('.ant-table-filter-trigger').first().click();
    const dd = this.activeDropdown;
    await dd.waitFor({ state: 'visible', timeout: 5_000 });
    await dd.locator('input').first().fill(name);
    await dd.locator('button:has-text("Search"), button:has-text("OK")').first().click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Column filters ──────────────────────────────────────────────────────────

  /**
   * filterByStatus(value) — apply the CP Type column filter (e.g. "Master CP",
   * "Member CP"). Despite the name, this targets CP Type — chosen because the
   * spec keyword "status" maps to the visible CP Type column on this page.
   *
   * Steps:
   *   1. Click the funnel icon on the CP Type column header.
   *   2. Pick the desired option from the dropdown menu.
   *   3. Click OK to apply.
   */
  async filterByStatus(value) {
    const cpTypeTh = this.page.locator('th').filter({ hasText: 'CP Type' });
    await cpTypeTh.locator('.ant-table-filter-trigger').first().click();
    const dd = this.activeDropdown;
    await dd.waitFor({ state: 'visible', timeout: 5_000 });
    await dd.locator(`[role='menuitem']:has-text("${value}"), .ant-dropdown-menu-item:has-text("${value}")`).first().click();
    await dd.locator('button:has-text("OK")').first().click().catch(() => { /* some variants apply on click */ });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * filterByMaster(masterValue) — apply the Master HV Code column filter.
   * Same dropdown pattern as filterByStatus but on the Master HV Code header.
   */
  async filterByMaster(masterValue) {
    const masterTh = this.page.locator('th').filter({ hasText: 'Master HV Code' });
    await masterTh.locator('.ant-table-filter-trigger').first().click();
    const dd = this.activeDropdown;
    await dd.waitFor({ state: 'visible', timeout: 5_000 });
    await dd.locator(`[role='menuitem']:has-text("${masterValue}"), .ant-dropdown-menu-item:has-text("${masterValue}")`).first().click();
    await dd.locator('button:has-text("OK")').first().click().catch(() => {});
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * resetFilters() — click "Reset Filters" and wait for the unfiltered list to
   * reload. Two networkidle passes handle the same race as Customers: filter
   * clear + data reload fire as two sequential API calls.
   */
  async resetFilters() {
    await this.click(this.resetFiltersButton);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * clickRefresh() — re-fetch the current view. Filters are preserved per FSD §1.
   */
  async clickRefresh() {
    await this.click(this.refreshButton);
    await this.page.waitForLoadState('networkidle');
  }

  // ── Detail drawer ───────────────────────────────────────────────────────────

  /**
   * openCpDetailDrawer(rowIndex) — open the side drawer for the row at index N.
   *
   * The eye icon is the first .cp-row-action button per row (the three-dot menu
   * is the second). We use the row scope rather than .nth(rowIndex * 2) because
   * not every row has both icons rendered identically.
   */
  async openCpDetailDrawer(rowIndex) {
    const row = this.tableRows.nth(rowIndex);
    await row.waitFor({ state: 'visible' });
    await row.locator('.cp-row-action, button.cp-row-action').first().click();
    await this.detailDrawer.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * closeCpDetailDrawer() — close the open drawer via the X button.
   * Hidden-state wait confirms the drawer animation finished, so the next test
   * step isn't operating on a still-visible-but-closing element.
   */
  async closeCpDetailDrawer() {
    await this.detailDrawerClose.click();
    await this.detailDrawer.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ── Mark as Master (single row, per-row action) ─────────────────────────────

  /**
   * markAsMaster(rowIndex) — open the three-dot menu for row N and click
   * "Mark as Master". Used to promote a Member CP to Master.
   *
   * DESTRUCTIVE: changes isLeadCp=true for that user row server-side.
   * Tests calling this method MUST be guarded by ENV+ALLOW_DESTRUCTIVE.
   */
  async markAsMaster(rowIndex) {
    const row = this.tableRows.nth(rowIndex);
    await row.waitFor({ state: 'visible' });
    // Three-dot menu is the second action button on the row
    await row.locator('.cp-row-action, button.cp-row-action').nth(1).click();
    const dd = this.activeDropdown;
    await dd.waitFor({ state: 'visible', timeout: 5_000 });
    await dd.locator(':text("Mark as Master")').first().click();
    // Some variants pop a confirm modal; click Confirm if present
    const confirmBtn = this.page.locator('.ant-modal-content button:has-text("Confirm"), .ant-modal-content button:has-text("Yes")').first();
    await confirmBtn.click({ timeout: 3_000 }).catch(() => { /* no confirm modal — direct mutation */ });
    await this.page.waitForLoadState('networkidle');
  }

  // ── Map to Master (bulk action via checkboxes + modal) ──────────────────────

  /**
   * selectRow(rowIndex) — tick the checkbox in the data row at index N.
   *
   * Why .first() on the input: the row's td may render a wrapper <span> around
   * the checkbox; .first() picks the actual <input type=checkbox>.
   */
  async selectRow(rowIndex) {
    const row = this.tableRows.nth(rowIndex);
    await row.locator('input[type="checkbox"]').first().check();
  }

  /**
   * deselectRow(rowIndex) — untick the checkbox in row N.
   * Mirror of selectRow(); used by ADM_CP_050.
   */
  async deselectRow(rowIndex) {
    const row = this.tableRows.nth(rowIndex);
    await row.locator('input[type="checkbox"]').first().uncheck();
  }

  /**
   * mapToMaster(masterLabel) — bulk-map currently-selected rows to a Master CP.
   *
   * Pre-condition: at least one Member CP row checkbox is checked, which makes
   * the "Map Master CP" header button clickable.
   *
   * Steps:
   *   1. Click "Map Master CP" to open the modal.
   *   2. Open the Master HV Code combobox.
   *   3. Pick the option whose label matches `masterLabel`.
   *   4. Click Confirm.
   *
   * DESTRUCTIVE: writes leadCpId on the selected user rows. Guard with
   * ENV+ALLOW_DESTRUCTIVE.
   *
   * @param {string} masterLabel — visible text of the Master to pick
   *                               (HV Code or owner name as shown in dropdown)
   */
  async mapToMaster(masterLabel) {
    await this.click(this.mapMasterCPButton);
    await this.mapModal.waitFor({ state: 'visible', timeout: 10_000 });
    await this.click(this.masterHvCodeSelect);
    const dd = this.activeSelectDropdown;
    await dd.waitFor({ state: 'visible', timeout: 5_000 });
    await dd.locator(`.ant-select-item-option:has-text("${masterLabel}")`).first().click();
    await this.click(this.mapModalConfirm);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * openMapModalWithoutMaster() — open the map modal but do NOT pick a Master.
   * Used by validation tests to assert the form rejects empty submissions.
   */
  async openMapModalWithoutMaster() {
    await this.click(this.mapMasterCPButton);
    await this.mapModal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * submitMapModalRaw() — click Confirm in the modal without selecting anything.
   * Returns nothing; caller asserts validation error or button-disabled state.
   */
  async submitMapModalRaw() {
    await this.mapModalConfirm.click().catch(() => { /* button may be disabled */ });
  }

  /** closeMapModal() — close the Map modal without confirming. */
  async closeMapModal() {
    await this.mapModalClose.click();
    await this.mapModal.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ── Read-back helpers (per-row CP type / status) ───────────────────────────

  /**
   * getCpStatus(rowIndex) — read the CP Type column for row N.
   * Returns "Master CP" or "Member CP" (or '' if cell missing).
   * Used by integration tests that assert Mark-as-Master flipped the value.
   */
  async getCpStatus(rowIndex) {
    const row = this.tableRows.nth(rowIndex);
    const cells = row.locator('td');
    const cnt = await cells.count();
    if (cnt < 9) return '';
    return (await cells.nth(8).textContent() || '').trim();
  }

  // ── Assertion helpers ──────────────────────────────────────────────────────

  /**
   * expectCpInTable(matcher) — assert a row containing `matcher` (phone, name,
   * or HV code) is visible. Returns the matching row locator for chained checks.
   */
  async expectCpInTable(matcher) {
    const row = this.page.locator(`tr.ant-table-row:has-text("${matcher}")`);
    await row.first().waitFor({ state: 'visible', timeout: 10_000 });
    return row;
  }

  /**
   * expectEmptyState() — assert the "No data" placeholder is visible. Used for
   * negative search tests (ADM_CP_040).
   */
  async expectEmptyState() {
    await this.emptyState.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * expectValidationError(textPattern) — assert a validation / error message is
   * visible somewhere on the page. Useful for VAL tests (ADM_CP_036) and NEG
   * cases like Mapping a Master under another Master (ADM_CP_049).
   *
   * @param {RegExp|string} [textPattern] — optional pattern to match the error
   *                                        text (case-insensitive when string)
   */
  async expectValidationError(textPattern) {
    await this.validationError.first().waitFor({ state: 'visible', timeout: 10_000 });
    if (textPattern) {
      const txt = (await this.validationError.first().textContent() || '').trim();
      if (textPattern instanceof RegExp) {
        if (!textPattern.test(txt)) {
          throw new Error(`Validation error text "${txt}" did not match ${textPattern}`);
        }
      } else if (!txt.toLowerCase().includes(String(textPattern).toLowerCase())) {
        throw new Error(`Validation error text "${txt}" did not include "${textPattern}"`);
      }
    }
  }

  /**
   * expectToastSuccess() — assert a green success toast is visible.
   * Used after Mark-as-Master and Map-to-Master flows.
   */
  async expectToastSuccess() {
    await this.toastSuccess.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * expectOnCpUrl() — assert the URL is /admin/channel-partners.
   * Used after sidebar navigation tests.
   */
  async expectOnCpUrl() {
    await this.page.waitForURL(/\/admin\/channel-partners/, { timeout: 15_000 });
  }

  /**
   * expectMapButtonDisabled() — assert the "Map Master CP" header button is
   * disabled (no rows selected). Per FSD §1 this is the default state.
   */
  async expectMapButtonDisabled() {
    const disabled = await this.mapMasterCPButton.isDisabled().catch(() => false);
    if (!disabled) {
      // Some variants use aria-disabled instead of the `disabled` attribute
      const aria = await this.mapMasterCPButton.getAttribute('aria-disabled');
      if (aria !== 'true') {
        throw new Error('Map Master CP button is enabled, expected disabled');
      }
    }
  }

  /**
   * expectMapButtonEnabled() — assert the "Map Master CP" header button is
   * enabled (at least one row selected).
   */
  async expectMapButtonEnabled() {
    const disabled = await this.mapMasterCPButton.isDisabled().catch(() => true);
    if (disabled) {
      const aria = await this.mapMasterCPButton.getAttribute('aria-disabled');
      if (aria === 'true') {
        throw new Error('Map Master CP button is disabled, expected enabled');
      }
    }
  }
}

module.exports = { ChannelPartnersPage };
