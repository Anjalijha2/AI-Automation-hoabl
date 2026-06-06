'use strict';

// tests/cross-browser/cp/kyc-assistance.spec.js
// CP Portal — KYC Assistance Cross-Browser Compatibility
// Runs under chromium / firefox / webkit projects (parameterized via playwright.config.js).
// Minimal scope: form loads + Submit-disabled gate behaves identically across engines.
// BRD: CP-FS §1.4 / §1.7-5

const { test, expect } = require('@playwright/test');
const { KycAssistancePage } = require('../../../automation-repository/pages/cp/KycAssistancePage');

test.use({ storageState: 'automation-repository/fixtures/.auth/channel-partner.json' });

test.describe('KYC Assistance — Cross-Browser Compatibility (CP Portal)', () => {
  let modulePage;

  test.beforeEach(async ({ page }) => {
    modulePage = new KycAssistancePage(page);
    await modulePage.navigate();
  });

  test('TC_CPKYC_XBRO_001 — CP-FS §1.4 — KYC form loads correctly across browsers', async () => {
    await expect(modulePage.kycHeading).toBeVisible();
    await expect(modulePage.firmNameInput).toBeVisible();
    await expect(modulePage.businessRegionSelect).toBeVisible();
    await expect(modulePage.submitButton).toBeVisible();
  });

  test('TC_CPKYC_XBRO_002 — CP-FS §1.7-5 — Submit-disabled gate consistent across browsers', async () => {
    expect(await modulePage.isSubmitDisabled()).toBe(true);
  });
});
