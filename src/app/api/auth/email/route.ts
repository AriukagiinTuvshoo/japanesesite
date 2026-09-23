import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || request.headers.get('host')
  if (!origin || !host) return false
  try { return new URL(origin).host === host } catch { return false }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Хүсэлтийг шалгаж чадсангүй.' }, { status: 403 })
  const declaredSize = Number(request.headers.get('content-length') || 0)
  if (declaredSize > 8_192) return NextResponse.json({ error: 'Хүсэлтийн хэмжээ хэтэрлээ.' }, { status: 413 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ error: 'Нэвтрэлт тохируулагдаагүй байна.' }, { status: 503 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Хүсэлтийн формат буруу байна.' }, { status: 400 }) }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Хүсэлтийн формат буруу байна.' }, { status: 400 })
  const { email, password, mode } = body as Record<string, unknown>
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'И-мэйл хаягаа шалгана уу.' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < (mode === 'register' ? 8 : 1) || password.length > 128) {
    return NextResponse.json({ error: 'Нууц үг 8-аас доошгүй, 128-аас ихгүй тэмдэгттэй байна.' }, { status: 400 })
  }
  if (mode !== 'login' && mode !== 'register') return NextResponse.json({ error: 'Үйлдлийн төрөл буруу байна.' }, { status: 400 })

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!redisUrl || !redisToken) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Нэвтрэлтийн хамгаалалт түр тохируулагдаагүй байна.' }, { status: 503 })
    }
  } else {
    const limiter = new Ratelimit({
      redis: new Redis({ url: redisUrl, token: redisToken }),
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      prefix: 'jlpt:auth-email',
    })
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { success, reset } = await limiter.limit(ip)
    if (!success) return NextResponse.json({ error: 'Олон удаа оролдлоо. Түр хүлээгээд дахин оролдоно уу.' }, { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))) } })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? request.nextUrl.origin : '')
  if (!appUrl) return NextResponse.json({ error: 'Аппын HTTPS хаяг тохируулагдаагүй байна.' }, { status: 503 })

  const supabase = await createServerSupabase()
  if (mode === 'login') {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) return NextResponse.json({ error: 'И-мэйл эсвэл нууц үг буруу байна.' }, { status: 401 })
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { emailRedirectTo: new URL('/auth/callback', appUrl).toString() },
  })
  if (error) return NextResponse.json({ error: 'Бүртгэл үүсгэж чадсангүй. Оролтоо шалгаад дахин оролдоно уу.' }, { status: 400 })
  return NextResponse.json({ ok: true, message: 'Бүртгэлийн холбоос боломжтой бол имэйлээр илгээгдлээ.' })
}
