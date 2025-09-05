import { Database } from './supabase';
import { JSONContent } from '@tiptap/core';

export type Article = Database['public']['Tables']['articles']['Row'];
export type CaseStudy = Database['public']['Tables']['case_studies']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export type ArticleBody = JSONContent;

// Bluesky types
export type {
  BlueskyProfile,
  BlueskyAuthor,
  BlueskyPostRecord,
  BlueskyPost,
  BlueskyFeedResponse,
  BlueskyEmbed,
  BlueskyVideoEmbed,
  BlueskyImageEmbed,
  BlueskyExternalEmbed,
} from './bluesky';
