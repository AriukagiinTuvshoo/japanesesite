// ============================================================
// Zustand Global Store
// ============================================================
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { Profile, SrsCard, JlptLevel, DashboardStats } from '@/types'

// ─── Auth store ───────────────────────────────────────────────

interface AuthState {
  userId: string | null
  profile: Profile | null
  isLoading: boolean
  setUserId:  (id: string | null) => void
  setProfile: (p: Profile | null) => void
  setLoading: (v: boolean) => void
  clear:      () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
      (set) => ({
        userId:    null,
        profile:   null,
        isLoading: true,
        setUserId:  (id)      => set({ userId: id }),
        setProfile: (profile) => set({ profile }),
        setLoading: (isLoading) => set({ isLoading }),
        clear:      ()        => set({ userId: null, profile: null }),
      })
  )
)

// ─── SRS session store ────────────────────────────────────────

interface SrsState {
  cards: SrsCard[]
  currentIndex: number
  showAnswer: boolean
  sessionStart: Date | null
  reviewedCount: number
  correctCount: number

  setCards:      (cards: SrsCard[]) => void
  nextCard:      () => void
  flipCard:      () => void
  recordAnswer:  (correct: boolean) => void
  resetSession:  () => void
  startSession:  () => void
}

export const useSrsStore = create<SrsState>()((set, get) => ({
  cards:         [],
  currentIndex:  0,
  showAnswer:    false,
  sessionStart:  null,
  reviewedCount: 0,
  correctCount:  0,

  setCards:     (cards)   => set({ cards, currentIndex: 0, showAnswer: false }),
  flipCard:     ()        => set((s) => ({ showAnswer: !s.showAnswer })),
  nextCard:     ()        => set((s) => ({
    currentIndex: Math.min(s.currentIndex + 1, s.cards.length - 1),
    showAnswer:   false,
  })),
  recordAnswer: (correct) => set((s) => ({
    reviewedCount: s.reviewedCount + 1,
    correctCount:  s.correctCount + (correct ? 1 : 0),
  })),
  resetSession: () => set({
    cards: [], currentIndex: 0, showAnswer: false,
    sessionStart: null, reviewedCount: 0, correctCount: 0,
  }),
  startSession: () => set({ sessionStart: new Date() }),
}))

// ─── UI preferences store ─────────────────────────────────────

interface UIState {
  theme:          'light' | 'dark' | 'system'
  fontSize:       'sm' | 'md' | 'lg'
  showFurigana:   boolean
  showRomaji:     boolean
  autoplayAudio:  boolean
  selectedLevel:  JlptLevel | null
  sidebarOpen:    boolean

  setTheme:         (t: UIState['theme'])    => void
  setFontSize:      (s: UIState['fontSize']) => void
  toggleFurigana:   () => void
  toggleRomaji:     () => void
  toggleAutoplay:   () => void
  setLevel:         (l: JlptLevel | null)   => void
  toggleSidebar:    () => void
  setSidebar:       (v: boolean)             => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme:         'system',
      fontSize:      'md',
      showFurigana:  true,
      showRomaji:    false,
      autoplayAudio: false,
      selectedLevel: 'N2',
      sidebarOpen:   true,

      setTheme:       (theme)  => set({ theme }),
      setFontSize:    (fontSize) => set({ fontSize }),
      toggleFurigana: ()       => set((s) => ({ showFurigana: !s.showFurigana })),
      toggleRomaji:   ()       => set((s) => ({ showRomaji:   !s.showRomaji })),
      toggleAutoplay: ()       => set((s) => ({ autoplayAudio: !s.autoplayAudio })),
      setLevel:       (l)      => set({ selectedLevel: l }),
      toggleSidebar:  ()       => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebar:     (v)      => set({ sidebarOpen: v }),
    }),
    { name: 'jlpt-ui' }
  )
)

// ─── Quiz session store ───────────────────────────────────────

interface QuizState {
  questions:     any[]
  currentIndex:  number
  answers:       Map<number, number>
  startTime:     Date | null
  isFinished:    boolean
  score:         number | null

  setQuestions:  (qs: any[]) => void
  answerQuestion:(questionId: number, choiceId: number) => void
  nextQuestion:  () => void
  finishQuiz:    (score: number) => void
  resetQuiz:     () => void
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  questions:    [],
  currentIndex: 0,
  answers:      new Map(),
  startTime:    null,
  isFinished:   false,
  score:        null,

  setQuestions: (questions) => set({ questions, currentIndex: 0, answers: new Map(), startTime: new Date(), isFinished: false, score: null }),
  answerQuestion: (questionId, choiceId) => set((s) => {
    const a = new Map(s.answers)
    a.set(questionId, choiceId)
    return { answers: a }
  }),
  nextQuestion: () => set((s) => ({ currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1) })),
  finishQuiz:   (score) => set({ isFinished: true, score }),
  resetQuiz:    () => set({ questions: [], currentIndex: 0, answers: new Map(), startTime: null, isFinished: false, score: null }),
}))

// ─── Dashboard store ──────────────────────────────────────────

interface DashboardState {
  stats:    DashboardStats | null
  loading:  boolean
  setStats: (s: DashboardStats | null) => void
  setLoading:(v: boolean) => void
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  stats:    null,
  loading:  true,
  setStats:   (stats)   => set({ stats }),
  setLoading: (loading) => set({ loading }),
}))
