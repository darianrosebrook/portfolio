// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from '@/app/ha/actions';
const boundary = vi.hoisted(() => ({
  create: vi.fn(),
  oauth: vi.fn(),
  cookie: vi.fn(),
  header: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock('@/utils/supabase/server', () => ({ createClient: boundary.create }));
vi.mock('@/utils/env', () => ({
  env: { NEXT_PUBLIC_SITE_URL: 'https://portfolio.example.test' },
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: boundary.cookie }),
  headers: async () => ({ get: boundary.header }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  RedirectType: { replace: 'replace' },
  redirect: boundary.redirect,
}));
beforeEach(() => {
  vi.resetAllMocks();
  boundary.create.mockResolvedValue({
    auth: { signInWithOAuth: boundary.oauth },
  });
  boundary.oauth.mockResolvedValue({
    data: { url: 'https://accounts.example.test/sign-in' },
    error: null,
  });
  boundary.redirect.mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());
function form(next: string) {
  const data = new FormData();
  data.set('next', next);
  return data;
}
const next = '/dashboard/articles/recovered?tab=preview';
describe('login action recovery', () => {
  it('starts OAuth with the explicit retry destination ahead of stale cookies', async () => {
    boundary.cookie.mockReturnValue({ value: '/old-location' });
    await expect(login(form(next))).rejects.toThrow(
      'REDIRECT:https://accounts.example.test/sign-in'
    );
    const callback = new URL(
      boundary.oauth.mock.calls[0][0].options.redirectTo
    );
    expect(callback.origin).toBe('https://portfolio.example.test');
    expect(callback.pathname).toBe('/auth/callback');
    expect(callback.searchParams.get('next')).toBe(next);
    expect(boundary.redirect).toHaveBeenCalledTimes(1);
  });
  it('retains ordinary login deep links from the return cookie', async () => {
    boundary.cookie.mockReturnValue({ value: next });
    await expect(login()).rejects.toThrow(
      'REDIRECT:https://accounts.example.test/sign-in'
    );
    expect(
      new URL(
        boundary.oauth.mock.calls[0][0].options.redirectTo
      ).searchParams.get('next')
    ).toBe(next);
  });
  it('retains a login deep link from the referring page when no cookie exists', async () => {
    boundary.header.mockReturnValue(
      `https://portfolio.example.test/ha?${new URLSearchParams({ next })}`
    );
    await expect(login()).rejects.toThrow(
      'REDIRECT:https://accounts.example.test/sign-in'
    );
    expect(
      new URL(
        boundary.oauth.mock.calls[0][0].options.redirectTo
      ).searchParams.get('next')
    ).toBe(next);
  });
  it.each(['rejected', 'network', 'missing-url', 'client'])(
    'shows an actionable retry page when OAuth fails: %s',
    async (failure) => {
      if (failure === 'rejected')
        boundary.oauth.mockResolvedValue({
          data: { url: null },
          error: new Error('Private provider detail'),
        });
      if (failure === 'network')
        boundary.oauth.mockRejectedValue(new Error('Offline'));
      if (failure === 'missing-url')
        boundary.oauth.mockResolvedValue({ data: { url: null }, error: null });
      if (failure === 'client')
        boundary.create.mockRejectedValue(new Error('No client'));
      await expect(login(form(next))).rejects.toThrow(
        'REDIRECT:/auth/auth-code-error?'
      );
      const error = new URL(
        boundary.redirect.mock.calls[0][0],
        'https://portfolio.example.test'
      );
      expect(error.searchParams.get('next')).toBe(next);
      expect(error.searchParams.size).toBe(1);
    }
  );
  it('sanitizes an explicit hostile destination before retry', async () => {
    boundary.oauth.mockRejectedValue(new Error('Offline'));
    await expect(login(form('//attacker.example'))).rejects.toThrow(
      'REDIRECT:/auth/auth-code-error?next=%2F'
    );
    expect(boundary.oauth.mock.calls[0][0].options.redirectTo).toBe(
      'https://portfolio.example.test/auth/callback'
    );
  });
});
