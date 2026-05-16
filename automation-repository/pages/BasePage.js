// automation-repository/pages/BasePage.js
// All page objects extend this class for shared helpers.

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  // --- Navigation ---
  async goto(path = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // --- Interaction helpers ---
  async click(locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fill(locator, value) {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async selectOption(locator, value) {
    await locator.selectOption(value);
  }

  // --- Assertion helpers ---
  async expectVisible(locator) {
    await locator.waitFor({ state: 'visible' });
  }

  async expectText(locator) {
    await locator.waitFor({ state: 'visible' });
    return locator.textContent();
  }

  async expectURL(pattern) {
    await this.page.waitForURL(pattern);
  }

  // --- Toast / alert helpers ---
  async waitForSuccessToast(message) {
    await this.page
      .getByRole('alert')
      .filter({ hasText: message })
      .waitFor({ state: 'visible' });
  }

  // --- Screenshot ---
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }
}

module.exports = { BasePage };
