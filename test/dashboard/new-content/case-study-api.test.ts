// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from '@/app/api/case-studies/[slug]/route';

const { state, revalidate } = vi.hoisted(() => ({
  state: {
    user: 'owner' as string | null,
    rows: [] as Array<Record<string, unknown>>,
  },
  revalidate: vi.fn(),
}));
vi.mock('@/utils/supabase/revalidateContent', () => ({
  revalidatePublicCaseStudyPaths: revalidate,
}));
vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: state.user ? { id: state.user } : null },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table !== 'case_studies') throw new Error('Unexpected table');
      const predicates: Array<[string, unknown]> = [];
      let updates: Record<string, unknown> = {};
      const query = {
        update: (value: Record<string, unknown>) => {
          updates = value;
          return query;
        },
        eq: (column: string, value: unknown) => {
          predicates.push([column, value]);
          return query;
        },
        select: async () => {
          const rows = state.rows.filter((row) =>
            predicates.every(([column, value]) => row[column] === value)
          );
          for (const row of rows) Object.assign(row, updates);
          return { data: rows, error: null };
        },
      };
      return query;
    },
  }),
}));
const patch = (payload: unknown) =>
  PATCH(
    new Request('http://localhost/api/case-studies/original', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
    { params: Promise.resolve({ slug: 'original' }) }
  );

// The database boundary is an in-memory query adapter; the route and schemas
// are real. These tests establish request/filter behavior, not live RLS proof.
describe('case study draft persistence contract', () => {
  beforeEach(() => {
    state.user = 'owner';
    state.rows = [
      {
        id: 19,
        slug: 'original',
        headline: 'Canonical title',
        author: 'owner',
        status: 'draft',
        workingheadline: null,
      },
    ];
    revalidate.mockClear();
  });
  it('renames an owned draft and returns its new identity with the working revision', async () => {
    const response = await patch({
      slug: 'new-name',
      workingheadline: 'Working revision',
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      expect.objectContaining({
        id: 19,
        slug: 'new-name',
        headline: 'Canonical title',
        workingheadline: 'Working revision',
        is_dirty: true,
      }),
    ]);
    expect(revalidate).not.toHaveBeenCalled();
  });
  it('refuses a published URL rename and leaves both canonical and working data untouched', async () => {
    state.rows[0].status = 'published';
    const response = await patch({
      slug: 'new-name',
      workingheadline: 'Must not apply',
    });
    expect(response.status).toBe(404);
    expect(state.rows[0]).toMatchObject({
      slug: 'original',
      headline: 'Canonical title',
      workingheadline: null,
    });
  });
  it('saves working fields on published content without changing the public title', async () => {
    state.rows[0].status = 'published';
    const response = await patch({
      slug: 'original',
      workingheadline: 'Next revision',
    });
    expect(response.status).toBe(200);
    expect(state.rows[0]).toMatchObject({
      slug: 'original',
      headline: 'Canonical title',
      workingheadline: 'Next revision',
      status: 'published',
    });
    expect(revalidate).not.toHaveBeenCalled();
  });
  it('refuses writes to another author instead of acknowledging a zero-row save', async () => {
    state.user = 'another-author';
    const response = await patch({ workingheadline: 'Unauthorized' });
    expect(response.status).toBe(404);
    expect(state.rows[0].workingheadline).toBeNull();
  });
  it('rejects a malformed rename before the database mutation', async () => {
    const response = await patch({ slug: 'invalid/path' });
    expect(response.status).toBe(400);
    expect(state.rows[0].slug).toBe('original');
  });
  it('requires a signed-in author', async () => {
    state.user = null;
    const response = await patch({ workingheadline: 'Unauthorized' });
    expect(response.status).toBe(401);
    expect(state.rows[0].workingheadline).toBeNull();
  });
});
