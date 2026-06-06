'use strict';

// automation-repository/pages/cp/KycAssistancePage.js
// CP Portal — KYC Assistance (CP self-KYC onboarding)
// Route: https://uat-web.xrportal.in/kyc
//
// DOM REALITY (from /test-results/cp-kyc-assistance-*/error-context.md):
//   For a CP whose KYC has already been submitted (e.g. 8888888888 — current
//   `channel-partner.json` session), the /kyc page renders the FORM IN
//   LOCKED STATE: every text input has `[disabled]` except `Enter RERA Number`
//   and the `Business Region` combobox. Submit button is rendered but `[disabled]`.
//   Document "upload" widgets are NOT `<input type="file">` — they are plain
//   `<div>` blocks containing the text `Upload` and an icon. Real upload requires
//   investigating the widget's hidden mechanism (file picker / drag-drop / hidden input).
//
// For a fresh CP whose KYC has not yet been submitted (e.g. 9999999991 — see
// `automation-repository/fixtures/.auth/channel-partner-incomplete.json`, prepared
// by `auth-setup-cp-incomplete` in auth.setup.js), the KYC surface is rendered
// inside an antd RegisterCp Modal at portal root `/`, not at `/kyc`.
//
// Locator strategy: this POM scopes each form input by the nearest section
// heading (`h4`) to disambiguate the two `placeholder="Enter Name"` textboxes
// (Firm Name vs Growth Partner Owner Name). All locators target observed DOM
// — placeholder text for inputs, h2/h4 headings for sections, role-based for
// buttons. Locator-map.json keys retained for sidebar/heading/buttons only.
//
// File-upload limitations:
//   uploadPanCard / uploadGst / uploadMahaRera are intentionally NOT implemented.
//   The widgets are <div> elements, not <input type="file">. setInputFiles will
//   not work. Resolution requires Tech Lead Agent to capture widget behaviour
//   (does click open native file dialog? does it use a hidden input mounted
//   on click? is it drag-drop based?). Until then, specs assert widget
//   VISIBILITY only via `panCardUpload` / `gstUpload` / `mahaReraUpload`.

const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['kyc-assistance'];

class KycAssistancePage extends BasePage {
  constructor(page) {
    super(page);

    // ── Page heading & section headings (h2 / h4 by text) ──────────────────
    this.pageHeading             = page.locator('h2', { hasText: 'KYC' }).first();
    // Backwards-compatible alias retained for any spec still referencing kycHeading
    this.kycHeading              = this.pageHeading;
    this.firmDetailsHeader       = page.locator('h4', { hasText: 'Firm Details' });
    this.contactDetailsHeader    = page.locator('h4', { hasText: 'Contact Details' });
    this.additionalDetailsHeader = page.locator('h4', { hasText: 'Additional Details' });
    this.documentsHeading        = page.locator('h4', { hasText: 'KYC Document Upload' });

    // ── Section "cards" — used as scoping parents for ambiguous inputs ─────
    // Each section heading is followed by its inputs inside a common ancestor.
    // We use `locator('xpath=..').locator('xpath=..')` to climb 2 levels to the
    // section container, then scope inputs within.
    this.firmDetailsSection    = this.firmDetailsHeader.locator('xpath=..');
    this.contactDetailsSection = this.contactDetailsHeader.locator('xpath=..');
    this.additionalSection     = this.additionalDetailsHeader.locator('xpath=..');
    this.documentsSection      = this.documentsHeading.locator('xpath=..');

    // ── Form inputs — use Playwright getByPlaceholder (works on any element type)
    // Note: "Enter Name" appears TWICE (Firm Name, Owner Name) — disambiguate via .nth()
    // based on DOM order (Firm first, Owner second).
    this.firmNameInput    = page.getByPlaceholder('Enter Name').nth(0);
    this.ownerNameInput   = page.getByPlaceholder('Enter Name').nth(1);
    this.firmAddressInput = page.getByPlaceholder('Enter Full Address');
    this.emailInput       = page.getByPlaceholder('Enter Email ID');
    this.phoneInput       = page.getByPlaceholder('Enter Mobile Number');
    this.pinCodeInput     = page.getByPlaceholder('Enter Pin Code');
    this.panInput         = page.getByPlaceholder('Enter PAN Number');
    this.reraInput        = page.getByPlaceholder('Enter RERA Number');

    // ── Business Region combobox ───────────────────────────────────────────
    // Locator-map key `rcSelect0` resolves to `#rc_select_0` — keep using that
    // as it is the actual antd Select internal element. Wrap parent div used
    // for "contains selected text" assertions.
    this.businessRegionSelect = page.locator(L.rcSelect0.selector);

    // ── KYC Document Upload widgets (NOT <input type=file>) ────────────────
    // 3 "Upload" texts exist on /kyc — one per doc row (PAN / GST / MAHA RERA).
    // Use page-level getByText scoped by index (DOM order is stable).
    this.panCardUpload   = page.getByText('Upload', { exact: true }).nth(0);
    this.gstUpload       = page.getByText('Upload', { exact: true }).nth(1);
    this.mahaReraUpload  = page.getByText('Upload', { exact: true }).nth(2);

    // Backwards-compatible aliases (specs may still reference *FileInput names).
    // These now point at the visible upload widget, NOT a file input.
    this.panCardFileInput  = this.panCardUpload;
    this.gstFileInput      = this.gstUpload;
    this.mahaReraFileInput = this.mahaReraUpload;

    // ── Footer buttons ─────────────────────────────────────────────────────
    this.cancelButton = page.locator('button', { hasText: 'Cancel' });
    this.submitButton = page.locator('button', { hasText: 'Submit' });

    // ── Sidebar nav (role-based — DOM shows menuitem role) ─────────────────
    this.homeLink  = page.getByRole('menuitem', { name: 'Home' });
    this.kycLink   = page.getByRole('menuitem', { name: 'KYC' });
    this.jbpLink   = page.getByRole('menuitem', { name: 'JBP' });
    this.leadsLink = page.getByRole('menuitem', { name: 'Leads' });
    this.logoutButton = page.locator(L.logoutButton.selector).first();
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  async navigate() {
    await this.page.goto('https://uat-web.xrportal.in/kyc');
    await this.page.waitForLoadState('networkidle');
  }

  // ── Form fillers (atomic; one logical action each) ──────────────────────
  // WARNING: when run against a completed-KYC CP session (8888888888), all
  // inputs except RERA + Business Region are `[disabled]` and `fill()` will
  // throw. Specs that need to exercise fill() must use the incomplete-CP
  // fixture (channel-partner-incomplete.json) per-test.
  async fillFirmName(value)     { await this.fill(this.firmNameInput,    value); }
  async fillFirmAddress(value)  { await this.fill(this.firmAddressInput, value); }
  async fillOwnerName(value)    { await this.fill(this.ownerNameInput,   value); }
  async fillEmail(value)        { await this.fill(this.emailInput,       value); }
  async fillPhone(value)        { await this.fill(this.phoneInput,       value); }
  async fillPinCode(value)      { await this.fill(this.pinCodeInput,     value); }
  async fillPan(value)          { await this.fill(this.panInput,         value); }
  async fillRera(value)         { await this.fill(this.reraInput,        value); }

  // ── Business Region dropdown ────────────────────────────────────────────
  async openBusinessRegion() {
    // Click the antd Select wrapper (the inner #rc_select_0 combobox is hidden
    // and not directly clickable). Use the closest .ant-select container.
    const wrapper = this.businessRegionSelect.locator('xpath=ancestor::div[contains(@class,"ant-select")][1]');
    await wrapper.click();
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first()
      .waitFor({ state: 'visible' });
  }

  async selectBusinessRegionMMR() {
    await this.openBusinessRegion();
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^MMR$/ }).first().click();
  }

  async selectBusinessRegionPune() {
    await this.openBusinessRegion();
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^Pune$/ }).first().click();
  }

  async selectBusinessRegionBGLR() {
    await this.openBusinessRegion();
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: /^BGLR$/ }).first().click();
  }

  async getBusinessRegionOptions() {
    await this.openBusinessRegion();
    return this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .allTextContents();
  }

  // ── Document uploads ────────────────────────────────────────────────────
  // TODO(KYC-UPLOAD): the upload widgets are <div> blocks, NOT <input type=file>.
  // setInputFiles() cannot work on them. Real upload requires Tech Lead Agent
  // to capture widget behaviour and either:
  //   (a) expose the hidden file input (if it's mounted-on-click) in
  //       locators/channel-partner/locator-map.json under explicit keys
  //       panCardFileInput / gstFileInput / mahaReraFileInput, OR
  //   (b) document a drag-drop sequence using page.dispatchEvent + DataTransfer.
  // Until then these methods throw to fail-loud rather than silently no-op.
  async uploadPanCard(_filePath) {
    throw new Error(
      'uploadPanCard() not implemented — KYC upload widget is a <div>, not <input type="file">. ' +
      'See KycAssistancePage.js TODO(KYC-UPLOAD).'
    );
  }
  async uploadGst(_filePath) {
    throw new Error(
      'uploadGst() not implemented — see KycAssistancePage.js TODO(KYC-UPLOAD).'
    );
  }
  async uploadMahaRera(_filePath) {
    throw new Error(
      'uploadMahaRera() not implemented — see KycAssistancePage.js TODO(KYC-UPLOAD).'
    );
  }

  // ── Submit / Cancel helpers ─────────────────────────────────────────────
  async isSubmitDisabled() {
    return this.submitButton.isDisabled();
  }

  async clickSubmit() {
    await this.click(this.submitButton);
  }

  async submit() {
    await this.clickSubmit();
  }

  async clickCancel() {
    await this.click(this.cancelButton);
  }

  // ── Composite: fill all 8 required text fields (Business Region as MMR) ──
  async fillAllRequired({
    firmName     = 'GP test name',
    firmAddress  = '101 Test Street, Mumbai',
    ownerName    = 'Test CP',
    email        = 'testcp@gmail.com',
    phone        = '8888888888',
    pinCode      = '400056',
    pan          = 'TTTTT7777Y',
    region       = 'MMR',
  } = {}) {
    await this.fillFirmName(firmName);
    await this.fillFirmAddress(firmAddress);
    await this.fillOwnerName(ownerName);
    await this.fillEmail(email);
    await this.fillPhone(phone);
    await this.fillPinCode(pinCode);
    await this.fillPan(pan);
    if (region === 'MMR')  await this.selectBusinessRegionMMR();
    if (region === 'Pune') await this.selectBusinessRegionPune();
    if (region === 'BGLR') await this.selectBusinessRegionBGLR();
  }
}

module.exports = { KycAssistancePage };
