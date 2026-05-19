// src/lib/api/rss.ts
// RSS Parser — Tin tức từ CafeF, VnExpress, CoinDesk, CoinTelegraph

import type { NewsArticle } from "@/types/market";

const RSS_FEEDS = {
  stocks: [
    { url: "https://cafef.vn/thi-truong-chung-khoan.rss", source: "CafeF", category: "Chứng khoán" },
    { url: "https://cafef.vn/dau-tu.rss", source: "CafeF", category: "Đầu tư" },
    { url: "https://cafef.vn/tai-chinh-ngan-hang.rss", source: "CafeF", category: "Tài chính" },
    { url: "https://vnexpress.net/rss/kinh-doanh.rss", source: "VnExpress", category: "Kinh doanh" },
    { url: "https://vnexpress.net/rss/chung-khoan.rss", source: "VnExpress", category: "Chứng khoán" },
  ],
  gold: [
    { url: "https://cafef.vn/thi-truong.rss", source: "CafeF", category: "Thị trường" },
    { url: "https://vnexpress.net/rss/kinh-doanh.rss", source: "VnExpress", category: "Kinh doanh" },
  ],
  crypto: [
    { url: "https://cointelegraph.com/rss", source: "CoinTelegraph", category: "Crypto" },
    { url: "https://coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk", category: "Crypto" },
  ],
};

// Parse XML RSS feed
function parseRSSXML(xml: string, source: string, marketType: "stock" | "gold" | "crypto" | "macro"): NewsArticle[] {
  const articles: NewsArticle[] = [];

  try {
    // Extract items from XML
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];

      const title = extractTag(item, "title");
      const link = extractTag(item, "link") || extractTag(item, "guid");
      const description = extractTag(item, "description");
      const pubDate = extractTag(item, "pubDate");
      const enclosure = item.match(/enclosure[^>]+url="([^"]+)"/)?.[1];
      const mediaContent = item.match(/media:content[^>]+url="([^"]+)"/)?.[1];

      if (!title || !link) continue;

      const cleanTitle = cleanHTML(title);
      const cleanDesc = cleanHTML(description || "").slice(0, 300);
      const publishedAt = pubDate ? new Date(pubDate).getTime() : Date.now();

      if (isNaN(publishedAt)) continue;

      articles.push({
        id: generateId(cleanTitle + link),
        marketType,
        title: cleanTitle,
        summary: cleanDesc,
        imageUrl: enclosure || mediaContent,
        sourceName: source,
        sourceUrl: link,
        publishedAt,
        slug: slugify(cleanTitle),
        tags: extractTags(cleanTitle, marketType),
      });
    }
  } catch (err) {
    console.error(`[RSS] Parse error for ${source}:`, err);
  }

  return articles;
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i"));
  return (match?.[1] || match?.[2] || "").trim();
}

function cleanHTML(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function generateId(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function extractTags(title: string, marketType: string): string[] {
  const tags: string[] = [marketType];
  const keywords = {
    stock: ["VN-Index", "VNINDEX", "HNX", "cổ phiếu", "chứng khoán", "VCB", "HPG", "FPT", "TCB"],
    gold: ["vàng", "SJC", "DOJI", "XAU", "vàng miếng", "vàng nhẫn"],
    crypto: ["Bitcoin", "BTC", "Ethereum", "ETH", "XRP", "crypto", "tiền điện tử", "blockchain"],
  };

  const kws = keywords[marketType as keyof typeof keywords] || [];
  kws.forEach(kw => {
    if (title.toLowerCase().includes(kw.toLowerCase())) tags.push(kw);
  });

  return [...new Set(tags)].slice(0, 5);
}

// Fetch và parse 1 RSS feed
async function fetchRSSFeed(
  feedUrl: string,
  source: string,
  marketType: "stock" | "gold" | "crypto" | "macro"
): Promise<NewsArticle[]> {
  try {
    // Proxy qua allorigins để bypass CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
    const res = await fetch(proxyUrl, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const xml = data.contents || data;

    if (typeof xml !== "string") throw new Error("Invalid response");
    return parseRSSXML(xml, source, marketType);
  } catch (err) {
    console.warn(`[RSS] Failed to fetch ${feedUrl}:`, err);
    return [];
  }
}

// Lấy tất cả tin tức
export async function getAllNews(limit = 30): Promise<NewsArticle[]> {
  try {
    const fetches = [
      ...RSS_FEEDS.stocks.map(f => fetchRSSFeed(f.url, f.source, "stock")),
      ...RSS_FEEDS.crypto.map(f => fetchRSSFeed(f.url, f.source, "crypto")),
    ];

    const results = await Promise.allSettled(fetches);
    const allArticles = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => (r as any).value as NewsArticle[]);

    // Deduplicate và sort
    const seen = new Set<string>();
    return allArticles
      .filter(a => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      })
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, limit);
  } catch {
    return getMockNews();
  }
}

// Lấy tin theo market type
export async function getNewsByMarket(
  marketType: "stock" | "gold" | "crypto",
  limit = 20
): Promise<NewsArticle[]> {
  const feeds = RSS_FEEDS[marketType] || [];
  try {
    const results = await Promise.allSettled(
      feeds.map(f => fetchRSSFeed(f.url, f.source, marketType))
    );
    const articles = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => (r as any).value as NewsArticle[]);

    const seen = new Set<string>();
    return articles
      .filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; })
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, limit);
  } catch {
    return getMockNews().filter(n => n.marketType === marketType);
  }
}

// Mock news fallback
export function getMockNews(): NewsArticle[] {
  const now = Date.now();
  return [
    { id: "mock1", marketType: "stock", title: "VN-Index tăng mạnh phiên cuối tuần, nhóm ngân hàng dẫn sóng", summary: "Thị trường chứng khoán Việt Nam kết thúc tuần giao dịch với sắc xanh áp đảo. VN-Index tăng 12.35 điểm (+0.97%) lên 1.285,42 điểm, thanh khoản đạt 18.500 tỷ đồng.", sourceName: "CafeF", sourceUrl: "https://cafef.vn", publishedAt: now - 3600000, slug: "vn-index-tang-manh-phien-cuoi-tuan", tags: ["VN-Index", "Ngân hàng", "stock"] },
    { id: "mock2", marketType: "gold", title: "Giá vàng SJC tăng thêm 500.000đ/lượng, chênh lệch mua-bán thu hẹp", summary: "Giá vàng miếng SJC hôm nay được niêm yết ở mức 109,5 triệu đồng/lượng mua vào và 110,5 triệu đồng/lượng bán ra.", sourceName: "VnExpress", sourceUrl: "https://vnexpress.net", publishedAt: now - 7200000, slug: "gia-vang-sjc-tang-500k", tags: ["Vàng SJC", "gold"] },
    { id: "mock3", marketType: "crypto", title: "Bitcoin chạm $104,000 rồi điều chỉnh, nhà đầu tư tổ chức tiếp tục tích lũy", summary: "BTC đã có lúc chạm ngưỡng $104,000 trong phiên sáng nay trước khi điều chỉnh nhẹ về $103,420. Dòng tiền từ các ETF Bitcoin spot tiếp tục tích cực.", sourceName: "CoinDesk", sourceUrl: "https://coindesk.com", publishedAt: now - 5400000, slug: "bitcoin-cham-104k-dieu-chinh", tags: ["BTC", "Bitcoin", "ETF", "crypto"] },
    { id: "mock4", marketType: "stock", title: "FPT báo lãi Q1/2025 tăng 28%, cổ phiếu tăng kịch trần", summary: "CTCP FPT công bố kết quả kinh doanh quý I/2025 với doanh thu đạt 16.827 tỷ đồng và lợi nhuận sau thuế 2.456 tỷ đồng, tăng 28%.", sourceName: "CafeF", sourceUrl: "https://cafef.vn", publishedAt: now - 10800000, slug: "fpt-bao-lai-q1-2025-tang-28", tags: ["FPT", "Kết quả kinh doanh", "stock"] },
    { id: "mock5", marketType: "crypto", title: "Ethereum ETF dòng tiền vào đạt $2.1 tỷ trong tuần, kỷ lục mới", summary: "Các quỹ ETF Ethereum spot tại Mỹ ghi nhận dòng tiền vào thuần đạt 2,1 tỷ USD trong tuần qua, mức cao nhất kể từ khi ra mắt.", sourceName: "CoinTelegraph", sourceUrl: "https://cointelegraph.com", publishedAt: now - 14400000, slug: "ethereum-etf-2-1-ty", tags: ["ETH", "Ethereum", "ETF", "crypto"] },
    { id: "mock6", marketType: "stock", title: "Khối ngoại mua ròng 450 tỷ đồng phiên cuối tuần, tập trung VCB và HPG", summary: "Nhà đầu tư nước ngoài quay lại mua ròng sau 5 phiên bán liên tiếp với tổng giá trị 450 tỷ đồng.", sourceName: "VnExpress", sourceUrl: "https://vnexpress.net", publishedAt: now - 18000000, slug: "khoi-ngoai-mua-rong-450-ty", tags: ["Khối ngoại", "VCB", "HPG", "stock"] },
  ];
}
