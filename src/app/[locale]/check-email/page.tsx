import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function CheckEmail({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("auth");
  return <main className="auth-shell"><section className="auth-card"><p className="eyebrow">日本語 · JLPT</p><h1>{t("emailCheck")}</h1><p>{t("emailCheckText")}</p><Link className="button primary" href={`/${locale}/login`}>{t("loginLink")}</Link></section></main>;
}
