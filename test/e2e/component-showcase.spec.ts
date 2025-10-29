import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for component showcase
 */
test.describe('Component Showcase Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to a consistent size for visual testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('component display case renders correctly', async ({ page }) => {
    await page.goto('/component-displaycase');

    // Wait for the page to be fully loaded and stable
    await page.waitForLoadState('networkidle');

    // Wait for fonts to load
    await page.waitForFunction(() => {
      return document.fonts.ready;
    });

    // Wait for any animations to settle
    await page.waitForTimeout(2000);

    // Wait for the page content to be visible with retry logic
    await page.waitForFunction(
      () => {
        // Check if page has loaded basic structure
        const hasBasicStructure =
          document.body && document.body.children.length > 0;

        // Check for content indicators
        const hasContent =
          document.querySelector('main') ||
          document.querySelector('.content') ||
          document.querySelector('h1') ||
          document.body.textContent?.includes('Component') ||
          document.body.textContent?.includes('Blueprint');

        return hasBasicStructure && hasContent;
      },
      { timeout: 20000, polling: 500 }
    );

    // Take a screenshot of the full component grid
    await expect(page).toHaveScreenshot('component-displaycase-full.png');

    // Test the component grid layout
    const componentGrid = page
      .locator('[data-testid="component-grid"]')
      .or(page.locator('.component-grid'));
    if (await componentGrid.isVisible()) {
      await expect(componentGrid).toHaveScreenshot('component-grid.png');
    }
  });

  test('blueprints page renders correctly', async ({ page }) => {
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

    // Wait for the page content to be visible with retry logic
    await page.waitForFunction(
      () => {
        // Check if page has loaded basic structure
        const hasBasicStructure =
          document.body && document.body.children.length > 0;

        // Check for content indicators
        const hasContent =
          document.querySelector('main') ||
          document.querySelector('.content') ||
          document.querySelector('h1') ||
          document.body.textContent?.includes('Component') ||
          document.body.textContent?.includes('Blueprint');

        return hasBasicStructure && hasContent;
      },
      { timeout: 20000, polling: 500 }
    );

    // Take a screenshot of the blueprints page
    await expect(page).toHaveScreenshot('blueprints-page-full.png', {
      animations: 'disabled',
      caret: 'hide',
    });

    // Test the component standards section
    const componentStandards = page
      .locator('[data-testid="component-standards"]')
      .or(page.locator('text=Component Standards'));
    if (await componentStandards.isVisible()) {
      await expect(componentStandards).toHaveScreenshot(
        'blueprints-component-standards.png',
        {
          animations: 'disabled',
          caret: 'hide',
        }
      );
    }
  });
});
