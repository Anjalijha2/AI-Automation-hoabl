'use strict';

// automation-repository/pages/cp/KycAssistancePage.js
// CP Portal — KYC Assistance (CP self-KYC onboarding)
// Route: https://uat-web.xrportal.in/kyc
// Locator source of truth: locators/channel-partner/locator-map.json (kyc-assistance section)
//
// NOTE on file-upload locators: locator-map.json does not currently expose
// distinct keys for PAN Card / GST / MAHA RERA Certificate file inputs.
// Because the locator map is OWNED by Tech Lead Agent (read-only here),
// upload locators are resolved inside the POM via Ant Design form-item
// label text (`.ant-form-item` filtered by label) → hidden `input[type=file]`.
// Specs must NEVER inline these selectors; always go through the POM methods
// below (uploadPanCard / uploadGst / uploadMahaRera). When the locator map is
// updated with explicit upload keys, swap the body of those methods to use
// L.<key>.selector — no spec changes required.

const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['kyc-assistance'];

class KycAssistancePage extends BasePage {
  constructor(page) {
    super(page);

    // ── Header / chrome ────────────────────────────────────────────────────
    this.kycHeading      = page.locator(L.kYCHeading.selector);
    this.logoutButton    = page.locator(L.logoutButton.selector).first();
    this.cancelButton    = page.locator(L.cancelButton.selector);
    this.submitButton    = page.locator(L.submitButton.selector);

    // ── Sidebar nav ────────────────────────────────────────────────────────
    this.homeLink  = page.locator(L.homeLink.selector);
    this.kycLink   = page.locator(L.kYCLink.selector);
    this.jbpLink   = page.locator(L.jBPLink.selector);
    this.leadsLink = page.locator(L.leadsLink.selector);

    // ── Firm Details ───────────────────────────────────────────────────────
    // Two distinct "Enter Name" inputs render: Firm Name (1st) + Owner Name (2nd)
    this.firmNameInput     = page.locator(L.enterNameInput.selector).first();
    this.firmAddressInput  = page.locator(L.enterFullAddressInput.selector);

    // ── Contact Details ────────────────────────────────────────────────────
    this.ownerNameInput    = page.locator(L.enterNameInput2.selector).nth(1);
    this.emailInput        = page.locator(L.enterEmailIDInput.selector);
    this.phoneInput        = page.locator(L.enterMobileNumberInput.selector);

    // ── Additional Details ─────────────────────────────────────────────────
    this.pinCodeInput      = page.locator(L.enterPinCodeInput.selector);
    this.panInput          = page.locator(L.enterPANNumberInput.selector);
    this.reraInput         = page.locator(L.enterRERANumberInput.selector);
    this.businessRegionSelect = page.locator(L.rcSelect0.selector);

    // ── KYC Document Upload (3 docs) ───────────────────────────────────────
    // Section header — derived (not in locator map; documented limitation above)
    this.documentsHeading = page.getByText(/^KYC Document Upload$/i).first();
    // Hidden file inputs scoped per ant-form-item by label
    this.panCardFileInput  = page.locator('.ant-form-item', { hasText: /^PAN Card$/i })
                                 .locator('input[type="file"]');
    this.gstFileInput      = page.locator('.ant-form-item', { hasText: /^GST$/i })
                                 .locator('input[type="file"]');
    this.mahaReraFileInput = page.locator('.ant-form-item', { hasText: /MAHA RERA Certificate/i })
                                 .locator('input[type="file"]');

    // ── Section headers (for UI/UX rendering checks) ───────────────────────
    this.firmDetailsHeader       = page.getByText(/^Firm Details$/i).first();
    this.contactDetailsHeader    = page.getByText(/^Contact Details$/i).first();
    this.additionalDetailsHeader = page.getByText(/^Additional Details$/i).first();
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  async navigate() {
    await this.page.goto('https://uat-web.xrportal.in/kyc');
    await this.page.waitForLoadState('networkidle');
  }

  // ── Form fillers (atomic; one logical action each) ──────────────────────
  async fillFirmName(value)     { await this.fill(this.firmNameInput,    value); }
  async fillFirmAddress(value)  { await this.fill(this.firmAddressInput, value); }
  async fillOwnerName(value)    { await this.fill(this.ownerNameInput,   value); }
  async fillEmail(value)        { await this.fill(this.emailInput,       value); }
  async fillPhone(value)        { await this.fill(this.phoneInput,       value); }
  async fillPinCode(value)      { await this.fill(this.pinCodeInput,     value); }
  async fillPan(value)          { await this.fill(this.panInput,         value); }
  async fillRera(value)         { await this.fill(this.reraInput,        value); }

  // ── Business Region dropdown ────────────────────────────────────────────
  async openBusinessRegion() {
    await this.click(this.businessRegionSelect);
    // Wait for dropdown panel to render (ant-design portal)
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first()
      .waitFor({ state: 'visible' });
  }

  async selectBusinessRegionMMR() {
    await this.openBusinessRegion();
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^MMR$/ }).first().click();
  }

  async selectBusinessRegionPune() {
    await this.openBusinessRegion();
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^Pune$/ }).first().click();
  }

  async selectBusinessRegionBGLR() {
    await this.openBusinessRegion();
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^BGLR$/ }).first().click();
  }

  async getBusinessRegionOptions() {
    await this.openBusinessRegion();
    return this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .allTextContents();
  }

  // ── Document uploads (3 docs) ───────────────────────────────────────────
  async uploadPanCard(filePath)  { await this.panCardFileInput.setInputFiles(filePath); }
  async uploadGst(filePath)      { await this.gstFileInput.setInputFiles(filePath); }
  async uploadMahaRera(filePath) { await this.mahaReraFileInput.setInputFiles(filePath); }

  // ── Submit / Cancel helpers ─────────────────────────────────────────────
  async isSubmitDisabled() {
    return this.submitButton.isDisabled();
  }

  async clickSubmit() {
    await this.click(this.submitButton);
  }

  async submit() {
    await this.clickSubmit();
  }

  async clickCancel() {
    await this.click(this.cancelButton);
  }

  // ── Composite: fill all 8 required text fields (Business Region as MMR) ──
  async fillAllRequired({
    firmName     = 'GP test name',
    firmAddress  = '101 Test Street, Mumbai',
    ownerName    = 'Test CP',
    email        = 'testcp@gmail.com',
    phone        = '8888888888',
    pinCode      = '400056',
    pan          = 'TTTTT7777Y',
    region       = 'MMR',
  } = {}) {
    await this.fillFirmName(firmName);
    await this.fillFirmAddress(firmAddress);
    await this.fillOwnerName(ownerName);
    await this.fillEmail(email);
    await this.fillPhone(phone);
    await this.fillPinCode(pinCode);
    await this.fillPan(pan);
    if (region === 'MMR')  await this.selectBusinessRegionMMR();
    if (region === 'Pune') await this.selectBusinessRegionPune();
    if (region === 'BGLR') await this.selectBusinessRegionBGLR();
  }
}

module.exports = { KycAssistancePage };
