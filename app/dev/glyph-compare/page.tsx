/**
 * Side-by-side comparison route for Canvas vs SVG rendering.
 *
 * Dev route: /dev/glyph-compare?gid=0x0041
 *
 * Renders both Canvas and SVG versions side-by-side for visual comparison.
 */

'use client';

import { InspectorProvider } from '@/ui/modules/FontInspector/FontInspector';
import { SymbolCanvas } from '@/ui/modules/FontInspector/SymbolCanvas';
import { SymbolCanvasSVG } from '@/ui/modules/FontInspector/SymbolCanvasSVG';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './page.module.scss';

export const dynamic = 'force-dynamic';

function GlyphCompareContent() {
  const searchParams = useSearchParams();
  const gidParam = searchParams.get('gid');
  const gid = gidParam ? parseInt(gidParam, 16) : 0x0041; // Default to 'A'

  return (
    <InspectorProvider>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Canvas vs SVG Comparison</h1>
          <p>
            Compare rendering between canvas-based and SVG-based
            implementations.
          </p>
          <p>
            Glyph: U+{gid.toString(16).toUpperCase().padStart(4, '0')} (
            {String.fromCodePoint(gid)})
          </p>
        </header>

        <div className={styles.comparison}>
          <div className={styles.panel}>
            <h2>Canvas (Legacy)</h2>
            <div className={styles.canvasWrapper}>
              <SymbolCanvas />
            </div>
            <div className={styles.info}>
              <p>Canvas-based rendering</p>
              <ul>
                <li>Full redraw on toggle</li>
                <li>Manual coordinate management</li>
                <li>Limited accessibility</li>
              </ul>
            </div>
          </div>

          <div className={styles.panel}>
            <h2>SVG (New)</h2>
            <div className={styles.canvasWrapper}>
              <SymbolCanvasSVG />
            </div>
            <div className={styles.info}>
              <p>SVG-based rendering</p>
              <ul>
                <li>CSS show/hide (instant)</li>
                <li>DOM-based updates</li>
                <li>Full accessibility</li>
              </ul>
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
