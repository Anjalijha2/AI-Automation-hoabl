'use strict';

// tests/ui-ux/cp/customer-registration.spec.js
// CP Portal — Customer Registration (Home Dashboard) UI/UX specs (scaffolded stubs — implement in Step 4)
const { test, expect } = require('../../../automation-repository/fixtures/base-test');
const { CustomerRegistrationPage } = require('../../../automation-repository/pages/cp/CustomerRegistrationPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/channel-partner.json' });

test.describe('Customer Registration UI/UX — Channel Partner Portal', () => {
  let modulePage;

  test.beforeEach(async ({ page }) => {
    modulePage = new CustomerRegistrationPage(page);
    await modulePage.navigate();
  });

  test('TC_CPREG_UI_002 — CP-BRD §5 Module 1 — Welcome bar displays CP\'s name in green', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.welcomeHeading).toBeVisible();
  });

  test('TC_CPREG_UI_015 — CP-BRD §5 Module 1 / CP-FS §2.1 — Create New Lead widget renders heading + radios + phone input + Create Lead button', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.indianNationalRadio).toBeVisible();
    await expect(modulePage.nriRadio).toBeVisible();
    await expect(modulePage.mobileInput).toBeVisible();
    await expect(modulePage.createLeadButton).toBeVisible();
  });

  test('TC_CPREG_UI_028 — CP-FS §1.4 / CP-BRD §5 Module 1 — Customers table — all 9 columns present in correct order', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.customersHeading).toBeVisible();
  });

  test('TC_CPREG_UI_041 — CP-BRD §6 Navigation — Sidebar navigation — 5 entries (Home, KYC, JBP, Leads, Logout)', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.homeLink).toBeVisible();
    await expect(modulePage.kycLink).toBeVisible();
    await expect(modulePage.jbpLink).toBeVisible();
    await expect(modulePage.leadsLink).toBeVisible();
    await expect(modulePage.logoutButton).toBeVisible();
  });
});
