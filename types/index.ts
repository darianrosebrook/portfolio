import { Database } from './supabase';
import { JSONContent } from '@tiptap/core';

export type Article = Database['public']['Tables']['articles']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export type ArticleBody = JSONContent;
