import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import FoundationsLayout from '@/app/blueprints/foundations/layout';

/**
 * Render-level contract for the foundations section layout: breadcrumb
 * navigation renders inside the existing PageTransition wrappers — base
 * link to the section, slug segments resolved through the layout
 * labelMap, current segment marked as the current page.
 */

vi.mock('next/navigation', () => ({
  usePathname: () => '/blueprints/foundations/tokens',
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

function renderLayout() {
  return render(
    <FoundationsLayout>
      <span>page body</span>
    </FoundationsLayout>
  );
}

describe('foundations section layout', () => {
  it('renders breadcrumb navigation inside the section wrappers', () => {
    renderLayout();
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
  });

  it('links the section base crumb to the section root', () => {
    renderLayout();
    const baseLink = screen.getByRole('link', { name: 'Foundations' });
    expect(baseLink).toHaveAttribute('href', '/blueprints/foundations');
  });

  it('resolves slug labels through the layout labelMap', () => {
    renderLayout();
    // 'tokens' maps to 'Design Tokens' in the foundations labelMap
    const current = screen
      .getByText('Design Tokens')
      .closest('[aria-current="page"]');
    expect(current).toBeInTheDocument();
  });
});
