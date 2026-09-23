import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['mn', 'en', 'ja'] as const
export type AppLocale = (typeof locales)[number]

function isAppLocale(value: string | undefined): value is AppLocale {
  return locales.includes(value as AppLocale)
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const requested = cookieStore.get('NEXT_LOCALE')?.value
  const locale: AppLocale = isAppLocale(requested) ? requested : 'mn'
  return { locale, messages: (await import(`./messages/${locale}.json`)).default }
})
