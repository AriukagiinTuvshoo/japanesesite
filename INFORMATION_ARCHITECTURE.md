
# Phase 5.0 — Information Architecture

## 1. Current navigation audit

The initial HTML contains a small desktop navigation and a larger sidebar with:

- dashboard
- learn
- vocabulary
- kanji placeholder
- grammar placeholder
- listening placeholder
- reading placeholder
- JLPT placeholder
- progress placeholder
- settings

learning-ui.js later replaces the nav with a runtime route list including:

- dashboard
- study hub
- learn
- vocabulary
- kanji
- grammar
- practice
- mistakes
- progress
- AI Teacher

A mobile navigation is also generated at runtime with six primary entries.

This is functional, but the product currently has two navigation definitions and multiple naming schemes.

## 2. Target information architecture

### Primary learning navigation

1. Home
2. Learn
3. Vocabulary
4. Kanji
5. Grammar
6. Listening
7. Reading
8. Speaking
9. Writing
10. Conversation
11. JLPT
12. Review
13. Progress
14. AI Teacher
15. Study Plan

### Secondary navigation

16. Profile
17. Notifications
18. Settings
19. Help

### Public product surface

- Home / landing
- How it works
- JLPT learning
- AI Teacher
- Pricing (when subscription exists)
- Sign in / create account

Public marketing and the learning application should be conceptually separate even if they remain in one deployment.

## 3. Route registry proposal

Use a central route registry with:

| Field | Meaning |
|---|---|
| id | stable internal route name |
| path/hash | user-facing navigation target |
| label | localized label |
| icon | navigation icon |
| group | learning / assessment / account |
| screen | page owner |
| auth | guest/account requirement |
| offline | whether route is usable offline |
| priority | mobile navigation priority |

The Phase 5 implementation should keep hash routing until a different router is intentionally introduced.

Suggested route IDs:

- home
- learn
- vocabulary
- kanji
- grammar
- listening
- reading
- speaking
- writing
- conversation
- jlpt
- review
- progress
- ai-teacher
- study-plan
- profile
- notifications
- settings
- help

## 4. App shell structure

    App shell
      +-- global header
      |    +-- current section
      |    +-- language
      |    +-- notifications
      |    +-- profile
      |
      +-- primary navigation
      |
      +-- main content
      |
      +-- optional contextual rail
      |
      +-- mobile navigation

The shell owns navigation and page chrome. Feature screens own learning content.

## 5. Screen hierarchy

### Home

Purpose: daily command center.

Priority:

1. greeting + level
2. today's mission
3. continue learning
4. review due
5. recommended next activity
6. weekly progress
7. JLPT status
8. AI recommendation

### Learn

Purpose: structured curriculum.

Contains:

- current level
- course path
- next lesson
- skill mix
- prerequisites

### Vocabulary

Purpose: discover, learn and review vocabulary.

Contains:

- search
- level filter
- status filter
- favorites
- content card
- detail view
- practice CTA
- review metadata

### Kanji

Purpose: standalone future kanji curriculum.

Contains:

- character
- readings
- meanings
- radicals
- stroke information when data is available
- connected vocabulary
- review state

During migration, derived kanji must remain available through compatibility IDs.

### Grammar

Purpose: learn and compare grammar patterns.

Contains:

- level
- pattern
- formation
- meaning
- examples
- related patterns
- practice

### Listening

Purpose: comprehension through audio.

Future screen contract:

- audio
- replay
- speed
- transcript
- translation toggle
- questions
- results

### Reading

Purpose: reading comprehension.

Future contract:

- passage
- furigana control
- inline lookup
- grammar lookup
- comprehension questions
- progress

### Speaking

Purpose: guided production.

Future contract:

- prompt
- recording state
- attempt history
- feedback
- retry

### Writing

Purpose: sentence/short-text production.

Future contract:

- prompt
- input
- correction
- explanation
- revision
- saved attempts

### Conversation

Purpose: scenario-based dialogue.

Future contract:

- scenario
- role
- turn history
- hints
- exit/restart
- reflection

### JLPT

Purpose: diagnostic, practice and mock examination.

Subsections:

- target level
- diagnostic
- vocabulary
- kanji
- grammar
- reading
- listening
- mock exam
- history
- readiness analysis

### Review

Purpose: due learning, mistakes and weak items.

Subsections:

- due now
- overdue
- mistakes
- difficult
- favorites

### Progress

Purpose: factual analytics only.

Subsections:

- time
- accuracy
- mastered content
- skill progress
- weekly trend
- streak
- JLPT progress

### AI Teacher

Purpose: AI guidance layered on top of real learning data.

Subsections:

- ask
- explain
- practice
- writing correction
- conversation
- JLPT coaching
- suggested plan

AI should not become a separate source of learning truth.

### Study Plan

Purpose: daily/weekly planning.

Contains:

- today's plan
- estimated time
- task order
- completion
- adjustments

## 6. Mobile IA

The mobile bottom navigation should prioritize five to six destinations:

1. Home
2. Learn
3. Review
4. Progress
5. AI Teacher
6. More

"More" opens the secondary feature menu rather than squeezing 15 items into a bottom bar.

## 7. Onboarding IA

    Welcome
      ->
    Level
      ->
    Goal
      ->
    Daily time
      ->
    Skill priority
      ->
    Personalized start plan
      ->
    Home

A placement test can be offered after or instead of self-selected level.

The onboarding flow must support "Unknown" level.

## 8. Profile IA

Profile should contain:

- current level
- target JLPT
- goals
- daily target
- preferred time
- skill priorities
- study streak
- total study time
- progress summary

Avoid unnecessary personal information.

## 9. Settings IA

Settings should own:

- language
- notifications
- study goal
- accessibility
- data export/import
- AI privacy
- account
- offline behavior

## 10. Migration strategy

Phase 5.1-5.3 should create one route registry and app-shell navigation. Existing hash targets can remain valid while UI ownership changes.

Do not remove old anchors until the replacement screen is mounted and regression-tested.

## 11. Navigation rules

- navigation changes URL/hash and active state
- navigation never mutates learning progress
- screens request domain data through stable interfaces
- deep-linking to every primary route must work
- back/forward browser behavior must remain meaningful
- current section must be programmatically identifiable
