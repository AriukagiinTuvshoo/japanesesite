-- Add user-selected study goals without replacing profile or progress data.
alter table public.profiles
  add column if not exists daily_goal_minutes smallint not null default 20,
  add column if not exists jlpt_target text,
  add column if not exists learning_goal text not null default 'daily';

alter table public.profiles
  add constraint profiles_daily_goal_minutes_check
    check (daily_goal_minutes in (15, 20, 30, 60)),
  add constraint profiles_jlpt_target_check
    check (jlpt_target is null or jlpt_target in ('N5', 'N4', 'N3', 'N2', 'N1')),
  add constraint profiles_learning_goal_check
    check (learning_goal in ('daily', 'jlpt', 'work', 'school'));
