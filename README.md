# Nihongo JLPT — Japanese study in three languages

A small mobile-first, installable web app for studying Japanese in Mongolian, English and Japanese. The static site can be hosted with GitHub Pages.

## Run locally

Open `index.html` in a browser. For service-worker/offline and install support, serve the directory over HTTPS or a local web server (for example `python3 -m http.server 8000`).

## Included

- Interface language selector: Монгол / English / 日本語
- N5–N1 study-path overview
- Searchable, level-filtered starter vocabulary with Japanese reading, Mongolian and English meanings, example sentences, browser speech, and saved words
- Five original practice questions, translated choices, and explanations
- Responsive mobile navigation and PWA manifest/service worker
- Local browser storage for selected language, study streak, and saved words

## Content coverage

The current glossary is a reviewed starter set of 24 words. It is not a complete JLPT syllabus and the practice questions are not official JLPT questions. The supplied dictionary data contains many entries without JLPT level labels and has limited Mongolian translations; those entries need level mapping and translation review in batches before they can be presented as a complete multilingual dictionary. No scanned commercial textbooks are redistributed here.

Progress is currently stored in the learner's browser on that device. Cross-device account sync needs a configured backend and user authentication.

## Deploy with GitHub Pages

In the repository settings, enable **Pages** and publish from the `main` branch root. Use the resulting HTTPS URL to install the web app from the browser's share/menu options.
