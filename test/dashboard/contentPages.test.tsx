import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from '@/app/dashboard/page';
import ArticlesPage from '@/app/dashboard/articles/page';
import CaseStudiesPage from '@/app/dashboard/case-studies/page';
import { DashboardNav } from '@/app/dashboard/_components/DashboardNav';
import type { ContentLibraryRow } from '@/utils/editor/contentLibrary';

const mocks = vi.hoisted(() => ({
  user: { id: 'current-author' } as { id: string } | null,
  authError: null as unknown,
  tables: {} as Record<string, { data: unknown[] | null; error: unknown }>,
  scopes: [] as Array<[string, string, string]>,
  selections: [] as string[],
  pathname: '/dashboard',
  from: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: mocks.user },
        error: mocks.authError,
      }),
    },
    from: mocks.from,
  }),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const row = (
  overrides: Partial<ContentLibraryRow> = {}
): ContentLibraryRow => ({
  id: 1,
  slug: 'article-one',
  headline: 'Old title',
  description: 'Old description',
  status: 'published',
  modified_at: '2026-01-01T10:00:00Z',
  is_dirty: false,
  ...overrides,
});

beforeEach(() => {
  mocks.user = { id: 'current-author' };
  mocks.authError = null;
  mocks.tables = {
    articles: { data: [], error: null },
    case_studies: { data: [], error: null },
  };
  mocks.scopes = [];
  mocks.selections = [];
  mocks.pathname = '/dashboard';
  mocks.from.mockReset();
  mocks.from.mockImplementation((table: string) => ({
    select: (columns: string) => {
      mocks.selections.push(columns);
      return {
        eq: (column: string, author: string) => {
          mocks.scopes.push([table, column, author]);
          return { order: () => ({ range: async () => mocks.tables[table] }) };
        },
      };
    },
  }));
});
afterEach(cleanup);

describe('dashboard server content pages with a mocked database boundary', () => {
  it('renders effective article metadata and recent order from the author-scoped query', async () => {
    mocks.tables.articles.data = [
      row({
        id: 1,
        slug: 'older',
        headline: 'Other article',
        modified_at: '2026-03-01T10:00:00Z',
      }),
      row({
        id: 2,
        slug: 'saved-draft',
        headline: 'Old title',
        is_dirty: true,
        workingheadline: 'Revised title',
        workingdescription: 'Revised description',
        working_modified_at: '2026-08-01T10:00:00Z',
      }),
    ];
    render(await ArticlesPage({ searchParams: Promise.resolve({}) }));
    const cards = screen.getAllByRole('article');
    expect(
      within(cards[0]).getByRole('heading', { name: 'Revised title' })
    ).toBeInTheDocument();
    expect(
      within(cards[0]).getByText('Revised description')
    ).toBeInTheDocument();
    expect(within(cards[0]).getByText('Aug 1, 2026')).toBeInTheDocument();
    expect(
      within(cards[1]).getByRole('heading', { name: 'Other article' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Old title')).not.toBeInTheDocument();
    expect(mocks.scopes).toEqual([['articles', 'author', 'current-author']]);
    expect(mocks.selections[0]).toContain('workingheadline');
    expect(mocks.selections[0]).toContain('workingdescription');
  });

  it('searches saved draft metadata and keeps empty search results distinct from an empty library', async () => {
    mocks.tables.articles.data = [
      row({ is_dirty: true, workingheadline: 'Draft needle' }),
    ];
    render(
      await ArticlesPage({ searchParams: Promise.resolve({ q: 'missing' }) })
    );
    expect(
      screen.getByText('No articles match these filters.')
    ).toBeInTheDocument();
    expect(screen.queryByText('No articles yet')).not.toBeInTheDocument();
    cleanup();
    render(
      await ArticlesPage({ searchParams: Promise.resolve({ q: 'needle' }) })
    );
    expect(
      screen.getByRole('heading', { name: 'Draft needle' })
    ).toBeInTheDocument();
  });

  it('shows a retry instead of empty article counts when the query fails', async () => {
    mocks.tables.articles = {
      data: null,
      error: { message: 'Internal details' },
    };
    render(await ArticlesPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your articles could not be loaded.'
    );
    expect(
      screen
        .getByRole('button', { name: 'Retry loading articles' })
        .closest('form')
    ).toHaveAttribute('action', '/dashboard/articles');
    expect(
      screen.queryByRole('form', { name: 'Filter content' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('No articles yet')).not.toBeInTheDocument();
    expect(screen.queryByText('Internal details')).not.toBeInTheDocument();
  });

  it('shows a retry instead of empty case-study counts when the query fails', async () => {
    mocks.tables.case_studies = {
      data: null,
      error: { message: 'Internal details' },
    };
    render(await CaseStudiesPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your case studies could not be loaded.'
    );
    expect(
      screen
        .getByRole('button', { name: 'Retry loading case studies' })
        .closest('form')
    ).toHaveAttribute('action', '/dashboard/case-studies');
    expect(
      screen.queryByRole('form', { name: 'Filter content' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/No case studies yet/)).not.toBeInTheDocument();
  });

  it('filters case studies using working metadata and retains unpublished status', async () => {
    mocks.tables.case_studies.data = [
      row({
        id: 1,
        slug: 'work',
        is_dirty: true,
        workingheadline: 'Current case study',
        working_modified_at: '2026-08-01T10:00:00Z',
      }),
      row({ id: 2, slug: 'another', headline: 'Other case study' }),
    ];
    render(
      await CaseStudiesPage({
        searchParams: Promise.resolve({ q: 'current', status: 'changes' }),
      })
    );
    expect(
      screen.getByRole('heading', { name: 'Current case study' })
    ).toBeInTheDocument();
    expect(screen.getByText('Unpublished changes')).toBeInTheDocument();
    expect(screen.getByText('Edited Aug 1, 2026')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Other case study' })
    ).not.toBeInTheDocument();
    expect(mocks.scopes).toEqual([
      ['case_studies', 'author', 'current-author'],
    ]);
  });

  it('shows per-library counts and resume links across drafts and dirty published content', async () => {
    mocks.tables.articles.data = [
      row({ id: 1, headline: 'Saved article draft', status: 'draft' }),
      row({ id: 2, headline: 'Clean published article' }),
      row({
        id: 3,
        slug: 'revision',
        headline: 'Published heading',
        is_dirty: true,
        workingheadline: 'Latest article revision',
        working_modified_at: '2026-08-01T10:00:00Z',
      }),
    ];
    mocks.tables.case_studies.data = [
      row({
        id: 1,
        slug: 'case-one',
        headline: 'Case study draft',
        status: 'draft',
        modified_at: '2026-06-01T10:00:00Z',
      }),
    ];
    render(await DashboardPage());
    const articles = within(screen.getByRole('region', { name: 'Articles' }));
    expect(
      articles.getByRole('link', { name: /^1\s*Drafts$/ })
    ).toHaveAttribute('href', '/dashboard/articles?status=draft');
    expect(
      articles.getByRole('link', { name: /^1\s*Unpublished changes$/ })
    ).toHaveAttribute('href', '/dashboard/articles?status=changes');
    expect(
      articles.getByRole('link', { name: /^2\s*Published$/ })
    ).toHaveAttribute('href', '/dashboard/articles?status=published');
    const resume = within(
      screen.getByRole('region', { name: 'Continue writing' })
    );
    expect(
      resume
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)
    ).toEqual([
      'Latest article revision',
      'Case study draft',
      'Saved article draft',
    ]);
    expect(
      resume.getByRole('link', {
        name: 'Continue writing Latest article revision',
      })
    ).toHaveAttribute('href', '/dashboard/articles/revision');
    expect(
      resume.getByRole('link', { name: 'Continue writing Case study draft' })
    ).toHaveAttribute('href', '/dashboard/case-studies/case-one');
    expect(
      resume.queryByText('Clean published article')
    ).not.toBeInTheDocument();
    expect(mocks.scopes).toEqual([
      ['articles', 'author', 'current-author'],
      ['case_studies', 'author', 'current-author'],
    ]);
  });

  it('labels partial dashboard data and does not invent zero counts for the failed library', async () => {
    mocks.tables.articles = { data: null, error: { message: 'failed' } };
    mocks.tables.case_studies.data = [
      row({ headline: 'Available draft', status: 'draft' }),
    ];
    render(await DashboardPage());
    const articles = within(screen.getByRole('region', { name: 'Articles' }));
    expect(articles.getByRole('alert')).toHaveTextContent(
      'Articles could not be loaded.'
    );
    expect(articles.queryByText('Drafts')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Some content could not be loaded.'
    );
    expect(
      screen.getByRole('heading', { name: 'Available draft' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/No drafts or unpublished changes/)
    ).not.toBeInTheDocument();
  });

  it('reports invalid slugs without emitting broken links or counting them as editable', async () => {
    mocks.tables.articles.data = [row({ slug: ' ' })];
    render(await ArticlesPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      '1 article(s) need a valid slug'
    );
    expect(screen.getByText('0 of 0 articles')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('does not query content without a verified authenticated user', async () => {
    mocks.user = null;
    expect(await DashboardPage()).toBeNull();
    expect(
      await ArticlesPage({ searchParams: Promise.resolve({}) })
    ).toBeNull();
    expect(
      await CaseStudiesPage({ searchParams: Promise.resolve({}) })
    ).toBeNull();
    mocks.user = { id: 'current-author' };
    mocks.authError = new Error('unverified');
    expect(await DashboardPage()).toBeNull();
    expect(mocks.from).not.toHaveBeenCalled();
  });
});

describe('dashboard navigation', () => {
  it('links to the overview and content libraries without analytics or performance placeholders', () => {
    mocks.pathname = '/dashboard/articles/new';
    render(<DashboardNav />);
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(screen.getByRole('link', { name: 'Articles' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
      'aria-current'
    );
    expect(
      screen.queryByRole('link', { name: 'Analytics' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Performance' })
    ).not.toBeInTheDocument();
  });
});
