// ============================================================
// JLPT Master — API / Data Access Layer
// All Supabase queries live here
// ============================================================
import { createClient } from '@/lib/supabase'
import { calculateNextReview } from '@/lib/srs'
import type {
  VocabFull, KanjiFull, GrammarFull, ExampleSentence,
  SrsCard, SrsRating, DashboardStats, SearchResult,
  JlptLevel, AdminReview, Mnemonic, Question,
} from '@/types'

// ─── Vocabulary ───────────────────────────────────────────────

export async function getVocabList(params: {
  level?: JlptLevel
  page?: number
  pageSize?: number
  search?: string
  onlyCommon?: boolean
}) {
  const sb = createClient()
  const { level, page = 0, pageSize = 20, search, onlyCommon } = params
  const from = page * pageSize
  const to   = from + pageSize - 1

  let q = sb
    .from('v_vocab_full')
    .select('*', { count: 'exact' })
    .range(from, to)

  if (level)      q = q.contains('jlpt_levels', [level])
  if (onlyCommon) q = q.eq('is_common', true)
  if (search) {
    q = q.or(
      `kanji_forms.cs.{"${search}"},kana_forms.cs.{"${search}"},meanings_en.cs.{"${search}"}`
    )
  }

  const { data, error, count } = await q
  if (error) throw error
  return { data: data as VocabFull[], total: count ?? 0 }
}

export async function getVocabById(id: number): Promise<VocabFull | null> {
  const sb = createClient()
  const { data, error } = await sb
    .from('v_vocab_full')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as VocabFull
}

export async function getVocabWithSenses(id: number) {
  const sb = createClient()
  const [vocabRes, sensesRes, sentencesRes] = await Promise.all([
    sb.from('vocabulary').select('*').eq('id', id).single(),
    sb.from('vocabulary_senses').select('*').eq('vocab_id', id).order('sense_order'),
    sb.from('vocab_sentence_map')
      .select('sentence_id, example_sentences(*)')
      .eq('vocab_id', id)
      .limit(5),
  ])
  return {
    vocab: vocabRes.data,
    senses: sensesRes.data ?? [],
    sentences: sentencesRes.data?.map((r: any) => r.example_sentences) ?? [],
  }
}

// ─── Kanji ───────────────────────────────────────────────────

export async function getKanjiList(params: {
  level?: JlptLevel
  page?: number
  pageSize?: number
  search?: string
}) {
  const sb = createClient()
  const { level, page = 0, pageSize = 50, search } = params
  const from = page * pageSize
  const to   = from + pageSize - 1

  let q = sb
    .from('v_kanji_full')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('frequency', { ascending: true, nullsFirst: false })

  if (level)  q = q.contains('jlpt_levels', [level])
  if (search) q = q.ilike('character', `%${search}%`)

  const { data, error, count } = await q
  if (error) throw error
  return { data: data as KanjiFull[], total: count ?? 0 }
}

export async function getKanjiByChar(char: string): Promise<KanjiFull | null> {
  const sb = createClient()
  const { data, error } = await sb
    .from('v_kanji_full')
    .select('*')
    .eq('character', char)
    .single()
  if (error) return null

  // Get stroke data
  const { data: stroke } = await sb
    .from('kanji_strokes')
    .select('*')
    .eq('kanji_id', (data as any).id)
    .single()

  // Get mnemonics
  const { data: mnemonics } = await sb
    .from('mnemonics')
    .select('*')
    .eq('item_type', 'kanji')
    .eq('item_id', (data as any).id)
    .eq('review_status', 'approved')
    .order('vote_count', { ascending: false })
    .limit(5)

  return { ...data, stroke_data: stroke, mnemonics: mnemonics ?? [] } as KanjiFull
}

// ─── Grammar ──────────────────────────────────────────────────

export async function getGrammarList(params: {
  level?: JlptLevel
  category?: string
  page?: number
  pageSize?: number
}) {
  const sb = createClient()
  const { level, category, page = 0, pageSize = 30 } = params

  let q = sb
    .from('grammar')
    .select('*', { count: 'exact' })
    .eq('review_status', 'approved')
    .range(page * pageSize, page * pageSize + pageSize - 1)
    .order('jlpt_level').order('category').order('form')

  if (level)    q = q.eq('jlpt_level', level)
  if (category) q = q.eq('category', category)

  const { data, error, count } = await q
  if (error) throw error
  return { data: data ?? [], total: count ?? 0 }
}

export async function getGrammarById(id: number): Promise<GrammarFull | null> {
  const sb = createClient()
  const [grammarRes, examplesRes, quizRes] = await Promise.all([
    sb.from('grammar').select('*').eq('id', id).single(),
    sb.from('grammar_examples').select('*').eq('grammar_id', id).order('id'),
    sb.from('questions').select('*, question_choices(*)').eq('item_id', id).eq('item_type', 'grammar'),
  ])
  if (grammarRes.error) return null
  return {
    ...grammarRes.data,
    examples: examplesRes.data ?? [],
    quiz_questions: quizRes.data ?? [],
  } as GrammarFull
}

// ─── Example Sentences ────────────────────────────────────────

export async function getSentences(params: {
  level?: JlptLevel
  vocabId?: number
  page?: number
  pageSize?: number
}): Promise<{ data: ExampleSentence[]; total: number }> {
  const sb = createClient()
  const { level, vocabId, page = 0, pageSize = 20 } = params

  if (vocabId) {
    const { data } = await sb
      .from('vocab_sentence_map')
      .select('sentence_id, example_sentences(*)')
      .eq('vocab_id', vocabId)
      .limit(pageSize)
    return {
      data: data?.map((r: any) => r.example_sentences).filter(Boolean) ?? [],
      total: data?.length ?? 0,
    }
  }

  let q = sb
    .from('example_sentences')
    .select('*', { count: 'exact' })
    .range(page * pageSize, page * pageSize + pageSize - 1)

  if (level) q = q.eq('difficulty', level)

  const { data, error, count } = await q
  if (error) throw error
  return { data: data ?? [], total: count ?? 0 }
}

// ─── Search ───────────────────────────────────────────────────

export async function globalSearch(query: string, limit = 20): Promise<SearchResult[]> {
  const sb = createClient()
  const results: SearchResult[] = []

  const [vocabRes, kanjiRes, grammarRes] = await Promise.all([
    sb.rpc('search_vocab_full', { q: query, lim: Math.ceil(limit * 0.5) }),
    sb.from('v_kanji_full')
      .select('id, character, meaning_mn, meaning_en, jlpt_levels')
      .or(`character.eq.${query}`)
      .limit(5),
    sb.from('grammar')
      .select('id, form, meaning_mn, jlpt_level')
      .ilike('form', `%${query}%`)
      .eq('review_status', 'approved')
      .limit(5),
  ])

  vocabRes.data?.forEach((row: any) => {
    results.push({
      type: 'vocab',
      id: row.id,
      primary: row.kanji ?? row.reading ?? '',
      secondary: row.reading ?? '',
      meaning: row.meaning_mn ?? row.meaning_en ?? '',
      jlpt: row.jlpt ?? null,
    })
  })

  kanjiRes.data?.forEach((row: any) => {
    results.push({
      type: 'kanji',
      id: row.id,
      primary: row.character,
      secondary: '',
      meaning: row.meaning_mn ?? (row.meaning_en?.[0] ?? ''),
      jlpt: row.jlpt_levels?.[0] ?? null,
    })
  })

  grammarRes.data?.forEach((row: any) => {
    results.push({
      type: 'grammar',
      id: row.id,
      primary: row.form,
      secondary: row.jlpt_level,
      meaning: row.meaning_mn ?? '',
      jlpt: row.jlpt_level,
    })
  })

  return results.slice(0, limit)
}

// ─── SRS ──────────────────────────────────────────────────────

export async function getDueCards(userId: string, limit = 20): Promise<SrsCard[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('srs_cards')
    .select('*')
    .eq('user_id', userId)
    .lte('due_at', new Date().toISOString())
    .neq('card_state', 'burned')
    .order('due_at')
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getDueCount(userId: string): Promise<number> {
  const sb = createClient()
  const { count } = await sb
    .from('srs_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('due_at', new Date().toISOString())
    .neq('card_state', 'burned')
  return count ?? 0
}

export async function submitReview(params: {
  userId: string
  cardId: number
  card: SrsCard
  rating: SrsRating
  timeTakenMs: number
}): Promise<void> {
  const sb = createClient()
  const { userId, cardId, card, rating, timeTakenMs } = params

  const result = calculateNextReview(
    rating,
    card.card_state,
    card.interval_days,
    card.ease_factor,
    card.lapses
  )

  await Promise.all([
    sb.from('srs_cards').update({
      card_state:    result.new_state,
      ease_factor:   result.new_ease_factor,
      interval_days: result.new_interval,
      due_at:        result.next_due.toISOString(),
      reps:          card.reps + 1,
      lapses:        rating === 1 ? card.lapses + 1 : card.lapses,
      last_reviewed: new Date().toISOString(),
    }).eq('id', cardId),

    sb.from('review_logs').insert({
      card_id:      cardId,
      user_id:      userId,
      rating,
      time_taken_ms: timeTakenMs,
      prev_interval: card.interval_days,
      new_interval:  result.new_interval,
      prev_ease:     card.ease_factor,
      new_ease:      result.new_ease_factor,
    }),
  ])

  // Award XP
  const xp = rating >= 3 ? 5 : 1
  await sb.from('xp_logs').insert({
    user_id:   userId,
    amount:    xp,
    source:    'srs_review',
    item_type: card.item_type,
    item_id:   card.item_id,
  })
}

export async function addToSrs(params: {
  userId: string
  itemType: 'vocab' | 'kanji' | 'grammar'
  itemId: number
}): Promise<void> {
  const sb = createClient()
  await sb.from('srs_cards').upsert({
    user_id:    params.userId,
    item_type:  params.itemType,
    item_id:    params.itemId,
    card_state: 'new',
    ease_factor: 2.5,
    interval_days: 0,
    due_at: new Date().toISOString(),
  }, { onConflict: 'user_id,item_type,item_id' })
}

// ─── Quiz ─────────────────────────────────────────────────────

export async function generateQuiz(params: {
  level: JlptLevel
  type: 'vocabulary' | 'kanji' | 'grammar' | 'mixed'
  count?: number
}): Promise<Question[]> {
  const sb = createClient()
  const { level, type, count = 10 } = params

  const { data, error } = await sb
    .from('questions')
    .select('id, quiz_id, question_type, jlpt_level, item_type, item_id, stem, explanation_mn, difficulty, created_at, choices:question_choice_options(*)')
    .eq('jlpt_level', level)
    .in('question_type', type === 'mixed' ? ['vocabulary', 'kanji', 'grammar'] : [type])
    .limit(count * 3)  // over-fetch, then shuffle

  if (error) throw error
  const shuffled = [...(data ?? [])]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled.slice(0, count) as Question[]
}

export async function submitQuizAttempt(params: {
  userId: string
  questions: Question[]
  answers: Map<number, number>  // questionId → choiceId
  timeTakenSec: number
}): Promise<{ score: number; correct: number; total: number; answers: import('@/types').GradedQuizAnswer[] }> {
  const sb = createClient()
  const { userId, questions, answers, timeTakenSec } = params
  if (!userId || questions.length < 1) throw new Error('Quiz session is missing')
  const payload = questions.flatMap((question) => {
    const choiceId = answers.get(question.id)
    return choiceId === undefined ? [] : [{ question_id: question.id, choice_id: choiceId }]
  })
  if (!payload.length) throw new Error('No answers to submit')
  const { data, error } = await sb.rpc('submit_quiz_attempt', {
    p_answers: payload,
    p_time_taken_sec: Math.max(0, Math.min(Math.trunc(timeTakenSec), 86400)),
  })
  if (error) throw error
  const result = data as { score: number; correct: number; total: number; answers: import('@/types').GradedQuizAnswer[] }
  return result
}

// ─── Dashboard ────────────────────────────────────────────────

export async function getDashboardStats(userId: string): Promise<DashboardStats | null> {
  const sb = createClient()
  const today = new Date().toISOString().slice(0, 10)
  const todayStart = `${today}T00:00:00Z`

  const [profileRes, todayLogsRes, dueCountRes, masteredVocabRes, masteredKanjiRes] =
    await Promise.all([
      sb.from('profiles').select('*').eq('id', userId).single(),
      sb.from('review_logs')
        .select('rating, time_taken_ms')
        .eq('user_id', userId)
        .gte('reviewed_at', todayStart),
      getDueCount(userId),
      sb.from('srs_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('item_type', 'vocab')
        .in('card_state', ['mastered', 'burned']),
      sb.from('srs_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('item_type', 'kanji')
        .in('card_state', ['mastered', 'burned']),
    ])

  if (!profileRes.data) return null
  const profile = profileRes.data
  const todayLogs = todayLogsRes.data ?? []

  const correct = todayLogs.filter((l: any) => l.rating >= 3).length
  const totalMs  = todayLogs.reduce((s: number, l: any) => s + (l.time_taken_ms ?? 0), 0)

  // Weak areas: cards with most lapses
  const { data: weakCards } = await sb
    .from('srs_cards')
    .select('item_type, item_id, lapses')
    .eq('user_id', userId)
    .gt('lapses', 2)
    .order('lapses', { ascending: false })
    .limit(5)

  return {
    user: profile,
    today: {
      study_minutes: Math.round(totalMs / 60000),
      cards_reviewed: todayLogs.length,
      new_words: todayLogs.filter((l: any) => l.rating === 3).length,
      accuracy: todayLogs.length > 0 ? Math.round(correct / todayLogs.length * 100) : 0,
      xp_earned: correct * 5,
    },
    streak: profile.streak_count,
    due_count: dueCountRes,
    retention_rate: todayLogs.length > 0 ? Math.round(correct / todayLogs.length * 100) : 0,
    vocab_mastered: masteredVocabRes.count ?? 0,
    kanji_mastered: masteredKanjiRes.count ?? 0,
    weak_areas: (weakCards ?? []).map((c: any) => ({
      item_type: c.item_type,
      item_id: c.item_id,
      display: `${c.item_type} #${c.item_id}`,
      lapse_count: c.lapses,
      accuracy: 0,
    })),
    predicted_level: profile.target_jlpt,
    leaderboard_rank: null,
  }
}

// ─── Bookmarks ────────────────────────────────────────────────

export async function toggleBookmark(params: {
  userId: string
  itemType: 'vocab' | 'kanji' | 'grammar' | 'sentence'
  itemId: number
}): Promise<boolean> {
  const sb = createClient()
  const { userId, itemType, itemId } = params

  const { data } = await sb.from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .single()

  if (data) {
    await sb.from('bookmarks').delete().eq('id', data.id)
    return false
  } else {
    await sb.from('bookmarks').insert({ user_id: userId, item_type: itemType, item_id: itemId })
    return true
  }
}

export async function getBookmarks(userId: string, itemType?: string) {
  const sb = createClient()
  let q = sb.from('bookmarks').select('*').eq('user_id', userId)
  if (itemType) q = q.eq('item_type', itemType)
  const { data } = await q.order('created_at', { ascending: false })
  return data ?? []
}

// ─── Mnemonics ────────────────────────────────────────────────

export async function getMnemonics(itemType: string, itemId: number): Promise<Mnemonic[]> {
  const sb = createClient()
  const { data } = await sb
    .from('mnemonics')
    .select('*')
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .eq('review_status', 'approved')
    .order('vote_count', { ascending: false })
    .limit(10)
  return data ?? []
}

export async function voteMnemonic(mnemonicId: number, userId: string, isUpvote: boolean) {
  const sb = createClient()
  await sb.from('mnemonic_votes').upsert(
    { mnemonic_id: mnemonicId, user_id: userId, is_upvote: isUpvote },
    { onConflict: 'mnemonic_id,user_id' }
  )
}

// ─── Admin ────────────────────────────────────────────────────

export async function getAdminQueue(params: {
  itemType?: string
  status?: string
  limit?: number
}): Promise<AdminReview[]> {
  const sb = createClient()
  const { itemType, status = 'pending', limit = 50 } = params

  let q = sb.from('admin_reviews').select('*').eq('status', status)
    .order('priority').order('created_at').limit(limit)

  if (itemType) q = q.eq('item_type', itemType)

  const { data } = await q
  return data ?? []
}

export async function approveReview(reviewId: number, note?: string): Promise<void> {
  const sb = createClient()
  const { data: review } = await sb
    .from('admin_reviews')
    .select('*')
    .eq('id', reviewId)
    .single()

  if (!review) return

  await sb.from('admin_reviews').update({
    status: 'approved',
    reviewer_note: note,
    updated_at: new Date().toISOString(),
  }).eq('id', reviewId)

  // Update the actual content
  if (review.item_type === 'vocab_sense') {
    await sb.from('vocabulary_senses').update({ gloss_mn_status: 'approved' })
      .eq('id', review.item_id)
  } else if (review.item_type === 'kanji') {
    await sb.from('kanji').update({ meaning_mn_status: 'approved' })
      .eq('id', review.item_id)
  } else if (review.item_type === 'grammar') {
    await sb.from('grammar').update({ review_status: 'approved' })
      .eq('id', review.item_id)
  } else if (review.item_type === 'mnemonic') {
    await sb.from('mnemonics').update({ review_status: 'approved' })
      .eq('id', review.item_id)
  }
}

// ─── Streak & XP ──────────────────────────────────────────────

export async function updateStreak(userId: string): Promise<void> {
  const sb = createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: profile } = await sb.from('profiles').select('last_study_date, streak_count, longest_streak')
    .eq('id', userId).single()

  if (!profile) return

  const lastDate = profile.last_study_date
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let newStreak = profile.streak_count
  if (lastDate === today) return  // already counted today
  if (lastDate === yesterday) {
    newStreak = profile.streak_count + 1
  } else if (lastDate !== today) {
    newStreak = 1  // streak broken
  }

  await sb.from('profiles').update({
    streak_count:    newStreak,
    longest_streak:  Math.max(newStreak, profile.longest_streak),
    last_study_date: today,
  }).eq('id', userId)
}

export async function checkAchievements(userId: string): Promise<string[]> {
  const sb = createClient()
  const earned: string[] = []

  const [profileRes, reviewCountRes, vocabMasteredRes] = await Promise.all([
    sb.from('profiles').select('streak_count, total_xp').eq('id', userId).single(),
    sb.from('review_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    sb.from('srs_cards').select('*', { count: 'exact', head: true })
      .eq('user_id', userId).eq('item_type', 'vocab').in('card_state', ['mastered', 'burned']),
  ])

  const profile = profileRes.data
  if (!profile) return []

  const checks = [
    { code: 'first_review',   condition: (reviewCountRes.count ?? 0) >= 1 },
    { code: 'streak_7',       condition: profile.streak_count >= 7 },
    { code: 'streak_30',      condition: profile.streak_count >= 30 },
    { code: 'streak_100',     condition: profile.streak_count >= 100 },
    { code: 'vocab_100',      condition: (vocabMasteredRes.count ?? 0) >= 100 },
    { code: 'vocab_500',      condition: (vocabMasteredRes.count ?? 0) >= 500 },
    { code: 'vocab_1000',     condition: (vocabMasteredRes.count ?? 0) >= 1000 },
  ]

  for (const check of checks) {
    if (!check.condition) continue
    const { data: ach } = await sb.from('achievements').select('id').eq('code', check.code).single()
    if (!ach) continue
    const { error } = await sb.from('user_achievements')
      .insert({ user_id: userId, achievement_id: ach.id })
    if (!error) earned.push(check.code)
  }

  return earned
}

export async function getKanjiById(id: number) {
  const sb = createClient()
  const { data: k } = await sb.from('kanji').select('*').eq('id', id).single()
  if (!k) return null
  const { data: readings } = await sb.from('kanji_readings').select('reading, r_type').eq('kanji_id', id)
  return { ...k, readings: readings ?? [] }
}

export async function getGrammarByIdFull(id: number) {
  const sb = createClient()
  const { data } = await sb.from('grammar').select('*').eq('id', id).single()
  return data
}
