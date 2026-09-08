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
    expect(Object.fromEntries(new FormData(form))).toEqual({
      q: 'design',
      status: 'draft',
      sort: 'title',
    });
    expect(
      screen.getByRole('option', { name: 'Unpublished changes (1)' })
    ).toHaveValue('changes');
    expect(
      screen.getByRole('button', { name: 'Apply filters' })
    ).toHaveAttribute('type', 'submit');
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
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('all');
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue(
      'recent'
    );
    expect(
      screen.queryByRole('link', { name: 'Clear filters' })
    ).not.toBeInTheDocument();
  });
});
