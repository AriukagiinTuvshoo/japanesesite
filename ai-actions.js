/* Phase 3 AI response/action validator. AI output never becomes executable state directly. */
(function(){
 'use strict';
 var CONTENT_TYPES=['vocabulary','kanji','grammar'];
 var ACTIONS=['EXPLAIN','QUIZ','STUDY_PLAN','REVIEW_MISTAKES','WRITING_CORRECTION','CONVERSATION','JLPT_COACH'];
 var QUIZ_MODES=['mixed','ja-mn','mn-ja','reading','sentence','kanji-related-word','pattern-title','example-pattern'];
 function asText(v){return v==null?'':String(v);}
 function validLevel(v){return !v||/^N[1-5]$/.test(v);}
 function itemExists(type,id){return CONTENT_TYPES.includes(type)&&!!LearningData.find(type,String(id||''));}
 function parseJsonMaybe(text){var raw=asText(text).trim(),candidate=raw,fence=raw.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/i);if(fence)candidate=fence[1].trim();try{return JSON.parse(candidate);}catch{return null;}}
 function uniqueStringIds(ids,maxCount){
   if(!Array.isArray(ids)||ids.length<1||ids.length>maxCount)return null;
   var out=ids.map(function(x){return String(x||'');});
   if(out.some(function(x){return !x;})||new Set(out).size!==out.length)return null;
   return out;
 }
 function validateIds(type,ids,maxCount){
   var unique=uniqueStringIds(ids,maxCount);
   if(!CONTENT_TYPES.includes(type)||!unique)return null;
   return unique.every(function(id){return itemExists(type,id);})?unique:null;
 }
 function inAllowed(id,allowed){return !Array.isArray(allowed)||allowed.length===0||allowed.includes(id);}
 function validate(raw,options){
   options=options||{};
   if(!raw||typeof raw!=='object'||Array.isArray(raw))return {valid:false,error:'invalid_object'};
   var type=String(raw.type||'').toUpperCase();
   if(!ACTIONS.includes(type))return {valid:false,error:'unsupported_action'};
   if(type==='EXPLAIN'){
     if(options.expectedContentType&&raw.contentType!==options.expectedContentType)return {valid:false,error:'wrong_content_type'};
     if(!itemExists(raw.contentType,raw.contentId)||!inAllowed(String(raw.contentId),options.allowedIds))return {valid:false,error:'invalid_content'};
     return {valid:true,action:{type:type,contentType:raw.contentType,contentId:String(raw.contentId)}};
   }
   if(type==='QUIZ'){
     var ids=validateIds(raw.contentType,raw.contentIds,10);
     var mode=String(raw.mode||'mixed');
     if(options.expectedContentType&&raw.contentType!==options.expectedContentType)return {valid:false,error:'wrong_content_type'};
     if(ids&&Array.isArray(options.allowedIds)&&options.allowedIds.length&&ids.some(function(id){return !options.allowedIds.includes(id);}))return {valid:false,error:'content_not_in_candidate_set'};
     var level=raw.level||null;
     var count=Number(raw.questionCount);
     if(!ids||!validLevel(level)||!QUIZ_MODES.includes(mode)||!Number.isInteger(count)||count<1||count>10||count>ids.length)return {valid:false,error:'invalid_quiz_action'};
     return {valid:true,action:{type:type,contentType:raw.contentType,contentIds:ids,level:level,mode:mode,questionCount:count}};
   }
   if(type==='STUDY_PLAN'){
     if(!Array.isArray(raw.items)||raw.items.length<1||raw.items.length>10)return {valid:false,error:'invalid_plan'};
     var seen=new Set();
     var items=raw.items.map(function(x){
       if(!x||!CONTENT_TYPES.includes(x.contentType)||!itemExists(x.contentType,x.contentId))return null;
       var key=x.contentType+':'+String(x.contentId);
       if(seen.has(key))return null;
       seen.add(key);
       var minutes=Number(x.minutes);
       if(!Number.isFinite(minutes)||minutes<1||minutes>60)return null;
       return {contentType:x.contentType,contentId:String(x.contentId),minutes:Math.floor(minutes),reason:asText(x.reason).slice(0,240)};
     });
     if(items.some(function(x){return !x;}))return {valid:false,error:'invalid_plan_content'};
     return {valid:true,action:{type:type,items:items,summary:asText(raw.summary).slice(0,500)}};
   }
   if(type==='REVIEW_MISTAKES'){
     var ids2=uniqueStringIds(raw.contentIds,10);
     var mistakes=LearningStore.mistakes();
     if(!ids2||ids2.some(function(id){return !mistakes.some(function(m){return m.id===id;})||!inAllowed(id,options.allowedIds);})){
       return {valid:false,error:'invalid_mistake_id'};
     }
     return {valid:true,action:{type:type,contentIds:ids2,summary:asText(raw.summary).slice(0,500)}};
   }
   if(type==='WRITING_CORRECTION'||type==='CONVERSATION'||type==='JLPT_COACH'){
     if(raw.level!==undefined&&raw.level!==null&&!validLevel(raw.level))return {valid:false,error:'invalid_level'};
     return {valid:true,action:{type:type,level:raw.level||null}};
   }
   return {valid:false,error:'unhandled'};
 }
 window.AIActions={ACTIONS:ACTIONS,QUIZ_MODES:QUIZ_MODES,parseAndValidate:function(text,options){var parsed=parseJsonMaybe(text);return parsed?validate(parsed,options):{valid:false,error:'no_structured_action',rawText:asText(text)};},validate:validate,itemExists:itemExists};
})();
