'use strict';

/**
 * CustomersPage.js — Page Object Model for the Admin Portal Customers module.
 *
 * What this file does:
 *   This file is a "Page Object" — it wraps every UI interaction on the Customers page
 *   into reusable JavaScript methods. Tests import this class and call methods like
 *   `applyStatusFilter('Cancelled')` instead of writing raw Playwright selectors
 *   in every test. That keeps tests readable and easy to fix when the UI changes.
 *
 * How selectors work:
 *   All CSS selectors live in locators/admin/locator-map.json (owned by the Tech Lead Agent).
 *   We load that file once (`const C = locatorMap.customers`) and every `page.locator()`
 *   call here reads from `C.<key>.selector`. This means if a selector changes on the live
 *   site, only the JSON needs updating — no test code changes needed.
 *
 * BRD: .claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Customers.md
 * FRD: .claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FRD-Customers.md
 */

const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/admin/locator-map.json');

// Shorthand so we write C.someKey.selector instead of locatorMap.customers.someKey.selector
const C = locatorMap.customers;

// The full URL of the Customers page on UAT
const CUSTOMERS_URL = 'https://uat-web.xrportal.in/admin/customers';

class CustomersPage extends BasePage {
  /**
   * constructor — called once per test via `new CustomersPage(page)` in beforeEach.
   *
   * Every `this.xxx = page.locator(...)` line below creates a "locator" — a lazy
   * reference to a DOM element. The element is not looked up until the locator is
   * actually used (e.g., `.click()`, `.waitFor()`, `.isVisible()`). This is safe
   * because Playwright's locators are evaluated fresh every time they are used,
   * so stale-element errors don't occur.
   */
  constructor(page) {
    super(page);

    // ── Sidebar navigation link ───────────────────────────────────────────────
    // The Customers link in the left-hand menu. Note: Ant Design menus render
    // duplicate <a> tags (one for collapsed, one for expanded state), so we
    // always call .first() when clicking this locator.
    this.sidebarCustomersLink = page.locator(C.sidebarCustomersLink.selector);

    // The main page heading (e.g. "9673 Registration Records")
    this.pageHeading          = page.locator(C.pageHeading.selector);

    // ── KPI summary cards at the top of the page ──────────────────────────────
    // Each card shows a count for that registration category.
    // Selectors use :has-text() to match the card by its label text.
    this.kpiRegistered    = page.locator(C.kpiCardRegistered.selector);
    this.kpiInactive      = page.locator(C.kpiCardInactive.selector);
    this.kpiCancelled     = page.locator(C.kpiCardCancelled.selector);
    this.kpiKycPending    = page.locator(C.kpiCardKycPending.selector);
    this.kpiConfirmed     = page.locator(C.kpiCardConfirmed.selector);
    this.kpiActiveTowers  = page.locator(C.kpiCardActiveTowers.selector);

    // ── Registration data table ───────────────────────────────────────────────
    // tableRecordsHeading: the "9673 Registration Records" heading above the table.
    //   Used as the "page is ready" signal in waitForLoad().
    // tableRows: every data row (excludes the header row). Use .nth(0) for first row.
    this.tableRecordsHeading = page.locator(C.tableRecordsHeading.selector);
    this.registrationTable   = page.locator(C.registrationTable.selector);
    this.tableRows           = page.locator(C.tableRow.selector);
    this.tableHeaderRow      = page.locator(C.tableHeaderRow.selector);

    // ── Column header locators ────────────────────────────────────────────────
    // These are used in UI/UX tests to assert column headers are visible and correct.
    this.colRegistrationNumber  = page.locator(C.colRegistrationNumber.selector);
    this.colStatus              = page.locator(C.colStatus.selector);
    this.colProcessStatus       = page.locator(C.colProcessStatus.selector);
    this.colHomeLoan            = page.locator(C.colHomeLoan.selector);
    this.colAllottedUnit        = page.locator(C.colAllottedUnit.selector);
    this.colConfirmationNumber  = page.locator(C.colConfirmationNumber.selector).first();
    this.colGrowthPartner       = page.locator(C.colGrowthPartner.selector);
    this.colPhone               = page.locator(C.colPhone.selector);
    this.colActions             = page.locator(C.colActions.selector);

    // ── Toolbar controls ──────────────────────────────────────────────────────
    // filterButton:       opens the inline column-search row (custom control, not
    //                     the Ant Design column header filter icons).
    // resetFiltersButton: replaces "Filter" when the filter panel is open. Clicking
    //                     it clears all active filters and closes the panel.
    // downloadButton:     triggers an Excel export download (RegistrationData.xlsx).
    // refreshButton:      reloads table data without navigating away.
    this.searchByPhoneInput     = page.locator(C.searchByPhoneInput.selector);
    this.filterButton           = page.locator(C.filterButton.selector);
    this.refreshButton          = page.locator(C.refreshButton.selector);
    this.downloadButton         = page.locator(C.downloadButton.selector).first();
    this.cancelBulkUnitsButton  = page.locator(C.cancelBulkUnitsButton.selector);
    this.resetFiltersButton     = page.locator(C.resetFiltersButton.selector);

    // ── Ant Design filter dropdowns (inside column headers) ───────────────────
    // These appear when you click the funnel icon in a column header.
    // filterOkButton / filterResetButton are scoped to the ACTIVE (visible) dropdown
    // so they don't accidentally target a hidden dropdown leftover from a previous step.
    this.allocationStatusFilter = page.locator(C.allocationStatusFilterDropdown.selector);
    this.processStatusFilter    = page.locator(C.processStatusFilterDropdown.selector);
    this.filterOkButton         = page.locator(C.filterOkButton.selector);
    this.filterResetButton      = page.locator(C.filterResetButton.selector);

    // ── Per-row action elements ───────────────────────────────────────────────
    // rowTrashIcon:             the delete (trash) icon on each row. Use .nth(n) to
    //                           target row n.  Class is `copy-icon` in the live DOM.
    // rowThreeDotMenu:          the "⋯" overflow menu button on each row. Opens a
    //                           dropdown with actions like "Home Loan Approval".
    // homeLoanApprovalMenuItem: the "Home Loan Approval" option inside the three-dot
    //                           dropdown.
    this.rowTrashIcon            = page.locator(C.rowTrashIcon.selector);
    this.rowThreeDotMenu         = page.locator(C.rowThreeDotMenu.selector);
    this.homeLoanApprovalMenuItem = page.locator(C.homeLoanApprovalMenuItem.selector);

    // ── Cancel Registration modal ─────────────────────────────────────────────
    // Appears after clicking the trash icon. Shows the refund amount (₹999)
    // and asks for confirmation before cancelling the registration.
    this.cancelModal             = page.locator(C.cancelRegistrationModal.selector);
    this.cancelModalTitle        = page.locator(C.cancelRegistrationModalTitle.selector);
    this.cancelModalRefundText   = page.locator(C.cancelRegistrationModalRefundText.selector);
    this.cancelModalConfirmBtn   = page.locator(C.cancelRegistrationConfirmBtn.selector);
    this.cancelModalCloseBtn     = page.locator(C.cancelRegistrationCloseBtn.selector);

    // ── Home Loan Approval modal ──────────────────────────────────────────────
    // Opened via the three-dot menu → "Home Loan Approval".
    // Contains a toggle switch (approve/reject) and a submit button.
    // Submit button uses custom class `btn-book-solid` (not the standard Ant Design
    // `ant-btn-primary`) — confirmed via live DOM inspection.
    this.homeLoanModal           = page.locator(C.homeLoanApprovalModal.selector);
    this.homeLoanToggle          = page.locator(C.homeLoanApprovalToggle.selector);
    this.homeLoanSubmitBtn       = page.locator(C.homeLoanApprovalSubmitBtn.selector);

    // ── Toast notifications ───────────────────────────────────────────────────
    // toastSuccess:       generic success toast (green, top-right).
    // toastRefundSuccess: specific toast that confirms the ₹999 refund was processed
    //                     after a registration is cancelled.
    this.toastSuccess            = page.locator(C.toastSuccess.selector);
    this.toastRefundSuccess      = page.locator(C.toastRefundSuccess.selector);

    // ── Pagination bar ────────────────────────────────────────────────────────
    // The Ant Design pagination row at the bottom of the table.
    // paginationTotalText: shows "Total X items" — useful for count assertions.
    this.paginationBar              = page.locator(C.paginationBar.selector);
    this.paginationPageSizeDropdown = page.locator(C.paginationPageSizeDropdown.selector);
    this.paginationPrevBtn          = page.locator(C.paginationPrevBtn.selector);
    this.paginationNextBtn          = page.locator(C.paginationNextBtn.selector);
    this.paginationTotalText        = page.locator(C.paginationTotalText.selector);

    // ── Table state indicators ────────────────────────────────────────────────
    // emptyState:     the "No data" illustration shown when a search/filter has
    //                 no results.
    // loadingSpinner: the spinner overlay shown while the table is fetching data.
    //                 Used in clickRefresh() to wait for the reload to finish.
    this.emptyState              = page.locator(C.emptyState.selector);
    this.loadingSpinner          = page.locator(C.loadingSpinner.selector);

    // ── User menu (top-right avatar) ──────────────────────────────────────────
    // Used by regression tests that verify logout does not break the Customers page.
    this.adminAvatar             = page.locator(C.adminAvatar.selector);
    this.logoutMenuItem          = page.locator(C.logoutMenuItem.selector);

    // ── Three-dot menu items (opened via rowThreeDotMenu) ─────────────────────
    // These dropdown items become visible only after clicking the ⋯ button on a row.
    this.viewMilestonesMenuItem  = page.locator(C.viewMilestonesMenuItem.selector);
    this.unitSwapMenuItem        = page.locator(C.unitSwapMenuItem.selector);
    this.updateParkingMenuItem   = page.locator(C.updateParkingMenuItem.selector);

    // ── Cancel Unit modal (Activity/Mavis attestation checkboxes) ─────────────
    // Same modal shape is reused for single-cancel and bulk-cancel flows.
    this.cancelUnitModal         = page.locator(C.cancelUnitModal.selector);
    this.cancelUnitAttestation1  = page.locator(C.cancelUnitAttestation1.selector);
    this.cancelUnitAttestation2  = page.locator(C.cancelUnitAttestation2.selector);
    this.cancelUnitConfirmBtn    = page.locator(C.cancelUnitConfirmBtn.selector);

    // ── Unit Swap modal ───────────────────────────────────────────────────────
    this.unitSwapModal           = page.locator(C.unitSwapModal.selector);
    this.unitSwapTowerDropdown   = page.locator(C.unitSwapTowerDropdown.selector);
    this.unitSwapUnitDropdown    = page.locator(C.unitSwapUnitDropdown.selector);
    this.unitSwapAttestation1    = page.locator(C.unitSwapAttestation1.selector);
    this.unitSwapAttestation2    = page.locator(C.unitSwapAttestation2.selector);
    this.unitSwapSubmitBtn       = page.locator(C.unitSwapSubmitBtn.selector);

    // ── Update Parking modal ──────────────────────────────────────────────────
    this.updateParkingModal      = page.locator(C.updateParkingModal.selector);
    this.parkingToggle           = page.locator(C.parkingToggle.selector);
    this.parkingCountInput       = page.locator(C.parkingCountInput.selector);
    this.parkingAmountInput      = page.locator(C.parkingAmountInput.selector);
    this.parkingPreviewText      = page.locator(C.parkingPreviewText.selector);
    this.updateParkingSubmitBtn  = page.locator(C.updateParkingSubmitBtn.selector);
  }

  // ── Per-row action helpers ────────────────────────────────────────────────────

  /**
   * trashIconForRow(rowIndex) — return the trash (cancel-registration) icon for row N.
   * Visibility-only assertions can use this; clicking is destructive.
   */
  trashIconForRow(rowIndex) {
    return this.rowTrashIcon.nth(rowIndex);
  }

  /**
   * threeDotMenuForRow(rowIndex) — return the ⋯ overflow menu button for row N.
   */
  threeDotMenuForRow(rowIndex) {
    return this.rowThreeDotMenu.nth(rowIndex);
  }

  /**
   * openThreeDotMenu(rowIndex) — open the ⋯ menu and wait for the dropdown to render.
   * Used in read-only visibility tests (we open the dropdown but do not click any item).
   */
  async openThreeDotMenu(rowIndex) {
    // Scope the ⋯ trigger to the TARGET ROW, not a global nth — not every row has a
    // three-dot menu (Registered/Cancelled rows differ), so a global index misaligns
    // when the target row sits deep in a mixed list. The trigger is the row's
    // .ant-dropdown-trigger button (falls back to the global nth if the row has none).
    const rowTrigger = this.tableRows.nth(rowIndex).locator('.ant-dropdown-trigger');
    if (await rowTrigger.count() > 0) {
      await rowTrigger.first().click({ force: true });
    } else {
      await this.rowThreeDotMenu.nth(rowIndex).click();
    }
    const activeDropdown = this.page.locator('.ant-dropdown:not(.ant-dropdown-hidden)');
    await activeDropdown.waitFor({ state: 'visible', timeout: 5_000 });
    return activeDropdown;
  }

  /**
   * closeAnyOpenDropdown() — press Escape to dismiss any open Ant Design dropdown.
   * Helpful after read-only visibility checks so leftover menus don't interfere
   * with subsequent assertions.
   */
  async closeAnyOpenDropdown() {
    await this.page.keyboard.press('Escape');
  }

  // ── Pagination helpers ────────────────────────────────────────────────────────

  /**
   * clickNextPage() — click the Next-page chevron in the pagination bar.
   * Waits for the click to settle. Caller should verify the "current page" indicator.
   */
  async clickNextPage() {
    await this.scrollToPagination();
    await this.click(this.paginationNextBtn);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * gotoPageNumber(n) — click a specific page number link in the pagination bar.
   * Ant Design renders each numbered page as li.ant-pagination-item-N.
   */
  async gotoPageNumber(n) {
    await this.scrollToPagination();
    const pageItem = this.page.locator(`li.ant-pagination-item-${n}`);
    await pageItem.waitFor({ state: 'visible', timeout: 5_000 });
    await pageItem.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * getCurrentPageNumber() — read the active page number from the pagination bar.
   * Returns null if the active page indicator is not found.
   */
  async getCurrentPageNumber() {
    const active = this.page.locator('li.ant-pagination-item-active');
    const txt = await active.textContent().catch(() => null);
    if (!txt) return null;
    const m = txt.match(/(\d+)/);
    return m ? Number(m[1]) : null;
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  /**
   * navigate() — go directly to the Customers URL.
   * Called in beforeEach so every test starts on a clean, unfiltered Customers page.
   */
  async navigate() {
    await this.page.goto(CUSTOMERS_URL);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * navigateViaSidebar() — click the "Customers" link in the left sidebar.
   * Used to test that the sidebar navigation works correctly.
   *
   * Why .first():
   *   Ant Design renders duplicate <a> tags for collapsed/expanded sidebar states.
   *   Both have the same href, so a plain locator resolves to 2 elements and
   *   Playwright throws a "strict mode violation". .first() picks the visible one.
   */
  async navigateViaSidebar() {
    await this.sidebarCustomersLink.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.sidebarCustomersLink.first().click();
    await this.page.waitForURL(/\/admin\/customers/, { timeout: 15_000 });
    await this.waitForLoad();
  }

  /**
   * waitForLoad() — wait until the Customers page is fully ready.
   * The "X Registration Records" heading is the FRD-defined indicator that the
   * table has loaded. We also wait for networkidle to ensure all API calls settle.
   */
  async waitForLoad() {
    await this.tableRecordsHeading.waitFor({ state: 'visible', timeout: 15_000 });
    await this.page.waitForLoadState('domcontentloaded');
    // KPI cards have their own async API — wait for Registered value to become
    // numeric > 0 (avoids race where snapshot captures zeros before API responds).
    await this.page.waitForFunction(
      () => {
        const cards = document.querySelectorAll('[class*="kpi"], [class*="KPI"], [class*="summary"]');
        for (const c of cards) {
          const t = (c.textContent || '').replace(/[,\s]/g, '');
          const m = t.match(/(\d+)/);
          if (m && parseInt(m[1], 10) > 0) return true;
        }
        return false;
      },
      { timeout: 15_000 }
    ).catch(() => null);
  }

  // ── Search & Filter ──────────────────────────────────────────────────────────

  /**
   * searchByPhone(phone) — type a phone number into the search box and submit.
   * The table filters live as you type; pressing Enter triggers an explicit search.
   * The .catch() on .press('Enter') is a safeguard because some input variants
   * only respond to blur, not Enter — it is safe to ignore the error in those cases.
   */
  async searchByPhone(phone) {
    await this.fill(this.searchByPhoneInput, phone);
    await this.searchByPhoneInput.press('Enter').catch(() => { /* some inputs fire on blur, not Enter */ });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * clearSearch() — empty the Search by Phone box and submit so the full list returns.
   * Used by ADM_CUST_014. We clear the field, press Enter (and Backspace fallback for
   * variants that only react to key events), then wait for the table to reload.
   */
  async clearSearch() {
    await this.searchByPhoneInput.fill('');
    await this.searchByPhoneInput.press('Enter').catch(() => {});
    await this.page.waitForLoadState('networkidle');
    await this.tableRecordsHeading.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * openFilterPanel() — ensure the inline filter row is visible.
   *
   * The "Filter" button (top-right of the table) shows/hides an extra row below
   * the column headers containing text inputs for column-level searching. When the
   * panel is open, the button label changes to "Reset Filters".
   * This method is idempotent — calling it when the panel is already open does nothing.
   */
  async openFilterPanel() {
    const isOpen = await this.resetFiltersButton.isVisible().catch(() => false);
    if (!isOpen) {
      await this.click(this.filterButton);
      await this.resetFiltersButton.waitFor({ state: 'visible', timeout: 5_000 });
    }
  }

  /**
   * applyStatusFilter(status) — filter the table by Allocation Status.
   *
   * How the filter works in the UI:
   *   1. The "Filter" button opens the inline column-search panel.
   *   2. Each column header has a small funnel icon (`.ant-table-filter-trigger`).
   *      Clicking it opens a dropdown with checkbox options.
   *   3. We select the desired status option and click "OK".
   *
   * Why `.filter({ hasText })` instead of `th:has-text("...") .class`:
   *   Playwright's `.filter()` chaining is more reliable than embedding :has-text()
   *   inside a long CSS string — it evaluates the text check separately.
   *
   * Why `.first()` on the filter trigger:
   *   Ant Design tables internally duplicate the header row for column-width
   *   measurement (the "measure cell"). Both cells match our locator, so we
   *   explicitly take the first one (the real visible header cell).
   *
   * @param {string} status — e.g. 'Cancelled', 'Registered', 'Inactive Registrations'
   */
  async applyStatusFilter(status) {
    await this.openFilterPanel();
    const allocationStatusTh = this.page.locator('th').filter({ hasText: 'Allocation Status' });
    // The filter trigger can be a <span> (Ant Design v4) or <button> (v5) — no tag qualifier
    await allocationStatusTh.locator('.ant-table-filter-trigger').first().click();
    const activeDropdown = this.page.locator('.ant-dropdown:not(.ant-dropdown-hidden)');
    await activeDropdown.waitFor({ state: 'visible', timeout: 5_000 });
    await activeDropdown.locator(`[role='menuitem']:has-text("${status}")`).click();
    await this.click(this.filterOkButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * resetFilters() — click "Reset Filters" to clear all active filters.
   *
   * After clicking, we wait for:
   *   1. The "Filter" button to reappear (confirms the panel closed).
   *   2. Two networkidle passes — the first settles the filter-clear request;
   *      the second waits for the full unfiltered dataset to load from the API.
   *   3. The table heading to be visible — confirms the table has re-rendered.
   *
   * Why two networkidle passes:
   *   After clicking "Reset Filters", the browser fires two sequential API calls:
   *   one to clear the filter state, one to reload all records. A single
   *   waitForLoadState('networkidle') may resolve between the two calls and let
   *   the test read a stale (filtered) record count.
   */
  async resetFilters() {
    await this.openFilterPanel();
    // Wait for the KPI / list refetch that the reset triggers — wraps click so
    // the response resolves before we move on. Avoids a flaky race where the
    // KPI cards still show filtered values after networkidle fires.
    const kpiRequest = this.page.waitForResponse(
      (resp) => /\/api\/v1\/admin\/.*(buyer|kpi|registration)/i.test(resp.url()) && resp.status() === 200,
      { timeout: 15_000 }
    ).catch(() => null);
    await this.click(this.resetFiltersButton);
    await this.filterButton.waitFor({ state: 'visible', timeout: 5_000 });
    await kpiRequest;
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.tableRecordsHeading.waitFor({ state: 'visible', timeout: 10_000 });
  }

  // ── Table interactions ────────────────────────────────────────────────────────

  /** clickCustomer(rowIndex) — click a table row to open the customer detail view. */
  async clickCustomer(rowIndex) {
    const row = this.tableRows.nth(rowIndex);
    await row.waitFor({ state: 'visible' });
    await row.click();
  }

  /**
   * getTableRecordsCount() — read the total record count from the heading above the table.
   *
   * The heading text is like "9,673 Registration Records".
   * The regex captures the number, strips commas, and returns an integer.
   * Returns null if the heading is not present (e.g., during a loading state).
   */
  async getTableRecordsCount() {
    await this.tableRecordsHeading.waitFor({ state: 'visible' });
    const txt = await this.tableRecordsHeading.textContent();
    const match = (txt || '').match(/([\d,]+)\s+Registration Records/i);
    return match ? Number(match[1].replace(/,/g, '')) : null;
  }

  /**
   * getKpiValue(kpiLocator) — read the count number from a KPI summary card.
   *
   * Each card contains a large number and a label (e.g., "56\nRegistered").
   * The regex captures the first sequence of digits (with optional commas).
   *
   * @param {import('@playwright/test').Locator} kpiLocator — e.g. this.kpiCancelled
   * @returns {number|null}
   */
  async getKpiValue(kpiLocator) {
    await kpiLocator.waitFor({ state: 'visible' });
    const txt = await kpiLocator.textContent();
    const match = (txt || '').match(/(\d[\d,]*)/);
    return match ? Number(match[1].replace(/,/g, '')) : null;
  }

  // ── Cancel Registration flow ─────────────────────────────────────────────────

  /**
   * cancelRegistration(rowIndex) — cancel the registration in table row N.
   *
   * Steps:
   *   1. Click the trash icon on the target row.
   *   2. Wait for the confirmation modal to appear.
   *   3. Assert the refund text is visible (confirms the modal is showing the right content).
   *   4. Click "Confirm" to complete the cancellation.
   *   5. Wait for the success toast ("₹999 refund processed") to confirm the API call succeeded.
   *
   * DESTRUCTIVE: this modifies live UAT data. Only run with ALLOW_DESTRUCTIVE=1
   * and disposable test data.
   */
  async cancelRegistration(rowIndex) {
    await this.rowTrashIcon.nth(rowIndex).click();
    await this.cancelModal.waitFor({ state: 'visible', timeout: 10_000 });
    await this.expectVisible(this.cancelModalRefundText);
    await this.click(this.cancelModalConfirmBtn);
    await this.toastRefundSuccess.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** closeCancelModal() — close the Cancel Registration modal without confirming. */
  async closeCancelModal() {
    await this.click(this.cancelModalCloseBtn);
    await this.cancelModal.waitFor({ state: 'hidden', timeout: 5_000 });
  }

  // ── Home Loan Approval flow ──────────────────────────────────────────────────

  /**
   * approveHomeLoan(rowIndex) — open the Home Loan Approval modal for row N and approve.
   *
   * Steps:
   *   1. Click the three-dot (⋯) menu on the row.
   *   2. Click "Home Loan Approval" in the dropdown.
   *   3. If the approval toggle is not already ON, switch it ON.
   *   4. Click Submit and wait for the modal to close (confirms the API call succeeded).
   *
   * DESTRUCTIVE: modifies live UAT data. Guarded by ALLOW_DESTRUCTIVE=1.
   */
  async approveHomeLoan(rowIndex) {
    await this.rowThreeDotMenu.nth(rowIndex).click();
    await this.click(this.homeLoanApprovalMenuItem);
    await this.homeLoanModal.waitFor({ state: 'visible', timeout: 10_000 });
    const isOn = await this.homeLoanToggle.getAttribute('aria-checked');
    if (isOn !== 'true') {
      await this.click(this.homeLoanToggle);
    }
    await this.click(this.homeLoanSubmitBtn);
    // Wait for the API call to settle before checking modal state
    await this.page.waitForLoadState('networkidle');
    await this.homeLoanModal.waitFor({ state: 'hidden', timeout: 15_000 });
  }

  /** openHomeLoanModal(rowIndex) — open the modal without submitting (used in validation tests). */
  async openHomeLoanModal(rowIndex) {
    await this.rowThreeDotMenu.nth(rowIndex).click();
    await this.click(this.homeLoanApprovalMenuItem);
    await this.homeLoanModal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** submitHomeLoanWithoutToggle() — click Submit without toggling the approval switch. */
  async submitHomeLoanWithoutToggle() {
    await this.click(this.homeLoanSubmitBtn);
  }

  // ── Download ──────────────────────────────────────────────────────────────────

  /**
   * downloadExport() — click the Download button and wait for the file download to start.
   *
   * Playwright's `waitForEvent('download')` must be set up BEFORE clicking the button,
   * otherwise the download event may fire and be missed. We return the Download object
   * so the caller can assert `.suggestedFilename()`.
   *
   * @returns {Promise<import('@playwright/test').Download>}
   */
  async downloadExport() {
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30_000 });
    await this.click(this.downloadButton);
    return await downloadPromise;
  }

  // ── Refresh ────────────────────────────────────────────────────────────────────

  /**
   * clickRefresh() — click the Refresh button and wait for the table to reload.
   *
   * The loading spinner may appear and disappear very quickly (or not at all on fast
   * connections). We use .catch(() => {}) on both waits so the method never throws
   * even if the spinner is too fast to observe — the important thing is that we give
   * it a chance to settle before the test continues.
   */
  async clickRefresh() {
    await this.click(this.refreshButton);
    await this.loadingSpinner.waitFor({ state: 'visible', timeout: 3_000 }).catch(() => {});
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  }

  // ── Pagination ────────────────────────────────────────────────────────────────

  /** scrollToPagination() — scroll the pagination bar into view (needed on short screens). */
  async scrollToPagination() {
    await this.paginationBar.scrollIntoViewIfNeeded();
  }

  /**
   * setPageSize(size) — change how many rows are shown per page.
   *
   * Clicks the Ant Design Select dropdown in the pagination bar and picks the
   * option matching `size`. We try both "50 / page" and "50" formats to handle
   * different Ant Design versions.
   *
   * @param {number} size — e.g. 10, 25, 50, 100
   */
  async setPageSize(size) {
    await this.scrollToPagination();
    await this.click(this.paginationPageSizeDropdown);
    const activeDropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await activeDropdown
      .locator(`.ant-select-item-option:has-text("${size} / page"), .ant-select-item-option:has-text("${size}")`)
      .first()
      .click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Assertion helpers ─────────────────────────────────────────────────────────

  /**
   * expectKpiVisible() — assert all 6 KPI summary cards are visible on screen.
   * Called by FUNC_001 to verify the Customers page has fully rendered.
   */
  async expectKpiVisible() {
    await this.expectVisible(this.kpiRegistered);
    await this.expectVisible(this.kpiInactive);
    await this.expectVisible(this.kpiCancelled);
    await this.expectVisible(this.kpiKycPending);
    await this.expectVisible(this.kpiConfirmed);
    await this.expectVisible(this.kpiActiveTowers);
  }

  /**
   * expectCustomerInTable(phone) — assert a row containing `phone` is visible in the table.
   * Returns the matching row locator so callers can do further assertions on it.
   */
  async expectCustomerInTable(phone) {
    const row = this.page.locator(`tr.ant-table-row:has-text("${phone}")`);
    await row.first().waitFor({ state: 'visible', timeout: 10_000 });
    return row;
  }

  /** expectEmptyState() — assert the "No data" placeholder is visible (empty search/filter result). */
  async expectEmptyState() {
    await this.emptyState.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** expectOnCustomersUrl() — assert the browser URL contains /admin/customers. */
  async expectOnCustomersUrl() {
    await this.page.waitForURL(/\/admin\/customers/, { timeout: 15_000 });
  }

  // ── User menu ─────────────────────────────────────────────────────────────────

  /**
   * logout() — click the admin avatar → Logout and confirm redirect to the login page.
   * Used by cross-module regression tests that verify logout is accessible from Customers.
   */
  async logout() {
    await this.click(this.adminAvatar);
    await this.click(this.logoutMenuItem);
    await this.page.waitForURL(/\/admin\/?$/, { timeout: 10_000 });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  //  Read-only destructive-modal helpers
  //
  //  Every helper below OPENS a modal/popup, lets the test ASSERT against it,
  //  and provides a matching closeXxx() that dismisses without submitting.
  //  Tests must NEVER click Confirm / Submit / Save / Approve buttons in these
  //  modals on UAT — Pipeline Discipline rule #7.
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * findFirstRowMatching({ status }) — return the row-index of the FIRST table row
   * whose Allocation Status column text matches `status` (case-insensitive substring).
   * Returns null when no row matches (test should test.skip()).
   *
   * Caller must already have filtered/searched the table so the rows on screen
   * are the candidate set (typically: searchByPhone('8888888888') first).
   *
   * @param {{ status?: string }} match
   * @returns {Promise<number|null>}
   */
  async findFirstRowMatching({ status }) {
    const rowCount = await this.tableRows.count();
    if (rowCount === 0) return null;
    // Determine the column index of "Allocation Status" from the live header row.
    const headerCells = this.tableHeaderRow.locator('th');
    const headerCount = await headerCells.count();
    let statusCol = -1;
    for (let i = 0; i < headerCount; i++) {
      const txt = (await headerCells.nth(i).textContent()) || '';
      if (/allocation status/i.test(txt)) { statusCol = i; break; }
    }
    if (statusCol === -1) {
      // Header detection failed — fall back to scanning whole-row text.
      for (let i = 0; i < rowCount; i++) {
        const rowText = (await this.tableRows.nth(i).textContent()) || '';
        if (status && new RegExp(status, 'i').test(rowText)) return i;
      }
      return null;
    }
    for (let i = 0; i < rowCount; i++) {
      const cell = this.tableRows.nth(i).locator('td').nth(statusCol);
      const txt = ((await cell.textContent()) || '').trim();
      if (!status || new RegExp(status, 'i').test(txt)) return i;
    }
    return null;
  }

  /**
   * findRowByRegistrationId(regId) — return the row-index of the FIRST table row
   * whose Registration Details column contains the given registration-ID substring
   * (e.g. 'GHNG-1000008364-P'). All fixture rows share one phone (8888888888), so
   * destructive tests target a SPECIFIC registration by its suffix.
   *
   * Caller must have searched by phone first so the candidate rows are on screen.
   * Returns null when no row matches (test should test.skip()).
   *
   * @param {string} regId — full or partial registration ID substring
   * @returns {Promise<number|null>}
   */
  async findRowByRegistrationId(regId) {
    // Search results settle asynchronously AFTER networkidle resolves, so first wait
    // for the specific reg-ID row to actually render — otherwise we'd scan the stale
    // (pre-filter) table and miss it.
    const target = this.page.locator(`tr.ant-table-row:has-text("${regId}")`).first();
    let appeared = await target.waitFor({ state: 'visible', timeout: 6_000 }).then(() => true).catch(() => false);
    // The target may be on a later page (default page size 10). Bump to 100 rows/page so
    // every search result renders on one page, then re-check.
    if (!appeared) {
      await this.setPageSize(100).catch(() => {});
      await this.page.waitForLoadState('networkidle').catch(() => {});
      appeared = await target.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
    }
    if (!appeared) return null;
    // "Registration Details" is the first data column (reg-ID + created date).
    const rowCount = await this.tableRows.count();
    for (let i = 0; i < rowCount; i++) {
      const rowText = (await this.tableRows.nth(i).textContent()) || '';
      if (rowText.includes(regId)) return i;
    }
    return null;
  }

  /** rowTrashFor(rowIndex) — the trash control scoped to the target row (robust for deep
   *  rows where a global nth misaligns), falling back to the global nth. */
  rowTrashFor(rowIndex) {
    const scoped = this.tableRows.nth(rowIndex).locator('button.copy-icon, .anticon-delete');
    return scoped;
  }

  // ── Cancel Registration (read-only open/close) ──────────────────────────────
  async openCancelRegistrationPopup(rowIndex) {
    const scoped = this.rowTrashFor(rowIndex);
    if (await scoped.count() > 0) await scoped.first().click({ force: true });
    else await this.rowTrashIcon.nth(rowIndex).click();
    await this.cancelModal.waitFor({ state: 'visible', timeout: 10_000 });
  }
  async closeCancelRegistrationPopup() {
    // Dismiss WITHOUT confirming. The modal footer has no "Close" button — only the
    // confirm button and the top-right X icon (.ant-modal-close). Try, in order:
    //   1) footer Close button (if a variant renders one)
    //   2) the X icon (.ant-modal-close) — the real dismiss control
    //   3) click the mask backdrop (if maskClosable)
    //   4) Escape key
    // Stop as soon as the modal is hidden.
    const tryDismiss = async (fn) => {
      if (await this.cancelModal.isHidden().catch(() => false)) return true;
      await fn().catch(() => {});
      return await this.cancelModal.waitFor({ state: 'hidden', timeout: 2_000 }).then(() => true).catch(() => false);
    };
    if (await tryDismiss(async () => {
      if (await this.cancelModalCloseBtn.isVisible().catch(() => false)) await this.click(this.cancelModalCloseBtn);
      else throw new Error('no footer Close');
    })) return;
    if (await tryDismiss(() => this.page.locator('.ant-modal-close').first().click())) return;
    if (await tryDismiss(() => this.page.locator('.ant-modal-wrap, .ant-modal-mask').first().click({ position: { x: 5, y: 5 } }))) return;
    await tryDismiss(() => this.page.keyboard.press('Escape'));
  }

  // ── Cancel Unit modal (read-only open/close) ────────────────────────────────
  // The Cancel-Unit entry point is the row trash icon when the row is in Booked/
  // Confirmed state (FRD §5). It reuses the trash control but renders a different
  // modal shape (two attestation checkboxes instead of a refund-amount line).
  async openCancelUnitModal(rowIndex) {
    const scoped = this.rowTrashFor(rowIndex);
    if (await scoped.count() > 0) await scoped.first().click({ force: true });
    else await this.rowTrashIcon.nth(rowIndex).click();
    await this.cancelUnitModal.waitFor({ state: 'visible', timeout: 10_000 });
  }
  async closeCancelUnitModal() {
    await this.page.keyboard.press('Escape');
    await this.cancelUnitModal.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ── Unit Swap modal (read-only open/close) ──────────────────────────────────
  async openUnitSwapModal(rowIndex) {
    await this.openThreeDotMenu(rowIndex);
    await this.unitSwapMenuItem.waitFor({ state: 'visible', timeout: 10_000 });
    await this.unitSwapMenuItem.click({ force: true });
    await this.unitSwapModal.waitFor({ state: 'visible', timeout: 10_000 });
  }
  async closeUnitSwapModal() {
    await this.page.keyboard.press('Escape');
    await this.unitSwapModal.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  /**
   * selectUnitSwapTower(towerName?) — open the Tower select and pick an option.
   * Defaults to the FIRST available tower. Returns the chosen option's text.
   */
  async selectUnitSwapTower(towerName) {
    // The Unit Swap modal has two comboboxes in order: [0]=Select Tower, [1]=Select Unit.
    // AntD uses a VIRTUALIZED dropdown (rc-virtual-list) whose options are covered for a
    // normal click. Verified-working approach (agent-browser 2026-06-21): focus the
    // combobox, then keyboard-navigate (ArrowDown + Enter) to choose the first option.
    const towerCombo = this.unitSwapModal.getByRole('combobox').nth(0);
    await towerCombo.click();
    await this.page.locator('.ant-select-item-option:visible').first().waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle').catch(() => {});
    // Read the chosen tower from the selection item.
    const txt = (await this.unitSwapModal.locator('.ant-select-selection-item').first().textContent().catch(() => '')) || '';
    return txt.trim();
  }

  /**
   * selectUnitSwapFirstUnit() — open the Unit combobox and pick the first AVAILABLE unit
   * via keyboard nav (virtualized dropdown). Returns the chosen unit text, or null if
   * no selectable unit is offered.
   */
  async selectUnitSwapFirstUnit() {
    const unitCombo = this.unitSwapModal.getByRole('combobox').nth(1);
    await unitCombo.click();
    const hasOpt = await this.page.locator('.ant-select-item-option:visible:not(.ant-select-item-option-disabled)')
      .first().waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
    if (!hasOpt) { await this.page.keyboard.press('Escape'); return null; }
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    const items = this.unitSwapModal.locator('.ant-select-selection-item');
    const txt = (await items.nth(await items.count() - 1).textContent().catch(() => '')) || '';
    return txt.trim();
  }

  // ── Update Parking modal (read-only open/close) ─────────────────────────────
  async openParkingModal(rowIndex) {
    await this.openThreeDotMenu(rowIndex);
    await this.updateParkingMenuItem.waitFor({ state: 'visible', timeout: 10_000 });
    await this.updateParkingMenuItem.click({ force: true });
    await this.updateParkingModal.waitFor({ state: 'visible', timeout: 10_000 });
  }
  async closeParkingModal() {
    await this.page.keyboard.press('Escape');
    await this.updateParkingModal.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ── Update Parking — slot-based UI helpers ──────────────────────────────────
  // The parking modal was redesigned: a toggle (.ant-switch) enables "Additional
  // Parking"; when ON it shows per-slot "Enter Amount" inputs with "+ Add More" /
  // "Remove" controls and a Submit button. (No more count×amount model.)
  get parkingSwitch()            { return this.updateParkingModal.locator('.ant-switch'); }
  get parkingSlotAmountInputs()  { return this.updateParkingModal.locator("input[placeholder='Enter Amount']"); }
  get parkingAddMoreButton()     { return this.updateParkingModal.locator("button:has-text('Add More')"); }
  get parkingRemoveButtons()     { return this.updateParkingModal.locator("button:has-text('Remove')"); }

  /** parkingToggleIsOn() — true when the Additional Parking switch is enabled. */
  async parkingToggleIsOn() {
    return (await this.parkingSwitch.getAttribute('aria-checked')) === 'true';
  }
  /** enableParking() — turn the Additional Parking switch ON and WAIT for a slot to render. */
  async enableParking() {
    if (!(await this.parkingToggleIsOn())) {
      await this.parkingSwitch.click();
    }
    // Poll until at least one slot input renders (slot rows render async after toggle).
    await this.page.waitForFunction(
      () => {
        const m = document.querySelector('.ant-modal');
        return m && m.querySelectorAll("input[placeholder='Enter Amount']").length > 0;
      },
      { timeout: 8_000 }
    ).catch(() => {});
  }
  /** disableParking() — turn the Additional Parking switch OFF and WAIT for slots to clear. */
  async disableParking() {
    if (await this.parkingToggleIsOn()) {
      await this.parkingSwitch.click();
      await this.page.waitForFunction(
        () => {
          const m = document.querySelector('.ant-modal');
          return m && m.querySelectorAll("input[placeholder='Enter Amount']").length === 0;
        },
        { timeout: 8_000 }
      ).catch(() => {});
    }
  }
  /** setParkingSlotAmount(index, amount) — fill the Nth slot's amount. */
  async setParkingSlotAmount(index, amount) {
    await this.parkingSlotAmountInputs.nth(index).fill(String(amount));
  }
  /** typeParkingSlotAmount(index, text) — type raw text (for non-numeric validation). */
  async typeParkingSlotAmount(index, text) {
    const inp = this.parkingSlotAmountInputs.nth(index);
    await inp.click();
    await inp.pressSequentially(text, { timeout: 5_000 }).catch(() => {});
  }
  /** addParkingSlot() — click "+ Add More" to append a slot; waits for the count to grow. */
  async addParkingSlot() {
    const before = await this.parkingSlotAmountInputs.count();
    await this.parkingAddMoreButton.first().click();
    await this.page.waitForFunction(
      (n) => {
        const m = document.querySelector('.ant-modal');
        return m && m.querySelectorAll("input[placeholder='Enter Amount']").length > n;
      },
      before,
      { timeout: 8_000 }
    ).catch(() => {});
    return this.parkingSlotAmountInputs.count();
  }

  // ── View Milestones nav (read-only — separate page) ─────────────────────────
  async openViewMilestones(rowIndex) {
    await this.openThreeDotMenu(rowIndex);
    await Promise.all([
      this.page.waitForURL(/\/admin\/milestone/, { timeout: 15_000 }),
      this.click(this.viewMilestonesMenuItem),
    ]);
  }

  // ── Home Loan Approval modal (read-only open/close) ─────────────────────────
  async openHomeLoanModalReadOnly(rowIndex) {
    await this.openThreeDotMenu(rowIndex);
    await this.homeLoanApprovalMenuItem.waitFor({ state: 'visible', timeout: 10_000 });
    await this.homeLoanApprovalMenuItem.click({ force: true });
    await this.homeLoanModal.waitFor({ state: 'visible', timeout: 10_000 });
  }
  async closeHomeLoanModal() {
    await this.page.keyboard.press('Escape');
    await this.homeLoanModal.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ── Bulk Cancel toolbar (read-only — does not open the modal here) ──────────
  async clickBulkCancelToolbarButton() {
    await this.click(this.cancelBulkUnitsButton);
  }

  // ── Element accessors (used by lifted destructive tests) ────────────────────
  // Convenience getters that return locators with friendlier names than the raw
  // POM property naming. All exposed read-only — no submission.
  get refundAmountText()        { return this.cancelModalRefundText; }
  get cancelUnitSubmitButton()  { return this.cancelUnitConfirmBtn; }
  get unitSwapSubmitButton()    { return this.unitSwapSubmitBtn; }
  get parkingSubmitButton()     { return this.updateParkingSubmitBtn; }
}

module.exports = { CustomersPage };
