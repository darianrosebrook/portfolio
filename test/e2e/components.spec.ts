import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for individual components
 */
test.describe('Component Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to a consistent size for visual testing
    await page.setViewportSize({ width: 800, height: 600 });
  });

  test('button component renders correctly', async ({ page }) => {
    // Create a simple test page with buttons
    await page.goto('/component-displaycase');

    // Wait for the page to be fully loaded and stable
    await page.waitForLoadState('networkidle');

    // Wait for fonts to load
    await page.waitForFunction(() => {
      return document.fonts.ready;
    });

    // Disable animations to get stable screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `,
    });

    // Wait for animations to be disabled and layout to settle
    await page.waitForTimeout(1000);

    // Wait for the main content to be visible
    await page.waitForSelector('main', { timeout: 10000 });

    // Find button components to test
    const buttons = page.locator('button').or(page.locator('[role="button"]'));
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Take a screenshot of the first few buttons
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        await expect(firstButton).toHaveScreenshot('button-primary.png', {
          animations: 'disabled',
          caret: 'hide',
        });
      }

      // Look for different button variants
      const primaryButtons = page
        .locator('button')
        .filter({ hasText: /primary|submit|save/i });
      if ((await primaryButtons.count()) > 0) {
        await expect(primaryButtons.first()).toHaveScreenshot(
          'button-primary-variant.png',
          {
            animations: 'disabled',
            caret: 'hide',
          }
        );
      }
    }
  });

  test('card component renders correctly', async ({ page }) => {
    await page.goto('/blueprints');

    // Wait for the page to be fully loaded and stable
    await page.waitForLoadState('networkidle');

    // Wait for fonts to load
    await page.waitForFunction(() => {
      return document.fonts.ready;
    });

    // Disable animations to get stable screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `,
    });

    // Wait for animations to be disabled and layout to settle
    await page.waitForTimeout(1000);

    // Wait for the main content to be visible
    await page.waitForSelector('main', { timeout: 10000 });

    // Find card components
    const cards = page
      .locator('[data-testid="card"]')
      .or(page.locator('article'))
      .or(page.locator('.card'));
    const cardCount = await cards.count();

    if (cardCount > 0) {
      const firstCard = cards.first();
      if (await firstCard.isVisible()) {
        await expect(firstCard).toHaveScreenshot('card-basic.png', {
          animations: 'disabled',
          caret: 'hide',
        });
      }
    }
  });

  test('form components render correctly', async ({ page }) => {
    await page.goto('/component-displaycase');

    // Wait for the page to be fully loaded and stable
    await page.waitForLoadState('networkidle');

    // Wait for fonts to load
    await page.waitForFunction(() => {
      return document.fonts.ready;
    });

    // Disable animations to get stable screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `,
    });

    // Wait for animations to be disabled and layout to settle
    await page.waitForTimeout(1000);

    // Wait for the main content to be visible
    await page.waitForSelector('main', { timeout: 10000 });

    // Find form input components
    const inputs = page
      .locator('input')
      .or(page.locator('textarea'))
      .or(page.locator('[role="textbox"]'));
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      const firstInput = inputs.first();
      if (await firstInput.isVisible()) {
        await expect(firstInput).toHaveScreenshot('input-basic.png', {
          animations: 'disabled',
          caret: 'hide',
        });
      }
    }

    // Find form labels
    const labels = page.locator('label');
    if ((await labels.count()) > 0) {
      await expect(labels.first()).toHaveScreenshot('label-basic.png', {
        animations: 'disabled',
        caret: 'hide',
      });
    }
  });
});
