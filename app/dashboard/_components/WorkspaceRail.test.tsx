import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockPathname = vi.fn(() => '/dashboard');

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

import { WorkspaceRail } from './WorkspaceRail';

function renderRail(pathname: string) {
  mockPathname.mockReturnValue(pathname);
  return render(<WorkspaceRail />);
}

describe('WorkspaceRail', () => {
  it('lists every workspace section', () => {
    renderRail('/dashboard');
    for (const label of ['Overview', 'Articles', 'Case Studies', 'Profile']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('marks the overview active only on its own route', () => {
    renderRail('/dashboard');
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Articles' })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('marks a nested section active and the overview inactive', () => {
    renderRail('/dashboard/articles/the-prime-knows');
    expect(screen.getByRole('link', { name: 'Articles' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('marks the case-studies section active', () => {
    renderRail('/dashboard/case-studies/new');
    expect(screen.getByRole('link', { name: 'Case Studies' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('is a labelled navigation landmark', () => {
    renderRail('/dashboard');
    expect(
      screen.getByRole('navigation', { name: 'Workspace' })
    ).toBeInTheDocument();
  });
});
