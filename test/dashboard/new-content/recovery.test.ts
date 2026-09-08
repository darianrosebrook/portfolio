import { describe, expect, it } from 'vitest';
import {
  draftFingerprint,
  parseNewDraftRecovery,
} from '@/utils/editor/newDraftRecovery';
import {
  createCaseStudySchema,
  patchCaseStudyDraftSchema,
} from '@/utils/schemas/case-study.schema';

describe('draft recovery records', () => {
  it('preserves the acknowledged slug independently from a newer local rename', () => {
    const envelope = {
      version: 1,
      ownerId: 'owner',
      article: {
        id: 43,
        slug: 'renamed',
        headline: 'New title',
        status: 'draft',
      },
      identity: { id: 43, slug: 'original' },
      savedFingerprint: 'previous revision',
    };
    expect(parseNewDraftRecovery(JSON.stringify(envelope), 'owner')).toEqual(
      envelope
    );
  });
  it('rejects drafts owned by another account and ownerless legacy drafts', () => {
    expect(() =>
      parseNewDraftRecovery(
        JSON.stringify({
          version: 1,
          ownerId: 'other',
          article: { headline: 'private' },
        }),
        'owner'
      )
    ).toThrow();
    expect(() =>
      parseNewDraftRecovery(
        JSON.stringify({ id: 29, slug: 'existing', headline: 'ownerless' }),
        'owner'
      )
    ).toThrow();
  });
  it.each([
    null,
    [],
    { headline: 3 },
    { articleBody: 'not a document' },
    { articleBody: { type: 'doc', content: 'invalid' } },
    { articleBody: { type: 'doc', content: [{ type: 'text', text: 4 }] } },
  ])(
    'rejects malformed recovery content without creating an empty replacement: %j',
    (article) => {
      expect(() =>
        parseNewDraftRecovery(
          JSON.stringify({ version: 1, ownerId: 'owner', article }),
          'owner'
        )
      ).toThrow();
    }
  );
  it('whitelists editable data and removes persisted account and publication authority', () => {
    const parsed = parseNewDraftRecovery(
      JSON.stringify({
        version: 1,
        ownerId: 'owner',
        article: {
          slug: 'draft',
          headline: 'Title',
          author: 'attacker',
          status: 'published',
          published_at: 'future',
          workingheadline: 'injected',
          id: 400,
        },
      }),
      'owner'
    );
    expect(parsed.article).toEqual({
      slug: 'draft',
      headline: 'Title',
      status: 'draft',
    });
    expect(parsed.identity).toBeNull();
  });
  it('rejects an invalid server identity', () => {
    expect(() =>
      parseNewDraftRecovery(
        JSON.stringify({
          version: 1,
          ownerId: 'owner',
          article: {},
          identity: { id: 0, slug: 'invalid' },
        }),
        'owner'
      )
    ).toThrow();
  });
  it('excludes server timestamps from revision identity but detects metadata changes', () => {
    const article = {
      slug: 'draft',
      headline: 'Content',
      description: '',
      modified_at: '2026-09-08T00:00:00Z',
    };
    expect(
      draftFingerprint({
        ...article,
        modified_at: '2026-09-08T01:00:00Z',
        id: 7,
      })
    ).toBe(draftFingerprint(article));
    expect(draftFingerprint({ ...article, description: 'Changed' })).not.toBe(
      draftFingerprint(article)
    );
  });
});

describe('case study request contracts', () => {
  it('accepts client-owned creation fields without requiring server-owned mirrors', () => {
    const payload = {
      slug: 'my-case-study',
      headline: 'My case study',
      description: '',
      articleBody: { type: 'doc', content: [] },
      articleSection: null,
      keywords: null,
      image: null,
      wordCount: 0,
      status: 'draft',
    };
    const result = createCaseStudySchema.parse(payload);
    expect(result).toEqual({ ...payload, description: null, is_dirty: false });
  });
  it('admits valid draft renames and rejects malformed slugs', () => {
    expect(
      patchCaseStudyDraftSchema.parse({
        slug: 'updated-name',
        workingheadline: 'Updated',
      })
    ).toEqual({ slug: 'updated-name', workingheadline: 'Updated' });
    expect(
      patchCaseStudyDraftSchema.safeParse({ slug: 'invalid/path' }).success
    ).toBe(false);
  });
});
