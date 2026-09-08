// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/maintenance/cleanup-relations/route';

const getUser = vi.hoisted(() => vi.fn());
vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser } }),
}));
vi.mock('@/utils/env', () => ({
  env: { nextPublicSupabaseUrl: 'https://example.supabase.co' },
  isAdminUserId: (id: string) => id === 'admin',
}));
vi.mock('@/utils/supabase/revalidateContent', () => ({
  revalidatePublicArticlePaths: vi.fn(),
}));

type Row = Record<string, unknown> & { id: number };
let tables: Record<string, Row[]>;
let failedTable: string | null;
let failDelete: boolean;
let requests: { table: string; method: string; id: string | null }[];
beforeEach(() => {
  vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test_only');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  getUser.mockResolvedValue({ data: { user: { id: 'admin' } }, error: null });
  failedTable = null;
  failDelete = false;
  requests = [];
  tables = {
    content_relations: [1, 3, 99].map((id, index) => ({
      id: index + 1,
      source_type: 'article',
      source_id: id,
      target_type: 'case-study',
      target_id: 2,
      relationship_type: 'related',
    })),
    articles: [
      { id: 1, status: 'draft' },
      { id: 3, status: 'draft' },
    ],
    case_studies: [{ id: 2, status: 'draft' }],
  };
  // Real Supabase query builders and pagination, mocked only at HTTP transport.
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      const table = url.pathname.split('/').pop()!;
      const method = init?.method ?? 'GET';
      const id = url.searchParams.get('id');
      requests.push({ table, method, id });
      if (table === failedTable || (method === 'DELETE' && failDelete))
        return new Response(
          JSON.stringify({ message: 'private database failure' }),
          { status: 500 }
        );
      if (method === 'DELETE')
        return new Response(JSON.stringify([{ id: Number(id?.slice(3)) }]), {
          status: 200,
        });
      const cursor = id?.startsWith('gt.') ? Number(id.slice(3)) : 0;
      // A server row cap smaller than the requested limit must not hide endpoints.
      return new Response(
        JSON.stringify(
          (tables[table] ?? []).filter((row) => row.id > cursor).slice(0, 1)
        ),
        { status: 200 }
      );
    })
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('privileged relation maintenance through the real SDK', () => {
  it.each([null, 'reader'])(
    'rejects caller %s before privileged reads',
    async (id) => {
      getUser.mockResolvedValue({
        data: { user: id ? { id } : null },
        error: null,
      });
      expect((await POST()).status).toBe(id ? 403 : 401);
      expect(requests).toEqual([]);
    }
  );
  it.each(['', 'sb_publishable_test_only'])(
    'fails closed without privileged credentials: %s',
    async (key) => {
      vi.stubEnv('SUPABASE_SECRET_KEY', key);
      expect((await POST()).status).toBe(503);
      expect(requests).toEqual([]);
    }
  );
  it.each(['content_relations', 'articles', 'case_studies'])(
    'never deletes after a failed %s read',
    async (table) => {
      failedTable = table;
      const response = await POST();
      expect(response.status).toBe(500);
      expect(await response.text()).not.toContain('private database failure');
      expect(requests.filter((request) => request.method === 'DELETE')).toEqual(
        []
      );
    }
  );
  it('preserves drafts across capped pages and deletes only the true orphan after all reads', async () => {
    const response = await POST();
    expect(response.status).toBe(200);
    expect((await response.json()).data.cleanup).toEqual({
      checked: 3,
      removed: 1,
      errors: [],
    });
    expect(requests.filter((request) => request.method === 'DELETE')).toEqual([
      { table: 'content_relations', method: 'DELETE', id: 'eq.3' },
    ]);
    expect(requests.at(-2)).toEqual({
      table: 'case_studies',
      method: 'GET',
      id: 'gt.2',
    });
  });
  it('rejects unknown endpoint types before deleting any orphan', async () => {
    tables.content_relations.push({
      id: 4,
      source_type: 'unknown',
      source_id: 10,
      target_type: 'article',
      target_id: 1,
    });
    expect((await POST()).status).toBe(500);
    expect(requests.filter((request) => request.method === 'DELETE')).toEqual(
      []
    );
  });
  it('reports failed deletion without claiming any removal', async () => {
    failDelete = true;
    const response = await POST();
    expect(response.status).toBe(500);
    expect((await response.json()).data.cleanup.removed).toBe(0);
  });
  it('counts all pages for GET without deleting or scanning endpoint tables', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect((await response.json()).data.stats).toEqual({
      totalRelations: 3,
      relationsByType: { related: 3 },
    });
    expect(
      requests.every(
        (request) =>
          request.method === 'GET' && request.table === 'content_relations'
      )
    ).toBe(true);
  });
});
