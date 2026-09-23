'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getKanjiList, addToSrs, toggleBookmark, getMnemonics } from '@/lib/api'
import { useAuthStore } from '@/store'
import { AppShell }    from '@/components/layout/AppShell'
import { LevelFilter } from '@/components/ui/LevelFilter'
import { KanjiStrokeSvg } from '@/components/kanji/KanjiStrokeSvg'
import type { JlptLevel, KanjiFull } from '@/types'
import { Brain, Bookmark, Info, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function KanjiPage() {
  const userId   = useAuthStore((s) => s.userId)
  const [level,  setLevel]   = useState<JlptLevel | undefined>('N2')
  const [page,   setPage]    = useState(0)
  const [selected, setSelected] = useState<KanjiFull | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['kanji-list', level, page],
    queryFn:  () => getKanjiList({ level, page, pageSize: 60 }),
    placeholderData: (prev) => prev,
  })

  const { data: mnemonics } = useQuery({
    queryKey: ['mnemonics', 'kanji', selected?.id],
    queryFn:  () => getMnemonics('kanji', selected!.id),
    enabled:  !!selected,
  })

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">漢字 Кanji</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total.toLocaleString() ?? '—'} кanji &middot; KANJIDIC2 эх сурвалж
          </p>
        </div>

        {/* Level filter */}
        <div className="mb-6">
          <LevelFilter value={level} onChange={(l) => { setLevel(l); setPage(0); setSelected(null) }} />
        </div>

        <div className="flex gap-6">
          {/* Kanji grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2">
                {[...Array(60)].map((_, i) => <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2">
                {data?.data.map((kanji) => (
                  <KanjiTile
                    key={kanji.id}
                    kanji={kanji}
                    isSelected={selected?.id === kanji.id}
                    onClick={() => setSelected(selected?.id === kanji.id ? null : kanji)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {(data?.total ?? 0) > 60 && (
              <div className="flex justify-center gap-3 mt-6">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-muted">← Өмнөх</button>
                <span className="text-sm text-muted-foreground self-center">{page + 1} / {Math.ceil((data?.total ?? 0) / 60)}</span>
                <button disabled={(page + 1) * 60 >= (data?.total ?? 0)} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-muted">Дараах →</button>
              </div>
            )}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-72 flex-shrink-0 hidden lg:block"
              >
                <KanjiDetailPanel
                  kanji={selected}
                  mnemonics={mnemonics ?? []}
                  userId={userId!}
                  onClose={() => setSelected(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  )
}

// ─── Kanji tile ───────────────────────────────────────────────

function KanjiTile({ kanji, isSelected, onClick }: {
  kanji: KanjiFull
  isSelected: boolean
  onClick: () => void
}) {
  const level = kanji.jlpt_levels?.[0]
  const levelColors: Record<string, string> = {
    N5: 'border-green-300',  N4: 'border-blue-300',
    N3: 'border-yellow-300', N2: 'border-orange-300', N1: 'border-red-300',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all',
        'hover:scale-105 hover:shadow-md',
        isSelected ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' : `bg-card ${levelColors[level ?? ''] ?? 'border-muted'}`,
      )}
    >
      <span className="text-2xl" style={{ fontFamily: 'var(--font-noto-jp)' }}>
        {kanji.character}
      </span>
      {kanji.stroke_count && (
        <span className={cn('text-[9px] mt-0.5', isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
          {kanji.stroke_count}画
        </span>
      )}
    </button>
  )
}

// ─── Kanji detail panel ───────────────────────────────────────

function KanjiDetailPanel({ kanji, mnemonics, userId, onClose }: {
  kanji: KanjiFull
  mnemonics: any[]
  userId: string
  onClose: () => void
}) {
  const [playingAnim, setPlayingAnim] = useState(false)

  const handleAddSrs = async () => {
    await addToSrs({ userId, itemType: 'kanji', itemId: kanji.id })
    toast.success(`${kanji.character} SRS-д нэмэгдлээ`)
  }

  const handleBookmark = async () => {
    await toggleBookmark({ userId, itemType: 'kanji', itemId: kanji.id })
    toast.success('Хадгаллаа')
  }

  return (
    <div className="sticky top-4 bg-card border rounded-2xl overflow-hidden">
      {/* Big kanji */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
        <div className="text-7xl font-bold mb-2" style={{ fontFamily: 'var(--font-noto-jp)' }}>
          {kanji.character}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {kanji.jlpt_levels?.map((l) => (
            <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{l}</span>
          ))}
          {kanji.grade && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{kanji.grade}年生</span>}
          {kanji.stroke_count && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{kanji.stroke_count}画</span>}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Meanings */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Утга</div>
          {kanji.meaning_mn && <div className="text-base font-semibold">{kanji.meaning_mn}</div>}
          <div className="text-sm text-muted-foreground">{kanji.meaning_en?.slice(0, 3).join(', ')}</div>
        </div>

        {/* Readings */}
        <div className="grid grid-cols-2 gap-3">
          {kanji.on_yomi?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1">音読み</div>
              <div className="flex flex-wrap gap-1">
                {kanji.on_yomi.map((r) => (
                  <span key={r} className="text-sm px-2 py-0.5 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 rounded font-medium" style={{ fontFamily: 'var(--font-noto-jp)' }}>{r}</span>
                ))}
              </div>
            </div>
          )}
          {kanji.kun_yomi?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1">訓読み</div>
              <div className="flex flex-wrap gap-1">
                {kanji.kun_yomi.map((r) => (
                  <span key={r} className="text-sm px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded font-medium" style={{ fontFamily: 'var(--font-noto-jp)' }}>{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stroke animation */}
        {kanji.stroke_data?.svg_full && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Зурлагын дараалал</div>
            <KanjiStrokeSvg
              svgData={kanji.stroke_data.svg_full}
              strokeCount={kanji.stroke_data.stroke_count ?? 0}
            />
          </div>
        )}

        {/* Mnemonic */}
        {mnemonics?.[0] && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-3">
            <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1">💡 Mnemonic</div>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">{mnemonics[0].content}</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleAddSrs}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Brain className="w-3.5 h-3.5" />
            SRS нэмэх
          </button>
          <button
            onClick={handleBookmark}
            className="p-2 rounded-lg border hover:bg-muted"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
