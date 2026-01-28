'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useBrand, type BrandId, type BrandInfo } from '@/context/BrandContext';
import styles from './BrandSwitcher.module.scss';

/** Brand mood descriptions */
const brandMoods: Record<BrandId, string> = {
  default: 'Bold • Confident',
  corporate: 'Professional • Trustworthy',
  forest: 'Natural • Grounded',
  sunset: 'Warm • Energetic',
  midnight: 'Mysterious • Premium',
  ocean: 'Calm • Refreshing',
  canary: 'Playful • Optimistic',
  monochrome: 'Minimal • Sophisticated',
  rose: 'Soft • Approachable',
  slate: 'Neutral • Modern',
};

const densityOptions = ['tight', 'compact', 'default', 'spacious'] as const;

const fontOptions = ['inter', 'newsreader', 'monaspace'] as const;

function getFontFamily(font: string) {
  if (font === 'monaspace') return 'monospace';
  if (font === 'newsreader') return 'serif';
  return 'sans-serif';
}

export interface BrandSwitcherProps {
  /** Show the auto-cycle controls */
  showAutoCycle?: boolean;
  /** Show brand descriptions */
  showDescriptions?: boolean;
  /** Show brand personality preview (radius, spacing, motion icons) */
  showPersonality?: boolean;
  /** Show density controls */
  showDensity?: boolean;
  /** Show font family controls */
  showFonts?: boolean;
  /** Compact mode - just swatches, no labels */
  compact?: boolean;
  /** Enable sticky positioning */
  sticky?: boolean;
  /** Enable keyboard navigation (arrow keys to cycle) */
  enableKeyboard?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * BrandSwitcher component for selecting and cycling between brand themes.
 *
 * Provides a visual interface for switching brands with color swatches,
 * optional auto-cycling, and randomization features.
 */
export const BrandSwitcher: React.FC<BrandSwitcherProps> = ({
  showAutoCycle = false,
  showDescriptions = false,
  showPersonality = false,
  showDensity = false,
  showFonts = false,
  compact = false,
  sticky = false,
  enableKeyboard = true,
  className,
}) => {
  const {
    brand,
    availableBrands,
    setBrand,
    cycleBrand,
    randomizeBrand,
    isAutoCycling,
    setAutoCycling,
    autoCycleInterval,
    setAutoCycleInterval,
    density,
    setDensity,
    headingFont,
    setHeadingFont,
    bodyFont,
    setBodyFont,
  } = useBrand();

  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const cyclePrevious = useCallback(() => {
    const currentIndex = availableBrands.findIndex((b) => b.id === brand);
    const prevIndex =
      currentIndex <= 0 ? availableBrands.length - 1 : currentIndex - 1;
    setBrand(availableBrands[prevIndex].id);
  }, [availableBrands, brand, setBrand]);

  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isWithinComponent = containerRef.current?.contains(
        document.activeElement
      );
      const isBodyFocused = document.activeElement === document.body;

      if (!isWithinComponent && !isBodyFocused) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          cycleBrand();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          cyclePrevious();
          break;
        case 'r':
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            randomizeBrand();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, cycleBrand, cyclePrevious, randomizeBrand]);

  const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1000) {
      setAutoCycleInterval(value);
    }
  };

  const currentBrand = availableBrands.find((b) => b.id === brand);
  const currentMood = brandMoods[brand];
  const densityIndex = densityOptions.indexOf(density);

  const containerClasses = [
    styles.brandSwitcher,
    compact && styles.compact,
    sticky && styles.sticky,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (compact) {
    return (
      <div ref={containerRef} className={containerClasses} tabIndex={-1}>
        <div className={styles.swatchRow}>
          {availableBrands.map((brandInfo) => (
            <button
              key={brandInfo.id}
              type="button"
              className={`${styles.swatch} ${brand === brandInfo.id ? styles.active : ''}`}
              style={
                {
                  '--swatch-color': brandInfo.accentColor,
                } as React.CSSProperties
              }
              onClick={() => setBrand(brandInfo.id)}
              aria-label={`Switch to ${brandInfo.name} theme`}
              aria-pressed={brand === brandInfo.id}
              title={brandInfo.name}
            />
          ))}
        </div>
        {enableKeyboard && (
          <span className={styles.keyboardHint}>Use arrow keys to switch</span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      tabIndex={-1}
      style={
        {
          '--theme-color': currentBrand?.accentColor,
        } as React.CSSProperties
      }
    >
      {/* Brand Theme Section */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Brand Theme</h2>

        {/* Selected brand info */}
        <div className={styles.selectedBrandInfo}>
          <div
            className={styles.selectedBrandDot}
            style={{ background: currentBrand?.accentColor }}
          />
          <div>
            <div className={styles.selectedBrandName}>
              {currentBrand?.name}
            </div>
            <div className={styles.selectedBrandMood}>{currentMood}</div>
          </div>
        </div>

        {/* Swatch dot grid */}
        <div className={styles.swatchGrid}>
          {availableBrands.map((brandInfo) => (
            <button
              key={brandInfo.id}
              type="button"
              className={`${styles.swatchBtn} ${brand === brandInfo.id ? styles.selected : ''}`}
              onClick={() => setBrand(brandInfo.id)}
              aria-pressed={brand === brandInfo.id}
              aria-label={`Switch to ${brandInfo.name} theme`}
              title={brandInfo.name}
            >
              <span
                className={styles.swatchDot}
                style={{ background: brandInfo.accentColor }}
              />
            </button>
          ))}
        </div>
      </div>

      {showAutoCycle && (
        <div className={styles.sectionCard}>
          <div className={styles.autoCycle}>
            <label className={styles.autoCycleLabel}>
              <input
                type="checkbox"
                checked={isAutoCycling}
                onChange={(e) => setAutoCycling(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Auto-cycle brands</span>
            </label>
            {isAutoCycling && (
              <div className={styles.intervalControl}>
                <label htmlFor="cycle-interval" className={styles.intervalLabel}>
                  Interval:
                </label>
                <input
                  id="cycle-interval"
                  type="number"
                  min={1000}
                  step={500}
                  value={autoCycleInterval}
                  onChange={handleIntervalChange}
                  className={styles.intervalInput}
                />
                <span className={styles.intervalUnit}>ms</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spacing Density Section */}
      {showDensity && (
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Density</h2>
            <span className={styles.densityLabel}>
              {density.charAt(0).toUpperCase() + density.slice(1)}
            </span>
          </div>

          <div className={styles.densitySlider}>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={densityIndex}
              onChange={(e) =>
                setDensity(densityOptions[Number(e.target.value)])
              }
              className={styles.rangeInput}
              aria-label="Spacing density"
            />
            <div className={styles.densityTicks}>
              {densityOptions.map((opt) => (
                <span key={opt} className={styles.densityTick}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Typography Section */}
      {showFonts && (
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Typography</h2>

          <div className={styles.subsection}>
            <div className={styles.subsectionLabel}>Heading</div>
            <div className={styles.segmentedControl}>
              {fontOptions.map((fontOption) => (
                <button
                  key={fontOption}
                  type="button"
                  className={`${styles.segment} ${headingFont === fontOption ? styles.segmentActive : ''}`}
                  onClick={() => setHeadingFont(fontOption)}
                  aria-pressed={headingFont === fontOption}
                  aria-label={`Set heading font to ${fontOption}`}
                  style={{ fontFamily: getFontFamily(fontOption) }}
                >
                  {fontOption.charAt(0).toUpperCase() + fontOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.subsection}>
            <div className={styles.subsectionLabel}>Body</div>
            <div className={styles.segmentedControl}>
              {fontOptions.map((fontOption) => (
                <button
                  key={fontOption}
                  type="button"
                  className={`${styles.segment} ${bodyFont === fontOption ? styles.segmentActive : ''}`}
                  onClick={() => setBodyFont(fontOption)}
                  aria-pressed={bodyFont === fontOption}
                  aria-label={`Set body font to ${fontOption}`}
                  style={{ fontFamily: getFontFamily(fontOption) }}
                >
                  {fontOption.charAt(0).toUpperCase() + fontOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard hints */}
      {enableKeyboard && (
        <div className={styles.keyboardHint}>
          <kbd className={styles.kbd}>←</kbd>
          <kbd className={styles.kbd}>→</kbd> switch theme
          <span className={styles.kbdSeparator}>•</span>
          <kbd className={styles.kbd}>R</kbd> random
        </div>
      )}
    </div>
  );
};

export default BrandSwitcher;
