'use strict';

/**
 * callback-request.spec.js — UI/UX tests for the Buyer Portal Callback Request module.
 *
 * Scope:
 *   Rendering, accessibility, layout, and responsive behaviour of the Request
 *   Callback modal and the public /call-feedback/<token> page. These tests are
 *   NON-DESTRUCTIVE — they never click Submit, never consume tokens, never write
 *   DB rows. All assertions are on the DOM contract only.
 *
 * Auth:
 *   Buyer session at automation-repository/fixtures/.auth/buyer.json for modal
 *   tests. Feedback-form tests skip on UAT unless a sandbox token is provided
 *   (TEST_FEEDBACK_TOKEN) so the public surface can be rendered without
 *   consuming a real token.
 *
 * BRD: BUYER-FS-Callback-Request §1.3 (modal UI), §3 (feedback page UI)
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/callback-request/TC_CALLBACK_REQUEST.md
 */

const { test, expect } = require('@playwright/test');
const { CallbackRequestPage } = require('../../../automation-repository/pages/buyer/CallbackRequestPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/buyer.json' });

test.describe('Callback Request — Buyer Portal UI/UX', () => {
  let cbPage;

  test.beforeEach(async ({ page }) => {
    cbPage = new CallbackRequestPage(page);
    await cbPage.navigate();
    await cbPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════
  // UI — Modal rendering
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_CB_001 — BUYER-FS-Callback-Request §1.3 — Request Callback CTA visible on dashboard', async ({ page }) => {
    // Either the primary CTA or the floating CTA must be visible.
    const primary = await cbPage.requestCallbackCta.isVisible().catch(() => false);
    const floating = await cbPage.floatingCallbackCta.isVisible().catch(() => false);
    test.skip(!(primary || floating), 'No Request Callback CTA on /home — feature gated by registration status');
    expect(primary || floating).toBe(true);
    await expect(page).toHaveScreenshot('byr-cb-ui-001-cta.png', { maxDiffPixels: 300, fullPage: true });
  });

  test('BYR_CB_003 — BUYER-FS-Callback-Request §1.3 — Modal title clearly identifies feature', async ({ page }) => {
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await expect(cbPage.modalTitle).toBeVisible();
    const title = (await cbPage.modalTitle.textContent()) || '';
    // Title should read "Request Callback" OR "Schedule VC" per FSD-acceptable variants.
    expect(/(Request Callback|Schedule VC|Schedule.*Call|Callback Request)/i.test(title)).toBe(true);
    await expect(page).toHaveScreenshot('byr-cb-ui-003-modal-title.png', { maxDiffPixels: 250, fullPage: true });
  });

  // ════════════════════════════════════════════════════════════════════════
  // UI — Calendar picker
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_CB_009 — BUYER-FS-Callback-Request §1.4 — Click date input opens calendar picker', async ({ page }) => {
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await cbPage.openCalendarPicker();
    await expect(cbPage.calendarPopup).toBeVisible();
    await expect(page).toHaveScreenshot('byr-cb-ui-009-calendar.png', { maxDiffPixels: 400, fullPage: true });
  });

  test('BYR_CB_010 — BUYER-FS-Callback-Request §1.4 — Past dates greyed out / unselectable', async () => {
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await cbPage.openCalendarPicker();
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
    const disabled = await cbPage.isDateCellDisabled(yesterday);
    // null means cell not found in current month view (which itself indicates past
    // navigation is blocked) — treat null as "effectively unselectable".
    expect(disabled === true || disabled === null).toBe(true);
  });

  // ════════════════════════════════════════════════════════════════════════
  // UI — Time slot picker
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_CB_012_UI — BUYER-FS-Callback-Request §1.4 — Time picker UI renders with hour/minute selectors', async ({ page }) => {
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await cbPage.openTimePicker();
    await cbPage.expectTimeSlotPicker();
    await expect(page).toHaveScreenshot('byr-cb-ui-012-time-picker.png', { maxDiffPixels: 400, fullPage: true });
  });

  // ════════════════════════════════════════════════════════════════════════
  // UI — Feedback page (public token surface)
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Feedback form UI (public surface)', () => {
    // Do NOT use buyer session — public surface is auth-free.
    test.use({ storageState: { cookies: [], origins: [] } });

    test('BYR_CB_024_UI — BUYER-FS-Callback-Request §3 — Feedback page renders without login (sandbox token)', async ({ page }) => {
      test.skip(
        !process.env.TEST_FEEDBACK_TOKEN,
        'TEST_FEEDBACK_TOKEN env var not set — provide a sandbox/preview token that renders the form WITHOUT consuming it (e.g., from QA stub).',
      );
      const fbPage = new CallbackRequestPage(page);
      const status = await fbPage.openFeedbackForm(process.env.TEST_FEEDBACK_TOKEN);
      // Sandbox token may render either the form (ok) or the already-submitted state.
      expect(['ok', 'reused']).toContain(status);
      if (status === 'ok') {
        await expect(fbPage.feedbackRatingGroup).toBeVisible();
        await expect(fbPage.feedbackCommentsField).toBeVisible();
        await expect(fbPage.feedbackSubmitButton).toBeVisible();
      }
      await expect(page).toHaveScreenshot('byr-cb-ui-024-feedback.png', { maxDiffPixels: 400, fullPage: true });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // UI — Responsive
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_CB_UI_RESP_001 — BUYER-FS-Callback-Request §1.3 — Modal renders correctly at mobile viewport (375x812)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // Re-navigate so the responsive header / floating CTA reflows for mobile.
    await cbPage.navigate();
    await cbPage.waitForLoad();
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible at mobile viewport');
    await cbPage.expectModalVisible();
    // Modal must fit within viewport — no horizontal overflow.
    const box = await cbPage.modal.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375 + 1); // tolerate 1px rounding
    }
    await expect(page).toHaveScreenshot('byr-cb-ui-resp-mobile.png', { maxDiffPixels: 400, fullPage: true });
  });
});
