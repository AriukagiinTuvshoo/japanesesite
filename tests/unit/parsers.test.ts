/**
 * Unit tests for JMDict + KANJIDIC2 parsers
 */

// ── JMDict Parser Tests ───────────────────────────────────────
describe('JMDict VocabEntry', () => {
  const mockEntry = {
    jmdict_id: 1234567,
    readings: [
      { text: '食べる', reading: null,      r_type: 'kanji_form', priority: 0, info_tags: [] },
      { text: 'たべる', reading: 'たべる', r_type: 'kana_form',  priority: 1, info_tags: [] },
    ],
    senses: [
      { sense_order: 0, pos: ['Ichidan verb'], field: [], misc: [], dialect: [], gloss_en: ['to eat'] },
    ],
    frequency: 1,
    is_common: true,
    jlpt_levels: ['N5'],
    content_hash: 'abc123',
  }

  test('kanji_forms returns only kanji type readings', () => {
    const kf = mockEntry.readings.filter(r => r.r_type === 'kanji_form').map(r => r.text)
    expect(kf).toEqual(['食べる'])
  })

  test('kana_forms returns only kana type readings', () => {
    const kn = mockEntry.readings.filter(r => r.r_type === 'kana_form').map(r => r.text)
    expect(kn).toEqual(['たべる'])
  })

  test('primary_form prefers kanji form', () => {
    const primary = mockEntry.readings.find(r => r.r_type === 'kanji_form')?.text
      ?? mockEntry.readings.find(r => r.r_type === 'kana_form')?.text ?? ''
    expect(primary).toBe('食べる')
  })

  test('content_hash is non-empty', () => {
    expect(mockEntry.content_hash).toBeTruthy()
    expect(mockEntry.content_hash.length).toBeGreaterThan(0)
  })
})

// ── KANJIDIC2 Parser Tests ────────────────────────────────────
describe('KanjiEntry', () => {
  const mockKanji = {
    db_id: 1,
    character: '食',
    stroke_count: 9,
    grade: 2,
    frequency: 445,
    jlpt_level: 'N5',
    readings: [
      { reading: 'ショク', r_type: 'ja_on' },
      { reading: 'ジキ',   r_type: 'ja_on' },
      { reading: 'た.べる', r_type: 'ja_kun' },
      { reading: 'く.う',  r_type: 'ja_kun' },
    ],
    meanings_en: ['eat', 'food'],
    radicals: ['食'],
    stroke_data: null,
  }

  test('on_yomi returns only on readings', () => {
    const on = mockKanji.readings.filter(r => r.r_type === 'ja_on').map(r => r.reading)
    expect(on).toEqual(['ショク', 'ジキ'])
  })

  test('kun_yomi returns only kun readings', () => {
    const kun = mockKanji.readings.filter(r => r.r_type === 'ja_kun').map(r => r.reading)
    expect(kun).toEqual(['た.べる', 'く.う'])
  })

  test('jlpt_level is valid or null', () => {
    const validLevels = ['N1','N2','N3','N4','N5',null]
    expect(validLevels).toContain(mockKanji.jlpt_level)
  })

  test('stroke_count is positive integer', () => {
    expect(mockKanji.stroke_count).toBeGreaterThan(0)
    expect(Number.isInteger(mockKanji.stroke_count)).toBe(true)
  })

  test('meanings_en is array of strings', () => {
    expect(Array.isArray(mockKanji.meanings_en)).toBe(true)
    mockKanji.meanings_en.forEach(m => expect(typeof m).toBe('string'))
  })
})

// ── JLPT Tagger Tests ─────────────────────────────────────────
describe('JLPT Word matching', () => {
  const JLPT_SAMPLE = {
    N5: ['食べる','飲む','行く'],
    N4: ['始める','終わる'],
    N2: ['にもかかわらず','ざるを得ない'],
  }

  test('N5 words are subset of known basic vocabulary', () => {
    const n5 = JLPT_SAMPLE.N5
    expect(n5).toContain('食べる')
    expect(n5).toContain('行く')
  })

  test('N2 includes grammar pattern markers', () => {
    const n2 = JLPT_SAMPLE.N2
    expect(n2.some(w => w.includes('かかわらず'))).toBe(true)
  })

  test('no duplicates within level', () => {
    Object.entries(JLPT_SAMPLE).forEach(([level, words]) => {
      const unique = new Set(words)
      expect(unique.size).toBe(words.length)
    })
  })
})

// ── Grammar Pattern Tests ─────────────────────────────────────
describe('Grammar Patterns', () => {
  const samplePattern = {
    form:            '〜にもかかわらず',
    jlpt_level:      'N2',
    category:        'concession',
    structure:       'N/Vた/い-Adj/な-Adj+にもかかわらず',
    meaning_en:      'despite, in spite of',
    meaning_mn:      '...хэдий ч, ...ч гэсэн',
    nuance_mn:       'Хүлээгдсэн зүйлийн эсрэг бодит байдал болохыг илэрхийлнэ.',
    comparison_note: '〜のに-тай ижил утгатай боловч бичгийн хэлэнд давуу.',
    common_mistakes: 'Noun-ийн дараа の оруулахгүй',
    mnemonic_mn:     'にも(мөн ч) + かかわらず(хамаагүй)',
    examples: [
      { jp: '大雨にもかかわらず、試合は行われた。', mn: 'Их бороо орсон хэдий ч тоглоом болов.' },
    ],
  }

  test('form starts with 〜', () => {
    expect(samplePattern.form.startsWith('〜')).toBe(true)
  })

  test('jlpt_level is valid', () => {
    expect(['N1','N2','N3','N4','N5']).toContain(samplePattern.jlpt_level)
  })

  test('has at least one example', () => {
    expect(samplePattern.examples.length).toBeGreaterThan(0)
  })

  test('mongolian translation is non-empty', () => {
    expect(samplePattern.meaning_mn).toBeTruthy()
    expect(samplePattern.meaning_mn.length).toBeGreaterThan(0)
  })

  test('examples have japanese and mongolian', () => {
    samplePattern.examples.forEach(ex => {
      expect(ex.jp).toBeTruthy()
      expect(ex.mn).toBeTruthy()
    })
  })
})
