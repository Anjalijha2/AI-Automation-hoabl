/**
 * PLAYWRIGHT HELPERS — Reusable utility functions
 * Use these across all spec files to keep tests DRY.
 */
import { Page, Locator, expect } from '@playwright/test';

/** Wait for an element to be visible with a custom timeout */
export async function waitForVisible(locator: Locator, timeout = 15_000): Promise<void> {
  await expect(locator).toBeVisible({ timeout });
}

/** Take a screenshot with a timestamp */
export async function takeScreenshot(page: Page, label: string, folder = 'reports/screenshots'): Promise<void> {
  await page.screenshot({ path: `${folder}/${label}_${Date.now()}.png` });
}

/** Pause for visual inspection in headed mode */
export async function pause(page: Page, ms = 800): Promise<void> {
  await page.waitForTimeout(ms);
}

/** Clear and type into an input field */
export async function fillInput(locator: Locator, value: string): Promise<void> {
  await locator.click();
  await locator.clear();
  await locator.pressSequentially(value, { delay: 80 });
}

/** Check if current URL contains a given path */
export function urlContains(page: Page, path: string): boolean {
  return page.url().includes(path);
}
