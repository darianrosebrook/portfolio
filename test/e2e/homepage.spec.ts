import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for the homepage
 */
test.describe('Homepage Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to a consistent size for visual testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('homepage renders correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be fully loaded and stable
    await page.waitForLoadState('networkidle');

    // Wait for fonts to load
    await page.waitForFunction(() => {
      return document.fonts.ready;
    });

    // Wait for any animations to settle
    await page.waitForTimeout(2000);

    // Wait for the main content to be visible
    await page.waitForSelector('main', { timeout: 10000 });

    // Take a screenshot of the full page
    await expect(page).toHaveScreenshot('homepage-full.png');

    // Test specific sections
    const heroSection = page
      .locator('[data-testid="hero-section"]')
      .or(page.locator('main > section').first());
    if (await heroSection.isVisible()) {
      await expect(heroSection).toHaveScreenshot('homepage-hero-section.png');
    }
  });

  test('homepage navigation renders correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be fully loaded and stable
    await page.waitForLoadState('networkidle');

    // Wait for fonts to load
    await page.waitForFunction(() => {
      return document.fonts.ready;
    });

    // Wait for any animations to settle
    await page.waitForTimeout(2000);

    // Wait for the header to be visible
    await page.waitForSelector('header', { timeout: 10000 });

    // Test the navigation/header area
    const header = page
      .locator('header')
      .or(page.locator('[data-testid="header"]'));
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('homepage-header.png');
    }

    // Test the main navigation menu
    const nav = page
      .locator('nav')
      .or(page.locator('[data-testid="navigation"]'));
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot('homepage-navigation.png');
    }
  });
});
