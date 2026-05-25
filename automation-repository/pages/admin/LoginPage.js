'use strict';

// automation-repository/pages/admin/LoginPage.js
const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/admin/locator-map.json');

const L = locatorMap.login;

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.mobileInput   = page.locator(L.mobileInput.selector);
    this.sendOtpBtn    = page.locator(L.sendOtpBtn.selector);
    this.otpBox1       = page.locator(L.otpBox1.selector);
    this.otpBox2       = page.locator(L.otpBox2.selector);
    this.otpBox3       = page.locator(L.otpBox3.selector);
    this.otpBox4       = page.locator(L.otpBox4.selector);
    this.otpBox5       = page.locator(L.otpBox5.selector);
    this.otpBox6       = page.locator(L.otpBox6.selector);
    this.submitOtpBtn  = page.locator(L.submitOtpBtn.selector);
    this.backBtn       = page.locator(L.backBtn.selector);
    this.resendOtpLink = page.locator(L.resendOtpLink.selector);
    this.otpTimer      = page.locator(L.otpTimer.selector);
    this.pageHeading   = page.locator(L.pageHeading.selector);
    this.otpHeading    = page.locator(L.otpHeading.selector);
  }

  async navigate() {
    await this.page.goto('https://uat-web.xrportal.in/admin');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async enterMobile(mobile) {
    await this.fill(this.mobileInput, mobile);
  }

  async clickSendOtp() {
    await this.click(this.sendOtpBtn);
    await this.otpBox1.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async enterOtp(otp) {
    const digits = otp.toString().split('');
    const boxes = [this.otpBox1, this.otpBox2, this.otpBox3,
                   this.otpBox4, this.otpBox5, this.otpBox6];
    for (let i = 0; i < digits.length; i++) {
      await boxes[i].fill(digits[i]);
    }
  }

  async clickSubmitOtp() {
    await this.click(this.submitOtpBtn);
  }

  async loginWithOtp(mobile, otp) {
    await this.enterMobile(mobile);
    await this.clickSendOtp();
    await this.enterOtp(otp);
    await this.clickSubmitOtp();
  }

  async expectOnMobileScreen() {
    await this.expectVisible(this.mobileInput);
    await this.expectVisible(this.sendOtpBtn);
  }

  async expectOnOtpScreen() {
    await this.expectVisible(this.otpBox1);
    await this.expectVisible(this.submitOtpBtn);
  }

  async expectLoginSuccess() {
    await this.page.waitForURL(/\/admin\/customers/, { timeout: 15_000 });
  }

  async expectOtpError() {
    await this.page.waitForSelector('[class*="error"], [role="alert"]', { timeout: 5_000 });
  }
}

module.exports = { LoginPage };
