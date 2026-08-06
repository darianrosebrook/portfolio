-- FIX-APP-SEC-001 follow-ups from Supabase security advisors:
-- - Enable RLS on operation_log and revoke Data API grants
-- - Replace always-true article_tags / tags mutation policies
-- - Revoke anon/authenticated EXECUTE on SECURITY DEFINER RPCs
-- - Pin function search_path
-- - Replace delete_storage_object HTTP+service-role-key with storage.objects delete
-- - Stop public listing of public storage buckets (CDN URLs still work)
-- - Explicitly document access_level as locked (RLS on, no policies)

-- ---------------------------------------------------------------------------
-- operation_log: internal audit table — not for anon/authenticated clients
-- ---------------------------------------------------------------------------
ALTER TABLE public.operation_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.operation_log FROM anon, authenticated;

-- No policies: RLS denies all for roles that still have grants.
-- service_role bypasses RLS for trusted server jobs.

-- ---------------------------------------------------------------------------
-- access_level: lookup table kept locked (RLS on, no client policies)
-- ---------------------------------------------------------------------------
REVOKE ALL ON TABLE public.access_level FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- article_tags: author-scoped mutations; read published or own articles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated users to delete article_tags" ON public.article_tags;
DROP POLICY IF EXISTS "Allow authenticated users to insert article_tags" ON public.article_tags;
DROP POLICY IF EXISTS "Allow authenticated users to select article_tags" ON public.article_tags;
DROP POLICY IF EXISTS "Allow authenticated users to update article_tags" ON public.article_tags;

CREATE POLICY "Read article_tags for published or own articles"
ON public.article_tags
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.articles a
    WHERE a.id = article_tags.article_id
      AND (a.status = 'published' OR a.author = auth.uid())
  )
);

CREATE POLICY "Authors insert article_tags on own articles"
ON public.article_tags
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.articles a
    WHERE a.id = article_tags.article_id
      AND a.author = auth.uid()
  )
);

CREATE POLICY "Authors update article_tags on own articles"
ON public.article_tags
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.articles a
    WHERE a.id = article_tags.article_id
      AND a.author = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.articles a
    WHERE a.id = article_tags.article_id
      AND a.author = auth.uid()
  )
);

CREATE POLICY "Authors delete article_tags on own articles"
ON public.article_tags
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.articles a
    WHERE a.id = article_tags.article_id
      AND a.author = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- tags: public read; mutations only for users who author content
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated users to delete tags" ON public.tags;
DROP POLICY IF EXISTS "Allow authenticated users to insert tags" ON public.tags;
DROP POLICY IF EXISTS "Allow authenticated users to update tags" ON public.tags;

CREATE POLICY "Authors can insert tags"
ON public.tags
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.articles WHERE author = auth.uid())
  OR EXISTS (SELECT 1 FROM public.case_studies WHERE author = auth.uid())
);

CREATE POLICY "Authors can update tags"
ON public.tags
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.articles WHERE author = auth.uid())
  OR EXISTS (SELECT 1 FROM public.case_studies WHERE author = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.articles WHERE author = auth.uid())
  OR EXISTS (SELECT 1 FROM public.case_studies WHERE author = auth.uid())
);

CREATE POLICY "Authors can delete tags"
ON public.tags
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.articles WHERE author = auth.uid())
  OR EXISTS (SELECT 1 FROM public.case_studies WHERE author = auth.uid())
);

-- ---------------------------------------------------------------------------
-- SECURITY DEFINER: remove embedded service_role key; use storage catalog
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_storage_object(
  bucket text,
  object text,
  OUT status integer,
  OUT content text
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $function$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = bucket
    AND name = object;

  IF FOUND THEN
    status := 200;
    content := 'OK';
  ELSE
    status := 404;
    content := 'Not found';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    status := 500;
    content := SQLERRM;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_avatar(
  avatar_url text,
  OUT status integer,
  OUT content text
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  SELECT result.status, result.content
  INTO status, content
  FROM public.delete_storage_object('avatars', avatar_url) AS result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_old_avatar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  status int;
  content text;
  avatar_name text;
BEGIN
  IF coalesce(old.avatar_url, '') <> ''
     AND (tg_op = 'DELETE' OR (old.avatar_url <> coalesce(new.avatar_url, ''))) THEN
    avatar_name := old.avatar_url;
    SELECT result.status, result.content
    INTO status, content
    FROM public.delete_avatar(avatar_name) AS result;
    IF status <> 200 THEN
      RAISE WARNING 'Could not delete avatar: % %', status, content;
    END IF;
  END IF;
  IF tg_op = 'DELETE' THEN
    RETURN old;
  END IF;
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_old_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.profiles WHERE id = old.id;
  RETURN old;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_images()
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM article_images
  WHERE reference_count = 0
    AND updated_at < NOW() - INTERVAL '1 hour';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Trigger/internal helpers must not be callable via PostgREST as anon/authenticated.
REVOKE ALL ON FUNCTION public.delete_storage_object(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_avatar(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_old_avatar() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_old_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.delete_storage_object(text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_avatar(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_old_avatar() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_old_profile() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Pin search_path on leftover public helper if present (extension smoke test).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'install_available_extensions_and_test'
      AND pg_get_function_identity_arguments(p.oid) = ''
  ) THEN
    EXECUTE 'ALTER FUNCTION public.install_available_extensions_and_test() SET search_path = public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.install_available_extensions_and_test() FROM PUBLIC';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.install_available_extensions_and_test() FROM anon, authenticated';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Storage: public buckets keep CDN URLs; deny API listing via broad SELECT
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Article images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;

-- Prefer authenticated-only uploads (public INSERT duplicates are overly broad).
DROP POLICY IF EXISTS "Anyone can upload an article image." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;

-- Scope authenticated deletes to known CMS buckets (was unconstrained).
DROP POLICY IF EXISTS "Allow authenticated removal" ON storage.objects;

CREATE POLICY "Allow authenticated removal of article images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'article-images');

-- Authenticated avatar upload (replaces public INSERT). Article-images
-- INSERT remains covered by existing "Allow authenticated uploads".
CREATE POLICY "Allow authenticated avatar upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
