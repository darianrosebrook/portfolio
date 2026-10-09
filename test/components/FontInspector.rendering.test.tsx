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
import { glyphViewport } from '@/ui/modules/FontInspector/viewport';
import {
  featureAnchor,
  drawAnatomyOverlay,
  drawClippedGlyphFeature,
} from '@/utils/geometry/drawing';
import GlyphComparePage from '@/app/dev/glyph-compare/page';

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
