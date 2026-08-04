import { createClient } from './server';
import { Profile } from '@/types';

/**
 * Gets the current user's profile data.
 * Server-only helper (not a public server action).
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error getting user:', userError);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return null;
  }

  return profile;
}

/**
 * Gets a public profile by username.
 * Server-only helper (not a public server action).
 */
export async function getPublicProfile(
  username: string
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .eq('privacy', 'public')
    .single();

  if (error) {
    console.error('Error fetching public profile:', error);
    return null;
  }

  return profile;
}
