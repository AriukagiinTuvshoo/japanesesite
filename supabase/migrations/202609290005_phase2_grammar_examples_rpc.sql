-- Complete the repository layer for grammar and examples.
create or replace function public.search_grammar(query_text text, level_filter public.jlpt_level default null, result_limit int default 20, result_offset int default 0)
returns table(id uuid,pattern text,title text,level public.jlpt_level)
language sql stable security invoker set search_path=public as $$
  with q as (select lower(trim(coalesce(query_text,''))) term)
  select g.id,g.pattern,g.title,g.level
  from grammar g,q
  where g.status='published'
    and (level_filter is null or g.level=level_filter)
    and (q.term='' or g.pattern ilike '%'||q.term||'%' or coalesce(g.title,'') ilike '%'||q.term||'%' or g.search_text ilike '%'||q.term||'%')
  order by g.pattern
  limit greatest(1,least(result_limit,100)) offset greatest(0,result_offset);
$$;

create or replace function public.search_examples(query_text text, result_limit int default 20, result_offset int default 0)
returns table(id uuid,japanese text,translations jsonb)
language sql stable security invoker set search_path=public as $$
  select e.id,e.japanese,
    coalesce((select jsonb_agg(jsonb_build_object('language',et.language,'translation',et.translation))
              from example_translations et where et.example_sentence_id=e.id and et.status='published'),'[]'::jsonb)
  from example_sentences e
  where e.status='published' and (trim(coalesce(query_text,''))='' or e.japanese ilike '%'||trim(query_text)||'%')
  order by e.japanese
  limit greatest(1,least(result_limit,100)) offset greatest(0,result_offset);
$$;
