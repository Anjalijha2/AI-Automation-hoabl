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

  // ── JBP Portal ───────────────────────────────────────────────────────────────

  /** Navigate to the JBP dashboard page */
  async navigateToJBP() {
    await this.page.goto(`${CP_PORTAL_URL}/jbp`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await this.page.waitForTimeout(1500);
  }

  /** Returns the current cycle name from the JBP dashboard banner */
  async getCurrentCycleName() {
    // The banner renders as a heading with emoji: "📅 Current Cycle - <name>"
    const heading = this.page.locator('h1, h2, h3, h4, p, div')
      .filter({ hasText: /Current Cycle/i }).first();
    return (await heading.textContent().catch(() => '')).trim();
  }

  /** Clicks "Add New JBP Entry" button and waits for the form to load */
  async clickAddNewJBPEntry() {
    await this.page.locator('button:has-text("Add New JBP Entry")').first().click();
    // Wait for JBP form heading
    await this.page.locator('h1, h2').filter({ hasText: /JBP Form/i }).first()
      .waitFor({ state: 'visible', timeout: 15_000 });
    await this.page.waitForTimeout(500);
  }

  /**
   * Fills the JBP Form.
   * @param {object} data
   * @param {string}   data.brokerage        — e.g. '10,00,000'
   * @param {string}   [data.units]          — first option if omitted
   * @param {number}   [data.manpower]       — default 1
   * @param {string[]} [data.activities]     — checkbox labels e.g. ['Tele-calling', 'Digital']
   * @param {string[]} [data.digitalPlatforms] — e.g. ['Google']
   * @param {string}   [data.googleBudget]   — required if Google is selected
   * @param {string}   [data.totalInvestment] — radio label e.g. 'Upto 1 lakhs'
   * @param {string}   [data.registrationCount] — e.g. '1'
   */
  async fillJBPForm({
    brokerage,
    units,
    manpower,
    activities       = [],
    digitalPlatforms = [],
    googleBudget,
    totalInvestment,
    registrationCount,
  } = {}) {
    // Helper: Ant Design Select scoped to the question containing labelPattern
    const selectInQuestion = async (labelPattern, optionText) => {
      const qBlock = this.page.locator('div')
        .filter({ hasText: labelPattern })
        .filter({ has: this.page.locator('.ant-select') })
        .first();
      await qBlock.locator('.ant-select-selector').click({ force: true });
      await this.page.waitForTimeout(500);
      const dropdown = this.page.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option'
      );
      await dropdown.first().waitFor({ state: 'visible', timeout: 8_000 });
      const target = optionText
        ? dropdown.filter({ hasText: optionText }).first()
        : dropdown.first();
      await target.click();
      await this.page.waitForTimeout(400);
      // Dismiss: click outside (not Escape — that closes the modal/page)
      await this.page.mouse.click(400, 50);
      await this.page.waitForTimeout(300);
    };

    // Q1 — Brokerage to be Earned
    if (brokerage) {
      await selectInQuestion(/Brokerage to be Earned/i, brokerage);
    }

    // Q2 — Net Booking Commitment (Units)
    await selectInQuestion(/Net Booking commitment/i, units || null);

    // Q3 — Manpower (number input; default is 1, leave unless different)
    if (manpower && manpower !== 1) {
      await this.page.locator('input[type="number"]').first().fill(String(manpower));
    }

    // Q4 — Activities (checkboxes) — use getByRole for reliability
    for (const activity of activities) {
      const cb = this.page.getByRole('checkbox', { name: new RegExp(`^${activity}$`, 'i') });
      const isChecked = await cb.first().isChecked().catch(() => false);
      if (!isChecked) await cb.first().click({ force: true });
      await this.page.waitForTimeout(200);
    }

    // Q5 — Digital platforms (checkboxes) + Google Budget field
    for (const platform of digitalPlatforms) {
      const cb = this.page.getByRole('checkbox', { name: new RegExp(`^${platform}$`, 'i') });
      const isChecked = await cb.first().isChecked().catch(() => false);
      if (!isChecked) await cb.first().click({ force: true });
      await this.page.waitForTimeout(400);

      if (platform === 'Google' && googleBudget) {
        const budgetInput = this.page.locator(
          'input[placeholder*="Amount" i], input[placeholder*="amount" i], input[placeholder*="Budget" i]'
        ).first();
        await budgetInput.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
        await budgetInput.fill(String(googleBudget));
        await this.page.waitForTimeout(200);
      }
    }

    // Q6 — Total Investment radio (default "Upto 1 lakhs" may already be selected)
    const investLabel = totalInvestment || 'Upto 1 lakhs';
    const q6Radio = this.page.getByRole('radio', { name: new RegExp(`^${investLabel}$`, 'i') });
    const q6Checked = await q6Radio.first().isChecked().catch(() => false);
    if (!q6Checked) await q6Radio.first().click({ force: true });
    await this.page.waitForTimeout(200);

    // Q7–Q13 — Yes/No radios: all default to "No" already selected.
    // Explicitly confirm each "No" radio is checked as a safety measure.
    const noRadios = this.page.getByRole('radio', { name: /^No$/i });
    const noCount  = await noRadios.count();
    for (let i = 0; i < noCount; i++) {
      const checked = await noRadios.nth(i).isChecked().catch(() => false);
      if (!checked) await noRadios.nth(i).click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(100);
    }

    // Q14 — Registration Commitment Count (number input at bottom of form)
    if (registrationCount) {
      const regInput = this.page.locator(
        'input[placeholder*="Count" i], input[placeholder*="count" i], input[placeholder*="Total" i]'
      ).last();
      await regInput.scrollIntoViewIfNeeded();
      await regInput.fill(String(registrationCount));
      await this.page.waitForTimeout(200);
    }
  }

  /** Clicks the Submit button on the JBP form */
  async submitJBPForm() {
    await this.page.locator('button:has-text("Submit")').first().click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Waits up to 8s after submit and returns true only on actual success.
   * Returns false if an error toast appears (e.g. "Please fill all the mandatory fields").
   */
  async isJBPSubmissionSuccessful() {
    // Wait briefly for any toast to appear
    await this.page.waitForTimeout(1500);

    // If error toast is visible → failure
    const errorVisible = await this.page.locator(
      '.ant-message-error, .ant-message-error span, .ant-notification-error'
    ).first().isVisible().catch(() => false);
    if (errorVisible) return false;

    // Check for "Please fill all the mandatory fields" text
    const mandatoryErr = await this.page.locator(
      'text=/mandatory fields/i, text=/required fields/i, text=/please fill/i'
    ).first().isVisible().catch(() => false);
    if (mandatoryErr) return false;

    // Success: either a success toast OR the page navigated away from the form
    const successToast = await this.page.locator(
      '.ant-message-success, .ant-notification-success'
    ).first().isVisible().catch(() => false);
    if (successToast) return true;

    // If URL changed away from the form (e.g., back to /jbp dashboard with submission)
    // The form URL typically includes a path like /jbp/new or /jbp/<id>/edit
    // The dashboard is exactly /jbp
    const url = this.page.url();
    const isFormPage = url.includes('/jbp/') || url.includes('/jbp?');
    if (!isFormPage && url.includes('/jbp')) return true;

    return false;
  }
}

module.exports = { CPPortalPage };
