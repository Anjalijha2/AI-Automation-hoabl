const { expect } = require('@playwright/test');
const { BasePage } = require('../base/BasePage');
const path = require('path');
const os = require('os');

class ConfigPage extends BasePage {

  constructor(page) {
    super(page);
    this.updateTowerConfigBtn = page.locator("button:has-text('Update Tower Configuration')").first();
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto('https://uat-web.xrportal.in/admin/cms', { waitUntil: 'domcontentloaded' });
    await expect(this.updateTowerConfigBtn).toBeVisible({ timeout: 15_000 });
    await this.waitForNetworkIdle();
  }

  // ─── Section helpers ─────────────────────────────────────────────────────────

  // Returns the section container element for a given H5 section heading.
  // Non-tower sections are NOT wrapped in .ant-card. Instead the H5 sits inside a
  // .data-content-header div. Walk up two levels to get the section container which
  // holds both the header and the content (buttons, inputs, selects).
  getSectionCard(sectionHeading) {
    return this.page.locator(
      `xpath=//h5[normalize-space()="${sectionHeading}"]/ancestor::*[contains(@class,"data-content-header")]/..`
    ).first();
  }

  async scrollToSection(sectionHeading) {
    await this.page.evaluate((heading) => {
      const h5s = Array.from(document.querySelectorAll('h5'));
      const el = h5s.find(h => h.textContent?.trim() === heading);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, sectionHeading);
    await this.page.waitForTimeout(600);
  }

  async waitForSuccessToast(timeout = 8_000) {
    const toast = this.page.locator('.ant-message-notice').first();
    await toast.waitFor({ state: 'visible', timeout });
    return (await toast.textContent()) ?? '';
  }

  // ─── Section 1: Tower Configuration ─────────────────────────────────────────

  // Locates the Tower Configuration section using pure DOM traversal via page.evaluate().
  // Playwright locator-based scoping fails because Ant Design nests the heading inside
  // ant-card-head and switches inside ant-card-body — they are NOT DOM siblings.
  async towerSwitchInfo() {
    return await this.page.evaluate(() => {
      const allHeadings = Array.from(
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')
      );
      const towerConfigHeading = allHeadings.find(
        el => el.textContent?.trim() === 'Tower Configuration'
      );
      if (!towerConfigHeading) return { checked: 0, firstInactiveIndex: -1 };

      let container = towerConfigHeading.parentElement;
      while (container && container !== document.body) {
        const sectionSwitches = container.querySelectorAll('.ant-switch');
        if (sectionSwitches.length > 0) {
          const checked = container.querySelectorAll('.ant-switch-checked').length;
          const allPageSwitches = Array.from(document.querySelectorAll('.ant-switch'));
          let firstInactiveIndex = -1;
          for (const sw of Array.from(sectionSwitches)) {
            if (!sw.classList.contains('ant-switch-checked')) {
              firstInactiveIndex = allPageSwitches.indexOf(sw);
              break;
            }
          }
          return { checked, firstInactiveIndex };
        }
        container = container.parentElement;
      }
      return { checked: 0, firstInactiveIndex: -1 };
    });
  }

  async getActiveTowerCount() {
    const { checked } = await this.towerSwitchInfo();
    return checked;
  }

  async activateFirstInactiveTower() {
    const { firstInactiveIndex } = await this.towerSwitchInfo();
    if (firstInactiveIndex < 0) {
      throw new Error('ConfigPage.activateFirstInactiveTower: no inactive tower toggle found');
    }
    await this.page.locator('.ant-switch').nth(firstInactiveIndex).click();
    await this.page.waitForTimeout(300);
    return firstInactiveIndex;
  }

  async deactivateTowerAtIndex(switchIndex) {
    await this.page.locator('.ant-switch').nth(switchIndex).click();
    await this.page.waitForTimeout(300);
  }

  async getTowerToggleInfo(towerCardHeading) {
    return await this.page.evaluate((heading) => {
      const allH5s = Array.from(document.querySelectorAll('h5'));
      const towerH5 = allH5s.find(h => h.textContent?.trim() === heading);
      if (!towerH5) return { index: -1, isActive: false };
      let node = towerH5.parentElement;
      while (node && node !== document.body) {
        const sw = node.querySelector('.ant-switch');
        if (sw) {
          const allSwitches = Array.from(document.querySelectorAll('.ant-switch'));
          return {
            index: allSwitches.indexOf(sw),
            isActive: sw.classList.contains('ant-switch-checked')
          };
        }
        node = node.parentElement;
      }
      return { index: -1, isActive: false };
    }, towerCardHeading);
  }

  async clickTowerToggle(towerCardHeading) {
    const { index } = await this.getTowerToggleInfo(towerCardHeading);
    if (index < 0) throw new Error(`ConfigPage.clickTowerToggle: tower not found: "${towerCardHeading}"`);
    await this.page.locator('.ant-switch').nth(index).click();
    await this.page.waitForTimeout(300);
  }

  async isTowerActive(towerCardHeading) {
    const { isActive } = await this.getTowerToggleInfo(towerCardHeading);
    return isActive;
  }

  async getActiveTowerNames() {
    return await this.page.evaluate(() => {
      const allHeadings = Array.from(document.querySelectorAll('h5'));
      const towerConfigH5 = allHeadings.find(h => h.textContent?.trim() === 'Tower Configuration');
      if (!towerConfigH5) return [];
      let container = towerConfigH5.parentElement;
      while (container && container !== document.body) {
        const switches = container.querySelectorAll('.ant-switch');
        if (switches.length > 0) {
          const activeTowers = [];
          switches.forEach(sw => {
            if (sw.classList.contains('ant-switch-checked')) {
              let node = sw.parentElement;
              while (node && node !== container) {
                const h5 = node.querySelector('h5');
                if (h5) { activeTowers.push(h5.textContent?.trim() ?? ''); break; }
                node = node.parentElement;
              }
            }
          });
          return activeTowers;
        }
        container = container.parentElement;
      }
      return [];
    });
  }

  // Clicks "View Tower" button for a specific tower using a Playwright click
  // (JS evaluate .click() doesn't trigger React navigation handlers).
  async clickViewTowerLink(towerCardHeading) {
    const buttonIndex = await this.page.evaluate((heading) => {
      const allH5s = Array.from(document.querySelectorAll('h5'));
      const towerH5 = allH5s.find(h => h.textContent?.trim() === heading);
      if (!towerH5) return -1;
      let node = towerH5.parentElement;
      while (node && node !== document.body) {
        const buttons = Array.from(node.querySelectorAll('button'));
        const viewBtn = buttons.find(b => /View Tower/i.test(b.textContent ?? ''));
        if (viewBtn) {
          const allPageButtons = Array.from(document.querySelectorAll('button'));
          return allPageButtons.indexOf(viewBtn);
        }
        node = node.parentElement;
      }
      return -1;
    }, towerCardHeading);

    if (buttonIndex < 0) throw new Error(`View Tower button not found for: "${towerCardHeading}"`);
    await this.page.locator('button').nth(buttonIndex).click();
    await this.page.waitForTimeout(2000);
  }

  async saveConfiguration() {
    await this.updateTowerConfigBtn.click();
    await this.waitForNetworkIdle();
  }

  // ─── Section 2–7: Upload Sections ────────────────────────────────────────────

  async downloadSampleFile(sectionHeading, downloadBtnText = 'Sample File Download') {
    await this.scrollToSection(sectionHeading);
    const card = this.getSectionCard(sectionHeading);
    const downloadPromise = this.page.waitForEvent('download');
    await card.locator(`button:has-text("${downloadBtnText}")`).click();
    const dl = await downloadPromise;
    const savePath = path.join(os.tmpdir(), dl.suggestedFilename());
    await dl.saveAs(savePath);
    return savePath;
  }

  async downloadFinalExcel(sectionHeading) {
    await this.scrollToSection(sectionHeading);
    const card = this.getSectionCard(sectionHeading);
    const downloadPromise = this.page.waitForEvent('download');
    await card.locator(`button:has-text("Final Excel Download")`).click();
    const dl = await downloadPromise;
    const savePath = path.join(os.tmpdir(), dl.suggestedFilename());
    await dl.saveAs(savePath);
    return savePath;
  }

  async getSectionCounts(sectionHeading) {
    const card = this.getSectionCard(sectionHeading);
    const text = (await card.textContent()) ?? '';
    const activeMatch = text.match(/Total active[^:]*:\s*(\d+)/i);
    const inactiveMatch = text.match(/Total inactive[^:]*:\s*(\d+)/i);
    return {
      active: activeMatch ? parseInt(activeMatch[1]) : 0,
      inactive: inactiveMatch ? parseInt(inactiveMatch[1]) : 0
    };
  }

  async setUploadFile(sectionHeading, filePath) {
    const card = this.getSectionCard(sectionHeading);
    const fileInput = card.locator('input[type="file"]').or(card.locator('input[accept]'));
    await fileInput.setInputFiles(filePath);
  }

  async clickUploadButton(sectionHeading) {
    const card = this.getSectionCard(sectionHeading);
    await card.locator("button:has-text('Upload File')").click();
  }

  async clickSubmitInSection(sectionHeading) {
    const card = this.getSectionCard(sectionHeading);
    await card.locator("button:has-text('Submit')").click();
    await this.waitForNetworkIdle();
  }

  // ─── Section 8: Customer Actions Card ────────────────────────────────────────

  async isCustomerActionsActive() {
    return await this.page.evaluate(() => {
      const allH5s = Array.from(document.querySelectorAll('h5'));
      const heading = allH5s.find(h => h.textContent?.trim() === 'Allow Additional Registrations:');
      if (!heading) return false;
      let node = heading.parentElement;
      while (node && node !== document.body) {
        const sw = node.querySelector('.ant-switch');
        if (sw) return sw.classList.contains('ant-switch-checked');
        node = node.parentElement;
      }
      return false;
    });
  }

  async toggleCustomerActions() {
    const index = await this.page.evaluate(() => {
      const allH5s = Array.from(document.querySelectorAll('h5'));
      const heading = allH5s.find(h => h.textContent?.trim() === 'Allow Additional Registrations:');
      if (!heading) return -1;
      let node = heading.parentElement;
      while (node && node !== document.body) {
        const sw = node.querySelector('.ant-switch');
        if (sw) {
          return Array.from(document.querySelectorAll('.ant-switch')).indexOf(sw);
        }
        node = node.parentElement;
      }
      return -1;
    });
    if (index < 0) throw new Error('ConfigPage.toggleCustomerActions: toggle not found');
    await this.page.locator('.ant-switch').nth(index).click();
    await this.page.waitForTimeout(300);
  }

  async submitCustomerActions() {
    const card = this.getSectionCard('Customer Actions Card');
    await card.locator("button:has-text('Submit')").click();
    await this.waitForNetworkIdle();
  }

  async setCustomerActionsCheckbox(bedTypeLabel, checked) {
    await this.page.evaluate(({ label, checked }) => {
      const h6s = Array.from(document.querySelectorAll('h6'));
      const h6 = h6s.find(h => h.textContent?.trim() === label);
      if (!h6) return;
      let node = h6.parentElement;
      while (node) {
        const cb = node.querySelector('input[type="checkbox"]');
        if (cb) {
          if (cb.checked !== checked) cb.click();
          return;
        }
        node = node.parentElement;
      }
    }, { label: bedTypeLabel, checked });
    await this.page.waitForTimeout(200);
  }

  async setCustomerActionsCount(bedTypeLabel, value) {
    const selectIndex = await this.page.evaluate((label) => {
      const h6s = Array.from(document.querySelectorAll('h6'));
      const h6 = h6s.find(h => h.textContent?.trim() === label);
      if (!h6) return -1;
      let node = h6.parentElement;
      while (node && node !== document.body) {
        const sel = node.querySelector('.ant-select-selector');
        if (sel) {
          return Array.from(document.querySelectorAll('.ant-select-selector')).indexOf(sel);
        }
        node = node.parentElement;
      }
      return -1;
    }, bedTypeLabel);

    if (selectIndex < 0) throw new Error(`Dropdown not found for bed type: "${bedTypeLabel}"`);
    await this.page.locator('.ant-select-selector').nth(selectIndex).click();
    await this.page.waitForTimeout(400);

    // Click the dropdown option inside the VISIBLE/active dropdown portal.
    await this.page.locator(
      `.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="${value}"]`
    ).first().click();
    await this.page.waitForTimeout(200);
  }

  // ─── Section 9: Max Preferences Per Unit ─────────────────────────────────────

  async getMaxPreferencesValue() {
    const card = this.getSectionCard('Max Preferences Per Unit');
    return (await card.locator('.ant-select-selection-item').first().textContent()) ?? '';
  }

  async setMaxPreferences(value) {
    const card = this.getSectionCard('Max Preferences Per Unit');
    await card.locator('.ant-select-selector').click();
    await this.page.waitForTimeout(300);
    await this.page.locator(`.ant-select-item-option[title="${value}"]`)
      .or(this.page.locator(`.ant-select-item:has-text("${value}")`))
      .first()
      .click();
    await this.page.waitForTimeout(200);
  }

  async clickMaxPreferencesUpdate() {
    const card = this.getSectionCard('Max Preferences Per Unit');
    await card.locator("button:has-text('Update')").click();
    await this.waitForNetworkIdle();
  }
}

module.exports = { ConfigPage };
