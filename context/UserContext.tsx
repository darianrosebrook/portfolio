'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { type User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { Profile } from '@/types';

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [identity, setIdentity] = useState<{ user: User | null }>({
    user: null,
  });
  const user = identity.user;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const activeUserId = useRef<string | null>(null);
  const profileRequest = useRef(0);
  const supabase = useMemo(() => createClient(), []);

  const refreshProfile = useCallback(async () => {
    const userId = activeUserId.current;
    if (!mounted.current || !userId) return;

    const request = ++profileRequest.current;
    const isCurrent = () =>
      mounted.current &&
      profileRequest.current === request &&
      activeUserId.current === userId;

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (fetchError) throw fetchError;
      if (isCurrent()) setProfile(data);
    } catch (err) {
      if (isCurrent()) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch profile'
        );
      }
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    mounted.current = true;
    let disposed = false;
    let authRevision = 0;

    const invalidateProfiles = () => {
      ++profileRequest.current;
    };
    const applyUser = (authUser: User | null) => {
      if (disposed) return;
      // Invalidate reads immediately, before React processes the next effect.
      invalidateProfiles();
      if (activeUserId.current !== (authUser?.id ?? null)) setProfile(null);
      activeUserId.current = authUser?.id ?? null;
      setIdentity({ user: authUser });
      setLoading(Boolean(authUser));
      setError(null);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION is a storage snapshot; let getUser validate it.
      if (event === 'INITIAL_SESSION') return;
      ++authRevision;
      // Supabase awaits subscribers while holding its auth lock. Keep this
      // callback synchronous; the identity effect performs profile I/O later.
      applyUser(session?.user ?? null);
    });

    const initialRevision = authRevision;
    void supabase.auth
      .getUser()
      .then(({ data: { user: authUser }, error: userError }) => {
        if (disposed || authRevision !== initialRevision) return;
        applyUser(userError ? null : authUser);
        if (userError) setError(userError.message);
      })
      .catch((err: unknown) => {
        if (disposed || authRevision !== initialRevision) return;
        applyUser(null);
        setError(err instanceof Error ? err.message : 'Failed to get session');
      });

    return () => {
      disposed = true;
      mounted.current = false;
      invalidateProfiles();
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (identity.user) void refreshProfile();
  }, [identity, refreshProfile]);

  const contextValue: UserContextType = useMemo(
    () => ({
      user,
      profile,
      loading,
      error,
      refreshProfile,
    }),
    [user, profile, loading, error, refreshProfile]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

/**
 * Hook to get user profile data with safe defaults
 */
export const useProfile = () => {
  const { profile, loading, error } = useUser();

  return {
    profile,
    loading,
    error,
    displayName: profile?.full_name || profile?.username || 'User',
    avatar: profile?.avatar_url,
    bio: profile?.bio,
    occupation: profile?.occupation,
    socialMedia: profile?.social_media || [],
    isPublic: profile?.privacy === 'public',
  };
};
