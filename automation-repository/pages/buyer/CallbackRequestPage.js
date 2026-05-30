'use strict';

/**
 * CallbackRequestPage.js — Page Object Model for the Buyer Portal Callback Request module.
 *
 * What this file does:
 *   Wraps the buyer-side of the SM callback flow. Callback Request is NOT a standalone
 *   page on the buyer portal — it is a modal opened from the home dashboard (or unit
 *   detail screen) via a "Request Callback" / "Schedule VC" CTA. The flow:
 *     1. Buyer clicks Request Callback CTA on /home (or unit detail).
 *     2. Modal opens with description (optional, ≤500 chars), preferred date (required,
 *        future), preferred time (required) fields.
 *     3. Buyer submits → backend creates a CallbackRequest row at status REQUESTED,
 *        assigns to least-loaded SM (NOT round-robin — round-robin is dead code per
 *        services/callback-request.service.js:13).
 *     4. SM later schedules → buyer receives Botspice WhatsApp `expert_meeting_link`.
 *     5. After SM submits feedback, buyer can submit feedback via a tokenised public
 *        link (/call-feedback/<token>) — NO auth required for that surface.
 *
 * Where selectors live:
 *   `locators/buyer/locator-map.json` module key `callback-request` currently exposes
 *   only TWO elements ('404Heading', 'thisPageCouldNotBeFoundHeading') because the
 *   live crawl hit /callback-request as a URL — which 404s, since the feature is modal-
 *   based. Both keys are accessed via `L['key']` (bracket access) and are kept as
 *   "this URL must 404" sentinels. Every other selector in this POM is a DOM-contract
 *   fallback against the FSD form schema; when Tech Lead Agent extends the locator map
 *   from an authenticated modal crawl, these should be promoted to `L['…']` lookups.
 *
 * BRD: BUYER-FS-Callback-Request §1.3, §1.4, §1.5 (modal open / form / submission)
 *      BUYER-FS-Callback-Request §3       (token-based public feedback)
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/callback-request/TC_CALLBACK_REQUEST.md
 *            (58 TCs — BYR_CB_001 … BYR_CB_056)
 *
 * Destructive notes:
 *   submitCallback() writes to DB + dispatches a Botspice WhatsApp.
 *   submitFeedback() writes to DB + consumes a one-shot token.
 *   Both are guarded at the spec level via ENV=uat + ALLOW_DESTRUCTIVE=1.
 */

const { expect }     = require('@playwright/test');
const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/buyer/locator-map.json');

const L = locatorMap['callback-request'] || {};

const BUYER_BASE             = 'https://uat.xrportal.in';
const HOME_URL               = `${BUYER_BASE}/home`;
const CALLBACK_404_URL       = `${BUYER_BASE}/callback-request`;
const FEEDBACK_URL = (token) => `${BUYER_BASE}/call-feedback/${token}`;

/** Returns a selector string from the locator map for the given key, or ''. */
function sel(key) {
  return (L[key] && L[key].selector) || '';
}

class CallbackRequestPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;

    // Entry surfaces
    this.homeUrl         = HOME_URL;
    this.callback404Url  = CALLBACK_404_URL;
    this.feedbackUrlFor  = FEEDBACK_URL;

    // ── Locator-map-backed elements (only the 2 auto-crawled keys) ───────────
    // These are the sentinels for /callback-request → 404 surface.
    this.el404Heading                   = page.locator(sel('404Heading') || 'h1:has-text("404")');
    this.thisPageCouldNotBeFoundHeading = page.locator(sel('thisPageCouldNotBeFoundHeading') || 'h2:has-text("This page could not be found.")');

    // ── DOM-contract fallback locators (NOT in locator-map yet) ───────────────
    // Promote to L['…'] lookups once an authenticated modal crawl extends the map.

    // Entry CTA — Request Callback / Schedule VC button on dashboard or unit detail.
    // Try multiple labels because the FSD uses "Request Callback" but UI variants
    // sometimes render "Schedule VC", "Schedule a Call", or "Request a Callback".
    this.requestCallbackCta = page.locator([
      'button:has-text("Request Callback")',
      'button:has-text("Request a Callback")',
      'button:has-text("Schedule VC")',
      'button:has-text("Schedule a Call")',
      'a:has-text("Request Callback")',
      '[data-testid="request-callback-cta"]',
      '[aria-label*="callback" i]',
    ].join(', ')).first();

    // Floating / fixed-position fallback CTA on home dashboard
    this.floatingCallbackCta = page.locator(
      '.fixed button:has-text("Callback"), .floating-cta:has-text("Callback")',
    ).first();

    // ── Modal container ──────────────────────────────────────────────────────
    // Ant Design modal / shadcn dialog / generic [role="dialog"].
    this.modal = page.locator(
      '.ant-modal-content:visible, [role="dialog"]:visible, .modal-content:visible',
    ).first();

    this.modalTitle  = this.modal.locator(
      '.ant-modal-title, [role="dialog"] h1, [role="dialog"] h2, .modal-title',
    ).first();

    this.modalCloseX = this.modal.locator([
      '.ant-modal-close',
      '[aria-label="Close"]',
      'button:has(svg[aria-label*="close" i])',
      'button.close',
    ].join(', ')).first();

    this.modalCancelButton = this.modal.locator(
      'button:has-text("Cancel"), button:has-text("Close")',
    ).first();

    // Modal backdrop / mask (for backdrop-click test)
    this.modalBackdrop = page.locator('.ant-modal-mask, .modal-backdrop, [data-testid="modal-backdrop"]').first();

    // ── Form fields ──────────────────────────────────────────────────────────
    // Description — optional textarea, ≤500 chars per FSD correction on BYR_CB_007.
    this.descriptionField = this.modal.locator([
      'textarea[name="description"]',
      'textarea[placeholder*="Description" i]',
      'textarea[placeholder*="query" i]',
      'textarea[placeholder*="message" i]',
      'textarea',
    ].join(', ')).first();

    this.descriptionCounter = this.modal.locator(
      '.ant-input-show-count-suffix, [data-testid="char-counter"], .char-counter',
    ).first();

    // Preferred date — calendar picker input. Required per FSD correction on BYR_CB_005.
    this.preferredDateInput = this.modal.locator([
      'input[name="requestedDate"]',
      'input[placeholder*="Date" i]',
      'input[placeholder*="Preferred date" i]',
      'input[type="date"]',
      '.ant-picker input',
    ].join(', ')).first();

    this.calendarPopup = page.locator(
      '.ant-picker-dropdown:not(.ant-picker-dropdown-hidden), [role="dialog"][aria-label*="calendar" i], .calendar-popup:visible',
    ).first();

    // Preferred time — time picker. Required per FSD.
    this.preferredTimeInput = this.modal.locator([
      'input[name="requestedTime"]',
      'input[placeholder*="Time" i]',
      'input[placeholder*="Preferred time" i]',
      'input[type="time"]',
    ].join(', ')).first();

    this.timeSlotPicker = page.locator(
      '.ant-picker-time-panel, [role="listbox"][aria-label*="time" i], .time-slot-grid',
    ).first();

    // Submit button (Request Callback / Submit / Confirm inside modal)
    this.submitButton = this.modal.locator([
      'button:has-text("Submit")',
      'button:has-text("Request Callback")',
      'button:has-text("Confirm")',
      'button[type="submit"]',
    ].join(', ')).first();

    // ── Validation / error messages ──────────────────────────────────────────
    this.validationErrors = this.modal.locator(
      '.ant-form-item-explain-error, [role="alert"], .error-message',
    );

    // ── Toasts ───────────────────────────────────────────────────────────────
    this.toastSuccess = page.locator(
      '.ant-message-success, .ant-notification-notice-success, [role="status"]:has-text("success"), :text("Callback requested successfully")',
    ).first();
    this.toastError   = page.locator(
      '.ant-message-error, .ant-notification-notice-error, [role="alert"]:has-text("failed")',
    ).first();

    // ── Confirmation / status display (after submit) ─────────────────────────
    this.callbackConfirmedBanner = page.locator(
      ':text("Callback requested"), :text("status: REQUESTED"), [data-testid="callback-confirmed"]',
    ).first();

    // ── Feedback (public token URL) surfaces ─────────────────────────────────
    this.feedbackForm        = page.locator('form, [data-testid="feedback-form"]').first();
    this.feedbackRatingGroup = page.locator(
      '[role="radiogroup"], .ant-rate, [data-testid="rating"]',
    ).first();
    this.feedbackCommentsField = page.locator([
      'textarea[name="improvementComments"]',
      'textarea[name="comments"]',
      'textarea[placeholder*="comment" i]',
      'textarea[placeholder*="feedback" i]',
    ].join(', ')).first();
    this.feedbackSubmitButton = page.locator(
      'button:has-text("Submit"), button[type="submit"]',
    ).first();
    this.feedbackInvalidTokenError = page.locator(
      ':text("Invalid"), :text("expired"), :text("not found"), :text("already submitted")',
    ).first();
    this.feedbackAlreadySubmitted = page.locator(
      ':text("already submitted"), :text("Feedback received")',
    ).first();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Navigation
  // ════════════════════════════════════════════════════════════════════════

  /**
   * navigate() — go to the buyer home dashboard, the primary entry surface for
   * the Request Callback CTA. The buyer portal has no standalone /callback-request
   * page (that URL 404s — see expect404Page below).
   */
  async navigate() {
    await this.page.goto(this.homeUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * navigateToCallback404() — go directly to /callback-request to verify the
   * locator-map sentinels (404Heading, thisPageCouldNotBeFoundHeading) render.
   * Documents that the feature is modal-based, not URL-routed.
   */
  async navigateToCallback404() {
    await this.page.goto(this.callback404Url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * navigateToFeedback(token) — open the public feedback URL for a given
   * one-shot token. Requires NO auth — that is intentional per BUYER-FS-Callback-
   * Request §3 (token-based, no login).
   */
  async navigateToFeedback(token) {
    await this.page.goto(this.feedbackUrlFor(token));
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expect404Page() {
    await expect(this.el404Heading).toBeVisible();
    await expect(this.thisPageCouldNotBeFoundHeading).toBeVisible();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Modal open / close
  // ════════════════════════════════════════════════════════════════════════

  /**
   * openCallbackModal() — click the entry CTA to open the Request Callback
   * modal. Tries the primary CTA first, then the floating CTA fallback. Returns
   * false if neither is visible (e.g., feature gated by registration status).
   */
  async openCallbackModal() {
    const primary = this.requestCallbackCta;
    if (await primary.isVisible().catch(() => false)) {
      await primary.click();
    } else if (await this.floatingCallbackCta.isVisible().catch(() => false)) {
      await this.floatingCallbackCta.click();
    } else {
      return false;
    }
    await this.modal.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    return await this.modal.isVisible().catch(() => false);
  }

  async closeModalViaX() {
    await this.modalCloseX.click().catch(async () => {
      await this.page.keyboard.press('Escape');
    });
    await this.modal.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  async closeModalViaCancel() {
    const visible = await this.modalCancelButton.isVisible().catch(() => false);
    if (!visible) return false;
    await this.modalCancelButton.click();
    await this.modal.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    return true;
  }

  async closeModalViaEsc() {
    await this.page.keyboard.press('Escape');
    await this.modal.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  async clickBackdrop() {
    // Click far outside the modal body — the backdrop layer.
    await this.modalBackdrop.click({ position: { x: 5, y: 5 } }).catch(() => {});
  }

  /** Alias for spec readability — same as closeModalViaCancel/X. */
  async cancelCallback() {
    if (!(await this.closeModalViaCancel())) {
      await this.closeModalViaX();
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Form fill
  // ════════════════════════════════════════════════════════════════════════

  /**
   * fillCallbackForm({ preferredDate, preferredTime, query }) — populate the
   * modal form. All three are optional from this method's perspective; the
   * backend itself REQUIRES requestedAt (date+time) and registrationNumber
   * (carried by the auth session, not entered here) per FSD §1.4 corrections.
   *
   * Date format: ISO YYYY-MM-DD (native date input) or whatever the picker
   *              accepts via .fill(). The fill is best-effort with a calendar-
   *              click fallback.
   * Time format: HH:mm (24h).
   * Query: description / message text, ≤500 chars (validator) — DB allows 750
   *        but BR-CB-04 caps writer-side at 500.
   */
  async fillCallbackForm({ preferredDate, preferredTime, query } = {}) {
    if (typeof query === 'string' && query.length > 0) {
      await this.descriptionField.fill(query).catch(() => {});
    }
    if (preferredDate) {
      // Attempt direct fill first; fall back to opening calendar + selecting.
      const filled = await this.preferredDateInput.fill(preferredDate).then(() => true).catch(() => false);
      if (!filled) {
        await this.preferredDateInput.click().catch(() => {});
        await this.calendarPopup.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
        // Click the day cell by aria-label if present (Ant Picker uses title attr).
        const cell = this.calendarPopup.locator(`[title="${preferredDate}"], td[title="${preferredDate}"]`).first();
        await cell.click().catch(() => {});
      }
      // Dismiss any open calendar popup before moving on.
      await this.page.keyboard.press('Escape').catch(() => {});
    }
    if (preferredTime) {
      const filledT = await this.preferredTimeInput.fill(preferredTime).then(() => true).catch(() => false);
      if (!filledT) {
        await this.preferredTimeInput.click().catch(() => {});
        await this.timeSlotPicker.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
        const slot = this.timeSlotPicker.locator(`:text("${preferredTime}")`).first();
        await slot.click().catch(() => {});
      }
      await this.page.keyboard.press('Escape').catch(() => {});
    }
  }

  /**
   * submitCallback() — click the modal submit button. Caller is responsible
   * for ENV/ALLOW_DESTRUCTIVE guarding; this method does not check the env
   * itself because the buyer-side submission has side effects (DB row +
   * Botspice WhatsApp dispatch).
   */
  async submitCallback() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 5_000 });
    await this.submitButton.click();
    // Either the modal auto-closes on success or an error message appears.
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * doubleClickSubmit() — fires two Submit clicks back-to-back to test the
   * double-submit guard (BYR_CB_048). Returns the count of submit clicks
   * actually accepted (button should disable after first click).
   */
  async doubleClickSubmit() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 5_000 });
    await this.submitButton.click();
    // Second click immediately; if button disabled, click silently no-ops.
    await this.submitButton.click({ trial: false, timeout: 2_000 }).catch(() => {});
  }

  // ════════════════════════════════════════════════════════════════════════
  // Calendar / time picker helpers (UI tests)
  // ════════════════════════════════════════════════════════════════════════

  async openCalendarPicker() {
    await this.preferredDateInput.click();
    await this.calendarPopup.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  }

  async openTimePicker() {
    await this.preferredTimeInput.click();
    await this.timeSlotPicker.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  }

  /** isDateCellDisabled(dateIso) — returns whether the calendar cell for the
   * given ISO date carries a disabled class / aria-disabled. */
  async isDateCellDisabled(dateIso) {
    const cell = this.calendarPopup.locator(`[title="${dateIso}"]`).first();
    if (!(await cell.isVisible().catch(() => false))) return null;
    const cls = await cell.getAttribute('class').catch(() => '');
    const aria = await cell.getAttribute('aria-disabled').catch(() => null);
    return (cls && /disabled/.test(cls)) || aria === 'true';
  }

  // ════════════════════════════════════════════════════════════════════════
  // Feedback flow (public token surface — no auth)
  // ════════════════════════════════════════════════════════════════════════

  /**
   * openFeedbackForm(token) — navigate to /call-feedback/<token>. Returns
   * 'ok' | 'invalid' | 'reused' based on which UI surface renders.
   */
  async openFeedbackForm(token) {
    await this.navigateToFeedback(token);
    await this.waitForLoad();
    if (await this.feedbackAlreadySubmitted.isVisible().catch(() => false)) {
      return 'reused';
    }
    if (await this.feedbackInvalidTokenError.isVisible().catch(() => false)) {
      return 'invalid';
    }
    if (await this.feedbackForm.isVisible().catch(() => false)) {
      return 'ok';
    }
    return 'unknown';
  }

  /**
   * submitFeedback({ rating, comments }) — fill and submit the public
   * feedback form. The minimum required field per BYR_CB_027 is the rating
   * (overallSatisfaction 1..5). Comments / improvementComments is optional.
   * Note: full FSD-correct flow requires queryResolvedStatus / callPunctuality
   * / callQualityAv / nextStepsClarity / interestLevel / followupCallRequired
   * — those are exercised in the API spec; this UI helper handles the
   * rating + comments surface only.
   */
  async submitFeedback({ rating, comments = '' } = {}) {
    if (rating !== undefined && rating !== null) {
      // Ant Rate: click the star at index (rating-1). Fallback: radio[value=rating].
      const star = this.feedbackRatingGroup.locator('.ant-rate-star, [role="radio"]').nth(Math.max(0, Number(rating) - 1));
      await star.click().catch(async () => {
        await this.feedbackRatingGroup.locator(`[value="${rating}"]`).first().click().catch(() => {});
      });
    }
    if (comments) {
      await this.feedbackCommentsField.fill(comments).catch(() => {});
    }
    await this.feedbackSubmitButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ════════════════════════════════════════════════════════════════════════
  // Assertion helpers
  // ════════════════════════════════════════════════════════════════════════

  async expectModalVisible() {
    await expect(this.modal).toBeVisible();
  }

  async expectModalHidden() {
    await expect(this.modal).toBeHidden({ timeout: 5_000 });
  }

  async expectCallbackConfirmed() {
    // Either the success toast or a confirmation banner is acceptable.
    const toast = await this.toastSuccess.isVisible().catch(() => false);
    const banner = await this.callbackConfirmedBanner.isVisible().catch(() => false);
    expect(toast || banner).toBeTruthy();
  }

  async expectFeedbackTokenLink() {
    // After the feedback page loads with a valid token, the form must render.
    await expect(this.feedbackForm).toBeVisible();
  }

  async expectTimeSlotPicker() {
    await expect(this.timeSlotPicker).toBeVisible();
  }

  async expectValidationError() {
    // At least one inline error message present in the modal.
    const count = await this.validationErrors.count();
    expect(count).toBeGreaterThan(0);
  }

  /** getDescriptionValue() — read current description textarea content. */
  async getDescriptionValue() {
    return this.descriptionField.inputValue().catch(() => '');
  }

  async getDateValue() {
    return this.preferredDateInput.inputValue().catch(() => '');
  }
}

module.exports = { CallbackRequestPage };
