import { NextResponse } from "next/server";

export const revalidate = 1800;

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  category: "stock" | "crypto" | "macro" | "gold" | "forex" | "general";
  sentiment?: "positive" | "negative" | "neutral";
}

// Parse RSS XML trực tiếp — không qua rss2json
async function fetchRSS(url: string, source: string, category: NewsItem["category"]): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MarketHub/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const xml = await res.text();

    // Parse <item> blocks từ XML
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    let i = 0;

    while ((match = itemRegex.exec(xml)) !== null && i < 8) {
      const block = match[1];
      const title = extractTag(block, "title");
      const link = extractTag(block, "link") || extractTag(block, "guid");
      const desc = extractTag(block, "description") || extractTag(block, "summary");
      const pubDate = extractTag(block, "pubDate") || extractTag(block, "dc:date");
      const imgMatch = block.match(/<enclosure[^>]+url="([^"]+)"/i) ||
                       desc?.match(/<img[^>]+src="([^"]+)"/i);

      if (!title) continue;

      items.push({
        id: `${source}-${i}-${Date.now()}`,
        title: stripHtml(title),
        summary: stripHtml(desc || "").slice(0, 300),
        url: link || url,
        source,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        imageUrl: imgMatch?.[1],
        category,
        sentiment: analyzeSentiment(title),
      });
      i++;
    }
    return items;
  } catch {
    return [];
  }
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
  return match?.[1]?.trim() || "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

function analyzeSentiment(title: string): NewsItem["sentiment"] {
  if (/tăng|lên|phục hồi|tích cực|lợi nhuận|kỷ lục|bứt phá|rally|surge/i.test(title)) return "positive";
  if (/giảm|xuống|rủi ro|lo ngại|mất|sụt|bán tháo|cảnh báo|drop|fall/i.test(title)) return "negative";
  return "neutral";
}

function classifyNews(title: string): NewsItem["category"] {
  if (/bitcoin|crypto|btc|eth|coin|blockchain/i.test(title)) return "crypto";
  if (/vàng|gold|sjc|xau/i.test(title)) return "gold";
  if (/usd|tỷ giá|ngoại tệ|forex|đô la/i.test(title)) return "forex";
  if (/chứng khoán|cổ phiếu|vn.?index|hnx|hose|upcom/i.test(title)) return "stock";
  if (/lạm phát|gdp|kinh tế|fed|lãi suất|ngân hàng/i.test(title)) return "macro";
  return "general";
}

function dedup(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.slice(0, 60).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Nguồn RSS VN — fetch trực tiếp, không qua proxy
const RSS_SOURCES = [
  { url: "https://cafef.vn/thi-truong-chung-khoan.rss", source: "CafeF", category: "stock" as const },
  { url: "https://cafef.vn/thi-truong-tien-te.rss", source: "CafeF", category: "forex" as const },
  { url: "https://cafef.vn/bat-dong-san.rss", source: "CafeF", category: "general" as const },
  { url: "https://vneconomy.vn/chung-khoan.rss", source: "VnEconomy", category: "stock" as const },
  { url: "https://vneconomy.vn/tai-chinh.rss", source: "VnEconomy", category: "macro" as const },
  { url: "https://vietstock.vn/rss/toan-thi-truong.rss", source: "VietStock", category: "stock" as const },
  { url: "https://www.tinnhanhchungkhoan.vn/rss/chung-khoan.rss", source: "TNCK", category: "stock" as const },
  { url: "https://rss.cointelegraph.com/rss", source: "CoinTelegraph", category: "crypto" as const },
];

// GNews fallback nếu có key
async function fetchGNews(query: string, lang = "vi", max = 8): Promise<NewsItem[]> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) return [];
  try {
    const params = new URLSearchParams({ q: query, lang, max: String(max), token: key, sortby: "publishedAt" });
    const res = await fetch(`https://gnews.io/api/v4/search?${params}`, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).map((a: any, i: number) => ({
      id: `gnews-${i}-${Date.now()}`,
      title: a.title,
      summary: a.description || "",
      url: a.url,
      source: a.source?.name || "GNews",
      publishedAt: a.publishedAt,
      imageUrl: a.image,
      category: classifyNews(a.title),
      sentiment: analyzeSentiment(a.title),
    }));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 50);

  try {
    // Fetch tất cả RSS song song
    const results = await Promise.allSettled([
      ...RSS_SOURCES.map((s) => fetchRSS(s.url, s.source, s.category)),
      fetchGNews("chứng khoán Việt Nam tài chính", "vi", 6),
    ]);

    const allNews: NewsItem[] = [];
    results.forEach((r) => {
      if (r.status === "fulfilled") allNews.push(...r.value);
    });

    // Sort mới nhất trước
    allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const unique = dedup(allNews);
    const filtered = category === "all" ? unique : unique.filter((n) => n.category === category);
    const result = filtered.slice(0, limit);

    if (result.length === 0) {
      return NextResponse.json({
        success: true,
        news: getMockNews(),
        isMock: true,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      news: result,
      total: result.length,
      isMock: false,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      success: true,
      news: getMockNews(),
      isMock: true,
      updatedAt: new Date().toISOString(),
    });
  }
}

function getMockNews(): NewsItem[] {
  const now = new Date();
  return [
    { id: "mock-1", title: "VN-Index bứt phá mạnh, thanh khoản đạt đỉnh 3 tháng", summary: "Thị trường chứng khoán Việt Nam kết thúc phiên giao dịch với sắc xanh áp đảo.", url: "https://cafef.vn", source: "CafeF", publishedAt: new Date(now.getTime() - 30 * 60000).toISOString(), category: "stock", sentiment: "positive" },
    { id: "mock-2", title: "Bitcoin vượt $70,000, thị trường crypto bùng nổ", summary: "Bitcoin tiếp tục đà tăng mạnh và vượt mốc 70.000 USD.", url: "https://coindesk.com", source: "CoinDesk", publishedAt: new Date(now.getTime() - 45 * 60000).toISOString(), category: "crypto", sentiment: "positive" },
    { id: "mock-3", title: "Giá vàng SJC tăng lên 87 triệu/lượng", summary: "Giá vàng miếng SJC tăng thêm 500.000 đồng/lượng.", url: "https://cafef.vn", source: "CafeF", publishedAt: new Date(now.getTime() - 90 * 60000).toISOString(), category: "gold", sentiment: "neutral" },
    { id: "mock-4", title: "Fed giữ nguyên lãi suất, tín hiệu cắt giảm năm 2025", summary: "Fed quyết định giữ nguyên lãi suất cơ bản.", url: "https://vneconomy.vn", source: "VnEconomy", publishedAt: new Date(now.getTime() - 120 * 60000).toISOString(), category: "macro", sentiment: "positive" },
    { id: "mock-5", title: "Tỷ giá USD/VND tăng nhẹ, NHNN theo dõi sát", summary: "Tỷ giá trung tâm USD/VND tăng nhẹ 15 đồng.", url: "https://ndh.vn", source: "NDH", publishedAt: new Date(now.getTime() - 180 * 60000).toISOString(), category: "forex", sentiment: "neutral" },
    { id: "mock-6", title: "HPG, VHM, VIC dẫn dắt đà tăng của VN-Index", summary: "Nhóm cổ phiếu vốn hóa lớn là động lực chính.", url: "https://vietstock.vn", source: "VietStock", publishedAt: new Date(now.getTime() - 200 * 60000).toISOString(), category: "stock", sentiment: "positive" },
  ];
}
