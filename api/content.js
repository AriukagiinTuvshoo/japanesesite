const ALLOWED_TABLES=new Set(['search_vocabulary','get_vocabulary','search_kanji','search_grammar','search_examples']);
function json(res,status,body){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));}
function env(name){const v=process.env[name];return v&&v.trim()?v.trim():null;}
function intParam(v,f,m){const n=Number(v);return Number.isInteger(n)&&n>=0?Math.min(n,m):f;}
module.exports=async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return json(res,405,{error:'method_not_allowed'});}
 const base=env('SUPABASE_URL'),anon=env('SUPABASE_ANON_KEY');if(!base||!anon)return json(res,503,{error:'content_backend_not_configured'});
 const action=String(req.query?.action||'searchVocabulary');
 const map={searchVocabulary:'search_vocabulary',getVocabulary:'get_vocabulary',searchKanji:'search_kanji',searchGrammar:'search_grammar',searchExamples:'search_examples'};
 const rpc=map[action];if(!rpc||!ALLOWED_TABLES.has(rpc))return json(res,400,{error:'invalid_content_action'});
 const q=String(req.query?.q||'').slice(0,120),level=/^N[1-5]$/.test(String(req.query?.level||''))?String(req.query.level):null;
 const limit=intParam(req.query?.limit,20,100),offset=intParam(req.query?.offset,0,100000);
 const args=rpc==='get_vocabulary'?{vocabulary_id:String(req.query?.id||'')}:rpc==='search_examples'?{query_text:q,result_limit:limit,result_offset:offset}:{query_text:q,level_filter:level,result_limit:limit,result_offset:offset};
 if(rpc==='get_vocabulary'&&!/^[0-9a-f-]{36}$/i.test(args.vocabulary_id))return json(res,400,{error:'invalid_vocabulary_id'});
 try{
  const response=await fetch(base.replace(/\/$/,'')+'/rest/v1/rpc/'+rpc,{method:'POST',headers:{apikey:anon,Authorization:'Bearer '+anon,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(args)});
  const raw=await response.text();let payload;try{payload=JSON.parse(raw);}catch{payload={error:'invalid_supabase_response'};}
  if(!response.ok)return json(res,response.status,{error:'content_query_failed',details:payload});
  return json(res,200,{data:payload,source:'supabase'});
 }catch(error){return json(res,502,{error:'content_upstream_unreachable',details:String(error?.message||error)});}
};