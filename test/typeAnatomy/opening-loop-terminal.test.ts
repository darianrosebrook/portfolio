import fs from 'node:fs';
import * as fontkit from 'fontkit';
import type { Font, Glyph } from 'fontkit';
import { describe, expect, it } from 'vitest';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import {
  detectAperture,
  detectOpenCounterPockets,
} from '@/utils/typeAnatomy/detectors/aperture';
import { detectLoop } from '@/utils/typeAnatomy/detectors/loop';
import { detectFinial } from '@/utils/typeAnatomy/detectors/finial';
import { mockFont, mockGlyphFromPath } from '@/test/utils/fixtures/mockGlyph';
import type { FeatureInstance, Point2D } from '@/utils/typeAnatomy/types';

const files = ['Nohemi-VF.ttf', 'InterVariable.ttf', 'Newsreader-VF.ttf'];
function fontFor(file: string, axes?: Record<string, number>): Font {
  const font = fontkit.create(fs.readFileSync(`public/fonts/${file}`)) as Font;
  return axes ? font.getVariation(axes) : font;
}
function glyphFor(font: Font, char: string): Glyph {
  return font.glyphForCodePoint(char.codePointAt(0)!) as Glyph;
}
function inPolygon(p: Point2D, points: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i],
      b = points[j];
    if (
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    )
      inside = !inside;
  }
  return inside;
}
function selected(instances: FeatureInstance[], p: Point2D): boolean {
  return instances.some(
    (instance) => !!instance.region && inPolygon(p, instance.region.points)
  );
}

/** Independent fixed-step Bézier oracle; it does not use detector fill/intervals. */
function outline(glyph: Glyph): Point2D[][] {
  const contours: Point2D[][] = [];
  let points: Point2D[] = [],
    previous: Point2D = { x: 0, y: 0 };
  for (const { command, args } of glyph.path.commands) {
    if (command === 'moveTo') {
      points = [{ x: args[0], y: args[1] }];
      contours.push(points);
      previous = points[0];
    } else if (command === 'lineTo') {
      previous = { x: args[0], y: args[1] };
      points.push(previous);
    } else if (command === 'quadraticCurveTo' || command === 'bezierCurveTo') {
      const start = previous;
      for (let step = 1; step <= 128; step++) {
        const t = step / 128,
          u = 1 - t;
        previous =
          command === 'quadraticCurveTo'
            ? {
                x: u * u * start.x + 2 * u * t * args[0] + t * t * args[2],
                y: u * u * start.y + 2 * u * t * args[1] + t * t * args[3],
              }
            : {
                x:
                  u * u * u * start.x +
                  3 * u * u * t * args[0] +
                  3 * u * t * t * args[2] +
                  t * t * t * args[4],
                y:
                  u * u * u * start.y +
                  3 * u * u * t * args[1] +
                  3 * u * t * t * args[3] +
                  t * t * t * args[5],
              };
        points.push(previous);
      }
    }
  }
  return contours;
}
function ink(contours: Point2D[][], p: Point2D): boolean {
  let winding = 0;
  for (const points of contours)
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length];
      const side = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
      if (a.y <= p.y && b.y > p.y && side > 0) winding++;
      if (a.y > p.y && b.y <= p.y && side < 0) winding--;
    }
  return winding !== 0;
}
function sample(glyph: Glyph, x: number, y: number): Point2D {
  return {
    x: glyph.bbox.minX + x * (glyph.bbox.maxX - glyph.bbox.minX),
    y: glyph.bbox.minY + y * (glyph.bbox.maxY - glyph.bbox.minY),
  };
}

/** A right-side negative interval bounded above/below by ink is an open counter mouth. */
function gapAt(glyph: Glyph, contours: Point2D[][], x: number): Point2D[] {
  const result: Point2D[] = [];
  const step = (glyph.bbox.maxY - glyph.bbox.minY) / 300;
  let bottom: number | undefined;
  for (let y = glyph.bbox.minY; y <= glyph.bbox.maxY; y += step) {
    if (ink(contours, { x, y })) {
      if (bottom !== undefined && y - bottom > step * 5) {
        const point = { x, y: (bottom + y) / 2 };
        if (point.y > 0 && !ink(contours, point)) result.push(point);
      }
      bottom = y;
    }
  }
  return result;
}

/** The rightmost column with ink on both sides of a gap locates its mouth,
 * independently of either aperture regions or retained counter pockets. */
function mouthSeed(glyph: Glyph, contours: Point2D[][]): Point2D {
  const width = glyph.bbox.maxX - glyph.bbox.minX;
  for (let column = 1; column < 150; column++) {
    const points = gapAt(
      glyph,
      contours,
      glyph.bbox.maxX - (width * column) / 300
    );
    for (const point of points) {
      // A closed eye and the counter opening on the opposite side also have
      // vertical ink brackets. This mouth must connect rightward to exterior.
      let open = true;
      for (let x = point.x; x <= glyph.bbox.maxX; x += width / 300) {
        if (ink(contours, { x, y: point.y })) {
          open = false;
          break;
        }
      }
      if (!open) continue;
      let reach = 0;
      for (let x = point.x; x >= glyph.bbox.minX; x -= width / 300) {
        if (ink(contours, { x, y: point.y })) break;
        reach = point.x - x;
      }
      // Side whitespace beside an E arm stops immediately at that arm; it
      // does not lead inward to a partially enclosed counter.
      if (reach >= width * 0.08) return point;
    }
  }
  throw new Error('No independent right-side counter mouth');
}

function interiorCounterSeed(glyph: Glyph, contours: Point2D[][]): Point2D {
  for (const fraction of [0.5, 0.4, 0.6]) {
    const point = gapAt(
      glyph,
      contours,
      glyph.bbox.minX + (glyph.bbox.maxX - glyph.bbox.minX) * fraction
    )[0];
    if (point) return point;
  }
  throw new Error('No independent interior counter space');
}

/** Inspected source cap coordinates for the lower E counter of capital AE.
 * Its middle arm separates two mouths, so a vertical whitespace midpoint
 * beside that arm is not a positive aperture oracle.
 */
function compoundCapMouth(
  file: string,
  variationIndex: number,
  contours: Point2D[][]
): Point2D {
  const pairs: Record<string, number[][][]> = {
    'Nohemi-VF.ttf': [
      [
        [3614, 390],
        [3454, 1234],
      ],
      [
        [3464, 80],
        [3304, 1387],
      ],
      [
        [3674, 760],
        [3534, 1084],
      ],
    ],
    'InterVariable.ttf': [
      [
        [1901, 168],
        [1844, 662],
      ],
      [
        [1814, 46],
        [1750, 722],
      ],
      [
        [2107, 352],
        [2050, 574],
      ],
    ],
    'Newsreader-VF.ttf': [
      [
        [1803, 381],
        [1563, 441],
      ],
      [
        [2074, 380],
        [1753, 477],
      ],
      [
        [2246, 503],
        [1873, 415],
      ],
    ],
  };
  const [a, b] = pairs[file][variationIndex].map(([x, y]) => ({ x, y }));
  for (const point of [a, b])
    expect(
      contours.some((contour) =>
        contour.some((vertex) => vertex.x === point.x && vertex.y === point.y)
      )
    ).toBe(true);
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  return {
    x: (a.x + b.x) / 2 - ((b.y - a.y) / length) * 10,
    y: (a.y + b.y) / 2 + ((b.x - a.x) / length) * 10,
  };
}

describe('opening, loop and terminal geometry', () => {
  for (const file of files) {
    const defaults = fontFor(file);
    const axes = defaults.variationAxes;
    const variations = [
      undefined,
      Object.fromEntries(
        Object.entries(axes).map(([key, axis]) => [key, axis.min])
      ),
      Object.fromEntries(
        Object.entries(axes).map(([key, axis]) => [key, axis.max])
      ),
    ];
    for (const [variationIndex, variation] of variations.entries()) {
      const font = fontFor(file, variation);
      for (const char of ['c', 'e', 's', 'Ǽ']) {
        it(`${file} variation ${variationIndex} ${char} localizes the empty mouth without interior counter space or ink`, () => {
          const glyph = glyphFor(font, char),
            contours = outline(glyph);
          const apertures = detectAperture(buildGeometryCache(glyph, font));
          const mouth =
            char === 'Ǽ'
              ? compoundCapMouth(file, variationIndex, contours)
              : mouthSeed(glyph, contours);
          expect(ink(contours, mouth), 'independent positive is empty').toBe(
            false
          );
          expect(
            selected(apertures, mouth),
            `mouth belongs to the opening at ${mouth.x},${mouth.y}`
          ).toBe(true);
          const interior = interiorCounterSeed(glyph, contours);
          expect(ink(contours, interior)).toBe(false);
          expect(
            selected(apertures, interior),
            'interior counter is not the opening'
          ).toBe(false);
          expect(
            selected(apertures, {
              x: glyph.bbox.maxX + (glyph.bbox.maxX - glyph.bbox.minX) * 0.1,
              y: mouth.y,
            })
          ).toBe(false);
          let emptyCoverage = 0;
          for (let y = 0; y < 41; y++)
            for (let x = 0; x < 41; x++) {
              const p = sample(glyph, (x + 0.37) / 41, (y + 0.41) / 41);
              if (selected(apertures, p)) {
                expect(
                  ink(contours, p),
                  `aperture crosses ink at ${p.x},${p.y}`
                ).toBe(false);
                emptyCoverage++;
              }
            }
          expect(emptyCoverage, 'a visible mouth channel').toBeGreaterThan(0);
        });
      }
      it(`${file} variation ${variationIndex} rejects closed bowls, stems, and hooks as apertures`, () => {
        for (const char of ['o', 'O', 'H', 'p', 'q', 'j']) {
          expect(
            detectAperture(buildGeometryCache(glyphFor(font, char), font)),
            char
          ).toEqual([]);
        }
      });
      it(`${file} variation ${variationIndex} loop covers real lower walls and excludes upper anatomy`, () => {
        const glyph = glyphFor(font, 'g'),
          contours = outline(glyph);
        const loops = detectLoop(buildGeometryCache(glyph, font));
        let lowerInk = 0;
        for (let y = 0; y < 25; y++)
          for (let x = 0; x < 45; x++) {
            const p = {
              x:
                glyph.bbox.minX +
                ((x + 0.31) / 45) * (glyph.bbox.maxX - glyph.bbox.minX),
              y: (glyph.bbox.minY * (y + 0.43)) / 25,
            };
            if (ink(contours, p)) {
              expect(
                selected(loops, p),
                `missed loop ink at ${p.x},${p.y}`
              ).toBe(true);
              lowerInk++;
            }
          }
        expect(lowerInk).toBeGreaterThan(70);
        expect(selected(loops, sample(glyph, 0.5, 0.75))).toBe(false);
        for (const char of ['p', 'q', 'j', 'H', 'o']) {
          expect(
            detectLoop(buildGeometryCache(glyphFor(font, char), font)),
            char
          ).toEqual([]);
        }
      });
      it(`${file} variation ${variationIndex} finials attach to actual caps and reject closed crowns`, () => {
        const glyph = glyphFor(font, 'c'),
          contours = outline(glyph);
        const finials = detectFinial(buildGeometryCache(glyph, font));
        expect(finials.length).toBeGreaterThan(0);
        for (const finial of finials) {
          const start = finial.anchors!.capStart,
            end = finial.anchors!.capEnd;
          expect(
            glyph.path.commands.some(
              (cmd, i) =>
                cmd.command === 'lineTo' &&
                cmd.args[0] === end.x &&
                cmd.args[1] === end.y &&
                i > 0
            )
          ).toBe(true);
          expect(finial.anchors!.position).toEqual({
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2,
          });
          const normal = { x: -(end.y - start.y), y: end.x - start.x };
          const length = Math.hypot(normal.x, normal.y);
          const anchor = finial.anchors!.position;
          const candidates = [1, -1].map((sign) => ({
            x: anchor.x + (normal.x / length) * length * 0.1 * sign,
            y: anchor.y + (normal.y / length) * length * 0.1 * sign,
          }));
          const filled = candidates.filter((p) => ink(contours, p));
          expect(filled).toHaveLength(1);
          expect(selected([finial], filled[0])).toBe(true);
          expect(selected([finial], sample(glyph, 0.5, 0.98))).toBe(false);
        }
        for (const char of ['o', 'O'])
          expect(
            detectFinial(buildGeometryCache(glyphFor(font, char), font)),
            char
          ).toEqual([]);
      });
      if (file !== 'Newsreader-VF.ttf') {
        for (const char of ['I', 'H']) {
          it(`${file} variation ${variationIndex} ${char} selects flat cap bands without shaft ink`, () => {
            const glyph = glyphFor(font, char),
              contours = outline(glyph);
            const geo = buildGeometryCache(glyph, font),
              finials = detectFinial(geo);
            expect(finials).toHaveLength(char === 'I' ? 2 : 4);
            for (const finial of finials) {
              const a = finial.anchors!.capStart,
                b = finial.anchors!.capEnd;
              const anchor = finial.anchors!.position;
              expect(a.y).toBe(b.y);
              const width = Math.abs(b.x - a.x);
              const inward = anchor.y === glyph.bbox.maxY ? -1 : 1;
              const cap = { x: anchor.x, y: anchor.y + inward * width * 0.15 };
              expect(ink(contours, cap)).toBe(true);
              expect(selected([finial], cap)).toBe(true);
              const ys = finial.region!.points.map((point) => point.y);
              expect(Math.max(...ys) - Math.min(...ys)).toBeLessThanOrEqual(
                width * 0.7
              );
              const shaft = {
                x: anchor.x,
                y: (glyph.bbox.minY + glyph.bbox.maxY) / 2,
              };
              expect(ink(contours, shaft)).toBe(true);
              expect(selected(finials, shaft)).toBe(false);
            }
          });
        }
      } else {
        it(`${file} variation ${variationIndex} serif feet on I H a are excluded`, () => {
          for (const char of ['I', 'H', 'a']) {
            const finials = detectFinial(
              buildGeometryCache(glyphFor(font, char), font)
            );
            expect(finials, char).toEqual([]);
          }
        });
      }
      if (file !== 'Newsreader-VF.ttf') {
        it(`${file} variation ${variationIndex} s finials select its two terminal caps`, () => {
          const glyph = glyphFor(font, 's');
          const finials = detectFinial(buildGeometryCache(glyph, font));
          const capIndices = file === 'Nohemi-VF.ttf' ? [1, 3] : [0, 2];
          const lines = glyph.path.commands.filter(
            (command) => command.command === 'lineTo'
          );
          expect(finials).toHaveLength(2);
          expect(finials.map((finial) => finial.anchors!.capEnd)).toEqual(
            capIndices.map((index) => ({
              x: lines[index].args[0],
              y: lines[index].args[1],
            }))
          );
          expect(selected(finials, sample(glyph, 0.5, 0.98))).toBe(false);
        });
      }
    }
  }

  it('pins the reported Nohemi false aperture and s crown failures', () => {
    const font = fontFor('Nohemi-VF.ttf');
    const c = glyphFor(font, 'c');
    const apertures = detectAperture(buildGeometryCache(c, font));
    expect(ink(outline(c), { x: 134.922, y: 945 })).toBe(true);
    expect(selected(apertures, { x: 134.922, y: 945 })).toBe(false);
    const s = glyphFor(font, 's');
    const finials = detectFinial(buildGeometryCache(s, font));
    expect(
      finials.map((f) => f.anchors!.position.y).sort((a, b) => a - b)
    ).toEqual([685, 1538]);
    expect(selected(finials, { x: 282.5, y: 640 })).toBe(true);
    expect(selected(finials, { x: 1800.5, y: 1580 })).toBe(true);
    expect(selected(finials, { x: 1056, y: 2205 })).toBe(false);
  });

  it('pins the independently observed Newsreader g loop pixels', () => {
    const font = fontFor('Newsreader-VF.ttf');
    const glyph = glyphFor(font, 'g'),
      contours = outline(glyph);
    const loops = detectLoop(buildGeometryCache(glyph, font));
    for (const [x, y] of [
      [100, -265],
      [150, -265],
      [800, -265],
      [200, -400],
      [800, -400],
    ]) {
      expect(ink(contours, { x, y })).toBe(true);
      expect(selected(loops, { x, y })).toBe(true);
    }
    expect(ink(contours, { x: 450, y: -265 })).toBe(false);
    expect(selected(loops, { x: 450, y: -265 })).toBe(false);
  });
});

it('implicit first and closing edges identify both flat straight-stem caps', () => {
  const glyph = mockGlyphFromPath('M 100 0 L 200 0 L 200 700 L 100 700 Z', {
    minX: 100,
    minY: 0,
    maxX: 200,
    maxY: 700,
  });
  const finials = detectFinial(buildGeometryCache(glyph, mockFont()));
  expect(finials).toHaveLength(2);
  expect(
    finials.map((finial) => finial.anchors!.position.y).sort((a, b) => a - b)
  ).toEqual([0, 700]);
  expect(selected(finials, { x: 150, y: 15 })).toBe(true);
  expect(selected(finials, { x: 150, y: 685 })).toBe(true);
  expect(selected(finials, { x: 150, y: 350 })).toBe(false);
});

it('overlapping source cap seams cannot become finials inside an occupied shaft', () => {
  const glyph = mockGlyphFromPath(
    'M 100 0 L 200 0 L 200 400 L 100 400 Z ' +
      'M 100 300 L 200 300 L 200 700 L 100 700 Z',
    { minX: 100, minY: 0, maxX: 200, maxY: 700 }
  );
  const finials = detectFinial(buildGeometryCache(glyph, mockFont()));
  expect(finials).toHaveLength(2);
  expect(selected(finials, { x: 150, y: 15 })).toBe(true);
  expect(selected(finials, { x: 150, y: 685 })).toBe(true);
  expect(ink(outline(glyph), { x: 150, y: 400 })).toBe(true);
  expect(selected(finials, { x: 150, y: 400 })).toBe(false);
  expect(selected(finials, { x: 150, y: 300 })).toBe(false);
});

it('a ball terminal is excluded while the opposite flat shaft cap remains a finial', () => {
  const glyph = mockGlyphFromPath(
    'M 300 0 L 400 0 L 400 550 L 300 550 Z ' +
      'M 200 650 C 200 567 267 500 350 500 C 433 500 500 567 500 650 ' +
      'C 500 733 433 800 350 800 C 267 800 200 733 200 650 Z',
    { minX: 200, minY: 0, maxX: 500, maxY: 800 }
  );
  const finials = detectFinial(buildGeometryCache(glyph, mockFont()));
  expect(finials).toHaveLength(1);
  expect(selected(finials, { x: 350, y: 15 })).toBe(true);
  expect(ink(outline(glyph), { x: 350, y: 650 })).toBe(true);
  expect(selected(finials, { x: 350, y: 650 })).toBe(false);
  expect(selected(finials, { x: 350, y: 785 })).toBe(false);
});

describe('independently adjudicated capital AE cap mouths', () => {
  const cases: Array<{
    file: string;
    axes: Record<string, number>;
    positive: Point2D;
    oldSeed: Point2D;
    walls: Point2D[];
  }> = [
    {
      file: 'Nohemi-VF.ttf',
      axes: { wght: 100 },
      positive: { x: 3374, y: 734 },
      oldSeed: { x: 3293.05, y: 735.8816666666673 },
      walls: [
        { x: 3456, y: 40 },
        { x: 3290, y: 1427 },
      ],
    },
    {
      file: 'Newsreader-VF.ttf',
      axes: { wght: 400, opsz: 18 },
      positive: { x: 1680, y: 401 },
      oldSeed: { x: 1812.8666666666666, y: 668.749999999999 },
      walls: [
        { x: 1822, y: 371 },
        { x: 1526, y: 449 },
      ],
    },
    {
      file: 'Newsreader-VF.ttf',
      axes: { wght: 800, opsz: 72 },
      positive: { x: 2062, y: 449 },
      oldSeed: { x: 2205.09, y: 704.7099999999992 },
      walls: [
        { x: 2267, y: 493 },
        { x: 1857, y: 425 },
      ],
    },
  ];
  it.each(cases)(
    '$file $axes separates the source-cap mouth from side whitespace and deep counter',
    ({ file, axes, positive, oldSeed, walls }) => {
      const font = fontFor(file, axes),
        glyph = glyphFor(font, 'Ǽ'),
        contours = outline(glyph);
      const apertures = detectAperture(buildGeometryCache(glyph, font));
      expect(ink(contours, positive)).toBe(false);
      expect(selected(apertures, positive)).toBe(true);
      expect(ink(contours, oldSeed)).toBe(false);
      expect(selected(apertures, oldSeed)).toBe(false);
      for (const point of walls) {
        expect(ink(contours, point)).toBe(true);
        expect(selected(apertures, point)).toBe(false);
      }
    }
  );
});

it('retains the whole open-counter identity separately from its aperture channel', () => {
  const font = fontFor('Nohemi-VF.ttf', { wght: 400 }),
    glyph = glyphFor(font, 'c'),
    contours = outline(glyph);
  const geo = buildGeometryCache(glyph, font),
    pockets = detectOpenCounterPockets(geo),
    apertures = detectAperture(geo);
  const counter = { x: 1000, y: 1100 },
    mouth = { x: 2100, y: 1100 };
  expect(ink(contours, counter)).toBe(false);
  expect(selected(pockets, counter)).toBe(true);
  expect(selected(apertures, counter)).toBe(false);
  expect(ink(contours, mouth)).toBe(false);
  expect(selected(pockets, mouth)).toBe(true);
  expect(selected(apertures, mouth)).toBe(true);
  expect(apertures[0].anchors).toEqual(pockets[0].anchors);
});
