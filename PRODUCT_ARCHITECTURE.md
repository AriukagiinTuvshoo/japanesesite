
# Phase 5.0 — Product Architecture Audit

> Audit scope: repository state at d6e9b2403ab41ba73f4300985359437a0c09f3bd on main.
> Phase 5.0 is architecture/design planning only.

## Audit conclusion

The repository is not an empty prototype. It already has three meaningful layers:

1. Legacy static application layer: index.html + app.js.
2. Shared learning layer: learning-engine.js.
3. Connected Phase 2/3 UI and AI layer: learning-ui.js, AI modules, and /api/ai.

The main architectural problem is ownership and composition, not lack of functionality. The product should move toward one app shell and one canonical learning domain while preserving the current engines.

## Current architecture

    Browser
      |
      +-- index.html
      |    +-- initial dashboard / hero / level / vocabulary / quiz markup
      |    +-- placeholder sections
      |
      +-- app.js
      |    +-- MN/EN/JA translations
      |    +-- level metadata
      |    +-- lesson datasets
      |    +-- 24-word starter vocabulary
      |    +-- 5-question starter quiz
      |    +-- legacy localStorage
      |    +-- timer + legacy dashboard
      |
      +-- learning-engine.js
      |    +-- LearningData
      |    +-- LearningStore
      |    +-- SRS
      |    +-- progress / mistakes / favorites
      |    +-- quiz history
      |    +-- study sessions
      |    +-- QuizEngine
      |
      +-- learning-ui.js
      |    +-- study hub
      |    +-- derived kanji
      |    +-- grammar
      |    +-- mistakes / review
      |    +-- progress
      |    +-- quiz flow
      |
      +-- AI browser layer
      |    +-- ai-context.js
      |    +-- ai-actions.js
      |    +-- ai-provider.js
      |    +-- ai-teacher.js
      |
      +-- /api/ai
      |    +-- server-side provider boundary
      |
      +-- sw.js + manifest.webmanifest
           +-- PWA shell and offline cache

## Current canonical learning state

The canonical normalized state is the v2 learning state. It contains:

- settings
  - language
  - level
  - dailyGoal
- progress
  - vocabulary
  - kanji
  - grammar
- favorites
  - vocabulary
  - kanji
  - grammar
- mistakes
- quizHistory
- studySessions
- meta.quizBest
- streak
- legacy
- ai
  - preferences
  - recentChats
  - lastPlan
  - updatedAt

A progress record tracks seen/practiced, correct/incorrect, answers, favorite, status, interval index, next review, last answer time, and last-correct state.

The current SRS interval sequence is 1, 3, 7, 14, and 30 days.

Current derived statuses are NEW, LEARNING, FAMILIAR, WEAK, MASTERED.

## Current content reality

- Vocabulary: 24 curated starter items.
- Grammar: normalized from starter/more lesson data embedded in app.js.
- Kanji: derived from kanji characters found in the current vocabulary; no standalone kanji dataset exists yet.
- Starter quiz bank: 5 original questions.
- Listening and reading: not yet independent content engines; current UI uses placeholder states and study activity labels exist in the engine.
- Speaking, writing, conversation, accounts, authentication, cloud sync, subscriptions, notifications, admin CMS, and user management are not independent product subsystems yet.

## Major architecture problems

### 1. Two UI generations coexist

index.html/app.js owns the original product shell while learning-ui.js hides/replaces parts of that shell and appends new sections.

This creates duplicate concepts such as dashboard rendering and navigation ownership.

Migration rule: keep the engines and migrate the shell one route at a time into a single composition layer.

### 2. Legacy and canonical state coexist

The v2 state is the modern source of truth, but the original app still reads and writes keys such as:

- nihongo-level
- nihongo-done
- nihongo-saved
- nihongo-language
- nihongo-streak
- nihongo-last-study
- nihongo-daily-goal
- nihongo-study-sessions
- nihongo-quiz-best

LearningStore already has migration/synchronization behavior. The correct strategy is deprecation, not destructive replacement.

### 3. Content is embedded in app.js

Lessons, vocabulary and the starter quiz are bundled into the same large application script.

Future content should become versioned data modules or manifests without changing current IDs.

### 4. No formal route registry

Hash navigation works, but there is no screen contract for:

- route
- page owner
- loading state
- access state
- empty/error behavior
- responsive layout

### 5. CSS is not yet a real design system

style.css, phase2.css and ai-teacher.css each own parts of the visual language. There are many overlapping responsive rules and no formal component contract.

### 6. Feature readiness is uneven

Vocabulary, quiz, progress and AI have concrete implementations. Kanji is derived-only. Listening and reading are mostly placeholders. Speaking and writing are not learning engines. JLPT is not a full assessment engine.

### 7. No account/cloud persistence

The current model is browser-local. Account migration must preserve anonymous progress.

### 8. No formal content identity layer

The current IDs are useful but future content needs immutable IDs, versioning, level, skill tags, prerequisites, source/license metadata, and content status.

## Proposed commercial-grade architecture

    App Shell
      |
      +-- Identity / Session
      +-- User Learning Profile
      +-- Content Catalog
      +-- Learning Activity Engine
      |    +-- Vocabulary
      |    +-- Kanji
      |    +-- Grammar
      |    +-- Listening
      |    +-- Reading
      |    +-- Speaking
      |    +-- Writing
      |    +-- Conversation
      |    +-- JLPT
      +-- Review / SRS
      +-- Assessment
      +-- Progress / Analytics
      +-- AI Teacher
      +-- Notifications
      +-- Entitlements / Subscription
      +-- Admin / Content Ops

Recommended client layers:

1. App shell — routing, layout, navigation, global states.
2. Design system — tokens and reusable primitives.
3. Feature modules — learning, review, assessment, AI.
4. Domain services — preserve LearningStore, QuizEngine, and review logic.
5. Persistence adapter — browser-local now, sync-capable later.
6. API adapter — same-origin endpoints with server-only secrets.

## Source-of-truth policy

| Domain | Current source | Phase 5 target |
|---|---|---|
| User settings | v2 + legacy sync | User profile repository |
| Vocabulary | WORDS in app.js | Versioned content catalog |
| Grammar | lesson data in app.js | Versioned grammar catalog |
| Kanji | derived vocabulary characters | Standalone kanji catalog + compatibility IDs |
| Progress | LearningStore | Learning repository |
| SRS | LearningStore | Review scheduler service |
| Quiz generation | QuizEngine | Assessment service |
| AI context | AIContextBuilder | Personalization context service |
| AI validation | AIActions + API validation | Preserve and extend |
| Study timer | app.js + legacy bridge | Study session service |
| PWA | sw.js | Preserve with explicit asset policy |

## Migration strategy

### Preserve IDs

Do not change existing vocabulary, grammar or kanji IDs during migration.

### Preserve state

Every migration must continue to read and write the v2 state.

### Adapter first

Move each subsystem through:

existing implementation -> compatibility adapter -> canonical interface -> new UI -> legacy retirement

### No speculative backend

Phase 5.0 defines contracts. It does not require a database or authentication provider.

### Document before redesign

Design system and route contracts land before visual refactors.

## Implementation order

1. Design tokens and primitives
2. App-shell and navigation contract
3. Canonical route registry
4. Dashboard composition
5. Onboarding/profile/settings contracts
6. Content adapters
7. Module UI migrations
8. Review/SRS surface
9. JLPT assessment surface
10. AI Teacher 2.0 surface
11. Analytics and gamification
12. Account/cloud adapter
13. Admin/content operations
14. Production hardening

## Risks

| Risk | Mitigation |
|---|---|
| Existing progress breaks | Preserve v2 state and IDs |
| Timer/session regression | Keep current timer adapter until replacement passes regression |
| AI security regression | Preserve /api/ai, validation, limits, server-only credentials |
| Kanji ID mismatch | Introduce compatibility mapping first |
| CSS regressions | Incremental token/component adoption |
| Mobile navigation regression | Test 320/375/390/430 widths before desktop polish |
| PWA cache regression | Verify asset inventory before every cache-version change |
| Content scaling | Version content through data interfaces |
| Cloud migration data loss | Define export/import and conflict policy first |

## Non-goals for Phase 5.0

- No visual redesign implementation
- No authentication implementation
- No cloud database
- No production configuration changes
- No AI provider change
- No deletion of existing learning engine code
- No deployment

## Phase 5.0 definition of done

The six planning documents agree on terminology, state ownership, route ownership and migration order, and the next implementation phase can proceed incrementally without changing current core learning behavior.
