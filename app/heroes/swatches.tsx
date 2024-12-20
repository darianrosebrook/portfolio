'use client'
import React, {  useRef, useState} from 'react';
import Style from './swatches.module.scss';
import { useWindowSize } from './useWindowSize';
import { gsap } from 'gsap';
import { linearInterpolation } from '@/utils'; 
import { useGSAP } from '@gsap/react';
import { useMouseEvent } from '@/context';

type ColorSwatchProps = {
    token: string;
    value: string;
    colorName: string;
};

const ColorSwatch: React.FC<ColorSwatchProps> = ({ token, value, colorName }) => {
    const calculateContrast = (hexcolor: string) => {
        let r: number, g: number, b: number;
        if (hexcolor.startsWith('#')) hexcolor = hexcolor.slice(1);
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
    };
    const textColor = calculateContrast(value) > 128 ? 'black' : 'white';
    const borderColor = textColor;

    return (
        <div className={Style.isometricContainer}>
            <svg
                width="142"
                height="265"
                viewBox="0 0 142 265"
                xmlns="http://www.w3.org/2000/svg"
                className={Style.isometricColorSwatch}
                style={{ fill: value, stroke: borderColor }}
            >
                <use xlinkHref="#isometric" />
            </svg>
            <div className={Style.isometricText} style={{ color: textColor, whiteSpace: 'nowrap' }}>
                <div>
                    <p>{colorName}</p>
                    <p>
                        <small>{value}</small>
                    </p>
                    <p>
                        <small>{token}</small>
                    </p>
                </div>
            </div>
        </div>
    );
};

const Swatches = () => {
  
    const colors = React.useMemo(() => [
        // Red
        { token: "--color-core-red-100", value: "#fceaea", colorName: "Red 100", },
        { token: "--color-core-red-200", value: "#f7c1c2", colorName: "Red 200", },
        { token: "--color-core-red-300", value: "#f29495", colorName: "Red 300", },
        { token: "--color-core-red-400", value: "#ea6465", colorName: "Red 400", },
        { token: "--color-core-red-500", value: "#d9292b", colorName: "Red 500", },
        { token: "--color-core-red-600", value: "#ae0001", colorName: "Red 600", },
        { token: "--color-core-red-700", value: "#7b0000", colorName: "Red 700", },
        { token: "--color-core-red-800", value: "#4b0000", colorName: "Red 800", },

        // Orange
        { token: "--color-core-orange-100", value: "#ffeadd", colorName: "Orange 100", },
        { token: "--color-core-orange-200", value: "#ffb58e", colorName: "Orange 200", },
        { token: "--color-core-orange-300", value: "#ff7c3c", colorName: "Orange 300", },
        { token: "--color-core-orange-400", value: "#d55d21", colorName: "Orange 400", },
        { token: "--color-core-orange-500", value: "#a5491d", colorName: "Orange 500", },
        { token: "--color-core-orange-600", value: "#7b3919", colorName: "Orange 600", },
        { token: "--color-core-orange-700", value: "#552915", colorName: "Orange 700", },
        { token: "--color-core-orange-800", value: "#29160c", colorName: "Orange 800", },

        // Yellow
        { token: "--color-core-yellow-100", value: "#ffedcc", colorName: "Yellow 100", },
        { token: "--color-core-yellow-200", value: "#ffc458", colorName: "Yellow 200", },
        { token: "--color-core-yellow-300", value: "#fe9400", colorName: "Yellow 300", },
        { token: "--color-core-yellow-400", value: "#d77600", colorName: "Yellow 400", },
        { token: "--color-core-yellow-500", value: "#ac5c00", colorName: "Yellow 500", },
        { token: "--color-core-yellow-600", value: "#824500", colorName: "Yellow 600", },
        { token: "--color-core-yellow-700", value: "#593000", colorName: "Yellow 700", },
        { token: "--color-core-yellow-800", value: "#331b00", colorName: "Yellow 800", },

        // Green
        { token: "--color-core-green-100", value: "#e4f2e0", colorName: "Green 100", },
        { token: "--color-core-green-200", value: "#b0daa4", colorName: "Green 200", },
        { token: "--color-core-green-300", value: "#79bf65", colorName: "Green 300", },
        { token: "--color-core-green-400", value: "#609e41", colorName: "Green 400", },
        { token: "--color-core-green-500", value: "#487e1e", colorName: "Green 500", },
        { token: "--color-core-green-600", value: "#336006", colorName: "Green 600", },
        { token: "--color-core-green-700", value: "#234104", colorName: "Green 700", },
        { token: "--color-core-green-800", value: "#142502", colorName: "Green 800", },

        // Teal
        { token: "--color-core-teal-100", value: "#caf8f7", colorName: "Teal 100", },
        { token: "--color-core-teal-200", value: "#18dbdb", colorName: "Teal 200", },
        { token: "--color-core-teal-300", value: "#22b4b4", colorName: "Teal 300", },
        { token: "--color-core-teal-400", value: "#258f8e", colorName: "Teal 400", },
        { token: "--color-core-teal-500", value: "#236f6f", colorName: "Teal 500", },
        { token: "--color-core-teal-600", value: "#205353", colorName: "Teal 600", },
        { token: "--color-core-teal-700", value: "#1a3a3a", colorName: "Teal 700", },
        { token: "--color-core-teal-800", value: "#121d1d", colorName: "Teal 800", },

        // Blue
        { token: "--color-core-blue-100", value: "#d9f3fe", colorName: "Blue 100", },
        { token: "--color-core-blue-200", value: "#8ad9fc", colorName: "Blue 200", },
        { token: "--color-core-blue-300", value: "#2eb9f9", colorName: "Blue 300", },
        { token: "--color-core-blue-400", value: "#1d91fb", colorName: "Blue 400", },
        { token: "--color-core-blue-500", value: "#0a65fe", colorName: "Blue 500", },
        { token: "--color-core-blue-600", value: "#0042dc", colorName: "Blue 600", },
        { token: "--color-core-blue-700", value: "#002d99", colorName: "Blue 700", },
        { token: "--color-core-blue-800", value: "#001b5a", colorName: "Blue 800", },

        // Violet
        { token: "--color-core-violet-100", value: "#ffe9fe", colorName: "Violet 100", },
        { token: "--color-core-violet-200", value: "#ffb5fc", colorName: "Violet 200", },
        { token: "--color-core-violet-300", value: "#ff7bfa", colorName: "Violet 300", },
        { token: "--color-core-violet-400", value: "#f431ed", colorName: "Violet 400", },
        { token: "--color-core-violet-500", value: "#c127bc", colorName: "Violet 500", },
        { token: "--color-core-violet-600", value: "#931d8f", colorName: "Violet 600", },
        { token: "--color-core-violet-700", value: "#661463", colorName: "Violet 700", },
        { token: "--color-core-violet-800", value: "#3b0c3a", colorName: "Violet 800", },

        // Neutral
        { token: "--color-core-neutral-100", value: "#efefef", colorName: "Neutral 100", },
        { token: "--color-core-neutral-200", value: "#cecece", colorName: "Neutral 200", },
        { token: "--color-core-neutral-300", value: "#aeaeae", colorName: "Neutral 300", },
        { token: "--color-core-neutral-400", value: "#8f8f8f", colorName: "Neutral 400", },
        { token: "--color-core-neutral-500", value: "#717171", colorName: "Neutral 500", },
        { token: "--color-core-neutral-600", value: "#555555", colorName: "Neutral 600", },
        { token: "--color-core-neutral-700", value: "#3a3a3a", colorName: "Neutral 700", },
        { token: "--color-core-neutral-800", value: "#212121", colorName: "Neutral 800", },

    ], []);

    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const winsize = useWindowSize();
    const mousePosition =  useMouseEvent() 
    const [percentInView, setPercentInView] = useState(0)

    useGSAP(() => {
        if (!gridRef.current || !containerRef.current) return; 
        const observer = new IntersectionObserver(
            ([entry]) => {
                setPercentInView(entry.intersectionRatio)
            },
            {
                root: null,
                rootMargin: '0px', 
            }
        );
        observer.observe(containerRef.current

        )
        const gridRect = gridRef.current.getBoundingClientRect();
        const mouseX = mousePosition.x - gridRect.left - winsize.width;
        let mousePercent = mouseX / gridRect.width / 2; 
        let mousePercentFromCenter = mouseX / gridRect.width;
         if (winsize.width < 700) {
            mousePercentFromCenter =  ((percentInView) / -4 )  
            mousePercent = (percentInView) / -10
        } 
        console.log('mousePercent', mousePercent, 'mousePercentFromCenter', mousePercentFromCenter)
        
        const amplitude = 256 ;
        const frequency = 0.14; 
        colors.forEach((_, i) => {
            const swatch = gridRef.current.children[i] as HTMLElement;
            let x = linearInterpolation(0, gridRect.width - swatch.offsetWidth, mousePercent);
            if (winsize.width < 700 ) {
                x = linearInterpolation(0, gridRect.width - swatch.offsetWidth, mousePercent )
            }
            const y = Math.sin(i * frequency + mousePercentFromCenter * Math.PI) * amplitude;

            const toX = gsap.quickTo(swatch, 'x',{
                duration: 0.5,
                ease: 'power1.out',
            });
            const toY = gsap.quickTo(swatch, 'y',{
                duration: 0.5,
                ease: 'power1.out',
            });

            toX(x);
            toY(y);
        });
        return () => {
            observer.unobserve(containerRef.current)
        }
    }, [colors, mousePosition, winsize.width])
 

    return (
        <div    ref = {containerRef}
            className={`${Style.gridContainer}`} 
        >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}> 
            <symbol id="isometric" viewBox="0 0 142 265">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.80566 7.28925C4.01865 6.50071 5.74057 6.56517 7.65054 7.66789L17.6264 1.90832C15.7165 0.805593 13.9945 0.741133 12.7815 1.52967L2.80566 7.28925Z"
                        strokeWidth="1"
                        strokeLinejoin="round"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M125.145 75.5027C128.817 77.6232 131.795 82.7807 131.795 87.0219L141.771 81.2623C141.771 77.0211 138.793 71.8636 135.12 69.7432L125.145 75.5027Z"
                        strokeWidth="1"
                        strokeLinejoin="round"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M131.795 257.25C131.795 259.285 131.109 260.74 129.989 261.468L139.965 255.708C141.085 254.981 141.771 253.526 141.771 251.49L131.795 257.25Z"
                        strokeWidth="1"
                        strokeLinejoin="round"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.65137 7.66778L125.145 75.5028L135.121 69.7432L17.6273 1.9082L7.65137 7.66778Z"
                        strokeWidth="1"
                        strokeLinejoin="round"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M131.795 87.0223V257.25L141.771 251.49V81.2627L131.795 87.0223Z"
                        strokeWidth="1"
                        strokeLinejoin="round"
                    />
                    <g clipPath="url(#clip0_142_21895)">
                        <rect
                            width="151.029"
                            height="185.586"
                            rx="7.67944"
                            transform="matrix(0.866025 0.5 0 1 1 3.82812)"
                        />
                    </g>
                    <rect
                        width="151.029"
                        height="185.586"
                        rx="7.67944"
                        transform="matrix(0.866025 0.5 0 1 1 3.82812)"
                        strokeWidth="1"
                    />

                    <defs>
                        <clipPath id="clip0_142_21895">
                            <rect
                                width="151.029"
                                height="185.586"
                                rx="7.67944"
                                transform="matrix(0.866025 0.5 0 1 1 3.82812)"
                            />
                        </clipPath>
                    </defs>
                </symbol>
            </svg>
            <div className={`${Style.colorSwatchContainer} ${Style.gridContent}`} ref={gridRef}>
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

export default Swatches;
