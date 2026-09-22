import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { PageTransition } from '@/ui/components/PageTransition/PageTransition';
import FoundationsLayout from '@/app/blueprints/foundations/layout';

/**
 * Server-rendering contract for PageTransition (foUC rule: server markup
 * must never hide content — test/components/animatedPrimitives.foUC.test.tsx).
 * The component used to return null until mounted, so the entire foundations
 * section shipped as an empty <main></main> shell: no crawlable content, no
 * no-JS fallback, and its Breadcrumbs client-only. Pins:
 *   - static HTML contains the children and the wrapper
 *   - static HTML carries no animation classes (enabled/fallback/transitioning
 *     are hydration-mismatch hazards and are gated on mount)
 *   - after client mount the classes apply, but transitioning does not on
 *     initial load (the route-change effect skips its mount run)
 *   - the foundations layout's static markup includes its breadcrumb nav and
 *     children
 */

vi.mock('next/navigation', () => ({
  usePathname: () => '/blueprints/foundations',
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('PageTransition server rendering', () => {
  it('renders children into static HTML instead of null', () => {
    const html = renderToStaticMarkup(
      <PageTransition transitionName="foundations-layout">
        <p>foundations content</p>
      </PageTransition>
    );
    expect(html).toContain('foundations content');
    expect(html).toContain('data-ds-component="PageTransition"');
  });

  it('emits no animation classes in static HTML', () => {
    const html = renderToStaticMarkup(
      <PageTransition transitionName="foundations-layout">
        <p>foundations content</p>
      </PageTransition>
    );
    // enabled / fallback / transitioning are all mount-gated: server and
    // first client render must agree (hydration mismatch hazard otherwise).
    expect(html).not.toMatch(/\b(enabled|fallback|transitioning)\b/);
  });

  it('applies enabled and fallback after client mount, without transitioning on initial load', () => {
    render(
      <PageTransition transitionName="foundations-layout">
        <p>foundations content</p>
      </PageTransition>
    );
    const wrapper = document.querySelector('[data-ds-component="PageTransition"]');
    expect(wrapper).toBeTruthy();
    // jsdom has no View Transitions API → fallback convention applies;
    // matchMedia mock reports no reduced motion → shouldAnimate is true.
    expect(wrapper?.classList.contains('enabled')).toBe(true);
    expect(wrapper?.classList.contains('fallback')).toBe(true);
    // The route-change effect skips its mount run: no fade on first load.
    expect(wrapper?.classList.contains('transitioning')).toBe(false);
  });
});

describe('foundations layout server rendering', () => {
  it('ships breadcrumb navigation and children in static HTML', () => {
    const html = renderToStaticMarkup(
      <FoundationsLayout>
        <p>doc body</p>
      </FoundationsLayout>
    );
    expect(html).toContain('<nav');
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('doc body');
  });
});
