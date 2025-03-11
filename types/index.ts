import { Database } from './supabase';

export type Article = Database['public']['Tables']['articles']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
