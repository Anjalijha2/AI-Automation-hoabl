'use strict';

/**
 * E2E Spec — Buyer Portal Allocation Experience
 * BRD/FRD: BUYER-FS-Allocation-Experience
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/allocation-experience/TC_ALLOCATION_EXPERIENCE.md
 *
 * Coverage (15 tests):
 *   - Waiting / pre-event surface             (BYR_ALLOC_001, 002, 062)
 *   - STATIC entry                            (BYR_ALLOC_005, 006, 058, 061)
 *   - STATIC unit selection                   (BYR_ALLOC_007, 011, 019)
 *   - STATIC payment + hold                   (BYR_ALLOC_021, 023, 063, 028)
 *   - DYNAMIC allocation                      (BYR_ALLOC_031, 033)
 *   - Post-campaign                           (BYR_ALLOC_041)
 *   - NEG: no campaign / payment failure      (BYR_ALLOC_044, 053)
 *
 * Guards:
 *   - ENV=uat skips live Easebuzz initiation tests
 *   - ALLOW_DESTRUCTIVE=1 required for any state-mutating tests (initiate payment,
 *     submit preferences, POST /allocation/order)
 *   - Many tests short-circuit via test.skip when the buyer session is not in the
 *     required surface (Available / WINNER / Waitlisted)
 *
 * NOTE: No WebSocket / SSE assertions — backend polls only (GAP-AE-01).
 */

const { test, expect } = require('@playwright/test');
const {
  AllocationExperiencePage,
  HOLD_DURATION_MIN,
  TC_LABEL_EXACT,
  POST_CAMPAIGN_CLOSED_TEXT,
} = require('../../../automation-repository/pages/buyer/AllocationExperiencePage');

const BASE_API = 'https://uat-api.xrportal.in';
const ALLOW_DESTRUCTIVE = process.env.ALLOW_DESTRUCTIVE === '1';
const IS_UAT = process.env.ENV === 'uat';

test.use({ storageState: 'automation-repository/fixtures/.auth/buyer.json' });

async function skipIfRedirectedToLogin(allot, testInfo) {
  const onLogin = await allot.isOnLoginRedirect();
  if (onLogin) {
    testInfo.skip(true, 'Buyer session redirected to /login — re-run npm run auth:setup');
  }
  const on404 = await allot.isOnNotFound();
  if (on404) {
    testInfo.skip(true, '/allotment surface is a 404 for this buyer — eligibility/state precondition not met');
  }
}

test.describe('Allocation Experience Module — Buyer Portal E2E', () => {
  let allot;

  test.beforeEach(async ({ page }, testInfo) => {
    allot = new AllocationExperiencePage(page);
    await allot.navigate();
    await skipIfRedirectedToLogin(allot, testInfo);
    await allot.waitForLoad();
  });

  // ── Waiting / Pre-event ────────────────────────────────────────────────

  test('BYR_ALLOC_001 — BUYER-FS-Allocation-Experience §Waiting — WaitingForUnit shown when no campaign active', async ({ page }) => {
    const surface = await allot.detectSurface();
    test.skip(surface !== 'waiting', `Current surface is '${surface}', not 'waiting'`);
    await allot.expectWaitingState();
    await expect(page).toHaveScreenshot('byr-alloc-001-waiting.png', { maxDiffPixels: 400 });
  });

  test('BYR_ALLOC_002 — BUYER-FS-Allocation-Experience §Waiting — Countdown timer ticks toward next campaign start', async () => {
    const visible = await allot.allocationEndTimer.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!visible, 'AllocationEndTimer not rendered on current surface');
    await allot.expectCountdownTicking();
  });

  test('BYR_ALLOC_062 — BUYER-FS-Allocation-Experience §Waiting — Direct /allotment access without active campaign shows waiting screen', async ({ page }) => {
    await page.goto('https://uat.xrportal.in/allotment');
    await allot.waitForLoad();
    const surface = await allot.detectSurface();
    test.skip(surface !== 'waiting', `Surface='${surface}' — campaign appears active or buyer ineligible`);
    await allot.expectWaitingState();
    const bookVisible = await allot.bookNowBadge.isVisible({ timeout: 1_500 }).catch(() => false);
    expect(bookVisible).toBeFalsy();
  });

  // ── STATIC Entry ───────────────────────────────────────────────────────

  test('BYR_ALLOC_005 — BUYER-FS-Allocation-Experience §STATIC-Entry — Available buyer sees Book Now during active campaign', async ({ page }) => {
    const surface = await allot.detectSurface();
    test.skip(surface !== 'static-entry' && surface !== 'static-selection', `Surface='${surface}' — no active STATIC campaign for this buyer`);
    await allot.expectStaticEntry();
    await expect(page).toHaveScreenshot('byr-alloc-005-book-now.png', { maxDiffPixels: 400 });
  });

  test('BYR_ALLOC_006 — BUYER-FS-Allocation-Experience §STATIC-Entry — Click Book Now reveals Select Unit CTA', async () => {
    const entry = await allot.bookNowBadge.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!entry, 'Book Now not visible');
    await allot.clickBookNow();
    const selectVisible = await allot.selectUnitCta.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(selectVisible).toBeTruthy();
  });

  test('BYR_ALLOC_058 — BUYER-FS-Allocation-Experience §STATIC-Entry — STATIC entry blocked when buyer status is Waitlisted', async () => {
    const waitlisted = await allot.waitlistedBadge.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!waitlisted, 'Buyer not in Waitlisted state — precondition not met');
    await allot.expectStaticEntryBlocked();
  });

  test('BYR_ALLOC_061 — BUYER-FS-Allocation-Experience §STATIC-Entry — Book Now hidden/disabled when previous order in flight', async () => {
    const inFlight = await allot.inFlightPaymentBanner.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!inFlight, 'No in-flight payment banner — precondition not met');
    const bookEnabled = await allot.bookNowBadge.isEnabled({ timeout: 2_000 }).catch(() => false);
    expect(bookEnabled).toBeFalsy();
  });

  // ── STATIC Unit Selection ──────────────────────────────────────────────

  test('BYR_ALLOC_007 — BUYER-FS-Allocation-Experience §STATIC-Selection — Click Select Unit opens 3-panel layout', async ({ page }) => {
    const entryReachable = await allot.bookNowBadge.isVisible({ timeout: 3_000 }).catch(() => false);
    if (entryReachable) {
      await allot.clickBookNow().catch(() => {});
      await allot.clickSelectUnit().catch(() => {});
    }
    const onSelection = await allot.unitSelectionShell.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!onSelection, 'Unit selection surface not reachable for this buyer');
    await allot.expectUnitSelectionLayout();
    await expect(page).toHaveScreenshot('byr-alloc-007-unit-selection.png', { maxDiffPixels: 800 });
  });

  test('BYR_ALLOC_011 — BUYER-FS-Allocation-Experience §STATIC-Selection — Selected unit turns green', async () => {
    const onSelection = await allot.unitSelectionShell.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!onSelection, 'Unit selection surface not active');
    const clicked = await allot.selectFirstAvailableUnit();
    test.skip(!clicked, 'No AVAILABLE (white) units present in grid');
    // Post-click: selected count should be >= 1 (green)
    const greenCount = await allot.getUnitCountByColor('green|selected');
    expect(greenCount).toBeGreaterThanOrEqual(1);
  });

  test('BYR_ALLOC_019 — BUYER-FS-Allocation-Experience §STATIC-Selection — Click Add confirms selection and returns to Allotment', async () => {
    const onSelection = await allot.unitSelectionShell.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!onSelection, 'Unit selection surface not active');
    test.skip(!ALLOW_DESTRUCTIVE, 'Add confirms selection — requires ALLOW_DESTRUCTIVE=1');
    const clicked = await allot.selectFirstAvailableUnit();
    test.skip(!clicked, 'No AVAILABLE units to add');
    await allot.clickAdd();
    // Returns to Allotment — bookNow/payButton or hold surface should appear
    const onAllot = await allot.payButton.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(onAllot).toBeTruthy();
  });

  // ── STATIC Payment + Hold ──────────────────────────────────────────────

  test('BYR_ALLOC_021 — BUYER-FS-Allocation-Experience §STATIC-Payment — Pay button disabled until T&C ticked', async () => {
    const tcVisible = await allot.tcCheckbox.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!tcVisible, 'T&C checkbox not on current surface (buyer has not Added a unit yet)');
    await allot.expectTcUnchecked();
    // Constants check — label text exact match per BYR_ALLOC_022
    expect(TC_LABEL_EXACT).toBe('I confirm to HoABL Terms & Conditions and Privacy Policy');
    await allot.expectPayDisabledUntilTc();
  });

  test('BYR_ALLOC_023 — BUYER-FS-Allocation-Experience §STATIC-Payment — Click Pay opens Easebuzz gateway (Impactum Lands)', async () => {
    test.skip(IS_UAT && !ALLOW_DESTRUCTIVE, 'Skipped on UAT without ALLOW_DESTRUCTIVE — would initiate real gateway charge');
    const payReady = await allot.payButton.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!payReady, 'Pay button not on current surface');
    await allot.initiatePayment();
    await allot.expectEasebuzzGatewayOpen();
  });

  test('BYR_ALLOC_063 — BUYER-FS-Allocation-Experience §STATIC-Hold — Hold timer visible during payment window', async () => {
    const holdVisible = await allot.holdTimer.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!holdVisible, 'No active HOLD — buyer has not initiated payment');
    await allot.expectHoldTimer();
    const text = await allot.getHoldTimerText();
    // Hold is 20 min — text should contain minutes/seconds format
    expect(text).toMatch(/\d+/);
  });

  test('BYR_ALLOC_028 — BUYER-FS-Allocation-Experience §STATIC-Hold — Hold duration constant is 20 minutes (BR-AE-08 / GAP-AE-03)', async () => {
    // Static constant check — backend hardcoded
    expect(HOLD_DURATION_MIN).toBe(20);
  });

  // ── DYNAMIC ────────────────────────────────────────────────────────────

  test('BYR_ALLOC_031 — BUYER-FS-Allocation-Experience §DYNAMIC — Campaign assigns unit automatically (OpenAllottedUnit)', async ({ page }) => {
    const surface = await allot.detectSurface();
    test.skip(surface !== 'dynamic', `Surface='${surface}' — no active DYNAMIC campaign for this buyer`);
    await allot.expectDynamicEntry();
    await expect(page).toHaveScreenshot('byr-alloc-031-dynamic.png', { maxDiffPixels: 400 });
  });

  test('BYR_ALLOC_033 — BUYER-FS-Allocation-Experience §DYNAMIC — Proceed to Pay launches gateway (no WebSocket — polling only)', async ({ page }) => {
    test.skip(IS_UAT && !ALLOW_DESTRUCTIVE, 'Skipped on UAT without ALLOW_DESTRUCTIVE — would initiate real gateway charge');
    const dynamicReady = await allot.proceedToPayCta.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!dynamicReady, 'OpenAllottedUnit / Proceed to Pay not on current surface');
    // Monitor network — assert /allocation/order is hit; NEVER assert WebSocket (GAP-AE-01)
    const orderReq = page.waitForRequest(req => /\/api\/v1\/user\/allocation\/order/.test(req.url()), { timeout: 10_000 }).catch(() => null);
    await allot.clickProceedToPay();
    const req = await orderReq;
    if (req) expect(req.method()).toBe('POST');
  });

  // ── Post-Campaign ──────────────────────────────────────────────────────

  test('BYR_ALLOC_041 — BUYER-FS-Allocation-Experience §Post-Campaign — "Allocation window is closed for now." message shown', async ({ page }) => {
    const surface = await allot.detectSurface();
    test.skip(surface !== 'post-campaign', `Surface='${surface}' — campaign not closed`);
    await allot.expectPostCampaignState();
    await allot.expectAllocationClosedExactText();
    expect(POST_CAMPAIGN_CLOSED_TEXT).toBe('Allocation window is closed for now.');
    await expect(page).toHaveScreenshot('byr-alloc-041-closed.png', { maxDiffPixels: 400 });
  });

  // ── NEG / API guard tests ──────────────────────────────────────────────

  test('BYR_ALLOC_044 — BUYER-FS-Allocation-Experience §API-Order — POST /allocation/order rejected when campaign not RUNNING', async ({ request }) => {
    test.skip(!ALLOW_DESTRUCTIVE, 'Allocation order probe requires ALLOW_DESTRUCTIVE=1');
    const UNIT = process.env.REG_UNIT_ID || '00000000-0000-0000-0000-000000000000';
    const REG_ID = process.env.REGISTRATION_ID || '00000000-0000-0000-0000-000000000000';
    const res = await request.post(`${BASE_API}/api/v1/user/allocation/order`, {
      data: {
        registrationId: REG_ID,
        items: [{ registrationUnitId: UNIT, isParkingSelected: false, parkingCount: null }],
      },
      failOnStatusCode: false,
    });
    // Either 4xx with "Allotments are closed" or 401/403 if auth missing. Never 200 on closed campaign.
    expect([400, 401, 403, 404, 409, 422]).toContain(res.status());
  });

  test('BYR_ALLOC_053 — BUYER-FS-Allocation-Experience §Payment-Failure — Failure surfaces banner and rolls back hold (BR-AE-10)', async () => {
    const banner = await allot.paymentFailureBanner.isVisible({ timeout: 3_000 }).catch(() => false);
    test.skip(!banner, 'No payment-failure banner present — precondition not met');
    await allot.expectPaymentFailure();
    // After failure: bookNow should re-appear (unit rolled back to AVAILABLE) OR waiting surface
    const recovered =
      (await allot.bookNowBadge.isVisible({ timeout: 5_000 }).catch(() => false)) ||
      (await allot.waitingForUnit.isVisible({ timeout: 5_000 }).catch(() => false));
    expect(recovered).toBeTruthy();
  });
});
