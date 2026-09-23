'use client'
import { useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getVocabList, addToSrs, toggleBookmark } from '@/lib/api'
import { useAuthStore } from '@/store'
import { AppShell }     from '@/components/layout/AppShell'
import { LevelFilter }  from '@/components/ui/LevelFilter'
import { VocabCard }    from '@/components/vocabulary/VocabCard'
import { VocabDetail }  from '@/components/vocabulary/VocabDetail'
import type { JlptLevel, VocabFull } from '@/types'
import { Search, BookmarkPlus, Brain, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const PAGE_SIZE = 24

export default function VocabularyPage() {
  const userId    = useAuthStore((s) => s.userId)
  const [level,   setLevel]   = useState<JlptLevel | undefined>('N2')
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(0)
  const [selected, setSelected] = useState<VocabFull | null>(null)
  const [filter,  setFilter]  = useState<'all' | 'common'>('all')
  const [, startTransition]   = useTransition()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['vocab-list', level, search, page, filter],
    queryFn:  () => getVocabList({
      level,
      page,
      pageSize: PAGE_SIZE,
      search:   search || undefined,
      onlyCommon: filter === 'common',
    }),
    placeholderData: (prev) => prev,
  })

  const handleAddSrs = async (vocab: VocabFull) => {
    if (!userId) return
    await addToSrs({ userId, itemType: 'vocab', itemId: vocab.id })
    toast.success(`"${vocab.kanji_forms?.[0] ?? vocab.kana_forms?.[0]}" SRS-д нэмэгдлээ`)
  }

  const handleBookmark = async (vocab: VocabFull) => {
    if (!userId) return
    const added = await toggleBookmark({ userId, itemType: 'vocab', itemId: vocab.id })
    toast.success(added ? 'Хадгаллаа' : 'Хасагдлаа')
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">📖 Үгийн сан</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total.toLocaleString() ?? '—'} үг &middot; JMDict эх сурвалж
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              placeholder="Хайх... (японоор эсвэл монголоор)"
              className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Level filter */}
          <LevelFilter value={level} onChange={(l) => { setLevel(l); setPage(0) }} />

          {/* Common filter */}
          <button
            onClick={() => setFilter(filter === 'all' ? 'common' : 'all')}
            className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors',
              filter === 'common' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Нийтлэг үг
          </button>
        </div>

        <div className="flex gap-6">
          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 transition-opacity', isFetching && 'opacity-60')}>
                {data?.data.map((vocab) => (
                  <VocabCard
                    key={vocab.id}
                    vocab={vocab}
                    isSelected={selected?.id === vocab.id}
                    onClick={() => setSelected(selected?.id === vocab.id ? null : vocab)}
                    onAddSrs={() => handleAddSrs(vocab)}
                    onBookmark={() => handleBookmark(vocab)}
                  />
                ))}
                {data?.data.length === 0 && (
                  <div className="col-span-3 text-center py-16 text-muted-foreground text-sm">
                    Илэрц олдсонгүй.
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {(data?.total ?? 0) > PAGE_SIZE && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  disabled={page === 0}
                  onClick={() => startTransition(() => setPage((p) => p - 1))}
                  className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-muted"
                >
                  ← Өмнөх
                </button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {Math.ceil((data?.total ?? 0) / PAGE_SIZE)}
                </span>
                <button
                  disabled={(page + 1) * PAGE_SIZE >= (data?.total ?? 0)}
                  onClick={() => startTransition(() => setPage((p) => p + 1))}
                  className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-muted"
                >
                  Дараах →
                </button>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-80 flex-shrink-0 hidden xl:block">
              <div className="sticky top-4">
                <VocabDetail
                  vocab={selected}
                  onClose={() => setSelected(null)}
                  onAddSrs={() => handleAddSrs(selected)}
                  userId={userId!}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
