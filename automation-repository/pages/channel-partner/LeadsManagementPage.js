'use strict';

/**
 * LeadsManagementPage.js — Page Object Model for the Channel Partner Portal Leads module.
 *
 * What this file does:
 *   Wraps every UI interaction on the CP Leads page into reusable methods. Tests call
 *   `searchLead('John')`, `filterByStatus('Sent')`, etc. instead of writing raw selectors.
 *
 * How selectors work:
 *   All locators come from `locators/channel-partner/locator-map.json` under the
 *   `leads-management` module key. We use bracket access `L['key']` to honour the
 *   project's selector rule. The locator map is owned by the Tech Lead Agent.
 *
 * Backend implementation notes (per CP-FS-Leads-Management FSD, 2026-05-25):
 *   - Leads are stored in the `registration_drafts` table (NOT LeadSquared)
 *   - Status filter accepts only: `Sent` | `Registered` | `Refunded`
 *     (DB `Open`/`Lost` map to UI `Sent`; DB `Won` maps to UI `Registered`)
 *   - There is NO in-list "Convert to Registration" button — the Buyer self-registers
 *     via the WhatsApp link `${registrationUrl}/ref/${encryptedSlug}`. The
 *     `convertLeadToRegistration` method below opens a lead's row to surface its
 *     copy/resend controls (the closest equivalent in the actual UI).
 *
 * BRD: CP-BRD-CP-Portal · FSD: CP-FS-Leads-Management
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['leads-management'] || {};

const LEADSMANAGEMENT_URL = 'https://uat-web.xrportal.in/leads';

class LeadsManagementPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = LEADSMANAGEMENT_URL;

    // ── Element locators (sourced from locator-map.json via L['key']) ────────
    // Header / nav
    this.leadsHeading                   = page.locator(L['leadsHeading'] && L['leadsHeading'].selector);
    this.homeLink                       = page.locator(L['homeLink'] && L['homeLink'].selector);
    this.kYCLink                        = page.locator(L['kYCLink'] && L['kYCLink'].selector);
    this.jBPLink                        = page.locator(L['jBPLink'] && L['jBPLink'].selector);
    this.leadsLink                      = page.locator(L['leadsLink'] && L['leadsLink'].selector);
    this.logoutButton                   = page.locator(L['logoutButton'] && L['logoutButton'].selector);

    // Search input — typeahead on lead first/last name and phone
    this.searchCustomerInput            = page.locator(L['searchCustomerInput'] && L['searchCustomerInput'].selector);

    // Ant Design rc-select dropdowns — used on this page for Status filter and
    // Lead Source / Sort. The exact mapping depends on render order:
    //   rcSelect0 — Status filter (Sent / Registered / Refunded)
    //   rcSelect1 — Lead Source / project filter
    //   rcSelect2 — Sort (date ascending / descending)
    this.statusFilterSelect             = page.locator(L['rcSelect0'] && L['rcSelect0'].selector);
    this.sourceFilterSelect             = page.locator(L['rcSelect1'] && L['rcSelect1'].selector);
    this.sortSelect                     = page.locator(L['rcSelect2'] && L['rcSelect2'].selector);

    // Resend Notification / Copy Link — one set of buttons per lead row.
    // The locator map has 3 numbered variants because the live crawl captured
    // 3 visible rows at scaffold time.
    this.resendNotificationButton       = page.locator(L['resendNotificationButton'] && L['resendNotificationButton'].selector);
    this.resendNotificationButton2      = page.locator(L['resendNotificationButton2'] && L['resendNotificationButton2'].selector);
    this.resendNotificationButton3      = page.locator(L['resendNotificationButton3'] && L['resendNotificationButton3'].selector);
    this.copyLinkButton                 = page.locator(L['copyLinkButton'] && L['copyLinkButton'].selector);
    this.copyLinkButton2                = page.locator(L['copyLinkButton2'] && L['copyLinkButton2'].selector);
    this.copyLinkButton3                = page.locator(L['copyLinkButton3'] && L['copyLinkButton3'].selector);

    // Convenience locator-collections — match ALL Resend/Copy buttons on the page,
    // useful for counting visible rows.
    this.allResendButtons               = page.locator('button:has-text("Resend Notification")');
    this.allCopyLinkButtons             = page.locator('button:has-text("Copy Link")');

    // Generic row + empty-state heuristics (no row-class in locator map yet).
    // These look for elements likely to be lead-card containers; empty/loading
    // states fall back to text matchers.
    this.leadRows                       = page.locator('div').filter({ has: page.locator('button:has-text("Resend Notification")') });
    this.emptyState                     = page.locator(':text-matches("No leads|No results|No data", "i")');
    this.loadingIndicator               = page.locator('.ant-spin, .loading, [data-testid="loading"]');
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  /**
   * navigate() — go directly to the Leads URL.
   * Called in beforeEach so every test starts on a clean Leads page.
   */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * waitForLoad() — wait until the Leads heading is visible and network settles.
   * The "Leads" h3 heading is the page-ready indicator per the locator map.
   */
  async waitForLoad() {
    await this.leadsHeading.waitFor({ state: 'visible', timeout: 15_000 });
    await this.page.waitForLoadState('networkidle');
  }

  // ── Search / filter / sort ──────────────────────────────────────────────────

  /**
   * searchLead(query) — type a query (name or phone) into the Search Customer box.
   * The list filters as you type; we press Enter as well for inputs that
   * commit on Enter rather than blur.
   *
   * Backend note: search hits `?search=` and the controller does
   * `JSON_UNQUOTE(JSON_EXTRACT(draft,'$.firstName/$.lastName/$.phone'))` —
   * so both name and phone queries are valid (BR-CP-LEAD-12).
   */
  async searchLead(query) {
    await this.fill(this.searchCustomerInput, query);
    await this.searchCustomerInput.press('Enter').catch(() => { /* commits on blur for some inputs */ });
    await this.page.waitForLoadState('networkidle');
  }

  /** clearSearch() — empty the search box and restore the full list. */
  async clearSearch() {
    await this.searchCustomerInput.fill('');
    await this.searchCustomerInput.press('Enter').catch(() => {});
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * filterByStatus(status) — pick a status from the Status dropdown.
   *
   * Valid status values (BR-CP-LEAD-13, cp.validations.js:197):
   *   'Sent' | 'Registered' | 'Refunded'
   *
   * @param {('Sent'|'Registered'|'Refunded')} status
   */
  async filterByStatus(status) {
    await this.click(this.statusFilterSelect);
    const activeDropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await activeDropdown.waitFor({ state: 'visible', timeout: 5_000 });
    await activeDropdown.locator(`.ant-select-item-option:has-text("${status}")`).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * sortByDate(direction) — pick a sort option from the sort dropdown.
   * @param {('asc'|'desc'|string)} direction — accepts free-form labels like
   *   'Latest', 'Oldest', 'Newest First'. The dropdown rendering is checked
   *   case-insensitively.
   */
  async sortByDate(direction = 'desc') {
    await this.click(this.sortSelect);
    const activeDropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await activeDropdown.waitFor({ state: 'visible', timeout: 5_000 });
    // Map common aliases to likely UI labels (case-insensitive .filter)
    const label = direction === 'asc' ? 'Oldest' : (direction === 'desc' ? 'Latest' : direction);
    await activeDropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(label, 'i') }).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Row interactions ────────────────────────────────────────────────────────

  /**
   * openLeadDetail(rowIndex) — click into a lead row to surface its action
   * controls (Copy Link / Resend). On this UI there isn't a separate detail
   * drawer — the row itself exposes the per-lead actions.
   *
   * @param {number} rowIndex — 0-based index of the lead row to open
   */
  async openLeadDetail(rowIndex = 0) {
    const row = this.leadRows.nth(rowIndex);
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * convertLeadToRegistration(rowIndex) — surface the conversion controls for a lead.
   *
   * IMPORTANT — there is NO in-list "Convert" button (per FSD 2026-05-25,
   * CP_LEAD_021 was testing non-existent UI). The conversion happens when the
   * Buyer clicks the WhatsApp `cp_link_share_latest` link sent on capture.
   *
   * This method therefore:
   *   1. Opens the lead row
   *   2. Clicks "Resend Notification" to re-dispatch the registration link
   *      (the closest in-UI action that progresses the lead toward conversion)
   *
   * @param {number} rowIndex
   */
  async convertLeadToRegistration(rowIndex = 0) {
    await this.openLeadDetail(rowIndex);
    const resendBtn = this.allResendButtons.nth(rowIndex);
    await resendBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await resendBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * copyLeadLink(rowIndex) — click "Copy Link" for the given row.
   * Used to verify the registration link is exposed to the CP for sharing.
   */
  async copyLeadLink(rowIndex = 0) {
    const copyBtn = this.allCopyLinkButtons.nth(rowIndex);
    await copyBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await copyBtn.click();
  }

  // ── Refresh ─────────────────────────────────────────────────────────────────

  /**
   * refreshLeads() — re-fetch the lead list from the backend.
   * The CP Leads page exposes refresh via re-navigation to /leads (there is no
   * dedicated refresh button in the current build per the locator map). We
   * navigate directly and wait for the heading to reappear.
   *
   * Backend note: this calls `GET /api/v1/cp/cp-user-leads` against
   * `registration_drafts` — NOT LeadSquared (per FSD 2026-05-25).
   */
  async refreshLeads() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForLoad();
  }

  // ── Counting / state helpers ───────────────────────────────────────────────

  /**
   * getLeadRowCount() — number of visible lead rows on the page.
   * Counts Resend buttons (one per row); falls back to 0 if none.
   */
  async getLeadRowCount() {
    return await this.allResendButtons.count().catch(() => 0);
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  /** expectOnLeadsUrl() — assert the URL contains /leads. */
  async expectOnLeadsUrl() {
    await this.page.waitForURL(/\/leads/, { timeout: 15_000 });
  }

  /** expectLeadsHeadingVisible() — assert the "Leads" h3 heading is present. */
  async expectLeadsHeadingVisible() {
    await this.expectVisible(this.leadsHeading);
  }

  /**
   * expectLeadInTable(query) — assert at least one row on the page contains `query`
   * (e.g. a lead's name or phone). Returns the matching row locator.
   */
  async expectLeadInTable(query) {
    const row = this.page.locator('div, tr').filter({ hasText: query });
    await row.first().waitFor({ state: 'visible', timeout: 10_000 });
    return row;
  }

  /**
   * expectEmptyState() — assert an empty-state message is shown.
   * Accepts either an explicit empty-state element OR zero rows.
   */
  async expectEmptyState() {
    const rowCount = await this.getLeadRowCount();
    if (rowCount === 0) return;
    await this.emptyState.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** expectNavLinksVisible() — assert Home/KYC/JBP/Leads nav links present. */
  async expectNavLinksVisible() {
    await this.expectVisible(this.homeLink);
    await this.expectVisible(this.kYCLink);
    await this.expectVisible(this.jBPLink);
    await this.expectVisible(this.leadsLink);
  }
}

module.exports = { LeadsManagementPage };
