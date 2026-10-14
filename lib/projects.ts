// The one file to edit when a project changes.
// Live GitHub data (stars, last push, latest release) overrides `fallback` when the API answers.

export type Status = "building" | "rc" | "shipped" | "paused";

export type Project = {
  slug: string;
  name: string;
  repo: string;
  public: boolean;
  tagline: string;
  note: string;
  language: keyof typeof languageColors;
  platform: string;
  status: Status;
  icon: string;
  featured?: { stack: string };
  now?: string;
  links: { label: string; href: string }[];
  fallback: { version: string; pushedAt: string; stars: number };
};

export const statusLabel: Record<Status, string> = {
  building: "In development",
  rc: "Release candidate",
  shipped: "Shipped",
  paused: "Paused",
};

// GitHub linguist colors, so the dots match what GitHub shows.
export const languageColors = {
  Dart: "#00B4AB",
  Rust: "#dea584",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Kotlin: "#A97BFF",
};

const gh = (repo: string) => `https://github.com/${repo}`;

export const projects: Project[] = [
  {
    slug: "daybloom",
    name: "Daybloom",
    repo: "n1th1n-19/Daybloom",
    public: false,
    tagline: "A countdown app where every event grows into a flower.",
    note: "All 13 build phases done. Every flower is painted live with CustomPainter from Figma specs. Heading to the Play Store.",
    language: "Dart",
    platform: "Android",
    status: "rc",
    icon: "/icons/daybloom.png",
    featured: { stack: "Flutter, CustomPainter" },
    now: "Play Store submission is next",
    links: [{ label: "Privacy policy", href: "https://n1th1n-19.github.io/daybloom-privacy" }],
    fallback: { version: "v1.0.0", pushedAt: "2026-10-13T21:42:22Z", stars: 0 },
  },
  {
    slug: "forqen",
    name: "Forqen",
    repo: "Daystack/Forqen",
    public: true,
    tagline: "A native GitHub client for Linux. No bundled browser.",
    note: "Local git and github.com in one native app, built to replace GitHub Desktop on Linux. Rust workspace, Meson, snap.",
    language: "Rust",
    platform: "Linux",
    status: "building",
    icon: "/icons/forqen.png",
    featured: { stack: "Rust, Meson, snap" },
    now: "Pre-release. Issue tracker and PR review in progress",
    links: [{ label: "Repository", href: gh("Daystack/Forqen") }],
    fallback: { version: "v0.1.0", pushedAt: "2026-09-19T05:40:26Z", stars: 0 },
  },
  {
    slug: "onion-lens",
    name: "Onion Lens",
    repo: "n1th1n-19/Onion-Lens",
    public: true,
    tagline: "Color picker and screenshot tool for every browser.",
    note: "Eyedropper, 10 color formats, palettes and WCAG contrast checks, plus full-page, area and element capture. MV3, zero dependencies.",
    language: "JavaScript",
    platform: "Chrome, Firefox, Safari",
    status: "shipped",
    icon: "/icons/onionlens.png",
    links: [{ label: "Repository", href: gh("n1th1n-19/Onion-Lens") }],
    fallback: { version: "v1.0.1", pushedAt: "2026-10-02T23:43:19Z", stars: 0 },
  },
  {
    slug: "darkmark",
    name: "DARKMARK",
    repo: "n1th1n-19/DARKMARK",
    public: true,
    tagline: "Markdown in VS Code, rendered dark.",
    note: "Opens .md files as a dark rendered preview with images, video, math and Mermaid diagrams.",
    language: "TypeScript",
    platform: "VS Code",
    status: "shipped",
    icon: "/icons/darkmark.png",
    links: [{ label: "Repository", href: gh("n1th1n-19/DARKMARK") }],
    fallback: { version: "v2.0.0", pushedAt: "2026-10-03T00:23:50Z", stars: 0 },
  },
  {
    slug: "onion",
    name: "ONION",
    repo: "n1th1n-19/ONION",
    public: true,
    tagline: "Night and day themes tuned for JS, TS and Python.",
    note: "Five palettes with night and day variants, onion-bulb file icons, product icons and automatic day/night switching.",
    language: "JavaScript",
    platform: "VS Code",
    status: "shipped",
    icon: "/icons/onion.png",
    links: [{ label: "Repository", href: gh("n1th1n-19/ONION") }],
    fallback: { version: "v0.1.0", pushedAt: "2026-10-01T20:03:28Z", stars: 0 },
  },
  {
    slug: "rtmon",
    name: "RTMON",
    repo: "n1th1n-19/RTMON",
    public: true,
    tagline: "Live system stats as a retro LED widget.",
    note: "CPU, RAM, battery and network on your home screen in a dot-matrix style, refreshed every 3 seconds without eating battery.",
    language: "Kotlin",
    platform: "Android",
    status: "shipped",
    icon: "/icons/rtmon.png",
    links: [{ label: "Repository", href: gh("n1th1n-19/RTMON") }],
    fallback: { version: "v1.0.0", pushedAt: "2026-07-13T08:30:34Z", stars: 12 },
  },
  {
    slug: "helm",
    name: "HELM",
    repo: "n1th1n-19/HELM",
    public: true,
    tagline: "Your phone becomes a side display for your desk.",
    note: "Kotlin app plus a Rust desktop agent: system monitor, git info, music controls and dev environment status.",
    language: "Kotlin",
    platform: "Android + desktop",
    status: "paused",
    icon: "/icons/helm.png",
    now: "Parked after 133 commits in two days",
    links: [{ label: "Repository", href: gh("n1th1n-19/HELM") }],
    fallback: { version: "v0.4.8", pushedAt: "2026-06-03T16:15:45Z", stars: 0 },
  },
  {
    slug: "forge",
    name: "Forge",
    repo: "n1th1n-19/Forge",
    public: true,
    tagline: "Sets up a dev machine from one checklist.",
    note: "Detects your OS and distro, then installs only what you tick, from official sources.",
    language: "Rust",
    platform: "CLI",
    status: "paused",
    icon: "/icons/forge.png",
    now: "Parked after v0.2.0 added more tool categories",
    links: [{ label: "Repository", href: gh("n1th1n-19/Forge") }],
    fallback: { version: "v0.2.0", pushedAt: "2026-06-23T19:34:19Z", stars: 0 },
  },
];

type Live = Pick<Project, "status" | "name"> & { pushedAt: string };

// Which project the hero's "Now building" pill features.
export function spotlight<T extends Live>(rows: T[]): T {
  // TODO(n1th1n-19): your call. Default: the most recently pushed project that is
  // still in motion. Alternatives: always pin one slug, or prefer release candidates.
  const moving = rows.filter((r) => r.status === "building" || r.status === "rc");
  return [...(moving.length ? moving : rows)].sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))[0];
}
