(function(){
'use strict';
class ContentRepositoryError extends Error{constructor(message,code='content_backend_error'){super(message);this.name='ContentRepositoryError';this.code=code;}}
async function request(params){
 const query=new URLSearchParams();
 Object.entries(params||{}).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')query.set(k,String(v));});
 const response=await fetch('/api/content?'+query.toString(),{headers:{Accept:'application/json'}});
 let body=null;try{body=await response.json();}catch{}
 if(!response.ok)throw new ContentRepositoryError(body?.error==='content_backend_not_configured'?'Supabase content backend is not configured.':'Supabase content request failed.',body?.error||'content_query_failed');
 if(!body||body.source!=='supabase')throw new ContentRepositoryError('Content response did not come from Supabase.','invalid_content_source');
 return body.data;
}
const VocabularyRepository={searchVocabulary({query='',level=null,limit=20,offset=0}={}){return request({action:'searchVocabulary',q:query,level,limit,offset});},getVocabulary(id){return request({action:'getVocabulary',id});}};
const KanjiRepository={searchKanji({query='',level=null,limit=20,offset=0}={}){return request({action:'searchKanji',q:query,level,limit,offset});}};
const GrammarRepository={searchGrammar({query='',level=null,limit=20,offset=0}={}){return request({action:'searchGrammar',q:query,level,limit,offset});}};
const ExampleRepository={searchExamples({query='',limit=20,offset=0}={}){return request({action:'searchExamples',q:query,limit,offset});}};
window.NihongoRepositories={VocabularyRepository,KanjiRepository,GrammarRepository,ExampleRepository,ContentRepositoryError};
})();