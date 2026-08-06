/**
 * Cross-detector region reconciliation tests.
 *
 * Multiple detectors can claim overlapping regions for the same physical part
 * of a glyph — e.g. on 'o', both `bowl` and `spine` flag the same curved
 * stroke (both `kind: 'stroke'`); on 'a'/'b', both `counter` and `eye` flag
 * the same enclosed hole (both `kind: 'enclosed'`). That double-highlight is
 * confusing in the overlay.
 *
 * `reconcileFeatures` suppresses the lower-confidence instance when two
 * regions of the SAME kind from DIFFERENT feature ids overlap above a
 * threshold. It must NOT suppress complementary pairs — a `stroke` bowl and
 * an `enclosed` counter describe different things (ink vs hole) and coexist
 * even when their bboxes overlap.
 */

import { describe, expect, it } from 'vitest';
import {
  detectAllFeatures,
  detectGlyphFeatures,
  reconcileFeatures,
} from '@/utils/typeAnatomy/detectorRegistry';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { getFeatureHints } from '@/utils/typeAnatomy/glyphFeatureHints';
import {
  glyphFor,
  loadFont,
  regionBBox,
} from '@/test/utils/fixtures/fontFixtures';
import type {
  FeatureID,
  FeatureInstance,
  Point2D,
  RegionKind,
  RegionPolygon,
} from '@/utils/typeAnatomy/types';

type BBox = { minX: number; minY: number; maxX: number; maxY: number };

function iou(a: BBox, b: BBox): number {
  const ix = Math.max(0, Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX));
  const iy = Math.max(0, Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY));
  const inter = ix * iy;
  const areaA = (a.maxX - a.minX) * (a.maxY - a.minY);
  const areaB = (b.maxX - b.minX) * (b.maxY - b.minY);
  const union = areaA + areaB - inter;
  return union > 0 ? inter / union : 0;
}

/** Collects (featureId, kind, bbox) for every instance that has a region. */
function regions(
  map: Map<string, FeatureInstance[]>
): Array<{ id: string; kind: string; bbox: BBox }> {
  const out: Array<{ id: string; kind: string; bbox: BBox }> = [];
  for (const [id, insts] of map) {
    for (const inst of insts) {
      if (inst.region) {
        out.push({
          id,
          kind: inst.region.kind,
          bbox: regionBBox(inst.region as RegionPolygon),
        });
      }
    }
  }
  return out;
}

/** Maximum inter-feature IoU among same-kind regions from different ids. */
function maxSameKindIou(
  rs: Array<{ id: string; kind: string; bbox: BBox }>
): number {
  let max = 0;
  for (let i = 0; i < rs.length; i++) {
    for (let j = i + 1; j < rs.length; j++) {
      if (rs[i].id !== rs[j].id && rs[i].kind === rs[j].kind) {
        max = Math.max(max, iou(rs[i].bbox, rs[j].bbox));
      }
    }
  }
  return max;
}

describe('reconcileFeatures', () => {
  it('pre-reconciliation has same-kind overlaps above threshold on o (documents the bug)', () => {
    const font = loadFont('Nohemi-VF.ttf');
    const geo = buildGeometryCache(glyphFor(font, 'o'), font);
    const before = detectAllFeatures(geo);

    // The unreconciled output has same-kind (stroke) overlaps > 0.6 —
    // bowl vs spine flag the same curve. This locks in the motivating bug.
    expect(maxSameKindIou(regions(before))).toBeGreaterThan(0.6);
  });

  it('eliminates same-kind overlaps above the reconciliation threshold', () => {
    const font = loadFont('Nohemi-VF.ttf');
    const geo = buildGeometryCache(glyphFor(font, 'o'), font);
    const reconciled = reconcileFeatures(detectAllFeatures(geo));

    // After reconciliation, no two same-kind regions from different feature
    // ids should overlap above the threshold the reconciler enforces.
    expect(maxSameKindIou(regions(reconciled))).toBeLessThanOrEqual(0.6);
  });

  it('preserves complementary stroke+enclosed pairs (bowl + counter)', () => {
    const font = loadFont('Nohemi-VF.ttf');
    const geo = buildGeometryCache(glyphFor(font, 'o'), font);

    // Detect through the same hint-filtered path the FontInspector renders
    // from, rather than detectAllFeatures. Only hinted detectors run for a
    // glyph in the product, so 'o' yields bowl + counter and never spine.
    // Using detectAllFeatures here would let a spurious spine (conf 0.9)
    // out-rank the correct bowl (0.85) on a same-kind overlap and suppress
    // it — a collision the product cannot produce.
    const hintedIds = getFeatureHints('o', geo.context).map((h) => h.id);
    const reconciled = reconcileFeatures(detectGlyphFeatures(geo, hintedIds));

    const ids = new Set(reconciled.keys());
    // Different kinds (stroke vs enclosed) must never dedupe against each
    // other. Asserted separately so a failure names which one was lost.
    expect(ids.has('bowl')).toBe(true);
    expect(ids.has('counter')).toBe(true);
  });

  it('keeps fully-overlapping regions when their kinds differ', () => {
    // The bowl/counter pair on a real 'o' only reaches IoU 0.43, below the
    // 0.6 threshold, so it never becomes a suppression candidate and cannot
    // exercise the different-kind guard. Feed identical bboxes (IoU 1.0) so
    // the pair IS a candidate and only the kind check can spare it.
    const square: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const instance = (
      id: FeatureID,
      kind: RegionKind,
      confidence: number
    ): FeatureInstance => ({
      id,
      shape: { type: 'polyline', points: square },
      confidence,
      region: { points: square, kind },
    });

    const input = new Map<FeatureID, FeatureInstance[]>([
      ['bowl', [instance('bowl', 'stroke', 0.5)]],
      ['counter', [instance('counter', 'enclosed', 0.9)]],
    ]);

    const ids = new Set(reconcileFeatures(input).keys());
    // Identical regions, so IoU is 1.0 and confidence differs — the ONLY
    // reason the weaker 'bowl' survives is that the kinds differ.
    expect(ids.has('bowl')).toBe(true);
    expect(ids.has('counter')).toBe(true);
  });

  it('suppresses the weaker region when kinds match', () => {
    // Same geometry as above but both 'stroke', so the guard does not apply
    // and the lower-confidence claim must lose. This pins that the previous
    // test passes because of kind, not because suppression is broken.
    const square: Point2D[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const instance = (id: FeatureID, confidence: number): FeatureInstance => ({
      id,
      shape: { type: 'polyline', points: square },
      confidence,
      region: { points: square, kind: 'stroke' as RegionKind },
    });

    const input = new Map<FeatureID, FeatureInstance[]>([
      ['bowl', [instance('bowl', 0.5)]],
      ['spine', [instance('spine', 0.9)]],
    ]);

    const ids = new Set(reconcileFeatures(input).keys());
    expect(ids.has('spine')).toBe(true);
    expect(ids.has('bowl')).toBe(false);
  });

  it('does not drop features on a glyph where they do not overlap (s spine kept)', () => {
    const font = loadFont('Nohemi-VF.ttf');
    const geo = buildGeometryCache(glyphFor(font, 's'), font);
    const reconciled = reconcileFeatures(detectAllFeatures(geo));

    // 's' has a spine and no competing bowl over the same region, so the
    // reconciler must not over-prune it.
    const spine = reconciled.get('spine') ?? [];
    expect(spine.length).toBeGreaterThan(0);
  });
});
