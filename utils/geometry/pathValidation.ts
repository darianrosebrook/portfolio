/**
 * Path validation utilities for security and robustness.
 *
 * Guards against malicious or malformed path data that could cause:
 * - Memory exhaustion (huge coordinate ranges)
 * - NaN/Infinity values
 * - Extremely long path strings
 * - Invalid command sequences
 */

export interface PathValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a path command array for security and correctness.
 *
 * @param commands - Array of path commands to validate
 * @returns Validation result with errors and warnings
 */
export function validatePathCommands(
  commands: Array<{ command: string; args: number[] }>
): PathValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Maximum reasonable values
  const MAX_COORDINATE = 1e6; // 1 million font units
  const MAX_COMMANDS = 10000; // Reasonable limit for complex glyphs
  const MAX_PATH_LENGTH = 1e7; // 10 million characters

  if (commands.length > MAX_COMMANDS) {
    errors.push(
      `Path has too many commands: ${commands.length} (max: ${MAX_COMMANDS})`
    );
    return { isValid: false, errors, warnings };
  }

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    const { command, args } = cmd;

    // Validate command type
    const validCommands = [
      'M',
      'L',
      'Q',
      'C',
      'Z',
      'moveTo',
      'lineTo',
      'quadraticCurveTo',
      'bezierCurveTo',
      'closePath',
    ];
    if (!validCommands.includes(command)) {
      errors.push(`Invalid command at index ${i}: ${command}`);
      continue;
    }

    // Validate argument count
    const expectedArgs: Record<string, number> = {
      M: 2,
      L: 2,
      Q: 4,
      C: 6,
      Z: 0,
      moveTo: 2,
      lineTo: 2,
      quadraticCurveTo: 4,
      bezierCurveTo: 6,
      closePath: 0,
    };

    const expected = expectedArgs[command];
    if (expected !== undefined && args.length !== expected) {
      errors.push(
        `Command ${command} at index ${i} has wrong number of args: ${args.length} (expected: ${expected})`
      );
      continue;
    }

    // Validate argument values
    for (let j = 0; j < args.length; j++) {
      const arg = args[j];

      // Check for NaN
      if (Number.isNaN(arg)) {
        errors.push(`NaN value at command ${i}, arg ${j}`);
        continue;
      }

      // Check for Infinity
      if (!Number.isFinite(arg)) {
        errors.push(`Infinity value at command ${i}, arg ${j}`);
        continue;
      }

      // Check for extreme values
      if (Math.abs(arg) > MAX_COORDINATE) {
        warnings.push(
          `Extreme coordinate value at command ${i}, arg ${j}: ${arg}`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates and sanitizes SVG path data string.
 *
 * @param pathData - SVG path data string
 * @returns Validation result
 */
export function validateSVGPathData(pathData: string): PathValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const MAX_PATH_LENGTH = 1e7; // 10 million characters

  if (!pathData || typeof pathData !== 'string') {
    errors.push('Path data must be a non-empty string');
    return { isValid: false, errors, warnings };
  }

  if (pathData.length > MAX_PATH_LENGTH) {
    errors.push(
      `Path data too long: ${pathData.length} characters (max: ${MAX_PATH_LENGTH})`
    );
    return { isValid: false, errors, warnings };
  }

  // Basic syntax check - look for valid SVG path commands
  const validCommands = /[MmLlHhVvCcSsQqTtAaZz\s,.\-0-9]/;
  if (!validCommands.test(pathData)) {
    warnings.push('Path data contains potentially invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Clamps coordinates to reasonable bounds.
 *
 * @param value - Coordinate value to clamp
 * @param max - Maximum absolute value (default: 1e6)
 * @returns Clamped value
 */
export function clampCoordinate(value: number, max: number = 1e6): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(-max, Math.min(max, value));
}

/**
 * Sanitizes a path command array by clamping extreme values.
 *
 * @param commands - Path commands to sanitize
 * @returns Sanitized commands (new array)
 */
export function sanitizePathCommands(
  commands: Array<{ command: string; args: number[] }>
): Array<{ command: string; args: number[] }> {
  return commands.map((cmd) => ({
    command: cmd.command,
    args: cmd.args.map((arg) => clampCoordinate(arg)),
  }));
}

/**
 * Safe wrapper for path operations that validates and handles errors.
 *
 * @param operation - Function that performs path operation
 * @param glyphId - Glyph identifier for error reporting
 * @param commandIndex - Command index for error reporting
 * @returns Result or null if validation fails
 */
export function safePathOperation<T>(
  operation: () => T,
  glyphId?: string | number,
  commandIndex?: number
): T | null {
  try {
    const result = operation();
    return result;
  } catch (error) {
    const context = [
      glyphId !== undefined && `glyph: ${glyphId}`,
      commandIndex !== undefined && `command: ${commandIndex}`,
    ]
      .filter(Boolean)
      .join(', ');

    console.error(
      `[safePathOperation] Error processing path${context ? ` (${context})` : ''}:`,
      error
    );
    return null;
  }
}
