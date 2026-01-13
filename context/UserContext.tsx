'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the supabase client to ensure stability across renders
  // Note: createBrowserClient is already a singleton, but this ensures
  // we have a stable reference for the effect dependencies
  const supabase = useMemo(() => createClient(), []);

  // Memoize fetchProfile to avoid stale closures
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          return null;
        }

        return data;
      } catch (err) {
        console.error('Error in fetchProfile:', err);
        return null;
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [user, fetchProfile]);

    useEffect(() => {
    let isMounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        // First try getUser() which validates the session with the server
        // This is more reliable than getSession() which only reads from storage
        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          // If getUser fails, fall back to getSession for cached data
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              'getUser failed, falling back to getSession:',
              userError.message
            );
          }
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Error getting session:', sessionError);
            if (isMounted) {
              setError(sessionError.message);
              setLoading(false);
            }
            return;
          }

          if (session?.user && isMounted) {
            setUser(session.user);
            const profileData = await fetchProfile(session.user.id);
            if (isMounted) {
              setProfile(profileData);
            }
          }
        } else if (authUser && isMounted) {
          setUser(authUser);
          const profileData = await fetchProfile(authUser.id);
          if (isMounted) {
            setProfile(profileData);
          }
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to get session'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          setLoading(true);
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profileData);
            setLoading(false);
          }
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }

        setError(null);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

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
