'use strict';

/**
 * TowerHeatmapPage.js — Page Object Model for the SM Portal Tower Heatmap module.
 *
 * What this file does:
 *   Wraps every interaction on /sales-manager/towers into reusable methods.
 *   Tests import this class and call atomic methods (getTowerList, selectTower,
 *   getUnitMatrix, getUnitColor, expectReadOnly, expectRealtimeSync) instead of
 *   raw Playwright selectors.
 *
 * Where selectors live:
 *   The locator map (locators/sales-manager/locator-map.json, key "tower-heatmap")
 *   exposes only 5 named affordances — Logout, Reset, and the three sidebar nav
 *   links. The heatmap grid itself (tower list, unit cells, legend, tooltip) is
 *   NOT yet mapped because the live crawler did not enumerate dynamic SVG /
 *   canvas children. Until Tech Lead Agent extends the map, this POM uses DOM
 *   fallbacks via stable structural / role / text selectors documented inline.
 *
 * Read-only constraint (FSD §3 / BR 1.6.1):
 *   The SM heatmap is a pure inventory viewer — no edit, book, hold, or status-
 *   change controls are exposed. expectReadOnly() asserts the absence of these.
 *
 * Real-time sync (FSD §3 / BR 1.6.3):
 *   During active campaigns the Python service /units/status-sync broadcasts unit
 *   transitions over a WebSocket. expectRealtimeSync() checks WebSocket presence
 *   via page.on('websocket', ...) on a fresh navigation.
 *
 * BRD: SM-FS-Tower-Heatmap.md / FRD SM-Portal §2
 * FSD: manual-qa-repository/03-user-manual/sm-portal/fsd-tower-heatmap.md
 * TCs: manual-qa-repository/01-test-cases/sm-portal/tower-heatmap/TC_TOWER_HEATMAP.md
 */

const { expect }     = require('@playwright/test');
const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/sales-manager/locator-map.json');

const L = locatorMap['tower-heatmap'] || {};

const TOWERHEATMAP_URL = 'https://uat-web.xrportal.in/sales-manager/towers';
const SM_LOGIN_URL     = 'https://uat-web.xrportal.in/sales-manager';

/** Returns the selector string for a locator-map key, or '' if missing. */
function sel(key) {
  return (L[key] && L[key].selector) || '';
}

// Source-verified unit colour mapping (FSD §3 colour map — common.service.js).
//   AVAILABLE / HOLD / PREBOOKED / RESERVED → green
//   BOOKED / SOLD                            → red
//   REFUGE / NOT_AVAILABLE (padding)         → grey
// Note: orange/blue from the old BRD are NOT in source — see SM_TH_023 / SM_HMP_FSD_011.
const UNIT_COLOR_MAP = {
  green : ['#00FF00', '#00ff00', 'rgb(0, 255, 0)'],
  red   : ['#FF0000', '#ff0000', 'rgb(255, 0, 0)'],
  grey  : ['#808080', 'rgb(128, 128, 128)'],
  orange: ['#FFA500', '#ffa500', 'rgb(255, 165, 0)'],
  blue  : ['#0000FF', '#0000ff', 'rgb(0, 0, 255)'],
  white : ['#FFFFFF', '#ffffff', 'rgb(255, 255, 255)'],
};

class TowerHeatmapPage extends BasePage {
  constructor(page) {
    super(page);
    this.L   = L;
    this.url = TOWERHEATMAP_URL;

    // ── Mapped affordances (5 keys in locator-map) ─────────────────────────
    this.logoutButton         = page.locator(sel('logoutButton'));
    this.resetButton          = page.locator(sel('reset'));
    this.callbackRequestsLink = page.locator(sel('callbackRequestsLink'));
    this.towersLink           = page.locator(sel('towersLink'));
    this.allocationLink       = page.locator(sel('allocationLink'));

    // ── DOM fallbacks — heatmap grid not in locator-map yet ────────────────
    // Tower list / sidebar — accept common semantic shapes.
    this.towerList = page.locator(
      [
        '[data-testid="tower-list"]',
        'aside ul:has(li:has-text("Tower"))',
        'nav[aria-label*="Tower" i]',
        '.tower-list',
        'aside li[role="button"]',
      ].join(', '),
    );
    this.towerListItems = page.locator(
      [
        '[data-testid="tower-list"] [role="button"]',
        '[data-testid^="tower-item"]',
        'aside [class*="tower"][class*="item"]',
        'aside li:has-text("Tower")',
      ].join(', '),
    );

    // Unit matrix (the heatmap grid itself).
    this.unitMatrix = page.locator(
      [
        '[data-testid="unit-grid"]',
        '[data-testid="heatmap-grid"]',
        '.unit-grid',
        '.heatmap-grid',
        'svg.heatmap',
        'div[role="grid"]',
      ].join(', '),
    );
    this.unitCells = page.locator(
      [
        '[data-testid^="unit-cell"]',
        '[data-unit-id]',
        '.unit-cell',
        'div[role="grid"] [role="gridcell"]',
        'svg.heatmap rect[data-unit-id]',
      ].join(', '),
    );

    // Legend, tooltip, empty / loading / not-found states.
    this.legend       = page.locator('[data-testid="status-legend"], .legend, [aria-label*="legend" i]');
    this.tooltip      = page.locator('[role="tooltip"], .tooltip, [data-testid="unit-tooltip"]');
    this.loadingState = page.locator('[data-testid="loading"], .skeleton, [aria-busy="true"]');
    this.emptyState   = page.locator(
      ':text("No towers available"), :text("No towers"), [data-testid="empty-state"]',
    );
    this.notFoundState = page.locator(
      ':text("Tower not found"), :text("not found"), [data-testid="not-found"]',
    );
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToTowerId(id) {
    await this.page.goto(`${this.url}/${id}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    // Networkidle is the safest cue here — the heatmap fires towers + units
    // back-to-back and we want both settled before assertions.
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectOnTowersUrl() {
    await expect(this.page).toHaveURL(/\/sales-manager\/towers/);
  }

  // ── Tower list ──────────────────────────────────────────────────────────

  /** Returns array of visible tower names (best-effort against DOM fallbacks). */
  async getTowerList() {
    const count = await this.towerListItems.count().catch(() => 0);
    if (count === 0) return [];
    const names = [];
    for (let i = 0; i < count; i++) {
      const txt = ((await this.towerListItems.nth(i).textContent()) || '').trim();
      if (txt) names.push(txt);
    }
    return names;
  }

  async getTowerCount() {
    return this.towerListItems.count().catch(() => 0);
  }

  /** Click a tower by zero-based index. */
  async selectTower(idx) {
    const total = await this.towerListItems.count();
    if (idx >= total) {
      throw new Error(`selectTower(${idx}) — only ${total} towers visible`);
    }
    await this.towerListItems.nth(idx).click();
    // Allow unit grid request to settle.
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ── Unit grid ───────────────────────────────────────────────────────────

  /** Returns the count of rendered unit cells (best-effort). */
  async getUnitMatrix() {
    const visible = await this.unitMatrix.isVisible().catch(() => false);
    if (!visible) return { visible: false, cellCount: 0 };
    const cellCount = await this.unitCells.count().catch(() => 0);
    return { visible: true, cellCount };
  }

  /**
   * Read the computed background colour of the unit cell at index idx.
   * Returns the hex/rgb string as reported by getComputedStyle.
   */
  async getUnitColor(idx = 0) {
    const cell = this.unitCells.nth(idx);
    await cell.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return cell.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      // SVG <rect> uses `fill`; HTML uses background-color.
      return cs.backgroundColor || el.getAttribute('fill') || cs.fill || '';
    });
  }

  /** Map a raw computed colour string to a logical bucket name, or 'unknown'. */
  static categoriseColour(raw) {
    if (!raw) return 'unknown';
    const norm = raw.toLowerCase().replace(/\s+/g, '');
    for (const [bucket, vals] of Object.entries(UNIT_COLOR_MAP)) {
      if (vals.some((v) => norm.includes(v.toLowerCase().replace(/\s+/g, '')))) {
        return bucket;
      }
    }
    return 'unknown';
  }

  // ── Read-only / Real-time assertions ───────────────────────────────────

  /**
   * Assert that the heatmap exposes no edit/book/hold/status-change controls.
   * Per BR 1.6.1 / FSD §3 the SM view is strictly read-only.
   */
  async expectReadOnly() {
    const editLikeSelectors = [
      'button:has-text("Book")',
      'button:has-text("Hold")',
      'button:has-text("Reserve")',
      'button:has-text("Allocate")',
      'button:has-text("Change Status")',
      'button:has-text("Edit Unit")',
      '[data-testid="unit-edit"]',
      '[data-action="change-status"]',
    ];
    for (const s of editLikeSelectors) {
      const visible = await this.page.locator(s).first().isVisible().catch(() => false);
      expect(visible, `SM heatmap should be read-only — found editor: ${s}`).toBe(false);
    }
  }

  /**
   * Open a fresh navigation and detect whether the page opens a WebSocket
   * (or socket.io) connection — the BR 1.6.3 live-update channel.
   * Returns { opened: boolean, url: string|null }.
   *
   * Note: outside an active campaign the socket may be idle / absent (FSD §3,
   * SM_TH_017). Callers must interpret accordingly.
   */
  async expectRealtimeSync(timeoutMs = 8000) {
    let captured = { opened: false, url: null };
    const handler = (ws) => {
      captured = { opened: true, url: ws.url() };
    };
    this.page.on('websocket', handler);
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    // Give it a short tail to fire late.
    await this.page.waitForTimeout(timeoutMs); // intentional: WebSocket open may lag networkidle
    this.page.off('websocket', handler);
    return captured;
  }
}

module.exports = { TowerHeatmapPage, UNIT_COLOR_MAP };
