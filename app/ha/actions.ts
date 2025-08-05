'use server';

import { revalidatePath } from 'next/cache';
import { RedirectType, redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { env } from '@/utils/env';

const getURL = () => {
  let url =
    env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};
/**
 * Signs the user out and redirects to the homepage.
 */
export const signOutAction = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error);
  }
  return redirect('/');
};
/**
 * Initiates the OAuth login flow with Google.
 */
export async function login() {
  const supabase = await createClient();
  const provider = 'google';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getURL()}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url, RedirectType.replace);
  } else if (error) {
    console.error('Error logging in:', error);
  }
}

/**
 * Signs the user up with email and password.
 * @param {FormData} formData - The form data containing the user's email and password.
 */
export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
