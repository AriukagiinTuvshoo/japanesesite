# Nihongo — Japanese study for Mongolian speakers

A mobile-first Japanese learning site with a Mongolian interface. Japanese is written with hiragana, katakana, and kanji; each vocabulary card shows a kana reading so learners can distinguish the Japanese reading from the kanji form.

## Learning tools

- Interface language: Mongolian, English, or Japanese
- N5–N1 overview and level selection
- Six guided starter lessons for each JLPT level from N5 to N1, with level-appropriate grammar examples and reading support
- Searchable 24-word starter glossary, with kana readings, Mongolian and English meanings, example sentences, browser speech, and a saved-words filter
- Five original N5 practice questions with explanations, answer feedback, and a score
- Lesson completion, language, level, saved words, and daily streak stored in the current browser
- Responsive layout, installable PWA manifest, and offline app-shell cache

## Content scope

This is a reviewed starter course, not a complete JLPT syllabus. Each JLPT level currently has six short original lessons, but the glossary and practice bank are intentionally small starter sets. Vocabulary and questions are original study examples, not official JLPT material. The site does not provide accounts or cross-device progress sync; local progress stays in the browser on that device.

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

Phase 3.5 adds a repository QA harness under `qa/` and a GitHub Actions workflow under `.github/workflows/`. The checks cover state regression, AI request limits, action validation, provider error normalization, unsafe execution scans, manifest parsing and local asset references.

Production AI configuration remains server-side only via `AI_API_KEY`, `AI_PROVIDER_URL` and `AI_MODEL`; no secret values belong in this repository. Browser E2E must be verified on an accessible deployed build before release.

## Phase 3.6 — Production Verification

Phase 3.6 verified the repository state with direct Node runtime checks for the AI API boundary and `ai-actions.js`, plus a successful GitHub Actions QA run. The workflow now runs an executable qa job. The repository has no package.json, so npm-based test/lint/typecheck/build commands are not defined.

## v7.0 — Commercial UI foundation

The v7.0 UI foundation is applied incrementally on top of the existing Vanilla HTML/CSS/JavaScript PWA. The learning engine, nihongo-learning-state-v2, QuizEngine, review scheduler, AI boundary and service-worker architecture remain the source of truth.

The commercial design layer is centralized under css/ (tokens.css, typography.css, layout.css, components.css, utilities.css, legacy.css). A persistent light/dark theme preference is stored separately as nihongo-theme; it does not modify learning state.

The v7.0 service worker cache is versioned as nihongo-v7.0-v1 and precaches the centralized design assets. AI remains optional and online-only.

## Phase 3.7 — Vercel Deployment Recovery

The Vercel project connection is now authorized for the `enhtvbshin2-5342` scope and the public production URL responds with HTTP 200. The current production deployment is on `main`; the `phase-3.5-production-qa` branch still needs its own preview deployment before browser E2E can be run against the Phase 3.7 code path.
