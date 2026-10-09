import type { Glyph } from 'fontkit';
import { junctionPoints } from './detectors/apex';
import type { Metrics } from './index';
/** The angle on the empty side of a diagonal stroke junction. */
export function hasCrotch(g: Glyph, m: Metrics): boolean {
  return junctionPoints(g, m, 'crotch').length > 0;
}
