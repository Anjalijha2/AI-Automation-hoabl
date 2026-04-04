/**
 * TOWERS PAGE — XR Portal Admin
 * ==============================
 * URL: https://uat-web.xrportal.in/admin/towers
 *
 * Layout:
 *   Left KPI panel  — Towers (Total/Active/Inactive) + Units (Total/Sold/Available/Disabled)
 *   Tower list       — .tower-item entries with name + available count + (Inactive) badge
 *   Floor/unit grid  — .unit-size-item cells coloured by status (available/booked/reserved/disabled/refuge/pbt)
 *   Right drawer     — .allocation-details-drawer-content — unit details on cell click
 *
 * Status classes on unit cells:
 *   .available  .booked  .reserved  .disabled-unit  .refuge  .pbt
 */

const { BasePage } = require('../base/BasePage');

class TowersPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(`${this.baseUrl.replace('/admin', '')}/admin/towers`, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });
    await this.waitForNetworkIdle();
  }

  // ── KPI Cards ─────────────────────────────────────────────────────────────────

  /** Returns { total, active, inactive } for the Towers KPI card */
  async getTowerKPIs() {
    const card = this.page.locator('.towers-card-content').first();
    await card.waitFor({ state: 'visible', timeout: 10_000 });
    const total    = await this._kpiValue(card, 'Total');
    const active   = await this._kpiValue(card, 'Active');
    const inactive = await this._kpiValue(card, 'Inactive');
    return { total, active, inactive };
  }

  /** Returns { total, sold, available, disabled } for the Units KPI card */
  async getUnitKPIs() {
    const card = this.page.locator('.towers-card-content.units-card-content').first();
    await card.waitFor({ state: 'visible', timeout: 10_000 });
    const total     = await this._kpiValue(card, 'Total');
    const sold      = await this._kpiValue(card, 'Sold');
    const available = await this._kpiValue(card, 'Available');
    const disabled  = await this._kpiValue(card, 'Disabled');
    return { total, sold, available, disabled };
  }

  /** Read numeric value next to a label in a KPI card */
  async _kpiValue(cardLocator, label) {
    const li = cardLocator.locator('li').filter({ hasText: label }).first();
    const raw = (await li.textContent()) ?? '';
    const match = raw.replace(label, '').trim().match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
  }

  // ── Tower List ────────────────────────────────────────────────────────────────

  /** Get all tower names from the sidebar list */
  async getTowerNames() {
    const items = await this.page.locator('li.tower-item').allTextContents();
    return items.map(t => t.replace(/\(Inactive\)/i, '').replace(/\d+\s*Units Available/i, '').trim()).filter(Boolean);
  }

  /** Get count of tower list items */
  async getTowerCount() {
    return await this.page.locator('li.tower-item').count();
  }

  /** Get tower item text for a given tower name (includes units available + inactive badge) */
  async getTowerItemText(towerName) {
    const item = this.page.locator('li.tower-item').filter({ hasText: towerName }).first();
    return (await item.textContent())?.trim() ?? '';
  }

  /** Returns true if the tower item has the (Inactive) label */
  async isTowerInactive(towerName) {
    const text = await this.getTowerItemText(towerName);
    return /inactive/i.test(text);
  }

  /** Returns the "N Units Available" count shown on the tower item */
  async getTowerAvailableUnits(towerName) {
    const text = await this.getTowerItemText(towerName);
    const match = text.match(/(\d+)\s*Units Available/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  /** Click a tower in the sidebar to load its floor/unit grid */
  async selectTower(towerName) {
    const item = this.page.locator('li.tower-item').filter({ hasText: towerName }).first();
    await item.waitFor({ state: 'visible', timeout: 10_000 });
    await item.click();
    // Wait for the floor/unit grid to populate
    await this.page.locator('.unit-section-box').waitFor({ state: 'visible', timeout: 10_000 });
    await this.waitForNetworkIdle();
  }

  /** Returns true if a tower is currently selected (has selected-tower class) */
  async isSelectedTower(towerName) {
    const item = this.page.locator('li.tower-item.selected-tower').first();
    const text = (await item.textContent().catch(() => '')) ?? '';
    return text.includes(towerName);
  }

  // ── Floor / Unit Grid ─────────────────────────────────────────────────────────

  /** Get the per-tower stats shown above the grid: { total, available, sold, payingNow, refuge, disabled, pbt } */
  async getGridStats() {
    const wrap = this.page.locator('.floors-index-wrap').first();
    await wrap.waitFor({ state: 'visible', timeout: 10_000 });
    const text = (await wrap.textContent()) ?? '';
    // DOM text format: "155 Available" (number before label)
    const num  = (label) => { const m = new RegExp('([\\d,]+)\\s*' + label).exec(text); return m ? parseInt(m[1].replace(/,/g,''),10) : 0; };
    return {
      total:      num('Total'),
      available:  num('Available'),
      sold:       num('Sold'),
      payingNow:  num('Paying now'),
      refuge:     num('Refuge'),
      disabled:   num('Disabled'),
      pbt:        num('PBT'),
    };
  }

  /** Get all floor numbers visible in the grid header */
  async getFloorNumbers() {
    const spans = await this.page.locator('.floor-number').allTextContents();
    return spans.map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  }

  /** Count of unit cells by status. status: 'available'|'booked'|'reserved'|'disabled'|'refuge'|'pbt' */
  async countUnitsByStatus(status) {
    const map = {
      available: '.unit-size-item.available',
      booked:    '.unit-size-item.booked',
      reserved:  '.unit-size-item.reserved',
      disabled:  '.unit-size-item.disabled-unit, .unit-size-item.disabled',
      refuge:    '.unit-size-item.refuge',
      pbt:       '.unit-size-item.pbt',
    };
    const sel = map[status] ?? `.unit-size-item.${status}`;
    return await this.page.locator(sel).count();
  }

  /** Click a specific unit cell by its number (e.g. '3504') */
  async clickUnit(unitNumber) {
    const cell = this.page.locator('.unit-size-item').filter({ hasText: unitNumber }).first();
    await cell.waitFor({ state: 'visible', timeout: 8_000 });
    await cell.click();
    // Wait for drawer to populate
    await this.page.locator('.allocation-details-drawer-content').waitFor({ state: 'visible', timeout: 8_000 });
    await this.page.waitForTimeout(800);
  }

  /** Get CSS class string of a unit cell — used to check its status */
  async getUnitCellClass(unitNumber) {
    const cell = this.page.locator('.unit-size-item').filter({ hasText: unitNumber }).first();
    return (await cell.getAttribute('class')) ?? '';
  }

  // ── Unit Detail Drawer ────────────────────────────────────────────────────────

  /** Returns true when the right-panel drawer has visible unit details */
  async isUnitDetailVisible() {
    return await this.page
      .locator('.allocation-details-drawer-content:not(.visibility-hidden)')
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  /** Get the unit number shown in the detail drawer */
  async getDrawerUnitNo() {
    const panel = this.page.locator('.more-details-allocation').first();
    await panel.waitFor({ state: 'visible', timeout: 8_000 });
    const item = panel.locator('.allocation-item-list').filter({ hasText: 'Unit No.' }).first();
    return (await item.locator('p:last-child').textContent())?.trim() ?? '';
  }

  /** Get all label→value pairs from the detail drawer */
  async getDrawerDetails() {
    const panel = this.page.locator('.more-details-allocation').first();
    await panel.waitFor({ state: 'visible', timeout: 8_000 });
    const result = {};
    const items = await panel.locator('.allocation-item-list, .allocation-item-two').all();
    for (const item of items) {
      const label = (await item.locator('.item-label').first().textContent().catch(() => ''))?.trim();
      const valueEls = await item.locator('p:not(.item-label)').allTextContents();
      const value = valueEls.map(v => v.trim()).filter(Boolean).join(' ');
      if (label && value) result[label] = value;
    }
    return result;
  }

  /** Get the "all-inclusive" price shown at the bottom of the drawer */
  async getDrawerInclusivePrice() {
    return (await this.page.locator('.increase-price-wrap p').first().textContent())?.trim() ?? '';
  }

  // ── Legend Index ──────────────────────────────────────────────────────────────

  /** Get the legend colour indicators on the left (index-list-wrap) */
  async getLegendItems() {
    const squares = await this.page.locator('.index-list-wrap .sm-square').all();
    return await Promise.all(squares.map(async sq => (await sq.getAttribute('class') ?? '').replace('sm-square', '').trim()));
  }
}

module.exports = { TowersPage };
