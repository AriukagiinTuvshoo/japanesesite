import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/app/auth/auth-form";

export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("auth");
  return <main className="auth-shell"><Link className="brand" href={`/${locale}`}><span className="brand-mark">日</span>nihongo<span className="brand-dot">.</span></Link><section className="auth-card"><p className="eyebrow">JLPT N5—N1</p><h1>{t("signupTitle")}</h1><AuthForm mode="signup" locale={locale} /><p className="form-switch">{t("hasAccount")} <Link href={`/${locale}/login`}>{t("loginLink")}</Link></p></section></main>;
}
