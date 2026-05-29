'use strict';

/**
 * HomeDashboardPage.js — Page Object Model for the Buyer Portal Home Dashboard module.
 *
 * What this file does:
 *   Wraps every UI interaction on the Buyer Home Dashboard page (https://uat.xrportal.in/home)
 *   into reusable JavaScript methods. Tests import this class and call methods like
 *   `expectRegistrationTable()` or `getRegistrationByNumber('GHNG-...')` instead of writing
 *   raw Playwright selectors in every test. That keeps tests readable and easy to fix when
 *   the UI changes.
 *
 * How selectors work:
 *   The base selectors live in locators/buyer/locator-map.json under the `home-dashboard`
 *   module key (owned by the Tech Lead Agent). Only 9 element selectors are auto-crawled
 *   today and most of them point at the login surface (the locator crawler ran while
 *   /home redirected to login). Until the crawler runs against an authenticated session,
 *   this POM augments the locator map with DOM-contract fallback locators for the
 *   dashboard-specific UI (registration table rows, status badges, banners, etc.).
 *
 * BRD/FRD: BUYER-FS-Home-Dashboard
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/home-dashboard/TC_HOME_DASHBOARD.md
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/buyer/locator-map.json');

// Shorthand — bracket access per CLAUDE rules (L['key']) for keys that may
// not yet exist in the locator map.
const L = locatorMap['home-dashboard'] || {};

const HOMEDASHBOARD_URL = 'https://uat.xrportal.in/home';

class HomeDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = HOMEDASHBOARD_URL;

    // ── Locator-map-backed elements (auto-crawled, 9 keys) ───────────────────
    // These exist in locator-map.json today. They map to the login surface
    // because the crawler ran unauthenticated; we keep them for completeness
    // so authenticated runs can detect a session-expiry redirect (login surface
    // becoming visible on /home means the buyer.json session expired).
    this.previousSlide          = page.locator((L['previousSlide']          && L['previousSlide'].selector)          || '[aria-label="Previous slide"]');
    this.nextSlide              = page.locator((L['nextSlide']              && L['nextSlide'].selector)              || '[aria-label="Next slide"]');
    this.sendOTPButton          = page.locator((L['sendOTPButton']          && L['sendOTPButton'].selector)          || 'button:has-text("Send OTP")');
    this.termsConditionsLink    = page.locator((L['termsConditionsLink']    && L['termsConditionsLink'].selector)    || 'a:has-text("Terms & Conditions")');
    this.privacyPolicyLink      = page.locator((L['privacyPolicyLink']      && L['privacyPolicyLink'].selector)      || 'a:has-text("Privacy Policy")');
    this.enterMobileNumberInput = page.locator((L['enterMobileNumberInput'] && L['enterMobileNumberInput'].selector) || 'input[placeholder="Enter Mobile Number"]');
    this.rcTabs0Tab1            = page.locator((L['rcTabs0Tab1']            && L['rcTabs0Tab1'].selector)            || '#rc-tabs-0-tab-1');
    this.rcTabs0Tab2            = page.locator((L['rcTabs0Tab2']            && L['rcTabs0Tab2'].selector)            || '#rc-tabs-0-tab-2');
    this.aPPLICANTLOGINHeading  = page.locator((L['aPPLICANTLOGINHeading']  && L['aPPLICANTLOGINHeading'].selector)  || 'h2:has-text("APPLICANT LOGIN")');

    // ── DOM-contract fallback locators (NOT in locator-map yet) ───────────────
    // These are best-effort selectors based on the FRD/FSD field contract for the
    // Buyer Home Dashboard. Once an authenticated crawl runs and the locator map
    // is extended, replace these with L['key'] lookups.

    // Top-level layout containers
    this.dashboardRoot         = page.locator('main, [class*="dashboard"], [class*="home"]').first();
    this.topNavBar             = page.locator('header, nav, [class*="header"], [class*="navbar"]').first();
    this.headerProfileArea     = page.locator('[class*="profile"], [class*="avatar"], [aria-label*="user" i], [class*="user-menu"]').first();
    this.welcomeMessage        = page.getByText(/welcome|hi,?\s|hello,?\s/i).first();
    this.topAlertBanner        = page.locator('[class*="alert"], [class*="banner"], [role="alert"]').first();
    this.allocationBanner      = page.locator('[class*="allocation"], [class*="campaign"]').filter({ hasText: /allocation|live|campaign|countdown/i }).first();
    this.countdownTimer        = page.locator('[class*="countdown"], [class*="timer"]').first();
    this.creativeTilesSection  = page.locator('[class*="creative"], [class*="tiles"], [class*="marketing"]').first();
    this.homePopup             = page.locator('[role="dialog"], [class*="modal"], [class*="popup"]').first();
    this.homePopupCloseBtn     = page.locator('[role="dialog"] [aria-label*="close" i], [class*="modal"] [aria-label*="close" i], [class*="popup"] button:has-text("×")').first();
    this.marquee               = page.locator('marquee, [class*="marquee"], [class*="ticker"]').first();
    this.errorBanner           = page.getByText(/something went wrong|try again|error|failed to load/i).first();
    this.emptyState            = page.getByText(/no registrations|no registration|nothing here|get started/i).first();

    // Navigation menu items (top/side nav) — links by accessible name
    this.navHome           = page.getByRole('link', { name: /^home$/i }).first();
    this.navProject        = page.getByRole('link', { name: /project/i }).first();
    this.navMyUnit         = page.getByRole('link', { name: /my\s*unit|unit/i }).first();
    this.navPaymentSchedule = page.getByRole('link', { name: /payment\s*schedule/i }).first();
    this.navHomeLoan       = page.getByRole('link', { name: /home\s*loan/i }).first();
    this.navWorkProgress   = page.getByRole('link', { name: /work\s*progress|progress/i }).first();
    this.navSupport        = page.getByRole('link', { name: /support|help/i }).first();
    this.navProfile        = page.getByRole('link', { name: /profile|account/i }).first();

    // Registration table — DOM contract from FSD §Registration-Table
    this.registrationTable     = page.locator('table, [role="table"], [class*="registration"][class*="table"]').first();
    this.registrationRows      = page.locator('table tbody tr, [role="row"]:not(:has(th))');
    this.registrationHeaderRow = page.locator('table thead tr, [role="row"]:has(th)').first();

    // Column header locators (text-based — robust to class renames)
    this.colRegistrationNumber = page.getByRole('columnheader', { name: /registration\s*number/i }).first();
    this.colHomeLoan           = page.getByRole('columnheader', { name: /home\s*loan/i }).first();
    this.colAllottedUnit       = page.getByRole('columnheader', { name: /allotted\s*unit|allotment/i }).first();
    this.colStatus             = page.getByRole('columnheader', { name: /^status$/i }).first();
    this.colProcessStatus      = page.getByRole('columnheader', { name: /process\s*status/i }).first();
    this.colPaymentSchedule    = page.getByRole('columnheader', { name: /payment\s*schedule/i }).first();

    // Status badges — these are best-effort; live DOM may use different classes
    this.statusBadgeAvailable  = page.locator('[class*="badge"], [class*="tag"], [class*="status"]').filter({ hasText: /^available$/i });
    this.statusBadgeWaitlisted = page.locator('[class*="badge"], [class*="tag"], [class*="status"]').filter({ hasText: /waitlist/i });
    this.statusBadgeBooked     = page.locator('[class*="badge"], [class*="tag"], [class*="status"]').filter({ hasText: /^booked$/i });
    this.statusBadgeRefunded   = page.locator('[class*="badge"], [class*="tag"], [class*="status"]').filter({ hasText: /refund/i });

    // Action buttons inside table rows
    this.proceedToConfirmBtn   = page.getByRole('button', { name: /proceed\s*to\s*confirm/i }).first();
    this.completeKycBtn        = page.getByRole('button', { name: /complete\s*kyc/i }).first();
    this.kycCompletedText      = page.getByText(/kyc\s*completed/i).first();
    this.payNowBtn             = page.getByRole('button', { name: /^pay\s*>?$|pay\s*now/i }).first();
    this.addUnitsBtn           = page.getByRole('button', { name: /add\s*units?|add\s*more/i }).first();

    // Misc
    this.callScheduledIndicator = page.getByText(/call\s*scheduled|callback\s*scheduled/i).first();
    this.retryBtn               = page.getByRole('button', { name: /retry|reload|try\s*again/i }).first();
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  /**
   * navigate() — go directly to the Buyer Home Dashboard URL.
   * Called in beforeEach so every test starts on a clean dashboard view.
   */
  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * waitForLoad() — wait until the dashboard finishes rendering.
   *
   * Two-phase wait:
   *   1. networkidle — lets the 3–5 dashboard API calls settle
   *      (/registration, /user-registrations, /registration-count, etc.)
   *   2. Either the registration table OR an empty-state OR an error banner
   *      becomes visible (any of the three is a valid "rendered" state).
   *
   * We do NOT throw if none of those appear — some tests only need the URL,
   * not full content. Use expectRegistrationTable() / expectEmptyState() to
   * assert the specific outcome.
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    // Race three possible rendered states. Whichever wins first signals load done.
    await Promise.race([
      this.registrationTable.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.emptyState.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.errorBanner.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);
  }

  /**
   * navigateToSection(section) — click a top-nav link by canonical name.
   * @param {'home'|'project'|'my-unit'|'payment-schedule'|'home-loan'|'work-progress'|'support'|'profile'} section
   */
  async navigateToSection(section) {
    const map = {
      'home':             this.navHome,
      'project':          this.navProject,
      'my-unit':          this.navMyUnit,
      'payment-schedule': this.navPaymentSchedule,
      'home-loan':        this.navHomeLoan,
      'work-progress':    this.navWorkProgress,
      'support':          this.navSupport,
      'profile':          this.navProfile,
    };
    const target = map[section];
    if (!target) throw new Error(`Unknown nav section: ${section}`);
    await target.waitFor({ state: 'visible', timeout: 10_000 });
    await target.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Assertion helpers ────────────────────────────────────────────────────

  /**
   * expectWelcomeMessage() — assert a buyer greeting / profile area is visible.
   * Accepts either a "Welcome ..." text or the profile avatar in the header.
   */
  async expectWelcomeMessage() {
    const greeting = await this.welcomeMessage.isVisible({ timeout: 8_000 }).catch(() => false);
    const profile  = await this.headerProfileArea.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!greeting && !profile) {
      throw new Error('Neither welcome message nor profile area visible in header');
    }
  }

  /**
   * expectRegistrationTable() — assert the registration table is rendered with at least
   * one row. Throws if the table is missing OR has zero data rows.
   */
  async expectRegistrationTable() {
    await this.registrationTable.waitFor({ state: 'visible', timeout: 15_000 });
    const rowCount = await this.registrationRows.count();
    if (rowCount === 0) {
      throw new Error('Registration table is visible but has zero data rows');
    }
  }

  /**
   * expectCountdownTimer() — assert the allocation banner shows a countdown.
   * Best-effort: looks for a timer element OR text that contains a time pattern.
   */
  async expectCountdownTimer() {
    const timerVisible = await this.countdownTimer.isVisible({ timeout: 8_000 }).catch(() => false);
    if (timerVisible) return;
    // Fallback — text pattern like "00:14:32" or "14h 22m"
    const timeText = this.page.getByText(/\d{1,2}\s*[:hdm]\s*\d{1,2}|\d{1,2}\s*(days?|hours?|hrs?|mins?)/i).first();
    await timeText.waitFor({ state: 'visible', timeout: 8_000 });
  }

  /**
   * expectCallScheduled() — assert the "Call Scheduled" indicator is visible
   * (used when a callback request has been booked from the dashboard).
   */
  async expectCallScheduled() {
    await this.callScheduledIndicator.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * expectEmptyState() — assert the "no registrations" empty-state is visible.
   */
  async expectEmptyState() {
    await this.emptyState.waitFor({ state: 'visible', timeout: 10_000 });
  }

  // ── Registration row interactions ────────────────────────────────────────

  /**
   * getRegistrationByNumber(regNumber) — return the table row Locator that contains
   * the given registration number (e.g. "GHNG-ABC1234567").
   *
   * Returns a single Locator scoped to the matching row, so callers can chain:
   *   await page.getRegistrationByNumber('GHNG-XYZ').locator('button').click()
   */
  getRegistrationByNumber(regNumber) {
    return this.page.locator('tr, [role="row"]').filter({ hasText: regNumber }).first();
  }

  /**
   * clickRegistrationRow(rowIndex) — click the table row at the given index.
   * Some dashboard rows open a detail view on click; others require explicit CTA.
   * If the row is not clickable, this is a no-op (UI may not support row click).
   *
   * @param {number} rowIndex — 0-based row index
   */
  async clickRegistrationRow(rowIndex = 0) {
    const row = this.registrationRows.nth(rowIndex);
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.click({ timeout: 5_000 }).catch(() => { /* row may not be clickable */ });
  }

  /**
   * openAddUnits() — click the "Add Units" CTA to open the add-units flow.
   * Used by tests that verify post-allocation unit-addition UX.
   */
  async openAddUnits() {
    await this.addUnitsBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await this.addUnitsBtn.click();
  }

  /**
   * getRegistrationCount() — return the number of registration rows currently rendered.
   * Returns 0 if the table is not visible.
   */
  async getRegistrationCount() {
    const tableVisible = await this.registrationTable.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!tableVisible) return 0;
    return this.registrationRows.count();
  }

  /**
   * dismissHomePopupIfVisible() — close the home popup if it appears, otherwise no-op.
   * Used in beforeEach hooks so popups don't block subsequent assertions.
   */
  async dismissHomePopupIfVisible() {
    const visible = await this.homePopup.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) return;
    await this.homePopupCloseBtn.click({ timeout: 3_000 }).catch(() => {});
    await this.homePopup.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }
}

module.exports = { HomeDashboardPage };
