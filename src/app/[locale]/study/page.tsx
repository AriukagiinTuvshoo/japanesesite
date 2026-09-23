import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import StudyTimer from "@/components/study-timer";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Суралцах цаг" };

export default async function StudyPage({ params }: { params: Promise<{ locale:string }> }) {
  const {locale}=await params;
  if(!hasSupabaseConfig()) redirect(`/${locale}/login`);
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect(`/${locale}/login`);
  const name=String(user.user_metadata.display_name||"").trim()||user.email?.split("@")[0]||"";
  return <AppShell locale={locale} active="study" name={name} email={user.email||""}><section className="page-heading"><div><p className="eyebrow">{locale==="en"?"STUDY SESSION":locale==="ja"?"学習セッション":"СУРАЛЦАХ ХУГАЦАА"}</p><h1>{locale==="en"?"Make a little time count":locale==="ja"?"短い時間を大切に":"Богино хугацааг үр дүнтэй ашигла"}</h1><p>{locale==="en"?"Focus on one task. Save your session to see real study time on your dashboard.":locale==="ja"?"一つの課題に集中しましょう。学習記録を保存すると、実際の学習時間がダッシュボードに表示されます。":"Нэг зүйлд төвлөрөөрэй. Хичээлээ хадгалбал бодит судалсан хугацаа нүүр самбарт харагдана."}</p></div></section><div className="study-layout"><StudyTimer locale={locale}/><section className="study-next"><p className="eyebrow">{locale==="en"?"SUGGESTED START":locale==="ja"?"おすすめ":"ЭХЛЭХ САНАЛ"}</p><h2>{locale==="en"?"Choose a short review":locale==="ja"?"短い復習を選ぶ":"Богино давталтаа сонго"}</h2><p>{locale==="en"?"Start with kana or review a few vocabulary words. Your timer only records time; it does not claim lesson completion.":locale==="ja"?"かなの復習や単語の確認から始めましょう。タイマーは学習時間のみを記録し、レッスン完了とは判定しません。":"Үсэг давтах эсвэл хэдэн үг сэргээхээс эхлээрэй. Цаг хэмжигч зөвхөн зарцуулсан хугацааг бүртгэх бөгөөд хичээл дууссаныг зохиомлоор тооцохгүй."}</p><div className="study-shortcuts"><a href={`/${locale}/kana`}>あ <span>{locale==="ja"?"ひらがな":locale==="en"?"Hiragana":"Хирагана"} →</span></a><a href={`/${locale}/vocabulary`}>語 <span>{locale==="ja"?"単語":locale==="en"?"Vocabulary":"Үгийн сан"} →</span></a></div></section></div></AppShell>;
}
