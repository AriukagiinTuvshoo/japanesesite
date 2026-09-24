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

The frontend is a static PWA and can be served from a static host. The `/api/ai` endpoint requires a deployment target that supports serverless functions under `api/`.


## Phase 3 — AI先生

The frontend remains a static PWA. AI requests go through the same-origin `/api/ai` serverless boundary when deployed on a platform that supports the `api/` directory (for example, a Vercel-style serverless function).

Configure these server-side environment variables in the deployment platform:

- `AI_API_KEY` — provider secret; never put this in frontend code or localStorage.
- `AI_PROVIDER_URL` — an OpenAI-compatible chat endpoint URL.
- `AI_MODEL` — provider model name.

Without all three variables, the AI UI remains available but reports that the secure endpoint is not configured. Vocabulary, Kanji, Grammar, QuizEngine, Review, Timer and offline core learning continue to work without AI.

The Phase 3 frontend sends only bounded learning context: target JLPT, study time, progress summaries, recent mistakes, due reviews, limited quiz history, limited study history and selected learning content. AI chat history is bounded to 50 messages in `nihongo-learning-state-v2`.

Local development with `python3 -m http.server 8000` exercises the frontend only; it does not provide the secure `/api/ai` server function. A local mock provider is included for development/runtime validation only. It is never enabled automatically and must not be presented as production AI.


## Phase 3.5 — Production QA

Phase 3.5 adds a repository QA harness under `qa/` and a GitHub Actions workflow under `.github/workflows/`. The checks cover state regression, AI request limits, action validation, provider error normalization, unsafe execution scans, manifest parsing and local asset references.

Production AI configuration remains server-side only via `AI_API_KEY`, `AI_PROVIDER_URL` and `AI_MODEL`; no secret values belong in this repository. The current environment could not complete real browser click-through testing, so browser E2E must be verified on an accessible deployed build before release.

## Phase 3.6 — Production Verification

Phase 3.6 verified the current repository state with direct Node runtime checks for the AI API boundary and ai-actions.js, plus a successful GitHub Actions QA run. The workflow now runs an executable qa job. The repository has no package.json, so npm-based test/lint/typecheck/build commands are not defined.

The current commit has not been verified against a live production AI provider because server credentials are not exposed to this environment. Browser E2E remains unverified because browser automation is unavailable here. GitHub reports the current Vercel status as failed with a deployment-rate-limit target, so the deployed build is not a valid E2E target yet.
