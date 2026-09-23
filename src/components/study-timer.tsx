"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordStudySession } from "@/app/auth/study-actions";

export default function StudyTimer({ locale }: { locale:string }) {
  const [startedAt,setStartedAt]=useState<number|null>(null);
  const [now,setNow]=useState(0);
  const [isPending,startTransition]=useTransition();
  const [notice,setNotice]=useState("");
  const router=useRouter();
  const copy=locale==="en"?{title:"Focused study timer",start:"Start a session",stop:"Finish and save",saved:"Session saved to your account.",tooShort:"Study for at least one minute before saving.",idle:"When you finish, we'll record the time to your account.",placeholder:"Progress tracking is unavailable until the study database is connected."}:locale==="ja"?{title:"学習タイマー",start:"学習を始める",stop:"終了して保存",saved:"学習時間をアカウントに保存しました。",tooShort:"保存するには1分以上学習してください。",idle:"終了すると、学習時間をアカウントに記録します。",placeholder:"学習データベース接続後に記録を利用できます。"}:{title:"Төвлөрч сурах цаг",start:"Суралцаж эхлэх",stop:"Дуусгаад хадгалах",saved:"Суралцсан хугацааг бүртгэлд хадгаллаа.",tooShort:"Хадгалахын тулд дор хаяж нэг минут суралцаарай.",idle:"Дуусгахад хугацааг таны бүртгэлд тэмдэглэнэ.",placeholder:"Сургалтын өгөгдлийн сан холбогдсоны дараа ахиц хадгалагдана."};
  useEffect(()=>{if(startedAt===null)return;const interval=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(interval)},[startedAt]);
  const elapsed=startedAt===null?0:Math.max(0,Math.floor((now-startedAt)/1000));
  const display=`${String(Math.floor(elapsed/60)).padStart(2,"0")}:${String(elapsed%60).padStart(2,"0")}`;
  function finish(){if(startedAt===null||elapsed<60||isPending)return;const startedIso=new Date(startedAt).toISOString();startTransition(async()=>{const result=await recordStudySession(startedIso,locale);startTransition(()=>{setNotice(result.message||(result.ok?copy.saved:copy.placeholder));if(result.ok)setStartedAt(null)});if(result.ok)router.refresh()})}
  if(startedAt!==null)return <div className="timer-card"><p className="eyebrow">{copy.title}</p><strong className="timer-display" aria-live="off">{display}</strong><p>{copy.idle}</p><button className="button primary" disabled={isPending||elapsed<60} onClick={finish} type="button">{copy.stop}</button>{elapsed<60&&<small>{copy.tooShort}</small>}{notice&&<p role="alert" className="form-error">{notice}</p>}</div>;
  return <div className="timer-card"><p className="eyebrow">{copy.title}</p><strong className="timer-display">{notice===copy.saved?"✓":"00:00"}</strong><p>{notice||copy.placeholder}</p><button className="button primary" onClick={()=>{const time=Date.now();setNow(time);setStartedAt(time);setNotice("")}} type="button">{copy.start}</button></div>;
}
