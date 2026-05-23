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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(5,8,22,0.9)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", gap: "24px" }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "rgba(0,229,168,0.15)",
            border: "1px solid rgba(0,229,168,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <TrendingUp size={14} color="#00E5A8" />
          </div>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "#fff", letterSpacing: "-0.3px" }}>
            Invest<span style={{ color: "#00E5A8" }}>Hub</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", gap: "2px", flex: 1 }} className="hidden md:flex">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={{
              padding: "6px 14px", borderRadius: "8px",
              fontSize: "13px", fontWeight: "500",
              color: "rgba(148,163,184,0.8)",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = item.color; (e.target as HTMLElement).style.background = `${item.color}12`; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(148,163,184,0.8)"; (e.target as HTMLElement).style.background = "transparent"; }}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
          {/* Live */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "20px", background: "rgba(0,255,178,0.08)", border: "1px solid rgba(0,255,178,0.2)" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00FFB2", animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#00FFB2", fontWeight: "600" }}>LIVE</span>
          </div>

          {/* Search */}
          <button style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Search size={14} color="rgba(148,163,184,0.7)" />
          </button>

          {/* CTA */}
          <Link href="#" style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "7px 16px", borderRadius: "8px",
            background: "rgba(0,229,168,0.12)",
            border: "1px solid rgba(0,229,168,0.25)",
            color: "#00E5A8", fontSize: "12px", fontWeight: "600",
            textDecoration: "none", transition: "all 0.15s",
          }}>
            <Bell size={12} />
            Tín hiệu miễn phí
          </Link>

          {/* Mobile */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            className="md:hidden">
            {mobileOpen ? <X size={14} color="#94A3B8" /> : <Menu size={14} color="#94A3B8" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: "rgba(5,8,22,0.98)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 20px" }} className="md:hidden">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              style={{ display: "block", padding: "10px 0", fontSize: "14px", color: "#94A3B8", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
