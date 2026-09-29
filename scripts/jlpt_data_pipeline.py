#!/usr/bin/env python3
"""
JLPT Master Mongolia — source data ingestion pipeline.

Supported sources:
  - JMDict XML / .gz
  - KANJIDIC2 XML / .gz
  - Tatoeba sentences.tsv + links.csv/tsv
  - KanjiVG SVG directory

The script deliberately keeps source data separate from editorial data.
It produces normalized JSONL files suitable for an admin-review/import step.
It never invents JLPT levels or Mongolian translations.

Example:
  python scripts/jlpt_data_pipeline.py \
    --jmdict data/source/JMdict_e.gz \
    --kanjidic data/source/kanjidic2.xml.gz \
    --tatoeba-sentences data/source/sentences.csv \
    --tatoeba-links data/source/links.csv \
    --kanjivg data/source/kanjivg \
    --out data/normalized
"""

from __future__ import annotations

import argparse
import csv
import gzip
import json
import re
import sys
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET


def open_text(path: Path):
    return gzip.open(path, "rt", encoding="utf-8-sig") if path.suffix == ".gz" else path.open("r", encoding="utf-8-sig")


def text(node: ET.Element | None) -> str | None:
    if node is None or node.text is None:
        return None
    value = node.text.strip()
    return value or None


def parse_jmdict(path: Path) -> Iterable[dict]:
    for event, entry in ET.iterparse(open_text(path), events=("end",)):
        if entry.tag != "entry":
            continue

        ent_seq = text(entry.find("ent_seq"))
        kebs = [text(x.find("keb")) for x in entry.findall("k_ele") if text(x.find("keb"))]
        rebs = [text(x.find("reb")) for x in entry.findall("r_ele") if text(x.find("reb"))]

        senses = []
        for sense in entry.findall("sense"):
            glosses = []
            for gloss in sense.findall("gloss"):
                value = text(gloss)
                if value:
                    glosses.append({
                        "text": value,
                        "lang": gloss.attrib.get("xml:lang", "eng"),
                    })
            senses.append({
                "part_of_speech": [text(x) for x in sense.findall("pos") if text(x)],
                "misc": [text(x) for x in sense.findall("misc") if text(x)],
                "field": [text(x) for x in sense.findall("field") if text(x)],
                "dialect": [text(x) for x in sense.findall("dial") if text(x)],
                "glosses": glosses,
            })

        yield {
            "source": "JMDict",
            "source_id": ent_seq,
            "kanji": kebs,
            "readings": rebs,
            "senses": senses,
            "jlpt_level": None,
            "mongolian": None,
            "review_status": "pending",
        }
        entry.clear()


def parse_kanjidic2(path: Path) -> Iterable[dict]:
    for event, entry in ET.iterparse(open_text(path), events=("end",)):
        if entry.tag != "character":
            continue

        literal = text(entry.find("literal"))
        misc = entry.find("misc")
        rmgroup = entry.find("reading_meaning/rmgroup")

        readings = []
        if rmgroup is not None:
            for reading in rmgroup.findall("reading"):
                value = text(reading)
                if value:
                    readings.append({
                        "value": value,
                        "type": reading.attrib.get("r_type"),
                        "on_type": reading.attrib.get("r_status"),
                    })

        meanings = []
        if rmgroup is not None:
            for meaning in rmgroup.findall("meaning"):
                value = text(meaning)
                if value:
                    meanings.append({
                        "text": value,
                        "lang": meaning.attrib.get("m_lang", "en"),
                    })

        radicals = []
        radical_info = entry.find("radical")
        if radical_info is not None:
            for r in radical_info.findall("rad_value"):
                value = text(r)
                if value:
                    radicals.append({
                        "value": value,
                        "type": r.attrib.get("rad_type"),
                    })

        yield {
            "source": "KANJIDIC2",
            "source_id": literal,
            "kanji": literal,
            "jlpt_level": text(misc.find("jlpt")) if misc is not None else None,
            "grade": text(misc.find("grade")) if misc is not None else None,
            "stroke_count": text(misc.find("stroke_count")) if misc is not None else None,
            "frequency": text(misc.find("freq")) if misc is not None else None,
            "radicals": radicals,
            "readings": readings,
            "meanings": meanings,
            "nanori": [text(x) for x in entry.findall("reading_meaning/nanori") if text(x)],
            "mongolian": None,
            "review_status": "pending",
        }
        entry.clear()


def sniff_tsv(path: Path):
    sample = path.read_text(encoding="utf-8-sig")[:8192]
    return csv.Sniffer().sniff(sample, delimiters="\t,;")


def parse_tatoeba_sentences(path: Path) -> dict[str, dict]:
    result = {}
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f, delimiter="\t")
        for row in reader:
            if not row or row[0].startswith("#") or len(row) < 3:
                continue
            sid, lang, sentence = row[0], row[1], row[2]
            result[sid] = {"id": sid, "lang": lang, "text": sentence}
    return result


def parse_tatoeba_links(path: Path, sentences: dict[str, dict]) -> Iterable[dict]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f, delimiter="\t")
        for row in reader:
            if not row or row[0].startswith("#") or len(row) < 2:
                continue
            left, right = sentences.get(row[0]), sentences.get(row[1])
            if not left or not right:
                continue
            if left["lang"] != "jpn":
                left, right = right, left
            if left["lang"] != "jpn":
                continue
            yield {
                "source": "Tatoeba",
                "source_id": f"{left['id']}:{right['id']}",
                "japanese_sentence_id": left["id"],
                "translation_sentence_id": right["id"],
                "japanese": left["text"],
                "translation_language": right["lang"],
                "translation": right["text"],
                "mongolian": right["text"] if right["lang"] == "mon" else None,
                "review_status": "pending",
            }


def parse_kanjivg(path: Path) -> Iterable[dict]:
    for svg in sorted(path.glob("*.svg")):
        match = re.match(r"^(?:kvg:)?(.+?)-(\d+)-(.+)\.svg$", svg.name)
        literal = match.group(1) if match else svg.stem.split("-")[0]
        raw = svg.read_text(encoding="utf-8", errors="replace")
        stroke_paths = len(re.findall(r"<path\b", raw))
        yield {
            "source": "KanjiVG",
            "source_id": svg.name,
            "kanji": literal,
            "svg_file": svg.name,
            "stroke_paths": stroke_paths,
            "svg": raw,
            "review_status": "pending",
        }


def write_jsonl(path: Path, rows: Iterable[dict]) -> int:
    count = 0
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
            count += 1
    return count


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize Japanese source datasets for JLPT Master Mongolia.")
    parser.add_argument("--jmdict", type=Path)
    parser.add_argument("--kanjidic", type=Path)
    parser.add_argument("--tatoeba-sentences", type=Path)
    parser.add_argument("--tatoeba-links", type=Path)
    parser.add_argument("--kanjivg", type=Path)
    parser.add_argument("--out", type=Path, default=Path("data/normalized"))
    args = parser.parse_args()

    args.out.mkdir(parents=True, exist_ok=True)
    manifest = {"pipeline_version": 1, "sources": {}, "files": {}}

    if args.jmdict:
        count = write_jsonl(args.out / "vocabulary.jsonl", parse_jmdict(args.jmdict))
        manifest["sources"]["jmdict"] = str(args.jmdict)
        manifest["files"]["vocabulary.jsonl"] = count

    if args.kanjidic:
        count = write_jsonl(args.out / "kanji.jsonl", parse_kanjidic2(args.kanjidic))
        manifest["sources"]["kanjidic2"] = str(args.kanjidic)
        manifest["files"]["kanji.jsonl"] = count

    if args.kanjivg:
        count = write_jsonl(args.out / "kanjivg.jsonl", parse_kanjivg(args.kanjivg))
        manifest["sources"]["kanjivg"] = str(args.kanjivg)
        manifest["files"]["kanjivg.jsonl"] = count

    if args.tatoeba_sentences and args.tatoeba_links:
        sentences = parse_tatoeba_sentences(args.tatoeba_sentences)
        count = write_jsonl(args.out / "examples.jsonl", parse_tatoeba_links(args.tatoeba_links, sentences))
        manifest["sources"]["tatoeba_sentences"] = str(args.tatoeba_sentences)
        manifest["sources"]["tatoeba_links"] = str(args.tatoeba_links)
        manifest["files"]["examples.jsonl"] = count

    (args.out / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
