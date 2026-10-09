/**
 * Shared-state comparison route for Canvas and SVG glyph rendering.
 *
 * Dev route: /dev/glyph-compare?gid=0x0041
 *
 * Both surfaces use the same font, glyph, axes, and anatomy selection.
 */

'use client';

import { InspectorProvider } from '@/ui/modules/FontInspector/FontInspector';
import { SymbolCanvas } from '@/ui/modules/FontInspector/SymbolCanvas';
import { SymbolCanvasSVG } from '@/ui/modules/FontInspector/SymbolCanvasSVG';
import { InspectorControls } from '@/ui/modules/FontInspector/InspectorControls';
import { AnatomyControls } from '@/ui/modules/FontInspector/AnatomyControls';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function GlyphCompareContent() {
  const searchParams = useSearchParams();
  const gidParam = searchParams.get('gid');
  const parsedGid =
    gidParam && /^(?:0x)?[\da-f]+$/i.test(gidParam)
      ? parseInt(gidParam, 16)
      : 0x0041;
  const gid =
    Number.isInteger(parsedGid) &&
    parsedGid >= 0 &&
    parsedGid <= 0x10ffff &&
    !(parsedGid >= 0xd800 && parsedGid <= 0xdfff)
      ? parsedGid
      : 0x0041;

  return (
    <InspectorProvider key={gid} initialGlyphUnicode={gid}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Canvas vs SVG Comparison</h1>
          <p>
            Choose a font and anatomy features to compare both renderers. Drag
            either view to adjust weight when the font supports it.
          </p>
          <p>
            Glyph: U+{gid.toString(16).toUpperCase().padStart(4, '0')} (
            {String.fromCodePoint(gid)})
          </p>
        </header>

        <section
          className={styles.controls}
          data-ds-component="FontInspector"
          aria-label="Shared inspector controls"
        >
          <h2>Shared controls</h2>
          <div style={{ minWidth: 0, overflowX: 'auto' }}>
            <InspectorControls />
          </div>
          <details className="accordion">
            <summary>Select anatomy for both views</summary>
            <AnatomyControls />
          </details>
        </section>

        <div className={styles.comparison}>
          <div className={styles.panel}>
            <h2>Canvas</h2>
            <div className={styles.canvasWrapper}>
              <SymbolCanvas />
            </div>
            <div className={styles.info}>
              <p>Glyph and selected anatomy drawn into a Canvas surface.</p>
            </div>
          </div>

          <div className={styles.panel}>
            <h2>SVG</h2>
            <div className={styles.canvasWrapper}>
              <SymbolCanvasSVG />
            </div>
            <div className={styles.info}>
              <p>Glyph and selected anatomy drawn as SVG vector elements.</p>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <h3>Test Different Glyphs</h3>
          <div className={styles.glyphLinks}>
            <a href="?gid=0x0041">A</a>
            <a href="?gid=0x0042">B</a>
            <a href="?gid=0x0043">C</a>
            <a href="?gid=0x0061">a</a>
            <a href="?gid=0x0062">b</a>
            <a href="?gid=0x0063">c</a>
            <a
              href="?gid=0x01FD"
              style={{
                width: 'auto',
                padding: '0 var(--core-spacing-size-04)',
              }}
            >
              ǽ (U+01FD)
            </a>
            <a
              href="?gid=0x0020"
              style={{
                width: 'auto',
                padding: '0 var(--core-spacing-size-04)',
              }}
            >
              Space (U+0020)
            </a>
            <a href="?gid=0x0031">1</a>
            <a href="?gid=0x0032">2</a>
            <a href="?gid=0x0033">3</a>
          </div>
        </div>
      </div>
    </InspectorProvider>
  );
}

export default function GlyphComparePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GlyphCompareContent />
    </Suspense>
  );
}
