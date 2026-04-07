/**
 * CP PORTAL PAGE — Growth Partner Portal
 * ========================================
 * URL: https://uat-web.xrportal.in/
 *
 * Layout:
 *   Login    — Mobile Number input → Send OTP → OTP entry → Submit OTP
 *   Dashboard— KPI cards (Sent / Registered / Booking / Cancelled)
 *              HV Code + XR Code card
 *              Create New Lead form
 *              Customers table with "All Team Leads" filter dropdown
 */

const { BasePage } = require('../base/BasePage');

const CP_PORTAL_URL = 'https://uat-web.xrportal.in';

class CPPortalPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // ── Login ─────────────────────────────────────────────────────────────────────

  async navigateToLogin() {
    await this.page.goto(CP_PORTAL_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await this.page.waitForTimeout(1500);
  }

  async login(phone, otp) {
    // Enter mobile number
    const phoneInput = this.page.locator('input[placeholder*="Mobile" i], input[type="tel"], input[type="number"]').first();
    await phoneInput.waitFor({ state: 'visible', timeout: 10_000 });
    await phoneInput.fill(phone);

    // Click Send OTP
    await this.page.locator('button:has-text("Send OTP")').first().click();

    // Wait for OTP input screen — CP portal uses Ant Design OTP inputs (.ant-otp-input)
    const firstOtpInput = this.page.locator('input.ant-otp-input').first();
    await firstOtpInput.waitFor({ state: 'visible', timeout: 15_000 });

    // Fill each OTP digit into its individual input box
    const allOtpInputs = this.page.locator('input.ant-otp-input');
    for (let i = 0; i < otp.length; i++) {
      await allOtpInputs.nth(i).fill(otp[i]);
      await this.page.waitForTimeout(80);
    }

    // Click Submit OTP
    await this.page.locator('button:has-text("Submit OTP")').first().click();
    await this.page.waitForURL(`${CP_PORTAL_URL}/dashboard`, { timeout: 20_000 });
    await this.page.waitForTimeout(1500);
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────

  /** Returns { sent, registered, booking, cancelled } from KPI cards */
  async getDashboardKPIs() {
    const cards = this.page.locator('.dashboard-card, [class*="kpi"], [class*="stats"], [class*="count-card"]');
    const cardTexts = await this.page.locator('div').filter({ hasText: /^(Sent|No\. of Registered Unit|No\. of Booking|Cancelled Unit)$/ }).all();

    const kpis = {};
    for (const card of cardTexts) {
      const label = (await card.textContent()).trim();
      // The count is typically in a sibling/parent element
      const parent = card.locator('xpath=..').first();
      const countEl = parent.locator('div, span, p').filter({ hasText: /^\d+$/ }).first();
      const val = parseInt((await countEl.textContent().catch(() => '0')).trim(), 10);
      if (/Sent/i.test(label)) kpis.sent = val;
      else if (/Registered/i.test(label)) kpis.registered = val;
      else if (/Booking/i.test(label)) kpis.booking = val;
      else if (/Cancelled/i.test(label)) kpis.cancelled = val;
    }
    return kpis;
  }

  /** Returns the HV Code shown on the dashboard card */
  async getHVCode() {
    const el = this.page.locator('text=/HV Code/').locator('xpath=..').locator('span, a, b').filter({ hasText: /HV\d+/ }).first();
    return (await el.textContent().catch(() => '')).trim();
  }

  // ── All Team Leads filter ─────────────────────────────────────────────────────

  /** Opens the "All Team Leads" dropdown and returns all option texts */
  async getTeamLeadsDropdownOptions() {
    await this.page.locator('text=All Team Leads').first().click();
    await this.page.waitForTimeout(600);

    const options = await this.page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option, [class*="dropdown"] li, [role="option"]')
      .allTextContents();

    return options.map(o => o.trim()).filter(Boolean);
  }

  /** Selects a specific option from the "All Team Leads" dropdown */
  async selectTeamLeadsOption(optionText) {
    const option = this.page.locator(
      '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option, [class*="dropdown"] li, [role="option"]'
    ).filter({ hasText: optionText }).first();
    await option.click();
    await this.page.waitForTimeout(1000);
  }

  /** Returns the count of rows in the Customers table */
  async getCustomerRowCount() {
    return await this.page.locator('table tbody tr, .customer-table tr').count();
  }

  /** Returns text content of all customer rows */
  async getCustomerRows() {
    const rows = await this.page.locator('table tbody tr').all();
    const result = [];
    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      result.push(cells.map(c => c.trim()));
    }
    return result;
  }
}

module.exports = { CPPortalPage };
