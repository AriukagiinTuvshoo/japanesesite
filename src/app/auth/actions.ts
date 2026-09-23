"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export type AuthError = "configurationError" | "invalidCredentials" | "invalidLogin" | "invalidSignup" | "siteUrlError" | "signupFailed";
export type AuthState = { error?: AuthError };

const credentials = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(128),
});
const supportedLocale = z.enum(["mn", "en", "ja"]);

export async function signIn(_previous: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseConfig()) return { error: "configurationError" };
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  const locale = supportedLocale.safeParse(String(formData.get("locale") ?? "mn")).data ?? "mn";
  if (!parsed.success) return { error: "invalidCredentials" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "invalidLogin" };
  redirect(`/${locale}`);
}

const registration = credentials.extend({
  displayName: z.string().trim().min(2).max(48),
});

export async function signUp(_previous: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseConfig()) return { error: "configurationError" };
  const parsed = registration.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
  });
  const locale = supportedLocale.safeParse(String(formData.get("locale") ?? "mn")).data ?? "mn";
  if (!parsed.success) return { error: "invalidSignup" };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return { error: "siteUrlError" };
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${siteUrl.replace(/\/$/, "")}/auth/confirm?next=/${locale}`,
    },
  });
  if (error) return { error: "signupFailed" };
  redirect(`/${locale}/check-email`);
}

export async function signOut(formData: FormData) {
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const locale = supportedLocale.safeParse(String(formData.get("locale") ?? "mn")).data ?? "mn";
  redirect(`/${locale}/login`);
}
