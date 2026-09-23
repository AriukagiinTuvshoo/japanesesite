'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import { AppShell } from '@/components/layout/AppShell'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, CheckCircle2, XCircle, ChevronRight, RotateCcw, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { JlptLevel } from '@/types'

type ExamStep = 'setup' | 'running' | 'finished'

const EXAM_CONFIG: Record<JlptLevel, { questions: number; time: number; sections: string[] }> = {
  N5: { questions: 35,  time: 90,  sections: ['語彙 (25)', '文法・読解 (10)'] },
  N4: { questions: 55,  time: 105, sections: ['語彙 (30)', '文法・読解 (25)'] },
  N3: { questions: 75,  time: 140, sections: ['語彙 (25)', '文法 (25)', '読解 (25)'] },
  N2: { questions: 88,  time: 155, sections: ['語彙 (30)', '文法 (35)', '読解 (23)'] },
  N1: { questions: 88,  time: 170, sections: ['語彙 (25)', '文法 (35)', '読解 (28)'] },
}
const PASS_SCORE = 60

export default function MockExamPage() {
  const userId = useAuthStore(s => s.userId)
  const sb     = createClient()

  const [step,     setStep]    = useState<ExamStep>('setup')
  const [level,    setLevel]   = useState<JlptLevel>('N2')
  const [questions, setQs]    = useState<any[]>([])
  const [current,  setCurrent] = useState(0)
  const [answers,  setAnswers] = useState<Record<number, number>>({})
  const [revealed, setRevealed]= useState(false)
  const [timeLeft, setTimeLeft]= useState(0)
  const [score,    setScore]   = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const startRef = useRef(Date.now())
  const cfg      = EXAM_CONFIG[level]

  const { mutate: startExam, isPending: loading } = useMutation({
    mutationFn: async () => {
      const { data } = await sb
        .from('questions')
        .select('*, question_choices(*)')
        .eq('jlpt_level', level)
        .limit(cfg.questions * 2)
      return (data ?? []).sort(() => Math.random() - 0.5).slice(0, cfg.questions)
    },
    onSuccess: (data) => {
      setQs(data)
      setAnswers({})
      setCurrent(0)
      setRevealed(false)
      setTimeLeft(cfg.time * 60)
      setStep('running')
      startRef.current = Date.now()
    },
    onError: () => toast.error('Асуулт ачааллах үед алдаа гарлаа'),
  })

  useEffect(() => {
    if (step !== 'running') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); finishExam(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [step]) // eslint-disable-line

  const finishExam = useCallback(() => {
    clearInterval(timerRef.current)
    let correct = 0
    questions.forEach(q => {
      const cid = answers[q.id]
      if (q.choices?.find((c: any) => c.id === cid)?.is_correct) correct++
    })
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
    setScore(pct)
    setStep('finished')
    if (userId) {
      sb.from('quiz_attempts').insert({
        user_id: userId,
        started_at: new Date(startRef.current).toISOString(),
        finished_at: new Date().toISOString(),
        score: pct, total_questions: questions.length, correct_count: correct,
        time_taken_sec: Math.round((Date.now() - startRef.current) / 1000), is_completed: true,
      }).then(() => sb.from('xp_logs').insert({ user_id: userId, amount: correct * 5, source: 'mock_exam' }))
    }
  }, [questions, answers, userId, sb])

  const handleAnswer = (cid: number) => {
    if (revealed) return
    setAnswers(p => ({ ...p, [questions[current].id]: cid }))
    setRevealed(true)
  }

  const handleNext = () => {
    setRevealed(false)
    if (current + 1 >= questions.length) { finishExam(); return }
    setCurrent(c => c + 1)
  }

  const reset = () => { setStep('setup'); setScore(null); setQs([]); setAnswers({}) }
  const fmt   = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`
  const timePct = cfg.time > 0 ? (timeLeft / (cfg.time * 60)) * 100 : 0

  if (step === 'setup') return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">📋</div>
          <h1 className="text-2xl font-bold">JLPT Дууриамал Шалгалт</h1>
          <p className="text-muted-foreground text-sm">Бодит шалгалтын нөхцөлд бэлтгэ</p>
        </div>
        <div className="bg-card border rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold mb-3 block">Түвшин сонго</label>
            <div className="grid grid-cols-5 gap-2">
              {(['N5','N4','N3','N2','N1'] as JlptLevel[]).map(l => {
                const clr: Record<JlptLevel, string> = { N5:'bg-green-500', N4:'bg-blue-500', N3:'bg-yellow-500', N2:'bg-orange-500', N1:'bg-red-500' }
                return (
                  <button key={l} onClick={() => setLevel(l)}
                    className={cn('py-3 rounded-xl border-2 text-sm font-bold transition-all',
                      level === l ? `${clr[l]} text-white border-transparent scale-105` : 'border-border hover:border-primary')}>
                    {l}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 space-y-1.5">
            <div className="text-sm font-semibold mb-2">Шалгалтын мэдээлэл</div>
            <div className="grid grid-cols-2 gap-y-1.5 text-sm">
              <span className="text-muted-foreground">Асуулт:</span><span className="font-medium">{cfg.questions}</span>
              <span className="text-muted-foreground">Хугацаа:</span><span className="font-medium">{cfg.time} мин</span>
              <span className="text-muted-foreground">Тэнцэх:</span><span className="font-medium">{PASS_SCORE}%+</span>
            </div>
          </div>
          <button onClick={() => startExam()} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-60">
            {loading ? 'Бэлтгэж байна...' : '🎯 Шалгалт эхлүүлэх'}
          </button>
        </div>
      </div>
    </AppShell>
  )

  if (step === 'running') {
    const q = questions[current]
    if (!q) return <AppShell><div className="flex items-center justify-center h-60 text-muted-foreground">Асуулт олдсонгүй</div></AppShell>
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{current+1}/{questions.length}</span>
              <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width:`${(current/questions.length)*100}%` }} />
              </div>
            </div>
            <div className={cn('flex items-center gap-1.5 font-bold tabular-nums text-sm',
              timeLeft < 300 ? 'text-red-500' : timeLeft < 600 ? 'text-orange-500' : 'text-muted-foreground')}>
              <Timer className="w-4 h-4" /> {fmt(timeLeft)}
            </div>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-1000',
              timePct > 50 ? 'bg-green-500' : timePct > 25 ? 'bg-yellow-500' : 'bg-red-500'
            )} style={{ width:`${timePct}%` }} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              className="bg-card border rounded-2xl p-6 space-y-5">
              <p className="text-base font-semibold leading-relaxed">{q.stem}</p>
              <div className="grid gap-2.5">
                {(q.choices ?? []).map((c: any) => {
                  const sel = answers[q.id] === c.id
                  let cls = 'bg-card border hover:bg-muted'
                  if (revealed && sel && c.is_correct)   cls = 'bg-green-50 border-green-400 text-green-800 dark:bg-green-950 dark:text-green-200'
                  if (revealed && sel && !c.is_correct)  cls = 'bg-red-50 border-red-400 text-red-800 dark:bg-red-950 dark:text-red-200'
                  if (revealed && !sel && c.is_correct)  cls = 'bg-green-50 border-green-300 text-green-700 dark:bg-green-950 dark:text-green-300'
                  return (
                    <button key={c.id} onClick={() => handleAnswer(c.id)} disabled={revealed}
                      className={cn('w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all disabled:cursor-default', cls)}>
                      <div className="flex items-center justify-between gap-2">
                        <span>{c.choice_text}</span>
                        {revealed && c.is_correct  && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                        {revealed && sel && !c.is_correct && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              {revealed && q.explanation_mn && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 text-sm text-blue-800 dark:text-blue-200">
                  💡 {q.explanation_mn}
                </motion.div>
              )}
              {revealed && (
                <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-2">
                  {current+1 >= questions.length ? '📊 Дүн харах' : 'Дараах'} <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
          <button onClick={() => { if (confirm('Шалгалтыг дуусгах уу?')) finishExam() }}
            className="w-full py-2 rounded-xl border text-sm text-muted-foreground hover:bg-muted">
            Дуусгах
          </button>
        </div>
      </AppShell>
    )
  }

  const passed  = (score ?? 0) >= PASS_SCORE
  const correct = Math.round(((score ?? 0) / 100) * questions.length)
  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-12 space-y-6 text-center">
        <motion.div initial={{ scale:0.7, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:'spring' }}>
          <div className="text-6xl mb-4">{score === 100 ? '🎉' : passed ? '✅' : '📚'}</div>
          <h1 className="text-4xl font-bold">{score}%</h1>
          <p className={cn('text-xl font-semibold mt-2', passed ? 'text-green-600' : 'text-red-600')}>
            {passed ? `JLPT ${level} Тэнцлээ!` : 'Дахин хичээгээрэй'}
          </p>
        </motion.div>
        <div className="grid grid-cols-2 gap-3">
          {[['Зөв хариулт', `${correct}/${questions.length}`], ['Нийт оноо', `${score}%`],
            ['Тэнцэх босго', `${PASS_SCORE}%`], ['Үр дүн', passed ? '✓ ТЭНЦСЭН' : '✗ ТЭНЦСЭНГҮЙ']].map(([l,v]) => (
            <div key={l} className="bg-card border rounded-xl p-4">
              <div className="text-lg font-bold">{v}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        {!passed && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-4 flex items-start gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Зөвлөгөө:</strong> Сул хэсгүүдийг SRS-д нэмж өдөр бүр давтаарай.
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90">
            <RotateCcw className="w-4 h-4" /> Дахин хичээх
          </button>
          <button onClick={() => { window.location.href = '/dashboard' }}
            className="flex-1 py-3 rounded-xl border font-semibold hover:bg-muted text-sm">
            Самбар руу
          </button>
        </div>
      </div>
    </AppShell>
  )
}
