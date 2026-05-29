'use strict';

/**
 * LoginPage.js — Page Object Model for channel-partner / login.
 *
 * Selectors sourced from locators/channel-partner/locator-map.json (module key: "login").
 * BRD Reference: CP-FS-Login.md  ·  CP-BRD-CP-Portal.md
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['login'] || {};

const LOGIN_URL = 'https://uat-web.xrportal.in/login';

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.L   = L;
    this.url = LOGIN_URL;

    // ── Element locators (sourced from locator-map.json `login` module) ──────
    this.sendOTPButton             = page.locator(L['sendOTPButton']             && L['sendOTPButton'].selector);
    this.termsConditionsLink       = page.locator(L['termsConditionsLink']       && L['termsConditionsLink'].selector);
    this.privacyPolicyLink         = page.locator(L['privacyPolicyLink']         && L['privacyPolicyLink'].selector);
    this.enterMobileNumberInput    = page.locator(L['enterMobileNumberInput']    && L['enterMobileNumberInput'].selector);
    this.gROWTHPARTNERLOGINHeading = page.locator(L['gROWTHPARTNERLOGINHeading'] && L['gROWTHPARTNERLOGINHeading'].selector);

    // ── Generic OTP locators (CP login renders 6 individual boxes after Send OTP) ─
    // The locator-map.json `login` module does not enumerate OTP boxes today —
    // use the same DOM contract as auth.setup.js fallback selectors.
    this.otpBoxes      = page.locator(
      'input[autocomplete="one-time-code"], input[type="text"][maxlength="1"], input[aria-label*="otp" i]'
    );
    this.otpBox1       = this.otpBoxes.nth(0);
    this.otpBox2       = this.otpBoxes.nth(1);
    this.otpBox3       = this.otpBoxes.nth(2);
    this.otpBox4       = this.otpBoxes.nth(3);
    this.otpBox5       = this.otpBoxes.nth(4);
    this.otpBox6       = this.otpBoxes.nth(5);

    this.verifyOtpButton = page.getByRole('button', { name: /verify|login|submit/i }).first();
    this.resendOtpLink   = page.locator('button:has-text("Resend"), a:has-text("Resend"), :text-matches("re-?send", "i")').first();
    this.otpTimer        = page.locator('[class*="timer"], [class*="countdown"], :text-matches("\\d{1,2}:\\d{2}", "i")').first();
    this.errorAlert      = page.locator('[class*="error"], [role="alert"], [class*="Toastify__toast--error"]').first();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // ── Atomic actions ────────────────────────────────────────────────────────

  async enterMobile(mobile) {
    await this.fill(this.enterMobileNumberInput, mobile);
  }

  async clickSendOtp() {
    await this.click(this.sendOTPButton);
    // Wait for OTP screen transition — first OTP box becomes visible
    await this.otpBox1.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  async enterOtp(otp) {
    const digits = otp.toString().split('');
    for (let i = 0; i < digits.length && i < 6; i++) {
      await this.otpBoxes.nth(i).fill(digits[i]);
    }
  }

  async clickVerify() {
    await this.click(this.verifyOtpButton);
  }

  async loginWithOtp(mobile, otp) {
    await this.enterMobile(mobile);
    await this.clickSendOtp();
    await this.enterOtp(otp);
    await this.clickVerify();
  }

  // ── Assertion helpers ─────────────────────────────────────────────────────

  async expectOnMobileScreen() {
    await this.expectVisible(this.enterMobileNumberInput);
    await this.expectVisible(this.sendOTPButton);
  }

  async expectOnOtpScreen() {
    await this.otpBox1.waitFor({ state: 'visible', timeout: 10_000 });
    await this.expectVisible(this.verifyOtpButton);
  }

  async expectLoginSuccess() {
    // CP-FS-Login §5 — verify-OTP terminal branch redirects to /dashboard or /leads.
    await this.page.waitForURL(/\/(dashboard|leads|home)/, { timeout: 20_000 });
  }

  async expectProfileCompletionRedirect() {
    // BR-CP-LOG-12 / c — isCpRegistrationCompleted=false → RegisterCp screen.
    await this.page.waitForURL(/\/(register-?cp|registration|complete-profile|kyc)/i, { timeout: 20_000 });
  }

  async expectOtpError() {
    await this.errorAlert.waitFor({ state: 'visible', timeout: 8_000 });
  }
}

module.exports = { LoginPage };
