'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { AppShell } from '@/components/layout/AppShell'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, BookOpen, Type, AlignLeft, MessageSquare, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { SearchResult } from '@/types'

const TYPE_CONFIG = {
  vocab:    { label: '語彙', icon: <BookOpen className="w-3 h-3" />,    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',    href: '/vocabulary' },
  kanji:    { label: '漢字', icon: <Type className="w-3 h-3" />,         color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',        href: '/kanji'      },
  grammar:  { label: '文法', icon: <AlignLeft className="w-3 h-3" />,   color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', href: '/grammar'    },
  sentence: { label: '例文', icon: <MessageSquare className="w-3 h-3" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', href: '#'    },
}

function useSearch(query: string) {
  const sb = createClient()
  return useQuery<SearchResult[]>({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (!query.trim() || query.length < 1) return []
      const [vocabRes, kanjiRes, grammarRes, sentenceRes] = await Promise.all([
        Promise.resolve(sb.rpc('search_vocab_full', { q: query, lim: 8 })).catch(() => ({ data: [] })),
        sb.from('v_kanji_full').select('id, character, meaning_mn, meaning_en, jlpt_levels').eq('character', query).limit(3),
        sb.from('grammar').select('id, form, meaning_mn, jlpt_level').ilike('form', `%${query}%`).eq('review_status','approved').limit(5),
        sb.from('example_sentences').select('id, japanese, reading, mongolian, difficulty').ilike('japanese', `%${query}%`).limit(4),
      ])
      const results: SearchResult[] = []
      ;(vocabRes.data ?? []).forEach((r: any) => results.push({ type:'vocab', id:r.id, primary:r.kanji ?? r.reading ?? '', secondary:r.reading ?? '', meaning:r.meaning_mn ?? r.meaning_en ?? '', jlpt:r.jlpt ?? null }))
      ;(kanjiRes.data ?? []).forEach((r: any) => results.push({ type:'kanji', id:r.id, primary:r.character, secondary:'', meaning:r.meaning_mn ?? (r.meaning_en?.[0] ?? ''), jlpt:r.jlpt_levels?.[0] ?? null }))
      ;(grammarRes.data ?? []).forEach((r: any) => results.push({ type:'grammar', id:r.id, primary:r.form, secondary:r.jlpt_level, meaning:r.meaning_mn ?? '', jlpt:r.jlpt_level }))
      ;(sentenceRes.data ?? []).forEach((r: any) => results.push({ type:'sentence', id:r.id, primary:r.japanese, secondary:r.reading ?? '', meaning:r.mongolian ?? '', jlpt:r.difficulty ?? null }))
      return results
    },
    enabled:   query.length >= 1,
    staleTime: 30_000,
  })
}

const QUICK_SEARCHES = ['食べる','勉強','日本語','にもかかわらず','漢字','桜','東京','先生','ありがとう','電車']

export default function SearchPage() {
  const [query,    setQuery]    = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const { data: results, isFetching, isLoading } = useSearch(debounced)

  const levelColors: Record<string, string> = {
    N5:'bg-green-100 text-green-700', N4:'bg-blue-100 text-blue-700',
    N3:'bg-yellow-100 text-yellow-700', N2:'bg-orange-100 text-orange-700', N1:'bg-red-100 text-red-700',
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">🔍 Хайлт</h1>
          <p className="text-muted-foreground text-sm">Үг, кanji, дүрэм хайна уу</p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Хайх... (японоор, монголоор, англиар)"
            autoFocus
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {(isFetching || isLoading) && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {query && (
              <button onClick={() => { setQuery(''); setDebounced('') }}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick searches */}
        {!query && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Нийтлэг хайлт</div>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map(w => (
                <button key={w} onClick={() => { setQuery(w); setDebounced(w) }}
                  className="px-3 py-1.5 rounded-full border bg-card text-sm hover:bg-muted hover:border-primary transition-colors"
                  style={{ fontFamily: 'var(--font-noto-jp, serif)' }}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {debounced && results !== undefined && (
            <motion.div key={debounced} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="space-y-2">
              {results.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">「{debounced}」-д тохирох үр дүн олдсонгүй</p>
                </div>
              ) : (
                <>
                  <div className="text-xs text-muted-foreground">{results.length} үр дүн</div>
                  {results.map((r, i) => {
                    const tc   = TYPE_CONFIG[r.type as keyof typeof TYPE_CONFIG]
                    const href = r.type === 'kanji' ? `/kanji` : tc?.href ?? '#'
                    return (
                      <motion.div key={`${r.type}-${r.id}`} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                        transition={{ delay: i * 0.03 }}>
                        <Link href={href}
                          className="flex items-start gap-3 p-4 bg-card border rounded-xl hover:border-primary hover:shadow-sm transition-all group">
                          <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 mt-0.5', tc?.color ?? 'bg-muted text-muted-foreground')}>
                            {tc?.icon}
                            <span>{tc?.label ?? r.type}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-lg font-bold group-hover:text-primary transition-colors"
                                style={{ fontFamily: /[\u3040-\u9fff]/.test(r.primary) ? 'var(--font-noto-jp, serif)' : undefined }}>
                                {r.primary}
                              </span>
                              {r.secondary && r.secondary !== r.primary && (
                                <span className="text-sm text-muted-foreground">{r.secondary}</span>
                              )}
                              {r.jlpt && (
                                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', levelColors[r.jlpt] ?? 'bg-muted text-muted-foreground')}>
                                  {r.jlpt}
                                </span>
                              )}
                            </div>
                            {r.meaning && (
                              <p className="text-sm text-muted-foreground mt-0.5 truncate">{r.meaning}</p>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
