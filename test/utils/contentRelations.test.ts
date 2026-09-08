import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  RELATIONSHIP_TYPES,
  RELATIONSHIP_META,
  DEFAULT_RELATIONSHIP_TYPE,
  contentHref,
  searchContent,
  getRelations,
  getBacklinks,
  syncRelations,
  cleanupOrphanedRelations,
  getContentRelationStats,
} from '@/utils/supabase/contentRelations';

/**
 * Minimal fluent mock of the supabase-js query builder. Each from(table)
 * call consumes the next scripted result for that table, so tests can model
 * sequential queries (e.g. delete-then-insert).
 */
interface QueryResult {
  data?: unknown;
  error?: { message: string; code?: string } | null;
}

function chainable(result: QueryResult) {
  const query = {} as Record<string, ReturnType<typeof vi.fn>> & {
    then: Promise<QueryResult>['then'];
  };
  for (const method of [
    'select',
    'eq',
    'or',
    'ilike',
    'in',
    'order',
    'limit',
    'delete',
    'insert',
    'single',
    'maybeSingle',
  ]) {
    query[method] = vi.fn(() => query);
  }
  query.then = (resolve, reject) =>
    Promise.resolve(result).then(resolve, reject);
  return query;
}

function makeSupabase(
  scripted: Record<string, QueryResult | QueryResult[]>
): SupabaseClient {
  const queues: Record<string, QueryResult[]> = {};
  for (const [table, value] of Object.entries(scripted)) {
    queues[table] = Array.isArray(value) ? value : [value];
  }
  const from = vi.fn((table: string) => {
    const queue = queues[table] ?? [];
    return chainable(queue.shift() ?? { data: null, error: null });
  });
  return { from } as unknown as SupabaseClient;
}

describe('contentRelations vocabulary and URLs', () => {
  it('defines display metadata for every relationship type', () => {
    for (const type of RELATIONSHIP_TYPES) {
      const meta = RELATIONSHIP_META[type];
      expect(meta.label).toBeTruthy();
      expect(meta.forwardVerb).toBeTruthy();
      expect(meta.reverseVerb).toBeTruthy();
    }
  });

  it('defaults to the "related" relationship type', () => {
    expect(DEFAULT_RELATIONSHIP_TYPE).toBe('related');
  });

  it('maps content types to their public URL spaces', () => {
    expect(contentHref('article', 'my-post')).toBe('/articles/my-post');
    expect(contentHref('case-study', 'my-study')).toBe('/work/my-study');
    expect(contentHref('article', null)).toBe('#');
  });
});

describe('searchContent', () => {
  it('returns nothing for queries shorter than two characters', async () => {
    const supabase = makeSupabase({});
    await expect(searchContent(supabase, 'a')).resolves.toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('merges both content types and filters drafts to their author', async () => {
    const supabase = makeSupabase({
      articles: {
        data: [
          {
            id: 1,
            headline: 'Published article',
            slug: 'published-article',
            description: null,
            status: 'published',
            author: 'someone-else',
          },
          {
            id: 2,
            headline: 'My draft',
            slug: 'my-draft',
            description: null,
            status: 'draft',
            author: 'me',
          },
          {
            id: 3,
            headline: 'Their draft',
            slug: 'their-draft',
            description: null,
            status: 'draft',
            author: 'someone-else',
          },
        ],
        error: null,
      },
      case_studies: {
        data: [
          {
            id: 10,
            headline: 'A case study',
            slug: 'a-case-study',
            description: 'desc',
            status: 'published',
            author: 'someone-else',
          },
        ],
        error: null,
      },
    });

    const results = await searchContent(supabase, 'design', { userId: 'me' });

    expect(results.map((r) => r.id)).toEqual([1, 2, 10]);
    expect(results[2]).toMatchObject({
      type: 'case-study',
      title: 'A case study',
      slug: 'a-case-study',
    });
  });

  it('excludes the item being edited', async () => {
    const supabase = makeSupabase({
      articles: {
        data: [
          {
            id: 7,
            headline: 'Self',
            slug: 'self',
            description: null,
            status: 'published',
            author: 'me',
          },
          {
            id: 8,
            headline: 'Other',
            slug: 'other',
            description: null,
            status: 'published',
            author: 'me',
          },
        ],
        error: null,
      },
      case_studies: { data: [], error: null },
    });

    const results = await searchContent(supabase, 'design', {
      excludeId: 7,
      excludeType: 'article',
      userId: 'me',
    });

    expect(results.map((r) => r.id)).toEqual([8]);
  });
});

describe('getRelations / getBacklinks', () => {
  it('hydrates edges with endpoint details and drops orphaned targets', async () => {
    const supabase = makeSupabase({
      content_relations: {
        data: [
          {
            id: 100,
            source_id: 1,
            source_type: 'article',
            target_id: 10,
            target_type: 'case-study',
            relationship_type: 'elaborates',
            created_at: null,
          },
          {
            id: 101,
            source_id: 1,
            source_type: 'article',
            target_id: 999,
            target_type: 'article',
            relationship_type: 'related',
            created_at: null,
          },
        ],
        error: null,
      },
      case_studies: {
        data: [
          {
            id: 10,
            headline: 'Target study',
            slug: 'target-study',
            description: null,
            status: 'published',
            author: 'me',
          },
        ],
        error: null,
      },
      // Orphaned edge target (article 999) resolves to no rows.
      articles: { data: [], error: null },
    });

    const relations = await getRelations(supabase, 1, 'article');

    expect(relations).toHaveLength(1);
    expect(relations[0]).toMatchObject({
      id: 10,
      type: 'case-study',
      title: 'Target study',
      slug: 'target-study',
      relationship_type: 'elaborates',
    });
  });

  it('reads incoming edges for backlinks', async () => {
    const supabase = makeSupabase({
      content_relations: {
        data: [
          {
            id: 200,
            source_id: 5,
            source_type: 'article',
            target_id: 10,
            target_type: 'case-study',
            relationship_type: 'example',
            created_at: null,
          },
        ],
        error: null,
      },
      articles: {
        data: [
          {
            id: 5,
            headline: 'Linking article',
            slug: 'linking-article',
            description: null,
            status: 'published',
            author: 'me',
          },
        ],
        error: null,
      },
    });

    const backlinks = await getBacklinks(supabase, 10, 'case-study');

    expect(backlinks).toHaveLength(1);
    expect(backlinks[0]).toMatchObject({
      id: 5,
      type: 'article',
      relationship_type: 'example',
    });
  });

  it('normalizes unknown relationship types to the default', async () => {
    const supabase = makeSupabase({
      content_relations: {
        data: [
          {
            id: 300,
            source_id: 1,
            source_type: 'article',
            target_id: 2,
            target_type: 'article',
            relationship_type: 'not-a-real-type',
            created_at: null,
          },
        ],
        error: null,
      },
      articles: {
        data: [
          {
            id: 2,
            headline: 'Other',
            slug: 'other',
            description: null,
            status: 'published',
            author: 'me',
          },
        ],
        error: null,
      },
    });

    const relations = await getRelations(supabase, 1, 'article');
    expect(relations[0].relationship_type).toBe('related');
  });
});

describe('syncRelations', () => {
  it('drops self-links and duplicate targets, then replaces the edge set', async () => {
    const supabase = makeSupabase({
      content_relations: { data: null, error: null },
    });

    const result = await syncRelations(supabase, 1, 'article', [
      { id: 10, type: 'case-study', relationship_type: 'elaborates' },
      { id: 10, type: 'case-study', relationship_type: 'example' },
      { id: 1, type: 'article' },
    ]);

    expect(result).toEqual({ synced: 1, error: null });

    const from = supabase.from as ReturnType<typeof vi.fn>;
    expect(from.mock.calls.map((call) => call[0])).toEqual([
      'content_relations',
      'content_relations',
    ]);

    const deleteQuery = from.mock.results[0].value;
    const insertQuery = from.mock.results[1].value;
    expect(deleteQuery.delete).toHaveBeenCalled();
    expect(deleteQuery.eq).toHaveBeenCalledWith('source_id', 1);
    expect(insertQuery.insert).toHaveBeenCalledWith([
      {
        source_id: 1,
        source_type: 'article',
        target_id: 10,
        target_type: 'case-study',
        relationship_type: 'elaborates',
      },
    ]);
  });

  it('skips the insert when the new set is empty', async () => {
    const supabase = makeSupabase({
      content_relations: { data: null, error: null },
    });

    const result = await syncRelations(supabase, 1, 'article', []);

    expect(result).toEqual({ synced: 0, error: null });
    const from = supabase.from as ReturnType<typeof vi.fn>;
    expect(from).toHaveBeenCalledTimes(1);
    expect(from.mock.results[0].value.insert).not.toHaveBeenCalled();
  });

  it('reports delete failures without inserting', async () => {
    const supabase = makeSupabase({
      content_relations: { data: null, error: { message: 'denied' } },
    });

    const result = await syncRelations(supabase, 1, 'article', [
      { id: 10, type: 'case-study' },
    ]);

    expect(result.error).toBe('denied');
    const from = supabase.from as ReturnType<typeof vi.fn>;
    expect(from).toHaveBeenCalledTimes(1);
    expect(from.mock.results[0].value.insert).not.toHaveBeenCalled();
  });
});

describe('cleanupOrphanedRelations', () => {
  it('removes only edges whose endpoints no longer exist', async () => {
    const supabase = makeSupabase({
      content_relations: {
        data: [
          {
            id: 1,
            source_id: 1,
            source_type: 'article',
            target_id: 10,
            target_type: 'case-study',
          },
          {
            id: 2,
            source_id: 999,
            source_type: 'article',
            target_id: 10,
            target_type: 'case-study',
          },
        ],
        error: null,
      },
      articles: {
        data: [
          {
            id: 1,
            headline: 'x',
            slug: 'x',
            description: null,
            status: 'published',
            author: 'a',
          },
        ],
        error: null,
      },
      case_studies: {
        data: [
          {
            id: 10,
            headline: 'y',
            slug: 'y',
            description: null,
            status: 'published',
            author: 'a',
          },
        ],
        error: null,
      },
    });

    const result = await cleanupOrphanedRelations(supabase);

    expect(result.checked).toBe(2);
    expect(result.removed).toBe(1);
    expect(result.errors).toEqual([]);

    const from = supabase.from as ReturnType<typeof vi.fn>;
    const deleteCalls = from.mock.results
      .map((r) => r.value)
      .filter((q) => q.delete.mock.calls.length > 0);
    expect(deleteCalls).toHaveLength(1);
    expect(deleteCalls[0].eq).toHaveBeenCalledWith('id', 2);
  });
});

describe('getContentRelationStats', () => {
  it('counts relations by normalized type', async () => {
    const supabase = makeSupabase({
      content_relations: {
        data: [
          { relationship_type: 'related' },
          { relationship_type: 'elaborates' },
          { relationship_type: null },
        ],
        error: null,
      },
    });

    const stats = await getContentRelationStats(supabase);

    expect(stats.totalRelations).toBe(3);
    expect(stats.relationsByType).toEqual({ related: 2, elaborates: 1 });
  });
});
