-- ============================================================
-- JLPT MASTER MONGOLIA — Production Schema
-- Migration: 001_initial_schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE jlpt_level        AS ENUM ('N1','N2','N3','N4','N5');
CREATE TYPE review_status     AS ENUM ('pending','approved','rejected','needs_revision');
CREATE TYPE card_state        AS ENUM ('new','learning','review','mastered','burned');
CREATE TYPE translation_src   AS ENUM ('ai_generated','human','hybrid');
CREATE TYPE mnemonic_type     AS ENUM ('story','visual','funny','logical','user_custom');
CREATE TYPE question_type     AS ENUM ('vocabulary','kanji','grammar','reading','mixed');
CREATE TYPE quiz_type         AS ENUM ('practice','mock_exam','weak_area','daily');

-- ============================================================
-- 1. USERS & PROFILES
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT UNIQUE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    last_login      TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT TRUE,
    role            TEXT DEFAULT 'user'  -- 'user','admin','super_admin'
);

CREATE TABLE profiles (
    id                  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username            TEXT UNIQUE,
    display_name        TEXT,
    avatar_url          TEXT,
    target_jlpt         jlpt_level DEFAULT 'N2',
    current_level       jlpt_level,
    daily_goal_minutes  SMALLINT DEFAULT 30,
    streak_count        INTEGER DEFAULT 0,
    longest_streak      INTEGER DEFAULT 0,
    last_study_date     DATE,
    total_xp            INTEGER DEFAULT 0,
    timezone            TEXT DEFAULT 'Asia/Ulaanbaatar',
    ui_language         TEXT DEFAULT 'mn',
    notifications_on    BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. VOCABULARY (JMDict)
-- ============================================================
CREATE TABLE vocabulary (
    id              SERIAL PRIMARY KEY,
    jmdict_id       INTEGER UNIQUE NOT NULL,
    frequency       SMALLINT,          -- newspaper/web frequency rank
    is_common       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vocabulary_readings (
    id          SERIAL PRIMARY KEY,
    vocab_id    INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    reading     TEXT,                  -- hiragana/katakana reading
    r_type      TEXT NOT NULL,         -- 'kanji_form','kana_form'
    priority    SMALLINT DEFAULT 0,
    info_tags   TEXT[],
    UNIQUE(vocab_id, text, r_type)
);

CREATE TABLE vocabulary_senses (
    id              SERIAL PRIMARY KEY,
    vocab_id        INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    sense_order     SMALLINT DEFAULT 0,
    pos             TEXT[],            -- parts of speech
    field           TEXT[],            -- domain
    misc            TEXT[],
    dialect         TEXT[],
    gloss_en        TEXT[],            -- English glosses
    gloss_mn        TEXT,              -- Mongolian translation
    gloss_mn_status review_status DEFAULT 'pending',
    gloss_mn_src    translation_src DEFAULT 'ai_generated',
    nuance_mn       TEXT,              -- usage notes in Mongolian
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    UNIQUE(vocab_id, sense_order)
);

-- ============================================================
-- 3. KANJI (KANJIDIC2)
-- ============================================================
CREATE TABLE kanji (
    id              SERIAL PRIMARY KEY,
    character       CHAR(1) UNIQUE NOT NULL,
    stroke_count    SMALLINT,
    grade           SMALLINT,          -- school grade 1-9
    frequency       SMALLINT,          -- newspaper rank
    meaning_en      TEXT[],            -- English meanings
    meaning_mn      TEXT,              -- Mongolian meaning
    meaning_mn_status review_status DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kanji_readings (
    id          SERIAL PRIMARY KEY,
    kanji_id    INTEGER NOT NULL REFERENCES kanji(id) ON DELETE CASCADE,
    reading     TEXT NOT NULL,
    r_type      TEXT NOT NULL,         -- 'ja_on','ja_kun','nanori'
    UNIQUE(kanji_id, reading, r_type)
);

CREATE TABLE kanji_radicals (
    id          SERIAL PRIMARY KEY,
    kanji_id    INTEGER NOT NULL REFERENCES kanji(id) ON DELETE CASCADE,
    radical     TEXT NOT NULL,
    rad_type    TEXT DEFAULT 'classical',
    is_primary  BOOLEAN DEFAULT FALSE,
    UNIQUE(kanji_id, radical, rad_type)
);

-- ============================================================
-- 4. STROKE ORDER (KanjiVG)
-- ============================================================
CREATE TABLE kanji_strokes (
    id              SERIAL PRIMARY KEY,
    kanji_id        INTEGER NOT NULL REFERENCES kanji(id) ON DELETE CASCADE UNIQUE,
    kanjivg_id      TEXT,              -- hex ID e.g. '05c71'
    svg_full        TEXT,              -- full SVG markup
    stroke_count    SMALLINT,
    stroke_paths    JSONB,             -- [{order,path,element,type}]
    element_groups  JSONB,             -- radical sub-groups with bbox
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. GRAMMAR
-- ============================================================
CREATE TABLE grammar (
    id              SERIAL PRIMARY KEY,
    form            TEXT NOT NULL,
    jlpt_level      jlpt_level NOT NULL,
    category        TEXT NOT NULL,
    structure       TEXT,
    meaning_en      TEXT,
    meaning_mn      TEXT,
    nuance_mn       TEXT,
    comparison_note TEXT,              -- diff from similar patterns
    common_mistakes TEXT,
    mnemonic_mn     TEXT,
    review_status   review_status DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(form, jlpt_level)
);

CREATE TABLE grammar_examples (
    id              SERIAL PRIMARY KEY,
    grammar_id      INTEGER NOT NULL REFERENCES grammar(id) ON DELETE CASCADE,
    japanese        TEXT NOT NULL,
    reading         TEXT,
    english         TEXT,
    mongolian       TEXT,
    mn_status       review_status DEFAULT 'pending',
    source          TEXT DEFAULT 'original',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. EXAMPLE SENTENCES (Tatoeba)
-- ============================================================
CREATE TABLE example_sentences (
    id              SERIAL PRIMARY KEY,
    tatoeba_id      INTEGER UNIQUE,
    japanese        TEXT NOT NULL,
    reading         TEXT,
    english         TEXT,
    mongolian       TEXT,
    mn_status       review_status DEFAULT 'pending',
    difficulty      jlpt_level,
    audio_url       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TRANSLATIONS (unified review)
-- ============================================================
CREATE TABLE translations (
    id              SERIAL PRIMARY KEY,
    item_type       TEXT NOT NULL,     -- 'vocab_sense','kanji','grammar','sentence'
    item_id         INTEGER NOT NULL,
    field           TEXT NOT NULL,     -- 'gloss_mn','meaning_mn','mongolian' etc
    original_en     TEXT,
    translation_mn  TEXT NOT NULL,
    source          translation_src DEFAULT 'ai_generated',
    status          review_status DEFAULT 'pending',
    ai_model        TEXT,
    confidence      FLOAT CHECK(confidence BETWEEN 0 AND 1),
    reviewer_id     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_type, item_id, field)
);

-- ============================================================
-- 8. MNEMONICS
-- ============================================================
CREATE TABLE mnemonics (
    id              SERIAL PRIMARY KEY,
    item_type       TEXT NOT NULL,     -- 'kanji','vocab','grammar'
    item_id         INTEGER NOT NULL,
    mnemonic_type   mnemonic_type NOT NULL DEFAULT 'story',
    content         TEXT NOT NULL,     -- the mnemonic in Mongolian
    is_official     BOOLEAN DEFAULT FALSE,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    author_id       UUID REFERENCES users(id),
    vote_count      INTEGER DEFAULT 0,
    review_status   review_status DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mnemonic_votes (
    mnemonic_id     INTEGER NOT NULL REFERENCES mnemonics(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_upvote       BOOLEAN NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(mnemonic_id, user_id)
);

-- ============================================================
-- 9. MIND MAPS
-- ============================================================
CREATE TABLE mind_maps (
    id              SERIAL PRIMARY KEY,
    root_vocab_id   INTEGER REFERENCES vocabulary(id),
    root_kanji_id   INTEGER REFERENCES kanji(id),
    title           TEXT NOT NULL,
    graph_data      JSONB NOT NULL,    -- nodes + edges for D3/Cytoscape
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. JLPT LEVEL TAGGING
-- ============================================================
CREATE TABLE jlpt_levels (
    id          SERIAL PRIMARY KEY,
    level       jlpt_level UNIQUE NOT NULL,
    vocab_count INTEGER DEFAULT 0,
    kanji_count INTEGER DEFAULT 0,
    grammar_count INTEGER DEFAULT 0,
    description_mn TEXT
);

CREATE TABLE vocabulary_jlpt (
    vocab_id    INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    level       jlpt_level NOT NULL,
    source      TEXT NOT NULL,
    confidence  FLOAT DEFAULT 1.0,
    PRIMARY KEY(vocab_id, level, source)
);

CREATE TABLE kanji_jlpt (
    kanji_id    INTEGER NOT NULL REFERENCES kanji(id) ON DELETE CASCADE,
    level       jlpt_level NOT NULL,
    source      TEXT DEFAULT 'kanjidic2',
    PRIMARY KEY(kanji_id, level)
);

CREATE TABLE grammar_jlpt (
    grammar_id  INTEGER NOT NULL REFERENCES grammar(id) ON DELETE CASCADE,
    level       jlpt_level NOT NULL,
    PRIMARY KEY(grammar_id, level)
);

-- Cross-reference tables
CREATE TABLE vocab_kanji_map (
    vocab_id    INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    kanji_id    INTEGER NOT NULL REFERENCES kanji(id) ON DELETE CASCADE,
    position    SMALLINT,
    PRIMARY KEY(vocab_id, kanji_id)
);

CREATE TABLE vocab_sentence_map (
    vocab_id    INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    sentence_id INTEGER NOT NULL REFERENCES example_sentences(id) ON DELETE CASCADE,
    match_type  TEXT DEFAULT 'exact',
    PRIMARY KEY(vocab_id, sentence_id)
);

-- ============================================================
-- 11. AUDIO FILES
-- ============================================================
CREATE TABLE audio_files (
    id          SERIAL PRIMARY KEY,
    item_type   TEXT NOT NULL,     -- 'vocab','kanji','sentence'
    item_id     INTEGER NOT NULL,
    storage_key TEXT NOT NULL,     -- Supabase Storage path
    voice_type  TEXT DEFAULT 'ja-JP-Standard-A',
    duration_ms INTEGER,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_type, item_id, voice_type)
);

-- ============================================================
-- 12. SRS (Spaced Repetition System)
-- ============================================================
CREATE TABLE srs_cards (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type       TEXT NOT NULL,     -- 'vocab','kanji','grammar'
    item_id         INTEGER NOT NULL,
    card_state      card_state DEFAULT 'new',
    ease_factor     FLOAT DEFAULT 2.5,
    interval_days   INTEGER DEFAULT 0,
    due_at          TIMESTAMPTZ DEFAULT NOW(),
    reps            INTEGER DEFAULT 0,
    lapses          INTEGER DEFAULT 0,
    last_reviewed   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

CREATE TABLE review_logs (
    id              SERIAL PRIMARY KEY,
    card_id         INTEGER NOT NULL REFERENCES srs_cards(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating          SMALLINT NOT NULL CHECK(rating BETWEEN 1 AND 4), -- 1=Again 2=Hard 3=Good 4=Easy
    time_taken_ms   INTEGER,
    prev_interval   INTEGER,
    new_interval    INTEGER,
    prev_ease       FLOAT,
    new_ease        FLOAT,
    reviewed_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_sessions (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    duration_min    SMALLINT,
    cards_reviewed  INTEGER DEFAULT 0,
    correct_count   INTEGER DEFAULT 0,
    xp_earned       INTEGER DEFAULT 0,
    session_type    TEXT DEFAULT 'srs'  -- 'srs','quiz','mock_exam','browse'
);

-- ============================================================
-- 13. QUIZ SYSTEM
-- ============================================================
CREATE TABLE quizzes (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    quiz_type       quiz_type NOT NULL,
    jlpt_level      jlpt_level,
    question_count  SMALLINT DEFAULT 10,
    time_limit_min  SMALLINT,
    is_official     BOOLEAN DEFAULT FALSE,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE questions (
    id              SERIAL PRIMARY KEY,
    quiz_id         INTEGER REFERENCES quizzes(id),
    question_type   question_type NOT NULL,
    jlpt_level      jlpt_level,
    item_type       TEXT,              -- 'vocab','kanji','grammar'
    item_id         INTEGER,
    stem            TEXT NOT NULL,     -- question text
    explanation_mn  TEXT,
    difficulty      SMALLINT DEFAULT 3 CHECK(difficulty BETWEEN 1 AND 5),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE question_choices (
    id              SERIAL PRIMARY KEY,
    question_id     INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    choice_text     TEXT NOT NULL,
    is_correct      BOOLEAN DEFAULT FALSE,
    display_order   SMALLINT DEFAULT 0
);

CREATE TABLE quiz_attempts (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id         INTEGER REFERENCES quizzes(id),
    session_id      INTEGER REFERENCES study_sessions(id),
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    finished_at     TIMESTAMPTZ,
    score           FLOAT,             -- 0-100
    total_questions SMALLINT,
    correct_count   SMALLINT,
    time_taken_sec  INTEGER,
    is_completed    BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_answers (
    id              SERIAL PRIMARY KEY,
    attempt_id      INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id     INTEGER NOT NULL REFERENCES questions(id),
    choice_id       INTEGER REFERENCES question_choices(id),
    text_answer     TEXT,
    is_correct      BOOLEAN,
    time_taken_ms   INTEGER,
    answered_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. BOOKMARKS
-- ============================================================
CREATE TABLE bookmarks (
    id          SERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type   TEXT NOT NULL,
    item_id     INTEGER NOT NULL,
    note        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- ============================================================
-- 15. GAMIFICATION
-- ============================================================
CREATE TABLE achievements (
    id              SERIAL PRIMARY KEY,
    code            TEXT UNIQUE NOT NULL,
    title_mn        TEXT NOT NULL,
    description_mn  TEXT,
    icon            TEXT,
    xp_reward       INTEGER DEFAULT 0,
    condition_type  TEXT,              -- 'streak','vocab_count','accuracy' etc
    condition_value INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id  INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at       TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(user_id, achievement_id)
);

CREATE TABLE xp_logs (
    id          SERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount      INTEGER NOT NULL,
    source      TEXT NOT NULL,         -- 'srs_review','quiz','streak','achievement'
    item_type   TEXT,
    item_id     INTEGER,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 16. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id          SERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,         -- 'review_due','streak_risk','achievement','system'
    title_mn    TEXT NOT NULL,
    body_mn     TEXT,
    is_read     BOOLEAN DEFAULT FALSE,
    action_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 17. ADMIN REVIEW SYSTEM
-- ============================================================
CREATE TABLE admin_reviews (
    id              SERIAL PRIMARY KEY,
    item_type       TEXT NOT NULL,
    item_id         INTEGER NOT NULL,
    field           TEXT,
    content_snapshot TEXT NOT NULL,
    priority        SMALLINT DEFAULT 5,
    status          review_status DEFAULT 'pending',
    assigned_to     UUID REFERENCES users(id),
    reviewer_id     UUID REFERENCES users(id),
    reviewer_note   TEXT,
    prev_value      TEXT,
    new_value       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
-- Full text search
CREATE INDEX idx_vocab_readings_text       ON vocabulary_readings USING gin(text gin_trgm_ops);
CREATE INDEX idx_vocab_senses_gloss_en     ON vocabulary_senses   USING gin(gloss_en);
CREATE INDEX idx_example_japanese          ON example_sentences   USING gin(japanese gin_trgm_ops);
CREATE INDEX idx_grammar_form              ON grammar             USING gin(form gin_trgm_ops);

-- JLPT lookups
CREATE INDEX idx_vocab_jlpt                ON vocabulary_jlpt(level, vocab_id);
CREATE INDEX idx_kanji_jlpt                ON kanji_jlpt(level, kanji_id);
CREATE INDEX idx_grammar_level             ON grammar(jlpt_level);

-- SRS performance
CREATE INDEX idx_srs_cards_due             ON srs_cards(user_id, due_at) WHERE card_state != 'burned';
CREATE INDEX idx_srs_cards_state           ON srs_cards(user_id, card_state);
CREATE INDEX idx_review_logs_user          ON review_logs(user_id, reviewed_at DESC);

-- Admin
CREATE INDEX idx_admin_reviews_status      ON admin_reviews(status, item_type);
CREATE INDEX idx_translations_status       ON translations(status, item_type);

-- User activity
CREATE INDEX idx_xp_logs_user              ON xp_logs(user_id, created_at DESC);
CREATE INDEX idx_bookmarks_user            ON bookmarks(user_id, item_type);
CREATE INDEX idx_notifications_user        ON notifications(user_id, is_read, created_at DESC);

-- Kanji
CREATE INDEX idx_kanji_char                ON kanji(character);
CREATE INDEX idx_kanji_frequency           ON kanji(frequency);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated         BEFORE UPDATE ON users          FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_profiles_updated      BEFORE UPDATE ON profiles        FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_vocabulary_updated    BEFORE UPDATE ON vocabulary      FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_kanji_updated         BEFORE UPDATE ON kanji           FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_grammar_updated       BEFORE UPDATE ON grammar         FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_sentences_updated     BEFORE UPDATE ON example_sentences FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_admin_reviews_updated BEFORE UPDATE ON admin_reviews   FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_mnemonics_updated     BEFORE UPDATE ON mnemonics       FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- TRIGGER: XP → profile total
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_total_xp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles SET total_xp = total_xp + NEW.amount WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_xp_accumulate
    AFTER INSERT ON xp_logs
    FOR EACH ROW EXECUTE FUNCTION fn_update_total_xp();

-- ============================================================
-- TRIGGER: Mnemonic vote count sync
-- ============================================================
CREATE OR REPLACE FUNCTION fn_sync_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE mnemonics SET vote_count = (
        SELECT COALESCE(SUM(CASE WHEN is_upvote THEN 1 ELSE -1 END), 0)
        FROM mnemonic_votes WHERE mnemonic_id = COALESCE(NEW.mnemonic_id, OLD.mnemonic_id)
    ) WHERE id = COALESCE(NEW.mnemonic_id, OLD.mnemonic_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vote_sync AFTER INSERT OR UPDATE OR DELETE ON mnemonic_votes
    FOR EACH ROW EXECUTE FUNCTION fn_sync_vote_count();

-- ============================================================
-- VIEWS
-- ============================================================
CREATE VIEW v_vocab_full AS
SELECT
    v.id,
    v.jmdict_id,
    v.frequency,
    v.is_common,
    array_agg(DISTINCT vr.text) FILTER (WHERE vr.r_type='kanji_form') AS kanji_forms,
    array_agg(DISTINCT vr.text) FILTER (WHERE vr.r_type='kana_form')  AS kana_forms,
    array_agg(DISTINCT vs.gloss_en)                                    AS meanings_en,
    array_agg(DISTINCT vs.gloss_mn) FILTER (WHERE vs.gloss_mn IS NOT NULL AND vs.gloss_mn_status='approved') AS meanings_mn,
    array_agg(DISTINCT vj.level::TEXT)                                 AS jlpt_levels
FROM vocabulary v
LEFT JOIN vocabulary_readings vr ON vr.vocab_id = v.id
LEFT JOIN vocabulary_senses   vs ON vs.vocab_id = v.id
LEFT JOIN vocabulary_jlpt     vj ON vj.vocab_id = v.id
GROUP BY v.id;

CREATE VIEW v_kanji_full AS
SELECT
    k.id,
    k.character,
    k.stroke_count,
    k.grade,
    k.frequency,
    k.meaning_en,
    k.meaning_mn,
    k.meaning_mn_status,
    array_agg(DISTINCT kr.reading) FILTER (WHERE kr.r_type='ja_on')  AS on_yomi,
    array_agg(DISTINCT kr.reading) FILTER (WHERE kr.r_type='ja_kun') AS kun_yomi,
    array_agg(DISTINCT kj.level::TEXT)                                AS jlpt_levels,
    array_agg(DISTINCT rad.radical) FILTER (WHERE rad.is_primary)     AS primary_radical
FROM kanji k
LEFT JOIN kanji_readings  kr  ON kr.kanji_id = k.id
LEFT JOIN kanji_jlpt      kj  ON kj.kanji_id = k.id
LEFT JOIN kanji_radicals  rad ON rad.kanji_id = k.id
GROUP BY k.id;

CREATE VIEW v_srs_due AS
SELECT
    sc.id AS card_id,
    sc.user_id,
    sc.item_type,
    sc.item_id,
    sc.card_state,
    sc.ease_factor,
    sc.interval_days,
    sc.due_at,
    sc.reps,
    sc.lapses
FROM srs_cards sc
WHERE sc.due_at <= NOW() AND sc.card_state != 'burned';

CREATE VIEW v_admin_dashboard AS
SELECT
    item_type,
    COUNT(*) FILTER (WHERE status='pending')        AS pending,
    COUNT(*) FILTER (WHERE status='approved')       AS approved,
    COUNT(*) FILTER (WHERE status='rejected')       AS rejected,
    COUNT(*) FILTER (WHERE status='needs_revision') AS needs_revision,
    COUNT(*) AS total
FROM admin_reviews
GROUP BY item_type;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_cards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mnemonics          ENABLE ROW LEVEL SECURITY;
ALTER TABLE mnemonic_votes     ENABLE ROW LEVEL SECURITY;

-- Users: own row only
CREATE POLICY users_self ON users
    USING (id = auth.uid());

-- Profiles: own row only
CREATE POLICY profiles_self ON profiles
    FOR ALL USING (id = auth.uid());

-- SRS: own cards
CREATE POLICY srs_own ON srs_cards
    FOR ALL USING (user_id = auth.uid());

-- Review logs: own logs
CREATE POLICY review_logs_own ON review_logs
    FOR ALL USING (user_id = auth.uid());

-- Study sessions: own sessions
CREATE POLICY sessions_own ON study_sessions
    FOR ALL USING (user_id = auth.uid());

-- Quiz attempts: own attempts
CREATE POLICY attempts_own ON quiz_attempts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY answers_own ON user_answers
    FOR ALL USING (attempt_id IN (SELECT id FROM quiz_attempts WHERE user_id = auth.uid()));

-- Bookmarks: own bookmarks
CREATE POLICY bookmarks_own ON bookmarks
    FOR ALL USING (user_id = auth.uid());

-- Achievements: own achievements
CREATE POLICY achievements_own ON user_achievements
    FOR ALL USING (user_id = auth.uid());

-- XP: own XP
CREATE POLICY xp_own ON xp_logs
    FOR ALL USING (user_id = auth.uid());

-- Notifications: own notifications
CREATE POLICY notifications_own ON notifications
    FOR ALL USING (user_id = auth.uid());

-- Mnemonics: all can read approved; users manage their own
CREATE POLICY mnemonics_read ON mnemonics FOR SELECT
    USING (review_status = 'approved' OR author_id = auth.uid());
CREATE POLICY mnemonics_write ON mnemonics FOR INSERT
    WITH CHECK (author_id = auth.uid());
CREATE POLICY mnemonics_update ON mnemonics FOR UPDATE
    USING (author_id = auth.uid() AND is_ai_generated = FALSE);

-- Votes: own votes
CREATE POLICY votes_own ON mnemonic_votes
    FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- INITIAL DATA: jlpt_levels
-- ============================================================
INSERT INTO jlpt_levels(level, description_mn) VALUES
    ('N5', 'Хамгийн анхан шатны түвшин. 800 үг, 100 кanji.'),
    ('N4', 'Анхан шатны түвшин. 1,500 үг, 300 кanji.'),
    ('N3', 'Дунд шатны түвшин. 3,750 үг, 650 кanji.'),
    ('N2', 'Дээд дунд шатны түвшин. 6,000 үг, 1,000 кanji.'),
    ('N1', 'Хамгийн дээд түвшин. 10,000+ үг, 2,000+ кanji.');

-- ============================================================
-- INITIAL DATA: achievements
-- ============================================================
INSERT INTO achievements(code, title_mn, description_mn, xp_reward, condition_type, condition_value) VALUES
    ('first_review',   'Эхний давталт',        'Анхны SRS давталтаа хийлээ',                  10,  'review_count',  1),
    ('streak_7',       '7 хоногийн мөр',        '7 хоног дараалан сурлаа',                    100, 'streak',        7),
    ('streak_30',      '30 хоногийн мөр',       '30 хоног дараалан сурлаа',                   500, 'streak',        30),
    ('streak_100',     '100 хоногийн мөр',      '100 хоног тасралтгүй!',                     2000, 'streak',        100),
    ('vocab_100',      '100 үг',                '100 үг цээжилсэн',                            50, 'vocab_mastered', 100),
    ('vocab_500',      '500 үг',                '500 үг цээжилсэн',                           200, 'vocab_mastered', 500),
    ('vocab_1000',     '1000 үг',               '1000 үг цээжилсэн!',                         500, 'vocab_mastered', 1000),
    ('kanji_100',      '100 кanji',             '100 кanji цээжилсэн',                         50, 'kanji_mastered', 100),
    ('perfect_quiz',   'Алдаагүй тест',         'Тестийг алдаагүй дуусгалаа',                  50, 'quiz_perfect',   1),
    ('n5_complete',    'N5 дууссан',            'N5 түвшний бүх үгийг цээжилсэн',             300, 'level_complete', 5),
    ('n4_complete',    'N4 дууссан',            'N4 түвшний бүх үгийг цээжилсэн',             600, 'level_complete', 4),
    ('n3_complete',    'N3 дууссан',            'N3 түвшний бүх үгийг цээжилсэн',            1200, 'level_complete', 3),
    ('n2_complete',    'N2 дууссан',            'N2 түвшний бүх үгийг цээжилсэн',            2500, 'level_complete', 2),
    ('n1_complete',    'N1 дууссан! 🎌',        'JLPT N1 бэлтгэл дуусгалаа!',               5000, 'level_complete', 1),
    ('mnemonic_maker', 'Mnemonic зохиогч',      'Өөрийн mnemonic үүсгэсэн',                    20, 'mnemonic_created', 1),
    ('top_reviewer',   'Шилдэг шинжигч',        'Таны mnemonic 10+ санал авсан',              100, 'mnemonic_votes',  10);
