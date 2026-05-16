'use strict';

const { test, expect } = require('../../automation-repository/fixtures/base-test');

test.describe('__MODULE__ — __Portal__ Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to module entry point
  });

  test('TC___MODULE___FUNC_001 — REQ_ID — happy path description', async ({ page, __module__Page }) => {
    // Arrange

    // Act

    // Assert
    await expect(page).toHaveScreenshot('__module__-step-state.png', {
      maxDiffPixels: 100,
      threshold: 0.1
    });
  });
});
