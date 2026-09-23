"use client";

import { useActionState } from "react";
import { updateLearningPreferences } from "@/app/auth/profile-actions";
import type { ProfileActionState } from "@/app/auth/profile-actions";

export default function SettingsForm({locale,dailyGoal,target,learning}:{locale:string;dailyGoal:number;target:string;learning:string}){
 const initial:ProfileActionState={ok:false};const[state,action,pending]=useActionState(updateLearningPreferences,initial);
 const en=locale==="en",ja=locale==="ja";
 return <form className="settings-form" action={action}><input type="hidden" name="locale" value={locale}/><label>{en?"Daily study goal":ja?"一日の学習目標":"Өдөр тутмын сурах зорилт"}<select name="daily_goal_minutes" defaultValue={String(dailyGoal)}>{[15,20,30,60].map((n)=><option value={n} key={n}>{n} {en?"minutes":ja?"分":"минут"}</option>)}</select></label><label>{en?"JLPT target":ja?"目標JLPTレベル":"Зорих JLPT түвшин"}<select name="jlpt_target" defaultValue={target}>{[["","—"],["N5","N5"],["N4","N4"],["N3","N3"],["N2","N2"],["N1","N1"]].map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label>{en?"Learning goal":ja?"学習の目的":"Сурах зорилго"}<select name="learning_goal" defaultValue={learning}><option value="daily">{en?"Everyday Japanese":ja?"日常会話":"Өдөр тутмын япон хэл"}</option><option value="jlpt">JLPT</option><option value="work">{en?"Work":ja?"仕事":"Ажил"}</option><option value="school">{en?"School":ja?"学校":"Сургууль"}</option></select></label><button className="button primary" type="submit" disabled={pending}>{pending?(en?"Saving…":ja?"保存中…":"Хадгалж байна…"):(en?"Save preferences":ja?"設定を保存":"Тохиргоо хадгалах")}</button>{state.message&&<p className={state.ok?"settings-success":"form-error"} role="status">{state.message}</p>}</form>
}
