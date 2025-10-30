/**
 * Environment variable utility
 * Provides type-safe access to environment variables with validation
 * @author @darianrosebrook
 */

interface Environment {
  nextPublicSupabaseUrl: string;
  nextPublicSupabaseAnonKey: string;
  nodeEnv: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_VERCEL_URL?: string;
}

const validateEnvVar = (
  key: string,
  value: string | undefined,
  fallback?: string
): string => {
  if (!value) {
    if (fallback) {
      if (process.env.NODE_ENV !== 'production') {
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

// Warn if using placeholder values
// if (
//   process.env.NODE_ENV !== 'test' &&
//   (supabaseUrl.includes('placeholder') ||
//     supabaseAnonKey === 'placeholder_anon_key')
// ) {
//   console.error(
//     '\n' +
//       '================================================\n' +
//       'WARNING: Using placeholder Supabase credentials!\n' +
//       'Database operations will fail.\n' +
//       'Create a .env.local file with real credentials.\n' +
//       'See .env.local.example for template.\n' +
//       '================================================\n'
//   );
// }

export const env: Environment = {
  // Client-side variables (available in browser via NEXT_PUBLIC_ prefix)
  nextPublicSupabaseUrl: supabaseUrl,
  nextPublicSupabaseAnonKey: supabaseAnonKey,

  nodeEnv: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
};
