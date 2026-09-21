import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const refresh = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push }),
  usePathname: () => '/dashboard/articles',
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { ArticleCard } from './ArticleCard';

const article = {
  id: 1,
  slug: 'two-truths',
  headline: 'Two Truths',
  description: 'A description',
  status: 'published' as const,
  modified_at: '2026-09-21T00:00:00.000Z',
  published_at: null,
  wordCount: 3226,
  is_dirty: true,
  image: null,
  articleSection: 'Artificial Intelligence',
};

describe('ArticleCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    refresh.mockClear();
    push.mockClear();
  });

  it('renders through the shared card and status pill', () => {
    const { container } = render(<ArticleCard article={article} />);
    expect(screen.getByRole('link', { name: 'Two Truths' })).toHaveAttribute(
      'href',
      '/dashboard/articles/two-truths'
    );
    expect(
      container.querySelector('[data-status="published"]')?.textContent
    ).toMatch(/unpublished changes/i);
  });

  it('does not claim unpublished changes for a draft', () => {
    const { container } = render(
      <ArticleCard article={{ ...article, status: 'draft' }} />
    );
    expect(
      container.querySelector('[data-status="draft"]')?.textContent
    ).not.toMatch(/unpublished changes/i);
  });

  it('carries no inline style attributes', () => {
    const { container } = render(<ArticleCard article={article} />);
    expect(container.querySelectorAll('[style]')).toHaveLength(0);
  });

  it('duplicates through the API and refreshes', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));
    render(<ArticleCard article={article} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Duplicate article' })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/articles/two-truths/duplicate',
      { method: 'POST' }
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('confirms before deleting, then deletes and refreshes', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));
    const onDelete = vi.fn();
    render(<ArticleCard article={article} onDelete={onDelete} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete article' })
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/articles/two-truths', {
      method: 'DELETE',
    });
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('two-truths'));
    expect(refresh).toHaveBeenCalled();
  });
});
