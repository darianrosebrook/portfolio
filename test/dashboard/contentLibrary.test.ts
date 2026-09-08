import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  projectLibraryItem,
  filterLibrary,
  countLibrary,
  parseLibraryFilters,
  loadAuthorLibrary,
  formatLibraryDate,
  type ContentLibraryRow,
} from '@/utils/editor/contentLibrary';

const row = (
  overrides: Partial<ContentLibraryRow> = {}
): ContentLibraryRow => ({
  id: 1,
  slug: 'canonical-slug',
  headline: 'Published title',
  description: 'Published description',
  status: 'published',
  modified_at: '2026-01-01T10:00:00Z',
  is_dirty: false,
  ...overrides,
});

function database(pages: unknown[]) {
  const range = vi.fn<(start: number, end: number) => Promise<unknown>>();
  for (const page of pages) range.mockResolvedValueOnce(page);
  const order = vi.fn(() => ({ range }));
  const eq = vi.fn<(column: string, value: string) => { order: typeof order }>(
    () => ({ order })
  );
  const select = vi.fn<(columns: string) => { eq: typeof eq }>(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return {
    client: { from } as unknown as SupabaseClient,
    from,
    select,
    eq,
    order,
    range,
  };
}

describe('author content library', () => {
  it('shows a dirty working title and description with its recent edit date', () => {
    const item = projectLibraryItem(
      row({
        is_dirty: true,
        workingheadline: 'New working title',
        workingdescription: '',
        working_modified_at: '2026-08-01T10:00:00Z',
        wordCount: 400,
      }),
      'articles'
    );
    expect(item).toMatchObject({
      headline: 'New working title',
      description: '',
      modified_at: '2026-08-01T10:00:00Z',
      wordCount: null,
      hasUnpublishedChanges: true,
      editHref: '/dashboard/articles/canonical-slug',
    });
  });

  it('ignores stale working columns once the dirty flag has cleared', () => {
    expect(
      projectLibraryItem(
        row({
          workingheadline: 'Discarded title',
          workingdescription: 'Discarded description',
          working_modified_at: '2027-01-01T10:00:00Z',
          wordCount: 400,
        }),
        'articles'
      )
    ).toMatchObject({
      headline: 'Published title',
      description: 'Published description',
      modified_at: '2026-01-01T10:00:00Z',
      wordCount: 400,
      hasUnpublishedChanges: false,
    });
  });

  it('falls back for null draft fields but preserves intentionally empty text', () => {
    expect(
      projectLibraryItem(
        row({
          is_dirty: true,
          workingheadline: null,
          workingdescription: null,
          working_modified_at: 'invalid',
        }),
        'case-studies'
      )
    ).toMatchObject({
      headline: 'Published title',
      description: 'Published description',
      modified_at: '2026-01-01T10:00:00Z',
      editHref: '/dashboard/case-studies/canonical-slug',
    });
    expect(
      projectLibraryItem(
        row({ is_dirty: true, workingheadline: '' }),
        'articles'
      ).headline
    ).toBe('');
  });

  it('uses the most recent valid edit date and does not format corrupt timestamps', () => {
    expect(
      projectLibraryItem(
        row({ is_dirty: true, working_modified_at: '2025-01-01T10:00:00Z' }),
        'articles'
      ).modified_at
    ).toBe('2026-01-01T10:00:00Z');
    expect(
      projectLibraryItem(row({ modified_at: 'invalid' }), 'articles')
        .modified_at
    ).toBeNull();
    expect(
      projectLibraryItem(
        row({
          modified_at: null,
          is_dirty: true,
          working_modified_at: '2026-08-01T10:00:00Z',
        }),
        'articles'
      ).modified_at
    ).toBe('2026-08-01T10:00:00Z');
    expect(formatLibraryDate(null)).toBe('Date unavailable');
    expect(formatLibraryDate('2026-08-01T00:30:00Z')).toBe('Aug 1, 2026');
  });

  it('loads creation dates and ranks never-modified drafts by when they were created', async () => {
    const db = database([
      {
        data: [
          row({
            id: 1,
            status: 'draft',
            modified_at: null,
            created_at: '2026-08-13T07:44:27Z',
          }),
          row({
            id: 2,
            status: 'draft',
            modified_at: 'invalid',
            created_at: '2026-08-14T07:44:27Z',
          }),
        ],
        error: null,
      },
    ]);
    const result = await loadAuthorLibrary(db.client, 'creator', 'articles');
    expect(
      db.select.mock.calls[0][0].split(',').map((column) => column.trim())
    ).toContain('created_at');
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Library did not load');
    expect(
      filterLibrary(result.items, { status: 'draft', sort: 'recent' }).map(
        (item) => [item.id, formatLibraryDate(item.modified_at)]
      )
    ).toEqual([
      [2, 'Aug 14, 2026'],
      [1, 'Aug 13, 2026'],
    ]);
  });

  it('keeps draft and published-with-changes counts distinct and includes archived content', () => {
    const items = [
      row({ id: 1, status: 'draft', is_dirty: true }),
      row({ id: 2, status: 'published', is_dirty: true }),
      row({ id: 3, status: 'published' }),
      row({ id: 4, status: 'archived', is_dirty: true }),
    ].map((item) => projectLibraryItem(item, 'articles'));
    expect(countLibrary(items)).toEqual({
      all: 4,
      draft: 1,
      published: 2,
      changes: 1,
      archived: 1,
    });
    expect(
      filterLibrary(items, { status: 'changes' }).map((item) => item.id)
    ).toEqual([2]);
    expect(
      filterLibrary(items, { status: 'archived' }).map((item) => item.id)
    ).toEqual([4]);
    expect(
      filterLibrary(items, { status: 'draft' }).map((item) => item.id)
    ).toEqual([1]);
    expect(
      filterLibrary(items, { status: 'published' }).map((item) => item.id)
    ).toEqual([2, 3]);
  });

  it('searches effective metadata and slug without mutating input order', () => {
    const items = [
      row({ id: 1, headline: 'Zebra', slug: 'first', modified_at: null }),
      row({
        id: 2,
        headline: 'Old',
        slug: 'second',
        is_dirty: true,
        workingheadline: 'Alpha',
        workingdescription: 'Needle',
        working_modified_at: '2026-08-01T10:00:00Z',
      }),
    ].map((item) => projectLibraryItem(item, 'articles'));
    expect(
      filterLibrary(items, { q: '  ALPHA  ' }).map((item) => item.id)
    ).toEqual([2]);
    expect(
      filterLibrary(items, { q: 'needle' }).map((item) => item.id)
    ).toEqual([2]);
    expect(filterLibrary(items, { q: 'first' }).map((item) => item.id)).toEqual(
      [1]
    );
    expect(filterLibrary(items, { q: 'old' })).toEqual([]);
    expect(filterLibrary(items, { q: 'missing' })).toEqual([]);
    expect(filterLibrary(items, {}).map((item) => item.id)).toEqual([2, 1]);
    expect(
      filterLibrary(items, { sort: 'title' }).map((item) => item.id)
    ).toEqual([2, 1]);
    expect(filterLibrary(items, { q: 'Alpha', status: 'draft' })).toEqual([]);
    expect(items.map((item) => item.id)).toEqual([1, 2]);
  });

  it('uses stable tie breaks for equal timestamps and titles across both libraries', () => {
    const items = [
      projectLibraryItem(row({ id: 2, headline: 'Same' }), 'articles'),
      projectLibraryItem(row({ id: 1, headline: 'Same' }), 'case-studies'),
      projectLibraryItem(row({ id: 1, headline: 'Same' }), 'articles'),
    ];
    for (const sort of ['recent', 'title'] as const) {
      expect(
        filterLibrary(items, { sort }).map((item) => `${item.kind}:${item.id}`)
      ).toEqual(['articles:1', 'articles:2', 'case-studies:1']);
    }
  });

  it('normalizes malformed filters instead of rendering an invalid empty state', () => {
    expect(
      parseLibraryFilters({
        status: 'nope',
        sort: 'nope',
        q: ['first', 'second'],
      })
    ).toEqual({ status: 'all', sort: 'recent', q: 'first' });
    expect(
      parseLibraryFilters({ status: ['draft'], sort: 'title', q: ' text ' })
    ).toEqual({ status: 'draft', sort: 'title', q: 'text' });
    expect(parseLibraryFilters({})).toEqual({
      status: 'all',
      sort: 'recent',
      q: '',
    });
  });

  it('scopes every metadata page to the author and reports unusable slugs separately', async () => {
    const db = database([
      {
        data: Array.from({ length: 500 }, (_, id) => row({ id })),
        error: null,
      },
      { data: [row({ id: 501, slug: ' ' })], error: null },
    ]);
    const result = await loadAuthorLibrary(db.client, 'author-1', 'articles');
    expect(result.ok).toBe(true);
    expect(result).toMatchObject({ invalidCount: 1 });
    if (!result.ok) throw new Error('Expected available library');
    expect(result.items).toHaveLength(500);
    expect(db.eq.mock.calls).toEqual([
      ['author', 'author-1'],
      ['author', 'author-1'],
    ]);
    expect(db.range.mock.calls).toEqual([
      [0, 499],
      [500, 999],
    ]);
    expect(db.select.mock.calls[0][0]).toContain('workingheadline');
    expect(db.select.mock.calls[0][0]).toContain('working_modified_at');
    expect(db.select.mock.calls[0][0]).not.toContain('articleBody');
  });

  it('does not treat failed, missing, or rejected query data as an empty library', async () => {
    const db = database([
      { data: null, error: { message: 'private failure' } },
      { data: null, error: null },
    ]);
    expect(
      await loadAuthorLibrary(db.client, 'author-1', 'case-studies')
    ).toEqual({ ok: false });
    expect(db.from).toHaveBeenCalledWith('case_studies');
    expect(await loadAuthorLibrary(db.client, 'author-1', 'articles')).toEqual({
      ok: false,
    });
    db.range.mockRejectedValueOnce(new Error('network down'));
    expect(await loadAuthorLibrary(db.client, 'author-1', 'articles')).toEqual({
      ok: false,
    });
  });

  it('discards partial pages after later failures and accepts a real empty library', async () => {
    const db = database([
      {
        data: Array.from({ length: 500 }, (_, id) => row({ id })),
        error: null,
      },
      { data: null, error: { code: 'failure' } },
    ]);
    expect(await loadAuthorLibrary(db.client, 'author-1', 'articles')).toEqual({
      ok: false,
    });
    expect(
      await loadAuthorLibrary(
        database([{ data: [], error: null }]).client,
        'author-1',
        'articles'
      )
    ).toEqual({ ok: true, items: [], invalidCount: 0 });
  });
});
