import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '@/context/ReducedMotionContext';
import ColorPage, { metadata } from '@/app/blueprints/foundations/color/page';

/**
 * Render-level contract for the Color Foundations page.
 *
 * Falsifiable claims, one per block below:
 * - The page exports template-derived SEO metadata for its canonical URL.
 * - It renders through the shared education template (h1 from metadata) and
 *   leaves no "coming soon" placeholder behind.
 * - Every education section anchor is present in the DOM.
 * - The prose cites real token names from ui/designTokens (core DTCG paths,
 *   emitted CSS custom properties, and the generated cascade-layer order).
 * - Contrast teaching uses the WCAG relative-luminance thresholds the repo's
 *   own validator enforces (AA 4.5:1 / AAA 7:1) plus computed pair ratios.
 * - The design/code interplay section renders distinct content per tab.
 * - Checklist, assessment prompts, and cross-reference data all render.
 */

/**
 * The app mounts ReducedMotionProvider in the root layout; the template's
 * useReducedMotion() hook requires it, so tests wrap the page the same way.
 */
const renderPage = () =>
  render(
    <ReducedMotionProvider>
      <ColorPage />
    </ReducedMotionProvider>
  );

describe('Color Foundations page', () => {
  it('exports SEO metadata derived from the page content block', () => {
    expect(metadata.title).toBe('Color Foundations | Darian Rosebrook');
    expect(metadata.openGraph?.url).toBe(
      'https://darianrosebrook.com/blueprints/foundations/color'
    );
    expect((metadata.openGraph as { type?: string })?.type).toBe('article');
  });

  it('renders the education template header and no placeholder', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Color Foundations' })
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

  it('cites real token names from the design-token pipeline', () => {
    renderPage();
    const text = document.body.textContent ?? '';
    const requiredTokens = [
      // Core DTCG path (source JSON)
      'color.palette.blue.600',
      // Brand ramp reference used by semantic action tokens
      'brand.primary.500',
      // Emitted CSS custom properties
      '--semantic-color-foreground-primary',
      '--core-color-palette-brand-primary-500',
      // Generated cascade-layer order from app/designTokens.scss
      '@layer core, semantic, theme, brand, density',
      // Ramp derivation: generator + contrast anchors
      'Adaptive-DS-Colors',
      '1.15:1',
    ];
    for (const token of requiredTokens) {
      expect(text, `page must cite ${token}`).toContain(token);
    }
  });

  it('teaches the WCAG thresholds the repo validator enforces', () => {
    renderPage();
    const text = document.body.textContent ?? '';
    // WCAG_LEVELS in utils/accessibility/tokenValidator.ts
    expect(text).toContain('4.5:1');
    expect(text).toContain('WCAG');
    // A computed ratio for foreground.primary on background.primary (light)
    expect(text).toContain('18.4:1');
  });

  it('renders distinct Design and Code tab content', () => {
    renderPage();
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels.length).toBeGreaterThanOrEqual(2);
    const panelText = panels.map((p) => p.textContent ?? '');
    // The design side names design-tool concepts; the code side shows the
    // emitted token source. Shared boilerplate must not make them identical.
    expect(panelText[0]).not.toBe(panelText[1]);
  });

  it('renders checklist, assessments, and cross-references', () => {
    renderPage();
    // Verification checklist renders as checkboxes; required items are
    // disabled and pre-checked, optional items stay interactive
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes.length).toBeGreaterThanOrEqual(5);
    const disabled = checkboxes.filter((cb) => cb.disabled);
    expect(disabled.length).toBe(3);
    expect(disabled.every((cb) => cb.defaultChecked)).toBe(true);

    // Cross-reference cards link to real foundation slugs
    const crossRefSection = document.getElementById('cross-references');
    expect(crossRefSection).toBeTruthy();
    const links = Array.from(
      crossRefSection?.querySelectorAll('a[href]') ?? []
    ).map((a) => a.getAttribute('href') ?? '');
    expect(
      links.some((href) => href.includes('/blueprints/foundations/tokens'))
    ).toBe(true);

    // Assessment prompts render as questions
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
