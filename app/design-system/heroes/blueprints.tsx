'use client'
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Styles from './blueprints.module.scss';
import { linearInterpolation } from '@/utils';
import { gsap } from 'gsap';
import { Flip } from "gsap/Flip";
import { useGSAP } from '@gsap/react';
import SvgIllustration from '../svgIllustration';
import { useMousePosition } from './useMousePosition';
import { useWindowSize } from './useWindowSize';

gsap.registerPlugin(Flip);
interface RenderedStyle {
    amt: number;
    scaleAmt: number;
    translateX: { previous: number; current: number };
    contrast: { previous: number; current: number };
    brightness: { previous: number; current: number };
    [key: string]: number | { previous: number; current: number };
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
    const spriteRef = useRef<HTMLDivElement>(null);

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
                    if (typeof style[styleProp] === 'object') {
                        style[styleProp] = {
                            ...style[styleProp],
                            current: mappedValues[styleProp],
                            previous: linearInterpolation(
                                style[styleProp].previous,
                                mappedValues[styleProp],
                                styleProp === 'scaleAmt' ? style.scaleAmt : style.amt
                            )
                        };
                    } else {
                        style[styleProp] = mappedValues[styleProp];
                    }
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

    useEffect(() => {

        // get #DSSPRITE svg sprite and create an array of the symbol ids
        const dsSprite = document.getElementById('DSSPRITE') as HTMLDivElement;
        if (dsSprite) {
            spriteRef.current = dsSprite;
        }

    }, []);
    const svgs = useMemo(() => {
        const sprite = spriteRef.current;
        if (sprite) {
            const symbols = Array.from(sprite.querySelectorAll('symbol'));
            return symbols.map((symbol) => symbol.id);
        }
        return [];
    }, [spriteRef.current]);
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
                                    <SvgIllustration name={svgs[(i + j) % svgs.length]} />
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
