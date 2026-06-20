'use strict';

/**
 * MilestonePage.js — Page Object Model for the Admin Portal Milestones / Offline
 * Payment page (`/admin/milestone?rn=<regNum>&uid=<unitId>`).
 *
 * Reached from the Customers table: search a buyer's phone → open a Booked row's
 * three-dot menu → "View Milestones". CustomersPage.openViewMilestones() performs
 * that navigation; this POM drives everything once on the schedule page.
 *
 * Selectors live in locators/admin/locator-map.json under the `milestone` module
 * (owned by Tech Lead Agent). This file consumes them via require() — never hardcoded.
 *
 * Most operations here are READ-ONLY (view schedule, inspect drawer fields). The
 * single mutating action is submitOfflinePayment() — guarded at the spec level by
 * ALLOW_DESTRUCTIVE per Pipeline Discipline rule #7.
 *
 * BRD/FRD: .claude/docs/hoabl-knowledge-base/Admin-Portal/FRD/ADMIN-FS-Customers-Milestones.md
 */

const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/admin/locator-map.json');

const M = locatorMap.milestone;

class MilestonePage extends BasePage {
  constructor(page) {
    super(page);
    this.L = M;

    // ── Schedule page chrome ──────────────────────────────────────────────────
    this.pageHeading            = page.locator(M.pageHeading.selector);
    this.headerRegistrationNo   = page.locator(M.headerRegistrationNumber.selector);
    this.headerUnitNo           = page.locator(M.headerUnitNumber.selector);
    this.backToListingLink      = page.locator(M.backToListingLink.selector);

    // ── Milestone table ───────────────────────────────────────────────────────
    this.milestoneTable         = page.locator(M.milestoneTable.selector);
    this.milestoneRows          = page.locator(M.milestoneRow.selector);
    this.colPaymentStatus       = page.locator(M.colPaymentStatus.selector);

    // ── Status pills ──────────────────────────────────────────────────────────
    this.statusPillPaid         = page.locator(M.statusPillPaid.selector);
    this.statusPillPending      = page.locator(M.statusPillPending.selector);
    this.statusPillPartial      = page.locator(M.statusPillPartial.selector);

    // ── Row actions ───────────────────────────────────────────────────────────
    this.offlinePaymentButtons  = page.locator(M.offlinePaymentButton.selector);
    this.transactionViewButtons = page.locator(M.transactionDetailsViewButton.selector);

    // ── Offline Payment drawer ────────────────────────────────────────────────
    this.drawerPaymentForPrincipal = page.locator(M.drawerPaymentForPrincipal.selector);
    this.drawerPaymentForGst       = page.locator(M.drawerPaymentForGst.selector);
    this.drawerPaymentMethod       = page.locator(M.drawerPaymentMethod.selector);
    this.drawerAmount              = page.locator(M.drawerAmount.selector);
    this.drawerTransactionId       = page.locator(M.drawerTransactionId.selector);
    this.drawerTransactionDate     = page.locator(M.drawerTransactionDate.selector);
    this.drawerComments            = page.locator(M.drawerComments.selector);
    this.drawerPaymentProofInput   = page.locator(M.drawerPaymentProofInput.selector);
    this.drawerUploadProofButton   = page.locator(M.drawerUploadProofButton.selector);
    this.drawerSubmitButton        = page.locator(M.drawerSubmitPaymentButton.selector);
    this.drawerSummaryTotalOutstanding     = page.locator(M.drawerSummaryTotalOutstanding.selector);
    this.drawerSummaryPrincipalOutstanding = page.locator(M.drawerSummaryPrincipalOutstanding.selector);
    this.drawerSummaryGstOutstanding       = page.locator(M.drawerSummaryGstOutstanding.selector);

    // ── Toast ─────────────────────────────────────────────────────────────────
    this.successToast           = page.locator(M.offlinePaymentSuccessToast.selector);
  }

  // ── Page-load assertions ───────────────────────────────────────────────────

  /** expectScheduleLoaded() — confirm we're on the Milestone Payment Schedule page. */
  async expectScheduleLoaded() {
    await this.page.waitForURL(/\/admin\/milestone(\?|\/|$)/, { timeout: 15_000 });
    await this.pageHeading.waitFor({ state: 'visible', timeout: 15_000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});
    // The milestone TABLE loads async AFTER networkidle — wait for the data to render
    // (a status pill / offline-payment button / row) before any content assertion,
    // otherwise pills & buttons read 0. Confirmed via agent-browser (47 rows, 43 pills).
    await this.milestoneRows.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
    await this.page.locator(
      `${M.statusPillPending.selector}, ${M.statusPillPaid.selector}`
    ).first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  /** headerRegistrationText() / headerUnitText() — read the header card values. */
  async headerRegistrationText() { return (await this.headerRegistrationNo.textContent()) || ''; }
  async headerUnitText()         { return (await this.headerUnitNo.textContent()) || ''; }

  // ── Table reads ────────────────────────────────────────────────────────────

  async rowCount() { return this.milestoneRows.count(); }

  /** statusPillCounts() — how many Paid / Pending / Partial pills are rendered. */
  async statusPillCounts() {
    return {
      paid:    await this.statusPillPaid.count(),
      pending: await this.statusPillPending.count(),
      partial: await this.statusPillPartial.count(),
    };
  }

  /** offlinePaymentButtonCount() — number of "Offline Payment" buttons (due+outstanding rows). */
  async offlinePaymentButtonCount() { return this.offlinePaymentButtons.count(); }

  // ── Offline Payment drawer ──────────────────────────────────────────────────

  /**
   * openOfflinePaymentDrawer(index = 0) — click the Nth "Offline Payment" button and
   * wait for the drawer's Submit Payment button to render (drawer is ready).
   */
  async openOfflinePaymentDrawer(index = 0) {
    await this.offlinePaymentButtons.nth(index).click();
    await this.drawerSubmitButton.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /**
   * drawerFieldsPresent() — return a presence map for every documented drawer field.
   * Used by FUNC_055 to assert the form renders all fields.
   */
  async drawerFieldsPresent() {
    const vis = (loc) => loc.isVisible().catch(() => false);
    return {
      paymentForPrincipal: await vis(this.drawerPaymentForPrincipal),
      paymentForGst:       await vis(this.drawerPaymentForGst),
      paymentMethod:       await vis(this.drawerPaymentMethod),
      amount:              await vis(this.drawerAmount),
      transactionId:       await vis(this.drawerTransactionId),
      transactionDate:     await vis(this.drawerTransactionDate),
      comments:            await vis(this.drawerComments),
      paymentProof:        await vis(this.drawerUploadProofButton),
      submit:              await vis(this.drawerSubmitButton),
    };
  }

  /** paymentProofAccept() — the accept attribute of the file input (format whitelist). */
  async paymentProofAccept() {
    return this.drawerPaymentProofInput.getAttribute('accept');
  }

  /** selectPaymentFor(which) — choose Principal or GST radio (when shown). */
  async selectPaymentFor(which) {
    const loc = which === 'gst' ? this.drawerPaymentForGst : this.drawerPaymentForPrincipal;
    await loc.click({ force: true });
  }

  /** selectPaymentMethod(method) — pick a payment method. AntD selects use a virtualized
   *  dropdown whose options are covered for a normal click (learned on Unit Swap), so we
   *  open the combobox and keyboard-select: type to filter, then Enter. */
  async selectPaymentMethod(method) {
    await this.drawerPaymentMethod.click();
    await this.page.locator('.ant-select-item-option:visible').first().waitFor({ state: 'visible', timeout: 6_000 }).catch(() => {});
    // The #paymentMethod is a search combobox — typing filters to the match.
    await this.drawerPaymentMethod.fill(method).catch(() => {});
    await this.page.waitForTimeout(300);
    await this.page.keyboard.press('Enter');
  }

  /**
   * fillOfflinePayment({amount, method, txnId, txnDate, proofPath, paymentFor, comments})
   * Fills the drawer. Does NOT submit. txnDate format: 'YYYY-MM-DD HH:mm:ss'.
   */
  async fillOfflinePayment({ amount, method, txnId, txnDate, proofPath, paymentFor, comments } = {}) {
    if (paymentFor) await this.selectPaymentFor(paymentFor);
    if (method)     await this.selectPaymentMethod(method);
    if (amount != null) {
      await this.drawerAmount.fill(String(amount)).catch(async () => {
        await this.drawerAmount.click(); await this.drawerAmount.type(String(amount));
      });
    }
    if (txnId)   await this.drawerTransactionId.fill(txnId);
    if (txnDate) {
      // AntD DatePicker (date+time): focus the input, type the value, Enter, then click
      // the panel's OK button if present (time pickers require confirming).
      await this.drawerTransactionDate.click();
      await this.drawerTransactionDate.fill(txnDate).catch(() => {});
      await this.page.keyboard.press('Enter').catch(() => {});
      const okBtn = this.page.locator('.ant-picker-ok button, .ant-picker-dropdown:not(.ant-picker-dropdown-hidden) button:has-text("OK")');
      if (await okBtn.first().isVisible().catch(() => false)) await okBtn.first().click().catch(() => {});
    }
    if (comments) await this.drawerComments.fill(comments);
    // File upload is reliable via setInputFiles regardless of headless/visibility.
    if (proofPath) await this.drawerPaymentProofInput.setInputFiles(proofPath);
  }

  /** isSubmitEnabled() — whether the Submit Payment button is currently enabled. */
  async isSubmitEnabled() {
    return this.drawerSubmitButton.isEnabled().catch(() => false);
  }

  /**
   * submitOfflinePayment() — DESTRUCTIVE. Click Submit Payment and wait for the
   * success toast. Only call behind an ALLOW_DESTRUCTIVE guard.
   */
  async submitOfflinePayment() {
    await this.click(this.drawerSubmitButton);
    await this.successToast.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** closeDrawer() — dismiss the drawer without submitting (Escape / mask / X). */
  async closeDrawer() {
    await this.page.keyboard.press('Escape').catch(() => {});
    await this.page.locator('.ant-drawer-close, .ant-modal-close').first().click().catch(() => {});
    await this.drawerSubmitButton.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ── Transaction details + navigation ────────────────────────────────────────

  /** openTransactionDetails(index = 0) — click a row's "View" button. */
  async openTransactionDetails(index = 0) {
    await this.transactionViewButtons.nth(index).click();
  }

  /** clickBackToListing() — return to the customers dashboard. */
  async clickBackToListing() {
    await this.click(this.backToListingLink);
    await this.page.waitForURL(/\/admin\/(dashboard|customers)/, { timeout: 15_000 });
  }
}

module.exports = { MilestonePage };
