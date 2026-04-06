/**
 * CHANNEL PARTNERS PAGE — XR Portal Admin
 * =========================================
 * URL: https://uat-web.xrportal.in/admin/channel-partners
 *
 * Layout:
 *   Header   — "N Channel Partners" title + Map Master CP / Reset Filters / Refresh
 *   Table    — Checkbox | Owner Name | Firm Name | HV Code | Master HV Code |
 *              Business Region | Pincode | Phone | CP Type |
 *              SM Name | SM Email | SM Mobile | KYC Status | Actions
 *   Actions  — eye icon → detail drawer | … icon → "Mark as Master" dropdown
 *   Map Master CP — disabled until rows selected; modal with Master HV dropdown
 */

const { BasePage } = require('../base/BasePage');

class ChannelPartnersPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(`${this.baseUrl.replace('/admin', '')}/admin/channel-partners`, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });
    await this.waitForNetworkIdle();
  }

  // ── Header ────────────────────────────────────────────────────────────────────

  /** Returns the total CP count shown in the page title (e.g. "2705") */
  async getTotalCount() {
    const title = await this.page.locator('h3.table-title').first().textContent();
    const match = (title ?? '').match(/([\d,]+)\s*Channel Partners/i);
    return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
  }

  /** Returns true when Map Master CP button is enabled (rows selected) */
  async isMapMasterCPEnabled() {
    return await this.page
      .locator('button:has-text("Map Master CP")')
      .first()
      .isEnabled({ timeout: 3_000 })
      .catch(() => false);
  }

  async clickRefresh() {
    await this.page.locator('button:has-text("Refresh")').first().click();
    await this.waitForNetworkIdle();
  }

  async clickResetFilters() {
    await this.page.locator('button:has-text("Reset Filters")').first().click();
    await this.waitForNetworkIdle();
  }

  // ── Search ────────────────────────────────────────────────────────────────────

  async searchByPhone(phone) {
    const input = this.page.locator('input[placeholder*=Phone i]').first();
    await input.clear();
    await input.fill(phone);
    await input.press('Enter');
    await this.waitForNetworkIdle();
  }

  async clearSearch() {
    const input = this.page.locator('input[placeholder*=Phone i]').first();
    await input.clear();
    await this.waitForNetworkIdle();
  }

  async getPhoneInputValue() {
    return (await this.page.locator('input[placeholder*=Phone i]').first().inputValue()) ?? '';
  }

  // ── Table ─────────────────────────────────────────────────────────────────────

  /** Get all column header texts */
  async getColumnHeaders() {
    const ths = await this.page.locator('thead th').allTextContents();
    return ths.map(t => t.trim()).filter(Boolean);
  }

  /** Count visible data rows (excluding header) */
  async getVisibleRowCount() {
    // Subtract 1 to skip the header row that sometimes appears in tbody
    const all = await this.page.locator('tbody tr').count();
    const headerRows = await this.page.locator('tbody tr.ant-table-row:has(th)').count();
    return all - headerRows;
  }

  /**
   * Find a row by phone number. Returns { ownerName, firmName, hvCode, cpType, kycStatus }.
   */
  async getRowByPhone(phone) {
    const row = this.page.locator('tbody tr').filter({ hasText: phone }).first();
    await row.waitFor({ state: 'attached', timeout: 10_000 });
    const cells = await row.locator('td').allTextContents();
    return {
      ownerName:  cells[1]?.trim() ?? '',
      firmName:   cells[2]?.trim() ?? '',
      hvCode:     cells[3]?.trim() ?? '',
      masterHV:   cells[4]?.trim() ?? '',
      region:     cells[5]?.trim() ?? '',
      pincode:    cells[6]?.trim() ?? '',
      phone:      cells[7]?.trim() ?? '',
      cpType:     cells[8]?.trim() ?? '',
      kycStatus:  cells[12]?.trim() ?? '',
    };
  }

  /** Select (check) the first data row via its checkbox */
  async selectFirstRow() {
    const checkbox = this.page
      .locator('tbody tr:nth-child(2) .ant-checkbox-input, tbody tr:nth-child(2) input[type=checkbox]')
      .first();
    await checkbox.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  // ── View (Eye) Drawer ─────────────────────────────────────────────────────────

  /** Click the eye icon on a specific row (matched by phone) */
  async clickViewForRow(phone) {
    const row = this.page.locator('tbody tr').filter({ hasText: phone }).first();
    await row.locator('button.cp-row-action').first().click();
    await this.page.locator('.ant-drawer-body').waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.waitForTimeout(500);
  }

  /** Get the CP detail drawer title */
  async getDrawerTitle() {
    return (await this.page.locator('.ant-drawer-title').first().textContent())?.trim() ?? '';
  }

  /** Get all label→value pairs from the CP detail drawer */
  async getDrawerDetails() {
    const body = this.page.locator('.ant-drawer-body').first();
    await body.waitFor({ state: 'visible', timeout: 8_000 });
    const text = (await body.textContent()) ?? '';
    return text.trim().replace(/\s+/g, ' ');
  }

  /** Close the open drawer */
  async closeDrawer() {
    await this.page
      .locator('.ant-drawer-close, button[aria-label=Close]')
      .first()
      .click()
      .catch(() => {});
    await this.page.locator('.ant-drawer-body').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ── Column Filters ────────────────────────────────────────────────────────────

  /**
   * Returns column names that have a search (🔍) or filter (▼) icon in the header.
   * Search cols: Owner Name, Firm Name, HV Code, Pincode
   * Filter cols: Master HV Code, Business Region, CP Type
   */
  async getFilterableColumns() {
    const results = [];
    const ths = await this.page.locator('thead th').all();
    for (const th of ths) {
      const text = (await th.textContent()).trim().replace(/\s+/g, ' ');
      const hasSearch = await th.locator('.anticon-search').count();
      const hasFilter = await th.locator('.anticon-filter').count();
      if (hasSearch > 0) results.push({ col: text, type: 'search' });
      else if (hasFilter > 0) results.push({ col: text, type: 'filter' });
    }
    return results;
  }

  /**
   * Filter by CP Type using the column header dropdown.
   * type: 'Master CP' | 'Member CP' | 'Standalone'
   */
  async filterByCPType(type) {
    const cpTypeTh = this.page.locator('thead th').filter({ hasText: /^CP Type/ }).first();
    await cpTypeTh.locator('.ant-table-filter-trigger').click();
    await this.page.waitForTimeout(500);

    const dropdown = this.page.locator('.ant-table-filter-dropdown').filter({ isVisible: true }).first();
    await dropdown.waitFor({ state: 'visible', timeout: 5_000 });

    const option = dropdown.locator('.ant-dropdown-menu-item, li').filter({ hasText: type }).first();
    await option.click();
    await this.page.waitForTimeout(300);

    // Click OK/Filter button to apply
    await dropdown.locator('button:has-text("OK"), button:has-text("Filter")').first().click();
    await this.waitForNetworkIdle();
  }

  /**
   * Filter by Owner Name using column header search input.
   */
  async filterByOwnerName(name) {
    const ownerTh = this.page.locator('thead th').filter({ hasText: /Owner Name/ }).first();
    await ownerTh.locator('.anticon-search').first().click();
    await this.page.waitForTimeout(500);

    const dropdown = this.page.locator('.ant-table-filter-dropdown').filter({ isVisible: true }).first();
    await dropdown.waitFor({ state: 'visible', timeout: 5_000 });

    const input = dropdown.locator('input[placeholder*="Owner Name" i]').first();
    await input.fill(name);
    await dropdown.locator('button:has-text("Search")').first().click();
    await this.waitForNetworkIdle();
  }

  /** Reset a column filter dropdown by clicking Reset inside it */
  async resetColumnFilter(colHeaderText) {
    const th = this.page.locator('thead th').filter({ hasText: new RegExp(colHeaderText, 'i') }).first();
    const trigger = th.locator('.ant-table-filter-trigger, .anticon-search, .anticon-filter').first();
    await trigger.click();
    await this.page.waitForTimeout(500);

    const dropdown = this.page.locator('.ant-table-filter-dropdown').filter({ isVisible: true }).first();
    await dropdown.waitFor({ state: 'visible', timeout: 5_000 });
    await dropdown.locator('button:has-text("Reset")').first().click();
    await this.page.waitForTimeout(300);
    // Close dropdown so it doesn't interfere with subsequent reads
    await this.page.keyboard.press('Escape');
    await this.waitForNetworkIdle();
  }

  // ── More (…) Dropdown ─────────────────────────────────────────────────────────

  /** Click the … icon on the first data row */
  async clickMoreForFirstRow() {
    const moreBtn = this.page.locator('tbody tr:nth-child(2) button.cp-row-action').nth(1);
    await moreBtn.click();
    await this.page.waitForTimeout(700);
  }

  /** Get all visible dropdown menu items after clicking … */
  async getMoreDropdownItems() {
    const items = await this.page
      .locator('.ant-dropdown-menu-item:visible, [role=menuitem]:visible')
      .allTextContents();
    return items.map(i => i.trim()).filter(Boolean);
  }

  async closeMoreDropdown() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  // ── Map Master CP ─────────────────────────────────────────────────────────────

  /** Click Map Master CP button (requires row to be selected first) */
  async clickMapMasterCP() {
    await this.page.locator('button:has-text("Map Master CP")').first().click();
    await this.page.locator('.ant-modal-body').waitFor({ state: 'visible', timeout: 8_000 });
    await this.page.waitForTimeout(500);
  }

  /** Get Map Master CP modal title */
  async getMapModalTitle() {
    return (await this.page.locator('.ant-modal-title').first().textContent())?.trim() ?? '';
  }

  /** Get Map Master CP modal body text */
  async getMapModalBody() {
    return (await this.page.locator('.ant-modal-body').first().textContent())?.trim().replace(/\s+/g, ' ') ?? '';
  }

  async closeModal() {
    await this.page
      .locator('.ant-modal button:has-text("Cancel"), .ant-modal-close')
      .first()
      .click()
      .catch(() => {});
    await this.page.locator('.ant-modal-body').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }
}

module.exports = { ChannelPartnersPage };
