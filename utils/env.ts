import { z } from 'zod';

/**
 * Environment variable schema validation
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Next.js environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required'),

  // Site configuration
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
});

/**
 * Validated environment variables
 * Use this instead of process.env to ensure type safety and validation
 */
export const env = envSchema.parse(process.env);

/**
 * Runtime environment validation
 * Call this in your app startup to ensure all env vars are valid
 */
export function validateEnvironment() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
}

// Type for validated environment
export type Environment = z.infer<typeof envSchema>;
