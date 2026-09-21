import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from './StatusPill';

describe('StatusPill', () => {
  it('renders the status as its own text and exposes it as a data attribute', () => {
    const { container } = render(<StatusPill status="published" />);
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(container.querySelector('[data-status="published"]')).not.toBeNull();
  });

  it('does not mention changes on a clean item', () => {
    render(<StatusPill status="published" />);
    expect(screen.queryByText(/unpublished changes/i)).toBeNull();
  });

  it('carries "unpublished changes" inside the same pill rather than as a second badge', () => {
    const { container } = render(<StatusPill status="published" changes />);
    const pill = container.querySelector('[data-status="published"]');
    expect(pill).not.toBeNull();
    expect(pill?.textContent).toMatch(/published/i);
    expect(pill?.textContent).toMatch(/unpublished changes/i);
    // one status object per item: a single element holds the whole language
    expect(container.querySelectorAll('[data-status]')).toHaveLength(1);
  });

  it('supports the scheduled state used by the publish queue', () => {
    const { container } = render(<StatusPill status="scheduled" />);
    expect(container.querySelector('[data-status="scheduled"]')).not.toBeNull();
  });
});
