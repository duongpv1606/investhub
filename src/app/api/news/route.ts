import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FEEDS = [
  {
    url: "https://news.google.com/rss/search?q=chứng+khoán+việt+nam&hl=vi&gl=VN&ceid=VN:vi",
    type: "stock",
    source: "Google News"
  },
  {
    url: "https://news.google.com/rss/search?q=giá+vàng+SJC&hl=vi&gl=VN&ceid=VN:vi",
    type: "gold",
    source: "Google News"
  },
  {
    url: "https://cointelegraph.com/rss",
    type: "crypto",
    source: "CoinTelegraph"
  },
];

const FALLBACK = [
  { id: "f1", marketType: "stock", title: "VN-Index giảm 15 điểm, nhóm dầu khí bán tháo mạnh", summary: "VN-Index chốt phiên giảm hơn 15 điểm do áp lực xả hàng nhóm dầu khí và cổ phiếu vốn nhà nước.", sourceName: "VnExpress", sourceUrl: "https://vnexpress.net/kinh-doanh", publishedAt: Date.now() - 3600000 },
  { id: "f2", marketType: "crypto", title: "Bitcoin điều chỉnh về $103,000 sau khi chạm đỉnh $104K", summary: "BTC điều chỉnh nhẹ sau khi chạm mức $104,000 trong phiên sáng nay.", sourceName: "CoinTelegraph", sourceUrl: "https://cointelegraph.com", publishedAt: Date.now() - 5400000 },
  { id: "f3", marketType: "gold", title: "Giá vàng SJC tăng nhẹ, XAU/USD vượt $3,340", summary: "Vàng SJC niêm yết 109,5 triệu đồng mua vào, 110,5 triệu đồng bán ra.", sourceName: "CafeF", sourceUrl: "https://cafef.vn", publishedAt: Date.now() - 7200000 },
  { id: "f4", marketType: "stock", title: "FPT báo lãi Q1/2025 tăng 28%, cổ phiếu tăng kịch trần", summary: "FPT ghi nhận doanh thu 16.827 tỷ đồng, lợi nhuận tăng 28% so cùng kỳ.", sourceName: "CafeF", sourceUrl: "https://cafef.vn", publishedAt: Date.now() - 10800000 },
  { id: "f5", marketType: "crypto", title: "Ethereum ETF dòng tiền vào đạt $2.1 tỷ trong tuần", summary: "Các quỹ ETF Ethereum ghi nhận tuần mạnh nhất kể từ khi ra mắt.", sourceName: "CoinTelegraph", sourceUrl: "https://cointelegraph.com", publishedAt: Date.now() - 14400000 },
  { id: "f6", marketType: "stock", title: "Khối ngoại mua ròng 450 tỷ đồng, tập trung VCB và HPG", summary: "Nhà đầu tư nước ngoài quay lại mua ròng sau 5 phiên bán liên tiếp.", sourceName: "VnExpress", sourceUrl: "https://vnexpress.net", publishedAt: Date.now() - 18000000 },
];

function parseRSS(xml: string, type: string, source: string) {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  return items.slice(0, 8).map((item, i) => {
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
      item.match(/<title>(.*?)<\/title>/)?.[1] || "").trim();
    const link = (item.match(/<link>(.*?)<\/link>/)?.[1] ||
      item.match(/<guid>(.*?)<\/guid>/)?.[1] || "").trim();
    const desc = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
      item.match(/<description>(.*?)<\/description>/)?.[1] || "")
      .replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").slice(0, 200);
    const img = item.match(/url="(https[^"]+\.(jpg|png|webp)[^"]*)"/) ?.[1] ||
      item.match(/<media:content[^>]+url="([^"]+)"/) ?.[1] || "";
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
    const time = pubDate ? new Date(pubDate).getTime() : Date.now() - i * 3600000;

    if (!title || !link) return null;
    return {
      id: `${type}-${i}-${Date.now()}`,
      marketType: type,
      title,
      summary: desc,
      imageUrl: img || undefined,
      sourceName: source,
      sourceUrl: link,
      publishedAt: isNaN(time) ? Date.now() - i * 3600000 : time,
    };
  }).filter(Boolean);
}

async function fetchFeed(url: string, type: string, source: string) {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(4500),
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml, type, source);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get("market");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

  try {
    const feeds = market
      ? FEEDS.filter(f => f.type === market)
      : FEEDS;

    const results = await Promise.allSettled(
      feeds.map(f => fetchFeed(f.url, f.type, f.source))
    );

    const articles = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => (r as any).value)
      .filter(Boolean)
      .sort((a: any, b: any) => b.publishedAt - a.publishedAt)
      .slice(0, limit);

    if (articles.length === 0) {
      return NextResponse.json(FALLBACK.slice(0, limit));
    }

    return NextResponse.json(articles);
  } catch {
    return NextResponse.json(FALLBACK.slice(0, limit));
  }
}
