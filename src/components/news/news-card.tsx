import { cn, timeAgo, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/utils";
import type { NewsArticle } from "@/types";
import { Clock, ExternalLink } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
  variant?: "default" | "compact" | "featured";
}

export function NewsCard({ article, variant = "default" }: NewsCardProps) {
  const catColor = CATEGORY_COLORS[article.category] || "text-muted bg-muted/10";
  const catLabel = CATEGORY_LABELS[article.category] || article.category;

  if (variant === "compact") {
    return (
      <a href={article.url} target="_blank" rel="noopener noreferrer"
        className="flex gap-3 py-3 border-b border-border/60 last:border-none group hover:bg-card/50 rounded-lg px-2 -mx-2 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-mono px-1.5 py-0.5 rounded", catColor)}>
              {catLabel}
            </span>
          </div>
          <p className="text-sm font-medium text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {article.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted">
            <span>{article.sourceName || article.source}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(article.publishedAt)}
            </span>
          </div>
        </div>
        {article.imageUrl && (
          <div className="w-16 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-border">
            <img src={article.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
      </a>
    );
  }

  if (variant === "featured") {
    return (
      <a href={article.sourceUrl || article.url} target="_blank" rel="noopener noreferrer"
        className="card p-5 group hover:border-primary/30 transition-all block">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("text-xs font-mono px-2 py-1 rounded", catColor)}>{catLabel}</span>
          {article.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded bg-border/50 text-muted">#{tag}</span>
          ))}
        </div>
        <h3 className="font-semibold text-white text-base group-hover:text-primary transition-colors mb-2 leading-snug">
          {article.title}
        </h3>
        <p className="text-sm text-muted line-clamp-2 mb-3">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(article.publishedAt)} · {article.sourceName || article.source}
          </span>
          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </a>
    );
  }

  return (
    <a href={article.sourceUrl || article.url} target="_blank" rel="noopener noreferrer"
      className="flex gap-4 py-4 border-b border-border/60 last:border-none group">
      <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-card flex items-center justify-center text-2xl">
        {article.imageUrl
          ? <img src={article.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          : (article.category === "gold" ? "🥇" : article.category === "crypto" ? "₿" : "📈")
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-xs font-mono px-1.5 py-0.5 rounded", catColor)}>{catLabel}</span>
          <span className="text-xs text-muted">{}</span>
        </div>
        <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="text-xs text-muted mt-1 line-clamp-1">{article.excerpt}</p>
        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted">
          <Clock className="h-3 w-3" />
          {timeAgo(article.publishedAt)}
          {article.readTime && <span> · {article.readTime} phút đọc</span>}
        </div>
      </div>
    </a>
  );
}
