import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * These pages are cached (FEAT-220), which changed what a failed read costs.
 *
 * Before caching, a Supabase blip produced one bad response. Now the result is
 * written into the cache and served for up to the revalidate window — so
 * swallowing an error into `[]` pins an empty list, and swallowing it into
 * `notFound()` pins a 404 on a published article with no write to invalidate it.
 *
 * The fix is to let a failed read fail the render: Next then keeps serving the
 * previous good entry rather than caching the failure. That makes the distinction
 * between "absent" and "failed" load-bearing, which is what these pin.
 */

type QueryResult = { data: unknown; error: unknown };

/**
 * Chainable Supabase stand-in. Every builder method returns the same object, and
 * the object is awaitable, so it satisfies all the shapes these pages use —
 * `.select().eq().order()`, `.eq().eq().single()`, `.lt().order().limit().maybeSingle()`.
 */
function makeChain(result: QueryResult) {
  const chain: Record<string, unknown> = {
    then: (
      onFulfilled?: (value: QueryResult) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  for (const method of [
    'select',
    'eq',
    'order',
    'lt',
    'gt',
    'limit',
    'single',
    'maybeSingle',
  ]) {
    chain[method] = vi.fn(() => chain);
  }
  return chain;
}

const queryResult = vi.hoisted(() => ({
  current: { data: null, error: null } as QueryResult,
}));

const createReadClientMock = vi.hoisted(() => vi.fn());

vi.mock('@/utils/supabase/readClient', () => ({
  createReadClient: createReadClientMock,
}));

/** notFound() throws a sentinel so "404" is distinguishable from a real error. */
const NOT_FOUND = new Error('NEXT_NOT_FOUND_SENTINEL');
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw NOT_FOUND;
  }),
}));

// Keep the render shallow — these tests are about the data path, not markup.
vi.mock('@/app/articles/ArticlesListClient', () => ({ default: () => null }));
vi.mock('@/app/articles/[slug]/ArticleDetailClient', () => ({
  default: () => null,
}));
vi.mock('@/app/work/_components/CaseStudyPage', () => ({
  default: () => null,
}));
vi.mock('@/utils/ldjson', () => ({ generateLDJson: () => ({}) }));
vi.mock('@/utils/tiptap/htmlGeneration', () => ({
  processArticleContent: () => ({ html: '' }),
}));
vi.mock('@/utils/caseStudy', () => ({
  getCaseStudyContent: () => ({ html: '' }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  queryResult.current = { data: null, error: null };
  createReadClientMock.mockImplementation(() => ({
    from: vi.fn(() => makeChain(queryResult.current)),
  }));
});

const DB_ERROR = {
  message: 'connection terminated unexpectedly',
  code: '08006',
};

describe('articles list page', () => {
  it('A1: a query error fails the render instead of caching an empty list', async () => {
    queryResult.current = { data: null, error: DB_ERROR };
    const { default: Page } = await import('@/app/articles/page');

    // Returning [] here would cache an empty /articles for the revalidate window.
    await expect(Page()).rejects.toThrow();
  });

  it('A4: zero published articles is a success and renders', async () => {
    queryResult.current = { data: [], error: null };
    const { default: Page } = await import('@/app/articles/page');

    // An empty corpus is not a failure — it must still be cacheable.
    await expect(Page()).resolves.toBeDefined();
  });
});

describe('article detail page', () => {
  it('A1: a query error fails the render rather than 404ing', async () => {
    queryResult.current = { data: null, error: DB_ERROR };
    const { default: Page } = await import('@/app/articles/[slug]/page');

    // A cached 404 on a published article has no write to invalidate it.
    await expect(
      Page({ params: Promise.resolve({ slug: 'a-published-article' }) })
    ).rejects.toThrow();
    await expect(
      Page({ params: Promise.resolve({ slug: 'a-published-article' }) })
    ).rejects.not.toThrow(NOT_FOUND.message);
  });

  it('A2: a genuinely absent slug still 404s', async () => {
    queryResult.current = { data: null, error: null };
    const { default: Page } = await import('@/app/articles/[slug]/page');

    await expect(
      Page({ params: Promise.resolve({ slug: 'never-existed' }) })
    ).rejects.toThrow(NOT_FOUND.message);
  });
});

describe('case study detail page', () => {
  it('A1: a query error fails the render rather than 404ing', async () => {
    queryResult.current = { data: null, error: DB_ERROR };
    const { default: Page } = await import('@/app/work/[slug]/page');

    await expect(
      Page({ params: Promise.resolve({ slug: 'a-published-case-study' }) })
    ).rejects.not.toThrow(NOT_FOUND.message);
  });

  it('A2: a genuinely absent slug still 404s', async () => {
    queryResult.current = { data: null, error: null };
    const { default: Page } = await import('@/app/work/[slug]/page');

    await expect(
      Page({ params: Promise.resolve({ slug: 'never-existed' }) })
    ).rejects.toThrow(NOT_FOUND.message);
  });
});

describe('generateStaticParams', () => {
  it('A3: logs a query error instead of silently prerendering nothing', async () => {
    queryResult.current = { data: null, error: DB_ERROR };
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { generateStaticParams } = await import('@/app/articles/[slug]/page');
    const params = await generateStaticParams();

    // The build must still complete — but silently prerendering zero pages is how
    // a fully on-demand deploy goes unnoticed.
    expect(params).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('A3: case study params log their errors too', async () => {
    queryResult.current = { data: null, error: DB_ERROR };
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { generateStaticParams } = await import('@/app/work/[slug]/page');
    const params = await generateStaticParams();

    expect(params).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('returns the published slugs when the query succeeds', async () => {
    queryResult.current = {
      data: [{ slug: 'one' }, { slug: 'two' }, { slug: null }],
      error: null,
    };
    const { generateStaticParams } = await import('@/app/articles/[slug]/page');

    // Null slugs are dropped rather than producing a broken route.
    expect(await generateStaticParams()).toEqual([
      { slug: 'one' },
      { slug: 'two' },
    ]);
  });
});
