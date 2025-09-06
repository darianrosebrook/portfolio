'use server';

import { createClient } from './server';
import { Profile } from '@/types';

/**
 * Gets the current user's profile data
 * @returns Promise<Profile | null>
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error getting user:', userError);
    return null;
  }

  // Get the user's profile
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
 * Gets a public profile by username
 * @param username - The username to look up
 * @returns Promise<Profile | null>
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

/**
 * Updates the current user's profile
 * @param updates - Partial profile data to update
 * @returns Promise<Profile | null>
 */
export async function updateUserProfile(
  updates: Partial<Profile>
): Promise<Profile | null> {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error getting user:', userError);
    return null;
  }

  // Update the profile
  const { data: profile, error: updateError } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating profile:', updateError);
    return null;
  }

  return profile;
}
