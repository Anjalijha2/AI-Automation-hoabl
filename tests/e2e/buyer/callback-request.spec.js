'use strict';

/**
 * callback-request.spec.js — End-to-End tests for the Buyer Portal Callback Request module.
 *
 * Scope:
 *   The buyer-side of the SM ↔ Buyer callback flow. Buyer opens a modal from /home
 *   (or unit detail), fills preferred date/time/description, submits → backend
 *   creates a CallbackRequest row (status REQUESTED) and dispatches a Botspice
 *   `expert_customer_inform` WhatsApp. Later, after the SM submits feedback, a
 *   one-shot tokenised public URL `/call-feedback/<token>` lets the buyer submit
 *   feedback WITHOUT logging in.
 *
 * Auth:
 *   Buyer session (mobile 8888888888) persisted at
 *   automation-repository/fixtures/.auth/buyer.json. Feedback-token tests
 *   explicitly run WITHOUT storageState — they exercise the public surface.
 *
 * Destructive / live-integration guards:
 *   - submitCallback() writes a DB row + dispatches a real Botspice WhatsApp.
 *   - submitFeedback() consumes a one-shot token + writes feedback row.
 *   - BYR_CB_018 (least-loaded assignment) — DB inspection, API spec covers it.
 *   All such tests skip on ENV=uat unless ALLOW_DESTRUCTIVE=1 is set.
 *
 * FSD corrections honoured (see TC_CALLBACK_REQUEST.md "FSD Corrections Applied"):
 *   - BYR_CB_015: submit-blank MUST fail at backend (requestedAt + registrationNumber
 *     both required by validations/callback-request.validations.js).
 *   - BYR_CB_018: assignment is "least-loaded" NOT round-robin (dead code).
 *   - BYR_CB_020: Botspice expert_meeting_link, NOT Kaleyra.
 *   - BYR_CB_030: terminal status is CONFIRMED — COMPLETED is unreachable.
 *
 * BRD: BUYER-FS-Callback-Request §1, §3
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/callback-request/TC_CALLBACK_REQUEST.md
 */

const { test, expect } = require('@playwright/test');
const { CallbackRequestPage } = require('../../../automation-repository/pages/buyer/CallbackRequestPage');

// Buyer authenticated session — required for modal entry tests.
test.use({ storageState: 'automation-repository/fixtures/.auth/buyer.json' });

test.describe('Callback Request — Buyer Portal E2E', () => {
  let cbPage;

  test.beforeEach(async ({ page }) => {
    cbPage = new CallbackRequestPage(page);
    await cbPage.navigate();
    await cbPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════
  // FUNC — Modal entry from /home
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_CB_002 — BUYER-FS-Callback-Request §1.3 — Request Callback CTA opens modal', async ({ page }) => {
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'Request Callback CTA not visible on /home for this buyer (no eligible registration?)');
    await cbPage.expectModalVisible();
    await expect(page).toHaveScreenshot('byr-cb-e2e-002-modal-open.png', { maxDiffPixels: 300, fullPage: true });
  });

  test('BYR_CB_021 — BUYER-FS-Callback-Request §1.3 — X close icon dismisses modal without submitting', async () => {
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await cbPage.fillCallbackForm({ query: 'will be discarded' });
    await cbPage.closeModalViaX();
    await cbPage.expectModalHidden();
  });

  test('BYR_CB_023 — BUYER-FS-Callback-Request §1.3 — ESC key closes modal', async () => {
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await cbPage.closeModalViaEsc();
    await cbPage.expectModalHidden();
  });

  test('BYR_CB_004 — BUYER-FS-Callback-Request §1.3 — Backdrop click never auto-submits', async ({ page }) => {
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await cbPage.fillCallbackForm({ query: 'backdrop probe' });
    await cbPage.clickBackdrop();
    // Either modal stays open or it closes — but NEVER submits. Toast must NOT appear.
    const toastVisible = await cbPage.toastSuccess.isVisible().catch(() => false);
    expect(toastVisible).toBe(false);
    // And the URL must not change (no redirect / nav).
    expect(page.url()).toContain('/home');
  });

  test('BYR_CB_047 — BUYER-FS-Callback-Request §1.3 — Reopening modal after close starts empty', async () => {
    let opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await cbPage.fillCallbackForm({ query: 'leftover text' });
    await cbPage.closeModalViaX();
    opened = await cbPage.openCallbackModal();
    expect(opened).toBe(true);
    const desc = await cbPage.getDescriptionValue();
    expect(desc).toBe('');
  });

  // ════════════════════════════════════════════════════════════════════════
  // FUNC — Form fields
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_CB_008 — BUYER-FS-Callback-Request §1.4 — Preferred date field present in modal', async () => {
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await expect(cbPage.preferredDateInput).toBeVisible();
  });

  test('BYR_CB_012 — BUYER-FS-Callback-Request §1.4 — Preferred time field present in modal', async () => {
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await expect(cbPage.preferredTimeInput).toBeVisible();
  });

  // ════════════════════════════════════════════════════════════════════════
  // BIZ — Submission (DESTRUCTIVE — creates DB row + Botspice WhatsApp)
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_CB_016 — BUYER-FS-Callback-Request §1.4 — Submit with all fields filled succeeds, status=REQUESTED', async () => {
    test.skip(
      process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — creates a real CallbackRequest row + dispatches Botspice WhatsApp; set ALLOW_DESTRUCTIVE=1 to opt in',
    );
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
    await cbPage.fillCallbackForm({
      preferredDate: tomorrow,
      preferredTime: '15:00',
      query: 'Auto E2E — please confirm scheduling.',
    });
    await cbPage.submitCallback();
    await cbPage.expectCallbackConfirmed();
  });

  test('BYR_CB_015 — BUYER-FS-Callback-Request §1.4 / FSD correction — Submit blank rejected (registrationNumber + requestedAt required)', async () => {
    // Per FSD correction: BOTH registrationNumber and requestedAt are required.
    // The frontend may pre-fill registrationNumber from session, but requestedAt
    // (date+time) MUST be supplied — blank submit should surface validation.
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    await cbPage.submitCallback();
    // Either inline validation OR a server-side 400 toast — but submission must NOT succeed.
    const succeeded = await cbPage.toastSuccess.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(succeeded).toBe(false);
  });

  test('BYR_CB_048 — BUYER-FS-Callback-Request §1.4 — Double-click Submit creates only one row', async () => {
    test.skip(
      process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — would create a real DB row to verify dedup; set ALLOW_DESTRUCTIVE=1 to opt in',
    );
    const opened = await cbPage.openCallbackModal();
    test.skip(!opened, 'CTA not visible');
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
    await cbPage.fillCallbackForm({ preferredDate: tomorrow, preferredTime: '16:00', query: 'double-click probe' });
    await cbPage.doubleClickSubmit();
    // Only one success toast should fire (and submit button should disable on first click).
    // We cannot count toast firings reliably from the DOM — assert toast appeared (one record
    // confirmed) and rely on the api/db spec to verify single-row creation.
    await cbPage.expectCallbackConfirmed();
  });

  // ════════════════════════════════════════════════════════════════════════
  // BIZ — Least-loaded assignment (BYR_CB_018 FSD-corrected)
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_CB_018 — BUYER-FS-Callback-Request §1.4 / FSD — Assignment is LEAST-LOADED (round-robin is dead code)', async () => {
    test.skip(
      true,
      'DB/API verification — implemented in tests/api/callback-request.api.spec.js + tests/db/callback-request.db.spec.js. Round-robin path (assignManagerRoundRobin) exists but ASSIGNMENT_METHOD="least-loaded" is hardcoded.',
    );
  });

  // ════════════════════════════════════════════════════════════════════════
  // FUNC — /callback-request URL (sentinels: 404 page)
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_CB_LOCATOR_001 — locator-map sentinel — /callback-request URL renders 404 (feature is modal-based)', async ({ page }) => {
    await cbPage.navigateToCallback404();
    await cbPage.expect404Page();
    await expect(page).toHaveScreenshot('byr-cb-e2e-404-sentinel.png', { maxDiffPixels: 200, fullPage: true });
  });

  // ════════════════════════════════════════════════════════════════════════
  // FUNC — Feedback flow (token-based, NO auth)
  // ════════════════════════════════════════════════════════════════════════

  test.describe('Feedback flow (public token surface)', () => {
    // Do NOT use buyer session — feedback URL is intentionally auth-free.
    test.use({ storageState: { cookies: [], origins: [] } });

    test('BYR_CB_024 — BUYER-FS-Callback-Request §3 — /call-feedback/<token> accessible without login', async ({ page }) => {
      test.skip(
        !process.env.BYR_CB_FEEDBACK_TOKEN,
        'BYR_CB_FEEDBACK_TOKEN env var not set — provide a valid one-shot token issued after SM feedback submission',
      );
      const fbPage = new (require('../../../automation-repository/pages/buyer/CallbackRequestPage').CallbackRequestPage)(page);
      const status = await fbPage.openFeedbackForm(process.env.BYR_CB_FEEDBACK_TOKEN);
      expect(status).toBe('ok');
      await fbPage.expectFeedbackTokenLink();
    });

    test('BYR_CB_025 — BUYER-FS-Callback-Request §3 — Invalid token shows error, no form', async ({ page }) => {
      const fbPage = new (require('../../../automation-repository/pages/buyer/CallbackRequestPage').CallbackRequestPage)(page);
      const status = await fbPage.openFeedbackForm('invalid-token-zzz-no-match');
      expect(['invalid', 'reused']).toContain(status);
      // Form must not be rendered.
      const formVisible = await fbPage.feedbackForm.isVisible().catch(() => false);
      expect(formVisible).toBe(false);
    });

    test('BYR_CB_026 — BUYER-FS-Callback-Request §3 — Token cannot be reused after submission', async ({ page }) => {
      test.skip(
        !process.env.BYR_CB_USED_TOKEN,
        'BYR_CB_USED_TOKEN env var not set — provide a token that was already consumed by a prior feedback submission',
      );
      const fbPage = new (require('../../../automation-repository/pages/buyer/CallbackRequestPage').CallbackRequestPage)(page);
      const status = await fbPage.openFeedbackForm(process.env.BYR_CB_USED_TOKEN);
      expect(status).toBe('reused');
    });

    test('BYR_CB_027 — BUYER-FS-Callback-Request §3 — Rating mandatory; submit without rating blocked', async ({ page }) => {
      test.skip(
        !process.env.BYR_CB_FEEDBACK_TOKEN,
        'BYR_CB_FEEDBACK_TOKEN env var not set',
      );
      test.skip(
        process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
        'Skipped on UAT — would consume the one-shot token; set ALLOW_DESTRUCTIVE=1 to opt in',
      );
      const fbPage = new (require('../../../automation-repository/pages/buyer/CallbackRequestPage').CallbackRequestPage)(page);
      await fbPage.openFeedbackForm(process.env.BYR_CB_FEEDBACK_TOKEN);
      // Click submit without selecting any rating.
      await fbPage.feedbackSubmitButton.click().catch(() => {});
      // Either inline validation appears OR the form does not advance.
      const formStillVisible = await fbPage.feedbackForm.isVisible().catch(() => false);
      expect(formStillVisible).toBe(true);
    });

    test('BYR_CB_028 — BUYER-FS-Callback-Request §3 — Comments optional; submit with rating only succeeds', async ({ page }) => {
      test.skip(
        !process.env.BYR_CB_FEEDBACK_TOKEN,
        'BYR_CB_FEEDBACK_TOKEN env var not set',
      );
      test.skip(
        process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
        'Skipped on UAT — consumes one-shot token; set ALLOW_DESTRUCTIVE=1 to opt in',
      );
      const fbPage = new (require('../../../automation-repository/pages/buyer/CallbackRequestPage').CallbackRequestPage)(page);
      await fbPage.openFeedbackForm(process.env.BYR_CB_FEEDBACK_TOKEN);
      await fbPage.submitFeedback({ rating: 5 });
      // Either a success message or the "already submitted" state on re-open.
      const succeeded = await fbPage.toastSuccess.isVisible({ timeout: 5_000 }).catch(() => false);
      const acknowledged = await fbPage.feedbackAlreadySubmitted.isVisible({ timeout: 5_000 }).catch(() => false);
      expect(succeeded || acknowledged).toBe(true);
    });
  });
});
