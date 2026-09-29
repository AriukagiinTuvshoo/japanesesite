# JLPT Japanese data pipeline

This directory contains ingestion tooling only. Large source corpora are intentionally **not** committed to Git.

## Sources

- JMDict — vocabulary, readings and senses
- KANJIDIC2 — kanji readings, meanings and metadata
- KanjiVG — stroke-order SVG assets
- Tatoeba — Japanese example sentences and linked translations

## Important data rule

The pipeline never invents JLPT levels or Mongolian translations. JMDict does not itself provide a complete current N5–N1 classification, so JLPT tagging must be supplied by a separately reviewed level dataset.

AI-generated Mongolian translations, mnemonics and explanations must enter the database as `pending` editorial records and must not be published automatically.

## Local layout

```
data/
  source/       # downloaded archives; gitignored
  normalized/   # generated JSONL; gitignored
scripts/
  jlpt_data_pipeline.py
```

## Next integration

The normalized JSONL should be imported into the project's existing Supabase schema through a server-side/admin import job. Do not put the Supabase service-role key into the browser or committed files.
