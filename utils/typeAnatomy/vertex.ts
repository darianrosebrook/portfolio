import type { Glyph } from 'fontkit';
import { junctionPoints } from './detectors/apex';
import type { Metrics } from './index';
/** A lower diagonal meeting excludes ordinary caps and free leg ends. */
export function hasVertex(g: Glyph, m: Metrics): boolean {
  return junctionPoints(g, m, 'vertex').length > 0;
}
