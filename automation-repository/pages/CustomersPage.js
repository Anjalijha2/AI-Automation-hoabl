const { expect } = require('@playwright/test');
const { BasePage } = require('../base/BasePage');
const { loadSelectors } = require('../utils/selectorHelpers');
const { pause } = require('../utils/playwrightHelpers');

class CustomersPage extends BasePage {
  constructor(page) {
    super(page);
    this.locators = loadSelectors('customers');

    this.greetingHeader = page.locator(this.locators.greetingHeader).first();
    // KPI cards: app uses custom components (no known CSS class).
    // getByRole matches by ARIA role regardless of HTML tag; XPath traversal gets the value sibling.
    this.registeredCard   = page.getByRole('heading', { name: 'Registered' }).locator('xpath=../following-sibling::*[1]').first();
    this.inactiveRegCard  = page.getByRole('heading', { name: 'Inactive Registrations' }).locator('xpath=../following-sibling::*[1]').first();
    this.cancelledRegCard = page.getByRole('heading', { name: 'Cancelled Registrations' }).locator('xpath=../following-sibling::*[1]').first();
    this.kycPendingCard   = page.getByRole('heading', { name: /KYC Pending/ }).locator('xpath=../following-sibling::*[1]').first();
    this.confirmedCard    = page.getByRole('heading', { name: /^Confirmed/ }).locator('xpath=../following-sibling::*[1]').first();
    this.activeTowersCard = page.getByRole('heading', { name: 'Active Towers' }).locator('xpath=../following-sibling::*[1]').first();

    this.searchInput = page.locator(this.locators.searchInput).first();
    this.filterBtn = page.locator(this.locators.filterBtn).first();
    this.resetFiltersBtn = page.locator(this.locators.resetFiltersBtn).first();
    this.refreshBtn = page.locator(this.locators.refreshBtn).first();
    this.downloadBtn = page.locator(this.locators.downloadBtn).first();
    this.dataTable = page.locator(this.locators.dataTable).first();

    this.filterIconAllocation = page.locator(this.locators.filterIconAllocation).first();
    this.filterIconProcess = page.locator(this.locators.filterIconProcess).first();
    this.filterIconHomeLoan = page.locator(this.locators.filterIconHomeLoan).first();

    this.filterOkBtn = page.locator(this.locators.filterOkBtn).first();
    this.filterResetBtn = page.locator(this.locators.filterResetBtn).first();

    this.searchBoxRegDetails = page.locator(this.locators.searchBoxRegDetails).first();
    this.searchBoxHVCode = page.locator(this.locators.searchBoxHVCode).first();
    this.searchBoxConfNum = page.locator(this.locators.searchBoxConfNum).first();
    this.searchBoxAllotedUnit = page.locator(this.locators.searchBoxAllotedUnit).first();

    this.modalConfirmRefund = page.locator(this.locators.modalConfirmRefund).first();
    this.btnCancelRegistration = page.locator(this.locators.btnCancelRegistration).first();
    this.modalHomeLoan = page.locator(this.locators.modalHomeLoan).first();
    this.toggleHomeLoan = page.locator(this.locators.toggleHomeLoan).first();
    this.btnSubmitHomeLoan = page.locator(this.locators.btnSubmitHomeLoan).first();

    this.pageSizeDropdown = page.locator(this.locators.pageSizeDropdown).first();
  }

  async navigate() {
    await this.page.goto('https://uat-web.xrportal.in/admin/customers', { waitUntil: 'domcontentloaded' });
    await expect(this.dataTable).toBeVisible({ timeout: 15_000 });
    await this.waitForNetworkIdle(); // ensures KPI card API data is loaded
  }

  async getKpiValue(cardLocator) {
    const text = await cardLocator.innerText();
    const numbers = text.match(/\d+/g);
    return numbers ? parseInt(numbers.join(''), 10) : 0;
  }

  async getTableRecordCount() {
    // App shows total as "X Registration Records" in an h3 heading — updates when filters are applied.
    const recordsHeading = this.page.locator('h3').filter({ hasText: /Registration Records/ }).first();
    if (await recordsHeading.isVisible({ timeout: 5_000 })) {
      const text = await recordsHeading.innerText();
      const match = text.match(/^(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    // Fallback: count visible rows
    await this.page.waitForTimeout(1000);
    return await this.page.locator('.ant-table-tbody > tr.ant-table-row').count();
  }

  // Clicks OK inside the currently-open Ant Design filter dropdown.
  async clickOpenFilterOkBtn() {
    await this.page.locator('.ant-dropdown:not(.ant-dropdown-hidden) button:has-text("OK")').click();
  }

  async applyAllocationFilter(statuses) {
    await this.filterIconAllocation.click();
    await pause(this.page, 500);
    for (const status of statuses) {
      await this.page.locator(`li.ant-dropdown-menu-item:has-text("${status}")`).click();
    }
    await this.clickOpenFilterOkBtn();
    await this.waitForNetworkIdle();
  }

  async applyProcessFilter(statuses) {
    await this.filterIconProcess.click();
    await pause(this.page, 500);
    for (const status of statuses) {
      await this.page.locator(`li.ant-dropdown-menu-item:has-text("${status}")`).click();
    }
    await this.clickOpenFilterOkBtn();
    await this.waitForNetworkIdle();
  }

  async applyHomeLoanFilter(option) {
    await this.filterIconHomeLoan.click();
    await pause(this.page, 500);
    await this.page.locator(`li.ant-dropdown-menu-item:has-text("${option}")`).click();
    await this.clickOpenFilterOkBtn();
    await this.waitForNetworkIdle();
  }

  async turnOnInlineFilters() {
    if (await this.filterBtn.isVisible()) {
      await this.filterBtn.click();
      await pause(this.page, 500);
    }
  }

  async resetAllFilters() {
    if (await this.resetFiltersBtn.isVisible()) {
      await this.resetFiltersBtn.click();
      await this.waitForNetworkIdle();
    }
  }

  async cancelRegistrationForRow(phone) {
    await this.searchInput.fill(phone);
    await this.page.keyboard.press('Enter');
    await this.waitForNetworkIdle();

    const row = this.page.locator('.ant-table-row').first();
    await row.locator(this.locators.actionDeleteIcon).click();

    await expect(this.modalConfirmRefund).toBeVisible();
    await this.btnCancelRegistration.click();
    await this.waitForNetworkIdle();
  }

  async approveHomeLoanForRow(phone) {
    await this.searchInput.fill(phone);
    await this.page.keyboard.press('Enter');
    await this.waitForNetworkIdle();

    const row = this.page.locator('.ant-table-row').first();
    await row.locator(this.locators.actionThreeDots).click();
    await this.page.locator(this.locators.menuItemHomeLoan).click();

    await expect(this.modalHomeLoan).toBeVisible();
    await this.toggleHomeLoan.click();
    await this.btnSubmitHomeLoan.click();
    await this.waitForNetworkIdle();
  }

  async changePageSize(size) {
    await this.pageSizeDropdown.click();
    await this.page.locator(`li:has-text("${size} / page")`).click();
    await this.waitForNetworkIdle();
  }

  // Smooth-scrolls so the pagination bar lands at the BOTTOM of the viewport.
  async scrollToPagination() {
    await this.page.evaluate(() => {
      const el = document.querySelector('ul.ant-pagination');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    await this.page.waitForTimeout(600);
  }

  async clickPageNumber(pageNum) {
    const item = this.page.locator(`li.ant-pagination-item-${pageNum}`);
    await item.scrollIntoViewIfNeeded();
    await item.click();
    await this.waitForNetworkIdle();
  }

  async navigateToLastPage() {
    const lastItem = this.page.locator('li.ant-pagination-item').last();
    await lastItem.scrollIntoViewIfNeeded();
    await lastItem.click();
    await this.waitForNetworkIdle();
  }

  async getVisibleRowCount() {
    return await this.page.locator('.ant-table-tbody > tr.ant-table-row').count();
  }
}

module.exports = { CustomersPage };
