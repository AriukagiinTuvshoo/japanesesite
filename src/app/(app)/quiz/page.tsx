'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { generateQuiz, submitQuizAttempt } from '@/lib/api'
import { useAuthStore, useQuizStore }  from '@/store'
import { AppShell }   from '@/components/layout/AppShell'
import { LevelFilter } from '@/components/ui/LevelFilter'
import type { JlptLevel, Question, QuestionType, QuizChoice } from '@/types'
import type { GradedQuizAnswer } from '@/types'
import { Timer, CheckCircle2, XCircle, Trophy, RotateCcw, Brain, ChevronRight, Zap } from 'lucide-react'
import { cn }  from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

type QuizStep = 'setup' | 'running' | 'finished'

export default function QuizPage() {
  const userId = useAuthStore((s) => s.userId)
  const { questions, currentIndex, answers, setQuestions, answerQuestion, nextQuestion, finishQuiz, score, isFinished, resetQuiz } = useQuizStore()

  const [step,       setStep]       = useState<QuizStep>('setup')
  const [level,      setLevel]      = useState<JlptLevel>('N2')
  const [qType, setQType] = useState<'vocabulary' | 'kanji' | 'grammar' | 'mixed'>('mixed')
  const [qCount,     setQCount]     = useState(10)
  const [timeLeft,   setTimeLeft]   = useState(0)
  const [totalTime,  setTotalTime]  = useState(0)
  const [selected,   setSelected]   = useState<number | null>(null)
  const [revealed,   setRevealed]   = useState(false)
  const [gradedAnswers, setGradedAnswers] = useState<Map<number, GradedQuizAnswer>>(new Map())
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const startRef = useRef<number>(Date.now())

  const genMutation = useMutation({
    mutationFn: () => generateQuiz({ level, type: qType, count: qCount }),
    onSuccess:  (data) => {
      setQuestions(data)
      const timeSec = qCount * 60   // 1 min per question
      setTimeLeft(timeSec)
      setTotalTime(timeSec)
      setStep('running')
      startRef.current = Date.now()
    },
  })

  const submitMutation = useMutation({
    mutationFn: () => submitQuizAttempt({
      userId: userId!,
      questions,
      answers,
      timeTakenSec: Math.round((Date.now() - startRef.current) / 1000),
    }),
    onSuccess: ({ score, answers: graded }) => {
      setGradedAnswers(new Map(graded.map((answer) => [answer.question_id, answer])))
      finishQuiz(score)
      setStep('finished')
      clearInterval(timerRef.current)
    },
  })

  // Timer
  useEffect(() => {
    if (step !== 'running') return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          submitMutation.mutate()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [step])

  const handleAnswer = (choiceId: number) => {
    if (revealed) return
    const q = questions[currentIndex]
    setSelected(choiceId)
    setRevealed(true)
    answerQuestion(q.id, choiceId)
  }

  const handleNext = () => {
    setSelected(null)
    setRevealed(false)
    if (currentIndex + 1 >= questions.length) {
      submitMutation.mutate()
    } else {
      nextQuestion()
    }
  }

  const handleReset = () => {
    resetQuiz()
    setStep('setup')
    setSelected(null)
    setRevealed(false)
  }

  const formatTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`
  const timePct    = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0

  // ── Setup ────────────────────────────────────────────────────
  if (step === 'setup') return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl">✏️</div>
          <h1 className="text-2xl font-bold">Тест эхлүүлэх</h1>
          <p className="text-muted-foreground text-sm">Асуулт төрөл, түвшин, тоог сонгоно уу</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 space-y-5">
          {/* Level */}
          <div>
            <label className="text-sm font-medium mb-2 block">JLPT түвшин</label>
            <LevelFilter value={level} onChange={(l) => l && setLevel(l)} />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Тестийн төрөл</label>
            <div className="grid grid-cols-2 gap-2">
              {(['vocabulary', 'kanji', 'grammar', 'mixed'] as Array<'vocabulary' | 'kanji' | 'grammar' | 'mixed'>).map((t) => {
                const labels: Record<string, string> = { vocabulary:'Үгийн сан', kanji:'Кanji', grammar:'Дүрэм', mixed:'Холимог' }
                const icons:  Record<string, string> = { vocabulary:'📖', kanji:'漢', grammar:'文', mixed:'🎲' }
                return (
                  <button
                    key={t}
                    onClick={() => setQType(t as any)}
                    className={cn('flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors',
                      qType === t ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                    )}
                  >
                    <span>{icons[t]}</span> {labels[t]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="text-sm font-medium mb-2 block">Асуултын тоо: {qCount}</label>
            <div className="flex gap-2">
              {[5, 10, 20, 30].map((n) => (
                <button
                  key={n}
                  onClick={() => setQCount(n)}
                  className={cn('flex-1 py-2 rounded-xl border text-sm font-medium transition-colors',
                    qCount === n ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => genMutation.mutate()}
          disabled={genMutation.isPending}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {genMutation.isPending ? 'Бэлтгэж байна...' : (
            <><Zap className="w-5 h-5" /> Эхлэх</>
          )}
        </button>
      </div>
    </AppShell>
  )

  // ── Running ──────────────────────────────────────────────────
  if (step === 'running') {
    const q = questions[currentIndex]
    if (!q) return <AppShell><div className="p-8 text-center">Асуулт олдсонгүй.</div></AppShell>

    const progress = Math.round(((currentIndex) / questions.length) * 100)
    const correct = [...gradedAnswers.values()].filter((answer) => answer.is_correct).length

    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-muted-foreground">{currentIndex+1}/{questions.length}</span>
              <div className="flex-1 h-2 w-32 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Timer */}
            <div className={cn('flex items-center gap-1.5 text-sm font-bold tabular-nums',
              timeLeft < 30 ? 'text-red-500' : timeLeft < 60 ? 'text-orange-500' : 'text-muted-foreground'
            )}>
              <Timer className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>

            {/* Score so far */}
            <div className="text-sm text-muted-foreground">
              ✓ {correct} зөв
            </div>
          </div>

          {/* Timer bar */}
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-1000',
                timePct > 50 ? 'bg-green-500' : timePct > 25 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ width: `${timePct}%` }}
            />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-card border rounded-2xl p-6 space-y-5"
            >
              {/* Stem */}
              <div className="text-lg font-semibold leading-relaxed"
                style={{ fontFamily: /[\u3040-\u9fff]/.test(q.stem) ? 'var(--font-noto-jp)' : undefined }}>
                {q.stem}
              </div>

              {/* Choices */}
              <div className="grid gap-2.5">
                {q.choices?.map((choice: QuizChoice) => {
                  const isSelected = selected === choice.id
                  const grade = gradedAnswers.get(q.id)
                  const isCorrect = grade?.correct_choice_id === choice.id
                  let btnClass = 'bg-card border hover:bg-muted'
                  if (revealed && isSelected && isCorrect)  btnClass = 'bg-green-50 border-green-400 text-green-800 dark:bg-green-950 dark:text-green-200'
                  if (revealed && isSelected && !isCorrect) btnClass = 'bg-red-50 border-red-400 text-red-800 dark:bg-red-950 dark:text-red-200'
                  if (revealed && !isSelected && isCorrect) btnClass = 'bg-green-50 border-green-300 text-green-700 dark:bg-green-950 dark:text-green-300'

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleAnswer(choice.id)}
                      disabled={revealed}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                        btnClass,
                        'disabled:cursor-default',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{choice.choice_text}</span>
                        {revealed && isCorrect  && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                        {revealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {revealed && gradedAnswers.get(q.id)?.explanation_mn && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3"
                >
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">💡 Тайлбар</div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{gradedAnswers.get(q.id)?.explanation_mn}</p>
                </motion.div>
              )}

              {/* Next button */}
              {revealed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleNext}
                  disabled={submitMutation.isPending}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {currentIndex + 1 >= questions.length ? 'Дүн харах' : 'Дараах'}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </AppShell>
    )
  }

  // ── Finished ──────────────────────────────────────────────────
  const finalScore = score ?? 0
  const isPass     = finalScore >= 60

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-12 space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl"
        >
          {finalScore === 100 ? '🎉' : isPass ? '✅' : '📚'}
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold mb-1">{finalScore}%</h1>
          <p className={cn('text-lg font-semibold', isPass ? 'text-green-600' : 'text-red-600')}>
            {finalScore === 100 ? 'Алдаагүй!' : isPass ? 'Тэнцлээ!' : 'Дахин хичээгээрэй'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Зөв',    value: `${answers.size > 0 ? Math.round(finalScore / 100 * questions.length) : 0}/${questions.length}`, icon: '✓' },
            { label: 'Хугацаа', value: formatTime(totalTime - timeLeft), icon: '⏱' },
            { label: 'XP',     value: `+${Math.round(finalScore / 10) * 3}`, icon: '⭐' },
          ].map((s) => (
            <div key={s.label} className="bg-card border rounded-xl p-3">
              <div className="text-xl font-bold">{s.icon} {s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={handleReset} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90">
            <RotateCcw className="w-4 h-4" /> Дахин хичээх
          </button>
          <button onClick={() => { handleReset(); }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold hover:bg-muted">
            Тохиргоо
          </button>
        </div>
      </div>
    </AppShell>
  )
}
