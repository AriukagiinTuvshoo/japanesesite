-- Phase 2 database acceptance checks.
-- Run in Supabase SQL editor after migrations as a privileged operator.
-- These assertions are intentionally separate from migrations.

do $$
declare
  required text[] := array['content_sources','imports','vocabulary','vocabulary_readings','vocabulary_senses','vocabulary_jlpt','kanji','kanji_readings','kanji_jlpt','kanji_vocabulary','kanji_strokes','example_sentences','example_translations','audio_assets','translations','mnemonics','admin_reviews'];
  t text;
begin
  foreach t in array required loop
    if to_regclass('public.'||t) is null then raise exception 'Missing table: %',t; end if;
  end loop;
end $$;

select tablename
from pg_tables
where schemaname='public'
and tablename in ('vocabulary','kanji','translations','mnemonics')
order by tablename;

-- Expected: every listed table has RLS enabled.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public'
and c.relname in ('vocabulary','kanji','translations','mnemonics','admin_reviews')
order by c.relname;

-- Expected: published-read policies exist and admin write policies exist.
select tablename,policyname,cmd
from pg_policies
where schemaname='public'
and tablename in ('vocabulary','kanji','translations','mnemonics','admin_reviews')
order by tablename,policyname;

-- Expected: no published AI translation should exist immediately after a fresh import.
select count(*) as unpublished_translation_count
from public.translations
where source ilike '%AI%' and status='published';

-- Expected: no JLPT row can exist without a level/source/confidence/status.
select count(*) as malformed_jlpt_count
from (
  select vocabulary_id as content_id, level, source, confidence, status from public.vocabulary_jlpt
  union all
  select kanji_id, level, source, confidence, status from public.kanji_jlpt
) x
where level is null or source is null or confidence is null or status is null;
