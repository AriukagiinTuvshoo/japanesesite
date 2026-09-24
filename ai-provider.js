/* Provider-neutral AI boundary. Production calls same-origin /api/ai; no secret is stored in the browser. */
(function(){
 'use strict';
 var endpoint='/api/ai';
 function makeError(code,message,retryable){var e=new Error(message||code);e.code=code;e.retryable=!!retryable;return e;}
 async function request(payload){
   var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},30000);
   try{
     var response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal,credentials:'same-origin',cache:'no-store'});
     var text=await response.text(),data={};try{data=text?JSON.parse(text):{};}catch{data={};}
     if(!response.ok)throw makeError(data.code||'AI_HTTP_ERROR',data.message||'AI service error',response.status>=500||response.status===429);
     if(!data||typeof data.text!=='string'||!data.text.trim())throw makeError('AI_EMPTY_RESPONSE','AI先生から回答を受け取れませんでした。',true);
     return {text:data.text.trim(),requestId:data.requestId||null,provider:data.provider||'secure-server'};
   }catch(e){
     if(e&&e.name==='AbortError')throw makeError('AI_TIMEOUT','AI先生の応答が時間切れになりました。',true);
     if(e&&e.code)throw e;
     throw makeError('AI_NETWORK_ERROR','AI先生に接続できませんでした。',true);
   }finally{clearTimeout(timer);}
 }
 function createMockProvider(){
   return {async request(payload){
     var c=payload&&payload.context||{},a=payload&&payload.action||'CHAT';
     if(a==='QUIZ')return {text:JSON.stringify({type:'QUIZ',contentType:payload.contentType||'vocabulary',contentIds:(payload.candidates||[]).slice(0,Math.min(5,(payload.questionCount||5))),mode:'mixed',questionCount:Math.min(5,(payload.questionCount||5))})};
     if(a==='STUDY_PLAN'){var items=[];(c.dueReviews||[]).slice(0,3).forEach(function(x){items.push({contentType:x.contentType,contentId:x.contentId,minutes:5,reason:'Due review'});});return {text:JSON.stringify({type:'STUDY_PLAN',summary:'Mock development plan based on current learning state.',items:items})};}
     return {text:'[MOCK AI] '+(payload.userMessage||'Learning context received.')};
   }};
 }
 window.AIProvider={request:request,createMockProvider:createMockProvider,endpoint:endpoint};
})();