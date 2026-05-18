import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://investhub.vn";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/stocks`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/gold`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/crypto`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/news`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
  ];
}
