-- Phase 2 production content foundation
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$ begin create type public.content_status as enum ('draft','pending_review','approved','rejected','published'); exception when duplicate_object then null; end $$;
do $$ begin create type public.review_status as enum ('pending','approved','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type public.jlpt_level as enum ('N5','N4','N3','N2','N1'); exception when duplicate_object then null; end $$;

create table if not exists public.content_sources (
 id uuid primary key default gen_random_uuid(), name text not null, source_key text not null unique,
 version text, license text, attribution text, homepage_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.imports (
 id uuid primary key default gen_random_uuid(), source_id uuid not null references public.content_sources(id),
 source_version text, started_at timestamptz not null default now(), finished_at timestamptz,
 status text not null default 'running' check(status in ('running','completed','failed','partial')),
 records_seen int not null default 0, records_inserted int not null default 0, records_updated int not null default 0,
 records_skipped int not null default 0, records_rejected int not null default 0, validation_errors int not null default 0,
 error_report jsonb not null default '[]'::jsonb, created_at timestamptz not null default now()
);

create table if not exists public.vocabulary (
 id uuid primary key default gen_random_uuid(), source_id uuid not null references public.content_sources(id),
 source_key text not null, source_entry_id text not null, source_version text, license text, attribution text,
 jp text not null, status public.content_status not null default 'pending_review',
 search_text text not null default '', search_vector tsvector, import_batch_id uuid references public.imports(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(source_key,source_entry_id)
);
create table if not exists public.vocabulary_readings (
 id uuid primary key default gen_random_uuid(), vocabulary_id uuid not null references public.vocabulary(id) on delete cascade,
 reading text not null, source_id uuid not null references public.content_sources(id), source_entry_id text not null,
 source_version text, status public.content_status not null default 'approved', created_at timestamptz not null default now(),
 unique(vocabulary_id,reading)
);
create table if not exists public.vocabulary_senses (
 id uuid primary key default gen_random_uuid(), vocabulary_id uuid not null references public.vocabulary(id) on delete cascade,
 sense_index int not null, language text not null default 'eng', meaning text not null,
 part_of_speech text[] not null default '{}', misc text[] not null default '{}', field text[] not null default '{}', dialect text[] not null default '{}',
 source_id uuid not null references public.content_sources(id), source_entry_id text not null, source_version text,
 status public.content_status not null default 'approved', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(vocabulary_id,sense_index,language,meaning)
);
create table if not exists public.vocabulary_jlpt (
 vocabulary_id uuid not null references public.vocabulary(id) on delete cascade, level public.jlpt_level not null,
 source text not null, confidence text not null check(confidence in ('verified','high','medium','low','uncertain')),
 status public.content_status not null default 'pending_review', source_version text, attribution text, import_batch_id uuid references public.imports(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(vocabulary_id,level,source)
);

create table if not exists public.kanji (
 id uuid primary key default gen_random_uuid(), source_id uuid not null references public.content_sources(id),
 source_key text not null, source_character_id text not null, source_version text, license text, attribution text,
 character text not null, grade int, stroke_count int, frequency int, status public.content_status not null default 'pending_review',
 search_text text not null default '', search_vector tsvector, import_batch_id uuid references public.imports(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(source_key,source_character_id)
);
create table if not exists public.kanji_readings (
 id uuid primary key default gen_random_uuid(), kanji_id uuid not null references public.kanji(id) on delete cascade,
 reading text not null, reading_type text, reading_status text, source_id uuid not null references public.content_sources(id), source_version text,
 status public.content_status not null default 'approved', created_at timestamptz not null default now(), unique(kanji_id,reading,reading_type)
);
create table if not exists public.kanji_jlpt (
 kanji_id uuid not null references public.kanji(id) on delete cascade, level public.jlpt_level not null, source text not null,
 confidence text not null check(confidence in ('verified','high','medium','low','uncertain')),
 status public.content_status not null default 'pending_review', source_version text, attribution text, import_batch_id uuid references public.imports(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(kanji_id,level,source)
);
create table if not exists public.kanji_vocabulary (
 kanji_id uuid not null references public.kanji(id) on delete cascade, vocabulary_id uuid not null references public.vocabulary(id) on delete cascade,
 position int, created_at timestamptz not null default now(), primary key(kanji_id,vocabulary_id)
);
create table if not exists public.kanji_strokes (
 id uuid primary key default gen_random_uuid(), kanji_id uuid not null references public.kanji(id) on delete cascade,
 source_id uuid not null references public.content_sources(id), source_asset_id text not null, source_version text, stroke_number int not null,
 svg_path text, svg_asset text, status public.content_status not null default 'approved', import_batch_id uuid references public.imports(id),
 created_at timestamptz not null default now(), unique(kanji_id,source_asset_id,stroke_number)
);

create table if not exists public.example_sentences (
 id uuid primary key default gen_random_uuid(), source_id uuid not null references public.content_sources(id), source_key text not null,
 source_sentence_id text not null, source_version text, license text, attribution text, japanese text not null,
 status public.content_status not null default 'pending_review', import_batch_id uuid references public.imports(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(source_key,source_sentence_id)
);
create table if not exists public.example_translations (
 id uuid primary key default gen_random_uuid(), example_sentence_id uuid not null references public.example_sentences(id) on delete cascade,
 source_translation_id text, language text not null, translation text not null, source text not null, source_version text,
 license text, attribution text, status public.content_status not null default 'pending_review', import_batch_id uuid references public.imports(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.audio_assets (
 id uuid primary key default gen_random_uuid(), content_type text not null, content_id uuid not null, source text not null,
 source_asset_id text, source_version text, license text, attribution text, url text, storage_path text,
 status public.content_status not null default 'pending_review', import_batch_id uuid references public.imports(id), created_at timestamptz not null default now()
);
create table if not exists public.translations (
 id uuid primary key default gen_random_uuid(), content_type text not null, content_id uuid not null, field_name text not null,
 language text not null, translation text not null, short_explanation text, usage_note text, nuance text, source text not null,
 source_version text, license text, attribution text, status public.content_status not null default 'pending_review',
 import_batch_id uuid references public.imports(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.mnemonics (
 id uuid primary key default gen_random_uuid(), content_type text not null, content_id uuid not null, language text not null default 'mn',
 mnemonic text not null, source text not null, status public.content_status not null default 'pending_review',
 created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.grammar (
 id uuid primary key default gen_random_uuid(), source_id uuid references public.content_sources(id), source_key text, source_record_id text,
 pattern text not null, title text, level public.jlpt_level, status public.content_status not null default 'pending_review',
 search_text text not null default '', search_vector tsvector, source_version text, license text, attribution text,
 import_batch_id uuid references public.imports(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(source_key,source_record_id)
);
create table if not exists public.admin_reviews (
 id uuid primary key default gen_random_uuid(), content_id uuid, content_type text not null, review_type text not null,
 old_value jsonb, new_value jsonb, reviewer uuid references auth.users(id) on delete set null,
 status public.review_status not null default 'pending', reason text, created_at timestamptz not null default now(), reviewed_at timestamptz
);

create index if not exists vocabulary_jp_trgm_idx on public.vocabulary using gin(jp gin_trgm_ops);
create index if not exists vocabulary_search_idx on public.vocabulary using gin(search_vector);
create index if not exists vocabulary_reading_trgm_idx on public.vocabulary_readings using gin(reading gin_trgm_ops);
create index if not exists vocabulary_jlpt_idx on public.vocabulary_jlpt(level);
create index if not exists kanji_character_trgm_idx on public.kanji using gin(character gin_trgm_ops);
create index if not exists kanji_search_idx on public.kanji using gin(search_vector);
create index if not exists kanji_jlpt_idx on public.kanji_jlpt(level);
create index if not exists grammar_pattern_trgm_idx on public.grammar using gin(pattern gin_trgm_ops);
create index if not exists vocabulary_source_idx on public.vocabulary(source_key,source_entry_id);
create index if not exists kanji_source_idx on public.kanji(source_key,source_character_id);
create index if not exists example_source_idx on public.example_sentences(source_key,source_sentence_id);
create index if not exists imports_status_idx on public.imports(source_id,status);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;

create or replace function public.refresh_vocabulary_search() returns trigger language plpgsql as $$
declare vid uuid := coalesce(new.vocabulary_id,old.vocabulary_id);
begin
 update public.vocabulary v set search_text=trim(concat_ws(' ',v.jp,
   (select string_agg(reading,' ') from public.vocabulary_readings where vocabulary_id=vid),
   (select string_agg(meaning,' ') from public.vocabulary_senses where vocabulary_id=vid),
   (select string_agg(translation,' ') from public.translations where content_type='vocabulary' and content_id=vid and language='mn' and status='published')
 )),updated_at=now() where v.id=vid;
 update public.vocabulary set search_vector=to_tsvector('simple',coalesce(search_text,'')) where id=vid;
 return coalesce(new,old);
end $$;

create or replace function public.refresh_kanji_search() returns trigger language plpgsql as $$
declare kid uuid := coalesce(new.kanji_id,old.kanji_id);
begin
 update public.kanji k set search_text=trim(concat_ws(' ',k.character,(select string_agg(reading,' ') from public.kanji_readings where kanji_id=kid))),updated_at=now() where k.id=kid;
 update public.kanji set search_vector=to_tsvector('simple',coalesce(search_text,'')) where id=kid;
 return coalesce(new,old);
end $$;

drop trigger if exists vocabulary_readings_search on public.vocabulary_readings;
create trigger vocabulary_readings_search after insert or update or delete on public.vocabulary_readings for each row execute function public.refresh_vocabulary_search();
drop trigger if exists vocabulary_senses_search on public.vocabulary_senses;
create trigger vocabulary_senses_search after insert or update or delete on public.vocabulary_senses for each row execute function public.refresh_vocabulary_search();
drop trigger if exists translations_search on public.translations;
create trigger translations_search after insert or update or delete on public.translations for each row execute function public.refresh_vocabulary_search();
drop trigger if exists kanji_readings_search on public.kanji_readings;
create trigger kanji_readings_search after insert or update or delete on public.kanji_readings for each row execute function public.refresh_kanji_search();

do $$ declare t text;
begin foreach t in array array['content_sources','vocabulary','vocabulary_senses','vocabulary_jlpt','kanji','kanji_jlpt','example_sentences','example_translations','translations','mnemonics','grammar']
loop execute format('drop trigger if exists %I on public.%I',t||'_updated_at',t);
execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()',t||'_updated_at',t); end loop; end $$;
