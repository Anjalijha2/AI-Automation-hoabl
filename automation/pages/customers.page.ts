import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { loadSelectors } from '../utils/selector-helper';
import { pause } from '../utils/playwright-helpers';

export class CustomersPage extends BasePage {
  readonly locators: Record<string, string>;

  // Elements
  readonly greetingHeader: Locator;
  readonly registeredCard: Locator;
  readonly inactiveRegCard: Locator;
  readonly cancelledRegCard: Locator;
  readonly kycPendingCard: Locator;
  readonly confirmedCard: Locator;
  readonly activeTowersCard: Locator;
  
  readonly searchInput: Locator;
  readonly filterBtn: Locator;
  readonly resetFiltersBtn: Locator;
  readonly refreshBtn: Locator;
  readonly downloadBtn: Locator;
  readonly dataTable: Locator;
  
  readonly filterIconAllocation: Locator;
  readonly filterIconProcess: Locator;
  readonly filterIconHomeLoan: Locator;
  readonly filterOkBtn: Locator;
  readonly filterResetBtn: Locator;

  readonly searchBoxRegDetails: Locator;
  readonly searchBoxHVCode: Locator;
  readonly searchBoxConfNum: Locator;
  readonly searchBoxAllotedUnit: Locator;

  readonly modalConfirmRefund: Locator;
  readonly btnCancelRegistration: Locator;
  readonly modalHomeLoan: Locator;
  readonly toggleHomeLoan: Locator;
  readonly btnSubmitHomeLoan: Locator;
  
  readonly pageSizeDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.locators = loadSelectors('customers');

    this.greetingHeader = page.locator(this.locators.greetingHeader).first();
    // KPI cards: app uses custom components (no known CSS class).
    // getByRole matches by ARIA role regardless of HTML tag; XPath traversal gets the value sibling.
    // Structure: card-div > [inner-div > heading("Label")] + value-element
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

  async navigate(): Promise<void> {
    await this.page.goto('https://uat-web.xrportal.in/admin/customers', { waitUntil: 'domcontentloaded' });
    await expect(this.dataTable).toBeVisible({ timeout: 15_000 });
    await this.waitForNetworkIdle(); // ensures KPI card API data is loaded
  }

  async getKpiValue(cardLocator: Locator): Promise<number> {
    const text = await cardLocator.innerText();
    const numbers = text.match(/\d+/g);
    return numbers ? parseInt(numbers.join(''), 10) : 0;
  }

  async getTableRecordCount(): Promise<number> {
    // App shows total as "X Registration Records" in an h3 heading — updates when filters are applied.
    // e.g. "8457 Registration Records" unfiltered, "54 Registration Records" after KYC-pending filter.
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
  // Using a fresh locator scoped to '.ant-dropdown:not(.ant-dropdown-hidden)' avoids
  // accidentally targeting a stale hidden OK button from a previously-closed dropdown.
  private async clickOpenFilterOkBtn(): Promise<void> {
    await this.page.locator('.ant-dropdown:not(.ant-dropdown-hidden) button:has-text("OK")').click();
  }

  async applyAllocationFilter(statuses: string[]): Promise<void> {
    await this.filterIconAllocation.click();
    await pause(this.page, 500);
    for (const status of statuses) {
      await this.page.locator(`li.ant-dropdown-menu-item:has-text("${status}")`).click();
    }
    await this.clickOpenFilterOkBtn();
    await this.waitForNetworkIdle();
  }

  async applyProcessFilter(statuses: string[]): Promise<void> {
    await this.filterIconProcess.click();
    await pause(this.page, 500);
    for (const status of statuses) {
      await this.page.locator(`li.ant-dropdown-menu-item:has-text("${status}")`).click();
    }
    await this.clickOpenFilterOkBtn();
    await this.waitForNetworkIdle();
  }

  async applyHomeLoanFilter(option: 'Yes' | 'No'): Promise<void> {
    await this.filterIconHomeLoan.click();
    await pause(this.page, 500);
    await this.page.locator(`li.ant-dropdown-menu-item:has-text("${option}")`).click();
    await this.clickOpenFilterOkBtn();
    await this.waitForNetworkIdle();
  }

  async turnOnInlineFilters(): Promise<void> {
    if (await this.filterBtn.isVisible()) {
      await this.filterBtn.click();
      await pause(this.page, 500);
    }
  }

  async resetAllFilters(): Promise<void> {
    if (await this.resetFiltersBtn.isVisible()) {
      await this.resetFiltersBtn.click();
      await this.waitForNetworkIdle();
    }
  }

  async cancelRegistrationForRow(phone: string): Promise<void> {
    await this.searchInput.fill(phone);
    await this.page.keyboard.press('Enter');
    await this.waitForNetworkIdle();

    // Click delete on the first matching row
    const row = this.page.locator('.ant-table-row').first();
    await row.locator(this.locators.actionDeleteIcon).click();
    
    // Modal Interaction
    await expect(this.modalConfirmRefund).toBeVisible();
    await this.btnCancelRegistration.click();
    await this.waitForNetworkIdle();
  }

  async approveHomeLoanForRow(phone: string): Promise<void> {
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

  async changePageSize(size: '10' | '20' | '50' | '100'): Promise<void> {
    await this.pageSizeDropdown.click();
    await this.page.locator(`li:has-text("${size} / page")`).click();
    await this.waitForNetworkIdle();
  }

  // Smooth-scrolls so the pagination bar lands at the BOTTOM of the viewport.
  // block:'end' keeps table rows visible above — matches the expected visual layout.
  // Uses browser-native smooth scroll so the motion is visible on screen during headed runs.
  // NOTE: viewport is configured at 900px (not 1080) so the layout content area fits
  // within the ~940px physical visible area. With 1080px, pagination scrolled to the
  // bottom of .ant-layout-content would land off-screen below the physical monitor edge.
  async scrollToPagination(): Promise<void> {
    await this.page.evaluate(() => {
      const el = document.querySelector('ul.ant-pagination');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    await this.page.waitForTimeout(600);
  }

  // Clicks a specific page number in the pagination bar.
  // Ant Design renders each page as: li.ant-pagination-item-N
  async clickPageNumber(pageNum: number): Promise<void> {
    const item = this.page.locator(`li.ant-pagination-item-${pageNum}`);
    await item.scrollIntoViewIfNeeded();
    await item.click();
    await this.waitForNetworkIdle();
  }

  // Navigates to the last page by clicking the last visible pagination item.
  // Ant Design always shows the last page number even with ellipsis for large datasets.
  async navigateToLastPage(): Promise<void> {
    const lastItem = this.page.locator('li.ant-pagination-item').last();
    await lastItem.scrollIntoViewIfNeeded();
    await lastItem.click();
    await this.waitForNetworkIdle();
  }

  // Returns the count of visible table rows on the current page.
  async getVisibleRowCount(): Promise<number> {
    return await this.page.locator('.ant-table-tbody > tr.ant-table-row').count();
  }
}
