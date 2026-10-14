import { updates } from "@/lib/updates";
import { NAME, SITE_URL } from "@/lib/site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const date = (d: string) => new Date(`${d}T00:00:00Z`).toUTCString();

// RSS 2.0 feed of lib/updates.ts, so people can follow along in a feed reader.
export function GET() {
  const items = updates
    .map(
      (u) => `    <item>
      <title>${esc(u.title)}</title>
      <link>${esc(u.href?.startsWith("http") ? u.href : `${SITE_URL}/#news`)}</link>
      <guid isPermaLink="false">${u.date}-${u.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</guid>
      <pubDate>${date(u.date)}</pubDate>
      <category>${u.kind}</category>
      <description>${esc(u.body)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${NAME} · Updates</title>
    <link>${SITE_URL}/#news</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Releases, milestones and status changes across ${NAME}'s projects.</description>
    <language>en</language>
    <lastBuildDate>${date(updates[0].date)}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
