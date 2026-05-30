'use strict';

/**
 * UnitDetailsPage.js — Page Object Model for buyer / unit-details.
 *
 * Selectors sourced from locators/buyer/locator-map.json (module key: "unit-details").
 * NOTE: live crawl during scaffold reached a 404 surface (direct `/unit-details` hit
 * without `registration_unit_id` context renders Not Found), so the locator map
 * currently holds only two not-found stubs. The page-level DOM-contract fallbacks
 * below cover the actual Allotted Unit surface (Unit Information block, Cost Sheet,
 * Tower View, Floor & Unit Plans, embedded Payment Schedule).
 *
 * Tech Lead Agent must re-crawl `/allotted-units?registrationNumber=...&unitId=...`
 * behind an authenticated WINNER session to replace these with stable map entries.
 *
 * BRD/FRD: BUYER-FS-Unit-Details
 *   §Access            — WINNER status only; pre-allocation buyers blocked (BYR_UNIT_001)
 *   §Navigation        — "My Unit" nav from Home Dashboard → /allotted-units (BYR_UNIT_002/003)
 *   §Unit-Information  — number, floor, tower, typology, carpet, saleable, facing, agreementValue
 *   §Cost-Sheet        — frozen at allocation time, basic + floor rise + premium + infra +
 *                        society + clubhouse + possession + GST + parking; offer/early-bird
 *                        deductions; Net Payable = Total − deductions  (BYR_UNIT_010..018)
 *   §Tower-View        — buyer's unit highlighted with distinct colour (BYR_UNIT_020/043)
 *   §Floor-Plans       — Floor & Unit Plans, lightbox open, ESC close (BYR_UNIT_021/022/045)
 *   §Payment-Schedule  — embedded at bottom, matches /paymentschedule (BYR_UNIT_023/024)
 *   §Resilience        — missing imageUrl, pipe-delimited imageUrl `||` (BYR_UNIT_025/032/057)
 */

const { BasePage }   = require('../../base/BasePage');
const locatorMap     = require('../../../locators/buyer/locator-map.json');

const L = locatorMap['unit-details'] || {};

const UNITDETAILS_URL          = 'https://uat.xrportal.in/unit-details';
const ALLOTTED_UNITS_URL       = 'https://uat.xrportal.in/allotted-units';
const HOME_DASHBOARD_URL       = 'https://uat.xrportal.in/home';
const PAYMENT_SCHEDULE_URL     = 'https://uat.xrportal.in/paymentschedule';

// ── Business constants ──────────────────────────────────────────────────────
const COST_SHEET_LINE_LABELS = [
  'Basic',
  'Floor Rise',
  'Premium',
  'Infra',
  'Society',
  'Clubhouse',
  'Possession',
  'GST',
];

class UnitDetailsPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = ALLOTTED_UNITS_URL;
    this.fallbackUrl = UNITDETAILS_URL;
    this.homeUrl = HOME_DASHBOARD_URL;
    this.paymentScheduleUrl = PAYMENT_SCHEDULE_URL;
    this.COST_SHEET_LINE_LABELS = COST_SHEET_LINE_LABELS;

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
    this.pageShell        = page.locator('main, #__next, [class*="allotted-units"], [class*="unit-details"]').first();
    this.pageHeading      = page.locator('h1, h2').first();
    this.loadingSkeleton  = page.locator('[class*="skeleton"], [class*="Skeleton"], [class*="loading"], [data-testid="skeleton"]').first();
    this.breadcrumbHome   = page.locator('a[href="/home"], a:has-text("Home"), button:has-text("Back"), [aria-label="back"], [aria-label="Back"]').first();

    // ── Home Dashboard "My Unit" nav (entry point) ──────────────────────────
    this.myUnitNavItem    = page.locator(
      'a:has-text("My Unit"), button:has-text("My Unit"), a:has-text("Allotted Unit"), [data-testid="my-unit-nav"]'
    ).first();
    this.dashboardUnitRow = page.locator(
      '[class*="unit-row"], [class*="UnitRow"], [data-testid^="unit-row-"], [class*="MyUnit"], [class*="my-unit"]'
    ).first();

    // ── Unit information block ──────────────────────────────────────────────
    this.unitInfoSection  = page.locator('[class*="unit-info"], [class*="UnitInfo"], [data-testid="unit-info"], section:has-text("Unit Information")').first();
    this.unitNumberField  = page.locator('[data-testid="unit-number"], [class*="unit-number"], :text("Unit") + *, :text("Unit No")').first();
    this.floorField       = page.locator('[data-testid="floor"], [class*="floor-value"], :text("Floor") + *').first();
    this.towerField       = page.locator('[data-testid="tower"], [class*="tower-value"], :text("Tower") + *').first();
    this.typologyField    = page.locator('[data-testid="typology"], [class*="typology"], :text("Typology") + *, :text(/\\d+\\s*BHK/)').first();
    this.carpetAreaField  = page.locator('[data-testid="carpet-area"], [class*="carpet"], :text("Carpet") + *').first();
    this.saleableAreaField = page.locator('[data-testid="saleable-area"], [class*="saleable"], :text("Saleable") + *').first();
    this.facingField      = page.locator('[data-testid="facing"], [class*="facing"], :text("Facing") + *').first();
    this.agreementValueField = page.locator('[data-testid="agreement-value"], [class*="agreement"], :text("Agreement Value") + *').first();
    this.allocationAmountField = page.locator('[data-testid="allocation-amount"], [class*="allocation-amount"], :text("Allocation Amount") + *').first();

    // ── Cost Sheet ──────────────────────────────────────────────────────────
    this.costSheetSection = page.locator('[class*="cost-sheet"], [class*="CostSheet"], [data-testid="cost-sheet"], section:has-text("Cost Sheet")').first();
    this.costSheetToggle  = page.locator('button:has-text("Cost Sheet"), a:has-text("Cost Sheet"), [data-testid="cost-sheet-toggle"]').first();
    this.costSheetRows    = page.locator('[class*="cost-sheet"] tr, [class*="CostSheet"] [class*="row"], [data-testid="cost-sheet"] [class*="line"]');
    this.basicPriceRow    = page.locator(':text("Basic")').first();
    this.gstRow           = page.locator(':text("GST"), :text("Goods and Services Tax")').first();
    this.parkingRow       = page.locator(':text("Parking")').first();
    this.totalUnitValue   = page.locator('[data-testid="total-unit-value"], [class*="total"]:has-text("Total"), :text("Total Unit Value") + *').first();
    this.offerDeductionRow = page.locator(':text("Offer"), :text("Discount"), [class*="deduction"]').first();
    this.earlyBirdRow     = page.locator(':text("Early Bird"), :text("Early-bird")').first();
    this.netPayableAmount = page.locator('[data-testid="net-payable"], [class*="net-payable"], :text("Net Payable") + *, :text("Net Payable Amount") + *').first();

    // ── Tower View ──────────────────────────────────────────────────────────
    this.towerViewSection = page.locator('[class*="tower-view"], [class*="TowerView"], [data-testid="tower-view"], section:has-text("Tower View")').first();
    this.towerViewToggle  = page.locator('button:has-text("Tower View"), a:has-text("Tower View"), [data-testid="tower-view-toggle"]').first();
    this.towerViewMyUnit  = page.locator('[class*="tower-view"] [class*="my-unit"], [class*="TowerView"] [class*="highlighted"], [data-testid="tower-view-my-unit"]').first();
    this.towerViewMissingImage = page.locator('[class*="tower-view"] [class*="placeholder"], [class*="tower-view"] :text("Image not available")').first();

    // ── Floor & Unit Plans ──────────────────────────────────────────────────
    this.floorPlanSection = page.locator('[class*="floor-plan"], [class*="FloorPlan"], [data-testid="floor-plan"], section:has-text("Floor")').first();
    this.floorPlanToggle  = page.locator('button:has-text("Floor & Unit Plan"), a:has-text("Floor & Unit Plan"), button:has-text("Floor Plan"), [data-testid="floor-plan-toggle"]').first();
    this.floorPlanImages  = page.locator('[class*="floor-plan"] img, [class*="FloorPlan"] img, [data-testid^="floor-plan-image-"]');
    this.lightbox         = page.locator('[class*="lightbox"], [class*="Lightbox"], [role="dialog"][aria-label*="image" i], [data-testid="lightbox"]').first();
    this.lightboxCloseBtn = page.locator('[class*="lightbox"] button[aria-label="Close"], [class*="Lightbox"] button:has-text("Close"), [role="dialog"] button[aria-label="Close"]').first();

    // ── Payment Schedule (embedded) ─────────────────────────────────────────
    this.paymentScheduleSection = page.locator('[class*="payment-schedule"], [class*="PaymentSchedule"], [data-testid="payment-schedule"], section:has-text("Payment Schedule")').first();
    this.milestoneRows    = page.locator('[class*="payment-schedule"] tr, [class*="milestone-row"], [data-testid^="milestone-"]');
    this.milestonePaidBadge = page.locator('[class*="milestone"] :text("Paid"), [data-testid="milestone-paid"]').first();
    this.milestoneVerificationBadge = page.locator(':text("In Verification"), :text("Verification"), [data-testid="milestone-verification"]').first();
    this.scheduleEmptyState = page.locator(':text("No milestones"), :text("Schedule not configured"), [data-testid="schedule-empty"]').first();

    // ── Session-expired ─────────────────────────────────────────────────────
    this.sessionExpiredPrompt = page.locator(':text("Session expired"), :text("Session Expired"), [data-testid="session-expired"]').first();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateLegacy() {
    await this.page.goto(this.fallbackUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateViaHomeDashboard() {
    await this.page.goto(this.homeUrl);
    await this.page.waitForLoadState('domcontentloaded');
    // Prefer the explicit nav item; fall back to clicking a dashboard unit row
    const navVisible = await this.myUnitNavItem.isVisible({ timeout: 3_000 }).catch(() => false);
    if (navVisible) {
      await this.click(this.myUnitNavItem);
    } else {
      const rowVisible = await this.dashboardUnitRow.isVisible({ timeout: 3_000 }).catch(() => false);
      if (!rowVisible) {
        return { reached: false, reason: 'No My Unit nav nor dashboard unit row visible' };
      }
      await this.click(this.dashboardUnitRow);
    }
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
    // Page reached via Home Dashboard — final URL should be /allotted-units (or /unit-details legacy)
    const url = this.page.url();
    if (!/\/(allotted-units|unit-details)/.test(url)) {
      throw new Error(`Expected URL to be /allotted-units or /unit-details after dashboard nav, got '${url}'`);
    }
    const shellVisible = await this.pageShell.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!shellVisible) {
      throw new Error('Unit Details page shell not visible after dashboard nav');
    }
  }

  // ── Unit information getters ───────────────────────────────────────────────

  async getUnitNumber() {
    return ((await this.unitNumberField.textContent({ timeout: 5_000 }).catch(() => '')) || '').trim();
  }

  async getFloor() {
    return ((await this.floorField.textContent({ timeout: 5_000 }).catch(() => '')) || '').trim();
  }

  async getTower() {
    return ((await this.towerField.textContent({ timeout: 5_000 }).catch(() => '')) || '').trim();
  }

  async getTypology() {
    return ((await this.typologyField.textContent({ timeout: 5_000 }).catch(() => '')) || '').trim();
  }

  async getCarpetArea() {
    return ((await this.carpetAreaField.textContent({ timeout: 5_000 }).catch(() => '')) || '').trim();
  }

  async getSaleableArea() {
    return ((await this.saleableAreaField.textContent({ timeout: 5_000 }).catch(() => '')) || '').trim();
  }

  async getAgreementValue() {
    return ((await this.agreementValueField.textContent({ timeout: 5_000 }).catch(() => '')) || '').trim();
  }

  async getAllocationAmount() {
    return ((await this.allocationAmountField.textContent({ timeout: 5_000 }).catch(() => '')) || '').trim();
  }

  async expectUnitInformationPopulated() {
    await this.unitInfoSection.waitFor({ state: 'visible', timeout: 8_000 });
    const text = (await this.unitInfoSection.textContent()) || '';
    if (!/BHK|carpet|saleable|tower|floor/i.test(text)) {
      throw new Error('Unit information block did not surface BHK / carpet / saleable / tower / floor fields');
    }
  }

  // ── Cost Sheet ─────────────────────────────────────────────────────────────

  async openCostSheet() {
    const toggleVisible = await this.costSheetToggle.isVisible({ timeout: 3_000 }).catch(() => false);
    if (toggleVisible) {
      await this.click(this.costSheetToggle);
    }
    await this.costSheetSection.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async expectCostSheetVisible() {
    await this.costSheetSection.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async getCostSheetText() {
    return ((await this.costSheetSection.textContent({ timeout: 5_000 }).catch(() => '')) || '');
  }

  async expectCostSheetLineLabels(labels = COST_SHEET_LINE_LABELS) {
    const text = await this.getCostSheetText();
    const missing = labels.filter(l => !new RegExp(l, 'i').test(text));
    if (missing.length === labels.length) {
      throw new Error(`Cost sheet does not contain any expected line labels. Expected at least one of: ${labels.join(', ')}`);
    }
    return { found: labels.filter(l => new RegExp(l, 'i').test(text)), missing };
  }

  async getNetPayable() {
    return ((await this.netPayableAmount.textContent({ timeout: 5_000 }).catch(() => '')) || '').trim();
  }

  // ── Tower View ─────────────────────────────────────────────────────────────

  async openTowerView() {
    const toggleVisible = await this.towerViewToggle.isVisible({ timeout: 3_000 }).catch(() => false);
    if (toggleVisible) {
      await this.click(this.towerViewToggle);
    }
    await this.towerViewSection.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async expectTowerViewVisible() {
    await this.towerViewSection.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async expectMyUnitHighlighted() {
    const highlighted = await this.towerViewMyUnit.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!highlighted) {
      throw new Error('Tower View does not visibly highlight buyer\'s unit');
    }
  }

  // ── Floor & Unit Plans ─────────────────────────────────────────────────────

  async openFloorPlan() {
    const toggleVisible = await this.floorPlanToggle.isVisible({ timeout: 3_000 }).catch(() => false);
    if (toggleVisible) {
      await this.click(this.floorPlanToggle);
    }
    await this.floorPlanSection.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async expectFloorPlanVisible() {
    await this.floorPlanSection.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async getFloorPlanImageCount() {
    return this.floorPlanImages.count().catch(() => 0);
  }

  async openFirstFloorPlanLightbox() {
    const count = await this.getFloorPlanImageCount();
    if (count === 0) return { opened: false, reason: 'No floor plan images present' };
    await this.floorPlanImages.first().click();
    const visible = await this.lightbox.isVisible({ timeout: 3_000 }).catch(() => false);
    return { opened: visible };
  }

  async closeLightboxWithEsc() {
    await this.page.keyboard.press('Escape');
    await this.lightbox.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
  }

  // ── Embedded Payment Schedule ──────────────────────────────────────────────

  async openPaymentScheduleEmbedded() {
    // Schedule is embedded — scroll into view; no toggle expected
    await this.paymentScheduleSection.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => {});
    await this.paymentScheduleSection.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async expectPaymentScheduleVisible() {
    await this.paymentScheduleSection.waitFor({ state: 'visible', timeout: 5_000 });
  }

  async getMilestoneCount() {
    return this.milestoneRows.count().catch(() => 0);
  }

  async getEmbeddedScheduleSignature() {
    // Lightweight "matches /paymentschedule" signature: array of milestone-row text snippets
    const count = await this.getMilestoneCount();
    const out = [];
    for (let i = 0; i < count; i++) {
      const t = ((await this.milestoneRows.nth(i).textContent({ timeout: 1_500 }).catch(() => '')) || '').replace(/\s+/g, ' ').trim();
      out.push(t);
    }
    return out;
  }
}

module.exports = {
  UnitDetailsPage,
  COST_SHEET_LINE_LABELS,
  ALLOTTED_UNITS_URL,
  UNITDETAILS_URL,
  HOME_DASHBOARD_URL,
  PAYMENT_SCHEDULE_URL,
};
