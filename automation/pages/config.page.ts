import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import * as path from 'path';
import * as os from 'os';

export class ConfigPage extends BasePage {

  readonly updateTowerConfigBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.updateTowerConfigBtn = page.locator("button:has-text('Update Tower Configuration')").first();
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto('https://uat-web.xrportal.in/admin/cms', { waitUntil: 'domcontentloaded' });
    await expect(this.updateTowerConfigBtn).toBeVisible({ timeout: 15_000 });
    await this.waitForNetworkIdle();
  }

  // ─── Section helpers ─────────────────────────────────────────────────────────

  // Returns the section container element for a given H5 section heading.
  // Non-tower sections are NOT wrapped in .ant-card. Instead the H5 sits inside a
  // .data-content-header div. Walk up two levels to get the section container which
  // holds both the header and the content (buttons, inputs, selects).
  // XPath: h5[text] → parent(.data-content-header) → parent(section container)
  getSectionCard(sectionHeading: string): Locator {
    return this.page.locator(
      `xpath=//h5[normalize-space()="${sectionHeading}"]/ancestor::*[contains(@class,"data-content-header")]/..`
    ).first();
  }

  // Scrolls the given section heading into view so it is visible on screen.
  async scrollToSection(sectionHeading: string): Promise<void> {
    await this.page.evaluate((heading: string) => {
      const h5s = Array.from(document.querySelectorAll('h5'));
      const el = h5s.find(h => h.textContent?.trim() === heading);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, sectionHeading);
    await this.page.waitForTimeout(600);
  }

  // Waits for an Ant Design message toast and returns its text.
  async waitForSuccessToast(timeout = 8_000): Promise<string> {
    const toast = this.page.locator('.ant-message-notice').first();
    await toast.waitFor({ state: 'visible', timeout });
    return (await toast.textContent()) ?? '';
  }

  // ─── Section 1: Tower Configuration ─────────────────────────────────────────

  // Locates the Tower Configuration section using pure DOM traversal via page.evaluate().
  // Playwright locator-based scoping fails because Ant Design nests the heading inside
  // ant-card-head and switches inside ant-card-body — they are NOT DOM siblings.
  // Walks UP from the Tower Configuration heading until it finds the first ancestor
  // that contains .ant-switch elements (= the Tower Configuration section container).
  // Returns { checked: number of active towers, firstInactiveIndex: page-level switch index }.
  private async towerSwitchInfo(): Promise<{ checked: number; firstInactiveIndex: number }> {
    return await this.page.evaluate((): { checked: number; firstInactiveIndex: number } => {
      const allHeadings = Array.from(
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')
      );
      const towerConfigHeading = allHeadings.find(
        el => el.textContent?.trim() === 'Tower Configuration'
      );
      if (!towerConfigHeading) return { checked: 0, firstInactiveIndex: -1 };

      let container: Element | null = towerConfigHeading.parentElement;
      while (container && container !== document.body) {
        const sectionSwitches = container.querySelectorAll('.ant-switch');
        if (sectionSwitches.length > 0) {
          const checked = container.querySelectorAll('.ant-switch-checked').length;
          const allPageSwitches = Array.from(document.querySelectorAll('.ant-switch'));
          let firstInactiveIndex = -1;
          for (const sw of Array.from(sectionSwitches)) {
            if (!sw.classList.contains('ant-switch-checked')) {
              firstInactiveIndex = allPageSwitches.indexOf(sw as HTMLElement);
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

  // Returns count of active (green) tower toggles in the Tower Configuration section.
  async getActiveTowerCount(): Promise<number> {
    const { checked } = await this.towerSwitchInfo();
    return checked;
  }

  // Clicks the first inactive tower toggle. Returns page-level switch index for cleanup.
  async activateFirstInactiveTower(): Promise<number> {
    const { firstInactiveIndex } = await this.towerSwitchInfo();
    if (firstInactiveIndex < 0) {
      throw new Error('ConfigPage.activateFirstInactiveTower: no inactive tower toggle found');
    }
    await this.page.locator('.ant-switch').nth(firstInactiveIndex).click();
    await this.page.waitForTimeout(300);
    return firstInactiveIndex;
  }

  // Reverts a tower toggle at the given page-level index.
  async deactivateTowerAtIndex(switchIndex: number): Promise<void> {
    await this.page.locator('.ant-switch').nth(switchIndex).click();
    await this.page.waitForTimeout(300);
  }

  // Gets toggle state + page-level index for a specific tower by its card heading.
  // towerCardHeading: exact h5 text, e.g. 'Tower 8 - Crest'
  async getTowerToggleInfo(towerCardHeading: string): Promise<{ index: number; isActive: boolean }> {
    return await this.page.evaluate((heading: string): { index: number; isActive: boolean } => {
      const allH5s = Array.from(document.querySelectorAll('h5'));
      const towerH5 = allH5s.find(h => h.textContent?.trim() === heading);
      if (!towerH5) return { index: -1, isActive: false };
      let node: Element | null = towerH5.parentElement;
      while (node && node !== document.body) {
        const sw = node.querySelector('.ant-switch');
        if (sw) {
          const allSwitches = Array.from(document.querySelectorAll('.ant-switch'));
          return {
            index: allSwitches.indexOf(sw as HTMLElement),
            isActive: sw.classList.contains('ant-switch-checked')
          };
        }
        node = node.parentElement;
      }
      return { index: -1, isActive: false };
    }, towerCardHeading);
  }

  // Clicks the toggle for a specific tower by its card heading.
  async clickTowerToggle(towerCardHeading: string): Promise<void> {
    const { index } = await this.getTowerToggleInfo(towerCardHeading);
    if (index < 0) throw new Error(`ConfigPage.clickTowerToggle: tower not found: "${towerCardHeading}"`);
    await this.page.locator('.ant-switch').nth(index).click();
    await this.page.waitForTimeout(300);
  }

  // Returns true if the named tower is currently active.
  async isTowerActive(towerCardHeading: string): Promise<boolean> {
    const { isActive } = await this.getTowerToggleInfo(towerCardHeading);
    return isActive;
  }

  // Returns heading text of all currently active towers (in the Tower Configuration section).
  async getActiveTowerNames(): Promise<string[]> {
    return await this.page.evaluate((): string[] => {
      const allHeadings = Array.from(document.querySelectorAll('h5'));
      const towerConfigH5 = allHeadings.find(h => h.textContent?.trim() === 'Tower Configuration');
      if (!towerConfigH5) return [];
      let container: Element | null = towerConfigH5.parentElement;
      while (container && container !== document.body) {
        const switches = container.querySelectorAll('.ant-switch');
        if (switches.length > 0) {
          const activeTowers: string[] = [];
          switches.forEach(sw => {
            if (sw.classList.contains('ant-switch-checked')) {
              // Find the nearest h5 above this switch (the tower card heading)
              let node: Element | null = sw.parentElement;
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
  // Finds the button's page-level index via DOM traversal, then clicks via locator.
  async clickViewTowerLink(towerCardHeading: string): Promise<void> {
    const buttonIndex = await this.page.evaluate((heading: string): number => {
      const allH5s = Array.from(document.querySelectorAll('h5'));
      const towerH5 = allH5s.find(h => h.textContent?.trim() === heading);
      if (!towerH5) return -1;
      let node: Element | null = towerH5.parentElement;
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

  // Clicks "Update Tower Configuration" and waits for the network to settle.
  async saveConfiguration(): Promise<void> {
    await this.updateTowerConfigBtn.click();
    await this.waitForNetworkIdle();
  }

  // ─── Section 2–7: Upload Sections ────────────────────────────────────────────

  // Triggers a download from a section's Download button.
  // Returns the local file path where the file was saved.
  // downloadBtnText defaults to 'Sample File Download'; use 'Available Unit Inventory Download' for Unit Cost Update.
  async downloadSampleFile(sectionHeading: string, downloadBtnText = 'Sample File Download'): Promise<string> {
    await this.scrollToSection(sectionHeading);
    const card = this.getSectionCard(sectionHeading);
    const downloadPromise = this.page.waitForEvent('download');
    await card.locator(`button:has-text("${downloadBtnText}")`).click();
    const dl = await downloadPromise;
    const savePath = path.join(os.tmpdir(), dl.suggestedFilename());
    await dl.saveAs(savePath);
    return savePath;
  }

  // Sets the file input for an upload section using Playwright's setInputFiles.
  async setUploadFile(sectionHeading: string, filePath: string): Promise<void> {
    const card = this.getSectionCard(sectionHeading);
    const fileInput = card.locator('input[type="file"]').or(card.locator('input[accept]'));
    await fileInput.setInputFiles(filePath);
  }

  // Clicks the Upload File button in a section (opens file picker — use setUploadFile instead).
  async clickUploadButton(sectionHeading: string): Promise<void> {
    const card = this.getSectionCard(sectionHeading);
    await card.locator("button:has-text('Upload File')").click();
  }

  // Clicks the Submit button in a section and waits for network idle.
  async clickSubmitInSection(sectionHeading: string): Promise<void> {
    const card = this.getSectionCard(sectionHeading);
    await card.locator("button:has-text('Submit')").click();
    await this.waitForNetworkIdle();
  }

  // ─── Section 8: Customer Actions Card ────────────────────────────────────────

  // Returns true if the "Allow Additional Registrations" toggle is currently Active (green).
  async isCustomerActionsActive(): Promise<boolean> {
    return await this.page.evaluate((): boolean => {
      const allH5s = Array.from(document.querySelectorAll('h5'));
      const heading = allH5s.find(h => h.textContent?.trim() === 'Allow Additional Registrations:');
      if (!heading) return false;
      let node: Element | null = heading.parentElement;
      while (node && node !== document.body) {
        const sw = node.querySelector('.ant-switch');
        if (sw) return sw.classList.contains('ant-switch-checked');
        node = node.parentElement;
      }
      return false;
    });
  }

  // Clicks the "Allow Additional Registrations" toggle.
  async toggleCustomerActions(): Promise<void> {
    const index = await this.page.evaluate((): number => {
      const allH5s = Array.from(document.querySelectorAll('h5'));
      const heading = allH5s.find(h => h.textContent?.trim() === 'Allow Additional Registrations:');
      if (!heading) return -1;
      let node: Element | null = heading.parentElement;
      while (node && node !== document.body) {
        const sw = node.querySelector('.ant-switch');
        if (sw) {
          return Array.from(document.querySelectorAll('.ant-switch')).indexOf(sw as HTMLElement);
        }
        node = node.parentElement;
      }
      return -1;
    });
    if (index < 0) throw new Error('ConfigPage.toggleCustomerActions: toggle not found');
    await this.page.locator('.ant-switch').nth(index).click();
    await this.page.waitForTimeout(300);
  }

  // Clicks Submit in the Customer Actions Card section.
  async submitCustomerActions(): Promise<void> {
    const card = this.getSectionCard('Customer Actions Card');
    await card.locator("button:has-text('Submit')").click();
    await this.waitForNetworkIdle();
  }

  // Checks or unchecks a bed type checkbox in Customer Actions Card.
  // bedTypeLabel: 'Allow 1 Bed Growth Home' | 'Allow 2 Bed Growth Home' | 'Allow 2 Bed Rise Home'
  async setCustomerActionsCheckbox(bedTypeLabel: string, checked: boolean): Promise<void> {
    await this.page.evaluate(({ label, checked }: { label: string; checked: boolean }) => {
      const h6s = Array.from(document.querySelectorAll('h6'));
      const h6 = h6s.find(h => h.textContent?.trim() === label);
      if (!h6) return;
      let node: Element | null = h6.parentElement;
      while (node) {
        const cb = node.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
        if (cb) {
          if (cb.checked !== checked) cb.click();
          return;
        }
        node = node.parentElement;
      }
    }, { label: bedTypeLabel, checked });
    await this.page.waitForTimeout(200);
  }

  // Sets the count dropdown for a bed type in Customer Actions Card.
  // Uses DOM traversal to find the .ant-select-selector index, then Playwright click
  // to open the dropdown (evaluate .click() doesn't trigger React/Ant Design handlers).
  async setCustomerActionsCount(bedTypeLabel: string, value: string): Promise<void> {
    const selectIndex = await this.page.evaluate((label: string): number => {
      const h6s = Array.from(document.querySelectorAll('h6'));
      const h6 = h6s.find(h => h.textContent?.trim() === label);
      if (!h6) return -1;
      let node: Element | null = h6.parentElement;
      while (node && node !== document.body) {
        const sel = node.querySelector('.ant-select-selector');
        if (sel) {
          return Array.from(document.querySelectorAll('.ant-select-selector')).indexOf(sel as HTMLElement);
        }
        node = node.parentElement;
      }
      return -1;
    }, bedTypeLabel);

    if (selectIndex < 0) throw new Error(`Dropdown not found for bed type: "${bedTypeLabel}"`);
    await this.page.locator('.ant-select-selector').nth(selectIndex).click();
    await this.page.waitForTimeout(400);

    // Click the dropdown option inside the VISIBLE/active dropdown portal.
    // Multiple dropdowns exist in the DOM (one per bed type); hidden ones have
    // class "ant-select-dropdown-hidden". Scope to the visible one to avoid
    // clicking an option inside a hidden/cached dropdown.
    await this.page.locator(
      `.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="${value}"]`
    ).first().click();
    await this.page.waitForTimeout(200);
  }

  // ─── Section 9: Max Preferences Per Unit ─────────────────────────────────────

  // Returns the currently selected Max Preferences value as a string.
  async getMaxPreferencesValue(): Promise<string> {
    const card = this.getSectionCard('Max Preferences Per Unit');
    return (await card.locator('.ant-select-selection-item').first().textContent()) ?? '';
  }

  // Opens the Max Preferences dropdown and selects the given value.
  async setMaxPreferences(value: string): Promise<void> {
    const card = this.getSectionCard('Max Preferences Per Unit');
    await card.locator('.ant-select-selector').click();
    await this.page.waitForTimeout(300);
    // Ant Design renders dropdown options in a portal outside the card
    await this.page.locator(`.ant-select-item-option[title="${value}"]`)
      .or(this.page.locator(`.ant-select-item:has-text("${value}")`))
      .first()
      .click();
    await this.page.waitForTimeout(200);
  }

  // Clicks the Max Preferences "Update" button and waits for network idle.
  async clickMaxPreferencesUpdate(): Promise<void> {
    const card = this.getSectionCard('Max Preferences Per Unit');
    await card.locator("button:has-text('Update')").click();
    await this.waitForNetworkIdle();
  }
}
