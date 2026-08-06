-- Idempotent record of author-scoped content RLS (including DELETE policies
-- that previously lived only in the deleted add-rls-to-articles.sql history).
-- Also tightens profiles UPDATE with an explicit WITH CHECK.

-- ---------------------------------------------------------------------------
-- articles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authors to delete their own articles" ON public.articles;
CREATE POLICY "Allow authors to delete their own articles"
ON public.articles
FOR DELETE
USING (auth.uid() = author);

-- ---------------------------------------------------------------------------
-- case_studies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authors to delete their own case_studies" ON public.case_studies;
CREATE POLICY "Allow authors to delete their own case_studies"
ON public.case_studies
FOR DELETE
USING (auth.uid() = author);

-- ---------------------------------------------------------------------------
-- profiles: explicit WITH CHECK so column rewrites stay self-scoped
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
