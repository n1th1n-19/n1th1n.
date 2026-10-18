import { cacheLife } from "next/cache";
import { languageColors, projects, type Project, type Status } from "./projects";
import { updates as manualUpdates, type Update } from "./updates";
import fallbackActivity from "./activity-fallback.json";
import { HANDLE } from "./site";

const TOKEN = process.env.GITHUB_TOKEN;
const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};
const DAY = 864e5;

// Never throws: any network error, 404 or rate limit just means "use the fallback".
async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, { headers });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

type Repo = {
  name: string;
  full_name: string;
  private: boolean;
  archived: boolean;
  pushed_at: string;
  stargazers_count: number;
  description: string | null;
  language: string | null;
  homepage: string | null;
  topics?: string[];
};
type Release = { tag_name: string; body: string | null; prerelease: boolean; draft: boolean; published_at: string; html_url: string };
type Commit = { commit: { message: string; committer: { date: string } } };

// ---------- Status ----------

const STATUS_TOPIC = /^status-(building|prerelease|rc|shipped|paused)$/;

// A `status-*` topic on the repo always wins. Otherwise: archived means paused; quiet for 60 days
// means shipped once it reached 1.0, paused before that; a pre-release tag means pre-release;
// any stable release means shipped. Returns undefined when GitHub gives no signal (no releases yet).
function deriveStatus(repo: Repo, releases: Release[], now: number): Status | undefined {
  const topic = repo.topics?.map((t) => STATUS_TOPIC.exec(t)?.[1]).find(Boolean);
  if (topic) return topic as Status;
  if (repo.archived) return "paused";
  const stable = releases.find((r) => !r.prerelease);
  const major = stable ? parseInt(stable.tag_name.replace(/^v/i, ""), 10) || 0 : 0;
  if (now - Date.parse(repo.pushed_at) > 60 * DAY) return stable && major >= 1 ? "shipped" : "paused";
  if (releases[0]?.prerelease) return "prerelease";
  if (stable) return "shipped";
  return undefined;
}

// ---------- Text from GitHub ----------

// Latest meaningful commit subject, without the conventional-commit prefix or PR number.
function lastChange(commits: Commit[]): string | undefined {
  for (const c of commits) {
    const line = c.commit.message.split("\n")[0].trim();
    if (/^(merge|bump|release|chore\(release\))/i.test(line)) continue;
    const s = line.replace(/^[a-z]+(\([^)]*\))?!?:\s*/i, "").replace(/\s*\(#\d+\)$/, "");
    if (s) return s[0].toUpperCase() + s.slice(1);
  }
}

// Plain-text summary of release notes: drops headings, changelog links, "Release vX" lines and
// "by @user in <url>" credits, keeps the first few lines.
function summarize(md: string | null): string | undefined {
  if (!md) return undefined;
  const lines = md
    .split("\n")
    .map((l) =>
      l
        .replace(/^\s*[-*+]\s+/, "")
        .replace(/\s+by @\S+ in https?:\/\/\S+/g, "")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*_`]/g, "")
        .trim(),
    )
    .filter((l) => l && !/^(#|---|full changelog|release v?\d|what's changed)/i.test(l) && !/^https?:\/\//.test(l));
  let out = "";
  for (const l of lines.slice(0, 3)) {
    const next = out ? `${out}; ${l.replace(/[.;:]$/, "")}` : l.replace(/[.;:]$/, "");
    if (next.length > 220) break;
    out = next;
  }
  return out ? `${out}.` : undefined;
}

// ---------- Discovery ----------

const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Repos tagged with the `portfolio` topic that aren't curated in projects.ts.
async function discover(): Promise<Project[]> {
  const q = encodeURIComponent(`topic:portfolio user:${HANDLE} org:Daystack`);
  const found = await gh<{ items: Repo[] }>(`/search/repositories?q=${q}&per_page=50`);
  const known = new Set(projects.map((p) => p.repo.toLowerCase()));
  const fresh = (found?.items ?? []).filter((r) => !known.has(r.full_name.toLowerCase()));
  return Promise.all(
    fresh.map(async (r) => {
      // Icon convention: .github/portfolio-icon.png in the repo, otherwise the owner's avatar.
      const custom = `https://raw.githubusercontent.com/${r.full_name}/HEAD/.github/portfolio-icon.png`;
      const hasIcon = !r.private && (await fetch(custom, { method: "HEAD" }).then((x) => x.ok).catch(() => false));
      return {
        slug: toSlug(r.name),
        name: r.name.replace(/[-_]+/g, " "),
        repo: r.full_name,
        public: !r.private,
        tagline: r.description ?? "",
        note: r.description ?? "",
        language: r.language ?? "Other",
        platform: r.topics?.includes("android") ? "Android" : r.topics?.includes("cli") ? "CLI" : "Software",
        status: "building" as Status,
        icon: hasIcon ? custom : `https://github.com/${r.full_name.split("/")[0]}.png?size=256`,
        links: [{ label: "Repository", href: `https://github.com/${r.full_name}` }, ...(r.homepage ? [{ label: "Website", href: r.homepage }] : [])],
        fallback: { version: "", pushedAt: r.pushed_at, stars: r.stargazers_count },
      };
    }),
  );
}

// ---------- Contribution calendar ----------

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 } as const;
type Day = { date: string; contributionCount: number; contributionLevel: keyof typeof LEVEL };

// The whole GitHub contribution graph (every repo, private ones included when the profile shows them).
// GraphQL always needs a token, so without GITHUB_TOKEN this returns null and the page uses project commits.
async function calendar() {
  if (!TOKEN) return null;
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
          totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`,
        variables: { login: HANDLE },
      }),
    });
    const json = await res.json();
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!res.ok || !cal) return null;
    const days: Record<string, number> = {};
    const levels: Record<string, number> = {};
    for (const w of cal.weeks)
      for (const d of w.contributionDays as Day[]) {
        days[d.date] = d.contributionCount;
        levels[d.date] = LEVEL[d.contributionLevel] ?? 0;
      }
    return { days, levels, total: cal.totalContributions as number };
  } catch {
    return null;
  }
}

// ---------- Board ----------

export async function getBoard() {
  "use cache";
  cacheLife("hours");

  const now = Date.now();
  const checkedAt = new Date(now).toISOString();
  const since = new Date(now - 371 * DAY).toISOString();
  const pending = calendar(); // runs alongside the per-project requests
  const all = [...projects, ...(await discover())];

  const rows = await Promise.all(
    all.map(async (p) => {
      // Private repos are only readable with a token.
      const readable = p.public || Boolean(TOKEN);
      const [repo, releases, commits] = readable
        ? await Promise.all([
            gh<Repo>(`/repos/${p.repo}`),
            gh<Release[]>(`/repos/${p.repo}/releases?per_page=20`),
            gh<Commit[]>(`/repos/${p.repo}/commits?since=${since}&per_page=100`),
          ])
        : [null, null, null];
      const published = (releases ?? []).filter((r) => !r.draft);

      // Per day, keep the larger of the baked local count and the live count.
      // Covers private repos and the API's 100-commit page cap.
      const days: Record<string, number> = { ...(fallbackActivity as Record<string, Record<string, number>>)[p.slug] };
      const live: Record<string, number> = {};
      for (const c of commits ?? []) {
        const d = c.commit.committer.date.slice(0, 10);
        live[d] = (live[d] ?? 0) + 1;
      }
      for (const [d, n] of Object.entries(live)) days[d] = Math.max(days[d] ?? 0, n);

      const status = (repo && deriveStatus(repo, published, now)) ?? p.status;
      // Commit subjects and release notes are only published for public repos.
      const auto = p.public ? lastChange(commits ?? []) : undefined;
      const pushedAt = repo?.pushed_at ?? p.fallback.pushedAt;
      const lastMonth = new Date(pushedAt).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
      const note = p.now ?? (status === "paused" ? `On hold since ${lastMonth}` : (auto ?? "In active development"));

      return {
        ...p,
        status,
        now: note,
        langColor: languageColors[p.language as keyof typeof languageColors] ?? "#8e8e93",
        pushedAt,
        stars: repo?.stargazers_count ?? p.fallback.stars,
        version: published[0]?.tag_name ?? p.fallback.version,
        releases: p.public ? published : [],
        days,
      };
    }),
  );

  return { rows, checkedAt, news: mergeNews(rows, now), contributions: await pending };
}

export type Row = Awaited<ReturnType<typeof getBoard>>["rows"][number];

// Hand-written updates plus one automatic entry per GitHub release (newest per project per day,
// last 12 months). A hand-written entry for the same release replaces the automatic one.
function mergeNews(rows: { slug: string; name: string; releases: Release[] }[], now: number): Update[] {
  const auto: Update[] = [];
  for (const r of rows) {
    const seen = new Set<string>();
    for (const rel of r.releases) {
      const date = rel.published_at.slice(0, 10);
      if (now - Date.parse(rel.published_at) > 365 * DAY || seen.has(date)) continue;
      seen.add(date);
      const tag = rel.tag_name;
      if (manualUpdates.some((u) => u.project === r.slug && u.href?.endsWith(`/releases/tag/${tag}`))) continue;
      auto.push({
        date,
        kind: "release",
        project: r.slug,
        title: `${r.name} ${tag.replace(/^v/i, "")}${rel.prerelease ? " (pre-release)" : ""}`,
        body: summarize(rel.body) ?? `A new ${rel.prerelease ? "pre-release" : "release"} of ${r.name}.`,
        href: rel.html_url,
      });
    }
  }
  // Newest first; on the same day hand-written entries come before automatic ones.
  return [...manualUpdates, ...auto].sort((a, b) => b.date.localeCompare(a.date));
}
