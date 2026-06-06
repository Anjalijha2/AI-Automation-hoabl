'use strict';

// automation-repository/pages/cp/CustomerRegistrationPage.js
// CP Portal — Home Dashboard / Customer Registration module
// Route: https://uat-web.xrportal.in/dashboard
const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['customer-registration'];

class CustomerRegistrationPage extends BasePage {
  constructor(page) {
    super(page);
    // Locators from locators/channel-partner/locator-map.json — customer-registration section
    this.welcomeHeading      = page.locator(L.welcomeGPTestNameHeading.selector);
    this.customersHeading    = page.locator(L.customersHeading.selector);
    this.logoutButton        = page.locator(L.logoutButton.selector).first();
    this.copyLinkButton      = page.locator(L.copyLinkButton.selector).first();
    this.downloadQrCodeBtn   = page.locator(L.downloadQRCodeButton.selector);
    this.createLeadButton    = page.locator(L.createLeadButton.selector);
    this.mobileInput         = page.locator(L.enterMobileNumberInput.selector);
    this.searchCustomerInput = page.locator(L.searchCustomerInput.selector);
    this.teamLeadsSelect     = page.locator(L.rcSelect0.selector);
    this.pageSizeSelect      = page.locator(L.rcSelect1.selector);

    // Sidebar nav
    this.homeLink  = page.locator(L.homeLink.selector);
    this.kycLink   = page.locator(L.kYCLink.selector);
    this.jbpLink   = page.locator(L.jBPLink.selector);
    this.leadsLink = page.locator(L.leadsLink.selector);

    // Radio group — Indian National / NRI — role-based per INDEX.md
    this.indianNationalRadio = page.locator('input[type="radio"][value="Indian National"]');
    this.nriRadio            = page.locator('input[type="radio"][value="NRI"]');
  }

  async navigate() {
    await this.page.goto('https://uat-web.xrportal.in/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async searchCustomer(query) {
    await this.searchCustomerInput.fill(query);
    // Debounce ~500-1000ms per INDEX.md — wait ~2.5s for stable result
    await this.page.waitForTimeout(2500); // documented debounce per visual-memory INDEX.md
  }

  async selectIndianNational() {
    await this.indianNationalRadio.click();
  }

  async selectNri() {
    await this.nriRadio.click();
  }

  async fillLeadMobile(mobile) {
    await this.mobileInput.fill(String(mobile));
  }

  async submitCreateLead() {
    await this.createLeadButton.click();
  }
}

module.exports = { CustomerRegistrationPage };
