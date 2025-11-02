/**
 * Path normalization utilities for font glyph paths.
 *
 * Normalizes path commands to ensure:
 * - No zero-length segments
 * - Collinear segments are merged
 * - Proper subpath closure
 * - Preserved command indices for debugging
 */

export interface PathCommand {
  command: string;
  args: number[];
  /** Original index in the command array (for debugging) */
  originalIndex?: number;
}

/**
 * Tolerance for considering points/segments as equal
 */
const EPSILON = 1e-6;

/**
 * Checks if two points are effectively the same (within epsilon)
 */
function pointsEqual(p1: [number, number], p2: [number, number]): boolean {
  return Math.abs(p1[0] - p2[0]) < EPSILON && Math.abs(p1[1] - p2[1]) < EPSILON;
}

/**
 * Checks if a line segment has zero length
 */
function isZeroLength(p0: [number, number], p1: [number, number]): boolean {
  return pointsEqual(p0, p1);
}

/**
 * Checks if three points are collinear (within tolerance)
 */
function areCollinear(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number]
): boolean {
  // Cross product approach: if cross product is near zero, points are collinear
  const dx1 = p1[0] - p0[0];
  const dy1 = p1[1] - p0[1];
  const dx2 = p2[0] - p1[0];
  const dy2 = p2[1] - p1[1];

  const cross = dx1 * dy2 - dy1 * dx2;
  return Math.abs(cross) < EPSILON;
}

/**
 * Gets the endpoint of a command
 */
function getCommandEndpoint(cmd: PathCommand): [number, number] | null {
  const { command, args } = cmd;

  switch (command) {
    case 'M':
    case 'L':
      return args.length >= 2 ? [args[0], args[1]] : null;
    case 'Q':
      return args.length >= 4 ? [args[2], args[3]] : null;
    case 'C':
      return args.length >= 6 ? [args[4], args[5]] : null;
    case 'Z':
      return null; // Z doesn't have explicit endpoint
    default:
      return null;
  }
}

/**
 * Normalizes a path command array by:
 * - Removing zero-length segments
 * - Merging consecutive collinear segments
 * - Ensuring subpath closure parity
 * - Preserving original command indices
 *
 * @param commands - Array of path commands from fontkit
 * @returns Normalized command array with preserved indices
 */
export function normalizePath(
  commands: Array<{ command: string; args: number[] }>
): PathCommand[] {
  if (commands.length === 0) return [];

  const normalized: PathCommand[] = [];
  let currentSubpathStart: [number, number] | null = null;
  let lastPoint: [number, number] | null = null;
  let subpathOpen = false;

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    const normalizedCmd: PathCommand = {
      ...cmd,
      originalIndex: i,
    };

    // Handle moveTo - starts a new subpath
    if (cmd.command === 'M') {
      // Close previous subpath if it wasn't explicitly closed
      if (subpathOpen && lastPoint && currentSubpathStart) {
        if (!pointsEqual(lastPoint, currentSubpathStart)) {
          normalized.push({
            command: 'Z',
            args: [],
            originalIndex: i - 0.5, // Indicate implicit closure
          });
        }
      }

      if (cmd.args.length >= 2) {
        currentSubpathStart = [cmd.args[0], cmd.args[1]];
        lastPoint = currentSubpathStart;
        subpathOpen = true;
        normalized.push(normalizedCmd);
      }
      continue;
    }

    // Handle closePath
    if (cmd.command === 'Z') {
      if (subpathOpen && lastPoint && currentSubpathStart) {
        // Only add Z if we're not already at the start point
        if (!pointsEqual(lastPoint, currentSubpathStart)) {
          normalized.push(normalizedCmd);
        }
        subpathOpen = false;
        lastPoint = null;
        currentSubpathStart = null;
      }
      continue;
    }

    // Skip if we don't have a valid starting point
    if (!lastPoint) {
      continue;
    }

    const endpoint = getCommandEndpoint(normalizedCmd);
    if (!endpoint) {
      continue;
    }

    // Check for zero-length segments
    if (isZeroLength(lastPoint, endpoint)) {
      // Skip zero-length segments (except for curves which might have valid control points)
      // For curves, we keep them if they have control points that differ from endpoints
      if (cmd.command === 'L') {
        continue; // Skip zero-length lines
      }
      // For curves, we might want to keep them if control points are different
      // But typically zero-length curves should also be skipped
      if (cmd.command === 'Q' || cmd.command === 'C') {
        // Check if all points are the same
        let allSame = true;
        if (cmd.command === 'Q' && cmd.args.length >= 4) {
          allSame =
            pointsEqual(lastPoint, [cmd.args[0], cmd.args[1]]) &&
            pointsEqual(lastPoint, endpoint);
        } else if (cmd.command === 'C' && cmd.args.length >= 6) {
          allSame =
            pointsEqual(lastPoint, [cmd.args[0], cmd.args[1]]) &&
            pointsEqual(lastPoint, [cmd.args[2], cmd.args[3]]) &&
            pointsEqual(lastPoint, endpoint);
        }
        if (allSame) {
          continue; // Skip zero-length curve
        }
      }
    }

    // Try to merge consecutive collinear line segments
    if (cmd.command === 'L' && normalized.length > 0) {
      const prevCmd = normalized[normalized.length - 1];

      // If previous command is also a line, check if we can merge
      if (prevCmd.command === 'L') {
        const prevEndpoint = getCommandEndpoint(prevCmd);
        if (prevEndpoint && areCollinear(lastPoint, prevEndpoint, endpoint)) {
          // Merge: replace previous line with new endpoint
          normalized[normalized.length - 1] = {
            command: 'L',
            args: [endpoint[0], endpoint[1]],
            originalIndex: prevCmd.originalIndex, // Keep first index
          };
          lastPoint = endpoint;
          continue;
        }
      }
    }

    // Add the command
    normalized.push(normalizedCmd);
    lastPoint = endpoint;
  }

  // Close final subpath if needed
  if (subpathOpen && lastPoint && currentSubpathStart) {
    if (!pointsEqual(lastPoint, currentSubpathStart)) {
      normalized.push({
        command: 'Z',
        args: [],
        originalIndex: commands.length - 0.5, // Indicate implicit closure
      });
    }
  }

  return normalized;
}

/**
 * Determines the appropriate fill rule for a glyph based on its contours.
 *
 * Most fonts use "nonzero" fill rule. "evenodd" is needed for:
 * - Glyphs with overlapping contours that should create holes
 * - Certain complex ligatures
 * - Some decorative fonts
 *
 * @param _commands - Normalized path commands (reserved for future analysis)
 * @returns 'nonzero' or 'evenodd'
 */
export function determineFillRule(
  _commands: PathCommand[]
): 'nonzero' | 'evenodd' {
  // For now, default to nonzero as most fonts use this
  // In the future, we could analyze the glyph structure to determine
  // if evenodd is needed (e.g., detect overlapping contours)
  return 'nonzero';
}
