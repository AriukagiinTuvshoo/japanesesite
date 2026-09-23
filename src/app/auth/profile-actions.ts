"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export type ProfileActionState={ok:boolean;message?:string};

export async function updateLearningPreferences(_state:ProfileActionState,formData:FormData):Promise<ProfileActionState>{
 if(!hasSupabaseConfig())return{ok:false,message:"Өгөгдлийн сан тохируулагдаагүй байна."};
 const locale=String(formData.get("locale")||"mn");
 const goal=Number(formData.get("daily_goal_minutes"));
 const target=String(formData.get("jlpt_target")||"");
 const learning=String(formData.get("learning_goal")||"");
 if(![15,20,30,60].includes(goal)||!(target===""||["N5","N4","N3","N2","N1"].includes(target))||!["daily","jlpt","work","school"].includes(learning))return{ok:false,message:"Сонголтоо шалгаад дахин хадгална уу."};
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return{ok:false,message:"Энэ тохиргоог хадгалахын тулд нэвтэрнэ үү."};
 const{error}=await supabase.from("profiles").update({daily_goal_minutes:goal,jlpt_target:target||null,learning_goal:learning,interface_language:locale}).eq("user_id",user.id);
 if(error)return{ok:false,message:"Тохиргоог хадгалж чадсангүй. Миграци ажилласан эсэхийг шалгана уу."};
 revalidatePath(`/${locale}`);revalidatePath(`/${locale}/settings`);return{ok:true,message:"Тохиргоог хадгаллаа."};
}
