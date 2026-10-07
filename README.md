# Nihongo — Japanese study for Mongolian speakers

A mobile-first Japanese learning site with a Mongolian interface. Japanese is written with hiragana, katakana, and kanji; each vocabulary card shows a kana reading so learners can distinguish the Japanese reading from the kanji form.

## Learning tools

- Mongolian-first interface with Mongolian, English, and Japanese display options; phone-friendly responsive layout and installable/offline PWA app shell
- Existing study dashboard, review scheduler, progress records, quizzes, saved vocabulary, Kana Studio, and optional AI teacher remain part of the app; learning state stays local to the current browser
- JLPT Prep Center for N5–N1 with official pass/section thresholds, level goals, a flexible four-week plan, original drills, and links to official sample questions and workbooks
- Searchable curated glossary of **219 vocabulary entries**, including **156 tagged N2**; cards include kana readings, Mongolian/English meanings, examples, browser speech, and saved-word filters
- **76 original N2 grammar lessons** with Mongolian, English, and Japanese guidance, plus six starter lessons at each of N5, N4, N3, and N1
- Expanded original practice bank with **24 N2 readings** and **23 N2 listening prompts** (36 readings and 35 listening prompts across all levels); N2 rows cover the five JLPT reading and five listening purposes, with kana, translations, explanations, and device-generated Japanese speech
- N2 vocabulary-format practice spans kanji reading, orthography, word formation, contextual meaning, paraphrase, and usage; grammar practice spans form selection, sentence composition, and text grammar
- **85-question N2 full-timing simulation**: 30 vocabulary, 15 grammar, 20 reading, and 20 listening questions. It runs a 105-minute Language Knowledge + Reading section, a user-controlled break, then a 50-minute Listening section. The break can be continued or quit; section timeouts are handled separately
- Short timed simulations remain available too: 12 questions in 12 minutes at N5, N4, N3, and N1; 25 questions in 25 minutes at N2. Results include per-skill records, a local mistake log, and level-filtered retry sessions
- N2 book companion links to the provided PDF on the project’s GitHub `main`; its translated chapter checklist, 15 grammar-topic groups, two study routes, exam-format notes, and completion tracking are local and do not republish the book
- Curated N2 resource shelf grouped into official JLPT sources, independent grammar/kanji/vocabulary references, and reading/foundation supplements; third-party lists are explicitly labeled as unofficial
- Kana Studio with 104 hiragana and 104 katakana forms, romaji reference, script comparison, browser speech, local mastery tracking, and a five-question check

## Content scope and exam caveats

The app is a growing study aid, not a complete JLPT syllabus or a replacement for official practice workbooks. The JLPT describes N2 ability and question purposes but does not publish a definitive vocabulary/grammar checklist. The app’s 156 N2 vocabulary entries and 76 N2 grammar lessons are curated practice sets, not exhaustive coverage of the approximately 3,500 vocabulary entries or 135 grammar items described by the linked book. Counts and organization in third-party lists or books are not official JLPT requirements.

The full-timing mock is an **approximation**, not official JLPT material or an exact replica of the official item counts. Its 85-question distribution is designed for this app to sample the broad N2 formats; official materials do not publish a fixed per-format count for this mock to reproduce. The 105-minute Language Knowledge + Reading and 50-minute Listening durations follow the N2 timing reference, but all questions are original and listening uses device-generated text-to-speech. Official copyrighted questions and audio are linked from JLPT pages rather than copied. The linked PDF is not bundled into the site or service-worker cache.

Official N2 pass guidance is 90/180 overall plus at least 19/60 in each of the Language Knowledge, Reading, and Listening sections. The app’s raw practice accuracy is not converted to the JLPT scaled score and is not a pass prediction. Online resources are curated rather than exhaustive. There are no accounts or cross-device sync; learning and checklist progress stays in the browser on that device.

## Run locally

Open `index.html` in a browser. For service worker and install support, serve the directory over HTTPS or locally, for example:

```sh
python3 -m http.server 8000
```

## Deployment

The frontend is deployed as a static PWA on Vercel. The `/api/ai` endpoint requires the Vercel serverless runtime under `api/`.

Current Vercel project: `japanesesite`  
Public production URL: https://japanesesite-dusky.vercel.app/

## Phase 3 — AI先生

The frontend remains a static PWA. AI requests go through the same-origin `/api/ai` serverless boundary on Vercel.

Configure these server-side environment variables in Vercel:

- `AI_API_KEY` — provider secret; never put this in frontend code or localStorage.
- `AI_PROVIDER_URL` — an OpenAI-compatible chat endpoint URL.
- `AI_MODEL` — provider model name.

Without all three variables, the AI UI remains available but reports that the secure endpoint is not configured. Vocabulary, Kanji, Grammar, QuizEngine, Review, Timer and offline core learning continue to work without AI.

The Phase 3 frontend sends only bounded learning context: target JLPT, study time, progress summaries, recent mistakes, due reviews, limited quiz history, limited study history and selected learning content. AI chat history is bounded to 50 messages in `nihongo-learning-state-v2`.

Local development with `python3 -m http.server 8000` exercises the frontend only; it does not provide the secure `/api/ai` server function. A local mock provider is included for development/runtime validation only. It is never enabled automatically and must not be presented as production AI.

## Phase 3.5 — Production QA

Phase 3.5 adds a repository QA harness under `qa/` and a GitHub Actions workflow under `.github/workflows/`. The checks cover state regression, N2 bank totals, localized answer keys, 85-question mock assembly, section timing/break/timeout/quit flow, AI request limits, action validation, provider error normalization, unsafe execution scans, manifest parsing and local asset references. Run them with `node qa/phase-3.5-smoke.cjs`.

Production AI configuration remains server-side only via `AI_API_KEY`, `AI_PROVIDER_URL` and `AI_MODEL`; no secret values belong in this repository. Browser E2E must be verified on an accessible deployed build before release.

## Phase 3.6 — Production Verification

Phase 3.6 verified the repository state with direct Node runtime checks for the AI API boundary and `ai-actions.js`, plus a successful GitHub Actions QA run. The workflow now runs an executable qa job. The repository has no package.json, so npm-based test/lint/typecheck/build commands are not defined.

## Phase 3.7 — Vercel Deployment Recovery

The Vercel project connection is now authorized for the `enhtvbshin2-5342` scope and the public production URL responds with HTTP 200. The current production deployment is on `main`; the `phase-3.5-production-qa` branch still needs its own preview deployment before browser E2E can be run against the Phase 3.7 code path.
