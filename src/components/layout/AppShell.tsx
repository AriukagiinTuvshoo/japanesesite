'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useUIStore, useAuthStore } from '@/store'
import { getDueCount } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard, BookOpen, Type, AlignLeft, Brain, Trophy,
  PenLine, Settings, ChevronLeft, ChevronRight, Search,
  Bell, LogOut, Shield, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'

const NAV_ITEMS = [
  { href: '/dashboard',  labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/study',      labelKey: 'study', icon: Brain, badge: 'due' },
  { href: '/vocabulary', labelKey: 'vocabulary', icon: BookOpen },
  { href: '/kanji',      labelKey: 'kanji', icon: Type },
  { href: '/grammar',    labelKey: 'grammar', icon: AlignLeft },
  { href: '/quiz',       labelKey: 'quiz', icon: PenLine },
  { href: '/mock-exam',  labelKey: 'mockExam', icon: Trophy },
  { href: '/search',     labelKey: 'search', icon: Search },
]

const BOTTOM_ITEMS = [
  { href: '/settings',   labelKey: 'settings', icon: Settings },
  { href: '/admin',      labelKey: 'admin', icon: Shield, adminOnly: true },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const nav = useTranslations('navigation')
  const pathname    = usePathname()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebar  = useUIStore((s) => s.setSidebar)
  const userId      = useAuthStore((s) => s.userId)
  const profile     = useAuthStore((s) => s.profile)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: dueCount } = useQuery({
    queryKey: ['srs-due-count', userId],
    queryFn:  () => getDueCount(userId!),
    enabled:  !!userId,
    refetchInterval: 60_000,
  })

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:relative z-50 flex flex-col border-r bg-card transition-all duration-200',
        'h-full',
        sidebarOpen ? 'w-56' : 'w-16',
        mobileOpen  ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>

        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-4 border-b h-14">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
            JP
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-sm truncate">JLPT Master</span>
          )}
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon    = item.icon
            const active  = pathname.startsWith(item.href)
            const count   = item.badge === 'due' ? dueCount : null

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors relative',
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{nav(item.labelKey)}</span>}
                {count != null && count > 0 && (
                  <span className={cn(
                    'ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full',
                    active ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground',
                    !sidebarOpen && 'absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0 text-[10px]',
                  )}>
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom items */}
        <div className="py-3 px-2 border-t space-y-0.5">
          {BOTTOM_ITEMS.filter(item => !item.adminOnly || isAdmin).map((item) => {
            const Icon   = item.icon
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span>{nav(item.labelKey)}</span>}
              </Link>
            )
          })}

          {/* User avatar */}
          <div className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg',
            sidebarOpen ? '' : 'justify-center',
          )}>
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
              {profile?.display_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{profile?.display_name ?? 'Хэрэглэгч'}</div>
                <div className="text-[10px] text-muted-foreground">{profile?.target_jlpt ?? 'N2'} зорилт</div>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setSidebar(!sidebarOpen)}
          className="absolute -right-3 top-16 w-6 h-6 bg-card border rounded-full hidden lg:flex items-center justify-center hover:bg-muted transition-colors"
        >
          {sidebarOpen
            ? <ChevronLeft  className="w-3 h-3" />
            : <ChevronRight className="w-3 h-3" />
          }
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 border-b flex items-center gap-3 px-4 bg-card flex-shrink-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 rounded hover:bg-muted"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Global search shortcut */}
          <Link
            href="/search"
            className="flex-1 max-w-sm flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Хайх... (⌘K)</span>
          </Link>

          <div className="flex-1" />

          <LocaleSwitcher />

          {/* Notifications */}
          <button className="relative p-1.5 rounded hover:bg-muted">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* XP badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-semibold">
            ⭐ {profile?.total_xp?.toLocaleString() ?? 0}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
