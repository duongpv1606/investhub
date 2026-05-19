import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MOCK_NEWS = [
  { id: "1", marketType: "stock", title: "VN-Index giảm 15 điểm, nhóm dầu khí bán tháo", summary: "VN-Index chốt phiên giảm hơn 15 điểm do áp lực xả hàng nhóm dầu khí.", sourceName: "VnExpress", sourceUrl: "https://vnexpress.net/kinh-doanh", publishedAt: Date.now() - 3600000 },
  { id: "2", marketType: "crypto", title: "Bitcoin giảm về $103,000 sau khi chạm đỉnh", summary: "BTC điều chỉnh nhẹ sau khi chạm mức $104,000 trong phiên sáng.", sourceName: "CoinTelegraph", sourceUrl: "https://cointelegraph.com", publishedAt: Date.now() - 7200000 },
  { id: "3", marketType: "gold", title: "Giá vàng SJC tăng nhẹ 200.000đ/lượng", summary: "Vàng SJC niêm yết 109,5 triệu đồng mua vào, 110,5 triệu đồng bán ra.", sourceName: "CafeF", sourceUrl: "https://cafef.vn", publishedAt: Date.now() - 10800000 },
  { id: "4", marketType: "stock", title: "FPT báo lãi Q1/2025 tăng 28%", summary: "FPT ghi nhận doanh thu 16.827 tỷ đồng, lợi nhuận tăng 28% so cùng kỳ.", sourceName: "CafeF", sourceUrl: "https://cafef.vn", publishedAt: Date.now() - 14400000 },
  { id: "5", marketType: "crypto", title: "Ethereum ETF dòng tiền vào đạt $2.1 tỷ", summary: "Các quỹ ETF Ethereum ghi nhận tuần mạnh nhất kể từ khi ra mắt.", sourceName: "CoinTelegraph", sourceUrl: "https://cointelegraph.com", publishedAt: Date.now() - 18000000 },
  { id: "6", marketType: "stock", title: "Khối ngoại mua ròng 450 tỷ đồng, tập trung VCB", summary: "Nhà đầu tư nước ngoài quay lại mua ròng sau 5 phiên bán liên tiếp.", sourceName: "VnExpress", sourceUrl: "https://vnexpress.net", publishedAt: Date.now() - 21600000 },
];

export async function GET(req: NextRequest) {
  try {
    // Thử fetch CoinTelegraph RSS - nhanh nhất
    const res = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent("https://cointelegraph.com/rss")}`,
      { signal: AbortSignal.timeout(4000) }
    );
    
    if (res.ok) {
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
      const news = items.slice(0, 5).map((item, i) => {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || "";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
        const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]?.replace(/<[^>]+>/g, "").slice(0, 200) || "";
        const img = item.match(/url="(https[^"]+\.jpg[^"]*)"/) ?.[1] || "";
        return {
          id: `ct-${i}`,
          marketType: "crypto",
          title,
          summary: desc,
          imageUrl: img,
          sourceName: "CoinTelegraph",
          sourceUrl: link,
          publishedAt: Date.now() - i * 3600000,
        };
      }).filter(a => a.title);

      // Gộp với mock VN stocks news
      const combined = [...MOCK_NEWS.filter(n => n.marketType !== "crypto"), ...news];
      return NextResponse.json(combined);
    }
  } catch {}
  
  return NextResponse.json(MOCK_NEWS);
}