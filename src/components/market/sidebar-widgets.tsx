import { cn, formatPrice, formatPercent } from "@/lib/utils";
import type { VNStock, NewsArticle } from "@/types";
import { TrendingUp, TrendingDown, Send, ExternalLink } from "lucide-react";
import { NewsCard } from "@/components/news/news-card";

// Top movers widget
export function TopMovers({ stocks, type }: { stocks: VNStock[]; type: "up" | "down" }) {
  const sorted = [...stocks].sort((a, b) =>
    type === "up" ? b.changePercent - a.changePercent : a.changePercent - b.changePercent
  ).slice(0, 5);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        {type === "up"
          ? <TrendingUp className="h-4 w-4 text-up" />
          : <TrendingDown className="h-4 w-4 text-down" />
        }
        <h3 className="text-sm font-semibold">Top {type === "up" ? "tăng" : "giảm"}</h3>
      </div>
      <div className="space-y-2">
        {sorted.map(stock => (
          <div key={stock.symbol} className="flex items-center justify-between text-xs">
            <div>
              <span className="font-mono font-bold text-white">{stock.symbol}</span>
              <span className="text-muted ml-1 hidden sm:inline">{stock.name}</span>
            </div>
            <div className="text-right">
              <div className="font-mono font-semibold">{(stock.price / 1000).toFixed(1)}k</div>
              <div className={cn("font-mono", stock.changePercent >= 0 ? "text-up" : "text-down")}>
                {formatPercent(stock.changePercent)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hot news sidebar
export function HotNews({ articles }: { articles: NewsArticle[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-down animate-pulse" />
        Tin nóng
      </h3>
      <div>
        {articles.slice(0, 5).map(a => (
          <NewsCard key={a.id} article={a} variant="compact" />
        ))}
      </div>
    </div>
  );
}

// Telegram CTA
export function TelegramCTA() {
  return (
    <div className="card p-4 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
      <div className="flex items-center gap-2 mb-2">
        <Send className="h-5 w-5 text-accent" />
        <h3 className="text-sm font-semibold">Nhóm Telegram</h3>
      </div>
      <p className="text-xs text-muted mb-3">
        Nhận tín hiệu giao dịch, phân tích thị trường miễn phí mỗi ngày
      </p>
      <a
        href="https://t.me/investhub_vn"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent py-2.5 text-xs font-semibold text-white hover:bg-accent/90 transition-colors"
      >
        <Send className="h-3.5 w-3.5" />
        Tham gia ngay — Miễn phí
      </a>
    </div>
  );
}

// Open account CTA
export function OpenAccountCTA() {
  return (
    <div className="card p-4 border-primary/20">
      <h3 className="text-sm font-semibold mb-1">Mở tài khoản chứng khoán</h3>
      <p className="text-xs text-muted mb-3">
        Phí giao dịch 0% — mở tài khoản online trong 5 phút
      </p>
      <div className="space-y-2">
        {[
          { name: "TCBS", desc: "Phí 0%, nền tảng hiện đại" },
          { name: "SSI", desc: "Top 1 môi giới VN" },
          { name: "VPS", desc: "Ưu đãi cho khách mới" },
        ].map(broker => (
          <a key={broker.name} href="#"
            className="flex items-center justify-between p-2.5 rounded-lg bg-surface hover:bg-card transition-colors group">
            <div>
              <div className="text-xs font-bold text-white">{broker.name}</div>
              <div className="text-xs text-muted">{broker.desc}</div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted group-hover:text-primary transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}
