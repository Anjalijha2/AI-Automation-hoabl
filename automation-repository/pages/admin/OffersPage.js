'use strict';

/**
 * OffersPage.js — Page Object Model for the Admin Portal Offers module.
 *
 * What this file does:
 *   Offers are the discount instruments admins manage to influence the All-Inclusive
 *   Price (AIP) shown to buyers. Two kinds: Amount-based (flat rupee deduction) and
 *   Percentage-based (% off the Agreement Value). This page object wraps every UI
 *   interaction on /admin/offers — list, create, toggle activate/deactivate, delete,
 *   and the assertion helpers used by the E2E and UI/UX specs.
 *
 * Selector strategy:
 *   The locator map (locators/admin/locator-map.json → offers) only exposes a few
 *   stable keys today (addNewOfferButton, oNOFFButton[*], sidebar links, refresh).
 *   For form fields and table cells we derive structural locators below — clearly
 *   marked "(not in locator-map.json)". When the Tech Lead Agent adds explicit
 *   keys via locator-map-builder, replace the derived locators with `L[...]`
 *   references and keep this comment block as a migration hint.
 *
 * Destructive scope:
 *   create / toggle / delete operations hit the real backend on UAT. They mutate
 *   pricing surfaces seen by buyers — guard every mutation spec with
 *   `ENV=uat && !ALLOW_DESTRUCTIVE` so destructive runs are explicit opt-in.
 *
 * BRD:  .claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Offers.md
 * FSD:  manual-qa-repository/03-user-manual/admin/fsd-offers.md
 * TCs:  manual-qa-repository/01-test-cases/admin-portal/offers/TC_OFFERS.md
 */

const { BasePage } = require('../../base/BasePage');
const locatorMap   = require('../../../locators/admin/locator-map.json');

// Bracket access (per CLAUDE.md selectors rule) — `L['key']` instead of `L.key`.
const L = locatorMap['offers'] || {};

const OFFERS_URL = 'https://uat-web.xrportal.in/admin/offers';

class OffersPage extends BasePage {
  /**
   * constructor — instantiated once per test in beforeEach via `new OffersPage(page)`.
   *
   * Each `this.xxx = page.locator(...)` creates a lazy locator — Playwright resolves
   * the selector fresh on every use so the offers table can re-render between rows
   * without surfacing stale-element errors.
   *
   * The `&& L[key].selector` guard means: if the locator map is missing the key
   * (sync pipeline mid-update) we pass `undefined` to page.locator() which produces
   * a clear failure at first interaction rather than a silent constructor crash.
   */
  constructor(page) {
    super(page);
    this.L = L;
    this.url = OFFERS_URL;

    // ── Sidebar navigation links (from locator-map.json) ────────────────────
    this.offersLink             = page.locator(L['offersLink']             && L['offersLink'].selector);
    this.customersLink          = page.locator(L['customersLink']          && L['customersLink'].selector);
    this.configLink             = page.locator(L['configLink']             && L['configLink'].selector);
    this.allocationLink         = page.locator(L['allocationLink']         && L['allocationLink'].selector);
    this.towersLink             = page.locator(L['towersLink']             && L['towersLink'].selector);
    this.jBPMgmtLink            = page.locator(L['jBPMgmtLink']            && L['jBPMgmtLink'].selector);
    this.channelPartnersLink    = page.locator(L['channelPartnersLink']    && L['channelPartnersLink'].selector);
    this.salesManagersLink      = page.locator(L['salesManagersLink']      && L['salesManagersLink'].selector);
    this.transactionsLink       = page.locator(L['transactionsLink']       && L['transactionsLink'].selector);
    this.cMSLink                = page.locator(L['cMSLink']                && L['cMSLink'].selector);

    // ── Top-bar controls (from locator-map.json) ────────────────────────────
    // addNewOfferButton: opens the create-offer modal/inline form.
    // refreshButton:     reloads the offers list (picks up backend changes).
    // logoutButton:      admin avatar → Logout (used by regression specs).
    this.addNewOfferButton      = page.locator(L['addNewOfferButton']      && L['addNewOfferButton'].selector);
    this.refreshButton          = page.locator(L['refreshButton']          && L['refreshButton'].selector);
    this.logoutButton           = page.locator(L['logoutButton']           && L['logoutButton'].selector);

    // ── Per-row Active toggle locators (from locator-map.json) ──────────────
    // The crawl captured up to 6 "ON OFF" switches — these are the per-row
    // Active toggles. Row-level toggle interaction prefers the row-scoped
    // helper (toggleOfferActive(name)); these keyed references are kept for
    // direct visibility assertions in UI specs.
    this.onOffToggle1           = page.locator(L['oNOFFButton']            && L['oNOFFButton'].selector);
    this.onOffToggle2           = page.locator(L['oNOFFButton2']           && L['oNOFFButton2'].selector);
    this.onOffToggle3           = page.locator(L['oNOFFButton3']           && L['oNOFFButton3'].selector);
    this.onOffToggle4           = page.locator(L['oNOFFButton4']           && L['oNOFFButton4'].selector);
    this.onOffToggle5           = page.locator(L['oNOFFButton5']           && L['oNOFFButton5'].selector);
    this.onOffToggle6           = page.locator(L['oNOFFButton6']           && L['oNOFFButton6'].selector);
    // Generic collection — all per-row toggles on the page.
    this.allOnOffToggles        = page.locator('button:has-text("ON OFF"), .ant-switch, [role="switch"]');

    // ── Derived / structural locators (NOT in locator-map.json) ─────────────
    // The Offers table doesn't expose stable test-ids today. These selectors
    // are scoped to Ant Design class names which the build standardises on.
    // When Tech Lead Agent adds explicit keys, replace with `L[...]` lookups.
    this.offersTable            = page.locator('table, .ant-table');
    this.offerRows              = page.locator('.ant-table-tbody > tr.ant-table-row');
    this.offerTableHeaders      = page.locator('.ant-table-thead th');

    // Search input (column header search OR top-of-list search box).
    this.offerSearchInput       = page.locator('input[placeholder*="Search" i], input[placeholder*="offer name" i]').first();

    // ── Create-offer modal / form fields (NOT in locator-map.json) ──────────
    // The form opens behind the Add New Offer click. We bind by visible label
    // text inside the active modal so the same selectors work whether the form
    // is inline or modal-rendered.
    this.modal                  = page.locator('.ant-modal:visible, .ant-drawer:visible, [role="dialog"]:visible');
    this.modalTitle             = this.modal.locator('.ant-modal-title, .ant-drawer-title, [class*="ModalTitle"]');

    // Form fields — bound via label / placeholder fallbacks
    this.offerNameInput         = this.modal.locator('input[placeholder*="Offer Name" i], input[placeholder*="Name" i]').first();
    this.offerCodeInput         = this.modal.locator('input[placeholder*="Code" i], input[name="offerCode"]').first();
    this.offerTypeSelect        = this.modal.locator('.ant-select').first();  // Type dropdown — Amount/Percentage
    this.offerDiscountInput     = this.modal.locator('input[placeholder*="Discount" i], input[placeholder*="Amount" i], input[placeholder*="Percentage" i], input[type="number"]').first();
    this.offerStartDateInput    = this.modal.locator('input[placeholder*="Start" i], .ant-picker-input input').nth(0);
    this.offerEndDateInput      = this.modal.locator('input[placeholder*="End" i], .ant-picker-input input').nth(1);
    this.offerTypologySelect    = this.modal.locator('.ant-select').nth(1);

    // Submit / cancel inside the modal
    this.submitOfferButton      = this.modal.locator('button:has-text("Create"), button:has-text("Submit"), button:has-text("Save"), button.ant-btn-primary').first();
    this.cancelOfferButton      = this.modal.locator('button:has-text("Cancel"), button.ant-btn-default').first();

    // ── Delete confirmation (NOT in locator-map.json) ───────────────────────
    // The trash icon in each row opens an Ant Modal/Popconfirm. We scope the
    // confirm button to the *visible* dialog so we never click a leftover
    // modal still in the DOM.
    this.confirmDialog          = page.locator('.ant-modal:visible, .ant-popconfirm:visible, .ant-modal-confirm:visible');
    this.confirmDeleteButton    = this.confirmDialog.locator('button:has-text("Delete"), button:has-text("Yes"), button:has-text("OK"), button.ant-btn-dangerous, button.ant-btn-primary').first();
    this.confirmCancelButton    = this.confirmDialog.locator('button:has-text("Cancel"), button:has-text("No"), button.ant-btn-default').first();

    // ── Toasts / error surfaces ─────────────────────────────────────────────
    this.successToast           = page.locator('.ant-message-success, .ant-notification-notice-success');
    this.errorToast             = page.locator('.ant-message-error, .ant-notification-notice-error, .ant-form-item-explain-error');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Navigation
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * navigate() — go directly to the Offers URL.
   * Called in beforeEach so every test starts on a clean page free of leftover
   * modal/filter state from a previous test.
   */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * waitForLoad() — wait until the Offers page has hydrated.
   * Races: Add New Offer button OR the offers table becoming visible — either
   * one signals the React app is interactive.
   */
  async waitForLoad() {
    await Promise.race([
      this.addNewOfferButton.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.offersTable.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * navigateViaSidebar() — click the "Offers" link in the sidebar.
   *
   * .first() is used because Ant Design renders the sidebar link twice in
   * collapsed-vs-expanded states; both `<a>` elements share the same href, so
   * a plain locator triggers Playwright's strict-mode violation.
   */
  async navigateViaSidebar() {
    await this.offersLink.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.offersLink.first().click();
    await this.page.waitForURL(/\/admin\/offers/, { timeout: 15_000 });
    await this.waitForLoad();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Offers list
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * getOffersList() — read every offer row from the table as a plain object.
   *
   * Column order (per FSD-defined Offers table):
   *   [0] Offer Name, [1] Type, [2] Discount Value, [3] Start Date,
   *   [4] End Date, [5] Typology, [6] Active toggle, [7] Action (trash)
   *
   * Returns [] when no rows are visible — valid on a fresh-data UAT or when
   * a search has filtered everything out.
   */
  async getOffersList() {
    const count = await this.offerRows.count();
    const rows = [];
    for (let i = 0; i < count; i++) {
      const cells = this.offerRows.nth(i).locator('td');
      const cellCount = await cells.count();
      if (cellCount === 0) continue;
      rows.push({
        name:          (await cells.nth(0).textContent() || '').trim(),
        type:          cellCount > 1 ? (await cells.nth(1).textContent() || '').trim() : '',
        discountValue: cellCount > 2 ? (await cells.nth(2).textContent() || '').trim() : '',
        startDate:     cellCount > 3 ? (await cells.nth(3).textContent() || '').trim() : '',
        endDate:       cellCount > 4 ? (await cells.nth(4).textContent() || '').trim() : '',
        typology:      cellCount > 5 ? (await cells.nth(5).textContent() || '').trim() : '',
      });
    }
    return rows;
  }

  /**
   * searchOffer(name) — type into the offer-name search input.
   * The list filters live; we wait for networkidle so the caller reads
   * settled rows.
   */
  async searchOffer(name) {
    const visible = await this.offerSearchInput.isVisible().catch(() => false);
    if (!visible) return false;
    await this.fill(this.offerSearchInput, name);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return true;
  }

  /**
   * clickRefresh() — click the Refresh button and wait for the GET /offers call
   * to settle. Used to pick up backend changes made via API.
   */
  async clickRefresh() {
    await this.click(this.refreshButton);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Create Offer modal
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * openCreateOfferModal() — click "Add New Offer" and wait for the modal/form
   * to become visible. Resolves once any form field (or the submit button) is
   * present so the caller can fill fields immediately.
   */
  async openCreateOfferModal() {
    await this.addNewOfferButton.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.addNewOfferButton.first().click();
    // Wait for either a modal/drawer container OR the first form field to
    // render — Ant Modal animation can take ~300ms.
    await Promise.race([
      this.modal.first().waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {}),
      this.offerNameInput.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {}),
    ]);
  }

  /**
   * _selectOption(selectLocator, optionText) — internal helper.
   *
   * Ant Design <Select> components require a click to open and a click on a
   * `.ant-select-item-option` inside the active dropdown to choose. We always
   * select the *visible* dropdown so we don't accidentally click into a
   * leftover hidden one in the DOM.
   *
   * @private
   */
  async _selectOption(selectLocator, optionText) {
    await selectLocator.click();
    const activeDropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await activeDropdown.waitFor({ state: 'visible', timeout: 5_000 });
    await activeDropdown.locator(`.ant-select-item-option:has-text("${optionText}")`).first().click();
  }

  /**
   * _fillDate(input, value) — internal helper for Ant DatePicker inputs.
   * Types the value and commits with Enter. Catches any commit-time error
   * because some date pickers auto-close on blur, which fires before Enter.
   *
   * @private
   */
  async _fillDate(input, value) {
    await input.click();
    await input.fill('');
    await input.fill(value);
    await input.press('Enter').catch(() => {});
    // Close the picker panel if still open so it doesn't cover the submit button.
    await this.page.keyboard.press('Escape').catch(() => {});
  }

  /**
   * fillOfferAmount({code, name, amount, startDate, endDate, typology}) — fill the
   * create-offer form for an Amount-based offer.
   *
   * @param {Object}  args
   * @param {string} [args.code]      — optional offer code (admin API strips this — see ADM_OFR_036)
   * @param {string}  args.name       — Offer Name (required)
   * @param {number}  args.amount     — Discount amount in rupees (positive integer)
   * @param {string} [args.startDate] — YYYY-MM-DD or any string the date picker accepts
   * @param {string} [args.endDate]   — YYYY-MM-DD
   * @param {string} [args.typology]  — e.g. "1 Bed Growth Home" (blank for All)
   *
   * Note: `code` is filled if the form exposes the field — by FSD-CORRECTION the
   * admin API strips offerCode, so the UI may not surface this input on every
   * build. We tolerate either case.
   */
  async fillOfferAmount({ code, name, amount, startDate, endDate, typology } = {}) {
    if (name !== undefined) {
      await this.fill(this.offerNameInput, name);
    }
    if (code !== undefined) {
      const codeVisible = await this.offerCodeInput.isVisible().catch(() => false);
      if (codeVisible) await this.fill(this.offerCodeInput, code);
    }
    // Always select Amount Based for this helper
    await this._selectOption(this.offerTypeSelect, 'Amount Based').catch(async () => {
      // Some builds label the option "Amount" — fall back.
      await this._selectOption(this.offerTypeSelect, 'Amount');
    });
    if (amount !== undefined) {
      await this.fill(this.offerDiscountInput, String(amount));
    }
    if (startDate !== undefined) {
      await this._fillDate(this.offerStartDateInput, startDate);
    }
    if (endDate !== undefined) {
      await this._fillDate(this.offerEndDateInput, endDate);
    }
    if (typology !== undefined && typology !== '' && typology !== 'All') {
      await this._selectOption(this.offerTypologySelect, typology).catch(() => {});
    }
  }

  /**
   * fillOfferPercentage({code, name, percentage, startDate, endDate, typology}) — fill
   * the create-offer form for a Percentage-based offer.
   *
   * @param {Object}  args
   * @param {string} [args.code]
   * @param {string}  args.name
   * @param {number}  args.percentage — 0–100 (decimals allowed per ADM_OFR_041)
   * @param {string} [args.startDate]
   * @param {string} [args.endDate]
   * @param {string} [args.typology]
   */
  async fillOfferPercentage({ code, name, percentage, startDate, endDate, typology } = {}) {
    if (name !== undefined) {
      await this.fill(this.offerNameInput, name);
    }
    if (code !== undefined) {
      const codeVisible = await this.offerCodeInput.isVisible().catch(() => false);
      if (codeVisible) await this.fill(this.offerCodeInput, code);
    }
    await this._selectOption(this.offerTypeSelect, 'Percentage Based').catch(async () => {
      await this._selectOption(this.offerTypeSelect, 'Percentage');
    });
    if (percentage !== undefined) {
      await this.fill(this.offerDiscountInput, String(percentage));
    }
    if (startDate !== undefined) {
      await this._fillDate(this.offerStartDateInput, startDate);
    }
    if (endDate !== undefined) {
      await this._fillDate(this.offerEndDateInput, endDate);
    }
    if (typology !== undefined && typology !== '' && typology !== 'All') {
      await this._selectOption(this.offerTypologySelect, typology).catch(() => {});
    }
  }

  /**
   * submitOffer() — click the Submit/Create button inside the modal and wait
   * for the network call to settle. After a successful POST the modal closes
   * and the new row appears in the list.
   *
   * DESTRUCTIVE on UAT — guard the spec with ALLOW_DESTRUCTIVE=1.
   */
  async submitOffer() {
    await this.submitOfferButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * cancelOfferForm() — dismiss the create-offer modal without saving.
   * Used by NEG/UI specs that exercise the cancel path.
   */
  async cancelOfferForm() {
    await this.cancelOfferButton.click().catch(async () => {
      // If no cancel button, press Escape — Ant Modal closes on Escape by default.
      await this.page.keyboard.press('Escape');
    });
    await this.modal.first().waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Row-scoped helpers — open / toggle / delete
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * openOffer(offerName) — click the offer row to open its details (if the
   * build supports an edit/details panel). Returns the row locator so callers
   * can chain assertions.
   */
  async openOffer(offerName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: offerName }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.click();
    return row;
  }

  /**
   * toggleOfferActive(offerName) — flip the Active toggle for the given row.
   *
   * Per ADM_OFR_023 the toggle takes effect instantly with no confirmation
   * dialog — we just click it and wait for the network call (PATCH /offers/:id/active)
   * to settle.
   *
   * DESTRUCTIVE: pricing changes propagate to live buyer views. Guard the spec.
   */
  async toggleOfferActive(offerName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: offerName }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    // Prefer ant-switch / role=switch inside the row; fall back to ON/OFF text button.
    const toggle = row.locator('.ant-switch, [role="switch"], button:has-text("ON"), button:has-text("OFF")').first();
    await toggle.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * getOfferActiveState(offerName) — read whether the row's toggle is currently
   * ON (returns true) or OFF (returns false). Returns null when the row isn't
   * found. Used by toggle-state UI tests.
   */
  async getOfferActiveState(offerName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: offerName }).first();
    const exists = await row.count();
    if (!exists) return null;
    const toggle = row.locator('.ant-switch, [role="switch"]').first();
    const tCount = await toggle.count();
    if (tCount) {
      // Ant Switch marks checked state with class .ant-switch-checked OR aria-checked
      const cls = (await toggle.getAttribute('class')) || '';
      if (/ant-switch-checked/.test(cls)) return true;
      const aria = (await toggle.getAttribute('aria-checked')) || '';
      if (aria === 'true') return true;
      if (aria === 'false') return false;
      return false;
    }
    // Fallback: read the ON/OFF text on the button
    const txt = ((await row.locator('button:has-text("ON"), button:has-text("OFF")').first().textContent()) || '').trim();
    return /\bON\b/i.test(txt);
  }

  /**
   * deleteOffer(offerName) — click the trash icon for the row, then confirm.
   *
   * Two-step flow:
   *   1. Click trash icon (last cell action) → confirm dialog opens.
   *   2. Click Delete in the dialog → row is removed + success toast.
   *
   * DESTRUCTIVE: soft-deletes the offer row (paranoid:true — see ADM_OFR_044).
   * Guard the spec with ALLOW_DESTRUCTIVE=1.
   */
  async deleteOffer(offerName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: offerName }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    // Trash icon: typically the last action button in the row. We try a few
    // common selectors to be resilient to icon-only vs labelled buttons.
    const trashCandidates = row.locator(
      'button[aria-label*="delete" i], button:has-text("Delete"), button:has([class*="trash" i]), button:has([class*="delete" i]), .anticon-delete, [data-icon="delete"]'
    );
    const found = await trashCandidates.count();
    if (found > 0) {
      await trashCandidates.first().click();
    } else {
      // Last resort — click the last cell's button.
      await row.locator('td').last().locator('button').last().click();
    }
    await this.confirmDialog.first().waitFor({ state: 'visible', timeout: 8_000 });
    await this.confirmDeleteButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * cancelDelete(offerName) — open the delete confirm dialog and dismiss it
   * with Cancel. Used by ADM_OFR_030.
   */
  async cancelDelete(offerName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: offerName }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    const trash = row.locator(
      'button[aria-label*="delete" i], .anticon-delete, [data-icon="delete"]'
    ).first();
    await trash.click().catch(async () => {
      await row.locator('td').last().locator('button').last().click();
    });
    await this.confirmDialog.first().waitFor({ state: 'visible', timeout: 8_000 });
    await this.confirmCancelButton.click().catch(async () => {
      await this.page.keyboard.press('Escape');
    });
    await this.confirmDialog.first().waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Assertion helpers
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * expectOfferInList(offerName) — assert that a row with this offer name is
   * visible in the table. Returns the row locator so callers can chain
   * cell-level assertions (e.g. on Discount Value or Active toggle).
   */
  async expectOfferInList(offerName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: offerName }).first();
    await row.waitFor({ state: 'visible', timeout: 15_000 });
    return row;
  }

  /**
   * expectOfferNotInList(offerName) — assert that no row with this offer name
   * is visible. Used after delete to verify the row went away.
   */
  async expectOfferNotInList(offerName) {
    const row = this.page.locator('tr.ant-table-row', { hasText: offerName });
    const c = await row.count();
    if (c > 0) {
      throw new Error(`Expected offer "${offerName}" to be removed from the list, but ${c} row(s) still match.`);
    }
  }

  /**
   * expectModalVisible() — assert the create-offer modal/form is visible.
   * Checks the modal container OR the first form field — covers both inline
   * and modal renderings.
   */
  async expectModalVisible() {
    await Promise.race([
      this.modal.first().waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {}),
      this.offerNameInput.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {}),
    ]);
    const modalVisible = await this.modal.first().isVisible().catch(() => false);
    const fieldVisible = await this.offerNameInput.isVisible().catch(() => false);
    if (!modalVisible && !fieldVisible) {
      throw new Error('Expected create-offer modal or form fields to be visible.');
    }
  }

  /**
   * expectToastSuccess() — assert a success toast / notification appears.
   * Ant Design surfaces success via .ant-message-success and .ant-notification.
   * 10s timeout allows for the post-API animation.
   */
  async expectToastSuccess() {
    await this.successToast.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * expectValidationError(text) — assert a validation error is shown.
   * Optionally checks that the error contains the given substring (case-insensitive).
   * Ant Form errors live in .ant-form-item-explain-error.
   */
  async expectValidationError(text) {
    const err = this.errorToast.first();
    await err.waitFor({ state: 'visible', timeout: 10_000 });
    if (text) {
      const actual = (await err.textContent()) || '';
      if (!actual.toLowerCase().includes(text.toLowerCase())) {
        throw new Error(`Expected validation error to contain "${text}", got "${actual}".`);
      }
    }
  }

  /**
   * expectOnOffersUrl() — assert the browser is on /admin/offers.
   * Used by routing TCs (e.g. ADM_OFR_001).
   */
  async expectOnOffersUrl() {
    await this.page.waitForURL(/\/admin\/offers/, { timeout: 15_000 });
  }

  /**
   * expectPricingApplied({offerName, type, discountValue}) — BIZ helper.
   *
   * Verifies that the offer row's displayed Discount Value is rendered with the
   * correct format per FSD pricing rules:
   *   - Amount Based   → "₹" + thousands-separated integer  (e.g. "₹27,000")
   *   - Percentage Based → numeric + "%"                    (e.g. "5%" / "5.5%")
   *
   * This is the BIZ-rule application assertion for the offers list — it does
   * not navigate to Towers or compute AIP (that's covered by cross-module
   * integration TCs ADM_OFR_020/021/024/026/031/032/033 which require live
   * buyer-view data).
   */
  async expectPricingApplied({ offerName, type, discountValue }) {
    const row = await this.expectOfferInList(offerName);
    const cells = row.locator('td');
    // Per FSD column order, Discount Value is the 3rd column (index 2).
    const discountCell = cells.nth(2);
    const text = ((await discountCell.textContent()) || '').trim();

    const t = (type || '').toLowerCase();
    if (t.includes('amount')) {
      // Must include ₹ and the numeric value (loose match — thousands sep optional)
      if (!/₹/.test(text)) {
        throw new Error(`Amount-based offer "${offerName}" should render with ₹ prefix; got "${text}".`);
      }
      if (discountValue !== undefined) {
        // Strip commas / ₹ / whitespace before comparing numerics
        const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
        if (Number.isNaN(num) || num !== Number(discountValue)) {
          throw new Error(`Expected Amount offer "${offerName}" to show ${discountValue}, got "${text}".`);
        }
      }
    } else if (t.includes('percent')) {
      if (!/%/.test(text)) {
        throw new Error(`Percentage-based offer "${offerName}" should render with "%" suffix; got "${text}".`);
      }
      if (discountValue !== undefined) {
        const num = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (Number.isNaN(num) || Math.abs(num - Number(discountValue)) > 0.001) {
          throw new Error(`Expected Percentage offer "${offerName}" to show ${discountValue}%, got "${text}".`);
        }
      }
    } else {
      throw new Error(`expectPricingApplied: unknown type "${type}" (must be Amount or Percentage).`);
    }
    return row;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Utilities
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * isoDate(daysFromToday) — YYYY-MM-DD string offset from today.
   * Used by date-validity specs (ADM_OFR_008/016/017/020/021).
   */
  isoDate(daysFromToday = 0) {
    const d = new Date(Date.now() + daysFromToday * 24 * 60 * 60_000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /**
   * getOfferTypeOptions() — open the Type dropdown in the create-offer form
   * and return the visible option labels. Used by UI specs that verify the
   * Amount/Percentage choice surface.
   */
  async getOfferTypeOptions() {
    await this.offerTypeSelect.click();
    const activeDropdown = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await activeDropdown.waitFor({ state: 'visible', timeout: 5_000 });
    const opts = activeDropdown.locator('.ant-select-item-option');
    const count = await opts.count();
    const labels = [];
    for (let i = 0; i < count; i++) {
      labels.push(((await opts.nth(i).textContent()) || '').trim());
    }
    await this.page.keyboard.press('Escape');
    return labels;
  }
}

module.exports = { OffersPage };
