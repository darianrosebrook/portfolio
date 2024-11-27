'use client'
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Styles from './blueprints.module.scss';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SvgIllustration from './svgIllustration';
import { useWindowSize } from './useWindowSize';
import { useScrollPosition } from './useScrollPosition';

gsap.registerPlugin(useGSAP);

const Blueprints: React.FC = () => {
  const winsize = useWindowSize();
  const gridRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  const numRows = 9;
  const numCols = 12;
  const middleRowIndex = Math.floor(numRows / 2);
 
  const [svgs, setSvgs] = useState<string[]>([]);
  const percentInView = useScrollPosition(gridRef);

  const rows = useMemo(() => {
    return gridRef.current ? Array.from(gridRef.current.children) as HTMLElement[] : [];
  }, [ ]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    mousePos.current.x = event.clientX;
    mousePos.current.y = event.clientY;
  }, []);

  const tickerFunction = useCallback(() => { 

    const normalizedMouseX = (mousePos.current.x / winsize.width) * 2 - 1;
    const targetTranslateX = normalizedMouseX * 12 * (winsize.width / 80);

    rows.forEach((row, index) => {
      const distanceFromMiddle = Math.abs(index - middleRowIndex);
      const factor = 1 - 0.2 * distanceFromMiddle;
      const targetX = targetTranslateX * factor;

      gsap.to(row, {
        x: targetX,
        duration: 1.5,
        ease: 'power2.out',
      });
    });
  }, [ rows,   winsize.width, middleRowIndex]);

  useGSAP(() => {
    if (!gridRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (window.innerWidth > 768) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      mousePos.current.x = percentInView * winsize.width;
    }

    gsap.ticker.add(tickerFunction);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(tickerFunction);
    };
  }, [handleMouseMove, tickerFunction, percentInView, winsize.width]);

  useEffect(() => {
    const dsSprite = document.getElementById('DSSPRITE') as HTMLDivElement;
    if (dsSprite) {
      spriteRef.current = dsSprite;
      const symbols = Array.from(dsSprite.querySelectorAll('symbol'));
      setSvgs(symbols.map((symbol) => symbol.id));
    }
  }, []);

  return (
    <div
      className={Styles.gridContainer} 
    >
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
