/**
 * BASE PAGE — Shared utilities for all Page Objects
 * All page objects extend this class.
 */
import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async screenshot(label: string, folder = 'reports/screenshots'): Promise<void> {
    const ts = Date.now();
    await this.page.screenshot({ path: `${folder}/${label}_${ts}.png`, fullPage: true });
  }

  async pause(ms = 800): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
