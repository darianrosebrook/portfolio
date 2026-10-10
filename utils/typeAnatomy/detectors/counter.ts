import { counterSpaces } from '../evidence/counterSpaces';
import type { FeatureInstance, GeometryCache } from '../types';

/** Enclosed and partly enclosed negative space bounded by current glyph walls. */
export function detectCounter(geo: GeometryCache): FeatureInstance[] {
  return counterSpaces(geo.glyph, geo.metrics, geo).map((space) => ({
    id: 'counter',
    shape: { type: 'polyline', points: space.points },
    region: { kind: 'enclosed', points: space.points },
    confidence: 0.9,
    anchors: {
      center: { ...space.seed },
      ...(space.mouthStart && space.mouthEnd
        ? { mouthStart: space.mouthStart, mouthEnd: space.mouthEnd }
        : {}),
    },
    debug: {
      source:
        space.closure === 'closed'
          ? 'closed-fill-component'
          : 'opposed-open-counter-walls',
      closure: space.closure,
      bodyIndex: space.bodyIndex,
      holeIndex: space.holeIndex,
    },
  }));
}
