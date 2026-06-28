'use strict';

/**
 * ConfigPage.js — Page Object Model for Admin Portal Config / CMS module.
 *
 * The Config screen is a single long-scroll page composed of 9 stacked sections,
 * each with its own download / upload / submit controls and its own backend route.
 * Sections:
 *   1. Tower Configuration          — 18 tower toggle cards + Update button
 *   2. Registration Status          — CSV upload (Allow/Forbid per registration)
 *   3. Unit Status                  — CSV upload (AVAILABLE/RESERVED, Update=1)
 *   4. Unit Cost Update             — XLSX upload (Agreement_Value, EarlyBird)
 *   5. Bulk Booking Cancellation    — XLSX upload (Registration Number)
 *   6. Bulk Registration Cancellation — XLSX upload (Registration Number, Update)
 *   7. Sales Managers Bulk Upload   — XLSX upload (Role, Name, Phone, IS_AVAILABLE)
 *   8. Customer Actions Card        — Master toggle + 3 typology checkboxes/counts
 *   9. Max Preferences Per Unit     — Dropdown (0-255) + Update button
 *
 * Locators source: locators/admin/locator-map.json — module key "config".
 * Accessed exclusively via `L['key']` bracket syntax (no inline selectors).
 *
 * The locator-map.json crawl only captured the pre-auth login page (Send OTP,
 * etc.) for this module; post-auth section-specific selectors are derived from
 * the BRD/FSD text and use stable role/text Playwright locators which the
 * Tech Lead Agent will normalise into the locator map during the next scan.
 */

const { BasePage } = require('../../base/BasePage');
const { expect }   = require('@playwright/test');
const locatorMap   = require('../../../locators/admin/locator-map.json');

const L = locatorMap['config'] || {};

const CONFIG_URL = 'https://uat-web.xrportal.in/admin/config';
const CMS_URL    = 'https://uat-web.xrportal.in/admin/cms';

// ── Section identity registry ───────────────────────────────────────────────
// Section heading text → numeric index. Used by openSection() to locate the
// correct section block on the long-scroll page.
const SECTION_HEADINGS = {
  towerConfiguration:           'Tower Configuration',
  registrationStatus:           'Registration Status',
  unitStatus:                   'Unit Status',
  unitCostUpdate:               'Unit Cost Update',
  bulkBookingCancellation:      'Bulk Booking Cancellation',
  bulkRegistrationCancellation: 'Bulk Registration Cancellation',
  salesManagersBulkUpload:      'Sales Managers',
  customerActionsCard:          'Customer Actions',
  maxPreferencesPerUnit:        'Max Preferences Per Unit',
};

class ConfigPage extends BasePage {
  constructor(page) {
    super(page);
    this.L   = L;
    // Live route is /admin/cms — the /admin/config slug is NOT yet migrated and
    // redirects to /admin/customers (CLAUDE.md §3). Navigate to the real URL.
    this.url = CMS_URL;

    // ── Page-level chrome ─────────────────────────────────────────────────
    this.configLink           = page.locator(L['configLink']     && L['configLink'].selector     || 'a:has-text("Config")');
    this.cMSLink              = page.locator(L['cMSLink']        && L['cMSLink'].selector        || 'a:has-text("CMS")');
    this.logoutButton         = page.locator(L['logoutButton']   && L['logoutButton'].selector   || 'button:has-text("Logout")');

    // Cross-section controls present on the page
    this.cancelBulkUnitsButton = page.locator(L['cancelBulkUnitsButton'] && L['cancelBulkUnitsButton'].selector || 'button:has-text("Cancel Bulk Units")');
    this.downloadButton        = page.locator(L['downloadButton']        && L['downloadButton'].selector        || 'button:has-text("Download")');
    this.refreshButton         = page.locator(L['refreshButton']         && L['refreshButton'].selector         || 'button:has-text("Refresh")');

    // Page title — "Configurations"
    // Live page renders all headings as h5 — use role-based heading (level-agnostic).
    this.pageHeading = page.getByRole('heading', { name: /Configurations?/i }).first();

    // ── Section 1 — Tower Configuration ───────────────────────────────────
    this.section1                  = this._sectionBlock(SECTION_HEADINGS.towerConfiguration);
    // Towers render as "Tower N - Name" headings (role=heading, no .ant-card).
    // Count page-wide via the a11y role tree — robust to the exact tag/level.
    this.towerCards                = page.getByRole('heading', { name: /^Tower\s*\d+\s*-/i });
    // Tower toggles/buttons live as flat siblings under the Tower Configuration
    // heading; scope page-wide (toggles before the first upload section's heading).
    this.towerToggles              = page.locator('[role="switch"], .ant-switch');
    this.updateTowerConfigButton   = page.getByRole('button', { name: /Update Tower Configuration/i });
    this.viewTowerLink             = page.getByRole('button', { name: /View Tower/i });

    // Sections 2-9 share a FLAT DOM: each section's controls are SIBLINGS that
    // follow its h5 heading (no per-section wrapper). Scope every control to the
    // first matching element AFTER its section heading (see _after()).
    const SAMPLE = 'button[contains(normalize-space(.),"Sample") or contains(normalize-space(.),"Download")]';
    const UPLOAD = 'button[contains(normalize-space(.),"Upload")]';
    const SUBMIT = 'button[normalize-space(.)="Submit"]';
    const FILEIN = 'input[@type="file"]';

    // ── Section 2 — Registration Status ───────────────────────────────────
    this.section2SampleDownload    = this._after('registrationStatus', SAMPLE);
    this.section2UploadButton      = this._after('registrationStatus', UPLOAD);
    this.section2FileInput         = this._after('registrationStatus', FILEIN);
    this.section2SubmitButton      = this._after('registrationStatus', SUBMIT);

    // ── Section 3 — Unit Status ───────────────────────────────────────────
    // §3 controls scoped to the section's own .form-section-wrapper (robust;
    // the flat `following::` walk hung here — see _sectionWrap()).
    this.section3Wrap              = this._sectionWrap('unitStatus');
    this.section3SampleDownload    = this.section3Wrap.getByRole('button', { name: /Sample|Download/i });
    this.section3UploadButton      = this.section3Wrap.getByRole('button', { name: /Upload/i });
    this.section3FileInput         = this.section3Wrap.locator('input[type="file"]');
    this.section3SubmitButton      = this.section3Wrap.getByRole('button', { name: /^Submit$/i });

    // ── Section 4 — Unit Cost Update ──────────────────────────────────────
    // §4 controls scoped to the section's own .form-section-wrapper (robust; see §3).
    this.section4Wrap                   = this._sectionWrap('unitCostUpdate');
    this.availableUnitInventoryDownload = this.section4Wrap.getByRole('button', { name: /Download/i });
    this.section4UploadButton           = this.section4Wrap.getByRole('button', { name: /Upload/i });
    this.section4FileInput              = this.section4Wrap.locator('input[type="file"]');
    this.section4SubmitButton           = this.section4Wrap.getByRole('button', { name: /^Submit$/i });

    // ── Section 5 — Bulk Booking Cancellation ─────────────────────────────
    this.section5SampleDownload    = this._after('bulkBookingCancellation', SAMPLE);
    this.section5UploadButton      = this._after('bulkBookingCancellation', UPLOAD);
    this.section5FileInput         = this._after('bulkBookingCancellation', FILEIN);
    this.section5SubmitButton      = this._after('bulkBookingCancellation', SUBMIT);

    // ── Section 6 — Bulk Registration Cancellation ────────────────────────
    this.section6SampleDownload    = this._after('bulkRegistrationCancellation', SAMPLE);
    this.section6UploadButton      = this._after('bulkRegistrationCancellation', UPLOAD);
    this.section6FileInput         = this._after('bulkRegistrationCancellation', FILEIN);
    this.section6SubmitButton      = this._after('bulkRegistrationCancellation', SUBMIT);

    // ── Section 7 — Sales Managers Bulk Upload ────────────────────────────
    this.section7SampleDownload    = this._after('salesManagersBulkUpload', SAMPLE);
    this.section7UploadButton      = this._after('salesManagersBulkUpload', UPLOAD);
    this.section7FileInput         = this._after('salesManagersBulkUpload', FILEIN);
    this.section7SubmitButton      = this._after('salesManagersBulkUpload', SUBMIT);

    // ── Section 8 — Customer Actions Card ─────────────────────────────────
    this.allowAdditionalRegToggle       = this._after('customerActionsCard', '*[@role="switch"]');
    // Checkboxes are role=checkbox named "Allow <typology>" (not raw inputs).
    this.oneBedGrowthCheckbox           = page.getByRole('checkbox', { name: /1 Bed Growth Home/i });
    this.twoBedGrowthCheckbox           = page.getByRole('checkbox', { name: /2 Bed Growth Home/i });
    this.twoBedRiseCheckbox             = page.getByRole('checkbox', { name: /2 Bed Rise Home/i });
    this.section8SubmitButton           = this._after('customerActionsCard', SUBMIT);
    // [BUG-REF: BUG-CFG-001] '2 Bed Peak Home' is server-side force-disabled (often absent from UI).
    this.twoBedPeakHomeCheckbox         = page.getByRole('checkbox', { name: /2 Bed Peak Home/i });

    // ── Section 9 — Max Preferences Per Unit ──────────────────────────────
    this.maxPreferencesSelect           = this._after('maxPreferencesPerUnit', '*[@role="combobox" or self::select]');
    this.maxPreferencesUpdateButton     = this._after('maxPreferencesPerUnit', 'button[contains(normalize-space(.),"Update")]');

    // ── Generic validation / toast surfaces ───────────────────────────────
    this.toast                = page.locator('.ant-message, [role="alert"], .Toastify__toast');
    this.validationError      = page.locator('.ant-form-item-explain-error, .error-message, [role="alert"]');
  }

  // ── Internals ──────────────────────────────────────────────────────────

  /**
   * Returns a locator scoped to the section whose heading matches the given
   * text. The section block is the nearest ancestor section/div that contains
   * the heading. Falls back gracefully if the DOM structure differs.
   */
  /**
   * The section heading element (by SECTION_HEADINGS key), via a11y role.
   * Substring match (live "Customer Actions Card" vs config "Customer Actions")
   * + .first() (some titles repeat as an h5 section header AND an h6 subtitle,
   * e.g. "Max Preferences Per Unit") — first occurrence is the section header.
   */
  _sectionHeading(name) {
    const text = SECTION_HEADINGS[name] || name;
    return this.page.getByRole('heading', { name: text }).first();
  }

  /**
   * First control matching an XPath tail that FOLLOWS a section's heading in
   * document order. The Config page is a flat list (heading + sibling controls),
   * so a section's controls are the elements after its heading and before the next.
   */
  _after(name, xpathTail) {
    return this._sectionHeading(name).locator(`xpath=following::${xpathTail}[1]`);
  }

  /**
   * The `.form-section-wrapper` that CONTAINS a section's heading. The Config page
   * actually renders one `.form-section-wrapper` per section (9 total) — scoping
   * controls to the wrapper is far more robust than the flat `following::` walk,
   * which can cross section boundaries or resolve detached nodes (caused §3 hangs).
   */
  _sectionWrap(name) {
    const text = SECTION_HEADINGS[name] || name;
    return this.page
      .locator('.form-section-wrapper', { has: this.page.getByRole('heading', { name: text }) })
      .first();
  }

  _sectionBlock(headingText) {
    // Section = the innermost div that contains the section's heading. Match the
    // heading via the a11y role tree (robust to tag/level), then take the closest
    // wrapping div (.last() = deepest ancestor in document order).
    return this.page
      .locator('div')
      .filter({ has: this.page.getByRole('heading', { name: headingText }) })
      .last();
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    // Either page heading or first section must surface — be tolerant of the
    // current sprint's URL ambiguity (/admin/config vs /admin/cms).
    await Promise.race([
      this.pageHeading.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
      this.section1.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
    ]);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectOnConfigUrl() {
    // Page lives at either /admin/config or /admin/cms during the sprint
    // — accept either to keep the suite stable across the rename.
    await expect(this.page).toHaveURL(/\/admin\/(config|cms)\b/);
  }

  // ── Section open / verify helpers ───────────────────────────────────────

  /**
   * Scroll the named section into view and return its scoped locator.
   *
   * @param {keyof SECTION_HEADINGS} name
   * @returns {import('@playwright/test').Locator}
   */
  async openSection(name) {
    if (!SECTION_HEADINGS[name]) throw new Error(`Unknown Config section: ${name}`);
    // Flat DOM has no per-section container; the section's heading is the anchor.
    const heading = this._sectionHeading(name);
    await heading.scrollIntoViewIfNeeded().catch(() => {});
    return heading;
  }

  _sectionIndex(name) {
    const order = [
      'towerConfiguration', 'registrationStatus', 'unitStatus', 'unitCostUpdate',
      'bulkBookingCancellation', 'bulkRegistrationCancellation', 'salesManagersBulkUpload',
      'customerActionsCard', 'maxPreferencesPerUnit',
    ];
    return order.indexOf(name) + 1;
  }

  async expectSectionVisible(name) {
    const block = await this.openSection(name);
    await expect(block).toBeVisible();
  }

  /**
   * Submit the named section's Submit button. Used uniformly across S2-S8.
   */
  async submitSection(name) {
    const idx = this._sectionIndex(name);
    const btn = this[`section${idx}SubmitButton`];
    if (!btn) throw new Error(`Section ${name} has no Submit button on this POM`);
    await this.click(btn);
  }

  async expectValidationError() {
    await expect(this.validationError.first()).toBeVisible({ timeout: 5000 });
  }

  // ── Section 1 — Tower Configuration ────────────────────────────────────

  async getTowerCardCount() {
    return this.towerCards.count();
  }

  /**
   * Read the Active/Inactive state of the tower toggles (read-only). Tower
   * switches render before the Customer Actions master toggle, so the first
   * `towerCount` switches are the towers. Returns { total, active, inactive }.
   */
  async readTowerToggleStates() {
    const towerCount = await this.getTowerCardCount();
    const switches = this.page.locator('[role="switch"], .ant-switch');
    await switches.first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    let active = 0, inactive = 0;
    for (let i = 0; i < towerCount; i++) {
      const sw = switches.nth(i);
      const on = await sw.evaluate(
        (el) => el.getAttribute('aria-checked') === 'true' || el.classList.contains('ant-switch-checked')
      ).catch(() => false);
      if (on) active++; else inactive++;
    }
    return { total: towerCount, active, inactive };
  }

  async clickUpdateTowerConfiguration() {
    await this.click(this.updateTowerConfigButton);
  }

  async toggleTowerByIndex(idx) {
    await this.click(this.towerToggles.nth(idx));
  }

  /**
   * Upload a file to Section 2 (Registration Status) via the file-chooser the
   * "Upload File" button opens (the UI's real attach path), then Submit. Returns
   * the update-registrations-status response (its body is a per-row result Excel).
   */
  async uploadRegStatusFile(filePath) {
    // SHOW_UPLOAD_DATA=1 (headed): overlay the exact rows on-screen, pause, then upload —
    // so a watcher sees, in real time, what data is being uploaded.
    if (process.env.SHOW_UPLOAD_DATA) {
      const XLSX = require('xlsx');
      const wb = XLSX.readFile(filePath);
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      await this.page.evaluate(({ rows, name }) => {
        const old = document.getElementById('__upload_preview__'); if (old) old.remove();
        const d = document.createElement('div');
        d.id = '__upload_preview__';
        d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#107c10;color:#fff;padding:14px 20px;font:15px/1.5 monospace;box-shadow:0 6px 18px rgba(0,0,0,.5)';
        d.innerHTML = `<b>⬆ UPLOADING THIS FILE → ${name}</b><br>` +
          rows.map((r) => (r || []).join('&nbsp;&nbsp;|&nbsp;&nbsp;')).join('<br>');
        document.body.appendChild(d);
      }, { rows, name: filePath.split(/[\\/]/).pop() });
      await this.page.waitForTimeout(Number(process.env.DEMO_PAUSE_MS || 5000));
      await this.page.evaluate(() => { const e = document.getElementById('__upload_preview__'); if (e) e.remove(); });
    }
    const [chooser] = await Promise.all([
      this.page.waitForEvent('filechooser', { timeout: 10_000 }),
      this.section2UploadButton.click(),
    ]);
    await chooser.setFiles(filePath);
    await this.page.waitForTimeout(900);
    const respP = this.page.waitForResponse((r) => /update-registrations-status/i.test(r.url()), { timeout: 20_000 }).catch(() => null);
    await this.section2SubmitButton.click();
    const resp = await respP;
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1500);
    return resp;
  }

  /**
   * Upload a file to Section 3 (Unit Status) via the file-chooser, then Submit.
   * Mirrors uploadRegStatusFile (incl. the SHOW_UPLOAD_DATA banner). Returns the response.
   */
  async uploadUnitStatusFile(filePath) {
    if (process.env.SHOW_UPLOAD_DATA) {
      const XLSX = require('xlsx');
      const rows = XLSX.utils.sheet_to_json(XLSX.readFile(filePath).Sheets[XLSX.readFile(filePath).SheetNames[0]], { header: 1 });
      await this.page.evaluate(({ rows, name }) => {
        const old = document.getElementById('__upload_preview__'); if (old) old.remove();
        const d = document.createElement('div'); d.id = '__upload_preview__';
        d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#107c10;color:#fff;padding:14px 20px;font:14px/1.5 monospace;box-shadow:0 6px 18px rgba(0,0,0,.5)';
        d.innerHTML = `<b>⬆ UPLOADING → Section 3 (Unit Status): ${name}</b><br>` + rows.map((r) => (r || []).join('&nbsp;|&nbsp;')).join('<br>');
        document.body.appendChild(d);
      }, { rows, name: filePath.split(/[\\/]/).pop() });
      await this.page.waitForTimeout(Number(process.env.DEMO_PAUSE_MS || 5000));
      await this.page.evaluate(() => { const e = document.getElementById('__upload_preview__'); if (e) e.remove(); });
    }
    // The §3 wrapper has a real <input type=file> — attach to it directly (more
    // reliable than the file-chooser, which the "Upload File" button triggers).
    await this.section3FileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(900);
    const respP = this.page.waitForResponse((r) => r.request().method() !== 'GET' && /admin\//i.test(r.url()), { timeout: 30_000 }).catch(() => null);
    await this.section3SubmitButton.click();
    const resp = await respP;
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1500);
    // Parse the §3 contract: a 200 returns a per-row result .xlsx (last column =
    // "Result"); a 4xx returns a JSON {success,message}. Surface both so §3 tests
    // can assert the row-level outcome ("Updated X → Y", "Invalid Unit ID", …).
    let httpStatus = null, rows = null, message = null;
    if (resp) {
      httpStatus = resp.status();
      try {
        const body = await resp.body();
        const ct = (resp.headers()['content-type'] || '');
        if (/spreadsheet|octet|xlsx|excel/i.test(ct)) {
          const XLSX = require('xlsx');
          const wb = XLSX.read(body, { type: 'buffer' });
          rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        } else {
          try { message = JSON.parse(body.toString()).message; } catch { message = body.toString().slice(0, 300); }
        }
      } catch { /* response body may be unavailable */ }
    }
    return { resp, httpStatus, rows, message };
  }

  /** The Active/Inactive toggle on the tower card whose heading contains `name`. */
  getTowerToggleByName(name) {
    const heading = this.page.getByRole('heading', { name: new RegExp(name, 'i') }).first();
    return heading.locator('xpath=following::*[@role="switch" or contains(@class,"ant-switch")][1]');
  }

  /** Read a switch locator's on/off state. */
  async toggleState(loc) {
    return loc.evaluate(
      (el) => el.getAttribute('aria-checked') === 'true' || el.classList.contains('ant-switch-checked')
    );
  }

  /**
   * Set a list of towers (by name) to a desired Active state, then click Update once.
   * Polls each toggle until it registers the change before saving (avoids no-op saves).
   */
  async setTowersState(names, active) {
    for (const name of names) {
      let cur = await this.toggleState(this.getTowerToggleByName(name));
      if (cur !== active) {
        await this.getTowerToggleByName(name).click();
        for (let t = 0; t < 14 && cur !== active; t++) {
          await this.page.waitForTimeout(300);
          cur = await this.toggleState(this.getTowerToggleByName(name)).catch(() => cur);
        }
      }
    }
    await this.clickUpdateTowerConfiguration();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  /** Click the "View Tower" link on the card whose heading contains `name` (e.g. "Crest"). */
  async clickViewTowerByName(name) {
    const heading = this.page.getByRole('heading', { name: new RegExp(name, 'i') }).first();
    const btn = heading.locator('xpath=following::button[contains(normalize-space(.),"View Tower")][1]');
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await Promise.all([
      this.page.waitForURL(/\/admin\/towers/, { timeout: 15_000 }).catch(() => {}),
      btn.click(),
    ]);
  }

  // ── Section 2 — Registration Status ────────────────────────────────────

  async uploadRegistrationStatusFile(filePath) {
    await this.section2FileInput.setInputFiles(filePath);
  }

  // ── Section 4 — Unit Cost Update ───────────────────────────────────────

  async clickInventoryDownload() {
    await this.click(this.availableUnitInventoryDownload);
  }

  async uploadUnitCostFile(filePath) {
    await this.section4FileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(900);
    const respP = this.page.waitForResponse((r) => r.request().method() !== 'GET' && /admin\//i.test(r.url()), { timeout: 30_000 }).catch(() => null);
    await this.section4SubmitButton.click();
    const resp = await respP;
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1500);
    let httpStatus = null, rows = null, message = null;
    if (resp) {
      httpStatus = resp.status();
      try {
        const body = await resp.body();
        const ct = (resp.headers()['content-type'] || '');
        if (/spreadsheet|octet|xlsx|excel/i.test(ct)) {
          const XLSX = require('xlsx');
          const wb = XLSX.read(body, { type: 'buffer' });
          rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        } else {
          try { message = JSON.parse(body.toString()).message; } catch { message = body.toString().slice(0, 300); }
        }
      } catch { /* body may be unavailable */ }
    }
    return { resp, httpStatus, rows, message };
  }

  /** Download the §4 "Available Unit Inventory" pricing spreadsheet → returns parsed rows. */
  async downloadUnitInventory() {
    const [dl] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 30_000 }),
      this.availableUnitInventoryDownload.click(),
    ]);
    const os = require('os'); const path = require('path');
    const fp = path.join(os.tmpdir(), `unit-inventory-${Date.now()}.xlsx`);
    await dl.saveAs(fp);
    const XLSX = require('xlsx');
    const wb = XLSX.readFile(fp);
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
  }

  // ── Section 5 — Bulk Booking Cancellation ──────────────────────────────

  async uploadBulkBookingCancellationFile(filePath) {
    await this.section5FileInput.setInputFiles(filePath);
  }

  // ── Section 6 — Bulk Registration Cancellation ─────────────────────────

  async uploadBulkRegistrationCancellationFile(filePath) {
    await this.section6FileInput.setInputFiles(filePath);
  }

  // ── Section 7 — Sales Managers Bulk Upload ─────────────────────────────

  async uploadSalesManagersFile(filePath) {
    await this.section7FileInput.setInputFiles(filePath);
  }

  // ── Section 8 — Customer Actions Card ──────────────────────────────────

  async toggleAllowAdditionalRegistrations() {
    await this.click(this.allowAdditionalRegToggle);
  }

  async setOneBedCount(value) {
    await this.oneBedCountSelect.click();
    await this.page.locator(`.ant-select-item:has-text("${value}"), option:has-text("${value}")`).first().click();
  }

  // ── Section 9 — Max Preferences Per Unit ───────────────────────────────

  async setMaxPreferences(value) {
    await this.maxPreferencesSelect.click();
    await this.page.locator(`.ant-select-item:has-text("${value}"), option:has-text("${value}")`).first().click();
  }

  async clickMaxPreferencesUpdate() {
    await this.click(this.maxPreferencesUpdateButton);
  }
}

module.exports = { ConfigPage };
