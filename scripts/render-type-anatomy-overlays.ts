import * as fs from 'node:fs';
import * as path from 'node:path';
import * as fontkit from 'fontkit';
import { chromium } from 'playwright';
import type { Font, Glyph } from 'fontkit';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { detectFeature } from '@/utils/typeAnatomy/detectorRegistry';
import type {
  FeatureID,
  FeatureInstance,
  FeatureShape,
} from '@/utils/typeAnatomy/types';

const OUT_DIR = path.join(process.cwd(), 'tmp', 'type-anatomy-overlays');
const FONT_NAME = 'Nohemi-VF.ttf';

type OverlayCase = {
  char: string;
  featureId: FeatureID;
  label: string;
  expected: 'pass' | 'known-gap';
};

const CASES: OverlayCase[] = [
  { char: 'H', featureId: 'stem', label: 'H stems', expected: 'pass' },
  { char: 'e', featureId: 'eye', label: 'e eye', expected: 'pass' },
  { char: 'Q', featureId: 'tail', label: 'Q tail', expected: 'pass' },
  { char: 'S', featureId: 'spine', label: 'S spine', expected: 'pass' },
  {
    char: 'i',
    featureId: 'tittle',
    label: 'i tittle',
    expected: 'pass',
  },
  {
    char: 'H',
    featureId: 'tittle',
    label: 'H tittle (negative)',
    expected: 'pass',
  },
  {
    char: 'H',
    featureId: 'crossbar',
    label: 'H crossbar',
    expected: 'pass',
  },
  {
    char: 'A',
    featureId: 'crossbar',
    label: 'A crossbar',
    expected: 'pass',
  },
];

function loadFont(): Font {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', FONT_NAME);
  const buffer = fs.readFileSync(fontPath);
  return fontkit.create(buffer as unknown as Uint8Array) as Font;
}

function glyphFor(font: Font, char: string): Glyph {
  const codePoint = char.codePointAt(0);
  if (!codePoint) throw new Error(`Missing code point for ${char}`);
  return font.glyphForCodePoint(codePoint) as Glyph;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pointsAttr(points: Array<{ x: number; y: number }>): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

function renderShape(shape: FeatureShape, index: number): string {
  const color = ['#d7263d', '#1b998b', '#f46036', '#2e86ab'][index % 4];

  switch (shape.type) {
    case 'circle':
      return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${color}" fill-opacity="0.35" stroke="${color}" stroke-width="24" vector-effect="non-scaling-stroke" />`;
    case 'line':
      return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" stroke="${color}" stroke-width="42" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
    case 'path':
      return `<path d="${escapeHtml(shape.d)}" fill="none" stroke="${color}" stroke-width="36" stroke-linejoin="round" vector-effect="non-scaling-stroke" />`;
    case 'point':
      return `<circle cx="${shape.x}" cy="${shape.y}" r="42" fill="${color}" stroke="#fff" stroke-width="12" vector-effect="non-scaling-stroke" />`;
    case 'polyline':
      return `<polyline points="${pointsAttr(shape.points)}" fill="none" stroke="${color}" stroke-width="42" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />`;
    case 'rect':
      return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${color}" fill-opacity="0.28" stroke="${color}" stroke-width="24" vector-effect="non-scaling-stroke" />`;
  }
}

function renderOverlaySvg(
  testCase: OverlayCase,
  glyph: Glyph,
  instances: FeatureInstance[]
): string {
  const bbox = glyph.bbox;
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  const pad = Math.max(width, height) * 0.08;
  const viewBox = [
    bbox.minX - pad,
    -bbox.maxY - pad,
    width + pad * 2,
    height + pad * 2,
  ].join(' ');
  const glyphPath = glyph.path.toSVG();
  const overlays = instances
    .map((instance, index) => renderShape(instance.shape, index))
    .join('\n      ');
  const baseline = 0;
  const metricStroke = '#8b8b8b';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="${viewBox}" role="img" aria-label="${escapeHtml(testCase.label)} overlay">
  <rect x="${bbox.minX - pad}" y="${-bbox.maxY - pad}" width="${width + pad * 2}" height="${height + pad * 2}" fill="#fbfaf7" />
  <g transform="scale(1 -1)">
    <line x1="${bbox.minX - pad}" y1="${baseline}" x2="${bbox.maxX + pad}" y2="${baseline}" stroke="${metricStroke}" stroke-width="16" stroke-dasharray="42 34" vector-effect="non-scaling-stroke" />
    <path d="${escapeHtml(glyphPath)}" fill="#202020" fill-opacity="0.13" stroke="#202020" stroke-width="16" vector-effect="non-scaling-stroke" />
    ${overlays || '<!-- No detected feature instances -->'}
  </g>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="${Math.max(width, height) * 0.055}" fill="#202020">
    <text x="${bbox.minX - pad * 0.8}" y="${-bbox.maxY - pad * 0.35}">${escapeHtml(testCase.label)}: ${instances.length} ${testCase.featureId}</text>
    <text x="${bbox.minX - pad * 0.8}" y="${-bbox.maxY + pad * 0.25}" fill="${testCase.expected === 'pass' ? '#1b735f' : '#a94610'}">${testCase.expected}</text>
  </g>
</svg>`;
}

function pageHtml(svg: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        background: #f0eee8;
      }
      body {
        min-height: 100vh;
        display: grid;
        place-items: center;
      }
      svg {
        width: 960px;
        height: 960px;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.14);
        background: #fbfaf7;
      }
    </style>
  </head>
  <body>${svg}</body>
</html>`;
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const font = loadFont();
  const chromePath =
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });
  const page = await browser.newPage({
    viewport: { width: 1100, height: 1100 },
    deviceScaleFactor: 1,
  });
  const manifest: Array<{
    label: string;
    char: string;
    featureId: FeatureID;
    expected: string;
    count: number;
    svg: string;
    png: string;
  }> = [];

  for (const testCase of CASES) {
    const glyph = glyphFor(font, testCase.char);
    const geo = buildGeometryCache(glyph, font);
    const instances = detectFeature(geo, testCase.featureId);
    const slug = `${testCase.char.codePointAt(0)?.toString(16)}-${testCase.featureId}`;
    const svgName = `${slug}.svg`;
    const pngName = `${slug}.png`;
    const svgPath = path.join(OUT_DIR, svgName);
    const pngPath = path.join(OUT_DIR, pngName);
    const svg = renderOverlaySvg(testCase, glyph, instances);

    fs.writeFileSync(svgPath, svg);
    await page.setContent(pageHtml(svg), { waitUntil: 'load' });
    await page.screenshot({ path: pngPath, fullPage: true });

    manifest.push({
      label: testCase.label,
      char: testCase.char,
      featureId: testCase.featureId,
      expected: testCase.expected,
      count: instances.length,
      svg: svgPath,
      png: pngPath,
    });
  }

  await browser.close();

  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${manifest.length} overlays to ${OUT_DIR}`);
  console.table(
    manifest.map(({ label, count, expected, png }) => ({
      label,
      count,
      expected,
      png: path.relative(process.cwd(), png),
    }))
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
