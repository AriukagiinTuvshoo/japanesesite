'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

const PUBLIC_ROUTES = ['/login', '/register', '/auth', '/setup', '/forbidden', '/api/auth']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { setUserId, setProfile, setLoading, clear } = useAuthStore()

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) { setLoading(false); return }
    const sb = createClient()
    let alive = true

    const syncUser = async (userId: string | null) => {
      if (!userId) {
        clear()
        setLoading(false)
        const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))
        if (!isPublic) router.replace('/login')
        return
      }

      setUserId(userId)

      const [{ data: profile }, { data: account }] = await Promise.all([
        sb.from('profiles').select('*').eq('id', userId).maybeSingle(),
        sb.from('users').select('role').eq('id', userId).maybeSingle(),
      ])
      if (profile?.ui_language && profile.ui_language !== locale && ['mn', 'en', 'ja'].includes(profile.ui_language)) {
        const secure = window.location.protocol === 'https:' ? '; Secure' : ''
        document.cookie = `NEXT_LOCALE=${profile.ui_language}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
        router.refresh()
      }
      if (alive) setProfile(profile ? { ...profile, role: account?.role ?? 'user' } : null)
      setLoading(false)
    }

    // Get initial session
    sb.auth.getUser().then(({ data: { user } }) => syncUser(user?.id ?? null))

    // Listen to auth changes
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => void syncUser(session?.user.id ?? null))
    })

    return () => { alive = false; subscription.unsubscribe() }
  }, [pathname, router, locale, setLoading, setProfile, setUserId, clear])

  return <>{children}</>
}
