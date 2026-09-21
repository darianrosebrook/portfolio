import type { SupabaseClient } from '@supabase/supabase-js';

export type ContentKind = 'articles' | 'case-studies';
export type LibraryStatus =
  'all' | 'draft' | 'published' | 'changes' | 'archived';
export type LibrarySort = 'recent' | 'title';
export type LibrarySearchParams = Record<string, string | string[] | undefined>;
export interface LibraryFilters {
  status: LibraryStatus;
  q: string;
  sort: LibrarySort;
}

export interface ContentLibraryRow {
  id: number;
  slug: string | null;
  headline: string | null;
  description?: string | null;
  status: string | null;
  modified_at: string | null;
  created_at?: string | null;
  published_at?: string | null;
  wordCount?: number | null;
  is_dirty?: boolean | null;
  workingheadline?: string | null;
  workingdescription?: string | null;
  working_modified_at?: string | null;
  image?: string | null;
  articleSection?: string | null;
}

export interface LibraryItem extends ContentLibraryRow {
  slug: string;
  kind: ContentKind;
  editHref: string;
  hasUnpublishedChanges: boolean;
}

export type LibraryResult =
  { ok: true; items: LibraryItem[]; invalidCount: number } | { ok: false };

export type LibraryCounts = Record<LibraryStatus, number>;

// Author-only metadata. Bodies are intentionally excluded from library reads.
const LIBRARY_SELECT =
  'id, slug, headline, description, status, modified_at, created_at, published_at, wordCount, is_dirty, workingheadline, workingdescription, working_modified_at, image, articleSection' as const;

function validDate(value: string | null | undefined): string | null {
  return value && Number.isFinite(Date.parse(value)) ? value : null;
}

export function projectLibraryItem(
  row: ContentLibraryRow,
  kind: ContentKind
): LibraryItem {
  const dirty = row.is_dirty === true;
  const publishedDate =
    validDate(row.modified_at) ??
    validDate(row.created_at) ??
    validDate(row.published_at);
  const workingDate = dirty ? validDate(row.working_modified_at) : null;
  const modified_at =
    workingDate &&
    (!publishedDate || Date.parse(workingDate) > Date.parse(publishedDate))
      ? workingDate
      : publishedDate;
  const slug = row.slug ?? '';
  return {
    ...row,
    slug,
    kind,
    headline: dirty ? (row.workingheadline ?? row.headline) : row.headline,
    description: dirty
      ? (row.workingdescription ?? row.description)
      : row.description,
    modified_at,
    // There is no working word-count column; don't label a draft with the published count.
    wordCount: dirty ? null : row.wordCount,
    hasUnpublishedChanges: row.status === 'published' && dirty,
    editHref: `/dashboard/${kind}/${encodeURIComponent(slug)}`,
  };
}

export function parseLibraryFilters(
  params: LibrarySearchParams
): LibraryFilters {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const requestedStatus = first(params.status);
  const status = ['draft', 'published', 'changes', 'archived'].includes(
    requestedStatus ?? ''
  )
    ? (requestedStatus as LibraryStatus)
    : 'all';
  return {
    status,
    q: (first(params.q) ?? '').trim(),
    sort: first(params.sort) === 'title' ? 'title' : 'recent',
  };
}

export function countLibrary(items: LibraryItem[]): LibraryCounts {
  return {
    all: items.length,
    draft: items.filter((item) => item.status === 'draft').length,
    published: items.filter((item) => item.status === 'published').length,
    changes: items.filter((item) => item.hasUnpublishedChanges).length,
    archived: items.filter((item) => item.status === 'archived').length,
  };
}

export function filterLibrary(
  items: LibraryItem[],
  filters: Partial<LibraryFilters>
): LibraryItem[] {
  const query = filters.q?.trim().toLocaleLowerCase('en-US') ?? '';
  return items
    .filter((item) => {
      const matchesStatus =
        !filters.status ||
        filters.status === 'all' ||
        (filters.status === 'changes'
          ? item.hasUnpublishedChanges
          : item.status === filters.status);
      const matchesQuery =
        !query ||
        [item.headline, item.description, item.slug].some((value) =>
          value?.toLocaleLowerCase('en-US').includes(query)
        );
      return matchesStatus && matchesQuery;
    })
    .sort((a, b) => {
      const difference =
        filters.sort === 'title'
          ? (a.headline || a.slug).localeCompare(b.headline || b.slug, 'en-US')
          : (b.modified_at ? Date.parse(b.modified_at) : 0) -
            (a.modified_at ? Date.parse(a.modified_at) : 0);
      return difference || a.kind.localeCompare(b.kind) || a.id - b.id;
    });
}

/** Fetch all metadata pages so the database row limit cannot silently truncate counts. */
export async function loadAuthorLibrary(
  supabase: SupabaseClient,
  author: string,
  kind: ContentKind
): Promise<LibraryResult> {
  const rows: ContentLibraryRow[] = [];
  const pageSize = 500;
  try {
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase
        .from(kind === 'articles' ? 'articles' : 'case_studies')
        .select(LIBRARY_SELECT)
        .eq('author', author)
        .order('id', { ascending: true })
        .range(offset, offset + pageSize - 1);
      if (error || !data) return { ok: false };
      rows.push(...data);
      if (data.length < pageSize) break;
    }
  } catch {
    return { ok: false };
  }
  const usableRows = rows.filter((row) => row.slug?.trim());
  return {
    ok: true,
    items: usableRows.map((row) => projectLibraryItem(row, kind)),
    invalidCount: rows.length - usableRows.length,
  };
}

export function formatLibraryDate(date: string | null): string {
  return date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'Date unavailable';
}
