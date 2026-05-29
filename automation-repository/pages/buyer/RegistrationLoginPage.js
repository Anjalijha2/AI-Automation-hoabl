'use strict';

/**
 * RegistrationLoginPage.js — Page Object Model for buyer / registration-login.
 *
 * Selectors sourced from locators/buyer/locator-map.json (module key: "registration-login").
 *
 * BRD/FRD: BUYER-FS-Registration-and-Login
 *   - Nationality selector: Indian National / NRI radio tabs (rcTabs0Tab1 / rcTabs0Tab2)
 *   - Mobile entry → Send OTP → 6-digit OTP entry → Verify
 *   - UAT static OTP: 147258 (master OTP — auth.controller.js:725-731)
 *   - First-login T&C consent gate (isConsented=null → modal; =1 → bypass)
 */

const { BasePage } = require('../../base/BasePage');
const locatorMap   = require('../../../locators/buyer/locator-map.json');

const L = locatorMap['registration-login'] || {};

const REGISTRATIONLOGIN_URL = 'https://uat.xrportal.in/';

class RegistrationLoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = REGISTRATIONLOGIN_URL;

    // ── Element locators (from locator-map.json) ─────────────────────────────
    this.previousSlide          = page.locator(L['previousSlide'] && L['previousSlide'].selector);
    this.nextSlide              = page.locator(L['nextSlide'] && L['nextSlide'].selector);
    this.sendOTPButton          = page.locator(L['sendOTPButton'] && L['sendOTPButton'].selector);
    this.termsConditionsLink    = page.locator(L['termsConditionsLink'] && L['termsConditionsLink'].selector);
    this.privacyPolicyLink      = page.locator(L['privacyPolicyLink'] && L['privacyPolicyLink'].selector);
    this.enterMobileNumberInput = page.locator(L['enterMobileNumberInput'] && L['enterMobileNumberInput'].selector);
    this.rcTabs0Tab1            = page.locator(L['rcTabs0Tab1'] && L['rcTabs0Tab1'].selector);  // Indian National
    this.rcTabs0Tab2            = page.locator(L['rcTabs0Tab2'] && L['rcTabs0Tab2'].selector);  // NRI
    this.aPPLICANTLOGINHeading  = page.locator(L['aPPLICANTLOGINHeading'] && L['aPPLICANTLOGINHeading'].selector);

    // ── Derived / dynamic locators (not in locator-map but stable) ───────────
    // OTP inputs render after Send OTP — buyer portal uses 6 OTP boxes
    this.otpBox1     = page.locator('input[aria-label="OTP Input 1"], input[name="otp-0"]').first();
    this.otpBox2     = page.locator('input[aria-label="OTP Input 2"], input[name="otp-1"]').first();
    this.otpBox3     = page.locator('input[aria-label="OTP Input 3"], input[name="otp-2"]').first();
    this.otpBox4     = page.locator('input[aria-label="OTP Input 4"], input[name="otp-3"]').first();
    this.otpBox5     = page.locator('input[aria-label="OTP Input 5"], input[name="otp-4"]').first();
    this.otpBox6     = page.locator('input[aria-label="OTP Input 6"], input[name="otp-5"]').first();
    this.verifyOtpBtn   = page.locator('button:has-text("Verify"), button:has-text("Verify OTP"), button:has-text("Login")').first();
    this.resendOtpLink  = page.locator('button:has-text("Resend"), a:has-text("Resend")').first();
    this.otpTimer       = page.locator('[class*="timer"], [class*="countdown"]').first();
    this.editNumberBtn  = page.locator('button:has-text("Edit"), a:has-text("Edit"), [aria-label*="back" i]').first();
    this.countryCodeSelector = page.locator('[class*="country-code"], select[name*="country" i], [class*="ant-select"]').first();

    // First-login T&C consent
    this.tncModal       = page.locator('[role="dialog"], [class*="modal"]').filter({ hasText: /terms|consent|agree/i }).first();
    this.tncAgreeCheckbox = page.locator('input[type="checkbox"]').filter({ has: page.locator('..') }).first();
    this.tncProceedBtn  = page.locator('button:has-text("Proceed"), button:has-text("Continue"), button:has-text("Accept")').first();
    this.tncDisagreeBtn = page.locator('button:has-text("Disagree"), button:has-text("Decline"), button:has-text("Cancel")').first();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // ── Nationality selection ──────────────────────────────────────────────────

  /**
   * @param {'indian'|'nri'} type
   */
  async selectNationality(type) {
    if (type === 'nri') {
      await this.click(this.rcTabs0Tab2);
    } else {
      await this.click(this.rcTabs0Tab1);
    }
  }

  // ── Mobile entry ───────────────────────────────────────────────────────────

  async enterMobile(mobile) {
    await this.fill(this.enterMobileNumberInput, mobile);
  }

  async clickSendOtp() {
    await this.click(this.sendOTPButton);
    // Wait for OTP screen to render — first OTP box visible
    await this.otpBox1.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  // ── OTP entry ──────────────────────────────────────────────────────────────

  async enterOtp(otp) {
    const digits = otp.toString().split('');
    const boxes = [this.otpBox1, this.otpBox2, this.otpBox3,
                   this.otpBox4, this.otpBox5, this.otpBox6];
    for (let i = 0; i < digits.length; i++) {
      await boxes[i].fill(digits[i]);
    }
  }

  async clickVerify() {
    await this.click(this.verifyOtpBtn);
  }

  async loginWithOtp(mobile, otp, nationality = 'indian') {
    await this.selectNationality(nationality);
    await this.enterMobile(mobile);
    await this.clickSendOtp();
    await this.enterOtp(otp);
    await this.clickVerify();
  }

  // ── First-login T&C consent ────────────────────────────────────────────────

  async expectFirstLoginConsent() {
    await this.tncModal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async acceptTncAndContinue() {
    // Tick checkbox if present
    const cbVisible = await this.tncAgreeCheckbox.isVisible().catch(() => false);
    if (cbVisible) {
      await this.tncAgreeCheckbox.check().catch(() => {});
    }
    await this.click(this.tncProceedBtn);
  }

  // ── Assertions / screen expectations ───────────────────────────────────────

  async expectOnMobileScreen() {
    await this.expectVisible(this.enterMobileNumberInput);
    await this.expectVisible(this.sendOTPButton);
  }

  async expectOnOtpScreen() {
    await this.expectVisible(this.otpBox1);
    await this.expectVisible(this.verifyOtpBtn);
  }

  async expectLoginSuccess() {
    await this.page.waitForURL(/\/home/, { timeout: 20_000 });
  }

  async expectOtpError() {
    await this.page.waitForSelector('[class*="error"], [role="alert"], [class*="ant-message-error"]', { timeout: 5_000 });
  }

  async expectNationalityTabActive(type) {
    const tab = type === 'nri' ? this.rcTabs0Tab2 : this.rcTabs0Tab1;
    const state = await tab.getAttribute('aria-selected').catch(() => null);
    return state === 'true';
  }
}

module.exports = { RegistrationLoginPage };
