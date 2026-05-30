'use strict';

/**
 * JbpPage.js — Page Object Model for the Admin Portal JBP Management module.
 *
 * What this file does:
 *   The JBP (Joint Business Plan) module is the admin surface for managing
 *   quarterly business-plan cycles, reviewing Channel Partner submissions,
 *   and approving/rejecting edit requests. The page exposes three top-level
 *   tabs: Cycle Management, Submissions, Edit Requests. This POM wraps every
 *   UI interaction on /admin/jbp-management into reusable atomic methods.
 *
 * How selectors work:
 *   All CSS/text selectors live in locators/admin/locator-map.json under the
 *   "jbp" module key. We load that once into `L` and use bracket notation
 *   (`L['key'].selector`) per CLAUDE.md rules. When the live site changes a
 *   selector, only the JSON needs editing — no test-code change required.
 *
 * Destructive scope:
 *   Cycle create/close, edit-request approve/reject all hit the real backend
 *   on UAT — they emit WhatsApp notifications via Kaleyra and write to the
 *   jbp_cycles, jbp_submissions, jbp_edit_requests tables. All mutation
 *   specs guard with `ENV=uat && !ALLOW_DESTRUCTIVE`.
 *
 * BRD: .claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-JBP-Management.md
 * FSD: manual-qa-repository/03-user-manual/admin/fsd-jbp-management.md
 * TC source: manual-qa-repository/01-test-cases/admin-portal/jbp/TC_JBP.md
 */

const { BasePage } = require('../../base/BasePage');
const locatorMap   = require('../../../locators/admin/locator-map.json');

// Bracket access (per CLAUDE.md rule) — `L['key']` instead of `L.key`.
const L = locatorMap['jbp'] || {};

// Per TC_JBP.md §ADM_JBP_001 — canonical URL is /admin/jbp-management
// (legacy /admin/jbp redirects to this path).
const JBP_URL = 'https://uat-web.xrportal.in/admin/jbp-management';

class JbpPage extends BasePage {
  /**
   * constructor — called once per test (in beforeEach) via `new JbpPage(page)`.
   *
   * Each `this.xxx = page.locator(...)` line creates a lazy locator reference.
   * Playwright resolves it on every use, so we never see stale-element errors
   * when the tab content re-renders.
   *
   * The `&& L[key].selector` guard means: if the locator map is missing the
   * key (e.g. mid-sync state) we pass `undefined` to page.locator(), which
   * surfaces a clear error at test time instead of crashing at construction.
   */
  constructor(page) {
    super(page);
    this.L = L;
    this.url = JBP_URL;

    // ── Sidebar navigation links ────────────────────────────────────────────
    // The left-hand admin menu — used in cross-module navigation specs.
    this.allocationLink         = page.locator(L['allocationLink']         && L['allocationLink'].selector);
    this.customersLink          = page.locator(L['customersLink']          && L['customersLink'].selector);
    this.configLink             = page.locator(L['configLink']             && L['configLink'].selector);
    this.offersLink             = page.locator(L['offersLink']             && L['offersLink'].selector);
    this.towersLink             = page.locator(L['towersLink']             && L['towersLink'].selector);
    this.jBPMgmtLink            = page.locator(L['jBPMgmtLink']            && L['jBPMgmtLink'].selector);
    this.channelPartnersLink    = page.locator(L['channelPartnersLink']    && L['channelPartnersLink'].selector);
    this.salesManagersLink      = page.locator(L['salesManagersLink']      && L['salesManagersLink'].selector);
    this.transactionsLink       = page.locator(L['transactionsLink']       && L['transactionsLink'].selector);
    this.cMSLink                = page.locator(L['cMSLink']                && L['cMSLink'].selector);

    // ── Top-bar controls ─────────────────────────────────────────────────────
    this.logoutButton           = page.locator(L['logoutButton']           && L['logoutButton'].selector);
    this.refreshButton          = page.locator(L['refreshButton']          && L['refreshButton'].selector);
    this.filterButton           = page.locator(L['filterButton']           && L['filterButton'].selector);
    this.downloadButton         = page.locator(L['downloadButton']         && L['downloadButton'].selector);
    this.searchByPhoneInput     = page.locator(L['searchByPhoneInput']     && L['searchByPhoneInput'].selector);

    // ── Page heading / KPI marker ────────────────────────────────────────────
    // The "9682 Registration Records" heading is the page-level KPI tile —
    // confirms we landed on the JBP-management dashboard (not the login).
    this.registrationRecordsHeading = page.locator(L['9682RegistrationRecordsHeading'] && L['9682RegistrationRecordsHeading'].selector);

    // ── Tab triggers ─────────────────────────────────────────────────────────
    // The three top-level tabs are rendered as Ant Design Tabs. The locator
    // map crawl did not surface explicit keys for tab triggers yet (Tech Lead
    // Agent will add them in the next sync), so we use stable text-locator
    // fallbacks scoped to the tab role. These are derived selectors — when
    // explicit keys appear in locator-map.json under jbp.cycleManagementTab,
    // jbp.submissionsTab, jbp.editRequestsTab — replace the fallbacks below.
    this.cycleManagementTab     = page.locator('[role="tab"]:has-text("Cycle Management"), button:has-text("Cycle Management"), .ant-tabs-tab:has-text("Cycle Management")');
    this.submissionsTab         = page.locator('[role="tab"]:has-text("Submissions"), button:has-text("Submissions"), .ant-tabs-tab:has-text("Submissions")');
    this.editRequestsTab        = page.locator('[role="tab"]:has-text("Edit Requests"), button:has-text("Edit Requests"), .ant-tabs-tab:has-text("Edit Requests")');

    // ── Cycle Management — create form / list ───────────────────────────────
    // The Create Cycle CTA opens a modal with Name / Start Date / End Date /
    // Description fields. Derived selectors (Ant Modal + form items).
    this.createCycleButton      = page.locator('button:has-text("Create Cycle"), button:has-text("Create New Cycle"), button:has-text("+ Create")').first();
    this.cycleNameInput         = page.locator('input[placeholder*="Cycle Name" i], input[placeholder*="Name" i]').first();
    this.cycleStartDateInput    = page.locator('input[placeholder*="Start Date" i], .ant-picker input').first();
    this.cycleEndDateInput      = page.locator('input[placeholder*="End Date" i], .ant-picker input').nth(1);
    this.cycleDescriptionInput  = page.locator('textarea[placeholder*="Description" i], input[placeholder*="Description" i]').first();
    this.submitCycleButton      = page.locator('.ant-modal:visible button.ant-btn-primary:has-text("Submit"), .ant-modal:visible button.ant-btn-primary:has-text("Create"), .ant-modal:visible button.ant-btn-primary:has-text("Save")').first();

    // ── Tables (Ant Design) ──────────────────────────────────────────────────
    // The same .ant-table renders for cycles, submissions, edit-requests —
    // the surrounding tab decides what's loaded. Scoping by visible tab-pane.
    this.activeTabPane          = page.locator('.ant-tabs-tabpane-active');
    this.dataTable              = this.activeTabPane.locator('table, .ant-table');
    this.tableRows              = this.activeTabPane.locator('.ant-table-tbody > tr.ant-table-row');
    this.tableHeaders           = this.activeTabPane.locator('.ant-table-thead th');

    // ── Status badges & toasts ──────────────────────────────────────────────
    this.statusBadges           = page.locator('.ant-tag, [class*="status"]');
    this.successToast           = page.locator('.ant-message-success, .ant-notification-notice-success');
    this.errorToast             = page.locator('.ant-message-error, .ant-notification-notice-error, .ant-form-item-explain-error');

    // ── Modals / confirms ───────────────────────────────────────────────────
    this.confirmModal           = page.locator('.ant-modal:visible, .ant-popconfirm:visible');
    this.confirmYesButton       = page.locator('.ant-modal:visible button.ant-btn-primary, .ant-popconfirm:visible button.ant-btn-primary');
    this.confirmNoButton        = page.locator('.ant-modal:visible button.ant-btn-default, .ant-popconfirm:visible button.ant-btn-default');

    // ── Review modal — Edit Request workflow ────────────────────────────────
    // The review modal opens when an admin clicks an Edit Request row.
    // It exposes the editWindow (hours) input on the Approve path and an
    // adminComment textarea on the Reject path (per FSD-CORRECTION 032/034).
    this.reviewModal            = page.locator('.ant-modal:visible:has-text("Edit Request"), .ant-modal:visible:has-text("Review")');
    this.editWindowInput        = page.locator('.ant-modal:visible input[placeholder*="hour" i], .ant-modal:visible input[placeholder*="window" i]').first();
    this.adminCommentInput      = page.locator('.ant-modal:visible textarea[placeholder*="reason" i], .ant-modal:visible textarea[placeholder*="comment" i]').first();
    this.approveButton          = page.locator('.ant-modal:visible button:has-text("Approve")').first();
    this.rejectButton           = page.locator('.ant-modal:visible button:has-text("Reject")').first();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /**
   * navigate() — go directly to the JBP Management URL.
   * Called in beforeEach so each test starts on a clean page with no leftover
   * tab/filter/modal state from a previous test.
   */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * waitForLoad() — wait until the JBP page is fully interactive.
   * We race for any of: the tab strip, the data table, or the page heading.
   * Whichever appears first signals the React app has hydrated.
   */
  async waitForLoad() {
    await Promise.race([
      this.cycleManagementTab.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.dataTable.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.registrationRecordsHeading.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * navigateViaSidebar() — click the "JBP Mgmt" link in the sidebar.
   * Verifies the sidebar route works (ADM_JBP_001 sub-flow).
   * Uses .first() because Ant Design renders duplicate <a> tags for
   * collapsed and expanded sidebar states.
   */
  async navigateViaSidebar() {
    await this.jBPMgmtLink.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.jBPMgmtLink.first().click();
    await this.page.waitForURL(/\/admin\/jbp/, { timeout: 15_000 });
    await this.waitForLoad();
  }

  /**
   * expectOnJbpUrl() — assert we are on the JBP-management page.
   * Accepts both /admin/jbp and /admin/jbp-management for legacy-redirect
   * resilience.
   */
  async expectOnJbpUrl() {
    await this.page.waitForURL(/\/admin\/jbp/, { timeout: 15_000 });
  }

  // ── Tab navigation ────────────────────────────────────────────────────────

  /**
   * switchToCyclesTab() — click the Cycle Management tab.
   * After clicking, we wait for the table inside the active pane to render
   * so the caller can immediately read rows / interact with controls.
   */
  async switchToCyclesTab() {
    await this.cycleManagementTab.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.cycleManagementTab.first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * switchToSubmissionsTab() — click the Submissions tab.
   * Used by ADM_JBP_004 + every Submissions-related TC.
   */
  async switchToSubmissionsTab() {
    await this.submissionsTab.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.submissionsTab.first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * switchToEditRequestsTab() — click the Edit Requests tab.
   * Used by ADM_JBP_005, ADM_JBP_030..036, edit-request review flows.
   */
  async switchToEditRequestsTab() {
    await this.editRequestsTab.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.editRequestsTab.first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * getActiveTabName() — returns the text of the currently-selected tab.
   * Used by ADM_JBP_003 (Cycle Management is the default active tab).
   */
  async getActiveTabName() {
    const active = this.page.locator('.ant-tabs-tab-active, [role="tab"][aria-selected="true"]').first();
    const exists = await active.count();
    if (!exists) return null;
    return ((await active.textContent()) || '').trim();
  }

  // ── Cycle Management ──────────────────────────────────────────────────────

  /**
   * openCreateCycleModal() — click the Create Cycle CTA on the Cycle
   * Management tab. Waits for the modal form to be visible so the caller
   * can immediately fill it. Used by ADM_JBP_009, ADM_JBP_010..013.
   */
  async openCreateCycleModal() {
    await this.switchToCyclesTab();
    await this.createCycleButton.waitFor({ state: 'visible', timeout: 10_000 });
    await this.createCycleButton.click();
    await this.page.locator('.ant-modal:visible').first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * fillCycleDetails({name, startDate, endDate, description}) — fill the
   * Create Cycle modal form with the supplied values. Any undefined field is
   * left blank (used by NEG TCs like ADM_JBP_012 — empty name rejected).
   *
   * @param {Object}  args
   * @param {string} [args.name]        — Cycle Name (e.g. "Q4-2026")
   * @param {string} [args.startDate]   — YYYY-MM-DD or YYYY-MM-DD HH:mm
   * @param {string} [args.endDate]     — YYYY-MM-DD or YYYY-MM-DD HH:mm
   * @param {string} [args.description] — free-text description
   */
  async fillCycleDetails({ name, startDate, endDate, description } = {}) {
    if (name !== undefined) {
      await this.fill(this.cycleNameInput, name);
    }
    if (startDate !== undefined) {
      await this.cycleStartDateInput.click();
      await this.cycleStartDateInput.fill(startDate);
      await this.cycleStartDateInput.press('Enter').catch(() => {});
    }
    if (endDate !== undefined) {
      await this.cycleEndDateInput.click();
      await this.cycleEndDateInput.fill(endDate);
      await this.cycleEndDateInput.press('Enter').catch(() => {});
    }
    if (description !== undefined) {
      const descCount = await this.cycleDescriptionInput.count();
      if (descCount > 0) {
        await this.fill(this.cycleDescriptionInput, description);
      }
    }
  }

  /**
   * submitCycle() — click the modal's primary Submit/Create button to fire
   * the POST /api/v1/admin/jbp-cycles request. Waits for networkidle so the
   * caller can assert on either the toast or the list update.
   *
   * DESTRUCTIVE: live mutation on UAT. Guarded by ALLOW_DESTRUCTIVE=1.
   */
  async submitCycle() {
    await this.submitCycleButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * openCycle(cycleName) — click into a specific cycle row to view its
   * detail/expanded state. Returns the row locator for chained assertions.
   */
  async openCycle(cycleName) {
    await this.switchToCyclesTab();
    const row = this.page.locator('tr.ant-table-row', { hasText: cycleName }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.click();
    return row;
  }

  /**
   * getCyclesList() — read every row in the Cycle Management table.
   * Returns an array of {name, startDate, endDate, status} objects.
   *
   * Returns [] on empty state (no cycles created yet on UAT).
   */
  async getCyclesList() {
    await this.switchToCyclesTab();
    const count = await this.tableRows.count();
    const rows = [];
    for (let i = 0; i < count; i++) {
      const cells = this.tableRows.nth(i).locator('td');
      const cellCount = await cells.count();
      if (cellCount === 0) continue;
      rows.push({
        name:      (await cells.nth(0).textContent() || '').trim(),
        startDate: cellCount > 1 ? (await cells.nth(1).textContent() || '').trim() : '',
        endDate:   cellCount > 2 ? (await cells.nth(2).textContent() || '').trim() : '',
        status:    cellCount > 3 ? (await cells.nth(3).textContent() || '').trim() : '',
      });
    }
    return rows;
  }

  /**
   * closeCycle(cycleName) — click the Close Cycle button on a given OPEN row.
   * A confirmation popconfirm appears — we accept it and wait for the row's
   * status badge to flip to CLOSED.
   *
   * DESTRUCTIVE: live mutation. Guarded by ALLOW_DESTRUCTIVE=1.
   */
  async closeCycle(cycleName) {
    await this.switchToCyclesTab();
    const row = this.page.locator('tr.ant-table-row', { hasText: cycleName }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.locator('button:has-text("Close"), a:has-text("Close")').first().click();
    await this.confirmYesButton.first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ── Submissions ───────────────────────────────────────────────────────────

  /**
   * getSubmissionsList() — read every row in the Submissions table.
   * Returns an array of {cp, cycle, status, brokerage, ...} cell-text rows.
   * Used by ADM_JBP_019, ADM_JBP_039 (one-submission-per-CP-per-cycle).
   */
  async getSubmissionsList() {
    await this.switchToSubmissionsTab();
    const count = await this.tableRows.count();
    const rows = [];
    for (let i = 0; i < count; i++) {
      const cells = this.tableRows.nth(i).locator('td');
      const cellCount = await cells.count();
      if (cellCount === 0) continue;
      const cellText = [];
      for (let c = 0; c < cellCount; c++) {
        cellText.push((await cells.nth(c).textContent() || '').trim());
      }
      rows.push({
        cells: cellText,
        cp:     cellText[0] || '',
        cycle:  cellText[1] || '',
        status: cellText[cellText.length - 1] || '',
      });
    }
    return rows;
  }

  /**
   * openSubmissionDetail(rowIndex|identifier) — click View on a submission
   * row to open the 14-field read-only detail panel/modal.
   * Used by ADM_JBP_020..028 (every field-visibility TC).
   *
   * @param {number|string} target — either a row index (0-based) or a
   *                                  text fragment (CP name / phone) to match.
   */
  async openSubmissionDetail(target) {
    await this.switchToSubmissionsTab();
    let row;
    if (typeof target === 'number') {
      row = this.tableRows.nth(target);
    } else {
      row = this.page.locator('tr.ant-table-row', { hasText: String(target) }).first();
    }
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    // Try a View button inside the row first; fall back to clicking the row.
    const viewBtn = row.locator('button:has-text("View"), a:has-text("View")').first();
    if (await viewBtn.count()) {
      await viewBtn.click();
    } else {
      await row.click();
    }
    // The detail surfaces as either a modal or a side-panel — wait for
    // a visible drawer/modal element to confirm it's open.
    await Promise.race([
      this.page.locator('.ant-modal:visible').first().waitFor({ state: 'visible', timeout: 10_000 }),
      this.page.locator('.ant-drawer:visible').first().waitFor({ state: 'visible', timeout: 10_000 }),
    ]).catch(() => {});
  }

  /**
   * filterSubmissionsByCycle(cycleName) — apply the Cycle filter on the
   * Submissions tab. Used by ADM_JBP_029.
   */
  async filterSubmissionsByCycle(cycleName) {
    await this.switchToSubmissionsTab();
    const cycleFilter = this.page.locator('.ant-select:has-text("Cycle"), [placeholder*="Cycle" i]').first();
    await cycleFilter.click();
    const dropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await dropdown.waitFor({ state: 'visible', timeout: 5_000 });
    await dropdown.locator(`.ant-select-item-option:has-text("${cycleName}")`).first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ── Edit Requests ─────────────────────────────────────────────────────────

  /**
   * getEditRequestsList() — read every row in the Edit Requests table.
   * Returns an array of {cp, cycle, status, requestedAt, ...} rows.
   */
  async getEditRequestsList() {
    await this.switchToEditRequestsTab();
    const count = await this.tableRows.count();
    const rows = [];
    for (let i = 0; i < count; i++) {
      const cells = this.tableRows.nth(i).locator('td');
      const cellCount = await cells.count();
      if (cellCount === 0) continue;
      const cellText = [];
      for (let c = 0; c < cellCount; c++) {
        cellText.push((await cells.nth(c).textContent() || '').trim());
      }
      rows.push({
        cells: cellText,
        cp:     cellText[0] || '',
        cycle:  cellText[1] || '',
        status: cellText[cellText.length - 1] || '',
      });
    }
    return rows;
  }

  /**
   * openReviewModal(target) — click into an Edit Request row to open the
   * Review modal which exposes Approve/Reject actions.
   * Used by ADM_JBP_031, ADM_JBP_032..035, FSD_046, FSD_047.
   *
   * @param {number|string} target — row index or text fragment.
   */
  async openReviewModal(target) {
    await this.switchToEditRequestsTab();
    let row;
    if (typeof target === 'number') {
      row = this.tableRows.nth(target);
    } else {
      row = this.page.locator('tr.ant-table-row', { hasText: String(target) }).first();
    }
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    const reviewBtn = row.locator('button:has-text("Review"), button:has-text("View"), a:has-text("Review")').first();
    if (await reviewBtn.count()) {
      await reviewBtn.click();
    } else {
      await row.click();
    }
    await this.reviewModal.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * approveEditRequest({target, editWindow}) — open the Review modal for
   * the given row, enter the editWindow in hours, click Approve, accept
   * any confirmation. Per FSD-CORRECTION (ADM_JBP_032): Approve requires
   * `editWindow` (hours), NOT a reason text.
   *
   * @param {Object} args
   * @param {number|string} args.target     — row identifier
   * @param {number}        args.editWindow — hours, e.g. 24
   *
   * DESTRUCTIVE: writes to jbp_edit_requests. Guarded by ALLOW_DESTRUCTIVE=1.
   */
  async approveEditRequest({ target, editWindow = 24 } = {}) {
    await this.openReviewModal(target);
    const winCount = await this.editWindowInput.count();
    if (winCount > 0) {
      await this.fill(this.editWindowInput, String(editWindow));
    }
    await this.approveButton.click();
    // A nested confirm may appear ("Set editableUntil to ..."). Accept it.
    const confirmCount = await this.confirmYesButton.count();
    if (confirmCount > 0) {
      await this.confirmYesButton.first().click().catch(() => {});
    }
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * rejectEditRequest({target, reason}) — open the Review modal for the
   * given row, type the rejection reason into adminComment, click Reject.
   * Per ADM_JBP_034: Reject requires a written reason.
   * Per FSD-CORRECTION (ADM_JBP_035): Reject preserves the original
   * submission and emits NO CP notification.
   *
   * @param {Object} args
   * @param {number|string} args.target — row identifier
   * @param {string}        args.reason — admin comment text
   *
   * DESTRUCTIVE: writes to jbp_edit_requests. Guarded by ALLOW_DESTRUCTIVE=1.
   */
  async rejectEditRequest({ target, reason = 'Auto-test rejection' } = {}) {
    await this.openReviewModal(target);
    const commentCount = await this.adminCommentInput.count();
    if (commentCount > 0) {
      await this.fill(this.adminCommentInput, reason);
    }
    await this.rejectButton.click();
    const confirmCount = await this.confirmYesButton.count();
    if (confirmCount > 0) {
      await this.confirmYesButton.first().click().catch(() => {});
    }
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * filterEditRequestsByStatus(status) — apply the status filter on the
   * Edit Requests tab. Used by ADM_JBP_036, ADM_JBP_054 (EXPIRED filter).
   */
  async filterEditRequestsByStatus(status) {
    await this.switchToEditRequestsTab();
    const statusFilter = this.page.locator('.ant-select:has-text("Status"), [placeholder*="Status" i]').first();
    await statusFilter.click();
    const dropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await dropdown.waitFor({ state: 'visible', timeout: 5_000 });
    await dropdown.locator(`.ant-select-item-option:has-text("${status}")`).first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ── Assertion helpers ─────────────────────────────────────────────────────

  /**
   * expectCycleInList(cycleName) — assert a row containing the given cycle
   * name is visible in the Cycle Management table. Returns the row locator.
   */
  async expectCycleInList(cycleName) {
    await this.switchToCyclesTab();
    const row = this.page.locator('tr.ant-table-row', { hasText: cycleName }).first();
    await row.waitFor({ state: 'visible', timeout: 15_000 });
    return row;
  }

  /**
   * getCycleStatus(cycleName) — read the status cell text for a cycle row.
   * Returns null if the row is not found.
   */
  async getCycleStatus(cycleName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: cycleName }).first();
    const exists = await row.count();
    if (!exists) return null;
    const badge = row.locator('.ant-tag, td').last();
    return ((await badge.textContent()) || '').trim();
  }

  /**
   * expectToastSuccess() — assert a success toast/notification is visible.
   */
  async expectToastSuccess() {
    await this.successToast.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * expectValidationError(text) — assert a validation/error message is shown.
   * If `text` is supplied, also asserts the error contains that substring.
   */
  async expectValidationError(text) {
    const err = this.errorToast.first();
    await err.waitFor({ state: 'visible', timeout: 10_000 });
    if (text) {
      const actual = (await err.textContent()) || '';
      if (!actual.toLowerCase().includes(text.toLowerCase())) {
        throw new Error(`Expected error to contain "${text}", got "${actual}"`);
      }
    }
  }

  /**
   * expectModalVisible() — assert any Ant Design modal is open.
   * Used by the create-cycle and review-edit-request flows.
   */
  async expectModalVisible() {
    await this.page.locator('.ant-modal:visible').first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * dismissModal() — close any open Ant Design modal via Escape key.
   */
  async dismissModal() {
    await this.page.keyboard.press('Escape');
    await this.page.locator('.ant-modal:visible').first().waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  /**
   * futureDate(daysFromNow) — small utility for cycle date inputs.
   * Returns a YYYY-MM-DD string `daysFromNow` days in the future.
   */
  futureDate(daysFromNow) {
    const d = new Date(Date.now() + daysFromNow * 24 * 60 * 60_000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /**
   * pastDate(daysAgo) — utility for NEG TC ADM_JBP_052 (start date in past).
   */
  pastDate(daysAgo) {
    return this.futureDate(-Math.abs(daysAgo));
  }
}

module.exports = { JbpPage };
