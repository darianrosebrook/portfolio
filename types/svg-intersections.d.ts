// Minimal ambient type declaration for svg-intersections
// Allows type-safe imports in geometryHeuristics and related modules
import './geometry/patch-kld';
declare module 'svg-intersections' {
  import type { Point2D } from '@/utils/geometry/geometry';
  export function shape(type: string, opts: unknown): unknown;
  export function intersect(
    a: unknown,
    b: unknown
  ): { status: string; points: Point2D[] };
}
