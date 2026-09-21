import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusMatrix } from '@/app/blueprints/component-standards/_components/StatusMatrix';
import type { ComponentItem } from '@/app/blueprints/component-standards/_lib/componentsData';

/**
 * Render-level contract for the status matrix: every registry slug is
 * served by the [slug] route, so no "Docs" column may render — the old
 * column derived a docs-exist checkmark from fictional paths.docs data.
 */

const COMPONENTS: ComponentItem[] = [
  {
    component: 'Button',
    id: 'button',
    slug: 'button',
    layer: 'primitives',
    alternativeNames: [],
    normalizedAliases: ['button'],
    category: 'Actions',
    description: 'Triggers an action.',
    a11y: { pitfalls: [] },
    status: 'Built',
    paths: { component: 'ui/components/Button' },
  },
  {
    component: 'Card',
    id: 'card',
    slug: 'card',
    layer: 'compounds',
    alternativeNames: [],
    normalizedAliases: ['card'],
    category: 'Containers',
    description: 'Groups related content.',
    a11y: { pitfalls: [] },
    status: 'Planned',
  },
];

describe('StatusMatrix', () => {
  it('renders one row per component with link, category, layer, and status', () => {
    render(<StatusMatrix components={COMPONENTS} />);
    const link = screen.getByRole('link', { name: /button/i });
    expect(link).toHaveAttribute(
      'href',
      '/blueprints/component-standards/button'
    );
    const row = link.closest('tr');
    expect(row?.textContent).toContain('Actions');
    expect(row?.textContent).toContain('primitives');
    expect(row?.textContent).toContain('Built');
  });

  it('renders no Docs column', () => {
    render(<StatusMatrix components={COMPONENTS} />);
    expect(screen.queryByText('Docs')).toBeNull();
  });
});
