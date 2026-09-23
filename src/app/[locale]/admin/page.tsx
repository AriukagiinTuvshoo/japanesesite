import { forbidden, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasSupabaseConfig()) redirect(`/${locale}/login`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.app_metadata?.role !== "admin") forbidden();
  const t = await getTranslations("home");

  return <main className="shell admin-shell"><Link className="brand" href={`/${locale}`}><span className="brand-mark">日</span>nihongo<span className="brand-dot">.</span></Link><section className="account-card"><p className="eyebrow">ADMIN</p><h1>{t("admin")}</h1><p>Хэрэглэгч болон контентын удирдлагын хэсэг. Шинэ хэрэглэгчид эрхээ өөрсдөө нэмэх боломжгүй; админ эрхийг зөвхөн итгэмжлэгдсэн серверийн Supabase тохиргооноос олгоно.</p></section></main>;
}
