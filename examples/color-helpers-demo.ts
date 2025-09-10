/**
 * Demonstration of color helper functions integration
 * with the existing design system
 */

import {
  hexToRgb,
  rgbToHex,
  rgbToLab,
  labToLch,
  lchToRgb,
  rgbToHsl,
  hslToRgb,
  calculateContrast,
  type RGB,
  type HSL,
  type LAB,
  type LCH,
} from '../utils/helpers/colorHelpers';

// Your existing design system colors
const designSystemColors = {
  red: {
    '100': '#fceaea',
    '200': '#f7c1c2',
    '300': '#f29495',
    '400': '#ea6465',
    '500': '#d9292b', // Base color
    '600': '#ae0001',
    '700': '#7b0000',
    '800': '#4b0000',
  },
  blue: {
    '100': '#d9f3fe',
    '200': '#8ad9fc',
    '300': '#2eb9f9',
    '400': '#1d91fb',
    '500': '#0a65fe', // Base color
    '600': '#0042dc',
    '700': '#002d99',
    '800': '#001b5a',
  },
  neutral: {
    '100': '#efefef',
    '200': '#cecece',
    '300': '#aeaeae',
    '400': '#8f8f8f',
    '500': '#717171', // Base color
    '600': '#555555',
    '700': '#3a3a3a',
    '800': '#212121',
  },
};

/**
 * Generate color variations using perceptual color spaces
 */
export function generateColorVariations(baseHex: string, steps: number = 8) {
  const rgb = hexToRgb(baseHex);
  if (!rgb) throw new Error(`Invalid hex color: ${baseHex}`);

  const lab = rgbToLab(rgb);
  const lch = labToLch(lab);

  const variations: Record<string, string> = {};

  // Generate lighter variants (100-400)
  for (let i = 1; i <= 4; i++) {
    const lightness = Math.min(100, lch.l + i * 10);
    const variantLch: LCH = { ...lch, l: lightness };
    const variantRgb = lchToRgb(variantLch);
    const variantHex = rgbToHex(variantRgb);
    variations[`${i}00`] = variantHex;
  }

  // Base color (500)
  variations['500'] = baseHex;

  // Generate darker variants (600-800)
  for (let i = 6; i <= 8; i++) {
    const lightness = Math.max(0, lch.l - (i - 5) * 10);
    const variantLch: LCH = { ...lch, l: lightness };
    const variantRgb = lchToRgb(variantLch);
    const variantHex = rgbToHex(variantRgb);
    variations[`${i}00`] = variantHex;
  }

  return variations;
}

/**
 * Create accessible color combinations
 */
export function createAccessibleCombinations(
  backgroundHex: string,
  textColors: string[]
): Array<{ color: string; contrast: number; accessible: boolean }> {
  const bgContrast = calculateContrast(backgroundHex);

  return textColors.map((color) => {
    const contrast = Math.abs(calculateContrast(color) - bgContrast);
    const accessible = contrast >= 4.5; // WCAG AA level

    return {
      color,
      contrast,
      accessible,
    };
  });
}

/**
 * Analyze color properties for design system documentation
 */
export function analyzeColorProperties(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) throw new Error(`Invalid hex color: ${hex}`);

  const hsl = rgbToHsl(rgb);
  const lab = rgbToLab(rgb);
  const lch = labToLch(lab);
  const contrast = calculateContrast(hex);

  return {
    hex,
    rgb,
    hsl,
    lab,
    lch,
    contrast,
    // Perceptual properties
    lightness: lab.l,
    chroma: lch.c,
    hue: lch.h,
    saturation: hsl.s,
    // Accessibility
    textColor: contrast > 128 ? 'black' : 'white',
    wcagAA: contrast >= 4.5,
    wcagAAA: contrast >= 7,
  };
}

/**
 * Generate complementary colors using LAB color space
 */
export function generateComplementaryColors(baseHex: string) {
  const rgb = hexToRgb(baseHex);
  if (!rgb) throw new Error(`Invalid hex color: ${baseHex}`);

  const lab = rgbToLab(rgb);
  const lch = labToLch(lab);

  // Complementary hue (180° difference)
  const complementaryHue = (lch.h + 180) % 360;
  const complementaryLch: LCH = { ...lch, h: complementaryHue };
  const complementaryRgb = lchToRgb(complementaryLch);
  const complementaryHex = rgbToHex(complementaryRgb);

  // Triadic colors (120° and 240° difference)
  const triadic1Hue = (lch.h + 120) % 360;
  const triadic1Lch: LCH = { ...lch, h: triadic1Hue };
  const triadic1Rgb = lchToRgb(triadic1Lch);
  const triadic1Hex = rgbToHex(triadic1Rgb);

  const triadic2Hue = (lch.h + 240) % 360;
  const triadic2Lch: LCH = { ...lch, h: triadic2Hue };
  const triadic2Rgb = lchToRgb(triadic2Lch);
  const triadic2Hex = rgbToHex(triadic2Rgb);

  return {
    base: baseHex,
    complementary: complementaryHex,
    triadic1: triadic1Hex,
    triadic2: triadic2Hex,
  };
}

/**
 * Create color scales for data visualization
 */
export function createColorScale(
  startHex: string,
  endHex: string,
  steps: number = 10
): string[] {
  const startRgb = hexToRgb(startHex);
  const endRgb = hexToRgb(endHex);

  if (!startRgb || !endRgb) {
    throw new Error('Invalid hex colors provided');
  }

  const startLab = rgbToLab(startRgb);
  const endLab = rgbToLab(endRgb);

  const scale: string[] = [];

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);

    // Interpolate in LAB space for perceptually uniform steps
    const interpolatedLab: LAB = {
      l: startLab.l + (endLab.l - startLab.l) * t,
      a: startLab.a + (endLab.a - startLab.a) * t,
      b: startLab.b + (endLab.b - startLab.b) * t,
    };

    const interpolatedRgb = lchToRgb(labToLch(interpolatedLab));
    const interpolatedHex = rgbToHex(interpolatedRgb);
    scale.push(interpolatedHex);
  }

  return scale;
}

// Example usage
export function demonstrateColorHelpers() {
  console.log('🎨 Color Helpers Demonstration\n');

  // 1. Generate variations for design system colors
  console.log('1. Color Variations:');
  const redVariations = generateColorVariations(designSystemColors.red['500']);
  console.log('Red variations:', redVariations);

  // 2. Analyze color properties
  console.log('\n2. Color Analysis:');
  const redAnalysis = analyzeColorProperties(designSystemColors.red['500']);
  console.log('Red 500 analysis:', {
    hex: redAnalysis.hex,
    lightness: redAnalysis.lightness.toFixed(1),
    chroma: redAnalysis.chroma.toFixed(1),
    hue: redAnalysis.hue.toFixed(1),
    contrast: redAnalysis.contrast.toFixed(1),
    accessible: redAnalysis.wcagAA,
  });

  // 3. Create accessible combinations
  console.log('\n3. Accessible Combinations:');
  const accessibleCombos = createAccessibleCombinations(
    designSystemColors.neutral['100'],
    [
      designSystemColors.red['500'],
      designSystemColors.blue['500'],
      designSystemColors.neutral['800'],
    ]
  );
  console.log('Accessible combinations:', accessibleCombos);

  // 4. Generate complementary colors
  console.log('\n4. Complementary Colors:');
  const complementary = generateComplementaryColors(
    designSystemColors.blue['500']
  );
  console.log('Blue 500 complementary colors:', complementary);

  // 5. Create color scale
  console.log('\n5. Color Scale:');
  const scale = createColorScale(
    designSystemColors.red['100'],
    designSystemColors.red['800'],
    5
  );
  console.log('Red scale:', scale);

  return {
    redVariations,
    redAnalysis,
    accessibleCombos,
    complementary,
    scale,
  };
}

// Export for use in components
export { designSystemColors, type RGB, type HSL, type LAB, type LCH };
