-- Create a new ENUM type for article status
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

-- Add the status column to the articles table
ALTER TABLE public.articles
ADD COLUMN status article_status DEFAULT 'draft';

-- Update the new status column based on the old draft column
UPDATE public.articles
SET status = CASE
    WHEN draft = true THEN 'draft'::article_status
    ELSE 'published'::article_status
END;

-- Remove the old draft column
ALTER TABLE public.articles
DROP COLUMN draft;

-- Make slug not nullable and unique for articles
ALTER TABLE public.articles
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.articles
ADD CONSTRAINT articles_slug_key UNIQUE (slug);


-- Apply similar changes to case_studies table

-- Add the status column to the case_studies table
ALTER TABLE public.case_studies
ADD COLUMN status article_status DEFAULT 'draft';

-- Update the new status column based on the old draft column
UPDATE public.case_studies
SET status = CASE
    WHEN draft = true THEN 'draft'::article_status
    ELSE 'published'::article_status
END;

-- Remove the old draft column
ALTER TABLE public.case_studies
DROP COLUMN draft;

-- Make slug not nullable and unique for case_studies
ALTER TABLE public.case_studies
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.case_studies
ADD CONSTRAINT case_studies_slug_key UNIQUE (slug); 