-- Add publish scheduling: an article or case study can carry a future publish time.
--
-- NOT APPLIED. This file is authored and tracked so the schema change is
-- reviewable and repeatable; it must be applied to the live project before any
-- application code reads scheduled_at. Until then the column does not exist and
-- a query selecting it would fail.
--
-- "Scheduled" is derived, not a new status: an item is scheduled when
-- status = 'draft' and scheduled_at is in the future. The article_status enum is
-- deliberately left alone because ALTER TYPE ... ADD VALUE cannot be undone.
--
-- Apply with: supabase db push    (or paste into the Supabase SQL editor)

-- ARTICLES
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- CASE STUDIES
ALTER TABLE public.case_studies
ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- The queue view reads what is due soonest; a partial index keeps it off the
-- null rows, which is every row until scheduling is used.
CREATE INDEX IF NOT EXISTS articles_scheduled_at_idx
ON public.articles (scheduled_at)
WHERE scheduled_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS case_studies_scheduled_at_idx
ON public.case_studies (scheduled_at)
WHERE scheduled_at IS NOT NULL;

-- ROLLBACK
-- DROP INDEX IF EXISTS public.articles_scheduled_at_idx;
-- DROP INDEX IF EXISTS public.case_studies_scheduled_at_idx;
-- ALTER TABLE public.articles DROP COLUMN IF EXISTS scheduled_at;
-- ALTER TABLE public.case_studies DROP COLUMN IF EXISTS scheduled_at;
