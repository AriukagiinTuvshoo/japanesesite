/* V8 Dashboard 3.0 — presentation layer only. Learning state remains LearningStore-owned. */
(function(){
'use strict';
var $=function(s){return document.querySelector(s)}, esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})};
function dayKey(d){return window.NihongoDate&&NihongoDate.localDayKey?NihongoDate.localDayKey(d):new Date(d).toLocaleDateString('sv-SE')}
function fmtDate(d){try{return new Intl.DateTimeFormat(document.documentElement.lang||'mn',{weekday:'long',month:'long',day:'numeric'}).format(d)}catch{return d.toLocaleDateString()}}
function data(){return window.LearningData}
function stats(type){try{return LearningStore.stats(type)}catch{return {total:0,counts:{NEW:0,LEARNING:0,FAMILIAR:0,WEAK:0,MASTERED:0}}}}
function minutesToday(s){var k=dayKey(new Date());return (s.studySessions||[]).filter(function(x){return x.day===k}).reduce(function(a,x){return a+Number(x.duration||0)},0)/60}
function label(type){var l={vocabulary:'Үг',kanji:'Ханз',grammar:'Дүрэм',listening:'Сонсгол',reading:'Уншлага',writing:'Бичих'};return l[type]||type}
function render(){
 var host=$('#dashboard');if(!host||!window.LearningStore)return;
 var s=LearningStore.load(),goal=Math.max(1,Number(s.settings.dailyGoal)||20),mins=minutesToday(s),pct=Math.min(100,Math.round(mins/goal*100)),due=LearningStore.due(),mistakes=LearningStore.mistakes(),lvl=s.settings.level||'N5';
 var modules=['vocabulary','kanji','grammar'].map(function(t){var z=stats(t),learned=(z.counts.FAMILIAR||0)+(z.counts.MASTERED||0),p=z.total?Math.round(learned/z.total*100):0;return "<div class='v8-module'><b>"+learned+"</b><span>"+label(t)+" · "+z.total+"</span><i style='--pct:"+p+"%'></i></div>"}).join('');
 var dueRows=due.slice(0,5).map(function(x){var item=x.item||{},name=item.jp||item.char||item.pattern||item.titleMn||x.id.split(':').pop();return "<div class='v8-row'><div class='v8-row-main'><strong>"+esc(name)+"</strong><span>"+esc(label(x.type))+" · "+esc(x.progress.status||'NEW')+"</span></div><span class='v8-row-badge'>Давт</span></div>"}).join('');
 var rec=mistakes[0] ? 'Сүүлд алдсан зүйлээ дахин шалга' : (due.length?'Өнөөдрийн давталтаа эхлүүл':'Шинэ материал сонгож суралцаарай');
 var recHref=mistakes[0]?'#mistakes':(due.length?'#study-hub':'#learn');
 var heat=(function(){var now=new Date(),arr=[];for(var i=6;i>=0;i--){var d=new Date(now);d.setDate(d.getDate()-i);var k=dayKey(d),m=(s.studySessions||[]).filter(function(x){return x.day===k}).reduce(function(a,x){return a+Number(x.duration||0)},0)/60;var lv=m<=0?0:m<10?1:m<goal?2:m<goal*1.5?3:4;arr.push("<div class='v8-day' data-level='"+lv+"' title='"+esc(k+": "+Math.floor(m)+" мин")+"'><span>"+d.getDate()+"</span></div>")}return arr.join('')})();
 host.innerHTML="<div class='dashboard-v8'><div class='v8-heading'><div><div class='v8-eyebrow'>ӨНӨӨДРИЙН СУРАЛЦАХ ТӨЛӨВ · "+esc(lvl)+"</div><h1>こんにちは 👋</h1><p>Өнөөдөр юу хийхээ нэг дороос харж, бодит ахицаа дараагийн алхамтай холбо.</p></div><div class='v8-date'>"+esc(fmtDate(new Date()))+"</div></div>"+
 "<div class='v8-grid'>"+
 "<article class='v8-card v8-card--hero'><div class='v8-hero-kicker'><span>Өнөөдрийн зорилго</span><strong>"+pct+"%</strong></div><div class='v8-hero-main'><div><h2>"+Math.floor(mins)+" / "+goal+" минут</h2><p>"+(due.length?due.length+" зүйл давтахад бэлэн байна.":"Өнөөдөр одоогоор давтах зүйл бүртгэгдээгүй байна.")+"</p><div class='v8-progress'><i style='width:"+pct+"%'></i></div><div class='v8-actions'><button class='v8-btn primary' id='study-session-btn'>"+(pct>0&&pct<100?'Үргэлжлүүлэх':'Суралцах эхлүүлэх')+"</button><button class='v8-btn' id='v8-review-btn'>Давталт · "+due.length+"</button><span id='session-timer' class='session-timer' aria-live='polite'>00:00</span></div></div></div></article>"+
 "<article class='v8-card'><div class='v8-stat'><div class='v8-stat-icon'>🔥</div><div><span>Дараалсан өдөр</span><strong>"+Number(s.streak.count||0)+"</strong><small>Энэ төхөөрөмж дээр хадгалагдсан бодит streak</small></div></div></article>"+
 "<article class='v8-card'><div class='v8-card-head'><h2>AI зөвлөмж</h2><small>Бодит сургалтын төлөвөөс</small></div><div class='v8-row'><div class='v8-row-main'><strong>"+esc(rec)+"</strong><span>Одоо байгаа progress, review, mistakes дээр үндэслэв.</span></div><a class='v8-row-badge' href='"+recHref+"'>Нээх</a></div></article>"+
 "<article class='v8-card v8-card--wide'><div class='v8-card-head'><h2>Суралцах модулиуд</h2><small>Mastered + Familiar / нийт</small></div><div class='v8-modules'>"+modules+"</div></article>"+
 "<article class='v8-card'><div class='v8-card-head'><h2>Review Inbox</h2><small>"+due.length+" due</small></div><div class='v8-list'>"+(dueRows||"<div class='v8-empty'>Өнөөдөр давтах зүйл алга.</div>")+"</div></article>"+
 "<article class='v8-card v8-card--wide'><div class='v8-card-head'><h2>7 хоногийн хэмнэл</h2><small>Суралцсан минут</small></div><div class='v8-heatmap'>"+heat+"</div></article>"+
 "<article class='v8-card'><div class='v8-card-head'><h2>Achievements</h2><small>Real state only</small></div><div class='v8-empty'>Achievement collection одоогийн LearningStore-д байхгүй тул энд хоосон төлөв харуулж байна.</div></article>"+
 "</div></div>";
 var btn=$('#study-session-btn');if(btn)btn.addEventListener('click',function(){if(window.startPhase1Session)window.startPhase1Session()});
 var rb=$('#v8-review-btn');if(rb)rb.addEventListener('click',function(){location.hash=due.length?'#study-hub':'#learn'});
}
function shell(){
 var top=$('.top-actions');if(top&&!$('#v8-search')){var b=document.createElement('button');b.id='v8-search';b.className='v8-search-btn';b.type='button';b.innerHTML='Хайх <kbd>⌘K</kbd>';top.insertBefore(b,top.firstChild);b.onclick=openCommand}
 var nav=document.querySelector('.mobile-nav');if(nav)nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nav.querySelectorAll('a').forEach(function(x){x.removeAttribute('aria-current')});a.setAttribute('aria-current','page')})});
}
function openCommand(){var c=$('#v8-command');if(!c)return;c.classList.add('is-open');var i=c.querySelector('input');if(i){i.value='';i.focus()} }
function command(){
 if($('#v8-command'))return;
 var c=document.createElement('div');c.id='v8-command';c.className='v8-command';c.innerHTML="<div class='v8-command-panel' role='dialog' aria-modal='true' aria-label='Quick search'><input type='search' placeholder='Үг, ханз, дүрэм, хэсэг хайх…' aria-label='Хайлт'><div class='v8-command-list'></div></div>";document.body.appendChild(c);
 var list=c.querySelector('.v8-command-list'),items=[['Нүүр','#dashboard'],['Сурах','#learn'],['Үгийн сан','#vocabulary'],['Ханз','#kanji'],['Дүрэм','#grammar'],['Давталт','#mistakes'],['Ахиц','#progress'],['Тохиргоо','#settings']];
 function draw(q){q=(q||'').toLowerCase();list.innerHTML=items.filter(function(x){return !q||x[0].toLowerCase().includes(q)}).map(function(x){return "<button type='button' data-h='"+x[1]+"'>"+esc(x[0])+"</button>"}).join('')||"<div class='v8-empty'>Үр дүн алга.</div>";list.querySelectorAll('button').forEach(function(b){b.onclick=function(){location.hash=b.dataset.h;c.classList.remove('is-open')}})}
 c.addEventListener('click',function(e){if(e.target===c)c.classList.remove('is-open')});c.querySelector('input').addEventListener('input',function(e){draw(e.target.value)});draw('');
 document.addEventListener('keydown',function(e){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand()}if(e.key==='Escape')c.classList.remove('is-open')});
}
function boot(){shell();command();render();if(window.Phase2UI&&window.Phase2UI.refresh){var old=window.Phase2UI.refresh;window.Phase2UI.refresh=function(){var r=old.apply(this,arguments);render();return r}}window.addEventListener('storage',render);document.addEventListener('visibilitychange',function(){if(!document.hidden)render()});}
document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,0)});
})();