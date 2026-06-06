"use client";
import Link from "next/link";
import { useState } from "react";
import { TrendingUp, Bell, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const NAV = [
  { href: "/stocks", label: "Chứng khoán", color: "#4D7CFE" },
  { href: "/gold", label: "Vàng", color: "#FFD166" },
  { href: "/crypto", label: "Crypto", color: "#F7931A" },
  { href: "/news", label: "Tin tức", color: "#00E5A8" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header style={{
      position:"sticky",top:0,zIndex:50,
      background: theme === "dark" ? "rgba(5,8,22,0.93)" : "rgba(255,255,255,0.92)",
      backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
      borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
    }}>
      <div style={{maxWidth:"1600px",margin:"0 auto",padding:"0 20px",height:"54px",display:"flex",alignItems:"center",gap:"20px"}}>

        {/* Logo */}
        <Link href="/" style={{display:"flex",alignItems:"center",gap:"9px",textDecoration:"none",flexShrink:0}}>
          <div style={{width:"28px",height:"28px",borderRadius:"8px",background:"rgba(0,229,168,0.14)",border:"1px solid rgba(0,229,168,0.28)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <TrendingUp size={14} color="#00E5A8"/>
          </div>
          <span style={{fontSize:"16px",fontWeight:700,color: theme === "dark" ? "#fff" : "#0F172A",letterSpacing:"-0.4px",fontFamily:"'Sora','Inter',sans-serif"}}>
            Market<span style={{color:"var(--primary)"}}>Hub</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={{display:"flex",gap:"2px",flex:1}} className="hidden md:flex">
          {NAV.map(n=>(
            <Link key={n.href} href={n.href}
              style={{padding:"6px 14px",borderRadius:"8px",fontSize:"14px",fontWeight:500,color:"var(--muted)",textDecoration:"none",transition:"all .15s",letterSpacing:"-0.1px"}}
              onMouseEnter={e=>{const el=e.target as HTMLElement;el.style.color=n.color;el.style.background=`${n.color}10`;}}
              onMouseLeave={e=>{const el=e.target as HTMLElement;el.style.color="var(--muted)";el.style.background="transparent";}}>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginLeft:"auto"}}>
          {/* Theme toggle */}
          <button onClick={toggle}
            style={{width:"34px",height:"34px",borderRadius:"8px",background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}}
            title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}>
            {theme === "dark" ? <Sun size={15} color="#FFD166"/> : <Moon size={15} color="#4D7CFE"/>}
          </button>

          <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"4px 11px",borderRadius:"20px",background:"rgba(0,255,178,0.07)",border:"1px solid rgba(0,255,178,0.2)"}}>
            <div className="pulse-dot" style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00FFB2"}}/>
            <span style={{fontSize:"11px",fontFamily:"'JetBrains Mono',monospace",color:"#00FFB2",fontWeight:600,letterSpacing:"0.5px"}}>LIVE</span>
          </div>
          <Link href="#telegram"
            style={{display:"flex",alignItems:"center",gap:"7px",padding:"7px 16px",borderRadius:"9px",background:"rgba(0,229,168,0.1)",border:"1px solid rgba(0,229,168,0.22)",color:"#00E5A8",fontSize:"13px",fontWeight:600,textDecoration:"none",letterSpacing:"0.1px"}}
            className="hidden sm:flex">
            <Bell size={12}/> Tín hiệu miễn phí
          </Link>
          <button onClick={()=>setOpen(!open)}
            style={{width:"34px",height:"34px",borderRadius:"8px",background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
            className="md:hidden">
            {open?<X size={15} color="var(--muted)"/>:<Menu size={15} color="var(--muted)"/>}
          </button>
        </div>
      </div>

      {open&&(
        <div style={{background: theme === "dark" ? "rgba(5,8,22,0.98)" : "rgba(255,255,255,0.98)",borderTop: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,padding:"12px 20px"}} className="md:hidden">
          {NAV.map(n=>(
            <Link key={n.href} href={n.href} onClick={()=>setOpen(false)}
              style={{display:"block",padding:"12px 0",fontSize:"15px",fontWeight:500,color:"var(--muted)",textDecoration:"none",borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`}}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
