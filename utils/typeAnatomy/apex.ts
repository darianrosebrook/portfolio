import type { Glyph } from 'fontkit';
import { junctionPoints } from './detectors/apex';
import type { Metrics } from './index';
/** A top meeting of opposed diagonals on the actual occupied boundary. */
export function hasApex(g: Glyph, m: Metrics): boolean {
  return junctionPoints(g, m, 'apex').length > 0;
}
