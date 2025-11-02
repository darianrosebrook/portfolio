'use client';

import { DrawColors } from '@/utils/geometry/drawing';
import type { Metrics } from '@/utils/typeAnatomy';
import { detectFeatures } from '@/utils/typeAnatomy/detector';
import { LetterFeatureHints } from '@/utils/typeAnatomy/registry';
import type { Font, Glyph } from 'fontkit';
import * as fontkit from 'fontkit';
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
import { DebugPanel } from './DebugPanel';
import styles from './FontInspector.module.scss';
import { InspectorControls } from './InspectorControls';
import { SymbolCanvasSVG as SymbolCanvas } from './SymbolCanvasSVG';
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
  autoDetectFeatures: () => void;
  detectedFeatures: Set<string>;
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

  // Debug logging for showDetails state
  useEffect(() => {
    console.log('[InspectorProvider] showDetails state changed:', showDetails);
  }, [showDetails]);
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
        label: 'Apex',
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
        feature: 'Arm',
        label: 'Arm',
        labelPosition: 'top',
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
        feature: 'Crotch',
        label: 'Crotch',
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
        feature: 'Serif',
        label: 'Serif',
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
        feature: 'Stem',
        label: 'Stem',
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
      {
        feature: 'Ear',
        label: 'Ear',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Shoulder',
        label: 'Shoulder',
        labelPosition: 'top',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Leg',
        label: 'Leg',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Neck',
        label: 'Neck',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Link',
        label: 'Link',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Arc',
        label: 'Arc',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Beak',
        label: 'Beak',
        labelPosition: 'top',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Bracket',
        label: 'Bracket',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Foot',
        label: 'Foot',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Hook',
        label: 'Hook',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Terminal',
        label: 'Terminal',
        labelPosition: 'bottom',
        disabled: false,
        selected: false,
        readonly: false,
      },
      {
        feature: 'Cross stroke',
        label: 'Cross stroke',
        labelPosition: 'top',
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
      if (next.has(feature.feature)) {
        next.delete(feature.feature);
      } else {
        // Ensure selected is true when adding to the map
        next.set(feature.feature, { ...feature, selected: true });
      }
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
        highlightBackground: getPropertyValue(
          '--semantic-color-background-accent'
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

  // Track last detected glyph to avoid re-detecting on every render
  const lastDetectedGlyphRef = useRef<{
    unicode: number;
    fontIndex: number;
  } | null>(null);

  // Track detected features for current glyph
  const [detectedFeatures, setDetectedFeatures] = useState<Set<string>>(
    new Set()
  );

  // Map registry feature names to our feature names
  const featureNameMap: Record<string, string> = useMemo(
    () => ({
      apex: 'Apex',
      aperture: 'Aperture',
      arc: 'Arc',
      arm: 'Arm',
      bar: 'Bar',
      beak: 'Beak',
      bowl: 'Bowl',
      bracket: 'Bracket',
      counter: 'Counter',
      crotch: 'Crotch',
      crossbar: 'Crossbar',
      crossstroke: 'Cross stroke',
      ear: 'Ear',
      eye: 'Eye',
      finial: 'Finial',
      foot: 'Foot',
      hook: 'Hook',
      leg: 'Leg',
      link: 'Link',
      loop: 'Loop',
      neck: 'Neck',
      serif: 'Serif',
      shoulder: 'Shoulder',
      spine: 'Spine',
      spur: 'Spur',
      stem: 'Stem',
      tail: 'Tail',
      terminal: 'Terminal',
      tittle: 'Tittle',
      vertex: 'Vertex',
    }),
    []
  );
  // Auto-detection function - detects features and auto-selects expected ones
  const autoDetectFeatures = useCallback(() => {
    // Only run if font and glyph are loaded
    if (!fontInstance || !glyph) return;

    // Skip if we've already detected for this glyph
    const currentGlyph = { unicode: glyphUnicode, fontIndex: currentFontIndex };
    if (
      lastDetectedGlyphRef.current &&
      lastDetectedGlyphRef.current.unicode === currentGlyph.unicode &&
      lastDetectedGlyphRef.current.fontIndex === currentGlyph.fontIndex
    ) {
      return;
    }

    // Mark this glyph as detected
    lastDetectedGlyphRef.current = currentGlyph;

    // Detect all features first (synchronous)
    const fontMetrics: Metrics = {
      baseline: 0,
      xHeight: fontInstance.xHeight || 0,
      capHeight: fontInstance.capHeight || 0,
      ascent: fontInstance.ascent || 0,
      descent: fontInstance.descent || 0,
    };

    const allAnatomyFeatures = [
      'Apex',
      'Arc',
      'Aperture',
      'Arm',
      'Bar',
      'Beak',
      'Bowl',
      'Bracket',
      'Counter',
      'Cross stroke',
      'Crossbar',
      'Crotch',
      'Ear',
      'Eye',
      'Finial',
      'Foot',
      'Hook',
      'Leg',
      'Link',
      'Loop',
      'Neck',
      'Serif',
      'Shoulder',
      'Spine',
      'Spur',
      'Stem',
      'Tail',
      'Terminal',
      'Tittle',
      'Vertex',
    ];

    const detectionResults = detectFeatures(
      allAnatomyFeatures,
      glyph,
      fontMetrics,
      fontInstance
    );

    const detected = new Set<string>();
    for (const [featureName, result] of detectionResults.entries()) {
      if (result.found) {
        detected.add(featureName);
      }
    }

    console.log('[autoDetectFeatures] Detection complete', {
      glyphChar: String.fromCodePoint(glyphUnicode),
      detectedCount: detected.size,
      detectedFeatures: Array.from(detected),
      allResults: Array.from(detectionResults.entries()).map(
        ([name, result]) => ({
          name,
          found: result.found,
        })
      ),
    });

    setDetectedFeatures(detected);

    // Convert Unicode code point to character string
    const char = String.fromCodePoint(glyphUnicode);

    // Look up likely features from registry
    const likelyFeatures = LetterFeatureHints[char] || [];

    if (likelyFeatures.length === 0) {
      return;
    }

    // Auto-select features that are:
    // 1. Expected for this character (from registry)
    // 2. Actually detected
    // 3. Available and not readonly
    setSelectedAnatomy((prev) => {
      const next = new Map(prev);
      let changed = false;

      for (const registryFeature of likelyFeatures) {
        const featureName = featureNameMap[registryFeature];
        if (!featureName) {
          console.warn(
            `[FontInspector] Unknown feature name: ${registryFeature}`
          );
          continue;
        }

        // Only auto-select if actually detected
        if (!detected.has(featureName)) {
          continue;
        }

        const existingFeature = next.get(featureName);
        if (
          existingFeature &&
          !existingFeature.readonly &&
          !existingFeature.selected
        ) {
          next.set(featureName, { ...existingFeature, selected: true });
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [fontInstance, glyph, glyphUnicode, currentFontIndex, featureNameMap]);

  // Auto-select likely features when font and glyph are ready
  useEffect(() => {
    autoDetectFeatures();
  }, [autoDetectFeatures]);

  // Filter anatomy features to show:
  // 1. Metric features (always shown)
  // 2. All detected features (or all features if detection hasn't run yet)
  const filteredAnatomyFeatures = useMemo(() => {
    const metricFeatures = new Set([
      'Baseline',
      'Cap height',
      'X-height',
      'Ascender',
      'Descender',
    ]);

    console.log('[filteredAnatomyFeatures] Filtering features', {
      glyphUnicode,
      detectedFeatures: Array.from(detectedFeatures),
      detectedCount: detectedFeatures.size,
      hasFont: !!fontInstance,
      hasGlyph: !!glyph,
    });

    // Show all features that are detected, or all features if detection hasn't run yet
    const filtered = anatomyFeatures.filter((feature) => {
      // Always show metrics
      if (metricFeatures.has(feature.feature)) {
        return true;
      }

      // If detection hasn't run yet, show all features (user can manually toggle)
      if (detectedFeatures.size === 0) {
        return true;
      }

      // Show features that are detected (regardless of whether they're "expected")
      // This allows users to explore features even if they're not in the expected list
      const isDetected = detectedFeatures.has(feature.feature);
      return isDetected;
    });

    console.log('[filteredAnatomyFeatures] Filtered result', {
      originalCount: anatomyFeatures.length,
      filteredCount: filtered.length,
      filteredFeatures: filtered.map((f) => f.feature),
    });

    return filtered;
  }, [anatomyFeatures, glyphUnicode, detectedFeatures, fontInstance, glyph]);

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
      anatomyFeatures: filteredAnatomyFeatures,
      selectedAnatomy,
      toggleAnatomy,
      autoDetectFeatures,
      detectedFeatures,
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
      filteredAnatomyFeatures,
      selectedAnatomy,
      toggleAnatomy,
      autoDetectFeatures,
      detectedFeatures,
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
        </details>
        <details className={styles.accordion}>
          <summary>Debug Information</summary>
          <DebugPanel />
        </details>
      </div>
      <div className={styles.symbolContainer}>
        <SymbolGrid />
        {TypographyArticleContent}
      </div>
    </section>
  </InspectorProvider>
);
