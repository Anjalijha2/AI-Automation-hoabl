'use strict';

// tests/ui-ux/cp/kyc-assistance.spec.js
// CP Portal — KYC Assistance UI/UX specs (scaffolded stubs — implement in Step 4)
const { test, expect } = require('../../../automation-repository/fixtures/base-test');
const { KycAssistancePage } = require('../../../automation-repository/pages/cp/KycAssistancePage');

test.use({ storageState: 'automation-repository/fixtures/.auth/channel-partner.json' });

test.describe('KYC Assistance UI/UX — Channel Partner Portal', () => {
  let modulePage;

  test.beforeEach(async ({ page }) => {
    modulePage = new KycAssistancePage(page);
    await modulePage.navigate();
  });

  test('TC_CPKYC_UI_001 — CP-BRD §3 (Module 4) — KYC page heading renders', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.kycHeading).toBeVisible();
  });

  test('TC_CPKYC_UI_002 — CP-FRD Module 4 — Three form sections render with green headers', async ({ page }) => {
    // stub — implement in Step 4
    await expect(page.getByText(/firm details/i).first()).toBeVisible();
    await expect(page.getByText(/contact details/i).first()).toBeVisible();
    await expect(page.getByText(/additional details/i).first()).toBeVisible();
  });

  test('TC_CPKYC_UI_003 — CP-BRD §3 — Sidebar navigation shows KYC as active', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.homeLink).toBeVisible();
    await expect(modulePage.kycLink).toBeVisible();
    await expect(modulePage.jbpLink).toBeVisible();
    await expect(modulePage.leadsLink).toBeVisible();
  });
});
