'use client';

import { DrawColors } from '@/utils/geometry/drawing';
import type { Axis } from 'fontkit';
import type { Font, Glyph } from './fontkit-types';
import type { AnatomyFeature } from './types';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnatomyControls } from './AnatomyControls';
import { ANATOMY_FEATURES } from './anatomyToggles';
import './FontInspector.css';
import { InspectorControls } from './InspectorControls';
import { SymbolCanvas } from './SymbolCanvas';
import { SymbolGrid } from './SymbolGrid';
import { TypographyArticleContent } from './TypographyArticleContent';

// New unified detection system imports
import {
  detectGlyphFeatures,
  getRegisteredFeatures,
  reconcileFeatures,
} from '@/utils/typeAnatomy/detectorRegistry';
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
}

interface FontInfo {
  name: string;
  url: string;
  font: Font | null;
  loadState: 'loading' | 'loaded' | 'error';
  loadError: string | null;
}

const FONT_SOURCES = [
  { name: 'Nohemi', url: '/fonts/Nohemi-VF.ttf' },
  { name: 'Inter', url: '/fonts/InterVariable.ttf' },
  { name: 'Neon', url: '/fonts/MonaspaceNeonVF.ttf' },
  { name: 'Newsreader', url: '/fonts/Newsreader-VF.ttf' },
];

// Re-export AnatomyFeature for external use
export type { AnatomyFeature } from './types';

interface InspectorContextType {
  colorScheme: string;
  fonts: FontInfo[];
  currentFontIndex: number;
  font: Font | null;
  fontInstance: Font | null;
  axisValues: AxisValues;
  supportedAxes: Record<string, Axis>;
  glyphUnicode: number;
  glyph: Glyph | null;
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
  setAxisValues: (v: Partial<AxisValues>) => void;
  setGlyphUnicode: (u: number) => void;
  setCurrentFont: (index: number) => void;
  retryCurrentFont: () => void;
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
  initialGlyphUnicode?: number;
}> = ({ children, initialGlyphUnicode = 0x0041 }) => {
  const [fonts, setFonts] = useState<FontInfo[]>(() =>
    FONT_SOURCES.map((source) => ({
      ...source,
      font: null,
      loadState: 'loading',
      loadError: null,
    }))
  );
  const mounted = useRef(false);
  const fontRequests = useRef(new Map<number, AbortController>());
  const [currentFontIndex, setCurrentFontIndex] = useState(0);
  const [requestedAxisValues, setAxisValuesState] = useState<AxisValues>({
    wght: 400,
    opsz: 32,
  });
  const [glyphUnicode, setGlyphUnicode] = useState<number>(initialGlyphUnicode);
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

  // Derived from `fontfeatures/anatomy.json` filtered against the detector
  // registry; see `anatomyToggles.ts`. Adding a new toggle no longer
  // requires editing this file — touch the JSON and the detector instead.
  const anatomyFeatures = ANATOMY_FEATURES;
  const toggleAnatomy = useCallback((feature: AnatomyFeature) => {
    setSelectedAnatomy((s) => {
      const next = new Map(s);
      if (next.has(feature.feature)) next.delete(feature.feature);
      else next.set(feature.feature, feature);
      return next;
    });
  }, []);

  const loadFont = useCallback(async (index: number) => {
    const source = FONT_SOURCES[index];
    if (!source || !mounted.current || fontRequests.current.has(index)) return;
    const controller = new AbortController();
    fontRequests.current.set(index, controller);
    const isCurrent = () =>
      mounted.current &&
      !controller.signal.aborted &&
      fontRequests.current.get(index) === controller;
    setFonts((previous) =>
      previous.map((entry, entryIndex) =>
        entryIndex === index
          ? { ...entry, font: null, loadState: 'loading', loadError: null }
          : entry
      )
    );
    try {
      const fontkit = await import('fontkit');
      if (!isCurrent()) return;
      const response = await fetch(source.url, { signal: controller.signal });
      if (!isCurrent()) return;
      if (!response.ok)
        throw new Error(`Request failed (HTTP ${response.status})`);
      const arrayBuffer = await response.arrayBuffer();
      if (!isCurrent()) return;
      const font = fontkit.create(new Uint8Array(arrayBuffer));
      if (!('glyphForCodePoint' in font))
        throw new Error('The font file does not contain a single font');
      if (!isCurrent()) return;
      setFonts((previous) =>
        previous.map((entry, entryIndex) =>
          entryIndex === index
            ? { ...entry, font, loadState: 'loaded', loadError: null }
            : entry
        )
      );
    } catch (error) {
      if (!isCurrent()) return;
      const loadError =
        error instanceof Error ? error.message : 'The font could not be loaded';
      setFonts((previous) =>
        previous.map((entry, entryIndex) =>
          entryIndex === index
            ? { ...entry, font: null, loadState: 'error', loadError }
            : entry
        )
      );
    } finally {
      if (fontRequests.current.get(index) === controller)
        fontRequests.current.delete(index);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    const requests = fontRequests.current;
    // The development effect replay cancels its first launch before any request.
    queueMicrotask(() => {
      if (!cancelled)
        FONT_SOURCES.forEach((_, index) => {
          void loadFont(index);
        });
    });
    return () => {
      cancelled = true;
      mounted.current = false;
      for (const controller of requests.values()) controller.abort();
      requests.clear();
    };
  }, [loadFont]);

  const retryCurrentFont = useCallback(() => {
    if (fonts[currentFontIndex]?.loadState === 'error')
      void loadFont(currentFontIndex);
  }, [fonts, currentFontIndex, loadFont]);

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

  const font = useMemo(
    () => fonts[currentFontIndex]?.font || null,
    [fonts, currentFontIndex]
  );
  const supportedAxes = useMemo(() => font?.variationAxes ?? {}, [font]);
  // Only supported, effective values reach variation, detection and labels.
  const axisValues = useMemo((): AxisValues => {
    const effective: AxisValues = {};
    for (const [tag, axis] of Object.entries(supportedAxes)) {
      const requested = requestedAxisValues[tag];
      effective[tag] = Math.max(
        axis.min,
        Math.min(
          axis.max,
          Number.isFinite(requested) ? requested : axis.default
        )
      );
    }
    return effective;
  }, [supportedAxes, requestedAxisValues]);
  const setAxisValues = useCallback(
    (values: Partial<AxisValues>) => {
      setAxisValuesState((prev) => {
        const next = { ...prev };
        for (const [tag, value] of Object.entries(values)) {
          const axis = supportedAxes[tag];
          if (axis && value !== undefined && Number.isFinite(value)) {
            next[tag] = Math.max(axis.min, Math.min(axis.max, value));
          }
        }
        return next;
      });
    },
    [supportedAxes]
  );
  const fontInstance = useMemo(
    () =>
      font &&
      (Object.keys(supportedAxes).length
        ? font.getVariation(axisValues)
        : font),
    [font, supportedAxes, axisValues]
  );
  const glyph = useMemo(() => {
    if (
      !fontInstance ||
      !Number.isInteger(glyphUnicode) ||
      glyphUnicode < 0 ||
      glyphUnicode > 0x10ffff ||
      (glyphUnicode >= 0xd800 && glyphUnicode <= 0xdfff) ||
      !fontInstance.hasGlyphForCodePoint(glyphUnicode)
    )
      return null;
    const glyph = fontInstance.glyphForCodePoint(glyphUnicode);

    if (!glyph) return null;
    return glyph;
  }, [fontInstance, glyphUnicode]);

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

  // Hints and detectors consume the same context for the current variation.
  const detectionContext: DetectionContext | null =
    geometryCache?.context ?? null;

  // Get current character for hints
  const currentChar = useMemo(() => {
    return Number.isInteger(glyphUnicode) &&
      glyphUnicode >= 0 &&
      glyphUnicode <= 0x10ffff
      ? String.fromCodePoint(glyphUnicode)
      : '';
  }, [glyphUnicode]);

  // Current geometry establishes availability; hints order the suggested parts.
  const rawDetectedFeatures = useMemo((): Map<FeatureID, FeatureInstance[]> => {
    if (!geometryCache) return new Map();
    return detectGlyphFeatures(geometryCache, getRegisteredFeatures());
  }, [geometryCache]);

  const availableFeatureIds = useMemo((): FeatureID[] => {
    if (!detectionContext || !glyph) return [];
    const hints = getFeatureHints(currentChar, detectionContext);
    const detected = [...rawDetectedFeatures]
      .filter(([, instances]) => instances.length > 0)
      .map(([id]) => id);
    return [...new Set([...hints.map((hint) => hint.id), ...detected])].filter(
      (id) => detected.includes(id)
    );
  }, [currentChar, detectionContext, glyph, rawDetectedFeatures]);

  // Get selected feature IDs from anatomy selection
  const selectedFeatureIds = useMemo((): FeatureID[] => {
    const ids: FeatureID[] = [];
    for (const [name, feature] of selectedAnatomy) {
      if (feature.disabled) continue;
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

  // Both renderers select from the same current detection before reconciliation.
  const detectedFeatures = useMemo((): Map<FeatureID, FeatureInstance[]> => {
    if (!geometryCache || filteredSelectedFeatureIds.length === 0)
      return new Map();

    try {
      const result = reconcileFeatures(
        new Map(
          filteredSelectedFeatureIds.map((id) => [
            id,
            rawDetectedFeatures.get(id) ?? [],
          ])
        )
      );
      return result;
    } catch (error) {
      console.warn('[FontInspector] Error detecting features:', error);
      return new Map();
    }
  }, [geometryCache, filteredSelectedFeatureIds, rawDetectedFeatures]);

  const contextValue = useMemo(
    (): InspectorContextType => ({
      fonts,
      currentFontIndex,
      font,
      fontInstance,
      axisValues,
      supportedAxes,
      glyphUnicode,
      glyph,
      showDetails,
      setShowDetails,
      setAxisValues,
      setGlyphUnicode,
      setCurrentFont,
      retryCurrentFont,
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
      supportedAxes,
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
      retryCurrentFont,
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
    <section data-ds-component="FontInspector" className="symbolInspector">
      <div className="inspectorContainer">
        <InspectorControls />
        <div className="canvasContainer">
          <SymbolCanvas />
        </div>
        <details className="accordion" open>
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
      <div className="symbolContainer">
        <SymbolGrid />
        {TypographyArticleContent}
      </div>
    </section>
  </InspectorProvider>
);
