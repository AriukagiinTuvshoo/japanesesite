import type { Metadata } from "next";
import LegalPage from "../legal-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ja" ? "利用規約" : locale === "en" ? "Terms of service" : "Үйлчилгээний нөхцөл", robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} kind="terms" />;
}
