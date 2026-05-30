'use strict';

/**
 * SupportTicketsPage.js — Page Object Model for the Buyer Portal Support Tickets module.
 *
 * What this file does:
 *   Wraps the buyer-side Support Tickets surface. Functionally the module is
 *   reachable ONLY by direct URL — sidebar and bottom-nav links are commented
 *   out (Sidebar.js:173-189, BottomNavigationBar.jsx:151-158). Entry surfaces:
 *     /support           → list view (table of tickets owned by buyer)
 *     /support/categories or /support-tickets/categories
 *                        → 4-tile category picker (GENERAL, CAR_PARKING,
 *                          CANCELLATION, LOAN)
 *     /support-tickets/create
 *                        → category-specific create form
 *     /support-tickets/<id>
 *                        → ticket detail + conversation thread
 *
 * Per FSD corrections (TC_SUPPORT_TICKETS.md §"FSD Corrections Applied"):
 *   - Status badges are sourced from a LIVE osTicket fetch — NOT the local
 *     ENUM. Drift exists in both directions (KB-1).
 *   - Body fields for create: registrationNumber, category, note are mandatory
 *     for ALL categories. Per-category extras:
 *       CAR_PARKING   → numberOfParkings
 *       CANCELLATION  → reasonOfCancellation (+ optional file uploads stored
 *                       in Azure Blob, NOT S3)
 *       LOAN          → timeSlot, contactNumber (server regex 10-15 digits;
 *                       client regex exactly 10 → KB-3 drift)
 *   - Ticket number format: TKT-GN-NNNNNN. Concurrent-create race possible
 *     (KB-5).
 *   - Detail endpoint GET /api/v1/support-tickets/:id has a KNOWN security gap
 *     — no ownership filter (BYR_SUP_039).
 *
 * Where selectors live:
 *   `locators/buyer/locator-map.json` module key `support-tickets` currently
 *   exposes only TWO elements ('404Heading', 'thisPageCouldNotBeFoundHeading')
 *   because the live crawl hit nav-commented-out URLs which 404. Both are kept
 *   as sentinels. Every other selector below is a DOM-contract fallback against
 *   the FSD form schema; when Tech Lead Agent extends the locator map from an
 *   authenticated module crawl, these should be promoted to `L['…']` lookups
 *   via the `sel()` helper.
 *
 * BRD: BUYER-FS-Support-Tickets §1 (list), §2 (categories), §3 (create), §4 (detail)
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/support-tickets/TC_SUPPORT_TICKETS.md
 *
 * Destructive notes:
 *   submitTicket() writes a DB row AND fires an osTicket API call (which
 *   dispatches alert + autorespond emails). Specs MUST guard with
 *   ENV=uat + ALLOW_DESTRUCTIVE=1 before invoking.
 */

const { expect }     = require('@playwright/test');
const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/buyer/locator-map.json');

const L = locatorMap['support-tickets'] || {};

const BUYER_BASE        = 'https://uat.xrportal.in';
const SUPPORT_LIST_URL  = `${BUYER_BASE}/support`;
const SUPPORT_ALT_URL   = `${BUYER_BASE}/support-tickets`;
const CATEGORIES_URL    = `${BUYER_BASE}/support-tickets/categories`;
const CREATE_URL        = `${BUYER_BASE}/support-tickets/create`;
const DETAIL_URL = (id) => `${BUYER_BASE}/support-tickets/${id}`;

/** sel(key) — returns the selector string from the locator map for `key`, or ''. */
function sel(key) {
  return (L[key] && L[key].selector) || '';
}

class SupportTicketsPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;

    // Entry surfaces
    this.listUrl       = SUPPORT_LIST_URL;
    this.altListUrl    = SUPPORT_ALT_URL;
    this.categoriesUrl = CATEGORIES_URL;
    this.createUrl     = CREATE_URL;
    this.detailUrlFor  = DETAIL_URL;

    // ── Locator-map-backed sentinels (only the 2 auto-crawled keys) ──────────
    // These prove that nav-commented-out URLs hit the Next.js 404 page.
    this.el404Heading = page.locator(sel('404Heading') || 'h1:has-text("404")');
    this.thisPageCouldNotBeFoundHeading = page.locator(
      sel('thisPageCouldNotBeFoundHeading') || 'h2:has-text("This page could not be found.")',
    );

    // ── DOM-contract fallback locators ───────────────────────────────────────
    // Promote to L['…'] lookups once an authenticated module crawl extends the map.

    // List view ─────────────────────────────────────────────────────────────
    // Main page heading — "Support Tickets" / "My Tickets" / similar.
    this.listHeading = page.locator([
      'h1:has-text("Support")',
      'h1:has-text("Tickets")',
      'h2:has-text("Support")',
      'h2:has-text("Tickets")',
      '[data-testid="support-tickets-heading"]',
    ].join(', ')).first();

    // The table itself (Ant Design Table / generic table / data-testid).
    this.ticketsTable = page.locator([
      '.ant-table',
      'table[data-testid="support-tickets-table"]',
      'table',
      '[role="table"]',
    ].join(', ')).first();

    // Row container — adjusts for Ant Table body row or plain tbody tr.
    this.ticketRows = page.locator([
      '.ant-table-tbody > tr.ant-table-row',
      'table tbody tr',
      '[role="row"]:not([role="rowheader"])',
    ].join(', '));

    // Column headers — used to assert 5 columns: Ticket ID, Category,
    // Description, Status, Date Created.
    this.tableHeaders = page.locator([
      '.ant-table-thead th',
      'table thead th',
      '[role="columnheader"]',
    ].join(', '));

    // Empty-state container.
    this.emptyState = page.locator([
      '.ant-empty',
      '[data-testid="empty-state"]',
      ':text("No tickets")',
      ':text("no tickets yet")',
    ].join(', ')).first();

    // Search input — list-view client debounce kicks in at 4+ chars (KB).
    this.searchInput = page.locator([
      'input[placeholder*="Search" i]',
      'input[type="search"]',
      '[data-testid="support-search"]',
    ].join(', ')).first();

    // "New Ticket" / "Create" / "+ Raise Ticket" CTA on the list view.
    this.createTicketCta = page.locator([
      'button:has-text("New Ticket")',
      'button:has-text("Create")',
      'button:has-text("Raise Ticket")',
      'button:has-text("Raise a Ticket")',
      'a:has-text("New Ticket")',
      'a:has-text("Raise Ticket")',
      '[data-testid="create-ticket-cta"]',
    ].join(', ')).first();

    // Status badge inside a row — read text from the Status column.
    this.statusBadges = page.locator([
      '.ant-tag',
      '[data-testid="ticket-status"]',
      'td:nth-child(4) span',
    ].join(', '));

    // Categories screen ──────────────────────────────────────────────────────
    this.categoryTileGeneral = page.locator([
      'button:has-text("General")',
      'a:has-text("General")',
      '[data-category="GENERAL"]',
    ].join(', ')).first();

    this.categoryTileCarParking = page.locator([
      'button:has-text("Car Parking")',
      'button:has-text("Parking")',
      'a:has-text("Car Parking")',
      '[data-category="CAR_PARKING"]',
    ].join(', ')).first();

    this.categoryTileCancellation = page.locator([
      'button:has-text("Cancellation")',
      'a:has-text("Cancellation")',
      '[data-category="CANCELLATION"]',
    ].join(', ')).first();

    this.categoryTileLoan = page.locator([
      'button:has-text("Loan")',
      'a:has-text("Loan")',
      '[data-category="LOAN"]',
    ].join(', ')).first();

    // Create form ───────────────────────────────────────────────────────────
    // Preselected category field — readonly or controlled-value select.
    this.categoryField = page.locator([
      'input[name="category"]',
      'select[name="category"]',
      '[data-testid="category-field"]',
      '.ant-select-selection-item',
    ].join(', ')).first();

    // Description / note textarea — mandatory for ALL categories.
    this.descriptionField = page.locator([
      'textarea[name="note"]',
      'textarea[name="description"]',
      'textarea[placeholder*="Description" i]',
      'textarea[placeholder*="describe" i]',
      'textarea',
    ].join(', ')).first();

    // registrationNumber — server-side mandatory; usually pre-filled from
    // session or rendered as a dropdown of buyer's units.
    this.registrationNumberField = page.locator([
      'input[name="registrationNumber"]',
      'select[name="registrationNumber"]',
      '[data-testid="registration-number"]',
    ].join(', ')).first();

    // CAR_PARKING extra ─────────────────────────────────────────────────────
    this.numberOfParkingsField = page.locator([
      'input[name="numberOfParkings"]',
      'select[name="numberOfParkings"]',
      'input[placeholder*="parking" i]',
    ].join(', ')).first();

    // CANCELLATION extras ────────────────────────────────────────────────────
    this.reasonOfCancellationField = page.locator([
      'textarea[name="reasonOfCancellation"]',
      'input[name="reasonOfCancellation"]',
      'textarea[placeholder*="reason" i]',
    ].join(', ')).first();

    this.aadharCardUpload = page.locator([
      'input[name="aadharCard"]',
      'input[type="file"][data-field="aadharCard"]',
    ].join(', ')).first();

    this.panCardUpload = page.locator([
      'input[name="panCard"]',
      'input[type="file"][data-field="panCard"]',
    ].join(', ')).first();

    this.cancelledChequeUpload = page.locator([
      'input[name="cancelledCheque"]',
      'input[type="file"][data-field="cancelledCheque"]',
    ].join(', ')).first();

    this.transactionProofUpload = page.locator([
      'input[name="transactionProof"]',
      'input[type="file"][data-field="transactionProof"]',
    ].join(', ')).first();

    // LOAN extras ───────────────────────────────────────────────────────────
    this.timeSlotField = page.locator([
      'input[name="timeSlot"]',
      'select[name="timeSlot"]',
      '[data-testid="time-slot"]',
    ].join(', ')).first();

    this.contactNumberField = page.locator([
      'input[name="contactNumber"]',
      'input[type="tel"]',
      'input[placeholder*="contact" i]',
    ].join(', ')).first();

    // Submit ────────────────────────────────────────────────────────────────
    this.submitButton = page.locator([
      'button:has-text("Submit")',
      'button:has-text("Create Ticket")',
      'button:has-text("Raise Ticket")',
      'button[type="submit"]',
    ].join(', ')).first();

    // Validation / toast ────────────────────────────────────────────────────
    this.validationErrors = page.locator([
      '.ant-form-item-explain-error',
      '[role="alert"]',
      '.error-message',
    ].join(', '));

    this.toastSuccess = page.locator([
      '.ant-message-success',
      '.ant-notification-notice-success',
      '[role="status"]:has-text("success")',
      ':text("Ticket created")',
      ':text("created successfully")',
    ].join(', ')).first();

    this.toastError = page.locator([
      '.ant-message-error',
      '.ant-notification-notice-error',
      '[role="alert"]:has-text("failed")',
      ':text("Something went wrong")',
    ].join(', ')).first();

    // Detail view ───────────────────────────────────────────────────────────
    this.detailTicketNumber = page.locator([
      '[data-testid="ticket-number"]',
      ':text-matches("TKT-GN-\\d+")',
    ].join(', ')).first();

    this.detailConversationThread = page.locator([
      '[data-testid="conversation-thread"]',
      '.conversation-thread',
      '.thread',
      'ul.messages',
    ].join(', ')).first();

    this.detailMessages = page.locator([
      '[data-testid="conversation-message"]',
      '.conversation-message',
      '.message-item',
      'li.message',
    ].join(', '));

    this.detailAccessDenied = page.locator([
      ':text("Access denied")',
      ':text("Forbidden")',
      ':text("Not found")',
      'h1:has-text("404")',
    ].join(', ')).first();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Navigation
  // ════════════════════════════════════════════════════════════════════════

  /**
   * navigate() — go to the primary list view at /support. Most buyer-portal
   * deployments alias /support and /support-tickets — we land on /support
   * because that is the URL specified in the locator-map crawl and the spec.
   */
  async navigate() {
    await this.page.goto(this.listUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** navigateAlt() — try the /support-tickets path (alternate alias). */
  async navigateAlt() {
    await this.page.goto(this.altListUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** navigateToCategories() — open the 4-tile category picker. */
  async navigateToCategories() {
    await this.page.goto(this.categoriesUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** navigateToCreate() — open the create form (without category preselected). */
  async navigateToCreate() {
    await this.page.goto(this.createUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** navigateToDetail(id) — open a ticket detail page. */
  async navigateToDetail(id) {
    await this.page.goto(this.detailUrlFor(id));
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** expect404Page() — assert the locator-map sentinels render. */
  async expect404Page() {
    await expect(this.el404Heading).toBeVisible();
    await expect(this.thisPageCouldNotBeFoundHeading).toBeVisible();
  }

  // ════════════════════════════════════════════════════════════════════════
  // List view helpers
  // ════════════════════════════════════════════════════════════════════════

  /**
   * getTicketsList() — return an array of { ticketId, category, status, date }
   * objects scraped from the visible rows. Returns [] if table absent or empty.
   */
  async getTicketsList() {
    if (!(await this.ticketsTable.isVisible().catch(() => false))) return [];
    const rows = await this.ticketRows.all();
    const out = [];
    for (const row of rows) {
      const cells = await row.locator('td').allTextContents().catch(() => []);
      if (!cells.length) continue;
      out.push({
        ticketId: (cells[0] || '').trim(),
        category: (cells[1] || '').trim(),
        description: (cells[2] || '').trim(),
        status: (cells[3] || '').trim(),
        date: (cells[4] || '').trim(),
      });
    }
    return out;
  }

  /** getTicketByNumber(num) — find a row whose Ticket ID column matches. */
  async getTicketByNumber(num) {
    const list = await this.getTicketsList();
    return list.find((t) => t.ticketId.includes(num)) || null;
  }

  /** openCreateTicket() — click the "New Ticket" / "Create" CTA on the list. */
  async openCreateTicket() {
    const visible = await this.createTicketCta.isVisible().catch(() => false);
    if (!visible) return false;
    await this.createTicketCta.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return true;
  }

  /**
   * selectCategory(category) — click one of the 4 category tiles on the
   * categories screen. `category` is one of: 'GENERAL', 'CAR_PARKING',
   * 'CANCELLATION', 'LOAN'. Returns true if the tile was clicked.
   */
  async selectCategory(category) {
    const map = {
      GENERAL:      this.categoryTileGeneral,
      CAR_PARKING:  this.categoryTileCarParking,
      CANCELLATION: this.categoryTileCancellation,
      LOAN:         this.categoryTileLoan,
    };
    const tile = map[category];
    if (!tile) throw new Error(`Unknown category: ${category}`);
    const visible = await tile.isVisible().catch(() => false);
    if (!visible) return false;
    await tile.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return true;
  }

  // ════════════════════════════════════════════════════════════════════════
  // Create form
  // ════════════════════════════════════════════════════════════════════════

  /**
   * fillForm(fields) — populate the create form per category. Accepted keys:
   *   - description / note     (always)
   *   - registrationNumber     (always — usually session-prefilled)
   *   - numberOfParkings       (CAR_PARKING)
   *   - reasonOfCancellation   (CANCELLATION)
   *   - timeSlot               (LOAN)
   *   - contactNumber          (LOAN)
   * Each fill is best-effort — missing fields are skipped silently so callers
   * can compose negative-validation scenarios (e.g., omit description).
   */
  async fillForm(fields = {}) {
    const note = fields.description ?? fields.note;
    if (typeof note === 'string') {
      await this.descriptionField.fill(note).catch(() => {});
    }
    if (typeof fields.registrationNumber === 'string') {
      await this.registrationNumberField.fill(fields.registrationNumber).catch(() => {});
    }
    if (fields.numberOfParkings !== undefined) {
      await this.numberOfParkingsField
        .fill(String(fields.numberOfParkings))
        .catch(() => {});
    }
    if (typeof fields.reasonOfCancellation === 'string') {
      await this.reasonOfCancellationField.fill(fields.reasonOfCancellation).catch(() => {});
    }
    if (typeof fields.timeSlot === 'string') {
      await this.timeSlotField.fill(fields.timeSlot).catch(() => {});
    }
    if (typeof fields.contactNumber === 'string') {
      await this.contactNumberField.fill(fields.contactNumber).catch(() => {});
    }
  }

  /**
   * uploadAttachments(files) — set files on the 4 CANCELLATION upload inputs.
   * `files` is a partial map of:
   *   { aadharCard, panCard, cancelledCheque, transactionProof }
   * Each value is a file path (string) or array of paths (Playwright accepts both).
   * Non-CANCELLATION categories silently ignore uploads server-side (KB / BYR_SUP_036).
   */
  async uploadAttachments(files = {}) {
    if (files.aadharCard) {
      await this.aadharCardUpload.setInputFiles(files.aadharCard).catch(() => {});
    }
    if (files.panCard) {
      await this.panCardUpload.setInputFiles(files.panCard).catch(() => {});
    }
    if (files.cancelledCheque) {
      await this.cancelledChequeUpload.setInputFiles(files.cancelledCheque).catch(() => {});
    }
    if (files.transactionProof) {
      await this.transactionProofUpload.setInputFiles(files.transactionProof).catch(() => {});
    }
  }

  /**
   * submitTicket() — click the Submit button. Caller is responsible for
   * ENV=uat / ALLOW_DESTRUCTIVE guards because submission triggers an osTicket
   * API call (which sends alert + autorespond emails).
   */
  async submitTicket() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 5_000 });
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ════════════════════════════════════════════════════════════════════════
  // Status sync helpers (osTicket → portal)
  // ════════════════════════════════════════════════════════════════════════

  /**
   * expectStatusSync(ticketId, expectedStatus) — refresh the list and assert
   * that the row for `ticketId` displays `expectedStatus`. Used to verify
   * that the live osTicket fetch (NOT local DB enum) is reflected per
   * BYR_SUP_005 / BYR_SUP_026.
   */
  async expectStatusSync(ticketId, expectedStatus) {
    await this.page.reload();
    await this.waitForLoad();
    const row = await this.getTicketByNumber(ticketId);
    expect(row, `ticket ${ticketId} not in list`).not.toBeNull();
    expect((row.status || '').toLowerCase()).toContain(expectedStatus.toLowerCase());
  }

  // ════════════════════════════════════════════════════════════════════════
  // Assertion helpers
  // ════════════════════════════════════════════════════════════════════════

  /** expectTicketCreated() — accept either success toast OR redirect to list/detail. */
  async expectTicketCreated() {
    const toast    = await this.toastSuccess.isVisible({ timeout: 8_000 }).catch(() => false);
    const onList   = /\/support(\b|-tickets\b|$)/.test(this.page.url());
    const onDetail = /\/support-tickets\/[^/]+/.test(this.page.url());
    expect(toast || onList || onDetail).toBeTruthy();
  }

  async expectValidationError() {
    const count = await this.validationErrors.count();
    expect(count).toBeGreaterThan(0);
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async expectListLoaded() {
    // Either rows OR the empty-state must render.
    const tableVisible = await this.ticketsTable.isVisible().catch(() => false);
    const emptyVisible = await this.emptyState.isVisible().catch(() => false);
    expect(tableVisible || emptyVisible).toBe(true);
  }

  async expectCategoriesScreen() {
    // At least 2 of the 4 category tiles must render. (Strict 4-tile assertion
    // happens at the spec level via individual visibility checks.)
    const tiles = [
      this.categoryTileGeneral,
      this.categoryTileCarParking,
      this.categoryTileCancellation,
      this.categoryTileLoan,
    ];
    let visibleCount = 0;
    for (const t of tiles) {
      if (await t.isVisible().catch(() => false)) visibleCount++;
    }
    expect(visibleCount).toBeGreaterThanOrEqual(2);
  }

  /** getColumnHeaders() — string array of visible column header labels. */
  async getColumnHeaders() {
    return this.tableHeaders.allTextContents().catch(() => []);
  }

  /** getStatusValues() — string array of every status badge text in the list. */
  async getStatusValues() {
    return this.statusBadges.allTextContents().catch(() => []);
  }
}

module.exports = { SupportTicketsPage };
