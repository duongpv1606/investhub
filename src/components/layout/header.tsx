"use client";
import Link from "next/link";
import { useState } from "react";
import { TrendingUp, Search, Bell, Menu, X } from "lucide-react";

const NAV = [
  { href: "/stocks", label: "Chứng khoán", color: "#4D7CFE" },
  { href: "/gold", label: "Vàng", color: "#FFD166" },
  { href: "/crypto", label: "Crypto", color: "#F7931A" },
  { href: "/news", label: "Tin tức", color: "#00E5A8" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header style={{
      position:"sticky",top:0,zIndex:50,
      background:"rgba(5,8,22,0.92)",
      backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
      borderBottom:"1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{maxWidth:"1600px",margin:"0 auto",padding:"0 18px",height:"52px",display:"flex",alignItems:"center",gap:"20px"}}>
        <Link href="/" style={{display:"flex",alignItems:"center",gap:"8px",textDecoration:"none",flexShrink:0}}>
          <div style={{width:"26px",height:"26px",borderRadius:"7px",background:"rgba(0,229,168,0.14)",border:"1px solid rgba(0,229,168,0.28)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <TrendingUp size={13} color="#00E5A8"/>
          </div>
          <span style={{fontSize:"15px",fontWeight:700,color:"#fff",letterSpacing:"-0.3px"}}>
            Invest<span style={{color:"#00E5A8"}}>Hub</span>
          </span>
        </Link>

        <nav style={{display:"flex",gap:"1px",flex:1}} className="hidden md:flex">
          {NAV.map(n=>(
            <Link key={n.href} href={n.href} style={{padding:"5px 13px",borderRadius:"8px",fontSize:"12px",fontWeight:500,color:"rgba(148,163,184,.8)",textDecoration:"none",transition:"all .15s"}}
              onMouseEnter={e=>{const el=e.target as HTMLElement;el.style.color=n.color;el.style.background=`${n.color}10`;}}
              onMouseLeave={e=>{const el=e.target as HTMLElement;el.style.color="rgba(148,163,184,.8)";el.style.background="transparent";}}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div style={{display:"flex",alignItems:"center",gap:"8px",marginLeft:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:"5px",padding:"3px 9px",borderRadius:"20px",background:"rgba(0,255,178,0.07)",border:"1px solid rgba(0,255,178,0.2)"}}>
            <div className="pulse-dot" style={{width:"5px",height:"5px",borderRadius:"50%",background:"#00FFB2"}}/>
            <span style={{fontSize:"10px",fontFamily:"monospace",color:"#00FFB2",fontWeight:600}}>LIVE</span>
          </div>
          <Link href="#telegram" style={{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"8px",background:"rgba(0,229,168,0.1)",border:"1px solid rgba(0,229,168,0.22)",color:"#00E5A8",fontSize:"11px",fontWeight:600,textDecoration:"none"}} className="hidden sm:flex">
            <Bell size={11}/> Tín hiệu miễn phí
          </Link>
          <button onClick={()=>setOpen(!open)} style={{width:"32px",height:"32px",borderRadius:"7px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} className="md:hidden">
            {open?<X size={14} color="#94A3B8"/>:<Menu size={14} color="#94A3B8"/>}
          </button>
        </div>
      </div>
      {open&&(
        <div style={{background:"rgba(5,8,22,0.98)",borderTop:"1px solid rgba(255,255,255,0.06)",padding:"10px 18px"}} className="md:hidden">
          {NAV.map(n=>(
            <Link key={n.href} href={n.href} onClick={()=>setOpen(false)}
              style={{display:"block",padding:"10px 0",fontSize:"14px",color:"#94A3B8",textDecoration:"none",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
