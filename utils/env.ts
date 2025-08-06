/**
 * Environment variable utility
 * Provides type-safe access to environment variables with validation
 */

interface Environment {
  supabaseUrl: string;
  supabaseAnonKey: string;
  nextPublicSupabaseUrl: string;
  nextPublicSupabaseAnonKey: string;
  nodeEnv: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_VERCEL_URL?: string;
}

const validateEnvVar = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env: Environment = {
  supabaseUrl: validateEnvVar('SUPABASE_URL', process.env.SUPABASE_URL),
  supabaseAnonKey: validateEnvVar(
    'SUPABASE_ANON_KEY',
    process.env.SUPABASE_ANON_KEY
  ),
  nextPublicSupabaseUrl: validateEnvVar(
    'NEXT_PUBLIC_SUPABASE_URL',
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ),
  nextPublicSupabaseAnonKey: validateEnvVar(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
  nodeEnv: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
};
