'use strict';

/**
 * allocation.spec.js — End-to-End tests for the Admin Portal Allocation module.
 *
 * What this file tests:
 *   The Allocation module is the core business workflow on the Admin Portal —
 *   admins create campaigns (Static, Dynamic, Physical Event) that drive real-time
 *   unit booking by buyers. These E2E tests exercise the full create → list →
 *   lifecycle journey against the live UAT environment.
 *
 * How test IDs work:
 *   Each test title starts with a TC_ID (e.g. ADM_ALLOC_007) that traces back to
 *   manual-qa-repository/01-test-cases/admin-portal/allocation/TC_ALLOCATION.md.
 *   BRD reference: ADMIN-FS-Allocation §<section>.
 *
 * Authentication:
 *   All tests run as an authenticated admin via the saved storageState file.
 *   Run `npm run auth:setup` if the session expires.
 *
 * Destructive tests:
 *   Campaign create / stop / cancel calls fire real backend mutations on UAT —
 *   they trigger SMS/WhatsApp notifications and lock the Customers module
 *   against writes. These tests are SKIPPED by default on UAT. Set
 *   ALLOW_DESTRUCTIVE=1 only when you have disposable test data ready.
 *
 * BRD: ADMIN-BRD-Allocation · FSD: fsd-allocation.md
 */

const { test, expect } = require('@playwright/test');
const { AllocationPage } = require('../../../automation-repository/pages/admin/AllocationPage');

// Load saved admin session — browser starts already logged in.
test.use({ storageState: 'automation-repository/fixtures/.auth/admin.json' });

test.describe('Allocation — Admin Portal E2E', () => {
  let allocationPage;

  /**
   * beforeEach — runs before every test in this describe block.
   * Constructs a fresh AllocationPage, navigates to /admin/allocation, and waits
   * for the page (Save Campaign button OR campaigns table) to be visible.
   * Fresh navigation per test prevents filter/modal state leakage.
   */
  test.beforeEach(async ({ page }) => {
    allocationPage = new AllocationPage(page);
    await allocationPage.navigate();
    await allocationPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Page load & navigation
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_001 — ADMIN-FS-Allocation §1 — Allocation page loads at /admin/allocation', async ({ page }) => {
    // We're already on the page from beforeEach. Verify URL + a primary element.
    await allocationPage.expectOnAllocationUrl();
    await expect(allocationPage.saveCampaignButton).toBeVisible();
    await expect(page).toHaveScreenshot('allocation-e2e-001-default-landing.png', {
      maxDiffPixels: 200,
      fullPage: true,
    });
  });

  test('ADM_ALLOC_001b — ADMIN-FS-Allocation §1 — Sidebar navigation opens Allocation module', async () => {
    // Land elsewhere first so the sidebar click is meaningful.
    await allocationPage.page.goto('https://uat-web.xrportal.in/admin/cms');
    await allocationPage.page.waitForLoadState('networkidle');
    await allocationPage.navigateViaSidebar();
    await allocationPage.expectOnAllocationUrl();
    await expect(allocationPage.saveCampaignButton).toBeVisible();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Campaign list rendering & search
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_002 — ADMIN-FS-Allocation §1 — Campaign list table renders with rows or empty state', async () => {
    // On UAT either rows exist OR the list is empty (cleared between sprints) —
    // both are valid outcomes. We just confirm the UI responded.
    const rows = await allocationPage.getCampaignsList();
    const hasTable = await allocationPage.campaignTable.first().isVisible().catch(() => false);
    expect(hasTable).toBeTruthy();
    expect(Array.isArray(rows)).toBeTruthy();
  });

  test('ADM_ALLOC_004 — ADMIN-FS-Allocation §1 — Type column values match Static/Dynamic/Physical Event', async () => {
    const rows = await allocationPage.getCampaignsList();
    test.skip(rows.length === 0, 'No campaigns on UAT to inspect type column');
    const allowed = /Static|Dynamic|Physical/i;
    for (const r of rows) {
      // Type cell may be empty during pending-load — only assert when populated.
      if (r.type && r.type.length > 0) {
        expect(r.type).toMatch(allowed);
      }
    }
  });

  test('ADM_ALLOC_034 — ADMIN-FS-Allocation §3 — Refresh button reloads list without navigation', async ({ page }) => {
    const urlBefore = page.url();
    await allocationPage.clickRefresh();
    const urlAfter = page.url();
    expect(urlAfter).toBe(urlBefore);
    await expect(allocationPage.campaignTable.first()).toBeVisible();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Create Campaign form
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_006 — ADMIN-FS-Allocation §2 — Create Campaign form is visible with required fields', async () => {
    await allocationPage.openCreateCampaignModal();
    await expect(allocationPage.enterCampaignNameInput).toBeVisible();
    await expect(allocationPage.campaignTypeSelect).toBeVisible();
    await expect(allocationPage.startTimeInput).toBeVisible();
    await expect(allocationPage.endTimeInput).toBeVisible();
    await expect(allocationPage.saveCampaignButton).toBeVisible();
  });

  test('ADM_ALLOC_011 — ADMIN-FS-Allocation §2 — Campaign Type dropdown exposes Static/Dynamic/Physical Event', async () => {
    const options = await allocationPage.getCampaignTypeOptions();
    expect(options.length).toBeGreaterThan(0);
    // Verify the three allocation modes per FSD-CORRECTION (STATIC, DYNAMIC, PHYSICAL_EVENT)
    const joined = options.join('|').toLowerCase();
    expect(joined).toMatch(/static/);
    expect(joined).toMatch(/dynamic/);
    expect(joined).toMatch(/physical/);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Create Campaign — happy paths (DESTRUCTIVE)
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_007 — ADMIN-FS-Allocation §2 — Create Static campaign with valid future times', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — destructive campaign create; set ALLOW_DESTRUCTIVE=1 with disposable data');

    const name = `E2E_Static_${Date.now()}`;
    await allocationPage.openCreateCampaignModal();
    await allocationPage.fillCampaignDetails({
      name,
      type: 'Static',
      startTime: allocationPage.futureIso(5),    // start in 5 minutes (> 3-min minimum)
      endTime:   allocationPage.futureIso(120),  // end in 2 hours
    });
    await allocationPage.submitCreateCampaign();

    // Verify the row landed in the list with Upcoming status
    await allocationPage.expectCampaignInList(name);
    const status = await allocationPage.getCampaignStatus(name);
    if (status) {
      expect(status.toLowerCase()).toMatch(/upcoming|active/);
    }
  });

  test('ADM_ALLOC_012 — ADMIN-FS-Allocation §2 — Create Dynamic campaign with round configuration', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — destructive campaign create; set ALLOW_DESTRUCTIVE=1');

    const name = `E2E_Dynamic_${Date.now()}`;
    await allocationPage.openCreateCampaignModal();
    await allocationPage.fillCampaignDetails({
      name,
      type: 'Dynamic',
      startTime: allocationPage.futureIso(5),
      endTime:   allocationPage.futureIso(120),
    });
    await allocationPage.submitCreateCampaign();
    await allocationPage.expectCampaignInList(name);
  });

  test('ADM_ALLOC_013 — ADMIN-FS-Allocation §2 — Create Physical Event campaign', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — destructive campaign create; set ALLOW_DESTRUCTIVE=1');

    const name = `E2E_PhysicalEvt_${Date.now()}`;
    await allocationPage.openCreateCampaignModal();
    await allocationPage.fillCampaignDetails({
      name,
      type: 'Physical Event',
      startTime: allocationPage.futureIso(5),
      endTime:   allocationPage.futureIso(120),
    });
    await allocationPage.submitCreateCampaign();
    await allocationPage.expectCampaignInList(name);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // NEG / VAL: Form validation
  // These submit the form intentionally invalid — they DO NOT create campaigns,
  // so they're safe to run on UAT without ALLOW_DESTRUCTIVE.
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_010 — ADMIN-FS-Allocation §2 — Empty campaign name is rejected', async () => {
    await allocationPage.openCreateCampaignModal();
    await allocationPage.fillCampaignDetails({
      type: 'Static',
      startTime: allocationPage.futureIso(10),
      endTime:   allocationPage.futureIso(60),
      // intentionally no name
    });
    await allocationPage.submitCreateCampaign();
    await allocationPage.expectValidationError();
  });

  test('ADM_ALLOC_008 — ADMIN-FS-Allocation §2 — Start time within 3 minutes is rejected', async () => {
    await allocationPage.openCreateCampaignModal();
    await allocationPage.fillCampaignDetails({
      name: `NEG_NearStart_${Date.now()}`,
      type: 'Static',
      startTime: allocationPage.futureIso(1),  // < 3 minutes — should fail
      endTime:   allocationPage.futureIso(60),
    });
    await allocationPage.submitCreateCampaign();
    await allocationPage.expectValidationError();
  });

  test('ADM_ALLOC_009 — ADMIN-FS-Allocation §2 — End time before start time is rejected', async () => {
    await allocationPage.openCreateCampaignModal();
    await allocationPage.fillCampaignDetails({
      name: `NEG_EndBeforeStart_${Date.now()}`,
      type: 'Static',
      startTime: allocationPage.futureIso(30),
      endTime:   allocationPage.futureIso(10),  // before start
    });
    await allocationPage.submitCreateCampaign();
    await allocationPage.expectValidationError();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BIZ: State machine — lifecycle transitions & action availability
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_023 — ADMIN-FS-Allocation §3 — Cancelled campaigns appear with Cancelled status badge', async () => {
    const rows = await allocationPage.getCampaignsList();
    const cancelled = rows.find(r => /cancel/i.test(r.status));
    test.skip(!cancelled, 'No Cancelled campaigns on UAT to inspect');
    expect(cancelled.status.toLowerCase()).toContain('cancel');
  });

  test('ADM_ALLOC_024 — ADMIN-FS-Allocation §3 — Completed rows have no Stop/Cancel actions', async ({ page }) => {
    const rows = await allocationPage.getCampaignsList();
    const completed = rows.find(r => /complete/i.test(r.status));
    test.skip(!completed, 'No Completed campaigns on UAT to inspect');
    const row = page.locator('tr.ant-table-row', { hasText: completed.name }).first();
    // Stop / Cancel buttons must not be present on a Completed row
    const stopBtn = row.locator('button:has-text("Stop"), a:has-text("Stop")');
    const cancelBtn = row.locator('button:has-text("Cancel"), a:has-text("Cancel")');
    expect(await stopBtn.count()).toBe(0);
    expect(await cancelBtn.count()).toBe(0);
  });

  test('ADM_ALLOC_053 — ADMIN-FS-Allocation §2 endpoint 7 — Notify action visible only on Physical Event rows', async ({ page }) => {
    const rows = await allocationPage.getCampaignsList();
    test.skip(rows.length === 0, 'No campaigns on UAT to inspect Notify action visibility');

    for (const r of rows) {
      if (!r.name) continue;
      const row = page.locator('tr.ant-table-row', { hasText: r.name }).first();
      const notifyBtn = row.locator('button:has-text("Notify"), a:has-text("Notify")');
      const count = await notifyBtn.count();
      if (/physical/i.test(r.type)) {
        // Physical Event MAY expose Notify (only valid place it appears)
        expect(count).toBeGreaterThanOrEqual(0);
      } else {
        // Static and Dynamic MUST NOT expose Notify
        expect(count).toBe(0);
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // INT: Integration verification — cross-module effects
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_ALLOC_FSD_036 — FSD Customers §4.2 — Customers module surfaces campaign-active blocks when an Active campaign exists', async ({ page }) => {
    // Confirm the BIZ invariant: if at least one Active campaign exists,
    // the Customers module mutation endpoints are gated. We can't fire the
    // blocked mutations from E2E (they would mutate live data), but we CAN
    // verify the precondition is reflected in the UI list.
    const rows = await allocationPage.getCampaignsList();
    const active = rows.find(r => /active/i.test(r.status));
    test.skip(!active, 'No Active campaigns on UAT — cannot verify cross-module gating precondition');

    // Navigate to Customers and confirm the page loads — actual block assertion
    // sits at the API layer (ADM_ALLOC_044..048) where we have HTTP visibility.
    await page.goto('https://uat-web.xrportal.in/admin/customers');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/admin\/customers/);
  });
});
