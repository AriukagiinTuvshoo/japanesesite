import Link from "next/link";
import type { Metadata } from "next";
import KanaPractice from "./kana-practice";

const seo: Record<string, { title: string; description: string }> = {
  mn: { title: "Хирагана сурах — Nihongo", description: "Япон хэлний хирагана 46 үндсэн тэмдэгтийг дуудлагатай, үнэгүй давтаарай." },
  en: { title: "Learn Hiragana — Nihongo", description: "Practice all 46 basic Japanese hiragana characters with pronunciation." },
  ja: { title: "ひらがな練習 — Nihongo", description: "ひらがなの基本46文字を発音と一緒に練習しましょう。" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return seo[locale] ?? seo.mn;
}

export default async function KanaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const back = locale === "ja" ? "← ホーム" : locale === "en" ? "← Home" : "← Нүүр хуудас";
  const text = locale === "ja"
    ? { heading: "文字から、日本語の第一歩。", detail: "順番に表示される文字を見て、読み方を声に出してみましょう。", table: "46文字一覧" }
    : locale === "en"
      ? { heading: "Start with the building blocks.", detail: "Review each character, say the reading aloud, and listen to its pronunciation.", table: "Character set" }
      : { heading: "Тэмдэгтээс эхлэх япон хэлний эхний алхам.", detail: "Тэмдэгтийг хараад уншлагыг хэлж, дуудлагыг нь сонсоорой.", table: "Бүх тэмдэгт" };
  return <main className="shell learning-shell">
    <header className="topbar"><Link className="brand" href={`/${locale}`}><span className="brand-mark">日</span>nihongo<span className="brand-dot">.</span></Link><Link className="back-link" href={`/${locale}`}>{back}</Link></header>
    <section className="learning-intro"><p className="eyebrow">01 / HIRAGANA</p><h1>{text.heading}</h1><p>{text.detail}</p></section>
    <KanaPractice locale={locale} />
    <section className="kana-reference"><div className="section-heading"><div><p className="eyebrow">あいうえお</p><h2>{text.table}</h2></div><span>46</span></div><div className="kana-grid">{["あいうえお","かきくけこ","さしすせそ","たちつてと","なにぬねの","はひふへほ","まみむめも","や ゆ よ","らりるれろ","わ を ん"].map((row, i) => <div className="kana-row" key={row}><span>{["a","ka","sa","ta","na","ha","ma","ya","ra","wa"][i]}-row</span><div>{[...row].filter((c) => c !== " ").map((c, j) => <span key={`${c}-${j}`}>{c}</span>)}</div></div>)}</div></section>
    <footer>Independent learning material · JLPT is a registered trademark of the Japan Foundation and Japan Educational Exchanges and Services.</footer>
  </main>;
}
