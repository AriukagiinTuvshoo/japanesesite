// ============================================================
// ActivityChart — recharts-based study activity
// ============================================================
'use client'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { subDays, format, parseISO } from 'date-fns'
import { mn } from 'date-fns/locale'

export function ActivityChart({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ['activity-7d', userId],
    queryFn: async () => {
      const sb   = createClient()
      const from = subDays(new Date(), 6).toISOString()
      const { data } = await sb
        .from('review_logs')
        .select('reviewed_at, rating')
        .eq('user_id', userId)
        .gte('reviewed_at', from)
      return data ?? []
    },
    enabled: !!userId,
  })

  // Aggregate by day
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    return {
      date:    format(d, 'MM/dd'),
      label:   format(d, 'EEE', { locale: mn }),
      reviews: 0,
      correct: 0,
    }
  })

  data?.forEach((log: any) => {
    const d    = format(parseISO(log.reviewed_at), 'MM/dd')
    const day  = days.find((x) => x.date === d)
    if (day) {
      day.reviews++
      if (log.rating >= 3) day.correct++
    }
  })

  if (!data?.length) {
    return (
      <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
        Одоохондоо мэдээлэл байхгүй. Давтаж эхлэхэд график гарна.
      </div>
    )
  }

  const maxVal = Math.max(...days.map((d) => d.reviews), 1)

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={days} barSize={28} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} domain={[0, maxVal + 2]} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: 'var(--muted)', radius: 6 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="bg-card border rounded-lg px-3 py-2 text-xs shadow-lg">
                <div className="font-semibold mb-1">{label}</div>
                <div>Нийт: {d.reviews}</div>
                <div>Зөв: {d.correct}</div>
              </div>
            )
          }}
        />
        <Bar dataKey="reviews" radius={[4, 4, 0, 0]}>
          {days.map((d, i) => (
            <Cell
              key={i}
              fill={d.reviews === 0 ? 'var(--muted)' : d.reviews >= 20 ? '#22c55e' : '#3b82f6'}
              opacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
