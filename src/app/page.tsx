import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { MarketCard } from "@/components/market/market-card";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { VNStockTable } from "@/components/market/vn-stock-table";
import { NewsSidebar } from "@/components/market/sidebar-widgets";
import { NewsSection } from "@/components/news/news-section";
import { MOCK_MARKET_PRICES, MOCK_VN_STOCKS } from "@/lib/utils";
import { Bell } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export default function HomePage() {
  return (
    <div style={{minHeight:"100vh",background:"var(--bg,#050816)",color:"#E2E8F0",fontFamily:"system-ui,sans-serif"}}>
      <Header />
      <MarketTicker />

      <main style={{maxWidth:"1600px",margin:"0 auto",padding:"18px 18px 48px",position:"relative",zIndex:1}}>

        {/* Top bar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
          <div>
            <h1 style={{fontSize:"17px",fontWeight:600,color:"#F1F5F9",margin:0}}>Tổng quan thị trường</h1>
            <p style={{fontSize:"11px",color:"#334155",margin:"2px 0 0",fontFamily:"monospace"}}>
              {new Date().toLocaleDateString("vi-VN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
            </p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"5px",padding:"4px 11px",borderRadius:"20px",background:"rgba(0,255,178,0.06)",border:"1px solid rgba(0,255,178,0.18)"}}>
            <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#00FFB2",animation:"pulse 2s ease infinite"}}/>
            <span style={{fontSize:"10px",fontFamily:"monospace",color:"#00FFB2",fontWeight:600}}>REALTIME</span>
          </div>
        </div>

        {/* Market Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"9px",marginBottom:"18px"}} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {MOCK_MARKET_PRICES.map((p:any)=>(
            <MarketCard key={p.symbol} data={p}/>
          ))}
        </div>

        {/* Main: Chart 70% + Sidebar 30% */}
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 310px",gap:"14px",alignItems:"start"}} className="grid-cols-1 lg:grid-cols-[1fr_310px]">

          {/* LEFT */}
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>

            {/* Chart — trung tâm dashboard */}
            <div style={{
              background:"rgba(15,23,42,0.78)",
              backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:"16px",overflow:"hidden",position:"relative",
            }}>
              {/* Glow top */}
              <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:"1px",background:"linear-gradient(to right,transparent,rgba(0,229,168,0.35),transparent)"}}/>
              {/* Live indicator */}
              <div style={{position:"absolute",top:"12px",right:"14px",display:"flex",alignItems:"center",gap:"5px",padding:"3px 9px",borderRadius:"20px",background:"rgba(0,255,178,.07)",border:"1px solid rgba(0,255,178,.18)",zIndex:5}}>
                <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#00FFB2",animation:"pulse 2s ease infinite"}}/>
                <span style={{fontSize:"9px",fontFamily:"monospace",color:"#00FFB2",fontWeight:600}}>LIVE</span>
              </div>
              <TradingViewChart/>
            </div>

            {/* Stock table */}
            <div style={{background:"rgba(15,23,42,0.78)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"16px",overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                  <div style={{width:"3px",height:"14px",borderRadius:"1px",background:"#4D7CFE"}}/>
                  <span style={{fontSize:"13px",fontWeight:600,color:"#E2E8F0"}}>Bảng giá chứng khoán</span>
                </div>
                <Link href="/stocks" style={{fontSize:"10px",color:"#4D7CFE",textDecoration:"none",fontFamily:"monospace"}}>Xem tất cả →</Link>
              </div>
              <VNStockTable stocks={MOCK_VN_STOCKS}/>
            </div>

            {/* News section */}
            <div style={{background:"rgba(15,23,42,0.78)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"16px",overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                  <div style={{width:"3px",height:"14px",borderRadius:"1px",background:"#00E5A8"}}/>
                  <span style={{fontSize:"13px",fontWeight:600,color:"#E2E8F0"}}>Tin tức thị trường</span>
                </div>
                <Link href="/news" style={{fontSize:"10px",color:"#00E5A8",textDecoration:"none",fontFamily:"monospace"}}>Xem tất cả →</Link>
              </div>
              <div style={{padding:"10px"}}>
                <NewsSection/>
              </div>
            </div>
          </div>

          {/* RIGHT — Sidebar sticky */}
          <div style={{position:"sticky",top:"68px"}}>
            <NewsSidebar/>
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{marginTop:"22px",background:"rgba(15,23,42,0.78)",backdropFilter:"blur(12px)",border:"1px solid rgba(0,229,168,0.15)",borderRadius:"16px",padding:"30px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(0,229,168,.45),transparent)"}}/>
          <Bell size={22} color="#00E5A8" style={{margin:"0 auto 10px"}}/>
          <h2 style={{fontSize:"19px",fontWeight:700,color:"#F1F5F9",marginBottom:"8px"}}>Nhận tín hiệu giao dịch miễn phí</h2>
          <p style={{fontSize:"12px",color:"#475569",marginBottom:"18px",maxWidth:"460px",margin:"0 auto 18px",lineHeight:"1.6"}}>
            Tham gia 10,000+ nhà đầu tư — phân tích thị trường, tín hiệu mua/bán hàng ngày qua Telegram
          </p>
          <a href="https://t.me/investhub_vn" target="_blank" rel="noopener noreferrer"
            style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"10px 26px",borderRadius:"10px",background:"rgba(0,229,168,.12)",border:"1px solid rgba(0,229,168,.28)",color:"#00E5A8",fontSize:"13px",fontWeight:600,textDecoration:"none"}}>
            Tham gia Telegram — 100% Miễn phí
          </a>
        </div>
      </main>

      <Footer/>
    </div>
  );
}
