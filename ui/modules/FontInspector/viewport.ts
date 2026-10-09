import { useLayoutEffect, useState, type RefObject } from 'react';
import type { Font, Glyph } from './fontkit-types';

/** Observe CSS dimensions without writing them back into layout. */
export function useViewportSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0, pixelRatio: 1 });
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const rect = element.getBoundingClientRect();
      const width = element.clientWidth || rect.width;
      const height = element.clientHeight || rect.height;
      const pixelRatio = window.devicePixelRatio || 1;
      setSize((previous) =>
        previous.width === width &&
        previous.height === height &&
        previous.pixelRatio === pixelRatio
          ? previous
          : { width, height, pixelRatio }
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('resize', update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref]);
  return size;
}

/** Fit both renderers to the same design-unit bounds and positive viewport. */
export function glyphViewport(
  width: number,
  height: number,
  font: Font,
  glyph: Glyph
) {
  if (!(width > 0 && height > 0)) return null;
  const top = Math.min(96, Math.max(64, height * 0.22), height * 0.55);
  const bottom = Math.min(64, height * 0.18);
  const horizontal = Math.min(128, width * 0.2);
  const minY = Math.min(font.descent, glyph.bbox.minY, 0);
  const maxY = Math.max(font.ascent, glyph.bbox.maxY, 1);
  const minX = Math.min(0, glyph.bbox.minX);
  const maxX = Math.max(glyph.advanceWidth, glyph.bbox.maxX, 1);
  const scale = Math.min(
    (width - horizontal) / (maxX - minX),
    (height - top - bottom) / (maxY - minY)
  );
  return {
    width,
    height,
    scale,
    xOffset: (width - (maxX - minX) * scale) / 2 - minX * scale,
    baseline: height - bottom + minY * scale,
  };
}
