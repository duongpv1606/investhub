import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { TickerBar } from "@/components/layout/ticker-bar";
import { Footer } from "@/components/layout/footer";
import { MarketOverview } from "@/components/market/market-overview";
import { MOCK_NEWS } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "InvestHub — Professional Financial Intelligence",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <TickerBar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="mx-auto max-w-screen-xl px-6 py-20 text-center relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-mono text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              AI-Powered Financial Intelligence
            </div>
            <h1 className="font-display text-5xl font-black leading-none tracking-tight mb-5 md:text-7xl">
              Markets Move Fast.<br />
              <span className="text-primary">Stay Ahead.</span>
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Real-time stocks, crypto, AI analysis and portfolio tracking — all in one terminal built for serious investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/crypto" className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-background hover:bg-primary/90 transition-colors">
                Explore Markets
              </Link>
              <Link href="/ai" className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-8 py-3 text-base font-medium text-white hover:border-accent hover:text-accent transition-colors">
                Try AI Analysis
              </Link>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 border-t border-border pt-12">
              {[
                { num: "2.4M+", label: "Active Traders" },
                { num: "$840B", label: "Assets Tracked" },
                { num: "50K+", label: "Assets Covered" },
                { num: "99.9%", label: "Uptime SLA" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-3xl font-black text-primary">{s.num}</div>
                  <div className="text-xs text-muted mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-screen-2xl px-4 py-12 md:px-6 space-y-12">
          {/* Market Overview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-bold">Market Overview</h2>
                <p className="text-sm text-muted mt-0.5">Major indices & assets</p>
              </div>
            </div>
            <MarketOverview />
          </section>

          {/* News */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Latest News</h2>
              <Link href="/news" className="text-sm text-primary hover:underline">View All →</Link>
            </div>
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {MOCK_NEWS.slice(0, 5).map((article) => (
                <div key={article.id} className="p-4 flex gap-4 hover:bg-card-hover transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-card-hover flex items-center justify-center text-xl flex-shrink-0">
                    {article.category.slug === "crypto" ? "₿" : article.category.slug === "ai-tech" ? "🤖" : "📊"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/10 text-accent">
                        {article.category.name}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-white hover:text-primary cursor-pointer line-clamp-1">{article.title}</h3>
                    <p className="text-xs text-muted mt-1">{timeAgo(article.publishedAt)} · {article.readTime} min read</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
