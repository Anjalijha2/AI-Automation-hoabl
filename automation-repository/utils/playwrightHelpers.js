/**
 * PLAYWRIGHT HELPERS — Reusable utility functions
 * Use these across all spec files to keep tests DRY.
 */

const { expect } = require('@playwright/test');

/** Wait for an element to be visible with a custom timeout */
async function waitForVisible(locator, timeout = 15_000) {
  await expect(locator).toBeVisible({ timeout });
}

/** Take a screenshot with a timestamp */
async function takeScreenshot(page, label, folder = 'reports/screenshots') {
  await page.screenshot({ path: `${folder}/${label}_${Date.now()}.png` });
}

/** Pause for visual inspection in headed mode */
async function pause(page, ms = 800) {
  await page.waitForTimeout(ms);
}

/** Clear and type into an input field */
async function fillInput(locator, value) {
  await locator.click();
  await locator.clear();
  await locator.pressSequentially(value, { delay: 80 });
}

/** Check if current URL contains a given path */
function urlContains(page, path) {
  return page.url().includes(path);
}

module.exports = { waitForVisible, takeScreenshot, pause, fillInput, urlContains };
