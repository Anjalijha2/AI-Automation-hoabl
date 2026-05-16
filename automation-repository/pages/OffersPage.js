/**
 * OFFERS PAGE — XR Portal Admin
 * ==============================
 * URL: https://uat-web.xrportal.in/admin/offers
 *
 * Layout:
 *   Header   — "Offers Management" heading + "N Offers" count badge
 *              + Refresh / Add New Offer buttons
 *   Table    — Sr.no | Offer Name | Description | Amount | Percentage |
 *              Start Date | End Date | Created By | Action
 *   Action   — ON/OFF toggle (.ant-switch) + Edit button + Delete button per row
 *   Drawer   — Ant Design side drawer (not modal) for Add and Edit flows
 *
 * Domain Notes:
 *   - Toggle has NO confirmation dialog — HIGH risk of accidental activation
 *   - Sr.no values are DB primary keys — non-contiguous due to hard deletes
 *   - All UAT offers are Amount Based — Percentage column always shows "-"
 *   - Drawer container is .ant-drawer-body (not .ant-modal-body)
 */

const { BasePage } = require('../base/BasePage');

class OffersPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(`${this.baseUrl}/offers`, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });
    await this.waitForNetworkIdle();
  }

  // ── Header ────────────────────────────────────────────────────────────────────

  /** Returns the total offer count from the "N Offers" badge (e.g. 6) */
  async getTotalCount() {
    // The count badge is a plain div with text matching /\d+ Offers/
    const allDivs = await this.page.locator('div').all();
    for (const div of allDivs) {
      const text = (await div.textContent().catch(() => '')).trim();
      const match = text.match(/^(\d+)\s*Offers$/);
      if (match) return parseInt(match[1], 10);
    }
    return 0;
  }

  async clickRefresh() {
    await this.page.locator('button:has-text("Refresh")').first().click();
    await this.waitForNetworkIdle();
  }

  async clickAddNewOffer() {
    await this.page.locator('button:has-text("Add New Offer")').first().click();
    await this.page.locator('.ant-drawer-body').waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.waitForTimeout(400);
  }

  // ── Table ─────────────────────────────────────────────────────────────────────

  /** Get all column header texts */
  async getColumnHeaders() {
    const ths = await this.page.locator('table thead th').allTextContents();
    return ths.map(t => t.trim()).filter(Boolean);
  }

  /** Count visible data rows */
  async getVisibleRowCount() {
    return await this.page.locator('table tbody tr').count();
  }

  /**
   * Get a specific row's cell texts by matching offer name.
   * Returns { srNo, offerName, description, amount, percentage, startDate, endDate, createdBy }
   */
  async getRowByName(offerName) {
    const row = this.page.locator('table tbody tr').filter({ hasText: offerName }).first();
    await row.waitFor({ state: 'attached', timeout: 8_000 });
    const cells = await row.locator('td').allTextContents();
    return {
      srNo:        cells[0]?.trim() ?? '',
      offerName:   cells[1]?.trim() ?? '',
      description: cells[2]?.trim() ?? '',
      amount:      cells[3]?.trim() ?? '',
      percentage:  cells[4]?.trim() ?? '',
      startDate:   cells[5]?.trim() ?? '',
      endDate:     cells[6]?.trim() ?? '',
      createdBy:   cells[7]?.trim() ?? '',
    };
  }

  /** Get all Sr.No values from the table as an array of integers */
  async getAllSrNos() {
    const rows = await this.page.locator('table tbody tr').all();
    const srNos = [];
    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      const val = parseInt(cells[0]?.trim(), 10);
      if (!isNaN(val)) srNos.push(val);
    }
    return srNos;
  }

  // ── Toggle ─────────────────────────────────────────────────────────────────────

  /**
   * Get toggle state for a row matched by offer name.
   * Returns 'on' or 'off'.
   */
  async getToggleState(offerName) {
    const row = this.page.locator('table tbody tr').filter({ hasText: offerName }).first();
    const toggle = row.locator('.ant-switch').first();
    const checked = await toggle.getAttribute('aria-checked');
    return checked === 'true' ? 'on' : 'off';
  }

  /** Click the toggle switch for a row matched by offer name */
  async clickToggle(offerName) {
    const row = this.page.locator('table tbody tr').filter({ hasText: offerName }).first();
    const toggle = row.locator('.ant-switch').first();
    await toggle.click();
    await this.page.waitForTimeout(600);
  }

  // ── Edit ──────────────────────────────────────────────────────────────────────

  /** Click the Edit (pencil) button for a row matched by offer name.
   * Ant Design renders action icons as anticon spans with aria-label, NOT <img alt>.
   * Correct selector: button:has([aria-label="edit"])
   */
  async clickEdit(offerName) {
    const row = this.page.locator('table tbody tr').filter({ hasText: offerName }).first();
    // Ant Design anticon — aria-label on the inner span, not on an img
    await row.locator('button:has([aria-label="edit"])').first().click();
    await this.page.locator('.ant-drawer-body').waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.waitForTimeout(400);
  }

  // ── Delete ─────────────────────────────────────────────────────────────────────

  /** Click the Delete (trash) button for a row matched by offer name.
   * Ant Design renders action icons as anticon spans with aria-label, NOT <img alt>.
   * Correct selector: button:has([aria-label="delete"])
   */
  async clickDelete(offerName) {
    const row = this.page.locator('table tbody tr').filter({ hasText: offerName }).first();
    await row.locator('button:has([aria-label="delete"])').first().click();
    await this.page.waitForTimeout(600);
  }

  // ── Add / Edit Drawer ─────────────────────────────────────────────────────────

  /** Get the drawer title text */
  async getDrawerTitle() {
    const titleEl = this.page.locator('.ant-drawer-title, .ant-drawer-header-title').first();
    return (await titleEl.textContent())?.trim() ?? '';
  }

  /** Fill the Offer Name field */
  async fillOfferName(name) {
    const input = this.page.locator('.ant-drawer-body input[placeholder="Please enter offer name"]').first();
    await input.clear();
    await input.fill(name);
  }

  /** Get current Offer Name input value */
  async getOfferNameValue() {
    return await this.page
      .locator('.ant-drawer-body input[placeholder="Please enter offer name"]')
      .first()
      .inputValue();
  }

  /** Select offer type radio: 'amount' or 'percentage' */
  async selectOfferType(type) {
    if (type === 'amount') {
      await this.page.locator('.ant-radio-button-wrapper:has-text("Amount Based")').first().click();
    } else {
      await this.page.locator('.ant-radio-button-wrapper:has-text("Percentage Based")').first().click();
    }
  }

  /** Fill the Amount field */
  async fillAmount(amount) {
    const input = this.page
      .locator('.ant-drawer-body input[placeholder="Please enter amount"], .ant-drawer-body .ant-input-number-input')
      .first();
    await input.clear();
    await input.fill(String(amount));
  }

  /** Get current Amount input value */
  async getAmountValue() {
    return await this.page
      .locator('.ant-drawer-body .ant-input-number-input')
      .first()
      .inputValue();
  }

  /** Fill the Description textarea */
  async fillDescription(text) {
    const ta = this.page.locator('.ant-drawer-body textarea[placeholder="Please enter description"]').first();
    await ta.clear();
    await ta.fill(text);
  }

  /** Get current Description value */
  async getDescriptionValue() {
    return await this.page
      .locator('.ant-drawer-body textarea[placeholder="Please enter description"]')
      .first()
      .inputValue();
  }

  /**
   * Fill start and end dates for the date range picker.
   * dateStr format: 'DD MMM YYYY' — e.g. '09 May 2026'
   */
  async fillDateRange(startDate, endDate) {
    const startInput = this.page.locator('input[placeholder="Start date"]').first();
    const endInput = this.page.locator('input[placeholder="End date"]').first();
    await startInput.click();
    await startInput.fill(startDate);
    await startInput.press('Tab');
    await this.page.waitForTimeout(300);
    await endInput.fill(endDate);
    await endInput.press('Tab');
    await this.page.waitForTimeout(300);
  }

  /** Get current start date input value */
  async getStartDateValue() {
    return await this.page.locator('input[placeholder="Start date"]').first().inputValue();
  }

  /** Get current end date input value */
  async getEndDateValue() {
    return await this.page.locator('input[placeholder="End date"]').first().inputValue();
  }

  /** Open the typology dropdown */
  async openTypologyDropdown() {
    await this.page.locator('.ant-drawer-body .ant-select-selector').first().click();
    await this.page.waitForTimeout(400);
  }

  /** Get all visible typology option texts */
  async getTypologyOptions() {
    const options = await this.page
      .locator('.ant-select-dropdown .ant-select-item-option')
      .allTextContents();
    return options.map(o => o.trim()).filter(Boolean);
  }

  /** Select a typology option by text */
  async selectTypology(typologyName) {
    await this.openTypologyDropdown();
    await this.page
      .locator('.ant-select-dropdown .ant-select-item-option')
      .filter({ hasText: typologyName })
      .first()
      .click();
    await this.page.waitForTimeout(300);
  }

  /** Click the Cancel button in the drawer */
  async clickCancel() {
    await this.page.locator('.ant-drawer-body ~ * button:has-text("Cancel"), button:has-text("Cancel")')
      .first()
      .click()
      .catch(async () => {
        await this.page.locator('button:has-text("Cancel")').first().click();
      });
    await this.page.locator('.ant-drawer-body').waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => {});
    await this.page.waitForTimeout(300);
  }

  /** Click the "Create Offer" button */
  async clickCreateOffer() {
    await this.page.locator('button:has-text("Create Offer")').first().click();
    await this.page.waitForTimeout(800);
  }

  /** Click the "Update Offer" button */
  async clickUpdateOffer() {
    await this.page.locator('button:has-text("Update Offer")').first().click();
    await this.page.waitForTimeout(800);
  }

  /** Returns true if the drawer is currently visible */
  async isDrawerOpen() {
    return await this.page.locator('.ant-drawer-body').isVisible().catch(() => false);
  }

  /** Wait for drawer to close */
  async waitForDrawerClose() {
    await this.page.locator('.ant-drawer-body').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  }

  // ── Validation Error Detection ────────────────────────────────────────────────

  /**
   * Returns all visible validation error messages in the drawer.
   * Ant Design renders these as .ant-form-item-explain-error
   */
  async getValidationErrors() {
    const errors = await this.page
      .locator('.ant-form-item-explain-error')
      .allTextContents();
    return errors.map(e => e.trim()).filter(Boolean);
  }

  /** Returns true if any validation errors are currently visible */
  async hasValidationErrors() {
    const count = await this.page.locator('.ant-form-item-explain-error').count();
    return count > 0;
  }

  // ── Character Counter ─────────────────────────────────────────────────────────

  /**
   * Get the character counter text for Offer Name (e.g. "14 / 100").
   * Ant Design renders this as a sibling span to the input.
   */
  async getOfferNameCounter() {
    const counters = await this.page
      .locator('.ant-drawer-body .ant-input-show-count-suffix, .ant-drawer-body .ant-input-data-count')
      .allTextContents();
    return counters[0]?.trim() ?? '';
  }
}

module.exports = { OffersPage };
