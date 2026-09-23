import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/auth/actions";

const menu = {
  mn: [["home","Нүүр","⌂"],["study","Сурах","◷"],["vocabulary","Үгийн сан","語"],["kanji","Ханз","漢"],["grammar","Дүрэм","文"],["listening","Сонсгол","耳"],["reading","Уншлага","読"],["jlpt","JLPT","試"],["progress","Ахиц","↗"],["ai-tutor","AI багш","✳"],["settings","Тохиргоо","⚙"]],
  en: [["home","Home","⌂"],["study","Study","◷"],["vocabulary","Vocabulary","語"],["kanji","Kanji","漢"],["grammar","Grammar","文"],["listening","Listening","耳"],["reading","Reading","読"],["jlpt","JLPT","試"],["progress","Progress","↗"],["ai-tutor","AI tutor","✳"],["settings","Settings","⚙"]],
  ja: [["home","ホーム","⌂"],["study","学習","◷"],["vocabulary","単語","語"],["kanji","漢字","漢"],["grammar","文法","文"],["listening","聴解","耳"],["reading","読解","読"],["jlpt","JLPT","試"],["progress","進捗","↗"],["ai-tutor","AI先生","✳"],["settings","設定","⚙"]],
} as const;

export function AppShell({ locale, active, name, email, children }: { locale: string; active: string; name: string; email: string; children: ReactNode }) {
  const items = menu[locale as keyof typeof menu] ?? menu.mn;
  const locales = [["mn","MN"],["en","EN"],["ja","日本語"]];
  return <div className="app-frame">
    <aside className="app-sidebar"><Link className="brand app-brand" href={`/${locale}`}><span className="brand-mark">日</span><span>nihongo<span className="brand-dot">.</span></span></Link><p className="sidebar-kicker">{locale === "en" ? "LEARN JAPANESE" : locale === "ja" ? "日本語を学ぶ" : "ЯПОН ХЭЛ СУРАЛЦАХ"}</p><nav className="side-nav" aria-label={locale === "en" ? "Main navigation" : locale === "ja" ? "メインナビゲーション" : "Үндсэн цэс"}>{items.map(([slug,label,icon]) => <Link key={slug} href={slug === "home" ? `/${locale}` : `/${locale}/${slug}`} aria-current={active === slug ? "page" : undefined} className={active === slug ? "active" : ""}><span className="nav-icon" aria-hidden="true">{icon}</span><span>{label}</span>{slug === "ai-tutor" && <span className="nav-soon">{locale === "en" ? "soon" : locale === "ja" ? "予定" : "удахгүй"}</span>}</Link>)}</nav><div className="sidebar-user"><span className="user-avatar">{name.trim().slice(0,1).toUpperCase() || "日"}</span><span className="user-id"><b>{name}</b><small>{email}</small></span><form action={signOut}><input type="hidden" name="locale" value={locale}/><button type="submit" className="signout-icon" aria-label={locale === "en" ? "Sign out" : locale === "ja" ? "ログアウト" : "Гарах"}>↗</button></form></div></aside>
    <div className="app-main"><header className="app-topbar"><div><span className="topbar-mark">日本語</span><span className="topbar-divider">/</span><span>{items.find(([slug]) => slug === active)?.[1]}</span></div><nav className="app-languages" aria-label={locale === "en" ? "Language" : locale === "ja" ? "言語" : "Хэл"}>{locales.map(([code,label]) => <Link key={code} href={`/${code}${active === "home" ? "" : `/${active}`}`} aria-current={locale === code ? "page" : undefined}>{label}</Link>)}</nav></header><main className="app-content">{children}</main></div>
    <nav className="mobile-bottom-nav" aria-label={locale === "en" ? "Quick navigation" : locale === "ja" ? "クイックナビゲーション" : "Гол цэс"}>{items.filter(([slug]) => ["home","study","vocabulary","jlpt","progress"].includes(slug)).map(([slug,label,icon]) => <Link key={slug} href={slug === "home" ? `/${locale}` : `/${locale}/${slug}`} aria-current={active === slug ? "page" : undefined}><span aria-hidden="true">{icon}</span><small>{label}</small></Link>)}</nav>
  </div>;
}
