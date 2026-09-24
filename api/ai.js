const MAX_MESSAGES=14;
const MAX_CONTEXT_CHARS=28000;
const MAX_USER_CHARS=4000;
const MAX_TOKENS=1600;

function send(res,status,body){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));}
function extractText(data){
  if(!data)return '';
  if(typeof data.output_text==='string')return data.output_text;
  const content=data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
  if(typeof content==='string')return content;
  if(Array.isArray(content))return content.map(function(x){return typeof x==='string'?x:(x&&typeof x.text==='string'?x.text:'');}).join('').trim();
  const legacy=data.choices&&data.choices[0]&&data.choices[0].text;
  return typeof legacy==='string'?legacy:'';
}
module.exports=async function(req,res){
  if(req.method!=='POST')return send(res,405,{code:'METHOD_NOT_ALLOWED',message:'POST required'});
  const apiKey=process.env.AI_API_KEY;
  const providerUrl=process.env.AI_PROVIDER_URL;
  const model=process.env.AI_MODEL;
  if(!apiKey||!providerUrl)return send(res,503,{code:'AI_NOT_CONFIGURED',message:'Secure AI provider is not configured on the server.'});
  let body=req.body;
  try{if(typeof body==='string')body=JSON.parse(body);}catch{return send(res,400,{code:'INVALID_JSON',message:'Invalid request JSON.'});}
  if(!body||typeof body!=='object')return send(res,400,{code:'INVALID_BODY',message:'Invalid request body.'});
  const messages=Array.isArray(body.messages)?body.messages.filter(function(m){return m&&['user','assistant','system'].includes(m.role)&&typeof m.content==='string';}).slice(-MAX_MESSAGES):[];
  const context=body.context&&typeof body.context==='object'?body.context:null;
  const userMessage=typeof body.userMessage==='string'?body.userMessage.slice(0,MAX_USER_CHARS):'';
  if(!userMessage&&!messages.some(function(m){return m.role==='user';}))return send(res,400,{code:'EMPTY_MESSAGE',message:'A user message is required.'});
  let contextText='';
  try{contextText=JSON.stringify(context||{}).slice(0,MAX_CONTEXT_CHARS);}catch{contextText='{}';}
  const actionName=typeof body.action==='string'?body.action:'CHAT';\n  const system='You are AI先生, a careful Japanese-language teacher for a learner whose application language may be Mongolian, English, or Japanese.\\nUse ONLY the learning facts and candidate content supplied in the context. Never invent content IDs, readings, meanings, JLPT statistics, progress, mistakes, or study history.\\nFor QUIZ, return one JSON object with type QUIZ, contentType, contentIds, mode, questionCount and use only IDs supplied by the request; never invent an ID.\\nFor STUDY_PLAN, return one JSON object with type STUDY_PLAN and only real content IDs from the supplied learning context; this is a recommendation and must not modify state.\\nFor REVIEW_MISTAKES, return one JSON object with type REVIEW_MISTAKES, a short summary, and only IDs from the supplied recentMistakes list.\\nFor EXPLAIN, WRITING_CORRECTION, CONVERSATION, JLPT_COACH, and normal CHAT, answer with normal teaching text instead of JSON.\\nKeep explanations appropriate to the target JLPT and answer in the requested language.\\nRequested action: '+actionName+'\\nSelected learning context follows:\\n'+contextText;
  const forwardMessages=[{role:'system',content:system}].concat(messages.slice(-MAX_MESSAGES));
  const payload={model:model||undefined,messages:forwardMessages,temperature:0.4,max_tokens:MAX_TOKENS};
  const controller=new AbortController(),timeout=setTimeout(function(){controller.abort();},30000);
  try{
    const providerResponse=await fetch(providerUrl,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},body:JSON.stringify(payload),signal:controller.signal});
    const raw=await providerResponse.text();let data={};try{data=raw?JSON.parse(raw):{};}catch{}
    if(!providerResponse.ok)return send(res,502,{code:'AI_PROVIDER_ERROR',message:'The AI provider returned an error.'});
    const text=extractText(data);if(!text)return send(res,502,{code:'AI_EMPTY_RESPONSE',message:'The AI provider returned an empty response.'});
    return send(res,200,{text:text.slice(0,12000),provider:'secure-server'});
  }catch(e){
    if(e&&e.name==='AbortError')return send(res,504,{code:'AI_TIMEOUT',message:'The AI provider timed out.'});
    return send(res,502,{code:'AI_NETWORK_ERROR',message:'The AI provider could not be reached.'});
  }finally{clearTimeout(timeout);}
};