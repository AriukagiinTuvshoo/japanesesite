#!/usr/bin/env python3
import json, tempfile, subprocess, sys
from pathlib import Path
import importlib.util

ROOT=Path(__file__).resolve().parents[1]
PIPE=ROOT/'scripts'/'jlpt_data_pipeline.py'
IMP=ROOT/'scripts'/'import_supabase.py'
SQL='\n'.join(p.read_text(encoding='utf-8') for p in sorted((ROOT/'supabase'/'migrations').glob('*.sql')))

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod

pipe=load('pipeline',PIPE)
imp=load('importer',IMP)

def assert_true(v,msg):
    if not v: raise AssertionError(msg)

def test_validation_rules():
    assert_true(imp.validate_vocab({'source_id':'100','kanji':['食べる'],'readings':['たべる'],'senses':[{'glosses':[{'text':'eat'}]}]})==[],'valid vocabulary rejected')
    assert_true('invalid_kana_reading' in imp.validate_vocab({'source_id':'100','kanji':['食べる'],'readings':['abc'],'senses':[{'glosses':[{'text':'eat'}]}]}),'invalid kana accepted')
    assert_true('invalid_jlpt_level' in imp.validate_kanji({'source_id':'食','kanji':'食','jlpt_level':'N0','readings':[]}),'invalid JLPT accepted')
    assert_true('invalid_stroke_references' in imp.validate_kanjivg({'source_id':'食.svg','kanji':'食','stroke_paths':0,'svg':'<svg></svg>'}),'invalid stroke data accepted')
    assert_true('invalid_tatoeba_sentence_id' in imp.validate_example({'japanese_sentence_id':'x','japanese':'食べる','source_id':'x:1'}),'invalid Tatoeba id accepted')

def test_pipeline_jmdict():
    xml='''<?xml version="1.0"?><JMdict><entry><ent_seq>100</ent_seq><k_ele><keb>食べる</keb></k_ele><r_ele><reb>たべる</reb></r_ele><sense><pos>v1</pos><gloss>to eat</gloss></sense></entry></JMdict>'''
    with tempfile.TemporaryDirectory() as d:
        src=Path(d)/'JMdict_e';src.write_text(xml,encoding='utf-8')
        out=Path(d)/'out';out.mkdir()
        count=pipe.write_jsonl(out/'vocabulary.jsonl',pipe.parse_jmdict(src))
        row=json.loads((out/'vocabulary.jsonl').read_text(encoding='utf-8').splitlines()[0])
        assert_true(count==1,'JMDict parser count mismatch')
        assert_true(row['source_id']=='100' and row['readings']==['たべる'],'JMDict normalization mismatch')

def test_sql_contract():
    required=['content_sources','imports','vocabulary','vocabulary_readings','vocabulary_senses','vocabulary_jlpt','kanji','kanji_readings','kanji_jlpt','kanji_vocabulary','kanji_strokes','example_sentences','example_translations','audio_assets','translations','mnemonics','admin_reviews']
    for table in required: assert_true(('table if not exists public.'+table) in SQL,f'missing table {table}')
    for token in ['pending_review','published','create extension if not exists pg_trgm','row level security','search_vocabulary','search_kanji']:
        assert_true(token.lower() in SQL.lower(),f'missing SQL contract: {token}')
    assert_true('confidence text not null' in SQL,'JLPT confidence missing')
    assert_true("status public.content_status not null default 'pending_review'" in SQL,'review status default missing')

def main():
    test_validation_rules();test_pipeline_jmdict();test_sql_contract()
    print('phase2 static/data-contract tests: PASS')
if __name__=='__main__':main()
