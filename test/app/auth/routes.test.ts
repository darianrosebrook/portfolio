// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as callback } from '@/app/auth/callback/route';
import { GET as confirm } from '@/app/auth/confirm/route';

const boundary = vi.hoisted(() => ({
  create: vi.fn(),
  exchange: vi.fn(),
  verify: vi.fn(),
}));
vi.mock('@/utils/supabase/server', () => ({ createClient: boundary.create }));
vi.mock('@/utils/env', () => ({
  env: { NEXT_PUBLIC_SITE_URL: 'https://portfolio.example.test' },
}));

beforeEach(() => {
  vi.resetAllMocks();
  boundary.create.mockResolvedValue({
    auth: {
      exchangeCodeForSession: boundary.exchange,
      verifyOtp: boundary.verify,
    },
  });
  boundary.exchange.mockResolvedValue({ error: null });
  boundary.verify.mockResolvedValue({ error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());
function request(path: string, params: Record<string, string>) {
  return new NextRequest(
    `https://internal.example.test${path}?${new URLSearchParams(params)}`,
    { headers: { 'x-forwarded-host': 'attacker.example' } }
  );
}
function destination(response: Response) {
  return new URL(response.headers.get('location')!);
}
const next = '/dashboard/articles/draft-one?tab=preview#metadata';

const cases: {
  label: string;
  route: typeof callback | typeof confirm;
  path: string;
  params: Record<string, string>;
  method: typeof boundary.exchange;
}[] = [
  {
    label: 'OAuth',
    route: callback,
    path: '/auth/callback',
    params: { code: 'code-fixture' },
    method: boundary.exchange,
  },
  {
    label: 'email confirmation',
    route: confirm,
    path: '/auth/confirm',
    params: { token_hash: 'hash-fixture', type: 'email' },
    method: boundary.verify,
  },
];

describe.each(cases)('$label recovery', ({ route, path, params, method }) => {
  it('returns to the trusted destination after successful verification and clears its cookie', async () => {
    const response = await route(request(path, { ...params, next }));
    expect(destination(response).toString()).toBe(
      `https://portfolio.example.test${next}`
    );
    expect(response.headers.get('set-cookie')).toContain('auth_return_to=;');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });
  it('preserves the safe destination when authentication is rejected', async () => {
    method.mockResolvedValue({ error: new Error('private provider detail') });
    const response = await route(request(path, { ...params, next }));
    expect(destination(response).origin).toBe('https://portfolio.example.test');
    expect(destination(response).pathname).toBe('/auth/auth-code-error');
    expect(destination(response).searchParams.get('next')).toBe(next);
    expect(destination(response).toString()).not.toContain('private');
    expect(destination(response).toString()).not.toContain('fixture');
  });
  it('provides recovery when the verification request throws', async () => {
    method.mockRejectedValue(new Error('Network unavailable'));
    const response = await route(request(path, { ...params, next }));
    expect(destination(response).pathname).toBe('/auth/auth-code-error');
    expect(destination(response).searchParams.get('next')).toBe(next);
  });
  it('provides recovery when client initialization throws', async () => {
    boundary.create.mockRejectedValue(new Error('Client unavailable'));
    expect(
      destination(await route(request(path, { ...params, next }))).pathname
    ).toBe('/auth/auth-code-error');
  });
  it('provides recovery for a missing credential without calling authentication', async () => {
    const response = await route(request(path, { next }));
    expect(destination(response).pathname).toBe('/auth/auth-code-error');
    expect(destination(response).searchParams.get('next')).toBe(next);
    expect(boundary.create).not.toHaveBeenCalled();
  });
  it.each([
    'https://attacker.example',
    '//attacker.example',
    '/\\attacker.example',
    '/\t/attacker.example',
  ])(
    'rejects a hostile next path %s in success and failure redirects',
    async (hostile) => {
      expect(
        destination(
          await route(request(path, { ...params, next: hostile }))
        ).toString()
      ).toBe('https://portfolio.example.test/');
      method.mockResolvedValue({ error: new Error('Expired') });
      const retry = destination(
        await route(request(path, { ...params, next: hostile }))
      );
      expect(retry.origin).toBe('https://portfolio.example.test');
      expect(retry.searchParams.get('next')).toBe('/');
    }
  );
});

it('does not submit an unrecognized OTP type to verification', async () => {
  const response = await confirm(
    request('/auth/confirm', {
      token_hash: 'hash-fixture',
      type: 'admin',
      next,
    })
  );
  expect(destination(response).pathname).toBe('/auth/auth-code-error');
  expect(boundary.verify).not.toHaveBeenCalled();
});
