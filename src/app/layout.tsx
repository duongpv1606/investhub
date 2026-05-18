import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "InvestHub — Phân tích chứng khoán, vàng và crypto", template: "%s | InvestHub" },
  description: "Nền tảng phân tích tài chính — dữ liệu realtime chứng khoán Việt Nam, giá vàng SJC, Bitcoin, Ethereum. Biểu đồ TradingView, tin tức, tín hiệu giao dịch.",
  keywords: ["chứng khoán việt nam", "giá vàng hôm nay", "bitcoin", "vnindex", "crypto"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    title: "InvestHub — Phân tích tài chính chuyên nghiệp",
    description: "Dữ liệu realtime chứng khoán VN, vàng SJC, Bitcoin, Ethereum.",
    siteName: "InvestHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvestHub",
    description: "Phân tích tài chính chuyên nghiệp",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-bg antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
