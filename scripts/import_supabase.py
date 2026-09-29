#!/usr/bin/env python3
"""Idempotent PostgreSQL/Supabase importer for Phase 2 normalized JSONL.

Requires: psycopg[binary]>=3.1
Environment: SUPABASE_DB_URL (server-side only)

No service-role key is accepted by this script. Use the Supabase Postgres
connection string on a trusted machine/CI job.
"""
from __future__ import annotations
import argparse, json, os, re, sys, uuid
from pathlib import Path
from typing import Any
try:
    import psycopg
except ImportError:
    psycopg = None

JLPT = {"N1","N2","N3","N4","N5"}
KANA_RE = re.compile(r"^[ぁ-ゖ゙゚ァ-ヺー゙゚・　\s]+$")
JP_RE = re.compile(r"[ぁ-ゖァ-ヺ一-龯々〆〇ヶ]")
KANJI_RE = re.compile(r"^[一-龯々〆〇ヶ]$")

SOURCE_META = {
    "JMDict": ("jmdict", "JMDict", "https://www.edrdg.org/jmdict/j_jmdict.html"),
    "KANJIDIC2": ("kanjidic2", "KANJIDIC2", "https://www.edrdg.org/kanjidic/"),
    "KanjiVG": ("kanjivg", "KanjiVG", "https://github.com/KanjiVG/kanjivg"),
    "Tatoeba": ("tatoeba", "Tatoeba", "https://tatoeba.org/"),
}

def die(msg: str) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(2)

def load_jsonl(path: Path):
    with path.open(encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            if not line.strip():
                continue
            try:
                yield line_no, json.loads(line)
            except json.JSONDecodeError as e:
                yield line_no, {"__invalid__": f"JSON line {line_no}: {e}"}

def nonempty(v: Any) -> bool:
    return isinstance(v, str) and bool(v.strip())

def validate_vocab(row: dict) -> list[str]:
    errors=[]
    sid=str(row.get("source_id","")).strip()
    if not sid.isdigit(): errors.append("invalid_jmdict_source_id")
    kanji=row.get("kanji") or []
    readings=row.get("readings") or []
    if not kanji and not readings: errors.append("missing_kanji_and_reading")
    for r in readings:
        if not nonempty(r) or not KANA_RE.match(r): errors.append("invalid_kana_reading")
    senses=row.get("senses") or []
    if not senses: errors.append("empty_meanings")
    if not any(nonempty(g.get("text")) for s in senses for g in (s.get("glosses") or [])): errors.append("empty_meanings")
    for k in kanji:
        if not nonempty(k) or not JP_RE.search(k): errors.append("invalid_japanese_form")
    return sorted(set(errors))

def validate_kanji(row: dict) -> list[str]:
    errors=[]
    char=str(row.get("kanji",""))
    if not KANJI_RE.fullmatch(char): errors.append("invalid_kanji_character")
    if str(row.get("source_id","")).strip()!=char: errors.append("source_id_character_mismatch")
    for r in row.get("readings") or []:
        value=str(r.get("value",""))
        rtype=r.get("type")
        if rtype in {"ja_on","ja_kun","pinyin"} and value and not KANA_RE.match(value) and rtype in {"ja_on","ja_kun"}:
            errors.append("invalid_kana_reading")
    jlpt=row.get("jlpt_level")
    if jlpt and jlpt not in JLPT: errors.append("invalid_jlpt_level")
    if row.get("stroke_count") is not None:
        try:
            if int(row["stroke_count"]) <= 0: errors.append("invalid_stroke_count")
        except Exception: errors.append("invalid_stroke_count")
    return sorted(set(errors))

def validate_kanjivg(row: dict) -> list[str]:
    errors=[]
    if not KANJI_RE.fullmatch(str(row.get("kanji",""))): errors.append("invalid_kanji_character")
    if not nonempty(row.get("source_id")): errors.append("invalid_source_id")
    if int(row.get("stroke_paths",0) or 0) <= 0: errors.append("invalid_stroke_references")
    if "<path" not in str(row.get("svg","")): errors.append("missing_svg_paths")
    return sorted(set(errors))

def validate_example(row: dict) -> list[str]:
    errors=[]
    sid=str(row.get("japanese_sentence_id","")).strip()
    if not sid.isdigit(): errors.append("invalid_tatoeba_sentence_id")
    if not nonempty(row.get("japanese")) or not JP_RE.search(str(row.get("japanese"))): errors.append("invalid_japanese_sentence")
    if not nonempty(row.get("source_id")): errors.append("invalid_source_id")
    return sorted(set(errors))

def source_info(name: str, version: str, license_: str, attribution: str):
    if name not in SOURCE_META: die(f"Unsupported source: {name}")
    key, label, homepage = SOURCE_META[name]
    return key, label, homepage, version, license_, attribution

def get_source(cur, name, version, license_, attribution):
    key,label,homepage,version,license_,attribution=source_info(name,version,license_,attribution)
    cur.execute("""insert into public.content_sources(name,source_key,version,license,attribution,homepage_url)
                   values(%s,%s,%s,%s,%s,%s)
                   on conflict(source_key) do update set version=excluded.version,license=excluded.license,attribution=excluded.attribution
                   returning id""",(label,key,version,license_,attribution,homepage))
    return cur.fetchone()[0], key

def start_import(cur, source_id, version):
    cur.execute("""insert into public.imports(source_id,source_version) values(%s,%s) returning id""",(source_id,version))
    return cur.fetchone()[0]

def finish(cur, batch, stats, status):
    cur.execute("""update public.imports set finished_at=now(),status=%s,records_seen=%s,records_inserted=%s,
                   records_updated=%s,records_skipped=%s,records_rejected=%s,validation_errors=%s,error_report=%s::jsonb
                   where id=%s""",(status,stats["records_seen"],stats["records_inserted"],stats["records_updated"],
                   stats["records_skipped"],stats["records_rejected"],len(stats["errors"]),json.dumps(stats["errors"],ensure_ascii=False),batch))

def vocab(cur,row,source_id,batch,version,license_,attribution,stats):
    sid=str(row["source_id"])
    cur.execute("select id from public.vocabulary where source_key='jmdict' and source_entry_id=%s",(sid,))
    existing=cur.fetchone()
    jp=(row.get("kanji") or [None])[0] or (row.get("readings") or [None])[0]
    if existing:
        vid=existing[0]
        cur.execute("""update public.vocabulary set jp=%s,source_version=%s,license=%s,attribution=%s,import_batch_id=%s where id=%s""",
                    (jp,version,license_,attribution,batch,vid)); stats["records_updated"]+=1
    else:
        cur.execute("""insert into public.vocabulary(source_id,source_key,source_entry_id,source_version,license,attribution,jp,status,import_batch_id)
                       values(%s,'jmdict',%s,%s,%s,%s,%s,'pending_review',%s) returning id""",
                    (source_id,sid,version,license_,attribution,jp,batch)); vid=cur.fetchone()[0]; stats["records_inserted"]+=1
    for reading in row.get("readings") or []:
        cur.execute("""insert into public.vocabulary_readings(vocabulary_id,reading,source_id,source_entry_id,source_version,status)
                       values(%s,%s,%s,%s,%s,'approved') on conflict(vocabulary_id,reading) do update set source_version=excluded.source_version""",
                    (vid,reading,source_id,sid,version))
    for i,sense in enumerate(row.get("senses") or []):
        for gloss in sense.get("glosses") or []:
            if not nonempty(gloss.get("text")): continue
            cur.execute("""insert into public.vocabulary_senses(vocabulary_id,sense_index,language,meaning,part_of_speech,misc,field,dialect,source_id,source_entry_id,source_version,status)
                           values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'approved')
                           on conflict(vocabulary_id,sense_index,language,meaning) do update set source_version=excluded.source_version""",
                        (vid,i,gloss.get("lang") or "eng",gloss["text"],sense.get("part_of_speech") or [],sense.get("misc") or [],sense.get("field") or [],sense.get("dialect") or [],source_id,sid,version))

def kanjidic(cur,row,source_id,batch,version,license_,attribution,stats):
    char=str(row["kanji"]); sid=char
    cur.execute("select id from public.kanji where source_key='kanjidic2' and source_character_id=%s",(sid,))
    existing=cur.fetchone()
    def iv(k):
        try: return int(row[k]) if row.get(k) not in (None,"") else None
        except: return None
    if existing:
        kid=existing[0]
        cur.execute("""update public.kanji set character=%s,grade=%s,stroke_count=%s,frequency=%s,source_version=%s,license=%s,attribution=%s,import_batch_id=%s where id=%s""",
                    (char,iv("grade"),iv("stroke_count"),iv("frequency"),version,license_,attribution,batch,kid)); stats["records_updated"]+=1
    else:
        cur.execute("""insert into public.kanji(source_id,source_key,source_character_id,source_version,license,attribution,character,grade,stroke_count,frequency,status,import_batch_id)
                       values(%s,'kanjidic2',%s,%s,%s,%s,%s,%s,%s,%s,'pending_review',%s) returning id""",
                    (source_id,sid,version,license_,attribution,char,iv("grade"),iv("stroke_count"),iv("frequency"),batch)); kid=cur.fetchone()[0]; stats["records_inserted"]+=1
    for r in row.get("readings") or []:
        if nonempty(r.get("value")):
            cur.execute("""insert into public.kanji_readings(kanji_id,reading,reading_type,reading_status,source_id,source_version,status)
                           values(%s,%s,%s,%s,%s,%s,'approved') on conflict(kanji_id,reading,reading_type) do update set reading_status=excluded.reading_status,source_version=excluded.source_version""",
                        (kid,r["value"],r.get("type"),r.get("on_type"),source_id,version))
    level=row.get("jlpt_level")
    if level in JLPT:
        cur.execute("""insert into public.kanji_jlpt(kanji_id,level,source,confidence,status,source_version,attribution,import_batch_id)
                       values(%s,%s,'KANJIDIC2','uncertain','pending_review',%s,%s,%s)
                       on conflict(kanji_id,level,source) do update set source_version=excluded.source_version,attribution=excluded.attribution,import_batch_id=excluded.import_batch_id""",
                    (kid,level,version,attribution,batch))

def kanjivg(cur,row,source_id,batch,version,license_,attribution,stats):
    char=row["kanji"]
    cur.execute("select id from public.kanji where character=%s order by case when source_key='kanjidic2' then 0 else 1 end limit 1",(char,))
    existing=cur.fetchone()
    if not existing:
        stats["records_skipped"]+=1
        return
    kid=existing[0]; svg=str(row.get("svg","")); asset=str(row["source_id"])
    paths=re.findall(r'<path[^>]*\\bd="([^"]+)"', svg)
    paths += re.findall(r"<path[^>]*\\bd='([^']+)'", svg)
    for n,path in enumerate(paths,1):
        cur.execute("""insert into public.kanji_strokes(kanji_id,source_id,source_asset_id,source_version,stroke_number,svg_path,svg_asset,status,import_batch_id)
                       values(%s,%s,%s,%s,%s,%s,%s,'approved',%s)
                       on conflict(kanji_id,source_asset_id,stroke_number) do update set svg_path=excluded.svg_path,source_version=excluded.source_version,import_batch_id=excluded.import_batch_id""",
                    (kid,source_id,asset,version,n,path,svg,batch))
    stats["records_inserted"]+=1

def tatoeba(cur,row,source_id,batch,version,license_,attribution,stats):
    sid=str(row["japanese_sentence_id"])
    cur.execute("select id from public.example_sentences where source_key='tatoeba' and source_sentence_id=%s",(sid,))
    existing=cur.fetchone()
    if existing:
        eid=existing[0]
        cur.execute("""update public.example_sentences set japanese=%s,source_version=%s,license=%s,attribution=%s,import_batch_id=%s where id=%s""",
                    (row["japanese"],version,license_,attribution,batch,eid)); stats["records_updated"]+=1
    else:
        cur.execute("""insert into public.example_sentences(source_id,source_key,source_sentence_id,source_version,license,attribution,japanese,status,import_batch_id)
                       values(%s,'tatoeba',%s,%s,%s,%s,%s,'pending_review',%s) returning id""",
                    (source_id,sid,version,license_,attribution,row["japanese"],batch)); eid=cur.fetchone()[0]; stats["records_inserted"]+=1
    if nonempty(row.get("translation")):
        cur.execute("""insert into public.example_translations(example_sentence_id,source_translation_id,language,translation,source,source_version,license,attribution,status,import_batch_id)
                       values(%s,%s,%s,%s,'Tatoeba',%s,%s,%s,'pending_review',%s)""",
                    (eid,str(row.get("translation_sentence_id") or ""),row.get("translation_language") or "",row["translation"],version,license_,attribution,batch))

def main():
    if psycopg is None: die("Install psycopg[binary]>=3.1")
    p=argparse.ArgumentParser()
    p.add_argument("--source",choices=list(SOURCE_META),required=True)
    p.add_argument("--input",type=Path,required=True)
    p.add_argument("--source-version",required=True)
    p.add_argument("--license",required=True)
    p.add_argument("--attribution",required=True)
    p.add_argument("--database-url",default=os.getenv("SUPABASE_DB_URL"))
    args=p.parse_args()
    if not args.database_url: die("SUPABASE_DB_URL is required; never use a service-role key here.")
    validators={"JMDict":validate_vocab,"KANJIDIC2":validate_kanji,"KanjiVG":validate_kanjivg,"Tatoeba":validate_example}
    handlers={"JMDict":vocab,"KANJIDIC2":kanjidic,"KanjiVG":kanjivg,"Tatoeba":tatoeba}
    stats={"records_seen":0,"records_inserted":0,"records_updated":0,"records_skipped":0,"records_rejected":0,"errors":[]}
    with psycopg.connect(args.database_url) as conn:
        with conn.cursor() as cur:
            source_id,key=get_source(cur,args.source,args.source_version,args.license,args.attribution)
            batch=start_import(cur,source_id,args.source_version)
            try:
                for line_no,row in load_jsonl(args.input):
                    stats["records_seen"]+=1
                    if "__invalid__" in row:
                        stats["records_rejected"]+=1; stats["errors"].append({"line":line_no,"errors":[row["__invalid__"]]}); continue
                    errors=validators[args.source](row)
                    if errors:
                        stats["records_rejected"]+=1; stats["errors"].append({"line":line_no,"source_id":row.get("source_id"),"errors":errors}); continue
                    try:
                        handlers[args.source](cur,row,source_id,batch,args.source_version,args.license,args.attribution,stats)
                    except Exception as exc:
                        stats["records_rejected"]+=1; stats["errors"].append({"line":line_no,"source_id":row.get("source_id"),"errors":[str(exc)]})
                        conn.rollback()
                        cur=conn.cursor()
                        source_id,key=get_source(cur,args.source,args.source_version,args.license,args.attribution)
                        batch=start_import(cur,source_id,args.source_version)
                status="completed" if not stats["errors"] else "partial"
                finish(cur,batch,stats,status)
                conn.commit()
            except Exception:
                conn.rollback()
                raise
    print(json.dumps({**stats,"batch_status":status},ensure_ascii=False,indent=2))
if __name__=="__main__":
    main()
