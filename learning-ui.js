/* Phase 2 connected learning UI */
(function(){
  "use strict";
  var $=function(s){return document.querySelector(s)};
  var esc=function(v){return String(v==null?"":v).replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]})};
  var DI={
    mn:{all:"Бүгд",vocabulary:"Үг",kanji:"Ханз",grammar:"Дүрэм",study:"Өнөөдөр сурах",practice:"Тест",progress:"Ахиц",mistakes:"Миний алдаа",search:"Үг, ханз, дүрэм, жишээгээр хайх…",saved:"Хадгалсан",favorite:"Хадгалах",known:"Мэднэ",retry:"Дахин сурах",start:"Эхлэх",next:"Дараагийн",finish:"Дуусгах",correct:"Зөв",incorrect:"Буруу",details:"Дэлгэрэнгүй",status:"Төлөв",level:"Түвшин",today:"Өнөөдөр",review:"Давталт",due:"Давтах ёстой",empty:"Мэдээлэл олдсонгүй.",noProgress:"Одоогоор суралцсан мэдээлэл алга.",noReviews:"Өнөөдөр давтах зүйл алга.",noMistakes:"Одоогоор алдаа бүртгэгдээгүй.",accuracy:"Нарийвчлал",questions:"Асуулт",studyTime:"Суралцсан хугацаа",days:"Суралцсан өдөр",related:"Холбоотой үгс",example:"Жишээ өгүүлбэр",noExample:"Жишээ өгүүлбэр одоогоор байхгүй.",mistakeReview:"Алдаагаа давтах",retryQuiz:"Дахин тест хийх",dashboard:"Дашбоард руу",quizSetup:"Тест эхлүүлэх",questionCount:"Асуултын тоо",mode:"Горим",mistakeOnly:"Зөвхөн алдаа",mixed:"Холимог",searchResults:"Хайлтын үр дүн",planTitle:"Өнөөдөр сурах",planSub:"Өдрийн зорилго, давтах зүйл, боломжтой материалаас автоматаар тооцоолно.",newWords:"Шинэ үг",newKanji:"Шинэ ханз",newGrammar:"Шинэ дүрэм",startPlan:"Өнөөдрийн хичээл эхлүүлэх",mastered:"Эзэмшсэн",learning:"Суралцаж байна",familiar:"Танил",weak:"Сул",new:"Шинэ",derivedKanji:"Тусгай ханзны dataset байхгүй тул одоогийн бодит үгийн сан дахь ханзаас үүсгэв.",unsupported:"Энэ талбар одоогийн dataset-д байхгүй."},
    en:{all:"All",vocabulary:"Vocabulary",kanji:"Kanji",grammar:"Grammar",study:"Today",practice:"Quiz",progress:"Progress",mistakes:"Mistakes",search:"Search vocabulary, kanji, grammar, examples…",saved:"Saved",favorite:"Save",known:"Know",retry:"Learn again",start:"Start",next:"Next",finish:"Finish",correct:"Correct",incorrect:"Incorrect",details:"Details",status:"Status",level:"Level",today:"Today",review:"Review",due:"Due",empty:"No data found.",noProgress:"No learning progress yet.",noReviews:"Nothing is due for review today.",noMistakes:"No mistakes have been recorded yet.",accuracy:"Accuracy",questions:"Questions",studyTime:"Study time",days:"Study days",related:"Related words",example:"Example",noExample:"No example sentence is available.",mistakeReview:"Review mistakes",retryQuiz:"Retry quiz",dashboard:"Dashboard",quizSetup:"Start quiz",questionCount:"Question count",mode:"Mode",mistakeOnly:"Mistakes only",mixed:"Mixed",searchResults:"Search results",planTitle:"Study today",planSub:"Calculated from your daily goal, due reviews, and available content.",newWords:"New vocabulary",newKanji:"New kanji",newGrammar:"New grammar",startPlan:"Start today’s study",mastered:"Mastered",learning:"Learning",familiar:"Familiar",weak:"Weak",new:"New",derivedKanji:"No standalone kanji dataset exists, so this module is derived from actual kanji in the current vocabulary.",unsupported:"This field is not present in the current dataset."},
    ja:{all:"すべて",vocabulary:"語彙",kanji:"漢字",grammar:"文法",study:"今日の学習",practice:"クイズ",progress:"進捗",mistakes:"間違い",search:"語彙・漢字・文法・例文を検索…",saved:"保存済み",favorite:"保存",known:"知っている",retry:"もう一度学ぶ",start:"開始",next:"次へ",finish:"終了",correct:"正解",incorrect:"不正解",details:"詳細",status:"状態",level:"レベル",today:"今日",review:"復習",due:"復習対象",empty:"データがありません。",noProgress:"学習履歴はまだありません。",noReviews:"今日の復習はありません。",noMistakes:"まだ間違いはありません。",accuracy:"正答率",questions:"問題",studyTime:"学習時間",days:"学習日数",related:"関連語",example:"例文",noExample:"例文はありません。",mistakeReview:"間違いを復習",retryQuiz:"もう一度テスト",dashboard:"ダッシュボード",quizSetup:"テストを開始",questionCount:"問題数",mode:"モード",mistakeOnly:"間違いのみ",mixed:"ミックス",searchResults:"検索結果",planTitle:"今日の学習",planSub:"目標時間・復習・利用可能な教材から自動計算します。",newWords:"新しい語彙",newKanji:"新しい漢字",newGrammar:"新しい文法",startPlan:"今日の学習を開始",mastered:"マスター",learning:"学習中",familiar:"習得中",weak:"弱点",new:"新規",derivedKanji:"独立した漢字データセットがないため、現在の語彙に含まれる実際の漢字から表示しています。",unsupported:"現在のデータセットにこの項目がないため表示していません。"}
  };
  var t=function(k){return (DI[language]&&DI[language][k])||DI.mn[k]||k};
  var statusText=function(s){var m={NEW:"new",LEARNING:"learning",FAMILIAR:"familiar",WEAK:"weak",MASTERED:"mastered"};return t(m[s]||"new")};
  var meaning=function(w){return language==="ja"?(w.en||w.mn):language==="en"?(w.en||w.mn):w.mn};
  var titleOf=function(g){return language==="ja"?(g.titleJa||g.titleMn):language==="en"?(g.titleEn||g.titleMn):g.titleMn};
  var selectedVocab=null, quiz=null;

  function mount(){
    var placeholders=document.querySelector(".feature-placeholders");if(placeholders)placeholders.style.display="none";
    var home=$("#home");if(!home)return;
    if(!$("#study-hub")){
      home.insertAdjacentHTML("beforeend",
        "<section class='wrap p2-section' id='study-hub'><div class='p2-heading'><div><div class='eyebrow'>"+esc(t("today"))+"</div><h2>"+esc(t("planTitle"))+"</h2><p>"+esc(t("planSub"))+"</p></div><button class='btn primary' id='p2-start-plan'>"+esc(t("startPlan"))+" →</button></div><div id='study-summary' class='study-summary'></div><div id='study-plan' class='study-plan'></div></section>"+
        "<section class='wrap p2-section' id='kanji'><div class='p2-heading'><div><div class='eyebrow'>漢</div><h2>"+esc(t("kanji"))+"</h2><p id='kanji-source-note'></p></div></div><div id='kanji-toolbar' class='module-toolbar'></div><div id='kanji-list' class='learning-grid'></div></section>"+
        "<section class='wrap p2-section' id='grammar'><div class='p2-heading'><div><div class='eyebrow'>文法</div><h2>"+esc(t("grammar"))+"</h2><p>Existing lesson grammar content</p></div></div><div id='grammar-toolbar' class='module-toolbar'></div><div id='grammar-list' class='learning-grid'></div></section>"+
        "<section class='wrap p2-section' id='mistakes'><div class='p2-heading'><div><div class='eyebrow'>REVIEW</div><h2>"+esc(t("mistakes"))+"</h2><p>"+esc(t("noMistakes"))+"</p></div><button class='btn primary' id='p2-review-mistakes'>"+esc(t("mistakeReview"))+" →</button></div><div id='mistake-list' class='mistake-list'></div></section>"+
        "<section class='wrap p2-section' id='progress'><div class='p2-heading'><div><div class='eyebrow'>PROGRESS</div><h2>"+esc(t("progress"))+"</h2><p>"+esc(t("noProgress"))+"</p></div></div><div id='progress-overall' class='progress-overall'></div><div id='progress-modules' class='progress-module-grid'></div><div id='progress-jlpt' class='jlpt-progress'></div></section>"
      );
    }
    var nav=$(".sidebar-nav");
    if(nav)nav.innerHTML=[
      ["dashboard","⌂","Нүүр"],["study-hub","▶",t("study")],["learn","学","Сурах"],["vocabulary","語",t("vocabulary")],["kanji","漢",t("kanji")],["grammar","文",t("grammar")],["practice","✓",t("practice")],["mistakes","⚠",t("mistakes")],["progress","↗",t("progress")]
    ].map(function(x){return "<a href='#"+x[0]+"' data-nav='"+x[0]+"'><span>"+x[1]+"</span><span>"+esc(x[2])+"</span></a>"}).join("");
    var mobile=$(".mobile-nav");
    if(mobile)mobile.innerHTML=[["dashboard","⌂","Нүүр"],["study-hub","▶","Өнөөдөр"],["vocabulary","語","Үг"],["practice","✓","Тест"],["progress","↗","Ахиц"]].map(function(x){return "<a href='#"+x[0]+"' data-nav='"+x[0]+"'><span>"+x[1]+"</span><i>"+x[2]+"</i></a>"}).join("");
    document.querySelectorAll("[data-nav]").forEach(function(a){a.onclick=function(){document.querySelectorAll("[data-nav]").forEach(function(x){x.classList.remove("is-active")});a.classList.add("is-active")}});
  }

  function renderVocabulary(){
    var section=$("#vocabulary");if(!section)return;
    var data=LearningData.get("vocabulary"),s=LearningStore.load();
    var oldSearch=$("#p2-vocab-search"),search=oldSearch?String(oldSearch.value||""): "";
    var oldLevel=$("#p2-vocab-level"),levelFilter=oldLevel?oldLevel.value:"all";
    var oldStatus=$("#p2-vocab-status"),statusFilter=oldStatus?oldStatus.value:"all";
    var oldFav=$("#p2-vocab-fav"),fav=!!(oldFav&&oldFav.checked);
    var list=data.filter(function(w){
      if(levelFilter!=="all"&&w.level!==levelFilter)return false;
      if(fav&&!s.favorites.vocabulary.includes(w.id))return false;
      var st=LearningStore.getStatus(LearningStore.getProgress("vocabulary",w.id));
      if(statusFilter!=="all"&&st!==statusFilter)return false;
      if(search&&!([w.jp,w.reading,w.mn,w.en,w.example,w.exMn,w.exEn].some(function(v){return String(v||"").toLocaleLowerCase().includes(search.toLocaleLowerCase())})))return false;
      return true;
    });
    section.innerHTML="<div class='p2-heading'><div><div class='eyebrow'>"+esc(t("vocabulary"))+"</div><h2>"+esc(t("vocabulary"))+"</h2><p>"+data.length+" "+esc(t("all"))+"</p></div><button class='btn quiet' id='p2-vocab-quiz'>"+esc(t("quizSetup"))+" →</button></div>"+
      "<div class='module-toolbar vocab-toolbar'><input id='p2-vocab-search' class='p2-input' type='search' value='"+esc(search)+"' placeholder='"+esc(t("search"))+"' aria-label='"+esc(t("search"))+"'><select id='p2-vocab-level'><option value='all'>"+esc(t("all"))+"</option>"+["N5","N4","N3","N2","N1"].map(function(x){return "<option "+(x===levelFilter?"selected":"")+">"+x+"</option>"}).join("")+"</select><select id='p2-vocab-status'><option value='all'>"+esc(t("status"))+"</option>"+["NEW","LEARNING","FAMILIAR","WEAK","MASTERED"].map(function(x){return "<option value='"+x+"' "+(x===statusFilter?"selected":"")+">"+esc(statusText(x))+"</option>"}).join("")+"</select><label class='check-filter'><input id='p2-vocab-fav' type='checkbox' "+(fav?"checked":"")+"> ☆ "+esc(t("saved"))+"</label></div>"+
      (search?globalSearch(search):"")+"<div id='p2-vocab-list' class='learning-grid'>"+(list.map(vocabCard).join("")||"<div class='p2-empty'>"+esc(t("empty"))+"</div>")+"</div><div id='p2-vocab-detail'></div>";
    $("#p2-vocab-search").oninput=function(){renderVocabulary()};
    $("#p2-vocab-level").onchange=function(){renderVocabulary()};
    $("#p2-vocab-status").onchange=function(){renderVocabulary()};
    $("#p2-vocab-fav").onchange=function(){renderVocabulary()};
    $("#p2-vocab-quiz").onclick=function(){startQuiz({type:"vocabulary",mode:"mixed",count:Math.min(10,list.length),level:levelFilter==="all"?undefined:levelFilter})};
    section.querySelectorAll("[data-vocab-detail]").forEach(function(b){b.onclick=function(){openVocab(b.dataset.vocabDetail)}});
    section.querySelectorAll("[data-vocab-fav]").forEach(function(b){b.onclick=function(){var id=b.dataset.vocabFav,on=!LearningStore.load().favorites.vocabulary.includes(id);LearningStore.setFavorite("vocabulary",id,on);renderVocabulary()}});
  }
  function vocabCard(w){
    var p=LearningStore.getProgress("vocabulary",w.id),st=LearningStore.getStatus(p),saved=LearningStore.load().favorites.vocabulary.includes(w.id);
    return "<article class='learning-card vocab-card'><div class='card-top'><span class='status-chip "+st.toLowerCase()+"'>"+esc(statusText(st))+"</span><span>"+esc(w.level)+"</span></div><button class='card-click' data-vocab-detail='"+esc(w.id)+"'><strong class='jp-large' lang='ja'>"+esc(w.jp)+"</strong><span class='jp-reading' lang='ja'>"+esc(w.reading)+"</span><span class='meaning-primary'>"+esc(meaning(w))+"</span></button><div class='card-example' lang='ja'>"+esc(w.example||t("noExample"))+"</div><div class='card-actions'><button class='icon-action' data-vocab-fav='"+esc(w.id)+"'>"+(saved?"★":"☆")+"</button><button class='mini-action' data-vocab-detail='"+esc(w.id)+"'>"+esc(t("details"))+"</button></div></article>";
  }
  function openVocab(id){
    var w=LearningData.find("vocabulary",id);if(!w)return;selectedVocab=w;LearningStore.markViewed("vocabulary",id);
    var host=$("#p2-vocab-detail");if(!host)return;
    var p=LearningStore.getProgress("vocabulary",id),st=LearningStore.getStatus(p),saved=LearningStore.load().favorites.vocabulary.includes(id);
    host.innerHTML="<article class='detail-panel'><button class='detail-close' id='p2-close-detail'>×</button><div class='detail-meta'><span class='status-chip "+st.toLowerCase()+"'>"+esc(statusText(st))+"</span><span>"+esc(w.level)+"</span></div><div class='detail-main'><div><div class='jp-detail' lang='ja'>"+esc(w.jp)+"</div><div class='jp-reading'>"+esc(w.reading)+"</div><div class='detail-meaning'>"+esc(meaning(w))+"</div></div><button class='audio-btn' id='p2-audio-word'>🔊</button></div><div class='detail-example'><div class='eyebrow'>"+esc(t("example"))+"</div>"+(w.example?"<strong lang='ja'>"+esc(w.example)+"</strong><small>"+esc(language==="en"?w.exEn:w.exMn)+"</small>":"<span>"+esc(t("noExample"))+"</span>")+"</div><div class='detail-actions'><button class='btn quiet' id='p2-fav'>"+(saved?"★ ":"☆ ")+esc(saved?t("saved"):t("favorite"))+"</button><button class='btn primary' id='p2-known'>✓ "+esc(t("known"))+"</button><button class='btn quiet' id='p2-retry'>? "+esc(t("retry"))+"</button><button class='btn quiet' id='p2-practice'>"+esc(t("practice"))+"</button></div><div class='detail-stats'><span>"+esc(t("correct"))+" <b>"+(p.correct||0)+"</b></span><span>"+esc(t("incorrect"))+" <b>"+(p.incorrect||0)+"</b></span><span>"+esc(t("review"))+" <b>"+(p.nextReviewAt?reviewDate(p.nextReviewAt):"—")+"</b></span></div></article>";
    $("#p2-close-detail").onclick=function(){host.innerHTML=""};
    $("#p2-audio-word").onclick=function(){speak(w.jp)};
    $("#p2-fav").onclick=function(){LearningStore.setFavorite("vocabulary",id,!saved);renderVocabulary()};
    $("#p2-known").onclick=function(){LearningStore.recordAnswer("vocabulary",id,{correct:true,selectedAnswer:w.mn,correctAnswer:w.mn,source:"self"});openVocab(id);renderVocabulary()};
    $("#p2-retry").onclick=function(){var pp=LearningStore.getProgress("vocabulary",id);pp.status="WEAK";pp.nextReviewAt=Date.now()+86400000;LearningStore.save();openVocab(id)};
    $("#p2-practice").onclick=function(){startQuiz({type:"vocabulary",items:[w],count:1,mode:"mixed"})};
  }

  function globalSearch(q){
    q=q.toLocaleLowerCase();
    var v=LearningData.get("vocabulary").filter(function(x){return [x.jp,x.reading,x.mn,x.en,x.example].some(function(z){return String(z||"").toLocaleLowerCase().includes(q)})}).slice(0,5);
    var k=LearningData.get("kanji").filter(function(x){return x.char.includes(q)||x.related.some(function(r){return [r.jp,r.reading,r.mn,r.en].some(function(z){return String(z||"").toLocaleLowerCase().includes(q)})})}).slice(0,5);
    var g=LearningData.get("grammar").filter(function(x){return [x.pattern,x.titleMn,x.titleEn,x.titleJa,x.example,x.mn,x.en,x.ja].some(function(z){return String(z||"").toLocaleLowerCase().includes(q)})}).slice(0,5);
    return "<div class='search-results'><div class='search-result-head'>"+esc(t("searchResults"))+"</div><div class='search-result-group'><b>"+esc(t("vocabulary"))+" "+v.length+"</b>"+(v.map(function(x){return "<button data-vocab-detail='"+esc(x.id)+"'><span>"+esc(x.jp)+"</span><small>"+esc(meaning(x))+"</small></button>"}).join("")||"<span class='result-empty'>"+esc(t("empty"))+"</span>")+"</div><div class='search-result-group'><b>"+esc(t("kanji"))+" "+k.length+"</b>"+(k.map(function(x){return "<a href='#kanji'><span lang='ja'>"+esc(x.char)+"</span><small>"+esc(t("related"))+"</small></a>"}).join("")||"<span class='result-empty'>"+esc(t("empty"))+"</span>")+"</div><div class='search-result-group'><b>"+esc(t("grammar"))+" "+g.length+"</b>"+(g.map(function(x){return "<a href='#grammar'><span>"+esc(titleOf(x))+"</span><small>"+esc(x.pattern)+"</small></a>"}).join("")||"<span class='result-empty'>"+esc(t("empty"))+"</span>")+"</div></div>";
  }

  function setupKanji(){
    var items=LearningData.get("kanji"),note=$("#kanji-source-note"),toolbar=$("#kanji-toolbar"),list=$("#kanji-list");if(!list)return;
    if(note)note.textContent=t("derivedKanji");
    toolbar.innerHTML="<select id='p2-k-level'><option value='all'>"+esc(t("level"))+": "+esc(t("all"))+"</option>"+["N5","N4","N3","N2","N1"].map(function(x){return "<option>"+x+"</option>"}).join("")+"</select><select id='p2-k-status'><option value='all'>"+esc(t("status"))+"</option>"+["NEW","LEARNING","FAMILIAR","WEAK","MASTERED"].map(function(x){return "<option value='"+x+"'>"+esc(statusText(x))+"</option>"}).join("")+"</select>";
    function draw(){
      var lf=$("#p2-k-level").value,sf=$("#p2-k-status").value;
      var arr=items.filter(function(k){return (lf==="all"||k.level===lf||k.levels.includes(lf))&&(sf==="all"||LearningStore.getStatus(LearningStore.getProgress("kanji",k.id))===sf)});
      list.innerHTML=arr.map(function(k){var p=LearningStore.getProgress("kanji",k.id),st=LearningStore.getStatus(p);return "<article class='learning-card kanji-card'><div class='card-top'><span class='status-chip "+st.toLowerCase()+"'>"+esc(statusText(st))+"</span><span>"+esc(k.level)+"</span></div><button class='card-click' data-kanji='"+esc(k.id)+"'><strong class='kanji-large' lang='ja'>"+esc(k.char)+"</strong><span class='kanji-note'>"+esc(k.related.slice(0,3).map(function(w){return w.jp}).join(" · "))+"</span></button><div class='card-actions'><span class='mini-muted'>"+esc(t("related"))+"</span></div></article>"}).join("")||"<div class='p2-empty'>"+esc(t("empty"))+"</div>";
      list.querySelectorAll("[data-kanji]").forEach(function(b){b.onclick=function(){openKanji(b.dataset.kanji)}});
    }
    $("#p2-k-level").onchange=draw;$("#p2-k-status").onchange=draw;draw();
  }
  function openKanji(id){
    var k=LearningData.find("kanji",id);if(!k)return;LearningStore.markViewed("kanji",id);
    var overlay=document.createElement("div");overlay.className="p2-overlay";overlay.innerHTML="<div class='p2-modal'><button class='detail-close p2-modal-close'>×</button><div class='detail-meta'><span class='status-chip'>"+esc(statusText(LearningStore.getStatus(LearningStore.getProgress("kanji",id))))+"</span><span>"+esc(k.level)+"</span></div><div class='kanji-modal-char' lang='ja'>"+esc(k.char)+"</div><p>"+esc(t("unsupported"))+"</p><div class='detail-example'><div class='eyebrow'>"+esc(t("related"))+"</div>"+k.related.map(function(w){return "<div><strong lang='ja'>"+esc(w.jp)+"</strong><small>"+esc(w.reading)+" · "+esc(meaning(w))+"</small></div>"}).join("")+"</div><div class='detail-actions'><button class='btn primary' id='p2-k-practice'>"+esc(t("practice"))+"</button><button class='btn quiet' id='p2-k-known'>✓ "+esc(t("known"))+"</button></div></div>";
    document.body.appendChild(overlay);overlay.querySelector(".p2-modal-close").onclick=function(){overlay.remove()};overlay.onclick=function(e){if(e.target===overlay)overlay.remove()};
    overlay.querySelector("#p2-k-practice").onclick=function(){overlay.remove();startQuiz({type:"kanji",items:[k],count:1})};
    overlay.querySelector("#p2-k-known").onclick=function(){LearningStore.recordAnswer("kanji",id,{correct:true,selectedAnswer:k.char,correctAnswer:k.char,source:"self"});overlay.remove();setupKanji();renderProgress()};
  }

  function setupGrammar(){
    var items=LearningData.get("grammar"),toolbar=$("#grammar-toolbar"),list=$("#grammar-list");if(!list)return;
    toolbar.innerHTML="<select id='p2-g-level'><option value='all'>"+esc(t("level"))+": "+esc(t("all"))+"</option>"+["N5","N4","N3","N2","N1"].map(function(x){return "<option>"+x+"</option>"}).join("")+"</select><select id='p2-g-status'><option value='all'>"+esc(t("status"))+"</option>"+["NEW","LEARNING","FAMILIAR","WEAK","MASTERED"].map(function(x){return "<option value='"+x+"'>"+esc(statusText(x))+"</option>"}).join("")+"</select>";
    function draw(){
      var lf=$("#p2-g-level").value,sf=$("#p2-g-status").value;
      var arr=items.filter(function(g){return (lf==="all"||g.level===lf)&&(sf==="all"||LearningStore.getStatus(LearningStore.getProgress("grammar",g.id))===sf)});
      list.innerHTML=arr.map(function(g){var st=LearningStore.getStatus(LearningStore.getProgress("grammar",g.id));return "<article class='learning-card grammar-card'><div class='card-top'><span class='status-chip "+st.toLowerCase()+"'>"+esc(statusText(st))+"</span><span>"+esc(g.level)+"</span></div><button class='card-click' data-grammar='"+esc(g.id)+"'><strong>"+esc(titleOf(g))+"</strong><span class='grammar-pattern' lang='ja'>"+esc(g.pattern)+"</span><span class='card-example' lang='ja'>"+esc(g.example||t("noExample"))+"</span></button></article>"}).join("")||"<div class='p2-empty'>"+esc(t("empty"))+"</div>";
      list.querySelectorAll("[data-grammar]").forEach(function(b){b.onclick=function(){openGrammar(b.dataset.grammar)}});
    }
    $("#p2-g-level").onchange=draw;$("#p2-g-status").onchange=draw;draw();
  }
  function openGrammar(id){
    var g=LearningData.find("grammar",id);if(!g)return;LearningStore.markViewed("grammar",id);
    var overlay=document.createElement("div");overlay.className="p2-overlay";overlay.innerHTML="<div class='p2-modal'><button class='detail-close p2-modal-close'>×</button><div class='detail-meta'><span class='status-chip'>"+esc(statusText(LearningStore.getStatus(LearningStore.getProgress("grammar",id))))+"</span><span>"+esc(g.level)+"</span></div><h3>"+esc(titleOf(g))+"</h3><div class='grammar-pattern-large' lang='ja'>"+esc(g.pattern)+"</div><div class='detail-example'><div class='eyebrow'>"+esc(t("example"))+"</div><strong lang='ja'>"+esc(g.example||t("noExample"))+"</strong><small>"+esc(language==="en"?g.explanationEn:language==="ja"?g.explanationJa:g.explanationMn)+"</small></div><div class='detail-actions'><button class='btn primary' id='p2-g-practice'>"+esc(t("practice"))+"</button><button class='btn quiet' id='p2-g-known'>✓ "+esc(t("known"))+"</button></div></div>";
    document.body.appendChild(overlay);overlay.querySelector(".p2-modal-close").onclick=function(){overlay.remove()};overlay.onclick=function(e){if(e.target===overlay)overlay.remove()};
    overlay.querySelector("#p2-g-practice").onclick=function(){overlay.remove();startQuiz({type:"grammar",items:[g],count:1})};
    overlay.querySelector("#p2-g-known").onclick=function(){LearningStore.recordAnswer("grammar",id,{correct:true,selectedAnswer:g.pattern,correctAnswer:g.pattern,source:"self"});overlay.remove();setupGrammar();renderProgress()};
  }

  function reviewDate(ts){if(!ts)return "—";var d=new Date(ts),diff=d-Date.now();if(diff<=0)return t("today");var n=Math.ceil(diff/86400000);return language==="ja"?n+"日後":language==="en"?"in "+n+"d":n+" хоногийн дараа"}
  function speak(txt){if("speechSynthesis"in window){speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(txt);u.lang="ja-JP";speechSynthesis.speak(u)}}

  function buildPlan(){
    var s=LearningStore.load(),goal=s.settings.dailyGoal,lv=s.settings.level,due=LearningStore.due();
    var v=LearningData.get("vocabulary").filter(function(x){return x.level===lv&&LearningStore.getStatus(LearningStore.getProgress("vocabulary",x.id))==="NEW"});
    var k=LearningData.get("kanji").filter(function(x){return (x.level===lv||x.levels.includes(lv))&&LearningStore.getStatus(LearningStore.getProgress("kanji",x.id))==="NEW"});
    var g=LearningData.get("grammar").filter(function(x){return x.level===lv&&LearningStore.getStatus(LearningStore.getProgress("grammar",x.id))==="NEW"});
    return {goal:goal,level:lv,due:due,items:{vocabulary:v,kanji:k,grammar:g},tasks:[
      {id:"review",label:t("review"),count:Math.min(due.length,Math.round(goal*.3)),minutes:Math.round(goal*.3)},
      {id:"vocabulary",label:t("newWords"),count:Math.min(v.length,Math.max(1,Math.round(goal*.25))),minutes:Math.round(goal*.3)},
      {id:"kanji",label:t("newKanji"),count:Math.min(k.length,Math.max(1,Math.round(goal*.2))),minutes:Math.round(goal*.2)},
      {id:"grammar",label:t("newGrammar"),count:Math.min(g.length,Math.max(1,Math.round(goal*.15))),minutes:Math.max(1,Math.round(goal*.2))}
    ]};
  }
  function renderStudy(){
    var p=buildPlan(),s=LearningStore.load(),key=new Date().toISOString().slice(0,10),mins=s.studySessions.filter(function(x){return x.day===key}).reduce(function(a,x){return a+Number(x.duration||0)},0)/60;
    $("#study-summary").innerHTML="<div class='study-metric'><b>"+Math.floor(mins)+"</b><span>/ "+p.goal+" мин</span><small>"+esc(t("studyTime"))+"</small></div><div class='study-metric'><b>"+p.due.length+"</b><span>"+esc(t("due"))+"</span><small>"+esc(t("review"))+"</small></div><div class='study-metric'><b>"+esc(p.level)+"</b><span>"+esc(t("level"))+"</span><small>"+esc(t("today"))+"</small></div>";
    $("#study-plan").innerHTML=p.tasks.map(function(x){var icon=x.id==="review"?"↻":x.id==="vocabulary"?"語":x.id==="kanji"?"漢":"文";return "<article class='study-task "+(!x.count?"is-empty":"")+"'><div class='task-icon'>"+icon+"</div><div><b>"+esc(x.label)+"</b><p>"+x.count+" · "+x.minutes+" мин</p></div><button class='mini-action' data-plan='"+x.id+"' "+(!x.count?"disabled":"")+">"+esc(t("start"))+" →</button></article>"}).join("");
    $("#study-plan").querySelectorAll("[data-plan]").forEach(function(b){b.onclick=function(){runPlan(p,b.dataset.plan)}});
    $("#p2-start-plan").onclick=function(){var x=p.tasks.find(function(a){return a.count>0});if(x)runPlan(p,x.id);else alert(t("noReviews"))};
  }
  function runPlan(p,id){
    if(id==="review"){var due=p.due.slice(0,(p.tasks.find(function(x){return x.id==="review"})||{}).count||0);var qs=due.map(function(x){return QuizEngine.buildQuestion(x.type,x.item,"mixed",LearningData.get(x.type))});if(qs.length)startQuizQuestions(qs,"review");else alert(t("noReviews"));return}
    var arr=(p.items[id]||[]).slice(0,(p.tasks.find(function(x){return x.id===id})||{}).count||0);if(arr.length)startQuiz({type:id,items:arr,count:arr.length,mode:"mixed"});
  }

  function setupQuiz(){
    var sec=$("#practice");if(!sec||quiz)return;
    var s=LearningStore.load();
    sec.innerHTML="<div class='p2-heading'><div><div class='eyebrow'>"+esc(t("practice"))+"</div><h2>"+esc(t("quizSetup"))+"</h2><p>"+esc(t("planSub"))+"</p></div></div><div class='quiz-setup'><label><span>Type</span><select id='p2-q-type'><option value='vocabulary'>"+esc(t("vocabulary"))+"</option><option value='kanji'>"+esc(t("kanji"))+"</option><option value='grammar'>"+esc(t("grammar"))+"</option></select></label><label><span>"+esc(t("mode"))+"</span><select id='p2-q-mode'></select></label><label><span>"+esc(t("level"))+"</span><select id='p2-q-level'><option value='all'>"+esc(t("all"))+"</option>"+["N5","N4","N3","N2","N1"].map(function(x){return "<option "+(x===s.settings.level?"selected":"")+">"+x+"</option>"}).join("")+"</select></label><label><span>"+esc(t("questionCount"))+"</span><select id='p2-q-count'><option>5</option><option selected>10</option><option>20</option></select></label><label class='check-large'><input id='p2-q-mistakes' type='checkbox'> "+esc(t("mistakeOnly"))+"</label><button class='btn primary' id='p2-q-start'>"+esc(t("start"))+" →</button></div>";
    var setModes=function(){var type=$("#p2-q-type").value,opts=type==="vocabulary"?[["mixed","mixed"],["ja-mn","Япон → Монгол"],["mn-ja","Монгол → Япон"],["reading","Уншлага"],["sentence","Өгүүлбэр"]]:type==="kanji"?[[ "kanji-related-word","Ханз → үг"]]:[["mixed","mixed"],["pattern-title","Дүрэм → утга"],["example-pattern","Жишээ → дүрэм"]];$("#p2-q-mode").innerHTML=opts.map(function(x){return "<option value='"+x[0]+"'>"+esc(x[1])+"</option>"}).join("")};
    $("#p2-q-type").onchange=setModes;setModes();
    $("#p2-q-start").onclick=function(){var type=$("#p2-q-type").value,startMode=$("#p2-q-mode").value,n=Number($("#p2-q-count").value),lv=$("#p2-q-level").value;startQuiz({type:type,mode:startMode,count:n,level:lv==="all"?undefined:lv,onlyMistakes:$("#p2-q-mistakes").checked})};
  }

  function startQuiz(o){
    var qs=QuizEngine.createQuiz(o);if(!qs.length){alert(t("empty"));return}
    startQuizQuestions(qs,o.type);
  }
  function startQuizQuestions(qs,category){
    var already=typeof phase1StartedAt!=="undefined"&&!!phase1StartedAt;
    LearningStore.startActivity(category==="review"?"quiz":category);
    quiz={questions:qs,index:0,correct:0,results:[],startedAt:Date.now(),autoTimer:!already,category:category};
    location.hash="#practice";drawQuiz();
  }
  function drawQuiz(){
    if(!quiz)return;
    var sec=$("#practice"),q=quiz.questions[quiz.index];if(!q)return finishQuiz();
    LearningStore.markPracticed(q.type,q.id);
    sec.innerHTML="<div class='p2-heading'><div><div class='eyebrow'>"+esc(t("practice"))+" · "+esc(q.mode)+"</div><h2>"+esc(q.prompt)+"</h2><p>"+esc(q.subprompt||"")+"</p></div><div class='quiz-score'><b>"+quiz.correct+"</b> / "+quiz.index+"</div></div><div class='quiz-layout'><article class='quiz-panel'><div class='quiz-progress-large'><i style='width:"+Math.round(quiz.index/quiz.questions.length*100)+"%'></i></div><div class='quiz-counter'>"+(quiz.index+1)+" / "+quiz.questions.length+"</div><div class='quiz-choices'>"+q.choices.map(function(c,i){return "<button class='quiz-choice' data-c='"+i+"'><span>"+String.fromCharCode(65+i)+"</span>"+esc(c)+"</button>"}).join("")+"</div><div class='quiz-feedback' id='p2-q-feedback'></div><button class='btn primary quiz-next' id='p2-q-next' disabled>"+esc(quiz.index===quiz.questions.length-1?t("finish"):t("next"))+" →</button></article><aside class='quiz-side'><b>"+esc(t("progress"))+"</b><div>"+quiz.index+" "+esc(t("questions"))+"</div><div>"+LearningStore.getAccuracy(q.type).accuracy+"% "+esc(t("accuracy"))+"</div></aside></div>";
    sec.querySelectorAll("[data-c]").forEach(function(b){b.onclick=function(){answerQuiz(Number(b.dataset.c))}});
    $("#p2-q-next").onclick=function(){quiz.index++;drawQuiz()};
  }
  function answerQuiz(i){
    var q=quiz.questions[quiz.index],buttons=[].slice.call(document.querySelectorAll(".quiz-choice")),fb=$("#p2-q-feedback");if(!q||buttons.some(function(b){return b.disabled}))return;
    var ok=i===q.correct;buttons.forEach(function(b){b.disabled=true});buttons[i].classList.add(ok?"is-correct":"is-wrong");buttons[q.correct].classList.add("is-correct");
    LearningStore.recordAnswer(q.type,q.id,{correct:ok,selectedAnswer:q.choices[i],correctAnswer:q.correctValue,source:quiz.category==="review"?"review":"quiz"});
    quiz.results.push({id:q.id,type:q.type,correct:ok,selected:q.choices[i],expected:q.correctValue});if(ok)quiz.correct++;
    fb.innerHTML=ok?"<strong>✓ "+esc(t("correct"))+"</strong>":"<strong>✕ "+esc(t("incorrect"))+"</strong><span>"+esc(q.correctValue||"")+"</span>";$("#p2-q-next").disabled=false;
  }
  function finishQuiz(){
    var q=quiz,total=q.questions.length,pct=total?Math.round(q.correct/total*100):0;
    LearningStore.recordQuizResult({category:q.category,total:total,correct:q.correct,accuracy:pct,startedAt:q.startedAt,results:q.results.map(function(x){return {id:x.id,type:x.type,correct:x.correct}})});
    if(q.autoTimer)LearningStore.stopActivity();
    var wrong=q.results.filter(function(x){return !x.correct}).length,sec=$("#practice");
    sec.innerHTML="<div class='result-card'><div class='eyebrow'>"+esc(t("quizSetup"))+"</div><div class='result-score'>"+q.correct+" / "+total+"</div><div class='result-accuracy'>"+pct+"% "+esc(t("accuracy"))+"</div><div class='result-metrics'><span><b>"+q.correct+"</b>"+esc(t("correct"))+"</span><span><b>"+wrong+"</b>"+esc(t("retry"))+"</span></div><div class='detail-actions'><button class='btn primary' id='p2-result-mistakes'>"+esc(t("mistakeReview"))+"</button><button class='btn quiet' id='p2-result-retry'>"+esc(t("retryQuiz"))+"</button><a class='btn quiet' href='#dashboard'>"+esc(t("dashboard"))+"</a></div></div>";
    var qs=q.results.filter(function(x){return !x.correct}).map(function(x){var item=LearningData.find(x.type,x.id);return item?{type:x.type,item:item}:null}).filter(Boolean);
    $("#p2-result-mistakes").onclick=function(){if(qs.length)startQuizQuestions(qs.map(function(x){return QuizEngine.buildQuestion(x.type,x.item,"mixed",LearningData.get(x.type))}),"review");else alert(t("noMistakes"))};
    $("#p2-result-retry").onclick=function(){startQuizQuestions(q.questions,"retry")};
    quiz=null;renderMistakes();renderProgress();renderStudy();dashboardBridge();
  }

  function renderMistakes(){
    var host=$("#mistake-list");if(!host)return;var list=LearningStore.mistakes();
    host.innerHTML=list.length?list.map(function(m){var item=m.item,display=item?(item.type==="vocabulary"?item.jp:item.type==="kanji"?item.char:titleOf(item)):m.id;return "<article class='mistake-row'><div><span class='status-chip weak'>"+esc(t("weak"))+"</span><strong>"+esc(display)+"</strong><small>"+esc(m.type)+" · "+m.count+" wrong · "+reviewDate(LearningStore.getProgress(m.type,m.id).nextReviewAt)+"</small></div><button class='mini-action' data-m-id='"+esc(m.id)+"'>"+esc(t("retry"))+"</button></article>"}).join(""):"<div class='p2-empty'>"+esc(t("noMistakes"))+"</div>";
    host.querySelectorAll("[data-m-id]").forEach(function(b){b.onclick=function(){var m=list.find(function(x){return x.id===b.dataset.mId});if(m)startQuiz({type:m.type,items:[m.item],count:1,mode:"mixed"})}});
    $("#p2-review-mistakes").onclick=function(){var q=list.slice(0,10).map(function(m){return {type:m.type,item:m.item}}).filter(function(x){return x.item}).map(function(x){return QuizEngine.buildQuestion(x.type,x.item,"mixed",LearningData.get(x.type))});if(q.length)startQuizQuestions(q,"review");else alert(t("noMistakes"))};
  }

  function renderProgress(){
    var overall=$("#progress-overall"),mods=$("#progress-modules"),jlpt=$("#progress-jlpt");if(!overall||!mods)return;
    var s=LearningStore.load(),sessions=s.studySessions,mins=sessions.reduce(function(a,x){return a+Number(x.duration||0)},0)/60,days=new Set(sessions.map(function(x){return x.day})).size,answered=s.quizHistory.reduce(function(a,x){return a+Number(x.total||0)},0),c=0,a=0;
    ["vocabulary","kanji","grammar"].forEach(function(type){var z=LearningStore.getAccuracy(type);c+=z.correct;a+=z.answers});
    var acc=a?Math.round(c/a*100):0;
    overall.innerHTML="<div class='overview-grid'><div><b>"+Math.floor(mins)+"</b><span>"+esc(t("studyTime"))+"</span></div><div><b>"+days+"</b><span>"+esc(t("days"))+"</span></div><div><b>"+answered+"</b><span>"+esc(t("questions"))+"</span></div><div><b>"+acc+"%</b><span>"+esc(t("accuracy"))+"</span></div><div><b>"+(s.streak.count||0)+"</b><span>🔥 streak</span></div></div>";
    mods.innerHTML=["vocabulary","kanji","grammar"].map(function(type){var st=LearningStore.stats(type),learned=st.counts.FAMILIAR+st.counts.MASTERED;return "<article class='p2-progress-card'><div class='dash-card-head'><span>"+esc(t(type))+"</span><span>"+learned+" / "+st.total+"</span></div><div class='p2-progress-bars'><div><span>"+esc(t("new"))+"</span><i style='width:"+(st.total?st.counts.NEW/st.total*100:0)+"%'></i></div><div><span>"+esc(t("learning"))+"</span><i style='width:"+(st.total?st.counts.LEARNING/st.total*100:0)+"%'></i></div><div><span>"+esc(t("weak"))+"</span><i style='width:"+(st.total?st.counts.WEAK/st.total*100:0)+"%'></i></div><div><span>"+esc(t("mastered"))+"</span><i style='width:"+(st.total?st.counts.MASTERED/st.total*100:0)+"%'></i></div></div></article>"}).join("");
    var lv=s.settings.level;
    jlpt.innerHTML="<div class='p2-progress-card'><div class='dash-card-head'><span>JLPT "+esc(lv)+"</span><span>"+esc(t("level"))+"</span></div>"+["vocabulary","kanji","grammar"].map(function(type){var items=LearningData.get(type).filter(function(x){return x.level===lv||Array.isArray(x.levels)&&x.levels.includes(lv)}),learned=items.filter(function(x){return ["FAMILIAR","MASTERED"].includes(LearningStore.getStatus(LearningStore.getProgress(type,x.id)))}).length,p=items.length?Math.round(learned/items.length*100):0;return "<div class='jlpt-row'><span>"+esc(t(type))+"</span><div class='jlpt-bar'><i style='width:"+p+"%'></i></div><b>"+p+"%</b></div>"}).join("")+"</div>";
  }

  function dashboardBridge(){
    var grid=$(".dashboard-grid");if(!grid)return;var card=$("#p2-dashboard-learning");
    if(!card){card=document.createElement("article");card.id="p2-dashboard-learning";card.className="dash-card p2-dash-learning";grid.appendChild(card)}
    var s=LearningStore.load(),due=LearningStore.due(),key=new Date().toISOString().slice(0,10),mins=s.studySessions.filter(function(x){return x.day===key}).reduce(function(a,x){return a+Number(x.duration||0)},0)/60;
    card.innerHTML="<div class='dash-card-head'><span>"+esc(t("today"))+"</span><a href='#study-hub'>"+esc(t("study"))+" →</a></div><div class='p2-dash-row'><span>♻ "+due.length+" "+esc(t("due"))+"</span><span>⏱ "+Math.floor(mins)+" / "+s.settings.dailyGoal+" мин</span></div><div class='p2-dash-mods'>"+["vocabulary","kanji","grammar"].map(function(type){var d=LearningStore.stats(type),n=d.counts.FAMILIAR+d.counts.MASTERED;return "<span><b>"+n+"</b> / "+d.total+" "+esc(t(type))+"</span>"}).join("")+"</div>";
  }

  function refresh(){
    LearningStore.syncFromLegacy();mount();renderVocabulary();setupKanji();setupGrammar();renderMistakes();renderProgress();renderStudy();dashboardBridge();
    document.querySelectorAll("[data-nav]").forEach(function(a){a.classList.remove("is-active")});
  }
  var oldLocalize=localize;
  localize=function(){try{oldLocalize()}catch{}try{LearningStore.setSetting("language",language)}catch{}refresh()};
  window.Phase2UI={refresh:refresh,startQuiz:startQuiz};
  document.addEventListener("DOMContentLoaded",function(){
    LearningStore.load();mount();setupQuiz();refresh();
    window.addEventListener("hashchange",function(){if(location.hash==="#practice"&&!quiz)setupQuiz()});
    $("#setting-level")&&$("#setting-level").addEventListener("change",function(e){LearningStore.setSetting("level",e.target.value);if(typeof level!=="undefined")level=e.target.value;refresh()});
    $("#setting-goal")&&$("#setting-goal").addEventListener("change",function(e){LearningStore.setSetting("dailyGoal",e.target.value);refresh()});
  });
})();