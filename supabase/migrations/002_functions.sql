-- Migration: 002_functions
-- Search functions and helpers

-- Full-text vocab search function
CREATE OR REPLACE FUNCTION search_vocab_full(q TEXT, lim INT DEFAULT 20)
RETURNS TABLE (
    id INT,
    kanji TEXT,
    reading TEXT,
    meaning_en TEXT,
    meaning_mn TEXT,
    jlpt TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        v.id,
        (SELECT text FROM vocabulary_readings vr WHERE vr.vocab_id=v.id AND vr.r_type='kanji_form' ORDER BY priority LIMIT 1) AS kanji,
        (SELECT text FROM vocabulary_readings vr WHERE vr.vocab_id=v.id AND vr.r_type='kana_form'  ORDER BY priority LIMIT 1) AS reading,
        (SELECT gloss_en[1] FROM vocabulary_senses vs WHERE vs.vocab_id=v.id ORDER BY sense_order LIMIT 1) AS meaning_en,
        (SELECT gloss_mn FROM vocabulary_senses vs WHERE vs.vocab_id=v.id AND vs.gloss_mn_status='approved' ORDER BY sense_order LIMIT 1) AS meaning_mn,
        (SELECT level::TEXT FROM vocabulary_jlpt vj WHERE vj.vocab_id=v.id LIMIT 1) AS jlpt
    FROM vocabulary v
    WHERE EXISTS (
        SELECT 1 FROM vocabulary_readings vr
        WHERE vr.vocab_id=v.id AND vr.text ILIKE '%' || q || '%'
    ) OR EXISTS (
        SELECT 1 FROM vocabulary_senses vs
        WHERE vs.vocab_id=v.id AND (vs.gloss_en::TEXT ILIKE '%' || q || '%' OR vs.gloss_mn ILIKE '%' || q || '%')
    )
    LIMIT lim;
END;
$$ LANGUAGE plpgsql;

-- User profile auto-create on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Quick stats view
CREATE OR REPLACE VIEW v_user_stats AS
SELECT
    p.id,
    p.streak_count,
    p.total_xp,
    p.target_jlpt,
    (SELECT COUNT(*) FROM srs_cards sc WHERE sc.user_id=p.id AND sc.card_state IN ('mastered','burned') AND sc.item_type='vocab')  AS vocab_mastered,
    (SELECT COUNT(*) FROM srs_cards sc WHERE sc.user_id=p.id AND sc.card_state IN ('mastered','burned') AND sc.item_type='kanji')  AS kanji_mastered,
    (SELECT COUNT(*) FROM srs_cards sc WHERE sc.user_id=p.id AND sc.due_at <= NOW() AND sc.card_state != 'burned') AS due_count
FROM profiles p;
