// Auto-generated Supabase types — JLPT Master Mongolia
// Run: npm run db:generate to regenerate from live schema

export type JlptLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5'
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision'
export type CardState = 'new' | 'learning' | 'review' | 'mastered' | 'burned'
export type TranslationSrc = 'ai_generated' | 'human' | 'hybrid'
export type MnemonicType = 'story' | 'visual' | 'funny' | 'logical' | 'user_custom'
export type QuestionType = 'vocabulary' | 'kanji' | 'grammar' | 'reading' | 'mixed'
export type QuizType = 'practice' | 'mock_exam' | 'weak_area' | 'daily'

// ─── Core entities ───────────────────────────────────────────

export interface User {
  id: string
  email: string
  created_at: string
  last_login: string | null
  is_active: boolean
  role: 'user' | 'admin' | 'super_admin'
}

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin' | 'super_admin'
  target_jlpt: JlptLevel
  current_level: JlptLevel | null
  daily_goal_minutes: number
  streak_count: number
  longest_streak: number
  last_study_date: string | null
  total_xp: number
  timezone: string
  ui_language: string
  notifications_on: boolean
  created_at: string
  updated_at: string
}

// ─── Vocabulary ───────────────────────────────────────────────

export interface Vocabulary {
  id: number
  jmdict_id: number
  frequency: number | null
  is_common: boolean
  created_at: string
  updated_at: string
}

export interface VocabularyReading {
  id: number
  vocab_id: number
  text: string
  reading: string | null
  r_type: 'kanji_form' | 'kana_form'
  priority: number
  info_tags: string[] | null
}

export interface VocabularySense {
  id: number
  vocab_id: number
  sense_order: number
  pos: string[] | null
  field: string[] | null
  misc: string[] | null
  dialect: string[] | null
  gloss_en: string[] | null
  gloss_mn: string | null
  gloss_mn_status: ReviewStatus
  gloss_mn_src: TranslationSrc
  nuance_mn: string | null
  reviewed_by: string | null
  reviewed_at: string | null
}

// Full vocabulary with all joined data
export interface VocabFull {
  id: number
  jmdict_id: number
  frequency: number | null
  is_common: boolean
  kanji_forms: string[]
  kana_forms: string[]
  meanings_en: string[][]
  meanings_mn: string[]
  jlpt_levels: JlptLevel[]
  senses: VocabularySense[]
  readings: VocabularyReading[]
}

// ─── Kanji ───────────────────────────────────────────────────

export interface Kanji {
  id: number
  character: string
  stroke_count: number | null
  grade: number | null
  frequency: number | null
  meaning_en: string[] | null
  meaning_mn: string | null
  meaning_mn_status: ReviewStatus
  created_at: string
  updated_at: string
}

export interface KanjiReading {
  id: number
  kanji_id: number
  reading: string
  r_type: 'ja_on' | 'ja_kun' | 'nanori'
}

export interface KanjiStroke {
  id: number
  kanji_id: number
  kanjivg_id: string | null
  svg_full: string | null
  stroke_count: number | null
  stroke_paths: StrokePath[] | null
  element_groups: ElementGroup[] | null
  created_at: string
}

export interface StrokePath {
  order: number
  type: string
  path: string
  element?: string
}

export interface ElementGroup {
  element: string
  paths: number[]
  bbox?: { x: number; y: number; w: number; h: number }
}

export interface KanjiFull {
  id: number
  character: string
  stroke_count: number | null
  grade: number | null
  frequency: number | null
  meaning_en: string[]
  meaning_mn: string | null
  on_yomi: string[]
  kun_yomi: string[]
  jlpt_levels: JlptLevel[]
  primary_radical: string[]
  stroke_data: KanjiStroke | null
  mnemonics: Mnemonic[]
  example_vocab: VocabFull[]
}

// ─── Grammar ──────────────────────────────────────────────────

export interface Grammar {
  id: number
  form: string
  jlpt_level: JlptLevel
  category: string
  structure: string | null
  meaning_en: string | null
  meaning_mn: string | null
  nuance_mn: string | null
  comparison_note: string | null
  common_mistakes: string | null
  mnemonic_mn: string | null
  review_status: ReviewStatus
  created_at: string
  updated_at: string
}

export interface GrammarExample {
  id: number
  grammar_id: number
  japanese: string
  reading: string | null
  english: string | null
  mongolian: string | null
  mn_status: ReviewStatus
  source: string
  created_at: string
}

export interface GrammarFull extends Grammar {
  examples: GrammarExample[]
  quiz_questions: Question[]
}

// ─── Example Sentences ────────────────────────────────────────

export interface ExampleSentence {
  id: number
  tatoeba_id: number | null
  japanese: string
  reading: string | null
  english: string | null
  mongolian: string | null
  mn_status: ReviewStatus
  difficulty: JlptLevel | null
  audio_url: string | null
  created_at: string
  updated_at: string
}

// ─── Mnemonics ────────────────────────────────────────────────

export interface Mnemonic {
  id: number
  item_type: 'kanji' | 'vocab' | 'grammar'
  item_id: number
  mnemonic_type: MnemonicType
  content: string
  is_official: boolean
  is_ai_generated: boolean
  author_id: string | null
  vote_count: number
  review_status: ReviewStatus
  created_at: string
  updated_at: string
}

// ─── Mind Maps ────────────────────────────────────────────────

export interface MindMap {
  id: number
  root_vocab_id: number | null
  root_kanji_id: number | null
  title: string
  graph_data: MindMapGraph
  created_at: string
}

export interface MindMapGraph {
  nodes: MindMapNode[]
  edges: MindMapEdge[]
}

export interface MindMapNode {
  id: string
  label: string
  type: 'vocab' | 'kanji' | 'grammar' | 'concept'
  item_id?: number
  jlpt?: JlptLevel
  frequency?: number
}

export interface MindMapEdge {
  source: string
  target: string
  label?: string
  type?: 'compound' | 'reading' | 'related' | 'opposite'
}

// ─── SRS ──────────────────────────────────────────────────────

export interface SrsCard {
  id: number
  user_id: string
  item_type: 'vocab' | 'kanji' | 'grammar'
  item_id: number
  card_state: CardState
  ease_factor: number
  interval_days: number
  due_at: string
  reps: number
  lapses: number
  last_reviewed: string | null
  created_at: string
}

export interface ReviewLog {
  id: number
  card_id: number
  user_id: string
  rating: 1 | 2 | 3 | 4   // 1=Again 2=Hard 3=Good 4=Easy
  time_taken_ms: number | null
  prev_interval: number | null
  new_interval: number | null
  prev_ease: number | null
  new_ease: number | null
  reviewed_at: string
}

export interface StudySession {
  id: number
  user_id: string
  started_at: string
  ended_at: string | null
  duration_min: number | null
  cards_reviewed: number
  correct_count: number
  xp_earned: number
  session_type: 'srs' | 'quiz' | 'mock_exam' | 'browse'
}

// ─── Quiz ─────────────────────────────────────────────────────

export interface Quiz {
  id: number
  title: string
  quiz_type: QuizType
  jlpt_level: JlptLevel | null
  question_count: number
  time_limit_min: number | null
  is_official: boolean
  created_by: string | null
  created_at: string
}

export interface Question {
  id: number
  quiz_id: number | null
  question_type: QuestionType
  jlpt_level: JlptLevel | null
  item_type: string | null
  item_id: number | null
  stem: string
  explanation_mn: string | null
  difficulty: number
  choices: QuizChoice[]
  created_at: string
}

export interface QuizChoice {
  id: number
  question_id: number
  choice_text: string
  display_order: number
}

export interface GradedQuizAnswer {
  question_id: number
  choice_id: number
  is_correct: boolean
  correct_choice_id: number
  explanation_mn: string | null
}

export interface QuizAttempt {
  id: number
  user_id: string
  quiz_id: number | null
  session_id: number | null
  started_at: string
  finished_at: string | null
  score: number | null
  total_questions: number | null
  correct_count: number | null
  time_taken_sec: number | null
  is_completed: boolean
}

// ─── Gamification ─────────────────────────────────────────────

export interface Achievement {
  id: number
  code: string
  title_mn: string
  description_mn: string | null
  icon: string | null
  xp_reward: number
  condition_type: string | null
  condition_value: number | null
  earned?: boolean
  earned_at?: string
}

export interface XpLog {
  id: number
  user_id: string
  amount: number
  source: string
  item_type: string | null
  item_id: number | null
  created_at: string
}

// ─── Dashboard stats ──────────────────────────────────────────

export interface DashboardStats {
  user: Profile
  today: {
    study_minutes: number
    cards_reviewed: number
    new_words: number
    accuracy: number
    xp_earned: number
  }
  streak: number
  due_count: number
  retention_rate: number
  vocab_mastered: number
  kanji_mastered: number
  weak_areas: WeakArea[]
  predicted_level: JlptLevel | null
  leaderboard_rank: number | null
}

export interface WeakArea {
  item_type: 'vocab' | 'kanji' | 'grammar'
  item_id: number
  display: string
  lapse_count: number
  accuracy: number
}

// ─── Search ───────────────────────────────────────────────────

export interface SearchResult {
  type: 'vocab' | 'kanji' | 'grammar' | 'sentence'
  id: number
  primary: string        // main display text
  secondary: string      // reading or sub-info
  meaning: string        // meaning preview
  jlpt: JlptLevel | null
}

// ─── Admin ────────────────────────────────────────────────────

export interface AdminReview {
  id: number
  item_type: string
  item_id: number
  field: string | null
  content_snapshot: string
  priority: number
  status: ReviewStatus
  assigned_to: string | null
  reviewer_id: string | null
  reviewer_note: string | null
  prev_value: string | null
  new_value: string | null
  created_at: string
  updated_at: string
}

// ─── SRS Algorithm types ──────────────────────────────────────

export interface SrsResult {
  new_interval: number
  new_ease_factor: number
  new_state: CardState
  next_due: Date
}

export type SrsRating = 1 | 2 | 3 | 4  // Again | Hard | Good | Easy
