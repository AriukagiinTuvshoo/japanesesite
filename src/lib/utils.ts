import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale = 'mn-MN') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now  = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then
  if (diff < 60_000)      return 'саяхан'
  if (diff < 3_600_000)   return `${Math.round(diff / 60_000)} мин өмнө`
  if (diff < 86_400_000)  return `${Math.round(diff / 3_600_000)} цаг өмнө`
  return `${Math.round(diff / 86_400_000)} өдрийн өмнө`
}

export function pluralMn(n: number, word: string) {
  return `${n.toLocaleString()} ${word}`
}

export function truncate(str: string, maxLen: number) {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

// JLPT level color classes
export const LEVEL_COLORS = {
  N5: { bg: 'bg-green-500',  text: 'text-green-700',  light: 'bg-green-50 dark:bg-green-950'  },
  N4: { bg: 'bg-blue-500',   text: 'text-blue-700',   light: 'bg-blue-50 dark:bg-blue-950'   },
  N3: { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50 dark:bg-yellow-950' },
  N2: { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50 dark:bg-orange-950' },
  N1: { bg: 'bg-red-500',    text: 'text-red-700',    light: 'bg-red-50 dark:bg-red-950'    },
} as const
