import React, { useEffect } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import {
  InspectorProvider,
  useInspector,
} from '@/ui/modules/FontInspector/FontInspector';
import { SymbolCanvas } from '@/ui/modules/FontInspector/SymbolCanvas';
import { SymbolCanvasSVG } from '@/ui/modules/FontInspector/SymbolCanvasSVG';
import { InspectorControls } from '@/ui/modules/FontInspector/InspectorControls';
import { calculateGlyphBounds } from '@/ui/modules/FontInspector/SVGGlyphBounds';
import * as drawing from '@/utils/geometry/drawing';
import { glyphViewport } from '@/ui/modules/FontInspector/viewport';
import {
  featureAnchor,
  drawAnatomyOverlay,
  drawClippedGlyphFeature,
} from '@/utils/geometry/drawing';
import GlyphComparePage from '@/app/dev/glyph-compare/page';
import {
  SVGPathDetails,
  parsePathDetails,
} from '@/ui/modules/FontInspector/SVGPathDetails';
import { SVGDefs } from '@/utils/geometry/svgDefs';
import { createViewportTransform } from '@/utils/geometry/transforms';
import { glyphFor, loadFont } from '@/test/utils/fixtures/fontFixtures';

const query = vi.hoisted(() => ({ value: '' }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(query.value),
}));

let inspector: ReturnType<typeof useInspector>;
let viewportWidth = 640;
let viewportHeight = 480;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let observers: Array<() => void>;
let canvasContext: CanvasRenderingContext2D;

function Harness() {
  const state = useInspector();
  useEffect(() => {
    inspector = state;
  });
  return (
    <>
      <SymbolCanvas />
      <SymbolCanvasSVG />
      <InspectorControls />
    </>
  );
}

function flushFrames() {
  act(() => {
    const queued = [...frames.values()];
    frames.clear();
    for (const callback of queued) callback(0);
  });
}

async function mountInspector() {
  const view = render(
    <React.StrictMode>
      <InspectorProvider>
        <Harness />
      </InspectorProvider>
    </React.StrictMode>
  );
  await waitFor(() => expect(inspector.glyph?.name).toBe('A'));
  await waitFor(() =>
    expect(inspector.fonts.every((font) => font.loadState === 'loaded')).toBe(
      true
    )
  );
  flushFrames();
  return view;
}

function selectFeature(name: string) {
  const feature = inspector.anatomyFeatures.find(
    (candidate) => candidate.feature === name
  );
  expect(feature).toBeDefined();
  act(() => inspector.toggleAnatomy(feature!));
  flushFrames();
}

function expectFiniteCanvasCoordinates() {
  const mocks = canvasContext as unknown as Record<
    string,
    ReturnType<typeof vi.fn>
  >;
  for (const method of [
    'moveTo',
    'lineTo',
    'translate',
    'scale',
    'clearRect',
    'fillRect',
    'strokeRect',
    'rect',
    'arc',
    'ellipse',
    'quadraticCurveTo',
    'bezierCurveTo',
  ]) {
    for (const args of mocks[method].mock.calls) {
      const coordinates = args.filter((value) => typeof value !== 'boolean');
      expect(
        coordinates.every(
          (value) => typeof value === 'number' && Number.isFinite(value)
        ),
        `${method}(${args.join(',')})`
      ).toBe(true);
    }
  }
  for (const method of ['fillText', 'strokeText']) {
    for (const args of mocks[method].mock.calls)
      expect(
        args
          .slice(1, 3)
          .every((value) => typeof value === 'number' && Number.isFinite(value))
      ).toBe(true);
  }
}

function expectFiniteSVG(container: HTMLElement) {
  for (const element of container.querySelectorAll('svg, svg *')) {
    for (const attribute of element.attributes)
      expect(attribute.value).not.toMatch(/NaN|Infinity|undefined/);
  }
}

beforeEach(() => {
  viewportWidth = 640;
  viewportHeight = 480;
  query.value = '';
  frames = new Map();
  nextFrame = 0;
  observers = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        observers.push(callback);
      }
      observe() {}
      disconnect() {}
    }
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: viewportWidth,
      bottom: viewportHeight,
      width: viewportWidth,
      height: viewportHeight,
      toJSON: () => ({}),
    })
  );
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const bytes = await readFile(`${process.cwd()}/public${url}`);
      return {
        ok: true,
        status: 200,
        arrayBuffer: async () =>
          bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength
          ),
      };
    })
  );
  const methods = [
    'save',
    'restore',
    'resetTransform',
    'scale',
    'translate',
    'clearRect',
    'fillRect',
    'strokeRect',
    'createPattern',
    'beginPath',
    'closePath',
    'moveTo',
    'lineTo',
    'quadraticCurveTo',
    'bezierCurveTo',
    'rect',
    'arc',
    'ellipse',
    'fill',
    'stroke',
    'clip',
    'setLineDash',
    'fillText',
    'strokeText',
  ];
  canvasContext = Object.fromEntries(
    methods.map((method) => [method, vi.fn()])
  ) as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    canvasContext
  );
  vi.stubGlobal('PointerEvent', MouseEvent);
  vi.stubGlobal(
    'navigator',
    Object.create(navigator, {
      clipboard: { value: { writeText: vi.fn() }, configurable: true },
    })
  );
  Object.defineProperty(SVGElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(SVGElement.prototype, 'setPointerCapture');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('FontInspector provider and renderer behavior with bundled fonts', () => {
  it.each([
    [0, 900],
    [1, 576],
    [2, 1240],
    [3, 444],
  ])(
    'renders real empty space at font index %s with spacing and finite guides in both renderers',
    async (fontIndex, baseAdvanceWidth) => {
      const view = await mountInspector();
      selectFeature('Stem');
      for (const mock of Object.values(canvasContext))
        if (typeof mock === 'function' && 'mockClear' in mock) mock.mockClear();
      act(() => {
        inspector.setCurrentFont(fontIndex);
        inspector.setGlyphUnicode(0x20);
        inspector.setShowDetails(true);
      });
      flushFrames();
      const glyph = inspector.glyph!;
      expect(inspector.font!.glyphForCodePoint(0x20).advanceWidth).toBe(
        baseAdvanceWidth
      );
      const advanceWidth = inspector
        .font!.getVariation(inspector.axisValues)
        .glyphForCodePoint(0x20).advanceWidth;
      expect(glyph.name).toBe('space');
      expect(glyph.path.commands).toHaveLength(0);
      expect([
        glyph.bbox.minX,
        glyph.bbox.minY,
        glyph.bbox.maxX,
        glyph.bbox.maxY,
      ]).toEqual([Infinity, Infinity, -Infinity, -Infinity]);
      expect(glyph.advanceWidth).toBe(advanceWidth);
      expect([...inspector.detectedFeatures.values()].flat()).toEqual([]);
      expect(calculateGlyphBounds(glyph)).toBeNull();
      const viewport = glyphViewport(
        viewportWidth,
        viewportHeight,
        inspector.fontInstance!,
        glyph
      )!;
      expect(viewport.scale).toBeGreaterThan(0);
      expect(Object.values(viewport).every(Number.isFinite)).toBe(true);
      expect(view.container.querySelector('#glyph path')).toBeNull();
      expect(view.container.querySelector('#lsb-markers')).toBeNull();
      expect(view.container.querySelector('#rsb-markers')).toBeNull();
      expect(view.container.querySelector('#glyph-bounds')).toBeNull();
      const advance = view.container.querySelector('#advance-width')!;
      expect(advance.textContent).toBe(
        `Advance Width ${advanceWidth.toFixed(2)}`
      );
      const expectedOrigin = viewport.xOffset;
      const expectedEnd = viewport.xOffset + advanceWidth * viewport.scale;
      const expectedY =
        viewport.baseline -
        inspector.geometryCache!.metrics.descent * viewport.scale;
      expect(advance.querySelector('path')).toHaveAttribute(
        'd',
        `M${expectedOrigin} ${expectedY + 4}V${expectedY + 12}M${expectedEnd} ${expectedY + 4}V${expectedY + 12}M${expectedOrigin} ${expectedY + 8}H${expectedEnd}`
      );
      expect(canvasContext.fillText).toHaveBeenCalledWith(
        `Advance Width ${advanceWidth.toFixed(2)}`,
        (expectedOrigin + expectedEnd) / 2,
        expectedY + 28
      );
      expect(
        vi
          .mocked(canvasContext.fillText)
          .mock.calls.some(([label]) => String(label).includes('Side Bearing'))
      ).toBe(false);
      expect(
        view.container.querySelector('[id="metric-Baseline"] line')
      ).not.toBeNull();
      expect(
        view.container.querySelector('[id="metric-X-height"] line')
      ).not.toBeNull();
      expectFiniteSVG(view.container);
      expectFiniteCanvasCoordinates();
      expect(screen.getByTitle('Copy Name')).toHaveTextContent('space');
      fireEvent.click(screen.getByTitle('Copy Glyph'));
      expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(' ');
    }
  );

  it('shows real keyboard help for shifted question mark and preserves browser modifier shortcuts', async () => {
    const view = await mountInspector();
    const svg = view.container.querySelector('svg[aria-labelledby]')!;
    expect(svg).not.toBeNull();
    fireEvent.keyDown(svg, { key: 'd', ctrlKey: true });
    expect(inspector.showDetails).toBe(false);
    fireEvent.keyDown(svg, { key: '?', shiftKey: true });
    const help = screen.getByRole('region', {
      name: 'Font inspector shortcuts',
    });
    expect(help).toHaveTextContent('toggle glyph details');
    expect(help).toHaveTextContent('adjust weight');
    expect(help).not.toHaveTextContent('placeholder');
    fireEvent.click(screen.getByRole('button', { name: 'Close help' }));
    expect(
      screen.queryByRole('region', { name: 'Font inspector shortcuts' })
    ).toBeNull();
    expect(document.activeElement).toBe(svg);
    fireEvent.keyDown(svg, { key: '~', shiftKey: true });
    expect(view.container.querySelector('#debug')).not.toBeNull();
    const browserZoom = new KeyboardEvent('keydown', {
      key: '=',
      ctrlKey: true,
      cancelable: true,
      bubbles: true,
    });
    expect(svg.dispatchEvent(browserZoom)).toBe(true);
    expect(browserZoom.defaultPrevented).toBe(false);
  });

  it('preserves actual lowercase glyph identifiers when displaying and copying names', async () => {
    await mountInspector();
    act(() => inspector.setGlyphUnicode(0x69));
    flushFrames();
    expect(inspector.glyph!.name).toBe('i');
    expect(screen.getByTitle('Copy Name').textContent).toBe(
      inspector.glyph!.name
    );
    fireEvent.click(screen.getByTitle('Copy Name'));
    expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith('i');
  });

  it('draws only finite metric coordinates after toggling a nonmetric feature and refuses invalid helper inputs', async () => {
    const metric = vi.spyOn(drawing, 'drawMetricLine');
    const view = await mountInspector();
    metric.mockClear();
    selectFeature('Stem');
    expect(metric).toHaveBeenCalled();
    for (const [, width, y, label] of metric.mock.calls) {
      expect(Number.isFinite(width)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
      expect([
        'Baseline',
        'Cap height',
        'X-height',
        'Ascender',
        'Descender',
      ]).toContain(label);
    }
    expectFiniteSVG(view.container);
    expectFiniteCanvasCoordinates();
    const before = vi.mocked(canvasContext.moveTo).mock.calls.length;
    drawing.drawMetricLine(
      canvasContext,
      viewportWidth,
      NaN,
      'Stem',
      'top',
      inspector.colors
    );
    drawing.drawMetricLine(
      canvasContext,
      Infinity,
      0,
      'Baseline',
      'top',
      inspector.colors
    );
    expect(vi.mocked(canvasContext.moveTo).mock.calls).toHaveLength(before);
    expect(
      glyphViewport(
        Infinity,
        viewportHeight,
        inspector.fontInstance!,
        inspector.glyph!
      )
    ).toBeNull();
  });
  it('renders selected current stem geometry in both detail modes despite the registry selected flag', async () => {
    const view = await mountInspector();
    const stem = inspector.anatomyFeatures.find(
      (feature) => feature.feature === 'Stem'
    )!;
    expect(stem.selected).toBe(false);
    selectFeature('Stem');
    const instances = inspector.detectedFeatures.get('stem')!;
    expect(instances.length).toBe(2);
    expect(
      view.container.querySelector('circle[aria-label="Stem"]')
    ).toBeVisible();
    const anchor = featureAnchor(instances[0])!;
    const viewport = glyphViewport(
      viewportWidth,
      viewportHeight,
      inspector.fontInstance!,
      inspector.glyph!
    )!;
    expect(canvasContext.arc).toHaveBeenCalledWith(
      anchor.x * viewport.scale,
      -anchor.y * viewport.scale,
      4,
      0,
      Math.PI * 2
    );
    vi.mocked(canvasContext.clip).mockClear();
    act(() => inspector.setShowDetails(true));
    flushFrames();
    const highlights = view.container.querySelectorAll(
      'path[aria-label="Stem highlight"]'
    );
    expect(highlights.length).toBe(2);
    expect(canvasContext.clip).toHaveBeenCalledTimes(2);
    expect(canvasContext.moveTo).toHaveBeenCalledWith(
      instances[0].region!.points[0].x * viewport.scale,
      0 - instances[0].region!.points[0].y * viewport.scale
    );
    expect(
      [...highlights].map((path) => path.getAttribute('fill-rule'))
    ).toEqual(['nonzero', 'nonzero']);
    const expectedPoints = instances[0]
      .region!.points.map(
        (point) =>
          `${point.x * viewport.scale + viewport.xOffset},${viewport.baseline - point.y * viewport.scale}`
      )
      .join(' ');
    expect(
      view.container.querySelector('clipPath[id*="Stem-0"] polygon')
    ).toHaveAttribute('points', expectedPoints);
    selectFeature('Stem');
    expect(
      view.container.querySelectorAll('path[aria-label="Stem highlight"]')
        .length
    ).toBe(0);
    expect(inspector.detectedFeatures.has('stem')).toBe(false);
  });

  it('withdraws unavailable apex geometry after changing A to B without fabricating an extreme marker', async () => {
    const view = await mountInspector();
    selectFeature('Apex');
    expect(inspector.detectedFeatures.get('apex')?.length).toBe(1);
    expect(
      view.container.querySelector('circle[aria-label="Apex"]')
    ).toBeVisible();
    vi.mocked(canvasContext.fillText).mockClear();
    act(() => inspector.setGlyphUnicode(0x42));
    flushFrames();
    expect(inspector.glyph?.name).toBe('B');
    expect(inspector.detectedFeatures.has('apex')).toBe(false);
    expect(
      view.container.querySelector('circle[aria-label="Apex"]')
    ).toBeNull();
    expect(
      vi
        .mocked(canvasContext.fillText)
        .mock.calls.some(([label]) => label === 'Apex')
    ).toBe(false);
    drawAnatomyOverlay(
      canvasContext,
      640,
      480,
      inspector.glyph!,
      1,
      inspector.colors,
      {},
      inspector.selectedAnatomy
    );
    expect(
      vi
        .mocked(canvasContext.fillText)
        .mock.calls.some(([label]) => label === 'Apex')
    ).toBe(false);
  });

  it('clamps supported axes and updates effective detection weight while preserving unsupported glyph and font choices', async () => {
    const view = await mountInspector();
    expect(inspector.axisValues).toEqual({ wght: 400 });
    expect(
      view.container.querySelector('[aria-label="Axis values"]')?.textContent
    ).not.toContain('Optical');
    act(() => inspector.setCurrentFont(2));
    act(() => inspector.setAxisValues({ wght: 900, opsz: 99 }));
    expect(inspector.axisValues.wght).toBe(800);
    expect(inspector.axisValues.opsz).toBeUndefined();
    expect(inspector.detectionContext?.weight).toBe(800);
    expect(inspector.detectionContext).toBe(inspector.geometryCache?.context);
    expect(inspector.detectionContext?.isMono).toBe(true);
    const expectedHeavyGlyph = inspector
      .font!.getVariation(inspector.axisValues)
      .glyphForCodePoint(0x41);
    expect(inspector.glyph!.path.toSVG()).toBe(expectedHeavyGlyph.path.toSVG());
    expect(inspector.glyph!.path.toSVG()).not.toBe(
      inspector
        .font!.getVariation({ ...inspector.axisValues, wght: 200 })
        .glyphForCodePoint(0x41)
        .path.toSVG()
    );
    const svg = view.container.querySelector('svg.interactiveSvg')!;
    fireEvent.pointerDown(svg, { pointerId: 1, clientX: 320, clientY: 100 });
    fireEvent.pointerMove(svg, { pointerId: 1, clientX: -500, clientY: 100 });
    expect(inspector.axisValues.wght).toBe(200);
    expect(inspector.glyph!.path.toSVG()).toBe(
      inspector
        .font!.getVariation(inspector.axisValues)
        .glyphForCodePoint(0x41)
        .path.toSVG()
    );
    fireEvent.pointerUp(svg, { pointerId: 1 });
    act(() => inspector.setCurrentFont(3));
    expect(inspector.axisValues.wght).toBe(200);
    expect(inspector.axisValues.opsz).toBe(32);
    act(() => inspector.setGlyphUnicode(0x1f680));
    expect(inspector.currentFontIndex).toBe(3);
    expect(inspector.glyphUnicode).toBe(0x1f680);
    expect(inspector.glyph).toBeNull();
    expect(inspector.availableFeatureIds).toEqual([]);
    expect(inspector.detectedFeatures.size).toBe(0);
    expect(
      screen.getByText('This font does not contain the selected glyph')
    ).toBeVisible();
  });

  it('resizes backing pixels and both transforms from current observed CSS size and draws the latest glyph in a pending frame', async () => {
    const view = await mountInspector();
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 2,
    });
    viewportWidth = 170;
    viewportHeight = 140;
    act(() => {
      for (const notify of observers) notify();
    });
    act(() => inspector.setGlyphUnicode(0x42));
    flushFrames();
    const canvas = screen.getByTestId('symbol-canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(340);
    expect(canvas.height).toBe(280);
    expect(canvas.style.height).toBe('100%');
    expect(canvas.parentElement?.style.height).toBe('50vh');
    const viewport = glyphViewport(
      170,
      140,
      inspector.fontInstance!,
      inspector.glyph!
    )!;
    expect(viewport.scale).toBeGreaterThan(0);
    const svgPath = view.container.querySelector('#glyph path')!;
    expect(svgPath).toHaveAttribute(
      'transform',
      `matrix(${viewport.scale} 0 0 ${-viewport.scale} ${viewport.xOffset} ${viewport.baseline})`
    );
    expect(canvasContext.translate).toHaveBeenLastCalledWith(
      viewport.xOffset,
      viewport.baseline
    );
    const firstCommand = inspector.glyph!.path.commands.find(
      (command) => command.command === 'moveTo'
    )!;
    expect(canvasContext.moveTo).toHaveBeenCalledWith(
      firstCommand.args[0] * viewport.scale,
      -firstCommand.args[1] * viewport.scale
    );
    drawClippedGlyphFeature(
      canvasContext,
      inspector.glyph!,
      viewport.scale,
      { x: 0, y: 0, width: 10, height: 10 },
      inspector.colors
    );
    expect(canvasContext.fill).toHaveBeenLastCalledWith('nonzero');
    viewportWidth = 0;
    viewportHeight = 0;
    act(() => {
      for (const notify of observers) notify();
    });
    flushFrames();
    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
    expect(
      glyphViewport(0, 0, inspector.fontInstance!, inspector.glyph!)
    ).toBeNull();
    viewportWidth = 800;
    viewportHeight = 600;
    act(() => {
      for (const notify of observers) notify();
    });
    flushFrames();
    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(1200);
    expect(view.container.querySelector('svg.interactiveSvg')).toHaveAttribute(
      'width',
      '800'
    );
    expect(view.container.querySelector('svg.interactiveSvg')).toHaveAttribute(
      'height',
      '600'
    );
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 1,
    });
  });

  it('places Newsreader metric guides on current x and H outlines at both optical-size extremes', async () => {
    const view = await mountInspector();
    act(() => inspector.setCurrentFont(3));
    const xHeights: number[] = [];
    const capHeights: number[] = [];
    for (const opsz of [6, 72]) {
      vi.mocked(canvasContext.fillText).mockClear();
      vi.mocked(canvasContext.lineTo).mockClear();
      act(() => inspector.setAxisValues({ opsz }));
      flushFrames();
      const currentFont = inspector.font!.getVariation({
        ...inspector.axisValues,
        opsz,
      });
      const xHeight = currentFont.glyphForCodePoint(0x78).bbox.maxY;
      const capHeight = currentFont.glyphForCodePoint(0x48).bbox.maxY;
      xHeights.push(xHeight);
      capHeights.push(capHeight);
      expect(xHeight).not.toBe(currentFont.xHeight);
      const matrix = view.container
        .querySelector('#glyph path')!
        .getAttribute('transform')!
        .replace(/^matrix\(|\)$/g, '')
        .split(/\s+/)
        .map(Number);
      const scale = matrix[0];
      const baseline = matrix[5];
      for (const [name, height] of [
        ['X-height', xHeight],
        ['Cap height', capHeight],
      ] as const) {
        const expectedY = baseline - height * scale;
        const line = view.container.querySelector(
          `[id="metric-${name}"] line`
        )!;
        expect(Number(line.getAttribute('y1'))).toBeCloseTo(expectedY, 10);
        expect(Number(line.getAttribute('y2'))).toBeCloseTo(expectedY, 10);
        expect(canvasContext.fillText).toHaveBeenCalledWith(
          name,
          16,
          expectedY - 5
        );
        expect(canvasContext.lineTo).toHaveBeenCalledWith(
          viewportWidth,
          expectedY
        );
      }
      expect(
        Number(
          view.container
            .querySelector('[id="metric-X-height"] line')!
            .getAttribute('y1')
        )
      ).not.toBeCloseTo(baseline - currentFont.xHeight * scale, 5);
    }
    expect(xHeights).toEqual([1024, 1024]);
    expect(capHeights).toEqual([1414, 1430]);
  });

  it('selects the comparison URL glyph and rejects malformed scalar URLs', async () => {
    query.value = 'gid=0x0042';
    const view = render(<GlyphComparePage />);
    await waitFor(() =>
      expect(
        view.container.querySelector('#glyphTitle')?.textContent
      ).toContain('"B"')
    );
    expect(view.container.querySelector('#glyphTitle')?.textContent).toContain(
      'U+0042'
    );
    query.value = 'gid=0xD800';
    view.rerender(<GlyphComparePage />);
    await waitFor(() =>
      expect(
        view.container.querySelector('#glyphTitle')?.textContent
      ).toContain('"A"')
    );
    expect(screen.getByText(/Glyph: U\+0041/)).toBeVisible();
  });
});

describe('screen-space SVG path details', () => {
  const colors = {
    anchorFill: '#777777',
    anchorStroke: '#0088ff',
    handleFill: '#cccccc',
    handleStroke: '#555555',
  };
  it.each([0.08, 0.14])(
    'bounds and centers every marker and hit target at positive scale %s',
    (scale) => {
      const font = loadFont('Nohemi-VF.ttf').getVariation({ wght: 400 });
      for (const char of ['I', 'c', 'ǽ']) {
        const glyph = glyphFor(font, char),
          details = parsePathDetails(glyph)!;
        const transform = createViewportTransform(scale, 37, 440);
        const view = render(
          <svg width="640" height="480">
            <SVGDefs idPrefix="bounded" />
            <SVGPathDetails
              glyph={glyph}
              transform={transform}
              colors={colors}
              idPrefix="bounded"
              showPath
            />
          </svg>
        );
        const group = view.container.querySelector('#path-details')!;
        const anchorUses = group.querySelectorAll(
          'use[href="#bounded-anchor"]'
        );
        const anchorHits = group.querySelectorAll(
          'circle[pointer-events="all"]'
        );
        expect(anchorUses).toHaveLength(details.anchors.length);
        expect(anchorHits).toHaveLength(details.anchors.length);
        expect(anchorUses.length).toBeGreaterThan(0);
        details.anchors.forEach((anchor, index) => {
          const x = anchor.x * scale + 37,
            y = 440 - anchor.y * scale;
          const marker = anchorUses[index],
            hit = anchorHits[index];
          expect(Number(marker.getAttribute('width'))).toBe(5);
          expect(Number(marker.getAttribute('height'))).toBe(5);
          expect(Number(marker.getAttribute('x')) + 2.5).toBeCloseTo(x, 10);
          expect(Number(marker.getAttribute('y')) + 2.5).toBeCloseTo(y, 10);
          expect(marker).toHaveAttribute(
            'fill',
            anchor.isStart ? colors.anchorStroke : colors.anchorFill
          );
          expect(marker).toHaveAttribute('stroke', colors.anchorStroke);
          expect(Number(hit.getAttribute('cx'))).toBeCloseTo(x, 10);
          expect(Number(hit.getAttribute('cy'))).toBeCloseTo(y, 10);
          expect(hit).toHaveAttribute('r', '6');
          expect(hit).toHaveAttribute('stroke', 'none');
        });
        const handleUses = group.querySelectorAll(
          'use[href="#bounded-handle"]'
        );
        const handleHits = group.querySelectorAll('rect[pointer-events="all"]');
        expect(handleUses).toHaveLength(details.handles.length);
        expect(handleHits).toHaveLength(details.handles.length);
        if (char !== 'I') expect(handleUses.length).toBeGreaterThan(0);
        details.handles.forEach((handle, index) => {
          const x = handle.x * scale + 37,
            y = 440 - handle.y * scale;
          const marker = handleUses[index],
            hit = handleHits[index];
          expect(marker).toHaveAttribute('width', '4');
          expect(marker).toHaveAttribute('height', '4');
          expect(Number(marker.getAttribute('x')) + 2).toBeCloseTo(x, 10);
          expect(Number(marker.getAttribute('y')) + 2).toBeCloseTo(y, 10);
          expect(marker).toHaveAttribute('fill', colors.handleFill);
          expect(marker).toHaveAttribute('stroke', colors.handleStroke);
          expect(hit).toHaveAttribute('width', '12');
          expect(hit).toHaveAttribute('height', '12');
          expect(Number(hit.getAttribute('x')) + 6).toBeCloseTo(x, 10);
          expect(Number(hit.getAttribute('y')) + 6).toBeCloseTo(y, 10);
          expect(hit).toHaveAttribute('stroke', 'none');
        });
        for (const line of group.querySelectorAll('line')) {
          expect(line).toHaveAttribute(
            'stroke-width',
            line.getAttribute('pointer-events') === 'stroke' ? '12' : '1'
          );
        }
        const starts = details.anchors.filter((anchor) => anchor.isStart),
          labels = group.querySelectorAll('text');
        expect(labels).toHaveLength(starts.length);
        starts.forEach((anchor, index) => {
          expect(labels[index]).toHaveAttribute('font-size', '12');
          expect(Number(labels[index].getAttribute('x'))).toBeCloseTo(
            anchor.x * scale + 41,
            10
          );
          expect(Number(labels[index].getAttribute('y'))).toBeCloseTo(
            444 - anchor.y * scale,
            10
          );
        });
        const outline = group.querySelector('path')!;
        expect(outline).toHaveAttribute('d', glyph.path.toSVG());
        expect(outline).toHaveAttribute(
          'transform',
          `matrix(${scale} 0 0 ${-scale} 37 440)`
        );
        expect(outline).toHaveAttribute('stroke-width', '1.5');
        expect(outline).toHaveAttribute('vector-effect', 'non-scaling-stroke');
        for (const primitive of view.container.querySelectorAll(
          'symbol circle,symbol rect'
        )) {
          expect(primitive).toHaveAttribute('fill', 'inherit');
          expect(primitive).toHaveAttribute('stroke', 'inherit');
        }
        expectFiniteSVG(view.container);
        view.unmount();
      }
    }
  );
});
