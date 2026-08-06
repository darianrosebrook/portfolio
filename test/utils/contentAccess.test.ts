import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  PUBLIC_ARTICLE_COLUMNS,
  PUBLIC_ARTICLE_SELECT,
  PUBLIC_AUTHOR_COLUMNS,
  PUBLIC_CASE_STUDY_COLUMNS,
  PUBLIC_CASE_STUDY_SELECT,
  WORKING_FIELD_KEYS,
  projectContentForCaller,
  stripWorkingFields,
} from '@/utils/supabase/contentAccess';

describe('contentAccess', () => {
  const row = {
    id: 1,
    slug: 'demo',
    author: 'author-1',
    status: 'draft',
    headline: 'Published title',
    workingheadline: 'Draft title',
    workingbody: { type: 'doc', content: [] },
    is_dirty: true,
  };

  it('strips working fields for non-authors', () => {
    const projected = projectContentForCaller(row, 'other-user');
    expect(projected).not.toHaveProperty('workingheadline');
    expect(projected).not.toHaveProperty('workingbody');
    expect(projected).not.toHaveProperty('is_dirty');
    expect(projected.headline).toBe('Published title');
  });

  it('returns full row for the author', () => {
    expect(projectContentForCaller(row, 'author-1')).toEqual(row);
  });

  it('stripWorkingFields removes known draft columns', () => {
    const stripped = stripWorkingFields(row);
    expect(stripped).not.toHaveProperty('workingheadline');
    expect(stripped.slug).toBe('demo');
  });
});

describe('public content select lists', () => {
  // Public pages spread the fetched row straight into client-component props,
  // so the select list is the payload boundary for anonymous visitors. These
  // pin the FIX-APP-SEC-001 invariant at the point where it would regress:
  // someone widening a select back to '*' or adding a working* column.

  it('no public article column is a working-draft column', () => {
    for (const column of PUBLIC_ARTICLE_COLUMNS) {
      expect(WORKING_FIELD_KEYS).not.toContain(column);
    }
  });

  it('no public case study column is a working-draft column', () => {
    for (const column of PUBLIC_CASE_STUDY_COLUMNS) {
      expect(WORKING_FIELD_KEYS).not.toContain(column);
    }
  });

  it('article select list names every column the article page renders', () => {
    // Fields consumed by ArticleDetailClient, generateMetadata, and
    // generateLDJson. A narrowing that drops one of these breaks the page.
    const required = [
      'headline',
      'alternativeHeadline',
      'description',
      'articleSection',
      'keywords',
      'image',
      'published_at',
      'modified_at',
      'articleBody',
    ];

    for (const field of required) {
      expect(PUBLIC_ARTICLE_COLUMNS).toContain(field);
    }
  });

  it('case study select list names every column the work page renders', () => {
    for (const field of ['headline', 'description', 'image', 'articleBody']) {
      expect(PUBLIC_CASE_STUDY_COLUMNS).toContain(field);
    }
  });

  it('article select embeds only the three author columns ProfileFlag renders', () => {
    expect(PUBLIC_AUTHOR_COLUMNS).toEqual([
      'full_name',
      'username',
      'avatar_url',
    ]);
    expect(PUBLIC_ARTICLE_SELECT).toContain(
      `author(${PUBLIC_AUTHOR_COLUMNS.join(', ')})`
    );
  });

  it('each select literal matches its column array', () => {
    // The literals exist for supabase-js type inference; the arrays are what
    // the checks above reason about. Drift between them would make those
    // checks describe a select list the app does not actually use.
    expect(PUBLIC_ARTICLE_SELECT).toBe(
      `${PUBLIC_ARTICLE_COLUMNS.join(', ')}, author(${PUBLIC_AUTHOR_COLUMNS.join(', ')})`
    );
    expect(PUBLIC_CASE_STUDY_SELECT).toBe(PUBLIC_CASE_STUDY_COLUMNS.join(', '));
  });

  it('the wildcard-select pattern matches the shapes it is meant to catch', () => {
    // Guards the guard below: a pattern that can never match would let a
    // regression through while still reporting green.
    const wildcardSelect = /\.select\(\s*(['"`])\s*\*/;

    expect(".select('*')").toMatch(wildcardSelect);
    expect('.select("*")').toMatch(wildcardSelect);
    expect(".select('*, author(full_name)')").toMatch(wildcardSelect);
    expect('.select(\n  `*`\n)').toMatch(wildcardSelect);
    expect('.select(PUBLIC_ARTICLE_SELECT)').not.toMatch(wildcardSelect);
    expect(".select('headline, articleBody')").not.toMatch(wildcardSelect);
  });

  it('public content pages select via the shared helpers, never a wildcard', () => {
    // The constants above are only protective if the pages actually use them.
    // This is the check that fails if someone restores `select('*')` on a
    // route whose row is spread into client-component props.
    const pages = [
      'app/articles/[slug]/page.tsx',
      'app/work/[slug]/page.tsx',
      'app/articles/page.tsx',
    ];

    for (const page of pages) {
      const source = readFileSync(resolve(process.cwd(), page), 'utf8');
      expect(source, `${page} must not wildcard-select`).not.toMatch(
        /\.select\(\s*(['"`])\s*\*/
      );
      expect(source, `${page} must not embed author(*)`).not.toContain(
        'author(*)'
      );
    }
  });

  it('neither select list is a wildcard or contains a working column', () => {
    for (const select of [PUBLIC_ARTICLE_SELECT, PUBLIC_CASE_STUDY_SELECT]) {
      expect(select).not.toContain('*');
      for (const key of WORKING_FIELD_KEYS) {
        // Word-boundary match: `headline` must not trip on `workingheadline`.
        expect(select).not.toMatch(new RegExp(`\\b${key}\\b`));
      }
    }
  });
});
