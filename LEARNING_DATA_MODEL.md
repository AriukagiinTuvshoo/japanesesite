
# Phase 5.0 — Learning Data Model

## 1. Current model

The current browser-local model is centered on the v2 learning state.

Current top-level domains:

    state
      +-- version
      +-- settings
      +-- progress
      +-- favorites
      +-- mistakes
      +-- quizHistory
      +-- studySessions
      +-- meta
      +-- streak
      +-- legacy
      +-- ai

The model is normalized by learning-engine.js.

## 2. Current content identity

Current types:

- vocabulary
- kanji
- grammar

Vocabulary IDs are normalized as vocabulary:<Japanese word>.

Grammar IDs are generated from level + lesson tag.

Kanji IDs are kanji:<character>.

Kanji records are currently derived from WORDS, using kanji characters found in vocabulary.

### Target compatibility rule

Existing IDs are immutable during the Phase 5 migration.

A future standalone catalog may add:

- canonical content ID
- legacy ID
- version
- source
- license
- content status

but current IDs must remain resolvable.

## 3. Content item target model

All learning items should conceptually support:

| Field | Purpose |
|---|---|
| id | immutable canonical identity |
| type | vocabulary / kanji / grammar / etc. |
| level | primary JLPT level |
| levels | multiple applicable levels |
| title | localized display label |
| japanese | Japanese content |
| reading | reading/kana |
| meanings | localized meanings |
| examples | example set |
| tags | semantic/topic/skill tags |
| difficulty | content difficulty |
| prerequisites | prior knowledge |
| source | content source |
| version | content revision |
| status | draft/reviewed/published |
| metadata | feature-specific information |

## 4. Current progress model

Each progress record currently tracks:

- seen
- practiced
- correct
- incorrect
- answers
- favorite
- status
- intervalIndex
- nextReviewAt
- lastAnswerAt
- lastCorrect

The next model should keep this information but make the concepts explicit:

### Item progress

    itemProgress
      id
      contentId
      userId (future)
      status
      seenCount
      practiceCount
      correctCount
      incorrectCount
      answerCount
      confidence
      firstSeenAt
      lastSeenAt
      lastReviewedAt

### Review state

    reviewState
      contentId
      scheduler
      intervalIndex
      ease/confidence (when introduced)
      dueAt
      lastResult
      reviewCount

The current interval model should remain supported during migration.

## 5. Mistake model

Current mistakes include:

- contentId
- type
- selectedAnswer
- correctAnswer
- count
- wrongCount
- correctCount
- lastMistakeAt
- source
- resolvedAt

Target model:

    mistake
      id
      contentId
      questionId
      selected
      expected
      reasonCategory
      firstSeenAt
      lastSeenAt
      wrongCount
      resolvedAt
      severity
      source

ReasonCategory can later support:

- recall
- reading
- meaning
- grammar-form
- listening
- timing
- careless

Do not infer a reason until evidence exists.

## 6. Quiz model

Current QuizEngine creates multiple-choice questions from learning data.

Target assessment model:

    assessment
      id
      type
      level
      mode
      startedAt
      completedAt
      duration
      score
      accuracy
      itemResults[]

    itemResult
      contentId
      questionId
      selected
      expected
      correct
      responseTime
      category

The existing quiz history should remain readable.

## 7. Study session model

Current study sessions contain:

- day
- startedAt
- endedAt
- duration
- activity

Target:

    studySession
      id
      startedAt
      endedAt
      durationSec
      activityType
      route
      completed
      source
      metadata

The timer remains a producer of session records, not the owner of learning progress.

## 8. User learning profile

Future profile should include only learning-relevant data:

    learningProfile
      currentLevel
      targetJLPT
      goalTypes[]
      dailyGoalMinutes
      preferredStudyTime
      skillPriorities[]
      onboardingCompleted
      placementResult
      createdAt
      updatedAt

No unnecessary personal fields are required.

## 9. Skill model

Target standardized skills:

- vocabulary
- kanji
- grammar
- listening
- reading
- speaking
- writing
- conversation
- JLPT

Every activity should be attributable to one or more skills.

## 10. Difficulty model

Difficulty must be distinct from JLPT level.

JLPT level answers "curriculum level"; difficulty answers "how challenging this item currently is".

Future difficulty inputs may include:

- content authoring difficulty
- learner success rate
- response time
- repeated mistakes

Do not silently equate N3 with a single numeric difficulty.

## 11. Learning status model

Keep the existing statuses for backward compatibility:

- NEW
- LEARNING
- FAMILIAR
- WEAK
- MASTERED

Target design may later add:

- REVIEW_DUE
- OVERDUE

but these should be scheduler-derived views, not replacement states in persisted item progress.

## 12. Favorites/bookmarks

Current favorites are type-specific arrays.

Target:

    bookmark
      contentId
      userId
      createdAt
      collectionId (optional)

The first cloud migration can preserve favorite IDs exactly.

## 13. AI state

Current AI state contains:

- preferences
- recentChats (max 50)
- lastPlan
- updatedAt

Target AI state should stay derived/advisory:

- conversation history
- tutor preferences
- last recommendations
- accepted plan
- feedback signals

AI must never become the authoritative store for progress or content identity.

## 14. Local-to-cloud migration

Migration path:

    browser v2 state
        |
        v2 export snapshot
        |
        normalization
        |
        account-linked import
        |
        conflict resolution
        |
        synced user state

Conflict rule must be defined before account rollout.

A simple first version can use field-level timestamps plus deterministic merge for append-only history.

## 15. Content versioning

Published content needs:

- immutable ID
- version
- status
- createdAt
- updatedAt
- reviewedAt

Learner progress must attach to the stable content ID, not a temporary text version.

## 16. Data retention and limits

Keep bounded collections where they are already bounded:

- recent AI chat: 50
- quiz history: 100
- study sessions: 500

Future cloud data should use explicit retention rules, not unbounded browser growth.

## 17. Data migration rules

1. Never discard old state on schema upgrades.
2. Version every persistent model.
3. Migrate forward deterministically.
4. Keep a rollback-safe snapshot before destructive transformations.
5. Test old v2 state fixtures against each migration.

## 18. Definition of done

The data model is ready when every future feature can identify:

- content
- learner
- skill
- activity
- result
- progress
- review state
- history

without inventing a second incompatible state system.
