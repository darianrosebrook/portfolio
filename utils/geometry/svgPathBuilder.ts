/**
 * Utilities for converting path segments to SVG path data.
 * Used for rendering anatomy features as SVG elements instead of canvas.
 */

import type { FeaturePathSegment } from '@/utils/typeAnatomy/featureHighlight';

/**
 * Converts a FeaturePathSegment to an SVG path command string.
 * Outputs in FONT coordinates (Y-up) - the transform will handle conversion to screen.
 */
export function segmentToPathCommand(
  segment: FeaturePathSegment,
  _scale: number = 1 // Not used - kept for API compatibility
): string {
  const { type, points } = segment;

  if (points.length === 0) return '';

  switch (type) {
    case 'line':
      if (points.length < 2) return '';
      const [p0, p1] = points;
      // Output in font coordinates (Y-up) - transform handles conversion
      return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`;

    case 'quadratic':
      if (points.length < 3) return '';
      const [q0, qc, q1] = points;
      return `M ${q0.x} ${q0.y} Q ${qc.x} ${qc.y} ${q1.x} ${q1.y}`;

    case 'bezier':
      if (points.length < 4) return '';
      const [b0, bc1, bc2, b1] = points;
      return `M ${b0.x} ${b0.y} C ${bc1.x} ${bc1.y} ${bc2.x} ${bc2.y} ${b1.x} ${b1.y}`;

    default:
      return '';
  }
}

/**
 * Converts FeatureHighlight segments to a complete SVG path string.
 */
export function featureHighlightToPath(
  highlight: { segments: FeaturePathSegment[]; closed: boolean },
  scale: number = 1
): string {
  const commands = highlight.segments
    .map((seg) => segmentToPathCommand(seg, scale))
    .filter(Boolean)
    .join(' ');

  if (highlight.closed && commands) {
    return `${commands} Z`;
  }

  return commands;
}

/**
 * Converts fontkit glyph path commands to SVG path data with scaling and Y-axis inversion.
 */
export function glyphCommandsToPath(
  commands: Array<{ command: string; args: number[] }>,
  scale: number = 1
): string {
  const parts: string[] = [];

  for (const cmd of commands) {
    const { command, args } = cmd;
    const scaledArgs = args.map((a, i) =>
      i % 2 === 0 ? a * scale : -a * scale
    );

    switch (command) {
      case 'M':
        parts.push(`M ${scaledArgs[0]} ${scaledArgs[1]}`);
        break;
      case 'L':
        parts.push(`L ${scaledArgs[0]} ${scaledArgs[1]}`);
        break;
      case 'Q':
        parts.push(
          `Q ${scaledArgs[0]} ${scaledArgs[1]} ${scaledArgs[2]} ${scaledArgs[3]}`
        );
        break;
      case 'C':
        parts.push(
          `C ${scaledArgs[0]} ${scaledArgs[1]} ${scaledArgs[2]} ${scaledArgs[3]} ${scaledArgs[4]} ${scaledArgs[5]}`
        );
        break;
      case 'Z':
        parts.push('Z');
        break;
    }
  }

  return parts.join(' ');
}
