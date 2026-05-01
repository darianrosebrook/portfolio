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
 * Browser scope: chromium only. The font rasterisation differs across
 * browsers in ways that aren't useful signal here; if cross-browser
 * coverage matters later, add the projects then.
 *
 * Baselines live next to this file under `feature-overlay.spec.ts-snapshots/`.
 * To regenerate after an intentional rendering change: `npm run test:e2e:update`.
 */

const TYPOGRAPHY_PATH = '/blueprints/foundations/typography';
const VIEWPORT = { width: 1280, height: 900 } as const;

async function loadInspector(page: Page) {
  await page.setViewportSize(VIEWPORT);
  await page.goto(TYPOGRAPHY_PATH);
  await page.waitForLoadState('networkidle');
  // Wait for fonts so the glyph rendering is final.
  await page.waitForFunction(() => document.fonts.ready);
  // Disable animations / transitions to avoid mid-tween screenshots, AND
  // hide the page-level header. The canvas has a transparent background;
  // when Playwright scrolls the locator into view, the page nav (which has
  // a continuously-animating decorative SVG) bleeds through and produces
  // diffs unrelated to the highlight rendering.
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
  // Symbol canvas must be present and sized before we can sample it.
  await page.waitForSelector('[data-testid="symbol-canvas"]', {
    state: 'visible',
  });
  // Give the inspector a beat to compute the geometry cache and run
  // detection. The canvas paints on a requestAnimationFrame cadence;
  // 400ms covers the full pipeline at default speeds.
  await page.waitForTimeout(400);
}

async function pickGlyph(page: Page, char: string) {
  // The symbol grid renders one button per Unicode glyph. Match by
  // accessible name OR exact text — the symbol-selector buttons are
  // `<button>{char}</button>` with a stable class. Filter on the class
  // to avoid colliding with anatomy-control switch labels (e.g., "h" in
  // "Cap height").
  const button = page
    .locator('button[class*="symbolSelectorButton"]')
    .filter({ hasText: new RegExp(`^${char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) })
    .first();
  await button.click();
  // Wait for the React state update + canvas re-render.
  await page.waitForTimeout(300);
}

async function toggleSwitch(page: Page, name: string) {
  // The Switch component renders `<input role="switch">` with the visible
  // label as its accessible name. Use exact: true because Playwright's
  // default substring match collides on toggle names that share a token
  // (e.g. 'Tail' was matching both 'Tail' and 'Show Details' on at least
  // one render path — likely an aria-describedby cross-reference).
  const sw = page.getByRole('switch', { name, exact: true });
  await sw.click();
  await page.waitForTimeout(300);
}

async function enableFeature(page: Page, char: string, feature: string) {
  await pickGlyph(page, char);
  await toggleSwitch(page, 'Show Details');
  await toggleSwitch(page, feature);
  // Final settle before screenshot — the canvas paints on a
  // requestAnimationFrame cadence, and the detection pipeline runs
  // asynchronously when selectedAnatomy changes.
  await page.waitForTimeout(500);
}

async function selectFont(page: Page, name: string) {
  // The font picker is a native `<select>` whose options are rendered
  // from FontInspector's `fonts` state. Switching by visible text is
  // robust against re-ordering. After the switch, fontkit reloads the
  // glyph cache AND the per-glyph hint system recomputes available
  // toggles; 1500ms is the empirically-stable wait in the trace viewer.
  // Shorter waits race the toggle re-render and produce flaky
  // "switch with name 'X' not found" errors.
  const select = page.locator('select').first();
  await select.selectOption({ label: name });
  await page.waitForTimeout(1500);
}

async function screenshotCanvas(page: Page, name: string) {
  // Park the cursor at (0,0). The canvas draws a hover reticle that floats
  // with the mouse position, which makes screenshots non-deterministic
  // run-to-run if the cursor lingers over the canvas. Moving outside the
  // viewport guarantees the reticle is suppressed.
  await page.mouse.move(0, 0);
  await page.waitForTimeout(150);

  const canvas = page.locator('[data-testid="symbol-canvas"]');
  await expect(canvas).toHaveScreenshot(name, {
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
    // Toggle label moved from 'Crossbar' to 'Bar' when the inspector
    // switched to JSON-driven toggles (anatomy.json names the feature
    // 'Bar'). Detector and rendered output are unchanged so the baseline
    // filename stays nohemi-H-crossbar.png.
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

  test('e + Counter: lower counter region', async ({ page }) => {
    await loadInspector(page);
    await enableFeature(page, 'e', 'Counter');
    await screenshotCanvas(page, 'nohemi-e-counter.png');
  });

  test('e + Aperture: enclosed gap rectangle', async ({ page }) => {
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

// Serif / finial / spur visual baselines deferred:
// - Serif: the inspector gates the toggle behind ctx.isSerif, which
//   uses a "fontName contains 'serif'" heuristic. Newsreader's name
//   doesn't contain that substring so the toggle is hidden even on a
//   visibly-serifed font. Fixing the heuristic is a separate change.
// - Finial: glyphFeatureHints.ts has no `finial` entry on any glyph,
//   so the toggle never renders.
// - Spur: hints exist only for G/S; detection never fires on those
//   in the loaded fonts. Inter b detects but has no spur hint.
//
// Region wiring for these three is exercised by:
//   1. unit tests against buildProjectionPolygon (utils/.../projectionRegion.test.ts),
//   2. region polygon assertions in feature-accuracy.test.ts ("attaches a
//      polygon to every Newsreader L serif instance, when one fires" and
//      "produces a stroke projection region whenever finial fires on Newsreader s"),
//   3. mutation probe D2 (buildProjectionPolygon → []).
// When the hint system or isSerif heuristic is broadened, add visual
// baselines for the relevant letter-feature pairs.
