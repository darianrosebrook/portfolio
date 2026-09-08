import { getSafeRedirectPath } from '@/utils/supabase/redirect';

/** Preserve the destination without reflecting provider errors or credentials. */
export function getAuthErrorPath(next: string | null): string {
  const params = new URLSearchParams({ next: getSafeRedirectPath(next) });
  return `/auth/auth-code-error?${params.toString()}`;
}
