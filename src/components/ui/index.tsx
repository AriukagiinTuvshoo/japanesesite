// ============================================================
// Shared UI Components
// ============================================================
'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Brain, Bookmark, BookmarkCheck, Volume2, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VocabFull, JlptLevel } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { getSentences } from '@/lib/api'
import { motion } from 'framer-motion'

// ─── VocabCard ────────────────────────────────────────────────

interface VocabCardProps {
  vocab: VocabFull
  isSelected?: boolean
  onClick?: () => void
  onAddSrs?: () => void
  onBookmark?: () => void
}

export function VocabCard({ vocab, isSelected, onClick, onAddSrs, onBookmark }: VocabCardProps) {
  const primary  = vocab.kanji_forms?.[0] ?? vocab.kana_forms?.[0] ?? ''
  const reading  = vocab.kana_forms?.[0] ?? ''
  const meaning  = vocab.meanings_mn?.[0] ?? vocab.meanings_en?.[0]?.[0] ?? ''
  const level    = vocab.jlpt_levels?.[0]

  const levelColors: Record<string, string> = {
    N5: 'text-green-600 bg-green-50 dark:bg-green-950',
    N4: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    N3: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950',
    N2: 'text-orange-600 bg-orange-50 dark:bg-orange-950',
    N1: 'text-red-600 bg-red-50 dark:bg-red-950',
  }

  return (
    <div
      className={cn(
        'bg-card border rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-md',
        isSelected && 'border-primary ring-1 ring-primary shadow-md',
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Japanese */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold truncate" style={{ fontFamily: 'var(--font-noto-jp)' }}>
              {primary}
            </span>
            {primary !== reading && reading && (
              <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-noto-jp)' }}>
                {reading}
              </span>
            )}
          </div>
          {/* Mongolian / English */}
          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{meaning}</div>
        </div>

        {/* Level badge */}
        {level && (
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0', levelColors[level])}>
            {level}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t">
        <button
          onClick={(e) => { e.stopPropagation(); onAddSrs?.() }}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-primary hover:bg-primary/10 transition-colors"
        >
          <Brain className="w-3 h-3" /> SRS
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark?.() }}
          className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        >
          <Bookmark className="w-3 h-3" />
        </button>
        <button className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
          <Volume2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ─── VocabDetail ──────────────────────────────────────────────

interface VocabDetailProps {
  vocab: VocabFull
  onClose?: () => void
  onAddSrs?: () => void
  userId: string
}

export function VocabDetail({ vocab, onClose, onAddSrs, userId }: VocabDetailProps) {
  const primary = vocab.kanji_forms?.[0] ?? vocab.kana_forms?.[0] ?? ''
  const reading = vocab.kana_forms?.[0] ?? ''

  const { data: sentences } = useQuery({
    queryKey: ['sentences', vocab.id],
    queryFn:  () => getSentences({ vocabId: vocab.id, pageSize: 3 }),
  })

  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-noto-jp)' }}>{primary}</div>
            {primary !== reading && (
              <div className="text-lg text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-noto-jp)' }}>{reading}</div>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {vocab.jlpt_levels?.map((l) => (
                <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{l}</span>
              ))}
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Meanings */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Утга</div>
          {vocab.meanings_mn?.filter(Boolean).map((m, i) => (
            <div key={i} className="text-base font-medium mb-0.5">{m}</div>
          ))}
          {vocab.meanings_en?.slice(0, 2).map((glosses, i) => (
            <div key={i} className="text-sm text-muted-foreground">{glosses?.slice(0,3).join(', ')}</div>
          ))}
        </div>

        {/* Example sentences */}
        {sentences?.data && sentences.data.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Жишээ өгүүлбэр</div>
            <div className="space-y-2">
              {sentences.data.slice(0,2).map((s) => (
                <div key={s.id} className="bg-muted/50 rounded-xl p-3">
                  <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-noto-jp)' }}>{s.japanese}</div>
                  {s.mongolian && <div className="text-xs text-primary mt-1">{s.mongolian}</div>}
                  {!s.mongolian && s.english && <div className="text-xs text-muted-foreground mt-1">{s.english}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onAddSrs}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
          >
            <Brain className="w-4 h-4" /> SRS-д нэмэх
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────

interface StatCardProps {
  label:     string
  value:     number | string
  icon?:     React.ReactNode
  suffix?:   string
  highlight?: boolean
  href?:     string
  color?:    'blue' | 'green' | 'yellow' | 'purple' | 'red'
  goal?:     number
}

const colorMap = {
  blue:   'bg-blue-50 text-blue-600 dark:bg-blue-950/40',
  green:  'bg-green-50 text-green-600 dark:bg-green-950/40',
  yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/40',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40',
  red:    'bg-red-50 text-red-600 dark:bg-red-950/40',
}

export function StatCard({ label, value, icon, suffix, highlight, href, color = 'blue', goal }: StatCardProps) {
  const content = (
    <div className={cn(
      'bg-card border rounded-xl p-4 transition-all',
      highlight && 'border-primary ring-1 ring-primary',
      href && 'hover:shadow-md cursor-pointer',
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        {icon && (
          <div className={cn('p-1.5 rounded-lg', colorMap[color])}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {goal && (
        <div className="mt-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, (Number(value) / goal) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">{value}/{goal} {suffix}</div>
        </div>
      )}
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

// ─── LevelFilter ──────────────────────────────────────────────

interface LevelFilterProps {
  value:    JlptLevel | undefined
  onChange: (level: JlptLevel | undefined) => void
  className?: string
}

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const LEVEL_COLORS: Record<JlptLevel, string> = {
  N5: 'bg-green-500',
  N4: 'bg-blue-500',
  N3: 'bg-yellow-500',
  N2: 'bg-orange-500',
  N1: 'bg-red-500',
}

export function LevelFilter({ value, onChange, className }: LevelFilterProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <button
        onClick={() => onChange(undefined)}
        className={cn('px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
          !value ? 'bg-foreground text-background border-foreground' : 'bg-background hover:bg-muted'
        )}
      >
        Бүгд
      </button>
      {LEVELS.map((l) => (
        <button
          key={l}
          onClick={() => onChange(value === l ? undefined : l)}
          className={cn(
            'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
            value === l
              ? `${LEVEL_COLORS[l]} text-white border-transparent`
              : 'bg-background hover:bg-muted',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

// ─── SrsWidget ────────────────────────────────────────────────

export function SrsWidget({ dueCount }: { dueCount: number }) {
  return (
    <div className={cn(
      'rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-5 transition-all',
      dueCount > 0 ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' : 'bg-card',
    )}>
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Brain className="w-8 h-8 text-primary" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        {dueCount > 0 ? (
          <>
            <div className="text-2xl font-bold">{dueCount} карт давтах</div>
            <div className="text-muted-foreground text-sm mt-0.5">
              Мартахаас өмнө давтаж байгаарай. Зурлага давтах нь санах ойг бэхжүүлнэ.
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">Өнөөдрийн давталт дууссан 🎉</div>
            <div className="text-muted-foreground text-sm mt-0.5">Маш сайн хийлээ! Маргааш дахин ирнэ.</div>
          </>
        )}
      </div>
      {dueCount > 0 && (
        <Link
          href="/study"
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Эхлэх <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

// ─── StreakBadge ──────────────────────────────────────────────

export function StreakBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
      <span className="text-xl">🔥</span>
      <div>
        <div className="text-sm font-bold text-orange-700 dark:text-orange-300">{count} өдөр</div>
        <div className="text-[10px] text-orange-500 dark:text-orange-400">тасралтгүй мөр</div>
      </div>
    </div>
  )
}

// ─── LevelProgress ────────────────────────────────────────────

const LEVEL_TARGETS: Record<JlptLevel, { vocab: number; kanji: number }> = {
  N5: { vocab: 800,   kanji: 100 },
  N4: { vocab: 1500,  kanji: 300 },
  N3: { vocab: 3750,  kanji: 650 },
  N2: { vocab: 6000,  kanji: 1000 },
  N1: { vocab: 10000, kanji: 2000 },
}

export function LevelProgress({ level, vocabMastered, kanjiMastered }: {
  level: JlptLevel
  vocabMastered: number
  kanjiMastered: number
}) {
  const target = LEVEL_TARGETS[level]
  const vocabPct  = Math.min(100, Math.round((vocabMastered / target.vocab) * 100))
  const kanjiPct  = Math.min(100, Math.round((kanjiMastered / target.kanji) * 100))

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        🎯 {level} түвшний явц
      </h3>
      {[
        { label: '📖 Үгийн сан', pct: vocabPct, cur: vocabMastered, total: target.vocab, color: 'bg-blue-500' },
        { label: '漢 Кanji',      pct: kanjiPct, cur: kanjiMastered, total: target.kanji, color: 'bg-red-500' },
      ].map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium">{item.label}</span>
            <span className="text-muted-foreground">{item.cur.toLocaleString()} / {item.total.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', item.color)}
              initial={{ width: 0 }}
              animate={{ width: `${item.pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 text-right">{item.pct}%</div>
        </div>
      ))}
    </div>
  )
}

// ─── QuickActions ─────────────────────────────────────────────

export function QuickActions() {
  const actions = [
    { href: '/quiz',      emoji: '✏️', label: 'Хурдан тест',    desc: '10 асуулт' },
    { href: '/grammar',   emoji: '文', label: 'Дүрэм унших',    desc: 'N2 загвар' },
    { href: '/search',    emoji: '🔍', label: 'Үг хайх',         desc: 'Хурдан' },
    { href: '/mock-exam', emoji: '📋', label: 'JLPT дасгал',     desc: 'Бодит хэлбэр' },
  ]
  return (
    <div className="bg-card border rounded-2xl p-4">
      <h3 className="font-semibold text-sm mb-3">⚡ Хурдан үйлдэл</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-1 p-2.5 rounded-xl border hover:bg-muted transition-colors text-center"
          >
            <span className="text-xl">{a.emoji}</span>
            <span className="text-xs font-medium">{a.label}</span>
            <span className="text-[10px] text-muted-foreground">{a.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── WeakAreaList ─────────────────────────────────────────────

export function WeakAreaList({ areas }: { areas: any[] }) {
  return (
    <div className="space-y-2">
      {areas.map((area, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-noto-jp)' }}>
              {area.display}
            </span>
            <div>
              <div className="text-xs font-medium">{area.item_type}</div>
              <div className="text-[10px] text-muted-foreground">Алдаа: {area.lapse_count} удаа</div>
            </div>
          </div>
          <Link href={`/${area.item_type}`} className="p-1.5 rounded-lg hover:bg-muted">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      ))}
    </div>
  )
}
