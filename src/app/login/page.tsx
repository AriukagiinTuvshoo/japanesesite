'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter }    from 'next/navigation'
import { motion }       from 'framer-motion'
import toast            from 'react-hot-toast'
import { Mail, Lock, Chrome, Eye, EyeOff, BookOpen } from 'lucide-react'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const [mode,    setMode]    = useState<Mode>('login')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) toast.error('Google нэвтрэлт амжилтгүй')
    setLoading(false)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, mode }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Нэвтрэлт амжилтгүй.')
      setPass('')
      if (mode === 'login') router.replace('/dashboard')
      else { toast.success(result.message); setMode('login') }
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-white">JLPT Master Mongolia</h1>
          <p className="text-slate-400 text-sm mt-1">Монголын хамгийн дэлгэрэнгүй JLPT платформ</p>
        </div>

        <div className="bg-card rounded-2xl border shadow-xl overflow-hidden">
          {/* Tab switcher */}
          <div className="grid grid-cols-2 border-b">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-3.5 text-sm font-semibold transition-colors ${
                  mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border font-medium text-sm hover:bg-muted transition-colors disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google-ээр {mode === 'login' ? 'нэвтрэх' : 'бүртгүүлэх'}
            </button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              <span>эсвэл имэйлээр</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="И-мэйл хаяг"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Нууц үг"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-60"
              >
                {loading ? 'Уншиж байна...' : mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
              </button>
            </form>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-slate-400">
          {[
            { icon: '📚', text: '191,000+ үг' },
            { icon: '漢', text: '13,000+ кanji' },
            { icon: '🤖', text: 'AI тайлбар' },
          ].map((item) => (
            <div key={item.text} className="flex flex-col items-center gap-1">
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
