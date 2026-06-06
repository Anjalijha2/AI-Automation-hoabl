'use strict';

// tests/ui-ux/cp/login.spec.js
// CP Portal — Login UI/UX specs (scaffolded stubs — implement in Step 4)
const { test, expect } = require('../../../automation-repository/fixtures/base-test');
const { LoginPage } = require('../../../automation-repository/pages/cp/LoginPage');

// Login UI tests are unauthenticated by design — no storageState.

test.describe('Login UI/UX — Channel Partner Portal', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC_CP_LOGIN_UI_001 — CP-BRD §3 / CP-FS-Login §1.4 — initial login page renders correctly on desktop (1920×900)', async ({ page }) => {
    // stub — implement in Step 4
    const loginPage = new LoginPage(page);
    await expect(loginPage.pageHeading).toBeVisible();
  });

  test('TC_CP_LOGIN_UI_002 — CP-FS-Login §1.4 — Page heading text and level (h2: Growth Partner Login)', async ({ page }) => {
    // stub — implement in Step 4
    const heading = page.getByRole('heading', { name: /growth partner login/i, level: 2 });
    await expect(heading).toBeVisible();
  });

  test('TC_CP_LOGIN_UI_003 — CP-FS-Login §1.5 — T&C and Privacy Policy links present', async ({ page }) => {
    // stub — implement in Step 4
    const loginPage = new LoginPage(page);
    await expect(loginPage.termsLink).toBeVisible();
    await expect(loginPage.privacyPolicyLink).toBeVisible();
  });

  test('TC_CP_LOGIN_UI_032 — CP-FS-Login §1.4 — Footer copyright text rendered on login page', async ({ page }) => {
    // stub — implement in Step 4
    await expect(page.getByText(/Copyright © 2026 House of Abhinandan Lodha\. All Rights Reserved\./)).toBeVisible();
  });
});
