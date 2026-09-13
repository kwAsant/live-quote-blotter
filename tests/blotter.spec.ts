import { test, expect } from '@playwright/test';

test.describe('FX Blotter Browser Pipeline Validations', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate straight to your active local development build address
        await page.goto('http://localhost:5173/');
    });

    test('Page loads correctly, applies filters, and completes full accept execution workflow loops', async ({ page }) => {
        // A. Prove layout header mounts successfully
        const mainTitle = page.getByRole('heading', {
            name: 'FX Option Live Quote Blotter',
            level: 1,
        });
        await expect(mainTitle).toBeVisible();
        
        // B. Select the first actionable quote row button that is not locked
        const actionableButton = page.locator('.rfq-row button:not([disabled])').first();
        await expect(actionableButton).toBeVisible();
        await actionableButton.click();

        // C. Confirm accessibility dialog focus layer triggers
        const dialogOverlayHeader = page.locator('#modal-title');
        await expect(dialogOverlayHeader).toHaveText('Confirm Trade Execution', { ignoreCase: true });

        // D. Fire server execute mock promise action
        await page.click('.btn-primary');

        // E. Assert that success context banners update dynamically onto the interface view screen
        const successToastAlert = page.locator('.notification-banner.success');
        await expect(successToastAlert).toBeVisible();
        await expect(successToastAlert).toContainText('Successfully executed trade');
    });
});