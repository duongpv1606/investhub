"use client";

interface MarketCardProps {
  data: any;
  onClick?: () => void;
  active?: boolean;
}

function Sparkline({data,up}:{data:number[];up:boolean}) {
  if(!data||data.length<2) return null;
  const mn=Math.min(...data),mx=Math.max(...data),r=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*64},${20-((v-mn)/r)*18-1}`).join(" ");
  const col=up?"#00FFB2":"#FF4D6D";
  return(
    <svg width="64" height="22" viewBox="0 0 64 22" style={{overflow:"visible"}}>
      <defs>
        <linearGradient id={`mg${up?1:0}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity=".25"/>
          <stop offset="100%" stopColor={col} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,22 ${pts} 64,22`} fill={`url(#mg${up?1:0})`}/>
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

const TYPE_CFG:Record<string,{accent:string}> = {
  index:{accent:"#4D7CFE"},stock:{accent:"#4D7CFE"},
  gold:{accent:"#FFD166"},crypto:{accent:"#F7931A"},
};

export function MarketCard({data,onClick,active}:MarketCardProps) {
  const up = data.changePercent >= 0;
  const acc = (TYPE_CFG[data.type]||TYPE_CFG.stock).accent;
  const fmtPrice = () => {
    if(data.type==="gold"&&data.currency==="VND") return `${(data.price/1e6).toFixed(1)}M`;
    if(data.price>=10000) return data.price.toLocaleString("en",{maximumFractionDigits:0});
    if(data.price<10) return `$${data.price.toFixed(4)}`;
    return data.currency==="USD"?`$${data.price.toFixed(2)}`:data.price.toFixed(2);
  };
  return(
    <button onClick={onClick} style={{
      background:active?"rgba(0,229,168,0.05)":"rgba(15,23,42,0.8)",
      backdropFilter:"blur(12px)",
      border:`1px solid ${active?"rgba(0,229,168,0.28)":"rgba(255,255,255,0.07)"}`,
      borderRadius:"11px",padding:"13px 14px",textAlign:"left",
      width:"100%",cursor:"pointer",transition:"all .2s",position:"relative",overflow:"hidden",
    }}
    onMouseEnter={e=>{if(!active){const el=e.currentTarget as HTMLElement;el.style.borderColor="rgba(255,255,255,0.13)";el.style.transform="translateY(-2px)";}}}
    onMouseLeave={e=>{if(!active){const el=e.currentTarget as HTMLElement;el.style.borderColor="rgba(255,255,255,0.07)";el.style.transform="translateY(0)";}}}
    >
      <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:up?"rgba(0,255,178,0.5)":"rgba(255,77,109,0.5)",borderRadius:"11px 11px 0 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"9px"}}>
        <div>
          <div style={{fontSize:"9px",fontFamily:"monospace",fontWeight:700,color:acc,marginBottom:"2px",letterSpacing:".5px"}}>{data.symbol}</div>
          <div style={{fontSize:"10px",color:"rgba(148,163,184,.65)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"85px"}}>{data.displayName||data.name}</div>
        </div>
        <div className="pulse-dot" style={{width:"5px",height:"5px",borderRadius:"50%",background:up?"#00FFB2":"#FF4D6D",marginTop:"2px"}}/>
      </div>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"16px",fontFamily:"monospace",fontWeight:700,color:"#F1F5F9",lineHeight:1}}>{fmtPrice()}</div>
          <div style={{fontSize:"11px",fontFamily:"monospace",fontWeight:600,marginTop:"3px",color:up?"#00FFB2":"#FF4D6D"}}>{up?"▲":"▼"} {Math.abs(data.changePercent).toFixed(2)}%</div>
        </div>
        {data.sparkline&&<Sparkline data={data.sparkline} up={up}/>}
      </div>
    </button>
  );
}
