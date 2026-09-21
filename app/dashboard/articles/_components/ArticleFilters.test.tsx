import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { ArticleFilters } from './ArticleFilters';

/*
 * Chip-specific coverage. The form contract (GET submission, hidden status and
 * sort, the absent apply control, the case-study route and prop resets) is
 * covered by test/dashboard/ArticleFilters.test.tsx.
 */
const counts = { all: 13, draft: 8, changes: 2, published: 5, archived: 0 };
const filters = { status: 'all' as const, q: '', sort: 'recent' as const };

function chip(name: RegExp | string) {
  return within(
    screen.getByRole('navigation', { name: 'Filter by status' })
  ).getByRole('link', { name });
}

describe('ArticleFilters status chips', () => {
  it('renders a chip per status with its count', () => {
    render(<ArticleFilters counts={counts} filters={filters} />);
    for (const name of [
      /All 13/,
      /Drafts 8/,
      /Unpublished changes 2/,
      /Published 5/,
      /Archived 0/,
    ]) {
      expect(chip(name)).toBeInTheDocument();
    }
  });

  it('marks the active status as current', () => {
    render(
      <ArticleFilters
        counts={counts}
        filters={{ ...filters, status: 'draft' }}
      />
    );
    expect(chip(/Drafts 8/)).toHaveAttribute('aria-current', 'true');
    expect(chip(/All 13/)).not.toHaveAttribute('aria-current');
  });

  it('keeps the active search and sort when a status chip is followed', () => {
    render(
      <ArticleFilters
        counts={counts}
        filters={{ status: 'all', q: 'prime', sort: 'title' }}
      />
    );
    expect(chip(/Drafts 8/)).toHaveAttribute(
      'href',
      '/dashboard/articles?q=prime&status=draft&sort=title'
    );
  });

  it('omits default parameters from a chip link', () => {
    render(<ArticleFilters counts={counts} filters={filters} />);
    expect(chip(/All 13/)).toHaveAttribute('href', '/dashboard/articles');
  });
});
