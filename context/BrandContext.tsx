'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

/** Available brand identifiers */
export type BrandId =
  | 'default'
  | 'corporate'
  | 'forest'
  | 'sunset'
  | 'midnight'
  | 'ocean'
  | 'canary'
  | 'monochrome'
  | 'rose'
  | 'slate';

/** Available density identifiers */
export type DensityId = 'tight' | 'compact' | 'default' | 'spacious';

/** Available font family identifiers */
export type FontFamilyId = 'inter' | 'newsreader' | 'monaspace';

/** Brand metadata for display */
export interface BrandInfo {
  id: BrandId;
  name: string;
  description: string;
  accentColor: string;
  density?: DensityId; // Preferred density mode for this brand
  headingFont?: FontFamilyId; // Preferred heading font for this brand
  bodyFont?: FontFamilyId; // Preferred body font for this brand
}

/** Brand context value shape */
export interface BrandContextValue {
  /** Current active brand */
  brand: BrandId;
  /** All available brands with metadata */
  availableBrands: BrandInfo[];
  /** Set a specific brand */
  setBrand: (brand: BrandId) => void;
  /** Cycle to the next brand in the list */
  cycleBrand: () => void;
  /** Set a random brand */
  randomizeBrand: () => void;
  /** Whether auto-cycling is enabled */
  isAutoCycling: boolean;
  /** Toggle auto-cycling on/off */
  setAutoCycling: (enabled: boolean) => void;
  /** Auto-cycle interval in milliseconds */
  autoCycleInterval: number;
  /** Set auto-cycle interval */
  setAutoCycleInterval: (ms: number) => void;
  /** Current active density mode */
  density: DensityId;
  /**
   * Set a specific density mode. Manual override that will be reset to the
   * brand's preferred density the next time `setBrand` (or any brand change)
   * runs.
   */
  setDensity: (density: DensityId) => void;
  /** Current active heading font family */
  headingFont: FontFamilyId;
  /**
   * Set heading font family. Manual override that will be reset to the
   * brand's preferred heading font the next time the brand changes.
   */
  setHeadingFont: (font: FontFamilyId) => void;
  /** Current active body font family */
  bodyFont: FontFamilyId;
  /**
   * Set body font family. Manual override that will be reset to the brand's
   * preferred body font the next time the brand changes.
   */
  setBodyFont: (font: FontFamilyId) => void;
  /** Reset brand, density, and fonts to defaults (for playground cleanup) */
  resetBrand: () => void;
}

const STORAGE_KEY = 'portfolio-brand-preference';
const AUTO_CYCLE_KEY = 'portfolio-brand-auto-cycle';
const AUTO_CYCLE_INTERVAL_KEY = 'portfolio-brand-auto-cycle-interval';
const DEFAULT_AUTO_CYCLE_INTERVAL = 5000;
const DEFAULT_DENSITY: DensityId = 'default';
const DEFAULT_HEADING_FONT: FontFamilyId = 'inter';
const DEFAULT_BODY_FONT: FontFamilyId = 'inter';

/** Brand metadata registry with density and font preferences */
export const BRANDS: BrandInfo[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Red/coral accents - the current site identity',
    accentColor: '#d9292b', // red.500
    density: 'default',
    headingFont: 'inter',
    bodyFont: 'inter',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Blue accents - professional and trustworthy',
    accentColor: '#0a65fe', // blue.500
    density: 'compact',
    headingFont: 'inter',
    bodyFont: 'inter',
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Green accents - natural, calm, and grounded',
    accentColor: '#487e1e', // green.500
    density: 'spacious',
    headingFont: 'newsreader',
    bodyFont: 'newsreader',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Orange/amber accents - warm and energetic',
    accentColor: '#d87600', // orange.400
    density: 'default',
    headingFont: 'newsreader',
    bodyFont: 'inter',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Purple/violet accents - mysterious and sophisticated',
    accentColor: '#c127bc', // violet.500
    density: 'tight',
    headingFont: 'inter',
    bodyFont: 'monaspace',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Teal accents - calm, refreshing, and spacious',
    accentColor: '#14b8a6', // teal.500
    density: 'spacious',
    headingFont: 'inter',
    bodyFont: 'inter',
  },
  {
    id: 'canary',
    name: 'Canary',
    description: 'Yellow accents - bright, cheerful, and playful',
    accentColor: '#eab308', // yellow.500
    density: 'default',
    headingFont: 'inter',
    bodyFont: 'inter',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Neutral grays - minimal, focused, and clean',
    accentColor: '#6b7280', // neutral.500
    density: 'tight',
    headingFont: 'monaspace',
    bodyFont: 'monaspace',
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Pink/rose accents - soft, elegant, and gentle',
    accentColor: '#fb7185', // red.400 (rose-ish)
    density: 'spacious',
    headingFont: 'newsreader',
    bodyFont: 'newsreader',
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Steel blue accents - professional, cool, and crisp',
    accentColor: '#4b5563', // blue.600 (steel)
    density: 'compact',
    headingFont: 'inter',
    bodyFont: 'inter',
  },
];

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

interface BrandProviderProps {
  children: ReactNode;
  /** Initial brand to use (overrides localStorage) */
  initialBrand?: BrandId;
  /** Whether to randomize on initial load if no preference is stored */
  randomizeOnLoad?: boolean;
}

/**
 * BrandProvider manages the active brand theme and provides switching utilities.
 *
 * Applies the `data-brand` attribute to the document element for CSS targeting.
 * Persists brand preference to localStorage.
 */
export const BrandProvider: React.FC<BrandProviderProps> = ({
  children,
  initialBrand,
  randomizeOnLoad = false,
}) => {
  const [brand, setBrandState] = useState<BrandId>('default');
  const [density, setDensityState] = useState<DensityId>(DEFAULT_DENSITY);
  const [headingFont, setHeadingFontState] =
    useState<FontFamilyId>(DEFAULT_HEADING_FONT);
  const [bodyFont, setBodyFontState] =
    useState<FontFamilyId>(DEFAULT_BODY_FONT);
  const [isAutoCycling, setIsAutoCycling] = useState(false);
  const [autoCycleInterval, setAutoCycleInterval] = useState(
    DEFAULT_AUTO_CYCLE_INTERVAL
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount.
  //
  // The setState calls below trip react-hooks/set-state-in-effect. The
  // canonical fix is useSyncExternalStore, but localStorage's "storage" event
  // only fires on OTHER tabs — same-tab writes would need a custom event bus
  // to drive a subscription. Until that shim exists we keep the documented
  // mount-time hydration pattern, which React 18+ batches into a single
  // render and matches the SSR fallback ('default').
  useEffect(() => {
    const storedBrand = localStorage.getItem(STORAGE_KEY) as BrandId | null;
    const storedAutoCycle = localStorage.getItem(AUTO_CYCLE_KEY);
    const storedInterval = localStorage.getItem(AUTO_CYCLE_INTERVAL_KEY);

    let activeBrand: BrandId;

    if (initialBrand) {
      activeBrand = initialBrand;
    } else if (storedBrand && BRANDS.some((b) => b.id === storedBrand)) {
      activeBrand = storedBrand;
    } else if (randomizeOnLoad) {
      const randomIndex = Math.floor(Math.random() * BRANDS.length);
      activeBrand = BRANDS[randomIndex].id;
    } else {
      activeBrand = 'default';
    }

    const brandInfo = BRANDS.find((b) => b.id === activeBrand);

    /* eslint-disable react-hooks/set-state-in-effect -- see comment above */
    setBrandState(activeBrand);
    setDensityState(brandInfo?.density || DEFAULT_DENSITY);
    setHeadingFontState(brandInfo?.headingFont || DEFAULT_HEADING_FONT);
    setBodyFontState(brandInfo?.bodyFont || DEFAULT_BODY_FONT);

    if (storedAutoCycle === 'true') {
      setIsAutoCycling(true);
    }

    if (storedInterval) {
      const interval = parseInt(storedInterval, 10);
      if (!isNaN(interval) && interval >= 1000) {
        setAutoCycleInterval(interval);
      }
    }

    setIsHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [initialBrand, randomizeOnLoad]);

  // Apply data-brand attribute to document
  useEffect(() => {
    if (!isHydrated) return;

    document.documentElement.setAttribute('data-brand', brand);
    localStorage.setItem(STORAGE_KEY, brand);
  }, [brand, isHydrated]);

  // Apply data-density attribute to document
  useEffect(() => {
    if (!isHydrated) return;

    document.documentElement.setAttribute('data-density', density);
  }, [density, isHydrated]);

  // Apply font family CSS custom properties to document root
  useEffect(() => {
    if (!isHydrated) return;

    const fontMap: Record<FontFamilyId, string> = {
      inter: 'var(--semantic-typography-semantic-family-body)',
      newsreader: 'var(--semantic-typography-semantic-family-serif)',
      monaspace: 'var(--semantic-typography-semantic-family-mono)',
    };

    document.documentElement.style.setProperty(
      '--font-family-heading',
      fontMap[headingFont]
    );
    document.documentElement.style.setProperty(
      '--font-family-body',
      fontMap[bodyFont]
    );
  }, [headingFont, bodyFont, isHydrated]);

  // Apply brand and its preferred density/fonts in a single update. Used by
  // setBrand/cycleBrand/randomizeBrand so derived state stays in sync without
  // a brand-watching effect (which trips react-hooks/set-state-in-effect).
  const applyBrand = useCallback((newBrand: BrandId) => {
    const brandInfo = BRANDS.find((b) => b.id === newBrand);
    setBrandState(newBrand);
    setDensityState(brandInfo?.density || DEFAULT_DENSITY);
    setHeadingFontState(brandInfo?.headingFont || DEFAULT_HEADING_FONT);
    setBodyFontState(brandInfo?.bodyFont || DEFAULT_BODY_FONT);
  }, []);

  // Persist auto-cycle settings
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(AUTO_CYCLE_KEY, isAutoCycling.toString());
  }, [isAutoCycling, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(AUTO_CYCLE_INTERVAL_KEY, autoCycleInterval.toString());
  }, [autoCycleInterval, isHydrated]);

  // Set brand with validation
  const setBrand = useCallback(
    (newBrand: BrandId) => {
      if (BRANDS.some((b) => b.id === newBrand)) {
        applyBrand(newBrand);
      } else {
        console.warn(`[BrandContext] Unknown brand: ${newBrand}`);
      }
    },
    [applyBrand]
  );

  // Cycle to next brand
  const cycleBrand = useCallback(() => {
    const currentIndex = BRANDS.findIndex((b) => b.id === brand);
    const nextIndex = (currentIndex + 1) % BRANDS.length;
    applyBrand(BRANDS[nextIndex].id);
  }, [brand, applyBrand]);

  // Randomize brand (exclude current, select from all available brands)
  const randomizeBrand = useCallback(() => {
    const otherBrands = BRANDS.filter((b) => b.id !== brand);
    if (otherBrands.length === 0) return;
    const randomIndex = Math.floor(Math.random() * otherBrands.length);
    applyBrand(otherBrands[randomIndex].id);
  }, [brand, applyBrand]);

  // Set density with validation (manual override, but will reset when brand changes)
  const setDensity = useCallback((newDensity: DensityId) => {
    if (['tight', 'compact', 'default', 'spacious'].includes(newDensity)) {
      setDensityState(newDensity);
    } else {
      console.warn(`[BrandContext] Unknown density: ${newDensity}`);
    }
  }, []);

  // Set heading font with validation
  const setHeadingFont = useCallback((font: FontFamilyId) => {
    if (['inter', 'newsreader', 'monaspace'].includes(font)) {
      setHeadingFontState(font);
    } else {
      console.warn(`[BrandContext] Unknown heading font: ${font}`);
    }
  }, []);

  // Set body font with validation
  const setBodyFont = useCallback((font: FontFamilyId) => {
    if (['inter', 'newsreader', 'monaspace'].includes(font)) {
      setBodyFontState(font);
    } else {
      console.warn(`[BrandContext] Unknown body font: ${font}`);
    }
  }, []);

  // Reset brand, density, and fonts to defaults (for playground cleanup).
  // The brand apply-effect persists 'default' to localStorage on the next tick,
  // so no explicit removeItem is needed.
  const resetBrand = useCallback(() => {
    setBrandState('default');
    setDensityState(DEFAULT_DENSITY);
    setHeadingFontState(DEFAULT_HEADING_FONT);
    setBodyFontState(DEFAULT_BODY_FONT);
  }, []);

  // Auto-cycle effect
  useEffect(() => {
    if (!isAutoCycling || !isHydrated) return;

    const intervalId = setInterval(() => {
      cycleBrand();
    }, autoCycleInterval);

    return () => clearInterval(intervalId);
  }, [isAutoCycling, autoCycleInterval, cycleBrand, isHydrated]);

  const contextValue = useMemo<BrandContextValue>(
    () => ({
      brand,
      availableBrands: BRANDS,
      setBrand,
      cycleBrand,
      randomizeBrand,
      isAutoCycling,
      setAutoCycling: setIsAutoCycling,
      autoCycleInterval,
      setAutoCycleInterval,
      density,
      setDensity,
      headingFont,
      setHeadingFont,
      bodyFont,
      setBodyFont,
      resetBrand,
    }),
    [
      brand,
      setBrand,
      cycleBrand,
      randomizeBrand,
      isAutoCycling,
      autoCycleInterval,
      density,
      setDensity,
      headingFont,
      setHeadingFont,
      bodyFont,
      setBodyFont,
      resetBrand,
    ]
  );

  return (
    <BrandContext.Provider value={contextValue}>
      {children}
    </BrandContext.Provider>
  );
};

/** Default fallback values for SSR and when outside provider */
const DEFAULT_BRAND_VALUE: BrandContextValue = {
  headingFont: DEFAULT_HEADING_FONT,
  setHeadingFont: () => {},
  bodyFont: DEFAULT_BODY_FONT,
  setBodyFont: () => {},
  brand: 'default',
  availableBrands: BRANDS,
  setBrand: () => {},
  cycleBrand: () => {},
  randomizeBrand: () => {},
  isAutoCycling: false,
  setAutoCycling: () => {},
  autoCycleInterval: DEFAULT_AUTO_CYCLE_INTERVAL,
  setAutoCycleInterval: () => {},
  density: DEFAULT_DENSITY,
  setDensity: () => {},
  resetBrand: () => {},
};

/**
 * Hook to access brand context values and switching utilities.
 *
 * Returns default fallback values during SSR or if used outside of BrandProvider.
 *
 * @example
 * ```tsx
 * const { brand, cycleBrand, availableBrands } = useBrand();
 *
 * return (
 *   <button onClick={cycleBrand}>
 *     Current: {brand} - Click to cycle
 *   </button>
 * );
 * ```
 */
export const useBrand = (): BrandContextValue => {
  const context = useContext(BrandContext);

  // Return defaults during SSR or when outside provider
  if (!context) {
    return DEFAULT_BRAND_VALUE;
  }

  return context;
};

/**
 * Hook to check if BrandProvider is available.
 * Useful for conditional rendering based on context availability.
 */
export const useBrandAvailable = (): boolean => {
  const context = useContext(BrandContext);
  return context !== undefined;
};

/**
 * Get brand info by ID (for use outside of React components)
 */
export const getBrandInfo = (brandId: BrandId): BrandInfo | undefined => {
  return BRANDS.find((b) => b.id === brandId);
};

/**
 * Get all available brand IDs
 */
export const getBrandIds = (): BrandId[] => {
  return BRANDS.map((b) => b.id);
};
