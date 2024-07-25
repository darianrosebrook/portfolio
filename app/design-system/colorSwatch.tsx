'use client'
import Styles from "./page.module.css";
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
        <div className={Styles.isometricContainer}>
            <svg width="142" height="265" viewBox="0 0 142 265" fill="none" xmlns="http://www.w3.org/2000/svg" className={Styles.isometricColorSwatch}>

                <path fillRule="evenodd" clipRule="evenodd" fill={value} stroke={borderColor} 
                    d="M2.80566 7.28925C4.01865 6.50071 5.74057 6.56517 7.65054 7.66789L17.6264 1.90832C15.7165 0.805593 13.9945 0.741133 12.7815 1.52967L2.80566 7.28925Z"
                    strokeWidth="1" strokeLinejoin="round" />
                <path fillRule="evenodd" clipRule="evenodd" fill={value} stroke={borderColor}
                    d="M125.145 75.5027C128.817 77.6232 131.795 82.7807 131.795 87.0219L141.771 81.2623C141.771 77.0211 138.793 71.8636 135.12 69.7432L125.145 75.5027Z"
                    strokeWidth="1" strokeLinejoin="round" />
                <path fillRule="evenodd" clipRule="evenodd" fill={value} stroke={borderColor}
                    d="M131.795 257.25C131.795 259.285 131.109 260.74 129.989 261.468L139.965 255.708C141.085 254.981 141.771 253.526 141.771 251.49L131.795 257.25Z"
                    strokeWidth="1" strokeLinejoin="round" />
                <path fillRule="evenodd" clipRule="evenodd" fill={value} stroke={borderColor}
                    d="M7.65137 7.66778L125.145 75.5028L135.121 69.7432L17.6273 1.9082L7.65137 7.66778Z"
                    strokeWidth="1" strokeLinejoin="round" />
                <path fillRule="evenodd" clipRule="evenodd" fill={value} stroke={borderColor}
                    d="M131.795 87.0223V257.25L141.771 251.49V81.2627L131.795 87.0223Z"
                    strokeWidth="1" strokeLinejoin="round" />
                <g clipPath="url(#clip0_142_21895)">
                    <rect width="151.029" height="185.586" rx="7.67944" transform="matrix(0.866025 0.5 0 1 1 3.82812)"
                    />

                </g>
                <rect width="151.029" height="185.586" rx="7.67944" transform="matrix(0.866025 0.5 0 1 1 3.82812)"
                    strokeWidth="1" fill={value} stroke={borderColor} />

                <defs>
                    <clipPath id="clip0_142_21895">
                        <rect width="151.029" height="185.586" rx="7.67944" transform="matrix(0.866025 0.5 0 1 1 3.82812)"
                            fill={value} stroke={borderColor} />
                    </clipPath>
                </defs>
            </svg>
            {/* don't break to new lines */}
            <div className={Styles.isometricText} style={{
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

export default ColorSwatch;
