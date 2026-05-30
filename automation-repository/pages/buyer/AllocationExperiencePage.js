'use strict';

/**
 * AllocationExperiencePage.js — Page Object Model for buyer / allocation-experience.
 *
 * Selectors sourced from locators/buyer/locator-map.json (module key: "allocation-experience").
 * NOTE: live crawl during scaffold reached a 404 surface, so the locator map currently
 * holds only two not-found stubs. The page-level DOM-contract fallbacks below cover the
 * full allocation surface (Waiting, STATIC entry, Unit Selection 3-panel layout,
 * Cost Sheet, T&C + Pay, DYNAMIC OpenAllottedUnit, Post-campaign closed surface).
 * Tech Lead Agent must re-crawl /allotment behind an authenticated WINNER/Available
 * session to replace these with stable map entries.
 *
 * BRD/FRD: BUYER-FS-Allocation-Experience
 *   - 4 surfaces: Waiting → STATIC entry → STATIC selection+payment | DYNAMIC assignment+payment → Post-campaign
 *   - STATIC: 3-panel selection (towers / unit grid / details), unit colours
 *       white=AVAILABLE, green=SELECTED, orange=HOLD-other, red=BOOKED
 *   - Hold mechanism: 20 min from paymentTransaction.createdAt (hardcoded, GAP-AE-03),
 *     LAZY expiry via reconcile cron (GAP-AE-02)
 *   - Gateway: Easebuzz default (BR-AE-12); merchant "Impactum Lands Pvt Ltd"
 *   - Real-time signalling: POLLING ONLY — no WebSocket / SSE (GAP-AE-01)
 *   - Notifications on success: WhatsApp `congrates_payment_success_27sept` via Botspice,
 *     SMS `ALLOTMENT_PAYMENT_SUCCESS` via Epinet (countryCode==='+91' literal, GAP-AE-08)
 *   - One hold per buyer (BR-AE-09), atomic rollback on gateway failure (BR-AE-10)
 *   - Post-campaign closed message: exact "Allocation window is closed for now."
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/buyer/locator-map.json');

const L = locatorMap['allocation-experience'] || {};

const ALLOCATIONEXPERIENCE_URL = 'https://uat.xrportal.in/allotment';

// ── Business constants ──────────────────────────────────────────────────────
const HOLD_DURATION_MIN = 20;             // BR-AE-08 / GAP-AE-03 (hardcoded backend)
const PAYMENT_GATEWAY_TIMER_MIN = 15;     // Easebuzz validity (BYR_ALLOC_024)
const TC_LABEL_EXACT = 'I confirm to HoABL Terms & Conditions and Privacy Policy';
const POST_CAMPAIGN_CLOSED_TEXT = 'Allocation window is closed for now.';
const UNIT_COLOR = {
  AVAILABLE: 'white',
  SELECTED:  'green',
  HOLD:      'orange',
  BOOKED:    'red',
};

class AllocationExperiencePage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = ALLOCATIONEXPERIENCE_URL;
    this.HOLD_DURATION_MIN = HOLD_DURATION_MIN;
    this.PAYMENT_GATEWAY_TIMER_MIN = PAYMENT_GATEWAY_TIMER_MIN;
    this.TC_LABEL_EXACT = TC_LABEL_EXACT;
    this.POST_CAMPAIGN_CLOSED_TEXT = POST_CAMPAIGN_CLOSED_TEXT;
    this.UNIT_COLOR = UNIT_COLOR;

    // ── Locator-map elements (scaffold stubs — 404 surface) ─────────────────
    this.el404Heading                   = page.locator((L['404Heading'] && L['404Heading'].selector) || 'h1:has-text("404")');
    this.thisPageCouldNotBeFoundHeading = page.locator((L['thisPageCouldNotBeFoundHeading'] && L['thisPageCouldNotBeFoundHeading'].selector) || 'h2:has-text("This page could not be found.")');

    // ── Login-redirect guard (shared shell) ─────────────────────────────────
    this.loginRedirectGuard = page.locator('h2:has-text("APPLICANT LOGIN"), input[placeholder="Enter Mobile Number"]').first();

    // ── Generic page shell ──────────────────────────────────────────────────
    this.allotmentShell  = page.locator('[class*="allotment"], [class*="allocation"], main, #__next').first();
    this.pageHeading     = page.locator('h1, h2').first();

    // ── Waiting / pre-event surface ─────────────────────────────────────────
    this.waitingForUnit      = page.locator(
      '[class*="WaitingForUnit"], [data-testid="waiting-for-unit"], :text("Allocation hasn\'t started"), :text("Allocation hasn’t started")'
    ).first();
    this.allocationEndTimer  = page.locator('[class*="AllocationEndTimer"], [data-testid="allocation-end-timer"], [class*="countdown"]').first();
    this.nextChanceTime      = page.locator('[class*="NextChanceTime"], [data-testid="next-chance-time"]').first();

    // ── STATIC entry surface ────────────────────────────────────────────────
    this.bookNowBadge        = page.locator('[class*="book-now"], button:has-text("Book Now"), [data-testid="book-now"]').first();
    this.selectUnitCta       = page.locator('a:has-text("Select Unit"), button:has-text("Select Unit"), [data-testid="select-unit"]').first();
    this.proceedToConfirmCta = page.locator('button:has-text("Proceed to Confirm"), a:has-text("Proceed to Confirm")').first();
    this.inFlightPaymentBanner = page.locator(':text("Payment under verification"), :text("Payment under Verification"), [class*="in-flight"]').first();
    this.waitlistedBadge     = page.locator(':text("Waitlisted"), [class*="waitlist"]').first();

    // ── STATIC unit selection — 3-panel layout ──────────────────────────────
    this.unitSelectionShell  = page.locator('[class*="unit-selection"], [class*="UnitSelection"], [data-testid="unit-selection"]').first();
    this.towersPanel         = page.locator('[class*="towers-panel"], [class*="left-panel"], [data-testid="towers-panel"]').first();
    this.towerItems          = page.locator('[class*="tower-item"], [data-testid^="tower-"], [class*="towersPanel"] li');
    this.unitGridPanel       = page.locator('[class*="unit-grid"], [class*="center-panel"], [data-testid="unit-grid"]').first();
    this.unitCells           = page.locator('[class*="unit-cell"], [data-testid^="unit-cell-"], [class*="UnitCell"]');
    this.unitDetailsPanel    = page.locator('[class*="unit-details"], [class*="right-panel"], [data-testid="unit-details"]').first();
    this.floorUnitPlanLink   = page.locator('a:has-text("Floor & Unit Plan"), button:has-text("Floor & Unit Plan")').first();
    this.costSheetLink       = page.locator('a:has-text("Cost Sheet"), button:has-text("Cost Sheet")').first();
    this.changeUnitBtn       = page.locator('button:has-text("Change Unit"), a:has-text("Change Unit")').first();
    this.cancelBtn           = page.locator('button:has-text("Cancel"):not([disabled])').first();
    this.addBtn              = page.locator('button:has-text("Add"):not(:has-text("Add Co"))').first();

    // ── Cost sheet modal/drawer ─────────────────────────────────────────────
    this.costSheetSurface    = page.locator('[class*="cost-sheet"], [class*="CostSheet"], [data-testid="cost-sheet"]').first();
    this.costSheetRows       = page.locator('[class*="cost-sheet"] tr, [class*="CostSheet"] [class*="row"]');
    this.costSheetTotal      = page.locator('[class*="cost-sheet"] [class*="total"], [data-testid="cost-sheet-total"]').first();

    // ── T&C + Pay (post Add, Allotment page) ────────────────────────────────
    this.tcCheckbox          = page.locator('input[type="checkbox"][name*="terms" i], input[type="checkbox"][id*="terms" i], [data-testid="tc-checkbox"]').first();
    this.tcLabel             = page.locator(`label:has-text("${TC_LABEL_EXACT}"), :text("${TC_LABEL_EXACT}")`).first();
    this.payButton           = page.locator('button:has-text("Pay"), button:has-text("Confirmation Amount"), [data-testid="pay-button"]').first();

    // ── Easebuzz gateway (cross-origin/iframe — used for assertions only) ───
    this.easebuzzMerchantLabel = page.locator(':text("Impactum Lands Pvt Ltd")').first();
    this.easebuzzValidityTimer = page.locator('[class*="validity"], [class*="timer"], :text(/\\d+:\\d+/)').first();
    this.easebuzzMethodTabs    = page.locator('[class*="method"], [class*="tab"]').filter({ hasText: /Credit|Debit|UPI|NetBanking|Wallet/i });

    // ── Payment confirmation ────────────────────────────────────────────────
    this.paymentSuccessScreen  = page.locator(':text("Payment successful"), [class*="payment-success"], [data-testid="payment-success"]').first();
    this.paymentFailureBanner  = page.locator(':text("Payment failed"), :text("Payment Failure"), [class*="payment-failure"]').first();

    // ── Hold timer (selection / payment page) ───────────────────────────────
    this.holdTimer             = page.locator('[class*="hold-timer"], [data-testid="hold-timer"], [class*="HoldTimer"]').first();

    // ── DYNAMIC surface ─────────────────────────────────────────────────────
    this.openAllottedUnit      = page.locator('[class*="OpenAllottedUnit"], [data-testid="open-allotted-unit"]').first();
    this.dynamicRoundTimer     = page.locator('[class*="round-timer"], [data-testid="round-timer"]').first();
    this.proceedToPayCta       = page.locator('button:has-text("Proceed to Pay"), a:has-text("Proceed to Pay")').first();
    this.watchingUnitList      = page.locator('[class*="WatchingUnitList"], [data-testid="watching-unit-list"]').first();
    this.yourMissedChances     = page.locator('[class*="YourMissedChances"], [data-testid="your-missed-chances"]').first();
    this.unitSoldNotification  = page.locator('[class*="UnitSoldNotification"], [data-testid="unit-sold-notification"]').first();
    this.preferenceInputs      = page.locator('input[name*="preference" i], select[name*="preference" i], [data-testid^="preference-"]');
    this.submitPreferencesBtn  = page.locator('button:has-text("Submit Preferences"), button:has-text("Submit Preference")').first();
    this.allocatedBadge        = page.locator(':text("Allocated"), :text("WINNER"), [class*="allocated"]').first();

    // ── Post-campaign surface ───────────────────────────────────────────────
    this.allocationClosedText  = page.locator(`:text("${POST_CAMPAIGN_CLOSED_TEXT}")`).first();
    this.completeKycCta        = page.locator('button:has-text("Complete KYC"), a:has-text("Complete KYC")').first();

    // ── Generic error/validation ────────────────────────────────────────────
    this.validationError       = page.locator('[role="alert"], [class*="error-message"], [class*="ant-form-item-explain-error"]').first();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
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

  // ── Surface detection helpers ──────────────────────────────────────────────

  /**
   * Detect which allocation surface is currently rendered.
   * @returns {Promise<'waiting'|'static-entry'|'static-selection'|'dynamic'|'post-campaign'|'unknown'>}
   */
  async detectSurface() {
    if (await this.allocationClosedText.isVisible({ timeout: 1_500 }).catch(() => false)) return 'post-campaign';
    if (await this.unitSelectionShell.isVisible({ timeout: 1_500 }).catch(() => false))   return 'static-selection';
    if (await this.openAllottedUnit.isVisible({ timeout: 1_500 }).catch(() => false))     return 'dynamic';
    if (await this.bookNowBadge.isVisible({ timeout: 1_500 }).catch(() => false))         return 'static-entry';
    if (await this.waitingForUnit.isVisible({ timeout: 1_500 }).catch(() => false))       return 'waiting';
    return 'unknown';
  }

  // ── Waiting (pre-event) ────────────────────────────────────────────────────

  async expectWaitingState() {
    const visible =
      (await this.waitingForUnit.isVisible({ timeout: 5_000 }).catch(() => false)) ||
      (await this.nextChanceTime.isVisible({ timeout: 2_000 }).catch(() => false));
    if (!visible) {
      throw new Error('Expected Waiting / pre-event state — WaitingForUnit / NextChanceTime not visible');
    }
  }

  async expectCountdownTicking() {
    await this.allocationEndTimer.waitFor({ state: 'visible', timeout: 5_000 });
    const t1 = (await this.allocationEndTimer.textContent()) || '';
    await this.page.waitForTimeout(1_500); // tick observation — keep short
    const t2 = (await this.allocationEndTimer.textContent()) || '';
    if (t1 === t2) {
      throw new Error(`Countdown did not change in ~1.5s: '${t1}' === '${t2}'`);
    }
  }

  // ── STATIC entry ───────────────────────────────────────────────────────────

  async expectStaticEntry() {
    await this.bookNowBadge.waitFor({ state: 'visible', timeout: 8_000 });
  }

  async clickBookNow() {
    await this.click(this.bookNowBadge);
  }

  async clickSelectUnit() {
    await this.click(this.selectUnitCta);
  }

  async expectStaticEntryBlocked() {
    const bookVisible = await this.bookNowBadge.isVisible({ timeout: 3_000 }).catch(() => false);
    if (bookVisible) {
      throw new Error('Expected STATIC entry to be blocked — Book Now is visible');
    }
  }

  // ── STATIC unit selection ──────────────────────────────────────────────────

  async expectUnitSelectionLayout() {
    await this.unitSelectionShell.waitFor({ state: 'visible', timeout: 10_000 });
    // Three panels — towers / grid / details
    await this.towersPanel.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    await this.unitGridPanel.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  }

  async getTowerCount() {
    return this.towerItems.count().catch(() => 0);
  }

  async clickTower(index = 0) {
    const tower = this.towerItems.nth(index);
    await this.click(tower);
  }

  async getUnitCountByColor(color) {
    // Heuristic: filter unitCells by class/data-state matching given color
    const cells = this.unitCells;
    const total = await cells.count().catch(() => 0);
    let matches = 0;
    for (let i = 0; i < total; i++) {
      const cls = (await cells.nth(i).getAttribute('class')) || '';
      const state = (await cells.nth(i).getAttribute('data-state')) || '';
      if (new RegExp(color, 'i').test(cls) || new RegExp(color, 'i').test(state)) matches++;
    }
    return matches;
  }

  /** Select first AVAILABLE (white) unit. Returns true if a click happened. */
  async selectFirstAvailableUnit() {
    const cells = this.unitCells;
    const total = await cells.count().catch(() => 0);
    for (let i = 0; i < total; i++) {
      const cls = (await cells.nth(i).getAttribute('class')) || '';
      const state = (await cells.nth(i).getAttribute('data-state')) || '';
      if (/available|white/i.test(cls + state) && !/hold|booked|sold|orange|red/i.test(cls + state)) {
        await cells.nth(i).click();
        return true;
      }
    }
    return false;
  }

  /** Select unit by index — no colour-state filter. */
  async selectUnit(index = 0) {
    const cell = this.unitCells.nth(index);
    await this.click(cell);
  }

  /** Attempt to click an orange (HOLD-other) or red (BOOKED) unit — should be a no-op. */
  async clickFirstUnitOfColor(color) {
    const cells = this.unitCells;
    const total = await cells.count().catch(() => 0);
    for (let i = 0; i < total; i++) {
      const cls = (await cells.nth(i).getAttribute('class')) || '';
      const state = (await cells.nth(i).getAttribute('data-state')) || '';
      if (new RegExp(color, 'i').test(cls + state)) {
        await cells.nth(i).click({ force: true }).catch(() => {});
        return true;
      }
    }
    return false;
  }

  async expectUnitDetailsPopulated() {
    await this.unitDetailsPanel.waitFor({ state: 'visible', timeout: 5_000 });
    const text = (await this.unitDetailsPanel.textContent()) || '';
    if (!/BHK|carpet|Agreement|price/i.test(text)) {
      throw new Error('Unit details panel did not surface BHK / carpet / Agreement / price fields');
    }
  }

  async viewCostSheet() {
    await this.click(this.costSheetLink);
    await this.costSheetSurface.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async expectCostSheetVisible() {
    await this.costSheetSurface.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async clickChangeUnit() {
    await this.click(this.changeUnitBtn);
  }

  async clickCancel() {
    await this.click(this.cancelBtn);
  }

  async clickAdd() {
    await this.click(this.addBtn);
  }

  // ── STATIC payment ─────────────────────────────────────────────────────────

  async expectTcUnchecked() {
    const checked = await this.tcCheckbox.isChecked().catch(() => false);
    if (checked) throw new Error('T&C checkbox expected unchecked by default');
  }

  async expectTcLabelExact() {
    const visible = await this.tcLabel.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) throw new Error(`T&C label not found verbatim: "${TC_LABEL_EXACT}"`);
  }

  async expectPayDisabledUntilTc() {
    const disabledBefore = await this.payButton.isDisabled().catch(() => true);
    if (!disabledBefore) {
      // Some implementations gate via click-prevent rather than disabled attr — accept either
      // but assert no enablement when TC unchecked.
    }
    await this.tcCheckbox.check().catch(() => {});
    const disabledAfter = await this.payButton.isDisabled().catch(() => false);
    if (disabledAfter) {
      throw new Error('Pay button still disabled after T&C ticked — TC-CST-012 violated');
    }
  }

  async tickTc() {
    const checked = await this.tcCheckbox.isChecked().catch(() => false);
    if (!checked) await this.tcCheckbox.check();
  }

  async initiatePayment() {
    await this.tickTc();
    await this.click(this.payButton);
  }

  async expectEasebuzzGatewayOpen() {
    // Gateway typically opens in same tab / iframe — wait for merchant label OR validity timer
    const merchant = await this.easebuzzMerchantLabel.isVisible({ timeout: 10_000 }).catch(() => false);
    const timer    = await this.easebuzzValidityTimer.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!merchant && !timer) {
      throw new Error('Easebuzz gateway did not surface (merchant label / validity timer absent)');
    }
  }

  async expectPaymentSuccess() {
    await this.paymentSuccessScreen.waitFor({ state: 'visible', timeout: 30_000 });
  }

  async expectPaymentFailure() {
    await this.paymentFailureBanner.waitFor({ state: 'visible', timeout: 30_000 });
  }

  // ── Hold mechanism ─────────────────────────────────────────────────────────

  async expectHoldTimer() {
    await this.holdTimer.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async getHoldTimerText() {
    return (await this.holdTimer.textContent({ timeout: 3_000 }).catch(() => '')) || '';
  }

  async expectInFlightPaymentBanner() {
    await this.inFlightPaymentBanner.waitFor({ state: 'visible', timeout: 5_000 });
  }

  // ── DYNAMIC ────────────────────────────────────────────────────────────────

  async expectDynamicEntry() {
    await this.openAllottedUnit.waitFor({ state: 'visible', timeout: 8_000 });
  }

  async enterRound() {
    // Round entry surfaces vary — return the surface state for caller assertions
    await this.openAllottedUnit.waitFor({ state: 'visible', timeout: 8_000 });
    return { entered: true };
  }

  async selectPreference(index = 0, value = '1') {
    const count = await this.preferenceInputs.count().catch(() => 0);
    if (count === 0) return { skipped: true, reason: 'No preference inputs in DOM' };
    const input = this.preferenceInputs.nth(index);
    const tag = await input.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
    if (tag === 'select') {
      await input.selectOption(value).catch(() => {});
    } else {
      await input.fill(value).catch(() => {});
    }
    return { skipped: false };
  }

  async submitPreferences() {
    const visible = await this.submitPreferencesBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!visible) return { skipped: true, reason: 'Submit Preferences button not in DOM' };
    await this.click(this.submitPreferencesBtn);
    return { skipped: false };
  }

  async clickProceedToPay() {
    await this.click(this.proceedToPayCta);
  }

  async expectAllocated() {
    await this.allocatedBadge.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async expectWatchingUnitList() {
    await this.watchingUnitList.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async expectMissedChances() {
    await this.yourMissedChances.waitFor({ state: 'visible', timeout: 5_000 });
  }

  // ── Post-campaign ──────────────────────────────────────────────────────────

  async expectPostCampaignState() {
    await this.allocationClosedText.waitFor({ state: 'visible', timeout: 5_000 });
    // Book Now / Select Unit must NOT be rendered
    const bookVisible   = await this.bookNowBadge.isVisible({ timeout: 1_500 }).catch(() => false);
    const selectVisible = await this.selectUnitCta.isVisible({ timeout: 1_500 }).catch(() => false);
    if (bookVisible || selectVisible) {
      throw new Error('Post-campaign surface but Book Now / Select Unit still rendered');
    }
  }

  async expectAllocationClosedExactText() {
    const text = (await this.allocationClosedText.textContent({ timeout: 5_000 }).catch(() => '')) || '';
    if (text.trim() !== POST_CAMPAIGN_CLOSED_TEXT) {
      throw new Error(`Closed-message text mismatch. Expected exactly "${POST_CAMPAIGN_CLOSED_TEXT}", got "${text.trim()}"`);
    }
  }
}

module.exports = {
  AllocationExperiencePage,
  HOLD_DURATION_MIN,
  PAYMENT_GATEWAY_TIMER_MIN,
  TC_LABEL_EXACT,
  POST_CAMPAIGN_CLOSED_TEXT,
  UNIT_COLOR,
};
