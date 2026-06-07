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
    this.otpBoxes      = [this.otpBox1, this.otpBox2, this.otpBox3,
                          this.otpBox4, this.otpBox5, this.otpBox6];
    this.submitOtpBtn  = page.locator(L.submitOtpBtn.selector);
    this.backBtn       = page.locator(L.backBtn.selector);
    this.resendOtpLink = page.locator(L.resendOtpLink.selector);
    this.otpTimer      = page.locator(L.otpTimer.selector);
    this.pageHeading   = page.locator(L.pageHeading.selector);
    this.otpHeading    = page.locator(L.otpHeading.selector);
    // Map exposes both termsConditionsLink and privacyPolicyLink as text
    // selectors via the 2026-05-29 live crawl additions.
    this.termsLink     = page.locator(L.termsConditionsLink.selector);
    this.privacyLink   = page.locator(L.privacyPolicyLink.selector);
    // Copyright footer not present in locator-map (no selector key); fall back
    // to scoped page-level locator. Live DOM (2026-06-07 capture) renders
    // "Copyright © 2026 Growwithhoabl All Rights Reserved." — match year+brand.
    this.copyrightFooter = page.getByText(/Copyright\s*©?\s*2026\b/i);
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

  // ── New helpers for the 27 uncovered TCs ────────────────────────────────

  /**
   * Type a single digit using keyboard so the field's keydown/input handlers
   * fire (auto-advance behaviour relies on real keystrokes, not .fill()).
   */
  async typeOtpDigit(boxIndex, digit) {
    const box = this.otpBoxes[boxIndex];
    await box.click();
    await this.page.keyboard.type(digit, { delay: 30 });
  }

  /**
   * Paste a multi-digit string into the first OTP box and expect the UI to
   * fan it out across all six boxes via its onPaste handler.
   */
  async pasteOtp(otp) {
    await this.otpBox1.click();
    // Set clipboard and dispatch paste event programmatically (more reliable
    // across browsers than os-level clipboard).
    await this.otpBox1.evaluate((el, value) => {
      const dt = new DataTransfer();
      dt.setData('text/plain', value);
      const event = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
      el.dispatchEvent(event);
    }, otp);
    // Some implementations also listen for input — fall back to keyboard.type
    // if box1 still empty after the synthetic paste.
    const val = await this.otpBox1.inputValue();
    if (!val) {
      await this.page.keyboard.type(otp, { delay: 20 });
    }
  }

  async readOtpDigits() {
    const out = [];
    for (const box of this.otpBoxes) {
      out.push(await box.inputValue());
    }
    return out;
  }

  /**
   * Return the focused OTP box index (0..5) or -1 if no OTP box has focus.
   */
  async focusedOtpBoxIndex() {
    return this.page.evaluate(() => {
      const active = document.activeElement;
      if (!active) return -1;
      const label = active.getAttribute && active.getAttribute('aria-label');
      const m = label && label.match(/OTP Input (\d)/);
      return m ? Number(m[1]) - 1 : -1;
    });
  }

  async clickResendOtp() {
    await this.click(this.resendOtpLink);
  }

  async getOtpTimerText() {
    return (await this.otpTimer.first().textContent()) || '';
  }

  async tamperJwt(tamperedValue = 'tampered.jwt.value') {
    // Try every plausible storage key — implementation may vary.
    await this.page.evaluate((v) => {
      const keys = ['xr_auth_token', 'token', 'authToken', 'access_token', 'jwt'];
      for (const k of keys) {
        try { localStorage.setItem(k, v); } catch (_) {}
      }
    }, tamperedValue);
  }
}

module.exports = { LoginPage };
