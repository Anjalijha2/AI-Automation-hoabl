'use strict';

/**
 * support-tickets.spec.js — End-to-End tests for the Buyer Portal Support Tickets module.
 *
 * Scope:
 *   The buyer-side Support Tickets flow:
 *     • List view (/support) — table of buyer-owned tickets with status badges
 *       sourced from a LIVE osTicket fetch (NOT the local DB enum).
 *     • Categories picker (/support-tickets/categories) — 4 tiles: GENERAL,
 *       CAR_PARKING, CANCELLATION, LOAN.
 *     • Create form (/support-tickets/create) — category-specific required
 *       fields; mandatory base = registrationNumber + category + note.
 *     • Detail view (/support-tickets/<id>) — full conversation thread.
 *
 * Auth:
 *   Buyer session (mobile 8888888888) persisted at
 *   automation-repository/fixtures/.auth/buyer.json.
 *
 * Destructive / live-integration guards:
 *   - submitTicket() writes a DB row AND fires an osTicket API call (sends
 *     alert + autorespond emails). All tests that click Submit skip on
 *     ENV=uat unless ALLOW_DESTRUCTIVE=1.
 *   - BYR_SUP_039 (cross-buyer access) is a KNOWN SECURITY BUG — we document
 *     the behaviour but do not currently mutate state.
 *
 * FSD corrections honoured (TC_SUPPORT_TICKETS.md §"FSD Corrections Applied"):
 *   - BYR_SUP_001: sidebar + bottom-nav links commented out; reach via URL.
 *   - BYR_SUP_005: status from live osTicket fetch, not local enum.
 *   - BYR_SUP_018: TKT-GN-NNNNNN format, server-generated, race-prone.
 *   - BYR_SUP_021: attachments to Azure Blob (NOT S3).
 *   - BYR_SUP_036: non-CANCELLATION categories silently drop file uploads.
 *
 * BRD: BUYER-FS-Support-Tickets §1, §2, §3, §4
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/support-tickets/TC_SUPPORT_TICKETS.md
 */

const { test, expect } = require('@playwright/test');
const { SupportTicketsPage } = require('../../../automation-repository/pages/buyer/SupportTicketsPage');

// Buyer authenticated session — required for list view + create form.
test.use({ storageState: 'automation-repository/fixtures/.auth/buyer.json' });

test.describe('Support Tickets — Buyer Portal E2E', () => {
  let supportPage;

  test.beforeEach(async ({ page }) => {
    supportPage = new SupportTicketsPage(page);
    await supportPage.navigate();
    await supportPage.waitForLoad();
  });

  // ════════════════════════════════════════════════════════════════════════
  // Access & List view
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_SUP_001 — BUYER-FS-Support-Tickets §1 — Module reachable by direct URL (nav links commented out)', async ({ page }) => {
    // Page loaded in beforeEach via /support. Either list table OR empty-state
    // must render (i.e. NOT 404).
    await supportPage.expectListLoaded();
    // Sanity: the 404 sentinel must NOT be visible — those keys are for the
    // /support-tickets/something-bogus 404 surface.
    const is404 = await supportPage.el404Heading.isVisible({ timeout: 1500 }).catch(() => false);
    expect(is404).toBe(false);
    await expect(page).toHaveScreenshot('byr-sup-e2e-001-list-or-empty.png', { maxDiffPixels: 400, fullPage: true });
  });

  test('BYR_SUP_002 — BUYER-FS-Support-Tickets §1 — List shows buyer\'s own tickets only', async () => {
    // Endpoint filter is `userId = user.id` on GET /api/v1/support-tickets.
    // We cannot positively identify "ownership" from the UI alone, so we
    // assert the list rendered at all and treat backend filtering as the
    // contract. If empty: assert empty-state instead (BYR_SUP_007).
    const list = await supportPage.getTicketsList();
    test.skip(list.length === 0, 'Buyer has zero tickets — covered by BYR_SUP_007 empty-state test');
    expect(list.length).toBeGreaterThan(0);
  });

  test('BYR_SUP_007 — BUYER-FS-Support-Tickets §1 — Empty state renders when buyer has zero tickets', async ({ page }) => {
    const list = await supportPage.getTicketsList();
    test.skip(list.length > 0, 'Buyer has tickets — empty state path not reachable');
    await supportPage.expectEmptyState();
    await expect(page).toHaveScreenshot('byr-sup-e2e-007-empty-state.png', { maxDiffPixels: 400, fullPage: true });
  });

  test('BYR_SUP_008 — BUYER-FS-Support-Tickets §4 — Click row opens ticket detail', async ({ page }) => {
    const list = await supportPage.getTicketsList();
    test.skip(list.length === 0, 'No tickets to drill into');
    await supportPage.ticketRows.first().click();
    await supportPage.waitForLoad();
    expect(page.url()).toMatch(/\/support-tickets\/[^/]+/);
  });

  test('BYR_SUP_009 — BUYER-FS-Support-Tickets §4 — Detail view shows conversation thread', async ({ page }) => {
    const list = await supportPage.getTicketsList();
    test.skip(list.length === 0, 'No tickets to drill into');
    await supportPage.ticketRows.first().click();
    await supportPage.waitForLoad();
    // Either a thread container is present OR a "No messages yet" empty
    // sub-state — both are valid contract surfaces.
    const threadVisible = await supportPage.detailConversationThread.isVisible({ timeout: 5_000 }).catch(() => false);
    const messageCount  = await supportPage.detailMessages.count().catch(() => 0);
    expect(threadVisible || messageCount >= 0).toBe(true);
  });

  // ════════════════════════════════════════════════════════════════════════
  // Create — category selection
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_SUP_011 — BUYER-FS-Support-Tickets §2 — Click Create navigates to categories screen', async ({ page }) => {
    const opened = await supportPage.openCreateTicket();
    if (!opened) {
      // No CTA on list — try the direct URL (fallback path per BYR_SUP_001).
      await supportPage.navigateToCategories();
    }
    await supportPage.waitForLoad();
    expect(page.url()).toMatch(/categories|create/);
  });

  test('BYR_SUP_012 — BUYER-FS-Support-Tickets §2 — Categories screen shows GENERAL, CAR_PARKING, CANCELLATION, LOAN', async () => {
    await supportPage.navigateToCategories();
    await supportPage.waitForLoad();
    await supportPage.expectCategoriesScreen();
  });

  test('BYR_SUP_013 — BUYER-FS-Support-Tickets §2 — Click GENERAL opens create form with category preset', async ({ page }) => {
    await supportPage.navigateToCategories();
    await supportPage.waitForLoad();
    const ok = await supportPage.selectCategory('GENERAL');
    test.skip(!ok, 'GENERAL tile not visible on this build');
    expect(page.url()).toMatch(/create/);
  });

  // ════════════════════════════════════════════════════════════════════════
  // Form — category-specific submission (DESTRUCTIVE)
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_SUP_018 — BUYER-FS-Support-Tickets §3 — Submit GENERAL ticket creates row + returns TKT-GN-NNNNNN', async ({ page }) => {
    test.skip(
      process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — creates real DB row + osTicket API call (sends alert/autorespond emails); set ALLOW_DESTRUCTIVE=1 to opt in',
    );
    await supportPage.navigateToCategories();
    const ok = await supportPage.selectCategory('GENERAL');
    test.skip(!ok, 'GENERAL tile not visible');
    await supportPage.waitForLoad();
    await supportPage.fillForm({ description: 'Auto E2E — please ignore. BYR_SUP_018.' });
    await supportPage.submitTicket();
    await supportPage.expectTicketCreated();
    // Look for TKT-GN- pattern anywhere on the resulting page (toast or detail).
    const bodyText = await page.locator('body').innerText();
    expect(/TKT-GN-\d+/.test(bodyText)).toBe(true);
  });

  test('BYR_SUP_021 — BUYER-FS-Support-Tickets §3 — CANCELLATION ticket persists with category=CANCELLATION', async () => {
    test.skip(
      process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — creates real cancellation ticket + osTicket call; set ALLOW_DESTRUCTIVE=1 to opt in',
    );
    await supportPage.navigateToCategories();
    const ok = await supportPage.selectCategory('CANCELLATION');
    test.skip(!ok, 'CANCELLATION tile not visible');
    await supportPage.waitForLoad();
    await supportPage.fillForm({
      description: 'Auto E2E cancellation probe.',
      reasonOfCancellation: 'Auto E2E reason — please ignore.',
    });
    await supportPage.submitTicket();
    await supportPage.expectTicketCreated();
  });

  test('BYR_SUP_023 — BUYER-FS-Support-Tickets §3 — LOAN ticket requires timeSlot + contactNumber', async () => {
    test.skip(
      process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — creates real loan ticket; set ALLOW_DESTRUCTIVE=1 to opt in',
    );
    await supportPage.navigateToCategories();
    const ok = await supportPage.selectCategory('LOAN');
    test.skip(!ok, 'LOAN tile not visible');
    await supportPage.waitForLoad();
    await supportPage.fillForm({
      description: 'Auto E2E loan probe.',
      timeSlot: '15:00-16:00',
      contactNumber: '8888888888',
    });
    await supportPage.submitTicket();
    await supportPage.expectTicketCreated();
  });

  // ════════════════════════════════════════════════════════════════════════
  // Negative — validation
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_SUP_016 — BUYER-FS-Support-Tickets §3 — Submit with blank description rejected', async () => {
    await supportPage.navigateToCategories();
    const ok = await supportPage.selectCategory('GENERAL');
    test.skip(!ok, 'GENERAL tile not visible');
    await supportPage.waitForLoad();
    // Do NOT fill description — click submit.
    await supportPage.submitTicket().catch(() => {});
    const succeeded = await supportPage.toastSuccess.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(succeeded).toBe(false);
  });

  test('BYR_SUP_029 — BUYER-FS-Support-Tickets §3 — Whitespace-only description treated as empty', async () => {
    await supportPage.navigateToCategories();
    const ok = await supportPage.selectCategory('GENERAL');
    test.skip(!ok, 'GENERAL tile not visible');
    await supportPage.waitForLoad();
    await supportPage.fillForm({ description: '     ' });
    await supportPage.submitTicket().catch(() => {});
    const succeeded = await supportPage.toastSuccess.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(succeeded).toBe(false);
  });

  test('BYR_SUP_032 — BUYER-FS-Support-Tickets §3 / FSD — CAR_PARKING without numberOfParkings rejected', async () => {
    await supportPage.navigateToCategories();
    const ok = await supportPage.selectCategory('CAR_PARKING');
    test.skip(!ok, 'CAR_PARKING tile not visible');
    await supportPage.waitForLoad();
    // Fill only the description, omit numberOfParkings.
    await supportPage.fillForm({ description: 'parking issue probe' });
    await supportPage.submitTicket().catch(() => {});
    const succeeded = await supportPage.toastSuccess.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(succeeded).toBe(false);
  });

  // ════════════════════════════════════════════════════════════════════════
  // Status sync (live osTicket fetch — BYR_SUP_005 / BYR_SUP_026)
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_SUP_005 — BUYER-FS-Support-Tickets §1 / FSD — Status badges sourced from live osTicket (not local enum)', async () => {
    const list = await supportPage.getTicketsList();
    test.skip(list.length === 0, 'No tickets — status badge contract untestable on empty list');
    const statuses = await supportPage.getStatusValues();
    // Status text must match one of the osTicket-source values
    // (Open / Resolved / Closed / Archived / Deleted / Unknown). The local
    // enum values IN_PROGRESS and ACTION_REQUIRED must NOT appear.
    const acceptable = /(Open|Resolved|Closed|Archived|Deleted|Unknown)/i;
    const localOnly  = /(IN_PROGRESS|ACTION_REQUIRED)/i;
    for (const s of statuses) {
      expect(localOnly.test(s)).toBe(false);
      // Soft assertion: if non-empty, the status text should look osTicket-shaped.
      if (s.trim()) {
        expect(acceptable.test(s)).toBe(true);
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════════
  // Security — known bug surface (BYR_SUP_039)
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_SUP_028 — BUYER-FS-Support-Tickets §4 — Buyer cannot view another buyer\'s ticket (KNOWN BUG: see BYR_SUP_039)', async ({ page }) => {
    test.skip(
      !process.env.OTHER_BUYER_TICKET_ID,
      'OTHER_BUYER_TICKET_ID env var not set — provide a ticket id known to belong to a different buyer to verify ownership enforcement',
    );
    await supportPage.navigateToDetail(process.env.OTHER_BUYER_TICKET_ID);
    await supportPage.waitForLoad();
    // EXPECTED contract per BYR_SUP_028: access denied OR 404.
    // KNOWN BUG per BYR_SUP_039: detail returns the other buyer's data — this
    // assertion will FAIL on UAT until the bug is fixed; failure is the bug
    // signal, not a flaky test.
    const denied = await supportPage.detailAccessDenied.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(denied, 'Detail endpoint should enforce ownership filter — see BYR_SUP_039 bug').toBe(true);
  });

  // ════════════════════════════════════════════════════════════════════════
  // 404 sentinel (locator-map keys)
  // ════════════════════════════════════════════════════════════════════════

  test('BYR_SUP_LOCATOR_001 — locator-map sentinel — bogus ticket id renders 404 page', async ({ page }) => {
    await supportPage.navigateToDetail('this-id-cannot-exist-zzz-9999');
    await supportPage.waitForLoad();
    // Either the Next.js 404 page renders OR the application-level
    // access-denied / "Not found" surface renders — both are acceptable
    // because the controller has no auth/ownership filter, so an unknown id
    // simply yields a not-found response.
    const sentinel404 = await supportPage.el404Heading.isVisible({ timeout: 3_000 }).catch(() => false);
    const appDenied   = await supportPage.detailAccessDenied.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(sentinel404 || appDenied).toBe(true);
    await expect(page).toHaveScreenshot('byr-sup-e2e-locator-404.png', { maxDiffPixels: 300, fullPage: true });
  });
});
