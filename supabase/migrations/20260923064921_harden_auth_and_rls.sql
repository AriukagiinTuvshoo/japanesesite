-- Harden the supplied starter schema before it is connected to a project.
-- This migration is intentionally not auto-applied to a remote project.

ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
UPDATE public.users SET role = 'user' WHERE role IS NULL;
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE public.users ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_allowed;
ALTER TABLE public.users ADD CONSTRAINT users_role_allowed CHECK (role IN ('user','admin','super_admin'));
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_or_phone;
ALTER TABLE public.users ADD CONSTRAINT users_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL);
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_user_id_fkey;
ALTER TABLE public.users ADD CONSTRAINT users_auth_user_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_language_allowed;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_language_allowed CHECK (ui_language IN ('mn','en','ja'));
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_daily_goal_range;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_daily_goal_range CHECK (daily_goal_minutes BETWEEN 5 AND 240);

-- The auth.users trigger creates the corresponding public account before its profile,
-- fixing the original profile FK failure. Role always starts as user; user metadata
-- is never consulted for authorization.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  display_name_value TEXT;
BEGIN
  display_name_value := COALESCE(
    NULLIF(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), 80), ''),
    NULLIF(LEFT(COALESCE(NEW.email, NEW.phone, ''), 80), ''),
    'Japanese learner'
  );

  INSERT INTO public.users (id, email, phone, role)
  VALUES (NEW.id, NEW.email, NEW.phone, 'user')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, phone = EXCLUDED.phone;

  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, display_name_value)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

INSERT INTO public.users (id, email, phone, role)
SELECT id, email, phone, 'user' FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, phone = EXCLUDED.phone;
INSERT INTO public.profiles (id, display_name)
SELECT id, COALESCE(NULLIF(LEFT(COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''), 80), ''), NULLIF(LEFT(COALESCE(email, phone, ''), 80), ''), 'Japanese learner')
FROM auth.users ON CONFLICT (id) DO NOTHING;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = (SELECT auth.uid()) AND u.role IN ('admin','super_admin')
  );
$$;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- Identity and role records are server-managed. A user may read their own role,
-- but no client role, email, activity, or status updates are allowed.
DROP POLICY IF EXISTS users_self ON public.users;
DROP POLICY IF EXISTS users_read_self ON public.users;
DROP POLICY IF EXISTS users_admin_read ON public.users;
CREATE POLICY users_read_self ON public.users FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR (SELECT private.is_admin()));
CREATE POLICY users_admin_read ON public.users FOR SELECT TO authenticated
  USING ((SELECT private.is_admin()));
REVOKE ALL ON public.users FROM anon, authenticated;
GRANT SELECT ON public.users TO authenticated;

DROP POLICY IF EXISTS profiles_self ON public.profiles;
DROP POLICY IF EXISTS profiles_read_self ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_read ON public.profiles;
CREATE POLICY profiles_read_self ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));
CREATE POLICY profiles_admin_read ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT private.is_admin()));
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (username, display_name, avatar_url, target_jlpt, current_level, daily_goal_minutes, timezone, ui_language, notifications_on)
  ON public.profiles TO authenticated;

-- Owner isolation with WITH CHECK prevents reassigning owned rows to another user.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['srs_cards','review_logs','study_sessions','quiz_attempts','bookmarks','user_achievements','xp_logs','notifications','mnemonic_votes'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_own', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()))', t || '_own', t);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    END IF;
  END LOOP;
END;
$$;

-- Remove legacy policies whose names predate the table-scoped naming above.
DROP POLICY IF EXISTS achievements_own ON public.user_achievements;
DROP POLICY IF EXISTS votes_own ON public.mnemonic_votes;
DROP POLICY IF EXISTS srs_own ON public.srs_cards;
DROP POLICY IF EXISTS review_logs_own ON public.review_logs;
DROP POLICY IF EXISTS sessions_own ON public.study_sessions;
DROP POLICY IF EXISTS attempts_own ON public.quiz_attempts;
DROP POLICY IF EXISTS bookmarks_own ON public.bookmarks;
DROP POLICY IF EXISTS xp_own ON public.xp_logs;
DROP POLICY IF EXISTS notifications_own ON public.notifications;

DROP POLICY IF EXISTS answers_own ON public.user_answers;
CREATE POLICY answers_own ON public.user_answers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quiz_attempts a WHERE a.id = attempt_id AND a.user_id = (SELECT auth.uid())));
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.quiz_attempts, public.user_answers FROM authenticated;
GRANT SELECT ON public.quiz_attempts, public.user_answers TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.xp_logs FROM authenticated;

DROP POLICY IF EXISTS mnemonics_read ON public.mnemonics;
DROP POLICY IF EXISTS mnemonics_write ON public.mnemonics;
DROP POLICY IF EXISTS mnemonics_update ON public.mnemonics;
CREATE POLICY mnemonics_read ON public.mnemonics FOR SELECT TO authenticated
  USING (review_status = 'approved' OR author_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));
CREATE POLICY mnemonics_write ON public.mnemonics FOR INSERT TO authenticated
  WITH CHECK (author_id = (SELECT auth.uid()) AND is_ai_generated = FALSE AND review_status = 'pending');
CREATE POLICY mnemonics_update ON public.mnemonics FOR UPDATE TO authenticated
  USING (author_id = (SELECT auth.uid()) AND is_ai_generated = FALSE)
  WITH CHECK (author_id = (SELECT auth.uid()) AND is_ai_generated = FALSE);

-- Admin review actions are never available to ordinary authenticated users.
ALTER TABLE public.admin_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_reviews_admin_all ON public.admin_reviews;
CREATE POLICY admin_reviews_admin_all ON public.admin_reviews FOR ALL TO authenticated
  USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_reviews TO authenticated;

-- Public study content is read-only for learners. Admin editing remains gated by
-- the database role check, not a front-end visibility toggle.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'jlpt_levels','vocabulary','vocabulary_readings','vocabulary_senses','kanji','kanji_readings',
    'kanji_radicals','kanji_strokes','grammar','grammar_examples','example_sentences',
    'translations','mind_maps','vocab_kanji_map','vocab_sentence_map','audio_files',
    'vocabulary_jlpt','kanji_jlpt','grammar_jlpt','quizzes','questions','question_choices','achievements'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_learner_read', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', t || '_learner_read', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_manage', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()))', t || '_admin_manage', t);
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    END IF;
  END LOOP;
END;
$$;

-- Answer keys are not exposed through the Data API. Learners get only options;
-- correctness and scoring are returned from authenticated database functions.
REVOKE ALL ON public.question_choices FROM anon, authenticated;
GRANT SELECT (id, question_id, choice_text, display_order) ON public.question_choices TO authenticated;
CREATE OR REPLACE VIEW public.question_choice_options WITH (security_invoker = true) AS
  SELECT id, question_id, choice_text, display_order FROM public.question_choices;
REVOKE ALL ON public.question_choice_options FROM anon, authenticated;
GRANT SELECT ON public.question_choice_options TO authenticated;

CREATE OR REPLACE FUNCTION public.check_quiz_answer(p_question_id INTEGER, p_choice_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE correct_id INTEGER; explanation TEXT;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.question_choices c WHERE c.id = p_choice_id AND c.question_id = p_question_id) THEN
    RAISE EXCEPTION 'invalid answer' USING ERRCODE = '22023';
  END IF;
  SELECT c.id, q.explanation_mn INTO correct_id, explanation
  FROM public.question_choices c JOIN public.questions q ON q.id = c.question_id
  WHERE c.question_id = p_question_id AND c.is_correct
  ORDER BY c.display_order LIMIT 1;
  IF correct_id IS NULL THEN RAISE EXCEPTION 'question unavailable' USING ERRCODE = '22023'; END IF;
  RETURN jsonb_build_object('is_correct', correct_id = p_choice_id, 'correct_choice_id', correct_id, 'explanation_mn', explanation);
END;
$$;
REVOKE ALL ON FUNCTION public.check_quiz_answer(INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_quiz_answer(INTEGER, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(p_answers JSONB, p_time_taken_sec INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid UUID := (SELECT auth.uid());
  total INTEGER;
  correct_total INTEGER;
  attempt_id INTEGER;
  score_value INTEGER;
  answer_results JSONB;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501'; END IF;
  IF jsonb_typeof(p_answers) <> 'array' OR jsonb_array_length(p_answers) < 1 OR jsonb_array_length(p_answers) > 100 THEN
    RAISE EXCEPTION 'invalid answer list' USING ERRCODE = '22023';
  END IF;
  IF p_time_taken_sec IS NULL OR p_time_taken_sec < 0 OR p_time_taken_sec > 86400 THEN
    RAISE EXCEPTION 'invalid duration' USING ERRCODE = '22023';
  END IF;

  DROP TABLE IF EXISTS pg_temp._quiz_result;
  CREATE TEMP TABLE _quiz_result ON COMMIT DROP AS
  SELECT (a.value->>'question_id')::INTEGER AS question_id,
         (a.value->>'choice_id')::INTEGER AS choice_id,
         correct.id AS correct_choice_id,
         ((a.value->>'choice_id')::INTEGER = correct.id) AS is_correct,
         q.explanation_mn
  FROM jsonb_array_elements(p_answers) a(value)
  JOIN public.questions q ON q.id = (a.value->>'question_id')::INTEGER
  JOIN public.question_choices chosen ON chosen.id = (a.value->>'choice_id')::INTEGER AND chosen.question_id = q.id
  JOIN public.question_choices correct ON correct.question_id = q.id AND correct.is_correct
  WHERE jsonb_typeof(a.value) = 'object';

  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct) INTO total, correct_total FROM pg_temp._quiz_result;
  IF total <> jsonb_array_length(p_answers) OR total = 0 THEN RAISE EXCEPTION 'invalid answers' USING ERRCODE = '22023'; END IF;
  IF (SELECT COUNT(DISTINCT question_id) FROM pg_temp._quiz_result) <> total THEN RAISE EXCEPTION 'duplicate question' USING ERRCODE = '22023'; END IF;
  score_value := ROUND((correct_total::NUMERIC / total) * 100)::INTEGER;

  INSERT INTO public.quiz_attempts (user_id, started_at, finished_at, score, total_questions, correct_count, time_taken_sec, is_completed)
  VALUES (uid, NOW() - make_interval(secs => p_time_taken_sec), NOW(), score_value, total, correct_total, p_time_taken_sec, TRUE)
  RETURNING id INTO attempt_id;

  INSERT INTO public.user_answers (attempt_id, question_id, choice_id, is_correct)
  SELECT attempt_id, question_id, choice_id, is_correct FROM pg_temp._quiz_result;
  INSERT INTO public.xp_logs (user_id, amount, source)
  VALUES (uid, correct_total * 3 + CASE WHEN score_value = 100 THEN 50 ELSE 0 END, 'quiz');

  SELECT jsonb_agg(jsonb_build_object('question_id', question_id, 'choice_id', choice_id, 'is_correct', is_correct, 'correct_choice_id', correct_choice_id, 'explanation_mn', explanation_mn))
  INTO answer_results FROM pg_temp._quiz_result;
  RETURN jsonb_build_object('attempt_id', attempt_id, 'score', score_value, 'correct', correct_total, 'total', total, 'answers', answer_results);
END;
$$;
REVOKE ALL ON FUNCTION public.submit_quiz_attempt(JSONB, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(JSONB, INTEGER) TO authenticated;

-- These views include user-specific aggregates and must follow the caller's RLS.
DO $$
DECLARE v TEXT;
BEGIN
  FOREACH v IN ARRAY ARRAY['v_user_stats','v_vocab_full','v_kanji_full','v_srs_due','v_admin_dashboard'] LOOP
    IF to_regclass('public.' || v) IS NOT NULL THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', v);
    END IF;
  END LOOP;
END;
$$;
