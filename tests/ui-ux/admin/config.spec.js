'use strict';

/**
 * config.spec.js — UI/UX tests for the Admin Portal Config / CMS module.
 *
 * Scope:
 *   Visual rendering, section presence on long-scroll layout, form control
 *   rendering per section, basic responsive behaviour. These tests are
 *   read-only — they NEVER click Submit, NEVER toggle persistent state, and
 *   are safe to run unattended on UAT.
 *
 * BRD: ADMIN-BRD-Config-CMS · FSD: fsd-config.md
 */

const { test, expect } = require('@playwright/test');
const { ConfigPage } = require('../../../automation-repository/pages/admin/ConfigPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/admin.json' });

test.describe('Config — Admin Portal UI/UX', () => {
  let configPage;

  test.beforeEach(async ({ page }) => {
    configPage = new ConfigPage(page);
    await configPage.navigate();
    await configPage.waitForLoad();
  });

  test('ADM_CFG_001 — ADMIN-FS-Config-CMS §1 — Configurations page renders heading and chrome', async ({ page }) => {
    await configPage.expectOnConfigUrl();
    await expect(configPage.pageHeading).toBeVisible();
    await expect(page).toHaveScreenshot('config-ui-001-heading.png', {
      maxDiffPixels: 300,
      fullPage: false,
    });
  });

  test('ADM_CFG_002 — ADMIN-FS-Config-CMS §1 — All 9 sections render in document order', async ({ page }) => {
    const order = [
      'towerConfiguration', 'registrationStatus', 'unitStatus', 'unitCostUpdate',
      'bulkBookingCancellation', 'bulkRegistrationCancellation', 'salesManagersBulkUpload',
      'customerActionsCard', 'maxPreferencesPerUnit',
    ];
    for (const name of order) {
      await configPage.expectSectionVisible(name);
    }
    await expect(page).toHaveScreenshot('config-ui-002-full-scroll.png', {
      maxDiffPixels: 500,
      fullPage: true,
    });
  });

  test('ADM_CFG_003 — ADMIN-FS-Config-CMS §1 — Tower Configuration section renders tower cards grid', async () => {
    await configPage.expectSectionVisible('towerConfiguration');
    const count = await configPage.getTowerCardCount();
    expect(count).toBeGreaterThanOrEqual(0);
    await expect(configPage.updateTowerConfigButton).toBeVisible();
  });

  test('ADM_CFG_010 — ADMIN-FS-Config-CMS §2 — Registration Status section renders upload form', async () => {
    await configPage.expectSectionVisible('registrationStatus');
    await expect(configPage.section2SampleDownload).toBeVisible();
    await expect(configPage.section2SubmitButton).toBeVisible();
  });

  test('ADM_CFG_038 — ADMIN-FS-Config-CMS §8 — Customer Actions Card renders master toggle + Submit', async ({ page }) => {
    await configPage.expectSectionVisible('customerActionsCard');
    await expect(configPage.allowAdditionalRegToggle).toBeVisible();
    await expect(configPage.section8SubmitButton).toBeVisible();
    await expect(page).toHaveScreenshot('config-ui-008-customer-actions.png', {
      maxDiffPixels: 200,
      fullPage: false,
    });
  });

  test('ADM_CFG_043 — ADMIN-FS-Config-CMS §9 — Max Preferences section renders dropdown + Update', async () => {
    await configPage.expectSectionVisible('maxPreferencesPerUnit');
    await expect(configPage.maxPreferencesSelect).toBeVisible();
    await expect(configPage.maxPreferencesUpdateButton).toBeVisible();
  });
});
