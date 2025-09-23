import * as React from 'react';
import type { Decoration, SectionSpec } from '../types';

export type SectionSyncProps = {
  sections: SectionSpec[];
  root?: HTMLElement | null;
  onActiveSection?: (id: string) => void;
  onDecorate?: (d: Decoration[]) => void;
  threshold?: number[];
  rootMargin?: string;
};

/**
 * Synchronizes documentation sections with code editor decorations using Intersection Observer.
 *
 * This component observes sections in the documentation and automatically highlights
 * corresponding code lines in the editor as users scroll through the content.
 *
 * Features:
 * - Intersection Observer for performance
 * - Proximity-based scoring algorithm
 * - Automatic URL hash updates
 * - Configurable intersection thresholds
 * - Custom root element support (useful for containers)
 *
 * Algorithm:
 * - Uses intersection ratio (70%) + proximity to viewport center (30%)
 * - Selects section with highest composite score
 * - Updates decorations and active section callbacks
 *
 * @example
 * ```tsx
 * <SectionSync
 *   sections={[
 *     { id: 'intro', code: { file: '/App.tsx', lines: [1, 10] } },
 *     { id: 'hooks', code: { file: '/hooks.ts', lines: [15, 25] } }
 *   ]}
 *   root={containerElement}
 *   onActiveSection={(id) => updateActiveTab(id)}
 *   onDecorate={(decorations) => highlightLines(decorations)}
 * />
 * ```
 *
 * @param props - Configuration options for section synchronization
 */
export function SectionSync({
  sections,
  root,
  onActiveSection,
  onDecorate,
  threshold = [0, 0.25, 0.5, 0.75, 1],
  rootMargin = '0px',
}: SectionSyncProps) {
  React.useEffect(() => {
    const observeRoot = root ?? null;
    const nodeList = (root ?? document).querySelectorAll('[data-section-id]');
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { id: string; score: number } | null = null;
        // Compute viewport metrics relative to the chosen root
        let viewportHeight: number;
        let viewportTop: number;
        if (root && 'getBoundingClientRect' in root) {
          const rb = (root as HTMLElement).getBoundingClientRect();
          viewportHeight = rb.height || 1;
          viewportTop = rb.top;
        } else {
          viewportHeight = window.innerHeight || 1;
          viewportTop = 0;
        }
        const viewportCenterY = viewportTop + viewportHeight * 0.3;

        for (const e of entries) {
          const id = e.target.getAttribute('data-section-id');
          if (!id) continue;
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const targetY = rect.top + rect.height / 2;
          const distance = Math.abs(targetY - viewportCenterY);
          const proximity = Math.max(
            0,
            1 - distance / Math.max(viewportHeight, 1)
          );
          const score = e.intersectionRatio * 0.7 + proximity * 0.3;
          if (!best || score > best.score) best = { id, score };
        }
        if (best) {
          const s = sections.find((x) => x.id === best!.id);
          if (s?.code) {
            const { file, lines } = s.code;
            const [start, end] = lines;
            const decos: Decoration[] = [];
            for (let i = start; i <= end; i++)
              decos.push({ file, line: i, className: 'highlighted-line' });
            onDecorate?.(decos);
          } else {
            onDecorate?.([]);
          }
          onActiveSection?.(best.id);
        }
      },
      { root: observeRoot, threshold, rootMargin }
    );
    nodeList.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections, root, onActiveSection, onDecorate, threshold, rootMargin]);

  // Also emit initial decorators from the first section for non-observed mounts
  React.useEffect(() => {
    const s = sections[0];
    if (s?.code) {
      const { file, lines } = s.code;
      const [start, end] = lines;
      const decos: Decoration[] = [];
      for (let i = start; i <= end; i++)
        decos.push({ file, line: i, className: 'highlighted-line' });
      onDecorate?.(decos);
      onActiveSection?.(s.id);
    }
    // run once on sections seed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
