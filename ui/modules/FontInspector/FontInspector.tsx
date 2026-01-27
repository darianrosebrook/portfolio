'use client';

import { DrawColors } from '@/utils/geometry/drawing';
import type { Font, Glyph } from './fontkit-types';
import type { AnatomyFeature } from './types';
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

// New unified detection system imports
import { detectGlyphFeatures } from '@/utils/typeAnatomy/detectorRegistry';
import { buildGeometryCache } from '@/utils/typeAnatomy/geometryCache';
import { getFeatureHints } from '@/utils/typeAnatomy/glyphFeatureHints';
import type {
  DetectionContext,
  FeatureID,
  FeatureInstance,
  GeometryCache,
} from '@/utils/typeAnatomy/types';
import { toFeatureID } from '@/utils/typeAnatomy/types';

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

// Re-export AnatomyFeature for external use
export type { AnatomyFeature } from './types';

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
  // New unified detection system
  geometryCache: GeometryCache | null;
  detectionContext: DetectionContext | null;
  detectedFeatures: Map<FeatureID, FeatureInstance[]>;
  availableFeatureIds: FeatureID[];
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
    glyphBackground: '',
    featureHighlightFill: '',
    featureHighlightStroke: '',
    featureBackground: '',
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
      // Metric lines (always available)
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
      // Glyph anatomy features (now enabled!)
      {
        feature: 'Apex',
        label: 'Apex',
        labelPosition: 'top',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Vertex',
        label: 'Vertex',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Crossbar',
        label: 'Crossbar',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Stem',
        label: 'Stem',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Bowl',
        label: 'Bowl',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Counter',
        label: 'Counter',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Tittle',
        label: 'Tittle',
        labelPosition: 'top',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Arm',
        label: 'Arm',
        labelPosition: 'top',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Tail',
        label: 'Tail',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Loop',
        label: 'Loop',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Serif',
        label: 'Serif',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Finial',
        label: 'Finial',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Ear',
        label: 'Ear',
        labelPosition: 'top',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Spur',
        label: 'Spur',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Crotch',
        label: 'Crotch',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Eye',
        label: 'Eye',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Spine',
        label: 'Spine',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Aperture',
        label: 'Aperture',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
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
      // Dynamically import fontkit to avoid bundling issues in client components
      let fontkit: typeof import('fontkit') | null = null;
      try {
        const fontkitModule = await import('fontkit');
        fontkit = fontkitModule;
      } catch (importError: unknown) {
        console.error('Failed to import fontkit:', importError);
        return;
      }

      if (!fontkit || !fontkit.create) {
        console.error('fontkit.create is not available');
        return;
      }

      const loadedFonts = await Promise.all(
        fonts.map(async (fontInfo) => {
          try {
            const response = await fetch(fontInfo.url);
            const arrayBuffer = await response.arrayBuffer();
            // fontkit is guaranteed to be non-null here due to check above
            const font = fontkit!.create(new Uint8Array(arrayBuffer)) as Font;
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
          '--semantic-color-foreground-warning',
          isDark ? '#f59e0b' : '#d97706'
        ),
        glyphBackground: getPropertyValue(
          '--semantic-color-background-secondary',
          isDark ? '#1a1a1a' : '#f5f5f5'
        ),
        featureHighlightFill: getPropertyValue(
          '--semantic-color-background-danger-subtle',
          isDark ? '#4b0000' : '#fceaea'
        ),
        featureHighlightStroke: getPropertyValue(
          '--semantic-color-foreground-danger',
          isDark ? '#ea6465' : '#d9292b'
        ),
        featureBackground: getPropertyValue(
          '--semantic-color-background-secondary',
          isDark ? '#1a1a1a' : '#e5e5e5'
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

  // Build detection context from font
  const detectionContext = useMemo((): DetectionContext | null => {
    if (!fontInstance) return null;

    const fontAny = fontInstance as Font & {
      post?: { italicAngle?: number; isFixedPitch?: boolean };
      'OS/2'?: { usWeightClass?: number };
    };

    const fontName = (
      fontInstance.fullName ||
      fontInstance.familyName ||
      ''
    ).toLowerCase();
    const isSerif =
      fontName.includes('serif') &&
      !fontName.includes('sans') &&
      !fontName.includes('grotesk');

    const italicAngle = fontAny.post?.italicAngle || 0;

    return {
      isSerif,
      isItalic: Math.abs(italicAngle) > 0.5,
      italicAngle,
      isMono: fontAny.post?.isFixedPitch || false,
      weight: fontAny['OS/2']?.usWeightClass || 400,
      unitsPerEm: fontInstance.unitsPerEm || 1000,
    };
  }, [fontInstance]);

  // Build geometry cache for current glyph
  const geometryCache = useMemo((): GeometryCache | null => {
    if (!glyph || !fontInstance) return null;

    try {
      return buildGeometryCache(glyph, fontInstance, axisValues);
    } catch (error) {
      console.warn('[FontInspector] Error building geometry cache:', error);
      return null;
    }
  }, [glyph, fontInstance, axisValues]);

  // Get current character for hints
  const currentChar = useMemo(() => {
    return String.fromCodePoint(glyphUnicode);
  }, [glyphUnicode]);

  // Get available feature IDs for this glyph based on hints
  const availableFeatureIds = useMemo((): FeatureID[] => {
    if (!detectionContext) return [];

    const hints = getFeatureHints(currentChar, detectionContext);
    return hints.map((h) => h.id);
  }, [currentChar, detectionContext]);

  // Get selected feature IDs from anatomy selection
  const selectedFeatureIds = useMemo((): FeatureID[] => {
    const ids: FeatureID[] = [];
    for (const [name] of selectedAnatomy) {
      const id = toFeatureID(name);
      if (id) ids.push(id);
    }
    return ids;
  }, [selectedAnatomy]);

  // Filter selected features to only include those available for current glyph
  const filteredSelectedFeatureIds = useMemo((): FeatureID[] => {
    if (availableFeatureIds.length === 0) return [];
    return selectedFeatureIds.filter((id) => availableFeatureIds.includes(id));
  }, [selectedFeatureIds, availableFeatureIds]);

  // Run detection for selected features (filtered by glyph availability)
  const detectedFeatures = useMemo((): Map<FeatureID, FeatureInstance[]> => {
    console.log('[FontInspector] detectedFeatures memo:', {
      hasGeometryCache: !!geometryCache,
      showDetails,
      filteredSelectedFeatureIds,
      selectedFeatureIds,
      availableFeatureIds,
      selectedAnatomy: Array.from(selectedAnatomy.entries()),
    });

    if (
      !geometryCache ||
      !showDetails ||
      filteredSelectedFeatureIds.length === 0
    ) {
      console.log('[FontInspector] Returning empty map due to:', {
        noCache: !geometryCache,
        noDetails: !showDetails,
        noFeatures: filteredSelectedFeatureIds.length === 0,
      });
      return new Map();
    }

    try {
      const result = detectGlyphFeatures(
        geometryCache,
        filteredSelectedFeatureIds
      );
      console.log('[FontInspector] Detection result:', {
        size: result.size,
        features: Array.from(result.entries()).map(([id, instances]) => ({
          id,
          count: instances.length,
          instances,
        })),
      });
      return result;
    } catch (error) {
      console.warn('[FontInspector] Error detecting features:', error);
      return new Map();
    }
  }, [
    geometryCache,
    showDetails,
    filteredSelectedFeatureIds,
    selectedFeatureIds,
    availableFeatureIds,
    selectedAnatomy,
  ]);

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
      // New unified detection system
      geometryCache,
      detectionContext,
      detectedFeatures,
      availableFeatureIds,
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
      geometryCache,
      detectionContext,
      detectedFeatures,
      availableFeatureIds,
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
