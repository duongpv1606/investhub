import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="mx-auto max-w-screen-2xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-display text-lg font-bold mb-4">
              Invest<span className="text-primary">Hub</span>
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Professional-grade financial intelligence for serious investors.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Markets</h4>
            <ul className="space-y-2">
              {["Stocks", "Crypto", "Watchlist", "Portfolio"].map((item) => (
                <li key={item}><Link href={`/${item.toLowerCase()}`} className="text-sm text-muted hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Tools</h4>
            <ul className="space-y-2">
              {["AI Assistant", "News", "Pricing", "API"].map((item) => (
                <li key={item}><Link href="#" className="text-sm text-muted hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Privacy Policy", "Terms"].map((item) => (
                <li key={item}><Link href="#" className="text-sm text-muted hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted">© 2025 InvestHub. All rights reserved.</p>
          <p className="text-xs text-muted">
            ⚠️ Not financial advice. Investment decisions are your own responsibility.
          </p>
        </div>
      </div>
    </footer>
  );
}
