'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { env } from '@/utils/env';
import {
  AUTH_RETURN_TO_COOKIE,
  getSafeRedirectPath,
} from '@/utils/supabase/redirect';

/**
 * Resolves the site origin without a trailing slash.
 */
const getSiteOrigin = (): string => {
  const raw =
    env.NEXT_PUBLIC_SITE_URL ??
    env.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000';
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return new URL(withProtocol).origin;
};

async function resolvePostLoginPath(): Promise<string> {
  const cookieStore = await cookies();
  const fromCookie = getSafeRedirectPath(
    cookieStore.get(AUTH_RETURN_TO_COOKIE)?.value ?? null
  );
  if (fromCookie !== '/') {
    return fromCookie;
  }

  const referer = (await headers()).get('referer');
  if (!referer) {
    return '/';
  }

  try {
    const refUrl = new URL(referer);
    return getSafeRedirectPath(refUrl.searchParams.get('next'));
  } catch {
    return '/';
  }
}

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
 * Preserves a safe post-login path via the OAuth callback `next` param.
 */
export async function login() {
  const supabase = await createClient();
  const provider = 'google';
  const next = await resolvePostLoginPath();
  const redirectUrl = new URL('/auth/callback', getSiteOrigin());
  if (next !== '/') {
    redirectUrl.searchParams.set('next', next);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl.toString(),
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

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect('/ha?error=signup');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
