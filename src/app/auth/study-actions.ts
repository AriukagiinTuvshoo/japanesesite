"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export type StudyActionState = { ok: boolean; message?: string };

export async function recordStudySession(startedAtValue:string,locale:string): Promise<StudyActionState> {
  if (!hasSupabaseConfig()) return { ok: false, message: "Хадгалалт тохируулагдаагүй байна." };
  const startedAt = new Date(startedAtValue);
  const elapsed = Date.now() - startedAt.getTime();
  if (!Number.isFinite(startedAt.getTime()) || elapsed < 60_000 || elapsed > 12 * 60 * 60_000) return { ok: false, message: "Суралцсан хугацааны бүртгэл буруу байна." };
  const minutes = Math.floor(elapsed / 60_000);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Суралцсан хугацаагаа хадгалахын тулд нэвтэрнэ үү." };
  const { error } = await supabase.from("study_sessions").insert({ user_id:user.id, started_at:startedAt.toISOString(), minutes_studied:minutes, activity:"study" });
  if (error) return { ok: false, message: "Бүртгэлийг хадгалж чадсангүй. Дахин оролдоно уу." };
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/progress`);
  return { ok: true };
}
