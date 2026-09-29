# Phase 2 — Production Data Foundation

## Architecture

Current application remains a static PWA. Phase 2 adds:

Browser -> /api/content -> Supabase PostgREST RPC -> published content only

Import:

Source archive -> scripts/jlpt_data_pipeline.py -> normalized JSONL -> scripts/import_supabase.py -> PostgreSQL

Editorial:

Source content -> candidate Mongolian translation -> pending_review -> admin review -> approved -> published

AI-generated translations and mnemonics are never published automatically.

## Sources and provenance

JMDict: vocabulary, readings, senses. Stable ID: ent_seq.
KANJIDIC2: kanji metadata and readings. Stable ID: character.
KanjiVG: stroke SVG/path assets. Stable ID: asset filename.
Tatoeba: Japanese example sentences and linked translations. Stable ID: sentence ID.

The importer requires explicit source version, license and attribution. The repository does not invent licensing metadata.

## JLPT policy

JMDict is not treated as a JLPT authority.

Vocabulary receives no JLPT row unless a separate classification dataset supplies one.

When KANJIDIC2 contains its historical JLPT field, it is preserved only as:
source = KANJIDIC2
confidence = uncertain
status = pending_review

It is not published automatically.

## Content lifecycle

draft -> pending_review -> approved -> published

Rejected records remain traceable through review/import history.

## Import

Trusted import environment requires psycopg[binary]>=3.1.

Required environment:
SUPABASE_DB_URL — PostgreSQL connection string; server-side only.

The importer is source-ID based and safe to run repeatedly. It reports records seen, inserted, updated, skipped, rejected and validation errors. Rejected records are retained in the import error report. Database failures roll back the transaction.

## Supabase migrations

Apply in order:

1. 202609290001_phase2_content_foundation.sql
2. 202609290002_phase2_rls.sql
3. 202609290003_phase2_schema_fix.sql
4. 202609290004_phase2_search_rpc.sql
5. 202609290005_phase2_grammar_examples_rpc.sql

Frontend environment:
SUPABASE_URL
SUPABASE_ANON_KEY

Import environment:
SUPABASE_DB_URL

The browser never receives the service-role credential.

## Admin

The first administrator must be provisioned by a privileged database operator. Role management is not exposed to the browser.

## Search

Vocabulary and kanji use PostgreSQL pg_trgm indexes plus search vectors. Search is server-side and paginated.

Repository methods:
VocabularyRepository.searchVocabulary()
VocabularyRepository.getVocabulary()
KanjiRepository.searchKanji()
GrammarRepository.searchGrammar()
ExampleRepository.searchExamples()

## Development seed

scripts/create_verified_seed.py generates a small development seed from real normalized source output: 20 vocabulary, 10 kanji and 10 examples. It refuses to fabricate source IDs.

## QA

Local checks:
python -m py_compile scripts/jlpt_data_pipeline.py scripts/import_supabase.py qa/phase2_data_foundation_test.py
python qa/phase2_data_foundation_test.py

GitHub Actions runs Phase 2 syntax, data-contract, migration-contract and secret scans.

supabase/tests/phase2_acceptance.sql contains database acceptance checks that require a real Supabase/PostgreSQL environment.

## Existing application compatibility

Phase 2 does not remove LearningStore, QuizEngine or the current local starter datasets.

The current browser state remains nihongo-learning-state-v2 plus legacy localStorage compatibility keys.

The repository layer returns an explicit backend error when Supabase is unavailable. It does not silently pretend remote content exists.

Full migration of the learning UI from LearningData arrays to repositories is intentionally deferred until Phase 3 Vocabulary Studio.
