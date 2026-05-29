'use strict';

/**
 * LoginPage.js — Page Object Model for sales-manager / login.
 *
 * Selectors sourced from locators/sales-manager/locator-map.json (module key: "login").
 * Two roles: SM Admin (roleId=4) and SM (roleId=5). The login UI exposes both via
 * the roleInput / roleInput2 radio inputs — the API trusts the chosen role for
 * the (phone, roleId) lookup, so the chosen tab must match the registered role.
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/sales-manager/locator-map.json');

const L = locatorMap['login'] || {};

const LOGIN_URL = 'https://uat-web.xrportal.in/sales-manager';
const SUCCESS_URL = /\/sales-manager\/(callback-requests|towers|physical-allocation)/;

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = LOGIN_URL;
    this.successUrlPattern = SUCCESS_URL;

    // Element locators (sourced from locator-map.json)
    this.sendOtpBtn              = page.locator(L['sendOTPButton'] && L['sendOTPButton'].selector);
    this.mobileInput             = page.locator(L['enterMobileNumberInput'] && L['enterMobileNumberInput'].selector);
    this.roleInput               = page.locator(L['roleInput'] && L['roleInput'].selector);
    this.roleInput2              = page.locator(L['roleInput2'] && L['roleInput2'].selector);
    this.pageHeading             = page.locator(L['sALESMANAGERLOGINHeading'] && L['sALESMANAGERLOGINHeading'].selector);

    // OTP boxes — segmented inputs by aria-label (matches Admin portal pattern)
    this.otpBox1 = page.locator('input[aria-label="OTP Input 1"]');
    this.otpBox2 = page.locator('input[aria-label="OTP Input 2"]');
    this.otpBox3 = page.locator('input[aria-label="OTP Input 3"]');
    this.otpBox4 = page.locator('input[aria-label="OTP Input 4"]');
    this.otpBox5 = page.locator('input[aria-label="OTP Input 5"]');
    this.otpBox6 = page.locator('input[aria-label="OTP Input 6"]');

    // Generic verify/submit button on OTP screen (fallback hierarchy)
    this.submitOtpBtn = page.locator('button:has-text("Verify OTP"), button:has-text("Verify"), button:has-text("Submit")').first();
    this.resendOtpLink = page.locator('a:has-text("Resend"), button:has-text("Resend"), :text("Resend OTP")').first();
    this.otpTimer = page.locator('[class*="timer"], [class*="countdown"], :text-matches("\\d{1,2}:\\d{2}")').first();
    this.backBtn = page.locator('button:has-text("Back"), [aria-label*="back" i]').first();
    this.errorMessage = page.locator('[class*="error"], [role="alert"], [class*="Error"]').first();
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // ── Role selection ───────────────────────────────────────────────────────

  /**
   * Selects role for SM portal login.
   * @param {'sm'|'sm-admin'} role — defaults to 'sm'
   */
  async selectRole(role = 'sm') {
    const target = role === 'sm-admin' ? this.roleInput : this.roleInput2;
    const altTarget = role === 'sm-admin' ? this.roleInput2 : this.roleInput;
    if (await target.isVisible().catch(() => false)) {
      await target.click().catch(async () => {
        await altTarget.click().catch(() => {});
      });
    }
  }

  // ── Mobile + Send OTP ────────────────────────────────────────────────────

  async enterMobile(mobile) {
    await this.mobileInput.fill(String(mobile));
  }

  async clickSendOtp() {
    await this.sendOtpBtn.click();
    // Wait either for OTP screen or an error response — bounded
    await this.otpBox1.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  // ── OTP entry + submit ───────────────────────────────────────────────────

  async enterOtp(otp) {
    const digits = String(otp).split('');
    const boxes = [this.otpBox1, this.otpBox2, this.otpBox3,
                   this.otpBox4, this.otpBox5, this.otpBox6];
    for (let i = 0; i < digits.length && i < boxes.length; i++) {
      await boxes[i].fill(digits[i]);
    }
  }

  async clickVerifyOtp() {
    await this.submitOtpBtn.click();
  }

  // Alias for parity with Admin POM
  async clickSubmitOtp() {
    return this.clickVerifyOtp();
  }

  // ── Composite flows ──────────────────────────────────────────────────────

  /**
   * Full happy-path: mobile → Send OTP → OTP digits → Verify.
   * Does not assert success — call expectLoginSuccess() after.
   */
  async loginWithOtp(mobile, otp) {
    await this.enterMobile(mobile);
    await this.clickSendOtp();
    await this.enterOtp(otp);
    await this.clickVerifyOtp();
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async expectOnMobileScreen() {
    await this.expectVisible(this.mobileInput);
    await this.expectVisible(this.sendOtpBtn);
  }

  async expectOnOtpScreen() {
    await this.expectVisible(this.otpBox1);
    await this.expectVisible(this.otpBox6);
  }

  async expectLoginSuccess() {
    await this.page.waitForURL(this.successUrlPattern, { timeout: 15_000 });
  }

  async expectOtpError() {
    await this.page.waitForSelector('[class*="error"], [role="alert"], [class*="Error"]', { timeout: 5_000 });
  }
}

module.exports = { LoginPage };
