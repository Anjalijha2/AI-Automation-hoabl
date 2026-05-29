'use strict';

/**
 * UI/UX — Channel Partner Portal · Leads Management Module
 *
 * Scope: visual rendering, layout, responsive behaviour, accessibility cues.
 * Functional behaviour is covered by tests/e2e/channel-partner/leads-management.spec.js.
 *
 * BRD/FRD: CP-BRD-CP-Portal.md · CP-FS-Leads-Management.md
 * Source TCs: manual-qa-repository/01-test-cases/cp-portal/leads-management/TC_LEADS_MANAGEMENT.md
 */

const { test, expect } = require('@playwright/test');
const { LeadsManagementPage } = require('../../../automation-repository/pages/channel-partner/LeadsManagementPage');

test.use({ storageState: 'automation-repository/fixtures/.auth/channel-partner.json' });

test.describe('Leads Management — Channel Partner Portal UI/UX', () => {
  let leadsPage;

  test.beforeEach(async ({ page }) => {
    leadsPage = new LeadsManagementPage(page);
    await leadsPage.navigate();
    await leadsPage.waitForLoad().catch(() => { /* may have no rows on UAT */ });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('CP_LEAD_UI_001 — CP-FS-Leads-Management §1 — Page renders Leads heading and nav', async ({ page }) => {
    await leadsPage.expectLeadsHeadingVisible();
    await leadsPage.expectNavLinksVisible();
    await expect(page).toHaveScreenshot('cp-lead-ui-001-render.png', { maxDiffPixels: 250, fullPage: true });
  });

  test('CP_LEAD_UI_002 — CP-FS-Leads-Management §1 — Search input is visible and labelled', async () => {
    await expect(leadsPage.searchCustomerInput).toBeVisible();
    const placeholder = await leadsPage.searchCustomerInput.getAttribute('placeholder');
    expect(placeholder).toMatch(/Search/i);
  });

  test('CP_LEAD_UI_005 — CP-FS-Leads-Management §1 — All four nav links present in the top nav', async () => {
    // Home / KYC / JBP / Leads — Leads link should be highlighted as active
    await expect(leadsPage.homeLink).toBeVisible();
    await expect(leadsPage.kYCLink).toBeVisible();
    await expect(leadsPage.jBPLink).toBeVisible();
    await expect(leadsPage.leadsLink).toBeVisible();
  });

  test('CP_LEAD_UI_011 — CP-FS-Leads-Management §1 — Empty-state friendly message when no leads', async () => {
    // Only meaningful when the account genuinely has zero leads — skip otherwise.
    const rowCount = await leadsPage.getLeadRowCount();
    test.skip(rowCount > 0, 'CP account has leads — empty-state test not applicable');
    await leadsPage.expectEmptyState();
  });

  // ── Responsive ─────────────────────────────────────────────────────────────

  test('CP_LEAD_UI_R1 — CP-FS-Leads-Management §1 — Tablet viewport (768x1024) renders header and search', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await leadsPage.expectLeadsHeadingVisible();
    await expect(leadsPage.searchCustomerInput).toBeVisible();
    await expect(page).toHaveScreenshot('cp-lead-ui-r1-tablet.png', { maxDiffPixels: 300, fullPage: true });
  });

  test('CP_LEAD_UI_R2 — CP-FS-Leads-Management §1 — Mobile viewport (375x812) renders header', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await leadsPage.expectLeadsHeadingVisible();
    await expect(page).toHaveScreenshot('cp-lead-ui-r2-mobile.png', { maxDiffPixels: 300, fullPage: true });
  });

  // ── Accessibility cues ─────────────────────────────────────────────────────

  test('CP_LEAD_UI_A1 — CP-FS-Leads-Management §1 — Heading uses semantic h3 tag', async ({ page }) => {
    const h3Count = await page.locator('h3:has-text("Leads")').count();
    expect(h3Count).toBeGreaterThanOrEqual(1);
  });

  test('CP_LEAD_UI_A2 — CP-FS-Leads-Management §1 — Action buttons have accessible text labels', async () => {
    const rowCount = await leadsPage.getLeadRowCount();
    test.skip(rowCount === 0, 'No leads available to inspect action buttons');
    // The Resend / Copy Link buttons must have human-readable text (not just icons)
    const firstResend = leadsPage.allResendButtons.first();
    const resendText = await firstResend.textContent();
    expect((resendText || '').trim().length).toBeGreaterThan(0);

    const firstCopy = leadsPage.allCopyLinkButtons.first();
    const copyText = await firstCopy.textContent();
    expect((copyText || '').trim().length).toBeGreaterThan(0);
  });
});
