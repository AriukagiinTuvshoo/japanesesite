/* Phase 2 shared learning/data/state engine. No framework dependency. */
(function(){
  'use strict';

  const INTERVALS_DAYS=[1,3,7,14,30];
  const STATE_KEY='nihongo-learning-state-v2';
  const TYPES=['vocabulary','kanji','grammar'];
  const STATUS=['NEW','LEARNING','FAMILIAR','WEAK','MASTERED'];

  function safeJSON(raw,fallback){
    try{const v=JSON.parse(raw);return v==null?fallback:v}catch{return fallback}
  }
  function clone(value){return safeJSON(JSON.stringify(value),value)}

  function normalizeGrammar(){
    const rows=[];
    const pushRows=(level,list)=>{
      (list||[]).forEach(x=>{
        if(!x) return;
        const title=Array.isArray(x.title)?x.title:['','',''];
        const pattern=x.grammar||x.grammarEn||x.grammarJa||x.jp;
        rows.push({
          id:'grammar:'+level+':'+x.tag,
          type:'grammar',level,tag:String(x.tag),
          titleMn:title[0]||pattern,titleEn:title[1]||pattern,titleJa:title[2]||pattern,
          pattern:pattern||'',
          example:x.jp||'',
          reading:x.reading||'',
          mn:x.mn||'',en:x.en||'',ja:x.ja||'',
          explanationMn:x.mn||'',explanationEn:x.en||'',explanationJa:x.ja||''
        });
      });
    };
    pushRows('N5',typeof STARTER_LESSONS!=='undefined'?STARTER_LESSONS:[]);
    if(typeof MORE_LESSONS!=='undefined'){
      Object.entries(MORE_LESSONS).forEach(([level,list])=>pushRows(level,list));
    }
    return rows.filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i);
  }

  function normalizeKanji(){
    const map=new Map();
    const kanjiRe=/[一-龯々〆〇ヶ]/g;
    (typeof WORDS!=='undefined'?WORDS:[]).forEach(word=>{
      const chars=[...new Set(String(word.jp||'').match(kanjiRe)||[])];
      chars.forEach(char=>{
        const id='kanji:'+char;
        if(!map.has(id)) map.set(id,{id,type:'kanji',char,levels:new Set(),related:[]});
        const item=map.get(id);
        item.levels.add(word.level);
        if(!item.related.some(x=>x.jp===word.jp)) item.related.push({
          jp:word.jp,reading:word.reading,mn:word.mn,en:word.en,level:word.level
        });
      });
    });
    return [...map.values()].map(x=>{
      const levels=[...x.levels].sort((a,b)=>Number(b.slice(1))-Number(a.slice(1)));
      const related=[...x.related].sort((a,b)=>Number(a.level.slice(1))-Number(b.level.slice(1)));
      return {id:x.id,type:'kanji',char:x.char,level:levels[0]||'N5',levels,related,source:'derived-from-vocabulary'};
    });
  }

  const LearningData={
    vocabulary:()=>typeof WORDS!=='undefined'?WORDS.map((x,i)=>({
      id:'vocabulary:'+x.jp,type:'vocabulary',index:i,jp:x.jp,reading:x.reading,mn:x.mn,en:x.en,
      level:x.level,example:x.example||'',exMn:x.exMn||'',exEn:x.exEn||''
    })) : [],
    grammar:()=>normalizeGrammar(),
    kanji:()=>normalizeKanji(),
    get(type){return this[type]?this[type]():[]},
    find(type,id){return this.get(type).find(x=>x.id===id)||null}
  };

  const emptyState=()=>({
    version:2,
    settings:{
      language:(typeof language!=='undefined'&&['mn','en','ja'].includes(language))?language:'mn',
      level:(typeof level!=='undefined'&&/^N[1-5]$/.test(level))?level:'N5',
      dailyGoal:20
    },
    progress:{vocabulary:{},kanji:{},grammar:{}},
    favorites:{vocabulary:[],kanji:[],grammar:[]},
    mistakes:{},
    quizHistory:[],
    studySessions:[],
    meta:{quizBest:0},
    streak:{count:0,lastStudy:''},
    legacy:{lessonDone:[]}
  });

  function migrateLegacy(){
    const state=emptyState();
    const saved=safeJSON(localStorage.getItem('nihongo-saved')||'[]',[]);
    const done=safeJSON(localStorage.getItem('nihongo-done')||'[]',[]);
    const sessions=safeJSON(localStorage.getItem('nihongo-study-sessions')||'[]',[]);
    state.favorites.vocabulary=Array.isArray(saved)?saved.map(x=>String(x).startsWith('vocabulary:')?String(x).slice(10):String(x)).filter(Boolean):[];
    state.legacy.lessonDone=Array.isArray(done)?done:[];
    state.studySessions=Array.isArray(sessions)?sessions.filter(x=>x&&x.startedAt):[];
    state.settings.dailyGoal=Math.max(1,Number(localStorage.getItem('nihongo-daily-goal')||20)||20);
    state.settings.level=(localStorage.getItem('nihongo-level')||state.settings.level);
    state.settings.language=(localStorage.getItem('nihongo-language')||state.settings.language);
    state.streak={
      count:Math.max(0,Number(localStorage.getItem('nihongo-streak')||0)||0),
      lastStudy:localStorage.getItem('nihongo-last-study')||''
    };
    state.meta.quizBest=Math.max(0,Number(localStorage.getItem('nihongo-quiz-best')||0)||0);
    return state;
  }

  function normalizeState(input){
    const base=emptyState(), s=(input&&typeof input==='object')?input:{};
    const out={...base,...s};
    out.settings={...base.settings,...(s.settings||{})};
    out.progress={...base.progress,...(s.progress||{})};
    TYPES.forEach(t=>{out.progress[t]={...(s.progress&&s.progress[t]||{})};});
    out.favorites={...base.favorites,...(s.favorites||{})};
    TYPES.forEach(t=>{out.favorites[t]=Array.isArray(out.favorites[t])?out.favorites[t]:[];});
    out.mistakes=(s.mistakes&&typeof s.mistakes==='object')?s.mistakes:{};
    out.quizHistory=Array.isArray(s.quizHistory)?s.quizHistory:[];
    out.studySessions=Array.isArray(s.studySessions)?s.studySessions.filter(x=>x&&x.startedAt):[];
    out.meta={...base.meta,...(s.meta||{})};
    out.streak={...base.streak,...(s.streak||{})};
    out.legacy={...base.legacy,...(s.legacy||{})};
    out.settings.dailyGoal=Math.max(1,Number(out.settings.dailyGoal)||20);
    out.settings.level=/^N[1-5]$/.test(out.settings.level)?out.settings.level:'N5';
    out.settings.language=['mn','en','ja'].includes(out.settings.language)?out.settings.language:'mn';
    return out;
  }

  const LearningStore={
    state:null,
    key:STATE_KEY,
    load(){
      if(this.state)return this.state;
      const raw=localStorage.getItem(this.key);
      this.state=normalizeState(raw?safeJSON(raw,{}):migrateLegacy());
      this.syncFromLegacy(false);
      this.save(false);
      return this.state;
    },
    save(syncLegacy=true){
      this.state=normalizeState(this.state);
      try{localStorage.setItem(this.key,JSON.stringify(this.state))}catch{}
      if(syncLegacy)this.syncToLegacy(false);
      return this.state;
    },
    syncFromLegacy(saveAfter=true){
      const s=this.state||emptyState();
      const sessions=safeJSON(localStorage.getItem('nihongo-study-sessions')||'null',null);
      if(Array.isArray(sessions)){
        const known=new Set(s.studySessions.map(x=>x.startedAt+'|'+x.endedAt+'|'+x.duration));
        sessions.filter(x=>x&&x.startedAt).forEach(x=>{
          const sig=x.startedAt+'|'+x.endedAt+'|'+x.duration;
          if(!known.has(sig))s.studySessions.push(x);
        });
      }
      const legacySaved=safeJSON(localStorage.getItem('nihongo-saved')||'null',null);
      if(Array.isArray(legacySaved)&&legacySaved.length){
        const normalized=legacySaved.map(x=>String(x).startsWith('vocabulary:')?String(x).slice(11):String(x));
        s.favorites.vocabulary=[...new Set([...s.favorites.vocabulary,...normalized])];
      }
      const legacyLevel=localStorage.getItem('nihongo-level');
      if(/^N[1-5]$/.test(legacyLevel||''))s.settings.level=legacyLevel;
      const legacyGoal=Number(localStorage.getItem('nihongo-daily-goal')||0);
      if(legacyGoal>0)s.settings.dailyGoal=legacyGoal;
      const legacyLang=localStorage.getItem('nihongo-language');
      if(['mn','en','ja'].includes(legacyLang||''))s.settings.language=legacyLang;
      const legacyStreak=Number(localStorage.getItem('nihongo-streak')||0);
      if(legacyStreak>0)s.streak.count=legacyStreak;
      s.streak.lastStudy=localStorage.getItem('nihongo-last-study')||s.streak.lastStudy;
      this.state=normalizeState(s);
      if(saveAfter)this.save(false);
      return this.state;
    },
    syncToLegacy(saveState=true){
      const s=this.load();
      try{
        localStorage.setItem('nihongo-saved',JSON.stringify(s.favorites.vocabulary));
        localStorage.setItem('nihongo-level',s.settings.level);
        localStorage.setItem('nihongo-daily-goal',String(s.settings.dailyGoal));
        localStorage.setItem('nihongo-streak',String(s.streak.count||0));
        if(s.streak.lastStudy)localStorage.setItem('nihongo-last-study',s.streak.lastStudy);
        localStorage.setItem('nihongo-study-sessions',JSON.stringify(s.studySessions.slice(-200)));
        if(s.meta.quizBest)localStorage.setItem('nihongo-quiz-best',String(s.meta.quizBest));
      }catch{}
      if(saveState){try{localStorage.setItem(this.key,JSON.stringify(s))}catch{}}
      return s;
    },
    setSetting(key,value){
      const s=this.load();
      if(key==='level'&&/^N[1-5]$/.test(value))s.settings.level=value;
      else if(key==='language'&&['mn','en','ja'].includes(value))s.settings.language=value;
      else if(key==='dailyGoal')s.settings.dailyGoal=Math.max(1,Number(value)||20);
      this.save();
      return s;
    },
    getProgress(type,id){
      const s=this.load();
      if(!s.progress[type][id])s.progress[type][id]={
        seen:0,practiced:0,correct:0,incorrect:0,answers:0,
        favorite:false,status:'NEW',intervalIndex:-1,nextReviewAt:null,lastAnswerAt:null,lastCorrect:null
      };
      return s.progress[type][id];
    },
    markViewed(type,id){
      const p=this.getProgress(type,id);p.seen=(p.seen||0)+1;
      if(p.status==='NEW')p.status='LEARNING';
      this.save();return p;
    },
    markPracticed(type,id){
      const p=this.getProgress(type,id);p.practiced=(p.practiced||0)+1;
      if(p.status==='NEW')p.status='LEARNING';
      this.save();return p;
    },
    setFavorite(type,id,on){
      const s=this.load(),arr=s.favorites[type]||[];
      s.favorites[type]=on?[...new Set([...arr,id])]:arr.filter(x=>x!==id);
      const p=this.getProgress(type,id);p.favorite=on;
      this.save();return on;
    },
    getStatus(p){
      const correct=Number(p.correct||0),wrong=Number(p.incorrect||0);
      if(correct>=5&&(p.intervalIndex||-1)>=4&&wrong<=Math.max(1,Math.floor(correct*.25)))return 'MASTERED';
      if(wrong>correct&&wrong>0)return 'WEAK';
      if(correct>=2)return 'FAMILIAR';
      if((p.seen||p.practiced||p.answers))return 'LEARNING';
      return 'NEW';
    },
    recordAnswer(type,id,{correct,selectedAnswer='',correctAnswer='',source='quiz'}={}){
      const s=this.load(),p=this.getProgress(type,id),now=Date.now();
      p.answers=(p.answers||0)+1;p.lastAnswerAt=now;p.lastCorrect=!!correct;
      if(correct){
        p.correct=(p.correct||0)+1;
        p.intervalIndex=Math.min(INTERVALS_DAYS.length-1,(p.intervalIndex??-1)+1);
        const days=INTERVALS_DAYS[Math.max(0,p.intervalIndex)];
        p.nextReviewAt=now+days*86400000;
        const m=s.mistakes[id];if(m)m.correctCount=(m.correctCount||0)+1;
      }else{
        p.incorrect=(p.incorrect||0)+1;
        p.intervalIndex=Math.max(-1,(p.intervalIndex??-1)-1);
        p.nextReviewAt=now+86400000;
        s.mistakes[id]={
          ...(s.mistakes[id]||{}),contentId:id,type,selectedAnswer,correctAnswer,
          count:((s.mistakes[id]&&s.mistakes[id].count)||0)+1,
          wrongCount:((s.mistakes[id]&&s.mistakes[id].wrongCount)||0)+1,lastMistakeAt:now,source,
          correctCount:((s.mistakes[id]&&s.mistakes[id].correctCount)||0)
        };
      }
      p.status=this.getStatus(p);
      this.save();
      return p;
    },
    scheduleReview(type,id,correct){
      return this.recordAnswer(type,id,{correct,source:'review'});
    },
    due(type){
      const s=this.load(),now=Date.now(),types=type?[type]:TYPES,out=[];
      types.forEach(t=>{
        Object.entries(s.progress[t]||{}).forEach(([id,p])=>{
          if(p&&p.nextReviewAt&&Number(p.nextReviewAt)<=now){
            const item=LearningData.find(t,id);if(item)out.push({type:t,id,progress:p,item});
          }
        });
      });
      return out.sort((a,b)=>(a.progress.nextReviewAt||0)-(b.progress.nextReviewAt||0));
    },
    mistakes(type){
      const s=this.load(),ids=Object.keys(s.mistakes||{}).filter(id=>!type||s.mistakes[id].type===type);
      return ids.map(id=>({id,...s.mistakes[id],item:LearningData.find(s.mistakes[id].type,id),progress:this.getProgress(s.mistakes[id].type,id)})).filter(x=>x.item);
    },
    recordQuizResult(result){
      const s=this.load();
      s.quizHistory.push({...result,completedAt:Date.now()});
      s.quizHistory=s.quizHistory.slice(-100);
      const pct=result.total?Math.round(result.correct/result.total*100):0;
      s.meta.quizBest=Math.max(Number(s.meta.quizBest||0),pct);
      this.save();return pct;
    },
    getAccuracy(type){
      const s=this.load(),ps=Object.values(s.progress[type]||{}),correct=ps.reduce((n,p)=>n+Number(p.correct||0),0),answers=ps.reduce((n,p)=>n+Number(p.answers||0),0);
      return {correct,answers,accuracy:answers?Math.round(correct/answers*100):0};
    },
    stats(type,levelFilter){
      const items=LearningData.get(type).filter(x=>!levelFilter||x.level===levelFilter||Array.isArray(x.levels)&&x.levels.includes(levelFilter));
      const counts={NEW:0,LEARNING:0,FAMILIAR:0,WEAK:0,MASTERED:0};
      items.forEach(item=>{const p=this.getProgress(type,item.id);const st=this.getStatus(p);counts[st]++;});
      return {total:items.length,counts};
    },
    startActivity(activity){
      try{if(typeof setStudyActivity==='function')setStudyActivity(activity);if(typeof phase1StartedAt!=='undefined'&&!phase1StartedAt&&typeof startPhase1Session==='function')startPhase1Session(activity);else if(typeof setStudyActivity==='function')setStudyActivity(activity);}catch{}
    },
    stopActivity(){
      try{if(typeof phase1StartedAt!=='undefined'&&phase1StartedAt&&typeof startPhase1Session==='function')startPhase1Session();}catch{}
      this.syncFromLegacy();
    }
  };

  function shuffle(a){
    const out=a.slice();
    for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
    return out;
  }
  function uniqueValues(items){return [...new Set(items.filter(x=>x!==undefined&&x!==null&&String(x)!==''))];}
  function distractors(all,current,count=3){
    const pool=shuffle(uniqueValues(all.filter(x=>x!==current)));
    return pool.slice(0,count);
  }

  const QuizEngine={
    createQuiz({type,items,mode='mixed',count=10,level:levelFilter,onlyMistakes=false}={}){
      const catalog=LearningData.get(type).filter(x=>!levelFilter||x.level===levelFilter||Array.isArray(x.levels)&&x.levels.includes(levelFilter));
      const pickedPool=Array.isArray(items)?items.filter(x=>catalog.some(y=>y.id===x.id)):catalog;
      const picked=onlyMistakes
        ? pickedPool.filter(x=>LearningStore.mistakes(type).some(m=>m.id===x.id))
        : shuffle(pickedPool);
      return shuffle(picked).slice(0,Math.min(count,picked.length)).map(item=>this.buildQuestion(type,item,mode,catalog));
    },
    buildQuestion(type,item,mode,source){
      if(type==='vocabulary'){
        const m=mode==='mixed'?['ja-mn','mn-ja','reading','sentence'][Math.floor(Math.random()*4)]:mode;
        if(m==='ja-mn'){
          const opts=shuffle([item.mn,...distractors(source.map(x=>x.mn),item.mn)]).slice(0,4);
          return {id:item.id,type,mode:m,prompt:item.jp,subprompt:item.reading,choices:opts,correct:opts.indexOf(item.mn),correctValue:item.mn,item};
        }
        if(m==='mn-ja'){
          const opts=shuffle([item.jp,...distractors(source.map(x=>x.jp),item.jp)]).slice(0,4);
          return {id:item.id,type,mode:m,prompt:item.mn,subprompt:item.level,choices:opts,correct:opts.indexOf(item.jp),correctValue:item.jp,item};
        }
        if(m==='reading'){
          const opts=shuffle([item.reading,...distractors(source.map(x=>x.reading),item.reading)]).slice(0,4);
          return {id:item.id,type,mode:m,prompt:item.jp,subprompt:'読み方',choices:opts,correct:opts.indexOf(item.reading),correctValue:item.reading,item};
        }
        const opts=shuffle([item.jp,...distractors(source.map(x=>x.jp),item.jp)]).slice(0,4);
        return {id:item.id,type,mode:m,prompt:item.example||item.jp,subprompt:'この文と関係がある単語は？',choices:opts,correct:opts.indexOf(item.jp),correctValue:item.jp,item};
      }
      if(type==='kanji'){
        const related=item.related||[];
        const target=related[0];
        const opts=shuffle([target?.jp,...distractors(LearningData.kanji().flatMap(k=>(k.related||[]).map(x=>x.jp)),target?.jp)]).slice(0,4);
        return {id:item.id,type,mode:'kanji-related-word',prompt:item.char,subprompt:'Холбоотой үгийг сонго',choices:opts,correct:opts.indexOf(target?.jp),correctValue:target?.jp||'',item};
      }
      const m=mode==='mixed'?['pattern-title','example-pattern'][Math.floor(Math.random()*2)]:mode;
      if(m==='pattern-title'){
        const all=source.map(x=>x.titleMn);
        const correct=item.titleMn,opts=shuffle([correct,...distractors(all,correct)]).slice(0,4);
        return {id:item.id,type,mode:m,prompt:item.pattern,subprompt:item.level+' · Дүрмийн утгыг сонго',choices:opts,correct:opts.indexOf(correct),correctValue:correct,item};
      }
      const all=source.map(x=>x.pattern);const correct=item.pattern,opts=shuffle([correct,...distractors(all,correct)]).slice(0,4);
      return {id:item.id,type,mode:m,prompt:item.example||item.titleMn,subprompt:'Энэ өгүүлбэрт тохирох дүрмийн загварыг сонго',choices:opts,correct:opts.indexOf(correct),correctValue:correct,item};
    }
  };

  window.LearningData=LearningData;
  window.LearningStore=LearningStore;
  window.QuizEngine=QuizEngine;
  window.Phase2Constants={STATE_KEY,INTERVALS_DAYS,TYPES,STATUS};
  LearningStore.load();
})();