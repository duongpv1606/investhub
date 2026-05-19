// src/lib/services/news-service.ts
// News Service — Aggregate và deduplicate tin tức

import type { NewsArticle } from "@/types/market";
import { getAllNews, getNewsByMarket, getMockNews } from "@/lib/api/rss";

const NEWS_CACHE = new Map<string, { data: NewsArticle[]; expiry: number }>();

function getCachedNews(key: string): NewsArticle[] | null {
  const item = NEWS_CACHE.get(key);
  if (item && item.expiry > Date.now()) return item.data;
  return null;
}

function setCachedNews(key: string, data: NewsArticle[], ttlMs = 300000): void {
  NEWS_CACHE.set(key, { data, expiry: Date.now() + ttlMs });
}

// Lấy tất cả tin tức
export async function getLatestNews(limit = 20): Promise<NewsArticle[]> {
  const cached = getCachedNews("all_news");
  if (cached) return cached.slice(0, limit);

  try {
    const news = await getAllNews(50);
    const deduped = deduplicateArticles(news);
    setCachedNews("all_news", deduped);
    return deduped.slice(0, limit);
  } catch {
    return getMockNews().slice(0, limit);
  }
}

// Lấy tin theo thị trường
export async function getMarketNews(
  marketType: "stock" | "gold" | "crypto",
  limit = 15
): Promise<NewsArticle[]> {
  const cacheKey = `news_${marketType}`;
  const cached = getCachedNews(cacheKey);
  if (cached) return cached.slice(0, limit);

  try {
    const news = await getNewsByMarket(marketType, 30);
    const deduped = deduplicateArticles(news);
    setCachedNews(cacheKey, deduped, 300000);
    return deduped.slice(0, limit);
  } catch {
    return getMockNews().filter(n => n.marketType === marketType).slice(0, limit);
  }
}

// Featured news (tin nổi bật)
export async function getFeaturedNews(limit = 6): Promise<NewsArticle[]> {
  const all = await getLatestNews(30);
  return all.slice(0, limit);
}

// Hot news (tin nóng sidebar)
export async function getHotNews(limit = 8): Promise<NewsArticle[]> {
  const all = await getLatestNews(20);
  return all.slice(0, limit);
}

// Deduplicate bằng title similarity
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  const result: NewsArticle[] = [];

  for (const article of articles) {
    const key = normalizeTitle(article.title);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(article);
    }
  }

  return result.sort((a, b) => b.publishedAt - a.publishedAt);
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);
}

// Search news
export async function searchNews(query: string, limit = 10): Promise<NewsArticle[]> {
  const all = await getLatestNews(50);
  const q = query.toLowerCase();
  return all
    .filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags?.some(t => t.toLowerCase().includes(q))
    )
    .slice(0, limit);
}
