"use client";

import { useMemo, useState } from "react";
import { hiragana } from "@/lib/kana";

const copy = {
  mn: { eyebrow: "ЭХЛЭН СУРАЛЦАГЧ · 01", title: "Хирагана", intro: "46 үндсэн тэмдэгтийг богино давталтаар тогтоогоорой.", prompt: "Дуудлагыг сонго", next: "Дараагийн тэмдэг", listen: "Дуудлагыг сонсох", complete: "Бүх тэмдэгтийг үзлээ", back: "← Нүүр хуудас" },
  en: { eyebrow: "BEGINNER · 01", title: "Hiragana", intro: "Learn the 46 basic characters in short focused rounds.", prompt: "Read the sound", next: "Next character", listen: "Listen", complete: "You viewed every character", back: "← Home" },
  ja: { eyebrow: "初級 · 01", title: "ひらがな", intro: "46文字を短い練習で覚えましょう。", prompt: "読み方", next: "次の文字", listen: "発音を聞く", complete: "すべての文字を確認しました", back: "← ホーム" },
} as const;

export default function KanaPractice({ locale }: { locale: string }) {
  const text = copy[locale as keyof typeof copy] ?? copy.mn;
  const [index, setIndex] = useState(0);
  const item = hiragana[index];
  const progress = useMemo(() => Math.round(((index + 1) / hiragana.length) * 100), [index]);

  function speak() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(item[0]));
    }
  }

  return (
    <section className="kana-practice" aria-label={text.title}>
      <div className="practice-heading"><span>{text.prompt}</span><span>{index + 1} / {hiragana.length}</span></div>
      <div className="practice-track" role="progressbar" aria-label={text.title} aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={hiragana.length}><span style={{ width: `${progress}%` }} /></div>
      <div className="kana-card" aria-live="polite"><span className="kana-glyph">{item[0]}</span><span className="kana-reading">{item[1]}</span></div>
      <div className="practice-actions"><button className="button secondary" type="button" onClick={speak}>◖ {text.listen}</button><button className="button primary" type="button" onClick={() => setIndex((index + 1) % hiragana.length)}>{text.next} <span aria-hidden="true">→</span></button></div>
      <p className="practice-note">{index === hiragana.length - 1 ? text.complete : ""}</p>
    </section>
  );
}
