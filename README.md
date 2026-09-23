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

The static site is deployed from the `main` branch to Render and redeploys automatically on commits.
