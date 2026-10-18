# n1th1n

**Live:** https://n1th1n.daystack.space

Personal portfolio for [n1th1n-19](https://github.com/n1th1n-19): Android apps, VS Code extensions, a native Linux GitHub client and a couple of CLIs.

The page shows ten projects (Tag Team, Daybloom, Forqen, Stillread, Onion Lens, DARKMARK, ONION, RTMON, HELM, Forge) with their current status, plus a GitHub contribution graph. Stars, last push and latest release come from the GitHub API and refresh hourly.

## Stack

- Next.js 16 (App Router, Cache Components), React 19, TypeScript, Bun
- Plain CSS, no UI library. Colors follow Apple's dark system palette; filter chips and tonal buttons follow Material 3
- Fonts: Google Sans Flex (headings), Google Sans Code (labels), system font for body text
- Motion: CSS keyframes and scroll-driven animations, turned off under `prefers-reduced-motion`

## Run locally

```bash
bun install
bun run dev
```

Open http://localhost:3000.

```bash
bun run lint    # ESLint
bun run build   # production build
```

## Environment variables

| Variable | Needed | What it does |
|---|---|---|
| `GITHUB_TOKEN` | Recommended | Raises the GitHub API limit from 60 to 5,000 requests an hour, and enables the full contribution graph. Without it the graph shows commits to the listed projects only. A read-only fine-grained token from your own account is enough. |
| `SITE_URL` | Optional | Overrides the public URL used for canonical links, the sitemap and Open Graph tags. Defaults to `https://n1th1n.daystack.space`. |

For local development, put the token in `.env.local` (ignored by git):

```bash
echo "GITHUB_TOKEN=$(gh auth token)" > .env.local
```

## What updates itself

Data is fetched from GitHub on the server and refreshed every hour, without a redeploy.

| What | Source |
|---|---|
| **Status** | A repo topic wins: `status-shipped`, `status-prerelease`, `status-rc`, `status-building` or `status-paused` (set it in the repo's About settings). Otherwise: archived = Paused; no push in 60 days = Shipped if it reached 1.0, else Paused; latest release is a pre-release = Pre-release; any release = Shipped. If GitHub can't tell (no releases yet), `status` in `lib/projects.ts` is used. |
| **Version, stars, last push** | Latest GitHub release and repo data |
| **News** | Every GitHub release (newest per project per day, last 12 months) becomes a News item and RSS entry, summarised from the release notes. Hand-written entries in `lib/updates.ts` are merged in and replace the automatic one for the same release. |
| **Now list** | Every project that isn't shipped. Note: the hand-written `now`, else the latest commit subject (public repos), else "On hold since <month>" when paused. |
| **New projects** | Any repo with the topic `portfolio` that isn't in `lib/projects.ts` is added automatically. Put a 256px icon at `.github/portfolio-icon.png` in that repo, otherwise the owner avatar is used. |
| **Hero pill** | The most recently pushed project that is still in progress (`spotlight()` in `lib/projects.ts`). |

Private repos are read only with `GITHUB_TOKEN`, and their commit messages and release notes are never published.

## Editing content

- **Projects:** [`lib/projects.ts`](lib/projects.ts) sets display order, icon, tagline, notes and links. The first entries with `featured` get the large cards.
- **Icons:** [`public/icons/`](public/icons/) contains one 256px PNG per curated project.
- **News:** [`lib/updates.ts`](lib/updates.ts) holds hand-written milestones and launches, newest first.
- **Name, email, links:** [`lib/site.ts`](lib/site.ts).
- **Offline activity data:** [`lib/activity-fallback.json`](lib/activity-fallback.json) holds daily commit counts from the local repos, used when GitHub data is missing.

## Project layout

```
app/
  page.tsx               the whole page (server component)
  layout.tsx             fonts, metadata, viewport
  globals.css            all styles
  opengraph-image.tsx    share image
  feed.xml/route.ts      RSS feed of lib/updates.ts
  sitemap.ts, robots.ts, icon.svg
components/
  Nav.tsx                glass navbar (desktop) and tab bar (mobile)
  Work.tsx               project cards and filter chips
  News.tsx               updates timeline
  Heatmap.tsx            contribution graph
  CountUp.tsx, CopyEmail.tsx, RelativeTime.tsx, AppIcon.tsx, icons.tsx
lib/
  github.ts              cached GitHub API calls, never throws
  projects.ts, site.ts, activity.ts
```

## Deploy

Built for Vercel. Import the repo, set `GITHUB_TOKEN` in the project's environment variables, and deploy. The home page is prerendered and revalidated every hour.
