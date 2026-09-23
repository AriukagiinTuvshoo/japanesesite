"use client";

import { useMemo, useState } from "react";
import type { StarterWord } from "@/lib/starter-content";

export default function VocabularyBrowser({ words, locale }: { words: StarterWord[]; locale: string }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [audioError, setAudioError] = useState(false);
  const labels = locale === "ja" ? { search:"日本語・モンゴル語・英語で検索", all:"すべてのレベル", none:"単語が見つかりませんでした。", play:"発音を聞く", count:"語", note:"保存した単語の同期にはアカウントとデータベース連携が必要です。" } : locale === "en" ? { search:"Search Japanese, Mongolian, English", all:"All levels", none:"No matching words found.", play:"Play pronunciation", count:"words", note:"Sign in and connect the content database to sync saved words." } : { search:"Япон, монгол, англиар үг хайх", all:"Бүх түвшин", none:"Ийм үг олдсонгүй.", play:"Дуудлага сонсох", count:"үг", note:"Хадгалсан үгийг синк хийхэд бүртгэл болон үгийн сангийн өгөгдлийн сан холбогдсон байх шаардлагатай." };
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return words.filter((word) => (level === "all" || word.level === level) && [word.jp, word.reading, word.mn, word.en].some((value) => value.toLocaleLowerCase().includes(term)));
  }, [level, query, words]);
  function speak(japanese: string) {
    if (!("speechSynthesis" in window)) { setAudioError(true); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(japanese);
    utterance.lang = "ja-JP";
    window.speechSynthesis.speak(utterance);
  }
  return <>
    <div className="vocab-toolbar"><label className="vocab-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder={labels.search} aria-label={labels.search}/></label><label className="sr-only" htmlFor="vocab-level">{labels.all}</label><select id="vocab-level" value={level} onChange={(event)=>setLevel(event.target.value)}><option value="all">{labels.all}</option>{["N5","N4","N3","N2","N1"].map((item)=><option key={item}>{item}</option>)}</select><span className="vocab-count">{filtered.length} {labels.count}</span></div>
    <p className="content-source-note">{labels.note}</p>{audioError && <p className="inline-alert" role="status">{locale === "en" ? "Speech audio is not supported in this browser." : locale === "ja" ? "このブラウザーでは音声を再生できません。" : "Энэ хөтөч дуудлага унших боломжгүй байна."}</p>}
    {filtered.length ? <div className="vocab-grid">{filtered.map((word)=><article className="vocab-card" key={`${word.jp}-${word.level}`}><div className="vocab-card-top"><span className={`level-badge ${word.level.toLowerCase()}`}>{word.level}</span><button className="audio-button" type="button" onClick={()=>speak(word.jp)} aria-label={`${labels.play}: ${word.jp}`}>◖</button></div><h2 lang="ja">{word.jp}</h2><p className="vocab-reading" lang="ja">{word.reading}</p><p className="vocab-meaning">{locale === "ja" ? word.en : word.mn}<small>{locale === "ja" ? "EN" : "MN"}</small></p><p className="vocab-meaning secondary-meaning">{locale === "ja" ? word.mn : word.en}<small>{locale === "ja" ? "MN" : "EN"}</small></p><div className="vocab-example"><p lang="ja">{word.example}</p><small>{locale === "en" ? word.exEn : locale === "ja" ? `${word.exMn} · ${word.exEn}` : word.exMn}</small></div></article>)}</div> : <div className="empty-panel"><span>語</span><h2>{labels.none}</h2><p>{locale === "ja" ? "別の語で検索するか、レベルを変更してください。" : locale === "en" ? "Try another search or choose a different level." : "Өөр үгээр хайх эсвэл түвшний шүүлтээ өөрчилнө үү."}</p></div>}
  </>;
}
