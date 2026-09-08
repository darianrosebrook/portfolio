import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import AuthCodeErrorPage from '@/app/auth/auth-code-error/page';
vi.mock('@/app/ha/actions', () => ({ login: vi.fn() }));
afterEach(cleanup);
describe('sign-in recovery page', () => {
  it('renders an actionable retry form that preserves the destination', async () => {
    render(
      await AuthCodeErrorPage({
        searchParams: Promise.resolve({
          next: '/dashboard/articles/draft-one',
        }),
      })
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      "We couldn't sign you in"
    );
    const retry = screen.getByRole('button', {
      name: 'Try Google sign-in again',
    });
    expect(
      retry
        .closest('form')
        ?.querySelector<HTMLInputElement>('input[name="next"]')?.value
    ).toBe('/dashboard/articles/draft-one');
    expect(
      screen.getByRole('link', { name: 'Return to the portfolio' })
    ).toHaveAttribute('href', '/');
  });
  it.each(['//attacker.example', ['//attacker.example', '/dashboard']])(
    'sanitizes untrusted retry input %s',
    async (next) => {
      render(
        await AuthCodeErrorPage({ searchParams: Promise.resolve({ next }) })
      );
      expect(
        screen
          .getByRole('button')
          .closest('form')
          ?.querySelector<HTMLInputElement>('input[name="next"]')?.value
      ).toBe('/');
    }
  );
});
