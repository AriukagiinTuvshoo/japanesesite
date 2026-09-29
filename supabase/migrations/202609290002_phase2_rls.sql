-- Phase 2 security: published-read access and owner/admin write boundaries.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create index if not exists user_roles_role_idx on public.user_roles(role);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

alter table public.user_roles enable row level security;
alter table public.content_sources enable row level security;
alter table public.imports enable row level security;
alter table public.vocabulary enable row level security;
alter table public.vocabulary_readings enable row level security;
alter table public.vocabulary_senses enable row level security;
alter table public.vocabulary_jlpt enable row level security;
alter table public.kanji enable row level security;
alter table public.kanji_readings enable row level security;
alter table public.kanji_jlpt enable row level security;
alter table public.kanji_vocabulary enable row level security;
alter table public.kanji_strokes enable row level security;
alter table public.example_sentences enable row level security;
alter table public.example_translations enable row level security;
alter table public.audio_assets enable row level security;
alter table public.translations enable row level security;
alter table public.mnemonics enable row level security;
alter table public.grammar enable row level security;
alter table public.admin_reviews enable row level security;

-- Remove/recreate policies so this migration is safely re-runnable.
do $$ declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname='public'
      and tablename in ('content_sources','imports','vocabulary','vocabulary_readings','vocabulary_senses','vocabulary_jlpt','kanji','kanji_readings','kanji_jlpt','kanji_vocabulary','kanji_strokes','example_sentences','example_translations','audio_assets','translations','mnemonics','grammar','admin_reviews','user_roles')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Public/authenticated users can read only published learning content.
create policy published_vocabulary_select on public.vocabulary for select using (status='published');
create policy published_vocabulary_readings_select on public.vocabulary_readings for select using (
  exists(select 1 from public.vocabulary v where v.id=vocabulary_id and v.status='published')
);
create policy published_vocabulary_senses_select on public.vocabulary_senses for select using (
  exists(select 1 from public.vocabulary v where v.id=vocabulary_id and v.status='published')
);
create policy published_vocabulary_jlpt_select on public.vocabulary_jlpt for select using (
  status='published' and exists(select 1 from public.vocabulary v where v.id=vocabulary_id and v.status='published')
);

create policy published_kanji_select on public.kanji for select using (status='published');
create policy published_kanji_readings_select on public.kanji_readings for select using (
  exists(select 1 from public.kanji k where k.id=kanji_id and k.status='published')
);
create policy published_kanji_jlpt_select on public.kanji_jlpt for select using (
  status='published' and exists(select 1 from public.kanji k where k.id=kanji_id and k.status='published')
);
create policy published_kanji_vocabulary_select on public.kanji_vocabulary for select using (
  exists(select 1 from public.kanji k where k.id=kanji_id and k.status='published')
  and exists(select 1 from public.vocabulary v where v.id=vocabulary_id and v.status='published')
);
create policy published_kanji_strokes_select on public.kanji_strokes for select using (
  status='published' and exists(select 1 from public.kanji k where k.id=kanji_id and k.status='published')
);

create policy published_examples_select on public.example_sentences for select using (status='published');
create policy published_example_translations_select on public.example_translations for select using (
  status='published' and exists(select 1 from public.example_sentences e where e.id=example_sentence_id and e.status='published')
);
create policy published_audio_select on public.audio_assets for select using (status='published');
create policy published_translations_select on public.translations for select using (status='published');
create policy published_mnemonics_select on public.mnemonics for select using (status='published');
create policy published_grammar_select on public.grammar for select using (status='published');

-- Source/provenance and moderation data are admin-only.
create policy admin_sources_all on public.content_sources for all using (public.is_admin()) with check (public.is_admin());
create policy admin_imports_all on public.imports for all using (public.is_admin()) with check (public.is_admin());
create policy admin_vocabulary_all on public.vocabulary for all using (public.is_admin()) with check (public.is_admin());
create policy admin_vocabulary_readings_all on public.vocabulary_readings for all using (public.is_admin()) with check (public.is_admin());
create policy admin_vocabulary_senses_all on public.vocabulary_senses for all using (public.is_admin()) with check (public.is_admin());
create policy admin_vocabulary_jlpt_all on public.vocabulary_jlpt for all using (public.is_admin()) with check (public.is_admin());
create policy admin_kanji_all on public.kanji for all using (public.is_admin()) with check (public.is_admin());
create policy admin_kanji_readings_all on public.kanji_readings for all using (public.is_admin()) with check (public.is_admin());
create policy admin_kanji_jlpt_all on public.kanji_jlpt for all using (public.is_admin()) with check (public.is_admin());
create policy admin_kanji_vocabulary_all on public.kanji_vocabulary for all using (public.is_admin()) with check (public.is_admin());
create policy admin_kanji_strokes_all on public.kanji_strokes for all using (public.is_admin()) with check (public.is_admin());
create policy admin_examples_all on public.example_sentences for all using (public.is_admin()) with check (public.is_admin());
create policy admin_example_translations_all on public.example_translations for all using (public.is_admin()) with check (public.is_admin());
create policy admin_audio_all on public.audio_assets for all using (public.is_admin()) with check (public.is_admin());
create policy admin_translations_all on public.translations for all using (public.is_admin()) with check (public.is_admin());
create policy admin_grammar_all on public.grammar for all using (public.is_admin()) with check (public.is_admin());
create policy admin_reviews_all on public.admin_reviews for all using (public.is_admin()) with check (public.is_admin());

-- Users can create/update/delete only their own mnemonics; publication remains admin-controlled.
create policy own_mnemonics_select on public.mnemonics for select using (
  status='published' or created_by=auth.uid() or public.is_admin()
);
create policy own_mnemonics_insert on public.mnemonics for insert
  with check (created_by=auth.uid() and status in ('draft','pending_review'));
create policy own_mnemonics_update on public.mnemonics for update
  using (created_by=auth.uid() or public.is_admin())
  with check ((created_by=auth.uid() and status in ('draft','pending_review')) or public.is_admin());
create policy own_mnemonics_delete on public.mnemonics for delete
  using (created_by=auth.uid() or public.is_admin());

-- A user can see their own role record only. Role changes are admin-only.
create policy own_role_select on public.user_roles for select using (user_id=auth.uid() or public.is_admin());
create policy admin_roles_all on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

-- Defense in depth: anon/authenticated cannot write source tables unless admin.
-- User-owned SRS/bookmarks/progress remain in the current localStorage model during Phase 2.
