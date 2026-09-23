import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { starterWords, type StarterWord } from "@/lib/starter-content";
import { AppShell } from "@/components/app-shell";
import VocabularyBrowser from "@/components/vocabulary-browser";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "en" ? "Vocabulary" : locale === "ja" ? "単語" : "Үгийн сан" };
}

export default async function VocabularyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let userName = "";
  let email = "";
  let dbWords: StarterWord[] = [];
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      email = user.email || "";
      userName = String(user.user_metadata.display_name || "").trim() || email.split("@")[0];
      const { data } = await supabase.from("vocabulary").select("japanese,reading,meaning_mn,meaning_en,level_id,example_ja,example_mn,example_en").eq("review_state", "published").order("level_id").limit(500);
      if (data?.length) dbWords = data.map((word) => ({ jp:word.japanese,reading:word.reading,mn:word.meaning_mn,en:word.meaning_en,level:word.level_id,example:word.example_ja,exMn:word.example_mn,exEn:word.example_en }));
    }
  }
  const words = dbWords.length ? dbWords : starterWords as StarterWord[];
  return <AppShell locale={locale} active="vocabulary" name={userName || (locale === "en" ? "Learner" : locale === "ja" ? "学習者" : "Суралцагч")} email={email}><section className="page-heading"><div><p className="eyebrow">{locale === "en" ? "VOCABULARY" : locale === "ja" ? "単語" : "ҮГИЙН САН"}</p><h1>{locale === "en" ? "Words you can use" : locale === "ja" ? "使える言葉を身につける" : "Хэрэглэж сурах үгс"}</h1><p>{locale === "en" ? "Search reviewed Japanese words with Mongolian and English meanings." : locale === "ja" ? "確認済みの日本語単語をモンゴル語・英語の意味と一緒に検索できます。" : "Хянасан япон үгийг уншлага, монгол болон англи утгатай нь хайгаарай."}</p></div><Link className="button secondary" href={`/${locale}/kana`}>{locale === "en" ? "Review hiragana" : locale === "ja" ? "ひらがなを復習" : "Хирагана давтах"} →</Link></section><VocabularyBrowser words={words} locale={locale}/></AppShell>;
}
