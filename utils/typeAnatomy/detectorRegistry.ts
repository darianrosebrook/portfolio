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
