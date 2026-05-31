"use client";
import { useState, useEffect } from "react";
import { MOCK_NEWS, MOCK_VN_STOCKS } from "@/lib/utils";
import { Send, Flame, Zap } from "lucide-react";

function timeAgo(ts:number){
  const m=Math.floor((Date.now()-ts)/60000),h=Math.floor(m/60),d=Math.floor(h/24);
  if(d>0) return `${d}ng trước`;
  if(h>0) return `${h}g trước`;
  if(m>0) return `${m}p trước`;
  return "Vừa xong";
}

function getSent(title:string):{label:string;col:string;bg:string}{
  const t=title.toLowerCase();
  if(["tăng","phục hồi","mua ròng","vượt","lãi","bull","rally","surge"].some(w=>t.includes(w)))
    return{label:"Bullish",col:"#00FFB2",bg:"rgba(0,255,178,.1)"};
  if(["giảm","bán tháo","sụt","lao","loss","bear","drop","thua"].some(w=>t.includes(w)))
    return{label:"Bearish",col:"#FF4D6D",bg:"rgba(255,77,109,.1)"};
  return{label:"Neutral",col:"#94A3B8",bg:"rgba(148,163,184,.1)"};
}

const MT_CFG:Record<string,{label:string;col:string;bg:string}>={
  stock:{label:"VN Stocks",col:"#4D7CFE",bg:"rgba(77,124,254,.14)"},
  crypto:{label:"Crypto",col:"#F7931A",bg:"rgba(247,147,26,.14)"},
  gold:{label:"Gold",col:"#FFD166",bg:"rgba(255,209,102,.14)"},
  macro:{label:"Macro",col:"#94A3B8",bg:"rgba(148,163,184,.1)"},
};

const panel = {
  background:"rgba(15,23,42,0.82)",
  backdropFilter:"blur(14px)" as any,
  WebkitBackdropFilter:"blur(14px)" as any,
  border:"1px solid rgba(255,255,255,0.07)",
  borderRadius:"14px",
  overflow:"hidden" as any,
};

export function NewsSidebar() {
  const [news,setNews]=useState<any[]>(MOCK_NEWS);
  const [tab,setTab]=useState<"breaking"|"trending">("breaking");
  const [movers,setMovers]=useState<any[]>(MOCK_VN_STOCKS);

  useEffect(()=>{
    fetch("/api/news?limit=15").then(r=>r.json())
      .then(d=>{
        const list=Array.isArray(d)?d:d?.news;
        if(Array.isArray(list)&&list.length>0){
          setNews(list.map((n:any)=>({...n,marketType:n.marketType??n.category})));
        }
      }).catch(()=>{});

    fetch("/api/vn-stocks?type=overview").then(r=>r.json())
      .then(d=>{
        const all=[...(d?.stocks?.HOSE||[]),...(d?.stocks?.HNX||[])];
        if(all.length>0){
          setMovers(all.map((s:any)=>({symbol:s.symbol,price:s.price,changePercent:s.changePct})));
        }
      }).catch(()=>{});
  },[]);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>

      {/* Breaking News */}
      <div style={panel}>
        {/* Header */}
        <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",gap:"4px"}}>
            {([["breaking","breaking","Tin nóng"],["trending","trending","Trending"]] as const).map(([k,,l])=>(
              <button key={k} onClick={()=>setTab(k as any)} style={{
                display:"flex",alignItems:"center",gap:"5px",
                padding:"5px 11px",borderRadius:"8px",
                fontSize:"11px",fontWeight:600,
                letterSpacing:"0.2px",
                background:tab===k?"rgba(0,229,168,0.1)":"transparent",
                border:`1px solid ${tab===k?"rgba(0,229,168,0.22)":"transparent"}`,
                color:tab===k?"#00E5A8":"#475569",
                cursor:"pointer",transition:"all .15s",
              }}>
                {l}
              </button>
            ))}
          </div>
          <div className="pulse-dot" style={{width:"7px",height:"7px",borderRadius:"50%",background:"#FF4D6D"}}/>
        </div>

        {/* News list */}
        <div style={{maxHeight:"400px",overflowY:"auto"}}>
          {news.slice(0,8).map((a:any,i:number)=>{
            const mt=MT_CFG[a.marketType]||MT_CFG.stock;
            const sent=getSent(a.title);
            return(
              <a key={a.id||i}
                href={a.sourceUrl||a.url||"#"}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display:"flex",gap:"10px",
                  padding:"11px 14px",
                  borderBottom:i<7?"1px solid rgba(255,255,255,0.03)":"none",
                  textDecoration:"none",
                  transition:"background .12s",
                  cursor:"pointer",
                }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.03)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>

                {/* Thumbnail */}
                <div style={{
                  width:"42px",height:"38px",borderRadius:"8px",flexShrink:0,
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.07)",
                  overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"17px",
                }}>
                  {a.imageUrl
                    ?<img src={a.imageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
                    :a.marketType==="crypto"?"₿":a.marketType==="gold"?"🥇":"📈"
                  }
                </div>

                <div style={{flex:1,minWidth:0}}>
                  {/* Tags */}
                  <div style={{display:"flex",gap:"5px",marginBottom:"5px",flexWrap:"wrap"}}>
                    <span className="news-tag" style={{background:mt.bg,color:mt.col}}>{mt.label}</span>
                    <span className="news-tag" style={{background:sent.bg,color:sent.col}}>{sent.label}</span>
                  </div>
                  {/* Title */}
                  <p className="news-title" style={{margin:0,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as any,overflow:"hidden"}}>
                    {a.title}
                  </p>
                  {/* Meta */}
                  <div className="news-meta" style={{marginTop:"5px"}}>
                    {a.sourceName||a.source} · {timeAgo(a.publishedAt)}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Market Pulse */}
      <div style={{...panel,padding:"15px"}}>
        <div style={{fontSize:"10px",fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"1px",color:"#334155",marginBottom:"14px"}}>
          Market Pulse
        </div>
        {[
          {l:"Fear & Greed",v:74,col:"#00FFB2",desc:"Tham lam"},
          {l:"BTC Dominance",v:57,col:"#F7931A",u:"%",desc:"Ổn định"},
          {l:"VN Sentiment",v:68,col:"#4D7CFE",desc:"Tích cực"},
          {l:"Gold Momentum",v:72,col:"#FFD166",desc:"Tăng"},
        ].map(p=>(
          <div key={p.l} style={{marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"5px"}}>
              <span className="pulse-label">{p.l}</span>
              <div style={{display:"flex",alignItems:"baseline",gap:"5px"}}>
                <span className="pulse-value" style={{color:p.col}}>{p.v}{p.u||""}</span>
                <span style={{fontSize:"10px",color:"#334155"}}>{p.desc}</span>
              </div>
            </div>
            <div style={{height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${p.v}%`,background:p.col,borderRadius:"2px",transition:"width .5s ease"}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Top Movers */}
      <div style={{...panel,padding:"15px"}}>
        <div style={{fontSize:"10px",fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"1px",color:"#334155",marginBottom:"12px"}}>
          Top tăng mạnh
        </div>
        {[...movers].sort((a,b)=>b.changePercent-a.changePercent).slice(0,5).map((stock,i)=>(
          <div key={stock.symbol} style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"8px 0",
            borderBottom:i<4?"1px solid rgba(255,255,255,0.04)":"none",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
              <div style={{
                width:"30px",height:"30px",borderRadius:"8px",
                background:"rgba(77,124,254,0.12)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"10px",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,
                color:"#4D7CFE",flexShrink:0,
              }}>{stock.symbol.slice(0,3)}</div>
              <div>
                <div className="table-sym">{stock.symbol}</div>
                <div style={{fontSize:"11px",color:"#334155",fontFamily:"'JetBrains Mono',monospace",fontFeatureSettings:'"tnum"'}}>{(stock.price/1000).toFixed(1)}k</div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div className={stock.changePercent>=0?"pct-up":"pct-down"}>
                {stock.changePercent>=0?"+":""}{stock.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Telegram CTA */}
      <div id="telegram" style={{
        background:"rgba(15,23,42,0.82)",
        border:"1px solid rgba(0,229,168,0.16)",
        borderRadius:"14px",padding:"18px",textAlign:"center",
        position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(0,229,168,.45),transparent)"}}/>
        <Send size={20} color="#00E5A8" style={{margin:"0 auto 10px"}}/>
        <div style={{fontSize:"14px",fontWeight:600,color:"#E2E8F0",marginBottom:"6px",letterSpacing:"-0.1px"}}>
          Tín hiệu giao dịch
        </div>
        <div style={{fontSize:"12px",color:"#475569",marginBottom:"14px",lineHeight:"1.6"}}>
          Nhận phân tích & tín hiệu mua/bán hàng ngày qua Telegram
        </div>
        <a href="https://t.me/investhub_vn" target="_blank" rel="noopener noreferrer"
          style={{
            display:"block",padding:"9px",borderRadius:"9px",
            background:"rgba(0,229,168,0.1)",border:"1px solid rgba(0,229,168,0.24)",
            color:"#00E5A8",fontSize:"12.5px",fontWeight:600,textDecoration:"none",
            letterSpacing:"0.1px",
          }}>
          Tham gia miễn phí →
        </a>
      </div>
    </div>
  );
}

export function TopMovers({ stocks = [], type = "up" }: { stocks?: any[]; type?: "up" | "down" }) {
  const sorted = [...stocks].sort((a, b) =>
    type === "up" ? b.changePercent - a.changePercent : a.changePercent - b.changePercent
  ).slice(0, 5);

  const col = type === "up" ? "#00FFB2" : "#FF4D6D";

  return (
    <div style={{ ...panel, padding: "15px" }}>
      <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "1px", color: "#334155", marginBottom: "12px" }}>
        {type === "up" ? "Top tăng mạnh" : "Top giảm mạnh"}
      </div>
      {sorted.map((stock, i) => (
        <div key={stock.symbol} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 0",
          borderBottom: i < sorted.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "8px",
              background: `${col}1f`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
              color: col, flexShrink: 0,
            }}>{stock.symbol.slice(0, 3)}</div>
            <div>
              <div className="table-sym">{stock.symbol}</div>
              <div style={{ fontSize: "11px", color: "#334155", fontFamily: "'JetBrains Mono',monospace" }}>{(stock.price / 1000).toFixed(1)}k</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className={stock.changePercent >= 0 ? "pct-up" : "pct-down"}>
              {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <p style={{ fontSize: "12px", color: "#475569", textAlign: "center", padding: "8px 0" }}>Chưa có dữ liệu</p>
      )}
    </div>
  );
}
export function HotNews(){return null;}
export function TelegramCTA(){
  return (
    <div style={{
      background:"rgba(15,23,42,0.82)",
      border:"1px solid rgba(0,229,168,0.16)",
      borderRadius:"14px",padding:"18px",textAlign:"center",
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(0,229,168,.45),transparent)"}}/>
      <Send size={20} color="#00E5A8" style={{margin:"0 auto 10px"}}/>
      <div style={{fontSize:"14px",fontWeight:600,color:"#E2E8F0",marginBottom:"6px",letterSpacing:"-0.1px"}}>
        Tín hiệu giao dịch
      </div>
      <div style={{fontSize:"12px",color:"#475569",marginBottom:"14px",lineHeight:"1.6"}}>
        Nhận phân tích & tín hiệu mua/bán hàng ngày qua Telegram
      </div>
      <a href="https://t.me/investhub_vn" target="_blank" rel="noopener noreferrer"
        style={{
          display:"block",padding:"9px",borderRadius:"9px",
          background:"rgba(0,229,168,0.1)",border:"1px solid rgba(0,229,168,0.24)",
          color:"#00E5A8",fontSize:"12.5px",fontWeight:600,textDecoration:"none",
          letterSpacing:"0.1px",
        }}>
        Tham gia miễn phí →
      </a>
    </div>
  );
}
export function OpenAccountCTA(){return null;}
