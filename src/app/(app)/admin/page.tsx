'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { AppShell }    from '@/components/layout/AppShell'
import { useAuthStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, CheckCircle2, XCircle, Clock,
  Users, BookOpen, Type, AlignLeft, RefreshCw, AlertTriangle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { AdminReview } from '@/types'

const ITEM_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  vocab_sense: { label: '📖 Үгийн утга',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'    },
  kanji:       { label: '漢 Кanji',        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'        },
  grammar:     { label: '文 Дүрэм',        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  mnemonic:    { label: '💡 Mnemonic',     color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  sentence:    { label: '🗣 Жишээ',         color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
}

interface ReviewItem extends AdminReview {
  parsed: Record<string, string>
}

export default function AdminPage() {
  const profile    = useAuthStore(s => s.profile)
  const sb         = createClient()
  const qc         = useQueryClient()
  const [activeType,   setActiveType]   = useState<string | null>(null)
  const [activeStatus, setActiveStatus] = useState('pending')
  const [showBatch,    setShowBatch]    = useState(false)

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10)
      const [p, a, u, v, k, g] = await Promise.all([
        sb.from('admin_reviews').select('*', { count: 'exact', head: true }).eq('status','pending'),
        sb.from('admin_reviews').select('*', { count: 'exact', head: true }).eq('status','approved').gte('updated_at', today),
        sb.from('profiles').select('*', { count: 'exact', head: true }),
        sb.from('vocabulary').select('*', { count: 'exact', head: true }),
        sb.from('kanji').select('*', { count: 'exact', head: true }),
        sb.from('grammar').select('*', { count: 'exact', head: true }),
      ])
      return { pending: p.count ?? 0, approved_today: a.count ?? 0, users: u.count ?? 0, vocab: v.count ?? 0, kanji: k.count ?? 0, grammar: g.count ?? 0 }
    },
    refetchInterval: 30_000,
  })

  const { data: queue, isLoading } = useQuery<ReviewItem[]>({
    queryKey: ['admin-queue', activeType, activeStatus],
    queryFn: async () => {
      let q = sb.from('admin_reviews').select('*')
        .eq('status', activeStatus).order('priority').order('created_at').limit(50)
      if (activeType) q = q.eq('item_type', activeType)
      const { data } = await q
      return (data ?? []).map(r => ({
        ...r,
        parsed: (() => { try { return JSON.parse(r.content_snapshot) } catch { return { raw: r.content_snapshot } } })(),
      }))
    },
    refetchInterval: 20_000,
  })

  const invalidate = () => { qc.invalidateQueries({ queryKey: ['admin-queue'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }) }

  const doApprove = useMutation({
    mutationFn: async (id: number) => {
      const { data: r } = await sb.from('admin_reviews').select('*').eq('id', id).single()
      if (!r) throw new Error('Not found')
      await sb.from('admin_reviews').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', id)
      if (r.item_type === 'kanji')       await sb.from('kanji').update({ meaning_mn_status: 'approved' }).eq('id', r.item_id)
      if (r.item_type === 'vocab_sense') await sb.from('vocabulary_senses').update({ gloss_mn_status: 'approved' }).eq('id', r.item_id)
      if (r.item_type === 'grammar')     await sb.from('grammar').update({ review_status: 'approved' }).eq('id', r.item_id)
      if (r.item_type === 'mnemonic')    await sb.from('mnemonics').update({ review_status: 'approved' }).eq('id', r.item_id)
      if (r.item_type === 'sentence')    await sb.from('example_sentences').update({ mn_status: 'approved' }).eq('id', r.item_id)
    },
    onSuccess: () => { toast.success('Батлагдлаа ✓'); invalidate() },
    onError: () => toast.error('Алдаа гарлаа'),
  })

  const doReject = useMutation({
    mutationFn: async (id: number) => { await sb.from('admin_reviews').update({ status:'rejected', updated_at: new Date().toISOString() }).eq('id', id) },
    onSuccess: () => { toast.success('Татгалзлаа'); invalidate() },
    onError: () => toast.error('Алдаа гарлаа'),
  })

  const doBatchApprove = useMutation({
    mutationFn: async () => {
      let q = sb.from('admin_reviews').update({ status:'approved', updated_at: new Date().toISOString() }).eq('status','pending')
      if (activeType) q = q.eq('item_type', activeType)
      await q
    },
    onSuccess: () => { toast.success('Бүгд батлагдлаа ✓'); setShowBatch(false); invalidate() },
    onError: () => toast.error('Алдаа гарлаа'),
  })

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center text-center">
          <div>
            <Shield className="mx-auto mb-3 h-14 w-14 text-muted-foreground" />
            <h2 className="text-xl font-bold">Нэвтрэх эрхгүй</h2>
            <p className="text-sm text-muted-foreground">Зөвхөн администратор харагдана.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" /> Админ хянах самбар
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">AI контент баталгаажуулна</p>
          </div>
          <button onClick={() => setShowBatch(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm hover:bg-muted font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Бүгдийг батлах
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Хүлээгдэж',    value: stats?.pending ?? 0,         icon: <Clock className="w-4 h-4" />,      color: 'text-yellow-600' },
            { label: 'Өнөөдөр батл', value: stats?.approved_today ?? 0,  icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-600' },
            { label: 'Хэрэглэгч',    value: stats?.users ?? 0,           icon: <Users className="w-4 h-4" />,      color: 'text-blue-600'   },
            { label: 'Үгийн сан',    value: stats?.vocab ?? 0,           icon: <BookOpen className="w-4 h-4" />,   color: 'text-indigo-600' },
            { label: 'Кanji',        value: stats?.kanji ?? 0,           icon: <Type className="w-4 h-4" />,       color: 'text-red-600'    },
            { label: 'Дүрэм',        value: stats?.grammar ?? 0,         icon: <AlignLeft className="w-4 h-4" />,  color: 'text-teal-600'   },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-3 flex flex-col gap-1">
              <div className={cn('w-fit', s.color)}>{s.icon}</div>
              <div className="text-lg font-bold tabular-nums">{s.value.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {[['pending','Хүлээгдэж'],['approved','Батлагдсан'],['rejected','Татгалзсан']].map(([s, label]) => (
              <button key={s} onClick={() => setActiveStatus(s)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  activeStatus === s ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => setActiveType(null)}
            className={cn('px-2.5 py-1.5 rounded-lg text-xs border', !activeType ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}>
            Бүгд
          </button>
          {Object.entries(ITEM_TYPE_LABELS).map(([key, val]) => (
            <button key={key} onClick={() => setActiveType(key)}
              className={cn('px-2.5 py-1.5 rounded-lg text-xs border', activeType === key ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}>
              {val.label}
            </button>
          ))}
          <button onClick={() => qc.invalidateQueries()} className="ml-auto p-2 rounded-lg border hover:bg-muted">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Queue */}
        {isLoading ? (
          <div className="space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="h-20 bg-muted rounded-xl animate-pulse"/>)}</div>
        ) : queue?.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold">Бүгд баталгаажлаа!</h3>
            <p className="text-muted-foreground text-sm">Хянах зүйл байхгүй.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {queue?.map(item => {
                const typeInfo = ITEM_TYPE_LABELS[item.item_type] ?? { label: item.item_type, color: 'bg-muted text-muted-foreground' }
                const mn = item.parsed?.mongolian ?? item.parsed?.raw ?? ''
                return (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-card border rounded-xl p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', typeInfo.color)}>{typeInfo.label}</span>
                        <span className="text-[10px] text-muted-foreground">#{item.item_id}</span>
                        {item.priority <= 3 && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">🔴 Яаралтай</span>}
                      </div>
                      <div className="text-sm">{mn || JSON.stringify(item.parsed)}</div>
                      {item.parsed?.mnemonic && <div className="text-xs text-muted-foreground mt-1 italic">💡 {item.parsed.mnemonic}</div>}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button onClick={() => doApprove.mutate(item.id)} disabled={doApprove.isPending}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 disabled:opacity-50">
                        {doApprove.isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <CheckCircle2 className="w-3 h-3"/>} Батлах
                      </button>
                      <button onClick={() => doReject.mutate(item.id)} disabled={doReject.isPending}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50">
                        <XCircle className="w-3 h-3"/> Татгалзах
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}

        {/* Batch confirm */}
        {showBatch && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border p-6 max-w-sm w-full space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                <h3 className="font-semibold">Бүгдийг батлах уу?</h3>
              </div>
              <p className="text-sm text-muted-foreground">Хүлээгдэж буй бүх контентийг баталгаажуулна.</p>
              <div className="flex gap-2">
                <button onClick={() => doBatchApprove.mutate()} disabled={doBatchApprove.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-60">
                  {doBatchApprove.isPending ? 'Боловсруулж байна...' : 'Тийм, батлах'}
                </button>
                <button onClick={() => setShowBatch(false)}
                  className="flex-1 py-2.5 rounded-xl border font-semibold text-sm hover:bg-muted">
                  Болих
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
