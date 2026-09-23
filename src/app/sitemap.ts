import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const routes = ["/mn", "/en", "/ja", "/mn/kana", "/en/kana", "/ja/kana", "/mn/privacy-policy", "/mn/terms-of-service", "/en/privacy-policy", "/en/terms-of-service", "/ja/privacy-policy", "/ja/terms-of-service"];
  return routes.map((route) => ({ url: new URL(route, base).toString(), changeFrequency: "monthly", priority: route.endsWith("/kana") ? 0.8 : 0.6 }));
}
