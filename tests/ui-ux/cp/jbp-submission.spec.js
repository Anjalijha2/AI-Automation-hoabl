'use strict';

// tests/ui-ux/cp/jbp-submission.spec.js
// CP Portal — JBP Submission UI/UX specs (scaffolded stubs — implement in Step 4)
const { test, expect } = require('../../../automation-repository/fixtures/base-test');
const { JbpSubmissionPage } = require('../../../automation-repository/pages/cp/JbpSubmissionPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/channel-partner.json' });

test.describe('JBP Submission UI/UX — Channel Partner Portal', () => {
  let modulePage;

  test.beforeEach(async ({ page }) => {
    modulePage = new JbpSubmissionPage(page);
    await modulePage.navigate();
  });

  test('TC_JBP_UI_001 — CP-BRD §3 / CP-FRD Module 3 — Page heading "JBP Dashboard" renders on /jbp', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.jbpDashboardHeading).toBeVisible();
  });

  test('TC_JBP_UI_004 — CP-FRD Module 3 — Three tabs render in expected order', async ({ page }) => {
    // stub — implement in Step 4
    await expect(modulePage.currentCycleTab).toBeVisible();
    await expect(modulePage.historyTab).toBeVisible();
    await expect(modulePage.editRequestsTab).toBeVisible();
  });

  test('TC_JBP_UI_013 — CP-FS-JBP §1.4 (Step 3 — Submit) — Form footer shows "Back to Dashboard" and "Submit" buttons', async ({ page }) => {
    // stub — implement in Step 4
    await modulePage.clickAddNewJbpEntry();
    await expect(modulePage.backToDashboardBtn).toBeVisible();
    await expect(modulePage.submitBtn).toBeVisible();
  });
});
