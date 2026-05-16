/**
 * BASE PAGE — Shared utilities for all Page Objects
 * All page objects extend this class.
 *
 * Browser config is set via environment variables:
 *   HEADLESS=true   — run headless (default: false/headed)
 *   BASE_URL        — override base URL (default: from .env)
 *   BROWSER         — execution browser (default: chromium)
 */

require('dotenv').config();

class BasePage {
  constructor(page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || 'https://uat-web.xrportal.in/admin';
    this.browserName = process.env.BROWSER || 'chromium';
  }

  /**
   * Helper to launch browsers outside the standard test runner (e.g. for AI Agents)
   * Uses process.env.BROWSER or defaults to 'chromium'
   */
  static async launchBrowser(options = {}) {
    const playwright = require('playwright');
    const browserType = process.env.BROWSER || 'chromium';
    const isHeadless = process.env.HEADLESS === 'true';
    
    console.log(`[BasePage] Launching browser: ${browserType} (headless: ${isHeadless})`);
    return await playwright[browserType].launch({ 
      headless: isHeadless, 
      ...options 
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  async navigate(urlPath = '') {
    await this.page.goto(`${this.baseUrl}${urlPath}`, { waitUntil: 'domcontentloaded' });
  }

  // ── Element helpers ───────────────────────────────────────────────────────────

  async waitForElement(selector, timeout = 15000) {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  async click(selector) {
    await this.page.locator(selector).click();
  }

  async fill(selector, value) {
    await this.page.locator(selector).fill(value);
  }

  async getText(selector) {
    return await this.page.locator(selector).textContent();
  }

  async getTitle() {
    return await this.page.title();
  }

  // ── Screenshots ───────────────────────────────────────────────────────────────

  async takeScreenshot(name) {
    const ts = Date.now();
    await this.page.screenshot({ path: `reports/screenshots/${name}_${ts}.png`, fullPage: true });
  }

  /** Legacy screenshot method — used by existing page objects */
  async screenshot(label, folder = 'reports/screenshots') {
    const ts = Date.now();
    await this.page.screenshot({ path: `${folder}/${label}_${ts}.png`, fullPage: true });
  }

  // ── Timing ────────────────────────────────────────────────────────────────────

  async pause(ms = 800) {
    await this.page.waitForTimeout(ms);
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { BasePage };
