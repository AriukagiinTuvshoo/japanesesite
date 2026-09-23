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
      <footer>{t("disclaimer")}</footer>
    </main>
  );
}
