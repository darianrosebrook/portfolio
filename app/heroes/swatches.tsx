'use client';
import React, { useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import Style from './swatches.module.scss';
import { useWindowSize } from './useWindowSize';
import { useMouseEvent } from '@/context';

export default function Swatches() {
  const gridRef = useRef<HTMLDivElement>(null);
  const winsize = useWindowSize();
  const mousePosition = useMouseEvent();

  // 1) Hold a pair of quickTo functions (toX, toY) for each swatch
  const quickToRefs = useRef<
    { toX: gsap.QuickToFunc; toY: gsap.QuickToFunc }[]
  >([]);

  // 2) Create those quickTo tweens only once, when the grid first renders
  useLayoutEffect(() => {
    if (!gridRef.current) return;

    quickToRefs.current = Array.from(gridRef.current.children).map(
      (el) => {
        const node = el as HTMLElement;
        return {
          toX: gsap.quickTo(node, 'x', {
            duration: 0.5,
            ease: 'power1.out',
          }),
          toY: gsap.quickTo(node, 'y', {
            duration: 0.5,
            ease: 'power1.out',
          }),
        };
      }
    );

    // Cleanup on unmount (optional)
    return () => {
      quickToRefs.current.forEach(({ toX, toY }) => {
        gsap.killTweensOf(toX);
        gsap.killTweensOf(toY);
      });
      quickToRefs.current = [];
    };
  }, []);

  // 3) Encapsulate your animation logic
  const animateSwatches = useCallback(() => {
    if (!gridRef.current) return;
    const gridRect = gridRef.current.getBoundingClientRect();

    // Normalize mouse to a -0.5 → +0.5 range
    const mouseX = mousePosition.x - (gridRect.left + gridRect.width / 2);
    const mousePercent = mouseX / gridRect.width;

    const amplitude = 256;
    const frequency = 0.14;

    quickToRefs.current.forEach(({ toX, toY }, i) => {
      // horizontal slide
      const x = (gridRect.width - (gridRef.current!.children[i] as HTMLElement)
        .offsetWidth) *
        (mousePercent + 0.5);

      // sine-wave vertical
      const y =
        Math.sin(i * frequency + mousePercent * Math.PI) * amplitude;

      toX(x);
      toY(y);
    });
  }, [mousePosition.x, mousePosition.y, winsize.width]);

  // 4) Trigger on mouse or size changes — batched in one rAF tick
  useEffect(() => {
    let raf: number;

    const tick = () => {
      animateSwatches();
      raf = requestAnimationFrame(tick);
    };

    // start a single loop
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animateSwatches, mousePosition.x, mousePosition.y, winsize.width]);

  return (
    <div className={Style.gridContainer}>
      <div className={Style.gridContent} ref={gridRef}>
        {/* …your ColorSwatch mapping here… */}
      </div>
    </div>
  );
}
