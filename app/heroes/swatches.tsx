'use client';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Style from './swatches.module.scss';
import { useInteraction } from '@/context';
import { gsap } from 'gsap';
import { linearInterpolation } from '@/utils/helpers';
import { ColorSwatch } from './ColorSwatch';
import { colorPalette } from './ColorPalette';

const Swatches = () => {
  const colors = useMemo(() => colorPalette, []);
  const gridRef = useRef<HTMLDivElement>(null);

  // Hold our quickTo functions in refs so they survive re-renders
  const toX = useRef<((x: number) => void)[]>([]);
  const toY = useRef<((y: number) => void)[]>([]);

  const { window: winsize, scroll, mouse } = useInteraction();

  // track if container is in view, if in view, allow animation
  const [isInView, setIsInView] = useState(false);
  
  // Optimized IntersectionObserver with better options
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsInView(
          entries[0].isIntersecting && entries[0].intersectionRatio > 0.05
        );
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.05, 0.5, 1],
      }
    );
    
    observer.observe(grid);
    return () => observer.disconnect();
  }, []); // Empty deps - only set up once

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
  }, [colors.length]); // Only re-run if colors change

  // Memoize animation calculations
  const calculateAnimationValues = useCallback(
    (rect: DOMRect, interactionX: number) => {
      const mouseX = interactionX - rect.left - winsize.width;
      const mousePercent = mouseX / rect.width / 2;
      const mouseCenter = mouseX / rect.width;
      return { mousePercent, mouseCenter };
    },
    [winsize.width]
  );

  // Animation loop for mouse movement - optimized with early returns
  useEffect(() => {
    if (!isInView) return;
    
    let frameId: number;
    let rafRunning = true;
    
    const animate = () => {
      if (!rafRunning) return;
      
      const grid = gridRef.current;
      if (!grid) {
        rafRunning = false;
        return;
      }
      
      const rect = grid.getBoundingClientRect();
      const { x, hasMouseMoved } = mouse;
      
      let interactionX: number;
      if (hasMouseMoved) {
        interactionX = x;
      } else {
        interactionX = rect.left + rect.width / 2 + (scroll.y * rect.width) / 2;
      }
      
      const { mousePercent, mouseCenter } = calculateAnimationValues(rect, interactionX);
      const amplitude = 256;
      const freq = 0.14;

      const swatches = Array.from(grid.children) as HTMLElement[];
      toX.current.forEach((tweenFn, i) => {
        const sw = swatches[i];
        if (!sw) return;
        
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
      
      if (rafRunning) {
        frameId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => {
      rafRunning = false;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [mouse, scroll.y, isInView, calculateAnimationValues]);

  return (
    <div className={`${Style.gridContainer}`}>
      <div
        className={`${Style.colorSwatchContainer} ${Style.gridContent}`}
        ref={gridRef}
      >
        {colors.map((swatch, i) => {
          const zIndex = 100 - i;
          return (
            <div key={swatch.token} className={Style.colorSwatch} style={{ zIndex }}>
              <ColorSwatch {...swatch} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { Swatches };
