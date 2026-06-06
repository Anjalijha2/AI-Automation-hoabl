'use strict';

// automation-repository/pages/cp/LeadsManagementPage.js
// CP Portal — Leads Management
// Route: https://uat-web.xrportal.in/leads
const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['leads-management'];

class LeadsManagementPage extends BasePage {
  constructor(page) {
    super(page);
    // Locators from locators/channel-partner/locator-map.json — leads-management section
    this.leadsHeading        = page.locator(L.leadsHeading.selector);
    this.logoutButton        = page.locator(L.logoutButton.selector).first();
    this.searchCustomerInput = page.locator(L.searchCustomerInput.selector);

    // Sidebar nav
    this.homeLink  = page.locator(L.homeLink.selector);
    this.kycLink   = page.locator(L.kYCLink.selector);
    this.jbpLink   = page.locator(L.jBPLink.selector);
    this.leadsLink = page.locator(L.leadsLink.selector);

    // Filters — three ant-selects on /leads
    this.teamLeadsSelect = page.locator(L.rcSelect0.selector);
    this.statusSelect    = page.locator(L.rcSelect1.selector);
    this.pageSizeSelect  = page.locator(L.rcSelect2.selector);

    // Row action icons — role-based per INDEX.md (DOM-verified <title>)
    this.resendNotificationBtn = page.locator(L.resendNotificationButton.selector).first();
    this.copyLinkBtn           = page.locator(L.copyLinkButton.selector).first();
  }

  async navigate() {
    await this.page.goto('https://uat-web.xrportal.in/leads');
    await this.page.waitForLoadState('networkidle');
  }

  async searchLead(query) {
    await this.searchCustomerInput.fill(query);
    // Debounce window per INDEX.md
    await this.page.waitForTimeout(2500); // documented debounce per visual-memory INDEX.md
  }

  async openStatusDropdown() {
    await this.statusSelect.click();
  }

  async openTeamLeadsDropdown() {
    await this.teamLeadsSelect.click();
  }

  async clickResendNotificationFirstRow() {
    await this.resendNotificationBtn.click();
  }

  async clickCopyLinkFirstRow() {
    await this.copyLinkBtn.click();
  }
}

module.exports = { LeadsManagementPage };
