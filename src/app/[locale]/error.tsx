"use client";

export default function Error({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="error-screen" role="alert"><p className="eyebrow">NIHONGO</p><h1>Мэдээлэл ачаалж чадсангүй.</h1><p>Холболтоо шалгаад дахин оролдоно уу.</p><button className="button primary" type="button" onClick={()=>reset()}>Дахин оролдох</button></main>}
