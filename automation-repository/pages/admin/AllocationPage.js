'use strict';

/**
 * AllocationPage.js — Page Object Model for the Admin Portal Allocation module.
 *
 * What this file does:
 *   The Allocation module is the core business workflow on the Admin Portal — it
 *   lets the admin create campaigns (STATIC, DYNAMIC, PHYSICAL_EVENT) that drive
 *   real-time unit booking by buyers. This Page Object wraps every UI interaction
 *   on /admin/allocation into reusable methods so test specs can stay readable.
 *
 * How selectors work:
 *   All CSS selectors live in locators/admin/locator-map.json under the "allocation"
 *   module key. We load that once into `L` and access each entry via bracket
 *   notation (`L['key'].selector`). When the live site changes a selector, only the
 *   JSON needs editing — no test-code change required.
 *
 * Destructive scope:
 *   Campaign create/activate/stop calls hit the real backend on UAT — they trigger
 *   Kaleyra SMS / WhatsApp notifications and lock the Customers module against
 *   writes. All mutation specs guard with `ENV=uat && !ALLOW_DESTRUCTIVE`.
 *
 * BRD: .claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Allocation.md
 * FSD: manual-qa-repository/03-user-manual/admin/fsd-allocation.md
 */

const { BasePage } = require('../../base/BasePage');
const locatorMap   = require('../../../locators/admin/locator-map.json');

// Bracket access (per CLAUDE.md rule) — `L['key']` instead of `L.key`.
const L = locatorMap['allocation'] || {};

const ALLOCATION_URL = 'https://uat-web.xrportal.in/admin/allocation';

class AllocationPage extends BasePage {
  /**
   * constructor — called once per test (in beforeEach) via `new AllocationPage(page)`.
   *
   * Every `this.xxx = page.locator(...)` line below creates a "locator" — a lazy
   * reference to a DOM element. Playwright resolves it fresh on each use, so we
   * never run into stale-element errors when the table re-renders.
   *
   * The `&& L[key].selector` guard means: if the locator map is missing the key
   * (e.g. mid-sync state) we pass `undefined` to page.locator() which surfaces
   * a clear error at test time rather than a silent crash during construction.
   */
  constructor(page) {
    super(page);
    this.L = L;
    this.url = ALLOCATION_URL;

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
    // saveCampaignButton: primary submit on the create-campaign form.
    // resetButton:        clears the create-campaign form.
    // refreshButton:      reloads the campaigns list (used to pick up auto status
    //                     transitions performed by the cron job).
    // logoutButton:       admin avatar → Logout (used by regression specs).
    this.saveCampaignButton     = page.locator(L['saveCampaignButton']     && L['saveCampaignButton'].selector);
    this.resetButton            = page.locator(L['resetButton']            && L['resetButton'].selector);
    this.refreshButton          = page.locator(L['refreshButton']          && L['refreshButton'].selector);
    this.logoutButton           = page.locator(L['logoutButton']           && L['logoutButton'].selector);

    // ── Create Campaign form fields ─────────────────────────────────────────
    // The form is an Ant Design panel rendered inline on /admin/allocation.
    //
    // rcSelect0 .. rcSelect4: Ant Design <Select> components rendered as <div
    // class="rc-select"> wrappers. Live crawl ordering (top → bottom):
    //   rcSelect0 → Campaign Type      (Static / Dynamic / Physical Event)
    //   rcSelect1 → Project / Tower
    //   rcSelect2 → Mode / extra config
    //   rcSelect3 → Round configuration (Dynamic only)
    //   rcSelect4 → Additional filters (depends on type)
    // The exact mapping is verified by manual QA before each sprint — if the
    // form order changes, this comment block must be updated and the locator
    // map regenerated by the Tech Lead Agent.
    this.enterCampaignNameInput = page.locator(L['enterCampaignNameInput'] && L['enterCampaignNameInput'].selector);
    this.descriptionInput       = page.locator(L['descriptionInput']       && L['descriptionInput'].selector);
    this.campaignTypeSelect     = page.locator(L['rcSelect0']              && L['rcSelect0'].selector);
    this.projectSelect          = page.locator(L['rcSelect1']              && L['rcSelect1'].selector);
    this.modeSelect             = page.locator(L['rcSelect2']              && L['rcSelect2'].selector);
    this.roundConfigSelect      = page.locator(L['rcSelect3']              && L['rcSelect3'].selector);
    this.extraSelect            = page.locator(L['rcSelect4']              && L['rcSelect4'].selector);
    this.startTimeInput         = page.locator(L['selectDateInput']        && L['selectDateInput'].selector);
    this.endTimeInput           = page.locator(L['selectDateInput2']       && L['selectDateInput2'].selector);

    // ── Campaign list controls ──────────────────────────────────────────────
    // The campaigns table renders below the create form. Search-by-name input
    // filters the list live as you type.
    this.campaignNameSearch     = page.locator(L['campaignNameSearch']     && L['campaignNameSearch'].selector);

    // ── Derived / table locators (not in locator-map.json) ──────────────────
    // The campaigns table itself doesn't expose a stable test-id in the live
    // DOM today, so we derive structural selectors below. When the Tech Lead
    // Agent adds explicit keys, replace these with `L[...]` references.
    this.campaignTable          = page.locator('table, .ant-table');
    this.campaignRows           = page.locator('.ant-table-tbody > tr.ant-table-row');
    this.campaignTableHeaders   = page.locator('.ant-table-thead th');

    // Status badges in the list (Ant Design Tag component)
    this.statusBadges           = page.locator('.ant-tag, [class*="status"]');

    // Active toast / message banner (Ant Design surfaces these as .ant-message)
    this.successToast           = page.locator('.ant-message-success, .ant-notification-notice-success');
    this.errorToast             = page.locator('.ant-message-error, .ant-notification-notice-error, .ant-form-item-explain-error');

    // Modal/dialog used by Stop/Cancel confirmation flows
    this.confirmModal           = page.locator('.ant-modal:visible, .ant-popconfirm:visible');
    this.confirmYesButton       = page.locator('.ant-modal:visible button.ant-btn-primary, .ant-popconfirm:visible button.ant-btn-primary');
    this.confirmNoButton        = page.locator('.ant-modal:visible button.ant-btn-default, .ant-popconfirm:visible button.ant-btn-default');

    // KPI cards (Allocation module surface KPIs about active/upcoming campaigns)
    this.kpiCards               = page.locator('.ant-statistic, .kpi-card, [class*="card"]:has-text("Campaign")');
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /**
   * navigate() — go directly to the Allocation URL.
   * Called in beforeEach so every test starts on a clean page with no leftover
   * filter or modal state.
   */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * waitForLoad() — wait until the Allocation page is fully interactive.
   * We wait for the Save Campaign button OR the campaigns table to appear —
   * either signals the React app has hydrated and we can interact safely.
   */
  async waitForLoad() {
    await Promise.race([
      this.saveCampaignButton.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.campaignTable.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * navigateViaSidebar() — click the "Allocation" link in the sidebar.
   * Used to test the sidebar route works (e.g. ADM_ALLOC_001).
   *
   * Why .first(): Ant Design renders duplicate <a> tags for the collapsed and
   * expanded sidebar states. Both have the same href so a plain locator
   * resolves to two elements and Playwright throws a strict-mode violation.
   */
  async navigateViaSidebar() {
    await this.allocationLink.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.allocationLink.first().click();
    await this.page.waitForURL(/\/admin\/allocation/, { timeout: 15_000 });
    await this.waitForLoad();
  }

  // ── Campaign list ─────────────────────────────────────────────────────────

  /**
   * getCampaignsList() — read every campaign row as a plain {name,type,status} object.
   *
   * Reads each row's cells in the order they render in the live DOM:
   *   [0] Name, [1] Type, [2] Start Time, [3] End Time, [4] Status, [5] Actions
   *
   * Returns [] if no rows are visible (e.g. on first load before the API responds,
   * or when a search returns zero matches).
   */
  async getCampaignsList() {
    const count = await this.campaignRows.count();
    const rows = [];
    for (let i = 0; i < count; i++) {
      const cells = this.campaignRows.nth(i).locator('td');
      const cellCount = await cells.count();
      if (cellCount === 0) continue;
      rows.push({
        name:      (await cells.nth(0).textContent() || '').trim(),
        type:      cellCount > 1 ? (await cells.nth(1).textContent() || '').trim() : '',
        startTime: cellCount > 2 ? (await cells.nth(2).textContent() || '').trim() : '',
        endTime:   cellCount > 3 ? (await cells.nth(3).textContent() || '').trim() : '',
        status:    cellCount > 4 ? (await cells.nth(4).textContent() || '').trim() : '',
      });
    }
    return rows;
  }

  /**
   * searchCampaignByName(name) — type into the campaign-name search input.
   * The list filters live; we wait for networkidle after typing so the
   * caller can read settled rows.
   */
  async searchCampaignByName(name) {
    await this.fill(this.campaignNameSearch, name);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * getCampaignStatus(campaignName) — return the Status cell text for a given row,
   * or null if the row is not found.
   *
   * Strategy: find the <tr> that contains the campaign name, then read the
   * Status cell from inside that row scope. We scope to ant-tag (the status
   * badge) so we don't accidentally pick up name/type cell text.
   */
  async getCampaignStatus(campaignName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: campaignName }).first();
    const exists = await row.count();
    if (!exists) return null;
    const badge = row.locator('.ant-tag, td').last();
    return ((await badge.textContent()) || '').trim();
  }

  // ── Create Campaign form ──────────────────────────────────────────────────

  /**
   * openCreateCampaignModal() — ensure the create-campaign form is visible.
   *
   * On the current Allocation page the form is always rendered inline (no modal
   * trigger). This method exists for spec readability and forward-compatibility
   * with a possible future modal redesign — if the form ever moves behind a
   * button click, only this method needs to change, not every test.
   */
  async openCreateCampaignModal() {
    // The form is rendered inline today — verify Save Campaign button is in DOM
    await this.saveCampaignButton.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * fillCampaignDetails({name, type, startTime, endTime, description}) — fill the
   * create-campaign form with the supplied values.
   *
   * @param {Object}  args
   * @param {string}  args.name        — Campaign Name (required)
   * @param {string} [args.type]       — 'Static' | 'Dynamic' | 'Physical Event'
   * @param {string} [args.startTime]  — ISO-ish string the date picker accepts
   * @param {string} [args.endTime]    — ISO-ish string the date picker accepts
   * @param {string} [args.description]
   *
   * The Ant Design Select is opened by clicking its wrapper, then the option
   * is picked from the visible dropdown. We use a visible-only dropdown
   * selector so we never click an option from a previously-opened, now-hidden
   * dropdown that lingers in the DOM.
   */
  async fillCampaignDetails({ name, type, startTime, endTime, description } = {}) {
    if (name !== undefined) {
      await this.fill(this.enterCampaignNameInput, name);
    }
    if (description !== undefined) {
      await this.fill(this.descriptionInput, description);
    }
    if (type !== undefined) {
      await this.click(this.campaignTypeSelect);
      const activeDropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
      await activeDropdown.waitFor({ state: 'visible', timeout: 5_000 });
      await activeDropdown.locator(`.ant-select-item-option:has-text("${type}")`).first().click();
    }
    if (startTime !== undefined) {
      // Ant date pickers accept typed input — type then press Enter to commit
      await this.startTimeInput.click();
      await this.startTimeInput.fill(startTime);
      await this.startTimeInput.press('Enter').catch(() => {});
    }
    if (endTime !== undefined) {
      await this.endTimeInput.click();
      await this.endTimeInput.fill(endTime);
      await this.endTimeInput.press('Enter').catch(() => {});
    }
  }

  /**
   * submitCreateCampaign() — click Save Campaign and wait for the API call.
   *
   * After click, we wait for networkidle to give the POST /campaigns request
   * time to settle (the campaign appears in the list, or an error toast fires).
   * The caller asserts which of those outcomes happened.
   *
   * DESTRUCTIVE: this fires a real POST on UAT. Guarded by ALLOW_DESTRUCTIVE=1.
   */
  async submitCreateCampaign() {
    await this.click(this.saveCampaignButton);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * resetCreateForm() — click Reset to clear all create-campaign fields.
   * Used by the form-reset validation TCs.
   */
  async resetCreateForm() {
    await this.click(this.resetButton);
  }

  // ── Lifecycle actions ─────────────────────────────────────────────────────

  /**
   * activateCampaign(campaignName) — placeholder for the "Activate" or auto-
   * transition flow. The system auto-transitions Upcoming → Active at start
   * time via cron, so there's typically no manual Activate button. This method
   * exists for explicit-control specs that may exercise a future admin override.
   *
   * Current behaviour: refresh the list and wait for the row's status to flip
   * to 'Active' (poll up to 30s).
   */
  async activateCampaign(campaignName) {
    await this.click(this.refreshButton);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    // Poll for the row to be Active
    await this.page.waitForFunction(
      (n) => {
        const rows = Array.from(document.querySelectorAll('tr.ant-table-row'));
        const row = rows.find(r => r.textContent && r.textContent.includes(n));
        if (!row) return false;
        return /Active/i.test(row.textContent);
      },
      campaignName,
      { timeout: 30_000 }
    ).catch(() => {});
  }

  /**
   * stopCampaign(campaignName) — find the row with this campaign and click its
   * Stop action. A Popconfirm dialog appears — we confirm Yes and wait for
   * the row's status badge to update to "Stopped".
   *
   * DESTRUCTIVE: live mutation. Guarded by ALLOW_DESTRUCTIVE=1.
   */
  async stopCampaign(campaignName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: campaignName }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.locator('button:has-text("Stop"), a:has-text("Stop")').first().click();
    // Popconfirm: click the primary (Yes) button on the visible confirm
    await this.confirmYesButton.first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * cancelCampaign(campaignName) — click Cancel on an Upcoming campaign row.
   * Same flow as stopCampaign but for the Cancel button (Upcoming-only).
   *
   * DESTRUCTIVE: live mutation. Guarded by ALLOW_DESTRUCTIVE=1.
   */
  async cancelCampaign(campaignName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: campaignName }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.locator('button:has-text("Cancel"), a:has-text("Cancel")').first().click();
    await this.confirmYesButton.first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * dismissConfirm() — click outside the confirm dialog (or click No) to
   * dismiss without applying the action. Used by the "click outside to dismiss"
   * TCs (e.g. ADM_ALLOC_020).
   */
  async dismissConfirm() {
    // Press Escape — works for both Modal and Popconfirm in Ant Design
    await this.page.keyboard.press('Escape');
    await this.confirmModal.first().waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  /**
   * clickRefresh() — click the Refresh button and wait for the network call
   * to settle. Used to pick up auto-transitions performed by the cron job.
   */
  async clickRefresh() {
    await this.click(this.refreshButton);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ── Assertion helpers ─────────────────────────────────────────────────────

  /**
   * expectCampaignInList(campaignName) — assert a row containing the given
   * campaign name is visible in the table. Returns the row locator so the
   * caller can chain further assertions (e.g. on the status cell).
   */
  async expectCampaignInList(campaignName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: campaignName }).first();
    await row.waitFor({ state: 'visible', timeout: 15_000 });
    return row;
  }

  /**
   * expectModalVisible() — assert the create-campaign form / modal is on screen.
   * Today the form is inline so we check the Save Campaign button. If the form
   * moves behind a modal trigger, update this method to wait on .ant-modal.
   */
  async expectModalVisible() {
    await this.saveCampaignButton.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * expectToastSuccess() — assert a success toast / notification is visible.
   * Ant Design surfaces these via .ant-message-success and .ant-notification.
   * We give it 10s because the toast may animate in after the API response.
   */
  async expectToastSuccess() {
    await this.successToast.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * expectValidationError(text) — assert a validation/error message is shown.
   * If `text` is supplied, also asserts the error contains that substring.
   * Ant Form errors live in .ant-form-item-explain-error.
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
   * expectOnAllocationUrl() — assert the browser is on /admin/allocation.
   * Used by routing TCs (e.g. ADM_ALLOC_001).
   */
  async expectOnAllocationUrl() {
    await this.page.waitForURL(/\/admin\/allocation/, { timeout: 15_000 });
  }

  /**
   * getCampaignTypeOptions() — open the Type dropdown and return all visible
   * option labels. Used by ADM_ALLOC_011 to verify the dropdown offers
   * Static / Dynamic / Physical Event.
   */
  async getCampaignTypeOptions() {
    await this.click(this.campaignTypeSelect);
    const activeDropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await activeDropdown.waitFor({ state: 'visible', timeout: 5_000 });
    const opts = activeDropdown.locator('.ant-select-item-option');
    const count = await opts.count();
    const labels = [];
    for (let i = 0; i < count; i++) {
      labels.push(((await opts.nth(i).textContent()) || '').trim());
    }
    // Close the dropdown so we don't leave UI state hanging
    await this.page.keyboard.press('Escape');
    return labels;
  }

  /**
   * futureIso(minutesFromNow) — small utility used by mutation specs.
   * Returns a YYYY-MM-DD HH:mm string `minutesFromNow` minutes in the future.
   * Format matches what Ant DatePicker accepts on this build of the app.
   */
  futureIso(minutesFromNow) {
    const d = new Date(Date.now() + minutesFromNow * 60_000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}

module.exports = { AllocationPage };
