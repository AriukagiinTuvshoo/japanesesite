'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore, useUIStore } from '@/store'
import { AppShell } from '@/components/layout/AppShell'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import {
  User, Bell, Moon, Sun, Monitor, Target, Clock, BookOpen,
  LogOut, Trash2, Save, ChevronRight, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { JlptLevel } from '@/types'

const LEVEL_DESCRIPTIONS: Record<JlptLevel, string> = {
  N5: '~800 үг · ~100 кanji · Анхан шат',
  N4: '~1,500 үг · ~300 кanji · Анхан дунд',
  N3: '~3,750 үг · ~650 кanji · Дунд шат',
  N2: '~6,000 үг · ~1,000 кanji · Дунд дээд',
  N1: '~10,000+ үг · ~2,000 кanji · Дээд шат',
}

const DAILY_GOALS = [
  { value: 10,  label: '10 минут',  desc: 'Хамгийн бага' },
  { value: 20,  label: '20 минут',  desc: 'Тогтвортой' },
  { value: 30,  label: '30 минут',  desc: 'Санал болгох' },
  { value: 60,  label: '1 цаг',     desc: 'Идэвхтэй' },
  { value: 120, label: '2 цаг',     desc: 'Эрч хүчтэй' },
]

export default function SettingsPage() {
  const sb     = createClient()
  const qc     = useQueryClient()
  const userId = useAuthStore(s => s.userId)
  const profile = useAuthStore(s => s.profile)
  const setProfile = useAuthStore(s => s.setProfile)
  const { theme, setTheme } = useTheme()
  const { showFurigana, toggleFurigana, showRomaji, toggleRomaji, autoplayAudio, toggleAutoplay } = useUIStore()

  const [saving, setSaving] = useState(false)
  const [form,   setForm]   = useState({
    display_name:       profile?.display_name ?? '',
    username:           profile?.username ?? '',
    target_jlpt:        (profile?.target_jlpt ?? 'N2') as JlptLevel,
    daily_goal_minutes: profile?.daily_goal_minutes ?? 30,
    notifications_on:   profile?.notifications_on ?? true,
    timezone:           profile?.timezone ?? 'Asia/Ulaanbaatar',
  })

  const { data: stats } = useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: async () => {
      if (!userId) return null
      const [cards, streak, xp] = await Promise.all([
        sb.from('srs_cards').select('card_state').eq('user_id', userId),
        sb.from('profiles').select('streak_count, longest_streak, total_xp').eq('id', userId).single(),
        sb.from('xp_logs').select('amount').eq('user_id', userId),
      ])
      const mastered = (cards.data ?? []).filter(c => ['mastered','burned'].includes(c.card_state)).length
      return {
        total_cards: cards.data?.length ?? 0,
        mastered,
        streak: streak.data?.streak_count ?? 0,
        longest_streak: streak.data?.longest_streak ?? 0,
        total_xp: streak.data?.total_xp ?? 0,
      }
    },
    enabled: !!userId,
  })

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not logged in')
      const { data, error } = await sb.from('profiles').update({
        display_name:       form.display_name || null,
        username:           form.username || null,
        target_jlpt:        form.target_jlpt,
        daily_goal_minutes: form.daily_goal_minutes,
        notifications_on:   form.notifications_on,
        timezone:           form.timezone,
        updated_at:         new Date().toISOString(),
      }).eq('id', userId).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      setProfile(data as any)
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Тохиргоо хадгалагдлаа ✓')
    },
    onError: (e: any) => toast.error(e.message ?? 'Алдаа гарлаа'),
  })

  const signOut = async () => {
    await sb.auth.signOut()
    useAuthStore.getState().clear()
    window.location.href = '/login'
  }

  const deleteAccount = async () => {
    const confirmed = prompt('Дансаа устгахыг баталгаажуулахын тулд "УСТГАХ" гэж бичнэ үү:')
    if (confirmed !== 'УСТГАХ') { toast.error('Баталгаажуулагдсангүй'); return }
    toast.error('Дансаа устгахын тулд тех. дэмжлэгтэй холбогдоно уу.')
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">⚙️ Тохиргоо</h1>
          <p className="text-muted-foreground text-sm mt-1">Хувийн мэдээлэл, судалгааны тохиргоо</p>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Нийт XP',    value: (stats?.total_xp ?? 0).toLocaleString() },
            { label: 'Карт',        value: stats?.total_cards ?? 0 },
            { label: 'Эзэмшсэн',   value: stats?.mastered ?? 0 },
            { label: 'Мөр (хоног)', value: stats?.streak ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-3 text-center">
              <div className="text-xl font-bold tabular-nums">{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Profile form */}
        <Section title="👤 Хувийн мэдээлэл" icon={<User className="w-4 h-4" />}>
          <div className="space-y-3">
            <Field label="Дэлгэрэнгүй нэр">
              <input value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))}
                placeholder="Нэр оруулна уу" className={inputCls} />
            </Field>
            <Field label="Хэрэглэгчийн нэр">
              <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="@username" className={inputCls} />
            </Field>
            <Field label="Имэйл">
              <input value={profile?.id ? '(нэвтэрсэн)' : ''} disabled className={cn(inputCls, 'opacity-50 cursor-not-allowed')} />
            </Field>
          </div>
        </Section>

        {/* Study settings */}
        <Section title="🎯 Судалгааны зорилго" icon={<Target className="w-4 h-4" />}>
          <div className="space-y-4">
            <Field label="Зорилтот JLPT түвшин">
              <div className="grid grid-cols-5 gap-2">
                {(['N5','N4','N3','N2','N1'] as JlptLevel[]).map(l => {
                  const clrs: Record<JlptLevel,string> = { N5:'bg-green-500', N4:'bg-blue-500', N3:'bg-yellow-500', N2:'bg-orange-500', N1:'bg-red-500' }
                  return (
                    <button key={l} onClick={() => setForm(p => ({ ...p, target_jlpt: l }))}
                      className={cn('py-2.5 rounded-xl border-2 text-sm font-bold transition-all',
                        form.target_jlpt === l ? `${clrs[l]} text-white border-transparent` : 'border-border hover:border-primary')}>
                      {l}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{LEVEL_DESCRIPTIONS[form.target_jlpt]}</p>
            </Field>
            <Field label="Өдрийн зорилго">
              <div className="grid grid-cols-5 gap-2">
                {DAILY_GOALS.map(g => (
                  <button key={g.value} onClick={() => setForm(p => ({ ...p, daily_goal_minutes: g.value }))}
                    className={cn('p-2 rounded-xl border text-center transition-all',
                      form.daily_goal_minutes === g.value ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}>
                    <div className="text-xs font-bold">{g.label}</div>
                    <div className="text-[9px] opacity-70 mt-0.5">{g.desc}</div>
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="🎨 Харагдах байдал" icon={<Monitor className="w-4 h-4" />}>
          <div className="space-y-3">
            <Field label="Гэрэл/харанхуй горим">
              <div className="flex gap-2">
                {[['light','☀️ Гэрэл'],['system','💻 Систем'],['dark','🌙 Харанхуй']].map(([v, label]) => (
                  <button key={v} onClick={() => setTheme(v)}
                    className={cn('flex-1 py-2 rounded-xl border text-sm font-medium transition-colors',
                      theme === v ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}>
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            <div className="space-y-2">
              {[
                { label: 'Фурикана харуулах', value: showFurigana, toggle: toggleFurigana, desc: 'Японы үгийн дээр унших заана' },
                { label: 'Ромажи харуулах',   value: showRomaji,   toggle: toggleRomaji,   desc: 'Латин үсгийн унших' },
                { label: 'Дуу автоматаар',    value: autoplayAudio, toggle: toggleAutoplay, desc: 'Үг харахад дуу тоглуулна' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                  <div>
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                  <button onClick={s.toggle}
                    className={cn('relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
                      s.value ? 'bg-primary' : 'bg-muted-foreground/30')}>
                    <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                      s.value ? 'translate-x-5' : 'translate-x-0')} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="🔔 Мэдэгдэл" icon={<Bell className="w-4 h-4" />}>
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
            <div>
              <div className="text-sm font-medium">Давтах мэдэгдэл</div>
              <div className="text-xs text-muted-foreground">Карт давтах үед мэдэгдэл илгээнэ</div>
            </div>
            <button onClick={() => setForm(p => ({ ...p, notifications_on: !p.notifications_on }))}
              className={cn('relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
                form.notifications_on ? 'bg-primary' : 'bg-muted-foreground/30')}>
              <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                form.notifications_on ? 'translate-x-5' : 'translate-x-0')} />
            </button>
          </div>
        </Section>

        {/* Save button */}
        <button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {saveProfile.isPending ? 'Хадгалж байна...' : 'Тохиргоо хадгалах'}
        </button>

        {/* Danger zone */}
        <Section title="⚠️ Аюулт бүс" icon={<Shield className="w-4 h-4" />}>
          <div className="space-y-2">
            <button onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-muted text-left transition-colors">
              <LogOut className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Гарах</div>
                <div className="text-xs text-muted-foreground">Системээс гарна</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
            <button onClick={deleteAccount}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition-colors">
              <Trash2 className="w-4 h-4 text-red-500" />
              <div>
                <div className="text-sm font-medium text-red-600">Данс устгах</div>
                <div className="text-xs text-red-400">Буцаах боломжгүй</div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 ml-auto" />
            </button>
          </div>
        </Section>

        <p className="text-center text-xs text-muted-foreground pb-4">
          JLPT Master Mongolia v0.1.0 · MIT License
        </p>
      </div>
    </AppShell>
  )
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        <div className="text-muted-foreground">{icon}</div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}
