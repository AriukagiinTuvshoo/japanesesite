import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Nihongo — Япон хэлээ өдөр бүр ахиул", template: "%s | Nihongo" },
  description: "Монгол хэлээр хирагана, катакана болон JLPT N5–N1 түвшний япон хэлээ алхам алхмаар сураарай.",
  applicationName: "Nihongo",
  keywords: ["япон хэл сурах", "JLPT бэлтгэл", "хирагана дасгал", "катакана сурах", "япон хэл монгол", "JLPT N5", "япон хэлний үг цээжлэх"],
  openGraph: { type: "website", siteName: "Nihongo", locale: "mn_MN", title: "Nihongo — Япон хэлээ өдөр бүр ахиул", description: "Монгол хэлээр япон хэл болон JLPT-д шат дараатай бэлдээрэй.", images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Nihongo — Япон хэлний сургалт" }] },
  twitter: { card: "summary_large_image", title: "Nihongo — Япон хэлээ өдөр бүр ахиул", description: "Монгол хэлээр япон хэл болон JLPT-д шат дараатай бэлдээрэй.", images: ["/og-image.svg"] },
  alternates: { languages: { mn: "/mn", en: "/en", ja: "/ja" } },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

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
