import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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

import { ContentCard } from './ContentCard';

const base = {
  href: '/dashboard/articles/two-truths',
  title: 'Two Truths: When Disagreement Is Not Error',
  status: 'draft' as const,
};

describe('ContentCard', () => {
  it('links the title to the item', () => {
    render(<ContentCard {...base} />);
    expect(screen.getByRole('link', { name: base.title })).toHaveAttribute(
      'href',
      base.href
    );
  });

  it('shows the cover image when the item has one', () => {
    const { container } = render(
      <ContentCard {...base} image="https://example.com/cover.jpg" />
    );
    // alt="" makes the decorative cover role="presentation", so query the DOM
    // rather than by role.
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('falls back to title initials when there is no cover, with no broken image', () => {
    const { container } = render(<ContentCard {...base} section="Process" />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('TT')).toBeInTheDocument();
    expect(container.querySelector('[data-section="Process"]')).not.toBeNull();
  });

  it('renders the status through the shared pill', () => {
    const { container } = render(
      <ContentCard {...base} status="published" changes />
    );
    const pill = container.querySelector('[data-status="published"]');
    expect(pill?.textContent).toMatch(/unpublished changes/i);
  });

  it('renders kind, section, date and word count in the meta line', () => {
    render(
      <ContentCard
        {...base}
        kind="Article"
        section="Artificial Intelligence"
        date="Sep 21, 2026"
        wordCount={3226}
      />
    );
    expect(screen.getByText('Article')).toBeInTheDocument();
    expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Sep 21, 2026')).toBeInTheDocument();
    expect(screen.getByText('3,226 words')).toBeInTheDocument();
  });

  it('carries no inline style attributes anywhere in the card', () => {
    const { container } = render(
      <ContentCard
        {...base}
        description="A description"
        kind="Article"
        section="Process"
        date="Sep 21, 2026"
        wordCount={10}
        actions={<button type="button">Edit</button>}
      />
    );
    expect(container.querySelectorAll('[style]')).toHaveLength(0);
  });

  it('renders the actions slot', () => {
    render(
      <ContentCard {...base} actions={<button type="button">Edit</button>} />
    );
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });
});
