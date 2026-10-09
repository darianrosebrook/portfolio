import type { Glyph } from 'fontkit';
import type { Metrics } from './types';
import { getTerminal } from './terminal';

/** A non-serif, non-ball stroke ending; flat caps remain legitimate endings. */
export function hasFinial(glyph: Glyph, metrics: Metrics): boolean {
  const terminal = getTerminal(glyph, metrics);
  return terminal.found && terminal.shape?.type !== 'circle';
}
