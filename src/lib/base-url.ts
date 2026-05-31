import { headers } from "next/headers";

/**
 * Suy ra base URL tuyệt đối cho các lời gọi fetch nội bộ ở server component.
 *
 * Thứ tự ưu tiên:
 *  1. NEXT_PUBLIC_APP_URL (nếu cấu hình domain thật, không phải localhost)
 *  2. Header của request (x-forwarded-host/proto) — đúng trên Vercel, preview, custom domain
 *  3. VERCEL_URL (env Vercel tự set)
 *  4. localhost:3000 (chạy dev)
 *
 * Đây là lý do trước đây trên Vercel dữ liệu bị rơi về mock: baseUrl mặc định
 * "http://localhost:3000" không tồn tại trong serverless nên fetch nội bộ thất bại.
 */
export async function getBaseUrl(): Promise<string> {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit && !explicit.includes("localhost")) {
    return explicit.replace(/\/$/, "");
  }

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    /* headers() không khả dụng — bỏ qua */
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
