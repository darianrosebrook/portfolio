/**
 * E2E tests for FontInspector SVG interaction features
 *
 * Tests:
 * - Keyboard shortcuts (d, `, ?)
 * - Pointer dragging for axis adjustment
 * - Hover interactions
 * - State monitoring
 * - Interaction logging
 */

import { test, expect } from '@playwright/test';

test.describe('FontInspector SVG Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/interaction-test');
    // Wait for the page to be fully loaded
    await page.waitForSelector('[class*="canvasWrapper"]', { timeout: 10000 });
  });

  test('page loads and displays all sections', async ({ page }) => {
    // Check that all main sections are present
    await expect(
      page.getByRole('heading', { name: /Interaction Test Suite/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /SVG Canvas/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Interaction Log/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Current State/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Keyboard Shortcuts/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Pointer Event Test/i })
    ).toBeVisible();
  });

  test('keyboard shortcut d toggles details', async ({ page }) => {
    // Get initial state
    const stateSection = page.locator('[class*="stateSection"]');
    const initialDetailsState = await stateSection
      .getByText(/Details Visible:/i)
      .locator('..')
      .textContent();

    // Press 'd' key
    await page.keyboard.press('d');
    await page.waitForTimeout(100); // Wait for state update

    // Check that state changed
    const newDetailsState = await stateSection
      .getByText(/Details Visible:/i)
      .locator('..')
      .textContent();

    expect(newDetailsState).not.toBe(initialDetailsState);

    // Check that log entry was created
    const logContainer = page.locator('[class*="logContainer"]');
    await expect(
      logContainer.getByText(/Keyboard: Toggled details/i)
    ).toBeVisible();
  });

  test('keyboard shortcut backtick toggles debug overlay', async ({ page }) => {
    // Press backtick key
    await page.keyboard.press('`');
    await page.waitForTimeout(100);

    // Check that log entry was created
    const logContainer = page.locator('[class*="logContainer"]');
    await expect(
      logContainer.getByText(/Keyboard: Toggled debug overlay/i)
    ).toBeVisible();
  });

  test('keyboard shortcut ? shows help', async ({ page }) => {
    // Press '?' key
    await page.keyboard.press('?');
    await page.waitForTimeout(100);

    // Check that log entry was created
    const logContainer = page.locator('[class*="logContainer"]');
    await expect(
      logContainer.getByText(/Keyboard: Showed help/i)
    ).toBeVisible();
  });

  test('pointer dragging updates axis values', async ({ page }) => {
    // Get initial weight value
    const stateSection = page.locator('[class*="stateSection"]');
    const weightText = stateSection.getByText(/Weight:/i).locator('..');
    const initialWeight = await weightText.textContent();

    // Find the SVG canvas area
    const canvasWrapper = page.locator('[class*="canvasWrapper"]').first();
    const canvasBox = await canvasWrapper.boundingBox();

    if (!canvasBox) {
      test.skip();
      return;
    }

    // Perform horizontal drag on the canvas
    const startX = canvasBox.x + canvasBox.width / 4;
    const startY = canvasBox.y + canvasBox.height / 2;
    const endX = canvasBox.x + (canvasBox.width * 3) / 4;
    const endY = startY;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(200); // Wait for axis update

    // Check that weight value changed
    const newWeight = await weightText.textContent();
    expect(newWeight).not.toBe(initialWeight);

    // Check that log shows axis change
    const logContainer = page.locator('[class*="logContainer"]');
    await expect(
      logContainer.getByText(/Axis values changed:/i).first()
    ).toBeVisible();
  });

  test('pointer events in test area update hover position', async ({
    page,
  }) => {
    const pointerArea = page.locator('[class*="pointerArea"]');
    const pointerBox = await pointerArea.boundingBox();

    if (!pointerBox) {
      test.skip();
      return;
    }

    // Move mouse to center of pointer area
    const centerX = pointerBox.x + pointerBox.width / 2;
    const centerY = pointerBox.y + pointerBox.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.waitForTimeout(100);

    // Check that hover position is displayed
    const stateSection = page.locator('[class*="stateSection"]');
    const hoverPos = stateSection.getByText(/Hover Position:/i).locator('..');

    await expect(hoverPos.getByText(/\d+,\s*\d+/)).toBeVisible();
  });

  test('pointer drag in test area shows visual feedback', async ({ page }) => {
    const pointerArea = page.locator('[class*="pointerArea"]');
    const pointerBox = await pointerArea.boundingBox();

    if (!pointerBox) {
      test.skip();
      return;
    }

    // Start drag
    const startX = pointerBox.x + pointerBox.width / 4;
    const startY = pointerBox.y + pointerBox.height / 4;
    const endX = pointerBox.x + (pointerBox.width * 3) / 4;
    const endY = pointerBox.y + (pointerBox.height * 3) / 4;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 5 });
    await page.waitForTimeout(50);

    // Check that drag line is visible (SVG line element)
    const dragLine = pointerArea.locator('svg line');
    await expect(dragLine).toBeVisible();

    // Release and check log
    await page.mouse.up();
    await page.waitForTimeout(100);

    const logContainer = page.locator('[class*="logContainer"]');
    await expect(logContainer.getByText(/Pointer down at/i)).toBeVisible();
    await expect(logContainer.getByText(/Pointer up/i)).toBeVisible();
  });

  test('clear log button clears interaction log', async ({ page }) => {
    // Generate some interactions
    await page.keyboard.press('d');
    await page.keyboard.press('`');
    await page.waitForTimeout(100);

    // Verify log has entries
    const logContainer = page.locator('[class*="logContainer"]');
    const logList = logContainer.locator('[class*="logList"]');
    const logEntries = logList.locator('li');
    const countBefore = await logEntries.count();
    expect(countBefore).toBeGreaterThan(0);

    // Click clear button
    const clearButton = page.getByRole('button', { name: /Clear Log/i });
    await clearButton.click();
    await page.waitForTimeout(100);

    // Verify log is empty
    const countAfter = await logEntries.count();
    expect(countAfter).toBe(0);

    // Verify empty message appears
    await expect(logContainer.getByText(/No interactions yet/i)).toBeVisible();
  });

  test('state panel displays current values correctly', async ({ page }) => {
    const stateSection = page.locator('[class*="stateSection"]');

    // Check all state items are visible
    await expect(stateSection.getByText(/Details Visible:/i)).toBeVisible();
    await expect(stateSection.getByText(/Weight:/i)).toBeVisible();
    await expect(stateSection.getByText(/Optical Size:/i)).toBeVisible();
    await expect(stateSection.getByText(/Hover Position:/i)).toBeVisible();
    await expect(stateSection.getByText(/Drag State:/i)).toBeVisible();

    // Check that values are displayed (numbers for weight/opsz)
    const weightValue = stateSection
      .getByText(/Weight:/i)
      .locator('..')
      .getByText(/\d+\.\d{2}/);
    await expect(weightValue).toBeVisible();

    const opszValue = stateSection
      .getByText(/Optical Size:/i)
      .locator('..')
      .getByText(/\d+\.\d{2}/);
    await expect(opszValue).toBeVisible();
  });

  test('keyboard shortcuts reference displays correctly', async ({ page }) => {
    const shortcutsSection = page.locator('[class*="shortcutsSection"]');

    // Check that all shortcuts are listed
    await expect(
      shortcutsSection.getByText(/Toggle details view/i)
    ).toBeVisible();
    await expect(
      shortcutsSection.getByText(/Toggle debug overlay/i)
    ).toBeVisible();
    await expect(shortcutsSection.getByText(/Show help/i)).toBeVisible();

    // Check that keyboard keys are displayed
    const kbdElements = shortcutsSection.locator('kbd');
    const kbdCount = await kbdElements.count();
    expect(kbdCount).toBeGreaterThan(0);
  });

  test('multiple interactions accumulate in log', async ({ page }) => {
    const logContainer = page.locator('[class*="logContainer"]');
    const logList = logContainer.locator('[class*="logList"]');
    const logEntries = logList.locator('li');

    // Perform multiple interactions
    await page.keyboard.press('d');
    await page.waitForTimeout(50);
    await page.keyboard.press('`');
    await page.waitForTimeout(50);
    await page.keyboard.press('?');
    await page.waitForTimeout(100);

    // Verify multiple log entries exist
    const count = await logEntries.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Verify all three interaction types are logged
    await expect(logContainer.getByText(/Toggled details/i)).toBeVisible();
    await expect(
      logContainer.getByText(/Toggled debug overlay/i)
    ).toBeVisible();
    await expect(logContainer.getByText(/Showed help/i)).toBeVisible();
  });
});
