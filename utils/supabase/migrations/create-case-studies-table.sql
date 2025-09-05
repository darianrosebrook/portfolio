-- Create case_studies table with the same structure as articles
-- This migration creates the initial case_studies table structure

-- Create the article_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the case_studies table
CREATE TABLE IF NOT EXISTS public.case_studies (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    modified_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    status article_status DEFAULT 'draft',
    slug TEXT NOT NULL,
    headline TEXT,
    alternativeHeadline TEXT,
    description TEXT,
    keywords TEXT,
    author UUID REFERENCES public.profiles (id),
    editor UUID REFERENCES public.profiles (id),
    articleBody JSONB,
    articleSection TEXT,
    image TEXT,
    wordCount INTEGER,
    index INTEGER
);

-- Create unique constraint on slug
ALTER TABLE public.case_studies
ADD CONSTRAINT case_studies_slug_key UNIQUE (slug);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON public.case_studies (slug);

CREATE INDEX IF NOT EXISTS idx_case_studies_status ON public.case_studies (status);

CREATE INDEX IF NOT EXISTS idx_case_studies_published_at ON public.case_studies (published_at);

CREATE INDEX IF NOT EXISTS idx_case_studies_author ON public.case_studies (author);

-- Enable Row Level Security
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_studies
-- 1. Allow public read access to all case_studies
CREATE POLICY "Allow public read access to case_studies" ON public.case_studies FOR
SELECT USING (true);

-- 2. Allow authenticated users to insert their own case_studies
CREATE POLICY "Allow authenticated users to insert case_studies" ON public.case_studies FOR
INSERT
WITH
    CHECK (auth.uid () = author);

-- 3. Allow authors to update their own case_studies
CREATE POLICY "Allow authors to update their own case_studies" ON public.case_studies FOR
UPDATE USING (auth.uid () = author)
WITH
    CHECK (auth.uid () = author);

-- 4. Allow authors to delete their own case_studies
CREATE POLICY "Allow authors to delete their own case_studies" ON public.case_studies FOR DELETE USING (auth.uid () = author);

-- Create a function to automatically update modified_at
CREATE OR REPLACE FUNCTION update_case_studies_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update modified_at
DROP TRIGGER IF EXISTS trigger_update_case_studies_modified_at ON public.case_studies;

CREATE TRIGGER trigger_update_case_studies_modified_at
    BEFORE UPDATE ON public.case_studies
    FOR EACH ROW
    EXECUTE FUNCTION update_case_studies_modified_at();

-- Add comments for documentation
COMMENT ON
TABLE public.case_studies IS 'Case studies for work portfolio, similar to articles but for project showcases';

COMMENT ON COLUMN public.case_studies.articleBody IS 'TipTap JSON content for rich text editing';

COMMENT ON COLUMN public.case_studies.slug IS 'URL-friendly identifier, must be unique';

COMMENT ON COLUMN public.case_studies.status IS 'Publication status: draft, published, or archived';

COMMENT ON COLUMN public.case_studies.author IS 'UUID reference to profiles table for the author';

COMMENT ON COLUMN public.case_studies.editor IS 'UUID reference to profiles table for the editor';


