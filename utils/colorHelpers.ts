// /**
//  * Color space conversion utilities and helpers.
//  * This module provides functions for converting between different color spaces
//  * including RGB, HSL, LAB, LCH, XYZ, HSV, and more.
//  */
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
// /**
//  * RGB color space interface
//  * @interface RGB
//  * @property {number} r - Red component (0-255)
//  * @property {number} g - Green component (0-255)
//  * @property {number} b - Blue component (0-255)
//  */
// export interface RGB {
//   r: number;
//   g: number;
//   b: number;
// }

// /**
//  * HSL color space interface
//  * @interface HSL
//  * @property {number} h - Hue angle (0-360)
//  * @property {number} s - Saturation (0-100)
//  * @property {number} l - Lightness (0-100)
//  */
// export interface HSL {
//   h: number;
//   s: number;
//   l: number;
// }

// /**
//  * LAB color space interface
//  * @interface LAB
//  * @property {number} l - Lightness (0-100)
//  * @property {number} a - Green-Red axis (-128 to 127)
//  * @property {number} b - Blue-Yellow axis (-128 to 127)
//  */
// export interface LAB {
//   l: number;
//   a: number;
//   b: number;
// }

// /**
//  * LCH color space interface
//  * @interface LCH
//  * @property {number} l - Lightness (0-100)
//  * @property {number} c - Chroma (>= 0)
//  * @property {number} h - Hue angle (0-360)
//  */
// export interface LCH {
//   l: number;
//   c: number;
//   h: number;
// }

// /**
//  * XYZ color space interface
//  * @interface XYZ
//  * @property {number} x - X component (D65 reference white: 0.95047)
//  * @property {number} y - Y component (D65 reference white: 1.00000)
//  * @property {number} z - Z component (D65 reference white: 1.08883)
//  */
// export interface XYZ {
//   x: number;
//   y: number;
//   z: number;
// }

// /**
//  * D65 reference white point in XYZ color space
//  * @constant
//  * @type {XYZ}
//  */
// const D65_WHITE_POINT: XYZ = {
//   x: 0.95047,
//   y: 1.0,
//   z: 1.08883,
// };

// /**
//  * CIE standard constants
//  * @constant
//  * @type {number}
//  */
// const KAPPA = 24389 / 27; // (29/3)^3
// const EPSILON = 216 / 24389; // (6/29)^3 = ~0.008856

// // --- Core Conversion Helpers (Internal) ---

// /**
//  * Converts an sRGB color channel value to linear RGB
//  * @param {number} channel - sRGB channel value (0-255)
//  * @returns {number} Linear RGB value (0-1)
//  */
// function sRgbToLinearRgbChannel(channel: number): number {
//   const v = channel / 255;
//   return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
// }

// /**
//  * Converts a linear RGB color channel value to sRGB
//  * @param {number} channel - Linear RGB channel value (0-1)
//  * @returns {number} sRGB value (0-255)
//  */
// function linearRgbToSRgbChannel(channel: number): number {
//   const v =
//     channel <= 0.0031308
//       ? 12.92 * channel
//       : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
//   const clamped = Math.max(0, Math.min(1, v));
//   return Math.round(clamped * 255);
// }

// /**
//  * Converts sRGB values to CIE XYZ color space (D65 illuminant)
//  * @param {RGB} rgb - RGB color object
//  * @returns {XYZ} XYZ color object
//  */
// function rgbToXyz({ r, g, b }: RGB): XYZ {
//   // Convert sRGB to linear RGB
//   const R_linear = sRgbToLinearRgbChannel(r);
//   const G_linear = sRgbToLinearRgbChannel(g);
//   const B_linear = sRgbToLinearRgbChannel(b);

//   // Apply the standard sRGB to XYZ transformation matrix (D65)
//   const x = R_linear * 0.4124564 + G_linear * 0.3575761 + B_linear * 0.1804375;
//   const y = R_linear * 0.2126729 + G_linear * 0.7151522 + B_linear * 0.072175;
//   const z = R_linear * 0.0193339 + G_linear * 0.119192 + B_linear * 0.9503041;

//   return { x, y, z };
// }

// /**
//  * Converts CIE XYZ color space values to CIE L*a*b* color space.
//  * @param xyz - An object with x, y, z properties.
//  * @returns An object with l, a, b properties (precise values).
//  */
// function xyzToLab({ x, y, z }: XYZ): LAB {
//   // Normalize XYZ values relative to the D65 white point
//   const x_n = x / D65_WHITE_POINT.x;
//   const y_n = y / D65_WHITE_POINT.y;
//   const z_n = z / D65_WHITE_POINT.z;

//   // Apply the non-linear transformation function f
//   const f = (t: number): number =>
//     t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116;

//   const fx = f(x_n);
//   const fy = f(y_n);
//   const fz = f(z_n);

//   // Calculate L*, a*, b*
//   const l = 116 * fy - 16;
//   const a = 500 * (fx - fy);
//   const b_lab = 200 * (fy - fz); // Use b_lab to avoid conflict with RGB 'b'

//   return { l, a, b: b_lab };
// }

// /**
//  * Converts CIE L*a*b* color space values to CIE XYZ color space (D65).
//  * @param lab - An object with l, a, b properties.
//  * @returns An object with x, y, z properties.
//  */
// function labToXyz({ l, a, b }: LAB): XYZ {
//   // Calculate intermediate values fx, fy, fz from L*, a*, b*
//   const fy = (l + 16) / 116;
//   const fx = a / 500 + fy;
//   const fz = fy - b / 200;

//   // Apply the inverse non-linear transformation function f^-1
//   const f_inv = (t: number): number =>
//     Math.pow(t, 3) > EPSILON ? Math.pow(t, 3) : (116 * t - 16) / KAPPA;

//   const x_n = f_inv(fx);
//   const y_n = l > KAPPA * EPSILON ? Math.pow(fy, 3) : l / KAPPA; // Simpler inverse for y
//   const z_n = f_inv(fz);

//   // Denormalize to get XYZ values
//   const x = x_n * D65_WHITE_POINT.x;
//   const y = y_n * D65_WHITE_POINT.y;
//   const z = z_n * D65_WHITE_POINT.z;

//   return { x, y, z };
// }

// /**
//  * Converts CIE XYZ color space values (D65) to sRGB values (0-255).
//  * @param xyz - An object with x, y, z properties.
//  * @returns An object with r, g, b properties (0-255), rounded.
//  */
// function xyzToRgb({ x, y, z }: XYZ): RGB {
//   // Apply the standard XYZ to sRGB transformation matrix (D65)
//   // Note: Matrix values can vary slightly depending on source/rounding.
//   const R_linear = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
//   const G_linear = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
//   const B_linear = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

//   // Convert linear RGB to sRGB (0-255)
//   const r = linearRgbToSRgbChannel(R_linear);
//   const g = linearRgbToSRgbChannel(G_linear);
//   const b = linearRgbToSRgbChannel(B_linear);

//   // Note: Clamping to the sRGB gamut happens implicitly within linearRgbToSRgbChannel
//   // before rounding.

//   return { r, g, b };
// }

// // --- Main API Functions (Exported) ---

// /**
//  * Converts a HEX color string to an RGB object.
//  * Handles optional '#' prefix and 3/6 digit hex codes.
//  * Returns null if the hex string is invalid.
//  * @param hex - The hex color string (e.g., "#ff0000", "f00").
//  * @returns An RGB object { r, g, b } or null if invalid.
//  */
// export function hexToRgb(hex: string): RGB | null {
//   if (!hex || typeof hex !== 'string') {
//     return null;
//   }
//   // Remove leading '#' if present
//   const sanitizedHex = hex.startsWith('#') ? hex.slice(1) : hex;

//   // Check for 3-digit shorthand hex
//   if (sanitizedHex.length === 3) {
//     const r = parseInt(sanitizedHex[0] + sanitizedHex[0], 16);
//     const g = parseInt(sanitizedHex[1] + sanitizedHex[1], 16);
//     const b = parseInt(sanitizedHex[2] + sanitizedHex[2], 16);
//     if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
//       return { r, g, b };
//     }
//   }

//   // Check for 6-digit hex
//   if (sanitizedHex.length === 6) {
//     const r = parseInt(sanitizedHex.substring(0, 2), 16);
//     const g = parseInt(sanitizedHex.substring(2, 4), 16);
//     const b = parseInt(sanitizedHex.substring(4, 6), 16);
//     if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
//       return { r, g, b };
//     }
//   }

//   // Invalid format
//   return null;

//   /* Alternative Regex approach (slightly less explicit error checking) */
//   /*
//     const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
//     const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

//     const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
//     return result
//       ? {
//           r: parseInt(result[1], 16),
//           g: parseInt(result[2], 16),
//           b: parseInt(result[3], 16),
//         }
//       : null;
//     */
// }

// /**
//  * Converts an RGB color object to a HEX color string.
//  * @param rgb - An object with r, g, b properties (0-255).
//  * @returns A hex color string (e.g., "#ff0000").
//  */
// export function rgbToHex({ r, g, b }: RGB): string {
//   // Helper to convert a single channel, clamp, round, and pad with zero if needed.
//   const toHex = (c: number): string => {
//     // Ensure value is within 0-255 range and an integer
//     const clamped = Math.max(0, Math.min(255, Math.round(c)));
//     const hex = clamped.toString(16);
//     return hex.length === 1 ? '0' + hex : hex;
//   };
//   return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
// }

// /**
//  * Converts an RGB color object to an HSL object.
//  * @param rgb - An object with r, g, b properties (0-255).
//  * @returns An HSL object { h (0-360), s (0-100), l (0-100) }, rounded.
//  */
// export function rgbToHsl({ r, g, b }: RGB): HSL {
//   // Normalize RGB values to the range [0, 1]
//   r /= 255;
//   g /= 255;
//   b /= 255;

//   const max = Math.max(r, g, b);
//   const min = Math.min(r, g, b);
//   let h = 0; // Default hue
//   let s = 0; // Default saturation
//   const l = (max + min) / 2; // Lightness

//   if (max !== min) {
//     // Calculate saturation and hue only if not achromatic
//     const delta = max - min;
//     s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

//     switch (max) {
//       case r:
//         h = (g - b) / delta + (g < b ? 6 : 0);
//         break;
//       case g:
//         h = (b - r) / delta + 2;
//         break;
//       case b:
//         h = (r - g) / delta + 4;
//         break;
//     }
//     h /= 6; // Normalize hue to [0, 1]
//   }

//   return {
//     h: Math.round(h * 360), // Scale hue to 0-360 degrees
//     s: Math.round(s * 100), // Scale saturation to 0-100%
//     l: Math.round(l * 100), // Scale lightness to 0-100%
//   };
// }

// /**
//  * Converts an HSL color object to an RGB object.
//  * @param hsl - An HSL object { h (0-360), s (0-100), l (0-100) }.
//  * @returns An RGB object { r, g, b } (0-255), rounded.
//  */
// export function hslToRgb({ h, s, l }: HSL): RGB {
//   // Normalize HSL values
//   h = (((h % 360) + 360) % 360) / 360; // Ensure h is in [0, 1)
//   s /= 100;
//   l /= 100;

//   let r, g, b;

//   if (s === 0) {
//     r = g = b = l; // Achromatic case (gray)
//   } else {
//     // Helper function to convert hue to RGB channel
//     const hue2rgb = (p: number, q: number, t: number): number => {
//       if (t < 0) t += 1;
//       if (t > 1) t -= 1;
//       if (t < 1 / 6) return p + (q - p) * 6 * t;
//       if (t < 1 / 2) return q;
//       if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
//       return p;
//     };

//     // Calculate temporary variables p and q
//     const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//     const p = 2 * l - q;

//     // Calculate RGB channels using the hue2rgb helper
//     r = hue2rgb(p, q, h + 1 / 3);
//     g = hue2rgb(p, q, h);
//     b = hue2rgb(p, q, h - 1 / 3);
//   }

//   // Scale RGB channels to [0, 255] and round
//   return {
//     r: Math.round(r * 255),
//     g: Math.round(g * 255),
//     b: Math.round(b * 255),
//   };
// }

// /**
//  * Converts an RGB color object to a CIE L*a*b* object (D65 illuminant).
//  * @param rgb - An object with r, g, b properties (0-255).
//  * @returns A LAB object { l, a, b } with precise (unrounded) values.
//  */
// export function rgbToLab(rgb: RGB): LAB {
//   const xyz = rgbToXyz(rgb);
//   const lab = xyzToLab(xyz);
//   // Return precise values; let the consumer round if needed.
//   return lab;
// }

// /**
//  * Converts a CIE L*a*b* object (D65 illuminant) to an RGB object.
//  * Note: The conversion might result in RGB values outside the sRGB gamut [0, 255].
//  * These values are clamped during the final conversion step.
//  * @param lab - A LAB object { l, a, b }.
//  * @returns An RGB object { r, g, b } (0-255), rounded and clamped.
//  */
// export function labToRgb(lab: LAB): RGB {
//   const xyz = labToXyz(lab);
//   const rgb = xyzToRgb(xyz); // xyzToRgb handles clamping and rounding
//   return rgb;
// }

// /**
//  * Converts an RGB color object to a CIE LCH object (D65 illuminant).
//  * LCH is the cylindrical representation of L*a*b*.
//  * @param rgb - An object with r, g, b properties (0-255).
//  * @returns An LCH object { l, c, h } with precise (unrounded) values, except for hue (h) which is normalized to [0, 360).
//  */
// export function rgbToLch(rgb: RGB): LCH {
//   // Calculate precise LAB values first
//   const preciseLab = xyzToLab(rgbToXyz(rgb));

//   const { l, a, b } = preciseLab;

//   // Calculate Chroma (C*)
//   const c = Math.sqrt(a * a + b * b);

//   // Calculate Hue (h_ab) in degrees
//   let h = Math.atan2(b, a) * (180 / Math.PI);

//   // Normalize hue angle to be within [0, 360)
//   if (h < 0) {
//     h += 360;
//   }

//   // Return precise values; let the consumer round if needed.
//   return { l, c, h };
// }

// /**
//  * Converts a CIE LCH object (D65 illuminant) to an RGB object.
//  * @param lch - An LCH object { l, c, h }.
//  * @returns An RGB object { r, g, b } (0-255), rounded and clamped.
//  */
// export function lchToRgb({ l, c, h }: LCH): RGB {
//   // Convert LCH back to LAB
//   const rad = (h * Math.PI) / 180; // Convert hue angle to radians
//   const a = c * Math.cos(rad);
//   const b = c * Math.sin(rad);

//   const lab: LAB = { l, a, b };

//   // Reuse the labToRgb conversion (which handles LAB -> XYZ -> RGB)
//   return labToRgb(lab);
// }

// /**
//  * Converts RGB values to HSV color space
//  * @param {number} r - Red component (0-255)
//  * @param {number} g - Green component (0-255)
//  * @param {number} b - Blue component (0-255)
//  * @returns {{h: number, s: number, v: number}} HSV color object
//  */
// export function rgbToHsv(r: number, g: number, b: number) {
//   // 1) normalize to [0,1]
//   r /= 255;
//   g /= 255;
//   b /= 255;
//   const max = Math.max(r, g, b);
//   const min = Math.min(r, g, b);
//   const d = max - min;
//   let h = 0;
//   const s = max === 0 ? 0 : d / max;
//   const v = max;

//   if (d !== 0) {
//     switch (max) {
//       case r:
//         h = (g - b) / d + (g < b ? 6 : 0);
//         break;
//       case g:
//         h = (b - r) / d + 2;
//         break;
//       case b:
//         h = (r - g) / d + 4;
//         break;
//     }
//     h *= 60;
//   }
//   return { h, s: s * 100, v: v * 100 };
// }

// /**
//  * Converts HSV values to RGB color space
//  * @param {number} h - Hue angle (0-360)
//  * @param {number} s - Saturation (0-100)
//  * @param {number} v - Value (0-100)
//  * @returns {RGB} RGB color object
//  */
// export function hsvToRgb(h: number, s: number, v: number) {
//   h = ((h % 360) + 360) / 360; // wrap
//   s = Math.max(0, Math.min(1, s / 100));
//   v = Math.max(0, Math.min(1, v / 100));

//   const i = Math.floor(h * 6);
//   const f = h * 6 - i;
//   const p = v * (1 - s);
//   const q = v * (1 - f * s);
//   const t = v * (1 - (1 - f) * s);

//   let R: number, G: number, B: number;
//   switch (i % 6) {
//     case 0:
//       R = v;
//       G = t;
//       B = p;
//       break;
//     case 1:
//       R = q;
//       G = v;
//       B = p;
//       break;
//     case 2:
//       R = p;
//       G = v;
//       B = t;
//       break;
//     case 3:
//       R = p;
//       G = q;
//       B = v;
//       break;
//     case 4:
//       R = t;
//       G = p;
//       B = v;
//       break;
//     case 5:
//       R = v;
//       G = p;
//       B = q;
//       break;
//   }

//   return {
//     r: Math.round(R * 255),
//     g: Math.round(G * 255),
//     b: Math.round(B * 255),
//   };
// }

// export function rgbToOklab(r: number, g: number, b: number) {
//   // normalize
//   let R = r / 255,
//     G = g / 255,
//     B = b / 255;
//   // linearize gamma
//   [R, G, B] = [R, G, B].map((v) =>
//     v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
//   );
//   // LMS
//   const L_ = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
//   const M_ = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
//   const S_ = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;
//   // non‑linear
//   const l = Math.cbrt(L_);
//   const m = Math.cbrt(M_);
//   const s = Math.cbrt(S_);
//   // OKLab coords
//   return {
//     L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
//     a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
//     b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
//   };
// }

// /**
//  * Reverse of above
//  */
// export function oklabToRgb(L: number, a: number, b: number) {
//   // matrix from OKLab → LMSʹ
//   const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
//   const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
//   const s_ = L - 0.0894841775 * a - 1.291485548 * b;
//   // inv‑nonlinear
//   const Lp = l_ ** 3;
//   const Mp = m_ ** 3;
//   const Sp = s_ ** 3;
//   // back to linear RGB
//   const R = +4.0767416621 * Lp - 3.3077115913 * Mp + 0.2309699292 * Sp;
//   const G = -1.2684380046 * Lp + 2.6097574011 * Mp - 0.3413193965 * Sp;
//   const B = -0.0041960863 * Lp - 0.7034186147 * Mp + 1.707614701 * Sp;
//   // gamma encode + clamp
//   const to255 = (v: number) => {
//     v = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
//     return Math.round(Math.max(0, Math.min(1, v)) * 255);
//   };
//   return { r: to255(R), g: to255(G), b: to255(B) };
// }

// /**
//  * OKLab → OKLCh
//  */
// export function oklabToOklch(L: number, a: number, b: number) {
//   const c = Math.hypot(a, b);
//   let h = (Math.atan2(b, a) * 180) / Math.PI;
//   if (h < 0) h += 360;
//   return { L, c, h };
// }

// /**
//  * OKLCh → OKLab → RGB
//  */
// export function oklchToOklab(L: number, c: number, h: number) {
//   const rad = (h * Math.PI) / 180;
//   return {
//     L,
//     a: c * Math.cos(rad),
//     b: c * Math.sin(rad),
//   };
// }

// // CIECAM02;
// class CIECAM02 {
//   // Calculating the CIECAM02 color space from a given RGB color takes a few steps:
//   // 1) Take the input as an rgb color object
//   // 2) Convert the rgb color to a linearized rgb color
//   // 3) Convert the linearized rgb color to a CIE XYZ color
//   // 4) Convert the CIE XYZ color to a CIE LMS color
//   // 5) Adapt the CIE LMS color to the viewing conditions which are defined by the whitepoint, adapting luminance, and surrounding luminance
//   // 6) Take the adapted CIE LMS color and convert it to the CIECAM02 color space using the von Kries transformation
//   // 7) Return the CIECAM02 color space
//   public static from(rgb: RGB) {
//     const linearized = this.linearize(rgb);
//     const xyz = this.xyz(linearized);
//     const lms = this.lms(xyz);
//     const adapted = this.adapt(lms);
//     const cam02 = this.cam02(adapted);
//     return cam02;
//   }

//   private static linearize(rgb: RGB) {
//     // Convert the rgb color to a linearized rgb color
//     const linearized = rgb.map((channel) => {
//       return channel <= 0.04045
//         ? channel / 12.92
//         : Math.pow((channel + 0.055) / 1.055, 2.4);
//     });

//     return linearized;
//   }
//   private static xyz(linearized: RGB) {
//     // Convert the linearized rgb color to a CIE XYZ color
//     const xyz = linearized.map((channel) => {
//       return channel <= 0.0031308
//         ? channel * 12.92
//         : Math.pow(channel, 1 / 2.4) * 1.055 - 0.055;
//     });
//     return xyz;
//   }
//   private static lms(xyz: XYZ) {
//     // Convert the CIE XYZ color to a CIE LMS color
//     const lms = xyz.map((channel) => {
//       return channel <= 0.0031308
//         ? channel * 12.92
//         : Math.pow(channel, 1 / 2.4) * 1.055 - 0.055;
//     });
//     return lms;
//   }
//   private static adapt(lms: LMS) {
//     // Adapt the CIE LMS color to the viewing conditions
//     const adapted = lms.map((channel) => {
//       return channel <= 0.0031308
//         ? channel * 12.92
//         : Math.pow(channel, 1 / 2.4) * 1.055 - 0.055;
//     });
//     return adapted;
//   }
//   private static cam02(adapted: LMS) {
//     // Convert the adapted CIE LMS color to the CIECAM02 color space using the von Kries transformation
//     const cam02 = adapted.map((channel) => {
//       return channel <= 0.0031308
//         ? channel * 12.92
//         : Math.pow(channel, 1 / 2.4) * 1.055 - 0.055;
//     });
//     return cam02;
//   }

//   private static vonKries(adapted: LMS) {
//     // Convert the adapted CIE LMS color to the CIECAM02 color space using the von Kries transformation
//     const vonKries = adapted.map((channel) => {
//       return channel <= 0.0031308
//         ? channel * 12.92
//         : Math.pow(channel, 1 / 2.4) * 1.055 - 0.055;
//     });
//     return vonKries;
//   }
// }
// /**
//  * CIECAM02 is a full appearance model
//  *   • Define your viewing conditions (whitepoint, adapting luminance, surround)
//  *   • Convert RGB → XYZ → cone responses → adapt → post‑adap → J, C, h, M, s, Q etc.
//  */

// export function rgbToCam02JCh(r: number, g: number, b: number) {
//   // 1) Linearize as above → XYZ
//   // 2) feed into CIECAM02 with your chosen viewing conditions
//   const cam = CIECAM02.from({
//     space: 'rgb',
//     coords: [r, g, b],
//     // … your cam02 viewing conditions here …
//   });
//   return {
//     J: cam.J, // Lightness
//     C: cam.C, // Chroma
//     h: cam.h, // Hue angle
//   };
// }

// // (inverse CAM02 → XYZ → RGB is even more complex)

export { calculateContrast };
