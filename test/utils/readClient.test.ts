import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The read client exists so public pages can be cached. Two properties make that
 * safe, and both are load-bearing:
 *
 *  - It never touches request cookies. A single `cookies()` call anywhere in a
 *    route forces Next into dynamic rendering, so ISR silently stops working.
 *  - It binds the publishable (anon) key, never the secret key. A service-role
 *    client here would bypass RLS entirely, and every row it could reach would be
 *    written into a shared cache — turning the cache into a data-leak vector.
 */

const cookiesMock = vi.hoisted(() => vi.fn());

type SupabaseClientOptions = {
  auth?: { persistSession?: boolean; autoRefreshToken?: boolean };
};

const createSupabaseClientMock = vi.hoisted(() =>
  vi.fn((_url: string, _key: string, _options?: SupabaseClientOptions) => ({
    from: vi.fn(),
  }))
);

// If the read client ever imports next/headers, this mock records the call.
vi.mock('next/headers', () => ({
  cookies: cookiesMock,
  headers: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: createSupabaseClientMock,
}));

const SECRET_SENTINEL = 'sb_secret_MUST_NOT_APPEAR_IN_READ_CLIENT';
const PUBLISHABLE_SENTINEL = 'sb_publishable_expected';

vi.mock('@/utils/env', () => ({
  env: {
    nextPublicSupabaseUrl: 'https://example.supabase.co',
    nextPublicSupabasePublishableKey: PUBLISHABLE_SENTINEL,
    supabaseSecretKey: SECRET_SENTINEL,
  },
}));

beforeEach(() => {
  cookiesMock.mockClear();
  createSupabaseClientMock.mockClear();
});

async function loadCreateReadClient() {
  const mod = await import('@/utils/supabase/readClient');
  return mod.createReadClient;
}

describe('createReadClient', () => {
  it('never reads request cookies, so callers stay statically renderable', async () => {
    const createReadClient = await loadCreateReadClient();

    createReadClient();

    // This is the whole reason the module exists. If it regresses, ISR keeps
    // "working" in tests while every cached route silently becomes dynamic.
    expect(cookiesMock).not.toHaveBeenCalled();
  });

  it('binds the publishable key', async () => {
    const createReadClient = await loadCreateReadClient();

    createReadClient();

    expect(createSupabaseClientMock).toHaveBeenCalledTimes(1);
    const [url, key] = createSupabaseClientMock.mock.calls[0];
    expect(url).toBe('https://example.supabase.co');
    expect(key).toBe(PUBLISHABLE_SENTINEL);
  });

  it('never passes the secret key in any argument', async () => {
    const createReadClient = await loadCreateReadClient();

    createReadClient();

    // Checked across the whole serialized argument list rather than just the key
    // position, so smuggling it through options (e.g. a global Authorization
    // header) also fails.
    const serializedArgs = JSON.stringify(
      createSupabaseClientMock.mock.calls[0]
    );
    expect(serializedArgs).not.toContain(SECRET_SENTINEL);
    expect(serializedArgs).not.toContain('sb_secret');
  });

  it('persists no session and refreshes no token', async () => {
    const createReadClient = await loadCreateReadClient();

    createReadClient();

    const options = createSupabaseClientMock.mock.calls[0][2];
    expect(options?.auth?.persistSession).toBe(false);
    expect(options?.auth?.autoRefreshToken).toBe(false);
  });

  it('returns the constructed client', async () => {
    const createReadClient = await loadCreateReadClient();

    // Guards against the factory silently returning undefined, which would make
    // the assertions above pass while every caller crashed.
    expect(createReadClient()).toBeDefined();
  });
});
