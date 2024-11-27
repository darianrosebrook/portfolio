'use client'
import React, { useState, useRef, useEffect } from 'react';
import Styles from './blueprints.module.scss';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react'; // Import useGSAP hook
import SvgIllustration from './svgIllustration';
import { useWindowSize } from './useWindowSize';
import { useScrollPosition } from './useScrollPosition';

gsap.registerPlugin(useGSAP);

const Blueprints: React.FC = () => {
  const winsize = useWindowSize();
  const gridRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 }); // Use ref to store mouse position

  const numRows = 9;
  const numCols = 12;
  const middleRowIndex = Math.floor(numRows / 2);
 
  const [svgs, setSvgs] = useState<string[]>([]); // Track SVG symbol IDs
  const percentInView = useScrollPosition(gridRef);

  useGSAP(() => {
    if (!gridRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = Array.from(gridRef.current.children) as HTMLElement[];

    // Handler to update mouse position
    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current.x = event.clientX;
      mousePos.current.y = event.clientY;
    };

    // Add event listener for desktop
    if (window.innerWidth > 768) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      // For mobile, update x based on scroll position as percentage of window width
      mousePos.current.x = percentInView * winsize.width;
    }

    // Use GSAP's ticker to update positions on every frame
    const tickerFunction = () => { 

      // Normalize mouse X position
      const normalizedMouseX = (mousePos.current.x / winsize.width) * 2 - 1;
      const targetTranslateX = normalizedMouseX * 12 * (winsize.width / 80);

      rows.forEach((row, index) => {
        const distanceFromMiddle = Math.abs(index - middleRowIndex);
        const factor = 1 - 0.2 * distanceFromMiddle;
        const targetX = targetTranslateX * factor;

        // Smoothly animate to the new position with easing
        gsap.to(row, {
          x: targetX,
          duration: 1.5, // Adjust duration for smoothness
          ease: 'power2.out', // Adjust easing type for the desired effect
        });
      });
    };

    gsap.ticker.add(tickerFunction);

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(tickerFunction);
    };
  }, { dependencies: [winsize.width, percentInView], scope: gridRef });

  useEffect(() => {
    const dsSprite = document.getElementById('DSSPRITE') as HTMLDivElement;
    if (dsSprite) {
      spriteRef.current = dsSprite;
      const symbols = Array.from(dsSprite.querySelectorAll('symbol'));
      setSvgs(symbols.map((symbol) => symbol.id)); // Update SVG IDs
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
