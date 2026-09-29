-- Fix translation trigger to use translations.content_id rather than a non-existent vocabulary_id field.
create or replace function public.refresh_vocabulary_translation_search()
returns trigger language plpgsql as $$
declare vid uuid := case when coalesce(new.content_type,old.content_type)='vocabulary' then coalesce(new.content_id,old.content_id) else null end;
begin
  if vid is null then return coalesce(new,old); end if;
  update public.vocabulary v
  set search_text=trim(concat_ws(' ',v.jp,
    (select string_agg(reading,' ') from public.vocabulary_readings where vocabulary_id=vid),
    (select string_agg(meaning,' ') from public.vocabulary_senses where vocabulary_id=vid),
    (select string_agg(translation,' ') from public.translations where content_type='vocabulary' and content_id=vid and language='mn' and status='published')
  )),updated_at=now()
  where v.id=vid;
  update public.vocabulary set search_vector=to_tsvector('simple',coalesce(search_text,'')) where id=vid;
  return coalesce(new,old);
end $$;

drop trigger if exists translations_search on public.translations;
create trigger translations_search after insert or update or delete on public.translations
for each row execute function public.refresh_vocabulary_translation_search();
