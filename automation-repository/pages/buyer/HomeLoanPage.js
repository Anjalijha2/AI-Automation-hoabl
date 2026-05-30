'use strict';

/**
 * HomeLoanPage.js — Page Object Model for buyer / home-loan.
 *
 * BRD/FRD: BUYER-FS-Home-Loan
 *   - 5-step flow: S1 Eligibility → S2 Offers → S3 Apply → S4 Pre-Approved → S5 Confirmation
 *   - Two entry CTAs on landing: "Check Eligibility" (Easiloan path) vs "I Have a Pre-Approved Sanction Letter"
 *   - Employment type ENUM (lowercase): salaried | self_employed (homeLoanEmpType)
 *   - loan_approval_status ENUM: pending | approved | admin_rejected | admin_approved
 *     - BUG-LOAN-001: `approved` (lowercase) state is UNREACHABLE — buyer paths only set `pending`;
 *       only admin paths set admin_approved / admin_rejected.
 *   - Two independent state machines on the model:
 *       status: in_progress | completed
 *       loan_approval_status: see ENUM above
 *   - CIBIL floor 600 enforced via xanaduService.getCibilScore
 *   - Sanction letter upload: PDF only (stored in LSQ mx_CustomObject slots — no DB table)
 *
 * Locators sourced from locators/buyer/locator-map.json module key "home-loan" with
 * DOM-contract fallbacks scoped to the home-loan shell (live crawl could not pass auth wall
 * at scaffold time — only login-shell elements present).
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/buyer/locator-map.json');

const L = locatorMap['home-loan'] || {};

const HOMELOAN_URL = 'https://uat.xrportal.in/homeloan';

// Employment type ENUM (lowercase — homeLoanEmpType)
const EMP_TYPE_ENUM = ['salaried', 'self_employed'];

// loan_approval_status ENUM (BUG-LOAN-001: `approved` unreachable from buyer paths)
const LOAN_APPROVAL_STATUS_ENUM = ['pending', 'approved', 'admin_rejected', 'admin_approved'];

// CIBIL floor — enforced via xanaduService.getCibilScore
const CIBIL_FLOOR = 600;

class HomeLoanPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = HOMELOAN_URL;
    this.EMP_TYPE_ENUM = EMP_TYPE_ENUM;
    this.LOAN_APPROVAL_STATUS_ENUM = LOAN_APPROVAL_STATUS_ENUM;
    this.CIBIL_FLOOR = CIBIL_FLOOR;

    // ── Element locators from locator-map.json (login-shell — used as fallback) ──
    this.previousSlide          = page.locator((L['previousSlide']          && L['previousSlide'].selector)          || '[aria-label="Previous slide"]');
    this.nextSlide              = page.locator((L['nextSlide']              && L['nextSlide'].selector)              || '[aria-label="Next slide"]');
    this.sendOTPButton          = page.locator((L['sendOTPButton']          && L['sendOTPButton'].selector)          || 'button:has-text("Send OTP")');
    this.termsConditionsLink    = page.locator((L['termsConditionsLink']    && L['termsConditionsLink'].selector)    || 'a:has-text("Terms & Conditions")');
    this.privacyPolicyLink      = page.locator((L['privacyPolicyLink']      && L['privacyPolicyLink'].selector)      || 'a:has-text("Privacy Policy")');
    this.enterMobileNumberInput = page.locator((L['enterMobileNumberInput'] && L['enterMobileNumberInput'].selector) || 'input[placeholder="Enter Mobile Number"]');
    this.rcTabs0Tab1            = page.locator((L['rcTabs0Tab1']            && L['rcTabs0Tab1'].selector)            || '#rc-tabs-0-tab-1');
    this.rcTabs0Tab2            = page.locator((L['rcTabs0Tab2']            && L['rcTabs0Tab2'].selector)            || '#rc-tabs-0-tab-2');
    this.aPPLICANTLOGINHeading  = page.locator((L['aPPLICANTLOGINHeading']  && L['aPPLICANTLOGINHeading'].selector)  || 'h2:has-text("APPLICANT LOGIN")');

    // ── DOM-contract fallbacks — Home Loan shell ────────────────────────────────
    this.loanShell           = page.locator('[class*="homeloan" i], [class*="home-loan" i], main, #__next').first();
    this.stepIndicator       = page.locator('[class*="step"], [class*="stepper"], .ant-steps').first();
    this.stepLabels          = page.locator('[class*="step"][class*="title"], .ant-steps-item-title');
    this.loginRedirectGuard  = page.locator('h2:has-text("APPLICANT LOGIN"), input[placeholder="Enter Mobile Number"]').first();

    // ── Landing CTAs (BYR_LOAN_001, _003, _020) ─────────────────────────────────
    this.homeLoanNavItem        = page.locator('a:has-text("Home Loan"), nav :text("Home Loan"), [href*="homeloan"]').first();
    this.checkEligibilityCTA    = page.locator('button:has-text("Check Eligibility"), a:has-text("Check Eligibility")').first();
    this.preApprovedCTA         = page.locator('button:has-text("Pre-Approved"), button:has-text("Pre Approved"), button:has-text("Sanction Letter"), a:has-text("I Have a Pre-Approved")').first();

    // ── S1 — Eligibility form ───────────────────────────────────────────────────
    this.employmentToggle       = page.locator('[role="radiogroup"], [class*="employment"], [class*="empType"]').first();
    this.salariedOption         = page.locator('label:has-text("Salaried"), button:has-text("Salaried"), [data-value="salaried"]').first();
    this.selfEmployedOption     = page.locator('label:has-text("Self-Employed"), label:has-text("Self Employed"), button:has-text("Self-Employed"), button:has-text("Self Employed"), [data-value="self_employed"]').first();

    // S1 — Salaried fields
    this.monthlyIncomeInput     = page.locator('input[name*="income" i], input[placeholder*="Monthly Income" i], input[placeholder*="Income" i]').first();
    this.existingEmiInput       = page.locator('input[name*="emi" i], input[placeholder*="EMI" i], input[placeholder*="Existing" i]').first();

    // S1 — Self-Employed fields
    this.annualProfitInput      = page.locator('input[name*="profit" i], input[placeholder*="Profit" i], input[placeholder*="Annual Profit" i]').first();
    this.annualTurnoverInput    = page.locator('input[name*="turnover" i], input[placeholder*="Turnover" i], input[placeholder*="Annual Turnover" i]').first();

    // S1 submit
    this.checkEligibilityBtn    = page.locator('button:has-text("Check Eligibility"), button:has-text("Submit Eligibility"), button[type="submit"]').first();

    // ── S2 — Offer cards (BYR_LOAN_013..017) ────────────────────────────────────
    this.offersList             = page.locator('[class*="offer" i][class*="list" i], [data-testid="offer-list"], [class*="LoanOffers" i]').first();
    this.offerCards             = page.locator('[class*="offer-card" i], [class*="offerCard" i], [data-testid^="offer-"]');
    this.applyLoanBtn           = page.locator('button:has-text("Apply"), button:has-text("Apply Loan"), button:has-text("Proceed to Apply")').first();
    this.noOffersMessage        = page.locator('[class*="empty" i], [role="status"], [class*="not-eligible" i]').filter({ hasText: /no offers|don.?t.*meet.*eligibility|not eligible/i }).first();

    // ── S3 — Apply Loan confirmation ────────────────────────────────────────────
    this.applyConfirmSummary    = page.locator('[class*="confirm" i], [class*="apply-summary" i], [data-testid="apply-loan-summary"]').first();
    this.applyConfirmBtn        = page.locator('button:has-text("Confirm"), button:has-text("Submit Application"), button:has-text("Proceed")').first();

    // ── S4 — Pre-Approved sanction-letter form ──────────────────────────────────
    this.preApprovedBankInput   = page.locator('input[name*="bank" i], input[placeholder*="Bank" i]').first();
    this.preApprovedAmountInput = page.locator('input[name*="amount" i][name*="sanction" i], input[placeholder*="Sanction Amount" i], input[placeholder*="Loan Amount" i]').first();
    this.sanctionLetterInput    = page.locator('input[type="file"][name*="sanction" i], input[type="file"][accept*="pdf" i]').first();
    this.preApprovedSubmitBtn   = page.locator('button:has-text("Submit"), button:has-text("Save"), button:has-text("Confirm")').first();

    // ── S5 — Confirmation screen (BYR_LOAN_023, _026, _051) ─────────────────────
    this.confirmationBanner     = page.locator('[class*="success" i], [class*="congratulations" i], [role="status"]').filter({ hasText: /congratulations|submitted|success|thank you/i }).first();
    this.nocSection             = page.locator('[class*="HomeLoanData" i], [class*="noc" i], [data-testid="noc-list"]').first();
    this.nocItems               = page.locator('[class*="noc" i] li, [data-testid^="noc-item-"]');
    this.downloadNocLink        = page.locator('a:has-text("Download NOC"), a:has-text("NOC"), button:has-text("Download NOC")').first();

    // ── Tracking (BYR_LOAN_047, _048, _052) ─────────────────────────────────────
    this.statusBadge            = page.locator('[class*="status" i][class*="badge" i], [data-testid="loan-status-badge"], [class*="loan-status" i]').first();
    this.trackingSection        = page.locator('[class*="track" i], [data-testid="loan-tracking"]').first();

    // ── Generic error/validation ────────────────────────────────────────────────
    this.validationError        = page.locator('[role="alert"], [class*="error-message"], [class*="ant-form-item-explain-error"]').first();
    this.errorToast             = page.locator('[role="alert"], [class*="toast"], [class*="notification-error"]').first();
    this.retryButton            = page.locator('button:has-text("Retry"), button:has-text("Try Again")').first();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async isOnLoginRedirect() {
    return this.loginRedirectGuard.isVisible({ timeout: 3_000 }).catch(() => false);
  }

  async expectOnLoanShell() {
    const stepVisible = await this.stepIndicator.isVisible({ timeout: 5_000 }).catch(() => false);
    const ctaVisible  = await this.checkEligibilityCTA.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!stepVisible && !ctaVisible) {
      throw new Error('Neither step indicator nor Check Eligibility CTA visible on /homeloan');
    }
  }

  // ── S1 — Eligibility ───────────────────────────────────────────────────────

  /**
   * Fill the Salaried eligibility form.
   * @param {{ monthlyIncome: (number|string), existingEmi: (number|string) }} data
   */
  async fillSalariedEligibility(data = {}) {
    // Ensure Salaried is selected
    const salariedVisible = await this.salariedOption.isVisible().catch(() => false);
    if (salariedVisible) {
      await this.salariedOption.click().catch(() => {});
    }
    if (data.monthlyIncome !== undefined) {
      const visible = await this.monthlyIncomeInput.isVisible().catch(() => false);
      if (visible) await this.fill(this.monthlyIncomeInput, String(data.monthlyIncome));
    }
    if (data.existingEmi !== undefined) {
      const visible = await this.existingEmiInput.isVisible().catch(() => false);
      if (visible) await this.fill(this.existingEmiInput, String(data.existingEmi));
    }
  }

  /**
   * Fill the Self-Employed eligibility form.
   * BYR_LOAN_042: Turnover must be >= Profit (enforced client-side too)
   * @param {{ annualProfit, annualTurnover, existingEmi }} data
   */
  async fillSelfEmployedEligibility(data = {}) {
    const selfVisible = await this.selfEmployedOption.isVisible().catch(() => false);
    if (selfVisible) {
      await this.selfEmployedOption.click().catch(() => {});
    }
    if (data.annualProfit !== undefined) {
      const visible = await this.annualProfitInput.isVisible().catch(() => false);
      if (visible) await this.fill(this.annualProfitInput, String(data.annualProfit));
    }
    if (data.annualTurnover !== undefined) {
      const visible = await this.annualTurnoverInput.isVisible().catch(() => false);
      if (visible) await this.fill(this.annualTurnoverInput, String(data.annualTurnover));
    }
    if (data.existingEmi !== undefined) {
      const visible = await this.existingEmiInput.isVisible().catch(() => false);
      if (visible) await this.fill(this.existingEmiInput, String(data.existingEmi));
    }
  }

  /**
   * Submit eligibility form → triggers Easiloan API call (BYR_LOAN_010).
   * Guarded externally with ENV + ALLOW_DESTRUCTIVE.
   */
  async submitToEasiloan() {
    await this.click(this.checkEligibilityBtn);
  }

  // ── S2 — Offers Review ─────────────────────────────────────────────────────

  /** Wait for offer list to render. */
  async viewOffersReview() {
    await this.offersList.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
    return this.offerCards.count().catch(() => 0);
  }

  /**
   * Select a specific offer card by index (0-based).
   * BYR_LOAN_015: only one offer selectable at a time (radio-style).
   * @param {number} index
   */
  async selectOffer(index = 0) {
    const count = await this.offerCards.count().catch(() => 0);
    if (count === 0) {
      throw new Error('No offer cards rendered — cannot select offer');
    }
    if (index >= count) {
      throw new Error(`Offer index ${index} out of range (only ${count} offers)`);
    }
    await this.offerCards.nth(index).click();
  }

  // ── S3 — Apply Loan ────────────────────────────────────────────────────────

  /** Confirm application on Apply Loan screen → creates RegistrationHomeLoan record. */
  async applyLoan() {
    await this.click(this.applyLoanBtn);
  }

  async confirmApplyLoan() {
    await this.click(this.applyConfirmBtn);
  }

  // ── S4 — Pre-Approved ──────────────────────────────────────────────────────

  /** Click "I Have a Pre-Approved Sanction Letter" — skips Easiloan flow. */
  async chosePreApprovedPath() {
    await this.click(this.preApprovedCTA);
  }

  /**
   * @param {{ bank: string, amount: (number|string), sanctionLetterPath: string }} data
   */
  async fillPreApprovedForm(data = {}) {
    if (data.bank !== undefined) {
      const v = await this.preApprovedBankInput.isVisible().catch(() => false);
      if (v) await this.fill(this.preApprovedBankInput, data.bank);
    }
    if (data.amount !== undefined) {
      const v = await this.preApprovedAmountInput.isVisible().catch(() => false);
      if (v) await this.fill(this.preApprovedAmountInput, String(data.amount));
    }
    if (data.sanctionLetterPath !== undefined) {
      const v = await this.sanctionLetterInput.isVisible().catch(() => false);
      if (v) await this.sanctionLetterInput.setInputFiles(data.sanctionLetterPath);
    }
  }

  async submitPreApproved() {
    await this.click(this.preApprovedSubmitBtn);
  }

  /** Assertion helper — pre-approved confirmation visible. */
  async expectPreApproved() {
    await this.confirmationBanner.waitFor({ state: 'visible', timeout: 15_000 });
  }

  // ── S5 — Confirmation & NOC ────────────────────────────────────────────────

  async expectConfirmation() {
    await this.confirmationBanner.waitFor({ state: 'visible', timeout: 20_000 });
  }

  /** BYR_LOAN_026 / _051 — NOC list rendered with bank-specific requirements. */
  async getNocItemCount() {
    return this.nocItems.count().catch(() => 0);
  }

  // ── Tracking — BYR_LOAN_047 / _048 ─────────────────────────────────────────

  async navigateToStatus() {
    // Tracking is on the same /homeloan URL — navigation is a no-op refresh
    await this.navigate();
    await this.waitForLoad();
  }

  /**
   * Assert status badge text matches a presentation label.
   * Note: backend ENUM is lowercase (pending/admin_approved/admin_rejected),
   * the UI maps to "Pending"/"Approved"/"Rejected" — caller passes presentation label.
   * @param {string|RegExp} expected
   */
  async expectStatus(expected) {
    await this.statusBadge.waitFor({ state: 'visible', timeout: 10_000 });
    const text = (await this.statusBadge.textContent() || '').trim();
    const pattern = expected instanceof RegExp ? expected : new RegExp(expected, 'i');
    if (!pattern.test(text)) {
      throw new Error(`Expected status badge to match '${expected}', got '${text}'`);
    }
    return text;
  }

  async getApprovalStatus() {
    const visible = await this.statusBadge.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!visible) return null;
    return (await this.statusBadge.textContent() || '').trim();
  }

  // ── Validation helpers ─────────────────────────────────────────────────────

  async expectValidationError(text) {
    await this.validationError.waitFor({ state: 'visible', timeout: 5_000 });
    if (text) {
      const content = await this.validationError.textContent();
      if (!new RegExp(text, 'i').test(content || '')) {
        throw new Error(`Expected validation error to match '${text}', got: '${content}'`);
      }
    }
  }

  /**
   * Validate employment type against ENUM whitelist.
   * Throws if not in EMP_TYPE_ENUM.
   * @param {string} empType
   */
  validateEmpType(empType) {
    const normalized = (empType || '').toString().toLowerCase();
    if (!this.EMP_TYPE_ENUM.includes(normalized)) {
      throw new Error(
        `Invalid homeLoanEmpType '${empType}'. Must be one of: ${this.EMP_TYPE_ENUM.join('|')}`,
      );
    }
    return normalized;
  }

  /**
   * Validate loan_approval_status against ENUM.
   * Note: BUG-LOAN-001 — `approved` is unreachable from buyer paths.
   * @param {string} status
   */
  validateApprovalStatus(status) {
    const normalized = (status || '').toString().toLowerCase();
    if (!this.LOAN_APPROVAL_STATUS_ENUM.includes(normalized)) {
      throw new Error(
        `Invalid loan_approval_status '${status}'. Must be one of: ${this.LOAN_APPROVAL_STATUS_ENUM.join('|')}`,
      );
    }
    return normalized;
  }
}

module.exports = {
  HomeLoanPage,
  EMP_TYPE_ENUM,
  LOAN_APPROVAL_STATUS_ENUM,
  CIBIL_FLOOR,
};
