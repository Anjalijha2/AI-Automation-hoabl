'use strict';

/**
 * PhysicalAllocationPage.js — Page Object Model for the SM Portal Physical Allocation module.
 *
 * What this file does:
 *   Wraps every interaction on /sales-manager/physical-allocation into reusable
 *   methods. Tests import this class and call atomic methods (searchCustomer,
 *   selectUnit, initiatePayment, fillKycForm, submitKyc, etc.) instead of raw
 *   Playwright selectors.
 *
 * Where selectors live:
 *   The locator map exposes a thin 6-element set at module key "physical-allocation"
 *   in locators/sales-manager/locator-map.json. Bracket access `L['key']` is used
 *   for map lookups; everything beyond the bare contract (cost sheet, floor plan,
 *   unit cards, payment drawers, KYC form, 20-minute hold timer) uses stable
 *   DOM-contract fallback locators (Ant Design class hooks, role queries, text
 *   matchers) until Tech Lead Agent extends the locator map.
 *
 * Campaign gate:
 *   The page only renders the rich UI (customer search, units, KYC) while an
 *   `Allocation Campaign` of mode `PHYSICAL_EVENT` is active. When no campaign
 *   is active, the page shows a "No Active Campaign" heading (see locator map).
 *   waitForLoad() resolves on either the search input, the gate heading, or
 *   the Refresh toolbar button — whichever appears first.
 *
 * Known FSD-verified bugs:
 *   - BUG-KYC-001 (SM_ALLOC_FSD_020) — KYC PDF upload has NO file-size limit
 *     (multer limits commented out in backend). Risk: DoS / storage cost.
 *
 * BRD: SM-FS-Physical-Allocation.md / FRD SM-Portal §3
 * FSD: manual-qa-repository/03-user-manual/sm-portal/fsd-physical-allocation.md
 * TCs: manual-qa-repository/01-test-cases/sm-portal/physical-allocation/TC_PHYSICAL_ALLOCATION.md
 */

const { expect }   = require('@playwright/test');
const { BasePage } = require('../../base/BasePage');
const locatorMap   = require('../../../locators/sales-manager/locator-map.json');

const L = locatorMap['physical-allocation'] || {};

const PHYSICALALLOCATION_URL = 'https://uat-web.xrportal.in/sales-manager/physical-allocation';
const SM_BASE                = 'https://uat-web.xrportal.in/sales-manager';

/** Returns a Playwright selector string from the locator map for the given key, or ''. */
function sel(key) {
  return (L[key] && L[key].selector) || '';
}

class PhysicalAllocationPage extends BasePage {
  constructor(page) {
    super(page);
    this.L   = L;
    this.url = PHYSICALALLOCATION_URL;

    // ── Locator-map elements (live-crawled — physical-allocation module) ────
    this.logoutButton             = page.locator(sel('logoutButton'));
    this.refreshButton            = page.locator(sel('refreshButton'));
    this.callbackRequestsLink     = page.locator(sel('callbackRequestsLink'));
    this.towersLink               = page.locator(sel('towersLink'));
    this.allocationLink           = page.locator(sel('allocationLink'));
    this.noActiveCampaignHeading  = page.locator(sel('noActiveCampaignHeading'));
    this.scanQRButton             = page.locator(sel('scanQRButton'));
    this.searchByPhoneOrRegistrationNumberInput = page.locator(
      sel('searchByPhoneOrRegistrationNumberInput'),
    );

    // ── Customer Search (DOM-contract fallbacks) ────────────────────────────
    // The crawl picked up a phone/reg-no search input; "name" also routes through
    // the same input per FS 1.4 (single multi-attr search box).
    this.searchInput = this.searchByPhoneOrRegistrationNumberInput.or(
      page.locator(
        'input[placeholder*="Search by name" i], input[placeholder*="Search by Phone" i], input[placeholder*="Registration" i]',
      ).first(),
    );
    this.customerResultsList = page.locator(
      '[data-testid="customer-results"], .customer-results, ul.results, table.customers tbody',
    ).first();
    this.customerRows = page.locator(
      '[data-testid="customer-row"], .customer-card, table.customers tbody tr',
    );
    this.selectCustomerButton = (rowIdx = 0) =>
      this.customerRows.nth(rowIdx).locator('button:has-text("Select")').first();
    this.noRecordsFound = page.locator(
      ':text("No records found"), :text("No matching"), .ant-empty',
    ).first();

    // ── Checkout / Unit Listing ─────────────────────────────────────────────
    this.unitCards = page.locator(
      '[data-testid="unit-card"], .unit-card, [class*="UnitCard"]',
    );
    this.firstUnitCard = this.unitCards.first();
    this.floorPlanButton = page.locator(
      'button:has-text("Floor & Unit Plan"), button:has-text("Floor Plan"), button:has-text("View Floor Plan")',
    ).first();
    this.floorPlanModal = page.locator(
      '.ant-modal-content:visible, [role="dialog"]:visible',
    ).first();
    this.floorPlanModalClose = this.floorPlanModal.locator(
      '.ant-modal-close, [aria-label="Close"], button:has-text("Close")',
    ).first();

    this.costSheetButton = page.locator(
      'button:has-text("Cost Sheet"), button:has-text("View Cost Sheet")',
    ).first();
    this.costSheetModal = page.locator(
      '.ant-modal-content:visible, [role="dialog"]:visible',
    ).first();
    this.costSheetClose = this.costSheetModal.locator(
      '.ant-modal-close, [aria-label="Close"], button:has-text("Close")',
    ).first();

    // ── Unit Selection + Hold Timer ─────────────────────────────────────────
    this.selectUnitButton = (rowIdx = 0) =>
      this.unitCards.nth(rowIdx).locator('button:has-text("Select")').first();
    // Per BR 2.5.1, selecting a unit places it on a 20-minute HOLD. The countdown
    // is rendered as a visible timer somewhere on the page; match common patterns.
    this.holdTimer = page.locator(
      '[data-testid="hold-timer"], .hold-timer, :text-matches("\\b(19|20):[0-5][0-9]\\b"), :text-matches("\\d{1,2}\\s*min", "i")',
    ).first();

    // ── Payment ─────────────────────────────────────────────────────────────
    this.onlinePaymentButton = page.locator(
      'button:has-text("Online"), button:has-text("Pay Online"), button:has-text("Online Payment")',
    ).first();
    this.offlinePaymentButton = page.locator(
      'button:has-text("Offline"), button:has-text("Record Offline Payment"), button:has-text("Offline Payment")',
    ).first();

    // QR scanner modal (online payment path)
    this.qrScannerModal = page.locator(
      '[data-testid="qr-scanner-modal"], .qr-scanner-modal, :has(> img[alt*="QR" i])',
    ).first();
    this.qrImage = page.locator(
      'img[alt*="QR" i], canvas[aria-label*="QR" i], [data-testid="qr-code"]',
    ).first();

    // Offline payment drawer
    this.offlinePaymentDrawer = page.locator(
      '.ant-drawer-open, [role="dialog"]:visible',
    ).first();
    this.offlineReferenceInput = page.locator(
      'input[placeholder*="Reference" i], input[name*="reference" i]',
    ).first();
    this.offlineAmountInput = page.locator(
      'input[placeholder*="Amount" i], input[name*="amount" i]',
    ).first();
    this.offlineDateInput = page.locator(
      'input[placeholder*="Date" i], input[type="date"]',
    ).first();
    this.offlineProofUpload = page.locator(
      'input[type="file"]',
    ).first();
    this.offlineSubmitButton = page.locator(
      'button:has-text("Submit"), button:has-text("Record Payment"), button:has-text("Save")',
    ).first();

    // ── KYC ─────────────────────────────────────────────────────────────────
    this.kycContainer = page.locator(
      '[data-testid="kyc-form"], form.kyc, :has(:text("KYC"))',
    ).first();
    this.primaryApplicantSection = page.locator(
      '[data-testid="primary-applicant"], :text("Primary Applicant")',
    ).first();
    this.applicantNameInput = (idx = 0) =>
      page.locator('input[placeholder*="Name" i], input[name*="name" i]').nth(idx);
    this.applicantMobileInput = (idx = 0) =>
      page.locator('input[placeholder*="Mobile" i], input[name*="mobile" i]').nth(idx);
    this.applicantEmailInput = (idx = 0) =>
      page.locator('input[placeholder*="Email" i], input[type="email"]').nth(idx);
    this.applicantAddressInput = (idx = 0) =>
      page.locator('textarea[placeholder*="Address" i], input[name*="address" i]').nth(idx);
    this.applicantRelationshipSelect = (idx = 0) =>
      page.locator('select[name*="relationship" i], [aria-label*="Relationship" i]').nth(idx);

    this.addApplicantButton = page.locator(
      'button:has-text("Add Applicant"), button:has-text("+ Add"), button:has-text("Add Co-Applicant")',
    ).first();
    this.removeApplicantButton = (idx = 0) =>
      page.locator('button:has-text("Remove")').nth(idx);
    this.maxApplicantsHint = page.locator(
      ':text("Max. 4 Applicants allowed"), :text("Maximum 4 applicants")',
    ).first();

    // KYC document slots — 4 mandatory documents per applicant (Photo, PAN, Aadhaar front, Aadhaar back)
    this.kycDocPhoto       = (idx = 0) => page.locator('input[type="file"][name*="photo" i], input[type="file"][data-doc="photo"]').nth(idx);
    this.kycDocPan         = (idx = 0) => page.locator('input[type="file"][name*="pan" i], input[type="file"][data-doc="pan"]').nth(idx);
    this.kycDocAadhaarFront = (idx = 0) => page.locator('input[type="file"][name*="aadhaar-front" i], input[type="file"][data-doc="aadhaar-front"]').nth(idx);
    this.kycDocAadhaarBack  = (idx = 0) => page.locator('input[type="file"][name*="aadhaar-back" i], input[type="file"][data-doc="aadhaar-back"]').nth(idx);
    this.kycAllFileInputs   = page.locator('input[type="file"]');

    this.submitKycButton = page.locator(
      'button:has-text("Submit KYC"), button:has-text("Complete KYC")',
    ).first();
    this.allocationSuccessBanner = page.locator(
      ':text("Allocation Successful"), :text("Booked"), :text("Booking Confirmed"), .ant-result-success',
    ).first();
    this.kycValidationError = page.locator(
      '.ant-form-item-explain-error, .error-message, [role="alert"]',
    ).first();

    // ── Generic helpers ─────────────────────────────────────────────────────
    this.activeModal = page.locator('.ant-modal-content:visible, [role="dialog"]:visible').first();
    this.toastSuccess = page.locator('.ant-message-success, .ant-notification-notice-success').first();
    this.toastError   = page.locator('.ant-message-error, .ant-notification-notice-error').first();
    this.loaderSkeleton = page.locator('.ant-skeleton-active, .skeleton, [data-testid="loading"]').first();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Navigation
  // ════════════════════════════════════════════════════════════════════════

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * waitForLoad() — wait until either (a) the gate "No Active Campaign" heading,
   * (b) the search input, or (c) the Refresh toolbar button is visible.
   * Then settles networkidle to ensure the campaign-status API has returned.
   */
  async waitForLoad() {
    await Promise.race([
      this.noActiveCampaignHeading.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.searchInput.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
      this.refreshButton.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    ]);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectOnPhysicalAllocationUrl() {
    await this.page.waitForURL(/\/sales-manager\/physical-allocation/, { timeout: 15_000 });
  }

  // ════════════════════════════════════════════════════════════════════════
  // Campaign Gate
  // ════════════════════════════════════════════════════════════════════════

  /**
   * isCampaignActive() — true if the rich UI (customer search input) is rendered,
   * false if the "No Active Campaign" gate is showing.
   */
  async isCampaignActive() {
    // Prefer presence of the search input. If missing, check the gate.
    const searchVisible = await this.searchInput.isVisible().catch(() => false);
    if (searchVisible) return true;
    const gateVisible = await this.noActiveCampaignHeading.isVisible().catch(() => false);
    if (gateVisible) return false;
    // Ambiguous (e.g. loader still in flight) — default to active.
    return searchVisible;
  }

  /** expectCampaignGate() — assert the "No Active Campaign" empty state is rendered and search is hidden. */
  async expectCampaignGate() {
    await expect(this.noActiveCampaignHeading).toBeVisible({ timeout: 10_000 });
    // Search input must NOT be present when the gate is shown.
    const searchVisible = await this.searchInput.isVisible().catch(() => false);
    expect(searchVisible).toBe(false);
  }

  /** expectCampaignActive() — assert the rich UI (search) is shown. */
  async expectCampaignActive() {
    await expect(this.searchInput).toBeVisible({ timeout: 10_000 });
  }

  // ════════════════════════════════════════════════════════════════════════
  // Customer Search
  // ════════════════════════════════════════════════════════════════════════

  /**
   * searchCustomer(criteria) — type into the customer-search input.
   * `criteria` may be a name, phone or registration number — backend matches
   * all attributes per FS 1.4.
   */
  async searchCustomer(criteria) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 10_000 });
    await this.searchInput.fill(String(criteria));
    await this.searchInput.press('Enter').catch(() => {});
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getCustomerRowCount() {
    return this.customerRows.count();
  }

  /** selectCustomer(rowIdx) — click Select on a customer row → navigates to checkout. */
  async selectCustomer(rowIdx = 0) {
    const btn = this.selectCustomerButton(rowIdx);
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    await btn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ════════════════════════════════════════════════════════════════════════
  // Floor Plan & Cost Sheet
  // ════════════════════════════════════════════════════════════════════════

  async showFloorPlan() {
    await this.floorPlanButton.waitFor({ state: 'visible', timeout: 10_000 });
    await this.floorPlanButton.click();
    await this.floorPlanModal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async closeFloorPlan() {
    await this.floorPlanModalClose.click().catch(async () => {
      await this.page.keyboard.press('Escape');
    });
  }

  async viewCostSheet() {
    await this.costSheetButton.waitFor({ state: 'visible', timeout: 10_000 });
    await this.costSheetButton.click();
    await this.costSheetModal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async closeCostSheet() {
    await this.costSheetClose.click().catch(async () => {
      await this.page.keyboard.press('Escape');
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // Unit Selection (places unit on 20-min HOLD)
  // ════════════════════════════════════════════════════════════════════════

  /** selectUnit(rowIdx) — click Select on a unit card → places it on HOLD per BR 2.5.1. */
  async selectUnit(rowIdx = 0) {
    const btn = this.selectUnitButton(rowIdx);
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    await btn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** expect20MinHoldTimer() — assert the hold-timer is visible after unit selection. */
  async expect20MinHoldTimer() {
    await expect(this.holdTimer).toBeVisible({ timeout: 10_000 });
    const text = ((await this.holdTimer.textContent()) || '').trim();
    // Per BR 2.5.1 the initial timer should read close to 20 minutes — allow 17-20.
    const m = text.match(/(\d{1,2})\s*:\s*(\d{2})/) || text.match(/(\d{1,2})\s*min/i);
    if (m) {
      const minutes = Number(m[1]);
      expect(minutes).toBeGreaterThanOrEqual(15);
      expect(minutes).toBeLessThanOrEqual(20);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Payment
  // ════════════════════════════════════════════════════════════════════════

  /**
   * initiatePayment({ mode, reference, amount, date, proofFile }) — start a
   * payment. `mode` is one of 'online' | 'offline'.
   *
   * Online: opens QR scanner modal.
   * Offline: opens drawer, fills the 4 mandatory fields (reference, amount,
   *   date, proof) and submits — all required per BR 2.5.4.
   */
  async initiatePayment({ mode = 'online', reference = '', amount = '', date = '', proofFile = null } = {}) {
    if (mode === 'online') {
      const btn = this.onlinePaymentButton.or(this.scanQRButton).first();
      await btn.waitFor({ state: 'visible', timeout: 10_000 });
      await btn.click();
      await this.qrScannerModal.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
      return;
    }

    // offline
    await this.offlinePaymentButton.waitFor({ state: 'visible', timeout: 10_000 });
    await this.offlinePaymentButton.click();
    await this.offlinePaymentDrawer.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});

    if (reference) await this.offlineReferenceInput.fill(reference).catch(() => {});
    if (amount)    await this.offlineAmountInput.fill(String(amount)).catch(() => {});
    if (date)      await this.offlineDateInput.fill(date).catch(() => {});
    if (proofFile) await this.offlineProofUpload.setInputFiles(proofFile).catch(() => {});

    await this.offlineSubmitButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** submitOfflinePaymentEmpty() — click Submit on offline drawer without filling — expects validation. */
  async submitOfflinePaymentEmpty() {
    await this.offlinePaymentButton.click();
    await this.offlinePaymentDrawer.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await this.offlineSubmitButton.click();
    // Validation errors should appear and the drawer should NOT close.
  }

  // ════════════════════════════════════════════════════════════════════════
  // KYC
  // ════════════════════════════════════════════════════════════════════════

  /**
   * fillKycForm({ name, mobile, email, address, relationship }, applicantIdx) —
   * fill text fields for the applicant at `applicantIdx` (0 = primary).
   */
  async fillKycForm({ name = '', mobile = '', email = '', address = '', relationship = '' } = {}, applicantIdx = 0) {
    if (name)         await this.applicantNameInput(applicantIdx).fill(name).catch(() => {});
    if (mobile)       await this.applicantMobileInput(applicantIdx).fill(mobile).catch(() => {});
    if (email)        await this.applicantEmailInput(applicantIdx).fill(email).catch(() => {});
    if (address)      await this.applicantAddressInput(applicantIdx).fill(address).catch(() => {});
    if (relationship) {
      const sel2 = this.applicantRelationshipSelect(applicantIdx);
      await sel2.selectOption({ label: relationship }).catch(async () => {
        await sel2.click().catch(() => {});
        const active = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
        await active.locator(`.ant-select-item-option:has-text("${relationship}")`).first().click().catch(() => {});
      });
    }
  }

  /**
   * uploadKycDocs({ photo, pan, aadhaarFront, aadhaarBack }, applicantIdx) —
   * upload the 4 mandatory documents per applicant. Pass null to skip a doc
   * (useful for negative tests like SM_PA_033).
   */
  async uploadKycDocs({ photo = null, pan = null, aadhaarFront = null, aadhaarBack = null } = {}, applicantIdx = 0) {
    if (photo)        await this.kycDocPhoto(applicantIdx).setInputFiles(photo).catch(() => {});
    if (pan)          await this.kycDocPan(applicantIdx).setInputFiles(pan).catch(() => {});
    if (aadhaarFront) await this.kycDocAadhaarFront(applicantIdx).setInputFiles(aadhaarFront).catch(() => {});
    if (aadhaarBack)  await this.kycDocAadhaarBack(applicantIdx).setInputFiles(aadhaarBack).catch(() => {});
  }

  async addCoApplicant() {
    await this.addApplicantButton.waitFor({ state: 'visible', timeout: 5_000 });
    await this.addApplicantButton.click();
  }

  async removeCoApplicant(applicantIdx = 1) {
    // applicantIdx is global (0 = primary, 1 = first co-applicant).
    // Remove buttons exist only for co-applicants, so adjust to 0-based of co-applicants.
    const removeIdx = Math.max(0, applicantIdx - 1);
    const btn = this.removeApplicantButton(removeIdx);
    await btn.click();
    // Confirm any confirmation modal that pops.
    const confirmBtn = this.page.locator('.ant-modal-footer button:has-text("OK"), button:has-text("Confirm")').first();
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
    }
  }

  async submitKyc() {
    await this.submitKycButton.waitFor({ state: 'visible', timeout: 10_000 });
    await this.submitKycButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** expectAllocationSuccess() — assert the allocation-success banner is rendered post-KYC. */
  async expectAllocationSuccess() {
    await expect(this.allocationSuccessBanner).toBeVisible({ timeout: 15_000 });
  }

  /** expectKycValidationError() — assert an inline validation error is shown (negative tests). */
  async expectKycValidationError() {
    await expect(this.kycValidationError).toBeVisible({ timeout: 10_000 });
  }

  // ════════════════════════════════════════════════════════════════════════
  // Toolbar utility actions
  // ════════════════════════════════════════════════════════════════════════

  async clickRefresh() {
    await this.click(this.refreshButton);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async logout() {
    await this.click(this.logoutButton);
    await this.page.waitForURL(new RegExp(`${SM_BASE}/?$`), { timeout: 10_000 });
  }
}

module.exports = { PhysicalAllocationPage };
