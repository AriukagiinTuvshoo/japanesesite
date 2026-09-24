
# Phase 5.0 — Design System

## 1. Design audit snapshot

The current visual system is implemented across style.css, phase2.css and ai-teacher.css.

Current global tokens in style.css include:

- ink: #17241f
- muted: #6f7c75
- paper: #f7f8f4
- white: #fff
- green: #176c4c
- green-dark: #0d5138
- line: #e2e9e3
- orange: #eb9959
- sage: #edf4ee
- navy: #19372b
- shadow: 0 18px 52px #1b3a2c12
- radius: 14px

The current UI already has a calm, educational direction. Phase 5 should consolidate it rather than throw away the identity.

The current styling is not yet a complete design system because primitives, feature styles and responsive rules are distributed across three CSS files.

## 2. Design principles

The target product should feel:

- calm
- premium
- educational
- Japanese-inspired without becoming decorative
- trustworthy
- focused
- fast
- readable

Avoid:

- childish gamification by default
- anime-first decoration
- excessive gradients
- heavy glassmorphism
- random feature colors
- huge empty areas
- dense control panels
- inconsistent card patterns

## 3. Token architecture

### Color roles

Move from feature-specific colors to semantic roles:

| Role | Purpose |
|---|---|
| canvas | page background |
| surface | standard card/panel |
| surface-raised | modal/drawer/important panel |
| text-primary | main content |
| text-secondary | supporting copy |
| text-muted | nonessential labels |
| border | control/card borders |
| accent | primary learning action |
| accent-strong | active/hover action |
| accent-soft | selected/low-emphasis state |
| success | correct/success |
| warning | due/attention |
| danger | errors/incorrect |
| info | informational guidance |

The existing green should remain the primary learning accent. Orange should be reserved for limited attention/motivation use, not general action.

### Typography

Keep the existing system-first approach for Latin/Mongolian UI and a Japanese-compatible font stack for Japanese content.

Define roles rather than styling by element:

- display-xl
- display-lg
- heading-xl
- heading-lg
- heading-md
- body-lg
- body
- body-sm
- label
- caption
- japanese-large
- japanese-reading

Japanese content should have explicit line-height and font-size rules independent of Mongolian/English body text.

### Spacing scale

Adopt a single predictable scale:

4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.

Use spacing tokens instead of arbitrary per-component gaps.

### Radius

Use a small set:

- control: 10px
- card: 14px
- panel: 18px
- modal: 20px
- pill: 999px

The existing 14px default radius is a good card baseline.

### Elevation

Three levels:

- level-0: flat
- level-1: standard card
- level-2: raised/modal

Do not create separate shadows per screen.

## 4. Core primitives

The first reusable component inventory should be:

### Buttons

Variants:

- primary
- secondary
- quiet
- danger
- icon
- pill

States:

- default
- hover
- active
- focus-visible
- disabled
- loading

### Inputs

- text
- search
- select
- textarea
- checkbox
- segmented control

Every form control must have:

- label
- error state
- focus state
- disabled state
- help text when necessary

### Navigation

- desktop sidebar item
- mobile bottom item
- breadcrumbs where useful
- tab
- segmented control

### Containers

- page-shell
- content-column
- split-layout
- card-grid
- learning-panel

### Feedback

- badge
- status chip
- progress bar
- progress ring
- toast
- inline alert
- empty state
- loading skeleton
- error panel

### Learning primitives

- vocabulary card
- kanji card
- grammar card
- review row
- question card
- answer option
- result summary
- audio player
- transcript panel

## 5. Learning status visuals

Learning states already exist in the engine:

- NEW
- LEARNING
- FAMILIAR
- WEAK
- MASTERED

Define a semantic visual contract for each state. Color cannot be the only signal.

Each state should include:

- color/outline
- text label
- icon or symbol
- accessible announcement where required

Example:

NEW = "New"
LEARNING = "Learning"
FAMILIAR = "Familiar"
WEAK = "Needs review"
MASTERED = "Mastered"

The engine remains the source of the state. UI only presents it.

## 6. Responsive rules

Current CSS already uses 900, 680, 430/390 and 370px ranges.

Phase 5 should formalize behavior at these design checkpoints:

- 320
- 375
- 390
- 430
- 768
- 1024
- 1280
- 1440
- 1920

### Mobile

- one-column learning flow
- large touch targets
- sticky quiz/review controls when useful
- compact header
- bottom navigation
- no desktop sidebar

### Tablet

- two-column layouts where content benefits from comparison
- persistent but compact navigation

### Desktop

- left navigation rail/sidebar
- centered content area
- optional right context panel
- max-width content containers

## 7. Accessibility contract

Every component must support:

- keyboard navigation
- visible focus
- logical tab order
- semantic HTML
- adequate contrast
- reduced motion
- descriptive accessible names
- touch target size suitable for mobile

Correct/incorrect states must use text/icon in addition to color.

Do not add ARIA when native semantic HTML already provides the required semantics.

## 8. State patterns

Every feature screen should define:

1. loading
2. ready
3. empty
4. error
5. unavailable/locked when relevant

Empty states need:

- what is empty
- why it is empty
- one primary next action

Do not show "0" metrics as the main experience when there is no underlying history.

## 9. Motion

Default motion should be subtle.

Use motion for:

- route transitions
- progress completion
- quiz feedback
- drawers/modals

Respect prefers-reduced-motion.

Avoid continuous decorative motion.

## 10. Component ownership

Design-system primitives should not contain learning business logic.

Feature components can call domain services through stable interfaces, but learning calculations belong in domain modules.

Example:

VocabularyCard
-> displays
-> triggers "favorite" / "practice"
-> does not compute SRS

LearningStore / ReviewScheduler
-> owns SRS and progress

## 11. Phase 5 design-system sequence

1. Freeze semantic token names.
2. Create primitive component contracts.
3. Define responsive layout primitives.
4. Define learning-specific states.
5. Define accessibility behavior.
6. Migrate one route at a time.
7. Delete duplicate feature CSS only after visual regression passes.

## 12. Definition of done

The design system is ready when:

- new screens can be assembled from shared primitives
- no feature invents its own button/input/card language
- responsive behavior is documented
- learning status semantics are consistent
- loading/empty/error patterns are shared
- accessibility behavior is part of the component contract
