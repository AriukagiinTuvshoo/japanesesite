'use client'
// ============================================================
// Grammar Page
// ============================================================
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getGrammarList, getGrammarById, addToSrs } from '@/lib/api'
import { useAuthStore } from '@/store'
import { AppShell }    from '@/components/layout/AppShell'
import { LevelFilter } from '@/components/ui/LevelFilter'
import type { JlptLevel, Grammar, GrammarFull } from '@/types'
import { Brain, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const CATEGORY_LABELS: Record<string, string> = {
  concession:     'Хэдий ч',
  obligation:     'Үүрэг',
  conjecture:     'Таамаглал',
  negation:       'Үгүйсгэл',
  means:          'Арга зам',
  target:         'Чиглэл',
  addition:       'Нэмэлт',
  rule:           'Дүрэм/Хуваарь',
  effort:         'Хичээлт',
  purpose:        'Зорилго',
  topic:          'Сэдэв',
  correction:     'Залруулга',
  concern:        'Болгоомжлол',
  degree:         'Хэмжээ',
  completion:     'Дуусах',
  simultaneous:   'Зэрэгцэх',
  condition:      'Нөхцөл',
  determination:  'Шийдмэг',
  accompaniment:  'Дагалдах',
  focus:          'Голлох',
  exclusion:      'Хасах',
  following:      'Дагах',
  irresistible:   'Тэвчишгүй',
  understatement: 'Дорой үнэлэх',
  contrast:       'Эсрэг',
  occasion:       'Тохиолдол',
  'after/purpose':'Нөхцөл/Зорилго',
}

export default function GrammarPage() {
  const userId = useAuthStore((s) => s.userId)
  const [level, setLevel] = useState<JlptLevel | undefined>('N2')
  const [category, setCategory] = useState<string | undefined>()
  const [expanded, setExpanded] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['grammar-list', level, category],
    queryFn:  () => getGrammarList({ level, category }),
  })

  const { data: detail } = useQuery({
    queryKey: ['grammar-detail', expanded],
    queryFn:  () => getGrammarById(expanded!),
    enabled:  expanded !== null,
  })

  const categories = [...new Set(data?.data.map((g: Grammar) => g.category) ?? [])]

  const handleAddSrs = async (grammarId: number) => {
    if (!userId) return
    await addToSrs({ userId, itemType: 'grammar', itemId: grammarId })
    toast.success('SRS-д нэмэгдлээ')
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">文法 Дүрэм</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total ?? '—'} дүрмийн загвар
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <LevelFilter value={level} onChange={(l) => { setLevel(l); setCategory(undefined) }} />
          {categories.length > 0 && (
            <select
              value={category ?? ''}
              onChange={(e) => setCategory(e.target.value || undefined)}
              className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none"
            >
              <option value="">Бүх ангилал</option>
              {categories.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
              ))}
            </select>
          )}
        </div>

        {/* Grammar list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {data?.data.map((grammar: Grammar) => (
              <GrammarAccordion
                key={grammar.id}
                grammar={grammar}
                detail={expanded === grammar.id ? detail ?? null : null}
                isExpanded={expanded === grammar.id}
                onToggle={() => setExpanded(expanded === grammar.id ? null : grammar.id)}
                onAddSrs={() => handleAddSrs(grammar.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function GrammarAccordion({ grammar, detail, isExpanded, onToggle, onAddSrs }: {
  grammar: Grammar
  detail: GrammarFull | null
  isExpanded: boolean
  onToggle: () => void
  onAddSrs: () => void
}) {
  const catLabel = CATEGORY_LABELS[grammar.category] ?? grammar.category
  const levelColors: Record<string, string> = {
    N5: 'bg-green-100 text-green-700', N4: 'bg-blue-100 text-blue-700',
    N3: 'bg-yellow-100 text-yellow-700', N2: 'bg-orange-100 text-orange-700',
    N1: 'bg-red-100 text-red-700',
  }

  return (
    <div className={cn('bg-card border rounded-xl overflow-hidden transition-shadow', isExpanded && 'shadow-md')}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-xl font-bold min-w-fit" style={{ fontFamily: 'var(--font-noto-jp)' }}>
          {grammar.form}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{grammar.meaning_mn}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', levelColors[grammar.jlpt_level])}>
              {grammar.jlpt_level}
            </span>
            <span className="text-[10px] text-muted-foreground">{catLabel}</span>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t pt-4">

              {/* Structure */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">БҮТЭЦ</div>
                <code className="text-sm bg-muted px-2 py-1 rounded">{grammar.structure}</code>
              </div>

              {/* Mongolian explanation */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">ТАЙЛБАР</div>
                <p className="text-sm leading-relaxed">{grammar.nuance_mn}</p>
              </div>

              {/* Comparison */}
              {grammar.comparison_note && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">⚖️ Ижил дүрэмтэй ялгаа</div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{grammar.comparison_note}</p>
                </div>
              )}

              {/* Common mistakes */}
              {grammar.common_mistakes && (
                <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-3">
                  <div className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">⚠️ Нийтлэг алдаа</div>
                  <p className="text-sm text-red-800 dark:text-red-200">{grammar.common_mistakes}</p>
                </div>
              )}

              {/* Mnemonic */}
              {grammar.mnemonic_mn && (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-3">
                  <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1">💡 Mnemonic</div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{grammar.mnemonic_mn}</p>
                </div>
              )}

              {/* Examples */}
              {detail?.examples && detail.examples.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2">ЖИШЭЭ ӨГҮҮЛБЭР</div>
                  <div className="space-y-2">
                    {detail.examples.map((ex) => (
                      <div key={ex.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-noto-jp)' }}>{ex.japanese}</div>
                        {ex.reading && <div className="text-xs text-muted-foreground mt-0.5">{ex.reading}</div>}
                        {ex.mongolian && <div className="text-sm text-primary mt-1">{ex.mongolian}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to SRS */}
              <button
                onClick={onAddSrs}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                <Brain className="w-3.5 h-3.5" />
                SRS-д нэмэх
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
