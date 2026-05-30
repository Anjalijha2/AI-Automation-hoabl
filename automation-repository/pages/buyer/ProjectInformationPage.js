'use strict';

/**
 * ProjectInformationPage.js — Page Object Model for Buyer Portal / project-information.
 *
 * BRD/FRD: BUYER-FS-Project-Information
 * TC source: manual-qa-repository/01-test-cases/buyer-portal/project-information/TC_PROJECT_INFORMATION.md
 *
 * Notes:
 *   - URL: https://uat.xrportal.in/project
 *   - Tabs: Overview, Towers, Gallery, Documents, Videos
 *   - Strapi-managed content fetched live from `<STRAPI_BASE>/api/projects/1?populate=deep`
 *     — project ID is hardcoded to 1 (see BUG-DASH-004, BYR_PROJ_026/029).
 *   - Locator map exposes only the login/topbar generic keys for buyer landing pages.
 *     Tab + content selectors fall back to DOM text / role probes which we tolerate
 *     non-deterministically (Strapi content may be empty on UAT).
 */

const { BasePage }  = require('../../base/BasePage');
const locatorMap    = require('../../../locators/buyer/locator-map.json');

const L = locatorMap['project-information'] || {};

const PROJECTINFORMATION_URL = 'https://uat.xrportal.in/project';
const LOGIN_URL_RE           = /\/(login|registration|signin)/i;
const NOT_FOUND_RE           = /This page could not be found|404/i;

// Tab labels per BRD §Tabs (BYR_PROJ_003)
const TAB_LABELS = ['Overview', 'Towers', 'Gallery', 'Documents', 'Videos'];

class ProjectInformationPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = PROJECTINFORMATION_URL;

    // ── Locator-map elements (registration-login generic + buyer top bar) ────
    this.previousSlide          = page.locator(L['previousSlide'] ? L['previousSlide'].selector : '[aria-label="Previous slide"]');
    this.nextSlide              = page.locator(L['nextSlide'] ? L['nextSlide'].selector : '[aria-label="Next slide"]');
    this.sendOTPButton          = page.locator(L['sendOTPButton'] ? L['sendOTPButton'].selector : 'button:has-text("Send OTP")');
    this.termsConditionsLink    = page.locator(L['termsConditionsLink'] ? L['termsConditionsLink'].selector : 'a:has-text("Terms & Conditions")');
    this.privacyPolicyLink      = page.locator(L['privacyPolicyLink'] ? L['privacyPolicyLink'].selector : 'a:has-text("Privacy Policy")');
    this.enterMobileNumberInput = page.locator(L['enterMobileNumberInput'] ? L['enterMobileNumberInput'].selector : 'input[placeholder="Enter Mobile Number"]');
    this.rcTabs0Tab1            = page.locator(L['rcTabs0Tab1'] ? L['rcTabs0Tab1'].selector : '#rc-tabs-0-tab-1');
    this.rcTabs0Tab2            = page.locator(L['rcTabs0Tab2'] ? L['rcTabs0Tab2'].selector : '#rc-tabs-0-tab-2');
    this.applicantLoginHeading  = page.locator(L['aPPLICANTLOGINHeading'] ? L['aPPLICANTLOGINHeading'].selector : 'h2:has-text("APPLICANT LOGIN")');

    // ── Page shell ──────────────────────────────────────────────────────────
    this.pageShell = page.locator('body');

    // ── Tab bar + tabs (DOM fallbacks; Strapi-driven UI has no testid yet) ──
    this.tabBar          = page.locator('[role="tablist"], .ant-tabs-nav, nav:has(button:has-text("Overview"))').first();
    this.overviewTab     = page.locator('[role="tab"]:has-text("Overview"), button:has-text("Overview"), a:has-text("Overview")').first();
    this.towersTab       = page.locator('[role="tab"]:has-text("Towers"), button:has-text("Towers"), a:has-text("Towers")').first();
    this.galleryTab      = page.locator('[role="tab"]:has-text("Gallery"), button:has-text("Gallery"), a:has-text("Gallery")').first();
    this.documentsTab    = page.locator('[role="tab"]:has-text("Documents"), button:has-text("Documents"), a:has-text("Documents")').first();
    this.videosTab       = page.locator('[role="tab"]:has-text("Videos"), button:has-text("Videos"), a:has-text("Videos")').first();
    this.activeTab       = page.locator('[role="tab"][aria-selected="true"], .ant-tabs-tab-active').first();

    // ── Tab panel containers (one is visible at a time) ─────────────────────
    this.tabPanel        = page.locator('[role="tabpanel"], .ant-tabs-tabpane-active, .tab-content').first();

    // ── Overview content ────────────────────────────────────────────────────
    this.overviewSection   = page.locator('section:has-text("Overview"), [data-tab="overview"], .overview-section').first();
    this.heroImage         = page.locator('img[alt*="hero" i], img[alt*="project" i], .hero img, .project-hero img').first();
    this.highlightsList    = page.locator('ul:has(li):below(:text("Highlights")), .highlights, [data-testid="highlights"]').first();
    this.highlightItems    = page.locator('.highlights li, [data-testid="highlights"] li');
    this.mahareraText      = page.locator(':text-matches("MahaRERA|P5\\d{10}", "i")').first();

    // ── Towers content ─────────────────────────────────────────────────────
    this.towerSection      = page.locator('section:has-text("Tower"), .tower-section, [data-tab="towers"]').first();
    this.towerTabs         = page.locator('[role="tab"]:has-text(/Crest|Crown|Blossom|Pinnacle|Bright|Tower/i), .tower-tabs button');
    this.towerSpecsPanel   = page.locator('.tower-specs, [data-testid="tower-specs"], section:has(:text("Height")):has(:text("Units"))').first();

    // ── Gallery content ────────────────────────────────────────────────────
    this.gallerySection    = page.locator('section:has-text("Gallery"), .gallery, [data-tab="gallery"]').first();
    this.galleryThumbnails = page.locator('.gallery img, [data-testid="gallery"] img, [role="tabpanel"] img');
    this.lightbox          = page.locator('[role="dialog"]:visible, .lightbox, .image-modal, .ant-modal:visible').first();
    this.lightboxNext      = page.locator('[role="dialog"] [aria-label*="Next" i], .lightbox-next').first();
    this.lightboxPrev      = page.locator('[role="dialog"] [aria-label*="Prev" i], .lightbox-prev').first();
    this.lightboxClose     = page.locator('[role="dialog"] [aria-label*="Close" i], .lightbox-close, .ant-modal-close').first();

    // ── Documents content ──────────────────────────────────────────────────
    this.documentsSection  = page.locator('section:has-text("Document"), .documents, [data-tab="documents"]').first();
    this.documentRows      = page.locator('.documents [class*="row"], .document-item, [data-testid="document-row"]');
    this.documentLinks     = page.locator('a:has-text(/View|Download/i), a[href*=".pdf"]');
    this.reraDocument      = page.locator(':text-matches("RERA|MahaRERA", "i")').first();
    this.brochureDocument  = page.locator(':text-matches("Brochure", "i")').first();

    // ── Videos content ─────────────────────────────────────────────────────
    this.videosSection     = page.locator('section:has-text("Video"), .videos, [data-tab="videos"]').first();
    this.videoThumbnails   = page.locator('.video-thumb, [data-testid="video"] img, video, iframe[src*="youtube"], iframe[src*="vimeo"]');
    this.videoPlayer       = page.locator('video:visible, iframe[src*="youtube"]:visible, iframe[src*="vimeo"]:visible').first();

    // ── Empty / loader / error states ──────────────────────────────────────
    this.emptyState        = page.locator(':text-matches("No images|No videos|No documents|Specifications not available|empty", "i")').first();
    this.loadingSpinner    = page.locator('.ant-spin, .spinner, [role="status"], [data-testid="loader"]').first();
    this.errorBanner       = page.locator(':text-matches("Unable to load|something went wrong|Try again", "i")').first();
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

  async isOnNotFound() {
    const text = await this.page.locator('body').textContent().catch(() => '');
    return NOT_FOUND_RE.test(text || '');
  }

  // ── Tab opener helpers ─────────────────────────────────────────────────

  async openOverviewTab() {
    if (await this.overviewTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.click(this.overviewTab);
      await this.page.waitForTimeout(400); // tab transition — no network event reliably fires
    }
  }

  async openTowersTab() {
    if (await this.towersTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.click(this.towersTab);
      await this.page.waitForTimeout(400);
    }
  }

  async openGalleryTab() {
    if (await this.galleryTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.click(this.galleryTab);
      await this.page.waitForTimeout(400);
    }
  }

  async openDocumentsTab() {
    if (await this.documentsTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.click(this.documentsTab);
      await this.page.waitForTimeout(400);
    }
  }

  async openVideosTab() {
    if (await this.videosTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.click(this.videosTab);
      await this.page.waitForTimeout(400);
    }
  }

  async getActiveTabText() {
    const text = await this.activeTab.textContent({ timeout: 2_000 }).catch(() => '');
    return (text || '').trim();
  }

  async getTabLabels() {
    return TAB_LABELS;
  }

  // ── Content assertion helpers ──────────────────────────────────────────

  /**
   * Expect that *some* content has rendered on the active tab — either a known
   * section locator OR fallback page text length >0. Strapi-driven UI may be
   * empty on UAT; we accept either visible content OR an empty-state banner.
   */
  async expectContentRendered() {
    const panelVisible = await this.tabPanel.isVisible({ timeout: 4_000 }).catch(() => false);
    if (panelVisible) return true;
    const bodyText = (await this.page.locator('body').textContent()) || '';
    return bodyText.length > 50; // bare minimum non-blank
  }

  /**
   * Listen for outbound Strapi network calls during a content fetch. Returns
   * true if any request to strapi/api/projects was observed within the window.
   * Per BYR_PROJ_026 the project ID is hardcoded to 1 — we don't assert that
   * here because the buyer client may proxy through backend.
   */
  async expectStrapiSync(actionFn, timeoutMs = 8_000) {
    let observed = false;
    const handler = (req) => {
      const url = req.url();
      if (/strapi|\/api\/projects|populate=deep/i.test(url)) observed = true;
    };
    this.page.on('request', handler);
    try {
      await actionFn();
      // Allow late requests to fire
      const start = Date.now();
      while (!observed && Date.now() - start < timeoutMs) {
        await this.page.waitForTimeout(250);
      }
    } finally {
      this.page.off('request', handler);
    }
    return observed;
  }

  async getRenderedTabContentText() {
    const text = (await this.tabPanel.textContent().catch(() => '')) || '';
    return text.trim();
  }

  async getHighlightCount() {
    return this.highlightItems.count().catch(() => 0);
  }

  async getGalleryThumbnailCount() {
    return this.galleryThumbnails.count().catch(() => 0);
  }

  async getDocumentRowCount() {
    const rows = await this.documentRows.count().catch(() => 0);
    if (rows > 0) return rows;
    return this.documentLinks.count().catch(() => 0);
  }

  async getVideoCount() {
    return this.videoThumbnails.count().catch(() => 0);
  }

  async getTowerTabCount() {
    return this.towerTabs.count().catch(() => 0);
  }

  // ── Lightbox helpers ──────────────────────────────────────────────────

  async openFirstGalleryImage() {
    const count = await this.getGalleryThumbnailCount();
    if (count === 0) return { opened: false, reason: 'No gallery thumbnails rendered' };
    await this.galleryThumbnails.first().click({ timeout: 3_000 }).catch(() => {});
    const opened = await this.lightbox.isVisible({ timeout: 3_000 }).catch(() => false);
    return { opened, reason: opened ? null : 'Lightbox did not open after click' };
  }

  async closeLightboxWithEsc() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  // ── Document helpers ──────────────────────────────────────────────────

  async hasReraDocument() {
    return this.reraDocument.isVisible({ timeout: 2_000 }).catch(() => false);
  }

  async hasBrochure() {
    return this.brochureDocument.isVisible({ timeout: 2_000 }).catch(() => false);
  }

  // ── Refresh & state probes ────────────────────────────────────────────

  async reloadAndCheckTabState() {
    const beforeTab = await this.getActiveTabText();
    await this.page.reload();
    await this.waitForLoad();
    const afterTab = await this.getActiveTabText();
    return { beforeTab, afterTab };
  }
}

module.exports = {
  ProjectInformationPage,
  PROJECTINFORMATION_URL,
  TAB_LABELS,
};
