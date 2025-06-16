// Debug: confirm patch script is loaded

// Use ESM import for svg-intersections
import sgi from 'svg-intersections';
import * as kld from 'kld-intersections';
const { Point2D, Vector2D, CubicBezier2D, Intersection, Polynomial } = kld;

/**
 * Helper – ensure the incoming value is a Point2D instance
 */
function toPoint(obj) {
  // 1) BoundingBox?  – already has .min/.max; leave it alone
  if (obj && typeof obj.min === 'function' && typeof obj.max === 'function') {
    return obj; // let kld handle it
  }
  // 2) Legit Point2D instance
  if (obj instanceof Point2D) return obj;

  // 3) Plain {x,y} literal – promote to Point2D
  if (obj && typeof obj.x === 'number' && typeof obj.y === 'number') {
    const p = new Point2D(obj.x, obj.y);
    p.min = (q) => new Point2D(Math.min(p.x, q.x), Math.min(p.y, q.y));
    p.max = (q) => new Point2D(Math.max(p.x, q.x), Math.max(p.y, q.y));
    return p;
  }
  // 4) Anything else → fall back later, don't crash fontkit
  return null; // caller will trigger polyline fallback
}

/**
 * Replacement for kld-intersections' intersectBezier2Line
 * Handles degenerate + prototype-stripped inputs safely
 */
function safeIntersectBezier2Line(p1, p2, p3, a1, a2) {
  // console.log('[patch-kld] Called with:', { p1, p2, p3, a1, a2 });
  // normalise all inputs
  p1 = toPoint(p1);
  p2 = toPoint(p2);
  p3 = toPoint(p3);
  a1 = toPoint(a1);
  a2 = toPoint(a2);

  // If any are null, fallback to polyline intersection
  if (!p1 || !p2 || !p3 || !a1 || !a2) {
    const result = Intersection.intersectPolylinePolyline(
      [p1, p2, p3].filter(Boolean),
      [a1, a2].filter(Boolean)
    );
    if (!(result instanceof Intersection)) {
      console.error(
        '[patch-kld] Polyline fallback did not return Intersection:',
        result
      );
      console.error('[patch-kld] Stack trace:', new Error().stack);
      return new Intersection(); // Always return Intersection
    }
    // console.log('[patch-kld] Polyline fallback result:', result);
    return result;
  }

  // early-exit if the line segment degenerates to a point
  if (a1.x === a2.x && a1.y === a2.y) {
    // console.log(
    //   '[patch-kld] Line segment degenerate, returning empty Intersection'
    // );
    return new Intersection();
  }

  // --- ORIGINAL ALGORITHM, UNCHANGED  -------------------------------
  let a, b;
  let c2, c1, c0;
  let cl;
  let n;
  const min = a1.min(a2);
  const max = a1.max(a2);
  const result = new Intersection();

  a = p2.multiply(-2);
  c2 = p1.add(a.add(p3));

  a = p1.multiply(-2);
  b = p2.multiply(2);
  c1 = a.add(b);

  c0 = new Point2D(p1.x, p1.y);

  n = new Vector2D(a1.y - a2.y, a2.x - a1.x);
  cl = a1.x * a2.y - a2.x * a1.y;

  const roots = new Polynomial(n.dot(c2), n.dot(c1), n.dot(c0) + cl).getRoots();
  // console.log('[patch-kld] Roots:', roots);
  for (const t of roots) {
    if (t < 0 || t > 1) continue;

    const p4 = p1.lerp(p2, t);
    const p5 = p2.lerp(p3, t);
    const p6 = p4.lerp(p5, t);

    if (
      (a1.x === a2.x && p6.y >= min.y && p6.y <= max.y) ||
      (a1.y === a2.y && p6.x >= min.x && p6.x <= max.x) ||
      (p6.x >= min.x && p6.x <= max.x && p6.y >= min.y && p6.y <= max.y)
    ) {
      result.appendPoint(p6);
    }
  }

  // ------------------------------------------------------------------

  // Fallback for numerical instability
  if (result.points.length === 0 && roots.length > 4) {
    const flat = new CubicBezier2D(p1, p2, p3, p3).toPolygon2D().points;
    const line = [a1, a2];
    const alt = Intersection.intersectPolylinePolyline(flat, line);
    if (!(alt instanceof Intersection)) {
      console.error(
        '[patch-kld] Alt fallback did not return Intersection:',
        alt
      );
      console.error('[patch-kld] Stack trace:', new Error().stack);
      return new Intersection();
    }
    // console.log('[patch-kld] Alt fallback result:', alt);
    return alt;
  }

  // Final return value logging
  if (!(result instanceof Intersection)) {
    console.error('[patch-kld] Final result is not Intersection:', result);
    console.error('[patch-kld] Stack trace:', new Error().stack);
  } else {
    // console.log('[patch-kld] Returning Intersection:', result);
  }
  return result;
}

// ---------------------------------------------------------
// Inject the patch (ESM example)
try {
  if (
    kld &&
    kld.Intersection &&
    typeof kld.Intersection.intersectBezier2Line === 'function'
  ) {
    // console.log('[patch-kld] Before static patch:', {
    //   intersectBezier2Line: kld.Intersection.intersectBezier2Line,
    // });
    kld.Intersection.intersectBezier2Line = safeIntersectBezier2Line;
    // console.log('[patch-kld] After static patch:', {
    //   intersectBezier2Line: kld.Intersection.intersectBezier2Line,
    // });
    // console.log('[patch-kld] Patched static intersectBezier2Line');
  } else {
    //  console.log('[patch-kld] kld.Intersection.intersectBezier2Line not found');
  }
} catch (e) {
  console.warn(
    '[patch-kld] Could not patch kld-intersections static method:',
    e
  );
}
