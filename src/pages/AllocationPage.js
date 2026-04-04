const { expect } = require("@playwright/test");
const { BasePage } = require("../base/BasePage");

const ADMIN_URL = "https://uat-web.xrportal.in/admin/allocation";
const CUSTOMER_URL = "https://uat.xrportal.in";

class AllocationPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // ─── Shared helpers ──────────────────────────────────────────────────────────

  async waitForSuccessToast(timeout = 15_000) {
    const toast = this.page
      .locator(
        ".ant-message-success, .ant-message-notice, .ant-message-notice-content, " +
          '.ant-notification-notice-message, [class*="message-success"]',
      )
      .first();
    await toast.waitFor({ state: "visible", timeout });
    return (await toast.textContent()) ?? "";
  }

  async getToastMessage(timeout = 15_000) {
    const toast = this.page
      .locator(
        ".ant-message-success, .ant-message-error, .ant-message-warning, .ant-message-notice, " +
          ".ant-message-notice-content, .ant-notification-notice-message, " +
          '[class*="message-success"], [class*="message-error"]',
      )
      .first();
    await toast.waitFor({ state: "visible", timeout });
    return (await toast.textContent()) ?? "";
  }

  async getErrorBannerText() {
    const banner = this.page
      .locator(".ant-alert-error, .ant-message-error")
      .first();
    await banner.waitFor({ state: "visible", timeout: 6_000 });
    return (await banner.textContent()) ?? "";
  }

  async getFieldError(fieldLabel) {
    // Scope to the form item containing this label, then find error within it
    const formItem = this.page
      .locator(`.ant-form-item:has-text("${fieldLabel}")`)
      .first();
    const error = formItem
      .locator(
        '.ant-form-item-explain-error, .ant-form-item-explain, [class*="explain-error"]',
      )
      .first();
    try {
      await error.waitFor({ state: "visible", timeout: 8_000 });
      return (await error.textContent()) ?? "";
    } catch {
      return "";
    }
  }

  // ─── ADMIN — Navigation ───────────────────────────────────────────────────────

  async navigateToAdminAllocation() {
    await this.page.goto(ADMIN_URL, { waitUntil: "domcontentloaded" });
    await this.waitForNetworkIdle();
  }

  // ─── ADMIN — Create Campaign Form ────────────────────────────────────────────

  async selectProject(projectName) {
    const dropdown = this.page.locator(".ant-select").nth(0);
    await dropdown.click();
    await this.page
      .locator(".ant-select-dropdown .ant-select-item-option")
      .filter({ hasText: projectName })
      .first()
      .click();
  }

  async enterCampaignName(name) {
    const input = this.page
      .locator(
        "input[id*='campaignName'], input[placeholder*='campaign name' i], input[placeholder*='Campaign Name']",
      )
      .first();
    await input.clear();
    await input.fill(name);
  }

  async selectAllocationType(type = "Static") {
    const dropdown = this.page.locator(".ant-select").nth(1);
    await dropdown.click();
    await this.page
      .locator(".ant-select-dropdown .ant-select-item-option")
      .filter({ hasText: type })
      .first()
      .click();
  }

  /**
   * Clicks a time-column cell using raw DOM (page.evaluate).
   * Playwright locator chains fail on Ant Design time picker columns after date click;
   * raw DOM query bypasses the scoping issue entirely.
   * @param {number} colIndex — 0 = hour, 1 = minute
   * @param {number} value    — numeric value (will be zero-padded to 2 digits)
   */
  async clickTimeCell(colIndex, value) {
    await this.page.evaluate(
      ({ colIndex, value }) => {
        const cols = document.querySelectorAll(
          ".ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-time-panel-column",
        );
        const col = cols[colIndex];
        if (!col) return;
        for (const cell of col.querySelectorAll(
          ".ant-picker-time-panel-cell-inner",
        )) {
          if (cell.textContent.trim() === value) {
            cell.scrollIntoView({ block: "nearest" });
            cell.click();
            return;
          }
        }
      },
      { colIndex, value: String(value).padStart(2, "0") },
    );
  }

  /**
   * Internal helper — clicks date cell in calendar + hour + minute via raw DOM + OK.
   * Uses clickTimeCell (page.evaluate) for time columns — the only reliable approach
   * for Ant Design date-time pickers in Playwright (locator chains fail post-date-click).
   * @param {string} labelText      — form item label e.g. "Start Time"
   * @param {string} dateTimeString — "YYYY-MM-DD HH:mm"
   */
  async _setDateTimePicker(labelText, dateTimeString) {
    const [datePart, timePart] = dateTimeString.split(" ");
    const [hour, minute] = timePart.split(":").map(Number);

    // Open the picker
    const wrapper = this.page
      .locator(`.ant-form-item:has-text("${labelText}")`)
      .first();
    await wrapper.locator("input").first().click();

    // Wait for dropdown
    const DROPDOWN = ".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)";
    await this.page
      .locator(DROPDOWN)
      .waitFor({ state: "visible", timeout: 5_000 });

    // ── Step 1: Click the date cell ──────────────────────────────────────────────
    const dateCell = this.page
      .locator(`${DROPDOWN} .ant-picker-cell[title="${datePart}"]`)
      .first();
    if (await dateCell.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await dateCell.click();
      await this.page.waitForTimeout(500); // wait for time panel to stabilise
    }

    // ── Step 2: Click hour via raw DOM ───────────────────────────────────────────
    await this.clickTimeCell(0, hour);
    await this.page.waitForTimeout(200);

    // ── Step 3: Click minute via raw DOM ─────────────────────────────────────────
    await this.clickTimeCell(1, minute);
    await this.page.waitForTimeout(200);

    // ── Step 4: Click OK ─────────────────────────────────────────────────────────
    const okBtn = this.page
      .locator(`${DROPDOWN} button:has-text("OK")`)
      .first();
    await okBtn.click({ force: true });
    await this.page
      .locator(DROPDOWN)
      .waitFor({ state: "hidden", timeout: 4_000 })
      .catch(() => {});
  }

  async setStartTime(dateTimeString) {
    await this._setDateTimePicker("Start Time", dateTimeString);
  }

  async setEndTime(dateTimeString) {
    // Wait for End Time to be enabled (disabled until Start Time is committed)
    const input = this.page
      .locator('.ant-form-item:has-text("End Time") input')
      .first();
    await this.page
      .waitForFunction((el) => !el.disabled, await input.elementHandle(), {
        timeout: 5_000,
      })
      .catch(() =>
        console.log(
          "[AllocationPage] End Time input still disabled, trying anyway...",
        ),
      );

    await this._setDateTimePicker("End Time", dateTimeString);
    await this.page.keyboard.press("Tab");
  }

  async enterDescription(text) {
    const textarea = this.page.locator("textarea").first();
    await textarea.clear();
    await textarea.fill(text);
  }

  async clickSaveCampaign() {
    const btn = this.page
      .locator(
        "button:has-text('Save Campaign'), button[type='submit']:has-text('Save')",
      )
      .first();
    await btn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Wait for scroll to settle
    await btn.click({ force: true });
  }

  async clickReset() {
    await this.page.locator("button:has-text('Reset')").first().click();
  }

  /**
   * Cancels ALL Upcoming campaigns for the given project.
   * Navigates fresh after each cancel to reset the filter state.
   */
  async cancelAllUpcomingCampaigns(projectName) {
    await this.navigateToAdminAllocation();
    await this.filterCampaigns({ project: projectName, status: "Upcoming" });
    await this.clickRefresh();

    while (true) {
      const row = this.page
        .locator(".ant-table-tbody tr, tbody tr")
        .filter({ hasText: "Upcoming" })
        .first();
      const hasRow = await row.isVisible({ timeout: 3_000 }).catch(() => false);
      if (!hasRow) break;

      await row.locator("button:has-text('Cancel')").first().click();
      await this.page
        .locator(".ant-modal-content")
        .first()
        .waitFor({ state: "visible", timeout: 5_000 });
      const confirmBtn = this.page
        .locator(
          "button:has-text('Yes, Cancel'), .ant-modal-confirm-btns button.ant-btn-primary, .ant-modal-footer button.ant-btn-danger",
        )
        .first();
      await confirmBtn.waitFor({ state: "visible", timeout: 5_000 });
      await this.page.waitForTimeout(1000);
      await confirmBtn.click({ force: true });
      await this.page
        .locator(".ant-modal, .ant-modal-mask")
        .first()
        .waitFor({ state: "hidden", timeout: 8_000 })
        .catch(() => {});
      await this.page.waitForTimeout(1000);

      await this.navigateToAdminAllocation();
      await this.filterCampaigns({ project: projectName, status: "Upcoming" });
      await this.clickRefresh();
    }
  }

  /**
   * Stops ALL Active campaigns for the given project.
   * Navigates fresh after each stop to reset the filter state.
   */
  async stopAllActiveCampaigns(projectName) {
    await this.navigateToAdminAllocation();
    await this.filterCampaigns({ project: projectName, status: "Active" });
    await this.clickRefresh();

    while (true) {
      const row = this.page
        .locator(".ant-table-tbody tr, tbody tr")
        .filter({ hasText: "Active" })
        .first();
      const hasRow = await row.isVisible({ timeout: 3_000 }).catch(() => false);
      if (!hasRow) break;

      await row.locator("button:has-text('Stop')").first().click();
      await this.clickConfirmStop();
      await this.page.waitForTimeout(1000);

      await this.navigateToAdminAllocation();
      await this.filterCampaigns({ project: projectName, status: "Active" });
      await this.clickRefresh();
    }
  }

  /**
   * Creates a campaign with pre-condition cleanup and UAT error handling.
   * Handles 3 known UAT error scenarios before throwing:
   *   1. "Start time < 3 min" — retries with same times (caller should use +120 min buffer)
   *   2. "Upcoming campaign exists" — cancels it, retries
   *   3. "Active campaign running" — stops it, retries
   * @returns {string} success toast text
   */
  async createCampaignWithRetry({
    projectName,
    campaignName,
    startTime,
    endTime,
    description = "",
    maxRetries = 3,
  }) {
    // startTime / endTime can be a string OR a function () => string
    // Using a function causes fresh recomputation on every retry attempt (important for short buffers)
    const getStart =
      typeof startTime === "function" ? startTime : () => startTime;
    const getEnd = typeof endTime === "function" ? endTime : () => endTime;

    await this.cancelAllUpcomingCampaigns(projectName);
    await this.stopAllActiveCampaigns(projectName);
    await this.navigateToAdminAllocation();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await this.selectProject(projectName);
      await this.enterCampaignName(campaignName);
      await this.selectAllocationType("Static");
      await this.setStartTime(getStart());
      await this.setEndTime(getEnd());
      if (description) await this.enterDescription(description);
      await this.clickSaveCampaign();

      const result = await Promise.race([
        this.waitForSuccessToast(8_000)
          .then((t) => ({ type: "success", text: t }))
          .catch(() => null),
        this.getErrorBannerText()
          .then((t) => ({ type: "error", text: t }))
          .catch(() => null),
      ]);

      if (!result) {
        console.log(
          `[createCampaignWithRetry] Attempt ${attempt}: no response detected, retrying...`,
        );
        await this.navigateToAdminAllocation();
        continue;
      }

      if (result.type === "success") {
        // Verify it's a real success, not an error toast caught by the generic selector
        if (/created successfully|saved|success/i.test(result.text)) {
          return result.text;
        }
        // Treat as error if text looks like an error message
        result.type = "error";
      }

      const errLower = result.text.toLowerCase();
      console.log(
        `[createCampaignWithRetry] Attempt ${attempt} error: ${result.text}`,
      );

      if (/3 min|3 minutes/i.test(errLower)) {
        console.log(
          "[createCampaignWithRetry] Start time < 3 min — navigating and retrying",
        );
        await this.navigateToAdminAllocation();
      } else if (/upcoming/i.test(errLower)) {
        console.log(
          "[createCampaignWithRetry] Upcoming campaign blocking — cancelling all",
        );
        await this.cancelAllUpcomingCampaigns(projectName);
        await this.navigateToAdminAllocation();
      } else if (/active/i.test(errLower)) {
        console.log(
          "[createCampaignWithRetry] Active campaign blocking — stopping all",
        );
        await this.stopAllActiveCampaigns(projectName);
        await this.navigateToAdminAllocation();
      } else {
        throw new Error(
          `[createCampaignWithRetry] Unhandled error on attempt ${attempt}: ${result.text}`,
        );
      }
    }

    throw new Error(
      `[createCampaignWithRetry] Campaign not created after ${maxRetries} attempts`,
    );
  }

  // ─── ADMIN — Campaign List ────────────────────────────────────────────────────

  _getCampaignRow(campaignName) {
    return this.page
      .locator(".ant-table-tbody tr, tbody tr")
      .filter({ hasText: campaignName })
      .first();
  }

  async getCampaignStatus(campaignName) {
    const row = this._getCampaignRow(campaignName);
    await row.waitFor({ state: "visible", timeout: 10_000 });
    return (await row.locator("td").nth(4).textContent())?.trim() ?? "";
  }

  async isCampaignVisible(campaignName) {
    return await this._getCampaignRow(campaignName)
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
  }

  async clickViewCampaign(campaignName) {
    await this._getCampaignRow(campaignName)
      .locator("button:has-text('View'), a:has-text('View')")
      .first()
      .click();
  }

  async clickStopCampaign(campaignName) {
    await this._getCampaignRow(campaignName)
      .locator("button:has-text('Stop')")
      .click();
    await this.clickConfirmStop();
  }

  async clickCancelCampaign(campaignName) {
    await this._getCampaignRow(campaignName)
      .locator("button:has-text('Cancel')")
      .click();
    await this.clickConfirmStop(); // Re-using for Cancel as it also has 'Yes, Stop Now' or similar red button
  }

  async getStopPopupTitle() {
    // Wait for the modal outer container (not inner children — Ant Design animation keeps them hidden during fade-in)
    await this.page
      .locator(".ant-modal-content")
      .first()
      .waitFor({ state: "visible", timeout: 8_000 });
    const title = this.page
      .locator(".ant-modal-confirm-title, .ant-modal-title")
      .first();
    await title.waitFor({ state: "attached", timeout: 5_000 });
    return (await title.textContent())?.trim() ?? "";
  }

  async getStopPopupMessage() {
    await this.page
      .locator(".ant-modal-content")
      .first()
      .waitFor({ state: "visible", timeout: 8_000 });
    const msg = this.page
      .locator(".ant-modal-confirm-content, .ant-modal-body")
      .first();
    await msg.waitFor({ state: "attached", timeout: 5_000 });
    return (await msg.textContent())?.trim() ?? "";
  }

  async isStopPopupButtonVisible(buttonText) {
    await this.page
      .locator(".ant-modal-content")
      .first()
      .waitFor({ state: "visible", timeout: 5_000 })
      .catch(() => {});
    return await this.page
      .locator(
        `.ant-modal-confirm-btns button:has-text("${buttonText}"), .ant-modal button:has-text("${buttonText}")`,
      )
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  /**
   * Aggressively clicks 'Yes, Stop Now' and waits for modal to hide.
   * Handles cases where standard clicks are intercepted by Ant Design overlays.
   */
  async clickConfirmStop() {
    const btn = this.page
      .locator(
        "button:has-text('Yes, Stop Now'), .ant-modal-confirm-btns button.ant-btn-primary, .ant-modal-footer button.ant-btn-danger",
      )
      .first();
    await btn.waitFor({ state: "visible", timeout: 5000 });

    // Ant Design modals often have a "fade-in" period where clicks aren't registered
    await this.page.waitForTimeout(1500);

    // Attempt 1: Standard click
    await btn.click({ force: true });

    // Performance check: if modal still exists, try more aggressive methods
    const modal = this.page.locator(".ant-modal, .ant-modal-mask").first();
    const isStillVisible = await modal
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isStillVisible) {
      console.log(
        "[AllocationPage] Modal still visible after click, trying dispatchEvent and Enter...",
      );
      await btn.dispatchEvent("click").catch(() => {});
      await this.page.keyboard.press("Enter");
    }

    // Wait for the modal to fully disappear
    await modal.waitFor({ state: "hidden", timeout: 8000 }).catch(() => {
      console.error(
        "[AllocationPage] Modal failed to disappear after aggressive clicks.",
      );
    });

    await this.page.waitForTimeout(1000); // UI settle time
  }

  // ─── ADMIN — Filters ─────────────────────────────────────────────────────────

  async filterCampaigns({
    project = null,
    status = null,
    type = null,
    search = null,
  } = {}) {
    const _pickOption = async (nthIndex, optionText) => {
      const dropdown = this.page.locator(".ant-select").nth(nthIndex);
      await dropdown.click();
      // Wait for the options panel to open before clicking
      await this.page
        .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
        .first()
        .waitFor({ state: "visible", timeout: 3_000 });
      await this.page.waitForTimeout(300);
      await this.page
        .locator(
          ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
        )
        .filter({ hasText: optionText })
        .first()
        .click({ force: true });
    };

    if (project) await _pickOption(2, project);
    if (status) await _pickOption(3, status);
    if (type) await _pickOption(4, type);
    if (search) {
      const input = this.page
        .locator(
          "input[placeholder*='Search' i][type='text'], input[placeholder*='campaign' i]",
        )
        .first();
      await input.clear();
      await input.fill(search);
    }
  }

  async clickRefresh() {
    await this.page
      .locator("button:has-text('Refresh'), button[title='Refresh']")
      .first()
      .click();
    await this.waitForNetworkIdle();
  }

  async getStatusFilterOptions(projectName = "Xanadu Test Project") {
    // Status filter is disabled until a Project is selected in the filter section
    await this.filterCampaigns({ project: projectName });
    await this.page.waitForTimeout(300);

    const dropdown = this.page.locator(".ant-select").nth(3);
    await dropdown.locator(".ant-select-selector").click({ force: true });
    await this.page.waitForTimeout(300);
    await this.page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .waitFor({ state: "visible", timeout: 5_000 });

    const options = this.page.locator(
      ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
    );
    const count = await options.count();
    const texts = [];
    for (let i = 0; i < count; i++) {
      texts.push((await options.nth(i).textContent())?.trim() ?? "");
    }
    await this.page.keyboard.press("Escape");
    return texts;
  }

  async getTotalCampaignsCount() {
    const el = this.page
      .locator('.ant-pagination-total-text, [class*="total"]')
      .first();
    return (await el.textContent())?.trim() ?? "";
  }

  async isPageSizeSelectorVisible() {
    return await this.page
      .locator('.ant-pagination-options .ant-select, [class*="page-size"]')
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
  }

  // ─── CUSTOMER — Login ─────────────────────────────────────────────────────────

  async navigateToCustomerPortal() {
    await this.page.goto(CUSTOMER_URL, { waitUntil: "domcontentloaded" });
    await this.waitForNetworkIdle();
  }

  /** Close any promotional popup modal (appears on home/registration pages). */
  async dismissPopup() {
    const closeBtn = this.page.locator(
      '.ant-modal-close, .ant-modal-wrap button[aria-label="Close"], .ant-modal-wrap .close-btn, .ant-modal-wrap svg[data-icon="close"]'
    ).first();
    const visible = await closeBtn
      .waitFor({ state: "visible", timeout: 4_000 })
      .then(() => true)
      .catch(() => false);
    if (visible) {
      await closeBtn.click({ force: true });
      await this.page.locator('.ant-modal-wrap').first()
        .waitFor({ state: "hidden", timeout: 5_000 }).catch(() => {});
    }
  }

  async selectNationality(nationality = "Indian National") {
    const tab = this.page
      .locator(
        `button:has-text('${nationality}'), .tab:has-text('${nationality}'), [role='tab']:has-text('${nationality}')`,
      )
      .first();
    if (await tab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await tab.click();
    }
  }

  async enterMobile(number) {
    const input = this.page
      .locator(
        "input[placeholder*='Mobile Number' i], input[placeholder*='mobile' i], input[type='tel']",
      )
      .first();
    await input.clear();
    await input.fill(String(number));
  }

  async clickSendOTP() {
    await this.page
      .locator("button:has-text('Send OTP'), button:has-text('Get OTP')")
      .first()
      .click();
  }

  async enterOTP(otp) {
    const digits = String(otp).split("");
    // Wait for OTP page to fully load (slowMo makes page transitions slow)
    await this.page.locator('h2:has-text("Enter OTP"), text=Enter OTP').first()
      .waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    // Check for split OTP inputs (6 separate digit fields) using waitFor
    const firstDigitInput = this.page.getByRole("textbox", { name: "OTP Input 1" });
    const hasSplitInputs = await firstDigitInput.waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true).catch(() => false);

    if (hasSplitInputs) {
      await firstDigitInput.click();
      await this.page.keyboard.type(digits.join(""), { delay: 100 });
    } else {
      const input = this.page.locator(
        "input[placeholder*='OTP' i], input[placeholder*='otp' i], input[maxlength='6']",
      ).first();
      await input.clear();
      await input.fill(String(otp));
    }
  }

  async clickVerifyOTP() {
    await this.page
      .locator(
        "button:has-text('Verify OTP'), button:has-text('Verify'), button:has-text('Login'), button:has-text('Submit')",
      )
      .first()
      .click();
    await this.waitForNetworkIdle();
  }

  async getOTPError() {
    const err = this.page
      .locator(
        ".error-message, .otp-error, p:has-text('Invalid OTP'), p:has-text('incorrect'), [class*='error']",
      )
      .first();
    await err.waitFor({ state: "visible", timeout: 6_000 });
    return (await err.textContent()) ?? "";
  }

  async getWelcomeMessage() {
    const el = this.page
      .locator("h1:has-text('Welcome'), .welcome-text, [class*='welcome']")
      .first();
    await el.waitFor({ state: "visible", timeout: 8_000 });
    return (await el.textContent())?.trim() ?? "";
  }

  async isApplicantLoginPanelVisible() {
    try {
      await this.page
        .locator(
          [
            'h2:has-text("APPLICANT LOGIN")',
            'h2:has-text("Applicant Login")',
            ".login-right",
            '[class*="login-panel"]',
            '[class*="login-container"]',
            '[class*="login-box"]',
            'form:has(button:has-text("Send OTP"))',
            '.ant-card:has(input[type="tel"])',
            '[class*="applicant"]',
          ].join(", "),
        )
        .first()
        .waitFor({ state: "visible", timeout: 8_000 });
      return true;
    } catch {
      return false;
    }
  }

  async areNationalityTabsPresent() {
    const indian = await this.page
      .locator(
        "button:has-text('Indian National'), [role='tab']:has-text('Indian National')",
      )
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    const nri = await this.page
      .locator("button:has-text('NRI'), [role='tab']:has-text('NRI')")
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    return indian && nri;
  }

  // ─── CUSTOMER — Left Navigation ───────────────────────────────────────────────

  async clickLeftMenuAllotment() {
    const link = this.page.locator("a:has-text('Allotment'), a:has-text('Allotted')").first();
    await link.click({ force: true });
    await this.page.waitForURL(/allot/i, { timeout: 10_000 }).catch(() => {});
    await this.waitForNetworkIdle();
  }

  async clickLeftMenuHome() {
    await this.page
      .locator("nav a:has-text('Home'), .nav-item:has-text('Home')")
      .first()
      .click();
    await this.waitForNetworkIdle();
  }

  // ─── CUSTOMER — Home Dashboard ────────────────────────────────────────────────

  async getRegistrationStatus(regNumber) {
    console.log(`[getRegistrationStatus] Looking for row: ${regNumber}`);
    const row = this.page
      .locator("table tbody tr, .registration-table tbody tr")
      .filter({ hasText: regNumber })
      .first();
    await row.waitFor({ state: "attached", timeout: 30_000 });
    const text = (await row.locator("td:nth-child(4)").first().textContent())?.trim() ?? "";
    console.log(`[getRegistrationStatus] Found status: ${text}`);
    return text;
  }

  async getAvailableRegistration() {
    // Find any registration row with "Proceed to Confirm" button and extract reg number
    const rows = await this.page
      .locator("table tbody tr, .registration-table tbody tr")
      .filter({ hasText: "Proceed to Confirm" })
      .all();
    for (const row of rows) {
      const text = await row.textContent();
      const match = text.match(/GHNG-[\w-]+/);
      if (match) return match[0];
    }
    return null;
  }

  async clickBookNowCard() {
    // On the allotment page (/alloted), click the first "Book Now" card on the left panel
    // and return the registration number
    const card = this.page.locator("li:has-text('Book Now')").first();
    await card.waitFor({ state: "visible", timeout: 8_000 });
    const text = await card.textContent();
    const match = text.match(/GHNG-[\w-]+/);
    await card.click();
    await this.page.waitForTimeout(1500);
    return match ? match[0] : null;
  }

  async clickSelectUnitBtn() {
    const btn = this.page.locator("button:has-text('Select Unit')").first();
    await btn.waitFor({ state: "visible", timeout: 8_000 });
    await btn.click();
    await this.page
      .waitForURL(/unitselection/i, { timeout: 10_000 })
      .catch(() => {});
    await this.waitForNetworkIdle();
  }

  async clickProceedToConfirm(regNumber = null) {
    const btn = regNumber
      ? this.page
          .locator("table tbody tr, .registration-table tbody tr")
          .filter({ hasText: regNumber })
          .first()
          .locator("button:has-text('Proceed to Confirm'), a:has-text('Proceed to Confirm')")
          .first()
      : this.page
          .locator("button:has-text('Proceed to Confirm'), a:has-text('Proceed to Confirm')")
          .first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click({ force: true });
    // Wait for navigation away from /home
    await this.page.waitForURL(/allot/i, { timeout: 15_000 }).catch(() => {});
    await this.waitForNetworkIdle();
  }

  async getAllotmentTimerText() {
    const timer = this.page
      .locator(
        '.allotment-timer, .closing-timer, [class*="countdown"], [class*="closing"]',
      )
      .first();
    return (await timer.textContent())?.trim() ?? "";
  }

  async isAllotmentTimerVisible() {
    return await this.page
      .locator(
        '.allotment-timer, .closing-timer, [class*="countdown"], [class*="closing"]',
      )
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
  }

  async isAddUnitsBtnVisible() {
    return await this.page
      .locator("button:has-text('Add Units'), a:has-text('Add Units')")
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
  }

  async getProcessStatus(regNumber) {
    const row = this.page
      .locator("table tbody tr, .registration-table tbody tr")
      .filter({ hasText: regNumber })
      .first();
    return (
      (await row.locator("td:nth-child(5)").first().textContent())?.trim() ?? ""
    );
  }

  async getAllottedUnit(regNumber) {
    const row = this.page
      .locator("table tbody tr, .registration-table tbody tr")
      .filter({ hasText: regNumber })
      .first();
    return (await row.locator("td:nth-child(3)").textContent())?.trim() ?? "";
  }

  async isCompleteKYCAlertVisible(regNumber) {
    const row = this.page
      .locator("table tbody tr, .registration-table tbody tr")
      .filter({ hasText: regNumber })
      .first();
    return await row
      .locator("button:has-text('Complete KYC'), [class*='complete-kyc']")
      .first()
      .isVisible({ timeout: 4_000 })
      .catch(() => false);
  }

  async isKYCCompletedVisible(regNumber) {
    const row = this.page
      .locator("table tbody tr, .registration-table tbody tr")
      .filter({ hasText: regNumber })
      .first();
    await row.waitFor({ state: "attached", timeout: 30_000 });
    return await row
      .locator(':has-text("KYC Completed")')
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async isPayBtnVisible(regNumber) {
    const row = this.page
      .locator("table tbody tr, .registration-table tbody tr")
      .filter({ hasText: regNumber })
      .first();
    await row.waitFor({ state: "attached", timeout: 30_000 });
    return await row
      .locator("button:has-text('Pay'), a:has-text('Pay')")
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async clickPayScheduleBtn(regNumber) {
    const row = this.page
      .locator("table tbody tr, .registration-table tbody tr")
      .filter({ hasText: regNumber })
      .first();
    await row.locator("button:has-text('Pay'), a:has-text('Pay')").first().click();
    await this.waitForNetworkIdle();
  }

  // ─── CUSTOMER — Allotment Page ────────────────────────────────────────────────

  async getCongratsMessage() {
    const el = this.page
      .locator(
        "h2:has-text('Congratulations'), h4:has-text('Congratulations'), h5:has-text('Congratulations'), [class*='congrats'], p:has-text('Eligible to Select')",
      )
      .first();
    await el.waitFor({ state: "visible", timeout: 8_000 });
    return (await el.textContent())?.trim() ?? "";
  }

  async clickBookNow(regNumber = null) {
    if (regNumber) {
      // Navigate directly to unit selection for this registration
      await this.page.goto(
        `https://uat.xrportal.in/unitselection?rNum=${regNumber}`,
        { waitUntil: "domcontentloaded" },
      );
    } else {
      // Click first "Book Now" card
      await this.page.locator('li:has-text("Book Now")').first().click();
      await this.page.waitForURL(/unitselection/i, { timeout: 15_000 }).catch(() => {});
    }
    await this.waitForNetworkIdle();
  }

  async clickSelectUnit() {
    await this.page
      .locator(
        "button:has-text('Select Unit'), button:has-text('Select Unit >')",
      )
      .first()
      .click();
    await this.waitForNetworkIdle();
  }

  async clickChangeUnit() {
    await this.page
      .locator("a:has-text('Change Unit'), button:has-text('Change Unit')")
      .first()
      .click();
    await this.page
      .waitForURL(/unitselection/i, { timeout: 15_000 })
      .catch(() => {});
    await this.waitForNetworkIdle();
  }

  _getTNCCheckbox() {
    return this.page
      .locator(
        "input[type='checkbox'][id*='terms'], input[type='checkbox'][id*='tnc'], .terms-checkbox input, .ant-checkbox-input, input[type='checkbox']",
      )
      .first();
  }

  async acceptTermsAndConditions() {
    const cb = this._getTNCCheckbox();
    await cb.waitFor({ state: "attached", timeout: 8_000 });
    if (!(await cb.isChecked())) {
      // Try clicking the label/wrapper first (Ant Design pattern)
      const label = this.page
        .locator("label:has-text('Terms'), label:has-text('T&C'), label:has-text('I agree'), .ant-checkbox-wrapper")
        .first();
      const labelVisible = await label
        .waitFor({ state: "visible", timeout: 3_000 })
        .then(() => true)
        .catch(() => false);
      if (labelVisible) {
        await label.click();
      } else {
        await cb.check({ force: true });
      }
    }
  }

  async uncheckTermsAndConditions() {
    const cb = this._getTNCCheckbox();
    if (await cb.isChecked()) await cb.uncheck({ force: true });
  }

  async isTNCChecked() {
    const cb = this._getTNCCheckbox();
    const attached = await cb
      .waitFor({ state: "attached", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (!attached) return false;
    return await cb.isChecked();
  }

  async isPayButtonEnabled() {
    const btn = this.page
      .locator(
        "button:has-text('Confirmation Amount Pay'), button:has-text('Pay Rs'), button:has-text('Pay'), button:has-text('27,000')",
      )
      .first();
    const attached = await btn
      .waitFor({ state: "attached", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (!attached) return false;
    return await btn.isEnabled();
  }

  async clickPayConfirmationAmount() {
    const btn = this.page
      .locator(
        "button:has-text('Confirmation Amount'), button:has-text('Pay ₹'), button:has-text('Pay Rs'), button:has-text('27,000')",
      )
      .first();
    await btn.waitFor({ state: "visible", timeout: 8_000 });
    await btn.click();
    await this.page.waitForTimeout(3000);
    await this.waitForNetworkIdle();
  }

  async getConfirmationTimerText() {
    const timer = this.page
      .locator(
        '.confirmation-timer, .window-timer, [class*="confirm"][class*="timer"]',
      )
      .first();
    return (await timer.textContent())?.trim() ?? "";
  }

  async isConfirmationTimerVisible() {
    return await this.page
      .locator(
        ':has-text("Confirmation window will close in"), :has-text("will close in"), .confirmation-timer, .window-timer',
      )
      .first()
      .waitFor({ state: "visible", timeout: 8_000 })
      .then(() => true)
      .catch(() => false);
  }

  async getClosedMessage() {
    const el = this.page
      .locator(
        "p:has-text('Allocation window is closed'), [class*='closed-msg'], .center-panel p",
      )
      .first();
    await el.waitFor({ state: "visible", timeout: 8_000 });
    return (await el.textContent())?.trim() ?? "";
  }

  async getCenterPanelUnitName() {
    const el = this.page.locator(".remove-unit-box-content").first();
    await el.waitFor({ state: "visible", timeout: 8_000 });
    return (await el.textContent())?.trim() ?? "";
  }

  async isSelectUnitBtnVisible() {
    return await this.page
      .locator(
        "button:has-text('Select Unit'), button:has-text('Select Unit >')",
      )
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
  }

  async isBookNowVisible() {
    return await this.page
      .locator("button:has-text('Book Now')")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
  }

  async isChangeUnitLinkVisible() {
    return await this.page
      .locator("a:has-text('Change Unit'), button:has-text('Change Unit')")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
  }

  async clickFloorUnitPlan() {
    await this.page
      .locator(
        "button:has-text('Floor & Unit Plan'), a:has-text('Floor & Unit Plan')",
      )
      .first()
      .click();
  }

  async clickCostSheet() {
    await this.page
      .locator("button:has-text('Cost Sheet'), a:has-text('Cost Sheet')")
      .first()
      .click();
  }

  async clickPaymentSchedule() {
    await this.page
      .locator(
        "button:has-text('Payment Schedule'), a:has-text('Payment Schedule')",
      )
      .first()
      .click();
  }

  // ─── CUSTOMER — Unit Selection ────────────────────────────────────────────────

  async selectTower(towerName) {
    await this.page
      .locator(
        `li:has-text('${towerName}'), .tower-btn:has-text('${towerName}'), button:has-text('${towerName}')`,
      )
      .first()
      .click();
    await this.page.waitForTimeout(800);
  }

  async selectUnit(unitNumber) {
    // Unit cells have classes like .available-unit, .booked-unit
    // Target the available-unit element with the unit number text
    const unit = this.page.locator(`.available-unit:has-text("${unitNumber}")`).first();
    const available = await unit
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (available) {
      await unit.scrollIntoViewIfNeeded();
      await unit.click();
    } else {
      // Unit not available — pick the first available unit instead
      console.log(`[selectUnit] Unit ${unitNumber} not available, selecting first available`);
      const firstAvailable = this.page.locator(".available-unit").first();
      await firstAvailable.waitFor({ state: "visible", timeout: 10_000 });
      await firstAvailable.scrollIntoViewIfNeeded();
      await firstAvailable.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async getUnitDetails() {
    // Unit details panel uses sequential paragraphs: label, value, label, value...
    await this.page.locator('p:has-text("New Unit Details")').first()
      .waitFor({ state: "visible", timeout: 8_000 });
    const allP = await this.page.locator("p").allTextContents();
    const getAfterLabel = (label) => {
      const idx = allP.findIndex((t) => t.includes(label));
      return idx >= 0 && idx + 1 < allP.length ? allP[idx + 1].trim() : "";
    };
    // "Your total discount" is in a text node, not a paragraph
    const discountText = await this.page
      .locator(':has-text("total discount")')
      .last()
      .textContent()
      .catch(() => "");
    return {
      unitNo: getAfterLabel("Unit No"),
      bhk: getAfterLabel("BHK"),
      size: getAfterLabel("Size"),
      agreementValue: getAfterLabel("Agreement Value"),
      homeLoanDiscount: getAfterLabel("Home Loan"),
      earlyBirdDiscount: getAfterLabel("Early Bird"),
      allInclusivePrice: getAfterLabel("All inclusive") || getAfterLabel("*All inclusive"),
      totalDiscountBadge: discountText?.trim() ?? "",
    };
  }

  async clickAddUnit() {
    // Debug: screenshot if Add button not immediately found
    const addBtn = this.page.locator("button:has-text('Add')").first();
    const found = await addBtn
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (!found) {
      await this.page.screenshot({ path: "test-results/debug-clickAddUnit.png", fullPage: true });
      console.log("[clickAddUnit] Add button not found, URL:", this.page.url());
      const btns = await this.page.locator("button").allTextContents();
      console.log("[clickAddUnit] Buttons:", btns.filter(t => t.trim()).map(t => t.trim().substring(0, 50)));
    }
    await addBtn.click();
    await this.page
      .waitForURL(/allot/i, { timeout: 15_000 })
      .catch(() => {});
    await this.waitForNetworkIdle();
  }

  async clickCancelUnit() {
    await this.page.locator("button:has-text('Cancel')").first().click();
  }

  async isUnitDetailsPanelVisible() {
    return await this.page
      .locator('p:has-text("New Unit Details"), :has-text("New Unit Details")')
      .first()
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
  }

  async isUnitSold(unitNumber) {
    const cell = this.page
      .locator(
        `.unit-cell:has-text('${unitNumber}'), .unit:has-text('${unitNumber}')`,
      )
      .first();
    const cls = (await cell.getAttribute("class")) ?? "";
    const style = (await cell.getAttribute("style")) ?? "";
    return cls.includes("sold") || style.includes("red");
  }

  // ─── CUSTOMER — Payment ───────────────────────────────────────────────────────

  async isGatewayVisible() {
    return await this.page
      .locator(
        "iframe[src*='easebuzz'], iframe[src*='payment'], .easebuzz-popup, [class*='gateway'], [class*='payment-popup'], .ant-modal:has-text('Pay')",
      )
      .first()
      .waitFor({ state: "visible", timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
  }

  async closeGateway() {
    // Gateway is an Easebuzz iframe — try closing from within the iframe first
    const iframe = this.page.frameLocator("iframe[src*='easebuzz'], iframe[src*='payment']").first();
    const iframeClose = iframe.locator(
      "button:has-text('Cancel'), button:has-text('Close'), [aria-label='Close'], .close-btn, a:has-text('Cancel')",
    ).first();
    const iframeCloseVisible = await iframeClose
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (iframeCloseVisible) {
      await iframeClose.click();
    } else {
      // Try clicking outside the iframe to close the overlay
      await this.page.mouse.click(10, 10);
      await this.page.waitForTimeout(1000);
      // If still open, try Escape key
      await this.page.keyboard.press("Escape");
    }
    await this.page.waitForTimeout(2000);
    // Wait for iframe to disappear
    await this.page
      .locator("iframe[src*='easebuzz'], iframe[src*='payment']")
      .first()
      .waitFor({ state: "hidden", timeout: 10_000 })
      .catch(() => {});
    await this.waitForNetworkIdle();
  }

  async completeEasebuzzPayment() {
    console.log("[completeEasebuzzPayment] Starting Easebuzz flow...");
    const iframeLoc = "iframe[src*='easebuzz'], iframe[src*='payment'], .ant-modal-content iframe, .ant-drawer-content iframe";
    const iframe = this.page.frameLocator(iframeLoc).first();
    
    console.log("[completeEasebuzzPayment] Waiting for 'Select Payment Method' overlay (up to 60s)...");
    await iframe.locator("text=Select Payment Method").waitFor({ state: "visible", timeout: 60_000 });
 
    console.log("[completeEasebuzzPayment] Clicking 'Wallets'...");
    await iframe.locator("text=Wallets, .list-item:has-text('Wallets')").first().click();
    await this.page.waitForTimeout(2000);
 
    console.log("[completeEasebuzzPayment] Clicking 'Easebuzz Wallet'...");
    await iframe.locator("text=Easebuzz Wallet, .list-item:has-text('Easebuzz Wallet')").first().click();
    await this.page.waitForTimeout(1000);
 
    console.log("[completeEasebuzzPayment] Clicking final 'Pay' button...");
    const popupPromise = this.page.context().waitForEvent("page", { timeout: 60_000 });
    await iframe.locator("button:has-text('Pay'), .pay-btn").filter({ visible: true }).first().click();
 
    const popup = await popupPromise;
    console.log("[completeEasebuzzPayment] Test bank popup opened");
    await popup.waitForLoadState("load");
    await popup.waitForTimeout(5000);
 
    console.log("[completeEasebuzzPayment] Generating OTP...");
    await popup.locator("button:has-text('Generate OTP'), input[value='Generate OTP']").first().click();
    await popup.waitForTimeout(3000);
 
    const otpText = await popup.locator("body").textContent();
    const otpMatch = otpText.match(/(\d{4})/);
    if (!otpMatch) throw new Error("Could not find 4-digit OTP on test bank page");
    const otp = otpMatch[1];
    console.log("[completeEasebuzzPayment] OTP Found:", otp);
 
    console.log("[completeEasebuzzPayment] Entering OTP...");
    const otpInputs = popup.locator("input.otp-input, input[maxlength='1'], input[type='text'], input[type='tel']");
    if (await otpInputs.count() >= 4) {
      for (let i = 0; i < 4; i++) {
        await otpInputs.nth(i).waitFor({ state: 'visible' });
        await otpInputs.nth(i).fill(otp[i]);
      }
    } else {
      await otpInputs.first().click();
      await popup.keyboard.type(otp, { delay: 100 });
    }
    await popup.waitForTimeout(2000);
 
    console.log("[completeEasebuzzPayment] Clicking 'Success'...");
    await popup.locator("button:has-text('Success'), input[value='Success']").first().click();
    
    console.log("[completeEasebuzzPayment] Waiting for redirect...");
    await this.page.waitForURL(/paymentschedule/, { timeout: 30_000 });
    await this.page.waitForTimeout(3000);
  }
  async getPaymentSuccessMessage() {
    const el = this.page
      .locator(
        "h1:has-text('Payment successful'), h2:has-text('Payment successful'), p:has-text('Payment successful')",
      )
      .first();
    await el.waitFor({ state: "visible", timeout: 10_000 });
    return (await el.textContent())?.trim() ?? "";
  }

  async getPaymentSuccessSubtext() {
    const el = this.page
      .locator("p:has-text('just one step away'), [class*='success-subtext']")
      .first();
    return (await el.textContent())?.trim() ?? "";
  }

  // ─── CUSTOMER — KYC ───────────────────────────────────────────────────────────

  async navigateToKYC() {
    // Navigate to allotment page and find a Booked registration with "Complete KYC"
    await this.page.goto("https://uat.xrportal.in/alloted", {
      waitUntil: "domcontentloaded",
    });
    await this.dismissPopup();
    await this.page.waitForTimeout(2000);

    // Iterate Booked cards to find one with "Complete KYC"
    const bookedCards = this.page.locator("li:has-text('Booked')");
    const count = await bookedCards.count();
    if (count === 0) return false;

    for (let i = 0; i < count; i++) {
      await bookedCards.nth(i).click();
      await this.page.waitForTimeout(1500);

      const kycBtn = this.page
        .locator("button:has-text('Complete KYC'), a:has-text('Complete KYC')")
        .first();
      const hasKyc = await kycBtn
        .waitFor({ state: "visible", timeout: 3_000 })
        .then(() => true)
        .catch(() => false);

      if (hasKyc) {
        await kycBtn.click();
        await this.page
          .waitForURL(/kyc/i, { timeout: 10_000 })
          .catch(() => {});
        await this.waitForNetworkIdle();
        return true;
      }
    }
    return false;
  }

  async clickVerifyDetails(applicantName = null) {
    if (applicantName) {
      const row = this.page
        .locator("table tr, .applicants-list li")
        .filter({ hasText: applicantName })
        .first();
      await row
        .locator(
          "button:has-text('Verify Details'), a:has-text('Verify Details')",
        )
        .first()
        .click();
    } else {
      await this.page
        .locator(
          "button:has-text('Verify Details'), a:has-text('Verify Details')",
        )
        .first()
        .click();
    }
    await this.waitForNetworkIdle();
  }

  async clickAddApplicant() {
    await this.page
      .locator(
        "button:has-text('Add Applicant'), button:has-text('+ Add Applicant')",
      )
      .first()
      .click();
    await this.pause(500);
  }

  async fillApplicantForm({
    firstName,
    lastName,
    mobile,
    email,
    address,
    pincode,
    relationship,
    panNumber,
    aadhaarNumber,
    photoPath,
    panCardPath,
    aadhaarFrontPath,
    aadhaarBackPath,
  } = {}) {
    if (firstName) {
      const el = this.page
        .locator("input[name='firstName'], input[placeholder*='First Name' i]")
        .first();
      await el.clear();
      await el.fill(firstName);
    }
    if (lastName) {
      const el = this.page
        .locator("input[name='lastName'], input[placeholder*='Last Name' i]")
        .first();
      await el.clear();
      await el.fill(lastName);
    }
    if (mobile) {
      const el = this.page
        .locator("input[name='phone'], input[placeholder*='Mobile' i]")
        .first();
      await el.clear();
      await el.fill(String(mobile));
    }
    if (email) {
      const el = this.page
        .locator("input[name='email'], input[type='email']")
        .first();
      await el.clear();
      await el.fill(email);
    }
    if (pincode) {
      const el = this.page
        .locator("input[name='pincode'], input[placeholder*='Pincode' i]")
        .first();
      await el.clear();
      await el.fill(String(pincode));
    }
    if (address) {
      // Address is a textarea with name="address"
      const el = this.page
        .locator(
          "textarea[name='address'], textarea[placeholder*='Address' i], textarea",
        )
        .first();
      await el.clear();
      await el.fill(address);
    }
    if (relationship) {
      // Relationship is an Ant Design select dropdown
      const dropdown = this.page.locator(".ant-select").first();
      await dropdown.click();
      await this.page.waitForTimeout(500);
      await this.page
        .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option")
        .filter({ hasText: relationship })
        .first()
        .click({ force: true });
      await this.page.waitForTimeout(300);
    }
    if (panNumber) {
      const el = this.page
        .locator("input[name='panCard'], input[placeholder*='ABCDE' i]")
        .first();
      await el.clear();
      await el.fill(panNumber);
    }
    if (aadhaarNumber) {
      const el = this.page
        .locator("input[name='aadhaarCard'], input[placeholder*='1234 5678' i]")
        .first();
      await el.clear();
      await el.fill(aadhaarNumber);
    }
    // File uploads — 4 file inputs in order: photo, PAN, aadhaar front, aadhaar back
    const fileInputs = this.page.locator("input[type='file']");
    if (photoPath) await fileInputs.nth(0).setInputFiles(photoPath);
    if (panCardPath) await fileInputs.nth(1).setInputFiles(panCardPath);
    if (aadhaarFrontPath) await fileInputs.nth(2).setInputFiles(aadhaarFrontPath);
    if (aadhaarBackPath) await fileInputs.nth(3).setInputFiles(aadhaarBackPath);
    if (photoPath || panCardPath || aadhaarFrontPath || aadhaarBackPath) {
      await this.page.waitForTimeout(1000);
    }
  }

  async uploadDocument(uploadSelector, filePath) {
    const input = this.page.locator(uploadSelector).first();
    await input.setInputFiles(filePath);
    await this.pause(500);
  }

  async clickSubmitApplicant() {
    await this.page
      .locator("button:has-text('Submit'), button[type='submit']")
      .first()
      .click();
    await this.waitForNetworkIdle();
  }

  async getApplicantSavedToast() {
    const toast = this.page
      .locator(
        ".ant-message-notice:has-text('saved'), [class*='toast']:has-text('saved')",
      )
      .first();
    await toast.waitFor({ state: "visible", timeout: 8_000 });
    return (await toast.textContent())?.trim() ?? "";
  }

  async isMaxApplicantsLabelVisible() {
    return await this.page
      .locator("p:has-text('Max. 4 Applicants'), [class*='max-applicants']")
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
  }

  async isAddApplicantBtnEnabled() {
    return await this.page
      .locator(
        "button:has-text('Add Applicant'), button:has-text('+ Add Applicant')",
      )
      .first()
      .isEnabled()
      .catch(() => false);
  }

  async clickConfirmApplicants() {
    await this.page
      .locator("button:has-text('Confirm >'), button:has-text('Confirm')")
      .first()
      .click();
    await this.waitForNetworkIdle();
  }

  async acceptSummaryTNC() {
    const checkbox = this.page.locator("input[type='checkbox']").first();
    if (!(await checkbox.isChecked())) {
      // Click the label wrapper for Ant Design checkbox
      const label = this.page
        .locator("label:has-text('confirm'), .ant-checkbox-wrapper:has-text('confirm'), span:has-text('I confirm')")
        .first();
      const labelVisible = await label.waitFor({ state: "visible", timeout: 5_000 }).then(() => true).catch(() => false);
      if (labelVisible) {
        await label.click();
      } else {
        await checkbox.check({ force: true });
      }
      await this.page.waitForTimeout(500);
    }
  }

  async clickSummaryConfirm() {
    await this.page
      .locator("button:has-text('Confirm >'), button:has-text('Confirm')")
      .last()
      .click();
    await this.waitForNetworkIdle();
  }

  async getKYCSuccessProcessStatus() {
    const el = this.page
      .locator("[class*='kyc-result'], [class*='kyc-table']")
      .first();
    return (await el.textContent())?.trim() ?? "";
  }

  async isDownloadUnitDetailsVisible() {
    return await this.page
      .locator("a:has-text('Download your Unit Details')")
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async clickDownloadUnitDetails() {
    await this.page
      .locator("a:has-text('Download your Unit Details')")
      .first()
      .click();
  }

  // ─── CUSTOMER — Milestone Payments ────────────────────────────────────────────

  _getMilestoneRow(milestoneName) {
    return this.page
      .locator(".milestone-table tbody tr, table tbody tr")
      .filter({ hasText: milestoneName })
      .first();
  }

  async getMilestoneStatus(milestoneName) {
    const row = this._getMilestoneRow(milestoneName);
    return (
      (
        await row
          .locator('[class*="status"], td:nth-child(7)')
          .first()
          .textContent()
      )?.trim() ?? ""
    );
  }

  async clickMilestonePay(milestoneName) {
    await this._getMilestoneRow(milestoneName)
      .locator("button:has-text('Pay >'), button:has-text('Pay')")
      .first()
      .click();
    await this.pause(500);
  }

  async clickViewTransaction(milestoneName) {
    await this._getMilestoneRow(milestoneName)
      .locator("a:has-text('View'), button:has-text('View')")
      .first()
      .click();
    await this.pause(500);
  }

  async getPayPopupAmounts() {
    return {
      principal:
        (
          await this.page
            .locator('[class*="principal"], [class*="principal-amount"]')
            .first()
            .textContent()
        )?.trim() ?? "",
      gst:
        (
          await this.page.locator('[class*="gst"]').first().textContent()
        )?.trim() ?? "",
      outstanding:
        (
          await this.page
            .locator('[class*="outstanding"]')
            .first()
            .textContent()
        )?.trim() ?? "",
    };
  }

  async selectFullPayment() {
    await this.page
      .locator(
        "input[type='radio'][value*='full' i], label:has-text('Full Payment') input[type='radio']",
      )
      .first()
      .check();
  }

  async selectPartialPayment() {
    await this.page
      .locator(
        "input[type='radio'][value*='partial' i], label:has-text('Partial Payment') input[type='radio']",
      )
      .first()
      .check();
  }

  async enterPartialAmount(amount) {
    const input = this.page
      .locator("input[id*='partial'], input[placeholder*='amount' i]")
      .first();
    await input.clear();
    await input.fill(String(amount));
  }

  async clickPayInPopup() {
    console.log("[clickPayInPopup] Clicking 'Pay' button in the modal...");
    const btn = this.page.locator(".ant-modal-content button:has-text('Pay')").first();
    await btn.waitFor({ state: "visible", timeout: 8_000 });
    await btn.click({ force: true });
    await this.page.waitForTimeout(3000);
    await this.waitForNetworkIdle();
  }

  async isPaymentStatusPaid(milestoneName) {
    const status = await this.getMilestoneStatus(milestoneName);
    return status.toLowerCase().includes("paid");
  }
}

module.exports = { AllocationPage };
