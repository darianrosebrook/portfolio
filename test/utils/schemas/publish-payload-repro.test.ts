import { describe, it, expect } from 'vitest';
import { updateArticleSchema } from '@/utils/schemas/article.schema';

/**
 * Repro for the PUT /api/articles/<slug> -> 400 from the dev log.
 *
 * The publish payload is roughly `{ ...articleStateFromServer, status:
 * 'published', published_at }`. articleStateFromServer was the full row
 * returned by the prior PATCH/POST, which contains every column.
 */
describe('updateArticleSchema — publish payload repro', () => {
  it('accepts the slim publish payload (the one the client now sends)', () => {
    // After the fix, handlePublish only sends slug + status + published_at,
    // not the full server-shaped article. This is the contract that has to
    // keep working.
    const result = updateArticleSchema.safeParse({
      slug: 'fine-slug',
      status: 'published',
      published_at: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it('accepts the slim unpublish payload', () => {
    const result = updateArticleSchema.safeParse({
      slug: 'fine-slug',
      status: 'draft',
      published_at: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a full server-shaped row plus status:published', () => {
    const payload = {
      id: 42,
      slug: 'the-prime-knows-where-it-is-because-it-knows-where-it-isnt',
      headline: "The Prime Knows Where It Is Because It Knows Where It Isn't",
      description: 'A short desc',
      articleBody: { type: 'doc', content: [] },
      articleSection: null,
      keywords: null,
      image: null,
      wordCount: 5399,
      status: 'published' as const,
      author: 'a1b2c3d4-1234-5678-90ab-cdef12345678',
      editor: 'a1b2c3d4-1234-5678-90ab-cdef12345678',
      alternativeHeadline: null,
      index: null,
      workingbody: { type: 'doc', content: [] },
      workingheadline: 'foo',
      workingdescription: 'bar',
      workingimage: null,
      workingkeywords: null,
      workingarticlesection: null,
      working_modified_at: new Date().toISOString(),
      is_dirty: false,
      created_at: '2026-05-18T01:00:00.000Z',
      modified_at: '2026-05-18T01:00:00.000Z',
      published_at: new Date().toISOString(),
    };

    const result = updateArticleSchema.safeParse(payload);
    if (!result.success) {
      console.log(
        'VALIDATION ISSUES:',
        JSON.stringify(result.error.issues, null, 2)
      );
    }
    expect(result.success).toBe(true);
  });

  it('accepts a relative image path (uploaded asset, not external URL)', () => {
    // Many existing rows have image = '/uploads/foo.jpg' or similar. The
    // schema needs to accept this — strict z.string().url() rejected valid
    // persisted state and 400d every subsequent publish PUT.
    const result = updateArticleSchema.safeParse({
      slug: 'fine-slug',
      image: '/uploads/cover.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('still accepts full URLs in image', () => {
    const result = updateArticleSchema.safeParse({
      slug: 'fine-slug',
      image: 'https://example.com/cover.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects garbage in image', () => {
    const result = updateArticleSchema.safeParse({
      slug: 'fine-slug',
      image: 'not a url or path',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a postgres timestamp format on working_modified_at', () => {
    // Supabase/PG returns "2026-05-18 01:00:00+00" or similar from some
    // queries. The schema now accepts both ISO 8601 and PG forms so the
    // round-trip update payload validates.
    const result = updateArticleSchema.safeParse({
      slug: 'fine-slug',
      working_modified_at: '2026-05-18 01:00:00+00',
    });
    expect(result.success).toBe(true);
  });

  it('still accepts strict ISO 8601 on working_modified_at', () => {
    const result = updateArticleSchema.safeParse({
      slug: 'fine-slug',
      working_modified_at: '2026-05-18T01:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-UUID author/editor values', () => {
    const result = updateArticleSchema.safeParse({
      slug: 'fine-slug',
      author: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});
