import { projects } from "./projects";

export const HANDLE = "n1th1n-19";
export const NAME = "n1th1n";
export const EMAIL = "batman@daystack.space";
export const GITHUB = `https://github.com/${HANDLE}`;
export const TITLE = "n1th1n · Tools for Android, VS Code and Linux";
export const DESCRIPTION =
  `Android apps, VS Code extensions, a native Linux GitHub client, Claude Code tools and a couple of CLIs, built by n1th1n. ${projects.length} projects, built in the open.`;

// Canonical URL for links, sitemap and Open Graph tags. SITE_URL overrides it (e.g. for a staging domain).
export const SITE_URL = process.env.SITE_URL ?? "https://n1th1n.daystack.space";
