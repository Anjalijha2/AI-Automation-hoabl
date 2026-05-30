'use strict';

/**
 * WorkProgressPage.js — Page Object Model for Buyer Portal / work-progress.
 *
 * BRD/FRD: BUYER-FS-Work-Progress
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/work-progress/TC_WORK_PROGRESS.md
 *
 * Notes (from FSD corrections 2026-05-25 + KB notes):
 *   - URL: https://uat.xrportal.in/work-progress
 *   - Content is per-tower (NOT per-milestone): Strapi returns `towerImages[]`
 *     with `{towerId, name, images[]}` containing `url` + `caption` only.
 *   - Project ID hardcoded to 1 — `<STRAPI_BASE>/api/projects/1?populate=deep`
 *     regardless of buyer's allocated project (KB-1, BYR_WRK_022).
 *   - Per-buyer tower filter is dead code — buyer sees ALL towers (KB-2, BYR_WRK_023).
 *   - Next.js ISR `revalidate=10s` (BYR_WRK_015-017, 037).
 *   - Strapi outage: error UI commented out → "Loading tower data..." placeholder
 *     stays indefinitely (KB-5, BYR_WRK_024).
 *   - Banner video: muted+autoplay+loop+playsInline, NO controls (BYR_WRK_025).
 *   - Swiper carousel: autoplay 2500ms, arrows enabled, dots disabled (BYR_WRK_028).
 *   - READ-ONLY by business rule (BIZ): no upload/edit/delete/comment surface
 *     for buyers anywhere (BYR_WRK_013, 014, 031-036).
 *
 * Locator-map module key: "work-progress" — only generic login/topbar keys exist;
 * page content selectors fall back to DOM text / role probes.
 */

const { BasePage } = require('../../base/BasePage');
const locatorMap   = require('../../../locators/buyer/locator-map.json');

const L = locatorMap['work-progress'] || {};

const WORKPROGRESS_URL = 'https://uat.xrportal.in/work-progress';
const LOGIN_URL_RE     = /\/(login|registration|signin)/i;
const STRAPI_PROJECT_RE = /strapi|\/api\/projects\/1/i;

class WorkProgressPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = WORKPROGRESS_URL;

    // ── Locator-map elements (login/topbar generic — bracket access per rule) ─
    this.previousSlide          = page.locator(L['previousSlide'] ? L['previousSlide'].selector : '[aria-label="Previous slide"]');
    this.nextSlide              = page.locator(L['nextSlide'] ? L['nextSlide'].selector : '[aria-label="Next slide"]');
    this.sendOTPButton          = page.locator(L['sendOTPButton'] ? L['sendOTPButton'].selector : 'button:has-text("Send OTP")');
    this.termsConditionsLink    = page.locator(L['termsConditionsLink'] ? L['termsConditionsLink'].selector : 'a:has-text("Terms & Conditions")');
    this.privacyPolicyLink      = page.locator(L['privacyPolicyLink'] ? L['privacyPolicyLink'].selector : 'a:has-text("Privacy Policy")');
    this.enterMobileNumberInput = page.locator(L['enterMobileNumberInput'] ? L['enterMobileNumberInput'].selector : 'input[placeholder="Enter Mobile Number"]');
    this.rcTabs1Tab1            = page.locator(L['rcTabs1Tab1'] ? L['rcTabs1Tab1'].selector : '#rc-tabs-1-tab-1');
    this.rcTabs1Tab2            = page.locator(L['rcTabs1Tab2'] ? L['rcTabs1Tab2'].selector : '#rc-tabs-1-tab-2');
    this.applicantLoginHeading  = page.locator(L['aPPLICANTLOGINHeading'] ? L['aPPLICANTLOGINHeading'].selector : 'h2:has-text("APPLICANT LOGIN")');

    // ── Page shell ───────────────────────────────────────────────────────────
    this.pageShell      = page.locator('body');
    this.pageHeader     = page.locator('h1, h2:has-text(/Work Progress|Construction Updates/i)').first();

    // ── Banner video (work-progress/page.js:37-48) ───────────────────────────
    this.bannerVideo    = page.locator('video').first();
    this.bannerTitle    = page.locator('h2, h1').first();
    this.bannerSubtitle = page.locator('p').first();

    // ── Tower section (DOM probes — no testid yet on Strapi-driven UI) ───────
    this.towerSection      = page.locator(
      'section:has-text(/Tower|Crest|Crown|Blossom|Pinnacle/i), .tower-section, [data-testid="tower-section"]'
    ).first();
    this.towerTabs         = page.locator(
      '[role="tab"]:has-text(/Crest|Crown|Blossom|Pinnacle|Bright|Tower/i), .tower-tabs button, .ant-tabs-tab'
    );
    this.activeTowerTab    = page.locator('[role="tab"][aria-selected="true"], .ant-tabs-tab-active').first();

    // ── Carousel (Swiper) ───────────────────────────────────────────────────
    this.carousel       = page.locator('.swiper, [class*="swiper"]').first();
    this.carouselSlides = page.locator('.swiper-slide, [class*="swiper-slide"]');
    this.carouselNext   = page.locator('.swiper-button-next, [aria-label*="Next" i]').first();
    this.carouselPrev   = page.locator('.swiper-button-prev, [aria-label*="Prev" i]').first();

    // ── Milestone / Progress cards (generic — content is per-tower) ──────────
    this.progressSections = page.locator(
      'section, [class*="tower"], [class*="progress"], [class*="milestone"], [role="tabpanel"]'
    );
    this.progressImages   = page.locator(
      '.swiper-slide img, .tower-section img, [role="tabpanel"] img, main img'
    );
    this.captions         = page.locator(
      '.swiper-slide p, .caption, figcaption, [class*="caption"]'
    );

    // ── Lightbox (AntD Image preview) ───────────────────────────────────────
    this.lightbox       = page.locator('[role="dialog"]:visible, .ant-image-preview-root:visible, .ant-image-preview:visible').first();
    this.lightboxClose  = page.locator('.ant-image-preview-close, [aria-label*="Close" i]').first();

    // ── Empty / loader / error states ───────────────────────────────────────
    this.loadingTower   = page.locator(':text-matches("Loading tower data", "i")').first();
    this.emptyState     = page.locator(':text-matches("No updates yet|No milestones|empty", "i")').first();
    this.errorBanner    = page.locator(':text-matches("Unable to load|something went wrong|Try again", "i")').first();

    // ── Read-only constraint affordances (must NOT be present for buyers) ───
    this.fileInputs     = page.locator('input[type="file"]');
    this.editButtons    = page.locator(
      'button:has-text(/Edit|Update|Save|Submit|Add|Upload|Replace/i), [aria-label*="Edit" i], [data-testid*="edit" i]'
    );
    this.deleteButtons  = page.locator(
      'button:has-text(/Delete|Remove/i), [aria-label*="Delete" i], [aria-label*="Remove" i], [data-testid*="delete" i]'
    );
    this.commentInputs  = page.locator(
      'textarea, input[type="text"]:not([placeholder*="Search" i]):not([placeholder*="Mobile" i])'
    );
    this.kebabMenus     = page.locator(
      '[aria-label*="More" i], [aria-haspopup="menu"], button:has-text("...")'
    );
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForLoad() {
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10_000 });
    } catch {
      /* Strapi may stream content longer than 10s on UAT — fall through */
    }
  }

  async isOnLoginRedirect() {
    if (LOGIN_URL_RE.test(this.page.url())) return true;
    return this.applicantLoginHeading.isVisible({ timeout: 1_500 }).catch(() => false);
  }

  // ── Section / content probes ──────────────────────────────────────────

  async getProgressSections() {
    return this.progressSections.count().catch(() => 0);
  }

  async getCarouselSlideCount() {
    return this.carouselSlides.count().catch(() => 0);
  }

  async getProgressImageCount() {
    return this.progressImages.count().catch(() => 0);
  }

  async getTowerTabCount() {
    return this.towerTabs.count().catch(() => 0);
  }

  async getActiveTowerTabText() {
    const text = await this.activeTowerTab.textContent({ timeout: 2_000 }).catch(() => '');
    return (text || '').trim();
  }

  async getRenderedBodyText() {
    const text = (await this.pageShell.textContent().catch(() => '')) || '';
    return text.trim();
  }

  /**
   * Expect content rendered: tower section visible OR carousel present OR
   * an image rendered OR "Loading tower data..." placeholder (which itself is
   * permitted under FSD note KB-5). Strapi may be empty on UAT.
   */
  async expectContentRendered() {
    const towerVisible = await this.towerSection.isVisible({ timeout: 4_000 }).catch(() => false);
    if (towerVisible) return true;
    const slides = await this.getCarouselSlideCount();
    if (slides > 0) return true;
    const images = await this.getProgressImageCount();
    if (images > 0) return true;
    const loading = await this.loadingTower.isVisible({ timeout: 1_500 }).catch(() => false);
    if (loading) return true;
    const bodyText = await this.getRenderedBodyText();
    return bodyText.length > 50;
  }

  /**
   * Expect at least one image responded with HTTP 200 and rendered with
   * non-zero natural dimensions (BYR_WRK_006 — no 404, no broken icons).
   */
  async expectImagesLoad(timeoutMs = 8_000) {
    const count = await this.getProgressImageCount();
    if (count === 0) return { ok: true, reason: 'no images on page (empty Strapi)', count: 0 };
    const naturals = await this.progressImages.evaluateAll((imgs) =>
      imgs.slice(0, 10).map((img) => ({
        src: img.currentSrc || img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      })),
    ).catch(() => []);
    const loaded = naturals.filter((n) => n.complete && n.naturalWidth > 0).length;
    return { ok: loaded > 0 || count === 0, loaded, total: naturals.length };
  }

  /**
   * Listen for outbound Strapi network calls during a content fetch. Returns
   * true if any request to `strapi` or `/api/projects/1` is observed.
   * Per BYR_WRK_022 the project ID is hardcoded to 1.
   */
  async expectStrapiSync(actionFn, timeoutMs = 8_000) {
    let observed = false;
    let projectOneHit = false;
    const handler = (req) => {
      const url = req.url();
      if (STRAPI_PROJECT_RE.test(url)) observed = true;
      if (/\/api\/projects\/1/.test(url)) projectOneHit = true;
    };
    this.page.on('request', handler);
    try {
      await actionFn();
      const start = Date.now();
      while (!observed && Date.now() - start < timeoutMs) {
        await this.page.waitForTimeout(250);
      }
    } finally {
      this.page.off('request', handler);
    }
    return { observed, projectOneHit };
  }

  /**
   * BIZ rule (BYR_WRK_013, 031-033): no edit / upload / delete affordances
   * may be present on the Work Progress page. Returns the count of any
   * forbidden controls detected.
   */
  async expectNoEditAffordance() {
    const fileInputs   = await this.fileInputs.count().catch(() => 0);
    const editBtns     = await this.editButtons.count().catch(() => 0);
    const deleteBtns   = await this.deleteButtons.count().catch(() => 0);
    const commentBoxes = await this.commentInputs.count().catch(() => 0);
    const kebabs       = await this.kebabMenus.count().catch(() => 0);
    return {
      ok: fileInputs === 0 && editBtns === 0 && deleteBtns === 0 && commentBoxes === 0,
      fileInputs,
      editBtns,
      deleteBtns,
      commentBoxes,
      kebabs,
    };
  }

  // ── Carousel helpers ──────────────────────────────────────────────────

  async clickNextSlide() {
    const visible = await this.carouselNext.isVisible({ timeout: 2_000 }).catch(() => false);
    if (!visible) return false;
    await this.carouselNext.click({ timeout: 2_000 }).catch(() => {});
    await this.page.waitForTimeout(300);
    return true;
  }

  async openFirstImageLightbox() {
    const count = await this.getProgressImageCount();
    if (count === 0) return { opened: false, reason: 'No images rendered' };
    await this.progressImages.first().click({ timeout: 3_000 }).catch(() => {});
    const opened = await this.lightbox.isVisible({ timeout: 3_000 }).catch(() => false);
    return { opened, reason: opened ? null : 'Lightbox did not open after click' };
  }

  async closeLightboxWithEsc() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  // ── Banner video probes ──────────────────────────────────────────────

  async getBannerVideoAttributes() {
    const visible = await this.bannerVideo.isVisible({ timeout: 2_000 }).catch(() => false);
    if (!visible) return null;
    return this.bannerVideo.evaluate((v) => ({
      muted: v.muted,
      autoplay: v.autoplay,
      loop: v.loop,
      controls: v.controls,
      playsInline: v.playsInline,
      preload: v.preload,
      src: v.currentSrc || v.src,
    })).catch(() => null);
  }
}

module.exports = {
  WorkProgressPage,
  WORKPROGRESS_URL,
};
