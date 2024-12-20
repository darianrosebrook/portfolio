'use client'
import React, { useState, useRef, useEffect } from 'react';
import Styles from './blueprints.module.scss';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SvgIllustration from './svgIllustration';
import { useWindowSize } from './useWindowSize'; 
import { useMouseEvent } from '@/context';

gsap.registerPlugin(useGSAP);

const Blueprints: React.FC = () => {
  const winsize = useWindowSize();
  const gridRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);  

  const numRows = 9;
  const numCols = 12;
  const middleRowIndex = Math.floor(numRows / 2); 

  const [svgs, setSvgs] = useState<string[]>([]);  
  const mouse = useMouseEvent()  

  useGSAP(() => { 
    if (!gridRef.current) return; 

    const rows = Array.from(gridRef.current.children) as HTMLElement[]; 
    const distanceModifier = 0.2; 
 
      const normalizedMouseX = (mouse.x / winsize.width) * 2 - 1; 
      const targetTranslateX = normalizedMouseX * 12 * (winsize.width / 80);

      rows.forEach((row, index) => {
        const distanceFromMiddle = Math.abs(index - middleRowIndex);
        const factor = 1 - distanceModifier * distanceFromMiddle;
        const targetX = targetTranslateX * factor;
        const toX = gsap.quickTo(row, 'x',{
          duration: 1.5,
          ease: 'power2.out',
        });

        toX(targetX);

      });  
  }, [ winsize.width, gridRef, mouse]);

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
