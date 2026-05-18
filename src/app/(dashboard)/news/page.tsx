import type { Metadata } from "next";
import Link from "next/link";
import { MOCK_NEWS } from "@/lib/mock-data";
import { timeAgo, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Financial News" };

const CATEGORIES = ["All", "Stocks", "Crypto", "Macro", "AI & Tech", "Earnings"];

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black">Financial News</h1>
        <p className="text-muted text-sm mt-1">Curated market news from trusted sources</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`px-4 py-1.5 rounded-full text-sm transition-all ${cat === "All" ? "bg-primary text-background font-semibold" : "bg-card border border-border text-muted hover:text-white"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Article */}
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
        <div className="h-48 bg-gradient-to-r from-accent/20 to-primary/20 flex items-center justify-center">
          <span className="text-6xl">📈</span>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono px-2 py-1 rounded bg-primary/10 text-primary">FEATURED</span>
            <span className="text-xs font-mono px-2 py-1 rounded bg-accent/10 text-accent">AI & Tech</span>
          </div>
          <h2 className="font-display text-xl font-bold mb-2 hover:text-primary transition-colors">
            {MOCK_NEWS[0].title}
          </h2>
          <p className="text-sm text-muted line-clamp-2 mb-3">{MOCK_NEWS[0].excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{MOCK_NEWS[0].author.name}</span>
            <span>·</span>
            <span>{timeAgo(MOCK_NEWS[0].publishedAt)}</span>
            <span>·</span>
            <span>{MOCK_NEWS[0].readTime} min read</span>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_NEWS.slice(1).map((article) => (
          <div key={article.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/10 text-accent">{article.category.name}</span>
            </div>
            <h3 className="text-sm font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
            <p className="text-xs text-muted line-clamp-2 mb-3">{article.excerpt}</p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{timeAgo(article.publishedAt)}</span>
              <span>·</span>
              <span>{article.readTime} min read</span>
              <span className="ml-auto">{article.views.toLocaleString()} views</span>
            </div>
            <div className="flex gap-1 mt-3 flex-wrap">
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-card-hover rounded text-muted">#{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
