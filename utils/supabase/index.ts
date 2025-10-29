/**
 * Supabase Utilities
 *
 * Database client setup, authentication, profile management,
 * and content synchronization utilities for Supabase.
 */

// Client and server setup
export { createClient } from './client';
export { createClient as createServerClient } from './server';

// Authentication utilities
export { checkForAuth } from './readSession';
export { updateSession } from './middleware';

// Profile management
export {
  getCurrentUserProfile,
  getPublicProfile,
  updateUserProfile,
} from './profile';

// Content utilities
export { extractImageUrls, syncArticleImageUsage } from './article-cleanup';

// Media types
export type { Media, MediaType } from './upload';
