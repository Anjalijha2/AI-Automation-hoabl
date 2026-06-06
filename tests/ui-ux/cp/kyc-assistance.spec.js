'use strict';

// tests/ui-ux/cp/kyc-assistance.spec.js
// CP Portal — KYC Assistance UI/UX specs
// TC source: manual-qa-repository/01-test-cases/cp/kyc-assistance/TestCases.md (APPROVED 2026-06-07)
// Covers UI-type TCs: UI_001, UI_002, UI_003, UI_035 + visual rendering subsets of FUNC_006, FUNC_024

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
    await expect(modulePage.kycHeading).toBeVisible();
    await expect(page).toHaveScreenshot('uiux-kyc-heading.png', { maxDiffPixels: 200 });
  });

  test('TC_CPKYC_UI_002 — CP-FS §1.4 / CP-FRD Module 4 — Three form sections render with green headers', async ({ page }) => {
    await expect(modulePage.firmDetailsHeader).toBeVisible();
    await expect(modulePage.contactDetailsHeader).toBeVisible();
    await expect(modulePage.additionalDetailsHeader).toBeVisible();
    await expect(page).toHaveScreenshot('uiux-three-sections.png', { maxDiffPixels: 200 });
  });

  test('TC_CPKYC_UI_003 — CP-BRD §3 — Sidebar navigation shows KYC entries', async () => {
    await expect(modulePage.homeLink).toBeVisible();
    await expect(modulePage.kycLink).toBeVisible();
    await expect(modulePage.jbpLink).toBeVisible();
    await expect(modulePage.leadsLink).toBeVisible();
  });

  test('TC_CPKYC_UI_035 — CP-FS §1.5 — KYC Document Upload section header visible', async ({ page }) => {
    await modulePage.documentsHeading.scrollIntoViewIfNeeded();
    await expect(modulePage.documentsHeading).toBeVisible();
    await expect(page).toHaveScreenshot('uiux-documents-section.png', { maxDiffPixels: 200 });
  });

  test('TC_CPKYC_UI_BREGION — CP-FS §1.4 — Business Region dropdown renders 3 options visually', async ({ page }) => {
    // Visual cousin of FUNC_006 — UI-only rendering check
    await modulePage.openBusinessRegion();
    const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(dropdown).toBeVisible();
    await expect(page).toHaveScreenshot('uiux-region-dropdown-open.png', { maxDiffPixels: 200 });
  });

  test('TC_CPKYC_UI_FOOTER — CP-FS §1.8 — Form footer Cancel/Submit visual layout', async ({ page }) => {
    // Visual cousin of FUNC_024 — UI-only footer check
    await modulePage.submitButton.scrollIntoViewIfNeeded();
    await expect(modulePage.cancelButton).toBeVisible();
    await expect(modulePage.submitButton).toBeVisible();
    await expect(page).toHaveScreenshot('uiux-footer-buttons.png', { maxDiffPixels: 200 });
  });
});
