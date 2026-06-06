'use strict';

// automation-repository/pages/cp/LoginPage.js
// CP Portal Login POM — Mobile + OTP entry (6 boxes)
const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap.login;

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // Locators from locators/channel-partner/locator-map.json — login section
    this.pageHeading        = page.locator(L.gROWTHPARTNERLOGINHeading.selector);
    this.mobileInput        = page.locator(L.enterMobileNumberInput.selector);
    this.sendOtpBtn         = page.locator(L.sendOTPButton.selector);
    this.termsLink          = page.locator(L.termsConditionsLink.selector);
    this.privacyPolicyLink  = page.locator(L.privacyPolicyLink.selector);

    // OTP screen — role-based as documented in visual-memory INDEX.md
    this.otpGroup    = page.getByRole('group');
    this.otpInputs   = page.getByRole('textbox', { name: /otp input [1-6]/i });
    this.submitOtpBtn = page.getByRole('button', { name: /submit otp/i });
    this.resendOtpBtn = page.getByRole('button', { name: /re-send otp/i });
    this.otpHeading  = page.getByRole('heading', { name: /^enter otp$/i, level: 2 });
  }

  async navigate() {
    await this.page.goto('https://uat-web.xrportal.in/');
    await this.page.waitForLoadState('networkidle');
  }

  async enterMobile(mobile) {
    await this.mobileInput.fill(String(mobile));
  }

  async clickSendOtp() {
    await this.sendOtpBtn.click();
  }

  async enterOtp(otp) {
    const digits = String(otp).split('');
    const inputs = await this.otpInputs.all();
    for (let i = 0; i < digits.length && i < inputs.length; i++) {
      await inputs[i].fill(digits[i]);
    }
  }

  async clickSubmitOtp() {
    await this.submitOtpBtn.click();
  }

  async loginWithOtp(mobile, otp) {
    await this.enterMobile(mobile);
    await this.clickSendOtp();
    await this.otpInputs.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.enterOtp(otp);
    await this.clickSubmitOtp();
  }

  async expectLoginSuccess() {
    await this.page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  }
}

module.exports = { LoginPage };
