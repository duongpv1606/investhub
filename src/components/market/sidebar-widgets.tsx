"use client";
import { useState, useEffect } from "react";
import { MOCK_NEWS, MOCK_VN_STOCKS } from "@/lib/utils";
import { TrendingUp, TrendingDown, Send } from "lucide-react";

function timeAgo(ts:number){
  const m=Math.floor((Date.now()-ts)/60000),h=Math.floor(m/60),d=Math.floor(h/24);
  if(d>0) return `${d}ng`;
  if(h>0) return `${h}g`;
  if(m>0) return `${m}p`;
  return "vừa";
}

function getSent(title:string):{label:string;col:string;bg:string}{
  const t=title.toLowerCase();
  if(["tăng","phục hồi","mua ròng","vượt","lãi","bull","rally"].some(w=>t.includes(w))) return{label:"Bullish",col:"#00FFB2",bg:"rgba(0,255,178,.1)"};
  if(["giảm","bán tháo","sụt","lao","loss","bear","drop"].some(w=>t.includes(w))) return{label:"Bearish",col:"#FF4D6D",bg:"rgba(255,77,109,.1)"};
  return{label:"Neutral",col:"#94A3B8",bg:"rgba(148,163,184,.1)"};
}

const MT_CFG:Record<string,{label:string;col:string;bg:string}>={
  stock:{label:"VN Stocks",col:"#4D7CFE",bg:"rgba(77,124,254,.14)"},
  crypto:{label:"Crypto",col:"#F7931A",bg:"rgba(247,147,26,.14)"},
  gold:{label:"Gold",col:"#FFD166",bg:"rgba(255,209,102,.14)"},
  macro:{label:"Macro",col:"#94A3B8",bg:"rgba(148,163,184,.1)"},
};

export function NewsSidebar() {
  const [news,setNews]=useState<any[]>(MOCK_NEWS);
  const [tab,setTab]=useState<"breaking"|"trending">("breaking");

  useEffect(()=>{
    fetch("/api/news?limit=15").then(r=>r.json())
      .then(d=>{if(Array.isArray(d)&&d.length>0)setNews(d);}).catch(()=>{});
  },[]);

  const S={
    wrap:{background:"rgba(15,23,42,.8)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",overflow:"hidden"},
    hdr:{padding:"10px 13px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"space-between"},
    tabBtn:(on:boolean)=>({background:on?"rgba(0,229,168,.1)":"transparent",border:`1px solid ${on?"rgba(0,229,168,.2)":"transparent"}`,borderRadius:"7px",padding:"4px 10px",fontSize:"10px",fontWeight:600,color:on?"#00E5A8":"#475569",cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:"4px"}),
    ni:{display:"flex",gap:"8px",padding:"9px 11px",borderBottom:"1px solid rgba(255,255,255,0.03)",cursor:"pointer",transition:"background .12s"},
    nt:{width:"38px",height:"34px",borderRadius:"7px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.06)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",overflow:"hidden"},
    ntitle:{fontSize:"11px",fontWeight:500,color:"#CBD5E1",lineHeight:"1.35",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"},
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
      {/* Breaking News */}
      <div style={S.wrap as any}>
        <div style={S.hdr as any}>
          <div style={{display:"flex",gap:"3px"}}>
            {([["breaking","Tin nóng"],["trending","Trending"]] as const).map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={S.tabBtn(tab===k) as any}>{l}</button>
            ))}
          </div>
          <div className="pulse-dot" style={{width:"6px",height:"6px",borderRadius:"50%",background:"#FF4D6D"}}/>
        </div>
        <div style={{maxHeight:"380px",overflowY:"auto"}}>
          {news.slice(0,8).map((a:any,i:number)=>{
            const mt=MT_CFG[a.marketType]||MT_CFG.stock;
            const sent=getSent(a.title);
            return(
              <a key={a.id||i} href={a.sourceUrl||a.url||"#"} target="_blank" rel="noopener noreferrer"
                style={{...S.ni,textDecoration:"none"} as any}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.03)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
                <div style={S.nt as any}>
                  {a.imageUrl?<img src={a.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
                    :a.marketType==="crypto"?"₿":a.marketType==="gold"?"🥇":"📈"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",gap:"4px",marginBottom:"3px",flexWrap:"wrap"}}>
                    <span style={{fontSize:"9px",padding:"1px 5px",borderRadius:"3px",fontFamily:"monospace",fontWeight:600,background:mt.bg,color:mt.col}}>{mt.label}</span>
                    <span style={{fontSize:"9px",padding:"1px 5px",borderRadius:"3px",fontFamily:"monospace",fontWeight:600,background:sent.bg,color:sent.col}}>{sent.label}</span>
                  </div>
                  <div style={S.ntitle as any}>{a.title}</div>
                  <div style={{fontSize:"9px",color:"#334155",marginTop:"3px"}}>{a.sourceName||a.source} · {timeAgo(a.publishedAt)}</div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Market Pulse */}
      <div style={{...S.wrap,padding:"13px"} as any}>
        <div style={{fontSize:"10px",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".7px",color:"#334155",marginBottom:"11px"}}>Market Pulse</div>
        {[
          {l:"Fear & Greed",v:74,col:"#00FFB2"},
          {l:"BTC Dominance",v:57,col:"#F7931A",u:"%"},
          {l:"VN Sentiment",v:68,col:"#4D7CFE"},
          {l:"Gold Momentum",v:72,col:"#FFD166"},
        ].map(p=>(
          <div key={p.l} style={{marginBottom:"9px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
              <span style={{fontSize:"10px",color:"#475569"}}>{p.l}</span>
              <span style={{fontSize:"10px",fontFamily:"monospace",fontWeight:600,color:p.col}}>{p.v}{p.u||""}</span>
            </div>
            <div style={{height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${p.v}%`,background:p.col,borderRadius:"2px"}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Top movers */}
      <div style={{...S.wrap,padding:"13px"} as any}>
        <div style={{fontSize:"10px",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:".7px",color:"#334155",marginBottom:"9px"}}>Top tăng mạnh</div>
        {[...MOCK_VN_STOCKS].sort((a,b)=>b.changePercent-a.changePercent).slice(0,5).map(stock=>(
          <div key={stock.symbol} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
            <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
              <div style={{width:"26px",height:"26px",borderRadius:"6px",background:"rgba(77,124,254,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontFamily:"monospace",fontWeight:700,color:"#4D7CFE",flexShrink:0}}>{stock.symbol.slice(0,3)}</div>
              <div>
                <div style={{fontSize:"11px",fontWeight:600,color:"#E2E8F0"}}>{stock.symbol}</div>
                <div style={{fontSize:"9px",color:"#334155",fontFamily:"monospace"}}>{(stock.price/1000).toFixed(1)}k</div>
              </div>
            </div>
            <div style={{fontSize:"11px",fontFamily:"monospace",fontWeight:600,color:stock.changePercent>=0?"#00FFB2":"#FF4D6D"}}>
              {stock.changePercent>=0?"+":""}{stock.changePercent.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Telegram CTA */}
      <div id="telegram" style={{background:"rgba(15,23,42,.8)",border:"1px solid rgba(0,229,168,.15)",borderRadius:"14px",padding:"14px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(0,229,168,.4),transparent)"}}/>
        <Send size={18} color="#00E5A8" style={{margin:"0 auto 8px"}}/>
        <div style={{fontSize:"12px",fontWeight:600,color:"#E2E8F0",marginBottom:"5px"}}>Tín hiệu giao dịch</div>
        <div style={{fontSize:"10px",color:"#475569",marginBottom:"11px",lineHeight:"1.5"}}>Nhận phân tích & tín hiệu mua/bán qua Telegram mỗi ngày</div>
        <a href="https://t.me/investhub_vn" target="_blank" rel="noopener noreferrer"
          style={{display:"block",padding:"8px",borderRadius:"8px",background:"rgba(0,229,168,.1)",border:"1px solid rgba(0,229,168,.22)",color:"#00E5A8",fontSize:"11px",fontWeight:600,textDecoration:"none"}}>
          Tham gia miễn phí →
        </a>
      </div>
    </div>
  );
}

// Exports giữ tương thích với code cũ
export function TopMovers(){return null;}
export function HotNews(){return null;}
export function TelegramCTA(){return null;}
export function OpenAccountCTA(){return null;}
