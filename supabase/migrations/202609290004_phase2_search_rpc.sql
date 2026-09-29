-- Phase 2 search RPCs. SECURITY INVOKER preserves RLS.
create or replace function public.search_vocabulary(query_text text, level_filter public.jlpt_level default null, result_limit int default 20, result_offset int default 0)
returns table(id uuid,jp text,status public.content_status,readings text[],english_meanings text[],mongolian_translations text[])
language sql stable security invoker set search_path=public as $$
  with q as (select lower(trim(coalesce(query_text,''))) as term)
  select v.id,v.jp,v.status,
    coalesce((select array_agg(vr.reading order by vr.reading) from vocabulary_readings vr where vr.vocabulary_id=v.id),'{}'),
    coalesce((select array_agg(vs.meaning order by vs.sense_index) from vocabulary_senses vs where vs.vocabulary_id=v.id and vs.language='eng'),'{}'),
    coalesce((select array_agg(t.translation order by t.created_at desc) from translations t where t.content_type='vocabulary' and t.content_id=v.id and t.language='mn' and t.status='published'),'{}')
  from vocabulary v,q
  where v.status='published'
    and (level_filter is null or exists(select 1 from vocabulary_jlpt j where j.vocabulary_id=v.id and j.level=level_filter and j.status='published'))
    and (
      q.term='' or v.search_text ilike '%'||q.term||'%'
      or similarity(v.jp,q.term)>0.18
      or exists(select 1 from vocabulary_readings vr where vr.vocabulary_id=v.id and similarity(vr.reading,q.term)>0.18)
    )
  order by case when q.term='' then 0 else greatest(similarity(v.jp,q.term),similarity(v.search_text,q.term)) end desc,v.jp
  limit greatest(1,least(result_limit,100)) offset greatest(0,result_offset);
$$;

create or replace function public.get_vocabulary(vocabulary_id uuid)
returns table(id uuid,jp text,readings text[],english_meanings text[],mongolian_translations text[],levels public.jlpt_level[])
language sql stable security invoker set search_path=public as $$
  select v.id,v.jp,
    coalesce((select array_agg(vr.reading order by vr.reading) from vocabulary_readings vr where vr.vocabulary_id=v.id),'{}'),
    coalesce((select array_agg(vs.meaning order by vs.sense_index) from vocabulary_senses vs where vs.vocabulary_id=v.id and vs.language='eng'),'{}'),
    coalesce((select array_agg(t.translation order by t.created_at desc) from translations t where t.content_type='vocabulary' and t.content_id=v.id and t.language='mn' and t.status='published'),'{}'),
    coalesce((select array_agg(j.level order by j.level) from vocabulary_jlpt j where j.vocabulary_id=v.id and j.status='published'),'{}')
  from vocabulary v where v.id=vocabulary_id and v.status='published';
$$;

create or replace function public.search_kanji(query_text text, level_filter public.jlpt_level default null, result_limit int default 20, result_offset int default 0)
returns table(id uuid,character text,stroke_count int,frequency int,readings text[],levels public.jlpt_level[])
language sql stable security invoker set search_path=public as $$
  with q as (select lower(trim(coalesce(query_text,''))) as term)
  select k.id,k.character,k.stroke_count,k.frequency,
    coalesce((select array_agg(kr.reading order by kr.reading) from kanji_readings kr where kr.kanji_id=k.id),'{}'),
    coalesce((select array_agg(j.level order by j.level) from kanji_jlpt j where j.kanji_id=k.id and j.status='published'),'{}')
  from kanji k,q
  where k.status='published'
    and (level_filter is null or exists(select 1 from kanji_jlpt j where j.kanji_id=k.id and j.level=level_filter and j.status='published'))
    and (q.term='' or k.character ilike '%'||q.term||'%' or k.search_text ilike '%'||q.term||'%' or similarity(k.character,q.term)>0.18)
  order by case when q.term='' then 0 else similarity(k.character,q.term) end desc,k.character
  limit greatest(1,least(result_limit,100)) offset greatest(0,result_offset);
$$;
