-- Tighten public SELECT policies so drafts and working* columns are not
-- readable by anonymous (or non-author) callers via the Supabase client.
-- Apply in the Supabase SQL editor / migration pipeline after review.

-- case_studies: replace unrestricted public read
DROP POLICY IF EXISTS "Allow public read access to case_studies" ON public.case_studies;

CREATE POLICY "Allow published or author read access to case_studies"
ON public.case_studies
FOR SELECT
USING (
  status = 'published'
  OR auth.uid() = author
);

-- articles: ensure the same published-or-author rule (idempotent if already present)
DROP POLICY IF EXISTS "Allow public read access to articles" ON public.articles;
DROP POLICY IF EXISTS "Allow published or author read access to articles" ON public.articles;

CREATE POLICY "Allow published or author read access to articles"
ON public.articles
FOR SELECT
USING (
  status = 'published'
  OR auth.uid() = author
);
