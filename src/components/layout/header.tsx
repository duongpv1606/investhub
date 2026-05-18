"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, TrendingUp, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/stocks", label: "Chứng khoán", icon: "📈" },
  { href: "/gold", label: "Vàng", icon: "🥇" },
  { href: "/crypto", label: "Crypto", icon: "₿" },
  { href: "/news", label: "Tin tức", icon: "📰" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-white text-lg">
            Invest<span className="text-primary">Hub</span>
            <span className="text-xs text-muted ml-1 font-normal hidden sm:inline">VN</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex ml-4">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-white">
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden md:block mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              placeholder="Tìm mã CK, coin, tin tức..."
              className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            LIVE
          </div>

          {/* CTA */}
          <Link href="#telegram"
            className="hidden sm:flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-bg hover:bg-primary/90 transition-colors">
            <Bell className="h-3.5 w-3.5" />
            Nhận tín hiệu miễn phí
          </Link>

          {/* Mobile search */}
          <button onClick={() => setSearchOpen(!searchOpen)} className="rounded-lg p-2 text-muted hover:text-white hover:bg-card md:hidden">
            <Search className="h-5 w-5" />
          </button>

          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-muted hover:text-white hover:bg-card md:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="border-t border-border px-4 py-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input placeholder="Tìm mã CK, coin..." className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted outline-none focus:border-primary/50" />
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-surface md:hidden">
          <nav className="flex flex-col p-3 gap-1">
            {NAV.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted hover:bg-card hover:text-white transition-colors">
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <Link href="#telegram" className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-bg">
              <Bell className="h-4 w-4" />
              Nhận tín hiệu miễn phí
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
