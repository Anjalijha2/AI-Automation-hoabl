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
    this.url = CONFIG_URL;

    // ── Page-level chrome ─────────────────────────────────────────────────
    this.configLink           = page.locator(L['configLink']     && L['configLink'].selector     || 'a:has-text("Config")');
    this.cMSLink              = page.locator(L['cMSLink']        && L['cMSLink'].selector        || 'a:has-text("CMS")');
    this.logoutButton         = page.locator(L['logoutButton']   && L['logoutButton'].selector   || 'button:has-text("Logout")');

    // Cross-section controls present on the page
    this.cancelBulkUnitsButton = page.locator(L['cancelBulkUnitsButton'] && L['cancelBulkUnitsButton'].selector || 'button:has-text("Cancel Bulk Units")');
    this.downloadButton        = page.locator(L['downloadButton']        && L['downloadButton'].selector        || 'button:has-text("Download")');
    this.refreshButton         = page.locator(L['refreshButton']         && L['refreshButton'].selector         || 'button:has-text("Refresh")');

    // Page title — "Configurations"
    this.pageHeading = page.locator('h1, h2, h3').filter({ hasText: /Configurations?/i }).first();

    // ── Section 1 — Tower Configuration ───────────────────────────────────
    this.section1                  = this._sectionBlock(SECTION_HEADINGS.towerConfiguration);
    this.towerCards                = this.section1.locator('[class*="tower-card"], [data-tower-card], .ant-card');
    this.towerToggles              = this.section1.locator('button[role="switch"], .ant-switch');
    this.updateTowerConfigButton   = this.section1.locator('button:has-text("Update Tower Configuration"), button:has-text("Update")');
    this.viewTowerLink             = this.section1.locator('a:has-text("View Tower")');

    // ── Section 2 — Registration Status ───────────────────────────────────
    this.section2                  = this._sectionBlock(SECTION_HEADINGS.registrationStatus);
    this.section2SampleDownload    = this.section2.locator('button:has-text("Sample"), a:has-text("Sample")').first();
    this.section2FileInput         = this.section2.locator('input[type="file"]').first();
    this.section2SubmitButton      = this.section2.locator('button:has-text("Submit")').first();

    // ── Section 3 — Unit Status ───────────────────────────────────────────
    this.section3                  = this._sectionBlock(SECTION_HEADINGS.unitStatus);
    this.section3SampleDownload    = this.section3.locator('button:has-text("Sample"), a:has-text("Sample")').first();
    this.section3FileInput         = this.section3.locator('input[type="file"]').first();
    this.section3SubmitButton      = this.section3.locator('button:has-text("Submit")').first();

    // ── Section 4 — Unit Cost Update ──────────────────────────────────────
    this.section4                       = this._sectionBlock(SECTION_HEADINGS.unitCostUpdate);
    this.availableUnitInventoryDownload = this.section4.locator('button:has-text("Available Unit Inventory Download"), button:has-text("Inventory Download")').first();
    this.section4FileInput              = this.section4.locator('input[type="file"]').first();
    this.section4SubmitButton           = this.section4.locator('button:has-text("Submit")').first();

    // ── Section 5 — Bulk Booking Cancellation ─────────────────────────────
    this.section5                  = this._sectionBlock(SECTION_HEADINGS.bulkBookingCancellation);
    this.section5SampleDownload    = this.section5.locator('button:has-text("Sample"), a:has-text("Sample")').first();
    this.section5FileInput         = this.section5.locator('input[type="file"]').first();
    this.section5SubmitButton      = this.section5.locator('button:has-text("Submit")').first();

    // ── Section 6 — Bulk Registration Cancellation ────────────────────────
    this.section6                  = this._sectionBlock(SECTION_HEADINGS.bulkRegistrationCancellation);
    this.section6SampleDownload    = this.section6.locator('button:has-text("Sample"), a:has-text("Sample")').first();
    this.section6FileInput         = this.section6.locator('input[type="file"]').first();
    this.section6SubmitButton      = this.section6.locator('button:has-text("Submit")').first();

    // ── Section 7 — Sales Managers Bulk Upload ────────────────────────────
    this.section7                  = this._sectionBlock(SECTION_HEADINGS.salesManagersBulkUpload);
    this.section7SampleDownload    = this.section7.locator('button:has-text("Sample"), a:has-text("Sample")').first();
    this.section7FileInput         = this.section7.locator('input[type="file"]').first();
    this.section7SubmitButton      = this.section7.locator('button:has-text("Submit")').first();

    // ── Section 8 — Customer Actions Card ─────────────────────────────────
    this.section8                       = this._sectionBlock(SECTION_HEADINGS.customerActionsCard);
    this.allowAdditionalRegToggle       = this.section8.locator('button[role="switch"], .ant-switch').first();
    this.oneBedGrowthCheckbox           = this.section8.locator('label:has-text("1 Bed Growth Home") input[type="checkbox"], input[type="checkbox"]').nth(0);
    this.twoBedGrowthCheckbox           = this.section8.locator('label:has-text("2 Bed Growth Home") input[type="checkbox"], input[type="checkbox"]').nth(1);
    this.twoBedRiseCheckbox             = this.section8.locator('label:has-text("2 Bed Rise Home") input[type="checkbox"], input[type="checkbox"]').nth(2);
    this.oneBedCountSelect              = this.section8.locator('select, .ant-select').nth(0);
    this.twoBedGrowthCountSelect        = this.section8.locator('select, .ant-select').nth(1);
    this.twoBedRiseCountSelect          = this.section8.locator('select, .ant-select').nth(2);
    this.section8SubmitButton           = this.section8.locator('button:has-text("Submit")').first();
    // [BUG-REF: BUG-CFG-001] '2 Bed Peak Home' is server-side force-disabled
    this.twoBedPeakHomeCheckbox         = this.section8.locator('label:has-text("2 Bed Peak Home") input[type="checkbox"]');

    // ── Section 9 — Max Preferences Per Unit ──────────────────────────────
    this.section9                       = this._sectionBlock(SECTION_HEADINGS.maxPreferencesPerUnit);
    this.maxPreferencesSelect           = this.section9.locator('select, .ant-select, [role="combobox"]').first();
    this.maxPreferencesUpdateButton     = this.section9.locator('button:has-text("Update")').first();

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
  _sectionBlock(headingText) {
    const safe = headingText.replace(/"/g, '\\"');
    return this.page.locator(
      `section:has(:text("${safe}")), div.section:has(:text("${safe}")), div:has(> h2:text("${safe}")), div:has(> h3:text("${safe}"))`
    ).first();
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
    const heading = SECTION_HEADINGS[name];
    if (!heading) throw new Error(`Unknown Config section: ${name}`);
    const block = this[`section${this._sectionIndex(name)}`];
    await block.scrollIntoViewIfNeeded().catch(() => {});
    return block;
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
