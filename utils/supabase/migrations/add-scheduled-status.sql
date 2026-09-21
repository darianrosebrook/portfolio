-- Add the scheduled member to the status enum.
--
-- An item that is waiting to publish on a date is NOT a draft: it carries
-- scheduled_at and publishes itself at that time. The enum is where that state
-- belongs, so the whole app can say "scheduled" rather than inferring it from a
-- date being set.
--
-- NOT APPLIED. Apply with: supabase db push    (or paste into the Supabase SQL
-- editor). ALTER TYPE ... ADD VALUE cannot be undone, so this is a one-way
-- change: the member stays even if the feature is withdrawn. Postgres also
-- refuses to use a newly added enum value in the same transaction that adds it,
-- so run this statement on its own, before any code or script inserts a
-- 'scheduled' row.
--
-- Per docs/theory: authority for a status is the schema, not a rendered string.
-- Adding the member here is what licenses the UI, the filters and the executor
-- to speak in 'scheduled'.

ALTER TYPE public.article_status ADD VALUE IF NOT EXISTS 'scheduled';

-- ROLLBACK
-- Postgres cannot remove an enum member. To stop using it without a rewrite of
-- the type: update every row that holds 'scheduled' back to 'draft' and clear
-- scheduled_at, then stop writing the member.
-- UPDATE public.articles     SET status = 'draft', scheduled_at = NULL WHERE status = 'scheduled';
-- UPDATE public.case_studies SET status = 'draft', scheduled_at = NULL WHERE status = 'scheduled';
