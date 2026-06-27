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
    this.section3SampleDownload    = this._after('unitStatus', SAMPLE);
    this.section3UploadButton      = this._after('unitStatus', UPLOAD);
    this.section3FileInput         = this._after('unitStatus', FILEIN);
    this.section3SubmitButton      = this._after('unitStatus', SUBMIT);

    // ── Section 4 — Unit Cost Update ──────────────────────────────────────
    this.availableUnitInventoryDownload = this._after('unitCostUpdate', SAMPLE);
    this.section4UploadButton           = this._after('unitCostUpdate', UPLOAD);
    this.section4FileInput              = this._after('unitCostUpdate', FILEIN);
    this.section4SubmitButton           = this._after('unitCostUpdate', SUBMIT);

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

  // ── Section 2 — Registration Status ────────────────────────────────────

  async uploadRegistrationStatusFile(filePath) {
    await this.section2FileInput.setInputFiles(filePath);
  }

  // ── Section 3 — Unit Status ────────────────────────────────────────────

  async uploadUnitStatusFile(filePath) {
    await this.section3FileInput.setInputFiles(filePath);
  }

  // ── Section 4 — Unit Cost Update ───────────────────────────────────────

  async clickInventoryDownload() {
    await this.click(this.availableUnitInventoryDownload);
  }

  async uploadUnitCostFile(filePath) {
    await this.section4FileInput.setInputFiles(filePath);
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
