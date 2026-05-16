'use strict';

const { BasePage } = require('../../automation-repository/base/BasePage');

class __MODULE__Page extends BasePage {
  constructor(page) {
    super(page);
    // Selectors from locators/<portal>/locator-map.json — __module__ section
    this.__element__ = page.locator('__selector__');
  }

  async navigate() {
    await this.page.goto('__url__');
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { __MODULE__Page };
