import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="mx-auto max-w-screen-2xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-bold text-white">Market<span className="text-primary">Hub</span></span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Nền tảng phân tích tài chính chuyên nghiệp — chứng khoán, vàng và tiền điện tử.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Thị trường</h4>
            <ul className="space-y-2">
              {[["Chứng khoán VN", "/stocks"], ["Giá vàng", "/gold"], ["Crypto", "/crypto"]].map(([l,h]) => (
                <li key={h}><Link href={h} className="text-xs text-muted hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Công cụ</h4>
            <ul className="space-y-2">
              {[["Tin tức", "/news"], ["Tín hiệu giao dịch", "#"], ["So sánh cổ phiếu", "#"]].map(([l,h]) => (
                <li key={l}><Link href={h} className="text-xs text-muted hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Liên hệ</h4>
            <ul className="space-y-2">
              {[["Telegram", "https://t.me/markethub_vn"], ["Facebook", "#"], ["Email", "mailto:hello@markethub.vn"]].map(([l,h]) => (
                <li key={l}><a href={h} className="text-xs text-muted hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">© 2025 MarketHub. Không phải tư vấn tài chính.</p>
          <p className="text-xs text-muted">Dữ liệu có độ trễ 15 phút. Giao dịch có rủi ro.</p>
        </div>
      </div>
    </footer>
  );
}
