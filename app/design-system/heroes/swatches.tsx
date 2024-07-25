'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Style from './swatches.module.scss';
import { useMousePosition } from './useMousePosition';
import { useWindowSize } from './useWindowSize';
import { gsap } from 'gsap';
import { linearInterpolation } from '@/utils';
type ColorSwatchProps = {
    token: string;
    value: string;
    colorName: string;
};

const ColorSwatch: React.FC<ColorSwatchProps> = ({ token, value, colorName }) => {
    const calculateContrast = (hexcolor: string) => {
        let r: number, g: number, b: number;
        if (hexcolor.startsWith('#')) {
            hexcolor = hexcolor.slice(1);
        }
        if (hexcolor.length === 3) {
            r = parseInt(hexcolor[0] + hexcolor[0], 16);
            g = parseInt(hexcolor[1] + hexcolor[1], 16);
            b = parseInt(hexcolor[2] + hexcolor[2], 16);
        } else if (hexcolor.length === 6) {
            r = parseInt(hexcolor.slice(0, 2), 16);
            g = parseInt(hexcolor.slice(2, 4), 16);
            b = parseInt(hexcolor.slice(4, 6), 16);
        } else {
            throw new Error('Invalid hex color: ' + hexcolor);
        }
        return (r * 299 + g * 587 + b * 114) / 1000;
    }
    const textColor = calculateContrast(value) > 128 ? 'black' : 'white';
    const borderColor = calculateContrast(value) > 128 ? 'black' : 'white';
    return (
        <div className={Style.isometricContainer}>
            <svg width="142" height="265" viewBox="0 0 142 265" xmlns="http://www.w3.org/2000/svg" className={Style.isometricColorSwatch} style={{ fill: value, stroke: borderColor }}>

                <use xlinkHref="#isometric" />
            </svg>
            <div className={Style.isometricText} style={{
                color: textColor,
                whiteSpace: 'nowrap'
            }}>
                <div>
                    <p><>{colorName}</></p>
                    <p><small>{token}</small></p>
                </div>
                <div>
                    <p><small>{value}</small></p>
                </div>
            </div>
        </div>
    );
};
const Swatches = () => {
    const colors = [// Green
        { token: "--color-core-red-100", value: "#fceaea", colorName: "Red 100" },
        { token: "--color-core-red-200", value: "#f7c1c2", colorName: "Red 200" },
        { token: "--color-core-red-300", value: "#f29495", colorName: "Red 300" },
        { token: "--color-core-red-400", value: "#ea6465", colorName: "Red 400" },
        { token: "--color-core-red-500", value: "#d9292b", colorName: "Red 500" },
        { token: "--color-core-red-600", value: "#ae0001", colorName: "Red 600" },
        { token: "--color-core-red-700", value: "#7b0000", colorName: "Red 700" },
        { token: "--color-core-red-800", value: "#4b0000", colorName: "Red 800" },
        { token: "--color-core-green-100", value: "#e4f2e0", colorName: "Green 100" },
        { token: "--color-core-green-200", value: "#b0daa4", colorName: "Green 200" },
        { token: "--color-core-green-300", value: "#79bf65", colorName: "Green 300" },
        { token: "--color-core-green-400", value: "#609e41", colorName: "Green 400" },
        { token: "--color-core-green-500", value: "#487e1e", colorName: "Green 500" },
        { token: "--color-core-green-600", value: "#336006", colorName: "Green 600" },
        { token: "--color-core-green-700", value: "#234104", colorName: "Green 700" },
        { token: "--color-core-green-800", value: "#142502", colorName: "Green 800" },
        // Blue
        { token: "--color-core-blue-100", value: "#d9f3fe", colorName: "Blue 100" },
        { token: "--color-core-blue-200", value: "#8ad9fc", colorName: "Blue 200" },
        { token: "--color-core-blue-300", value: "#2eb9f9", colorName: "Blue 300" },
        { token: "--color-core-blue-400", value: "#1d91fb", colorName: "Blue 400" },
        { token: "--color-core-blue-500", value: "#0a65fe", colorName: "Blue 500" },
        { token: "--color-core-blue-600", value: "#0042dc", colorName: "Blue 600" },
        { token: "--color-core-blue-700", value: "#002d99", colorName: "Blue 700" },
        { token: "--color-core-blue-800", value: "#001b5a", colorName: "Blue 800" },
        // Violet
        { token: "--color-core-violet-100", value: "#ffe9fe", colorName: "Violet 100" },
        { token: "--color-core-violet-200", value: "#ffb5fc", colorName: "Violet 200" },
        { token: "--color-core-violet-300", value: "#ff7bfa", colorName: "Violet 300" },
        { token: "--color-core-violet-400", value: "#f431ed", colorName: "Violet 400" },
        { token: "--color-core-violet-500", value: "#c127bc", colorName: "Violet 500" },
        { token: "--color-core-violet-600", value: "#931d8f", colorName: "Violet 600" },
        { token: "--color-core-violet-700", value: "#661463", colorName: "Violet 700" },
        { token: "--color-core-violet-800", value: "#3b0c3a", colorName: "Violet 800" },
    ];

    const [isHovered, setIsHovered] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const mousePos = useMousePosition();
    const winsize = useWindowSize();

    useEffect(() => {
        if (gridRef.current && isHovered) {
            const handleMouseMove = () => {
                const gridRect = gridRef.current.getBoundingClientRect();
                const mouseX = mousePos.x - gridRect.left - winsize.width;
                const mousePercent = (mouseX / gridRect.width) / 2;
                const mousePercentFromCenter = (mouseX / gridRect.width);
                const amplitude = 120;
                const frequency = 0.40;
                colors.forEach((_, i) => {
                    const swatch = gridRef.current.children[i] as HTMLElement;
                    const x = linearInterpolation(0, gridRect.width - swatch.offsetWidth, mousePercent);
                    // Modified sine wave calculation
                    const y = Math.sin(i * frequency + mousePercentFromCenter * Math.PI) * amplitude;

                    gsap.to(swatch, {
                        x,
                        y,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                });
            };

            window.addEventListener('mousemove', handleMouseMove);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, [mousePos, winsize, colors]);


    return (
        <div className={`${Style.gridContainer}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <div className={`${Style.colorSwatchContainer} ${Style.gridContent}`} ref={gridRef}>
                {colors.map((swatch, i) => {
                    let zIndex = 100 - i;
                    return (
                        <div key={i} className={Style.colorSwatch} style={{ zIndex, }}>
                            <ColorSwatch {...swatch} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Swatches;
