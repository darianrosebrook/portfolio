'use client';
import React, { useEffect, useRef } from 'react';
import Style from './swatches.module.scss';
import { useWindowSize } from '../../context/useWindowSize';
import { gsap } from 'gsap';
import { linearInterpolation } from '@/utils';
import { useMouseEvent } from '@/context';
import { ColorSwatch } from './ColorSwatch';
import { colorPalette } from './ColorPalette';
import { useScrollPosition } from '../../context/useScrollPosition';

const Swatches = () => {
  const colors = React.useMemo(() => colorPalette, []);
  const gridRef = useRef<HTMLDivElement>(null);

  // Hold our quickTo functions in refs so they survive re-renders
  const toX = useRef<((x: number) => void)[]>([]);
  const toY = useRef<((y: number) => void)[]>([]);

  const winsize = useWindowSize();
  const mousePosition = useMouseEvent();
  const percentFromMiddle = useScrollPosition(gridRef);

  // 1) Once on mount: grab each swatch element and build its quickTo tweens
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const swatches = Array.from(grid.children) as HTMLElement[];
    toX.current = swatches.map((el) =>
      gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power1.out' })
    );
    toY.current = swatches.map((el) =>
      gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power1.out' })
    );
  }, []);

  // Animation loop for mouse movement
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      const grid = gridRef.current;
      if (!grid) return;
      if (Math.abs(percentFromMiddle) >= 0.6) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      const rect = grid.getBoundingClientRect();
      const mouseX = mousePosition.getPosition().x - rect.left - winsize.width;
      const mousePercent = mouseX / rect.width / 2;
      const mouseCenter = mouseX / rect.width;

      const amplitude = 256;
      const freq = 0.14;

      toX.current.forEach((tweenFn, i) => {
        const sw = grid.children[i] as HTMLElement;
        const x = linearInterpolation(
          0,
          rect.width - sw.offsetWidth,
          mousePercent
        );
        tweenFn(x);
      });

      toY.current.forEach((tweenFn, i) => {
        const y = Math.sin(i * freq + mouseCenter * Math.PI) * amplitude;
        tweenFn(y);
      });
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [mousePosition, winsize.width, gridRef, percentFromMiddle]);

  return (
    <div className={`${Style.gridContainer}`}>
      <div
        className={`${Style.colorSwatchContainer} ${Style.gridContent}`}
        ref={gridRef}
      >
        {colors.map((swatch, i) => {
          const zIndex = 100 - i;
          return (
            <div key={i} className={Style.colorSwatch} style={{ zIndex }}>
              <ColorSwatch {...swatch} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { Swatches };
