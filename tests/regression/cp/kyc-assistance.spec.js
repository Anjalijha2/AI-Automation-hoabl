'use strict';

// tests/regression/cp/kyc-assistance.spec.js
// CP Portal — KYC Assistance Regression
// Critical-path subset: form load (UI_001), Submit disabled gate (FUNC_034),
// Business Region select (FUNC_031), document upload (FUNC_036)
// BRD: CP-BRD §3 / CP-FS-KYC-Assistance

const path = require('path');
const { test, expect } = require('@playwright/test');
const { KycAssistancePage } = require('../../../automation-repository/pages/cp/KycAssistancePage');

test.use({ storageState: 'automation-repository/fixtures/.auth/channel-partner.json' });

const SAMPLE_FILE = path.resolve(__dirname, '../../../automation-repository/fixtures/dummy-docs/dummy_pan.jpg');

test.describe('KYC Assistance — Channel Partner Portal Regression', () => {
  let modulePage;

  test.beforeEach(async ({ page }) => {
    modulePage = new KycAssistancePage(page);
    await modulePage.navigate();
  });

  test('TC_CPKYC_REG_001 — CP-BRD §3 — Form loads cleanly on direct URL navigation', async () => {
    await expect(modulePage.kycHeading).toBeVisible();
    await expect(modulePage.firmDetailsHeader).toBeVisible();
    await expect(modulePage.contactDetailsHeader).toBeVisible();
    await expect(modulePage.additionalDetailsHeader).toBeVisible();
    await expect(modulePage.submitButton).toBeVisible();
  });

  test('TC_CPKYC_REG_002 — CP-FS §1.7-5 — Submit remains disabled on a fresh empty form', async () => {
    expect(await modulePage.isSubmitDisabled()).toBe(true);
  });

  test('TC_CPKYC_REG_003 — CP-FS §1.4 — Business Region MMR selection persists across regression run', async () => {
    await modulePage.selectBusinessRegionMMR();
    await expect(modulePage.businessRegionSelect.locator('..')).toContainText('MMR');
  });

  test('TC_CPKYC_REG_004 — CP-FS §1.5 — PAN Card upload field accepts a file (regression)', async () => {
    await expect(modulePage.panCardFileInput).toHaveCount(1);
    await modulePage.uploadPanCard(SAMPLE_FILE);
    // Regression baseline: upload call succeeds without exception
  });
});
