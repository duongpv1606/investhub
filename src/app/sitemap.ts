import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://investhub.io";
  
  const staticPages = ["/", "/stocks", "/crypto", "/portfolio", "/watchlist", "/ai", "/news", "/pricing", "/login", "/register"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "/" ? 1 : 0.8,
  }));

  return staticPages;
}
