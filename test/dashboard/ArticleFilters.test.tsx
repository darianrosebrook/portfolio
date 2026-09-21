import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ArticleFilters } from '@/app/dashboard/articles/_components/ArticleFilters';

afterEach(cleanup);
const counts = { all: 7, draft: 2, published: 4, changes: 1, archived: 1 };

describe('content filters', () => {
  it('submits search, status, and sorting together through a bookmarkable GET form', () => {
    render(
      <ArticleFilters
        counts={counts}
        filters={{ q: 'design', status: 'draft', sort: 'title' }}
      />
    );
    const form = screen.getByRole('form', {
      name: 'Filter content',
    }) as HTMLFormElement;
    expect(form).toHaveAttribute('action', '/dashboard/articles');
    expect(form).toHaveAttribute('method', 'get');
    // The form still carries every active filter: search inline, status and
    // sort as hidden fields so submitting the search does not drop them.
    expect(Object.fromEntries(new FormData(form))).toEqual({
      q: 'design',
      status: 'draft',
      sort: 'title',
    });
    // Status is a link, not a select: it navigates with the other filters kept.
    const publishedChip = screen.getByRole('link', {
      name: 'Published 4',
    });
    expect(publishedChip).toHaveAttribute(
      'href',
      '/dashboard/articles?q=design&status=published&sort=title'
    );
    expect(screen.getByRole('link', { name: 'Drafts 2' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    // No standalone apply control: the search field submits.
    expect(
      screen.queryByRole('button', { name: /apply filters/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute(
      'type',
      'submit'
    );
    expect(screen.getByRole('link', { name: 'Clear filters' })).toHaveAttribute(
      'href',
      '/dashboard/articles'
    );
  });

  it('uses the case-study route and resets values when URL filter props change', () => {
    const { rerender } = render(
      <ArticleFilters
        basePath="/dashboard/case-studies"
        counts={counts}
        filters={{ q: 'old', status: 'draft', sort: 'title' }}
      />
    );
    rerender(
      <ArticleFilters
        basePath="/dashboard/case-studies"
        counts={counts}
        filters={{ q: '', status: 'all', sort: 'recent' }}
      />
    );
    expect(screen.getByRole('form')).toHaveAttribute(
      'action',
      '/dashboard/case-studies'
    );
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
    // Reset state is visible in the controls that are now links.
    expect(screen.getByRole('link', { name: 'All 7' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(
      screen.getByRole('link', { name: 'Recently edited' })
    ).toHaveAttribute('aria-current', 'true');
    // With no active filter the case-study chip hrefs carry no stale params.
    expect(screen.getByRole('link', { name: 'Drafts 2' })).toHaveAttribute(
      'href',
      '/dashboard/case-studies?status=draft'
    );
    expect(
      screen.queryByRole('link', { name: 'Clear filters' })
    ).not.toBeInTheDocument();
  });
});
