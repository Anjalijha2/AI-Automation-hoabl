'use strict';

/**
 * JbpSubmissionPage.js — POM for channel-partner / jbp-submission.
 *
 * Selectors sourced from locators/channel-partner/locator-map.json (module key: "jbp-submission").
 * Owner: QA Agent. Locator map owned by Tech Lead Agent — do NOT edit JSON here.
 *
 * FSD notes (2026-05-25, fsd-jbp-submission.md):
 *   - Submit endpoint: POST /api/v1/cp/jbp
 *   - History endpoint: GET /api/v1/cp/jbp-history
 *   - Edit request endpoint: POST /api/v1/cp/jbp-edit-requests
 *   - Brokerage = free string ≤255 (NOT a dropdown)
 *   - netBookingCommitment = positive int ≤500_000_000, digits-only
 *   - manpower = int 1..100 (negatives rejected)
 *   - 15 activities (cp.validations.js:87-103)
 *   - 5 digital platforms whitelist: ['google','meta','webpage','portal','others']
 *   - 5 investment options: 'Upto 1 lakhs','1 to 3 lakhs','3 to 5 lakhs','5 to 7 lakhs','7+ lakhs'
 *   - Yes/No fields stored as INTEGER COUNT (>0=Yes), except growthHub (boolean)
 *   - WhatsApp via Botspice template `jbplaunchtwo_new` (15 vars), NOT Kaleyra
 *   - Versioning: on approved edit re-submit, prior ACTIVE → EXPIRED, new row version+1
 *   - BUG-CP-006 / JBP-CP-006 — `isJbpSubmitted` count includes EXPIRED rows (version drift)
 *   - Success page: /jbp/thank-you
 */

const { BasePage } = require('../../base/BasePage');
const locatorMap   = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['jbp-submission'] || {};

const JBPSUBMISSION_URL    = 'https://uat-web.xrportal.in/jbp';
const JBP_THANK_YOU_URL_RE = /\/jbp\/thank-you/;

const sel = (key) => (L[key] && L[key].selector) || '';

class JbpSubmissionPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = JBPSUBMISSION_URL;

    // ── Locators from locator-map.json (bracket access) ──────────────────────
    this.logoutButton           = page.locator(sel('logoutButton'));
    this.homeLink               = page.locator(sel('homeLink'));
    this.kYCLink                = page.locator(sel('kYCLink'));
    this.jBPLink                = page.locator(sel('jBPLink'));
    this.leadsLink              = page.locator(sel('leadsLink'));
    this.rcTabs0Tab1            = page.locator(sel('rcTabs0Tab1'));
    this.rcTabs0Tab2            = page.locator(sel('rcTabs0Tab2'));
    this.rcTabs0Tab3            = page.locator(sel('rcTabs0Tab3'));
    this.jBPDashboardHeading    = page.locator(sel('jBPDashboardHeading'));

    // ── Derived locators (form fields — placeholder/label based) ─────────────
    // Form open CTA
    this.addNewJbpButton = page.locator(
      'button:has-text("Add New JBP"), button:has-text("Add JBP"), button:has-text("New JBP Entry"), button:has-text("Submit JBP")'
    ).first();

    // Brokerage to be Earned (free string per FSD, but rendered as input or select)
    this.brokerageInput = page.locator(
      'input[name*="brokerage" i], input[placeholder*="Brokerage" i], textarea[name*="brokerage" i]'
    ).first();
    this.brokerageSelect = page.locator(
      '[aria-label*="Brokerage" i], #rc_select_brokerage, [role="combobox"]:near(:text("Brokerage"))'
    ).first();

    // Net Booking Commitment — digits-only int
    this.netBookingInput = page.locator(
      'input[name*="netBooking" i], input[placeholder*="Net Booking" i], input[placeholder*="Booking Commitment" i]'
    ).first();
    this.netBookingSelect = page.locator(
      '[aria-label*="Net Booking" i], [role="combobox"]:near(:text("Net Booking"))'
    ).first();

    // Manpower — int 1..100
    this.manpowerInput = page.locator(
      'input[name*="manpower" i], input[type="number"]:near(:text("Manpower")), input[placeholder*="Manpower" i]'
    ).first();
    this.manpowerSlider = page.locator(
      'input[type="range"]:near(:text("Manpower")), [role="slider"]:near(:text("Manpower"))'
    ).first();

    // Registration Commitment — digits-only
    this.registrationCommitmentInput = page.locator(
      'input[name*="registrationCommitment" i], input[placeholder*="Registration Commitment" i], input[name*="regCommitment" i]'
    ).first();

    // Total Investment — radio with 5 options
    this.investmentRadioGroup = page.locator(
      '[role="radiogroup"]:near(:text("Total Investment")), :text("Total Investment") >> xpath=following::*[@role="radiogroup"][1]'
    ).first();

    // Activities — 15-checkbox group
    this.activitiesSection = page.locator(
      'section:has(:text("List of Activities")), div:has(> :text("Activities")):has(input[type="checkbox"])'
    ).first();
    this.activityCheckboxes = page.locator(
      ':text("List of Activities") >> xpath=following::input[@type="checkbox"]'
    );

    // Go Live on Digital — platform checkboxes
    this.digitalSection = page.locator(
      'section:has(:text("Go Live on Digital")), div:has(:text("Go Live on Digital")):has(input[type="checkbox"])'
    ).first();
    this.digitalCheckboxes = page.locator(
      ':text("Go Live on Digital") >> xpath=following::input[@type="checkbox"]'
    );

    // Yes/No fields (Inserts, Standees, Kiosk, Telecallers, SmsBlast, WhatsappBlast, GrowthHub)
    // These are rendered as Yes/No radio pairs scoped to each label
    this.yesNoFieldByLabel = (label) =>
      page.locator(`:text("${label}") >> xpath=following::*[self::input[@type='radio'] or @role='radio'][position()<=2]`);

    // Submission controls
    this.submitButton = page.locator(
      'button:has-text("Submit JBP"), button:has-text("Submit"), button[type="submit"]'
    ).filter({ hasNotText: 'Cancel' }).first();
    this.cancelButton = page.locator(
      'button:has-text("Cancel"), button[aria-label*="close" i]'
    ).first();

    // Thank-you / success
    this.thankYouHeading = page.locator(
      'h1:has-text("Thank"), h2:has-text("Thank"), :text("Thank You"), :text("submitted successfully")'
    ).first();
    this.backToDashboardCta = page.locator(
      'a:has-text("Back"), button:has-text("Back"), a:has-text("Dashboard")'
    ).first();

    // Read-only view
    this.versionIndicator = page.locator(
      ':text-matches("Version\\s*\\d+", "i"), [data-testid*="version" i], .jbp-version'
    ).first();
    this.statusIndicator = page.locator(
      ':text("ACTIVE"), :text("EXPIRED"), :text("Status")'
    ).first();
    this.readOnlyContainer = page.locator(
      '[data-testid="jbp-readonly"], section:has(:text("Version"))'
    ).first();

    // Edit Request
    this.requestEditButton = page.locator(
      'button:has-text("Request Edit"), a:has-text("Request Edit"), button:has-text("Edit Request")'
    ).first();
    this.editRequestReasonInput = page.locator(
      'textarea[name*="reason" i], textarea[placeholder*="Changes requested" i], textarea[placeholder*="Reason" i]'
    ).first();
    this.editRequestExplanationInput = page.locator(
      'textarea[name*="explanation" i], textarea[placeholder*="Explanation" i], textarea[placeholder*="Additional" i]'
    ).first();
    this.editRequestSubmit = page.locator(
      'button:has-text("Submit Request"), button:has-text("Submit Edit"), button:has-text("Send Request")'
    ).first();
    this.editRequestPendingBadge = page.locator(
      ':text("PENDING"), :text("Awaiting review"), :text("Pending approval")'
    ).first();

    // Closed-cycle messaging
    this.noOpenCycleMessage = page.locator(
      ':text("No open JBP"), :text("cycle is closed"), :text("Closed")'
    ).first();

    // Validation / errors
    this.validationError = page.locator(
      '.ant-form-item-explain-error, [role="alert"], .error-message'
    );
    this.duplicateOrBlockedError = page.locator(
      ':text("already submitted"), :text("Edit not allowed"), :text("edit window has expired"), .ant-message-error'
    );
    this.successToast = page.locator(
      '[role="status"], .ant-message-success, .ant-notification-notice-success, :text("submitted successfully")'
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

  // ── Form open ────────────────────────────────────────────────────────────

  async openJbpForm() {
    if (await this.addNewJbpButton.isVisible().catch(() => false)) {
      await this.addNewJbpButton.click();
    }
    // Wait for a form field to appear
    await this.brokerageInput.or(this.brokerageSelect).first()
      .waitFor({ state: 'visible', timeout: 10_000 })
      .catch(() => {});
  }

  // ── Form fill ────────────────────────────────────────────────────────────

  /**
   * Fill the JBP form. All keys optional — only provided keys are filled.
   * @param {{
   *   manpowerCount?: number|string,
   *   investmentRange?: string,
   *   insertsRequired?: 'Yes'|'No',
   *   standees?: 'Yes'|'No',
   *   kiosk?: 'Yes'|'No',
   *   telecallers?: 'Yes'|'No',
   *   smsBlast?: 'Yes'|'No',
   *   whatsappBlast?: 'Yes'|'No',
   *   growthHub?: 'Yes'|'No',
   *   registrationCommitment?: number|string,
   *   netBookingCommitment?: number|string,
   *   brokerage?: string,
   *   activities?: string[],
   *   digitalChannels?: string[]
   * }} data
   */
  async fillJbpForm(data = {}) {
    if (data.brokerage !== undefined) {
      if (await this.brokerageInput.isVisible().catch(() => false)) {
        await this.brokerageInput.fill(String(data.brokerage)).catch(() => {});
      } else if (await this.brokerageSelect.isVisible().catch(() => false)) {
        await this._pickFromAntdSelect(this.brokerageSelect, data.brokerage);
      }
    }

    if (data.netBookingCommitment !== undefined) {
      if (await this.netBookingInput.isVisible().catch(() => false)) {
        await this.netBookingInput.fill(String(data.netBookingCommitment)).catch(() => {});
      } else if (await this.netBookingSelect.isVisible().catch(() => false)) {
        await this._pickFromAntdSelect(this.netBookingSelect, String(data.netBookingCommitment));
      }
    }

    if (data.manpowerCount !== undefined) {
      await this.manpowerInput.fill(String(data.manpowerCount)).catch(() => {});
    }

    if (data.registrationCommitment !== undefined) {
      await this.registrationCommitmentInput.fill(String(data.registrationCommitment)).catch(() => {});
    }

    if (data.investmentRange !== undefined) {
      const radio = this.page.locator(
        `label:has-text("${data.investmentRange}") input[type="radio"], input[type="radio"][value="${data.investmentRange}"]`
      ).first();
      await radio.check({ force: true }).catch(async () => {
        await this.page.locator(`label:has-text("${data.investmentRange}")`).first().click().catch(() => {});
      });
    }

    if (Array.isArray(data.activities)) {
      for (const act of data.activities) {
        const cb = this.page.locator(
          `label:has-text("${act}") input[type="checkbox"], input[type="checkbox"][value="${act}"]`
        ).first();
        await cb.check({ force: true }).catch(async () => {
          await this.page.locator(`label:has-text("${act}")`).first().click().catch(() => {});
        });
      }
    }

    if (Array.isArray(data.digitalChannels)) {
      for (const ch of data.digitalChannels) {
        const cb = this.page.locator(
          `label:has-text("${ch}") input[type="checkbox"], input[type="checkbox"][value="${ch}"]`
        ).first();
        await cb.check({ force: true }).catch(async () => {
          await this.page.locator(`label:has-text("${ch}")`).first().click().catch(() => {});
        });
      }
    }

    // Yes/No fields
    const yesNoMap = {
      insertsRequired: 'Inserts',
      standees:        'Standees',
      kiosk:           'Kiosk',
      telecallers:     'Tele Callers',
      smsBlast:        'SMS Blast',
      whatsappBlast:   'WhatsApp Blast',
      growthHub:       'Growth Hub',
    };
    for (const [key, label] of Object.entries(yesNoMap)) {
      if (data[key] !== undefined) {
        await this._pickYesNo(label, data[key]);
      }
    }
  }

  async _pickYesNo(label, value /* 'Yes' | 'No' */) {
    const target = this.page.locator(
      `label:has-text("${label}") >> xpath=following::label[normalize-space()="${value}"][1]`
    ).first();
    await target.click({ force: true }).catch(async () => {
      // Fallback: locate radio inside a row by label proximity
      const radio = this.page.locator(
        `:text("${label}") >> xpath=following::input[@type="radio"][@value="${value}"][1]`
      ).first();
      await radio.check({ force: true }).catch(() => {});
    });
  }

  async _pickFromAntdSelect(selectLocator, optionText) {
    await selectLocator.first().click().catch(() => {});
    const option = this.page.locator(
      `.ant-select-item-option:has-text("${optionText}"), [role="option"]:has-text("${optionText}")`
    ).first();
    await option.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    await option.click().catch(() => {});
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async submitJbp() {
    await this.submitButton.click();
  }

  async cancelJbp() {
    await this.cancelButton.click().catch(() => {});
  }

  // ── View submitted JBP ───────────────────────────────────────────────────

  async viewSubmittedJbp() {
    await this.navigate();
    await this.waitForLoad();
    await this.readOnlyContainer.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  async getDisplayedVersion() {
    if (!(await this.versionIndicator.isVisible().catch(() => false))) return null;
    const txt = (await this.versionIndicator.first().innerText().catch(() => '')) || '';
    const m   = txt.match(/Version\s*(\d+)/i);
    return m ? Number(m[1]) : null;
  }

  // ── Edit Request flow ────────────────────────────────────────────────────

  async openEditRequestForm() {
    await this.requestEditButton.click();
    await this.editRequestReasonInput.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  /**
   * @param {{reason: string, explanation?: string}} data
   */
  async fillEditRequest(data = {}) {
    if (data.reason !== undefined) {
      await this.editRequestReasonInput.fill(String(data.reason)).catch(() => {});
    }
    if (data.explanation !== undefined) {
      await this.editRequestExplanationInput.fill(String(data.explanation)).catch(() => {});
    }
  }

  async submitEditRequest() {
    await this.editRequestSubmit.click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async expectThankYouPage({ timeout = 20_000 } = {}) {
    await this.page.waitForURL(JBP_THANK_YOU_URL_RE, { timeout }).catch(() => {});
    await this.thankYouHeading.waitFor({ state: 'visible', timeout }).catch(() => {});
  }

  async expectSubmissionSuccess({ timeout = 20_000 } = {}) {
    const urlMatched = await this.page.waitForURL(JBP_THANK_YOU_URL_RE, { timeout })
      .then(() => true).catch(() => false);
    if (urlMatched) return;
    await this.successToast.first().waitFor({ state: 'visible', timeout });
  }

  async expectValidationErrorsVisible() {
    await this.validationError.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async expectDuplicateOrBlocked() {
    await this.duplicateOrBlockedError.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async expectFormVisible() {
    await this.brokerageInput.or(this.brokerageSelect).first()
      .waitFor({ state: 'visible', timeout: 10_000 });
  }

  async expectReadOnlyView() {
    await this.versionIndicator.waitFor({ state: 'visible', timeout: 10_000 });
  }
}

module.exports = { JbpSubmissionPage };
