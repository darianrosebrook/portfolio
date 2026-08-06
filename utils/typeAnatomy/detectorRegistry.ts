/**
 * Unified detector registry for typographic feature detection.
 *
 * This module provides:
 * - DETECTOR_REGISTRY: Plugin-based registry of feature detectors
 * - detectGlyphFeatures: Runs detection for specified features
 * - hasFeature: Convenience wrapper for existence checks
 *
 * The unified API ensures all detection returns FeatureInstance[],
 * eliminating the has/get duality that led to API drift.
 */

import type {
  FeatureDetector,
  FeatureID,
  FeatureInstance,
  GeometryCache,
} from './types';

// Import individual detectors
// These will be migrated to return FeatureInstance[]
import { detectApex } from './detectors/apex';
import { detectBowl } from './detectors/bowl';
import { detectCounter } from './detectors/counter';
import { detectCrossbar } from './detectors/crossbar';
import { detectTittle } from './detectors/tittle';
import { detectStem } from './detectors/stem';
import { detectArm } from './detectors/arm';
import { detectTail } from './detectors/tail';
import { detectSerif } from './detectors/serif';
import { detectEye } from './detectors/eye';
import { detectEar } from './detectors/ear';
import { detectVertex } from './detectors/vertex';
import { detectLoop } from './detectors/loop';
import { detectSpine } from './detectors/spine';
import { detectAperture } from './detectors/aperture';
import { detectCrotch } from './detectors/crotch';
import { detectSpur } from './detectors/spur';
import { detectFinial } from './detectors/finial';

/**
 * Registry of feature detectors.
 * Each detector receives a GeometryCache and returns FeatureInstance[].
 * Missing detectors return [] (graceful degradation).
 */
export const DETECTOR_REGISTRY: Partial<Record<FeatureID, FeatureDetector>> = {
  apex: detectApex,
  aperture: detectAperture,
  arm: detectArm,
  bowl: detectBowl,
  counter: detectCounter,
  crossbar: detectCrossbar,
  crotch: detectCrotch,
  ear: detectEar,
  eye: detectEye,
  finial: detectFinial,
  loop: detectLoop,
  serif: detectSerif,
  spine: detectSpine,
  spur: detectSpur,
  stem: detectStem,
  tail: detectTail,
  tittle: detectTittle,
  vertex: detectVertex,
  // The following will return [] until implemented:
  // 'arc', 'bar', 'beak', 'bracket', 'cross-stroke', 'foot',
  // 'hook', 'leg', 'link', 'neck', 'shoulder', 'terminal'
};

/**
 * Detects multiple features on a glyph.
 *
 * @param geo - Pre-computed geometry cache for the glyph
 * @param featureIds - Array of feature IDs to detect
 * @returns Map of feature ID to detected instances
 */
export function detectGlyphFeatures(
  geo: GeometryCache,
  featureIds: FeatureID[]
): Map<FeatureID, FeatureInstance[]> {
  const results = new Map<FeatureID, FeatureInstance[]>();

  for (const id of featureIds) {
    const detector = DETECTOR_REGISTRY[id];
    try {
      const instances = detector?.(geo) ?? [];
      results.set(id, instances);
    } catch (error) {
      console.warn(`[detectGlyphFeatures] Error detecting ${id}:`, error);
      results.set(id, []);
    }
  }

  return results;
}

/**
 * Detects a single feature on a glyph.
 *
 * @param geo - Pre-computed geometry cache for the glyph
 * @param featureId - Feature ID to detect
 * @returns Array of detected instances (may be empty)
 */
export function detectFeature(
  geo: GeometryCache,
  featureId: FeatureID
): FeatureInstance[] {
  const detector = DETECTOR_REGISTRY[featureId];
  if (!detector) return [];

  try {
    return detector(geo);
  } catch (error) {
    console.warn(`[detectFeature] Error detecting ${featureId}:`, error);
    return [];
  }
}

/**
 * Checks if a feature is present on a glyph.
 * Convenience wrapper around detectFeature.
 *
 * @param geo - Pre-computed geometry cache for the glyph
 * @param featureId - Feature ID to check
 * @returns true if at least one instance was detected
 */
export function hasFeature(geo: GeometryCache, featureId: FeatureID): boolean {
  return detectFeature(geo, featureId).length > 0;
}

/**
 * Gets all registered feature IDs.
 */
export function getRegisteredFeatures(): FeatureID[] {
  return Object.keys(DETECTOR_REGISTRY) as FeatureID[];
}

/**
 * Checks if a detector is registered for a feature.
 */
export function isFeatureSupported(featureId: FeatureID): boolean {
  return featureId in DETECTOR_REGISTRY;
}

/**
 * Detects all registered features on a glyph.
 * Useful for debugging and exploration.
 */
export function detectAllFeatures(
  geo: GeometryCache
): Map<FeatureID, FeatureInstance[]> {
  return detectGlyphFeatures(geo, getRegisteredFeatures());
}

/**
 * Filters detection results to only include features with instances.
 */
export function filterDetectedFeatures(
  results: Map<FeatureID, FeatureInstance[]>
): Map<FeatureID, FeatureInstance[]> {
  const filtered = new Map<FeatureID, FeatureInstance[]>();

  for (const [id, instances] of results) {
    if (instances.length > 0) {
      filtered.set(id, instances);
    }
  }

  return filtered;
}

/**
 * Gets the highest confidence instance for each feature.
 */
export function getBestInstances(
  results: Map<FeatureID, FeatureInstance[]>
): Map<FeatureID, FeatureInstance | null> {
  const best = new Map<FeatureID, FeatureInstance | null>();

  for (const [id, instances] of results) {
    if (instances.length === 0) {
      best.set(id, null);
    } else {
      // Sort by confidence descending
      const sorted = [...instances].sort((a, b) => b.confidence - a.confidence);
      best.set(id, sorted[0]);
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Cross-detector region reconciliation
// ---------------------------------------------------------------------------

/**
 * IoU threshold above which two same-`kind` regions from different feature ids
 * are treated as a duplicate claim on the same part of the glyph.
 *
 * Calibrated against measured overlaps: genuine duplicates (bowl↔spine both
 * stroke, counter↔eye both enclosed) land at 0.7–0.93 IoU, while complementary
 * pairs (bowl stroke ↔ counter enclosed) land at 0.3–0.5. The same-kind filter
 * already excludes the complementary pairs, so 0.6 cleanly separates true
 * duplicates from partial overlap of distinct features.
 */
export const RECONCILE_IOU_THRESHOLD = 0.6;

interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function regionBBox(points: Array<{ x: number; y: number }>): BBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

function bboxIoU(a: BBox, b: BBox): number {
  const ix = Math.max(0, Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX));
  const iy = Math.max(0, Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY));
  const inter = ix * iy;
  const areaA = (a.maxX - a.minX) * (a.maxY - a.minY);
  const areaB = (b.maxX - b.minX) * (b.maxY - b.minY);
  const union = areaA + areaB - inter;
  return union > 0 ? inter / union : 0;
}

/**
 * Suppresses duplicate region claims across detectors.
 *
 * When two instances from DIFFERENT feature ids both carry a `region` of the
 * SAME `kind` (`'stroke'` or `'enclosed'`) whose bbox IoU exceeds
 * {@link RECONCILE_IOU_THRESHOLD}, the lower-confidence instance is dropped.
 * This removes confusing double-highlights where, e.g., `bowl` and `spine`
 * both flag the same curve on `o`, or `counter` and `eye` both flag the same
 * hole on `a`.
 *
 * What it deliberately does NOT suppress:
 *   - same-feature-id pairs (intra-feature dedup is the detector's job)
 *   - different-`kind` pairs (a `stroke` bowl and an `enclosed` counter are
 *     complementary — ink vs hole — even when their bboxes overlap heavily)
 *   - instances without a `region` (point/marker-only features)
 *
 * Ties in confidence are broken deterministically by feature id (the
 * lexicographically-later id is suppressed) so reconciliation is reproducible.
 *
 * @param results - Output of `detectGlyphFeatures` / `detectAllFeatures`.
 * @returns A new Map with duplicate same-kind regions removed.
 */
export function reconcileFeatures(
  results: Map<FeatureID, FeatureInstance[]>
): Map<FeatureID, FeatureInstance[]> {
  // Flatten to (id, instance, kind, bbox) for instances worth reconciling.
  interface RegionEntry {
    id: FeatureID;
    instance: FeatureInstance;
    kind: 'stroke' | 'enclosed';
    bbox: BBox;
  }
  const entries: RegionEntry[] = [];
  for (const [id, insts] of results) {
    for (const inst of insts) {
      if (inst.region && inst.region.points.length >= 3) {
        entries.push({
          id,
          instance: inst,
          kind: inst.region.kind,
          bbox: regionBBox(inst.region.points),
        });
      }
    }
  }

  // Mark instances to suppress. Compare every same-kind pair across ids once.
  const suppress = new Set<FeatureInstance>();
  for (let i = 0; i < entries.length; i++) {
    const a = entries[i];
    for (let j = i + 1; j < entries.length; j++) {
      const b = entries[j];
      if (a.id === b.id) continue; // same feature → detector's responsibility
      if (a.kind !== b.kind) continue; // complementary kinds coexist

      if (bboxIoU(a.bbox, b.bbox) > RECONCILE_IOU_THRESHOLD) {
        // Suppress the weaker claim; break ties by id for determinism.
        const aWins =
          a.instance.confidence > b.instance.confidence ||
          (a.instance.confidence === b.instance.confidence && a.id < b.id);
        suppress.add(aWins ? b.instance : a.instance);
      }
    }
  }

  if (suppress.size === 0) return results;

  // Rebuild the map without suppressed instances.
  const reconciled = new Map<FeatureID, FeatureInstance[]>();
  for (const [id, insts] of results) {
    const kept = insts.filter((inst) => !suppress.has(inst));
    if (kept.length > 0) reconciled.set(id, kept);
  }
  return reconciled;
}
