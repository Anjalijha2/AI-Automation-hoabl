'use strict';

/**
 * ProjectInformationPage.js — Page Object Model for Channel Partner Portal / project-information.
 *
 * BRD/FRD: CP-FS-Project-Information / CP-BRD-CP-Portal
 * TC source: manual-qa-repository/01-test-cases/cp-portal/project-information/TC_PROJECT_INFORMATION.md
 *
 * Architecture — FSD facts (2026-05-25):
 *   - CP frontend hits Strapi DIRECTLY at `<StrapiBase>/api/projects/1?populate=deep`
 *     (Urls.js:7). No XR backend mediation for project content (FSD §6.1).
 *   - Project ID is HARDCODED to `1` regardless of env (CP-PI-002).
 *   - About uses `dangerouslySetInnerHTML` without sanitization (CP-PI-004) —
 *     known XSS gap if Strapi authoring controls fail.
 *   - Brochure / asset URLs are unsigned raw Strapi URLs (CP-PI-005) — shareable
 *     externally without auth.
 *   - `populate=deep` may include DRAFT entries unless `publicationState=live`
 *     is passed (CP-PI-008, QA-Risk-14).
 *   - No XR-side caching / ISR — every load fetches Strapi (CP-PI-007).
 *
 * Locator map (locators/channel-partner/locator-map.json — "project-information")
 * exposes only generic topbar + lead-creation widget elements (19 keys: logout,
 * copyLink, downloadQRCode, createLead, reset variants, nav links, inputs and
 * Welcome heading). Tab + content selectors fall back to DOM text/role probes —
 * Strapi-driven UI has no testid yet.
 */

const { BasePage } = require('../../base/BasePage');
const locatorMap   = require('../../../locators/channel-partner/locator-map.json');

const L = locatorMap['project-information'] || {};

// Section landing URLs (frontend-only routes, served by Next.js / Vite app shell)
const PROJECTINFORMATION_URL = 'https://uat-web.xrportal.in/project1';
const ABOUT_URL              = 'https://uat-web.xrportal.in/project1/about';
const GALLERY_URL            = 'https://uat-web.xrportal.in/project1/gallery';
const AMENITIES_URL          = 'https://uat-web.xrportal.in/project1/amenities';
const DOCUMENTS_URL          = 'https://uat-web.xrportal.in/project1/documents';
const KEY_POINTS_URL         = 'https://uat-web.xrportal.in/project1/keyPoints';
const VIDEOS_URL             = 'https://uat-web.xrportal.in/project1/videos';

const TAB_LABELS = ['About', 'Gallery', 'Amenities', 'Documents', 'Key Points', 'Videos'];

const LOGIN_URL_RE   = /\/(login|signin)/i;
const NOT_FOUND_RE   = /This page could not be found|404/i;
const STRAPI_PROJECT_RE = /\/api\/projects\/1(\?|$|\/)/i;
const POPULATE_DEEP_RE  = /populate=deep/i;

class ProjectInformationPage extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
    this.url = PROJECTINFORMATION_URL;

    // ── Locator-map elements (topbar + lead widget — generic CP shell) ────────
    this.logoutButton             = page.locator(L['logoutButton'] && L['logoutButton'].selector ? L['logoutButton'].selector : 'button:has-text("Logout")');
    this.copyLinkButton           = page.locator(L['copyLinkButton'] && L['copyLinkButton'].selector ? L['copyLinkButton'].selector : 'button:has-text("Copy link")');
    this.downloadQRCodeButton     = page.locator(L['downloadQRCodeButton'] && L['downloadQRCodeButton'].selector ? L['downloadQRCodeButton'].selector : 'button:has-text("Download QR Code")');
    this.createLeadButton         = page.locator(L['createLeadButton'] && L['createLeadButton'].selector ? L['createLeadButton'].selector : 'button:has-text("Create Lead")');
    this.homeLink                 = page.locator(L['homeLink'] && L['homeLink'].selector ? L['homeLink'].selector : 'a:has-text("Home")').first();
    this.kYCLink                  = page.locator(L['kYCLink'] && L['kYCLink'].selector ? L['kYCLink'].selector : 'a:has-text("KYC")');
    this.jBPLink                  = page.locator(L['jBPLink'] && L['jBPLink'].selector ? L['jBPLink'].selector : 'a:has-text("JBP")');
    this.leadsLink                = page.locator(L['leadsLink'] && L['leadsLink'].selector ? L['leadsLink'].selector : 'a:has-text("Leads")');
    this.welcomeGPTestNameHeading = page.locator(L['welcomeGPTestNameHeading'] && L['welcomeGPTestNameHeading'].selector ? L['welcomeGPTestNameHeading'].selector : 'h2:has-text("Welcome")');

    // ── Page shell ────────────────────────────────────────────────────────────
    this.pageShell = page.locator('body');

    // ── Tab bar + section tabs (DOM fallbacks; no testid yet) ────────────────
    this.tabBar       = page.locator('[role="tablist"], .ant-tabs-nav, nav:has(a:has-text("About"))').first();
    this.aboutTab     = page.locator('[role="tab"]:has-text("About"), a:has-text("About"), button:has-text("About")').first();
    this.galleryTab   = page.locator('[role="tab"]:has-text("Gallery"), a:has-text("Gallery"), button:has-text("Gallery")').first();
    this.amenitiesTab = page.locator('[role="tab"]:has-text("Amenities"), a:has-text("Amenities"), button:has-text("Amenities")').first();
    this.documentsTab = page.locator('[role="tab"]:has-text("Documents"), a:has-text("Documents"), button:has-text("Documents")').first();
    this.keyPointsTab = page.locator('[role="tab"]:has-text("Key Points"), a:has-text("Key Points"), button:has-text("Key Points")').first();
    this.videosTab    = page.locator('[role="tab"]:has-text("Videos"), a:has-text("Videos"), button:has-text("Videos")').first();
    this.activeTab    = page.locator('[role="tab"][aria-selected="true"], .ant-tabs-tab-active, .active[role="tab"]').first();
    this.tabPanel     = page.locator('[role="tabpanel"], .ant-tabs-tabpane-active, .tab-content, main').first();

    // ── About content ────────────────────────────────────────────────────────
    this.aboutSection    = page.locator('section:has-text("About"), [data-tab="about"], .about-section, main').first();
    this.aboutHeading    = page.locator('h1:has-text("About"), h2:has-text("About"), h3:has-text("About")').first();
    this.aboutBody       = page.locator('.project-info, .about, [data-testid="about-body"], main p').first();
    this.aboutEditButton = page.locator('button:has-text("Edit"), [aria-label*="edit" i]').first();
    this.aboutSaveButton = page.locator('button:has-text("Save")').first();

    // ── Gallery content ──────────────────────────────────────────────────────
    this.gallerySection    = page.locator('section:has-text("Gallery"), .gallery, [data-tab="gallery"], main').first();
    this.galleryThumbnails = page.locator('.gallery img, [data-testid="gallery"] img, main img:not([alt*="logo" i]):not([alt*="QR" i])');
    this.lightbox          = page.locator('[role="dialog"]:visible, .lightbox, .image-modal, .ant-modal:visible').first();
    this.lightboxClose     = page.locator('[role="dialog"] [aria-label*="Close" i], .lightbox-close, .ant-modal-close').first();

    // ── Amenities content ────────────────────────────────────────────────────
    this.amenitiesSection = page.locator('section:has-text("Amenit"), .amenities, [data-tab="amenities"], main').first();
    this.amenityItems     = page.locator('.amenities li, .amenity-item, [data-testid="amenity"]');
    this.amenityIcons     = page.locator('.amenities img, .amenity-item img');

    // ── Documents content ────────────────────────────────────────────────────
    this.documentsSection = page.locator('section:has-text("Document"), .documents, [data-tab="documents"], main').first();
    this.documentRows     = page.locator('.documents [class*="row"], .document-item, [data-testid="document-row"]');
    this.documentLinks    = page.locator('a:has-text(/View|Download/i), a[href*=".pdf"], a[download]');
    this.reraDocument     = page.locator(':text-matches("RERA|MahaRERA", "i")').first();
    this.brochureDocument = page.locator(':text-matches("Brochure", "i")').first();
    this.uploadButton     = page.locator('button:has-text(/Upload|Add Document/i), input[type="file"]').first();
    this.deleteDocBtn     = page.locator('button:has-text(/Delete|Remove/i)').first();

    // ── Key Points content ──────────────────────────────────────────────────
    this.keyPointsSection = page.locator('section:has-text("Key Point"), .key-points, [data-tab="keyPoints"], main').first();
    this.keyPointItems    = page.locator('.key-points li, .keypoint-item, [data-testid="keypoint"], main ul li');

    // ── Videos content ──────────────────────────────────────────────────────
    this.videosSection   = page.locator('section:has-text("Video"), .videos, [data-tab="videos"], main').first();
    this.videoThumbnails = page.locator('.video-thumb, [data-testid="video"] img, video, iframe[src*="youtube"], iframe[src*="vimeo"]');
    this.videoPlayer     = page.locator('video:visible, iframe[src*="youtube"]:visible, iframe[src*="vimeo"]:visible').first();

    // ── States ──────────────────────────────────────────────────────────────
    this.emptyState     = page.locator(':text-matches("No (photos|images|videos|documents|amenities|key points) (available|published)|empty|not available", "i")').first();
    this.loadingSpinner = page.locator('.ant-spin, .spinner, [role="status"], [data-testid="loader"]').first();
    this.errorBanner    = page.locator(':text-matches("Unable to load|something went wrong|Try again|error", "i")').first();
    this.errorBoundary  = page.locator(':text-matches("Application error|Error boundary|white screen", "i")').first();
  }

  // ── Navigation helpers ─────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateAbout()      { await this.page.goto(ABOUT_URL);      await this.page.waitForLoadState('domcontentloaded'); }
  async navigateGallery()    { await this.page.goto(GALLERY_URL);    await this.page.waitForLoadState('domcontentloaded'); }
  async navigateAmenities()  { await this.page.goto(AMENITIES_URL);  await this.page.waitForLoadState('domcontentloaded'); }
  async navigateDocuments()  { await this.page.goto(DOCUMENTS_URL);  await this.page.waitForLoadState('domcontentloaded'); }
  async navigateKeyPoints()  { await this.page.goto(KEY_POINTS_URL); await this.page.waitForLoadState('domcontentloaded'); }
  async navigateVideos()     { await this.page.goto(VIDEOS_URL);     await this.page.waitForLoadState('domcontentloaded'); }

  async waitForLoad() {
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10_000 });
    } catch {
      /* Strapi response may stream longer than 10s on UAT — fall through */
    }
  }

  async isOnLoginRedirect() {
    if (LOGIN_URL_RE.test(this.page.url())) return true;
    return this.page.locator('h2:has-text("GROWTH PARTNER LOGIN"), input[placeholder="Enter Mobile Number"]')
      .first()
      .isVisible({ timeout: 1_500 })
      .catch(() => false);
  }

  async isOnNotFound() {
    const text = await this.page.locator('body').textContent().catch(() => '');
    return NOT_FOUND_RE.test(text || '');
  }

  // ── Tab opener helpers ────────────────────────────────────────────────────

  async openAboutTab() {
    if (await this.aboutTab.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await this.click(this.aboutTab);
      await this.page.waitForTimeout(400);
    } else {
      await this.navigateAbout();
    }
  }

  async openGalleryTab() {
    if (await this.galleryTab.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await this.click(this.galleryTab);
      await this.page.waitForTimeout(400);
    } else {
      await this.navigateGallery();
    }
  }

  async openAmenitiesTab() {
    if (await this.amenitiesTab.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await this.click(this.amenitiesTab);
      await this.page.waitForTimeout(400);
    } else {
      await this.navigateAmenities();
    }
  }

  async openDocumentsTab() {
    if (await this.documentsTab.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await this.click(this.documentsTab);
      await this.page.waitForTimeout(400);
    } else {
      await this.navigateDocuments();
    }
  }

  async openKeyPointsTab() {
    if (await this.keyPointsTab.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await this.click(this.keyPointsTab);
      await this.page.waitForTimeout(400);
    } else {
      await this.navigateKeyPoints();
    }
  }

  async openVideosTab() {
    if (await this.videosTab.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await this.click(this.videosTab);
      await this.page.waitForTimeout(400);
    } else {
      await this.navigateVideos();
    }
  }

  async getActiveTabText() {
    const text = await this.activeTab.textContent({ timeout: 2_000 }).catch(() => '');
    return (text || '').trim();
  }

  async getTabLabels() { return TAB_LABELS; }

  // ── Content assertion helpers ────────────────────────────────────────────

  async expectContentRendered() {
    const panelVisible = await this.tabPanel.isVisible({ timeout: 4_000 }).catch(() => false);
    if (panelVisible) return true;
    const bodyText = (await this.page.locator('body').textContent()) || '';
    return bodyText.length > 50;
  }

  /**
   * Per FSD §6.1 / CP-PI-002, CP fetches Strapi directly. This helper attaches
   * a request listener that captures any outbound /api/projects/<id> traffic
   * during `actionFn` and returns a verdict on whether Strapi was hit directly
   * (no XR backend proxy).
   */
  async expectStrapiDirect(actionFn, timeoutMs = 8_000) {
    const captured = { strapiDirect: false, xrBackend: false, projectId: null, populateDeep: false, urls: [] };
    const handler = (req) => {
      const url = req.url();
      captured.urls.push(url);
      if (STRAPI_PROJECT_RE.test(url)) {
        captured.strapiDirect = true;
        const m = url.match(/\/api\/projects\/(\d+)/i);
        if (m) captured.projectId = Number(m[1]);
        if (POPULATE_DEEP_RE.test(url)) captured.populateDeep = true;
      }
      if (/\/api\/v1\/(cp|projects|towers|brochure|documents|gallery|videos)/i.test(url)) {
        captured.xrBackend = true;
      }
    };
    this.page.on('request', handler);
    try {
      await actionFn();
      const start = Date.now();
      while (!captured.strapiDirect && Date.now() - start < timeoutMs) {
        await this.page.waitForTimeout(250);
      }
    } finally {
      this.page.off('request', handler);
    }
    return captured;
  }

  async getRenderedTabContentText() {
    const text = (await this.tabPanel.textContent().catch(() => '')) || '';
    return text.trim();
  }

  async getGalleryThumbnailCount()  { return this.galleryThumbnails.count().catch(() => 0); }
  async getAmenityCount()           { return this.amenityItems.count().catch(() => 0); }
  async getDocumentRowCount() {
    const rows = await this.documentRows.count().catch(() => 0);
    if (rows > 0) return rows;
    return this.documentLinks.count().catch(() => 0);
  }
  async getKeyPointCount() { return this.keyPointItems.count().catch(() => 0); }
  async getVideoCount()    { return this.videoThumbnails.count().catch(() => 0); }

  // ── Lightbox helpers ────────────────────────────────────────────────────

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

  // ── Read-only assertions (CP_PROJ_011/016/019/021) ──────────────────────

  async hasNoEditControls() {
    const editVisible   = await this.aboutEditButton.isVisible({ timeout: 1_500 }).catch(() => false);
    const saveVisible   = await this.aboutSaveButton.isVisible({ timeout: 1_500 }).catch(() => false);
    const uploadVisible = await this.uploadButton.isVisible({ timeout: 1_500 }).catch(() => false);
    const deleteVisible = await this.deleteDocBtn.isVisible({ timeout: 1_500 }).catch(() => false);
    return !(editVisible || saveVisible || uploadVisible || deleteVisible);
  }

  // ── Document helpers ────────────────────────────────────────────────────

  async hasReraDocument()  { return this.reraDocument.isVisible({ timeout: 2_000 }).catch(() => false); }
  async hasBrochure()      { return this.brochureDocument.isVisible({ timeout: 2_000 }).catch(() => false); }

  async getBrochureURL() {
    const link = await this.page.locator('a[href*="brochure" i], a:has-text("Brochure")').first()
      .getAttribute('href').catch(() => null);
    return link;
  }

  // ── Sharing helpers (CP_PROJ_024 / CP_PROJ_061) ─────────────────────────

  async getCurrentSectionURL() { return this.page.url(); }

  async openURLInFreshContext(browser, url) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto(url);
    await p.waitForLoadState('domcontentloaded');
    return { ctx, page: p };
  }
}

module.exports = {
  ProjectInformationPage,
  PROJECTINFORMATION_URL,
  ABOUT_URL,
  GALLERY_URL,
  AMENITIES_URL,
  DOCUMENTS_URL,
  KEY_POINTS_URL,
  VIDEOS_URL,
  TAB_LABELS,
};
