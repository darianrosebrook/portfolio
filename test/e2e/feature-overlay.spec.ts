import { test, expect, type Page } from '@playwright/test';

/**
 * Visual regression for the FontInspector region-based highlight overlay.
 *
 * Each test loads the typography page, picks a glyph, toggles "Show
 * Details" + the feature in question, and screenshots ONLY the symbol
 * canvas. The canvas is the deterministic output of:
 *   font + glyph + feature → buildGeometryCache + detectFeature → region
 *   polygon → drawClippedGlyphRegion / drawEnclosedRegion
 *
 * If any step in that chain regresses, the screenshot will diff. This is
 * the layer above the unit tests (which check polygon properties) — it
 * catches coordinate-space bugs, defs-not-mounted bugs, and any other
 * "polygon was right but the renderer drew it wrong" failure mode.
 *
 * Browser projects and screenshot tolerances come from playwright.config.ts.
 * Correct anatomy and effective axis labels are verified before regenerating
 * a baseline; an image diff is not permission to retain a known wrong region.
 *
 * Baselines live next to this file under `feature-overlay.spec.ts-snapshots/`.
 * To regenerate after an intentional rendering change: `npm run test:e2e:update`.
 */

const TYPOGRAPHY_PATH = '/blueprints/foundations/typography';
const VIEWPORT = { width: 1280, height: 900 } as const;

const inspector = (page: Page) =>
  page.locator('[data-ds-component="FontInspector"]');
const symbolCanvas = (page: Page) =>
  inspector(page).getByTestId('symbol-canvas');
const renderedAxes: Record<string, string> = {
  Nohemi: 'Weight 400.00',
  Newsreader: 'Weight 400.00 | Optical Size 32.00',
};

async function observeCanvasDraws(page: Page) {
  // Observe the real drawing boundary. These test-only attributes do not
  // alter drawing arguments, canvas pixels, or the production components.
  await page.addInitScript(() => {
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    const text = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.dataset.testid === 'symbol-canvas') {
        this.canvas.dataset.e2eFrame = String(
          Number(this.canvas.dataset.e2eFrame ?? 0) + 1
        );
        this.canvas.dataset.e2eAxes = '';
      }
      return clear.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      if (
        this.canvas.dataset.testid === 'symbol-canvas' &&
        /^Weight /.test(args[0])
      ) {
        this.canvas.dataset.e2eAxes = args[0];
      }
      return text.apply(this, args);
    };
  });
}

async function frameNumber(page: Page) {
  return Number((await symbolCanvas(page).getAttribute('data-e2e-frame')) ?? 0);
}

async function waitForFreshFrame(page: Page, previous: number) {
  await expect.poll(() => frameNumber(page)).toBeGreaterThan(previous);
}

async function waitForInspector(page: Page, name?: string, char?: string) {
  const scope = inspector(page),
    font = scope.getByRole('combobox', { name: 'Font', exact: true });
  const current =
    name ??
    (await font.locator('option:checked').textContent())?.replace(
      / \(.*\)$/,
      ''
    );
  expect(current).toBeDefined();
  if (!current || !renderedAxes[current])
    throw new Error(`Unexpected inspector font: ${current}`);
  await expect(font.locator('option:checked')).toHaveText(current);
  const preview = scope.locator('button[title="Copy Glyph"]');
  await expect(preview).toBeEnabled();
  await expect(preview).not.toHaveText('—');
  if (char) {
    await expect(preview).toHaveText(char);
    await expect(scope.locator('.idUnicode')).toHaveText(
      `U+${char.codePointAt(0)!.toString(16).toUpperCase()}`
    );
  }
  const canvas = symbolCanvas(page);
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-e2e-axes', renderedAxes[current]);
  await expect
    .poll(() =>
      canvas.evaluate((element) => (element as HTMLCanvasElement).width)
    )
    .toBeGreaterThan(0);
  await expect
    .poll(() =>
      canvas.evaluate((element) => (element as HTMLCanvasElement).height)
    )
    .toBeGreaterThan(0);
}

async function loadInspector(page: Page) {
  await observeCanvasDraws(page);
  await page.setViewportSize(VIEWPORT);
  await page.goto(TYPOGRAPHY_PATH);
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    header, nav, footer,
    [role="banner"], [role="navigation"], [role="contentinfo"],
    [class*="SlinkyCursor"], [class*="slinkyCursor"], [class*="cursorFollower"] {
      visibility: hidden !important;
    }`,
  });
  await waitForInspector(page, 'Nohemi', 'A');
}

async function pickGlyph(page: Page, char: string) {
  const previous = await frameNumber(page);
  const button = inspector(page)
    .locator('button[class*="symbolSelectorButton"]')
    .filter({
      hasText: new RegExp(`^${char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
    });
  await button.click();
  await waitForInspector(page, undefined, char);
  await waitForFreshFrame(page, previous);
}

async function enableSwitch(page: Page, name: string) {
  const sw = inspector(page).getByRole('switch', { name, exact: true });
  const previous = await frameNumber(page),
    wasChecked = await sw.isChecked();
  await sw.setChecked(true);
  await expect(sw).toBeChecked();
  if (!wasChecked) await waitForFreshFrame(page, previous);
}

async function enableFeature(page: Page, char: string, feature: string) {
  await pickGlyph(page, char);
  await enableSwitch(page, 'Show Details');
  await enableSwitch(page, feature);
  await waitForInspector(page, undefined, char);
}

async function selectFont(page: Page, name: string) {
  const select = inspector(page).getByRole('combobox', {
    name: 'Font',
    exact: true,
  });
  await expect
    .poll(() => select.locator('option').allTextContents())
    .toContain(name);
  const previous = await frameNumber(page);
  await select.selectOption({ label: name });
  await waitForInspector(page, name);
  await waitForFreshFrame(page, previous);
}

async function screenshotCanvas(page: Page, name: string) {
  await page.mouse.move(0, 0);
  await waitForInspector(page);
  // Playwright requires consecutive stable captures; no timing estimate is
  // substituted for the current glyph and the actual supported axis labels.
  await expect(symbolCanvas(page)).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
  });
}

test.describe('Feature highlight overlay (Nohemi)', () => {
  // The default font is Nohemi; no font-switch UI interaction needed.

  test('i + Tittle: square contour, not circle', async ({ page }) => {
    await loadInspector(page);
    await enableFeature(page, 'i', 'Tittle');
    await screenshotCanvas(page, 'nohemi-i-tittle.png');
  });

  test('H + Stem: two vertical stem regions', async ({ page }) => {
    await loadInspector(page);
    await enableFeature(page, 'H', 'Stem');
    await screenshotCanvas(page, 'nohemi-H-stem.png');
  });

  test('H + Bar: horizontal bar between stems', async ({ page }) => {
    // The canonical toggle is Bar; the established baseline name is retained.
    await loadInspector(page);
    await enableFeature(page, 'H', 'Bar');
    await screenshotCanvas(page, 'nohemi-H-crossbar.png');
  });

  test('O + Bowl: traced bowl outline', async ({ page }) => {
    await loadInspector(page);
    await enableFeature(page, 'O', 'Bowl');
    await screenshotCanvas(page, 'nohemi-O-bowl.png');
  });

  test('O + Counter: enclosed counter polygon', async ({ page }) => {
    await loadInspector(page);
    await enableFeature(page, 'O', 'Counter');
    await screenshotCanvas(page, 'nohemi-O-counter.png');
  });

  test('e + Eye: enclosed eye region', async ({ page }) => {
    await loadInspector(page);
    await enableFeature(page, 'e', 'Eye');
    await screenshotCanvas(page, 'nohemi-e-eye.png');
  });

  test('e + Counter: enclosed upper eye, excluding the open lower space', async ({
    page,
  }) => {
    await loadInspector(page);
    await enableFeature(page, 'e', 'Counter');
    await screenshotCanvas(page, 'nohemi-e-counter.png');
  });

  test('e + Aperture: local empty mouth between its actual lips', async ({
    page,
  }) => {
    await loadInspector(page);
    await enableFeature(page, 'e', 'Aperture');
    await screenshotCanvas(page, 'nohemi-e-aperture.png');
  });
});

test.describe('Feature highlight overlay (Newsreader corridors and projections)', () => {
  // Newsreader has serifs and curving strokes, exercising the corridor
  // and projection region builders. Each test switches font first.

  test('S + Spine: stroke corridor along the S-curve', async ({ page }) => {
    await loadInspector(page);
    await selectFont(page, 'Newsreader');
    await enableFeature(page, 'S', 'Spine');
    await screenshotCanvas(page, 'newsreader-S-spine.png');
  });

  test('Q + Tail: descending stroke corridor', async ({ page }) => {
    await loadInspector(page);
    await selectFont(page, 'Newsreader');
    await enableFeature(page, 'Q', 'Tail');
    await screenshotCanvas(page, 'newsreader-Q-tail.png');
  });

  test('g + Loop: closed corridor around lower bowl', async ({ page }) => {
    await loadInspector(page);
    await selectFont(page, 'Newsreader');
    await enableFeature(page, 'g', 'Loop');
    await screenshotCanvas(page, 'newsreader-g-loop.png');
  });

  test('g + Ear: top-right projection region', async ({ page }) => {
    await loadInspector(page);
    await selectFont(page, 'Newsreader');
    await enableFeature(page, 'g', 'Ear');
    await screenshotCanvas(page, 'newsreader-g-ear.png');
  });
});

test.describe('Feature highlight overlay (Newsreader terminal projections)', () => {
  test('Newsreader H + Serif: 4 foot + 4 cap projections', async ({ page }) => {
    await loadInspector(page);
    await selectFont(page, 'Newsreader');
    await enableFeature(page, 'H', 'Serif');
    await screenshotCanvas(page, 'newsreader-H-serif.png');
  });

  test('Newsreader s + Finial: source-bound non-serif terminal regions', async ({
    page,
  }) => {
    await loadInspector(page);
    await selectFont(page, 'Newsreader');
    await enableFeature(page, 's', 'Finial');
    await screenshotCanvas(page, 'newsreader-s-finial.png');
  });
});
