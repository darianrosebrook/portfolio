/** Browser contracts for the loaded Nohemi inspector and its real interactions. */
import { test, expect, type Locator, type Page } from '@playwright/test';

const inspectorSVG = (page: Page) => page.locator('svg.interactiveSvg');
const stateRow = (page: Page, label: string) =>
  page
    .locator('[class*="stateSection"]')
    .getByText(label, { exact: true })
    .locator('..');

async function requiredBounds(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, 'the interaction target must have layout bounds').not.toBeNull();
  if (!box) throw new Error('Missing required interaction target bounds');
  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);
  return box;
}

async function focusInspector(page: Page) {
  const svg = inspectorSVG(page);
  await svg.focus();
  await expect(svg).toBeFocused();
  return svg;
}

test.describe('FontInspector SVG Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/interaction-test');
    // The interactive SVG and its real outline mount after Fontkit has loaded
    // the current glyph. CSS font readiness does not establish that state.
    const svg = inspectorSVG(page);
    await expect(svg).toBeVisible();
    await expect(svg.locator('#glyph path')).toHaveAttribute('d', /[MLCQ]/);
    await expect(stateRow(page, 'Weight:')).toHaveText(/^Weight:\s*400\.00$/);
    await expect(
      page
        .locator('[class*="stateSection"]')
        .getByText('Optical Size:', { exact: true })
    ).toHaveCount(0);
    await requiredBounds(svg);
  });

  test('page loads and displays all sections', async ({ page }) => {
    for (const name of [
      'Interaction Test Suite',
      'SVG Canvas',
      'Interaction Log',
      'Current State',
      'Keyboard Shortcuts',
      'Pointer Event Test',
    ]) {
      await expect(
        page.getByRole('heading', { name, exact: true })
      ).toBeVisible();
    }
  });

  test('keyboard shortcut d toggles real details and state', async ({
    page,
  }) => {
    const svg = await focusInspector(page),
      details = svg.locator('#details');
    await expect(stateRow(page, 'Details Visible:')).toHaveText(
      /^Details Visible:\s*No$/
    );
    await expect(details).toHaveCount(0);
    await svg.press('d');
    await expect(stateRow(page, 'Details Visible:')).toHaveText(
      /^Details Visible:\s*Yes$/
    );
    await expect(details).toBeVisible();
    await expect(details.locator('use').first()).toBeVisible();
    await svg.press('d');
    await expect(stateRow(page, 'Details Visible:')).toHaveText(
      /^Details Visible:\s*No$/
    );
    await expect(details).toHaveCount(0);
  });

  test('keyboard shortcut backtick toggles the actual debug layer', async ({
    page,
  }) => {
    const svg = await focusInspector(page),
      debug = svg.locator('#debug');
    await expect(debug).toHaveCount(0);
    await svg.press('`');
    await expect(debug).toBeVisible();
    await expect(debug).toContainText('Debug Info');
    await svg.press('`');
    await expect(debug).toHaveCount(0);
  });

  test('help shortcuts open real instructions and Close help dismisses them', async ({
    page,
  }) => {
    const svg = await focusInspector(page);
    const help = page.getByRole('region', {
      name: 'Font inspector shortcuts',
      exact: true,
    });
    await expect(help).not.toBeVisible();
    await svg.press('?');
    await expect(help).toBeVisible();
    await expect(help.locator('li')).toHaveText([
      'D: toggle glyph details.',
      'Backtick or tilde: toggle the debug overlay.',
      '?: show or hide this help.',
      'Drag horizontally to adjust weight.',
    ]);
    await help.getByRole('button', { name: 'Close help', exact: true }).click();
    await expect(help).not.toBeVisible();
    await expect(svg).toBeFocused();
    await focusInspector(page);
    await svg.press('Shift+/');
    await expect(help).toBeVisible();
    await focusInspector(page);
    await svg.press('Shift+/');
    await expect(help).not.toBeVisible();
  });

  test('horizontal dragging clamps the supported weight from 400 to 900', async ({
    page,
  }) => {
    const svg = inspectorSVG(page),
      box = await requiredBounds(svg);
    await expect(stateRow(page, 'Weight:')).toHaveText(/^Weight:\s*400\.00$/);
    await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + (box.width * 3) / 4, box.y + box.height / 2, {
      steps: 10,
    });
    await page.mouse.up();
    await expect(stateRow(page, 'Weight:')).toHaveText(/^Weight:\s*900\.00$/);
    await expect(svg.getByLabel('Axis values')).toHaveText('Weight 900.00');
    await expect(
      page
        .locator('[class*="stateSection"]')
        .getByText('Optical Size:', { exact: true })
    ).toHaveCount(0);
  });

  test('pointer events in the test area report the measured local center', async ({
    page,
  }) => {
    const area = page.locator('[class*="pointerArea"]'),
      box = await requiredBounds(area);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(stateRow(page, 'Hover Position:')).toHaveText(
      new RegExp(
        `^Hover Position:\\s*${Math.round(box.width / 2)},\\s*${Math.round(box.height / 2)}$`
      )
    );
  });

  test('pointer drag feedback follows the measured start and end', async ({
    page,
  }) => {
    const area = page.locator('[class*="pointerArea"]'),
      box = await requiredBounds(area);
    const start = { x: box.width / 4, y: box.height / 4 },
      end = { x: (box.width * 3) / 4, y: (box.height * 3) / 4 };
    await page.mouse.move(box.x + start.x, box.y + start.y);
    await page.mouse.down();
    await page.mouse.move(box.x + end.x, box.y + end.y, { steps: 5 });
    const line = area.locator('svg line');
    await expect(line).toBeVisible();
    await expect(stateRow(page, 'Drag State:')).toHaveText(
      /^Drag State:\s*Active$/
    );
    for (const [attribute, expected] of Object.entries({
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
    })) {
      await expect
        .poll(async () =>
          Math.abs(Number(await line.getAttribute(attribute)) - expected)
        )
        .toBeLessThanOrEqual(1);
    }
    await page.mouse.up();
    await expect(line).toHaveCount(0);
    await expect(stateRow(page, 'Drag State:')).toHaveText(
      /^Drag State:\s*Inactive$/
    );
    const log = page.locator('[class*="logContainer"]');
    await expect(log.getByText(/Pointer down at/)).toBeVisible();
    await expect(log.getByText(/Pointer up/)).toBeVisible();
  });

  test('clear log button clears recorded interactions', async ({ page }) => {
    const svg = await focusInspector(page);
    await svg.press('d');
    await svg.press('`');
    const log = page.locator('[class*="logContainer"]'),
      entries = log.locator('li');
    await expect(entries).toHaveCount(2);
    await page.getByRole('button', { name: 'Clear Log', exact: true }).click();
    await expect(entries).toHaveCount(0);
    await expect(
      log.getByText('No interactions yet...', { exact: true })
    ).toBeVisible();
  });

  test('state panel shows effective Nohemi values and idle pointer state', async ({
    page,
  }) => {
    await expect(stateRow(page, 'Details Visible:')).toHaveText(
      /^Details Visible:\s*No$/
    );
    await expect(stateRow(page, 'Weight:')).toHaveText(/^Weight:\s*400\.00$/);
    await expect(stateRow(page, 'Hover Position:')).toHaveText(
      /^Hover Position:\s*None$/
    );
    await expect(stateRow(page, 'Drag State:')).toHaveText(
      /^Drag State:\s*Inactive$/
    );
    await expect(
      page
        .locator('[class*="stateSection"]')
        .getByText('Optical Size:', { exact: true })
    ).toHaveCount(0);
  });

  test('keyboard reference lists the implemented shortcuts', async ({
    page,
  }) => {
    const reference = page.locator('[class*="shortcutsSection"]');
    await expect(reference.getByText(/Toggle details view/)).toBeVisible();
    await expect(
      reference.getByText('Toggle debug overlay', { exact: true })
    ).toBeVisible();
    await expect(
      reference.getByText('Show or hide keyboard help', { exact: true })
    ).toBeVisible();
    await expect(reference.locator('kbd')).toHaveText(['d', '`', '~', '?']);
    await expect(reference.getByText(/placeholder|Zoom|Pan/)).toHaveCount(0);
  });

  test('distinct keyboard actions accumulate once each in the log', async ({
    page,
  }) => {
    const svg = await focusInspector(page);
    await svg.press('d');
    await svg.press('`');
    await svg.press('?');
    const log = page.locator('[class*="logContainer"]');
    await expect(log.locator('li')).toHaveCount(3);
    await expect(log.getByText(/Keyboard: Toggled details/)).toBeVisible();
    await expect(
      log.getByText(/Keyboard: Toggled debug overlay/)
    ).toBeVisible();
    await expect(log.getByText(/Keyboard: Showed help/)).toBeVisible();
    await expect(svg.locator('#details')).toBeVisible();
    await expect(svg.locator('#debug')).toBeVisible();
    await expect(
      page.getByRole('region', {
        name: 'Font inspector shortcuts',
        exact: true,
      })
    ).toBeVisible();
  });
});
