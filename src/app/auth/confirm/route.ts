import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const locales = new Set(["mn", "en", "ja"]);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextLocale = url.searchParams.get("next")?.replace(/^\//, "");
  const locale = nextLocale && locales.has(nextLocale) ? nextLocale : "mn";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return NextResponse.redirect(new URL(`/${locale}/login?error=confirmation`, request.url));
}
