import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { routing } from "@/i18n/routing";
import { hasSupabaseConfig } from "@/lib/supabase/config";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(randomUUID()).toString("base64");
  const csp = `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; connect-src 'self'; font-src 'self' data:; object-src 'none'`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  let refreshedResponse = NextResponse.next({ request: { headers: requestHeaders } });

  if (hasSupabaseConfig()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createServerClient(url, key, {
      cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          requestHeaders.set("cookie", request.cookies.toString());
          refreshedResponse = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => refreshedResponse.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.getUser();
  }

  const response = intlMiddleware(new NextRequest(request, { headers: requestHeaders }));
  refreshedResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: "/((?!api|_next|.*\\..*).*)",
};
