import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '@/context/ReducedMotionContext';
import MotionPage, { metadata } from '@/app/blueprints/foundations/motion/page';

/**
 * Render-level contract for the Motion & Duration Foundations page.
 *
 * Falsifiable claims, one per block below:
 * - The page exports template-derived SEO metadata for its canonical URL.
 * - It renders through the shared education template (h1 from metadata) and
 *   leaves no "coming soon" placeholder behind.
 * - Every education section anchor is present in the DOM.
 * - The prose cites real motion token names from ui/designTokens (DTCG
 *   paths, duration/easing values, emitted CSS custom properties).
 * - Reduced-motion guidance references the mechanisms the repo actually
 *   ships (prefers-reduced-motion media queries and ReducedMotionContext).
 * - The design/code interplay section renders distinct content per tab.
 * - Checklist, assessment prompts, and cross-reference data all render.
 */

describe('Motion & Duration Foundations page', () => {
  it('exports SEO metadata derived from the page content block', () => {
    expect(metadata.title).toBe(
      'Motion & Duration Foundations | Darian Rosebrook'
    );
    expect(metadata.openGraph?.url).toBe(
      'https://darianrosebrook.com/blueprints/foundations/motion'
    );
    expect((metadata.openGraph as { type?: string })?.type).toBe('article');
  });

  it('renders the education template header and no placeholder', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Motion & Duration Foundations',
      })
    ).toBeTruthy();
    expect(screen.queryByText(/coming soon/i)).toBeNull();
  });

  it('mounts every template section anchor', () => {
    renderPage();
    const requiredAnchors = [
      'why-matters',
      'core-concepts',
      'system-roles',
      'design-code-interplay',
      'applied-example',
      'constraints-tradeoffs',
      'verification-checklist',
      'cross-references',
      'assessment-prompt',
    ];
    for (const id of requiredAnchors) {
      const el = document.getElementById(id);
      expect(el, `missing section anchor #${id}`).toBeTruthy();
    }
  });

  it('cites real motion token names and values from the pipeline', () => {
    renderPage();
    const text = document.body.textContent ?? '';
    const requiredTokens = [
      // Core DTCG paths
      'motion.duration.medium1',
      'motion.easing.standard',
      // Real values from core/motion.tokens.json
      'cubic-bezier(0.4, 0, 0.2, 1)',
      '17ms',
      // Emitted CSS custom property
      '--core-motion-duration-extra-long1',
      // Semantic interaction composites
      'motion.interaction',
    ];
    for (const token of requiredTokens) {
      expect(text, `page must cite ${token}`).toContain(token);
    }
  });

  it('teaches the reduced-motion mechanisms this repo ships', () => {
    renderPage();
    const text = document.body.textContent ?? '';
    expect(text).toContain('prefers-reduced-motion');
    expect(text).toContain('ReducedMotionContext');
    expect(text).toContain('reduce-motion');
  });

  it('renders distinct Design and Code tab content', () => {
    renderPage();
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels.length).toBeGreaterThanOrEqual(2);
    const panelText = panels.map((p) => p.textContent ?? '');
    expect(panelText[0]).not.toBe(panelText[1]);
  });

  it('renders checklist, assessments, and cross-references', () => {
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes.length).toBeGreaterThanOrEqual(5);
    const disabled = checkboxes.filter((cb) => cb.disabled);
    expect(disabled.length).toBe(3);
    expect(disabled.every((cb) => cb.defaultChecked)).toBe(true);

    const crossRefSection = document.getElementById('cross-references');
    expect(crossRefSection).toBeTruthy();
    const links = Array.from(
      crossRefSection?.querySelectorAll('a[href]') ?? []
    ).map((a) => a.getAttribute('href') ?? '');
    expect(
      links.some((href) => href.includes('/blueprints/foundations/tokens'))
    ).toBe(true);

    const assessmentSection = document.getElementById('assessment-prompt');
    const assessmentText = assessmentSection?.textContent ?? '';
    expect((assessmentText.match(/\?/g) ?? []).length).toBeGreaterThanOrEqual(
      2
    );
  });

  it('links prerequisites and next units to foundation routes', () => {
    renderPage();
    const prereqNav = screen
      .queryAllByRole('navigation', { name: 'Prerequisites' })
      .pop();
    const nextNav = screen
      .queryAllByRole('navigation', { name: 'Next steps' })
      .pop();
    expect(prereqNav?.querySelector('a')?.getAttribute('href')).toBe(
      '/blueprints/foundations/tokens'
    );
    expect(nextNav?.querySelectorAll('a').length).toBeGreaterThanOrEqual(1);
  });
});

/**
 * The app mounts ReducedMotionProvider in the root layout; the template's
 * useReducedMotion() hook requires it, so tests wrap the page the same way.
 */
function renderPage() {
  return render(
    <ReducedMotionProvider>
      <MotionPage />
    </ReducedMotionProvider>
  );
}
