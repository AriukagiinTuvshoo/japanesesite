import { ImageResponse } from "next/og";

export const alt = "Nihongo — Japanese learning for Mongolian learners";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"82px 92px",backgroundColor:"#f8f8f5",color:"#222520",fontFamily:"sans-serif" }}>
      <div style={{display:"flex",alignItems:"center",gap:18}}><div style={{display:"flex",width:58,height:58,alignItems:"center",justifyContent:"center",borderRadius:15,backgroundColor:"#2f6d4f",color:"white",fontSize:34}}>日</div><div style={{display:"flex",fontSize:38,fontWeight:700}}>nihongo<span style={{color:"#dc8951"}}>.</span></div></div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}><div style={{color:"#2f6d4f",fontSize:21,letterSpacing:6}}>JAPANESE · JLPT N5—N1</div><div style={{display:"flex",flexDirection:"column",fontSize:55,fontWeight:600,lineHeight:1.24}}>Япон хэлээ өдөр бүр<br/>бага багаар ахиул.</div><div style={{color:"#73776f",fontSize:22}}>Монгол хэлээр сурах шаталсан платформ</div></div>
      <div style={{position:"absolute",right:95,top:110,display:"flex",fontSize:145,color:"#5b7d64"}}>学</div><div style={{position:"absolute",right:142,top:78,width:124,height:124,borderRadius:100,backgroundColor:"#e8b279"}}/>
      <div style={{position:"absolute",bottom:-155,left:0,width:740,height:250,transform:"rotate(-7deg)",backgroundColor:"#e8eee7"}}/>
    </div>,
    size,
  );
}
