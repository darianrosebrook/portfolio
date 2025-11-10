/**
 * Glyph shape and overshoot caching utilities for geometry/feature detection.
 *
 * NOTE: This file now re-exports from geometryCore.ts to avoid duplication.
 * The actual implementations are in utils/geometry/geometryCore.ts
 *
 * @deprecated Import directly from '@/utils/geometry/geometryCore' instead
 * This file is kept for backward compatibility only.
 */
export {
  shapeForV2,
  getOvershoot,
  type SvgShape,
} from '../geometry/geometryCore';
