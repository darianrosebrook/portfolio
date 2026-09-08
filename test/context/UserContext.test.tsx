import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createClient as createSupabaseClient,
  type AuthChangeEvent,
  type Session,
  type User,
} from '@supabase/supabase-js';
import { UserProvider, useUser } from '@/context/UserContext';

const factory = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('@/utils/supabase/client', () => ({ createClient: factory.create }));
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const user = (id: string) => ({ id }) as User;
const session = (id: string) => ({ user: user(id) }) as Session;
const profile = (id: string, name: string) => ({ id, full_name: name });
let latest: ReturnType<typeof useUser>;
function Probe() {
  const snapshot = useUser();
  React.useEffect(() => {
    latest = snapshot;
  });
  return (
    <output>
      {JSON.stringify({
        user: snapshot.user?.id ?? null,
        name: snapshot.profile?.full_name ?? null,
        loading: snapshot.loading,
        error: snapshot.error,
      })}
    </output>
  );
}
const state = () => JSON.parse(screen.getByRole('status').textContent!);
function mount() {
  return render(
    <UserProvider>
      <Probe />
    </UserProvider>
  );
}
function harness() {
  const initial = deferred<{
    data: { user: User | null };
    error: Error | null;
  }>();
  const requests: ReturnType<
    typeof deferred<{
      data: ReturnType<typeof profile> | null;
      error: Error | null;
    }>
  >[] = [];
  let callback!: (event: AuthChangeEvent, session: Session | null) => unknown;
  const unsubscribe = vi.fn();
  const single = vi.fn(() => {
    const request = deferred<{
      data: ReturnType<typeof profile> | null;
      error: Error | null;
    }>();
    requests.push(request);
    return request.promise;
  });
  factory.create.mockReturnValue({
    auth: {
      getUser: () => initial.promise,
      onAuthStateChange: (listener: typeof callback) => {
        callback = listener;
        return { data: { subscription: { unsubscribe } } };
      },
    },
    from: () => ({ select: () => ({ eq: () => ({ single }) }) }),
  });
  return {
    initial,
    requests,
    single,
    unsubscribe,
    emit: (value: Session | null) =>
      callback(value ? 'TOKEN_REFRESHED' : 'SIGNED_OUT', value),
    initialEvent: (value: Session | null) => callback('INITIAL_SESSION', value),
  };
}
beforeEach(() => factory.create.mockReset());
afterEach(cleanup);
describe('UserProvider auth lifecycle', () => {
  it('returns from the auth callback before starting profile reads', async () => {
    const h = harness();
    mount();
    act(() => {
      expect(h.emit(session('writer'))).toBeUndefined();
      expect(h.single).not.toHaveBeenCalled();
    });
    await act(async () =>
      h.requests[0].resolve({ data: profile('writer', 'Writer'), error: null })
    );
    expect(state()).toEqual({
      user: 'writer',
      name: 'Writer',
      loading: false,
      error: null,
    });
  });
  it('validates the initial storage snapshot before displaying its user', async () => {
    const h = harness();
    mount();
    act(() => {
      h.initialEvent(session('unverified'));
    });
    expect(state()).toEqual({
      user: null,
      name: null,
      loading: true,
      error: null,
    });
    expect(h.single).not.toHaveBeenCalled();
    await act(async () =>
      h.initial.resolve({
        data: { user: null },
        error: new Error('Session expired'),
      })
    );
    expect(state()).toEqual({
      user: null,
      name: null,
      loading: false,
      error: 'Session expired',
    });
  });

  it('ignores initial validation that completes after sign-out', async () => {
    const h = harness();
    mount();
    act(() => {
      h.emit(null);
    });
    await act(async () =>
      h.initial.resolve({ data: { user: user('old') }, error: null })
    );
    expect(state()).toEqual({
      user: null,
      name: null,
      loading: false,
      error: null,
    });
    expect(h.single).not.toHaveBeenCalled();
  });
  it('does not restore an old profile after switching accounts', async () => {
    const h = harness();
    mount();
    act(() => {
      h.emit(session('old'));
    });
    act(() => {
      h.emit(session('new'));
    });
    await act(async () =>
      h.requests[1].resolve({
        data: profile('new', 'New writer'),
        error: null,
      })
    );
    await act(async () =>
      h.requests[0].resolve({
        data: profile('old', 'Old writer'),
        error: null,
      })
    );
    expect(state()).toEqual({
      user: 'new',
      name: 'New writer',
      loading: false,
      error: null,
    });
  });
  it('clears the old profile while loading a different account', async () => {
    const h = harness();
    mount();
    act(() => {
      h.emit(session('old'));
    });
    await act(async () =>
      h.requests[0].resolve({
        data: profile('old', 'Old writer'),
        error: null,
      })
    );
    act(() => {
      h.emit(session('new'));
    });
    expect(state()).toEqual({
      user: 'new',
      name: null,
      loading: true,
      error: null,
    });
  });
  it('does not let a refresh or its failure undo sign-out', async () => {
    const h = harness();
    mount();
    act(() => {
      h.emit(session('writer'));
    });
    await act(async () =>
      h.requests[0].resolve({ data: profile('writer', 'Writer'), error: null })
    );
    let refresh!: Promise<void>;
    act(() => {
      refresh = latest.refreshProfile();
    });
    act(() => {
      h.emit(null);
    });
    await act(async () => {
      h.requests[1].reject(new Error('Network unavailable'));
      await refresh;
    });
    expect(state()).toEqual({
      user: null,
      name: null,
      loading: false,
      error: null,
    });
  });
  it('retains the newest profile when concurrent refreshes resolve out of order', async () => {
    const h = harness();
    mount();
    act(() => {
      h.emit(session('writer'));
    });
    let refresh!: Promise<void>;
    act(() => {
      refresh = latest.refreshProfile();
    });
    await act(async () => {
      h.requests[1].resolve({ data: profile('writer', 'Latest'), error: null });
      await refresh;
    });
    await act(async () =>
      h.requests[0].resolve({
        data: profile('writer', 'Obsolete'),
        error: null,
      })
    );
    expect(state()).toEqual({
      user: 'writer',
      name: 'Latest',
      loading: false,
      error: null,
    });
  });
  it('reports a current profile failure and allows successful retry', async () => {
    const h = harness();
    mount();
    await act(async () =>
      h.initial.resolve({ data: { user: user('writer') }, error: null })
    );
    await act(async () =>
      h.requests[0].resolve({
        data: null,
        error: new Error('Profile unavailable'),
      })
    );
    expect(state()).toEqual({
      user: 'writer',
      name: null,
      loading: false,
      error: 'Profile unavailable',
    });
    let refresh!: Promise<void>;
    act(() => {
      refresh = latest.refreshProfile();
    });
    expect(state().loading).toBe(true);
    await act(async () => {
      h.requests[1].resolve({
        data: profile('writer', 'Recovered'),
        error: null,
      });
      await refresh;
    });
    expect(state()).toEqual({
      user: 'writer',
      name: 'Recovered',
      loading: false,
      error: null,
    });
  });
  it('unsubscribes on unmount and does not start reads from a late callback', () => {
    const h = harness();
    const view = mount();
    view.unmount();
    h.emit(session('writer'));
    expect(h.unsubscribe).toHaveBeenCalledTimes(1);
    expect(h.single).not.toHaveBeenCalled();
  });
  it('completes a real SDK token refresh and authenticated profile query', async () => {
    const authUser = {
      id: 'writer',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'writer@example.test',
      app_metadata: {},
      user_metadata: {},
      created_at: '2026-01-01T00:00:00Z',
    };
    const accessToken = `e30.${btoa(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: 'writer',
      })
    )
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')}.c2ln`;
    let name = 'Initial';
    const network = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/auth/v1/user'))
        return new Response(JSON.stringify(authUser), { status: 200 });
      if (url.includes('/auth/v1/token'))
        return new Response(
          JSON.stringify({
            access_token: accessToken,
            refresh_token: 'refreshed-token',
            token_type: 'bearer',
            expires_in: 3600,
            user: authUser,
          }),
          { status: 200 }
        );
      if (url.includes('/rest/v1/profiles'))
        return new Response(JSON.stringify(profile('writer', name)), {
          status: 200,
        });
      throw new Error(`Unexpected request: ${url}`);
    });
    const client = createSupabaseClient(
      'https://auth.example.test',
      'public-test-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
          storageKey: 'provider-lifecycle-test',
        },
        global: { fetch: network },
      }
    );
    const { error: setupError } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: 'initial-token',
    });
    expect(setupError).toBeNull();
    factory.create.mockReturnValue(client);
    mount();
    await waitFor(() => expect(state().name).toBe('Initial'));
    name = 'After token refresh';
    let refreshed = false;
    void client.auth.refreshSession().then(({ error }) => {
      if (!error) refreshed = true;
    });
    await waitFor(() => {
      expect(refreshed).toBe(true);
      expect(state()).toEqual({
        user: 'writer',
        name: 'After token refresh',
        loading: false,
        error: null,
      });
    });
    client.auth.stopAutoRefresh();
  });
});
