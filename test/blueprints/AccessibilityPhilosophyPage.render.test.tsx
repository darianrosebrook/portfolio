import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '@/context/ReducedMotionContext';
import AccessibilityPhilosophyPage, {
  metadata,
} from '@/app/blueprints/foundations/accessibility/philosophy/page';

/**
 * Render-level contract for the Accessibility Philosophy & Practice
 * page: template sections present, the philosophy's load-bearing
 * claims (fairness constraints, curb-cut effects, constraint-as-
 * affordance, defaults over intentions, the deadline rewrite),
 * distinct interplay tabs, no placeholder.
 */

function renderPage() {
  return render(
    <ReducedMotionProvider>
      <AccessibilityPhilosophyPage />
    </ReducedMotionProvider>
  );
}

describe('Accessibility Philosophy & Practice page', () => {
  it('exports SEO metadata derived from the page content block', () => {
    expect(metadata.title).toBe(
      'Accessibility Philosophy & Practice | Darian Rosebrook'
    );
    expect(metadata.openGraph?.url).toBe(
      'https://darianrosebrook.com/blueprints/foundations/accessibility/philosophy'
    );
  });

  it('renders the education template header and no placeholder', () => {
    renderPage();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Accessibility Philosophy & Practice',
      })
    ).toBeTruthy();
    expect(screen.queryByText(/coming soon/i)).toBeNull();
  });

  it('mounts every template section anchor', () => {
    renderPage();
    for (const id of [
      'why-matters',
      'core-concepts',
      'system-roles',
      'design-code-interplay',
      'applied-example',
      'constraints-tradeoffs',
      'verification-checklist',
      'cross-references',
      'assessment-prompt',
    ]) {
      expect(document.getElementById(id), `missing #${id}`).toBeTruthy();
    }
  });

  it('teaches the philosophy with its key frames', () => {
    renderPage();
    const text = document.body.textContent ?? '';
    for (const s of [
      'curb-cut',
      'affordance',
      'defaults',
      'SC 2.1.1',
      'unencoded',
      'Constraint theater',
    ]) {
      expect(text, `must cite ${s}`).toContain(s);
    }
  });

  it('renders distinct Design and Code tab content', () => {
    renderPage();
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels.length).toBeGreaterThanOrEqual(2);
    expect(panels[0].textContent).not.toBe(panels[1].textContent);
  });

  it('renders checklist, assessments, and cross-references', () => {
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes.length).toBeGreaterThanOrEqual(4);
    expect(checkboxes.filter((cb) => cb.disabled).length).toBe(3);
    const links = Array.from(
      document
        .getElementById('cross-references')
        ?.querySelectorAll('a[href]') ?? []
    ).map((a) => a.getAttribute('href') ?? '');
    expect(
      links.some((href) => href.includes('/blueprints/foundations/philosophy'))
    ).toBe(true);
    expect(
      document.querySelectorAll('[class*="assessmentPrompt"]').length
    ).toBeGreaterThanOrEqual(2);
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
      '/blueprints/foundations/philosophy'
    );
    expect(nextNav?.querySelectorAll('a').length).toBeGreaterThanOrEqual(1);
  });
});
