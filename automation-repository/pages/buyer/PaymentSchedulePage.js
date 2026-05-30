'use strict';

/**
 * PaymentSchedulePage.js — Page Object Model for buyer / payment-schedule.
 *
 * Selectors sourced from locators/buyer/locator-map.json (module key: "payment-schedule").
 * NOTE: live crawl during scaffold reached a 404 surface (direct `/payment-schedule`
 * without `registration_unit_id` context renders Not Found), so the locator map
 * currently holds only two not-found stubs. The page-level DOM-contract fallbacks
 * below cover the actual Payment Schedule surface (milestones list, status badges,
 * Pay button, demand letter modal/link, schedule download).
 *
 * Tech Lead Agent must re-crawl `/paymentschedule?registrationNumber=...&unitId=...`
 * behind an authenticated WINNER session with at least one issued demand letter to
 * replace these stubs with stable locator-map entries.
 *
 * BRD/FRD: BUYER-FS-Payment-Schedule
 *   §Access            — Post-KYC + WINNER only (BYR_PAY_001)
 *   §Generation        — Schedule reflects buyer's selected payment plan (BYR_PAY_002)
 *   §Navigation        — Reachable from dashboard Pay> link & Unit Details (BYR_PAY_003/004)
 *   §Milestone-Display — Trigger label, principal/GST/parking, total, status badge
 *                        (BYR_PAY_005..015)
 *   §Pay-Action        — Pay button only on triggered milestones; opens Easebuzz
 *                        gateway (BYR_PAY_016..020)
 *   §Demand-Letter     — Demand letter accessible per milestone (BYR_PAY_021)
 *   §Negative          — UAT skip guard, failed-payment retention, Pay-hidden after
 *                        full payment, no home-loan → no bank-disbursement line
 *                        (BYR_PAY_022..025)
 *   §FSD-Corrections   — Client-side react-to-print only (BYR_PAY_FSD_026)
 *                        [BUG-PAY-001] milestone status FAILED unsupported by
 *                        MilestonePaymentTracking model (BYR_PAY_FSD_027)
 *                        No buyer notification on payment success/failure
 *                        (BYR_PAY_FSD_028)
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/buyer/locator-map.json');

const L = locatorMap['payment-schedule'] || {};

const PAYMENTSCHEDULE_URL          = 'https://uat.xrportal.in/payment-schedule';
const PAYMENTSCHEDULE_LEGACY_URL   = 'https://uat.xrportal.in/paymentschedule';
const HOME_DASHBOARD_URL           = 'https://uat.xrportal.in/home';
const ALLOTTED_UNITS_URL           = 'https://uat.xrportal.in/allotted-units';

// ── Business constants ──────────────────────────────────────────────────────
// Milestone status badge labels — controller writes UPCOMING/DUE/PAID/FAILED;
// model enum allows only VERIFICATION + PAID (BUG-PAY-001). UI surface most
// commonly renders Pending / Partial / Paid plus the buggy FAILED case.
const MILESTONE_STATUSES = ['UPCOMING', 'DUE', 'PENDING', 'PARTIAL', 'PAID', 'FAILED', 'VERIFICATION'];

// Easebuzz gateway URL patterns — used to recognise gateway redirect
const EASEBUZZ_URL_RE = /easebuzz|pay\.easebuzz|easebuzz\.in/i;

// Expected merchant string on the gateway (BYR_PAY_018)
const EXPECTED_MERCHANT = 'Impactum Lands';

class PaymentSchedulePage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = PAYMENTSCHEDULE_URL;
    this.legacyUrl = PAYMENTSCHEDULE_LEGACY_URL;
    this.homeUrl = HOME_DASHBOARD_URL;
    this.allottedUnitsUrl = ALLOTTED_UNITS_URL;
    this.MILESTONE_STATUSES = MILESTONE_STATUSES;
    this.EASEBUZZ_URL_RE = EASEBUZZ_URL_RE;
    this.EXPECTED_MERCHANT = EXPECTED_MERCHANT;

    // ── Locator-map elements (scaffold stubs — 404 surface) ─────────────────
    this.el404Heading = page.locator(
      (L['404Heading'] && L['404Heading'].selector) || 'h1:has-text("404")'
    );
    this.thisPageCouldNotBeFoundHeading = page.locator(
      (L['thisPageCouldNotBeFoundHeading'] && L['thisPageCouldNotBeFoundHeading'].selector) ||
      'h2:has-text("This page could not be found.")'
    );

    // ── Login-redirect guard (shared shell) ─────────────────────────────────
    this.loginRedirectGuard = page.locator(
      'h2:has-text("APPLICANT LOGIN"), input[placeholder="Enter Mobile Number"]'
    ).first();

    // ── Page shell ──────────────────────────────────────────────────────────
    this.pageShell = page.locator(
      'main, #__next, [class*="payment-schedule"], [class*="PaymentSchedule"], section:has-text("Payment Schedule")'
    ).first();
    this.pageHeading = page.locator(
      'h1:has-text("Payment Schedule"), h2:has-text("Payment Schedule"), [data-testid="payment-schedule-heading"]'
    ).first();
    this.loadingSkeleton = page.locator(
      '[class*="skeleton"], [class*="Skeleton"], [class*="loading"], [data-testid="skeleton"]'
    ).first();
    this.breadcrumbHome = page.locator(
      'a[href="/home"], a:has-text("Home"), button:has-text("Back"), [aria-label="back"], [aria-label="Back"]'
    ).first();
    this.preKycEmptyState = page.locator(
      ':text("Complete your KYC"), :text("KYC pending"), :text("Schedule unavailable"), [data-testid="schedule-empty"]'
    ).first();

    // ── Home Dashboard Pay > link (entry point — BYR_PAY_003) ───────────────
    this.dashboardPayLink = page.locator(
      'a:has-text("Pay >"), a:has-text("Pay"), button:has-text("Pay >"), [data-testid="dashboard-pay-link"]'
    ).first();

    // ── Milestone list / rows ───────────────────────────────────────────────
    this.milestonesContainer = page.locator(
      '[class*="milestone-list"], [class*="MilestoneList"], [class*="payment-schedule"] table, [class*="payment-schedule"] [class*="list"], section:has-text("Payment Schedule") [class*="list"]'
    ).first();
    this.milestoneRows = page.locator(
      '[data-testid^="milestone-"], [class*="milestone-row"], [class*="MilestoneRow"], [class*="payment-schedule"] tr, [class*="payment-schedule"] [class*="card"]'
    );
    this.milestoneTriggerLabel = page.locator(
      '[data-testid="milestone-trigger"], [class*="trigger-label"], [class*="milestone-name"]'
    );

    // ── Status badges ───────────────────────────────────────────────────────
    this.statusBadge = page.locator(
      '[class*="status-badge"], [class*="StatusBadge"], [data-testid^="status-"], [class*="milestone"] [class*="badge"]'
    );
    this.paidBadge = page.locator(
      '[class*="status"][class*="paid" i], [class*="badge"]:has-text("Paid"), :text("Paid")'
    ).first();
    this.pendingBadge = page.locator(
      '[class*="status"][class*="pending" i], [class*="badge"]:has-text("Pending"), :text("Pending")'
    ).first();
    this.partialBadge = page.locator(
      '[class*="status"][class*="partial" i], [class*="badge"]:has-text("Partial"), :text("Partial")'
    ).first();
    this.failedBadge = page.locator(
      '[class*="status"][class*="failed" i], [class*="badge"]:has-text("Failed"), :text("Failed")'
    ).first();

    // ── Amount breakdown ────────────────────────────────────────────────────
    this.principalCell = page.locator(
      '[data-testid="principal"], [class*="principal"], :text("Principal") + *'
    ).first();
    this.gstCell = page.locator(
      '[data-testid="gst"], [class*="gst"], :text("GST") + *'
    ).first();
    this.parkingCell = page.locator(
      '[data-testid="parking"], [class*="parking"], :text("Parking") + *'
    ).first();
    this.totalAmountDueCell = page.locator(
      '[data-testid="total-amount-due"], [class*="total-amount"], :text("Total Amount Due") + *, :text("Total") + *'
    ).first();
    this.alreadyPaidCell = page.locator(
      '[data-testid="already-paid"], [class*="already-paid"], :text("Already Paid") + *, :text("Paid Amount") + *'
    ).first();
    this.outstandingBalanceCell = page.locator(
      '[data-testid="outstanding-balance"], [class*="outstanding"], :text("Outstanding") + *, :text("Balance Due") + *'
    ).first();
    this.bankDisbursementCell = page.locator(
      '[data-testid="bank-disbursement"], [class*="disbursement"], :text("Bank disbursement"), :text("Home Loan Disbursement")'
    ).first();
    this.earlyBirdRow = page.locator(
      ':text("Early Bird"), :text("Early-bird"), [class*="early-bird"]'
    ).first();

    // ── Pay button + demand letter ──────────────────────────────────────────
    this.payButtons = page.locator(
      'button:has-text("Pay"), a:has-text("Pay Now"), [data-testid^="pay-milestone-"], [class*="pay-button"]'
    );
    this.payButtonFirst = this.payButtons.first();
    this.demandLetterLinks = page.locator(
      'a:has-text("View Demand Letter"), button:has-text("View Demand Letter"), a:has-text("Demand Letter"), [data-testid^="demand-letter-"]'
    );
    this.demandLetterLinkFirst = this.demandLetterLinks.first();
    this.demandLetterModal = page.locator(
      '[class*="demand-letter-modal"], [role="dialog"]:has-text("Demand Letter"), [data-testid="demand-letter-modal"]'
    ).first();
    this.demandLetterDownloadBtn = page.locator(
      'button:has-text("Download"), a:has-text("Download"), [data-testid="demand-letter-download"]'
    ).first();
    this.demandLetterCloseBtn = page.locator(
      '[role="dialog"] button[aria-label="Close"], [class*="demand-letter-modal"] button:has-text("Close")'
    ).first();

    // ── Schedule-level print/download (FSD-026 — react-to-print) ────────────
    this.scheduleDownloadBtn = page.locator(
      'button:has-text("Download Schedule"), button:has-text("Print Schedule"), button:has-text("Download"), [data-testid="schedule-download"]'
    ).first();

    // ── Easebuzz gateway frame / page ───────────────────────────────────────
    this.easebuzzFrame = page.locator(
      'iframe[src*="easebuzz" i], iframe[title*="easebuzz" i]'
    ).first();
    this.merchantBadge = page.locator(
      ':text("Impactum Lands"), :text("Impactum")'
    ).first();

    // ── Toasts / error surfaces ─────────────────────────────────────────────
    this.errorToast = page.locator(
      '[role="alert"], [class*="toast"]:has-text("error" i), [class*="toast"]:has-text("failed" i)'
    ).first();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateLegacy() {
    await this.page.goto(this.legacyUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateViaDashboardPayLink() {
    await this.page.goto(this.homeUrl);
    await this.page.waitForLoadState('domcontentloaded');
    const visible = await this.dashboardPayLink.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!visible) {
      return { reached: false, reason: 'Dashboard Pay > link not visible (no triggered milestone)' };
    }
    await this.click(this.dashboardPayLink);
    await this.page.waitForLoadState('domcontentloaded');
    return { reached: true };
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async isOnLoginRedirect() {
    return this.loginRedirectGuard.isVisible({ timeout: 3_000 }).catch(() => false);
  }

  async isOnNotFound() {
    return this.el404Heading.isVisible({ timeout: 2_000 }).catch(() => false);
  }

  async expectAccessibleFromHome() {
    const url = this.page.url();
    if (!/\/(payment-schedule|paymentschedule)/.test(url)) {
      throw new Error(`Expected URL to be /payment-schedule or /paymentschedule after dashboard nav, got '${url}'`);
    }
    const shellVisible = await this.pageShell.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!shellVisible) {
      throw new Error('Payment Schedule page shell not visible after dashboard Pay > nav');
    }
  }

  // ── Milestone list ─────────────────────────────────────────────────────────

  async getMilestonesList() {
    const count = await this.milestoneRows.count().catch(() => 0);
    const out = [];
    for (let i = 0; i < count; i++) {
      const t = ((await this.milestoneRows.nth(i).textContent({ timeout: 1_500 }).catch(() => '')) || '')
        .replace(/\s+/g, ' ')
        .trim();
      out.push(t);
    }
    return out;
  }

  async getMilestoneCount() {
    return this.milestoneRows.count().catch(() => 0);
  }

  async getMilestoneByName(triggerName) {
    if (!triggerName) return null;
    const re = new RegExp(triggerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const count = await this.getMilestoneCount();
    for (let i = 0; i < count; i++) {
      const row = this.milestoneRows.nth(i);
      const text = ((await row.textContent({ timeout: 1_500 }).catch(() => '')) || '');
      if (re.test(text)) return row;
    }
    return null;
  }

  async getMilestoneStatus(rowLocator) {
    if (!rowLocator) return null;
    const text = ((await rowLocator.textContent({ timeout: 2_000 }).catch(() => '')) || '').toUpperCase();
    for (const status of this.MILESTONE_STATUSES) {
      if (new RegExp(`\\b${status}\\b`).test(text)) return status;
    }
    return null;
  }

  async expectMilestoneRowsRendered() {
    await this.milestoneRows.first().waitFor({ state: 'visible', timeout: 8_000 });
    const count = await this.getMilestoneCount();
    if (count === 0) {
      throw new Error('No milestone rows rendered on Payment Schedule page');
    }
  }

  async expectStatusBadgeColor(rowLocator, expectedStatus) {
    // Lightweight contract: status text appears within the row; colour class is best-effort
    const status = await this.getMilestoneStatus(rowLocator);
    if (!status) {
      throw new Error(`No status badge found in milestone row; expected '${expectedStatus}'`);
    }
    if (expectedStatus && status.toUpperCase() !== expectedStatus.toUpperCase()) {
      throw new Error(`Status mismatch: expected '${expectedStatus}', got '${status}'`);
    }
    return status;
  }

  // ── Pay action ────────────────────────────────────────────────────────────

  async hasPayButton() {
    return (await this.payButtons.count().catch(() => 0)) > 0;
  }

  async clickPay() {
    const count = await this.payButtons.count().catch(() => 0);
    if (count === 0) {
      return { initiated: false, reason: 'No Pay button visible — no triggered milestone' };
    }
    // Pay click may open Easebuzz in a new tab/window OR redirect same-tab
    const ctx = this.page.context();
    const navPromise = this.page.waitForNavigation({ timeout: 8_000 }).catch(() => null);
    const popupPromise = ctx.waitForEvent('page', { timeout: 8_000 }).catch(() => null);
    await this.payButtonFirst.click();
    const [popup, navigated] = await Promise.all([popupPromise, navPromise]);
    const gatewayPage = popup || (navigated ? this.page : null);
    return { initiated: !!gatewayPage, gatewayPage: gatewayPage || this.page };
  }

  async expectGatewayRedirect(gatewayPage) {
    const p = gatewayPage || this.page;
    await p.waitForLoadState('domcontentloaded').catch(() => {});
    const url = p.url();
    const frame = await this.easebuzzFrame.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!(this.EASEBUZZ_URL_RE.test(url) || frame)) {
      throw new Error(`Expected Easebuzz gateway redirect; got URL '${url}' and no easebuzz iframe`);
    }
  }

  // ── Demand letter ──────────────────────────────────────────────────────────

  async hasDemandLetterLink() {
    return (await this.demandLetterLinks.count().catch(() => 0)) > 0;
  }

  async openDemandLetter() {
    const count = await this.demandLetterLinks.count().catch(() => 0);
    if (count === 0) {
      return { opened: false, reason: 'No demand letter link visible' };
    }
    // Demand letter may open a modal OR a new tab with PDF
    const ctx = this.page.context();
    const popupPromise = ctx.waitForEvent('page', { timeout: 5_000 }).catch(() => null);
    await this.demandLetterLinkFirst.click();
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      return { opened: true, mode: 'popup', popup };
    }
    const modalVisible = await this.demandLetterModal.isVisible({ timeout: 3_000 }).catch(() => false);
    return { opened: modalVisible, mode: 'modal' };
  }

  async downloadDemandLetter() {
    // react-to-print / direct anchor → triggers browser download
    const downloadVisible = await this.demandLetterDownloadBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!downloadVisible) {
      return { downloaded: false, reason: 'Download button not visible' };
    }
    const downloadPromise = this.page.waitForEvent('download', { timeout: 8_000 }).catch(() => null);
    await this.demandLetterDownloadBtn.click();
    const download = await downloadPromise;
    return { downloaded: !!download, download };
  }

  async closeDemandLetterModal() {
    const visible = await this.demandLetterCloseBtn.isVisible({ timeout: 2_000 }).catch(() => false);
    if (visible) {
      await this.demandLetterCloseBtn.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    await this.demandLetterModal.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
  }

  // ── Schedule-level print/download (FSD-026) ───────────────────────────────

  async clickScheduleDownload() {
    const visible = await this.scheduleDownloadBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) {
      return { clicked: false, reason: 'Schedule download button not visible' };
    }
    await this.scheduleDownloadBtn.click();
    return { clicked: true };
  }
}

module.exports = {
  PaymentSchedulePage,
  MILESTONE_STATUSES,
  EASEBUZZ_URL_RE,
  EXPECTED_MERCHANT,
  PAYMENTSCHEDULE_URL,
  PAYMENTSCHEDULE_LEGACY_URL,
  HOME_DASHBOARD_URL,
  ALLOTTED_UNITS_URL,
};
