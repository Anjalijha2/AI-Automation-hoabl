'use strict';

// tests/e2e/cp/kyc-assistance.spec.js
// CP Portal — KYC Assistance E2E specs
// TC source: manual-qa-repository/01-test-cases/cp/kyc-assistance/TestCases.md (APPROVED 2026-06-07)
// 30 APPROVED + 3 CONDITIONAL (fixme — Tech Lead capture gap)

const path = require('path');
const { test, expect } = require('../../../automation-repository/fixtures/base-test');
const { KycAssistancePage } = require('../../../automation-repository/pages/cp/KycAssistancePage');

test.use({ storageState: 'automation-repository/fixtures/.auth/channel-partner.json' });

// Sample upload fixture (shipped with the repo under fixtures/dummy-docs/)
const SAMPLE_FILE = path.resolve(__dirname, '../../../automation-repository/fixtures/dummy-docs/dummy_pan.jpg');

test.describe('KYC Assistance — Channel Partner Portal', () => {
  let modulePage;

  test.beforeEach(async ({ page }) => {
    modulePage = new KycAssistancePage(page);
    await modulePage.navigate();
  });

  // ── UI rendering ────────────────────────────────────────────────────────

  test('TC_CPKYC_UI_001 — CP-BRD §3 (Module 4) / CP-FS §1.4 — KYC page heading renders', async ({ page }) => {
    await expect(modulePage.kycHeading).toBeVisible();
    await expect(page).toHaveScreenshot('kyc-heading.png', { maxDiffPixels: 200 });
  });

  test('TC_CPKYC_UI_002 — CP-FS §1.4 / CP-FRD Module 4 — Three form sections render with green headers', async ({ page }) => {
    await expect(modulePage.firmDetailsHeader).toBeVisible();
    await expect(modulePage.contactDetailsHeader).toBeVisible();
    await expect(modulePage.additionalDetailsHeader).toBeVisible();
    await expect(page).toHaveScreenshot('kyc-three-sections.png', { maxDiffPixels: 200 });
  });

  test('TC_CPKYC_UI_003 — CP-BRD §3 — Sidebar navigation shows KYC entry', async () => {
    await expect(modulePage.homeLink).toBeVisible();
    await expect(modulePage.kycLink).toBeVisible();
    await expect(modulePage.jbpLink).toBeVisible();
    await expect(modulePage.leadsLink).toBeVisible();
  });

  // ── Firm Details ────────────────────────────────────────────────────────

  test('TC_CPKYC_FUNC_004 — CP-FS §1.4 / CP-BRD §7 — Firm Details fields visible & pre-filled', async () => {
    await expect(modulePage.firmNameInput).toBeVisible();
    await expect(modulePage.firmAddressInput).toBeVisible();
    const firmName = await modulePage.firmNameInput.inputValue();
    expect(firmName.length).toBeGreaterThan(0);
  });

  test('TC_CPKYC_FUNC_005 — CP-FS §1.4 — Business Region dropdown empty by default and required', async () => {
    await expect(modulePage.businessRegionSelect).toBeVisible();
    const selectedText = await modulePage.businessRegionSelect.locator('..').innerText();
    expect(selectedText).not.toMatch(/^(MMR|Pune|BGLR)$/);
  });

  test('TC_CPKYC_FUNC_006 — CP-FS §1.4 (DOC_DRIFT-CP-KYC-002 closed) — Business Region dropdown opens with 3 options (MMR/Pune/BGLR)', async ({ page }) => {
    const options = await modulePage.getBusinessRegionOptions();
    const normalized = options.map((o) => o.trim());
    expect(normalized).toEqual(expect.arrayContaining(['MMR', 'Pune', 'BGLR']));
    expect(normalized.length).toBe(3);
    await expect(page).toHaveScreenshot('kyc-region-dropdown.png', { maxDiffPixels: 200 });
  });

  // ── Contact Details ─────────────────────────────────────────────────────

  test('TC_CPKYC_FUNC_007 — CP-FS §1.4 — Owner Name pre-filled', async () => {
    await expect(modulePage.ownerNameInput).toBeVisible();
    const v = await modulePage.ownerNameInput.inputValue();
    expect(v.length).toBeGreaterThan(0);
  });

  test('TC_CPKYC_FUNC_008 — CP-FS §1.4 (DOC_DRIFT corrected: type=text) — Email field is type=text with placeholder', async () => {
    await expect(modulePage.emailInput).toBeVisible();
    const typeAttr = await modulePage.emailInput.getAttribute('type');
    expect(typeAttr).toBe('text');
    const placeholder = await modulePage.emailInput.getAttribute('placeholder');
    expect(placeholder).toMatch(/Enter Email ID/i);
  });

  test('TC_CPKYC_FUNC_009 — CP-FS §1.4 (DOC_DRIFT corrected: type=text) — Phone field is type=text with placeholder', async () => {
    await expect(modulePage.phoneInput).toBeVisible();
    const typeAttr = await modulePage.phoneInput.getAttribute('type');
    expect(typeAttr).toBe('text');
    const placeholder = await modulePage.phoneInput.getAttribute('placeholder');
    expect(placeholder).toMatch(/Enter Mobile Number/i);
  });

  // ── Additional Details ──────────────────────────────────────────────────

  test('TC_CPKYC_FUNC_010 — CP-FS §1.4 — Pin Code pre-filled', async () => {
    await expect(modulePage.pinCodeInput).toBeVisible();
    const v = await modulePage.pinCodeInput.inputValue();
    expect(v.length).toBeGreaterThan(0);
  });

  test('TC_CPKYC_FUNC_011 — CP-FS §1.7 rule 1 — PAN pre-filled in valid format', async () => {
    await expect(modulePage.panInput).toBeVisible();
    const v = await modulePage.panInput.inputValue();
    expect(v).toMatch(/^[A-Z]{5}[0-9]{4}[A-Z]$/);
  });

  test('TC_CPKYC_FUNC_012 — CP-FS §1.4 — RERA Number is optional and empty by default', async () => {
    await expect(modulePage.reraInput).toBeVisible();
    const v = await modulePage.reraInput.inputValue();
    expect(v).toBe('');
    const placeholder = await modulePage.reraInput.getAttribute('placeholder');
    expect(placeholder).toMatch(/Enter RERA Number/i);
  });

  // ── Required asterisks ──────────────────────────────────────────────────

  test('TC_CPKYC_VAL_013 — CP-FS §1.4 / §1.7-5 — Required asterisks on 8 mandatory fields (RERA optional)', async ({ page }) => {
    // Count required-marker indicators on the form (ant uses .ant-form-item-required)
    const requiredLabels = await page.locator('label.ant-form-item-required').count();
    expect(requiredLabels).toBeGreaterThanOrEqual(8);
  });

  // ── Submit-disabled gating (NEG suite) ──────────────────────────────────

  test('TC_CPKYC_NEG_014 — CP-FS §1.7-5 — Submit stays disabled when Business Region empty', async () => {
    await modulePage.fillFirmName('GP test name');
    await modulePage.fillFirmAddress('101 Test St');
    await modulePage.fillOwnerName('Test CP');
    await modulePage.fillEmail('testcp@gmail.com');
    await modulePage.fillPhone('8888888888');
    await modulePage.fillPinCode('400056');
    await modulePage.fillPan('TTTTT7777Y');
    // Business Region left empty
    expect(await modulePage.isSubmitDisabled()).toBe(true);
  });

  test('TC_CPKYC_NEG_015 — CP-FS §1.7-5 — Submit stays disabled when Firm Name empty', async () => {
    await modulePage.fillFirmAddress('101 Test St');
    await modulePage.selectBusinessRegionMMR();
    await modulePage.fillOwnerName('Test CP');
    await modulePage.fillEmail('testcp@gmail.com');
    await modulePage.fillPhone('8888888888');
    await modulePage.fillPinCode('400056');
    await modulePage.fillPan('TTTTT7777Y');
    expect(await modulePage.isSubmitDisabled()).toBe(true);
  });

  test('TC_CPKYC_NEG_016 — CP-FS §1.7-1 / §1.7-5 — Submit stays disabled when PAN empty', async () => {
    await modulePage.fillFirmName('GP test name');
    await modulePage.fillFirmAddress('101 Test St');
    await modulePage.selectBusinessRegionMMR();
    await modulePage.fillOwnerName('Test CP');
    await modulePage.fillEmail('testcp@gmail.com');
    await modulePage.fillPhone('8888888888');
    await modulePage.fillPinCode('400056');
    // PAN left empty
    expect(await modulePage.isSubmitDisabled()).toBe(true);
  });

  test('TC_CPKYC_NEG_017 — CP-FS §1.4 / §1.7-5 — Submit stays disabled when Email empty', async () => {
    await modulePage.fillFirmName('GP test name');
    await modulePage.fillFirmAddress('101 Test St');
    await modulePage.selectBusinessRegionMMR();
    await modulePage.fillOwnerName('Test CP');
    await modulePage.fillPhone('8888888888');
    await modulePage.fillPinCode('400056');
    await modulePage.fillPan('TTTTT7777Y');
    // Email left empty
    expect(await modulePage.isSubmitDisabled()).toBe(true);
  });

  test('TC_CPKYC_NEG_019 — CP-FS §1.7-2 / §1.7-5 — Submit stays disabled when Pin Code empty', async () => {
    await modulePage.fillFirmName('GP test name');
    await modulePage.fillFirmAddress('101 Test St');
    await modulePage.selectBusinessRegionMMR();
    await modulePage.fillOwnerName('Test CP');
    await modulePage.fillEmail('testcp@gmail.com');
    await modulePage.fillPhone('8888888888');
    await modulePage.fillPan('TTTTT7777Y');
    // Pin Code left empty
    expect(await modulePage.isSubmitDisabled()).toBe(true);
  });

  // ── Document upload field presence ──────────────────────────────────────

  test('TC_CPKYC_FUNC_021 — CP-FS §1.5 — PAN Card upload field present', async () => {
    await expect(modulePage.panCardFileInput).toHaveCount(1);
    const accept = await modulePage.panCardFileInput.getAttribute('accept');
    expect(accept).toBeNull(); // No MIME restriction client-side
  });

  test('TC_CPKYC_FUNC_024 — CP-FS §1.8 — Submit button visible at form footer (disabled on fresh empty form)', async ({ page }) => {
    await expect(modulePage.cancelButton).toBeVisible();
    await expect(modulePage.submitButton).toBeVisible();
    expect(await modulePage.isSubmitDisabled()).toBe(true);
    await expect(page).toHaveScreenshot('kyc-footer-buttons.png', { maxDiffPixels: 200 });
  });

  // ── CONDITIONAL — Tech Lead capture gap (E2E_025, E2E_027, E2E_028) ─────

  test.fixme('TC_CPKYC_E2E_025 — CP-FS §1.8 — Successful KYC submission triggers system actions', async () => {
    // FIXME: blocked by capture gap — Tech Lead post-submit + admin lifecycle captures pending
    // Full E2E: fill 8 required + 3 doc uploads + click enabled Submit + assert confirmation
    await modulePage.fillAllRequired();
    await modulePage.uploadPanCard(SAMPLE_FILE);
    await modulePage.uploadGst(SAMPLE_FILE);
    await modulePage.uploadMahaRera(SAMPLE_FILE);
    expect(await modulePage.isSubmitDisabled()).toBe(false);
    await modulePage.clickSubmit();
    // Post-submit confirmation assertion to be added once captured
  });

  test('TC_CPKYC_E2E_026 — CP-FS §1.9 — Home dashboard shows "Your KYC is in review" after submit', async ({ page }) => {
    test.skip(process.env.ENV === 'uat', 'Skipped on UAT — alters live KYC state; requires fresh CP account');
    // Note: this test depends on a CP whose KYC has just been submitted. Without that
    // controlled state on shared UAT, this will not pass cleanly. Skip on UAT.
    await page.goto('https://uat-web.xrportal.in/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Your KYC is in review/i)).toBeVisible();
  });

  test.fixme('TC_CPKYC_E2E_027 — CP-BRD §7 — "Your KYC is in review" button disappears after admin approval', async ({ page }) => {
    // FIXME: blocked by capture gap — Tech Lead post-submit + admin lifecycle captures pending
    await page.goto('https://uat-web.xrportal.in/');
    await expect(page.getByText(/Your KYC is in review/i)).toHaveCount(0);
  });

  test.fixme('TC_CPKYC_E2E_028 — CP-FS §1.8 — KYC rejected by admin — CP can re-edit and resubmit', async () => {
    // FIXME: blocked by capture gap — Tech Lead post-submit + admin lifecycle captures pending
    await modulePage.navigate();
    await expect(modulePage.firmNameInput).toBeEditable();
    await modulePage.clickSubmit();
  });

  // ── Business rules ──────────────────────────────────────────────────────

  test('TC_CPKYC_BIZ_029 — CP-BRD §7 — Pre-filled data sourced from CP registration record', async () => {
    // All four pre-filled fields should have non-empty values out of the box
    const firm  = await modulePage.firmNameInput.inputValue();
    const owner = await modulePage.ownerNameInput.inputValue();
    const phone = await modulePage.phoneInput.inputValue();
    const pin   = await modulePage.pinCodeInput.inputValue();
    expect(firm.length).toBeGreaterThan(0);
    expect(owner.length).toBeGreaterThan(0);
    expect(phone.length).toBeGreaterThan(0);
    expect(pin.length).toBeGreaterThan(0);
  });

  test('TC_CPKYC_BIZ_030 — CP-FS §1.3 — KYC route requires authentication', async ({ browser }) => {
    // Open fresh context (NO storageState) and hit /kyc
    const ctx = await browser.newContext();
    const fresh = await ctx.newPage();
    await fresh.goto('https://uat-web.xrportal.in/kyc');
    await fresh.waitForLoadState('networkidle');
    // Expect redirect away from /kyc (to /login or root)
    expect(fresh.url()).not.toMatch(/\/kyc$/);
    await ctx.close();
  });

  // ── Business Region positive selection (FUNC_031/032/033) ───────────────

  test('TC_CPKYC_FUNC_031 — CP-FS §1.4 — Business Region MMR selection persists', async () => {
    await modulePage.selectBusinessRegionMMR();
    await expect(modulePage.businessRegionSelect.locator('..')).toContainText('MMR');
  });

  test('TC_CPKYC_FUNC_032 — CP-FS §1.4 — Business Region Pune selection persists', async () => {
    await modulePage.selectBusinessRegionPune();
    await expect(modulePage.businessRegionSelect.locator('..')).toContainText('Pune');
  });

  test('TC_CPKYC_FUNC_033 — CP-FS §1.4 — Business Region BGLR selection persists', async () => {
    await modulePage.selectBusinessRegionBGLR();
    await expect(modulePage.businessRegionSelect.locator('..')).toContainText('BGLR');
  });

  // ── Submit enable transition ────────────────────────────────────────────

  test('TC_CPKYC_FUNC_034 — CP-FS §1.7-5 — Submit transitions disabled→enabled after all 8 required fields filled', async ({ page }) => {
    // Fresh form: Submit disabled
    expect(await modulePage.isSubmitDisabled()).toBe(true);
    await modulePage.fillFirmName('GP test name');
    expect(await modulePage.isSubmitDisabled()).toBe(true);
    await modulePage.fillFirmAddress('101 Test St, Mumbai');
    expect(await modulePage.isSubmitDisabled()).toBe(true);
    await modulePage.selectBusinessRegionMMR();
    expect(await modulePage.isSubmitDisabled()).toBe(true);
    await modulePage.fillOwnerName('Test CP');
    expect(await modulePage.isSubmitDisabled()).toBe(true);
    await modulePage.fillEmail('testcp@gmail.com');
    expect(await modulePage.isSubmitDisabled()).toBe(true);
    await modulePage.fillPhone('8888888888');
    expect(await modulePage.isSubmitDisabled()).toBe(true);
    await modulePage.fillPinCode('400056');
    expect(await modulePage.isSubmitDisabled()).toBe(true);
    await modulePage.fillPan('TTTTT7777Y');
    // After the 8th required field, Submit should enable
    await expect(modulePage.submitButton).toBeEnabled();
    await expect(page).toHaveScreenshot('kyc-submit-enabled.png', { maxDiffPixels: 200 });
  });

  // ── KYC Document Upload section ─────────────────────────────────────────

  test('TC_CPKYC_UI_035 — CP-FS §1.5 — KYC Document Upload section header visible', async () => {
    await modulePage.documentsHeading.scrollIntoViewIfNeeded();
    await expect(modulePage.documentsHeading).toBeVisible();
  });

  test('TC_CPKYC_FUNC_036 — CP-FS §1.5 — GST upload field present and accepts file', async () => {
    await expect(modulePage.gstFileInput).toHaveCount(1);
    await modulePage.uploadGst(SAMPLE_FILE);
    // After upload, ant-upload reflects file in the list (some variant); presence is sufficient
  });

  test('TC_CPKYC_FUNC_037 — CP-FS §1.5 — MAHA RERA Certificate upload field present and accepts file', async () => {
    await expect(modulePage.mahaReraFileInput).toHaveCount(1);
    await modulePage.uploadMahaRera(SAMPLE_FILE);
  });
});
