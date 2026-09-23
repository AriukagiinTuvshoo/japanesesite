'use client'
import { useEffect } from 'react'
import { useQuery }  from '@tanstack/react-query'
import Link from 'next/link'
import { getDashboardStats, getDueCount } from '@/lib/api'
import { useAuthStore }    from '@/store'
import { AppShell }        from '@/components/layout/AppShell'
import { StatCard }        from '@/components/ui/StatCard'
import { SrsWidget }       from '@/components/srs/SrsWidget'
import { StreakBadge }     from '@/components/gamification/StreakBadge'
import { LevelProgress }   from '@/components/ui/LevelProgress'
import { WeakAreaList }    from '@/components/ui/WeakAreaList'
import { ActivityChart }   from '@/components/charts/ActivityChart'
import { QuickActions }    from '@/components/ui/QuickActions'
import {
  BookOpen, Brain, Trophy, Flame, Target, Clock, Star, TrendingUp,
} from 'lucide-react'

export default function DashboardPage() {
  const userId = useAuthStore((s) => s.userId)

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', userId],
    queryFn:  () => getDashboardStats(userId!),
    enabled:  !!userId,
    refetchInterval: 60_000,
  })

  const { data: dueCount } = useQuery({
    queryKey: ['srs-due-count', userId],
    queryFn:  () => getDueCount(userId!),
    enabled:  !!userId,
    refetchInterval: 30_000,
  })

  if (isLoading) return <AppShell><DashboardSkeleton /></AppShell>

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Сайн уу, {stats?.user.display_name ?? 'Сурагч'} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Зорилго: JLPT {stats?.user.target_jlpt ?? 'N2'} &middot; {new Date().toLocaleDateString('mn-MN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <StreakBadge count={stats?.streak ?? 0} />
        </div>

        {/* ── Top stats ──────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Давтах карт"
            value={dueCount ?? 0}
            icon={<Brain className="w-4 h-4" />}
            highlight={dueCount! > 0}
            href="/study"
            color="blue"
          />
          <StatCard
            label="Өнөөдрийн XP"
            value={stats?.today.xp_earned ?? 0}
            icon={<Star className="w-4 h-4" />}
            suffix="XP"
            color="yellow"
          />
          <StatCard
            label="Суралцсан мин"
            value={stats?.today.study_minutes ?? 0}
            icon={<Clock className="w-4 h-4" />}
            suffix="мин"
            goal={stats?.user.daily_goal_minutes}
            color="green"
          />
          <StatCard
            label="Нийт XP"
            value={stats?.user.total_xp ?? 0}
            icon={<Trophy className="w-4 h-4" />}
            color="purple"
          />
        </div>

        {/* ── Main content grid ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* SRS widget */}
          <div className="lg:col-span-2">
            <SrsWidget dueCount={dueCount ?? 0} />
          </div>

          {/* Level progress */}
          <div className="space-y-4">
            <LevelProgress
              level={stats?.user.target_jlpt ?? 'N2'}
              vocabMastered={stats?.vocab_mastered ?? 0}
              kanjiMastered={stats?.kanji_mastered ?? 0}
            />
            <QuickActions />
          </div>
        </div>

        {/* ── Activity chart ──────────────────────── */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Суралцалтын түүх (7 хоног)
          </h2>
          <ActivityChart userId={userId!} />
        </div>

        {/* ── Weak areas ──────────────────────────── */}
        {(stats?.weak_areas?.length ?? 0) > 0 && (
          <div className="bg-card border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-destructive" />
              Сул хэсгүүд — анхаарах шаардлагатай
            </h2>
            <WeakAreaList areas={stats!.weak_areas} />
          </div>
        )}

        {/* ── Quick nav ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/vocabulary', label: 'Үгийн сан',   icon: '📖', color: 'bg-blue-500/10 text-blue-600'   },
            { href: '/kanji',      label: 'Кanji',       icon: '漢', color: 'bg-red-500/10 text-red-600'     },
            { href: '/grammar',    label: 'Дүрэм',       icon: '文', color: 'bg-green-500/10 text-green-600' },
            { href: '/quiz',       label: 'Тест',        icon: '✏️', color: 'bg-purple-500/10 text-purple-600'},
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border ${item.color} hover:scale-[1.02] transition-transform`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

      </div>
    </AppShell>
  )
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    </div>
  )
}
