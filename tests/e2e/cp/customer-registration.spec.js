'use strict';

// tests/e2e/cp/customer-registration.spec.js
// CP Portal — Customer Registration (Home Dashboard) E2E specs (scaffolded stubs — implement in Step 4)
const { test, expect } = require('../../../automation-repository/fixtures/base-test');
const { CustomerRegistrationPage } = require('../../../automation-repository/pages/cp/CustomerRegistrationPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/channel-partner.json' });

test.describe('Customer Registration — Channel Partner Portal', () => {
  let modulePage;

  test.beforeEach(async ({ page }) => {
    modulePage = new CustomerRegistrationPage(page);
    await modulePage.navigate();
  });

  test('TC_CPREG_UI_001 — CP-BRD §5 Module 1 / CP-FS §1.1 — Dashboard loads with full layout post-login', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.welcomeHeading).toBeVisible();
    await expect(modulePage.customersHeading).toBeVisible();
  });

  test('TC_CPREG_FUNC_009 — CP-BRD §8 — Copy link button copies referral URL to clipboard', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.copyLinkButton).toBeVisible();
  });

  test('TC_CPREG_E2E_024 — CP-BRD §5 Workflow steps 7-9 / CP-FS §2.5 — Create Lead happy path — valid 10-digit mobile submits successfully', async ({ page }) => {
    // stub — implement in Step 4
    await modulePage.selectIndianNational();
    await modulePage.fillLeadMobile('9000000001');
    // Assertion deferred — depends on backend duplicate state; implement in Step 4.
    await expect(modulePage.createLeadButton).toBeVisible();
  });

  test('TC_CPREG_NEG_020 — CP-FS §2.4 Validation 1 / CP-BRD §5 Module 1 — Create Lead with empty mobile field — no API call, no submission', async ({ page }) => {
    // stub — implement in Step 4
    await modulePage.submitCreateLead();
    await expect(page).toHaveURL(/\/(dashboard|\/)/);
  });

  test('TC_CPREG_FUNC_032 — CP-FS §1.1 — Search Customer filters table by matching name "Sanket"', async ({ page }) => {
    // stub — implement in Step 4
    await modulePage.searchCustomer('Sanket');
    await expect(modulePage.customersHeading).toBeVisible();
  });
});
