import type { MetadataRoute } from "next";
import { SITE_URL as siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl, changeFrequency: "weekly", priority: 1 }];
}
