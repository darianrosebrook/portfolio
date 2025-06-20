-- Enable RLS for articles and case_studies tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- ARTICLES RLS POLICIES
-- 1. Allow public read access to all articles
CREATE POLICY "Allow public read access to articles"
ON public.articles
FOR SELECT
USING (true);

-- 2. Allow authenticated users to insert their own articles
CREATE POLICY "Allow authenticated users to insert articles"
ON public.articles
FOR INSERT
WITH CHECK (auth.uid() = author);

-- 3. Allow authors to update their own articles
CREATE POLICY "Allow authors to update their own articles"
ON public.articles
FOR UPDATE
USING (auth.uid() = author)
WITH CHECK (auth.uid() = author);

-- 4. Allow authors to delete their own articles
CREATE POLICY "Allow authors to delete their own articles"
ON public.articles
FOR DELETE
USING (auth.uid() = author);


-- CASE STUDIES RLS POLICIES
-- 1. Allow public read access to all case_studies
CREATE POLICY "Allow public read access to case_studies"
ON public.case_studies
FOR SELECT
USING (true);

-- 2. Allow authenticated users to insert their own case_studies
CREATE POLICY "Allow authenticated users to insert case_studies"
ON public.case_studies
FOR INSERT
WITH CHECK (auth.uid() = author);

-- 3. Allow authors to update their own case_studies
CREATE POLICY "Allow authors to update their own case_studies"
ON public.case_studies
FOR UPDATE
USING (auth.uid() = author)
WITH CHECK (auth.uid() = author);

-- 4. Allow authors to delete their own case_studies
CREATE POLICY "Allow authors to delete their own case_studies"
ON public.case_studies
FOR DELETE
USING (auth.uid() = author); 