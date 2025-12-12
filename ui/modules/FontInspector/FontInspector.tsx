'use client';

import { DrawColors } from '@/utils/geometry/drawing';
import type { Font, Glyph } from 'fontkit';
import * as fontkit from 'fontkit';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AnatomyControls } from './AnatomyControls';
import styles from './FontInspector.module.scss';
import { InspectorControls } from './InspectorControls';
import { SymbolCanvas } from './SymbolCanvas';
import { SymbolGrid } from './SymbolGrid';
import { TypographyArticleContent } from './TypographyArticleContent';

// ---------------------------
// Types & Interfaces
// ---------------------------

export interface AxisValues {
  [key: string]: number;
  wght: number;
  opsz: number;
}

interface FontInfo {
  name: string;
  url: string;
  font: Font | null;
}

export interface AnatomyFeature {
  feature: string;
  label: string;
  labelPosition: string;
  disabled: boolean;
  selected: boolean;
  readonly: boolean;
}

interface InspectorContextType {
  colorScheme: string;
  fonts: FontInfo[];
  currentFontIndex: number;
  font: Font | null;
  fontInstance: Font | null;
  axisValues: AxisValues;
  glyphUnicode: number;
  glyph: Glyph | null;
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
  setAxisValues: (v: Partial<AxisValues>) => void;
  setGlyphUnicode: (u: number) => void;
  setCurrentFont: (index: number) => void;
  anatomyFeatures: AnatomyFeature[];
  selectedAnatomy: Map<string, AnatomyFeature>;
  toggleAnatomy: (feature: AnatomyFeature) => void;
  colors: DrawColors;
  autoDetectFeatures?: boolean;
}

// ---------------------------
// Context
// ---------------------------

const InspectorContext = createContext<InspectorContextType | undefined>(
  undefined
);
export const useInspector = (): InspectorContextType => {
  const ctx = useContext(InspectorContext);
  if (!ctx) throw new Error('useInspector must be inside InspectorProvider');
  return ctx;
};

// ---------------------------
// Provider Component
// ---------------------------

export const InspectorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [fonts, setFonts] = useState<FontInfo[]>([
    { name: 'Nohemi', url: '/fonts/Nohemi-VF.ttf', font: null },
    { name: 'Inter', url: '/fonts/InterVariable.ttf', font: null },
    { name: 'Neon', url: '/fonts/MonaspaceNeonVF.ttf', font: null },
    { name: 'Newsreader', url: '/fonts/Newsreader-VF.ttf', font: null },
  ]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentFontIndex, setCurrentFontIndex] = useState(0);
  const [axisValues, setAxisValuesState] = useState<AxisValues>({
    wght: 400,
    opsz: 32,
  });
  const [glyphUnicode, setGlyphUnicode] = useState<number>(0x0041);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [colors, setColors] = useState<DrawColors>({
    metricStroke: '',
    metricFill: '',
    anchorFill: '',
    anchorStroke: '',
    checkerFill: '',
    checkerStroke: '',
    boundsStroke: '',
    boundsFill: '',
    pathStroke: '',
    pathFill: '',
    handleStroke: '',
    handleFill: '',
    cursorStroke: '',
    cursorFill: '',
    labelFill: '',
    labelStroke: '',
    lsbStroke: '',
    lsbFill: '',
    rsbStroke: '',
    rsbFill: '',
    highlightBackground: '',
  });
  const [selectedAnatomy, setSelectedAnatomy] = useState<
    Map<string, AnatomyFeature>
  >(
    () =>
      new Map([
        [
          'Baseline',
          {
            feature: 'Baseline',
            label: 'Baseline',
            labelPosition: 'bottom',
            disabled: false,
            selected: true,
            readonly: false,
          },
        ],
        [
          'Cap height',
          {
            feature: 'Cap height',
            label: 'Cap height',
            labelPosition: 'top',
            disabled: false,
            selected: true,
            readonly: false,
          },
        ],
        [
          'X-height',
          {
            feature: 'X-height',
            label: 'X-height',
            labelPosition: 'top',
            disabled: false,
            selected: true,
            readonly: false,
          },
        ],
        [
          'Ascender',
          {
            feature: 'Ascender',
            label: 'Ascender',
            labelPosition: 'top',
            disabled: false,
            selected: true,
            readonly: false,
          },
        ],
        [
          'Descender',
          {
            feature: 'Descender',
            label: 'Descender',
            labelPosition: 'bottom',
            disabled: false,
            selected: true,
            readonly: false,
          },
        ],
      ])
  );

  const anatomyFeatures = useMemo(
    () => [
      {
        feature: 'Baseline',
        label: 'Baseline',
        labelPosition: 'bottom',
        disabled: false,
        selected: true,
        readonly: false,
      },
      {
        feature: 'Cap height',
        label: 'Cap height',
        labelPosition: 'top',
        disabled: false,
        selected: true,
        readonly: false,
      },
      {
        feature: 'X-height',
        label: 'X-height',
        labelPosition: 'top',
        disabled: false,
        selected: true,
        readonly: false,
      },
      {
        feature: 'Ascender',
        label: 'Ascender',
        labelPosition: 'top',
        disabled: false,
        selected: true,
        readonly: false,
      },
      {
        feature: 'Descender',
        label: 'Descender',
        labelPosition: 'bottom',
        disabled: false,
        selected: true,
        readonly: false,
      },
      {
        feature: 'Apex',
        label: 'Apex (coming soon)',
        labelPosition: 'top',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Tail',
        label: 'Tail (coming soon)',
        labelPosition: 'bottom',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Arm',
        label: 'Arm (coming soon)',
        labelPosition: 'top',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Tittle',
        label: 'Tittle (coming soon)',
        labelPosition: 'top',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Bowl',
        label: 'Bowl (coming soon)',
        labelPosition: 'bottom',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Counter',
        label: 'Counter (coming soon)',
        labelPosition: 'bottom',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Crossbar',
        label: 'Crossbar (coming soon)',
        labelPosition: 'bottom',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Serif',
        label: 'Serif (coming soon)',
        labelPosition: 'bottom',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Eye',
        label: 'Eye (coming soon)',
        labelPosition: 'bottom',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Spine',
        label: 'Spine (coming soon)',
        labelPosition: 'bottom',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Stem',
        label: 'Stem (coming soon)',
        labelPosition: 'bottom',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Aperture',
        label: 'Aperture (coming soon)',
        labelPosition: 'bottom',
        disabled: true,
        selected: false,
        readonly: true,
      },
      {
        feature: 'Ear',
        label: 'Ear (coming soon)',
        labelPosition: 'bottom',
        disabled: true,
        selected: false,
        readonly: true,
      },
    ],
    []
  );
  const toggleAnatomy = useCallback((feature: AnatomyFeature) => {
    setSelectedAnatomy((s) => {
      const next = new Map(s);
      if (next.has(feature.feature)) next.delete(feature.feature);
      else next.set(feature.feature, feature);
      return next;
    });
  }, []);

  // load fonts
  useEffect(() => {
    if (fontsLoaded) return;

    async function loadFonts() {
      const loadedFonts = await Promise.all(
        fonts.map(async (fontInfo) => {
          try {
            const response = await fetch(fontInfo.url);
            const arrayBuffer = await response.arrayBuffer();
            const font = fontkit.create(new Uint8Array(arrayBuffer)) as Font;
            return { ...fontInfo, font };
          } catch (error) {
            console.error(`Error loading font ${fontInfo.name}:`, error);
            return fontInfo;
          }
        })
      );
      setFonts(loadedFonts);
      setFontsLoaded(true);
    }
    loadFonts();
  }, [fonts, fontsLoaded]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    // Handler shared by both media‑query and mutation events
    const updateScheme = () => {
      // Read CSS variables from root to infer theme
      // Check both CSS variable AND actual computed background color to determine theme
      const rootElement = document.documentElement;
      const rootStyle = getComputedStyle(rootElement);
      const bodyStyle = getComputedStyle(document.body);
      const foregroundPrimaryValue = rootStyle
        .getPropertyValue('--semantic-color-foreground-primary')
        .trim();

      // Check actual background color to determine real theme (more reliable than CSS variables)
      const backgroundColor = bodyStyle.backgroundColor;
      // Parse RGB to determine if background is light or dark
      // Light backgrounds are closer to white (high RGB values), dark are closer to black (low RGB values)
      const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      let isDark = false;
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        const brightness = (r + g + b) / 3;
        // If average brightness < 128, it's dark mode
        isDark = brightness < 128;
      } else {
        // Fallback: infer from CSS variable if RGB parsing fails
        isDark = foregroundPrimaryValue === '#fafafa';
      }

      const newScheme = isDark ? 'dark' : 'light';
      setColorScheme(newScheme);

      const getPropertyValue = (property: string, fallback: string = '') => {
        // Try root first, then body
        let value = rootStyle.getPropertyValue(property).trim();
        if (!value) {
          value = bodyStyle.getPropertyValue(property).trim();
        }

        // If this is the foreground-primary property and the value doesn't match the detected theme,
        // use the fallback instead (CSS variables might be wrong)
        let shouldUseFallback = !value;
        if (property === '--semantic-color-foreground-primary' && value) {
          const valueIsDarkMode = value === '#fafafa';
          if (valueIsDarkMode !== isDark) {
            // CSS variable doesn't match detected theme, use fallback
            shouldUseFallback = true;
          }
        }

        // getComputedStyle should resolve CSS variables to actual color values
        // Use fallback if value is empty OR if CSS variable doesn't match detected theme
        return shouldUseFallback ? fallback : value;
      };

      // Fallback colors based on theme (only used if CSS variables aren't available)
      const foregroundPrimary = isDark ? '#fafafa' : '#141414';
      const backgroundPrimary = isDark ? '#000000' : '#ffffff';

      setColors({
        anchorFill: getPropertyValue(
          '--semantic-color-background-tertiary',
          isDark ? '#3a3a3a' : '#cecece'
        ),
        anchorStroke: getPropertyValue(
          '--semantic-color-foreground-info',
          '#0a65fe'
        ),
        metricStroke: getPropertyValue(
          '--semantic-color-border-primary',
          isDark ? '#555555' : '#aeaeae'
        ),
        metricFill: getPropertyValue(
          '--semantic-color-foreground-primary',
          foregroundPrimary
        ),
        checkerFill: getPropertyValue(
          '--semantic-color-background-image-overlay',
          isDark ? 'rgb(0 0 0 / 70%)' : 'rgb(0 0 0 / 50%)'
        ),
        checkerStroke: getPropertyValue(
          '--semantic-color-background-tertiary',
          isDark ? '#3a3a3a' : '#cecece'
        ),
        boundsStroke: getPropertyValue(
          '--semantic-color-foreground-info',
          '#0a65fe'
        ),
        boundsFill: getPropertyValue(
          '--semantic-color-background-info-subtle',
          isDark ? '#001b5a' : '#d9f3fe'
        ),
        lsbStroke: getPropertyValue(
          '--semantic-color-foreground-info',
          '#0a65fe'
        ),
        lsbFill: getPropertyValue(
          '--semantic-color-background-info-subtle',
          isDark ? '#001b5a' : '#d9f3fe'
        ),
        rsbStroke: getPropertyValue(
          '--semantic-color-foreground-warning',
          '#ac5c00'
        ),
        rsbFill: getPropertyValue(
          '--semantic-color-background-warning-subtle',
          isDark ? '#331b00' : '#ffedcc'
        ),
        pathStroke: getPropertyValue(
          '--semantic-color-foreground-warning',
          '#ac5c00'
        ),
        pathFill: getPropertyValue(
          '--semantic-color-foreground-primary',
          foregroundPrimary
        ),
        handleStroke: getPropertyValue(
          '--semantic-color-background-warning-strong',
          '#d77600'
        ),
        handleFill: getPropertyValue(
          '--semantic-color-background-warning',
          '#ac5c00'
        ),
        cursorStroke: getPropertyValue(
          '--color-core-transparent',
          'transparent'
        ),
        cursorFill: getPropertyValue(
          '--semantic-color-foreground-primary',
          foregroundPrimary
        ),
        labelFill: getPropertyValue(
          '--semantic-color-foreground-primary',
          foregroundPrimary
        ),
        labelStroke: getPropertyValue(
          '--semantic-color-background-primary',
          backgroundPrimary
        ),
        highlightBackground: getPropertyValue(
          '--semantic-color-background-highlight',
          isDark ? '#7b0000' : '#f7c1c2'
        ),
      });
    };

    // Initial sync
    updateScheme();

    //  Observe class changes on <html>
    const observer = new MutationObserver(() => {
      // batch into next microtask to avoid jank
      Promise.resolve().then(updateScheme);
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      // disconnect observer
      observer.disconnect();
    };
  }, []);

  const setCurrentFont = useCallback(
    (index: number) => {
      setCurrentFontIndex(index);
    },
    [setCurrentFontIndex]
  );

  const setAxisValues = useCallback(
    (v: Partial<AxisValues>) => {
      setAxisValuesState((prev) => ({ ...prev, ...v }) as AxisValues);
    },
    [setAxisValuesState]
  );

  // memoize everything for minimal re‑renders
  const font = useMemo(
    () => fonts[currentFontIndex]?.font || null,
    [fonts, currentFontIndex]
  );
  const fontInstance = useMemo(
    () => (font ? font.getVariation(axisValues) : null),
    [font, axisValues]
  );
  const glyph = useMemo(() => {
    if (!fontInstance) return null;
    const glyph = fontInstance.glyphForCodePoint(glyphUnicode);

    if (!glyph) return null;
    return glyph;
  }, [fontInstance, glyphUnicode]);

  const contextValue = useMemo(
    (): InspectorContextType => ({
      fonts,
      currentFontIndex,
      font,
      fontInstance,
      axisValues,
      glyphUnicode,
      glyph,
      showDetails,
      setShowDetails,
      setAxisValues,
      setGlyphUnicode,
      setCurrentFont,
      anatomyFeatures,
      selectedAnatomy,
      toggleAnatomy,
      colorScheme,
      colors,
    }),
    [
      fonts,
      currentFontIndex,
      font,
      fontInstance,
      axisValues,
      glyphUnicode,
      glyph,
      showDetails,
      setAxisValues,
      colorScheme,
      colors,
      anatomyFeatures,
      selectedAnatomy,
      toggleAnatomy,
      setCurrentFont,
    ]
  );

  return (
    <InspectorContext.Provider value={contextValue}>
      {children}
    </InspectorContext.Provider>
  );
};

// ---------------------------
// Main Inspector Component
// ---------------------------

export const FontInspector: React.FC = () => (
  <InspectorProvider>
    <section className="content">
      <h1>Decoding Type Anatomy: Functional Choices for Design Systems</h1>
      <p>
        Think of a typeface&apos;s anatomy as its DNA. Every curve, stroke, and
        axis plays a role in how users read, feel, and interact with your
        product. For design‑system teams, mastering anatomy isn&apos;t just
        academic—it&apos;s the difference between a font that <em>looks</em>
        good and one that <em>works</em> flawlessly across contexts, from dense
        data tables to expressive marketing banners, on low‑res devices and
        within variable‑font ecosystems.
      </p>
      <p>
        Rather than a glossary of terms, we&apos;ll tie each feature back to
        real design decisions, performance trade‑offs, and system architecture.
      </p>
    </section>
    <section className={styles.symbolInspector}>
      <div className={styles.inspectorContainer}>
        <InspectorControls />
        <div className={styles.canvasContainer}>
          <SymbolCanvas />
        </div>
        <details className={styles.accordion} open>
          <summary>Anatomy Details</summary>
          <AnatomyControls />
          <p className="caption" style={{ margin: '1rem' }}>
            Credit where credit is due, this is heavily inspired by Rasmus and
            their Inter font inspector at{' '}
            <a href="https://rsms.me/inter/#glyphs">
              https://rsms.me/inter/#glyphs
            </a>
          </p>
        </details>
      </div>
      <div className={styles.symbolContainer}>
        <SymbolGrid />
        {TypographyArticleContent}
      </div>
    </section>
  </InspectorProvider>
);
