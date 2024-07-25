'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Style from './swatches.module.scss';
import ColorSwatch from "../colorSwatch";
import { useMousePosition } from './useMousePosition';
import { useWindowSize } from './useWindowSize';
import { gsap } from 'gsap';
import { linearInterpolation } from '@/utils';

const Swatches = () => {
    const colors = [// Green
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
        { token: "--color-core-red-100", value: "#fceaea", colorName: "Red 100" },
        { token: "--color-core-red-200", value: "#f7c1c2", colorName: "Red 200" },
        { token: "--color-core-red-300", value: "#f29495", colorName: "Red 300" },
        { token: "--color-core-red-400", value: "#ea6465", colorName: "Red 400" },
        { token: "--color-core-red-500", value: "#d9292b", colorName: "Red 500" },
        { token: "--color-core-red-600", value: "#ae0001", colorName: "Red 600" },
        { token: "--color-core-red-700", value: "#7b0000", colorName: "Red 700" },
        { token: "--color-core-red-800", value: "#4b0000", colorName: "Red 800" },
    ];

    const [isHovered, setIsHovered] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const mousePos = useMousePosition();
    const winsize = useWindowSize();

    useEffect(() => {
        if (gridRef.current) {
            const handleMouseMove = () => {
                const gridRect = gridRef.current.getBoundingClientRect();
                const mouseX = mousePos.x - gridRect.left - winsize.width * 0.5;
                const mousePercent = mouseX / gridRect.width * .5; 
                const mousePercentFromCenter = (mouseX / gridRect.width); 
                const amplitude = 80; // Adjust the amplitude of the sine wave

                colors.forEach((_, i) => {
                    const swatch = gridRef.current.children[i] as HTMLElement; 
                    const x = linearInterpolation(0, gridRect.width - swatch.offsetWidth, mousePercent);
                    
                    const y = Math.sin(i * 0.5 + mousePercentFromCenter * Math.PI * 2) * amplitude;
                    gsap.to(swatch, {
                        x,
                        y,
                        duration: mousePercentFromCenter * 0.5 + 0.5,
                        ease: 'power2.inout'
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
        <div className={`${Style.colorSwatches} ${Style.gridContainer}`}
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
