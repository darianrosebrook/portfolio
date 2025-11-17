import { test, expect, type Page } from '@playwright/test';

/**
 * Visual regression tests for the homepage
 */
test.describe('Homepage Visual Regression', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Set viewport to a consistent size for visual testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('homepage renders correctly', async ({ page }: { page: Page }) => {
    await page.goto('/');

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

        // Check for specific content indicators
        const hasMainContent =
          document.querySelector('main') ||
          document.querySelector('.hero') ||
          document.querySelector('h1') ||
          document.body.textContent?.includes('Darian Rosebrook');

        // Check if images are loading (avoid layout shifts)
        const images = document.querySelectorAll('img');
        const imagesLoaded = Array.from(images).every(
          (img) => img.complete || img.naturalWidth > 0
        );

        return hasBasicStructure && (hasMainContent || imagesLoaded);
      },
      { timeout: 20000, polling: 500 }
    );

    // Take a screenshot of the full page
    await expect(page).toHaveScreenshot('homepage-full.png', {
      animations: 'disabled',
      caret: 'hide',
    });

    // Test specific sections
    const heroSection = page
      .locator('[data-testid="hero-section"]')
      .or(page.locator('main > section').first());
    if (await heroSection.isVisible()) {
      await expect(heroSection).toHaveScreenshot('homepage-hero-section.png', {
        animations: 'disabled',
        caret: 'hide',
      });
    }
  });

  test('homepage navigation renders correctly', async ({ page }: { page: Page }) => {
    await page.goto('/');

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

    // Wait for the header to be visible with retry logic
    await page.waitForFunction(
      () => {
        // Check if page has loaded basic structure
        const hasBasicStructure =
          document.body && document.body.children.length > 0;

        // Check for header/navigation elements
        const hasHeader =
          document.querySelector('header') ||
          document.querySelector('nav') ||
          document.querySelector('.navbar') ||
          document.querySelector('[data-testid="header"]');

        return hasBasicStructure && hasHeader;
      },
      { timeout: 20000, polling: 500 }
    );

    // Test the navigation/header area
    const header = page
      .locator('header')
      .or(page.locator('[data-testid="header"]'));
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('homepage-header.png', {
        animations: 'disabled',
        caret: 'hide',
      });
    }

    // Test the main navigation menu
    const nav = page
      .locator('nav')
      .or(page.locator('[data-testid="navigation"]'));
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot('homepage-navigation.png', {
        animations: 'disabled',
        caret: 'hide',
      });
    }
  });
});
