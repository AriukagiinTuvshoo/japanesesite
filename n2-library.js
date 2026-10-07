/* Curated, source-attributed N2 book companion and external resource map. */
(function (global) {
  "use strict";

  var PROGRESS_KEY = "nihongo-n2-book-map-v1";
  var copy = {
    mn: {
      title: "N2 номын хамтрагч",
      eyebrow: "ӨГСӨН НОМ · БҮЛГИЙН ЗАМЫН ЗУРАГ",
      intro: "Таны өгсөн Nihongo no Mori-ийн номын бүтцийг N2 бэлтгэлийн шалгах хуудас болголоо. Номын эх, жишээ, дасгалыг энд хуулбарлаагүй.",
      openBook: "Өгсөн PDF-ийг нээх",
      source: "Эх сурвалж: 「JLPT N2 この1冊で合格する」 · 日本語の森／日本語研究所",
      pdfNote: "GitHub дээрх PDF-г интернэтээр нээнэ; аппын офлайн кэшид ороогүй.",
      progress: "Номын төлөвлөгөө",
      progressLabel: "хэсэг дууссан",
      itemsLabel: "даалгавар",
      scopeNote: "Номын нүүр ба агуулгад бичсэн хамрах хүрээ; JLPT-ийн албан ёсны үг, дүрмийн тоо биш.",
      examTitle: "Албан ёсны N2 шалгалтын формат",
      examText: "JLPT-ийн одоогийн бүтэц, босгыг ашиглан бүтэн шалгалтаа цагла.",
      sectionLanguage: "Хэлний мэдлэг + уншлага",
      sectionListening: "Сонсгол",
      sectionScore: "Нийт тэнцэх босго · хэсэг бүрийн доод босго",
      sectionScoreValue: "90 / 180 · хэсэг бүр 19 / 60",
      routesTitle: "Хугацаандаа тааруулж бэлдэх",
      routePlentyTitle: "Хугацаа хангалттай",
      routePlentyText: "Үг, ханзны бүлгээс эхлээд дүрэм, уншлага, сонсгол руу дарааллаар яв; сэдэв бүрийн дараа номын дасгалыг хийж, төгсгөлд хоёр туршилтын шалгалтаа цагтай ажилла.",
      routeShortTitle: "Шалгалт ойртсон",
      routeShortText: "Эхлээд номын хоёр туршилтын шалгалтыг хийж, хамгийн сул хэсгээ тогтоо. Үлдсэн хугацаагаа тэр хэсэгт төвлөрүүлээд, нөгөө хэсгүүдээ богино давталтаар хадгал.",
      sectionWords: "Үг, ханз",
      sectionGrammar: "Дүрмийн 15 бүлэг",
      sectionReading: "Уншлагын дасгал",
      sectionListening: "Сонсголын дасгал",
      sectionMocks: "Туршилтын шалгалт ба дүгнэлт",
      sectionSummaryWords: "Номын агуулгад ойролцоогоор 3,500 үг, 426 үгийн-сангийн дасгал, зургаан төрлийн асуулт тэмдэглэсэн.",
      sectionSummaryGrammar: "135 дүрмийн хэлбэрийг утга, хэрэглээгээр нь 15 бүлэгт ангилсан.",
      sectionSummaryReading: "Богино, дунд, олон эхийн нэгтгэл, урт эхийн гол санаа, мэдээлэл хайх даалгавар.",
      sectionSummaryListening: "Даалгавар ойлгох, гол цэг, ерөнхий агуулга, шууд хариу, мэдээлэл нэгтгэх.",
      sectionSummaryMocks: "Хоёр туршилтын шалгалт, хариуны түлхүүр, сонсголын бичвэр; аудиог номын QR-аар нээнэ.",
      resourceTitle: "N2 материалын сан",
      resourceIntro: "Албан ёсны шалгалтын материал, бие даасан жагсаалт, уншлагын нэмэлт эхийг ялгаж ангилав.",
      officialGroup: "Албан ёсны JLPT эх сурвалж",
      referenceGroup: "Бие даасан N2 лавлах, давталт",
      supplementGroup: "Уншлага ба ерөнхий суурийн нэмэлт",
      officialBadge: "Албан ёсны",
      independentBadge: "Албан бус · лавлах",
      supplementBadge: "Нэмэлт дадлага",
      resourceCaveat: "JLPT-ийн албан ёсны түвшний тайлбар нь чадварын зорилгыг тодорхойлдог. Гаднын үг, ханз, дүрмийн жагсаалтыг албан ёсны эсвэл бүрэн хөтөлбөр гэж үзэхгүй; жагсаалтын тоо, хамрах хүрээ хоорондоо ялгаатай.",
      expand: "Бүлгүүдийг нээх",
      completed: "Дууссан",
      n2MockTitle: "N2 уртасгасан сорил",
      n2MockText: "25 эх зохиолын асуулт: үг, ханз, дүрэм, уншлага, сонсгол. 25 минут; албан ёсны бүтэн шалгалт биш.",
      n2MockCount: "25 асуулт · 25 мин",
      n2MockButton: "25 минутын сорил эхлүүлэх",
      fullMockTitle: "N2 бүрэн хугацааны туршилт",
      fullMockText: "85 өөрөө зохиосон асуулт · Хэлний мэдлэг + уншлага 105 минут · дараа нь сонсгол 50 минут. Формат ба тоо нь ойролцоо загвар бөгөөд JLPT-ийн албан ёсны асуултын тоог яг хуулбарлаагүй. Асуулт, төхөөрөмжийн дуу албан материал биш.",
      fullMockCount: "85 асуулт · 105 + 50 мин",
      fullMockButton: "Бүтэн N2 туршилт эхлүүлэх"
    },
    en: {
      title: "N2 book companion",
      eyebrow: "PROVIDED BOOK · CHAPTER ROADMAP",
      intro: "The Nihongo no Mori book you shared is mapped into an N2 checklist. Its passages, examples, and exercises are not reproduced here.",
      openBook: "Open the provided PDF",
      source: "Source: 「JLPT N2 この1冊で合格する」 · 日本語の森／日本語研究所",
      pdfNote: "Opens the GitHub PDF online; the file is not included in the app’s offline cache.",
      progress: "Book study plan",
      progressLabel: "sections complete",
      itemsLabel: "tasks",
      scopeNote: "Counts describe the book’s own coverage, not an official JLPT vocabulary or grammar syllabus.",
      examTitle: "Official N2 test format",
      examText: "Use the current JLPT section timing and pass thresholds when you practise a full sitting.",
      sectionLanguage: "Language Knowledge + Reading",
      sectionListening: "Listening",
      sectionScore: "Overall pass mark · minimum in each scored section",
      sectionScoreValue: "90 / 180 · at least 19 / 60 per section",
      routesTitle: "Choose a route for your timeline",
      routePlentyTitle: "More time available",
      routePlentyText: "Work through vocabulary and kanji, then grammar, reading, and listening. Do the book exercises after each topic, then finish with both timed mock tests.",
      routeShortTitle: "Exam date is close",
      routeShortText: "Take the book’s two mock tests first to find your weakest section. Prioritize that area while keeping the others active with short reviews.",
      sectionWords: "Vocabulary & kanji",
      sectionGrammar: "15 grammar groups",
      sectionReading: "Reading practice",
      sectionListening: "Listening practice",
      sectionMocks: "Mock tests & review",
      sectionSummaryWords: "The book describes about 3,500 vocabulary entries, 426 vocabulary questions, and six item types.",
      sectionSummaryGrammar: "135 grammar patterns arranged into 15 meaning- and usage-based groups.",
      sectionSummaryReading: "Short and medium texts, integrated multiple texts, long-passage argument, and information retrieval.",
      sectionSummaryListening: "Task, key-point, outline, quick-response, and integrated comprehension.",
      sectionSummaryMocks: "Two mock tests, answer key, and listening scripts; use the book’s QR code for audio.",
      resourceTitle: "Curated N2 resource library",
      resourceIntro: "Links are grouped into official test references, independent study indexes, and supplemental reading.",
      officialGroup: "Official JLPT sources",
      referenceGroup: "Independent N2 references & review",
      supplementGroup: "Reading and general-foundation supplements",
      officialBadge: "Official",
      independentBadge: "Independent reference",
      supplementBadge: "Supplemental practice",
      resourceCaveat: "The JLPT’s official level summary describes abilities. Third-party vocabulary, kanji, and grammar lists are not an official or exhaustive syllabus, and their coverage/counts vary.",
      expand: "Open chapter checklist",
      completed: "Complete",
      n2MockTitle: "Expanded N2 challenge",
      n2MockText: "25 original questions across vocabulary, kanji, grammar, reading, and listening. Timed for 25 minutes; not a full official exam.",
      n2MockCount: "25 questions · 25 min",
      n2MockButton: "Start 25-minute set",
      fullMockTitle: "Full-timing N2 simulation",
      fullMockText: "85 original questions · 105 min Language Knowledge + Reading · then 50 min Listening. Approximate format and counts, not an exact JLPT item-count replica. Original questions and device-generated speech; not official material.",
      fullMockCount: "85 questions · 105 + 50 min",
      fullMockButton: "Start full N2 simulation"
    },
    ja: {
      title: "N2教材コンパニオン",
      eyebrow: "提供書籍 · 章別ロードマップ",
      intro: "共有いただいた日本語の森の書籍を、N2学習チェックリストに整理しました。本文・例文・練習問題は転載していません。",
      openBook: "提供PDFを開く",
      source: "出典：「JLPT N2 この1冊で合格する」 · 日本語の森／日本語研究所",
      pdfNote: "GitHub上のPDFをオンラインで開きます。アプリのオフラインキャッシュには含まれません。",
      progress: "書籍学習の進捗",
      progressLabel: "項目完了",
      itemsLabel: "タスク",
      scopeNote: "冊子に記載された収録範囲であり、JLPT公式の語彙・文法シラバスではありません。",
      examTitle: "JLPT公式 N2 試験形式",
      examText: "本番形式の練習では、現在の試験時間と合格基準を確認してください。",
      sectionLanguage: "言語知識＋読解",
      sectionListening: "聴解",
      sectionScore: "総合合格点 · 各得点区分の最低点",
      sectionScoreValue: "90 / 180 · 各区分 19 / 60 以上",
      routesTitle: "残り時間に合わせた学習ルート",
      routePlentyTitle: "時間に余裕がある場合",
      routePlentyText: "語彙・漢字から文法、読解、聴解へ順に進み、各テーマの問題を解きます。最後に模擬試験を二回、時間を計って実施します。",
      routeShortTitle: "試験日が近い場合",
      routeShortText: "まず二回分の模擬試験に取り組み、最も弱い区分を確認します。その区分を優先しながら、他の区分も短い復習で維持します。",
      sectionWords: "文字・語彙",
      sectionGrammar: "文法15章",
      sectionReading: "読解練習",
      sectionListening: "聴解練習",
      sectionMocks: "模擬試験・復習",
      sectionSummaryWords: "書籍には語彙約3,500語、語彙問題426問、六つの問題形式と記載されています。",
      sectionSummaryGrammar: "文法135項目を意味・用法に基づく15章に分類しています。",
      sectionSummaryReading: "短文・中文、複数文書の統合、長文の主張理解、情報検索。",
      sectionSummaryListening: "課題理解、ポイント理解、概要理解、即時応答、統合理解。",
      sectionSummaryMocks: "模擬試験二回分、解答、聴解スクリプトを収録。音声は書籍のQRコードから利用します。",
      resourceTitle: "厳選 N2 学習リソース",
      resourceIntro: "公式の試験情報、民間の学習リスト、補助的な読書教材に分類しました。",
      officialGroup: "JLPT公式情報",
      referenceGroup: "民間のN2参考資料・復習",
      supplementGroup: "読解・基礎固めの補助教材",
      officialBadge: "公式",
      independentBadge: "民間の参考資料",
      supplementBadge: "補助練習",
      resourceCaveat: "JLPT公式のレベル説明は必要な能力を示します。第三者の語彙・漢字・文法リストは公式または網羅的なシラバスではなく、収録範囲や数には差があります。",
      expand: "章別チェックリストを開く",
      completed: "完了",
      n2MockTitle: "N2実戦チャレンジ",
      n2MockText: "語彙・漢字・文法・読解・聴解から出題するオリジナル25問。25分の練習であり、公式の全試験ではありません。",
      n2MockCount: "25問 · 25分",
      n2MockButton: "25分セットを始める",
      fullMockTitle: "N2 本番時間シミュレーション",
      fullMockText: "オリジナル85問。言語知識・読解105分の後、聴解50分。問題形式と問題数は近似で、公式の問題数を正確に再現していません。問題と端末音声は公式教材ではありません。",
      fullMockCount: "85問 · 105 + 50分",
      fullMockButton: "N2シミュレーション開始"
    }
  };

  var sections = [
    {
      id: "vocabulary",
      icon: "語",
      title: { mn: "Үг, ханз", en: "Vocabulary & kanji", ja: "文字・語彙" },
      summaryKey: "sectionSummaryWords",
      items: [
        { id: "words-by-class", text: { mn: "Үгийг үгийн аймаг, сэдвээр ангилан давтах", en: "Review word lists by part of speech and category", ja: "品詞・種類別に語彙を復習する" } },
        { id: "kanji-reading", text: { mn: "Ханзтай үгийн уншлага таних", en: "Recognize readings of kanji words", ja: "漢字語の読み方を確認する" } },
        { id: "orthography-formation", text: { mn: "Зөв бичлэг, үг бүтэх хэлбэрийг шалгах", en: "Practise orthography and word formation", ja: "表記と語形成を練習する" } },
        { id: "context-paraphrase", text: { mn: "Өгүүлбэрийн хам сэдэв, ойролцоо утгыг ялгах", en: "Distinguish contextual meaning and paraphrases", ja: "文脈と類義表現を見分ける" } },
        { id: "word-usage", text: { mn: "Үгийн өгүүлбэр дэх зөв хэрэглээг бататгах", en: "Check how words are used in sentences", ja: "文中での語の使い方を確認する" } }
      ]
    },
    {
      id: "grammar",
      icon: "文",
      title: { mn: "Дүрмийн 15 бүлэг", en: "15 grammar groups", ja: "文法15章" },
      summaryKey: "sectionSummaryGrammar",
      items: [
        { id: "grammar-mono", text: { mn: "『もの』-той холбоотой хэлбэрүүд", en: "Patterns built around もの", ja: "「もの」を使う表現" } },
        { id: "grammar-koto", text: { mn: "『こと』-той холбоотой хэлбэрүүд", en: "Patterns built around こと", ja: "「こと」を使う表現" } },
        { id: "grammar-kagiri", text: { mn: "Хязгаар, нөхцөл, үл хамаарах тохиолдол", en: "Limits, conditions, and exceptions", ja: "限界・条件・例外" } },
        { id: "grammar-linking", text: { mn: "Шалтгаан-үр дагавар ба эсрэгцүүлэл", en: "Cause, sequence, and contrast", ja: "順接・逆接" } },
        { id: "grammar-negative", text: { mn: "Сөрөг үнэлгээ, таагүй үр дагавар", en: "Negative evaluation and outcomes", ja: "否定的な意味・結果" } },
        { id: "grammar-emphasis", text: { mn: "Онцлох, хүч нэмэх хэлбэрүүд", en: "Emphasis and intensification", ja: "強調表現" } },
        { id: "grammar-time", text: { mn: "Цаг хугацаа, дараалал", en: "Time and sequence", ja: "時間・順序" } },
        { id: "grammar-standard", text: { mn: "Жишиг, холбоо хамаарал", en: "Standards and relationships", ja: "基準・関連" } },
        { id: "grammar-condition", text: { mn: "Таамаг ба нөхцөл", en: "Hypotheses and conditions", ja: "仮定・条件" } },
        { id: "grammar-report", text: { mn: "Нөхцөл байдал, дам мэдээлэл", en: "Situations and reported information", ja: "状況・伝聞" } },
        { id: "grammar-change", text: { mn: "Өөрчлөлт ба үр дүн", en: "Change and results", ja: "変化・結果" } },
        { id: "grammar-inference", text: { mn: "Албадлага, хамааралгүй байдал, таамаг", en: "Obligation, irrelevance, and inference", ja: "強制・無関係・推測" } },
        { id: "grammar-listing", text: { mn: "Жагсаах ба зэрэгцүүлэх", en: "Listing and parallel items", ja: "列挙" } },
        { id: "grammar-lexical", text: { mn: "Үгийн сан шиг хэрэглэгддэг хэлзүй", en: "Grammar used like lexical expressions", ja: "語彙的な文法表現" } },
        { id: "grammar-keigo", text: { mn: "Хүндэтгэлийн ба эелдэг хэллэг", en: "Honorific and polite expressions", ja: "敬語・丁寧な表現" } }
      ]
    },
    {
      id: "reading",
      icon: "読",
      title: { mn: "Уншлагын дасгал", en: "Reading practice", ja: "読解練習" },
      summaryKey: "sectionSummaryReading",
      items: [
        { id: "reading-short", text: { mn: "Богино эхийн гол санаа ба шалтгаан", en: "Main idea and reasons in short passages", ja: "短文の要点・理由" } },
        { id: "reading-medium", text: { mn: "Дунд хэмжээний эхийн дэлгэрэнгүй", en: "Details in medium-length passages", ja: "中文の内容理解" } },
        { id: "reading-integrated", text: { mn: "Хоёр ба түүнээс олон эхийн мэдээллийг нэгтгэх", en: "Integrate information across multiple texts", ja: "複数文書の情報を統合する" } },
        { id: "reading-long", text: { mn: "Урт эхийн байр суурь, зохиогчийн санаа", en: "Track claims and author intent in long texts", ja: "長文の主張・筆者の意図を読む" } },
        { id: "reading-search", text: { mn: "Зар, мэдэгдлээс шаардлагатай мэдээлэл хайх", en: "Retrieve details from notices and practical documents", ja: "案内・資料から必要な情報を探す" } }
      ]
    },
    {
      id: "listening",
      icon: "耳",
      title: { mn: "Сонсголын дасгал", en: "Listening practice", ja: "聴解練習" },
      summaryKey: "sectionSummaryListening",
      items: [
        { id: "listening-task", text: { mn: "Даалгаврын зорилго, хийх дарааллыг ойлгох", en: "Identify the task and appropriate action", ja: "課題と取るべき行動を理解する" } },
        { id: "listening-points", text: { mn: "Гол цэг, шаардлагатай баримтыг сонсож авах", en: "Catch key points and necessary details", ja: "要点と必要な情報を聞き取る" } },
        { id: "listening-outline", text: { mn: "Яриа, мэдээний ерөнхий агуулгыг барих", en: "Follow the outline of a conversation or report", ja: "会話・報告の概要をつかむ" } },
        { id: "listening-response", text: { mn: "Богино асуултад шууд тохирох хариу сонгох", en: "Choose an appropriate quick response", ja: "短い発話に適切に応答する" } },
        { id: "listening-integrated", text: { mn: "Олон яригч, баримтыг нэгтгэн дүгнэх", en: "Compare and integrate speakers or information", ja: "複数の話者・情報を統合する" } }
      ]
    },
    {
      id: "mocks",
      icon: "合",
      title: { mn: "Туршилтын шалгалт ба дүгнэлт", en: "Mock tests & review", ja: "模擬試験・復習" },
      summaryKey: "sectionSummaryMocks",
      items: [
        { id: "mock-timing", text: { mn: "105 минутын хэлний мэдлэг/уншлага + 50 минутын сонсголын цагаар бэлдэх", en: "Practise to the 105-minute language/reading and 50-minute listening schedule", ja: "言語知識・読解105分、聴解50分の時間配分で練習する" } },
        { id: "mock-one", text: { mn: "Номын 1-р туршилтын шалгалтыг ажиллах", en: "Complete mock test 1 from the book", ja: "書籍の模擬試験1を解く" } },
        { id: "mock-two", text: { mn: "Номын 2-р туршилтын шалгалтыг ажиллах", en: "Complete mock test 2 from the book", ja: "書籍の模擬試験2を解く" } },
        { id: "mock-review", text: { mn: "Хариу, сонсголын бичвэр, QR аудиогоор алдаагаа шалгах", en: "Review mistakes with the answer key, listening scripts, and QR audio", ja: "解答・聴解スクリプト・QR音声で復習する" } }
      ]
    }
  ];

  var resources = [
    {
      id: "jlpt-samples", category: "official",
      url: "https://www.jlpt.jp/e/samples/forlearners.html",
      title: { mn: "N1–N5 албан ёсны жишиг асуулт", en: "Official sample questions · N1–N5", ja: "N1～N5 公式サンプル問題" },
      description: { mn: "Асуултын хэлбэр, сонголтуудыг түвшин бүрээр үзэх анхдагч эх сурвалж.", en: "Primary source for seeing sample question formats and answer choices across levels.", ja: "各レベルの問題形式と選択肢を確認できる公式資料。" }
    },
    {
      id: "jlpt-workbooks", category: "official",
      url: "https://www.jlpt.jp/e/samples/sampleindex.html",
      title: { mn: "Албан ёсны дасгалын дэвтэр, татаж авах жишээ", en: "Official workbooks & sample downloads", ja: "公式問題集・サンプルのダウンロード" },
      description: { mn: "JLPT-ийн сайт дахь 2018 оны жишээ материал; бүтэн албан ёсны дэвтрийг Bonjinsha худалдаалдаг.", en: "JLPT-hosted Vol. 2 sample PDFs and audio; the full official workbooks are sold by Bonjinsha.", ja: "JLPTサイトのVol.2サンプルPDF・音声。公式問題集は凡人社から販売されています。" }
    },
    {
      id: "jlpt-format", category: "official",
      url: "https://www.jlpt.jp/e/guideline/testsections.html",
      title: { mn: "Хэсгийн бүтэц ба шалгалтын хугацаа", en: "Section layout & test timing", ja: "試験科目・試験時間" },
      description: { mn: "N2: хэлний мэдлэг/уншлага 105 минут, сонсгол 50 минут. Цагийн өөрчлөлтийг JLPT-ээс шалга.", en: "N2: 105 minutes for Language Knowledge/Reading and 50 minutes for Listening. Check JLPT for updates.", ja: "N2は言語知識・読解105分、聴解50分。最新情報は公式サイトで確認してください。" }
    },
    {
      id: "jlpt-scores", category: "official",
      url: "https://www.jlpt.jp/e/guideline/results.html",
      title: { mn: "Албан ёсны оноо ба тэнцэх босго", en: "Official scoring & pass marks", ja: "公式の得点・合格基準" },
      description: { mn: "N2 нь 180-аас 90 оноо, мөн гурван үнэлгээний хэсэг тус бүрд 60-аас 19-өөс доошгүй оноо шаарддаг.", en: "N2 requires 90/180 overall and at least 19/60 in each of its three scored sections.", ja: "N2は総合90/180点以上、三つの得点区分で各19/60点以上が必要です。" }
    },
    {
      id: "jlpt-sensei", category: "reference",
      url: "https://jlptsensei.com/jlpt-n2-grammar-list/",
      title: { mn: "JLPT Sensei · N2 дүрмийн лавлах", en: "JLPT Sensei · N2 grammar index", ja: "JLPT Sensei · N2文法一覧" },
      description: { mn: "Тайлбар, жишээтэй гуравдагч талын жагсаалт; JLPT-ийн албан ёсны дүрмийн хөтөлбөр биш.", en: "Independent list with lesson notes and examples; it is not a JLPT-issued grammar syllabus.", ja: "解説・例文付きの民間リストです。JLPT公式の文法シラバスではありません。" }
    },
    {
      id: "yomimaru-index", category: "reference",
      url: "https://yomimaru.app/learn/jlpt-n2-kanji-vocab-index",
      title: { mn: "Yomimaru · N2 ханз, үгийн индекс", en: "Yomimaru · N2 kanji & vocabulary index", ja: "Yomimaru · N2漢字・語彙インデックス" },
      description: { mn: "Бие даасан жагсаалт/мөрдөгч. Тоо ба хамрах хүрээг баримжаа гэж үз; албан ёсны жагсаалт биш.", en: "Independent list and tracker. Treat its counts and coverage as estimates, not an official list.", ja: "民間のリスト・記録ツールです。数や範囲は目安であり、公式リストではありません。" }
    },
    {
      id: "bunpro-n2", category: "reference",
      url: "https://bunpro.jp/decks/a5gf35/Bunpro-N2-Grammar",
      title: { mn: "Bunpro · N2 дүрмийн давталт", en: "Bunpro · N2 grammar review deck", ja: "Bunpro · N2文法復習デッキ" },
      description: { mn: "Өөрийн дараалалтай SRS картын багц. Зарим боломжид бүртгэл эсвэл төлбөр шаардлагатай байж болно.", en: "A spaced-review deck in the provider’s own order; some features may require an account or payment.", ja: "独自順の反復学習デッキです。一部機能には登録・有料プランが必要な場合があります。" }
    },
    {
      id: "nhk-easy", category: "supplement",
      url: "https://news.web.nhk/news/easy/",
      title: { mn: "NHK NEWS WEB EASY · хялбар мэдээ", en: "NHK NEWS WEB EASY · simplified news", ja: "NHK NEWS WEB EASY · やさしいニュース" },
      description: { mn: "N2-оос хялбар хэллэгтэй мэдээ. Өдөр тутмын уншлагын халаалт болгож ашигла; NHK-ийн хэрэглээний нөхцөлийг шалга.", en: "News in simpler Japanese than N2. Use as a fluency warm-up, not a full N2 test set; check NHK usage terms.", ja: "N2より平易な日本語のニュースです。読解のウォームアップとして利用し、NHKの利用条件を確認してください。" }
    },
    {
      id: "tadoku-free", category: "supplement",
      url: "https://tadoku.org/japanese/en/free-books-en/",
      title: { mn: "Tadoku · үнэгүй шаталсан ном", en: "Tadoku · free graded readers", ja: "多読 · 無料のレベル別読みもの" },
      description: { mn: "Түвшин, сэдвээр шүүж унших үнэгүй ном; N2-ийн тусгай сорил биш, унших дадлыг нэмэхэд тохиромжтой.", en: "Free books filterable by level and topic; not N2-specific, but useful for building reading volume.", ja: "レベル・テーマ別に読める無料教材です。N2専用問題ではなく、多読の補助に向いています。" }
    },
    {
      id: "minato-jf", category: "supplement",
      url: "https://minato-jf.jp/",
      title: { mn: "Japan Foundation Minato · цахим курс", en: "Japan Foundation Minato · online courses", ja: "国際交流基金 Minato · オンラインコース" },
      description: { mn: "Бүртгэлтэй цахим сургалт; ихэнх курс суурь–дунд түвшний тул N2-д нэмэлт суурь болгон ашигла.", en: "Structured online courses, mostly foundational to intermediate; use as a supplement rather than N2 exam prep.", ja: "体系的なオンライン講座です。主に初級～中級のため、N2対策というより基礎補強に利用します。" }
    }
  ];

  var validUnitIds = new Set();
  sections.forEach(function (section) {
    section.items.forEach(function (item) { validUnitIds.add(item.id); });
  });

  function readCompleted() {
    try {
      var state = JSON.parse(global.localStorage.getItem(PROGRESS_KEY) || "{}");
      if (!state || !Array.isArray(state.completed)) return [];
      return Array.from(new Set(state.completed.filter(function (id) { return validUnitIds.has(id); })));
    } catch (error) {
      return [];
    }
  }

  function setUnitComplete(id, complete) {
    if (!validUnitIds.has(id)) return false;
    var completed = new Set(readCompleted());
    if (complete) completed.add(id); else completed.delete(id);
    try {
      global.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, completed: Array.from(completed) }));
    } catch (error) {
      return false;
    }
    return true;
  }

  global.N2StudyLibrary = {
    progressKey: PROGRESS_KEY,
    pdfUrl: "https://github.com/AriukagiinTuvshoo/japanesesite/blob/main/756883766-KORE-DE-GOUKAKU-N2-part-1.pdf",
    pdfRawUrl: "https://raw.githubusercontent.com/AriukagiinTuvshoo/japanesesite/main/756883766-KORE-DE-GOUKAKU-N2-part-1.pdf",
    copy: copy,
    sections: sections,
    resources: resources,
    readCompleted: readCompleted,
    setUnitComplete: setUnitComplete,
    totalUnits: Array.from(validUnitIds).length
  };
})(window);
