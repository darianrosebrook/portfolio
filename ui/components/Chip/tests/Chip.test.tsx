import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../../../test/test-utils';
import Chip from '../Chip';

describe('Chip', () => {
  it('renders as a button by default', () => {
    render(<Chip>Filter</Chip>);

    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
  });

  it('passes click events to button chips', () => {
    const onClick = vi.fn();

    render(<Chip onClick={onClick}>Dismiss</Chip>);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders anchor chips when an href is provided', () => {
    render(
      <Chip as="a" href="/work">
        Work
      </Chip>
    );

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute(
      'href',
      '/work'
    );
  });
});
