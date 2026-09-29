-- Add the source key needed for stable Tatoeba provenance and make the unique key explicit.
alter table if exists public.example_sentences add column if not exists source_key text;
update public.example_sentences set source_key='Tatoeba' where source_key is null;
alter table public.example_sentences alter column source_key set not null;
drop index if exists public.example_source_id_idx;
create unique index if not exists example_source_unique_idx on public.example_sentences(source_key, source_sentence_id);
create index if not exists example_source_id_idx on public.example_sentences(source_key, source_sentence_id);
