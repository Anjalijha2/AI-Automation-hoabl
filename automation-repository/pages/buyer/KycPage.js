'use strict';

/**
 * KycPage.js — Page Object Model for buyer / kyc.
 *
 * Selectors sourced from locators/buyer/locator-map.json (module key: "kyc").
 * NOTE: locator-map.json kyc module currently holds only the global login-shell elements
 * (live crawl could not pass the auth wall during scaffold). Form-step locators below
 * use stable DOM-contract fallbacks scoped to the kyc shell, to be replaced once the
 * Tech Lead Agent re-crawls /kyc against an authenticated session.
 *
 * BRD/FRD: BUYER-FS-KYC
 *   - 5-step flow: Applicants → Documents → Review → e-Verification → Confirmation
 *   - Max 4 applicants per unit (BR-KYC, master_config.max_applicants_per_unit)
 *   - Relation ENUM (lowercase): self|father|mother|brother|sister|spouse
 *   - File MIME whitelist: pdf|jpeg|png ; size cap 5MB on /applicants
 *     (BUG-KYC-001 — /upload-kyc-form size limit commented out)
 *   - Required docs: panDoc, aadhaarFront, aadhaarBack ; photoDoc optional
 *   - KYC PDF generated server-side by cron, NOT on-demand
 *   - e-verification only for SM-assisted flow, not buyer-self
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/buyer/locator-map.json');

const L = locatorMap['kyc'] || {};

const KYC_URL = 'https://uat.xrportal.in/kyc';

// Relation ENUM whitelist (BR-KYC)
const RELATION_ENUM = ['self', 'father', 'mother', 'brother', 'sister', 'spouse'];
const MAX_APPLICANTS = 4;

class KycPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = KYC_URL;
    this.MAX_APPLICANTS = MAX_APPLICANTS;
    this.RELATION_ENUM = RELATION_ENUM;

    // ── Element locators from locator-map.json (login-shell, used as fallback) ──
    this.previousSlide          = page.locator(L['previousSlide'] && L['previousSlide'].selector || '[aria-label="Previous slide"]');
    this.nextSlide              = page.locator(L['nextSlide'] && L['nextSlide'].selector || '[aria-label="Next slide"]');
    this.sendOTPButton          = page.locator(L['sendOTPButton'] && L['sendOTPButton'].selector || 'button:has-text("Send OTP")');
    this.termsConditionsLink    = page.locator(L['termsConditionsLink'] && L['termsConditionsLink'].selector || 'a:has-text("Terms & Conditions")');
    this.privacyPolicyLink      = page.locator(L['privacyPolicyLink'] && L['privacyPolicyLink'].selector || 'a:has-text("Privacy Policy")');
    this.enterMobileNumberInput = page.locator(L['enterMobileNumberInput'] && L['enterMobileNumberInput'].selector || 'input[placeholder="Enter Mobile Number"]');
    this.rcTabs0Tab1            = page.locator(L['rcTabs0Tab1'] && L['rcTabs0Tab1'].selector || '#rc-tabs-0-tab-1');
    this.rcTabs0Tab2            = page.locator(L['rcTabs0Tab2'] && L['rcTabs0Tab2'].selector || '#rc-tabs-0-tab-2');
    this.aPPLICANTLOGINHeading  = page.locator(L['aPPLICANTLOGINHeading'] && L['aPPLICANTLOGINHeading'].selector || 'h2:has-text("APPLICANT LOGIN")');

    // ── DOM-contract fallbacks — KYC step indicators & shell ────────────────────
    this.kycShell          = page.locator('[class*="kyc"], main, #__next').first();
    this.stepIndicator     = page.locator('[class*="step"], [class*="stepper"], .ant-steps').first();
    this.stepActive        = page.locator('[class*="step"][class*="active"], .ant-steps-item-active').first();
    this.stepLabels        = page.locator('[class*="step"][class*="title"], .ant-steps-item-title');
    this.formContainer     = page.locator('form, [class*="form"]').first();

    // ── Step 1 — Primary applicant form ─────────────────────────────────────────
    this.fullNameInput     = page.locator('input[name="fullName"], input[name="name"], input[placeholder*="Full Name" i]').first();
    this.dobInput          = page.locator('input[name="dob"], input[name="dateOfBirth"], input[placeholder*="DOB" i], input[placeholder*="Date of Birth" i]').first();
    this.emailInput        = page.locator('input[name="email"], input[type="email"], input[placeholder*="Email" i]').first();
    this.mobileInput       = page.locator('input[name="mobile"], input[name="phone"], input[placeholder*="Mobile" i]').first();
    this.panInput          = page.locator('input[name="pan"], input[name="panNumber"], input[placeholder*="PAN" i]').first();
    this.aadhaarInput      = page.locator('input[name="aadhaar"], input[name="aadhaarNumber"], input[placeholder*="Aadhaar" i]').first();
    this.relationDropdown  = page.locator('select[name="relation"], [class*="relation"] [class*="select"], [data-testid="relation-select"]').first();
    this.addressLine1      = page.locator('input[name="address"], textarea[name="address"], input[placeholder*="Address" i]').first();
    this.cityInput         = page.locator('input[name="city"], input[placeholder*="City" i]').first();
    this.stateInput        = page.locator('input[name="state"], select[name="state"], input[placeholder*="State" i]').first();
    this.pincodeInput      = page.locator('input[name="pincode"], input[name="zipCode"], input[placeholder*="Pincode" i]').first();

    // ── Co-applicant controls ───────────────────────────────────────────────────
    this.addCoApplicantBtn = page.locator('button:has-text("Add Co-Applicant"), button:has-text("Add Applicant"), button:has-text("+ Applicant")').first();
    this.applicantCards    = page.locator('[class*="applicant-card"], [class*="applicantCard"], [data-testid^="applicant-"]');
    this.removeApplicantBtn = page.locator('button:has-text("Remove"), [aria-label*="remove applicant" i]');

    // ── Step 2 — Document upload (file inputs) ──────────────────────────────────
    this.panDocInput          = page.locator('input[type="file"][name="panDoc"], input[type="file"][name*="pan" i]').first();
    this.aadhaarFrontInput    = page.locator('input[type="file"][name="aadhaarFront"], input[type="file"][name*="aadhaarFront" i]').first();
    this.aadhaarBackInput     = page.locator('input[type="file"][name="aadhaarBack"], input[type="file"][name*="aadhaarBack" i]').first();
    this.photoDocInput        = page.locator('input[type="file"][name="photoDoc"], input[type="file"][name*="photo" i]').first();
    this.fileSizeErrorToast   = page.locator('[role="alert"], [class*="error"]').filter({ hasText: /size|5\s*mb|too large/i }).first();
    this.fileMimeErrorToast   = page.locator('[role="alert"], [class*="error"]').filter({ hasText: /format|type|pdf|jpeg|png/i }).first();

    // ── Step 3 — Review summary ─────────────────────────────────────────────────
    this.reviewSummary     = page.locator('[class*="review"], [data-testid="review-summary"]').first();
    this.editStep1Btn      = page.locator('button:has-text("Edit Applicant"), a:has-text("Edit Applicant")').first();
    this.editStep2Btn      = page.locator('button:has-text("Edit Documents"), a:has-text("Edit Documents")').first();
    this.parkingToggle     = page.locator('input[type="checkbox"][name*="parking" i], [data-testid="parking-toggle"]').first();
    this.parkingCountInput = page.locator('input[name="parkingCount"], input[type="number"][placeholder*="parking" i]').first();

    // ── Step 4 — e-Verification (SM flow only — guarded in tests) ───────────────
    this.eVerifyOtpInput   = page.locator('input[name="evOtp"], input[aria-label*="e-verification" i]').first();
    this.eVerifySendBtn    = page.locator('button:has-text("Send Verification OTP"), button:has-text("e-Verify")').first();
    this.eVerifySubmitBtn  = page.locator('button:has-text("Verify"), button:has-text("Confirm Verification")').first();

    // ── Step 5 — Confirmation ───────────────────────────────────────────────────
    this.confirmationBanner = page.locator('[class*="success"], [role="status"]').filter({ hasText: /submitted|success/i }).first();
    this.kycReferenceNumber = page.locator('[class*="reference"], [data-testid="kyc-reference"]').first();
    this.downloadPdfBtn     = page.locator('button:has-text("Download"), a:has-text("Download PDF")').first();

    // ── Navigation / step controls ──────────────────────────────────────────────
    this.nextStepBtn        = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Proceed")').first();
    this.prevStepBtn        = page.locator('button:has-text("Back"), button:has-text("Previous")').first();
    this.submitKycBtn       = page.locator('button:has-text("Submit KYC"), button:has-text("Submit Application")').first();

    // ── Generic error/validation ────────────────────────────────────────────────
    this.validationError    = page.locator('[role="alert"], [class*="error-message"], [class*="ant-form-item-explain-error"]').first();
    this.loginRedirectGuard = page.locator('h2:has-text("APPLICANT LOGIN"), input[placeholder="Enter Mobile Number"]').first();
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

  async expectOnKycShell() {
    // Either step indicator OR form container should be visible
    const stepVisible = await this.stepIndicator.isVisible({ timeout: 5_000 }).catch(() => false);
    const formVisible = await this.formContainer.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!stepVisible && !formVisible) {
      throw new Error('Neither KYC step indicator nor form container is visible');
    }
  }

  // ── Step 1 — Primary applicant form ────────────────────────────────────────

  /**
   * @param {{
   *   fullName?: string, dob?: string, email?: string, mobile?: string,
   *   pan?: string, aadhaar?: string, relation?: string,
   *   address?: string, city?: string, state?: string, pincode?: string
   * }} data
   */
  async fillPrimaryApplicant(data = {}) {
    if (data.fullName !== undefined && await this.fullNameInput.isVisible().catch(() => false)) {
      await this.fill(this.fullNameInput, data.fullName);
    }
    if (data.dob !== undefined && await this.dobInput.isVisible().catch(() => false)) {
      await this.fill(this.dobInput, data.dob);
    }
    if (data.email !== undefined && await this.emailInput.isVisible().catch(() => false)) {
      await this.fill(this.emailInput, data.email);
    }
    if (data.mobile !== undefined && await this.mobileInput.isVisible().catch(() => false)) {
      await this.fill(this.mobileInput, data.mobile);
    }
    if (data.pan !== undefined && await this.panInput.isVisible().catch(() => false)) {
      await this.fill(this.panInput, data.pan);
    }
    if (data.aadhaar !== undefined && await this.aadhaarInput.isVisible().catch(() => false)) {
      await this.fill(this.aadhaarInput, data.aadhaar);
    }
    if (data.relation !== undefined) {
      await this.selectRelation(data.relation);
    }
    if (data.address !== undefined && await this.addressLine1.isVisible().catch(() => false)) {
      await this.fill(this.addressLine1, data.address);
    }
    if (data.city !== undefined && await this.cityInput.isVisible().catch(() => false)) {
      await this.fill(this.cityInput, data.city);
    }
    if (data.pincode !== undefined && await this.pincodeInput.isVisible().catch(() => false)) {
      await this.fill(this.pincodeInput, data.pincode);
    }
  }

  /**
   * Select relation from ENUM (lowercase per BR-KYC).
   * @param {string} relation
   */
  async selectRelation(relation) {
    const normalized = (relation || '').toString().toLowerCase();
    if (!this.RELATION_ENUM.includes(normalized)) {
      throw new Error(
        `Invalid relation '${relation}'. Must be one of: ${this.RELATION_ENUM.join('|')}`,
      );
    }
    const dropdownVisible = await this.relationDropdown.isVisible().catch(() => false);
    if (!dropdownVisible) return;
    const tag = await this.relationDropdown.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
    if (tag === 'select') {
      await this.relationDropdown.selectOption({ value: normalized }).catch(async () => {
        await this.relationDropdown.selectOption({ label: normalized });
      });
    } else {
      // ant-design or custom dropdown — click + pick option
      await this.relationDropdown.click();
      await this.page.locator(`[role="option"]:has-text("${normalized}"), li:has-text("${normalized}")`).first().click();
    }
  }

  /**
   * Add co-applicant. Enforces max 4 applicants total (BR-KYC).
   * @param {object} data — same shape as fillPrimaryApplicant
   */
  async addCoApplicant(data = {}) {
    const currentCount = await this.applicantCards.count().catch(() => 0);
    if (currentCount >= this.MAX_APPLICANTS) {
      throw new Error(
        `Cannot add co-applicant: already at max ${this.MAX_APPLICANTS} applicants (BR-KYC, max_applicants_per_unit)`,
      );
    }
    await this.click(this.addCoApplicantBtn);
    // Most recent applicant card is now active — fill it
    await this.fillPrimaryApplicant(data);
  }

  async getApplicantCount() {
    return this.applicantCards.count().catch(() => 0);
  }

  // ── Step 2 — Document upload ───────────────────────────────────────────────

  /**
   * Upload PAN document. MIME whitelist: pdf|jpeg|png. Size cap: 5MB on /applicants.
   * @param {string} filePath
   */
  async uploadPan(filePath) {
    await this.panDocInput.setInputFiles(filePath);
  }

  async uploadAadhaarFront(filePath) {
    await this.aadhaarFrontInput.setInputFiles(filePath);
  }

  async uploadAadhaarBack(filePath) {
    await this.aadhaarBackInput.setInputFiles(filePath);
  }

  /** photoDoc is optional per FSD. */
  async uploadPhoto(filePath) {
    await this.photoDocInput.setInputFiles(filePath);
  }

  /** Upload all mandatory docs (panDoc, aadhaarFront, aadhaarBack). */
  async uploadAllMandatoryDocs({ pan, aadhaarFront, aadhaarBack }) {
    await this.uploadPan(pan);
    await this.uploadAadhaarFront(aadhaarFront);
    await this.uploadAadhaarBack(aadhaarBack);
  }

  // ── Step 3 — Review ────────────────────────────────────────────────────────

  async expectOnReview() {
    await this.reviewSummary.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async toggleParking(enabled) {
    const visible = await this.parkingToggle.isVisible().catch(() => false);
    if (!visible) return;
    const checked = await this.parkingToggle.isChecked().catch(() => false);
    if (enabled && !checked) await this.parkingToggle.check();
    else if (!enabled && checked) await this.parkingToggle.uncheck();
  }

  // ── Step 4 — e-Verification (SM-flow only) ─────────────────────────────────

  /**
   * NOTE: e-verification is only present in the SM-assisted flow.
   * In buyer-self flow this step is skipped server-side.
   * @param {string} otp
   */
  async completeEVerification(otp) {
    const present = await this.eVerifyOtpInput.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!present) {
      return { skipped: true, reason: 'e-Verification only present in SM-assisted flow' };
    }
    await this.click(this.eVerifySendBtn).catch(() => {});
    await this.fill(this.eVerifyOtpInput, otp);
    await this.click(this.eVerifySubmitBtn);
    return { skipped: false };
  }

  // ── Step transitions ───────────────────────────────────────────────────────

  async clickNext() {
    await this.click(this.nextStepBtn);
  }

  async clickPrev() {
    await this.click(this.prevStepBtn);
  }

  async clickSubmitKyc() {
    await this.click(this.submitKycBtn);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async expectKycSubmitted() {
    await this.confirmationBanner.waitFor({ state: 'visible', timeout: 20_000 });
  }

  async expectValidationError(text) {
    await this.validationError.waitFor({ state: 'visible', timeout: 5_000 });
    if (text) {
      const content = await this.validationError.textContent();
      if (!new RegExp(text, 'i').test(content || '')) {
        throw new Error(`Expected validation error to match '${text}', got: '${content}'`);
      }
    }
  }

  async getActiveStepLabel() {
    return this.stepActive.textContent().catch(() => null);
  }
}

module.exports = { KycPage, RELATION_ENUM, MAX_APPLICANTS };
