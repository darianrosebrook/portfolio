/**
 * Two-dimensional point representation.
 *
 * Basic geometric primitive for representing coordinates in 2D space.
 * Used throughout the geometry system for calculations and transformations.
 */
export type Point2D = {
  /** X coordinate in 2D space */
  x: number;
  /** Y coordinate in 2D space */
  y: number;
};

/**
 * Legacy type alias for backward compatibility.
 * @deprecated Use Point2D instead
 */
export type point2d = Point2D;
