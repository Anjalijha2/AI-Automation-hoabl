'use strict';

// tests/ui-ux/cp/leads-management.spec.js
// CP Portal — Leads Management UI/UX specs (scaffolded stubs — implement in Step 4)
const { test, expect } = require('../../../automation-repository/fixtures/base-test');
const { LeadsManagementPage } = require('../../../automation-repository/pages/cp/LeadsManagementPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/channel-partner.json' });

test.describe('Leads Management UI/UX — Channel Partner Portal', () => {
  let modulePage;

  test.beforeEach(async ({ page }) => {
    modulePage = new LeadsManagementPage(page);
    await modulePage.navigate();
  });

  test('TC_LEADS_UI_001 — CP-FS-Leads §1.1, §1.4 — Page loads with "Leads" heading and table', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.leadsHeading).toBeVisible();
  });

  test('TC_LEADS_UI_002 — CP-FS-Leads §1.4 — Leads table column structure matches spec', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.leadsHeading).toBeVisible();
    // Full column header assertions implemented in Step 4
  });

  test('TC_LEADS_UI_018 — CP-FS-Leads §1.1 — Sidebar navigation marks "Leads" as active on /leads', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.homeLink).toBeVisible();
    await expect(modulePage.kycLink).toBeVisible();
    await expect(modulePage.jbpLink).toBeVisible();
    await expect(modulePage.leadsLink).toBeVisible();
  });
});
