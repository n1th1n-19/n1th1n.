import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getBoard } from "@/lib/github";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The newest update (hand-written or a GitHub release) is the last time the page meaningfully changed.
  const { news } = await getBoard();
  return [{ url: SITE_URL, lastModified: news[0]?.date, changeFrequency: "weekly", priority: 1 }];
}
