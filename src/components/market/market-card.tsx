"use client";

interface MarketCardProps {
  data: any;
  onClick?: () => void;
  active?: boolean;
}

function Sparkline({data,up}:{data:number[];up:boolean}) {
  if(!data||data.length<2) return null;
  const mn=Math.min(...data),mx=Math.max(...data),r=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*68},${22-((v-mn)/r)*19-1}`).join(" ");
  const col=up?"#00FFB2":"#FF4D6D";
  return(
    <svg width="68" height="24" viewBox="0 0 68 24" style={{overflow:"visible"}}>
      <defs>
        <linearGradient id={`mg${up?1:0}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity=".28"/>
          <stop offset="100%" stopColor={col} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,24 ${pts} 68,24`} fill={`url(#mg${up?1:0})`}/>
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
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
      background:active?"var(--primary-muted)":"var(--card-bg)",
      backdropFilter:"blur(12px)",
      border:`1px solid ${active?"var(--primary)":"var(--card-border)"}`,
      borderRadius:"12px",
      padding:"16px 15px",
      textAlign:"left",
      width:"100%",
      cursor:"pointer",
      transition:"all .2s ease",
      position:"relative",
      overflow:"hidden",
      boxShadow:"var(--shadow)",
    }}
    onMouseEnter={e=>{if(!active){const el=e.currentTarget as HTMLElement;el.style.borderColor="rgba(255,255,255,0.13)";el.style.transform="translateY(-2px)";el.style.boxShadow="0 8px 24px rgba(0,0,0,0.2)";}}}
    onMouseLeave={e=>{if(!active){const el=e.currentTarget as HTMLElement;el.style.borderColor="rgba(255,255,255,0.07)";el.style.transform="translateY(0)";el.style.boxShadow="none";}}}
    >
      {/* Top accent bar */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:up?"var(--bullish)":"var(--bearish)",borderRadius:"12px 12px 0 0",opacity:0.7}}/>

      {/* Header row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"11px"}}>
        <div>
          <div className="card-symbol" style={{color:acc,marginBottom:"4px"}}>{data.symbol}</div>
          <div className="card-name">{data.displayName||data.name}</div>
        </div>
        <div className="pulse-dot" style={{width:"6px",height:"6px",borderRadius:"50%",background:up?"#00FFB2":"#FF4D6D",marginTop:"3px",flexShrink:0}}/>
      </div>

      {/* Price + Sparkline */}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:"8px"}}>
        <div>
          <div className="card-price-sm">{fmtPrice()}</div>
          <div style={{marginTop:"5px"}} className={up?"pct-up":"pct-down"}>
            {up?"▲":"▼"} {Math.abs(data.changePercent).toFixed(2)}%
          </div>
        </div>
        {data.sparkline&&<Sparkline data={data.sparkline} up={up}/>}
      </div>
    </button>
  );
}
