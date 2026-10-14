import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { updates } from "@/lib/updates";

export default function sitemap(): MetadataRoute.Sitemap {
  // The newest update is the last time the page meaningfully changed.
  return [{ url: SITE_URL, lastModified: updates[0].date, changeFrequency: "weekly", priority: 1 }];
}
