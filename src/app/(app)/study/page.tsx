'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { getDueCards, submitReview, getVocabById, getKanjiById, getGrammarByIdFull } from '@/lib/api'
import { useAuthStore, useSrsStore } from '@/store'
import { getStateLabel, getIntervalDisplay, getRatingLabel } from '@/lib/srs'
import { AppShell } from '@/components/layout/AppShell'
import type { SrsCard, SrsRating } from '@/types'
import { Brain, CheckCircle2, Star, Clock, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const RATING_COLORS: Record<SrsRating, string> = {
  1: 'bg-red-500 hover:bg-red-600',
  2: 'bg-orange-500 hover:bg-orange-600',
  3: 'bg-green-500 hover:bg-green-600',
  4: 'bg-blue-500 hover:bg-blue-600',
}
const RATING_INTERVALS: Record<SrsRating, string> = { 1:'10мин', 2:'1өд', 3:'3өд', 4:'7өд' }

export default function StudyPage() {
  const userId = useAuthStore(s => s.userId)
  const qc     = useQueryClient()
  const t0     = useRef<number>(Date.now())
  const { cards, currentIndex, showAnswer, setCards, nextCard, flipCard, recordAnswer, resetSession, startSession } = useSrsStore()
  const [done,  setDone]  = useState(false)
  const [stats, setStats] = useState({ reviewed:0, correct:0, xp:0 })

  const { data: due, isLoading } = useQuery({
    queryKey: ['due-cards', userId],
    queryFn:  () => getDueCards(userId!, 30),
    enabled:  !!userId,
  })

  useEffect(() => {
    if (due?.length) { setCards(due); startSession() }
  }, [due]) // eslint-disable-line

  const reviewMut = useMutation({
    mutationFn: (p: { card: SrsCard; rating: SrsRating }) =>
      submitReview({ userId: userId!, cardId: p.card.id, card: p.card, rating: p.rating, timeTakenMs: Date.now() - t0.current }),
    onSuccess: (_, { rating }) => {
      const ok = rating >= 3
      recordAnswer(ok)
      setStats(s => ({ reviewed: s.reviewed+1, correct: s.correct+(ok?1:0), xp: s.xp+(ok?5:1) }))
      if (currentIndex + 1 >= cards.length) {
        setDone(true)
        qc.invalidateQueries({ queryKey: ['srs-due-count'] })
        qc.invalidateQueries({ queryKey: ['dashboard'] })
      } else { nextCard(); t0.current = Date.now() }
    },
    onError: () => toast.error('Алдаа гарлаа'),
  })

  const rate = useCallback((r: SrsRating) => {
    if (cards[currentIndex]) reviewMut.mutate({ card: cards[currentIndex], rating: r })
  }, [cards, currentIndex]) // eslint-disable-line

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === ' ' && !showAnswer) { e.preventDefault(); flipCard(); return }
      if (!showAnswer) return
      if (e.key === '1') rate(1)
      if (e.key === '2') rate(2)
      if (e.key === '3') rate(3)
      if (e.key === '4') rate(4)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [showAnswer, flipCard, rate])

  if (isLoading)  return <AppShell><LoadingScreen /></AppShell>
  if (!due?.length) return <AppShell><EmptyState /></AppShell>
  if (done) return (
    <AppShell>
      <Summary stats={stats} onRestart={() => { setDone(false); setStats({reviewed:0,correct:0,xp:0}); resetSession() }} />
    </AppShell>
  )

  const card = cards[currentIndex]
  if (!card) return <AppShell><EmptyState /></AppShell>

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentIndex+1} / {cards.length} карт</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{stats.xp} XP</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full"
              animate={{ width: `${Math.round(currentIndex/cards.length*100)}%` }} transition={{ duration:0.3 }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`${card.id}-${showAnswer}`}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.15 }}>
            <CardView card={card} showAnswer={showAnswer} />
          </motion.div>
        </AnimatePresence>

        {!showAnswer ? (
          <button onClick={flipCard}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-2">
            Хариулт харах <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-xs text-muted-foreground">Хэр сайн санасан бэ? (1–4)</p>
            <div className="grid grid-cols-4 gap-2">
              {([1,2,3,4] as SrsRating[]).map(r => (
                <button key={r} onClick={() => rate(r)} disabled={reviewMut.isPending}
                  className={cn('py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50', RATING_COLORS[r])}>
                  <div>{getRatingLabel(r)}</div>
                  <div className="text-xs opacity-75 mt-0.5">{RATING_INTERVALS[r]}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{getStateLabel(card.card_state)}</span>
          <span>{getIntervalDisplay(card.interval_days)} → давтах</span>
          <span>Алдаа: {card.lapses}</span>
        </div>
      </div>
    </AppShell>
  )
}

function CardView({ card, showAnswer }: { card: SrsCard; showAnswer: boolean }) {
  return (
    <div className={cn('rounded-2xl border p-8 min-h-[280px] flex flex-col items-center justify-center gap-4 text-center relative',
      showAnswer ? 'bg-card' : 'bg-gradient-to-br from-card to-primary/5')}>
      <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
        {card.item_type === 'vocab' ? '語彙' : card.item_type === 'kanji' ? '漢字' : '文法'}
      </span>
      {card.item_type === 'vocab'   && <VocabCard   id={card.item_id} showAnswer={showAnswer} />}
      {card.item_type === 'kanji'   && <KanjiCard   id={card.item_id} showAnswer={showAnswer} />}
      {card.item_type === 'grammar' && <GrammarCard id={card.item_id} showAnswer={showAnswer} />}
    </div>
  )
}

function VocabCard({ id, showAnswer }: { id: number; showAnswer: boolean }) {
  const { data, isLoading } = useQuery({ queryKey:['srs-v',id], queryFn:()=>getVocabById(id), staleTime:Infinity })
  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
  if (!data) return <span className="text-muted-foreground text-sm">Олдсонгүй</span>
  const v = data as any
  const primary = v.kanji_forms?.[0] ?? v.kana_forms?.[0] ?? ''
  const reading = v.kana_forms?.[0] ?? ''
  const mn = v.meanings_mn?.[0]
  const en = v.meanings_en?.[0]?.[0] ?? ''
  return (
    <>
      <div className="space-y-1">
        <div className="text-5xl font-bold" style={{fontFamily:'serif'}}>{primary}</div>
        {primary !== reading && reading && <div className="text-lg text-muted-foreground">{reading}</div>}
      </div>
      {showAnswer && (
        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} className="space-y-2 w-full">
          <div className="text-xl font-semibold text-primary">{mn || en}</div>
          {mn && en && <div className="text-sm text-muted-foreground">{en}</div>}
        </motion.div>
      )}
    </>
  )
}

function KanjiCard({ id, showAnswer }: { id: number; showAnswer: boolean }) {
  const { data, isLoading } = useQuery({ queryKey:['srs-k',id], queryFn:()=>getKanjiById(id), staleTime:Infinity })
  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
  if (!data) return <span className="text-muted-foreground text-sm">Олдсонгүй</span>
  const k = data as any
  const on  = k.readings?.filter((r:any)=>r.r_type==='ja_on').map((r:any)=>r.reading).slice(0,3) ?? []
  const kun = k.readings?.filter((r:any)=>r.r_type==='ja_kun').map((r:any)=>r.reading).slice(0,3) ?? []
  return (
    <>
      <div className="space-y-2">
        <div className="text-7xl font-bold leading-none" style={{fontFamily:'serif'}}>{k.character}</div>
        {!showAnswer && k.stroke_count && <div className="text-xs text-muted-foreground">{k.stroke_count} зурлаг</div>}
      </div>
      {showAnswer && (
        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} className="space-y-3 w-full">
          <div className="text-xl font-semibold text-primary">
            {k.meaning_mn || (Array.isArray(k.meaning_en) ? k.meaning_en.slice(0,2).join(', ') : k.meaning_en)}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {on.length>0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">音読み</div>
                <div className="flex gap-1">
                  {on.map((r:string)=><span key={r} className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded text-sm font-medium">{r}</span>)}
                </div>
              </div>
            )}
            {kun.length>0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">訓読み</div>
                <div className="flex gap-1">
                  {kun.map((r:string)=><span key={r} className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded text-sm font-medium">{r}</span>)}
                </div>
              </div>
            )}
          </div>
          {k.mnemonic_mn && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl px-3 py-2 text-xs text-yellow-800 dark:text-yellow-200">
              💡 {k.mnemonic_mn}
            </div>
          )}
        </motion.div>
      )}
    </>
  )
}

function GrammarCard({ id, showAnswer }: { id: number; showAnswer: boolean }) {
  const { data, isLoading } = useQuery({ queryKey:['srs-g',id], queryFn:()=>getGrammarByIdFull(id), staleTime:Infinity })
  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
  if (!data) return <span className="text-muted-foreground text-sm">Олдсонгүй</span>
  const g = data as any
  return (
    <>
      <div className="space-y-2">
        <div className="text-3xl font-bold">{g.form}</div>
        <div className="text-sm text-muted-foreground">{g.jlpt_level} · {g.category}</div>
        {!showAnswer && g.structure && <code className="text-xs bg-muted px-2 py-1 rounded">{g.structure}</code>}
      </div>
      {showAnswer && (
        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} className="space-y-3 w-full max-w-md">
          <div className="text-lg font-semibold text-primary">{g.meaning_mn}</div>
          {g.nuance_mn && <p className="text-sm text-muted-foreground leading-relaxed">{g.nuance_mn}</p>}
          <code className="text-xs bg-muted px-3 py-1.5 rounded-lg block text-left">{g.structure}</code>
          {g.common_mistakes && (
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2 text-xs text-red-800 dark:text-red-200 text-left">⚠️ {g.common_mistakes}</div>
          )}
          {g.mnemonic_mn && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl px-3 py-2 text-xs text-yellow-800 dark:text-yellow-200">💡 {g.mnemonic_mn}</div>
          )}
        </motion.div>
      )}
    </>
  )
}

function Summary({ stats, onRestart }: { stats: any; onRestart: () => void }) {
  const acc = stats.reviewed > 0 ? Math.round(stats.correct/stats.reviewed*100) : 0
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      <div className="text-6xl">{acc>=80?'🎉':acc>=60?'👍':'📚'}</div>
      <h1 className="text-2xl font-bold">Давталт дууслаа!</h1>
      <div className="grid grid-cols-3 gap-3">
        {[{l:'Нийт карт',v:stats.reviewed},{l:'Зөв хариулт',v:`${acc}%`},{l:'XP олсон',v:`+${stats.xp}`}].map(s=>(
          <div key={s.l} className="bg-card border rounded-xl p-3">
            <div className="text-xl font-bold">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
      <button onClick={onRestart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90">
        Дахин эхлэх
      </button>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-3">
        <Brain className="w-10 h-10 text-primary mx-auto animate-pulse" />
        <p className="text-muted-foreground text-sm">Карт ачааллаж байна...</p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center px-4">
      <CheckCircle2 className="w-16 h-16 text-green-500" />
      <h2 className="text-xl font-bold">Өнөөдрийн давталт дууссан!</h2>
      <p className="text-muted-foreground text-sm max-w-xs">Маш сайн хийлээ. Дараагийн давтах карт хожим гарна.</p>
    </div>
  )
}
