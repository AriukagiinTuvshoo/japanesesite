-- The service auth schema owns credentials and password hashing. Never create a second
-- application password store here; Supabase Auth stores only the salted password hash.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) between 0 and 48),
  interface_language text not null default 'mn' check (interface_language in ('mn', 'en', 'ja')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 48)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user_profile() from public, anon, authenticated;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Admin status is read only from the signed app_metadata JWT claim, which ordinary
-- users cannot edit. Do not use user_metadata for authorization.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table public.levels (
  id text primary key check (id in ('N5', 'N4', 'N3', 'N2', 'N1')),
  name_mn text not null,
  name_en text not null,
  name_ja text not null,
  description_mn text not null default '',
  description_en text not null default '',
  description_ja text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  japanese text not null,
  reading text not null,
  meaning_mn text not null,
  meaning_en text not null default '',
  meaning_ja text not null default '',
  level_id text not null references public.levels(id),
  part_of_speech text not null default 'other',
  example_ja text not null default '',
  example_mn text not null default '',
  example_en text not null default '',
  audio_url text,
  source_note text not null default '',
  created_by uuid not null default auth.uid() references auth.users(id),
  review_state text not null default 'draft' check (review_state in ('draft', 'review', 'published')),
  first_reviewer uuid references auth.users(id),
  second_reviewer uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vocabulary_two_person_review check (
    review_state <> 'published' or
    (first_reviewer is not null and second_reviewer is not null and first_reviewer <> second_reviewer)
  ),
  unique (japanese, reading)
);
create index vocabulary_level_japanese_idx on public.vocabulary (level_id, japanese);
create index vocabulary_reading_idx on public.vocabulary (reading);

create table public.grammar_points (
  id uuid primary key default gen_random_uuid(),
  level_id text not null references public.levels(id),
  pattern text not null,
  explanation_mn text not null,
  explanation_en text not null default '',
  explanation_ja text not null default '',
  example_ja text not null,
  example_mn text not null,
  example_en text not null default '',
  source_note text not null default '',
  created_by uuid not null default auth.uid() references auth.users(id),
  review_state text not null default 'draft' check (review_state in ('draft', 'review', 'published')),
  first_reviewer uuid references auth.users(id),
  second_reviewer uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grammar_two_person_review check (
    review_state <> 'published' or
    (first_reviewer is not null and second_reviewer is not null and first_reviewer <> second_reviewer)
  )
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  level_id text not null references public.levels(id),
  answer_revision bigint not null default 0,
  question_type text not null check (question_type in ('vocabulary', 'grammar', 'reading', 'listening')),
  prompt_ja text not null,
  prompt_mn text not null,
  prompt_en text not null default '',
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 6),
  explanation_mn text not null default '',
  explanation_en text not null default '',
  explanation_ja text not null default '',
  audio_url text,
  created_by uuid not null default auth.uid() references auth.users(id),
  review_state text not null default 'draft' check (review_state in ('draft', 'review', 'published')),
  first_reviewer uuid references auth.users(id),
  second_reviewer uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_two_person_review check (
    review_state <> 'published' or
    (first_reviewer is not null and second_reviewer is not null and first_reviewer <> second_reviewer)
  )
);

-- Keep correct answers out of the exposed public schema. A restricted trigger uses this
-- table when grading an attempt; clients never receive an answer key through PostgREST.
create table private.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions(id) on delete cascade,
  correct_option_index smallint not null check (correct_option_index >= 0)
);

create table private.content_reviews (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('vocabulary', 'grammar', 'quiz')),
  content_id uuid not null,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  content_snapshot jsonb not null,
  approved boolean not null,
  feedback text not null default '',
  reviewed_at timestamptz not null default now()
);
create index content_reviews_lookup_idx on private.content_reviews (content_type, content_id, reviewer_id, reviewed_at desc);

create table public.saved_words (
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id uuid not null references public.vocabulary(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_option_index smallint not null check (selected_option_index >= 0),
  is_correct boolean not null default false,
  answered_at timestamptz not null default now()
);
create index quiz_attempts_user_answered_idx on public.quiz_attempts (user_id, answered_at desc);

create or replace function private.grade_quiz_attempt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  answer_index smallint;
  option_count integer;
begin
  if (select auth.uid()) is null or (select auth.uid()) <> new.user_id then
    raise exception 'quiz attempt owner mismatch' using errcode = '42501';
  end if;

  select jsonb_array_length(q.options), k.correct_option_index
    into option_count, answer_index
    from public.quiz_questions q
    join private.quiz_answer_keys k on k.question_id = q.id
   where q.id = new.question_id and q.review_state = 'published';

  if answer_index is null then
    raise exception 'question is not available' using errcode = '22023';
  end if;
  if new.selected_option_index >= option_count or answer_index >= option_count then
    raise exception 'answer index out of range' using errcode = '22023';
  end if;

  new.is_correct := new.selected_option_index = answer_index;
  return new;
end;
$$;
revoke all on function private.grade_quiz_attempt() from public, anon, authenticated;
create trigger grade_quiz_attempt_before_insert
  before insert on public.quiz_attempts
  for each row execute function private.grade_quiz_attempt();

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  minutes_studied smallint not null check (minutes_studied between 1 and 1440),
  activity text not null default 'study' check (activity in ('vocabulary', 'grammar', 'reading', 'listening', 'quiz', 'study'))
);
create index study_sessions_user_started_idx on public.study_sessions (user_id, started_at desc);

-- A content author cannot mark their own work published by filling reviewer IDs.
-- Reviewer IDs are derived from immutable, authenticated review events instead.
create or replace function private.enforce_two_content_reviews()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  approved_reviewers uuid[];
begin
  if tg_op = 'INSERT' then
    if (select auth.uid()) is null then
      raise exception 'authenticated content author required' using errcode = '42501';
    end if;
    new.created_by := (select auth.uid());
  end if;

  if tg_op = 'UPDATE' and (to_jsonb(old) ->> 'created_by') is distinct from (to_jsonb(new) ->> 'created_by') then
    raise exception 'content creator cannot be changed' using errcode = '42501';
  end if;

  if new.review_state = 'published' then
    select array_agg(latest.reviewer_id order by latest.reviewer_id)
      into approved_reviewers
      from (
        select distinct on (reviewer_id) reviewer_id, approved
          from private.content_reviews
         where content_type = tg_argv[0] and content_id = new.id
           and content_snapshot = (to_jsonb(new) - 'review_state' - 'first_reviewer' - 'second_reviewer' - 'updated_at')
         order by reviewer_id, reviewed_at desc, id desc
      ) as latest
     where latest.approved;

    if coalesce(array_length(approved_reviewers, 1), 0) < 2 then
      raise exception 'publishing requires approval from two different reviewers' using errcode = '42501';
    end if;

    new.first_reviewer := approved_reviewers[1];
    new.second_reviewer := approved_reviewers[2];

    if tg_argv[0] = 'quiz' and not exists (
      select 1 from private.quiz_answer_keys k
       where k.question_id = new.id
         and k.correct_option_index < jsonb_array_length(new.options)
    ) then
      raise exception 'a valid answer key is required before publishing a quiz question' using errcode = '22023';
    end if;
  else
    new.first_reviewer := null;
    new.second_reviewer := null;
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_two_content_reviews() from public, anon, authenticated;
create trigger vocabulary_review_gate before insert or update on public.vocabulary
  for each row execute function private.enforce_two_content_reviews('vocabulary');
create trigger grammar_review_gate before insert or update on public.grammar_points
  for each row execute function private.enforce_two_content_reviews('grammar');
create trigger quiz_review_gate before insert or update on public.quiz_questions
  for each row execute function private.enforce_two_content_reviews('quiz');

create or replace function private.bump_quiz_answer_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_question uuid;
begin
  target_question := case when tg_op = 'DELETE' then old.question_id else new.question_id end;
  update public.quiz_questions
     set answer_revision = answer_revision + 1,
         review_state = 'review',
         updated_at = now()
   where id = target_question;
  return null;
end;
$$;
revoke all on function private.bump_quiz_answer_revision() from public, anon, authenticated;
create trigger bump_quiz_answer_revision
  after insert or update or delete on private.quiz_answer_keys
  for each row execute function private.bump_quiz_answer_revision();

alter table public.profiles enable row level security;
alter table public.levels enable row level security;
alter table public.vocabulary enable row level security;
alter table public.grammar_points enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.saved_words enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.study_sessions enable row level security;
alter table private.quiz_answer_keys enable row level security;
alter table private.content_reviews enable row level security;

grant select, update on public.profiles to authenticated;
grant select on public.levels, public.vocabulary, public.grammar_points, public.quiz_questions to anon, authenticated;
grant insert, update, delete on public.levels, public.vocabulary, public.grammar_points, public.quiz_questions to authenticated;
grant select, insert, delete on public.saved_words to authenticated;
grant select on public.quiz_attempts to authenticated;
grant insert (user_id, question_id, selected_option_index) on public.quiz_attempts to authenticated;
grant select, insert, update on public.study_sessions to authenticated;
grant usage on schema private to authenticated;
grant select, insert on private.content_reviews to authenticated;

create policy "Profiles are visible to their owner" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users update their own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Published levels are readable" on public.levels
  for select to anon, authenticated using (is_published or (select public.is_admin()));
create policy "Admins manage levels" on public.levels
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Published vocabulary is readable" on public.vocabulary
  for select to anon, authenticated using (review_state = 'published' or (select public.is_admin()));
create policy "Admins manage vocabulary" on public.vocabulary
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Published grammar is readable" on public.grammar_points
  for select to anon, authenticated using (review_state = 'published' or (select public.is_admin()));
create policy "Admins manage grammar" on public.grammar_points
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Published questions are readable" on public.quiz_questions
  for select to anon, authenticated using (review_state = 'published' or (select public.is_admin()));
create policy "Admins manage questions" on public.quiz_questions
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins read their own content reviews" on private.content_reviews
  for select to authenticated using ((select public.is_admin()) and reviewer_id = (select auth.uid()));
create policy "Admins submit reviews as themselves" on private.content_reviews
  for insert to authenticated with check (
    (select public.is_admin())
    and reviewer_id = (select auth.uid())
    and case content_type
      when 'vocabulary' then exists (
        select 1 from public.vocabulary v
         where v.id = content_id and v.created_by <> (select auth.uid())
           and content_snapshot = (to_jsonb(v) - 'review_state' - 'first_reviewer' - 'second_reviewer' - 'updated_at')
      )
      when 'grammar' then exists (
        select 1 from public.grammar_points g
         where g.id = content_id and g.created_by <> (select auth.uid())
           and content_snapshot = (to_jsonb(g) - 'review_state' - 'first_reviewer' - 'second_reviewer' - 'updated_at')
      )
      when 'quiz' then exists (
        select 1 from public.quiz_questions q
         where q.id = content_id and q.created_by <> (select auth.uid())
           and content_snapshot = (to_jsonb(q) - 'review_state' - 'first_reviewer' - 'second_reviewer' - 'updated_at')
      )
      else false
    end
  );

create policy "Users manage their own saved words" on public.saved_words
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users read their own quiz attempts" on public.quiz_attempts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add their own quiz attempts" on public.quiz_attempts
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users manage their own study sessions" on public.study_sessions
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
