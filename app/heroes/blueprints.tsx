'use client';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Styles from './blueprints.module.scss';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SvgIllustration from './svgIllustration';
import { useInteraction } from '@/context';

gsap.registerPlugin(useGSAP);

const Blueprints: React.FC = () => {
  const { window: winsize, scroll, mouse } = useInteraction();
  const gridRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement | null>(null);

  const numRows = 9;
  const numCols = 12;
  const middleRowIndex = useMemo(() => Math.floor(numRows / 2), []);

  const [svgs, setSvgs] = useState<string[]>([]);

  // Hold our quickTo functions in refs so they survive re-renders
  const toX = useRef<((x: number) => void)[]>([]);

  // 1) Once on mount or when grid changes: build quickTo tweens for each row
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const rows = Array.from(grid.children) as HTMLElement[];
    toX.current = rows.map((el) =>
      gsap.quickTo(el, 'x', { duration: 1.5, ease: 'power2.out' })
    );
  }, [svgs.length]);

  // Memoize animation calculations
  const calculateTargetX = useCallback(
    (interactionX: number, distanceFromMiddle: number) => {
      const distanceModifier = 0.2;
      const normalizedMouseX = (interactionX / winsize.width) * 2 - 1;
      const targetTranslateX = normalizedMouseX * 12 * (winsize.width / 80);
      const factor = 1 - distanceModifier * distanceFromMiddle;
      return targetTranslateX * factor;
    },
    [winsize.width]
  );

  // Animation loop for mouse movement - optimized
  useEffect(() => {
    let frameId: number;
    let rafRunning = true;
    
    const animate = () => {
      if (!rafRunning) return;
      
      const grid = gridRef.current;
      if (!grid) {
        rafRunning = false;
        return;
      }
      
      const rows = Array.from(grid.children) as HTMLElement[];
      const { x, hasMouseMoved } = mouse;
      
      let interactionX: number;
      if (hasMouseMoved) {
        interactionX = x;
      } else {
        const rect = grid.getBoundingClientRect();
        interactionX = rect.left + rect.width / 2 + (scroll.y * rect.width) / 2;
      }
      
      rows.forEach((row, index) => {
        const distanceFromMiddle = Math.abs(index - middleRowIndex);
        const targetX = calculateTargetX(interactionX, distanceFromMiddle);
        const tweenFn = toX.current[index];
        if (tweenFn) tweenFn(targetX);
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
  }, [mouse, scroll.y, middleRowIndex, calculateTargetX]);

  useEffect(() => {
    const dsSprite = document.getElementById('DSSPRITE') as HTMLDivElement;
    if (dsSprite) {
      spriteRef.current = dsSprite;
      const symbols = Array.from(dsSprite.querySelectorAll('symbol'));
      setSvgs(symbols.map((symbol) => symbol.id));
    }
  }, []);

  return (
    <div className={Styles.gridContainer}>
      <div className={Styles.gridContent} ref={gridRef}>
        {svgs.length > 0 &&
          Array.from({ length: numRows }, (_, i) => (
            <div key={i} className={Styles.row}>
              {Array.from({ length: numCols }, (_, j) => (
                <div
                  key={j}
                  className={`${Styles.cell} ${
                    i === middleRowIndex && j === Math.floor(numCols / 2)
                      ? Styles.middleCell
                      : ''
                  }`}
                >
                  <SvgIllustration name={svgs[(i + j) % svgs.length]} />
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default React.memo(Blueprints);
