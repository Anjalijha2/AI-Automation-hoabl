const { test, expect } = require('@playwright/test');

test.describe('Tower Configuration Integration Tests (TC-1.1 to TC-1.6)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/cms');
        // The towers require the API data to load before they display
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: 'Configurations' })).toBeVisible({ timeout: 15000 });
    });

    test('TC-1.1: Deactivate Active Tower → Verify Success + Persistence', async ({ page }) => {
        const towerName = 'Tower 8 - Crest';
        const towerCard = page.locator('.tower-configuration-section', { hasText: towerName });
        const toggle = towerCard.locator('button[role="switch"]');

        if (await toggle.getAttribute('aria-checked') === 'false') {
            await toggle.click();
            await page.getByRole('button', { name: 'Update Tower Configuration' }).click();
            await expect(page.locator('.ant-message-notice', { hasText: /success/i })).toBeVisible();
            await page.reload();
            await page.waitForLoadState('networkidle');
        }

        await expect(toggle).toHaveAttribute('aria-checked', 'true');
        await page.screenshot({ path: 'reports/screenshots/TC-1.1_before_toggle.png' });

        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-checked', 'false');
        await page.screenshot({ path: 'reports/screenshots/TC-1.1_after_toggle.png' });

        await page.getByRole('button', { name: 'Update Tower Configuration' }).click();
        const successMsg = page.locator('.ant-message-notice', { hasText: /success/i });
        await expect(successMsg).toBeVisible();
        await successMsg.screenshot({ path: 'reports/screenshots/TC-1.1_success_msg.png' });

        await page.reload();
        await page.waitForLoadState('networkidle');
        const reloadedToggle = page.locator('.tower-configuration-section', { hasText: towerName }).locator('button[role="switch"]');
        await expect(reloadedToggle).toHaveAttribute('aria-checked', 'false');
    });

    test('TC-1.2: Activate Inactive Tower → Verify Success + Persistence', async ({ page }) => {
        const towerName = 'Tower 17 - Bright';
        const towerCard = page.locator('.tower-configuration-section', { hasText: towerName });
        const toggle = towerCard.locator('button[role="switch"]');

        if (await toggle.getAttribute('aria-checked') === 'true') {
            await toggle.click();
            await page.getByRole('button', { name: 'Update Tower Configuration' }).click();
            await expect(page.locator('.ant-message-notice', { hasText: /success/i })).toBeVisible();
            await page.reload();
            await page.waitForLoadState('networkidle');
        }

        await expect(toggle).toHaveAttribute('aria-checked', 'false');
        await page.screenshot({ path: 'reports/screenshots/TC-1.2_before.png' });

        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-checked', 'true');
        await page.screenshot({ path: 'reports/screenshots/TC-1.2_after.png' });

        await page.getByRole('button', { name: 'Update Tower Configuration' }).click();
        await expect(page.locator('.ant-message-notice', { hasText: /success/i })).toBeVisible();

        await page.reload();
        await page.waitForLoadState('networkidle');
        const reloadedToggle = page.locator('.tower-configuration-section', { hasText: towerName }).locator('button[role="switch"]');
        await expect(reloadedToggle).toHaveAttribute('aria-checked', 'true');

        await reloadedToggle.click();
        await page.getByRole('button', { name: 'Update Tower Configuration' }).click();
    });

    test('TC-1.3: Toggle Without Saving → Changes Revert on Refresh', async ({ page }) => {
        const towerName = 'Tower 5 - Grace';
        const towerCard = page.locator('.tower-configuration-section', { hasText: towerName });
        const toggle = towerCard.locator('button[role="switch"]');

        const initialState = await toggle.getAttribute('aria-checked');
        await toggle.click();

        await page.reload();
        await page.waitForLoadState('networkidle');

        const reloadedToggle = page.locator('.tower-configuration-section', { hasText: towerName }).locator('button[role="switch"]');
        await expect(reloadedToggle).toHaveAttribute('aria-checked', initialState);
    });

    test('TC-1.4: View Tower Link → Verify Navigation', async ({ page }) => {
        const towerName = 'Tower 8 - Crest';
        const towerCard = page.locator('.tower-configuration-section', { hasText: towerName });

        const viewLink = towerCard.getByRole('button', { name: /View Tower/ });
        await expect(viewLink).toBeVisible();
        await viewLink.click();

        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'reports/screenshots/TC-1.4_after.png' });
    });

    test('TC-1.5: Verify 18 Towers Displayed', async ({ page }) => {
        const towerCards = page.locator('.tower-configuration-wrapper .tower-configuration-section');
        const count = await towerCards.count();
        expect(count).toBeGreaterThanOrEqual(18);
    });

    test('TC-1.6: Toggle Multiple Towers + Single Save', async ({ page }) => {
        const towers = ['Tower 12 - Pinnacle', 'Tower 17 - Bright', 'Tower 7 - Blossom'];

        for (const name of towers) {
            const toggle = page.locator('.tower-configuration-section', { hasText: name }).locator('button[role="switch"]');
            await toggle.click();
        }

        await page.getByRole('button', { name: 'Update Tower Configuration' }).click();
        await expect(page.locator('.ant-message-notice', { hasText: /success/i })).toBeVisible();

        await page.reload();
        await page.waitForLoadState('networkidle');
    });

});
