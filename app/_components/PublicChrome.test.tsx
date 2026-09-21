import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockPathname = vi.fn(() => '/');

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

import { PublicChrome } from './PublicChrome';

function renderChrome(pathname: string) {
  mockPathname.mockReturnValue(pathname);
  return render(
    <PublicChrome
      navbar={<nav aria-label="Site">marketing navbar</nav>}
      footer={<footer>marketing footer</footer>}
      cursor={<div data-testid="cursor">cursor</div>}
    >
      <main>page content</main>
    </PublicChrome>
  );
}

describe('PublicChrome', () => {
  it('drops the marketing navbar, footer and cursor inside the dashboard', () => {
    renderChrome('/dashboard');
    expect(screen.queryByLabelText('Site')).toBeNull();
    expect(screen.queryByText('marketing footer')).toBeNull();
    expect(screen.queryByTestId('cursor')).toBeNull();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('drops them on nested dashboard routes too', () => {
    renderChrome('/dashboard/case-studies/new');
    expect(screen.queryByText('marketing footer')).toBeNull();
    expect(screen.queryByLabelText('Site')).toBeNull();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('keeps the marketing chrome on public routes', () => {
    renderChrome('/articles/two-truths');
    expect(screen.getByLabelText('Site')).toBeInTheDocument();
    expect(screen.getByText('marketing footer')).toBeInTheDocument();
    expect(screen.getByTestId('cursor')).toBeInTheDocument();
  });

  it('does not treat a public path that merely starts with the word dashboard as the workspace', () => {
    renderChrome('/dashboard-notes');
    expect(screen.getByText('marketing footer')).toBeInTheDocument();
  });
});
