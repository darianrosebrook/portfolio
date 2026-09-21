import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('is reachable by its accessible name and repeats it as a tooltip', () => {
    render(<IconButton icon="edit" label="Edit article" />);
    const button = screen.getByRole('button', { name: 'Edit article' });
    expect(button).toHaveAttribute('title', 'Edit article');
  });

  it('does not render the icon as content for assistive tech', () => {
    const { container } = render(<IconButton icon="delete" label="Delete" />);
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('marks the destructive variant', () => {
    render(<IconButton icon="delete" label="Delete" variant="danger" />);
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute(
      'data-variant',
      'danger'
    );
  });

  it('runs its handler', async () => {
    const onClick = vi.fn();
    render(<IconButton icon="duplicate" label="Duplicate" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Duplicate' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
