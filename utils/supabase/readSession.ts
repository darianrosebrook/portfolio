'use server';

import { createClient } from './server';

/**
 * Checks for a verified authenticated user.
 *
 * Server code must not trust `auth.getSession()` because it reads cookie
 * storage without guaranteeing token revalidation. Verified claims validate
 * the JWT signature and are safe for auth checks.
 *
 * @returns {Promise<boolean>} Whether a verified authenticated user exists.
 */
export async function checkForAuth(): Promise<boolean> {
  const client = await createClient();
  const { data, error } = await client.auth.getClaims();
  if (error) {
    console.error('Error verifying auth claims:', error);
  }

  return Boolean(data?.claims?.sub);
}
