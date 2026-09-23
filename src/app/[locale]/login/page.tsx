import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/app/auth/auth-form";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("auth");
  return <main className="auth-shell"><Link className="brand" href={`/${locale}`}><span className="brand-mark">日</span>nihongo<span className="brand-dot">.</span></Link><section className="auth-card"><p className="eyebrow">JLPT N5—N1</p><h1>{t("loginTitle")}</h1><AuthForm mode="login" locale={locale} /><p className="form-switch">{t("noAccount")} <Link href={`/${locale}/signup`}>{t("signupLink")}</Link></p></section></main>;
}
