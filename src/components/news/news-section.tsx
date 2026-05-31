"use client";
import { useState, useEffect } from "react";
import { MOCK_NEWS } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function NewsSection() {
  const [news, setNews] = useState<any[]>(MOCK_NEWS);

  useEffect(() => {
    fetch("/api/news?limit=20")
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data?.news;
        if (Array.isArray(list) && list.length > 0) {
          setNews(list.map((n: any) => ({ ...n, marketType: n.marketType ?? n.category })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white">Tin tức mới nhất</h2>
        <Link href="/news" className="flex items-center gap-1 text-xs text-primary hover:underline">
          Tất cả tin <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {news.slice(0, 4).map((a: any) => (
          <a key={a.id} href={a.sourceUrl || a.url || "#"} target="_blank" rel="noopener noreferrer"
            className="card p-4 group hover:border-primary/30 transition-all block">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                a.marketType === "crypto" ? "bg-primary/10 text-primary" :
                a.marketType === "gold" ? "bg-yellow-500/10 text-yellow-400" :
                "bg-blue-500/10 text-blue-400"
              }`}>
                {a.marketType === "crypto" ? "Crypto" : a.marketType === "gold" ? "Vàng" : "Chứng khoán"}
              </span>
              <span className="text-xs text-muted">{a.sourceName || a.source}</span>
            </div>
            {a.imageUrl && (
              <img src={a.imageUrl} alt="" className="w-full h-28 object-cover rounded-lg mb-2" loading="lazy" />
            )}
            <h3 className="font-semibold text-white text-sm group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {a.title}
            </h3>
            <p className="text-xs text-muted mt-1 line-clamp-2">{a.summary || a.excerpt}</p>
            <p className="text-xs text-muted mt-2">
              {new Date(a.publishedAt).toLocaleDateString("vi-VN")}
            </p>
          </a>
        ))}
      </div>
      <div className="card p-4 mt-3 divide-y divide-border/50">
        {news.slice(4, 12).map((a: any) => (
          <a key={a.id} href={a.sourceUrl || a.url || "#"} target="_blank" rel="noopener noreferrer"
            className="flex gap-3 py-3 group">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted">{a.sourceName || a.source}</span>
              <p className="text-sm font-medium text-white group-hover:text-primary transition-colors line-clamp-2 mt-0.5">
                {a.title}
              </p>
              <p className="text-xs text-muted mt-1">
                {new Date(a.publishedAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
            {a.imageUrl && (
              <img src={a.imageUrl} alt="" className="w-14 h-12 object-cover rounded-lg flex-shrink-0" loading="lazy" />
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
