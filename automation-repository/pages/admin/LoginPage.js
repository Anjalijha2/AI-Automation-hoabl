// automation-repository/pages/admin/LoginPage.js
const { BasePage } = require('../../base/BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // --- Locators ---
    this.mobileInput    = page.locator('input[placeholder*="Mobile"], input[type="tel"]');
    this.otpInput       = page.locator('input[placeholder*="OTP"], input[placeholder*="otp"]');
    this.sendOtpButton  = page.getByRole('button', { name: /send otp/i });
    this.loginButton    = page.getByRole('button', { name: /login|verify/i });
    this.errorMessage   = page.getByRole('alert');
  }

  // --- Actions ---
  async navigate() {
    await this.goto('/');
  }

  async enterMobile(mobile) {
    await this.fill(this.mobileInput, mobile);
  }

  async requestOTP() {
    await this.click(this.sendOtpButton);
  }

  async enterOTP(otp) {
    await this.fill(this.otpInput, otp);
  }

  async submitLogin() {
    await this.click(this.loginButton);
  }

  async loginWithOTP(mobile, otp) {
    await this.enterMobile(mobile);
    await this.requestOTP();
    await this.enterOTP(otp);
    await this.submitLogin();
  }

  // --- Assertions ---
  async expectErrorMessage() {
    await this.errorMessage.waitFor({ state: 'visible' });
    return this.errorMessage.textContent();
  }

  async expectLoginSuccess() {
    await this.expectURL(/customers|dashboard/);
  }
}

module.exports = { LoginPage };
