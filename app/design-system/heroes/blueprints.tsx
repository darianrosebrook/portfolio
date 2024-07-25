'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Styles from './blueprints.module.scss';
import { getMousePos, linearInterpolation } from '@/utils';
import { gsap } from 'gsap';
import { Flip } from "gsap/Flip";
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Flip); 
// Custom throttle function
const throttle = (func: (...args: any[]) => void, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}; // Custom hook for window size 
const useWindowSize = () => {
    const isClient = typeof window === 'object';

    const getSize = () => ({
        width: isClient ? window.innerWidth : 0,
        height: isClient ? window.innerHeight : 0
    });

    const [winsize, setWinsize] = useState(getSize);

    useEffect(() => {
        if (!isClient) {
            return;
        }

        const handleResize = () => {
            setWinsize(getSize());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isClient]);

    return winsize;
};
// Custom hook for mouse position
const useMousePosition = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback( (ev: MouseEvent | Touch) => {
        const pos = getMousePos(ev);
        setMousePos(pos);
    } , []); // Throttle the event handler to limit updates to once every 50ms

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', (ev) => handleMouseMove(ev.touches[0]));

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleMouseMove as any);
        };
    }, [handleMouseMove]);

    return mousePos;
};

interface RenderedStyle {
    amt: number;
    scaleAmt: number;
    translateX: { previous: number; current: number };
    contrast: { previous: number; current: number };
    brightness: { previous: number; current: number };
}

const Blueprints: React.FC = () => {
    const mousePos = useMousePosition();
    const winsize = useWindowSize();
    const gridRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const numRows = 9;
    const numCols = 9;
    const middleRowIndex = Math.floor(numRows / 2);
    const middleColIndex = Math.floor(numCols / 2);

    const config = useMemo(() => ({
        translateX: true,
        skewX: false,
        contrast: true,
        scale: false,
        brightness: true
    }), []);

    const baseAmt = 0.1;
    const minAmt = 0.05;
    const maxAmt = 0.8;

    const renderedStyles = useMemo<RenderedStyle[]>(() =>
        Array.from({ length: numRows }, (_, index) => {
            const distanceFromMiddle = Math.abs(index - middleRowIndex);
            const amt = Math.max(baseAmt - distanceFromMiddle * 0.03, minAmt);
            const scaleAmt = Math.min(baseAmt + distanceFromMiddle * 0.03, maxAmt);
            return {
                amt,
                scaleAmt,
                translateX: { previous: 0, current: 0 },
                contrast: { previous: 100, current: 100 },
                brightness: { previous: 100, current: 100 }
            };
        })
    , [numRows, middleRowIndex]);

    const calculateMappedValues = useCallback(() => ({
        translateX: ((mousePos.x / winsize.width) * 2 - 1) * 25 * winsize.width / 100,
        contrast: 100 - Math.pow(Math.abs((mousePos.x / winsize.width) * 2 - 1), 2) * (100 - 330), 
    }), [mousePos.x, winsize.width]);

    const updateStyles = useCallback(() => {
        const mappedValues = calculateMappedValues();

        renderedStyles.forEach((style) => {
            for (let prop in config) {
                if (config[prop as keyof typeof config]) {
                    const styleProp = prop as keyof RenderedStyle;
                    style[styleProp].current = mappedValues[styleProp];
                    const amt = styleProp === 'scaleAmt' ? style.scaleAmt : style.amt;
                    style[styleProp].previous = linearInterpolation(
                        style[styleProp].previous,
                        style[styleProp].current,
                        amt
                    );
                }
            }
        });
    }, [calculateMappedValues, config, renderedStyles]);

    useGSAP(() => {
        if (isHovered) {
            const animation = gsap.timeline({
                repeat: -1,
                onUpdate: updateStyles
            });

            return () => animation.kill();
        }
    }, [updateStyles, isHovered]);

    return (
        <div
            className={Styles.gridContainer}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={Styles.gridContent} ref={gridRef}>
                {renderedStyles.map((style, i) => (
                    <div key={i} className={Styles.row} style={{
                        transform: `translateX(${style.translateX.previous}px)`,
                        filter: `contrast(${style.contrast.previous}%) brightness(${style.brightness.previous}%)`
                    }}>
                        {Array.from({ length: numCols }, (_, j) => {
                            const count = i * numCols + j + 1;
                            return (
                                <div key={j} className={`${Styles.cell} ${i === middleRowIndex && j === middleColIndex ? Styles.middleCell : ''}`}>
                                   <svg width={261} height={214} viewBox="0 0 261 214">
                                    <use xlinkHref="#dropdown" />
                                   </svg>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default React.memo(Blueprints);
