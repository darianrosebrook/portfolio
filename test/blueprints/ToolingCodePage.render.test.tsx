import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '@/context/ReducedMotionContext';
import ToolingCodePage, {
  metadata,
} from '@/app/blueprints/foundations/tooling/code/page';

/**
 * Render-level contract for the Code Tooling page: template sections
 * present, real pipeline citations (the build chain, the validate
 * chain, the two layer lints, jsx-a11y error rules, the honest
 * Style Dictionary comparison), distinct interplay tabs, no
 * placeholder.
 */

function renderPage() {
  return render(
    <ReducedMotionProvider>
      <ToolingCodePage />
    </ReducedMotionProvider>
  );
}

describe('Code Tooling page', () => {
  it('exports SEO metadata derived from the page content block', () => {
    expect(metadata.title).toBe('Code Tooling | Darian Rosebrook');
    expect(metadata.openGraph?.url).toBe(
      'https://darianrosebrook.com/blueprints/foundations/tooling/code'
    );
  });

  it('renders the education template header and no placeholder', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Code Tooling' })
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

  it('cites the real pipeline commands and checks', () => {
    renderPage();
    const text = document.body.textContent ?? '';
    for (const s of [
      'tokens:build',
      'runners/build.ts',
      'generateCSSTokens.mjs',
      'check-token-references',
      'jsx-a11y/alt-text',
      'Style Dictionary',
      'contracts:traceability',
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
      links.some((href) => href.includes('/blueprints/foundations/tokens'))
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
      '/blueprints/foundations/tokens'
    );
    expect(nextNav?.querySelectorAll('a').length).toBeGreaterThanOrEqual(1);
  });
});
