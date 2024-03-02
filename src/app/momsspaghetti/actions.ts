"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "../../../utils/supabase/server";

export async function login() {
  const client = createClient();
  console.log('clicking login button');
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL}/auth/callback` },
  });
  if (error) {
    console.error('Error logging in:', error);
  } else {
    revalidatePath('/private');
  }
}
export async function signOut() {
  const client = createClient();
  const { error } = await client.auth.signOut();
  if (error) {
    console.error('Error logging out:', error);
  } else {
    revalidatePath('/');
  }
}