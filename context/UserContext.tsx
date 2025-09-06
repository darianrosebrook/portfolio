'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
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

  const supabase = createClient();

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
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
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
        setError(err instanceof Error ? err.message : 'Failed to get session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (session?.user) {
        setUser(session.user);
        setLoading(true);
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        setLoading(false);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }

      setError(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: UserContextType = {
    user,
    profile,
    loading,
    error,
    refreshProfile,
  };

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
