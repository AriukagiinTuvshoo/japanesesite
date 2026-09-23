import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import QuickQuiz from "@/components/quick-quiz";
import { starterQuiz } from "@/lib/starter-content";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const{locale}=await params;return{title:locale==="en"?"Practice quiz":locale==="ja"?"練習テスト":"Дасгалын сорил"}}

export default async function QuizPage({params}:{params:Promise<{locale:string}>}){
 const{locale}=await params;let name=locale==="en"?"Learner":locale==="ja"?"学習者":"Суралцагч";let email="";
 if(hasSupabaseConfig()){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(user){email=user.email||"";name=String(user.user_metadata.display_name||"").trim()||email.split("@")[0]}}
 return <AppShell locale={locale} active="jlpt" name={name} email={email}><section className="page-heading"><div><p className="eyebrow">{locale==="en"?"PRACTICE":locale==="ja"?"練習":"ДАСГАЛ"}</p><h1>{locale==="en"?"Check what you remember":locale==="ja"?"覚えたことを確認":"Санаж байгаагаа шалга"}</h1><p>{locale==="en"?`${starterQuiz.length} reviewed starter questions · random order`:locale==="ja"?`確認済みの基本問題 ${starterQuiz.length}問 · 順番はランダム`: `Хянасан ${starterQuiz.length} асуулт · дараалал санамсаргүй`}</p></div></section><QuickQuiz locale={locale}/></AppShell>
}
