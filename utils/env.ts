/**
 * Environment variable utility
 * Provides type-safe access to environment variables with validation
 * @author @darianrosebrook
 */

/**
 * Environment variables interface.
 *
 * Defines all expected environment variables with their types.
 * Required variables must be present, optional ones are marked with `?`.
 */
interface Environment {
  /** Supabase project URL (required) */
  nextPublicSupabaseUrl: string;
  /** Supabase anonymous/public key (required) */
  nextPublicSupabaseAnonKey: string;
  /** Node.js environment (development/production/test) */
  nodeEnv: string;
  /** Custom site URL override (optional) */
  NEXT_PUBLIC_SITE_URL?: string;
  /** Vercel deployment URL (optional, auto-set by Vercel) */
  NEXT_PUBLIC_VERCEL_URL?: string;
}

/**
 * Validate and normalize an environment variable.
 *
 * Ensures required environment variables are present and provides
 * fallback values for optional ones. Throws errors for missing required vars.
 *
 * @param key - Environment variable name
 * @param value - Current value of the environment variable
 * @param fallback - Optional fallback value for missing variables
 * @returns Validated environment variable value
 *
 * @throws Error if required variable is missing and no fallback provided
 */
const validateEnvVar = (
  key: string,
  value: string | undefined,
  fallback?: string
): string => {
  if (!value) {
    if (fallback) {
      // Only warn on server-side (browser warnings aren't actionable - vars need to be embedded at build time)
      if (
        process.env.NODE_ENV !== 'production' &&
        typeof window === 'undefined'
      ) {
        console.warn(
          `Warning: Using fallback for missing environment variable: ${key}`
        );
      }
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

/**
 * Get environment variables with proper client/server handling
 */
const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key];
  return validateEnvVar(key, value, fallback);
};

const supabaseUrl = getEnvVar(
  'NEXT_PUBLIC_SUPABASE_URL',
  'https://placeholder.supabase.co'
);
const supabaseAnonKey = getEnvVar(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'placeholder_anon_key'
);

// Warn if using placeholder values (server-side only)
// Browser warnings aren't actionable - NEXT_PUBLIC_* vars must be embedded at build time
// Note: File existence check removed in Next.js 16 to avoid Edge Runtime compatibility issues
if (
  typeof window === 'undefined' &&
  process.env.NODE_ENV !== 'test' &&
  (supabaseUrl.includes('placeholder') ||
    supabaseAnonKey === 'placeholder_anon_key')
) {
  const message =
    '\n' +
    '================================================\n' +
    'WARNING: Using placeholder Supabase credentials!\n' +
    'Database operations will fail.\n' +
    '\n' +
    'Create a .env.local file with real credentials:\n' +
    '  NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
    '  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n' +
    '\n' +
    'See .env.local.example for template.\n' +
    '================================================\n';

  console.error(message);
}

export const env: Environment = {
  // Client-side variables (available in browser via NEXT_PUBLIC_ prefix)
  nextPublicSupabaseUrl: supabaseUrl,
  nextPublicSupabaseAnonKey: supabaseAnonKey,

  nodeEnv: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
};
