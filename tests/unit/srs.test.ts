/**
 * Unit tests for SRS algorithm
 */
import { calculateNextReview, getStateLabel, getIntervalDisplay } from '@/lib/srs'

describe('SRS Algorithm - calculateNextReview', () => {
  const baseCard = {
    state: 'new' as const,
    interval: 0,
    ease: 2.5,
  }

  test('Again (1) resets to learning with 10-minute interval', () => {
    const result = calculateNextReview(1, 'new', 0, 2.5, 0)
    expect(result.new_state).toBe('learning')
    expect(result.new_interval).toBeCloseTo(10/1440, 1)  // stored as rounded to 1 decimal
    expect(result.new_ease_factor).toBe(2.3)
  })

  test('Good (3) from new → learning state', () => {
    const result = calculateNextReview(3, 'new', 0, 2.5, 0)
    expect(result.new_state).toBe('learning')
    expect(result.new_interval).toBeGreaterThan(0)
  })

  test('Easy (4) from new → review state', () => {
    const result = calculateNextReview(4, 'new', 0, 2.5, 0)
    expect(result.new_state).toBe('review')
    expect(result.new_interval).toBe(4)
  })

  test('Ease factor increases on Easy', () => {
    const result = calculateNextReview(4, 'review', 7, 2.5, 0)
    expect(result.new_ease_factor).toBeGreaterThan(2.5)
  })

  test('Ease factor decreases on Hard', () => {
    const result = calculateNextReview(2, 'review', 7, 2.5, 0)
    expect(result.new_ease_factor).toBeLessThan(2.5)
  })

  test('Ease factor never goes below 1.3', () => {
    let ease = 2.5
    for (let i = 0; i < 20; i++) {
      const r = calculateNextReview(1, 'review', 1, ease, i)
      ease = r.new_ease_factor
    }
    expect(ease).toBeGreaterThanOrEqual(1.3)
  })

  test('Mastered + Easy → burned state', () => {
    const result = calculateNextReview(4, 'mastered', 180, 2.5, 0)
    expect(result.new_state).toBe('burned')
  })

  test('next_due is in the future', () => {
    const result = calculateNextReview(3, 'review', 7, 2.5, 0)
    expect(result.next_due.getTime()).toBeGreaterThan(Date.now())
  })
})

describe('SRS Helpers', () => {
  test('getStateLabel returns Mongolian labels', () => {
    expect(getStateLabel('new')).toBe('Шинэ')
    expect(getStateLabel('learning')).toBe('Суралцаж байна')
    expect(getStateLabel('mastered')).toBe('Эзэмшсэн')
    expect(getStateLabel('burned')).toBe('Шатсан 🔥')
  })

  test('getIntervalDisplay formats intervals', () => {
    expect(getIntervalDisplay(10/1440)).toBe('10мин')
    expect(getIntervalDisplay(1)).toBe('1өд')
    expect(getIntervalDisplay(30)).toBe('1сар')
    expect(getIntervalDisplay(365)).toBe('1жил')
  })
})
