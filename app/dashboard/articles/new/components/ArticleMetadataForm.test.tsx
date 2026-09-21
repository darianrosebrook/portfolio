import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Article } from '@/types';
import { ArticleMetadataForm } from './ArticleMetadataForm';

/**
 * The slug field is a controlled input: every keystroke round-trips through the
 * parent's state. This harness reproduces that contract so the test observes the
 * field value the author actually sees.
 */
function SlugHarness({ initialSlug = '' }: { initialSlug?: string }) {
  const [article, setArticle] = useState<Partial<Article>>({
    slug: initialSlug,
    headline: 'Two Truths',
  });
  const onChange = vi.fn((updates: Partial<Article>) => {
    setArticle((previous) => ({ ...previous, ...updates }));
  });
  return (
    <ArticleMetadataForm
      article={article}
      onChange={onChange}
      extractedMetadata={{
        headline: null,
        description: null,
        coverImage: null,
        wordCount: 0,
      }}
    />
  );
}

describe('ArticleMetadataForm slug field', () => {
  it('keeps every hyphen the author types', async () => {
    const user = userEvent.setup();
    render(<SlugHarness initialSlug="domain" />);
    const slug = screen.getByLabelText('Slug') as HTMLInputElement;

    await user.clear(slug);
    await user.type(slug, 'domain-induced');

    expect(slug.value).toBe('domain-induced');
  });

  it('does not collapse a typed hyphen when the next character arrives', async () => {
    const user = userEvent.setup();
    render(<SlugHarness />);
    const slug = screen.getByLabelText('Slug') as HTMLInputElement;

    await user.type(slug, 'a-b');

    expect(slug.value).toBe('a-b');
    expect(slug.value).not.toBe('ab');
  });

  it('normalizes a trailing hyphen when the field loses focus', async () => {
    const user = userEvent.setup();
    render(<SlugHarness />);
    const slug = screen.getByLabelText('Slug') as HTMLInputElement;

    await user.type(slug, 'a-');
    expect(slug.value).toBe('a-');

    await user.tab();

    expect(slug.value).toBe('a');
  });
});
