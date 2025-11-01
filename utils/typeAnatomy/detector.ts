/**
 * Unified feature detection orchestrator for typographic anatomy.
 * Maps feature names to their detection functions and provides a unified API.
 */

import type { Font, Glyph } from 'fontkit';
import { hasAperture } from './aperture';
import { hasApex } from './apex';
import { hasArc } from './arc';
import { hasArm } from './arm';
import { hasBar } from './bar';
import { hasBeak } from './beak';
import { hasBowl } from './bowl';
import { hasBracket } from './bracket';
import { getCounter } from './counter';
import { hasCrossStroke } from './crossStroke';
import { hasCrotch } from './crotch';
import { hasEar } from './ear';
import { hasEye } from './eye';
import { hasFinial } from './finial';
import { hasFoot } from './foot';
import { hasHook } from './hook';
import type { FeatureResult, FeatureShape, Metrics } from './index';
import { hasLeg } from './leg';
import { hasLink } from './link';
import { hasLoop } from './loop';
import { hasNeck } from './neck';
import { hasSerif } from './serif';
import { hasShoulder } from './shoulder';
import { hasSpine } from './spine';
import { hasSpur } from './spur';
import { hasStem } from './stem';
import { hasTail } from './tail';
import { getTerminal } from './terminal';
import { getTittle } from './tittle';
import { hasVertex } from './vertex';

export interface DetectionResult {
  found: boolean;
  shape?: FeatureShape;
  location?: { x: number; y: number };
}

export type FeatureDetector = (
  glyph: Glyph,
  metrics: Metrics,
  font?: Font
) => DetectionResult | boolean;

/**
 * Maps feature names to their detection functions.
 * Some features return DetectionResult (with shape/location), others return boolean.
 */
const featureDetectors: Map<string, FeatureDetector> = new Map([
  ['Arc', (g, m) => ({ found: hasArc(g, m) })],
  ['Apex', (g, m) => ({ found: hasApex(g, m) })],
  ['Aperture', (g, m) => ({ found: hasAperture(g, m) })],
  ['Arm', (g, m) => ({ found: hasArm(g, m) })],
  ['Bar', (g, m) => ({ found: hasBar(g, m) })],
  ['Beak', (g, m) => ({ found: hasBeak(g, m) })],
  ['Bowl', (g, m) => ({ found: hasBowl(g, m) })],
  ['Bracket', (g, m) => ({ found: hasBracket(g, m) })],
  ['Counter', (g, m) => getCounter(g, m)],
  ['Cross stroke', (g, m) => ({ found: hasCrossStroke(g, m) })],
  ['Crossbar', (g, m) => ({ found: hasBar(g, m) })], // Crossbar maps to Bar
  ['Crotch', (g, m) => ({ found: hasCrotch(g, m) })],
  ['Ear', (g, m) => ({ found: hasEar(g, m) })],
  ['Eye', (g, m) => ({ found: hasEye(g, m) })],
  ['Finial', (g, m) => ({ found: hasFinial(g, m) })],
  ['Foot', (g, m) => ({ found: hasFoot(g, m) })],
  ['Hook', (g, m) => ({ found: hasHook(g, m) })],
  ['Leg', (g, m) => ({ found: hasLeg(g, m) })],
  ['Link', (g, m) => ({ found: hasLink(g, m) })],
  ['Loop', (g, m) => ({ found: hasLoop(g, m) })],
  ['Neck', (g, m) => ({ found: hasNeck(g, m) })],
  ['Serif', (g, m) => ({ found: hasSerif(g, m) })],
  ['Shoulder', (g, m) => ({ found: hasShoulder(g, m) })],
  ['Spine', (g, m) => ({ found: hasSpine(g, m) })],
  ['Spur', (g, m) => ({ found: hasSpur(g, m) })],
  ['Stem', (g, m, font) => ({ found: font ? hasStem(g, m, font) : false })],
  ['Tail', (g, m) => ({ found: hasTail(g, m) })],
  ['Terminal', (g, m) => getTerminal(g, m)],
  ['Tittle', (g, m, font) => getTittle(g, m, font)],
  ['Vertex', (g, m) => ({ found: hasVertex(g, m) })],
]);

/**
 * Detects a specific feature on a glyph.
 * @param featureName - Name of the feature to detect
 * @param glyph - Fontkit glyph object
 * @param metrics - Font metrics
 * @param font - Optional font instance (required for some features like Stem)
 * @returns DetectionResult with found flag and optional shape/location
 */
export function detectFeature(
  featureName: string,
  glyph: Glyph,
  metrics: Metrics,
  font?: Font
): DetectionResult {
  console.log(`[detectFeature] Detecting ${featureName}`, {
    glyphCode: glyph.codePoints?.[0] ?? glyph.id,
    glyphName: glyph.name,
    metrics,
    hasFont: !!font,
  });

  const detector = featureDetectors.get(featureName);
  if (!detector) {
    console.log(`[detectFeature] No detector found for ${featureName}`);
    return { found: false };
  }

  try {
    const result = detector(glyph, metrics, font);
    console.log(`[detectFeature] Raw result for ${featureName}:`, result);

    // Handle boolean results
    if (typeof result === 'boolean') {
      console.log(`[detectFeature] ${featureName} returned boolean:`, result);
      return { found: result };
    }

    // Handle DetectionResult or FeatureResult
    if (result && typeof result === 'object') {
      if ('found' in result) {
        const detectionResult = result as DetectionResult;
        console.log(
          `[detectFeature] ${featureName} detection result:`,
          detectionResult
        );
        return detectionResult;
      }
      // Handle FeatureResult from getCounter
      if ('shape' in result) {
        const featureResult = result as FeatureResult;
        console.log(
          `[detectFeature] ${featureName} returned FeatureResult with shape:`,
          featureResult
        );
        return {
          found: featureResult.found,
          shape: featureResult.shape,
        };
      }
    }

    console.log(
      `[detectFeature] ${featureName} returned unexpected result type`
    );
    return { found: false };
  } catch (error) {
    console.warn(`[detectFeature] Error detecting ${featureName}:`, error);
    return { found: false };
  }
}

/**
 * Detects multiple features at once for better performance.
 * @param featureNames - Array of feature names to detect
 * @param glyph - Fontkit glyph object
 * @param metrics - Font metrics
 * @param font - Optional font instance
 * @returns Map of feature names to their detection results
 */
export function detectFeatures(
  featureNames: string[],
  glyph: Glyph,
  metrics: Metrics,
  font?: Font
): Map<string, DetectionResult> {
  const results = new Map<string, DetectionResult>();

  for (const name of featureNames) {
    results.set(name, detectFeature(name, glyph, metrics, font));
  }

  return results;
}

/**
 * Gets all available feature names.
 */
export function getAvailableFeatures(): string[] {
  return Array.from(featureDetectors.keys());
}
