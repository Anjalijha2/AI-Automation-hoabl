'use strict';

/**
 * CustomerRegistrationPage.js — POM for channel-partner / customer-registration.
 *
 * Selectors sourced from locators/channel-partner/locator-map.json (module key: "customer-registration").
 * Owner: QA Agent. Locator map owned by Tech Lead Agent — do NOT edit JSON here.
 *
 * FSD notes (2026-05-25, fsd-customer-registration.md):
 *   - Capture endpoint: POST /api/v1/cp/cp-user-register
 *   - Customer WhatsApp via Botspice (NOT Kaleyra), template `cp_link_share_latest`
 *   - NRI email template: `nri-cp-referral`
 *   - Registration number format: `GHNG-XXXXXXXXXX` (issued POST-payment, NOT at capture)
 *   - Duplicate check: phone+email scoped per project for the SAME CP (BR-CPR-03)
 *   - brokerId = CP user.id; walkInSourceXrCode = CP hvCode
 */

const { BasePage } = require('../../base/BasePage');
const locatorMap   = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['customer-registration'] || {};

const CUSTOMERREGISTRATION_URL = 'https://uat-web.xrportal.in/dashboard';

const sel = (key) => (L[key] && L[key].selector) || '';

class CustomerRegistrationPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = CUSTOMERREGISTRATION_URL;

    // ── Locators from locator-map.json (bracket access) ──────────────────────
    this.logoutButton                 = page.locator(sel('logoutButton'));
    this.copyLinkButton               = page.locator(sel('copyLinkButton'));
    this.downloadQRCodeButton         = page.locator(sel('downloadQRCodeButton'));
    this.createLeadButton             = page.locator(sel('createLeadButton'));
    this.resetBtn                     = page.locator(sel('resetBtn'));
    this.homeLink                     = page.locator(sel('homeLink'));
    this.kYCLink                      = page.locator(sel('kYCLink'));
    this.jBPLink                      = page.locator(sel('jBPLink'));
    this.leadsLink                    = page.locator(sel('leadsLink'));
    this.r2Input                      = page.locator(sel('r2Input'));
    this.r2Input2                     = page.locator(sel('r2Input2'));
    this.enterMobileNumberInput       = page.locator(sel('enterMobileNumberInput'));
    this.rcSelect0                    = page.locator(sel('rcSelect0'));
    this.searchCustomerInput          = page.locator(sel('searchCustomerInput'));
    this.rcSelect1                    = page.locator(sel('rcSelect1'));
    this.welcomeGPTestNameHeading     = page.locator(sel('welcomeGPTestNameHeading'));
    this.customersHeading             = page.locator(sel('customersHeading'));

    // ── Derived locators (form, table, modal) ────────────────────────────────
    // Form open: "Register Customer" / "Create Lead" CTA opens the form
    this.registerCustomerButton = this.createLeadButton.or(
      page.locator('button:has-text("Register Customer")')
    );

    // Form fields (placeholder-based — backend Yup validators partly disabled,
    // UI placeholders remain the deterministic hook).
    this.firstNameInput  = page.locator(
      'input[placeholder*="First Name" i], input[placeholder*="First name" i]'
    );
    this.lastNameInput   = page.locator(
      'input[placeholder*="Last Name" i], input[placeholder*="Last name" i]'
    );
    this.emailInput      = page.locator('input[placeholder*="Email" i], input[type="email"]');
    this.mobileFormInput = this.r2Input.or(this.enterMobileNumberInput);
    this.countryCodeSelector = this.rcSelect0;
    this.purchasePurposeSelect = this.rcSelect1;
    this.homeLoanIntentSelect  = page.locator('#rc_select_2, [aria-label*="Home Loan" i]');
    this.budgetInput     = page.locator(
      'input[placeholder*="Budget" i], input[name*="budget" i]'
    );
    this.floorMinInput   = page.locator(
      'input[placeholder*="Floor Min" i], input[name*="floorMin" i]'
    );
    this.floorMaxInput   = page.locator(
      'input[placeholder*="Floor Max" i], input[name*="floorMax" i]'
    );
    this.walkInSourceInput = page.locator(
      'input[placeholder*="Walk" i], input[name*="walkIn" i]'
    );

    // T&C / undertaking
    this.undertakingCheckbox = page.locator(
      'input[type="checkbox"][name*="terms" i], input[type="checkbox"][name*="undertaking" i], label:has-text("Terms") input[type="checkbox"]'
    ).first();
    this.undertakingModal = page.locator(
      '[role="dialog"]:has-text("Undertaking"), [role="dialog"]:has-text("Terms")'
    );

    // Submission controls
    this.submitButton = page.locator(
      'button:has-text("Submit"), button:has-text("Register"), button[type="submit"]'
    ).filter({ hasNotText: 'Cancel' }).first();
    this.cancelButton = page.locator(
      'button:has-text("Cancel"), button[aria-label*="close" i]'
    ).first();

    // Feedback
    this.successToast    = page.locator(
      '[role="status"], .ant-message-success, .ant-notification-notice-success, :text("successfully registered")'
    );
    this.duplicateError  = page.locator(
      ':text("already Captured"), :text("already registered"), :text("already completed registration"), .ant-message-error, .ant-notification-notice-error'
    );
    this.validationError = page.locator(
      '.ant-form-item-explain-error, [role="alert"]'
    );

    // Dashboard table
    this.registrationTable = page.locator('table, [role="table"]').first();
    this.tableRow          = this.registrationTable.locator('tbody tr, [role="row"]');
    this.tableHeader       = this.registrationTable.locator('thead th, [role="columnheader"]');
    this.emptyState        = page.locator(
      ':text("No customers"), :text("No data"), .ant-empty'
    );
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle').catch(() => { /* allow flaky idle */ });
  }

  // ── Form open / close ────────────────────────────────────────────────────

  async openRegisterCustomerForm() {
    await this.registerCustomerButton.first().click();
    // Wait for at least one form field to appear
    await this.firstNameInput.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  }

  // ── Form fill ────────────────────────────────────────────────────────────

  /**
   * Fill the customer registration form. All fields optional — only provided
   * keys are filled.
   * @param {{firstName?:string,lastName?:string,mobile?:string,email?:string,
   *          purpose?:string,homeLoanIntent?:string,budget?:string|number,
   *          floorMin?:string|number,floorMax?:string|number,walkInSource?:string,
   *          countryCode?:string}} data
   */
  async fillCustomerDetails(data = {}) {
    if (data.firstName !== undefined) {
      await this.firstNameInput.first().fill(String(data.firstName));
    }
    if (data.lastName !== undefined) {
      await this.lastNameInput.first().fill(String(data.lastName));
    }
    if (data.mobile !== undefined) {
      await this.mobileFormInput.first().fill(String(data.mobile));
    }
    if (data.email !== undefined) {
      await this.emailInput.first().fill(String(data.email));
    }
    if (data.purpose !== undefined) {
      await this._pickFromAntdSelect(this.purchasePurposeSelect, data.purpose);
    }
    if (data.homeLoanIntent !== undefined) {
      await this._pickFromAntdSelect(this.homeLoanIntentSelect, data.homeLoanIntent);
    }
    if (data.budget !== undefined) {
      await this.budgetInput.first().fill(String(data.budget)).catch(() => {});
    }
    if (data.floorMin !== undefined) {
      await this.floorMinInput.first().fill(String(data.floorMin)).catch(() => {});
    }
    if (data.floorMax !== undefined) {
      await this.floorMaxInput.first().fill(String(data.floorMax)).catch(() => {});
    }
    if (data.walkInSource !== undefined) {
      await this.walkInSourceInput.first().fill(String(data.walkInSource)).catch(() => {});
    }
  }

  async _pickFromAntdSelect(selectLocator, optionText) {
    // Antd combobox pattern: click trigger → click option
    await selectLocator.first().click().catch(() => {});
    const option = this.page.locator(
      `.ant-select-item-option:has-text("${optionText}"), [role="option"]:has-text("${optionText}")`
    ).first();
    await option.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    await option.click().catch(() => {});
  }

  // ── Undertaking / T&C ────────────────────────────────────────────────────

  async acceptUndertaking() {
    if (await this.undertakingCheckbox.isVisible().catch(() => false)) {
      const checked = await this.undertakingCheckbox.isChecked().catch(() => false);
      if (!checked) {
        await this.undertakingCheckbox.check({ force: true }).catch(async () => {
          await this.undertakingCheckbox.click({ force: true });
        });
      }
    }
  }

  // ── Submit / cancel ──────────────────────────────────────────────────────

  async submitForm() {
    await this.submitButton.click();
  }

  async cancelForm() {
    await this.cancelButton.click().catch(() => {});
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async expectRegistrationSuccess({ timeout = 20_000 } = {}) {
    await this.successToast.first().waitFor({ state: 'visible', timeout });
  }

  async expectDuplicateError({ timeout = 15_000 } = {}) {
    await this.duplicateError.first().waitFor({ state: 'visible', timeout });
  }

  async expectValidationErrorsVisible() {
    await this.validationError.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async expectFormVisible() {
    await this.firstNameInput.first().waitFor({ state: 'visible', timeout: 15_000 });
  }

  // ── Table helpers ────────────────────────────────────────────────────────

  getRegistrationTable() {
    return this.registrationTable;
  }

  async getTableRowCount() {
    if (!(await this.registrationTable.isVisible().catch(() => false))) return 0;
    return this.tableRow.count();
  }

  async expectCustomerInTable(matchText, { timeout = 15_000 } = {}) {
    const cell = this.tableRow.filter({ hasText: matchText }).first();
    await cell.waitFor({ state: 'visible', timeout });
  }

  async getColumnHeaders() {
    if (!(await this.tableHeader.first().isVisible().catch(() => false))) return [];
    return this.tableHeader.allInnerTexts();
  }
}

module.exports = { CustomerRegistrationPage };
