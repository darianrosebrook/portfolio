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