# Database Migration Required

## Issue Fixed

The PATCH and PUT endpoints for `/api/case-studies/[slug]` and `/api/articles/[slug]` were failing with 500 errors because they were trying to update database columns that don't exist.

## Temporary Fix Applied

- Modified both API endpoints to save working draft data to the main fields instead of separate working fields
- This allows the autosave functionality to work immediately

## Migration Required

To enable proper draft functionality with separate working fields, run this SQL migration:

```sql
-- Add working draft columns for articles and case_studies

-- ARTICLES
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS workingBody jsonb,
ADD COLUMN IF NOT EXISTS workingHeadline text,
ADD COLUMN IF NOT EXISTS workingDescription text,
ADD COLUMN IF NOT EXISTS workingImage text,
ADD COLUMN IF NOT EXISTS workingKeywords text,
ADD COLUMN IF NOT EXISTS workingArticleSection text,
ADD COLUMN IF NOT EXISTS working_modified_at timestamptz,
ADD COLUMN IF NOT EXISTS is_dirty boolean DEFAULT false;

-- CASE STUDIES
ALTER TABLE public.case_studies
ADD COLUMN IF NOT EXISTS workingBody jsonb,
ADD COLUMN IF NOT EXISTS workingHeadline text,
ADD COLUMN IF NOT EXISTS workingDescription text,
ADD COLUMN IF NOT EXISTS workingImage text,
ADD COLUMN IF NOT EXISTS workingKeywords text,
ADD COLUMN IF NOT EXISTS workingArticleSection text,
ADD COLUMN IF NOT EXISTS working_modified_at timestamptz,
ADD COLUMN IF NOT EXISTS is_dirty boolean DEFAULT false;
```

This migration is available at: `utils/supabase/migrations/add-working-columns.sql`

## After Migration

Once the migration is applied:

1. Update the database types by regenerating them
2. Revert the API endpoints to use the working fields instead of main fields
3. Update the frontend to handle the separation between working and published content

## Files Modified

- `app/api/case-studies/[slug]/route.ts` - Fixed PATCH endpoint
- `app/api/articles/[slug]/route.ts` - Fixed PATCH endpoint
