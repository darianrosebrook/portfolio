import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import ComponentStandardsLayout from '@/app/blueprints/component-standards/layout';

/**
 * Render-level contract for the component-standards section layout:
 * the layout must render breadcrumb navigation derived from the current
 * pathname (base link to the section, current segment marked as the
 * current page) while still rendering its children. PageTransition
 * wrappers are intentionally absent from this section.
 */

vi.mock('next/navigation', () => ({
  usePathname: () => '/blueprints/component-standards/button',
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
    <ComponentStandardsLayout>
      <span>page body</span>
    </ComponentStandardsLayout>
  );
}

describe('component-standards section layout', () => {
  it('renders breadcrumb navigation for the section', () => {
    renderLayout();
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
  });

  it('links the section base crumb to the section root', () => {
    renderLayout();
    const baseLink = screen.getByRole('link', { name: 'Component Standards' });
    expect(baseLink).toHaveAttribute('href', '/blueprints/component-standards');
  });

  it('labels and marks the current segment as the current page', () => {
    renderLayout();
    // 'button' resolves through the layout labelMap to 'Button'
    const current = screen.getByText('Button').closest('[aria-current="page"]');
    expect(current).toBeInTheDocument();
  });

  it('still renders children inside the content section', () => {
    renderLayout();
    expect(screen.getByText('page body')).toBeInTheDocument();
  });
});
