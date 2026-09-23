'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { AppLocale } from '@/i18n/request'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

const options: { value: AppLocale; label: string }[] = [
  { value: 'mn', label: 'Монгол' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
]

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const t = useTranslations('navigation')
  const userId = useAuthStore((state) => state.userId)
  const profile = useAuthStore((state) => state.profile)
  const setProfile = useAuthStore((state) => state.setProfile)

  async function changeLocale(next: AppLocale) {
    if (next === locale) return
    if (userId) {
      const { error } = await createClient().from('profiles').update({ ui_language: next }).eq('id', userId)
      if (error) { toast.error('Хэлний тохиргоо хадгалагдсангүй.'); return }
      if (profile) setProfile({ ...profile, ui_language: next })
    }
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `NEXT_LOCALE=${next}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
    router.refresh()
  }

  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="sr-only">{t('language')}</span>
      <select aria-label={t('language')} value={locale} onChange={(event) => changeLocale(event.target.value as AppLocale)}
        className="max-w-28 rounded-md border bg-card px-2 py-1.5 text-foreground outline-none focus:ring-2 focus:ring-primary/40">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}
