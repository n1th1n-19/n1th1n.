// News and updates, newest first. Add an entry at the top and push; the page and /feed.xml pick it up.
// `project` is a slug from lib/projects.ts and shows that project's icon.
// `cta` overrides the link label ("Release notes" / "Read more").
import { EMAIL } from "./site";

export type Kind = "release" | "milestone" | "status" | "launch";

export type Update = {
  date: string; // YYYY-MM-DD
  kind: Kind;
  project?: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
};

export const kindLabel: Record<Kind, string> = {
  release: "Release",
  milestone: "Milestone",
  status: "Status",
  launch: "Launch",
};

const gh = (path: string) => `https://github.com/${path}`;
const mail = (subject: string, body: string) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const updates: Update[] = [
  {
    date: "2026-10-15",
    kind: "milestone",
    project: "daybloom",
    title: "Daybloom is in closed testing",
    body: "Daybloom is now in closed testing on Google Play. If you'd like to try it before launch, email me and I'll add you to the testers.",
    href: mail(
      "Daybloom closed testing",
      "Hi n1th1n,\n\nI'd like to join the Daybloom closed test.\n\nGoogle account email (for the Play Store tester list): \nAndroid device: \n\nThanks!",
    ),
    cta: "Join the testing",
  },
  {
    date: "2026-10-14",
    kind: "launch",
    title: "This site is live",
    body: "A home for everything I'm building, designed in Figma with Apple's and Google's design systems and built with Next.js. Project status and activity come straight from GitHub.",
    href: gh("n1th1n-19/n1th1n."),
  },
  {
    date: "2026-10-14",
    kind: "milestone",
    project: "daybloom",
    title: "Daybloom is a release candidate",
    body: "All 13 build phases are done and the app has its final package name. Play Store submission is next.",
  },
  {
    date: "2026-10-03",
    kind: "release",
    project: "onion-lens",
    title: "Onion Lens 1.0.1",
    body: "Separate builds for Chrome, Firefox and Safari, attached to every release automatically.",
    href: gh("n1th1n-19/Onion-Lens/releases/tag/v1.0.1"),
  },
  {
    date: "2026-10-03",
    kind: "release",
    project: "darkmark",
    title: "DARKMARK 2.0",
    body: "Second major version. The dark preview now renders images, video, math and Mermaid diagrams.",
    href: gh("n1th1n-19/DARKMARK/releases/tag/v2.0.0"),
  },
  {
    date: "2026-10-02",
    kind: "release",
    project: "onion",
    title: "ONION 0.1, the first release",
    body: "Five palettes with night and day variants, onion-bulb file icons, product icons and automatic day/night switching.",
    href: gh("n1th1n-19/ONION/releases/tag/v0.1.0"),
  },
  {
    date: "2026-09-19",
    kind: "status",
    project: "forqen",
    title: "Forqen is taking shape",
    body: "45 commits since August: local git and github.com in one native Linux app, a Rust workspace and snap packaging. Still pre-release.",
    href: gh("Daystack/Forqen"),
  },
  {
    date: "2026-06-24",
    kind: "release",
    project: "forge",
    title: "Forge 0.2",
    body: "Adds mobile, database and build tool categories to the setup checklist. Parked for now.",
    href: gh("n1th1n-19/Forge/releases/tag/v0.2.0"),
  },
  {
    date: "2026-06-03",
    kind: "release",
    project: "helm",
    title: "HELM 0.4.8",
    body: "Five releases in two days, from 0.4.4 to 0.4.8, while the Android side display and Rust agent came together. Parked for now.",
    href: gh("n1th1n-19/HELM/releases/tag/v0.4.8"),
  },
  {
    date: "2025-10-12",
    kind: "release",
    project: "rtmon",
    title: "RTMON 1.0",
    body: "First stable release of the retro LED system widget for Android: CPU, RAM, battery and network on the home screen.",
    href: gh("n1th1n-19/RTMON/releases/tag/v1.0.0"),
  },
];

export const formatDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
