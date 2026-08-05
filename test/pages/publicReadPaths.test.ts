import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PUBLIC_ARTICLE_SELECT,
  PUBLIC_CASE_STUDY_SELECT,
} from '@/utils/supabase/contentAccess';

/**
 * These pages are now cached, which raises the stakes on two hardening fixes:
 *
 *  - `.eq('status', 'published')` (e21a8077) — without it a draft is fetchable by
 *    slug, and under ISR that draft would be written into a shared cache and
 *    served to everyone until the next revalidation.
 *  - narrow select lists (36eb7c0a) — a wildcard select would put working* draft
 *    columns and full profile rows into a cached public payload.
 *
 * Caching is also only possible while these pages avoid the cookie-bound client,
 * so that is pinned here too: a `createClient` from `utils/supabase/server`
 * reintroduces `cookies()` and silently turns ISR back off.
 *
 * Source-level assertions are deliberate. Executing these server components would
 * require standing up Supabase, Tiptap and Next's request context; what needs
 * protecting is a small set of literal call-site properties, and reading them
 * directly is both honest about what it checks and immune to a mock drifting away
 * from the real client.
 */

const REPO_ROOT = process.cwd();

const PAGES = {
  articlesList: 'app/articles/page.tsx',
  articleDetail: 'app/articles/[slug]/page.tsx',
  caseStudyDetail: 'app/work/[slug]/page.tsx',
} as const;

function read(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), 'utf8');
}

const entries = Object.entries(PAGES) as Array<
  [keyof typeof PAGES, (typeof PAGES)[keyof typeof PAGES]]
>;

describe('public read paths stay cacheable and narrow', () => {
  it.each(entries)('%s uses the cookieless read client', (_name, rel) => {
    const src = read(rel);

    expect(src).toContain("from '@/utils/supabase/readClient'");
    // The cookie-bound client is what forces dynamic rendering.
    expect(src).not.toContain("from '@/utils/supabase/server'");
  });

  it.each(entries)('%s declares an ISR revalidate window', (_name, rel) => {
    const src = read(rel);

    expect(src).toMatch(/export const revalidate = \d+/);
    // force-dynamic would silently override revalidate and re-enable per-request
    // rendering — the case-study page carried exactly this before FEAT-220.
    expect(src).not.toMatch(/export const dynamic\s*=\s*['"]force-dynamic['"]/);
  });

  it.each(entries)('%s constrains every query to published', (_name, rel) => {
    const src = read(rel);

    const fromCalls = src.match(/\.from\(/g)?.length ?? 0;
    const publishedFilters =
      src.match(/\.eq\(\s*'status',\s*'published'\s*\)/g)?.length ?? 0;

    expect(fromCalls).toBeGreaterThan(0);
    // One published filter per table query. The article detail page makes three
    // (article + prev + next neighbour lookups), and a neighbour query missing
    // the filter would leak draft headlines into cached footer links.
    expect(publishedFilters).toBe(fromCalls);
  });

  it('article pages select the narrow public column lists, never a wildcard', () => {
    const detail = read(PAGES.articleDetail);
    const list = read(PAGES.articlesList);

    expect(detail).toContain('PUBLIC_ARTICLE_SELECT');
    expect(detail).not.toMatch(/\.select\(\s*['"`]\s*\*/);
    expect(list).toContain('PUBLIC_AUTHOR_COLUMNS');
    // A wildcard author embed would ship the whole profiles row.
    expect(list).not.toContain('author(*)');
  });

  it('case study page selects the narrow public column list', () => {
    const src = read(PAGES.caseStudyDetail);

    expect(src).toContain('PUBLIC_CASE_STUDY_SELECT');
    expect(src).not.toMatch(/\.select\(\s*['"`]\s*\*/);
  });

  it('the select constants still exclude draft working* columns', () => {
    // Belt to contentAccess.test.ts's braces: if those constants ever widened,
    // the pages above would inherit the leak without changing a line.
    for (const constant of [PUBLIC_ARTICLE_SELECT, PUBLIC_CASE_STUDY_SELECT]) {
      expect(constant).not.toMatch(/working/i);
      expect(constant).not.toContain('is_dirty');
      expect(constant).not.toContain('*');
    }
  });
});
