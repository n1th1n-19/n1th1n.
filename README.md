# n1th1n

**Live:** https://n1th1n.daystack.space

Personal portfolio for [n1th1n-19](https://github.com/n1th1n-19): Android apps, VS Code extensions, a native Linux GitHub client and a couple of CLIs.

The page shows eight projects (Daybloom, Forqen, Onion Lens, DARKMARK, ONION, RTMON, HELM, Forge) with their current status, plus a GitHub contribution graph. Stars, last push and latest release come from the GitHub API and refresh hourly.

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

## Editing content

- **Projects:** [`lib/projects.ts`](lib/projects.ts) holds name, tagline, status, notes and links for every project. Change a project's `status` there when it ships or pauses. `fallback` values are used when GitHub can't be reached.
- **Icons:** [`public/icons/`](public/icons/) contains one 256px PNG per project.
- **News:** [`lib/updates.ts`](lib/updates.ts) holds the updates timeline, newest first. Add an entry at the top and push; the page and the RSS feed at `/feed.xml` both use it.
- **Hero spotlight:** `spotlight()` at the bottom of `lib/projects.ts` picks the project shown in the "Now building" pill.
- **Name, email, links:** [`lib/site.ts`](lib/site.ts).
- **Offline activity data:** [`lib/activity-fallback.json`](lib/activity-fallback.json) holds daily commit counts from the local repos, used when GitHub data is missing (for example, the private Daybloom repo).

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
