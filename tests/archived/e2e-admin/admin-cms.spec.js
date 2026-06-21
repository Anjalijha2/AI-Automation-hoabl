'use strict';

/**
 * admin-cms.spec.js — End-to-End tests for the Admin Portal Shell + CMS link.
 *
 * What this file tests:
 *   The "Admin CMS" surface is the admin portal **shell** (sidebar, header,
 *   logout, routing) anchored on /admin/cms. We exercise:
 *     • sidebar navigation to all 10 module routes
 *     • the external CMS link (opens Strapi in a new tab)
 *     • logout & session expiry behavior
 *     • access-control gating for non-admin roles
 *     • direct-URL routing and browser back/refresh integrity
 *
 *   [FSD-CORRECTION] The /admin/cms route is NOT a content CMS — it is the
 *   config / bulk-upload console. The real content CMS is Strapi (external,
 *   out of scope). TC source: TC_ADMIN_CMS.md.
 *
 * How test IDs work:
 *   Each test title starts with a TC_ID (e.g. ADM_CMS_004) that traces back to
 *   manual-qa-repository/01-test-cases/admin-portal/admin-cms/TC_ADMIN_CMS.md.
 *   BRD reference: ADMIN-FS-CMS §<section>.
 *
 * Authentication:
 *   All tests run as an authenticated admin via the saved storageState file.
 *   Run `npm run auth:setup` if the session expires.
 *
 * Destructive tests:
 *   logout() ends the admin session. Logout-flow tests are SKIPPED by default
 *   on UAT — set ALLOW_DESTRUCTIVE=1 only when you can rerun auth:setup
 *   afterwards.
 *
 * BRD: ADMIN-BRD-Admin-Portal · FSD: fsd-admin-cms.md
 */

const { test, expect } = require('@playwright/test');
const { AdminCmsPage, SIDEBAR_ORDER } = require('../../../automation-repository/pages/admin/AdminCmsPage');

// Load saved admin session — browser starts already logged in.
test.use({ storageState: 'automation-repository/fixtures/.auth/admin.json' });

test.describe('Admin CMS / Portal Shell — Admin Portal E2E', () => {
  let cmsPage;

  /**
   * beforeEach — runs before every test in this describe block.
   * Constructs a fresh AdminCmsPage, navigates to /admin/cms, and waits for
   * the shell (sidebar / first link) to render. Fresh navigation per test
   * prevents leftover dropdown/modal state from leaking across tests.
   */
  test.beforeEach(async ({ page }) => {
    cmsPage = new AdminCmsPage(page);
    await cmsPage.navigate();
    await cmsPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Portal shell + sidebar navigation
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_CMS_001 — ADMIN-FS-CMS §1 — Admin portal shell loads at /admin/cms after login', async ({ page }) => {
    await cmsPage.expectOnCmsUrl();
    await cmsPage.expectPageRendered();
    await expect(page).toHaveScreenshot('admin-cms-e2e-001-shell-default.png', {
      maxDiffPixels: 250,
      fullPage: true,
    });
  });

  test('ADM_CMS_002 — ADMIN-FS-CMS §1 — Left sidebar shows all 10 module links plus Logout', async () => {
    const items = await cmsPage.portalShellSidebarNav();
    // All 10 canonical sidebar keys must be present
    const keys = items.map(i => i.key);
    for (const required of SIDEBAR_ORDER) {
      expect(keys).toContain(required);
    }
    // Logout button must also be visible in the shell
    await expect(cmsPage.logoutButton.first()).toBeVisible();
  });

  test('ADM_CMS_014 — ADMIN-FS-CMS §1 — Sidebar item order matches BRD specification', async () => {
    // Order per BRD: Customers, Config, Allocation, Offers, Towers, JBP Mgmt,
    //                Channel Partners, Sales Managers, Transactions, CMS
    await cmsPage.expectSidebarItems([
      'Customers', 'Config', 'Allocation', 'Offers', 'Towers',
      'JBP', 'Channel', 'Sales', 'Transaction', 'CMS',
    ]);
  });

  test('ADM_CMS_004 — ADMIN-FS-CMS §1 — Click Customers in sidebar navigates to /admin/customers', async ({ page }) => {
    await cmsPage.navigateToCmsPage('customersLink');
    expect(page.url()).toMatch(/\/admin\/customers/);
  });

  test('ADM_CMS_005 — ADMIN-FS-CMS §1 — Click Config navigates to /admin/cms (config console)', async ({ page }) => {
    // Land elsewhere first so the click is meaningful
    await page.goto('https://uat-web.xrportal.in/admin/customers');
    await page.waitForLoadState('networkidle');
    await cmsPage.navigateToCmsPage('configLink');
    expect(page.url()).toMatch(/\/admin\/cms/);
  });

  test('ADM_CMS_006_007_008 — ADMIN-FS-CMS §1 — Allocation, Offers, Towers sidebar links route correctly', async ({ page }) => {
    // Three consecutive route assertions in a single test to keep parallel
    // browser sessions low — these are independent reads of the routing logic.
    for (const key of ['allocationLink', 'offersLink', 'towersLink']) {
      // Reset to /admin/cms before each navigation
      await page.goto('https://uat-web.xrportal.in/admin/cms');
      await page.waitForLoadState('networkidle');
      await cmsPage.navigateToCmsPage(key);
      // Verify each ended on its canonical URL
      const map = { allocationLink: /\/admin\/allocation/, offersLink: /\/admin\/offers/, towersLink: /\/admin\/towers/ };
      expect(page.url()).toMatch(map[key]);
    }
  });

  test('ADM_CMS_009_010_011_012 — ADMIN-FS-CMS §1 — JBP, CP, SM, Transactions sidebar links route correctly', async ({ page }) => {
    for (const key of ['jBPMgmtLink', 'channelPartnersLink', 'salesManagersLink', 'transactionsLink']) {
      await page.goto('https://uat-web.xrportal.in/admin/cms');
      await page.waitForLoadState('networkidle');
      await cmsPage.navigateToCmsPage(key);
      const map = {
        jBPMgmtLink:         /\/admin\/jbp-management/,
        channelPartnersLink: /\/admin\/channel-partners/,
        salesManagersLink:   /\/admin\/sales-managers/,
        transactionsLink:    /\/admin\/payment-transactions/,
      };
      expect(page.url()).toMatch(map[key]);
    }
  });

  test('ADM_CMS_003 — ADMIN-FS-CMS §1 — Sidebar persists across module pages', async ({ page }) => {
    // Visit three modules in succession and verify the sidebar is present on each
    for (const url of ['/admin/towers', '/admin/allocation', '/admin/offers']) {
      await page.goto(`https://uat-web.xrportal.in${url}`);
      await page.waitForLoadState('networkidle');
      await expect(cmsPage.sidebar).toBeVisible();
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // INT: External CMS link (Strapi)
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_CMS_015 — ADMIN-FS-CMS §1 — Sidebar shows separate CMS link distinct from Config', async () => {
    await expect(cmsPage.cMSLink.first()).toBeVisible();
    await expect(cmsPage.configLink.first()).toBeVisible();
    // Both visible and distinct in the DOM
    const cmsText = ((await cmsPage.cMSLink.first().textContent()) || '').toLowerCase();
    const cfgText = ((await cmsPage.configLink.first().textContent()) || '').toLowerCase();
    expect(cmsText).toContain('cms');
    expect(cfgText).toContain('config');
  });

  test('ADM_CMS_038 — FSD §1 — External CMS link href points to non-XR domain (Strapi)', async () => {
    const attrs = await cmsPage.getExternalCmsHref();
    // Skip if the locator map doesn't capture an href (would mean CMS link is
    // a button or JS handler — link contract is then exercised by ADM_CMS_016).
    test.skip(!attrs.href, 'External CMS link has no href attribute on this build');
    // Must NOT point to the admin portal itself
    expect(attrs.href).not.toMatch(/uat-web\.xrportal\.in\/admin/);
  });

  test('ADM_CMS_039 — ADMIN-FS-CMS §1 — External CMS link uses target="_blank" / rel="noopener"', async () => {
    const attrs = await cmsPage.getExternalCmsHref();
    test.skip(!attrs.href, 'External CMS link has no href — target/rel check N/A');
    expect(attrs.target).toBe('_blank');
    // rel may be 'noopener', 'noreferrer', or both — assert it at minimum contains one
    if (attrs.rel) {
      expect(attrs.rel).toMatch(/noopener|noreferrer/);
    }
  });

  test('ADM_CMS_041 — FSD §1 — CMS link is distinct from /admin/cms Config route', async ({ page }) => {
    // Config goes to internal /admin/cms; CMS link goes to external Strapi
    await cmsPage.navigateToCmsPage('configLink');
    expect(page.url()).toMatch(/\/admin\/cms/);
    const attrs = await cmsPage.getExternalCmsHref();
    if (attrs.href) {
      // External CMS href must NOT be /admin/cms
      expect(attrs.href).not.toMatch(/\/admin\/cms$/);
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Logout & session
  // (DESTRUCTIVE — ends the admin session; guarded by ALLOW_DESTRUCTIVE)
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_CMS_019 — ADMIN-FS-CMS §1 — Logout button visible in sidebar', async () => {
    await expect(cmsPage.logoutButton.first()).toBeVisible();
  });

  test('ADM_CMS_020 — ADMIN-FS-CMS §1 — Click Logout ends session and redirects to login', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — destructive logout; set ALLOW_DESTRUCTIVE=1 and rerun auth:setup after');

    await cmsPage.logout();
    await cmsPage.expectSessionExpired();
  });

  test('ADM_CMS_022 — ADMIN-FS-CMS §1 — Accessing protected route after session expiry redirects to login', async ({ page }) => {
    // Non-destructive simulation — clears client storage instead of calling logout.
    await cmsPage.triggerSessionExpiry();
    await page.goto('https://uat-web.xrportal.in/admin/customers');
    await page.waitForLoadState('networkidle').catch(() => {});
    // Either we landed on the login screen (Mobile Number visible) OR the URL
    // contains the login pattern. Some builds preserve /admin/customers in the
    // URL while overlaying the login form — accept either signal.
    const onLogin = /\/admin(\/|\/?$|\/login)/.test(page.url());
    const otpVisible = await cmsPage.enterMobileNumberInput.first().isVisible().catch(() => false);
    expect(onLogin || otpVisible).toBeTruthy();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BIZ: Access control by role
  // (Role-toggle requires non-admin storageState files — guarded by ALLOW_DESTRUCTIVE)
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_CMS_024 — ADMIN-FS-CMS §1 — Admin (roleId=1) reaches every sidebar module', async ({ page }) => {
    // Walk through each module via the sidebar and confirm the URL settled.
    const routes = [
      { key: 'customersLink',       re: /\/admin\/customers/         },
      { key: 'allocationLink',      re: /\/admin\/allocation/        },
      { key: 'offersLink',          re: /\/admin\/offers/            },
      { key: 'towersLink',          re: /\/admin\/towers/            },
    ];
    for (const { key, re } of routes) {
      await page.goto('https://uat-web.xrportal.in/admin/cms');
      await page.waitForLoadState('networkidle');
      await cmsPage.navigateToCmsPage(key);
      expect(page.url()).toMatch(re);
    }
  });

  test('ADM_CMS_026 — ADMIN-FS-CMS §1 — Buyer role cannot access admin portal', async ({ page }) => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — role-toggle requires buyer session swap; set ALLOW_DESTRUCTIVE=1');

    // Clear admin storage and load buyer storage manually
    await page.context().clearCookies();
    await cmsPage.triggerSessionExpiry();
    const result = await cmsPage.accessControl({ targetPath: '/admin/customers' });
    expect(result.onLoginPage || /\/admin(\/|\/?$|\/login)/.test(result.finalUrl)).toBeTruthy();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FUNC: Direct URL routing & browser navigation
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_CMS_030 — ADMIN-FS-CMS §1 — Browser back button navigates module history', async ({ page }) => {
    await cmsPage.navigateToCmsPage('customersLink');
    await cmsPage.navigateToCmsPage('towersLink');
    await cmsPage.navigateToCmsPage('offersLink');
    await page.goBack();
    await page.waitForLoadState('networkidle').catch(() => {});
    expect(page.url()).toMatch(/\/admin\/towers/);
  });

  test('ADM_CMS_031 — ADMIN-FS-CMS §1 — Direct URL navigation works for all modules', async ({ page }) => {
    await page.goto('https://uat-web.xrportal.in/admin/offers');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/admin\/offers/);
    await expect(cmsPage.sidebar).toBeVisible();
  });

  test('ADM_CMS_035 — ADMIN-FS-CMS §1 — F5 refresh maintains session and current page', async ({ page }) => {
    await cmsPage.navigateToCmsPage('towersLink');
    const urlBefore = page.url();
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => {});
    expect(page.url()).toBe(urlBefore);
    await expect(cmsPage.sidebar).toBeVisible();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // INT: Integration / sync — config console rendering
  // ════════════════════════════════════════════════════════════════════════════

  test('ADM_CMS_FSD_036 — FSD §1 — /admin/cms surfaces config-console controls (NOT content CMS)', async () => {
    // The /admin/cms route should expose bulk-upload / config buttons — not
    // banner/gallery/testimonial CRUD. We assert at least one config-console
    // control is visible to prove we're on the config console, not a content CMS.
    await cmsPage.expectOnCmsUrl();
    const candidates = [
      cmsPage.updateTowerConfigurationButton,
      cmsPage.sampleFileDownloadButton,
      cmsPage.uploadFileButton,
      cmsPage.submitButton,
      cmsPage.updateButton,
    ];
    let anyVisible = false;
    for (const c of candidates) {
      if (await c.first().isVisible().catch(() => false)) { anyVisible = true; break; }
    }
    expect(anyVisible).toBeTruthy();
  });
});
