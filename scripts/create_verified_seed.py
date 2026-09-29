#!/usr/bin/env python3
"""Build a development seed from real normalized source output.

This never fabricates IDs or content. It selects the first N records from
the locally generated JSONL files and writes a small seed bundle.
"""
import argparse, json
from pathlib import Path

def rows(path):
    with path.open(encoding='utf-8') as f:
        return [json.loads(x) for x in f if x.strip()]

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--normalized',type=Path,default=Path('data/normalized'))
    p.add_argument('--out',type=Path,default=Path('data/normalized/seed'))
    args=p.parse_args()
    files={'vocabulary.jsonl':20,'kanji.jsonl':10,'examples.jsonl':10}
    args.out.mkdir(parents=True,exist_ok=True)
    manifest={}
    for name,count in files.items():
        src=args.normalized/name
        if not src.exists():
            raise SystemExit(f'Missing {src}. Run the source normalization pipeline first.')
        selected=rows(src)[:count]
        if len(selected)<count:
            raise SystemExit(f'{src} contains {len(selected)} records; need {count}.')
        if any(not x.get('source_id') for x in selected):
            raise SystemExit(f'{src} contains a record without a source_id.')
        dst=args.out/name
        with dst.open('w',encoding='utf-8') as f:
            for row in selected:f.write(json.dumps(row,ensure_ascii=False)+'\n')
        manifest[name]={'count':len(selected),'source_ids':[x.get('source_id') for x in selected]}
    (args.out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(manifest,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
