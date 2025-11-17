'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import * as fontkit from 'fontkit';
import type { Font, Glyph } from 'fontkit';
import styles from './FontInspector.module.scss';
import { DrawColors } from '@/utils/geometry/drawing';
import { InspectorControls } from './InspectorControls';
import { AnatomyControls } from './AnatomyControls';
import { SymbolGrid } from './SymbolGrid';
import { SymbolCanvas } from './SymbolCanvas';
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
      const classDark = document.body.classList.contains('dark');
      const newScheme = classDark ? 'dark' : 'light';
      setColorScheme(newScheme);

      const root = document.body;
      const style = getComputedStyle(root);
      const getPropertyValue = (property: string) =>
        style.getPropertyValue(property).trim();
      setColors({
        anchorFill: getPropertyValue('--semantic-color-background-secondary'),
        anchorStroke: getPropertyValue('--semantic-color-foreground-info'),
        metricStroke: getPropertyValue('--semantic-color-border-primary'),
        metricFill: getPropertyValue('--semantic-color-foreground-primary'),
        checkerFill: getPropertyValue(
          '--semantic-color-background-image-overlay'
        ),
        checkerStroke: getPropertyValue(
          '--semantic-color-background-secondary'
        ),
        boundsStroke: getPropertyValue('--semantic-color-foreground-info'),
        boundsFill: getPropertyValue('--semantic-color-background-infoSubtle'),
        lsbStroke: getPropertyValue('--semantic-color-foreground-info'),
        lsbFill: getPropertyValue('--semantic-color-background-infoSubtle'),
        rsbStroke: getPropertyValue('--semantic-color-foreground-warning'),
        rsbFill: getPropertyValue('--semantic-color-background-warning-subtle'),
        pathStroke: getPropertyValue('--semantic-color-foreground-warning'),
        pathFill: getPropertyValue('--semantic-color-foreground-primary'),
        handleStroke: getPropertyValue(
          '--semantic-color-background-warning-strong'
        ),
        handleFill: getPropertyValue('--semantic-color-background-warning'),
        cursorStroke: getPropertyValue('--color-core-transparent'),
        cursorFill: getPropertyValue('--semantic-color-foreground-primary'),
        labelFill: getPropertyValue('--semantic-color-foreground-primary'),
        labelStroke: getPropertyValue('--semantic-color-background-primary'),
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
