'use server';

import { createClient } from './server';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Checks for an active user session.
 * @returns {Promise<Session | null>} A promise that resolves to the user session if it exists, otherwise null.
 */
export async function checkForAuth() {
  const client = await createClient();
  const {
    data: { session },
    error,
  } = await client.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
  }
  if (session) {
    return session;
  } else {
    return noStore;
  }
}
