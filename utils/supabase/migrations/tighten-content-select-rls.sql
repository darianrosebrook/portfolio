-- Tighten public SELECT policies so drafts and working* columns are not
-- readable by anonymous (or non-author) callers via the Supabase client.
-- Also remove duplicate / overly permissive mutation policies on articles.
-- Apply in the Supabase SQL editor / migration pipeline after review.

-- case_studies: replace unrestricted public read
DROP POLICY IF EXISTS "Allow public read access to case_studies" ON public.case_studies;
DROP POLICY IF EXISTS "Allow published or author read access to case_studies" ON public.case_studies;

CREATE POLICY "Allow published or author read access to case_studies"
ON public.case_studies
FOR SELECT
USING (
  status = 'published'
  OR auth.uid() = author
);

-- articles: drop ALL known unrestricted / duplicate policies before recreating
DROP POLICY IF EXISTS "Allow public read access to articles" ON public.articles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.articles;
DROP POLICY IF EXISTS "Allow published or author read access to articles" ON public.articles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.articles;
DROP POLICY IF EXISTS "Edit if author" ON public.articles;

CREATE POLICY "Allow published or author read access to articles"
ON public.articles
FOR SELECT
USING (
  status = 'published'
  OR auth.uid() = author
);

-- Keep a single author-scoped insert policy (drop the WITH CHECK (true) duplicate).
-- If "Allow authenticated users to insert articles" already exists with
-- auth.uid() = author, leave it; otherwise recreate.
DROP POLICY IF EXISTS "Allow authenticated users to insert articles" ON public.articles;

CREATE POLICY "Allow authenticated users to insert articles"
ON public.articles
FOR INSERT
WITH CHECK (auth.uid() = author);

-- Keep a single author-scoped update policy.
DROP POLICY IF EXISTS "Allow authors to update their own articles" ON public.articles;

CREATE POLICY "Allow authors to update their own articles"
ON public.articles
FOR UPDATE
USING (auth.uid() = author)
WITH CHECK (auth.uid() = author);
