'use strict';

// automation-repository/pages/cp/KycAssistancePage.js
// CP Portal — KYC Assistance (CP self-KYC onboarding)
// Route: https://uat-web.xrportal.in/kyc
const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['kyc-assistance'];

class KycAssistancePage extends BasePage {
  constructor(page) {
    super(page);
    // Locators from locators/channel-partner/locator-map.json — kyc-assistance section
    this.kycHeading      = page.locator(L.kYCHeading.selector);
    this.logoutButton    = page.locator(L.logoutButton.selector).first();
    this.cancelButton    = page.locator(L.cancelButton.selector);
    this.submitButton    = page.locator(L.submitButton.selector);

    // Sidebar nav
    this.homeLink  = page.locator(L.homeLink.selector);
    this.kycLink   = page.locator(L.kYCLink.selector);
    this.jbpLink   = page.locator(L.jBPLink.selector);
    this.leadsLink = page.locator(L.leadsLink.selector);

    // Form inputs — pre-filled from CP registration
    this.firmNameInput     = page.locator(L.enterNameInput.selector).first();
    this.firmAddressInput  = page.locator(L.enterFullAddressInput.selector);
    this.ownerNameInput    = page.locator(L.enterNameInput2.selector).nth(1);
    this.emailInput        = page.locator(L.enterEmailIDInput.selector);
    this.phoneInput        = page.locator(L.enterMobileNumberInput.selector);
    this.pinCodeInput      = page.locator(L.enterPinCodeInput.selector);
    this.panInput          = page.locator(L.enterPANNumberInput.selector);
    this.reraInput         = page.locator(L.enterRERANumberInput.selector);
    this.businessRegionSelect = page.locator(L.rcSelect0.selector);
  }

  async navigate() {
    await this.page.goto('https://uat-web.xrportal.in/kyc');
    await this.page.waitForLoadState('networkidle');
  }

  async fillFirmName(value) {
    await this.firmNameInput.fill(value);
  }

  async submit() {
    await this.submitButton.click();
  }
}

module.exports = { KycAssistancePage };
