// ============================================================
// SRS Algorithm — SM-2 variant (Anki-style)
// ============================================================
import type { CardState, SrsRating, SrsResult } from '@/types'

const INTERVALS: Record<CardState, number[]> = {
  new:      [0, 0, 0, 0],
  learning: [10/1440, 1, 1, 3],          // 10min, 1d, 1d, 3d
  review:   [1, 3, 7, 14],
  mastered: [14, 30, 90, 180],
  burned:   [365, 365, 365, 365],
}

const MIN_EASE = 1.3
const EASE_BONUS = 0.15
const EASE_HARD  = -0.15
const EASE_MISS  = -0.2

export function calculateNextReview(
  rating: SrsRating,
  currentState: CardState,
  currentInterval: number,
  currentEase: number,
  lapses: number
): SrsResult {
  let newEase = currentEase
  let newInterval: number
  let newState: CardState

  switch (rating) {
    case 1: // Again
      newEase = Math.max(MIN_EASE, currentEase + EASE_MISS)
      newState = 'learning'
      newInterval = 10 / 1440   // 10 minutes
      break

    case 2: // Hard
      newEase = Math.max(MIN_EASE, currentEase + EASE_HARD)
      newState = currentState === 'new' ? 'learning' : currentState
      newInterval = currentInterval * 1.2
      break

    case 3: // Good
      newState = getNextState(currentState)
      newInterval = currentState === 'new' || currentState === 'learning'
        ? INTERVALS[newState][2]
        : Math.round(currentInterval * newEase)
      break

    case 4: // Easy
      newEase = currentEase + EASE_BONUS
      newState = currentState === 'new' ? 'review' : getNextState(currentState)
      newInterval = currentState === 'new'
        ? 4
        : Math.round(currentInterval * newEase * 1.3)
      break
  }

  // Burned items stay burned
  if (currentState === 'burned' && rating > 1) {
    newState = 'burned'
    newInterval = 365
  }

  // Cap interval at 365 days before burning
  if (newInterval >= 180 && newState === 'mastered' && rating === 4) {
    newState = 'burned'
    newInterval = 365
  }

  const nextDue = new Date()
  if (newInterval < 1) {
    nextDue.setMinutes(nextDue.getMinutes() + Math.round(newInterval * 1440))
  } else {
    nextDue.setDate(nextDue.getDate() + Math.round(newInterval))
  }

  return {
    new_interval: Math.round(newInterval * 10) / 10,
    new_ease_factor: Math.round(newEase * 100) / 100,
    new_state: newState,
    next_due: nextDue,
  }
}

function getNextState(state: CardState): CardState {
  const progression: Record<CardState, CardState> = {
    new:      'learning',
    learning: 'review',
    review:   'mastered',
    mastered: 'burned',
    burned:   'burned',
  }
  return progression[state]
}

export function getStateLabel(state: CardState): string {
  const labels: Record<CardState, string> = {
    new:      'Шинэ',
    learning: 'Суралцаж байна',
    review:   'Давтаж байна',
    mastered: 'Эзэмшсэн',
    burned:   'Шатсан 🔥',
  }
  return labels[state]
}

export function getRatingLabel(rating: SrsRating): string {
  const labels: Record<SrsRating, string> = {
    1: 'Дахин',
    2: 'Хэцүү',
    3: 'Мэдсэн',
    4: 'Амархан',
  }
  return labels[rating]
}

export function getIntervalDisplay(intervalDays: number): string {
  if (intervalDays < 1) {
    const mins = Math.round(intervalDays * 1440)
    return `${mins}мин`
  }
  if (intervalDays < 30)  return `${Math.round(intervalDays)}өд`
  if (intervalDays < 365) return `${Math.round(intervalDays/30)}сар`
  return `${Math.round(intervalDays/365)}жил`
}
