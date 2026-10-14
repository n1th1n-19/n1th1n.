import { cacheLife } from "next/cache";
import { projects } from "./projects";
import fallbackActivity from "./activity-fallback.json";

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

// Never throws: any network error, 404 or rate limit just means "use the fallback".
async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, { headers });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

type Commit = { commit: { committer: { date: string } } };

export async function getBoard() {
  "use cache";
  cacheLife("hours");

  const checkedAt = new Date().toISOString();
  const since = new Date(Date.now() - 371 * 864e5).toISOString();

  const rows = await Promise.all(
    projects.map(async (p) => {
      const [repo, release, commits] = p.public
        ? await Promise.all([
            gh<{ pushed_at: string; stargazers_count: number }>(`/repos/${p.repo}`),
            gh<{ tag_name: string }>(`/repos/${p.repo}/releases/latest`),
            gh<Commit[]>(`/repos/${p.repo}/commits?since=${since}&per_page=100`),
          ])
        : [null, null, null];

      // Per day, keep the larger of the baked local count and the live count.
      // Covers private repos and the API's 100-commit page cap.
      const days: Record<string, number> = {
        ...(fallbackActivity as Record<string, Record<string, number>>)[p.slug],
      };
      const live: Record<string, number> = {};
      for (const c of commits ?? []) {
        const d = c.commit.committer.date.slice(0, 10);
        live[d] = (live[d] ?? 0) + 1;
      }
      for (const [d, n] of Object.entries(live)) days[d] = Math.max(days[d] ?? 0, n);

      return {
        ...p,
        pushedAt: repo?.pushed_at ?? p.fallback.pushedAt,
        stars: repo?.stargazers_count ?? p.fallback.stars,
        version: release?.tag_name ?? p.fallback.version,
        days,
      };
    }),
  );

  return { rows, checkedAt };
}

export type Row = Awaited<ReturnType<typeof getBoard>>["rows"][number];
