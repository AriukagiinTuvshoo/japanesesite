/* Phase 3 AI response/action validator. AI output never becomes executable state directly. */
(function(){
 'use strict';
 var CONTENT_TYPES=['vocabulary','kanji','grammar'];
 var ACTIONS=['EXPLAIN','QUIZ','STUDY_PLAN','REVIEW_MISTAKES','WRITING_CORRECTION','CONVERSATION','JLPT_COACH'];
 function asText(v){return v==null?'':String(v);}
 function validLevel(v){return !v||/^N[1-5]$/.test(v);}
 function itemExists(type,id){return CONTENT_TYPES.includes(type)&&!!LearningData.find(type,String(id||''));}
 function parseJsonMaybe(text){var raw=asText(text).trim(),candidate=raw,fence=raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);if(fence)candidate=fence[1].trim();try{return JSON.parse(candidate);}catch{return null;}}
 function validateIds(type,ids,maxCount){if(!CONTENT_TYPES.includes(type)||!Array.isArray(ids)||ids.length<1||ids.length>maxCount)return null;var unique=[...new Set(ids.map(function(x){return String(x||'');}))];if(unique.length!==ids.length)return null;return unique.every(function(id){return itemExists(type,id);})?unique:null;}
 function validate(raw,options){
   options=options||{};
   if(!raw||typeof raw!=='object')return {valid:false,error:'invalid_object'};
   var type=String(raw.type||'').toUpperCase();if(!ACTIONS.includes(type))return {valid:false,error:'unsupported_action'};
   if(type==='EXPLAIN'){if(!itemExists(raw.contentType,raw.contentId))return {valid:false,error:'invalid_content'};return {valid:true,action:{type:type,contentType:raw.contentType,contentId:String(raw.contentId)}};}
   if(type==='QUIZ'){var ids=validateIds(raw.contentType,raw.contentIds,10);var mode=String(raw.mode||'mixed');if(options.expectedContentType&&raw.contentType!==options.expectedContentType)return {valid:false,error:'wrong_content_type'};if(Array.isArray(options.allowedIds)&&ids&&ids.some(function(id){return !options.allowedIds.includes(id);}))return {valid:false,error:'content_not_in_candidate_set'};var allowed=['mixed','ja-mn','mn-ja','reading','sentence','kanji-related-word','pattern-title','example-pattern'];if(!ids||!validLevel(raw.level)||!allowed.includes(mode))return {valid:false,error:'invalid_quiz_action'};return {valid:true,action:{type:type,contentType:raw.contentType,contentIds:ids,level:raw.level||null,mode:mode,questionCount:Math.min(10,Math.max(1,Number(raw.questionCount)||ids.length))}};}
   if(type==='STUDY_PLAN'){if(!Array.isArray(raw.items)||raw.items.length>10)return {valid:false,error:'invalid_plan'};var items=raw.items.map(function(x){if(!x||!itemExists(x.contentType,x.contentId))return null;return {contentType:x.contentType,contentId:String(x.contentId),minutes:Math.min(60,Math.max(1,Number(x.minutes)||1)),reason:asText(x.reason).slice(0,240)};}).filter(Boolean);if(items.length!==raw.items.length)return {valid:false,error:'invalid_plan_content'};return {valid:true,action:{type:type,items:items,summary:asText(raw.summary).slice(0,500)}};}
   if(type==='REVIEW_MISTAKES'){var ids2=Array.isArray(raw.contentIds)?[...new Set(raw.contentIds.map(String))]:[];var mistakes=LearningStore.mistakes();if(ids2.some(function(id){return !mistakes.some(function(m){return m.id===id;});}))return {valid:false,error:'invalid_mistake_id'};return {valid:true,action:{type:type,contentIds:ids2.slice(0,10)}};}
   if(type==='WRITING_CORRECTION'||type==='CONVERSATION'||type==='JLPT_COACH')return {valid:true,action:{type:type,level:validLevel(raw.level)?(raw.level||null):null}};
   return {valid:false,error:'unhandled'};
 }
 window.AIActions={ACTIONS:ACTIONS,parseAndValidate:function(text,options){var parsed=parseJsonMaybe(text);return parsed?validate(parsed,options):{valid:false,error:'no_structured_action',rawText:asText(text)};},validate:validate,itemExists:itemExists};
})();