import { NextResponse } from "next/server";

/**
 * VN Stocks API — dữ liệu thật realtime từ VNDirect dchart
 *
 * Nguồn: https://dchart-api.vndirect.com.vn/dchart/history  (miễn phí, không cần key)
 * Cách lấy giống project vnstock-pro: gọi history lấy các phiên gần nhất rồi
 * tính giá / thay đổi / khối lượng từ 2 phiên cuối.
 *
 * - Giá close của dchart ở đơn vị nghìn VND (vd FPT close=71.6 => 71.600đ)
 * - Vốn hóa = giá thật × số CP lưu hành (map tĩnh cho các mã lớn)
 * - Có mock fallback nếu nguồn lỗi.
 */

const DCHART_BASE = "https://dchart-api.vndirect.com.vn/dchart/history";

export const revalidate = 60; // cache 60s

interface StockQuote {
  symbol: string;
  name: string;
  price: number;       // VND
  change: number;      // VND
  changePct: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  marketCap: number;   // VND
  sector: string;
  exchange: "HOSE" | "HNX" | "UPCOM";
}

interface IndexData {
  name: string;
  value: number;
  change: number;
  changePct: number;
  volume: number;
  exchange: string;
}

// Metadata tĩnh: tên, sàn, ngành + số CP lưu hành (xấp xỉ, để ước tính vốn hóa)
const STOCK_META: Record<
  string,
  { name: string; exchange: "HOSE" | "HNX" | "UPCOM"; sector: string; shares: number }
> = {
  VCB: { name: "Vietcombank", exchange: "HOSE", sector: "Ngân hàng", shares: 5_589_000_000 },
  BID: { name: "BIDV", exchange: "HOSE", sector: "Ngân hàng", shares: 5_700_000_000 },
  CTG: { name: "VietinBank", exchange: "HOSE", sector: "Ngân hàng", shares: 5_370_000_000 },
  VIC: { name: "Vingroup", exchange: "HOSE", sector: "Bất động sản", shares: 3_823_000_000 },
  VHM: { name: "Vinhomes", exchange: "HOSE", sector: "Bất động sản", shares: 4_354_000_000 },
  HPG: { name: "Hòa Phát", exchange: "HOSE", sector: "Thép", shares: 7_700_000_000 },
  FPT: { name: "FPT Corp", exchange: "HOSE", sector: "Công nghệ", shares: 1_470_000_000 },
  TCB: { name: "Techcombank", exchange: "HOSE", sector: "Ngân hàng", shares: 7_064_000_000 },
  MBB: { name: "MB Bank", exchange: "HOSE", sector: "Ngân hàng", shares: 5_300_000_000 },
  VNM: { name: "Vinamilk", exchange: "HOSE", sector: "Tiêu dùng", shares: 2_090_000_000 },
  GAS: { name: "PV Gas", exchange: "HOSE", sector: "Năng lượng", shares: 2_298_000_000 },
  MSN: { name: "Masan Group", exchange: "HOSE", sector: "Tiêu dùng", shares: 1_435_000_000 },
  MWG: { name: "Thế Giới Di Động", exchange: "HOSE", sector: "Bán lẻ", shares: 1_462_000_000 },
  VPB: { name: "VPBank", exchange: "HOSE", sector: "Ngân hàng", shares: 7_934_000_000 },
  ACB: { name: "ACB", exchange: "HOSE", sector: "Ngân hàng", shares: 4_467_000_000 },
  VRE: { name: "Vincom Retail", exchange: "HOSE", sector: "Bất động sản", shares: 2_272_000_000 },
  SSI: { name: "SSI Securities", exchange: "HOSE", sector: "Chứng khoán", shares: 1_964_000_000 },
  PNJ: { name: "Phú Nhuận Jewelry", exchange: "HOSE", sector: "Bán lẻ", shares: 337_000_000 },
  SHS: { name: "Saigon Hanoi Securities", exchange: "HNX", sector: "Chứng khoán", shares: 1_080_000_000 },
  PVS: { name: "PTSC", exchange: "HNX", sector: "Năng lượng", shares: 478_000_000 },
  CEO: { name: "C.E.O Group", exchange: "HNX", sector: "Bất động sản", shares: 514_000_000 },
  IDC: { name: "IDICO", exchange: "HNX", sector: "Khu công nghiệp", shares: 330_000_000 },
};

const HOSE_SYMBOLS = [
  "VCB", "BID", "CTG", "VIC", "VHM", "HPG", "FPT", "TCB",
  "MBB", "VNM", "GAS", "MSN", "MWG", "VPB", "ACB", "SSI",
];
const HNX_SYMBOLS = ["SHS", "PVS", "CEO", "IDC"];

interface RawOHLCV {
  s: string;
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
}

// Gọi dchart history cho 1 symbol
async function fetchHistory(symbol: string, days = 10, resolution = "D"): Promise<RawOHLCV | null> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - days * 86400;
  try {
    const res = await fetch(
      `${DCHART_BASE}?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}`,
      {
        // Lưu ý: dchart trả 406 nếu Accept là "application/json"; dùng "*/*"
        headers: { "User-Agent": "Mozilla/5.0", Accept: "*/*" },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data: RawOHLCV = await res.json();
    if (data.s !== "ok" || !data.t?.length) return null;
    return data;
  } catch {
    return null;
  }
}

// Snapshot 1 mã: giá / thay đổi / khối lượng từ 2 phiên gần nhất
async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  const data = await fetchHistory(symbol);
  if (!data || data.c.length < 1) return null;

  const i = data.c.length - 1;
  const closeK = data.c[i];               // nghìn VND
  const prevK = i > 0 ? data.c[i - 1] : data.o[i];
  const price = closeK * 1000;
  const change = (closeK - prevK) * 1000;
  const changePct = prevK > 0 ? ((closeK - prevK) / prevK) * 100 : 0;

  const meta = STOCK_META[symbol];
  const marketCap = meta ? price * meta.shares : 0;

  return {
    symbol,
    name: meta?.name ?? symbol,
    price,
    change,
    changePct: Math.round(changePct * 100) / 100,
    volume: data.v[i] ?? 0,
    high: (data.h[i] ?? closeK) * 1000,
    low: (data.l[i] ?? closeK) * 1000,
    open: (data.o[i] ?? closeK) * 1000,
    marketCap,
    sector: meta?.sector ?? "—",
    exchange: meta?.exchange ?? "HOSE",
  };
}

async function fetchTopStocks(symbols: string[]): Promise<StockQuote[]> {
  const results = await Promise.all(symbols.map((s) => fetchStockQuote(s)));
  return results.filter((r): r is StockQuote => r !== null);
}

// Chỉ số VN-Index / HNX-Index / UPCOM
async function fetchIndices(): Promise<IndexData[]> {
  const defs: { symbol: string; name: string; exchange: string }[] = [
    { symbol: "VNINDEX", name: "VN-Index", exchange: "HOSE" },
    { symbol: "VN30", name: "VN30", exchange: "HOSE" },
    { symbol: "HNX", name: "HNX-Index", exchange: "HNX" },
    { symbol: "UPCOM", name: "UPCOM", exchange: "UPCOM" },
  ];

  const dataArr = await Promise.all(defs.map((d) => fetchHistory(d.symbol)));

  const indices = dataArr.map((data, idx) => {
    const def = defs[idx];
    if (data && data.c.length >= 2) {
      const i = data.c.length - 1;
      const value = data.c[i];
      const prev = data.c[i - 1];
      const change = value - prev;
      const changePct = prev > 0 ? (change / prev) * 100 : 0;
      return {
        name: def.name,
        value: Math.round(value * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePct: Math.round(changePct * 100) / 100,
        volume: data.v[i] ?? 0,
        exchange: def.exchange,
      };
    }
    return null;
  });

  const valid = indices.filter((x): x is IndexData => x !== null);
  return valid.length > 0 ? valid : getMockIndices();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "overview";
  const symbol = searchParams.get("symbol") || "";
  const resolution = searchParams.get("resolution") || "D";

  try {
    if (type === "overview") {
      const [hose, hnx, indices] = await Promise.all([
        fetchTopStocks(HOSE_SYMBOLS),
        fetchTopStocks(HNX_SYMBOLS),
        fetchIndices(),
      ]);

      // Nếu cả 2 sàn đều rỗng (nguồn lỗi) -> mock
      if (hose.length === 0 && hnx.length === 0) {
        return NextResponse.json({
          success: true,
          indices,
          stocks: { HOSE: getMockStocks(), HNX: [] },
          isMock: true,
          updatedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        indices,
        stocks: { HOSE: hose, HNX: hnx },
        isMock: false,
        updatedAt: new Date().toISOString(),
      });
    }

    if (type === "chart" && symbol) {
      const days = Math.min(parseInt(searchParams.get("days") || "120"), 1825);
      // dchart không có dữ liệu phút ổn định (đóng cửa cuối tuần) -> dùng giờ cho khung ngắn.
      // Khung <=7 ngày: nến giờ với lookback tối thiểu 5 phiên để luôn có dữ liệu thật.
      const intraday = days <= 7;
      const reso = intraday ? "60" : "D";
      const lookback = intraday ? Math.max(days, 5) : days;
      const data = await fetchHistory(symbol, lookback, reso);
      if (!data) {
        return NextResponse.json({ success: true, symbol, isMock: true, candles: getMockOHLCV(symbol) });
      }
      const candles = data.t.map((ts, i) => ({
        time: ts * 1000,
        open: data.o[i] * 1000,
        high: data.h[i] * 1000,
        low: data.l[i] * 1000,
        close: data.c[i] * 1000,
        volume: data.v[i],
      }));
      return NextResponse.json({ success: true, symbol, resolution: reso, intraday, isMock: false, candles });
    }

    if (type === "indices") {
      const indices = await fetchIndices();
      return NextResponse.json({ success: true, indices });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch {
    return NextResponse.json({
      success: true,
      indices: getMockIndices(),
      stocks: { HOSE: getMockStocks(), HNX: [] },
      isMock: true,
      updatedAt: new Date().toISOString(),
    });
  }
}

// ── Mock fallbacks ──────────────────────────────────────────────────────────

function getMockIndices(): IndexData[] {
  return [
    { name: "VN-Index", value: 1287.45, change: 8.32, changePct: 0.65, volume: 612000000, exchange: "HOSE" },
    { name: "HNX-Index", value: 234.12, change: -1.45, changePct: -0.62, volume: 98000000, exchange: "HNX" },
    { name: "UPCOM", value: 92.67, change: 0.34, changePct: 0.37, volume: 42000000, exchange: "UPCOM" },
  ];
}

function getMockStocks(): StockQuote[] {
  return [
    { symbol: "VCB", name: "Vietcombank", price: 88500, change: 300, changePct: 0.34, volume: 4200000, high: 89000, low: 88000, open: 88200, marketCap: 318000000000000, sector: "Ngân hàng", exchange: "HOSE" },
    { symbol: "FPT", name: "FPT Corp", price: 142000, change: 4500, changePct: 3.27, volume: 2800000, high: 143000, low: 137500, open: 137500, marketCap: 88000000000000, sector: "Công nghệ", exchange: "HOSE" },
    { symbol: "HPG", name: "Hòa Phát", price: 28900, change: 600, changePct: 2.12, volume: 12500000, high: 29100, low: 28300, open: 28300, marketCap: 95000000000000, sector: "Thép", exchange: "HOSE" },
  ];
}

function getMockOHLCV(symbol: string) {
  const base = 50000 + Math.random() * 100000;
  const now = Date.now();
  return Array.from({ length: 90 }, (_, i) => {
    const drift = (Math.random() - 0.48) * 2000;
    const open = base + drift * i;
    const close = open + (Math.random() - 0.48) * 3000;
    return {
      time: now - (89 - i) * 86400000,
      open: Math.round(open),
      high: Math.round(Math.max(open, close) + Math.random() * 2000),
      low: Math.round(Math.min(open, close) - Math.random() * 2000),
      close: Math.round(close),
      volume: Math.floor(500000 + Math.random() * 5000000),
    };
  });
}
