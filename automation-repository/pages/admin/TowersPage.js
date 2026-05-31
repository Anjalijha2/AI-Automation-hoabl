'use strict';

/**
 * TowersPage.js — Page Object Model for the Admin Portal Towers module.
 *
 * What this file does:
 *   The Towers module on /admin/towers is the read-only inventory dashboard.
 *   It surfaces top-line KPIs (Total / Active / Inactive towers and Total /
 *   Available / Sold / Disabled units), a left sidebar listing all 18 towers
 *   in the Xanadu project, a floor x unit-position grid for the selected
 *   tower with color-coded cells (white = Available, red = Sold, orange =
 *   Being Paid, grey = Reserved/Blocked/Refuge), and a slide-in Unit Detail
 *   panel that opens only when a white (Available) cell is clicked.
 *
 *   Per BRD (ADMIN-FS-Towers §1), this module is FULLY READ-ONLY — there are
 *   no edit, save, configure, or status-change controls anywhere on this
 *   page. Status mutations happen via Config / Allocation modules elsewhere
 *   and trigger backend side effects (AuditLog + Redis cache refresh + Python
 *   broadcast). This POM intentionally exposes only inspection methods.
 *
 * How selectors work:
 *   The locator-map for the "towers" module currently contains only the
 *   sidebar navigation links + login/logout chrome (the live crawl landed
 *   on a re-auth flow). Page-specific elements (KPI cards, sidebar tower
 *   list, grid cells, detail panel) are derived structurally below and
 *   tagged with comments — when the Tech Lead Agent enriches the locator
 *   map, replace each derived locator with an `L['key']` reference.
 *
 * Destructive scope:
 *   None. Every method below is read-only. Tests using this POM are safe
 *   to run on UAT without ALLOW_DESTRUCTIVE guards (except the [FSD-CORRECTION]
 *   integration TCs that fire admin status-update endpoints — those are
 *   guarded inline in the spec).
 *
 * BRD: ADMIN-FS-Towers §1..§4
 * FSD: manual-qa-repository/03-user-manual/admin/fsd-towers.md
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/admin/locator-map.json');

// Bracket access (per CLAUDE.md rule) — `L['key']` instead of `L.key`.
const L = locatorMap['towers'] || {};

const TOWERS_URL = 'https://uat-web.xrportal.in/admin/towers';

// Color-code conventions per ADMIN-FS-Towers §3 (Unit grid).
const UNIT_COLOR = {
  AVAILABLE: 'white',
  SOLD:      'red',
  BEING_PAID:'orange',
  RESERVED:  'grey',
};

class TowersPage extends BasePage {
  /**
   * constructor — called once per test (in beforeEach) via `new TowersPage(page)`.
   *
   * Locators from the JSON map are wired up first (only sidebar chrome
   * is currently mapped). Structural / derived locators follow — these
   * cover the KPI cards, sidebar tower list, grid cells, and detail
   * panel. Replace derived selectors with `L[...]` keys when the Tech
   * Lead Agent enriches the locator map.
   */
  constructor(page) {
    super(page);
    this.L = L;
    this.url = TOWERS_URL;

    // ── Sidebar navigation chrome (from locator-map.json) ────────────────────
    // The left admin menu — used by cross-module navigation specs.
    this.sendOTPButton           = page.locator(L['sendOTPButton']           && L['sendOTPButton'].selector);
    this.logoutButton            = page.locator(L['logoutButton']            && L['logoutButton'].selector);
    this.preBookedPaymentsButton = page.locator(L['preBookedPaymentsButton'] && L['preBookedPaymentsButton'].selector);
    this.customersLink           = page.locator(L['customersLink']           && L['customersLink'].selector);
    this.configLink              = page.locator(L['configLink']              && L['configLink'].selector);
    this.allocationLink          = page.locator(L['allocationLink']          && L['allocationLink'].selector);
    this.offersLink              = page.locator(L['offersLink']              && L['offersLink'].selector);
    this.towersLink              = page.locator(L['towersLink']              && L['towersLink'].selector);
    this.jBPMgmtLink             = page.locator(L['jBPMgmtLink']             && L['jBPMgmtLink'].selector);
    this.channelPartnersLink     = page.locator(L['channelPartnersLink']     && L['channelPartnersLink'].selector);
    this.salesManagersLink       = page.locator(L['salesManagersLink']       && L['salesManagersLink'].selector);
    this.transactionsLink        = page.locator(L['transactionsLink']        && L['transactionsLink'].selector);
    this.cMSLink                 = page.locator(L['cMSLink']                 && L['cMSLink'].selector);

    // ── KPI cards (derived — not in locator-map yet) ─────────────────────────
    // The Towers dashboard surfaces 8 KPI cards in two rows:
    //   Row 1: Total Towers, Active Towers, Inactive Towers
    //   Row 2: Total Units, Available Units, Sold Units, Disabled Units
    // We match Ant Design statistic cards and any card-shaped container
    // showing a label/count pair.
    this.kpiCards = page.locator(
      '.ant-statistic, .kpi-card, .stat-card, [class*="StatCard"], [class*="kpi"]'
    );

    // Convenience locators per KPI — matched by label text. These tolerate
    // wording drift (e.g. "Total Towers" vs "Towers Total") via case-insensitive
    // :text-matches on the card's parent block.
    this.kpiTotalTowers     = this._kpiByLabel(/total\s*towers?/i);
    this.kpiActiveTowers    = this._kpiByLabel(/active\s*towers?/i);
    this.kpiInactiveTowers  = this._kpiByLabel(/inactive\s*towers?/i);
    this.kpiTotalUnits      = this._kpiByLabel(/total\s*units?/i);
    this.kpiAvailableUnits  = this._kpiByLabel(/available\s*units?/i);
    this.kpiSoldUnits       = this._kpiByLabel(/sold\s*units?/i);
    this.kpiDisabledUnits   = this._kpiByLabel(/disabled\s*units?/i);

    // ── Sidebar tower list (derived) ─────────────────────────────────────────
    // The left tower list lives in a dedicated panel below the KPIs.
    // Each row carries the tower name and an "N Units Available" sub-label.
    // We match list items whose text contains one of the 18 known tower names
    // (defined in TOWER_NAMES below).
    this.towerListContainer = page.locator(
      '[class*="tower-list"], [class*="TowerList"], aside ul, .ant-list'
    ).first();
    this.towerListRows = page.locator(
      '[class*="tower-list"] [class*="row"], ' +
      '[class*="TowerList"] [class*="row"], ' +
      'aside ul > li, ' +
      '.ant-list-item'
    );

    // ── Floor / unit grid (derived) ──────────────────────────────────────────
    // The main grid renders as a stacked set of floor rows; each cell is one
    // unit. Cells carry color classes for status — we match any cell-like
    // element inside the grid container.
    this.gridContainer = page.locator(
      '[class*="unit-grid"], [class*="UnitGrid"], [class*="floor-grid"], [class*="FloorGrid"], ' +
      'main [class*="grid"]'
    ).first();
    this.gridHeader = page.locator(
      '[class*="grid-header"], [class*="GridHeader"], ' +
      'main h2, main h3'
    ).first();
    this.floorRows = page.locator(
      '[class*="floor-row"], [class*="FloorRow"], [class*="grid-row"]'
    );
    this.unitCells = page.locator(
      '[class*="unit-cell"], [class*="UnitCell"], [class*="grid-cell"], [data-unit-id]'
    );

    // ── Unit Detail panel (derived) ──────────────────────────────────────────
    // Slide-in drawer from the right side. Ant Design renders these as
    // .ant-drawer, but a custom component may use a side panel class.
    this.unitDetailPanel = page.locator(
      '.ant-drawer-content:visible, [class*="UnitDetail"]:visible, [class*="unit-detail"]:visible, aside[class*="detail"]:visible'
    ).first();
    this.unitDetailCloseBtn = page.locator(
      '.ant-drawer-close, [class*="UnitDetail"] [aria-label="Close"], [class*="unit-detail"] [aria-label="Close"], button:has-text("Close")'
    ).first();

    // Edit affordances — must NEVER be present per ADMIN-FS-Towers §1
    // (read-only constraint). We pre-compose the locator so specs can
    // assert count == 0 in one line.
    this.editAffordances = page.locator(
      'main button:has-text("Edit"), ' +
      'main button:has-text("Save"), ' +
      'main button:has-text("Update"), ' +
      'main button:has-text("Configure"), ' +
      'main button:has-text("Delete"), ' +
      'main button:has-text("Add"), ' +
      'main .ant-switch, ' +
      'main input[type="checkbox"]'
    );
  }

  /**
   * _kpiByLabel(rx) — return a locator for the KPI card whose label matches `rx`.
   *
   * Strategy: find any element matching the kpiCards locator that also
   * contains text matching the supplied regex. We use Playwright's `filter`
   * with hasText so the result is a properly chained locator (lazy resolved).
   */
  _kpiByLabel(rx) {
    return this.kpiCards.filter({ hasText: rx }).first();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /**
   * navigate() — go directly to /admin/towers.
   * Called in beforeEach so every test starts on a clean page.
   */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
    // Some sessions land on /admin/customers when direct nav fails to mount towers route.
    // Fallback: click the sidebar Towers link if URL did not settle at /admin/towers.
    if (!/\/admin\/towers/.test(this.page.url())) {
      const sidebarTowers = this.page.locator('a[href="/admin/towers"], a:has-text("Towers")').first();
      const present = await sidebarTowers.isVisible({ timeout: 5_000 }).catch(() => false);
      if (present) {
        await sidebarTowers.click().catch(() => {});
        await this.page.waitForURL(/\/admin\/towers/, { timeout: 15_000 }).catch(() => {});
      }
    }
  }

  /**
   * waitForLoad() — wait until the Towers page is fully interactive.
   * We race two signals: the KPI cards rendering OR the tower list rows
   * appearing — either confirms the React app has hydrated. Then we wait
   * one more networkidle tick so any second-wave API calls settle.
   */
  async waitForLoad() {
    await Promise.race([
      this.kpiCards.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.towerListRows.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.gridContainer.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * navigateViaSidebar() — click the "Towers" link in the sidebar.
   * Used to test the sidebar route works (ADM_TWR_001).
   *
   * Why .first(): Ant Design renders duplicate <a> tags for collapsed and
   * expanded sidebar states; both share the same href.
   */
  async navigateViaSidebar() {
    await this.towersLink.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.towersLink.first().click();
    await this.page.waitForURL(/\/admin\/towers/, { timeout: 15_000 });
    await this.waitForLoad();
  }

  /**
   * expectOnTowersUrl() — assert the browser is on /admin/towers.
   */
  async expectOnTowersUrl() {
    await this.page.waitForURL(/\/admin\/towers/, { timeout: 15_000 });
  }

  // ── KPI inspection ────────────────────────────────────────────────────────

  /**
   * expectKpiCards() — assert that at least one KPI card is visible.
   * Granular per-card existence checks are done via the kpiXxx locators.
   */
  async expectKpiCards() {
    const count = await this.kpiCards.count();
    if (count === 0) {
      throw new Error('Expected KPI cards on /admin/towers — none rendered');
    }
    await this.kpiCards.first().waitFor({ state: 'visible', timeout: 10_000 });
    return count;
  }

  /**
   * readKpiValue(label) — return the numeric value displayed in the named KPI card.
   *
   * Strategy: locate the KPI card by label regex, read its text content,
   * strip non-digits, parse to int. Returns NaN if the card is not found
   * or its value is non-numeric.
   *
   * @param {RegExp|string} label — label regex (e.g. /total\s*towers/i)
   * @returns {Promise<number>}
   */
  async readKpiValue(label) {
    const rx = label instanceof RegExp ? label : new RegExp(label, 'i');
    const card = this._kpiByLabel(rx);
    const exists = await card.count();
    if (!exists) return NaN;
    const txt = (await card.textContent()) || '';
    const digits = txt.replace(/[^0-9]/g, '');
    return digits.length ? parseInt(digits, 10) : NaN;
  }

  // ── Tower list / sidebar ──────────────────────────────────────────────────

  /**
   * getTowersList() — return the visible tower rows as objects.
   *
   * Each entry: { name, availableLabel, isInactive }.
   *  - name           — first non-empty text segment (tower name)
   *  - availableLabel — e.g. "159 Units Available" if present
   *  - isInactive     — true when "(Inactive)" appears in the row
   */
  async getTowersList() {
    const count = await this.towerListRows.count();
    const out = [];
    for (let i = 0; i < count; i++) {
      const text = ((await this.towerListRows.nth(i).textContent()) || '').trim();
      if (!text) continue;
      const name = TowersPage.TOWER_NAMES.find((n) => text.includes(n)) || text.split(/\s{2,}|\n/)[0].trim();
      const availMatch = text.match(/(\d+)\s*Units?\s*Available/i);
      out.push({
        name,
        availableLabel: availMatch ? availMatch[0] : '',
        availableCount: availMatch ? parseInt(availMatch[1], 10) : NaN,
        isInactive: /\(Inactive\)/i.test(text),
        raw: text,
      });
    }
    return out;
  }

  /**
   * selectTower(idxOrName) — click a tower in the sidebar to load its grid.
   *
   * @param {number|string} idxOrName — zero-based row index OR tower name
   *   (e.g. 0, "Crest", "Crown"). Tower names are matched case-insensitively.
   */
  async selectTower(idxOrName) {
    let row;
    if (typeof idxOrName === 'number') {
      row = this.towerListRows.nth(idxOrName);
    } else {
      // Match the row containing the tower name (case-insensitive contains)
      row = this.towerListRows.filter({ hasText: new RegExp(idxOrName, 'i') }).first();
    }
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.click();
    // Wait for grid to settle — either the header updates or units re-render
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.gridContainer.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  /**
   * expectTowerHighlighted(name) — assert the selected tower row carries
   * an active/selected visual state (Ant 'active' or aria-selected).
   */
  async expectTowerHighlighted(name) {
    const row = this.towerListRows.filter({ hasText: new RegExp(name, 'i') }).first();
    await row.waitFor({ state: 'visible', timeout: 5_000 });
    const cls = (await row.getAttribute('class')) || '';
    const ariaSelected = await row.getAttribute('aria-selected');
    const isActive = /active|selected|current/i.test(cls) || ariaSelected === 'true';
    if (!isActive) {
      // Some designs put the active class on a child anchor — check children
      const childActive = await row.locator('[class*="active"], [class*="selected"], [aria-selected="true"]').count();
      if (childActive === 0) {
        throw new Error(`Expected tower row "${name}" to be highlighted/selected`);
      }
    }
  }

  // ── Floor / unit grid ─────────────────────────────────────────────────────

  /**
   * getFloorGrid() — return summary stats about the currently-loaded grid.
   *
   * Returns { floorCount, unitCount } — both numbers. Returns 0/0 if the
   * grid has not yet rendered.
   */
  async getFloorGrid() {
    const floorCount = await this.floorRows.count();
    const unitCount = await this.unitCells.count();
    return { floorCount, unitCount };
  }

  /**
   * getUnitMatrix() — return every unit cell as { idx, status, color }.
   *
   * Status is inferred from the cell's CSS class or computed background
   * color via a single page.evaluate() round-trip (one DOM scan).
   */
  async getUnitMatrix() {
    return this.page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll(
        '[class*="unit-cell"], [class*="UnitCell"], [class*="grid-cell"], [data-unit-id]'
      ));
      const classify = (rgb) => {
        // rgb string e.g. "rgb(255, 255, 255)"
        const m = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (!m) return 'unknown';
        const [r, g, b] = [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
        // Rough buckets — refined by class hint when present
        if (r > 230 && g > 230 && b > 230) return 'white';
        if (r > 180 && g < 90 && b < 90)   return 'red';
        if (r > 200 && g > 120 && b < 100) return 'orange';
        if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r < 200) return 'grey';
        return 'unknown';
      };
      return cells.map((el, idx) => {
        const cls = el.className || '';
        const bg = window.getComputedStyle(el).backgroundColor || '';
        let color = classify(bg);
        // Class hints override colour inference when explicit
        if (/available|white/i.test(cls)) color = 'white';
        else if (/sold|booked|red/i.test(cls)) color = 'red';
        else if (/paying|being.?paid|orange/i.test(cls)) color = 'orange';
        else if (/reserved|blocked|refuge|grey|gray|disabled/i.test(cls)) color = 'grey';
        const statusMap = { white: 'AVAILABLE', red: 'SOLD', orange: 'BEING_PAID', grey: 'RESERVED' };
        return { idx, color, status: statusMap[color] || 'UNKNOWN' };
      });
    });
  }

  /**
   * getUnitColor(idx) — return the inferred color for the unit cell at idx.
   * Convenience over getUnitMatrix() when you only care about one cell.
   */
  async getUnitColor(idx) {
    const matrix = await this.getUnitMatrix();
    return matrix[idx] ? matrix[idx].color : null;
  }

  /**
   * getUnitStatus(idx) — return the canonical status string for a unit:
   *   AVAILABLE | SOLD | BEING_PAID | RESERVED | UNKNOWN
   */
  async getUnitStatus(idx) {
    const matrix = await this.getUnitMatrix();
    return matrix[idx] ? matrix[idx].status : 'UNKNOWN';
  }

  /**
   * findFirstUnitOfStatus(status) — return the idx of the first unit cell
   * matching the given status, or -1 if none found.
   *
   * @param {string} status — AVAILABLE | SOLD | BEING_PAID | RESERVED
   */
  async findFirstUnitOfStatus(status) {
    const matrix = await this.getUnitMatrix();
    const hit = matrix.find((m) => m.status === status);
    return hit ? hit.idx : -1;
  }

  // ── Unit Detail panel ─────────────────────────────────────────────────────

  /**
   * openUnitDetail(idx) — click the unit cell at idx; the detail panel
   * is expected to slide in only for AVAILABLE (white) cells per BRD.
   *
   * Does NOT assert visibility — callers decide whether to expect the
   * panel (positive test) or assert it stays hidden (negative test on
   * sold/grey/orange cells).
   */
  async openUnitDetail(idx) {
    const cell = this.unitCells.nth(idx);
    await cell.waitFor({ state: 'visible', timeout: 10_000 });
    await cell.click();
    // Give the slide-in animation a moment to complete
    await this.page.waitForTimeout(500); // anim window — Ant drawer slide is ~300ms
  }

  /**
   * expectUnitDetailVisible() — assert the slide-in panel is on screen.
   */
  async expectUnitDetailVisible() {
    await this.unitDetailPanel.waitFor({ state: 'visible', timeout: 5_000 });
  }

  /**
   * expectUnitDetailHidden() — assert the panel is NOT visible. Used by
   * the NEG TCs that click sold/grey/orange cells.
   */
  async expectUnitDetailHidden() {
    const count = await this.unitDetailPanel.count();
    if (count === 0) return; // not in DOM at all — pass
    const visible = await this.unitDetailPanel.isVisible().catch(() => false);
    if (visible) {
      throw new Error('Expected Unit Detail panel to be hidden but it is visible');
    }
  }

  /**
   * readUnitDetailFields() — return the visible fields from the panel as a
   * key/value map. Field names are normalised (lowercased, spaces collapsed).
   *
   * Strategy: scan all label/value pairs inside the panel. Most designs
   * render them as definition lists or label-row pairs; we collect any
   * "Label: Value" pattern in the panel's text.
   */
  async readUnitDetailFields() {
    const txt = (await this.unitDetailPanel.textContent()) || '';
    const out = {};
    // Split on common separators — typical fields each end with a value line
    const lines = txt.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    for (let i = 0; i < lines.length - 1; i++) {
      // "Unit Number\n3502 - Crest" pattern
      const label = lines[i];
      const val = lines[i + 1];
      if (/^[A-Z][A-Za-z ]{2,40}$/.test(label) && val) {
        out[label.toLowerCase().replace(/\s+/g, ' ')] = val;
      }
    }
    // Also extract Rupee-prefixed amounts in case the pair split misses them
    const ruMatches = txt.match(/₹\s*[\d,]+/g) || [];
    if (ruMatches.length) out['_currencyValues'] = ruMatches;
    return out;
  }

  /**
   * closeUnitDetail() — close the slide-in panel.
   */
  async closeUnitDetail() {
    await this.unitDetailCloseBtn.click({ trial: false }).catch(async () => {
      // Fallback — press Escape (Ant drawer responds to it)
      await this.page.keyboard.press('Escape');
    });
    await this.unitDetailPanel.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ── Read-only constraint ──────────────────────────────────────────────────

  /**
   * expectReadOnly() — assert the page exposes NO edit affordances.
   *
   * Per ADMIN-FS-Towers §1 the entire Towers page is read-only. This method
   * asserts the count of edit-like controls (Edit/Save/Update/Configure/
   * Delete/Add buttons, switches, checkboxes) inside the main content area
   * is zero.
   *
   * We exclude the sidebar (nav links may have similar text) and the unit
   * detail panel (closing X is allowed — it's not a mutation).
   */
  async expectReadOnly() {
    const count = await this.editAffordances.count();
    if (count > 0) {
      // Surface what was found for a better failure message
      const labels = [];
      for (let i = 0; i < Math.min(count, 10); i++) {
        labels.push(((await this.editAffordances.nth(i).textContent()) || '').trim() || '<no text>');
      }
      throw new Error(`Expected Towers page to be read-only but found ${count} edit affordance(s): ${labels.join(', ')}`);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * UNIT_COLOR — canonical color names. Exposed as a static convenience
   * for spec assertions that want symbolic constants.
   */
  static get UNIT_COLOR() { return UNIT_COLOR; }

  /**
   * TOWER_NAMES — the 18 Xanadu tower names per ADMIN-FS-Towers §2.
   * Used for sidebar list verification (ADM_TWR_009).
   */
  static get TOWER_NAMES() {
    return [
      'Crest', 'Crown', 'Blossom', 'Bright', 'Pinnacle', 'Triumph',
      'Prestige', 'Horizon', 'Dawn', 'Aura', 'Glory', 'Pride',
      'Grace', 'Aspire', 'Prime', 'Fortune', 'Radiance', 'Grand',
    ];
  }
}

module.exports = { TowersPage };
