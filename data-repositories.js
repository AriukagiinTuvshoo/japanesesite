(function(){
  'use strict';

  class ContentRepositoryError extends Error {
    constructor(message, code='content_backend_error'){ super(message); this.name='ContentRepositoryError'; this.code=code; }
  }

  async function request(params){
    const query=new URLSearchParams();
    Object.entries(params||{}).forEach(([k,v])=>{ if(v!==undefined&&v!==null&&v!=='') query.set(k,String(v)); });
    const response=await fetch('/api/content?'+query.toString(),{headers:{Accept:'application/json'}});
    let body=null;
    try{ body=await response.json(); }catch{}
    if(!response.ok) throw new ContentRepositoryError(
      body?.error==='content_backend_not_configured'
        ? 'Supabase content backend is not configured.'
        : 'Supabase content request failed.',
      body?.error||'content_query_failed'
    );
    if(!body||body.source!=='supabase') throw new ContentRepositoryError('Content response did not come from Supabase.','invalid_content_source');
    return body.data;
  }

  const VocabularyRepository={
    async searchVocabulary({query='',level=null,limit=20,offset=0}={}) {
      return request({action:'searchVocabulary',q:query,level,limit,offset});
    },
    async getVocabulary(id) {
      return request({action:'getVocabulary',id});
    }
  };

  const KanjiRepository={
    async searchKanji({query='',level=null,limit=20,offset=0}={}) {
      return request({action:'searchKanji',q:query,level,limit,offset});
    }
  };

  const GrammarRepository={
    async searchGrammar() {
      throw new ContentRepositoryError('Grammar API is intentionally deferred until the reviewed grammar source is connected.','grammar_backend_not_ready');
    }
  };

  const ExampleRepository={
    async searchExamples() {
      throw new ContentRepositoryError('Example API is intentionally deferred until Tatoeba import is connected.','example_backend_not_ready');
    }
  };

  window.NihongoRepositories={VocabularyRepository,KanjiRepository,GrammarRepository,ExampleRepository,ContentRepositoryError};
})();
