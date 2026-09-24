/* Phase 3 controlled AI context builder. Only learning-relevant data leaves the browser. */
(function(){
  'use strict';
  var TYPES=['vocabulary','kanji','grammar'];
  function dayKey(date){
    if(window.NihongoDate&&window.NihongoDate.localDayKey)return window.NihongoDate.localDayKey(date||new Date());
    var d=date instanceof Date?date:new Date(date||Date.now());
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  }
  function todayStudyMinutes(state){
    var key=dayKey(new Date());
    return Math.floor(state.studySessions.filter(function(s){return s.day===key}).reduce(function(sum,s){return sum+Number(s.duration||0)},0)/60);
  }
  function recentStudyHistory(state){
    return state.studySessions.slice(-10).map(function(s){return {day:s.day,durationMinutes:Math.floor(Number(s.duration||0)/60),activity:s.activity||'study'};});
  }
  function recentQuizHistory(state){
    return state.quizHistory.slice(-6).map(function(q){return {category:q.category||'mixed',total:Number(q.total||0),correct:Number(q.correct||0),accuracy:Number(q.accuracy||0),completedAt:q.completedAt||null};});
  }
  function existingProgress(state,type,id){
    var p=state.progress[type]&&state.progress[type][id];
    return p&&typeof p==='object'?p:null;
  }
  function summarizeItem(type,item){
    if(!item)return null;
    if(type==='vocabulary')return {contentType:type,contentId:item.id,japanese:item.jp,reading:item.reading||'',meaningMn:item.mn||'',meaningEn:item.en||'',level:item.level};
    if(type==='kanji')return {contentType:type,contentId:item.id,character:item.char,level:item.level,relatedWords:(item.related||[]).slice(0,3).map(function(w){return {japanese:w.jp,reading:w.reading||'',meaningMn:w.mn||'',meaningEn:w.en||''};})};
    return {contentType:type,contentId:item.id,pattern:item.pattern||'',titleMn:item.titleMn||'',titleEn:item.titleEn||'',titleJa:item.titleJa||'',level:item.level,example:item.example||''};
  }
  function weakItems(type,state,limit){
    var items=LearningData.get(type),now=Date.now();
    return items.map(function(item){
      var p=existingProgress(state,type,item.id);if(!p)return null;
      var answers=Number(p.answers||0),correct=Number(p.correct||0),wrong=Number(p.incorrect||0);
      if(!answers&&!wrong&&!p.nextReviewAt)return null;
      var accuracy=answers?Math.round(correct/answers*100):0;
      var due=!!p.nextReviewAt&&Number(p.nextReviewAt)<=now;
      var score=wrong*3+(due?5:0)+(answers>=2?Math.round((100-accuracy)/10):0)+(p.status==='WEAK'?4:0);
      if(score<=0)return null;
      return {score:score,accuracy:accuracy,wrong:wrong,correct:correct,due:due,status:p.status||'NEW',nextReviewAt:p.nextReviewAt||null,item:summarizeItem(type,item)};
    }).filter(Boolean).sort(function(a,b){return b.score-a.score||b.wrong-a.wrong}).slice(0,limit||6);
  }
  function dueReviews(limit){
    return LearningStore.due().slice(0,limit||10).map(function(x){return {contentType:x.type,contentId:x.id,dueAt:x.progress.nextReviewAt,status:x.progress.status||'LEARNING',item:summarizeItem(x.type,x.item)};});
  }
  function favoriteItems(state,limit){
    var out=[];
    TYPES.forEach(function(type){
      (state.favorites[type]||[]).slice(0,limit||4).forEach(function(id){var item=LearningData.find(type,id);if(item)out.push(summarizeItem(type,item));});
    });
    return out.slice(0,limit||10);
  }
  function moduleSummary(type){
    var counts={NEW:0,LEARNING:0,FAMILIAR:0,WEAK:0,MASTERED:0},items=LearningData.get(type);
    items.forEach(function(item){var p=existingProgress(LearningStore.load(),type,item.id);var status=LearningStore.getStatus(p||{});counts[status]++;});
    return {total:items.length,new:counts.NEW,learning:counts.LEARNING,familiar:counts.FAMILIAR,weak:counts.WEAK,mastered:counts.MASTERED};
  }
  function availableForLevel(type,level){
    var items=LearningData.get(type).filter(function(x){return x.level===level||Array.isArray(x.levels)&&x.levels.includes(level);});
    return {total:items.length,candidateIds:items.slice(0,20).map(function(x){return x.id;})};
  }
  function availabilityByLevel(type){
    var result={};['N5','N4','N3','N2','N1'].forEach(function(level){result[level]=availableForLevel(type,level);});return result;
  }
  function build(options){
    options=options||{};
    var state=LearningStore.load(),level=state.settings.level,goal=state.settings.dailyGoal,today=todayStudyMinutes(state);
    var recentMistakes=LearningStore.mistakes().slice().sort(function(a,b){return Number(b.lastMistakeAt||0)-Number(a.lastMistakeAt||0)}).slice(0,10).map(function(m){return {contentType:m.type,contentId:m.id,wrongCount:m.wrongCount||m.count||0,correctCount:m.correctCount||0,lastMistakeAt:m.lastMistakeAt||null,selectedAnswer:m.selectedAnswer||'',correctAnswer:m.correctAnswer||'',item:summarizeItem(m.type,m.item)};});
    return {targetJLPT:level,dailyGoalMinutes:goal,todayStudyMinutes:today,remainingMinutes:Math.max(0,goal-today),streak:Number(state.streak.count||0),vocabulary:moduleSummary('vocabulary'),kanji:moduleSummary('kanji'),grammar:moduleSummary('grammar'),weakAreas:{vocabulary:weakItems('vocabulary',state,6),kanji:weakItems('kanji',state,6),grammar:weakItems('grammar',state,6)},recentMistakes:recentMistakes,recentQuizAccuracy:state.quizHistory.length?Number(state.quizHistory[state.quizHistory.length-1].accuracy||0):0,recentQuizHistory:recentQuizHistory(state),recentStudyHistory:recentStudyHistory(state),dueReviews:dueReviews(10),favoriteItems:favoriteItems(state,10),availability:{vocabulary:availableForLevel('vocabulary',level),kanji:availableForLevel('kanji',level),grammar:availableForLevel('grammar',level),vocabularyByLevel:availabilityByLevel('vocabulary'),kanjiByLevel:availabilityByLevel('kanji'),grammarByLevel:availabilityByLevel('grammar')},currentPage:(location.hash||'#dashboard').slice(1)||'dashboard',language:state.settings.language,action:options.action||'CHAT',selectedItem:options.selectedItem||null,candidates:Array.isArray(options.candidates)?options.candidates.slice(0,20):[]};
  }
  window.AIContextBuilder={build:build,getWeakAreas:function(){return build({action:'WEAK_AREAS'}).weakAreas},dayKey:dayKey};
})();