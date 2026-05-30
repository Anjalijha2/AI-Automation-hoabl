'use strict';

/**
 * AdminCmsPage.js — Page Object Model for the Admin Portal Shell + CMS route.
 *
 * What this file does:
 *   The "Admin CMS" entry is two things stitched together:
 *     1. The persistent admin portal **shell** (left sidebar + top header + main
 *        content) shared by every admin route. We test sidebar nav, logout,
 *        access control, refresh, and direct-URL routing here because the CMS
 *        page is the canonical landing surface where the shell is exercised
 *        end-to-end (it has the richest locator inventory — 86 elements).
 *     2. The **external CMS link** — a sidebar item that points to Strapi at a
 *        different domain and opens in a new tab. Strapi internals are out of
 *        scope per project constraints; we only verify the link contract.
 *
 *   [FSD-CORRECTION] There is NO traditional CMS in the XR admin portal. The
 *   /admin/cms route is a **config / bulk-upload console** (Config, Bulk Cancel,
 *   Bulk Refund, Customer Actions). The real content CMS is Strapi (external).
 *   All TCs in TC_ADMIN_CMS.md reflect that reality.
 *
 * How selectors work:
 *   All CSS selectors come from locators/admin/locator-map.json under the
 *   "admin-cms" module key, accessed via bracket notation `L['key'].selector`.
 *   The `&& L[key].selector` guard surfaces a clear missing-locator error at
 *   test time rather than crashing during page construction (e.g. mid-sync).
 *
 * Destructive scope:
 *   logout() ends the session — once invoked, all subsequent protected requests
 *   will redirect to login until `npm run auth:setup` is rerun. Specs that call
 *   logout() MUST guard with ENV=uat && !ALLOW_DESTRUCTIVE.
 *
 * BRD: .claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-Admin-Portal.md
 * FSD: manual-qa-repository/03-user-manual/admin/fsd-admin-cms.md
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/admin/locator-map.json');

// Bracket access (per CLAUDE.md selector rule) — `L['key']` instead of `L.key`.
const L = locatorMap['admin-cms'] || {};

const ADMINCMS_URL       = 'https://uat-web.xrportal.in/admin/cms';
const ADMIN_BASE_URL     = 'https://uat-web.xrportal.in/admin';
const ADMIN_CUSTOMERS    = 'https://uat-web.xrportal.in/admin/customers';
const ADMIN_LOGIN_REGEX  = /\/admin(\/|\/?$|\/login)/;

/**
 * Canonical sidebar order per BRD §2 (Admin Portal shell).
 * Order is asserted by ADM_CMS_014 — keep this list in sync with the BRD.
 */
const SIDEBAR_ORDER = [
  'customersLink',
  'configLink',
  'allocationLink',
  'offersLink',
  'towersLink',
  'jBPMgmtLink',
  'channelPartnersLink',
  'salesManagersLink',
  'transactionsLink',
  'cMSLink',
];

/**
 * Route map — each sidebar item must navigate to its canonical URL.
 * Consumed by navigateToCmsPage() and the FUNC navigation TCs.
 */
const ROUTE_MAP = {
  customersLink:       { url: '/admin/customers',          regex: /\/admin\/customers/         },
  configLink:          { url: '/admin/cms',                regex: /\/admin\/cms/               },
  allocationLink:      { url: '/admin/allocation',         regex: /\/admin\/allocation/        },
  offersLink:          { url: '/admin/offers',             regex: /\/admin\/offers/            },
  towersLink:          { url: '/admin/towers',             regex: /\/admin\/towers/            },
  jBPMgmtLink:         { url: '/admin/jbp-management',     regex: /\/admin\/jbp-management/    },
  channelPartnersLink: { url: '/admin/channel-partners',   regex: /\/admin\/channel-partners/  },
  salesManagersLink:   { url: '/admin/sales-managers',     regex: /\/admin\/sales-managers/    },
  transactionsLink:    { url: '/admin/payment-transactions', regex: /\/admin\/payment-transactions/ },
  // cMSLink intentionally not mapped — it opens external Strapi in a new tab
};

class AdminCmsPage extends BasePage {
  /**
   * constructor — instantiated once per test (in beforeEach) via `new AdminCmsPage(page)`.
   *
   * Every `this.xxx = page.locator(...)` line below creates a "locator" — a lazy
   * reference to a DOM element. Playwright resolves it fresh on each use, so we
   * never run into stale-element errors when the page re-renders.
   */
  constructor(page) {
    super(page);
    this.L = L;
    this.url = ADMINCMS_URL;

    // ── Login surface (only seen if session expires mid-test) ────────────────
    // These exist in the locator map because the live crawl picked them up
    // when the admin session timed out. We use them to detect session-expiry
    // redirects in expectSessionExpired().
    this.sendOTPButton                  = page.locator(L['sendOTPButton'] && L['sendOTPButton'].selector);
    this.termsConditionsLink            = page.locator(L['termsConditionsLink'] && L['termsConditionsLink'].selector);
    this.privacyPolicyLink              = page.locator(L['privacyPolicyLink'] && L['privacyPolicyLink'].selector);
    this.enterMobileNumberInput         = page.locator(L['enterMobileNumberInput'] && L['enterMobileNumberInput'].selector);
    this.aDMINLOGINHeading              = page.locator(L['aDMINLOGINHeading'] && L['aDMINLOGINHeading'].selector);

    // ── Portal shell — logout & primary actions ─────────────────────────────
    this.logoutButton                   = page.locator(L['logoutButton'] && L['logoutButton'].selector);

    // ── Sidebar navigation links ────────────────────────────────────────────
    // The 10 canonical module links. Note the case-quirk in `jBPMgmtLink` and
    // `cMSLink` — those are the exact keys generated by the locator-map-builder
    // from the live element text, and we preserve them verbatim.
    this.customersLink                  = page.locator(L['customersLink'] && L['customersLink'].selector);
    this.configLink                     = page.locator(L['configLink'] && L['configLink'].selector);
    this.allocationLink                 = page.locator(L['allocationLink'] && L['allocationLink'].selector);
    this.offersLink                     = page.locator(L['offersLink'] && L['offersLink'].selector);
    this.towersLink                     = page.locator(L['towersLink'] && L['towersLink'].selector);
    this.jBPMgmtLink                    = page.locator(L['jBPMgmtLink'] && L['jBPMgmtLink'].selector);
    this.channelPartnersLink            = page.locator(L['channelPartnersLink'] && L['channelPartnersLink'].selector);
    this.salesManagersLink              = page.locator(L['salesManagersLink'] && L['salesManagersLink'].selector);
    this.transactionsLink               = page.locator(L['transactionsLink'] && L['transactionsLink'].selector);
    this.cMSLink                        = page.locator(L['cMSLink'] && L['cMSLink'].selector);

    // ── Config-console controls (the /admin/cms page itself) ────────────────
    // These come from the bulk-upload/config screens that live behind /admin/cms.
    // We don't drive them from this POM (they're scoped to their own modules)
    // but expose the primary buttons so a shell test can confirm the page rendered.
    this.updateTowerConfigurationButton = page.locator(L['updateTowerConfigurationButton'] && L['updateTowerConfigurationButton'].selector);
    this.sampleFileDownloadButton       = page.locator(L['sampleFileDownloadButton'] && L['sampleFileDownloadButton'].selector);
    this.uploadFileButton               = page.locator(L['uploadFileButton'] && L['uploadFileButton'].selector);
    this.submitButton                   = page.locator(L['submitButton'] && L['submitButton'].selector);
    this.updateButton                   = page.locator(L['updateButton'] && L['updateButton'].selector);

    // ── Ant Design selects (config screens) ─────────────────────────────────
    this.rcSelect0                      = page.locator(L['rcSelect0'] && L['rcSelect0'].selector);
    this.rcSelect1                      = page.locator(L['rcSelect1'] && L['rcSelect1'].selector);
    this.rcSelect2                      = page.locator(L['rcSelect2'] && L['rcSelect2'].selector);
    this.rcSelect3                      = page.locator(L['rcSelect3'] && L['rcSelect3'].selector);

    // ── Derived structural locators (not in locator-map.json) ───────────────
    // The portal shell uses Ant Design Layout. We derive structural selectors
    // for the sidebar, main-content area, and toasts. When the Tech Lead Agent
    // adds explicit keys, replace these with `L[...]` references.
    this.sidebar                        = page.locator('aside, .ant-layout-sider, nav, [class*="sidebar"]').first();
    this.mainContent                    = page.locator('main, .ant-layout-content, [class*="content"]').first();
    this.successToast                   = page.locator('.ant-message-success, .ant-notification-notice-success');
    this.errorToast                     = page.locator('.ant-message-error, .ant-notification-notice-error');

    // All sidebar anchor elements (used to assert link count and order)
    this.sidebarLinks                   = page.locator('aside a, .ant-layout-sider a, nav a');
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /**
   * navigate() — go directly to /admin/cms.
   * Called in beforeEach so each test starts on a clean page with no leftover
   * dropdown / modal state.
   */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * waitForLoad() — wait until the admin shell is interactive.
   * We race two visibility checks (sidebar OR a known sidebar link) — whichever
   * resolves first signals React has hydrated. Then await networkidle so any
   * downstream API calls settle before the test continues.
   */
  async waitForLoad() {
    await Promise.race([
      this.sidebar.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.customersLink.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * navigateToCmsPage(pageKey) — click a sidebar link and wait for the URL to
   * match the canonical regex. `pageKey` is one of the SIDEBAR_ORDER keys
   * (e.g. 'towersLink', 'allocationLink').
   *
   * Why .first(): Ant Design renders duplicate <a> tags for collapsed/expanded
   * sidebar states. Both share the same href so a plain locator resolves to
   * two elements and Playwright throws strict-mode violations.
   */
  async navigateToCmsPage(pageKey) {
    const link = this[pageKey];
    if (!link) throw new Error(`navigateToCmsPage: unknown pageKey "${pageKey}"`);
    const route = ROUTE_MAP[pageKey];
    if (!route) throw new Error(`navigateToCmsPage: no ROUTE_MAP entry for "${pageKey}" (external link?)`);
    await link.first().waitFor({ state: 'visible', timeout: 10_000 });
    await link.first().click();
    await this.page.waitForURL(route.regex, { timeout: 15_000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * portalShellSidebarNav() — read every sidebar link's visible text in DOM
   * order. Used by ADM_CMS_002 and ADM_CMS_014 to assert ordering matches the
   * BRD spec. Returns an array of trimmed strings.
   */
  async portalShellSidebarNav() {
    const out = [];
    for (const key of SIDEBAR_ORDER) {
      const link = this[key];
      if (!link) continue;
      const visible = await link.first().isVisible().catch(() => false);
      if (!visible) continue;
      const txt = ((await link.first().textContent()) || '').trim();
      out.push({ key, text: txt });
    }
    return out;
  }

  /**
   * openExternalCmsLink() — click the external CMS sidebar link and capture
   * the new tab/window it opens. Strapi runs on a different domain so the
   * link must use target="_blank".
   *
   * Returns the new Page object representing the popup. Caller should close
   * the popup when done to keep the browser context clean.
   */
  async openExternalCmsLink() {
    const [popup] = await Promise.all([
      this.page.context().waitForEvent('page', { timeout: 10_000 }).catch(() => null),
      this.cMSLink.first().click(),
    ]);
    return popup;
  }

  /**
   * getExternalCmsHref() — return the href attribute of the external CMS link
   * WITHOUT clicking it. Used by ADM_CMS_038 and ADM_CMS_039 to inspect the
   * link's URL and target/rel attributes without opening a new tab.
   */
  async getExternalCmsHref() {
    await this.cMSLink.first().waitFor({ state: 'visible', timeout: 10_000 });
    const anchor = this.cMSLink.first();
    return {
      href:   await anchor.getAttribute('href').catch(() => null),
      target: await anchor.getAttribute('target').catch(() => null),
      rel:    await anchor.getAttribute('rel').catch(() => null),
    };
  }

  // ── Logout & session ──────────────────────────────────────────────────────

  /**
   * logout() — click the Logout button and wait for redirect to the login page.
   *
   * DESTRUCTIVE: ends the saved admin session. After this call, all subsequent
   * protected requests redirect to login until `npm run auth:setup` is rerun.
   * Specs that call logout() MUST guard with ENV=uat && !ALLOW_DESTRUCTIVE.
   */
  async logout() {
    await this.logoutButton.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.logoutButton.first().click();
    await this.page.waitForURL(ADMIN_LOGIN_REGEX, { timeout: 15_000 }).catch(() => {});
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * expectSessionExpired() — after a forced logout or token-expiry, assert
   * the browser is on the admin login screen by checking for the OTP entry UI.
   */
  async expectSessionExpired() {
    await Promise.race([
      this.aDMINLOGINHeading.first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}),
      this.enterMobileNumberInput.first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}),
    ]);
    const url = this.page.url();
    if (!ADMIN_LOGIN_REGEX.test(url)) {
      throw new Error(`expectSessionExpired: not redirected to admin login (current url=${url})`);
    }
  }

  /**
   * triggerSessionExpiry() — clear browser storage to simulate session expiry,
   * then reload. Used by NEG tests that verify protected routes redirect to
   * login. Non-destructive on the server (no logout API call) — only forces
   * the client to re-authenticate.
   */
  async triggerSessionExpiry() {
    await this.page.evaluate(() => {
      try { localStorage.clear(); } catch (e) { /* private mode */ }
      try { sessionStorage.clear(); } catch (e) { /* private mode */ }
    });
    await this.page.context().clearCookies();
  }

  // ── Access control ────────────────────────────────────────────────────────

  /**
   * accessControl(roleStorageState) — load a non-admin storageState file and
   * attempt to reach /admin. Returns the final URL so the caller can assert
   * the redirect happened. Used by NEG access-control TCs.
   *
   * Note: Playwright's storageState is configured per-test via `test.use()`,
   * so this method is informational — actual role-toggling is done at the
   * spec level by switching test.use() blocks.
   */
  async accessControl({ targetPath = '/admin/customers' } = {}) {
    await this.page.goto(`https://uat-web.xrportal.in${targetPath}`);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return {
      finalUrl:     this.page.url(),
      onLoginPage:  ADMIN_LOGIN_REGEX.test(this.page.url()) &&
                    !/\/admin\/(customers|cms|allocation|offers|towers|jbp-management|channel-partners|sales-managers|payment-transactions)/.test(this.page.url()),
    };
  }

  // ── Assertion helpers ─────────────────────────────────────────────────────

  /**
   * expectPageRendered() — assert the admin shell is on screen (sidebar +
   * main content area both visible). Used as a generic "the page loaded"
   * assertion across many TCs.
   */
  async expectPageRendered() {
    await this.sidebar.waitFor({ state: 'visible', timeout: 15_000 });
    await this.mainContent.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /**
   * expectSidebarItems(expected) — assert the sidebar contains items in the
   * given order. `expected` is an array of substrings (label fragments) to
   * match against each rendered link text, in DOM order.
   *
   * We use substring match (not equality) because some builds prefix labels
   * with icons or trailing whitespace.
   */
  async expectSidebarItems(expected) {
    const actual = await this.portalShellSidebarNav();
    const actualTexts = actual.map(a => a.text.toLowerCase());
    for (let i = 0; i < expected.length; i++) {
      const want = expected[i].toLowerCase();
      if (!actualTexts[i] || !actualTexts[i].includes(want)) {
        throw new Error(
          `expectSidebarItems: position ${i} expected to contain "${expected[i]}" — got "${actual[i] ? actual[i].text : '<missing>'}". Full list: ${JSON.stringify(actualTexts)}`
        );
      }
    }
  }

  /**
   * expectOnCmsUrl() — assert browser is on the /admin/cms config console.
   */
  async expectOnCmsUrl() {
    await this.page.waitForURL(/\/admin\/cms/, { timeout: 15_000 });
  }

  /**
   * expectCurrentRouteHighlighted(pageKey) — assert the sidebar item for the
   * current page has an active/selected visual treatment. Ant Design applies
   * an "ant-menu-item-selected" or "active" class to the active link.
   */
  async expectCurrentRouteHighlighted(pageKey) {
    const link = this[pageKey];
    if (!link) throw new Error(`expectCurrentRouteHighlighted: unknown pageKey "${pageKey}"`);
    // Walk up to the containing <li> and inspect class — covers both Ant
    // Menu (li.ant-menu-item-selected) and custom navs (.active).
    const container = link.first().locator('xpath=ancestor-or-self::*[self::li or self::a][1]');
    const cls = (await container.getAttribute('class').catch(() => '')) || '';
    const isActive = /selected|active|current/i.test(cls);
    if (!isActive) {
      throw new Error(`expectCurrentRouteHighlighted: "${pageKey}" not visually active. class="${cls}"`);
    }
  }
}

module.exports = {
  AdminCmsPage,
  SIDEBAR_ORDER,
  ROUTE_MAP,
  ADMIN_BASE_URL,
  ADMIN_CUSTOMERS,
  ADMINCMS_URL,
};
