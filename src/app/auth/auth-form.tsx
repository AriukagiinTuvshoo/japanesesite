"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/auth/actions";
import { signIn, signUp } from "@/app/auth/actions";
import { SubmitButton } from "@/app/auth/submit-button";
import { useTranslations } from "next-intl";

export function AuthForm({ mode, locale }: { mode: "login" | "signup"; locale: string }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});
  const t = useTranslations("auth");
  return (
    <form action={formAction} className="auth-form">
      <input type="hidden" name="locale" value={locale} />
      {mode === "signup" && <label>{t("name")}<input name="displayName" autoComplete="name" required minLength={2} maxLength={48} /></label>}
      <label>{t("email")}<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>{t("password")}<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} maxLength={128} /></label>
      {state.error && <p className="form-error" role="alert">{t(state.error)}</p>}
      <SubmitButton>{mode === "login" ? t("submitLogin") : t("submitSignup")}</SubmitButton>
    </form>
  );
}
