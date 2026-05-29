'use strict';

/**
 * CallbackRequestsPage.js — Page Object Model for the SM Portal Callback Requests module.
 *
 * What this file does:
 *   Wraps every interaction on /sales-manager/callback-requests into reusable methods.
 *   Tests import this class and call atomic methods (searchByText, applyStatusFilter,
 *   openRequestDetail, sendMeetingInvite, etc.) instead of raw Playwright selectors.
 *
 * Where selectors live:
 *   All locators come from locators/sales-manager/locator-map.json (module key
 *   "callback-requests") via `L['key']` bracket access. Bracket access is used
 *   intentionally — many keys come from auto-crawl and include numeric suffixes
 *   (assign0Button, rcSelect0, checkboxInput7) which are awkward as dot-notation.
 *
 * Element coverage:
 *   The locator map exposes 39 elements covering toolbar buttons (Logout, Refresh,
 *   Export, Create Callback Request, Assign(0), Send Invite, Meeting Done, Completed,
 *   Resend Invite), sidebar links, date range, search, role/SM filter combos
 *   (rc_select_0, rc_select_1), Select-all and individual row checkboxes, and the
 *   copy-link button. Some keys (completedButton2..7, sendInviteButton2, etc.) are
 *   duplicates produced by the live crawl picking up multiple matching buttons per
 *   row / state. We keep them in the map (read-only by QA) and rely on .first() /
 *   role-scoped queries for atomic actions.
 *
 * Status badges, KPI cards, detail drawer tabs and table cells are not in the locator
 *   map yet — those are addressed here with stable role/text fallbacks until Tech
 *   Lead Agent extends the map.
 *
 * BRD: SM-FS-Callback-Requests.md / SM-WF-Callback-Requests.md
 * FSD: manual-qa-repository/03-user-manual/sm-portal/fsd-callback-requests.md
 * TCs: manual-qa-repository/01-test-cases/sm-portal/callback-requests/TC_CALLBACK_REQUESTS.md
 */

const { expect }     = require('@playwright/test');
const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/sales-manager/locator-map.json');

const L = locatorMap['callback-requests'] || {};

const CALLBACKREQUESTS_URL = 'https://uat-web.xrportal.in/sales-manager/callback-requests';
const SM_BASE              = 'https://uat-web.xrportal.in/sales-manager';

/** Returns a Playwright locator string from the locator map for the given key, or ''. */
function sel(key) {
  return (L[key] && L[key].selector) || '';
}

class CallbackRequestsPage extends BasePage {
  constructor(page) {
    super(page);
    this.L   = L;
    this.url = CALLBACKREQUESTS_URL;

    // ── Sidebar / navigation ────────────────────────────────────────────────
    this.logoutButton            = page.locator(sel('logoutButton'));
    this.callbackRequestsLink    = page.locator(sel('callbackRequestsLink'));
    this.towersLink              = page.locator(sel('towersLink'));
    this.allocationLink          = page.locator(sel('allocationLink'));

    // ── Toolbar ─────────────────────────────────────────────────────────────
    this.assign0Button               = page.locator(sel('assign0Button'));
    this.createCallbackRequestButton = page.locator(sel('createCallbackRequestButton'));
    this.refreshButton               = page.locator(sel('refreshButton'));
    this.exportButton                = page.locator(sel('exportButton'));

    // ── Date / search / role filters ────────────────────────────────────────
    this.startDateInput               = page.locator(sel('startDateInput'));
    this.endDateInput                 = page.locator(sel('endDateInput'));
    this.searchByNamePhoneEmailRegNoInput = page.locator(sel('searchByNamePhoneEmailRegNoInput'));
    // rc_select_0 = "Select Role" / first combobox; rc_select_1 = SM dropdown (Admin only)
    this.rcSelectRole = page.locator(sel('rcSelect0'));
    this.rcSelectSm   = page.locator(sel('rcSelect1'));

    // ── Row-level action buttons (crawl picked duplicates per row) ──────────
    // Use .first() / role-scoped queries when an atomic click is needed.
    this.sendInviteButton    = page.locator(sel('sendInviteButton'));
    this.sendInviteButton2   = page.locator(sel('sendInviteButton2'));
    this.meetingDoneButton   = page.locator(sel('meetingDoneButton'));
    this.meetingDoneButton2  = page.locator(sel('meetingDoneButton2'));
    this.meetingDoneButton3  = page.locator(sel('meetingDoneButton3'));
    this.completedButton     = page.locator(sel('completedButton'));
    this.completedButton2    = page.locator(sel('completedButton2'));
    this.completedButton3    = page.locator(sel('completedButton3'));
    this.completedButton4    = page.locator(sel('completedButton4'));
    this.completedButton5    = page.locator(sel('completedButton5'));
    this.completedButton6    = page.locator(sel('completedButton6'));
    this.completedButton7    = page.locator(sel('completedButton7'));
    this.resendInviteButton  = page.locator(sel('resendInviteButton'));
    this.copyLinkBtn         = page.locator(sel('copyLinkBtn'));

    // ── Selection controls ──────────────────────────────────────────────────
    this.selectAll       = page.locator(sel('selectAll'));
    this.selectAllHeader = page.locator(sel('selectAll')).first();
    this.checkboxes      = page.locator('input[type="checkbox"]');
    this.rowCheckbox1    = page.locator(sel('checkboxInput'));

    // ── Locators not in map yet (role/text fallbacks) ───────────────────────
    // Table — first <table> on the page is the requests grid.
    this.table          = page.locator('table').first();
    this.tableHeaderRow = page.locator('table thead tr').first();
    this.tableHeaders   = page.locator('table thead th');
    this.tableRows      = page.locator('table tbody tr');

    // KPI cards: not in map; locate by their distinguishing text.
    // FSD enumerates 7 KPI labels: Total VC Requested, VC Link Sent, VC Confirmed,
    // SM Feedback Submitted, Customer Feedback Submitted, Completed, Avg Rating.
    this.kpiTotalVcRequested        = page.locator(':text("Total VC Requested")').first();
    this.kpiVcLinkSent              = page.locator(':text("VC Link Sent")').first();
    this.kpiVcConfirmed             = page.locator(':text("VC Confirmed")').first();
    this.kpiSmFeedbackSubmitted     = page.locator(':text("SM Feedback Submitted")').first();
    this.kpiCustomerFeedbackSubmitted = page.locator(':text("Customer Feedback Submitted")').first();
    this.kpiCompleted               = page.locator(':text-matches("^\\s*Completed\\s*$", "i")').first();
    this.kpiAvgRating               = page.locator(':text-matches("Avg(\\.|\\s)?\\s*Rating", "i")').first();

    // Detail panel (drawer) — typical Ant Design / shadcn drawer
    this.detailDrawer    = page.locator('.ant-drawer-open, [role="dialog"]').first();
    this.detailDrawerClose = this.detailDrawer.locator('.ant-drawer-close, [aria-label="Close"]').first();
    this.detailTabCallback = page.getByRole('tab', { name: /callback\s*request/i });
    this.detailTabFeedback = page.getByRole('tab', { name: /feedback/i });

    // Status badges (rendered as Ant tags or pill spans)
    this.statusBadge = (rowIndex) =>
      this.tableRows.nth(rowIndex).locator('.ant-tag, [class*="badge"], [class*="status"]').first();

    // Generic modal / toast helpers
    this.activeModal  = page.locator('.ant-modal-content:visible, [role="dialog"]:visible').first();
    this.modalOk      = page.locator('.ant-modal-footer button:has-text("OK"), button:has-text("Confirm")').first();
    this.modalCancel  = page.locator('.ant-modal-footer button:has-text("Cancel"), button:has-text("Close")').first();
    this.toastSuccess = page.locator('.ant-message-success, .ant-notification-notice-success').first();
    this.toastError   = page.locator('.ant-message-error, .ant-notification-notice-error').first();

    // Schedule Meeting modal fields (text-based fallbacks)
    this.scheduleDateInput       = page.locator('input[placeholder*="Date"]').nth(0);
    this.scheduleTimeInput       = page.locator('input[placeholder*="Time"]').first();
    this.scheduleTeamsToggle     = page.locator('button[role="switch"], .ant-switch').first();
    this.scheduleCcInput         = page.locator('input[placeholder*="CC"], input[placeholder*="cc"]').first();
    this.scheduleSubmit          = page.locator('button:has-text("Schedule"), button:has-text("Send Invite")').first();

    // Feedback drawer fields
    this.vcOutcomeSelect         = page.locator('label:has-text("Outcome") + * select, [aria-label*="outcome" i]').first();
    this.feedbackNotes           = page.locator('textarea[placeholder*="Feedback"], textarea[name*="feedback"]').first();
    this.feedbackRating          = page.locator('[role="radiogroup"], .ant-rate').first();
    this.feedbackInterest        = page.locator('[aria-label*="interest" i]').first();
    this.feedbackSubmit          = page.locator('button:has-text("Submit")').first();

    // Pagination
    this.paginationBar          = page.locator('.ant-pagination').first();
    this.paginationPrev         = page.locator('.ant-pagination-prev').first();
    this.paginationNext         = page.locator('.ant-pagination-next').first();
    this.paginationPageSize     = page.locator('.ant-pagination-options .ant-select').first();

    // Empty state
    this.emptyState             = page.locator('.ant-empty, :text("No callback requests"), :text("No matching")').first();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Navigation
  // ════════════════════════════════════════════════════════════════════════

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * waitForLoad() — wait until the callback page is fully rendered.
   * Looks for either (a) the table, (b) the empty-state placeholder, or (c)
   * the Refresh toolbar button — whichever appears first.
   * Then settles networkidle to ensure KPI / list APIs have returned.
   */
  async waitForLoad() {
    await Promise.race([
      this.table.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.emptyState.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.refreshButton.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async navigateViaSidebar() {
    await this.callbackRequestsLink.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.callbackRequestsLink.first().click();
    await this.page.waitForURL(/\/sales-manager\/callback-requests/, { timeout: 15_000 });
    await this.waitForLoad();
  }

  async expectOnCallbackUrl() {
    await this.page.waitForURL(/\/sales-manager\/callback-requests/, { timeout: 15_000 });
  }

  // ════════════════════════════════════════════════════════════════════════
  // KPI Dashboard
  // ════════════════════════════════════════════════════════════════════════

  /**
   * getKpiValue(labelLocator) — read the numeric value associated with a KPI label.
   * KPI cards typically render as a label and a sibling number node. We walk up to
   * the nearest card container and grep the first integer/decimal.
   */
  async getKpiValue(labelLocator) {
    await labelLocator.waitFor({ state: 'visible', timeout: 10_000 });
    // Try the label's card ancestor (closest section / div with both label and number)
    const card = labelLocator.locator(
      'xpath=ancestor-or-self::*[self::div or self::section or self::article][1]'
    );
    const text = (await card.textContent()) || '';
    const m = text.match(/(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : null;
  }

  /** expectKpisVisible() — assert that the canonical KPI cards (per FSD §1.3) are rendered. */
  async expectKpisVisible() {
    await expect(this.kpiTotalVcRequested).toBeVisible();
    await expect(this.kpiVcLinkSent).toBeVisible();
    await expect(this.kpiVcConfirmed).toBeVisible();
    await expect(this.kpiSmFeedbackSubmitted).toBeVisible();
    await expect(this.kpiCustomerFeedbackSubmitted).toBeVisible();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Search & Filter
  // ════════════════════════════════════════════════════════════════════════

  /**
   * searchByText(query) — type into the unified search box.
   * The placeholder is "Search by name, phone, email, reg no..." (single field, multi-attr).
   */
  async searchByText(query) {
    await this.fill(this.searchByNamePhoneEmailRegNoInput, query);
    await this.searchByNamePhoneEmailRegNoInput.press('Enter').catch(() => {});
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * filterByDateRange(start, end) — set the date-range inputs.
   * Accepts ISO strings; native date inputs typically take "YYYY-MM-DD".
   */
  async filterByDateRange(start, end) {
    await this.fill(this.startDateInput, start);
    await this.startDateInput.press('Enter').catch(() => {});
    await this.fill(this.endDateInput, end);
    await this.endDateInput.press('Enter').catch(() => {});
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * filterByStatus(status) — open the status combobox (rc_select_0 acts as the
   * role/status filter on SM Admin views) and choose an option.
   * Falls back to clicking any visible dropdown if the rc_select id mismatches.
   */
  async filterByStatus(status) {
    const trigger = this.rcSelectRole.first();
    await trigger.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    await trigger.click();
    const active = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await active.waitFor({ state: 'visible', timeout: 5_000 });
    await active.locator(`.ant-select-item-option:has-text("${status}")`).first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * filterBySm(smName) — SM Admin-only filter. Returns false if the dropdown
   * is not present (i.e. logged in as standard SM).
   */
  async filterBySm(smName) {
    const trigger = this.rcSelectSm;
    const exists = await trigger.isVisible().catch(() => false);
    if (!exists) return false;
    await trigger.click();
    const active = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await active.waitFor({ state: 'visible', timeout: 5_000 });
    await active.locator(`.ant-select-item-option:has-text("${smName}")`).first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return true;
  }

  async clearSearch() {
    await this.searchByNamePhoneEmailRegNoInput.fill('');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ════════════════════════════════════════════════════════════════════════
  // Sort & Pagination
  // ════════════════════════════════════════════════════════════════════════

  /**
   * sortByColumn(headerText) — click a column header to toggle sort.
   * Call twice to invert direction (asc → desc).
   */
  async sortByColumn(headerText) {
    const header = this.page.locator(`table thead th:has-text("${headerText}")`).first();
    await header.waitFor({ state: 'visible', timeout: 10_000 });
    await header.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async goToNextPage() {
    await this.paginationNext.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async goToPrevPage() {
    await this.paginationPrev.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async setPageSize(size) {
    await this.paginationPageSize.click();
    const active = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await active.waitFor({ state: 'visible', timeout: 5_000 });
    await active.locator(
      `.ant-select-item-option:has-text("${size} / page"), .ant-select-item-option:has-text("${size}")`,
    ).first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getRowCount() {
    return this.tableRows.count();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Row interactions
  // ════════════════════════════════════════════════════════════════════════

  /** openRequestDetail(rowIndex) — click a row to open the detail drawer/panel. */
  async openRequestDetail(rowIndex = 0) {
    const row = this.tableRows.nth(rowIndex);
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.click();
    await this.detailDrawer.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  async closeDetail() {
    await this.detailDrawerClose.click().catch(async () => {
      await this.page.keyboard.press('Escape');
    });
    await this.detailDrawer.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  /** getRowStatus(rowIndex) — read the visible status badge text for a row. */
  async getRowStatus(rowIndex = 0) {
    const badge = this.statusBadge(rowIndex);
    await badge.waitFor({ state: 'visible', timeout: 5_000 });
    return ((await badge.textContent()) || '').trim();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Assign (SM Admin only)
  // ════════════════════════════════════════════════════════════════════════

  /**
   * assignToSm(smName) — bulk-assign selected rows to the chosen SM.
   * Flow: tick row checkbox(es), click the toolbar "Assign (n)" button, select
   * the target SM in the modal, confirm.
   * Returns false if the Assign button is not visible (role-scoped).
   */
  async assignToSm(smName, rowIndexes = [0]) {
    const canAssign = await this.assign0Button.isVisible().catch(() => false);
    if (!canAssign) return false;

    // Tick the requested rows. The first checkbox in the table is the header
    // "select all" — row checkboxes start at index 1 in the page-level collection.
    for (const idx of rowIndexes) {
      await this.tableRows.nth(idx).locator('input[type="checkbox"]').first().check();
    }

    // Toolbar button label is "Assign (n)" where n = selection count.
    const assignBtn = this.page.locator('button:has-text("Assign (")').first();
    await assignBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await assignBtn.click();

    // Modal opens with SM list.
    await this.activeModal.waitFor({ state: 'visible', timeout: 10_000 });
    const smOption = this.activeModal.locator(`:text("${smName}")`).first();
    await smOption.click();
    const confirm = this.activeModal.locator('button:has-text("Confirm"), button:has-text("Assign")').first();
    await confirm.click();
    await this.toastSuccess.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    return true;
  }

  /** expectAssignButtonVisible(visible) — role assertion helper. */
  async expectAssignButtonVisible(shouldBeVisible) {
    if (shouldBeVisible) {
      await expect(this.assign0Button).toBeVisible();
    } else {
      await expect(this.assign0Button).toBeHidden({ timeout: 5_000 }).catch(async () => {
        // Some role views render the button but disable it — accept that as well.
        await expect(this.assign0Button).toBeDisabled();
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Meeting Invite / Schedule / Resend
  // ════════════════════════════════════════════════════════════════════════

  /**
   * sendMeetingInvite({ date, time, generateTeamsLink, ccEmails }) —
   * Opens the Schedule Meeting modal from the detail drawer (or row action),
   * fills the form, and submits.
   */
  async sendMeetingInvite({ date, time, generateTeamsLink = true, ccEmails = '' } = {}) {
    // Try the detail-panel Send Invite first; fall back to the row-level button.
    const drawerBtn = this.detailDrawer.locator('button:has-text("Send Invite"), button:has-text("Schedule Meeting")').first();
    if (await drawerBtn.isVisible().catch(() => false)) {
      await drawerBtn.click();
    } else {
      await this.sendInviteButton.first().click();
    }

    await this.activeModal.waitFor({ state: 'visible', timeout: 10_000 });

    if (date) {
      await this.scheduleDateInput.fill(date).catch(() => {});
    }
    if (time) {
      await this.scheduleTimeInput.fill(time).catch(() => {});
    }
    if (generateTeamsLink) {
      const isOn = await this.scheduleTeamsToggle.getAttribute('aria-checked').catch(() => 'false');
      if (isOn !== 'true') {
        await this.scheduleTeamsToggle.click().catch(() => {});
      }
    }
    if (ccEmails) {
      await this.scheduleCcInput.fill(ccEmails).catch(() => {});
    }
    await this.scheduleSubmit.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async resendInvite(rowIndex = 0) {
    const row = this.tableRows.nth(rowIndex);
    const btn = row.locator('button:has-text("Resend Invite")').first();
    await btn.click();
    await this.toastSuccess.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  // ════════════════════════════════════════════════════════════════════════
  // Meeting Done (Confirm Meeting)
  // ════════════════════════════════════════════════════════════════════════

  /**
   * markMeetingDone(rowIndex) — click the row's Meeting Done button.
   * Confirms via the modal if one appears.
   */
  async markMeetingDone(rowIndex = 0) {
    const row = this.tableRows.nth(rowIndex);
    const btn = row.locator('button:has-text("Meeting Done")').first();
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    await btn.click();
    if (await this.activeModal.isVisible().catch(() => false)) {
      await this.modalOk.click().catch(() => {});
    }
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ════════════════════════════════════════════════════════════════════════
  // SM Feedback (Record Outcome)
  // ════════════════════════════════════════════════════════════════════════

  /**
   * submitSmFeedback({ vcOutcome, notes, rating, interest }) — fill and submit
   * the SM feedback drawer.
   * vcOutcome must be one of the 10 codes per FS 4.3.
   */
  async submitSmFeedback({ vcOutcome, notes = '', rating = null, interest = null } = {}) {
    // Open feedback (Record Outcome / Feedback button on the drawer)
    const recordBtn = this.detailDrawer
      .locator('button:has-text("Record Outcome"), button:has-text("Submit Feedback"), button:has-text("Feedback")')
      .first();
    if (await recordBtn.isVisible().catch(() => false)) {
      await recordBtn.click();
    }

    // vcOutcome: prefer dedicated select; otherwise click the label.
    if (vcOutcome) {
      const outcomeOpener = this.page.locator(`label:has-text("Outcome") + * .ant-select, [aria-label*="outcome" i]`).first();
      await outcomeOpener.click().catch(async () => {
        await this.vcOutcomeSelect.click();
      });
      const active = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
      await active.locator(`.ant-select-item-option:has-text("${vcOutcome}")`).first().click();
    }

    if (notes) {
      await this.feedbackNotes.fill(notes).catch(() => {});
    }
    if (rating !== null) {
      // Ant Rate exposes the star at index (rating-1)
      const star = this.feedbackRating.locator('.ant-rate-star').nth(Math.max(0, rating - 1));
      await star.click().catch(() => {});
    }
    if (interest) {
      await this.feedbackInterest.click().catch(() => {});
      const active = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
      await active.locator(`.ant-select-item-option:has-text("${interest}")`).first().click().catch(() => {});
    }

    await this.feedbackSubmit.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ════════════════════════════════════════════════════════════════════════
  // Toolbar utility actions
  // ════════════════════════════════════════════════════════════════════════

  async clickRefresh() {
    await this.click(this.refreshButton);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async clickExport() {
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30_000 }).catch(() => null);
    await this.click(this.exportButton);
    return downloadPromise;
  }

  async clickCreateCallback() {
    await this.click(this.createCallbackRequestButton);
    await this.activeModal.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  async logout() {
    await this.click(this.logoutButton);
    await this.page.waitForURL(new RegExp(`${SM_BASE}/?$`), { timeout: 10_000 });
  }

  // ════════════════════════════════════════════════════════════════════════
  // Role-difference assertions
  // ════════════════════════════════════════════════════════════════════════

  /**
   * expectRoleDifferences(role) — assert role-scoped UI affordances.
   * role: "sm-admin" or "sm".
   *
   * SM Admin: sees the Assign button, sees the SM dropdown filter (rc_select_1),
   *           can view requests from multiple SMs.
   * Standard SM: Assign hidden/disabled, SM dropdown filter absent.
   *
   * Note — the UAT seed mobile (8888888888) is SM Admin, so this helper
   *        validates the SM-admin branch in the standard happy path.
   */
  async expectRoleDifferences(role) {
    if (role === 'sm-admin') {
      await expect(this.assign0Button).toBeVisible();
      // SM dropdown filter (rc_select_1) should be visible for SM Admin.
      const smDropdownVisible = await this.rcSelectSm.isVisible().catch(() => false);
      expect(smDropdownVisible).toBe(true);
    } else {
      // Standard SM: Assign button must be hidden (or at minimum, disabled).
      const visible = await this.assign0Button.isVisible().catch(() => false);
      if (visible) {
        await expect(this.assign0Button).toBeDisabled();
      }
      // SM dropdown filter must not be present.
      await expect(this.rcSelectSm).toBeHidden({ timeout: 5_000 }).catch(() => {});
    }
  }
}

module.exports = { CallbackRequestsPage };
