
# Phase 5.0 — Implementation Plan

## 1. Execution model

Phase 5 should not be executed as one giant rewrite.

Each implementation phase must follow:

    audit
      -> small change set
      -> unit/integration regression
      -> responsive check
      -> accessibility check
      -> visual review
      -> merge
      -> next phase

Core principle:

**new UI may replace old UI, but the learning domain must remain stable.**

## 2. Dependency map

### Foundation

Phase 5.1 -> 5.2 -> 5.3

### User setup

Phase 5.4 -> 5.5

### Content surfaces

Phase 5.6 -> 5.10

### Skill expansion

Phase 5.11 -> 5.12

### Review and assessment

Phase 5.13 -> 5.15

### AI

Phase 5.16

### Product platform

Phase 5.17 -> 5.19

### Release

Phase 5.20

Account/cloud architecture should be designed early but implemented only after the local canonical model is stable.

## 3. Phase 5.1 — Design system

### Goal

Create the visual foundation without changing learning behavior.

### Tasks

- semantic color tokens
- typography scale
- spacing scale
- radius/elevation
- buttons
- inputs
- cards
- badges/status chips
- progress primitives
- modal/drawer
- toast/alert
- loading skeleton
- empty/error patterns
- accessibility contracts

### Preserve

Existing visual identity and current learning state.

### Acceptance

- primitives can be reused on two or more screens
- no new feature-specific button language
- 320-1920 responsive behavior documented
- keyboard focus works

## 4. Phase 5.2 — Navigation

### Goal

Make one canonical navigation owner.

### Tasks

- route registry
- sidebar
- desktop header
- mobile bottom navigation
- More menu
- active state
- hash/deep-link compatibility
- back/forward behavior

### Acceptance

Every primary route is deep-linkable and has one owner.

## 5. Phase 5.3 — Dashboard 2.0

### Goal

Turn home into the learning command center.

### Tasks

- greeting/level/streak
- today's mission
- continue learning
- review due
- AI recommendation
- weekly activity
- JLPT block
- factual progress metrics
- empty first-run state

### Preserve

Timer, study session logging, existing progress calculations.

### Acceptance

The first viewport clearly answers "what should I study now?" without fake statistics.

## 6. Phase 5.4 — Onboarding

### Goal

Create a reliable first-run setup.

### Tasks

- welcome
- level selection
- unknown level
- goal selection
- daily time
- skill priority
- personalized start
- onboarding persistence

### Dependencies

User learning profile contract from LEARNING_DATA_MODEL.md.

### Acceptance

A guest can finish onboarding without AI or account creation.

## 7. Phase 5.5 — Profile and settings

### Tasks

- profile summary
- target JLPT
- daily target
- preferred study time
- skill priorities
- language
- accessibility
- notification preferences placeholder
- data export/import placeholder
- AI privacy summary

### Acceptance

All settings map to canonical state or an explicitly documented future field.

## 8. Phase 5.6 — Vocabulary redesign

### Tasks

- new card
- detail panel
- search/filter
- status filter
- favorites
- audio
- practice CTA
- SRS metadata
- empty/error states

### Preserve

Vocabulary IDs, favorites, QuizEngine, LearningStore.

## 9. Phase 5.7 — Kanji redesign

### Tasks

- derived-kanji migration view
- detail
- related vocabulary
- status
- practice

### Before standalone data

Show only verified fields. Do not invent stroke order/radicals.

### Later

Introduce standalone kanji catalog with legacy ID mapping.

## 10. Phase 5.8 — Grammar redesign

### Tasks

- pattern card
- formation
- meaning
- examples
- filters
- practice
- related grammar

### Preserve

Existing grammar normalization and IDs.

## 11. Phase 5.9 — Listening

### Preconditions

A real audio/content model must exist.

### Tasks

- audio player
- replay
- speed
- transcript
- translation toggle
- comprehension questions
- result recording

### Important

Do not fill empty states with fabricated audio content.

## 12. Phase 5.10 — Reading

### Preconditions

A real passage model must exist.

### Tasks

- passage reader
- furigana toggle
- lookup
- question flow
- result recording
- difficult-item capture

## 13. Phase 5.11 — Speaking

### Preconditions

A browser-supported recording contract and privacy policy.

### Tasks

- prompt
- record
- playback
- attempt history
- feedback placeholder
- retry

Pronunciation AI is a later dependency.

## 14. Phase 5.12 — Writing

### Tasks

- prompt
- editor
- submit
- correction surface
- revision
- attempt history

AI correction can reuse the existing secure AI path without moving secrets to the client.

## 15. Phase 5.13 — Review/SRS

### Goal

Expose the current review engine as a first-class product experience.

### Tasks

- due now
- overdue
- mistakes
- difficult
- review session
- review result
- next-review explanation

### Preserve

Current 1/3/7/14/30 interval behavior until a new scheduler is intentionally introduced.

## 16. Phase 5.14 — JLPT

### Tasks

- N5-N1 curriculum map
- diagnostic test
- section practice
- timed mode
- history
- score breakdown
- weak-area analysis

### Important

Do not present readiness/probability claims until there is enough empirical data.

## 17. Phase 5.15 — Progress and analytics

### Tasks

- study time
- active days
- accuracy
- learned items
- review completion
- skill-level charts
- weekly trend
- factual JLPT progress

### Acceptance

Every metric traces to real persisted state.

## 18. Phase 5.16 — AI Teacher 2.0

### Preserve

- /api/ai server boundary
- request limits
- action allowlist
- candidate validation
- no client secrets
- advisory study plans
- bounded chat history

### Add

- better context presentation
- learning mode selection
- role-play
- structured writing correction
- adaptive explanations
- scenario prompts
- teacher memory rules

AI should consume canonical learning state and never become its owner.

## 19. Phase 5.17 — Gamification

### Tasks

- streak
- missions
- achievements
- XP/reward model
- progress feedback

Rules:

- never fake learning
- rewards are tied to real completed actions
- user can ignore gamification

## 20. Phase 5.18 — Account/cloud architecture

### Tasks

- account state model
- guest mode
- sign-in
- migration preview
- local-to-cloud sync
- conflict resolution
- offline changes
- last-updated markers

### Dependency

Local canonical state must be stable first.

## 21. Phase 5.19 — Admin/content system

### Tasks

- content schema
- draft/review/publish workflow
- versioning
- content QA
- user support tools
- AI usage visibility
- basic moderation/audit log

This is a separate operational surface from the learner app.

## 22. Phase 5.20 — Production hardening

### Tasks

- security review
- rate limiting
- performance
- PWA/offline
- SEO
- accessibility audit
- mobile QA
- error reporting
- monitoring
- regression suite
- deployment checklist
- rollback procedure

### Acceptance

Release requires passing:

- unit/regression
- API security
- responsive
- accessibility
- E2E on deployed build
- production AI verification when AI is enabled

## 23. QA matrix

| Area | Phase 5 test requirement |
|---|---|
| Learning state | old v2 fixture loads |
| SRS | due dates remain compatible |
| Quiz | existing quiz modes still work |
| Timer | session logs remain valid |
| AI API | all current validation/security tests still pass |
| Navigation | every route deep-links |
| Mobile | 320/375/390/430 checks |
| Desktop | 1024/1280/1440/1920 checks |
| Accessibility | keyboard/focus/reduced-motion |
| PWA | cache inventory + offline shell |
| Data migration | legacy -> v2 -> future profile |
| Content | stable IDs and versioning |

## 24. Risk gates

Do not proceed to the next phase when:

- v2 state cannot be read
- existing QuizEngine breaks
- review scheduling changes unexpectedly
- timer records are lost
- AI security boundaries regress
- mobile navigation becomes unusable
- new UI contains fabricated progress/content
- a production dependency is required but not defined

## 25. Documentation rule

Each implementation phase should update its own short phase notes and acceptance evidence. The six Phase 5.0 documents remain the architectural baseline.

## 26. Final target

The finished platform should eventually behave like:

    onboarding
       ->
    personal learning home
       ->
    focused learning activity
       ->
    immediate feedback
       ->
    review
       ->
    progress
       ->
    next recommendation
       ->
    long-term JLPT/goal progress

The commercial-grade transformation is therefore a controlled migration from the current static PWA, not a rewrite of working learning engines.
