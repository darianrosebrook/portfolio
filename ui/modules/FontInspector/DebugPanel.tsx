/**
 * Debug Panel Component for FontInspector
 *
 * Displays diagnostic information to help identify rendering issues.
 */

'use client';

import { useInspector } from '@/ui/modules/FontInspector/FontInspector';
import styles from './DebugPanel.module.scss';

export function DebugPanel() {
  const {
    fontInstance,
    glyph,
    axisValues,
    showDetails,
    colors,
    selectedAnatomy,
  } = useInspector();

  const hasColors = Object.values(colors).some((c) => c && c.trim() !== '');
  const selectedCount = Array.from(selectedAnatomy.values()).filter(
    (f) => f.selected
  ).length;

  return (
    <div className={styles.debugPanel}>
      <h3>Debug Information</h3>
      <dl>
        <dt>Font Instance:</dt>
        <dd className={fontInstance ? styles.ok : styles.error}>
          {fontInstance ? '✓ Loaded' : '✗ Not loaded'}
        </dd>

        <dt>Glyph:</dt>
        <dd className={glyph ? styles.ok : styles.error}>
          {glyph
            ? `✓ ${glyph.name} (U+${glyph.codePoints?.[0]?.toString(16).toUpperCase().padStart(4, '0') || 'N/A'})`
            : '✗ Not selected'}
        </dd>

        <dt>Colors Initialized:</dt>
        <dd className={hasColors ? styles.ok : styles.warning}>
          {hasColors ? '✓ Yes' : '⚠ No (empty strings)'}
        </dd>

        <dt>Selected Features:</dt>
        <dd>{selectedCount} selected</dd>

        <dt>Show Details:</dt>
        <dd>{showDetails ? '✓ On' : '✗ Off'}</dd>

        <dt>Axis Values:</dt>
        <dd>
          Weight: {axisValues.wght}, Opsz: {axisValues.opsz}
        </dd>

        {fontInstance && (
          <>
            <dt>Font Metrics:</dt>
            <dd>
              Units/Em: {fontInstance.unitsPerEm}, Ascent: {fontInstance.ascent}
              , Descent: {fontInstance.descent}
            </dd>
          </>
        )}

        {glyph && (
          <>
            <dt>Glyph Metrics:</dt>
            <dd>
              Advance: {glyph.advanceWidth}, BBox:{' '}
              {glyph.bbox
                ? `${glyph.bbox.minX}, ${glyph.bbox.minY}, ${glyph.bbox.maxX}, ${glyph.bbox.maxY}`
                : 'N/A'}
            </dd>

            <dt>Path Commands:</dt>
            <dd>{glyph.path?.commands?.length || 0} commands</dd>
          </>
        )}
      </dl>

      {!hasColors && (
        <div className={styles.warningBox}>
          <strong>Warning:</strong> Colors not initialized. This will cause
          rendering issues.
        </div>
      )}
    </div>
  );
}
