import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("home");
  let user = null;
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" href={`/${locale}`} aria-label="Nihongo JLPT home"><span className="brand-mark">日</span>nihongo<span className="brand-dot">.</span></Link>
        <nav className="language-picker" aria-label="Language">
          {routing.locales.map((code) => <Link key={code} aria-current={locale === code ? "page" : undefined} href={`/${code}`}>{code === "mn" ? "Монгол" : code === "en" ? "English" : "日本語"}</Link>)}
        </nav>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{t("tagline")}</p>
          <h1>{t("title")}</h1>
          <p className="intro">{t("intro")}</p>
          <p className="feature-list">{t("features")}</p>
          {user ? (
            <div className="account-card">
              <p className="eyebrow">{t("account")}</p>
              <h2>{t("dashboard")}, {user.user_metadata.display_name || user.email}</h2>
              <p>{t("signedIn")}</p>
              <div className="button-row">
                <Link className="button secondary" href={`/${locale}/admin`}>{t("admin")}</Link>
                <form action={signOut}><input type="hidden" name="locale" value={locale} /><button className="button quiet" type="submit">{t("signout")}</button></form>
              </div>
            </div>
          ) : hasSupabaseConfig() ? (
            <div className="button-row"><Link className="button primary" href={`/${locale}/signup`}>{t("signup")}</Link><Link className="button secondary" href={`/${locale}/login`}>{t("login")}</Link></div>
          ) : (
            <div className="setup-note" role="status"><span aria-hidden="true">↗</span>{t("setup")}</div>
          )}
        </div>
        <div className="hero-art" aria-hidden="true"><span className="art-chip chip-one">学</span><span className="art-chip chip-two">語</span><span className="art-writing">毎日<br />少しずつ。</span><div className="art-card"><small>今日の学習</small><strong>20<span>min</span></strong><i /></div></div>
      </section>
      <section className="learning-path" aria-labelledby="path-title">
        <div className="section-heading"><div><p className="eyebrow">{locale === "ja" ? "LEARNING PATH" : locale === "en" ? "YOUR LEARNING PATH" : "СУРАЛЦАХ ЗАМ"}</p><h2 id="path-title">{locale === "ja" ? "基礎からJLPTまで" : locale === "en" ? "Build your Japanese, step by step" : "Сууриас JLPT хүртэл шат дараатай"}</h2></div><span className="path-caption">{locale === "ja" ? "自分のペースで" : locale === "en" ? "Learn at your pace" : "Өөрийн хурдаар"}</span></div>
        <div className="path-grid">
          <Link className="path-card path-active" href={`/${locale}/kana`}><span className="path-number">01</span><span className="path-kanji">あ</span><span className="path-name">{locale === "ja" ? "ひらがな" : locale === "en" ? "Hiragana" : "Хирагана"}</span><span className="path-detail">{locale === "ja" ? "基本46文字 · 発音練習" : locale === "en" ? "46 characters · pronunciation" : "46 тэмдэгт · дуудлагын дасгал"}</span><span className="path-link">{locale === "ja" ? "練習する →" : locale === "en" ? "Start learning →" : "Давтаж эхлэх →"}</span></Link>
          {[{ n: "02", glyph: "ア", title: locale === "ja" ? "カタカナ" : locale === "en" ? "Katakana" : "Катакана", desc: locale === "ja" ? "外来語の読み書き" : locale === "en" ? "Read loanwords" : "Гадаад үг унших" }, { n: "03", glyph: "N5", title: locale === "ja" ? "JLPT N5" : "JLPT N5", desc: locale === "ja" ? "語彙 · 文法 · 読解" : locale === "en" ? "Words · grammar · reading" : "Үг · дүрэм · унших" }, { n: "04", glyph: "漢", title: locale === "ja" ? "漢字と上級" : locale === "en" ? "Kanji & more" : "Ханз ба ахисан шат", desc: locale === "ja" ? "N4からN1へ" : locale === "en" ? "From N4 to N1" : "N4-өөс N1 хүртэл" }].map((item) => <article className="path-card path-upcoming" key={item.n}><span className="path-number">{item.n}</span><span className="path-kanji">{item.glyph}</span><span className="path-name">{item.title}</span><span className="path-detail">{item.desc}</span><span className="path-link">{locale === "ja" ? "準備中" : locale === "en" ? "Coming next" : "Дараагийн шат"}</span></article>)}
        </div>
      </section>
      <footer className="site-footer"><span>{t("disclaimer")}</span><nav aria-label={locale === "ja" ? "法的情報" : locale === "en" ? "Legal information" : "Хууль, нууцлал"}><Link href={`/${locale}/privacy-policy`}>{locale === "ja" ? "プライバシー" : locale === "en" ? "Privacy" : "Нууцлал"}</Link><Link href={`/${locale}/terms-of-service`}>{locale === "ja" ? "利用規約" : locale === "en" ? "Terms" : "Үйлчилгээний нөхцөл"}</Link></nav></footer>
    </main>
  );
}
