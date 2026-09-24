/* Phase 3 AI先生 UI. AI recommendations are advisory; existing learning engines perform state changes. */
(function(){
 'use strict';
 var currentMode='teacher',pendingSelected=null,loading=false;
 var DI={
  mn:{title:'AI先生',subtitle:'Таны бодит суралцах явцыг ойлгодог Япон хэлний багш',input:'AI先生ээс асуу…',send:'Илгээх',clear:'Чат цэвэрлэх',thinking:'AI先生 бодож байна…',online:'Онлайн AI',offline:'AI先生 онлайн холболт шаарддаг.',notConfigured:'Secure AI endpoint тохируулаагүй байна. Core learning хэвийн ажиллана.',todayPlan:'Өнөөдрийн хичээлээ шийд',weak:'Сул хэсгээ заалгах',quiz:'Үг тестлэх',grammar:'Дүрэм тайлбарлуулах',writing:'Япон хэлээ засуулах',conversation:'Ярианы дадлага',jlpt:'JLPT зөвлөгөө',welcome:'Сайн байна уу! Би таны одоогийн бодит ахиц, алдаа, review болон JLPT зорилгыг ашиглан сурах дараагийн алхмыг санал болгоно.',context:'Таны суралцах мэдээлэл',due:'Давтах',remaining:'Үлдсэн',accuracy:'Сүүлийн accuracy',explain:'AI先生-ээр тайлбарлуулах',startQuiz:'Тест эхлүүлэх',open:'Нээх',plan:'Санал болгосон төлөвлөгөө',retry:'Дахин оролдох',clearDone:'Чат цэвэрлэгдлээ.',empty:'Мэдээлэл хангалтгүй байна.',network:'AI зөвлөгөөнд интернет хэрэгтэй.',actionRejected:'AI-ийн санал өгөгдөлтэй зөрсөн тул ашиглагдсангүй.',privacy:'Зөвхөн суралцахтай холбоотой context илгээнэ. AI chat history 50 message-ээр хязгаарлагдана.',typeSentence:'Япон өгүүлбэрээ энд бичээд "Япон хэлээ засуулах" гэж асуугаарай.'},
  en:{title:'AI先生',subtitle:'A Japanese teacher grounded in your real learning data',input:'Ask AI先生…',send:'Send',clear:'Clear chat',thinking:'AI先生 is thinking…',online:'Online AI',offline:'AI先生 requires an internet connection.',notConfigured:'The secure AI endpoint is not configured. Core learning remains available.',todayPlan:'Decide today’s study',weak:'Teach my weak areas',quiz:'Quiz my vocabulary',grammar:'Explain grammar',writing:'Correct my Japanese',conversation:'Conversation practice',jlpt:'JLPT coaching',welcome:'Hello! I use your actual progress, mistakes, reviews, study time and JLPT goal to suggest the next useful step.',context:'Your learning context',due:'Due',remaining:'Remaining',accuracy:'Recent accuracy',explain:'Explain with AI先生',startQuiz:'Start quiz',open:'Open',plan:'Suggested plan',retry:'Try again',clearDone:'Chat cleared.',empty:'Not enough learning data.',network:'AI coaching requires an internet connection.',actionRejected:'The AI suggestion did not match the available learning data, so it was not applied.',privacy:'Only learning-related context is sent. AI chat history is limited to 50 messages.',typeSentence:'Write a Japanese sentence and ask for correction.'},
  ja:{title:'AI先生',subtitle:'あなたの実際の学習データに基づく日本語教師',input:'AI先生に質問…',send:'送信',clear:'チャットを消去',thinking:'AI先生が考えています…',online:'オンラインAI',offline:'AI先生にはインターネット接続が必要です。',notConfigured:'安全なAIエンドポイントが設定されていません。通常の学習機能は使えます。',todayPlan:'今日の学習を決める',weak:'苦手を教えて',quiz:'語彙テスト',grammar:'文法を説明',writing:'日本語を直して',conversation:'会話練習',jlpt:'JLPTコーチ',welcome:'こんにちは。あなたの実際の進捗、間違い、復習、学習時間、JLPT目標を使って次の学習を提案します。',context:'学習コンテキスト',due:'復習',remaining:'残り',accuracy:'最近の正答率',explain:'AI先生に説明してもらう',startQuiz:'テスト開始',open:'開く',plan:'おすすめプラン',retry:'再試行',clearDone:'チャットを消去しました。',empty:'学習データが不足しています。',network:'AIの利用にはインターネット接続が必要です。',actionRejected:'利用可能な学習データと一致しない提案だったため、実行しませんでした。',privacy:'学習に必要な情報だけを送信します。AIチャット履歴は50メッセージまでです。',typeSentence:'日本語の文を書いて「日本語を直して」と質問してください。'}
 };
 function t(k){return (DI[language]&&DI[language][k])||DI.mn[k]||k;}
 function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]});}
 function itemSummary(type,id){
   var x=LearningData.find(type,id);if(!x)return null;
   if(type==='vocabulary')return {contentType:type,contentId:x.id,japanese:x.jp,reading:x.reading||'',meaningMn:x.mn||'',meaningEn:x.en||'',level:x.level,example:x.example||''};
   if(type==='kanji')return {contentType:type,contentId:x.id,character:x.char,level:x.level,relatedWords:(x.related||[]).slice(0,4)};
   return {contentType:type,contentId:x.id,pattern:x.pattern||'',titleMn:x.titleMn||'',titleEn:x.titleEn||'',titleJa:x.titleJa||'',level:x.level,example:x.example||''};
 }
 function history(){return LearningStore.getAIState().recentChats||[];}
 function append(role,content){LearningStore.appendAIChat({role:role,content:content,timestamp:Date.now()});renderMessages();}
 function currentCandidates(type){var c=AIContextBuilder.build({action:'QUIZ'});return c.availability[type]?c.availability[type].candidateIds:[];}
 function contextSummary(){var c=AIContextBuilder.build({action:'CHAT'});return {level:c.targetJLPT,minutes:c.todayStudyMinutes,remaining:c.remainingMinutes,due:c.dueReviews.length,weakVocab:c.weakAreas.vocabulary.length,weakGrammar:c.weakAreas.grammar.length,accuracy:c.recentQuizAccuracy};}
 function buildUserActionPrompt(key){var prompts={todayPlan:t('todayPlan'),weak:t('weak'),quiz:t('quiz')+' — 5 questions',grammar:t('grammar'),writing:t('writing'),conversation:t('conversation'),jlpt:t('jlpt')};return prompts[key]||'';}
 function ensureSection(){
   var home=document.querySelector('#home');if(!home)return;
   if(!document.querySelector('#ai-teacher')){
     var s=document.createElement('section');s.id='ai-teacher';s.className='wrap ai-teacher-section';
     s.innerHTML='<div class="ai-shell"><div class="ai-heading"><div><div class="eyebrow">AI先生</div><h2>'+esc(t('title'))+'</h2><p>'+esc(t('subtitle'))+'</p></div><div class="ai-header-actions"><span id="ai-status" class="ai-status">'+esc(navigator.onLine?t('online'):t('offline'))+'</span><button class="mini-action" id="ai-clear">'+esc(t('clear'))+'</button></div></div><div class="ai-context-strip" id="ai-context-strip"></div><div class="ai-messages" id="ai-messages" aria-live="polite"></div><div class="ai-quick" id="ai-quick"></div><form class="ai-input-row" id="ai-form"><textarea id="ai-input" rows="2" aria-label="'+esc(t('input'))+'" placeholder="'+esc(t('input'))+'"></textarea><button class="btn primary" id="ai-send" type="submit">'+esc(t('send'))+'</button></form><p class="ai-privacy">'+esc(t('privacy'))+'</p></div>';
     home.appendChild(s);
   }
   renderContext();renderQuick();renderMessages();patchEntryPoints();
 }
 function renderMessages(){
   var host=document.querySelector('#ai-messages');if(!host)return;host.textContent='';
   var items=history();
   if(!items.length){var empty=document.createElement('div');empty.className='ai-welcome';empty.textContent=t('welcome');host.appendChild(empty);return;}
   items.forEach(function(m){var row=document.createElement('div');row.className='ai-message '+m.role;var bubble=document.createElement('div');bubble.className='ai-bubble';bubble.textContent=m.content;row.appendChild(bubble);host.appendChild(row);});
   if(loading){var row=document.createElement('div');row.className='ai-message assistant';var bubble=document.createElement('div');bubble.className='ai-bubble ai-thinking';bubble.textContent=t('thinking');row.appendChild(bubble);host.appendChild(row);}
   host.scrollTop=host.scrollHeight;
 }
 function renderContext(){
   var host=document.querySelector('#ai-context-strip');if(!host)return;var c=contextSummary();
   host.innerHTML='<span><b>'+esc(c.level)+'</b> JLPT</span><span>⏱ '+esc(c.minutes)+' / '+esc(LearningStore.load().settings.dailyGoal)+' min</span><span>↻ '+esc(c.due)+' '+esc(t('due'))+'</span><span>⚠ '+esc(c.weakVocab)+' weak</span><span>✓ '+esc(c.accuracy)+'% '+esc(t('accuracy'))+'</span>';
 }
 function renderQuick(){
   var host=document.querySelector('#ai-quick');if(!host)return;
   var items=[['todayPlan','todayPlan','STUDY_PLAN'],['weak','weak','REVIEW_MISTAKES'],['quiz','quiz','QUIZ'],['grammar','grammar','CHAT'],['writing','writing','WRITING_CORRECTION'],['conversation','conversation','CONVERSATION'],['jlpt','jlpt','JLPT_COACH']];
   host.innerHTML=items.map(function(x){return '<button class="ai-chip" type="button" data-ai-action="'+x[2]+'" data-ai-key="'+x[0]+'">'+esc(t(x[1]))+'</button>';}).join('');
   host.querySelectorAll('[data-ai-action]').forEach(function(b){b.onclick=function(){quickAction(b.dataset.aiAction,b.dataset.aiKey);};});
 }
 async function quickAction(action,key){
   if(action==='QUIZ'){await send(buildUserActionPrompt(key),action,{contentType:'vocabulary',candidates:currentCandidates('vocabulary'),questionCount:5});return;}
   await send(buildUserActionPrompt(key),action,{});
 }
 async function send(text,action,options){
   text=String(text||'').trim();if(!text||loading)return;
   var opts=options||{},selected=pendingSelected;pendingSelected=null;
   append('user',text);loading=true;renderMessages();
   var context=AIContextBuilder.build({action:action||'CHAT',selectedItem:selected,candidates:opts.candidates||[]});
   var payload={action:action||'CHAT',userMessage:text,context:context,messages:history().filter(function(m){return m.role!=='system'}).slice(-12),contentType:opts.contentType||null,questionCount:opts.questionCount||null,candidates:opts.candidates||[]};
   try{
     if(!navigator.onLine)throw Object.assign(new Error(t('offline')),{code:'OFFLINE'});
     var result=await AIProvider.request(payload),parsed=AIActions.parseAndValidate(result.text,{expectedContentType:opts.contentType||null,allowedIds:opts.candidates||[]});
     if(parsed.valid&&parsed.action){handleAction(parsed.action,result.text);}
     else if(parsed.error==='content_not_in_candidate_set'||parsed.error==='wrong_content_type'){append('assistant',t('actionRejected'));}
     else if(parsed.error!=='no_structured_action'&&/^[{]/.test(result.text.trim())){append('assistant',t('actionRejected'));}
     else {append('assistant',result.text);}
   }catch(e){
     var msg=e&&e.code==='AI_NOT_CONFIGURED'?t('notConfigured'):e&&e.code==='OFFLINE'?t('network'):(e&&e.message||t('network'));
     append('assistant',msg);
   }finally{loading=false;renderMessages();renderContext();}
 }
 function handleAction(action,fallbackText){
   if(action.type==='QUIZ'){
     var items=action.contentIds.map(function(id){return LearningData.find(action.contentType,id);}).filter(Boolean);
     append('assistant',fallbackText&&fallbackText.charAt(0)!=='{'?fallbackText:t('startQuiz'));
     var host=document.querySelector('#ai-messages'),button=document.createElement('button');button.className='ai-action-card';button.type='button';button.textContent=t('startQuiz')+' · '+items.length;
     button.onclick=function(){if(window.Phase2UI&&Phase2UI.startQuiz){Phase2UI.startQuiz({type:action.contentType,items:items,mode:action.mode,count:action.questionCount,level:action.level||undefined});}};
     host.appendChild(button);host.scrollTop=host.scrollHeight;return;
   }
   if(action.type==='REVIEW_MISTAKES'){
     append('assistant',action.summary||t('weak'));
     var reviewHost=document.querySelector('#ai-messages'),reviewBtn=document.createElement('button');reviewBtn.className='ai-action-card';reviewBtn.type='button';reviewBtn.textContent=t('startQuiz')+' · '+action.contentIds.length;
     reviewBtn.onclick=function(){
       var items=action.contentIds.map(function(id){var m=LearningStore.mistakes().find(function(x){return x.id===id});return m&&m.item;}).filter(Boolean);
       var grouped={};items.forEach(function(item){var type=item.type;if(!grouped[type])grouped[type]=[];grouped[type].push(item);});
       var first=Object.keys(grouped)[0];if(first&&window.Phase2UI&&Phase2UI.startQuiz)Phase2UI.startQuiz({type:first,items:grouped[first],mode:'mixed',count:grouped[first].length});
     };
     reviewHost.appendChild(reviewBtn);reviewHost.scrollTop=reviewHost.scrollHeight;return;
   }
   if(action.type==='STUDY_PLAN'){
     LearningStore.setAILastPlan(action);append('assistant',fallbackText&&fallbackText.charAt(0)!=='{'?fallbackText:t('plan'));
     var host=document.querySelector('#ai-messages'),card=document.createElement('div');card.className='ai-plan-card';var title=document.createElement('b');title.textContent=t('plan');card.appendChild(title);
     (action.items||[]).forEach(function(item){var row=document.createElement('div');row.className='ai-plan-row';var label=document.createElement('span');label.textContent=item.contentType+' · '+item.minutes+' min';var btn=document.createElement('button');btn.className='mini-action';btn.type='button';btn.textContent=t('open');btn.onclick=function(){location.hash='#'+item.contentType;};row.appendChild(label);row.appendChild(btn);card.appendChild(row);});
     host.appendChild(card);host.scrollTop=host.scrollHeight;return;
   }
   append('assistant',fallbackText&&fallbackText.charAt(0)!=='{'?fallbackText:t('empty'));
 }
 function explain(type,id){
   var item=itemSummary(type,id);if(!item)return;pendingSelected=item;location.hash='#ai-teacher';var input=document.querySelector('#ai-input');
   if(input){var text=language==='mn'?'Энийг энгийнээр тайлбарла: '+(item.japanese||item.pattern||item.character):language==='ja'?'これを簡単に説明してください: '+(item.japanese||item.pattern||item.character):'Explain this simply: '+(item.japanese||item.pattern||item.character);input.value=text;input.focus();}
 }
 function patchEntryPoints(){
   var aiOld=document.querySelector('#ai-placeholder');if(aiOld){aiOld.innerHTML='<span>AI</span><div><b>AI先生</b><p>'+esc(t('subtitle'))+'</p></div><em>PHASE 3</em>';aiOld.style.cursor='pointer';aiOld.onclick=function(){location.hash='#ai-teacher';};aiOld.removeAttribute('aria-disabled');}
   var dash=document.querySelector('.dashboard-grid');if(dash&&!document.querySelector('#ai-dashboard-card')){var card=document.createElement('article');card.id='ai-dashboard-card';card.className='dash-card ai-dashboard-card';card.innerHTML='<div class="dash-card-head"><span>AI先生</span><a href="#ai-teacher">'+esc(t('todayPlan'))+' →</a></div><p>'+esc(t('subtitle'))+'</p><button class="mini-action" type="button">'+esc(t('todayPlan'))+'</button>';card.querySelector('button').onclick=function(){location.hash='#ai-teacher';quickAction('STUDY_PLAN','todayPlan');};dash.appendChild(card);}
   document.querySelectorAll('[data-ai-explain]').forEach(function(b){if(b.dataset.aiBound)return;b.dataset.aiBound='1';b.onclick=function(){explain(b.dataset.aiType,b.dataset.aiId);};});
 }
 function refresh(){ensureSection();renderContext();renderQuick();renderMessages();patchEntryPoints();var status=document.querySelector('#ai-status');if(status)status.textContent=navigator.onLine?t('online'):t('offline');}
 document.addEventListener('DOMContentLoaded',function(){
   ensureSection();
   document.querySelector('#ai-form')?.addEventListener('submit',function(e){e.preventDefault();var input=document.querySelector('#ai-input');if(input){var v=input.value;input.value='';send(v,currentMode,{});}});
   document.querySelector('#ai-clear')?.addEventListener('click',function(){LearningStore.clearAIHistory();renderMessages();renderContext();});
   window.addEventListener('online',refresh);window.addEventListener('offline',refresh);window.addEventListener('hashchange',function(){if(location.hash==='#ai-teacher')refresh();});
   setTimeout(refresh,100);
 });
 window.AITeacher={refresh:refresh,send:send,explain:explain,quickAction:quickAction};
})();