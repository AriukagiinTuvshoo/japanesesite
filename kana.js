/* Kana Studio: hiragana + katakana reference, speech, local mastery and quick practice. */
(function () {
  'use strict';

  const ROWS = {
    hiragana: [
      [['あ','a'],['い','i'],['う','u'],['え','e'],['お','o']],
      [['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko']],
      [['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so']],
      [['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to']],
      [['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no']],
      [['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho']],
      [['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo']],
      [['や','ya'],['ゆ','yu'],['よ','yo']],
      [['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro']],
      [['わ','wa'],['を','wo'],['ん','n']]
    ],
    katakana: [
      [['ア','a'],['イ','i'],['ウ','u'],['エ','e'],['オ','o']],
      [['カ','ka'],['キ','ki'],['ク','ku'],['ケ','ke'],['コ','ko']],
      [['サ','sa'],['シ','shi'],['ス','su'],['セ','se'],['ソ','so']],
      [['タ','ta'],['チ','chi'],['ツ','tsu'],['テ','te'],['ト','to']],
      [['ナ','na'],['ニ','ni'],['ヌ','nu'],['ネ','ne'],['ノ','no']],
      [['ハ','ha'],['ヒ','hi'],['フ','fu'],['ヘ','he'],['ホ','ho']],
      [['マ','ma'],['ミ','mi'],['ム','mu'],['メ','me'],['モ','mo']],
      [['ヤ','ya'],['ユ','yu'],['ヨ','yo']],
      [['ラ','ra'],['リ','ri'],['ル','ru'],['レ','re'],['ロ','ro']],
      [['ワ','wa'],['ヲ','wo'],['ン','n']]
    ]
  };
  const VOICED = {
    hiragana: [
      [['が','ga'],['ぎ','gi'],['ぐ','gu'],['げ','ge'],['ご','go']],
      [['ざ','za'],['じ','ji'],['ず','zu'],['ぜ','ze'],['ぞ','zo']],
      [['だ','da'],['ぢ','ji'],['づ','zu'],['で','de'],['ど','do']],
      [['ば','ba'],['び','bi'],['ぶ','bu'],['べ','be'],['ぼ','bo']],
      [['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po']]
    ],
    katakana: [
      [['ガ','ga'],['ギ','gi'],['グ','gu'],['ゲ','ge'],['ゴ','go']],
      [['ザ','za'],['ジ','ji'],['ズ','zu'],['ゼ','ze'],['ゾ','zo']],
      [['ダ','da'],['ヂ','ji'],['ヅ','zu'],['デ','de'],['ド','do']],
      [['バ','ba'],['ビ','bi'],['ブ','bu'],['ベ','be'],['ボ','bo']],
      [['パ','pa'],['ピ','pi'],['プ','pu'],['ペ','pe'],['ポ','po']]
    ]
  };
  const COMBINATIONS = {
    hiragana: [
      [['きゃ','kya'],['きゅ','kyu'],['きょ','kyo']],
      [['しゃ','sha'],['しゅ','shu'],['しょ','sho']],
      [['ちゃ','cha'],['ちゅ','chu'],['ちょ','cho']],
      [['にゃ','nya'],['にゅ','nyu'],['にょ','nyo']],
      [['ひゃ','hya'],['ひゅ','hyu'],['ひょ','hyo']],
      [['みゃ','mya'],['みゅ','myu'],['みょ','myo']],
      [['りゃ','rya'],['りゅ','ryu'],['りょ','ryo']],
      [['ぎゃ','gya'],['ぎゅ','gyu'],['ぎょ','gyo']],
      [['じゃ','ja'],['じゅ','ju'],['じょ','jo']],
      [['びゃ','bya'],['びゅ','byu'],['びょ','byo']],
      [['ぴゃ','pya'],['ぴゅ','pyu'],['ぴょ','pyo']]
    ],
    katakana: [
      [['キャ','kya'],['キュ','kyu'],['キョ','kyo']],
      [['シャ','sha'],['シュ','shu'],['ショ','sho']],
      [['チャ','cha'],['チュ','chu'],['チョ','cho']],
      [['ニャ','nya'],['ニュ','nyu'],['ニョ','nyo']],
      [['ヒャ','hya'],['ヒュ','hyu'],['ヒョ','hyo']],
      [['ミャ','mya'],['ミュ','myu'],['ミョ','myo']],
      [['リャ','rya'],['リュ','ryu'],['リョ','ryo']],
      [['ギャ','gya'],['ギュ','gyu'],['ギョ','gyo']],
      [['ジャ','ja'],['ジュ','ju'],['ジョ','jo']],
      [['ビャ','bya'],['ビュ','byu'],['ビョ','byo']],
      [['ピャ','pya'],['ピュ','pyu'],['ピョ','pyo']]
    ]
  };

  const TEXT = {
    mn: {
      eyebrow:'ЯПОН БИЧИГ · СУУРЬ ХИЧЭЭЛ', title:'Канагаа итгэлтэй уншъя',
      intro:'Хирагана, катаканаг сонсож, ромажигаар нь тогтоогоод өөрийгөө шалгаарай.',
      hira:'Хирагана', kata:'Катакана', basic:'Үндсэн 46', voiced:'Дууны тэмдэгтэй', combos:'Хосолсон авиа',
      known:'Мэддэг', total:'үсэг', practice:'5 асуултаар шалгах',
      all:'Бүгд', review:'Давтах', search:'Үсэг эсвэл ромажи хайх',
      choose:'Үсэг сонго', chooseHint:'Карт дээр дарж дуудлага болон бичлэгийг нь үзээрэй.',
      listen:'Дуудлагыг сонсох', markKnown:'Мэддэг гэж тэмдэглэх', markReview:'Давталтад үлдээх',
      pair:'Нөгөө бичлэг', progress:'Таны ахиц', quizTitle:'Хирагана уу, катакана уу?',
      question:'Энэ тэмдэгтийн ромажи аль вэ?', next:'Дараагийнх', finish:'Дүн харах',
      correct:'Зөв — сайн байна!', incorrect:'Дахин нэг хараарай.', score:'Таны оноо', retry:'Дахин тестлэх',
      noSpeech:'Энэ төхөөрөмжид япон дуу хоолой байхгүй байна.', speakerNote:'Дуу хоолой нь таны төхөөрөмжийн тохиргооноос хамаарна.',
      noKnown:'Одоогоор энд тэмдэглэсэн үсэг алга.', knownHint:'Мэддэг үсгийг ногоон тэмдэглэгээтэйгээр хадгална.',
      vocabHint:'Дууны тэмдэг (゛゜) авиа өөрчилнө. Жижиг ゃ・ゅ・ょ нь өмнөхтэйгөө нийлж нэг авиа болдог.',
      best:'Шилдэг оноо', allDone:'Бүгдийг мэддэг гэж тэмдэглэсэн байна. Гайхалтай!'
    },
    en: {
      eyebrow:'JAPANESE WRITING · FOUNDATIONS', title:'Read kana with confidence',
      intro:'Hear hiragana and katakana, learn each reading, then check what you remember.',
      hira:'Hiragana', kata:'Katakana', basic:'Basic 46', voiced:'Dakuten & handakuten', combos:'Yōon combinations',
      known:'Known', total:'characters', practice:'5-question check',
      all:'All', review:'To review', search:'Search kana or romaji',
      choose:'Choose a character', chooseHint:'Select a card to see its reading and hear it spoken.',
      listen:'Listen', markKnown:'Mark as known', markReview:'Add to review',
      pair:'Other script', progress:'Your progress', quizTitle:'Kana quick check',
      question:'Choose the romaji for this character.', next:'Next', finish:'See results',
      correct:'Correct — nice work!', incorrect:'Take another look.', score:'Your score', retry:'Try again',
      noSpeech:'A Japanese speech voice is not available on this device.', speakerNote:'Audio availability depends on your device.',
      noKnown:'No characters in this group have been marked yet.', knownHint:'Known characters are saved on this device.',
      vocabHint:'Dakuten marks (゛゜) change the sound. Small ゃ・ゅ・ょ combine with the previous kana.',
      best:'Best score', allDone:'You marked every character as known. Great work!'
    },
    ja: {
      eyebrow:'日本語の文字 · 基礎', title:'かなを自信を持って読もう',
      intro:'ひらがな・カタカナの読み方を聞いて覚え、クイズで確認しましょう。',
      hira:'ひらがな', kata:'カタカナ', basic:'基本46文字', voiced:'濁音・半濁音', combos:'拗音',
      known:'習得済み', total:'文字', practice:'5問クイズ',
      all:'すべて', review:'復習する', search:'かな・ローマ字を検索',
      choose:'文字を選択', chooseHint:'カードを選ぶと読み方を確認して音声を聞けます。',
      listen:'発音を聞く', markKnown:'習得済みにする', markReview:'復習に戻す',
      pair:'もう一方の文字', progress:'学習の進捗', quizTitle:'かなクイックチェック',
      question:'この文字のローマ字を選んでください。', next:'次へ', finish:'結果を見る',
      correct:'正解です！', incorrect:'もう一度確認しましょう。', score:'スコア', retry:'もう一度',
      noSpeech:'この端末では日本語音声を利用できません。', speakerNote:'音声は端末の設定により異なります。',
      noKnown:'このグループで習得済みの文字はまだありません。', knownHint:'習得済みの文字はこの端末に保存されます。',
      vocabHint:'濁点・半濁点（゛゜）は音を変えます。小さい「ゃ・ゅ・ょ」は前のかなと結合します。',
      best:'ベストスコア', allDone:'すべて習得済みにしました。すばらしいです！'
    }
  };
  const CATEGORY_LABELS = {
    basic:{mn:'Үндсэн 46',en:'Basic 46',ja:'基本46文字'},
    voiced:{mn:'Дууны тэмдэгтэй',en:'Dakuten & handakuten',ja:'濁音・半濁音'},
    combos:{mn:'Хосолсон авиа',en:'Yōon combinations',ja:'拗音'}
  };
  const STORAGE_KEY = 'nihongo-kana-progress-v1';
  const TOTAL = 104;
  let script = 'hiragana';
  let category = 'basic';
  let filter = 'all';
  let query = '';
  let selectedChar = '';
  let quiz = null;
  let store = loadStore();
  let root = null;

  function text(key) {
    const current = typeof language !== 'undefined' ? language : 'mn';
    return (TEXT[current] && TEXT[current][key]) || TEXT.mn[key] || key;
  }
  function categoryLabel(key) {
    const current = typeof language !== 'undefined' ? language : 'mn';
    return (CATEGORY_LABELS[key] && CATEGORY_LABELS[key][current]) || CATEGORY_LABELS[key].mn;
  }
  function loadStore() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch (_) { return {}; }
  }
  function saveStore() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (_) {}
  }
  function scriptData(which, group) {
    const rows = group === 'basic' ? ROWS[which] : group === 'voiced' ? VOICED[which] : COMBINATIONS[which];
    return rows.map(row => row.map(([char, romaji]) => ({char, romaji, group})))
      .filter(row => row.length);
  }
  function allForScript(which) {
    return ['basic','voiced','combos'].flatMap(group => scriptData(which, group).flat());
  }
  function statusOf(which, char) {
    const branch = store[which];
    return branch && branch[char] === 'known' ? 'known' : '';
  }
  function countKnown(which) {
    return allForScript(which).filter(item => statusOf(which, item.char) === 'known').length;
  }
  function setKnown(char, isKnown) {
    if (!store[script] || typeof store[script] !== 'object') store[script] = {};
    if (isKnown) store[script][char] = 'known';
    else delete store[script][char];
    saveStore();
  }
  function filteredRows() {
    return scriptData(script, category).map(row => row.filter(item => {
      const state = statusOf(script, item.char);
      const stateMatch = filter === 'all' || (filter === 'known' ? state === 'known' : state !== 'known');
      const search = (item.char + ' ' + item.romaji).toLowerCase();
      return stateMatch && (!query || search.includes(query.toLowerCase()));
    })).filter(row => row.length);
  }
  function sectionMarkup() {
    return `<div class="kana-heading">
      <div class="kana-heading-copy"><div class="eyebrow">${text('eyebrow')}</div><h2 id="kana-title">${text('title')}</h2><p>${text('intro')}</p></div>
      <div class="kana-progress-card"><div class="kana-progress-top"><span>${text('progress')}</span><b id="kana-progress-label">0 / ${TOTAL}</b></div><div class="kana-progress-track"><i id="kana-progress-fill"></i></div><small id="kana-progress-caption"></small></div>
    </div>
    <div class="kana-controls">
      <div class="kana-script-switch" role="tablist" aria-label="Kana script">
        <button type="button" role="tab" data-script="hiragana" aria-selected="true">あ <span>${text('hira')}</span></button>
        <button type="button" role="tab" data-script="katakana" aria-selected="false">ア <span>${text('kata')}</span></button>
      </div>
      <button type="button" id="kana-start-quiz" class="btn primary kana-quiz-trigger">${text('practice')} <span>→</span></button>
    </div>
    <div class="kana-filters">
      <div class="kana-category-tabs" role="tablist" aria-label="Kana groups">
        ${['basic','voiced','combos'].map(key => `<button type="button" role="tab" data-category="${key}" aria-selected="${key === category}">${categoryLabel(key)} <small>${key === 'basic' ? 46 : key === 'voiced' ? 25 : 33}</small></button>`).join('')}
      </div>
      <div class="kana-filter-tools"><label class="kana-search"><span aria-hidden="true">⌕</span><input id="kana-search" type="search" placeholder="${text('search')}" autocomplete="off"></label>
        <select id="kana-status-filter" aria-label="${text('all')} / ${text('review')}"><option value="all">${text('all')}</option><option value="review">${text('review')}</option><option value="known">${text('known')}</option></select>
      </div>
    </div>
    <div class="kana-workspace">
      <div class="kana-chart-column"><div id="kana-chart" class="kana-chart" aria-label="Kana character chart"></div><div class="kana-footnote">${text('vocabHint')}</div></div>
      <aside id="kana-detail" class="kana-detail" aria-live="polite"></aside>
    </div>
    <div class="kana-quiz" id="kana-quiz" hidden aria-live="polite"></div>
    <div id="kana-announcement" class="sr-only" role="status" aria-live="polite"></div>`;
  }
  function mount() {
    root = document.getElementById('kana');
    if (!root) return;
    root.innerHTML = sectionMarkup();
    root.addEventListener('click', onClick);
    root.querySelector('#kana-search').addEventListener('input', event => {query = event.target.value.trim(); renderChart();});
    root.querySelector('#kana-status-filter').addEventListener('change', event => {filter = event.target.value; renderChart();});
    render();
  }
  function render() {
    if (!root) return;
    renderProgress();
    renderControls();
    renderChart();
    renderDetail();
  }
  function renderProgress() {
    const known = countKnown(script);
    const fill = root.querySelector('#kana-progress-fill');
    root.querySelector('#kana-progress-label').textContent = `${known} / ${TOTAL}`;
    fill.style.width = `${Math.round(known / TOTAL * 100)}%`;
    root.querySelector('#kana-progress-caption').textContent = `${text(script === 'hiragana' ? 'hira' : 'kata')} · ${text('knownHint')}`;
  }
  function renderControls() {
    root.querySelectorAll('[data-script]').forEach(button => {
      const active = button.dataset.script === script;
      button.setAttribute('aria-selected', String(active));
    });
    root.querySelectorAll('[data-category]').forEach(button => {
      const active = button.dataset.category === category;
      button.setAttribute('aria-selected', String(active));
      const small = button.querySelector('small');
      if (small) small.textContent = button.dataset.category === 'basic' ? '46' : button.dataset.category === 'voiced' ? '25' : '33';
      const label = categoryLabel(button.dataset.category);
      if (small) {
        const labelNode = button.childNodes[0];
        if (labelNode) labelNode.textContent = `${label} `;
      }
    });
    const start = root.querySelector('#kana-start-quiz');
    start.innerHTML = `${text('practice')} <span>→</span>`;
  }
  function renderChart() {
    const host = root.querySelector('#kana-chart');
    const rows = filteredRows();
    host.innerHTML = rows.length ? rows.map(row => `<div class="kana-row">${row.map(item => {
      const isKnown = statusOf(script, item.char) === 'known';
      const active = item.char === selectedChar;
      return `<button class="kana-char${isKnown ? ' is-known' : ''}${active ? ' is-selected' : ''}" type="button" data-kana-char="${item.char}" aria-pressed="${active}" aria-label="${item.char}, ${item.romaji}${isKnown ? ', ' + text('known') : ''}"><span class="kana-char-main" lang="ja">${item.char}</span><span class="kana-char-romaji">${item.romaji}</span>${isKnown ? '<span class="kana-known-mark" aria-hidden="true">✓</span>' : ''}</button>`;
    }).join('')}</div>`).join('') : `<div class="kana-empty">${filter === 'known' ? text('noKnown') : text('chooseHint')}</div>`;
  }
  function itemFor(char, which) {
    return allForScript(which || script).find(item => item.char === char) || null;
  }
  function renderDetail() {
    const item = itemFor(selectedChar, script);
    const host = root.querySelector('#kana-detail');
    if (!item) {
      host.innerHTML = `<div class="kana-detail-empty"><span>あ</span><b>${text('choose')}</b><p>${text('chooseHint')}</p></div>`;
      return;
    }
    const isKnown = statusOf(script, item.char) === 'known';
    const pair = itemFor(item.char, script === 'hiragana' ? 'katakana' : 'hiragana');
    const pairLabel = script === 'hiragana' ? text('kata') : text('hira');
    host.innerHTML = `<div class="kana-detail-top"><span>${text(script === 'hiragana' ? 'hira' : 'kata')}</span><span>${categoryLabel(item.group)}</span></div>
      <div class="kana-detail-character" lang="ja">${item.char}</div><div class="kana-detail-romaji">${item.romaji}</div>
      <div class="kana-pair"><small>${text('pair')} · ${pairLabel}</small><strong lang="ja">${pair ? pair.char : item.char}</strong></div>
      <button type="button" class="kana-listen" data-listen="${item.char}">◖ ${text('listen')}</button>
      <button type="button" class="kana-known-button${isKnown ? ' is-known' : ''}" data-toggle-known="${item.char}" aria-pressed="${isKnown}">${isKnown ? '✓ ' + text('markReview') : text('markKnown')}</button>
      <small class="kana-speaker-note">${text('speakerNote')}</small>`;
  }
  function announce(message) {
    const node = root && root.querySelector('#kana-announcement');
    if (node) node.textContent = message;
  }
  function speak(char) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      announce(text('noSpeech'));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(char);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.78;
    utterance.onerror = () => announce(text('noSpeech'));
    window.speechSynthesis.speak(utterance);
  }
  function setScript(next) {
    script = next;
    query = '';
    filter = 'all';
    const search = root.querySelector('#kana-search');
    if (search) search.value = '';
    root.querySelector('#kana-status-filter').value = 'all';
    const rows = filteredRows();
    selectedChar = rows.length ? rows[0][0].char : '';
    quiz = null;
    root.querySelector('#kana-quiz').hidden = true;
    render();
  }
  function setCategory(next) {
    category = next;
    query = '';
    filter = 'all';
    root.querySelector('#kana-search').value = '';
    root.querySelector('#kana-status-filter').value = 'all';
    const rows = filteredRows();
    selectedChar = rows.length ? rows[0][0].char : '';
    render();
  }
  function onClick(event) {
    const scriptButton = event.target.closest('[data-script]');
    if (scriptButton) { setScript(scriptButton.dataset.script); return; }
    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) { setCategory(categoryButton.dataset.category); return; }
    const charButton = event.target.closest('[data-kana-char]');
    if (charButton) {
      selectedChar = charButton.dataset.kanaChar;
      renderChart(); renderDetail();
      return;
    }
    const listenButton = event.target.closest('[data-listen]');
    if (listenButton) { speak(listenButton.dataset.listen); return; }
    const knownButton = event.target.closest('[data-toggle-known]');
    if (knownButton) {
      const char = knownButton.dataset.toggleKnown;
      setKnown(char, statusOf(script, char) !== 'known');
      render();
      return;
    }
    if (event.target.closest('#kana-start-quiz')) { startQuiz(); return; }
    const answer = event.target.closest('[data-kana-answer]');
    if (answer) { answerQuestion(Number(answer.dataset.kanaAnswer)); return; }
    if (event.target.closest('#kana-next-question')) { nextQuestion(); }
  }
  function startQuiz() {
    const pool = scriptData(script, category).flat();
    if (!pool.length) return;
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    quiz = {pool: shuffled.slice(0, Math.min(5, shuffled.length)), index:0, correct:0, answered:false};
    root.querySelector('#kana-quiz').hidden = false;
    drawQuestion();
    root.querySelector('#kana-quiz').scrollIntoView({behavior:'smooth', block:'nearest'});
  }
  function drawQuestion() {
    if (!quiz) return;
    const host = root.querySelector('#kana-quiz');
    const item = quiz.pool[quiz.index];
    if (!item) { drawResult(); return; }
    const all = allForScript(script);
    const choices = [item.romaji];
    const distractors = all.map(x => x.romaji).filter(value => value !== item.romaji);
    while (choices.length < 4 && distractors.length) {
      const index = Math.floor(Math.random() * distractors.length);
      const option = distractors.splice(index, 1)[0];
      if (!choices.includes(option)) choices.push(option);
    }
    quiz.choices = choices.sort(() => Math.random() - 0.5);
    quiz.correctIndex = quiz.choices.indexOf(item.romaji);
    quiz.answered = false;
    host.innerHTML = `<div class="kana-quiz-heading"><div><span class="eyebrow">${text('practice')}</span><h3>${text('quizTitle')}</h3></div><span class="kana-quiz-count">${quiz.index + 1} / ${quiz.pool.length}</span></div>
      <div class="kana-quiz-progress"><i style="width:${Math.round((quiz.index / quiz.pool.length) * 100)}%"></i></div>
      <p class="kana-question-label">${text('question')}</p><div class="kana-question-char" lang="ja">${item.char}</div>
      <div class="kana-answer-grid">${quiz.choices.map((choice, index) => `<button type="button" data-kana-answer="${index}" class="kana-answer">${choice}</button>`).join('')}</div>
      <div class="kana-feedback" id="kana-feedback" aria-live="polite"></div>
      <button type="button" id="kana-next-question" class="btn primary" disabled>${quiz.index === quiz.pool.length - 1 ? text('finish') : text('next')} →</button>`;
  }
  function answerQuestion(index) {
    if (!quiz || quiz.answered || !Number.isInteger(index)) return;
    const item = quiz.pool[quiz.index];
    const buttons = Array.from(root.querySelectorAll('[data-kana-answer]'));
    const selected = buttons[index];
    if (!selected) return;
    quiz.answered = true;
    const correct = index === quiz.correctIndex;
    if (correct) {
      quiz.correct += 1;
      setKnown(item.char, true);
    } else if (statusOf(script, item.char) !== 'known') {
      setKnown(item.char, false);
    }
    buttons.forEach(button => { button.disabled = true; });
    selected.classList.add(correct ? 'is-correct' : 'is-wrong');
    buttons[quiz.correctIndex].classList.add('is-correct');
    const feedback = root.querySelector('#kana-feedback');
    feedback.textContent = correct ? text('correct') : `${text('incorrect')} ${item.romaji}`;
    const next = root.querySelector('#kana-next-question');
    next.disabled = false;
    renderProgress();
    renderChart();
  }
  function nextQuestion() {
    if (!quiz || !quiz.answered) return;
    quiz.index += 1;
    if (quiz.index >= quiz.pool.length) drawResult();
    else drawQuestion();
  }
  function drawResult() {
    const host = root.querySelector('#kana-quiz');
    const percent = quiz.pool.length ? Math.round(quiz.correct / quiz.pool.length * 100) : 0;
    let best = {};
    try { best = JSON.parse(localStorage.getItem('nihongo-kana-best-v1') || '{}') || {}; } catch (_) { best = {}; }
    best[`${script}:${category}`] = Math.max(Number(best[`${script}:${category}`]) || 0, percent);
    try { localStorage.setItem('nihongo-kana-best-v1', JSON.stringify(best)); } catch (_) {}
    host.innerHTML = `<div class="kana-result"><span class="kana-result-mark">${percent >= 80 ? '✓' : '↻'}</span><div class="eyebrow">${text('score')}</div><h3>${quiz.correct} / ${quiz.pool.length}</h3><p>${percent}% · ${text('best')}: ${best[`${script}:${category}`]}%</p><button class="btn primary" id="kana-start-quiz">${text('retry')} →</button></div>`;
  }
  function refresh() {
    if (!root) return;
    const activeScript = script;
    const activeCategory = category;
    const activeChar = selectedChar;
    const searchValue = root.querySelector('#kana-search') ? root.querySelector('#kana-search').value : '';
    root.innerHTML = sectionMarkup();
    root.querySelector('#kana-search').value = searchValue;
    root.querySelector('#kana-status-filter').value = filter;
    root.querySelector('#kana-search').addEventListener('input', event => {query = event.target.value.trim(); renderChart();});
    root.querySelector('#kana-status-filter').addEventListener('change', event => {filter = event.target.value; renderChart();});
    script = activeScript;
    category = activeCategory;
    selectedChar = itemFor(activeChar, activeScript) ? activeChar : (filteredRows()[0]?.[0]?.char || '');
    render();
  }
  function init() {
    mount();
    const languagePicker = document.getElementById('language-picker');
    if (languagePicker) languagePicker.addEventListener('change', () => setTimeout(refresh, 0));
    const levelPicker = document.getElementById('setting-level');
    if (levelPicker) levelPicker.addEventListener('change', () => setTimeout(refresh, 0));
  }
  window.KanaStudio = {refresh, setKnown, data: {ROWS, VOICED, COMBINATIONS}};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
