'use strict';

// automation-repository/pages/cp/JbpSubmissionPage.js
// CP Portal — JBP (Joint Business Plan) Submission
// Route: https://uat-web.xrportal.in/jbp
const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['jbp-submission'];

class JbpSubmissionPage extends BasePage {
  constructor(page) {
    super(page);
    // Locators from locators/channel-partner/locator-map.json — jbp-submission section
    this.jbpDashboardHeading = page.locator(L.jBPDashboardHeading.selector);
    this.logoutButton        = page.locator(L.logoutButton.selector).first();

    // Sidebar nav
    this.homeLink  = page.locator(L.homeLink.selector);
    this.kycLink   = page.locator(L.kYCLink.selector);
    this.jbpLink   = page.locator(L.jBPLink.selector);
    this.leadsLink = page.locator(L.leadsLink.selector);

    // Tabs
    this.currentCycleTab = page.locator(L.rcTabs0Tab1.selector);
    this.historyTab      = page.locator(L.rcTabs0Tab2.selector);
    this.editRequestsTab = page.locator(L.rcTabs0Tab3.selector);

    // Form CTAs — text-based per INDEX.md
    this.addNewJbpEntryBtn = page.getByRole('button', { name: /add new jbp entry/i });
    this.submitBtn         = page.getByRole('button', { name: /^submit$/i });
    this.backToDashboardBtn = page.getByRole('button', { name: /back to dashboard/i });
    this.jbpFormHeading    = page.getByRole('heading', { name: /jbp form/i, level: 2 });
    this.enterCountInput   = page.locator('input[placeholder="Enter Count"]');
    this.brokerageSelect   = page.locator('input[placeholder="Select Brokerage"]');
  }

  async navigate() {
    await this.page.goto('https://uat-web.xrportal.in/jbp');
    await this.page.waitForLoadState('networkidle');
  }

  async openCurrentCycleTab() {
    await this.currentCycleTab.click();
  }

  async openHistoryTab() {
    await this.historyTab.click();
  }

  async openEditRequestsTab() {
    await this.editRequestsTab.click();
  }

  async clickAddNewJbpEntry() {
    await this.addNewJbpEntryBtn.click();
    await this.jbpFormHeading.waitFor({ state: 'visible', timeout: 10_000 });
  }
}

module.exports = { JbpSubmissionPage };
