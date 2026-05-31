'use strict';

/**
 * KycAssistancePage.js — Page Object for Channel Partner Portal / KYC Assistance.
 *
 * Module URL: https://uat-web.xrportal.in/kyc
 * Locator-map module key: "kyc-assistance"
 * BRD/FRD: CP-FS-KYC-Assistance.md
 *
 * NOTES (from TC FSD-corrections, 2026-05-25):
 *   - "CP performs KYC on behalf of buyer" is NOT a backend-supported feature
 *     (KB-CPK-01). `/kyc` route currently exposes CP's OWN docs via
 *     GET /api/v1/cp/kyc and lets CP re-upload via POST /api/v1/cp/registration
 *     (kyc:true). Buyer KYC must be submitted by the buyer themselves.
 *   - BUG-CPK-03: success_registercp WhatsApp template renders `${+91}${phone}`
 *     as `"91<phone>"` without the leading `+` (cp.controller.js:376-378).
 *   - Documents go to LSQ (CP self-KYC) or Azure Blob (buyer KYC); NOT S3.
 *   - isKycSubmitted flag mutates only on POST /api/v1/user/allocation/submit-kyc
 *     (buyer role) — there is no CP endpoint that sets it.
 *   - This POM therefore models BOTH the assumed buyer-KYC-by-CP UI (if it
 *     materialises) AND the actual CP-self-KYC surface that currently lives at
 *     /kyc, so the same suite covers existing scaffolded TCs and the new
 *     FSD-bug TCs CP_KYC_031..040.
 *
 * Locators are sourced from locators/channel-partner/locator-map.json — bracket
 * access only (e.g. `L['enterPANNumberInput']`). Never inline selectors.
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['kyc-assistance'] || {};

const KYCASSISTANCE_URL = 'https://uat-web.xrportal.in/kyc';
const LOGIN_URL_RE      = /\/login/;

// ── Document slot keys (per BR — Photo, PAN, Aadhaar Front, Aadhaar Back) ──
const DOC_SLOTS = Object.freeze(['photo', 'pan', 'aadhaarFront', 'aadhaarBack']);

// Co-applicant ENUM (buyer schema — for relation dropdown matching, KB-CPK-04)
const RELATION_ENUM = Object.freeze(['self', 'father', 'mother', 'brother', 'sister', 'spouse']);

const MAX_APPLICANTS = 4;

class KycAssistancePage extends BasePage {
  constructor(page) {
    super(page);
    this.L   = L;
    this.url = KYCASSISTANCE_URL;

    // ── Header / nav (shared with leads, project-info) ───────────────────────
    this.logoutButton = page.locator(L['logoutButton']    && L['logoutButton'].selector    || 'button:has-text("Logout")');
    this.homeLink     = page.locator(L['homeLink']        && L['homeLink'].selector        || 'a:has-text("Home")').first();
    this.kYCLink      = page.locator(L['kYCLink']         && L['kYCLink'].selector         || 'a:has-text("KYC")');
    this.jBPLink      = page.locator(L['jBPLink']         && L['jBPLink'].selector         || 'a:has-text("JBP")');
    this.leadsLink    = page.locator(L['leadsLink']       && L['leadsLink'].selector       || 'a:has-text("Leads")');

    // ── Page heading ──────────────────────────────────────────────────────────
    this.kYCHeading   = page.locator(L['kYCHeading']      && L['kYCHeading'].selector      || 'h2:has-text("KYC")');

    // ── Customer selector (search Customer Reg number/name) ──────────────────
    // Re-uses search input pattern present across the portal — the kyc module
    // map exposes Enter Name / Enter Mobile inputs but not a dedicated search
    // box; fall back to text variants if not present on this page.
    this.customerSelectorCombo  = page.locator(L['rcSelect0'] && L['rcSelect0'].selector   || '#rc_select_0');
    this.searchCustomerInput    = page.locator('input[placeholder="Search Customer"]');

    // ── Primary applicant fields (resolved via locator-map keys) ─────────────
    // Mapped by `L['enterNameInput']` first; falls back to `enterNameInput2`
    // (the locator-map crawl picked up TWO "Enter Name" inputs for primary +
    // co-applicant sections — both keys preserved for clarity).
    this.enterNameInput         = page.locator(L['enterNameInput']         && L['enterNameInput'].selector         || 'input[placeholder="Enter Name"]').first();
    this.enterNameInputCo       = page.locator(L['enterNameInput2']        && L['enterNameInput2'].selector        || 'input[placeholder="Enter Name"]').nth(1);
    this.enterEmailIDInput      = page.locator(L['enterEmailIDInput']      && L['enterEmailIDInput'].selector      || 'input[placeholder="Enter Email ID"]');
    this.enterMobileNumberInput = page.locator(L['enterMobileNumberInput'] && L['enterMobileNumberInput'].selector || 'input[placeholder="Enter Mobile Number"]');
    this.enterFullAddressInput  = page.locator(L['enterFullAddressInput']  && L['enterFullAddressInput'].selector  || 'input[placeholder="Enter Full Address"]');
    this.enterPinCodeInput      = page.locator(L['enterPinCodeInput']      && L['enterPinCodeInput'].selector      || 'input[placeholder="Enter Pin Code"]');
    this.enterPANNumberInput    = page.locator(L['enterPANNumberInput']    && L['enterPANNumberInput'].selector    || 'input[placeholder="Enter PAN Number"]');
    this.enterRERANumberInput   = page.locator(L['enterRERANumberInput']   && L['enterRERANumberInput'].selector   || 'input[placeholder="Enter RERA Number"]');

    // ── Aadhaar / DOB (not yet in locator-map; safe text-based fallbacks) ────
    this.aadhaarInput           = page.locator('input[placeholder*="Aadhaar" i]');
    this.dobInput               = page.locator('input[type="date"], input[placeholder*="DOB" i], input[placeholder*="Date of Birth" i]');
    this.occupationCombo        = page.locator('input[placeholder*="Occupation" i], select[name*="occupation" i]');
    this.incomeCombo            = page.locator('input[placeholder*="Income" i], select[name*="income" i]');
    this.relationCombo          = page.locator('input[placeholder*="Relation" i], select[name*="relation" i]');

    // ── Action buttons ────────────────────────────────────────────────────────
    this.cancelButton           = page.locator(L['cancelButton'] && L['cancelButton'].selector || 'button:has-text("Cancel")');
    this.submitButton           = page.locator(L['submitButton'] && L['submitButton'].selector || 'button:has-text("Submit")');
    this.addApplicantButton     = page.locator('button:has-text("Add Applicant"), button:has-text("+ Add Applicant"), button:has-text("Add Co-Applicant")');
    this.removeApplicantButton  = page.locator('button[aria-label*="Remove" i], button:has-text("Remove Applicant")');

    // ── Document upload widgets (file inputs by field name per upload.js:140) ─
    this.panDocInput            = page.locator('input[type="file"][name="panDoc"], input[type="file"][accept*="image"]').nth(0);
    this.aadhaarFrontDocInput   = page.locator('input[type="file"][name="aadhaarFront"], input[type="file"]').nth(1);
    this.aadhaarBackDocInput    = page.locator('input[type="file"][name="aadhaarBack"], input[type="file"]').nth(2);
    this.photoDocInput          = page.locator('input[type="file"][name="photoDoc"], input[type="file"]').nth(3);

    // ── Status / messaging ───────────────────────────────────────────────────
    this.successToast           = page.locator('[role="alert"]:has-text("success"), [role="status"]:has-text("KYC"), .ant-message-success, .ant-notification-success');
    this.validationError        = page.locator('[role="alert"], .ant-form-item-explain-error, .error-message, [class*="error" i]:visible');
    this.fileMimeErrorToast     = page.locator('[role="alert"]:has-text("Unsupported"), [role="alert"]:has-text("file type")');
    this.fileSizeErrorToast     = page.locator('[role="alert"]:has-text("size"), [role="alert"]:has-text("too large")');
    this.kycReadOnlyBanner      = page.locator(':text-matches("KYC submitted|read[- ]only|already submitted", "i")');
    this.kycNotEligibleBanner   = page.locator(':text-matches("not eligible|post unit allocation|WINNER", "i")');

    // ── Applicant block (for counting) ───────────────────────────────────────
    this.applicantCards         = page.locator('[data-applicant], [class*="applicant" i][class*="card" i], [class*="applicant-block" i]');
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
    return LOGIN_URL_RE.test(this.page.url());
  }

  // ── Customer selection ─────────────────────────────────────────────────────

  /**
   * Select the buyer customer (by registration number / name) for whom the CP
   * will fill KYC. Falls back gracefully when neither a combo nor a search box
   * is rendered (page may be CP-self-KYC view per KB-CPK-01).
   */
  async selectCustomer(regNumberOrName) {
    if (!regNumberOrName) return;
    const comboVisible = await this.customerSelectorCombo.first().isVisible().catch(() => false);
    if (comboVisible) {
      await this.customerSelectorCombo.first().click();
      await this.page.keyboard.type(String(regNumberOrName));
      await this.page.waitForTimeout(400); // debounced dropdown refresh
      await this.page.keyboard.press('Enter');
      return;
    }
    const searchVisible = await this.searchCustomerInput.first().isVisible().catch(() => false);
    if (searchVisible) {
      await this.fill(this.searchCustomerInput.first(), String(regNumberOrName));
      await this.page.keyboard.press('Enter');
    }
    // else: no selector — assume single-customer surface (CP-self-KYC)
  }

  // ── Primary applicant ──────────────────────────────────────────────────────

  /**
   * Fill the primary applicant block. Each field is filled only when its DOM
   * node is present — keeps the helper robust across the two divergent views.
   *
   * @param {{
   *   fullName?: string, email?: string, mobile?: string, address?: string,
   *   pincode?: string, pan?: string, rera?: string, aadhaar?: string,
   *   dob?: string, occupation?: string, income?: string
   * }} data
   */
  async fillPrimaryApplicant(data = {}) {
    const fields = [
      [this.enterNameInput,         data.fullName],
      [this.enterEmailIDInput,      data.email],
      [this.enterMobileNumberInput, data.mobile],
      [this.enterFullAddressInput,  data.address],
      [this.enterPinCodeInput,      data.pincode],
      [this.enterPANNumberInput,    data.pan],
      [this.enterRERANumberInput,   data.rera],
      [this.aadhaarInput,           data.aadhaar],
      [this.dobInput,               data.dob],
      [this.occupationCombo,        data.occupation],
      [this.incomeCombo,            data.income],
    ];
    for (const [loc, val] of fields) {
      if (val == null) continue;
      const present = await loc.first().isVisible().catch(() => false);
      if (!present) continue;
      await this.fill(loc.first(), String(val));
    }
  }

  // ── Co-applicants ──────────────────────────────────────────────────────────

  /**
   * Add a co-applicant block. Enforces the buyer-schema cap of 4 applicants
   * (master_config.max_applicants_per_unit) at the JS layer regardless of the
   * UI's enforcement state.
   */
  async addCoApplicant(data = {}) {
    const existing = await this.applicantCards.count().catch(() => 0);
    if (existing >= MAX_APPLICANTS) {
      throw new Error(`Cannot add applicant: cap of ${MAX_APPLICANTS} (max_applicants_per_unit) reached`);
    }
    if (data.relation && !RELATION_ENUM.includes(String(data.relation).toLowerCase())) {
      throw new Error(`Invalid relation "${data.relation}". Allowed: ${RELATION_ENUM.join(', ')}`);
    }
    const addVisible = await this.addApplicantButton.first().isVisible().catch(() => false);
    if (!addVisible) {
      throw new Error('Add Applicant button not rendered — CP-self-KYC view does not support co-applicants');
    }
    await this.click(this.addApplicantButton.first());
    // After clicking, a second name input (enterNameInputCo) should appear.
    const coVisible = await this.enterNameInputCo.isVisible({ timeout: 5_000 }).catch(() => false);
    if (coVisible && data.fullName) {
      await this.fill(this.enterNameInputCo, String(data.fullName));
    }
    if (data.email)   await this.enterEmailIDInput.nth(1).fill(String(data.email)).catch(() => {});
    if (data.mobile)  await this.enterMobileNumberInput.nth(1).fill(String(data.mobile)).catch(() => {});
    if (data.relation && await this.relationCombo.first().isVisible().catch(() => false)) {
      await this.relationCombo.first().click();
      await this.page.keyboard.type(String(data.relation));
      await this.page.keyboard.press('Enter');
    }
  }

  async getApplicantCount() {
    return this.applicantCards.count().catch(() => 0);
  }

  // ── Document upload ────────────────────────────────────────────────────────

  /**
   * Upload all four documents for the currently active applicant block.
   * Accepts absolute file paths only. Missing keys are skipped.
   *
   * @param {{ pan?: string, aadhaarFront?: string, aadhaarBack?: string, photo?: string }} files
   */
  async uploadDocuments(files = {}) {
    const inputs = [
      [this.panDocInput,           files.pan],
      [this.aadhaarFrontDocInput,  files.aadhaarFront],
      [this.aadhaarBackDocInput,   files.aadhaarBack],
      [this.photoDocInput,         files.photo],
    ];
    for (const [input, fpath] of inputs) {
      if (!fpath) continue;
      const present = await input.count().then((n) => n > 0).catch(() => false);
      if (!present) continue;
      await input.setInputFiles(fpath).catch((err) => {
        throw new Error(`Failed to upload ${fpath}: ${err.message}`);
      });
    }
  }

  // ── Submission ─────────────────────────────────────────────────────────────

  /**
   * Click Submit KYC. Caller is responsible for verifying success or
   * validation outcome — this only performs the click.
   */
  async submitKyc() {
    await this.click(this.submitButton.first());
  }

  /**
   * Assert KYC submission succeeded. Looks for the success toast OR a
   * read-only banner (page state after refresh).
   */
  async expectKycSubmitted() {
    const toastVisible = await this.successToast.first().isVisible({ timeout: 8_000 }).catch(() => false);
    if (toastVisible) return;
    const readOnly = await this.kycReadOnlyBanner.first().isVisible({ timeout: 3_000 }).catch(() => false);
    if (!readOnly) {
      throw new Error('KYC submission did not surface success toast or read-only state');
    }
  }

  async expectValidationError(messageRegex) {
    const loc = this.validationError.first();
    await loc.waitFor({ state: 'visible', timeout: 8_000 });
    if (messageRegex) {
      const txt = (await loc.textContent()) || '';
      if (!messageRegex.test(txt)) {
        throw new Error(`Validation error text "${txt}" did not match ${messageRegex}`);
      }
    }
  }
}

module.exports = {
  KycAssistancePage,
  DOC_SLOTS,
  RELATION_ENUM,
  MAX_APPLICANTS,
};
