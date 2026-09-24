
# Phase 5.0 — UX Flows

## 1. UX approach

The current application encourages short daily practice, stores progress locally, supports review and has an AI Teacher layer. The target UX should turn those capabilities into one coherent daily learning loop:

    Enter
      -> know what to do
      -> learn
      -> answer
      -> receive feedback
      -> review
      -> see progress
      -> get next recommendation

The user should rarely need to decide "what should I study next?" without guidance.

## 2. Global navigation flow

    Home
      |
      +--> Learn
      +--> Review
      +--> Progress
      +--> AI Teacher
      +--> More
            +--> Vocabulary
            +--> Kanji
            +--> Grammar
            +--> Listening
            +--> Reading
            +--> Speaking
            +--> Writing
            +--> Conversation
            +--> JLPT
            +--> Study Plan
            +--> Profile
            +--> Settings
            +--> Help

Navigation never directly mutates learning state.

## 3. First-run onboarding

### Step 1 — Welcome

Goal: explain the product in one screen.

Show:

- what the platform teaches
- short study-time promise
- language choice
- continue button

### Step 2 — Current level

Choices:

- Beginner
- N5
- N4
- N3
- N2
- N1
- Unknown

Important: "Unknown" must not force an arbitrary level into the user's profile before diagnosis.

### Step 3 — Goal

Choices:

- JLPT
- conversation
- work
- travel
- school
- daily Japanese

Allow more than one goal.

### Step 4 — Daily time

Choices:

- 10 min
- 20 min
- 30 min
- 45 min
- 60+ min

Current app defaults to 20 minutes, so migration should preserve that default unless the user chooses another value.

### Step 5 — Skill priority

Allow selection of:

- vocabulary
- kanji
- grammar
- listening
- reading
- speaking
- writing

The selected priorities affect recommendations, not content availability.

### Step 6 — Personalized start

Show:

- current level
- target
- first mission
- estimated duration
- first lesson

Do not require AI for this flow.

## 4. Optional placement test flow

For users choosing Unknown or requesting a diagnostic:

    Placement intro
      -> vocabulary sample
      -> grammar sample
      -> reading sample
      -> listening sample
      -> result
      -> suggested level
      -> confirm
      -> personalized plan

The result is evidence for a suggested level, not a permanent identity.

## 5. Home / dashboard 2.0

### Entry state

Header:

- greeting
- level
- streak
- notification
- profile

Primary card:

- today's mission
- remaining minutes
- progress
- start/resume button

Secondary cards:

- continue learning
- review due
- AI suggestion
- weekly activity
- JLPT progress

### Dashboard decision rule

The first CTA should answer:

"What should I do now?"

Possible answer:

- review due items
- continue lesson
- start vocabulary
- start listening
- take a short quiz

Use real underlying data only.

## 6. Continue-learning flow

    Home
      -> Continue learning
      -> current unfinished lesson/activity
      -> resume
      -> completion
      -> next recommendation

Store enough session context to resume meaningful activity, but do not create an entirely separate progress store.

## 7. Vocabulary flow

    Vocabulary
      -> search/filter
      -> card
      -> detail
      -> listen
      -> save
      -> mark known / practice
      -> quiz
      -> result
      -> review date

Detail view should reveal:

- Japanese
- reading
- meaning
- example
- audio
- JLPT level
- status
- correct/incorrect counts
- next review

Empty search:

    No matches
      -> adjust filter
      -> clear search

No favorites:

    Nothing saved yet
      -> browse vocabulary

## 8. Kanji flow

### Current migration state

Kanji is derived from vocabulary. The UI must make this clear without presenting missing stroke/radical data.

### Future flow

    Kanji
      -> search/filter
      -> character detail
      -> readings
      -> meanings
      -> radicals
      -> stroke information
      -> related vocabulary
      -> practice
      -> review

Unsupported data should produce an explicit "not available yet" state, not a fake value.

## 9. Grammar flow

    Grammar
      -> level filter
      -> status filter
      -> pattern
      -> detail
      -> formation
      -> meaning
      -> example
      -> related grammar
      -> practice
      -> review

When grammar patterns are similar, the UI should support comparison rather than forcing the user to memorize isolated cards.

## 10. Listening flow

Target interaction:

    Listening
      -> choose level/topic
      -> play
      -> replay
      -> change speed
      -> answer
      -> optional transcript
      -> optional translation
      -> result
      -> review errors

Transcript and translation should be separately controlled so learners can attempt comprehension first.

## 11. Reading flow

    Reading
      -> select passage
      -> read
      -> lookup vocabulary/grammar
      -> answer questions
      -> result
      -> save difficult items
      -> review

Reading mode should minimize unnecessary UI around the passage.

## 12. Speaking flow

    Speaking
      -> scenario/prompt
      -> prepare
      -> record
      -> stop
      -> feedback
      -> retry
      -> save attempt

AI pronunciation feedback is a future feature. The core UX must remain understandable without it.

## 13. Writing flow

    Writing
      -> prompt
      -> draft
      -> submit
      -> correction
      -> explanation
      -> revise
      -> compare
      -> save

Corrections should distinguish:

- grammar
- vocabulary
- naturalness
- register

## 14. Conversation flow

    Scenario
      -> choose role
      -> conversation
      -> hint
      -> continue
      -> reflection
      -> restart/save

The AI layer can power generated responses later, but the conversation state belongs to the activity flow.

## 15. Review / SRS flow

### Review home

Show:

- due now
- overdue
- weak items
- mistakes
- difficult items

Primary CTA:

"Start review"

### Review session

    due item
      -> answer
      -> feedback
      -> scheduler result
      -> next item

Do not expose SRS implementation details unless useful. The user needs a clear outcome such as:

- again
- learning
- familiar
- mastered

## 16. Mistake notebook flow

    Progress/Review
      -> Mistakes
      -> item
      -> why missed
      -> retry
      -> resolve
      -> next review

Current mistake data does not always contain a reason category. Until reason data exists, show factual metadata only.

## 17. JLPT flow

    JLPT
      -> target level
      -> diagnostic
      -> practice by section
      -> timed mock
      -> results
      -> weak areas
      -> next practice

Result hierarchy:

1. score
2. section performance
3. time behavior
4. weak topic categories
5. next study actions

Avoid presenting an unsupported "pass probability".

## 18. AI Teacher flow

### Ask

    AI Teacher
      -> ask
      -> receive answer
      -> optionally convert to practice

### Explain

    learning item
      -> AI explain
      -> explanation
      -> practice / review

### Review mistakes

    weak area
      -> AI summary
      -> validated review items
      -> start quiz

### Study plan

    current state
      -> AI recommendation
      -> plan
      -> accept / ignore
      -> open activity

AI recommendations are advisory. LearningStore / future domain services remain authoritative.

## 19. Progress flow

Progress must answer:

- How much did I study?
- What did I learn?
- Where am I making mistakes?
- What should I review?
- How is my target level progressing?

Empty history:

    No study history yet
      -> Start first session

No fake percentages.

## 20. Account migration flow

    Guest
      -> create account
      -> show migration preview
      -> confirm
      -> upload local progress
      -> verify
      -> synced profile

The preview should tell users what will move:

- settings
- favorites
- progress
- mistakes
- quiz history
- study history
- streak

No silent overwrite.

## 21. Error flows

### Network

    request
      -> network error
      -> explain
      -> retry

### AI failure

    AI request
      -> sanitized error
      -> retry
      -> continue using core learning

### Local data corruption

    load state
      -> invalid state detected
      -> restore from last valid snapshot
      -> tell user what happened
      -> preserve export where possible

The UI must never expose stack traces.

## 22. Accessibility flows

Every critical task must be possible with keyboard only:

- navigation
- search
- start quiz
- answer
- next
- close detail
- submit writing
- send AI message

Focus should move predictably into modals/drawers and return to the trigger when closed.

## 23. Mobile-specific flow

Mobile must prioritize action over navigation density:

    Home
      -> today's mission
      -> one primary action
      -> full-screen learning activity
      -> sticky answer/next controls
      -> result
      -> continue

Do not compress desktop panels into narrow columns.

## 24. UX acceptance rules

A future implementation is ready only when:

- every route has a clear primary action
- every data-dependent screen has loading/empty/error behavior
- users can recover from failure
- no screen requires knowledge of internal engine terms
- factual stats come from real state
- AI recommendations can be ignored without blocking core learning
- old progress survives UI migration
