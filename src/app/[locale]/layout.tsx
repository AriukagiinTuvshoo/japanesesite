import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";
import "../globals.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localizedTitle = locale === "en" ? "Japanese study, one step at a time" : locale === "ja" ? "日本語を毎日少しずつ学ぶ" : "Япон хэлээ өдөр бүр ахиул";
  const localizedDescription = locale === "en" ? "Study hiragana and prepare for the JLPT step by step." : locale === "ja" ? "ひらがなからJLPTまで、日本語を段階的に学びましょう。" : "Монгол хэлээр хирагана болон JLPT-д шат дараатай бэлдээрэй.";
  const image = `/${locale}/opengraph-image`;
  return {
    metadataBase: getSiteUrl(),
    title: { default: `Nihongo — ${localizedTitle}`, template: "%s | Nihongo" },
    description: localizedDescription,
    applicationName: "Nihongo",
    keywords: ["япон хэл сурах", "JLPT бэлтгэл", "хирагана дасгал", "катакана сурах", "япон хэл монгол", "JLPT N5", "япон хэлний үг цээжлэх"],
    openGraph: { type: "website", siteName: "Nihongo", locale: locale === "en" ? "en_US" : locale === "ja" ? "ja_JP" : "mn_MN", title: `Nihongo — ${localizedTitle}`, description: localizedDescription, images: [{ url: image, width: 1200, height: 630, alt: `Nihongo — ${localizedTitle}` }] },
    twitter: { card: "summary_large_image", title: `Nihongo — ${localizedTitle}`, description: localizedDescription, images: [image] },
    alternates: { languages: { mn: "/mn", en: "/en", ja: "/ja" } },
    manifest: "/manifest.webmanifest",
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = { themeColor: "#f8f8f5", width: "device-width", initialScale: 1 };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body><NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider></body>
    </html>
  );
}
