/* Original N2 vocabulary, grammar lessons, and extra reading/listening practice. */
(function (global) {
  "use strict";

  var extraWords = [
    ["方針", "ほうしん", "бодлого; чиглэл", "policy; direction", "N2", "今後の方針を会議で説明します。", "Цаашдын бодлогыг хурлын үеэр тайлбарлана.", "I will explain the policy going forward at the meeting."],
    ["基準", "きじゅん", "шалгуур; жишиг", "standard; criterion", "N2", "この製品は安全基準を満たしています。", "Энэ бүтээгдэхүүн аюулгүй байдлын стандартыг хангаж байна.", "This product meets the safety standards."],
    ["条件", "じょうけん", "нөхцөл; шаардлага", "condition; requirement", "N2", "申し込みの条件を先に確認してください。", "Бүртгүүлэх нөхцөлийг эхлээд шалгана уу.", "Please check the application requirements first."],
    ["利点", "りてん", "давуу тал", "advantage; merit", "N2", "この方法には時間を節約できるという利点があります。", "Энэ аргын давуу тал нь цаг хэмнэх боломж юм.", "One advantage of this method is that it saves time."],
    ["欠点", "けってん", "сул тал; дутагдал", "drawback; disadvantage", "N2", "便利ですが、費用が高いという欠点があります。", "Тохиромжтой ч зардал өндөр гэсэн сул талтай.", "It is convenient, but it has the drawback of being expensive."],
    ["収益", "しゅうえき", "орлого; ашиг", "revenue; profit", "N2", "新しいサービスで収益が増えました。", "Шинэ үйлчилгээнээс олох орлого нэмэгдсэн.", "Revenue increased with the new service."],
    ["支出", "ししゅつ", "зарлага; зардал", "expenditure; spending", "N2", "今月は交通費の支出が多くなりました。", "Энэ сард унааны зардал ихэссэн.", "Travel expenses were high this month."],
    ["削減", "さくげん", "бууруулалт; танах", "reduction; cut", "N2", "会社は紙の使用量を削減することにしました。", "Компани цаасны хэрэглээг бууруулахаар шийдсэн.", "The company decided to reduce its paper use."],
    ["需要", "じゅよう", "эрэлт хэрэгцээ", "demand", "N2", "夏は冷たい飲み物の需要が高まります。", "Зуны улиралд хүйтэн ундааны эрэлт нэмэгддэг.", "Demand for cold drinks rises in summer."],
    ["現象", "げんしょう", "үзэгдэл", "phenomenon", "N2", "この現象は冬によく見られます。", "Энэ үзэгдэл өвөл их ажиглагддаг.", "This phenomenon is often seen in winter."],
    ["比率", "ひりつ", "харьцаа; хувь хэмжээ", "ratio; proportion", "N2", "参加者の男女比率を調べました。", "Оролцогчдын хүйсийн харьцааг судалсан.", "We examined the gender ratio of the participants."],
    ["予測", "よそく", "таамаг; урьдчилсан төлөв", "forecast; prediction", "N2", "専門家は来月の売り上げを予測しました。", "Мэргэжилтэн ирэх сарын борлуулалтыг таамагласан.", "The experts forecast next month’s sales."],
    ["関連", "かんれん", "холбоо хамаарал", "connection; relation", "N2", "この資料は先ほどの議題に関連しています。", "Энэ материал саяын хэлэлцэх асуудалтай холбоотой.", "This material is related to the earlier agenda item."],
    ["変更", "へんこう", "өөрчлөлт; өөрчлөх", "change; modification", "N2", "予定に変更があれば、早めに知らせてください。", "Төлөвлөгөөнд өөрчлөлт орвол эрт мэдэгдээрэй.", "Please let us know early if the schedule changes."],
    ["手段", "しゅだん", "арга; хэрэгсэл", "means; method", "N2", "電話以外の連絡手段も用意しました。", "Утаснаас өөр холбоо барих аргыг ч бэлдсэн.", "We also prepared a way to get in touch other than by phone."],
    ["処理", "しょり", "боловсруулалт; шийдвэрлэлт", "processing; handling", "N2", "申し込みは到着した順に処理します。", "Ирсэн дарааллаар нь бүртгэлийг боловсруулна.", "Applications will be processed in the order they arrive."],
    ["反応", "はんのう", "хариу үйлдэл; хариу", "reaction; response", "N2", "質問に対する参加者の反応を記録しました。", "Асуултад оролцогчдын өгсөн хариу үйлдлийг тэмдэглэсэн.", "We recorded participants’ reactions to the questions."],
    ["確保", "かくほ", "баталгаажуулж авах; хангах", "secure; ensure", "N2", "会場を確保するため、早めに予約しました。", "Танхимаа баталгаажуулахын тулд эрт захиалсан.", "We booked early to secure the venue."],
    ["公開", "こうかい", "нийтэд нээлттэй болгох", "release; make public", "N2", "調査結果は来月公開される予定です。", "Судалгааны үр дүнг ирэх сард нийтэд танилцуулахаар төлөвлөсөн.", "The survey results are scheduled to be released next month."],
    ["評価", "ひょうか", "үнэлгээ; үнэлэх", "evaluation; assessment", "N2", "作品の評価は見る人によって異なります。", "Бүтээлийн үнэлгээ үзэгч бүрээс шалтгаалан өөр байдаг.", "The evaluation of a work differs from person to person."],
    ["実態", "じったい", "бодит байдал; бодит нөхцөл", "actual state; reality", "N2", "現場の実態を知るため、担当者に話を聞きました。", "Бодит нөхцөлийг мэдэхийн тулд хариуцсан хүнтэй ярилцсан.", "We spoke with the person in charge to understand the actual situation."],
    ["役割", "やくわり", "үүрэг; роль", "role", "N2", "それぞれの役割を決めてから作業を始めましょう。", "Хүн бүрийн үүргийг тогтоосны дараа ажлаа эхэлье.", "Let’s decide everyone’s role before we start working."],
    ["資料", "しりょう", "материал; баримт бичиг", "materials; documents", "N2", "会議の資料を前日までに共有してください。", "Хурлын материалыг өмнөх өдөр гэхэд хуваалцаарай.", "Please share the meeting materials by the day before."],
    ["費用", "ひよう", "зардал; өртөг", "cost; expense", "N2", "予算と費用を比べてから方法を検討しました。", "Төсөв, зардлыг харьцуулсны дараа аргаа судалсан.", "We compared the budget and costs before considering an approach."],
    ["調整", "ちょうせい", "зохицуулалт; тааруулах", "adjustment; coordination", "N2", "参加者の希望に合わせて時間を調整します。", "Оролцогчдын хүсэлтэд тааруулан цагийг зохицуулна.", "We will adjust the time to fit the participants’ preferences."]
  ];

  var extraGrammar = [
    { tag: "27", title: ["Өөрчлөлттэй хамт өөрчлөгдөх", "Describe linked changes", "変化に伴う変化を表す"], jp: "利用者が増えるに伴って、問い合わせも多くなりました。", reading: "りようしゃが ふえるに ともなって、といあわせも おおく なりました。", mn: "Хэрэглэгч нэмэгдэхийн хэрээр лавлагаа ч олширсон. 「に伴って」 нь нэг өөрчлөлттэй зэрэгцэн нөгөө өөрчлөлт гарахыг илэрхийлнэ.", en: "As the number of users grew, inquiries also increased. 「に伴って」 links two related changes.", ja: "「に伴って」は、ある変化と一緒に別の変化が起こることを表します。", grammar: "Нэр үг / үйл явдал + に伴って · ...тай зэрэгцэн", grammarEn: "Noun / change + に伴って · along with", grammarJa: "名詞・変化 + に伴って · 〜と一緒に変化する" },
    { tag: "28", title: ["Сэдвийн хүрээг заах", "Specify a topic or subject area", "話題や対象を示す"], jp: "新しい制度に関して、説明会を開きます。", reading: "あたらしい せいどに かんして、せつめいかいを ひらきます。", mn: "Шинэ тогтолцооны талаар танилцуулга хийнэ. 「に関して」 нь ярих, бичих сэдвийг албан ёсоор заана.", en: "We will hold an information session concerning the new system. 「に関して」 marks the subject formally.", ja: "「に関して」は、説明や話し合いの対象を表す改まった表現です。", grammar: "Нэр үг + に関して · ...ны талаар", grammarEn: "Noun + に関して · concerning / regarding", grammarJa: "名詞 + に関して · 〜について" },
    { tag: "29", title: ["Албан орчин, салбарыг заах", "Refer to a formal setting or field", "場面・分野を示す"], jp: "この研究は、地域の交通問題において重要な役割を果たしています。", reading: "この けんきゅうは、ちいきの こうつうもんだいに おいて じゅうような やくわりを はたしています。", mn: "Энэ судалгаа орон нутгийн тээврийн асуудалд чухал үүрэг гүйцэтгэж байна. 「において」 нь 「で」-гийн албан хэлбэр.", en: "This research plays an important role in local transportation issues. 「において」 is a formal equivalent of “in/at.”", ja: "「において」は、場所・分野・状況を示す「で」の改まった表現です。", grammar: "Нэр үг + において · ...д / ...ын хүрээнд", grammarEn: "Noun + において · in / at / within", grammarJa: "名詞 + において · 〜で（改まった表現）" },
    { tag: "30", title: ["Урт хугацаа, өргөн хүрээг заах", "Describe a span or broad extent", "期間・範囲の広がりを表す"], jp: "調査は三か月にわたって実施されました。", reading: "ちょうさは さんかげつに わたって じっしされました。", mn: "Судалгааг гурван сарын турш хийсэн. 「にわたって」 нь хугацаа эсвэл хамрах хүрээний үргэлжлэлийг онцолно.", en: "The survey was carried out over a period of three months. 「にわたって」 marks an extended span or range.", ja: "「にわたって」は、時間や範囲が広く続くことを表します。", grammar: "Хугацаа / хамрах хүрээ + にわたって · ...ын турш", grammarEn: "Time / range + にわたって · over / throughout", grammarJa: "期間・範囲 + にわたって · 〜の間ずっと" },
    { tag: "31", title: ["Маргаан, хэлэлцүүлгийн сэдэв", "Name a topic under debate", "議論の対象を示す"], jp: "新しい計画をめぐって、住民の間で意見が分かれています。", reading: "あたらしい けいかくを めぐって、じゅうみんの あいだで いけんが わかれています。", mn: "Шинэ төлөвлөгөөний талаар оршин суугчдын санал зөрж байна. 「をめぐって」 нь маргаан, хэлэлцүүлгийн тойрсон сэдвийг заана.", en: "Residents are divided over the new plan. 「をめぐって」 introduces the subject of a dispute or discussion.", ja: "「をめぐって」は、議論や対立の中心となる話題を示します。", grammar: "Нэр үг + をめぐって · ...ны талаар маргалдан", grammarEn: "Noun + をめぐって · over / concerning", grammarJa: "名詞 + をめぐって · 〜について議論する" },
    { tag: "32", title: ["...хийгээгүй бол мэдэх боломжгүй", "Say something cannot be known unless", "〜しないと分からないと述べる"], jp: "実際に使ってみないことには、この機能の便利さは分かりません。", reading: "じっさいに つかってみないことには、この きのうの べんりさは わかりません。", mn: "Бодитоор хэрэглэж үзээгүй бол энэ функцийн ашигтай эсэхийг мэдэхгүй. 「ないことには」 нь нэг нөхцөл биелэхгүй бол дүгнэж болохгүйг илтгэнэ.", en: "Unless you try it, you cannot know how useful this feature is. 「ないことには」 marks a necessary condition.", ja: "「ないことには」は、それをしなければ判断できないという条件を表します。", grammar: "Үйл үгийн ない хэлбэр + ことには · ...хгүй бол", grammarEn: "Verb ない-form + ことには · unless", grammarJa: "動詞ない形 + ことには · 〜しなければ" },
    { tag: "33", title: ["Боломжтой байсан бол гэсэн таамаг", "Imagine what one would do if possible", "実現が難しい仮定を表す"], jp: "やり直せるものなら、最初に戻って計画を立てたいです。", reading: "やりなおせる ものなら、さいしょに もどって けいかくを たてたいです。", mn: "Дахин хийх боломжтой байсан бол эхнээс нь төлөвлөгөө гаргамаар байна. 「ものなら」 нь биелэхэд хэцүү хүсэл, таамгийг илтгэнэ.", en: "If I could do it over, I would go back to the beginning and make a plan. 「ものなら」 expresses a difficult or unlikely hypothetical.", ja: "「ものなら」は、実現しにくい仮定や願望を表します。", grammar: "Боломжийн хэлбэр + ものなら · ...чадахсан бол", grammarEn: "Potential form + ものなら · if one could", grammarJa: "可能形 + ものなら · できるなら" },
    { tag: "34", title: ["Хүлээлтийн эсрэг үр дүн", "Describe a result contrary to expectations", "予想に反する結果を表す"], jp: "予想に反して、試験の申し込みは早く締め切られました。", reading: "よそうに はんして、しけんの もうしこみは はやく しめきられました。", mn: "Таамгаас зөрж, шалгалтын бүртгэл эрт хаагдсан. 「に反して」 нь хүлээлт, дүрэм эсвэл хүсэлтэй зөрөхийг илэрхийлнэ.", en: "Contrary to expectations, registration for the exam closed early. 「に反して」 marks a result against an expectation or rule.", ja: "「に反して」は、予想・規則・希望と違うことを表します。", grammar: "Нэр үг + に反して · ...ын эсрэгээр", grammarEn: "Noun + に反して · contrary to", grammarJa: "名詞 + に反して · 予想や規則と逆に" },
    { tag: "35", title: ["Албан үйл ажиллагааны үеийг заах", "Refer to the occasion of a formal event", "改まった機会を示す"], jp: "利用を開始するに際して、利用規約をご確認ください。", reading: "りようを かいしするに さいして、りようきやくを ごかくにんください。", mn: "Ашиглаж эхлэхийн өмнө үйлчилгээний нөхцөлтэй танилцана уу. 「に際して」 нь албан үйл явдлын үе, боломжийг заана.", en: "Please review the terms when you begin using the service. 「に際して」 is a formal expression for the occasion of an event.", ja: "「に際して」は、改まった行為を始める時や機会を表します。", grammar: "Үйл үгийн толь бичгийн хэлбэр + に際して · ...х үед", grammarEn: "Verb dictionary form + に際して · on the occasion of", grammarJa: "動詞辞書形 + に際して · 〜する時に" },
    { tag: "36", title: ["Тухайн чадварын тухайд онцгой сайн", "Say someone excels when it comes to", "ある分野で特に優れていると述べる"], jp: "彼女は日本の歴史にかけては、誰より詳しいです。", reading: "かのじょは にほんの れきしに かけては、だれより くわしいです。", mn: "Тэр япон түүхийн тухайд хэнээс ч илүү мэдлэгтэй. 「にかけては」 нь тодорхой салбарын чадварыг онцолно.", en: "When it comes to Japanese history, she knows more than anyone. 「にかけては」 highlights a particular area of strength.", ja: "「にかけては」は、ある分野について特に優れていることを表します。", grammar: "Нэр үг + にかけては · ...ын тухайд бол", grammarEn: "Noun + にかけては · when it comes to", grammarJa: "名詞 + にかけては · 〜の分野では特に" }
  ];

  if (typeof WORDS !== "undefined") {
    var knownWords = new Set(WORDS.map(function (row) { return row.jp; }));
    extraWords.forEach(function (row) {
      if (!knownWords.has(row[0])) {
        WORDS.push({ jp: row[0], reading: row[1], mn: row[2], en: row[3], level: row[4], example: row[5], exMn: row[6], exEn: row[7] });
        knownWords.add(row[0]);
      }
    });
  }
  if (typeof MORE_LESSONS !== "undefined" && MORE_LESSONS.N2) {
    var knownLessons = new Set(MORE_LESSONS.N2.map(function (lesson) { return lesson.tag; }));
    extraGrammar.forEach(function (lesson) {
      if (!knownLessons.has(lesson.tag)) { MORE_LESSONS.N2.push(lesson); knownLessons.add(lesson.tag); }
    });
  }

  var reading = [
    {
      id: "read-n2-buswork", level: "N2",
      passage: {
        jp: "市は来月、駅前のバス乗り場を改修する。工事中は二つの乗り場が使えなくなるため、北側の臨時停留所を利用してほしい。通勤時間帯は混雑が予想されるが、通常より早い便を増やす予定はない。市は「出発時刻を変えるのではなく、乗り場を確認して余裕を持って来てほしい」と呼びかけている。",
        kana: "しはらいげつ、 えきまえのばすのりばをかいしゅうする。 こうじちゅうはふたつののりばがつかえなくなるため、 きたがわのりんじていりゅうしょをりようしてほしい。 つうきんじかんたいはこんざつがよそうされるが、 つうじょうよりはやいびんをふやすよていはない。 しは「しゅっぱつじこくをかえるのではなく、 のりばをかくにんしてよゆうをもってきてほしい」とよびかけている。",
        translation: {
          mn: "Хот ирэх сараас буудлын урд талын автобусны зогсоолыг засна. Ажлын үеэр хоёр зогсоол ашиглах боломжгүй тул хойд талын түр зогсоолыг ашиглана уу. Ажилдаа явах цагт хүн ихтэй байх төлөвтэй ч ердийнхөөс эрт явах автобус нэмэхгүй. Хот явах цагаа өөрчлөх бус, зогсоолын байршлыг шалгаж, цагийн нөөцтэй ирэхийг хүсжээ.",
          en: "Next month the city will renovate the bus stops in front of the station. Two stops will be unavailable during construction, so passengers should use the temporary stop on the north side. Crowding is expected during commuting hours, but no earlier buses will be added. The city asks passengers to check the stop and allow extra time rather than change their departure time.",
          ja: "市は来月、駅前のバス乗り場を改修します。工事中は二つの乗り場が使えないため、北側の臨時停留所を利用してください。通勤時間帯は混雑しますが、早い便は増やしません。市は時刻を変えるのではなく、乗り場を確認して余裕を持って来るよう呼びかけています。"
        }
      },
      ask: { mn: "Хот автобус зорчигчдоос юуг хүссэн бэ?", en: "What does the city ask bus passengers to do?", ja: "市はバスの利用者に何を求めていますか。" },
      options: {
        mn: ["Ердийн автобусны цагийг өөрчлөх", "Хойд талын түр зогсоолыг шалгаж, цагийн нөөцтэй ирэх", "Өглөө автобус нэмэхийг хүлээх", "Засвар дуустал галт тэргээр явах"],
        en: ["Change the usual bus timetable", "Check the temporary north-side stop and allow extra time", "Wait for more morning buses", "Use the train until construction ends"],
        ja: ["通常のバスの時刻を変える", "北側の臨時停留所を確認し、余裕を持って来る", "朝の便が増えるのを待つ", "工事中は電車を利用する"]
      },
      correct: 1,
      explain: { mn: "Хотын хүсэлт нь 「зогсоолыг шалгаж, цагийн нөөцтэй ирэх」; автобусны цагийг өөрчлөхгүй.", en: "The notice asks passengers to check the stop location and leave extra time; it does not announce additional buses.", ja: "市は、乗り場を確認して時間に余裕を持つよう呼びかけています。便を増やすとは書かれていません。" }
    },
    {
      id: "read-n2-cafeteria", level: "N2",
      passage: {
        jp: "大学の食堂では、混雑を減らすために受け取り口を一つ増やした。昼休みの待ち時間は短くなったが、食べ残しの量は変わらなかった。調査した職員は、席を増やすだけでは問題は解決しないと考え、曜日ごとの注文数と残った料理の種類を記録することにした。次の学期は、その記録を基にメニューの量を調整する予定だ。食堂では日によって注文数が大きく違うため、残った料理の量だけを見て一律に減らすと、人気の品が早く売り切れるおそれがある。職員は曜日ごとの記録を続け、混雑と食べ残しの両方を減らせる方法を探す。",
        kana: "だいがくのしょくどうでは、 こんざつをへらすためにうけとりくちをひとつふやした。 ひるやすみのまちじかんはみじかくなったが、 たべのこしのりょうはかわらなかった。 ちょうさしたしょくいんは、 せきをふやすだけではもんだいはかいけつしないとかんがえ、 ようびごとのちゅうもんかずとのこったりょうりのしゅるいをきろくすることにした。 つぎのがっきは、 そのきろくをもとにめにゅーのりょうをちょうせいするよていだ。 しょくどうではにちによってちゅうもんかずがおおきくちがうため、 のこったりょうりのりょうだけをみていちりつにへらすと、 にんきのひんがはやくうりきれるおそれがある。 しょくいんはようびごとのきろくをつづけ、 こんざつとたべのこしのりょうほうをへらせるほうほうをさがす。",
        translation: {
          mn: "Их сургуулийн хоолны газарт дарааллыг багасгахын тулд хоол авах цэг нэмжээ. Өдрийн завсарлагаар хүлээх хугацаа богино болсон ч үлдсэн хоолны хэмжээ өөрчлөгдөөгүй. Судалгаа хийсэн ажилтан зөвхөн суудал нэмэхэд асуудал шийдэгдэхгүй гэж үзээд, гараг бүрийн захиалгын тоо болон үлдсэн хоолны төрлийг тэмдэглэхээр болов. Дараагийн улиралд тэр мэдээлэлд үндэслэн хоолны хэмжээг тохируулна. Өдөр бүрийн захиалгын тоо ялгаатай тул үлдсэн хоолны хэмжээг хараад бүх порцыг ижил бууруулбал эрэлттэй хоол эрт дуусаж магадгүй. Ажилтнууд гараг бүрийн бүртгэлийг үргэлжлүүлж, дараалал болон хоолны үлдэгдлийг хамтад нь багасгах аргыг хайна.",
          en: "A university cafeteria added a pickup counter to reduce congestion. The lunch wait became shorter, but the amount of leftover food did not change. Staff concluded that adding seats alone would not solve the problem, so they will record orders by day and which dishes remain. Next term they plan to adjust portions using those records. Orders vary by day, so reducing every portion based only on leftovers could make popular dishes sell out early. Staff will continue tracking each weekday and look for a way to reduce both queues and food waste.",
          ja: "大学の食堂は混雑対策として受け取り口を増やしました。待ち時間は短くなりましたが、食べ残しは減りませんでした。職員は曜日ごとの注文数と残った料理を記録し、次の学期にその情報を基に量を調整する予定です。曜日によって注文数が異なるため、食べ残しだけを見て一律に量を減らすと、人気の料理が早く売り切れるおそれがあります。職員は記録を続け、混雑と食べ残しの両方を減らす方法を探します。"
        }
      },
      ask: { mn: "Ажилтнууд захиалга болон үлдсэн хоолыг яагаад тэмдэглэхээр болсон бэ?", en: "Why will staff record orders and leftover dishes?", ja: "職員が注文数や食べ残しを記録するのはなぜですか。" },
      options: {
        mn: ["Хоолны газрын ажлын цагийг сунгахын тулд", "Дараагийн улиралд хоолны хэмжээг бодит эрэлтэд тааруулахын тулд", "Шинэ цэг ажиллахгүй байгааг батлахын тулд", "Оюутнуудын суудлыг дахин хуваарилахын тулд"],
        en: ["To extend the cafeteria’s opening hours", "To adjust portions to actual demand next term", "To prove the new counter does not work", "To rearrange students’ seats"],
        ja: ["食堂の営業時間を延ばすため", "次の学期に料理の量を実際の需要に合わせるため", "新しい受け取り口が役に立たないと示すため", "学生の席を配置し直すため"]
      },
      correct: 1,
      explain: { mn: "Тэмдэглэсэн мэдээллээр дараагийн улиралд хоолны хэмжээг тохируулна гэжээ.", en: "The passage says the records will be used to adjust menu quantities next term.", ja: "記録を基に、次の学期にメニューの量を調整するとあります。" }
    },
    {
      id: "read-n2-online-meeting", level: "N2",
      passage: {
        jp: "オンライン会議は移動時間を減らせるため、遠くの人も参加しやすい。一方、発言の少ない人が意見を伝えにくく、議論が一部の参加者に偏ることもある。会議をオンラインにするかどうかだけでなく、発言を順番に促すなど、参加方法を設計することが大切だ。形式を変えるだけで、話し合いが自動的に良くなるわけではない。\nたとえば、会議の前に短いフォームで意見を集め、当日は進行役がまだ発言していない人に順番に声をかける方法がある。会議後に決定事項、担当者、期限を共有すれば、参加できなかった人も経緯を確かめやすい。ただし、全員に同じ時間だけ話してもらうと、内容が重なり、議論が予定より長くなることがある。出席者が多い場合は、小さなグループで先に論点を整理してから全体で共有すると、限られた時間でも意見を比べやすい。会議の目的に合わせて事前提出と当日の話し合いを組み合わせることが、形式を変える以上に重要だ。さらに、議題ごとに使う資料を事前に共有し、意見を出す時間と決定する時間を分ければ、話題が横にそれにくくなる。参加者の反応を見て手順を少しずつ直し、オンラインに向く議題と対面が必要な議題を分けることもできる。",
        kana: "おんらいんかいぎはいどうじかんをへらせるため、 とおくのにんもさんかしやすい。 いっぽう、 はつげんのすくないにんがいけんをつたえにくく、 ぎろんがいちぶのさんかしゃにかたよることもある。 かいぎをおんらいんにするかどうかだけでなく、 はつげんをじゅんばんにうながすなど、 さんかほうほうをせっけいすることがたいせつだ。 けいしきをかえるだけで、 はなしあいがじどうてきによくなるわけではない。 たとえば、 かいぎのまえにみじかいふぉーむでいけんをあつめ、 とうじつはしんこうやくがまだはつげんしていないにんにじゅんばんにこえをかけるほうほうがある。 かいぎのちにけっていじこう、 たんとうしゃ、 きげんをきょうゆうすれば、 さんかできなかったにんもけいいをたしかめやすい。 ただし、 ぜんいんにおなじじかんだけはなしてもらうと、 ないようがかさなり、 ぎろんがよていよりながくなることがある。 しゅっせきしゃがおおいばあいは、 ちいさなぐるーぷでさきにろんてんをせいりしてからぜんたいできょうゆうすると、 かぎられたじかんでもいけんをくらべやすい。 かいぎのもくてきにあわせてじぜんていしゅつととうじつのはなしあいをくみあわせることが、 けいしきをかえるいじょうにじゅうようだ。 さらに、 ぎだいごとにつかうしりょうをじぜんにきょうゆうし、 いけんをだすじかんとけっていするじかんをわければ、 わだいがよこにそれにくくなる。 さんかしゃのはんのうをみててじゅんをすこしずつなおし、 おんらいんにむくぎだいとたいめんがひつようなぎだいをわけることもできる。",
        translation: {
          mn: "Онлайнаар хуралдвал зорчих хугацаа багасаж, хол байгаа хүмүүс ч оролцоход хялбар. Нөгөө талаар бага ярьдаг хүмүүс санаагаа хэлж чадахгүй, хэлэлцүүлэг зарим оролцогчид төвлөрөх тохиолдол бий. Хурлыг онлайнаар хийх эсэхээс гадна оролцогчдыг ээлжээр санал хэлүүлэх зэрэг оролцооны аргыг төлөвлөх нь чухал. Хэлбэрийг өөрчиллөө гээд хэлэлцүүлэг өөрөө сайжрахгүй. Жишээлбэл, хурлын өмнө богино маягтаар санал цуглуулж, уулзалтын үеэр хөтлөгч хараахан үг хэлээгүй хүмүүсийг ээлжээр оролцуулж болно. Дараа нь шийдвэр, хариуцах хүн, хугацааг хуваалцвал оролцоогүй хүн ч явцыг мэдэж авна. Харин хүн бүрт адил хугацаа өгөхөд санал давхардаж, хэлэлцүүлэг сунжирч болно. Оролцогч олон бол эхлээд жижиг бүлгээр асуудлаа цэгцлээд, дараа нь нийтээр хуваалцвал хязгаарлагдмал хугацаанд санааг харьцуулахад амар. Хурлын зорилгод тохируулан урьдчилсан санал, тухайн өдрийн ярилцлагыг хослуулах нь хэлбэрээ солихоос чухал. Хэлэлцэх сэдвийн материалыг урьдчилан хуваалцаж, санал гаргах болон шийдвэрлэх цагийг ялгавал яриа сэдвээсээ хазайх нь багасна. Оролцогчдын хариуг харж аргачлалаа засаж, цахимаар хэлэлцэхэд тохирох сэдэв болон нүүр тулан уулзах шаардлагатай сэдвийг ялгаж болно.",
          en: "Online meetings reduce travel time and make it easier for distant participants to join. However, quieter people may find it hard to share opinions, and discussion can become dominated by a few people. What matters is not only whether a meeting is online, but also how participation is designed—for example, inviting people to speak in turn. Changing the format alone does not automatically improve discussion. For example, a short form can gather opinions before a meeting, and the facilitator can invite people who have not spoken to contribute in turn. Sharing decisions, owners, and deadlines afterward also helps those who could not attend follow the discussion. However, giving everyone the same amount of speaking time can lead to repeated points and make a meeting run long. With many attendees, small groups can first organize the issues and then report back, making it easier to compare views in limited time. Matching advance submissions and live discussion to the meeting’s purpose matters more than changing the format alone. Sharing materials in advance and separating discussion from decision time can keep a meeting on track. The team can adjust its process in response to participants and distinguish topics suited to online discussion from those needing an in-person meeting.",
          ja: "オンライン会議には移動時間を減らせる利点がありますが、発言しにくい人がいるという課題もあります。形式を選ぶだけでなく、順番に発言を促すなど、参加しやすい方法を設計することが大切です。 例えば、会議の前に短いフォームで意見を集め、当日は進行役がまだ発言していない人に順番に声をかける方法があります。会議後に決定事項、担当者、期限を共有すれば、参加できなかった人も経緯を確認できます。ただし、全員に同じ時間だけ話してもらうと、内容が重なって会議が長引く場合があります。出席者が多いときは小グループで先に論点を整理してから全体で共有すると、限られた時間でも意見を比べやすくなります。会議の目的に合わせて事前提出と当日の話し合いを組み合わせることが重要です。資料を先に共有し、意見を出す時間と決定する時間を分けると、議論がそれにくくなります。参加者の反応を見て手順を調整し、オンラインに向く議題と対面で話す議題を分けることもできます。"
        }
      },
      ask: { mn: "Зохиогчийн гол санаа юу вэ?", en: "What is the writer’s main point?", ja: "筆者が最も伝えたいことは何ですか。" },
      options: {
        mn: ["Бүх хурлыг танхимаар хийх ёстой", "Онлайн хурал зорчих хугацааг хэзээ ч хэмнэдэггүй", "Хурлын хэлбэрээс гадна хүн бүр оролцох аргыг бодох хэрэгтэй", "Бага ярьдаг хүмүүс хурлаас гарах хэрэгтэй"],
        en: ["All meetings should be held in person", "Online meetings never save travel time", "Along with the format, plan ways for everyone to participate", "Quieter participants should leave the meeting"],
        ja: ["すべての会議を対面で行うべきだ", "オンライン会議では移動時間を節約できない", "形式だけでなく、全員が参加しやすい方法を考えるべきだ", "発言の少ない人は会議から出るべきだ"]
      },
      correct: 2,
      explain: { mn: "Сүүлийн хэсэгт хэлбэр өөрчлөхөөс гадна хүн бүрийн оролцоог төлөвлөх хэрэгтэй гэж дүгнэжээ.", en: "The writer concludes that meeting format is not enough; participation needs to be designed too.", ja: "筆者は、会議の形式だけでなく、参加方法を設計することが重要だと述べています。" }
    },
    {
      id: "read-n2-course-options", level: "N2",
      passage: {
        jp: "地域講座の案内：A講座は第1・第3火曜日の18時30分から20時まで、市民センターで行う。受講料は一回800円で、欠席時の振り替えはできない。B講座は第2・第4木曜日の19時から20時30分まで、オンラインで行う。受講料は一回1,000円で、録画を三日間視聴できる。どちらも申し込みは今月20日まで。\n【定員・結果】Aは20人、Bは15人までで、定員を超えた場合は抽選する。結果は今月23日までにメールで知らせる。両方の講座に申し込むことはできるが、申し込みは講座ごとに行うこと。受講を取り消す場合は、申し込み締め切りまでに連絡する。\n【欠席・録画】Aの配布資料は受講者専用ページから翌週末まで見られるが、講師の説明を録画する予定はない。Bの録画は授業の翌日から三日間視聴でき、期間が終わった後に個別に再公開することはできない。欠席した回の質問は、次回の授業前に担当者へメールで送る。\n【受講後】最終回に短いアンケートを配布し、次回に取り上げてほしい内容を記入できる。開講日や内容に変更がある場合は、登録した連絡先へメールで知らせる。\n【問い合わせ】参加方法や日程に質問がある場合は、希望する講座名を添えて事務局へメールする。教室参加が難しくなっても、AからBへ直接変更はできない。いったん申し込みを取り消し、Bに空席があれば改めて申し込む。Bの録画はBの受講者だけが視聴できる。",
        kana: "ちいきこうざのあんない：Aこうざはだい1・だい3かようびの18じ30わから20じまで、 しみんせんたーでおこなう。 じゅこうりょうはいっかい800えんで、 けっせきときのふりかえはできない。 Bこうざはだい2・だい4もくようびの19じから20じ30ふんまで、 おんらいんでおこなう。 じゅこうりょうはいっかい1,000えんで、 ろくがをみっかかんしちょうできる。 どちらももうしこみはこんげつ20にちまで。 【ていいん・けっか】Aは20にん、 Bは15にんまでで、 ていいんをこえたばあいはちゅうせんする。 けっかはこんげつ23にちまでにめーるでしらせる。 りょうほうのこうざにもうしこむことはできるが、 もうしこみはこうざごとにおこなうこと。 じゅこうをとりけすばあいは、 もうしこみしめきりまでにれんらくする。 【けっせき・ろくが】Aのはいふしりょうはじゅこうしゃせんようぺーじからよくしゅうまつまでみられるが、 こうしのせつめいをろくがするよていはない。 Bのろくがはじゅぎょうのよくじつからみっかかんしちょうでき、 きかんがおわったのちにこべつにさいこうかいすることはできない。 けっせきしたかいのしつもんは、 じかいのじゅぎょうまえにたんとうしゃへめーるでおくる。 【じゅこうのち】さいしゅうかいにみじかいあんけーとをはいふし、 じかいにとりあげてほしいないようをきにゅうできる。 かいこうにちやないようにへんこうがあるばあいは、 とうろくしたれんらくさきへめーるでしらせる。 【といあわせ】さんかほうほうやにっていにしつもんがあるばあいは、 きぼうするこうざめいをそえてじむきょくへめーるする。 きょうしつさんかがむずかしくなっても、 AからBへちょくせつへんこうはできない。 いったんもうしこみをとりけし、 Bにくうせきがあればあらためてもうしこむ。 BのろくがはBのじゅこうしゃだけがしちょうできる。",
        translation: {
          mn: "Орон нутгийн сургалт: A сургалт сарын эхний ба гурав дахь Мягмар гарагт 18:30–20:00 цагт иргэдийн төвд болно. Нэг удаагийн төлбөр 800 иен, тасалсан тохиолдолд нөхөж суух боломжгүй. B сургалт сарын хоёр дахь ба дөрөв дэх Пүрэв гарагт 19:00–20:30 цагт онлайнаар болно. Нэг удаа 1,000 иен бөгөөд бичлэгийг гурван өдөр үзэж болно. Аль алинд нь энэ сарын 20 хүртэл бүртгүүлнэ. 【Суудлын тоо, хариу】A сургалт 20, B сургалт 15 хүний багтаамжтай. Хэтэрвэл сугалаагаар сонгоно. Хариуг энэ сарын 23 хүртэл имэйлээр мэдэгдэнэ. Хоёр сургалтад зэрэг бүртгүүлж болох ч тус бүрд нь хүсэлт явуулна. Оролцохоо болих бол бүртгэлийн хугацаанд мэдэгдэнэ.\n【Таслалт, бичлэг】A-ийн материалыг суралцагчдын хуудсаас дараагийн долоо хоногийн сүүл хүртэл үзэж болох ч багшийн тайлбарыг бичихгүй. B-ийн бичлэгийг хичээлийн маргаашаас гурван өдөр үзнэ; хугацаа дууссаны дараа тусгайлан дахин нээх боломжгүй. Тасалсан хичээлийн асуултыг дараагийн уулзалтаас өмнө хариуцсан хүнд имэйлээр явуулна.\n【Сургалтын дараа】Сүүлийн өдөр богино санал асуулга авч, дараагийн удаа үзэх сэдвээ бичиж болно. Эхлэх өдөр эсвэл агуулга өөрчлөгдвөл бүртгүүлсэн хаягт имэйл илгээнэ. 【Лавлагаа】Оролцох арга, хуваарийн талаар асуухдаа хүссэн сургалтын нэрийг бичиж ажлын албанд имэйл явуулна. Танхимаар суух боломжгүй болсон ч A сургалтаас B рүү шууд шилжихгүй; эхлээд цуцлаад, B-д сул суудал байвал дахин бүртгүүлнэ. B-ийн бичлэгийг зөвхөн B-д бүртгүүлсэн хүн үзнэ.",
          en: "Community courses: Course A meets on the first and third Tuesdays, 6:30–8:00 p.m., at the community center. It costs 800 yen per session; missed classes cannot be made up. Course B meets on the second and fourth Thursdays, 7:00–8:30 p.m., online. It costs 1,000 yen per session, and recordings are available for three days. Both courses accept applications through the 20th of this month. 【Capacity and results】Course A has 20 places and Course B has 15; a lottery will be used if either is oversubscribed. Results will be emailed by the 23rd of this month. You may apply for both courses, but submit a separate application for each. If you need to withdraw, contact the organizer by the application deadline.\n【Absences and recordings】Course A handouts remain on the participant page through the following weekend, but the instructor’s explanations will not be recorded. Course B recordings are available for three days starting the day after class and cannot be reopened individually after that period. Email questions about an absence to the coordinator before the next class.\n【After the course】A short survey will be distributed at the final session so participants can suggest future topics. Any change to the dates or content will be sent to the registered email address. For questions about participation or dates, email the office and include the course name. If you can no longer attend Course A in person, you cannot switch directly to B; cancel first and reapply if B has space. Only Course B participants may view its recording.",
          ja: "地域講座の案内です。A講座は第1・第3火曜日に市民センターで行い、欠席分の振り替えはできません。B講座は第2・第4木曜日にオンラインで行い、録画を三日間見られます。申し込みはどちらも今月20日までです。 【定員と結果】Aは20人、Bは15人までです。定員を超えた場合は抽選し、結果は今月23日までにメールで知らせます。両方に申し込めますが、講座ごとに手続きしてください。受講を取り消す場合は締め切りまでに連絡します。\n【欠席と録画】Aの資料は受講者ページで翌週末まで見られますが、講師の説明は録画しません。Bの録画は授業の翌日から三日間視聴でき、その後は個別に再公開できません。欠席した回の質問は次の授業前に担当者へメールで送ります。\n【受講後】最終回にアンケートを配布し、次回に希望する内容を記入できます。日程や内容に変更があれば、登録先へメールで知らせます。参加方法や日程について質問する場合は、希望する講座名を添えて事務局へメールしてください。Aに通えなくなってもBへ直接変更はできません。いったん取り消し、Bに空席があれば改めて申し込みます。Bの録画はBの受講者だけが視聴できます。"
        }
      },
      ask: { mn: "Өөрийн очих боломжгүй, Пүрэв гарагийн орой л сурах боломжтой хүн аль сургалтыг сонгох вэ?", en: "Which course suits someone who cannot travel and is only free on Thursday evenings?", ja: "会場に行けず、木曜日の夜だけ参加できる人に合う講座はどれですか。" },
      options: {
        mn: ["A сургалт; иргэдийн төвд болдог", "B сургалт; Пүрэв гарагт онлайнаар болдог", "Аль аль нь; зөвхөн бичлэгтэй", "Аль нь ч биш; бүртгэл аль хэдийн хаагдсан"],
        en: ["Course A; it meets at the community center", "Course B; it meets online on Thursdays", "Either course; both are recordings only", "Neither; registration has already closed"],
        ja: ["市民センターで行うA講座", "木曜日にオンラインで行うB講座", "録画だけの講座なので、どちらでもよい", "申し込みが終わっているので、どちらも選べない"]
      },
      correct: 1,
      explain: { mn: "B сургалт Пүрэв гарагийн орой онлайнаар тул очих боломжгүй хүнд тохирно.", en: "Course B is online on Thursday evenings, so it fits both constraints.", ja: "B講座は木曜日の夜にオンラインで行うため、条件に合います。" }
    },
    {
      id: "read-n2-training-notice", level: "N2",
      passage: {
        jp: "職員研修のお知らせ：研修は6月14日（金）13時から16時まで、第2会議室で行います。参加希望者は社内フォームから6月10日までに申し込んでください。事前に資料を読む必要はありませんが、当日は各自のパソコンを持参してください。申し込み後に参加できなくなった場合は、担当の佐藤までメールで連絡してください。",
        kana: "しょくいんけんしゅうのおしらせ：けんしゅうは6がつ14にち（きん）13じから16じまで、 だい2かいぎしつでおこないます。 さんかきぼうしゃはしゃないふぉーむから6がつ10にちまでにもうしこんでください。 じぜんにしりょうをよむひつようはありませんが、 とうじつはかくじのぱそこんをじさんしてください。 もうしこみのちにさんかできなくなったばあいは、 たんとうのさとうまでめーるでれんらくしてください。",
        translation: {
          mn: "Ажилтны сургалтын мэдэгдэл: Сургалт 6-р сарын 14-ний Баасан гарагт 13:00–16:00 цагт 2-р хурлын танхимд болно. Оролцохыг хүсвэл компанийн маягтаар 6-р сарын 10 хүртэл бүртгүүлнэ үү. Урьдчилан материал унших шаардлагагүй ч тухайн өдөр компьютерээ авчирна. Бүртгүүлсний дараа оролцох боломжгүй болсон бол хариуцсан Сатод имэйлээр мэдэгдэнэ үү.",
          en: "Staff training notice: Training will be held in Meeting Room 2 on Friday, June 14, from 1 to 4 p.m. Those who wish to attend should register using the company form by June 10. You do not need to read the materials beforehand, but bring your own computer. If you cannot attend after registering, email Sato, the coordinator.",
          ja: "職員研修は6月14日（金）13時から16時まで第2会議室で行います。参加希望者は6月10日までに社内フォームで申し込んでください。資料の事前確認は不要ですが、パソコンを持参してください。欠席する場合は担当者にメールで連絡してください。"
        }
      },
      ask: { mn: "Бүртгүүлсний дараа оролцож чадахгүй болсон хүн яах ёстой вэ?", en: "What should someone do if they cannot attend after registering?", ja: "申し込み後に参加できなくなった人はどうすればよいですか。" },
      options: {
        mn: ["Сургалтын өдөр танхимд хэлэх", "Материалыг уншаад оронд нь хүн явуулах", "Хариуцсан Сатод имэйл илгээх", "6-р сарын 10-наас өмнө маягтыг дахин бөглөх"],
        en: ["Tell the group in the meeting room on the day", "Read the materials and send a replacement", "Email Sato, the coordinator", "Submit the form again before June 10"],
        ja: ["当日に会議室で伝える", "資料を読んで代わりの人を出す", "担当の佐藤にメールで連絡する", "6月10日までにフォームを出し直す"]
      },
      correct: 2,
      explain: { mn: "Мэдэгдэлд оролцох боломжгүй бол хариуцсан Сатод имэйл бичихийг заасан.", en: "The notice says to email Sato if you become unable to attend.", ja: "参加できなくなった場合は、担当者にメールで連絡すると書かれています。" }
    },
    {
      id: "read-n2-library-hours", level: "N2",
      passage: {
        jp: "市立図書館は利用者を増やすため、昨年から閉館時間を一時間遅らせた。しかし、全体の利用者数はほとんど変わっていない。調べてみると、平日の夜は仕事帰りの利用者が増えた一方、午前中の利用は減っていた。担当者は、時間を延ばすか元に戻すかをすぐ決めるのではなく、年代や利用目的も調査してから、必要な時間帯を検討すべきだと話している。 たとえば、夜は仕事帰りに本を返したい会社員が多く、午前中は新聞や地域資料を探す人が目立ったという。利用する時間だけを見ても、必要なサービスの違いまでは分からない。予約や相談の記録も合わせて確認すれば、時間延長が役立った人をより具体的に把握できる。",
        kana: "しりつとしょかんはりようしゃをふやすため、 さくねんからへいかんじかんをいちじかんおくらせた。 しかし、 ぜんたいのりようしゃすうはほとんどかわっていない。 しらべてみると、 へいじつのよるはしごとかえりのりようしゃがふえたいっぽう、 ごぜんちゅうのりようはへっていた。 たんとうしゃは、 じかんをのばすかもとにもどすかをすぐきめるのではなく、 ねんだいやりようもくてきもちょうさしてから、 ひつようなじかんたいをけんとうすべきだとはなしている。 たとえば、 よるはしごとかえりにほんをかえしたいかいしゃいんがおおく、 ごぜんちゅうはしんぶんやちいきしりょうをさがすにんがめだったという。 りようするじかんだけをみても、 ひつようなさーびすのちがいまではわからない。 よやくやそうだんのきろくもあわせてかくにんすれば、 じかんえんちょうがやくたったにんをよりぐたいてきにはあくできる。",
        translation: {
          mn: "Хотын номын сан уншигчдыг нэмэхийн тулд өнгөрсөн жилээс хаах цагаа нэг цагаар хойшлуулжээ. Гэвч нийт хэрэглэгчийн тоо бараг өөрчлөгдөөгүй. Судлахад ажлын өдрийн орой ажил тараад ирдэг хүн нэмэгдсэн бол өглөөний хэрэглээ багассан байв. Хариуцсан хүн цагийг сунгах эсвэл буцаах шийдвэрийг шууд гаргалгүй, нас болон ашиглах зорилгыг судалсны дараа шаардлагатай цагийг тогтоох хэрэгтэй гэжээ. Жишээлбэл, орой ажлаасаа харихдаа ном буцаах хүн олон, харин өглөө сонин, орон нутгийн материал хайх хүн түлхүү байжээ. Зөвхөн ашигласан цагийг хараад хэрэгцээтэй үйлчилгээний ялгааг мэдэхгүй. Захиалга, зөвлөгөөний бүртгэлийг хамтад нь шалгавал цаг сунгаснаар хэнд тус болсныг тодорхой харж болно.",
          en: "To attract more visitors, the city library began closing an hour later last year. Overall visitor numbers have barely changed. On weekday evenings, more people now come after work, while morning use has declined. The manager says they should not immediately decide whether to keep or reverse the later closing time. They should first study users’ ages and purposes, then consider which hours are actually needed. For example, many evening visitors were workers returning books after work, while morning visitors often looked for newspapers or local materials. Visiting hours alone do not reveal which services people need. Checking reservation and consultation records as well would show more clearly whom the extended hours have helped.",
          ja: "市立図書館は閉館時間を一時間遅らせましたが、全体の利用者数はほとんど変わっていません。夜の利用が増え、午前中は減りました。担当者は、年代や利用目的を調べてから必要な時間帯を検討すべきだと述べています。 例えば、夜は仕事帰りに本を返す会社員が多く、午前中は新聞や地域資料を探す人が目立ったそうです。利用時間だけでは、必要なサービスの違いまでは分かりません。予約や相談の記録も確認すれば、時間延長が誰に役立ったかを把握しやすくなります。"
        }
      },
      ask: { mn: "Хариуцсан хүний санал болгож буй дараагийн алхам юу вэ?", en: "What does the manager recommend doing next?", ja: "担当者は次に何をすべきだと考えていますか。" },
      options: {
        mn: ["Номын санг шууд хаах", "Хаах цагийг одоо даруй хуучнаар нь болгох", "Хэрэглэгчдийн нас, зорилгыг судлаад хэрэгтэй цагийг шийдэх", "Зөвхөн нийт хэрэглэгчийн тоог дахин тоолох"],
        en: ["Close the library immediately", "Restore the old closing time at once", "Study users’ ages and purposes before deciding which hours are needed", "Count only the total number of visitors again"],
        ja: ["図書館をすぐ閉館する", "閉館時間を直ちに元に戻す", "利用者の年代や目的を調べて必要な時間を決める", "全体の利用者数だけをもう一度数える"]
      },
      correct: 2,
      explain: { mn: "Цагийн хуваарийг шууд өөрчлөхөөс өмнө хэрэглэгчдийн нас, зорилгыг судлахыг санал болгосон.", en: "The manager recommends studying who uses the library and why before making a schedule decision.", ja: "時間をすぐ決めず、利用者の年代や目的を調べてから検討すると述べています。" }
    }
  ];

  var listening = [
    {
      id: "listen-n2-bus-stop", level: "N2",
      dialogue: [
        { speaker: { mn: "Төлөвлөгч", en: "Planner", ja: "担当者" }, text: "駅前の工事ですが、来週から二つのバス乗り場が使えなくなります。" },
        { speaker: { mn: "Ажилтан", en: "Staff member", ja: "職員" }, text: "通勤時間帯は混雑しそうですね。早い便を増やしますか。" },
        { speaker: { mn: "Төлөвлөгч", en: "Planner", ja: "担当者" }, text: "便は増やしません。北側に臨時停留所を設けるので、案内を駅の入口にも貼ってください。" },
        { speaker: { mn: "Ажилтан", en: "Staff member", ja: "職員" }, text: "分かりました。乗り場の地図も一緒に掲示します。" }
      ],
      audio: "駅前の工事ですが、来週から二つのバス乗り場が使えなくなります。通勤時間帯は混雑しそうですね。早い便を増やしますか。便は増やしません。北側に臨時停留所を設けるので、案内を駅の入口にも貼ってください。分かりました。乗り場の地図も一緒に掲示します。",
      kana: "えきまえの こうじですが、らいしゅうから ふたつの バスのりばが つかえなく なります。つうきんじかんたいは こんざつしそうですね。はやい びんを ふやしますか。びんは ふやしません。きたがわに りんじていりゅうじょを もうけるので、あんないを えきの いりぐちにも はってください。わかりました。のりばの ちずも いっしょに けいじします。",
      translation: {
        mn: "—Буудлын урд засвар эхлэхээр ирэх долоо хоногоос хоёр автобусны зогсоол ашиглах боломжгүй болно. —Ажилдаа явах цагт хүн ихтэй болох нь. Эрт автобус нэмэх үү? —Нэмэхгүй. Хойд талд түр зогсоол гаргах тул зааврыг буудлын үүдэнд наана уу. —Ойлголоо. Зогсоолын газрын зургийг хамт байрлуулна.",
        en: "“Two bus stops in front of the station will be unavailable from next week because of construction.” “It may be crowded during commuting hours. Will you add earlier buses?” “No. A temporary stop will be set up on the north side, so please post a notice at the station entrance.” “Understood. I’ll display a map too.”",
        ja: "「来週から駅前の二つの乗り場が使えなくなります。」「通勤時間帯は混みそうですね。早い便を増やしますか。」「便は増やしません。北側に臨時停留所を設けるので、駅の入口にも案内を貼ってください。」「地図も一緒に掲示します。」"
      },
      ask: { mn: "Ажилтан ямар нэмэлт зүйл байрлуулахаар болов?", en: "What else will the staff member post?", ja: "職員は案内と一緒に何を掲示しますか。" },
      options: {
        mn: ["Автобусны шинэ цагийн хуваарь", "Зогсоолын газрын зураг", "Засварын төсөв", "Галт тэрэгний тасалбарын мэдээлэл"],
        en: ["A new bus timetable", "A map of the stops", "The construction budget", "Train ticket information"],
        ja: ["新しいバスの時刻表", "乗り場の地図", "工事の予算", "電車の切符の案内"]
      },
      correct: 1,
      explain: { mn: "Ажилтан 「乗り場の地図も一緒に掲示します」 гэж хэлсэн.", en: "The staff member says they will post a map of the stops as well.", ja: "職員は「乗り場の地図も一緒に掲示します」と言っています。" }
    },
    {
      id: "listen-n2-survey", level: "N2",
      dialogue: [
        { speaker: { mn: "Зохицуулагч", en: "Coordinator", ja: "担当者" }, text: "新しい窓口を開いてから、問い合わせの待ち時間は短くなりました。" },
        { speaker: { mn: "Судлаач", en: "Researcher", ja: "調査員" }, text: "ただ、同じ質問が何度も届いています。説明のページが見つけにくいのかもしれません。" },
        { speaker: { mn: "Зохицуулагч", en: "Coordinator", ja: "担当者" }, text: "では、窓口をもう一つ増やす前に、利用者にページを探してもらう調査をしましょう。" },
        { speaker: { mn: "Судлаач", en: "Researcher", ja: "調査員" }, text: "分かりました。どこで迷うのかも記録します。" }
      ],
      audio: "新しい窓口を開いてから、問い合わせの待ち時間は短くなりました。ただ、同じ質問が何度も届いています。説明のページが見つけにくいのかもしれません。では、窓口をもう一つ増やす前に、利用者にページを探してもらう調査をしましょう。分かりました。どこで迷うのかも記録します。",
      kana: "あたらしい まどぐちを ひらいてから、といあわせの まちじかんは みじかく なりました。ただ、おなじ しつもんが なんども とどいています。せつめいの ページが みつけにくいのかも しれません。では、まどぐちを もうひとつ ふやすまえに、りようしゃに ページを さがしてもらう ちょうさを しましょう。わかりました。どこで まようのかも きろくします。",
      translation: {
        mn: "—Шинэ цонх нээснээс хойш лавлагаа хүлээх хугацаа богино болсон. —Гэхдээ ижил асуулт дахин дахин ирж байна. Тайлбарын хуудсыг олоход хэцүү байж магадгүй. —Тэгвэл дахиад цонх нэмэхээс өмнө хэрэглэгчдээр хуудсыг хайлгах судалгаа хийе. —Ойлголоо. Хаана эргэлзэж байгааг ч тэмдэглэнэ.",
        en: "“Since we opened the new desk, the wait for inquiries has shortened.” “But we keep receiving the same questions. Maybe the explanation page is hard to find.” “Before adding another desk, let’s study how users look for the page.” “Understood. I’ll also record where they get stuck.”",
        ja: "「窓口を開いてから待ち時間は短くなりました。」「同じ質問が続いています。説明ページが見つけにくいのかもしれません。」「窓口を増やす前に、利用者がページを探す様子を調査しましょう。」「どこで迷うかも記録します。」"
      },
      ask: { mn: "Тэд цонх нэмж нээхээсээ өмнө юу хийхээр болсон бэ?", en: "What will they do before opening another help desk?", ja: "窓口を増やす前に何をすることになりましたか。" },
      options: {
        mn: ["Тайлбарын хуудсыг устгах", "Хэрэглэгчид тайлбарын хуудсыг хэрхэн хайдгийг судлах", "Хүлээх хугацааг зориудаар уртасгах", "Бүх хүсэлтийг утсаар авах"],
        en: ["Delete the explanation page", "Study how users search for the explanation page", "Intentionally make the wait longer", "Handle every inquiry by phone"],
        ja: ["説明ページを削除する", "利用者が説明ページを探す様子を調べる", "待ち時間をわざと長くする", "すべての問い合わせを電話で受ける"]
      },
      correct: 1,
      explain: { mn: "Дахин цонх нэмэхийн өмнө хэрэглэгч хуудсыг хэрхэн хайдгийг судлахаар болсон.", en: "They decide to observe how users search for the page before adding another desk.", ja: "新しい窓口を増やす前に、利用者のページ検索を調査すると決まりました。" }
    },
    {
      id: "listen-n2-training", level: "N2",
      dialogue: [
        { speaker: { mn: "Багш", en: "Instructor", ja: "講師" }, text: "明日の研修ですが、資料を先に読んでおく必要はありますか。" },
        { speaker: { mn: "Зохион байгуулагч", en: "Organizer", ja: "運営担当" }, text: "読む必要はありません。ただ、当日は自分のパソコンを持ってきてください。" },
        { speaker: { mn: "Багш", en: "Instructor", ja: "講師" }, text: "演習で使うのですね。参加者の一覧はいつ分かりますか。" },
        { speaker: { mn: "Зохион байгуулагч", en: "Organizer", ja: "運営担当" }, text: "今夜、申し込みを確認してからメールで送ります。" }
      ],
      audio: "明日の研修ですが、資料を先に読んでおく必要はありますか。読む必要はありません。ただ、当日は自分のパソコンを持ってきてください。演習で使うのですね。参加者の一覧はいつ分かりますか。今夜、申し込みを確認してからメールで送ります。",
      kana: "あしたの けんしゅうですが、しりょうを さきに よんでおく ひつようは ありますか。よむ ひつようは ありません。ただ、とうじつは じぶんの パソコンを もってきてください。えんしゅうで つかうのですね。さんかしゃの いちらんは いつ わかりますか。こんや、もうしこみを かくにんしてから メールで おくります。",
      translation: {
        mn: "—Маргаашийн сургалтад материалаа урьдчилан уншсан байх хэрэгтэй юу? —Унших шаардлагагүй. Гэхдээ өөрийн компьютерээ авчирна уу. —Дасгалд ашиглах нь ээ. Оролцогчдын жагсаалт хэзээ гарах вэ? —Өнөө орой бүртгэлийг шалгасны дараа имэйлээр явуулна.",
        en: "“Do we need to read the materials before tomorrow’s training?” “No, but please bring your own computer.” “We’ll use it for the exercises, then. When will we get the participant list?” “I’ll send it by email tonight after checking the registrations.”",
        ja: "「明日の研修資料は先に読む必要がありますか。」「読む必要はありませんが、パソコンを持ってきてください。」「演習で使うのですね。参加者一覧はいつ分かりますか。」「今夜、申し込みを確認してメールで送ります。」"
      },
      ask: { mn: "Оролцогчид заавал юу авчрах ёстой вэ?", en: "What must participants bring?", ja: "参加者は必ず何を持ってくる必要がありますか。" },
      options: {
        mn: ["Урьдчилан уншсан материал", "Зөөврийн компьютер", "Бүртгэлийн жагсаалт", "Цаасан толь бичиг"],
        en: ["Materials read in advance", "A computer", "The registration list", "A paper dictionary"],
        ja: ["事前に読んだ資料", "パソコン", "申し込みの一覧", "紙の辞書"]
      },
      correct: 1,
      explain: { mn: "Материалыг унших шаардлагагүй ч өөрийн компьютерийг авчрахыг хүссэн.", en: "They say the materials do not need to be read beforehand, but participants should bring a computer.", ja: "資料を読む必要はありませんが、パソコンは持参するよう求めています。" }
    },
    {
      id: "listen-n2-report", level: "N2",
      dialogue: [
        { speaker: { mn: "Дарга", en: "Manager", ja: "上司" }, text: "調査報告書は今日中にまとめられそうですか。" },
        { speaker: { mn: "Ажилтан", en: "Staff member", ja: "社員" }, text: "数字の確認は終わりました。図を入れれば、夕方までに送れます。" },
        { speaker: { mn: "Дарга", en: "Manager", ja: "上司" }, text: "では、先に結論を一ページに整理してください。細かい資料は後から付けましょう。" },
        { speaker: { mn: "Ажилтан", en: "Staff member", ja: "社員" }, text: "分かりました。まず要点を共有します。" }
      ],
      audio: "調査報告書は今日中にまとめられそうですか。数字の確認は終わりました。図を入れれば、夕方までに送れます。では、先に結論を一ページに整理してください。細かい資料は後から付けましょう。分かりました。まず要点を共有します。",
      kana: "ちょうさほうこくしょは きょうじゅうに まとめられそうですか。すうじの かくにんは おわりました。ずを いれれば、ゆうがたまでに おくれます。では、さきに けつろんを いちページに せいりしてください。こまかい しりょうは あとから つけましょう。わかりました。まず ようてんを きょうゆうします。",
      translation: {
        mn: "—Судалгааны тайланг өнөөдөртөө багтааж дуусгаж чадах уу? —Тоонуудыг шалгаж дууссан. Диаграм нэмбэл орой гэхэд явуулж чадна. —Тэгвэл эхлээд дүгнэлтийг нэг хуудсанд цэгцэл. Нарийн материалыг дараа нь хавсаргая. —Ойлголоо. Эхлээд гол санааг хуваалцъя.",
        en: "“Can you finish the research report today?” “I’ve checked the numbers. I can send it by evening if I add the charts.” “Then first summarize the conclusions on one page. We can attach the details later.” “Understood. I’ll share the main points first.”",
        ja: "「調査報告書は今日中にできますか。」「数字の確認は終わりました。図を入れれば夕方までに送れます。」「先に結論を一ページに整理し、細かい資料は後から付けましょう。」「まず要点を共有します。」"
      },
      ask: { mn: "Ажилтан эхлээд юу хийх ёстой вэ?", en: "What should the staff member do first?", ja: "社員はまず何をすることになりましたか。" },
      options: {
        mn: ["Нарийн материалыг бүгдийг нь хэвлэх", "Дүгнэлтийг нэг хуудсанд цэгцэлж, гол санааг хуваалцах", "Тоонуудыг дахин шалгах", "Тайланг маргааш хүртэл хойшлуулах"],
        en: ["Print all of the detailed materials", "Summarize the conclusion on one page and share the key points", "Check all the numbers again", "Postpone the report until tomorrow"],
        ja: ["細かい資料をすべて印刷する", "結論を一ページにまとめ、要点を共有する", "数字をもう一度確認する", "報告書を明日まで延期する"]
      },
      correct: 1,
      explain: { mn: "Эхлээд дүгнэлтийг нэг хуудсанд багтааж, гол санааг хуваалцахаар болсон.", en: "The manager asks for a one-page conclusion and the key points first.", ja: "まず結論を一ページに整理し、要点を共有すると決まりました。" }
    },
    {
      id: "listen-n2-event", level: "N2",
      dialogue: [
        { speaker: { mn: "Зохион байгуулагч", en: "Organizer", ja: "運営担当" }, text: "交流会の申し込みは定員に達しましたが、地元の参加者が少ないですね。" },
        { speaker: { mn: "Хамтрагч", en: "Colleague", ja: "同僚" }, text: "案内を学校に送ったので、学生が多くなったようです。" },
        { speaker: { mn: "Зохион байгуулагч", en: "Organizer", ja: "運営担当" }, text: "席は増やさず、地域の団体にも情報を送って、参加者の構成を調整しましょう。" },
        { speaker: { mn: "Хамтрагч", en: "Colleague", ja: "同僚" }, text: "分かりました。締め切りは変えず、今週中に連絡します。" }
      ],
      audio: "交流会の申し込みは定員に達しましたが、地元の参加者が少ないですね。案内を学校に送ったので、学生が多くなったようです。席は増やさず、地域の団体にも情報を送って、参加者の構成を調整しましょう。分かりました。締め切りは変えず、今週中に連絡します。",
      kana: "こうりゅうかいの もうしこみは ていいんに たっしましたが、じもとの さんかしゃが すくないですね。あんないを がっこうに おくったので、がくせいが おおく なったようです。せきは ふやさず、ちいきの だんたいにも じょうほうを おくって、さんかしゃの こうせいを ちょうせいしましょう。わかりました。しめきりは かえず、こんしゅうじゅうに れんらくします。",
      translation: {
        mn: "—Уулзалтын бүртгэл дээд хэмжээнд хүрсэн ч орон нутгийн оролцогч цөөн байна. —Зарлалыг сургуульд явуулсан болохоор оюутан олон болсон бололтой. —Суудал нэмэхгүйгээр орон нутгийн байгууллагуудад ч мэдээлэл явуулж, оролцогчдын бүрэлдэхүүнийг тэнцвэржүүлье. —Ойлголоо. Бүртгэлийн хугацааг өөрчлөхгүй, энэ долоо хоногт холбоо барина.",
        en: "“The exchange event is full, but we have few local participants.” “We sent the notice to schools, so there seem to be many students.” “Let’s not add seats. We’ll also contact local groups to balance the participant mix.” “Understood. I’ll keep the deadline and contact them this week.”",
        ja: "「交流会は定員に達しましたが、地元の参加者が少ないですね。」「学校に案内を送ったので学生が多いようです。」「席は増やさず、地域団体にも連絡して参加者の構成を調整しましょう。」「締め切りは変えず、今週中に連絡します。」"
      },
      ask: { mn: "Зохион байгуулагч ямар арга хэмжээ авахаар шийдсэн бэ?", en: "What action do the organizers decide to take?", ja: "運営担当者はどのような対応をすることにしましたか。" },
      options: {
        mn: ["Суудал нэмж, хугацааг сунгах", "Оюутнуудаас бүртгэл дахин авах", "Орон нутгийн байгууллагуудад холбоо барьж, оролцогчдын бүрэлдэхүүнийг тэнцвэржүүлэх", "Уулзалтыг цуцлах"],
        en: ["Add seats and extend the deadline", "Ask students to register again", "Contact local groups to balance the participant mix", "Cancel the event"],
        ja: ["席を増やして締め切りを延ばす", "学生に再申し込みを求める", "地域団体に連絡し、参加者の構成を調整する", "交流会を中止する"]
      },
      correct: 2,
      explain: { mn: "Суудал, хугацааг өөрчлөхгүй; орон нутгийн байгууллагуудад мэдээлэл явуулах.", en: "They will keep the venue capacity and deadline, and reach out to local organizations.", ja: "定員や締め切りは変えず、地域団体にも情報を送ります。" }
    },
    {
      id: "listen-n2-library", level: "N2",
      dialogue: [
        { speaker: { mn: "Ажилтан", en: "Staff member", ja: "職員" }, text: "図書館の閉館時間を一時間遅らせた結果、夜の利用者は増えました。" },
        { speaker: { mn: "Дарга", en: "Manager", ja: "責任者" }, text: "全体の人数は変わらないそうですね。午前中の利用が減った影響でしょうか。" },
        { speaker: { mn: "Ажилтан", en: "Staff member", ja: "職員" }, text: "そうです。年代と利用目的を調べてから、時間を続けるか決めたいです。" },
        { speaker: { mn: "Дарга", en: "Manager", ja: "責任者" }, text: "では、来月のアンケートにその質問を加えてください。" }
      ],
      audio: "図書館の閉館時間を一時間遅らせた結果、夜の利用者は増えました。全体の人数は変わらないそうですね。午前中の利用が減った影響でしょうか。そうです。年代と利用目的を調べてから、時間を続けるか決めたいです。では、来月のアンケートにその質問を加えてください。",
      kana: "としょかんの へいかんじかんを いちじかん おくらせた けっか、よるの りようしゃは ふえました。ぜんたいの にんずうは かわらないそうですね。ごぜんちゅうの りようが へった えいきょうでしょうか。そうです。ねんだいと りようもくてきを しらべてから、じかんを つづけるか きめたいです。では、らいげつの アンケートに その しつもんを くわえてください。",
      translation: {
        mn: "—Номын сан хаах цагаа нэг цагаар хойшлуулсны дараа оройн хэрэглэгч нэмэгдсэн. —Нийт хүний тоо өөрчлөгдөөгүй гэсэн. Өглөөний хэрэглээ буурсантай холбоотой юу? —Тийм. Нас болон ашиглах зорилгыг судалсны дараа энэ цагийн хуваарийг үргэлжлүүлэх эсэхийг шийдмээр байна. —Тэгвэл ирэх сарын санал асуулгад тэр асуултыг нэмээрэй.",
        en: "“After the library began closing an hour later, evening use increased.” “But total attendance is unchanged. Is that because morning use fell?” “Yes. I want to survey users’ ages and purposes before deciding whether to keep the hours.” “Then add those questions to next month’s survey.”",
        ja: "「閉館を一時間遅らせて夜の利用者は増えました。」「全体は変わらないそうですね。午前中の利用が減ったからですか。」「そうです。年代と利用目的を調べてから継続を決めたいです。」「来月のアンケートにその質問を加えてください。」"
      },
      ask: { mn: "Ирэх сарын санал асуулгад юу нэмэх вэ?", en: "What will be added to next month’s survey?", ja: "来月のアンケートに何を加えますか。" },
      options: {
        mn: ["Номын сангийн номын тоо", "Хэрэглэгчдийн нас ба ашиглах зорилго", "Ажилтнуудын цалингийн хэмжээ", "Шөнийн автобусны цаг"],
        en: ["The number of books in the library", "Users’ ages and reasons for using the library", "Staff salaries", "Night bus schedules"],
        ja: ["図書館の本の数", "利用者の年代と利用目的", "職員の給料", "夜のバスの時刻"]
      },
      correct: 1,
      explain: { mn: "Хуваарийг үргэлжлүүлэх эсэхийг шийдэхийн тулд нас, ашиглах зорилгыг судлахаар болсон.", en: "They will ask users’ ages and purposes before deciding whether to keep the new hours.", ja: "新しい時間を続けるか判断するため、年代と利用目的を尋ねます。" }
    }
  ];

  global.N2ExpandedPractice = { reading: reading, listening: listening };
})(window);
